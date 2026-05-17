// scripts/geodata/countries/hk.mjs — Hong Kong — CURATED-GEODATA-ASIA-1C
// admin1 verified via Stage 1 PPLA/PPLC inspection (2026-05-17).
// HK uses MIXED format: empty admin1 for the PPLC entry "Hong Kong" itself,
// + 3-letter codes (NTM/NST/KSS/KWT/NTW/NTP/NYL/HWC/KYT/NSK/KKT/HCW) for the
// 18 districts represented as PPLA. Pattern similar to ID (PD/PS/PT/PE for
// Papua), PE (LMA for Lima), PH (NCR for Manila).
export default {
    cc:              'hk',
    countryAr:       'هونغ كونغ',
    countryEn:       'Hong Kong',
    defaultTimezone: 'Asia/Hong_Kong',

    geonamesUrl:  'https://download.geonames.org/export/dump/HK.zip',
    innerTxtName: 'HK.txt',

    bbox: { minLat: 22.1, maxLat: 22.6, minLng: 113.8, maxLng: 114.5 },

    admin1ToRegion: {
        '': { ar: 'هونغ كونغ',              en: 'Hong Kong' },             // empty (PPLC)
        // 3-letter district codes (NT=New Territories, K=Kowloon, H=Hong Kong Island)
        'NTM': { ar: 'تويين مون',           en: 'Tuen Mun (NT)' },
        'NST': { ar: 'شا تين',              en: 'Sha Tin (NT)' },
        'KSS': { ar: 'شام شوي بو',          en: 'Sham Shui Po (Kowloon)' },
        'KWT': { ar: 'وونغ تاي سين',        en: 'Wong Tai Sin (Kowloon)' },
        'NTW': { ar: 'تسوين وان',           en: 'Tsuen Wan (NT)' },
        'NTP': { ar: 'تاي بو',              en: 'Tai Po (NT)' },
        'NYL': { ar: 'يوين لونغ',           en: 'Yuen Long (NT)' },
        'HWC': { ar: 'وان تشاي',            en: 'Wan Chai (HK Island)' },
        'KYT': { ar: 'مونغ كوك',            en: 'Mong Kok (Kowloon)' },
        'NSK': { ar: 'ساي كونغ',            en: 'Sai Kung (NT)' },
        'KKT': { ar: 'كوون تونغ',           en: 'Kwun Tong (Kowloon)' },
        'HCW': { ar: 'سنترال',              en: 'Central (HK Island)' }
    },

    popMin: 200000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
