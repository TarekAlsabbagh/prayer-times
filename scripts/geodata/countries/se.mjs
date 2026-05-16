// scripts/geodata/countries/se.mjs
// ─────────────────────────────────────────────────────────────────────────
// Sweden — GeoNames country config
// CURATED-GEODATA-EUROPE-2
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'se',
    countryAr:       'السويد',
    countryEn:       'Sweden',
    defaultTimezone: 'Europe/Stockholm',

    geonamesUrl:  'https://download.geonames.org/export/dump/SE.zip',
    innerTxtName: 'SE.txt',

    bbox: { minLat: 55.3, maxLat: 69.1, minLng: 11.0, maxLng: 24.2 },

    // Sweden admin1 (verified via Stage 1 PPLA inspection on 2026-05-16).
    // 21 counties (län). GeoNames numeric codes:
    //   02 = Blekinge (Karlskrona)        03 = Gävleborg (Gävle)
    //   05 = Gotland (Visby)              06 = Halland (Halmstad)
    //   07 = Jämtland (Östersund)         08 = Jönköping
    //   09 = Kalmar                       10 = Dalarna (Falun)
    //   12 = Kronoberg (Växjö)            14 = Norrbotten (Luleå)
    //   15 = Örebro                       16 = Östergötland (Linköping)
    //   18 = Södermanland (Nyköping)      21 = Uppsala
    //   22 = Värmland (Karlstad)          23 = Västerbotten (Umeå)
    //   24 = Västernorrland (Härnösand)   25 = Västmanland (Västerås)
    //   26 = Stockholm                    27 = Skåne (Malmö)
    //   28 = Västra Götaland (Gothenburg)
    admin1ToRegion: {
        '02': { ar: 'بليكينغه',     en: 'Blekinge' },
        '03': { ar: 'غافلبرغ',      en: 'Gävleborg' },
        '05': { ar: 'غوتلاند',      en: 'Gotland' },
        '06': { ar: 'هالاند',       en: 'Halland' },
        '07': { ar: 'جامتلاند',     en: 'Jämtland' },
        '08': { ar: 'يونشوبينغ',    en: 'Jönköping' },
        '09': { ar: 'كالمار',       en: 'Kalmar' },
        '10': { ar: 'دالارنا',      en: 'Dalarna' },
        '12': { ar: 'كرونوبيرغ',    en: 'Kronoberg' },
        '14': { ar: 'نوربوتن',      en: 'Norrbotten' },
        '15': { ar: 'أوريبرو',      en: 'Örebro' },
        '16': { ar: 'أوسترغوتلاند', en: 'Östergötland' },
        '18': { ar: 'سودرمانلاند',  en: 'Södermanland' },
        '21': { ar: 'أوبسالا',      en: 'Uppsala' },
        '22': { ar: 'فارملاند',     en: 'Värmland' },
        '23': { ar: 'فاسربوتن',     en: 'Västerbotten' },
        '24': { ar: 'فاسترنورلاند', en: 'Västernorrland' },
        '25': { ar: 'فاسترمانلاند', en: 'Västmanland' },
        '26': { ar: 'ستوكهولم',     en: 'Stockholm' },
        '27': { ar: 'سكونه',        en: 'Skåne' },
        '28': { ar: 'فاسترا غوتالاند', en: 'Västra Götaland' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
