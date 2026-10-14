// MOON-DAY-PAGES-REMOVAL-1 — DOM-after-JavaScript probe (headless Chrome over raw CDP, Node 24 global WebSocket).
//
// What it proves on the hydrated pages (load event + 3 s), in all 10 locales:
//   [L]  every href in the DOM (HTML a/link/area/... and SVG xlink:href, incl. the moon chart dots, the 14-day forecast,
//        the sidebar rewriters, the smart pill, the country grid, the friendly links) carries 0 links to a removed page:
//        nested /moon/{c}/{city}/today | /{yyyy}/{mm}/{dd}, legacy /moon-today-in-*, legacy dated /moon-in-*/{yyyy-mm-dd};
//        0 a.fc-day-link, 0 <a> inside ul.moon-hub-cal-grid, no #moon-date-nav / #moon-today-city-edu, no ad tag in the DOM.
//   [N]  click tests (navAct): the sidebar Moon tab (city pages, a month page, the homepage with a picked city), the hub
//        explore picker "go", the country capital picker "go", a moon search pick on /moon (type a city, pick the first
//        result), the country hero search pick, navigateToMoonToday() — each must land on a 200 page that is not a removed
//        URL, with no 404/410/5xx document anywhere in the navigation chain.
//   [X]  isolation: 0 successful responses from a non-loopback host (attempts are counted per host and reported).
//
// Isolation (the links_js3.mjs model — three independent layers, NO Fetch interception):
//   1. --proxy-server=http=127.0.0.1:9;https=127.0.0.1:9 --proxy-bypass-list=127.0.0.1 → any non-loopback TCP is dead
//   2. --host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1 → no DNS query leaves the browser
//   3. Network.setBlockedURLs (ad / analytics patterns + *timesprayers.com* + *onrender.com*) on every page session
//   The server is booted with ADSENSE_CLIENT=off and the outbound guard (node -r guard.cjs, GUARD_OUT checked at the end).
//   Every page gets a fresh browser context (clean storage, no service worker carry-over). CDP port < 49152.
//
// Usage
//   node scripts/_browser_moon_day_pages_removal_1.mjs              candidate = this worktree (:8444)
//   node scripts/_browser_moon_day_pages_removal_1.mjs --base-only  validate the probe on BASE (:8445): it must FIND the
//                                                                   removed-page links and landings that exist today
//   env TP_BASE_ROOT (default C:/Users/Tarek/Downloads/timesprayers-mlobs2), TP_GUARD (default …/timesprayers-shed-qa/guard.cjs),
//       TP_DAYREMOVE_CDP_PORT (default 41404), TP_DAYREMOVE_CONC (default 2)
// Never run against production. Local server only.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-mlobs2';
const BASE_ONLY = process.argv.includes('--base-only');
const ROOT = BASE_ONLY ? BASE_ROOT : REPO;
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = Number(process.env.TP_DAYREMOVE_BROWSER_PORT || (BASE_ONLY ? 8445 : 8444));
const CDP_PORT = Number(process.env.TP_DAYREMOVE_CDP_PORT || 41404);
const CONC = Math.max(1, Number(process.env.TP_DAYREMOVE_CONC || 2));
const SITE = 'https://timesprayers.com';
const SCRATCH_DEFAULT = 'C:/Users/Tarek/AppData/Local/Temp/claude/C--Users-Tarek-Downloads-TIME-PRAYER/4a4bfa89-f0ce-4ae8-bf28-1d023d5d9eb3/scratchpad';
const TMP = fs.mkdtempSync(path.join(fs.existsSync(SCRATCH_DEFAULT) ? SCRATCH_DEFAULT : os.tmpdir(), 'dayremove-browser-'));
const PROFILE = path.join(TMP, 'chrome-profile');
const BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*',
    '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*google.com/ads*', '*gstatic.com/ads*', '*timesprayers.com*', '*onrender.com*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const P2 = (n) => String(n).padStart(2, '0');
const NOW = new Date();
const CY = NOW.getUTCFullYear(), CM = P2(NOW.getUTCMonth() + 1);
const DB_SLUG = 'buraydah';
setTimeout(() => { console.log('WATCHDOG: exceeded 25 min'); cleanup(); process.exit(3); }, 25 * 60 * 1000).unref();

// removed targets (same regexes as scripts/_smoke_moon_day_pages_removal_1.mjs)
const RM_NESTED = /\/moon\/[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*\/(?:today|\d{4}\/\d{2}\/\d{2})(?:[?#"'\s]|$)/;
const RM_LEG_TODAY = /moon-today-in-/;
const RM_LEG_DAY = /\/moon-in-[^\/?#"'\s]+\/\d{4}-\d{2}-\d{2}/;
const isRemovedTarget = (s) => RM_NESTED.test(s) || RM_LEG_TODAY.test(s) || RM_LEG_DAY.test(s);
const REMOVED_PAGE_PATH = [
    /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon\/[a-z][a-z0-9-]+\/[a-z][a-z0-9-]+\/(?:today|\d{4}\/\d{2}\/\d{2})(?:\.html)?\/?$/,
    /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-today-in-/,
    /^\/(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\/)?moon-in-[^/]+\/\d{4}-\d{2}-\d{2}/,
];
const isRemovedPagePath = (p) => REMOVED_PAGE_PATH.some((re) => re.test(String(p).split('?')[0]));

// ── results ──
let pass = 0, fail = 0; const failures = []; const SEC = {};
function check(tag, ok, label, detail) {
    const s = SEC[tag] || (SEC[tag] = { pass: 0, fail: 0 });
    if (ok) { pass++; s.pass++; console.log('  ✓ [' + tag + '] ' + label); }
    else { fail++; s.fail++; const line = '[' + tag + '] ' + label + (detail !== undefined ? ' :: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 900) : ''); failures.push(line); console.log('  ✗ ' + line); }
}
const info = (msg) => console.log('  · INFO ' + msg);

// ── processes ──
const kill = (pid) => { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const procs = [];
function cleanup() { for (const p of procs.splice(0)) kill(p.pid); }
function httpGet(port, p) {
    return new Promise((resolve) => {
        const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => {
            const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => resolve({ status: x.statusCode, headers: x.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        r.setTimeout(60000, () => { r.destroy(); resolve({ status: 0, headers: {}, body: '' }); });
        r.on('error', () => resolve({ status: 0, headers: {}, body: '' })); r.end();
    });
}
const FIXTURE_PATH = path.join(TMP, 'discovered-fixture.json');
fs.writeFileSync(FIXTURE_PATH, JSON.stringify({ 'orig-only-city': { slug: 'orig-only-city', lat: 20.5, lng: 49.5, timezone: 'Asia/Riyadh', country_code: 'sa', type: 'city', names: { ar: 'مدينة الاسم الأصلي', en: 'Orig Only City' } } }), 'utf8');
const GUARD_OUT = path.join(TMP, 'guard.log');
async function bootServer(root, port) {
    if ((await httpGet(port, '/health')).status !== 0) throw new Error('port ' + port + ' already in use — refusing to test a foreign server');
    fs.writeFileSync(GUARD_OUT, '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
                  ADSENSE_CLIENT: 'off', DISCOVERED_SSR_TEST_FIXTURE: FIXTURE_PATH, GUARD_OUT, TP_MOON_DAY_SHED: '0' };
    for (const k of ['TP_ENABLE_SEARCH_TEST', 'TP_MOON_RANGE_TEST_NOW', 'NODE_OPTIONS']) delete env[k];
    const p = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    procs.push(p);
    let up = false; for (let i = 0; i < 300 && !up; i++) { up = (await httpGet(port, '/health')).status === 200; if (!up) await sleep(400); }
    if (!up) throw new Error('server never became healthy on ' + port);
    console.log('  server up on ' + port + ' (root ' + root + ')');
}

// ── raw CDP ──
class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.subs = new Set();
        ws.onmessage = (ev) => { const m = JSON.parse(ev.data);
            if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); clearTimeout(p.t); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
            else for (const f of this.subs) { try { f(m); } catch (_) {} } };
        ws.onclose = () => { for (const [, p] of this.pend) { clearTimeout(p.t); p.rej(new Error('socket closed')); } this.pend.clear(); }; }
    static async open(u) { const ws = new WebSocket(u); await Promise.race([new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('ws')); }), sleep(10000).then(() => { throw new Error('ws timeout'); })]); return new CDP(ws); }
    send(m, p = {}, s, ms = 30000) { const id = ++this.id; return new Promise((res, rej) => { const t = setTimeout(() => { this.pend.delete(id); rej(new Error('timeout ' + m)); }, ms); this.pend.set(id, { res, rej, t }); this.ws.send(JSON.stringify({ id, method: m, params: p, sessionId: s })); }); }
}
const hostOf = (u) => { try { return new URL(u).host; } catch (_) { return ''; } };
const isLocal = (u) => /^(data|blob|about|chrome|devtools):/.test(u) || hostOf(u) === '127.0.0.1:' + PORT || /^https?:\/\/127\.0\.0\.1(?::\d+)?\//.test(u);

// sessionStorage seed (the shape site-search.js onPick writes) — a picked city WITHOUT any network
const RIYADH_CTX = { lat: 24.7136, lng: 46.6753, name: 'الرياض', country: 'المملكة العربية السعودية', englishName: 'Riyadh', countryCode: 'sa', timezone: 'Asia/Riyadh', slug: 'riyadh' };
const INIT = (seed) => `(function(){ try { if (location.hostname !== '127.0.0.1') return; } catch (_) { return; }
try { var S=${JSON.stringify(seed || null)}; if (S) { var c=JSON.stringify(Object.assign({}, S, {ts: Date.now()})); sessionStorage.setItem('selected_city', c); sessionStorage.setItem('last_city_context', c); sessionStorage.setItem('city_' + S.slug, JSON.stringify(Object.assign({}, S, {_v: 2}))); } } catch (_) {}
})();`;

// In-page collector (serialised with toString — no closures).
function COLLECT() {
    const XL = 'http://www.w3.org/1999/xlink';
    const hrefs = [];
    for (const el of document.querySelectorAll('*')) {
        const h = el.getAttribute('href'), x = el.getAttributeNS(XL, 'href');
        const tag = el.localName + (el.id ? '#' + el.id : '') + (el.classList && el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
        for (const v of [h, x]) {
            if (v == null) continue;
            let abs = v; try { const u = new URL(v, location.href); abs = u.origin === location.origin ? u.pathname + u.search + u.hash : u.href; } catch (_) {}
            hrefs.push({ v, abs, tag, svg: el.namespaceURI === 'http://www.w3.org/2000/svg' });
        }
    }
    const opts = [...document.querySelectorAll('option')].map((o) => o.getAttribute('value') || '').filter((v) => v.startsWith('/'));
    return {
        path: location.pathname, title: document.title, hrefs, optionUrls: opts,
        fcDayLinks: document.querySelectorAll('a.fc-day-link').length,
        fcRows: document.querySelectorAll('#moon-forecast-body tr').length,
        gridAnchors: document.querySelectorAll('ul.moon-hub-cal-grid a').length,
        gridCells: document.querySelectorAll('ul.moon-hub-cal-grid li.moon-hub-cal-cell:not(.moon-hub-cal-cell--empty)').length,
        svgAnchors: document.querySelectorAll('svg a').length,
        dateNav: !!document.getElementById('moon-date-nav'), todayCityEdu: !!document.getElementById('moon-today-city-edu'),
        adTag: !!document.querySelector('script[src*="googlesyndication"], ins.adsbygoogle[data-ad-client^="ca-pub"]'),
        moonTab: (document.querySelector('.sidebar-nav a[data-page="moon"]') || {}).getAttribute ? document.querySelector('.sidebar-nav a[data-page="moon"]').getAttribute('href') : null,
    };
}

let br = null;
async function evalIn(S, fnOrExpr, arg, awaitPromise = false) {
    const expression = typeof fnOrExpr === 'function' ? '(' + fnOrExpr.toString() + ')(' + (arg === undefined ? '' : JSON.stringify(arg)) + ')' : fnOrExpr;
    const r = await br.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, S, 45000);
    if (r.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
}
async function waitLoaded(S, st) {
    for (let i = 0; i < 120 && !st.loaded; i++) await sleep(250);
    if (!st.loaded) st.notes.push('load event not fired within 30 s');
    await sleep(3000);
}
const NET = { attempts: new Map(), okResponses: [], failed: new Map() };
async function withPage(origin, route, { seed = null, act } = {}) {
    const { browserContextId } = await br.send('Target.createBrowserContext', {});
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const st = { loaded: false, docs: [], exceptions: [], consoleErrors: [], notes: [], reqs: new Map() };
    const on = (m) => {
        if (m.sessionId !== S) return; const P = m.params || {};
        switch (m.method) {
            case 'Network.requestWillBeSent': {
                const u = P.request.url; st.reqs.set(P.requestId, u);
                if (!isLocal(u)) { const h = hostOf(u) || u.slice(0, 40); NET.attempts.set(h, (NET.attempts.get(h) || 0) + 1); }
                if (P.redirectResponse && P.type === 'Document') st.docs.push({ url: P.redirectResponse.url, status: P.redirectResponse.status, t: Date.now() });
                break;
            }
            case 'Network.responseReceived': {
                const u = P.response.url;
                if (!isLocal(u)) NET.okResponses.push(route + ' → ' + u.slice(0, 160) + ' ' + P.response.status);
                if (P.type === 'Document') st.docs.push({ url: u, status: P.response.status, t: Date.now() });
                break;
            }
            case 'Network.loadingFailed': { const u = st.reqs.get(P.requestId) || ''; if (!isLocal(u)) { const k = (hostOf(u) || '?') + ' ' + (P.blockedReason || P.errorText); NET.failed.set(k, (NET.failed.get(k) || 0) + 1); } break; }
            case 'Runtime.exceptionThrown': st.exceptions.push(String((P.exceptionDetails && ((P.exceptionDetails.exception && P.exceptionDetails.exception.description) || P.exceptionDetails.text)) || '').slice(0, 200)); break;
            case 'Page.loadEventFired': st.loaded = true; break;
            case 'Page.javascriptDialogOpening': br.send('Page.handleJavaScriptDialog', { accept: false }, S).catch(() => {}); break;
        }
    };
    br.subs.add(on);
    try {
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S);
        await br.send('Network.setBlockedURLs', { urls: BLOCK }, S);
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S);
        await br.send('Network.setCacheDisabled', { cacheDisabled: true }, S);
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT(seed) }, S);
        await br.send('Page.navigate', { url: origin + route }, S);
        await waitLoaded(S, st);
        const out = act ? await act(S, st) : await evalIn(S, COLLECT);
        return { route, st, ...out };
    } finally {
        br.subs.delete(on);
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
        await br.send('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
    }
}
async function pool(tasks) {
    const results = new Array(tasks.length); let next = 0;
    async function worker() { while (next < tasks.length) { const i = next++; const t = tasks[i]; const t0 = Date.now();
        try { results[i] = await t.run(); } catch (e) { results[i] = { error: String(e && e.message || e), route: t.id }; }
        console.log('    · ' + t.id + ' (' + (Date.now() - t0) + ' ms)' + (results[i] && results[i].error ? ' ERROR ' + results[i].error : '')); } }
    await Promise.all(Array.from({ length: Math.min(CONC, tasks.length) }, worker));
    return results;
}

// navAct: run `prep` (returns a description), then `trigger` (clicks), wait for the navigation and the landing load
const navAct = (prep, trigger) => async (S, st) => {
    const before = await evalIn(S, 'location.pathname + location.search');
    let prepOut = null;
    if (prep) { try { prepOut = await evalIn(S, prep, undefined, true); } catch (e) { prepOut = { error: String(e.message || e) }; } }
    const t0 = Date.now();
    st.loaded = false;
    await evalIn(S, 'setTimeout(function(){ ' + trigger + ' }, 0); true');
    let p = before; for (let i = 0; i < 80 && p === before; i++) { await sleep(250); try { p = await evalIn(S, 'location.pathname + location.search'); } catch (_) {} }
    await waitLoaded(S, st);
    let c = null; try { c = await evalIn(S, COLLECT); } catch (e) { c = { error: String(e.message || e) }; }
    const chain = st.docs.filter((d) => d.t >= t0);
    return { ...c, navFrom: before, navTo: p, prep: prepOut, chain };
};
// picker: choose the 2nd non-empty year option and the 3rd month option, fire change events, report the go button state
const PICK = (ids) => `(() => { const ids = ${JSON.stringify(ids)}; const out = {};
  for (const k of ['y', 'm', 'd']) { const el = document.getElementById(ids[k]); if (!el) { out[k] = null; continue; }
    const vals = [...el.options].map((o) => o.value).filter((v) => v !== '');
    const v = k === 'y' ? (vals[1] || vals[0]) : k === 'm' ? (vals[2] || vals[0]) : (vals[4] || vals[0]);
    el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); out[k] = v; }
  const g = document.getElementById(ids.go); out.go = g ? { disabled: !!g.disabled, tag: g.localName } : null; return out; })()`;
// search: type, wait for the first suggestion, report it (the trigger clicks it)
// itemSel: what to click inside the box; mustInclude: wait until the clicked item's text contains it (filtered grids)
const TYPE = (inputId, boxId, q, itemSel, mustInclude) => `(async () => { const i = document.getElementById(${JSON.stringify(inputId)}); if (!i) return { error: 'no #' + ${JSON.stringify(inputId)} };
  i.focus(); i.value = ${JSON.stringify(q)}; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
  const box = '#' + ${JSON.stringify(boxId)};
  const sel = ${JSON.stringify(itemSel || '')} ? box + ' ' + ${JSON.stringify(itemSel || '')} : box + ' [role="option"], ' + box + ' button, ' + box + ' a[href], ' + box + ' li';
  const must = ${JSON.stringify(mustInclude || '')};
  for (let k = 0; k < 40; k++) { const e = [...document.querySelectorAll(sel)].find((x) => !must || (x.textContent || '').includes(must)); if (e) { e.setAttribute('data-tp-probe-pick', '1'); return { first: (e.textContent || '').trim().slice(0, 80), tag: e.localName, href: e.getAttribute('href') }; } await new Promise((r) => setTimeout(r, 250)); }
  return { error: 'no suggestion within 10 s', box: (document.getElementById(${JSON.stringify(boxId)}) || {}).innerHTML ? document.getElementById(${JSON.stringify(boxId)}).innerHTML.slice(0, 200) : null }; })()`;
const CLICK_PICK = "var e=document.querySelector('[data-tp-probe-pick]'); if (e) e.click();";

// ════════════════════════════════════════════════════════════════════════════
let chrome = null;
try {
    console.log('=== MOON-DAY-PAGES-REMOVAL-1 browser probe — ' + (BASE_ONLY ? 'BASE-ONLY validation' : 'candidate') + ' — UTC ' + NOW.toISOString() + ' — root ' + ROOT + ' ===');
    if (!(CDP_PORT < 49152)) throw new Error('CDP port must stay below 49152');
    if (!fs.existsSync(GUARD) || /\s/.test(GUARD)) throw new Error('outbound guard missing or its path has spaces: ' + GUARD);
    await bootServer(ROOT, PORT);
    const A = 'http://127.0.0.1:' + PORT;
    const rawHome = await httpGet(PORT, '/moon/saudi-arabia/riyadh');
    check('X', !/googlesyndication/.test(rawHome.body), 'served HTML carries no googlesyndication tag (ADSENSE_CLIENT=off)');

    fs.mkdirSync(PROFILE, { recursive: true });
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + PROFILE, '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-default-apps', '--no-pings',
        '--disable-gpu', '--disable-domain-reliability', '--window-size=1280,900',
        '--proxy-server=http=127.0.0.1:9;https=127.0.0.1:9', '--proxy-bypass-list=127.0.0.1',
        '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    procs.push(chrome);
    let wsu; for (let i = 0; i < 150 && !wsu; i++) { try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version'); if (r.ok) wsu = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!wsu) await sleep(300); }
    if (!wsu) throw new Error('chrome never came up');
    br = await CDP.open(wsu);

    // ── page matrix: the HTTP smoke's [D] pages; full list for ar + en, hub + month + /moon for the other 8 locales ──
    const RIY = '/moon/saudi-arabia/riyadh', DBC = '/moon/saudi-arabia/' + DB_SLUG;
    const pages = [];
    for (const L of LANGS) {
        const P = lp(L);
        if (L === 'ar' || L === 'en') {
            pages.push({ route: P + '/' }, { route: P + '/prayer-times-in-riyadh' }, { route: P + '/qibla-in-riyadh' }, { route: P + '/next-prayer-in-riyadh' },
                { route: P + '/time-left-until-next-prayer-in-riyadh' }, { route: P + '/moon' }, { route: P + '/moon', seed: RIYADH_CTX, tag: 'smart pill' },
                { route: P + '/moon/saudi-arabia' }, { route: P + RIY }, { route: P + RIY + '/' + CY }, { route: P + RIY + '/' + CY + '/' + CM },
                { route: P + DBC }, { route: P + DBC + '/' + CY }, { route: P + DBC + '/' + CY + '/' + CM }, { route: P + '/today-hijri-date' },
                { route: P + '/', seed: RIYADH_CTX, tag: 'picked city' });
        } else {
            pages.push({ route: P + '/moon' }, { route: P + RIY }, { route: P + RIY + '/' + CY + '/' + CM });
        }
    }
    pages.push({ route: '/moon/saudi-arabia/orig-only-city' }, { route: '/moon/egypt' }, { route: '/moon/saudi-arabia/riyadh/2026/06' });

    const tasks = [];
    for (const pg of pages) tasks.push({ id: 'L ' + pg.route + (pg.tag ? ' (' + pg.tag + ')' : ''), kind: 'L', pg, run: () => withPage(A, pg.route, { seed: pg.seed }) });
    // ── click tests ──
    const NAV = [];
    const moonTab = "var a=document.querySelector('.sidebar-nav a[data-page=\"moon\"]')||document.querySelector('a[data-page=\"moon\"]'); if (a) a.click();";
    for (const [route, seed, label] of [['/prayer-times-in-riyadh', null, 'sidebar Moon tab from a prayer city page'], ['/en/prayer-times-in-riyadh', null, 'sidebar Moon tab from an en prayer city page'],
        ['/qibla-in-riyadh', null, 'sidebar Moon tab from a qibla city page'], [RIY + '/' + CY + '/' + CM, null, 'sidebar Moon tab from a month page'],
        ['/', RIYADH_CTX, 'sidebar Moon tab from the homepage with a picked city'], ['/en/', RIYADH_CTX, 'sidebar Moon tab from the en homepage with a picked city'],
        ['/today-hijri-date', RIYADH_CTX, 'sidebar Moon tab from /today-hijri-date with a picked city']]) {
        NAV.push({ id: 'N ' + label, label, route, seed, act: navAct(null, moonTab) });
    }
    for (const L of ['ar', 'en']) {
        const P = lp(L);
        NAV.push({ id: 'N hub explore go ' + L, label: 'hub explore picker "go" (' + L + ')', route: P + RIY, act: navAct(PICK({ y: 'mc-exp-y', m: 'mc-exp-m', d: 'mc-exp-d', go: 'mc-exp-go' }), "var g=document.getElementById('mc-exp-go'); if (g) { g.disabled=false; g.click(); }") });
        NAV.push({ id: 'N capital go ' + L, label: 'country capital picker "go" (' + L + ')', route: P + '/moon/saudi-arabia', act: navAct(PICK({ y: 'mc-cap-y', m: 'mc-cap-m', d: 'mc-cap-d', go: 'mc-cap-go' }), "var g=document.getElementById('mc-cap-go'); if (g) { g.disabled=false; g.click(); }") });
        NAV.push({ id: 'N moon search ' + L, label: 'moon search pick on ' + P + '/moon', route: P + '/moon', act: navAct(TYPE('moon-hub-search', 'moon-hub-suggestions', L === 'ar' ? 'الرياض' : 'Riyadh'), CLICK_PICK) });
        // the moon country page's in-country filter re-renders the grid client-side (prayer-times-cities.html renderGrid)
        NAV.push({ id: 'N country filter ' + L, label: 'country city filter → first client-rendered card on ' + P + '/moon/saudi-arabia', route: P + '/moon/saudi-arabia',
            act: navAct(TYPE('country-city-filter', 'cities-container', L === 'ar' ? 'جدة' : 'Jeddah', 'a[href]', L === 'ar' ? 'جدة' : 'Jeddah'), CLICK_PICK) });
    }
    NAV.push({ id: 'N navigateToMoonToday', label: 'navigateToMoonToday(Riyadh) on /moon', route: '/moon',
        act: navAct(null, "if (typeof navigateToMoonToday === 'function') navigateToMoonToday(24.7136, 46.6753, 'الرياض', 'المملكة العربية السعودية', 'Riyadh', 'sa');") });
    for (const n of NAV) tasks.push({ id: n.id, kind: 'N', n, run: () => withPage(A, n.route, { seed: n.seed, act: n.act }) });

    const results = await pool(tasks);

    console.log('\n-- [L] hydrated DOM: 0 links to removed pages --');
    let pagesSeen = 0;
    results.forEach((r, i) => {
        const t = tasks[i]; if (t.kind !== 'L') return;
        if (!r || r.error) { check('L', false, 'page probed  ' + t.id, r && r.error); return; }
        pagesSeen++;
        const doc = r.st.docs[r.st.docs.length - 1];
        const bad = r.hrefs.filter((h) => isRemovedTarget(h.v) || isRemovedTarget(h.abs));
        const badOpt = r.optionUrls.filter(isRemovedTarget);
        const issues = [];
        if (!doc || doc.status !== 200) issues.push('document status ' + (doc && doc.status));
        if (bad.length) issues.push(bad.length + ' removed hrefs: ' + bad.slice(0, 6).map((h) => h.tag + '=' + h.v).join(' | '));
        if (badOpt.length) issues.push(badOpt.length + ' removed <option> URLs');
        if (r.fcDayLinks) issues.push(r.fcDayLinks + ' a.fc-day-link');
        if (r.gridAnchors) issues.push(r.gridAnchors + ' <a> in the month grid');
        if (r.dateNav) issues.push('#moon-date-nav present');
        if (r.todayCityEdu) issues.push('#moon-today-city-edu present');
        if (r.adTag) issues.push('ad tag in the DOM');
        check('L', issues.length === 0, '0 removed links after JS (' + r.hrefs.length + ' hrefs, ' + r.svgAnchors + ' svg <a>, forecast rows ' + r.fcRows + ', grid cells ' + r.gridCells + ', Moon tab ' + r.moonTab + ')  ' + t.id, issues.join(' ; '));
    });
    const locales = new Set(tasks.filter((t, i) => t.kind === 'L' && results[i] && !results[i].error).map((t) => (t.pg.route.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/) || [, 'ar'])[1]));
    check('L', locales.size === 10, 'all 10 locales probed (' + [...locales].join(',') + ')');

    console.log('\n-- [N] click tests: each lands on a 200 page that is not a removed URL --');
    results.forEach((r, i) => {
        const t = tasks[i]; if (t.kind !== 'N') return;
        if (!r || r.error) { check('N', false, t.n.label, r && r.error); return; }
        const chain = r.chain || [];
        const last = chain[chain.length - 1];
        const issues = [];
        if (r.prep && r.prep.error) issues.push('prep: ' + r.prep.error);
        if (r.navTo === r.navFrom) issues.push('no navigation happened');
        if (!last || last.status !== 200) issues.push('landing document status ' + (last && last.status));
        if (chain.some((d) => d.status === 404 || d.status === 410 || d.status >= 500)) issues.push('chain has ' + chain.map((d) => d.status).join('→'));
        if (isRemovedPagePath(r.navTo || '')) issues.push('landed on a removed URL ' + r.navTo);
        if (chain.some((d) => { try { return isRemovedPagePath(new URL(d.url).pathname); } catch (_) { return false; } })) issues.push('the chain passed through a removed URL');
        const bad = (r.hrefs || []).filter((h) => isRemovedTarget(h.v) || isRemovedTarget(h.abs));
        if (bad.length) issues.push('landing page has ' + bad.length + ' removed hrefs');
        check('N', issues.length === 0, t.n.label + ': ' + r.navFrom + ' → ' + r.navTo + ' [' + chain.map((d) => d.status).join('→') + ']' + (r.prep ? ' prep=' + JSON.stringify(r.prep).slice(0, 160) : ''), issues.join(' ; '));
    });

    console.log('\n-- [X] isolation --');
    info('non-loopback request attempts by host: ' + JSON.stringify(Object.fromEntries([...NET.attempts.entries()].sort((a, b) => b[1] - a[1]))));
    info('non-loopback failures by host/reason: ' + JSON.stringify(Object.fromEntries([...NET.failed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20))));
    check('X', NET.okResponses.length === 0, '0 successful responses from a non-loopback host (' + [...NET.attempts.values()].reduce((s, n) => s + n, 0) + ' attempts, all refused)', NET.okResponses.slice(0, 5).join(' | '));
    check('X', ![...NET.attempts.keys()].some((h) => /googlesyndication|doubleclick|adtrafficquality/.test(h)), 'no ad-network request was even attempted');
    info('pages probed ' + pagesSeen + ', click tests ' + NAV.length);
} catch (e) {
    check('run', false, 'unexpected error', String(e && e.stack || e));
} finally {
    try { if (br) br.ws.close(); } catch (_) {}
    cleanup();
}
// the guard refuses every non-loopback connect/DNS/fetch at once, so nothing can succeed; report what the server TRIED
const guardLog = fs.existsSync(GUARD_OUT) ? fs.readFileSync(GUARD_OUT, 'utf8').trim() : '';
const guardHosts = {};
for (const l of guardLog.split('\n').filter(Boolean)) { try { const j = JSON.parse(l); const k = j.what + ' ' + j.host; guardHosts[k] = (guardHosts[k] || 0) + 1; } catch (_) {} }
info('server outbound attempts refused by the guard: ' + (guardLog ? JSON.stringify(guardHosts) : 'none'));
check('X', fs.existsSync(GUARD_OUT) && !Object.keys(guardHosts).some((k) => /googlesyndication|doubleclick|adtrafficquality|google-analytics|googletagmanager|supabase/.test(k)),
    'server: the outbound guard was active and no ad / analytics / Supabase attempt was made', JSON.stringify(guardHosts));
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
console.log('\n== per section ==');
for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
let code;
if (BASE_ONLY) {
    const s = (k) => SEC[k] || { pass: 0, fail: 0 };
    const valid = s('L').fail > 0 && s('N').fail > 0 && s('X').fail === 0 && !SEC.run;
    console.log('\nBASE-ONLY VALIDATION: ' + (valid ? 'OK' : 'NOT OK') + ' — on BASE the probe must FIND removed links ([L] ' + s('L').fail + ' pages flagged) and removed landings ([N] ' + s('N').fail + ' flagged), with [X] isolation clean (' + s('X').fail + ' fail).');
    code = valid ? 0 : 1;
} else {
    console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
    if (failures.length) { console.log('\nFailures:'); for (const f of failures.slice(0, 200)) console.log('  - ' + f); }
    code = fail === 0 ? 0 : 1;
}
process.exit(code);
