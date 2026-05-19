// scripts/_test_asia_1d_pk_search.mjs
//
// ASIA-1D-PK verification — 43 new PK pipeline cities added to curated +
// 3 NAME_AR_FIXES (bahawalnagar/mailsi/chishtian) applied.
//
// Tests:
//   A. Disk-level: 43 new entries in curated_places.json (PK total = 53)
//   B. Disk-level: 3 NAME_AR_FIXES correctly applied
//   C. Disk-level: NO Latin fillchain in names.ur/bn/fr/de/tr/id/es/ms
//      for any of the 43 new entries (fillLangMap guard verified)
//   D. Disk-level: existing 10 PK seed entries unchanged
//   E. Search: 6 critical Arabic queries return correct slugs (incl. 3 fixes)
//   F. SSR: 3 priority /prayer-times-in-{slug} pages render correct Arabic

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
console.log(' ASIA-1D-PK Stage 4 merge verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — 43 new PK entries added (total PK = 53)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Curated PK count post-merge ──');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const pkEntries = curated.filter(e => e.countryCode === 'pk');

ok('PK total = 53 entries (10 seed + 43 ASIA-1D-PK)',
    pkEntries.length === 53,
    '(got ' + pkEntries.length + ')');

// 43 specific new slugs
const NEW_SLUGS = [
    'sargodha','muzaffarabad','shekhupura','gujrat','sukkur','rahim-yar-khan',
    'jhang-sadr','mardan','mingora','mirpur-khas','skardu','bahawalnagar','gilgit',
    'dadu','jhelum','muridke','tordher','gojra','chishtian','jaranwala','ahmadpur-east',
    'kamalia','wazirabad','chaman','hasilpur','kambar','turbat','bhalwal','dipalpur',
    'kotri','gwadar','pattoki','shahdadpur','mailsi','sibi','sambrial','kabirwala',
    'jahangira','jamrud','nankana-sahib','pasrur','matli','buni'
];
let foundNew = 0;
for (const slug of NEW_SLUGS) {
    if (pkEntries.find(e => e.slug === slug)) foundNew++;
}
ok('All 43 new PK slugs present in curated',
    foundNew === 43,
    '(found ' + foundNew + ' / 43)');

// ───────────────────────────────────────────────────────────────────────
// PART B — 3 NAME_AR_FIXES applied correctly
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — 3 NAME_AR_FIXES applied ──');

const FIXES_EXPECTED = {
    'bahawalnagar': 'بهاولنغر',
    'mailsi':       'ميلسي',
    'chishtian':    'ششتيان'
};

for (const [slug, expected] of Object.entries(FIXES_EXPECTED)) {
    const e = pkEntries.find(x => x.slug === slug);
    const got = e && e.names && e.names.ar;
    ok('pk/' + slug.padEnd(15) + ' names.ar = "' + expected + '"',
        got === expected,
        '(got "' + got + '")');
}

// chishtian alias preservation
const chishtian = pkEntries.find(x => x.slug === 'chishtian');
ok('chishtian aliases.ar includes "ششتيان شريف" (historical)',
    chishtian && chishtian.aliases && chishtian.aliases.ar && chishtian.aliases.ar.includes('ششتيان شريف'));

// bahawalnagar must NOT have the wrong بهاولبور alias
const bahawalnagar = pkEntries.find(x => x.slug === 'bahawalnagar');
const bnAliases = (bahawalnagar && bahawalnagar.aliases && bahawalnagar.aliases.ar) || [];
ok('bahawalnagar aliases.ar does NOT include بهاولبور (collision with Bahawalpur)',
    !bnAliases.includes('بهاولبور'));

// mailsi must NOT have the prefixed تصيل ميلسي alias
const mailsi = pkEntries.find(x => x.slug === 'mailsi');
const mlAliases = (mailsi && mailsi.aliases && mailsi.aliases.ar) || [];
ok('mailsi aliases.ar does NOT include "تصيل ميلسي" (admin-prefix)',
    !mlAliases.includes('تصيل ميلسي'));

// ───────────────────────────────────────────────────────────────────────
// PART C — NO Latin fillchain in names.ur/bn/fr/de/tr/id/es/ms
//          (fillLangMap guard verified at write-time)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — fillLangMap guard verified (no Latin in names.X) ──');

// Note: PLACE-NAMES-UR-PK-2-APPLY (2026-05-19) intentionally added real
// names.ur for all 43 entries. The fillchain-leak check should now
// allow names.ur (since it has REAL Urdu, not Latin fillchain), but
// still reject Latin in names.bn/fr/de/tr/id/es/ms (those should still
// be absent — no real source exists for them).
const FILLCHAIN_LANGS = ['bn','fr','de','tr','id','es','ms']; // ur excluded post-UR-PK-2
let fillchainLeaks = 0;
for (const slug of NEW_SLUGS) {
    const e = pkEntries.find(x => x.slug === slug);
    if (!e) continue;
    for (const lang of FILLCHAIN_LANGS) {
        if (e.names && e.names[lang]) {
            fillchainLeaks++;
        }
    }
}
ok('NO Latin fillchain in names.bn/fr/de/tr/id/es/ms for 43 new PK entries (0 leaks across 7 locales × 43 = 301 checks; names.ur populated by UR-PK-2)',
    fillchainLeaks === 0,
    '(detected ' + fillchainLeaks + ' leaks)');

// Also verify that names.ur IS now populated (UR-PK-2 baseline)
let namesUrSet = 0;
for (const slug of NEW_SLUGS) {
    const e = pkEntries.find(x => x.slug === slug);
    if (e && e.names && e.names.ur && !/^[A-Za-z]/.test(e.names.ur)) namesUrSet++;
}
ok('All 43 new PK entries have real names.ur (UR-PK-2 applied)',
    namesUrSet === 43,
    '(got ' + namesUrSet + ' / 43)');

// ───────────────────────────────────────────────────────────────────────
// PART D — Existing 10 PK seed entries unchanged
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — 10 PK seed entries unchanged ──');

const SEED_SLUGS = ['karachi','lahore','islamabad','rawalpindi','peshawar',
                    'multan','faisalabad','quetta','hyderabad-pk','sialkot'];
const SEED_NAMES_UR = {
    'karachi': 'کراچی', 'lahore': 'لاہور', 'islamabad': 'اسلام آباد',
    'rawalpindi': 'راولپنڈی', 'peshawar': 'پشاور', 'multan': 'ملتان',
    'faisalabad': 'فیصل آباد', 'quetta': 'کوئٹہ',
    'hyderabad-pk': 'حیدرآباد', 'sialkot': 'سیالکوٹ'
};
for (const slug of SEED_SLUGS) {
    const e = pkEntries.find(x => x.slug === slug);
    const got = e && e.names && e.names.ur;
    ok('pk/' + slug.padEnd(15) + ' names.ur = "' + SEED_NAMES_UR[slug] + '" (UR-PK-1 baseline retained)',
        got === SEED_NAMES_UR[slug],
        '(got "' + got + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART E — Arabic search returns correct slugs for 3 NAME_AR_FIXES + 3 others
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — /api/search-place Arabic queries ──');

const SEARCH_TESTS = [
    { q: 'بهاولنغر',   expectedSlug: 'bahawalnagar', expectedCc: 'pk' },
    { q: 'ميلسي',      expectedSlug: 'mailsi',       expectedCc: 'pk' },
    { q: 'ششتيان',    expectedSlug: 'chishtian',    expectedCc: 'pk' },
    { q: 'ششتيان شريف', expectedSlug: 'chishtian',  expectedCc: 'pk' }, // alias
    { q: 'سرغودها',   expectedSlug: 'sargodha',     expectedCc: 'pk' },
    { q: 'مظفر آباد', expectedSlug: 'muzaffarabad', expectedCc: 'pk' }
];

for (const t of SEARCH_TESTS) {
    const r = await get('/api/search-place?q=' + encodeURIComponent(t.q) + '&lang=ar');
    let top = null;
    try {
        const j = JSON.parse(r.body);
        top = j.results && j.results[0];
    } catch (_) {}
    const slugMatch = top && top.slug === t.expectedSlug && top.countryCode === t.expectedCc;
    ok('search "' + t.q + '" → top = pk/' + t.expectedSlug,
        slugMatch,
        top ? '(got ' + top.countryCode + '/' + top.slug + ')' : '(no results)');
}

// ───────────────────────────────────────────────────────────────────────
// PART F — 3 priority pages render correct Arabic seed
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — SSR pages for 3 NAME_AR_FIX cities ──');

for (const [slug, expected] of Object.entries(FIXES_EXPECTED)) {
    const r = await get('/prayer-times-in-' + slug);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/prayer-times-in-' + slug.padEnd(15) + ' SSR seed.name = "' + expected + '"',
        r.status === 200 && seedName === expected,
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
