// scripts/_test_place_names_ur_template_consistency_1.mjs
//
// PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1 verification.
//
// Background: After PLACE-NAMES-UR-AF-1 + UR-CLIENT-SEED-HYDRATION-FIX-1,
// the main `#city-name` element on `/ur/prayer-times-in-{slug}` rendered
// correctly (e.g. "چاریکار" for charikar). But 4 additional surfaces
// inside the page templates still pulled `currentEnglishName` directly
// and leaked English into Urdu sentences:
//
//   • #loc-hero-title H2 — "آج Charikar میں اوقاتِ نماز —…"
//   • #snb-city sticky bar — "Charikar"
//   • 3× .qa-title hijri/qibla/moon — "Charikar میں آج کی ہجری تاریخ"
//   • .nearby-label — leaked English for nearby city tiles
//
// This phase fixes three writers + a regex:
//   Fix A  getCurrentCityLabel(): UR/BN priority returns currentCity when
//          in Arabic/Bengali block + no Latin. Covers #snb-city,
//          #loc-hero-title (via cityLabel), prayer-card aria-labels,
//          mtc-cta title, weekly button title.
//   Fix B  _moonCityDisplayName() Tier 1.5: reject stale Latin
//          sessionStorage seed on absence-lang pages. Covers .qa-title.
//   Fix C  .nearby-label placeLabel: consult __POPULAR_CITY_NAMES__ by
//          bare-slug before falling back to nameEn for non-popular langs.
//   Fix D  _isDisplayScriptAcceptable() Urdu-specific regex: add
//          U+06BE ھ + U+06C2 ۂ + U+06D3 ۓ — these were absent and caused
//          real Urdu names like "قندھار" (whose only Urdu-distinct char
//          is U+06BE) to be misclassified as "pure Arabic" and rejected
//          on /ur/ pages.
//
// This test verifies:
//   A. The served minified js/app.js carries the new guard markers.
//   B. SSR meta + __PRAYER_CITY__ seed remain correct for /ur/{slug}.
//   C. AR/EN pages are unaffected (regression guard).
//   D. The /ur/makkah curated case still works.
//
// Pre-req: `node server.js` on localhost:8080.

import http from 'node:http';
import { readFileSync } from 'node:fs';

function get(path) {
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

function getServedJs() {
    return new Promise((resolve) => {
        // Cache-bust query so we always get the live minified output.
        http.get({ host: 'localhost', port: 8080, path: '/js/app.js?cb=' + Date.now() }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve(body));
        }).on('error', () => resolve(''));
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
console.log(' PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — Source code presence: new guard markers in disk js/app.js
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — js/app.js disk source markers ──');

const APP_JS_PATH = new URL('../js/app.js', import.meta.url);
const diskSrc = readFileSync(APP_JS_PATH, 'utf8');

const fixAMarker = diskSrc.includes('PT-LANG-GUARD-4')
    && diskSrc.includes('PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1');
ok('Fix A — PT-LANG-GUARD-4 + phase tag present in getCurrentCityLabel()',
    fixAMarker);

const fixBMarker = /Reject\s+a?\s*Latin\s+sessionStorage\s+seed/i.test(diskSrc)
    || diskSrc.includes('_isAbsenceLang0');
ok('Fix B — Tier 1.5 sessionStorage absence-lang Latin rejection present',
    fixBMarker);

const fixCMarker = diskSrc.includes('__POPULAR_CITY_NAMES__')
    && /placeLabel\s*=\s*_pop\[_bareSlug\]\[_nLng\]/.test(diskSrc);
ok('Fix C — .nearby-label POPULAR_CITY_NAMES bare-slug lookup present',
    fixCMarker);

// Fix D: regex must include U+06BE ھ (do-chashmi heh). The source may
// use the literal char `ھ` OR the escape `ھ` — both are equivalent
// at runtime. Look for either inside the hasUrduSpecific char class.
const _hasUrduSpecificMatch = diskSrc.match(/hasUrduSpecific\s*=\s*\/\[([^\]]+)\]/);
const _charClass = _hasUrduSpecificMatch ? _hasUrduSpecificMatch[1] : '';
const fixDMarker = /ھ/.test(_charClass) || /\\u06BE/i.test(_charClass);
ok('Fix D — _isDisplayScriptAcceptable Urdu regex includes U+06BE (ھ / \\u06BE)',
    fixDMarker);

// Simpler guard (Arabic-block + no Latin only — no _isDisplayScriptAcceptable)
const simplerGuardA = /if\s*\(\s*_ln\s*===\s*'ur'\s*\|\|\s*_ln\s*===\s*'bn'\s*\)\s*\{[\s\S]{0,800}?_hasArabicBlock/.test(diskSrc);
ok('getCurrentCityLabel uses simpler Arabic-block guard (no _isDisplayScriptAcceptable dep)',
    simplerGuardA);

const simplerGuardB = /if\s*\(\s*lang\s*===\s*'ur'\s*\|\|\s*lang\s*===\s*'bn'\s*\)\s*\{[\s\S]{0,800}?_hasArBlock/.test(diskSrc);
ok('getDisplayCity uses simpler Arabic-block guard (no _isDisplayScriptAcceptable dep)',
    simplerGuardB);

// ───────────────────────────────────────────────────────────────────────
// PART B — Served JS matches disk source (cache-bust HTTP fetch)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — Served /js/app.js carries the new guards ──');

const servedJs = await getServedJs();
const servedHasArabicBlockGuard = servedJs.includes('؀-ۿ') && servedJs.includes('ঀ-৿');
ok('Served minified JS contains Arabic-block + Bengali-block regex guards',
    servedHasArabicBlockGuard);

// The served minified version should contain U+06BE somewhere — Terser
// preserves Unicode escapes in regex literals. Accept either the literal
// `ھ` char OR the `ھ` escape form.
const servedHasU06BE = /ھ/.test(servedJs) || /\\u06BE/i.test(servedJs);
ok('Served JS contains U+06BE (ھ / \\u06BE) — required for "قندھار" detection',
    servedHasU06BE);

// ───────────────────────────────────────────────────────────────────────
// PART C — SSR meta + __PRAYER_CITY__ for 3 UR cities
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — SSR meta + __PRAYER_CITY__ seed for /ur/{slug} ──');

const UR_CASES = [
    { slug: 'charikar', ur: 'چاریکار', en: 'Charikar' },
    { slug: 'kandahar', ur: 'قندھار',  en: 'Kandahār' },
    { slug: 'kabul',    ur: 'کابل',    en: 'Kabul'    }
];

for (const c of UR_CASES) {
    const r = await get('/ur/prayer-times-in-' + c.slug);
    const meta = extractMeta(r.body, 'ssr-city-name');
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    const seedEn   = seed && seed.englishName ? String(seed.englishName) : '';
    const ok1 = r.status === 200
        && meta === c.ur
        && seedName === c.ur
        && hasArabic(meta) && !hasLatin(meta)
        && seedEn === c.en;
    ok('/ur/prayer-times-in-' + c.slug.padEnd(10) + ' SSR Urdu OK',
        ok1,
        '→ meta="' + meta + '" seed.name="' + seedName + '" seed.en="' + seedEn + '"');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — AR + EN regression on same slugs
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — AR + EN regression ──');

const REGRESSION_CASES = [
    { slug: 'charikar', ar: 'تشاريكار', en: 'Charikar' },
    { slug: 'kandahar', ar: 'قندهار',   en: 'Kandahār' },
    { slug: 'kabul',    ar: 'كابل',     en: 'Kabul'    }
];

for (const t of REGRESSION_CASES) {
    const arResp = await get('/prayer-times-in-' + t.slug);
    const enResp = await get('/en/prayer-times-in-' + t.slug);
    const arName = extractMeta(arResp.body, 'ssr-city-name');
    const enName = extractMeta(enResp.body, 'ssr-city-name');
    ok(t.slug.padEnd(10) + ' /ar + /en unaffected',
        arName === t.ar && enName === t.en,
        '→ ar="' + arName + '" en="' + enName + '"');
}

// ───────────────────────────────────────────────────────────────────────
// PART E — /ur/makkah curated regression
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part E — /ur/makkah curated regression ──');

const makkahResp = await get('/ur/prayer-times-in-makkah');
const makkahMeta = extractMeta(makkahResp.body, 'ssr-city-name');
ok('/ur/prayer-times-in-makkah meta = "مکہ"',
    makkahMeta === 'مکہ',
    '→ meta="' + makkahMeta + '"');

// ───────────────────────────────────────────────────────────────────────
// PART F — CRITICAL: /ur/kandahar (the U+06BE regex case)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part F — 🚨 CRITICAL: /ur/kandahar must SSR-serve "قندھار" ──');

const knd = await get('/ur/prayer-times-in-kandahar');
const kndMeta = extractMeta(knd.body, 'ssr-city-name');
const kndSeed = extractPrayerCitySeed(knd.body);
const kndSeedName = kndSeed && kndSeed.name ? String(kndSeed.name) : '';
const kndOk = kndMeta === 'قندھار'
    && kndSeedName === 'قندھار'
    && /ھ/.test(kndMeta)
    && !/[A-Za-z]/.test(kndMeta);
ok('/ur/kandahar SSR delivers proper "قندھار" with U+06BE',
    kndOk,
    '→ meta="' + kndMeta + '" seed.name="' + kndSeedName + '"');

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
