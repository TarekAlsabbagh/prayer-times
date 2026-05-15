// scripts/geodata/_strategy_e_europe_1a_reports.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-EUROPE-1A — Strategy E report generator
//
// Inputs:
//   - db/places/candidates/{cc}-geonames-candidates.json   (Stage 3 output,
//                                                          enriched by Stage 3.5)
//   - db/places/candidates/europe-1a-arabic-quality.json   (Stage 3.5 summary)
//   - db/places/curated-places.json
//   - db/places/candidates/{cc}-geonames-raw.json          (for originalName)
//
// Outputs:
//   - reports/geodata-europe-1a-summary.md
//   - reports/geodata-europe-1a-arabic-quality-report.md
//   - reports/{cc}-geodata-import-report.md   (REWRITTEN with the 14
//                                              user-required fields for
//                                              Europe-1A — the previous
//                                              Stage 3 generic report is
//                                              replaced)
//
// Does NOT touch curated_places.json. Does NOT apply anything.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathsFor, loadCountryConfig, BASE_PATHS } from './_geonames_common.mjs';

const WAVE_LABEL = 'CURATED-GEODATA-EUROPE-1A';
const STRATEGY   = 'E';
const CCS        = ['gb','ie','fr','be','nl','lu'];

// Escape markdown table cell values (replace pipe + newline)
function md(v) {
    if (v == null) return '';
    return String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
}

function fixed(n, d) {
    if (n == null || !isFinite(n)) return '';
    return Number(n).toFixed(d);
}

// Load raw GeoNames row by geonameid for originalName recovery
function buildRawIndexes() {
    const rawByCc = {};
    for (const cc of CCS) {
        const p = pathsFor(cc);
        const m = new Map();
        try {
            const raw = JSON.parse(fs.readFileSync(p.rawJson, 'utf8'));
            for (const r of raw) m.set(r.geonameid, r);
        } catch (_) {}
        rawByCc[cc] = m;
    }
    return rawByCc;
}

function flag(condition, label) { return condition ? label : ''; }

// ─── Per-country detailed report (Europe-1A specific) ───
function renderCountryReport(cc, candidates, rawIndex, config, allArQuality) {
    const upper = cc.toUpperCase();
    const lines = [];

    // Per-status / per-tier counters
    const counts = {
        total: candidates.length,
        existing: 0, pending: 0, needs_review: 0, rejected: 0,
        tierHigh: 0, tierMedium: 0, tierLow: 0,
        arHigh: { wikidata: 0, arabic_only: 0, mixed_script: 0, mixed_latin: 0, mixed_unknown: 0, empty: 0 },
        collisionsInWave: 0,
        collisionsAgainstCurated: 0,
        passesGate: 0,
        blockedByGate: 0
    };

    const highTierEntries = [];

    for (const e of candidates) {
        counts[e.status] = (counts[e.status] || 0) + 1;
        if (e.status === 'pending' && e.tier === 'high') counts.tierHigh++;
        if (e.status === 'pending' && e.tier === 'medium') counts.tierMedium++;
        if (e.status === 'pending' && e.tier === 'low') counts.tierLow++;
        if (e.collisionInWave) counts.collisionsInWave++;
        if (e.collisionAgainstCurated) counts.collisionsAgainstCurated++;

        if (e.status === 'pending' && e.tier === 'high') {
            const arQ = e.arQuality || { quality: 'unknown', detail: '' };
            counts.arHigh[arQ.quality] = (counts.arHigh[arQ.quality] || 0) + 1;
            if (e.pendingAfterArGate) counts.passesGate++;
            else counts.blockedByGate++;
            const raw = rawIndex.get(e.candidate.geonameid);
            const originalName = raw ? raw.name : '';
            highTierEntries.push({ e, originalName });
        }
    }
    // Sort by passes-gate first (so user sees ready-to-merge entries first), then by pop desc
    highTierEntries.sort((a, b) => {
        if (a.e.pendingAfterArGate !== b.e.pendingAfterArGate) return a.e.pendingAfterArGate ? -1 : 1;
        return (b.e.candidate.population || 0) - (a.e.candidate.population || 0);
    });

    lines.push('# ' + upper + ' GeoNames Import Report — Europe-1A');
    lines.push('');
    lines.push('**Country**: ' + config.countryEn + ' (' + config.countryAr + ')');
    lines.push('**Wave**: `' + WAVE_LABEL + '`');
    lines.push('**Strategy**: ' + STRATEGY + ' (popMin ' + config.popMin + ' + alwaysInclude ' + (config.alwaysIncludeFeatureCodes||[]).join(',') + ' + ar-quality gate)');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('');

    // Pipeline + Stage 4 status
    lines.push('## Pipeline');
    lines.push('');
    lines.push('| Stage | Output |');
    lines.push('| --- | --- |');
    lines.push('| 1. IMPORT       | `db/places/candidates/' + cc + '-geonames-raw.json` |');
    lines.push('| 2. NORMALIZE    | `db/places/candidates/' + cc + '-geonames-normalized.json` |');
    lines.push('| 3. VALIDATE     | `db/places/candidates/' + cc + '-geonames-candidates.json` |');
    lines.push('| 3.5. AR QA GATE | enriched candidates + `europe-1a-arabic-quality.json` |');
    lines.push('| 4. APPLY        | **NOT RUN — awaiting your review** |');
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push('| Bucket | Count |');
    lines.push('| --- | --- |');
    lines.push('| Normalized candidates total       | ' + counts.total + ' |');
    lines.push('| existing (matched, no action)     | ' + (counts.existing || 0) + ' |');
    lines.push('| **pending — high tier**           | **' + counts.tierHigh + '** |');
    lines.push('| pending — medium tier             | ' + counts.tierMedium + ' |');
    lines.push('| pending — low tier                | ' + counts.tierLow + ' |');
    lines.push('| needs_review                      | ' + (counts.needs_review || 0) + ' |');
    lines.push('| rejected                          | ' + (counts.rejected || 0) + ' |');
    lines.push('| collisions in this wave           | ' + counts.collisionsInWave + ' |');
    lines.push('| collisions against existing curated | ' + counts.collisionsAgainstCurated + ' |');
    lines.push('');
    lines.push('## High-tier Arabic-quality breakdown');
    lines.push('');
    lines.push('| Quality | Count | Disposition |');
    lines.push('| --- | --- | --- |');
    lines.push('| `wikidata` (from ar: tag)     | ' + (counts.arHigh.wikidata || 0)     + ' | ✅ auto-eligible if no collision |');
    lines.push('| `arabic_only` (clean Arabic)  | ' + (counts.arHigh.arabic_only || 0)  + ' | ✅ auto-eligible if no collision |');
    lines.push('| `mixed_script` (Persian/Urdu) | ' + (counts.arHigh.mixed_script || 0) + ' | ⚠️ manual review (need Arabic) |');
    lines.push('| `mixed_latin` (Latin in ar)   | ' + (counts.arHigh.mixed_latin || 0)  + ' | ⚠️ manual review |');
    lines.push('| `mixed_unknown`               | ' + (counts.arHigh.mixed_unknown || 0)+ ' | ⚠️ manual review |');
    lines.push('| `empty` (no Arabic)           | ' + (counts.arHigh.empty || 0)        + ' | 🔴 must supply manually |');
    lines.push('');
    lines.push('**Passes ar-gate (high-tier):** ' + counts.passesGate);
    lines.push('**Blocked by ar-gate (high-tier):** ' + counts.blockedByGate);
    lines.push('');

    // Per-candidate detail table — all 14 user-required fields
    lines.push('## High-tier candidates — full detail (14 fields per row)');
    lines.push('');
    lines.push('Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,');
    lines.push('`feature_code`, `population`, `admin region`, `lat`, `lng`,');
    lines.push('`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.');
    lines.push('');
    lines.push('Sort order: passes-gate first, then by population desc.');
    lines.push('');
    if (!highTierEntries.length) {
        lines.push('_(empty — no high-tier candidates)_');
        lines.push('');
    } else {
        lines.push('| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |');
        lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const { e, originalName } of highTierEntries) {
            const c = e.candidate;
            const mark = e.pendingAfterArGate ? '✅' : '⚠️';
            const arQ = e.arQuality || { quality: '' };
            const colTxt = e.collisionInWave
                ? ('wave→' + (e.suggestedSlugIfCollision || ''))
                : (e.collisionAgainstCurated
                    ? ('curated:' + e.collisionAgainstCurated.existingCc)
                    : '');
            lines.push('| ' + mark
                + ' | ' + md(c.slug)
                + ' | ' + md(c.names.ar || '')
                + ' | ' + md(c.names.en || '')
                + ' | ' + md(originalName || '')
                + ' | ' + md(c.countryCode)
                + ' | ' + md(c.featureCode)
                + ' | ' + md(c.population || '-')
                + ' | ' + md(c.admin && (c.admin.regionAr || c.admin.regionEn) || '')
                + ' | ' + fixed(c.lat, 4)
                + ' | ' + fixed(c.lng, 4)
                + ' | ' + fixed(e.distanceToNearestKm, 2)
                + ' | ' + md(e.nearestCuratedSlug || '')
                + ' | ' + md(arQ.quality)
                + ' | ' + md(colTxt)
                + ' | ' + md(c.priority)
                + ' | ' + md(e.reason)
                + ' |');
        }
        lines.push('');
    }

    // What to do next
    lines.push('## What to do next');
    lines.push('');
    lines.push('1. Read the table above. The **✅** rows pass the ar-gate;');
    lines.push('   the **⚠️** rows need manual review for either Arabic name');
    lines.push('   quality or slug collision.');
    lines.push('2. For each **✅** row you want in curated:');
    lines.push('   open `db/places/candidates/' + cc + '-geonames-candidates.json`,');
    lines.push('   change `"status": "pending"` to `"status": "approved"`.');
    lines.push('3. For each **⚠️** row:');
    lines.push('   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;');
    lines.push('   - if collision: change `candidate.slug` to the suggested `slug-' + cc + '` form;');
    lines.push('   - then flip `"status"` to `"approved"`.');
    lines.push('4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.');
    lines.push('5. DO NOT modify `db/places/curated-places.json` directly.');
    lines.push('');
    lines.push('## License + Attribution');
    lines.push('');
    lines.push('© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/');
    lines.push('Source: https://download.geonames.org/export/dump/' + upper + '.zip');
    lines.push('');

    return { md: lines.join('\n'), counts, highTierEntries };
}

// ─── Wave-wide ar-quality report ───
function renderArQualityReport(perCountryResults, arQualityJson) {
    const lines = [];
    lines.push('# Europe-1A — Arabic-Name Quality Report');
    lines.push('');
    lines.push('**Wave**: `' + WAVE_LABEL + '`');
    lines.push('**Strategy**: ' + STRATEGY + ' — Strategy A + Stage 3.5 ar-quality gate');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('');
    lines.push('## What this report tells you');
    lines.push('');
    lines.push('Europe is the first wave where Arabic names are NOT authoritative');
    lines.push('in GeoNames. This report classifies each HIGH-tier candidate by');
    lines.push('the quality of its Arabic name, so you can quickly:');
    lines.push('');
    lines.push('* Accept the clean (`wikidata`/`arabic_only`) ones in bulk;');
    lines.push('* Review and fix the (`mixed_script`/`mixed_latin`/`empty`) ones one by one.');
    lines.push('');
    lines.push('## Quality bucket meanings');
    lines.push('');
    lines.push('| Bucket | Meaning | Default action |');
    lines.push('| --- | --- | --- |');
    lines.push('| `wikidata`     | Arabic from explicit `ar:` tag in GeoNames altnames | ✅ approve if no collision |');
    lines.push('| `arabic_only`  | Untagged altname but characters are 100% pure-Arabic | ✅ approve if no collision |');
    lines.push('| `mixed_script` | Contains Persian/Urdu/Pashto letters (پ چ ژ گ ٹ ڈ ڑ ی ک ہ ے ۀ ...) | ⚠️ fix Arabic manually |');
    lines.push('| `mixed_latin`  | Contains Latin letters (A-Z) mixed in | ⚠️ fix Arabic manually |');
    lines.push('| `mixed_unknown`| Arabic plus other non-Arabic chars we did not catch | ⚠️ inspect manually |');
    lines.push('| `empty`        | No Arabic name at all | 🔴 supply manually |');
    lines.push('');
    lines.push('## Aggregate summary');
    lines.push('');
    lines.push('| Country | high-tier | wikidata | arabic_only | mixed_script | mixed_latin | empty | passes-gate | blocked |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
    let totalHigh = 0, totalPasses = 0, totalBlocked = 0;
    let totalWiki = 0, totalArOnly = 0, totalMixedScript = 0, totalMixedLatin = 0, totalEmpty = 0;
    for (const cc of CCS) {
        const r = perCountryResults[cc];
        if (!r) continue;
        const high = r.counts.tierHigh;
        const wd = r.counts.arHigh.wikidata || 0;
        const ao = r.counts.arHigh.arabic_only || 0;
        const ms = r.counts.arHigh.mixed_script || 0;
        const ml = r.counts.arHigh.mixed_latin || 0;
        const em = r.counts.arHigh.empty || 0;
        const pg = r.counts.passesGate, bg = r.counts.blockedByGate;
        totalHigh += high; totalPasses += pg; totalBlocked += bg;
        totalWiki += wd; totalArOnly += ao; totalMixedScript += ms; totalMixedLatin += ml; totalEmpty += em;
        lines.push('| ' + cc.toUpperCase() + ' | ' + high + ' | ' + wd + ' | ' + ao + ' | ' + ms + ' | ' + ml + ' | ' + em + ' | **' + pg + '** | **' + bg + '** |');
    }
    lines.push('| **TOTAL** | **' + totalHigh + '** | **' + totalWiki + '** | **' + totalArOnly + '** | **' + totalMixedScript + '** | **' + totalMixedLatin + '** | **' + totalEmpty + '** | **' + totalPasses + '** | **' + totalBlocked + '** |');
    lines.push('');

    // Collision summary
    lines.push('## Collision summary');
    lines.push('');
    lines.push('| Collision type | Count (high-tier only) |');
    lines.push('| --- | ---: |');
    let waveColl = 0, curatedColl = 0;
    for (const cc of CCS) {
        const r = perCountryResults[cc];
        if (!r) continue;
        for (const { e } of r.highTierEntries) {
            if (e.collisionInWave) waveColl++;
            if (e.collisionAgainstCurated) curatedColl++;
        }
    }
    lines.push('| Within Europe-1A wave | ' + waveColl + ' |');
    lines.push('| Against existing curated | ' + curatedColl + ' |');
    lines.push('');

    // Detail tables grouped by ar-quality bucket — only high-tier
    const buckets = ['wikidata', 'arabic_only', 'mixed_script', 'mixed_latin', 'mixed_unknown', 'empty'];
    for (const bucket of buckets) {
        const rows = [];
        for (const cc of CCS) {
            const r = perCountryResults[cc];
            if (!r) continue;
            for (const { e, originalName } of r.highTierEntries) {
                const aQ = (e.arQuality && e.arQuality.quality) || '';
                if (aQ === bucket) rows.push({ e, originalName, cc });
            }
        }
        if (!rows.length) continue;
        rows.sort((a, b) => (b.e.candidate.population || 0) - (a.e.candidate.population || 0));
        lines.push('## ' + bucket + ' (' + rows.length + ')');
        lines.push('');
        lines.push('| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |');
        lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const { e, originalName, cc } of rows) {
            const c = e.candidate;
            const colTxt = e.collisionInWave ? 'wave' : (e.collisionAgainstCurated ? 'curated' : '');
            lines.push('| ' + cc
                + ' | ' + md(c.slug)
                + ' | ' + md(c.names.ar || '')
                + ' | ' + md(c.names.en || '')
                + ' | ' + md(originalName || '')
                + ' | ' + md(c.featureCode)
                + ' | ' + md(c.population || '-')
                + ' | ' + md(c.admin && (c.admin.regionAr || c.admin.regionEn) || '')
                + ' | ' + fixed(e.distanceToNearestKm, 2)
                + ' | ' + md(colTxt)
                + ' | ' + md(e.suggestedSlugIfCollision || '')
                + ' |');
        }
        lines.push('');
    }
    lines.push('## License + Attribution');
    lines.push('');
    lines.push('© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/');
    lines.push('');
    return lines.join('\n');
}

// ─── Wave-wide summary ───
function renderSummary(perCountryResults, arQualityJson) {
    const lines = [];
    lines.push('# Europe-1A — Wave Summary');
    lines.push('');
    lines.push('**Wave**: `' + WAVE_LABEL + '`');
    lines.push('**Strategy**: ' + STRATEGY + ' (Strategy A + ar-quality gate)');
    lines.push('**Countries**: ' + CCS.map(c => c.toUpperCase()).join(', '));
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('');
    lines.push('## Filter thresholds');
    lines.push('');
    lines.push('* `population ≥ 100,000`');
    lines.push('* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)');
    lines.push('* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)');
    lines.push('');
    lines.push('## Per-country numbers');
    lines.push('');
    lines.push('| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |');
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
    let totalHigh = 0, totalMedium = 0, totalLow = 0, totalNeedsReview = 0, totalExisting = 0;
    let totalPasses = 0, totalBlocked = 0;
    for (const cc of CCS) {
        const r = perCountryResults[cc];
        if (!r) continue;
        const upper = cc.toUpperCase();
        // raw count from raw.json
        let rawCount = 0;
        try {
            const raw = JSON.parse(fs.readFileSync(pathsFor(cc).rawJson, 'utf8'));
            rawCount = raw.length;
        } catch (_) {}
        const c = r.counts;
        totalHigh += c.tierHigh; totalMedium += c.tierMedium; totalLow += c.tierLow;
        totalNeedsReview += (c.needs_review || 0); totalExisting += (c.existing || 0);
        totalPasses += c.passesGate; totalBlocked += c.blockedByGate;
        lines.push('| ' + upper + ' | ' + rawCount + ' | ' + c.total + ' | **' + c.tierHigh + '** | ' + c.tierMedium + ' | ' + c.tierLow + ' | ' + (c.needs_review||0) + ' | ' + (c.existing||0) + ' | **' + c.passesGate + '** | **' + c.blockedByGate + '** |');
    }
    lines.push('| **TOTAL** | — | — | **' + totalHigh + '** | ' + totalMedium + ' | ' + totalLow + ' | ' + totalNeedsReview + ' | ' + totalExisting + ' | **' + totalPasses + '** | **' + totalBlocked + '** |');
    lines.push('');

    lines.push('## Strategy E decision: what passes vs. what is blocked');
    lines.push('');
    lines.push('* **Passes ar-gate (' + totalPasses + ')** — ready for `status: approved` flip once you verify the row.');
    lines.push('  These have:');
    lines.push('    * clean Arabic name (`wikidata` or `arabic_only` quality);');
    lines.push('    * no slug collision (within Europe-1A wave OR against existing curated).');
    lines.push('* **Blocked by ar-gate (' + totalBlocked + ')** — need manual fix BEFORE approval.');
    lines.push('  Reasons:');
    lines.push('    * Arabic name has Persian/Urdu/Latin contamination → fix `candidate.names.ar` in JSON;');
    lines.push('    * Slug collision → rename to suggested `slug-{cc}` form before approval.');
    lines.push('');

    lines.push('## Reports produced this wave');
    lines.push('');
    lines.push('| Report | Path |');
    lines.push('| --- | --- |');
    lines.push('| Wave summary (this file) | `reports/geodata-europe-1a-summary.md` |');
    lines.push('| Arabic-quality detail   | `reports/geodata-europe-1a-arabic-quality-report.md` |');
    for (const cc of CCS) {
        lines.push('| ' + cc.toUpperCase() + ' country report | `reports/' + cc + '-geodata-import-report.md` |');
    }
    lines.push('');

    lines.push('## Next steps');
    lines.push('');
    lines.push('1. Read this summary + the ar-quality report.');
    lines.push('2. Open each per-country report; decide per row.');
    lines.push('3. Edit `db/places/candidates/{cc}-geonames-candidates.json`:');
    lines.push('    - flip `"status": "approved"` for entries you want;');
    lines.push('    - fix `candidate.names.ar` for `mixed_script`/`mixed_latin`/`empty` rows you keep;');
    lines.push('    - rename `candidate.slug` to the suggested `slug-{cc}` form for collisions.');
    lines.push('4. Reply to the assistant with your decision (approve all / per-country / fix Arabic / exclude / rename).');
    lines.push('5. After you approve, Stage 4 (apply_curated_candidates.mjs) merges only the `approved` entries.');
    lines.push('');
    lines.push('**Hard rule**: do NOT modify `db/places/curated-places.json` by hand. All merges go through Stage 4.');
    lines.push('');
    lines.push('## License + Attribution');
    lines.push('');
    lines.push('© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/');
    lines.push('');
    return lines.join('\n');
}

// ─── Main ───
async function main() {
    const rawByCc = buildRawIndexes();
    const arQualityJson = JSON.parse(
        fs.readFileSync(path.join(BASE_PATHS.candidateDir, 'europe-1a-arabic-quality.json'), 'utf8'));

    const perCountryResults = {};
    for (const cc of CCS) {
        const paths = pathsFor(cc);
        const config = await loadCountryConfig(cc);
        const candidates = JSON.parse(fs.readFileSync(paths.candidatesJson, 'utf8'));
        const result = renderCountryReport(cc, candidates, rawByCc[cc], config, arQualityJson);
        fs.writeFileSync(paths.reportMd, result.md);
        console.log('[reports] wrote', paths.reportMd);
        perCountryResults[cc] = result;
    }

    const summaryPath = path.join(BASE_PATHS.reportDir, 'geodata-europe-1a-summary.md');
    fs.writeFileSync(summaryPath, renderSummary(perCountryResults, arQualityJson));
    console.log('[reports] wrote', summaryPath);

    const arPath = path.join(BASE_PATHS.reportDir, 'geodata-europe-1a-arabic-quality-report.md');
    fs.writeFileSync(arPath, renderArQualityReport(perCountryResults, arQualityJson));
    console.log('[reports] wrote', arPath);

    console.log('[reports] DONE');
}

main().catch(e => {
    console.error('[reports] FAILED:', e && e.message);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
});
