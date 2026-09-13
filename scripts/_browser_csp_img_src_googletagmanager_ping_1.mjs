// CSP-IMG-SRC-GOOGLETAGMANAGER-PING-1 — repeated Chromium verification.
//
// F1 is intermittent (the Google tag's https://www.googletagmanager.com/a ping fires on some page loads
// only), so one clean run proves nothing. This harness reloads 9 route families N times in one browser
// profile and records, per load: every CSP violation (split by disposition), every request to
// googletagmanager.com/a with its resource type, status, block reason and initiator, GA /g/collect,
// gtag/dataLayer state and uncaught errors.
//
// It also runs three DETERMINISTIC probes, so the verdict never depends on Google choosing to ping:
//   exact host    https://www.googletagmanager.com/favicon.ico   blocked before the fix, allowed after
//   subdomain     https://tp-csp-probe.googletagmanager.com/...  blocked before AND after (no wildcard)
//   foreign host  https://example.com/...                        blocked before AND after (no bare https:)
// The probes use /favicon.ico, never /a, so no fake analytics ping is ever sent to Google.
//
// Env:
//   TP_F1_ORIGIN=https://timesprayers.com   run read-only against a live origin (no local boot)
//   TP_F1_ROOT=<dir>                        boot server.js from this tree (default: this repo)
//   TP_F1_PORT / TP_F1_CDP_PORT             local server port (8780) / Chrome debugging port (54700)
//   TP_F1_RELOADS (5) · TP_F1_WAIT_MS (12000) · TP_F1_OUT=<json> · TP_F1_LABEL
//   TP_F1_EXPECT=fixed|base|observe         which probe outcome counts as PASS (default observe)
//
// Usage: node scripts/_browser_csp_img_src_googletagmanager_ping_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = process.env.TP_F1_ROOT || REPO;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = Number(process.env.TP_F1_PORT || 8780);
const CDP_PORT = Number(process.env.TP_F1_CDP_PORT || 54700);
const REMOTE = process.env.TP_F1_ORIGIN || '';
const ORIGIN = REMOTE || 'http://127.0.0.1:' + PORT;
const HOST = new URL(ORIGIN).host;
const RELOADS = Number(process.env.TP_F1_RELOADS || 5);
const WAIT_MS = Number(process.env.TP_F1_WAIT_MS || 12000);
const EXPECT = process.env.TP_F1_EXPECT || 'observe';
const LABEL = process.env.TP_F1_LABEL || (REMOTE ? 'remote' : 'local');
setTimeout(() => { console.log('\nWATCHDOG: exceeded budget'); process.exit(3); }, (RELOADS * 9 * (WAIT_MS + 6000)) + 5 * 60 * 1000).unref();

const ROUTES = ['/', '/about-us', '/azkar', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia',
                '/quran', '/guides', '/moon', '/qibla-in-riyadh'];
const F1_PREFIX = 'https://www.googletagmanager.com/a';
const GOOGLE_RE = /google|doubleclick|gstatic|adtrafficquality|googlesyndication|googletagmanager/;
const PROBES = {
    exactHost: 'https://www.googletagmanager.com/favicon.ico?tp-csp-probe=1',
    subdomain: 'https://tp-csp-probe.googletagmanager.com/tp-csp-probe.gif',
    foreign:   'https://example.com/tp-csp-probe.gif',
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
  V: window.__V || [], ERR: window.__ERR || [] })`;

const PROBE = `new Promise(function(done){
  var P = ${JSON.stringify(PROBES)}, start = window.__V.length;
  Object.keys(P).forEach(function(k){ var i = new Image(); i.src = P[k]; });
  setTimeout(function(){
    var out = {};
    Object.keys(P).forEach(function(k){
      var hits = window.__V.slice(start).filter(function(v){ return v.u.indexOf(P[k].split('?')[0]) === 0; });
      out[k] = { enforce: hits.filter(function(v){ return v.disp === 'enforce'; }).length,
                 report: hits.filter(function(v){ return v.disp !== 'enforce'; }).length,
                 directives: hits.map(function(v){ return v.d; }).filter(function(x, i, a){ return a.indexOf(x) === i; }) };
    });
    done(JSON.stringify(out));
  }, 3000);
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
    if (Object.values(PROBES).some(p => u.indexOf(p.split('?')[0]) === 0)) return 'PROBE';
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
    const profile = 'C:/Users/Tarek/AppData/Local/Temp/claude/f1-' + LABEL.replace(/\W/g, '') + '-' + process.pid;
    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + profile,
        '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore'] });
    let wsu; const t0 = Date.now();
    while (Date.now() - t0 < 45000) {
        try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version', { signal: AbortSignal.timeout(1000) }); if (r.ok) { wsu = (await r.json()).webSocketDebuggerUrl; break; } } catch (_) {}
        await sleep(300);
    }
    if (!wsu) { console.log('chrome never came up'); kill(chrome.pid); if (srv) kill(srv.pid); process.exit(2); }
    const br = await CDP.open(wsu);

    // CSP header actually served, for the record
    let servedImgSrc = { enforce: null, report: null };
    try {
        const r = await fetch(ORIGIN + '/', { headers: { 'user-agent': 'Mozilla/5.0 tp-f1-verify' }, signal: AbortSignal.timeout(30000) });
        const pick = (h) => ((String(h || '').match(/(?:^|;)\s*img-src[^;]*/) || [''])[0]).replace(/^;\s*/, '').trim();
        servedImgSrc = { enforce: pick(r.headers.get('content-security-policy')), report: pick(r.headers.get('content-security-policy-report-only')) };
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

    // ---- deterministic probes -------------------------------------------------------------------
    const pt = await openTarget();
    await br.send('Page.navigate', { url: ORIGIN + '/' }, pt.S);
    await sleep(6000);
    const probe = JSON.parse(await ev(pt.S, PROBE, true) || '{}');
    await br.send('Target.closeTarget', { targetId: pt.targetId }).catch(() => {});

    // ---- repeated natural loads ----------------------------------------------------------------
    const loads = [];
    const tot = { enforce: 0, report: 0, byCat: { enforce: {}, report: {} }, jsErr: 0, aRequests: 0, aBlocked: 0, aAllowed: 0, collectOk: 0, collectSeen: 0 };
    const f1Samples = [], otherSamples = [], aSamples = [];
    console.log('=== ' + LABEL + ' @ ' + ORIGIN + '  reloads=' + RELOADS + ' wait=' + WAIT_MS + 'ms ===');
    console.log('  served img-src (enforcing) : ' + servedImgSrc.enforce);
    console.log('  served img-src (report-only): ' + servedImgSrc.report);
    for (let r = 1; r <= RELOADS; r++) {
        for (const route of ROUTES) {
            const { targetId, S } = await openTarget();
            const reqs = new Map(); let status = 0, navTs = null;
            const onNet = m => { if (m.sessionId !== S) return; const p = m.params || {};
                if (m.method === 'Network.requestWillBeSent') {
                    if (p.type === 'Document' && navTs === null) navTs = p.timestamp;
                    const u = p.request.url;
                    if (u.indexOf(F1_PREFIX) === 0 || /\/g\/collect/.test(u)) {
                        const fr = (p.initiator && p.initiator.stack && p.initiator.stack.callFrames && p.initiator.stack.callFrames[0]) || null;
                        reqs.set(p.requestId, { kind: u.indexOf(F1_PREFIX) === 0 ? 'A' : 'COLLECT', type: p.type, t: navTs === null ? null : Math.round((p.timestamp - navTs) * 1000),
                            initiator: fr ? String(fr.url).replace(/^https?:\/\//, '').slice(0, 70) : ((p.initiator && p.initiator.type) || ''),
                            u: u.slice(0, 120), status: null, blocked: null });
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
                if (c === 'F1' && f1Samples.length < 12) f1Samples.push('r' + r + ' ' + route + ' :: ' + d + ' ' + v.d + ' <- ' + v.u.slice(0, 110));
                if (c !== 'F1' && otherSamples.length < 12) otherSamples.push('r' + r + ' ' + route + ' :: ' + c + ' ' + d + ' ' + v.d + ' <- ' + v.u.slice(0, 110));
            }
            const rq = [...reqs.values()];
            const a = rq.filter(x => x.kind === 'A'), col = rq.filter(x => x.kind === 'COLLECT');
            tot.aRequests += a.length; tot.aBlocked += a.filter(x => x.blocked).length; tot.aAllowed += a.filter(x => !x.blocked && x.status).length;
            tot.collectSeen += col.length; tot.collectOk += col.filter(x => x.status === 204 || x.status === 200).length;
            a.forEach(x => { if (aSamples.length < 12) aSamples.push('r' + r + ' ' + route + ' :: type=' + x.type + ' status=' + x.status + ' blocked=' + (x.blocked || '-') + ' t=' + x.t + 'ms init=' + x.initiator + ' ' + x.u.slice(0, 70)); });
            tot.jsErr += (st.ERR || []).length;
            loads.push({ r, route, status, gtag: st.gtag, dataLayer: st.dataLayer, consentDefault: st.consentDefault, cats, jsErr: st.ERR || [],
                         aRequests: a.length, aBlocked: a.filter(x => x.blocked).length, collect: col.map(x => x.status) });
            const f1 = (cats.enforce.F1 || 0) + (cats.report.F1 || 0);
            const other = V.length - f1;
            console.log('  r' + r + ' ' + route.padEnd(30) + ' st=' + status + '  enf=' + Object.values(cats.enforce).reduce((n, x) => n + x, 0)
                + ' rep=' + Object.values(cats.report).reduce((n, x) => n + x, 0) + '  F1=' + f1 + ' other=' + other
                + '  /a req=' + a.length + (a.length ? ' (blocked ' + a.filter(x => x.blocked).length + ')' : '')
                + '  collect=' + JSON.stringify(col.map(x => x.status)) + '  gtag=' + st.gtag + ' dl=' + st.dataLayer + ' err=' + (st.ERR || []).length);
        }
    }

    const f1Enf = tot.byCat.enforce.F1 || 0, f1Rep = tot.byCat.report.F1 || 0;
    const sumExcept = (o, ex) => Object.entries(o).filter(([k]) => !ex.includes(k)).reduce((n, [, x]) => n + x, 0);
    const googleEnf = (tot.byCat.enforce.GOOGLE || 0) + f1Enf, googleRep = (tot.byCat.report.GOOGLE || 0) + f1Rep;
    const unknown = (tot.byCat.enforce.UNKNOWN || 0) + (tot.byCat.report.UNKNOWN || 0);
    const gtagOk = loads.every(l => l.gtag === 'function' && l.dataLayer > 0 && l.consentDefault >= 1);
    const statusOk = loads.every(l => l.status === 200);

    console.log('\n  deterministic probes: ' + JSON.stringify(probe));
    if (f1Samples.length) { console.log('\n  F1 samples:'); f1Samples.forEach(s => console.log('    - ' + s)); }
    if (otherSamples.length) { console.log('\n  OTHER violation samples:'); otherSamples.forEach(s => console.log('    - ' + s)); }
    if (aSamples.length) { console.log('\n  googletagmanager.com/a requests:'); aSamples.forEach(s => console.log('    - ' + s)); }

    console.log('\n================================================================');
    console.log('  RUN                          : ' + LABEL + '  (' + loads.length + ' loads = ' + ROUTES.length + ' routes x ' + RELOADS + ')');
    console.log('  ENFORCED VIOLATIONS          : ' + tot.enforce);
    console.log('  REPORT-ONLY VIOLATIONS       : ' + tot.report);
    console.log('  GOOGLE VIOLATIONS            : enforce ' + googleEnf + ' · report ' + googleRep);
    console.log('  UNKNOWN VIOLATIONS           : ' + unknown);
    console.log('  F1 (' + F1_PREFIX + ') : enforce ' + f1Enf + ' · report ' + f1Rep);
    console.log('  other (non-F1) violations    : enforce ' + sumExcept(tot.byCat.enforce, ['F1']) + ' · report ' + sumExcept(tot.byCat.report, ['F1']));
    console.log('  /a requests seen             : ' + tot.aRequests + '  (blocked ' + tot.aBlocked + ', allowed ' + tot.aAllowed + ')');
    console.log('  GA /g/collect                : ' + tot.collectOk + ' ok of ' + tot.collectSeen + ' seen');
    console.log('  gtag function + dataLayer + consent default on every load : ' + gtagOk);
    console.log('  every document 200          : ' + statusOk);
    console.log('  UNCAUGHT JS ERRORS           : ' + tot.jsErr);

    let passed = true;
    const pr = probe || {};
    const blocked = (k) => pr[k] && pr[k].enforce >= 1 && pr[k].report >= 1;
    const allowed = (k) => pr[k] && pr[k].enforce === 0 && pr[k].report === 0;
    const nonF1 = sumExcept(tot.byCat.enforce, ['F1']) + sumExcept(tot.byCat.report, ['F1']);
    if (EXPECT === 'fixed') {
        // The verdict is about F1 only. Any other violation is a SEPARATE finding: it is printed below and in
        // OTHER samples, never folded into (or hidden by) the F1 verdict.
        passed = allowed('exactHost') && blocked('subdomain') && blocked('foreign') && f1Enf === 0 && f1Rep === 0
            && tot.jsErr === 0 && gtagOk && statusOk;
    } else if (EXPECT === 'base') {
        passed = blocked('exactHost') && blocked('subdomain') && blocked('foreign');
    }
    console.log('  F1 VERDICT  EXPECT=' + EXPECT + '  ->  ' + (EXPECT === 'observe' ? 'OBSERVED' : (passed ? 'PASS' : 'FAIL')));
    console.log('  NON-F1 VIOLATIONS            : ' + nonF1 + (nonF1 ? '   <- SEPARATE FINDING (see OTHER samples); NOT closed by this ticket' : ''));
    console.log('================================================================');
    if (process.env.TP_F1_OUT) fs.writeFileSync(process.env.TP_F1_OUT, JSON.stringify({ label: LABEL, origin: ORIGIN, servedImgSrc, probe, tot, loads, f1Samples, otherSamples, aSamples }, null, 1));
    br.close(); kill(chrome.pid); if (srv) kill(srv.pid);
    process.exit(passed ? 0 : 1);
})();
