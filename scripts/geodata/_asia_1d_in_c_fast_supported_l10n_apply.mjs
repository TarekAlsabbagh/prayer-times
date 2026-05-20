// scripts/geodata/_asia_1d_in_c_fast_supported_l10n_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-IN-C-FAST-SUPPORTED-L10N — Add 39 more IN cities with all 4
// supported UI langs (ar/en/ur/bn). No plan phase, no Hindi/Tamil/Marathi,
// no ranking change.
//
// User-decision 2026-05-20: continue fast-path IN expansion; this time
// include ur+bn from the start (combined batch+L10N).
//
// Sources (NO runtime translation, NO fillchain):
//   - ar: manual short Arabic transliteration (standard conventions)
//   - en: GeoNames raw English name
//   - ur: GeoNames raw alternateNames (Urdu) or Urdu Wikipedia canonical
//   - bn: GeoNames raw alternateNames (Bengali) or Bengali Wikipedia
// Manual transliteration only when raw is absent and Wikipedia not directly
// queryable — standard rules per established IN-B-L10N pattern.
//
// Mutates only db/places/curated-places.json (in-place, after backup).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

const CURATED = 'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json';
const BACKUP  = CURATED + '.preAsia1dInCFastL10n.bak';
const REPORT  = 'C:/Users/Tarek/Downloads/TIME PRAYER/reports/asia-1d-in-c-fast-supported-l10n-apply-report.md';

// ═══ 39 BATCH-C cities — ar+en+ur+bn ═════════════════════════════════════
// urSrc/bnSrc: KEEP_RAW (single raw canonical), PICK_RAW (multi raw → picked),
//              FIX_RAW (raw needed cleanup), WIKIPEDIA, MANUAL
const NEW_CITIES = [
    // 1M+ pop
    { slug: 'virar',           gid: 1253133, lat: 19.45587, lng: 72.81136, fc: 'PPL',   pop: 1222390, region: 'Maharashtra',     en: 'Virar',           ar: 'فيرار',           ur: 'ویرار',          bn: 'ভিরার',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },

    // 500k-700k
    { slug: 'puducherry',      gid: 1259425, lat: 11.93428, lng: 79.83356, fc: 'PPLA',  pop: 657209,  region: 'Puducherry',      en: 'Puducherry',      ar: 'بودوتشيري',       ur: 'پانڈیچری',         bn: 'পন্ডিচেরী',       urSrc: 'WIKIPEDIA', bnSrc: 'KEEP_RAW',  aliases: ['Pondicherry'] },
    { slug: 'amravati',        gid: 1278718, lat: 20.93333, lng: 77.75,    fc: 'PPLA2', pop: 647057,  region: 'Maharashtra',     en: 'Amravati',        ar: 'أمراواتي',         ur: 'امراوتی',         bn: 'অমরাবতী',         urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'cuttack',         gid: 1273780, lat: 20.46497, lng: 85.87927, fc: 'PPL',   pop: 610189,  region: 'Odisha',          en: 'Cuttack',         ar: 'كوتاك',            ur: 'کٹک',             bn: 'কটক',              urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW',  aliases: [] },
    { slug: 'sangli',          gid: 1257416, lat: 16.85438, lng: 74.56417, fc: 'PPL',   pop: 601214,  region: 'Maharashtra',     en: 'Sangli',          ar: 'سانغلي',           ur: 'سانگلی',           bn: 'সাঙ্গলি',          urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'bokaro',          gid: 1275362, lat: 23.6693,  lng: 86.15119, fc: 'PPLA2', pop: 564319,  region: 'Jharkhand',       en: 'Bokaro',          ar: 'بوكارو',           ur: 'بوکارو',           bn: 'বোকারো',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: ['Bokaro Steel City'] },
    { slug: 'nanded',          gid: 1261977, lat: 19.15535, lng: 77.30032, fc: 'PPL',   pop: 550564,  region: 'Maharashtra',     en: 'Nanded',          ar: 'ناندد',            ur: 'ناندیڑ',           bn: 'নান্দেড়',         urSrc: 'PICK_RAW',  bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'kolhapur',        gid: 1266285, lat: 16.69282, lng: 74.21813, fc: 'PPL',   pop: 549236,  region: 'Maharashtra',     en: 'Kolhapur',        ar: 'كولهابور',          ur: 'کولھاپور',          bn: 'কোলহাপুর',         urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'durgapur',        gid: 1272175, lat: 23.49997, lng: 87.32501, fc: 'PPL',   pop: 518872,  region: 'West Bengal',     en: 'Durgapur',        ar: 'دورغابور',          ur: 'درگاپور',           bn: 'দুর্গাপুর',        urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'siliguri',        gid: 1256525, lat: 26.71004, lng: 88.42851, fc: 'PPL',   pop: 515574,  region: 'West Bengal',     en: 'Siliguri',        ar: 'سيليغوري',          ur: 'سلیگوڑی',           bn: 'শিলিগুড়ি',         urSrc: 'WIKIPEDIA', bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'asansol',         gid: 1278314, lat: 23.68333, lng: 86.98333, fc: 'PPLA2', pop: 504271,  region: 'West Bengal',     en: 'Asansol',         ar: 'أسانسول',          ur: 'آسنسول',           bn: 'আসানসোল',          urSrc: 'WIKIPEDIA', bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'malegaon',        gid: 1264115, lat: 20.55,    lng: 74.53333, fc: 'PPL',   pop: 481228,  region: 'Maharashtra',     en: 'Malegaon',        ar: 'ماليغاون',          ur: 'مالیگاؤں',          bn: 'মালেগাঁও',         urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'kurnool',         gid: 1265491, lat: 15.83093, lng: 78.04358, fc: 'PPL',   pop: 460184,  region: 'Andhra Pradesh',  en: 'Kurnool',         ar: 'كورنول',           ur: 'کرنول',            bn: 'কুর্নল',           urSrc: 'PICK_RAW',  bnSrc: 'PICK_RAW',  aliases: [] },
    { slug: 'jhansi',          gid: 1269006, lat: 25.44811, lng: 78.56871, fc: 'PPL',   pop: 412927,  region: 'Uttar Pradesh',   en: 'Jhansi',          ar: 'جانسي',            ur: 'جھانسی',           bn: 'ঝাঁসি',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'agartala',        gid: 1279290, lat: 23.83603, lng: 91.27939, fc: 'PPLA',  pop: 400004,  region: 'Tripura',         en: 'Agartala',        ar: 'أغرتلا',           ur: 'اگرتلا',           bn: 'আগরতলা',           urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'kakinada',        gid: 1268561, lat: 16.96292, lng: 82.23764, fc: 'PPL',   pop: 384182,  region: 'Andhra Pradesh',  en: 'Kakinada',        ar: 'كاكينادا',          ur: 'کاکیناڈا',          bn: 'কাকিনাড়া',         urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'latur',           gid: 1265014, lat: 18.40817, lng: 76.58471, fc: 'PPLA3', pop: 382940,  region: 'Maharashtra',     en: 'Latur',           ar: 'لاتور',             ur: 'لاتور',             bn: 'লাতুর',            urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'rohtak',          gid: 1258076, lat: 28.89446, lng: 76.58932, fc: 'PPL',   pop: 374292,  region: 'Haryana',         en: 'Rohtak',          ar: 'روهتك',             ur: 'روہتک',             bn: 'রোহতক',            urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'bilaspur',        gid: 1275637, lat: 22.07975, lng: 82.13750, fc: 'PPL',   pop: 365579,  region: 'Chhattisgarh',    en: 'Bilaspur',        ar: 'بيلاسبور',          ur: 'بلاس پور',          bn: 'বিলাসপুর',         urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'muzaffarnagar',   gid: 1262332, lat: 29.47165, lng: 77.7085,  fc: 'PPLA2', pop: 349706,  region: 'Uttar Pradesh',   en: 'Muzaffarnagar',   ar: 'مظفر نغر',          ur: 'مظفر نگر',          bn: 'মুজাফরনগর',        urSrc: 'PICK_RAW',  bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'kadapa',          gid: 1273800, lat: 14.46667, lng: 78.81667, fc: 'PPL',   pop: 344893,  region: 'Andhra Pradesh',  en: 'Kadapa',          ar: 'كادابا',            ur: 'کڑپہ',              bn: 'কাড়পা',            urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'mathura',         gid: 1263364, lat: 27.5,     lng: 77.66667, fc: 'PPL',   pop: 330511,  region: 'Uttar Pradesh',   en: 'Mathura',         ar: 'ماثورا',            ur: 'متھرا',             bn: 'মথুরা',            urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'nizamabad',       gid: 1261258, lat: 18.67196, lng: 78.10079, fc: 'PPL',   pop: 311152,  region: 'Telangana',       en: 'Nizamabad',       ar: 'نظام آباد',         ur: 'نظام آباد',         bn: 'নিজামাবাদ',        urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'tumkur',          gid: 1254089, lat: 13.34199, lng: 77.10166, fc: 'PPL',   pop: 307359,  region: 'Karnataka',       en: 'Tumkur',          ar: 'تومكور',            ur: 'تمکور',             bn: 'তুমকুর',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: ['Tumakuru'] },
    { slug: 'firozabad',       gid: 1271885, lat: 27.15139, lng: 78.39517, fc: 'PPL',   pop: 306409,  region: 'Uttar Pradesh',   en: 'Firozabad',       ar: 'فيروز آباد',        ur: 'فیروز آباد',        bn: 'ফিরোজাবাদ',        urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'karnal',          gid: 1267708, lat: 29.6857,  lng: 76.9905,  fc: 'PPL',   pop: 302140,  region: 'Haryana',         en: 'Karnal',          ar: 'كارنال',            ur: 'کرنال',             bn: 'কারনাল',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'rampur',          gid: 1258599, lat: 28.81517, lng: 79.02531, fc: 'PPL',   pop: 296418,  region: 'Uttar Pradesh',   en: 'Rampur',          ar: 'رامبور',            ur: 'رام پور',           bn: 'রামপুর',           urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'panipat',         gid: 1260476, lat: 29.39091, lng: 76.96336, fc: 'PPL',   pop: 295970,  region: 'Haryana',         en: 'Panipat',         ar: 'بانيبات',           ur: 'پانی پت',           bn: 'পানিপথ',          urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'noida',           gid: 7279746, lat: 28.57003, lng: 77.32196, fc: 'PPL',   pop: 293908,  region: 'Uttar Pradesh',   en: 'Noida',           ar: 'نويدا',             ur: 'نوئیڈا',            bn: 'নোইদা',            urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'greater-noida',   gid: 6954929, lat: 28.49579, lng: 77.5358,  fc: 'PPL',   pop: 293908,  region: 'Uttar Pradesh',   en: 'Greater Noida',   ar: 'غريتر نويدا',       ur: 'گریٹر نوئیڈا',     bn: 'বৃহত্তর নয়ডা',     urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'aizawl',          gid: 1279186, lat: 23.72784, lng: 92.71761, fc: 'PPLA',  pop: 293416,  region: 'Mizoram',         en: 'Aizawl',          ar: 'أيزاول',           ur: 'آئزال',             bn: 'আইজল',             urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'karimnagar',      gid: 1267755, lat: 18.43521, lng: 79.12873, fc: 'PPLA2', pop: 289821,  region: 'Telangana',       en: 'Karimnagar',      ar: 'كريم نغر',          ur: 'کریم نگر',          bn: 'করিমনগর',          urSrc: 'WIKIPEDIA', bnSrc: 'WIKIPEDIA', aliases: [] },
    { slug: 'imphal',          gid: 1269771, lat: 24.81696, lng: 93.93827, fc: 'PPLA',  pop: 277196,  region: 'Manipur',         en: 'Imphal',          ar: 'إمفال',            ur: 'امفال',             bn: 'ইম্ফল',            urSrc: 'WIKIPEDIA', bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'rourkela',        gid: 1258315, lat: 22.20389, lng: 84.85364, fc: 'PPL',   pop: 273317,  region: 'Odisha',          en: 'Rourkela',        ar: 'روركيلا',           ur: 'رورکلا',           bn: 'রাউরকেলা',         urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'anantapur',       gid: 1278672, lat: 14.68152, lng: 77.60272, fc: 'PPL',   pop: 267161,  region: 'Andhra Pradesh',  en: 'Anantapur',       ar: 'أنانتابور',         ur: 'اننت پور',          bn: 'অনন্তপুর',          urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'shillong',        gid: 1256523, lat: 25.5788,  lng: 91.8933,  fc: 'PPLA',  pop: 143229,  region: 'Meghalaya',       en: 'Shillong',        ar: 'شيلونغ',           ur: 'شیلانگ',           bn: 'শিলং',             urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'gangtok',         gid: 1271631, lat: 27.32574, lng: 88.6116,  fc: 'PPLA',  pop: 100286,  region: 'Sikkim',          en: 'Gangtok',         ar: 'غانغتوك',           ur: 'گنگتوک',           bn: 'গ্যাংটক',          urSrc: 'PICK_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'kohima',          gid: 1266366, lat: 25.66667, lng: 94.11667, fc: 'PPLA',  pop: 99039,   region: 'Nagaland',        en: 'Kohima',          ar: 'كوهيما',            ur: 'کوہیما',           bn: 'কোহিমা',           urSrc: 'KEEP_RAW',  bnSrc: 'KEEP_RAW',  aliases: [] },
    { slug: 'itanagar',        gid: 1269655, lat: 27.10384, lng: 93.61991, fc: 'PPLA',  pop: 59490,   region: 'Arunachal Pradesh', en: 'Itanagar',     ar: 'إيتاناغار',         ur: 'ایٹا نگر',         bn: 'ইটানগর',          urSrc: 'WIKIPEDIA', bnSrc: 'KEEP_RAW',  aliases: [] },
];

// ─── Script guards ──────────────────────────────────────────────────────
const HAS_ARABIC_BLOCK    = /[؀-ۿݐ-ݿ]/;
const HAS_LATIN           = /[A-Za-z]/;
const DEVANAGARI          = /[ऀ-ॿ]/;
const BENGALI_BLOCK       = /[ঀ-৿]/;
const TAMIL               = /[஀-௿]/;
const GURMUKHI            = /[਀-੿]/;
const GUJARATI            = /[઀-૿]/;
const TELUGU_KANNADA      = /[ఀ-ೞ]/;
const MALAYALAM           = /[ഀ-ൿ]/;
const ASSAMESE_ONLY       = /[ৰৱ]/;
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;
const PERSIAN_URDU_LEAK   = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
const URDU_NUN_GHUNNA     = /[ں]/;

function isCleanArabic(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '').replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU_LEAK.test(stripped)) return false;
    if (HAS_LATIN.test(stripped))         return false;
    if (URDU_NUN_GHUNNA.test(stripped))   return false;
    if (SUSPICIOUS_NON_URDU.test(stripped)) return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

function isCleanUrdu(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s) || DEVANAGARI.test(s) || BENGALI_BLOCK.test(s) ||
        TAMIL.test(s) || GURMUKHI.test(s) || GUJARATI.test(s) ||
        TELUGU_KANNADA.test(s) || MALAYALAM.test(s)) return false;
    if (SUSPICIOUS_NON_URDU.test(s)) return false;
    return HAS_ARABIC_BLOCK.test(s);
}

function isCleanBengali(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s) || DEVANAGARI.test(s) || HAS_ARABIC_BLOCK.test(s) ||
        TAMIL.test(s) || GURMUKHI.test(s) || GUJARATI.test(s) ||
        TELUGU_KANNADA.test(s) || MALAYALAM.test(s)) return false;
    if (ASSAMESE_ONLY.test(s)) return false;
    return BENGALI_BLOCK.test(s);
}

function priorityForPop(pop) {
    if (pop >= 1_000_000) return 95;
    if (pop >= 500_000)   return 85;
    if (pop >= 250_000)   return 82;
    return 80;
}

const ALLOWED_LANGS = new Set(['ar','en','ur','bn']);

function main() {
    // Pre-flight
    const errors = [];
    const seenSlugs = new Set();
    const seenGids = new Set();
    for (const c of NEW_CITIES) {
        if (seenSlugs.has(c.slug)) errors.push('Dup slug: ' + c.slug);
        seenSlugs.add(c.slug);
        if (seenGids.has(c.gid)) errors.push('Dup gid: ' + c.gid);
        seenGids.add(c.gid);
        if (!isCleanArabic(c.ar))   errors.push(c.slug + ' ar="' + c.ar + '" fails Arabic guard');
        if (!isCleanUrdu(c.ur))     errors.push(c.slug + ' ur="' + c.ur + '" fails Urdu guard');
        if (!isCleanBengali(c.bn))  errors.push(c.slug + ' bn="' + c.bn + '" fails Bengali guard');
        if (!c.en) errors.push(c.slug + ' missing en');
        if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) errors.push(c.slug + ' invalid coords');
    }
    if (NEW_CITIES.length < 30 || NEW_CITIES.length > 40) {
        errors.push('NEW_CITIES count out of bounds: ' + NEW_CITIES.length);
    }
    if (errors.length) {
        console.error('[apply] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] pre-flight OK — ' + NEW_CITIES.length + ' cities validated (ar+en+ur+bn)');

    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    if (!fs.existsSync(BACKUP)) {
        fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');
        console.log('[apply] backup written:', BACKUP);
    }

    const ORIGINAL_TOTAL = curated.length;

    // Cross-collision
    const allSlugs = new Set(curated.map(e => e.slug));
    const allGids = new Set();
    for (const e of curated) {
        if (typeof e.sourceId === 'string' && e.sourceId.startsWith('geonames:')) {
            allGids.add(Number(e.sourceId.slice(9)));
        }
    }
    for (const c of NEW_CITIES) {
        if (allSlugs.has(c.slug)) errors.push('SLUG-COLLISION: ' + c.slug);
        if (allGids.has(c.gid))   errors.push('GID-COLLISION: ' + c.gid + ' (' + c.slug + ')');
    }
    if (errors.length) {
        console.error('[apply] FAILED cross-collision:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[apply] cross-collision OK');

    // Snapshot all existing entries
    const preStateHash = curated
        .map(e => e.slug + '|' + JSON.stringify(e))
        .sort().join('\n');

    // Add new entries
    for (const c of NEW_CITIES) {
        const entry = {
            slug: c.slug,
            type: 'city',
            countryCode: 'in',
            lat: c.lat,
            lng: c.lng,
            timezone: 'Asia/Kolkata',
            names: { ar: c.ar, en: c.en, ur: c.ur, bn: c.bn },
            admin: { countryAr: 'الهند', countryEn: 'India' },
            priority: priorityForPop(c.pop),
            source: 'curated',
            sourceId: 'geonames:' + c.gid,
            verified: true,
        };
        if (c.region) entry.admin.regionEn = c.region;
        if (Array.isArray(c.aliases) && c.aliases.length) entry.aliases = { en: c.aliases };
        // Lang policy check
        for (const k of Object.keys(entry.names)) {
            if (!ALLOWED_LANGS.has(k)) {
                console.error('[apply] FAILED — forbidden lang ' + k + ' on ' + c.slug);
                process.exit(1);
            }
        }
        curated.push(entry);
    }

    // Post-apply assertions
    const expectedTotal = ORIGINAL_TOTAL + NEW_CITIES.length;
    if (curated.length !== expectedTotal) {
        console.error('[apply] FAILED — total count mismatch');
        process.exit(1);
    }
    const newSlugSet = new Set(NEW_CITIES.map(c => c.slug));
    const postNonNewHash = curated
        .filter(e => !newSlugSet.has(e.slug))
        .map(e => e.slug + '|' + JSON.stringify(e))
        .sort().join('\n');
    if (preStateHash !== postNonNewHash) {
        console.error('[apply] FAILED — pre-existing entries hash differs');
        process.exit(1);
    }
    console.log('[apply] byte-identity OK — all ' + ORIGINAL_TOTAL + ' pre-existing unchanged');

    // Check no duplicate slugs / sourceIds
    const dupCheck = new Set();
    for (const e of curated) {
        if (dupCheck.has(e.slug)) { console.error('FAIL dup slug ' + e.slug); process.exit(1); }
        dupCheck.add(e.slug);
    }
    const sidCheck = new Set();
    for (const e of curated) {
        if (typeof e.sourceId === 'string') {
            if (sidCheck.has(e.sourceId)) { console.error('FAIL dup sid ' + e.sourceId); process.exit(1); }
            sidCheck.add(e.sourceId);
        }
    }
    // New entries: only ar/en/ur/bn
    let langFails = 0;
    for (const c of NEW_CITIES) {
        const e = curated.find(x => x.slug === c.slug);
        const langs = Object.keys(e.names || {}).sort();
        if (JSON.stringify(langs) !== JSON.stringify(['ar','bn','en','ur'])) {
            console.error('  ✗ ' + c.slug + ' langs=' + langs.join(','));
            langFails++;
        }
    }
    if (langFails > 0) process.exit(1);

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('[apply] wrote curated-places.json');

    // Audit report
    const L = [];
    L.push('# ASIA-1D-IN-C-FAST-SUPPORTED-L10N — Apply audit');
    L.push('');
    L.push('**Run at**: ' + new Date().toISOString());
    L.push('**Cities added**: ' + NEW_CITIES.length);
    L.push('**Total curated**: ' + ORIGINAL_TOTAL + ' → ' + curated.length);
    L.push('**IN count**: ' + (curated.filter(e => e.countryCode === 'in').length - NEW_CITIES.length) +
            ' → ' + curated.filter(e => e.countryCode === 'in').length);
    L.push('**Lang policy**: ar + en + ur + bn (4 supported UI langs)');
    L.push('');
    L.push('## Cities added');
    L.push('');
    L.push('| # | slug | gid | en | ar | ur | bn | priority | ur src | bn src |');
    L.push('| ---: | --- | ---: | --- | --- | --- | --- | ---: | --- | --- |');
    let i = 1;
    for (const c of NEW_CITIES) {
        L.push('| ' + (i++) + ' | `' + c.slug + '` | ' + c.gid + ' | ' + c.en + ' | ' + c.ar +
               ' | ' + c.ur + ' | ' + c.bn + ' | ' + priorityForPop(c.pop) + ' | ' + c.urSrc + ' | ' + c.bnSrc + ' |');
    }
    L.push('');
    fs.writeFileSync(REPORT, L.join('\n'));
    console.log('[apply] wrote audit:', REPORT);

    console.log('');
    console.log('═══ ASIA-1D-IN-C-FAST-SUPPORTED-L10N — Summary ═══');
    console.log('  Added: ' + NEW_CITIES.length);
    console.log('  Total: ' + ORIGINAL_TOTAL + ' → ' + curated.length);
    console.log('  IN:    ' + (curated.filter(e => e.countryCode === 'in').length - NEW_CITIES.length) +
                ' → ' + curated.filter(e => e.countryCode === 'in').length);
}

main();
