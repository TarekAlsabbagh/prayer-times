// scripts/geodata/_asia_1h_my_fast_supported_l10n_apply.mjs
//
// ASIA-1H-MY-FAST-SUPPORTED-L10N — combined geodata + L10N fast wave (dedupe-first).
//
// Adds 32 Malaysian cities with EXACTLY 3 supported-UI languages:
// ar (universal baseline), en (universal baseline), ms (Malay — the
// country's native UI lang).
//
// Per place-data-maintenance-policy.md §2: Malaysia requires names.ar +
// names.en + names.ms. No ur/bn/other.
//
// Cities sourced via direct raw GeoNames lookup
// (db/places/candidates/my-geonames-raw.json) — name-exact-match +
// highest-population. Putrajaya=PPLG (federal admin capital), Subang
// Jaya=PPLX (populated place section) included via direct raw scan.
//
// names.ms: For Malaysian cities, the local form == English form for
// nearly all proper nouns. All 32 use same-as-en (acceptable per policy
// §5 since Malay uses Latin script and city names ARE their canonical
// Malay forms — Melaka/Malacca handled via existing curated entry).
//
// admin1: GeoNames uses FIPS codes (not ISO) — empirically verified:
//   01=Johor, 02=Kedah, 03=Kelantan, 05=Negeri Sembilan, 06=Pahang,
//   07=Perak, 09=Penang, 11=Sarawak (FIPS!), 12=Selangor,
//   16=Sabah (FIPS!), 17=Putrajaya FT.
//
// Dropped from initial list: ampang (admin1=14 KL FT — districts within
// KL Greater Area not added per user "no districts/mukim" policy).
//
// STRICT INVARIANTS: same as ID wave (ar/en/ms only, script guards,
// prior byte-identity, no dup, no code touch).

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preAsia1hMyFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/asia-1h-my-fast-supported-l10n-apply-report.json', import.meta.url);

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
    if (lang === 'en' || lang === 'ms') return isCleanLatin(value);
    return false;
}

// ────────────────────────────────────────────────────────────────────────
// 32 cities — gids/lat/lng/admin1 verified against my-geonames-raw.json
// via name-exact-match + highest-population, 2026-05-21.
// ────────────────────────────────────────────────────────────────────────
const NEW_CITIES = [
    { slug: 'subang-jaya',       geonameId: '8504423',  lat: 3.04384, lng: 101.58062, population: 708296, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'سوبانغ جايا',       en: 'Subang Jaya',       ms: 'Subang Jaya' } },
    { slug: 'iskandar-puteri',   geonameId: '10063567', lat: 1.39324, lng: 103.62322, population: 575977, admin1: '01', region: 'Johor',                               regionAr: 'جوهور',                          names: { ar: 'إسكندر بوتري',      en: 'Iskandar Puteri',   ms: 'Iskandar Puteri' } },
    { slug: 'sungai-petani',     geonameId: '1735498',  lat: 5.647,   lng: 100.48772, population: 544851, admin1: '02', region: 'Kedah',                               regionAr: 'قدح',                            names: { ar: 'سونغاي بيتاني',     en: 'Sungai Petani',     ms: 'Sungai Petani' } },
    { slug: 'kota-kuala-muda',   geonameId: '6847550',  lat: 5.58822, lng: 100.37085, population: 544984, admin1: '02', region: 'Kedah',                               regionAr: 'قدح',                            names: { ar: 'كوتا كوالا مودا',   en: 'Kota Kuala Muda',   ms: 'Kota Kuala Muda' } },
    { slug: 'puchong',           geonameId: '1749822',  lat: 3.0,     lng: 101.61667, population: 375181, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'بوتشونغ',            en: 'Puchong',           ms: 'Puchong' } },
    { slug: 'kluang',            geonameId: '1732811',  lat: 2.03046, lng: 103.31689, population: 323762, admin1: '01', region: 'Johor',                               regionAr: 'جوهور',                          names: { ar: 'كلوانغ',             en: 'Kluang',            ms: 'Kluang' } },
    { slug: 'muar',              geonameId: '1732869',  lat: 2.0442,  lng: 102.5689,  population: 314776, admin1: '01', region: 'Johor',                               regionAr: 'جوهور',                          names: { ar: 'موار',               en: 'Muar',              ms: 'Muar' } },
    { slug: 'klang',             geonameId: '1732905',  lat: 3.03667, lng: 101.44333, population: 240016, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'كلانغ',              en: 'Klang',             ms: 'Klang' } },
    { slug: 'kajang',            geonameId: '10941913', lat: 2.99424, lng: 101.78875, population: 236240, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'كاجانغ',             en: 'Kajang',            ms: 'Kajang' } },
    { slug: 'teluk-intan',       geonameId: '1735459',  lat: 4.02219, lng: 101.02083, population: 232800, admin1: '07', region: 'Perak',                               regionAr: 'بيراك',                          names: { ar: 'تيلوك إنتان',       en: 'Teluk Intan',       ms: 'Teluk Intan' } },
    { slug: 'pasir-mas',         geonameId: '1736372',  lat: 6.04934, lng: 102.13987, population: 230424, admin1: '03', region: 'Kelantan',                            regionAr: 'كلنتان',                         names: { ar: 'باسير ماس',          en: 'Pasir Mas',         ms: 'Pasir Mas' } },
    { slug: 'sungai-buloh',      geonameId: '1735153',  lat: 3.21,    lng: 101.561,   population: 222858, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'سونغاي بولوه',      en: 'Sungai Buloh',      ms: 'Sungai Buloh' } },
    { slug: 'taiping',           geonameId: '1734586',  lat: 4.85,    lng: 100.73333, population: 217647, admin1: '07', region: 'Perak',                               regionAr: 'بيراك',                          names: { ar: 'تايبينغ',            en: 'Taiping',           ms: 'Taiping' } },
    { slug: 'sepang',            geonameId: '1734821',  lat: 2.6931,  lng: 101.7498,  population: 212050, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'سيبانغ',             en: 'Sepang',            ms: 'Sepang' } },
    { slug: 'rawang',            geonameId: '1735150',  lat: 3.3213,  lng: 101.5767,  population: 199095, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'راوانغ',             en: 'Rawang',            ms: 'Rawang' } },
    { slug: 'sibu',              geonameId: '1735902',  lat: 2.3,     lng: 111.81667, population: 198239, admin1: '11', region: 'Sarawak',                             regionAr: 'ساراواك',                        names: { ar: 'سيبو',               en: 'Sibu',              ms: 'Sibu' } },
    { slug: 'kuala-kubu-baharu', geonameId: '1732676',  lat: 3.5638,  lng: 101.6581,  population: 194387, admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'كوالا كوبو باهارو', en: 'Kuala Kubu Baharu', ms: 'Kuala Kubu Baharu' } },
    { slug: 'kulim',             geonameId: '1734393',  lat: 5.36499, lng: 100.56177, population: 170889, admin1: '02', region: 'Kedah',                               regionAr: 'قدح',                            names: { ar: 'كوليم',              en: 'Kulim',             ms: 'Kulim' } },
    { slug: 'batu-pahat',        geonameId: '1732687',  lat: 1.8548,  lng: 102.9325,  population: 156236, admin1: '01', region: 'Johor',                               regionAr: 'جوهور',                          names: { ar: 'باتو باهات',         en: 'Batu Pahat',        ms: 'Batu Pahat' } },
    { slug: 'sitiawan',          geonameId: '1735453',  lat: 4.2168,  lng: 100.6996,  population: 156234, admin1: '07', region: 'Perak',                               regionAr: 'بيراك',                          names: { ar: 'سيتياوان',           en: 'Sitiawan',          ms: 'Sitiawan' } },
    { slug: 'bintulu',           geonameId: '1737486',  lat: 3.16667, lng: 113.03333, population: 151617, admin1: '11', region: 'Sarawak',                             regionAr: 'ساراواك',                        names: { ar: 'بينتولو',            en: 'Bintulu',           ms: 'Bintulu' } },
    { slug: 'port-dickson',      geonameId: '1734815',  lat: 2.52462, lng: 101.79651, population: 119300, admin1: '05', region: 'Negeri Sembilan',                     regionAr: 'نيغري سيمبيلان',                 names: { ar: 'بورت ديكسون',       en: 'Port Dickson',      ms: 'Port Dickson' } },
    { slug: 'maran',             geonameId: '1732637',  lat: 3.586,   lng: 102.773,   population: 111056, admin1: '06', region: 'Pahang',                              regionAr: 'باهانغ',                         names: { ar: 'ماران',              en: 'Maran',             ms: 'Maran' } },
    { slug: 'butterworth',       geonameId: '1735076',  lat: 5.3991,  lng: 100.36382, population: 107591, admin1: '09', region: 'Penang',                              regionAr: 'بنانغ',                          names: { ar: 'بترورث',             en: 'Butterworth',       ms: 'Butterworth' } },
    { slug: 'lahad-datu',        geonameId: '1733953',  lat: 5.02298, lng: 118.32897, population: 105622, admin1: '16', region: 'Sabah',                               regionAr: 'صباح',                           names: { ar: 'لاهاد داتو',         en: 'Lahad Datu',        ms: 'Lahad Datu' } },
    { slug: 'kuala-krai',        geonameId: '1735572',  lat: 5.5313,  lng: 102.19925, population: 105007, admin1: '03', region: 'Kelantan',                            regionAr: 'كلنتان',                         names: { ar: 'كوالا كراي',        en: 'Kuala Krai',        ms: 'Kuala Krai' } },
    { slug: 'seri-manjung',      geonameId: '7792200',  lat: 4.1987,  lng: 100.67,    population: 100000, admin1: '07', region: 'Perak',                               regionAr: 'بيراك',                          names: { ar: 'سيري مانجونغ',      en: 'Seri Manjung',      ms: 'Seri Manjung' } },
    { slug: 'cyberjaya',         geonameId: '6930887',  lat: 2.92281, lng: 101.65718, population: 79200,  admin1: '12', region: 'Selangor',                            regionAr: 'سيلانغور',                       names: { ar: 'سايبرجايا',          en: 'Cyberjaya',         ms: 'Cyberjaya' } },
    { slug: 'semporna',          geonameId: '1733697',  lat: 4.48178, lng: 118.61119, population: 62641,  admin1: '16', region: 'Sabah',                               regionAr: 'صباح',                           names: { ar: 'سيمبورنا',           en: 'Semporna',          ms: 'Semporna' } },
    { slug: 'temerloh',          geonameId: '1735022',  lat: 3.4506,  lng: 102.4176,  population: 59916,  admin1: '06', region: 'Pahang',                              regionAr: 'باهانغ',                         names: { ar: 'تيميرلوه',           en: 'Temerloh',          ms: 'Temerloh' } },
    { slug: 'putrajaya',         geonameId: '6697380',  lat: 2.93527, lng: 101.69112, population: 50000,  admin1: '17', region: 'Federal Territory of Putrajaya',     regionAr: 'بوتراجايا (إقليم فدرالي)',       names: { ar: 'بوتراجايا',          en: 'Putrajaya',         ms: 'Putrajaya' } },
    { slug: 'bentong',           geonameId: '1779790',  lat: 3.52229, lng: 101.90866, population: 49213,  admin1: '06', region: 'Pahang',                              regionAr: 'باهانغ',                         names: { ar: 'بنتونغ',             en: 'Bentong',           ms: 'Bentong' } }
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
    if (JSON.stringify(langs) !== JSON.stringify(['ar','en','ms'])) {
        langKeyFails.push({ slug: c.slug, langs });
    }
    for (const L of ['ar','en','ms']) {
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
        slug: c.slug, type: 'city', countryCode: 'my',
        lat: c.lat, lng: c.lng, timezone: 'Asia/Kuala_Lumpur',
        names: { ar: c.names.ar, en: c.names.en, ms: c.names.ms },
        admin: { countryAr: 'ماليزيا', countryEn: 'Malaysia', regionAr: c.regionAr, regionEn: c.region, admin1Code: c.admin1 },
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
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','fr','de','tr','es','id'];
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const k of Object.keys(e.names)) {
        if (FORBIDDEN.includes(k)) { console.error('FORBIDDEN: ' + c.slug + '.names.' + k); af++; }
    }
}
if (af > 0) { console.error('APPLY ABORTED — ' + af + ' invariant fails'); process.exit(1); }

writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
const myOrig = orig.filter(e => e.countryCode === 'my').length;
const myNow = curated.filter(e => e.countryCode === 'my').length;
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    myCountBefore: myOrig, myCountAfter: myNow,
    totalCuratedBefore: orig.length, totalCuratedAfter: curated.length,
    addedSlugs: NEW_CITIES.map(c => c.slug)
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1H-MY-FAST-SUPPORTED-L10N — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  MY count             : ' + myOrig + ' → ' + myNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('═══════════════════════════════════════════════════════════════════════');
