// scripts/geodata/countries/nl.mjs
// ─────────────────────────────────────────────────────────────────────────
// Netherlands — GeoNames country config
// CURATED-GEODATA-EUROPE-1A
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'nl',
    countryAr:       'هولندا',
    countryEn:       'Netherlands',
    defaultTimezone: 'Europe/Amsterdam',

    geonamesUrl:  'https://download.geonames.org/export/dump/NL.zip',
    innerTxtName: 'NL.txt',

    // Netherlands proper (European mainland). 50.7°-53.6°N, 3.3°-7.3°E.
    // Excludes Caribbean territories (Aruba AW, Curaçao CW,
    // Sint Maarten SX, plus BES islands BQ).
    bbox: { minLat: 50.7, maxLat: 53.6, minLng: 3.3, maxLng: 7.3 },

    // Netherlands admin1 in GeoNames uses 2-digit numeric codes
    // (verified via Stage 1 PPLA inspection on 2026-05-15):
    //   01 = Drenthe       02 = Friesland      03 = Gelderland
    //   04 = Groningen     05 = Limburg        06 = North Brabant
    //   07 = North Holland 09 = Utrecht        10 = Zeeland
    //   11 = South Holland 15 = Overijssel     16 = Flevoland
    //
    // (Note: codes 08/12/13/14 are gaps in GeoNames' NL scheme.)
    admin1ToRegion: {
        '01': { ar: 'درنته',                    en: 'Drenthe' },
        '02': { ar: 'فريسلاند',                 en: 'Friesland' },
        '03': { ar: 'خيلدرلاند',                en: 'Gelderland' },
        '04': { ar: 'خرونينغن',                 en: 'Groningen' },
        '05': { ar: 'ليمبورخ',                  en: 'Limburg' },
        '06': { ar: 'برابانت الشمالية',         en: 'North Brabant' },
        '07': { ar: 'هولندا الشمالية',          en: 'North Holland' },
        '09': { ar: 'أوتريخت',                  en: 'Utrecht' },
        '10': { ar: 'زيلاند',                   en: 'Zeeland' },
        '11': { ar: 'هولندا الجنوبية',          en: 'South Holland' },
        '15': { ar: 'أوفرآيسل',                 en: 'Overijssel' },
        '16': { ar: 'فليفولاند',                en: 'Flevoland' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
