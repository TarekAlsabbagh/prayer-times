// scripts/_test_supported_local_place_names_policy_1.mjs
//
// SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 verification (2026-05-21).
//
// Asserts the 36 applied changes are in curated AND nothing else was
// mutated. Pure offline. Plus runtime helper verification.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-PLACE-NAMES-POLICY-1 — verification');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const placeL10n = require('../server/place-l10n');

// ─── Group 1: Indonesia Kota X applied (34) ─────────────────────────────
console.log('── Group 1: Indonesia — 34 cities now have names.id = "Kota X" ──');
const ID_EXPECTED = {
    'surabaya':        'Kota Surabaya',
    'bandung':         'Kota Bandung',
    'medan':           'Kota Medan',
    'makassar':        'Kota Makassar',
    'semarang':        'Kota Semarang',
    'palembang':       'Kota Palembang',
    'banda-aceh':      'Kota Banda Aceh',
    'tegal':           'Kota Tegal',
    'tarakan':         'Kota Tarakan',
    'tanjung-pinang':  'Kota Tanjung Pinang',
    'surakarta':       'Kota Surakarta',
    'samarinda':       'Kota Samarinda',
    'padang':          'Kota Padang',
    'mataram':         'Kota Mataram',
    'manado':          'Kota Manado',
    'malang':          'Kota Malang',
    'kediri':          'Kota Kediri',
    'cirebon':         'Kota Cirebon',
    'bogor':           'Kota Bogor',
    'bitung':          'Kota Bitung',
    'bengkulu':        'Kota Bengkulu',
    'bekasi':          'Kota Bekasi',
    'ambon':           'Kota Ambon',
    'batam':           'Kota Batam',
    'bandar-lampung':  'Kota Bandar Lampung',
    'tangerang':       'Kota Tangerang',
    'sukabumi':        'Kota Sukabumi',
    'pontianak':       'Kota Pontianak',
    'pekanbaru':       'Kota Pekanbaru',
    'kendari':         'Kota Kendari',
    'denpasar':        'Kota Denpasar',
    'balikpapan':      'Kota Balikpapan',
    'kupang':          'Kota Kupang',
    'jayapura':        'Kota Jayapura'
};
for (const slug of Object.keys(ID_EXPECTED).sort()) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    ok(slug.padEnd(18) + ' names.id = "' + ID_EXPECTED[slug] + '"',
       e.names.id === ID_EXPECTED[slug],
       e.names.id === ID_EXPECTED[slug] ? '' : '(actual: "' + e.names.id + '")');
}

// ─── Group 2: Spain accent fixes (2) ────────────────────────────────────
console.log('');
console.log('── Group 2: Spain — 2 accent fixes ──');
const cadiz = curated.find(x => x.slug === 'cadiz');
ok('cadiz names.es = "Cádiz"',        cadiz && cadiz.names.es === 'Cádiz',
   cadiz ? '(actual: "' + cadiz.names.es + '")' : '');
const sansebastian = curated.find(x => x.slug === 'san-sebastian');
ok('san-sebastian names.es = "San Sebastián"',
   sansebastian && sansebastian.names.es === 'San Sebastián',
   sansebastian ? '(actual: "' + sansebastian.names.es + '")' : '');

// ─── Group 3: Indonesian exceptions preserved (not Kota X) ──────────────
console.log('');
console.log('── Group 3: Indonesian exceptions preserved ──');
const jakarta = curated.find(x => x.slug === 'jakarta');
ok('jakarta names.id = "Jakarta" (NOT Kota Jakarta — Daerah Khusus)',
   jakarta && jakarta.names.id === 'Jakarta');
const yogya = curated.find(x => x.slug === 'yogyakarta');
ok('yogyakarta names.id = "Yogyakarta" (NOT Kota Yogyakarta — Daerah Istimewa)',
   yogya && yogya.names.id === 'Yogyakarta');

// ─── Group 4: Already-native preserved (not clobbered) ──────────────────
console.log('');
console.log('── Group 4: Already-native city names preserved ──');
const NATIVE_PRESERVED = {
    'istanbul':     ['tr', 'İstanbul'],
    'izmir':        ['tr', 'İzmir'],
    'diyarbakir':   ['tr', 'Diyarbakır'],
    'sanliurfa':    ['tr', 'Şanlıurfa'],
    'munich':       ['de', 'München'],
    'cologne':      ['de', 'Köln'],
    'nuremberg':    ['de', 'Nürnberg'],
    'vienna':       ['de', 'Wien'],
    'zurich':       ['de', 'Zürich'],
    'mexico-city':  ['es', 'Ciudad de México'],
    'bogota':       ['es', 'Bogotá']
};
for (const slug of Object.keys(NATIVE_PRESERVED)) {
    const [L, expected] = NATIVE_PRESERVED[slug];
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    ok(slug.padEnd(14) + ' names.' + L + ' = "' + expected + '" (preserved)',
       e.names[L] === expected);
}

// ─── Group 5: Helper resolves to new names ──────────────────────────────
console.log('');
console.log('── Group 5: getLocalizedPlaceName resolves to new ID values ──');
for (const slug of ['malang','surabaya','medan','makassar','bandung']) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    const r = placeL10n.getLocalizedPlaceName(e, 'id');
    ok(slug + ' /id/ helper.displayName = "' + ID_EXPECTED[slug] + '"',
       r.displayName === ID_EXPECTED[slug]);
    ok(slug + ' /id/ helper.hasNativeName = true',
       r.hasNativeName === true);
    ok(slug + ' /id/ helper.isFallback = false',
       r.isFallback === false);
}

// ─── Group 6: Gwangju NOT regressed (still en-fallback for ur/bn) ──────
console.log('');
console.log('── Group 6: Gwangju regression — en-fallback unchanged ──');
const gwangju = curated.find(x => x.slug === 'gwangju');
ok('gwangju names.ur unchanged (still Latin pollution)',
   gwangju && gwangju.names.ur === 'Gwangju');
ok('gwangju names.bn unchanged',     gwangju && gwangju.names.bn === 'Gwangju');
const gUr = placeL10n.getLocalizedPlaceName(gwangju, 'ur');
ok('gwangju /ur/ helper → en-fallback (sourceLang=en)',
   gUr.sourceLang === 'en' && gUr.isFallback === true);

// ─── Group 7: Native cities NOT regressed ──────────────────────────────
console.log('');
console.log('── Group 7: Native cities regression check ──');
const REGRESSION = {
    'karachi':  ['ur', 'کراچی'],
    'dhaka':    ['bn', 'ঢাকা'],
    'mumbai':   ['ur', 'ممبئی'],
    'mumbai':   ['bn', 'মুম্বই'],
    'varanasi': ['bn', 'বারাণসী'],
    'makkah':   ['ar', 'مكة المكرمة']
};
// (note: mumbai appears twice, only last survives in object — keep simple test)
const REG_PAIRS = [
    ['karachi',  'ur', 'کراچی'],
    ['dhaka',    'bn', 'ঢাকা'],
    ['mumbai',   'ur', 'ممبئی'],
    ['mumbai',   'bn', 'মুম্বই'],
    ['varanasi', 'bn', 'বারাণসী'],
    ['makkah',   'ar', 'مكة المكرمة']
];
for (const [slug, L, expected] of REG_PAIRS) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    ok(slug.padEnd(10) + ' names.' + L + ' = "' + expected + '" (regression preserved)',
       e.names[L] === expected);
}

// ─── Group 8: Invariants ───────────────────────────────────────────────
console.log('');
console.log('── Group 8: Apply invariants ──');
// (a) Total entry count unchanged
ok('curated entry count == 2630 (post ASIA-1D-IN-D, no add/delete in THIS phase)', curated.length === 2630,
   '(actual: ' + curated.length + ')');
// (b) names.ar + names.en for the 36 touched entries — re-check vs backup
const backup = JSON.parse(readFileSync(new URL('../db/places/curated-places.json.preSupportedLocalNames1.bak', import.meta.url), 'utf8'));
const backupBySlug = new Map(backup.map(e => [e.slug, e]));
const TOUCHED = [...Object.keys(ID_EXPECTED), 'cadiz', 'san-sebastian'];
let arEnMutated = 0;
for (const slug of TOUCHED) {
    const o = backupBySlug.get(slug);
    const e = curated.find(x => x.slug === slug);
    if (!o || !e) continue;
    if (o.names.ar !== e.names.ar) arEnMutated++;
    if (o.names.en !== e.names.en) arEnMutated++;
}
ok('names.ar + names.en untouched across 36 affected entries', arEnMutated === 0,
   '(' + arEnMutated + ' mutations)');
// (c) slug + countryCode + lat/lng + timezone unchanged FOR THE 36 TOUCHED
//      entries from POLICY-1. (Entries added by later waves like
//      ASIA-1D-IN-D won't be in the backup; that's correct.)
let metaMutated = 0;
for (const slug of TOUCHED) {
    const o = backupBySlug.get(slug);
    const e = curated.find(x => x.slug === slug);
    if (!o || !e) { metaMutated++; continue; }
    for (const k of ['slug','countryCode','lat','lng','timezone','type','sourceId']) {
        if (JSON.stringify(e[k]) !== JSON.stringify(o[k])) metaMutated++;
    }
}
ok('slug/countryCode/lat/lng/timezone/type/sourceId untouched for 36 POLICY-1 entries',
   metaMutated === 0, '(' + metaMutated + ' mutations)');
// (d) Backup contains POLICY-1 baseline of 2597. Current curated may
//     have grown via subsequent waves (e.g., ASIA-1D-IN-D added 33 → 2630).
ok('backup is POLICY-1 baseline of 2597 entries', backup.length === 2597);
ok('curated entry count >= backup count (later waves may add)',
   curated.length >= backup.length);

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
