// scripts/_test_place_names_ur_in_1.mjs
//
// PLACE-NAMES-UR-IN-1 verification — 22 IN BATCH-A entries now have
// `names.ur` populated via Option-A single wave (SEED-18 untouched).
//
// Pure offline test against curated-places.json — no server boot needed.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-UR-IN-1 — Urdu enrichment verification (offline)');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const inEntries = curated.filter(e => e.countryCode === 'in');

// ─── Urdu script guard ──────────────────────────────────────────────────
const HAS_ARABIC_BLOCK    = /[؀-ۿݐ-ݿ]/;
const HAS_LATIN           = /[A-Za-z]/;
const DEVANAGARI          = /[ऀ-ॿ]/;
const BENGALI             = /[ঀ-৿]/;
const TAMIL               = /[஀-௿]/;
const GURMUKHI            = /[਀-੿]/;
const GUJARATI            = /[઀-૿]/;
const TELUGU_KANNADA      = /[ఀ-ೞ]/;
const MALAYALAM           = /[ഀ-ൿ]/;
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrdu(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s))           return false;
    if (DEVANAGARI.test(s))          return false;
    if (BENGALI.test(s))             return false;
    if (TAMIL.test(s))               return false;
    if (GURMUKHI.test(s))            return false;
    if (GUJARATI.test(s))            return false;
    if (TELUGU_KANNADA.test(s))      return false;
    if (MALAYALAM.test(s))           return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

// ─── Expected canonical Urdu names per plan §3 ──────────────────────────
const EXPECTED_UR = {
    // BATCH-A-22
    'coimbatore':       'کوئمبتور',
    'thane':            'تھانے',
    'vadodara':         'وڈودرا',
    'pimpri-chinchwad': 'پمپری چنچواڑ',
    'nashik':           'ناسیک',
    'madurai':          'مدورائی',
    'tirunelveli':      'تیرونلویلی',
    'agra':             'آگرہ',
    'faridabad':        'فرید آباد',
    'jamshedpur':       'جمشید پور',
    'dombivali':        'دومبیولی',
    'meerut':           'میرٹھ',
    'ghaziabad':        'غازی آباد',
    'dhanbad':          'دھنباد',
    'aurangabad':       'اورنگ آباد',
    'varanasi':         'وارانسی',
    'amritsar':         'امرتسر',
    'vijayawada':       'وجے واڑہ',
    'ranchi':           'رانچی',
    'prayagraj':        'پریاگ راج',
    'visakhapatnam':    'وشاکھاپٹنم',
    'jodhpur':          'جودھپور',
};

// ─── SEED-18 Urdu names that MUST remain byte-identical ──────────────────
const SEED_18_UR = {
    'new-delhi':    'دہلی',
    'mumbai':       'ممبئی',
    'kolkata':      'کولکاتا',
    'hyderabad-in': 'حیدرآباد',
    'chennai':      'چنئی',
    'bengaluru':    'بنگلور',
    'lucknow':      'لکھنؤ',
    'ahmedabad':    'احمد آباد',
    'pune':         'پونے',
    'jaipur':       'جے پور',
    'surat':        'سورت',
    'kanpur':       'کانپور',
    'indore':       'اندور',
    'nagpur':       'ناگپور',
    'bhopal':       'بھوپال',
    'patna':        'پٹنہ',
    'srinagar':     'سرینگر',
    'kochi':        'کوچی',
};

// ─── Group 1: Counts ────────────────────────────────────────────────────
console.log('── Group 1: Counts ──');
ok('Total curated == 2528', curated.length === 2528, '(actual: ' + curated.length + ')');
ok('IN total == 40',         inEntries.length === 40,  '(actual: ' + inEntries.length + ')');
const withUr = inEntries.filter(e => e.names && e.names.ur).length;
ok('IN with names.ur == 40', withUr === 40, '(actual: ' + withUr + '/40)');
const withAr = inEntries.filter(e => e.names && e.names.ar).length;
ok('IN with names.ar == 40 (unchanged)', withAr === 40, '(actual: ' + withAr + '/40)');
const withEn = inEntries.filter(e => e.names && e.names.en).length;
ok('IN with names.en == 40 (unchanged)', withEn === 40, '(actual: ' + withEn + '/40)');
const withHi = inEntries.filter(e => e.names && e.names.hi).length;
ok('IN with names.hi == 40 (unchanged)', withHi === 40, '(actual: ' + withHi + '/40)');

// ─── Group 2: Urdu script guard ─────────────────────────────────────────
console.log('');
console.log('── Group 2: Urdu script guard ──');
let scriptFails = 0;
for (const e of inEntries) {
    if (!e.names || !e.names.ur) continue;
    if (!isCleanUrdu(e.names.ur)) scriptFails++;
}
ok('All names.ur pass strict Urdu guard', scriptFails === 0, scriptFails > 0 ? '(' + scriptFails + ' failures)' : '');

let aliasScriptFails = 0;
let aliasCount = 0;
for (const e of inEntries) {
    if (e.aliases && Array.isArray(e.aliases.ur)) {
        for (const a of e.aliases.ur) {
            aliasCount++;
            if (!isCleanUrdu(a)) aliasScriptFails++;
        }
    }
}
ok('All aliases.ur pass strict Urdu guard (' + aliasCount + ' aliases)', aliasScriptFails === 0);

// ─── Group 3: BATCH-A-22 canonical Urdu names match plan §3 ─────────────
console.log('');
console.log('── Group 3: BATCH-A-22 canonical Urdu names match plan §3 ──');
for (const slug of Object.keys(EXPECTED_UR).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const ur = e.names && e.names.ur;
    ok('in/' + slug.padEnd(20) + ' ur = "' + EXPECTED_UR[slug] + '"', ur === EXPECTED_UR[slug],
       ur === EXPECTED_UR[slug] ? '' : '(actual: "' + ur + '")');
}

// ─── Group 4: SEED-18 names.ur byte-identical (untouched) ───────────────
console.log('');
console.log('── Group 4: SEED-18 names.ur preserved byte-identically ──');
for (const slug of Object.keys(SEED_18_UR).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const ur = e.names && e.names.ur;
    ok('in/' + slug.padEnd(20) + ' SEED ur = "' + SEED_18_UR[slug] + '"', ur === SEED_18_UR[slug],
       ur === SEED_18_UR[slug] ? '' : '(actual: "' + ur + '")');
}

// ─── Group 5: SEED-18 lang set unchanged (11-lang ar/bn/de/en/es/fr/hi/id/ms/tr/ur) ──
console.log('');
console.log('── Group 5: SEED-18 has 11-lang set (unchanged from HI-IN-1) ──');
const EXPECTED_SEED_LANGS = ['ar','bn','de','en','es','fr','hi','id','ms','tr','ur'];
for (const slug of Object.keys(SEED_18_UR).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const langs = Object.keys(e.names || {}).sort();
    ok('in/' + slug.padEnd(20) + ' langs = 11-lang set',
       JSON.stringify(langs) === JSON.stringify(EXPECTED_SEED_LANGS),
       JSON.stringify(langs) === JSON.stringify(EXPECTED_SEED_LANGS) ? '' : '(actual: [' + langs.join(',') + '])');
}

// ─── Group 6: BATCH-A-22 contains ar/en/hi/ur (may have more from later waves) ──
// Note: relaxed from strict-equal to set-inclusion to remain stable across
// subsequent BN-IN-1 / TA-IN-1 / MR-IN-1 enrichment waves which add more
// langs to these 22 entries.
console.log('');
console.log('── Group 6: BATCH-A-22 contains ar/en/hi/ur (set-inclusion; tolerates later waves) ──');
const REQUIRED_BATCH_LANGS = ['ar','en','hi','ur'];
for (const slug of Object.keys(EXPECTED_UR).sort()) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const langs = new Set(Object.keys(e.names || {}));
    const missing = REQUIRED_BATCH_LANGS.filter(l => !langs.has(l));
    ok('in/' + slug.padEnd(20) + ' includes [ar,en,hi,ur]',
       missing.length === 0,
       missing.length === 0 ? '' : '(missing: [' + missing.join(',') + '])');
}

// ─── Group 7: No other Indian local langs added ─────────────────────────
console.log('');
console.log('── Group 7: No other Indian local langs added ──');
const FORBIDDEN_LANGS = ['ta','mr','te','kn','ml','gu','pa','or','as','sa'];
for (const l of FORBIDDEN_LANGS) {
    const count = inEntries.filter(e => e.names && e.names[l]).length;
    ok('IN entries with names.' + l + ' == 0', count === 0, count > 0 ? '(actual: ' + count + ')' : '');
}

// ─── Group 8: Spot-check required aliases.ur from plan §4 ───────────────
console.log('');
console.log('── Group 8: Spot-check required aliases.ur from plan §4 ──');
const REQUIRED_ALIASES = {
    'varanasi':         ['بنارس', 'کاشی'],
    'prayagraj':        ['الہ آباد'],
    'vadodara':         ['برودا'],
    'aurangabad':       ['چھتر پتی سمبھاجی نگر'],
    'meerut':           ['میروت'],
    'visakhapatnam':    ['ویزاگ'],
    'coimbatore':       ['کویمباتور', 'کوویل'],
    'amritsar':         ['امریتسار'],
    'jamshedpur':       ['جمشیدپور'],
    'jodhpur':          ['جودپور'],
    'madurai':          ['مادورای'],
    'pimpri-chinchwad': ['پیمپری-چینچواد', 'پمپری چنچواڈ'],
    'ghaziabad':        ['غازی آباد، بھارت'],
    'thane':            ['تھانہ'],
};
for (const slug of Object.keys(REQUIRED_ALIASES)) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const aliases = (e.aliases && Array.isArray(e.aliases.ur)) ? e.aliases.ur : [];
    for (const expectedA of REQUIRED_ALIASES[slug]) {
        ok('in/' + slug.padEnd(20) + ' has alias.ur "' + expectedA + '"',
           aliases.includes(expectedA),
           aliases.includes(expectedA) ? '' : '(actual aliases.ur: ' + JSON.stringify(aliases) + ')');
    }
}

// ─── Group 9: Devanagari/Bengali contamination spot-check ───────────────
console.log('');
console.log('── Group 9: No Devanagari/Bengali/Tamil contamination in names.ur or aliases.ur ──');
let contaminations = 0;
for (const e of inEntries) {
    const ur = e.names && e.names.ur;
    if (ur && (DEVANAGARI.test(ur) || BENGALI.test(ur) || TAMIL.test(ur))) {
        contaminations++;
        console.log('  ✗ in/' + e.slug + ' names.ur has Indic-script contamination: ' + ur);
    }
    const aliases = (e.aliases && Array.isArray(e.aliases.ur)) ? e.aliases.ur : [];
    for (const a of aliases) {
        if (DEVANAGARI.test(a) || BENGALI.test(a) || TAMIL.test(a)) {
            contaminations++;
            console.log('  ✗ in/' + e.slug + ' aliases.ur has Indic-script contamination: ' + a);
        }
    }
}
ok('No Devanagari/Bengali/Tamil contamination', contaminations === 0,
   contaminations > 0 ? '(' + contaminations + ' contaminated strings)' : '');

// ─── Group 10: SEED-18 aliases.ur unchanged ─────────────────────────────
console.log('');
console.log('── Group 10: SEED-18 aliases.ur unchanged (preserve pre-existing) ──');
const SEED_PRE_ALIASES_UR = {
    'new-delhi':    ['دہلی', 'نئی دہلی'],
    'mumbai':       ['ممبئی'],
    'kolkata':      ['کولکاتا', 'کلکتہ'],
    'hyderabad-in': ['حیدرآباد'],
    'lucknow':      ['لکھنؤ'],
    'ahmedabad':    ['احمد آباد'],
};
for (const [slug, expectedAliases] of Object.entries(SEED_PRE_ALIASES_UR)) {
    const e = inEntries.find(x => x.slug === slug);
    if (!e) { ok('in/' + slug + ' exists', false); continue; }
    const aliases = (e.aliases && Array.isArray(e.aliases.ur)) ? e.aliases.ur : [];
    ok('in/' + slug.padEnd(20) + ' SEED aliases.ur = ' + JSON.stringify(expectedAliases),
       JSON.stringify(aliases) === JSON.stringify(expectedAliases),
       JSON.stringify(aliases) === JSON.stringify(expectedAliases) ? '' : '(actual: ' + JSON.stringify(aliases) + ')');
}

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
