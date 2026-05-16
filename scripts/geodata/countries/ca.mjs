// scripts/geodata/countries/ca.mjs — Canada — CURATED-GEODATA-AMERICAS-1A
// admin1 codes verified via Stage 1 PPLA inspection (2026-05-16):
// GeoNames uses 2-digit numeric, NOT 2-letter ISO codes.
export default {
    cc:              'ca',
    countryAr:       'كندا',
    countryEn:       'Canada',
    defaultTimezone: 'America/Toronto',

    geonamesUrl:  'https://download.geonames.org/export/dump/CA.zip',
    innerTxtName: 'CA.txt',

    bbox: { minLat: 41.5, maxLat: 83.5, minLng: -141.5, maxLng: -52.0 },

    admin1ToRegion: {
        '01': { ar: 'ألبرتا',                  en: 'Alberta' },         // Edmonton
        '02': { ar: 'كولومبيا البريطانية',     en: 'British Columbia' },// Victoria
        '03': { ar: 'مانيتوبا',                en: 'Manitoba' },        // Winnipeg
        '04': { ar: 'نيو برونزويك',            en: 'New Brunswick' },   // Fredericton
        '05': { ar: 'نيوفاوندلاند ولابرادور',  en: 'Newfoundland and Labrador' }, // St. John's
        '07': { ar: 'نوفا سكوشا',              en: 'Nova Scotia' },     // Halifax
        '08': { ar: 'أونتاريو',                en: 'Ontario' },         // Ottawa, Toronto
        '09': { ar: 'جزيرة الأمير إدوارد',     en: 'Prince Edward Island' }, // Charlottetown
        '10': { ar: 'كيبيك',                   en: 'Quebec' },          // Québec
        '11': { ar: 'ساسكاتشوان',              en: 'Saskatchewan' },    // Regina
        '12': { ar: 'يوكون',                   en: 'Yukon' },           // Whitehorse
        '13': { ar: 'الأقاليم الشمالية الغربية', en: 'Northwest Territories' }, // Yellowknife
        '14': { ar: 'نونافوت',                 en: 'Nunavut' }          // Iqaluit
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
