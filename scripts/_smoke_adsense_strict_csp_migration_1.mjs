// ADSENSE-STRICT-CSP-MIGRATION-1 — smoke + integration suite.
//
// Boots the real server twice (TP_SSR_CACHE=0 and TP_SSR_CACHE=1) and asserts the same contract in
// both modes, because DECISION 1 requires strict CSP to be correct whichever way that env var is
// set on Render — a value this repo cannot read.
//
// The contract under test:
//   * one nonce per response, present in the Report-Only header AND on every executable script
//   * a different nonce on the next response
//   * NO nonce on application/ld+json, application/json or text/template
//   * NO unsubstituted __TP_CSP_NONCE__ token ever reaches a client
//   * the six literal <script> rewrite anchors still fire (i18n split bundles, country-cities-data,
//     window.__PT_COUNTRY__, Umm al-Qura) — these break SILENTLY, so they are asserted explicitly
//   * the enforcing policy is UNCHANGED (Phase 1 is report-only)
//   * the cookie-settings control carries no inline onclick in either region
//
// Usage: node scripts/_smoke_adsense_strict_csp_migration_1.mjs
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = '__TP_CSP_NONCE__';

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, detail) {
    if (cond) { pass++; console.log('  ✓ ' + name); }
    else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('  ✗ ' + name + (detail ? '  :: ' + detail : '')); }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function get(port, urlPath, extraHeaders = {}) {
    return new Promise((resolve) => {
        const req = http.request({
            host: '127.0.0.1', port, path: urlPath, method: 'GET',
            headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'tp-strict-csp-smoke/1', ...extraHeaders }
        }, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve({
                status: res.statusCode,
                headers: res.headers,
                body: Buffer.concat(chunks).toString('utf8')
            }));
        });
        req.on('error', (e) => resolve({ status: 0, headers: {}, body: '', err: e.message }));
        req.end();
    });
}

async function boot(port, cacheMode) {
    const child = spawn(process.execPath, ['server.js'], {
        cwd: ROOT,
        env: {
            ...process.env,
            PORT: String(port),
            WEB_CONCURRENCY: '1',
            TP_SSR_CACHE: cacheMode,
            SITE_URL: 'https://timesprayers.com',
            SUPABASE_URL: '',
            GA_MEASUREMENT_ID: 'G-LT0KWQHW6P',
            ADSENSE_CLIENT: 'ca-pub-5423625249193539'
        },
        stdio: ['ignore', 'ignore', 'ignore']
    });
    for (let i = 0; i < 200; i++) {
        const r = await get(port, '/health');
        if (r.status === 200) return child;
        await sleep(400);
    }
    throw new Error('server did not become healthy on port ' + port);
}

// ---- parsing helpers -------------------------------------------------------
const commentRanges = (html) => {
    const out = []; const re = /<!--[\s\S]*?-->/g; let m;
    while ((m = re.exec(html))) out.push([m.index, m.index + m[0].length]);
    return out;
};
const inComment = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);

// JS block comments INSIDE an inline <script> can contain the literal text "<script id=...".
// prayer-times-cities.html does exactly that in its 101 KB block, so a scanner that only knows
// about HTML comments reports a phantom un-nonced tag. Mask /* ... */ spans before scanning.
const maskJsComments = (html) => html.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));

// Every <script> tag that is NOT inside an HTML comment, split by executability.
function scriptTags(rawHtml) {
    const html = maskJsComments(rawHtml);
    const ranges = commentRanges(html);
    const execTags = [], dataTags = [];
    const re = /<script\b([^>]*)>/gi; let m;
    while ((m = re.exec(html))) {
        if (inComment(ranges, m.index)) continue;
        const attrs = m[1];
        const type = (attrs.match(/type\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
        const t = type.toLowerCase().trim();
        const executable = (!t || t === 'text/javascript' || t === 'application/javascript' || t === 'module');
        (executable ? execTags : dataTags).push({ attrs, tag: m[0] });
    }
    return { execTags, dataTags };
}
const nonceOf = (attrs) => (attrs.match(/nonce\s*=\s*["']([^"']*)["']/i) || [])[1] || null;
const headerNonce = (csp) => (String(csp || '').match(/'nonce-([^']+)'/) || [])[1] || null;

// ---- the per-mode assertion run -------------------------------------------
async function runMode(cacheMode) {
    const port = cacheMode === '1' ? 8711 : 8710;
    console.log('\n================================================================');
    console.log('  TP_SSR_CACHE=' + cacheMode + '   (port ' + port + ')');
    console.log('================================================================');
    const child = await boot(port, cacheMode);
    try {
        // ---------- A) nonce basics ----------
        console.log('\n-- A) nonce architecture --');
        const home = await get(port, '/');
        const ro = home.headers['content-security-policy-report-only'];
        const enf = home.headers['content-security-policy'];

        ok(!!ro, '1. Report-Only CSP header is present');
        ok(!!enf, '   enforcing CSP header still present');
        ok(/'nonce-[A-Za-z0-9+/=]+'/.test(ro || ''), '1b. Report-Only carries a nonce');
        ok(/'strict-dynamic'/.test(ro || ''), '1c. Report-Only carries strict-dynamic');
        ok(/script-src-attr 'unsafe-inline'/.test(ro || ''),
            "1d. script-src-attr declared EXPLICITLY (fallback would report 0 handler violations)");
        ok(/'unsafe-eval'/.test(ro || ''), "1e. 'unsafe-eval' retained per DECISION 5");
        ok(/base-uri 'self'/.test(ro || ''), "1f. base-uri 'self' (NOT 'none' — the site uses <base>)");
        ok(/worker-src 'self'/.test(ro || ''), "1g. worker-src declared explicitly");
        ok(!/nonce-/.test(enf || ''), '   enforcing policy is UNCHANGED (no nonce) — Phase 1 is report-only');
        ok(/'unsafe-inline'/.test(enf || ''), '   enforcing policy still permits inline (non-breaking)');

        const n1 = headerNonce(ro);
        ok(!!n1 && n1.length >= 20, '   nonce looks like 128-bit base64', String(n1));

        const { execTags, dataTags } = scriptTags(home.body);
        const missing = execTags.filter(t => nonceOf(t.attrs) !== n1);
        ok(execTags.length > 0, '2. executable scripts found on /', String(execTags.length));
        ok(missing.length === 0, '2b. EVERY executable script carries the header nonce',
            missing.length ? missing.slice(0, 3).map(t => t.tag.slice(0, 80)).join(' | ') : '');

        const distinct = new Set(execTags.map(t => nonceOf(t.attrs)));
        ok(distinct.size === 1, '3. exactly ONE nonce value inside a single response', [...distinct].join(','));

        const home2 = await get(port, '/');
        const n2 = headerNonce(home2.headers['content-security-policy-report-only']);
        ok(!!n2 && n2 !== n1, '4. a second response uses a DIFFERENT nonce');

        const noncedData = dataTags.filter(t => nonceOf(t.attrs));
        ok(dataTags.length > 0, '5. non-executable script blocks exist (ld+json/json/template)', String(dataTags.length));
        ok(noncedData.length === 0, '5b. NO nonce on ld+json / application/json / text/template',
            noncedData.slice(0, 2).map(t => t.tag.slice(0, 70)).join(' | '));

        ok(home.body.indexOf(TOKEN) === -1, '5c. no unsubstituted placeholder token reaches the client');

        // ---------- B) cache behaviour ----------
        console.log('\n-- B) SSR cache (' + (cacheMode === '1' ? 'ENABLED' : 'disabled') + ') --');
        const a = await get(port, '/');
        const b = await get(port, '/');
        const na = headerNonce(a.headers['content-security-policy-report-only']);
        const nb = headerNonce(b.headers['content-security-policy-report-only']);
        ok(na !== nb, (cacheMode === '1' ? '6/7/8' : '6') + '. consecutive responses never share a nonce');
        ok(a.body.includes('nonce="' + na + '"'), '   response A body matches its own header nonce');
        ok(b.body.includes('nonce="' + nb + '"'), '   response B body matches its own header nonce');
        ok(!a.body.includes('nonce="' + nb + '"'), '8b. response A does not contain response B\'s nonce');
        ok(a.body.indexOf(TOKEN) === -1 && b.body.indexOf(TOKEN) === -1, '   neither response leaks the token');

        // coalescing: fire several identical requests at once
        const burst = await Promise.all([get(port, '/quran'), get(port, '/quran'), get(port, '/quran'), get(port, '/quran')]);
        const burstNonces = burst.map(r => headerNonce(r.headers['content-security-policy-report-only']));
        ok(burst.every(r => r.status === 200), '9. concurrent identical requests all return 200',
            burst.map(r => r.status).join(','));
        ok(new Set(burstNonces).size === burst.length, '9b. request coalescing does not reuse a nonce',
            burstNonces.join(','));
        for (const r of burst) {
            const hn = headerNonce(r.headers['content-security-policy-report-only']);
            if (!r.body.includes('nonce="' + hn + '"')) {
                ok(false, '9c. every coalesced response body matches its own header', hn);
                break;
            }
        }
        ok(burst.every(r => r.body.includes('nonce="' + headerNonce(r.headers['content-security-policy-report-only']) + '"')),
            '9c. every coalesced response body matches its own header nonce');

        // ---------- C) regional ----------
        console.log('\n-- C) regional (DE vs SA) --');
        const de = await get(port, '/', { 'CF-IPCountry': 'DE' });
        const sa = await get(port, '/', { 'CF-IPCountry': 'SA' });
        const nde = headerNonce(de.headers['content-security-policy-report-only']);
        const nsa = headerNonce(sa.headers['content-security-policy-report-only']);
        ok(nde !== nsa, '12. DE and SA responses carry different nonces');
        ok(!de.body.includes('nonce="' + nsa + '"'), '12b. no SA nonce leaks into the DE response');
        ok(!sa.body.includes('nonce="' + nde + '"'), '12c. no DE nonce leaks into the SA response');
        ok(de.body.indexOf(TOKEN) === -1 && sa.body.indexOf(TOKEN) === -1, '12d. neither region leaks the token');
        ok(!/footer-cookie\.js/.test(de.body), '   DE: custom banner script suppressed (PR #84 intact)');
        ok(/footer-cookie\.js/.test(sa.body), '   SA: custom banner script still shipped');
        {
            const deExec = scriptTags(de.body).execTags;
            ok(deExec.length > 0 && deExec.every(t => nonceOf(t.attrs) === nde),
                '12e. EEA response: every executable script nonced');
        }

        // ---------- D) Google integrations ----------
        console.log('\n-- D) Google integrations --');
        ok(/gtag\('consent','default'/.test(home.body), '13. Consent Mode default snippet present');
        ok(/wait_for_update/.test(home.body), '13b. Consent Mode wait_for_update intact');
        ok(/googletagmanager\.com\/gtag\/js/.test(home.body), '14. gtag loader present');
        ok(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/.test(home.body), '15. AdSense page tag present');
        {
            // each of the three Google head scripts must carry the nonce
            const googleTags = scriptTags(home.body).execTags.filter(t =>
                /googletagmanager|adsbygoogle|dataLayer|gtag\(/.test(t.tag) );
            ok(googleTags.length >= 2 && googleTags.every(t => nonceOf(t.attrs) === n1),
                '16. Google head scripts all carry the nonce', String(googleTags.length));
        }
        ok(!/adsbygoogle\.push\(/.test(home.body), '   ADS REMAIN OFF: no adsbygoogle.push()');
        ok(!/<ins[^>]+class="[^"]*adsbygoogle/.test(home.body), '   ADS REMAIN OFF: no ad units');
        ok(!/data-ad-client|enable_page_level_ads/.test(home.body), '   ADS REMAIN OFF: no Auto Ads markup');

        // ---------- E) cookie settings ----------
        console.log('\n-- E) cookie settings control --');
        ok(/data-tp-cookie-settings="1"/.test(sa.body), '18. non-EEA: control carries the binding hook');
        ok(!/onclick="[^"]*openCookieSettings/.test(sa.body), '18b. non-EEA: NO inline onclick remains');
        ok(/data-tp-cookie-settings="1"/.test(de.body), '19. EEA: control carries the binding hook');
        ok(!/onclick="[^"]*tpCmpSettings/.test(de.body), '19b. EEA: NO inline onclick remains');
        ok(/data-tp-cookie-settings/.test(de.body) && /showRevocationMessage/.test(de.body),
            '19c. EEA: CMP revocation binding shipped');
        ok(/<a href="[^"#][^"]*"\s+data-tp-cookie-settings/.test(de.body),
            '19d. EEA: control keeps a real href for the no-JS case');

        // ---------- F) the six rewrite anchors ----------
        console.log('\n-- F) script rewrite anchors (these fail SILENTLY) --');
        const fr = await get(port, '/fr');
        ok(/js\/i18n-core\.js\?v=\d+/.test(fr.body), '24. anchor#1 i18n split: i18n-core.js injected');
        ok(/js\/i18n\/fr\.js\?v=\d+/.test(fr.body), '24b. anchor#1 i18n split: per-language bundle injected');
        ok(!/src="js\/i18n\.js\?v=\d+"/.test(fr.body), '24c. anchor#1: monolithic i18n.js replaced');
        {
            const frExec = scriptTags(fr.body).execTags;
            const nfr = headerNonce(fr.headers['content-security-policy-report-only']);
            ok(frExec.every(t => nonceOf(t.attrs) === nfr), '24d. injected i18n bundles carry the nonce');
        }
        ok(/window\._HIJRI_UMM_AL_QURA=/.test(home.body), '23. anchor#6 Umm al-Qura table injected');
        {
            // The payload lives in the script BODY, not the opening tag, so pair tag+body here.
            // (An earlier version searched the tag text alone and always found nothing.)
            let hijriNonce = null;
            const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
            const ranges = commentRanges(home.body);
            while ((m = re.exec(home.body))) {
                if (inComment(ranges, m.index)) continue;
                if (!/_HIJRI_UMM_AL_QURA/.test(m[2])) continue;
                hijriNonce = nonceOf(m[1]); break;
            }
            ok(hijriNonce === n1, '23b. Umm al-Qura script carries the nonce', 'found=' + hijriNonce);
        }
        const country = await get(port, '/prayer-times-in-saudi-arabia');
        ok(country.status === 200, '   country page serves 200', String(country.status));
        ok(/id="country-cities-data"/.test(country.body), '21. anchor#2 country-cities-data island injected');
        ok(/window\.__PT_COUNTRY__=/.test(country.body), '22. anchor#3 __PT_COUNTRY__ context injected');
        {
            const nc = headerNonce(country.headers['content-security-policy-report-only']);
            const { execTags: ce, dataTags: cd } = scriptTags(country.body);
            ok(ce.every(t => nonceOf(t.attrs) === nc), '22b. country page: all executable scripts nonced');
            const ccIsland = cd.find(t => /country-cities-data/.test(t.tag));
            ok(!!ccIsland && !nonceOf(ccIsland.attrs),
                '21b. country-cities-data is application/json and correctly has NO nonce');
            ok(country.body.indexOf(TOKEN) === -1, '   country page leaks no token');
        }

        // ---------- G) route families ----------
        console.log('\n-- G) route families --');
        const routes = ['/', '/en', '/fr', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia',
            '/prayer-times-worldwide', '/quran', '/quran/al-fatihah', '/guides', '/moon',
            '/qibla-in-riyadh', '/azkar', '/privacy', '/ramadan-countdown'];
        let famOk = 0;
        for (const r of routes) {
            const res = await get(port, r);
            const hn = headerNonce(res.headers['content-security-policy-report-only']);
            const { execTags: e, dataTags: d } = scriptTags(res.body);
            const good = res.status === 200
                && !!hn
                && res.body.indexOf(TOKEN) === -1
                && e.every(t => nonceOf(t.attrs) === hn)
                && d.every(t => !nonceOf(t.attrs));
            if (good) famOk++;
            else ok(false, '20. route family clean: ' + r,
                'status=' + res.status + ' unnonced=' + e.filter(t => nonceOf(t.attrs) !== hn).length
                + ' token=' + (res.body.indexOf(TOKEN) !== -1));
        }
        ok(famOk === routes.length, '20. all ' + routes.length + ' route families clean', famOk + '/' + routes.length);

        // 404 carries the policy but no scripts
        const nf = await get(port, '/definitely-not-a-real-route-xyz');
        ok(nf.status === 404, '   404 route still 404s');
        ok(!!nf.headers['content-security-policy-report-only'], '   404 carries the Report-Only header');
        ok(nf.body.indexOf(TOKEN) === -1, '   404 leaks no token');

        return { pass, fail };
    } finally {
        try { child.kill('SIGKILL'); } catch (_) {}
        await sleep(600);
    }
}

// ---- static source assertions (service worker) -----------------------------
function staticChecks() {
    console.log('\n-- H) service worker source --');
    const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    ok(/const CACHE_VERSION = 'v555'/.test(sw), '11. CACHE_VERSION bumped to v555');
    // Scope to the actual respondWith block, not the explanatory comment above it — the comment
    // legitimately contains the words "cache.put()" while describing what was removed.
    const navIdx = sw.indexOf("req.mode === 'navigate'");
    const htmlBranch = navIdx >= 0 ? sw.slice(navIdx, navIdx + 400) : '';
    ok(navIdx >= 0 && !/\.put\(/.test(htmlBranch),
        '10. HTML navigation branch no longer stores responses',
        htmlBranch.replace(/\s+/g, ' ').slice(0, 120));
    ok(/text\/html/.test(sw) && /c\.delete\(rq\)/.test(sw), '11b. activate sweeps stored HTML out of the runtime cache');

    console.log('\n-- I) templates --');
    for (const f of ['index.html', 'countries.html', 'guides.html', 'legal.html', 'prayer-times-cities.html']) {
        const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
        const { execTags, dataTags } = scriptTags(src);
        const unstamped = execTags.filter(t => nonceOf(t.attrs) !== TOKEN);
        ok(unstamped.length === 0, '   ' + f + ': every executable script carries the placeholder',
            unstamped.slice(0, 2).map(t => t.tag.slice(0, 70)).join(' | '));
        const stampedData = dataTags.filter(t => nonceOf(t.attrs));
        ok(stampedData.length === 0, '   ' + f + ': no placeholder on non-executable blocks');
    }
    // the 101 KB inline block in prayer-times-cities.html contains the TEXT "<script id=..." inside a
    // JS comment; a careless stamper corrupts it. Assert the file still parses as balanced.
    const ptc = fs.readFileSync(path.join(ROOT, 'prayer-times-cities.html'), 'utf8');
    const opens = (ptc.match(/<script\b/g) || []).length;
    const closes = (ptc.match(/<\/script>/g) || []).length;
    ok(opens - closes === 1, '   prayer-times-cities.html: the in-comment <script> text is untouched',
        'opens=' + opens + ' closes=' + closes);
}

(async () => {
    console.log('ADSENSE-STRICT-CSP-MIGRATION-1 — smoke + integration');
    console.log('root: ' + ROOT);
    staticChecks();
    await runMode('0');
    await runMode('1');

    console.log('\n================================================================');
    console.log('  TOTAL: ' + pass + ' passed, ' + fail + ' failed');
    if (fails.length) {
        console.log('\n  FAILURES:');
        for (const f of fails) console.log('    - ' + f);
    }
    console.log('================================================================');
    process.exit(fail === 0 ? 0 : 1);
})();
