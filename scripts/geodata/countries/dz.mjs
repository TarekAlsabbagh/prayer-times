// scripts/geodata/countries/dz.mjs
// ─────────────────────────────────────────────────────────────────────────
// Algeria — GeoNames country config
// CURATED-GEODATA-MAGHREB-1
// ─────────────────────────────────────────────────────────────────────────
export default {
    cc:              'dz',
    countryAr:       'الجزائر',
    countryEn:       'Algeria',
    defaultTimezone: 'Africa/Algiers',

    geonamesUrl:  'https://download.geonames.org/export/dump/DZ.zip',
    innerTxtName: 'DZ.txt',

    // Algeria: roughly 19°-37°N and -8.7°-12.0°E. Africa's largest
    // country by area — covers most of the central + western Sahara.
    bbox: { minLat: 18.9, maxLat: 37.1, minLng: -8.8, maxLng: 12.1 },

    // Verified via Stage 1 PPLA/PPLC inspection. Algeria has 58 wilayas
    // (48 original + 10 new since 2019). GeoNames uses numeric codes
    // 01-56 for the 48 original wilayas + 2-letter codes BA/BB/DJ/EM/
    // IG/IS/MG/OD/TG/TM for the 10 new ones.
    admin1ToRegion: {
        '01': { ar: 'ولاية الجزائر',           en: 'Algiers Province' },
        '03': { ar: 'ولاية باتنة',             en: 'Batna Province' },
        '04': { ar: 'ولاية قسنطينة',           en: 'Constantine Province' },
        '06': { ar: 'ولاية المدية',            en: 'Médéa Province' },
        '07': { ar: 'ولاية مستغانم',           en: 'Mostaganem Province' },
        '09': { ar: 'ولاية وهران',             en: 'Oran Province' },
        '10': { ar: 'ولاية سعيدة',             en: 'Saïda Province' },
        '12': { ar: 'ولاية سطيف',              en: 'Sétif Province' },
        '13': { ar: 'ولاية تيارت',             en: 'Tiaret Province' },
        '14': { ar: 'ولاية تيزي وزو',          en: 'Tizi Ouzou Province' },
        '15': { ar: 'ولاية تلمسان',            en: 'Tlemcen Province' },
        '18': { ar: 'ولاية بجاية',             en: 'Béjaïa Province' },
        '19': { ar: 'ولاية بسكرة',             en: 'Biskra Province' },
        '20': { ar: 'ولاية البليدة',           en: 'Blida Province' },
        '21': { ar: 'ولاية البويرة',           en: 'Bouïra Province' },
        '22': { ar: 'ولاية الجلفة',            en: 'Djelfa Province' },
        '23': { ar: 'ولاية قالمة',             en: 'Guelma Province' },
        '24': { ar: 'ولاية جيجل',              en: 'Jijel Province' },
        '25': { ar: 'ولاية الأغواط',           en: 'Laghouat Province' },
        '26': { ar: 'ولاية معسكر',             en: 'Mascara Province' },
        '27': { ar: 'ولاية المسيلة',           en: 'M\'Sila Province' },
        '29': { ar: 'ولاية أم البواقي',        en: 'Oum El Bouaghi Province' },
        '30': { ar: 'ولاية سيدي بلعباس',       en: 'Sidi Bel Abbès Province' },
        '31': { ar: 'ولاية سكيكدة',            en: 'Skikda Province' },
        '33': { ar: 'ولاية تبسة',              en: 'Tébessa Province' },
        '34': { ar: 'ولاية أدرار',             en: 'Adrar Province' },
        '35': { ar: 'ولاية عين الدفلى',        en: 'Aïn Defla Province' },
        '36': { ar: 'ولاية عين تموشنت',        en: 'Aïn Témouchent Province' },
        '37': { ar: 'ولاية عنابة',             en: 'Annaba Province' },
        '38': { ar: 'ولاية بشار',              en: 'Béchar Province' },
        '39': { ar: 'ولاية برج بوعريريج',      en: 'Bordj Bou Arréridj Province' },
        '40': { ar: 'ولاية بومرداس',           en: 'Boumerdès Province' },
        '41': { ar: 'ولاية الشلف',             en: 'Chlef Province' },
        '42': { ar: 'ولاية البيض',             en: 'El Bayadh Province' },
        '43': { ar: 'ولاية الوادي',            en: 'El Oued Province' },
        '44': { ar: 'ولاية الطارف',            en: 'El Tarf Province' },
        '45': { ar: 'ولاية غرداية',            en: 'Ghardaïa Province' },
        '46': { ar: 'ولاية إليزي',             en: 'Illizi Province' },
        '47': { ar: 'ولاية خنشلة',             en: 'Khenchela Province' },
        '48': { ar: 'ولاية ميلة',              en: 'Mila Province' },
        '49': { ar: 'ولاية النعامة',           en: 'Naâma Province' },
        '50': { ar: 'ولاية ورقلة',             en: 'Ouargla Province' },
        '51': { ar: 'ولاية غليزان',            en: 'Relizane Province' },
        '52': { ar: 'ولاية سوق أهراس',         en: 'Souk Ahras Province' },
        '53': { ar: 'ولاية تمنراست',           en: 'Tamanrasset Province' },
        '54': { ar: 'ولاية تندوف',             en: 'Tindouf Province' },
        '55': { ar: 'ولاية تيبازة',            en: 'Tipaza Province' },
        '56': { ar: 'ولاية تيسمسيلت',          en: 'Tissemsilt Province' },
        'BA': { ar: 'ولاية بني عباس',          en: 'Béni Abbès Province' },
        'BB': { ar: 'ولاية برج باجي مختار',    en: 'Bordj Badji Mokhtar Province' },
        'DJ': { ar: 'ولاية جانت',              en: 'Djanet Province' },
        'EM': { ar: 'ولاية المنيعة',           en: 'El Meniaa Province' },
        'IG': { ar: 'ولاية عين قزام',          en: 'In Guezzam Province' },
        'IS': { ar: 'ولاية عين صالح',          en: 'In Salah Province' },
        'MG': { ar: 'ولاية المغير',            en: 'El Meghaïer Province' },
        'OD': { ar: 'ولاية أولاد جلال',        en: 'Ouled Djellal Province' },
        'TG': { ar: 'ولاية تقرت',              en: 'Touggourt Province' },
        'TM': { ar: 'ولاية تيميمون',           en: 'Timimoun Province' }
    },

    extraReligious: [],
    extraNonPlace:  []
};
