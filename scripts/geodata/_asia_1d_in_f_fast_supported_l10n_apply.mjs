// scripts/geodata/_asia_1d_in_f_fast_supported_l10n_apply.mjs
//
// ASIA-1D-IN-F-FAST-SUPPORTED-L10N — combined geodata+L10N fast wave (dedupe-first).
//
// Adds 27 next-tier Indian cities (Gujarat / Rajasthan / Andhra Pradesh /
// Telangana focus) with EXACTLY 4 supported-UI languages (ar, en, ur, bn).
// All cities dedupe-verified NOT in curated, NOT duplicate of existing.
//
// 5 from user's inspiration list were excluded due to suspicious low-pop
// geonameId mismatches (real city has different gid):
//   udaipur (30k variant — Rajasthan major Udaipur uses different gid),
//   bhimavaram (14k — major one is ~140k), gandhinagar (9k — Gujarat
//   capital uses different gid), pali (9k), jetpur (8k).
// 4 from inspiration list not in candidates: tenali, tadipatri,
// chilakaluripet, morbi.
//
// STRICT INVARIANTS: same as IN-E (ar/en/ur/bn only, script guards,
// prior-byte-identity, no dup slug/gid, no code touch).

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preAsia1dInFFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/asia-1d-in-f-fast-supported-l10n-apply-report.json', import.meta.url);

const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
function isCleanArabic(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]|[A-Za-z]|[ऀ-ॿ]|[஀-௿]/.test(s)) return false;
    if (URDU_ONLY.test(s)) return false;
    return true;
}
function isCleanUrdu(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]|[A-Za-z]|[ऀ-ॿ]/.test(s)) return false;
    return true;
}
function isCleanBengali(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[ঀ-৿]/.test(s)) return false;
    if (/[؀-ۿ]|[A-Za-z]|[ऀ-ॿ]|[஀-௿]/.test(s)) return false;
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
    if (lang === 'ur') return isCleanUrdu(value);
    if (lang === 'bn') return isCleanBengali(value);
    if (lang === 'en') return isCleanLatin(value);
    return false;
}

// ────────────────────────────────────────────────────────────────────────
// CITY LIST — 27 IN cities (sorted by pop desc)
// Source codes inline:
//   geonames:alt = from raw alternatenames (clean per-lang script)
//   manual:translit = standard Indic→target-lang transliteration
// ────────────────────────────────────────────────────────────────────────
const NEW_CITIES = [
    {
        slug: 'bhilwara', geonameId: '1275960', lat: 25.347, lng: 74.6411,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 359483,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'بهيلوارا',         // manual:translit
            en: 'Bhilwara',
            ur: 'بھیلواڑہ',         // manual:translit (Urdu بھ ی ڑ ہ)
            bn: 'ভিলওয়াড়া'       // manual:translit
        }
    },
    {
        slug: 'gandhidham', geonameId: '1271717', lat: 23.0833, lng: 70.1333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 247992,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'غانديدام',         // manual:translit
            en: 'Gandhidham',       // geonames:name (Gāndhīdhām — diacritics stripped)
            ur: 'گاندھی دھام',      // manual:translit (Urdu گ ھ)
            bn: 'গান্ধীধাম'        // manual:translit
        }
    },
    {
        slug: 'sikar', geonameId: '1256320', lat: 27.6094, lng: 75.1399,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 244497,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'سيكر',             // manual:translit
            en: 'Sikar',            // geonames:name (Sīkar — diacritics stripped)
            ur: 'سیکر',             // manual:translit (Urdu ی)
            bn: 'সিকার'            // manual:translit
        }
    },
    {
        slug: 'sri-ganganagar', geonameId: '1271685', lat: 29.9094, lng: 73.875,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 237780,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'سري غانغانغار',    // manual:translit
            en: 'Sri Ganganagar',
            ur: 'سری گنگانگر',      // manual:translit (Urdu ی گ)
            bn: 'শ্রী গঙ্গানগর'    // manual:translit
        }
    },
    {
        slug: 'anand', geonameId: '1278685', lat: 22.55, lng: 72.95,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 209410,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'آنند',             // geonames:alt
            en: 'Anand',
            ur: 'آنند',             // same as ar (Urdu accepts Arabic block)
            bn: 'আনন্দ'            // geonames:alt
        }
    },
    {
        slug: 'madanapalle', geonameId: '1264621', lat: 13.55, lng: 78.5,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 180180,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'مادانابالي',       // manual:translit
            en: 'Madanapalle',
            ur: 'مدنپلی',           // geonames:alt (Urdu پ ی)
            bn: 'মদনাপাল্লে'      // geonames:alt
        }
    },
    {
        slug: 'surendranagar', geonameId: '1255349', lat: 22.7333, lng: 71.6333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 179628,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'سوريندرانغار',     // manual:translit
            en: 'Surendranagar',
            ur: 'سریندر نگر',       // manual:translit (Urdu ی گ)
            bn: 'সুরেন্দ্রনগর'    // manual:translit
        }
    },
    {
        slug: 'veraval', geonameId: '1253237', lat: 20.9, lng: 70.3667,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 171121,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'فيرافال',          // manual:translit
            en: 'Veraval',          // geonames:name (Verāval — diacritics stripped)
            ur: 'ویراول',           // manual:translit (Urdu ی)
            bn: 'বেরাবল'           // manual:translit
        }
    },
    {
        slug: 'navsari', geonameId: '1261653', lat: 20.85, lng: 72.9167,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 171109,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'نافساري',          // manual:translit
            en: 'Navsari',
            ur: 'نوساری',           // manual:translit (Urdu ی)
            bn: 'নবসারি'          // manual:translit
        }
    },
    {
        slug: 'bharuch', geonameId: '1276100', lat: 21.7, lng: 72.9667,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 169007,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'بهاروش',           // manual:translit
            en: 'Bharuch',          // geonames:name (Bharūch — diacritics stripped)
            ur: 'بھروچ',            // manual:translit (Urdu بھ چ)
            bn: 'ভারুচ'            // manual:translit
        }
    },
    {
        slug: 'tonk', geonameId: '1254241', lat: 26.1667, lng: 75.7833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 165294,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'تونك',             // geonames:alt
            en: 'Tonk',
            ur: 'ٹونک',             // geonames:alt (Urdu ٹ ک)
            bn: 'টঙ্ক'              // geonames:alt
        }
    },
    {
        slug: 'hanumangarh', geonameId: '1270407', lat: 29.5833, lng: 74.3167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 155687,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'هانومانغار',       // manual:translit
            en: 'Hanumangarh',      // geonames:name (Hanumāngarh — diacritics stripped)
            ur: 'ہنومان گڑھ',       // manual:translit (Urdu ہ گ ڑ)
            bn: 'হনুমানগড়'       // manual:translit
        }
    },
    {
        slug: 'porbandar', geonameId: '1259395', lat: 21.6422, lng: 69.6093,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 152760,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'بوربندر',          // geonames:alt
            en: 'Porbandar',
            ur: 'پوربندر',          // manual:translit (Urdu پ)
            bn: 'পোরবন্দর'        // geonames:alt
        }
    },
    {
        slug: 'hindupur', geonameId: '1270079', lat: 13.8333, lng: 77.4833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 151677,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'هندوبور',          // manual:translit
            en: 'Hindupur',
            ur: 'ہندو پور',         // manual:translit (Urdu ہ پ)
            bn: 'হিন্দুপুর'        // manual:translit
        }
    },
    {
        slug: 'beawar', geonameId: '1276634', lat: 26.1, lng: 74.3167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 151152,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'بيوار',            // manual:translit
            en: 'Beawar',           // geonames:name (Beāwar — diacritics stripped)
            ur: 'بیاور',            // manual:translit (Urdu ی)
            bn: 'বিয়াওয়ার'      // manual:translit
        }
    },
    {
        slug: 'bhuj', geonameId: '1275812', lat: 23.25, lng: 69.8167,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 148834,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'بوج',              // geonames:alt
            en: 'Bhuj',
            ur: 'بھوج',             // geonames:alt (Urdu بھ)
            bn: 'ভূজ'              // geonames:alt
        }
    },
    {
        slug: 'godhra', geonameId: '1271107', lat: 22.7667, lng: 73.6167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 143644,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'غودرا',            // manual:translit
            en: 'Godhra',
            ur: 'گودھرا',           // geonames:alt (Urdu گ ھ)
            bn: 'গোধরা'           // geonames:alt
        }
    },
    {
        slug: 'palanpur', geonameId: '1260777', lat: 24.1722, lng: 72.4344,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 141592,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'بالانبور',         // manual:translit
            en: 'Palanpur',         // geonames:name (Pālanpur — diacritics stripped)
            ur: 'پالن پور',         // manual:translit (Urdu پ)
            bn: 'পালনপুর'         // manual:translit
        }
    },
    {
        slug: 'valsad', geonameId: '1253468', lat: 20.6167, lng: 72.9333,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 139764,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'فالساد',           // manual:translit
            en: 'Valsad',           // geonames:name (Valsād — diacritics stripped)
            ur: 'ولساڈ',            // manual:translit (Urdu ڈ)
            bn: 'বলসাড়'         // manual:translit
        }
    },
    {
        slug: 'botad', geonameId: '1275218', lat: 22.1667, lng: 71.6667,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 130327,
        admin1Code: '09', regionEn: 'Gujarat', regionAr: 'غوجارات',
        names: {
            ar: 'بوتاد',            // manual:translit
            en: 'Botad',
            ur: 'بوٹاد',            // manual:translit (Urdu ٹ)
            bn: 'বোটাদ'           // manual:translit
        }
    },
    {
        slug: 'dharmavaram', geonameId: '1272842', lat: 14.4147, lng: 77.7211,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 121874,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'دارمافارام',       // manual:translit
            en: 'Dharmavaram',
            ur: 'دھرماورم',         // manual:translit (Urdu ھ)
            bn: 'ধর্মাবরম'        // manual:translit
        }
    },
    {
        slug: 'adilabad', geonameId: '1279344', lat: 19.6667, lng: 78.5333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 118526,
        admin1Code: '40', regionEn: 'Telangana', regionAr: 'تيلانغانا',
        names: {
            ar: 'عادل آباد',        // manual:translit (named after the Adil dynasty)
            en: 'Adilabad',         // geonames:name (Ādilābād — diacritics stripped)
            ur: 'عادل آباد',        // same as ar (Urdu accepts Arabic block)
            bn: 'আদিলাবাদ'        // manual:translit
        }
    },
    {
        slug: 'gudivada', geonameId: '1270801', lat: 16.4333, lng: 80.9833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 118167,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'غوديفادا',         // manual:translit
            en: 'Gudivada',         // geonames:name (Gudivāda — diacritics stripped)
            ur: 'گدیواڑہ',          // manual:translit (Urdu گ ی ڑ ہ)
            bn: 'গুদিবাড়া'       // manual:translit
        }
    },
    {
        slug: 'narasaraopet', geonameId: '1261848', lat: 16.2333, lng: 80.05,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 117489,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'ناراساراوبت',      // manual:translit
            en: 'Narasaraopet',
            ur: 'نراساراو پیٹ',     // geonames:alt (Urdu پ ٹ)
            bn: 'নারাসারাওপেত'   // geonames:alt
        }
    },
    {
        slug: 'chittorgarh', geonameId: '1274040', lat: 24.8889, lng: 74.6269,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 116406,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'شيتورغار',         // manual:translit (alt was شيتورجاره with extra ه)
            en: 'Chittorgarh',
            ur: 'چتور گڑھ',         // geonames:alt (Urdu چ گ ڑ ھ)
            bn: 'চিতোরগড়'        // geonames:alt
        }
    },
    {
        slug: 'banswara', geonameId: '1277214', lat: 23.55, lng: 74.4333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 101017,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        names: {
            ar: 'بانسوارا',         // manual:translit
            en: 'Banswara',         // geonames:name (Bānswāra — diacritics stripped)
            ur: 'بانسواڑہ',         // manual:translit (Urdu ڑ ہ)
            bn: 'বাঁসওয়াড়া'     // manual:translit
        }
    },
    {
        slug: 'kavali', geonameId: '1267394', lat: 14.9167, lng: 79.9833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 90099,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'كافالي',           // manual:translit
            en: 'Kavali',           // geonames:name (Kāvali — diacritics stripped)
            ur: 'کاولی',            // manual:translit (Urdu ک ی)
            bn: 'কাবালি'          // manual:translit
        }
    }
];

const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

if (!existsSync(BACKUP_PATH)) {
    copyFileSync(CURATED_PATH, BACKUP_PATH);
    console.log('Backup written: ' + BACKUP_PATH.pathname);
}
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
    if (JSON.stringify(langs) !== JSON.stringify(['ar','bn','en','ur'])) {
        langKeyFails.push({ slug: c.slug, langs });
    }
    for (const L of ['ar','en','ur','bn']) {
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
        slug: c.slug, type: 'city', countryCode: 'in',
        lat: c.lat, lng: c.lng, timezone: c.timezone,
        names: { ar: c.names.ar, en: c.names.en, ur: c.names.ur, bn: c.names.bn },
        admin: { countryAr: 'الهند', countryEn: 'India', regionAr: c.regionAr, regionEn: c.regionEn, admin1Code: c.admin1Code },
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

if (af > 0) { console.error('APPLY ABORTED — ' + af + ' invariant fails'); process.exit(1); }

writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
const inOrig = orig.filter(e => e.countryCode === 'in').length;
const inNow = curated.filter(e => e.countryCode === 'in').length;
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    inCountBefore: inOrig, inCountAfter: inNow,
    totalCuratedBefore: orig.length, totalCuratedAfter: curated.length,
    addedSlugs: NEW_CITIES.map(c => c.slug)
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-IN-F-FAST-SUPPORTED-L10N — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  IN count             : ' + inOrig + ' → ' + inNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('  Invariants passed    : all');
console.log('═══════════════════════════════════════════════════════════════════════');
