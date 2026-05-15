// scripts/geodata/countries/pt.mjs
// ─────────────────────────────────────────────────────────────────────────
// Portugal — GeoNames country config
// CURATED-GEODATA-EUROPE-1B
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'pt',
    countryAr:       'البرتغال',
    countryEn:       'Portugal',
    defaultTimezone: 'Europe/Lisbon',

    geonamesUrl:  'https://download.geonames.org/export/dump/PT.zip',
    innerTxtName: 'PT.txt',

    // Portugal — mainland + Madeira + Azores.
    // Mainland: 36.5°-42°N, -9.6°-(-6°)E.
    // Madeira: 32.4°-33.1°N, -17.3°-(-16.2°)E — different tz (Atlantic/Madeira).
    // Azores: 36.9°-39.7°N, -31.3°-(-24.8°)E — different tz (Atlantic/Azores).
    // GeoNames per-place timezone is authoritative; bbox just covers all.
    bbox: { minLat: 32.4, maxLat: 42.2, minLng: -31.4, maxLng: -6.0 },

    // Portugal admin1 in GeoNames (verified via Stage 1 PPLC/PPLA
    // inspection on 2026-05-16). 18 districts + 2 autonomous regions.
    //
    //   02 = Aveiro
    //   03 = Beja
    //   04 = Braga
    //   05 = Bragança
    //   06 = Castelo Branco
    //   07 = Coimbra
    //   08 = Évora
    //   09 = Faro
    //   10 = Madeira (autonomous region — capital Funchal)
    //   11 = Guarda
    //   13 = Leiria
    //   14 = Lisbon (PPLC, capital district)
    //   16 = Portalegre
    //   17 = Porto
    //   18 = Santarém
    //   19 = Setúbal
    //   20 = Viana do Castelo
    //   21 = Vila Real
    //   22 = Viseu
    //   23 = Azores (autonomous region — capital Ponta Delgada)
    admin1ToRegion: {
        '02': { ar: 'أفيرو',             en: 'Aveiro' },
        '03': { ar: 'بيجا',              en: 'Beja' },
        '04': { ar: 'براغا',             en: 'Braga' },
        '05': { ar: 'براغانصا',          en: 'Bragança' },
        '06': { ar: 'كاستيلو برانكو',    en: 'Castelo Branco' },
        '07': { ar: 'قويمبرا',           en: 'Coimbra' },
        '08': { ar: 'إيفورا',            en: 'Évora' },
        '09': { ar: 'فارو',              en: 'Faro' },
        '10': { ar: 'ماديرا',            en: 'Madeira' },
        '11': { ar: 'غواردا',            en: 'Guarda' },
        '13': { ar: 'لييريا',            en: 'Leiria' },
        '14': { ar: 'لشبونة',            en: 'Lisbon' },
        '16': { ar: 'بورتاليغرا',        en: 'Portalegre' },
        '17': { ar: 'بورتو',             en: 'Porto' },
        '18': { ar: 'سانتاريم',          en: 'Santarém' },
        '19': { ar: 'سيتوبال',           en: 'Setúbal' },
        '20': { ar: 'فيانا دو كاستيلو',  en: 'Viana do Castelo' },
        '21': { ar: 'فيلا ريال',         en: 'Vila Real' },
        '22': { ar: 'فيزيو',             en: 'Viseu' },
        '23': { ar: 'الأزور',            en: 'Azores' }
    },

    // Europe-1B Strategy E: same as Europe-1A.
    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],

    extraReligious: [],
    extraNonPlace:  []
};
