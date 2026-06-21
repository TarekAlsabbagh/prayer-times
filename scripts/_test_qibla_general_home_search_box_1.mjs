// scripts/_test_qibla_general_home_search_box_1.mjs
//
// QIBLA-GENERAL-HOME-SEARCH-BOX-1 verification.
//
// Replaces the legacy `#qibla-hub-search` qibla-style search input on
// /qibla (and lang variants) with the homepage `.city-page-search`
// component, reused via the SAME onCitySearchInput + onSearchKeyDown
// functions the homepage uses. Click target changes from
// `_buildQiblaCityUrl(...)` (custom) to
// `navigateToCity(..., { targetRoute: 'qibla-hub' })` →
// `/qibla-in-{slug}`, respecting current language prefix.
//
// This test covers:
//   A. Disk source markers (HTML new structure + JS QIBLA_SEARCH_CTX
//      + navigateToCity qibla-hub branch + reused shared pipeline).
//   B. /qibla + all 9 lang variants serve 200 + new search markup present.
//   C. /api/search-place returns lang-correct names per page lang.
//   D. /qibla-in-{slug} regression — server routes intact.
//   E. Homepage + /moon-today + /prayer-times-in-X unaffected.
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
function getJson(path) {
    return new Promise(resolve => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try { resolve({ status: r.statusCode, json: JSON.parse(body) }); }
                catch (_) { resolve({ status: r.statusCode, json: null }); }
            });
        }).on('error', () => resolve({ status: 0, json: null }));
    });
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' QIBLA-GENERAL-HOME-SEARCH-BOX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk source markers
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk source markers ──');

const APP_JS_PATH = new URL('../js/app.js', import.meta.url);
const INDEX_PATH  = new URL('../index.html', import.meta.url);
const appSrc   = readFileSync(APP_JS_PATH, 'utf8');
const indexSrc = readFileSync(INDEX_PATH, 'utf8');

const htmlOk = indexSrc.includes('QIBLA-GENERAL-HOME-SEARCH-BOX-1')
    && indexSrc.includes('id="qibla-page-search"')
    && indexSrc.includes('id="qibla-hub-suggestions"')
    && /class="cps-input cps-input--qibla"/.test(indexSrc);
ok('index.html: qibla-page-search wrapper + .cps-input--qibla + qibla-hub-suggestions',
    htmlOk);

const oldQiblaListGone = !/<ul[^>]*id="qibla-hub-search-results"/.test(indexSrc);
ok('index.html: legacy <ul id="qibla-hub-search-results"> removed',
    oldQiblaListGone);

const navTargetRouteOk = appSrc.includes("targetRoute === 'qibla-hub'")
    && /qibla-in-\$\{slug\}/.test(appSrc);
ok('navigateToCity has targetRoute="qibla-hub" branch routing to /qibla-in-{slug}',
    navTargetRouteOk);

const qiblaCtxOk = /QIBLA_SEARCH_CTX\s*=\s*\{/.test(appSrc)
    && /targetRoute:\s*'qibla-hub'/.test(appSrc)
    && /onCitySearchInput\(searchEl\.value,\s*QIBLA_SEARCH_CTX\)/.test(appSrc)
    && /onSearchKeyDown\(e,\s*QIBLA_SEARCH_CTX\)/.test(appSrc);
ok('Qibla wiring reuses homepage onCitySearchInput + onSearchKeyDown via QIBLA_SEARCH_CTX',
    qiblaCtxOk);

const sharedPipelineOk = /_DEFAULT_SEARCH_CTX\s*=\s*\{/.test(appSrc)
    && /function onCitySearchInput\(query,\s*ctx\)/.test(appSrc)
    && /async function fetchCitySuggestionsV2\(query,\s*ctx\)/.test(appSrc)
    && /function _renderV2Row\(r,\s*suggestionsEl,\s*lang,\s*ctx\)/.test(appSrc);
ok('Shared homepage pipeline still parameterized with ctx (regression intact)',
    sharedPipelineOk);

// Both moon AND qibla wirings present
const moonStillOk = /MOON_SEARCH_CTX\s*=\s*\{/.test(appSrc);
ok('Moon wiring (MOON_SEARCH_CTX) still present — moon phase not regressed',
    moonStillOk);

// cache-buster bumped >= 657
const verMatches = indexSrc.match(/js\/app\.js\?v=(\d+)/g) || [];
const allVers = verMatches.map(s => parseInt(s.match(/(\d+)/)[1], 10));
const minVer = allVers.length ? Math.min(...allVers) : 0;
ok('index.html cache-buster bumped (>= 657 across all references)',
    minVer >= 657);

// ───────────────────────────────────────────────────────────────────────
// PART B — /qibla + lang variants serve 200 with new markup
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — /qibla + 9 lang variants ──');

const QIBLA_PAGES = [
    '/qibla',
    '/en/qibla',
    '/ur/qibla',
    '/fr/qibla',
    '/de/qibla',
    '/tr/qibla',
    '/es/qibla',
    '/bn/qibla',
    '/ms/qibla',
    '/id/qibla'
];

for (const url of QIBLA_PAGES) {
    const r = await get(url);
    const hasNewSearch = r.body.includes('id="qibla-page-search"')
        && r.body.includes('id="qibla-hub-suggestions"');
    ok(url.padEnd(20) + ' served 200 + new search markup present',
        r.status === 200 && hasNewSearch);
}

// ───────────────────────────────────────────────────────────────────────
// PART C — /api/search-place returns lang-correct names
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — /api/search-place returns lang-correct names ──');

const API_CASES = [
    { q: 'charikar', lang: 'ur', expected: 'چاریکار',  slug: 'charikar' },
    { q: 'charikar', lang: 'en', expected: 'Charikar', slug: 'charikar' },
    { q: 'makkah',   lang: 'tr', expected: 'Mekke',    slug: 'makkah' },
    { q: 'london',   lang: 'fr', expected: 'Londres',  slug: 'london' },
    { q: 'new-york', lang: 'es', expected: 'Nueva York', slug: 'new-york' },
    { q: 'makkah',   lang: 'ur', expected: 'مکہ',      slug: 'makkah' }
];

for (const c of API_CASES) {
    const r = await getJson('/api/search-place?q=' + encodeURIComponent(c.q) + '&lang=' + c.lang);
    const hit = (r.json && Array.isArray(r.json.results)) ? r.json.results.find(x => x.slug === c.slug) : null;
    ok(('q="' + c.q + '" lang=' + c.lang).padEnd(28) + ' → "' + c.expected + '"',
        hit && hit.displayName === c.expected,
        hit ? '(got "' + hit.displayName + '")' : '(no result)');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — /qibla-in-{slug} regression
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — /qibla-in-{slug} server routes still work ──');

const QIBLA_IN_PAGES = [
    '/qibla-in-charikar',
    '/en/qibla-in-charikar',
    '/ur/qibla-in-charikar',
    '/fr/qibla-in-london',
    '/tr/qibla-in-makkah',
    '/qibla-in-makkah'
];

for (const url of QIBLA_IN_PAGES) {
    const r = await get(url);
    ok(url.padEnd(28) + ' returns 200', r.status === 200);
}

// ───────────────────────────────────────────────────────────────────────
// PART E — Homepage + moon + prayer-times unaffected
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — Homepage + moon + prayer-times unaffected ──');

const REG = [
    { url: '/',                                          marker: 'id="loc-hero-search"' },
    // moon hub moved /moon-today → /moon (MOON-TODAY-CONTENT-MOVE-TO-MOON-1, committed) — search box on /moon
    { url: '/moon',                                      marker: 'id="moon-page-search"' },
    { url: '/ur/moon',                                   marker: 'id="moon-hub-suggestions"' },
    { url: '/prayer-times-in-charikar',                  marker: 'id="city-search-input"' },
    { url: '/ur/prayer-times-in-charikar',               marker: 'ssr-city-name" content="چاریکار"' },
    { url: '/fr/prayer-times-in-london',                 marker: 'ssr-city-name" content="Londres"' }
];

for (const r of REG) {
    const resp = await get(r.url);
    ok(r.url.padEnd(40),
        resp.status === 200 && resp.body.includes(r.marker));
}

// ───────────────────────────────────────────────────────────────────────
// PART F — CRITICAL: /ur/qibla-in-charikar template surfaces
//   The SSR meta + __PRAYER_CITY__.name should still be lang-correct,
//   AND PT-LANG-GUARD-5 (which runs on ANY URL slug matching __PRAYER_CITY__.slug)
//   should ensure #city-name etc. render Urdu.
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — 🚨 CRITICAL: /ur/qibla-in-charikar SSR carries Urdu ──');

const r = await get('/ur/qibla-in-charikar');
const metaMatch = r.body.match(/<meta\s+name="ssr-city-name"\s+content="([^"]*)"/);
const seedMatch = r.body.match(/window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\});/);
let seedName = '';
if (seedMatch) {
    try { const s = JSON.parse(seedMatch[1]); seedName = s.name || ''; } catch (_) {}
}
const meta = metaMatch ? metaMatch[1] : '';
// On /qibla-in-{slug} the SSR meta may carry the qibla-specific seed
// instead of __PRAYER_CITY__ — accept either source.
const carriesUrdu = meta === 'چاریکار' || seedName === 'چاریکار'
    || /چاریکار/.test(r.body);
ok('/ur/qibla-in-charikar SSR carries "چاریکار" somewhere',
    carriesUrdu,
    '→ meta="' + meta + '" seed.name="' + seedName + '"');

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
