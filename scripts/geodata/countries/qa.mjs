// scripts/geodata/countries/qa.mjs
// ─────────────────────────────────────────────────────────────────────────
// Qatar — GeoNames country config
// CURATED-GEODATA-GCC-1
//
// admin1ToRegion is filled AFTER Stage 1 inspection. Initial run with
// empty map → all entries flagged 'unknown_region'; we then inspect
// PPLA/PPLC entries in the normalized output and update this map.
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'qa',
    countryAr:       'قطر',
    countryEn:       'Qatar',
    defaultTimezone: 'Asia/Qatar',

    geonamesUrl:  'https://download.geonames.org/export/dump/QA.zip',
    innerTxtName: 'QA.txt',

    // Qatar lies roughly between 24.5°-26.2°N and 50.7°-51.7°E
    bbox: { minLat: 24.4, maxLat: 26.2, minLng: 50.5, maxLng: 51.8 },

    // Verified via Stage 1 PPLA/PPLC entries:
    //   01=PPLC Doha, 04=PPLA Al Khawr, 06=PPLA Ar Rayyan,
    //   08=PPLA Madinat ash Shamal, 09=PPLA Umm Salal, 10=PPLA Al Wakrah,
    //   13=PPLA Az Za'ayin, 14=PPLA Ash Shihaniyah
    admin1ToRegion: {
        '01': { ar: 'بلدية الدوحة',         en: 'Ad Dawhah Municipality' },
        '04': { ar: 'بلدية الخور والذخيرة', en: 'Al Khor Municipality' },
        '06': { ar: 'بلدية الريان',         en: 'Al Rayyan Municipality' },
        '08': { ar: 'بلدية الشمال',         en: 'Al Shamal Municipality' },
        '09': { ar: 'بلدية أم صلال',        en: 'Umm Salal Municipality' },
        '10': { ar: 'بلدية الوكرة',          en: 'Al Wakrah Municipality' },
        '13': { ar: 'بلدية الضعاين',         en: 'Al Daayen Municipality' },
        '14': { ar: 'بلدية الشيحانية',       en: 'Al Shihaniya Municipality' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
