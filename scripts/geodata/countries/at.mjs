// scripts/geodata/countries/at.mjs
// ─────────────────────────────────────────────────────────────────────────
// Austria — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'at',
    countryAr:       'النمسا',
    countryEn:       'Austria',
    defaultTimezone: 'Europe/Vienna',

    geonamesUrl:  'https://download.geonames.org/export/dump/AT.zip',
    innerTxtName: 'AT.txt',

    bbox: { minLat: 46.3, maxLat: 49.1, minLng: 9.5, maxLng: 17.2 },

    // Austria has 9 federal states (Bundesländer). Initial map; will
    // verify post Stage 1.
    admin1ToRegion: {
        '01': { ar: 'بورغنلاند',     en: 'Burgenland' },
        '02': { ar: 'كارينثيا',      en: 'Carinthia' },
        '03': { ar: 'النمسا السفلى', en: 'Lower Austria' },
        '04': { ar: 'النمسا العليا', en: 'Upper Austria' },
        '05': { ar: 'سالزبورغ',      en: 'Salzburg' },
        '06': { ar: 'ستيريا',        en: 'Styria' },
        '07': { ar: 'تيرول',         en: 'Tyrol' },
        '08': { ar: 'فورارلبرغ',     en: 'Vorarlberg' },
        '09': { ar: 'فيينا',         en: 'Vienna' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
