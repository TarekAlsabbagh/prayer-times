// SEO-ONRENDER-CANONICAL-PIN-1 — local regression guard (no network: outbound guard on the servers, every non-loopback
//   host unresolvable in Chrome, ad domains blocked, ADSENSE off).
//   Problem: every template sets window.SITE_URL = window.location.origin, and the client SEO writers rebuild canonical,
//   the hreflang alternates, og:url and og:image from it after hydration — so on any host other than SITE_URL (the
//   Render hostname prayer-times-d4w8.onrender.com in production) the RENDERED page declares itself canonical on that
//   host while the raw SSR HTML says https://timesprayers.com. Locally the page is served on http://127.0.0.1:PORT with
//   SITE_URL=https://timesprayers.com, i.e. exactly that situation.
//   [S] raw HTML: CAND carries exactly one <meta name="tp-seo-origin" content="https://timesprayers.com"> next to the
//       canonical on every family, and is otherwise byte-identical to BASE (normalised per-request noise).
//   [H] hydrated (headless Chrome): on BASE the canonical / hreflang / og:url / og:image end up on http://127.0.0.1
//       (the defect reproduced); on CAND they all stay on https://timesprayers.com and equal the raw SSR values;
//       window.SITE_URL is still the page origin (navigation untouched); no page error.
//   node scripts/_smoke_seo_onrender_canonical_pin_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-shapbot';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 8881);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 2 };
const ORIGIN = 'https://timesprayers.com';
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*',
    '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.get({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, b: '' }));
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + d : '')); } };
const META = '<meta name="tp-seo-origin" content="' + ORIGIN + '">';
const norm = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N')
    // the country template (prayer-times-cities.html) carries the changed client writer inline: compare around it
    .replace(/function updateCountryListingSEO\([\s\S]*?let p = window\.location\.pathname/, 'FN-updateCountryListingSEO');
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: ORIGIN, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.cand)];
const PAGES = ['/', '/en', '/en/prayer-times-in-london', '/prayer-times-in-riyadh', '/ur/prayer-times-in-karachi', '/en/prayer-times-in-india',
    '/prayer-times-in-saudi-arabia', '/en/prayer-times-worldwide', '/prayer-times-worldwide', '/en/qibla-in-cairo', '/moon/saudi-arabia/riyadh',
    '/fr/moon/egypt/cairo/2026/10', '/en/next-prayer-in-london', '/time-left-until-next-prayer-in-cairo', '/en/today-hijri-date',
    '/hijri-calendar/1448', '/en/ramadan-countdown', '/en/azkar/morning-azkar', '/quran', '/en/guides'];
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
let chrome = null;
try {
    for (const port of [PORT.base, PORT.cand]) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    console.log('-- [S] raw SSR HTML (' + PAGES.length + ' URLs)');
    let metaOnce = 0, metaBeforeCanon = 0, eq = 0, st = 0, baseNoMeta = 0; const eqFail = [], metaFail = [];
    for (const p of PAGES) {
        let b = await get(PORT.base, p), c = await get(PORT.cand, p);
        if (norm(b.b).length !== norm(c.b.split(META).join('')).length) { await sleep(1200); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
        if (b.st === 200 && c.st === 200) st++;
        if (!b.b.includes('tp-seo-origin')) baseNoMeta++;
        const n = c.b.split(META).length - 1;
        if (n === 1) metaOnce++; else metaFail.push(p + ' x' + n);
        const mi = c.b.indexOf(META), ci = c.b.indexOf('<link rel="canonical"');
        if (mi > 0 && ci > mi && /^\s*$/.test(c.b.slice(mi + META.length, ci))) metaBeforeCanon++;
        // remove the meta plus the whitespace that separates it from the canonical → must equal BASE
        const cStripped = c.b.replace(/<meta name="tp-seo-origin" content="[^"]*">\s*/, '');
        if (norm(cStripped) === norm(b.b)) eq++; else eqFail.push(p);
    }
    ok(st === PAGES.length, 'all URLs answer 200 on BASE and CAND', st + '/' + PAGES.length);
    ok(baseNoMeta === PAGES.length, 'BASE has no tp-seo-origin meta (control)');
    ok(metaOnce === PAGES.length, 'CAND: exactly one ' + META, metaFail.join(', '));
    ok(metaBeforeCanon === PAGES.length, 'CAND: the meta sits right before <link rel="canonical">', metaBeforeCanon + '/' + PAGES.length);
    ok(eq === PAGES.length, 'CAND minus that meta == BASE byte for byte (normalised nonce / clock / build stamp)', eqFail.join(', '));

    console.log('-- [H] hydrated in headless Chrome (page origin http://127.0.0.1 ≠ SITE_URL)');
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-pin-'));
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up yet */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    const c = await cdp(ws); const errs = [];
    c.on((d) => { if (d.method === 'Runtime.exceptionThrown') errs.push(String(d.params.exceptionDetails && (d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text)).slice(0, 160)); });
    await c.send('Network.enable'); await c.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await c.send('Page.enable'); await c.send('Runtime.enable');
    const ev = async (expr) => { const r = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    const READ = "(()=>{const q=(s,a)=>{const e=document.querySelector(s);return e?e.getAttribute(a):null};return {can:q('link[rel=canonical]','href'),og:q('meta[property=\"og:url\"]','content'),ogi:q('meta[property=\"og:image\"]','content'),hl:[...document.querySelectorAll('link[rel=alternate][hreflang]')].map(e=>e.getAttribute('href')),site:window.SITE_URL,ready:document.readyState}})()";
    const HYD = ['/en/prayer-times-in-london', '/prayer-times-in-riyadh', '/en/prayer-times-in-india', '/en/qibla-in-cairo', '/moon/saudi-arabia/riyadh', '/en/today-hijri-date', '/'];
    const res = {};
    for (const side of ['base', 'cand']) {
        res[side] = {};
        for (const p of HYD) {
            errs.length = 0;
            await c.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT[side] + p });
            for (let i = 0; i < 60; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
            await sleep(3500);   // client SEO writers run after hydration
            res[side][p] = Object.assign(await ev(READ), { errs: errs.slice() });
        }
    }
    const offOrigin = (v) => v && !v.startsWith(ORIGIN);
    const all = (r) => [r.can, r.og, r.ogi, ...(r.hl || [])].filter(Boolean);
    const baseLeaks = HYD.filter((p) => all(res.base[p]).some(offOrigin));
    ok(baseLeaks.length > 0, 'BASE reproduces the defect: hydrated SEO tags leave ' + ORIGIN + ' on ' + baseLeaks.length + '/' + HYD.length + ' pages', HYD.map((p) => p + ' ' + res.base[p].can).join(' | '));
    const candLeaks = HYD.filter((p) => all(res.cand[p]).some(offOrigin));
    ok(candLeaks.length === 0, 'CAND: canonical / hreflang / og:url / og:image all stay on ' + ORIGIN + ' after hydration', candLeaks.map((p) => p + ' ' + JSON.stringify(res.cand[p])).join(' | ').slice(0, 600));
    // CAND hydrated canonical == raw SSR canonical
    let same = 0; const diff = [];
    for (const p of HYD) { const raw = (await get(PORT.cand, p)).b.match(/<link rel="canonical" href="([^"]+)"/); if (raw && raw[1] === res.cand[p].can) same++; else diff.push(p + ' raw=' + (raw && raw[1]) + ' dom=' + res.cand[p].can); }
    ok(same === HYD.length, 'CAND: hydrated canonical == raw SSR canonical', diff.join(' | '));
    ok(HYD.every((p) => res.cand[p].site === 'http://127.0.0.1:' + PORT.cand), 'window.SITE_URL is still the page origin (navigation / links untouched)');
    const candErrs = HYD.flatMap((p) => res.cand[p].errs.map((e) => p + ': ' + e)), baseErrs = HYD.flatMap((p) => res.base[p].errs.map((e) => p + ': ' + e));
    ok(candErrs.length <= baseErrs.length, 'no new page errors on CAND (base ' + baseErrs.length + ', cand ' + candErrs.length + ')', candErrs.slice(0, 3).join(' | '));
    c.close();
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
