// scripts/geodata/countries/eg.mjs
// ─────────────────────────────────────────────────────────────────────────
// Egypt — GeoNames country config
// CURATED-GEODATA-NILE-YEMEN-LIBYA-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'eg',
    countryAr:       'مصر',
    countryEn:       'Egypt',
    defaultTimezone: 'Africa/Cairo',

    geonamesUrl:  'https://download.geonames.org/export/dump/EG.zip',
    innerTxtName: 'EG.txt',

    // Egypt: roughly 22.0°-31.7°N and 24.7°-37.0°E. Pad slightly
    // (per the established pipeline convention) to absorb GeoNames
    // entries that sit fractionally past the official border.
    bbox: { minLat: 21.9, maxLat: 31.8, minLng: 24.6, maxLng: 37.1 },

    // Verified via Stage 1 PPLA/PPLC entries (Egypt has 27 governorates;
    // GeoNames uses codes 01-28 with a gap at 25 — the 1991 South Sinai
    // split that left the old "Sinai" slot empty, plus Luxor split out
    // from Qena as code 28 in 2009):
    //   01=Dakahlia (Mansurah), 02=Red Sea (Hurghada),
    //   03=Beheira (Damanhur), 04=Fayyum, 05=Gharbia (Tanta),
    //   06=Alexandria, 07=Ismailia, 08=Giza,
    //   09=Monufia (Shebin El-Kom), 10=Minya,
    //   11=PPLC Cairo, 12=Qalyubia (Banha),
    //   13=New Valley (Al-Kharga), 14=Sharqia (Zagazig),
    //   15=Suez, 16=Aswan, 17=Assiut, 18=Beni Suef,
    //   19=Port Said, 20=Damietta, 21=Kafr El Sheikh,
    //   22=Matruh (Marsa Matruh), 23=Qena, 24=Sohag,
    //   26=South Sinai (El-Tor), 27=North Sinai (Arish),
    //   28=Luxor.
    admin1ToRegion: {
        '01': { ar: 'محافظة الدقهلية',         en: 'Dakahlia Governorate' },
        '02': { ar: 'محافظة البحر الأحمر',     en: 'Red Sea Governorate' },
        '03': { ar: 'محافظة البحيرة',          en: 'Beheira Governorate' },
        '04': { ar: 'محافظة الفيوم',           en: 'Faiyum Governorate' },
        '05': { ar: 'محافظة الغربية',          en: 'Gharbia Governorate' },
        '06': { ar: 'محافظة الإسكندرية',       en: 'Alexandria Governorate' },
        '07': { ar: 'محافظة الإسماعيلية',      en: 'Ismailia Governorate' },
        '08': { ar: 'محافظة الجيزة',           en: 'Giza Governorate' },
        '09': { ar: 'محافظة المنوفية',         en: 'Monufia Governorate' },
        '10': { ar: 'محافظة المنيا',           en: 'Minya Governorate' },
        '11': { ar: 'محافظة القاهرة',          en: 'Cairo Governorate' },
        '12': { ar: 'محافظة القليوبية',        en: 'Qalyubia Governorate' },
        '13': { ar: 'محافظة الوادي الجديد',    en: 'New Valley Governorate' },
        '14': { ar: 'محافظة الشرقية',          en: 'Sharqia Governorate' },
        '15': { ar: 'محافظة السويس',           en: 'Suez Governorate' },
        '16': { ar: 'محافظة أسوان',            en: 'Aswan Governorate' },
        '17': { ar: 'محافظة أسيوط',            en: 'Asyut Governorate' },
        '18': { ar: 'محافظة بني سويف',          en: 'Beni Suef Governorate' },
        '19': { ar: 'محافظة بورسعيد',          en: 'Port Said Governorate' },
        '20': { ar: 'محافظة دمياط',            en: 'Damietta Governorate' },
        '21': { ar: 'محافظة كفر الشيخ',        en: 'Kafr El Sheikh Governorate' },
        '22': { ar: 'محافظة مطروح',            en: 'Matruh Governorate' },
        '23': { ar: 'محافظة قنا',              en: 'Qena Governorate' },
        '24': { ar: 'محافظة سوهاج',            en: 'Sohag Governorate' },
        '26': { ar: 'محافظة جنوب سيناء',       en: 'South Sinai Governorate' },
        '27': { ar: 'محافظة شمال سيناء',       en: 'North Sinai Governorate' },
        '28': { ar: 'محافظة الأقصر',           en: 'Luxor Governorate' }
    },

    // Egypt has dense religious/mosque coverage in GeoNames (Cairo
    // alone has hundreds of mosque points). The shared
    // RELIGIOUS_KEYWORDS array in _geonames_common.mjs already
    // catches the common Arabic substrings (جامع/مسجد/مزار/مقام/زاوية/
    // كنيسة/دير/معبد/قبر/ضريح/مشهد/مقبرة/مقابر/مزرعة/مزارع/طريق/شارع/
    // ميدان/جسر) plus the matching English forms — no per-country
    // extras needed.
    extraReligious: [],
    extraNonPlace:  []
};
