// scripts/geodata/_place_names_in_b_supported_l10n_fast_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// PLACE-NAMES-IN-B-SUPPORTED-L10N-FAST — Add names.ur + names.bn to the
// 30 BATCH-B IN cities from ASIA-1D-IN-B-FAST.
//
// User-decision 2026-05-20: BATCH-B cities need ur+bn (supported UI langs)
// for proper Urdu/Bengali interface quality. NO hi/ta/mr/other Indian
// langs added (those locales not in site UI).
//
// Sources (per user spec, NO runtime translation, NO fillchain):
//   Priority 1: GeoNames raw alternateNames (with strict script guard)
//   Priority 2: Urdu/Bengali Wikipedia canonical title
//   Priority 4: Manual transliteration (last resort)
//
// Per user's apply rules:
//   1. Target only 30 BATCH-B slugs (ASIA-1D-IN-B-FAST new cities)
//   2. Add names.ur + names.bn ONLY — no hi/ta/mr/etc.
//   3. NEVER touch 40 prior IN entries (HI-IN-1/UR-IN-1/BN-IN-1 cohort)
//   4. NEVER touch names.ar / names.en / aliases / slug / coords /
//      timezone / admin / priority / geonameId / featureCode
//   5. No shared scripts / no server.js / no js/app.js / no index.html
//   6. No runtime translation
//   7. Strict Urdu + Bengali script guards
//   8. Idempotent
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.preInBSupportedL10nFast.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/place-names-in-b-supported-l10n-fast-apply-report.md';

// ═══ 30 BATCH-B FIXES — manual review of raw + Wikipedia canonical ═════════
const FIXES = [
    { slug: 'gorakhpur',       ur: 'گورکھپور',         bn: 'গোরক্ষপুর',         urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA' },
    { slug: 'raipur',          ur: 'رائے پور',         bn: 'রায়পুর',            urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'tiruchirappalli', ur: 'تیروچیراپالی',     bn: 'তিরুচিরাপল্লী',     urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'kota',            ur: 'کوٹا',              bn: 'কোটা',              urSrc: 'KEEP_RAW',  bnSrc: 'WIKIPEDIA' },
    { slug: 'sholapur',        ur: 'شولاپور',           bn: 'শোলাপুর',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA' },
    { slug: 'chandigarh',      ur: 'چنڈی گڑھ',          bn: 'চণ্ডীগড়',           urSrc: 'WIKIPEDIA', bnSrc: 'FIX_RAW'   },
    { slug: 'tiruppur',        ur: 'تیروپور',            bn: 'তিরুপ্পুর',          urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'guwahati',        ur: 'گوہاٹی',             bn: 'গুয়াহাটি',          urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'mysuru',          ur: 'میسور',              bn: 'মহীশূর',             urSrc: 'KEEP_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'salem-in',        ur: 'سالم',               bn: 'সালেম',              urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'gurugram',        ur: 'گڑگاؤں',             bn: 'গুরুগ্রাম',         urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'bhubaneswar',     ur: 'بھونیشور',           bn: 'ভুবনেশ্বর',         urSrc: 'WIKIPEDIA', bnSrc: 'KEEP_RAW'  },
    { slug: 'jalandhar',       ur: 'جالندھر',             bn: 'জলন্ধর',            urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'bhayandar',       ur: 'بھائندر',             bn: 'ভাইন্দর',           urSrc: 'FIX_RAW',   bnSrc: 'FIX_RAW'   },
    { slug: 'aligarh',         ur: 'علی گڑھ',             bn: 'আলিগড়',           urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'bareilly',        ur: 'بریلی',                bn: 'বেরেলি',           urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'moradabad',       ur: 'مراد آباد',           bn: 'মোরাদাবাদ',          urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA' },
    { slug: 'warangal',        ur: 'ورنگل',                bn: 'ওয়ারঙ্গল',         urSrc: 'KEEP_RAW',  bnSrc: 'WIKIPEDIA' },
    { slug: 'guntur',          ur: 'گنٹور',                bn: 'গুন্টুর',           urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'bikaner',         ur: 'بیکانیر',             bn: 'বিকানের',          urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA' },
    { slug: 'bhilai',          ur: 'بھلائی',               bn: 'ভিলাই',             urSrc: 'KEEP_RAW',  bnSrc: 'FIX_RAW'   },
    { slug: 'jammu',           ur: 'جموں',                  bn: 'জম্মু',             urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
    { slug: 'kozhikode',       ur: 'کوزیکوڈ',              bn: 'কোঝিকোড়',         urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'nellore',         ur: 'نیلور',                bn: 'নেল্লোর',          urSrc: 'KEEP_RAW',  bnSrc: 'FIX_RAW'   },
    { slug: 'ajmer',           ur: 'اجمیر',                bn: 'আজমির',            urSrc: 'KEEP_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'dehradun',        ur: 'ڈیرہ دون',             bn: 'দেরাদুন',           urSrc: 'KEEP_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'erode',           ur: 'ایروڈ',                 bn: 'ইরোড',              urSrc: 'FIX_RAW',   bnSrc: 'WIKIPEDIA' },
    { slug: 'ujjain',          ur: 'اجین',                  bn: 'উজ্জয়িনী',          urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'mangaluru',       ur: 'منگلور',                bn: 'ম্যাঙ্গালোর',     urSrc: 'KEEP_RAW',  bnSrc: 'PICK_RAW'  },
    { slug: 'belagavi',        ur: 'بیلگاؤم',               bn: 'বেলগাউম',          urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW'  },
];

// ─── Urdu script guard ──────────────────────────────────────────────────
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
const HAS_LATIN        = /[A-Za-z]/;
const DEVANAGARI       = /[ऀ-ॿ]/;
const BENGALI_BLOCK    = /[ঀ-৿]/;
const TAMIL            = /[஀-௿]/;
const GURMUKHI         = /[਀-੿]/;
const GUJARATI         = /[઀-૿]/;
const TELUGU_KANNADA   = /[ఀ-ೞ]/;
const MALAYALAM        = /[ഀ-ൿ]/;
const ASSAMESE_ONLY    = /[ৰৱ]/;
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrdu(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s) || DEVANAGARI.test(s) || BENGALI_BLOCK.test(s) ||
        TAMIL.test(s) || GURMUKHI.test(s) || GUJARATI.test(s) ||
        TELUGU_KANNADA.test(s) || MALAYALAM.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

function isCleanBengali(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s) || DEVANAGARI.test(s) || HAS_ARABIC_BLOCK.test(s) ||
        TAMIL.test(s) || GURMUKHI.test(s) || GUJARATI.test(s) ||
        TELUGU_KANNADA.test(s) || MALAYALAM.test(s)) return false;
    if (ASSAMESE_ONLY.test(s)) return false;
    return BENGALI_BLOCK.test(s);
}

// ─── 30 BATCH-B slugs targeted ──────────────────────────────────────────
const BATCH_B_30_SLUGS = new Set(FIXES.map(f => f.slug));

// ─── 40 prior IN slugs (must NEVER mutate) ──────────────────────────────
const IN_PRIOR_40_SLUGS = new Set([
    // SEED-18
    'new-delhi','mumbai','kolkata','hyderabad-in','chennai','bengaluru',
    'lucknow','ahmedabad','pune','jaipur','surat','kanpur','indore',
    'nagpur','bhopal','patna','srinagar','kochi',
    // BATCH-A-22
    'visakhapatnam','vijayawada','varanasi','vadodara','tirunelveli','thane',
    'ranchi','nashik','meerut','madurai','jodhpur','jamshedpur','ghaziabad',
    'faridabad','dombivali','dhanbad','coimbatore','aurangabad','amritsar',
    'prayagraj','agra','pimpri-chinchwad',
]);

function main() {
    // Pre-flight
    const errors = [];
    const seenSlugs = new Set();
    const seenUr = new Map();
    const seenBn = new Map();
    for (const f of FIXES) {
        if (IN_PRIOR_40_SLUGS.has(f.slug)) errors.push('FIXES targets PRIOR-40 slug: ' + f.slug);
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug: ' + f.slug);
        seenSlugs.add(f.slug);
        if (!isCleanUrdu(f.ur))   errors.push(f.slug + ' ur="' + f.ur + '" fails clean-Urdu-script');
        if (!isCleanBengali(f.bn)) errors.push(f.slug + ' bn="' + f.bn + '" fails clean-Bengali-script');
        if (seenUr.has(f.ur)) errors.push('Duplicate ur name: "' + f.ur + '" between ' + seenUr.get(f.ur) + ' and ' + f.slug);
        seenUr.set(f.ur, f.slug);
        if (seenBn.has(f.bn)) errors.push('Duplicate bn name: "' + f.bn + '" between ' + seenBn.get(f.bn) + ' and ' + f.slug);
        seenBn.set(f.bn, f.slug);
    }
    if (FIXES.length !== 30) errors.push('Expected 30 FIXES, got ' + FIXES.length);
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — 30 names.ur + 30 names.bn validated');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    }
    const ORIGINAL_TOTAL = curated.length;

    // Snapshot ALL IN entries pre-apply
    const preIn = new Map();
    for (const e of curated) {
        if (e.countryCode === 'in') {
            preIn.set(e.slug, {
                full: JSON.stringify(e),
                ar:        e.names?.ar,
                en:        e.names?.en,
                hi:        e.names?.hi,
                ur:        e.names?.ur,
                bn:        e.names?.bn,
                aliasesAr: JSON.stringify(e.aliases?.ar || null),
                aliasesEn: JSON.stringify(e.aliases?.en || null),
                aliasesHi: JSON.stringify(e.aliases?.hi || null),
                aliasesUr: JSON.stringify(e.aliases?.ur || null),
                aliasesBn: JSON.stringify(e.aliases?.bn || null),
                slug: e.slug,
                lat: e.lat,
                lng: e.lng,
                tz: e.timezone,
                priority: e.priority,
                admin: JSON.stringify(e.admin || null),
            });
        }
    }

    // Snapshot non-IN
    const preNonInHash = curated
        .filter(e => e.countryCode !== 'in')
        .map(e => JSON.stringify(e))
        .sort()
        .join('\n');

    const stats = { applied: 0, skippedAlreadyApplied: 0 };
    const appliedRows = [];

    // Apply each FIX
    for (const fix of FIXES) {
        const entry = curated.find(e => e.slug === fix.slug && e.countryCode === 'in');
        if (!entry) {
            console.error('[apply] FAILED — slug not found: in/' + fix.slug);
            process.exit(1);
        }
        if (entry.names?.ur === fix.ur && entry.names?.bn === fix.bn) {
            stats.skippedAlreadyApplied++;
            console.log('[apply] in/' + fix.slug.padEnd(20) + ' SKIP (idempotent)');
            continue;
        }
        if (!entry.names) entry.names = {};
        const prevUr = entry.names.ur;
        const prevBn = entry.names.bn;
        entry.names.ur = fix.ur;
        entry.names.bn = fix.bn;
        stats.applied++;
        appliedRows.push({ slug: fix.slug, ur: fix.ur, bn: fix.bn, urSrc: fix.urSrc, bnSrc: fix.bnSrc });
        console.log('[apply] in/' + fix.slug.padEnd(20) + ' ur="' + fix.ur + '" bn="' + fix.bn + '"');
    }

    // ─── Post-apply assertions ───

    // 1. PRIOR-40 byte-identical
    let priorMutations = 0;
    for (const slug of IN_PRIOR_40_SLUGS) {
        const e = curated.find(x => x.slug === slug && x.countryCode === 'in');
        if (!e) { console.error('[apply] FAILED — PRIOR-40 slug missing: ' + slug); priorMutations++; continue; }
        const before = preIn.get(slug);
        if (before.full !== JSON.stringify(e)) {
            console.error('[apply] FAILED — PRIOR-40 mutation: in/' + slug);
            priorMutations++;
        }
    }
    if (priorMutations > 0) {
        console.error('[apply] FAILED — ' + priorMutations + ' PRIOR-40 mutations');
        process.exit(1);
    }
    console.log('[apply] PRIOR-40 byte-identity OK');

    // 2. BATCH-B entries: only names.ur + names.bn added; other fields unchanged
    let batchInvariantFails = 0;
    for (const slug of BATCH_B_30_SLUGS) {
        const e = curated.find(x => x.slug === slug && x.countryCode === 'in');
        if (!e) { console.error('[apply] FAILED — BATCH-B slug missing: ' + slug); batchInvariantFails++; continue; }
        const before = preIn.get(slug);
        if (before.ar !== e.names?.ar) { console.error('  ✗ ' + slug + ' names.ar mutated'); batchInvariantFails++; }
        if (before.en !== e.names?.en) { console.error('  ✗ ' + slug + ' names.en mutated'); batchInvariantFails++; }
        if (before.hi !== e.names?.hi) { console.error('  ✗ ' + slug + ' names.hi mutated'); batchInvariantFails++; }
        if (before.aliasesAr !== JSON.stringify(e.aliases?.ar || null)) { console.error('  ✗ ' + slug + ' aliases.ar mutated'); batchInvariantFails++; }
        if (before.aliasesEn !== JSON.stringify(e.aliases?.en || null)) { console.error('  ✗ ' + slug + ' aliases.en mutated'); batchInvariantFails++; }
        if (before.aliasesHi !== JSON.stringify(e.aliases?.hi || null)) { console.error('  ✗ ' + slug + ' aliases.hi mutated'); batchInvariantFails++; }
        if (before.slug !== e.slug) { console.error('  ✗ ' + slug + ' slug mutated'); batchInvariantFails++; }
        if (before.lat !== e.lat || before.lng !== e.lng) { console.error('  ✗ ' + slug + ' coords mutated'); batchInvariantFails++; }
        if (before.tz !== e.timezone) { console.error('  ✗ ' + slug + ' timezone mutated'); batchInvariantFails++; }
        if (before.priority !== e.priority) { console.error('  ✗ ' + slug + ' priority mutated'); batchInvariantFails++; }
        if (before.admin !== JSON.stringify(e.admin || null)) { console.error('  ✗ ' + slug + ' admin mutated'); batchInvariantFails++; }
        // No other Indian-lang names added
        for (const l of ['hi','ta','mr','te','kn','ml','gu','pa','or','as','sa']) {
            if (e.names && e.names[l] && before[l] !== e.names[l]) {
                console.error('  ✗ ' + slug + ' names.' + l + ' added (forbidden)');
                batchInvariantFails++;
            }
        }
    }
    if (batchInvariantFails > 0) {
        console.error('[apply] FAILED — ' + batchInvariantFails + ' BATCH-B invariant violations');
        process.exit(1);
    }
    console.log('[apply] BATCH-B invariants OK');

    // 3. Non-IN byte-identical
    const postNonInHash = curated
        .filter(e => e.countryCode !== 'in')
        .map(e => JSON.stringify(e))
        .sort()
        .join('\n');
    if (preNonInHash !== postNonInHash) {
        console.error('[apply] FAILED — non-IN entries mutated');
        process.exit(1);
    }
    console.log('[apply] non-IN byte-identity OK');

    // 4. Counts unchanged
    if (curated.length !== ORIGINAL_TOTAL) {
        console.error('[apply] FAILED — total count changed');
        process.exit(1);
    }
    const inCount = curated.filter(e => e.countryCode === 'in').length;
    if (inCount !== 70) {
        console.error('[apply] FAILED — IN count != 70: ' + inCount);
        process.exit(1);
    }

    // 5. All BATCH-B have names.ar + names.en + names.ur + names.bn (4 langs)
    let batch4langFails = 0;
    for (const slug of BATCH_B_30_SLUGS) {
        const e = curated.find(x => x.slug === slug && x.countryCode === 'in');
        const langs = Object.keys(e.names || {}).sort();
        if (JSON.stringify(langs) !== JSON.stringify(['ar','bn','en','ur'])) {
            console.error('  ✗ ' + slug + ' langs = ' + langs.join(',') + ' (expected ar/bn/en/ur)');
            batch4langFails++;
        }
    }
    if (batch4langFails > 0) process.exit(1);

    // 6. Final IN coverage stats
    const inEntries = curated.filter(e => e.countryCode === 'in');
    const finalAr = inEntries.filter(e => e.names?.ar).length;
    const finalEn = inEntries.filter(e => e.names?.en).length;
    const finalHi = inEntries.filter(e => e.names?.hi).length;
    const finalUr = inEntries.filter(e => e.names?.ur).length;
    const finalBn = inEntries.filter(e => e.names?.bn).length;

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // Audit report
    const L = [];
    L.push('# PLACE-NAMES-IN-B-SUPPORTED-L10N-FAST — Apply audit');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Applied (new names.ur + names.bn)**: ' + stats.applied);
    L.push('**Skipped (idempotent)**: ' + stats.skippedAlreadyApplied);
    L.push('**PRIOR-40 mutations (must be 0)**: ' + priorMutations);
    L.push('**Non-IN mutations (must be 0)**: 0');
    L.push('**BATCH-B invariant violations (must be 0)**: ' + batchInvariantFails);
    L.push('**IN total**: ' + inCount + ' (unchanged)');
    L.push('**IN ar coverage**: ' + finalAr + '/70');
    L.push('**IN en coverage**: ' + finalEn + '/70');
    L.push('**IN hi coverage**: ' + finalHi + '/70 (HI-IN-1 cohort unchanged)');
    L.push('**IN ur coverage**: ' + finalUr + '/70 (40 prior + 30 BATCH-B)');
    L.push('**IN bn coverage**: ' + finalBn + '/70 (40 prior + 30 BATCH-B)');
    L.push('');
    L.push('## Applied rows');
    L.push('');
    L.push('| slug | names.ur | names.bn | ur source | bn source |');
    L.push('| --- | --- | --- | --- | --- |');
    appliedRows.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const r of appliedRows) {
        L.push('| `' + r.slug + '` | ' + r.ur + ' | ' + r.bn + ' | ' + r.urSrc + ' | ' + r.bnSrc + ' |');
    }
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ PLACE-NAMES-IN-B-SUPPORTED-L10N-FAST — Summary ═══');
    console.log('  Applied (ur+bn):              ' + stats.applied);
    console.log('  PRIOR-40 mutations (=0):      ' + priorMutations);
    console.log('  BATCH-B invariant fails (=0): ' + batchInvariantFails);
    console.log('  IN coverage: ar=' + finalAr + ' en=' + finalEn + ' hi=' + finalHi + ' ur=' + finalUr + ' bn=' + finalBn + ' / 70');
    console.log('  Total curated: ' + curated.length + ' (unchanged)');
}

main();
