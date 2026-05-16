// scripts/geodata/countries/it.mjs
// ─────────────────────────────────────────────────────────────────────────
// Italy — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'it',
    countryAr:       'إيطاليا',
    countryEn:       'Italy',
    defaultTimezone: 'Europe/Rome',

    geonamesUrl:  'https://download.geonames.org/export/dump/IT.zip',
    innerTxtName: 'IT.txt',

    // Mainland + Sicily + Sardinia + Pantelleria + Lampedusa.
    bbox: { minLat: 35.4, maxLat: 47.1, minLng: 6.6, maxLng: 18.6 },

    // Italy admin1 in GeoNames (verified via Stage 1 PPLA/PPLC inspection
    // on 2026-05-16). 20 regions, ordered ALPHABETICALLY by Italian name:
    //   01 = Abruzzo (L'Aquila)         02 = Basilicata (Potenza)
    //   03 = Calabria (Catanzaro)       04 = Campania (Naples)
    //   05 = Emilia-Romagna (Bologna)   06 = Friuli-Venezia Giulia (Trieste)
    //   07 = Lazio (Rome PPLC)          08 = Liguria (Genoa)
    //   09 = Lombardy (Milan)           10 = Marche (Ancona)
    //   11 = Molise (Campobasso)        12 = Piedmont (Turin)
    //   13 = Apulia (Bari)              14 = Sardinia (Cagliari)
    //   15 = Sicily (Palermo)           16 = Tuscany (Florence)
    //   17 = Trentino-Alto Adige (Trento) 18 = Umbria (Perugia)
    //   19 = Aosta Valley (Aosta)       20 = Veneto (Venice)
    admin1ToRegion: {
        '01': { ar: 'أبروتسو',             en: 'Abruzzo' },
        '02': { ar: 'بازيليكاتا',          en: 'Basilicata' },
        '03': { ar: 'كالابريا',            en: 'Calabria' },
        '04': { ar: 'كامبانيا',            en: 'Campania' },
        '05': { ar: 'إميليا رومانيا',      en: 'Emilia-Romagna' },
        '06': { ar: 'فريولي-فينيتسيا جوليا', en: 'Friuli-Venezia Giulia' },
        '07': { ar: 'لاتسيو',              en: 'Lazio' },
        '08': { ar: 'ليغوريا',             en: 'Liguria' },
        '09': { ar: 'لومبارديا',           en: 'Lombardy' },
        '10': { ar: 'ماركي',               en: 'Marche' },
        '11': { ar: 'موليزي',              en: 'Molise' },
        '12': { ar: 'بييمونتي',            en: 'Piedmont' },
        '13': { ar: 'بوليا',               en: 'Apulia' },
        '14': { ar: 'سردينيا',             en: 'Sardinia' },
        '15': { ar: 'صقلية',               en: 'Sicily' },
        '16': { ar: 'توسكانا',             en: 'Tuscany' },
        '17': { ar: 'ترنتينو ألتو أديجي',  en: 'Trentino-Alto Adige' },
        '18': { ar: 'أومبريا',             en: 'Umbria' },
        '19': { ar: 'وادي أوستا',          en: 'Aosta Valley' },
        '20': { ar: 'فينيتو',              en: 'Veneto' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
