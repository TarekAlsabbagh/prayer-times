// scripts/geodata/countries/tj.mjs — Tajikistan — CURATED-GEODATA-ASIA-1H
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// TJ uses 2-digit "01"-"04" for 3 regions + Dushanbe (which sits in DRS).
//   04 = Dushanbe (PPLC, 679k — already in curated)
//   03 = Sughd (Khujand 191k)
//   02 = Khatlon (Bokhtar 111k)
//   01 = GBAO Gorno-Badakhshan (Khorugh 30k)
export default {
    cc:              'tj',
    countryAr:       'طاجيكستان',
    countryEn:       'Tajikistan',
    defaultTimezone: 'Asia/Dushanbe',

    geonamesUrl:  'https://download.geonames.org/export/dump/TJ.zip',
    innerTxtName: 'TJ.txt',

    bbox: { minLat: 36.7, maxLat: 41.0, minLng: 67.4, maxLng: 75.2 },

    admin1ToRegion: {
        '':   { ar: 'طاجيكستان',           en: 'Tajikistan' },
        '01': { ar: 'كوهستان بدخشان',      en: 'GBAO (Gorno-Badakhshan)' },   // Khorugh
        '02': { ar: 'منطقة خاتلون',        en: 'Khatlon' },                    // Bokhtar
        '03': { ar: 'منطقة سغد',           en: 'Sughd' },                      // Khujand
        '04': { ar: 'دوشنبه',              en: 'Dushanbe' }                    // PPLC
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
