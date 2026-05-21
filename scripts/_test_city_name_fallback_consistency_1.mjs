// scripts/_test_city_name_fallback_consistency_1.mjs
//
// CITY-NAME-FALLBACK-CONSISTENCY-1 verification (2026-05-20).
//
// Follow-up to CITY-NAME-SEO-FALLBACK-POLICY-1. After that phase, the
// server's SSR HTML correctly served "Gwangju" everywhere for
// /ur/prayer-times-in-gwangju (en-fallback per central helper). However
// the client-side hydration in js/app.js then called Nominatim
// reverse-geocode with accept-language=ur, got back `name:ur="گوانگ جو"`
// (Urdu transliteration of Gwangju) — and 3 client paths used that value
// to overwrite various surfaces on the page:
//
//   1. `getDisplayCity()` Tier-0 had an absence-lang Latin-seed
//      fallthrough that rejected the SSR seed "Gwangju" on /ur/ and
//      fell through to a chain that returned `currentLocalizedName`
//      ("گوانگ جو").
//   2. `getCurrentCityLabel()` had the twin fallthrough.
//   3. `_syncCityNameInDom()` accepted "گوانگ جو" as `goodName` and
//      walked the body replacing every "Gwangju" with "گوانگ جو".
//
// Result: `<title>` baked into SSR HTML stayed "Gwangju" while the H1 /
// breadcrumb / hero / cards / etc. got rewritten to "گوانگ جو" →
// inconsistent page with two different names for the same city.
//
// This test asserts the FIX: when SSR seed is the canonical en-fallback
// (Latin on absence-lang), the client must NEVER override with a
// non-Latin candidate from runtime sources (Nominatim transliteration,
// external geocoder, etc.).
//
// Pure offline test — checks static text patterns in js/app.js + curated
// fixture invariants. Browser-level DOM verification is covered by
// follow-up Preview MCP runs (logged in the closure report).
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, b, extra) => {
    (b ? pass++ : fail++);
    console.log((b ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' CITY-NAME-FALLBACK-CONSISTENCY-1 — verification (offline)');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');

const APP_JS = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
const INDEX_HTML = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// ─── Group 1: js/app.js — the 3 fallthrough patterns are gone ───────────
console.log('── Group 1: Old absence-lang Latin-seed fallthrough is removed ──');

// The OLD pattern in getDisplayCity / getCurrentCityLabel was:
//   const _isAbsenceLang = (lang === 'ar' || lang === 'ur' || lang === 'bn');
//   const _seedHasLatin = /[A-Za-z]/.test(_pc.name);
//   if (!_isAbsenceLang || !_seedHasLatin) {
//       return _pc.name;
//   }
// We must no longer see this exact conditional anywhere — those were
// the bugs that let Nominatim's transliteration win.
const OLD_PATTERN_1 = /const\s+_isAbsenceLang\s*=\s*\(\s*lang\s*===\s*'ar'/;
const OLD_PATTERN_2 = /const\s+_isAbsenceLangQc\s*=\s*\(\s*lang\s*===\s*'ar'/;
const OLD_PATTERN_3 = /const\s+_isAbsenceLang\s*=\s*\(\s*_ln\s*===\s*'ar'/;
const OLD_PATTERN_4 = /const\s+_isAbsenceLangQc\s*=\s*\(\s*_ln\s*===\s*'ar'/;
ok('getDisplayCity has NO _isAbsenceLang (Latin-seed fallthrough)',  !OLD_PATTERN_1.test(APP_JS));
ok('getDisplayCity has NO _isAbsenceLangQc (qibla path)',            !OLD_PATTERN_2.test(APP_JS));
ok('getCurrentCityLabel has NO _isAbsenceLang fallthrough',          !OLD_PATTERN_3.test(APP_JS));
ok('getCurrentCityLabel has NO _isAbsenceLangQc fallthrough',        !OLD_PATTERN_4.test(APP_JS));

// ─── Group 2: js/app.js — the new unconditional-trust comments ──────────
console.log('');
console.log('── Group 2: Unconditional-trust Tier-0 comments present ──');

ok('CITY-NAME-FALLBACK-CONSISTENCY-1 marker exists in js/app.js',
   /CITY-NAME-FALLBACK-CONSISTENCY-1/.test(APP_JS));
const ftcCount = (APP_JS.match(/CITY-NAME-FALLBACK-CONSISTENCY-1/g) || []).length;
ok('CITY-NAME-FALLBACK-CONSISTENCY-1 marker count >= 3 (3 fix sites)',
   ftcCount >= 3, '(actual: ' + ftcCount + ')');

// ─── Group 3: js/app.js — _syncCityNameInDom has reverse + universal guards ──
console.log('');
console.log('── Group 3: _syncCityNameInDom has universal + reverse guards ──');

// The original reverse guard for absence-lang Latin/non-Latin mismatch.
ok('_syncCityNameInDom original guard (Arabic ssrName, Latin goodName) present',
   /_isAbsenceLang\s*&&\s*!_hasLatin\(ssrName\)\s*&&\s*_hasLatin\(goodName\)/.test(APP_JS));
ok('_syncCityNameInDom absence-lang reverse guard (Latin ssrName, non-Latin goodName) present',
   /_isAbsenceLang\s*&&\s*_hasLatin\(ssrName\)\s*&&\s*_hasArOrBnEarly/.test(APP_JS));

// NEW: universal short-circuit at top of function — when URL slug matches
// __PRAYER_CITY__.slug AND __PRAYER_CITY__.name === ssrName, return early.
// Applies to ALL 10 supported langs.
ok('_syncCityNameInDom UNIVERSAL short-circuit (__PRAYER_CITY__ slug+name match) present',
   /_pc\.slug\s*===\s*_urlSlug[\s\S]{0,200}_pc\.name\s*===\s*ssrName/.test(APP_JS));
ok('_syncCityNameInDom UNIVERSAL short-circuit (__QIBLA_CITY__ slug+lang match) present',
   /_qc\.slug\s*===\s*_urlSlug[\s\S]{0,600}_qcLangName\s*===\s*ssrName/.test(APP_JS));

// ─── Group 4: cache-buster bumped ───────────────────────────────────────
console.log('');
console.log('── Group 4: index.html cache-buster bumped ──');
ok('index.html references js/app.js?v=666 (current)',
   /js\/app\.js\?v=666/.test(INDEX_HTML));
ok('index.html does NOT still reference js/app.js?v=665 (prev)',
   !/js\/app\.js\?v=665/.test(INDEX_HTML));
ok('index.html does NOT still reference js/app.js?v=664 (older)',
   !/js\/app\.js\?v=664/.test(INDEX_HTML));

// ─── Group 5: SSR fixture — Gwangju still served via en-fallback ──────
console.log('');
console.log('── Group 5: Gwangju curated entry retains en-fallback shape ──');

const curated = JSON.parse(readFileSync(new URL('../db/places/curated-places.json', import.meta.url), 'utf8'));
const gwangju = curated.find(x => x.slug === 'gwangju');
ok('gwangju entry exists',                  !!gwangju);
ok('gwangju.names.ar = "غوانغجو"',          gwangju && gwangju.names.ar === 'غوانغجو');
ok('gwangju.names.en = "Gwangju"',          gwangju && gwangju.names.en === 'Gwangju');
ok('gwangju.names.ur = "Gwangju" (legacy Latin pollution unchanged — curated NOT mutated)',
   gwangju && gwangju.names.ur === 'Gwangju');
ok('gwangju.names.bn = "Gwangju" (legacy Latin pollution unchanged)',
   gwangju && gwangju.names.bn === 'Gwangju');

// ─── Group 6: Server helper still produces the canonical en-fallback ──
console.log('');
console.log('── Group 6: Server helper still routes Gwangju /ur+/bn to en fallback ──');

const placeL10n = await import('../server/place-l10n/index.js');
const ur = placeL10n.default.getLocalizedPlaceName(gwangju, 'ur');
ok('helper Gwangju /ur/ displayName = "Gwangju"',   ur.displayName === 'Gwangju');
ok('helper Gwangju /ur/ sourceLang = "en"',         ur.sourceLang === 'en');
ok('helper Gwangju /ur/ isFallback = true',         ur.isFallback === true);
ok('helper Gwangju /ur/ hasNativeName = false',     ur.hasNativeName === false);
const bn = placeL10n.default.getLocalizedPlaceName(gwangju, 'bn');
ok('helper Gwangju /bn/ displayName = "Gwangju"',   bn.displayName === 'Gwangju');
ok('helper Gwangju /bn/ sourceLang = "en"',         bn.sourceLang === 'en');
ok('helper Gwangju /bn/ isFallback = true',         bn.isFallback === true);

// ─── Group 7: Regression — real native cities unaffected ───────────────
console.log('');
console.log('── Group 7: Regression — cities with real native names unchanged ──');

const cases = [
    ['karachi',  'ur', 'کراچی',     'ur'],
    ['dhaka',    'bn', 'ঢাকা',      'bn'],
    ['mumbai',   'ur', 'ممبئی',     'ur'],
    ['mumbai',   'bn', 'মুম্বই',    'bn'],
    ['varanasi', 'ur', 'وارانسی',   'ur'],
    ['varanasi', 'bn', 'বারাণসী',  'bn'],
    ['makkah',   'ar', 'مكة المكرمة', 'ar'],
    ['makkah',   'ur', 'مکہ',       'ur'],
    ['makkah',   'bn', 'মক্কা',     'bn']
];
for (const [slug, lang, expectedName, expectedSrc] of cases) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    const r = placeL10n.default.getLocalizedPlaceName(e, lang);
    ok(slug + ' /' + lang + '/ displayName = "' + expectedName + '"',
       r.displayName === expectedName,
       r.displayName === expectedName ? '' : '(actual: "' + r.displayName + '")');
    ok(slug + ' /' + lang + '/ sourceLang = "' + expectedSrc + '" (native, no fallback)',
       r.sourceLang === expectedSrc);
    ok(slug + ' /' + lang + '/ hasNativeName = true (regression preserved)',
       r.hasNativeName === true);
}

// ─── Group 8: curated-places.json byte-identity preserved ──────────────
console.log('');
console.log('── Group 8: curated-places.json byte-identity ──');

// Quick sanity: the fixture must still have the same Gwangju shape AND
// the total entry count matches current baseline (post ASIA-1D-IN-D: 2630).
ok('curated total entry count == 2977 (post TR-B)',
   curated.length === 2977,
   '(actual: ' + curated.length + ')');

// ─── Group 9: ALL 10 SUPPORTED_LANGS coverage matrix ──────────────────
console.log('');
console.log('── Group 9: ALL 10 SUPPORTED_LANGS × representative cities ──');

// Per the universal rule: SSR helper must produce ONE consistent name per
// (city, lang). The helper output IS what __PRAYER_CITY__.name carries on
// every canonical city page, and (with the new walker short-circuit) is
// what every surface on the page renders. So if the helper is consistent,
// the page is consistent.
const ALL_LANGS = ['ar','en','fr','de','tr','ur','id','es','bn','ms'];
const COVERAGE_CITIES = [
    { slug: 'gwangju',  reason: 'POLLUTION case (no real native for ur/bn — must be en-fallback for ALL except ar)' },
    { slug: 'makkah',   reason: 'FULL native L10N (all 10 langs have real names)' },
    { slug: 'karachi',  reason: 'PARTIAL native (has names.ur but not all)' },
    { slug: 'dhaka',    reason: 'PARTIAL native (has names.bn)' },
    { slug: 'mumbai',   reason: 'PARTIAL native (has both names.ur + names.bn)' },
    { slug: 'varanasi', reason: 'EN-fallback for fr/de/tr/id/es/ms (no Latin-lang names)' }
];
for (const { slug, reason } of COVERAGE_CITIES) {
    const e = curated.find(x => x.slug === slug);
    if (!e) { ok(slug + ' exists', false); continue; }
    console.log('  ' + slug + ' — ' + reason);
    for (const L of ALL_LANGS) {
        const r = placeL10n.default.getLocalizedPlaceName(e, L);
        // Sanity: displayName must be non-empty, must be one of:
        //   (a) names[L] when hasNativeName=true (script-validated)
        //   (b) names.en when isFallback=true (canonical en-fallback)
        const isNative = r.hasNativeName && e.names[L] === r.displayName && r.sourceLang === L;
        const isEnFallback = r.isFallback && r.sourceLang === 'en' && e.names.en === r.displayName;
        ok('    /' + L + '/ → "' + r.displayName + '" (' + (isNative ? 'native' : isEnFallback ? 'en-fallback' : 'other') + ')',
           !!r.displayName && (isNative || isEnFallback),
           (isNative || isEnFallback) ? '' : '(sourceLang=' + r.sourceLang + ' isFallback=' + r.isFallback + ')');
    }
}

// ─── Group 10: per-page consistency invariant ─────────────────────────
console.log('');
console.log('── Group 10: ONE name per (city, lang) — single source of truth ──');

// For each (city, lang) pair, calling the helper N times MUST always
// return the same displayName. (Idempotency of the central helper.)
for (const { slug } of COVERAGE_CITIES) {
    const e = curated.find(x => x.slug === slug);
    if (!e) continue;
    for (const L of ALL_LANGS) {
        const r1 = placeL10n.default.getLocalizedPlaceName(e, L);
        const r2 = placeL10n.default.getLocalizedPlaceName(e, L);
        const r3 = placeL10n.default.getLocalizedPlaceName(e, L);
        ok(slug + ' /' + L + '/ idempotent (' + r1.displayName + ')',
           r1.displayName === r2.displayName && r2.displayName === r3.displayName);
    }
}

// ─── Final tally ────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Results: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' total)');
console.log('═══════════════════════════════════════════════════════════════════════');

process.exit(fail === 0 ? 0 : 1);
