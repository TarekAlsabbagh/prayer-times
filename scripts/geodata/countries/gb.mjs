// scripts/geodata/countries/gb.mjs
// ─────────────────────────────────────────────────────────────────────────
// United Kingdom — GeoNames country config
// CURATED-GEODATA-EUROPE-1A
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'gb',
    countryAr:       'المملكة المتحدة',
    countryEn:       'United Kingdom',
    defaultTimezone: 'Europe/London',

    geonamesUrl:  'https://download.geonames.org/export/dump/GB.zip',
    innerTxtName: 'GB.txt',

    // UK proper: Great Britain (England + Scotland + Wales) + Northern
    // Ireland. Roughly 49.5°-61°N and -8.7°-1.8°E. Includes Hebrides
    // (Outer Hebrides ~-7.7°), Shetland (~60.8°N), and Channel Islands
    // edge (Jersey/Guernsey are CROWN dependencies and may appear under
    // separate GeoNames codes JE/GG; bbox absorbs both if included).
    bbox: { minLat: 49.5, maxLat: 61.0, minLng: -8.7, maxLng: 1.8 },

    // GB admin1 in GeoNames uses 3-letter ISO 3166-2 region codes for the
    // four constituent countries, OR 2-letter county codes for England.
    // Initial map covers the four constituent countries; we'll refine
    // after Stage 1 inspection if county-level codes appear.
    admin1ToRegion: {
        'ENG': { ar: 'إنجلترا',           en: 'England' },
        'SCT': { ar: 'اسكتلندا',          en: 'Scotland' },
        'WLS': { ar: 'ويلز',              en: 'Wales' },
        'NIR': { ar: 'أيرلندا الشمالية',  en: 'Northern Ireland' }
    },

    // Europe-1A Strategy E: high-tier eligibility requires either a real
    // population threshold OR an always-include feature code.
    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
