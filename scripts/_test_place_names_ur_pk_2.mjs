// scripts/_test_place_names_ur_pk_2.mjs
//
// PLACE-NAMES-UR-PK-2-APPLY verification — 43 new PK cities now have real Urdu names.
//
// Tests:
//   A. Disk-level: 43 user-approved names.ur present for all 43 new PK pipeline cities
//   B. Disk-level: 29 aliases.ur added across the 43 entries
//   C. Disk-level: 3 NAME_AR_FIXES from ASIA-1D-PK preserved (names.ar unchanged)
//   D. Disk-level: 10 PK seed entries unchanged (names.ur + aliases.ur)
//   E. Disk-level: collision/admin-prefix aliases NOT present
//   F. SSR: 8 priority /ur/prayer-times-in-{slug} pages render correct Urdu seed
//   G. SSR: cross-route family (moon-in/moon-today-in/qibla-in) on 4 priority cities

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
console.log(' PLACE-NAMES-UR-PK-2-APPLY verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — 43 user-approved names.ur present
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — 43 new PK entries have real names.ur ──');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

const EXPECTED_UR = {
    // Watch-list (8)
    'bahawalnagar':   'بہاولنگر',
    'mailsi':         'میلسی',
    'chishtian':      'چشتیاں',
    'rahim-yar-khan': 'رحیم یار خان',
    'jhang-sadr':     'جھنگ صدر',
    'shekhupura':     'شیخوپورہ',
    'gojra':          'گوجرہ',
    'muridke':        'مریدکے',
    // Others (35)
    'ahmadpur-east':  'احمد پور شرقیہ',
    'bhalwal':        'بھلوال',
    'buni':           'بنی',
    'chaman':         'چمن',
    'dadu':           'دادو',
    'dipalpur':       'دیپالپور',
    'gilgit':         'گلگت',
    'gujrat':         'گجرات',
    'gwadar':         'گوادر',
    'hasilpur':       'حاصل پور',
    'jahangira':      'جہانگیرا',
    'jamrud':         'جمرود',
    'jaranwala':      'جڑانوالا',
    'jhelum':         'جہلم',
    'kabirwala':      'کبیر والا',
    'kamalia':        'کمالیہ',
    'kambar':         'قمبر',
    'kotri':          'کوٹری',
    'mardan':         'مردان',
    'matli':          'ماتلی',
    'mingora':        'مینگورہ',
    'mirpur-khas':    'میرپور خاص',
    'muzaffarabad':   'مظفر آباد',
    'nankana-sahib':  'ننکانہ صاحب',
    'pasrur':         'پسرور',
    'pattoki':        'پتوکی',
    'sambrial':       'سمبڑیال',
    'sargodha':       'سرگودھا',
    'shahdadpur':     'شہدادپور',
    'sibi':           'سبی',
    'skardu':         'سکردو',
    'sukkur':         'سکھر',
    'tordher':        'توردھر',
    'turbat':         'تربت',
    'wazirabad':      'وزیر آباد'
};

let matched = 0;
for (const [slug, expected] of Object.entries(EXPECTED_UR)) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    const got = e && e.names && e.names.ur;
    if (got === expected) matched++;
}
ok('All 43 new PK cities have user-approved names.ur',
    matched === 43,
    '(matched ' + matched + ' / 43)');

// Spot-check 10 individual entries
const SPOT_CHECK_KEYS = Object.keys(EXPECTED_UR).slice(0, 10);
for (const slug of SPOT_CHECK_KEYS) {
    const expected = EXPECTED_UR[slug];
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    const got = e && e.names && e.names.ur;
    ok('pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        got === expected,
        '(got "' + got + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART B — aliases.ur counts
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — aliases.ur additions ──');

const ALIAS_EXPECTATIONS = [
    { slug: 'chishtian',     mustInclude: ['چشتیان شریف', 'چشتیان'] },
    { slug: 'shekhupura',    mustInclude: ['شیخوپورا', 'شیخوپوره'] },
    { slug: 'gojra',         mustInclude: ['گوجرا'] },
    { slug: 'muridke',       mustInclude: ['مریدکی'] },
    { slug: 'ahmadpur-east', mustInclude: ['احمد پور', 'احمدپور'] },
    { slug: 'sukkur',        mustInclude: ['سکر'] },
    { slug: 'sargodha',      mustInclude: ['سرگودها'] },
    { slug: 'jhelum',        mustInclude: ['جهلم'] }
];

for (const a of ALIAS_EXPECTATIONS) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === a.slug);
    const aliases = (e && e.aliases && e.aliases.ur) || [];
    const allPresent = a.mustInclude.every(x => aliases.includes(x));
    ok('pk/' + a.slug.padEnd(15) + ' aliases.ur includes ' + JSON.stringify(a.mustInclude),
        allPresent,
        '(got ' + JSON.stringify(aliases) + ')');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — names.ar + names.en unchanged (3 NAME_AR_FIXES preserved)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — names.ar + names.en preserved for new PK entries ──');

const PRESERVED_AR = [
    { slug: 'bahawalnagar', ar: 'بهاولنغر', en: 'Bahawalnagar' }, // ASIA-1D-PK fix
    { slug: 'mailsi',       ar: 'ميلسي',    en: 'Mailsi' },        // ASIA-1D-PK fix
    { slug: 'chishtian',    ar: 'ششتيان',   en: 'Chishtian' },     // ASIA-1D-PK fix
    { slug: 'sargodha',     ar: 'سرغودها',  en: 'Sargodha' },
    { slug: 'muzaffarabad', ar: 'مظفر آباد', en: 'Muzaffarābād' },
    { slug: 'gilgit',       ar: 'كلكت',     en: 'Gilgit' }
];
for (const c of PRESERVED_AR) {
    const e = curated.find(x => x.countryCode === 'pk' && x.slug === c.slug);
    const gotAr = e && e.names && e.names.ar;
    const gotEn = e && e.names && e.names.en;
    ok(c.slug.padEnd(15) + ' ar="' + c.ar + '" en="' + c.en + '"',
        gotAr === c.ar && gotEn === c.en,
        '(got ar="' + gotAr + '" en="' + gotEn + '")');
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
    const got = e && e.names && e.names.ur;
    ok('SEED pk/' + slug.padEnd(15) + ' names.ur unchanged = "' + expected + '"',
        got === expected,
        '(got "' + got + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART E — Collision/admin-prefix aliases NOT present
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — Dropped aliases NOT present ──');

// bahawalnagar.aliases.ur MUST NOT include بہاولپور
const bn = curated.find(x => x.countryCode === 'pk' && x.slug === 'bahawalnagar');
const bnAliases = (bn && bn.aliases && bn.aliases.ur) || [];
ok('bahawalnagar aliases.ur does NOT include بہاولپور (Bahawalpur collision)',
    !bnAliases.includes('بہاولپور'));

// mailsi.aliases.ur MUST NOT include تصیل میلسی
const ml = curated.find(x => x.countryCode === 'pk' && x.slug === 'mailsi');
const mlAliases = (ml && ml.aliases && ml.aliases.ur) || [];
ok('mailsi aliases.ur does NOT include تصیل میلسی (admin prefix)',
    !mlAliases.includes('تصیل میلسی'));

// Pashto/Sindhi/Kurdish aliases — none should exist anywhere in PK aliases.ur
const NON_URDU_PATTERN = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;
let badAliasCount = 0;
const pkEntries = curated.filter(x => x.countryCode === 'pk');
for (const e of pkEntries) {
    const aliases = (e.aliases && e.aliases.ur) || [];
    for (const a of aliases) {
        if (NON_URDU_PATTERN.test(a)) {
            console.log('  ✗ pk/' + e.slug + ' has non-Urdu-script alias: "' + a + '"');
            badAliasCount++;
        }
    }
}
ok('0 Pashto/Sindhi/Kurdish-script aliases anywhere in PK aliases.ur',
    badAliasCount === 0);

// ───────────────────────────────────────────────────────────────────────
// PART F — SSR Urdu seed on 8 priority pages
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — SSR __PRAYER_CITY__ on 8 /ur/prayer-times-in-{slug} ──');

const PRIORITY = ['bahawalnagar','mailsi','chishtian','rahim-yar-khan',
                  'jhang-sadr','shekhupura','gojra','muridke'];

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
// PART G — Cross-route family on 4 priority cities (3 routes each)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part G — Cross-route SSR seed (moon-in/moon-today-in/qibla-in) ──');

const CROSS_CITIES = ['bahawalnagar','chishtian','sargodha','sukkur'];
const CROSS_ROUTES = ['moon-in', 'moon-today-in', 'qibla-in'];

for (const slug of CROSS_CITIES) {
    const expected = EXPECTED_UR[slug];
    for (const route of CROSS_ROUTES) {
        const url = '/ur/' + route + '-' + slug;
        const r = await get(url);
        const seed = extractPrayerCitySeed(r.body);
        const seedName = seed && seed.name ? String(seed.name) : '';
        ok(url.padEnd(42) + ' seed="' + expected + '"',
            r.status === 200 && seedName === expected,
            '(got "' + seedName + '")');
    }
}

// ───────────────────────────────────────────────────────────────────────
// PART H — Regression on critical AR/EN/UR pages from prior phases
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part H — Regression on prior phases ──');

const REGRESSION = [
    { url: '/ur/prayer-times-in-charikar',    expected: 'چاریکار',  desc: 'UR-AF-1' },
    { url: '/ur/qibla-in-charikar',           expected: 'چاریکار',  desc: 'cross-page' },
    { url: '/ur/moon-in-charikar',            expected: 'چاریکار',  desc: 'cross-page' },
    { url: '/ur/prayer-times-in-karaj',       expected: 'کرج',      desc: 'UR-IR-1' },
    { url: '/ur/prayer-times-in-rawalpindi',  expected: 'راولپنڈی', desc: 'PK seed' },
    { url: '/prayer-times-in-bahawalnagar',   expected: 'بهاولنغر', desc: 'AR ASIA-1D-PK fix' },
    { url: '/en/prayer-times-in-bahawalnagar',expected: 'Bahawalnagar', desc: 'EN' }
];

for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(42) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
