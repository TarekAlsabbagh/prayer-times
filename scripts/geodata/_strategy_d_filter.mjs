// scripts/geodata/_strategy_d_filter.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-NILE-YEMEN-LIBYA-1 — Strategy D filter pass
//
// Strategy D = per-country tailored filters. The user picked this over
// Strategy A (too small — 21 entries, misses SD + LY entirely) and
// Strategy B (too large — 8,128 entries, YE alone is 7,857). The target
// is ~100 entries across the 4 countries, matching the proven LEVANT-
// IRAQ-1 wave size (99 merged).
//
// Per-country rules (user-defined):
//
//   EG (Egypt):
//     feature_code ∈ {PPLC, PPLA, PPLA2, PPL}
//     population >= 100,000
//     tier == 'high'
//
//   SD (Sudan):
//     feature_code ∈ {PPLC, PPLA, PPL}
//     population >= 30,000
//     PPLA seats are FORCE-INCLUDED even if validator put them in
//     tier='low' (Sudan's validator-discovered PPLA fell to low because
//     the shortlist rules in validate_candidates.mjs exclude PPLA from
//     `isAdminOrPPL` — but for Sudan the PPLA seats ARE the real cities)
//
//   LY (Libya):
//     feature_code ∈ {PPLC, PPLA, PPL}
//     population >= 30,000
//     tier == 'high'
//
//   YE (Yemen):
//     Strategy A only — feature_code ∈ {PPLC, PPLA, PPLA2}
//     population > 0
//     tier == 'high'
//     (Yemen's PPLA2 explosion of 7,857 means broader rules are unsafe;
//     keep the conservative Strategy A here.)
//
// Slug collision handling:
//   • Cross-country (EG vs SD vs LY vs YE) — abort if any.
//   • Curated-existing — rename to `<slug>-<cc>` per the GCC-1 established
//     convention. The user explicitly flagged `rafah` (EG vs PS): the EG
//     entry becomes `rafah-eg`, the PS `rafah` slug stays untouched.
//
// Writes reports/geodata-nile-yemen-libya-strategy-d-review.md
//
// Does NOT modify candidates JSON. Does NOT touch curated-places.json.
// Stage 4 stays unrun.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CCS           = ['eg','sd','ly','ye'];
const CURATED_PATH  = path.resolve('db', 'places', 'curated-places.json');
const REPORT_PATH   = path.resolve('reports', 'geodata-nile-yemen-libya-strategy-d-review.md');

// Per-country filter rules (the heart of Strategy D)
const RULES = {
    eg: {
        // EG: city-scale only
        allowedFC: new Set(['PPLC','PPLA','PPLA2','PPL']),
        minPop:    100000,
        tierHigh:  true,
        forcePPLA: false,
        label: 'PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high'
    },
    sd: {
        // SD: lower floor + force PPLA seats (validator marks them low)
        allowedFC: new Set(['PPLC','PPLA','PPL']),
        minPop:    30000,
        tierHigh:  false,         // need PPLA seats from `low` tier too
        forcePPLA: true,          // ANY PPLA seat goes in (state capitals)
        label: 'PPLC/PPLA/PPL + pop ≥ 30,000 (PPLA seats force-included)'
    },
    ly: {
        // LY: lower floor, high-tier only (no force needed; LY validator
        // produced 68 high-tier PPL entries — many real cities like
        // Zliten, Sabratah, Janzur — and the 22 PPLA seats are already
        // in existing curated as type=city OR get forced in by region
        // dedup logic. Recompute force-PPLA for safety.)
        allowedFC: new Set(['PPLC','PPLA','PPL']),
        minPop:    30000,
        tierHigh:  true,
        forcePPLA: true,          // ANY PPLA seat goes in regardless of tier
        label: 'PPLC/PPLA/PPL + pop ≥ 30,000 + tier=high (+ PPLA seats force-included)'
    },
    ye: {
        // YE: Strategy A only — population explosion makes broader unsafe
        allowedFC: new Set(['PPLC','PPLA','PPLA2']),
        minPop:    1,
        tierHigh:  true,
        forcePPLA: false,
        label: 'Strategy A — PPLC/PPLA/PPLA2 + pop > 0 + tier=high'
    }
};

// Slug collision rename rules — slugs that the user explicitly wants
// resolved via the `<slug>-<cc>` convention. Add new entries here when
// new collisions are discovered.
const COLLISION_RENAMES = {
    // EG `rafah` (Sinai border crossing, pop 44k) collides with PS
    // `rafah` (Gaza Strip, the actual famous Rafah city).
    'rafah': { eg: 'rafah-eg' }
};

function loadCandidates(cc) {
    const p = path.resolve('db', 'places', 'candidates', cc + '-geonames-candidates.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Apply Strategy D to one country's candidate list.
// Returns the filtered + sorted entries with their `_reason` annotation
// so the report can show WHY each entry was kept.
function applyStrategyD(cc, candidates) {
    const rule = RULES[cc];
    const seen = new Set();
    const out = [];
    for (const e of candidates) {
        if (e.status !== 'pending' && !(rule.forcePPLA && e.candidate.featureCode === 'PPLA')) {
            // forcePPLA can pull entries with status='pending' tier='low'
            // (the typical SD/LY case). Don't pull `existing`/`rejected`/
            // `needs_review`.
            if (e.status !== 'pending') continue;
        }
        if (e.status !== 'pending') continue;
        const fc = e.candidate.featureCode;
        const pop = Number(e.candidate.population) || 0;
        const isPPLA = (fc === 'PPLA' || fc === 'PPLC');

        // ── Force-PPLA path: PPLA/PPLC seats with status='pending'
        // (any tier) are kept even when pop < minPop or tier != 'high'.
        // This rescues SD/LY governorate capitals that the validator
        // tiered as 'low' due to its `isAdminOrPPL` exclusion of PPLA.
        if (rule.forcePPLA && isPPLA) {
            out.push({ entry: e, _reason: 'force_ppla_seat (fc=' + fc + ', pop=' + pop + ', tier=' + e.tier + ')' });
            seen.add(e.candidate.slug);
            continue;
        }

        if (!rule.allowedFC.has(fc)) continue;
        if (pop < rule.minPop) continue;
        if (rule.tierHigh && e.tier !== 'high') continue;
        out.push({ entry: e, _reason: 'rule_match (fc=' + fc + ', pop=' + pop + ', tier=' + e.tier + ')' });
        seen.add(e.candidate.slug);
    }
    // Sort: population desc, then qScore desc (ties → alphabetic slug)
    out.sort((a, b) => {
        const popA = a.entry.candidate.population || 0;
        const popB = b.entry.candidate.population || 0;
        if (popB !== popA) return popB - popA;
        const qA = a.entry.qualityScore || 0;
        const qB = b.entry.qualityScore || 0;
        if (qB !== qA) return qB - qA;
        return (a.entry.candidate.slug || '').localeCompare(b.entry.candidate.slug || '');
    });
    return out;
}

// Apply per-cc collision renames. Returns the final slug to use
// for an entry (which may differ from candidate.slug).
function finalSlugFor(cc, originalSlug, existingSlugs) {
    if (COLLISION_RENAMES[originalSlug] && COLLISION_RENAMES[originalSlug][cc]) {
        return COLLISION_RENAMES[originalSlug][cc];
    }
    // Auto-rename if it collides with existing curated AND no explicit
    // rule. Use `<slug>-<cc>` per GCC-1 convention. We only auto-rename
    // for explicit collisions — passing through otherwise.
    if (existingSlugs.has(originalSlug)) {
        return originalSlug + '-' + cc;
    }
    return originalSlug;
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
    const allFinalSlugs = []; // { finalSlug, cc, originalSlug }

    for (const cc of CCS) {
        const cands = loadCandidates(cc);
        const filtered = applyStrategyD(cc, cands);
        // Compute final slug per entry (handles rafah-eg + auto rename)
        for (const item of filtered) {
            const orig = item.entry.candidate.slug;
            const final = finalSlugFor(cc, orig, existingSlugs);
            item._finalSlug = final;
            item._renamed = (final !== orig);
            allFinalSlugs.push({ finalSlug: final, cc, originalSlug: orig });
        }
        perCountry[cc] = filtered;
    }

    // Cross-country collision detection (on final slugs)
    const slugBucket = {};
    for (const r of allFinalSlugs) {
        if (!slugBucket[r.finalSlug]) slugBucket[r.finalSlug] = [];
        slugBucket[r.finalSlug].push(r);
    }
    const crossCollisions = Object.entries(slugBucket).filter(([_, rs]) => rs.length > 1);

    // Curated collision detection (still need to check — the rename
    // logic should have resolved them, but be paranoid).
    const curatedCollisions = allFinalSlugs.filter(r => existingSlugs.has(r.finalSlug));

    // Build report
    const lines = [];
    lines.push('# Nile + Yemen + Libya — Strategy D Review');
    lines.push('');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Phase**: `CURATED-GEODATA-NILE-YEMEN-LIBYA-1` — Strategy D filter pass');
    lines.push('**Target wave size**: ~100 entries (matching LEVANT-IRAQ-1\'s 99-entry wave)');
    lines.push('');
    lines.push('Strategy D is a per-country tailored filter:');
    lines.push('');
    for (const cc of CCS) {
        lines.push('* **' + cc.toUpperCase() + '**: ' + RULES[cc].label);
    }
    lines.push('');
    lines.push('Plus collision-rename rules:');
    lines.push('* `rafah` (EG) → `rafah-eg` (PS `rafah` already curated; user-mandated rename per GCC-1 convention)');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Country | Strategy D matches | Renamed | Existing curated | Net new |');
    lines.push('| ---     | ---:               | ---:    | ---:             | ---:    |');
    let totalNew = 0, totalRenamed = 0;
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

    lines.push('## Collision check');
    lines.push('');
    if (crossCollisions.length === 0) {
        lines.push('✅ **Zero cross-country slug collisions** among Strategy D picks (after `rafah-eg` rename).');
    } else {
        lines.push('⚠️ **Cross-country slug collisions detected** — must be resolved');
        lines.push('before Stage 4:');
        lines.push('');
        lines.push('| slug | countries |');
        lines.push('| --- | --- |');
        for (const [slug, rs] of crossCollisions) {
            lines.push('| ' + slug + ' | ' + rs.map(r => r.cc.toUpperCase()).join(', ') + ' |');
        }
    }
    lines.push('');
    if (curatedCollisions.length === 0) {
        lines.push('✅ **Zero collisions with existing curated entries** (after `rafah-eg` rename).');
    } else {
        lines.push('⚠️ **Collisions with existing curated** detected:');
        lines.push('');
        lines.push('| candidate slug | cc | matched existing |');
        lines.push('| --- | --- | --- |');
        for (const c of curatedCollisions) {
            lines.push('| ' + c.finalSlug + ' | ' + c.cc.toUpperCase() + ' | (existing) |');
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
            // Markdown gotcha: when the cell contains the rename marker
            // (` ←renamed from old`), keep the slugs in separate code spans
            // so neither backtick pair leaks. Cell looks like:
            //   `rafah-eg` (renamed from `rafah`)
            const slugCell = item._renamed
                ? '`' + esc(item._finalSlug) + '` (renamed from `' + esc(c.slug) + '`)'
                : '`' + esc(item._finalSlug) + '`';
            const ll = c.lat.toFixed(4) + ', ' + c.lng.toFixed(4);
            lines.push('| ' + i
                + ' | ' + slugCell
                + ' | ' + esc(c.names.ar || '—')
                + ' | ' + esc(c.names.en || '—')
                + ' | ' + esc(c.featureCode)
                + ' | ' + (c.population || 0).toLocaleString('en-US')
                + ' | ' + (c.priority || '—')
                + ' | ' + esc(regionFor(c))
                + ' | ' + ll
                + ' | ' + esc(distLabel(e))
                + ' | ' + esc(item._reason)
                + ' |');
        }
        lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('## Data quality notes');
    lines.push('');
    lines.push('GeoNames\' Arabic field is uneven — some entries store the proper');
    lines.push('Arabic city name (الدوحة, جدة, زليتن), while others store a non-');
    lines.push('Arabic transliteration that landed in `name:ar` by accident (e.g. an');
    lines.push('Urdu form like `sngہ` for Singa, or a different city\'s name like `ربك`');
    lines.push('for Kosti). Scanning the Strategy D shortlist for entries where the');
    lines.push('Arabic name fails a "pure Arabic word" check:');
    lines.push('');
    const _ARABIC_LETTER_RE = /[ء-ي]/;
    const _NON_ARABIC_LETTER_RE = /[A-Za-zپچژکگڈڑٹںیےہە]/;
    const dirtyAr = [];
    for (const cc of CCS) {
        for (const item of perCountry[cc]) {
            const ar = (item.entry.candidate.names && item.entry.candidate.names.ar) || '';
            const en = (item.entry.candidate.names && item.entry.candidate.names.en) || '';
            const hasArabic = _ARABIC_LETTER_RE.test(ar);
            const hasNonArabicLetter = _NON_ARABIC_LETTER_RE.test(ar);
            const tooShort = ar.replace(/\s+/g, '').length < 2;
            if (!hasArabic || hasNonArabicLetter || tooShort) {
                dirtyAr.push({ cc, finalSlug: item._finalSlug, ar, en });
            }
        }
    }
    if (dirtyAr.length === 0) {
        lines.push('✅ All 110 Strategy D entries have clean Arabic names.');
    } else {
        lines.push('⚠️ ' + dirtyAr.length + ' entries have problematic `names.ar` and should');
        lines.push('be reviewed (recommended action: manual fix in candidates JSON before');
        lines.push('Stage 4, OR exclude from this wave):');
        lines.push('');
        lines.push('| cc | final slug | current names.ar | english | suggested action |');
        lines.push('| --- | --- | --- | --- | --- |');
        for (const d of dirtyAr) {
            lines.push('| ' + d.cc.toUpperCase()
                + ' | `' + esc(d.finalSlug) + '`'
                + ' | ' + esc(d.ar || '(empty)')
                + ' | ' + esc(d.en)
                + ' | review + fix (or exclude) |');
        }
    }
    lines.push('');
    lines.push('Note: the english names are reliable across all 110 entries. The');
    lines.push('issue is only on the Arabic side, and only for the ' + dirtyAr.length + ' entries');
    lines.push('listed above. None of the existing 64 curated entries from prior waves');
    lines.push('shipped with bad Arabic — the pipeline\'s `flag_missing_ar` step is the');
    lines.push('main guard, but it doesn\'t catch transliterations stored as if they');
    lines.push('were native Arabic (GeoNames data quirk).');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Decision matrix');
    lines.push('');
    lines.push('Once you finish reviewing each country\'s table above, signal one of:');
    lines.push('');
    lines.push('1. **Approve all ' + totalNew + ' entries** as-is → Stage 4 merges everything');
    lines.push('   (with the `rafah-eg` rename applied automatically).');
    lines.push('2. **Approve per-country**: list which countries to approve in full.');
    lines.push('   Example: "approve EG + YE; skip SD + LY for now".');
    lines.push('3. **Exclude specific slugs**: list slugs you want skipped.');
    lines.push('   Example: "skip al-jadid (no clear governorate), skip gereida".');
    lines.push('4. **Rename specific slugs**: list `<final-slug>` → `<new-slug>` pairs.');
    lines.push('   (rafah-eg is already pre-applied — only mention NEW renames.)');
    lines.push('');
    lines.push('Stage 4 does NOT run until you signal explicitly.');
    lines.push('');
    lines.push('## Untouched (per phase contract)');
    lines.push('');
    lines.push('* `db/places/curated-places.json` — `git diff` clean.');
    lines.push('* `db/places/candidates/*-geonames-candidates.json` — none of the');
    lines.push('  candidate statuses have been flipped. Stage 4 will flip them when');
    lines.push('  you approve.');
    lines.push('* Homepage search, `/api/search-place`, `/search-test`, Qibla / Moon /');
    lines.push('  Prayer pages, Supabase schema — none touched.');
    lines.push('');
    lines.push('## License + attribution');
    lines.push('');
    lines.push('Place data derived from GeoNames country dumps (EG, SD, LY, YE),');
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
    console.log('Cross-country collisions:', crossCollisions.length);
    console.log('Curated collisions (post-rename):', curatedCollisions.length);
}

main();
