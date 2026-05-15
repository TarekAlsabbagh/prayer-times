// scripts/geodata/countries/be.mjs
// ─────────────────────────────────────────────────────────────────────────
// Belgium — GeoNames country config
// CURATED-GEODATA-EUROPE-1A
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'be',
    countryAr:       'بلجيكا',
    countryEn:       'Belgium',
    defaultTimezone: 'Europe/Brussels',

    geonamesUrl:  'https://download.geonames.org/export/dump/BE.zip',
    innerTxtName: 'BE.txt',

    // Belgium proper: roughly 49.5°-51.6°N and 2.4°-6.5°E.
    bbox: { minLat: 49.4, maxLat: 51.6, minLng: 2.4, maxLng: 6.5 },

    // Belgium admin1 in GeoNames follows the 3-region model
    // (Brussels-Capital, Flanders, Wallonia) AND/OR the 10-province
    // breakdown. ISO 3166-2 uses VLG/WAL/BRU at region level.
    //
    // The 10 provinces:
    //   01=Antwerpen, 03=Brabant Wallon, 04=West-Vlaanderen,
    //   05=Hainaut, 06=Liège, 07=Limburg (BE), 08=Luxembourg (BE),
    //   09=Namur, 10=Oost-Vlaanderen, 12=Vlaams-Brabant.
    //   11 = Brussels-Capital region.
    //
    // Some older GeoNames entries use 2-letter ISO sub-codes. We'll
    // verify post Stage 1.
    admin1ToRegion: {
        '01': { ar: 'أنتويرب',                en: 'Antwerp' },
        '03': { ar: 'برابانت الوالوني',       en: 'Walloon Brabant' },
        '04': { ar: 'فلاندرز الغربية',        en: 'West Flanders' },
        '05': { ar: 'هينو',                   en: 'Hainaut' },
        '06': { ar: 'لييج',                   en: 'Liège' },
        '07': { ar: 'ليمبورخ',                en: 'Limburg' },
        '08': { ar: 'لوكسمبورغ (مقاطعة)',     en: 'Luxembourg (Province)' },
        '09': { ar: 'نامور',                  en: 'Namur' },
        '10': { ar: 'فلاندرز الشرقية',        en: 'East Flanders' },
        '11': { ar: 'بروكسل العاصمة',         en: 'Brussels-Capital' },
        '12': { ar: 'برابانت الفلمنكية',      en: 'Flemish Brabant' },
        'BRU': { ar: 'بروكسل العاصمة',        en: 'Brussels-Capital' },
        'VLG': { ar: 'الإقليم الفلمنكي',      en: 'Flemish Region' },
        'WAL': { ar: 'الإقليم الوالوني',      en: 'Walloon Region' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
