// PT-SEARCH-AR-1 verification.
// Tests that the Arabic-search ladder finds known Saudi cities even with
// alias / typo / no-space variations. Mirrors the production matcher
// (normalizeText + searchSmartCities + compact tier) so we can unit-test
// without booting the 22k-LOC app.js bundle.
//
// We import the LIVE app.js source and pluck the search-relevant slab
// via line-number ranges, then eval to expose the functions.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSrc = readFileSync(join(__dirname, '..', 'js', 'app.js'), 'utf8');
const lines = appSrc.split('\n');

// Slice by line-number ranges (1-indexed, inclusive on both ends).
function sliceLines(from, to) {
    return lines.slice(from - 1, to).join('\n');
}

// Locate function start lines by their signature so we don't have to
// hardcode brittle line numbers — adjust when the file is edited.
function lineOf(re) {
    for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i])) return i + 1;
    }
    throw new Error('signature not found: ' + re);
}

const lineNormArabic   = lineOf(/^function _normArabic\(/);
const lineNormalizeText= lineOf(/^function normalizeText\(/);
const lineAllowedTypes = lineOf(/^const SMART_ALLOWED_TYPES = new Set\(/);
const lineLocalCities  = lineOf(/^const LOCAL_CITIES = \[/);
const lineLocalProvinces=lineOf(/^const LOCAL_PROVINCES = \[/);
const lineSmartKey     = lineOf(/^function _smartKey\(/);
const lineSearchSmart  = lineOf(/^function searchSmartCities\(/);
// Find the closing line of each — for the search function we just take
// everything from the start of searchSmartCities up to a known sentinel
// (the next top-level `function fetchCitySuggestions`).
const lineEndSearch    = lineOf(/^function fetchCitySuggestions\(/) - 1;
// LOCAL_CITIES + LOCAL_PROVINCES come BEFORE _normArabic in the source,
// so start the slab at LOCAL_CITIES to include everything we need.
const wholeSlab = sliceLines(lineLocalCities, lineEndSearch);

const shim = `${wholeSlab}\n
({_normArabic, normalizeText, SMART_ALLOWED_TYPES, LOCAL_CITIES, LOCAL_PROVINCES, _smartKey, searchSmartCities})`;
const api = eval(shim);
const { searchSmartCities, normalizeText } = api;

const CASES = [
    // [name, query, expectedFirstAr, expectedFirstCc]
    ['A) بقيق           → Abqaiq',          'بقيق',          'بقيق',           'sa'],
    ['B) ابقيق          → Abqaiq (alias)',  'ابقيق',         'بقيق',           'sa'],
    ['C) Abqaiq         → Abqaiq (EN)',     'Abqaiq',        'بقيق',           'sa'],
    ['D) Buqayq         → Abqaiq (alias EN)','Buqayq',       'بقيق',           'sa'],
    ['E) حفر الباطن     → Hafar Al-Batin',  'حفر الباطن',    'حفر الباطن',     'sa'],
    ['F) حفرالباطن      → compact match',   'حفرالباطن',     'حفر الباطن',     'sa'],
    ['G) حفر باطن       → alias',           'حفر باطن',      'حفر الباطن',     'sa'],
    ['H) hafar al-batin → EN dashed',       'hafar-al-batin','حفر الباطن',     'sa'],
    ['I) الجبيل         → Jubail',          'الجبيل',        'الجبيل',         'sa'],
    ['J) الظهران        → Dhahran',         'الظهران',       'الظهران',        'sa'],
    ['K) القطيف         → Qatif',           'القطيف',        'القطيف',         'sa'],
    ['L) الأحساء        → Al-Ahsa (existing)','الأحساء',     'الأحساء',        'sa'],
    ['M) خميس مشيط      → Khamis Mushait',  'خميس مشيط',     'خميس مشيط',      'sa'],
    ['N) وادي الدواسر   → Wadi (province)', 'وادي الدواسر',  'وادي الدواسر',   'sa'],
    ['O) الرياض         → Riyadh (sanity)', 'الرياض',        'الرياض',         'sa'],
    ['P) لندن           → London (sanity)', 'لندن',          'لندن',           'gb'],
    ['Q) Riyadh         → الرياض (EN)',     'Riyadh',        'الرياض',         'sa'],
    ['R) jubail         → الجبيل (lower)',  'jubail',        'الجبيل',         'sa'],
    ['S) بريدة          → Buraydah',        'بريدة',         'بريدة',          'sa'],
    ['T) بريده          → Buraydah (ه)',    'بريده',         'بريدة',          'sa'],
    ['U) محايل          → محايل عسير',      'محايل',         'محايل عسير',     'sa'],
    ['V) muhayil        → محايل عسير (EN)', 'muhayil',       'محايل عسير',     'sa'],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-SEARCH-AR-1 — Arabic search verification (Saudi cities + compact)');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, query, wantAr, wantCc] of CASES) {
    const results = searchSmartCities(query);
    const first = results[0];
    const gotAr = first ? first.ar : '(no results)';
    const gotCc = first ? first.cc : '(no results)';
    const ok = (gotAr === wantAr && gotCc === wantCc);
    if (ok) pass++; else fail++;
    console.log(`\n${label}`);
    console.log(`   query: "${query}"`);
    console.log(`   got:   "${gotAr}" (cc=${gotCc})   ${ok ? '✓' : '✗ expected "' + wantAr + '" (cc=' + wantCc + ')'}`);
    if (!ok && results.length > 0) {
        const topThree = results.slice(0, 3).map(r => `"${r.ar}" (cc=${r.cc}, score=${(r._score || 0).toFixed(1)})`).join(', ');
        console.log(`   top-3: ${topThree}`);
    }
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
