// scripts/geodata/countries/sa.js
// ─────────────────────────────────────────────────────────────────────────
// Saudi Arabia — GeoNames country config
//
// Verified against actual PPLA/PPLC capitals in the SA dump (Stage 1 output).
// Source: https://download.geonames.org/export/dump/SA.zip
//
// admin1 codes are NOT standardized across countries — see
// memory/geodata_pipeline.md for the per-country verification protocol.
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'sa',
    countryAr:       'المملكة العربية السعودية',
    countryEn:       'Saudi Arabia',
    defaultTimezone: 'Asia/Riyadh',

    // GeoNames country dump
    geonamesUrl:  'https://download.geonames.org/export/dump/SA.zip',
    innerTxtName: 'SA.txt',

    // Bounding box for sanity-checking coordinates (rough country extent).
    bbox: { minLat: 16.0, maxLat: 33.0, minLng: 34.0, maxLng: 56.0 },

    // GeoNames admin1 codes → our region labels.
    // Verified against PPLA/PPLC capitals in SA.txt:
    //   02→Al Bahah (PPLA: Al Bahah), 05→Madinah (PPLA: Madinah),
    //   06→Eastern (PPLA: Dammam), 08→Qassim (PPLA: Buraydah),
    //   10→Riyadh (PPLC: Riyadh), 11→Asir (PPLA: Abha),
    //   13→Hail (PPLA: Ha'il), 14→Makkah (PPLA: Makkah),
    //   15→Northern Borders (PPLA: Arar), 16→Najran (PPLA: Najran),
    //   17→Jazan (PPLA: Jizan), 19→Tabuk (PPLA: Tabuk),
    //   20→Jouf (PPLA: Sakakah)
    admin1ToRegion: {
        '02': { ar: 'منطقة الباحة',            en: 'Al Bahah Region' },
        '05': { ar: 'منطقة المدينة المنورة',  en: 'Madinah Region' },
        '06': { ar: 'المنطقة الشرقية',         en: 'Eastern Province' },
        '08': { ar: 'منطقة القصيم',            en: 'Qassim Region' },
        '10': { ar: 'منطقة الرياض',            en: 'Riyadh Region' },
        '11': { ar: 'منطقة عسير',              en: 'Asir Region' },
        '13': { ar: 'منطقة حائل',              en: 'Hail Region' },
        '14': { ar: 'منطقة مكة المكرمة',       en: 'Makkah Region' },
        '15': { ar: 'منطقة الحدود الشمالية',  en: 'Northern Borders Region' },
        '16': { ar: 'منطقة نجران',             en: 'Najran Region' },
        '17': { ar: 'منطقة جازان',             en: 'Jazan Region' },
        '19': { ar: 'منطقة تبوك',              en: 'Tabuk Region' },
        '20': { ar: 'منطقة الجوف',             en: 'Al Jouf Region' }
    },

    // Optional per-country blocklist extensions (none needed for SA —
    // the cross-Arabic defaults in _geonames_common.mjs cover it).
    extraReligious: [],
    extraNonPlace:  []
};
