// scripts/geodata/_supported_local_lang_cities_tr_fast_apply.mjs
//
// SUPPORTED-LOCAL-LANG-CITIES-TR-FAST — Sub-phase C of
// SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST.
//
// Adds 30 Turkish cities with EXACTLY names.{ar, en, tr} per place-data-
// maintenance-policy §2 (Turkey requires ar/en/tr only).
//
// Strict NAME_AR_FIX policy:
//   GeoNames raw `name.ar` field for 15 of 30 cities contains Urdu/Persian-
//   only letters (ہ ی پ ے ګ گ) — these are POLLUTED Arabic that would fail
//   Stage 3.5 strict isCleanArabic. User-approved manual transliteration is
//   used for ALL 15 polluted entries + 15 cities with clean GeoNames Arabic
//   are kept as-is, all sourced per user direction in TR-PREFLIGHT-1.
//
// names.en convention: ASCII (no Turkish diacritics) — matches existing
//   diyarbakir/sanliurfa curated pattern.
// names.tr convention: full Turkish diacritics (İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü).
//
// GeoNames TR uses FIPS admin1 codes, NOT ISO 3166-2:TR. Some newer
// provinces (1989+) have FIPS codes differing from ISO:
//   ISO 80 (Osmaniye)    → FIPS 91
//   ISO 72 (Batman)      → FIPS 76
//   ISO 33 (Mersin)      → FIPS 32 [Tarsus is in Mersin]
//   ISO 68 (Aksaray)     → FIPS 75
//   ISO 71 (Kırıkkale)   → FIPS 79
//   ISO 70 (Karaman)     → FIPS 78
//
// For these 7 mismatched cases, regionAr/regionEn is set manually
// (correct semantic) while admin1Code keeps the GeoNames FIPS value
// (matches raw source data — diagnostic only).

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preSupportedTrFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-lang-cities-tr-fast-apply-report.json', import.meta.url);

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

// ────────────────────────────────────────────────────────────────────────
// 30 cities — sorted by population. Data verified via Stage-3 candidates.
// names.ar source key:
//   GN-clean = GeoNames `name.ar` was clean Arabic (passed isCleanArabic)
//   MANUAL = user-approved manual translit (per TR-PREFLIGHT-1 §4b);
//            see closure report for source attribution per city
// ────────────────────────────────────────────────────────────────────────
const TR_TZ = 'Europe/Istanbul';

const NEW_CITIES = [
    // Group 4a — Clean GeoNames Arabic (15 cities)
    { slug: 'eskisehir',      geonameId: '315202', lat: 39.77667, lng: 30.52056, population: 921630, admin1: '26', region: 'Eskişehir',     regionAr: 'إسكي شهر',         names: { ar: 'أسكي شهر',         en: 'Eskisehir',      tr: 'Eskişehir' },      arSource: 'GN-clean' },
    { slug: 'van',            geonameId: '298117', lat: 38.49457, lng: 43.38323, population: 525016, admin1: '65', region: 'Van',           regionAr: 'فان',             names: { ar: 'وان',              en: 'Van',            tr: 'Van' },            arSource: 'GN-clean' },
    { slug: 'samsun',         geonameId: '740264', lat: 41.27976, lng: 36.3361,  population: 394050, admin1: '55', region: 'Samsun',        regionAr: 'سامسون',          names: { ar: 'سامسون',           en: 'Samsun',         tr: 'Samsun' },         arSource: 'GN-clean' },
    { slug: 'kahramanmaras',  geonameId: '310859', lat: 37.5847,  lng: 36.92641, population: 384953, admin1: '46', region: 'Kahramanmaraş', regionAr: 'كهرمان مرعش',     names: { ar: 'كهرمان مرعش',      en: 'Kahramanmaras',  tr: 'Kahramanmaraş' },  arSource: 'GN-clean' },
    { slug: 'usak',           geonameId: '298299', lat: 38.67351, lng: 29.4058,  population: 369433, admin1: '64', region: 'Uşak',          regionAr: 'أوشاك',           names: { ar: 'أوشاك',            en: 'Usak',           tr: 'Uşak' },           arSource: 'GN-clean' },
    { slug: 'denizli',        geonameId: '317109', lat: 37.77417, lng: 29.0875,  population: 313238, admin1: '20', region: 'Denizli',       regionAr: 'دنيزلي',          names: { ar: 'دنيزلي',           en: 'Denizli',        tr: 'Denizli' },        arSource: 'GN-clean' },
    { slug: 'corum',          geonameId: '748879', lat: 40.54889, lng: 34.95333, population: 269595, admin1: '19', region: 'Çorum',         regionAr: 'تشوروم',          names: { ar: 'جوروم',            en: 'Corum',          tr: 'Çorum' },          arSource: 'GN-clean' },
    { slug: 'sivas',          geonameId: '300619', lat: 39.74833, lng: 37.01611, population: 264022, admin1: '58', region: 'Sivas',         regionAr: 'سيواس',           names: { ar: 'سيواس',            en: 'Sivas',          tr: 'Sivas' },          arSource: 'GN-clean' },
    { slug: 'afyonkarahisar', geonameId: '325303', lat: 38.75667, lng: 30.54333, population: 251799, admin1: '03', region: 'Afyonkarahisar',regionAr: 'أفيون قره حصار',   names: { ar: 'أفيون قره حصار',  en: 'Afyonkarahisar', tr: 'Afyonkarahisar' }, arSource: 'GN-clean' },
    { slug: 'iskenderun',     geonameId: '311111', lat: 36.58718, lng: 36.17347, population: 251682, admin1: '31', region: 'Hatay',         regionAr: 'هاتاي',           names: { ar: 'إسكندرونة',        en: 'Iskenderun',     tr: 'İskenderun' },     arSource: 'GN-clean' },
    { slug: 'ordu',           geonameId: '741100', lat: 40.97782, lng: 37.89047, population: 229214, admin1: '52', region: 'Ordu',          regionAr: 'أوردو',           names: { ar: 'أوردو',            en: 'Ordu',           tr: 'Ordu' },           arSource: 'GN-clean' },
    { slug: 'osmaniye',       geonameId: '303195', lat: 37.07417, lng: 36.24778, population: 202837, admin1: '91', region: 'Osmaniye',      regionAr: 'عثمانية',         names: { ar: 'عثمانية',          en: 'Osmaniye',       tr: 'Osmaniye' },       arSource: 'GN-clean' },
    { slug: 'corlu',          geonameId: '748893', lat: 41.16069, lng: 27.80093, population: 202578, admin1: '59', region: 'Tekirdağ',      regionAr: 'تكيرداغ',          names: { ar: 'تشورلو',           en: 'Corlu',          tr: 'Çorlu' },          arSource: 'GN-clean' },
    { slug: 'izmit',          geonameId: '745028', lat: 40.76499, lng: 29.92928, population: 196571, admin1: '41', region: 'Kocaeli',       regionAr: 'كوجالي',           names: { ar: 'إزميت',            en: 'Izmit',          tr: 'İzmit' },          arSource: 'GN-clean' },
    { slug: 'bolu',           geonameId: '750516', lat: 40.73583, lng: 31.60611, population: 184682, admin1: '14', region: 'Bolu',          regionAr: 'بولو',            names: { ar: 'بولو',             en: 'Bolu',           tr: 'Bolu' },           arSource: 'GN-clean' },

    // Group 4b — Manual NAME_AR_FIX (15 cities, GeoNames Arabic was polluted)
    { slug: 'malatya',        geonameId: '304922', lat: 38.35018, lng: 38.31667, population: 750491, admin1: '44', region: 'Malatya',       regionAr: 'ملاطية',          names: { ar: 'ملاطية',           en: 'Malatya',        tr: 'Malatya' },        arSource: 'MANUAL:WikipediaAR' },
    { slug: 'batman',         geonameId: '321836', lat: 37.88738, lng: 41.13221, population: 452157, admin1: '76', region: 'Batman',        regionAr: 'باتمان',          names: { ar: 'باتمان',           en: 'Batman',         tr: 'Batman' },         arSource: 'MANUAL:translit' },
    { slug: 'elazig',         geonameId: '315808', lat: 38.67431, lng: 39.22321, population: 443363, admin1: '23', region: 'Elazığ',        regionAr: 'إيلازيغ',         names: { ar: 'إيلازيغ',          en: 'Elazig',         tr: 'Elazığ' },         arSource: 'MANUAL:translit' },
    { slug: 'antakya',        geonameId: '323779', lat: 36.20655, lng: 36.15722, population: 399045, admin1: '31', region: 'Hatay',         regionAr: 'هاتاي',           names: { ar: 'أنطاكيا',          en: 'Antakya',        tr: 'Antakya' },        arSource: 'MANUAL:WikipediaAR' },
    { slug: 'alanya',         geonameId: '324190', lat: 36.54375, lng: 31.99982, population: 364180, admin1: '07', region: 'Antalya',       regionAr: 'أنطاليا',         names: { ar: 'ألانيا',           en: 'Alanya',         tr: 'Alanya' },         arSource: 'MANUAL:WikipediaAR' },
    { slug: 'tarsus',         geonameId: '299817', lat: 36.91766, lng: 34.89277, population: 350732, admin1: '32', region: 'Mersin',        regionAr: 'مرسين',           names: { ar: 'طرسوس',            en: 'Tarsus',         tr: 'Tarsus' },         arSource: 'MANUAL:WikipediaAR' },
    { slug: 'aksaray',        geonameId: '324496', lat: 38.37255, lng: 34.02537, population: 327575, admin1: '75', region: 'Aksaray',       regionAr: 'أق سراي',         names: { ar: 'أق سراي',          en: 'Aksaray',        tr: 'Aksaray' },        arSource: 'MANUAL:WikipediaAR' },
    { slug: 'adiyaman',       geonameId: '325330', lat: 37.76441, lng: 38.27629, population: 290883, admin1: '02', region: 'Adıyaman',      regionAr: 'أديامان',         names: { ar: 'أديامان',          en: 'Adiyaman',       tr: 'Adıyaman' },       arSource: 'MANUAL:translit' },
    { slug: 'adapazari',      geonameId: '752850', lat: 40.78056, lng: 30.40333, population: 286787, admin1: '54', region: 'Sakarya',       regionAr: 'سكاريا',          names: { ar: 'أدابازاري',        en: 'Adapazari',      tr: 'Adapazarı' },      arSource: 'MANUAL:translit' },
    { slug: 'gebze',          geonameId: '747014', lat: 40.80276, lng: 29.43068, population: 281436, admin1: '41', region: 'Kocaeli',       regionAr: 'كوجالي',           names: { ar: 'غبزة',             en: 'Gebze',          tr: 'Gebze' },          arSource: 'MANUAL:translit' },
    { slug: 'balikesir',      geonameId: '322165', lat: 39.64917, lng: 27.88611, population: 238151, admin1: '10', region: 'Balıkesir',     regionAr: 'باليكسير',        names: { ar: 'باليكسير',         en: 'Balikesir',      tr: 'Balıkesir' },      arSource: 'MANUAL:translit' },
    { slug: 'kirikkale',      geonameId: '307654', lat: 39.84528, lng: 33.50639, population: 186960, admin1: '79', region: 'Kırıkkale',     regionAr: 'كيريكالي',        names: { ar: 'كيريكالي',         en: 'Kirikkale',      tr: 'Kırıkkale' },      arSource: 'MANUAL:translit' },
    { slug: 'kuetahya',       geonameId: '305268', lat: 39.42417, lng: 29.98333, population: 185008, admin1: '43', region: 'Kütahya',       regionAr: 'كوتاهية',          names: { ar: 'كوتاهية',          en: 'Kutahya',        tr: 'Kütahya' },        arSource: 'MANUAL:translit' },
    { slug: 'edirne',         geonameId: '747712', lat: 41.67719, lng: 26.55597, population: 180002, admin1: '22', region: 'Edirne',        regionAr: 'أدرنة',           names: { ar: 'أدرنة',            en: 'Edirne',         tr: 'Edirne' },         arSource: 'MANUAL:WikipediaAR' },
    { slug: 'karaman',        geonameId: '309527', lat: 37.18111, lng: 33.215,   population: 175390, admin1: '78', region: 'Karaman',       regionAr: 'قرمان',           names: { ar: 'قرمان',            en: 'Karaman',        tr: 'Karaman' },        arSource: 'MANUAL:translit' }
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
const existingTrLocalNames = new Set(curated.filter(e => e.countryCode === 'tr' && e.names).map(e => e.names.tr).filter(Boolean));

// Pre-flight
const dupSlugs = [], dupGids = [], dupEnNames = [], dupLocalNames = [], scriptFails = [], langKeyFails = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);
    if (existingTrEnNames.has(c.names.en)) dupEnNames.push({ slug: c.slug, en: c.names.en });
    if (existingTrLocalNames.has(c.names.tr)) dupLocalNames.push({ slug: c.slug, tr: c.names.tr });
    const langs = Object.keys(c.names).sort();
    const expected = ['ar', 'en', 'tr'].sort();
    if (JSON.stringify(langs) !== JSON.stringify(expected)) langKeyFails.push({ slug: c.slug, langs, expected });
    for (const L of langs) {
        if (!scriptGuard(c.names[L], L)) scriptFails.push({ slug: c.slug, lang: L, value: c.names[L] });
    }
}
if (dupSlugs.length || dupGids.length || dupEnNames.length || dupLocalNames.length || scriptFails.length || langKeyFails.length) {
    console.error('PREFLIGHT FAIL:');
    if (dupSlugs.length) console.error('  dup slugs: ' + JSON.stringify(dupSlugs));
    if (dupGids.length) console.error('  dup gids: ' + JSON.stringify(dupGids));
    if (dupEnNames.length) console.error('  dup en-names: ' + JSON.stringify(dupEnNames));
    if (dupLocalNames.length) console.error('  dup local-names: ' + JSON.stringify(dupLocalNames));
    for (const f of langKeyFails) console.error('  lang-keys: ' + f.slug + ' = ' + JSON.stringify(f.langs) + ' expected ' + JSON.stringify(f.expected));
    for (const f of scriptFails) console.error('  script fail: ' + f.slug + '.names.' + f.lang + ' = "' + f.value + '"');
    process.exit(1);
}

// Insert
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

// Post-mutation invariants
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
console.log(' SUPPORTED-LOCAL-LANG-CITIES-TR-FAST — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  TR count             : ' + trOrig + ' → ' + trNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('  GN-clean ar          : ' + NEW_CITIES.filter(c => c.arSource === 'GN-clean').length);
console.log('  MANUAL ar (Wikipedia): ' + NEW_CITIES.filter(c => c.arSource === 'MANUAL:WikipediaAR').length);
console.log('  MANUAL ar (translit) : ' + NEW_CITIES.filter(c => c.arSource === 'MANUAL:translit').length);
console.log('═══════════════════════════════════════════════════════════════════════');
