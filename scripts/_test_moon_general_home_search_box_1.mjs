// scripts/_test_moon_general_home_search_box_1.mjs
//
// MOON-GENERAL-HOME-SEARCH-BOX-1 verification.
//
// Replaces the legacy `#moon-hub-search` qibla-style search input on
// /moon-today with the homepage-style compact `.city-page-search`
// component (`#moon-page-search` wrapper, `.cps-*` classes), and
// rewires the click handler to use the v2 /api/search-place engine
// + navigateToCity({ targetRoute: 'moon-hub' }) which routes to
// `/moon-in-{slug}` instead of `/moon-today-in-{slug}`.
//
// This test covers:
//   A. Disk source markers (HTML + JS).
//   B. /moon-today + lang variants are served (SSR responds 200).
//   C. navigateToCity has the targetRoute='moon-hub' branch.
//   D. /api/search-place returns localized names per page lang for
//      the cities the user listed (charikar/london/makkah).
//   E. Existing /moon-today-in-{slug} + /moon-in-{slug} routes still
//      work (regression — these are server-side routes, untouched).
//
// Pre-req: `node server.js` on localhost:8080.

import http from 'node:http';
import { readFileSync } from 'node:fs';

function get(path) {
    return new Promise(resolve => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body, loc: r.headers.location || '' }));
        }).on('error', () => resolve({ status: 0, body: '', loc: '' }));
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
console.log(' MOON-GENERAL-HOME-SEARCH-BOX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk source markers (HTML + JS)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk source markers ──');

const APP_JS_PATH = new URL('../js/app.js', import.meta.url);
const INDEX_PATH  = new URL('../index.html', import.meta.url);
const appSrc   = readFileSync(APP_JS_PATH, 'utf8');
const indexSrc = readFileSync(INDEX_PATH, 'utf8');

const htmlOk = indexSrc.includes('MOON-GENERAL-HOME-SEARCH-BOX-1')
    && indexSrc.includes('id="moon-page-search"')
    && indexSrc.includes('id="moon-hub-suggestions"')
    && /class="cps-input cps-input--moon"/.test(indexSrc);
ok('index.html: moon-page-search wrapper + .cps-input--moon + moon-hub-suggestions',
    htmlOk);

const oldQiblaSearchRemoved = !/<input[^>]*id="moon-hub-search"[^>]*qibla-hub-search/.test(indexSrc);
ok('index.html: legacy qibla-hub-search class removed from moon-hub-search input',
    oldQiblaSearchRemoved);

const navTargetRouteOk = appSrc.includes("targetRoute === 'moon-hub'")
    && /moon-in-\$\{slug\}/.test(appSrc);
ok('navigateToCity has targetRoute="moon-hub" branch routing to /moon-in-{slug}',
    navTargetRouteOk);

// Revised approach: moon wiring REUSES the homepage search pipeline
// (onCitySearchInput + onSearchKeyDown) via the new ctx parameter.
// The wiring just declares a MOON_SEARCH_CTX and forwards events.
const wireOk = appSrc.includes("MOON-GENERAL-HOME-SEARCH-BOX-1")
    && /MOON_SEARCH_CTX\s*=\s*\{/.test(appSrc)
    && /targetRoute:\s*'moon-hub'/.test(appSrc)
    && /onCitySearchInput\(searchEl\.value,\s*MOON_SEARCH_CTX\)/.test(appSrc)
    && /onSearchKeyDown\(e,\s*MOON_SEARCH_CTX\)/.test(appSrc);
ok('Moon wiring reuses homepage onCitySearchInput + onSearchKeyDown via MOON_SEARCH_CTX',
    wireOk);

// New: shared pipeline must have _DEFAULT_SEARCH_CTX defined + ctx-aware fetchers.
const ctxOk = /_DEFAULT_SEARCH_CTX\s*=\s*\{/.test(appSrc)
    && /function onCitySearchInput\(query,\s*ctx\)/.test(appSrc)
    && /async function fetchCitySuggestionsV2\(query,\s*ctx\)/.test(appSrc)
    && /function fetchCitySuggestions\(query,\s*ctx\)/.test(appSrc)
    && /function _renderV2Row\(r,\s*suggestionsEl,\s*lang,\s*ctx\)/.test(appSrc);
ok('Homepage search pipeline parameterized with ctx (DEFAULT + onCity + V2 + V1 + renderRow)',
    ctxOk);

// index.html cache-buster bumped (>= 655)
const verMatch = indexSrc.match(/js\/app\.js\?v=(\d+)/g);
const minVer = verMatch ? Math.min(...verMatch.map(s => parseInt(s.match(/(\d+)/)[1], 10))) : 0;
ok('index.html cache-buster bumped (>= 655 across all references)',
    minVer >= 655);

// ───────────────────────────────────────────────────────────────────────
// PART B — the moon hub moved /moon-today → /moon (MOON-TODAY-CONTENT-MOVE-TO-MOON-1, committed):
//   /moon-today (+langs) now 301 → /moon; the moon-page search box lives on /moon. (Pre-existing
//   route change — refreshed here so this test reflects committed behavior, NOT an MLRC change.)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — /moon-today + langs → 301 /moon · search box on /moon ──');

const MOON_HUB_LANGS = ['', '/en', '/ur', '/fr', '/de', '/tr', '/es', '/bn', '/ms', '/id'];

for (const lp of MOON_HUB_LANGS) {
    const legacy = await get(lp + '/moon-today');
    ok((lp + '/moon-today').padEnd(20) + ' 301 → ' + (lp + '/moon'), legacy.status === 301 && legacy.loc === (lp + '/moon'), `status=${legacy.status} loc=${legacy.loc}`);
    const hub = await get(lp + '/moon');
    const hasNewSearch = hub.body.includes('id="moon-page-search"') && hub.body.includes('id="moon-hub-suggestions"');
    ok((lp + '/moon').padEnd(20) + ' 200 + new search markup present', hub.status === 200 && hasNewSearch);
}

// ───────────────────────────────────────────────────────────────────────
// PART C — /api/search-place returns lang-correct names
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — /api/search-place returns lang-correct names ──');

const API_CASES = [
    { q: 'charikar', lang: 'ur', expectedName: 'چاریکار',  slug: 'charikar' },
    { q: 'charikar', lang: 'ar', expectedName: 'تشاريكار', slug: 'charikar' },
    { q: 'charikar', lang: 'en', expectedName: 'Charikar', slug: 'charikar' },
    { q: 'london',   lang: 'fr', expectedName: 'Londres',  slug: 'london' },
    { q: 'london',   lang: 'en', expectedName: 'London',   slug: 'london' },
    { q: 'munich',   lang: 'de', expectedName: 'München',  slug: 'munich' },
    { q: 'makkah',   lang: 'ur', expectedName: 'مکہ',      slug: 'makkah' },
    { q: 'makkah',   lang: 'tr', expectedName: 'Mekke',    slug: 'makkah' }
];

for (const c of API_CASES) {
    const r = await getJson('/api/search-place?q=' + encodeURIComponent(c.q) + '&lang=' + c.lang);
    const hit = (r.json && Array.isArray(r.json.results)) ? r.json.results.find(x => x.slug === c.slug) : null;
    const displayOk = hit && hit.displayName === c.expectedName;
    ok(('q="' + c.q + '" lang=' + c.lang).padEnd(28) + ' → displayName="' + c.expectedName + '"',
        displayOk,
        hit ? '(got displayName="' + hit.displayName + '" slug=' + hit.slug + ')' : '(no matching result)');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — /moon-in-{slug} now 301 → nested hub (MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — /moon-in-{slug} now 301 → nested hub (MLRC) ──');

const MOON_IN_PAGES = [
    '/moon-in-charikar',
    '/en/moon-in-charikar',
    '/ur/moon-in-charikar',
    '/fr/moon-in-london',
    '/de/moon-in-munich',
    '/moon-in-makkah'
];

for (const url of MOON_IN_PAGES) {
    const r = await get(url);
    // 301 (lang-preserved) to the nested hub /[lang/]moon/{country}/{city}
    const nested = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/[a-z-]+\/[a-z-]+$/.test(r.loc);
    ok(url.padEnd(28) + ' 301 → nested hub', r.status === 301 && nested, `status=${r.status} loc=${r.loc}`);
}

// ───────────────────────────────────────────────────────────────────────
// PART E — /moon-today-in-{slug} now 301 → nested today (MLRC)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — /moon-today-in-{slug} now 301 → nested today (MLRC) ──');

const MOON_TODAY_IN_PAGES = [
    '/moon-today-in-charikar',
    '/ur/moon-today-in-makkah',
    '/fr/moon-today-in-london'
];

for (const url of MOON_TODAY_IN_PAGES) {
    const r = await get(url);
    const nested = /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/[a-z-]+\/[a-z-]+\/today$/.test(r.loc);
    ok(url.padEnd(32) + ' 301 → nested today', r.status === 301 && nested, `status=${r.status} loc=${r.loc}`);
}

// ───────────────────────────────────────────────────────────────────────
// PART F — Critical regression: homepage + prayer-times still serve right
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — Homepage + prayer-times pages unaffected ──');

const REG = [
    { url: '/',                                          marker: 'id="loc-hero-search"',         desc: 'Homepage hero search' },
    { url: '/prayer-times-in-charikar',                  marker: 'id="city-search-input"',       desc: 'Prayer-times city-page-search' },
    { url: '/ur/prayer-times-in-charikar',               marker: 'ssr-city-name" content="چاریکار"', desc: '/ur/charikar SSR Urdu' },
    { url: '/fr/prayer-times-in-london',                 marker: 'ssr-city-name" content="Londres"', desc: '/fr/london SSR French' }
];

for (const r of REG) {
    const resp = await get(r.url);
    ok((r.url.padEnd(40) + ' [' + r.desc + ']'),
        resp.status === 200 && resp.body.includes(r.marker));
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
