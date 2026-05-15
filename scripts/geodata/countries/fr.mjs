// scripts/geodata/countries/fr.mjs
// ─────────────────────────────────────────────────────────────────────────
// France — GeoNames country config
// CURATED-GEODATA-EUROPE-1A
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'fr',
    countryAr:       'فرنسا',
    countryEn:       'France',
    defaultTimezone: 'Europe/Paris',

    geonamesUrl:  'https://download.geonames.org/export/dump/FR.zip',
    innerTxtName: 'FR.txt',

    // Metropolitan France (mainland + Corsica). Overseas departments
    // and territories (Guadeloupe GP, Martinique MQ, Réunion RE,
    // Mayotte YT, French Guiana GF, etc.) have separate GeoNames codes
    // and are NOT included in this wave. Bbox: 41.3°-51.2°N,
    // -5.2°-9.7°E. (Corsica extends to ~41.3°N.)
    bbox: { minLat: 41.3, maxLat: 51.2, minLng: -5.2, maxLng: 9.7 },

    // France admin1 in GeoNames uses 2-digit numeric codes corresponding
    // to the post-2016 regional reform (13 metropolitan regions). The
    // codes below follow ISO 3166-2:FR.
    //
    // 11=Île-de-France, 24=Centre-Val de Loire, 27=Bourgogne-Franche-Comté,
    // 28=Normandie, 32=Hauts-de-France, 44=Grand Est, 52=Pays de la Loire,
    // 53=Bretagne, 75=Nouvelle-Aquitaine, 76=Occitanie,
    // 84=Auvergne-Rhône-Alpes, 93=Provence-Alpes-Côte d'Azur, 94=Corse.
    //
    // GeoNames may use shorter forms or alternate codes; we'll verify
    // after Stage 1 inspection.
    admin1ToRegion: {
        '11': { ar: 'إيل دو فرانس',                  en: 'Île-de-France' },
        '24': { ar: 'سنتر-فال دو لوار',              en: 'Centre-Val de Loire' },
        '27': { ar: 'بورغوني-فرانش-كونتيه',          en: 'Bourgogne-Franche-Comté' },
        '28': { ar: 'نورماندي',                      en: 'Normandie' },
        '32': { ar: 'أوت دو فرانس',                  en: 'Hauts-de-France' },
        '44': { ar: 'غران إست',                      en: 'Grand Est' },
        '52': { ar: 'بايز دو لا لوار',               en: 'Pays de la Loire' },
        '53': { ar: 'بريتاني',                       en: 'Bretagne' },
        '75': { ar: 'نوفيل-أكيتانيا',                en: 'Nouvelle-Aquitaine' },
        '76': { ar: 'أوكسيتاني',                     en: 'Occitanie' },
        '84': { ar: 'أوفيرني-رون-ألب',               en: 'Auvergne-Rhône-Alpes' },
        '93': { ar: 'بروفنس-ألب-كوت دازور',          en: "Provence-Alpes-Côte d'Azur" },
        '94': { ar: 'كورسيكا',                       en: 'Corse' },
        // Legacy pre-2016 region codes (in case GeoNames hasn't fully
        // migrated). Some may still appear in older entries.
        'A':  { ar: 'ألزاس',                         en: 'Alsace' },
        'B':  { ar: 'أكيتاني',                       en: 'Aquitaine' },
        'C':  { ar: 'أوفيرني',                       en: 'Auvergne' },
        'D':  { ar: 'بورغوني',                       en: 'Bourgogne' },
        'E':  { ar: 'بريتاني',                       en: 'Bretagne' },
        'F':  { ar: 'سنتر',                          en: 'Centre' },
        'G':  { ar: 'شامبانيا-أردين',                en: 'Champagne-Ardenne' },
        'H':  { ar: 'كورسيكا',                       en: 'Corse' },
        'I':  { ar: 'فرانش-كونتيه',                  en: 'Franche-Comté' },
        'J':  { ar: 'إيل دو فرانس',                  en: 'Île-de-France' },
        'K':  { ar: 'لانغدوك-روسيون',                en: 'Languedoc-Roussillon' },
        'L':  { ar: 'ليموزان',                       en: 'Limousin' },
        'M':  { ar: 'لورين',                         en: 'Lorraine' },
        'N':  { ar: 'ميدي-بيريني',                   en: 'Midi-Pyrénées' },
        'O':  { ar: 'نور-با دو كاليه',               en: 'Nord-Pas-de-Calais' },
        'P':  { ar: 'النورماندي السفلى',             en: 'Basse-Normandie' },
        'Q':  { ar: 'النورماندي العليا',             en: 'Haute-Normandie' },
        'R':  { ar: 'بايز دو لا لوار',               en: 'Pays de la Loire' },
        'S':  { ar: 'بيكاردي',                       en: 'Picardie' },
        'T':  { ar: 'بواتو-شارانت',                  en: 'Poitou-Charentes' },
        'U':  { ar: 'بروفنس-ألب-كوت دازور',          en: "Provence-Alpes-Côte d'Azur" },
        'V':  { ar: 'رون-ألب',                       en: 'Rhône-Alpes' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
