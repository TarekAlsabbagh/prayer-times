// scripts/_test_asia_1d_pk_mcf.mjs
//
// ASIA-1D-PK-MCF verification — 17 blocked-major PK cities merged with
// NAME_AR_FIXES.
//
// Tests:
//   A. Disk: 17 user-approved entries present (curated total +17, PK +17)
//   B. Disk: NAME_AR_FIXES applied correctly for all 17
//   C. Disk: NO Latin fillchain (only names.ar + names.en written)
//   D. Disk: existing PK entries (10 seed + 43 ASIA-1D-PK clean) unchanged
//   E. Search: 6 critical Arabic queries return correct slugs
//   F. SSR: 10 priority /prayer-times-in-{slug} pages render correct Arabic
//   G. Regression: prior UR-PK-2 + UR-AF-1 + UR-IR-1 entries unchanged

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

async function searchPlace(query, lang = 'ar') {
    const r = await get('/api/search-place?q=' + encodeURIComponent(query) + '&lang=' + lang);
    if (r.status !== 200) return null;
    try { return JSON.parse(r.body); } catch (_) { return null; }
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-PK-MCF Stage 4 merge verification (17 cities)');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk-level: 17 new MCF entries + PK total = 70
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Curated PK count post-MCF ──');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pkEntries = curated.filter(e => e.countryCode === 'pk');

ok('PK total = 70 entries (10 seed + 43 ASIA-1D-PK clean + 17 MCF)',
    pkEntries.length === 70,
    '(got ' + pkEntries.length + ')');

const MCF_SLUGS = [
    'gujranwala','bannu','sahiwal','dera-ghazi-khan','chiniot',
    'muzaffargarh','jacobabad','umarkot','new-mirpur-city','badin',
    'kharian','gujar-khan','lala-musa','chunian','chitral','rohri','rawalakot'
];
let foundMcf = 0;
for (const slug of MCF_SLUGS) {
    if (pkEntries.find(e => e.slug === slug)) foundMcf++;
}
ok('All 17 MCF slugs present in curated',
    foundMcf === 17,
    '(found ' + foundMcf + ' / 17)');

// ───────────────────────────────────────────────────────────────────────
// PART B — NAME_AR_FIXES applied correctly
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — 17 NAME_AR_FIXES applied ──');

const FIXES_EXPECTED = {
    'gujranwala':      'غوجرانوالا',
    'bannu':           'بنو',
    'sahiwal':         'ساهيوال',
    'dera-ghazi-khan': 'ديرة غازي خان',
    'chiniot':         'جنيوت',
    'muzaffargarh':    'مظفر غره',
    'jacobabad':       'جيكب آباد',
    'umarkot':         'أمركوت',
    'new-mirpur-city': 'نيا ميربر شهر',
    'badin':           'بدين',
    'kharian':         'كهاريان',
    'gujar-khan':      'غوجر خان',
    'lala-musa':       'لاله موسي',
    'chunian':         'جونيان',
    'chitral':         'جترال',
    'rohri':           'روهري',
    'rawalakot':       'راولاكوت'
};

for (const [slug, expectedAr] of Object.entries(FIXES_EXPECTED)) {
    const e = pkEntries.find(x => x.slug === slug);
    const gotAr = e && e.names && e.names.ar;
    ok('pk/' + slug.padEnd(18) + ' names.ar = "' + expectedAr + '"',
        gotAr === expectedAr,
        '(got "' + gotAr + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — NO Latin fillchain (fillLangMap guard verified at write-time)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — NO Latin fillchain in names.X for 17 MCF entries ──');

const FILLCHAIN_LANGS = ['ur','bn','fr','de','tr','id','es','ms'];
let fillchainLeaks = 0;
for (const slug of MCF_SLUGS) {
    const e = pkEntries.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of FILLCHAIN_LANGS) {
        if (e.names && e.names[lang]) {
            console.log('  ✗ pk/' + slug + ' has names.' + lang + ' = "' + e.names[lang] + '" (FILLCHAIN LEAK)');
            fillchainLeaks++;
        }
    }
}
ok('NO Latin fillchain in 17 MCF entries (0 leaks across 8 locales × 17 = 136 checks)',
    fillchainLeaks === 0);

// All 17 should have names: {ar, en} only
let onlyArEn = 0;
for (const slug of MCF_SLUGS) {
    const e = pkEntries.find(x => x.slug === slug);
    if (!e || !e.names) continue;
    const keys = Object.keys(e.names).sort().join(',');
    if (keys === 'ar,en') onlyArEn++;
}
ok('All 17 MCF entries have names = {ar, en} only',
    onlyArEn === 17,
    '(got ' + onlyArEn + ' / 17)');

// ───────────────────────────────────────────────────────────────────────
// PART D — Existing PK entries (10 seed + 43 clean) unchanged
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — 10 seed + 43 clean entries unchanged ──');

const SEED_UR = {
    'karachi': 'کراچی', 'lahore': 'لاہور', 'islamabad': 'اسلام آباد',
    'rawalpindi': 'راولپنڈی', 'peshawar': 'پشاور', 'multan': 'ملتان',
    'faisalabad': 'فیصل آباد', 'quetta': 'کوئٹہ',
    'hyderabad-pk': 'حیدرآباد', 'sialkot': 'سیالکوٹ'
};
for (const [slug, expected] of Object.entries(SEED_UR)) {
    const e = pkEntries.find(x => x.slug === slug);
    ok('SEED pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        e && e.names && e.names.ur === expected);
}

// 5 spot-checks of ASIA-1D-PK clean entries (post-UR-PK-2)
const CLEAN_UR = {
    'sargodha': 'سرگودھا',
    'bahawalnagar': 'بہاولنگر',
    'chishtian': 'چشتیاں',
    'gilgit': 'گلگت',
    'muzaffarabad': 'مظفر آباد'
};
for (const [slug, expected] of Object.entries(CLEAN_UR)) {
    const e = pkEntries.find(x => x.slug === slug);
    ok('CLEAN pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '" (UR-PK-2)',
        e && e.names && e.names.ur === expected);
}

// ───────────────────────────────────────────────────────────────────────
// PART E — Arabic search returns correct slugs
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — Arabic search via /api/search-place ──');

const SEARCH_TESTS = [
    { q: 'غوجرانوالا',   slug: 'gujranwala' },
    { q: 'بنو',           slug: 'bannu' },
    { q: 'ديرة غازي خان', slug: 'dera-ghazi-khan' },
    { q: 'أمركوت',        slug: 'umarkot' },
    { q: 'بدين',          slug: 'badin' },
    { q: 'كهاريان',       slug: 'kharian' }
];
for (const t of SEARCH_TESTS) {
    const data = await searchPlace(t.q, 'ar');
    const top = data && data.results && data.results[0];
    const slugMatch = top && top.slug === t.slug && top.countryCode === 'pk';
    ok('search "' + t.q + '" → top = pk/' + t.slug,
        slugMatch,
        top ? '(got ' + top.countryCode + '/' + top.slug + ')' : '(no results)');
}

// ───────────────────────────────────────────────────────────────────────
// PART F — SSR Arabic seed on 10 priority pages
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — SSR /prayer-times-in-{slug} ──');

const SSR_PRIORITY = [
    'gujranwala','bannu','sahiwal','dera-ghazi-khan','chiniot',
    'muzaffargarh','jacobabad','umarkot','badin','kharian'
];
for (const slug of SSR_PRIORITY) {
    const expected = FIXES_EXPECTED[slug];
    const r = await get('/prayer-times-in-' + slug);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/prayer-times-in-' + slug.padEnd(18) + ' seed.name = "' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART G — Regression on prior phases
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part G — Regression on prior phases ──');

const REGRESSION = [
    { url: '/ur/prayer-times-in-charikar',          expected: 'چاریکار',   desc: 'UR-AF-1' },
    { url: '/ur/prayer-times-in-karaj',             expected: 'کرج',        desc: 'UR-IR-1' },
    { url: '/ur/prayer-times-in-rawalpindi',        expected: 'راولپنڈی',  desc: 'PK seed' },
    { url: '/ur/prayer-times-in-sargodha',          expected: 'سرگودھا',    desc: 'UR-PK-2' },
    { url: '/ur/prayer-times-in-bahawalnagar',      expected: 'بہاولنگر',   desc: 'UR-PK-2' },
    { url: '/prayer-times-in-bahawalnagar',         expected: 'بهاولنغر',   desc: 'AR ASIA-1D-PK' },
    { url: '/en/prayer-times-in-gujranwala',        expected: 'Gujranwala', desc: 'EN MCF' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(45) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART H — 0 slug + 0 Arabic-name collisions
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part H — 0 collisions check ──');

const slugCount = new Map();
for (const e of curated) {
    const k = e.countryCode + '/' + e.slug;
    slugCount.set(k, (slugCount.get(k) || 0) + 1);
}
let slugDups = 0;
for (const [k, n] of slugCount) if (n > 1) slugDups++;
ok('0 duplicate cc/slug pairs across whole curated', slugDups === 0);

const arInPk = new Map();
for (const e of pkEntries) {
    const ar = e.names && e.names.ar;
    if (ar) arInPk.set(ar, (arInPk.get(ar) || 0) + 1);
}
let arDups = 0;
for (const [ar, n] of arInPk) if (n > 1) arDups++;
ok('0 duplicate Arabic names within PK', arDups === 0);

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
