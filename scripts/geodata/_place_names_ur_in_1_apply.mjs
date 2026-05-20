// scripts/geodata/_place_names_ur_in_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-UR-IN-1 — Urdu enrichment for 22 IN BATCH-A entries ONLY.
//
// User decision (2026-05-20): Option A — single APPLY wave covering ONLY
//   the 22 BATCH-A entries from ASIA-1D-IN-A (`f38edf5`). SEED-18 entries
//   (which already have names.ur) are NEVER mutated by this wave.
//
// Sources used (per user-approved plan reports/place-names-ur-in-1-plan.md
// §3 — NO runtime translation, NO fillchain):
//   Priority 1 — GeoNames raw `alternatenames` field (Urdu-distinct candidates):
//     19/22 = 11 KEEP_RAW + 6 PICK_RAW + 2 FIX_RAW
//   Priority 2 — Urdu Wikipedia canonical title:
//     3/22 = coimbatore, amritsar, prayagraj (post-2018 rename)
//   Priority 3 — Wikidata: 0
//   Priority 4 — Manual transliteration: 0
//
// Per user's apply rules (PLACE-NAMES-UR-IN-1 task spec 2026-05-20):
//   1. Target 22 BATCH-A IN slugs ONLY — no other countries, no SEED-18
//   2. Add names.ur for every BATCH-A entry + aliases.ur only where
//      documented in plan §4 (16 aliases across 14 slugs)
//   3. NEVER touch: names.ar, names.en, names.hi, slug, coordinates,
//      timezone, countryCode, geonameId, featureCode, population,
//      aliases.ar, aliases.en, aliases.hi, admin, priority, source,
//      verified, type
//   4. NEVER mutate any SEED-18 entry (PRIOR-18 byte-identity guard)
//   5. NEVER add any other language (bn/ta/mr/te/kn/ml/gu/pa/or/as/sa)
//   6. Don't modify validate_candidates.mjs / _geonames_common.mjs /
//      normalize_places.mjs / apply_curated_candidates.mjs
//   7. Don't modify server.js / js/app.js / index.html
//   8. Strict Urdu script guard (Arabic block + Urdu-distinct letters;
//      reject Latin/Devanagari/Bengali/Tamil/Gurmukhi/Gujarati/Telugu/
//      Kannada/Malayalam + Pashto/Sindhi-specific letters)
//   9. No runtime translation (no Google/OpenAI/Anthropic/browser translate)
//  10. No fillchain (ur in SUPPORTED_LANGS but only filled when explicitly
//      provided in partial — fillLangMap guard intact)
//  11. Idempotent re-run
//  12. NOT use Brunei (bn-*) / Bangladesh (bd-*) / Pakistan (pk-*) data
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesUrIn1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-ur-in-1-apply-report.md';

// ═══ 22 BATCH-A FIXES — user-approved per place-names-ur-in-1-plan.md §3 + §4 ══
const FIXES = [
    { slug: 'coimbatore',       ur: 'کوئمبتور',         aliasesUr: ['کویمباتور', 'کوویل'],              source: 'WIKIPEDIA' },
    { slug: 'thane',            ur: 'تھانے',            aliasesUr: ['تھانہ'],                            source: 'KEEP_RAW'  },
    { slug: 'vadodara',         ur: 'وڈودرا',            aliasesUr: ['برودا'],                            source: 'KEEP_RAW'  },
    { slug: 'pimpri-chinchwad', ur: 'پمپری چنچواڑ',     aliasesUr: ['پیمپری-چینچواد', 'پمپری چنچواڈ'],   source: 'PICK_RAW'  },
    { slug: 'nashik',           ur: 'ناسیک',             aliasesUr: [],                                   source: 'KEEP_RAW'  },
    { slug: 'madurai',          ur: 'مدورائی',           aliasesUr: ['مادورای'],                          source: 'PICK_RAW'  },
    { slug: 'tirunelveli',      ur: 'تیرونلویلی',        aliasesUr: [],                                   source: 'KEEP_RAW'  },
    { slug: 'agra',             ur: 'آگرہ',              aliasesUr: [],                                   source: 'KEEP_RAW'  },
    { slug: 'faridabad',        ur: 'فرید آباد',         aliasesUr: [],                                   source: 'FIX_RAW'   },
    { slug: 'jamshedpur',       ur: 'جمشید پور',         aliasesUr: ['جمشیدپور'],                         source: 'PICK_RAW'  },
    { slug: 'dombivali',        ur: 'دومبیولی',          aliasesUr: [],                                   source: 'KEEP_RAW'  },
    { slug: 'meerut',           ur: 'میرٹھ',             aliasesUr: ['میروت'],                            source: 'KEEP_RAW'  },
    { slug: 'ghaziabad',        ur: 'غازی آباد',         aliasesUr: ['غازی آباد، بھارت'],                source: 'FIX_RAW'   },
    { slug: 'dhanbad',          ur: 'دھنباد',            aliasesUr: [],                                   source: 'KEEP_RAW'  },
    { slug: 'aurangabad',       ur: 'اورنگ آباد',        aliasesUr: ['چھتر پتی سمبھاجی نگر'],             source: 'KEEP_RAW'  },
    { slug: 'varanasi',         ur: 'وارانسی',           aliasesUr: ['بنارس', 'کاشی'],                    source: 'KEEP_RAW'  },
    { slug: 'amritsar',         ur: 'امرتسر',            aliasesUr: ['امریتسار'],                         source: 'WIKIPEDIA' },
    { slug: 'vijayawada',       ur: 'وجے واڑہ',          aliasesUr: [],                                   source: 'PICK_RAW'  },
    { slug: 'ranchi',           ur: 'رانچی',             aliasesUr: [],                                   source: 'KEEP_RAW'  },
    { slug: 'prayagraj',        ur: 'پریاگ راج',         aliasesUr: ['الہ آباد'],                         source: 'WIKIPEDIA' },
    { slug: 'visakhapatnam',    ur: 'وشاکھاپٹنم',        aliasesUr: ['ویزاگ'],                            source: 'PICK_RAW'  },
    { slug: 'jodhpur',          ur: 'جودھپور',           aliasesUr: ['جودپور'],                           source: 'PICK_RAW'  },
];

// ─── Urdu script guard (strict per plan §5) ──────────────────────────────
const HAS_ARABIC_BLOCK    = /[؀-ۿݐ-ݿ]/;        // U+0600-U+06FF + U+0750-U+077F
const HAS_LATIN           = /[A-Za-z]/;
const DEVANAGARI          = /[ऀ-ॿ]/;             // U+0900-U+097F — reject Hindi
const BENGALI             = /[ঀ-৿]/;              // U+0980-U+09FF
const TAMIL               = /[஀-௿]/;              // U+0B80-U+0BFF
const GURMUKHI            = /[਀-੿]/;               // U+0A00-U+0A7F
const GUJARATI            = /[઀-૿]/;               // U+0A80-U+0AFF
const TELUGU_KANNADA      = /[ఀ-ೞ]/;               // U+0C00-U+0CDE
const MALAYALAM           = /[ഀ-ൿ]/;              // U+0D00-U+0D7F
// Reject Pashto/Kurdish/Sindhi-specific letters in Arabic block
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s))            return false;
    if (DEVANAGARI.test(s))           return false;
    if (BENGALI.test(s))              return false;
    if (TAMIL.test(s))                return false;
    if (GURMUKHI.test(s))             return false;
    if (GUJARATI.test(s))             return false;
    if (TELUGU_KANNADA.test(s))       return false;
    if (MALAYALAM.test(s))            return false;
    if (SUSPICIOUS_NON_URDU.test(s))  return false;
    return HAS_ARABIC_BLOCK.test(s);
}

// ─── 18 SEED-18 slugs — MUST NEVER mutate ────────────────────────────────
const IN_SEED_18_SLUGS = new Set([
    'new-delhi', 'mumbai', 'kolkata', 'hyderabad-in', 'chennai', 'bengaluru',
    'lucknow', 'ahmedabad', 'pune', 'jaipur', 'surat', 'kanpur', 'indore',
    'nagpur', 'bhopal', 'patna', 'srinagar', 'kochi'
]);

// ─── 22 BATCH-A slugs targeted by this wave ──────────────────────────────
const IN_BATCH_A_22_SLUGS = new Set(FIXES.map(f => f.slug));

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Map(); // ur → slug
    for (const f of FIXES) {
        if (IN_SEED_18_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a SEED-18 slug: ' + f.slug + ' (must NEVER touch)');
        }
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug in FIXES: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanUrduScript(f.ur)) {
            errors.push(f.slug + ' ur="' + f.ur + '" fails clean-Urdu-script check');
        }
        if (seenUr.has(f.ur)) {
            errors.push('Duplicate Urdu name across rows: "' + f.ur + '" between ' + seenUr.get(f.ur) + ' and ' + f.slug);
        }
        seenUr.set(f.ur, f.slug);
        for (const a of (f.aliasesUr || [])) {
            if (!isCleanUrduScript(a)) {
                errors.push(f.slug + ' alias.ur "' + a + '" fails clean-Urdu-script check');
            }
        }
    }
    if (FIXES.length !== 22) {
        errors.push('FIXES must have exactly 22 BATCH-A entries — got ' + FIXES.length);
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — ' + FIXES.length +
                ' Urdu names + ' +
                FIXES.reduce((sum, f) => sum + (f.aliasesUr?.length || 0), 0) +
                ' aliases validated against strict Urdu script guard');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists:', BACKUP);
    }

    const ORIGINAL_TOTAL = curated.length;

    // ─── Snapshot ALL IN pre-apply state (for invariants) ───
    const preApplyState = {};
    let preInCount = 0;
    for (const e of curated) {
        if (e.countryCode === 'in') {
            preInCount++;
            preApplyState[e.slug] = {
                ar:        (e.names && e.names.ar) || null,
                en:        (e.names && e.names.en) || null,
                hi:        (e.names && e.names.hi) || null,
                ur:        (e.names && e.names.ur) || null,
                bn:        (e.names && e.names.bn) || null,
                fr:        (e.names && e.names.fr) || null,
                de:        (e.names && e.names.de) || null,
                tr:        (e.names && e.names.tr) || null,
                id:        (e.names && e.names.id) || null,
                es:        (e.names && e.names.es) || null,
                ms:        (e.names && e.names.ms) || null,
                aliasesAr: (e.aliases && Array.isArray(e.aliases.ar)) ? e.aliases.ar.slice() : null,
                aliasesEn: (e.aliases && Array.isArray(e.aliases.en)) ? e.aliases.en.slice() : null,
                aliasesHi: (e.aliases && Array.isArray(e.aliases.hi)) ? e.aliases.hi.slice() : null,
                aliasesUr: (e.aliases && Array.isArray(e.aliases.ur)) ? e.aliases.ur.slice() : null,
                aliasesAll: JSON.stringify(e.aliases || null),
                slug:      e.slug,
                cc:        e.countryCode,
                lat:       e.lat,
                lng:       e.lng,
                tz:        e.timezone,
                type:      e.type,
                priority:  e.priority,
                source:    e.source,
                verified:  e.verified,
                admin:     JSON.stringify(e.admin || null),
                langs:     Object.keys(e.names || {}).sort().join(','),
                // Other Indian-lang values must remain absent
                otherLangs: ['bn','ta','mr','te','kn','ml','gu','pa','or','as','sa']
                             .filter(l => e.names && e.names[l])
                             .map(l => l + ':' + e.names[l])
                             .join('|')
            };
        }
    }
    console.log('[apply] pre-apply snapshot: IN entries = ' + preInCount);

    // ─── Snapshot non-IN entries (hash for byte-identity check) ───
    const preNonInHash = curated
        .filter(e => e.countryCode !== 'in')
        .map(e => e.slug + '|' + e.countryCode + '|' + JSON.stringify(e.names || null) + '|' + JSON.stringify(e.aliases || null))
        .sort()
        .join('\n');

    // ─── Cross-collision check vs existing 18 SEED-18 Urdu names ───
    const seed18Ur = new Map();
    const seed18AliasUr = new Map();
    for (const e of curated) {
        if (e.countryCode !== 'in' || !IN_SEED_18_SLUGS.has(e.slug)) continue;
        const ur = (e.names && e.names.ur) || null;
        if (ur) seed18Ur.set(ur, e.slug);
        const aliases = (e.aliases && e.aliases.ur) || [];
        for (const a of aliases) seed18AliasUr.set(a, e.slug);
    }
    for (const fix of FIXES) {
        if (seed18Ur.has(fix.ur)) {
            errors.push('NAME-COLLISION: "' + fix.ur + '" already names.ur for SEED-18 in/' + seed18Ur.get(fix.ur));
        }
        if (seed18AliasUr.has(fix.ur)) {
            errors.push('NAME-VS-ALIAS-COLLISION: "' + fix.ur + '" is alias.ur of SEED-18 in/' + seed18AliasUr.get(fix.ur));
        }
        for (const a of (fix.aliasesUr || [])) {
            if (seed18Ur.has(a)) {
                errors.push('ALIAS-VS-NAME-COLLISION: alias "' + a + '" is primary of SEED-18 in/' + seed18Ur.get(a));
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED cross-collision check vs SEED-18:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] cross-collision OK — no overlap with 18 SEED-18 Urdu names');

    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFound: [],
        notInCountry: [],
        notInBatchA: [],
        seedMutationError: 0,
        priorMutationError: 0,
        nonInMutationError: 0,
        otherLangMutationError: 0,
        aliasesAddedTotal: 0
    };
    const appliedRows = [];

    // ─── Build slug → entry map (IN only) ───
    const inBySlug = new Map();
    for (const e of curated) {
        if (e.countryCode === 'in') inBySlug.set(e.slug, e);
    }

    // ─── Apply each FIX (BATCH-A only) ───
    for (const fix of FIXES) {
        if (!IN_BATCH_A_22_SLUGS.has(fix.slug)) {
            stats.notInBatchA.push(fix.slug);
            continue;
        }
        if (IN_SEED_18_SLUGS.has(fix.slug)) {
            // Safety belt — should never happen due to pre-flight
            console.error('[apply] CRITICAL — FIXES targets SEED-18 slug ' + fix.slug);
            process.exit(1);
        }
        const entry = inBySlug.get(fix.slug);
        if (!entry) {
            stats.slugNotFound.push(fix.slug);
            continue;
        }
        if (entry.countryCode !== 'in') {
            stats.notInCountry.push(fix.slug + ' → cc=' + entry.countryCode);
            continue;
        }
        if (entry.names && entry.names.ur === fix.ur) {
            // Idempotent: ensure aliases are merged
            const existingAliases = Array.isArray(entry.aliases?.ur) ? entry.aliases.ur.slice() : [];
            const seen = new Set([fix.ur, ...existingAliases]);
            let aliasesAddedRow = 0;
            for (const a of (fix.aliasesUr || [])) {
                if (!seen.has(a)) {
                    existingAliases.push(a);
                    seen.add(a);
                    aliasesAddedRow++;
                }
            }
            if (existingAliases.length) {
                if (!entry.aliases) entry.aliases = {};
                entry.aliases.ur = existingAliases;
            }
            if (aliasesAddedRow === 0) {
                stats.skippedAlreadyApplied++;
                console.log('[apply] in/' + fix.slug.padEnd(20) + ' SKIP (idempotent — names.ur already = "' + fix.ur + '")');
                continue;
            }
            stats.aliasesAddedTotal += aliasesAddedRow;
            console.log('[apply] in/' + fix.slug.padEnd(20) + ' aliases+=' + aliasesAddedRow + ' (names.ur already present)');
            appliedRows.push({
                slug: fix.slug, ur: fix.ur, aliasesAddedRow,
                previousUr: fix.ur, source: fix.source + ' (alias-only)'
            });
            continue;
        }

        if (!entry.names)   entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        const previousUr = entry.names.ur || null;
        entry.names.ur = fix.ur;

        // Add aliases.ur (filter duplicates)
        const existingAliases = Array.isArray(entry.aliases.ur) ? entry.aliases.ur.slice() : [];
        const seen = new Set([fix.ur, ...existingAliases]);
        let aliasesAddedRow = 0;
        for (const a of (fix.aliasesUr || [])) {
            if (!seen.has(a)) {
                existingAliases.push(a);
                seen.add(a);
                aliasesAddedRow++;
            }
        }
        if (existingAliases.length) entry.aliases.ur = existingAliases;

        stats.applied++;
        stats.aliasesAddedTotal += aliasesAddedRow;
        appliedRows.push({
            slug: fix.slug,
            ur: fix.ur,
            aliasesAddedRow,
            previousUr,
            source: fix.source
        });
        console.log('[apply] in/' + fix.slug.padEnd(20) +
            ' names.ur: "' + (previousUr || '(absent)') + '" → "' + fix.ur + '"' +
            '  aliases+=' + aliasesAddedRow);
    }

    if (stats.slugNotFound.length) {
        console.error('[apply] FAILED — slugs not found in curated IN:');
        for (const s of stats.slugNotFound) console.error('  - ' + s);
        process.exit(1);
    }
    if (stats.notInCountry.length) {
        console.error('[apply] FAILED — entries not in IN:');
        for (const s of stats.notInCountry) console.error('  - ' + s);
        process.exit(1);
    }
    if (stats.notInBatchA.length) {
        console.error('[apply] FAILED — FIXES contained non-BATCH-A slugs:');
        for (const s of stats.notInBatchA) console.error('  - ' + s);
        process.exit(1);
    }

    // ─── Post-apply assertions ───

    // 1. SEED-18 entries must be BYTE-IDENTICAL (no mutation at all)
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        if (!IN_SEED_18_SLUGS.has(e.slug)) continue;
        const before = preApplyState[e.slug];
        if (!before) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' had no pre-snapshot');
            stats.seedMutationError++;
            continue;
        }
        const afterUr = (e.names && e.names.ur) || null;
        if (before.ur !== afterUr) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' names.ur mutated: "' + before.ur + '" → "' + afterUr + '"');
            stats.seedMutationError++;
        }
        const afterAliasesUr = (e.aliases && Array.isArray(e.aliases.ur)) ? e.aliases.ur : null;
        if (JSON.stringify(before.aliasesUr) !== JSON.stringify(afterAliasesUr)) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' aliases.ur mutated');
            stats.seedMutationError++;
        }
        // Also verify all other fields unchanged
        const afterAliasesAll = JSON.stringify(e.aliases || null);
        if (before.aliasesAll !== afterAliasesAll) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' aliases object mutated');
            stats.seedMutationError++;
        }
        const afterLangs = Object.keys(e.names || {}).sort().join(',');
        if (before.langs !== afterLangs) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' names lang-set mutated: [' + before.langs + '] → [' + afterLangs + ']');
            stats.seedMutationError++;
        }
    }

    // 2. For ALL IN entries: every non-Urdu field must be unchanged
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        const before = preApplyState[e.slug];
        if (!before) continue;

        // names.ar / en / hi must NEVER mutate (any tier)
        const afterAr = (e.names && e.names.ar) || null;
        const afterEn = (e.names && e.names.en) || null;
        const afterHi = (e.names && e.names.hi) || null;
        if (before.ar !== afterAr) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.ar mutated: "' + before.ar + '" → "' + afterAr + '"');
            stats.priorMutationError++;
        }
        if (before.en !== afterEn) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.en mutated: "' + before.en + '" → "' + afterEn + '"');
            stats.priorMutationError++;
        }
        if (before.hi !== afterHi) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.hi mutated: "' + before.hi + '" → "' + afterHi + '"');
            stats.priorMutationError++;
        }

        // names.bn/fr/de/tr/id/es/ms — SEED-18 has these; BATCH-22 does not.
        // Either way, must not mutate.
        for (const l of ['bn','fr','de','tr','id','es','ms']) {
            const beforeV = before[l];
            const afterV = (e.names && e.names[l]) || null;
            if (beforeV !== afterV) {
                console.error('[apply] FAILED — in/' + e.slug + ' names.' + l + ' mutated: "' + beforeV + '" → "' + afterV + '"');
                stats.priorMutationError++;
            }
        }

        // slug / countryCode / lat / lng / timezone / type / priority / source / verified / admin
        if (before.slug !== e.slug) {
            console.error('[apply] FAILED — in/' + e.slug + ' slug mutated: "' + before.slug + '" → "' + e.slug + '"');
            stats.priorMutationError++;
        }
        if (before.cc !== e.countryCode) {
            console.error('[apply] FAILED — in/' + e.slug + ' countryCode mutated');
            stats.priorMutationError++;
        }
        if (before.lat !== e.lat || before.lng !== e.lng) {
            console.error('[apply] FAILED — in/' + e.slug + ' coordinates mutated');
            stats.priorMutationError++;
        }
        if (before.tz !== e.timezone) {
            console.error('[apply] FAILED — in/' + e.slug + ' timezone mutated');
            stats.priorMutationError++;
        }
        if (before.type !== e.type) {
            console.error('[apply] FAILED — in/' + e.slug + ' type mutated');
            stats.priorMutationError++;
        }
        if (before.priority !== e.priority) {
            console.error('[apply] FAILED — in/' + e.slug + ' priority mutated');
            stats.priorMutationError++;
        }
        if (before.source !== e.source) {
            console.error('[apply] FAILED — in/' + e.slug + ' source mutated');
            stats.priorMutationError++;
        }
        if (before.verified !== e.verified) {
            console.error('[apply] FAILED — in/' + e.slug + ' verified mutated');
            stats.priorMutationError++;
        }
        if (before.admin !== JSON.stringify(e.admin || null)) {
            console.error('[apply] FAILED — in/' + e.slug + ' admin mutated');
            stats.priorMutationError++;
        }

        // aliases.ar / aliases.en / aliases.hi must NEVER mutate
        const afterAliasesAr = (e.aliases && Array.isArray(e.aliases.ar)) ? e.aliases.ar : null;
        const afterAliasesEn = (e.aliases && Array.isArray(e.aliases.en)) ? e.aliases.en : null;
        const afterAliasesHi = (e.aliases && Array.isArray(e.aliases.hi)) ? e.aliases.hi : null;
        if (JSON.stringify(before.aliasesAr) !== JSON.stringify(afterAliasesAr)) {
            console.error('[apply] FAILED — in/' + e.slug + ' aliases.ar mutated');
            stats.priorMutationError++;
        }
        if (JSON.stringify(before.aliasesEn) !== JSON.stringify(afterAliasesEn)) {
            console.error('[apply] FAILED — in/' + e.slug + ' aliases.en mutated');
            stats.priorMutationError++;
        }
        if (JSON.stringify(before.aliasesHi) !== JSON.stringify(afterAliasesHi)) {
            console.error('[apply] FAILED — in/' + e.slug + ' aliases.hi mutated');
            stats.priorMutationError++;
        }

        // Other Indian-lang names must remain absent (no addition)
        const afterOtherLangs = ['bn','ta','mr','te','kn','ml','gu','pa','or','as','sa']
            .filter(l => e.names && e.names[l])
            .map(l => l + ':' + e.names[l])
            .join('|');
        if (before.otherLangs !== afterOtherLangs) {
            console.error('[apply] FAILED — in/' + e.slug + ' other Indian lang mutated');
            console.error('  before: ' + before.otherLangs);
            console.error('  after:  ' + afterOtherLangs);
            stats.otherLangMutationError++;
        }
    }

    // 3. NON-IN entries must be byte-identical
    const postNonInHash = curated
        .filter(e => e.countryCode !== 'in')
        .map(e => e.slug + '|' + e.countryCode + '|' + JSON.stringify(e.names || null) + '|' + JSON.stringify(e.aliases || null))
        .sort()
        .join('\n');
    if (preNonInHash !== postNonInHash) {
        console.error('[apply] FAILED — non-IN entries hash differs');
        stats.nonInMutationError++;
    }

    // 4. Total entries unchanged
    const totalCount = curated.length;
    const inCount = curated.filter(e => e.countryCode === 'in').length;
    if (totalCount !== ORIGINAL_TOTAL) {
        console.error('[apply] FAILED — total entries changed');
        process.exit(1);
    }
    if (inCount !== 40) {
        console.error('[apply] FAILED — IN count != 40 (got ' + inCount + ')');
        process.exit(1);
    }
    if (preInCount !== inCount) {
        console.error('[apply] FAILED — IN count drifted from pre-snapshot');
        process.exit(1);
    }
    if (stats.seedMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.seedMutationError + ' SEED-18 mutations (must be 0)');
        process.exit(1);
    }
    if (stats.priorMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.priorMutationError + ' IN mutations to non-Urdu fields (must be 0)');
        process.exit(1);
    }
    if (stats.nonInMutationError > 0) {
        console.error('[apply] FAILED — non-IN entries mutated');
        process.exit(1);
    }
    if (stats.otherLangMutationError > 0) {
        console.error('[apply] FAILED — IN entries had other-Indian-lang mutations');
        process.exit(1);
    }

    // 5. After apply: 40/40 IN entries must have names.ur (clean Urdu)
    let postInUr = 0;
    let postScriptFailures = 0;
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        const ur = (e.names && e.names.ur) || null;
        if (ur && isCleanUrduScript(ur)) postInUr++;
        else if (ur && !isCleanUrduScript(ur)) {
            console.error('[apply] FAILED — in/' + e.slug + ' final names.ur fails script guard: "' + ur + '"');
            postScriptFailures++;
        } else {
            console.error('[apply] FAILED — in/' + e.slug + ' has no names.ur after apply');
            postScriptFailures++;
        }
    }
    if (postScriptFailures > 0) process.exit(1);
    if (postInUr !== 40) {
        console.error('[apply] FAILED — post-apply IN Urdu coverage = ' + postInUr + '/40 (expected 40/40)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-UR-IN-1 — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: IN (22 BATCH-A entries only — 18 SEED-18 byte-identical)');
    L.push('**Total rows applied (names.ur)**: ' + stats.applied);
    L.push('**Total aliases.ur added**: ' + stats.aliasesAddedTotal);
    L.push('**Skipped (idempotent — names.ur already match)**: ' + stats.skippedAlreadyApplied);
    L.push('**SEED-18 mutations (must be 0)**: ' + stats.seedMutationError);
    L.push('**IN mutations to non-Urdu fields (must be 0)**: ' + stats.priorMutationError);
    L.push('**Non-IN entries mutated (must be 0)**: ' + stats.nonInMutationError);
    L.push('**Other-Indian-lang mutations (must be 0)**: ' + stats.otherLangMutationError);
    L.push('**Post-apply IN Urdu coverage**: ' + postInUr + '/40 (100%)');
    L.push('**Total curated entries (unchanged)**: ' + totalCount);
    L.push('**Total IN entries (unchanged)**: ' + inCount);
    L.push('');
    L.push('## Applied rows');
    L.push('');
    L.push('| slug | names.ur | aliases.ur added | source |');
    L.push('| --- | --- | ---: | --- |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.ur + ' | ' + r.aliasesAddedRow + ' | ' + r.source + ' |');
    }
    L.push('');
    L.push('## Source breakdown');
    L.push('');
    const sourceCounts = {};
    for (const f of FIXES) {
        sourceCounts[f.source] = (sourceCounts[f.source] || 0) + 1;
    }
    L.push('| source | count |');
    L.push('| --- | ---: |');
    for (const s of Object.keys(sourceCounts).sort()) {
        L.push('| ' + s + ' | ' + sourceCounts[s] + ' |');
    }
    L.push('| **TOTAL** | **' + FIXES.length + '** |');
    L.push('');
    L.push('## What this apply did NOT do');
    L.push('');
    L.push('- ❌ SEED-18 entries byte-identical (no names.ur or aliases.ur change)');
    L.push('- ❌ `names.ar` not modified for any IN entry');
    L.push('- ❌ `names.en` not modified for any IN entry');
    L.push('- ❌ `names.hi` not modified for any IN entry');
    L.push('- ❌ `aliases.ar` / `aliases.en` / `aliases.hi` not modified for any IN entry');
    L.push('- ❌ Other Indian-lang names (bn/ta/mr/te/kn/ml/gu/pa/or/as/sa) not added');
    L.push('- ❌ Non-IN entries hash-identical (2488 entries)');
    L.push('- ❌ Coordinates, timezone, admin, priority, source, verified, type not modified');
    L.push('- ❌ No new cities added; no cities removed');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html, _geonames_common.mjs, validate_candidates.mjs, normalize_places.mjs, apply_curated_candidates.mjs)');
    L.push('- ❌ No runtime translation (no Google/OpenAI/Anthropic/browser translate)');
    L.push('- ❌ No fillchain');
    L.push('- ❌ No Brunei (bn-geonames-*) data used');
    L.push('- ❌ No Bangladesh (bd-geonames-*) data used');
    L.push('- ❌ No Pakistan (pk-geonames-*) data used');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-UR-IN-1 — Apply Summary ═══');
    console.log('  Applied (new names.ur):           ' + stats.applied);
    console.log('  Aliases.ur added:                 ' + stats.aliasesAddedTotal);
    console.log('  Skipped (idempotent):             ' + stats.skippedAlreadyApplied);
    console.log('  SEED-18 mutations (=0):           ' + stats.seedMutationError);
    console.log('  IN non-Ur mutations (=0):         ' + stats.priorMutationError);
    console.log('  Non-IN mutations (=0):            ' + stats.nonInMutationError);
    console.log('  Other-Indian-lang mutations (=0): ' + stats.otherLangMutationError);
    console.log('  Post-apply IN Urdu:               ' + postInUr + '/40 (100%)');
    console.log('  Total curated entries:            ' + totalCount + ' (unchanged)');
    console.log('  Total IN entries:                 ' + inCount + ' (unchanged)');
}

main();
