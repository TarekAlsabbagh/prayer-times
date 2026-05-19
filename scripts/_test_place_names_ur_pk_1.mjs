// scripts/_test_place_names_ur_pk_1.mjs
//
// PLACE-NAMES-UR-PK-1-APPLY verification — 3 new aliases.ur added to PK cities.
//
// User decision: Option B alias enrichment only. NOT pipeline names.ur (all 10 PK
// entries already had real Urdu in the original seed).
//
// This test covers:
//   A. Disk-level: 3 user-approved aliases.ur present in curated_places.json.
//   B. Disk-level: 10 PK names.ur unchanged from pre-apply baseline.
//   C. Disk-level: names.ar + names.en unchanged for PK.
//   D. Search: searching the 3 new aliases via /api/search-place returns the
//      correct slug (rawalpindi / faisalabad / hyderabad-pk).
//   E. SSR: 6 /ur/prayer-times-in-{slug} pages still render the correct Urdu
//      name in __PRAYER_CITY__.name (regression).
//   F. Out-of-scope guard: NO new PK cities added (Bahawalpur/Gujranwala/etc.
//      should NOT appear in curated).

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

async function searchPlace(query, lang = 'ur') {
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
console.log(' PLACE-NAMES-UR-PK-1-APPLY verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — 3 new aliases.ur present in curated
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk-level: 3 new aliases.ur present ──');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

const ALIAS_EXPECTED = [
    { slug: 'rawalpindi',   alias: 'پنڈی' },
    { slug: 'faisalabad',   alias: 'لائلپور' },
    { slug: 'hyderabad-pk', alias: 'حیدر آباد' }
];

for (const e of ALIAS_EXPECTED) {
    const entry = curated.find(x => x.countryCode === 'pk' && x.slug === e.slug);
    const aliases = entry && entry.aliases && entry.aliases.ur ? entry.aliases.ur : [];
    ok('pk/' + e.slug.padEnd(15) + ' aliases.ur contains "' + e.alias + '"',
        aliases.includes(e.alias),
        '(aliases.ur=' + JSON.stringify(aliases) + ')');
}

// ───────────────────────────────────────────────────────────────────────
// PART B — 10 PK names.ur unchanged
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — 10 PK names.ur unchanged from seed ──');

const SEED_NAMES_UR = {
    'karachi':       'کراچی',
    'lahore':        'لاہور',
    'islamabad':     'اسلام آباد',
    'rawalpindi':    'راولپنڈی',
    'peshawar':      'پشاور',
    'multan':        'ملتان',
    'faisalabad':    'فیصل آباد',
    'quetta':        'کوئٹہ',
    'hyderabad-pk':  'حیدرآباد',
    'sialkot':       'سیالکوٹ'
};

for (const [slug, expected] of Object.entries(SEED_NAMES_UR)) {
    const entry = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    const got = entry && entry.names && entry.names.ur;
    ok('pk/' + slug.padEnd(15) + ' names.ur = "' + expected + '"',
        got === expected,
        '(got "' + got + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — names.ar + names.en unchanged
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — names.ar + names.en unchanged for PK ──');

const PK_AR_EN = [
    { slug: 'karachi',       ar: 'كراتشي',     en: 'Karachi' },
    { slug: 'lahore',        ar: 'لاهور',      en: 'Lahore' },
    { slug: 'islamabad',     ar: 'إسلام آباد', en: 'Islamabad' },
    { slug: 'rawalpindi',    ar: 'روالبندي',   en: 'Rawalpindi' },
    { slug: 'peshawar',      ar: 'بيشاور',     en: 'Peshawar' },
    { slug: 'multan',        ar: 'ملتان',      en: 'Multan' },
    { slug: 'faisalabad',    ar: 'فيصل آباد',  en: 'Faisalabad' },
    { slug: 'quetta',        ar: 'كويتا',      en: 'Quetta' },
    { slug: 'hyderabad-pk',  ar: 'حيدر آباد',  en: 'Hyderabad' },
    { slug: 'sialkot',       ar: 'سيالكوت',    en: 'Sialkot' }
];

for (const c of PK_AR_EN) {
    const entry = curated.find(x => x.countryCode === 'pk' && x.slug === c.slug);
    const gotAr = entry && entry.names && entry.names.ar;
    const gotEn = entry && entry.names && entry.names.en;
    ok(c.slug.padEnd(15) + ' ar+en byte-for-byte intact',
        gotAr === c.ar && gotEn === c.en,
        '(ar="' + gotAr + '" en="' + gotEn + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — Search the 3 new aliases via /api/search-place
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — Search alias coverage via /api/search-place ──');

for (const e of ALIAS_EXPECTED) {
    const data = await searchPlace(e.alias, 'ur');
    const results = data && data.results ? data.results : [];
    const top = results[0] || null;
    const slugMatch = top && top.slug === e.slug && top.countryCode === 'pk';
    ok('search "' + e.alias + '" → top result pk/' + e.slug,
        slugMatch,
        top ? '(got ' + (top.countryCode || '?') + '/' + (top.slug || '?') + ')' : '(no results)');
}

// ───────────────────────────────────────────────────────────────────────
// PART E — Regression: 6 /ur/prayer-times-in-{slug} pages
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — Regression on 6 /ur/prayer-times-in-{slug} pages ──');

const REGRESSION_PAGES = [
    'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'hyderabad-pk'
];

for (const slug of REGRESSION_PAGES) {
    const expectedUr = SEED_NAMES_UR[slug];
    const r = await get('/ur/prayer-times-in-' + slug);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/ur/prayer-times-in-' + slug.padEnd(15) + ' seed.name = "' + expectedUr + '"',
        r.status === 200 && seedName === expectedUr,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART F — Out-of-scope guard: no new PK cities added
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — Out-of-scope guard: no new PK cities ──');

// CURATED-GEODATA-ASIA-1D-PK (commit hash TBD, 2026-05-19) added 43 new
// PK cities (Stage 4 merge with 3 NAME_AR_FIXES). PK count is now 53.
// Update assertions to reflect post-ASIA-1D-PK state.
const pkCount = curated.filter(x => x.countryCode === 'pk').length;
ok('PK entry count >= 10 (UR-PK-1 baseline; may grow via ASIA-1D-PK)',
    pkCount >= 10,
    '(got ' + pkCount + ')');

// Cities deferred to a future ASIA-1D-PK-MISSING-AR-MAJORS-1 phase
// (missing Arabic name in GeoNames; 98 majors deferred per ASIA-1D-PK
// premerge decision). These should still be absent post-ASIA-1D-PK.
const SHOULD_NOT_EXIST_YET = [
    'bahawalpur',       // 904k PPLA2 — missing-ar in GeoNames
    'dera-ismail-khan', // 763k PPLA2 — missing-ar
    'okara',            // 534k PPLA2 — missing-ar
    'kasur',            // 511k PPLA2 — missing-ar
    'larkana'           // 364k PPLA2 — missing-ar
];
for (const slug of SHOULD_NOT_EXIST_YET) {
    const entry = curated.find(x => x.countryCode === 'pk' && x.slug === slug);
    ok('pk/' + slug.padEnd(20) + ' NOT yet added (deferred to ASIA-1D-PK-MISSING-AR-MAJORS-1)',
        !entry);
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
