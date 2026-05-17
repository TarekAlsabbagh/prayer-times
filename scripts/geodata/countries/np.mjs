// scripts/geodata/countries/np.mjs — Nepal — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// NP uses 1-digit numeric "1"-"7" matching the 7 development regions (NOT
// the 2015 province codes or 14-zone codes).
//   1 = Eastern   (Dhankuta)
//   2 = Central   (Janakpur)
//   3 = Bagmati   (Kathmandu PPLC)
//   4 = Gandaki   (Pokhara)
//   5 = Lumbini   (Butwal)
//   6 = Karnali   (Birendranagar)
//   7 = Far-Western (Dipayal)
export default {
    cc:              'np',
    countryAr:       'نيبال',
    countryEn:       'Nepal',
    defaultTimezone: 'Asia/Kathmandu',

    geonamesUrl:  'https://download.geonames.org/export/dump/NP.zip',
    innerTxtName: 'NP.txt',

    bbox: { minLat: 26.3, maxLat: 30.5, minLng: 80.0, maxLng: 88.3 },

    admin1ToRegion: {
        '':  { ar: 'نيبال',                 en: 'Nepal' },
        '1': { ar: 'الإقليم الشرقي',         en: 'Eastern Region' },
        '2': { ar: 'الإقليم الأوسط',         en: 'Central Region' },
        '3': { ar: 'باغماتي',               en: 'Bagmati' },                // Kathmandu PPLC
        '4': { ar: 'الإقليم الغربي',         en: 'Western Region' },
        '5': { ar: 'إقليم لومبيني',          en: 'Lumbini' },
        '6': { ar: 'الإقليم الأوسط الغربي',  en: 'Mid-Western Region' },
        '7': { ar: 'الإقليم الغربي البعيد',  en: 'Far-Western Region' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
