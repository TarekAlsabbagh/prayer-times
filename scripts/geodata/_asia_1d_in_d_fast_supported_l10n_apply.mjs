// scripts/geodata/_asia_1d_in_d_fast_supported_l10n_apply.mjs
//
// ASIA-1D-IN-D-FAST-SUPPORTED-L10N — combined geodata+L10N fast wave.
//
// Adds 33 next-tier Indian cities to db/places/curated-places.json with
// EXACTLY 4 supported-UI languages (ar, en, ur, bn) — no hi/ta/mr/etc.
//
// Sources per the place-data-maintenance-policy.md (§5):
//   names.en : GeoNames `name` field (accents stripped where applicable
//              to match curated-places.json convention).
//   names.ar : Standard Arabic transliteration. Where GeoNames raw
//              `alternatenames` contains a pure-Arabic-script form (no
//              Urdu-specific letters گ پ چ ژ ٹ ڈ ڑ ں ھ ہ ے), use that.
//              Otherwise manual standard transliteration.
//   names.ur : GeoNames raw if present (Urdu-script form). Otherwise
//              manual standard Urdu transliteration. Pure-Arabic forms
//              are acceptable since Urdu uses Arabic script.
//   names.bn : GeoNames raw if present. Otherwise Bengali Wikipedia
//              canonical title. Manual standard transliteration as last
//              resort with explicit citation in closure.
//
// STRICT INVARIANTS (verified post-mutation):
//   1. Each new entry has EXACTLY 4 lang keys: ar, en, ur, bn.
//   2. No hi, ta, mr, te, kn, ml, gu, pa, or, as, sa.
//   3. names.ur passes Urdu-script guard (Arabic block, no Latin/Bengali).
//   4. names.bn passes Bengali-script guard (Bengali block, no Arabic/Latin).
//   5. Prior 109 IN entries BYTE-IDENTICAL.
//   6. PK/BD/non-IN entries BYTE-IDENTICAL.
//   7. No slug changes anywhere.
//   8. No duplicate slug (incl. against existing curated).
//   9. No duplicate sourceId / geonameId.
//   10. server.js / js/app.js / index.html / server/place-l10n: NOT touched.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preAsia1dInDFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/asia-1d-in-d-fast-supported-l10n-apply-report.json', import.meta.url);

// Per-lang script validator (mirrors server/place-l10n/index.js).
function isCleanScript(s, lang) {
    if (!s || typeof s !== 'string') return false;
    const hasArabic  = /[؀-ۿ]/.test(s);
    const hasBengali = /[ঀ-৿]/.test(s);
    const hasLatin   = /[A-Za-z]/.test(s);
    const hasDevanagari = /[ऀ-ॿ]/.test(s);
    const hasTamil   = /[஀-௿]/.test(s);
    if (hasDevanagari || hasTamil) return false;
    if (lang === 'ar' || lang === 'ur') return hasArabic && !hasBengali && !hasLatin;
    if (lang === 'bn')                  return hasBengali && !hasArabic && !hasLatin;
    return hasLatin && !hasArabic && !hasBengali;
}

// ────────────────────────────────────────────────────────────────────────
// CITY LIST — 33 next-tier Indian cities. Each entry includes:
//   slug, geonameId, lat, lng, timezone, featureCode,
//   names.{ar, en, ur, bn}, optional aliases.en, admin metadata, source.
// ────────────────────────────────────────────────────────────────────────
// names.ar / names.ur sources are tagged inline. names.bn likewise.
// "geonames:alt" = the value appears verbatim in GeoNames alternatenames.
// "manual:translit" = standard transliteration (cited in closure §5).
// "wikipedia:<lang>" = Wikipedia canonical title in that language.
//
const NEW_CITIES = [
    {
        slug: 'jalgaon', geonameId: '1269407', lat: 21.0167, lng: 75.5667,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 460228,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'جالغاون',        // manual:translit (Indic g→غ, V→و)
            en: 'Jalgaon',         // geonames:name
            ur: 'جلگاؤں',          // geonames:alt
            bn: 'জালগাঁও'          // geonames:alt
        }
    },
    {
        slug: 'akola', geonameId: '1279105', lat: 20.7333, lng: 77.0,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 428857,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'أكولا',           // manual:translit
            en: 'Akola',           // geonames:name
            ur: 'اکولہ',           // geonames:alt
            bn: 'অকোলা'           // geonames:alt
        }
    },
    {
        slug: 'ballari', geonameId: '1276509', lat: 15.15, lng: 76.9167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 410445,
        admin1Code: '19', regionEn: 'Karnataka', regionAr: 'كارناتاكا',
        names: {
            ar: 'بلاري',           // geonames:alt
            en: 'Ballari',         // geonames:name
            ur: 'بلاری',           // geonames:alt
            bn: 'বেল্লারী'         // geonames:alt
        },
        aliases: { en: ['Bellary'] }   // 2014 rename
    },
    {
        slug: 'dhule', geonameId: '1272691', lat: 20.9, lng: 74.7833,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 375559,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'دهولي',           // manual:translit (Arabic ه ي)
            en: 'Dhule',           // geonames:name
            ur: 'دھولے',           // manual:translit (Urdu ھ ے) — supplements geonames "دھول"
            bn: 'ধুলে'             // geonames:alt
        }
    },
    {
        slug: 'avadi', geonameId: '1278130', lat: 13.1147, lng: 80.1098,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 345996,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'أفادي',           // manual:translit (Indic V→ف)
            en: 'Avadi',           // geonames:name
            ur: 'اوادی',           // manual:translit (Urdu و ی)
            bn: 'আভাদি'           // manual:translit
        }
    },
    {
        slug: 'parbhani', geonameId: '1260341', lat: 19.2667, lng: 76.7667,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 307170,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'باربهاني',        // manual:translit
            en: 'Parbhani',        // geonames:name
            ur: 'پربھنی',          // geonames:alt
            bn: 'পারভানি'         // geonames:alt
        }
    },
    {
        slug: 'hisar', geonameId: '1270022', lat: 29.1489, lng: 75.7367,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 307024,
        admin1Code: '08', regionEn: 'Haryana', regionAr: 'هاريانا',
        names: {
            ar: 'حصار',            // geonames:alt (Arabic ح ص ا ر)
            en: 'Hisar',           // geonames:name
            ur: 'ہسار',            // geonames:alt (Urdu ہ)
            bn: 'হিসার'           // manual:translit
        }
    },
    {
        slug: 'sonipat', geonameId: '1255744', lat: 28.9931, lng: 77.0151,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 289333,
        admin1Code: '08', regionEn: 'Haryana', regionAr: 'هاريانا',
        names: {
            ar: 'سونيبات',         // manual:translit
            en: 'Sonipat',         // geonames:name (Sonīpat — diacritics stripped)
            ur: 'سونی پت',         // manual:translit (Urdu پ ی)
            bn: 'সোনিপত'          // manual:translit
        }
    },
    {
        slug: 'ichalkaranji', geonameId: '1269834', lat: 16.7, lng: 74.4667,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 287353,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'إيشالكارانجي',     // manual:translit
            en: 'Ichalkaranji',    // geonames:name
            ur: 'اچل کرنجی',       // geonames:alt
            bn: 'ইচালকরনজি'      // geonames:alt
        }
    },
    {
        slug: 'jalna', geonameId: '1269395', lat: 19.8333, lng: 75.8833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 285577,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'جالنا',           // geonames:alt
            en: 'Jalna',           // geonames:name
            ur: 'جلنا',            // geonames:alt
            bn: 'জলনা'            // manual:translit
        }
    },
    {
        slug: 'satna', geonameId: '1257022', lat: 24.5667, lng: 80.8167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 282977,
        admin1Code: '35', regionEn: 'Madhya Pradesh', regionAr: 'ماديا براديش',
        names: {
            ar: 'ساتنا',           // manual:translit
            en: 'Satna',           // geonames:name
            ur: 'ستنا',            // manual:translit
            bn: 'সাতনা'           // manual:translit
        }
    },
    {
        slug: 'ratlam', geonameId: '1258342', lat: 23.3333, lng: 75.0333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 264914,
        admin1Code: '35', regionEn: 'Madhya Pradesh', regionAr: 'ماديا براديش',
        names: {
            ar: 'راتلام',          // manual:translit
            en: 'Ratlam',          // geonames:name
            ur: 'رتلام',           // manual:translit
            bn: 'রতলাম'           // manual:translit
        }
    },
    {
        slug: 'etawah', geonameId: '1271987', lat: 26.7833, lng: 79.0167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 257448,
        admin1Code: '36', regionEn: 'Uttar Pradesh', regionAr: 'أوتار براديش',
        names: {
            ar: 'إيتاوه',          // manual:translit
            en: 'Etawah',          // geonames:name
            ur: 'اٹاوہ',           // manual:translit (Urdu ٹ ہ)
            bn: 'ইটাওয়া'         // manual:translit
        }
    },
    {
        slug: 'bharatpur-in', geonameId: '1276128', lat: 27.2167, lng: 77.4833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 252838,
        admin1Code: '24', regionEn: 'Rajasthan', regionAr: 'راجستان',
        // -in suffix avoids slug collision with np/bharatpur already in curated.
        // Same convention as hyderabad-in vs hyderabad-pk.
        names: {
            ar: 'بهاراتبور',       // geonames:alt
            en: 'Bharatpur',       // geonames:name
            ur: 'بھرت پور',        // geonames:alt
            bn: 'ভরতপুর'         // geonames:alt
        }
    },
    {
        slug: 'hapur', geonameId: '1270393', lat: 28.7333, lng: 77.7833,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 242920,
        admin1Code: '36', regionEn: 'Uttar Pradesh', regionAr: 'أوتار براديش',
        names: {
            ar: 'هابور',           // manual:translit
            en: 'Hapur',           // geonames:name
            ur: 'ہاپوڑ',           // manual:translit (Urdu ہ پ ڑ)
            bn: 'হাপুর'           // manual:translit
        }
    },
    {
        slug: 'rewa', geonameId: '1258182', lat: 24.5333, lng: 81.3,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 235654,
        admin1Code: '35', regionEn: 'Madhya Pradesh', regionAr: 'ماديا براديش',
        names: {
            ar: 'ريوا',            // manual:translit (Arabic ي)
            en: 'Rewa',            // geonames:name
            ur: 'ریوا',            // geonames:alt
            bn: 'রেওয়া'          // manual:translit
        }
    },
    {
        slug: 'vizianagaram', geonameId: '1253084', lat: 18.1167, lng: 83.4167,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 228720,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'فيزياناغارام',     // manual:translit
            en: 'Vizianagaram',    // geonames:name
            ur: 'وجایانگرم',       // geonames:alt
            bn: 'বিজিয়ানগরম'    // geonames:alt
        }
    },
    {
        slug: 'murwara', geonameId: '1262395', lat: 23.8333, lng: 80.4,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 221883,
        admin1Code: '35', regionEn: 'Madhya Pradesh', regionAr: 'ماديا براديش',
        names: {
            ar: 'موروارا',         // manual:translit
            en: 'Murwara',         // geonames:name (Murwāra — diacritics stripped)
            ur: 'مرواڑہ',          // manual:translit (Urdu ڑ ہ)
            bn: 'মুরওয়াড়া'       // manual:translit
        },
        aliases: { en: ['Katni'] }    // common alternate name
    },
    {
        slug: 'eluru', geonameId: '1272051', lat: 16.7, lng: 81.1,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 218020,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'إيلورو',          // geonames:alt
            en: 'Eluru',           // geonames:name
            ur: 'ایلورو',          // geonames:alt
            bn: 'এলুরু'           // geonames:alt
        }
    },
    {
        slug: 'bidar', geonameId: '1275738', lat: 17.9167, lng: 77.5333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 216020,
        admin1Code: '19', regionEn: 'Karnataka', regionAr: 'كارناتاكا',
        names: {
            ar: 'بيدار',           // manual:translit (Arabic ي ا)
            en: 'Bidar',           // geonames:name
            ur: 'بیدر',            // geonames:alt
            bn: 'বিডর'            // geonames:alt
        }
    },
    {
        slug: 'ongole', geonameId: '1261045', lat: 15.5057, lng: 80.0499,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 208344,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'أونغول',          // manual:translit (Indic g→غ)
            en: 'Ongole',          // geonames:name
            ur: 'اونگول',          // geonames:alt
            bn: 'অনগোলে'         // geonames:alt
        }
    },
    {
        slug: 'sambhal', geonameId: '1257540', lat: 28.5833, lng: 78.55,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 196109,
        admin1Code: '36', regionEn: 'Uttar Pradesh', regionAr: 'أوتار براديش',
        names: {
            ar: 'سامبال',          // geonames:alt
            en: 'Sambhal',         // geonames:name
            ur: 'سنبھل',           // geonames:alt
            bn: 'সাম্ভাল'         // geonames:alt
        }
    },
    {
        slug: 'panvel', geonameId: '1260434', lat: 18.99, lng: 73.1167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 195373,
        admin1Code: '16', regionEn: 'Maharashtra', regionAr: 'ماهاراشترا',
        names: {
            ar: 'بانفل',           // manual:translit
            en: 'Panvel',          // geonames:name
            ur: 'پنویل',           // geonames:alt
            bn: 'পানওয়েল'        // geonames:alt
        }
    },
    {
        slug: 'ambala', geonameId: '1278860', lat: 30.3667, lng: 76.7833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 195153,
        admin1Code: '08', regionEn: 'Haryana', regionAr: 'هاريانا',
        names: {
            ar: 'أمبالا',          // manual:translit
            en: 'Ambala',          // geonames:name (Ambāla — diacritics stripped)
            ur: 'امبالا',          // manual:translit
            bn: 'আম্বালা'         // manual:translit
        }
    },
    {
        slug: 'machilipatnam', geonameId: '1264637', lat: 16.1875, lng: 81.1389,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 192827,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'ماشيليباتنام',     // manual:translit
            en: 'Machilipatnam',   // geonames:name
            ur: 'مچلی پٹنم',       // manual:translit (Urdu چ پ ٹ)
            bn: 'মছিলীপটনম'      // manual:translit (Wikipedia bn convention)
        },
        aliases: { en: ['Masulipatnam', 'Bandar'] }   // historical alts
    },
    {
        slug: 'sambalpur', geonameId: '1257542', lat: 21.4669, lng: 83.9756,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 189366,
        admin1Code: '21', regionEn: 'Odisha', regionAr: 'أوديشا',
        names: {
            ar: 'سامبالبور',       // manual:translit
            en: 'Sambalpur',       // geonames:name
            ur: 'سمبل پور',        // manual:translit (Urdu پ)
            bn: 'সাম্বালপুর'      // geonames:alt
        }
    },
    {
        slug: 'haridwar', geonameId: '1270351', lat: 29.9457, lng: 78.1642,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 186079,
        admin1Code: '39', regionEn: 'Uttarakhand', regionAr: 'أوتاراخاند',
        names: {
            ar: 'هاريدوار',        // manual:translit (Arabic ه)
            en: 'Haridwar',        // geonames:name
            ur: 'ہریدوار',         // geonames:alt
            bn: 'হরিদ্বার'        // wikipedia:bn canonical
        }
    },
    {
        slug: 'adoni', geonameId: '1279335', lat: 15.6333, lng: 77.2667,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 184625,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'أدوني',           // manual:translit
            en: 'Adoni',           // geonames:name
            ur: 'ادونی',           // manual:translit (Urdu ی)
            bn: 'আদোনি'          // manual:translit
        }
    },
    {
        slug: 'proddatur', geonameId: '1259312', lat: 14.7333, lng: 78.55,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 177797,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'بروداتور',        // manual:translit
            en: 'Proddatur',       // geonames:name
            ur: 'پروڈاٹور',        // manual:translit (Urdu پ ڈ)
            bn: 'প্রোদ্দাতুর'     // manual:translit
        }
    },
    {
        slug: 'hassan', geonameId: '1270239', lat: 13.0, lng: 76.1,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 155006,
        admin1Code: '19', regionEn: 'Karnataka', regionAr: 'كارناتاكا',
        names: {
            ar: 'هاسان',           // geonames:alt
            en: 'Hassan',          // geonames:name
            ur: 'ہاسن',            // geonames:alt
            bn: 'হাসান'           // geonames:alt
        }
    },
    {
        slug: 'haldwani', geonameId: '1270498', lat: 29.2167, lng: 79.5167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 139497,
        admin1Code: '39', regionEn: 'Uttarakhand', regionAr: 'أوتاراخاند',
        names: {
            ar: 'هالدواني',         // manual:translit
            en: 'Haldwani',        // geonames:name
            ur: 'ہلدوانی',         // geonames:alt
            bn: 'হলদ্বানি'        // wikipedia:bn canonical (alt was admin-form "হলদুৱানি-তিলকরা-কাঠগোদাম" — stripped)
        }
    },
    {
        slug: 'srikakulam', geonameId: '1255647', lat: 18.2949, lng: 83.8938,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 137944,
        admin1Code: '02', regionEn: 'Andhra Pradesh', regionAr: 'أندرا براديش',
        names: {
            ar: 'سريكاكولم',       // geonames:alt
            en: 'Srikakulam',      // geonames:name
            ur: 'سری کاکولم',      // manual:translit
            bn: 'শ্রীকাকুলম'      // geonames:alt
        }
    },
    {
        slug: 'roorkee', geonameId: '1258044', lat: 29.8667, lng: 77.8833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 103894,
        admin1Code: '39', regionEn: 'Uttarakhand', regionAr: 'أوتاراخاند',
        names: {
            ar: 'روركي',           // geonames:alt
            en: 'Roorkee',         // geonames:name
            ur: 'روڑکی',           // geonames:alt
            bn: 'রূড়কী'           // geonames:alt
        }
    }
];

// ─── Load curated + checksum prior ──────────────────────────────────────
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

if (!existsSync(BACKUP_PATH)) {
    copyFileSync(CURATED_PATH, BACKUP_PATH);
    console.log('Backup written: ' + BACKUP_PATH.pathname);
}

const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
const origBySlug = new Map(orig.map(e => [e.slug, e]));
function hashEntry(e) {
    return createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0, 16);
}
const priorHashes = new Map();
for (const e of orig) priorHashes.set(e.slug, hashEntry(e));

// ─── Pre-flight duplicate checks ───────────────────────────────────────
const existingSlugs = new Set(curated.map(e => e.slug));
const existingSourceIds = new Set(curated.map(e => e.sourceId));

const dupSlugs = [];
const dupGeonameIds = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGeonameIds.push(c.geonameId);
}
if (dupSlugs.length || dupGeonameIds.length) {
    console.error('PREFLIGHT FAIL: duplicate slugs=' + JSON.stringify(dupSlugs) +
                  ' duplicate geonameIds=' + JSON.stringify(dupGeonameIds));
    process.exit(1);
}

// ─── Per-city script validation BEFORE write ───────────────────────────
let scriptFails = 0;
for (const c of NEW_CITIES) {
    for (const L of ['ar','en','ur','bn']) {
        if (!isCleanScript(c.names[L], L)) {
            console.error('SCRIPT FAIL: ' + c.slug + '.names.' + L + ' = "' + c.names[L] + '"');
            scriptFails++;
        }
    }
    // Refuse any non-{ar,en,ur,bn} key
    const langKeys = Object.keys(c.names);
    const extra = langKeys.filter(k => !['ar','en','ur','bn'].includes(k));
    if (extra.length > 0) {
        console.error('LANG FAIL: ' + c.slug + ' has unsupported keys: ' + extra.join(','));
        scriptFails++;
    }
    if (langKeys.length !== 4) {
        console.error('LANG FAIL: ' + c.slug + ' has ' + langKeys.length + ' lang keys (expected 4)');
        scriptFails++;
    }
}
if (scriptFails > 0) {
    console.error('APPLY ABORTED — ' + scriptFails + ' pre-write failures');
    process.exit(1);
}

// ─── Build curated entries + insert ────────────────────────────────────
const stats = { added: [], skipped: [] };
for (const c of NEW_CITIES) {
    const entry = {
        slug: c.slug,
        type: 'city',
        countryCode: 'in',
        lat: c.lat,
        lng: c.lng,
        timezone: c.timezone,
        names: {
            ar: c.names.ar,
            en: c.names.en,
            ur: c.names.ur,
            bn: c.names.bn
        },
        admin: {
            countryAr: 'الهند',
            countryEn: 'India',
            regionAr: c.regionAr,
            regionEn: c.regionEn,
            admin1Code: c.admin1Code
        },
        priority: 70,
        source: 'geonames',
        sourceId: 'geonames:' + c.geonameId,
        verified: false
    };
    if (c.aliases) entry.aliases = c.aliases;
    curated.push(entry);
    stats.added.push({
        slug: c.slug,
        en: c.names.en,
        ar: c.names.ar,
        ur: c.names.ur,
        bn: c.names.bn,
        pop: c.population || 0
    });
}

// ─── POST-MUTATION ASSERTIONS ──────────────────────────────────────────
let assertionFails = 0;

// (1) Prior 109 IN entries byte-identical via per-slug JSON hash
for (const e of orig) {
    const eNow = curated.find(x => x.slug === e.slug);
    if (!eNow) {
        console.error('INVARIANT FAIL: prior slug "' + e.slug + '" missing post-apply');
        assertionFails++;
        continue;
    }
    const oh = priorHashes.get(e.slug);
    const nh = hashEntry(eNow);
    if (oh !== nh) {
        console.error('INVARIANT FAIL: prior entry "' + e.slug + '" mutated (hash ' + oh + ' → ' + nh + ')');
        assertionFails++;
    }
}

// (2) curated count exactly +33
if (curated.length !== orig.length + NEW_CITIES.length) {
    console.error('INVARIANT FAIL: curated count ' + curated.length + ' != ' + orig.length + ' + ' + NEW_CITIES.length);
    assertionFails++;
}

// (3) Every new entry has exactly {ar, en, ur, bn} — no extras, no missing
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) { console.error('INVARIANT FAIL: ' + c.slug + ' not found post-apply'); assertionFails++; continue; }
    const langs = Object.keys(e.names).sort();
    if (JSON.stringify(langs) !== JSON.stringify(['ar','bn','en','ur'])) {
        console.error('INVARIANT FAIL: ' + c.slug + ' lang keys = ' + JSON.stringify(langs) + ' (expected ar/bn/en/ur)');
        assertionFails++;
    }
}

// (4) No duplicate slug across entire curated
const allSlugs = curated.map(e => e.slug);
const slugDups = allSlugs.filter((s, i, a) => a.indexOf(s) !== i);
if (slugDups.length > 0) {
    console.error('INVARIANT FAIL: duplicate slugs: ' + slugDups.join(', '));
    assertionFails++;
}

// (5) No duplicate sourceId
const allSrc = curated.map(e => e.sourceId).filter(Boolean);
const srcDups = allSrc.filter((s, i, a) => a.indexOf(s) !== i);
if (srcDups.length > 0) {
    console.error('INVARIANT FAIL: duplicate sourceIds: ' + srcDups.join(', '));
    assertionFails++;
}

// (6) PK / BD / non-IN unchanged (checked via prior-hash above)

// (7) Every new entry's names.ar/en/ur/bn pass script guards
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const L of ['ar','en','ur','bn']) {
        if (!isCleanScript(e.names[L], L)) {
            console.error('INVARIANT FAIL: ' + c.slug + '.names.' + L + ' fails script guard ("' + e.names[L] + '")');
            assertionFails++;
        }
    }
}

// (8) IN count exactly +33
const inCountNow = curated.filter(e => e.countryCode === 'in').length;
const inCountOrig = orig.filter(e => e.countryCode === 'in').length;
if (inCountNow !== inCountOrig + NEW_CITIES.length) {
    console.error('INVARIANT FAIL: IN count ' + inCountNow + ' != ' + inCountOrig + ' + ' + NEW_CITIES.length);
    assertionFails++;
}

// (9) NO unsupported lang anywhere in the 33 new entries
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const k of Object.keys(e.names)) {
        if (['hi','ta','mr','te','kn','ml','gu','pa','or','as','sa'].includes(k)) {
            console.error('INVARIANT FAIL: ' + c.slug + '.names.' + k + ' is an unsupported lang');
            assertionFails++;
        }
    }
}

if (assertionFails > 0) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════════════');
    console.error(' APPLY ABORTED — ' + assertionFails + ' invariant failures');
    console.error('═══════════════════════════════════════════════════════════════════════');
    process.exit(1);
}

// ─── Write back ────────────────────────────────────────────────────────
writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    inCountBefore: inCountOrig,
    inCountAfter: inCountNow,
    totalCuratedBefore: orig.length,
    totalCuratedAfter: curated.length,
    addedDetail: stats.added
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-IN-D-FAST-SUPPORTED-L10N — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  IN count             : ' + inCountOrig + ' → ' + inCountNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('  Invariants passed    : 9/9');
console.log('  Backup               : ' + BACKUP_PATH.pathname);
console.log('  Report               : ' + REPORT_PATH.pathname);
