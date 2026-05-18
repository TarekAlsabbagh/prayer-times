// scripts/geodata/countries/af.mjs — Afghanistan — CURATED-GEODATA-ASIA-1G-AF
//
// admin1 codes (GeoNames, 2-digit numeric, 34 provinces of Afghanistan).
// PROVISIONAL — to be VERIFIED via Stage 1 PPLA/PPLC inspection before merge.
// The mapping below follows the documented GeoNames Afghanistan dump
// convention; one or two codes may shift after Stage 1 confirms.
//
// persianSource: true — enables Stage 3.4 Persian + Pashto pre-gate
// (same module proven on IR; Pashto letters ښ ګ څ ځ ډ ړ ڼ already in
// PERSIAN_CHAR_MAP and exercised in design fixture).
//
// popMin: 100,000 per user direction — Afghanistan is smaller than Iran
// and PPLAs of provincial capitals matter. PPLC + PPLA stay
// always-included regardless of population (so even small province
// seats like ilam-equivalent are captured).

export default {
    cc:              'af',
    countryAr:       'أفغانستان',
    countryEn:       'Afghanistan',
    defaultTimezone: 'Asia/Kabul',

    geonamesUrl:  'https://download.geonames.org/export/dump/AF.zip',
    innerTxtName: 'AF.txt',

    // BBox covers mainland Afghanistan with margin.
    bbox: { minLat: 29.0, maxLat: 39.0, minLng: 60.0, maxLng: 75.0 },

    // admin1 codes VERIFIED via Stage 1 PPLC/PPLA inspection (2026-05-18):
    // GeoNames uses 2-digit numeric codes "01"-"42" with gaps (04/12/15/16/
    // 20/21/22/25). 34 PPLAs (one per province) + 1 PPLC (Kabul=13).
    // Mapping below is empirical from each province seat's admin1.
    admin1ToRegion: {
        '01': { ar: 'بدخشان',                en: 'Badakhshan' },         // Fayzabad
        '02': { ar: 'بادغيس',                en: 'Badghis' },            // Qala i Naw
        '03': { ar: 'بغلان',                 en: 'Baghlan' },            // Pul-e Khumri
        '05': { ar: 'باميان',                en: 'Bamyan' },             // Bamyan
        '06': { ar: 'فراه',                  en: 'Farah' },              // Farah
        '07': { ar: 'فارياب',                en: 'Faryab' },             // Maymana
        '08': { ar: 'غزني',                  en: 'Ghazni' },             // Ghazni PPLA
        '09': { ar: 'غور',                   en: 'Ghor' },               // Fayroz Koh (renamed from Chaghcharan 2014)
        '10': { ar: 'هلمند',                 en: 'Helmand' },            // Lashkar Gah
        '11': { ar: 'هرات',                  en: 'Herat' },              // Herat
        '13': { ar: 'كابول',                 en: 'Kabul' },              // Kabul PPLC
        '14': { ar: 'كابيسا',                en: 'Kapisa' },             // Sidqabad
        '17': { ar: 'لوكر',                  en: 'Logar' },              // Pul-e Alam
        '18': { ar: 'نانكرهار',              en: 'Nangarhar' },          // Jalalabad
        '19': { ar: 'نيمروز',                en: 'Nimroz' },             // Zaranj
        '23': { ar: 'قندهار',                en: 'Kandahar' },           // Kandahar
        '24': { ar: 'قندوز',                 en: 'Kunduz' },             // Kunduz
        '26': { ar: 'تخار',                  en: 'Takhar' },             // Taloqan
        '27': { ar: 'وردك',                  en: 'Wardak' },             // Maydanshakhr
        '28': { ar: 'زابل',                  en: 'Zabul' },              // Qalat
        '29': { ar: 'باكتيكا',               en: 'Paktika' },            // Sharan
        '30': { ar: 'بلخ',                   en: 'Balkh' },              // Mazar-e Sharif
        '31': { ar: 'جوزجان',                en: 'Jowzjan' },            // Shibirghan
        '32': { ar: 'سمنغان',                en: 'Samangan' },           // Aibak
        '33': { ar: 'سار اي بل',             en: 'Sar-e Pol' },          // Sar-e Pul
        '34': { ar: 'كنر',                   en: 'Kunar' },              // Asadabad
        '35': { ar: 'لغمان',                 en: 'Laghman' },            // Mehtar Lam
        '36': { ar: 'باكتيا',                en: 'Paktia' },             // Gardez
        '37': { ar: 'خوست',                  en: 'Khost' },              // Khost
        '38': { ar: 'نورستان',               en: 'Nuristan' },           // Parun
        '39': { ar: 'أوروزغان',              en: 'Urozgan' },            // Tarinkot
        '40': { ar: 'بروان',                 en: 'Parwan' },             // Charikar
        '41': { ar: 'دايكندي',               en: 'Daykundi' },           // Nili
        '42': { ar: 'بانشير',                en: 'Panjshir' }            // Bazarak (created 2004)
    },

    // Initial settings per user spec:
    //   "ابدأ بـ: population >= 100,000 أو PPLC / PPLA"
    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  [],

    // Stage 3.4 Persian + Pashto pre-gate flag
    persianSource: true
};
