// scripts/geodata/countries/bd.mjs — Bangladesh — CURATED-GEODATA-ASIA-1D-BD
//
// admin1 codes (GeoNames, 2-digit numeric — Bangladesh's 8 divisions).
// PROVISIONAL mapping — to be VERIFIED via Stage 1 PPLC/PPLA inspection
// before approving any wave.
//
// Bangladesh administrative structure:
//   8 divisions (as of 2015 / 2010 reforms): Barisal, Chittagong, Dhaka,
//   Khulna, Mymensingh, Rajshahi, Rangpur, Sylhet.
//   Mymensingh was carved out of Dhaka Division in 2015.
//   Rangpur was carved out of Rajshahi Division in 2010.
//
// persianSource: false — Bengali script is in Unicode block U+0980–U+09FF,
// totally separate from Arabic block U+0600–U+06FF. The Persian/Urdu pre-gate
// (Stage 3.4 PERSIAN_CHAR_MAP) does NOT apply to Bengali. Stage 3.5
// isCleanArabic still gates `names.ar` (independent of Bengali).
//
// IMPORTANT — naming-collision warning:
//   ISO country code 'bn' = Brunei Darussalam (separate file: bn.mjs).
//   ISO 639-1 language code 'bn' = Bengali (a property of names.bn).
//   Bangladesh's ISO country code is 'bd' — DO NOT confuse with 'bn'.
//   This file is for country=BD (Bangladesh). Brunei lives in bn.mjs.

export default {
    cc:              'bd',
    countryAr:       'بنغلاديش',
    countryEn:       'Bangladesh',
    defaultTimezone: 'Asia/Dhaka',

    geonamesUrl:  'https://download.geonames.org/export/dump/BD.zip',
    innerTxtName: 'BD.txt',

    // BBox covers Bangladesh mainland + offshore islands.
    // Bangladesh: 20.5°N to 26.7°N, 88.0°E to 92.7°E.
    bbox: { minLat: 20.3, maxLat: 26.9, minLng: 87.8, maxLng: 92.9 },

    // admin1 codes — VERIFIED empirically via Stage 1 PPLC/PPLA inspection
    // (PREFLIGHT-1 2026-05-19, n=8 PPLC+PPLA rows + 9 PPLA2):
    //
    //   81 → Dhaka Division (PPLC: Dhaka pop=10.36M; PPLA2: Gazipur pop=2.67M)
    //   82 → Khulna Division (PPLA: Khulna pop=1.50M; PPLA2: Bagerhat, Magura)
    //   83 → Rajshahi Division (PPLA: Rajshahi pop=763k)
    //   84 → Chittagong Division (PPLA: Chattogram pop=3.92M; PPLA2: Chāndpur)
    //   85 → Barisal Division (PPLA: Barishal pop=202k)
    //   86 → Sylhet Division (PPLA: Sylhet pop=237k)
    //   87 → Rangpur Division (PPLA: Rangpur pop=1.03M; PPLA2: Lalmonirhat,
    //                          Nilphamari, Gaibandha)
    //   H  → Mymensingh Division (PPLA: Mymensingh pop=225k; PPLA2: Jamālpur,
    //                             Netrakona) — NOTE: non-numeric "H" code,
    //                             same pattern as TM ASIA-1H "S" for Ashgabat
    //                             and TL ASIA-1E 2-letter codes (AL/BA/DI/...)
    //
    // The "H" code likely indicates the newer Mymensingh Division status
    // (created 2015 by carve-out from Dhaka Division) — GeoNames may not
    // have integrated it into the standard 81-88 numeric series yet.
    //
    // admin1="00" appears in 125 rows (empty/unassigned in source data).
    admin1ToRegion: {
        '81': { ar: 'دكا',        en: 'Dhaka Division' },
        '82': { ar: 'خولنا',      en: 'Khulna Division' },
        '83': { ar: 'راجشاهي',    en: 'Rajshahi Division' },
        '84': { ar: 'شيتاغونغ',   en: 'Chittagong Division' },
        '85': { ar: 'بريسال',     en: 'Barisal Division' },
        '86': { ar: 'سيلهت',      en: 'Sylhet Division' },
        '87': { ar: 'رانغبور',    en: 'Rangpur Division' },
        'H':  { ar: 'ميمنسينغ',   en: 'Mymensingh Division' }
    },

    // Initial settings consistent with PK + IR + AF (~similar regional density):
    //   popMin=50,000 + alwaysInclude PPLC + PPLA
    //   Bangladesh population ~170M, many medium cities 50-300k. popMin=50k
    //   ensures regional centers (e.g. Comilla/Cumilla, Mymensingh) are
    //   captured at high tier.
    popMin: 50000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  [],

    // Stage 3.4 Persian/Urdu pre-gate — DISABLED for Bengali sources.
    // Bengali Unicode (U+0980–U+09FF) is fully disjoint from Arabic/Persian
    // (U+0600–U+06FF). PERSIAN_CHAR_MAP has no Bengali mappings; running it
    // on a Bengali string would be a no-op but also a wasted scan.
    //
    // A separate `bengaliSource` flag may be added in a future preflight if
    // a Bengali-specific Stage 3.4b normalizer becomes necessary (initial
    // audit at PREFLIGHT-1 indicates this is likely UNNECESSARY because
    // Bengali in GeoNames `alternatenames` is generally clean Unicode).
    persianSource: false
};
