// CSP-CONNECT-SRC-CSI-GSTATIC-PING-1 — repeated Chromium verification.
//
// The AdSense CSI (client-side instrumentation) ping to https://csi.gstatic.com/csi is intermittent, so one clean
// run proves nothing. This harness reloads 9 route families N times in one browser profile and records, per load:
// every CSP violation (split by disposition), every request to csi.gstatic.com (resource type, status, block
// reason, initiator stack), the F1 googletagmanager.com/a ping (must stay unblocked), GA /g/collect, gtag /
// dataLayer / adsbygoogle state and uncaught errors.
//
// DETERMINISTIC probes, so the verdict never depends on Google choosing to ping. They send NO data: a bare
// fetch(url, {mode:'no-cors', credentials:'omit'}) to a path that is not the /csi endpoint.
//   connect exact host   https://csi.gstatic.com/tp-csp-probe                 blocked before the fix, allowed after
//   connect subdomain    https://tp-csp-probe.gstatic.com/tp-csp-probe        blocked before AND after (no *.gstatic.com)
//   connect foreign      https://example.com/tp-csp-probe                     blocked before AND after (no bare https:)
//   F1 guard (img-src)   https://www.googletagmanager.com/favicon.ico?tp-csp-probe=1   allowed (F1 stays closed)
//
// Env: TP_F3_ORIGIN (remote, no boot) · TP_F3_ROOT (tree to boot) · TP_F3_PORT (8800) · TP_F3_CDP_PORT (54800)
//      TP_F3_RELOADS (5; 0 = probes only) · TP_F3_WAIT_MS (12000) · TP_F3_OUT · TP_F3_LABEL · TP_F3_EXPECT=fixed|base|observe
//
// Usage: node scripts/_browser_csp_connect_src_csi_gstatic_ping_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = process.env.TP_F3_ROOT || REPO;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = Number(process.env.TP_F3_PORT || 8800);
const CDP_PORT = Number(process.env.TP_F3_CDP_PORT || 54800);
const REMOTE = process.env.TP_F3_ORIGIN || '';
const ORIGIN = REMOTE || 'http://127.0.0.1:' + PORT;
const HOST = new URL(ORIGIN).host;
const RELOADS = Number(process.env.TP_F3_RELOADS ?? 5);
const WAIT_MS = Number(process.env.TP_F3_WAIT_MS || 12000);
const EXPECT = process.env.TP_F3_EXPECT || 'observe';
const LABEL = process.env.TP_F3_LABEL || (REMOTE ? 'remote' : 'local');
setTimeout(() => { console.log('\nWATCHDOG: exceeded budget'); process.exit(3); }, (RELOADS * 9 * (WAIT_MS + 6000)) + 5 * 60 * 1000).unref();

const ROUTES = ['/', '/about-us', '/azkar', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia',
                '/quran', '/guides', '/moon', '/qibla-in-riyadh'];
const CSI_HOST = 'https://csi.gstatic.com/';
const F1_PREFIX = 'https://www.googletagmanager.com/a';
const GOOGLE_RE = /google|doubleclick|gstatic|adtrafficquality|googlesyndication|googletagmanager/;
const PROBES = {
    connectExact:     { kind: 'connect', url: 'https://csi.gstatic.com/tp-csp-probe' },
    connectSubdomain: { kind: 'connect', url: 'https://tp-csp-probe.gstatic.com/tp-csp-probe' },
    connectForeign:   { kind: 'connect', url: 'https://example.com/tp-csp-probe' },
    f1ImgExact:       { kind: 'img',     url: 'https://www.googletagmanager.com/favicon.ico?tp-csp-probe=1' },
};

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
    off(f) { this.subs = this.subs.filter(x => x !== f); }
    close() { try { this.ws.close(); } catch (_) {} }
}

const INIT = `window.__V=[];window.__ERR=[];
document.addEventListener('securitypolicyviolation',function(e){ if(window.__V.length<400)
  window.__V.push({t:Math.round(performance.now()),d:e.effectiveDirective,disp:e.disposition,u:String(e.blockedURI).slice(0,220)});});
window.addEventListener('error',function(e){ if(window.__ERR.length<30) window.__ERR.push(String(e.message).slice(0,160)); });`;

const STATE = `JSON.stringify({ gtag: typeof window.gtag, dataLayer: (window.dataLayer||[]).length,
  consentDefault: (window.dataLayer||[]).filter(function(a){ try { return a[0]==='consent' && a[1]==='default'; } catch(e){ return false; } }).length,
  adsbygoogle: typeof window.adsbygoogle, adsenseTag: !!document.querySelector('script[src*="adsbygoogle.js?client="]'),
  V: window.__V || [], ERR: window.__ERR || [] })`;

const PROBE = `new Promise(function(done){
  var P = ${JSON.stringify(PROBES)}, start = window.__V.length;
  Object.keys(P).forEach(function(k){
    if (P[k].kind === 'img') { var i = new Image(); i.src = P[k].url; }
    else { try { fetch(P[k].url, { mode: 'no-cors', credentials: 'omit', cache: 'no-store' }).catch(function(){}); } catch (e) {} }
  });
  setTimeout(function(){
    var out = {};
    Object.keys(P).forEach(function(k){
      var base = P[k].url.split('?')[0];
      var hits = window.__V.slice(start).filter(function(v){ return v.u.indexOf(base) === 0; });
      out[k] = { enforce: hits.filter(function(v){ return v.disp === 'enforce'; }).length, report: hits.filter(function(v){ return v.disp !== 'enforce'; }).length,
                 directives: hits.map(function(v){ return v.d; }).filter(function(x, i, a){ return a.indexOf(x) === i; }) };
    });
    done(JSON.stringify(out));
  }, 3500);
})`;

function httpGet(p) {
    return new Promise((resolve) => {
        const req = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'GET' }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
        req.on('error', () => resolve(0)); req.end();
    });
}
function kill(pid) { try { execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
function classify(v) {
    const u = String(v.u || '');
    if (/tp-csp-probe|example\.com/.test(u)) return 'PROBE';
    if (u.indexOf(CSI_HOST) === 0) return 'CSI';
    if (u.indexOf(F1_PREFIX) === 0) return 'F1';
    if (GOOGLE_RE.test(u)) return 'GOOGLE';
    if (u.includes(HOST) || u === 'inline' || u === 'eval') return 'SITE';
    return 'UNKNOWN';
}

(async () => {
    let srv = null;
    if (!REMOTE) {
        const env = { ...process.env, PORT: String(PORT), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: ORIGIN, SUPABASE_URL: '',
                      GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
        delete env.TP_ENABLE_SEARCH_TEST;
        srv = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
        let up = false;
        for (let i = 0; i < 200 && !up; i++) { up = (await httpGet('/health')) === 200; if (!up) await sleep(400); }
        if (!up) { console.log('server never became healthy'); kill(srv.pid); process.exit(2); }
    }
    const profile = 'C:/Users/Tarek/AppData/Local/Temp/claude/f3-' + LABEL.replace(/\W/g, '') + '-' + process.pid;
    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + profile,
        '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
    let wsu; const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
        try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version', { signal: AbortSignal.timeout(1000) }); if (r.ok) { wsu = (await r.json()).webSocketDebuggerUrl; break; } } catch (_) {}
        await sleep(300);
    }
    if (!wsu) { console.log('chrome never came up'); kill(chrome.pid); if (srv) kill(srv.pid); process.exit(2); }
    const br = await CDP.open(wsu);

    let served = { enforce: null, report: null };
    try {
        const r = await fetch(ORIGIN + '/', { headers: { 'user-agent': 'Mozilla/5.0 tp-f3-verify' }, signal: AbortSignal.timeout(30000) });
        const pick = (h) => ((String(h || '').match(/(?:^|;)\s*connect-src[^;]*/) || [''])[0]).replace(/^;\s*/, '').trim();
        served = { enforce: pick(r.headers.get('content-security-policy')), report: pick(r.headers.get('content-security-policy-report-only')) };
        await r.arrayBuffer();
    } catch (_) {}

    async function openTarget() {
        const { targetId } = await br.send('Target.createTarget', { url: 'about:blank' });
        const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
        for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S).catch(() => {});
        await br.send('Network.setBypassServiceWorker', { bypass: true }, S).catch(() => {});
        await br.send('Page.addScriptToEvaluateOnNewDocument', { source: INIT }, S);
        return { targetId, S };
    }
    const ev = async (S, e, aw = false) => { try { const r = await br.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: aw }, S); return r.result && r.result.value; } catch (_) { return null; } };

    const pt = await openTarget();
    await br.send('Page.navigate', { url: ORIGIN + '/' }, pt.S);
    await sleep(6000);
    const probe = JSON.parse(await ev(pt.S, PROBE, true) || '{}');
    await br.send('Target.closeTarget', { targetId: pt.targetId }).catch(() => {});

    const loads = [];
    const tot = { enforce: 0, report: 0, byCat: { enforce: {}, report: {} }, jsErr: 0, csiReq: 0, csiBlocked: 0, csiAllowed: 0, aReq: 0, aBlocked: 0, collectOk: 0, collectSeen: 0 };
    const csiSamples = [], otherSamples = [], csiReqSamples = [];
    console.log('=== ' + LABEL + ' @ ' + ORIGIN + '  reloads=' + RELOADS + ' wait=' + WAIT_MS + 'ms ===');
    console.log('  served connect-src (enforcing) : ' + served.enforce);
    console.log('  served connect-src (report-only): ' + served.report);
    for (let r = 1; r <= RELOADS; r++) {
        for (const route of ROUTES) {
            const { targetId, S } = await openTarget();
            const reqs = new Map(); let status = 0, navTs = null;
            const onNet = m => { if (m.sessionId !== S) return; const p = m.params || {};
                if (m.method === 'Network.requestWillBeSent') {
                    if (p.type === 'Document' && navTs === null) navTs = p.timestamp;
                    const u = p.request.url;
                    const kind = u.indexOf(CSI_HOST) === 0 ? 'CSI' : (u.indexOf(F1_PREFIX) === 0 ? 'A' : (/\/g\/collect/.test(u) ? 'COLLECT' : null));
                    if (kind) {
                        const frames = (p.initiator && p.initiator.stack && p.initiator.stack.callFrames) || [];
                        reqs.set(p.requestId, { kind, type: p.type, t: navTs === null ? null : Math.round((p.timestamp - navTs) * 1000),
                            initiator: frames.length ? frames.slice(0, 3).map(f => String(f.url).replace(/^https?:\/\//, '').replace(/\?.*$/, '').slice(0, 80)).join(' < ') : ((p.initiator && p.initiator.type) || ''),
                            u: u.slice(0, 130), status: null, blocked: null });
                    }
                }
                if (m.method === 'Network.responseReceived') { if (p.type === 'Document' && !status) status = p.response.status; if (reqs.has(p.requestId)) reqs.get(p.requestId).status = p.response.status; }
                if (m.method === 'Network.loadingFailed' && reqs.has(p.requestId)) reqs.get(p.requestId).blocked = (p.blockedReason || '') + (p.errorText ? ' ' + p.errorText : '');
            };
            br.on(onNet);
            await br.send('Page.navigate', { url: ORIGIN + route }, S);
            await sleep(WAIT_MS);
            const st = JSON.parse(await ev(S, STATE) || '{}');
            br.off(onNet);
            await br.send('Target.closeTarget', { targetId }).catch(() => {});

            const V = st.V || [];
            const cats = { enforce: {}, report: {} };
            for (const v of V) {
                const c = classify(v), d = v.disp === 'enforce' ? 'enforce' : 'report';
                cats[d][c] = (cats[d][c] || 0) + 1; tot.byCat[d][c] = (tot.byCat[d][c] || 0) + 1; tot[d]++;
                if (c === 'CSI' && csiSamples.length < 12) csiSamples.push('r' + r + ' ' + route + ' :: ' + d + ' ' + v.d + ' <- ' + v.u.slice(0, 110));
                if (c !== 'CSI' && otherSamples.length < 12) otherSamples.push('r' + r + ' ' + route + ' :: ' + c + ' ' + d + ' ' + v.d + ' <- ' + v.u.slice(0, 110));
            }
            const rq = [...reqs.values()];
            const csi = rq.filter(x => x.kind === 'CSI'), a = rq.filter(x => x.kind === 'A'), col = rq.filter(x => x.kind === 'COLLECT');
            const cspBlocked = (x) => !!(x.blocked && /csp/i.test(x.blocked));
            tot.csiReq += csi.length; tot.csiBlocked += csi.filter(cspBlocked).length; tot.csiAllowed += csi.filter(x => !cspBlocked(x)).length;
            tot.aReq += a.length; tot.aBlocked += a.filter(cspBlocked).length;
            tot.collectSeen += col.length; tot.collectOk += col.filter(x => x.status === 204 || x.status === 200).length;
            csi.forEach(x => { if (csiReqSamples.length < 12) csiReqSamples.push('r' + r + ' ' + route + ' :: type=' + x.type + ' status=' + x.status + ' blocked=' + (x.blocked || '-') + ' t=' + x.t + 'ms init=' + x.initiator + ' ' + x.u.slice(0, 80)); });
            tot.jsErr += (st.ERR || []).length;
            loads.push({ r, route, status, gtag: st.gtag, dataLayer: st.dataLayer, consentDefault: st.consentDefault, adsbygoogle: st.adsbygoogle, adsenseTag: st.adsenseTag,
                         cats, jsErr: st.ERR || [], csiReq: csi.length, csiBlocked: csi.filter(cspBlocked).length, aReq: a.length, collect: col.map(x => x.status) });
            const csiV = (cats.enforce.CSI || 0) + (cats.report.CSI || 0);
            console.log('  r' + r + ' ' + route.padEnd(30) + ' st=' + status + '  enf=' + Object.values(cats.enforce).reduce((n, x) => n + x, 0)
                + ' rep=' + Object.values(cats.report).reduce((n, x) => n + x, 0) + '  CSI=' + csiV + ' other=' + (V.length - csiV)
                + '  csi req=' + csi.length + (csi.length ? ' (csp-blocked ' + csi.filter(cspBlocked).length + ')' : '')
                + '  /a=' + a.length + '  collect=' + JSON.stringify(col.map(x => x.status)) + '  gtag=' + st.gtag + ' ads=' + st.adsbygoogle + ' err=' + (st.ERR || []).length);
        }
    }

    const sumExcept = (o, ex) => Object.entries(o).filter(([k]) => !ex.includes(k)).reduce((n, [, x]) => n + x, 0);
    const csiE = tot.byCat.enforce.CSI || 0, csiR = tot.byCat.report.CSI || 0;
    const f1E = tot.byCat.enforce.F1 || 0, f1R = tot.byCat.report.F1 || 0;
    const googleE = (tot.byCat.enforce.GOOGLE || 0) + csiE + f1E, googleR = (tot.byCat.report.GOOGLE || 0) + csiR + f1R;
    const unknown = (tot.byCat.enforce.UNKNOWN || 0) + (tot.byCat.report.UNKNOWN || 0);
    const googleOk = loads.every(l => l.gtag === 'function' && l.dataLayer > 0 && l.consentDefault >= 1 && l.adsbygoogle === 'object' && l.adsenseTag);
    const statusOk = loads.every(l => l.status === 200);

    console.log('\n  deterministic probes: ' + JSON.stringify(probe));
    if (csiSamples.length) { console.log('\n  CSI violation samples:'); csiSamples.forEach(s => console.log('    - ' + s)); }
    if (otherSamples.length) { console.log('\n  OTHER violation samples:'); otherSamples.forEach(s => console.log('    - ' + s)); }
    if (csiReqSamples.length) { console.log('\n  csi.gstatic.com requests:'); csiReqSamples.forEach(s => console.log('    - ' + s)); }

    console.log('\n================================================================');
    console.log('  RUN                          : ' + LABEL + '  (' + loads.length + ' loads)');
    console.log('  TOTAL ENFORCED VIOLATIONS    : ' + tot.enforce);
    console.log('  CSI VIOLATIONS               : enforce ' + csiE + ' · report ' + csiR);
    console.log('  NON-CSI ENFORCED VIOLATIONS  : ' + (tot.enforce - csiE));
    console.log('  TOTAL REPORT-ONLY VIOLATIONS : ' + tot.report);
    console.log('  GOOGLE VIOLATIONS            : enforce ' + googleE + ' · report ' + googleR);
    console.log('  UNKNOWN VIOLATIONS           : ' + unknown);
    console.log('  F1 (googletagmanager /a)     : enforce ' + f1E + ' · report ' + f1R + '   /a requests ' + tot.aReq + ' (csp-blocked ' + tot.aBlocked + ')');
    console.log('  csi.gstatic.com REQUESTS     : ' + tot.csiReq + '  (csp-blocked ' + tot.csiBlocked + ', not blocked ' + tot.csiAllowed + ')');
    console.log('  GA /g/collect                : ' + tot.collectOk + ' ok of ' + tot.collectSeen + ' seen');
    console.log('  gtag+dataLayer+consent+adsbygoogle+AdSense tag on every load : ' + googleOk);
    console.log('  UNCAUGHT JS ERRORS           : ' + tot.jsErr);

    const pr = probe || {};
    const blocked = (k) => pr[k] && pr[k].enforce >= 1 && pr[k].report >= 1;
    const allowed = (k) => pr[k] && pr[k].enforce === 0 && pr[k].report === 0;
    let passed = true;
    if (EXPECT === 'fixed') {
        // Verdict is about CSI only; every other violation is printed as a SEPARATE finding, never folded in.
        passed = allowed('connectExact') && blocked('connectSubdomain') && blocked('connectForeign') && allowed('f1ImgExact')
            && csiE === 0 && csiR === 0 && tot.csiBlocked === 0 && f1E === 0 && f1R === 0 && tot.jsErr === 0 && googleOk && statusOk;
    } else if (EXPECT === 'base') {
        passed = blocked('connectExact') && blocked('connectSubdomain') && blocked('connectForeign') && allowed('f1ImgExact');
    }
    console.log('  CSI VERDICT  EXPECT=' + EXPECT + '  ->  ' + (EXPECT === 'observe' ? 'OBSERVED' : (passed ? 'PASS' : 'FAIL')));
    const nonCsi = sumExcept(tot.byCat.enforce, ['CSI']) + sumExcept(tot.byCat.report, ['CSI']);
    console.log('  NON-CSI VIOLATIONS           : ' + nonCsi + (nonCsi ? '   <- SEPARATE FINDING (see OTHER samples)' : ''));
    console.log('================================================================');
    if (process.env.TP_F3_OUT) fs.writeFileSync(process.env.TP_F3_OUT, JSON.stringify({ label: LABEL, origin: ORIGIN, served, probe, tot, loads, csiSamples, otherSamples, csiReqSamples }, null, 1));
    br.close(); kill(chrome.pid); if (srv) kill(srv.pid);
    process.exit(passed ? 0 : 1);
})();
