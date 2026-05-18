// scripts/_test_place_names_ur_client_seed_hydration_fix_1.mjs
//
// PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1 verification.
//
// Bug fixed: on `/ur/prayer-times-in-{slug}` for AF cities, the page
// initially rendered the correct Urdu name (e.g. `چاریکار`) from SSR,
// then ~1 second later JavaScript hydration overwrote it with the
// English Latin name "Charikar". Two client paths were responsible:
//
//   1. `getDisplayCity()` for non-AR/non-EN langs preferred
//      `currentEnglishDisplayName` over `currentCity` in its fallback
//      chain. Even when `currentCity` was correctly set to "چاریکار"
//      from the SSR `__PRAYER_CITY__.name` seed, the function returned
//      "Charikar" (from `__PRAYER_CITY__.englishName`) — and
//      `updateCityDisplay()` then wrote "Charikar" to `#city-name`.
//
//   2. `_syncCityNameInDom()` had a Latin-rejection guard, but it only
//      fired on AR pages (`_isAr === true`). On a UR page, if anything
//      later mutated `currentCity` to a Latin value (e.g. from stale
//      sessionStorage written by a previous /en/ context visit), the
//      DOM walker happily replaced every "چاریکار" text node with
//      "Charikar" — including <title>, <h1>, FAQ, JSON-LD.
//
// Fix: extend both paths to treat UR + BN like AR — they are the
// three "absence-langs" where curated_places.json ships real localized
// names in proper script (Arabic / Urdu / Bengali) and Latin is never
// an acceptable display.
//
// This test covers TWO layers:
//   A. SSR meta + __PRAYER_CITY__ seed for /ur/charikar (and others)
//      — must carry Urdu names from `names.ur`, not the English fill.
//   B. Static code check on js/app.js — the two fix markers must be
//      present (PT-LANG-GUARD-3 in getDisplayCity + the absence-lang
//      block in _syncCityNameInDom).
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

function extractMeta(html, name) {
    const re = new RegExp('<meta\\s+name="' + name + '"\\s+content="([^"]*)"', 'i');
    const m = html.match(re);
    return m ? m[1] : '';
}

function extractPrayerCitySeed(html) {
    // Server injects: <script id="ssr-prayer-city">window.__PRAYER_CITY__ = {...};</script>
    const m = html.match(
        /<script[^>]*id="ssr-prayer-city"[^>]*>\s*window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\});\s*<\/script>/i
    );
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (_) { return null; }
}

function hasLatin(s)  { return /[A-Za-z]/.test(s || ''); }
function hasArabic(s) { return /[؀-ۿ]/.test(s || ''); }
// Urdu-specific letters present in `names.ur` strings:
//   پ U+067E, چ U+0686, ژ U+0698, ک U+06A9, گ U+06AF, ٹ U+0679,
//   ڈ U+0688, ڑ U+0691, ں U+06BA, ی U+06CC, ے U+06D2, ہ U+06C1
function hasUrduSpecific(s) {
    return /[پچژکگٹڈڑںیےہ]/.test(s || '');
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ───────────────────────────────────────────────────────────────────────
// PART A — SSR delivery on /ur/prayer-times-in-{slug}
//
// For 5 representative AF cities (the user's flagship "charikar" case
// + 4 others spanning curated-13 + the rest-22 set), verify that:
//   1. `<meta name="ssr-city-name">` carries the Urdu name.
//   2. `window.__PRAYER_CITY__.name` carries the Urdu name.
//   3. `window.__PRAYER_CITY__.englishName` carries the English name.
//   4. The Urdu name has the proper Arabic/Urdu script.
//   5. The Urdu name has NO Latin characters.
//
// The CRITICAL case is `charikar` — that's the slug the user reported.
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part A — SSR meta + __PRAYER_CITY__ seed for /ur/{af-slug} ──');

const UR_CASES = [
    { slug: 'charikar',       ur: 'چاریکار',     en: 'Charikar' },
    { slug: 'kabul',          ur: 'کابل',        en: 'Kabul'    },
    { slug: 'herat',          ur: 'ہرات',        en: 'Herāt'    },
    { slug: 'mazar-e-sharif', ur: 'مزار شریف',   en: 'Mazār-e Sharīf' },
    { slug: 'jalalabad',      ur: 'جلال آباد',   en: 'Jalālābād'  }
];

for (const c of UR_CASES) {
    const r = await get('/ur/prayer-times-in-' + c.slug);
    const meta = extractMeta(r.body, 'ssr-city-name');
    const seed = extractPrayerCitySeed(r.body);
    const seedName = seed && seed.name ? String(seed.name) : '';
    const seedEn   = seed && seed.englishName ? String(seed.englishName) : '';

    const okStatus     = r.status === 200;
    const metaIsUrdu   = meta === c.ur;
    // Script check: must be in the Arabic Unicode block and have NO Latin.
    // We deliberately DON'T require Urdu-distinct chars (پ چ ک گ ہ ی etc.)
    // because some Urdu names like "جلال آباد" use only letters shared
    // with Arabic — and that's still a legitimate Urdu spelling.
    const metaIsScript = hasArabic(meta) && !hasLatin(meta);
    const seedNameIsUrdu = seedName === c.ur;
    const seedHasEnglish = seedEn && seedEn.length > 0;

    const allOk = okStatus && metaIsUrdu && metaIsScript && seedNameIsUrdu && seedHasEnglish;
    ok('/ur/prayer-times-in-' + c.slug.padEnd(18) + ' SSR carries Urdu name',
        allOk,
        '→ meta="' + meta + '" seed.name="' + seedName + '" seed.en="' + seedEn + '"');
}

// ───────────────────────────────────────────────────────────────────────
// PART B — Static code presence: fix markers in js/app.js
//
// These two markers must be present in the source after the fix.
// They're commented with the phase tag so a regression / accidental
// removal during refactor is caught by this test.
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part B — Static code presence in js/app.js ──');

const APP_JS_PATH = new URL('../js/app.js', import.meta.url);
const appSrc = readFileSync(APP_JS_PATH, 'utf8');

// Fix 1: _syncCityNameInDom must use absence-langs (ar/ur/bn) instead
// of the legacy AR-only `_isAr` flag for its Latin-rejection guard.
const fix1Marker = appSrc.includes('PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1')
    && appSrc.includes("new Set(['ar', 'ur', 'bn'])")
    && appSrc.includes('_isAbsenceLang')
    && /if\s*\(\s*_isAbsenceLang\s*&&\s*!_hasLatin\(ssrName\)/.test(appSrc);
ok('_syncCityNameInDom uses absence-langs (ar+ur+bn) Latin guard',
    fix1Marker);

// Fix 2: getDisplayCity must have a UR/BN priority block that returns
// `currentCity` when in proper script BEFORE the cityMap-or-English
// fallback chain.
const fix2Marker = appSrc.includes('PT-LANG-GUARD-3')
    && /if\s*\(\s*lang\s*===\s*'ur'\s*\|\|\s*lang\s*===\s*'bn'\s*\)\s*\{[\s\S]*?return currentCity;/.test(appSrc);
ok('getDisplayCity prefers currentCity for ur/bn when in proper script',
    fix2Marker);

// Fix 1 must NOT have removed the legacy AR comment (regression check —
// the AR pathway is intact, just generalized).
const arPathwayIntact = appSrc.includes('PT-LANG-GUARD-1')
    && appSrc.includes('Le Pontet'); // the original AR-only bug example
ok('PT-LANG-GUARD-1 (AR pathway) comment preserved (no accidental wipe)',
    arPathwayIntact);

// ───────────────────────────────────────────────────────────────────────
// PART C — No-regression on /ar/ + /en/ pages for same slugs
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part C — no-regression on /ar/ + /en/ pages ──');

const NO_REGRESSION = [
    { slug: 'charikar',  ar: 'تشاريكار', en: 'Charikar' },
    { slug: 'kabul',     ar: 'كابل',     en: 'Kabul'    },
    { slug: 'jalalabad', ar: 'جلال آباد', en: 'Jalālābād' }
];

for (const t of NO_REGRESSION) {
    const arResp = await get('/prayer-times-in-' + t.slug);
    const enResp = await get('/en/prayer-times-in-' + t.slug);
    const arName = extractMeta(arResp.body, 'ssr-city-name');
    const enName = extractMeta(enResp.body, 'ssr-city-name');
    const arOk = arName === t.ar;
    const enOk = enName === t.en;
    ok((t.slug + ' /ar + /en unaffected').padEnd(40),
        arOk && enOk,
        '→ ar="' + arName + '" en="' + enName + '"');
}

// ───────────────────────────────────────────────────────────────────────
// PART D — CRITICAL CHECK (user's exact reported case)
// ───────────────────────────────────────────────────────────────────────
console.log('\n── Part D — 🚨 CRITICAL: /ur/charikar must NEVER serve Latin "Charikar" ──');

const critResp = await get('/ur/prayer-times-in-charikar');
const critMeta = extractMeta(critResp.body, 'ssr-city-name');
const critSeed = extractPrayerCitySeed(critResp.body);
const critSeedName = critSeed && critSeed.name ? String(critSeed.name) : '';

// `چاریکار` HAS Urdu-distinct chars (چ ک ی), so the strict check works here
// and is informative — it proves the value really is the Urdu form and not
// some Arabic-block fillchain that happened to be Latin-free.
const critOk = critMeta === 'چاریکار'
    && critSeedName === 'چاریکار'
    && !hasLatin(critMeta)
    && !hasLatin(critSeedName)
    && hasUrduSpecific(critMeta)
    && hasUrduSpecific(critSeedName);

ok('SSR delivers پfix1 + پfix2 surfaces (meta + seed) with pure Urdu',
    critOk,
    '→ meta="' + critMeta + '" seed.name="' + critSeedName + '"');

// ───────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
