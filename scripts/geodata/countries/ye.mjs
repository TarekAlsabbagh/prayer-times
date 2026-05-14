// scripts/geodata/countries/ye.mjs
// ─────────────────────────────────────────────────────────────────────────
// Yemen — GeoNames country config
// CURATED-GEODATA-NILE-YEMEN-LIBYA-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ye',
    countryAr:       'اليمن',
    countryEn:       'Yemen',
    defaultTimezone: 'Asia/Aden',

    geonamesUrl:  'https://download.geonames.org/export/dump/YE.zip',
    innerTxtName: 'YE.txt',

    // Yemen: roughly 12.1°-19.0°N and 41.6°-54.7°E. Pad slightly
    // for the Socotra archipelago (eastern extreme) + Saudi border.
    bbox: { minLat: 12.0, maxLat: 19.1, minLng: 41.5, maxLng: 54.8 },

    // Verified via Stage 1 PPLA/PPLC entries (Yemen has 22 governorates
    // post-2013 Socotra split; GeoNames uses codes 01-28 with gaps at
    // 06/07/09/12/13/17 — these are unused / unassigned). Code 16 has
    // no PPLA but its top-pop entry (Sayyan, 69k) is in Sana'a
    // Governorate (the governorate that surrounds — but does NOT
    // include — Sana'a city, which is code 26). Code 28 (Socotra) was
    // split from Hadhramaut (code 04) in 2013:
    //   01=Abyan (Zinjibar), 02=Aden, 03=Al Mahrah (Al Ghayzah),
    //   04=Hadhramaut (Mukalla), 05=Shabwah (Ataq),
    //   08=Hodeidah (Al Hudaydah), 10=Al Mahwit,
    //   11=Dhamar, 14=Marib, 15=Sa'dah,
    //   16=Sana'a Governorate (Sayyan), 18=Ad Dali‘,
    //   19=Amran (‘Amran), 20=Al Bayda, 21=Al Jawf (Al Hazm),
    //   22=Hajjah, 23=Ibb, 24=Lahij, 25=Taiz,
    //   26=PPLC Sanaa (city), 27=Raymah (Al Jabin),
    //   28=Socotra (Hadibu)
    admin1ToRegion: {
        '01': { ar: 'محافظة أبين',             en: 'Abyan Governorate' },
        '02': { ar: 'محافظة عدن',              en: 'Aden Governorate' },
        '03': { ar: 'محافظة المهرة',           en: 'Al Mahrah Governorate' },
        '04': { ar: 'محافظة حضرموت',           en: 'Hadhramaut Governorate' },
        '05': { ar: 'محافظة شبوة',             en: 'Shabwah Governorate' },
        '08': { ar: 'محافظة الحديدة',          en: 'Hodeidah Governorate' },
        '10': { ar: 'محافظة المحويت',          en: 'Al Mahwit Governorate' },
        '11': { ar: 'محافظة ذمار',             en: 'Dhamar Governorate' },
        '14': { ar: 'محافظة مأرب',             en: 'Marib Governorate' },
        '15': { ar: 'محافظة صعدة',             en: 'Saada Governorate' },
        '16': { ar: 'محافظة صنعاء',            en: 'Sana\'a Governorate' },
        '18': { ar: 'محافظة الضالع',           en: 'Ad Dali Governorate' },
        '19': { ar: 'محافظة عمران',            en: 'Amran Governorate' },
        '20': { ar: 'محافظة البيضاء',          en: 'Al Bayda Governorate' },
        '21': { ar: 'محافظة الجوف',            en: 'Al Jawf Governorate' },
        '22': { ar: 'محافظة حجة',              en: 'Hajjah Governorate' },
        '23': { ar: 'محافظة إب',               en: 'Ibb Governorate' },
        '24': { ar: 'محافظة لحج',              en: 'Lahij Governorate' },
        '25': { ar: 'محافظة تعز',              en: 'Taiz Governorate' },
        '26': { ar: 'أمانة العاصمة',           en: 'Amanat Al Asimah (Sanaa City)' },
        '27': { ar: 'محافظة ريمة',             en: 'Raymah Governorate' },
        '28': { ar: 'محافظة سقطرى',            en: 'Socotra Governorate' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
