// scripts/geodata/countries/pk.mjs — Pakistan — CURATED-GEODATA-ASIA-1D-PK
//
// admin1 codes (GeoNames, 2-digit numeric — Pakistan's 4 provinces + 4
// federal territories). PROVISIONAL mapping — VERIFIED via Stage 1
// PPLC/PPLA inspection before approving the wave.
//
// persianSource: true — enables Stage 3.4 Persian + Urdu pre-gate (same
// module proven on IR + AF; Urdu chars ٹ ڈ ڑ ں ھ ہ ے ؤ are part of the
// PERSIAN_URDU regex set used by Stage 3.4 + Stage 3.5).
//
// popMin: 50,000 per user direction (preflight decision §5):
//   "PK has many medium cities 50-500k that are important regional
//    centers (Sahiwal 247k, Mingora 332k, Okara 358k, Mardan 358k).
//    popMin=100k would miss them. Geometric similarity with AF (36
//    cities @ popMin=100k from 40M-pop country → PK 240M needs
//    popMin=50k for similar density of ~35-55 cities)."
//
// PPLC + PPLA always included regardless of population.

export default {
    cc:              'pk',
    countryAr:       'باكستان',
    countryEn:       'Pakistan',
    defaultTimezone: 'Asia/Karachi',

    geonamesUrl:  'https://download.geonames.org/export/dump/PK.zip',
    innerTxtName: 'PK.txt',

    // BBox covers mainland Pakistan + AJK + Gilgit-Baltistan.
    bbox: { minLat: 23.0, maxLat: 37.5, minLng: 60.5, maxLng: 78.0 },

    // admin1 codes — PROVISIONAL (Pakistan's documented 8 first-level
    // divisions). Will be verified empirically via Stage 1 PPLC/PPLA
    // inspection and corrected as needed before clean-approve.
    //
    // Known provinces (4) + territories (4):
    //   Punjab (largest), Sindh (Karachi), KP (Peshawar), Balochistan (Quetta)
    //   Islamabad Capital Territory, Azad Kashmir, Gilgit-Baltistan,
    //   (former FATA now merged into KP since 2018)
    admin1ToRegion: {
        '01': { ar: 'أزاد كشمير',                en: 'Azad Kashmir' },                 // Muzaffarabad
        '02': { ar: 'بلوشستان',                  en: 'Balochistan' },                  // Quetta PPLA
        '03': { ar: 'خيبر بختونخوا',             en: 'Khyber Pakhtunkhwa' },           // Peshawar PPLA
        '04': { ar: 'البنجاب',                   en: 'Punjab' },                       // Lahore PPLA
        '05': { ar: 'السند',                     en: 'Sindh' },                        // Karachi PPLA
        '06': { ar: 'المناطق القبلية',           en: 'FATA' },                         // historical (pre-2018)
        '07': { ar: 'إقليم العاصمة إسلام آباد',  en: 'Islamabad Capital Territory' },  // Islamabad PPLC
        '08': { ar: 'كلكت بلتستان',              en: 'Gilgit-Baltistan' }              // Gilgit
    },

    // Initial settings per user spec:
    //   "popMin=50,000 + alwaysInclude PPLC + PPLA"
    popMin: 50000,
    alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'],
    extraReligious: [],
    extraNonPlace:  [],

    // Stage 3.4 Persian/Urdu pre-gate (enabled — Urdu uses the same
    // PERSIAN_CHAR_MAP as Persian/Pashto, plus the Urdu-specific letters
    // ٹ ڈ ڑ ں ھ ہ ے ؤ which Stage 3.4 + 3.5 already handle).
    persianSource: true
};
