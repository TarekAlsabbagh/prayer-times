// scripts/geodata/countries/tl.mjs — Timor-Leste — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// TL uses 2-LETTER codes (NOT numeric), one per municipality.
//   DI = Dili (PPLC, 150k)
//   AL = Aileu, AN = Ainaro, BA = Baucau, BO = Bobonaro (Maliana)
//   CO = Cova Lima (Suai), LA = Lautém (Lospalos), LI = Liquiçá
//   MF = Manufahi (Same), MT = Manatuto, OE = Oecusse (Pante Makasar)
//   VI = Viqueque
// (ER for Ermera observed in some sources but no PPLA in dump.)
//
// Currently 0 entries in curated. popMin=20,000 captures Dili + ~5-7 PPLAs.
export default {
    cc:              'tl',
    countryAr:       'تيمور الشرقية',
    countryEn:       'Timor-Leste',
    defaultTimezone: 'Asia/Dili',

    geonamesUrl:  'https://download.geonames.org/export/dump/TL.zip',
    innerTxtName: 'TL.txt',

    bbox: { minLat: -9.5, maxLat: -8.1, minLng: 124.0, maxLng: 127.4 },

    admin1ToRegion: {
        '':   { ar: 'تيمور الشرقية',         en: 'Timor-Leste' },
        'AL': { ar: 'بلدية أيليو',           en: 'Aileu' },
        'AN': { ar: 'بلدية أينارو',          en: 'Ainaro' },
        'BA': { ar: 'بلدية باوكاو',          en: 'Baucau' },
        'BO': { ar: 'بلدية بوبونارو',        en: 'Bobonaro' },               // Maliana
        'CO': { ar: 'بلدية كوفا ليما',       en: 'Cova Lima' },              // Suai
        'DI': { ar: 'بلدية ديلي',            en: 'Dili' },                   // PPLC
        'ER': { ar: 'بلدية إرميرا',          en: 'Ermera' },                 // common but no PPLA in raw
        'LA': { ar: 'بلدية لاوتيم',          en: 'Lautém' },                 // Lospalos
        'LI': { ar: 'بلدية ليكيسا',          en: 'Liquiçá' },
        'MF': { ar: 'بلدية مانوفاي',         en: 'Manufahi' },               // Same
        'MT': { ar: 'بلدية مانتوتو',         en: 'Manatuto' },
        'OE': { ar: 'بلدية أوي-كوسي',        en: 'Oecusse' },                // Pante Makasar
        'VI': { ar: 'بلدية فيكيكي',          en: 'Viqueque' }
    },

    popMin: 20000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
