// scripts/_test_place_names_sitewide_template_consistency_fix_1.mjs
//
// PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 verification.
//
// Generalizes the localized-name rule to every visible-text surface
// across the site: any page that displays a city name MUST use
// names[currentLang] when available, never English fallback.
//
// Builds on prior phases:
//   - PT-LANG-GUARD-1..5: client-side display pickers (getDisplayCity,
//     getCurrentCityLabel, _syncCityNameInDom, _moonCityDisplayName)
//     trust SSR __PRAYER_CITY__.name when slug matches.
//   - MOON+QIBLA-GENERAL-HOME-SEARCH-BOX-1: /moon-today + /qibla
//     reuse homepage search pipeline.
//
// This phase adds 3 targeted client-template fixes:
//   1. injectPrayerEventsSchema cityDisplay/countryName → uses
//      getDisplayCity()/getDisplayCountry() instead of
//      `isEn ? currentEnglishName : currentCity` (so JSON-LD for
//      Arabic Google etc. carries localized city/country names).
//   2. Hijri date page locDisplay fallback chain → absence-langs
//      (ar/ur/bn) prefer currentCity over currentEnglishName.
//   3. Second locDisplay fallback for geo-aware related-link labels
//      on date pages → same absence-lang priority.
//
// Test covers:
//   A. Disk source markers (3 fixes + cache-buster bump).
//   B. SSR meta + __PRAYER_CITY__.name for 10 sample URLs.
//   C. /qibla-in-{slug} surfaces still render Urdu (regression of PT-LANG-GUARD-5).
//   D. Schema element check on a few SSR-served city pages.
//   E. Regression: homepage + /moon-today + /qibla search boxes still visible.

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

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk source markers (3 fixes + cache-buster)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk source markers ──');

const APP_JS_PATH = new URL('../js/app.js', import.meta.url);
const INDEX_PATH  = new URL('../index.html', import.meta.url);
const appSrc   = readFileSync(APP_JS_PATH, 'utf8');
const indexSrc = readFileSync(INDEX_PATH, 'utf8');

// Fix 1: schema uses getDisplayCity / getDisplayCountry
const fix1Marker = appSrc.includes('PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1')
    && /const cityDisplay = \(typeof getDisplayCity === 'function'\)\s*\?\s*\(getDisplayCity\(\)/.test(appSrc)
    && /const countryName = \(typeof getDisplayCountry === 'function'\)\s*\?\s*\(getDisplayCountry\(\)/.test(appSrc);
ok('Fix 1 — injectPrayerEventsSchema uses getDisplayCity / getDisplayCountry',
    fix1Marker);

// Fix 2 + 3: absence-lang priority in 2 places. Both use slightly
// different local-variable names (`_isAbsLang` vs `_isAbsLang_cd`),
// so accept either prefix.
const absLangPattern = /_isAbsLang(_cd)?\s*=\s*\(lang\s*===\s*'ar'\s*\|\|\s*lang\s*===\s*'ur'\s*\|\|\s*lang\s*===\s*'bn'\)/g;
const absLangMatches = appSrc.match(absLangPattern) || [];
ok('Fix 2+3 — absence-lang priority pattern present at >= 2 locDisplay sites',
    absLangMatches.length >= 2,
    '(found ' + absLangMatches.length + ' matches)');

// Fix 4 (server.js): _resolveCityForMoon also consults curated_places
const serverSrc = readFileSync(new URL('../server.js', import.meta.url), 'utf8');
const fix4Marker = /_CURATED_SLUG_INDEX\s*&&\s*_CURATED_SLUG_INDEX\[s\]/.test(serverSrc)
    && /_resolveCityForMoon/.test(serverSrc);
ok('Fix 4 — server.js _resolveCityForMoon falls back to _CURATED_SLUG_INDEX',
    fix4Marker);

// cache-buster bumped >= 658
const verMatches = indexSrc.match(/js\/app\.js\?v=(\d+)/g) || [];
const allVers = verMatches.map(s => parseInt(s.match(/(\d+)/)[1], 10));
const minVer = allVers.length ? Math.min(...allVers) : 0;
ok('index.html cache-buster bumped (>= 658 across all references)',
    minVer >= 658);

// ───────────────────────────────────────────────────────────────────────
// PART B — SSR meta + __PRAYER_CITY__.name for 10 sample URLs
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — SSR seed lang-correctness across 10 URLs ──');

const URLS = [
    { url: '/ur/prayer-times-in-charikar', expected: 'چاریکار' },
    { url: '/ur/qibla-in-charikar',        expected: 'چاریکار' },
    { url: '/ur/moon-in-charikar',         expected: 'چاریکار' },
    { url: '/ur/moon-today-in-charikar',   expected: 'چاریکار' },
    { url: '/fr/moon-in-london',           expected: 'Londres' },
    { url: '/de/qibla-in-munich',          expected: 'München' },
    { url: '/es/prayer-times-in-new-york', expected: 'Nueva York' },
    { url: '/tr/prayer-times-in-makkah',   expected: 'Mekke' },
    { url: '/prayer-times-in-charikar',    expected: 'تشاريكار' },
    { url: '/en/prayer-times-in-charikar', expected: 'Charikar' }
];

for (const c of URLS) {
    const r = await get(c.url);
    const meta = extractMeta(r.body, 'ssr-city-name');
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    // SSR carries the localized name in meta AND/OR seed (some routes have seed,
    // some only meta — accept either).
    const carriesLocalized = meta === c.expected || seedName === c.expected;
    ok(c.url.padEnd(36) + ' → "' + c.expected + '"',
        r.status === 200 && carriesLocalized,
        '(meta="' + meta + '" seed="' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — Critical /qibla-in-{slug} surfaces in SSR HTML
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — /ur/qibla-in-charikar SSR surfaces ──');

const qiblaResp = await get('/ur/qibla-in-charikar');
const titleMatch = qiblaResp.body.match(/<title>([^<]+)<\/title>/i);
const h1Match    = qiblaResp.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

ok('/ur/qibla-in-charikar served 200', qiblaResp.status === 200);
ok('/ur/qibla-in-charikar <title> contains چاریکار',
    titleMatch && titleMatch[1].includes('چاریکار'),
    titleMatch ? '("' + titleMatch[1].slice(0, 60) + '")' : '(missing title)');
ok('/ur/qibla-in-charikar <h1> contains چاریکار',
    h1Match && h1Match[1].includes('چاریکار'),
    h1Match ? '("' + h1Match[1].replace(/\s+/g, ' ').slice(0, 80) + '")' : '(missing h1)');

// ───────────────────────────────────────────────────────────────────────
// PART D — Critical /ur/moon-in-{slug} surfaces in SSR HTML
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — /ur/moon-in-charikar SSR surfaces ──');

const moonResp = await get('/ur/moon-in-charikar');
const moonTitleMatch = moonResp.body.match(/<title>([^<]+)<\/title>/i);

ok('/ur/moon-in-charikar served 200', moonResp.status === 200);
ok('/ur/moon-in-charikar <title> contains چاریکار',
    moonTitleMatch && moonTitleMatch[1].includes('چاریکار'),
    moonTitleMatch ? '("' + moonTitleMatch[1].slice(0, 60) + '")' : '(missing title)');

// ───────────────────────────────────────────────────────────────────────
// PART E — Regression: homepage + moon + qibla search boxes still present
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — Regression: search boxes still in DOM ──');

const REG = [
    { url: '/',           marker: 'id="loc-hero-search"',     desc: 'Homepage hero search' },
    { url: '/moon-today', marker: 'id="moon-page-search"',    desc: '/moon-today search wrapper' },
    { url: '/qibla',      marker: 'id="qibla-page-search"',   desc: '/qibla search wrapper' },
    { url: '/ur/moon-today', marker: 'id="moon-hub-suggestions"', desc: '/ur/moon-today dropdown' },
    { url: '/ur/qibla',      marker: 'id="qibla-hub-suggestions"', desc: '/ur/qibla dropdown' },
    { url: '/prayer-times-in-charikar', marker: 'id="city-search-input"', desc: 'prayer-times city-page-search' }
];

for (const r of REG) {
    const resp = await get(r.url);
    ok(r.url.padEnd(30) + ' [' + r.desc + ']',
        resp.status === 200 && resp.body.includes(r.marker));
}

// CSS visibility override still present (regression of MOON-QIBLA-SEARCH-BOX-PRODUCTION-VISIBILITY-FIX-1)
const CSS_PATH = new URL('../css/style.css', import.meta.url);
const cssSrc = readFileSync(CSS_PATH, 'utf8');
const cssOverride = /\.city-page-search--moon,\s*\n\s*\.city-page-search--qibla\s*\{\s*display:\s*block\s*!important/.test(cssSrc);
ok('CSS visibility override .city-page-search--moon/--qibla still present',
    cssOverride);

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
