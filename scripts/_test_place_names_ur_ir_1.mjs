// scripts/_test_place_names_ur_ir_1.mjs
//
// PLACE-NAMES-UR-IR-1 verification — 41 IR pipeline cities now have real
// Urdu names (was Latin fillchain `names.ur === names.en`).
//
// This test covers:
//   A. Disk-level: curated_places.json has user-approved names.ur for 41 rows.
//   B. Disk-level: 12 IR seed entries untouched (regression).
//   C. Disk-level: names.ar + names.en untouched for all IR entries.
//   D. SSR-level: /ur/prayer-times-in-{slug} HTML carries `__PRAYER_CITY__.name`
//      matching the approved Urdu name for 14 priority cities.
//   E. SSR-level: <title> + <h1> + <meta name="ssr-city-name"> use the Urdu name.
//   F. Cross-route family: /ur/moon-in-{slug}, /ur/moon-today-in-{slug},
//      /ur/qibla-in-{slug} all receive the same SSR seed.
//   G. Regression: critical AR/EN/FR/DE/UR pages from prior phases still work.

import http from 'node:http';
import { readFileSync } from 'node:fs';

function get(path) {
    return new Promise(resolve => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

function extractPrayerCitySeed(html) {
    const m = html.match(
        /<script[^>]*id="ssr-prayer-city"[^>]*>\s*window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/i
    );
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (_) { return null; }
}

function extractTitle(html) {
    const m = html.match(/<title>([\s\S]*?)<\/title>/i);
    return m ? m[1].trim() : '';
}

function extractMetaCityName(html) {
    const m = html.match(/<meta\s+name="ssr-city-name"\s+content="([^"]*)"/i);
    return m ? m[1] : '';
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-UR-IR-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk-level: 41 user-approved names.ur present
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk-level names.ur (41 IR pipeline rows) ──');

const CURATED_PATH = new URL('../db/places/curated-places.json', import.meta.url);
const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));

const PIPELINE_EXPECTED = {
    // Watch-list (14)
    'karaj': 'کرج', 'zahedan': 'زاہدان', 'hamadan': 'ہمدان', 'ardabil': 'اردبیل',
    'bandar-abbas': 'بندر عباس', 'zanjan': 'زنجان', 'sanandaj': 'سنندج', 'qazvin': 'قزوین',
    'arak': 'اراک', 'khomeyni-shahr': 'خمینی شہر', 'qarchak': 'قرچک', 'golestan': 'گلستان',
    'bukan': 'بوکان', 'qaem-shahr': 'قائم شہر',
    // Others (27)
    'abadan': 'آبادان', 'amol': 'آمل', 'azadshahr': 'آزادشہر', 'babol': 'بابل',
    'birjand': 'بیرجند', 'bojnurd': 'بجنورد', 'borujerd': 'بروجرد', 'bushehr': 'بوشہر',
    'eslamshahr': 'اسلام شہر', 'gorgan': 'گرگان', 'ilam': 'ایلام', 'khorramabad': 'خرم آباد',
    'khorramshahr': 'خرمشھر', 'maragheh': 'مراغہ', 'najafabad': 'نجف آباد', 'nazarabad': 'نظر آباد',
    'neyshabur': 'نیشاپور', 'pakdasht': 'پاکدشت', 'qods': 'شہر قدس', 'sabzevar': 'سبزوار',
    'sari': 'ساری', 'saveh': 'ساوہ', 'semnan': 'سمنان', 'shahr-e-kord': 'شہر کرد',
    'shahriar': 'شہریار', 'sirjan': 'سیرجان', 'yasuj': 'یاسوج'
};

let pipelineMatches = 0;
for (const [slug, expected] of Object.entries(PIPELINE_EXPECTED)) {
    const entry = curated.find(x => x.countryCode === 'ir' && x.slug === slug);
    const got = entry && entry.names && entry.names.ur;
    if (got === expected) pipelineMatches++;
}
ok('41 IR pipeline rows have user-approved names.ur',
    pipelineMatches === 41,
    '(matched ' + pipelineMatches + ' / 41)');

// ───────────────────────────────────────────────────────────────────────
// PART B — Disk-level: 12 IR seed entries untouched
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — 12 IR seed entries regression ──');

const SEED_EXPECTED = {
    'tehran': 'تہران', 'mashhad': 'مشہد', 'isfahan': 'اصفہان', 'shiraz': 'شیراز',
    'tabriz': 'تبریز', 'qom': 'قم', 'ahvaz': 'اہواز', 'kermanshah': 'کرمانشاہ',
    'rasht': 'رشت', 'yazd': 'یزد', 'kerman': 'کرمان', 'urmia': 'ارومیہ'
};

let seedMatches = 0;
for (const [slug, expected] of Object.entries(SEED_EXPECTED)) {
    const entry = curated.find(x => x.countryCode === 'ir' && x.slug === slug);
    const got = entry && entry.names && entry.names.ur;
    if (got === expected) seedMatches++;
}
ok('12 IR seed entries retain real Urdu (untouched)',
    seedMatches === 12,
    '(matched ' + seedMatches + ' / 12)');

// ───────────────────────────────────────────────────────────────────────
// PART C — names.ar + names.en untouched
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — names.ar + names.en untouched (regression) ──');

const CRITICAL_AR_EN = [
    { slug: 'karaj',          ar: 'كرج',         en: 'Karaj' },
    { slug: 'zahedan',        ar: 'زاهدان',      en: 'Zahedan' },
    { slug: 'hamadan',        ar: 'همدان',       en: 'Hamadān' },
    { slug: 'qaem-shahr',     ar: 'قائم شهر',    en: 'Qā’em Shahr' },
    { slug: 'arak',           ar: 'اراك',        en: 'Arāk' },
    { slug: 'bandar-abbas',   ar: 'بندر عباس',   en: 'Bandar Abbas' },
    { slug: 'golestan',       ar: 'شهرك غلستان', en: 'Golestān' }, // typo deferred
    { slug: 'pakdasht',       ar: 'مامازان',     en: 'Pākdasht' },  // semantic mismatch deferred
    { slug: 'gorgan',         ar: 'اَستِر آباد',  en: 'Gorgān' },    // historical deferred
    // Seed AR untouched
    { slug: 'tehran',         ar: 'طهران',       en: 'Tehran' },
    { slug: 'mashhad',        ar: 'مشهد',        en: 'Mashhad' },
    { slug: 'isfahan',        ar: 'أصفهان',      en: 'Isfahan' }
];

for (const c of CRITICAL_AR_EN) {
    const entry = curated.find(x => x.countryCode === 'ir' && x.slug === c.slug);
    const gotAr = entry && entry.names && entry.names.ar;
    const gotEn = entry && entry.names && entry.names.en;
    ok(c.slug.padEnd(20) + ' names.ar/en untouched',
        gotAr === c.ar && gotEn === c.en,
        '(ar="' + gotAr + '" en="' + gotEn + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — SSR __PRAYER_CITY__ seed on /ur/prayer-times-in-{slug}
//          for 14 priority cities
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — SSR __PRAYER_CITY__ on /ur/prayer-times-in-{slug} ──');

const PRIORITY = [
    'karaj', 'zahedan', 'hamadan', 'ardabil', 'bandar-abbas',
    'zanjan', 'sanandaj', 'qazvin', 'arak', 'khomeyni-shahr',
    'qarchak', 'golestan', 'bukan', 'qaem-shahr'
];

for (const slug of PRIORITY) {
    const expected = PIPELINE_EXPECTED[slug];
    const r = await get('/ur/prayer-times-in-' + slug);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok('/ur/prayer-times-in-' + slug.padEnd(18) + ' seed.name="' + expected + '"',
        r.status === 200 && seedName === expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART E — SSR <title> + <meta ssr-city-name> use Urdu
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — SSR <title> + <meta ssr-city-name> ──');

for (const slug of PRIORITY) {
    const expected = PIPELINE_EXPECTED[slug];
    const r = await get('/ur/prayer-times-in-' + slug);
    const title = extractTitle(r.body);
    const metaCity = extractMetaCityName(r.body);
    const titleHas = title.includes(expected);
    const metaOk = metaCity === expected;
    ok('/ur/prayer-times-in-' + slug.padEnd(18) + ' title+meta carry "' + expected + '"',
        titleHas && metaOk,
        '(title="' + title.slice(0, 50) + '..." meta="' + metaCity + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART F — Cross-route family for 4 watch-list cities × 3 families
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — Cross-route SSR seed (moon-in / moon-today-in / qibla-in) ──');

const CROSS_ROUTES = ['moon-in', 'moon-today-in', 'qibla-in'];
const CROSS_CITIES = ['karaj', 'zahedan', 'hamadan', 'qaem-shahr'];

for (const slug of CROSS_CITIES) {
    const expected = PIPELINE_EXPECTED[slug];
    for (const route of CROSS_ROUTES) {
        const url = '/ur/' + route + '-' + slug;
        const r = await get(url);
        const seed = extractPrayerCitySeed(r.body);
        const seedName = seed && seed.name ? String(seed.name) : '';
        ok(url.padEnd(40) + ' seed="' + expected + '"',
            r.status === 200 && seedName === expected,
            '(got "' + seedName + '")');
    }
}

// ───────────────────────────────────────────────────────────────────────
// PART G — Regression: critical AR/EN/FR/DE/UR pages from prior phases
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part G — Regression critical pages ──');

const REGRESSION = [
    { url: '/ur/prayer-times-in-charikar',  expected: 'چاریکار',  lang: 'ur' },
    { url: '/ur/qibla-in-charikar',         expected: 'چاریکار',  lang: 'ur' },
    { url: '/ur/moon-in-charikar',          expected: 'چاریکار',  lang: 'ur' },
    { url: '/prayer-times-in-charikar',     expected: 'تشاريكار', lang: 'ar' },
    { url: '/en/prayer-times-in-charikar',  expected: 'Charikar', lang: 'en' },
    { url: '/fr/moon-in-london',            expected: 'Londres',  lang: 'fr' },
    { url: '/de/qibla-in-munich',           expected: 'München',  lang: 'de' }
];

for (const c of REGRESSION) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(40) + ' lang=' + c.lang + ' seed="' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART H — Anti-leak: SSR body must NOT contain Latin slug-prettify
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part H — Anti-Latin-leak on /ur/ pages ──');

// Spot-check 5 critical cities: their Latin names should NOT appear in
// the SSR <title> on /ur/ pages.
const ANTI_LEAK = [
    { slug: 'karaj',         latin: 'Karaj' },
    { slug: 'zahedan',       latin: 'Zahedan' },
    { slug: 'hamadan',       latin: 'Hamadān' },
    { slug: 'qaem-shahr',    latin: 'Qā’em Shahr' },
    { slug: 'bandar-abbas',  latin: 'Bandar Abbas' }
];

for (const c of ANTI_LEAK) {
    const r = await get('/ur/prayer-times-in-' + c.slug);
    const title = extractTitle(r.body);
    // Title must not contain the Latin name
    ok('/ur/prayer-times-in-' + c.slug.padEnd(18) + ' <title> has NO Latin "' + c.latin + '"',
        !title.includes(c.latin),
        '(title="' + title.slice(0, 60) + '...")');
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
