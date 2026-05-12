// PT-SEARCH-AR-2 — integration test.
// Verifies that once a city is registered via _addDiscoveredCity, a
// subsequent searchSmartCities() query for that city's name returns it.
// This is the user-visible promise: "click a Nominatim result, then
// next time the same query returns it from local DB instantly".
//
// Uses the same eval-shim approach as _test_search_ar.mjs to load the
// search code into a sandbox, then injects a fake localStorage and
// fetch stub so _loadDiscoveredCities / fetch fallbacks don't blow up.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSrc = readFileSync(join(__dirname, '..', 'js', 'app.js'), 'utf8');
const lines = appSrc.split('\n');

function sliceLines(from, to) { return lines.slice(from - 1, to).join('\n'); }
function lineOf(re) {
    for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i + 1;
    throw new Error('not found: ' + re);
}

const lineLocalCities  = lineOf(/^const LOCAL_CITIES = \[/);
const lineEndSearch    = lineOf(/^function fetchCitySuggestions\(/) - 1;
const slab = sliceLines(lineLocalCities, lineEndSearch);

// Minimal globals so DISCOVERED_CITIES init doesn't crash in Node.
globalThis.localStorage = {
    _store: {},
    getItem(k) { return this._store[k] || null; },
    setItem(k, v) { this._store[k] = String(v); },
    removeItem(k) { delete this._store[k]; }
};
globalThis.fetch = () => Promise.reject(new Error('no network in test'));

// Stand-in `makeSlug` for the eval'd slab — the real one calls
// `_transliterate` which isn't in the search slab. For test inputs
// (Latin Le Pontet / Port-de-Bouc / Riyadh), simple lowercasing +
// non-alphanumeric → '-' gives the same result.
globalThis.makeSlug = function (englishName, lat, lng) {
    const latin = String(englishName || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]+/g, ' ')
        .trim()
        .replace(/\s+/g, '-');
    if (latin.length >= 2) return latin;
    if (isFinite(+lat) && isFinite(+lng)) {
        const la = Math.abs(+lat).toFixed(1) + (+lat >= 0 ? 'n' : 's');
        const lo = Math.abs(+lng).toFixed(1) + (+lng >= 0 ? 'e' : 'w');
        return `loc-${la}-${lo}`;
    }
    return '';
};

const shim = `${slab}\n
({
    _normArabic, normalizeText, SMART_ALLOWED_TYPES,
    LOCAL_CITIES, LOCAL_PROVINCES, DISCOVERED_CITIES,
    _smartKey, searchSmartCities,
    _addDiscoveredCity, _isValidDiscoveredCity, _normalizeDiscoveredCity,
    // For test introspection only — DISCOVERED_CITIES is by-value but
    // mutations to its contents persist (it's an array).
    _getDiscovered: () => DISCOVERED_CITIES
})`;
const api = eval(shim);
const { searchSmartCities, _addDiscoveredCity, _isValidDiscoveredCity, _getDiscovered } = api;

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   — ' + extra : ''}`);
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-SEARCH-AR-2 — client-side discover+search integration');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

// 1. Baseline: Le Pontet is NOT in LOCAL_CITIES (we never curated it).
let r = searchSmartCities('Le Pontet');
const baselineHas = r.some(c => c.en === 'Le Pontet' && c.cc === 'fr');
check('Baseline: Le Pontet absent from LOCAL_CITIES', !baselineHas);

// 2. Register Le Pontet via _addDiscoveredCity (simulates click on Nominatim result).
const added = _addDiscoveredCity({
    ar: 'لو بونت', en: 'Le Pontet', cc: 'fr',
    lat: 43.961, lng: 4.86,
    country: 'فرنسا', countryEn: 'France', type: 'city'
});
check('_addDiscoveredCity returns true', added === true);
check('DISCOVERED_CITIES has 1 entry', _getDiscovered().length === 1);

// 3. Re-add same city → should be a no-op (dedup).
const added2 = _addDiscoveredCity({
    ar: 'لو بونت', en: 'Le Pontet', cc: 'fr',
    lat: 43.961, lng: 4.86, type: 'city'
});
check('_addDiscoveredCity 2nd call returns false (dedup)', added2 === false);
check('DISCOVERED_CITIES still has 1 entry', _getDiscovered().length === 1);

// 4. Search "Le Pontet" → should now find it.
r = searchSmartCities('Le Pontet');
const lpIdx = r.findIndex(c => c.en === 'Le Pontet' && c.cc === 'fr');
check('Search "Le Pontet" returns it', lpIdx === 0, `idx=${lpIdx}`);

// 5. Search "لو بونت" → should find it via Arabic name.
r = searchSmartCities('لو بونت');
const lpArIdx = r.findIndex(c => c.en === 'Le Pontet' && c.cc === 'fr');
check('Search "لو بونت" finds it via AR', lpArIdx === 0, `idx=${lpArIdx}`);

// 6. Reject invalid (random query).
const bad = _addDiscoveredCity({ query: 'random test' });
check('_addDiscoveredCity({query:...}) returns false', bad === false);
check('DISCOVERED_CITIES still has 1 entry', _getDiscovered().length === 1);

// 7. Reject missing cc.
const noCC = _addDiscoveredCity({ ar: 'X', en: 'X', lat: 1, lng: 1 });
check('_addDiscoveredCity no cc returns false', noCC === false);

// 8. Reject invalid lat (>90).
const badLat = _addDiscoveredCity({ ar: 'X', en: 'X', cc: 'fr', lat: 100, lng: 1 });
check('_addDiscoveredCity lat=100 returns false', badLat === false);

// 9. Add a 2nd valid city, search reaches both.
_addDiscoveredCity({
    ar: 'بور دو بوك', en: 'Port-de-Bouc', cc: 'fr',
    lat: 43.404, lng: 4.989, country: 'فرنسا', countryEn: 'France', type: 'city'
});
check('DISCOVERED_CITIES has 2 entries after Port-de-Bouc', _getDiscovered().length === 2);
r = searchSmartCities('Port');
const pdbIdx = r.findIndex(c => c.en === 'Port-de-Bouc');
check('Search "Port" returns Port-de-Bouc', pdbIdx >= 0, `idx=${pdbIdx}`);

// 10. Reject curated-duplicate: trying to add a city that already
//     exists in LOCAL_CITIES (Riyadh) should be rejected so we don't
//     shadow the curated entry.
const dup = _addDiscoveredCity({
    ar: 'الرياض', en: 'Riyadh', cc: 'sa',
    lat: 24.7136, lng: 46.6753, type: 'city'
});
check('_addDiscoveredCity Riyadh (already curated) returns false', dup === false);

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
