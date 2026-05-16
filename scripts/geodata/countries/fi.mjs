// scripts/geodata/countries/fi.mjs
// ─────────────────────────────────────────────────────────────────────────
// Finland — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'fi',
    countryAr:       'فنلندا',
    countryEn:       'Finland',
    defaultTimezone: 'Europe/Helsinki',

    geonamesUrl:  'https://download.geonames.org/export/dump/FI.zip',
    innerTxtName: 'FI.txt',

    bbox: { minLat: 59.7, maxLat: 70.2, minLng: 19.0, maxLng: 31.8 },

    // Finland admin1 (verified via Stage 1 PPLA/PPLC inspection on
    // 2026-05-16). 19 regions (maakunnat):
    //   01 = Uusimaa (Helsinki PPLC)         02 = Southwest Finland (Turku)
    //   04 = Satakunta (Pori)                05 = Kanta-Häme (Hämeenlinna)
    //   06 = Pirkanmaa (Tampere)             07 = Päijät-Häme (Lahti)
    //   08 = Kymenlaakso (Kouvola)           09 = South Karelia (Lappeenranta)
    //   10 = South Savo (Mikkeli)            11 = North Savo (Kuopio)
    //   12 = North Karelia (Joensuu)         13 = Central Finland (Jyväskylä)
    //   14 = South Ostrobothnia (Seinäjoki)  15 = Ostrobothnia (Vaasa)
    //   16 = Central Ostrobothnia (Kokkola)  17 = North Ostrobothnia (Oulu)
    //   18 = Kainuu (Kajaani)                19 = Lapland (Rovaniemi)
    admin1ToRegion: {
        '01': { ar: 'أوسيما',                 en: 'Uusimaa' },
        '02': { ar: 'فنلندا الجنوبية الغربية', en: 'Southwest Finland' },
        '04': { ar: 'ساتاكونتا',              en: 'Satakunta' },
        '05': { ar: 'كانتا-هامي',             en: 'Kanta-Häme' },
        '06': { ar: 'بيركانماا',              en: 'Pirkanmaa' },
        '07': { ar: 'باياتها-هامي',           en: 'Päijät-Häme' },
        '08': { ar: 'كيمي',                   en: 'Kymenlaakso' },
        '09': { ar: 'جنوب كاريليا',           en: 'South Karelia' },
        '10': { ar: 'جنوب سافو',              en: 'South Savo' },
        '11': { ar: 'شمال سافو',              en: 'North Savo' },
        '12': { ar: 'شمال كاريليا',           en: 'North Karelia' },
        '13': { ar: 'فنلندا الوسطى',          en: 'Central Finland' },
        '14': { ar: 'جنوب أوستروبوثنيا',      en: 'South Ostrobothnia' },
        '15': { ar: 'أوستروبوثنيا',           en: 'Ostrobothnia' },
        '16': { ar: 'أوستروبوثنيا الوسطى',    en: 'Central Ostrobothnia' },
        '17': { ar: 'أوستروبوثنيا الشمالية',  en: 'North Ostrobothnia' },
        '18': { ar: 'كاينو',                  en: 'Kainuu' },
        '19': { ar: 'لابلاند',                en: 'Lapland' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
