// ADSENSE-STRICT-CSP-MIGRATION-1 — PHASE 2 ENFORCEMENT — smoke + integration suite.
//
// Phase 2 promotes the approved strict target (the Report-Only policy that passed the Final Pre-Enforcement Gate)
// to the ENFORCING Content-Security-Policy, built once per response and sent in both headers.
//
//   [A] enforcing header carries a 128-bit nonce
//   [B] Report-Only header === enforcing header, byte for byte (same directives, same nonce)
//   [H] enforcing nonce === every executable <script> nonce on the page
//   [P] every route receives the nonce: no placeholder leak, no un-nonced executable script, no nonce on data blocks
//   [N] nonces differ across sequential and concurrent responses
//   [D] 'strict-dynamic', 'unsafe-eval', script-src-attr 'unsafe-inline', worker-src 'self', base-uri 'self', object-src 'none'
//   [F] F1 host https://www.googletagmanager.com in img-src exactly once
//   [I] CSI host https://csi.gstatic.com in connect-src exactly once
//   [K] new enforcing policy === the approved target (base Report-Only) byte for byte, nonce-normalised, every route/region
//   [M] Consent Mode, AdSense page tag, CMP binding, footer-cookie.js, Cookie Settings: identical to base
//   [R] routing + SEO head identical to base
//   [W] sw.js byte-identical to base; SSR-cache nonce bypass still on
//   [S] the diff has the approved shape (server.js CSP block only; target policy lines untouched)
//   [C] real browser: a nonce-less inline canary is BLOCKED by the enforced policy while nonce'd scripts run
//
// [K][M][R] compare against a BASE server (commit 3abc6e0): TP_BASE_URL (running) or TP_BASE_ROOT (booted here).
// Usage: TP_BASE_ROOT=<base checkout> node scripts/_smoke_adsense_strict_csp_phase_2_enforcement.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '3abc6e0';
const TOKEN = '__TP_CSP_NONCE__';
const AFTER_PORT = Number(process.env.TP_P2_SMOKE_PORT || 8850);
const BASE_PORT = 8851;
const CDP_PORT = Number(process.env.TP_P2_CDP_PORT || 54990);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ALLOWED = new Set(['server.js', 'scripts/_smoke_adsense_strict_csp_phase_2_enforcement.mjs',
    'scripts/_red_adsense_strict_csp_phase_2_enforcement.mjs', 'scripts/_browser_adsense_strict_csp_phase_2_enforcement.mjs']);
const ROUTES = ['/', '/en', '/about-us', '/contact', '/privacy', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/prayer-times-worldwide',
    '/quran', '/quran/al-fatihah', '/guides', '/guides/why-prayer-times-differ', '/azkar', '/moon', '/moon/saudi-arabia/riyadh/today', '/qibla-in-riyadh',
    '/next-prayer-in-riyadh', '/time-left-until-next-prayer-in-riyadh', '/zz-no-such-page/xyz'];
const REGION_ROUTES = ['/', '/prayer-times-in-saudi-arabia', '/quran', '/guides'];

let pass = 0, fail = 0; const fails = [];
function ok(label, cond, name, detail) {
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; console.log('  ✓ ' + n); } else { fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function get(base, urlPath, headers = {}) {
    const u = new URL(base);
    return new Promise((resolve) => {
        const req = http.request({ host: u.hostname, port: u.port, path: urlPath, method: 'GET', headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-p2-smoke/1', ...headers } }, (res) => {
            const c = []; res.on('data', x => c.push(x)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        req.on('error', (e) => resolve({ status: 0, headers: {}, body: '', err: e.message })); req.end();
    });
}
async function boot(root, port) {
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '',
                  GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
    delete env.TP_ENABLE_SEARCH_TEST;
    const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    for (let i = 0; i < 250; i++) { const r = await get('http://127.0.0.1:' + port, '/health'); if (r.status === 200) return child; await sleep(400); }
    stop(child); throw new Error('server did not become healthy: ' + root + ' :' + port);
}
function stop(child) { if (!child) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { try { child.kill(); } catch (_) {} } }

const normNonce = (s) => String(s || '').replace(/'nonce-[^']+'/g, "'nonce-N'");
const parse = (h) => String(h || '').split(';').map(s => s.trim()).filter(Boolean).map(s => { const t = s.split(/\s+/); return [t[0], t.slice(1)]; });
const dir = (p, n) => { const d = p.find(x => x[0] === n); return d ? d[1] : null; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const headerNonce = (h) => (String(h || '').match(/'nonce-([^']+)'/) || [])[1] || null;
const commentRanges = (html) => { const out = []; const re = /<!--[\s\S]*?-->/g; let m; while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]); return out; };
const inComment = (r, i) => r.some(([a, b]) => i >= a && i < b);
const maskJs = (html) => html.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
function scripts(raw) {
    const html = maskJs(raw), rg = commentRanges(html), exec = [], data = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
    while ((m = re.exec(html))) { if (inComment(rg, m.index)) continue;
        const type = ((m[1].match(/type\s*=\s*["']([^"']*)["']/i) || [])[1] || '').toLowerCase().trim();
        const rec = { attrs: m[1], nonce: (m[1].match(/nonce\s*=\s*["']([^"']*)["']/i) || [])[1] || null, body: raw.slice(m.index, m.index + m[0].length) };
        (!type || type === 'text/javascript' || type === 'application/javascript' || type === 'module' ? exec : data).push(rec); }
    return { exec, data };
}
const normHtml = (s) => String(s).replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/&b=[0-9a-f]+/g, '&b=B');
const googleShape = (html) => ({
    consent: scripts(html).exec.filter(s => /gtag\(\s*'consent'\s*,\s*'default'/.test(s.body)).map(s => normHtml(s.body)),
    adsenseTag: (html.match(/<script\b[^>]*adsbygoogle\.js\?client=[^>]*><\/script>/g) || []).map(normHtml),
    cmpSettingsBinding: scripts(html).exec.filter(s => /__tpCmpBound/.test(s.body)).map(s => normHtml(s.body)),
    footerCookieScript: (html.match(/<script\b[^>]*footer-cookie\.js[^>]*>/g) || []).map(normHtml),
    cookieSettingsControls: (html.match(/<a\b[^>]*data-tp-cookie-settings="1"[^>]*>/g) || []).map(normHtml),
});
const seoShape = (r) => ({ status: r.status, title: (r.body.match(/<title>([^<]*)<\/title>/) || [])[1] || null, canonical: (r.body.match(/<link\b[^>]*rel="canonical"[^>]*>/) || [])[0] || null,
    robots: (r.body.match(/<meta\b[^>]*name="robots"[^>]*>/) || [])[0] || null, hreflang: (r.body.match(/hreflang="/g) || []).length, location: r.headers.location || null });

function staticChecks() {
    console.log('\n-- [S][W] diff shape vs ' + BASE + ' --');
    const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const touched = [...new Set([...git('diff', '--name-only', BASE).split(/\r?\n/), ...git('ls-files', '--others', '--exclude-standard').split(/\r?\n/)].filter(Boolean))];
    ok('S', touched.every(f => ALLOWED.has(f)), 'only server.js + this ticket\'s test files differ', touched.filter(f => !ALLOWED.has(f)).join(', '));
    const baseSrc = git('show', BASE + ':server.js').split(/\r?\n/);
    const nowSrc = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8').split(/\r?\n/);
    const bRo = baseSrc.findIndex(l => l === "    res.setHeader('Content-Security-Policy-Report-Only', [");
    const bRoEnd = baseSrc.indexOf("    ].join('; '));", bRo);
    const target = baseSrc.slice(bRo + 1, bRoEnd);
    const nStart = nowSrc.findIndex(l => l === '    const _cspTargetPolicy = [');
    ok('S', nStart > 0 && eq(nowSrc.slice(nStart + 1, nStart + 1 + target.length), target) && nowSrc[nStart + 1 + target.length] === "    ].join('; ');",
        'the approved target policy lines are reused byte for byte as _cspTargetPolicy (' + target.length + ' lines)');
    ok('S', nowSrc.filter(l => l === "    res.setHeader('Content-Security-Policy', _cspTargetPolicy);").length === 1
        && nowSrc.filter(l => l === "    res.setHeader('Content-Security-Policy-Report-Only', _cspTargetPolicy);").length === 1
        && nowSrc.filter(l => /res\.setHeader\('Content-Security-Policy/.test(l)).length === 2, 'both CSP headers are set exactly once, from the same _cspTargetPolicy');
    const d = git('diff', '-U0', BASE, '--', 'server.js').split(/\r?\n/).map(l => l.replace(/\r$/, ''));
    const hunks = d.filter(l => l.startsWith('@@')).map(h => { const m = h.match(/^@@ -(\d+)/); return +m[1]; });
    ok('S', hunks.length > 0 && hunks.every(n => n >= bRo - 80 && n <= bRoEnd + 2), 'every server.js hunk is inside the CSP header block (base lines ' + (bRo - 80) + '-' + (bRoEnd + 2) + ')', JSON.stringify(hunks));
    const swNow = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').replace(/\r/g, ''), swBase = git('show', BASE + ':sw.js').replace(/\r/g, '');
    ok('W', swNow === swBase, 'sw.js byte-identical to ' + BASE);
    ok('W', nowSrc.some(l => l.includes('const _SC_NONCE_BYPASS = true;')), 'SSR-cache nonce bypass still on');
}

async function runtimeChecks(after, base) {
    console.log('\n-- [A][B][H][P][D][F][I][K] every route --');
    for (const p of ROUTES) {
        const a = await get(after, p);
        const enf = a.headers['content-security-policy'] || '', ro = a.headers['content-security-policy-report-only'] || '';
        const hn = headerNonce(enf); const { exec, data } = scripts(a.body);
        ok('A', !!hn && Buffer.from(hn, 'base64').length === 16, 'enforcing CSP carries a 128-bit nonce  (' + p + ')', enf.slice(0, 80));
        ok('B', ro.length > 0 && ro === enf, 'Report-Only === enforcing, byte for byte  (' + p + ')');
        ok('H', exec.every(s => s.nonce === hn), 'enforcing nonce === all ' + exec.length + ' executable script nonces  (' + p + ')');
        ok('P', !a.body.includes(TOKEN) && exec.every(s => !!s.nonce) && data.every(s => !s.nonce), 'route receives the nonce: no placeholder, no un-nonced script, no nonce on ' + data.length + ' data blocks  (' + p + ')');
        const E = parse(enf), ss = dir(E, 'script-src') || [];
        ok('D', ss.includes("'strict-dynamic'") && ss.includes("'unsafe-eval'") && eq(dir(E, 'script-src-attr'), ["'unsafe-inline'"]) && eq(dir(E, 'worker-src'), ["'self'"])
            && eq(dir(E, 'base-uri'), ["'self'"]) && eq(dir(E, 'object-src'), ["'none'"]), "enforcing: 'strict-dynamic' · 'unsafe-eval' · script-src-attr 'unsafe-inline' · worker-src 'self' · base-uri 'self' · object-src 'none'  (" + p + ')');
        ok('F', (dir(E, 'img-src') || []).filter(t => t === 'https://www.googletagmanager.com').length === 1, 'F1 host in enforcing img-src exactly once  (' + p + ')');
        ok('I', (dir(E, 'connect-src') || []).filter(t => t === 'https://csi.gstatic.com').length === 1, 'CSI host in enforcing connect-src exactly once  (' + p + ')');
        if (base) {
            const b = await get(base, p);
            ok('K', normNonce(enf) === normNonce(b.headers['content-security-policy-report-only']), 'new enforcing === approved target (base Report-Only), nonce-normalised  (' + p + ')');
            ok('R', eq(seoShape(a), seoShape(b)), 'status/title/canonical/robots/hreflang identical to base  (' + p + ') ' + a.status);
        } else { ok('K', false, 'base comparison (' + p + ')', 'no base'); }
    }
    console.log('\n-- [K][M] regions (SA / DE) --');
    for (const p of REGION_ROUTES) for (const cc of ['SA', 'DE']) {
        const a = await get(after, p, { 'CF-IPCountry': cc }), b = base ? await get(base, p, { 'CF-IPCountry': cc }) : null;
        ok('K', !!b && normNonce(a.headers['content-security-policy']) === normNonce(b.headers['content-security-policy-report-only']), 'enforcing === approved target  (' + p + '|' + cc + ')');
        const ga = googleShape(a.body), gb = b ? googleShape(b.body) : null;
        ok('M', !!gb && eq(ga, gb), 'Consent/AdSense tag/CMP binding/footer-cookie/Cookie Settings identical to base  (' + p + '|' + cc + ')', gb ? Object.keys(ga).filter(k => !eq(ga[k], gb[k])).join(',') : 'no base');
    }
    const de = googleShape((await get(after, '/', { 'CF-IPCountry': 'DE' })).body), sa = googleShape((await get(after, '/', { 'CF-IPCountry': 'SA' })).body);
    const homeBody = (await get(after, '/')).body;
    ok('M', de.footerCookieScript.length === 0 && de.cmpSettingsBinding.length === 1 && sa.footerCookieScript.length === 1 && sa.cmpSettingsBinding.length === 0,
        'EEA (DE): Google CMP path, no custom banner script · NON-EEA (SA): custom banner + Cookie Settings');
    ok('M', /'wait_for_update':500/.test(homeBody) && /ads_data_redaction',true/.test(homeBody) && (homeBody.match(/gtag\('consent','default'/g) || []).length === 2,
        "Consent Mode: 2 consent defaults, wait_for_update 500, ads_data_redaction true");
    console.log('\n-- [N] nonce uniqueness --');
    const seq = []; for (let i = 0; i < 5; i++) seq.push(headerNonce((await get(after, '/')).headers['content-security-policy']));
    ok('N', new Set(seq).size === 5, '5 sequential responses -> 5 distinct nonces', seq.join(' '));
    const conc = await Promise.all(Array.from({ length: 5 }, () => get(after, '/quran')));
    const cn = conc.map(r => headerNonce(r.headers['content-security-policy']));
    ok('N', new Set(cn).size === 5 && conc.every((r, i) => scripts(r.body).exec.every(s => s.nonce === cn[i]) && r.headers['content-security-policy-report-only'] === r.headers['content-security-policy']),
        '5 concurrent responses -> 5 distinct nonces, each body matches its own headers (no cache / coalescing reuse)');
}

// ---- [C] real browser canary under the ENFORCED policy --------------------------------------------
class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pend = new Map(); this.subs = [];
        ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && this.pend.has(m.id)) { const p = this.pend.get(m.id); this.pend.delete(m.id); clearTimeout(p.t); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else this.subs.forEach(f => { try { f(m); } catch (_) {} }); };
        ws.onclose = () => { for (const [, p] of this.pend) { clearTimeout(p.t); p.rej(new Error('closed')); } }; }
    static async open(u) { const ws = new WebSocket(u); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); return new CDP(ws); }
    send(m, p = {}, s, ms = 25000) { const id = ++this.id; return new Promise((res, rej) => { const t = setTimeout(() => { this.pend.delete(id); rej(new Error('timeout ' + m)); }, ms); this.pend.set(id, { res, rej, t }); this.ws.send(JSON.stringify({ id, method: m, params: p, sessionId: s })); }); }
    on(f) { this.subs.push(f); } off(f) { this.subs = this.subs.filter(x => x !== f); }
}
async function canaryChecks(after) {
    console.log('\n-- [C] browser canary under the enforced policy (headers untouched, canary injected into the body) --');
    const origin = after;
    const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=C:/Users/Tarek/AppData/Local/Temp/claude/p2smoke-' + process.pid, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
    try {
        let wsu; for (let i = 0; i < 150 && !wsu; i++) { try { const r = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/version'); if (r.ok) wsu = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!wsu) await sleep(300); }
        const br = await CDP.open(wsu);
        for (const route of ['/', '/quran/al-fatihah']) {
            const { targetId } = await br.send('Target.createTarget', { url: 'about:blank' });
            const { sessionId: S } = await br.send('Target.attachToTarget', { targetId, flatten: true });
            let canaryLine = null, headerSeen = null;
            const on = async (m) => { if (m.sessionId !== S || m.method !== 'Fetch.requestPaused') return; const p = m.params;
                try {
                    if (p.frameId !== targetId || !p.responseStatusCode) return br.send('Fetch.continueRequest', { requestId: p.requestId }, S);
                    const hs = (p.responseHeaders || []).filter(h => !/^(content-length|content-encoding)$/i.test(h.name));
                    headerSeen = (hs.find(h => h.name.toLowerCase() === 'content-security-policy') || {}).value || null;
                    const b = await br.send('Fetch.getResponseBody', { requestId: p.requestId }, S);
                    let html = b.base64Encoded ? Buffer.from(b.body, 'base64').toString('utf8') : b.body;
                    const hm = html.match(/<head\b[^>]*>/i); const at = hm.index + hm[0].length;
                    canaryLine = html.slice(0, at).split('\n').length;
                    html = html.slice(0, at) + '<script>window.__tpCanaryRan=true;</script>' + html.slice(at);
                    await br.send('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: p.responseStatusCode, responseHeaders: hs, body: Buffer.from(html, 'utf8').toString('base64') }, S);
                } catch (e) { try { await br.send('Fetch.continueRequest', { requestId: p.requestId }, S); } catch (_) {} } };
            br.on(on);
            for (const d of ['Page', 'Runtime', 'Network']) await br.send(d + '.enable', {}, S);
            await br.send('Network.setBypassServiceWorker', { bypass: true }, S);
            await br.send('Fetch.enable', { patterns: [{ urlPattern: origin + '/*', resourceType: 'Document', requestStage: 'Response' }] }, S);
            await br.send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__V=[];window.__ERR=[];document.addEventListener('securitypolicyviolation',function(e){window.__V.push({disp:e.disposition,d:e.effectiveDirective,u:String(e.blockedURI),ln:e.lineNumber});});window.addEventListener('error',function(e){if(e.target===window)window.__ERR.push(String(e.message));});" }, S);
            await br.send('Page.navigate', { url: origin + route }, S);
            await sleep(9000);
            const r = await br.send('Runtime.evaluate', { expression: "JSON.stringify({ran: window.__tpCanaryRan===true, V: window.__V, ERR: window.__ERR, initApp: typeof initApp, siteSearch: typeof window.SiteSearch, gtag: typeof gtag})", returnByValue: true }, S);
            const st = JSON.parse(r.result.value);
            br.off(on); await br.send('Target.closeTarget', { targetId }).catch(() => {});
            const canaryV = st.V.filter(v => v.disp === 'enforce' && v.u === 'inline' && v.d === 'script-src-elem' && v.ln === canaryLine);
            const otherEnf = st.V.filter(v => v.disp === 'enforce' && !(v.u === 'inline' && v.d === 'script-src-elem' && v.ln === canaryLine));
            ok('C', !!headerSeen && /'strict-dynamic'/.test(headerSeen), 'browser received the strict policy in the ENFORCING header  (' + route + ')', String(headerSeen).slice(0, 70));
            ok('C', st.ran === false && canaryV.length >= 1, 'nonce-less inline canary BLOCKED by enforcement (disposition=enforce)  (' + route + ')', 'ran=' + st.ran + ' canaryViolations=' + canaryV.length);
            ok('C', st.initApp === 'function' && st.siteSearch === 'object' && st.gtag === 'function', "nonce'd scripts still run: app.js, site-search.js, gtag  (" + route + ')', JSON.stringify({ initApp: st.initApp, siteSearch: st.siteSearch, gtag: st.gtag }));
            ok('C', otherEnf.length === 0 && st.ERR.length === 0, 'no other enforced violation, no uncaught JS error  (' + route + ')', JSON.stringify(otherEnf.slice(0, 3)) + ' ' + st.ERR.slice(0, 2).join(' | '));
        }
        br.ws.close();
    } finally { try { execFileSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) {} }
}

(async () => {
    let afterChild = null, baseChild = null;
    try {
        staticChecks();
        afterChild = await boot(ROOT, AFTER_PORT);
        let base = process.env.TP_BASE_URL || '';
        if (!base && process.env.TP_BASE_ROOT) {
            const tb = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: process.env.TP_BASE_ROOT, encoding: 'utf8' }).trim();
            const want = execFileSync('git', ['rev-parse', BASE + '^{tree}'], { cwd: ROOT, encoding: 'utf8' }).trim();
            ok('S', tb === want, 'TP_BASE_ROOT tree === ' + BASE + ' tree', tb + ' vs ' + want);
            baseChild = await boot(process.env.TP_BASE_ROOT, BASE_PORT); base = 'http://127.0.0.1:' + BASE_PORT;
        }
        await runtimeChecks('http://127.0.0.1:' + AFTER_PORT, base || null);
        if (!process.env.TP_P2_SKIP_BROWSER) await canaryChecks('http://127.0.0.1:' + AFTER_PORT);
    } catch (e) { fail++; fails.push('HARNESS: ' + e.message); console.log('  ✗ HARNESS: ' + e.message); }
    finally { stop(afterChild); stop(baseChild); }
    console.log('\n================================================================');
    console.log('  PASS ' + pass + '   FAIL ' + fail);
    fails.slice(0, 40).forEach(f => console.log('    - ' + f));
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
})();
