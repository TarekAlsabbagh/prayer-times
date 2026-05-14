// scripts/geodata/countries/kw.mjs
// ─────────────────────────────────────────────────────────────────────────
// Kuwait — GeoNames country config
// CURATED-GEODATA-GCC-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'kw',
    countryAr:       'الكويت',
    countryEn:       'Kuwait',
    defaultTimezone: 'Asia/Kuwait',

    geonamesUrl:  'https://download.geonames.org/export/dump/KW.zip',
    innerTxtName: 'KW.txt',

    // Kuwait: roughly 28.5°-30.1°N and 46.5°-48.5°E
    bbox: { minLat: 28.4, maxLat: 30.2, minLng: 46.4, maxLng: 48.6 },

    // Verified via Stage 1 PPLA/PPLC entries:
    //   02=PPLC Kuwait City (= Al Asimah / Capital Governorate),
    //   04=PPLA Al Ahmadi, 05=PPLA Al Jahra, 07=PPLA Al Farwaniyah,
    //   08=PPLA Hawalli, 09=PPLA Mubarak al Kabir
    admin1ToRegion: {
        '02': { ar: 'محافظة العاصمة',       en: 'Al Asimah Governorate' },
        '04': { ar: 'محافظة الأحمدي',       en: 'Al Ahmadi Governorate' },
        '05': { ar: 'محافظة الجهراء',        en: 'Al Jahra Governorate' },
        '07': { ar: 'محافظة الفروانية',     en: 'Al Farwaniyah Governorate' },
        '08': { ar: 'محافظة حولي',          en: 'Hawalli Governorate' },
        '09': { ar: 'محافظة مبارك الكبير',  en: 'Mubarak Al-Kabeer Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
