// scripts/geodata/countries/sy.mjs
// ─────────────────────────────────────────────────────────────────────────
// Syria — GeoNames country config
// CURATED-GEODATA-LEVANT-IRAQ-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'sy',
    countryAr:       'سوريا',
    countryEn:       'Syria',
    defaultTimezone: 'Asia/Damascus',

    geonamesUrl:  'https://download.geonames.org/export/dump/SY.zip',
    innerTxtName: 'SY.txt',

    // Syria: roughly 32.3°-37.3°N and 35.7°-42.4°E
    bbox: { minLat: 32.2, maxLat: 37.4, minLng: 35.6, maxLng: 42.5 },

    // Verified via Stage 1 PPLA/PPLC entries (Syria has 14 governorates):
    //   01=PPLA Al Hasakah, 02=PPLA Latakia, 03=PPLA Al Qunaytirah,
    //   04=PPLA Ar Raqqah, 05=PPLA As-Suwayda, 06=PPLA Daraa,
    //   07=PPLA Deir ez-Zor, 08=PPLA2 Damascus suburbs (Rif Dimashq),
    //   09=PPLA Aleppo, 10=PPLA Hama, 11=PPLA Homs, 12=PPLA Idlib,
    //   13=PPLC Damascus, 14=PPLA Tartus
    admin1ToRegion: {
        '01': { ar: 'محافظة الحسكة',           en: 'Al-Hasakah Governorate' },
        '02': { ar: 'محافظة اللاذقية',          en: 'Latakia Governorate' },
        '03': { ar: 'محافظة القنيطرة',          en: 'Quneitra Governorate' },
        '04': { ar: 'محافظة الرقة',             en: 'Raqqa Governorate' },
        '05': { ar: 'محافظة السويداء',          en: 'As-Suwayda Governorate' },
        '06': { ar: 'محافظة درعا',              en: 'Daraa Governorate' },
        '07': { ar: 'محافظة دير الزور',         en: 'Deir ez-Zor Governorate' },
        '08': { ar: 'محافظة ريف دمشق',         en: 'Rif Dimashq Governorate' },
        '09': { ar: 'محافظة حلب',                en: 'Aleppo Governorate' },
        '10': { ar: 'محافظة حماة',              en: 'Hama Governorate' },
        '11': { ar: 'محافظة حمص',               en: 'Homs Governorate' },
        '12': { ar: 'محافظة إدلب',              en: 'Idlib Governorate' },
        '13': { ar: 'محافظة دمشق',              en: 'Damascus Governorate' },
        '14': { ar: 'محافظة طرطوس',             en: 'Tartus Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
