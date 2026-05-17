// scripts/geodata/countries/mv.mjs — Maldives — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// MV uses 2-digit "01", "05", "10346475" (anomaly), "31"-"47" — one code per atoll.
//   38 = Malé (PPLC, pop=103,693)
//   Other atolls 01/05/31-47 have PPLA capitals (mostly pop 1k-11k).
//
// User priority: 100% Muslim country, prayer-times target.
// popMin LOWERED to 30,000 — only Male exceeds 100k; alwaysInclude triggers
// the rest. Note: most PPLAs are <5k so this captures only Male meaningfully.
export default {
    cc:              'mv',
    countryAr:       'جزر المالديف',
    countryEn:       'Maldives',
    defaultTimezone: 'Indian/Maldives',

    geonamesUrl:  'https://download.geonames.org/export/dump/MV.zip',
    innerTxtName: 'MV.txt',

    bbox: { minLat: -0.7, maxLat: 7.1, minLng: 72.5, maxLng: 73.8 },

    // Atoll codes verified from Stage 1.
    admin1ToRegion: {
        '':         { ar: 'جزر المالديف',     en: 'Maldives' },
        '01':       { ar: 'أتول سيينو',       en: 'Seenu Atoll' },        // Hithadhoo
        '05':       { ar: 'أتول لافياني',     en: 'Laamu Atoll' },        // Fonadhoo
        '10346475': { ar: 'أتول أليف داال',   en: 'Alif Dhaalu' },        // Mahibadhoo
        '31':       { ar: 'أتول بآا',         en: 'Baa Atoll' },          // Eydhafushi
        '32':       { ar: 'أتول داال',        en: 'Dhaalu Atoll' },       // Kudahuvadhoo
        '33':       { ar: 'أتول فآاف',        en: 'Faafu Atoll' },        // Nilandhoo
        '34':       { ar: 'أتول غاف ألف',     en: 'Gaafu Alif' },         // Viligili
        '35':       { ar: 'أتول غاف داال',    en: 'Gaafu Dhaalu' },       // Thinadhoo
        '36':       { ar: 'أتول هاء ألف',     en: 'Haa Alif' },           // Dhihdhoo
        '37':       { ar: 'أتول هاء داال',    en: 'Haa Dhaalu' },         // Kulhudhuffushi
        '38':       { ar: 'ماليه',            en: 'Malé' },               // PPLC
        '39':       { ar: 'أتول لافياني',     en: 'Lhaviyani Atoll' },    // Naifaru
        '41':       { ar: 'أتول ميم',         en: 'Meemu Atoll' },        // Muli
        '42':       { ar: 'أتول غنافياني',    en: 'Gnaviyani Atoll' },    // Fuvahmulah
        '43':       { ar: 'أتول نون',         en: 'Noonu Atoll' },        // Manadhoo
        '44':       { ar: 'أتول راء',         en: 'Raa Atoll' },          // Un’goofaaru
        '45':       { ar: 'أتول شافياني',     en: 'Shaviyani Atoll' },    // Funadhoo
        '46':       { ar: 'أتول ثاء',         en: 'Thaa Atoll' },         // Veymandoo
        '47':       { ar: 'أتول فآفو',        en: 'Vaavu Atoll' }         // Felidhoo
    },

    popMin: 30000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
