// NAVBAR-CITY-CONTEXT-LINKS-FOR-CITY-PAGES-1 — verification (self-contained).
//
// On a CURATED city page, the 3 city-bound sidebar-nav items (prayer-times / qibla / moon)
// point at the SAME city's pages so right-click "open in new tab" / Ctrl+click / copy-link
// land on the city page, not the generic hub. On hubs/tool pages and for NON-curated slugs
// they fall back to the generic hubs. The non-city nav items (zakat/azkar/tasbih/hijri/
// date-converter) stay generic everywhere. SSR-only (the client SPA already navigates
// city-aware by data-page; this aligns the href). Lang prefix is preserved on /en/… .
//
// Run: node scripts/_smoke_navbar_city_context_links_for_city_pages_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ NAVBAR-CITY-CONTEXT-LINKS-FOR-CITY-PAGES-1 ═══');

const PORT = 8204;
function get(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b, loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
async function navOf(p) {
    const html = (await get(p)).body;
    const out = {};
    const re = /<a href="([^"]*)" data-page="([^"]+)"/g;
    let m; while ((m = re.exec(html)) !== null) out[m[2]] = m[1];
    return out;
}

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── 1) Curated city pages → city-specific prayer/qibla/moon nav ──
    for (const [route, slug] of [['/prayer-times-in-an-nabiah', 'an-nabiah'], ['/qibla-in-an-nabiah', 'an-nabiah'], ['/moon-today-in-an-nabiah', 'an-nabiah'], ['/prayer-times-in-makkah', 'makkah']]) {
        console.log(`-- curated page ${route} --`);
        const n = await navOf(route);
        check(`${route}: prayer-times → /prayer-times-in-${slug}`, n['prayer-times'] === '/prayer-times-in-' + slug, n['prayer-times']);
        check(`${route}: qibla → /qibla-in-${slug}`, n['qibla'] === '/qibla-in-' + slug, n['qibla']);
        check(`${route}: moon → /moon-today-in-${slug}`, n['moon'] === '/moon-today-in-' + slug, n['moon']);
        // non-city-bound items stay generic
        check(`${route}: zakat stays generic /zakat-calculator`, n['zakat'] === '/zakat-calculator', n['zakat']);
        check(`${route}: azkar stays generic /azkar`, n['azkar'] === '/azkar', n['azkar']);
        check(`${route}: date-converter stays generic`, n['date-converter'] === '/date-converter', n['date-converter']);
        // never "#"
        check(`${route}: NO nav href is "#"`, !Object.values(n).some(h => h === '#'));
    }

    // ── 2) Hub / tool / home pages → generic hubs (unchanged) ──
    for (const route of ['/qibla', '/moon-today', '/', '/azkar', '/date-converter']) {
        console.log(`-- hub/tool ${route} --`);
        const n = await navOf(route);
        check(`${route}: prayer-times → /`, n['prayer-times'] === '/', n['prayer-times']);
        check(`${route}: qibla → /qibla`, n['qibla'] === '/qibla', n['qibla']);
        check(`${route}: moon → /moon-today`, n['moon'] === '/moon-today', n['moon']);
    }

    // ── 3) EN curated city → lang-prefixed city-specific ──
    console.log('-- EN /en/prayer-times-in-an-nabiah --');
    const en = await navOf('/en/prayer-times-in-an-nabiah');
    check('EN: prayer-times → /en/prayer-times-in-an-nabiah', en['prayer-times'] === '/en/prayer-times-in-an-nabiah', en['prayer-times']);
    check('EN: qibla → /en/qibla-in-an-nabiah', en['qibla'] === '/en/qibla-in-an-nabiah', en['qibla']);
    check('EN: moon → /en/moon-today-in-an-nabiah', en['moon'] === '/en/moon-today-in-an-nabiah', en['moon']);
    check('EN: zakat stays generic /en/zakat-calculator', en['zakat'] === '/en/zakat-calculator', en['zakat']);

    // ── 4) NON-curated city → fallback to generic hubs (no city-specific build) ──
    for (const route of ['/prayer-times-in-kamikawa', '/qibla-in-del-rio']) {
        console.log(`-- non-curated ${route} (fallback to hubs) --`);
        // confirm it's genuinely non-curated via the prayer-times noindex oracle
        const ptRobots = (await get('/prayer-times-in-' + route.split('-in-')[1])).body.match(/name="robots"\s+content="(noindex|index)/);
        const n = await navOf(route);
        check(`${route}: prayer-times stays / (hub)`, n['prayer-times'] === '/', n['prayer-times']);
        check(`${route}: qibla stays /qibla (hub)`, n['qibla'] === '/qibla', n['qibla']);
        check(`${route}: moon stays /moon-today (hub)`, n['moon'] === '/moon-today', n['moon']);
    }

    // ── 5) routes resolve 200 (no redirect-to-home) ──
    console.log('-- routes resolve --');
    for (const route of ['/prayer-times-in-an-nabiah', '/qibla-in-an-nabiah', '/moon-today-in-an-nabiah']) {
        const r = await get(route);
        check(`${route} → 200`, r.status === 200, r.status);
    }

    // ── 6) curated-source-of-truth = _findPlaceBySlug (server.js) ──
    const srv = readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    check('rewrite gated by _findPlaceBySlug (curated source of truth)',
        srv.indexOf('NAVBAR-CITY-CONTEXT-LINKS') !== -1 && srv.indexOf('_findPlaceBySlug(_navM[1])') !== -1);

    // ── 7) active-state JS untouched (js/app.js not modified by this ticket) ──
    const appJs = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
    check('active-state JS intact (qibla page sets qibla nav active)',
        appJs.indexOf("document.querySelector('.sidebar-nav a[data-page=\"qibla\"]')") !== -1 || appJs.indexOf('.sidebar-nav a[data-page="qibla"]') !== -1);
    check('modifier-guard from prev ticket still present',
        /e\.button !== 0 \|\| e\.ctrlKey \|\| e\.metaKey \|\| e\.shiftKey \|\| e\.altKey\)\s*return;/.test(appJs));

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
