// scripts/_test_place_names_template_consistency_all_langs_fix_1.mjs
//
// PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 verification.
//
// Background: PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1 (`5135087`) fixed
// the 5 template surfaces on /ur/ pages, but only for absence-langs
// (ar/ur/bn) via PT-LANG-GUARD-2/3/4. Latin-script langs
// (fr/de/tr/id/es/ms) still had a cold-load FOUC: `getCurrentCityLabel()`
// and `getDisplayCity()` consulted `currentLocalizedName` (Nominatim
// async) → `_LOCALIZED_CITY_MAPS[lang]` (~30-city dict) →
// `currentEnglishName` (Latin English). For `/fr/london` the user
// would see "London" briefly until Nominatim returned "Londres".
//
// Fix: Tier-0 (PT-LANG-GUARD-5) at the top of BOTH functions —
// when the URL slug matches `window.__PRAYER_CITY__.slug` AND
// `__PRAYER_CITY__.name` is non-empty, return it directly.
// - For Latin-script langs: always trust the seed (curated name OR
//   fillchain English — both are Latin-acceptable).
// - For absence-langs (ar/ur/bn): only honor the seed when non-Latin;
//   otherwise fall through to PT-LANG-GUARD-2/3 (existing guards).
//
// This test covers:
//   A. Disk source markers (PT-LANG-GUARD-5 present in both functions).
//   B. SSR `__PRAYER_CITY__.name` carries the page-lang-correct name
//      for 8 representative URLs spanning AR/UR/BN/EN + FR/DE/TR/ES.
//   C. AR/UR regression: critical cities still SSR-deliver proper script.
//   D. CRITICAL anti-regression: /ur/charikar must STILL serve چاریکار,
//      /prayer-times-in-charikar must STILL serve تشاريكار.
//
// Pre-req: `node server.js` on localhost:8080.

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

function extractMeta(html, name) {
    const re = new RegExp('<meta\\s+name="' + name + '"\\s+content="([^"]*)"', 'i');
    const m = html.match(re);
    return m ? m[1] : '';
}

function extractPrayerCitySeed(html) {
    const m = html.match(
        /<script[^>]*id="ssr-prayer-city"[^>]*>\s*window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/i
    );
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (_) { return null; }
}

function hasLatin(s)  { return /[A-Za-z]/.test(s || ''); }
function hasArabic(s) { return /[؀-ۿ]/.test(s || ''); }

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk source markers: PT-LANG-GUARD-5 in both functions
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — js/app.js disk source markers ──');

const APP_JS_PATH = new URL('../js/app.js', import.meta.url);
const diskSrc = readFileSync(APP_JS_PATH, 'utf8');

// Both functions should contain the new Tier-0 marker
const fixMarker = diskSrc.includes('PT-LANG-GUARD-5')
    && diskSrc.includes('PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1');
ok('Tier-0 marker (PT-LANG-GUARD-5) present in js/app.js',
    fixMarker);

// Both functions must have the slug-match + __PRAYER_CITY__.name return
const getDisplayCityIdx = diskSrc.indexOf('function getDisplayCity()');
const getCurrentCityLabelIdx = diskSrc.indexOf('function getCurrentCityLabel()');
// PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 added a __QIBLA_CITY__
// Tier-0 BEFORE the __PRAYER_CITY__ block, expanding both function
// bodies. Use a larger substring window (or whole source) and accept
// either seed reference.
const getDisplayCityBody = diskSrc.substring(
    getDisplayCityIdx, getDisplayCityIdx + 5000
);
const getCurrentCityLabelBody = diskSrc.substring(
    getCurrentCityLabelIdx, getCurrentCityLabelIdx + 5000
);

const inGDC = /_slugM\[1\]\s*===\s*_pc\.slug/.test(getDisplayCityBody)
           && /return\s+_pc\.name/.test(getDisplayCityBody);
ok('getDisplayCity() Tier-0 returns __PRAYER_CITY__.name on slug match',
    inGDC);

const inGCCL = /_slugM\[1\]\s*===\s*_pc\.slug/.test(getCurrentCityLabelBody)
            && /return\s+_strip\(_pc\.name\)/.test(getCurrentCityLabelBody);
ok('getCurrentCityLabel() Tier-0 returns _strip(__PRAYER_CITY__.name) on slug match',
    inGCCL);

// SUPERSEDED by CITY-NAME-FALLBACK-CONSISTENCY-1 (2026-05-20): the
// `_isAbsenceLang` + `_seedHasLatin` fall-through that this assertion
// originally required is now DELIBERATELY REMOVED. After CITY-NAME-SEO-
// FALLBACK-POLICY-1 added script-validation inside the server's central
// helper, the `__PRAYER_CITY__.name` seed is guaranteed to be either a
// real native value OR the canonical names.en fallback — both
// authoritative. Letting the old fallthrough fire would re-introduce
// the Nominatim-transliteration leak (e.g., "گوانگ جو" for /ur/gwangju)
// and produce title/body inconsistency. The new architecture is:
// "trust the SSR seed unconditionally on canonical city pages, for ALL
// 10 supported langs". Assertion updated below.
const noFallthroughGDC = !/_isAbsenceLang\s*=\s*\(lang\s*===\s*'ar'/.test(getDisplayCityBody);
const noFallthroughGCCL = !/_isAbsenceLang\s*=\s*\(_ln\s*===\s*'ar'/.test(getCurrentCityLabelBody);
ok('CITY-NAME-FALLBACK-CONSISTENCY-1: getDisplayCity has NO absence-lang Latin fallthrough',
    noFallthroughGDC);
ok('CITY-NAME-FALLBACK-CONSISTENCY-1: getCurrentCityLabel has NO absence-lang Latin fallthrough',
    noFallthroughGCCL);

// index.html cache-buster bumped to v=654 (or higher)
const indexSrc = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const verMatch = indexSrc.match(/js\/app\.js\?v=(\d+)/);
const verNum = verMatch ? parseInt(verMatch[1], 10) : 0;
ok('index.html cache-buster bumped (?v=' + verNum + ' >= 654)',
    verNum >= 654);

// ───────────────────────────────────────────────────────────────────────
// PART B — SSR __PRAYER_CITY__ seed delivers page-lang-correct name
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — SSR __PRAYER_CITY__ seed per page lang ──');

const CASES = [
    { url: '/ur/prayer-times-in-charikar',  expectedSeed: 'چاریکار',   expectedEn: 'Charikar', script: 'ar-block' },
    { url: '/ur/prayer-times-in-kandahar',  expectedSeed: 'قندھار',    expectedEn: 'Kandahār', script: 'ar-block' },
    { url: '/ur/prayer-times-in-makkah',    expectedSeed: 'مکہ',       expectedEn: 'Mecca',    script: 'ar-block' },
    { url: '/prayer-times-in-charikar',     expectedSeed: 'تشاريكار',  expectedEn: 'Charikar', script: 'ar-block' },
    { url: '/en/prayer-times-in-charikar',  expectedSeed: 'Charikar',  expectedEn: 'Charikar', script: 'latin' },
    { url: '/fr/prayer-times-in-london',    expectedSeed: 'Londres',   expectedEn: 'London',   script: 'latin' },
    { url: '/de/prayer-times-in-munich',    expectedSeed: 'München',   expectedEn: 'Munich',   script: 'latin' },
    { url: '/es/prayer-times-in-new-york',  expectedSeed: 'Nueva York',expectedEn: 'New York', script: 'latin' },
    { url: '/tr/prayer-times-in-makkah',    expectedSeed: 'Mekke',     expectedEn: 'Mecca',    script: 'latin' }
];

for (const c of CASES) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    const seedEn   = seed && seed.englishName ? String(seed.englishName) : '';
    const seedSlug = seed && seed.slug ? String(seed.slug) : '';

    const nameOk = seedName === c.expectedSeed;
    const enOk   = seedEn === c.expectedEn;
    const slugOk = seedSlug && seedSlug.length > 0;
    let scriptOk = true;
    if (c.script === 'ar-block') {
        scriptOk = hasArabic(seedName) && !hasLatin(seedName);
    } else {
        scriptOk = !hasArabic(seedName); // Latin-script may or may not have Latin chars (e.g. "Mekke")
    }
    const allOk = r.status === 200 && nameOk && enOk && slugOk && scriptOk;
    ok(c.url.padEnd(45),
        allOk,
        '→ seed.name="' + seedName + '" seed.en="' + seedEn + '" seed.slug="' + seedSlug + '"');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — CRITICAL anti-regression: AR/UR cases the prior phases fixed
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — 🚨 CRITICAL anti-regression checks ──');

const CRITICAL = [
    { url: '/ur/prayer-times-in-charikar', meta: 'چاریکار',  desc: 'UR-AF-1 + CLIENT-SEED-HYDRATION-FIX-1' },
    { url: '/ur/prayer-times-in-kandahar', meta: 'قندھار',   desc: 'UR-TEMPLATE-CONSISTENCY-1 U+06BE regex fix' },
    { url: '/prayer-times-in-charikar',    meta: 'تشاريكار', desc: 'AR canonical' },
    { url: '/en/prayer-times-in-charikar', meta: 'Charikar', desc: 'EN baseline' }
];

for (const t of CRITICAL) {
    const r = await get(t.url);
    const m = extractMeta(r.body, 'ssr-city-name');
    ok(t.url.padEnd(40) + ' meta="' + t.meta + '"',
        m === t.meta,
        '(' + t.desc + ', got "' + m + '")');
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
