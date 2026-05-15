// HOME-SEARCH-MIGRATION-PLAN-1 verification (2026-05-15).
//
// Tests the homepage-search feature flag + v2 fetcher integration:
//   • <meta name="homepage-search"> is injected into all HTML responses
//   • Default (no env var) → content="v1"
//   • Attribution span exists in index.html
//   • Attribution span is initially hidden (display:none)
//   • Existing /api/geocode proxy still works (v1 unchanged)
//   • Existing /api/search-place still works (v2 underlying call)
//   • Both responses include expected envelope fields
//
// What this script CANNOT verify (needs browser, see manual cases in §10.B):
//   • Live URL-param override (?searchV=1|2) routing on the homepage
//   • Click-through behavior + /api/place-selected persistence
//   • Attribution badge dynamic show/hide based on provider=locationiq
//
// Pre-req: node server.js running on localhost:8080.
// To verify v2 path: HOME_SEARCH_V2=on node server.js  (separate process)

import http from 'node:http';

function get(path, host) {
    return new Promise((resolve) => {
        http.get({ host: host || 'localhost', port: 8080, path }, r => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                try { resolve({ status: r.statusCode, body, json: JSON.parse(body), headers: r.headers }); }
                catch (_) { resolve({ status: r.statusCode, body, json: null, headers: r.headers }); }
            });
        }).on('error', () => resolve({ status: 0, body: '', json: null, headers: {} }));
    });
}

let pass = 0, fail = 0;
const ok = (label, b, extra) => { (b ? pass++ : fail++); console.log((b?'✓':'✗') + ' ' + label + (extra ? '   ' + extra : '')); };

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' HOME-SEARCH-MIGRATION-PLAN-1 — verification (local, no env var)');
console.log('═══════════════════════════════════════════════════════════════════════');

// ── A. Meta-tag injection on the homepage ─────────────────────────────
console.log('\n── A. <meta name="homepage-search"> injection ──');

{
    const r = await get('/');
    ok('GET / → HTTP 200',
        r.status === 200);
    const m = r.body.match(/<meta\s+name="homepage-search"\s+content="(v1|v2)">/);
    ok('Body contains <meta name="homepage-search">',
        Boolean(m));
    if (m) {
        ok('Default meta value === "v1" (HOME_SEARCH_V2 unset → safe default)',
            m[1] === 'v1',
            `(got "${m[1]}")`);
    }
}

// Verify meta tag is present on other HTML routes too (so /?searchV=2 on
// any page still works — e.g. user can test from /prayer-times-in-X).
{
    const r = await get('/prayer-times-in-riyadh');
    const m = r.body.match(/<meta\s+name="homepage-search"\s+content="(v1|v2)">/);
    ok('Meta also present on /prayer-times-in-{slug} routes',
        Boolean(m),
        m ? `(content="${m[1]}")` : '');
}

// ── B. Attribution span is present + hidden by default ───────────────
console.log('\n── B. Attribution span ──');

{
    const r = await get('/');
    const hasSpan = /id="search-attribution-locationiq"/.test(r.body);
    ok('Attribution span <#search-attribution-locationiq> present in HTML',
        hasSpan);
    const hidden = /id="search-attribution-locationiq"[^>]*style="[^"]*display:\s*none/i.test(r.body);
    ok('Attribution span is initially display:none (revealed by JS only)',
        hidden);
    const liqLink = /href="https:\/\/locationiq\.com/i.test(r.body);
    ok('Attribution links to locationiq.com',
        liqLink);
}

// ── C. Existing endpoints still work (regression guards) ─────────────
console.log('\n── C. v1 + v2 underlying endpoints both still work ──');

// v2 underlying: /api/search-place
{
    const r = await get('/api/search-place?q=Riyadh&lang=en');
    ok('/api/search-place curated query → HTTP 200',
        r.status === 200);
    ok('/api/search-place returns { results, source, status, provider }',
        r.json && Array.isArray(r.json.results)
        && typeof r.json.source === 'string'
        && typeof r.json.status === 'string'
        && Object.prototype.hasOwnProperty.call(r.json, 'provider'));
    ok('Curated Riyadh → source=curated, provider=""',
        r.json && r.json.source === 'curated' && r.json.provider === '');
}

// v1 underlying: /api/geocode (Nominatim proxy)
{
    const r = await get('/api/geocode?type=search&q=Riyadh&format=json&limit=2');
    ok('/api/geocode (v1 proxy) → still responsive',
        r.status === 200 || r.status === 429,   // 429 is also a valid "alive" response
        `(got HTTP ${r.status})`);
}

// ── D. JS resolver semantics (URL param > meta > default) ────────────
// This is a UNIT-level check: the resolver function name + key constants
// are present in js/app.js so the browser code path is reachable.
// (Full UI verification is in §10.B browser manual tests.)
console.log('\n── D. js/app.js v2 pieces present ──');

// Read the SOURCE file directly (the HTTP-served version is minified,
// so function signatures and parameter names are mangled). The source
// is authoritative for "is the code change present".
{
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(path.resolve('js', 'app.js'), 'utf8');
    ok('js/app.js source contains `_pickHomepageSearchVersion`',
        src.includes('_pickHomepageSearchVersion'));
    ok('js/app.js source contains `fetchCitySuggestionsV2`',
        src.includes('fetchCitySuggestionsV2'));
    ok('js/app.js source contains `_renderHomepageAttributionLocationIQ`',
        src.includes('_renderHomepageAttributionLocationIQ'));
    ok('js/app.js still contains legacy `function fetchCitySuggestions(` (v1 not deleted)',
        src.includes('function fetchCitySuggestions('));
    ok('js/app.js routes onCitySearchInput by version flag',
        /_pickHomepageSearchVersion\(\)/.test(src));
    ok('js/app.js navigateToCity accepts opts',
        /function navigateToCity\([^)]*opts\)/.test(src));
    ok('js/app.js selectCity accepts opts',
        /async function selectCity\([^)]*opts\)/.test(src));
    // /api/geocode proxy must NOT be removed in this phase
    ok('js/app.js still references /api/geocode (v1 proxy intact)',
        src.includes('/api/geocode'));
    ok('js/app.js still references nomUrl (v1 helper intact)',
        src.includes('nomUrl('));
    // The HTTP-served version may or may not be minified — just check it's reachable
    const r = await get('/js/app.js');
    ok('js/app.js served via HTTP (200)',
        r.status === 200);
}

// ── E. Startup-log sentinel ──────────────────────────────────────────
// The server logs the chosen version on startup. We can't read the
// Render logs from here, but we can confirm the meta tag matches what
// `HOME_SEARCH_V2` would resolve to.
console.log('\n── E. Default behavior contract ──');

{
    const r = await get('/');
    const m = r.body.match(/<meta\s+name="homepage-search"\s+content="(v1|v2)">/);
    ok('Without HOME_SEARCH_V2 env var → v1 is the default',
        m && m[1] === 'v1',
        `(got "${m && m[1]}")`);
}

// ── F. v2 result-row shape (via /api/search-place direct check) ──────
// The v2 fetcher renders rows from these exact fields. Verify the API
// continues to return them so the renderer never NPEs.
console.log('\n── F. /api/search-place result row shape ──');

{
    const r = await get('/api/search-place?q=Riyadh&lang=en');
    const top = r.json && r.json.results && r.json.results[0];
    ok('Result has slug',         top && typeof top.slug === 'string' && top.slug.length > 0);
    ok('Result has lat (number)', top && typeof top.lat === 'number');
    ok('Result has lng (number)', top && typeof top.lng === 'number');
    ok('Result has timezone',     top && typeof top.timezone === 'string' && top.timezone.length > 0);
    ok('Result has countryCode (2-letter)', top && /^[a-z]{2}$/.test(top.countryCode || ''));
    ok('Result has displayName',  top && typeof top.displayName === 'string' && top.displayName.length > 0);
    ok('Result has countryName',  top && typeof top.countryName === 'string' && top.countryName.length > 0);
    ok('Result has typeLabel',    top && typeof top.typeLabel === 'string');
    ok('Result has secondaryName',top && typeof top.secondaryName === 'string');
    ok('Result has source',       top && typeof top.source === 'string');
    ok('Result has originalName (string, may be empty)', top && typeof top.originalName === 'string');
}

console.log('');
console.log(`Result: ${pass} pass / ${fail} fail`);
if (fail > 0) process.exit(1);
