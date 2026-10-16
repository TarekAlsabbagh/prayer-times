// HIJRI-PAGES-SLIM-1 — browser before/after probe (headless Chrome over raw CDP, Node 24 global WebSocket).
//
// Two local servers: BEFORE (TP_BASE_ROOT, the production tree) and AFTER (this worktree). For the four slimmed page
// types — /today-hijri-date, the calendar hub /hijri-calendar, a year /hijri-calendar/YYYY, a month /hijri-calendar/YYYY-MM:
//   [F]  JS on, desktop, all 10 locales: same visible text of the active block and of the H1 as BEFORE, exactly one
//        .page in the DOM (AFTER) and it is the route's block, no uncaught exception that BEFORE does not have, header /
//        sidebar / footer present, the year / month tables filled, the today info cards and FAQ present.
//   [J]  JS off: the route's block is the visible one and carries the same text as BEFORE with JS on (first paint is right
//        in every locale — on BEFORE the today page painted #page-prayer-times without JS in 8 locales).
//   [M]  mobile 375x812, EMPTY cache (fresh context, cache disabled, SW bypassed): request count, transferred bytes,
//        FCP / LCP / CLS — BEFORE vs AFTER, the owner's before/after table. CLS must not exceed BEFORE + 0.005.
//   [A]  the adhan still works: on AFTER the <audio> does not preload, and play() loads /audio/adhan.mp3 on demand.
//   [X]  isolation: 0 successful non-loopback responses; ads off + ad domains blocked.
// Usage: node scripts/_browser_hijri_pages_slim_1.mjs
//   env TP_BASE_ROOT (default C:/Users/Tarek/Downloads/timesprayers-hijriremove), TP_GUARD, TP_SLIM_CDP_PORT (default 41441)
// Never run against production. Local servers only.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijriremove';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const AFTER_PORT = 8521, BEFORE_PORT = 8522;
const CDP_PORT = Number(process.env.TP_SLIM_CDP_PORT || 41441);
const SITE = 'https://timesprayers.com';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hslim-browser-'));
const PROFILE = path.join(TMP, 'chrome-profile');
const BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*',
    '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*google.com/ads*', '*gstatic.com/ads*', '*timesprayers.com*', '*onrender.com*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const TYPES = { today: { path: '/today-hijri-date', id: 'page-hijri-today' }, hub: { path: '/hijri-calendar', id: 'page-hijri-year' },
    year: { path: '/hijri-calendar/1448', id: 'page-hijri-year' }, month: { path: '/hijri-calendar/1448-04', id: 'page-hijri-month' } };
setTimeout(() => { console.log('WATCHDOG: exceeded 40 min'); cleanup(); process.exit(3); }, 40 * 60 * 1000).unref();

// TP_SLIM_ONLY=F,J,M,A,N,N2,X runs only the listed sections (default: all)
const RUN = (tag) => !process.env.TP_SLIM_ONLY || process.env.TP_SLIM_ONLY.split(',').includes(tag);
let pass = 0, fail = 0; const failures = []; const SEC = {};
function check(tag, ok, label, detail) {
    const s = SEC[tag] || (SEC[tag] = { pass: 0, fail: 0 });
    if (ok) { pass++; s.pass++; console.log('  ✓ [' + tag + '] ' + label); }
    else { fail++; s.fail++; const line = '[' + tag + '] ' + label + (detail !== undefined ? ' :: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 900) : ''); failures.push(line); console.log('  ✗ ' + line); }
}
const info = (m) => console.log('  · INFO ' + m);
const kill = (pid) => { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const procs = [];
function cleanup() { for (const p of procs.splice(0)) kill(p.pid); }
function httpGet(port, p) {
    return new Promise((resolve) => {
        const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => {
            const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => resolve({ status: x.statusCode, body: Buffer.concat(c).toString('utf8') }));
        });
        r.setTimeout(60000, () => { r.destroy(); resolve({ status: 0, body: '' }); });
        r.on('error', () => resolve({ status: 0, body: '' })); r.end();
    });
}
const GUARD_OUT = {};
async function bootServer(root, port, tag) {
    if ((await httpGet(port, '/health')).status !== 0) throw new Error('port ' + port + ' already in use');
    GUARD_OUT[tag] = path.join(TMP, 'guard-' + tag + '.log'); fs.writeFileSync(GUARD_OUT[tag], '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
                  ADSENSE_CLIENT: 'off', GUARD_OUT: GUARD_OUT[tag], TP_MOON_DAY_SHED: '0' };
    for (const k of ['TP_ENABLE_SEARCH_TEST', 'TP_MOON_RANGE_TEST_NOW', 'NODE_OPTIONS', 'DISCOVERED_SSR_TEST_FIXTURE', 'TP_HIJRI_SLIM']) delete env[k];
    const p = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    procs.push(p);
    let up = false; for (let i = 0; i < 300 && !up; i++) { up = (await httpGet(port, '/health')).status === 200; if (!up) await sleep(400); }
    if (!up) throw new Error('server never became healthy on ' + port);
    console.log('  ' + tag + ' server up on ' + port + ' (root ' + root + ')');
}
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
const isLocal = (u) => /^(data|blob|about|chrome|devtools):/.test(u) || /^https?:\/\/127\.0\.0\.1(?::\d+)?\//.test(u);
const INIT = `(function(){ try { if (location.hostname !== '127.0.0.1') return; } catch (_) { return; }
window.__tpCLS = 0; window.__tpShifts = 0;
try { new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if (!e.hadRecentInput) { window.__tpCLS += e.value; window.__tpShifts++; } }); }).observe({ type: 'layout-shift', buffered: true }); } catch (_) {}
try { new PerformanceObserver(function(l){ var es = l.getEntries(); if (es.length) window.__tpLCP = es[es.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (_) {}
})();`;
// a picked city (the shape site-search.js / the nav stash writes), so [N] can also test the "known city" path
const RIYADH_CTX = { lat: 24.7136, lng: 46.6753, name: 'الرياض', country: 'المملكة العربية السعودية', englishName: 'Riyadh', countryCode: 'sa', timezone: 'Asia/Riyadh', slug: 'riyadh' };
const SEED = (S) => `(function(){ try { if (location.hostname !== '127.0.0.1') return; var S=${JSON.stringify(S)}; var c=JSON.stringify(Object.assign({}, S, {ts: Date.now()}));
  sessionStorage.setItem('selected_city', c); sessionStorage.setItem('last_city_context', c); sessionStorage.setItem('city_' + S.slug, JSON.stringify(Object.assign({}, S, {_v: 2}))); } catch (_) {} })();`;
// sidebar navigation: click data-page=<page>, wait for the landing, then history.back() — each step must show content
function LANDING() {
    const vis = (e) => { if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getBoundingClientRect().height > 0; };
    const act = [...document.querySelectorAll('.page')].filter(vis);
    const main = act.map((p) => (p.innerText || '').replace(/\s+/g, ' ').trim().length).reduce((s, n) => s + n, 0);
    return { path: location.pathname, visibleBlocks: act.map((p) => p.id), visibleText: main };
}
const navAct = (pageId, forceNoCity = false) => async (S, st) => {
    // forceNoCity: the reviewer's failure path — location detection failed, so the app has no city at all
    //   (currentEnglishName empty, no coordinates). These are script-level bindings of app.js, reachable from evaluate.
    if (forceNoCity) await evalIn(S, "try { currentEnglishName = ''; currentLat = null; currentLng = null; currentCity = ''; } catch (_) {} true");
    const startPath = await evalIn(S, 'location.pathname');
    const href = await evalIn(S, `(document.querySelector('.sidebar-nav a[data-page="${pageId}"]') || {}).getAttribute ? document.querySelector('.sidebar-nav a[data-page="${pageId}"]').getAttribute('href') : null`);
    const t0 = Date.now(); st.loaded = false;
    await evalIn(S, `setTimeout(function(){ var a = document.querySelector('.sidebar-nav a[data-page="${pageId}"]'); if (a) a.click(); }, 0); true`);
    let p = startPath; for (let i = 0; i < 60 && p === startPath; i++) { await sleep(250); try { p = await evalIn(S, 'location.pathname'); } catch (_) {} }
    const navigated = p !== startPath;
    let afterClick = null;
    if (navigated) { for (let i = 0; i < 120 && !st.loaded; i++) await sleep(250); await sleep(2500); afterClick = await evalIn(S, LANDING); }
    else { await sleep(1500); afterClick = await evalIn(S, LANDING); }
    const docAfter = st.docs.filter((d) => d.t >= t0).pop();
    let back = null;
    if (navigated) {
        st.loaded = false;
        await evalIn(S, 'setTimeout(function(){ history.back(); }, 0); true');
        let q = p; for (let i = 0; i < 60 && q === p; i++) { await sleep(250); try { q = await evalIn(S, 'location.pathname'); } catch (_) {} }
        await sleep(2500);
        back = await evalIn(S, LANDING);
    }
    return { pageId, startPath, href, navigated, landingStatus: docAfter ? docAfter.status : null, afterClick, back, exceptions: st.exceptions };
};
function COLLECT(keepId) {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const vis = (e) => { if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getBoundingClientRect().height > 0; };
    const pages = [...document.querySelectorAll('.page')].map((p) => p.id + (p.classList.contains('active') ? '*' : '') + (vis(p) ? '+' : ''));
    const k = document.getElementById(keepId);
    const h1s = [...document.querySelectorAll('h1')].filter(vis).map((h) => norm(h.textContent));
    const fcpE = performance.getEntriesByName('first-contentful-paint')[0];
    const audio = document.getElementById('adhan-audio');
    return {
        pages, keepVisible: vis(k), keepText: k ? norm(k.innerText) : null, h1s,
        header: vis(document.querySelector('.top-header')), sidebar: !!document.getElementById('sidebar'), footer: !!document.querySelector('footer, .site-footer'),
        yearRows: document.querySelectorAll('#hyear-table-body tr').length, monthRows: document.querySelectorAll('#hmonth-table-body tr').length,
        todayCards: document.querySelectorAll('#page-hijri-today .info-card').length, faq: document.querySelectorAll('#page-hijri-today details, #page-hijri-today .faq-item').length,
        height: document.documentElement.scrollHeight, audioPreload: audio ? audio.getAttribute('preload') : null,
        cls: typeof window.__tpCLS === 'number' ? window.__tpCLS : null, shifts: window.__tpShifts || 0, fcp: fcpE ? fcpE.startTime : null, lcp: typeof window.__tpLCP === 'number' ? window.__tpLCP : null,
        dom: document.getElementsByTagName('*').length,
    };
}
let br = null;
async function evalIn(S, fnOrExpr, arg, awaitPromise = false) {
    const expression = typeof fnOrExpr === 'function' ? '(' + fnOrExpr.toString() + ')(' + (arg === undefined ? '' : JSON.stringify(arg)) + ')' : fnOrExpr;
    const r = await br.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, S, 45000);
    if (r.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
}
const NET = { okResponses: [], attempts: new Map() };
async function withPage(origin, route, keepId, { mobile = false, noJs = false, adhan = false, act = null, seed = null } = {}) {
    const { browserContextId } = await br.send('Target.createBrowserContext', {});
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const st = { loaded: false, exceptions: [], reqs: new Map(), bytes: 0, count: 0, list: [], docs: [] };
    const on = (m) => {
        if (m.sessionId !== S) return; const P = m.params || {};
        switch (m.method) {
            case 'Network.requestWillBeSent': { const u = P.request.url; st.reqs.set(P.requestId, u); if (!isLocal(u)) { const h = hostOf(u); NET.attempts.set(h, (NET.attempts.get(h) || 0) + 1); } else if (!/^data:/.test(u)) st.count++; break; }
            case 'Network.responseReceived': { if (!isLocal(P.response.url)) NET.okResponses.push(route + ' → ' + P.response.url.slice(0, 120)); if (P.type === 'Document') st.docs.push({ url: P.response.url, status: P.response.status, t: Date.now() }); break; }
            case 'Network.loadingFinished': { const u = st.reqs.get(P.requestId) || ''; if (isLocal(u) && !/^data:/.test(u)) { st.bytes += P.encodedDataLength || 0; st.list.push(u.replace(/^https?:\/\/[^/]+/, '') + ' ' + (P.encodedDataLength || 0)); } break; }
            case 'Runtime.exceptionThrown': st.exceptions.push(String((P.exceptionDetails && ((P.exceptionDetails.exception && P.exceptionDetails.exception.description) || P.exceptionDetails.text)) || '').split('\n')[0].slice(0, 200)); break;
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
        if (mobile) {
            await br.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }, S);
            await br.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, S);
            await br.send('Network.setUserAgentOverride', { userAgent: MOBILE_UA }, S);
        }
        if (noJs) await br.send('Emulation.setScriptExecutionDisabled', { value: true }, S);
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
        if (seed) await br.send('Page.addScriptToEvaluateOnNewDocument', { source: SEED(seed) }, S);
        await br.send('Page.navigate', { url: origin + route }, S);
        for (let i = 0; i < 120 && !st.loaded; i++) await sleep(250);
        await sleep(3000);
        if (act) return { route, ...(await act(S, st)) };
        const out = await evalIn(S, COLLECT, keepId);
        if (adhan) {
            const before = st.list.filter((x) => /adhan\.mp3/.test(x)).length + [...st.reqs.values()].filter((u) => /adhan\.mp3/.test(u)).length;
            const played = await evalIn(S, `(async () => { const a = document.getElementById('adhan-audio'); if (!a) return 'no-audio'; a.muted = true;
                try { await a.play(); await new Promise((r) => setTimeout(r, 1500)); const ok = !a.paused || a.currentTime > 0; a.pause(); return ok ? 'played' : 'paused'; } catch (e) { return 'error:' + e.name; } })()`, undefined, true);
            const after = [...st.reqs.values()].filter((u) => /adhan\.mp3/.test(u)).length;
            out.adhan = { requestsBeforePlay: before, requestsAfterPlay: after, played };
        }
        return { route, st: { exceptions: st.exceptions, bytes: st.bytes, count: st.count, list: st.list }, ...out };
    } finally {
        br.subs.delete(on);
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
        await br.send('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
    }
}
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
// visible text minus clock-like values (the today hero shows a live clock / countdown on both versions)
const stable = (s) => norm(s).replace(/\d{1,2}:\d{2}(?::\d{2})?/g, 'T').replace(/[0-9٠-٩۰-۹০-৯]+/g, 'N');
const med = (a) => { const s = [...a].filter((x) => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

let chrome = null;
try {
    console.log('=== HIJRI-PAGES-SLIM-1 browser probe — BEFORE ' + BASE_ROOT + ' vs AFTER ' + REPO + ' — UTC ' + new Date().toISOString() + ' ===');
    if (!(CDP_PORT < 49152)) throw new Error('CDP port must stay below 49152');
    await bootServer(REPO, AFTER_PORT, 'after');
    await bootServer(BASE_ROOT, BEFORE_PORT, 'before');
    const A = 'http://127.0.0.1:' + AFTER_PORT, B = 'http://127.0.0.1:' + BEFORE_PORT;
    fs.mkdirSync(PROFILE, { recursive: true });
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + PROFILE, '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-default-apps', '--no-pings',
        '--disable-gpu', '--disable-domain-reliability', '--window-size=1280,900', '--autoplay-policy=no-user-gesture-required',
        '--proxy-server=http=127.0.0.1:9;https=127.0.0.1:9', '--proxy-bypass-list=127.0.0.1',
        '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    procs.push(chrome);
    let wsu; for (let i = 0; i < 150 && !wsu; i++) { try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version'); if (r.ok) wsu = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!wsu) await sleep(300); }
    if (!wsu) throw new Error('chrome never came up');
    br = await CDP.open(wsu);

    if (RUN('F')) {
    console.log('\n-- [F] JS on, desktop, 10 locales: AFTER === BEFORE in content --');
    for (const [k, t] of Object.entries(TYPES)) {
        for (const L of LANGS) {
            const route = lp(L) + t.path;
            const a = await withPage(A, route, t.id), b = await withPage(B, route, t.id);
            const issues = [];
            if (!(a.pages.length === 1 && a.pages[0].startsWith(t.id + '*'))) issues.push('AFTER pages ' + a.pages.join(','));
            if (!a.keepVisible) issues.push('AFTER block not visible');
            if (stable(a.keepText) !== stable(b.keepText)) issues.push('block text differs (' + norm(a.keepText).length + ' vs ' + norm(b.keepText).length + ')');
            if (JSON.stringify(a.h1s.map(stable)) !== JSON.stringify(b.h1s.map(stable))) issues.push('H1 ' + JSON.stringify(a.h1s) + ' vs ' + JSON.stringify(b.h1s));
            if (!a.header || !a.sidebar || !a.footer) issues.push('chrome header/sidebar/footer ' + [a.header, a.sidebar, a.footer]);
            if (k === 'year' || k === 'hub') { if (a.yearRows !== 12 || b.yearRows !== 12) issues.push('year rows ' + a.yearRows + '/' + b.yearRows); }
            if (k === 'month') { if (a.monthRows < 29 || a.monthRows !== b.monthRows) issues.push('month rows ' + a.monthRows + '/' + b.monthRows); }
            if (k === 'today') { if (a.todayCards !== b.todayCards || a.faq !== b.faq || a.todayCards < 4) issues.push('today cards/faq ' + a.todayCards + '/' + b.todayCards + ' ' + a.faq + '/' + b.faq); }
            const extra = a.st.exceptions.filter((e) => !b.st.exceptions.includes(e));
            if (extra.length) issues.push('new exceptions: ' + extra.join(' | '));
            check('F', issues.length === 0, k + ' ' + route + '  (DOM ' + b.dom + '→' + a.dom + ', blocks ' + b.pages.length + '→' + a.pages.length + ', exceptions ' + b.st.exceptions.length + '→' + a.st.exceptions.length + ')', issues.join(' ; '));
        }
    }
    }
    if (RUN('J')) {
    console.log('\n-- [J] JS off: the route block paints, with the same text as BEFORE (JS on) --');
    for (const [k, t] of Object.entries(TYPES)) {
        for (const L of ['ar', 'en', 'fr', 'ur', 'bn']) {
            const route = lp(L) + t.path;
            const a = await withPage(A, route, t.id, { noJs: true }), bOn = await withPage(B, route, t.id), bOff = await withPage(B, route, t.id, { noJs: true });
            const issues = [];
            if (!a.keepVisible) issues.push('AFTER block not visible without JS');
            const visOther = a.pages.filter((p) => p.endsWith('+') && !p.startsWith(t.id));
            if (visOther.length) issues.push('other visible blocks ' + visOther.join(','));
            // calendar types: BEFORE already painted its block without JS → the no-JS text must be identical. Today: BEFORE
            //   painted #page-prayer-times without JS in most locales, so the reference is the BEFORE block as seen WITH JS.
            if (k === 'today') { if (stable(a.keepText).slice(0, 200) !== stable(bOn.keepText).slice(0, 200)) issues.push('first 200 chars differ from BEFORE (JS on)'); }
            else if (stable(a.keepText) !== stable(bOff.keepText)) issues.push('no-JS block text differs from BEFORE (no JS)');
            check('J', issues.length === 0, k + ' ' + route + '  BEFORE without JS: block visible=' + bOff.keepVisible + ', visible blocks ' + bOff.pages.filter((p) => p.endsWith('+')).join(','), issues.join(' ; '));
        }
    }
    }
    if (RUN('M')) {
    console.log('\n-- [M] mobile 375x812, empty cache: requests, bytes, FCP / LCP / CLS (3 runs each, medians) --');
    const table = [];
    for (const [k, t] of Object.entries(TYPES)) {
        for (const L of ['ar', 'en', 'ur']) {
            const route = lp(L) + t.path;
            const runs = { a: [], b: [] };
            for (let i = 0; i < 3; i++) { runs.b.push(await withPage(B, route, t.id, { mobile: true })); runs.a.push(await withPage(A, route, t.id, { mobile: true })); }
            const m = (side, f) => med(runs[side].map(f));
            const row = { type: k, route, reqB: m('b', (r) => r.st.count), reqA: m('a', (r) => r.st.count), kbB: +(m('b', (r) => r.st.bytes) / 1024).toFixed(1), kbA: +(m('a', (r) => r.st.bytes) / 1024).toFixed(1),
                fcpB: m('b', (r) => r.fcp), fcpA: m('a', (r) => r.fcp), lcpB: m('b', (r) => r.lcp), lcpA: m('a', (r) => r.lcp), clsB: m('b', (r) => r.cls), clsA: m('a', (r) => r.cls), domB: m('b', (r) => r.dom), domA: m('a', (r) => r.dom) };
            table.push(row);
            const issues = [];
            if (row.clsA == null || row.clsA > (row.clsB || 0) + 0.005) issues.push('CLS ' + row.clsA + ' > BEFORE ' + row.clsB + ' + 0.005');
            const extra = runs.a.flatMap((r) => r.st.exceptions).filter((e) => !runs.b.flatMap((r) => r.st.exceptions).includes(e));
            if (extra.length) issues.push('new exceptions ' + [...new Set(extra)].join(' | '));
            check('M', issues.length === 0, k + ' ' + route + '  req ' + row.reqB + '→' + row.reqA + ', KB ' + row.kbB + '→' + row.kbA + ', FCP ' + Math.round(row.fcpB) + '→' + Math.round(row.fcpA) + ' ms, LCP ' + Math.round(row.lcpB) + '→' + Math.round(row.lcpA) + ' ms, CLS ' + (row.clsB || 0).toFixed(4) + '→' + (row.clsA || 0).toFixed(4), issues.join(' ; '));
        }
    }
    if (process.env.TP_SLIM_TABLE_OUT) fs.writeFileSync(process.env.TP_SLIM_TABLE_OUT, JSON.stringify(table, null, 1));
    for (const [route, id] of [['/today-hijri-date', 'page-hijri-today'], ['/hijri-calendar/1448-04', 'page-hijri-month']]) {
        const lb = await withPage(B, route, id, { mobile: true }), la = await withPage(A, route, id, { mobile: true });
        for (const [tag, r] of [['BEFORE', lb], ['AFTER ', la]]) {
            info(tag + ' ' + route + ' — ' + r.st.list.length + ' requests, ' + (r.st.bytes / 1024).toFixed(1) + ' KB transferred (empty cache, mobile):');
            for (const x of r.st.list.sort()) info('      ' + x);
        }
    }

    }
    if (RUN('A')) {
    console.log('\n-- [A] adhan audio on demand --');
    for (const route of ['/today-hijri-date', '/hijri-calendar/1448-04', '/en/hijri-calendar']) {
        const a = await withPage(A, route, route.includes('today') ? 'page-hijri-today' : (route.endsWith('-04') ? 'page-hijri-month' : 'page-hijri-year'), { adhan: true });
        check('A', a.audioPreload === 'none' && a.adhan && a.adhan.requestsBeforePlay === 0 && a.adhan.requestsAfterPlay >= 1 && a.adhan.played === 'played',
            'AFTER ' + route + ': preload=' + a.audioPreload + ', adhan.mp3 requests before play ' + (a.adhan && a.adhan.requestsBeforePlay) + ', after play ' + (a.adhan && a.adhan.requestsAfterPlay) + ', play() ' + (a.adhan && a.adhan.played), JSON.stringify(a.adhan));
    }
    const ctl = await withPage(A, '/prayer-times-in-riyadh', 'page-prayer-times');
    check('A', ctl.audioPreload === 'metadata', 'control /prayer-times-in-riyadh keeps preload=metadata (scope = the four Hijri routes only)', ctl.audioPreload);

    }
    if (RUN('N')) {
    console.log('\n-- [N] sidebar navigation from the slimmed pages: Prayer times / Qibla, then Back (no city, and a known city) --');
    const NAVROUTES = [['/today-hijri-date', 'page-hijri-today'], ['/en/today-hijri-date', 'page-hijri-today'], ['/hijri-calendar', 'page-hijri-year'], ['/ur/hijri-calendar/1448', 'page-hijri-year'], ['/hijri-calendar/1448-04', 'page-hijri-month'], ['/fr/hijri-calendar/1448-04', 'page-hijri-month']];
    for (const [route, id] of NAVROUTES) {
        for (const pageId of ['prayer-times', 'qibla']) {
            for (const seed of [null, RIYADH_CTX, 'FORCE']) {
                const r = await withPage(A, route, id, { act: navAct(pageId, seed === 'FORCE'), seed: seed === 'FORCE' ? null : seed });
                const issues = [];
                if (!r.navigated) issues.push('no navigation (stayed on ' + r.startPath + ', visible blocks ' + JSON.stringify(r.afterClick && r.afterClick.visibleBlocks) + ', text ' + (r.afterClick && r.afterClick.visibleText) + ')');
                if (r.navigated && r.landingStatus !== 200) issues.push('landing status ' + r.landingStatus);
                if (r.navigated && !(r.afterClick && r.afterClick.visibleText > 200)) issues.push('landing shows little/no content ' + JSON.stringify(r.afterClick));
                if (r.navigated && !(r.back && r.back.path === route && r.back.visibleBlocks.includes(id) && r.back.visibleText > 200)) issues.push('Back did not restore ' + route + ': ' + JSON.stringify(r.back));
                if (r.exceptions.length) issues.push('exceptions ' + r.exceptions.slice(0, 3).join(' | '));
                check('N', issues.length === 0, route + ' → ' + pageId + (seed === 'FORCE' ? ' (location failed: no city at all)' : seed ? ' (city Riyadh)' : ' (default city)') + ': ' + r.startPath + ' → ' + (r.afterClick && r.afterClick.path) + ' [' + r.landingStatus + '] → back ' + (r.back && r.back.path) + ' (href ' + r.href + ')', issues.join(' ; '));
            }
        }
    }
    // the same click on BEFORE, to show the defect this fixes (informational)
    for (const [route, id] of [['/hijri-calendar/1448-04', 'page-hijri-month'], ['/today-hijri-date', 'page-hijri-today']]) {
        for (const pageId of ['prayer-times', 'qibla']) {
            const r = await withPage(B, route, id, { act: navAct(pageId, true) });
            info('BEFORE ' + route + ' → ' + pageId + ' (location failed: no city at all): navigated=' + r.navigated + ' visible blocks ' + JSON.stringify(r.afterClick && r.afterClick.visibleBlocks) + ' text ' + (r.afterClick && r.afterClick.visibleText));
        }
    }

    }
    if (RUN('N2')) {
    console.log('\n-- [N] sidebar: a click on the section already shown stays put; other sections still navigate (review follow-up) --');
    // [route, keepId, pageId, expect]: 'stay' = no new document and the same block still shown; otherwise the expected landing path
    const SELF = [['/azkar', 'page-azkar-hub', 'azkar', 'stay'], ['/en/azkar', 'page-azkar-hub', 'azkar', 'stay'], ['/azkar/morning-azkar', 'page-azkar-morning', 'azkar', '/azkar'],
        ['/msbaha', 'page-tasbih', 'tasbih', 'stay'], ['/qibla-in-makkah', 'page-qibla', 'qibla', 'stay'], ['/qibla', 'page-qibla', 'qibla', '/qibla-in-makkah'], ['/today-hijri-date', 'page-hijri-today', 'hijri-today', 'stay'], ['/today-hijri-date', 'page-hijri-today', 'tasbih', '/msbaha']];
    for (const [route, id, pageId, expect] of SELF) {
        const r = await withPage(A, route, id, { act: navAct(pageId) });
        const issues = [];
        if (expect === 'stay') {
            if (r.navigated || r.landingStatus !== null) issues.push('a new document was loaded (status ' + r.landingStatus + ', path ' + (r.afterClick && r.afterClick.path) + ')');
            if (!(r.afterClick && r.afterClick.visibleBlocks.includes(id) && r.afterClick.visibleText > 200)) issues.push('the shown block changed: ' + JSON.stringify(r.afterClick));
        } else {
            if (!(r.navigated && r.afterClick && r.afterClick.path === expect && r.landingStatus === 200 && r.afterClick.visibleText > 200)) issues.push('expected ' + expect + ' with content: ' + JSON.stringify({ nav: r.navigated, st: r.landingStatus, a: r.afterClick }));
            if (!(r.back && r.back.path === route && r.back.visibleBlocks.includes(id) && r.back.visibleText > 200)) issues.push('Back did not restore ' + route + ': ' + JSON.stringify(r.back));
        }
        if (r.exceptions.length) issues.push('exceptions ' + r.exceptions.slice(0, 3).join(' | '));
        check('N', issues.length === 0, route + ' → ' + pageId + ': ' + (expect === 'stay' ? 'stays, no reload, ' + id + ' shown' : r.startPath + ' → ' + (r.afterClick && r.afterClick.path) + ' [' + r.landingStatus + '] → back ' + (r.back && r.back.path)), issues.join(' ; '));
    }
    {   // the same self-click on BEFORE (informational): the old handler hid every block
        const r = await withPage(B, '/azkar', 'page-azkar-hub', { act: navAct('azkar') });
        const q = await withPage(B, '/qibla', 'page-qibla', { act: navAct('qibla') });
        check('N', q.navigated && q.afterClick && q.afterClick.path === '/qibla-in-makkah', 'BEFORE /qibla → qibla also lands on /qibla-in-makkah (pre-existing qibla branch, unchanged)', JSON.stringify({ nav: q.navigated, p: q.afterClick && q.afterClick.path }));
        info('BEFORE /azkar → azkar: new document ' + (r.landingStatus !== null) + ', visible blocks ' + JSON.stringify(r.afterClick && r.afterClick.visibleBlocks) + ' text ' + (r.afterClick && r.afterClick.visibleText));
    }

    }
    if (RUN('X')) {
    console.log('\n-- [X] isolation --');
    info('non-loopback attempts by host: ' + JSON.stringify(Object.fromEntries(NET.attempts)));
    check('X', NET.okResponses.length === 0, '0 successful responses from a non-loopback host', NET.okResponses.slice(0, 5).join(' | '));
    check('X', ![...NET.attempts.keys()].some((h) => /googlesyndication|doubleclick|adtrafficquality/.test(h)), 'no ad-network request attempted');
    }
} catch (e) {
    check('run', false, 'unexpected error', String(e && e.stack || e));
} finally {
    try { if (br) br.ws.close(); } catch (_) {}
    cleanup();
}
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
console.log('\n== per section ==');
for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
if (failures.length) { console.log('\nFailures:'); for (const f of failures.slice(0, 200)) console.log('  - ' + f); }
process.exit(fail === 0 ? 0 : 1);
