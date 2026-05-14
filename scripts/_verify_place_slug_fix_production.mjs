// PLACE-SLUG-RESOLUTION-FIX-1 — post-deploy production verification.
//
// Run this AFTER `git push` deploys to Render:
//   node scripts/_verify_place_slug_fix_production.mjs
//
// Exercises the full click-through chain for the 9 cities the user
// asked to verify (الدرعية / حماة / دوما / أبو غريب / السيب /
// شقرا / جبلة / بلودان / الزبداني):
//
//   1. /api/search-place?q=<arabic-name>&lang=ar     → top result has correct slug + cc + tz
//   2. /api/place-by-slug?slug=<slug>&lang=ar         → curated source, correct fields
//   3. /prayer-times-in-<slug>                        → SSR title matches city name
//   4. SSR HTML MUST NOT contain "Malaysia" or "Jalan"  (the bug we fixed)
//
// Exits 1 on any failure so CI / cron monitors can flag regressions.

import https from 'node:https';
import http from 'node:http';

const ORIGIN = process.argv[2] || 'https://prayer-times-d4w8.onrender.com';
const useHttps = ORIGIN.startsWith('https://');
const httpMod = useHttps ? https : http;

function getJson(path) {
    return new Promise((resolve) => {
        const url = ORIGIN + path;
        httpMod.get(url, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try { resolve({ status: r.statusCode, json: JSON.parse(body), body }); }
                catch (_) { resolve({ status: r.statusCode, json: null, body }); }
            });
        }).on('error', () => resolve({ status: 0, json: null, body: '' }));
    });
}
function getHtml(path) {
    return new Promise((resolve) => {
        const url = ORIGIN + path;
        httpMod.get(url, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => resolve({ status: r.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 9 cities. Each row: [Arabic name, expected curated slug substring,
// expected cc, expected tz]. The slug check uses .includes() so it
// tolerates the canonical curated slug being slightly different from
// the obvious transliteration (e.g. السيب → 'seeb', not 'as-sib').
const cities = [
    ['الدرعية',       'diriyah',     'sa', 'Asia/Riyadh'],
    ['حماة',           'hama',        'sy', 'Asia/Damascus'],
    ['دوما',           'duma',        'sy', 'Asia/Damascus'],
    ['أبو غريب',       'abu-ghurayb', 'iq', 'Asia/Baghdad'],
    ['السيب',          'seeb',        'om', 'Asia/Muscat'],
    ['شقرا',           'shaqra',      'sa', 'Asia/Riyadh'],
    // CURATED-SYRIA-MISSING-PLACES-FIX-1 — these were the missing ones.
    ['جبلة',           'jablah',      'sy', 'Asia/Damascus'],
    ['بلودان',         'bludan',      'sy', 'Asia/Damascus'],
    ['الزبداني',       'az-zabadani', 'sy', 'Asia/Damascus'],
];

let pass = 0, fail = 0;
const ok = (label, b, extra) => { (b ? pass++ : fail++); console.log((b?'✓':'✗') + ' ' + label + (extra ? '   ' + extra : '')); };

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' PLACE-SLUG-RESOLUTION-FIX-1 — production verification');
console.log(' Origin: ' + ORIGIN);
console.log('═══════════════════════════════════════════════════════════════════════');

for (const [q, expectSlugFrag, expectCC, expectTZ] of cities) {
    console.log('');
    console.log('── ' + q + ' ──');
    // Step 1: search
    const sr = await getJson('/api/search-place?q=' + encodeURIComponent(q) + '&lang=ar');
    const top = sr.json && sr.json.results && sr.json.results[0];
    const slug = top && top.slug;
    ok('  /api/search-place → top has slug',
        Boolean(slug), `(got slug="${slug}", src=${top&&top.source})`);
    ok('  /api/search-place → top.countryCode === "' + expectCC + '"',
        top && top.countryCode === expectCC, `(got "${top&&top.countryCode}")`);
    ok('  /api/search-place → top.timezone === "' + expectTZ + '"',
        top && top.timezone === expectTZ, `(got "${top&&top.timezone}")`);
    ok('  /api/search-place → top.source === "curated"',
        top && top.source === 'curated', `(got "${top&&top.source}")`);
    ok('  /api/search-place → top.slug contains "' + expectSlugFrag + '"',
        slug && slug.includes(expectSlugFrag), `(got "${slug}")`);
    if (!slug) { continue; }
    await sleep(200);

    // Step 2: /api/place-by-slug (NEW endpoint — proves the fix is deployed)
    const pbsr = await getJson('/api/place-by-slug?slug=' + encodeURIComponent(slug) + '&lang=ar');
    const pbs = pbsr.json && pbsr.json.result;
    ok('  /api/place-by-slug → endpoint exists (200 OK)',
        pbsr.status === 200, `(got HTTP ${pbsr.status})`);
    ok('  /api/place-by-slug → source === "curated"',
        pbsr.json && pbsr.json.source === 'curated', `(got "${pbsr.json && pbsr.json.source}")`);
    ok('  /api/place-by-slug → result has lat + lng + timezone + countryCode',
        pbs && isFinite(pbs.lat) && isFinite(pbs.lng) && pbs.timezone && pbs.countryCode,
        pbs ? `(lat=${pbs.lat}, lng=${pbs.lng}, tz=${pbs.timezone}, cc=${pbs.countryCode})` : '(no result)');
    ok('  /api/place-by-slug → name has Arabic chars',
        pbs && pbs.name && /[؀-ۿ]/.test(pbs.name), `(name="${pbs&&pbs.name}")`);
    await sleep(200);

    // Step 3: SSR /prayer-times-in-{slug}
    const ssrR = await getHtml('/prayer-times-in-' + encodeURIComponent(slug));
    const m = ssrR.body.match(/<title>([^<]+)<\/title>/);
    const ssrTitle = m ? m[1] : '';
    ok('  SSR /prayer-times-in-' + slug + ' → HTTP 200',
        ssrR.status === 200, `(got HTTP ${ssrR.status})`);
    ok('  SSR title contains display name "' + (top.displayName || '') + '"',
        ssrTitle.includes(top.displayName || ''), `(got "${ssrTitle}")`);
    // THE bug we fixed — Malaysia / Jalan should NEVER appear in the
    // city-identifying parts of the page (title, OG metadata, H1,
    // breadcrumbs, JSON-LD). They legitimately appear in the country
    // tile listing (/prayer-times-in-malaysia), so a whole-body check
    // produces false positives. We extract the slices that the user
    // actually sees as "what city is this page about?" and check those.
    const _titleHasMalaysia = /Malaysia|ماليزيا/.test(ssrTitle);
    const _ogTitleM = ssrR.body.match(/<meta property="og:title" content="([^"]+)"/);
    const _ogDescM  = ssrR.body.match(/<meta property="og:description" content="([^"]+)"/);
    const _ogTitleHasMalaysia = _ogTitleM && /Malaysia|ماليزيا/.test(_ogTitleM[1]);
    const _ogDescHasMalaysia  = _ogDescM  && /Malaysia|ماليزيا/.test(_ogDescM[1]);
    // H1 — the bare-slug route emits a generic prayer-times H1 (city
    // name + اليوم); if "Malaysia" is in there, the slug wrongly
    // resolved to a Malaysian place.
    const _h1M = ssrR.body.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const _h1HasMalaysia = _h1M && /Malaysia|ماليزيا/.test(_h1M[1]);
    // Jalan Salim Bachok was the specific Malaysian street that the
    // original bug surfaced. If we still see it ANYWHERE in the body
    // we're broken — the country tile doesn't contain the street name.
    const _bodyHasJalan = /Jalan\s+Salim\s+Bachok/i.test(ssrR.body);
    ok('  SSR <title> does NOT contain "Malaysia"', !_titleHasMalaysia,
        _titleHasMalaysia ? `(title="${ssrTitle}")` : '');
    ok('  SSR og:title does NOT contain "Malaysia"', !_ogTitleHasMalaysia,
        _ogTitleHasMalaysia ? `(og:title="${_ogTitleM[1]}")` : '');
    ok('  SSR og:description does NOT contain "Malaysia"', !_ogDescHasMalaysia,
        _ogDescHasMalaysia ? `(og:description="${_ogDescM[1]}")` : '');
    ok('  SSR <h1> does NOT contain "Malaysia"', !_h1HasMalaysia,
        _h1HasMalaysia ? `(h1="${_h1M[1]}")` : '');
    ok('  SSR body does NOT contain "Jalan Salim Bachok"', !_bodyHasJalan);

    // ─── PLACE-CITY-PAGE-L10N-FIX-1 (2026-05-14) ────────────────────────
    // SSR pre-fill checks. The bare-slug prayer page MUST surface the
    // city + country in #city-name + #country-name + breadcrumb BEFORE
    // JS runs. Previously these elements were empty placeholders that
    // only got populated by JS — caused FOUC where country was missing
    // on cold-start. The pre-fill also injects `window.__PRAYER_CITY__`
    // so the client never falls back to Nominatim for curated slugs.
    const cityNameM       = ssrR.body.match(/<div class="city-name" id="city-name"[^>]*>([^<]+)<\/div>/);
    const countryNameM    = ssrR.body.match(/<div class="country" id="country-name"[^>]*>([^<]+)<\/div>/);
    const bcCityM2        = ssrR.body.match(/<span itemprop="name" id="bc-city"[^>]*>([^<]+)<\/span>/);
    const bcCountryM2     = ssrR.body.match(/<span itemprop="name" id="bc-country-name"[^>]*>([^<]+)<\/span>/);
    const prayerCityM     = ssrR.body.match(/<script id="ssr-prayer-city">window\.__PRAYER_CITY__=([^<]+?);<\/script>/);
    let prayerCityObj = null;
    if (prayerCityM) { try { prayerCityObj = JSON.parse(prayerCityM[1]); } catch (_) {} }
    ok('  SSR #city-name pre-filled (NOT "جاري تحديد الموقع...")',
        cityNameM && !/تحديد الموقع/.test(cityNameM[1]),
        cityNameM ? `(got "${cityNameM[1]}")` : '(missing)');
    ok('  SSR #country-name pre-filled (NOT empty)',
        countryNameM && countryNameM[1].trim().length > 0,
        countryNameM ? `(got "${countryNameM[1]}")` : '(missing)');
    ok('  SSR #bc-city pre-filled (NOT "--")',
        bcCityM2 && bcCityM2[1] !== '--',
        bcCityM2 ? `(got "${bcCityM2[1]}")` : '(missing)');
    ok('  SSR #bc-country-name pre-filled (NOT "--")',
        bcCountryM2 && bcCountryM2[1] !== '--',
        bcCountryM2 ? `(got "${bcCountryM2[1]}")` : '(missing)');
    ok('  SSR window.__PRAYER_CITY__ script present',
        Boolean(prayerCityObj),
        prayerCityObj ? `(name="${prayerCityObj.name}")` : '(missing)');
    ok('  SSR window.__PRAYER_CITY__ has Arabic name (no English leak on AR page)',
        prayerCityObj && prayerCityObj.name && /[؀-ۿ]/.test(prayerCityObj.name) && !/[A-Za-z]/.test(prayerCityObj.name),
        prayerCityObj ? `(name="${prayerCityObj.name}")` : '');
    ok('  SSR window.__PRAYER_CITY__ has Arabic country (not English fallback)',
        prayerCityObj && prayerCityObj.country && /[؀-ۿ]/.test(prayerCityObj.country),
        prayerCityObj ? `(country="${prayerCityObj.country}")` : '');
    ok('  SSR window.__PRAYER_CITY__ countryCode === "' + expectCC + '"',
        prayerCityObj && prayerCityObj.countryCode === expectCC,
        prayerCityObj ? `(cc="${prayerCityObj.countryCode}")` : '');
    ok('  SSR window.__PRAYER_CITY__ timezone === "' + expectTZ + '"',
        prayerCityObj && prayerCityObj.timezone === expectTZ,
        prayerCityObj ? `(tz="${prayerCityObj.timezone}")` : '');
    await sleep(200);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(`Result: ${pass} pass / ${fail} fail`);
console.log('═══════════════════════════════════════════════════════════════════════');
if (fail > 0) process.exit(1);
