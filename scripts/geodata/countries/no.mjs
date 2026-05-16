// scripts/geodata/countries/no.mjs
// ─────────────────────────────────────────────────────────────────────────
// Norway — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'no',
    countryAr:       'النرويج',
    countryEn:       'Norway',
    defaultTimezone: 'Europe/Oslo',

    geonamesUrl:  'https://download.geonames.org/export/dump/NO.zip',
    innerTxtName: 'NO.txt',

    // Mainland Norway + Svalbard. Mainland: 57.9°-71.2°N.
    bbox: { minLat: 57.5, maxLat: 81.0, minLng: 4.5, maxLng: 35.5 },

    // Norway admin1 (verified via Stage 1 PPLA inspection on 2026-05-16).
    // GeoNames uses POST-2020 reform codes (some merged counties):
    //   04 = Buskerud-Drammen        05 = Finnmark (Vadsø)
    //   08 = Møre og Romsdal (Molde) 09 = Nordland (Bodø)
    //   12 = Oslo (PPLC)             13 = Østfold (Sarpsborg)
    //   14 = Rogaland (Stavanger)    17 = Telemark (Skien)
    //   18 = Troms (Tromsø)          20 = Vestfold (Tønsberg)
    //   21 = Trøndelag (Steinkjer)
    //   34 = Innlandet (Lillehammer + Hamar — merged Hedmark+Oppland)
    //   42 = Agder (Kristiansand + Arendal — merged Aust+Vest)
    //   46 = Vestland (Bergen + Hermansverk — merged Hordaland+Sogn)
    admin1ToRegion: {
        '04': { ar: 'بوسكرود',         en: 'Buskerud' },
        '05': { ar: 'فينمارك',         en: 'Finnmark' },
        '08': { ar: 'مور أوغ رومسدال', en: 'Møre og Romsdal' },
        '09': { ar: 'نوردلاند',        en: 'Nordland' },
        '12': { ar: 'أوسلو',           en: 'Oslo' },
        '13': { ar: 'أوستفولد',        en: 'Østfold' },
        '14': { ar: 'روغالاند',        en: 'Rogaland' },
        '17': { ar: 'تيليمارك',        en: 'Telemark' },
        '18': { ar: 'ترومس',           en: 'Troms' },
        '20': { ar: 'فيستفولد',        en: 'Vestfold' },
        '21': { ar: 'تروندلاغ',        en: 'Trøndelag' },
        '34': { ar: 'إنلاندت',         en: 'Innlandet' },
        '42': { ar: 'أغدر',            en: 'Agder' },
        '46': { ar: 'فيستلاند',        en: 'Vestland' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
