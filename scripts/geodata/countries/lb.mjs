// scripts/geodata/countries/lb.mjs
// ─────────────────────────────────────────────────────────────────────────
// Lebanon — GeoNames country config
// CURATED-GEODATA-LEVANT-IRAQ-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'lb',
    countryAr:       'لبنان',
    countryEn:       'Lebanon',
    defaultTimezone: 'Asia/Beirut',

    geonamesUrl:  'https://download.geonames.org/export/dump/LB.zip',
    innerTxtName: 'LB.txt',

    // Lebanon: roughly 33.0°-34.7°N and 35.1°-36.7°E (small country)
    bbox: { minLat: 32.9, maxLat: 34.8, minLng: 35.0, maxLng: 36.8 },

    // Verified via Stage 1 PPLA/PPLC entries (Lebanon has 8 governorates):
    //   04=PPLC Beirut, 05=Mount Lebanon (Baabda), 06=South (Sidon),
    //   07=Nabatieh, 08=Bekaa (Zahle), 09=North (Tripoli),
    //   10=Akkar (Halba), 11=Baalbek-Hermel (Baalbek)
    admin1ToRegion: {
        '04': { ar: 'محافظة بيروت',              en: 'Beirut Governorate' },
        '05': { ar: 'محافظة جبل لبنان',         en: 'Mount Lebanon Governorate' },
        '06': { ar: 'محافظة الجنوب',             en: 'South Lebanon Governorate' },
        '07': { ar: 'محافظة النبطية',           en: 'Nabatieh Governorate' },
        '08': { ar: 'محافظة البقاع',             en: 'Bekaa Governorate' },
        '09': { ar: 'محافظة الشمال',             en: 'North Lebanon Governorate' },
        '10': { ar: 'محافظة عكار',                en: 'Akkar Governorate' },
        '11': { ar: 'محافظة بعلبك-الهرمل',       en: 'Baalbek-Hermel Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
