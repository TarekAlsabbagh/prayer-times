// scripts/geodata/_strategy_a_filter.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-LEVANT-IRAQ-1 — Strategy A filter pass
//
// Reads each country's candidates JSON, applies Strategy A:
//   feature_code ∈ {PPLC, PPLA, PPLA2}
//   AND population > 0
//   AND status === 'pending'
//   AND tier === 'high'
//
// Cross-checks for slug collisions:
//   • Within the new Strategy A set (would two candidate countries
//     pick the same slug?)
//   • Against existing curated-places.json (would the merge collide
//     with an already-merged slug?)
//
// Writes reports/geodata-levant-iraq-strategy-a-review.md
//
// Does NOT modify candidates JSON. Does NOT touch curated-places.json.
// Stage 4 stays unrun.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CCS = ['sy','iq','jo','lb','ps'];
const CURATED_PATH = path.resolve('db', 'places', 'curated-places.json');
const REPORT_PATH  = path.resolve('reports', 'geodata-levant-iraq-strategy-a-review.md');

const STRATEGY_A_FC = new Set(['PPLC','PPLA','PPLA2']);

function loadCandidates(cc) {
    const p = path.resolve('db', 'places', 'candidates', cc + '-geonames-candidates.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function applyStrategyA(candidates) {
    return candidates.filter(e =>
        e.status === 'pending' &&
        e.tier === 'high' &&
        STRATEGY_A_FC.has(e.candidate.featureCode) &&
        (Number(e.candidate.population) || 0) > 0
    );
}

function main() {
    const curated = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8'));
    const existingSlugs = new Set(curated.map(x => x.slug));

    const perCountry = {};
    const allNewSlugs = [];   // {slug, cc}

    for (const cc of CCS) {
        const cands = loadCandidates(cc);
        const filtered = applyStrategyA(cands);
        // Sort by population desc, then qScore desc
        filtered.sort((a, b) => {
            const popA = a.candidate.population || 0;
            const popB = b.candidate.population || 0;
            if (popB !== popA) return popB - popA;
            return b.qualityScore - a.qualityScore;
        });
        perCountry[cc] = filtered;
        for (const e of filtered) {
            allNewSlugs.push({ slug: e.candidate.slug, cc });
        }
    }

    // Collision detection
    const slugBucket = {};
    for (const r of allNewSlugs) {
        if (!slugBucket[r.slug]) slugBucket[r.slug] = [];
        slugBucket[r.slug].push(r.cc);
    }
    const crossCollisions = Object.entries(slugBucket).filter(([_, ccs]) => ccs.length > 1);
    const curatedCollisions = allNewSlugs.filter(r => existingSlugs.has(r.slug));

    // Build report
    const lines = [];
    lines.push('# Levant + Iraq — Strategy A Review (PPLC/PPLA/PPLA2 + pop > 0)');
    lines.push('');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Phase**: `CURATED-GEODATA-LEVANT-IRAQ-1` — Strategy A filter pass');
    lines.push('**Filter**: feature_code ∈ {PPLC, PPLA, PPLA2} AND population > 0 AND tier=high');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Country | Strategy A matches | Existing curated | Net new |');
    lines.push('| ---     | ---:               | ---:             | ---:    |');
    let totalA = 0, totalNet = 0;
    for (const cc of CCS) {
        const n = perCountry[cc].length;
        const existingCC = curated.filter(x => x.countryCode === cc).length;
        totalA += n;
        totalNet += n;
        lines.push('| ' + cc.toUpperCase() + ' | ' + n + ' | ' + existingCC + ' | ' + n + ' |');
    }
    lines.push('| **TOTAL** | **' + totalA + '** | — | **' + totalNet + '** |');
    lines.push('');
    lines.push('## Collision check');
    lines.push('');
    if (crossCollisions.length === 0) {
        lines.push('✅ **Zero cross-country slug collisions** among Strategy A picks.');
    } else {
        lines.push('⚠️ **Cross-country slug collisions detected** — must be resolved');
        lines.push('before Stage 4 (rename to `city-cc` per the established convention).');
        lines.push('');
        lines.push('| slug | countries |');
        lines.push('| --- | --- |');
        for (const [slug, ccs] of crossCollisions) {
            lines.push('| ' + slug + ' | ' + ccs.map(c => c.toUpperCase()).join(', ') + ' |');
        }
    }
    lines.push('');
    if (curatedCollisions.length === 0) {
        lines.push('✅ **Zero collisions with existing curated entries.**');
    } else {
        lines.push('⚠️ **Collisions with existing curated** detected — these slugs');
        lines.push('would be skipped by Stage 4 unless renamed:');
        lines.push('');
        lines.push('| candidate slug | cc | matched existing |');
        lines.push('| --- | --- | --- |');
        for (const c of curatedCollisions) {
            lines.push('| ' + c.slug + ' | ' + c.cc.toUpperCase() + ' | (existing) |');
        }
    }
    lines.push('');

    // Per-country table
    for (const cc of CCS) {
        const matches = perCountry[cc];
        lines.push('## ' + cc.toUpperCase() + ' — ' + matches.length + ' Strategy A picks');
        lines.push('');
        if (!matches.length) {
            lines.push('_(none)_');
            lines.push('');
            continue;
        }
        lines.push('| slug | name.ar | name.en | fc | pop | priority | region | lat,lng | dist→nearest curated |');
        lines.push('| --- | --- | --- | --- | ---: | ---: | --- | --- | --- |');
        for (const e of matches) {
            const c = e.candidate;
            const region = (c.admin && c.admin.regionAr) || '';
            const ll = c.lat.toFixed(4) + ', ' + c.lng.toFixed(4);
            const dist = e.distanceToNearestKm != null
                ? (e.distanceToNearestKm.toFixed(1) + ' km → ' + (e.nearestCuratedSlug || '-'))
                : '-';
            lines.push('| ' + c.slug
                     + ' | ' + (c.names.ar || '')
                     + ' | ' + (c.names.en || '')
                     + ' | ' + c.featureCode
                     + ' | ' + (c.population || 0).toLocaleString('en-US')
                     + ' | ' + (c.priority || '-')
                     + ' | ' + region
                     + ' | ' + ll
                     + ' | ' + dist + ' |');
        }
        lines.push('');
    }

    lines.push('## Next step');
    lines.push('');
    lines.push('Read the per-country tables above. Decide:');
    lines.push('');
    lines.push('1. **Approve all** — flip `tier="high"` + `featureCode∈{PPLC,PPLA,PPLA2}`');
    lines.push('   + `pop>0` candidates to `"status": "approved"` and run Stage 4.');
    lines.push('2. **Approve some** — list specific slugs (per country) to approve.');
    lines.push('3. **Exclude / rename** — name any slug you want skipped or renamed.');
    lines.push('');
    lines.push('Once your decision is in, Stage 4 will merge approved entries with the');
    lines.push('usual safety guards (dedupe, `isPrayerTimesReady`, metadata strip).');
    lines.push('');
    lines.push('## License + attribution');
    lines.push('');
    lines.push('Place data derived from GeoNames country dumps (SY, IQ, JO, LB, PS),');
    lines.push('CC-BY 4.0. Sources: https://download.geonames.org/export/dump/{cc}.zip');
    lines.push('');

    fs.writeFileSync(REPORT_PATH, lines.join('\n'));
    console.log('Wrote', REPORT_PATH);
    console.log('');
    console.log('Strategy A totals:');
    for (const cc of CCS) {
        console.log('  ' + cc.toUpperCase() + ': ' + perCountry[cc].length);
    }
    console.log('  TOTAL: ' + totalA);
    console.log('Cross-country collisions:', crossCollisions.length);
    console.log('Curated-collisions:', curatedCollisions.length);
}

main();
