// scripts/geodata/countries/ps.mjs
// ─────────────────────────────────────────────────────────────────────────
// Palestine — GeoNames country config
// CURATED-GEODATA-LEVANT-IRAQ-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ps',
    countryAr:       'فلسطين',
    countryEn:       'Palestine',
    defaultTimezone: 'Asia/Hebron',

    geonamesUrl:  'https://download.geonames.org/export/dump/PS.zip',
    innerTxtName: 'PS.txt',

    // Palestine (West Bank + Gaza): roughly 31.2°-32.6°N and 34.2°-35.6°E
    bbox: { minLat: 31.2, maxLat: 32.7, minLng: 34.2, maxLng: 35.7 },

    // GeoNames uses non-numeric admin1 codes for Palestine:
    //   GZ = Gaza Strip
    //   WE = West Bank
    admin1ToRegion: {
        'GZ': { ar: 'قطاع غزة',                  en: 'Gaza Strip' },
        'WE': { ar: 'الضفة الغربية',             en: 'West Bank' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
