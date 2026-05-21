// scripts/geodata/_supported_local_lang_cities_fr_de_b_fast_apply.mjs
//
// SUPPORTED-LOCAL-LANG-CITIES-FR-DE-B-FAST — Sub-phase A Batch B of
// SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST.
//
// Adds 25 French + 25 German cities (Batch B), each with EXACTLY the
// three supported UI langs required for its country per place-data-
// maintenance-policy §2:
//
//   FR → names.{ar, en, fr}
//   DE → names.{ar, en, de}
//
// Includes Paris/Lille communes per user direction (Argenteuil/Montreuil/
// Roubaix/Tourcoing/Nanterre/Créteil/Courbevoie/Vitry-sur-Seine/Aulnay-
// sous-Bois/Saint-Denis/Boulogne-Billancourt/Saint-Maur) — these are
// separately-incorporated French communes with mayoral administration,
// not districts; the wave-A skip was conservative and the user has now
// explicitly listed them.
//
// Slug `saint-denis-fr` used defensively to disambiguate from possible
// future Saint-Denis (Réunion) entry, matching nice-fr/bharatpur-in
// convention.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preSupportedFrDeBFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-lang-cities-fr-de-b-fast-apply-report.json', import.meta.url);

const URDU_ONLY = /[یکگپچژٹڈڑںھہےۂ]/;
function isCleanArabic(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[؀-ۿ]/.test(s)) return false;
    if (/[ঀ-৿]|[A-Za-z]|[ऀ-ॿ]|[஀-௿]/.test(s)) return false;
    if (URDU_ONLY.test(s)) return false;
    return true;
}
function isCleanLatin(s) {
    if (!s || typeof s !== 'string') return false;
    if (!/[A-Za-z]/.test(s)) return false;
    if (/[؀-ۿ]|[ঀ-৿]/.test(s)) return false;
    return true;
}
function scriptGuard(value, lang) {
    if (lang === 'ar') return isCleanArabic(value);
    if (lang === 'en' || lang === 'fr' || lang === 'de') return isCleanLatin(value);
    return false;
}

// ────────────────────────────────────────────────────────────────────────
// FR — 25 cities (Batch B)
// ────────────────────────────────────────────────────────────────────────
const FR_CITIES = [
    { slug: 'montreuil',             geonameId: '2992090', lat: 48.86415, lng: 2.44322,  population: 111240, admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'مونتروي',           en: 'Montreuil',             fr: 'Montreuil' } },
    { slug: 'boulogne-billancourt',  geonameId: '3031137', lat: 48.83545, lng: 2.24128,  population: 108782, admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'بولونيا بيانكور',  en: 'Boulogne-Billancourt',  fr: 'Boulogne-Billancourt' } },
    { slug: 'argenteuil',            geonameId: '3037044', lat: 48.94788, lng: 2.24744,  population: 101475, admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'أرجنتاي',           en: 'Argenteuil',            fr: 'Argenteuil' } },
    { slug: 'roubaix',               geonameId: '2982681', lat: 50.69421, lng: 3.17456,  population: 99507,  admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',         names: { ar: 'روبيه',             en: 'Roubaix',               fr: 'Roubaix' } },
    { slug: 'tourcoing',             geonameId: '2972284', lat: 50.72391, lng: 3.16117,  population: 99160,  admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',         names: { ar: 'توركوان',           en: 'Tourcoing',             fr: 'Tourcoing' } },
    { slug: 'saint-denis-fr',        geonameId: '2980916', lat: 48.93564, lng: 2.35387,  population: 96128,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'سان دوني',         en: 'Saint-Denis',           fr: 'Saint-Denis' } },
    { slug: 'nanterre',              geonameId: '2990970', lat: 48.89198, lng: 2.20675,  population: 86719,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'نانتير',            en: 'Nanterre',              fr: 'Nanterre' } },
    { slug: 'courbevoie',            geonameId: '3023141', lat: 48.89672, lng: 2.25666,  population: 85158,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'كوربفوا',           en: 'Courbevoie',            fr: 'Courbevoie' } },
    { slug: 'creteil',               geonameId: '3022530', lat: 48.79266, lng: 2.46569,  population: 84833,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'كريتاي',            en: 'Creteil',               fr: 'Créteil' } },
    { slug: 'vitry-sur-seine',       geonameId: '2967849', lat: 48.78716, lng: 2.40332,  population: 81001,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'فيتري سور سين',    en: 'Vitry-sur-Seine',       fr: 'Vitry-sur-Seine' } },
    { slug: 'aulnay-sous-bois',      geonameId: '3036145', lat: 48.93814, lng: 2.49402,  population: 80615,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'أولناي سو بوا',   en: 'Aulnay-sous-Bois',      fr: 'Aulnay-sous-Bois' } },
    { slug: 'saint-maur-des-fosses', geonameId: '2978179', lat: 48.79395, lng: 2.49323,  population: 75402,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',        names: { ar: 'سان مور دي فوسي', en: 'Saint-Maur-des-Fosses', fr: 'Saint-Maur-des-Fossés' } },
    { slug: 'chambery',              geonameId: '3027422', lat: 45.56628, lng: 5.92079,  population: 61640,  admin1: '84', region: 'Auvergne-Rhone-Alpes',       regionAr: 'أوفيرن-رون-ألب',       names: { ar: 'شامبيري',           en: 'Chambery',              fr: 'Chambéry' } },
    { slug: 'troyes',                geonameId: '2971549', lat: 48.30073, lng: 4.08524,  population: 60785,  admin1: '44', region: 'Grand Est',                  regionAr: 'غران إست',             names: { ar: 'تروا',              en: 'Troyes',                fr: 'Troyes' } },
    { slug: 'lorient',               geonameId: '2997577', lat: 47.74817, lng: -3.37177, population: 58112,  admin1: '53', region: 'Bretagne',                   regionAr: 'بريتاني',              names: { ar: 'لوريان',            en: 'Lorient',               fr: 'Lorient' } },
    { slug: 'evreux',                geonameId: '3019265', lat: 49.02414, lng: 1.15082,  population: 57795,  admin1: '28', region: 'Normandie',                  regionAr: 'نورماندي',             names: { ar: 'إيفرو',             en: 'Evreux',                fr: 'Évreux' } },
    { slug: 'beauvais',              geonameId: '3034006', lat: 49.43333, lng: 2.08333,  population: 53393,  admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',         names: { ar: 'بوفيه',             en: 'Beauvais',              fr: 'Beauvais' } },
    { slug: 'arles',                 geonameId: '3036938', lat: 43.67681, lng: 4.63031,  population: 53431,  admin1: '93', region: "Provence-Alpes-Cote d'Azur", regionAr: 'بروفانس-ألب-كوت دازور', names: { ar: 'آرل',               en: 'Arles',                 fr: 'Arles' } },
    { slug: 'cholet',                geonameId: '3025053', lat: 47.05893, lng: -0.87974, population: 53160,  admin1: '52', region: 'Pays de la Loire',           regionAr: 'بيي دو لا لوار',       names: { ar: 'شوليه',             en: 'Cholet',                fr: 'Cholet' } },
    { slug: 'frejus',                geonameId: '3017253', lat: 43.43325, lng: 6.73555,  population: 53098,  admin1: '93', region: "Provence-Alpes-Cote d'Azur", regionAr: 'بروفانس-ألب-كوت دازور', names: { ar: 'فريجوس',            en: 'Frejus',                fr: 'Fréjus' } },
    { slug: 'narbonne',              geonameId: '2990919', lat: 43.18396, lng: 3.00141,  population: 50776,  admin1: '76', region: 'Occitanie',                  regionAr: 'أوكسيتاني',            names: { ar: 'ناربون',            en: 'Narbonne',              fr: 'Narbonne' } },
    { slug: 'laval-fr',              geonameId: '3005866', lat: 48.07247, lng: -0.77019, population: 50489,  admin1: '52', region: 'Pays de la Loire',           regionAr: 'بيي دو لا لوار',       names: { ar: 'لافال',             en: 'Laval',                 fr: 'Laval' } },
    { slug: 'annecy',                geonameId: '3037543', lat: 45.90878, lng: 6.12565,  population: 49232,  admin1: '84', region: 'Auvergne-Rhone-Alpes',       regionAr: 'أوفيرن-رون-ألب',       names: { ar: 'أنيسي',             en: 'Annecy',                fr: 'Annecy' } },
    { slug: 'grasse',                geonameId: '3014856', lat: 43.65783, lng: 6.92537,  population: 47581,  admin1: '93', region: "Provence-Alpes-Cote d'Azur", regionAr: 'بروفانس-ألب-كوت دازور', names: { ar: 'غراس',              en: 'Grasse',                fr: 'Grasse' } },
    { slug: 'bayonne',               geonameId: '3034475', lat: 43.49316, lng: -1.473,   population: 44396,  admin1: '75', region: 'Nouvelle-Aquitaine',         regionAr: 'نوفيل-أكيتاين',        names: { ar: 'بايون',             en: 'Bayonne',               fr: 'Bayonne' } }
];

// ────────────────────────────────────────────────────────────────────────
// DE — 25 cities (Batch B)
// ────────────────────────────────────────────────────────────────────────
const DE_CITIES = [
    { slug: 'zwickau',         geonameId: '2803560', lat: 50.72724, lng: 12.48839, population: 98796, admin1: '13', region: 'Sachsen',              regionAr: 'ساكسونيا',           names: { ar: 'تسفيكاو',         en: 'Zwickau',          de: 'Zwickau' } },
    { slug: 'kaiserslautern',  geonameId: '2894003', lat: 49.443,   lng: 7.77161,  population: 98732, admin1: '08', region: 'Rheinland-Pfalz',      regionAr: 'راينلاند-بفالتس',     names: { ar: 'كايزرسلاوترن',    en: 'Kaiserslautern',   de: 'Kaiserslautern' } },
    { slug: 'guetersloh',      geonameId: '2913366', lat: 51.90693, lng: 8.37853,  population: 96180, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'غوترسلوه',        en: 'Gutersloh',        de: 'Gütersloh' } },
    { slug: 'dueren',          geonameId: '2934486', lat: 50.80434, lng: 6.49299,  population: 93440, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'دورن',            en: 'Duren',            de: 'Düren' } },
    { slug: 'esslingen',       geonameId: '2928751', lat: 48.73961, lng: 9.30473,  population: 92390, admin1: '01', region: 'Baden-Wuerttemberg',    regionAr: 'بادن-فورتمبيرغ',      names: { ar: 'إسلينغن',         en: 'Esslingen',        de: 'Esslingen' } },
    { slug: 'tuebingen',       geonameId: '2820860', lat: 48.52266, lng: 9.05222,  population: 92322, admin1: '01', region: 'Baden-Wuerttemberg',    regionAr: 'بادن-فورتمبيرغ',      names: { ar: 'توبينغن',         en: 'Tubingen',         de: 'Tübingen' } },
    { slug: 'iserlohn',        geonameId: '2895669', lat: 51.37547, lng: 7.70281,  population: 91811, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'إيزرلون',         en: 'Iserlohn',         de: 'Iserlohn' } },
    { slug: 'witten',          geonameId: '2807363', lat: 51.44362, lng: 7.35258,  population: 91808, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'فيتن',            en: 'Witten',           de: 'Witten' } },
    { slug: 'ratingen',        geonameId: '2850174', lat: 51.29724, lng: 6.84929,  population: 91606, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'راتينغن',         en: 'Ratingen',         de: 'Ratingen' } },
    { slug: 'marl',            geonameId: '2873263', lat: 51.65671, lng: 7.09038,  population: 91398, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'مارل',            en: 'Marl',             de: 'Marl' } },
    { slug: 'luenen',          geonameId: '2875107', lat: 51.61634, lng: 7.52872,  population: 91009, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'لونن',            en: 'Lunen',            de: 'Lünen' } },
    { slug: 'giessen',         geonameId: '2920512', lat: 50.58727, lng: 8.67554,  population: 89179, admin1: '05', region: 'Hessen',                regionAr: 'هيسن',                names: { ar: 'غيسن',            en: 'Giessen',          de: 'Gießen' } },
    { slug: 'hanau',           geonameId: '2911007', lat: 50.13423, lng: 8.91418,  population: 88648, admin1: '05', region: 'Hessen',                regionAr: 'هيسن',                names: { ar: 'هاناو',           en: 'Hanau',            de: 'Hanau am Main' } },
    { slug: 'velbert',         geonameId: '2817724', lat: 51.33537, lng: 7.04348,  population: 87669, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'فيلبيرت',         en: 'Velbert',          de: 'Velbert' } },
    { slug: 'ludwigsburg',     geonameId: '2875392', lat: 48.89731, lng: 9.19161,  population: 87603, admin1: '01', region: 'Baden-Wuerttemberg',    regionAr: 'بادن-فورتمبيرغ',      names: { ar: 'لودفيغسبورغ',     en: 'Ludwigsburg',      de: 'Ludwigsburg' } },
    { slug: 'flensburg',       geonameId: '2926271', lat: 54.78805, lng: 9.43722,  population: 85838, admin1: '10', region: 'Schleswig-Holstein',    regionAr: 'شليسفيغ-هولشتاين',    names: { ar: 'فلنسبورغ',        en: 'Flensburg',        de: 'Flensburg' } },
    { slug: 'cottbus',         geonameId: '2939811', lat: 51.75769, lng: 14.32888, population: 84754, admin1: '11', region: 'Brandenburg',           regionAr: 'براندنبورغ',           names: { ar: 'كوتبوس',          en: 'Cottbus',          de: 'Cottbus' } },
    { slug: 'konstanz',        geonameId: '2885679', lat: 47.66033, lng: 9.17582,  population: 81275, admin1: '01', region: 'Baden-Wuerttemberg',    regionAr: 'بادن-فورتمبيرغ',      names: { ar: 'كونستانز',        en: 'Konstanz',         de: 'Konstanz' } },
    { slug: 'luedenscheid',    geonameId: '2875457', lat: 51.21977, lng: 7.6273,   population: 79386, admin1: '07', region: 'Nordrhein-Westfalen',  regionAr: 'نوردراين-فيستفالن',   names: { ar: 'لودنشايد',        en: 'Ludenscheid',      de: 'Lüdenscheid' } },
    { slug: 'marburg',         geonameId: '2873759', lat: 50.80904, lng: 8.77069,  population: 78895, admin1: '05', region: 'Hessen',                regionAr: 'هيسن',                names: { ar: 'ماربورغ',         en: 'Marburg',          de: 'Marburg an der Lahn' } },
    { slug: 'bayreuth',        geonameId: '2951825', lat: 49.94782, lng: 11.57893, population: 72940, admin1: '02', region: 'Bayern',                regionAr: 'بافاريا',              names: { ar: 'بايرويت',         en: 'Bayreuth',         de: 'Bayreuth' } },
    { slug: 'landshut',        geonameId: '2881485', lat: 48.52961, lng: 12.16179, population: 71863, admin1: '02', region: 'Bayern',                regionAr: 'بافاريا',              names: { ar: 'لاندسهوت',        en: 'Landshut',         de: 'Landshut' } },
    { slug: 'lueneburg',       geonameId: '2875115', lat: 53.25122, lng: 10.41548, population: 71260, admin1: '06', region: 'Niedersachsen',         regionAr: 'سكسونيا السفلى',       names: { ar: 'لونبورغ',         en: 'Luneburg',         de: 'Lüneburg' } },
    { slug: 'bamberg',         geonameId: '2952984', lat: 49.89873, lng: 10.90067, population: 70047, admin1: '02', region: 'Bayern',                regionAr: 'بافاريا',              names: { ar: 'بامبرغ',          en: 'Bamberg',          de: 'Bamberg' } },
    { slug: 'aschaffenburg',   geonameId: '2955272', lat: 49.97704, lng: 9.15214,  population: 68551, admin1: '02', region: 'Bayern',                regionAr: 'بافاريا',              names: { ar: 'أشافنبورغ',       en: 'Aschaffenburg',    de: 'Aschaffenburg' } }
];

// ─── Load + backup ─────────────────────────────────────────────────────
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
if (!existsSync(BACKUP_PATH)) { copyFileSync(CURATED_PATH, BACKUP_PATH); console.log('Backup written'); }
const orig = JSON.parse(readFileSync(BACKUP_PATH, 'utf8'));
function hashEntry(e) { return createHash('sha256').update(JSON.stringify(e)).digest('hex').slice(0, 16); }
const priorHashes = new Map();
for (const e of orig) priorHashes.set(e.slug, hashEntry(e));

const existingSlugs = new Set(curated.map(e => e.slug));
const existingSourceIds = new Set(curated.filter(e => e.sourceId).map(e => e.sourceId));
const existingEnNames = new Map();
const existingLocalNames = new Map();
for (const e of curated) {
    if (e.countryCode === 'fr' && e.names) {
        if (e.names.en) existingEnNames.set('fr|' + e.names.en, e.slug);
        if (e.names.fr) existingLocalNames.set('fr|' + e.names.fr, e.slug);
    }
    if (e.countryCode === 'de' && e.names) {
        if (e.names.en) existingEnNames.set('de|' + e.names.en, e.slug);
        if (e.names.de) existingLocalNames.set('de|' + e.names.de, e.slug);
    }
}

const NEW_CITIES = [
    ...FR_CITIES.map(c => ({ ...c, cc: 'fr', localLang: 'fr', countryAr: 'فرنسا', countryEn: 'France', timezone: 'Europe/Paris' })),
    ...DE_CITIES.map(c => ({ ...c, cc: 'de', localLang: 'de', countryAr: 'ألمانيا', countryEn: 'Germany', timezone: 'Europe/Berlin' }))
];

const dupSlugs = [], dupGids = [], dupEnNames = [], dupLocalNames = [], scriptFails = [], langKeyFails = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);
    if (existingEnNames.has(c.cc + '|' + c.names.en)) dupEnNames.push({ slug: c.slug, en: c.names.en, dupOf: existingEnNames.get(c.cc + '|' + c.names.en) });
    if (existingLocalNames.has(c.cc + '|' + c.names[c.localLang])) dupLocalNames.push({ slug: c.slug, local: c.names[c.localLang], dupOf: existingLocalNames.get(c.cc + '|' + c.names[c.localLang]) });
    const langs = Object.keys(c.names).sort();
    const expected = ['ar', 'en', c.localLang].sort();
    if (JSON.stringify(langs) !== JSON.stringify(expected)) langKeyFails.push({ slug: c.slug, langs, expected });
    for (const L of langs) {
        if (!scriptGuard(c.names[L], L)) scriptFails.push({ slug: c.slug, lang: L, value: c.names[L] });
    }
}
if (dupSlugs.length || dupGids.length || dupEnNames.length || dupLocalNames.length || scriptFails.length || langKeyFails.length) {
    console.error('PREFLIGHT FAIL:');
    if (dupSlugs.length) console.error('  dup slugs: ' + JSON.stringify(dupSlugs));
    if (dupGids.length) console.error('  dup gids: ' + JSON.stringify(dupGids));
    if (dupEnNames.length) console.error('  dup en-names: ' + JSON.stringify(dupEnNames));
    if (dupLocalNames.length) console.error('  dup local-names: ' + JSON.stringify(dupLocalNames));
    for (const f of langKeyFails) console.error('  lang-keys: ' + f.slug + ' = ' + JSON.stringify(f.langs) + ' expected ' + JSON.stringify(f.expected));
    for (const f of scriptFails) console.error('  script fail: ' + f.slug + '.names.' + f.lang + ' = "' + f.value + '"');
    process.exit(1);
}

for (const c of NEW_CITIES) {
    const entry = {
        slug: c.slug, type: 'city', countryCode: c.cc,
        lat: c.lat, lng: c.lng, timezone: c.timezone,
        names: c.names,
        admin: { countryAr: c.countryAr, countryEn: c.countryEn, regionAr: c.regionAr, regionEn: c.region, admin1Code: c.admin1 },
        priority: 70, source: 'geonames', sourceId: 'geonames:' + c.geonameId, verified: false
    };
    curated.push(entry);
}

let af = 0;
for (const e of orig) {
    const eNow = curated.find(x => x.slug === e.slug);
    if (!eNow) { console.error('MISSING: ' + e.slug); af++; continue; }
    if (priorHashes.get(e.slug) !== hashEntry(eNow)) { console.error('MUTATED: ' + e.slug); af++; }
}
if (curated.length !== orig.length + NEW_CITIES.length) { console.error('COUNT FAIL'); af++; }
const slugs = curated.map(e => e.slug);
if (slugs.filter((s,i,a) => a.indexOf(s) !== i).length) { console.error('DUP SLUG'); af++; }
const srcs = curated.map(e => e.sourceId).filter(Boolean);
if (srcs.filter((s,i,a) => a.indexOf(s) !== i).length) { console.error('DUP SRC'); af++; }
const FORBIDDEN = ['ur','bn','hi','ta','mr','te','kn','ml','gu','pa','or','as','sa','id','es','tr','ms'];
for (const c of NEW_CITIES) {
    const e = curated.find(x => x.slug === c.slug);
    if (!e) continue;
    for (const k of Object.keys(e.names)) {
        if (FORBIDDEN.includes(k)) { console.error('FORBIDDEN: ' + c.slug + '.names.' + k); af++; }
    }
}
if (af > 0) { console.error('APPLY ABORTED — ' + af + ' invariant fails'); process.exit(1); }

writeFileSync(CURATED_PATH, JSON.stringify(curated, null, 2) + '\n', 'utf8');
const frOrig = orig.filter(e => e.countryCode === 'fr').length;
const frNow = curated.filter(e => e.countryCode === 'fr').length;
const deOrig = orig.filter(e => e.countryCode === 'de').length;
const deNow = curated.filter(e => e.countryCode === 'de').length;
writeFileSync(REPORT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    citiesAdded: NEW_CITIES.length,
    frCountBefore: frOrig, frCountAfter: frNow,
    deCountBefore: deOrig, deCountAfter: deNow,
    totalCuratedBefore: orig.length, totalCuratedAfter: curated.length,
    frAddedSlugs: FR_CITIES.map(c => c.slug),
    deAddedSlugs: DE_CITIES.map(c => c.slug)
}, null, 2), 'utf8');

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' SUPPORTED-LOCAL-LANG-CITIES-FR-DE-B-FAST — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length + ' (FR ' + FR_CITIES.length + ' + DE ' + DE_CITIES.length + ')');
console.log('  FR count             : ' + frOrig + ' → ' + frNow);
console.log('  DE count             : ' + deOrig + ' → ' + deNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('═══════════════════════════════════════════════════════════════════════');
