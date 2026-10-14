// MOON-COUNTRY-CITY-LINKS-UPDATE-LOCATION-CONTEXT-1 — verification (self-contained).
//
// Bug: clicking a city in the /moon/{country} grid (or opening /moon/{country}/{city}[/today…]
// directly) left the destination header (#city-name) + global nav tabs on a stale/foreign city
// instead of the URL city. Root causes were client-side:
//   1) _initialSyncHydrate's nested-moon regex didn't include the /today suffix → currentCity fell
//      back to a country-capital default on /today pages.
//   2) getCurrentCityLabel/getDisplayCity Tier-0 (__PRAYER_CITY__) didn't recognize nested moon URLs.
//   3) _applyLastCityNavLinks early-returned on city pages (trusting an SSR nav pass that does NOT
//      cover nested moon), so the tabs fell to the generic hub or a stale site-search.js rewrite.
//   4) the grid card click never stored selected_city/last_city_context/city_moon before navigating.
//
// The runtime header/nav behavior is browser-verified (see the ticket PRE-PUSH report). This smoke
// pins the SSR source-of-truth (the per-lang __PRAYER_CITY__ seed the client now consumes) and the
// code-level invariants of the four client fixes, plus the scope guards (moon.js / SEO untouched).
//
// MOON-DAY-PAGES-REMOVAL-1: seed checks moved from the removed /today pages to the hubs; /today → 410; the NESTED_RE
//   static checks accept the app.js literal with or without the `\/today|` alternative.
//
// Run: node scripts/_smoke_moon_country_city_links_location_context_1.mjs
import http from 'node:http';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8266;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b, loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '', loc: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const prayerCitySeed = (b) => {
    const m = b.match(/window\.__PRAYER_CITY__\s*=\s*(\{[\s\S]*?\})\s*;/);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (_) { return null; }
};
// MOON-DAY-PAGES-REMOVAL-1: a removed day/today page answers 410 in ONE response (no Location, static gone body)
const is410 = (r) => r.status === 410 && !r.loc && /data-tp-gone="moon-day"/.test(r.body);
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const titleOf = (b) => (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';

const APP = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const TPL = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');
const MOONJS = fs.readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
// the nested-moon regex used by all four client fixes. MOON-DAY-PAGES-REMOVAL-1: the client may drop the `\/today|`
// alternative (the /today page is gone), so accept the literal with OR without it (the two strings are disjoint).
const NESTED_RE = String.raw`moon\/[a-z][a-z0-9-]+\/([a-z][a-z0-9-]+)(?:\/today|\/\d{4}`;
const NESTED_RE_NO_TODAY = String.raw`moon\/[a-z][a-z0-9-]+\/([a-z][a-z0-9-]+)(?:\/\d{4}`;
const nestedReHits = (src) => (src.split(NESTED_RE).length - 1) + (src.split(NESTED_RE_NO_TODAY).length - 1);

(async () => {
    const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
    try {
        if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

        // ── A) SSR __PRAYER_CITY__ seed = the URL city, on every nested moon city variant + lang ──
        console.log('── A) nested moon city pages SSR-seed __PRAYER_CITY__ = the URL city ──');
        // MOON-DAY-PAGES-REMOVAL-1: the /today pages are gone (410) → the seed checks run on the hubs.
        const hub = prayerCitySeed((await req('/moon/saudi-arabia/jeddah')).body);
        check('AR /moon/saudi-arabia/jeddah (hub) seeds slug=jeddah', !!hub && hub.slug === 'jeddah', hub && hub.slug);
        check('  …and a non-empty name', !!hub && typeof hub.name === 'string' && hub.name.length > 0, hub && hub.name);
        const istEn = prayerCitySeed((await req('/en/moon/turkey/istanbul')).body);
        check('EN /en/moon/turkey/istanbul (hub) seeds slug=istanbul', !!istEn && istEn.slug === 'istanbul', istEn && istEn.slug);
        check('  …with EN name "Istanbul" (lang-correct, not Arabic)', !!istEn && istEn.name === 'Istanbul', istEn && istEn.name);
        // year variant may or may not exist depending on data; only assert if the page seeds at all
        const yr = prayerCitySeed((await req('/moon/saudi-arabia/jeddah/2026')).body);
        if (yr) check('AR year /moon/saudi-arabia/jeddah/2026 seeds slug=jeddah', yr.slug === 'jeddah', yr.slug);

        // ── B) FIX 1 — _initialSyncHydrate nested regex includes /today + writes the nav context ──
        console.log('\n── B) FIX 1: pre-paint hydrator (nested regex + selected_city write) ──');
        check('app.js _initialSyncHydrate nested-moon regex present (with or without the /today alternative)', APP.includes(NESTED_RE) || APP.includes(NESTED_RE_NO_TODAY), '');
        check('app.js writes selected_city + last_city_context + city_moon for nested moon', /setItem\('selected_city', _navCtx\)[\s\S]{0,200}setItem\('last_city_context', _navCtx\)[\s\S]{0,200}setItem\('city_moon', _navSeed\)/.test(APP));

        // ── C) FIX 2 — header resolvers trust __PRAYER_CITY__ on nested moon routes ──
        console.log('\n── C) FIX 2: getCurrentCityLabel + getDisplayCity nested Tier-0 ──');
        const nestedHits = nestedReHits(APP);
        check('app.js nested-moon regex appears ≥3× (hydrate + 2 header resolvers; /today alternative optional)', nestedHits >= 3, String(nestedHits));
        check('app.js getCurrentCityLabel returns _strip(_pc.name) on nested match', /_nestM\s*&&\s*_nestM\[1\]\s*===\s*_pc\.slug\)\s*\{\s*return _strip\(_pc\.name\)/.test(APP));
        check('app.js getDisplayCity returns _pc.name on nested match', /_nestM\s*&&\s*_nestM\[1\]\s*===\s*_pc\.slug\)\s*\{\s*return _pc\.name/.test(APP));

        // ── D) FIX 3 — _applyLastCityNavLinks points the tabs at the page city (__PRAYER_CITY__) ──
        console.log('\n── D) FIX 3: nav tabs follow the URL city on nested moon pages ──');
        check('app.js _applyLastCityNavLinks has _isNestedMoonCity branch', /_isNestedMoonCity/.test(APP));
        check('  …and builds the tabs from __PRAYER_CITY__ (_pcNav)', /_pcNav\s*&&\s*_pcNav\.slug[\s\S]{0,400}?prayer-times-in-'\s*\+\s*_pcNav\.slug/.test(APP));

        // ── E) FIX 4 — grid card click stores context BEFORE nav + preserves open-in-new-tab ──
        console.log('\n── E) FIX 4: city-grid click (template) ──');
        check('template guards modified clicks (metaKey/ctrlKey/shiftKey/altKey/button)', /e\.metaKey \|\| e\.ctrlKey \|\| e\.shiftKey \|\| e\.altKey/.test(TPL) && /e\.button !== 0/.test(TPL));
        check('template writes selected_city + last_city_context before navigating', /setItem\('selected_city', _navCtx\)[\s\S]{0,160}setItem\('last_city_context', _navCtx\)/.test(TPL));
        check('template still navigates via window.location.href = href', /window\.location\.href = href;/.test(TPL));

        // ── F) SCOPE GUARDS — moon.js/Meeus untouched + nested-day SEO unchanged ──
        console.log('\n── F) scope guards (moon.js / SEO untouched) ──');
        check('js/moon.js carries NO ticket marker (untouched)', !/MOON-COUNTRY-CITY-LINKS-UPDATE-LOCATION-CONTEXT-1/.test(MOONJS));
        // MOON-DAY-PAGES-REMOVAL-1: the nested /today page is removed → 410 in ONE response (no Location).
        for (const tp of ['/moon/saudi-arabia/jeddah/today', '/en/moon/turkey/istanbul/today']) {
            const tr = await req(tp);
            check(`nested ${tp} → 410 (no Location, gone body)`, is410(tr), `${tr.status} loc=${tr.loc}`);
        }
        const hBody = (await req('/moon/saudi-arabia/jeddah')).body;
        check('hub /moon/saudi-arabia/jeddah canonical is self-referential (SEO unchanged)', /\/moon\/saudi-arabia\/jeddah$/.test(canonOf(hBody)), canonOf(hBody));
        check('hub still indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(hBody));
        check('hub title still present', titleOf(hBody).length > 0, titleOf(hBody).slice(0, 48));
        check('country page /moon/saudi-arabia still serves the city grid + filter', /id="country-city-filter"/.test((await req('/moon/saudi-arabia')).body));

        s.kill('SIGKILL');
    } catch (e) { console.error(e); try { s.kill('SIGKILL'); } catch (_) {} }
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
