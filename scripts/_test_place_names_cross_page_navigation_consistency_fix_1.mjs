// scripts/_test_place_names_cross_page_navigation_consistency_fix_1.mjs
//
// PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 verification.
//
// Bug: navigating between city-tool pages within the same site reverted
// city names to English (e.g. /ur/moon-in-charikar showed "Charikar"
// instead of "چاریکار") because the SSR `window.__PRAYER_CITY__` seed
// was injected ONLY on /prayer-times-in-{slug}. On /moon-in-*,
// /moon-today-in-*, and /qibla-in-* the seed was missing → client's
// PT-LANG-GUARD-5 Tier-0 had no seed to trust → currentCity fell
// through to the English slug-prettify ("Charikar") → templates
// rendered Latin in Urdu/Bengali sentences.
//
// Fix (server.js, single regex): the seed-injection gate was
//   /^\/(?:lang\/)?prayer-times-in-[a-z][a-z0-9-]+$/
// Now broadened to cover all 4 bare city-page route families:
//   /^\/(?:lang\/)?(?:prayer-times-in|moon-in|moon-today-in|qibla-in)-[a-z][a-z0-9-]+$/
//
// This test covers:
//   A. Disk source markers (server.js regex + cache-buster bump).
//   B. SSR seed injection on 12 sample URLs across 4 route families × 3 langs.
//   C. Regression: homepage / moon-today hub / qibla hub still serve normally.

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

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Disk source markers
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — Disk source markers ──');

const SERVER_PATH = new URL('../server.js', import.meta.url);
const INDEX_PATH  = new URL('../index.html', import.meta.url);
const serverSrc = readFileSync(SERVER_PATH, 'utf8');
const indexSrc  = readFileSync(INDEX_PATH, 'utf8');

// Server regex now covers all 4 route families
const fixedRegex = /_bareCityRoute\s*=\s*\/\^\\\/.*\?\:prayer-times-in\|moon-in\|moon-today-in\|qibla-in/.test(serverSrc);
ok('server.js bare-city-route regex covers all 4 families (prayer/moon-in/moon-today-in/qibla-in)',
    fixedRegex);

// Phase marker
const phaseMarker = serverSrc.includes('PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1');
ok('PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 comment present',
    phaseMarker);

// cache-buster bumped >= 661
const verMatches = indexSrc.match(/js\/app\.js\?v=(\d+)/g) || [];
const allVers = verMatches.map(s => parseInt(s.match(/(\d+)/)[1], 10));
const minVer = allVers.length ? Math.min(...allVers) : 0;
ok('index.html cache-buster bumped (>= 661 across all references)',
    minVer >= 661);

// ───────────────────────────────────────────────────────────────────────
// PART B — SSR __PRAYER_CITY__ seed for 12 URLs across 4 families × 3 langs
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — SSR __PRAYER_CITY__ seed on cross-family city URLs ──');

const URLS = [
    // /prayer-times-in-{slug} family (was already correct)
    { url: '/ur/prayer-times-in-charikar',  expected: 'چاریکار' },
    { url: '/fr/prayer-times-in-london',    expected: 'Londres' },
    { url: '/tr/prayer-times-in-makkah',    expected: 'Mekke' },
    // /moon-in-{slug} family (NEW — was missing the seed before)
    { url: '/ur/moon-in-charikar',          expected: 'چاریکار' },
    { url: '/fr/moon-in-london',            expected: 'Londres' },
    { url: '/tr/moon-in-makkah',            expected: 'Mekke' },
    // /moon-today-in-{slug} family (NEW)
    { url: '/ur/moon-today-in-charikar',    expected: 'چاریکار' },
    { url: '/fr/moon-today-in-london',      expected: 'Londres' },
    { url: '/tr/moon-today-in-makkah',      expected: 'Mekke' },
    // /qibla-in-{slug} family (NEW)
    { url: '/ur/qibla-in-charikar',         expected: 'چاریکار' },
    { url: '/fr/qibla-in-london',           expected: 'Londres' },
    { url: '/tr/qibla-in-makkah',           expected: 'Mekke' }
];

for (const c of URLS) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok(c.url.padEnd(36) + ' __PRAYER_CITY__.name = "' + c.expected + '"',
        r.status === 200 && seedName === c.expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// PART C — Regression: hub pages + homepage still served normally
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — Regression: hub pages + homepage ──');

const REG = [
    { url: '/',           desc: 'homepage' },
    { url: '/moon-today', desc: '/moon-today hub' },
    { url: '/qibla',      desc: '/qibla hub' },
    { url: '/ur/moon-today', desc: '/ur/moon-today hub' },
    { url: '/ur/qibla',      desc: '/ur/qibla hub' }
];

for (const r of REG) {
    const resp = await get(r.url);
    ok(r.url.padEnd(20) + ' [' + r.desc + ']', resp.status === 200);
}

// ───────────────────────────────────────────────────────────────────────
// PART D — Anti-regression: AR / EN / FR critical cases
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — AR / EN / FR cross-family seed verification ──');

const CRITICAL = [
    { url: '/prayer-times-in-charikar',  expected: 'تشاريكار', desc: 'AR prayer' },
    { url: '/moon-in-charikar',          expected: 'تشاريكار', desc: 'AR moon-in' },
    { url: '/qibla-in-charikar',         expected: 'تشاريكار', desc: 'AR qibla' },
    { url: '/en/prayer-times-in-charikar', expected: 'Charikar', desc: 'EN prayer' },
    { url: '/en/moon-in-charikar',         expected: 'Charikar', desc: 'EN moon-in' },
    { url: '/en/qibla-in-charikar',        expected: 'Charikar', desc: 'EN qibla' },
    { url: '/fr/moon-in-london',         expected: 'Londres',  desc: 'FR moon-in' },
    { url: '/fr/qibla-in-london',        expected: 'Londres',  desc: 'FR qibla' }
];

for (const c of CRITICAL) {
    const r = await get(c.url);
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    ok((c.desc + ' ' + c.url).padEnd(50) + ' seed="' + c.expected + '"',
        seedName === c.expected,
        '(got "' + seedName + '")');
}

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
