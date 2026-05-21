// scripts/geodata/_asia_1d_in_e_fast_supported_l10n_apply.mjs
//
// ASIA-1D-IN-E-FAST-SUPPORTED-L10N — combined geodata+L10N fast wave (dedupe-first).
//
// Adds 30 next-tier Indian cities (mostly Tamil Nadu + Kerala) with EXACTLY
// 4 supported-UI languages (ar, en, ur, bn). Dedupe-first: every candidate
// passed an audit confirming it is NOT already in curated, not a duplicate
// of an existing slug/geonameId/alias, and not a metro-locality.
//
// See `reports/asia-1d-in-e-dedupe-audit.json` for the audit log.
//
// STRICT INVARIANTS:
//   1. Each new entry has EXACTLY {ar, en, ur, bn}.
//   2. No hi/ta/mr/te/kn/ml/gu/pa/or/as/sa.
//   3. names.ar passes Arabic-script guard (Arabic letters only — no
//      Persian/Urdu-only ی ک گ پ چ ژ ٹ ڈ ڑ ں ھ ہ ے).
//   4. names.ur passes Urdu-script guard (Arabic block, may include
//      Urdu-specific letters above).
//   5. names.bn passes Bengali-script guard.
//   6. names.en passes Latin-script guard.
//   7. Prior 142 IN entries BYTE-IDENTICAL.
//   8. PK/BD/non-IN entries BYTE-IDENTICAL.
//   9. No duplicate slug, no duplicate sourceId/geonameId.
//   10. server.js / js/app.js / index.html / server/place-l10n / docs/:
//       NOT touched.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preAsia1dInEFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/asia-1d-in-e-fast-supported-l10n-apply-report.json', import.meta.url);

// Strict per-lang script validator. AR rejects Persian/Urdu-only letters
// to keep `names.ar` truly Arabic; UR accepts the Arabic block superset
// (including ی ک گ پ چ ژ ٹ ڈ ڑ ں ھ ہ ے ۂ).
const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
function isCleanArabic(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]/.test(s)) return false;
    if (/[A-Za-z]/.test(s)) return false;
    if (/[ऀ-ॿ]/.test(s)) return false;
    if (/[஀-௿]/.test(s)) return false;
    if (URDU_ONLY.test(s)) return false;       // strict — no Urdu-only letters
    return true;
}
function isCleanUrdu(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]/.test(s)) return false;
    if (/[A-Za-z]/.test(s)) return false;
    if (/[ऀ-ॿ]/.test(s)) return false;
    return true;                                // Urdu accepts Arabic+Urdu
}
function isCleanBengali(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[ঀ-৿]/.test(s)) return false;
    if (/[؀-ۿ]/.test(s)) return false;
    if (/[A-Za-z]/.test(s)) return false;
    if (/[ऀ-ॿ]/.test(s)) return false;
    if (/[஀-௿]/.test(s)) return false;
    return true;
}
function isCleanLatin(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[A-Za-z]/.test(s)) return false;
    if (/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]/.test(s)) return false;
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
// CITY LIST — 30 next-tier IN cities (dedupe-verified, mostly TN+KL)
// ────────────────────────────────────────────────────────────────────────
const NEW_CITIES = [
    {
        slug: 'thiruvananthapuram', geonameId: '1254163', lat: 8.4855, lng: 76.9492,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA', population: 788271,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'ثيروفانانثابورام',  // geonames:alt (Arabic-clean ث ي ر)
            en: 'Thiruvananthapuram', // geonames:name
            ur: 'تھیروواننتھاپورم',  // geonames:alt (Urdu تھ)
            bn: 'তিরুবনন্তপুরম'     // geonames:alt
        },
        aliases: { en: ['Trivandrum'] }   // pre-1991 official name
    },
    {
        slug: 'vellore', geonameId: '1253286', lat: 12.92, lng: 79.15,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 484690,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'فيلور',           // manual:translit (alt was ویلور Urdu)
            en: 'Vellore',
            ur: 'ویلور',           // geonames:alt
            bn: 'বেল্লোরে'         // geonames:alt
        }
    },
    {
        slug: 'ambattur', geonameId: '1278840', lat: 13.0982, lng: 80.1623,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 466205,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'أمباتور',         // manual:translit
            en: 'Ambattur',
            ur: 'امبتور',          // manual:translit
            bn: 'আম্বাত্তুর'      // manual:translit
        }
    },
    {
        slug: 'thoothukudi', geonameId: '8629640', lat: 8.7833, lng: 78.1333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 410760,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'توتوكودي',        // manual:translit (alt has ک Urdu)
            en: 'Thoothukudi',
            ur: 'توتوکودی',        // geonames:alt
            bn: 'থোথুক্কুড়ি'      // geonames:alt
        },
        aliases: { en: ['Tuticorin'] }   // pre-2018 official name
    },
    {
        slug: 'kollam', geonameId: '1259091', lat: 8.8889, lng: 76.5917,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 367107,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'كولام',           // manual:translit (geonames alts had Urdu ک)
            en: 'Kollam',
            ur: 'کولم',            // geonames:alt
            bn: 'কোল্লম'           // geonames:alt
        },
        aliases: { en: ['Quilon'] }   // historical British name
    },
    {
        slug: 'thrissur', geonameId: '1254187', lat: 10.5167, lng: 76.2167,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 315957,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'تريسور',          // manual:translit
            en: 'Thrissur',
            ur: 'تھرسور',          // manual:translit (Urdu تھ)
            bn: 'তৃশূর'            // wikipedia:bn canonical
        }
    },
    {
        slug: 'dindigul', geonameId: '1272543', lat: 10.3667, lng: 77.95,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 292512,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'دينديغول',        // manual:translit
            en: 'Dindigul',
            ur: 'دیندیگول',        // geonames:alt
            bn: 'দিন্দিগুল'        // geonames:alt
        }
    },
    {
        slug: 'thanjavur', geonameId: '1254649', lat: 10.7833, lng: 79.1333,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 291067,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'تنجاور',          // geonames:alt (clean Arabic ت ن ج)
            en: 'Thanjavur',
            ur: 'تھانجاور',        // geonames:alt (Urdu تھ)
            bn: 'তাঞ্জাবুর'       // geonames:alt
        },
        aliases: { en: ['Tanjore'] }   // historical British name
    },
    {
        slug: 'ranipet', geonameId: '1258451', lat: 12.9275, lng: 79.3372,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 264330,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'رانيبت',          // manual:translit
            en: 'Ranipet',         // geonames:name (Rānipet — diacritics stripped)
            ur: 'رانی پیٹ',        // manual:translit (Urdu ی پ ٹ)
            bn: 'রাণীপেট'         // manual:translit
        }
    },
    {
        slug: 'tiruvottiyur', geonameId: '1254320', lat: 13.1626, lng: 80.3,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 249446,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'تيروفوتيور',      // manual:translit
            en: 'Tiruvottiyur',    // geonames:name (Tiruvottiyūr — diacritics stripped)
            ur: 'تیرووٹیور',       // manual:translit (Urdu ی ٹ)
            bn: 'তিরুবোট্টিয়ুর'   // manual:translit
        }
    },
    {
        slug: 'alappuzha', geonameId: '1278985', lat: 9.5, lng: 76.3833,
        timezone: 'Asia/Kolkata', featureCode: 'PPLA2', population: 240991,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'ألابوزا',         // manual:translit
            en: 'Alappuzha',
            ur: 'الاپوژا',         // manual:translit (Urdu پ ژ)
            bn: 'আলপ্পুঝা'        // manual:translit
        },
        aliases: { en: ['Alleppey'] }   // historical British name
    },
    {
        slug: 'sivakasi', geonameId: '1255947', lat: 9.45, lng: 77.8,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 234704,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'سيفاكاسي',        // manual:translit
            en: 'Sivakasi',
            ur: 'سیواکاسی',        // manual:translit (Urdu ی ک)
            bn: 'শিবকাশী'         // geonames:alt
        }
    },
    {
        slug: 'pallavaram', geonameId: '1260692', lat: 12.9683, lng: 80.15,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 233984,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'بالافارام',       // manual:translit
            en: 'Pallavaram',      // geonames:name (Pallāvaram — diacritics stripped)
            ur: 'پلاوارم',         // manual:translit (Urdu پ)
            bn: 'পল্লাবরম'        // manual:translit
        }
    },
    {
        slug: 'hosur', geonameId: '1269934', lat: 12.7333, lng: 77.8167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 229528,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'هوسور',           // manual:translit
            en: 'Hosur',           // geonames:name (Hosūr — diacritics stripped)
            ur: 'ہوسور',           // manual:translit (Urdu ہ)
            bn: 'হোসুর'           // manual:translit
        }
    },
    {
        slug: 'nagercoil', geonameId: '1262204', lat: 8.1833, lng: 77.4167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 224849,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'ناغركويل',        // manual:translit
            en: 'Nagercoil',       // geonames:name (Nāgercoil — diacritics stripped)
            ur: 'ناگرکوئل',        // manual:translit (Urdu گ ک)
            bn: 'নাগরকোয়েল'     // manual:translit
        }
    },
    {
        slug: 'kanchipuram', geonameId: '1268159', lat: 12.8333, lng: 79.7167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 221715,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'كانشيبورم',       // geonames:alt (clean Arabic)
            en: 'Kanchipuram',
            ur: 'کانچی پورم',      // geonames:alt (Urdu ک چ ی)
            bn: 'কাঞ্চিপুরম'      // geonames:alt
        }
    },
    {
        slug: 'tambaram', geonameId: '1255062', lat: 12.925, lng: 80.1,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 174787,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'تامبارام',        // manual:translit
            en: 'Tambaram',
            ur: 'تامبارم',         // manual:translit
            bn: 'তাম্বারাম'       // geonames:alt
        }
    },
    {
        slug: 'cuddalore', geonameId: '1273802', lat: 11.7563, lng: 79.7649,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 173636,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'كدالور',          // manual:translit
            en: 'Cuddalore',
            ur: 'کڈلور',           // manual:translit (Urdu ک ڈ)
            bn: 'কুদ্দালোরে'      // geonames:alt
        }
    },
    {
        slug: 'kumbakonam', geonameId: '1265683', lat: 10.9669, lng: 79.3838,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 167155,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'كومباكونام',      // manual:translit
            en: 'Kumbakonam',
            ur: 'کمبھاکونم',       // manual:translit (Urdu ک بھ)
            bn: 'কুম্ভকোনম'       // geonames:alt
        }
    },
    {
        slug: 'palakkad', geonameId: '1260728', lat: 10.7867, lng: 76.6548,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 132728,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'بلكاد',           // geonames:alt (clean Arabic ب ل ك ا د)
            en: 'Palakkad',
            ur: 'پالاککاد',        // geonames:alt (Urdu پ ک)
            bn: 'পালক্কাদ'        // geonames:alt
        },
        aliases: { en: ['Palghat'] }   // historical British name
    },
    {
        slug: 'rajapalayam', geonameId: '1258916', lat: 9.4533, lng: 77.5533,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 130442,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'راجابالايام',     // manual:translit
            en: 'Rajapalayam',
            ur: 'راجاپالایم',      // manual:translit (Urdu پ ی)
            bn: 'রাজাপালয়ম'     // manual:translit
        }
    },
    {
        slug: 'ambur', geonameId: '1278815', lat: 12.7833, lng: 78.7167,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 114608,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'امبور',           // geonames:alt (clean Arabic — no Urdu-specific)
            en: 'Ambur',
            ur: 'امبور',           // same as ar (Urdu accepts Arabic-block)
            bn: 'আম্বুর'           // geonames:alt
        }
    },
    {
        slug: 'nagapattinam', geonameId: '1262260', lat: 10.7647, lng: 79.8425,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 102905,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'ناغاباتينام',     // manual:translit
            en: 'Nagapattinam',
            ur: 'ناگاپٹنم',        // manual:translit (Urdu گ پ ٹ)
            bn: 'নাগাপত্তিনম'    // manual:translit
        }
    },
    {
        slug: 'malappuram', geonameId: '1264154', lat: 11.0734, lng: 76.0741,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 101386,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'مالابورام',       // geonames:alt (clean Arabic)
            en: 'Malappuram',
            ur: 'ملاپورم',         // geonames:alt (Urdu پ)
            bn: 'মালাপ্পুরম'      // geonames:alt
        }
    },
    {
        slug: 'gudiyatham', geonameId: '1270800', lat: 12.9489, lng: 78.8676,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 93973,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'غوديتام',         // manual:translit
            en: 'Gudiyatham',
            ur: 'گڈیتم',           // manual:translit (Urdu گ ڈ ی)
            bn: 'গুদিয়াত্তম'      // manual:translit
        }
    },
    {
        slug: 'pollachi', geonameId: '1259440', lat: 10.6589, lng: 77.0085,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 90180,
        admin1Code: '25', regionEn: 'Tamil Nadu', regionAr: 'تاميل نادو',
        names: {
            ar: 'بولاتشي',         // manual:translit
            en: 'Pollachi',
            ur: 'پولاچی',          // geonames:alt (Urdu پ چ ی)
            bn: 'পোল্লাচি'        // geonames:alt
        }
    },
    {
        slug: 'kayamkulam', geonameId: '1267360', lat: 9.1772, lng: 76.5006,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 68634,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'كايامكولام',      // manual:translit
            en: 'Kayamkulam',
            ur: 'کایمکولم',        // manual:translit (Urdu ک ی)
            bn: 'কায়ামকুলম'      // manual:translit
        }
    },
    {
        slug: 'kannur', geonameId: '1274987', lat: 11.8689, lng: 75.355,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 62836,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'كانور',           // geonames:alt (clean Arabic ك ا ن و ر)
            en: 'Kannur',
            ur: 'کنور',            // manual:translit (Urdu ک)
            bn: 'কন্নুর'           // geonames:alt
        },
        aliases: { en: ['Cannanore'] }   // historical British name
    },
    {
        slug: 'pathanamthitta', geonameId: '1260138', lat: 9.2667, lng: 76.7833,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 38285,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'باثانامتيتا',     // manual:translit
            en: 'Pathanamthitta',  // geonames:name (Pathanāmthitta — diacritics stripped)
            ur: 'پتھنامتھٹہ',      // manual:translit (Urdu پ ٹ ھ ہ)
            bn: 'পত্তনম্তিট্টা'  // manual:translit
        }
    },
    {
        slug: 'kottayam', geonameId: '1265910', lat: 9.5916, lng: 76.5222,
        timezone: 'Asia/Kolkata', featureCode: 'PPL', population: 55374,
        admin1Code: '13', regionEn: 'Kerala', regionAr: 'كيرالا',
        names: {
            ar: 'كوتايام',         // manual:translit
            en: 'Kottayam',        // geonames:name (Kōttayam — diacritics stripped)
            ur: 'کوٹیم',           // manual:translit (Urdu ک ٹ ی)
            bn: 'কোট্টায়ম'       // manual:translit
        }
    }
];

// ─── Load curated + dedupe verification ────────────────────────────────
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

if (!existsSync(BACKUP_PATH)) {
    copyFileSync(CURATED_PATH, BACKUP_PATH);
    console.log('Backup written: ' + BACKUP_PATH.pathname);
}

const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
function hashEntry(e) {
    return createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0, 16);
}
const priorHashes = new Map();
for (const e of orig) priorHashes.set(e.slug, hashEntry(e));

const existingSlugs = new Set(curated.map(e => e.slug));
const existingSourceIds = new Set(curated.map(e => e.sourceId));

// ─── Pre-flight dedupe + script checks ─────────────────────────────────
const dupSlugs = [];
const dupGids = [];
const scriptFails = [];
const langKeyFails = [];

for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);

    // Lang-keys: must be EXACTLY {ar, en, ur, bn}
    const langs = Object.keys(c.names).sort();
    if (JSON.stringify(langs) !== JSON.stringify(['ar','bn','en','ur'])) {
        langKeyFails.push({ slug: c.slug, langs });
    }
    // Script guards per lang
    for (const L of ['ar','en','ur','bn']) {
        if (!scriptGuard(c.names[L], L)) {
            scriptFails.push({ slug: c.slug, lang: L, value: c.names[L] });
        }
    }
}

if (dupSlugs.length || dupGids.length || scriptFails.length || langKeyFails.length) {
    console.error('PREFLIGHT FAIL:');
    if (dupSlugs.length) console.error('  duplicate slugs: ' + JSON.stringify(dupSlugs));
    if (dupGids.length) console.error('  duplicate geonameIds: ' + JSON.stringify(dupGids));
    for (const f of langKeyFails) console.error('  lang-keys fail: ' + f.slug + ' has ' + JSON.stringify(f.langs));
    for (const f of scriptFails) console.error('  script fail: ' + f.slug + '.names.' + f.lang + ' = "' + f.value + '"');
    process.exit(1);
}

// ─── Build + insert ────────────────────────────────────────────────────
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
}

// ─── POST-MUTATION ASSERTIONS ──────────────────────────────────────────
let assertionFails = 0;

// (1) Prior 142 IN entries (and all 2630 entries) byte-identical
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
        console.error('INVARIANT FAIL: prior entry "' + e.slug + '" mutated');
        assertionFails++;
    }
}

// (2) curated count exactly + N
if (curated.length !== orig.length + NEW_CITIES.length) {
    console.error('INVARIANT FAIL: curated count ' + curated.length + ' != ' + orig.length + ' + ' + NEW_CITIES.length);
    assertionFails++;
}

// (3) Every new entry has exactly {ar,en,ur,bn}
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) { assertionFails++; continue; }
    const langs = Object.keys(e.names).sort();
    if (JSON.stringify(langs) !== JSON.stringify(['ar','bn','en','ur'])) {
        console.error('INVARIANT FAIL: ' + c.slug + ' lang keys = ' + JSON.stringify(langs));
        assertionFails++;
    }
    for (const L of ['ar','en','ur','bn']) {
        if (!scriptGuard(e.names[L], L)) {
            console.error('INVARIANT FAIL: ' + c.slug + '.names.' + L + ' fails script guard');
            assertionFails++;
        }
    }
}

// (4) No duplicate slugs / sourceIds
const allSlugs = curated.map(e => e.slug);
const slugDupes = allSlugs.filter((s, i, a) => a.indexOf(s) !== i);
if (slugDupes.length) { console.error('INVARIANT FAIL: duplicate slugs: ' + slugDupes.join(',')); assertionFails++; }
const allSrc = curated.map(e => e.sourceId).filter(Boolean);
const srcDupes = allSrc.filter((s, i, a) => a.indexOf(s) !== i);
if (srcDupes.length) { console.error('INVARIANT FAIL: duplicate sourceIds: ' + srcDupes.join(',')); assertionFails++; }

// (5) IN count exactly + N
const inCountNow = curated.filter(e => e.countryCode === 'in').length;
const inCountOrig = orig.filter(e => e.countryCode === 'in').length;
if (inCountNow !== inCountOrig + NEW_CITIES.length) {
    console.error('INVARIANT FAIL: IN count ' + inCountNow + ' != ' + inCountOrig + ' + ' + NEW_CITIES.length);
    assertionFails++;
}

// (6) No unsupported lang in any new entry
const FORBIDDEN_LANGS = ['hi','ta','mr','te','kn','ml','gu','pa','or','as','sa'];
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const L of FORBIDDEN_LANGS) {
        if (e.names[L] !== undefined) {
            console.error('INVARIANT FAIL: ' + c.slug + '.names.' + L + ' = forbidden');
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
    addedSlugs: NEW_CITIES.map(c => c.slug)
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' ASIA-1D-IN-E-FAST-SUPPORTED-L10N — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length);
console.log('  IN count             : ' + inCountOrig + ' → ' + inCountNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('  Invariants passed    : all');
console.log('═══════════════════════════════════════════════════════════════════════');
