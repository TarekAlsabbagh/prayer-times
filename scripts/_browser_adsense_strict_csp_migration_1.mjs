// ADSENSE-STRICT-CSP-MIGRATION-1 — active browser verification.
//
// There is deliberately NO CSP reporting endpoint in this ticket, so a passive "wait 7-14 days"
// observation window would collect nothing. This does the active equivalent: drive a real Chromium
// over the approved page matrix against the LOCAL build and read the violations the browser itself
// raises.
//
// Two things make this more than a page-load check:
//   * violations are split by disposition — "report" is expected (that is the whole point of
//     Phase 1), "enforce" MUST be zero or the change is breaking;
//   * inline event handlers only violate CSP when they actually FIRE. Measured earlier on
//     production: 0 handler violations on load, 40 after firing 40 handlers. So each page is
//     interacted with, not merely opened.
//
// Usage: node scripts/_browser_adsense_strict_csp_migration_1.mjs
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8740;
const CDP_PORT = 54100;
const TOKEN = '__TP_CSP_NONCE__';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.subs = [];
        ws.onmessage = ev => { const m = JSON.parse(ev.data);
            if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
            else this.subs.forEach(f => f(m)); }; }
    static async open(u) { const ws = new WebSocket(u); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); return new CDP(ws); }
    send(method, params = {}, sessionId) { const id = ++this.id;
        return new Promise((res, rej) => { this.pend.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params, sessionId })); }); }
    on(f) { this.subs.push(f); }
    close() { try { this.ws.close(); } catch (_) {} }
}

const INIT = `window.__V=[];window.__ERR=[];
document.addEventListener('securitypolicyviolation',function(e){ if(window.__V.length<400)
  window.__V.push({d:e.violatedDirective,disp:e.disposition,u:String(e.blockedURI).slice(0,110),s:String(e.sample||'').slice(0,40)});});
window.addEventListener('error',function(e){ if(window.__ERR.length<20) window.__ERR.push(String(e.message).slice(0,120)); });`;

// fire distinct inline handlers without navigating away
const FIRE = `(function(){var A=['onclick','onchange','oninput','onkeydown'];
  var NAV=/location|goHome|navToPage|href|openAllCities|goToPrayerTimes|DetectAndNavigate|detectLocation|fetchCities/i;
  var seen={},fired=0,distinct=0,all=document.querySelectorAll('*');
  for(var i=0;i<all.length&&distinct<20;i++){var el=all[i];
    for(var j=0;j<A.length;j++){ if(!el.hasAttribute(A[j]))continue;
      var b=el.getAttribute(A[j])||''; if(NAV.test(b))continue;
      if(!seen[b]){seen[b]=1;distinct++;}
      try{el.dispatchEvent(new Event(A[j].slice(2),{bubbles:true}));fired++;}catch(e){} }}
  var c=document.querySelector('[data-tp-cookie-settings]');
  if(c){try{c.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));}catch(e){}}
  return JSON.stringify({fired:fired,distinctBodies:distinct,cookieControl:!!c});})()`;

function httpGet(urlPath) {
    return new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port: PORT, path: urlPath, method: 'GET' }, (res) => {
            const c = []; res.on('data', x => c.push(x));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        req.on('error', () => resolve({ status: 0, headers: {}, body: '' }));
        req.end();
    });
}

(async () => {
    console.log('booting local server on ' + PORT + ' ...');
    const srv = spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: { ...process.env, PORT: String(PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0',
               SITE_URL: 'http://127.0.0.1:' + PORT, SUPABASE_URL: '',
               GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' },
        stdio: ['ignore', 'ignore', 'ignore']
    });
    for (let i = 0; i < 150; i++) { const r = await httpGet('/health'); if (r.status === 200) break; await sleep(400); }

    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT,
        '--user-data-dir=C:/Users/Tarek/AppData/Local/Temp/claude/csp-verify',
        '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', 'about:blank'],
        { stdio: ['ignore', 'ignore', 'ignore'] });
    let wsu; const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
        try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version'); if (r.ok) { wsu = (await r.json()).webSocketDebuggerUrl; break; } } catch (_) {}
        await sleep(300);
    }
    const br = await CDP.open(wsu);

    let totalEnforce = 0, totalReport = 0, pagesClean = 0, tokenLeaks = 0, jsErrors = 0;
    const reportKinds = {};

    console.log('\nroute                    st   enforce  report  handlersFired  jsErr  token  nonceOK');
    for (const [name, route] of ROUTES) {
        const { targetId } = await br.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S).catch(() => {});
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S).catch(() => {});
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
        await br.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + route }, S);
        await sleep(6500);
        const ev = async (e) => { try { const r = await br.send('Runtime.evaluate', { expression: e, returnByValue: true }, S); return r.result && r.result.value; } catch (_) { return null; } };
        const fired = await ev(FIRE);
        await sleep(2500);
        const V = JSON.parse(await ev('JSON.stringify(window.__V||[])') || '[]');
        const ERR = JSON.parse(await ev('JSON.stringify(window.__ERR||[])') || '[]');

        const raw = await httpGet(route);
        const hn = (String(raw.headers['content-security-policy-report-only'] || '').match(/'nonce-([^']+)'/) || [])[1] || null;
        const tokenLeft = raw.body.indexOf(TOKEN) !== -1;
        const bodyNonces = [...new Set([...raw.body.matchAll(/nonce="([^"]+)"/g)].map(m => m[1]))];
        const nonceOK = !!hn ? (bodyNonces.length === 0 || (bodyNonces.length === 1 && bodyNonces[0] === hn)) : false;

        const enf = V.filter(v => v.disp === 'enforce').length;
        const rep = V.filter(v => v.disp === 'report').length;
        for (const v of V.filter(x => x.disp === 'report')) {
            const k = v.d + ' <- ' + (v.u === 'inline' ? 'INLINE' : String(v.u).split('?')[0]);
            reportKinds[k] = (reportKinds[k] || 0) + 1;
        }
        totalEnforce += enf; totalReport += rep;
        if (tokenLeft) tokenLeaks++;
        jsErrors += ERR.length;
        if (enf === 0 && !tokenLeft && nonceOK) pagesClean++;

        const f = JSON.parse(fired || '{}');
        console.log('  ' + name.padEnd(22) + String(raw.status).padEnd(5)
            + String(enf).padEnd(9) + String(rep).padEnd(8)
            + String((f.distinctBodies || 0) + '/' + (f.fired || 0)).padEnd(15)
            + String(ERR.length).padEnd(7) + String(tokenLeft ? 'LEAK' : 'no').padEnd(7)
            + (nonceOK ? 'yes' : 'NO'));
        if (ERR.length) console.log('        jsErr: ' + ERR.slice(0, 2).join(' | '));
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
    }

    console.log('\n=== report-only violations by kind (expected, non-breaking) ===');
    for (const k of Object.keys(reportKinds).sort((a, b) => reportKinds[b] - reportKinds[a]))
        console.log('  ' + String(reportKinds[k]).padStart(4) + ' x  ' + k);

    console.log('\n================================================================');
    console.log('  pages fully clean      : ' + pagesClean + '/' + ROUTES.length);
    console.log('  ENFORCED violations    : ' + totalEnforce + '   (MUST be 0 — Phase 1 is non-breaking)');
    console.log('  report-only violations : ' + totalReport + '   (expected: these are what Phase 1 measures)');
    console.log('  raw token leaks        : ' + tokenLeaks + '   (MUST be 0)');
    console.log('  uncaught JS errors     : ' + jsErrors);
    console.log('================================================================');

    try { br.close(); } catch (_) {}
    spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' });
    try { srv.kill('SIGKILL'); } catch (_) {}
    process.exit(totalEnforce === 0 && tokenLeaks === 0 ? 0 : 1);
})();
