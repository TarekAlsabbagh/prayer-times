// PT-SEARCH-AR-3 — all-cities-page filter verification.
// `filterAllCities()` used to do raw `nameAr.includes(q.toLowerCase())` which
// missed compact-form variations (`حفرالباطن` vs `حفر الباطن`), Arabic-letter
// folding (إ/أ/آ/ا → ا), and Latin diacritics. After the fix it uses the
// unified `normalizeText()` matcher.
//
// We re-implement the matcher inline (mirroring the production code) so
// the test isn't tied to DOM state (allCitiesData, allCitiesPage, etc.).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appSrc = readFileSync(join(__dirname, '..', 'js', 'app.js'), 'utf8');
const lines = appSrc.split('\n');

function lineOf(re) {
    for (let i = 0; i < lines.length; i++) if (re.test(lines[i])) return i + 1;
    throw new Error('not found: ' + re);
}
function sliceLines(from, to) { return lines.slice(from - 1, to).join('\n'); }

const lineNormArabic = lineOf(/^function _normArabic\(/);
const lineEndNorm    = lineOf(/^const SMART_ALLOWED_TYPES = new Set/) - 1;
const slab = sliceLines(lineNormArabic, lineEndNorm);
const shim = `${slab}\n({ normalizeText })`;
const { normalizeText } = eval(shim);

// Reproduce the production filter logic exactly.
function filterAllCitiesPure(list, rawQ) {
    rawQ = String(rawQ || '').trim();
    if (!rawQ) return [...list];
    const qNorm = normalizeText(rawQ);
    const qCompact = qNorm.replace(/\s+/g, '');
    return list.filter(c => {
        const arN = normalizeText(c.nameAr || '');
        const enN = normalizeText(c.nameEn || '');
        if (arN.includes(qNorm) || enN.includes(qNorm)) return true;
        const arC = arN.replace(/\s+/g, '');
        const enC = enN.replace(/\s+/g, '');
        return arC.includes(qCompact) || enC.includes(qCompact);
    });
}

// A small Saudi cities sample (subset of CITIES_DB.sa).
const SAUDI_SAMPLE = [
    { nameAr: 'الرياض',         nameEn: 'Riyadh' },
    { nameAr: 'جدة',            nameEn: 'Jeddah' },
    { nameAr: 'حفر الباطن',     nameEn: 'Hafar al-Batin' },
    { nameAr: 'بقعاء',          nameEn: 'Buqayq' },
    { nameAr: 'خميس مشيط',     nameEn: 'Khamis Mushait' },
    { nameAr: 'الأحساء',        nameEn: 'Al-Ahsa' },
    { nameAr: 'القطيف',         nameEn: 'Qatif' },
    { nameAr: 'الدمام',         nameEn: 'Dammam' },
    { nameAr: 'الخبر',          nameEn: 'Khobar' },
    { nameAr: 'الجبيل',         nameEn: 'Jubail' },
    { nameAr: 'الظهران',        nameEn: 'Dhahran' },
    { nameAr: 'بريدة',          nameEn: 'Buraydah' },
    { nameAr: 'وادي الدواسر',  nameEn: 'Wadi ad-Dawasir' },
    { nameAr: 'مكة المكرمة',    nameEn: 'Mecca' },
];

const CASES = [
    // [name, query, expectedFirstNameAr (or null if expected empty)]
    ['A) حفر الباطن  → exact',           'حفر الباطن',    'حفر الباطن'],
    ['B) حفرالباطن  → compact',          'حفرالباطن',     'حفر الباطن'],
    ['C) حفر-الباطن → dash → space',     'حفر-الباطن',    'حفر الباطن'],
    ['D) Hafar       → EN partial',      'Hafar',         'حفر الباطن'],
    ['E) hafar al-batin → EN dashed',    'hafar-al-batin','حفر الباطن'],
    ['F) خميس مشيط → exact',             'خميس مشيط',    'خميس مشيط'],
    ['G) خميس       → AR partial',       'خميس',          'خميس مشيط'],
    ['H) الأحساء    → أ→ا fold',         'الاحساء',       'الأحساء'],
    ['I) Mecca       → EN exact',        'Mecca',         'مكة المكرمة'],
    ['J) مكه         → ة→ه fold',         'مكه',           'مكة المكرمة'],
    ['K) وادي الدواسر → exact',          'وادي الدواسر',  'وادي الدواسر'],
    ['L) وادي         → AR prefix',      'وادي',          'وادي الدواسر'],
    ['M) بريده        → ه↔ة tolerant',   'بريده',         'بريدة'],
    ['N) ()           → no query',       '',              null], // expects full list
    ['O) zzzzz       → no match',        'zzzzz',         '__EMPTY__'],
];

let pass = 0, fail = 0;
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PT-SEARCH-AR-3 — all-cities-page filter (unified normalizeText)');
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [label, q, want] of CASES) {
    const got = filterAllCitiesPure(SAUDI_SAMPLE, q);
    if (want === null) {
        // empty query → full list
        const ok = got.length === SAUDI_SAMPLE.length;
        if (ok) pass++; else fail++;
        console.log(`\n${label}\n   q="${q}" → got ${got.length} items   ${ok ? '✓' : '✗ expected ' + SAUDI_SAMPLE.length}`);
    } else if (want === '__EMPTY__') {
        const ok = got.length === 0;
        if (ok) pass++; else fail++;
        console.log(`\n${label}\n   q="${q}" → got ${got.length} items   ${ok ? '✓' : '✗ expected 0'}`);
    } else {
        const firstAr = got[0]?.nameAr || '(empty)';
        const ok = (firstAr === want);
        if (ok) pass++; else fail++;
        console.log(`\n${label}\n   q="${q}" → first="${firstAr}"   ${ok ? '✓' : '✗ expected "' + want + '"'}`);
    }
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
