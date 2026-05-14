// scripts/geodata/countries/ly.mjs
// ─────────────────────────────────────────────────────────────────────────
// Libya — GeoNames country config
// CURATED-GEODATA-NILE-YEMEN-LIBYA-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ly',
    countryAr:       'ليبيا',
    countryEn:       'Libya',
    defaultTimezone: 'Africa/Tripoli',

    geonamesUrl:  'https://download.geonames.org/export/dump/LY.zip',
    innerTxtName: 'LY.txt',

    // Libya: roughly 19.5°-33.2°N and 9.4°-25.2°E. Pad slightly
    // for the Algerian + Egyptian border crossings.
    bbox: { minLat: 19.4, maxLat: 33.3, minLng: 9.3, maxLng: 25.3 },

    // Verified via Stage 1 PPLA/PPLC entries (Libya has 22 districts /
    // baladiyat / شعبيات since the 2007 reorganization; GeoNames uses
    // codes 63-84 with code 65 (Kufra) having no PPLA but matching the
    // top-pop entry At Tāj which is in the Kufra district):
    //   63=Al Jabal al Akhdar (Al Bayda), 64=Jufra (Hun), 65=Kufra (At Tāj),
    //   66=Marj, 67=Nuqat al Khams (Zuwarah),
    //   68=Zawiya (Az Zawiyah), 69=Benghazi, 70=Derna,
    //   71=Ghat, 72=Misrata, 73=Murzuq, 74=Nalut,
    //   75=Sabha, 76=Sirte, 77=PPLC Tripoli,
    //   78=Wadi al Shati (Idri), 79=Butnan (Tobruk),
    //   80=Jabal al Gharbi (Gharyan), 81=Jafara (Al ‘Aziziyah),
    //   82=Murqub (Al Khums), 83=Al Wahat (Ajdabiya),
    //   84=Wadi al Hayaa (Ubari)
    admin1ToRegion: {
        '63': { ar: 'الجبل الأخضر',           en: 'Al Jabal al Akhdar District' },
        '64': { ar: 'الجفرة',                 en: 'Al Jufrah District' },
        '65': { ar: 'الكفرة',                 en: 'Al Kufrah District' },
        '66': { ar: 'المرج',                  en: 'Al Marj District' },
        '67': { ar: 'النقاط الخمس',           en: 'An Nuqat al Khams District' },
        '68': { ar: 'الزاوية',                en: 'Az Zawiyah District' },
        '69': { ar: 'بنغازي',                 en: 'Benghazi District' },
        '70': { ar: 'درنة',                   en: 'Derna District' },
        '71': { ar: 'غات',                    en: 'Ghat District' },
        '72': { ar: 'مصراتة',                 en: 'Misrata District' },
        '73': { ar: 'مرزق',                   en: 'Murzuq District' },
        '74': { ar: 'نالوت',                  en: 'Nalut District' },
        '75': { ar: 'سبها',                   en: 'Sabha District' },
        '76': { ar: 'سرت',                    en: 'Sirte District' },
        '77': { ar: 'طرابلس',                 en: 'Tripoli District' },
        '78': { ar: 'وادي الشاطئ',            en: 'Wadi al Shatii District' },
        '79': { ar: 'البطنان',                en: 'Butnan District' },
        '80': { ar: 'الجبل الغربي',           en: 'Jabal al Gharbi District' },
        '81': { ar: 'الجفارة',                en: 'Jafara District' },
        '82': { ar: 'المرقب',                 en: 'Murqub District' },
        '83': { ar: 'الواحات',                en: 'Al Wahat District' },
        '84': { ar: 'وادي الحياة',            en: 'Wadi al Hayaa District' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
