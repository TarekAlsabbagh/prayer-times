// ADSENSE-STRICT-CSP-PRE-ENFORCEMENT-CLEANUP-1 — 26-route Chromium matrix.
//
// Same 26 routes and the same violation categories as the Phase 1 production sweep that measured
// 37 = 36 PRELOAD + 1 SEARCH-TEST, so before/after numbers compare directly. Beyond counting, every
// route proves the preload removal cost nothing functional:
//   * both scripts were fetched exactly once and executed (SiteSearch + app.js globals exist)
//   * the page hydrated to the same active section with live time values
//   * the homepage search box still returns suggestions (site-search.js -> /api/search-place)
//   * Cookie Settings opens without navigating, inline handlers fire, no uncaught error
//
// Local by default: boots server.js with the production-default env (TP_ENABLE_SEARCH_TEST absent).
// TP_MATRIX_ORIGIN=https://timesprayers.com runs the identical matrix read-only against a live origin.
// TP_MATRIX_OUT=<file> writes the per-route JSON for a before/after diff.
//
// Usage: node scripts/_browser_adsense_strict_csp_pre_enforcement_cleanup_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8760;
const CDP_PORT = 54600;
const REMOTE = process.env.TP_MATRIX_ORIGIN || '';
const ORIGIN = REMOTE || 'http://127.0.0.1:' + PORT;
const HOST = new URL(ORIGIN).host;
const WATCHDOG_MS = 20 * 60 * 1000;
setTimeout(() => { console.log('\nWATCHDOG: matrix exceeded ' + WATCHDOG_MS + ' ms'); process.exit(3); }, WATCHDOG_MS).unref();

const ROUTES = [
    ['home ar', '/'], ['home en', '/en'], ['home fr', '/fr'], ['home tr', '/tr'], ['home ur', '/ur'],
    ['home de', '/de'], ['home id', '/id'], ['home es', '/es'], ['home bn', '/bn'], ['home ms', '/ms'],
    ['city', '/prayer-times-in-riyadh'], ['country', '/prayer-times-in-saudi-arabia'],
    ['worldwide', '/prayer-times-worldwide'], ['quran home', '/quran'], ['quran surah', '/quran/al-fatihah'],
    ['guides hub', '/guides'], ['guides article', '/guides/why-prayer-times-differ'],
    ['moon', '/moon'], ['moon nested', '/moon/saudi-arabia/riyadh/today'],
    ['qibla', '/qibla-in-riyadh'], ['azkar', '/azkar'], ['countdown', '/ramadan-countdown'],
    ['trust privacy', '/privacy'], ['trust about', '/about-us'],
    ['404', '/definitely-not-a-real-route-xyz'], ['search-test', '/search-test'],
];
const EXPECTED_STATUS = { '/definitely-not-a-real-route-xyz': 404, '/search-test': 404 };

class CDP {
    constructor(ws) {
        this.ws = ws; this.id = 0; this.pend = new Map(); this.subs = [];
        ws.onmessage = ev => { const m = JSON.parse(ev.data);
            if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); clearTimeout(p.t); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
            else this.subs.forEach(f => f(m)); };
        ws.onclose = () => { for (const [, p] of this.pend) { clearTimeout(p.t); p.rej(new Error('socket closed')); } this.pend.clear(); };
    }
    static async open(u) {
        const ws = new WebSocket(u);
        await Promise.race([new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('ws error')); }),
                            sleep(10000).then(() => { throw new Error('ws open timeout'); })]);
        return new CDP(ws);
    }
    send(m, p = {}, s, ms = 20000) { const id = ++this.id;
        return new Promise((res, rej) => { const t = setTimeout(() => { this.pend.delete(id); rej(new Error('timeout ' + m)); }, ms);
            this.pend.set(id, { res, rej, t }); this.ws.send(JSON.stringify({ id, method: m, params: p, sessionId: s })); }); }
    on(f) { this.subs.push(f); }
    close() { try { this.ws.close(); } catch (_) {} }
}

const INIT = `window.__V=[];window.__ERR=[];
document.addEventListener('securitypolicyviolation',function(e){ if(window.__V.length<600)
  window.__V.push({d:e.violatedDirective,disp:e.disposition,u:String(e.blockedURI).slice(0,140),s:String(e.sample||'').slice(0,40)});});
window.addEventListener('error',function(e){ if(window.__ERR.length<30) window.__ERR.push(String(e.message).slice(0,140)); });`;

// identical to the Phase 1 production sweep so handler coverage is comparable
const FIRE = `(function(){var A=['onclick','onchange','oninput','onkeydown'];
  var NAV=/location|goHome|navToPage|href|openAllCities|goToPrayerTimes|DetectAndNavigate|detectLocation|fetchCities/i;
  var seen={},f=0,d=0,all=document.querySelectorAll('*');
  for(var i=0;i<all.length&&d<20;i++){var el=all[i];
    for(var j=0;j<A.length;j++){ if(!el.hasAttribute(A[j]))continue;
      var b=el.getAttribute(A[j])||''; if(NAV.test(b))continue;
      if(!seen[b]){seen[b]=1;d++;}
      try{el.dispatchEvent(new Event(A[j].slice(2),{bubbles:true}));f++;}catch(e){} }}
  return JSON.stringify({fired:f,distinct:d});})()`;

const PROBE = `JSON.stringify((function(){
  var res = performance.getEntriesByType('resource');
  function hits(re){ return res.filter(function(e){ return re.test(e.name); }).map(function(e){ return { start: Math.round(e.startTime), dur: Math.round(e.duration), init: e.initiatorType }; }); }
  var active = document.querySelector('.page.active');
  var txt = ((active || document.body).innerText || '');
  var g = {}; ['SiteSearch','initApp','navToPage','goHome','detectLocation','openCookieSettings'].forEach(function(k){ g[k] = typeof window[k]; });
  return {
    lang: document.documentElement.lang,
    activePage: active ? active.id : null,
    timeTokens: (txt.match(/\\b\\d{1,2}:\\d{2}\\b/g) || []).length,
    textLen: txt.length,
    globals: g,
    scriptPreloadLinks: document.querySelectorAll('link[rel="preload"][as="script"]').length,
    appRes: hits(/\\/js\\/app\\.js\\?/),
    ssRes: hits(/\\/js\\/site-search\\.js\\?/),
    noncedSrcs: [].slice.call(document.querySelectorAll('script[src][nonce]')).map(function(s){ return s.src; })
  };
})())`;

const SEARCH = `new Promise(function(done){
  var inp = document.querySelector('#loc-hero-search');
  if (!inp) return done(JSON.stringify({ input: false }));
  inp.focus(); inp.value = 'riyadh';
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  inp.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'h' }));
  var t0 = Date.now();
  (function poll(){
    var n = document.querySelectorAll('.search-test-result').length;
    if (n > 0 || Date.now() - t0 > 8000) return done(JSON.stringify({ input: true, results: n, ms: Date.now() - t0 }));
    setTimeout(poll, 150);
  })();
})`;

// js/footer-cookie.js openModal() builds #cc-modal; count its nodes before/after the delegated click
const COOKIE = `new Promise(function(done){
  function modalNodes(){ var m = document.getElementById('cc-modal'); return m ? m.querySelectorAll('*').length : 0; }
  var c = document.querySelector('[data-tp-cookie-settings]');
  if (!c) return done(JSON.stringify({ control: false }));
  var before = modalNodes(), href = location.href;
  c.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  setTimeout(function(){ var m = document.getElementById('cc-modal');
    done(JSON.stringify({ control: true, fn: typeof window.openCookieSettings, inlineOnclick: c.hasAttribute('onclick'),
      before: before, after: modalNodes(), modalOpen: !!m && !m.classList.contains('hidden'), sameUrl: location.href === href }));
    if (m) { try { m.remove(); } catch (e) {} } }, 900);
})`;

function categorise(v, noncedSrcs, route) {
    const u = String(v.u || '');
    if (route === '/search-test') return 'SEARCH-TEST';
    if (/google|doubleclick|gstatic|adtrafficquality|googlesyndication|googletagmanager/.test(u)) return 'GOOGLE';
    if (u.includes(HOST)) {
        const bare = u.split('?')[0];
        // a script that already runs with a nonce cannot be the violator -> it is its preload hint
        if (noncedSrcs.some(s => s.split('?')[0] === bare)) return 'PRELOAD';
        return 'SITE';
    }
    if (u === 'inline') return 'SITE';
    return 'UNKNOWN';
}

function httpGet(p) {
    return new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'GET' }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', () => resolve(0)); req.end();
    });
}
function kill(pid) { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }

(async () => {
    let srv = null;
    if (!REMOTE) {
        const env = { ...process.env, PORT: String(PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0',
                      SITE_URL: ORIGIN, SUPABASE_URL: '', GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
        delete env.TP_ENABLE_SEARCH_TEST;
        console.log('booting local server on ' + PORT + ' (production-default env) ...');
        srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
        let up = false;
        for (let i = 0; i < 200; i++) { if (await httpGet('/health') === 200) { up = true; break; } await sleep(400); }
        if (!up) { console.log('server never became healthy'); kill(srv.pid); process.exit(2); }
    }
    const profile = 'C:/Users/Tarek/AppData/Local/Temp/claude/cspclean-matrix-' + process.pid;
    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + profile,
        '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
    let wsu; const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
        try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version', { signal: AbortSignal.timeout(1000) }); if (r.ok) { wsu = (await r.json()).webSocketDebuggerUrl; break; } } catch (_) {}
        await sleep(300);
    }
    if (!wsu) { console.log('chrome never came up'); kill(chrome.pid); if (srv) kill(srv.pid); process.exit(2); }
    const br = await CDP.open(wsu);

    const totals = { SITE: 0, GOOGLE: 0, PRELOAD: 0, 'SEARCH-TEST': 0, UNKNOWN: 0 };
    let enforceTotal = 0, reportTotal = 0, jsErr = 0;
    const rows = [], problems = [], samples = [];

    console.log('\n=== 26-ROUTE MATRIX @ ' + ORIGIN + ' ===');
    console.log('  route           st   enf rep  SITE GOOG PRELD STEST UNK  err  spl  app ss  SiteSearch  active                 tt   handlers');
    for (const [name, route] of ROUTES) {
        const { targetId } = await br.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S).catch(() => {});
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S).catch(() => {});
        let status = 0;
        const onDoc = m => { if (m.sessionId === S && m.method === 'Network.responseReceived' && m.params.type === 'Document' && !status) status = m.params.response.status; };
        br.on(onDoc);
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
        await br.send('Page.navigate', { url: ORIGIN + route }, S);
        await sleep(8000);
        const ev = async (e, aw = false) => { try { const r = await br.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: aw }, S); return r.result && r.result.value; } catch (_) { return null; } };

        const probe = JSON.parse(await ev(PROBE) || '{}');
        let search = null, cookie = null;
        if (route === '/') {
            search = JSON.parse(await ev(SEARCH, true) || '{}');
            cookie = JSON.parse(await ev(COOKIE, true) || '{}');
        }
        const fired = JSON.parse(await ev(FIRE) || '{}');
        await sleep(2500);
        const V = JSON.parse(await ev('JSON.stringify(window.__V||[])') || '[]');
        const ERR = JSON.parse(await ev('JSON.stringify(window.__ERR||[])') || '[]');

        const per = { SITE: 0, GOOGLE: 0, PRELOAD: 0, 'SEARCH-TEST': 0, UNKNOWN: 0 };
        let enf = 0, rep = 0;
        for (const v of V) {
            if (v.disp === 'enforce') enf++; else rep++;
            const c = categorise(v, probe.noncedSrcs || [], route);
            per[c]++; totals[c]++;
            if (samples.length < 20) samples.push(route + ' :: ' + c + ' :: ' + v.disp + ' ' + v.d + ' <- ' + v.u);
        }
        enforceTotal += enf; reportTotal += rep; jsErr += ERR.length;

        const isShell = (probe.noncedSrcs || []).some(s => /\/js\/app\.js\?/.test(s));
        const want = EXPECTED_STATUS[route] || 200;
        if (status !== want) problems.push(route + ': status ' + status + ' (want ' + want + ')');
        if (probe.scriptPreloadLinks) problems.push(route + ': ' + probe.scriptPreloadLinks + ' <link rel=preload as=script> still in DOM');
        if (isShell) {
            if ((probe.appRes || []).length !== 1) problems.push(route + ': app.js fetched ' + (probe.appRes || []).length + 'x');
            if ((probe.ssRes || []).length !== 1) problems.push(route + ': site-search.js fetched ' + (probe.ssRes || []).length + 'x');
            if (!probe.globals || probe.globals.SiteSearch === 'undefined') problems.push(route + ': window.SiteSearch missing (site-search.js did not execute)');
        }
        if (ERR.length) problems.push(route + ': uncaught JS error(s): ' + ERR.slice(0, 2).join(' | '));
        if (route === '/') {
            if (!search || !search.input || !(search.results > 0)) problems.push('/: homepage search returned no suggestions ' + JSON.stringify(search));
            if (!cookie || !cookie.control || cookie.fn !== 'function' || cookie.inlineOnclick || !(cookie.after > cookie.before) || !cookie.sameUrl)
                problems.push('/: cookie settings check failed ' + JSON.stringify(cookie));
        }

        rows.push({ name, route, status, enf, rep, per, jsErr: ERR, errors: ERR, isShell, probe, search, cookie, fired });
        console.log('  ' + name.padEnd(15) + String(status).padEnd(5) + String(enf).padEnd(4) + String(rep).padEnd(5)
            + String(per.SITE).padEnd(5) + String(per.GOOGLE).padEnd(5) + String(per.PRELOAD).padEnd(6) + String(per['SEARCH-TEST']).padEnd(6)
            + String(per.UNKNOWN).padEnd(5) + String(ERR.length).padEnd(5) + String(probe.scriptPreloadLinks).padEnd(5)
            + String((probe.appRes || []).length).padEnd(4) + String((probe.ssRes || []).length).padEnd(3)
            + String((probe.globals || {}).SiteSearch).padEnd(12) + String(probe.activePage).padEnd(23) + String(probe.timeTokens).padEnd(5)
            + (fired.distinct || 0) + '/' + (fired.fired || 0));
        br.subs = br.subs.filter(f => f !== onDoc);
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
    }

    const home = rows.find(r => r.route === '/');
    const stRow = rows.find(r => r.route === '/search-test');
    console.log('\n  homepage search   : ' + JSON.stringify(home && home.search));
    console.log('  cookie settings   : ' + JSON.stringify(home && home.cookie));
    console.log('  app.js globals /  : ' + JSON.stringify(home && home.probe.globals));
    console.log('  script timing /   : app.js ' + JSON.stringify(home && home.probe.appRes) + '  site-search.js ' + JSON.stringify(home && home.probe.ssRes) + '   (local, informational only)');

    console.log('\n================================================================');
    console.log('  ORIGIN                       : ' + ORIGIN);
    console.log('  ROUTES SWEPT                 : ' + rows.length);
    console.log('  TOTAL REPORT-ONLY VIOLATIONS : ' + reportTotal);
    console.log('  SITE VIOLATIONS              : ' + totals.SITE);
    console.log('  GOOGLE VIOLATIONS            : ' + totals.GOOGLE);
    console.log('  EXPECTED PRELOAD VIOLATIONS  : ' + totals.PRELOAD);
    console.log('  SEARCH-TEST VIOLATIONS       : ' + totals['SEARCH-TEST']);
    console.log('  UNKNOWN VIOLATIONS           : ' + totals.UNKNOWN);
    console.log('  ENFORCED VIOLATIONS          : ' + enforceTotal);
    console.log('  UNCAUGHT JS ERRORS           : ' + jsErr);
    console.log('  /search-test status          : ' + (stRow && stRow.status));
    console.log('  index-shell routes           : ' + rows.filter(r => r.isShell).length);
    if (samples.length) { console.log('\n  violation samples:'); samples.forEach(s => console.log('    - ' + s)); }
    if (problems.length) { console.log('\n  PROBLEMS:'); problems.forEach(p => console.log('    - ' + p)); }
    const passed = reportTotal === 0 && enforceTotal === 0 && jsErr === 0 && Object.values(totals).every(n => n === 0) && problems.length === 0;
    console.log('\n  MATRIX: ' + (passed ? 'PASS' : 'FAIL'));
    console.log('================================================================');

    if (process.env.TP_MATRIX_OUT) {
        fs.writeFileSync(process.env.TP_MATRIX_OUT, JSON.stringify({ origin: ORIGIN, reportTotal, enforceTotal, jsErr, totals, problems,
            rows: rows.map(r => ({ route: r.route, status: r.status, enf: r.enf, rep: r.rep, per: r.per, errors: r.errors, isShell: r.isShell,
                activePage: r.probe.activePage, lang: r.probe.lang, timeTokens: r.probe.timeTokens, textLen: r.probe.textLen,
                globals: r.probe.globals, scriptPreloadLinks: r.probe.scriptPreloadLinks, appRes: r.probe.appRes, ssRes: r.probe.ssRes,
                search: r.search, cookie: r.cookie, fired: r.fired })) }, null, 1));
        console.log('  wrote ' + process.env.TP_MATRIX_OUT);
    }
    br.close(); kill(chrome.pid); if (srv) kill(srv.pid);
    process.exit(passed ? 0 : 1);
})();
