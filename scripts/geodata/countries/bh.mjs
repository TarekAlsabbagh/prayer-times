// scripts/geodata/countries/bh.mjs
// ─────────────────────────────────────────────────────────────────────────
// Bahrain — GeoNames country config
// CURATED-GEODATA-GCC-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'bh',
    countryAr:       'البحرين',
    countryEn:       'Bahrain',
    defaultTimezone: 'Asia/Bahrain',

    geonamesUrl:  'https://download.geonames.org/export/dump/BH.zip',
    innerTxtName: 'BH.txt',

    // Bahrain: roughly 25.5°-26.3°N and 50.3°-50.8°E (small archipelago)
    bbox: { minLat: 25.4, maxLat: 26.4, minLng: 50.2, maxLng: 50.9 },

    // Only one PPLC entry verified directly (16=Manama=Capital).
    // GeoNames uses a mix of legacy (pre-2014, 5-governorate) and current
    // (4-governorate, since 2014) codes. Best-guess mapping:
    //   16 → Capital (confirmed: PPLC Manama)
    //   15 → Muharraq (most northern entries)
    //   17 → Northern
    //   18 → Southern
    //   19 → Central (deprecated 2014; entries may need user review)
    //   02 / 05 / 10 / 13 → legacy codes (small entry counts)
    admin1ToRegion: {
        '15': { ar: 'محافظة المحرق',         en: 'Muharraq Governorate' },
        '16': { ar: 'محافظة العاصمة',        en: 'Capital Governorate' },
        '17': { ar: 'المحافظة الشمالية',     en: 'Northern Governorate' },
        '18': { ar: 'المحافظة الجنوبية',     en: 'Southern Governorate' },
        '19': { ar: 'المحافظة الوسطى',       en: 'Central Governorate (deprecated)' },
        // Legacy codes — present in older GeoNames data; user may verify
        '13': { ar: 'محافظة العاصمة',        en: 'Capital Governorate' },
        '02': { ar: 'محافظة (قديمة)',         en: 'Legacy code' },
        '05': { ar: 'محافظة (قديمة)',         en: 'Legacy code' },
        '10': { ar: 'محافظة (قديمة)',         en: 'Legacy code' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
