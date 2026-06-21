// MOON-SPA-ROUTER-MOON-PREFIX-ACTIVATION-AUDIT-1 — verification (self-contained).
//
// The SPA page-activation deciders in js/app.js must classify ANY /moon-prefix path as a
// MOON page (→ #page-moon), covering BOTH the current stable flat routes AND any future
// nested /moon/{country}/{city}/… — WITHOUT this ticket adding any server route. The bug it
// guards against: /moon/… fell through to the page-prayer-times default (stripped on moon
// pages) → no .page.active → only the footer rendered after hydration.
//
// PART A — extract the REAL `_isMoonPath` classifier from js/app.js and assert its output:
//   • the 7 new nested shapes + /en variant + the 5 legacy shapes → moon page
//   • prayer-times / qibla / hijri / date-converter / home / moonshine / moonlight → NOT moon
// PART B — confirm both activation deciders are wired to `_isMoonPath`
//   (initApp `_isMoonPage` + the pageshow self-heal `_expectedId`).
// PART C — regression: the legacy moon routes still serve 200 with #page-moon active + one H1.
//
// Run: node scripts/_smoke_moon_spa_router_moon_prefix_activation_audit_1.mjs
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0;
const check = (label, ok, extra) => { if (ok) pass++; else fail++; console.log(`${ok ? '✓' : '✗'} ${label}${extra !== undefined && extra !== '' ? '   →  ' + extra : ''}`); };

// ── PART A: extract + run the actual shipped classifier ──
console.log('── A) route classifier (extracted from js/app.js) ──');
const appSrc = readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const fnMatch = appSrc.match(/function _isMoonPath\(p\)\s*\{[\s\S]*?\n\}/);
check('js/app.js defines _isMoonPath()', !!fnMatch);
let _isMoonPath = () => false;
if (fnMatch) { try { _isMoonPath = new Function('return (' + fnMatch[0] + ')')(); } catch (e) { check('_isMoonPath is evaluable', false, e.message); } }

const MOON = [
    '/moon', '/moon/today', '/moon/saudi-arabia', '/moon/saudi-arabia/riyadh',
    '/moon/saudi-arabia/riyadh/today', '/moon/saudi-arabia/riyadh/2026-06',
    '/moon/saudi-arabia/riyadh/2026-06-17', '/en/moon/saudi-arabia/riyadh/today',
    '/moon-today', '/moon-today-in-riyadh', '/moon-in-riyadh',
    '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17', '/en/moon-today',
];
const NOT_MOON = [
    '/prayer-times-in-riyadh', '/qibla-in-riyadh', '/today-hijri-date',
    '/date-converter', '/', '/en/qibla', '/moonshine', '/moonlight', '/zakat-calculator',
];
for (const u of MOON) check(`moon page: ${u}`, _isMoonPath(u) === true, String(_isMoonPath(u)));
for (const u of NOT_MOON) check(`NOT moon: ${u}`, _isMoonPath(u) === false, String(_isMoonPath(u)));

// ── PART B: both deciders are wired to the shared classifier ──
console.log('\n── B) activation deciders use _isMoonPath ──');
check('initApp _isMoonPage = _isMoonPath(_mpPath)', /const _isMoonPage = _isMoonPath\(_mpPath\)/.test(appSrc));
check('pageshow self-heal: else if (_isMoonPath(_path))', /else if \(_isMoonPath\(_path\)\)/.test(appSrc));
// the OLD narrow moon-today|moon-in- self-heal branch must be gone
check('old narrow self-heal branch removed', !/else if \(\/\\\/\(\?:\(\?:en[^)]*\)\\\/\)\?\(\?:moon-today\|moon-in-\)\//.test(appSrc));

// ── PART C: legacy moon routes still render (SSR: 200 + #page-moon active + 1 H1) ──
const PORT = 8209;
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

let exitCode = 1;
const s = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'ignore', 'ignore'] });
try {
    if (!await waitReady(25000)) { console.error('✗ server not ready'); s.kill('SIGKILL'); process.exit(1); }
    console.log('\n── C) moon routes still render (SSR) ──');
    // MOON-TODAY-CONTENT-MOVE-TO-MOON-1: the hub moved /moon-today → /moon (the bare
    //   /moon-today now 301s to /moon, covered by its own smoke). The 200 hub is /moon.
    // MOON-CITY-HUB-ROUTE-STRUCTURE-ADD-1 (d0dd388, already in HEAD): the bare flat hub
    //   /moon-in-{city} now 301s to the nested hub /moon/{country}/{city}; today + dated
    //   /moon-in-{city}/{date} stay 200. Test-only expectation refresh; no runtime change.
    for (const u of ['/moon', '/moon-today-in-riyadh', '/moon-in-riyadh/2026-06', '/moon-in-riyadh/2026-06-17']) {
        const r = await get(u);
        const active = r.body.includes('class="page active" id="page-moon"');
        const h1 = (r.body.match(/<h1[^>]*id="(?:moon-hub-h1|moon-page-h1)"/g) || []).length;
        check(`${u}: 200 + #page-moon active + 1 moon H1`, r.status === 200 && active && h1 === 1, `status=${r.status} active=${active} h1=${h1}`);
    }
    // the bare flat hub /moon-in-{city} 301s to the nested hub /moon/{country}/{city} (lang preserved)
    for (const [from, to] of [['/moon-in-riyadh', '/moon/saudi-arabia/riyadh'], ['/en/moon-in-riyadh', '/en/moon/saudi-arabia/riyadh']]) {
        const r = await get(from);
        check(`${from} → 301 ${to} (nested hub)`, r.status === 301 && r.loc === to, `status=${r.status} loc=${r.loc}`);
    }
    // non-moon pages must NOT be page-moon (server unchanged regression)
    console.log('\n── C2) non-moon routes are NOT page-moon ──');
    for (const [u, pid] of [['/qibla', 'page-qibla'], ['/zakat-calculator', 'page-zakat'], ['/today-hijri-date', 'page-hijri-today'], ['/date-converter', 'page-date-converter']]) {
        const r = await get(u);
        check(`${u}: not #page-moon active`, !/class="page active" id="page-moon"/.test(r.body), `200=${r.status === 200}`);
    }

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    exitCode = fail === 0 ? 0 : 1;
} catch (e) {
    console.error('✗ unexpected', e && e.message); exitCode = 1;
} finally { s.kill('SIGKILL'); }
process.exit(exitCode);
