// scripts/geodata/_strategy_d_filter_maghreb.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-MAGHREB-1 — Strategy D filter pass
//
// Per-country tailored filters (user-defined):
//   MA (Morocco):    PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high + forcePPLA
//   DZ (Algeria):    PPLC/PPLA/PPL       + pop ≥ 50,000  + tier=high + forcePPLA
//   TN (Tunisia):    PPLC/PPLA/PPL       + pop ≥ 30,000  + tier=high + forcePPLA
//   MR (Mauritania): PPLC/PPLA/PPL       + pop ≥ 10,000  + tier=high + forcePPLA
//
// Slug collision handling:
//   • `saida`        (DZ) → `saida-dz`     (collides with existing MA saida)
//   • `el-marsa`     (DZ+TN cross-country) → `el-marsa-dz`,  `el-marsa-tn`
//   • `sidi-daoud`   (DZ+TN cross-country) → `sidi-daoud-dz`, `sidi-daoud-tn`
//   • Plus auto-detection of any other cross-country / curated collisions.
//
// Special-section treatment:
//   • Laâyoune / Dakhla (Western Sahara, MA admin1 11+12) — go to a
//     `needs_manual_decision` section, NEVER auto-included. The user
//     decides separately whether to merge them given the political
//     contested status.
//   • Entries with bad Arabic names (transliterations, Urdu kafs, or
//     latin script under name:ar) — flagged in a `bad_arabic_names`
//     section. NOT excluded automatically — listed for user review.
//
// Writes reports/geodata-maghreb-strategy-d-review.md
//
// Does NOT modify candidates JSON. Does NOT touch curated-places.json.
// Stage 4 stays unrun.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CCS          = ['ma','dz','tn','mr'];
const CURATED_PATH = path.resolve('db', 'places', 'curated-places.json');
const REPORT_PATH  = path.resolve('reports', 'geodata-maghreb-strategy-d-review.md');

// Per-country filter rules (user-mandated).
const RULES = {
    ma: {
        allowedFC: new Set(['PPLC','PPLA','PPLA2','PPL']),
        minPop:    100000,
        tierHigh:  true,
        forcePPLA: true,
        label: 'PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high + forcePPLA'
    },
    dz: {
        allowedFC: new Set(['PPLC','PPLA','PPL']),
        minPop:    50000,
        tierHigh:  true,
        forcePPLA: true,
        label: 'PPLC/PPLA/PPL + pop ≥ 50,000 + tier=high + forcePPLA'
    },
    tn: {
        allowedFC: new Set(['PPLC','PPLA','PPL']),
        minPop:    30000,
        tierHigh:  true,
        forcePPLA: true,
        label: 'PPLC/PPLA/PPL + pop ≥ 30,000 + tier=high + forcePPLA'
    },
    mr: {
        allowedFC: new Set(['PPLC','PPLA','PPL']),
        minPop:    10000,
        tierHigh:  true,
        forcePPLA: true,
        label: 'PPLC/PPLA/PPL + pop ≥ 10,000 + tier=high + forcePPLA'
    }
};

// Western Sahara admin1 codes (MA only). Strategy D auto-DEFERS these
// to the manual-decision section regardless of pop / tier / fc.
const WESTERN_SAHARA_ADMIN1 = new Set(['11', '12']);

// Explicit slug renames (user-mandated). Applied as the canonical
// final-slug. Keyed by ORIGINAL slug.
const SLUG_RENAMES = {
    ma: {},
    dz: { 'saida': 'saida-dz' },   // collides with existing MA saida
    tn: {},
    mr: {}
};

function loadCandidates(cc) {
    const p = path.resolve('db', 'places', 'candidates', cc + '-geonames-candidates.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function passesStrategyD(cc, e) {
    const rule = RULES[cc];
    const fc   = e.candidate.featureCode;
    const pop  = Number(e.candidate.population) || 0;
    const isPPLA = (fc === 'PPLA' || fc === 'PPLC');
    if (e.status !== 'pending') return false;
    // forcePPLA branch: any PPLA/PPLC seat passes
    if (rule.forcePPLA && isPPLA) return true;
    if (!rule.allowedFC.has(fc)) return false;
    if (pop < rule.minPop) return false;
    if (rule.tierHigh && e.tier !== 'high') return false;
    return true;
}

function isWesternSahara(cc, e) {
    if (cc !== 'ma') return false;
    const a1 = (e.candidate.admin && e.candidate.admin.admin1Code) || '';
    return WESTERN_SAHARA_ADMIN1.has(a1);
}

// Bad-Arabic-name detector. Returns truthy if the value looks unsuitable
// for a curated `names.ar` field — either it contains non-Arabic letters,
// or it's a Latin transliteration, or it's empty/whitespace.
const _ARABIC_LETTER_RE = /[ء-ي]/;
const _LATIN_OR_URDU_RE = /[A-Za-zپچژکگڈڑٹںیےہە]/;
function isBadArabicName(ar) {
    if (!ar || typeof ar !== 'string') return true;
    const trimmed = ar.trim();
    if (trimmed.length < 2) return true;
    if (!_ARABIC_LETTER_RE.test(trimmed)) return true;
    if (_LATIN_OR_URDU_RE.test(trimmed)) return true;
    return false;
}

function esc(s) { return String(s == null ? '' : s).replace(/\|/g, '\\|'); }
function regionFor(cand) {
    const ar = (cand.admin && cand.admin.regionAr) || '';
    const en = (cand.admin && cand.admin.regionEn) || '';
    if (ar && en) return ar + ' / ' + en;
    return ar || en || '—';
}
function distLabel(e) {
    if (e.distanceToNearestKm == null) return '—';
    return e.distanceToNearestKm.toFixed(1) + ' km → ' + (e.nearestCuratedSlug || '?');
}

function main() {
    const curated = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8'));
    const existingSlugs = new Set(curated.map(x => x.slug));

    const perCountry = {};
    const sahara = [];          // { entry, cc, _finalSlug }
    const badArabic = [];       // { entry, cc, _finalSlug }
    const allFinalSlugs = [];   // { finalSlug, cc, originalSlug, entry }

    for (const cc of CCS) {
        const cands = loadCandidates(cc);
        const filtered = [];
        for (const e of cands) {
            const c = e.candidate;
            // Western Sahara → ALWAYS defer to manual decision section
            // (per user instruction). Capture every pending entry from
            // admin1=11 or 12 regardless of whether it would pass
            // Strategy D — gives user full visibility of Western Sahara
            // coverage in the GeoNames MA dump.
            if (e.status === 'pending' && isWesternSahara(cc, e)) {
                sahara.push({ entry: e, cc, _finalSlug: c.slug, _reason: 'admin1=' + ((c.admin && c.admin.admin1Code) || '?') + ' (Western Sahara)' });
                continue;
            }
            if (!passesStrategyD(cc, e)) continue;
            filtered.push({ entry: e, cc });
        }
        filtered.sort((a, b) => {
            const pa = a.entry.candidate.population || 0;
            const pb = b.entry.candidate.population || 0;
            if (pb !== pa) return pb - pa;
            return (a.entry.candidate.slug || '').localeCompare(b.entry.candidate.slug || '');
        });
        perCountry[cc] = filtered;
    }
    // Sort sahara by population desc
    sahara.sort((a, b) => (b.entry.candidate.population || 0) - (a.entry.candidate.population || 0));

    // Cross-country slug detection: any slug appearing in ≥ 2 countries'
    // Strategy D sets becomes a candidate for `<slug>-<cc>` renames.
    const crossBucket = {};
    for (const cc of CCS) {
        for (const item of perCountry[cc]) {
            const slug = item.entry.candidate.slug;
            if (!crossBucket[slug]) crossBucket[slug] = [];
            crossBucket[slug].push(cc);
        }
    }
    const crossSlugs = new Set();
    for (const [slug, ccs] of Object.entries(crossBucket)) {
        if (ccs.length > 1) crossSlugs.add(slug);
    }

    // Compute final slugs (apply explicit renames + auto-rename for
    // cross-country collisions + auto-rename for curated collisions).
    for (const cc of CCS) {
        for (const item of perCountry[cc]) {
            const original = item.entry.candidate.slug;
            let final = SLUG_RENAMES[cc][original] || original;
            if (final === original) {
                // Cross-country collision
                if (crossSlugs.has(original)) {
                    final = original + '-' + cc;
                }
                // Curated collision
                else if (existingSlugs.has(original)) {
                    final = original + '-' + cc;
                }
            }
            item._finalSlug = final;
            item._renamed = (final !== original);
            allFinalSlugs.push({ finalSlug: final, cc, originalSlug: original, entry: item.entry });
            // Bad Arabic detection
            if (isBadArabicName(item.entry.candidate.names && item.entry.candidate.names.ar)) {
                badArabic.push({ entry: item.entry, cc, _finalSlug: final });
            }
        }
    }

    // Final-slug audit
    const finalBucket = {};
    for (const r of allFinalSlugs) {
        if (!finalBucket[r.finalSlug]) finalBucket[r.finalSlug] = [];
        finalBucket[r.finalSlug].push(r);
    }
    const finalCross = Object.entries(finalBucket).filter(([_, rs]) => rs.length > 1);
    const finalCurated = allFinalSlugs.filter(r => existingSlugs.has(r.finalSlug));

    // ── Build report ────────────────────────────────────────────────
    const lines = [];
    lines.push('# Maghreb — Strategy D Review');
    lines.push('');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Phase**: `CURATED-GEODATA-MAGHREB-1` — Strategy D filter pass');
    lines.push('**Target wave size**: ~110-135 entries (matching LEVANT-IRAQ-1 / NILE-YEMEN-LIBYA-1)');
    lines.push('');
    lines.push('Per-country filter rules:');
    lines.push('');
    for (const cc of CCS) {
        lines.push('* **' + cc.toUpperCase() + '**: ' + RULES[cc].label);
    }
    lines.push('');
    lines.push('Slug collision handling: `city-cc` suffix per the established GCC-1');
    lines.push('convention. Explicit rename: `saida` (DZ) → `saida-dz` (existing MA');
    lines.push('saida in curated). Cross-country auto-renames applied as detected.');
    lines.push('');
    lines.push('Western Sahara (MA admin1 11 + 12) → deferred to');
    lines.push('`needs_manual_decision` section (not auto-merged).');
    lines.push('');
    lines.push('---');
    lines.push('');

    // Summary
    let totalNew = 0, totalRenamed = 0;
    lines.push('## Summary');
    lines.push('');
    lines.push('| Country | Strategy D matches | Renamed | Existing curated | Net new |');
    lines.push('| ---     | ---:               | ---:    | ---:             | ---:    |');
    for (const cc of CCS) {
        const matches = perCountry[cc];
        const renamed = matches.filter(x => x._renamed).length;
        const existingCC = curated.filter(x => x.countryCode === cc).length;
        totalNew += matches.length;
        totalRenamed += renamed;
        lines.push('| ' + cc.toUpperCase() + ' | ' + matches.length + ' | ' + renamed + ' | ' + existingCC + ' | ' + matches.length + ' |');
    }
    lines.push('| **TOTAL** | **' + totalNew + '** | **' + totalRenamed + '** | — | **' + totalNew + '** |');
    lines.push('');
    lines.push('Plus **' + sahara.length + '** entries deferred to `needs_manual_decision`');
    lines.push('(Western Sahara) and **' + badArabic.length + '** flagged in `bad_arabic_names`.');
    lines.push('');

    // Collision audit
    lines.push('## Collision check');
    lines.push('');
    if (finalCross.length === 0) {
        lines.push('✅ **Zero cross-country slug collisions** among Strategy D picks (after renames).');
    } else {
        lines.push('⚠️ **Cross-country slug collisions still exist** — must be resolved before Stage 4:');
        lines.push('');
        lines.push('| slug | countries |');
        lines.push('| --- | --- |');
        for (const [slug, rs] of finalCross) {
            lines.push('| `' + slug + '` | ' + rs.map(r => r.cc.toUpperCase()).join(', ') + ' |');
        }
    }
    lines.push('');
    if (finalCurated.length === 0) {
        lines.push('✅ **Zero collisions with existing curated entries** (after renames).');
    } else {
        lines.push('⚠️ **Collisions with existing curated** still detected:');
        lines.push('');
        lines.push('| candidate slug | cc | matched existing |');
        lines.push('| --- | --- | --- |');
        for (const c of finalCurated) {
            lines.push('| `' + c.finalSlug + '` | ' + c.cc.toUpperCase() + ' | (existing) |');
        }
    }
    lines.push('');

    // Per-country detailed tables
    for (const cc of CCS) {
        const matches = perCountry[cc];
        lines.push('## ' + cc.toUpperCase() + ' — ' + matches.length + ' Strategy D picks');
        lines.push('');
        lines.push('**Filter**: ' + RULES[cc].label);
        lines.push('');
        if (!matches.length) {
            lines.push('_(none)_');
            lines.push('');
            continue;
        }
        lines.push('| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |');
        lines.push('| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |');
        let i = 0;
        for (const item of matches) {
            i++;
            const e = item.entry;
            const c = e.candidate;
            const slugCell = item._renamed
                ? '`' + esc(item._finalSlug) + '` (renamed from `' + esc(c.slug) + '`)'
                : '`' + esc(item._finalSlug) + '`';
            const ll = c.lat.toFixed(4) + ', ' + c.lng.toFixed(4);
            const pop = c.population || 0;
            const rule = RULES[cc];
            const isPPLA = (c.featureCode === 'PPLA' || c.featureCode === 'PPLC');
            const reason = (rule.forcePPLA && isPPLA)
                ? 'force_ppla_seat (fc=' + c.featureCode + ', pop=' + pop + ', tier=' + e.tier + ')'
                : 'rule_match (fc=' + c.featureCode + ', pop=' + pop + ', tier=' + e.tier + ')';
            lines.push('| ' + i
                + ' | ' + slugCell
                + ' | ' + esc(c.names.ar || '—')
                + ' | ' + esc(c.names.en || '—')
                + ' | ' + esc(c.featureCode)
                + ' | ' + pop.toLocaleString('en-US')
                + ' | ' + (c.priority || '—')
                + ' | ' + esc(regionFor(c))
                + ' | ' + ll
                + ' | ' + esc(distLabel(e))
                + ' | ' + esc(reason)
                + ' |');
        }
        lines.push('');
    }

    // ── Western Sahara special section ──────────────────────────────
    lines.push('---');
    lines.push('');
    lines.push('## Needs manual decision — Western Sahara (MA admin1 11 + 12)');
    lines.push('');
    lines.push('GeoNames assigns these places to MA (Morocco), but the political');
    lines.push('status of Western Sahara is contested. They are NOT included in');
    lines.push('Strategy D\'s auto-merge — you decide whether to:');
    lines.push('');
    lines.push('1. Approve all (treat as MA per GeoNames) — pulls them into curated');
    lines.push('   with cc=ma and `Africa/Casablanca` timezone.');
    lines.push('2. Approve some (specific slugs only).');
    lines.push('3. Skip all — leave Western Sahara for a separate phase.');
    lines.push('');
    lines.push('Listing includes every PENDING entry from admin1=11 or admin1=12');
    lines.push('regardless of whether it would have passed Strategy D\'s filters.');
    lines.push('');
    lines.push('**Note on Laâyoune + Dakhla**: GeoNames\' MA dump does NOT tag the');
    lines.push('cities of Laâyoune (capital of region 11) or Dakhla (capital of');
    lines.push('region 12) as PPLA/PPLC — likely a side effect of the political');
    lines.push('contested status. If neither appears in the table below, they are');
    lines.push('absent from candidates entirely. The user can still add them manually');
    lines.push('after a separate decision (curated entries can be authored without');
    lines.push('going through the GeoNames pipeline).');
    lines.push('');
    if (!sahara.length) {
        lines.push('_(no pending Western Sahara entries found in candidates)_');
    } else {
        lines.push('| slug | name.ar | name.en | fc | admin1 | pop | tier | lat,lng | passes Strategy D? |');
        lines.push('| --- | --- | --- | --- | --- | ---: | --- | --- | --- |');
        for (const item of sahara) {
            const c = item.entry.candidate;
            const a1 = (c.admin && c.admin.admin1Code) || '?';
            const region = a1 === '11' ? 'Laâyoune-Sakia El Hamra' : (a1 === '12' ? 'Dakhla-Oued Ed-Dahab' : '?');
            const ll = c.lat.toFixed(4) + ', ' + c.lng.toFixed(4);
            const passes = passesStrategyD(item.cc, item.entry) ? 'yes' : 'no';
            lines.push('| `' + esc(c.slug) + '`'
                + ' | ' + esc(c.names.ar || '—')
                + ' | ' + esc(c.names.en || '—')
                + ' | ' + esc(c.featureCode)
                + ' | ' + a1 + ' (' + region + ')'
                + ' | ' + (c.population || 0).toLocaleString('en-US')
                + ' | ' + (item.entry.tier || '—')
                + ' | ' + ll
                + ' | ' + passes
                + ' |');
        }
    }
    lines.push('');

    // ── Bad Arabic names ──────────────────────────────────────────────
    lines.push('## Bad Arabic names — flagged for manual review');
    lines.push('');
    if (!badArabic.length) {
        lines.push('✅ All Strategy D picks have clean Arabic names.');
    } else {
        lines.push('⚠️ ' + badArabic.length + ' entries have problematic `names.ar`.');
        lines.push('Recommended actions: (a) provide a manual correction at apply-prep');
        lines.push('time, OR (b) exclude from this wave.');
        lines.push('');
        lines.push('| cc | final slug | current names.ar | english | issue |');
        lines.push('| --- | --- | --- | --- | --- |');
        for (const d of badArabic) {
            const c = d.entry.candidate;
            const ar = c.names && c.names.ar;
            let issue = '';
            if (!ar) issue = 'empty';
            else if (!_ARABIC_LETTER_RE.test(ar)) issue = 'no Arabic letters (looks Latin)';
            else if (_LATIN_OR_URDU_RE.test(ar)) issue = 'mixed script (Latin/Urdu chars present)';
            else if (ar.trim().length < 2) issue = 'too short';
            else issue = '(unknown)';
            lines.push('| ' + d.cc.toUpperCase()
                + ' | `' + esc(d._finalSlug) + '`'
                + ' | ' + esc(ar || '(empty)')
                + ' | ' + esc(c.names.en || '—')
                + ' | ' + esc(issue)
                + ' |');
        }
    }
    lines.push('');

    // ── Decision matrix ─────────────────────────────────────────────
    lines.push('---');
    lines.push('');
    lines.push('## Decision matrix');
    lines.push('');
    lines.push('Once you finish reviewing each country\'s table above, signal one of:');
    lines.push('');
    lines.push('1. **Approve all ' + totalNew + ' entries** as-is → Stage 4 merges');
    lines.push('   everything with the explicit + auto renames applied.');
    lines.push('2. **Approve per-country**: list which countries to approve in full.');
    lines.push('3. **Exclude specific slugs**: list slugs you want skipped.');
    lines.push('4. **Rename specific slugs**: list `<final-slug>` → `<new-slug>` pairs');
    lines.push('   (auto renames already applied — only mention NEW renames).');
    lines.push('5. **Fix names.ar then approve**: ' + badArabic.length + ' entries in bad_arabic_names');
    lines.push('   need user-provided Arabic corrections.');
    lines.push('');
    lines.push('Separately, decide on Western Sahara (' + sahara.length + ' entries): approve / skip / partial.');
    lines.push('');
    lines.push('Stage 4 does NOT run until you signal.');
    lines.push('');
    lines.push('## Untouched (per phase contract)');
    lines.push('');
    lines.push('* `db/places/curated-places.json` — `git diff` clean.');
    lines.push('* `db/places/candidates/*-geonames-candidates.json` — status flags');
    lines.push('  untouched (no flip to `approved`).');
    lines.push('* Homepage search, `/api/search-place`, `/search-test`, Qibla / Moon /');
    lines.push('  Prayer pages, Supabase schema — none touched.');
    lines.push('');
    lines.push('## License + attribution');
    lines.push('');
    lines.push('Place data derived from GeoNames country dumps (MA, DZ, TN, MR),');
    lines.push('CC-BY 4.0. Sources: https://download.geonames.org/export/dump/{cc}.zip');
    lines.push('');

    fs.writeFileSync(REPORT_PATH, lines.join('\n'));
    console.log('Wrote', REPORT_PATH);
    console.log('');
    console.log('Strategy D totals:');
    for (const cc of CCS) {
        console.log('  ' + cc.toUpperCase() + ': ' + perCountry[cc].length);
    }
    console.log('  TOTAL: ' + totalNew);
    console.log('  Western Sahara deferred:', sahara.length);
    console.log('  Bad Arabic flagged:', badArabic.length);
    console.log('  Renames applied:', totalRenamed);
    console.log('  Cross-country collisions remaining:', finalCross.length);
    console.log('  Curated collisions remaining:', finalCurated.length);
}

main();
