// scripts/geodata/countries/is.mjs
// ─────────────────────────────────────────────────────────────────────────
// Iceland — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'is',
    countryAr:       'آيسلندا',
    countryEn:       'Iceland',
    defaultTimezone: 'Atlantic/Reykjavik',

    geonamesUrl:  'https://download.geonames.org/export/dump/IS.zip',
    innerTxtName: 'IS.txt',

    bbox: { minLat: 63.2, maxLat: 66.7, minLng: -25.0, maxLng: -12.5 },

    // Iceland admin1 (verified via Stage 1 PPLA/PPLC inspection on
    // 2026-05-16). 8 regions, GeoNames uses 2-digit numeric codes 38-45:
    //   38 = East Region (Egilsstaðir)
    //   39 = Capital Region (Reykjavík PPLC)
    //   40 = Northeast Region (Akureyri)
    //   41 = Northwest Region (Sauðárkrókur)
    //   42 = South Region (Selfoss)
    //   43 = Southern Peninsula (Keflavík)
    //   44 = Westfjords (Ísafjörður)
    //   45 = West Region (Borgarnes)
    admin1ToRegion: {
        '38': { ar: 'الشرق',         en: 'East Region' },
        '39': { ar: 'منطقة العاصمة', en: 'Capital Region' },
        '40': { ar: 'الشمال الشرقي', en: 'Northeast Region' },
        '41': { ar: 'الشمال الغربي', en: 'Northwest Region' },
        '42': { ar: 'الجنوب',        en: 'South Region' },
        '43': { ar: 'سودرنيس',       en: 'Southern Peninsula' },
        '44': { ar: 'فيستفيوردير',   en: 'Westfjords' },
        '45': { ar: 'النصف الغربي',  en: 'West Region' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
