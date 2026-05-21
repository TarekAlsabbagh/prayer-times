// scripts/geodata/_supported_local_lang_cities_tr_b_fast_apply.mjs
//
// SUPPORTED-LOCAL-LANG-CITIES-TR-B-FAST — Second batch for Turkey.
//
// Adds 30 Turkish cities with EXACTLY names.{ar, en, tr} per place-data-
// maintenance-policy §2. Follows the same strict-Arabic-pollution
// rejection pattern as TR-FAST.
//
// Group A — GeoNames Arabic kept (20 cities): all passed isCleanArabic
//   in source candidates file.
// Group B — Manual NAME_AR_FIX (10 cities): GeoNames name.ar was polluted
//   (Urdu/Persian-only letters ی پ ے ہ گ ګ or Latin-mixed), or missing.
//   User-approved Arabic Wikipedia canonical / standard translit.
//
// names.en convention: ASCII (matches existing diyarbakir/sanliurfa pattern).
// names.tr convention: full Turkish diacritics from GeoNames raw `name`.
//
// Includes one PPLA2 (nusaybin) — historically distinct from Mardin city,
// known in Arabic as نصيبين (Nisibis, Aramaic/Syriac heritage).
// Includes one needs_review entry (manisa) — GeoNames had no name.ar
// (missing_ar_name flag) — supplied manually from Arabic Wikipedia.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preSupportedTrBFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-lang-cities-tr-b-fast-apply-report.json', import.meta.url);

const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
function isCleanArabic(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]|[A-Za-z]|[ऀ-ॿ]|[஀-௿]/.test(s)) return false;
    if (URDU_ONLY.test(s)) return false;
    return true;
}
function isCleanLatin(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[A-Za-z]/.test(s)) return false;
    if (/[؀-ۿ]|[ঀ-৿]/.test(s)) return false;
    return true;
}
function scriptGuard(value, lang) {
    if (lang === 'ar') return isCleanArabic(value);
    if (lang === 'en' || lang === 'tr') return isCleanLatin(value);
    return false;
}

const TR_TZ = 'Europe/Istanbul';

const NEW_CITIES = [
    // ── Group A — GeoNames clean Arabic kept as-is (20 cities) ──────────
    { slug: 'duezce',     geonameId: '747764', lat: 40.84055, lng: 31.15656, population: 194097, admin1: '93', region: 'Düzce',      regionAr: 'دوزجة',          names: { ar: 'دوزجة',          en: 'Duzce',         tr: 'Düzce' },         arSource: 'GN-clean' },
    { slug: 'isparta',    geonameId: '311073', lat: 37.76441, lng: 30.55194, population: 172334, admin1: '33', region: 'Isparta',    regionAr: 'إسبرطة',         names: { ar: 'إسبرطة',         en: 'Isparta',       tr: 'Isparta' },       arSource: 'GN-clean' },
    { slug: 'erzincan',   geonameId: '315373', lat: 39.74664, lng: 39.49083, population: 150714, admin1: '24', region: 'Erzincan',   regionAr: 'أرزينجان',       names: { ar: 'أرزينجان',       en: 'Erzincan',      tr: 'Erzincan' },      arSource: 'GN-clean' },
    { slug: 'mardin',     geonameId: '304797', lat: 37.31309, lng: 40.74357, population: 129864, admin1: '72', region: 'Mardin',     regionAr: 'ماردين',          names: { ar: 'ماردن',          en: 'Mardin',        tr: 'Mardin' },        arSource: 'GN-clean' },
    { slug: 'tokat',      geonameId: '738743', lat: 40.31389, lng: 36.55444, population: 129702, admin1: '60', region: 'Tokat',      regionAr: 'توقات',           names: { ar: 'توقات',          en: 'Tokat',         tr: 'Tokat' },         arSource: 'GN-clean' },
    { slug: 'giresun',    geonameId: '746881', lat: 40.91698, lng: 38.38741, population: 125682, admin1: '28', region: 'Giresun',    regionAr: 'غيرسون',          names: { ar: 'غيرسون',         en: 'Giresun',       tr: 'Giresun' },       arSource: 'GN-clean' },
    { slug: 'kastamonu',  geonameId: '743882', lat: 41.37805, lng: 33.77528, population: 125622, admin1: '37', region: 'Kastamonu',  regionAr: 'قسطموني',         names: { ar: 'قسطموني',        en: 'Kastamonu',     tr: 'Kastamonu' },     arSource: 'GN-clean' },
    { slug: 'samandag',   geonameId: '301975', lat: 36.08482, lng: 35.97902, population: 123447, admin1: '31', region: 'Hatay',      regionAr: 'هاتاي',           names: { ar: 'السويدية',        en: 'Samandag',      tr: 'Samandağ' },      arSource: 'GN-clean' },
    { slug: 'tekirdag',   geonameId: '738927', lat: 40.97803, lng: 27.51091, population: 122287, admin1: '59', region: 'Tekirdağ',   regionAr: 'تكيرداغ',          names: { ar: 'تكيرداغ',        en: 'Tekirdag',      tr: 'Tekirdağ' },      arSource: 'GN-clean' },
    { slug: 'siirt',      geonameId: '300822', lat: 37.92667, lng: 41.94167, population: 114034, admin1: '74', region: 'Siirt',      regionAr: 'سعرد',            names: { ar: 'سعرد',           en: 'Siirt',         tr: 'Siirt' },         arSource: 'GN-clean' },
    { slug: 'kilis',      geonameId: '307864', lat: 36.71611, lng: 37.115,   population: 111648, admin1: '90', region: 'Kilis',      regionAr: 'كلس',             names: { ar: 'كلس',            en: 'Kilis',         tr: 'Kilis' },         arSource: 'GN-clean' },
    { slug: 'igdir',      geonameId: '311665', lat: 39.91972, lng: 44.045,   population: 101700, admin1: '88', region: 'Iğdır',      regionAr: 'إيغدير',          names: { ar: 'اغدير',          en: 'Igdir',         tr: 'Iğdır' },         arSource: 'GN-clean' },
    { slug: 'mugla',      geonameId: '304184', lat: 37.21807, lng: 28.36651, population: 92328,  admin1: '48', region: 'Muğla',      regionAr: 'موغلا',           names: { ar: 'مغلا',           en: 'Mugla',         tr: 'Muğla' },         arSource: 'GN-clean' },
    { slug: 'kars',       geonameId: '743952', lat: 40.60667, lng: 43.09444, population: 91450,  admin1: '84', region: 'Kars',       regionAr: 'قارص',            names: { ar: 'قارص',           en: 'Kars',          tr: 'Kars' },          arSource: 'GN-clean' },
    { slug: 'nigde',      geonameId: '303827', lat: 37.96583, lng: 34.67935, population: 91039,  admin1: '73', region: 'Niğde',      regionAr: 'نيغدة',           names: { ar: 'نيغدة',          en: 'Nigde',         tr: 'Niğde' },         arSource: 'GN-clean' },
    { slug: 'mus',        geonameId: '304081', lat: 38.73163, lng: 41.49083, population: 82536,  admin1: '49', region: 'Muş',        regionAr: 'موش',             names: { ar: 'موش',            en: 'Mus',           tr: 'Muş' },           arSource: 'GN-clean' },
    { slug: 'bartin',     geonameId: '751057', lat: 41.63583, lng: 32.33778, population: 81692,  admin1: '87', region: 'Bartın',     regionAr: 'بارتن',           names: { ar: 'بارتن',          en: 'Bartin',        tr: 'Bartın' },        arSource: 'GN-clean' },
    { slug: 'hakkari',    geonameId: '318137', lat: 37.57444, lng: 43.74083, population: 77699,  admin1: '70', region: 'Hakkâri',    regionAr: 'هكاري',           names: { ar: 'هكاري',          en: 'Hakkari',       tr: 'Hakkâri' },       arSource: 'GN-clean' },
    { slug: 'bitlis',     geonameId: '321025', lat: 38.40115, lng: 42.10784, population: 53023,  admin1: '13', region: 'Bitlis',     regionAr: 'بتليس',           names: { ar: 'بتليس',          en: 'Bitlis',        tr: 'Bitlis' },        arSource: 'GN-clean' },
    { slug: 'sinop',      geonameId: '739600', lat: 42.02683, lng: 35.16253, population: 34834,  admin1: '57', region: 'Sinop',      regionAr: 'سينوب',           names: { ar: 'سينوب',          en: 'Sinop',         tr: 'Sinop' },         arSource: 'GN-clean' },

    // ── Group B — Manual NAME_AR_FIX (10 cities) ───────────────────────
    { slug: 'manisa',     geonameId: '304827', lat: 38.61202, lng: 27.42647, population: 243971, admin1: '45', region: 'Manisa',     regionAr: 'مانيسا',           names: { ar: 'مانيسا',         en: 'Manisa',        tr: 'Manisa' },        arSource: 'MANUAL:WikipediaAR' },
    { slug: 'aydin',      geonameId: '322830', lat: 37.84528, lng: 27.83963, population: 163022, admin1: '09', region: 'Aydın',      regionAr: 'آيدين',           names: { ar: 'آيدين',          en: 'Aydin',         tr: 'Aydın' },         arSource: 'MANUAL:WikipediaAR' },
    { slug: 'canakkale',  geonameId: '749780', lat: 40.14556, lng: 26.40639, population: 143622, admin1: '17', region: 'Çanakkale',  regionAr: 'جناق قلعة',         names: { ar: 'جناق قلعة',      en: 'Canakkale',     tr: 'Çanakkale' },     arSource: 'MANUAL:WikipediaAR' },
    { slug: 'bingoel',    geonameId: '321082', lat: 38.88472, lng: 40.49389, population: 128935, admin1: '12', region: 'Bingöl',     regionAr: 'بينغول',           names: { ar: 'بينغول',         en: 'Bingol',        tr: 'Bingöl' },        arSource: 'MANUAL:translit' },
    { slug: 'agri',       geonameId: '309647', lat: 39.71944, lng: 43.05139, population: 124483, admin1: '04', region: 'Ağrı',       regionAr: 'آغري',            names: { ar: 'آغري',           en: 'Agri',          tr: 'Ağrı' },          arSource: 'MANUAL:WikipediaAR' },
    { slug: 'amasya',     geonameId: '752015', lat: 40.65333, lng: 35.83306, population: 114921, admin1: '05', region: 'Amasya',     regionAr: 'أماسيا',           names: { ar: 'أماسيا',         en: 'Amasya',        tr: 'Amasya' },        arSource: 'MANUAL:WikipediaAR' },
    { slug: 'zonguldak',  geonameId: '737022', lat: 41.45139, lng: 31.79333, population: 101749, admin1: '85', region: 'Zonguldak',  regionAr: 'زونغولداق',        names: { ar: 'زونغولداق',      en: 'Zonguldak',     tr: 'Zonguldak' },     arSource: 'MANUAL:translit' },
    { slug: 'nusaybin',   geonameId: '303750', lat: 37.07579, lng: 41.21436, population: 88977,  admin1: '72', region: 'Mardin',     regionAr: 'ماردين',          names: { ar: 'نصيبين',         en: 'Nusaybin',      tr: 'Nusaybin' },      arSource: 'MANUAL:WikipediaAR' },
    { slug: 'yozgat',     geonameId: '296562', lat: 39.82,    lng: 34.80444, population: 87881,  admin1: '66', region: 'Yozgat',     regionAr: 'يوزغات',           names: { ar: 'يوزغات',         en: 'Yozgat',        tr: 'Yozgat' },        arSource: 'MANUAL:WikipediaAR' },
    { slug: 'nevsehir',   geonameId: '303831', lat: 38.6244,  lng: 34.72394, population: 75527,  admin1: '50', region: 'Nevşehir',   regionAr: 'نوشهر',           names: { ar: 'نوشهر',          en: 'Nevsehir',      tr: 'Nevşehir' },      arSource: 'MANUAL:WikipediaAR' }
];

// ─── Load + backup ─────────────────────────────────────────────────────
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
if (!existsSync(BACKUP_PATH)) { copyFileSync(CURATED_PATH, BACKUP_PATH); console.log('Backup written'); }
const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
function hashEntry(e) { return createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0, 16); }
const priorHashes = new Map();
for (const e of orig) priorHashes.set(e.slug, hashEntry(e));

const existingSlugs = new Set(curated.map(e => e.slug));
const existingSourceIds = new Set(curated.filter(e => e.sourceId).map(e => e.sourceId));
const existingTrEnNames = new Set(curated.filter(e => e.countryCode === 'tr' && e.names).map(e => e.names.en).filter(Boolean));

const dupSlugs = [], dupGids = [], dupEnNames = [], scriptFails = [], langKeyFails = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);
    if (existingTrEnNames.has(c.names.en)) dupEnNames.push({ slug: c.slug, en: c.names.en });
    const langs = Object.keys(c.names).sort();
    const expected = ['ar', 'en', 'tr'].sort();
    if (JSON.stringify(langs) !== JSON.stringify(expected)) langKeyFails.push({ slug: c.slug, langs, expected });
    for (const L of langs) {
        if (!scriptGuard(c.names[L], L)) scriptFails.push({ slug: c.slug, lang: L, value: c.names[L] });
    }
}
if (dupSlugs.length || dupGids.length || dupEnNames.length || scriptFails.length || langKeyFails.length) {
    console.error('PREFLIGHT FAIL:');
    if (dupSlugs.length) console.error('  dup slugs: ' + JSON.stringify(dupSlugs));
    if (dupGids.length) console.error('  dup gids: ' + JSON.stringify(dupGids));
    if (dupEnNames.length) console.error('  dup en-names: ' + JSON.stringify(dupEnNames));
    for (const f of langKeyFails) console.error('  lang-keys: ' + f.slug + ' = ' + JSON.stringify(f.langs) + ' expected ' + JSON.stringify(f.expected));
    for (const f of scriptFails) console.error('  script fail: ' + f.slug + '.names.' + f.lang + ' = "' + f.value + '"');
    process.exit(1);
}

for (const c of NEW_CITIES) {
    const entry = {
        slug: c.slug, type: 'city', countryCode: 'tr',
        lat: c.lat, lng: c.lng, timezone: TR_TZ,
        names: c.names,
        admin: { countryAr: 'تركيا', countryEn: 'Turkey', regionAr: c.regionAr, regionEn: c.region, admin1Code: c.admin1 },
        priority: 70, source: 'geonames', sourceId: 'geonames:' + c.geonameId, verified: false
    };
    curated.push(entry);
}

let af = 0;
for (const e of orig) {
    const eNow = curated.find(x => x.slug === e.slug);
    if (!eNow) { console.error('MISSING: ' + e.slug); af++; continue; }
    if (priorHashes.get(e.slug) !== hashEntry(eNow)) { console.error('MUTATED: ' + e.slug); af++; }
}
if (curated.length !== orig.length + NEW_CITIES.length) { console.error('COUNT FAIL'); af++; }
const slugs = curated.map(e => e.slug);
if (slugs.filter((s,i,a) => a.indexOf(s) !== i).length) { console.error('DUP SLUG'); af++; }
const srcs = curated.map(e => e.sourceId).filter(Boolean);
if (srcs.filter((s,i,a) => a.indexOf(s) !== i).length) { console.error('DUP SRC'); af++; }
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','fr','de','es','ms'];
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const k of Object.keys(e.names)) {
        if (FORBIDDEN.includes(k)) { console.error('FORBIDDEN: ' + c.slug + '.names.' + k); af++; }
    }
}
if (af > 0) { console.error('APPLY ABORTED — ' + af + ' invariant fails'); process.exit(1); }

writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
const trOrig = orig.filter(e => e.countryCode === 'tr').length;
const trNow = curated.filter(e => e.countryCode === 'tr').length;
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    trCountBefore: trOrig, trCountAfter: trNow,
    totalCuratedBefore: orig.length, totalCuratedAfter: curated.length,
    addedSlugs: NEW_CITIES.map(c => ({ slug: c.slug, gid: c.geonameId, arSource: c.arSource }))
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-LANG-CITIES-TR-B-FAST — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  TR count             : ' + trOrig + ' → ' + trNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('  GN-clean ar          : ' + NEW_CITIES.filter(c => c.arSource === 'GN-clean').length);
console.log('  MANUAL ar (Wikipedia): ' + NEW_CITIES.filter(c => c.arSource === 'MANUAL:WikipediaAR').length);
console.log('  MANUAL ar (translit) : ' + NEW_CITIES.filter(c => c.arSource === 'MANUAL:translit').length);
console.log('═══════════════════════════════════════════════════════════════════════');
