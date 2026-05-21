// scripts/geodata/_asia_1g_id_fast_supported_l10n_apply.mjs
//
// ASIA-1G-ID-FAST-SUPPORTED-L10N — combined geodata + L10N fast wave (dedupe-first).
//
// Adds 41 Indonesian cities with EXACTLY 3 supported-UI languages:
// ar (universal baseline), en (universal baseline), id (Indonesian — the
// country's native UI lang).
//
// Per place-data-maintenance-policy.md §2: Indonesia requires names.ar +
// names.en + names.id. No ur/bn/other.
//
// Cities sourced from raw GeoNames id-geonames-raw.json by exact
// name-match → highest-population PPL/PPLA/PPLA2 entry, with manual lat/
// lng/admin1 sanity verification.
//
// names.id uses "Kota X" admin form for confirmed Indonesian municipalities
// (Wikipedia id-wp + GeoNames alternatenames confirmed). Plain form used
// for Kabupaten capitals (Maumere, Ende, Sumbawa Besar, Nabire, Banyuwangi,
// Purwokerto, Cilacap, Bengkalis) per id-wp convention.
//
// Jakarta + Yogyakarta deliberately NOT touched (already in curated;
// special administrative regions — not Kota X form).
//
// STRICT INVARIANTS:
//   * Each new entry has EXACTLY {ar, en, id}.
//   * No ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa.
//   * names.ar passes strict Arabic guard (no Urdu-only letters).
//   * names.id passes Latin guard.
//   * Prior 41 ID entries BYTE-IDENTICAL.
//   * IN / PK / BD / non-ID BYTE-IDENTICAL.
//   * No duplicate slug / sourceId.
//   * server.js / js/app.js / index.html / server/place-l10n / docs/:
//     NOT touched.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preAsia1gIdFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/asia-1g-id-fast-supported-l10n-apply-report.json', import.meta.url);

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
    if (lang === 'en') return isCleanLatin(value);
    if (lang === 'id') return isCleanLatin(value);
    return false;
}

// ────────────────────────────────────────────────────────────────────────
// 41 cities — geonames-verified gids (from raw GeoNames name-exact match)
// ────────────────────────────────────────────────────────────────────────
// Format: { slug, geonameId, lat, lng, timezone, featureCode, population,
//          admin1Code, regionEn, regionAr, names:{ar,en,id}, aliases? }
//
// names.ar : manual:translit (standard Indonesian→Arabic phonetic)
// names.en : geonames:name
// names.id : Indonesian municipality form per id-wp:
//            "Kota X" for confirmed Kota (33)
//            "X" plain for Kabupaten capitals (8)
//
const NEW_CITIES = [
    // ── Kota X form (33) — confirmed municipalities ─────────────────────
    { slug: 'depok',            geonameId: '1645524', lat: -6.4,     lng: 106.81861, timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 2145400, admin1Code: '30', regionEn: 'West Java',         regionAr: 'جاوة الغربية',  names: { ar: 'ديبوك',          en: 'Depok',           id: 'Kota Depok' } },
    { slug: 'tasikmalaya',      geonameId: '1624647', lat: -7.3274,  lng: 108.2207,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 741760,  admin1Code: '30', regionEn: 'West Java',         regionAr: 'جاوة الغربية',  names: { ar: 'تاسيكمالايا',     en: 'Tasikmalaya',     id: 'Kota Tasikmalaya' } },
    { slug: 'serang',           geonameId: '1627549', lat: -6.11528, lng: 106.15417, timezone: 'Asia/Jakarta',  featureCode: 'PPLA',   population: 692101,  admin1Code: '33', regionEn: 'Banten',            regionAr: 'بانتن',         names: { ar: 'سيرانغ',          en: 'Serang',          id: 'Kota Serang' } },
    { slug: 'banjarmasin',      geonameId: '1650213', lat: -3.31987, lng: 114.59075, timezone: 'Asia/Makassar', featureCode: 'PPLA2',  population: 657663,  admin1Code: '12', regionEn: 'South Kalimantan',  regionAr: 'كاليمانتان الجنوبية', names: { ar: 'بانجارماسين',     en: 'Banjarmasin',     id: 'Kota Banjarmasin' } },
    { slug: 'cimahi',           geonameId: '1646448', lat: -6.87222, lng: 107.5425,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 590782,  admin1Code: '30', regionEn: 'West Java',         regionAr: 'جاوة الغربية',  names: { ar: 'جيماهي',           en: 'Cimahi',          id: 'Kota Cimahi' } },
    { slug: 'cilegon',          geonameId: '1646511', lat: -6.0144,  lng: 106.0542,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 450271,  admin1Code: '33', regionEn: 'Banten',            regionAr: 'بانتن',         names: { ar: 'جيليغون',          en: 'Cilegon',         id: 'Kota Cilegon' } },
    { slug: 'palu',             geonameId: '1633034', lat: -0.90833, lng: 119.87083, timezone: 'Asia/Makassar', featureCode: 'PPLA',   population: 373218,  admin1Code: '21', regionEn: 'Central Sulawesi',  regionAr: 'سولاويزي الوسطى', names: { ar: 'بالو',             en: 'Palu',            id: 'Kota Palu' } },
    { slug: 'dumai',            geonameId: '1645133', lat: 1.66711,  lng: 101.44316, timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 331832,  admin1Code: '37', regionEn: 'Riau',              regionAr: 'رياو',          names: { ar: 'دوماي',           en: 'Dumai',           id: 'Kota Dumai' } },
    { slug: 'pekalongan',       geonameId: '1631766', lat: -6.8886,  lng: 109.6753,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 317524,  admin1Code: '07', regionEn: 'Central Java',      regionAr: 'جاوة الوسطى',   names: { ar: 'بيكالونغان',      en: 'Pekalongan',      id: 'Kota Pekalongan' } },
    { slug: 'binjai',           geonameId: '1215355', lat: 3.6001,   lng: 98.4854,   timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 279302,  admin1Code: '26', regionEn: 'North Sumatra',     regionAr: 'سومطرة الشمالية', names: { ar: 'بينجاي',          en: 'Binjai',          id: 'Kota Binjai' } },
    { slug: 'pematangsiantar',  geonameId: '1214204', lat: 2.9595,   lng: 99.0687,   timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 274838,  admin1Code: '26', regionEn: 'North Sumatra',     regionAr: 'سومطرة الشمالية', names: { ar: 'بيماتانغ سيانتار', en: 'Pematangsiantar', id: 'Kota Pematangsiantar' } },
    { slug: 'sorong',           geonameId: '1626542', lat: -0.87956, lng: 131.26104, timezone: 'Asia/Jayapura', featureCode: 'PPLA',   population: 254294,  admin1Code: 'PD', regionEn: 'West Papua',        regionAr: 'بابوا الغربية', names: { ar: 'سورونغ',          en: 'Sorong',          id: 'Kota Sorong' } },
    { slug: 'probolinggo',      geonameId: '1630634', lat: -7.7543,  lng: 113.2159,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 246980,  admin1Code: '08', regionEn: 'East Java',         regionAr: 'جاوة الشرقية',  names: { ar: 'بروبولينغو',      en: 'Probolinggo',     id: 'Kota Probolinggo' } },
    { slug: 'singkawang',       geonameId: '1626916', lat: 0.90925,  lng: 108.98463, timezone: 'Asia/Pontianak',featureCode: 'PPL',    population: 246112,  admin1Code: '11', regionEn: 'West Kalimantan',   regionAr: 'كاليمانتان الغربية', names: { ar: 'سينغكاوانغ',      en: 'Singkawang',      id: 'Kota Singkawang' } },
    { slug: 'pasuruan',         geonameId: '1632033', lat: -7.6453,  lng: 112.9075,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 212466,  admin1Code: '08', regionEn: 'East Java',         regionAr: 'جاوة الشرقية',  names: { ar: 'باسوروان',        en: 'Pasuruan',        id: 'Kota Pasuruan' } },
    { slug: 'ternate',          geonameId: '1624041', lat: 0.79065,  lng: 127.38424, timezone: 'Asia/Jayapura', featureCode: 'PPL',    population: 204920,  admin1Code: '29', regionEn: 'North Maluku',      regionAr: 'مالوكو الشمالية', names: { ar: 'تيرنات',          en: 'Ternate',         id: 'Kota Ternate' } },
    { slug: 'madiun',           geonameId: '1636930', lat: -7.6298,  lng: 111.5239,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 202544,  admin1Code: '08', regionEn: 'East Java',         regionAr: 'جاوة الشرقية',  names: { ar: 'ماديون',          en: 'Madiun',          id: 'Kota Madiun' } },
    { slug: 'salatiga',         geonameId: '1629131', lat: -7.33194, lng: 110.49278, timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 201369,  admin1Code: '07', regionEn: 'Central Java',      regionAr: 'جاوة الوسطى',   names: { ar: 'سالاتيغا',        en: 'Salatiga',        id: 'Kota Salatiga' } },
    { slug: 'gorontalo',        geonameId: '1643837', lat: 0.5375,   lng: 123.0625,  timezone: 'Asia/Makassar', featureCode: 'PPLA',   population: 198539,  admin1Code: '34', regionEn: 'Gorontalo',         regionAr: 'غورونتالو',     names: { ar: 'غورونتالو',       en: 'Gorontalo',       id: 'Kota Gorontalo' } },
    { slug: 'lhokseumawe',      geonameId: '1214658', lat: 5.1801,   lng: 97.1507,   timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 196067,  admin1Code: '01', regionEn: 'Aceh',              regionAr: 'آتشيه',         names: { ar: 'لوكسوماوي',       en: 'Lhokseumawe',     id: 'Kota Lhokseumawe' } },
    { slug: 'langsa',           geonameId: '1214724', lat: 4.4683,   lng: 97.9683,   timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 194730,  admin1Code: '01', regionEn: 'Aceh',              regionAr: 'آتشيه',         names: { ar: 'لانغسا',           en: 'Langsa',          id: 'Kota Langsa' } },
    { slug: 'palopo',           geonameId: '1633037', lat: -2.9925,  lng: 120.19694, timezone: 'Asia/Makassar', featureCode: 'PPL',    population: 190867,  admin1Code: '38', regionEn: 'South Sulawesi',    regionAr: 'سولاويزي الجنوبية', names: { ar: 'بالوبو',          en: 'Palopo',          id: 'Kota Palopo' } },
    { slug: 'parepare',         geonameId: '1632353', lat: -4.0135,  lng: 119.6255,  timezone: 'Asia/Makassar', featureCode: 'PPL',    population: 160309,  admin1Code: '38', regionEn: 'South Sulawesi',    regionAr: 'سولاويزي الجنوبية', names: { ar: 'باريباري',        en: 'Parepare',        id: 'Kota Parepare' } },
    { slug: 'bima',             geonameId: '1648759', lat: -8.46006, lng: 118.72667, timezone: 'Asia/Makassar', featureCode: 'PPL',    population: 161362,  admin1Code: '17', regionEn: 'West Nusa Tenggara',regionAr: 'نوسا تنغارا الغربية', names: { ar: 'بيما',           en: 'Bima',            id: 'Kota Bima' } },
    { slug: 'blitar',           geonameId: '1648580', lat: -8.0983,  lng: 112.1681,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 150371,  admin1Code: '08', regionEn: 'East Java',         regionAr: 'جاوة الشرقية',  names: { ar: 'بليتار',           en: 'Blitar',          id: 'Kota Blitar' } },
    { slug: 'mojokerto',        geonameId: '1635111', lat: -7.4664,  lng: 112.4338,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 141785,  admin1Code: '08', regionEn: 'East Java',         regionAr: 'جاوة الشرقية',  names: { ar: 'موجوكيرتو',       en: 'Mojokerto',       id: 'Kota Mojokerto' } },
    { slug: 'payakumbuh',       geonameId: '1631905', lat: -0.2159,  lng: 100.6334,  timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 139576,  admin1Code: '24', regionEn: 'West Sumatra',      regionAr: 'سومطرة الغربية',names: { ar: 'باياكومبوه',      en: 'Payakumbuh',      id: 'Kota Payakumbuh' } },
    { slug: 'magelang',         geonameId: '1636884', lat: -7.47056, lng: 110.21778, timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 121526,  admin1Code: '07', regionEn: 'Central Java',      regionAr: 'جاوة الوسطى',   names: { ar: 'ماغيلانغ',        en: 'Magelang',        id: 'Kota Magelang' } },
    { slug: 'sibolga',          geonameId: '1213855', lat: 1.74016,  lng: 98.78117,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 91265,   admin1Code: '26', regionEn: 'North Sumatra',     regionAr: 'سومطرة الشمالية', names: { ar: 'سيبولغا',         en: 'Sibolga',         id: 'Kota Sibolga' } },
    { slug: 'subulussalam',     geonameId: '6713355', lat: 2.662,    lng: 97.8827,   timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 90751,   admin1Code: '01', regionEn: 'Aceh',              regionAr: 'آتشيه',         names: { ar: 'سبلوسلام',        en: 'Subulussalam',    id: 'Kota Subulussalam' } },
    { slug: 'solok',            geonameId: '1626649', lat: -0.8006,  lng: 100.6571,  timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 73438,   admin1Code: '24', regionEn: 'West Sumatra',      regionAr: 'سومطرة الغربية',names: { ar: 'سولوك',           en: 'Solok',           id: 'Kota Solok' } },
    { slug: 'banjarbaru',       geonameId: '1650217', lat: -3.4406,  lng: 114.8365,  timezone: 'Asia/Makassar', featureCode: 'PPLA',   population: 0,       admin1Code: '12', regionEn: 'South Kalimantan',  regionAr: 'كاليمانتان الجنوبية', names: { ar: 'بانجاربارو',      en: 'Banjarbaru',      id: 'Kota Banjarbaru' } },
    { slug: 'padang-sidempuan', geonameId: '11054666',lat: 1.37155,  lng: 99.27617,  timezone: 'Asia/Jakarta',  featureCode: 'PPL',    population: 0,       admin1Code: '26', regionEn: 'North Sumatra',     regionAr: 'سومطرة الشمالية', names: { ar: 'بادانغ سيديمبوان', en: 'Padang Sidempuan',id: 'Kota Padang Sidempuan' } },

    // ── Plain (8) — Kabupaten capitals, NOT Kota X form per id-wp ───────
    { slug: 'cilacap',          geonameId: '1646559', lat: -7.72639, lng: 109.00944, timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 256996,  admin1Code: '07', regionEn: 'Central Java',      regionAr: 'جاوة الوسطى',   names: { ar: 'جيلاجاب',         en: 'Cilacap',         id: 'Cilacap' } },
    { slug: 'purwokerto',       geonameId: '1630328', lat: -7.42139, lng: 109.23444, timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 230235,  admin1Code: '07', regionEn: 'Central Java',      regionAr: 'جاوة الوسطى',   names: { ar: 'بوروكيرتو',       en: 'Purwokerto',      id: 'Purwokerto' } },
    { slug: 'banyuwangi',       geonameId: '1650077', lat: -8.2325,  lng: 114.35755, timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 117558,  admin1Code: '08', regionEn: 'East Java',         regionAr: 'جاوة الشرقية',  names: { ar: 'بانيواانغي',      en: 'Banyuwangi',      id: 'Banyuwangi' } },
    { slug: 'maumere',          geonameId: '1635815', lat: -8.6199,  lng: 122.2111,  timezone: 'Asia/Makassar', featureCode: 'PPLA2',  population: 87720,   admin1Code: '18', regionEn: 'East Nusa Tenggara',regionAr: 'نوسا تنغارا الشرقية', names: { ar: 'مومير',         en: 'Maumere',         id: 'Maumere' } },
    { slug: 'ende',             geonameId: '1644932', lat: -8.8432,  lng: 121.6623,  timezone: 'Asia/Makassar', featureCode: 'PPLA2',  population: 87269,   admin1Code: '18', regionEn: 'East Nusa Tenggara',regionAr: 'نوسا تنغارا الشرقية', names: { ar: 'إندي',          en: 'Ende',            id: 'Ende' } },
    { slug: 'sumbawa-besar',    geonameId: '1626185', lat: -8.49317, lng: 117.42024, timezone: 'Asia/Makassar', featureCode: 'PPLA2',  population: 62753,   admin1Code: '17', regionEn: 'West Nusa Tenggara',regionAr: 'نوسا تنغارا الغربية', names: { ar: 'سومباوا بيسار', en: 'Sumbawa Besar',   id: 'Sumbawa Besar' } },
    { slug: 'nabire',           geonameId: '1634614', lat: -3.35989, lng: 135.50074, timezone: 'Asia/Jayapura', featureCode: 'PPLA',   population: 43898,   admin1Code: 'PT', regionEn: 'Central Papua',     regionAr: 'بابوا الوسطى',  names: { ar: 'نابيري',           en: 'Nabire',          id: 'Nabire' } },
    { slug: 'bengkalis',        geonameId: '1649169', lat: 1.46667,  lng: 102.13333, timezone: 'Asia/Jakarta',  featureCode: 'PPLA2',  population: 0,       admin1Code: '37', regionEn: 'Riau',              regionAr: 'رياو',          names: { ar: 'بينغكاليس',       en: 'Bengkalis',       id: 'Bengkalis' } }
];

// ─── Load + backup ─────────────────────────────────────────────────────
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
if (!existsSync(BACKUP_PATH)) { copyFileSync(CURATED_PATH, BACKUP_PATH); console.log('Backup written'); }
const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
function hashEntry(e) { return createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0, 16); }
const priorHashes = new Map();
for (const e of orig) priorHashes.set(e.slug, hashEntry(e));

const existingSlugs = new Set(curated.map(e => e.slug));
const existingSourceIds = new Set(curated.map(e => e.sourceId));

// Pre-flight
const dupSlugs = [], dupGids = [], scriptFails = [], langKeyFails = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);
    const langs = Object.keys(c.names).sort();
    if (JSON.stringify(langs) !== JSON.stringify(['ar','en','id'])) {
        langKeyFails.push({ slug: c.slug, langs });
    }
    for (const L of ['ar','en','id']) {
        if (!scriptGuard(c.names[L], L)) scriptFails.push({ slug: c.slug, lang: L, value: c.names[L] });
    }
}
if (dupSlugs.length || dupGids.length || scriptFails.length || langKeyFails.length) {
    console.error('PREFLIGHT FAIL:');
    if (dupSlugs.length) console.error('  dup slugs: ' + JSON.stringify(dupSlugs));
    if (dupGids.length) console.error('  dup gids: ' + JSON.stringify(dupGids));
    for (const f of langKeyFails) console.error('  lang-keys: ' + f.slug + ' = ' + JSON.stringify(f.langs));
    for (const f of scriptFails) console.error('  script fail: ' + f.slug + '.names.' + f.lang + ' = "' + f.value + '"');
    process.exit(1);
}

// Insert
for (const c of NEW_CITIES) {
    const entry = {
        slug: c.slug, type: 'city', countryCode: 'id',
        lat: c.lat, lng: c.lng, timezone: c.timezone,
        names: { ar: c.names.ar, en: c.names.en, id: c.names.id },
        admin: { countryAr: 'إندونيسيا', countryEn: 'Indonesia', regionAr: c.regionAr, regionEn: c.regionEn, admin1Code: c.admin1Code },
        priority: 70, source: 'geonames', sourceId: 'geonames:' + c.geonameId, verified: false
    };
    if (c.aliases) entry.aliases = c.aliases;
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
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','fr','de','tr','es','ms'];
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const k of Object.keys(e.names)) {
        if (FORBIDDEN.includes(k)) { console.error('FORBIDDEN LANG: ' + c.slug + '.names.' + k); af++; }
    }
}
if (af > 0) { console.error('APPLY ABORTED — ' + af + ' invariant fails'); process.exit(1); }

writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
const idOrig = orig.filter(e => e.countryCode === 'id').length;
const idNow = curated.filter(e => e.countryCode === 'id').length;
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    idCountBefore: idOrig, idCountAfter: idNow,
    totalCuratedBefore: orig.length, totalCuratedAfter: curated.length,
    kotaXCount: NEW_CITIES.filter(c => c.names.id.startsWith('Kota ')).length,
    plainCount: NEW_CITIES.filter(c => !c.names.id.startsWith('Kota ')).length,
    addedSlugs: NEW_CITIES.map(c => c.slug)
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1G-ID-FAST-SUPPORTED-L10N — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  ID count             : ' + idOrig + ' → ' + idNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('  Kota X form          : ' + NEW_CITIES.filter(c => c.names.id.startsWith('Kota ')).length);
console.log('  Plain (Kabupaten cap): ' + NEW_CITIES.filter(c => !c.names.id.startsWith('Kota ')).length);
console.log('═══════════════════════════════════════════════════════════════════════');
