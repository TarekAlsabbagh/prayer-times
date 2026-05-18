// PLACE-CITY-PAGE-L10N-FIX-1 verification.
//
// The previous fix (PLACE-SLUG-RESOLUTION-FIX-1) made `_resolveCityName`
// and `/api/place-by-slug` resolve curated slugs to the correct localized
// name + country. But the prayer-times page header (#city-name +
// #country-name + #bc-city + #bc-country-name) was still EMPTY in the
// initial SSR HTML — JS populated it later via `loadCityData`. On a
// Render free-tier cold start (~2-5s) or under any JS delay (slow
// Nominatim, errors), the user would see:
//   • problem 1: city visible, country empty
//   • problem 2: city in English even on Arabic page (because the
//     SSR-injected `<meta name="ssr-city-name">` only set the TITLE;
//     other surfaces fell back to defaults)
//
// This test asserts that the SSR HTML for `/prayer-times-in-{slug}`
// already contains:
//   1. `<div class="city-name" id="city-name">شقرا</div>` — pre-filled
//      with the curated Arabic name (data-i18n attr DROPPED)
//   2. `<div class="country" id="country-name">المملكة العربية السعودية</div>`
//   3. `<span itemprop="name" id="bc-city" ...>شقرا</span>` — breadcrumb
//      city (later replaced by `updateBreadcrumb` with "مواقيت الصلاة في
//      شقرا" — but the SSR pre-fill ensures the FOUC window is correct)
//   4. `<span itemprop="name" id="bc-country-name">المملكة العربية السعودية</span>`
//   5. `<script id="ssr-prayer-city">window.__PRAYER_CITY__ = {...}</script>`
//      with full `{ slug, lat, lng, name, country, countryCode,
//      englishName, timezone, type, originalName, source }` — so the
//      client uses curated data directly, no Nominatim fallback.
//
// Negative cases:
//   • Country listing pages (/prayer-times-in-saudi-arabia) MUST NOT
//     receive the pre-fill (they're not city pages).
//   • Unknown slugs MUST NOT receive the pre-fill.
//   • Other city-tool routes (/qibla-in-, /moon-in-, etc.) MUST NOT
//     receive the pre-fill (this is prayer-page scoped).
//
// Pre-req: `node server.js` on localhost:8080. Curated must contain
// the post-Levant/Iraq + post-SYRIA-MISSING-FIX dataset (771 entries).

import http from 'node:http';

function get(path) {
    return new Promise((resolve) => {
        http.get({ host: 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body, headers: r.headers }));
        }).on('error', () => resolve({ status: 0, body: '', headers: {} }));
    });
}
function extract(html, re) {
    const m = html.match(re);
    return m ? m[1] : null;
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => { (b ? pass++ : fail++); console.log((b?'✓':'✗') + ' ' + label + (extra ? '   ' + extra : '')); };

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-CITY-PAGE-L10N-FIX-1 — SSR pre-fill verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ── A. Arabic page — curated cities pre-filled with Arabic name + country
console.log('\n── A. Arabic page (default `/prayer-times-in-{slug}`) ──');
const arCases = [
    ['shaqra',             'شقرا',           'المملكة العربية السعودية', 'sa', 'Asia/Riyadh'],
    ['hama',               'حماة',            'سوريا',                   'sy', 'Asia/Damascus'],
    ['seeb',               'السيب',          'سلطنة عمان',              'om', 'Asia/Muscat'],
    ['ad-diriyah',         'الدرعية',         'المملكة العربية السعودية', 'sa', 'Asia/Riyadh'],
    ['duma',               'دوما',            'سوريا',                   'sy', 'Asia/Damascus'],
    ['abu-ghurayb',        'أبو غريب',        'العراق',                  'iq', 'Asia/Baghdad'],
    ['umm-salal-muhammad', 'أم صلال محمد',    'قطر',                     'qa', 'Asia/Qatar'],
    ['jablah',             'جبلة',           'سوريا',                   'sy', 'Asia/Damascus'],
    ['bludan',             'بلودان',          'سوريا',                   'sy', 'Asia/Damascus'],
    ['az-zabadani',        'الزبداني',       'سوريا',                   'sy', 'Asia/Damascus'],
    // existing GCC + flagship Arab cities (regression — must still work)
    ['doha',               'الدوحة',         'قطر',                     'qa', 'Asia/Qatar'],
    ['baghdad',            'بغداد',          'العراق',                  'iq', 'Asia/Baghdad'],
    ['damascus',           'دمشق',           'سوريا',                   'sy', 'Asia/Damascus'],
    ['gaza',               'غزة',            'فلسطين',                  'ps', 'Asia/Gaza'],
    // PLACE-CITY-HEADER-L10N-FIX-1 (2026-05-14): the classic Mecca case —
    // slug='makkah' (Saudi government's preferred form) ≠ slugify(en='Mecca')
    // = 'mecca'. The pre-fix updateCityDisplay had a "Round 28" override
    // block that consulted FAMOUS_MOON_CITIES + _moonCityDisplayName when
    // currentEnglishName didn't slugify to the URL slug. For Makkah that
    // mismatch ALWAYS holds, so the block ran and overwrote #city-name
    // with the Title-cased slug "Makkah" — even though the SSR pre-fill
    // had already written "مكة المكرمة". Fixed by skipping the override
    // when window.__PRAYER_CITY__ is present and matches the current slug.
    //
    // Madinah is the parallel case (slug='medina' vs en='Medina' DOES
    // slugify-match, so it wasn't triggered — but include it as a regression
    // anchor in case the override logic is touched again).
    ['makkah',             'مكة المكرمة',     'المملكة العربية السعودية', 'sa', 'Asia/Riyadh'],
    ['medina',             'المدينة المنورة', 'المملكة العربية السعودية', 'sa', 'Asia/Riyadh'],
    ['riyadh',             'الرياض',          'المملكة العربية السعودية', 'sa', 'Asia/Riyadh'],
    ['jeddah',             'جدة',             'المملكة العربية السعودية', 'sa', 'Asia/Riyadh'],
];
for (const [slug, expectCity, expectCountry, expectCC, expectTZ] of arCases) {
    const r = await get('/prayer-times-in-' + slug);
    const cityText      = extract(r.body, /<div class="city-name" id="city-name"[^>]*>([^<]+)<\/div>/);
    const countryText   = extract(r.body, /<div class="country" id="country-name"[^>]*>([^<]+)<\/div>/);
    const bcCity        = extract(r.body, /<span itemprop="name" id="bc-city"[^>]*>([^<]+)<\/span>/);
    const bcCountry     = extract(r.body, /<span itemprop="name" id="bc-country-name"[^>]*>([^<]+)<\/span>/);
    const pcRaw         = extract(r.body, /<script id="ssr-prayer-city">window\.__PRAYER_CITY__=([^<]+?);<\/script>/);
    let pc = null;
    if (pcRaw) { try { pc = JSON.parse(pcRaw); } catch (_) {} }
    ok(`${slug} #city-name = "${expectCity}"`,
        cityText === expectCity, `(got "${cityText}")`);
    ok(`${slug} #country-name = "${expectCountry}"`,
        countryText === expectCountry, `(got "${countryText}")`);
    ok(`${slug} #bc-city = "${expectCity}"`,
        bcCity === expectCity, `(got "${bcCity}")`);
    ok(`${slug} #bc-country-name = "${expectCountry}"`,
        bcCountry === expectCountry, `(got "${bcCountry}")`);
    ok(`${slug} window.__PRAYER_CITY__ present + curated`,
        pc && pc.source === 'curated' && pc.countryCode === expectCC && pc.timezone === expectTZ,
        pc ? `(cc=${pc.countryCode}, tz=${pc.timezone}, src=${pc.source})` : '(no script)');
    ok(`${slug} window.__PRAYER_CITY__ name + country match SSR`,
        pc && pc.name === expectCity && pc.country === expectCountry);
    // The data-i18n attribute MUST be dropped on the pre-filled element
    // (otherwise i18n.js would overwrite with the "Locating..." default).
    ok(`${slug} #city-name has NO data-i18n attribute`,
        !/(<div class="city-name" id="city-name" data-i18n=)/.test(r.body));
}

// ── B. English page (/en/prayer-times-in-{slug}) — uses English name + country
console.log('\n── B. English page (`/en/prayer-times-in-{slug}`) ──');
const enCases = [
    ['shaqra',     'Shaqra',        'Saudi Arabia', 'sa'],
    ['jablah',     'Jablah',        'Syria',        'sy'],
    ['ad-diriyah', 'Ad Dir‘īyah',   'Saudi Arabia', 'sa'],
    ['seeb',       'Seeb',          'Oman',         'om'],
    // PLACE-CITY-HEADER-L10N-FIX-1: Mecca on EN page renders as "Mecca"
    // (the Intl-preferred English form, NOT the slug "Makkah"). Locks
    // in the EN side of the override-skip fix.
    ['makkah',     'Mecca',         'Saudi Arabia', 'sa'],
    ['medina',     'Medina',        'Saudi Arabia', 'sa'],
];
for (const [slug, expectCity, expectCountry, expectCC] of enCases) {
    const r = await get('/en/prayer-times-in-' + slug);
    const cityText    = extract(r.body, /<div class="city-name" id="city-name"[^>]*>([^<]+)<\/div>/);
    const countryText = extract(r.body, /<div class="country" id="country-name"[^>]*>([^<]+)<\/div>/);
    ok(`EN ${slug} #city-name = "${expectCity}"`,
        cityText === expectCity, `(got "${cityText}")`);
    ok(`EN ${slug} #country-name = "${expectCountry}"`,
        countryText === expectCountry, `(got "${countryText}")`);
}

// ── B2. PLACE-CITY-HEADER-L10N-FIX-1 — anti-Latin-leak guard for AR Makkah
// The original bug surfaced ONLY after JS ran (the SSR pre-fill was correct,
// but updateCityDisplay's "Round 28" override block then wrote "Makkah"
// over the Arabic name). The SSR HTML alone passes the test in section A;
// we need a guard that pins the FULL post-JS chain. Since this test script
// only inspects raw SSR HTML, the strongest guard we can lay here is:
//   1. The SSR <div id="city-name"> MUST NOT contain "Makkah" or "Mecca"
//      Latin tokens on the Arabic page (latin-leak guard).
//   2. The window.__PRAYER_CITY__ payload's `name` field MUST be Arabic.
// The post-JS verification is covered separately by the browser-based
// Preview MCP run during dev (see commit message).
console.log('\n── B2. AR Makkah — no Latin leak in SSR header ──');
{
    const r = await get('/prayer-times-in-makkah');
    const cityText = extract(r.body, /<div class="city-name" id="city-name"[^>]*>([^<]+)<\/div>/);
    const pcRaw    = extract(r.body, /<script id="ssr-prayer-city">window\.__PRAYER_CITY__=([^<]+?);<\/script>/);
    let pc = null;
    if (pcRaw) { try { pc = JSON.parse(pcRaw); } catch (_) {} }
    ok('SSR /prayer-times-in-makkah #city-name has NO "Makkah" Latin leak',
        !/Makkah/.test(cityText || ''),
        `(got "${cityText}")`);
    ok('SSR /prayer-times-in-makkah #city-name has NO "Mecca" Latin leak',
        !/Mecca/.test(cityText || ''),
        `(got "${cityText}")`);
    ok('SSR /prayer-times-in-makkah #city-name is purely Arabic',
        /[؀-ۿ]/.test(cityText || '') && !/[A-Za-z]/.test(cityText || ''),
        `(got "${cityText}")`);
    ok('SSR /prayer-times-in-makkah __PRAYER_CITY__.name is "مكة المكرمة"',
        pc && pc.name === 'مكة المكرمة',
        pc ? `(got "${pc.name}")` : '(missing pc)');
}

// ── C. Negative — country listing + unknown slugs MUST NOT receive pre-fill
console.log('\n── C. Negative cases — pre-fill MUST NOT leak ──');
// PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 (2026-05-18):
// /qibla-in-{slug} and /moon-in-{slug} now ALSO receive the seed (was
// previously gated to /prayer-times-in-* only). Removed those entries
// from this negative-cases list — they're verified positively in
// `_test_place_names_cross_page_navigation_consistency_fix_1.mjs`.
const negativeCases = [
    ['/prayer-times-in-saudi-arabia', 'country listing'],
    ['/prayer-times-in-syria',         'country listing'],
    ['/prayer-times-in-unknown-fake-slug-xyz', 'unknown slug'],
    ['/prayer-times-in-some-place',    'unknown slug'],
];
for (const [path, why] of negativeCases) {
    const r = await get(path);
    const hasPC = /<script id="ssr-prayer-city">window\.__PRAYER_CITY__=/.test(r.body);
    const cityPreFilled = /<div class="city-name" id="city-name">[^<]+<\/div>/.test(r.body)
                       && !/<div class="city-name" id="city-name" data-i18n=/.test(r.body);
    ok(`${path} (${why}) — NO window.__PRAYER_CITY__ script`, !hasPC);
    ok(`${path} (${why}) — #city-name keeps i18n default`, !cityPreFilled);
}

// ── D. Coord-URL variant /prayer-times-in-{slug}-{lat}-{lng} MUST NOT receive pre-fill
// (it's a long-tail Nominatim-resolved URL — different pipeline)
console.log('\n── D. Coord-URL variant — separate pipeline, no pre-fill ──');
{
    const r = await get('/prayer-times-in-shaqra-25.25-45.25');
    const hasPC = /<script id="ssr-prayer-city">/.test(r.body);
    ok('/prayer-times-in-{slug}-{lat}-{lng} — no SSR pre-fill (coord URL pipeline)', !hasPC);
}

// ── E. Cache + Vary headers (SSR HTML uses Cache-Control: no-cache)
console.log('\n── E. Cache headers regression ──');
{
    const r = await get('/prayer-times-in-shaqra');
    ok('SSR HTML retains Cache-Control: no-cache',
        /no-cache/.test(r.headers['cache-control'] || ''),
        `(got "${r.headers['cache-control']}")`);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
