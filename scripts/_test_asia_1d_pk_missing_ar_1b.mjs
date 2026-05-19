// scripts/_test_asia_1d_pk_missing_ar_1b.mjs
// Fast Track verification — 29 PK Tier 2-3 missing-ar cities merged.

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
console.log(' ASIA-1D-PK-MISSING-AR-MAJORS-1B (Fast Track) verification');
console.log('═══════════════════════════════════════════════════════════════════════');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pk = curated.filter(e => e.countryCode === 'pk');

const BATCH_B_EXPECTED = {
    'layyah': 'ليه', 'lodhran': 'لودهران', 'khanpur': 'خانبور',
    'attock-city': 'أتوك', 'khuzdar': 'خضدار', 'manjhand': 'مانجاند',
    'bhakkar': 'بهاكر', 'narowal': 'نارووال', 'mandi-bahauddin': 'مندي بهاء الدين',
    'mianwali': 'ميانوالي', 'pakpattan': 'باكباتان', 'tando-adam': 'تاندو آدم',
    'toba-tek-singh': 'توبا تيك سينغ', 'shahdad-kot': 'شهداد كوت',
    'charsadda': 'شارسده', 'ghotki': 'غوتكي', 'phool-nagar': 'بهول ناغر',
    'tando-muhammad-khan': 'تاندو محمد خان', 'vihari': 'فيهاري',
    'dera-murad-jamali': 'ديرة مراد جمالي', 'kot-addu': 'كوت أدو',
    'khushab': 'خوشاب', 'chakwal': 'جكوال', 'swabi': 'صوابي',
    'mansehra': 'مانسهره', 'sanghar': 'سنغر', 'haripur': 'هاريبور',
    'rajanpur': 'رجن بور', 'zhob': 'زهوب'
};

// PART A
// Post-MAJORS-1C (2026-05-19): PK grew from 119 to 148 (+29 BATCH-C). Allow growth.
console.log('\n── Part A — PK count >= 119 (MAJORS-1B baseline) ──');
ok('PK total >= 119 entries (90 + 29 Batch B; may grow via later MAJORS waves)',
    pk.length >= 119, '(got ' + pk.length + ')');

// PART B — 29 names applied
console.log('\n── Part B — 29 BATCH-B names applied ──');
let matched = 0;
for (const [slug, expected] of Object.entries(BATCH_B_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (e && e.names && e.names.ar === expected) matched++;
}
ok('All 29 BATCH-B names.ar applied', matched === 29, '(matched ' + matched + ' / 29)');

// Spot-check 10
for (const slug of ['layyah','attock-city','khuzdar','mianwali','swabi','khushab','chakwal','mansehra','rajanpur','zhob']) {
    const e = pk.find(x => x.slug === slug);
    ok('pk/' + slug.padEnd(22) + ' ar = "' + BATCH_B_EXPECTED[slug] + '"',
        e && e.names && e.names.ar === BATCH_B_EXPECTED[slug],
        '(got "' + (e && e.names && e.names.ar) + '")');
}

// PART C — no Latin fillchain
// Post-PLACE-NAMES-UR-PK-5 (2026-05-19): names.ur intentionally populated for
// all 29 BATCH-B entries. Check fillchain on the OTHER 7 langs only.
console.log('\n── Part C — NO Latin fillchain ──');
const LANGS = ['bn','fr','de','tr','id','es','ms']; // ur excluded post-UR-PK-5
let leaks = 0;
for (const slug of Object.keys(BATCH_B_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of LANGS) {
        if (e.names && e.names[lang]) { console.log('  ✗', slug, lang); leaks++; }
    }
}
ok('NO Latin fillchain (0 leaks across 7 locales × 29 = 203 checks; names.ur populated by UR-PK-5)',
    leaks === 0);

let arEnUr = 0;
for (const slug of Object.keys(BATCH_B_EXPECTED)) {
    const e = pk.find(x => x.slug === slug);
    if (!e || !e.names) continue;
    const keys = Object.keys(e.names).sort().join(',');
    if (keys === 'ar,en,ur') arEnUr++;
}
ok('All 29 entries have names = {ar, en, ur} (post-UR-PK-5)', arEnUr === 29, '(got ' + arEnUr + ' / 29)');

// PART D — Excluded items
console.log('\n── Part D — Out-of-scope guards ──');
ok('model-town NOT merged', !pk.find(x => x.slug === 'model-town'));
const bnagar = pk.filter(x => x.slug === 'bahawalnagar');
ok('Only 1 bahawalnagar (no PPL dup)', bnagar.length === 1);
// No pop=0 admin stubs
const popZeroStubs = ['timargara','tolti','shigar','saidu-sharif','qila-saifullah','khaplu','jamshoro','aliabad'];
let popZeroMerged = 0;
for (const s of popZeroStubs) if (pk.find(x => x.slug === s)) popZeroMerged++;
ok('No pop=0 admin stubs merged (spot-check 8)', popZeroMerged === 0);

// PART E — 90 prior entries unchanged (spot-check)
console.log('\n── Part E — 90 prior PK entries unchanged ──');
const PRIOR_SPOT = {
    'karachi': 'کراچی', 'rawalpindi': 'راولپنڈی', 'sargodha': 'سرگودھا',
    'bahawalnagar': 'بہاولنگر', 'gujranwala': 'گوجرانوالہ', 'bahawalpur': 'بہاولپور',
    'larkana': 'لاڑکانہ', 'abbottabad': 'ایبٹ آباد'
};
for (const [slug, expected] of Object.entries(PRIOR_SPOT)) {
    const e = pk.find(x => x.slug === slug);
    ok('PRIOR pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        e && e.names && e.names.ur === expected);
}

// PART F — Arabic search
console.log('\n── Part F — Arabic search ──');
for (const [slug, ar] of [['attock-city','أتوك'],['khuzdar','خضدار'],['mianwali','ميانوالي'],['swabi','صوابي'],['chakwal','جكوال']]) {
    const data = await search(ar);
    const top = data && data.results && data.results[0];
    ok('search "' + ar + '" → pk/' + slug,
        top && top.slug === slug && top.countryCode === 'pk',
        top ? '(got ' + top.countryCode + '/' + top.slug + ')' : '(none)');
}

// PART G — SSR
console.log('\n── Part G — SSR /prayer-times-in-{slug} ──');
for (const slug of ['attock-city','khuzdar','mianwali','swabi','chakwal','mansehra','khushab']) {
    const expected = BATCH_B_EXPECTED[slug];
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
    { url: '/ur/prayer-times-in-gujranwala',    expected: 'گوجرانوالہ', desc: 'UR-PK-3' },
    { url: '/ur/prayer-times-in-sargodha',      expected: 'سرگودھا',    desc: 'UR-PK-2' },
    { url: '/prayer-times-in-bahawalpur',       expected: 'بهاولبور',   desc: 'AR MAJORS-1A' },
    { url: '/en/prayer-times-in-attock-city',   expected: 'Attock City',desc: 'EN new' }
];
for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractSeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(40) + ' [' + c.desc + '] seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
