// scripts/geodata/countries/dk.mjs
// ─────────────────────────────────────────────────────────────────────────
// Denmark — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'dk',
    countryAr:       'الدنمارك',
    countryEn:       'Denmark',
    defaultTimezone: 'Europe/Copenhagen',

    geonamesUrl:  'https://download.geonames.org/export/dump/DK.zip',
    innerTxtName: 'DK.txt',

    // Denmark mainland (Jutland + Funen + Zealand + Bornholm). Excludes
    // Faroe Islands (FO) + Greenland (GL).
    bbox: { minLat: 54.5, maxLat: 57.8, minLng: 8.0, maxLng: 15.2 },

    // Post-2007 reform: 5 administrative regions. Verify Stage 1.
    admin1ToRegion: {
        '17': { ar: 'منطقة العاصمة',  en: 'Capital Region' },
        '18': { ar: 'جوتلاند الوسطى', en: 'Central Jutland' },
        '19': { ar: 'جوتلاند الشمالية', en: 'North Jutland' },
        '20': { ar: 'زيلاند',         en: 'Zealand' },
        '21': { ar: 'جنوب الدنمارك',  en: 'South Denmark' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
