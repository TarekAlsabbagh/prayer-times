// NAVBAR-LINKS-OPEN-IN-NEW-TAB-REAL-HREF-FIX-1 — verification (self-contained).
//
// Every primary sidebar-nav item must be a REAL anchor pointing at its true route, so
// right-click "Open in new tab/window" and Copy-link-address use the correct page instead
// of the homepage. The SPA still intercepts plain left-clicks; MODIFIED clicks (Ctrl/Cmd/
// Shift/Alt) fall through to native browser behavior (open the real href).
//
//   • AR homepage: each nav item carries its exact route (no href="#", none empty).
//   • Non-AR pages: the SSR lang-prefix pass turns them into /{lang}/… site-wide.
//   • Every nav target resolves 200 directly (canonical = the route, NOT redirect-to-home).
//   • js/app.js initNavigation() skips modified clicks before preventDefault.
//
// Run: node scripts/_smoke_navbar_links_open_in_new_tab_real_href_fix_1.mjs

import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
function check(label, ok, extra) { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); }

console.log('═══ NAVBAR-LINKS-OPEN-IN-NEW-TAB-REAL-HREF-FIX-1 ═══');

// data-page → canonical AR route (prayer-times is the homepage, so its route IS "/").
const NAV = {
    'prayer-times':   '/',
    'qibla':          '/qibla',
    'moon':           '/moon-today',
    'zakat':          '/zakat-calculator',
    'azkar':          '/azkar',
    'tasbih':         '/msbaha',
    'hijri-today':    '/today-hijri-date',
    'hijri-calendar': '/hijri-calendar',
    'date-converter': '/date-converter',
};

const PORT = 8201;
function get(p) {
    return new Promise((resolve) => {
        const r = http.request({ host: 'localhost', port: PORT, path: p, method: 'GET', headers: { 'Accept-Encoding': 'identity' } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b, loc: res.headers.location || '' }));
        });
        r.on('error', () => resolve({ status: 0, body: '', loc: '' }));
        r.end();
    });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function waitReady(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await get('/health'); if (r.status === 200) return true; await sleep(400); } return false; }
// parse the sidebar-nav hrefs → { dataPage: href }
function navHrefs(html) {
    const out = {};
    const re = /<a href="([^"]*)" data-page="([^"]+)"/g;
    let m; while ((m = re.exec(html)) !== null) out[m[2]] = m[1];
    return out;
}

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(20000)) { console.error('✗ not ready'); s.kill('SIGKILL'); process.exit(1); }

    // ── 1) AR homepage: real hrefs, exact route per item, none "#"/empty ──
    console.log('-- AR homepage nav hrefs --');
    const arNav = navHrefs((await get('/')).body);
    for (const [dp, route] of Object.entries(NAV)) {
        check(`AR nav "${dp}" href = ${route}`, arNav[dp] === route, arNav[dp]);
    }
    check('AR: NO nav href is "#"', !Object.values(arNav).some(h => h === '#'));
    check('AR: NO nav href is empty', !Object.values(arNav).some(h => !h));
    check('AR: all 9 nav items present', Object.keys(NAV).every(dp => dp in arNav), Object.keys(arNav).length + ' found');

    // ── 2) EN non-homepage (/en/qibla): every nav item lang-prefixed site-wide ──
    console.log('-- EN /en/qibla nav hrefs (lang-prefixed) --');
    const enNav = navHrefs((await get('/en/qibla')).body);
    const enExpect = { ...NAV, 'prayer-times': '/en' };
    for (const [dp, route] of Object.entries(enExpect)) {
        const want = dp === 'prayer-times' ? '/en' : '/en' + route;
        check(`EN nav "${dp}" href = ${want}`, enNav[dp] === want, enNav[dp]);
    }

    // ── 3) Every nav target resolves 200 directly (no redirect to homepage) ──
    console.log('-- direct route resolution (200, no redirect-to-home) --');
    for (const route of [...new Set(Object.values(NAV))]) {
        const r = await get(route);
        check(`${route} → 200 (not a redirect)`, r.status === 200, r.status + (r.loc ? ' → ' + r.loc : ''));
    }
    // canonical confirms the served page IS the route (not the homepage) for the new ones.
    for (const route of ['/qibla', '/moon-today', '/date-converter', '/msbaha', '/today-hijri-date', '/hijri-calendar']) {
        const body = (await get(route)).body;
        const cm = body.match(/<link rel="canonical" href="[^"]*?(\/[a-z-]*)"/);
        const canon = cm ? cm[1] : '';
        check(`${route}: canonical is the route, not "/"`, canon === route, canon);
    }

    // ── 4) initNavigation skips MODIFIED clicks before preventDefault ──
    console.log('-- js/app.js modifier-click guard --');
    const appJs = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
    check('app.js has modifier guard (button/ctrl/meta/shift/alt → return)',
        /e\.button !== 0 \|\| e\.ctrlKey \|\| e\.metaKey \|\| e\.shiftKey \|\| e\.altKey\)\s*return;/.test(appJs));
    // guard must sit at the very top of the nav click handler, BEFORE preventDefault.
    const idxGuard = appJs.indexOf('if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;');
    const idxPD = appJs.indexOf('e.preventDefault();', appJs.indexOf('function initNavigation'));
    check('guard precedes preventDefault in initNavigation', idxGuard !== -1 && idxPD !== -1 && idxGuard < idxPD, `${idxGuard} < ${idxPD}`);

    // ── 5) cache-buster bumped ──
    check('index.html references app.js?v=781', (await get('/')).body.indexOf('app.js?v=781') !== -1);

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
