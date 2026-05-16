// scripts/geodata/countries/us.mjs — United States — CURATED-GEODATA-AMERICAS-1A
// admin1ToRegion will be populated after Stage 1 PPLA/PPLC inspection.
// US uses 2-letter state codes (NY, CA, TX, FL, etc.).
export default {
    cc:              'us',
    countryAr:       'الولايات المتحدة',
    countryEn:       'United States',
    defaultTimezone: 'America/New_York',     // GeoNames per-place tz overrides

    geonamesUrl:  'https://download.geonames.org/export/dump/US.zip',
    innerTxtName: 'US.txt',

    // Continental US + Alaska + Hawaii + main territories (PR, VI, GU).
    // Continental: 24.5°-49.4°N, -124.7° to -66.9°W.
    // Alaska: 51°-71.4°N, -179° to -130°W.
    // Hawaii: 18.9°-22.2°N, -160° to -154.8°W.
    // Puerto Rico: 17.9°-18.5°N, -67.3° to -65.2°W.
    // Wide bbox covers all of these.
    bbox: { minLat: 17.0, maxLat: 72.0, minLng: -180.0, maxLng: -64.0 },

    // 50 states + DC + territories. To be verified post-Stage 1.
    // GeoNames uses 2-letter state codes:
    //   AL Alabama, AK Alaska, AZ Arizona, AR Arkansas, CA California,
    //   CO Colorado, CT Connecticut, DE Delaware, FL Florida, GA Georgia,
    //   HI Hawaii, ID Idaho, IL Illinois, IN Indiana, IA Iowa, KS Kansas,
    //   KY Kentucky, LA Louisiana, ME Maine, MD Maryland, MA Massachusetts,
    //   MI Michigan, MN Minnesota, MS Mississippi, MO Missouri, MT Montana,
    //   NE Nebraska, NV Nevada, NH New Hampshire, NJ New Jersey, NM New Mexico,
    //   NY New York, NC North Carolina, ND North Dakota, OH Ohio, OK Oklahoma,
    //   OR Oregon, PA Pennsylvania, RI Rhode Island, SC South Carolina,
    //   SD South Dakota, TN Tennessee, TX Texas, UT Utah, VT Vermont,
    //   VA Virginia, WA Washington, WV West Virginia, WI Wisconsin, WY Wyoming,
    //   DC District of Columbia, PR Puerto Rico, etc.
    admin1ToRegion: {
        'AL': { ar: 'ألاباما',           en: 'Alabama' },
        'AK': { ar: 'ألاسكا',            en: 'Alaska' },
        'AZ': { ar: 'أريزونا',           en: 'Arizona' },
        'AR': { ar: 'أركنساس',           en: 'Arkansas' },
        'CA': { ar: 'كاليفورنيا',        en: 'California' },
        'CO': { ar: 'كولورادو',          en: 'Colorado' },
        'CT': { ar: 'كونيتيكت',          en: 'Connecticut' },
        'DE': { ar: 'ديلاوير',           en: 'Delaware' },
        'DC': { ar: 'مقاطعة كولومبيا',   en: 'District of Columbia' },
        'FL': { ar: 'فلوريدا',           en: 'Florida' },
        'GA': { ar: 'جورجيا',            en: 'Georgia' },
        'HI': { ar: 'هاواي',             en: 'Hawaii' },
        'ID': { ar: 'أيداهو',            en: 'Idaho' },
        'IL': { ar: 'إلينوي',            en: 'Illinois' },
        'IN': { ar: 'إنديانا',           en: 'Indiana' },
        'IA': { ar: 'آيوا',              en: 'Iowa' },
        'KS': { ar: 'كانساس',            en: 'Kansas' },
        'KY': { ar: 'كنتاكي',            en: 'Kentucky' },
        'LA': { ar: 'لويزيانا',          en: 'Louisiana' },
        'ME': { ar: 'مين',               en: 'Maine' },
        'MD': { ar: 'ميريلاند',          en: 'Maryland' },
        'MA': { ar: 'ماساتشوستس',        en: 'Massachusetts' },
        'MI': { ar: 'ميشيغان',           en: 'Michigan' },
        'MN': { ar: 'مينيسوتا',          en: 'Minnesota' },
        'MS': { ar: 'مسيسيبي',           en: 'Mississippi' },
        'MO': { ar: 'ميزوري',            en: 'Missouri' },
        'MT': { ar: 'مونتانا',           en: 'Montana' },
        'NE': { ar: 'نبراسكا',           en: 'Nebraska' },
        'NV': { ar: 'نيفادا',            en: 'Nevada' },
        'NH': { ar: 'نيو هامبشير',       en: 'New Hampshire' },
        'NJ': { ar: 'نيو جيرسي',         en: 'New Jersey' },
        'NM': { ar: 'نيو مكسيكو',        en: 'New Mexico' },
        'NY': { ar: 'نيويورك',           en: 'New York' },
        'NC': { ar: 'كارولاينا الشمالية', en: 'North Carolina' },
        'ND': { ar: 'داكوتا الشمالية',   en: 'North Dakota' },
        'OH': { ar: 'أوهايو',            en: 'Ohio' },
        'OK': { ar: 'أوكلاهوما',         en: 'Oklahoma' },
        'OR': { ar: 'أوريغون',           en: 'Oregon' },
        'PA': { ar: 'بنسلفانيا',         en: 'Pennsylvania' },
        'RI': { ar: 'رود آيلاند',        en: 'Rhode Island' },
        'SC': { ar: 'كارولاينا الجنوبية', en: 'South Carolina' },
        'SD': { ar: 'داكوتا الجنوبية',   en: 'South Dakota' },
        'TN': { ar: 'تينيسي',            en: 'Tennessee' },
        'TX': { ar: 'تكساس',             en: 'Texas' },
        'UT': { ar: 'يوتاه',             en: 'Utah' },
        'VT': { ar: 'فيرمونت',           en: 'Vermont' },
        'VA': { ar: 'فرجينيا',           en: 'Virginia' },
        'WA': { ar: 'واشنطن',            en: 'Washington' },
        'WV': { ar: 'فرجينيا الغربية',   en: 'West Virginia' },
        'WI': { ar: 'ويسكونسن',          en: 'Wisconsin' },
        'WY': { ar: 'وايومنغ',           en: 'Wyoming' },
        'PR': { ar: 'بورتوريكو',         en: 'Puerto Rico' }
    },

    popMin: 100000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  []
};
