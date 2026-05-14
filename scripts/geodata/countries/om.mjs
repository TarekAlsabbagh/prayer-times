// scripts/geodata/countries/om.mjs
// ─────────────────────────────────────────────────────────────────────────
// Oman — GeoNames country config
// CURATED-GEODATA-GCC-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'om',
    countryAr:       'سلطنة عمان',
    countryEn:       'Oman',
    defaultTimezone: 'Asia/Muscat',

    geonamesUrl:  'https://download.geonames.org/export/dump/OM.zip',
    innerTxtName: 'OM.txt',

    // Oman: roughly 16.6°-26.5°N and 51.9°-59.8°E (large country)
    // Note: Musandam exclave is at ~26°N, separated by UAE territory.
    bbox: { minLat: 16.5, maxLat: 27.0, minLng: 51.8, maxLng: 60.0 },

    // Verified via Stage 1 PPLA/PPLC entries (post-2011 11-governorate
    // system; GeoNames uses mix of old + new codes):
    //   01=PPLA Nizwa  → Ad Dakhiliyah
    //   03=PPLA Hayma  → Al Wusta
    //   04=PPLA Sur    → Ash Sharqiyah South (pre-2011 was "Ash Sharqiyah")
    //   06=PPLC Muscat → Muscat
    //   07=PPLA Khasab → Musandam
    //   08=PPLA Salalah→ Dhofar
    //   10=PPLA Al Buraymi → Al Buraymi
    //   11=PPLA Sohar  → Al Batinah North (pre-2011 was "Al Batinah")
    //   12=PPLA Ibra   → Ash Sharqiyah North (pre-2011 was part of "Ash Sharqiyah")
    //   02 (412 rows) → best-guess Al Batinah South (pre-2011 was Al Batinah)
    //   09 (299 rows) → best-guess Az Zahirah (legacy, now mostly merged into Buraimi)
    admin1ToRegion: {
        '01': { ar: 'محافظة الداخلية',           en: 'Ad Dakhiliyah Governorate' },
        '02': { ar: 'محافظة شمال الباطنة (قديم)', en: 'Al Batinah (legacy)' },
        '03': { ar: 'محافظة الوسطى',              en: 'Al Wusta Governorate' },
        '04': { ar: 'محافظة جنوب الشرقية',        en: 'Ash Sharqiyah South Governorate' },
        '06': { ar: 'محافظة مسقط',                en: 'Muscat Governorate' },
        '07': { ar: 'محافظة مسندم',                en: 'Musandam Governorate' },
        '08': { ar: 'محافظة ظفار',                 en: 'Dhofar Governorate' },
        '09': { ar: 'محافظة الظاهرة (قديم)',       en: 'Az Zahirah (legacy)' },
        '10': { ar: 'محافظة البريمي',              en: 'Al Buraymi Governorate' },
        '11': { ar: 'محافظة شمال الباطنة',        en: 'Al Batinah North Governorate' },
        '12': { ar: 'محافظة شمال الشرقية',        en: 'Ash Sharqiyah North Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
