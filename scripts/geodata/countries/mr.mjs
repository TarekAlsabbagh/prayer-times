// scripts/geodata/countries/mr.mjs
// ─────────────────────────────────────────────────────────────────────────
// Mauritania — GeoNames country config
// CURATED-GEODATA-MAGHREB-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'mr',
    countryAr:       'موريتانيا',
    countryEn:       'Mauritania',
    defaultTimezone: 'Africa/Nouakchott',

    geonamesUrl:  'https://download.geonames.org/export/dump/MR.zip',
    innerTxtName: 'MR.txt',

    // Mauritania: roughly 14.7°-27.3°N and -17.1°-(-)4.8°E (negative
    // longitudes throughout).
    bbox: { minLat: 14.6, maxLat: 27.4, minLng: -17.2, maxLng: -4.7 },

    // Verified via Stage 1 PPLA/PPLC inspection. Mauritania has 15
    // regions (wilayas) post-2014 reform; GeoNames uses codes 01-15
    // PLUS a special-case empty admin1 for Nouakchott PPLC. Note that
    // codes 13-15 are the three sub-regions created when Nouakchott
    // was split into 3 wilayas in 2014 (Nouakchott-Ouest, -Nord, -Sud).
    admin1ToRegion: {
        '01': { ar: 'ولاية الحوض الشرقي',     en: 'Hodh Ech Chargui Region' },
        '02': { ar: 'ولاية الحوض الغربي',     en: 'Hodh El Gharbi Region' },
        '03': { ar: 'ولاية لعصابة',           en: 'Assaba Region' },
        '04': { ar: 'ولاية كوركول',           en: 'Gorgol Region' },
        '05': { ar: 'ولاية لبراكنة',          en: 'Brakna Region' },
        '06': { ar: 'ولاية الترارزة',         en: 'Trarza Region' },
        '07': { ar: 'ولاية أدرار',            en: 'Adrar Region' },
        '08': { ar: 'ولاية داخلت نواذيبو',    en: 'Dakhlet Nouadhibou Region' },
        '09': { ar: 'ولاية تكانت',            en: 'Tagant Region' },
        '10': { ar: 'ولاية كيدي ماغا',        en: 'Guidimaka Region' },
        '11': { ar: 'ولاية تيرس زمور',        en: 'Tiris Zemmour Region' },
        '12': { ar: 'ولاية إنشيري',           en: 'Inchiri Region' },
        '13': { ar: 'ولاية نواكشوط الغربية',  en: 'Nouakchott Ouest Region' },
        '14': { ar: 'ولاية نواكشوط الشمالية', en: 'Nouakchott Nord Region' },
        '15': { ar: 'ولاية نواكشوط الجنوبية', en: 'Nouakchott Sud Region' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
