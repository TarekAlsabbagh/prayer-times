// ADSENSE-LEGAL-ALIASES-AND-PRIVACY-GA-LINE-1 — smoke test
// Boots server.js (SITE_URL=https://timesprayers.com) and asserts:
//   (1) 301 aliases: /privacy-policy → /privacy, /about → /about-us (lang-preserving);
//   (2) legal pages 200 + self-canonical: /privacy, /about-us, /contact;
//   (3) the Google Analytics disclosure line is present in /privacy for ALL 10 languages;
//   (4) sitemap unchanged: /privacy, /about-us, /contact present; /privacy-policy, /about absent;
//   (5) robots.txt unchanged (Sitemap line); (6) NO AdSense install (no adsbygoogle / pagead);
//   (7) ads.txt is the pre-existing placeholder — NO active "google.com, pub-…" authorization line.
// Self-contained (spawns + tears down its own server).
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = 8103;
const HOST = 'https://timesprayers.com';
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } console.log(`  ${c ? 'PASS' : 'FAIL'}  ${m}`); };
// no-redirect GET: returns status + location + body
const get = (p) => new Promise((resolve) => {
    http.get({ host: 'localhost', port: PORT, path: p }, res => {
        const chunks = []; res.on('data', d => chunks.push(d));
        res.on('end', () => resolve({ status: res.statusCode, loc: res.headers['location'] || '', body: Buffer.concat(chunks).toString('utf8') }));
    }).on('error', () => resolve({ status: -1, loc: '', body: '' }));
});

const srv = spawn('node', ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), SITE_URL: HOST }, stdio: 'ignore' });
const cleanup = () => { try { srv.kill(); } catch (_) {} };
process.on('exit', cleanup);

(async () => {
    let booted = false;
    for (let i = 0; i < 60; i++) { const r = await get('/privacy'); if (r.status === 200) { booted = true; break; } await new Promise(r => setTimeout(r, 500)); }
    ok(booted, 'server booted + /privacy 200');
    if (!booted) { cleanup(); process.exit(1); }

    console.log('--- (1) 301 aliases ---');
    for (const [p, dest] of [['/privacy-policy', '/privacy'], ['/en/privacy-policy', '/en/privacy'], ['/about', '/about-us'], ['/fr/about', '/fr/about-us'], ['/ur/about', '/ur/about-us']]) {
        const r = await get(p);
        ok(r.status === 301 && r.loc === dest, `${p} → 301 ${dest} (got ${r.status} ${r.loc})`);
    }

    console.log('--- (2) legal pages 200 + self-canonical ---');
    for (const p of ['/privacy', '/about-us', '/contact']) {
        const r = await get(p);
        const can = (r.body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/) || [])[1] || '';
        ok(r.status === 200 && can === HOST + p, `${p} → 200 + canonical ${HOST + p} (got ${r.status} ${can})`);
    }

    console.log('--- (3) Google Analytics line in /privacy for all 10 langs ---');
    for (const l of LANGS) {
        const p = l === 'ar' ? '/privacy' : `/${l}/privacy`;
        const r = await get(p);
        ok(r.status === 200 && /<strong>Google Analytics/.test(r.body), `${p}: contains Google Analytics disclosure`);
    }

    console.log('--- (4) sitemap unchanged (aliases absent, targets present) ---');
    const sm = await get('/sitemap-main.xml');
    ok(sm.body.includes(`<loc>${HOST}/privacy</loc>`), 'sitemap-main: /privacy present');
    ok(sm.body.includes(`<loc>${HOST}/about-us</loc>`), 'sitemap-main: /about-us present');
    ok(sm.body.includes(`<loc>${HOST}/contact</loc>`), 'sitemap-main: /contact present');
    ok(!sm.body.includes(`<loc>${HOST}/privacy-policy</loc>`), 'sitemap-main: /privacy-policy ABSENT (301 alias, correct)');
    ok(!sm.body.includes(`<loc>${HOST}/about</loc>`), 'sitemap-main: /about ABSENT (301 alias, correct)');

    console.log('--- (5) robots.txt ---');
    const rob = await get('/robots.txt');
    ok(rob.status === 200 && rob.body.includes(`Sitemap: ${HOST}/sitemap.xml`), `robots.txt Sitemap → ${HOST}/sitemap.xml`);

    console.log('--- (6) NO AdSense install ---');
    const home = await get('/');
    const priv = await get('/privacy');
    const noAds = (t) => !/adsbygoogle|pagead2\.googlesyndication|data-ad-client/i.test(t);
    ok(noAds(home.body) && noAds(priv.body), 'no adsbygoogle / pagead / data-ad-client on / or /privacy');

    console.log('--- (7) ads.txt = pre-existing placeholder (no active pub line) ---');
    const adstxt = await get('/ads.txt');
    const hasActivePub = /^\s*google\.com\s*,\s*pub-\d/im.test(adstxt.body);
    ok(adstxt.status === 200 && !hasActivePub, `ads.txt served, NO active "google.com, pub-…" line (placeholder only)`);

    cleanup();
    console.log(`\n${fail === 0 ? '✅ PASS' : '❌ FAIL'}  ${pass} passed, ${fail} failed`);
    if (fail > 0) { console.log('FAILED:'); fails.forEach(f => console.log('  - ' + f)); }
    process.exit(fail === 0 ? 0 : 1);
})();
