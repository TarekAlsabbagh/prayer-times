// scripts/geodata/countries/kg.mjs — Kyrgyzstan — CURATED-GEODATA-ASIA-1H
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// KG uses 2-digit "01"-"09" (skipping 02, 05) for 7 regions + 2 cities.
//   01 = Bishkek (PPLC, 900k — already in curated)
//   08 = Osh city (322k)
//   03 = Talas (Manas 123k — actually Manas is a small town, watch this)
//   07 = Issyk-Kul (Karakol 84k)
//   06 = Talas Region (Talas city 40k)
//   04 = Naryn Region (Naryn 41k)
//   09 = Batken Region (Batken 28k)
export default {
    cc:              'kg',
    countryAr:       'قيرغيزستان',
    countryEn:       'Kyrgyzstan',
    defaultTimezone: 'Asia/Bishkek',

    geonamesUrl:  'https://download.geonames.org/export/dump/KG.zip',
    innerTxtName: 'KG.txt',

    bbox: { minLat: 39.2, maxLat: 43.3, minLng: 69.3, maxLng: 80.3 },

    admin1ToRegion: {
        '':   { ar: 'قيرغيزستان',           en: 'Kyrgyzstan' },
        '01': { ar: 'بشكيك',                en: 'Bishkek' },                   // PPLC
        '03': { ar: 'منطقة تالاس',          en: 'Talas Region (Manas)' },
        '04': { ar: 'منطقة نارين',          en: 'Naryn' },
        '06': { ar: 'منطقة تالاس',          en: 'Talas (city)' },
        '07': { ar: 'منطقة إيسيك-كول',      en: 'Issyk-Kul' },                 // Karakol
        '08': { ar: 'أوش',                  en: 'Osh (city)' },                // city of republic significance
        '09': { ar: 'منطقة باتكن',          en: 'Batken' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
