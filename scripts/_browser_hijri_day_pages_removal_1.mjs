// HIJRI-DAY-PAGES-REMOVAL-1 — DOM-after-JavaScript probe (headless Chrome over raw CDP, Node 24 global WebSocket).
//
// Two local servers: the candidate (this worktree) and BASE (production tree). What it proves:
//   [L]  hydrated DOM (load + 3 s), all 10 locales, desktop: 0 hrefs / xlink:hrefs / <option> URLs / JSON-LD strings
//        pointing at a /hijri-date/Y-M-D day page; the kept content is still there after JS: the month table rebuilt
//        by app.js (one row per day, day data, no <a>), the year table (12 rows), the today banners (text, no link),
//        the city prayer schedule (.sched-day-cell rows with the Hijri date, no a.sched-day-link), the countdown year
//        tables (no day link), the homepage SiteNavigationElement (→ /today-hijri-date), no prev/next day card.
//        BASE runs the same ar + en pages: it must FIND day links (the probe can see them) and its uncaught page
//        exceptions are the reference — the candidate may not add any.
//   [J]  JavaScript disabled (Emulation.setScriptExecutionDisabled): 0 day links, month / year tables present.
//   [M]  mobile 375×812 (touch, mobile UA), candidate vs BASE on the kept page types: CLS (layout-shift, no input)
//        within +0.005 of BASE, FCP / LCP reported; 0 day links.
//   [X]  isolation: 0 successful responses from a non-loopback host; no ad / analytics attempt.
//
// Isolation (three layers, NO Fetch interception): --proxy-server to a dead port + bypass 127.0.0.1;
//   --host-resolver-rules MAP * ~NOTFOUND EXCLUDE 127.0.0.1; Network.setBlockedURLs (ad / analytics / timesprayers.com /
//   onrender.com). Servers: ADSENSE_CLIENT=off + the outbound guard. Fresh browser context per page. CDP port < 49152.
//
// Usage
//   node scripts/_browser_hijri_day_pages_removal_1.mjs
//   env TP_BASE_ROOT (default C:/Users/Tarek/Downloads/timesprayers-gptbot), TP_GUARD (default …/timesprayers-shed-qa/guard.cjs),
//       TP_HREMOVE_CDP_PORT (default 41414), TP_HREMOVE_CONC (default 2)
// Never run against production. Local servers only.
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-gptbot';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CAND_PORT = 8454, BASE_PORT = 8455;
const CDP_PORT = Number(process.env.TP_HREMOVE_CDP_PORT || 41414);
const CONC = Math.max(1, Number(process.env.TP_HREMOVE_CONC || 2));
const SITE = 'https://timesprayers.com';
const SCRATCH_DEFAULT = 'C:/Users/Tarek/AppData/Local/Temp/claude/C--Users-Tarek-Downloads-TIME-PRAYER/4a4bfa89-f0ce-4ae8-bf28-1d023d5d9eb3/scratchpad';
const TMP = fs.mkdtempSync(path.join(fs.existsSync(SCRATCH_DEFAULT) ? SCRATCH_DEFAULT : os.tmpdir(), 'hremove-browser-'));
const PROFILE = path.join(TMP, 'chrome-profile');
const BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*',
    '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*google.com/ads*', '*gstatic.com/ads*', '*timesprayers.com*', '*onrender.com*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lp = (L) => (L === 'ar' ? '' : '/' + L);
const P2 = (n) => String(n).padStart(2, '0');
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
setTimeout(() => { console.log('WATCHDOG: exceeded 35 min'); cleanup(); process.exit(3); }, 35 * 60 * 1000).unref();

// the Umm al-Qura table → today's Hijri date (Asia/Riyadh) and month lengths
const TABLE = JSON.parse(fs.readFileSync(path.join(REPO, 'db', 'hijri', 'umm-al-qura.json'), 'utf8'));
const mdays = (y, m) => (TABLE.years[String(y)] && TABLE.years[String(y)].months[m - 1]) || 0;
function g2jd(year, month, day) { if (month <= 2) { year--; month += 12; } const A = Math.floor(year / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524; }
function hijriToday() {
    const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
    const jd = g2jd(y, m, d);
    for (const [k, v] of Object.entries(TABLE.years)) {
        const [sy, sm, sd] = v.yearStart.split('-').map(Number); const s = g2jd(sy, sm, sd);
        if (jd >= s && jd < s + v.months.reduce((a, b) => a + b, 0)) { let c = s; for (let i = 0; i < 12; i++) { if (jd < c + v.months[i]) return [Number(k), i + 1, jd - c + 1]; c += v.months[i]; } }
    }
    return null;
}
const [HY, HM] = hijriToday() || [1448, 5, 4];
const RM_DAY = /\/hijri-date\/\d{4}-\d{2}-\d{2}(?:[?#"'\s/.<]|$)/;
const isRemovedTarget = (s) => RM_DAY.test(String(s));

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
const GUARD_OUT = {};
async function bootServer(root, port, tag) {
    if ((await httpGet(port, '/health')).status !== 0) throw new Error('port ' + port + ' already in use — refusing to test a foreign server');
    GUARD_OUT[tag] = path.join(TMP, 'guard-' + tag + '.log');
    fs.writeFileSync(GUARD_OUT[tag], '');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
                  ADSENSE_CLIENT: 'off', GUARD_OUT: GUARD_OUT[tag], TP_MOON_DAY_SHED: '0' };
    for (const k of ['TP_ENABLE_SEARCH_TEST', 'TP_MOON_RANGE_TEST_NOW', 'NODE_OPTIONS', 'DISCOVERED_SSR_TEST_FIXTURE']) delete env[k];
    const p = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    procs.push(p);
    let up = false; for (let i = 0; i < 300 && !up; i++) { up = (await httpGet(port, '/health')).status === 200; if (!up) await sleep(400); }
    if (!up) throw new Error('server never became healthy on ' + port);
    console.log('  ' + tag + ' server up on ' + port + ' (root ' + root + ')');
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
const isLocal = (u) => /^(data|blob|about|chrome|devtools):/.test(u) || /^https?:\/\/127\.0\.0\.1(?::\d+)?\//.test(u);

const RIYADH_CTX = { lat: 24.7136, lng: 46.6753, name: 'الرياض', country: 'المملكة العربية السعودية', englishName: 'Riyadh', countryCode: 'sa', timezone: 'Asia/Riyadh', slug: 'riyadh' };
// layout-shift / paint observers + an optional picked-city seed (runs before any page script)
const INIT = (seed) => `(function(){ try { if (location.hostname !== '127.0.0.1') return; } catch (_) { return; }
window.__tpCLS = 0; window.__tpShifts = 0;
try { new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if (!e.hadRecentInput) { window.__tpCLS += e.value; window.__tpShifts++; } }); }).observe({ type: 'layout-shift', buffered: true }); } catch (_) {}
try { new PerformanceObserver(function(l){ var es = l.getEntries(); if (es.length) window.__tpLCP = es[es.length - 1].startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (_) {}
try { var S=${JSON.stringify(seed || null)}; if (S) { var c=JSON.stringify(Object.assign({}, S, {ts: Date.now()})); sessionStorage.setItem('selected_city', c); sessionStorage.setItem('last_city_context', c); sessionStorage.setItem('city_' + S.slug, JSON.stringify(Object.assign({}, S, {_v: 2}))); } } catch (_) {}
})();`;

// In-page collector (serialised with toString — no closures).
function COLLECT() {
    const XL = 'http://www.w3.org/1999/xlink';
    const hrefs = [];
    for (const el of document.querySelectorAll('*')) {
        const h = el.getAttribute('href'), x = el.getAttributeNS(XL, 'href');
        const tag = el.localName + (el.id ? '#' + el.id : '') + (el.classList && el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
        for (const v of [h, x]) { if (v != null) hrefs.push({ v, tag }); }
    }
    const opts = [...document.querySelectorAll('option')].map((o) => o.getAttribute('value') || '').filter((v) => v.startsWith('/'));
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent || '');
    const rowsOf = (sel) => { const tb = document.querySelector(sel); if (!tb) return null; const trs = [...tb.querySelectorAll('tr')];
        return { n: trs.length, anchors: tb.querySelectorAll('a').length, dayAnchors: [...tb.querySelectorAll('a')].filter((a) => /\/hijri-date\//.test(a.getAttribute('href') || '')).length,
            emptyCells: trs.filter((tr) => [...tr.children].some((td) => !(td.textContent || '').trim())).length, first: trs[0] ? (trs[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) : '' }; };
    const ban = (id) => { const e = document.getElementById(id); return e ? { hidden: !!e.hidden, text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140), anchors: e.querySelectorAll('a').length } : null; };
    const hs = document.getElementById('homepage-schema');
    let navHijri = null;
    if (hs) { try { const j = JSON.parse(hs.textContent); const g = j['@graph'] || []; const n = g.filter((x) => x['@type'] === 'SiteNavigationElement'); navHijri = n.map((x) => x.url).filter((u) => /hijri/.test(u)); } catch (_) { navHijri = ['unparsed']; } }
    const lcp = window.__tpLCP, fcpE = performance.getEntriesByName('first-contentful-paint')[0];
    return {
        path: location.pathname, hrefs, optionUrls: opts, ld,
        monthRows: rowsOf('#hmonth-table-body'), yearRows: rowsOf('#hyear-table-body'), cdRows: rowsOf('#page-hijri-new-year-countdown tbody, .countdown-years-table tbody'),
        todayInMonth: ban('hmonth-today-in-month'), todayInYear: ban('hyear-today-in-year'),
        schedCells: document.querySelectorAll('.sched-day-cell').length, schedHijri: [...document.querySelectorAll('.sched-day-cell .sched-hijri')].filter((e) => (e.textContent || '').trim()).length,
        schedLinks: document.querySelectorAll('a.sched-day-link').length,
        navCard: !!document.getElementById('hijri-today-nav-card') || !!document.getElementById('hijri-today-nav'),
        navHijri, cdYearLinks: [...document.querySelectorAll('a.cd-years-link')].map((a) => a.getAttribute('href')),
        adTag: !!document.querySelector('script[src*="googlesyndication"], ins.adsbygoogle[data-ad-client^="ca-pub"]'),
        cls: typeof window.__tpCLS === 'number' ? window.__tpCLS : null, shifts: window.__tpShifts || 0,
        fcp: fcpE ? fcpE.startTime : null, lcp: typeof lcp === 'number' ? lcp : null,
        activePage: (document.querySelector('.page.active') || {}).id || null,
    };
}

let br = null;
async function evalIn(S, fnOrExpr, arg, awaitPromise = false) {
    const expression = typeof fnOrExpr === 'function' ? '(' + fnOrExpr.toString() + ')(' + (arg === undefined ? '' : JSON.stringify(arg)) + ')' : fnOrExpr;
    const r = await br.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, S, 45000);
    if (r.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
}
const NET = { attempts: new Map(), okResponses: [], failed: new Map() };
async function withPage(origin, route, { seed = null, mobile = false, noJs = false } = {}) {
    const { browserContextId } = await br.send('Target.createBrowserContext', {});
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const st = { loaded: false, docs: [], exceptions: [], reqs: new Map() };
    const on = (m) => {
        if (m.sessionId !== S) return; const P = m.params || {};
        switch (m.method) {
            case 'Network.requestWillBeSent': { const u = P.request.url; st.reqs.set(P.requestId, u); if (!isLocal(u)) { const h = hostOf(u) || u.slice(0, 40); NET.attempts.set(h, (NET.attempts.get(h) || 0) + 1); } break; }
            case 'Network.responseReceived': { const u = P.response.url; if (!isLocal(u)) NET.okResponses.push(route + ' → ' + u.slice(0, 160) + ' ' + P.response.status); if (P.type === 'Document') st.docs.push({ url: u, status: P.response.status }); break; }
            case 'Network.loadingFailed': { const u = st.reqs.get(P.requestId) || ''; if (!isLocal(u)) { const k = (hostOf(u) || '?') + ' ' + (P.blockedReason || P.errorText); NET.failed.set(k, (NET.failed.get(k) || 0) + 1); } break; }
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
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT(seed) }, S);
        await br.send('Page.navigate', { url: origin + route }, S);
        for (let i = 0; i < 120 && !st.loaded; i++) await sleep(250);
        await sleep(3000);
        const out = await evalIn(S, COLLECT);
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
const dayHits = (r) => {
    const out = [];
    for (const h of r.hrefs || []) if (isRemovedTarget(h.v)) out.push(h.tag + '=' + h.v);
    for (const o of r.optionUrls || []) if (isRemovedTarget(o)) out.push('option=' + o);
    for (const s of r.ld || []) { const m = s.match(/\/hijri-date\/\d{4}-\d{2}-\d{2}/g); if (m) out.push(...m.map((x) => 'jsonld=' + x)); }
    return out;
};

// ════════════════════════════════════════════════════════════════════════════
let chrome = null;
try {
    console.log('=== HIJRI-DAY-PAGES-REMOVAL-1 browser probe — UTC ' + new Date().toISOString() + ' — Hijri today (Riyadh) ' + HY + '-' + P2(HM) + ' ===');
    if (!(CDP_PORT < 49152)) throw new Error('CDP port must stay below 49152');
    if (!fs.existsSync(GUARD) || /\s/.test(GUARD)) throw new Error('outbound guard missing or its path has spaces: ' + GUARD);
    await bootServer(REPO, CAND_PORT, 'candidate');
    await bootServer(BASE_ROOT, BASE_PORT, 'base');
    const C = 'http://127.0.0.1:' + CAND_PORT, B = 'http://127.0.0.1:' + BASE_PORT;
    check('X', !/googlesyndication/.test((await httpGet(CAND_PORT, '/hijri-calendar')).body), 'served HTML carries no googlesyndication tag (ADSENSE_CLIENT=off)');

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

    const MON = '/hijri-calendar/' + HY + '-' + P2(HM), YEAR = '/hijri-calendar/' + HY;
    const pages = [];
    for (const L of LANGS) {
        const P = lp(L);
        for (const r of ['/', '/today-hijri-date', '/hijri-calendar', YEAR, MON, '/date-converter', '/prayer-times-in-riyadh']) pages.push({ route: (P + r).replace(/(.)\/$/, '$1'), L });
    }
    for (const L of ['ar', 'en']) {
        const P = lp(L);
        for (const r of ['/hijri-new-year-countdown', '/eid-al-fitr-countdown', '/eid-al-adha-countdown', '/moon/saudi-arabia/riyadh', '/qibla-in-riyadh', '/hijri-calendar/' + (HY + 1) + '-01'])
            pages.push({ route: P + r, L });
        pages.push({ route: P + '/', L, seed: RIYADH_CTX, tag: 'picked city' }, { route: P + '/today-hijri-date', L, seed: RIYADH_CTX, tag: 'picked city' });
    }
    const tasks = [];
    for (const pg of pages) tasks.push({ id: 'L cand ' + pg.route + (pg.tag ? ' (' + pg.tag + ')' : ''), kind: 'L', side: 'cand', pg, run: () => withPage(C, pg.route, { seed: pg.seed }) });
    for (const pg of pages.filter((p) => p.L === 'ar' || p.L === 'en')) tasks.push({ id: 'L base ' + pg.route + (pg.tag ? ' (' + pg.tag + ')' : ''), kind: 'L', side: 'base', pg, run: () => withPage(B, pg.route, { seed: pg.seed }) });
    const NOJS = ['/today-hijri-date', MON, YEAR, '/hijri-calendar', '/prayer-times-in-riyadh', '/', '/en/today-hijri-date', '/en' + MON, '/en' + YEAR];
    for (const r of NOJS) tasks.push({ id: 'J ' + r, kind: 'J', route: r, run: () => withPage(C, r, { noJs: true }) });
    const MOB = ['/today-hijri-date', MON, YEAR, '/hijri-calendar', '/date-converter', '/prayer-times-in-riyadh', '/en/today-hijri-date', '/en' + MON, '/en' + YEAR, '/ur' + MON];
    for (const r of MOB) for (const side of ['cand', 'base']) tasks.push({ id: 'M ' + side + ' ' + r, kind: 'M', side, route: r, run: () => withPage(side === 'cand' ? C : B, r, { mobile: true }) });

    const results = await pool(tasks);
    const R = (kind, side, route, tag) => results.find((r, i) => tasks[i].kind === kind && tasks[i].side === side && (tasks[i].pg ? tasks[i].pg.route === route && (tasks[i].pg.tag || '') === (tag || '') : tasks[i].route === route));

    console.log('\n-- [L] hydrated DOM (candidate): 0 day links, kept content present --');
    results.forEach((r, i) => {
        const t = tasks[i]; if (t.kind !== 'L' || t.side !== 'cand') return;
        if (!r || r.error) { check('L', false, 'page probed  ' + t.id, r && r.error); return; }
        const doc = r.st.docs[r.st.docs.length - 1];
        const issues = [];
        if (!doc || doc.status !== 200) issues.push('document status ' + (doc && doc.status));
        const hits = dayHits(r);
        if (hits.length) issues.push(hits.length + ' day links: ' + hits.slice(0, 5).join(' | '));
        if (r.adTag) issues.push('ad tag in the DOM');
        if (r.navCard) issues.push('prev/next day card present');
        if (r.schedLinks) issues.push(r.schedLinks + ' a.sched-day-link');
        const route = t.pg.route.replace(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/, '') || '/';
        if (route === MON || route === '/hijri-calendar/' + (HY + 1) + '-01') {
            const [yy, mm] = route.slice('/hijri-calendar/'.length).split('-').map(Number);
            const m = r.monthRows;
            if (!m || m.n !== mdays(yy, mm) || m.anchors !== 0 || m.emptyCells !== 0) issues.push('month table ' + JSON.stringify(m) + ' want ' + mdays(yy, mm) + ' rows, 0 <a>');
            if (route === MON && (!r.todayInMonth || r.todayInMonth.hidden || r.todayInMonth.anchors !== 0 || !/\d/.test(r.todayInMonth.text))) issues.push('today-in-month banner ' + JSON.stringify(r.todayInMonth));
        }
        if (route === YEAR || route === '/hijri-calendar') {
            const y = r.yearRows;
            if (!y || y.n !== 12 || y.dayAnchors !== 0 || y.emptyCells !== 0) issues.push('year table ' + JSON.stringify(y));
            if (!r.todayInYear || r.todayInYear.hidden || r.todayInYear.anchors !== 0 || !/\d/.test(r.todayInYear.text)) issues.push('today-in-year banner ' + JSON.stringify(r.todayInYear));
        }
        if (route === '/prayer-times-in-riyadh' && (r.schedCells < 7 || r.schedHijri < 7)) issues.push('schedule cells ' + r.schedCells + ' with Hijri text ' + r.schedHijri);
        if (/countdown$/.test(route) && route !== '/ramadan-countdown' && (!r.cdYearLinks.length || r.cdYearLinks.some((h) => !/\/hijri-calendar\/\d{4}$/.test(h)))) issues.push('countdown year links ' + JSON.stringify(r.cdYearLinks));
        if (route === '/' && r.navHijri && !r.navHijri.every((u) => /\/today-hijri-date$|\/hijri-calendar(?:\/\d{4})?$/.test(u))) issues.push('homepage SiteNavigationElement hijri urls ' + JSON.stringify(r.navHijri));
        check('L', issues.length === 0, '0 day links + content (' + r.hrefs.length + ' hrefs, page ' + r.activePage + ')  ' + t.id, issues.join(' ; '));
    });
    console.log('\n-- [L] candidate vs BASE (ar + en): BASE shows day links; the candidate adds no page exception --');
    let baseWithLinks = 0, baseProbed = 0;
    results.forEach((r, i) => {
        const t = tasks[i]; if (t.kind !== 'L' || t.side !== 'base') return;
        if (!r || r.error) { check('L', false, 'BASE page probed  ' + t.id, r && r.error); return; }
        baseProbed++; if (dayHits(r).length) baseWithLinks++;
        const c = R('L', 'cand', t.pg.route, t.pg.tag);
        if (!c || c.error) return;
        const extra = c.st.exceptions.filter((e) => !r.st.exceptions.includes(e));
        check('L', extra.length === 0, 'no new uncaught exception vs BASE (cand ' + c.st.exceptions.length + ', BASE ' + r.st.exceptions.length + ')  ' + t.pg.route + (t.pg.tag ? ' (' + t.pg.tag + ')' : ''), extra.slice(0, 4).join(' | '));
    });
    check('L', baseWithLinks > 0, 'probe validity: BASE shows day links after JS on ' + baseWithLinks + '/' + baseProbed + ' ar + en pages (the probe can see them)');
    const homeNav = (R('L', 'cand', '/') || {}).navHijri, homeNavB = (R('L', 'base', '/') || {}).navHijri;
    info('homepage SiteNavigationElement hijri urls: candidate ' + JSON.stringify(homeNav) + ' BASE ' + JSON.stringify(homeNavB));

    console.log('\n-- [J] JavaScript disabled (candidate) --');
    results.forEach((r, i) => {
        const t = tasks[i]; if (t.kind !== 'J') return;
        if (!r || r.error) { check('J', false, 'page probed  ' + t.id, r && r.error); return; }
        const issues = [];
        const hits = dayHits(r);
        if (hits.length) issues.push(hits.length + ' day links: ' + hits.slice(0, 5).join(' | '));
        const route = t.route.replace(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/, '') || '/';
        if (route === MON && (!r.monthRows || r.monthRows.n !== mdays(HY, HM) || r.monthRows.anchors !== 0)) issues.push('month table ' + JSON.stringify(r.monthRows));
        if ((route === YEAR || route === '/hijri-calendar') && (!r.yearRows || r.yearRows.n !== 12 || r.yearRows.dayAnchors !== 0)) issues.push('year table ' + JSON.stringify(r.yearRows));
        if (r.navCard) issues.push('prev/next day card present');
        check('J', issues.length === 0, 'no-JS: 0 day links' + (route === MON ? ', month table ' + (r.monthRows && r.monthRows.n) + ' rows' : '') + ((route === YEAR || route === '/hijri-calendar') ? ', year table ' + (r.yearRows && r.yearRows.n) + ' rows' : '') + '  ' + t.route, issues.join(' ; '));
    });

    console.log('\n-- [M] mobile 375×812: CLS candidate vs BASE, FCP / LCP (local, informational) --');
    const fmt = (x, d = 0) => (x == null ? '-' : Number(x).toFixed(d));
    for (const route of MOB) {
        const c = R('M', 'cand', route), b = R('M', 'base', route);
        if (!c || c.error || !b || b.error) { check('M', false, 'mobile probed  ' + route, (c && c.error) || (b && b.error)); continue; }
        const issues = [];
        if (c.cls == null || b.cls == null) issues.push('no CLS value');
        else if (c.cls > b.cls + 0.005) issues.push('CLS ' + c.cls.toFixed(4) + ' > BASE ' + b.cls.toFixed(4) + ' + 0.005');
        if (dayHits(c).length) issues.push(dayHits(c).length + ' day links');
        const extra = c.st.exceptions.filter((e) => !b.st.exceptions.includes(e));
        if (extra.length) issues.push('new exceptions: ' + extra.slice(0, 3).join(' | '));
        check('M', issues.length === 0, 'CLS ' + fmt(c.cls, 4) + ' (BASE ' + fmt(b.cls, 4) + ', shifts ' + c.shifts + '/' + b.shifts + ') FCP ' + fmt(c.fcp) + '/' + fmt(b.fcp) + ' ms LCP ' + fmt(c.lcp) + '/' + fmt(b.lcp) + ' ms  ' + route, issues.join(' ; '));
    }

    console.log('\n-- [X] isolation --');
    info('non-loopback request attempts by host: ' + JSON.stringify(Object.fromEntries([...NET.attempts.entries()].sort((a, b) => b[1] - a[1]))));
    info('non-loopback failures by host/reason: ' + JSON.stringify(Object.fromEntries([...NET.failed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20))));
    check('X', NET.okResponses.length === 0, '0 successful responses from a non-loopback host (' + [...NET.attempts.values()].reduce((s, n) => s + n, 0) + ' attempts, all refused)', NET.okResponses.slice(0, 5).join(' | '));
    check('X', ![...NET.attempts.keys()].some((h) => /googlesyndication|doubleclick|adtrafficquality/.test(h)), 'no ad-network request was even attempted');
} catch (e) {
    check('run', false, 'unexpected error', String(e && e.stack || e));
} finally {
    try { if (br) br.ws.close(); } catch (_) {}
    cleanup();
}
for (const [tag, f] of Object.entries(GUARD_OUT)) {
    const log = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '';
    const hosts = {};
    for (const l of log.split('\n').filter(Boolean)) { try { const j = JSON.parse(l); const k = j.what + ' ' + j.host; hosts[k] = (hosts[k] || 0) + 1; } catch (_) {} }
    info(tag + ' server outbound attempts refused by the guard: ' + (log ? JSON.stringify(hosts) : 'none'));
    check('X', !Object.keys(hosts).some((k) => /googlesyndication|doubleclick|adtrafficquality|google-analytics|googletagmanager|supabase/.test(k)), tag + ' server: no ad / analytics / Supabase attempt', JSON.stringify(hosts));
}
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (_) {}
console.log('\n== per section ==');
for (const [k, v] of Object.entries(SEC)) console.log('  ' + k.padEnd(4) + ' pass ' + String(v.pass).padStart(4) + '  fail ' + String(v.fail).padStart(4));
console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + '  ' + pass + ' passed, ' + fail + ' failed');
if (failures.length) { console.log('\nFailures:'); for (const f of failures.slice(0, 200)) console.log('  - ' + f); }
process.exit(fail === 0 ? 0 : 1);
