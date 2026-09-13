// CSP-IMG-SRC-GOOGLETAGMANAGER-PING-1 — smoke suite.
//
// The fix under test: https://www.googletagmanager.com is added to img-src in BOTH the enforcing
// Content-Security-Policy and the Content-Security-Policy-Report-Only target — and nothing else moves.
//
// Checks carry a label so the red suite can prove each one fails on its own mutation:
//   [A] enforcing img-src contains the host        [F] no bare https:/http:/* in img-src
//   [B] Report-Only img-src contains the host      [G] Consent Mode default snippet unchanged
//   [D] every other byte of both policies equals   [H] AdSense page tag unchanged
//       the base once that one token is removed    [I] nonce architecture unchanged
//   [E] no wildcard wider than the named host      [J] regional CMP behaviour unchanged
//   [S] the diff has exactly the approved shape
//
// [D][G][H][J] compare against a BASE server (commit 5c07b8f). Provide TP_BASE_URL (already running) or
// TP_BASE_ROOT (a checkout of that tree, booted here). Without one those checks FAIL — never skip.
//
// Usage: TP_BASE_ROOT=<base checkout> node scripts/_smoke_csp_img_src_googletagmanager_ping_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '5c07b8f';
const HOST = 'https://www.googletagmanager.com';
const TOKEN = '__TP_CSP_NONCE__';
const AFTER_PORT = Number(process.env.TP_F1_SMOKE_PORT || 8790);
const BASE_PORT = 8791;
const ALLOWED = new Set(['server.js', 'scripts/_smoke_csp_img_src_googletagmanager_ping_1.mjs',
    'scripts/_red_csp_img_src_googletagmanager_ping_1.mjs', 'scripts/_browser_csp_img_src_googletagmanager_ping_1.mjs']);

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
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-f1-smoke/1', ...headers } }, (res) => {
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

// ---- CSP parsing ---------------------------------------------------------------------------------
const normNonce = (s) => String(s || '').replace(/'nonce-[^']+'/g, "'nonce-N'");
const parse = (h) => String(h || '').split(';').map(s => s.trim()).filter(Boolean).map(s => { const t = s.split(/\s+/); return [t[0], t.slice(1)]; });
const dir = (p, name) => (p.find(d => d[0] === name) || [null, null])[1];
const withoutHost = (p) => p.map(([n, t]) => [n, n === 'img-src' ? t.filter(x => x !== HOST) : t]);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- HTML extraction -----------------------------------------------------------------------------
const commentRanges = (html) => { const out = []; const re = /<!--[\s\S]*?-->/g; let m; while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]); return out; };
const inComment = (r, i) => r.some(([a, b]) => i >= a && i < b);
const maskJs = (html) => html.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
function execScripts(raw) {
    const html = maskJs(raw), rg = commentRanges(html), out = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
    while ((m = re.exec(html))) {
        if (inComment(rg, m.index)) continue;
        const type = ((m[1].match(/type\s*=\s*["']([^"']*)["']/i) || [])[1] || '').toLowerCase().trim();
        if (!type || type === 'text/javascript' || type === 'application/javascript' || type === 'module')
            out.push({ attrs: m[1], body: raw.slice(m.index, m.index + m[0].length) });
    }
    return out;
}
const nonceOf = (a) => (a.match(/nonce\s*=\s*["']([^"']*)["']/i) || [])[1] || null;
const headerNonce = (csp) => (String(csp || '').match(/'nonce-([^']+)'/) || [])[1] || null;
const normHtml = (s) => String(s).replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/&b=[0-9a-f]+/g, '&b=B');
const consentSnippets = (html) => execScripts(html).filter(s => /gtag\(\s*'consent'\s*,\s*'default'/.test(s.body)).map(s => normHtml(s.body));
const adsenseTags = (html) => (html.match(/<script\b[^>]*adsbygoogle\.js\?client=[^>]*><\/script>/g) || []).map(normHtml);
const regionalShape = (html) => ({
    footerCookieScript: /footer-cookie\.js/.test(html),
    cmpSettingsBinding: /__tpCmpBound/.test(html),
    cookieSettingsControls: (html.match(/data-tp-cookie-settings="1"/g) || []).length,
    customBannerMarkup: /class="cookie-consent"/.test(html),
    adsenseTag: /adsbygoogle\.js\?client=/.test(html),
});

// ---- [S] static diff shape -----------------------------------------------------------------------
function staticChecks() {
    console.log('\n-- [S] diff shape vs ' + BASE + ' --');
    const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' });
    const touched = [...new Set([...git('diff', '--name-only', BASE).split(/\r?\n/), ...git('ls-files', '--others', '--exclude-standard').split(/\r?\n/)].filter(Boolean))];
    ok('S', touched.every(f => ALLOWED.has(f)), 'only server.js + this ticket\'s test files differ', touched.filter(f => !ALLOWED.has(f)).join(', '));
    const d = git('diff', '-U0', BASE, '--', 'server.js').split(/\r?\n/).map(l => l.replace(/\r$/, ''));
    const rm = d.filter(l => l.startsWith('-') && !l.startsWith('---')).map(l => l.slice(1));
    const ad = d.filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1));
    const ins = ' ' + HOST;
    const exact = rm.length === 2 && ad.length === 2 && ad.every((a, i) => /^\s*"img-src /.test(a) && a.split(ins).length === 2
        && a.replace(ins, '') === rm[i] && a.indexOf('https://*.google-analytics.com' + ins) !== -1);
    ok('S', exact, 'server.js: exactly 2 lines changed, both img-src, each = base line + the one host inserted after *.google-analytics.com',
        'removed=' + rm.length + ' added=' + ad.length);
}

// ---- runtime -------------------------------------------------------------------------------------
const SAMPLES = [
    ['/', 'SA'], ['/', 'DE'], ['/prayer-times-in-saudi-arabia', 'SA'], ['/prayer-times-in-saudi-arabia', 'DE'],
    ['/guides', 'SA'], ['/definitely-not-a-real-route-xyz', 'SA'],
];

async function runtimeChecks(after, base) {
    const A = {}, B = {};
    for (const [route, cc] of SAMPLES) {
        A[route + '|' + cc] = await get(after, route, { 'CF-IPCountry': cc });
        B[route + '|' + cc] = base ? await get(base, route, { 'CF-IPCountry': cc }) : null;
    }

    console.log('\n-- [A][B] the host is present in both policies --');
    for (const [k, r] of Object.entries(A)) {
        const enf = parse(r.headers['content-security-policy']), ro = parse(r.headers['content-security-policy-report-only']);
        ok('A', (dir(enf, 'img-src') || []).filter(t => t === HOST).length === 1, 'enforcing img-src contains ' + HOST + ' exactly once  (' + k + ')');
        ok('B', (dir(ro, 'img-src') || []).filter(t => t === HOST).length === 1, 'Report-Only img-src contains ' + HOST + ' exactly once  (' + k + ')');
    }

    console.log('\n-- [D] every other byte of both policies is unchanged --');
    for (const [k, r] of Object.entries(A)) {
        const b = B[k];
        if (!b) { ok('D', false, 'base comparison (' + k + ')', 'no TP_BASE_URL / TP_BASE_ROOT'); continue; }
        const ae = parse(r.headers['content-security-policy']), be = parse(b.headers['content-security-policy']);
        const ar = parse(normNonce(r.headers['content-security-policy-report-only'])), brr = parse(normNonce(b.headers['content-security-policy-report-only']));
        ok('D', eq(withoutHost(ae), be), 'enforcing: after minus the one token === base, directive for directive  (' + k + ')');
        ok('D', eq(withoutHost(ar), brr), 'Report-Only: after minus the one token === base (nonce-normalised)  (' + k + ')');
        const ai = dir(ae, 'img-src'), bi = dir(be, 'img-src');
        ok('D', ai.length === bi.length + 1 && ai[bi.indexOf('https://*.google-analytics.com') + 1] === HOST,
            'enforcing img-src grew by exactly one token, placed after https://*.google-analytics.com  (' + k + ')');
    }

    console.log('\n-- [E][F] no broader source than the named host --');
    for (const [k, r] of Object.entries(A)) {
        for (const [pol, h] of [['enforcing', r.headers['content-security-policy']], ['Report-Only', r.headers['content-security-policy-report-only']]]) {
            const img = dir(parse(h), 'img-src') || [];
            const baseImg = B[k] ? (dir(parse(pol === 'enforcing' ? B[k].headers['content-security-policy'] : B[k].headers['content-security-policy-report-only']), 'img-src') || []) : null;
            ok('E', !img.some(t => /googletagmanager/.test(t) && t !== HOST) && !img.some(t => t === '*' || t === 'https://*' || /^\*\./.test(t))
                && (!baseImg || eq(img.filter(t => t.includes('*')), baseImg.filter(t => t.includes('*')))),
                pol + ' img-src: no *.googletagmanager.com or other new wildcard  (' + k + ')', img.filter(t => t.includes('*')).join(' '));
            ok('F', !img.some(t => t === 'https:' || t === 'http:' || t === '*')
                && (!baseImg || eq(img.filter(t => /^[a-z][a-z0-9+.-]*:$/.test(t)), baseImg.filter(t => /^[a-z][a-z0-9+.-]*:$/.test(t)))),
                pol + ' img-src: no bare https: / http: / * (scheme-only sources still just data: blob:)  (' + k + ')', img.filter(t => /:$/.test(t)).join(' '));
        }
    }

    console.log('\n-- [G][H] Consent Mode + AdSense page tag unchanged --');
    for (const k of ['/|SA', '/|DE', '/prayer-times-in-saudi-arabia|DE']) {
        const a = A[k].body, b = B[k] && B[k].body;
        const ac = consentSnippets(a), ah = adsenseTags(a);
        ok('G', ac.length >= 1 && !!b && eq(ac, consentSnippets(b)), 'Consent Mode default snippet(s) byte-identical to base (nonce-normalised)  (' + k + ')', 'after=' + ac.length);
        ok('H', ah.length === 1 && !!b && eq(ah, adsenseTags(b)), 'AdSense page tag byte-identical to base  (' + k + ')', 'after=' + ah.length);
    }

    console.log('\n-- [I] nonce architecture unchanged --');
    const nonces = []; let allMatch = true, leaks = 0, dataNonced = 0;
    for (let i = 0; i < 3; i++) {
        const r = await get(after, '/');
        const hn = headerNonce(r.headers['content-security-policy-report-only']), ex = execScripts(r.body);
        nonces.push(hn);
        if (!hn || !ex.length || !ex.every(s => nonceOf(s.attrs) === hn)) allMatch = false;
        if (r.body.includes(TOKEN)) leaks++;
        dataNonced += (r.body.match(/<script\b[^>]*type="(?:application\/ld\+json|application\/json|text\/template)"[^>]*\bnonce=/gi) || []).length;
    }
    ok('I', new Set(nonces).size === 3 && nonces.every(n => n && Buffer.from(n, 'base64').length === 16), '3 responses -> 3 distinct 128-bit nonces', nonces.join(' '));
    ok('I', allMatch, 'header nonce === every executable script nonce, every response');
    ok('I', leaks === 0 && dataNonced === 0, 'no placeholder leak, no nonce on data blocks');
    const enf0 = String(A['/|SA'].headers['content-security-policy']), ro0 = String(A['/|SA'].headers['content-security-policy-report-only']);
    ok('I', !/nonce-|strict-dynamic/.test(enf0) && /'strict-dynamic'/.test(ro0) && /'nonce-/.test(ro0), 'enforcing has no nonce/strict-dynamic; Report-Only keeps nonce + strict-dynamic (Phase 2 NOT started)');
    ok('I', !!B['/|SA'] && execScripts(A['/|SA'].body).length === execScripts(B['/|SA'].body).length, 'executable script count on / equals base',
        execScripts(A['/|SA'].body).length + ' vs ' + (B['/|SA'] ? execScripts(B['/|SA'].body).length : '-'));

    console.log('\n-- [J] regional CMP behaviour unchanged --');
    for (const k of ['/|SA', '/|DE', '/prayer-times-in-saudi-arabia|SA', '/prayer-times-in-saudi-arabia|DE']) {
        const as = regionalShape(A[k].body), bs = B[k] ? regionalShape(B[k].body) : null;
        ok('J', !!bs && eq(as, bs), 'regional shape identical to base  (' + k + ')  ' + JSON.stringify(as));
    }
    ok('J', !regionalShape(A['/|DE'].body).footerCookieScript && regionalShape(A['/|DE'].body).cmpSettingsBinding
        && regionalShape(A['/|SA'].body).footerCookieScript, 'EEA (DE): custom banner suppressed + CMP settings binding; non-EEA (SA): custom banner shipped');
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
