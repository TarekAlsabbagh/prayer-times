// scripts/geodata/countries/de.mjs
// ─────────────────────────────────────────────────────────────────────────
// Germany — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'de',
    countryAr:       'ألمانيا',
    countryEn:       'Germany',
    defaultTimezone: 'Europe/Berlin',

    geonamesUrl:  'https://download.geonames.org/export/dump/DE.zip',
    innerTxtName: 'DE.txt',

    // Germany: 47.27°-55.06°N, 5.87°-15.04°E.
    bbox: { minLat: 47.2, maxLat: 55.1, minLng: 5.8, maxLng: 15.1 },

    // Germany admin1 in GeoNames (verified via Stage 1 PPLA/PPLC inspection
    // on 2026-05-16). 16 federal states (Länder):
    //   01 = Baden-Württemberg (Stuttgart PPLA)
    //   02 = Bavaria (Munich PPLA)
    //   03 = Bremen (city-state)
    //   04 = Hamburg (city-state)
    //   05 = Hesse (Wiesbaden PPLA)
    //   06 = Lower Saxony (Hannover PPLA)
    //   07 = North Rhine-Westphalia (Düsseldorf PPLA)
    //   08 = Rhineland-Palatinate (Mainz PPLA)
    //   09 = Saarland (Saarbrücken PPLA)
    //   10 = Schleswig-Holstein (Kiel PPLA)
    //   11 = Brandenburg (Potsdam PPLA)
    //   12 = Mecklenburg-Vorpommern (Schwerin PPLA)
    //   13 = Saxony (Dresden PPLA)
    //   14 = Saxony-Anhalt (Magdeburg PPLA)
    //   15 = Thuringia (Erfurt PPLA)
    //   16 = Berlin (PPLC, city-state)
    admin1ToRegion: {
        '01': { ar: 'بادن-فورتمبرغ',          en: 'Baden-Württemberg' },
        '02': { ar: 'بافاريا',                 en: 'Bavaria' },
        '03': { ar: 'بريمن',                   en: 'Bremen' },
        '04': { ar: 'هامبورغ',                 en: 'Hamburg' },
        '05': { ar: 'هسن',                     en: 'Hesse' },
        '06': { ar: 'سكسونيا السفلى',          en: 'Lower Saxony' },
        '07': { ar: 'شمال الراين-وستفاليا',    en: 'North Rhine-Westphalia' },
        '08': { ar: 'راينلاند-بفالتس',         en: 'Rhineland-Palatinate' },
        '09': { ar: 'سارلاند',                 en: 'Saarland' },
        '10': { ar: 'شليسفيغ-هولشتاين',        en: 'Schleswig-Holstein' },
        '11': { ar: 'براندنبورغ',              en: 'Brandenburg' },
        '12': { ar: 'ميكلنبورغ-فوربومرن',      en: 'Mecklenburg-Vorpommern' },
        '13': { ar: 'سكسونيا',                 en: 'Saxony' },
        '14': { ar: 'سكسونيا-أنهالت',          en: 'Saxony-Anhalt' },
        '15': { ar: 'تورنغن',                  en: 'Thuringia' },
        '16': { ar: 'برلين',                   en: 'Berlin' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
