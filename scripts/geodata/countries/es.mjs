// scripts/geodata/countries/es.mjs
// ─────────────────────────────────────────────────────────────────────────
// Spain — GeoNames country config
// CURATED-GEODATA-EUROPE-1B
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'es',
    countryAr:       'إسبانيا',
    countryEn:       'Spain',
    defaultTimezone: 'Europe/Madrid',

    geonamesUrl:  'https://download.geonames.org/export/dump/ES.zip',
    innerTxtName: 'ES.txt',

    // Spain — mainland + Balearic Islands + Canary Islands + Ceuta + Melilla.
    // Mainland: 36°-44°N, -9.5°-3.5°E.
    // Balearic: 38.6°-40°N, 1.2°-4.4°E.
    // Canary Islands: 27.6°-29.5°N, -18.2°-(-13.4°)E — Atlantic Ocean,
    //   different timezone (Atlantic/Canary). GeoNames per-place tz is
    //   authoritative; we just expand the bbox.
    // Ceuta + Melilla: African coast enclaves, 35.2°-35.4°N, -5.4°-(-2.9°)E.
    // Combined bbox includes all of the above.
    bbox: { minLat: 27.5, maxLat: 44.0, minLng: -18.5, maxLng: 4.5 },

    // Spain admin1 in GeoNames (verified via Stage 1 PPLC/PPLA inspection
    // on 2026-05-16). Uses a mix of 2-digit codes + 2-letter codes:
    //
    //   07 = Balearic Islands (Palma)
    //   27 = La Rioja (Logroño)
    //   29 = Madrid (PPLC)
    //   31 = Murcia
    //   32 = Navarre (Pamplona)
    //   34 = Asturias (Oviedo)
    //   39 = Cantabria (Santander)
    //   51 = Andalusia (Sevilla)
    //   52 = Aragon (Zaragoza)
    //   53 = Canary Islands (Tenerife + Gran Canaria)
    //   54 = Castile-La Mancha (Toledo)
    //   55 = Castile and León (Valladolid)
    //   56 = Catalonia (Barcelona)
    //   57 = Extremadura (Mérida)
    //   58 = Galicia (Santiago de Compostela)
    //   59 = Basque Country (Vitoria)
    //   60 = Valencian Community (Valencia)
    //   CE = Ceuta (2-letter — autonomous city)
    //   ML = Melilla (2-letter — autonomous city)
    admin1ToRegion: {
        '07': { ar: 'جزر البليار',                   en: 'Balearic Islands' },
        '27': { ar: 'لا ريوخا',                      en: 'La Rioja' },
        '29': { ar: 'مدريد',                         en: 'Madrid' },
        '31': { ar: 'مرسية',                         en: 'Murcia' },
        '32': { ar: 'نافارا',                        en: 'Navarre' },
        '34': { ar: 'أستورياس',                      en: 'Asturias' },
        '39': { ar: 'كانتابريا',                     en: 'Cantabria' },
        '51': { ar: 'الأندلس',                       en: 'Andalusia' },
        '52': { ar: 'أراغون',                        en: 'Aragon' },
        '53': { ar: 'جزر الكناري',                   en: 'Canary Islands' },
        '54': { ar: 'قشتالة لا مانتشا',              en: 'Castile-La Mancha' },
        '55': { ar: 'قشتالة وليون',                  en: 'Castile and León' },
        '56': { ar: 'كاتالونيا',                     en: 'Catalonia' },
        '57': { ar: 'إكستريمادورا',                  en: 'Extremadura' },
        '58': { ar: 'غاليسيا',                       en: 'Galicia' },
        '59': { ar: 'إقليم الباسك',                  en: 'Basque Country' },
        '60': { ar: 'بلنسية',                        en: 'Valencian Community' },
        'CE': { ar: 'سبتة',                          en: 'Ceuta' },
        'ML': { ar: 'مليلية',                        en: 'Melilla' }
    },

    // Europe-1B Strategy E: same as Europe-1A.
    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
