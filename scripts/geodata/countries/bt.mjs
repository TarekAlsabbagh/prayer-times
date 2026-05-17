// scripts/geodata/countries/bt.mjs — Bhutan — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// BT uses 2-digit "05"-"24" — one per dzongkhag.
//   20 = Thimphu PPLC (pop 98,676)
// Initial entries are 0 in curated. popMin=20,000 captures Thimphu plus ~5 PPLAs.
export default {
    cc:              'bt',
    countryAr:       'بوتان',
    countryEn:       'Bhutan',
    defaultTimezone: 'Asia/Thimphu',

    geonamesUrl:  'https://download.geonames.org/export/dump/BT.zip',
    innerTxtName: 'BT.txt',

    bbox: { minLat: 26.6, maxLat: 28.4, minLng: 88.7, maxLng: 92.2 },

    admin1ToRegion: {
        '':   { ar: 'بوتان',                en: 'Bhutan' },
        '05': { ar: 'دزونغخاغ بومثانغ',     en: 'Bumthang' },              // Jakar
        '06': { ar: 'دزونغخاغ تشوكا',       en: 'Chukha' },                // Tsimasham
        '07': { ar: 'دزونغخاغ تسيرانغ',     en: 'Tsirang' },               // Damphu/Tsirang
        '08': { ar: 'دزونغخاغ داغانا',      en: 'Dagana' },                // Daga
        '09': { ar: 'دزونغخاغ سارباغ',      en: 'Sarpang' },               // Sarpang town
        '10': { ar: 'دزونغخاغ هاآ',         en: 'Haa' },
        '11': { ar: 'دزونغخاغ لهونتسي',     en: 'Lhuntse' },
        '12': { ar: 'دزونغخاغ مونغار',      en: 'Mongar' },
        '13': { ar: 'دزونغخاغ بارو',        en: 'Paro' },
        '14': { ar: 'دزونغخاغ بيماغاتشيل',  en: 'Pemagatshel' },
        '15': { ar: 'دزونغخاغ بوناخا',      en: 'Punakha' },
        '16': { ar: 'دزونغخاغ سامتسي',      en: 'Samtse' },
        '17': { ar: 'دزونغخاغ سامدروب جونغخار', en: 'Samdrup Jongkhar' },
        '18': { ar: 'دزونغخاغ زهيمغانغ',    en: 'Zhemgang' },              // Shemgang
        '19': { ar: 'دزونغخاغ تراشيغانغ',   en: 'Trashigang' },
        '20': { ar: 'دزونغخاغ ثيمفو',       en: 'Thimphu' },               // PPLC
        '21': { ar: 'دزونغخاغ ترونغسا',     en: 'Trongsa' },
        '22': { ar: 'دزونغخاغ وانغديو فودرانغ', en: 'Wangdue Phodrang' },
        '23': { ar: 'دزونغخاغ غاسا',        en: 'Gasa' },
        '24': { ar: 'دزونغخاغ تراشي يانغتسي', en: 'Trashi Yangtse' }
    },

    popMin: 20000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
