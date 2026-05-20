// scripts/geodata/_place_names_hi_in_1_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-HI-IN-1 — Hindi enrichment for ALL 40 India curated entries.
//
// User decision (2026-05-20): Option A — Single APPLY wave covering all 40
//   IN entries (18 SEED + 22 BATCH-A from ASIA-1D-IN-A `2bbc575`).
//
// Sources used (per user-approved plan reports/place-names-hi-in-1-plan.md
// §3 — NO runtime translation, NO fillchain):
//   Priority 1 — GeoNames raw `alternatenames` field (clean Devanagari):
//     25 cities — 22 BATCH-A 100% + 3 SEED (new-delhi/lucknow/pune/jaipur/
//     bhopal/patna/kochi all from raw; minor cleanups via FIX where Wikipedia
//     HI canonical differs)
//   Priority 2 — Hindi Wikipedia (canonical article titles):
//     15 cities — 9 SEED absent-in-raw (hyderabad-in, chennai, bengaluru,
//     ahmedabad, surat, kanpur, indore, nagpur, srinagar) + 6 MANUAL where
//     Wikipedia HI differs from raw (mumbai, kolkata, coimbatore, meerut,
//     varanasi, prayagraj)
//
// Source breakdown (per plan §3):
//   KEEP        = 22 (GeoNames raw canonical)
//   FIX         =  3 (minor Wikipedia HI cleanup: pimpri-chinchwad,
//                     tirunelveli, faridabad)
//   MANUAL      =  6 (semantic mismatch — Wikipedia HI canonical: mumbai,
//                     kolkata, coimbatore, meerut, varanasi, prayagraj)
//   WIKIPEDIA   =  9 (not in raw — Wikipedia HI: hyderabad-in, chennai,
//                     bengaluru, ahmedabad, surat, kanpur, indore, nagpur,
//                     srinagar)
//   TOTAL       = 40
//
// Per user's apply rules (PLACE-NAMES-HI-IN-1 task spec 2026-05-20):
//   1. Target all 40 existing IN entries only — no add/delete cities
//   2. Add names.hi for every IN entry + aliases.hi only where documented
//      in plan §4
//   3. NEVER touch: names.ar, names.en, slug, coordinates, timezone,
//      countryCode, geonameId, featureCode, population, aliases.ar,
//      aliases.en, admin, priority, source, verified, type
//   4. NEVER add any Indian local lang beyond hi (no ur/bn/ta/mr/te/kn/
//      ml/gu/pa/or/as/sa)
//   5. Don't modify validate_candidates.mjs / _geonames_common.mjs /
//      normalize_places.mjs / apply_curated_candidates.mjs
//   6. Don't modify server.js / js/app.js / index.html
//   7. Strict Devanagari script guard (Unicode U+0900-U+097F only; reject
//      Latin, Bengali, Arabic, Tamil, Telugu, Kannada, Malayalam, Gujarati,
//      Gurmukhi, pure Persian/Urdu)
//   8. No runtime translation (no Google/OpenAI/Anthropic/browser translate)
//   9. No fillchain
//  10. Idempotent re-run
//  11. NOT use Brunei (bn-geonames-*) or Bangladesh (bd-geonames-*) data
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.prePlaceNamesHiIn1.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-hi-in-1-apply-report.md';

// ═══ 40 FIXES — user-approved per place-names-hi-in-1-plan.md §3 + §4 ════
const FIXES = [
    // ──── SEED-18 (entries 1-18) ────
    { slug: 'new-delhi',        hi: 'नई दिल्ली',      aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'mumbai',           hi: 'मुंबई',          aliasesHi: ['बम्बई', 'ग्रेटर मुम्बई'],            source: 'MANUAL'    },
    { slug: 'kolkata',          hi: 'कोलकाता',        aliasesHi: ['कलकत्ता'],                        source: 'MANUAL'    },
    { slug: 'hyderabad-in',     hi: 'हैदराबाद',       aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'chennai',          hi: 'चेन्नई',          aliasesHi: ['मद्रास'],                         source: 'WIKIPEDIA' },
    { slug: 'bengaluru',        hi: 'बेंगलुरु',        aliasesHi: ['बैंगलोर'],                         source: 'WIKIPEDIA' },
    { slug: 'lucknow',          hi: 'लखनऊ',          aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'ahmedabad',        hi: 'अहमदाबाद',       aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'pune',             hi: 'पुणे',           aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'jaipur',           hi: 'जयपुर',          aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'surat',            hi: 'सूरत',           aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'kanpur',           hi: 'कानपुर',         aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'indore',           hi: 'इंदौर',          aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'nagpur',           hi: 'नागपुर',         aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'bhopal',           hi: 'भोपाल',          aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'patna',            hi: 'पटना',           aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'srinagar',         hi: 'श्रीनगर',        aliasesHi: [],                                 source: 'WIKIPEDIA' },
    { slug: 'kochi',            hi: 'कोच्चि',         aliasesHi: [],                                 source: 'KEEP'      },

    // ──── BATCH-A-22 (entries 19-40) ────
    { slug: 'coimbatore',       hi: 'कोयंबटूर',       aliasesHi: ['कोइंबतूर'],                       source: 'MANUAL'    },
    { slug: 'thane',            hi: 'ठाणे',           aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'vadodara',         hi: 'वडोदरा',         aliasesHi: ['बड़ौदा', 'वड़ोदरा'],                source: 'KEEP'      },
    { slug: 'pimpri-chinchwad', hi: 'पिंपरी-चिंचवाड़', aliasesHi: ['पिंपरी चिंचवड'],                  source: 'FIX'       },
    { slug: 'nashik',           hi: 'नाशिक',          aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'madurai',          hi: 'मदुरई',          aliasesHi: ['मदुराई'],                         source: 'KEEP'      },
    { slug: 'tirunelveli',      hi: 'तिरुनेलवेली',    aliasesHi: ['तिरुनलवेली'],                    source: 'FIX'       },
    { slug: 'agra',             hi: 'आगरा',           aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'faridabad',        hi: 'फ़रीदाबाद',      aliasesHi: ['फरीदाबाद'],                       source: 'FIX'       },
    { slug: 'jamshedpur',       hi: 'जमशेदपुर',       aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'dombivali',        hi: 'डोंबिवली',       aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'meerut',           hi: 'मेरठ',           aliasesHi: ['मीरत'],                          source: 'MANUAL'    },
    { slug: 'ghaziabad',        hi: 'ग़ाज़ियाबाद',     aliasesHi: ['गाजियाबाद'],                       source: 'KEEP'      },
    { slug: 'dhanbad',          hi: 'धनबाद',          aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'aurangabad',       hi: 'औरंगाबाद',       aliasesHi: ['छत्रपति संभाजीनगर'],              source: 'KEEP'      },
    { slug: 'varanasi',         hi: 'वाराणसी',        aliasesHi: ['काशी', 'बनारस'],                  source: 'MANUAL'    },
    { slug: 'amritsar',         hi: 'अमृतसर',         aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'vijayawada',       hi: 'विजयवाड़ा',      aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'ranchi',           hi: 'राँची',          aliasesHi: [],                                 source: 'KEEP'      },
    { slug: 'prayagraj',        hi: 'प्रयागराज',      aliasesHi: ['इलाहाबाद'],                       source: 'MANUAL'    },
    { slug: 'visakhapatnam',    hi: 'विशाखपट्टणम्',   aliasesHi: ['विज़ाग'],                          source: 'KEEP'      },
    { slug: 'jodhpur',          hi: 'जोधपुर',         aliasesHi: [],                                 source: 'KEEP'      },
];

// ─── Devanagari script guard (strict per plan §5) ────────────────────────
const HAS_DEVANAGARI = /[ऀ-ॿ]/;       // U+0900-U+097F — REQUIRED
const LATIN          = /[A-Za-z]/;     // reject
const BENGALI        = /[ঀ-৿]/;        // U+0980-U+09FF — reject
const ARABIC         = /[؀-ۿ]/;        // U+0600-U+06FF — reject Arabic/Persian/Urdu
const TAMIL          = /[஀-௿]/;        // U+0B80-U+0BFF — reject
const GURMUKHI       = /[਀-੿]/;        // U+0A00-U+0A7F — reject
const GUJARATI       = /[઀-૿]/;        // U+0A80-U+0AFF — reject
const TELUGU_KANNADA = /[ఀ-ೞ]/;        // U+0C00-U+0CDE — reject
const MALAYALAM      = /[ഀ-ൿ]/;        // U+0D00-U+0D7F — reject

function isCleanHindiScript(s) {
    if (!s) return false;
    if (LATIN.test(s))           return false;
    if (BENGALI.test(s))         return false;
    if (ARABIC.test(s))          return false;
    if (TAMIL.test(s))           return false;
    if (GURMUKHI.test(s))        return false;
    if (GUJARATI.test(s))        return false;
    if (TELUGU_KANNADA.test(s))  return false;
    if (MALAYALAM.test(s))       return false;
    return HAS_DEVANAGARI.test(s);
}

// ─── 40 IN slugs targeted by this wave (exhaustive — all of IN) ──────────
const IN_TARGET_SLUGS = new Set(FIXES.map(f => f.slug));

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenHi = new Map(); // hi → slug
    for (const f of FIXES) {
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanHindiScript(f.hi)) {
            errors.push(f.slug + ' hi="' + f.hi + '" fails clean-Devanagari-script check');
        }
        if (seenHi.has(f.hi)) {
            errors.push('Duplicate Hindi name: "' + f.hi + '" between ' + seenHi.get(f.hi) + ' and ' + f.slug);
        }
        seenHi.set(f.hi, f.slug);
        for (const a of (f.aliasesHi || [])) {
            if (!isCleanHindiScript(a)) {
                errors.push(f.slug + ' alias.hi "' + a + '" fails clean-Devanagari-script check');
            }
        }
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — ' + FIXES.length +
                ' Hindi names + ' +
                FIXES.reduce((sum, f) => sum + (f.aliasesHi?.length || 0), 0) +
                ' aliases validated against strict Devanagari script guard');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    } else {
        console.log('[apply] backup already exists:', BACKUP);
    }

    const ORIGINAL_TOTAL = curated.length;

    // ─── Snapshot ALL IN pre-apply state ───
    const preApplyState = {};
    let preInCount = 0;
    for (const e of curated) {
        if (e.countryCode === 'in') {
            preInCount++;
            preApplyState[e.slug] = {
                ar:        (e.names && e.names.ar) || null,
                en:        (e.names && e.names.en) || null,
                hi:        (e.names && e.names.hi) || null,
                aliasesAr: (e.aliases && Array.isArray(e.aliases.ar)) ? e.aliases.ar.slice() : null,
                aliasesEn: (e.aliases && Array.isArray(e.aliases.en)) ? e.aliases.en.slice() : null,
                aliasesHi: (e.aliases && Array.isArray(e.aliases.hi)) ? e.aliases.hi.slice() : null,
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
                // Other-Indian-lang values must remain null/absent for FIXES targets
                otherLangs: ['ur','bn','ta','mr','te','kn','ml','gu','pa','or','as','sa']
                             .filter(l => e.names && e.names[l])
                             .map(l => l + ':' + e.names[l])
                             .join('|')
            };
        }
    }
    console.log('[apply] pre-apply snapshot: IN entries = ' + preInCount);

    // ─── Snapshot non-IN entries (we'll compare names hash post-mutation) ───
    const preNonInHash = curated
        .filter(e => e.countryCode !== 'in')
        .map(e => e.slug + '|' + e.countryCode + '|' + JSON.stringify(e.names || null) + '|' + JSON.stringify(e.aliases || null))
        .sort()
        .join('\n');

    // ─── Cross-collision check vs existing 40 IN Hindi (should be 0/40) ───
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        if (e.names && e.names.hi) {
            errors.push('PRE-APPLY: in/' + e.slug + ' already has names.hi="' + e.names.hi + '" — re-run will be idempotent, not error');
        }
    }
    // This is informational — re-run is idempotent

    const stats = {
        applied: 0,
        skippedAlreadyApplied: 0,
        slugNotFound: [],
        notInCountry: [],
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

    // ─── Apply each FIX ───
    for (const fix of FIXES) {
        const entry = inBySlug.get(fix.slug);
        if (!entry) {
            stats.slugNotFound.push(fix.slug);
            continue;
        }
        if (entry.countryCode !== 'in') {
            stats.notInCountry.push(fix.slug + ' → cc=' + entry.countryCode);
            continue;
        }
        if (entry.names && entry.names.hi === fix.hi) {
            // Still need to ensure aliases are present (idempotent merge)
            const existingAliases = Array.isArray(entry.aliases?.hi) ? entry.aliases.hi.slice() : [];
            const seen = new Set([fix.hi, ...existingAliases]);
            let aliasesAddedRow = 0;
            for (const a of (fix.aliasesHi || [])) {
                if (!seen.has(a)) {
                    existingAliases.push(a);
                    seen.add(a);
                    aliasesAddedRow++;
                }
            }
            if (existingAliases.length) {
                if (!entry.aliases) entry.aliases = {};
                entry.aliases.hi = existingAliases;
            }
            if (aliasesAddedRow === 0) {
                stats.skippedAlreadyApplied++;
                console.log('[apply] in/' + fix.slug.padEnd(20) + ' SKIP (idempotent — names.hi already = "' + fix.hi + '")');
                continue;
            }
            // Fall through: count as partial-applied for alias-only delta
            stats.aliasesAddedTotal += aliasesAddedRow;
            console.log('[apply] in/' + fix.slug.padEnd(20) + ' aliases+=' + aliasesAddedRow + ' (names.hi was already present)');
            appliedRows.push({
                slug: fix.slug, hi: fix.hi, aliasesAddedRow,
                previousHi: fix.hi, source: fix.source + ' (alias-only)'
            });
            continue;
        }

        if (!entry.names)   entry.names = {};
        if (!entry.aliases) entry.aliases = {};

        const previousHi = entry.names.hi || null;
        entry.names.hi = fix.hi;

        // Add aliases.hi (filter duplicates and existing collisions)
        const existingAliases = Array.isArray(entry.aliases.hi) ? entry.aliases.hi.slice() : [];
        const seen = new Set([fix.hi, ...existingAliases]);
        let aliasesAddedRow = 0;
        for (const a of (fix.aliasesHi || [])) {
            if (!seen.has(a)) {
                existingAliases.push(a);
                seen.add(a);
                aliasesAddedRow++;
            }
        }
        if (existingAliases.length) entry.aliases.hi = existingAliases;

        stats.applied++;
        stats.aliasesAddedTotal += aliasesAddedRow;
        appliedRows.push({
            slug: fix.slug,
            hi: fix.hi,
            aliasesAddedRow,
            previousHi,
            source: fix.source
        });
        console.log('[apply] in/' + fix.slug.padEnd(20) +
            ' names.hi: "' + (previousHi || '(absent)') + '" → "' + fix.hi + '"' +
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

    // 1. For ALL IN entries: every non-Hindi field must be unchanged
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        const before = preApplyState[e.slug];
        if (!before) {
            console.error('[apply] FAILED — IN entry in/' + e.slug + ' had no pre-snapshot (new entry added?)');
            stats.priorMutationError++;
            continue;
        }

        // names.ar / names.en / slug — MUST NEVER mutate
        const afterAr = (e.names && e.names.ar) || null;
        const afterEn = (e.names && e.names.en) || null;
        if (before.ar !== afterAr) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.ar mutated: "' + before.ar + '" → "' + afterAr + '"');
            stats.priorMutationError++;
        }
        if (before.en !== afterEn) {
            console.error('[apply] FAILED — in/' + e.slug + ' names.en mutated: "' + before.en + '" → "' + afterEn + '"');
            stats.priorMutationError++;
        }
        if (before.slug !== e.slug) {
            console.error('[apply] FAILED — in/' + e.slug + ' slug mutated: "' + before.slug + '" → "' + e.slug + '"');
            stats.priorMutationError++;
        }
        if (before.cc !== e.countryCode) {
            console.error('[apply] FAILED — in/' + e.slug + ' countryCode mutated: "' + before.cc + '" → "' + e.countryCode + '"');
            stats.priorMutationError++;
        }
        if (before.lat !== e.lat || before.lng !== e.lng) {
            console.error('[apply] FAILED — in/' + e.slug + ' coordinates mutated');
            stats.priorMutationError++;
        }
        if (before.tz !== e.timezone) {
            console.error('[apply] FAILED — in/' + e.slug + ' timezone mutated: "' + before.tz + '" → "' + e.timezone + '"');
            stats.priorMutationError++;
        }
        if (before.type !== e.type) {
            console.error('[apply] FAILED — in/' + e.slug + ' type mutated: "' + before.type + '" → "' + e.type + '"');
            stats.priorMutationError++;
        }
        if (before.priority !== e.priority) {
            console.error('[apply] FAILED — in/' + e.slug + ' priority mutated: ' + before.priority + ' → ' + e.priority);
            stats.priorMutationError++;
        }
        if (before.source !== e.source) {
            console.error('[apply] FAILED — in/' + e.slug + ' source mutated: "' + before.source + '" → "' + e.source + '"');
            stats.priorMutationError++;
        }
        if (before.verified !== e.verified) {
            console.error('[apply] FAILED — in/' + e.slug + ' verified mutated: ' + before.verified + ' → ' + e.verified);
            stats.priorMutationError++;
        }
        if (before.admin !== JSON.stringify(e.admin || null)) {
            console.error('[apply] FAILED — in/' + e.slug + ' admin mutated');
            stats.priorMutationError++;
        }
        // aliases.ar / aliases.en — MUST NEVER mutate
        const afterAliasesAr = (e.aliases && Array.isArray(e.aliases.ar)) ? e.aliases.ar : null;
        const afterAliasesEn = (e.aliases && Array.isArray(e.aliases.en)) ? e.aliases.en : null;
        if (JSON.stringify(before.aliasesAr) !== JSON.stringify(afterAliasesAr)) {
            console.error('[apply] FAILED — in/' + e.slug + ' aliases.ar mutated');
            stats.priorMutationError++;
        }
        if (JSON.stringify(before.aliasesEn) !== JSON.stringify(afterAliasesEn)) {
            console.error('[apply] FAILED — in/' + e.slug + ' aliases.en mutated');
            stats.priorMutationError++;
        }

        // 2. NO new Indian local lang added (other than hi) — must be unchanged
        const afterOtherLangs = ['ur','bn','ta','mr','te','kn','ml','gu','pa','or','as','sa']
            .filter(l => e.names && e.names[l])
            .map(l => l + ':' + e.names[l])
            .join('|');
        if (before.otherLangs !== afterOtherLangs) {
            console.error('[apply] FAILED — in/' + e.slug + ' other Indian lang mutated:');
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
        console.error('[apply] FAILED — non-IN entries hash differs (some non-IN entry was mutated)');
        stats.nonInMutationError++;
    }

    // 4. Total entries count must be unchanged
    const totalCount = curated.length;
    const inCount    = curated.filter(e => e.countryCode === 'in').length;
    if (totalCount !== ORIGINAL_TOTAL) {
        console.error('[apply] FAILED — total entries changed: expected ' + ORIGINAL_TOTAL + ', got ' + totalCount);
        process.exit(1);
    }
    if (inCount !== 40) {
        console.error('[apply] FAILED — IN count changed: expected 40, got ' + inCount);
        process.exit(1);
    }
    if (preInCount !== inCount) {
        console.error('[apply] FAILED — IN count drifted from pre-snapshot');
        process.exit(1);
    }
    if (stats.priorMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.priorMutationError + ' IN mutations to non-Hindi fields (must be 0)');
        process.exit(1);
    }
    if (stats.nonInMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.nonInMutationError + ' non-IN entries mutated (must be 0)');
        process.exit(1);
    }
    if (stats.otherLangMutationError > 0) {
        console.error('[apply] FAILED — ' + stats.otherLangMutationError + ' IN entries had other-Indian-lang mutations (must be 0)');
        process.exit(1);
    }

    // 5. After apply: 40/40 IN entries must have names.hi (clean Devanagari)
    let postInHi = 0;
    let postScriptFailures = 0;
    for (const e of curated) {
        if (e.countryCode !== 'in') continue;
        const hi = (e.names && e.names.hi) || null;
        if (hi && isCleanHindiScript(hi)) postInHi++;
        else if (hi && !isCleanHindiScript(hi)) {
            console.error('[apply] FAILED — in/' + e.slug + ' final names.hi fails script guard: "' + hi + '"');
            postScriptFailures++;
        } else {
            console.error('[apply] FAILED — in/' + e.slug + ' has no names.hi after apply');
            postScriptFailures++;
        }
    }
    if (postScriptFailures > 0) process.exit(1);
    if (postInHi !== 40) {
        console.error('[apply] FAILED — post-apply IN Hindi coverage = ' + postInHi + '/40 (expected 40/40)');
        process.exit(1);
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // ─── Audit report ───
    const L = [];
    L.push('# PLACE-NAMES-HI-IN-1 — Apply audit trail');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Country**: IN (40 entries — 18 SEED + 22 BATCH-A)');
    L.push('**Total rows applied (names.hi)**: ' + stats.applied);
    L.push('**Total aliases.hi added**: ' + stats.aliasesAddedTotal);
    L.push('**Skipped (idempotent — names.hi already match)**: ' + stats.skippedAlreadyApplied);
    L.push('**IN mutations to non-Hindi fields (must be 0)**: ' + stats.priorMutationError);
    L.push('**Non-IN entries mutated (must be 0)**: ' + stats.nonInMutationError);
    L.push('**IN entries with other-Indian-lang mutations (must be 0)**: ' + stats.otherLangMutationError);
    L.push('**Post-apply IN Hindi coverage**: ' + postInHi + '/40 (100%)');
    L.push('**Total curated entries (unchanged)**: ' + totalCount);
    L.push('**Total IN entries (unchanged)**: ' + inCount);
    L.push('');
    L.push('## Applied rows');
    L.push('');
    L.push('| slug | names.hi | aliases.hi added | source |');
    L.push('| --- | --- | ---: | --- |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.hi + ' | ' + r.aliasesAddedRow + ' | ' + r.source + ' |');
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
    L.push('- ❌ `names.ar` not modified (preserves all 40 IN Arabic from ASIA-1D-IN-A + SEED-18)');
    L.push('- ❌ `names.en` not modified');
    L.push('- ❌ `slug` not modified for any entry');
    L.push('- ❌ Other Indian local langs (ur/bn/ta/mr/te/kn/ml/gu/pa/or/as/sa) not added');
    L.push('- ❌ Non-IN entries not touched (byte-identical hash before/after)');
    L.push('- ❌ Coordinates, timezone, admin, priority, source, verified, type not modified');
    L.push('- ❌ aliases.ar / aliases.en not modified');
    L.push('- ❌ No new cities added; no cities removed');
    L.push('- ❌ No code changes (server.js, js/app.js, fillLangMap, index.html, _geonames_common.mjs, validate_candidates.mjs)');
    L.push('- ❌ No runtime translation (no Google/OpenAI/Anthropic/browser translate)');
    L.push('- ❌ No fillchain');
    L.push('- ❌ No Brunei (bn-geonames-*) data used');
    L.push('- ❌ No Bangladesh (bd-geonames-*) data used');
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-HI-IN-1 — Apply Summary ═══');
    console.log('  Applied (new names.hi):           ' + stats.applied);
    console.log('  Aliases.hi added:                 ' + stats.aliasesAddedTotal);
    console.log('  Skipped (idempotent):             ' + stats.skippedAlreadyApplied);
    console.log('  IN non-Hi mutations (=0):         ' + stats.priorMutationError);
    console.log('  Non-IN mutations (=0):            ' + stats.nonInMutationError);
    console.log('  Other-Indian-lang mutations (=0): ' + stats.otherLangMutationError);
    console.log('  Post-apply IN Hindi:              ' + postInHi + '/40 (100%)');
    console.log('  Total curated entries:            ' + totalCount + ' (unchanged)');
    console.log('  Total IN entries:                 ' + inCount + ' (unchanged)');
}

main();
