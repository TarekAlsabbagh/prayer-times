// Smoke: GLOBAL-NAV-LAST-CITY-CONTEXT-DEEP-LINKS-1
//   The sidebar-nav prayer-times / qibla / moon tabs deep-link to the user's current / last-used
//   city. The CLIENT rewrite (from sessionStorage last_city_context / city_moon + localStorage
//   lsb_detected) is browser-verified; this smoke guards the SSR contract + that the client wiring
//   exists. Run against a local server on :3000.
//   MOON-DAY-PAGES-REMOVAL-1: city-page moon nav → the nested HUB /moon/japan/tokyo (never /today); site-search.js
//   code (comments stripped) must not build /moon-today-in- or /today; its ?v in the country template is bumped above 4.
import http from 'node:http';
import fs from 'node:fs';

const BASE = 'http://localhost:3000';
let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('✓ ' + name); } else { fail++; console.log('✗ ' + name); } }
function req(path) {
    return new Promise((resolve) => {
        http.get(BASE + path, (res) => {
            let body = ''; res.on('data', (d) => body += d); res.on('end', () => resolve({ status: res.statusCode, body }));
        }).on('error', () => resolve({ status: 0, body: '' }));
    });
}

(async () => {
    const home = (await req('/')).body;
    const cityPage = (await req('/prayer-times-in-tokyo')).body;
    const country = (await req('/moon/saudi-arabia')).body;
    const appjs = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
    const sitesearch = fs.readFileSync(new URL('../js/site-search.js', import.meta.url), 'utf8');
    const tmpl = fs.readFileSync(new URL('../prayer-times-cities.html', import.meta.url), 'utf8');
    // MOON-DAY-PAGES-REMOVAL-1: scan CODE only (the removal comments legitimately mention the old shapes)
    const stripJsComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/.*$/gm, '$1');
    const sitesearchCode = stripJsComments(sitesearch);

    console.log('\n── SSR contract (homepage generic so the client can deep-link; city page already city-bound) ──');
    check('homepage: prayer-times nav href stays generic (/)', /<a href="\/" data-page="prayer-times"/.test(home));
    check('homepage: qibla nav href stays generic (/qibla)', /<a href="\/qibla" data-page="qibla"/.test(home));
    check('homepage: moon nav href stays generic (/moon)', /<a href="\/moon" data-page="moon"/.test(home));
    check('city page /prayer-times-in-tokyo: prayer nav SSR-rewritten → /prayer-times-in-tokyo', /<a href="\/prayer-times-in-tokyo" data-page="prayer-times"/.test(cityPage));
    check('city page: qibla nav → /qibla-in-tokyo', /<a href="\/qibla-in-tokyo" data-page="qibla"/.test(cityPage));
    check('city page: moon nav → NESTED hub /moon/japan/tokyo (never /today)', /<a href="\/moon\/japan\/tokyo" data-page="moon"/.test(cityPage));
    check('country page /moon/saudi-arabia: nav stays generic in SSR (client/site-search updates it)', /<a href="\/" [^>]*>[\s\S]*?<a href="\/qibla"[\s\S]*?<a href="\/moon"/.test(country) || /data-page/.test(country) === false);

    console.log('\n── client wiring ──');
    check('app.js: _lastCityForNav() helper exists', /function _lastCityForNav\s*\(/.test(appjs));
    check('app.js: _applyLastCityNavLinks() helper exists', /function _applyLastCityNavLinks\s*\(/.test(appjs));
    check('app.js: _lastCityForNav reads lsb_detected (homepage persistent source)', /function _lastCityForNav[\s\S]{0,1600}lsb_detected/.test(appjs));
    check('app.js: nav rewrite uses NESTED _nestedMoonHrefClient for moon (last-city slug)', /_nestedMoonHrefClient\(_lc/.test(appjs));
    check('app.js: 3 homepage short-circuits deep-link via _lastCityForNav (moon/prayer/qibla)', (appjs.match(/_lastCityForNav\(\)/g) || []).length >= 4);
    check('site-search.js: exposes applyNavCityLinks (country template, no app.js)', /applyNavCityLinks:\s*applyNavCityLinks/.test(sitesearch));
    check('site-search.js: persists slug in last_city_context seed', /slug:\s*r\.slug/.test(sitesearch));
    check('site-search.js: no-ops on the SPA (app.js owns the nav there)', /typeof window\._applyLastCityNavLinks === 'function'\) return/.test(sitesearch));
    // MOON-DAY-PAGES-REMOVAL-1 (inverted): the legacy fallback must never target the removed today pages.
    check('site-search.js: code never builds /moon-today-in- (removed today page)', !/moon-today-in-/.test(sitesearchCode));
    check('site-search.js: code never builds a /today href', !/\/today(?![a-z0-9-])/.test(sitesearchCode));
    // MOON-DAY-PAGES-REMOVAL-1: site-search.js changes in this ticket → its ?v must be bumped above the old 4.
    const _ssV = parseInt((tmpl.match(/site-search\.js\?v=(\d+)/) || [])[1] || '0', 10);
    check('country template loads site-search.js?v=N with N > 4 (bumped above the applyNavCityLinks + selected_city version)', _ssV > 4);

    console.log('\n── selected_city: explicit pick persists everywhere (incl. homepage) + outranks lsb_detected ──');
    check('site-search.js: writes selected_city on explicit pick', /setItem\('selected_city'/.test(sitesearch));
    check('site-search.js: country rewriter reads selected_city FIRST', /getItem\('selected_city'\)\s*\|\|\s*sessionStorage\.getItem\('last_city_context'\)/.test(sitesearch));
    check('app.js: _lastCityForNav reads selected_city as the TOP tier (before lsb)', /function _lastCityForNav[\s\S]{0,700}getItem\('selected_city'\)[\s\S]{0,1400}lsb_detected/.test(appjs));
    check('app.js: homepage hydrates globals from selected_city (_selHydrated)', /_selHydrated\s*=\s*true/.test(appjs));
    check('app.js: homepage lsb_detected is GUARDED so it never overrides selected_city', /if\s*\(!_selHydrated && _lsb && _validTs/.test(appjs));
    check('app.js: detectLocation() clears selected_city (intentional switch to "my location")', /function detectLocation\(\)[\s\S]{0,600}removeItem\('selected_city'\)/.test(appjs));

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
