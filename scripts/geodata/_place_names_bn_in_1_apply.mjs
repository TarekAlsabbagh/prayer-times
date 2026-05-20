// scripts/geodata/_place_names_bn_in_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-BN-IN-1 — Bengali enrichment for 22 IN BATCH-A entries ONLY.
//
// User decision (2026-05-20): Option A — single APPLY wave covering ONLY
//   the 22 BATCH-A entries from ASIA-1D-IN-A (`f38edf5`). SEED-18 entries
//   (which already have names.bn) are NEVER mutated by this wave.
//
// Sources used (per user-approved plan reports/place-names-bn-in-1-plan.md
// §3 — NO runtime translation, NO fillchain):
//   Priority 1 — GeoNames raw `alternatenames` field (Bengali-clean):
//     11/22 = 9 KEEP_RAW + 2 FIX_RAW
//   Priority 2 — Bengali Wikipedia canonical title:
//     11/22 = visakhapatnam, vijayawada, varanasi, tirunelveli, thane,
//     meerut, madurai, faridabad, dombivali, coimbatore, prayagraj
//   Priority 3 — Wikidata: 0
//   Priority 4 — Manual transliteration: 0
//
// Per user's apply rules (PLACE-NAMES-BN-IN-1 task spec 2026-05-20):
//   1. Target 22 BATCH-A IN slugs ONLY — no other countries, no SEED-18
//   2. Add names.bn for every BATCH-A entry + aliases.bn only where
//      documented in plan §4
//   3. NEVER touch: names.ar, names.en, names.hi, names.ur, slug,
//      coordinates, timezone, countryCode, aliases.{ar,en,hi,ur}, admin,
//      priority, source, verified, type
//   4. NEVER mutate any SEED-18 entry (SEED-18 byte-identity guard)
//   5. NEVER add any other Indian language (ta/mr/te/kn/ml/gu/pa/or/as/sa)
//   6. Don't modify validate_candidates.mjs / _geonames_common.mjs /
//      normalize_places.mjs / apply_curated_candidates.mjs
//   7. Don't modify server.js / js/app.js / index.html
//   8. Strict Bengali script guard (U+0980-U+09FF; reject Latin/
//      Devanagari/Arabic/Tamil/Gurmukhi/Gujarati/Telugu/Kannada/Malayalam
//      + Assamese-only ৰ ৱ)
//   9. No runtime translation (no Google/OpenAI/Anthropic/browser)
//  10. No fillchain (bn in SUPPORTED_LANGS but partial-only)
//  11. Idempotent re-run
//  12. NOT use Brunei (bn-*) / Bangladesh (bd-*) / Pakistan (pk-*) data
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesBnIn1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-bn-in-1-apply-report.md';

// ═══ 22 BATCH-A FIXES — user-approved per place-names-bn-in-1-plan.md §3 + §4 ══
const FIXES = [
    { slug: 'coimbatore',       bn: 'কোয়েম্বাটুর',      aliasesBn: ['কোভাই'],                       source: 'WIKIPEDIA' },
    { slug: 'thane',            bn: 'থানে',              aliasesBn: [],                              source: 'WIKIPEDIA' },
    { slug: 'vadodara',         bn: 'বড়োদরা',            aliasesBn: ['বরোদা'],                       source: 'KEEP_RAW'  },
    { slug: 'pimpri-chinchwad', bn: 'পিম্পরি-চিঞ্চওয়াড়', aliasesBn: [],                              source: 'FIX_RAW'   },
    { slug: 'nashik',           bn: 'নাশিক',             aliasesBn: [],                              source: 'KEEP_RAW'  },
    { slug: 'madurai',          bn: 'মাদুরাই',           aliasesBn: [],                              source: 'WIKIPEDIA' },
    { slug: 'tirunelveli',      bn: 'তিরুনেলভেলি',       aliasesBn: [],                              source: 'WIKIPEDIA' },
    { slug: 'agra',             bn: 'আগ্রা',             aliasesBn: [],                              source: 'KEEP_RAW'  },
    { slug: 'faridabad',        bn: 'ফরিদাবাদ',          aliasesBn: [],                              source: 'WIKIPEDIA' },
    { slug: 'jamshedpur',       bn: 'জামশেদপুর',         aliasesBn: ['জমশেদপুর'],                    source: 'KEEP_RAW'  },
    { slug: 'dombivali',        bn: 'দোম্বিভলি',         aliasesBn: [],                              source: 'WIKIPEDIA' },
    { slug: 'meerut',           bn: 'মেরঠ',              aliasesBn: ['মীরুট'],                       source: 'WIKIPEDIA' },
    { slug: 'ghaziabad',        bn: 'গাজিয়াবাদ',         aliasesBn: ['ঘাজিয়াবাদ'],                   source: 'KEEP_RAW'  },
    { slug: 'dhanbad',          bn: 'ধানবাদ',            aliasesBn: [],                              source: 'FIX_RAW'   },
    { slug: 'aurangabad',       bn: 'আওরঙ্গাবাদ',        aliasesBn: ['ছত্রপতি সম্ভাজীনগর'],          source: 'KEEP_RAW'  },
    { slug: 'varanasi',         bn: 'বারাণসী',           aliasesBn: ['বেনারস', 'কাশী'],              source: 'WIKIPEDIA' },
    { slug: 'amritsar',         bn: 'অমৃতসর',            aliasesBn: [],                              source: 'KEEP_RAW'  },
    { slug: 'vijayawada',       bn: 'বিজয়ওয়াড়া',        aliasesBn: [],                              source: 'WIKIPEDIA' },
    { slug: 'ranchi',           bn: 'রাঁচি',              aliasesBn: [],                              source: 'KEEP_RAW'  },
    { slug: 'prayagraj',        bn: 'প্রয়াগরাজ',         aliasesBn: ['এলাহাবাদ'],                    source: 'WIKIPEDIA' },
    { slug: 'visakhapatnam',    bn: 'বিশাখাপত্তনম',      aliasesBn: ['ভাইজাগ', 'বিশাখাপত্তম'],       source: 'WIKIPEDIA' },
    { slug: 'jodhpur',          bn: 'যোধপুর',            aliasesBn: [],                              source: 'KEEP_RAW'  },
];

// ─── Bengali script guard (strict per plan §5) ───────────────────────────
const BENGALI_BLOCK    = /[ঀ-৿]/;        // U+0980-U+09FF — REQUIRED
const ASSAMESE_ONLY    = /[ৰৱ]/;          // U+09F0 ৰ + U+09F1 ৱ — reject
const LATIN            = /[A-Za-z]/;
const DEVANAGARI       = /[ऀ-ॿ]/;         // U+0900-U+097F — reject Hindi
const ARABIC           = /[؀-ۿ]/;         // U+0600-U+06FF — reject Arabic/Urdu/Persian
const TAMIL            = /[஀-௿]/;         // U+0B80-U+0BFF — reject
const GURMUKHI         = /[਀-੿]/;          // U+0A00-U+0A7F — reject
const GUJARATI         = /[઀-૿]/;          // U+0A80-U+0AFF — reject
const TELUGU_KANNADA   = /[ఀ-ೞ]/;          // U+0C00-U+0CDE — reject
const MALAYALAM        = /[ഀ-ൿ]/;          // U+0D00-U+0D7F — reject

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (LATIN.test(s))           return false;
    if (DEVANAGARI.test(s))      return false;
    if (ARABIC.test(s))          return false;
    if (TAMIL.test(s))           return false;
    if (GURMUKHI.test(s))        return false;
    if (GUJARATI.test(s))        return false;
    if (TELUGU_KANNADA.test(s))  return false;
    if (MALAYALAM.test(s))       return false;
    if (ASSAMESE_ONLY.test(s))   return false;
    return BENGALI_BLOCK.test(s);
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
    const seenBn = new Map();
    for (const f of FIXES) {
        if (IN_SEED_18_SLUGS.has(f.slug)) {
            errors.push('FIXES targets a SEED-18 slug: ' + f.slug + ' (must NEVER touch)');
        }
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug in FIXES: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanBengaliScript(f.bn)) {
            errors.push(f.slug + ' bn="' + f.bn + '" fails clean-Bengali-script check');
        }
        if (seenBn.has(f.bn)) {
            errors.push('Duplicate Bengali name across rows: "' + f.bn + '" between ' + seenBn.get(f.bn) + ' and ' + f.slug);
        }
        seenBn.set(f.bn, f.slug);
        for (const a of (f.aliasesBn || [])) {
            if (!isCleanBengaliScript(a)) {
                errors.push(f.slug + ' alias.bn "' + a + '" fails clean-Bengali-script check');
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
                ' Bengali names + ' +
                FIXES.reduce((sum, f) => sum + (f.aliasesBn?.length || 0), 0) +
                ' aliases validated against strict Bengali script guard');

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
                aliasesBn: (e.aliases && Array.isArray(e.aliases.bn)) ? e.aliases.bn.slice() : null,
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
                otherLangs: ['ta','mr','te','kn','ml','gu','pa','or','as','sa']
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

    // ─── Cross-collision check vs existing 18 SEED-18 Bengali names ───
    const seed18Bn = new Map();
    const seed18AliasBn = new Map();
    for (const e of curated) {
        if (e.countryCode !== 'in' || !IN_SEED_18_SLUGS.has(e.slug)) continue;
        const bn = (e.names && e.names.bn) || null;
        if (bn) seed18Bn.set(bn, e.slug);
        const aliases = (e.aliases && e.aliases.bn) || [];
        for (const a of aliases) seed18AliasBn.set(a, e.slug);
    }
    for (const fix of FIXES) {
        if (seed18Bn.has(fix.bn)) {
            errors.push('NAME-COLLISION: "' + fix.bn + '" already names.bn for SEED-18 in/' + seed18Bn.get(fix.bn));
        }
        if (seed18AliasBn.has(fix.bn)) {
            errors.push('NAME-VS-ALIAS-COLLISION: "' + fix.bn + '" is alias.bn of SEED-18 in/' + seed18AliasBn.get(fix.bn));
        }
        for (const a of (fix.aliasesBn || [])) {
            if (seed18Bn.has(a)) {
                errors.push('ALIAS-VS-NAME-COLLISION: alias "' + a + '" is primary of SEED-18 in/' + seed18Bn.get(a));
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED cross-collision check vs SEED-18:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] cross-collision OK — no overlap with 18 SEED-18 Bengali names');

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
        if (entry.names && entry.names.bn === fix.bn) {
            // Idempotent: ensure aliases are merged
            const existingAliases = Array.isArray(entry.aliases?.bn) ? entry.aliases.bn.slice() : [];
            const seen = new Set([fix.bn, ...existingAliases]);
            let aliasesAddedRow = 0;
            for (const a of (fix.aliasesBn || [])) {
                if (!seen.has(a)) {
                    existingAliases.push(a);
                    seen.add(a);
                    aliasesAddedRow++;
                }
            }
            if (existingAliases.length) {
                if (!entry.aliases) entry.aliases = {};
                entry.aliases.bn = existingAliases;
            }
            if (aliasesAddedRow === 0) {
                stats.skippedAlreadyApplied++;
                console.log('[apply] in/' + fix.slug.padEnd(20) + ' SKIP (idempotent — names.bn already = "' + fix.bn + '")');
                continue;
            }
            stats.aliasesAddedTotal += aliasesAddedRow;
            console.log('[apply] in/' + fix.slug.padEnd(20) + ' aliases+=' + aliasesAddedRow + ' (names.bn already present)');
            appliedRows.push({
                slug: fix.slug, bn: fix.bn, aliasesAddedRow,
                previousBn: fix.bn, source: fix.source + ' (alias-only)'
            });
            continue;
        }

        if (!entry.names)   entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        const previousBn = entry.names.bn || null;
        entry.names.bn = fix.bn;

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
        stats.aliasesAddedTotal += aliasesAddedRow;
        appliedRows.push({
            slug: fix.slug,
            bn: fix.bn,
            aliasesAddedRow,
            previousBn,
            source: fix.source
        });
        console.log('[apply] in/' + fix.slug.padEnd(20) +
            ' names.bn: "' + (previousBn || '(absent)') + '" → "' + fix.bn + '"' +
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

    // ─── Post-apply assertions ───

    // 1. SEED-18 entries must be BYTE-IDENTICAL
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        if (!IN_SEED_18_SLUGS.has(e.slug)) continue;
        const before = preApplyState[e.slug];
        if (!before) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' had no pre-snapshot');
            stats.seedMutationError++;
            continue;
        }
        const afterBn = (e.names && e.names.bn) || null;
        if (before.bn !== afterBn) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' names.bn mutated: "' + before.bn + '" → "' + afterBn + '"');
            stats.seedMutationError++;
        }
        const afterAliasesBn = (e.aliases && Array.isArray(e.aliases.bn)) ? e.aliases.bn : null;
        if (JSON.stringify(before.aliasesBn) !== JSON.stringify(afterAliasesBn)) {
            console.error('[apply] FAILED — SEED-18 in/' + e.slug + ' aliases.bn mutated');
            stats.seedMutationError++;
        }
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

    // 2. For ALL IN entries: every non-Bengali field must be unchanged
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        const before = preApplyState[e.slug];
        if (!before) continue;

        const afterAr = (e.names && e.names.ar) || null;
        const afterEn = (e.names && e.names.en) || null;
        const afterHi = (e.names && e.names.hi) || null;
        const afterUr = (e.names && e.names.ur) || null;
        if (before.ar !== afterAr) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.ar mutated');
            stats.priorMutationError++;
        }
        if (before.en !== afterEn) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.en mutated');
            stats.priorMutationError++;
        }
        if (before.hi !== afterHi) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.hi mutated');
            stats.priorMutationError++;
        }
        if (before.ur !== afterUr) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.ur mutated');
            stats.priorMutationError++;
        }

        // names.fr/de/tr/id/es/ms — SEED-18 has these; BATCH-22 doesn't
        for (const l of ['fr','de','tr','id','es','ms']) {
            const beforeV = before[l];
            const afterV = (e.names && e.names[l]) || null;
            if (beforeV !== afterV) {
                console.error('[apply] FAILED — in/' + e.slug + ' names.' + l + ' mutated');
                stats.priorMutationError++;
            }
        }

        if (before.slug !== e.slug) {
            console.error('[apply] FAILED — in/' + e.slug + ' slug mutated');
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

        const afterAliasesAr = (e.aliases && Array.isArray(e.aliases.ar)) ? e.aliases.ar : null;
        const afterAliasesEn = (e.aliases && Array.isArray(e.aliases.en)) ? e.aliases.en : null;
        const afterAliasesHi = (e.aliases && Array.isArray(e.aliases.hi)) ? e.aliases.hi : null;
        const afterAliasesUr = (e.aliases && Array.isArray(e.aliases.ur)) ? e.aliases.ur : null;
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
        if (JSON.stringify(before.aliasesUr) !== JSON.stringify(afterAliasesUr)) {
            console.error('[apply] FAILED — in/' + e.slug + ' aliases.ur mutated');
            stats.priorMutationError++;
        }

        // No new other-Indian-lang added
        const afterOtherLangs = ['ta','mr','te','kn','ml','gu','pa','or','as','sa']
            .filter(l => e.names && e.names[l])
            .map(l => l + ':' + e.names[l])
            .join('|');
        if (before.otherLangs !== afterOtherLangs) {
            console.error('[apply] FAILED — in/' + e.slug + ' other Indian lang mutated');
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
    if (stats.seedMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.seedMutationError + ' SEED-18 mutations');
        process.exit(1);
    }
    if (stats.priorMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.priorMutationError + ' IN mutations to non-Bengali fields');
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

    // 5. After apply: 40/40 IN entries must have names.bn (clean Bengali)
    let postInBn = 0;
    let postScriptFailures = 0;
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        const bn = (e.names && e.names.bn) || null;
        if (bn && isCleanBengaliScript(bn)) postInBn++;
        else if (bn && !isCleanBengaliScript(bn)) {
            console.error('[apply] FAILED — in/' + e.slug + ' final names.bn fails script guard: "' + bn + '"');
            postScriptFailures++;
        } else {
            console.error('[apply] FAILED — in/' + e.slug + ' has no names.bn after apply');
            postScriptFailures++;
        }
    }
    if (postScriptFailures > 0) process.exit(1);
    if (postInBn !== 40) {
        console.error('[apply] FAILED — post-apply IN Bengali coverage = ' + postInBn + '/40');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-BN-IN-1 — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: IN (22 BATCH-A entries only — 18 SEED-18 byte-identical)');
    L.push('**Total rows applied (names.bn)**: ' + stats.applied);
    L.push('**Total aliases.bn added**: ' + stats.aliasesAddedTotal);
    L.push('**Skipped (idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**SEED-18 mutations (must be 0)**: ' + stats.seedMutationError);
    L.push('**IN mutations to non-Bengali fields (must be 0)**: ' + stats.priorMutationError);
    L.push('**Non-IN entries mutated (must be 0)**: ' + stats.nonInMutationError);
    L.push('**Other-Indian-lang mutations (must be 0)**: ' + stats.otherLangMutationError);
    L.push('**Post-apply IN Bengali coverage**: ' + postInBn + '/40 (100%)');
    L.push('**Total curated entries (unchanged)**: ' + totalCount);
    L.push('**Total IN entries (unchanged)**: ' + inCount);
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
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-BN-IN-1 — Apply Summary ═══');
    console.log('  Applied (new names.bn):           ' + stats.applied);
    console.log('  Aliases.bn added:                 ' + stats.aliasesAddedTotal);
    console.log('  Skipped (idempotent):             ' + stats.skippedAlreadyApplied);
    console.log('  SEED-18 mutations (=0):           ' + stats.seedMutationError);
    console.log('  IN non-Bn mutations (=0):         ' + stats.priorMutationError);
    console.log('  Non-IN mutations (=0):            ' + stats.nonInMutationError);
    console.log('  Other-Indian-lang mutations (=0): ' + stats.otherLangMutationError);
    console.log('  Post-apply IN Bengali:            ' + postInBn + '/40 (100%)');
    console.log('  Total curated entries:            ' + totalCount + ' (unchanged)');
    console.log('  Total IN entries:                 ' + inCount + ' (unchanged)');
}

main();
