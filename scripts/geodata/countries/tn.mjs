// scripts/geodata/countries/tn.mjs
// ─────────────────────────────────────────────────────────────────────────
// Tunisia — GeoNames country config
// CURATED-GEODATA-MAGHREB-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'tn',
    countryAr:       'تونس',
    countryEn:       'Tunisia',
    defaultTimezone: 'Africa/Tunis',

    geonamesUrl:  'https://download.geonames.org/export/dump/TN.zip',
    innerTxtName: 'TN.txt',

    // Tunisia: roughly 30°-37.5°N and 7.5°-11.6°E. Small Maghreb
    // country, well-covered by GeoNames.
    bbox: { minLat: 29.9, maxLat: 37.6, minLng: 7.4, maxLng: 11.7 },

    // Verified via Stage 1 PPLA/PPLC inspection. Tunisia has 24
    // governorates; GeoNames uses non-contiguous codes 02-39 with gaps
    // (legacy from old governorate splits).
    admin1ToRegion: {
        '02': { ar: 'ولاية القصرين',          en: 'Kasserine Governorate' },
        '03': { ar: 'ولاية القيروان',         en: 'Kairouan Governorate' },
        '06': { ar: 'ولاية جندوبة',           en: 'Jendouba Governorate' },
        '14': { ar: 'ولاية الكاف',            en: 'Kef Governorate' },
        '15': { ar: 'ولاية المهدية',          en: 'Mahdia Governorate' },
        '16': { ar: 'ولاية المنستير',         en: 'Monastir Governorate' },
        '17': { ar: 'ولاية باجة',             en: 'Béja Governorate' },
        '18': { ar: 'ولاية بنزرت',            en: 'Bizerte Governorate' },
        '19': { ar: 'ولاية نابل',             en: 'Nabeul Governorate' },
        '22': { ar: 'ولاية سليانة',           en: 'Siliana Governorate' },
        '23': { ar: 'ولاية سوسة',             en: 'Sousse Governorate' },
        '27': { ar: 'ولاية بن عروس',          en: 'Ben Arous Governorate' },
        '28': { ar: 'ولاية مدنين',            en: 'Medenine Governorate' },
        '29': { ar: 'ولاية قابس',             en: 'Gabès Governorate' },
        '30': { ar: 'ولاية قفصة',             en: 'Gafsa Governorate' },
        '31': { ar: 'ولاية قبلي',             en: 'Kebili Governorate' },
        '32': { ar: 'ولاية صفاقس',            en: 'Sfax Governorate' },
        '33': { ar: 'ولاية سيدي بوزيد',       en: 'Sidi Bouzid Governorate' },
        '34': { ar: 'ولاية تطاوين',           en: 'Tataouine Governorate' },
        '35': { ar: 'ولاية توزر',             en: 'Tozeur Governorate' },
        '36': { ar: 'ولاية تونس',             en: 'Tunis Governorate' },
        '37': { ar: 'ولاية زغوان',            en: 'Zaghouan Governorate' },
        '38': { ar: 'ولاية أريانة',           en: 'Ariana Governorate' },
        '39': { ar: 'ولاية منوبة',            en: 'Manouba Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
