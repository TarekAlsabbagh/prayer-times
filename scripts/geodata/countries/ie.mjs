// scripts/geodata/countries/ie.mjs
// ─────────────────────────────────────────────────────────────────────────
// Ireland — GeoNames country config
// CURATED-GEODATA-EUROPE-1A
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ie',
    countryAr:       'أيرلندا',
    countryEn:       'Ireland',
    defaultTimezone: 'Europe/Dublin',

    geonamesUrl:  'https://download.geonames.org/export/dump/IE.zip',
    innerTxtName: 'IE.txt',

    // Republic of Ireland proper: 51.4°-55.5°N and -10.7°--5.4°E.
    // Excludes Northern Ireland (which is GB territory).
    bbox: { minLat: 51.3, maxLat: 55.5, minLng: -10.8, maxLng: -5.3 },

    // Ireland admin1 in GeoNames uses single-letter province codes
    // (verified via Stage 1 PPLA inspection on 2026-05-15):
    //   C = Connacht (West)
    //   L = Leinster (East, incl. Dublin)
    //   M = Munster (South)
    //   U = Ulster — the 3 IE counties (Cavan, Donegal, Monaghan).
    //               The other 6 Ulster counties are in GB (Northern
    //               Ireland) and use a separate dump.
    //
    // County-level breakdown lives in admin2_code (numeric) which we
    // currently don't surface in the report — Ireland is small enough
    // that province-level region suffices for prayer-time pages.
    admin1ToRegion: {
        'C': { ar: 'كونوت',     en: 'Connacht' },
        'L': { ar: 'لينستر',    en: 'Leinster' },
        'M': { ar: 'مونستر',    en: 'Munster' },
        'U': { ar: 'أولستر',    en: 'Ulster' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
