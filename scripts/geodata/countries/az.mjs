// scripts/geodata/countries/az.mjs — Azerbaijan — CURATED-GEODATA-ASIA-1I
// admin1 codes VERIFIED via Stage 1 PPLA/PPLC inspection (2026-05-17):
// AZ uses 2-digit "01"-"71" (with gaps at 30/47/56/61/67) for 64 rayons +
// Baku PPLC at "09".
// Key codes:
//   09 = Baku (PPLC, 2.35M — already in curated)
//   20 = Ganja (336k)
//   54 = Sumqayit (359k)
//   33 = Mingachevir (106k)
//   29 = Lankaran (240k)
//   58 = Tovuz (177k)
//   68 = Yevlakh (127k)
export default {
    cc:              'az',
    countryAr:       'أذربيجان',
    countryEn:       'Azerbaijan',
    defaultTimezone: 'Asia/Baku',

    geonamesUrl:  'https://download.geonames.org/export/dump/AZ.zip',
    innerTxtName: 'AZ.txt',

    bbox: { minLat: 38.4, maxLat: 41.9, minLng: 44.8, maxLng: 50.4 },

    admin1ToRegion: {
        '':   { ar: 'أذربيجان',           en: 'Azerbaijan' },
        '01': { ar: 'أبشيرون',            en: 'Absheron' },                  // Khirdalan
        '02': { ar: 'أغجاباي',            en: 'Agjabadi' },
        '03': { ar: 'أغدام',              en: 'Agdam' },
        '04': { ar: 'أغداش',              en: 'Agdash' },
        '05': { ar: 'آغستافا',            en: 'Agstafa' },
        '06': { ar: 'أغسو',               en: 'Agsu' },
        '07': { ar: 'شيرفان',             en: 'Shirvan' },
        '08': { ar: 'أستارا',             en: 'Astara' },
        '09': { ar: 'باكو',               en: 'Baku' },                      // PPLC
        '10': { ar: 'بالاكان',            en: 'Balaken' },
        '11': { ar: 'باردا',              en: 'Barda' },
        '12': { ar: 'بيلاغان',            en: 'Beylagan' },
        '13': { ar: 'بيلاسوفار',          en: 'Bilasuvar' },
        '14': { ar: 'جبرائيل',            en: 'Jabrayil' },
        '15': { ar: 'جليلاباد',           en: 'Jalilabad' },
        '16': { ar: 'داشكيسان',           en: 'Dashkasan' },
        '17': { ar: 'شاباران',            en: 'Shabran' },
        '18': { ar: 'فضولي',              en: 'Fuzuli' },
        '19': { ar: 'كاداباي',            en: 'Gadabay' },
        '20': { ar: 'غنجة',               en: 'Ganja' },
        '21': { ar: 'غورنبوي',            en: 'Goranboy' },
        '22': { ar: 'غويتشاي',            en: 'Goychay' },
        '23': { ar: 'حاجي قابل',          en: 'Hajigabul' },
        '24': { ar: 'إيميشلي',            en: 'Imishli' },
        '25': { ar: 'إسماعيلي',           en: 'Ismayilli' },
        '26': { ar: 'كلبجار',             en: 'Kalbajar' },
        '27': { ar: 'كوردمير',            en: 'Kurdamir' },
        '28': { ar: 'لاتشين',             en: 'Lachin' },
        '29': { ar: 'لنكران',             en: 'Lankaran' },
        '31': { ar: 'ليريك',              en: 'Lerik' },
        '32': { ar: 'مسالي',              en: 'Masally' },
        '33': { ar: 'مينغاتشيفير',        en: 'Mingachevir' },
        '34': { ar: 'نفطالان',            en: 'Naftalan' },
        '35': { ar: 'ناختشيفان',          en: 'Nakhchivan' },
        '36': { ar: 'نفط تشالا',          en: 'Neftchala' },
        '37': { ar: 'أوغوز',              en: 'Oghuz' },
        '38': { ar: 'قبلة',               en: 'Gabala' },
        '39': { ar: 'قاخ',                en: 'Qakh' },
        '40': { ar: 'قازاخ',              en: 'Qazax' },
        '41': { ar: 'قوبستان',            en: 'Gobustan' },
        '42': { ar: 'قوبا',               en: 'Quba' },
        '43': { ar: 'قبادلي',             en: 'Qubadli' },
        '44': { ar: 'قوسار',              en: 'Qusar' },
        '45': { ar: 'سعتلي',              en: 'Saatli' },
        '46': { ar: 'سابيراباد',          en: 'Sabirabad' },
        '48': { ar: 'شكي',                en: 'Shaki' },
        '49': { ar: 'سالين',              en: 'Salyan' },
        '50': { ar: 'شماخي',              en: 'Shamakhi' },
        '51': { ar: 'شامكير',             en: 'Shamkir' },
        '52': { ar: 'ساموخ',              en: 'Samukh' },
        '53': { ar: 'سيازان',             en: 'Siyazan' },
        '54': { ar: 'سومقاييت',           en: 'Sumqayit' },
        '55': { ar: 'شوشا',               en: 'Shusha' },
        '57': { ar: 'تارتر',              en: 'Tartar' },
        '58': { ar: 'توفوز',              en: 'Tovuz' },
        '59': { ar: 'أوجار',              en: 'Ujar' },
        '60': { ar: 'خاتشماز',            en: 'Khachmaz' },
        '62': { ar: 'غويغل',              en: 'Goygol' },
        '63': { ar: 'خيزي',               en: 'Khizi' },
        '64': { ar: 'خوجالي',             en: 'Khojaly' },
        '65': { ar: 'خانكندي',            en: 'Khankendi' },
        '66': { ar: 'ياردمالي',           en: 'Yardimli' },
        '68': { ar: 'يفلاخ',              en: 'Yevlakh' },
        '69': { ar: 'زنجيلان',            en: 'Zangilan' },
        '70': { ar: 'زاكاتالا',           en: 'Zaqatala' },
        '71': { ar: 'زردب',               en: 'Zardab' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
