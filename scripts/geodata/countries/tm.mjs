// scripts/geodata/countries/tm.mjs — Turkmenistan — CURATED-GEODATA-ASIA-1H
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// TM uses 2-digit "01"-"05" for 5 welayats + "S" letter for Ashgabat city.
//   S  = Ashgabat (PPLC, 1.03M — already in curated)
//   04 = Lebap (Türkmenabat 231k)
//   03 = Daşoguz (201k)
//   05 = Mary (167k)
//   02 = Balkan (Balkanabat 88k)
//   01 = Ahal (Änew 29k)
export default {
    cc:              'tm',
    countryAr:       'تركمانستان',
    countryEn:       'Turkmenistan',
    defaultTimezone: 'Asia/Ashgabat',

    geonamesUrl:  'https://download.geonames.org/export/dump/TM.zip',
    innerTxtName: 'TM.txt',

    bbox: { minLat: 35.1, maxLat: 42.8, minLng: 52.4, maxLng: 66.7 },

    admin1ToRegion: {
        '':   { ar: 'تركمانستان',           en: 'Turkmenistan' },
        '01': { ar: 'منطقة أحال',           en: 'Ahal' },                      // Änew
        '02': { ar: 'منطقة بلخان',          en: 'Balkan' },                    // Balkanabat
        '03': { ar: 'منطقة داشوغوز',        en: 'Daşoguz' },
        '04': { ar: 'منطقة لباب',           en: 'Lebap' },                     // Türkmenabat
        '05': { ar: 'منطقة مرو',            en: 'Mary' },
        'S':  { ar: 'عشق آباد',             en: 'Ashgabat' }                   // PPLC
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
