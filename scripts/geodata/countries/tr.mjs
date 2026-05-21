// scripts/geodata/countries/tr.mjs — Turkey — SUPPORTED-LOCAL-LANG-CITIES-TR-PREFLIGHT-1
//
// admin1 codes (GeoNames, 2-digit numeric — Turkey's 81 provinces "il").
// PROVISIONAL mapping based on standard ISO 3166-2:TR ordering.
// To be VERIFIED empirically via Stage 1 PPLC/PPLA inspection before any
// apply wave runs.
//
// persianSource: false — Turkish uses Latin script with diacritics
// (İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü). No Persian/Arabic source content; no
// Stage 3.4 PERSIAN_CHAR_MAP normalization needed for names.tr. Stage
// 3.5 isCleanArabic still gates `names.ar` (independent).

export default {
    cc:              'tr',
    countryAr:       'تركيا',
    countryEn:       'Turkey',
    defaultTimezone: 'Europe/Istanbul',

    geonamesUrl:  'https://download.geonames.org/export/dump/TR.zip',
    innerTxtName: 'TR.txt',

    // BBox covers Turkey mainland (Anatolia + East Thrace).
    // Turkey: 35.8°N to 42.1°N, 25.6°E to 44.8°E.
    bbox: { minLat: 35.7, maxLat: 42.2, minLng: 25.5, maxLng: 44.9 },

    // admin1 codes — PROVISIONAL ISO 3166-2:TR alphabetical ordering.
    // 81 provinces (il). Most use 01-81 with gaps. To verify empirically
    // via Stage 1 inspection.
    admin1ToRegion: {
        '01': { ar: 'أضنة',         en: 'Adana' },
        '02': { ar: 'أديامان',      en: 'Adıyaman' },
        '03': { ar: 'أفيون قره حصار', en: 'Afyonkarahisar' },
        '04': { ar: 'أغري',         en: 'Ağrı' },
        '05': { ar: 'أماسيا',        en: 'Amasya' },
        '06': { ar: 'أنقرة',        en: 'Ankara' },
        '07': { ar: 'أنطاليا',       en: 'Antalya' },
        '08': { ar: 'أرتفين',       en: 'Artvin' },
        '09': { ar: 'آيدن',         en: 'Aydın' },
        '10': { ar: 'باليكسير',     en: 'Balıkesir' },
        '11': { ar: 'بيليجيك',      en: 'Bilecik' },
        '12': { ar: 'بينغول',       en: 'Bingöl' },
        '13': { ar: 'بتليس',        en: 'Bitlis' },
        '14': { ar: 'بولو',         en: 'Bolu' },
        '15': { ar: 'بوردور',       en: 'Burdur' },
        '16': { ar: 'بورصة',        en: 'Bursa' },
        '17': { ar: 'تشاناك قلعة',   en: 'Çanakkale' },
        '18': { ar: 'تشانكيري',     en: 'Çankırı' },
        '19': { ar: 'تشوروم',       en: 'Çorum' },
        '20': { ar: 'دنيزلي',       en: 'Denizli' },
        '21': { ar: 'ديار بكر',     en: 'Diyarbakır' },
        '22': { ar: 'أدرنة',        en: 'Edirne' },
        '23': { ar: 'إلازيغ',       en: 'Elazığ' },
        '24': { ar: 'أرزنجان',      en: 'Erzincan' },
        '25': { ar: 'أرضروم',       en: 'Erzurum' },
        '26': { ar: 'إسكي شهر',    en: 'Eskişehir' },
        '27': { ar: 'غازي عنتاب',   en: 'Gaziantep' },
        '28': { ar: 'غيرسون',       en: 'Giresun' },
        '29': { ar: 'غوموش هاني',   en: 'Gümüşhane' },
        '30': { ar: 'هكاري',        en: 'Hakkari' },
        '31': { ar: 'هاتاي',        en: 'Hatay' },
        '32': { ar: 'إسبارطة',      en: 'Isparta' },
        '33': { ar: 'مرسين',        en: 'Mersin' },
        '34': { ar: 'إسطنبول',      en: 'Istanbul' },
        '35': { ar: 'إزمير',        en: 'İzmir' },
        '36': { ar: 'قارص',         en: 'Kars' },
        '37': { ar: 'قسطموني',      en: 'Kastamonu' },
        '38': { ar: 'قيصري',        en: 'Kayseri' },
        '39': { ar: 'قيرق لار إيلي', en: 'Kırklareli' },
        '40': { ar: 'قرشهر',        en: 'Kırşehir' },
        '41': { ar: 'كوجالي',       en: 'Kocaeli' },
        '42': { ar: 'قونية',        en: 'Konya' },
        '43': { ar: 'كوتاهيا',      en: 'Kütahya' },
        '44': { ar: 'ملاطية',       en: 'Malatya' },
        '45': { ar: 'مانيسا',       en: 'Manisa' },
        '46': { ar: 'كهرمان مرعش',  en: 'Kahramanmaraş' },
        '47': { ar: 'ماردين',       en: 'Mardin' },
        '48': { ar: 'موغلا',        en: 'Muğla' },
        '49': { ar: 'موش',          en: 'Muş' },
        '50': { ar: 'نوشهر',        en: 'Nevşehir' },
        '51': { ar: 'نيغدة',        en: 'Niğde' },
        '52': { ar: 'أوردو',        en: 'Ordu' },
        '53': { ar: 'ريزة',         en: 'Rize' },
        '54': { ar: 'سكاريا',       en: 'Sakarya' },
        '55': { ar: 'سامسون',       en: 'Samsun' },
        '56': { ar: 'سيرت',         en: 'Siirt' },
        '57': { ar: 'سينوب',        en: 'Sinop' },
        '58': { ar: 'سيواس',        en: 'Sivas' },
        '59': { ar: 'تكيرداغ',      en: 'Tekirdağ' },
        '60': { ar: 'توكات',        en: 'Tokat' },
        '61': { ar: 'طرابزون',      en: 'Trabzon' },
        '62': { ar: 'تونجلي',       en: 'Tunceli' },
        '63': { ar: 'شانلي أورفا',  en: 'Şanlıurfa' },
        '64': { ar: 'أوشاك',        en: 'Uşak' },
        '65': { ar: 'فان',          en: 'Van' },
        '66': { ar: 'يوزغات',       en: 'Yozgat' },
        '67': { ar: 'زونغولداك',    en: 'Zonguldak' },
        '68': { ar: 'أكساراي',      en: 'Aksaray' },
        '69': { ar: 'بايبورت',      en: 'Bayburt' },
        '70': { ar: 'كرامان',       en: 'Karaman' },
        '71': { ar: 'قيريق قلعة',   en: 'Kırıkkale' },
        '72': { ar: 'باتمان',       en: 'Batman' },
        '73': { ar: 'شرناق',        en: 'Şırnak' },
        '74': { ar: 'بارتن',        en: 'Bartın' },
        '75': { ar: 'أرضاحان',      en: 'Ardahan' },
        '76': { ar: 'إيغدير',       en: 'Iğdır' },
        '77': { ar: 'يالوفا',       en: 'Yalova' },
        '78': { ar: 'كارابوك',      en: 'Karabük' },
        '79': { ar: 'كيليس',        en: 'Kilis' },
        '80': { ar: 'عثمانية',      en: 'Osmaniye' },
        '81': { ar: 'دوزجة',        en: 'Düzce' }
    },

    // Turkey population ~85M, many medium cities 100k-1M. popMin=100k for
    // top-tier (matches FR/DE+).
    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  [],

    // Stage 3.4 Persian/Urdu pre-gate — DISABLED for Turkish sources.
    // Turkish uses Latin script with diacritics, no Persian/Arabic
    // chars in `name` column. names.ar gating still applies in Stage 3.5.
    persianSource: false
};
