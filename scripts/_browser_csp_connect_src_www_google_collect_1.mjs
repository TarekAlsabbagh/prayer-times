// CSP-CONNECT-SRC-WWW-GOOGLE-COLLECT-1 — deterministic Chromium probe on a LOCAL server, ZERO external traffic.
//
// Live ads are running on production, so this test never loads production and never lets a Google request leave the
// machine: every ads / analytics / fonts host AND every probe URL is blocked at the network layer with
// Network.setBlockedURLs. CSP is evaluated in the renderer BEFORE the network layer, so the verdict comes only from
// securitypolicyviolation events: a probe that raises no violation was allowed by CSP (and then dropped by the
// network block); a probe that raises one was blocked by CSP.
//
//   connectExact      fetch https://www.google.com/tp-csp-probe                 base: BLOCKED · fixed: ALLOWED
//   connectSubdomain  fetch https://tp-csp-probe.google.com/tp-csp-probe        BLOCKED in both (no *.google.com)
//   connectCcTld      fetch https://www.google.com.sa/tp-csp-probe              BLOCKED in both (no google.<ccTLD>)
//   connectForeign    fetch https://example.com/tp-csp-probe                    BLOCKED in both (no bare https:)
//   csiGuard          fetch https://csi.gstatic.com/tp-csp-probe                ALLOWED in both (CSI stays closed)
//   f1Guard           img   https://www.googletagmanager.com/favicon.ico?tp-csp-probe=1   ALLOWED in both (F1 stays closed)
//   imgUnchanged      img   https://www.google.com/favicon.ico?tp-csp-probe=1   BLOCKED in both (img-src NOT widened)
//
// Env: TP_WGC_ROOT (tree to boot, default this repo) · TP_WGC_PORT (8808) · TP_WGC_CDP_PORT (45808, below the Windows
//      ephemeral range) · TP_WGC_EXPECT=fixed|base · TP_WGC_LABEL
// Usage: TP_WGC_EXPECT=fixed node scripts/_browser_csp_connect_src_www_google_collect_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = process.env.TP_WGC_ROOT || REPO;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = Number(process.env.TP_WGC_PORT || 8808);
const CDP_PORT = Number(process.env.TP_WGC_CDP_PORT || 45808);
const ORIGIN = 'http://127.0.0.1:' + PORT;
const EXPECT = process.env.TP_WGC_EXPECT || 'fixed';
const LABEL = process.env.TP_WGC_LABEL || EXPECT;
const ROUTES = ['/', '/quran/al-fatihah'];
setTimeout(() => { console.log('WATCHDOG'); process.exit(3); }, 5 * 60 * 1000).unref();

const BLOCK = ['*tp-csp-probe*', '*googlesyndication.com*', '*doubleclick.net*', '*fundingchoicesmessages.google.com*', '*adtrafficquality.google*',
    '*google-analytics.com*', '*analytics.google.com*', '*googletagmanager.com*', '*gstatic.com*', '*googleapis.com*', '*://www.google.com/*', '*googleadservices.com*'];
const PROBES = {
    connectExact:     { kind: 'connect', url: 'https://www.google.com/tp-csp-probe', fixed: 'allowed', base: 'blocked' },
    connectSubdomain: { kind: 'connect', url: 'https://tp-csp-probe.google.com/tp-csp-probe', fixed: 'blocked', base: 'blocked' },
    connectCcTld:     { kind: 'connect', url: 'https://www.google.com.sa/tp-csp-probe', fixed: 'blocked', base: 'blocked' },
    connectForeign:   { kind: 'connect', url: 'https://example.com/tp-csp-probe', fixed: 'blocked', base: 'blocked' },
    csiGuard:         { kind: 'connect', url: 'https://csi.gstatic.com/tp-csp-probe', fixed: 'allowed', base: 'allowed' },
    f1Guard:          { kind: 'img', url: 'https://www.googletagmanager.com/favicon.ico?tp-csp-probe=1', fixed: 'allowed', base: 'allowed' },
    imgUnchanged:     { kind: 'img', url: 'https://www.google.com/favicon.ico?tp-csp-probe=1', fixed: 'blocked', base: 'blocked' },
};

class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.subs = [];
        ws.onmessage = ev => { const m = JSON.parse(ev.data);
            if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); clearTimeout(p.t); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
            else this.subs.forEach(f => { try { f(m); } catch (_) {} }); };
        ws.onclose = () => { for (const [, p] of this.pend) { clearTimeout(p.t); p.rej(new Error('socket closed')); } this.pend.clear(); }; }
    static async open(u) { const ws = new WebSocket(u); await Promise.race([new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('ws')); }), sleep(10000).then(() => { throw new Error('ws timeout'); })]); return new CDP(ws); }
    send(m, p = {}, s, ms = 20000) { const id = ++this.id; return new Promise((res, rej) => { const t = setTimeout(() => { this.pend.delete(id); rej(new Error('timeout ' + m)); }, ms); this.pend.set(id, { res, rej, t }); this.ws.send(JSON.stringify({ id, method: m, params: p, sessionId: s })); }); }
}
const INIT = `window.__V=[];window.__ERR=[];document.addEventListener('securitypolicyviolation',function(e){window.__V.push({d:e.effectiveDirective,disp:e.disposition,u:String(e.blockedURI)});});
window.addEventListener('error',function(e){ if(e && e.target && e.target!==window) return; window.__ERR.push(String(e.message).slice(0,160)); });`;
const get = (p) => new Promise((resolve) => { const r = http.request({ host: '127.0.0.1', port: PORT, path: p }, (x) => { x.resume(); x.on('end', () => resolve(x.statusCode)); }); r.on('error', () => resolve(0)); r.end(); });
const kill = (pid) => { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} };

let srv = null, chrome = null, passed = true;
try {
    const env = { ...process.env, PORT: String(PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
    delete env.TP_ENABLE_SEARCH_TEST;
    srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
    let up = false; for (let i = 0; i < 250 && !up; i++) { up = (await get('/health')) === 200; if (!up) await sleep(400); }
    if (!up) throw new Error('server never became healthy');
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=C:/Users/Tarek/AppData/Local/Temp/claude/wgc-' + process.pid, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
    let wsu; for (let i = 0; i < 150 && !wsu; i++) { try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version'); if (r.ok) wsu = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!wsu) await sleep(300); }
    if (!wsu) throw new Error('chrome never came up');
    const br = await CDP.open(wsu);
    const agg = {}; let externalLeaks = 0, siteViolations = 0, jsErr = 0; const leakUrls = [], otherHosts = new Set();
    console.log('=== ' + LABEL + ' @ ' + ORIGIN + ' (root ' + ROOT + ') expect=' + EXPECT + ' ===');
    for (const route of ROUTES) {
        const { targetId } = await br.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
        const sent = [];
        const on = (m) => { if (m.sessionId !== S) return;
            if (m.method === 'Network.requestWillBeSent') { const u = m.params.request.url; if (!u.startsWith(ORIGIN) && !u.startsWith('data:') && !u.startsWith('blob:')) sent.push(u); }
            if (m.method === 'Network.responseReceived') { const u = m.params.response.url; if (u.startsWith(ORIGIN) || u.startsWith('data:') || !m.params.response.status) return;
                let host = ''; try { host = new URL(u).hostname; } catch (_) {}
                if (/google|gstatic|doubleclick|googlesyndication|googletagmanager|adtrafficquality/.test(host) || u.includes('tp-csp-probe')) { externalLeaks++; leakUrls.push(u.slice(0, 120)); }
                else otherHosts.add(host); } };
        br.subs.push(on);
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S);
        await br.send('Network.setBlockedURLs', { urls: BLOCK }, S);
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
        await br.send('Page.navigate', { url: ORIGIN + route }, S);
        await sleep(6000);
        const policy = (await br.send('Runtime.evaluate', { expression: 'fetch(location.href,{cache:"no-store"}).then(r=>r.headers.get("content-security-policy"))', awaitPromise: true, returnByValue: true }, S)).result.value || '';
        const conn = (String(policy).split(';').map(s => s.trim()).find(s => s.startsWith('connect-src')) || '');
        const run = `(function(P){ var out={}; var ps=Object.keys(P).map(function(k){ var p=P[k]; if(p.kind==='img'){ return new Promise(function(r){ var i=new Image(); i.onload=i.onerror=function(){r();}; i.src=p.url; setTimeout(r,2500); }); } return fetch(p.url,{mode:'no-cors',credentials:'omit',cache:'no-store'}).then(function(){},function(){}); }); return Promise.all(ps).then(function(){ return new Promise(function(r){ setTimeout(r,1500); }); }).then(function(){ Object.keys(P).forEach(function(k){ var u=P[k].url; var v=window.__V.filter(function(x){ return x.u===u || x.u.indexOf(u.split('?')[0])===0; }); out[k]={ enforce:v.filter(function(x){return x.disp==='enforce';}).length, report:v.filter(function(x){return x.disp!=='enforce';}).length, directives:[...new Set(v.map(function(x){return x.d;}))] }; }); out.__siteViolations=window.__V.filter(function(x){ return x.u.indexOf('tp-csp-probe')<0; }); out.__err=window.__ERR; return JSON.stringify(out); }); })(${JSON.stringify(PROBES)})`;
        const res = JSON.parse((await br.send('Runtime.evaluate', { expression: run, awaitPromise: true, returnByValue: true }, S, 30000)).result.value);
        siteViolations += res.__siteViolations.length; jsErr += res.__err.length;
        console.log('\n  ' + route + '   served connect-src has www.google.com: ' + /https:\/\/www\.google\.com(\s|$)/.test(conn));
        for (const k of Object.keys(PROBES)) {
            // Both headers carry the identical policy, so ANY violation means blocked. Chrome can collapse the duplicate
            // report for an image to a single event (observed: img probes report 1 event, fetch probes 2) — allowed stays strict (0 and 0).
            const r = res[k], outcome = r.enforce + r.report >= 1 ? 'blocked' : 'allowed';
            const want = PROBES[k][EXPECT]; const good = outcome === want;
            if (!good) passed = false;
            agg[k] = agg[k] || []; agg[k].push(outcome);
            console.log('    ' + (good ? '✓' : '✗') + ' ' + k.padEnd(17) + outcome.padEnd(8) + ' (want ' + want + ')  enforce=' + r.enforce + ' report=' + r.report + ' ' + r.directives.join(',') + '   ' + PROBES[k].url);
        }
        console.log('    non-probe CSP violations: ' + res.__siteViolations.length + (res.__siteViolations.length ? ' ' + JSON.stringify(res.__siteViolations.slice(0, 3)) : '') + '   JS errors: ' + res.__err.length + '   external requests attempted (all network-blocked): ' + sent.length);
        br.subs = br.subs.filter(f => f !== on);
        await br.send('Target.closeTarget', { targetId }).catch(() => {});
    }
    if (siteViolations !== 0 || jsErr !== 0 || externalLeaks !== 0) passed = false;
    console.log('\n================================================================');
    console.log('  RUN ' + LABEL + '  expect=' + EXPECT + '  routes=' + ROUTES.length);
    console.log('  probe outcomes: ' + JSON.stringify(agg));
    console.log('  non-probe CSP violations: ' + siteViolations + '   JS errors: ' + jsErr + '   Google/probe responses received (must be 0): ' + externalLeaks + (leakUrls.length ? ' ' + JSON.stringify(leakUrls) : ''));
    console.log('  non-Google site third parties reached (informational, no ads/analytics): ' + ([...otherHosts].join(', ') || 'none'));
    console.log('  VERDICT  ->  ' + (passed ? 'PASS' : 'FAIL'));
    console.log('================================================================');
    try { br.ws.close(); } catch (_) {}
} catch (e) { passed = false; console.log('HARNESS: ' + e.message); }
finally { if (chrome) kill(chrome.pid); if (srv) kill(srv.pid); }
process.exit(passed ? 0 : 1);
