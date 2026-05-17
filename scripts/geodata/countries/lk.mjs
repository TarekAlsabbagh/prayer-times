// scripts/geodata/countries/lk.mjs — Sri Lanka — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// LK uses 2-digit "29"-"38" (NOT "01"-"09" as my initial guess).
//   29 = Central   (Kandy)
//   30 = North-Central (Anuradhapura)
//   32 = North-Western (Kurunegala)
//   33 = Sabaragamuwa (Ratnapura)
//   34 = Southern  (Galle)
//   35 = Uva       (Badulla)
//   36 = Western   (Colombo PPLC)
//   37 = Eastern   (Trincomalee)
//   38 = Northern  (Jaffna)
export default {
    cc:              'lk',
    countryAr:       'سريلانكا',
    countryEn:       'Sri Lanka',
    defaultTimezone: 'Asia/Colombo',

    geonamesUrl:  'https://download.geonames.org/export/dump/LK.zip',
    innerTxtName: 'LK.txt',

    bbox: { minLat: 5.9, maxLat: 9.85, minLng: 79.6, maxLng: 81.9 },

    admin1ToRegion: {
        '':   { ar: 'سريلانكا',                en: 'Sri Lanka' },
        '29': { ar: 'المقاطعة الوسطى',         en: 'Central Province' },
        '30': { ar: 'المقاطعة الشمالية الوسطى', en: 'North Central Province' },
        '32': { ar: 'المقاطعة الشمالية الغربية', en: 'North Western Province' },
        '33': { ar: 'مقاطعة سابراغاموا',       en: 'Sabaragamuwa Province' },
        '34': { ar: 'المقاطعة الجنوبية',       en: 'Southern Province' },
        '35': { ar: 'مقاطعة أوفا',             en: 'Uva Province' },
        '36': { ar: 'المقاطعة الغربية',        en: 'Western Province' },     // Colombo PPLC
        '37': { ar: 'المقاطعة الشرقية',        en: 'Eastern Province' },
        '38': { ar: 'المقاطعة الشمالية',       en: 'Northern Province' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
