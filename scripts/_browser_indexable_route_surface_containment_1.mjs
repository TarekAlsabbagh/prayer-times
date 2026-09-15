// INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 (Phase 1) — headless Chromium HYDRATION probe on LOCAL servers, ZERO external traffic.
//
// Boots TWO local servers — AFTER (this tree) and BASE (TP_BASE_ROOT, the untouched production-identical tree) — and one
// headless Chrome driven over raw CDP. Every page gets a FRESH browser context (isolated sessionStorage/localStorage/SW).
// Network containment, two layers:
//   1. Chrome is launched with --host-resolver-rules "MAP * ~NOTFOUND, EXCLUDE 127.0.0.1" → no hostname resolves (covers
//      service workers / background networking too).
//   2. Every page session runs Fetch interception on ALL URLs: host 127.0.0.1 → continue; anything else → failRequest.
//   A Network.responseReceived for a non-127.0.0.1 URL is counted as a LEAK (must be 0).
//
// Guards (after hydration = load event + 2 s + stable document.title):
//   [D12] SSR noindex survives hydration (kamikawa prayer/qibla, loc-, {slug}-{lat}-{lng}); the client robots writer is
//         proven to RUN (MutationObserver on meta[name=robots]); BASE kamikawa prayer page flips to 'index, follow'.
//         Index controls keep index after hydration, identical to BASE.
//   [D11] window.__MOON_YEAR_RANGE__ === UTC year ±5 (nonce'd island); every year-bearing moon link (HTML + SVG, nested,
//         legacy, ?cal) on MIN/MAX day/month/year + current month/day pages is inside [MIN,MAX]; #moon-date-prev/next lose
//         href + aria-hidden + visibility:hidden at the edges; forecast rows beyond MAX have no link; month grid DOM === SSR grid; year/month
//         nav edges; mid-range day page href list byte-identical to BASE; BASE shows the out-of-range links (proof).
//   [D7]  client slug for the LOCAL_CITIES Singapore entry === 'singapore'; navigateToCity lands on /prayer-times-in-singapore
//         (200); navigateToMoonToday never targets singapore-city; no href containing 'singapore-city' in the hydrated DOM of
//         /, /prayer-times-in-singapore, /moon/singapore, /qibla-in-singapore; Singapore city pages stay index + self-canonical.
//   [E]   AFTER pages: 0 Runtime exceptions, 0 console errors, 0 CSP violations, 0 external responses (all loads); a browser
//         'error' log line on an AFTER page must also occur identically on its BASE twin (pre-existing), and Chrome's
//         Report-Only 'upgrade-insecure-requests' notice must be emitted by every BASE page too.
//   [D6]  Singapore city pages: SSR canonical === https://timesprayers.com/{path}; hydrated canonical === origin + path (the
//         js/app.js _seoGetBilingualUrls rule, proven identical on the curated makkah control on AFTER and BASE).
//
// Env: TP_BASE_ROOT (required for base comparisons) · TP_IRSC_ROOT (default this repo) · TP_IRSC_PORT (8863) ·
//      TP_IRSC_BASE_PORT (8864) · TP_IRSC_CDP_PORT (45863, must stay < 49152) · TP_IRSC_CONCURRENCY (3) ·
//      TP_IRSC_PROFILE_PARENT (parent dir of the throw-away Chrome profile)
// Usage: TP_BASE_ROOT=C:/Users/Tarek/Downloads/timesprayers-gcollect node scripts/_browser_indexable_route_surface_containment_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = process.env.TP_IRSC_ROOT || REPO;
const BASE_ROOT = process.env.TP_BASE_ROOT || '';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = Number(process.env.TP_IRSC_PORT || 8863);
const BASE_PORT = Number(process.env.TP_IRSC_BASE_PORT || 8864);
const CDP_PORT = Number(process.env.TP_IRSC_CDP_PORT || 45863);
const CONC = Math.max(1, Number(process.env.TP_IRSC_CONCURRENCY || 3));
const SCRATCH_DEFAULT = 'C:/Users/Tarek/AppData/Local/Temp/claude/C--Users-Tarek-Downloads-TIME-PRAYER/4a4bfa89-f0ce-4ae8-bf28-1d023d5d9eb3/scratchpad';
const PROFILE_PARENT = process.env.TP_IRSC_PROFILE_PARENT || (fs.existsSync(SCRATCH_DEFAULT) ? SCRATCH_DEFAULT : os.tmpdir());
const PROFILE = path.join(PROFILE_PARENT, 'irsc-chrome-' + process.pid + '-' + Date.now());
const SITE = 'https://timesprayers.com';
setTimeout(() => { console.log('WATCHDOG: exceeded 15 min'); cleanup(); process.exit(3); }, 15 * 60 * 1000).unref();

// ── clock (the server helper uses the UTC year; the test computes the expectation independently) ──
const NOW = new Date();
const CY = NOW.getUTCFullYear();
const MIN = Math.max(1900, CY - 5), MAX = Math.min(2100, CY + 5);
const P2 = (n) => String(n).padStart(2, '0');
const CM = P2(NOW.getUTCMonth() + 1), CD = P2(NOW.getUTCDate());
const RIY = '/moon/saudi-arabia/riyadh';

// ── results ──
let pass = 0, fail = 0; const failures = [];
function check(tag, label, ok, detail) {
    if (ok) { pass++; console.log('  PASS ' + tag + ' ' + label); }
    else { fail++; const line = tag + ' ' + label + (detail !== undefined ? ' :: ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 900) : ''); failures.push(line); console.log('  FAIL ' + line); }
}
const info = (tag, msg) => console.log('  INFO ' + tag + ' ' + msg);

// ── process helpers ──
const kill = (pid) => { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };
const procs = [];
function cleanup() { for (const p of procs.splice(0)) kill(p.pid); }
function httpGet(port, p, headers = {}) {
    return new Promise((resolve) => {
        const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity', ...headers } }, (x) => {
            const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => resolve({ status: x.statusCode, headers: x.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        r.setTimeout(60000, () => { r.destroy(); resolve({ status: 0, headers: {}, body: '' }); });
        r.on('error', () => resolve({ status: 0, headers: {}, body: '' })); r.end();
    });
}
async function bootServer(root, port, label) {
    if ((await httpGet(port, '/health')).status !== 0) throw new Error('port ' + port + ' already in use — refusing to test a foreign server');
    const env = { ...process.env, PORT: String(port), SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', WEB_CONCURRENCY: '1' };
    delete env.TP_ENABLE_SEARCH_TEST;
    delete env.TP_MOON_RANGE_TEST_NOW;   // real clock only
    const p = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    procs.push(p);
    let up = false; for (let i = 0; i < 300 && !up; i++) { up = (await httpGet(port, '/health')).status === 200; if (!up) await sleep(400); }
    if (!up) throw new Error(label + ' server never became healthy on ' + port);
    console.log('  ' + label + ' server up on ' + port + ' (root ' + root + ')');
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
const hostOf = (u) => { try { return new URL(u).hostname; } catch (_) { return ''; } };
const isLocalOrInline = (u) => /^(data|blob|about):/.test(u) || hostOf(u) === '127.0.0.1';

// Runs on every new document BEFORE any page script: CSP listener, robots MutationObserver, optional sessionStorage seed.
const INIT = (seedJson) => `(function(){ try { if (location.hostname !== '127.0.0.1') return; } catch (_) { return; }
window.__V=[]; window.__RW=[];
document.addEventListener('securitypolicyviolation',function(e){ window.__V.push({d:e.effectiveDirective,disp:e.disposition,u:String(e.blockedURI),src:String(e.sourceFile||'')+':'+e.lineNumber}); });
try { var S=${seedJson}; if (S && S[location.pathname]) { var z=S[location.pathname]; sessionStorage.setItem(z.k, z.v); } } catch(_){}
try { new MutationObserver(function(rs){ for (var i=0;i<rs.length;i++){ var r=rs[i]; if (r.type==='attributes' && r.target.localName==='meta' && r.target.getAttribute('name')==='robots') window.__RW.push({from:r.oldValue}); } }).observe(document,{subtree:true,attributes:true,attributeFilter:['content'],attributeOldValue:true}); } catch(_){}
})();`;

// In-page collector (serialised with toString — no closures).
function COLLECT() {
    const XL = 'http://www.w3.org/1999/xlink', SVG = 'http://www.w3.org/2000/svg';
    const anchors = [], allHref = [];
    for (const el of document.querySelectorAll('*')) {
        const h = el.getAttribute('href'), x = el.getAttributeNS(XL, 'href');
        if (h != null) { allHref.push(h); if (el.localName === 'a') anchors.push({ h, svg: el.namespaceURI === SVG }); }
        if (x != null) { allHref.push(x); if (el.localName === 'a') anchors.push({ h: x, svg: true }); }
    }
    // review F3: an out-of-range day control has no href, aria-hidden="true" and visibility:hidden (layout kept).
    const nav = (e) => e ? { has: e.hasAttribute('href'), href: e.getAttribute('href'), aria: e.getAttribute('aria-hidden'), vis: e.style.visibility, oldAria: e.getAttribute('aria-disabled') } : null;
    const grid = {
        titles: [...document.querySelectorAll('.moon-hub-cal-title')].map((t) => t.textContent.trim()),
        cells: [...document.querySelectorAll('li.moon-hub-cal-cell > a')].map((a) => a.getAttribute('href')),
        todayFlags: [...document.querySelectorAll('li.moon-hub-cal-cell > a')].map((a) => a.parentElement.classList.contains('moon-hub-cal-cell--today')),
        prev: document.querySelectorAll('a.moon-hub-cal-prev').length, next: document.querySelectorAll('a.moon-hub-cal-next').length,
        off: document.querySelectorAll('span.moon-hub-cal-nav-off').length,
    };
    return {
        path: location.pathname, title: document.title, anchors, allHref,
        robots: [...document.querySelectorAll('meta[name="robots"]')].map((m) => m.getAttribute('content')),
        canon: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute('href')),
        prev: nav(document.getElementById('moon-date-prev')), next: nav(document.getElementById('moon-date-next')),
        fcRows: [...document.querySelectorAll('#moon-forecast-body tr')].map((tr) => { const td = tr.querySelector('td'); return { text: td ? td.textContent.trim() : '', dayLink: tr.querySelectorAll('a.fc-day-link').length, links: [...tr.querySelectorAll('a')].map((a) => a.getAttribute('href')) }; }),
        options: [...document.querySelectorAll('option')].map((o) => ({ v: o.getAttribute('value'), t: o.textContent.trim(), selName: (o.closest('select') && o.closest('select').getAttribute('name')) || '' })),
        grid,
        yearNav: { ypPrev: document.querySelectorAll('.my-yp-prev').length, ypNext: document.querySelectorAll('.my-yp-next').length, pillPrev: document.querySelectorAll('.my-yearnav-prev').length, pillNext: document.querySelectorAll('.my-yearnav-next').length },
        range: (typeof window.__MOON_YEAR_RANGE__ === 'object' && window.__MOON_YEAR_RANGE__) ? { min: window.__MOON_YEAR_RANGE__.min, max: window.__MOON_YEAR_RANGE__.max } : null,
        islandCount: document.querySelectorAll('script#ssr-moon-year-range').length,
        d4: { faq: [...document.querySelectorAll('#faq-section a')].map((a) => a.getAttribute('href') || '').filter((h) => /(?:time-left-until-next-prayer-in|next-prayer-in)-/.test(h)),
              sticky: (document.getElementById('sticky-next-bar') && document.getElementById('sticky-next-bar').tagName === 'A') ? document.getElementById('sticky-next-bar').getAttribute('href') : null },
        V: window.__V || null, RW: window.__RW || null,
    };
}
// SSR grid of the SAME URL, parsed without executing scripts.
function SSR_GRID() {
    return fetch(location.pathname, { cache: 'no-store', credentials: 'same-origin' }).then((r) => r.text()).then((t) => {
        const d = new DOMParser().parseFromString(t, 'text/html');
        return { titles: [...d.querySelectorAll('.moon-hub-cal-title')].map((x) => x.textContent.trim()), cells: [...d.querySelectorAll('li.moon-hub-cal-cell > a')].map((a) => a.getAttribute('href')) };
    });
}

let br = null;
async function evalIn(S, fnOrExpr, arg, awaitPromise = false) {
    const expression = typeof fnOrExpr === 'function' ? '(' + fnOrExpr.toString() + ')(' + (arg === undefined ? '' : JSON.stringify(arg)) + ')' : fnOrExpr;
    const r = await br.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, S, 45000);
    if (r.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
}
async function waitHydrated(S, st) {
    for (let i = 0; i < 120 && !st.loaded; i++) await sleep(250);
    if (!st.loaded) st.notes.push('load event not fired within 30 s');
    await sleep(2000);
    let last = null, same = 0;
    for (let i = 0; i < 40 && same < 4; i++) { let t = null; try { t = await evalIn(S, 'document.title + "|" + ((window.__RW||[]).length)'); } catch (_) {} if (t !== null && t === last) same++; else { same = 0; last = t; } await sleep(300); }
    if (same < 4) st.notes.push('title/robots did not stabilise');
}

// Opens `route` on `origin` in a fresh browser context, hydrates, runs `act(S, st)` (default: COLLECT) and closes.
async function withPage(origin, route, { seed = null, act } = {}) {
    const { browserContextId } = await br.send('Target.createBrowserContext', {});
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const st = { loaded: false, blocked: [], extResponses: [], exceptions: [], consoleErrors: [], localLogErrors: [], extLogErrors: 0, docs: [], redirects: [], notes: [] };
    const on = (m) => {
        if (m.sessionId !== S) return; const P = m.params || {};
        switch (m.method) {
            case 'Fetch.requestPaused': {
                const u = P.request.url;
                if (isLocalOrInline(u)) br.send('Fetch.continueRequest', { requestId: P.requestId }, S).catch(() => {});
                else { st.blocked.push(u); br.send('Fetch.failRequest', { requestId: P.requestId, errorReason: 'BlockedByClient' }, S).catch(() => {}); }
                break;
            }
            case 'Network.responseReceived': { const u = P.response.url; if (!isLocalOrInline(u)) st.extResponses.push(u); if (P.type === 'Document') st.docs.push({ url: u, status: P.response.status }); break; }
            case 'Network.requestWillBeSent': if (P.redirectResponse && P.type === 'Document') st.redirects.push({ from: P.redirectResponse.url, status: P.redirectResponse.status, to: P.request.url }); break;
            case 'Runtime.exceptionThrown': st.exceptions.push(String((P.exceptionDetails && ((P.exceptionDetails.exception && P.exceptionDetails.exception.description) || P.exceptionDetails.text)) || '').slice(0, 240)); break;
            case 'Runtime.consoleAPICalled': if (P.type === 'error' || P.type === 'assert') st.consoleErrors.push((P.args || []).map((a) => a.value !== undefined ? String(a.value) : (a.description || a.type)).join(' ').slice(0, 240)); break;
            case 'Log.entryAdded': { const e = P.entry || {}; if (e.level === 'error') { if (e.url && !isLocalOrInline(e.url)) st.extLogErrors++; else st.localLogErrors.push((e.source + ': ' + e.text + ' ' + (e.url || '')).slice(0, 240)); } break; }
            case 'Page.loadEventFired': st.loaded = true; break;
        }
    };
    br.subs.add(on);
    try {
        for (const d of ['Page', 'Runtime', 'Network', 'Log']) await br.send(d + '.enable', {}, S);
        await br.send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] }, S);
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S);
        await br.send('Network.setCacheDisabled', { cacheDisabled: true }, S);
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT(JSON.stringify(seed)) }, S);
        await br.send('Page.navigate', { url: origin + route }, S);
        await waitHydrated(S, st);
        const out = act ? await act(S, st) : await evalIn(S, COLLECT);
        if (out && out.V === undefined) out.V = await evalIn(S, 'window.__V || null');
        return { route, origin, st, ...out };
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

// ── link-year helpers ──
const LP = '(?:(?:en|fr|tr|ur|de|id|es|bn|ms)\\/)?';
const RE_NESTED = new RegExp('^(?:https?:\\/\\/[^/]+)?\\/' + LP + 'moon\\/[a-z][a-z0-9-]+\\/[a-z][a-z0-9-]+\\/(\\d{4})(?=[/?#]|$)');
const RE_LEGACY = new RegExp('^(?:https?:\\/\\/[^/]+)?\\/' + LP + 'moon-(?:today-)?in-[^/?#]+\\/(\\d{4})-');
const RE_CAL = /[?&](?:cal=|cal-y=)(\d{4})/;
function yearOf(h) { const s = String(h || ''); let m = s.match(RE_NESTED) || s.match(RE_LEGACY) || s.match(RE_CAL); return m ? parseInt(m[1], 10) : null; }
const hostPaths = (list) => list.map((x) => (typeof x === 'string' ? x : x.h));

// ════════════════════════════════════════════════════════════════════════════
let chrome = null;
try {
    console.log('=== INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 browser probe — UTC ' + NOW.toISOString() + ' — expected moon range ' + MIN + '..' + MAX + ' ===');
    if (!(CDP_PORT < 49152)) throw new Error('CDP port must stay below 49152');
    if (!BASE_ROOT) console.log('  (TP_BASE_ROOT not set — every base comparison will FAIL)');
    if (BASE_ROOT && path.resolve(BASE_ROOT) === path.resolve(ROOT)) throw new Error('TP_BASE_ROOT must differ from the tested root');
    await bootServer(ROOT, PORT, 'AFTER');
    if (BASE_ROOT) await bootServer(BASE_ROOT, BASE_PORT, 'BASE');
    const A = 'http://127.0.0.1:' + PORT, B = 'http://127.0.0.1:' + BASE_PORT;

    fs.mkdirSync(PROFILE, { recursive: true });
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + PROFILE, '--no-first-run', '--no-default-browser-check',
        '--disable-gpu', '--disable-extensions', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-domain-reliability',
        '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    procs.push(chrome);
    let wsu; for (let i = 0; i < 150 && !wsu; i++) { try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version'); if (r.ok) wsu = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!wsu) await sleep(300); }
    if (!wsu) throw new Error('chrome never came up');
    br = await CDP.open(wsu);

    // ── sessionStorage seeds (same shape navigateToCity writes) so the client resolves the city WITHOUT network ──
    const seed = (k, o) => ({ k, v: JSON.stringify({ ...o, _v: 2 }) });
    const KAMI = { lat: 43.8363, lng: 142.7700, name: 'Kamikawa', country: 'Japan', englishName: 'Kamikawa', countryCode: 'jp', timezone: 'Asia/Tokyo' };
    const RIYC = { lat: 24.71, lng: 46.67, name: 'Riyadh', country: 'Saudi Arabia', englishName: 'Riyadh', countryCode: 'sa', timezone: 'Asia/Riyadh' };
    const SEEDS = {
        '/en/prayer-times-in-kamikawa': seed('city_kamikawa', KAMI),
        '/qibla-in-kamikawa': seed('city_kamikawa', KAMI),
        '/prayer-times-in-loc-24.7n-46.7e': seed('city_loc-24.7n-46.7e', { ...RIYC, lat: 24.7, lng: 46.7 }),
        '/prayer-times-in-riyadh-24.71-46.67': seed('city_riyadh-24.71-46.67', RIYC),
    };
    const D12_NOINDEX = Object.keys(SEEDS);
    const D12_CONTROLS = ['/prayer-times-in-makkah', '/en/qibla-in-riyadh', '/qibla', '/moon', '/today-hijri-date', '/prayer-times-in-saudi-arabia'];
    const D11_PAGES = {
        dayMin: `${RIY}/${MIN}/01/01`, dayMax: `${RIY}/${MAX}/12/31`, monthMin: `${RIY}/${MIN}/01`, monthMax: `${RIY}/${MAX}/12`,
        yearMin: `${RIY}/${MIN}`, yearMax: `${RIY}/${MAX}`, monthCur: `${RIY}/${CY}/${CM}`, dayCur: `${RIY}/${CY}/${CM}/${CD}`,
    };
    const MID_DAY = `${RIY}/2026/09/15`;
    const SG_PAGES = ['/', '/prayer-times-in-singapore', '/moon/singapore', '/qibla-in-singapore'];
    // routes review (D4 client): FAQ a8/a9 + sticky bar on coordinate prayer pages follow _d4TlNptSlug.
    const D4_SEEDS = { '/prayer-times-in-riyadh-24-46': seed('city_riyadh-24-46', RIYC), '/prayer-times-in-kamikawa-43-142': seed('city_kamikawa-43-142', KAMI) };
    const D4_PAGES = { '/prayer-times-in-riyadh-24-46': 'riyadh', '/prayer-times-in-kamikawa-43-142': 'kamikawa-43-142' };

    const sgSlugAct = async (S) => evalIn(S, function () {
        const e = (typeof LOCAL_CITIES !== 'undefined') ? LOCAL_CITIES.filter((c) => c.cc === 'sg' && c.en === 'Singapore') : [];
        return { n: e.length, slugField: e[0] ? (e[0].slug === undefined ? null : e[0].slug) : 'MISSING', built: (e[0] && typeof buildPrayerTimesSlug === 'function') ? buildPrayerTimesSlug(e[0]) : 'MISSING', url: (e[0] && typeof buildPrayerTimesUrl === 'function') ? buildPrayerTimesUrl(e[0]) : 'MISSING' };
    });
    const navAct = (call) => async (S, st) => {
        const before = await evalIn(S, 'location.pathname');
        const v0 = await evalIn(S, 'window.__V || null');
        st.loaded = false;
        await evalIn(S, 'setTimeout(function(){ ' + call + ' }, 0); true');
        let p = before; for (let i = 0; i < 60 && p === before; i++) { await sleep(250); try { p = await evalIn(S, 'location.pathname'); } catch (_) {} }
        await waitHydrated(S, st);
        const c = await evalIn(S, COLLECT);
        let ssKeys = []; try { ssKeys = await evalIn(S, 'Object.keys(sessionStorage)'); } catch (_) {}
        return { ...c, V: (Array.isArray(v0) && Array.isArray(c.V)) ? v0.concat(c.V) : null, navFrom: before, ssKeys };
    };

    const tasks = [];
    const T = (id, origin, route, opts) => tasks.push({ id, run: () => withPage(origin, route, opts).then((r) => ({ ...r, id })) });
    for (const r of D12_NOINDEX) T('A' + r, A, r, { seed: SEEDS });
    for (const r of D12_CONTROLS) T('A' + r, A, r);
    for (const [k, r] of Object.entries(D11_PAGES)) T('A:' + k, A, r, { act: async (S) => ({ ...(await evalIn(S, COLLECT)), ssrGrid: /\/\d{4}\/\d{2}$/.test(r) ? await evalIn(S, SSR_GRID, undefined, true) : null }) });
    T('A:mid', A, MID_DAY);
    for (const r of SG_PAGES) T('A:sg' + r, A, r);
    T('A:sgSlug', A, '/', { act: sgSlugAct });
    T('A:sgNavCity', A, '/', { act: navAct("navigateToCity(1.3521, 103.8198, 'سنغافورة', 'سنغافورة', 'Singapore', 'sg');") });
    T('A:sgNavMoon', A, '/', { act: navAct("navigateToMoonToday(1.3521, 103.8198, 'سنغافورة', 'سنغافورة', 'Singapore', 'sg');") });
    for (const r of Object.keys(D4_PAGES)) T('A:d4' + r, A, r, { seed: D4_SEEDS });
    if (BASE_ROOT) {
        T('B/en/prayer-times-in-kamikawa', B, '/en/prayer-times-in-kamikawa', { seed: SEEDS });
        T('B/qibla-in-kamikawa', B, '/qibla-in-kamikawa', { seed: SEEDS });
        T('B/prayer-times-in-loc-24.7n-46.7e', B, '/prayer-times-in-loc-24.7n-46.7e', { seed: SEEDS });
        T('B/prayer-times-in-riyadh-24.71-46.67', B, '/prayer-times-in-riyadh-24.71-46.67', { seed: SEEDS });
        for (const r of D12_CONTROLS) T('B' + r, B, r);
        T('B:dayMin', B, D11_PAGES.dayMin); T('B:dayMax', B, D11_PAGES.dayMax); T('B:mid', B, MID_DAY);
        T('B:sgSlug', B, '/', { act: sgSlugAct });
        for (const r of Object.keys(D4_PAGES)) T('B:d4' + r, B, r, { seed: D4_SEEDS });
        T('B:sgNavCity', B, '/', { act: navAct("navigateToCity(1.3521, 103.8198, 'سنغافورة', 'سنغافورة', 'Singapore', 'sg');") });
    }
    console.log('\n  running ' + tasks.length + ' page loads (concurrency ' + CONC + ')');
    const res = await pool(tasks);
    const R = Object.fromEntries(res.map((r, i) => [tasks[i].id, r]));
    const ok = (id) => R[id] && !R[id].error;
    const need = (tag, id) => { if (!ok(id)) { check(tag, 'page task ' + id + ' completed', false, R[id] ? R[id].error : 'missing'); return false; } return true; };
    const needBase = (tag, id) => { if (!BASE_ROOT) { check(tag, id + ' (base comparison)', false, 'no TP_BASE_ROOT'); return false; } return need(tag, id); };
    const ssr = async (port, p) => httpGet(port, p);

    // ════ [D4] ════
    console.log('\n[D4] client time-left / next-prayer links on coordinate prayer pages');
    for (const [r, want] of Object.entries(D4_PAGES)) {
        const id = 'A:d4' + r; if (!need('[D4]', id)) continue; const d = R[id];
        const hrefs = (d.d4.faq || []).concat(d.d4.sticky ? [d.d4.sticky] : []);
        const re = new RegExp('/(?:time-left-until-next-prayer-in|next-prayer-in)-' + want + '$');
        check('[D4]', r + ' hydrated FAQ a8/a9 + sticky bar link …-in-' + want + ' (' + (d.d4.faq || []).length + ' FAQ + ' + (d.d4.sticky ? 1 : 0) + ' sticky)', hrefs.length >= 2 && hrefs.every((h) => re.test(h)), d.d4);
        if (BASE_ROOT && ok('B:d4' + r)) info('[D4]', 'BASE ' + r + ' FAQ/sticky = ' + JSON.stringify(R['B:d4' + r].d4));
    }

    // ════ [D12] ════
    console.log('\n[D12] robots persistence after hydration');
    for (const r of D12_NOINDEX) {
        const s = await ssr(PORT, r);
        const tags = s.body.match(/<meta name="robots"[^>]*>/g) || [];
        const ssrContent = tags.length === 1 ? (tags[0].match(/content="([^"]*)"/) || [])[1] : null;
        check('[D12]', r + ' SSR 200 with exactly one robots meta containing noindex', s.status === 200 && tags.length === 1 && /\bnoindex\b/i.test(ssrContent || ''), { status: s.status, tags });
        const id = 'A' + r; if (!need('[D12]', id)) continue; const d = R[id];
        check('[D12]', r + ' hydrated: exactly one meta[name=robots]', d.robots.length === 1, d.robots);
        check('[D12]', r + ' hydrated: robots still contains noindex and equals the SSR value', d.robots.length === 1 && /\bnoindex\b/i.test(d.robots[0]) && d.robots[0] === ssrContent, { dom: d.robots, ssr: ssrContent });
        check('[D12]', r + ' client robots writer RAN (>=1 content write observed) and never exposed index', Array.isArray(d.RW) && d.RW.length >= 1 && d.RW.every((w) => /\bnoindex\b/i.test(w.from || '')), { writes: d.RW, notes: d.st.notes });
    }
    if (needBase('[D12]', 'B/en/prayer-times-in-kamikawa')) {
        const d = R['B/en/prayer-times-in-kamikawa'];
        check('[D12]', 'BASE /en/prayer-times-in-kamikawa flips SSR noindex to \'index, follow\' after hydration (proves the fix)', d.robots.length === 1 && d.robots[0] === 'index, follow', d.robots);
    }
    for (const r of ['/prayer-times-in-loc-24.7n-46.7e', '/prayer-times-in-riyadh-24.71-46.67']) if (BASE_ROOT && ok('B' + r)) info('[D12]', 'BASE ' + r + ' hydrated robots = ' + JSON.stringify(R['B' + r].robots) + ' (BASE SSR served index for this shape)');
    if (BASE_ROOT && ok('B/qibla-in-kamikawa')) info('[D12]', 'BASE /qibla-in-kamikawa hydrated robots = ' + JSON.stringify(R['B/qibla-in-kamikawa'].robots) + ' (client writes ' + (R['B/qibla-in-kamikawa'].RW || []).length + ')');
    for (const r of D12_CONTROLS) {
        const id = 'A' + r; if (!need('[D12]', id)) continue; const d = R[id];
        check('[D12]', r + ' hydrated: one robots meta, index and no noindex', d.robots.length === 1 && /\bindex\b/i.test(d.robots[0]) && !/noindex/i.test(d.robots[0]), d.robots);
        if (needBase('[D12]', 'B' + r)) check('[D12]', r + ' hydrated robots identical to BASE', JSON.stringify(d.robots) === JSON.stringify(R['B' + r].robots), { after: d.robots, base: R['B' + r].robots });
        if (r !== '/moon') check('[D12]', r + ' carries no moon year island (moon city/year/month pages only)', d.islandCount === 0 && d.range === null, { islandCount: d.islandCount, range: d.range });
        else info('[D12]', '/moon hub island count = ' + d.islandCount);
    }

    // ════ [D11] ════
    console.log('\n[D11] moon client links bounded by the supported year range');
    const dayRx = /\/(\d{4})\/(\d{2})\/(\d{2})$/;
    for (const [k, r] of Object.entries(D11_PAGES)) {
        const id = 'A:' + k; if (!need('[D11]', id)) continue; const d = R[id];
        check('[D11]', r + ' window.__MOON_YEAR_RANGE__ === {min:' + MIN + ',max:' + MAX + '} (UTC year ±5), one island', d.range && d.range.min === MIN && d.range.max === MAX && d.islandCount === 1, { range: d.range, islandCount: d.islandCount });
        const yl = d.anchors.map((a) => ({ ...a, y: yearOf(a.h) })).filter((a) => a.y !== null);
        const bad = yl.filter((a) => a.y < MIN || a.y > MAX);
        check('[D11]', r + ' every year-bearing moon link (HTML + SVG) inside [' + MIN + ',' + MAX + '] (' + yl.length + ' links, ' + yl.filter((a) => a.svg).length + ' SVG)', yl.length > 0 && bad.length === 0, bad.slice(0, 8));
        const badOpt = d.options.map((o) => ({ ...o, y: yearOf(o.v) !== null ? yearOf(o.v) : (o.selName === 'cal-y' && /^\d{4}$/.test(o.v || '') ? parseInt(o.v, 10) : null) })).filter((o) => o.y !== null && (o.y < MIN || o.y > MAX));
        check('[D11]', r + ' no picker option (nested year URL or cal-y) outside the range', badOpt.length === 0, badOpt.slice(0, 6));
        if (/^day/.test(k)) {
            const [, yy, mm, dd] = r.match(dayRx);
            const svgLinks = d.anchors.filter((a) => a.svg && yearOf(a.h) !== null);
            check('[D11]', r + ' moon chart rendered SVG day links', svgLinks.length > 0, d.anchors.filter((a) => a.svg).length);
            check('[D11]', r + ' forecast table rendered 14 rows', d.fcRows.length === 14, d.fcRows.length);
            for (const row of d.fcRows) {
                const ry = parseInt((row.text.match(/(\d{4})\s*$/) || [])[1], 10);
                if (!(ry >= MIN && ry <= MAX)) { if (row.links.length) { check('[D11]', r + ' forecast row "' + row.text + '" beyond range renders no link', false, row.links); } }
                else if (row.dayLink !== 1) check('[D11]', r + ' forecast row "' + row.text + '" in range keeps its .fc-day-link', false, row);
            }
            const beyond = d.fcRows.filter((row) => { const ry = parseInt((row.text.match(/(\d{4})\s*$/) || [])[1], 10); return !(ry >= MIN && ry <= MAX); });
            check('[D11]', r + ' forecast rows beyond range have no .fc-day-link / no link (' + beyond.length + ' such rows)', beyond.every((row) => row.dayLink === 0 && row.links.length === 0) && (k !== 'dayMax' || beyond.length === 13), beyond);
            check('[D11]', r + ' forecast rows in range all keep .fc-day-link', d.fcRows.filter((row) => !beyond.includes(row)).every((row) => row.dayLink === 1), d.fcRows.filter((row) => !beyond.includes(row) && row.dayLink !== 1));
            if (k === 'dayMin') {
                check('[D11]', r + ' #moon-date-prev has NO href, aria-hidden="true", visibility hidden', d.prev && d.prev.has === false && d.prev.aria === 'true' && d.prev.vis === 'hidden' && d.prev.oldAria === null, d.prev);
                check('[D11]', r + ' #moon-date-next keeps href to ' + MIN + '/01/02 without aria-hidden', d.next && d.next.has && /\/moon\/saudi-arabia\/riyadh\/\d{4}\/01\/02$/.test(d.next.href) && yearOf(d.next.href) === MIN && d.next.aria === null && d.next.vis === '', d.next);
            }
            if (k === 'dayMax') {
                check('[D11]', r + ' #moon-date-next has NO href, aria-hidden="true", visibility hidden', d.next && d.next.has === false && d.next.aria === 'true' && d.next.vis === 'hidden' && d.next.oldAria === null, d.next);
                check('[D11]', r + ' #moon-date-prev keeps href to ' + MAX + '/12/30 without aria-hidden', d.prev && d.prev.has && /\/moon\/saudi-arabia\/riyadh\/\d{4}\/12\/30$/.test(d.prev.href) && yearOf(d.prev.href) === MAX && d.prev.aria === null && d.prev.vis === '', d.prev);
            }
            if (k === 'dayCur') check('[D11]', r + ' (current day) prev + next both keep href, visible, no aria-hidden', d.prev && d.next && d.prev.has && d.next.has && d.prev.aria === null && d.next.aria === null && d.prev.vis === '' && d.next.vis === '', { prev: d.prev, next: d.next });
            void yy; void mm; void dd;
        }
        if (/^month/.test(k)) {
            const [, yy, mm] = r.match(/\/(\d{4})\/(\d{2})$/);
            const g = d.grid, sg = d.ssrGrid || { titles: [], cells: [] };
            check('[D11]', r + ' month grid DOM === SSR grid (titles + ordered day hrefs, ' + g.cells.length + ' cells)', g.cells.length >= 28 && JSON.stringify(g.titles) === JSON.stringify(sg.titles) && JSON.stringify(g.cells) === JSON.stringify(sg.cells), { dom: g, ssr: sg });
            const titleYears = g.titles.flatMap((t) => (t.match(/\d{4}/g) || []).map(Number));
            check('[D11]', r + ' grid title year === URL year ' + yy, g.titles.length >= 1 && titleYears.length >= 1 && titleYears.every((y) => y === Number(yy)), g.titles);
            const dim = new Date(Date.UTC(Number(yy), Number(mm), 0)).getUTCDate();
            // The city-local TODAY cell links to /today by design (server.js month grid: _isToday ? base + '/today'); every other cell is the nested day URL.
            const todayIdx = g.todayFlags.map((f, i) => f ? i : -1).filter((i) => i >= 0);
            const expCells = Array.from({ length: dim }, (_, i) => todayIdx.includes(i) ? `${RIY}/today` : `${RIY}/${yy}/${mm}/${P2(i + 1)}`);
            check('[D11]', r + ' grid has ' + dim + ' day cells and at most one city-local today cell (' + todayIdx.length + ')', g.cells.length === dim && g.todayFlags.length === dim && todayIdx.length <= 1, { cells: g.cells.length, todayIdx });
            check('[D11]', r + ' every grid day-cell href is ' + RIY + '/' + yy + '/' + mm + '/01..' + dim + ' in order (today cell -> /today); every dated cell year === ' + yy, JSON.stringify(g.cells) === JSON.stringify(expCells) && g.cells.every((h) => yearOf(h) === null ? h === RIY + '/today' : yearOf(h) === Number(yy)), g.cells.map((h, i) => h === expCells[i] ? null : { i, got: h, want: expCells[i] }).filter(Boolean).slice(0, 5));
            if (k !== 'monthCur') check('[D11]', r + ' (not the current month) has no today cell', todayIdx.length === 0, todayIdx);
            if (k === 'monthMin') check('[D11]', r + ' no prev-month link at MIN/01 (span.moon-hub-cal-nav-off keeps layout), next present', g.prev === 0 && g.next === 1 && g.off === 1, g);
            if (k === 'monthMax') check('[D11]', r + ' no next-month link at MAX/12 (span.moon-hub-cal-nav-off keeps layout), prev present', g.next === 0 && g.prev === 1 && g.off === 1, g);
            if (k === 'monthCur') check('[D11]', r + ' (current month) prev + next month links both present', g.prev === 1 && g.next === 1 && g.off === 0, g);
        }
        if (k === 'yearMin') check('[D11]', r + ' year page: no prev arrow / prev pill at MIN; next present', d.yearNav.ypPrev === 0 && d.yearNav.pillPrev === 0 && d.yearNav.ypNext === 1 && d.yearNav.pillNext === 1, d.yearNav);
        if (k === 'yearMax') check('[D11]', r + ' year page: no next arrow / next pill at MAX; prev present', d.yearNav.ypNext === 0 && d.yearNav.pillNext === 0 && d.yearNav.ypPrev === 1 && d.yearNav.pillPrev === 1, d.yearNav);
    }
    // SSR island nonce is the CSP nonce (one island, raw HTML)
    {
        const s = await ssr(PORT, D11_PAGES.monthCur);
        const isl = [...s.body.matchAll(/<script nonce="([^"]+)" id="ssr-moon-year-range">window\.__MOON_YEAR_RANGE__=\{"min":(\d+),"max":(\d+)\};<\/script>/g)];
        const csp = String(s.headers['content-security-policy'] || '');
        check('[D11]', 'SSR island is emitted once, nonce\'d with the enforcing CSP nonce, values ' + MIN + '/' + MAX, isl.length === 1 && csp.includes("'nonce-" + isl[0][1] + "'") && Number(isl[0][2]) === MIN && Number(isl[0][3]) === MAX, { islands: isl.map((m) => m[0].slice(0, 140)), cspHasNonce: isl[0] ? csp.includes("'nonce-" + isl[0][1] + "'") : false });
    }
    if (needBase('[D11]', 'B:dayMin')) {
        const d = R['B:dayMin'];
        check('[D11]', 'BASE ' + D11_PAGES.dayMin + ' #moon-date-prev links to ' + (MIN - 1) + ' and the page carries out-of-range links (proves the fix)', d.prev && d.prev.has && yearOf(d.prev.href) === MIN - 1 && d.anchors.some((a) => { const y = yearOf(a.h); return y !== null && y < MIN; }), { prev: d.prev });
    }
    if (needBase('[D11]', 'B:dayMax')) {
        const d = R['B:dayMax'];
        const linkedBeyond = d.fcRows.filter((row) => { const ry = parseInt((row.text.match(/(\d{4})\s*$/) || [])[1], 10); return ry > MAX && row.dayLink === 1; }).length;
        check('[D11]', 'BASE ' + D11_PAGES.dayMax + ' #moon-date-next links to ' + (MAX + 1) + ' and forecast rows beyond MAX are linked (proves the fix)', d.next && d.next.has && yearOf(d.next.href) === MAX + 1 && linkedBeyond > 0, { next: d.next, linkedBeyond });
    }
    if (need('[D11]', 'A:mid') && needBase('[D11]', 'B:mid')) {
        const a = hostPaths(R['A:mid'].anchors), b = hostPaths(R['B:mid'].anchors);
        let firstDiff = -1; for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { firstDiff = i; break; }
        check('[D11]', MID_DAY + ' hydrated href list byte-identical to BASE (' + a.length + ' anchors)', a.length > 0 && JSON.stringify(a) === JSON.stringify(b),
            firstDiff < 0 ? { lenA: a.length, lenB: b.length } : { at: firstDiff, after: a.slice(firstDiff, firstDiff + 4), base: b.slice(firstDiff, firstDiff + 4), lenA: a.length, lenB: b.length, onlyAfter: a.filter((x) => !b.includes(x)).slice(0, 8), onlyBase: b.filter((x) => !a.includes(x)).slice(0, 8) });
    }

    // ════ [D7] ════
    console.log('\n[D7] Singapore client');
    if (need('[D7]', 'A:sgSlug')) {
        const d = R['A:sgSlug'];
        check('[D7]', 'LOCAL_CITIES has exactly one Singapore entry and it carries no slug override', d.n === 1 && d.slugField === null, d);
        check('[D7]', "buildPrayerTimesSlug(LOCAL_CITIES Singapore) === 'singapore' and buildPrayerTimesUrl → /prayer-times-in-singapore", d.built === 'singapore' && d.url === '/prayer-times-in-singapore', d);
    }
    if (needBase('[D7]', 'B:sgSlug')) check('[D7]', "BASE buildPrayerTimesSlug(LOCAL_CITIES Singapore) === 'singapore-city' (proves the fix)", R['B:sgSlug'].built === 'singapore-city', R['B:sgSlug']);
    if (need('[D7]', 'A:sgNavCity')) {
        const d = R['A:sgNavCity']; const lastDoc = d.st.docs[d.st.docs.length - 1] || {};
        check('[D7]', 'navigateToCity(Singapore, sg) lands on /prayer-times-in-singapore (200, no redirect) with seed city_singapore', d.path === '/prayer-times-in-singapore' && lastDoc.status === 200 && d.st.redirects.length === 0 && d.ssKeys.includes('city_singapore') && !d.ssKeys.some((x) => /singapore-city/.test(x)), { path: d.path, lastDoc, redirects: d.st.redirects, ssKeys: d.ssKeys });
    }
    if (needBase('[D7]', 'B:sgNavCity')) info('[D7]', 'BASE navigateToCity(Singapore) landed on ' + R['B:sgNavCity'].path + ' (redirects ' + JSON.stringify(R['B:sgNavCity'].st.redirects) + ')');
    if (need('[D7]', 'A:sgNavMoon')) {
        const d = R['A:sgNavMoon']; const lastDoc = d.st.docs[d.st.docs.length - 1] || {};
        check('[D7]', 'navigateToMoonToday(Singapore, sg) never targets singapore-city and lands on a 200 page (' + d.path + ')', d.path !== '/' && !/singapore-city/.test(d.path) && lastDoc.status === 200 && d.st.redirects.every((x) => !/singapore-city/.test(x.to)) && !d.ssKeys.some((x) => /singapore-city/.test(x)), { path: d.path, lastDoc, redirects: d.st.redirects, ssKeys: d.ssKeys });
    }
    for (const r of SG_PAGES) {
        const id = 'A:sg' + r; if (!need('[D7]', id)) continue; const d = R[id]; const lastDoc = d.st.docs[d.st.docs.length - 1] || {};
        const hits = d.allHref.filter((h) => /singapore-city/i.test(h));
        check('[D7]', r + ' served 200 without redirect', lastDoc.status === 200 && d.st.redirects.length === 0 && d.path === r, { lastDoc, redirects: d.st.redirects, path: d.path });
        check('[D7]', r + ' hydrated DOM has no href containing singapore-city (' + d.allHref.length + ' hrefs scanned)', d.allHref.length > 0 && hits.length === 0, hits.slice(0, 6));
        if (r === '/prayer-times-in-singapore' || r === '/qibla-in-singapore') {
            const s = await ssr(PORT, r);
            const sc = (s.body.match(/<link[^>]*rel="canonical"[^>]*>/g) || []).map((x) => (x.match(/href="([^"]*)"/) || [])[1]);
            check('[D6]', r + ' SSR: 200 and exactly one canonical === ' + SITE + r, s.status === 200 && sc.length === 1 && sc[0] === SITE + r, { status: s.status, sc });
            // js/app.js _seoGetBilingualUrls writes canonical = location.origin + path -> on this loopback origin, the loopback URL.
            check('[D6]', r + ' hydrated: robots index (no noindex) and exactly one canonical === origin + path (' + A + r + ')', d.robots.length === 1 && /\bindex\b/.test(d.robots[0]) && !/noindex/.test(d.robots[0]) && d.canon.length === 1 && d.canon[0] === A + r, { robots: d.robots, canon: d.canon });
        }
    }

    if (need('[D6]', 'A/prayer-times-in-makkah') && needBase('[D6]', 'B/prayer-times-in-makkah')) check('[D6]', 'client canonical rule origin + path holds on the curated control /prayer-times-in-makkah on AFTER and BASE (pre-existing, not a Singapore change)', JSON.stringify(R['A/prayer-times-in-makkah'].canon) === JSON.stringify([A + '/prayer-times-in-makkah']) && JSON.stringify(R['B/prayer-times-in-makkah'].canon) === JSON.stringify([B + '/prayer-times-in-makkah']), { after: R['A/prayer-times-in-makkah'].canon, base: R['B/prayer-times-in-makkah'].canon });

    // ════ [E] ════
    console.log('\n[E] console / CSP / network hygiene (AFTER pages)');
    const UIR = "The Content Security Policy directive 'upgrade-insecure-requests' is ignored when delivered in a report-only policy.";
    const isUir = (m) => m.startsWith('security: ' + UIR);
    const norm = (m) => m.replace(/http:\/\/127\.0\.0\.1:\d+/g, 'ORIGIN');
    const baseTwin = (t) => { const bid = 'B' + t.id.slice(1); return (tasks.some((x) => x.id === bid) && ok(bid)) ? R[bid] : null; };
    let extAttempts = 0, extResp = 0, uirAfter = 0, uirBase = 0, basePages = 0, baseWithUir = 0;
    for (const t of tasks) {
        const d = R[t.id]; if (!d || d.error) continue;
        extAttempts += d.st.blocked.length; extResp += d.st.extResponses.length;
        const uirN = d.st.localLogErrors.filter(isUir).length;
        if (!t.id.startsWith('A')) {
            basePages++; uirBase += uirN; if (uirN > 0) baseWithUir++;
            const n = d.st.exceptions.length + d.st.consoleErrors.length + d.st.localLogErrors.filter((m) => !isUir(m)).length + ((d.V || []).length);
            if (n) info('[E]', 'BASE ' + d.route + ' exceptions=' + d.st.exceptions.length + ' console=' + d.st.consoleErrors.length + ' csp=' + (d.V || []).length + ' other local log errors ' + JSON.stringify(d.st.localLogErrors.filter((m) => !isUir(m)).slice(0, 3)));
            continue;
        }
        uirAfter += uirN;
        const label = t.id + ' (' + d.route + ')';
        check('[E]', label + ' 0 Runtime exceptions, 0 console errors', d.st.exceptions.length === 0 && d.st.consoleErrors.length === 0, { exceptions: d.st.exceptions.slice(0, 3), console: d.st.consoleErrors.slice(0, 3) });
        check('[E]', label + ' 0 CSP violations', Array.isArray(d.V) && d.V.length === 0, d.V);
        const other = d.st.localLogErrors.filter((m) => !isUir(m));
        const twin = baseTwin(t);
        const twinOther = twin ? twin.st.localLogErrors.filter((m) => !isUir(m)).map(norm) : null;
        const fresh = other.filter((m) => !(twinOther && twinOther.includes(norm(m))));
        check('[E]', label + ' no local browser error log line beyond the identical BASE twin' + (twin ? '' : ' (no base twin -> must be none)'), fresh.length === 0, { fresh, base: twinOther });
        if (other.length && fresh.length === 0) info('[E]', label + ' PRE-EXISTING, identical on BASE: ' + JSON.stringify(other));
        check('[E]', label + ' load event fired + hydrated', d.st.notes.length === 0, d.st.notes);
    }
    check('[E]', "Chrome's notice for 'upgrade-insecure-requests' in the Report-Only CSP header (not a violation) is emitted by EVERY base page too - pre-existing", basePages > 0 && baseWithUir === basePages, { uirAfter, uirBase, basePages, baseWithUir });
    check('[E]', 'zero non-local responses across ALL ' + tasks.length + ' page loads (after + base)', extResp === 0 && res.every((d) => !d || d.error || d.st.extResponses.length === 0), res.flatMap((d) => (d && d.st) ? d.st.extResponses : []).slice(0, 6));
    info('[E]', 'non-local requests attempted and failed by Fetch interception (never reached the network): ' + extAttempts + ' — hosts: ' + [...new Set(res.flatMap((d) => (d && d.st) ? d.st.blocked.map(hostOf) : []))].join(', '));
    try { br.ws.close(); } catch (_) {}
} catch (e) { fail++; failures.push('HARNESS ' + (e && e.stack || e)); console.log('HARNESS: ' + (e && e.stack || e)); }
finally {
    cleanup();
    for (let i = 0; i < 10; i++) { try { fs.rmSync(PROFILE, { recursive: true, force: true }); break; } catch (_) { await sleep(500); } }
}
console.log('\n================================================================');
if (failures.length) { console.log('  FAILURES:'); for (const f of failures) console.log('   - ' + f.slice(0, 600)); }
console.log('  SUMMARY  INDEXABLE-ROUTE-SURFACE-CONTAINMENT-1 browser  pass=' + pass + '  fail=' + fail + '  range=' + MIN + '..' + MAX + '  base=' + (BASE_ROOT || 'NONE') + '  VERDICT -> ' + (fail === 0 ? 'PASS' : 'FAIL'));
console.log('================================================================');
process.exit(fail === 0 ? 0 : 1);
