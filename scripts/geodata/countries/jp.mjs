// scripts/geodata/countries/jp.mjs — Japan — CURATED-GEODATA-ASIA-1C
// admin1 codes verified via Stage 1 PPLA/PPLC inspection (2026-05-17).
// JP uses 2-digit numeric codes mapped alphabetically to prefecture names
// (NOT FIPS or ISO — GeoNames-internal alphabetical numbering).
export default {
    cc:              'jp',
    countryAr:       'اليابان',
    countryEn:       'Japan',
    defaultTimezone: 'Asia/Tokyo',

    geonamesUrl:  'https://download.geonames.org/export/dump/JP.zip',
    innerTxtName: 'JP.txt',

    bbox: { minLat: 23.5, maxLat: 46.5, minLng: 122.0, maxLng: 146.5 },

    // 47 prefectures verified — alphabetical-by-romanized-name numbering
    admin1ToRegion: {
        '01': { ar: 'آيتشي',            en: 'Aichi' },            // Nagoya
        '02': { ar: 'أكيتا',            en: 'Akita' },
        '03': { ar: 'آوموري',           en: 'Aomori' },
        '04': { ar: 'تشيبا',            en: 'Chiba' },
        '05': { ar: 'إيهيمي',           en: 'Ehime' },            // Matsuyama
        '06': { ar: 'فوكوي',            en: 'Fukui' },
        '07': { ar: 'فوكوكا',           en: 'Fukuoka' },
        '08': { ar: 'فوكوشيما',         en: 'Fukushima' },
        '09': { ar: 'غيفو',             en: 'Gifu' },
        '10': { ar: 'غونما',            en: 'Gunma' },            // Maebashi
        '11': { ar: 'هيروشيما',         en: 'Hiroshima' },
        '12': { ar: 'هوكايدو',          en: 'Hokkaido' },         // Sapporo
        '13': { ar: 'هيوغو',            en: 'Hyogo' },            // Kobe
        '14': { ar: 'إيباراكي',         en: 'Ibaraki' },          // Mito
        '15': { ar: 'إيشيكاوا',         en: 'Ishikawa' },         // Kanazawa
        '16': { ar: 'إيواتي',           en: 'Iwate' },            // Morioka
        '17': { ar: 'كاغاوا',           en: 'Kagawa' },           // Takamatsu
        '18': { ar: 'كاغوشيما',         en: 'Kagoshima' },
        '19': { ar: 'كاناغاوا',         en: 'Kanagawa' },         // Yokohama
        '20': { ar: 'كوتشي',            en: 'Kochi' },
        '21': { ar: 'كوماموتو',         en: 'Kumamoto' },
        '22': { ar: 'كيوتو',            en: 'Kyoto' },
        '23': { ar: 'ميي',              en: 'Mie' },              // Tsu
        '24': { ar: 'مياغي',            en: 'Miyagi' },           // Sendai
        '25': { ar: 'ميازاكي',          en: 'Miyazaki' },
        '26': { ar: 'ناغانو',           en: 'Nagano' },
        '27': { ar: 'ناغازاكي',         en: 'Nagasaki' },
        '28': { ar: 'نارا',             en: 'Nara' },
        '29': { ar: 'نييغاتا',          en: 'Niigata' },
        '30': { ar: 'أويتا',            en: 'Oita' },
        '31': { ar: 'أوكاياما',         en: 'Okayama' },
        '32': { ar: 'أوساكا',           en: 'Osaka' },
        '33': { ar: 'ساغا',             en: 'Saga' },
        '34': { ar: 'سايتاما',          en: 'Saitama' },
        '35': { ar: 'شيغا',             en: 'Shiga' },            // Otsu
        '36': { ar: 'شيمانه',           en: 'Shimane' },          // Matsue
        '37': { ar: 'شيزوكا',           en: 'Shizuoka' },
        '38': { ar: 'توتشيغي',          en: 'Tochigi' },          // Utsunomiya
        '39': { ar: 'توكوشيما',         en: 'Tokushima' },
        '40': { ar: 'طوكيو',            en: 'Tokyo' },            // PPLC
        '41': { ar: 'توتوري',           en: 'Tottori' },
        '42': { ar: 'توياما',           en: 'Toyama' },
        '43': { ar: 'واكاياما',         en: 'Wakayama' },
        '44': { ar: 'ياماغاتا',         en: 'Yamagata' },
        '45': { ar: 'ياماغوتشي',        en: 'Yamaguchi' },
        '46': { ar: 'ياماناشي',         en: 'Yamanashi' },        // Kofu
        '47': { ar: 'أوكيناوا',         en: 'Okinawa' }           // Naha
    },

    popMin: 200000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
