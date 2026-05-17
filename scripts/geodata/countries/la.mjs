// scripts/geodata/countries/la.mjs — Laos — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// LA uses 2-digit "01"-"27" — provinces + prefecture.
//   24 = Vientiane Prefecture (PPLC, 840k)
//   20 = Savannakhet (125k)
//   15 = Khammouane (Thakhek 90k)
//   17 = Luang Prabang (55k)
export default {
    cc:              'la',
    countryAr:       'لاوس',
    countryEn:       'Laos',
    defaultTimezone: 'Asia/Vientiane',

    geonamesUrl:  'https://download.geonames.org/export/dump/LA.zip',
    innerTxtName: 'LA.txt',

    bbox: { minLat: 13.9, maxLat: 22.5, minLng: 100.0, maxLng: 107.7 },

    admin1ToRegion: {
        '':   { ar: 'لاوس',                  en: 'Laos' },
        '01': { ar: 'مقاطعة أتابو',          en: 'Attapeu' },
        '02': { ar: 'مقاطعة تشامباساك',      en: 'Champasak' },              // Pakse
        '03': { ar: 'مقاطعة هوافان',         en: 'Houaphanh' },              // Xam Nua
        '07': { ar: 'مقاطعة أودومكساي',      en: 'Oudomxay' },               // Muang Xay
        '13': { ar: 'مقاطعة سايابولي',       en: 'Sainyabuli' },
        '14': { ar: 'مقاطعة شيانغ خوانغ',    en: 'Xiangkhouang' },           // Phonsavan
        '15': { ar: 'مقاطعة خامواني',        en: 'Khammouane' },             // Thakhek
        '16': { ar: 'مقاطعة لوانغ نامتا',    en: 'Luang Namtha' },
        '17': { ar: 'مقاطعة لوانغ برابانغ',  en: 'Luang Prabang' },
        '18': { ar: 'مقاطعة فونغسالي',       en: 'Phongsaly' },
        '19': { ar: 'مقاطعة سالافان',        en: 'Salavan' },
        '20': { ar: 'مقاطعة سافاناخيت',      en: 'Savannakhet' },
        '22': { ar: 'مقاطعة بوكيو',          en: 'Bokeo' },                  // Ban Houayxay
        '23': { ar: 'مقاطعة بوليخامساي',     en: 'Bolikhamsai' },            // Pakxan
        '24': { ar: 'فينتيان',               en: 'Vientiane (prefecture)' }, // PPLC
        '26': { ar: 'مقاطعة سيكونغ',         en: 'Sekong' },
        '27': { ar: 'مقاطعة فينتيان',        en: 'Vientiane (province)' }    // Muang Phôn-Hông
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
