// scripts/_test_place_names_ur_pk_4.mjs
//
// PLACE-NAMES-UR-PK-4 (Fast Track) verification — 20 PK MAJORS-1A cities
// now have real Urdu names.
//
// After this: PK Urdu coverage = 90/90 = 100% ⭐ (matches Arabic coverage)

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
console.log(' PLACE-NAMES-UR-PK-4 (Fast Track) verification');
console.log('═══════════════════════════════════════════════════════════════════════');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pk = curated.filter(e => e.countryCode === 'pk');

const EXPECTED_UR = {
    'bahawalpur':       'بہاولپور',
    'dera-ismail-khan': 'ڈیرہ اسماعیل خان',
    'battagram':        'بٹگرام',
    'okara':            'اوکاڑہ',
    'kasur':            'قصور',
    'tando-allahyar':   'ٹنڈو اللہ یار',
    'larkana':          'لاڑکانہ',
    'nawabshah':        'نواب شاہ',
    'hafizabad':        'حافظ آباد',
    'kamoke':           'کامونکی',
    'abbottabad':       'ایبٹ آباد',
    'shikarpur':        'شکارپور',
    'shahkot':          'شاہ کوٹ',
    'hub':              'ہب',
    'garhi-khairo':     'گڑھی خیرو',
    'khairpur-mirs':    'خیرپور میرس',
    'saddiqabad':       'صادق آباد',
    'burewala':         'بوریوالا',
    'arif-wala':        'عارف والا',
    'kohat':            'کوہاٹ'
};

// PART A — Disk
console.log('\n── Part A — 20 BATCH-A entries have user-approved names.ur ──');
let matched = 0;
for (const [slug, expected] of Object.entries(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    if (got === expected) matched++;
}
ok('All 20 BATCH-A entries have user-approved names.ur', matched === 20, '(matched ' + matched + ' / 20)');

// Spot-check 8
for (const slug of ['bahawalpur','dera-ismail-khan','okara','kasur','larkana','abbottabad','kohat','hub']) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    ok('pk/' + slug.padEnd(18) + ' names.ur = "' + EXPECTED_UR[slug] + '"',
        got === EXPECTED_UR[slug], '(got "' + got + '")');
}

// PART B — names.ar preserved (MAJORS-1A Arabic)
console.log('\n── Part B — names.ar preserved (MAJORS-1A Arabic) ──');
const AR_EXPECTED = {
    'bahawalpur':       'بهاولبور',
    'dera-ismail-khan': 'ديرة إسماعيل خان',
    'okara':            'أوكاره',
    'kasur':            'قصور',
    'larkana':          'لاركانة',
    'abbottabad':       'إبت آباد',
    'kohat':            'كوهات'
};
for (const [slug, expected] of Object.entries(AR_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    ok('pk/' + slug.padEnd(18) + ' names.ar = "' + expected + '" (MAJORS-1A preserved)',
        e && e.names && e.names.ar === expected);
}

// PART C — 70 prior PK entries unchanged
console.log('\n── Part C — 70 prior PK entries unchanged (spot-check 10) ──');
const PRIOR_UR = {
    'karachi': 'کراچی',
    'lahore': 'لاہور',
    'rawalpindi': 'راولپنڈی',
    'sargodha': 'سرگودھا',
    'bahawalnagar': 'بہاولنگر',
    'chishtian': 'چشتیاں',
    'gujranwala': 'گوجرانوالہ',
    'bannu': 'بنوں',
    'kharian': 'کھاریاں',
    'chunian': 'چونیاں'
};
for (const [slug, expected] of Object.entries(PRIOR_UR)) {
    const e = pk.find(x => x.slug === slug);
    ok('PRIOR pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        e && e.names && e.names.ur === expected);
}

// PART D — NO Latin fillchain
console.log('\n── Part D — NO Latin fillchain in 20 entries ──');
const LANGS = ['bn','fr','de','tr','id','es','ms'];
let leaks = 0;
for (const slug of Object.keys(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of LANGS) {
        if (e.names && e.names[lang]) { console.log('  ✗', slug, 'has names.' + lang); leaks++; }
    }
}
ok('NO Latin fillchain in 7 locales × 20 entries = 140 checks', leaks === 0);

let arEnUr = 0;
for (const slug of Object.keys(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    if (!e || !e.names) continue;
    const keys = Object.keys(e.names).sort().join(',');
    if (keys === 'ar,en,ur') arEnUr++;
}
ok('All 20 entries have names = {ar, en, ur}', arEnUr === 20, '(got ' + arEnUr + ' / 20)');

// PART E — SSR on top 7 priority
console.log('\n── Part E — SSR /ur/prayer-times-in-{slug} for 7 priority ──');
const SSR_TOP = ['bahawalpur','dera-ismail-khan','okara','kasur','larkana','abbottabad','kohat'];
for (const slug of SSR_TOP) {
    const expected = EXPECTED_UR[slug];
    const r = await get('/ur/prayer-times-in-' + slug);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/ur/prayer-times-in-' + slug.padEnd(18) + ' seed = "' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// PART F — Cross-route (moon-in/moon-today-in/qibla-in) on 3 cities
console.log('\n── Part F — Cross-route SSR (moon/qibla) on 3 cities ──');
const CROSS_CITIES = ['bahawalpur','larkana','abbottabad'];
for (const slug of CROSS_CITIES) {
    const expected = EXPECTED_UR[slug];
    for (const route of ['moon-in','moon-today-in','qibla-in']) {
        const url = '/ur/' + route + '-' + slug;
        const r = await get(url);
        const seed = extractSeed(r.body);
        const seedName = seed && seed.name ? String(seed.name) : '';
        ok(url.padEnd(42) + ' seed="' + expected + '"',
            r.status === 200 && seedName === expected,
            '(got "' + seedName + '")');
    }
}

// PART G — Regression
console.log('\n── Part G — Regression on prior phases ──');
const REGRESSION = [
    { url: '/ur/prayer-times-in-gujranwala',    expected: 'گوجرانوالہ',  desc: 'UR-PK-3' },
    { url: '/ur/prayer-times-in-bahawalnagar',  expected: 'بہاولنگر',    desc: 'UR-PK-2' },
    { url: '/ur/prayer-times-in-rawalpindi',    expected: 'راولپنڈی',    desc: 'PK seed' },
    { url: '/prayer-times-in-bahawalpur',       expected: 'بهاولبور',    desc: 'AR MAJORS-1A' },
    { url: '/en/prayer-times-in-bahawalpur',    expected: 'Bahawalpur',  desc: 'EN' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(42) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// PART H — 🏆 PK Urdu 90/90 milestone
console.log('\n── Part H — 🏆 PK Urdu coverage = 90/90 ──');
const allPk = curated.filter(x => x.countryCode === 'pk');
const pkWithUrdu = allPk.filter(x => x.names && x.names.ur && !/^[A-Za-z]/.test(x.names.ur));
ok('PK total = 90', allPk.length === 90, '(got ' + allPk.length + ')');
ok('🏆 PK Urdu-complete: ALL 90 have real names.ur', pkWithUrdu.length === 90, '(' + pkWithUrdu.length + ' / 90)');

const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
