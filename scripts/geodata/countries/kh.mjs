// scripts/geodata/countries/kh.mjs — Cambodia — CURATED-GEODATA-ASIA-1E
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// KH uses 2-digit "02"-"31" — provinces + capital.
//   22 = Phnom Penh PPLC (1.57M)
//   19 = Takeo Province (capital pop 843k!)
//   24 = Siem Reap (139k)
//   29 = Battambang (119k)
//   28 = Sihanoukville (73k)
export default {
    cc:              'kh',
    countryAr:       'كمبوديا',
    countryEn:       'Cambodia',
    defaultTimezone: 'Asia/Phnom_Penh',

    geonamesUrl:  'https://download.geonames.org/export/dump/KH.zip',
    innerTxtName: 'KH.txt',

    bbox: { minLat: 9.9, maxLat: 14.7, minLng: 102.3, maxLng: 107.7 },

    admin1ToRegion: {
        '':   { ar: 'كمبوديا',                en: 'Cambodia' },
        '02': { ar: 'مقاطعة كامبونغ تشام',   en: 'Kampong Cham' },
        '03': { ar: 'مقاطعة كامبونغ تشنانغ', en: 'Kampong Chhnang' },
        '04': { ar: 'مقاطعة كامبونغ سبو',    en: 'Kampong Speu' },
        '05': { ar: 'مقاطعة كامبونغ تهوم',   en: 'Kampong Thom' },
        '07': { ar: 'مقاطعة كانديل',         en: 'Kandal' },                 // Ta Khmau
        '08': { ar: 'مقاطعة كوه كونغ',       en: 'Koh Kong' },
        '09': { ar: 'مقاطعة كراتيي',         en: 'Kratié' },
        '10': { ar: 'مقاطعة موندولكيري',     en: 'Mondulkiri' },             // Sen Monorom
        '12': { ar: 'مقاطعة بورسات',         en: 'Pursat' },
        '13': { ar: 'مقاطعة بريا فيهيار',    en: 'Preah Vihear' },           // Tbeng Meanchey
        '14': { ar: 'مقاطعة بريي فينغ',      en: 'Prey Veng' },
        '17': { ar: 'مقاطعة ستونغ ترينغ',    en: 'Stung Treng' },
        '18': { ar: 'مقاطعة سواي رينغ',      en: 'Svay Rieng' },
        '19': { ar: 'مقاطعة تاكيو',          en: 'Takéo' },
        '21': { ar: 'مقاطعة كامبوت',         en: 'Kampot' },
        '22': { ar: 'فنوم بنه',              en: 'Phnom Penh' },             // PPLC
        '23': { ar: 'مقاطعة راتاناكيري',     en: 'Ratanakiri' },             // Banlung
        '24': { ar: 'مقاطعة سيام ريب',       en: 'Siem Reap' },
        '25': { ar: 'مقاطعة بانتيي مينتشي',  en: 'Banteay Meanchey' },       // Sisophon
        '26': { ar: 'كيب',                   en: 'Kep' },
        '27': { ar: 'مقاطعة أودار مينتشي',   en: 'Oddar Meanchey' },         // Samraong
        '28': { ar: 'مقاطعة سيهانوكفيل',     en: 'Sihanoukville' },          // Preah Sihanouk
        '29': { ar: 'مقاطعة باتامبانغ',      en: 'Battambang' },
        '30': { ar: 'مقاطعة بايلين',         en: 'Pailin' },
        '31': { ar: 'مقاطعة تبونغ خموم',     en: 'Tboung Khmum' }            // Suong
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
