// scripts/geodata/countries/ch.mjs
// ─────────────────────────────────────────────────────────────────────────
// Switzerland — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ch',
    countryAr:       'سويسرا',
    countryEn:       'Switzerland',
    defaultTimezone: 'Europe/Zurich',

    geonamesUrl:  'https://download.geonames.org/export/dump/CH.zip',
    innerTxtName: 'CH.txt',

    bbox: { minLat: 45.8, maxLat: 47.9, minLng: 5.9, maxLng: 10.6 },

    // Switzerland has 26 cantons. GeoNames uses 2-letter ISO 3166-2:CH
    // codes (ZH, BE, LU, UR, SZ, OW, NW, GL, ZG, FR, SO, BS, BL, SH, AR,
    // AI, SG, GR, AG, TG, TI, VD, VS, NE, GE, JU). Will verify Stage 1.
    admin1ToRegion: {
        'ZH': { ar: 'زيورخ',          en: 'Zürich' },
        'BE': { ar: 'برن',            en: 'Bern' },
        'LU': { ar: 'لوتسرن',         en: 'Lucerne' },
        'UR': { ar: 'أوري',           en: 'Uri' },
        'SZ': { ar: 'شفيتس',          en: 'Schwyz' },
        'OW': { ar: 'أوبفالدن',       en: 'Obwalden' },
        'NW': { ar: 'نيدفالدن',       en: 'Nidwalden' },
        'GL': { ar: 'غلاروس',         en: 'Glarus' },
        'ZG': { ar: 'تسوغ',           en: 'Zug' },
        'FR': { ar: 'فريبورغ',        en: 'Fribourg' },
        'SO': { ar: 'زولوتورن',       en: 'Solothurn' },
        'BS': { ar: 'بازل-شتات',      en: 'Basel-Stadt' },
        'BL': { ar: 'بازل-لاندشافت',  en: 'Basel-Landschaft' },
        'SH': { ar: 'شافهاوزن',       en: 'Schaffhausen' },
        'AR': { ar: 'أبنزل أوسرهودن', en: 'Appenzell Ausserrhoden' },
        'AI': { ar: 'أبنزل إنرهودن',  en: 'Appenzell Innerrhoden' },
        'SG': { ar: 'سانت غالن',      en: 'St. Gallen' },
        'GR': { ar: 'غراوبوندن',      en: 'Graubünden' },
        'AG': { ar: 'أرغاو',          en: 'Aargau' },
        'TG': { ar: 'تورغاو',         en: 'Thurgau' },
        'TI': { ar: 'تيتشينو',        en: 'Ticino' },
        'VD': { ar: 'فو',             en: 'Vaud' },
        'VS': { ar: 'فاليه',          en: 'Valais' },
        'NE': { ar: 'نوشاتيل',        en: 'Neuchâtel' },
        'GE': { ar: 'جنيف',           en: 'Geneva' },
        'JU': { ar: 'جورا',           en: 'Jura' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
