// scripts/geodata/countries/kr.mjs — South Korea — CURATED-GEODATA-ASIA-1C
// admin1 codes verified via Stage 1 PPLA/PPLC inspection (2026-05-17).
// KR has 17 admin1 units. GeoNames uses 2-digit numeric codes.
export default {
    cc:              'kr',
    countryAr:       'كوريا الجنوبية',
    countryEn:       'South Korea',
    defaultTimezone: 'Asia/Seoul',

    geonamesUrl:  'https://download.geonames.org/export/dump/KR.zip',
    innerTxtName: 'KR.txt',

    bbox: { minLat: 32.5, maxLat: 39.5, minLng: 124.0, maxLng: 132.0 },

    admin1ToRegion: {
        '01': { ar: 'جيجو',                 en: 'Jeju' },                  // Jeju City (Special Self-Governing)
        '03': { ar: 'جيولا الشمالية',       en: 'North Jeolla' },          // Jeonju
        '05': { ar: 'تشونغتشيونغ الشمالية', en: 'North Chungcheong' },     // Cheongju
        '06': { ar: 'كانغوون',              en: 'Gangwon' },               // Chuncheon
        '10': { ar: 'بوسان',                en: 'Busan' },                 // metropolitan
        '11': { ar: 'سيول',                 en: 'Seoul' },                 // PPLC (Special City)
        '12': { ar: 'إنتشون',               en: 'Incheon' },               // metropolitan
        '13': { ar: 'غيونغي',               en: 'Gyeonggi' },              // Suwon
        '14': { ar: 'كيونغسانغ الشمالية',   en: 'North Gyeongsang' },      // Andong
        '15': { ar: 'دايغو',                en: 'Daegu' },                 // metropolitan
        '16': { ar: 'جيولا الجنوبية',       en: 'South Jeolla' },          // Muan
        '17': { ar: 'تشونغتشيونغ الجنوبية', en: 'South Chungcheong' },     // Hongseong
        '18': { ar: 'غوانغجو',              en: 'Gwangju' },               // metropolitan
        '19': { ar: 'دايجون',               en: 'Daejeon' },               // metropolitan
        '20': { ar: 'كيونغسانغ الجنوبية',   en: 'South Gyeongsang' },      // Changwon
        '21': { ar: 'أولسان',               en: 'Ulsan' },                 // metropolitan
        '22': { ar: 'سيجونغ',               en: 'Sejong' }                 // Special Autonomous City
    },

    popMin: 200000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
