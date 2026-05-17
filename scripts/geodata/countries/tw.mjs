// scripts/geodata/countries/tw.mjs — Taiwan — CURATED-GEODATA-ASIA-1C
// admin1 codes verified via Stage 1 PPLA/PPLC inspection (2026-05-17).
// TW uses 2-digit numeric codes BUT only 4 PPLA/PPLC entries appear in dump
// because most TW municipalities are PPLA3-equivalent or PPL. Major cities
// (New Taipei, Taoyuan, Taichung, Tainan) are PPL/PPLA2 not PPLA in this dump.
export default {
    cc:              'tw',
    countryAr:       'تايوان',
    countryEn:       'Taiwan',
    defaultTimezone: 'Asia/Taipei',

    geonamesUrl:  'https://download.geonames.org/export/dump/TW.zip',
    innerTxtName: 'TW.txt',

    bbox: { minLat: 21.5, maxLat: 26.5, minLng: 118.0, maxLng: 122.5 },

    // Verified codes from Stage 1 inspection
    admin1ToRegion: {
        '01': { ar: 'فوجيان (تايوان)',      en: 'Fujian (TW)' },           // Jincheng (Kinmen Islands)
        '02': { ar: 'كاوهسيونغ',            en: 'Kaohsiung' },             // direct-administered municipality
        '03': { ar: 'تايبيه',               en: 'Taipei' },                // direct-administered municipality
        '04': { ar: 'تايوان (مقاطعة)',      en: 'Taiwan Province' },       // PPLC + Zhongxing (historical capital)
        // Additional codes that may appear in PPL/PPLA2 rows
        '07': { ar: 'فوجيان',               en: 'Fujian (TW)' },
        '11': { ar: 'كاوهسيونغ',            en: 'Kaohsiung' },
        '13': { ar: 'تايتشونغ',             en: 'Taichung' },
        '15': { ar: 'يلان',                 en: 'Yilan' },
        '19': { ar: 'هسينتشو',              en: 'Hsinchu' },
        '21': { ar: 'هواليان',              en: 'Hualien' },
        '23': { ar: 'كي لونغ',              en: 'Keelung' },
        '25': { ar: 'مياولي',               en: 'Miaoli' },
        '27': { ar: 'نانتو',                en: 'Nantou' },
        '29': { ar: 'بينغهو',               en: 'Penghu' },
        '31': { ar: 'بينغتونغ',             en: 'Pingtung' },
        '33': { ar: 'تاينان',               en: 'Tainan' },
        '35': { ar: 'نيو تايبيه',           en: 'New Taipei' },
        '37': { ar: 'تاويوان',              en: 'Taoyuan' },
        '39': { ar: 'تايتونغ',              en: 'Taitung' },
        '41': { ar: 'يونلين',               en: 'Yunlin' }
    },

    popMin: 200000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
