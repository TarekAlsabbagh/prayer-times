// scripts/_test_asia_1d_pk_missing_ar_1a.mjs
//
// ASIA-1D-PK-MISSING-AR-MAJORS-1A verification — 20 Top-pop PK missing-ar
// majors merged with user-supplied Arabic.
//
// Tests:
//   A. Disk: 20 new PK entries; PK total = 90
//   B. Disk: each entry has user-approved names.ar
//   C. Disk: NO Latin fillchain (only ar + en)
//   D. Disk: bahawalnagar NOT touched (PPLA2 stays as merged in ASIA-1D-PK)
//   E. Disk: no pop=0 stubs in this batch; no model-town/jhang-city/upper-dir
//   F. Disk: 0 slug collisions; 0 Arabic-name collisions in PK
//   G. Search: 9 Arabic queries return correct slugs
//   H. SSR: 7 priority /prayer-times-in-{slug} pages
//   I. Regression on prior phases

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

async function search(q, lang = 'ar') {
    const r = await get('/api/search-place?q=' + encodeURIComponent(q) + '&lang=' + lang);
    try { return JSON.parse(r.body); } catch (_) { return null; }
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-PK-MISSING-AR-MAJORS-1A verification (Top 20)');
console.log('═══════════════════════════════════════════════════════════════════════');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pk = curated.filter(e => e.countryCode === 'pk');

const BATCH_A_EXPECTED = {
    'bahawalpur':       'بهاولبور',
    'dera-ismail-khan': 'ديرة إسماعيل خان',
    'battagram':        'بطغرام',
    'okara':            'أوكاره',
    'kasur':            'قصور',
    'tando-allahyar':   'تاندو اللهيار',
    'larkana':          'لاركانة',
    'nawabshah':        'نواب شاه',
    'hafizabad':        'حافظ آباد',
    'kamoke':           'كاموكي',
    'abbottabad':       'إبت آباد',
    'shikarpur':        'شكاربور',
    'shahkot':          'شاه كوت',
    'hub':              'هب',
    'garhi-khairo':     'غره خيرو',
    'khairpur-mirs':    'خيربور مير',
    'saddiqabad':       'صديق آباد',
    'burewala':         'بوريوالا',
    'arif-wala':        'عارف والا',
    'kohat':            'كوهات'
};

// PART A
console.log('\n── Part A — PK count = 90 ──');
ok('PK total = 90 entries (70 + 20 Batch A)', pk.length === 90, '(got ' + pk.length + ')');

// PART B
console.log('\n── Part B — 20 Batch A names.ar applied ──');
let matched = 0;
for (const [slug, expected] of Object.entries(BATCH_A_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ar;
    ok('pk/' + slug.padEnd(18) + ' ar = "' + expected + '"',
        got === expected,
        '(got "' + got + '")');
    if (got === expected) matched++;
}

// PART C
console.log('\n── Part C — NO Latin fillchain in 20 new entries ──');
const LANGS = ['ur','bn','fr','de','tr','id','es','ms'];
let leaks = 0;
for (const slug of Object.keys(BATCH_A_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of LANGS) {
        if (e.names && e.names[lang]) {
            console.log('  ✗ pk/' + slug + ' has names.' + lang + ' = "' + e.names[lang] + '"');
            leaks++;
        }
    }
}
ok('NO Latin fillchain in 20 entries (0 leaks across 8 locales × 20 = 160 checks)',
    leaks === 0);

let arEn = 0;
for (const slug of Object.keys(BATCH_A_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (!e || !e.names) continue;
    const keys = Object.keys(e.names).sort().join(',');
    if (keys === 'ar,en') arEn++;
}
ok('All 20 entries have names = {ar, en} only', arEn === 20, '(got ' + arEn + ' / 20)');

// PART D
console.log('\n── Part D — bahawalnagar PPLA2 (existing) untouched ──');
const bnagar = pk.find(x => x.slug === 'bahawalnagar');
ok('pk/bahawalnagar (PPLA2) names.ar = "بهاولنغر" (ASIA-1D-PK preserved)',
    bnagar && bnagar.names && bnagar.names.ar === 'بهاولنغر');
ok('pk/bahawalnagar (PPLA2) names.ur = "بہاولنگر" (UR-PK-2 preserved)',
    bnagar && bnagar.names && bnagar.names.ur === 'بہاولنگر');

// Ensure no second bahawalnagar entry exists
const bnagarCount = pk.filter(x => x.slug === 'bahawalnagar').length;
ok('Only 1 bahawalnagar entry (PPL dup was DROPPED)', bnagarCount === 1, '(got ' + bnagarCount + ')');

// PART E
console.log('\n── Part E — No out-of-scope entries ──');
const OUT_OF_SCOPE = ['model-town','jhang-city','upper-dir',
    'timargara','tolti','shigar','saidu-sharif','qila-saifullah','qila-abdullah',
    'patan','panjgur','nagir','musa-khel-bazar','malakand','khaplu','khanewal',
    'dera-allahyar','jamshoro','gandava','daggar','awaran','aliabad','alpurai',
    'dambudas','eidghah','dasu','athmuqam','hattian-bala'];
let outOfScopePresent = 0;
for (const slug of OUT_OF_SCOPE) {
    if (pk.find(x => x.slug === slug)) outOfScopePresent++;
}
ok('No out-of-scope entries merged (Batch B/C cities, model-town, pop=0 stubs)',
    outOfScopePresent === 0);

// PART F
console.log('\n── Part F — Collision check ──');
const arCount = new Map();
for (const e of pk) {
    const ar = e.names && e.names.ar;
    if (ar) arCount.set(ar, (arCount.get(ar) || 0) + 1);
}
let dupAr = 0;
for (const [ar, n] of arCount) if (n > 1) { console.log('  DUP-AR:', ar, n); dupAr++; }
ok('0 duplicate Arabic names within PK', dupAr === 0);

const slugCounts = new Map();
for (const e of curated) {
    const k = e.countryCode + '/' + e.slug;
    slugCounts.set(k, (slugCounts.get(k) || 0) + 1);
}
let dupSlugs = 0;
for (const [k, n] of slugCounts) if (n > 1) dupSlugs++;
ok('0 duplicate cc/slug pairs in curated', dupSlugs === 0);

// PART G — Search
console.log('\n── Part G — Arabic search ──');
const SEARCH_TESTS = [
    { q: 'بهاولبور',         slug: 'bahawalpur' },
    { q: 'ديرة إسماعيل خان', slug: 'dera-ismail-khan' },
    { q: 'أوكاره',           slug: 'okara' },
    { q: 'قصور',             slug: 'kasur' },
    { q: 'لاركانة',          slug: 'larkana' },
    { q: 'نواب شاه',         slug: 'nawabshah' },
    { q: 'حافظ آباد',        slug: 'hafizabad' },
    { q: 'إبت آباد',         slug: 'abbottabad' },
    { q: 'كوهات',            slug: 'kohat' }
];
for (const t of SEARCH_TESTS) {
    const data = await search(t.q, 'ar');
    const top = data && data.results && data.results[0];
    const slugMatch = top && top.slug === t.slug && top.countryCode === 'pk';
    ok('search "' + t.q + '" → pk/' + t.slug,
        slugMatch,
        top ? '(got ' + top.countryCode + '/' + top.slug + ')' : '(no results)');
}

// PART H — SSR
console.log('\n── Part H — SSR /prayer-times-in-{slug} ──');
const SSR_PRIORITY = ['bahawalpur','dera-ismail-khan','okara','kasur','larkana','abbottabad','kohat'];
for (const slug of SSR_PRIORITY) {
    const expected = BATCH_A_EXPECTED[slug];
    const r = await get('/prayer-times-in-' + slug);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/prayer-times-in-' + slug.padEnd(18) + ' seed = "' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// PART I — Regression
console.log('\n── Part I — Regression on prior phases ──');
const REGRESSION = [
    { url: '/ur/prayer-times-in-charikar',     expected: 'چاریکار',     desc: 'UR-AF-1' },
    { url: '/ur/prayer-times-in-karaj',        expected: 'کرج',          desc: 'UR-IR-1' },
    { url: '/ur/prayer-times-in-rawalpindi',   expected: 'راولپنڈی',     desc: 'PK seed' },
    { url: '/ur/prayer-times-in-bahawalnagar', expected: 'بہاولنگر',     desc: 'UR-PK-2' },
    { url: '/ur/prayer-times-in-gujranwala',   expected: 'گوجرانوالہ',   desc: 'UR-PK-3' },
    { url: '/prayer-times-in-bahawalnagar',    expected: 'بهاولنغر',     desc: 'AR ASIA-1D-PK' },
    { url: '/prayer-times-in-gujranwala',      expected: 'غوجرانوالا',   desc: 'AR PK-MCF' },
    { url: '/en/prayer-times-in-bahawalpur',   expected: 'Bahawalpur',   desc: 'EN new' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(42) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
