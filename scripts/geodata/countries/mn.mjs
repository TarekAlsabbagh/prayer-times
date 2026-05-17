// scripts/geodata/countries/mn.mjs — Mongolia — CURATED-GEODATA-ASIA-1H
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// MN uses 2-digit "01"-"25" for 21 aimags + Ulaanbaatar PPLC + 3 city munis.
//   20 = Ulaanbaatar (PPLC, 845k — currently 0 in curated)
//   23 = Darkhan-Uul (Darhan 84k)
//   25 = Orkhon (Erdenet 98k)
//   02 = Bayan-Ölgii (Ölgii)
//   06 = Dornod (Choibalsan)
//   13 = Khövsgöl (Mörön)
//   12 = Khovd (Khovd town)
export default {
    cc:              'mn',
    countryAr:       'منغوليا',
    countryEn:       'Mongolia',
    defaultTimezone: 'Asia/Ulaanbaatar',

    geonamesUrl:  'https://download.geonames.org/export/dump/MN.zip',
    innerTxtName: 'MN.txt',

    bbox: { minLat: 41.6, maxLat: 52.2, minLng: 87.7, maxLng: 119.9 },

    admin1ToRegion: {
        '':   { ar: 'منغوليا',              en: 'Mongolia' },
        '01': { ar: 'أرخانغاي',             en: 'Arkhangai' },                 // Tsetserleg
        '02': { ar: 'بايان أولغي',          en: 'Bayan-Ölgii' },               // Ölgii
        '03': { ar: 'بايانخونغور',          en: 'Bayankhongor' },
        '06': { ar: 'دورنود',               en: 'Dornod' },                    // Choibalsan
        '07': { ar: 'دورنوغوبي',            en: 'Dornogovi' },                 // Saynshand
        '08': { ar: 'دوندغوبي',             en: 'Dundgovi' },                  // Mandalgovi
        '09': { ar: 'دزافخان',              en: 'Zavkhan' },                   // Uliastay
        '10': { ar: 'غوبي ألطاي',           en: 'Govi-Altai' },                // Altai
        '11': { ar: 'خنتي',                 en: 'Khentii' },                   // Undurkhaan
        '12': { ar: 'خوفد',                 en: 'Khovd' },
        '13': { ar: 'خوبسغول',              en: 'Khövsgöl' },                  // Mörön
        '14': { ar: 'أومنوغوبي',            en: 'Ömnögovi' },                  // Dalandzadgad
        '15': { ar: 'أوبور خانغاي',         en: 'Övörkhangai' },               // Arvayheer
        '16': { ar: 'سوخباتر',              en: 'Sükhbaatar' },                // city
        '17': { ar: 'سوخباتر آيماغ',        en: 'Sükhbaatar Aimag' },          // Baruun-Urt
        '18': { ar: 'توف',                  en: 'Töv' },                       // Dzuunmod
        '19': { ar: 'أوبس',                 en: 'Uvs' },                       // Ulaangom
        '20': { ar: 'أولان باتور',          en: 'Ulaanbaatar' },               // PPLC
        '21': { ar: 'بولغان',               en: 'Bulgan' },
        '23': { ar: 'دارخان أول',           en: 'Darkhan-Uul' },               // Darhan
        '24': { ar: 'غوفي سومبر',           en: 'Govisümber' },                // Choyr
        '25': { ar: 'أورخون',               en: 'Orkhon' }                     // Erdenet
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
