// scripts/geodata/countries/ge.mjs — Georgia — CURATED-GEODATA-ASIA-1I
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// GE uses 2-digit "02"/"04"/"51"/"65"-"73" for 9 regions + 2 autonomous
// republics + Tbilisi city.
//   51 = Tbilisi (PPLC, 1.05M — already in curated)
//   04 = Adjara AR (Batumi 187k)
//   66 = Imereti (Kutaisi 135k)
//   68 = Kvemo Kartli (Rustavi 128k)
//   02 = Abkhazia AR (Sokhumi 65k — politically contested but in GeoNames)
export default {
    cc:              'ge',
    countryAr:       'جورجيا',
    countryEn:       'Georgia',
    defaultTimezone: 'Asia/Tbilisi',

    geonamesUrl:  'https://download.geonames.org/export/dump/GE.zip',
    innerTxtName: 'GE.txt',

    bbox: { minLat: 41.0, maxLat: 43.6, minLng: 40.0, maxLng: 46.8 },

    admin1ToRegion: {
        '':   { ar: 'جورجيا',                 en: 'Georgia' },
        '02': { ar: 'أبخازيا',               en: 'Abkhazia AR' },             // Sokhumi
        '04': { ar: 'أجاريا',                 en: 'Adjara AR' },              // Batumi
        '51': { ar: 'تبليسي',                 en: 'Tbilisi' },                // PPLC
        '65': { ar: 'غوريا',                  en: 'Guria' },                  // Ozurgeti
        '66': { ar: 'إيميريتيا',              en: 'Imereti' },                // Kutaisi
        '67': { ar: 'كاخيتيا',                en: 'Kakheti' },                // Telavi
        '68': { ar: 'كفيمو كارتلي',           en: 'Kvemo Kartli' },           // Rustavi
        '69': { ar: 'موتسخيتا-منيانيتي',      en: 'Mtskheta-Mtianeti' },      // Mtskheta
        '70': { ar: 'راتشا-ليتشخومي',         en: 'Racha-Lechkhumi' },        // Ambrolauri
        '71': { ar: 'سامغريلو-زيمو سفانيتي',  en: 'Samegrelo-Zemo Svaneti' }, // Zugdidi
        '72': { ar: 'سامتسخي-جافاخيتي',       en: 'Samtskhe-Javakheti' },     // Akhaltsikhe
        '73': { ar: 'شيدا كارتلي',            en: 'Shida Kartli' }            // Gori
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
