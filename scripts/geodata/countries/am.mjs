// scripts/geodata/countries/am.mjs — Armenia — CURATED-GEODATA-ASIA-1I
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// AM uses 2-digit "01"-"11" for 10 marzes + Yerevan PPLC.
//   11 = Yerevan (PPLC, 1.14M — already in curated)
//   06 = Lori (Vanadzor 78k — user-watch entry)
//   07 = Shirak (Gyumri 115k)
//
// Vanadzor (78k, AM's 3rd-largest city) passes via alwaysInclude PPLA — no
// need to lower popMin.
export default {
    cc:              'am',
    countryAr:       'أرمينيا',
    countryEn:       'Armenia',
    defaultTimezone: 'Asia/Yerevan',

    geonamesUrl:  'https://download.geonames.org/export/dump/AM.zip',
    innerTxtName: 'AM.txt',

    bbox: { minLat: 38.8, maxLat: 41.3, minLng: 43.4, maxLng: 46.7 },

    admin1ToRegion: {
        '':   { ar: 'أرمينيا',           en: 'Armenia' },
        '01': { ar: 'أراغاتسوتن',        en: 'Aragatsotn' },                  // Ashtarak
        '02': { ar: 'آرارات',            en: 'Ararat' },                      // Artashat
        '03': { ar: 'أرمافير',           en: 'Armavir' },
        '04': { ar: 'غيغاركونيك',        en: 'Gegharkunik' },                 // Gavar
        '05': { ar: 'كوتايك',            en: 'Kotayk' },                      // Hrazdan
        '06': { ar: 'لوري',              en: 'Lori' },                        // Vanadzor
        '07': { ar: 'شيراك',             en: 'Shirak' },                      // Gyumri
        '08': { ar: 'سيونيك',            en: 'Syunik' },                      // Kapan
        '09': { ar: 'تافوش',             en: 'Tavush' },                      // Ijevan
        '10': { ar: 'فايوتس دزور',       en: 'Vayots Dzor' },                 // Yeghegnadzor
        '11': { ar: 'يريفان',            en: 'Yerevan' }                      // PPLC
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
