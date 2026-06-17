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
// PART D — city routes (today / hub / month / day): 200 + page-moon + 1 H1 + self canonical.
// PART E — /moon/{country}: LIVE 200 country moon page; nested /moon/{country}/{city}[/…] stays clean 404.
// PART F — sitemap: has /moon + /moon/{country}, NOT bare /moon-today, NOT nested /moon/{country}/{city}, no day flood.
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
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b, loc: res.headers.location || '' }));
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

    // ── D) city routes unchanged ──
    console.log('\n── D) city moon routes (today / hub / month / day) ──');
    for (const u of ['/moon-today-in-riyadh', '/moon-in-riyadh', '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17']) {
        const r = await req(u);
        const selfCanon = canonOf(r.body).endsWith(u);
        check(`${u}: 200 + page-moon + 1 H1 + self canonical`, r.status === 200 && pageMoonActive(r.body) && h1Count(r.body) === 1 && selfCanon, `status=${r.status} pm=${pageMoonActive(r.body)} h1=${h1Count(r.body)} canon=${canonOf(r.body)}`);
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
    for (const u of ['/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026-06', '/moon/saudi-arabia/riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u}: 404, not page-moon, small error page (not the 200KB shell)`, r.status === 404 && !pageMoonActive(r.body) && r.body.length < 50000, `status=${r.status} pm=${pageMoonActive(r.body)} len=${r.body.length}`);
    }
    check('/moon/zzz-not-a-country -> 404 (unknown country, no thin page)', (await req('/moon/zzz-not-a-country')).status === 404);

    // ── F) sitemap rules ──
    console.log('\n── F) sitemap: /moon + /moon/{country} in, /moon-today out, no nested city routes, no day flood ──');
    const sm = (await req('/sitemap-main.xml')).body;
    check('sitemap has SITE/moon (+ /en/moon)', sm.includes(`<loc>${SITE}/moon</loc>`) && sm.includes(`<loc>${SITE}/en/moon</loc>`));
    check('sitemap: bare /moon-today hub ABSENT', !/\/moon-today<\/loc>/.test(sm));
    check('sitemap: /moon/{country} PRESENT (e.g. /moon/saudi-arabia + /en)', sm.includes(`<loc>${SITE}/moon/saudi-arabia</loc>`) && sm.includes(`<loc>${SITE}/en/moon/saudi-arabia</loc>`));
    check('sitemap: nested /moon/{country}/{city} ABSENT', !/\/moon\/[a-z-]+\/[a-z-]+<\/loc>/.test(sm));
    check('sitemap: no day-page flood (no /moon…/{YYYY-MM-DD} locs)', !/\/moon[^<]*\d{4}-\d{2}-\d{2}<\/loc>/.test(sm), `${(sm.match(/\/moon[^<]*\d{4}-\d{2}-\d{2}<\/loc>/g) || []).length} day locs`);

    // ── G) canonical contract ──
    console.log('\n── G) canonical: /moon self, city self, /moon-today no body, no duplicate ──');
    check('/moon canonical = SITE/moon (self)', canonOf((await req('/moon')).body) === SITE + '/moon');
    check('/moon-in-riyadh canonical self', canonOf((await req('/moon-in-riyadh')).body).endsWith('/moon-in-riyadh'));
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
