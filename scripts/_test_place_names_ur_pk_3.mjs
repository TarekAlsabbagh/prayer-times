// scripts/_test_place_names_ur_pk_3.mjs
//
// PLACE-NAMES-UR-PK-3-APPLY verification — 17 PK MCF cities now have real Urdu names.
//
// After this phase: PK Urdu coverage = 70/70 = 100% complete ⭐
//
// Tests:
//   A. Disk: 17 user-approved names.ur present
//   B. Disk: 14 aliases.ur added
//   C. Disk: names.ar + names.en preserved (incl. 17 ASIA-1D-PK-MCF NAME_AR_FIXES)
//   D. Disk: 10 PK seed unchanged
//   E. Disk: 43 ASIA-1D-PK clean unchanged
//   F. Disk: NO Latin fillchain in names.bn/fr/de/tr/id/es/ms for the 17
//   G. SSR: 9 priority /ur/prayer-times-in-{slug} pages render correct Urdu
//   H. SSR: cross-route (moon-in/moon-today-in/qibla-in) on 3 cities
//   I. Regression on prior phases
//   J. Milestone: PK Urdu coverage = 70/70

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

function extractPrayerCitySeed(html) {
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
console.log(' PLACE-NAMES-UR-PK-3-APPLY verification (17 MCF entries)');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — 17 user-approved names.ur present
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — 17 PK MCF entries have real names.ur ──');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

const EXPECTED_UR = {
    'gujranwala':      'گوجرانوالہ',
    'bannu':           'بنوں',
    'sahiwal':         'ساہیوال',
    'dera-ghazi-khan': 'ڈیرہ غازی خان',
    'chiniot':         'چنیوٹ',
    'muzaffargarh':    'مظفر گڑھ',
    'jacobabad':       'جیکب آباد',
    'umarkot':         'عمرکوٹ',
    'new-mirpur-city': 'نیا میرپور شہر',
    'badin':           'بدین',
    'kharian':         'کھاریاں',
    'gujar-khan':      'گجر خاں',
    'lala-musa':       'لالہ موسیٰ',
    'chunian':         'چونیاں',
    'chitral':         'چترال',
    'rohri':           'روہڑی',
    'rawalakot':       'راولاکوٹ'
};

let matched = 0;
for (const [slug, expected] of Object.entries(EXPECTED_UR)) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    const got = e && e.names && e.names.ur;
    if (got === expected) matched++;
}
ok('All 17 PK MCF entries have user-approved names.ur',
    matched === 17,
    '(matched ' + matched + ' / 17)');

// Spot-check 11 watch-list entries
const WATCHLIST = [
    'gujranwala','bannu','sahiwal','dera-ghazi-khan','chiniot',
    'muzaffargarh','jacobabad','umarkot','badin','kharian','rawalakot'
];
for (const slug of WATCHLIST) {
    const expected = EXPECTED_UR[slug];
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    const got = e && e.names && e.names.ur;
    ok('pk/' + slug.padEnd(18) + ' names.ur = "' + expected + '"',
        got === expected,
        '(got "' + got + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART B — aliases.ur additions
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — aliases.ur additions ──');

const ALIAS_EXPECTATIONS = [
    { slug: 'gujranwala',      mustInclude: ['گوجرانوالا'] },
    { slug: 'sahiwal',         mustInclude: ['ساهیوال'] },
    { slug: 'dera-ghazi-khan', mustInclude: ['دیرہ غازی خان'] },
    { slug: 'chiniot',         mustInclude: ['چنیوت'] },
    { slug: 'muzaffargarh',    mustInclude: ['مظفر گرہ'] },
    { slug: 'jacobabad',       mustInclude: ['جیکب اباد'] },
    { slug: 'kharian',         mustInclude: ['کھاریان'] },
    { slug: 'rawalakot',       mustInclude: ['راولا کوٹ'] }
];
for (const a of ALIAS_EXPECTATIONS) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === a.slug);
    const aliases = (e && e.aliases && e.aliases.ur) || [];
    const allPresent = a.mustInclude.every(x => aliases.includes(x));
    ok('pk/' + a.slug.padEnd(18) + ' aliases.ur ⊇ ' + JSON.stringify(a.mustInclude),
        allPresent,
        '(got ' + JSON.stringify(aliases) + ')');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — names.ar + names.en preserved
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — names.ar + names.en preserved (17 MCF NAME_AR_FIXES) ──');

const MCF_AR_EN = [
    { slug: 'gujranwala',      ar: 'غوجرانوالا',     en: 'Gujranwala' },
    { slug: 'bannu',           ar: 'بنو',             en: 'Bannu' },
    { slug: 'sahiwal',         ar: 'ساهيوال',         en: 'Sahiwal' },
    { slug: 'dera-ghazi-khan', ar: 'ديرة غازي خان',   en: 'Dera Ghazi Khan' },
    { slug: 'umarkot',         ar: 'أمركوت',          en: 'Umarkot' },
    { slug: 'badin',           ar: 'بدين',            en: 'Badin' },
    { slug: 'kharian',         ar: 'كهاريان',         en: 'Kharian' },
    { slug: 'chunian',         ar: 'جونيان',          en: 'Chunian' },
    { slug: 'rawalakot',       ar: 'راولاكوت',        en: 'Rawalakot' }
];
for (const c of MCF_AR_EN) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === c.slug);
    const gotAr = e && e.names && e.names.ar;
    const gotEn = e && e.names && e.names.en;
    ok('pk/' + c.slug.padEnd(18) + ' ar="' + c.ar + '" en="' + c.en + '"',
        gotAr === c.ar && gotEn === c.en,
        '(ar="' + gotAr + '" en="' + gotEn + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — 10 PK seed entries unchanged
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — 10 PK seed entries unchanged ──');

const SEED_UR = {
    'karachi': 'کراچی', 'lahore': 'لاہور', 'islamabad': 'اسلام آباد',
    'rawalpindi': 'راولپنڈی', 'peshawar': 'پشاور', 'multan': 'ملتان',
    'faisalabad': 'فیصل آباد', 'quetta': 'کوئٹہ',
    'hyderabad-pk': 'حیدرآباد', 'sialkot': 'سیالکوٹ'
};
for (const [slug, expected] of Object.entries(SEED_UR)) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    ok('SEED pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        e && e.names && e.names.ur === expected);
}

// ───────────────────────────────────────────────────────────────────────
// PART E — 43 ASIA-1D-PK clean entries unchanged (spot-check 8)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — 43 ASIA-1D-PK clean entries unchanged (spot-check 8) ──');

const CLEAN_SPOT = {
    'sargodha':      'سرگودھا',
    'bahawalnagar':  'بہاولنگر',
    'chishtian':     'چشتیاں',
    'gilgit':        'گلگت',
    'muzaffarabad':  'مظفر آباد',
    'mardan':        'مردان',
    'shekhupura':    'شیخوپورہ',
    'mailsi':        'میلسی'
};
for (const [slug, expected] of Object.entries(CLEAN_SPOT)) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    ok('CLEAN pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '" (UR-PK-2 baseline)',
        e && e.names && e.names.ur === expected);
}

// ───────────────────────────────────────────────────────────────────────
// PART F — NO Latin fillchain in names.bn/fr/de/tr/id/es/ms
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — NO Latin fillchain in names.bn/fr/de/tr/id/es/ms ──');

const FILLCHAIN_LANGS = ['bn','fr','de','tr','id','es','ms']; // ur now set; check others
let fillchainLeaks = 0;
for (const slug of Object.keys(EXPECTED_UR)) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    if (!e) continue;
    for (const lang of FILLCHAIN_LANGS) {
        if (e.names && e.names[lang]) fillchainLeaks++;
    }
}
ok('NO Latin fillchain in 17 MCF entries (0 leaks across 7 locales × 17 = 119 checks)',
    fillchainLeaks === 0);

// ───────────────────────────────────────────────────────────────────────
// PART G — SSR Urdu seed on 9 priority pages
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part G — SSR Urdu seed on 9 priority /ur/prayer-times-in-{slug} ──');

const PRIORITY = ['gujranwala','bannu','sahiwal','dera-ghazi-khan','chiniot',
                  'muzaffargarh','umarkot','kharian','rawalakot'];

for (const slug of PRIORITY) {
    const expected = EXPECTED_UR[slug];
    const r = await get('/ur/prayer-times-in-' + slug);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/ur/prayer-times-in-' + slug.padEnd(18) + ' seed.name = "' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART H — Cross-route family on 3 priority cities
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part H — Cross-route SSR (moon-in/moon-today-in/qibla-in) ──');

const CROSS_CITIES = ['gujranwala','bannu','kharian'];
const CROSS_ROUTES = ['moon-in', 'moon-today-in', 'qibla-in'];

for (const slug of CROSS_CITIES) {
    const expected = EXPECTED_UR[slug];
    for (const route of CROSS_ROUTES) {
        const url = '/ur/' + route + '-' + slug;
        const r = await get(url);
        const seed = extractPrayerCitySeed(r.body);
        const seedName = seed && seed.name ? String(seed.name) : '';
        ok(url.padEnd(40) + ' seed="' + expected + '"',
            r.status === 200 && seedName === expected,
            '(got "' + seedName + '")');
    }
}

// ───────────────────────────────────────────────────────────────────────
// PART I — Regression on prior phases
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part I — Regression on prior phases ──');

const REGRESSION = [
    { url: '/ur/prayer-times-in-charikar',    expected: 'چاریکار',  desc: 'UR-AF-1' },
    { url: '/ur/prayer-times-in-karaj',       expected: 'کرج',      desc: 'UR-IR-1' },
    { url: '/ur/prayer-times-in-rawalpindi',  expected: 'راولپنڈی', desc: 'PK seed' },
    { url: '/ur/prayer-times-in-bahawalnagar',expected: 'بہاولنگر', desc: 'UR-PK-2' },
    { url: '/prayer-times-in-gujranwala',     expected: 'غوجرانوالا',desc: 'AR MCF preserved' },
    { url: '/en/prayer-times-in-gujranwala',  expected: 'Gujranwala', desc: 'EN' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(40) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART J — PK Urdu coverage milestone: 70/70 = 100% ⭐
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part J — Milestone: PK Urdu coverage = 70/70 ──');

const allPk = curated.filter(x => x.countryCode === 'pk');
const pkWithUrdu = allPk.filter(x => x.names && x.names.ur && !/^[A-Za-z]/.test(x.names.ur));
ok('PK total = 70 entries',
    allPk.length === 70,
    '(got ' + allPk.length + ')');
ok('🏆 PK Urdu-complete: ALL 70 entries have real names.ur',
    pkWithUrdu.length === 70,
    '(' + pkWithUrdu.length + ' / ' + allPk.length + ')');

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
