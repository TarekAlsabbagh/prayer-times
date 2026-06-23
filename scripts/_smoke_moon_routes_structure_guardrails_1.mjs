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
// PART D — city routes (MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 + MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH):
//          the city HUB is the nested /moon/{country}/{city} (200, self canonical, 4-level breadcrumb);
//          ALL legacy flat routes now 301 (lang-preserved) to their nested equivalent —
//          /moon-in-{city}→hub · /moon-today-in-{city}→/…/today · /moon-in-{city}/{yyyy-mm}→/…/{yyyy}/{mm}
//          · /moon-in-{city}/{yyyy-mm-dd}→/…/{yyyy}/{mm}/{dd}; invalid legacy date/month + unknown city → 404.
// PART E — /moon/{country}: LIVE 200 country page · nested HUB /moon/{country}/{city} = 200 ·
//          YEAR /moon/{country}/{city}/{yyyy} = 200 · MONTH /…/{yyyy}/{mm} = 200 · DAY /…/{yyyy}/{mm}/{dd}
//          = 200 (leap-aware) · deeper/invalid /moon/{country}/{city}/{today|yyyy/6|yyyy/00|yyyy/13|
//          yyyy/mm/7|yyyy/mm/00|yyyy/mm/32|yyyy/02/30|yyyy/mm/dd/extra|YYYY-MM|YYYY-MM-DD} stay clean
//          404 · unknown country/city → 404 · city-in-wrong-country → 301 to nested URL.
// PART F — sitemap-main: has /moon + /moon/{country}, NOT bare /moon-today, no day flood.
//          sitemap-cities: nested /moon/{country}/{city} hub + /…/today PRESENT; ALL legacy flat moon
//          routes ABSENT (bare /moon-in-{city}, /moon-today-in-{city}, dated /moon-in-{city}/{date});
//          no nested day-page flood (MLRC).
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

    // ── D) city moon routes — MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 + MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH:
    //        • the city HUB is the nested /moon/{country}/{city} (200);
    //        • the legacy flat hub /moon-in-{city} 301s to it (+langs);
    //        • ALL legacy flat routes now 301 to their nested equivalent (MLRC, lang-preserved):
    //            /moon-today-in-{city}        → /moon/{country}/{city}/today
    //            /moon-in-{city}/{yyyy-mm}    → /moon/{country}/{city}/{yyyy}/{mm}
    //            /moon-in-{city}/{yyyy-mm-dd} → /moon/{country}/{city}/{yyyy}/{mm}/{dd}
    console.log('\n── D) city moon routes (nested hub/today/month/day 200 · ALL legacy flat routes 301) ──');
    // D1) MLRC: legacy flat routes now 301 to their nested equivalent (lang preserved)
    for (const [from, to] of [
        ['/moon-today-in-riyadh', '/moon/saudi-arabia/riyadh/today'],
        ['/en/moon-today-in-riyadh', '/en/moon/saudi-arabia/riyadh/today'],
        ['/moon-in-riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026/06'],
        ['/moon-in-riyadh/2026-06-17', '/moon/saudi-arabia/riyadh/2026/06/17'],
        ['/fr/moon-in-riyadh/2026-06-17', '/fr/moon/saudi-arabia/riyadh/2026/06/17'],
    ]) {
        const r = await req(from);
        check(`${from} → 301 ${to} (MLRC legacy→nested)`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    // D1b) MLRC validation: invalid legacy date/month → 404 (NOT 301), unknown city → 404
    for (const u of ['/moon-in-riyadh/2026-06-32', '/moon-in-riyadh/2026-13', '/moon-in-riyadh/2026-02-30', '/moon-today-in-notacity', '/moon-in-notacity/2026-06']) {
        const r = await req(u);
        check(`${u}: 404 (MLRC invalid/unknown → 404, not 301-to-200)`, r.status === 404, `status=${r.status} loc=${r.loc}`);
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
        // MOON-COUNTRY-FAQ-ACCORDION-AFFORDANCE-1: FAQ is a clear native-<details> accordion, FIRST item open
        check('/moon/saudi-arabia: FAQ is a moon-country-faq accordion (≥4 items) + FAQPage JSON-LD', /class="country-faq-list moon-country-faq"/.test(c.body) && (c.body.match(/<details class="country-faq-item"/g) || []).length >= 4 && /"@type":"FAQPage"/.test(c.body), `${(c.body.match(/<details class="country-faq-item"/g) || []).length} items`);
        check('/moon/saudi-arabia: exactly the FIRST FAQ item is open (rest closed)', (c.body.match(/<details class="country-faq-item" open>/g) || []).length === 1, `${(c.body.match(/<details class="country-faq-item" open>/g) || []).length} open`);
        // scope: prayer country page shares the .country-faq-item class but must stay UNTOUCHED (no moon-country-faq, no forced-open)
        const pc = await req('/prayer-times-in-saudi-arabia');
        check('scope: prayer country page FAQ unchanged (no moon-country-faq, no forced-open)', !/moon-country-faq/.test(pc.body) && (pc.body.match(/<details class="country-faq-item" open>/g) || []).length === 0);
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
    // MOON-CITY-MONTH-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1: the city MONTH page
    //   /moon/{country}/{city}/{yyyy}/{mm} is the STRUCTURAL alias of the legacy month page
    //   /moon-in-{city}/{yyyy-mm}. It renders the SAME legacy renderer (#page-moon active — NOT a
    //   bespoke #page-moon-month) AND the SAME legacy monthly calendar grid (.moon-hub-cal-grid)
    //   whose day cells link to the nested day route. The calendar is gated month-page-ONLY so the
    //   city HUB renders no calendar widget.
    {
        const mo = await req('/moon/saudi-arabia/riyadh/2026/06');
        check('/moon/saudi-arabia/riyadh/2026/06 -> 200 (#page-moon active, NO bespoke #page-moon-month, 1 H1)',
            mo.status === 200 && pageMoonActive(mo.body) && !/<[a-z]+[^>]*\bid="page-moon-month"/.test(mo.body) && (mo.body.match(/<h1\b/g) || []).length === 1, `status=${mo.status}`);
        check('/moon/.../2026/06: legacy calendar grid present (.moon-hub-cal-grid) + nested day links + 0 legacy',
            mo.body.includes('moon-hub-cal-grid') && /href="\/moon\/saudi-arabia\/riyadh\/2026\/06\/\d{2}"/.test(mo.body) && !/href="\/moon-in-riyadh\/2026-06-\d{2}"/.test(mo.body));
        check('/moon/.../2026/06: 6-level BreadcrumbList JSON-LD', (mo.body.match(/"position":/g) || []).length === 6 && canonOf(mo.body) === SITE + '/moon/saudi-arabia/riyadh/2026/06');
        // The month page IS the legacy #page-moon renderer, so the shared hub sections (hero/faq/
        // related-links/events) are LEGITIMATE legacy content — NOT leaks. We only assert the BESPOKE
        // month artefacts (and the year-specific summary) are gone.
        const leaked = ['moon-month-hero', 'moon-month-summary', 'moon-month-calendar', 'my-chip', 'my-day-link', 'my-month-card', 'moon-year-summary'].filter(id => new RegExp(id).test(mo.body));
        const opens = (mo.body.match(/<!--/g) || []).length, closes = (mo.body.match(/-->/g) || []).length;
        check('/moon/.../2026/06: 0 bespoke month/year artefacts + balanced comments', leaked.length === 0 && opens === closes, `leaked=[${leaked}] cmt=${opens}/${closes}`);
        // HUB INVARIANT (MOON-CITY-HUB-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1): the city hub shows the legacy
        // COMPACT calendar CTA (#moon-hub-cal / .moon-hub-cal-compact) — NOT the full month grid. The full
        // .moon-hub-cal-grid is month-page only.
        const hub = await req('/moon/saudi-arabia/riyadh');
        check('/moon/saudi-arabia/riyadh (hub): compact CTA present + NO full grid',
            hub.status === 200 && hub.body.includes('moon-hub-cal-compact') && !hub.body.includes('moon-hub-cal-grid'), `status=${hub.status}`);
    }
    // MOON-CITY-DAY-ROUTE-STRUCTURE-SCOPE-CORRECTION-FIX-1: the city DAY page
    //   /moon/{country}/{city}/{yyyy}/{mm}/{dd} is the STRUCTURAL alias of the legacy dated page
    //   /moon-in-{city}/{yyyy-mm-dd}. It renders the SAME legacy renderer (#page-moon active, same
    //   #moon-page-h1, same #moon-city-answer body) — NOT a bespoke #page-moon-day section. The only
    //   permitted differences: self-canonical (new URL), hreflang (new URL), 7-level breadcrumb.
    {
        const dy = await req('/moon/saudi-arabia/riyadh/2026/06/17');
        // MLRC: the legacy dated URL now 301s to THIS nested URL (no 200 body to diff against).
        const lg = await req('/moon-in-riyadh/2026-06-17');
        check('/moon/saudi-arabia/riyadh/2026/06/17 -> 200 (#page-moon active, 1 H1, legacy renderer)', dy.status === 200 && pageMoonActive(dy.body) && h1Count(dy.body) === 1 && !/id="page-moon-day"/.test(dy.body), `status=${dy.status} pm=${pageMoonActive(dy.body)} h1=${h1Count(dy.body)}`);
        // legacy renderer markers present (non-empty #moon-page-h1 + #moon-city-answer body); legacy URL 301→here
        const h1Of = (b) => ((b.match(/id="moon-page-h1"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
        check('/moon/.../2026/06/17: legacy renderer (non-empty H1 + body container) + legacy URL 301→here (MLRC)', h1Of(dy.body).length > 0 && /id="moon-city-answer"/.test(dy.body) && lg.status === 301 && lg.loc === '/moon/saudi-arabia/riyadh/2026/06/17', `dayH1="${h1Of(dy.body)}" legacy=${lg.status}→${lg.loc}`);
        // self-canonical to the NEW nested URL (NOT the legacy flat URL)
        check('/moon/.../2026/06/17: canonical self (new nested URL)', canonOf(dy.body) === SITE + '/moon/saudi-arabia/riyadh/2026/06/17', canonOf(dy.body));
        // 7-level breadcrumb: Home › Moon Phase › Country › City › Year › Month › Day, DOM ≡ JSON-LD
        const ldItems = (() => { const m = dy.body.match(/"@type"\s*:\s*"BreadcrumbList"[\s\S]*?"itemListElement"\s*:\s*(\[[\s\S]*?\])\s*\}/); if (!m) return 0; try { return JSON.parse(m[1]).length; } catch { return -1; } })();
        check('/moon/.../2026/06/17: 7-level BreadcrumbList JSON-LD', ldItems === 7, `ldItems=${ldItems}`);
        // leap-aware day-of-month: 2024-02-29 valid (leap), 2026-02-29 invalid (non-leap)
        check('/moon/.../2024/02/29 -> 200 (leap year)', (await req('/moon/saudi-arabia/riyadh/2024/02/29')).status === 200);
    }
    // MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1: the city TODAY page /moon/{country}/{city}/today is the
    //   STRUCTURAL alias of the legacy /moon-today-in-{city}. It renders the SAME legacy today renderer
    //   (#page-moon active, same #moon-page-h1, same #moon-city-answer body) — NOT a bespoke page. The
    //   only permitted differences: self-canonical (new URL), hreflang (new URL), 5-level breadcrumb.
    //   /today/anything stays a clean 404.
    {
        const td = await req('/moon/saudi-arabia/riyadh/today');
        // MLRC: the legacy today URL now 301s to THIS nested URL (no 200 body to diff against).
        const lg = await req('/moon-today-in-riyadh');
        check('/moon/saudi-arabia/riyadh/today -> 200 (#page-moon active, 1 H1, legacy today renderer)', td.status === 200 && pageMoonActive(td.body) && h1Count(td.body) === 1 && !/id="page-moon-day"/.test(td.body), `status=${td.status} pm=${pageMoonActive(td.body)} h1=${h1Count(td.body)}`);
        const h1Of = (b) => ((b.match(/id="moon-page-h1"[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]*>/g, '').trim();
        check('/moon/.../today: legacy renderer (non-empty H1 + body container) + legacy URL 301→here (MLRC)', h1Of(td.body).length > 0 && /id="moon-city-answer"/.test(td.body) && lg.status === 301 && lg.loc === '/moon/saudi-arabia/riyadh/today', `todayH1="${h1Of(td.body)}" legacy=${lg.status}→${lg.loc}`);
        check('/moon/.../today: canonical self (new nested URL)', canonOf(td.body) === SITE + '/moon/saudi-arabia/riyadh/today', canonOf(td.body));
        // 5-level breadcrumb: Home › Moon Phase › Country › City › Today, DOM ≡ JSON-LD
        const ldItems = (() => { const m = td.body.match(/"@type"\s*:\s*"BreadcrumbList"[\s\S]*?"itemListElement"\s*:\s*(\[[\s\S]*?\])\s*\}/); if (!m) return 0; try { return JSON.parse(m[1]).length; } catch { return -1; } })();
        check('/moon/.../today: 5-level BreadcrumbList JSON-LD', ldItems === 5, `ldItems=${ldItems}`);
        check('/moon/.../today/test -> 404 (nothing nests below today)', (await req('/moon/saudi-arabia/riyadh/today/test')).status === 404);
        check('/moon-today-in-riyadh now 301 → nested today (MLRC legacy cleanup)', (await req('/moon-today-in-riyadh')).status === 301);
    }
    //   The deeper / invalid routes stay clean 404: today/anything (nothing nests below today —
    //   MOON-CITY-TODAY-ROUTE-STRUCTURE-ADD-1), dash forms /{yyyy-mm} + /{yyyy-mm-dd}, bad month
    //   (1-digit / 00 / 13), bad day (1-digit / 00 / 32 / Feb 30 / non-leap 29), and anything deeper
    //   than the day page (/{yyyy}/{mm}/{dd}/extra). NB: /…/today itself is now LIVE 200 (see above).
    for (const u of ['/moon/saudi-arabia/riyadh/today/test', '/moon/saudi-arabia/riyadh/Today', '/moon/saudi-arabia/riyadh/2026/6', '/moon/saudi-arabia/riyadh/2026/00', '/moon/saudi-arabia/riyadh/2026/13', '/moon/saudi-arabia/riyadh/2026/06/7', '/moon/saudi-arabia/riyadh/2026/06/00', '/moon/saudi-arabia/riyadh/2026/06/32', '/moon/saudi-arabia/riyadh/2026/02/30', '/moon/saudi-arabia/riyadh/2026/02/29', '/moon/saudi-arabia/riyadh/2026/06/17/extra', '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17', '/en/moon/saudi-arabia/riyadh/today/test']) {
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
    // F2) cities sitemap — MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 + MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH:
    //     ALL legacy flat moon routes are now dropped from the sitemap (they 301). Only the nested
    //     /moon/{country}/{city} hub + /…/today are emitted; NO legacy hub, NO legacy today, NO legacy
    //     dated, and NO bulk day-page flood.
    const smc = (await req('/sitemap-cities-1.xml')).body;
    check('sitemap-cities: nested city hub PRESENT (e.g. /moon/saudi-arabia/medina + /en)', smc.includes(`<loc>${SITE}/moon/saudi-arabia/medina</loc>`) && smc.includes(`<loc>${SITE}/en/moon/saudi-arabia/medina</loc>`));
    check('sitemap-cities: nested today PRESENT (e.g. /moon/saudi-arabia/medina/today)', /\/moon\/[a-z-]+\/[a-z-]+\/today<\/loc>/.test(smc));
    check('sitemap-cities: bare /moon-in-{city} hub ABSENT (301 must not be listed)', !/\/moon-in-[a-z-]+<\/loc>/.test(smc), `${(smc.match(/\/moon-in-[a-z-]+<\/loc>/g) || []).length} bare-hub locs`);
    check('sitemap-cities: legacy /moon-today-in-{city} ABSENT (MLRC — now 301)', !/\/moon-today-in-[a-z-]+<\/loc>/.test(smc), `${(smc.match(/\/moon-today-in-[a-z-]+<\/loc>/g) || []).length} legacy-today locs`);
    check('sitemap-cities: legacy dated /moon-in-{city}/{YYYY-MM-DD} ABSENT (MLRC — now 301)', !/\/moon-in-[a-z-]+\/\d{4}-\d{2}-\d{2}<\/loc>/.test(smc), `${(smc.match(/\/moon-in-[a-z-]+\/\d{4}-\d{2}-\d{2}<\/loc>/g) || []).length} legacy-dated locs`);
    check('sitemap-cities: no day-page flood under nested routes', !/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/.test(smc), `${(smc.match(/\/moon\/[a-z-]+\/[a-z-]+\/\d{4}\/\d{2}\/\d{2}<\/loc>/g) || []).length} nested day locs`);

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
    //   MLRC: legacy /moon-in-riyadh/2026-06[-15] all 301 now. Validate the SAME Meeus output via the
    //   nested DAY pages (they reuse the legacy #page-moon renderer), and the US city via the nested today.
    console.log('\n── I) Meeus 49 (Riyadh Jun 2026, nested day pages) + US city moon page (nested today) ──');
    for (const [d, phase] of [['15', 'المحاق'], ['16', 'هلال متزايد'], ['29', 'أحدب متزايد'], ['30', 'البدر']]) {
        const r = await req('/moon/saudi-arabia/riyadh/2026/06/' + d);
        check(`Meeus: ${d} Jun = ${phase} (nested day page, legacy renderer)`, r.status === 200 && pageMoonActive(r.body) && r.body.includes(phase), `status=${r.status} has=${r.body.includes(phase)}`);
    }
    const ny = await req('/moon/united-states/new-york/today');
    check('US city /moon/united-states/new-york/today: 200 + page-moon + hijri banner (city tz)', ny.status === 200 && pageMoonActive(ny.body) && /banner-hijri-date|hijri/i.test(ny.body), `status=${ny.status}`);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
