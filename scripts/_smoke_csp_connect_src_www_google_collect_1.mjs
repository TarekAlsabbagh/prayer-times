// CSP-CONNECT-SRC-WWW-GOOGLE-COLLECT-1 — smoke suite.
//
// Fix under test: https://www.google.com is added to connect-src inside the GA-gated segment. Since Phase 2 one
// _cspTargetPolicy feeds BOTH the enforcing Content-Security-Policy and the identical Report-Only copy, so one source
// line changes and both headers gain the host — and nothing else moves.
//
//   [A] enforcing connect-src contains the host exactly once
//   [B] Report-Only connect-src contains the host exactly once (and Report-Only === enforcing)
//   [E] connect-src: no *.google.com, no google.<ccTLD>, no new wildcard
//   [F] connect-src: no bare https: / http: / *
//   [G] enforcing: every other byte equals base once that one token is removed; token sits right after www.googletagmanager.com
//   [H] Report-Only: same, nonce-normalised
//   [K] every other directive identical to base in both policies (script-src, script-src-attr, img-src, frame-src, …);
//       F1 host still in img-src exactly once; CSI host still in connect-src exactly once; img-src does NOT gain www.google.com
//   [I] nonce architecture unchanged (strict nonce policy enforced, RO === enforcing, distinct nonces, scripts nonced)
//   [M] Consent Mode, AdSense page tag, Google CMP binding, regional CMP, footer-cookie.js, Cookie Settings unchanged
//   [R] routing + SEO head (status, title, canonical, robots, hreflang count) unchanged
//   [W] sw.js byte-identical to base; SSR-cache nonce bypass still on
//   [S] the diff has exactly the approved shape
//
// [G][H][K][M][R] compare against a BASE server (commit eeb9194): TP_BASE_URL (running) or TP_BASE_ROOT (booted here).
// Without one those checks FAIL — never skip.
//
// Usage: TP_BASE_ROOT=<base checkout> node scripts/_smoke_csp_connect_src_www_google_collect_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'eeb9194';
const HOST = 'https://www.google.com';
const F1_HOST = 'https://www.googletagmanager.com';
const CSI_HOST = 'https://csi.gstatic.com';
const TOKEN = '__TP_CSP_NONCE__';
const SEG_BASE = 'https://*.analytics.google.com https://www.googletagmanager.com" : "") + _csAds';
const SEG_FIXED = 'https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com" : "") + _csAds';
const AFTER_PORT = Number(process.env.TP_WGC_SMOKE_PORT || 8805);
const BASE_PORT = 8806;
const ALLOWED = new Set(['server.js', 'scripts/_smoke_csp_connect_src_www_google_collect_1.mjs',
    'scripts/_red_csp_connect_src_www_google_collect_1.mjs', 'scripts/_browser_csp_connect_src_www_google_collect_1.mjs']);
const GUARDED = ['default-src', 'script-src', 'script-src-attr', 'style-src', 'font-src', 'img-src', 'frame-src', 'media-src', 'worker-src',
    'manifest-src', 'object-src', 'base-uri', 'frame-ancestors', 'form-action', 'upgrade-insecure-requests'];

let pass = 0, fail = 0; const fails = [];
function ok(label, cond, name, detail) {
    const n = '[' + label + '] ' + name;
    if (cond) { pass++; console.log('  ✓ ' + n); }
    else { fail++; fails.push(n + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + n + (detail ? '  :: ' + detail : '')); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function get(base, urlPath, headers = {}) {
    const u = new URL(base);
    return new Promise((resolve) => {
        const req = http.request({ host: u.hostname, port: u.port, path: urlPath, method: 'GET',
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-wgc-smoke/1', ...headers } }, (res) => {
            const c = []; res.on('data', x => c.push(x));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(c).toString('utf8') }));
        });
        req.on('error', (e) => resolve({ status: 0, headers: {}, body: '', err: e.message }));
        req.end();
    });
}
async function boot(root, port) {
    const env = { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com',
                  SUPABASE_URL: '', GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539' };
    delete env.TP_ENABLE_SEARCH_TEST;
    const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'ignore', 'ignore'] });
    for (let i = 0; i < 250; i++) { const r = await get('http://127.0.0.1:' + port, '/health'); if (r.status === 200) return child; await sleep(400); }
    stop(child); throw new Error('server did not become healthy: ' + root + ' :' + port);
}
function stop(child) { if (!child) return; try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { try { child.kill(); } catch (_) {} } }

const normNonce = (s) => String(s || '').replace(/'nonce-[^']+'/g, "'nonce-N'");
const parse = (h) => String(h || '').split(';').map(s => s.trim()).filter(Boolean).map(s => { const t = s.split(/\s+/); return [t[0], t.slice(1)]; });
const dir = (p, name) => { const d = p.find(x => x[0] === name); return d ? d[1] : null; };
const withoutHost = (p) => p.map(([n, t]) => [n, n === 'connect-src' ? t.filter(x => x !== HOST) : t]);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const commentRanges = (html) => { const out = []; const re = /<!--[\s\S]*?-->/g; let m; while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]); return out; };
const inComment = (r, i) => r.some(([a, b]) => i >= a && i < b);
const maskJs = (html) => html.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
function execScripts(raw) {
    const html = maskJs(raw), rg = commentRanges(html), out = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
    while ((m = re.exec(html))) { if (inComment(rg, m.index)) continue;
        const type = ((m[1].match(/type\s*=\s*["']([^"']*)["']/i) || [])[1] || '').toLowerCase().trim();
        if (!type || type === 'text/javascript' || type === 'application/javascript' || type === 'module') out.push({ attrs: m[1], body: raw.slice(m.index, m.index + m[0].length) }); }
    return out;
}
const nonceOf = (a) => (a.match(/nonce\s*=\s*["']([^"']*)["']/i) || [])[1] || null;
const headerNonce = (csp) => (String(csp || '').match(/'nonce-([^']+)'/) || [])[1] || null;
const normHtml = (s) => String(s).replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/&b=[0-9a-f]+/g, '&b=B');
const googleShape = (html) => ({
    consent: execScripts(html).filter(s => /gtag\(\s*'consent'\s*,\s*'default'/.test(s.body)).map(s => normHtml(s.body)),
    gaTag: execScripts(html).filter(s => /googletagmanager\.com\/gtag\/js|gtag\(\s*'config'/.test(s.body + s.attrs)).map(s => normHtml(s.body)),
    adsenseTag: (html.match(/<script\b[^>]*adsbygoogle\.js\?client=[^>]*><\/script>/g) || []).map(normHtml),
    cmpSettingsBinding: execScripts(html).filter(s => /__tpCmpBound/.test(s.body)).map(s => normHtml(s.body)),
    footerCookieScript: (html.match(/<script\b[^>]*footer-cookie\.js[^>]*>/g) || []).map(normHtml),
    cookieSettingsControls: (html.match(/<a\b[^>]*data-tp-cookie-settings="1"[^>]*>/g) || []).map(normHtml),
});
const seoShape = (r) => ({
    status: r.status,
    title: (r.body.match(/<title>([^<]*)<\/title>/) || [])[1] || null,
    canonical: (r.body.match(/<link\b[^>]*rel="canonical"[^>]*>/) || [])[0] || null,
    robots: (r.body.match(/<meta\b[^>]*name="robots"[^>]*>/) || [])[0] || null,
    hreflang: (r.body.match(/hreflang="/g) || []).length,
    location: r.headers.location || null,
});

function staticChecks() {
    console.log('\n-- [S][W] diff shape + untouched files vs ' + BASE + ' --');
    const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const touched = [...new Set([...git('diff', '--name-only', BASE).split(/\r?\n/), ...git('ls-files', '--others', '--exclude-standard').split(/\r?\n/)].filter(Boolean))];
    ok('S', touched.every(f => ALLOWED.has(f)), 'only server.js + this ticket\'s test files differ', touched.filter(f => !ALLOWED.has(f)).join(', '));
    const d = git('diff', '-U0', BASE, '--', 'server.js').split(/\r?\n/).map(l => l.replace(/\r$/, ''));
    const rm = d.filter(l => l.startsWith('-') && !l.startsWith('---')).map(l => l.slice(1));
    const ad = d.filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1));
    const exact = rm.length === 1 && ad.length === 1 && /^\s*"connect-src /.test(rm[0]) && rm[0].split(SEG_BASE).length === 2 && ad[0] === rm[0].replace(SEG_BASE, SEG_FIXED)
        && ad[0].includes('_csAds + (_ADSENSE_ENABLED ? " https://csi.gstatic.com" : "") + _csTrafficQuality');
    ok('S', exact, 'server.js: exactly 1 line changed — the single connect-src source line — = base line + " https://www.google.com" at the end of the GA-gated segment (shared _csAds/_csTrafficQuality untouched)',
        'removed=' + rm.length + ' added=' + ad.length);
    const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    ok('S', src.split("res.setHeader('Content-Security-Policy', _cspTargetPolicy);").length === 2 && src.split("res.setHeader('Content-Security-Policy-Report-Only', _cspTargetPolicy);").length === 2,
        'both headers are still set from the one _cspTargetPolicy');
    const swNow = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').replace(/\r/g, '');
    const swBase = git('show', BASE + ':sw.js').replace(/\r/g, '');
    ok('W', swNow === swBase, 'sw.js byte-identical to ' + BASE + ' (line endings normalised)');
    ok('W', /const _SC_NONCE_BYPASS = true;/.test(src), 'SSR cache nonce bypass still on (_SC_NONCE_BYPASS = true)');
}

const SAMPLES = [['/', 'SA'], ['/', 'DE'], ['/prayer-times-in-saudi-arabia', 'SA'], ['/prayer-times-in-saudi-arabia', 'DE'], ['/guides', 'SA'], ['/quran/al-fatihah', 'SA'], ['/definitely-not-a-real-route-xyz', 'SA']];
const SEO_ROUTES = ['/', '/en', '/about-us', '/azkar', '/prayer-times-in-riyadh', '/quran', '/moon', '/qibla-in-riyadh', '/guides/why-prayer-times-differ', '/search-test'];

async function runtimeChecks(after, base) {
    const A = {}, B = {};
    for (const [route, cc] of SAMPLES) {
        A[route + '|' + cc] = await get(after, route, { 'CF-IPCountry': cc });
        B[route + '|' + cc] = base ? await get(base, route, { 'CF-IPCountry': cc }) : null;
    }
    console.log('\n-- [A][B] host present in both connect-src --');
    for (const [k, r] of Object.entries(A)) {
        ok('A', (dir(parse(r.headers['content-security-policy']), 'connect-src') || []).filter(t => t === HOST).length === 1, 'enforcing connect-src contains ' + HOST + ' exactly once  (' + k + ')');
        ok('B', (dir(parse(r.headers['content-security-policy-report-only']), 'connect-src') || []).filter(t => t === HOST).length === 1
            && r.headers['content-security-policy-report-only'] === r.headers['content-security-policy'], 'Report-Only connect-src contains ' + HOST + ' exactly once and Report-Only === enforcing  (' + k + ')');
    }
    console.log('\n-- [E][F] no broader source than the named host --');
    for (const [k, r] of Object.entries(A)) {
        for (const [pol, h, bh] of [['enforcing', r.headers['content-security-policy'], B[k] && B[k].headers['content-security-policy']],
                                    ['Report-Only', r.headers['content-security-policy-report-only'], B[k] && B[k].headers['content-security-policy-report-only']]]) {
            const c = dir(parse(h), 'connect-src') || [], bc = bh ? (dir(parse(bh), 'connect-src') || []) : null;
            const broad = c.filter(t => /^(https?:\/\/)?\*\.google\.com$/.test(t) || /^https?:\/\/(\*\.|www\.)?google\.(?!com$)[a-z.]+$/.test(t) || /^https?:\/\/\*\.google\./.test(t));
            ok('E', broad.length === 0 && !c.some(t => t === '*' || /^https?:\/\/\*$/.test(t)) && (!bc || eq(c.filter(t => t.includes('*')), bc.filter(t => t.includes('*')))),
                pol + ' connect-src: no *.google.com / google.<ccTLD> / new wildcard  (' + k + ')', broad.concat(c.filter(t => t.includes('*'))).join(' '));
            ok('F', !c.some(t => t === 'https:' || t === 'http:' || t === '*') && (!bc || eq(c.filter(t => /^[a-z][a-z0-9+.-]*:$/.test(t)), bc.filter(t => /^[a-z][a-z0-9+.-]*:$/.test(t)))),
                pol + ' connect-src: no bare https: / http: / *  (' + k + ')', c.filter(t => /:$/.test(t) || t === '*').join(' '));
        }
    }
    console.log('\n-- [G][H] every other byte of both policies unchanged --');
    for (const [k, r] of Object.entries(A)) {
        const b = B[k];
        if (!b) { ok('G', false, 'base comparison (' + k + ')', 'no TP_BASE_URL / TP_BASE_ROOT'); ok('H', false, 'base comparison (' + k + ')', 'no base'); continue; }
        const ae = parse(normNonce(r.headers['content-security-policy'])), be = parse(normNonce(b.headers['content-security-policy']));
        ok('G', eq(withoutHost(ae), be), 'enforcing: after minus the one token === base, directive for directive (nonce-normalised)  (' + k + ')');
        const ac = dir(ae, 'connect-src'), bc = dir(be, 'connect-src');
        ok('G', ac.length === bc.length + 1 && ac[bc.indexOf(F1_HOST) + 1] === HOST && !bc.includes(HOST),
            'enforcing connect-src grew by exactly one token, placed right after ' + F1_HOST + ' (GA segment); base had none  (' + k + ')');
        ok('H', eq(withoutHost(parse(normNonce(r.headers['content-security-policy-report-only']))), parse(normNonce(b.headers['content-security-policy-report-only']))),
            'Report-Only: after minus the one token === base (nonce-normalised)  (' + k + ')');
    }
    console.log('\n-- [K] guarded directives + F1 / CSI stay closed --');
    for (const [k, r] of Object.entries(A)) {
        const b = B[k];
        for (const [pol, h] of [['enforcing', 'content-security-policy'], ['Report-Only', 'content-security-policy-report-only']]) {
            const ap = parse(normNonce(r.headers[h]));
            const bp = b ? parse(normNonce(b.headers[h])) : null;
            const diffs = GUARDED.filter(n => !bp || !eq(dir(ap, n), dir(bp, n)));
            ok('K', !!bp && diffs.length === 0, pol + ': ' + GUARDED.length + ' guarded directives identical to base  (' + k + ')', diffs.join(','));
            ok('K', (dir(ap, 'img-src') || []).filter(t => t === F1_HOST).length === 1 && !(dir(ap, 'img-src') || []).includes(HOST), pol + ' img-src: ' + F1_HOST + ' exactly once (F1 closed) and no www.google.com  (' + k + ')');
            ok('K', (dir(ap, 'connect-src') || []).filter(t => t === CSI_HOST).length === 1, pol + ' connect-src: ' + CSI_HOST + ' exactly once (CSI closed)  (' + k + ')');
        }
    }
    console.log('\n-- [M] Consent / GA / AdSense tag / CMP / regional / cookie settings unchanged --');
    for (const k of ['/|SA', '/|DE', '/prayer-times-in-saudi-arabia|SA', '/prayer-times-in-saudi-arabia|DE']) {
        const as = googleShape(A[k].body), bs = B[k] ? googleShape(B[k].body) : null;
        ok('M', !!bs && eq(as, bs) && as.adsenseTag.length === 1, 'Google/consent/CMP/cookie shape byte-identical to base (nonce-normalised)  (' + k + ')',
            bs ? Object.keys(as).filter(x => !eq(as[x], bs[x])).join(',') : 'no base');
    }
    const home = A['/|SA'].body;
    ok('M', /'wait_for_update':500/.test(home) && /gtag\('set','ads_data_redaction',true\)/.test(home) && (home.match(/gtag\('consent','default'/g) || []).length === 2,
        "Consent Mode: 2 consent defaults · 'wait_for_update':500 · ads_data_redaction true");
    const de = googleShape(A['/|DE'].body), sa = googleShape(A['/|SA'].body);
    ok('M', de.footerCookieScript.length === 0 && de.cmpSettingsBinding.length === 1 && sa.footerCookieScript.length === 1 && sa.cmpSettingsBinding.length === 0,
        'EEA (DE): custom banner suppressed + CMP settings binding; non-EEA (SA): footer-cookie.js shipped');
    console.log('\n-- [R] routing + SEO head unchanged --');
    for (const p of SEO_ROUTES) {
        const a = seoShape(await get(after, p)), b = base ? seoShape(await get(base, p)) : null;
        ok('R', !!b && eq(a, b), 'status/title/canonical/robots/hreflang identical to base  (' + p + ')  status=' + a.status, b ? JSON.stringify(Object.keys(a).filter(x => !eq(a[x], b[x]))) : 'no base');
    }
    console.log('\n-- [I] nonce architecture unchanged --');
    const nonces = []; let allMatch = true, leaks = 0, dataNonced = 0, strict = true, roEq = true;
    for (let i = 0; i < 3; i++) {
        const r = await get(after, '/'); const enf = r.headers['content-security-policy'], ro = r.headers['content-security-policy-report-only'];
        const hn = headerNonce(enf), ex = execScripts(r.body);
        nonces.push(hn); if (!hn || !ex.length || !ex.every(s => nonceOf(s.attrs) === hn)) allMatch = false;
        if (!/'strict-dynamic'/.test(enf) || !/script-src-attr 'unsafe-inline'/.test(enf) || !/worker-src 'self'/.test(enf)) strict = false;
        if (ro !== enf) roEq = false;
        if (r.body.includes(TOKEN)) leaks++;
        dataNonced += (r.body.match(/<script\b[^>]*type="(?:application\/ld\+json|application\/json|text\/template)"[^>]*\bnonce=/gi) || []).length;
    }
    ok('I', new Set(nonces).size === 3 && nonces.every(n => n && Buffer.from(n, 'base64').length === 16), '3 responses -> 3 distinct 128-bit nonces', nonces.join(' '));
    ok('I', allMatch && leaks === 0 && dataNonced === 0, 'header nonce === every executable script; no placeholder leak; no nonce on data blocks');
    ok('I', strict && roEq, "enforcing is still the strict nonce policy ('strict-dynamic', script-src-attr, worker-src) and Report-Only === enforcing");
    ok('I', !!B['/|SA'] && execScripts(A['/|SA'].body).length === execScripts(B['/|SA'].body).length, 'executable script count on / equals base');
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
            baseChild = await boot(process.env.TP_BASE_ROOT, BASE_PORT);
            base = 'http://127.0.0.1:' + BASE_PORT;
        }
        await runtimeChecks('http://127.0.0.1:' + AFTER_PORT, base || null);
    } catch (e) {
        fail++; fails.push('HARNESS: ' + e.message); console.log('  ✗ HARNESS: ' + e.message);
    } finally { stop(afterChild); stop(baseChild); }
    console.log('\n================================================================');
    console.log('  PASS ' + pass + '   FAIL ' + fail);
    fails.forEach(f => console.log('    - ' + f));
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
})();
