// scripts/geodata/countries/iq.mjs
// ─────────────────────────────────────────────────────────────────────────
// Iraq — GeoNames country config
// CURATED-GEODATA-LEVANT-IRAQ-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'iq',
    countryAr:       'العراق',
    countryEn:       'Iraq',
    defaultTimezone: 'Asia/Baghdad',

    geonamesUrl:  'https://download.geonames.org/export/dump/IQ.zip',
    innerTxtName: 'IQ.txt',

    // Iraq: roughly 29.0°-37.4°N and 38.8°-48.6°E
    bbox: { minLat: 28.9, maxLat: 37.5, minLng: 38.7, maxLng: 48.7 },

    // Verified via Stage 1 PPLA/PPLC entries (Iraq has 18 governorates):
    //   01=Anbar (Ramadi), 02=Basrah, 03=Muthanna (Samawah),
    //   04=Qadisiyyah (Diwaniyah), 05=Sulaymaniyah, 06=Babil (Hillah),
    //   07=PPLC Baghdad, 08=Dahuk, 09=Dhi Qar (Nasiriyah), 10=Diyala (Baqubah),
    //   11=Erbil, 12=Karbala, 13=Kirkuk, 14=Maysan (Amarah), 15=Ninawa (Mosul),
    //   16=Wasit (Al-Kut), 17=Najaf, 18=Salah ad Din (Tikrit)
    admin1ToRegion: {
        '01': { ar: 'محافظة الأنبار',          en: 'Al Anbar Governorate' },
        '02': { ar: 'محافظة البصرة',           en: 'Basrah Governorate' },
        '03': { ar: 'محافظة المثنى',           en: 'Al Muthanna Governorate' },
        '04': { ar: 'محافظة القادسية',          en: 'Al Qadisiyyah Governorate' },
        '05': { ar: 'محافظة السليمانية',        en: 'As Sulaymaniyah Governorate' },
        '06': { ar: 'محافظة بابل',              en: 'Babil Governorate' },
        '07': { ar: 'محافظة بغداد',             en: 'Baghdad Governorate' },
        '08': { ar: 'محافظة دهوك',              en: 'Dahuk Governorate' },
        '09': { ar: 'محافظة ذي قار',            en: 'Dhi Qar Governorate' },
        '10': { ar: 'محافظة ديالى',              en: 'Diyala Governorate' },
        '11': { ar: 'محافظة أربيل',              en: 'Erbil Governorate' },
        '12': { ar: 'محافظة كربلاء',            en: 'Karbala Governorate' },
        '13': { ar: 'محافظة كركوك',             en: 'Kirkuk Governorate' },
        '14': { ar: 'محافظة ميسان',             en: 'Maysan Governorate' },
        '15': { ar: 'محافظة نينوى',             en: 'Ninawa Governorate' },
        '16': { ar: 'محافظة واسط',              en: 'Wasit Governorate' },
        '17': { ar: 'محافظة النجف',             en: 'Najaf Governorate' },
        '18': { ar: 'محافظة صلاح الدين',         en: 'Salah ad Din Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
