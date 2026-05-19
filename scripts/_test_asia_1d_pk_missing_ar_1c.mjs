// scripts/_test_asia_1d_pk_missing_ar_1c.mjs
// Fast Track verification — 29 PK T3 missing-ar cities merged (BATCH-C).

import http from 'node:http';
import { readFileSync } from 'node:fs';

function get(path) {
    return new Promise(resolve => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}
function extractSeed(html) {
    const m = html.match(/<script[^>]*id="ssr-prayer-city"[^>]*>\s*window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/i);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (_) { return null; }
}
async function search(q) {
    const r = await get('/api/search-place?q=' + encodeURIComponent(q) + '&lang=ar');
    try { return JSON.parse(r.body); } catch (_) { return null; }
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-PK-MISSING-AR-MAJORS-1C (Fast Track) verification');
console.log('═══════════════════════════════════════════════════════════════════════');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pk = curated.filter(e => e.countryCode === 'pk');

const BATCH_C_EXPECTED = {
    'qubo-saeed-khan':     'قبو سعيد خان',
    'jalalpur-jattan':     'جلال بور جتان',
    'daharki':             'داهاركي',
    'kandhkot':            'كنده كوت',
    'nowshera-kalan':      'نوشيرا كلان',
    'chichawatni':         'جيجاواتني',
    'fatehjang':           'فاتح جانغ',
    'alahabad':            'الله آباد',
    'moro':                'مورو',
    'mian-channun':        'ميان جانون',
    'topi':                'توبي',
    'pano-aqil':           'بانو عاقل',
    'harunabad':           'هارون آباد',
    'rabwah':              'ربوة',
    'kahror-pakka':        'كاهرور باكا',
    'chuhar-kana':         'جوهار كانا',
    'shorkot':             'شور كوت',
    'minchinabad':         'مينتشين آباد',
    'shabqadar':           'شب قدر',
    'shujaabad':           'شجاع آباد',
    'haveli-lakha':        'حويلي لاكا',
    'shakargarh':          'شكر غره',
    'jampur':              'جام بور',
    'hujra-shah-muqim':    'حجرة شاه مقيم',
    'sangla-hill':         'سنغلا هيل',
    'sharifabad':          'شريف آباد',
    'pabbi':               'بابي',
    'qabula':              'قابولا',
    'jahanian':            'جهانيان'
};

// PART A — PK count growth
console.log('\n── Part A — PK count = 148 ──');
ok('PK total = 148 entries (119 + 29 BATCH-C)', pk.length === 148, '(got ' + pk.length + ')');

// PART B — 29 names applied
console.log('\n── Part B — 29 BATCH-C names applied ──');
let matched = 0;
for (const [slug, expected] of Object.entries(BATCH_C_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (e && e.names && e.names.ar === expected) matched++;
}
ok('All 29 BATCH-C names.ar applied', matched === 29, '(matched ' + matched + ' / 29)');

// Spot-check 10
for (const slug of ['qubo-saeed-khan','daharki','rabwah','shabqadar','shakargarh','hujra-shah-muqim','sangla-hill','pabbi','jahanian','alahabad']) {
    const e = pk.find(x => x.slug === slug);
    ok('pk/' + slug.padEnd(22) + ' ar = "' + BATCH_C_EXPECTED[slug] + '"',
        e && e.names && e.names.ar === BATCH_C_EXPECTED[slug],
        '(got "' + (e && e.names && e.names.ar) + '")');
}

// PART C — no Latin fillchain
// Note: post-UR-PK-6 (2026-05-19) Urdu is expected; dropped 'ur' from leak-check list.
console.log('\n── Part C — NO Latin fillchain (ur expected post-UR-PK-6) ──');
const LANGS = ['bn','fr','de','tr','id','es','ms'];
let leaks = 0;
for (const slug of Object.keys(BATCH_C_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of LANGS) {
        if (e.names && e.names[lang]) { console.log('  ✗', slug, lang); leaks++; }
    }
}
ok('NO Latin fillchain (0 leaks across 7 locales × 29 = 203 checks)', leaks === 0);

let arEnPlus = 0;
for (const slug of Object.keys(BATCH_C_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (!e || !e.names) continue;
    const keys = Object.keys(e.names).sort().join(',');
    // Post-UR-PK-6: accept {ar,en} or {ar,en,ur}
    if (keys === 'ar,en' || keys === 'ar,en,ur') arEnPlus++;
}
ok('All 29 entries have names = {ar, en} or {ar, en, ur} only', arEnPlus === 29, '(got ' + arEnPlus + ' / 29)');

// PART D — Excluded items
console.log('\n── Part D — Out-of-scope guards ──');
ok('arifwala NOT merged (Arabic dup with arif-wala)', !pk.find(x => x.slug === 'arifwala'));
ok('jhang-city NOT merged (user-excluded)', !pk.find(x => x.slug === 'jhang-city'));
ok('eidghah NOT merged (generic name)', !pk.find(x => x.slug === 'eidghah'));
ok('dambudas NOT merged (obscure stub)', !pk.find(x => x.slug === 'dambudas'));
ok('tolti NOT merged (small village)', !pk.find(x => x.slug === 'tolti'));
ok('musa-khel-bazar NOT merged (bazar suffix)', !pk.find(x => x.slug === 'musa-khel-bazar'));
ok('model-town NOT merged (generic English)', !pk.find(x => x.slug === 'model-town'));

// Verify the existing arif-wala (Balochistan, MAJORS-1A) still intact
const arifWala = pk.find(x => x.slug === 'arif-wala');
ok('Existing pk/arif-wala (MAJORS-1A) untouched',
    arifWala && arifWala.names && arifWala.names.ar === 'عارف والا');

// Spot-check 7 PPLA2 pop=0 stubs NOT merged
const stubsExcluded = ['saidu-sharif','khaplu','jamshoro','malakand','panjgur','patan','khanewal'];
let stubMerged = 0;
for (const s of stubsExcluded) if (pk.find(x => x.slug === s)) stubMerged++;
ok('All 26 PPLA2 pop=0 admin stubs NOT merged (spot-check 7)', stubMerged === 0);

// Spot-check 5 PPLA2 pop>0 admin centers NOT merged
const ppla2Excluded = ['tank','loralai','hangu','bagh','upper-dir'];
let ppla2Merged = 0;
for (const s of ppla2Excluded) if (pk.find(x => x.slug === s)) ppla2Merged++;
ok('All 21 PPLA2 pop>0 admin centers NOT merged (spot-check 5)', ppla2Merged === 0);

// PART E — 119 prior PK entries unchanged
console.log('\n── Part E — 119 prior PK entries unchanged (spot-check) ──');
const PRIOR_SPOT = {
    'karachi':    'کراچی',     // seed Urdu
    'lahore':     'لاہور',     // seed Urdu
    'rawalpindi': 'راولپنڈی',  // seed Urdu
    'bahawalpur': 'بہاولپور',  // MAJORS-1A → UR-PK-4
    'larkana':    'لاڑکانہ',   // MAJORS-1A → UR-PK-4
    'layyah':     'لیہ',       // MAJORS-1B → UR-PK-5
    'attock-city':'اٹک',       // MAJORS-1B → UR-PK-5
    'toba-tek-singh': 'ٹوبہ ٹیک سنگھ',  // MAJORS-1B → UR-PK-5
    'gujranwala': 'گوجرانوالہ' // MCF → UR-PK-3
};
for (const [slug, expected] of Object.entries(PRIOR_SPOT)) {
    const e = pk.find(x => x.slug === slug);
    ok('PRIOR pk/' + slug.padEnd(18) + ' names.ur = "' + expected + '"',
        e && e.names && e.names.ur === expected);
}

// PART F — Arabic search
console.log('\n── Part F — Arabic search ──');
for (const [slug, ar] of [['qubo-saeed-khan','قبو سعيد خان'],['rabwah','ربوة'],['shabqadar','شب قدر'],['hujra-shah-muqim','حجرة شاه مقيم'],['shakargarh','شكر غره']]) {
    const data = await search(ar);
    const top = data && data.results && data.results[0];
    ok('search "' + ar + '" → pk/' + slug,
        top && top.slug === slug && top.countryCode === 'pk',
        top ? '(got ' + top.countryCode + '/' + top.slug + ')' : '(none)');
}

// PART G — SSR
console.log('\n── Part G — SSR /prayer-times-in-{slug} ──');
for (const slug of ['qubo-saeed-khan','daharki','rabwah','shabqadar','shakargarh','hujra-shah-muqim','jahanian']) {
    const expected = BATCH_C_EXPECTED[slug];
    const r = await get('/prayer-times-in-' + slug);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/prayer-times-in-' + slug.padEnd(22) + ' seed = "' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// PART H — Regression
console.log('\n── Part H — Regression on prior phases ──');
const REGRESSION = [
    { url: '/ur/prayer-times-in-bahawalpur',    expected: 'بہاولپور',   desc: 'UR-PK-4' },
    { url: '/ur/prayer-times-in-layyah',        expected: 'لیہ',         desc: 'UR-PK-5' },
    { url: '/ur/prayer-times-in-toba-tek-singh', expected: 'ٹوبہ ٹیک سنگھ', desc: 'UR-PK-5' },
    { url: '/ur/prayer-times-in-gujranwala',    expected: 'گوجرانوالہ', desc: 'UR-PK-3' },
    { url: '/prayer-times-in-bahawalpur',       expected: 'بهاولبور',   desc: 'AR MAJORS-1A' },
    { url: '/prayer-times-in-attock-city',      expected: 'أتوك',        desc: 'AR MAJORS-1B' },
    { url: '/prayer-times-in-arif-wala',        expected: 'عارف والا',   desc: 'AR MAJORS-1A (existing)' },
    { url: '/en/prayer-times-in-rabwah',        expected: 'Rabwah',      desc: 'EN new BATCH-C' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(46) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
