// scripts/geodata/countries/mo.mjs — Macao — CURATED-GEODATA-ASIA-1C
// admin1 verified via Stage 1 inspection (2026-05-17). MO Macau PPLC is at admin1=02.
// Tiny dataset (only 9 P-class entries total).
export default {
    cc:              'mo',
    countryAr:       'ماكاو',
    countryEn:       'Macao',
    defaultTimezone: 'Asia/Macau',

    geonamesUrl:  'https://download.geonames.org/export/dump/MO.zip',
    innerTxtName: 'MO.txt',

    bbox: { minLat: 22.0, maxLat: 22.3, minLng: 113.4, maxLng: 113.7 },

    admin1ToRegion: {
        '01': { ar: 'ماكاو',                en: 'Macao Peninsula' },
        '02': { ar: 'ماكاو',                en: 'Macao' },                 // PPLC
        '03': { ar: 'كولوان',               en: 'Coloane' },
        '04': { ar: 'تايبا',                en: 'Taipa' },
        '': { ar: 'ماكاو',                  en: 'Macao' }                  // safety fallback
    },

    popMin: 200000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
