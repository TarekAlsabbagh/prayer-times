// MOON-ROUTES-STRUCTURE-GUARDRAILS-1 — structural guardrails for the moon route family.
//
// PINS the moon route contract (see reports/moon-routes-structure-contract-1.md) so any
// future change that breaks moon pages — empty 200 shells, footer-only, wrong canonical,
// sitemap flood, a non-moon page turning into page-moon, or a Meeus regression — fails
// BEFORE it can ship. TEST-ONLY: this ticket changes NO runtime code.
//
// PART A — classifier: extract the REAL `_isMoonPath` from js/app.js; all current + future
//          /moon… shapes → page-moon; non-moon → not.
// PART B — /moon: 200 + 1 H1 + page-moon active + canonical self + index + real content
//          (FAQ + search hero + body size) — i.e. NOT footer-only at SSR level.
// PART C — /moon-today: 301 → /moon (langs + trailing slash), not a 200, absent from sitemap.
// PART D — city routes (MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1): the city HUB is now the nested
//          /moon/{country}/{city} (200, self canonical, 4-level breadcrumb); the legacy flat hub
//          /moon-in-{city} 301s to it (+langs); today/month/day flat routes UNCHANGED (200).
// PART E — /moon/{country}: LIVE 200 country page · nested HUB /moon/{country}/{city} = 200 ·
//          YEAR /moon/{country}/{city}/{yyyy} = 200 · MONTH /moon/{country}/{city}/{yyyy}/{mm} = 200 ·
//          deeper /moon/{country}/{city}/{today|yyyy/mm/dd|yyyy/6|yyyy/00|yyyy/13|YYYY-MM|YYYY-MM-DD}
//          stay clean 404 · unknown country/city → 404 · city-in-wrong-country → 301 to nested URL.
// PART F — sitemap-main: has /moon + /moon/{country}, NOT bare /moon-today, no day flood.
//          sitemap-cities: nested /moon/{country}/{city} hub PRESENT, bare /moon-in-{city} ABSENT,
//          /moon-today-in-{city} + legacy dated /moon-in-{city}/{date} still present.
// PART G — canonical: /moon self, city self, /moon-today no 200 body → no duplicate canonical.
// PART H — non-moon pages are NOT page-moon (server SSR).
// PART I — Meeus 49 + city tz: Riyadh Jun 2026 (15 المحاق · 16 هلال متزايد · 29 أحدب متزايد · 30 البدر),
//          a US city moon page renders with city tz, city SSR uses _hijriForIana, Meeus 49 engine present.
//
// NOTE on hydration/console: SSR-level "page-moon active + real content" is asserted here;
// the live hydration + zero-console-errors check is done in the browser during the ticket
// (the preview tool drives the real client) and recorded in the pre-push report.
//
// Run: node scripts/_smoke_moon_routes_structure_guardrails_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

// ── PART A: extract + run the REAL shipped classifier ──
console.log('── A) route classifier (extracted from js/app.js) ──');
const appSrc = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const fnMatch = appSrc.match(/function _isMoonPath\(p\)\s*\{[\s\S]*?\n\}/);
check('js/app.js defines _isMoonPath()', !!fnMatch);
let _isMoonPath = () => false;
if (fnMatch) { try { _isMoonPath = new Function('return (' + fnMatch[0] + ')')(); } catch (e) { check('_isMoonPath evaluable', false, e.message); } }
const MOON = [
    '/moon', '/en/moon', '/moon-today', '/moon-today-in-riyadh', '/moon-in-riyadh',
    '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17',
    '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/today',
    '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17',
    '/en/moon/saudi-arabia/riyadh/today',
];
const NOT_MOON = [
    '/', '/prayer-times-in-riyadh', '/qibla-in-riyadh', '/today-hijri-date',
    '/date-converter', '/en/qibla', '/zakat-calculator', '/moonshine', '/moonlight',
];
for (const u of MOON) check(`classifier moon: ${u}`, _isMoonPath(u) === true, String(_isMoonPath(u)));
for (const u of NOT_MOON) check(`classifier NOT moon: ${u}`, _isMoonPath(u) === false, String(_isMoonPath(u)));

// ── structural source guards (Meeus engine + city-tz plumbing untouched) ──
console.log('\n── A2) source guards (Meeus 49 engine + city-tz plumbing present) ──');
const moonSrc = readFileSync(path.join(ROOT, 'js', 'moon.js'), 'utf8');
const serverSrc = readFileSync(path.join(ROOT, 'server.js'), 'utf8');
check('js/moon.js: Meeus 49 engine present', /محرّك Meeus 49|Meeus 49/.test(moonSrc));
check('server.js: city moon SSR uses _hijriForIana (city IANA, not CC fallback)', /_hijriForIana\(_cityIanaSsr\)/.test(serverSrc));

const PORT = 8219;
function req(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            // Decode the whole body as one UTF-8 stream (NOT chunk-by-chunk) so multibyte
            // Arabic chars split across chunk boundaries never corrupt — same fix as the
            // countdown smoke (COUNTDOWN-SMOKE-UTF8-CHUNK-DECODE-FLAKE-FIX-1).
            const chunks = []; res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '', loc: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await req('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
const pageMoonActive = (b) => /class="page active" id="page-moon"/.test(b);
const canonOf = (b) => (b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
const h1Count = (b) => (b.match(/<h1\b/g) || []).length;

let exitCode = 1;
let SITE = `http://localhost:${PORT}`;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── B) /moon contract ──
    console.log('\n── B) /moon = 200 hub (canonical self, index, real content, not footer-only) ──');
    const moon = await req('/moon');
    SITE = (canonOf(moon.body).match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;
    check('/moon → 200', moon.status === 200, String(moon.status));
    check('/moon: exactly one H1 (#moon-hub-h1)', h1Count(moon.body) === 1 && /<h1[^>]*id="moon-hub-h1"/.test(moon.body));
    check('/moon: #page-moon active', pageMoonActive(moon.body));
    check('/moon: canonical self = SITE/moon', canonOf(moon.body) === SITE + '/moon', canonOf(moon.body));
    check('/moon: indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(moon.body));
    check('/moon: real content — FAQPage + search hero + cities grid', /"@type":\s*"FAQPage"/.test(moon.body) && moon.body.includes('id="moon-hub-search"') && moon.body.includes('moon-cities-grid'));
    check('/moon: substantial body (not footer-only)', moon.body.length > 60000, moon.body.length + ' bytes');

    // ── C) /moon-today 301 ──
    console.log('\n── C) /moon-today → 301 /moon (langs + trailing slash) ──');
    for (const [from, to] of [['/moon-today', '/moon'], ['/en/moon-today', '/en/moon'], ['/fr/moon-today', '/fr/moon'], ['/ur/moon-today', '/ur/moon'], ['/moon-today/', '/moon']]) {
        const r = await req(from);
        check(`${from} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    check('/moon-today is NOT a standalone 200', (await req('/moon-today')).status === 301);

    // ── D) city moon routes — MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1:
    //        • the city HUB is now the nested /moon/{country}/{city} (200);
    //        • the legacy flat hub /moon-in-{city} now 301s to it (+langs);
    //        • today + month + day flat routes are UNCHANGED (still 200, self canonical).
    console.log('\n── D) city moon routes (nested hub 200 · legacy hub 301 · today/month/day 200) ──');
    // D1) flat routes that STAY 200 (NOT migrated this phase)
    for (const u of ['/moon-today-in-riyadh', '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17']) {
        const r = await req(u);
        const selfCanon = canonOf(r.body).endsWith(u);
        check(`${u}: 200 + page-moon + 1 H1 + self canonical`, r.status === 200 && pageMoonActive(r.body) && h1Count(r.body) === 1 && selfCanon, `status=${r.status} pm=${pageMoonActive(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)}`);
    }
    // D2) NEW nested city hub = 200 (same content as the legacy hub) + self canonical + 4-level breadcrumb DOM
    for (const u of ['/moon/saudi-arabia/riyadh', '/en/moon/saudi-arabia/riyadh']) {
        const r = await req(u);
        const selfCanon = canonOf(r.body).endsWith(u);
        const bc4 = /id="bc-moon-hub-li"(?![^>]*hidden)/.test(r.body) && /id="bc-moon-country-li"(?![^>]*hidden)/.test(r.body) && /id="bc-moon-country"[^>]*href="[^"]*\/moon\/saudi-arabia"/.test(r.body);
        check(`${u}: 200 + page-moon + 1 H1 + self canonical + 4-level breadcrumb`, r.status === 200 && pageMoonActive(r.body) && h1Count(r.body) === 1 && selfCanon && bc4, `status=${r.status} pm=${pageMoonActive(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)} bc4=${bc4}`);
    }
    // D3) legacy flat hub 301 → nested (lang preserved)
    for (const [from, to] of [['/moon-in-riyadh', '/moon/saudi-arabia/riyadh'], ['/en/moon-in-riyadh', '/en/moon/saudi-arabia/riyadh']]) {
        const r = await req(from);
        check(`${from} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }

    // ── E) /moon/{country} = LIVE 200 country page (MOON-COUNTRY-PAGES-SSR-ADD-1);
    //        nested /moon/{country}/{city}[/…] stays clean 404 (NOT activated yet) ──
    console.log('\n── E) /moon/{country} = 200 country page · nested /moon/{country}/{city}[/…] = clean 404 ──');
    {
        const c = await req('/moon/saudi-arabia');
        check('/moon/saudi-arabia -> 200 (country moon page)', c.status === 200, String(c.status));
        check('/moon/saudi-arabia: one H1 + moon hero ("مراحل القمر")', h1Count(c.body) === 1 && /<h1[^>]*id="loc-hero-title"[^>]*>[^<]*مراحل القمر/.test(c.body), `h1=${h1Count(c.body)}`);
        check('/moon/saudi-arabia: NOT footer-only (substantial body)', c.body.length > 60000, c.body.length + ' bytes');
        check('/moon/saudi-arabia: canonical self', canonOf(c.body) === SITE + '/moon/saudi-arabia', canonOf(c.body));
        check('/moon/saudi-arabia: indexable (no noindex)', !/<meta name="robots"[^>]*noindex/i.test(c.body));
    }
    // MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1: the nested city HUB is LIVE 200 (see PART D2).
    // MOON-CITY-YEAR-ROUTE-STRUCTURE-ADD-1: the city YEAR page /moon/{country}/{city}/{yyyy}
    //   is now LIVE 200 in its own #page-moon-year section.
    {
        const y = await req('/moon/saudi-arabia/riyadh/2026');
        check('/moon/saudi-arabia/riyadh/2026 -> 200 (#page-moon-year active, 1 H1)', y.status === 200 && /class="page active" id="page-moon-year"/.test(y.body) && (y.body.match(/<h1\b/g) || []).length === 1, `status=${y.status}`);
        // …-FIX-1: the year page carries ONLY year content — no leaked #page-moon sections,
        // no orphaned comment fragments (was _stripElement counting </div> inside HTML
        // comments), balanced HTML comments.
        const leaked = ['moon-general-faq', 'moon-hub-related-links', 'moon-events-section', 'moon-hub-hero', 'moon-event-ramadan'].filter(id => new RegExp('id="' + id + '"').test(y.body));
        const tech = ['closing </div>', 'LAST visible section', 'closing #page-moon'].filter(t => y.body.includes(t));
        const opens = (y.body.match(/<!--/g) || []).length, closes = (y.body.match(/-->/g) || []).length;
        check('/moon/.../2026: 0 leaked sections + 0 orphaned comment text + balanced comments', leaked.length === 0 && tech.length === 0 && opens === closes, `leaked=[${leaked}] tech=[${tech}] cmt=${opens}/${closes}`);
    }
    // MOON-CITY-MONTH-ROUTE-STRUCTURE-ADD-1: the city MONTH page /moon/{country}/{city}/{yyyy}/{mm}
    //   is now LIVE 200 in its own #page-moon-month section (deeper day/today/dash stay 404).
    {
        const mo = await req('/moon/saudi-arabia/riyadh/2026/06');
        check('/moon/saudi-arabia/riyadh/2026/06 -> 200 (#page-moon-month active, 1 H1)', mo.status === 200 && /class="page active" id="page-moon-month"/.test(mo.body) && (mo.body.match(/<h1\b/g) || []).length === 1, `status=${mo.status}`);
        const leaked = ['moon-general-faq', 'moon-hub-related-links', 'moon-events-section', 'moon-hub-hero', 'moon-event-ramadan', 'moon-year-summary'].filter(id => new RegExp('id="' + id + '"').test(mo.body));
        const opens = (mo.body.match(/<!--/g) || []).length, closes = (mo.body.match(/-->/g) || []).length;
        check('/moon/.../2026/06: 0 leaked hub/year sections + balanced comments', leaked.length === 0 && opens === closes, `leaked=[${leaked}] cmt=${opens}/${closes}`);
    }
    //   The deeper nested routes stay clean 404: today, day UNDER the month (slash form), bad
    //   month (1-digit / 00 / 13), and the legacy dash forms /{yyyy-mm} + /{yyyy-mm-dd}.
    for (const u of ['/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026/06/17', '/moon/saudi-arabia/riyadh/2026/6', '/moon/saudi-arabia/riyadh/2026/00', '/moon/saudi-arabia/riyadh/2026/13', '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17', '/en/moon/saudi-arabia/riyadh/today']) {
        const r = await req(u);
        check(`${u}: 404, not page-moon, small error page (not the 200KB shell)`, r.status === 404 && !pageMoonActive(r.body) && r.body.length < 50000, `status=${r.status} pm=${pageMoonActive(r.body)} len=${r.body.length}`);
    }
    check('/moon/zzz-not-a-country -> 404 (unknown country, no thin page)', (await req('/moon/zzz-not-a-country')).status === 404);
    check('/moon/saudi-arabia/notacity -> 404 (unknown city)', (await req('/moon/saudi-arabia/notacity')).status === 404);
    check('/moon/zzz-not-a-country/riyadh -> 404 (unknown country segment)', (await req('/moon/zzz-not-a-country/riyadh')).status === 404);
    // mismatch (city not in the named country) → 301 to the correct nested URL (no indexable mismatch)
    {
        const r = await req('/moon/united-states/riyadh');
        check('/moon/united-states/riyadh -> 301 /moon/saudi-arabia/riyadh (mismatch corrected)', r.status === 301 && r.loc === '/moon/saudi-arabia/riyadh', `status=${r.status} loc=${r.loc}`);
    }

    // ── F) sitemap rules ──
    console.log('\n── F) sitemap: /moon + /moon/{country} in, /moon-today out, no nested city routes, no day flood ──');
    const sm = (await req('/sitemap-main.xml')).body;
    check('sitemap has SITE/moon (+ /en/moon)', sm.includes(`<loc>${SITE}/moon</loc>`) && sm.includes(`<loc>${SITE}/en/moon</loc>`));
    check('sitemap: bare /moon-today hub ABSENT', !/\/moon-today<\/loc>/.test(sm));
    check('sitemap-main: /moon/{country} PRESENT (e.g. /moon/saudi-arabia + /en)', sm.includes(`<loc>${SITE}/moon/saudi-arabia</loc>`) && sm.includes(`<loc>${SITE}/en/moon/saudi-arabia</loc>`));
    check('sitemap-main: city-level nested /moon/{country}/{city} ABSENT (lives in cities sitemap)', !/\/moon\/[a-z-]+\/[a-z-]+<\/loc>/.test(sm));
    check('sitemap-main: no day-page flood (no /moon…/{YYYY-MM-DD} locs)', !/\/moon[^<]*\d{4}-\d{2}-\d{2}<\/loc>/.test(sm), `${(sm.match(/\/moon[^<]*\d{4}-\d{2}-\d{2}<\/loc>/g) || []).length} day locs`);
    // F2) cities sitemap — MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1: the city HUB migrated to the
    //     nested /moon/{country}/{city}; the bare /moon-in-{city} hub is dropped; today + dated kept.
    const smc = (await req('/sitemap-cities-1.xml')).body;
    check('sitemap-cities: nested city hub PRESENT (e.g. /moon/saudi-arabia/medina + /en)', smc.includes(`<loc>${SITE}/moon/saudi-arabia/medina</loc>`) && smc.includes(`<loc>${SITE}/en/moon/saudi-arabia/medina</loc>`));
    check('sitemap-cities: bare /moon-in-{city} hub ABSENT (301 must not be listed)', !/\/moon-in-[a-z-]+<\/loc>/.test(smc), `${(smc.match(/\/moon-in-[a-z-]+<\/loc>/g) || []).length} bare-hub locs`);
    check('sitemap-cities: /moon-today-in-{city} still present', /\/moon-today-in-[a-z-]+<\/loc>/.test(smc));
    check('sitemap-cities: legacy dated /moon-in-{city}/{YYYY-MM-DD} still present (route not migrated)', /\/moon-in-[a-z-]+\/\d{4}-\d{2}-\d{2}<\/loc>/.test(smc));

    // ── G) canonical contract ──
    console.log('\n── G) canonical: /moon self, city self, /moon-today no body, no duplicate ──');
    check('/moon canonical = SITE/moon (self)', canonOf((await req('/moon')).body) === SITE + '/moon');
    // MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1: the city hub canonical is now the nested URL (self);
    //   the legacy /moon-in-riyadh is a 301 (no 200 body / canonical of its own).
    check('/moon/saudi-arabia/riyadh canonical self', canonOf((await req('/moon/saudi-arabia/riyadh')).body).endsWith('/moon/saudi-arabia/riyadh'));
    check('/moon-in-riyadh has no 200 body/canonical (301 → nested)', (await req('/moon-in-riyadh')).status === 301);
    check('/moon-today has no 200 body/canonical (301)', (await req('/moon-today')).status === 301);

    // ── H) non-moon pages are NOT page-moon ──
    console.log('\n── H) non-moon pages NOT page-moon (server SSR) ──');
    for (const u of ['/', '/prayer-times-in-riyadh', '/qibla-in-riyadh', '/today-hijri-date', '/date-converter']) {
        const r = await req(u);
        check(`${u}: NOT #page-moon active`, !pageMoonActive(r.body), `status=${r.status}`);
    }

    // ── I) Meeus 49 + city timezone ──
    console.log('\n── I) Meeus 49 (Riyadh Jun 2026) + US city moon page ──');
    const grid = (await req('/moon-in-riyadh/2026-06')).body;
    check('15 Jun = المحاق (new moon)', /2026-06-15[\s\S]{0,260}?المحاق/.test(grid));
    check('16 Jun = هلال متزايد (waxing crescent)', /2026-06-16[\s\S]{0,400}?هلال متزايد/.test(grid));
    check('29 Jun = أحدب متزايد (waxing gibbous — not yet full)', /2026-06-29[\s\S]{0,260}?أحدب متزايد/.test(grid));
    check('30 Jun = البدر (full moon)', /2026-06-30[\s\S]{0,260}?البدر/.test(grid));
    const ny = await req('/moon-today-in-new-york');
    check('US city /moon-today-in-new-york: 200 + page-moon + hijri banner (city tz)', ny.status === 200 && pageMoonActive(ny.body) && /banner-hijri-date|hijri/i.test(ny.body), `status=${ny.status}`);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
