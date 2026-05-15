// scripts/geodata/countries/lu.mjs
// ─────────────────────────────────────────────────────────────────────────
// Luxembourg — GeoNames country config
// CURATED-GEODATA-EUROPE-1A
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'lu',
    countryAr:       'لوكسمبورغ',
    countryEn:       'Luxembourg',
    defaultTimezone: 'Europe/Luxembourg',

    geonamesUrl:  'https://download.geonames.org/export/dump/LU.zip',
    innerTxtName: 'LU.txt',

    // Luxembourg proper: tiny country ~2,586 km². 49.4°-50.2°N,
    // 5.7°-6.6°E.
    bbox: { minLat: 49.4, maxLat: 50.2, minLng: 5.7, maxLng: 6.6 },

    // Luxembourg admin1 in GeoNames uses 2-letter canton codes
    // (verified via Stage 1 PPLA inspection on 2026-05-15):
    //   LU = Luxembourg (canton, contains the capital)
    //   CA = Capellen      CL = Clervaux      DI = Diekirch
    //   EC = Echternach    ES = Esch-sur-Alzette
    //   GR = Grevenmacher  ME = Mersch        RD = Redange
    //   RM = Remich        VD = Vianden       WI = Wiltz
    //
    // Note: pre-2015 the country had 3 districts (Diekirch, Grevenmacher,
    // Luxembourg). After 2015 those were abolished; GeoNames now uses
    // the 12-canton breakdown.
    admin1ToRegion: {
        'LU': { ar: 'لوكسمبورغ',         en: 'Luxembourg' },
        'CA': { ar: 'كابلن',             en: 'Capellen' },
        'CL': { ar: 'كليرفو',            en: 'Clervaux' },
        'DI': { ar: 'ديكيرش',            en: 'Diekirch' },
        'EC': { ar: 'إخترناخ',           en: 'Echternach' },
        'ES': { ar: 'إيش-سور-ألزيت',     en: 'Esch-sur-Alzette' },
        'GR': { ar: 'غريفنماخر',         en: 'Grevenmacher' },
        'ME': { ar: 'ميرش',              en: 'Mersch' },
        'RD': { ar: 'ريدانج',            en: 'Redange' },
        'RM': { ar: 'ريمييخ',            en: 'Remich' },
        'VD': { ar: 'فيانيدن',           en: 'Vianden' },
        'WI': { ar: 'فيلتس',             en: 'Wiltz' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
