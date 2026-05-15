// scripts/geodata/countries/ma.mjs
// ─────────────────────────────────────────────────────────────────────────
// Morocco — GeoNames country config
// CURATED-GEODATA-MAGHREB-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'ma',
    countryAr:       'المغرب',
    countryEn:       'Morocco',
    defaultTimezone: 'Africa/Casablanca',

    geonamesUrl:  'https://download.geonames.org/export/dump/MA.zip',
    innerTxtName: 'MA.txt',

    // Morocco proper: roughly 27.6°-35.9°N and 1°-13°W (negative
    // longitudes). GeoNames' MA dump ALSO includes Western Sahara
    // entries under MA (the politically contested southern territory)
    // — extends down to ~21°N and west to ~-17°. We include them since
    // GeoNames assigns them MA cc; the bbox absorbs both regions.
    bbox: { minLat: 20.7, maxLat: 36.0, minLng: -17.2, maxLng: 1.1 },

    // Verified via Stage 1 PPLA/PPLC inspection. Morocco has 12
    // regions (post-2015 reform):
    //   01=Tanger-Tétouan-Al Hoceima, 02=L'Oriental, 03=Fès-Meknès,
    //   04=PPLC Rabat-Salé-Kénitra, 05=Béni Mellal-Khénifra,
    //   06=Casablanca-Settat, 07=Marrakech-Safi, 08=Drâa-Tafilalet,
    //   09=Souss-Massa, 10=Guelmim-Oued Noun,
    //   11=Laâyoune-Sakia El Hamra (Western Sahara north),
    //   12=Dakhla-Oued Ed-Dahab (Western Sahara south).
    admin1ToRegion: {
        '01': { ar: 'طنجة-تطوان-الحسيمة',     en: 'Tanger-Tétouan-Al Hoceima' },
        '02': { ar: 'الشرق',                  en: 'L\'Oriental' },
        '03': { ar: 'فاس-مكناس',              en: 'Fès-Meknès' },
        '04': { ar: 'الرباط-سلا-القنيطرة',    en: 'Rabat-Salé-Kénitra' },
        '05': { ar: 'بني ملال-خنيفرة',        en: 'Béni Mellal-Khénifra' },
        '06': { ar: 'الدار البيضاء-سطات',     en: 'Casablanca-Settat' },
        '07': { ar: 'مراكش-آسفي',             en: 'Marrakech-Safi' },
        '08': { ar: 'درعة-تافيلالت',          en: 'Drâa-Tafilalet' },
        '09': { ar: 'سوس-ماسة',               en: 'Souss-Massa' },
        '10': { ar: 'كلميم-واد نون',          en: 'Guelmim-Oued Noun' },
        '11': { ar: 'العيون-الساقية الحمراء', en: 'Laâyoune-Sakia El Hamra' },
        '12': { ar: 'الداخلة-وادي الذهب',     en: 'Dakhla-Oued Ed-Dahab' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
