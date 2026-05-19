// scripts/_test_place_names_ur_pk_5.mjs
//
// PLACE-NAMES-UR-PK-5 (Fast Track) verification — 29 PK BATCH-B cities
// now have real Urdu names.
//
// After this: PK Urdu coverage = 119/119 = 100% ⭐ (matches Arabic 119/119)

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
    const m = html.match(
        /<script[^>]*id="ssr-prayer-city"[^>]*>\s*window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/i
    );
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (_) { return null; }
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-UR-PK-5 (Fast Track) verification');
console.log('═══════════════════════════════════════════════════════════════════════');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pk = curated.filter(e => e.countryCode === 'pk');

const EXPECTED_UR = {
    'layyah':              'لیہ',
    'lodhran':             'لودھراں',
    'khanpur':             'خانپور',
    'attock-city':         'اٹک',
    'khuzdar':             'خضدار',
    'manjhand':            'منجھند',
    'bhakkar':             'بھکر',
    'narowal':             'نارووال',
    'mandi-bahauddin':     'منڈی بہاؤالدین',
    'mianwali':            'میانوالی',
    'pakpattan':           'پاکپتن',
    'tando-adam':          'ٹنڈو آدم',
    'toba-tek-singh':      'ٹوبہ ٹیک سنگھ',
    'shahdad-kot':         'شہداد کوٹ',
    'charsadda':           'چارسدہ',
    'ghotki':              'گھوٹکی',
    'phool-nagar':         'پھول نگر',
    'tando-muhammad-khan': 'ٹنڈو محمد خان',
    'vihari':              'وہاڑی',
    'dera-murad-jamali':   'ڈیرہ مراد جمالی',
    'kot-addu':            'کوٹ ادو',
    'khushab':             'خوشاب',
    'chakwal':             'چکوال',
    'swabi':               'صوابی',
    'mansehra':            'مانسہرہ',
    'sanghar':             'سانگھڑ',
    'haripur':             'ہری پور',
    'rajanpur':            'راجن پور',
    'zhob':                'ژوب'
};

// PART A — Disk: 29 entries have user-approved names.ur
console.log('\n── Part A — 29 BATCH-B entries have user-approved names.ur ──');
let matched = 0;
for (const [slug, expected] of Object.entries(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    if (got === expected) matched++;
}
ok('All 29 BATCH-B entries have user-approved names.ur', matched === 29, '(matched ' + matched + ' / 29)');

// Spot-check 10
for (const slug of ['layyah','attock-city','khuzdar','mianwali','tando-adam','toba-tek-singh','vihari','swabi','sanghar','zhob']) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    ok('pk/' + slug.padEnd(22) + ' names.ur = "' + EXPECTED_UR[slug] + '"',
        got === EXPECTED_UR[slug], '(got "' + got + '")');
}

// PART B — names.ar preserved (MAJORS-1B Arabic byte-for-byte)
console.log('\n── Part B — names.ar preserved (MAJORS-1B Arabic) ──');
const AR_EXPECTED = {
    'layyah':              'ليه',
    'attock-city':         'أتوك',
    'khuzdar':             'خضدار',
    'mianwali':            'ميانوالي',
    'chakwal':             'جكوال',
    'swabi':               'صوابي',
    'mansehra':            'مانسهره',
    'zhob':                'زهوب'
};
for (const [slug, expected] of Object.entries(AR_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    ok('pk/' + slug.padEnd(22) + ' names.ar = "' + expected + '" (MAJORS-1B preserved)',
        e && e.names && e.names.ar === expected);
}

// PART C — 90 prior PK entries unchanged
console.log('\n── Part C — 90 prior PK entries unchanged (spot-check 12) ──');
const PRIOR_UR = {
    'karachi':         'کراچی',
    'lahore':          'لاہور',
    'rawalpindi':      'راولپنڈی',
    'sargodha':        'سرگودھا',
    'bahawalnagar':    'بہاولنگر',
    'chishtian':       'چشتیاں',
    'gujranwala':      'گوجرانوالہ',
    'bannu':           'بنوں',
    'kharian':         'کھاریاں',
    'chunian':         'چونیاں',
    'bahawalpur':      'بہاولپور',
    'larkana':         'لاڑکانہ'
};
for (const [slug, expected] of Object.entries(PRIOR_UR)) {
    const e = pk.find(x => x.slug === slug);
    ok('PRIOR pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        e && e.names && e.names.ur === expected);
}

// PART D — NO Latin fillchain in 29 entries
console.log('\n── Part D — NO Latin fillchain in 29 entries ──');
const LANGS = ['bn','fr','de','tr','id','es','ms'];
let leaks = 0;
for (const slug of Object.keys(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of LANGS) {
        if (e.names && e.names[lang]) { console.log('  ✗', slug, 'has names.' + lang); leaks++; }
    }
}
ok('NO Latin fillchain in 7 locales × 29 entries = 203 checks', leaks === 0);

let arEnUr = 0;
for (const slug of Object.keys(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    if (!e || !e.names) continue;
    const keys = Object.keys(e.names).sort().join(',');
    if (keys === 'ar,en,ur') arEnUr++;
}
ok('All 29 entries have names = {ar, en, ur}', arEnUr === 29, '(got ' + arEnUr + ' / 29)');

// PART E — SSR /ur/prayer-times-in-{slug} for 10 priority BATCH-B
console.log('\n── Part E — SSR /ur/prayer-times-in-{slug} for 10 priority ──');
const SSR_TOP = ['layyah','attock-city','khuzdar','mianwali','tando-adam','toba-tek-singh','chakwal','swabi','haripur','zhob'];
for (const slug of SSR_TOP) {
    const expected = EXPECTED_UR[slug];
    const r = await get('/ur/prayer-times-in-' + slug);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/ur/prayer-times-in-' + slug.padEnd(22) + ' seed = "' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// PART F — Cross-route SSR (moon-in / moon-today-in / qibla-in) on 3 cities
console.log('\n── Part F — Cross-route SSR (moon/qibla) on 3 cities ──');
const CROSS_CITIES = ['attock-city','mianwali','toba-tek-singh'];
for (const slug of CROSS_CITIES) {
    const expected = EXPECTED_UR[slug];
    for (const route of ['moon-in','moon-today-in','qibla-in']) {
        const url = '/ur/' + route + '-' + slug;
        const r = await get(url);
        const seed = extractSeed(r.body);
        const seedName = seed && seed.name ? String(seed.name) : '';
        ok(url.padEnd(46) + ' seed="' + expected + '"',
            r.status === 200 && seedName === expected,
            '(got "' + seedName + '")');
    }
}

// PART G — Regression on prior phases
console.log('\n── Part G — Regression on prior phases ──');
const REGRESSION = [
    { url: '/ur/prayer-times-in-bahawalpur',    expected: 'بہاولپور',    desc: 'UR-PK-4' },
    { url: '/ur/prayer-times-in-gujranwala',    expected: 'گوجرانوالہ',  desc: 'UR-PK-3' },
    { url: '/ur/prayer-times-in-sargodha',      expected: 'سرگودھا',     desc: 'UR-PK-2' },
    { url: '/ur/prayer-times-in-rawalpindi',    expected: 'راولپنڈی',    desc: 'PK seed UR-PK-1' },
    { url: '/prayer-times-in-bahawalpur',       expected: 'بهاولبور',    desc: 'AR MAJORS-1A' },
    { url: '/prayer-times-in-attock-city',      expected: 'أتوك',         desc: 'AR MAJORS-1B' },
    { url: '/en/prayer-times-in-bahawalpur',    expected: 'Bahawalpur',  desc: 'EN' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(46) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// PART H — 🏆 PK Urdu 119/119 milestone
console.log('\n── Part H — 🏆 PK Urdu coverage = 119/119 ──');
const allPk = curated.filter(x => x.countryCode === 'pk');
const pkWithUrdu = allPk.filter(x => x.names && x.names.ur && !/^[A-Za-z]/.test(x.names.ur));
ok('PK total = 119', allPk.length === 119, '(got ' + allPk.length + ')');
ok('🏆 PK Urdu coverage = 119/119 (100%)',
    pkWithUrdu.length === 119, '(' + pkWithUrdu.length + ' / ' + allPk.length + ')');

// PART I — Duplicate Urdu check within PK (must be 0)
console.log('\n── Part I — 0 duplicate Urdu names within PK ──');
const urCount = new Map();
for (const e of allPk) {
    const u = e.names && e.names.ur;
    if (u) urCount.set(u, (urCount.get(u) || 0) + 1);
}
let dupUr = 0;
for (const [u, n] of urCount) if (n > 1) { console.log('  DUP-UR:', u, n); dupUr++; }
ok('0 duplicate Urdu names across 119 PK entries', dupUr === 0);

const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
