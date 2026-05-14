// PLACE-SLUG-RESOLUTION-FIX-1 verification.
//
// Tests two interlocked fixes:
//
//   1. /api/place-by-slug — server-side resolver that consults curated
//      first, then discovered_places (Supabase), then returns source:'none'
//      (no Nominatim — the client owns the external fallback). This kills
//      the "Malaysia / Jalan Salim Bachok" bug where a curated slug
//      navigated to /prayer-times-in-{slug}, hit the client-side
//      geocodeSlug() fallback, which did a Nominatim text search and
//      matched a random unrelated address worldwide.
//
//   2. /prayer-times-in-{slug} SSR — the bare-slug city route now
//      consults `_findPlaceBySlug` BEFORE falling through to
//      `_resolveCityName`'s legacy resolvers (POPULAR_CITY_NAMES +
//      cities-*.json). Curated entries (GCC, Levant+Iraq, and any
//      future wave) render the right Arabic city name in the SSR
//      <title> immediately, and the JSON-LD geo block carries the
//      curated lat/lng.
//
// Pre-req: `node server.js` running on localhost:8080. Curated must
// contain damascus/aleppo/baghdad/amman/beirut/gaza (post-Wave-2) AND
// the 3 SYRIA-MISSING-PLACES-FIX entries (jablah/bludan/az-zabadani).

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
async function bySlug(slug, lang) {
    const r = await get('/api/place-by-slug?slug=' + encodeURIComponent(slug) + '&lang=' + encodeURIComponent(lang || 'ar'));
    try { return { http: r.status, headers: r.headers, body: JSON.parse(r.body) }; }
    catch (_) { return { http: r.status, headers: r.headers, body: { result: null, source: 'parse_error' } }; }
}
async function ssrTitle(slug, lang) {
    const langPrefix = (lang && lang !== 'ar') ? ('/' + lang) : '';
    const r = await get(langPrefix + '/prayer-times-in-' + slug);
    const m = r.body.match(/<title>([^<]+)<\/title>/);
    return { http: r.status, title: m ? m[1] : '' };
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

let pass = 0, fail = 0;
function check(label, ok, extra) {
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✓' : '✗'} ${label}${extra ? '   ' + extra : ''}`);
}

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-SLUG-RESOLUTION-FIX-1 — /api/place-by-slug + SSR resolver fix');
console.log('═══════════════════════════════════════════════════════════════════════');

// ── A. Curated slugs resolve via /api/place-by-slug ──────────────────────
console.log('\n── A. /api/place-by-slug — curated entries ──');

// Damascus (an existing entry, pre-existing across all 10 langs) is the
// strongest sanity check: same place, 10 languages, all 10 must come back
// from the curated layer with the correct localized name.
const damascusLangs = [
    ['ar', 'دمشق'],
    ['en', 'Damascus'],
    ['fr', 'Damas'],
    ['tr', 'Şam'],
    ['de', 'Damaskus'],
    ['id', 'Damaskus'],
    ['es', 'Damasco'],
];
for (const [lang, expectName] of damascusLangs) {
    const { http: s, body } = await bySlug('damascus', lang);
    const ok = (s === 200)
            && body.source === 'curated'
            && body.result
            && body.result.countryCode === 'sy'
            && body.result.timezone === 'Asia/Damascus'
            && body.result.name === expectName;
    check(`/api/place-by-slug damascus lang=${lang} → curated/sy/Asia/Damascus name="${expectName}"`,
        ok, body.result ? `(got name="${body.result.name}")` : `(no result)`);
    await sleep(50);
}

// Cross-region: a representative GCC slug + a representative Levant+Iraq slug
// + a Palestine Asia/Gaza slug (separate IANA zone from Asia/Hebron).
const sample = [
    ['doha',         'ar', 'qa', 'Asia/Qatar',    'الدوحة'],
    ['kuwait-city',  'ar', 'kw', 'Asia/Kuwait',   'الكويت'],
    ['baghdad',      'ar', 'iq', 'Asia/Baghdad',  'بغداد'],
    ['amman',        'ar', 'jo', 'Asia/Amman',    'عمّان'],
    ['beirut',       'ar', 'lb', 'Asia/Beirut',   'بيروت'],
    ['khan-yunis',   'ar', 'ps', 'Asia/Gaza',     'خان يونس'],
    ['tubas',        'ar', 'ps', 'Asia/Hebron',   'طوباس'],
];
for (const [slug, lang, expectCC, expectTZ, expectName] of sample) {
    const { http: s, body } = await bySlug(slug, lang);
    const ok = (s === 200)
            && body.source === 'curated'
            && body.result
            && body.result.countryCode === expectCC
            && body.result.timezone === expectTZ
            && body.result.name === expectName;
    check(`/api/place-by-slug ${slug} lang=${lang} → curated/${expectCC}/${expectTZ} name="${expectName}"`,
        ok, body.result ? `(got cc=${body.result.countryCode}, tz=${body.result.timezone}, name="${body.result.name}")` : `(no result)`);
    await sleep(50);
}

// ── B. CURATED-SYRIA-MISSING-PLACES-FIX-1 — jablah + bludan + az-zabadani ─
console.log('\n── B. /api/place-by-slug — CURATED-SYRIA-MISSING-PLACES-FIX-1 ──');
const syriaFix = [
    ['jablah',      'جبلة',     'sy', 'Asia/Damascus'],
    ['bludan',      'بلودان',    'sy', 'Asia/Damascus'],
    ['az-zabadani', 'الزبداني',  'sy', 'Asia/Damascus'],
];
for (const [slug, expectName, expectCC, expectTZ] of syriaFix) {
    const { http: s, body } = await bySlug(slug, 'ar');
    const ok = (s === 200)
            && body.source === 'curated'
            && body.result
            && body.result.countryCode === expectCC
            && body.result.timezone === expectTZ
            && body.result.name === expectName
            && isFinite(body.result.lat)
            && isFinite(body.result.lng)
            && body.result.lat > 30 && body.result.lat < 38    // SY box
            && body.result.lng > 34 && body.result.lng < 43;   // SY box
    check(`/api/place-by-slug ${slug} → curated/${expectCC}/${expectTZ} name="${expectName}" + within SY bbox`,
        ok, body.result ? `(got name="${body.result.name}", lat=${body.result.lat}, lng=${body.result.lng})` : `(no result)`);
    await sleep(50);
}

// ── C. Negative cases — missing slugs MUST NOT fall to Nominatim ─────────
console.log('\n── C. /api/place-by-slug — negative / edge cases ──');

// A slug that's not in curated and not in discovered → source='none'.
// CRITICAL: the response MUST be source='none' (not 'external') — the
// endpoint is contracted to never call Nominatim. The CLIENT decides
// whether to fall back externally.
const negativeCases = [
    ['nonexistent-fake-city-xyz', 'fabricated slug not in any layer'],
    ['jalan-salim-bachok',        'Malaysian street name (Nominatim trap)'],
    ['some-random-place',         'generic non-match'],
];
for (const [slug, why] of negativeCases) {
    const { http: s, body } = await bySlug(slug, 'ar');
    const ok = (s === 200) && body.result === null && body.source === 'none';
    check(`/api/place-by-slug ${slug} (${why}) → null/none (no Nominatim leak)`,
        ok, `(http=${s}, source=${body.source})`);
    await sleep(50);
}

// Invalid input → 400. Note: uppercase slug "Damascus" is NOT invalid —
// the endpoint normalizes to lowercase before lookup, so the client may
// pass either case (matches how /api/search-place handles query case).
const invalidCases = [
    ['',           'empty slug'],
    ['../etc/passwd', 'path traversal'],
    ['has spaces', 'spaces — must hit the regex'],
    ['x'.repeat(150), 'over-long slug'],
];
for (const [slug, why] of invalidCases) {
    const { http: s, body } = await bySlug(slug, 'ar');
    const ok = (s === 400) && body.error === 'invalid_slug';
    check(`/api/place-by-slug "${slug.slice(0,20)}${slug.length>20?'…':''}" (${why}) → 400 invalid_slug`,
        ok, `(http=${s})`);
    await sleep(50);
}

// Uppercase MUST auto-lowercase + match curated (not reject)
{
    const { http: s, body } = await bySlug('Damascus', 'ar');
    const ok = (s === 200) && body.source === 'curated' && body.result && body.result.slug === 'damascus';
    check(`/api/place-by-slug "Damascus" (uppercase) → auto-lowercase + curated match`,
        ok, `(http=${s}, source=${body.source}, slug=${body.result&&body.result.slug})`);
    await sleep(50);
}

// ── D. SSR /prayer-times-in-{slug} title for curated entries ─────────────
// The route at server.js bare-slug section calls `_resolveCityName` which
// now consults `_findPlaceBySlug` FIRST. Curated slugs MUST surface their
// localized name (not Title-Cased slug words). This locks in the SSR side
// of the fix — the bit users see before any JS runs.
console.log('\n── D. SSR /prayer-times-in-{slug} title (curated names) ──');
const ssrCases = [
    // existing curated (regression — must not break)
    ['damascus',     'دمشق'],
    ['aleppo',       'حلب'],
    ['baghdad',      'بغداد'],
    ['amman',        'عمّان'],
    ['beirut',       'بيروت'],
    ['gaza',         'غزة'],
    // GCC sample (regression)
    ['doha',         'الدوحة'],
    ['abu-dhabi',    'أبوظبي'],
    ['manama',       'المنامة'],
    ['muscat',       'مسقط'],
    // CURATED-SYRIA-MISSING-PLACES-FIX-1
    ['jablah',       'جبلة'],
    ['bludan',       'بلودان'],
    ['az-zabadani',  'الزبداني'],
];
for (const [slug, expectAr] of ssrCases) {
    const { http: s, title } = await ssrTitle(slug, 'ar');
    const ok = (s === 200) && title.includes(expectAr) && !/^[a-zA-Z\s|]+$/.test(title.split('|')[0]);
    check(`SSR /prayer-times-in-${slug} title contains "${expectAr}"`,
        ok, `(got "${title}")`);
    await sleep(50);
}

// ── E. SSR regression — unknown slug still falls back gracefully ─────────
// Slugs not in any layer (curated, discovered, or cities-*.json) MUST
// still produce a valid SSR page — they'll Title-Case the slug words.
// We don't want a 500 or a blank title.
console.log('\n── E. SSR regression — unknown slug Title-Case fallback ──');
const fallbackCases = [
    ['some-fake-slug', 'Some Fake Slug'],
    ['unknown-place',  'Unknown Place'],
];
for (const [slug, expectTC] of fallbackCases) {
    const { http: s, title } = await ssrTitle(slug, 'ar');
    const ok = (s === 200) && title.includes(expectTC);
    check(`SSR /prayer-times-in-${slug} fallback Title-Case → "${expectTC}"`,
        ok, `(got "${title}")`);
    await sleep(50);
}

// ── F. Cache + rate-limit hardening ──────────────────────────────────────
console.log('\n── F. Cache headers + rate-limit tier ──');
{
    const { headers } = await bySlug('damascus', 'ar');
    check(`curated response has Cache-Control max-age + s-maxage`,
        /max-age=300/.test(headers['cache-control'] || '') &&
        /s-maxage=3600/.test(headers['cache-control'] || ''),
        `(got "${headers['cache-control']}")`);
    check(`curated response has Vary: Accept-Language`,
        /accept-language/i.test(headers['vary'] || ''),
        `(got "${headers['vary']}")`);
    check(`/api/place-by-slug uses cheap rate-limit tier`,
        (headers['x-ratelimit-tier'] || '').includes('cheap'),
        `(got "${headers['x-ratelimit-tier']}")`);
    check(`curated response sets X-Place-Source: curated`,
        (headers['x-place-source'] || '') === 'curated',
        `(got "${headers['x-place-source']}")`);
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
