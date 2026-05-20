// scripts/geodata/_place_names_bn_bd_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-BN-BD-1 (Fast Track) — apply real Bengali names for the 13
// Bangladesh cities merged via ASIA-1D-BD-A (`5b32825`).
//
// User decision (2026-05-20): Fast Track Review+Apply — single-phase per
// established policy.
//
// Sources used (per user-approved priority order — NO runtime translation):
//   Priority 1 — GeoNames raw `alternatenames` field (clean Bengali script):
//     12 cities extracted via isCleanBengaliScript() from
//     db/places/candidates/bd-geonames-raw.json
//     (gazipur, comilla, bagerhat, mymensingh, bogra, jamalpur, habiganj,
//      feni, netrakona, rangpur, nilphamari) — wait, 11 from GeoNames raw
//   Priority 2 — Bengali Wikipedia (canonical district-name forms):
//     2 cities (lalmonirhat, gaibandha) — both have NO Bengali strings in
//     GeoNames alternatenames; sourced from standard Bengali Wikipedia
//     district article titles
//
// Per user's rules (PLACE-NAMES-BN-BD-1 task spec 2026-05-20):
//   1. Add names.bn for 13 BD-A entries only
//   2. Don't touch 6 prior BD seed entries (PRIOR-6 post-mutation guard)
//   3. Don't change names.ar (preserves BD-A Arabic)
//   4. Don't change names.en (preserves BD-A English)
//   5. Don't change slugs (no URL break)
//   6. Don't change server.js / js/app.js / fillLangMap / index.html
//   7. No runtime translation, no API, no AI translation, no browser translate
//   8. Strict Bengali script guard (Unicode U+0980-U+09FF only;
//      reject Latin, Arabic, Devanagari, Gurmukhi/Tamil/Telugu/Gujarati,
//      Assamese-only ৰ ৱ)
//   9. NO Brunei data used (bd-* files only; bn-geonames-* Brunei files
//      explicitly NOT read)
//  10. Idempotent re-run
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesBnBd1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-bn-bd-1-apply-report.md';

// ─── 13 FIXES — sources documented per row ───────────────────────────────
const FIXES = [
    // ──── 11 from GeoNames raw alternatenames (Priority 1) ────
    { slug: 'gazipur',     bn: 'গাজীপুর',     aliasesBn: [], source: 'GeoNames raw alts (geonameid 1200109)' },
    { slug: 'comilla',     bn: 'কুমিল্লা',    aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185186); 2018 English rename Cumilla but Bengali unchanged' },
    { slug: 'bagerhat',    bn: 'বাগেরহাট',    aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185281)' },
    { slug: 'mymensingh',  bn: 'ময়মনসিংহ',   aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185162)' },
    { slug: 'bogra',       bn: 'বগুড়া',      aliasesBn: [], source: 'GeoNames raw alts (geonameid 1337233); 2018 English rename Bogura but Bengali unchanged' },
    { slug: 'jamalpur',    bn: 'জামালপুর',    aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185106)' },
    { slug: 'habiganj',    bn: 'হবিগঞ্জ',     aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185209)' },
    { slug: 'feni',        bn: 'ফেনী',        aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185224)' },
    { slug: 'netrakona',   bn: 'নেত্রকোণা',   aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185116)' },
    { slug: 'rangpur',     bn: 'রংপুর',       aliasesBn: [], source: 'GeoNames raw alts (geonameid 1185188)' },
    { slug: 'nilphamari',  bn: 'নীলফামারী',   aliasesBn: [], source: 'GeoNames raw alts (geonameid 7646714)' },

    // ──── 2 from Bengali Wikipedia (Priority 2) ────
    // No Bengali strings in GeoNames raw for these — fallback to canonical
    // Bengali Wikipedia district article titles
    { slug: 'lalmonirhat', bn: 'লালমনিরহাট',  aliasesBn: [], source: 'Bengali Wikipedia (লালমনিরহাট জেলা district article) — NOT in GeoNames raw' },
    { slug: 'gaibandha',   bn: 'গাইবান্ধা',   aliasesBn: [], source: 'Bengali Wikipedia (গাইবান্ধা জেলা district article) — NOT in GeoNames raw' },
];

// ─── Bengali script guard (strict per user spec) ─────────────────────────
const BENGALI_BLOCK   = /[ঀ-৿]/;       // U+0980-U+09FF (Bengali script)
const ASSAMESE_ONLY   = /[ৰৱ]/;        // U+09F0 ৰ + U+09F1 ৱ — reject
const LATIN           = /[A-Za-z]/;
const DEVANAGARI      = /[ऀ-ॿ]/;       // U+0900-U+097F (Hindi/Sanskrit)
const ARABIC          = /[؀-ۿ]/;       // U+0600-U+06FF (Arabic/Persian/Urdu)
const OTHER_INDIC     = /[਀-௿]/;        // U+0A00-U+0BFF (Gurmukhi/Gujarati/Tamil/Telugu)

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (LATIN.test(s))        return false;
    if (DEVANAGARI.test(s))   return false;
    if (ARABIC.test(s))       return false;
    if (OTHER_INDIC.test(s))  return false;
    if (ASSAMESE_ONLY.test(s))return false;
    return BENGALI_BLOCK.test(s);
}

// ─── 6 BD seed slugs — MUST NOT mutate ────────────────────────────────────
const BD_PRIOR_6_SLUGS = new Set([
    'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal'
]);

// ─── 13 BD-A slugs targeted by this wave ─────────────────────────────────
const BD_BATCH_A_SLUGS = new Set(FIXES.map(f => f.slug));

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenBn = new Set();
    for (const f of FIXES) {
        if (BD_PRIOR_6_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a PRIOR-6 BD seed slug: ' + f.slug + ' (must NEVER touch)');
        }
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanBengaliScript(f.bn)) {
            errors.push(f.slug + ' bn="' + f.bn + '" fails clean-Bengali-script check');
        }
        if (seenBn.has(f.bn)) errors.push('Duplicate Bengali name: "' + f.bn + '"');
        seenBn.add(f.bn);
        for (const a of (f.aliasesBn || [])) {
            if (!isCleanBengaliScript(a)) {
                errors.push(f.slug + ' alias.bn "' + a + '" fails clean-Bengali-script check');
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — ' + FIXES.length + ' Bengali names validated against strict script guard');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists:', BACKUP);
    }

    // ─── Snapshot ALL BD pre-apply state ───
    const preApplyState = {};
    for (const e of curated) {
        if (e.countryCode === 'bd') {
            preApplyState[e.slug] = {
                ar: (e.names && e.names.ar) || null,
                en: (e.names && e.names.en) || null,
                bn: (e.names && e.names.bn) || null,
                aliasBn: (e.aliases && e.aliases.bn) ? e.aliases.bn.slice() : null,
                slug: e.slug
            };
        }
    }

    // ─── Cross-collision check vs existing 6 BD-seed Bengali names ───
    const existingBdBn = new Map();
    const existingBdAliasBn = new Map();
    for (const e of curated) {
        if (e.countryCode !== 'bd' || !BD_PRIOR_6_SLUGS.has(e.slug)) continue;
        const bn = (e.names && e.names.bn) || null;
        if (bn) existingBdBn.set(bn, e.slug);
        const aliases = (e.aliases && e.aliases.bn) || [];
        for (const a of aliases) existingBdAliasBn.set(a, e.slug);
    }
    for (const fix of FIXES) {
        if (existingBdBn.has(fix.bn)) {
            errors.push('NAME-COLLISION: "' + fix.bn + '" already names.bn for PRIOR-6 bd/' + existingBdBn.get(fix.bn));
        }
        if (existingBdAliasBn.has(fix.bn)) {
            errors.push('NAME-VS-ALIAS-COLLISION: "' + fix.bn + '" is alias.bn of PRIOR-6 bd/' + existingBdAliasBn.get(fix.bn));
        }
        for (const a of (fix.aliasesBn || [])) {
            if (existingBdBn.has(a)) {
                errors.push('ALIAS-VS-NAME-COLLISION: alias "' + a + '" is primary of bd/' + existingBdBn.get(a));
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED cross-collision check vs PRIOR-6 BD seed:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] cross-collision OK — no overlap with 6 PRIOR BD seed Bengali names');

    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFound: [],
        notBdCountry: [],
        priorTouchedError: 0,
        arEnSlugMutationError: 0
    };
    const appliedRows = [];

    // ─── Build slug → entry map (BD only) ───
    const bdBySlug = new Map();
    for (const e of curated) {
        if (e.countryCode === 'bd') bdBySlug.set(e.slug, e);
    }

    // ─── Apply each FIX ───
    for (const fix of FIXES) {
        const entry = bdBySlug.get(fix.slug);
        if (!entry) {
            stats.slugNotFound.push(fix.slug);
            continue;
        }
        // Belt-and-suspenders: assert entry is in BD (already filtered by map)
        if (entry.countryCode !== 'bd') {
            stats.notBdCountry.push(fix.slug + ' → cc=' + entry.countryCode);
            continue;
        }
        if (entry.names && entry.names.bn === fix.bn) {
            stats.skippedAlreadyApplied++;
            console.log('[apply] bd/' + fix.slug.padEnd(15) + ' SKIP (idempotent — names.bn already = "' + fix.bn + '")');
            continue;
        }

        if (!entry.names)   entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        const previousBn = entry.names.bn;
        entry.names.bn = fix.bn;

        // Add aliases.bn (filter duplicates and existing collisions)
        const existingAliases = Array.isArray(entry.aliases.bn) ? entry.aliases.bn.slice() : [];
        const seen = new Set([fix.bn, ...existingAliases]);
        let aliasesAddedRow = 0;
        for (const a of (fix.aliasesBn || [])) {
            if (!seen.has(a)) {
                existingAliases.push(a);
                seen.add(a);
                aliasesAddedRow++;
            }
        }
        if (existingAliases.length) entry.aliases.bn = existingAliases;

        stats.applied++;
        appliedRows.push({
            slug: fix.slug,
            bn: fix.bn,
            aliasesAddedRow,
            previousBn,
            source: fix.source
        });
        console.log('[apply] bd/' + fix.slug.padEnd(15) +
            ' names.bn: "' + (previousBn || '(absent)') + '" → "' + fix.bn + '"' +
            '  aliases+=' + aliasesAddedRow);
    }

    if (stats.slugNotFound.length) {
        console.error('[apply] FAILED — slugs not found in curated BD:');
        for (const s of stats.slugNotFound) console.error('  - ' + s);
        process.exit(1);
    }
    if (stats.notBdCountry.length) {
        console.error('[apply] FAILED — entries not in BD:');
        for (const s of stats.notBdCountry) console.error('  - ' + s);
        process.exit(1);
    }

    // ─── Post-apply assertions ───

    // 1. names.ar / names.en / slug must NEVER mutate for ANY BD entry
    for (const e of curated) {
        if (e.countryCode !== 'bd') continue;
        const before = preApplyState[e.slug];
        if (!before) continue;

        const afterAr = (e.names && e.names.ar) || null;
        const afterEn = (e.names && e.names.en) || null;
        if (before.ar !== afterAr) {
            console.error('[apply] FAILED — bd/' + e.slug + ' names.ar mutated: "' + before.ar + '" → "' + afterAr + '"');
            stats.arEnSlugMutationError++;
        }
        if (before.en !== afterEn) {
            console.error('[apply] FAILED — bd/' + e.slug + ' names.en mutated: "' + before.en + '" → "' + afterEn + '"');
            stats.arEnSlugMutationError++;
        }
        if (before.slug !== e.slug) {
            console.error('[apply] FAILED — bd/' + e.slug + ' slug mutated: "' + before.slug + '" → "' + e.slug + '"');
            stats.arEnSlugMutationError++;
        }

        // 2. PRIOR-6 BD seed entries must NEVER have names.bn or aliases.bn mutated
        if (BD_PRIOR_6_SLUGS.has(e.slug)) {
            const afterBn = (e.names && e.names.bn) || null;
            if (before.bn !== afterBn) {
                console.error('[apply] FAILED — PRIOR-6 bd/' + e.slug + ' names.bn mutated: "' + before.bn + '" → "' + afterBn + '"');
                stats.priorTouchedError++;
            }
            const afterAlias = JSON.stringify((e.aliases && e.aliases.bn) || null);
            const beforeAlias = JSON.stringify(before.aliasBn);
            if (afterAlias !== beforeAlias) {
                console.error('[apply] FAILED — PRIOR-6 bd/' + e.slug + ' aliases.bn mutated');
                stats.priorTouchedError++;
            }
        }
    }
    if (stats.arEnSlugMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.arEnSlugMutationError + ' ar/en/slug mutations detected (must be 0)');
        process.exit(1);
    }
    if (stats.priorTouchedError > 0) {
        console.error('[apply] FAILED — ' + stats.priorTouchedError + ' PRIOR-6 mutations detected (must be 0)');
        process.exit(1);
    }

    // 3. Total entries count must be unchanged
    const totalCount = curated.length;
    const bdCount    = curated.filter(e => e.countryCode === 'bd').length;
    if (totalCount !== 2487) {
        console.error('[apply] FAILED — total entries changed: expected 2487, got ' + totalCount);
        process.exit(1);
    }
    if (bdCount !== 19) {
        console.error('[apply] FAILED — BD count changed: expected 19, got ' + bdCount);
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-BN-BD-1 (Fast Track) — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: BD (13 ASIA-1D-BD-A entries only — no PRIOR-6 seed mutations)');
    L.push('**Total rows applied**: ' + stats.applied);
    L.push('**Skipped (idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**PRIOR-6 BD-seed mutations (must be 0)**: ' + stats.priorTouchedError);
    L.push('**ar/en/slug mutations (must be 0)**: ' + stats.arEnSlugMutationError);
    L.push('');
    L.push('## Applied rows');
    L.push('');
    L.push('| slug | names.bn | aliases.bn added | source |');
    L.push('| --- | --- | ---: | --- |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.bn + ' | ' + r.aliasesAddedRow + ' | ' + r.source + ' |');
    }
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ `names.ar` not modified (preserves BD-A Arabic)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ `slug` not modified for any entry');
    L.push('- ❌ 6 prior BD seed entries (dhaka/chittagong/sylhet/rajshahi/khulna/barisal) not touched');
    L.push('- ❌ Other countries not touched');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html, _geonames_common.mjs)');
    L.push('- ❌ No runtime translation (no Google/OpenAI/Anthropic/browser translate)');
    L.push('- ❌ No fillchain');
    L.push('- ❌ No Brunei (bn-geonames-*, bn.mjs) data used');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-BN-BD-1 (Fast Track) — Apply Summary ═══');
    console.log('  Applied (new):                 ' + stats.applied);
    console.log('  Skipped (idempotent):          ' + stats.skippedAlreadyApplied);
    console.log('  PRIOR-6 BD-seed touched (=0):  ' + stats.priorTouchedError);
    console.log('  ar/en/slug mutations (=0):     ' + stats.arEnSlugMutationError);
    console.log('  Total curated entries:         ' + totalCount + ' (unchanged)');
    console.log('  Total BD entries:              ' + bdCount + ' (unchanged)');
}

main();
