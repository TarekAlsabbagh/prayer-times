// scripts/geodata/countries/bn.mjs — Brunei — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// BN uses 2-digit "01"-"04", one per district.
//   01 = Belait (Kuala Belait)
//   02 = Brunei-Muara (Bandar Seri Begawan PPLC)
//   03 = Temburong (Bangar)
//   04 = Tutong
//
// User priority: 78% Muslim-majority country, prayer-times target.
// popMin=20,000 + alwaysInclude PPLC/PPLA captures all 4 district capitals.
export default {
    cc:              'bn',
    countryAr:       'بروناي',
    countryEn:       'Brunei',
    defaultTimezone: 'Asia/Brunei',

    geonamesUrl:  'https://download.geonames.org/export/dump/BN.zip',
    innerTxtName: 'BN.txt',

    bbox: { minLat: 4.0, maxLat: 5.1, minLng: 114.0, maxLng: 115.4 },

    admin1ToRegion: {
        '':   { ar: 'بروناي',           en: 'Brunei' },
        '01': { ar: 'منطقة بليت',       en: 'Belait' },                    // Kuala Belait
        '02': { ar: 'بروناي ومووارا',   en: 'Brunei-Muara' },              // Bandar Seri Begawan PPLC
        '03': { ar: 'منطقة تمبورنغ',    en: 'Temburong' },                 // Bangar
        '04': { ar: 'منطقة توتونغ',     en: 'Tutong' }                     // Tutong
    },

    popMin: 20000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
