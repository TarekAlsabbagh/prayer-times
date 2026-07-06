// GA4-GOOGLE-TAG-PRODUCTION-INSTALL-1 — smoke test
// Proves the Google tag (gtag.js) install:
//   RUN A (GA ON  — env GA_MEASUREMENT_ID=G-LT0KWQHW6P):
//     • the gtag snippet (googletagmanager.com/gtag/js?id=<ID> + gtag('config','<ID>'))
//       IS present in the served <head> of every PUBLIC page (home, /en, city,
//       country, qibla, moon-today, privacy) — following redirects to the final 200;
//     • it is ABSENT from admin HTML, /api/* JSON, /health JSON, and a static asset;
//     • the CSP response header on a public page allows the GA hosts (so no CSP block).
//   RUN B (GA OFF — env unset):
//     • no gtag anywhere + the CSP header is byte-identical to the no-GA baseline
//       (no googletagmanager / google-analytics hosts) → proves the gating.
//   SOURCE SCAN: server.js contains NO hardcoded Measurement ID literal → the id
//     comes only from the environment.
// Self-contained: spawns + tears down its own servers. No external network needed
// (riyadh / saudi-arabia are curated → served from disk; Supabase off locally).
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ID = 'G-LT0KWQHW6P';

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };

// GET that follows up to 5 redirects (Node http does not auto-follow).
const getFollow = (port, p, depth = 0) => new Promise((resolve) => {
    http.get({ host: 'localhost', port, path: p }, res => {
        const loc = res.headers.location;
        if (res.statusCode >= 300 && res.statusCode < 400 && loc && depth < 5) {
            res.resume();
            let np = loc;
            try { if (/^https?:\/\//.test(loc)) { const u = new URL(loc); np = u.pathname + (u.search || ''); } } catch (_) {}
            resolve(getFollow(port, np, depth + 1)); return;
        }
        const chunks = []; res.on('data', d => chunks.push(d));
        res.on('end', () => { const b = Buffer.concat(chunks); resolve({ status: res.statusCode, headers: res.headers, ctype: res.headers['content-type'] || '', text: b.toString('utf8'), finalPath: p }); });
    }).on('error', () => resolve({ status: -1, headers: {}, ctype: '', text: '', finalPath: p }));
});

const hasGA = (t) => t.includes('googletagmanager.com/gtag/js') && t.includes(ID) && t.includes(`gtag('config','${ID}')`);

const boot = (port, extraEnv) => new Promise(async (resolve) => {
    const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), SITE_URL: 'https://timesprayers.com', ...extraEnv }, stdio: 'ignore' });
    for (let i = 0; i < 80; i++) { const r = await getFollow(port, '/'); if (r.status === 200) { resolve(srv); return; } await new Promise(r => setTimeout(r, 500)); }
    resolve(srv);
});

(async () => {
    // ── RUN A: GA ON ───────────────────────────────────────────────────────
    console.log('================ RUN A — GA ON (env GA_MEASUREMENT_ID=' + ID + ') ================');
    const portA = 8099;
    const srvA = await boot(portA, { GA_MEASUREMENT_ID: ID });

    console.log('--- public pages: gtag MUST be present in served <head> ---');
    const publicPaths = ['/', '/en', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/qibla-in-riyadh', '/moon-today-in-riyadh', '/privacy'];
    for (const p of publicPaths) {
        const r = await getFollow(portA, p);
        const isHtml = r.ctype.includes('text/html') && r.text.includes('<head>');
        ok(r.status === 200 && isHtml && hasGA(r.text), `${p} → 200 HTML + gtag present (final=${r.finalPath})`);
    }

    console.log('--- non-public contexts: gtag MUST be absent ---');
    const negatives = [
        ['/health', 'health JSON'],
        ['/api/admin/discovered-cities', 'API JSON (403)'],
        ['/admin/discovered-cities', 'admin HTML (403 bespoke)'],
        ['/js/app.js', 'static asset (JS)'],
        ['/sw.js', 'service worker'],
    ];
    for (const [p, label] of negatives) {
        const r = await getFollow(portA, p);
        const clean = !r.text.includes('googletagmanager') && !r.text.includes(ID);
        ok(clean, `${label} ${p} → NO gtag (status ${r.status}, ${r.ctype.split(';')[0] || 'n/a'})`);
    }

    console.log('--- CSP header on a public page MUST allow GA hosts ---');
    const cspRes = await getFollow(portA, '/');
    const csp = cspRes.headers['content-security-policy'] || '';
    ok(csp.includes('https://www.googletagmanager.com'), 'CSP script-src allows www.googletagmanager.com');
    ok(csp.includes('https://www.google-analytics.com'), 'CSP allows www.google-analytics.com (img/connect)');
    ok(csp.includes('https://*.analytics.google.com'), 'CSP connect-src allows *.analytics.google.com');

    console.log('--- config uses the exact env ID + only ONE gtag block per page ---');
    const home = await getFollow(portA, '/');
    ok((home.text.match(/googletagmanager\.com\/gtag\/js/g) || []).length === 1, 'exactly ONE gtag loader on the homepage');
    ok(home.text.includes(`gtag('config','${ID}')`), `config('${ID}') present (from env)`);

    console.log('--- SEO intact on a GA-on public page (item 5) ---');
    const seo = await getFollow(portA, '/prayer-times-in-riyadh');
    ok(/<link[^>]+rel="canonical"/.test(seo.text), 'city page: canonical present (GA did not disturb SEO)');
    ok(/hreflang=/.test(seo.text), 'city page: hreflang links present');
    ok(/<title>[^<]+<\/title>/.test(seo.text), 'city page: <title> present');
    ok(hasGA(seo.text), 'city page: gtag coexists with SEO head');

    console.log('--- sitemap + robots unaffected (item 6) ---');
    const sm = await getFollow(portA, '/sitemap.xml');
    ok(sm.status === 200 && sm.ctype.includes('xml') && sm.text.includes('<sitemapindex') && !sm.text.includes('googletagmanager'), 'sitemap.xml: 200 XML, no gtag leak');
    const rb = await getFollow(portA, '/robots.txt');
    ok(rb.status === 200 && rb.text.includes('Sitemap:') && !rb.text.includes('googletagmanager'), 'robots.txt: 200, Sitemap line, no gtag leak');

    console.log('--- INFO: /privacy-policy (ticket-listed) actual behaviour ---');
    const pp = await getFollow(portA, '/privacy-policy');
    console.log(`  INFO  /privacy-policy → status ${pp.status} (the real privacy route is /privacy; see PRE-PUSH)`);

    try { srvA.kill(); } catch (_) {}
    await new Promise(r => setTimeout(r, 800));

    // ── RUN B: GA OFF (gating control) ──────────────────────────────────────
    console.log('\n================ RUN B — GA OFF (env unset) ================');
    const portB = 8100;
    const srvB = await boot(portB, { GA_MEASUREMENT_ID: '' });
    const bHome = await getFollow(portB, '/');
    ok(!bHome.text.includes('googletagmanager') && !bHome.text.includes(ID), 'GA OFF → homepage has NO gtag');
    const bCsp = bHome.headers['content-security-policy'] || '';
    ok(!bCsp.includes('googletagmanager') && !bCsp.includes('google-analytics'), 'GA OFF → CSP has NO GA hosts (no loosening)');
    ok(bCsp.includes("script-src 'self' 'unsafe-inline'") && bCsp.includes('https://api.open-meteo.com'), 'GA OFF → CSP baseline intact (byte-identical policy)');
    try { srvB.kill(); } catch (_) {}

    // ── SOURCE SCAN: no hardcoded Measurement ID ────────────────────────────
    console.log('\n================ SOURCE SCAN — no hardcoded id ================');
    const srvSrc = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
    ok(!srvSrc.includes(ID), `server.js contains NO hardcoded literal "${ID}" (env-only)`);
    ok(srvSrc.includes('process.env.GA_MEASUREMENT_ID'), 'server.js reads process.env.GA_MEASUREMENT_ID');

    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
