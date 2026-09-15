// ADSENSE-STRICT-CSP-PRE-ENFORCEMENT-CLEANUP-1 — smoke suite.
//
// Proves the two cleanups that clear the 37 known Report-Only violations, and that nothing else moved:
//   PART 1  the two <link rel="preload" as="script"> hints (site-search.js, app.js) are gone from all 18
//           index-shell routes, while the real nonce-carrying defer <script> tags are untouched, keep
//           their order, keep the app.js deploy stamp, and every other resource hint is still there.
//   PART 2  GET /search-test is the SAME branded 404 as any unknown route by default (no redirect, no
//           soft-404, no raw test file), and the dev-only page returns only with TP_ENABLE_SEARCH_TEST=1.
//   GUARD   the CSP target, the nonce architecture, the SW version and the production search API are
//           unchanged, and the diff touches only the files this ticket names.
//
// Run against the unmodified base (aad6e9f) it must go RED on PART 1, PART 2 and the diff shape — that
// run is the red proof for every guard here.
//
// Usage: node scripts/_smoke_adsense_strict_csp_pre_enforcement_cleanup_1.mjs
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'aad6e9f';
const TOKEN = '__TP_CSP_NONCE__';

const INDEX_SHELL = ['/', '/en', '/fr', '/tr', '/ur', '/de', '/id', '/es', '/bn', '/ms',
    '/prayer-times-in-riyadh', '/quran', '/quran/al-fatihah', '/moon', '/moon/saudi-arabia/riyadh/today',
    '/qibla-in-riyadh', '/azkar', '/ramadan-countdown'];
const OTHER_TEMPLATES = ['/prayer-times-in-saudi-arabia', '/prayer-times-worldwide', '/guides',
    '/guides/why-prayer-times-differ', '/privacy', '/about-us'];
const ALLOWED_FILES = new Set([
    'index.html', 'server.js', 'scripts/_test_search_place_endpoint.mjs',
    'scripts/_smoke_adsense_strict_csp_pre_enforcement_cleanup_1.mjs',
    'scripts/_browser_adsense_strict_csp_pre_enforcement_cleanup_1.mjs',
]);

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, detail) {
    if (cond) { pass++; console.log('  ✓ ' + name); }
    else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + name + (detail ? '  :: ' + detail : '')); }
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function get(port, urlPath) {
    return new Promise((resolve) => {
        const req = http.request({
            host: '127.0.0.1', port, path: urlPath, method: 'GET',
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-csp-cleanup-smoke/1' }
        }, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
        });
        req.on('error', (e) => resolve({ status: 0, headers: {}, body: '', err: e.message }));
        req.end();
    });
}

async function boot(port, extraEnv) {
    const env = {
        ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0',
        SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '',
        GA_MEASUREMENT_ID: 'G-LT0KWQHW6P', ADSENSE_CLIENT: 'ca-pub-5423625249193539', ...extraEnv
    };
    // production default: the flag is simply absent
    if (!Object.prototype.hasOwnProperty.call(extraEnv, 'TP_ENABLE_SEARCH_TEST')) delete env.TP_ENABLE_SEARCH_TEST;
    const child = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'ignore'] });
    for (let i = 0; i < 200; i++) {
        const r = await get(port, '/health');
        if (r.status === 200) return child;
        await sleep(400);
    }
    stop(child);
    throw new Error('server did not become healthy on port ' + port);
}
function stop(child) {
    try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); }
    catch (_) { try { child.kill(); } catch (_) {} }
}

// ---- parsing helpers (same comment-aware scanning as the Phase 1 smoke) -----------------------
const commentRanges = (html) => {
    const out = []; const re = /<!--[\s\S]*?-->/g; let m;
    while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]);
    return out;
};
const inComment = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);
const maskJsComments = (html) => html.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
const attrOf = (tag, name) => (tag.match(new RegExp('\\b' + name + '\\s*=\\s*["\']([^"\']*)["\']', 'i')) || [])[1] || null;

function scriptTags(rawHtml) {
    const html = maskJsComments(rawHtml);
    const ranges = commentRanges(html);
    const execTags = [];
    const re = /<script\b([^>]*)>/gi; let m;
    while ((m = re.exec(html))) {
        if (inComment(ranges, m.index)) continue;
        const t = String(attrOf(m[0], 'type') || '').toLowerCase().trim();
        if (!t || t === 'text/javascript' || t === 'application/javascript' || t === 'module')
            execTags.push({ attrs: m[1], index: m.index, src: attrOf(m[0], 'src') || '' });
    }
    return execTags;
}
function linkTags(html) {
    const ranges = commentRanges(html);
    const out = []; const re = /<link\b[^>]*>/gi; let m;
    while ((m = re.exec(html))) {
        if (inComment(ranges, m.index)) continue;
        out.push({ rel: String(attrOf(m[0], 'rel') || '').toLowerCase(), as: String(attrOf(m[0], 'as') || '').toLowerCase(),
                   href: attrOf(m[0], 'href') || '', nonce: attrOf(m[0], 'nonce') });
    }
    return out;
}
const nonceOf = (attrs) => (attrs.match(/nonce\s*=\s*["']([^"']*)["']/i) || [])[1] || null;
const headerNonce = (csp) => (String(csp || '').match(/'nonce-([^']+)'/) || [])[1] || null;
const normaliseNonce = (s) => s.replace(/nonce="[^"]*"/g, 'nonce="N"').replace(/'nonce-[^']*'/g, "'nonce-N'");

// ---- STATIC: the diff has the approved shape ----------------------------------------------------
function staticChecks() {
    console.log('\n-- STATIC) diff shape vs ' + BASE + ' --');
    const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' });
    const changed = git('diff', '--name-only', BASE).split(/\r?\n/).filter(Boolean);
    const untracked = git('ls-files', '--others', '--exclude-standard').split(/\r?\n/).filter(Boolean);
    const touched = [...new Set([...changed, ...untracked])];
    const outside = touched.filter(f => !ALLOWED_FILES.has(f));
    ok(outside.length === 0, 'only ticket-named files differ from base', outside.join(', '));

    const idx = git('diff', '-U0', BASE, '--', 'index.html').split(/\r?\n/);
    const removed = idx.filter(l => l.startsWith('-') && !l.startsWith('---')).map(l => l.slice(1));
    const added = idx.filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1));
    ok(removed.some(l => /<link rel="preload" href="js\/site-search\.js\?v=\d+" as="script">/.test(l)), 'index.html: site-search.js script preload removed');
    ok(removed.some(l => /<link rel="preload" href="js\/app\.js\?v=\d+" as="script">/.test(l)), 'index.html: app.js script preload removed');
    ok(removed.filter(l => /<link\b/.test(l)).length === 2, 'index.html: exactly 2 <link> lines removed, no other hint touched', String(removed.filter(l => /<link\b/.test(l)).length));
    ok(!removed.concat(added).some(l => /<script\b|<\/script>/i.test(l)), 'index.html: no <script> line added or removed');
    ok(!added.some(l => /[<>]/.test(l.replace(/^\s*<!--/, '').replace(/-->\s*$/, ''))), 'index.html: added lines are comment text only (no markup)');

    const srv = git('diff', '-U0', BASE, '--', 'server.js').split(/\r?\n/)
        .filter(l => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'));
    const forbidden = srv.filter(l => /Content-Security-Policy|script-src|nonce|_SC_NONCE_BYPASS|consent|googlefc|adsbygoogle|region-signal|CACHE_VERSION|Report-Only/i.test(l));
    ok(forbidden.length === 0, 'server.js: diff touches no CSP / nonce / cache / consent / CMP / ads / region line', forbidden.slice(0, 3).join(' | '));
    ok(!touched.includes('sw.js'), 'sw.js untouched');
    ok(/const CACHE_VERSION = 'v555'/.test(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')), "sw.js CACHE_VERSION still 'v555'");
}

// ---- production-default mode -------------------------------------------------------------------
async function defaultMode() {
    const port = 8750;
    console.log('\n================================================================');
    console.log('  PRODUCTION DEFAULT (TP_ENABLE_SEARCH_TEST absent)   port ' + port);
    console.log('================================================================');
    const child = await boot(port, {});
    const bodies = [];
    try {
        console.log('\n-- PART 1) script preload hints removed on all 18 index-shell routes --');
        for (const route of INDEX_SHELL) {
            const r = await get(port, route); bodies.push(r.body);
            const links = linkTags(r.body);
            const scriptPreloads = links.filter(l => l.rel === 'preload' && l.as === 'script');
            const hn = headerNonce(r.headers['content-security-policy-report-only']);
            const ex = scriptTags(r.body);
            const ss = ex.filter(t => /^js\/site-search\.js\?v=\d+/.test(t.src));
            const ap = ex.filter(t => /^js\/app\.js\?v=\d+/.test(t.src));
            const good = r.status === 200 && scriptPreloads.length === 0
                && !links.some(l => l.rel === 'modulepreload') && !links.some(l => l.nonce)
                && ss.length === 1 && ap.length === 1
                && /\bdefer\b/.test(ss[0].attrs) && /\bdefer\b/.test(ap[0].attrs) && !/\basync\b/.test(ss[0].attrs + ap[0].attrs)
                && ss[0].index < ap[0].index
                && !!hn && nonceOf(ss[0].attrs) === hn && nonceOf(ap[0].attrs) === hn
                && /&b=[^"'\s&]+/.test(ap[0].src);
            ok(good, route.padEnd(34) + ' 0 script preloads · site-search→app defer order · both nonced · app.js &b= stamp',
                'status=' + r.status + ' scriptPreloads=' + scriptPreloads.map(l => l.href).join(',') + ' ss=' + ss.length + ' app=' + ap.length);
        }

        const home = await get(port, '/'); bodies.push(home.body);
        const hl = linkTags(home.body);
        ok(hl.some(l => l.rel === 'preload' && l.as === 'style' && /^css\/style\.css\?v=\d+$/.test(l.href)), '/: style.css preload kept (not a script hint)');
        ok(hl.some(l => l.rel === 'stylesheet' && /^css\/style\.css\?v=\d+$/.test(l.href)), '/: style.css stylesheet kept');
        ok(hl.some(l => l.rel === 'preconnect' && /fonts\.gstatic\.com/.test(l.href)), '/: preconnect fonts.gstatic.com kept');
        ok(hl.some(l => l.rel === 'preconnect' && /flagcdn\.com/.test(l.href)), '/: preconnect flagcdn.com kept');
        ok(hl.some(l => l.rel === 'dns-prefetch' && /nominatim/.test(l.href)), '/: dns-prefetch nominatim kept');

        console.log('\n-- PART 1b) other templates: never had a script preload, still none --');
        for (const route of OTHER_TEMPLATES) {
            const r = await get(port, route); bodies.push(r.body);
            const hn = headerNonce(r.headers['content-security-policy-report-only']);
            const ex = scriptTags(r.body);
            ok(r.status === 200 && linkTags(r.body).filter(l => l.rel === 'preload' && l.as === 'script').length === 0
                && ex.length > 0 && ex.every(t => nonceOf(t.attrs) === hn),
                route.padEnd(34) + ' 200 · 0 script preloads · all ' + ex.length + ' executable scripts carry the header nonce');
        }

        console.log('\n-- PART 2) /search-test disabled: a real 404 through the normal not-found branch --');
        const st = await get(port, '/search-test'); bodies.push(st.body);
        const unk = await get(port, '/definitely-not-a-real-route-xyz'); bodies.push(unk.body);
        ok(st.status === 404, '/search-test -> HTTP 404', 'got ' + st.status);
        ok(!st.headers.location, '/search-test: no redirect (no Location header)', st.headers.location);
        ok(!/search-test-input|search-test-suggestions/.test(st.body), '/search-test: test page markup NOT served');
        ok(/<title>[^<]*404/.test(st.body), '/search-test: branded 404 page');
        ok(normaliseNonce(st.body) === normaliseNonce(unk.body), '/search-test body === unknown-route 404 body (same send404Page output, nonce-normalised)');
        ok(String(st.headers['content-type']) === String(unk.headers['content-type'])
            && String(st.headers['x-robots-tag']) === String(unk.headers['x-robots-tag']),
            '/search-test content-type + X-Robots-Tag === unknown-route 404', st.headers['content-type'] + ' / ' + st.headers['x-robots-tag']);
        const stQ = await get(port, '/search-test?q=riyadh');
        ok(stQ.status === 404 && !/search-test-input/.test(stQ.body), '/search-test?q=riyadh -> 404', 'got ' + stQ.status);
        const stSlash = await get(port, '/search-test/');
        ok(stSlash.status !== 200 && !/search-test-input/.test(stSlash.body), '/search-test/ never serves the test page', 'got ' + stSlash.status);
        for (const raw of ['/db/places/search-test.html', '/search-test.html', '/places/search-test.html']) {
            const r = await get(port, raw);
            ok(r.status === 404 && !/search-test-input/.test(r.body), raw + ' -> 404, raw test file not exposed', 'got ' + r.status);
        }
        const stExec = scriptTags(st.body), stHn = headerNonce(st.headers['content-security-policy-report-only']);
        ok(stExec.every(t => nonceOf(t.attrs) === stHn), '/search-test 404: every executable script (' + stExec.length + ') carries the header nonce');

        console.log('\n-- GUARD) CSP target, nonce architecture, production search feature --');
        const enf = String(home.headers['content-security-policy'] || '');
        const ro = String(home.headers['content-security-policy-report-only'] || '');
        ok(enf.length > 0 && !/nonce-|strict-dynamic/.test(enf), 'enforcing policy still carries no nonce / strict-dynamic (Phase 2 NOT started)');
        ok(/'strict-dynamic'/.test(ro) && /'unsafe-eval'/.test(ro) && /script-src-attr 'unsafe-inline'/.test(ro)
            && /base-uri 'self'/.test(ro) && /worker-src 'self'/.test(ro), 'Report-Only target unchanged (strict-dynamic, unsafe-eval kept, script-src-attr, base-uri, worker-src)');
        const nonces = [];
        for (let i = 0; i < 3; i++) {
            const r = await get(port, '/'); bodies.push(r.body);
            const hn = headerNonce(r.headers['content-security-policy-report-only']);
            const ex = scriptTags(r.body);
            ok(!!hn && ex.length > 0 && ex.every(t => nonceOf(t.attrs) === hn), 'response ' + (i + 1) + ': header nonce === all ' + ex.length + ' executable script nonces');
            nonces.push(hn);
        }
        ok(new Set(nonces).size === 3, '3 responses -> 3 distinct nonces', nonces.join(' '));
        ok(bodies.every(b => b.indexOf(TOKEN) === -1), 'no unsubstituted ' + TOKEN + ' in any of ' + bodies.length + ' bodies');

        const api = await get(port, '/api/search-place?q=riyadh&lang=en');
        let apiJson = {}; try { apiJson = JSON.parse(api.body); } catch (_) {}
        ok(api.status === 200 && Array.isArray(apiJson.results) && apiJson.results.length > 0,
            '/api/search-place (production search API) still 200 with results', 'status=' + api.status + ' results=' + (apiJson.results || []).length);
        for (const asset of ['/js/site-search.js?v=4', '/js/app.js?v=846']) {
            const r = await get(port, asset);
            ok(r.status === 200 && /javascript/.test(String(r.headers['content-type'])) && r.body.length > 1000, asset + ' served 200 as JavaScript', 'status=' + r.status);
        }
    } finally { stop(child); }
}

// ---- dev opt-in mode ---------------------------------------------------------------------------
async function devMode() {
    const port = 8751;
    console.log('\n================================================================');
    console.log('  DEV OPT-IN (TP_ENABLE_SEARCH_TEST=1)   port ' + port);
    console.log('================================================================');
    const child = await boot(port, { TP_ENABLE_SEARCH_TEST: '1' });
    try {
        const st = await get(port, '/search-test');
        ok(st.status === 200 && /id="search-test-input"/.test(st.body), 'opt-in: /search-test serves the dev page (gate, not deletion)', 'status=' + st.status);
        ok(/noindex/i.test(String(st.headers['x-robots-tag'] || '')), 'opt-in: X-Robots-Tag noindex still sent');
        const raw = await get(port, '/db/places/search-test.html');
        ok(raw.status === 404, 'opt-in: raw /db/places/search-test.html still 404', 'got ' + raw.status);
    } finally { stop(child); }
}

(async () => {
    try {
        staticChecks();
        await defaultMode();
        await devMode();
    } catch (e) {
        fail++; fails.push('HARNESS: ' + e.message); console.log('  ✗ HARNESS: ' + e.message);
    }
    console.log('\n================================================================');
    console.log('  PASS ' + pass + '   FAIL ' + fail);
    if (fails.length) { console.log('  failures:'); fails.forEach(f => console.log('    - ' + f)); }
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
})();
