// scripts/geodata/countries/uz.mjs — Uzbekistan — CURATED-GEODATA-ASIA-1H
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// UZ uses 2-digit "01"-"16" (skipping 04, 11) for 14 regions + Tashkent PPLC.
//   13 = Tashkent city (PPLC, 1.98M — already in curated)
//   01 = Andijan Region (Andijon 748k)
//   06 = Namangan Region (Namangan 713k)
//   10 = Samarqand Region (already curated Samarkand 595k)
//   09 = Karakalpakstan (Nukus 333k)
//   03 = Fergana (299k)
export default {
    cc:              'uz',
    countryAr:       'أوزبكستان',
    countryEn:       'Uzbekistan',
    defaultTimezone: 'Asia/Tashkent',

    geonamesUrl:  'https://download.geonames.org/export/dump/UZ.zip',
    innerTxtName: 'UZ.txt',

    bbox: { minLat: 37.0, maxLat: 45.7, minLng: 55.9, maxLng: 73.2 },

    admin1ToRegion: {
        '':   { ar: 'أوزبكستان',             en: 'Uzbekistan' },
        '01': { ar: 'منطقة أنديجان',         en: 'Andijon Region' },
        '02': { ar: 'منطقة بخارى',           en: 'Bukhara Region' },
        '03': { ar: 'منطقة فرغانة',          en: 'Fergana Region' },
        '05': { ar: 'منطقة خوارزم',          en: 'Khorezm Region' },           // Urganch
        '06': { ar: 'منطقة نمنغان',          en: 'Namangan Region' },
        '07': { ar: 'منطقة نوائي',           en: 'Navoiy Region' },
        '08': { ar: 'منطقة قشقاديريا',       en: 'Qashqadaryo' },              // Qarshi
        '09': { ar: 'قرقالباغستان',          en: 'Karakalpakstan' },           // Nukus
        '10': { ar: 'منطقة سمرقند',          en: 'Samarqand Region' },
        '12': { ar: 'منطقة صرخندريا',        en: 'Surxondaryo' },              // Tirmiz
        '13': { ar: 'طشقند',                 en: 'Tashkent (city)' },          // PPLC
        '14': { ar: 'منطقة طشقند',           en: 'Tashkent Region' },          // (Amir Timur pop=0)
        '15': { ar: 'منطقة جيزاخ',           en: 'Jizzax Region' },
        '16': { ar: 'منطقة سيرداريا',        en: 'Sirdaryo Region' }           // Guliston
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
