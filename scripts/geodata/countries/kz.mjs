// scripts/geodata/countries/kz.mjs — Kazakhstan — CURATED-GEODATA-ASIA-1H
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// KZ uses 2-digit "01"-"17" for 14 regions + 3 cities of republic significance
// + 4 anomalous long-numeric codes (12510143/12510144/12510145/1537272) for
// post-2018 city-status grants.
//   05 = Astana (PPLC, 345k — actually now 1.2M but GeoNames lags)
//   02 = Almaty Region (Almaty city 1.97M — already in curated)
//   1537272 = Shymkent (city of republic significance since 2018)
//   12510143 = Semey (city status 2024+)
//   12510144 = Taldykorgan
//   12510145 = Zhezqazghan
export default {
    cc:              'kz',
    countryAr:       'كازاخستان',
    countryEn:       'Kazakhstan',
    defaultTimezone: 'Asia/Almaty',

    geonamesUrl:  'https://download.geonames.org/export/dump/KZ.zip',
    innerTxtName: 'KZ.txt',

    bbox: { minLat: 40.5, maxLat: 55.4, minLng: 46.5, maxLng: 87.4 },

    admin1ToRegion: {
        '':         { ar: 'كازاخستان',                en: 'Kazakhstan' },
        '01':       { ar: 'منطقة ألما آتا',           en: 'Almaty Region' },          // Konayev
        '02':       { ar: 'ألما آتا',                 en: 'Almaty (city)' },          // city
        '03':       { ar: 'منطقة أقمولا',             en: 'Akmola' },                 // Kokshetau
        '04':       { ar: 'منطقة أكتوبه',             en: 'Aktobe' },
        '05':       { ar: 'أستانة',                   en: 'Astana' },                 // PPLC
        '06':       { ar: 'منطقة أتيراو',             en: 'Atyrau' },
        '07':       { ar: 'كازاخستان الغربية',        en: 'West Kazakhstan' },        // Oral
        '08':       { ar: 'منطقة قيزيلوردا',          en: 'Kyzylorda' },              // Baikonur (admin1=08?)
        '09':       { ar: 'منطقة منغستاو',            en: 'Mangystau' },              // Aktau
        '10':       { ar: 'منطقة تركستان',            en: 'Turkistan' },              // Turkestan
        '11':       { ar: 'منطقة بافلودار',           en: 'Pavlodar' },
        '12':       { ar: 'منطقة قاراغندي',           en: 'Karagandy' },              // Karagandy
        '13':       { ar: 'منطقة قوستاناي',           en: 'Kostanay' },
        '14':       { ar: 'منطقة قيزيلوردا',          en: 'Kyzylorda' },
        '15':       { ar: 'كازاخستان الشرقية',        en: 'East Kazakhstan' },        // Ust-Kamenogorsk
        '16':       { ar: 'كازاخستان الشمالية',       en: 'North Kazakhstan' },       // Petropavl
        '17':       { ar: 'منطقة جامبيل',             en: 'Zhambyl' },                // Taraz
        '12510143': { ar: 'منطقة سيمي',               en: 'Semey (Abai)' },
        '12510144': { ar: 'منطقة جيتيسو',             en: 'Jetisu (Taldykorgan)' },
        '12510145': { ar: 'منطقة جيزقازغان',          en: 'Ulytau (Zhezqazghan)' },
        '1537272':  { ar: 'شيمكنت',                   en: 'Shymkent (city)' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
