// scripts/geodata/countries/ae.mjs
// ─────────────────────────────────────────────────────────────────────────
// United Arab Emirates — GeoNames country config
// CURATED-GEODATA-GCC-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ae',
    countryAr:       'الإمارات العربية المتحدة',
    countryEn:       'United Arab Emirates',
    defaultTimezone: 'Asia/Dubai',

    geonamesUrl:  'https://download.geonames.org/export/dump/AE.zip',
    innerTxtName: 'AE.txt',

    // UAE: roughly 22.6°-26.1°N and 51.5°-56.4°E
    bbox: { minLat: 22.5, maxLat: 26.2, minLng: 51.4, maxLng: 56.5 },

    // Verified via Stage 1 PPLA/PPLC entries:
    //   01=PPLC Abu Dhabi, 02=PPLA Ajman, 03=PPLA Dubai, 04=PPLA Fujairah,
    //   05=PPLA Ras Al Khaimah, 06=PPLA Sharjah, 07=PPLA Umm Al Quwain
    admin1ToRegion: {
        '01': { ar: 'إمارة أبوظبي',         en: 'Abu Dhabi Emirate' },
        '02': { ar: 'إمارة عجمان',          en: 'Ajman Emirate' },
        '03': { ar: 'إمارة دبي',             en: 'Dubai Emirate' },
        '04': { ar: 'إمارة الفجيرة',        en: 'Fujairah Emirate' },
        '05': { ar: 'إمارة رأس الخيمة',     en: 'Ras Al Khaimah Emirate' },
        '06': { ar: 'إمارة الشارقة',         en: 'Sharjah Emirate' },
        '07': { ar: 'إمارة أم القيوين',     en: 'Umm Al Quwain Emirate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
