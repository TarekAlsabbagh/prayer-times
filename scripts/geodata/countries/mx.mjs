// scripts/geodata/countries/mx.mjs — Mexico — CURATED-GEODATA-AMERICAS-1A
// admin1 codes verified via Stage 1 PPLA/PPLC inspection (2026-05-16):
// GeoNames uses 2-digit numeric codes for 31 states + Mexico City.
export default {
    cc:              'mx',
    countryAr:       'المكسيك',
    countryEn:       'Mexico',
    defaultTimezone: 'America/Mexico_City',

    geonamesUrl:  'https://download.geonames.org/export/dump/MX.zip',
    innerTxtName: 'MX.txt',

    bbox: { minLat: 14.4, maxLat: 32.8, minLng: -118.6, maxLng: -86.6 },

    admin1ToRegion: {
        '01': { ar: 'أغواسكالينتس',     en: 'Aguascalientes' },
        '02': { ar: 'باها كاليفورنيا',   en: 'Baja California' },           // Mexicali
        '03': { ar: 'باها كاليفورنيا سور', en: 'Baja California Sur' },    // La Paz
        '04': { ar: 'كامبتشي',          en: 'Campeche' },
        '05': { ar: 'تشياباس',          en: 'Chiapas' },                   // Tuxtla
        '06': { ar: 'تشيواوا',          en: 'Chihuahua' },
        '07': { ar: 'كواويلا',          en: 'Coahuila' },                  // Saltillo
        '08': { ar: 'كوليما',           en: 'Colima' },
        '09': { ar: 'مكسيكو سيتي',      en: 'Mexico City' },               // PPLC (CDMX)
        '11': { ar: 'غواناخواتو',       en: 'Guanajuato' },
        '12': { ar: 'غيريرو',           en: 'Guerrero' },                  // Chilpancingo
        '13': { ar: 'هيدالغو',          en: 'Hidalgo' },                   // Pachuca
        '14': { ar: 'خاليسكو',          en: 'Jalisco' },                   // Guadalajara
        '15': { ar: 'ولاية مكسيكو',     en: 'Estado de México' },          // Toluca
        '16': { ar: 'ميتشواكان',        en: 'Michoacán' },                 // Morelia
        '17': { ar: 'موريلوس',          en: 'Morelos' },                   // Cuernavaca
        '18': { ar: 'نايريت',           en: 'Nayarit' },                   // Tepic
        '19': { ar: 'نويفو ليون',       en: 'Nuevo León' },                // Monterrey
        '20': { ar: 'واهاكا',           en: 'Oaxaca' },
        '21': { ar: 'بويبلا',           en: 'Puebla' },
        '22': { ar: 'كيريتارو',         en: 'Querétaro' },                 // Santiago de Querétaro
        '23': { ar: 'كينتانا رو',       en: 'Quintana Roo' },              // Chetumal
        '24': { ar: 'سان لويس بوتوسي',  en: 'San Luis Potosí' },
        '25': { ar: 'سينالوا',          en: 'Sinaloa' },                   // Culiacán
        '26': { ar: 'سونورا',           en: 'Sonora' },                    // Hermosillo
        '27': { ar: 'تاباسكو',          en: 'Tabasco' },                   // Villahermosa
        '28': { ar: 'تاماوليباس',       en: 'Tamaulipas' },                // Ciudad Victoria
        '29': { ar: 'تلاكسكالا',        en: 'Tlaxcala' },
        '30': { ar: 'فيراكروز',         en: 'Veracruz' },                  // Xalapa
        '31': { ar: 'يوكاتان',          en: 'Yucatán' },                   // Mérida
        '32': { ar: 'ساكاتيكاس',        en: 'Zacatecas' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
