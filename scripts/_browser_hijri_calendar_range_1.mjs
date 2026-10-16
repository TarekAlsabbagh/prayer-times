// HIJRI-CALENDAR-RANGE-1 — browser probe of the CLIENT calendar links (headless Chrome over raw CDP, Node 24 WebSocket).
//
// Two local servers of this worktree with the test clock: W1 = 2026-10-16 (window 1447–1449) and W2 = 2027-06-05T21:00:30Z
// (just after Riyadh midnight on 1 Muharram 1449: window 1448–1450). The browser's own clock stays the real date and its
// time zone is forced to America/Los_Angeles and to Pacific/Kiritimati, so the client can only get the window right by
// reading the server's <meta name="tp-hijri-window">, never from the device date.
//   [D]  rendered DOM after JS: every a[href] to /hijri-calendar/YYYY[-MM], every rel=prev/next and every year-picker
//        option is inside the server window — hub, edge years, edge months, a middle month, the 4 countdowns, home,
//        today, converter (ar + en); the month nav omits the neighbour across a window edge.
//   [E]  no new uncaught exception compared with batch B (TP_B_ROOT) on the same pages; the year / month tables fill.
//   [X]  isolation: 0 successful non-loopback responses; ads off + ad domains blocked.
// Usage: node scripts/_browser_hijri_calendar_range_1.mjs  (env TP_B_ROOT, TP_GUARD, TP_RANGE_CDP_PORT)
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B_ROOT = process.env.TP_B_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-hijrislim2';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W1_PORT = 8611, W2_PORT = 8612, B_PORT = 8613;
const CDP_PORT = Number(process.env.TP_RANGE_CDP_PORT || 41461);
const SITE = 'https://timesprayers.com';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hrange-browser-'));
const PROFILE = path.join(TMP, 'chrome-profile');
const BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*',
    '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*google.com/ads*', '*gstatic.com/ads*', '*timesprayers.com*', '*onrender.com*'];
setTimeout(() => { console.log('WATCHDOG: exceeded 45 min'); cleanup(); process.exit(3); }, 45 * 60 * 1000).unref();

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
        const r = http.request({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => { const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => resolve({ status: x.statusCode, body: Buffer.concat(c).toString('utf8') })); });
        r.setTimeout(60000, () => { r.destroy(); resolve({ status: 0, body: '' }); });
        r.on('error', () => resolve({ status: 0, body: '' })); r.end();
    });
}
async function bootServer(root, port, tag, extra = {}) {
    if ((await httpGet(port, '/health')).status !== 0) throw new Error('port ' + port + ' already in use');
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: SITE, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
                  ADSENSE_CLIENT: 'off', GUARD_OUT: path.join(TMP, 'guard-' + tag + '.log'), TP_MOON_DAY_SHED: '0', ...extra };
    for (const k of ['TP_ENABLE_SEARCH_TEST', 'TP_MOON_RANGE_TEST_NOW', 'NODE_OPTIONS', 'DISCOVERED_SSR_TEST_FIXTURE', 'TP_HIJRI_SLIM']) delete env[k];
    if (!extra.TP_HIJRI_RANGE_TEST_NOW) delete env.TP_HIJRI_RANGE_TEST_NOW;
    const p = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    procs.push(p);
    let up = false; for (let i = 0; i < 300 && !up; i++) { up = (await httpGet(port, '/health')).status === 200; if (!up) await sleep(400); }
    if (!up) throw new Error('server never became healthy on ' + port);
    console.log('  ' + tag + ' server up on ' + port);
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
let br = null;
async function evalIn(S, fnOrExpr, arg) {
    const expression = typeof fnOrExpr === 'function' ? '(' + fnOrExpr.toString() + ')(' + (arg === undefined ? '' : JSON.stringify(arg)) + ')' : fnOrExpr;
    const r = await br.send('Runtime.evaluate', { expression, returnByValue: true }, S, 45000);
    if (r.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result.value;
}
function DOMLINKS() {
    const years = (h) => { const m = String(h || '').match(/\/hijri-calendar\/(\d{4})(?:-(\d{2}))?(?:[?#].*)?$/); return m ? +m[1] : null; };
    const a = [...document.querySelectorAll('a[href]')].map((x) => x.getAttribute('href')).filter((h) => /\/hijri-calendar\/\d{4}/.test(h));
    const rel = [...document.querySelectorAll('link[rel="prev"], link[rel="next"]')].map((x) => x.getAttribute('rel') + '=' + x.getAttribute('href').replace(/^https?:\/\/[^/]+/, ''));
    const opts = [...document.querySelectorAll('#hyear-year-select option, #calendar-year-select option')].map((o) => +o.value);
    const nav = document.getElementById('hmonth-nav');
    const meta = (document.querySelector('meta[name="tp-hijri-window"]') || {}).content || null;
    return { a, aYears: a.map(years), rel, relYears: rel.map((r) => years(r.split('=')[1])), opts, navLinks: nav ? [...nav.querySelectorAll('a')].map((x) => x.getAttribute('href')) : null,
        meta, yearRows: document.querySelectorAll('#hyear-table-body tr').length, monthRows: document.querySelectorAll('#hmonth-table-body tr').length,
        cdLinks: [...document.querySelectorAll('a.cd-years-link')].map((x) => x.getAttribute('href')), cdCells: document.querySelectorAll('.cd-years-table td, table td').length,
        eduHijri: (document.querySelector('.moon-city-hub-edu-link-hijri') || { getAttribute: () => null }).getAttribute('href'),
        navOff: [...document.querySelectorAll('.hyear-year-nav-off')].map((x) => { const cs = getComputedStyle(x); return x.id + ':' + cs.display + '/' + cs.visibility + '/' + Math.round(x.getBoundingClientRect().height); }) };
}
const NET = { okResponses: [], attempts: new Map() };
async function withPage(origin, route, tz, mobile = false) {
    const { browserContextId } = await br.send('Target.createBrowserContext', {});
    const { targetId } = await br.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
    const st = { loaded: false, exceptions: [] };
    const on = (m) => {
        if (m.sessionId !== S) return; const P = m.params || {};
        if (m.method === 'Network.requestWillBeSent') { const u = P.request.url; if (!isLocal(u)) { const h = hostOf(u); NET.attempts.set(h, (NET.attempts.get(h) || 0) + 1); } }
        else if (m.method === 'Network.responseReceived') { if (!isLocal(P.response.url)) NET.okResponses.push(route + ' → ' + P.response.url.slice(0, 120)); }
        else if (m.method === 'Runtime.exceptionThrown') st.exceptions.push(String((P.exceptionDetails && ((P.exceptionDetails.exception && P.exceptionDetails.exception.description) || P.exceptionDetails.text)) || '').split('\n')[0].slice(0, 200));
        else if (m.method === 'Page.loadEventFired') st.loaded = true;
        else if (m.method === 'Page.javascriptDialogOpening') br.send('Page.handleJavaScriptDialog', { accept: false }, S).catch(() => {});
    };
    br.subs.add(on);
    try {
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S);
        await br.send('Network.setBlockedURLs', { urls: BLOCK }, S);
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S);
        await br.send('Network.setCacheDisabled', { cacheDisabled: true }, S);
        if (tz) await br.send('Emulation.setTimezoneOverride', { timezoneId: tz }, S);
        if (mobile) await br.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }, S);
        await br.send('Page.navigate', { url: origin + route }, S);
        for (let i = 0; i < 160 && !st.loaded; i++) await sleep(250);
        await sleep(3000);
        return { route, ...(await evalIn(S, DOMLINKS)), exceptions: st.exceptions };
    } finally {
        br.subs.delete(on);
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
        await br.send('Target.disposeBrowserContext', { browserContextId }).catch(() => {});
    }
}

let chrome = null;
try {
    console.log('=== HIJRI-CALENDAR-RANGE-1 browser probe — ' + REPO + ' (B baseline ' + B_ROOT + ') — UTC ' + new Date().toISOString() + ' ===');
    if (!(CDP_PORT < 49152)) throw new Error('CDP port must stay below 49152');
    await bootServer(REPO, W1_PORT, 'W1 2026-10-16', { TP_HIJRI_RANGE_TEST_NOW: '2026-10-16T12:00:00Z' });
    await bootServer(REPO, W2_PORT, 'W2 2027-06-05T21:00:30Z', { TP_HIJRI_RANGE_TEST_NOW: '2027-06-05T21:00:30Z' });
    await bootServer(B_ROOT, B_PORT, 'B (no range, live clock)');
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

    const RUN = (tag) => !process.env.TP_RANGE_ONLY || process.env.TP_RANGE_ONLY.split(',').includes(tag);   // TP_RANGE_ONLY=D,F,X
    const PAGES = (w) => ['/hijri-calendar', '/hijri-calendar/' + w.min, '/hijri-calendar/' + w.max, '/hijri-calendar/' + w.min + '-01', '/hijri-calendar/' + w.max + '-12',
        '/hijri-calendar/' + w.cur + '-06', '/en/hijri-calendar', '/en/hijri-calendar/' + w.max + '-12', '/ur/hijri-calendar/' + w.min, '/ramadan-countdown', '/eid-al-fitr-countdown', '/eid-al-adha-countdown',
        '/hijri-new-year-countdown', '/en/hijri-new-year-countdown', '/', '/en', '/today-hijri-date', '/date-converter'];
    if (RUN('D')) for (const [label, port, w] of [['W1', W1_PORT, { min: 1447, max: 1449, cur: 1448 }], ['W2', W2_PORT, { min: 1448, max: 1450, cur: 1449 }]]) {
        console.log('\n-- [D] ' + label + ' window ' + w.min + '–' + w.max + ': rendered links, rel, pickers --');
        for (const tz of ['America/Los_Angeles', 'Pacific/Kiritimati']) {
            for (const route of PAGES(w)) {
                const r = await withPage('http://127.0.0.1:' + port, route, tz);
                const issues = [];
                if (r.meta !== w.min + ',' + w.max + ',' + w.cur) issues.push('meta ' + r.meta);
                const outA = r.a.filter((h, i) => !(r.aYears[i] >= w.min && r.aYears[i] <= w.max));
                const outR = r.rel.filter((x, i) => !(r.relYears[i] >= w.min && r.relYears[i] <= w.max));
                const outO = r.opts.filter((y) => !(y >= w.min && y <= w.max));
                if (outA.length) issues.push('links outside: ' + outA.slice(0, 5).join(' '));
                if (outR.length) issues.push('rel outside: ' + outR.join(' '));
                if (outO.length) issues.push('picker options outside: ' + outO.slice(0, 5).join(','));
                if (r.opts.length && JSON.stringify([...new Set(r.opts)].sort()) !== JSON.stringify([w.min, w.cur, w.max])) issues.push('picker options ' + JSON.stringify(r.opts));
                if (/\/hijri-calendar\/\d{4}-01$/.test(route) && route.includes(String(w.min)) && r.navLinks && r.navLinks.length !== 1) issues.push('month nav at the lower edge has ' + (r.navLinks || []).length + ' links');
                if (/\/hijri-calendar\/\d{4}-12$/.test(route) && route.includes(String(w.max)) && r.navLinks && r.navLinks.length !== 1) issues.push('month nav at the upper edge has ' + (r.navLinks || []).length + ' links');
                if (/\/hijri-calendar(?:\/\d{4})?$/.test(route) && r.yearRows !== 12) issues.push('year rows ' + r.yearRows);
                if (/\/hijri-calendar\/\d{4}-\d{2}$/.test(route) && r.monthRows < 29) issues.push('month rows ' + r.monthRows);
                check('D', issues.length === 0, label + ' ' + tz.split('/')[1] + ' ' + route + ': ' + r.a.length + ' calendar links, ' + r.rel.length + ' rel, ' + r.opts.length + ' picker options' + (r.cdLinks.length ? ', countdown year links ' + r.cdLinks.map((h) => h.replace(/.*\//, '')).join(',') : '') + (r.navLinks ? ', month nav ' + r.navLinks.length : ''), issues.join(' ; '));
                if (tz === 'America/Los_Angeles' && label === 'W1' && !/1450|1446/.test(route)) {
                    const b = await withPage('http://127.0.0.1:' + B_PORT, route, tz);
                    const extra = r.exceptions.filter((e) => !b.exceptions.includes(e));
                    check('E', extra.length === 0, route + ': no new uncaught exception vs batch B (range ' + r.exceptions.length + ', B ' + b.exceptions.length + ')', extra.join(' | '));
                }
            }
        }
    }
    console.log('\n-- [F] review follow-ups: the legacy moon month edu link and the phone layout of the year panel (W1) --');
    if (RUN('F')) for (const [route, want] of [['/moon-in-location-0.5-160.2/2025-01', '/hijri-calendar'], ['/moon-in-pacific-0.50-160.20/2026-10', '/hijri-calendar/1448-05'], ['/moon-in-place-10.00--140.00/2030-05', '/hijri-calendar'], ['/en/moon-in-pacific-0.50-160.20/2026-10', '/en/hijri-calendar/1448-05']]) {
        const r = await withPage('http://127.0.0.1:' + W1_PORT, route, 'America/Los_Angeles');
        check('F', r.eduHijri === want && r.a.every((h, i) => r.aYears[i] >= 1447 && r.aYears[i] <= 1449), route + ': edu link "Corresponding Hijri calendar" -> ' + r.eduHijri + ' (want ' + want + ')', JSON.stringify({ edu: r.eduHijri, a: r.a.slice(0, 5) }));
    }
    if (RUN('F')) for (const [route, mobile, want] of [['/hijri-calendar/1447', true, 'hyear-prev-link:none/'], ['/hijri-calendar/1449', true, 'hyear-next-link:none/'], ['/hijri-calendar/1447', false, 'hyear-prev-link:'], ['/en/hijri-calendar/1449', false, 'hyear-next-link:']]) {
        const r = await withPage('http://127.0.0.1:' + W1_PORT, route, null, mobile);
        check('F', r.navOff.length === 1 && r.navOff[0].startsWith(want) && (mobile ? /:none\/[a-z]+\/0$/.test(r.navOff[0]) : /:(?!none\/)[a-z-]+\/hidden\/\d+$/.test(r.navOff[0])), route + (mobile ? ' phone' : ' desktop') + ': out-of-window neighbour placeholder ' + r.navOff.join(','), want);
    }
    console.log('\n-- [X] isolation --');
    info('non-loopback attempts by host: ' + JSON.stringify(Object.fromEntries(NET.attempts)));
    check('X', NET.okResponses.length === 0, '0 successful responses from a non-loopback host', NET.okResponses.slice(0, 5).join(' | '));
    check('X', ![...NET.attempts.keys()].some((h) => /googlesyndication|doubleclick|adtrafficquality/.test(h)), 'no ad-network request attempted');
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
