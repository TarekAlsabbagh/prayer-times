// scripts/geodata/countries/ir.mjs — Iran — CURATED-GEODATA-ASIA-1G-IR
//
// admin1 codes (GeoNames, 2-digit numeric, 31 provinces of Iran).
// To be VERIFIED against Stage 1 PPLA/PPLC output before approving the
// wave — the codes below follow the GeoNames documented mapping; one
// or two may shift after Stage 1 inspection.
//
// persianSource: true — enables Stage 3.4 Persian pre-gate normalizer
// between Stage 3 (validate) and Stage 3.5 (Arabic-name QA).
// See: reports/asia-1g-stage-3-4-persian-pregate-design.md
//
// popMin: 200000 — IR has many cities; user-specified higher threshold
// to keep the queue manageable. PPLC + PPLA stay always-included
// regardless of population.

export default {
    cc:              'ir',
    countryAr:       'إيران',
    countryEn:       'Iran',
    defaultTimezone: 'Asia/Tehran',

    geonamesUrl:  'https://download.geonames.org/export/dump/IR.zip',
    innerTxtName: 'IR.txt',

    // BBox covers mainland Iran + offshore islands in the Persian Gulf.
    bbox: { minLat: 24.5, maxLat: 40.0, minLng: 43.5, maxLng: 64.0 },

    // admin1 codes VERIFIED via Stage 1 PPLC/PPLA inspection (2026-05-17):
    // GeoNames uses 2-digit numeric codes with gaps. 31 PPLA + 1 PPLC
    // (Tehran=26) cover all 31 provinces. Mapping below is empirical.
    admin1ToRegion: {
        '01': { ar: 'أذربيجان الغربية',         en: 'West Azerbaijan' },          // Urmia
        '03': { ar: 'تشهارمحال وبختياري',       en: 'Chaharmahal and Bakhtiari' }, // Shahrekord
        '04': { ar: 'سيستان وبلوشستان',         en: 'Sistan and Baluchestan' },   // Zahedan
        '05': { ar: 'كهكيلويه وبوير أحمد',      en: 'Kohgiluyeh and Boyer-Ahmad' }, // Yasuj
        '07': { ar: 'فارس',                     en: 'Fars' },                     // Shiraz
        '08': { ar: 'كيلان',                    en: 'Gilan' },                    // Rasht
        '09': { ar: 'همدان',                    en: 'Hamadan' },                  // Hamadan
        '10': { ar: 'إيلام',                    en: 'Ilam' },                     // Ilam
        '11': { ar: 'هرمزغان',                  en: 'Hormozgan' },                // Bandar Abbas
        '13': { ar: 'كرمانشاه',                 en: 'Kermanshah' },               // Kermanshah
        '15': { ar: 'خوزستان',                  en: 'Khuzestan' },                // Ahvaz
        '16': { ar: 'كردستان',                  en: 'Kurdistan' },                // Sanandaj
        '22': { ar: 'بوشهر',                    en: 'Bushehr' },                  // Bushehr
        '23': { ar: 'لرستان',                   en: 'Lorestan' },                 // Khorramabad
        '25': { ar: 'سمنان',                    en: 'Semnan' },                   // Semnan
        '26': { ar: 'طهران',                    en: 'Tehran' },                   // Tehran PPLC
        '28': { ar: 'أصفهان',                   en: 'Isfahan' },                  // Isfahan
        '29': { ar: 'كرمان',                    en: 'Kerman' },                   // Kerman
        '32': { ar: 'أردبيل',                   en: 'Ardabil' },                  // Ardabil
        '33': { ar: 'أذربيجان الشرقية',         en: 'East Azerbaijan' },          // Tabriz
        '34': { ar: 'مركزي',                    en: 'Markazi' },                  // Arak
        '35': { ar: 'مازندران',                 en: 'Mazandaran' },               // Sari
        '36': { ar: 'زنجان',                    en: 'Zanjan' },                   // Zanjan
        '37': { ar: 'كلستان',                   en: 'Golestan' },                 // Gorgan
        '38': { ar: 'قزوين',                    en: 'Qazvin' },                   // Qazvin
        '39': { ar: 'قم',                       en: 'Qom' },                      // Qom
        '40': { ar: 'يزد',                      en: 'Yazd' },                     // Yazd
        '41': { ar: 'خراسان الجنوبية',          en: 'South Khorasan' },           // Birjand
        '42': { ar: 'خراسان رضوي',              en: 'Razavi Khorasan' },          // Mashhad
        '43': { ar: 'خراسان الشمالية',          en: 'North Khorasan' },           // Bojnord
        '44': { ar: 'البرز',                    en: 'Alborz' }                    // Karaj
    },

    // Initial settings per user spec:
    //   "ابدأ بـ: population >= 200,000 أو PPLC / PPLA"
    popMin: 200000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  [],

    // ─── NEW: Persian pre-gate flag (Stage 3.4) ───
    // Tells the wave orchestrator to run persian_pregate_normalizer
    // on every candidate's names.ar (and aliases.ar[]) AFTER Stage 3
    // and BEFORE Stage 3.5.
    persianSource: true
};
