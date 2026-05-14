// scripts/geodata/countries/jo.mjs
// ─────────────────────────────────────────────────────────────────────────
// Jordan — GeoNames country config
// CURATED-GEODATA-LEVANT-IRAQ-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'jo',
    countryAr:       'الأردن',
    countryEn:       'Jordan',
    defaultTimezone: 'Asia/Amman',

    geonamesUrl:  'https://download.geonames.org/export/dump/JO.zip',
    innerTxtName: 'JO.txt',

    // Jordan: roughly 29.2°-33.4°N and 34.9°-39.3°E
    bbox: { minLat: 29.1, maxLat: 33.5, minLng: 34.8, maxLng: 39.4 },

    // Verified via Stage 1 PPLA/PPLC entries (Jordan has 12 governorates):
    //   02=Balqa (Salt), 09=Karak, 12=Tafilah, 15=Mafraq,
    //   16=PPLC Amman (Capital Governorate), 17=Zarqa, 18=Irbid,
    //   19=Ma'an, 20=Ajloun, 21=Aqaba, 22=Jerash, 23=Madaba
    admin1ToRegion: {
        '02': { ar: 'محافظة البلقاء',           en: 'Balqa Governorate' },
        '09': { ar: 'محافظة الكرك',              en: 'Karak Governorate' },
        '12': { ar: 'محافظة الطفيلة',           en: 'Tafilah Governorate' },
        '15': { ar: 'محافظة المفرق',             en: 'Mafraq Governorate' },
        '16': { ar: 'محافظة العاصمة',           en: 'Amman / Capital Governorate' },
        '17': { ar: 'محافظة الزرقاء',            en: 'Zarqa Governorate' },
        '18': { ar: 'محافظة إربد',               en: 'Irbid Governorate' },
        '19': { ar: 'محافظة معان',               en: "Ma'an Governorate" },
        '20': { ar: 'محافظة عجلون',              en: 'Ajloun Governorate' },
        '21': { ar: 'محافظة العقبة',             en: 'Aqaba Governorate' },
        '22': { ar: 'محافظة جرش',                en: 'Jerash Governorate' },
        '23': { ar: 'محافظة مادبا',              en: 'Madaba Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
