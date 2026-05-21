// scripts/geodata/_supported_local_lang_cities_fr_de_fast_apply.mjs
//
// SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST — Sub-phase A of
// SUPPORTED-LOCAL-LANG-CITIES-FINAL-FAST.
//
// Adds 25 French + 25 German cities. Each has EXACTLY the three
// supported UI langs required for its country per place-data-
// maintenance-policy §2:
//
//   FR cities → names.{ar, en, fr}
//   DE cities → names.{ar, en, de}
//
// No ur/bn/hi/ta/mr/te/kn/ml/gu/pa/or/as/sa/id/es/tr/ms keys — zero
// forbidden-lang leakage.
//
// Strict invariants (same pattern as ASIA-1G-ID / ASIA-1H-MY):
//   - per-slug SHA-256 byte-identity for all 2,760 pre-existing entries
//   - no dup slug / sourceId / geonameId across full curated set
//   - count delta = exactly +50
//   - all 150 (50×3) values pass per-lang script guards (strict ar)
//   - 0 mutations to IN/ID/MY/PK/BD/non-FR-DE entries
//
// Data sources:
//   - GeoNames raw: db/places/candidates/{fr,de}-geonames-raw.json
//   - name.en : GeoNames `name` field (ASCII form preserved as in
//     existing curated entries — e.g., Besancon NOT Besançon, Nimes
//     NOT Nîmes, Munster NOT Münster). For French/German exonyms:
//     Dunkirk/Dunkerque, Cologne/Köln (already curated), Munich/München
//     (already curated). New entries follow same convention.
//   - name.fr / name.de : GeoNames `name` field with accents preserved.
//   - name.ar : MANUAL standard French→Arabic / German→Arabic phonetic
//     transliteration (no MT, no Google Translate, no OpenAI/Anthropic,
//     no browser translation, no fillchain).
//
// admin1 codes (GeoNames empirical):
//   FR: 11=Île-de-France, 24=Centre-Val de Loire, 32=Hauts-de-France,
//       44=Grand Est, 52=Pays de la Loire, 53=Bretagne,
//       75=Nouvelle-Aquitaine, 76=Occitanie, 84=Auvergne-Rhône-Alpes,
//       93=Provence-Alpes-Côte d'Azur
//   DE: 01=Baden-Württemberg, 02=Bayern, 05=Hessen, 06=Niedersachsen,
//       07=NRW, 08=Rheinland-Pfalz, 09=Saarland, 11=Brandenburg,
//       12=Meck-Vorp, 13=Sachsen, 14=Sachsen-Anhalt, 15=Thüringen.

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const BACKUP_PATH  = new URL('../../db/places/curated-places.json.preSupportedFrDeFast.bak', import.meta.url);
const REPORT_PATH  = new URL('../../reports/supported-local-lang-cities-fr-de-fast-apply-report.json', import.meta.url);

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
// FR — 25 cities
// names.ar: manual:translit (French→Arabic standard phonetic)
// names.en: GeoNames `name`, ASCII form (no accents — matches existing
//   curated entries like besancon/saint-etienne where en strips accents)
// names.fr: GeoNames `name` with accents preserved
// ────────────────────────────────────────────────────────────────────────
const FR_CITIES = [
    { slug: 'strasbourg',      geonameId: '2973783', lat: 48.58392, lng: 7.74553,  population: 274845, admin1: '44', region: 'Grand Est',                  regionAr: 'غران إست',                            names: { ar: 'ستراسبورغ',     en: 'Strasbourg',     fr: 'Strasbourg' } },
    { slug: 'montpellier',     geonameId: '2992166', lat: 43.61093, lng: 3.87635,  population: 248252, admin1: '76', region: 'Occitanie',                  regionAr: 'أوكسيتاني',                           names: { ar: 'مونبلييه',        en: 'Montpellier',    fr: 'Montpellier' } },
    { slug: 'lille',           geonameId: '2998324', lat: 50.63391, lng: 3.05512,  population: 238695, admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',                         names: { ar: 'ليل',             en: 'Lille',          fr: 'Lille' } },
    { slug: 'reims',           geonameId: '2984114', lat: 49.26526, lng: 4.02853,  population: 196565, admin1: '44', region: 'Grand Est',                  regionAr: 'غران إست',                            names: { ar: 'ريمس',            en: 'Reims',          fr: 'Reims' } },
    { slug: 'angers',          geonameId: '3037656', lat: 47.47156, lng: -0.55202, population: 168279, admin1: '52', region: 'Pays de la Loire',           regionAr: 'بيي دو لا لوار',                      names: { ar: 'أنجيه',           en: 'Angers',         fr: 'Angers' } },
    { slug: 'nimes',           geonameId: '2990363', lat: 43.83665, lng: 4.35788,  population: 148236, admin1: '76', region: 'Occitanie',                  regionAr: 'أوكسيتاني',                           names: { ar: 'نيم',             en: 'Nimes',          fr: 'Nîmes' } },
    { slug: 'brest',           geonameId: '3030300', lat: 48.39029, lng: -4.48628, population: 144899, admin1: '53', region: 'Bretagne',                   regionAr: 'بريتاني',                             names: { ar: 'بريست',           en: 'Brest',          fr: 'Brest' } },
    { slug: 'amiens',          geonameId: '3037854', lat: 49.9,     lng: 2.3,      population: 143086, admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',                         names: { ar: 'أميان',           en: 'Amiens',         fr: 'Amiens' } },
    { slug: 'limoges',         geonameId: '2998286', lat: 45.83362, lng: 1.24759,  population: 141176, admin1: '75', region: 'Nouvelle-Aquitaine',         regionAr: 'نوفيل-أكيتاين',                       names: { ar: 'ليموج',           en: 'Limoges',        fr: 'Limoges' } },
    { slug: 'mulhouse',        geonameId: '2991214', lat: 47.75205, lng: 7.32866,  population: 111430, admin1: '44', region: 'Grand Est',                  regionAr: 'غران إست',                            names: { ar: 'مولوز',           en: 'Mulhouse',       fr: 'Mulhouse' } },
    { slug: 'avignon',         geonameId: '3035681', lat: 43.94834, lng: 4.80892,  population: 89769,  admin1: '93', region: "Provence-Alpes-Cote d'Azur", regionAr: 'بروفانس-ألب-كوت دازور',               names: { ar: 'أفينيون',         en: 'Avignon',        fr: 'Avignon' } },
    { slug: 'poitiers',        geonameId: '2986495', lat: 46.58261, lng: 0.34348,  population: 85960,  admin1: '75', region: 'Nouvelle-Aquitaine',         regionAr: 'نوفيل-أكيتاين',                       names: { ar: 'بواتييه',         en: 'Poitiers',       fr: 'Poitiers' } },
    { slug: 'versailles',      geonameId: '2969679', lat: 48.80359, lng: 2.13424,  population: 85416,  admin1: '11', region: 'Ile-de-France',              regionAr: 'إيل دو فرانس',                        names: { ar: 'فرساي',           en: 'Versailles',     fr: 'Versailles' } },
    { slug: 'pau',             geonameId: '2988358', lat: 43.31117, lng: -0.35583, population: 82697,  admin1: '75', region: 'Nouvelle-Aquitaine',         regionAr: 'نوفيل-أكيتاين',                       names: { ar: 'بو',              en: 'Pau',            fr: 'Pau' } },
    { slug: 'la-rochelle',     geonameId: '3006787', lat: 46.16308, lng: -1.15222, population: 76810,  admin1: '75', region: 'Nouvelle-Aquitaine',         regionAr: 'نوفيل-أكيتاين',                       names: { ar: 'لا روشيل',       en: 'La Rochelle',    fr: 'La Rochelle' } },
    { slug: 'antibes',         geonameId: '3037456', lat: 43.58127, lng: 7.12487,  population: 76393,  admin1: '93', region: "Provence-Alpes-Cote d'Azur", regionAr: 'بروفانس-ألب-كوت دازور',               names: { ar: 'أنتيب',           en: 'Antibes',        fr: 'Antibes' } },
    { slug: 'cannes',          geonameId: '3028808', lat: 43.55135, lng: 7.01275,  population: 74545,  admin1: '93', region: "Provence-Alpes-Cote d'Azur", regionAr: 'بروفانس-ألب-كوت دازور',               names: { ar: 'كان',             en: 'Cannes',         fr: 'Cannes' } },
    { slug: 'calais',          geonameId: '3029162', lat: 50.95194, lng: 1.85635,  population: 74433,  admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',                         names: { ar: 'كاليه',           en: 'Calais',         fr: 'Calais' } },
    { slug: 'beziers',         geonameId: '3032833', lat: 43.34122, lng: 3.21402,  population: 74081,  admin1: '76', region: 'Occitanie',                  regionAr: 'أوكسيتاني',                           names: { ar: 'بيزييه',          en: 'Beziers',        fr: 'Béziers' } },
    { slug: 'dunkirk',         geonameId: '3020686', lat: 51.0344,  lng: 2.37681,  population: 71287,  admin1: '32', region: 'Hauts-de-France',            regionAr: 'أو دو فرانس',                         names: { ar: 'دونكيرك',         en: 'Dunkirk',        fr: 'Dunkerque' } },
    { slug: 'bourges',         geonameId: '3031005', lat: 47.08333, lng: 2.4,      population: 67987,  admin1: '24', region: 'Centre-Val de Loire',        regionAr: 'سانتر-فال دو لوار',                   names: { ar: 'بورج',            en: 'Bourges',        fr: 'Bourges' } },
    { slug: 'saint-nazaire',   geonameId: '2977921', lat: 47.27506, lng: -2.2179,  population: 67054,  admin1: '52', region: 'Pays de la Loire',           regionAr: 'بيي دو لا لوار',                      names: { ar: 'سان نازير',      en: 'Saint-Nazaire',  fr: 'Saint-Nazaire' } },
    { slug: 'colmar',          geonameId: '3024297', lat: 48.08078, lng: 7.35584,  population: 65405,  admin1: '44', region: 'Grand Est',                  regionAr: 'غران إست',                            names: { ar: 'كولمار',          en: 'Colmar',         fr: 'Colmar' } },
    { slug: 'valence',         geonameId: '2971053', lat: 44.9256,  lng: 4.90956,  population: 63864,  admin1: '84', region: 'Auvergne-Rhone-Alpes',       regionAr: 'أوفيرن-رون-ألب',                      names: { ar: 'فالنس',           en: 'Valence',        fr: 'Valence' } },
    { slug: 'quimper',         geonameId: '2984701', lat: 47.99597, lng: -4.09795, population: 63849,  admin1: '53', region: 'Bretagne',                   regionAr: 'بريتاني',                             names: { ar: 'كيمبر',           en: 'Quimper',        fr: 'Quimper' } }
];

// ────────────────────────────────────────────────────────────────────────
// DE — 25 cities
// names.ar: manual:translit (German→Arabic standard phonetic)
// names.en: GeoNames `name`, ASCII form (matches existing dusseldorf
//   pattern — strip umlauts)
// names.de: GeoNames `name` with umlauts preserved
// ────────────────────────────────────────────────────────────────────────
const DE_CITIES = [
    { slug: 'dresden',           geonameId: '2935022', lat: 51.05089, lng: 13.73832, population: 564904, admin1: '13', region: 'Sachsen',              regionAr: 'ساكسونيا',                names: { ar: 'دريسدن',            en: 'Dresden',           de: 'Dresden' } },
    { slug: 'leipzig',           geonameId: '2879139', lat: 51.33962, lng: 12.37129, population: 504971, admin1: '13', region: 'Sachsen',              regionAr: 'ساكسونيا',                names: { ar: 'لايبزغ',            en: 'Leipzig',           de: 'Leipzig' } },
    { slug: 'muenster',          geonameId: '2867543', lat: 51.96236, lng: 7.62571,  population: 308258, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'مونستر',            en: 'Munster',           de: 'Münster' } },
    { slug: 'wiesbaden',         geonameId: '2809346', lat: 50.08601, lng: 8.24435,  population: 288850, admin1: '05', region: 'Hessen',               regionAr: 'هيسن',                   names: { ar: 'فيسبادن',           en: 'Wiesbaden',         de: 'Wiesbaden' } },
    { slug: 'braunschweig',      geonameId: '2945024', lat: 52.26594, lng: 10.52673, population: 244715, admin1: '06', region: 'Niedersachsen',        regionAr: 'سكسونيا السفلى',          names: { ar: 'براونشفايغ',        en: 'Brunswick',         de: 'Braunschweig' } },
    { slug: 'magdeburg',         geonameId: '2874545', lat: 52.13129, lng: 11.63189, population: 244329, admin1: '14', region: 'Sachsen-Anhalt',       regionAr: 'ساكسونيا-أنهالت',         names: { ar: 'ماغديبورغ',         en: 'Magdeburg',         de: 'Magdeburg' } },
    { slug: 'oberhausen',        geonameId: '2860410', lat: 51.47805, lng: 6.8625,   population: 219176, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'أوبرهاوزن',         en: 'Oberhausen',        de: 'Oberhausen' } },
    { slug: 'erfurt',            geonameId: '2929670', lat: 50.97734, lng: 11.03536, population: 218793, admin1: '15', region: 'Thueringen',           regionAr: 'تورينغن',                names: { ar: 'إرفورت',            en: 'Erfurt',            de: 'Erfurt' } },
    { slug: 'hagen',             geonameId: '2912621', lat: 51.36081, lng: 7.47168,  population: 198972, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'هاغن',              en: 'Hagen',             de: 'Hagen' } },
    { slug: 'rostock',           geonameId: '2844588', lat: 54.0887,  lng: 12.14049, population: 198293, admin1: '12', region: 'Mecklenburg-Vorpommern',regionAr: 'مكلنبورغ-فوربومرن',       names: { ar: 'روستوك',            en: 'Rostock',           de: 'Rostock' } },
    { slug: 'potsdam',           geonameId: '2852458', lat: 52.39886, lng: 13.06566, population: 184754, admin1: '11', region: 'Brandenburg',          regionAr: 'براندنبورغ',              names: { ar: 'بوتسدام',           en: 'Potsdam',           de: 'Potsdam' } },
    { slug: 'saarbruecken',      geonameId: '2842647', lat: 49.23262, lng: 7.00982,  population: 182971, admin1: '09', region: 'Saarland',             regionAr: 'سارلاند',                 names: { ar: 'ساربروكن',          en: 'Saarbrucken',       de: 'Saarbrücken' } },
    { slug: 'muelheim',          geonameId: '2867838', lat: 51.43218, lng: 6.87967,  population: 173050, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'مولهايم',           en: 'Mulheim',           de: 'Mülheim' } },
    { slug: 'leverkusen',        geonameId: '2878234', lat: 51.0303,  lng: 6.98432,  population: 162738, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'ليفركوزن',          en: 'Leverkusen',        de: 'Leverkusen' } },
    { slug: 'fuerth',            geonameId: '2923544', lat: 49.47593, lng: 10.98856, population: 132036, admin1: '02', region: 'Bayern',               regionAr: 'بافاريا',                 names: { ar: 'فورت',              en: 'Furth',             de: 'Fürth' } },
    { slug: 'recklinghausen',    geonameId: '2849647', lat: 51.61379, lng: 7.19738,  population: 122438, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'ريكلينغهاوزن',      en: 'Recklinghausen',    de: 'Recklinghausen' } },
    { slug: 'ingolstadt',        geonameId: '2895992', lat: 48.76508, lng: 11.42372, population: 120658, admin1: '02', region: 'Bayern',               regionAr: 'بافاريا',                 names: { ar: 'إنغولشتات',         en: 'Ingolstadt',        de: 'Ingolstadt' } },
    { slug: 'bottrop',           geonameId: '2945756', lat: 51.52392, lng: 6.9285,   population: 119909, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'بوتروب',            en: 'Bottrop',           de: 'Bottrop' } },
    { slug: 'offenbach',         geonameId: '2857807', lat: 50.10061, lng: 8.76647,  population: 119192, admin1: '05', region: 'Hessen',               regionAr: 'هيسن',                   names: { ar: 'أوفنباخ',           en: 'Offenbach',         de: 'Offenbach' } },
    { slug: 'koblenz',           geonameId: '2886946', lat: 50.35357, lng: 7.57883,  population: 107319, admin1: '08', region: 'Rheinland-Pfalz',      regionAr: 'راينلاند-بفالتس',         names: { ar: 'كوبلنز',            en: 'Koblenz',           de: 'Koblenz' } },
    { slug: 'siegen',            geonameId: '2832495', lat: 50.87481, lng: 8.02431,  population: 107242, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'زيغن',              en: 'Siegen',            de: 'Siegen' } },
    { slug: 'bergisch-gladbach', geonameId: '2950349', lat: 50.9856,  lng: 7.13298,  population: 106184, admin1: '07', region: 'Nordrhein-Westfalen',   regionAr: 'نوردراين-فيستفالن',       names: { ar: 'بيرغيش غلادباخ',   en: 'Bergisch Gladbach', de: 'Bergisch Gladbach' } },
    { slug: 'jena',              geonameId: '2895044', lat: 50.92878, lng: 11.5899,  population: 104712, admin1: '15', region: 'Thueringen',           regionAr: 'تورينغن',                names: { ar: 'يينا',              en: 'Jena',              de: 'Jena' } },
    { slug: 'gera',              geonameId: '2921232', lat: 50.88029, lng: 12.08187, population: 104659, admin1: '15', region: 'Thueringen',           regionAr: 'تورينغن',                names: { ar: 'غيرا',              en: 'Gera',              de: 'Gera' } },
    { slug: 'erlangen',          geonameId: '2929567', lat: 49.59099, lng: 11.00783, population: 102675, admin1: '02', region: 'Bayern',               regionAr: 'بافاريا',                 names: { ar: 'إرلانغن',           en: 'Erlangen',          de: 'Erlangen' } }
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
const existingEnNames = new Map(); // en-name → slug, for dedupe
const existingFrDeNames = new Map(); // local-name → slug, for dedupe
for (const e of curated) {
    if (e.countryCode === 'fr' && e.names) {
        if (e.names.en) existingEnNames.set('fr|' + e.names.en, e.slug);
        if (e.names.fr) existingFrDeNames.set('fr|' + e.names.fr, e.slug);
    }
    if (e.countryCode === 'de' && e.names) {
        if (e.names.en) existingEnNames.set('de|' + e.names.en, e.slug);
        if (e.names.de) existingFrDeNames.set('de|' + e.names.de, e.slug);
    }
}

// Pre-flight
const NEW_CITIES = [
    ...FR_CITIES.map(c => ({ ...c, cc: 'fr', localLang: 'fr', countryAr: 'فرنسا', countryEn: 'France', timezone: 'Europe/Paris' })),
    ...DE_CITIES.map(c => ({ ...c, cc: 'de', localLang: 'de', countryAr: 'ألمانيا', countryEn: 'Germany', timezone: 'Europe/Berlin' }))
];

const dupSlugs = [], dupGids = [], dupEnNames = [], dupLocalNames = [], scriptFails = [], langKeyFails = [];
for (const c of NEW_CITIES) {
    if (existingSlugs.has(c.slug)) dupSlugs.push(c.slug);
    if (existingSourceIds.has('geonames:' + c.geonameId)) dupGids.push(c.geonameId);
    // Name-based dedupe per country
    if (existingEnNames.has(c.cc + '|' + c.names.en)) dupEnNames.push({ slug: c.slug, en: c.names.en, dupOf: existingEnNames.get(c.cc + '|' + c.names.en) });
    if (existingFrDeNames.has(c.cc + '|' + c.names[c.localLang])) dupLocalNames.push({ slug: c.slug, local: c.names[c.localLang], dupOf: existingFrDeNames.get(c.cc + '|' + c.names[c.localLang]) });
    const langs = Object.keys(c.names).sort();
    const expected = ['ar', 'en', c.localLang].sort();
    if (JSON.stringify(langs) !== JSON.stringify(expected)) {
        langKeyFails.push({ slug: c.slug, langs, expected });
    }
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

// Insert
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

// Post-mutation invariants
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
console.log(' SUPPORTED-LOCAL-LANG-CITIES-FR-DE-FAST — APPLY OK');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('  Cities added         : ' + NEW_CITIES.length + ' (FR ' + FR_CITIES.length + ' + DE ' + DE_CITIES.length + ')');
console.log('  FR count             : ' + frOrig + ' → ' + frNow);
console.log('  DE count             : ' + deOrig + ' → ' + deNow);
console.log('  Total curated        : ' + orig.length + ' → ' + curated.length);
console.log('═══════════════════════════════════════════════════════════════════════');
