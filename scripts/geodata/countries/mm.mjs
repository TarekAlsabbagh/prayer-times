// scripts/geodata/countries/mm.mjs — Myanmar (Burma) — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// MM uses 2-digit "01"-"18" — mix of states/regions/union territory.
//   17 = Yangon Region (Yangon)
//   18 = Naypyidaw Union Territory (PPLC, 925k)
//   08 = Mandalay Region (Mandalay 1.2M)
//   13 = Mon State (Mawlamyine 438k)
//   16 = Bago Region (Bago 244k)
//   03 = Ayeyarwady Region (Pathein 237k)
//   01 = Rakhine State (Sittwe 177k)
export default {
    cc:              'mm',
    countryAr:       'ميانمار',
    countryEn:       'Myanmar',
    defaultTimezone: 'Asia/Yangon',

    geonamesUrl:  'https://download.geonames.org/export/dump/MM.zip',
    innerTxtName: 'MM.txt',

    bbox: { minLat: 9.5, maxLat: 28.5, minLng: 92.0, maxLng: 101.2 },

    admin1ToRegion: {
        '':   { ar: 'ميانمار',                en: 'Myanmar' },
        '01': { ar: 'ولاية راخين',           en: 'Rakhine State' },          // Sittwe
        '02': { ar: 'ولاية تشين',            en: 'Chin State' },             // Hakha
        '03': { ar: 'منطقة آيياروادي',       en: 'Ayeyarwady Region' },      // Pathein
        '04': { ar: 'ولاية كاتشين',          en: 'Kachin State' },           // Myitkyina
        '05': { ar: 'ولاية كاين',            en: 'Kayin State' },            // Hpa-An
        '06': { ar: 'ولاية كايا',            en: 'Kayah State' },            // Loikaw
        '08': { ar: 'منطقة ماندالاي',        en: 'Mandalay Region' },        // Mandalay
        '10': { ar: 'منطقة سعجاينغ',         en: 'Sagaing Region' },         // Monywa
        '11': { ar: 'ولاية شان',             en: 'Shan State' },             // Taunggyi
        '12': { ar: 'منطقة تاينثاري',        en: 'Tanintharyi Region' },     // Dawei
        '13': { ar: 'ولاية مون',             en: 'Mon State' },              // Mawlamyine
        '15': { ar: 'منطقة ماغواي',          en: 'Magway Region' },          // Magway
        '16': { ar: 'منطقة باغو',            en: 'Bago Region' },            // Bago
        '17': { ar: 'منطقة يانغون',          en: 'Yangon Region' },          // Yangon
        '18': { ar: 'إقليم نايبيداو',        en: 'Naypyidaw Union Territory' } // PPLC
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
