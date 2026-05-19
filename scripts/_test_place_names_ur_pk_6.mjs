// scripts/_test_place_names_ur_pk_6.mjs
//
// PLACE-NAMES-UR-PK-6 (Fast Track) verification — 29 PK BATCH-C cities
// now have real Urdu names.
//
// After this: PK Urdu coverage = 148/148 = 100% ⭐ (matches Arabic 148/148)

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
console.log(' PLACE-NAMES-UR-PK-6 (Fast Track) verification');
console.log('═══════════════════════════════════════════════════════════════════════');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pk = curated.filter(e => e.countryCode === 'pk');

const EXPECTED_UR = {
    'qubo-saeed-khan':     'قبو سعید خان',
    'jalalpur-jattan':     'جلال پور جٹاں',
    'daharki':             'ڈہرکی',
    'kandhkot':            'کندھ کوٹ',
    'nowshera-kalan':      'نوشہرہ کلاں',
    'chichawatni':         'چیچہ وطنی',
    'fatehjang':           'فتح جنگ',
    'alahabad':            'اللہ آباد',
    'moro':                'مورو',
    'mian-channun':        'میاں چنوں',
    'topi':                'ٹوپی',
    'pano-aqil':           'پانو عاقل',
    'harunabad':           'ہارون آباد',
    'rabwah':              'ربوہ',
    'kahror-pakka':        'کہروڑ پکا',
    'chuhar-kana':         'چوہڑ کانا',
    'shorkot':             'شور کوٹ',
    'minchinabad':         'منچن آباد',
    'shabqadar':           'شبقدر',
    'shujaabad':           'شجاع آباد',
    'haveli-lakha':        'حویلی لکھا',
    'shakargarh':          'شکر گڑھ',
    'jampur':              'جام پور',
    'hujra-shah-muqim':    'حجرہ شاہ مقیم',
    'sangla-hill':         'سانگلا ہل',
    'sharifabad':          'شریف آباد',
    'pabbi':               'پبی',
    'qabula':              'قبولا',
    'jahanian':            'جہانیاں'
};

// PART A — Disk: 29 entries have user-approved names.ur
console.log('\n── Part A — 29 BATCH-C entries have user-approved names.ur ──');
let matched = 0;
for (const [slug, expected] of Object.entries(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    if (got === expected) matched++;
}
ok('All 29 BATCH-C entries have user-approved names.ur', matched === 29, '(matched ' + matched + ' / 29)');

// Spot-check 10
for (const slug of ['daharki','jalalpur-jattan','kandhkot','nowshera-kalan','rabwah','shakargarh','jahanian','topi','mian-channun','hujra-shah-muqim']) {
    const e = pk.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    ok('pk/' + slug.padEnd(22) + ' names.ur = "' + EXPECTED_UR[slug] + '"',
        got === EXPECTED_UR[slug], '(got "' + got + '")');
}

// PART B — names.ar preserved (MAJORS-1C Arabic byte-for-byte)
console.log('\n── Part B — names.ar preserved (MAJORS-1C Arabic) ──');
const AR_EXPECTED = {
    'qubo-saeed-khan':     'قبو سعيد خان',
    'jalalpur-jattan':     'جلال بور جتان',
    'daharki':             'داهاركي',
    'kandhkot':            'كنده كوت',
    'rabwah':              'ربوة',
    'shakargarh':          'شكر غره',
    'jampur':              'جام بور',
    'hujra-shah-muqim':    'حجرة شاه مقيم',
    'shujaabad':           'شجاع آباد',
    'fatehjang':           'فاتح جانغ'
};
for (const [slug, expected] of Object.entries(AR_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    ok('pk/' + slug.padEnd(22) + ' names.ar = "' + expected + '" (MAJORS-1C preserved)',
        e && e.names && e.names.ar === expected);
}

// PART C — 119 prior PK entries unchanged (spot-check 14 across all 5 waves)
console.log('\n── Part C — 119 prior PK entries unchanged (spot-check 14) ──');
const PRIOR_UR = {
    // UR-PK-1 (10 seed)
    'karachi':         'کراچی',
    'lahore':          'لاہور',
    'rawalpindi':      'راولپنڈی',
    // UR-PK-2 (43 ASIA-1D-PK clean)
    'sargodha':        'سرگودھا',
    'bahawalnagar':    'بہاولنگر',
    'chishtian':       'چشتیاں',
    // UR-PK-3 (17 MCF)
    'gujranwala':      'گوجرانوالہ',
    'bannu':           'بنوں',
    'kharian':         'کھاریاں',
    // UR-PK-4 (20 MAJORS-1A)
    'bahawalpur':      'بہاولپور',
    'larkana':         'لاڑکانہ',
    // UR-PK-5 (29 MAJORS-1B)
    'attock-city':     'اٹک',
    'mianwali':        'میانوالی',
    'zhob':            'ژوب'
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

// PART E — SSR /ur/prayer-times-in-{slug} for 10 priority BATCH-C
console.log('\n── Part E — SSR /ur/prayer-times-in-{slug} for 10 priority ──');
const SSR_TOP = ['daharki','kandhkot','nowshera-kalan','chichawatni','rabwah','shakargarh','jahanian','topi','mian-channun','hujra-shah-muqim'];
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
const CROSS_CITIES = ['daharki','rabwah','shakargarh'];
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
    { url: '/ur/prayer-times-in-rawalpindi',    expected: 'راولپنڈی',    desc: 'PK seed UR-PK-1' },
    { url: '/ur/prayer-times-in-kohat',         expected: 'کوہاٹ',       desc: 'UR-PK-4' },
    { url: '/ur/prayer-times-in-attock-city',   expected: 'اٹک',         desc: 'UR-PK-5' },
    { url: '/prayer-times-in-bahawalpur',       expected: 'بهاولبور',    desc: 'AR MAJORS-1A' },
    { url: '/prayer-times-in-rabwah',           expected: 'ربوة',        desc: 'AR MAJORS-1C (new)' },
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

// PART H — 🏆 PK Urdu 148/148 milestone (full coverage after UR-PK-6)
console.log('\n── Part H — 🏆 PK Urdu 148/148 milestone ──');
const allPk = curated.filter(x => x.countryCode === 'pk');
const pkWithUrdu = allPk.filter(x => x.names && x.names.ur && !/^[A-Za-z]/.test(x.names.ur));
ok('PK total >= 148 (UR-PK-6 baseline; may grow via future waves)',
    allPk.length >= 148, '(got ' + allPk.length + ')');
ok('🏆 PK 148 Urdu-complete after UR-PK-6 Fast Track',
    pkWithUrdu.length >= 148, '(' + pkWithUrdu.length + ' / ' + allPk.length + ')');

// PART I — Duplicate Urdu check within PK (must be 0)
console.log('\n── Part I — 0 duplicate Urdu names within PK ──');
const urCount = new Map();
for (const e of allPk) {
    const u = e.names && e.names.ur;
    if (u) urCount.set(u, (urCount.get(u) || 0) + 1);
}
let dupUr = 0;
for (const [u, n] of urCount) if (n > 1) { console.log('  DUP-UR:', u, n); dupUr++; }
ok('0 duplicate Urdu names across 148 PK entries', dupUr === 0);

// PART J — Clean-Urdu-script validation for all 29 new Urdu names
console.log('\n── Part J — Clean-Urdu-script validation ──');
const HAS_LATIN = /[A-Za-z]/;
const HAS_ARABIC_BLOCK = /[؀-ۿݐ-ݿ]/;
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;
let cleanCount = 0;
for (const [slug, expected] of Object.entries(EXPECTED_UR)) {
    const e = pk.find(x => x.slug === slug);
    const ur = e && e.names && e.names.ur;
    const isClean = ur && !HAS_LATIN.test(ur) && !SUSPICIOUS_NON_URDU.test(ur) && HAS_ARABIC_BLOCK.test(ur);
    if (isClean) cleanCount++;
}
ok('All 29 BATCH-C names.ur pass clean-Urdu-script check', cleanCount === 29, '(got ' + cleanCount + ' / 29)');

// PART K — Aliases.ur check (must be clean script, non-empty for entries that have them)
console.log('\n── Part K — Aliases.ur clean-script validation ──');
const EXPECTED_ALIASES = {
    'jalalpur-jattan': ['جلالپور جٹاں'],
    'kandhkot':        ['کندھکوٹ'],
    'nowshera-kalan':  ['نوشہرہ کلان'],
    'chichawatni':     ['چیچا وطنی'],
    'rabwah':          ['چناب نگر'],
    'chuhar-kana':     ['چوہڑکانہ'],
    'shorkot':         ['شورکوٹ'],
    'minchinabad':     ['منچین آباد'],
    'haveli-lakha':    ['حویلی لاکھا'],
    'shakargarh':      ['شکرگڑھ'],
    'jampur':          ['جامپور'],
    'sangla-hill':     ['سنگلا ہل'],
    'qabula':          ['قبولہ']
};
let aliasMatched = 0;
for (const [slug, expectedAliases] of Object.entries(EXPECTED_ALIASES)) {
    const e = pk.find(x => x.slug === slug);
    const actual = (e && e.aliases && e.aliases.ur) || [];
    const allPresent = expectedAliases.every(a => actual.includes(a));
    if (allPresent) aliasMatched++;
}
ok('All 13 BATCH-C entries with aliases have expected aliases.ur',
    aliasMatched === 13, '(got ' + aliasMatched + ' / 13)');

const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
