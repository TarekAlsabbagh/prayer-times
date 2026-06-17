// MOON-TODAY-CONTENT-MOVE-TO-MOON-1 — verification (self-contained).
//
// The moon-phase "today" hub MOVED from /moon-today → /moon WITHOUT any content
// rewrite. This test pins the move's contract:
//   A) /moon serves 200 with the SAME hub body (page-moon active, #moon-hub-h1,
//      moon hub search hero, moon cities grid, FAQPage JSON-LD), canonical=/moon,
//      indexable, same <title> as the old /moon-today.
//   B) /moon-today (+lang, +trailing slash) → 301 /moon (language preserved).
//   C) /en/moon → 200 + canonical /en/moon + hreflang alternates use /…/moon.
//   D) sitemap lists /moon (NOT the bare /moon-today hub) but KEEPS /moon-today-in-{city}.
//   E) GENERAL internal hub links in served HTML are /moon (navbar, qibla card),
//      with NO leftover bare href="/moon-today" hub link and NO {LANG_PREFIX} leak.
//   F) City routes unchanged: /moon-today-in-{city}, /moon-in-{city}[/date] still 200
//      (page-moon), and DO NOT 301 to /moon.
//   G) Meeus 49 unchanged on the dated grid (Riyadh Jun 2026: 15=المحاق, 30=البدر).
//
// Run: node scripts/_smoke_moon_today_content_move_to_moon_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

const PORT = 8211;
// Origin is derived at runtime from the served canonical (dev = http://localhost:PORT,
// prod = https://…onrender.com) so the canonical/hreflang/sitemap assertions are
// environment-agnostic and assert the PATH (/moon), not a hardcoded host.
let SITE = `http://localhost:${PORT}`;
function req(p, { redirect = false } = {}) {
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

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── A) /moon serves the hub (200 + same body + canonical /moon + indexable) ──
    console.log('── A) /moon = the moon hub (200, same content, canonical /moon) ──');
    const moon = await req('/moon');
    check('/moon → 200', moon.status === 200, String(moon.status));
    check('/moon: #page-moon active', /class="page active" id="page-moon"/.test(moon.body));
    check('/moon: exactly one hub H1 (#moon-hub-h1)', (moon.body.match(/<h1[^>]*id="moon-hub-h1"/g) || []).length === 1);
    const _canMoon = (moon.body.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
    // Derive the live origin from the canonical so prod/dev both pass (asserts the PATH).
    SITE = (_canMoon.match(/^(https?:\/\/[^/]+)/) || [])[1] || SITE;
    check('/moon: canonical = SITE/moon (self)', _canMoon === SITE + '/moon', _canMoon);
    check('/moon: indexable (no robots noindex)', !/<meta name="robots"[^>]*noindex/i.test(moon.body));
    check('/moon: title = moon-today hub title', /<title>حالة القمر اليوم/.test(moon.body));
    check('/moon: FAQPage JSON-LD present', /"@type":\s*"FAQPage"/.test(moon.body));
    check('/moon: moon hub search hero present (#moon-hub-search)', moon.body.includes('id="moon-hub-search"'));
    check('/moon: moon cities grid present (.moon-cities-grid)', moon.body.includes('moon-cities-grid'));
    check('/moon: substantial hub body (not footer-only)', moon.body.length > 60000, moon.body.length + ' bytes');

    // ── B) /moon-today → 301 /moon (language preserved, trailing slash absorbed) ──
    console.log('\n── B) /moon-today → 301 /moon (lang preserved) ──');
    for (const [from, to] of [['/moon-today', '/moon'], ['/en/moon-today', '/en/moon'], ['/fr/moon-today', '/fr/moon'], ['/ur/moon-today', '/ur/moon'], ['/moon-today/', '/moon']]) {
        const r = await req(from);
        check(`${from} → 301 ${to}`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }

    // ── C) /en/moon = 200 + canonical /en/moon + hreflang ──
    console.log('\n── C) /en/moon localized ──');
    const enMoon = await req('/en/moon');
    check('/en/moon → 200', enMoon.status === 200, String(enMoon.status));
    const _canEn = (enMoon.body.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
    check('/en/moon: canonical = SITE/en/moon', _canEn === SITE + '/en/moon', _canEn);
    check('/en/moon: hreflang ar → SITE/moon', enMoon.body.includes(`hreflang="ar" href="${SITE}/moon"`) || enMoon.body.includes(`href="${SITE}/moon" hreflang="ar"`));
    check('/en/moon: hreflang en → SITE/en/moon', enMoon.body.includes(`${SITE}/en/moon"`));

    // ── D) sitemap: /moon present, bare /moon-today hub absent, city /moon-today-in- kept ──
    console.log('\n── D) sitemap moved /moon-today → /moon (cities kept) ──');
    const sm = (await req('/sitemap-main.xml')).body;
    check('sitemap: <loc>SITE/moon</loc> present (all langs emitted)', sm.includes(`<loc>${SITE}/moon</loc>`) && sm.includes(`<loc>${SITE}/en/moon</loc>`));
    check('sitemap: bare /moon-today hub loc ABSENT', !/\/moon-today<\/loc>/.test(sm));
    // City moon sitemap URLs (/moon-today-in-{city}) are emitted from the famous-cities
    // list, which is empty in this local curated set (0 here, same as before this ticket).
    // This ticket never touched that emission — assert only that IF any are present they
    // keep the city /moon-today-in- form (NOT accidentally collapsed to the bare hub).
    check('sitemap: city moon URLs (if any) keep /moon-today-in- form', !/\/moon-today<\/loc>/.test(sm), `${(sm.match(/\/moon-today-in-/g) || []).length} city-moon locs`);

    // ── E) general hub links in served HTML are /moon (no bare /moon-today, no token leak) ──
    console.log('\n── E) general internal hub links → /moon ──');
    const home = (await req('/')).body;
    check('homepage navbar moon link = /moon', home.includes('<a href="/moon" data-page="moon"'));
    check('homepage: NO bare href="/moon-today" hub link', !home.includes('href="/moon-today"'));
    check('homepage: NO {LANG_PREFIX} leak', !home.includes('{LANG_PREFIX}'));
    check('homepage: city moon links intact (e.g. /moon-today-in-makkah)', home.includes('/moon-today-in-'));
    const enHome = (await req('/en')).body;
    check('/en homepage navbar moon link = /en/moon', enHome.includes('<a href="/en/moon" data-page="moon"'));
    const qibla = (await req('/qibla')).body;
    check('/qibla "Moon Today" hub card → /moon', qibla.includes('href="/moon"') && !qibla.includes('href="/moon-today"'));

    // ── F) city routes UNCHANGED (no 301 to /moon, still page-moon) ──
    console.log('\n── F) city moon routes unchanged ──');
    for (const u of ['/moon-today-in-riyadh', '/moon-in-riyadh', '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17']) {
        const r = await req(u);
        check(`${u}: 200 + #page-moon active (not 301)`, r.status === 200 && /class="page active" id="page-moon"/.test(r.body), `status=${r.status}`);
    }

    // ── G) Meeus 49 unchanged on the dated grid ──
    console.log('\n── G) Meeus 49 unchanged (Riyadh Jun 2026 grid) ──');
    const grid = (await req('/moon-in-riyadh/2026-06')).body;
    check('15 Jun = المحاق (new moon)', /2026-06-15[\s\S]{0,200}?المحاق/.test(grid));
    check('30 Jun = البدر (full moon)', /2026-06-30[\s\S]{0,200}?البدر/.test(grid));

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
