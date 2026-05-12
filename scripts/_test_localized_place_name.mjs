// PT-SEARCH-AR-6 verification.
// Tests that `_getLocalizedPlaceName(place, lang, originalQuery)`
// produces the right display name in each of the 10 supported UI
// languages — refusing to leak Latin "Venezia" into the AR UI even
// when OSM has no `name:ar` for Venice.

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

// Pull the helper block + dependencies. _normArabic / normalizeText /
// _hasArabicChars are upstream prerequisites.
const lineNormArabic        = lineOf(/^function _normArabic\(/);
const lineEndHelpers        = lineOf(/^const SMART_ALLOWED_TYPES = new Set/) - 1;
const slab = sliceLines(lineNormArabic, lineEndHelpers);

// Minimal globals so the slab can eval cleanly in Node.
globalThis.localStorage = {
    _store: {},
    getItem(k) { return this._store[k] || null; },
    setItem(k, v) { this._store[k] = String(v); }
};
globalThis.fetch = () => Promise.reject(new Error('no network'));
globalThis.window = { location: { pathname: '/' } };

const shim = `${slab}\n
({_getLocalizedPlaceName, SEARCH_CITY_NAME_OVERRIDES, _hasArabicChars})`;
const { _getLocalizedPlaceName } = eval(shim);

// Synthetic Nominatim places mirroring real responses (verified via
// the diagnostic script earlier).
const VENICE = {
    name: 'Venezia',
    address: { city: 'Venezia', country: 'إيطاليا' },
    namedetails: {
        name: 'Venezia',
        'name:en': 'Venice',
        'name:fr': 'Venise',
        'name:de': 'Venedig',
        'name:es': 'Venecia',
        // NO name:ar — this is the case the overrides dict fixes
    }
};
const FLORENCE = {
    name: 'فلورنسا',
    address: { city: 'فلورنسا', country: 'إيطاليا' },
    namedetails: {
        name: 'Firenze',
        'name:ar': 'فلورنسا',
        'name:en': 'Florence',
        'name:fr': 'Florence',
        'name:de': 'Florenz',
        'name:tr': 'Floransa',
        'name:bn': 'ফ্লোরেন্স'
    }
};
const MOPTI = {
    name: 'موبتي',
    address: { country: 'مالي' },
    namedetails: {
        name: 'Mopti',
        'name:ar': 'موبتي',
        'name:en': 'Mopti'
    }
};
const PISA = {
    name: 'Pisa',
    address: { city: 'Pisa', country: 'إيطاليا' },
    namedetails: { name: 'Pisa' }   // no name:ar, no name:en
};

const CASES = [
    // [label, place, lang, originalQuery, expected]
    // Venice — OSM lacks name:ar — override must fire
    ['Venice AR (override)',  VENICE,   'ar', 'فينيسيا',        'البندقية'],
    ['Venice EN',             VENICE,   'en', 'Venice',          'Venice'],
    ['Venice FR',             VENICE,   'fr', 'Venise',          'Venise'],
    ['Venice DE',             VENICE,   'de', 'Venedig',         'Venedig'],
    ['Venice TR (override)',  VENICE,   'tr', 'Venedik',         'Venedik'],
    ['Venice ID (override)',  VENICE,   'id', 'Venesia',         'Venesia'],
    ['Venice ES',             VENICE,   'es', 'Venecia',         'Venecia'],
    ['Venice BN (override)',  VENICE,   'bn', 'ভেনিস',           'ভেনিস'],
    ['Venice MS (override)',  VENICE,   'ms', 'Venice',          'Venice'],
    ['Venice UR (override)',  VENICE,   'ur', 'وینس',            'وینس'],
    // Florence — OSM HAS name:ar — namedetails should win, ignoring override conflict-free
    ['Florence AR (namedetails)', FLORENCE, 'ar', 'فلورنسا',     'فلورنسا'],
    ['Florence EN',           FLORENCE, 'en', 'Florence',         'Florence'],
    ['Florence DE (namedetails)', FLORENCE, 'de', 'Florenz',     'Florenz'],
    ['Florence TR (namedetails)', FLORENCE, 'tr', 'Floransa',    'Floransa'],
    // Mopti — OSM has name:ar
    ['Mopti AR',              MOPTI,    'ar', 'موبتي',           'موبتي'],
    ['Mopti EN',              MOPTI,    'en', 'Mopti',           'Mopti'],
    // Pisa — OSM has NO name:ar, NO name:en, only Latin name → override fires
    ['Pisa AR (override)',    PISA,     'ar', 'بيزا',            'بيزا'],
    ['Pisa EN (override)',    PISA,     'en', 'Pisa',            'Pisa'],
    ['Pisa FR (override)',    PISA,     'fr', 'Pise',            'Pise'],
    ['Pisa DE',               PISA,     'de', 'Pisa',            'Pisa'],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-SEARCH-AR-6 — _getLocalizedPlaceName verification (10 langs)');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, place, lang, query, expected] of CASES) {
    const got = _getLocalizedPlaceName(place, lang, query);
    const ok = (got === expected);
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label.padEnd(35)} → "${got}"${ok ? '' : '  (expected "' + expected + '")'}`);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
