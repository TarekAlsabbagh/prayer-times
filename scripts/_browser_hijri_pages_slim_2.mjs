// HIJRI-PAGES-SLIM-1 batch B — browser probe (headless Chrome over raw CDP, Node 24 global WebSocket).
//
// Three local servers: PROD (TP_PROD_ROOT, the production tree), A (TP_A_ROOT, batch A) and B (this worktree).
// Batch B deletes dead code only (the /hijri-date/ day-page markup, client code and CSS) and stops two requests on the
// four Hijri routes (js/qibla.js; the route-key geocoding of 'hijri-today' / 'hijri-year' / 'hijri-month'). So:
//   [F]  JS on, desktop, 10 locales, the four Hijri types: B === A in content (active block text, H1, tables, today
//        footer link), no new exception; qibla.js not requested on B (still requested on a qibla route).
//   [C]  control routes (ar + en): B === A in visible content, H1 and exceptions.
//   [S]  computed style of every element: B === A on Hijri and control routes, desktop light, desktop dark, mobile.
//        This is the CSS proof in a real engine (the source-level proof is the selector diff in the report).
//   [G]  header city + sidebar links, no city context and a sidebar arrival: B === A; B makes no /api/place-by-slug
//        and no /api/geocode request on these routes (A does).
//   [N]  sidebar Prayer times → Back, and a pageshow restore, on the four types (B).
//   [M]  mobile 375x812, empty cache, CPU x4: HTML bytes, total bytes, requests, script / style / layout time, FCP,
//        LCP, CLS — PROD vs A vs B, 3 runs each (medians). Control routes too (app.js and style.css are site-wide).
//   [A]  the adhan still plays on demand (B).
//   [X]  isolation: 0 successful non-loopback responses; ads off + ad domains blocked.
// Usage: node scripts/_browser_hijri_pages_slim_2.mjs   (env TP_PROD_ROOT, TP_A_ROOT, TP_GUARD, TP_SLIM2_CDP_PORT, TP_SLIM2_TABLE_OUT)
// Never run against production. Local servers only.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROD_ROOT = process.env.TP_PROD_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijriremove';
const A_ROOT = process.env.TP_A_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijrislim';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const B_PORT = 8541, A_PORT = 8542, P_PORT = 8543;
const CDP_PORT = Number(process.env.TP_SLIM2_CDP_PORT || 41451);
const SITE = 'https://timesprayers.com';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hslim2-browser-'));
const PROFILE = path.join(TMP, 'chrome-profile');
const BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*',
    '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*google.com/ads*', '*gstatic.com/ads*', '*timesprayers.com*', '*onrender.com*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const TYPES = { today: { path: '/today-hijri-date', id: 'page-hijri-today' }, hub: { path: '/hijri-calendar', id: 'page-hijri-year' },
    year: { path: '/hijri-calendar/1448', id: 'page-hijri-year' }, month: { path: '/hijri-calendar/1448-04', id: 'page-hijri-month' } };
const CONTROLS = [['/', 'page-prayer-times'], ['/prayer-times-in-riyadh', 'page-prayer-times'], ['/qibla', 'page-qibla'], ['/qibla-in-makkah', 'page-qibla'],
    ['/moon', 'page-moon'], ['/date-converter', 'page-date-converter'], ['/azkar', 'page-azkar-hub'], ['/msbaha', 'page-tasbih'], ['/zakat-calculator', 'page-zakat'],
    ['/ramadan-countdown', 'page-ramadan-countdown']];
setTimeout(() => { console.log('WATCHDOG: exceeded 75 min'); cleanup(); process.exit(3); }, 75 * 60 * 1000).unref();

// TP_SLIM2_ONLY=F,C,S,G,N,M,A,X runs only the listed sections (default: all)
const RUN = (tag) => !process.env.TP_SLIM2_ONLY || process.env.TP_SLIM2_ONLY.split(',').includes(tag);
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
async function bootServer(root, port, tag) {
    if ((await httpGet(port, '/health')).status !== 0) throw new Error('port ' + port + ' already in use');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
                  ADSENSE_CLIENT: 'off', GUARD_OUT: path.join(TMP, 'guard-' + tag + '.log'), TP_MOON_DAY_SHED: '0' };
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
const RIYADH = { lat: 24.7136, lng: 46.6753, name: 'الرياض', country: 'المملكة العربية السعودية', englishName: 'Riyadh', countryCode: 'sa', timezone: 3 };
// what the sidebar's _saveCityCtxFor writes before it navigates (no _v), under the route key of the target page
const SIDEBAR_STASH = (key) => `(function(){ try { if (location.hostname !== '127.0.0.1') return; var S=${JSON.stringify(RIYADH)};
  sessionStorage.setItem('city_${key}', JSON.stringify(S)); sessionStorage.setItem('last_city_context', JSON.stringify(Object.assign({}, S, {ts: Date.now()}))); } catch (_) {} })();`;
const DARK = `(function(){ try { if (location.hostname === '127.0.0.1') localStorage.setItem('theme', 'dark'); } catch (_) {} })();`;
function COLLECT(keepId) {
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const vis = (e) => { if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && e.getBoundingClientRect().height > 0; };
    const pages = [...document.querySelectorAll('.page')].map((p) => p.id + (p.classList.contains('active') ? '*' : '') + (vis(p) ? '+' : ''));
    const k = document.getElementById(keepId);
    const shown = [...document.querySelectorAll('.page')].filter(vis);
    const h1s = [...document.querySelectorAll('h1')].filter(vis).map((h) => norm(h.textContent));
    const fcpE = performance.getEntriesByName('first-contentful-paint')[0];
    const foot = document.getElementById('hijri-today-footer-seo'); const footA = foot && foot.querySelector('a');
    const hdr = document.querySelector('.top-header');
    return {
        pages, keepVisible: vis(k), keepText: k ? norm(k.innerText) : null, shownText: shown.map((p) => norm(p.innerText)).join(' | '), h1s,
        header: vis(hdr), headerText: hdr ? norm(hdr.innerText) : null, sidebar: !!document.getElementById('sidebar'), footer: !!document.querySelector('footer, .site-footer'),
        nav: [...document.querySelectorAll('.sidebar-nav a[data-page]')].map((a) => a.getAttribute('data-page') + '=' + a.getAttribute('href')),
        yearRows: document.querySelectorAll('#hyear-table-body tr').length, monthRows: document.querySelectorAll('#hmonth-table-body tr').length,
        todayCards: document.querySelectorAll('#page-hijri-today .info-card').length,
        footLink: footA ? footA.getAttribute('href') + ' ' + norm(footA.textContent) : null,
        scripts: [...document.scripts].map((s) => s.getAttribute('src')).filter(Boolean).map((s) => s.replace(/\?.*$/, '')),
        height: document.documentElement.scrollHeight,
        cls: typeof window.__tpCLS === 'number' ? window.__tpCLS : null, fcp: fcpE ? fcpE.startTime : null, lcp: typeof window.__tpLCP === 'number' ? window.__tpLCP : null,
        dom: document.getElementsByTagName('*').length,
    };
}
// computed style of every element (document order, key = tag#id.classes path + occurrence), elements of the deleted
//   #page-hijri-day block and <script>/<template>/<style>/<link>/<meta> skipped
function STYLES() {
    const P = ['display', 'visibility', 'position', 'float', 'clear', 'box-sizing', 'direction', 'z-index', 'opacity', 'overflow-x', 'overflow-y',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-top-style', 'border-top-color', 'border-bottom-color',
        'border-top-left-radius', 'border-bottom-right-radius', 'color', 'background-color', 'background-image', 'box-shadow', 'outline-style',
        'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-decoration-line', 'white-space',
        'min-height', 'min-width', 'max-width', 'max-height', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'justify-content',
        'align-items', 'align-self', 'row-gap', 'column-gap', 'grid-template-columns', 'order', 'transform', 'cursor', 'list-style-type', 'content-visibility', 'aspect-ratio'];
    // freeze animations and transitions on both versions (e.g. the active prayer card's pulsing box-shadow), so only the cascade is compared
    const _fz = document.createElement('style'); _fz.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; document.head.appendChild(_fz); void document.body.offsetHeight;
    const SKIP = new Set(['SCRIPT', 'TEMPLATE', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TITLE', 'HEAD', 'BASE']);
    const seen = new Map(); const out = {};
    const walk = (el, prefix) => {
        for (const ch of el.children) {
            if (SKIP.has(ch.tagName) || ch.id === 'page-hijri-day') continue;
            const k0 = prefix + '>' + ch.tagName.toLowerCase() + (ch.id ? '#' + ch.id : '') + (ch.classList.length ? '.' + [...ch.classList].sort().join('.') : '');
            const n = (seen.get(k0) || 0) + 1; seen.set(k0, n);
            const cs = getComputedStyle(ch); out[k0 + '~' + n] = P.map((p) => { const v = cs.getPropertyValue(p); return p === 'transform' ? v.replace(/-?\d+\.\d+/g, (x) => (+x).toFixed(2)) : v; }).join('|');   // transform rounded: the live prayer progress bar moves between the two loads
            walk(ch, k0);
        }
    };
    walk(document.documentElement, 'html');
    return { props: P, map: out, height: document.documentElement.scrollHeight };
}
let br = null;
async function evalIn(S, fnOrExpr, arg, awaitPromise = false) {
    const expression = typeof fnOrExpr === 'function' ? '(' + fnOrExpr.toString() + ')(' + (arg === undefined ? '' : JSON.stringify(arg)) + ')' : fnOrExpr;
    const r = await br.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, S, 45000);
    if (r.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
}
const NET = { okResponses: [], attempts: new Map() };
async function withPage(origin, route, keepId, { mobile = false, cpu = 1, scripts = [], act = null, styles = false, perf = false } = {}) {
    const { browserContextId } = await br.send('Target.createBrowserContext', {});
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const st = { loaded: false, exceptions: [], reqs: new Map(), bytes: 0, count: 0, htmlBytes: 0, docReq: null, list: [], docs: [], api: { pbs: 0, geocode: 0 } };
    const on = (m) => {
        if (m.sessionId !== S) return; const P = m.params || {};
        switch (m.method) {
            case 'Network.requestWillBeSent': { const u = P.request.url; st.reqs.set(P.requestId, u);
                if (!isLocal(u)) { const h = hostOf(u); NET.attempts.set(h, (NET.attempts.get(h) || 0) + 1); } else if (!/^data:/.test(u)) st.count++;
                if (/\/api\/place-by-slug\?/.test(u)) st.api.pbs++; if (/\/api\/geocode\?/.test(u)) st.api.geocode++;
                if (P.type === 'Document' && !st.docReq) st.docReq = P.requestId; break; }
            case 'Network.responseReceived': { if (!isLocal(P.response.url)) NET.okResponses.push(route + ' → ' + P.response.url.slice(0, 120)); if (P.type === 'Document') st.docs.push({ url: P.response.url, status: P.response.status, t: Date.now() }); break; }
            case 'Network.loadingFinished': { const u = st.reqs.get(P.requestId) || ''; if (isLocal(u) && !/^data:/.test(u)) { st.bytes += P.encodedDataLength || 0; st.list.push(u.replace(/^https?:\/\/[^/]+/, '') + ' ' + (P.encodedDataLength || 0)); if (P.requestId === st.docReq) st.htmlBytes = P.encodedDataLength || 0; } break; }
            case 'Runtime.exceptionThrown': st.exceptions.push(String((P.exceptionDetails && ((P.exceptionDetails.exception && P.exceptionDetails.exception.description) || P.exceptionDetails.text)) || '').split('\n')[0].slice(0, 200)); break;
            case 'Page.loadEventFired': st.loaded = true; break;
            case 'Page.javascriptDialogOpening': br.send('Page.handleJavaScriptDialog', { accept: false }, S).catch(() => {}); break;
        }
    };
    br.subs.add(on);
    try {
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S);
        if (perf) await br.send('Performance.enable', { timeDomain: 'threadTicks' }, S).catch(() => br.send('Performance.enable', {}, S));
        await br.send('Network.setBlockedURLs', { urls: BLOCK }, S);
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S);
        await br.send('Network.setCacheDisabled', { cacheDisabled: true }, S);
        if (mobile) {
            await br.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }, S);
            await br.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, S);
            await br.send('Network.setUserAgentOverride', { userAgent: MOBILE_UA }, S);
        }
        if (cpu > 1) await br.send('Emulation.setCPUThrottlingRate', { rate: cpu }, S);
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
        for (const s of scripts) await br.send('Page.addScriptToEvaluateOnNewDocument', { source: s }, S);
        await br.send('Page.navigate', { url: origin + route }, S);
        for (let i = 0; i < 160 && !st.loaded; i++) await sleep(250);
        await sleep(3000);
        if (act) return { route, ...(await act(S, st)) };
        const out = await evalIn(S, COLLECT, keepId);
        if (styles) out.styles = await evalIn(S, STYLES);
        if (perf) { const r = await br.send('Performance.getMetrics', {}, S); out.metrics = Object.fromEntries(r.metrics.map((x) => [x.name, x.value])); }
        return { route, st: { exceptions: st.exceptions, bytes: st.bytes, count: st.count, htmlBytes: st.htmlBytes, list: st.list, api: st.api }, ...out };
    } finally {
        br.subs.delete(on);
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
        await br.send('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
    }
}
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
// visible text minus clock-like values (live clocks / countdowns on both versions)
const stable = (s) => norm(s).replace(/\d{1,2}:\d{2}(?::\d{2})?/g, 'T').replace(/[0-9٠-٩۰-۹০-৯]+/g, 'N');
const med = (a) => { const s = [...a].filter((x) => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const styleDiff = (a, b) => { const d = []; for (const k of new Set([...Object.keys(a.map), ...Object.keys(b.map)])) { if (a.map[k] !== b.map[k]) {
    if (!(k in a.map) || !(k in b.map)) { d.push(k + ' ' + (k in a.map ? 'only in B' : 'only in A')); continue; }
    const va = a.map[k].split('|'), vb = b.map[k].split('|'); const props = a.props.filter((_, i) => va[i] !== vb[i]).map((p) => p + ' ' + vb[a.props.indexOf(p)] + '→' + va[a.props.indexOf(p)]);
    d.push(k.slice(-90) + ': ' + props.join(', ')); } } return d; };

let chrome = null;
try {
    console.log('=== HIJRI-PAGES-SLIM-1 batch B browser probe — PROD ' + PROD_ROOT + ', A ' + A_ROOT + ', B ' + REPO + ' — UTC ' + new Date().toISOString() + ' ===');
    if (!(CDP_PORT < 49152)) throw new Error('CDP port must stay below 49152');
    await bootServer(REPO, B_PORT, 'B');
    await bootServer(A_ROOT, A_PORT, 'A');
    await bootServer(PROD_ROOT, P_PORT, 'PROD');
    const OB = 'http://127.0.0.1:' + B_PORT, OA = 'http://127.0.0.1:' + A_PORT, OP = 'http://127.0.0.1:' + P_PORT;
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
    console.log('\n-- [F] JS on, desktop, 10 locales, the four Hijri types: B === A --');
    for (const [k, t] of Object.entries(TYPES)) {
        for (const L of LANGS) {
            const route = lp(L) + t.path;
            const b = await withPage(OB, route, t.id), a = await withPage(OA, route, t.id);
            const issues = [];
            if (!(b.pages.length === 1 && b.pages[0].startsWith(t.id + '*'))) issues.push('B pages ' + b.pages.join(','));
            if (!b.keepVisible) issues.push('B block not visible');
            if (stable(b.keepText) !== stable(a.keepText)) issues.push('block text differs (' + norm(b.keepText).length + ' vs ' + norm(a.keepText).length + ')');
            if (JSON.stringify(b.h1s.map(stable)) !== JSON.stringify(a.h1s.map(stable))) issues.push('H1 ' + JSON.stringify(b.h1s) + ' vs ' + JSON.stringify(a.h1s));
            if (stable(b.headerText) !== stable(a.headerText)) issues.push('header ' + b.headerText + ' vs ' + a.headerText);
            if (JSON.stringify(b.nav) !== JSON.stringify(a.nav)) issues.push('sidebar links differ');
            if (b.yearRows !== a.yearRows || b.monthRows !== a.monthRows || b.todayCards !== a.todayCards) issues.push('rows/cards ' + [b.yearRows, a.yearRows, b.monthRows, a.monthRows, b.todayCards, a.todayCards]);
            if (k === 'today' && (!b.footLink || b.footLink !== a.footLink)) issues.push('today footer link ' + b.footLink + ' vs ' + a.footLink);
            if (b.scripts.includes('js/qibla.js') || !a.scripts.includes('js/qibla.js')) issues.push('qibla.js B ' + b.scripts.includes('js/qibla.js') + ' A ' + a.scripts.includes('js/qibla.js'));
            const extra = b.st.exceptions.filter((e) => !a.st.exceptions.includes(e));
            if (extra.length) issues.push('new exceptions: ' + extra.join(' | '));
            check('F', issues.length === 0, k + ' ' + route + '  (exceptions A ' + a.st.exceptions.length + ' B ' + b.st.exceptions.length + (k === 'today' ? ', footer link "' + (b.footLink || '').slice(0, 60) + '"' : '') + ')', issues.join(' ; '));
        }
    }
    const qr = await withPage(OB, '/qibla-in-makkah', 'page-qibla');
    check('F', qr.scripts.includes('js/qibla.js') && /\d/.test(qr.keepText || ''), 'control /qibla-in-makkah on B still loads js/qibla.js and shows the bearing', qr.scripts);

    }
    if (RUN('C')) {
    console.log('\n-- [C] control routes (ar + en): B === A --');
    for (const [p, id] of CONTROLS) {
        for (const L of ['ar', 'en']) {
            const route = p === '/' ? (L === 'ar' ? '/' : '/en') : lp(L) + p;
            const b = await withPage(OB, route, id), a = await withPage(OA, route, id);
            const issues = [];
            if (stable(b.shownText) !== stable(a.shownText)) issues.push('visible text differs (' + norm(b.shownText).length + ' vs ' + norm(a.shownText).length + ')');
            if (JSON.stringify(b.h1s.map(stable)) !== JSON.stringify(a.h1s.map(stable))) issues.push('H1 ' + JSON.stringify(b.h1s) + ' vs ' + JSON.stringify(a.h1s));
            if (JSON.stringify(b.pages.filter((x) => x.endsWith('+'))) !== JSON.stringify(a.pages.filter((x) => x.endsWith('+')))) issues.push('shown blocks ' + b.pages + ' vs ' + a.pages);
            if (JSON.stringify(b.scripts) !== JSON.stringify(a.scripts)) issues.push('scripts differ ' + JSON.stringify(b.scripts) + ' vs ' + JSON.stringify(a.scripts));
            const extra = b.st.exceptions.filter((e) => !a.st.exceptions.includes(e));
            if (extra.length) issues.push('new exceptions: ' + extra.join(' | '));
            check('C', issues.length === 0, route + '  (exceptions A ' + a.st.exceptions.length + ' B ' + b.st.exceptions.length + ', DOM ' + a.dom + '→' + b.dom + ')', issues.join(' ; '));
        }
    }

    }
    if (RUN('S')) {
    console.log('\n-- [S] computed style of every element: B === A (desktop light, desktop dark, mobile) --');
    const SROUTES = [...Object.values(TYPES).map((t) => [t.path, t.id]), ['/en/today-hijri-date', 'page-hijri-today'], ['/ur/hijri-calendar/1448-04', 'page-hijri-month'],
        ['/', 'page-prayer-times'], ['/prayer-times-in-riyadh', 'page-prayer-times'], ['/qibla-in-makkah', 'page-qibla'], ['/moon', 'page-moon'], ['/date-converter', 'page-date-converter'],
        ['/azkar', 'page-azkar-hub'], ['/ramadan-countdown', 'page-ramadan-countdown'], ['/en/prayer-times-in-riyadh', 'page-prayer-times']];
    for (const [route, id] of SROUTES) {
        for (const mode of ['light', 'dark', 'mobile']) {
            const opt = { styles: true, mobile: mode === 'mobile', scripts: mode === 'dark' ? [DARK] : [] };
            const b = await withPage(OB, route, id, opt), a = await withPage(OA, route, id, opt);
            const d = styleDiff(b.styles, a.styles);
            const dh = Math.abs(b.styles.height - a.styles.height);
            check('S', d.length === 0 && dh <= 4, route + ' ' + mode + ': ' + Object.keys(b.styles.map).length + ' elements × ' + b.styles.props.length + ' properties identical (page height ' + a.styles.height + ' → ' + b.styles.height + ')', d.slice(0, 8).join(' ; ') + (d.length > 8 ? ' … +' + (d.length - 8) : '') + (dh > 4 ? ' height ' + a.styles.height + '→' + b.styles.height : ''));
        }
    }

    }
    if (RUN('G')) {
    console.log('\n-- [G] header city + sidebar links, no context and a sidebar arrival: B === A, no route-key geocoding on B --');
    for (const [route, id, key] of [['/today-hijri-date', 'page-hijri-today', 'hijri-today'], ['/fr/today-hijri-date', 'page-hijri-today', 'hijri-today'],
        ['/hijri-calendar/1448', 'page-hijri-year', 'hijri-calendar'], ['/hijri-calendar/1448-04', 'page-hijri-month', 'hijri-calendar'], ['/en/hijri-calendar/1448-04', 'page-hijri-month', 'hijri-calendar']]) {
        // legacy-query (review B-requests-1): an old bookmark carrying ?lat=&lng=&name= keeps setting the page city, as on A
        for (const ctx of ['none', 'sidebar', 'legacy-query']) {
            const opt = { scripts: ctx === 'sidebar' ? [SIDEBAR_STASH(key)] : [] };
            const r0 = ctx === 'legacy-query' ? route + '?lat=30.0444&lng=31.2357&name=' + encodeURIComponent(/^\/[a-z]{2}\//.test(route) ? 'Cairo' : 'القاهرة') + '&country=' + encodeURIComponent('Egypt') : route;
            const b = await withPage(OB, r0, id, opt), a = await withPage(OA, r0, id, opt);
            const issues = [];
            if (stable(b.headerText) !== stable(a.headerText)) issues.push('header ' + b.headerText + ' | A ' + a.headerText);
            if (JSON.stringify(b.nav) !== JSON.stringify(a.nav)) issues.push('nav ' + JSON.stringify(b.nav) + ' | A ' + JSON.stringify(a.nav));
            if (stable(b.keepText) !== stable(a.keepText)) issues.push('block text differs');
            if (b.st.api.pbs !== 0) issues.push('B made ' + b.st.api.pbs + ' /api/place-by-slug request(s)');
            if (b.st.api.geocode > a.st.api.geocode) issues.push('B geocode ' + b.st.api.geocode + ' > A ' + a.st.api.geocode);
            if (ctx === 'sidebar' && !/riyadh|riyad|الرياض|ریاض|রিয়াদ/i.test(JSON.stringify(b.nav) + b.headerText)) issues.push('the stashed city is not used by B');
            if (ctx === 'legacy-query' && !/cairo|القاهرة/i.test(JSON.stringify(b.nav) + b.headerText)) issues.push('the ?lat=&lng=&name= city is not used by B');
            check('G', issues.length === 0, route + ' (' + ctx + '): header + ' + b.nav.length + ' sidebar links equal; /api/place-by-slug A ' + a.st.api.pbs + ' → B ' + b.st.api.pbs + ', /api/geocode A ' + a.st.api.geocode + ' → B ' + b.st.api.geocode, issues.join(' ; '));
        }
    }

    }
    if (RUN('N')) {
    console.log('\n-- [N] B: sidebar Prayer times → landing → Back restores the page (city Riyadh stashed) --');
    const navAct = (pageId) => async (S, st) => {
        const startPath = await evalIn(S, 'location.pathname');
        st.loaded = false;
        await evalIn(S, `setTimeout(function(){ var a = document.querySelector('.sidebar-nav a[data-page="${pageId}"]'); if (a) a.click(); }, 0); true`);
        let p = startPath; for (let i = 0; i < 60 && p === startPath; i++) { await sleep(250); try { p = await evalIn(S, 'location.pathname'); } catch (_) {} }
        for (let i = 0; i < 120 && !st.loaded; i++) await sleep(250); await sleep(2000);
        const landing = await evalIn(S, COLLECT, 'page-prayer-times');
        st.loaded = false;
        await evalIn(S, 'setTimeout(function(){ history.back(); }, 0); true');
        let q = p; for (let i = 0; i < 60 && q === p; i++) { await sleep(250); try { q = await evalIn(S, 'location.pathname'); } catch (_) {} }
        await sleep(2500);
        return { startPath, landingPath: p, landing, back: { path: q, ...(await evalIn(S, COLLECT, 'x')) }, exceptions: st.exceptions };
    };
    for (const [k, t] of Object.entries(TYPES)) {
        const r = await withPage(OB, t.path, t.id, { act: navAct('prayer-times'), scripts: [SIDEBAR_STASH('x')] });
        const backBlock = (r.back.pages || []).filter((x) => x.endsWith('+'));
        const ok = r.landingPath !== r.startPath && r.landing.shownText.length > 200 && r.back.path === t.path && backBlock.length === 1 && backBlock[0].startsWith(t.id) && r.exceptions.length === 0;
        check('N', ok, k + ' ' + t.path + ' → ' + r.landingPath + ' → back ' + r.back.path + ' shows ' + backBlock.join(','), JSON.stringify({ l: r.landing.pages, b: r.back.pages, e: r.exceptions }));
    }

    }
    if (RUN('M')) {
    console.log('\n-- [M] mobile 375x812, empty cache, CPU x4: PROD → A → B (3 runs each, medians) --');
    const MROUTES = [...Object.entries(TYPES).flatMap(([k, t]) => [[k, t.path, t.id], [k, '/en' + t.path, t.id]]),
        ['home', '/', 'page-prayer-times'], ['city', '/prayer-times-in-riyadh', 'page-prayer-times'], ['moon', '/moon', 'page-moon'], ['qibla', '/qibla-in-makkah', 'page-qibla']];
    const table = [];
    for (const [k, route, id] of MROUTES) {
        const runs = { p: [], a: [], b: [] };
        for (let i = 0; i < 3; i++) for (const [s, o] of [['p', OP], ['a', OA], ['b', OB]]) runs[s].push(await withPage(o, route, id, { mobile: true, cpu: 4, perf: true }));
        const m = (s, f) => med(runs[s].map(f));
        const row = { type: k, route };
        for (const s of ['p', 'a', 'b']) {
            row[s] = { req: m(s, (r) => r.st.count), htmlKB: +(m(s, (r) => r.st.htmlBytes) / 1024).toFixed(1), totalKB: +(m(s, (r) => r.st.bytes) / 1024).toFixed(1),
                scriptMs: Math.round(m(s, (r) => r.metrics.ScriptDuration * 1000)), styleMs: Math.round(m(s, (r) => r.metrics.RecalcStyleDuration * 1000)),
                layoutMs: Math.round(m(s, (r) => r.metrics.LayoutDuration * 1000)), taskMs: Math.round(m(s, (r) => r.metrics.TaskDuration * 1000)),
                fcp: Math.round(m(s, (r) => r.fcp)), lcp: Math.round(m(s, (r) => r.lcp)), cls: +(m(s, (r) => r.cls) || 0).toFixed(4), dom: m(s, (r) => r.dom) };
        }
        table.push(row);
        const issues = [];
        if (row.b.cls > row.a.cls + 0.005) issues.push('CLS ' + row.b.cls + ' > A ' + row.a.cls + ' + 0.005');
        const extra = runs.b.flatMap((r) => r.st.exceptions).filter((e) => !runs.a.flatMap((r) => r.st.exceptions).includes(e));
        if (extra.length) issues.push('new exceptions ' + [...new Set(extra)].join(' | '));
        const f = (x) => 'req ' + x.req + ', html ' + x.htmlKB + ' KB, total ' + x.totalKB + ' KB, script ' + x.scriptMs + ' ms, task ' + x.taskMs + ' ms, FCP ' + x.fcp + ', LCP ' + x.lcp + ', CLS ' + x.cls;
        check('M', issues.length === 0, k + ' ' + route + '\n        PROD ' + f(row.p) + '\n        A    ' + f(row.a) + '\n        B    ' + f(row.b), issues.join(' ; '));
    }
    if (process.env.TP_SLIM2_TABLE_OUT) fs.writeFileSync(process.env.TP_SLIM2_TABLE_OUT, JSON.stringify(table, null, 1));
    for (const [route, id] of [['/today-hijri-date', 'page-hijri-today'], ['/hijri-calendar/1448-04', 'page-hijri-month']]) {
        for (const [tag, o] of [['A', OA], ['B', OB]]) {
            const r = await withPage(o, route, id, { mobile: true });
            info(tag + ' ' + route + ' — ' + r.st.list.length + ' requests, ' + (r.st.bytes / 1024).toFixed(1) + ' KB (empty cache, mobile): ' + r.st.list.map((x) => x.replace(/\?v=\d+/, '')).sort().join(' · '));
        }
    }

    }
    if (RUN('A')) {
    console.log('\n-- [A] B: the adhan still plays on demand --');
    {
        const act = async (S, st) => {
            const before = [...st.reqs.values()].filter((u) => /adhan\.mp3/.test(u)).length;
            const played = await evalIn(S, `(async () => { const a = document.getElementById('adhan-audio'); if (!a) return 'no-audio'; a.muted = true;
                try { await a.play(); await new Promise((r) => setTimeout(r, 1500)); const ok = !a.paused || a.currentTime > 0; a.pause(); return ok ? 'played' : 'paused'; } catch (e) { return 'error:' + e.name; } })()`, undefined, true);
            return { before, after: [...st.reqs.values()].filter((u) => /adhan\.mp3/.test(u)).length, played, exceptions: st.exceptions };
        };
        const r = await withPage(OB, '/hijri-calendar/1448-04', 'page-hijri-month', { act });
        check('A', r.before === 0 && r.after >= 1 && r.played === 'played' && r.exceptions.length === 0, '/hijri-calendar/1448-04: adhan.mp3 requests before play ' + r.before + ', after ' + r.after + ', play() ' + r.played, r);
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
for (const [k, v] of Object.entries(SEC)) console.log('  [' + k + '] ' + v.pass + ' pass / ' + v.fail + ' fail');
console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + ' ' + pass + '/' + (pass + fail));
if (failures.length) { console.log('\nFailures:'); for (const f of failures) console.log('  ' + f); }
process.exit(fail === 0 ? 0 : 1);
