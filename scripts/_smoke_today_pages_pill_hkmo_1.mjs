// TODAY-PAGES-ACCURACY-1 (owner decision 19-10, item 1) — the /moon hub smart pill for Hong Kong and Macau cities.
//   Local only (outbound guard on every server, every non-loopback host unresolvable in Chrome, ad / analytics URLs
//   blocked, ADSENSE_CLIENT=off).
//   Defect (made visible by 6f18246, which un-hid the pill): for a stored city of a collision territory
//   (COUNTRY_SLUG_OVERRIDES: hk, mo) _nestedMoonHrefClient builds /moon/hong-kong/{city} or /moon/macau/{city}; no
//   such moon country exists, so the pill linked to a 404. The server files hong-kong and macau under the country
//   its own resolver finds (/moon/china/{city}; the legacy /moon-in-{city} 301s there), and has NO moon page that
//   answers 200 for central and tin-shui-wai (their only nested URL is /moon/hong-kong/{city} -> 404, pre-existing).
//   Fix: the bare /moon hub carries window.__MOON_HUB_SAR__ (server _moonHubSarPaths: for every curated hk / mo city,
//   the path the server's link builder _nestedMoonBaseForSlug emits, kept only when the moon route accepts it, else
//   ''); the pill uses that path (with the page language prefix) and stays hidden for '' or for any other city of
//   those territories. Every other city takes the unchanged _nestedMoonHrefClient call.
//   Sides: BASE = clean production tree (env TP_BASE_ROOT, route statuses only); PREV = this tree with server.js and
//   js/app.js read from TP_PREV_REF (default 7a34824, the branch head before this fix) through a test-only
//   fs.readFileSync preload; CAND = this tree.
//   [S] source: CAND == PREV once the added blocks are cut (server.js: helper, seo flag, island; js/app.js: the pill
//       block -> the two original lines); index.html identical (app.js?v unchanged: 857 was never deployed); CRLF.
//   [R] routes: BASE == CAND (status + Location) for the hk / mo moon URLs; island == curated hk / mo cities; every
//       island path answers 200 and equals the legacy /moon-in-{city} 301 target; '' entries have no 200 page.
//   [E] SSR: /moon in 10 languages == PREV apart from the one island script (exact content); 12 other pages
//       identical with no island.
//   [B] headless Chrome, caught + uncaught exceptions recorded:
//       - hong-kong / central / tin-shui-wai / macau x lsb_detected / last_city_context x with / without countryCode
//         x 10 languages on CAND: hong-kong + macau -> pill visible, link {lang prefix}/moon/china/{city}, answers 200
//         without a redirect, i18n prefix + CTA, stored city name; central + tin-shui-wai -> pill hidden, untouched (no href, no text);
//         never a /moon/hong-kong/ or /moon/macau/ link; no exception in the pill code, no uncaught exception.
//       - the same 16 stored cities in ar + en on PREV reproduce the defect (link to 404) for comparison.
//       - controls London / Riyadh / Cairo / Seattle x the same 4 stores x ar, en, fr (+ 2 cases x the 7 other
//         languages): pill state, link and its status chain identical PREV vs CAND, the chain ends in 200, every
//         caught exception identical, #page-moon DOM identical (digit runs normalised).
//   node scripts/_smoke_today_pages_pill_hkmo_1.mjs   (env TP_BASE_ROOT, TP_PREV_REF, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-today-pages-base';
const PREV_REF = process.env.TP_PREV_REF || '7a34824';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 9760);
const PORT = { base: P0, prev: P0 + 1, cand: P0 + 2, cdp: P0 + 3 };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const lpOf = (L) => (L === 'ar' ? '' : '/' + L);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method: 'GET', headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, loc: x.headers.location || '', b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, loc: '', b: '' })); r.end();
});
const chain = async (port, p) => { const out = []; let cur = p; for (let i = 0; i < 4 && cur; i++) { const r = await get(port, cur); out.push(cur + ' ' + r.st); if (r.st >= 300 && r.st < 400 && r.loc) cur = r.loc; else break; } return out; };
const finalSt = (ch) => Number(String(ch[ch.length - 1] || '').split(' ').pop());
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 900) : '')); } };
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA');
const { TRANSLATIONS: I18N } = require(path.join(ROOT, 'js/i18n.js'));
const tr = (L, k) => { const D = I18N[L] || I18N.en; return D[k] != null ? D[k] : (I18N.en[k] != null ? I18N.en[k] : I18N.ar[k]); };
// ---- PREV = this tree with server.js + js/app.js from PREV_REF (test-only preload; nothing in the tree is touched)
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hkmo-'));
// blobs are stored with LF (core.autocrlf=true); a checkout writes CRLF -> mirror the checkout
const prevSrc = (rel) => Buffer.from(execFileSync('git', ['show', PREV_REF + ':' + rel], { cwd: ROOT, maxBuffer: 256 * 1024 * 1024 }).toString('utf8').replace(/\r?\n/g, '\r\n'), 'utf8');
fs.writeFileSync(path.join(TMP, 'server.js'), prevSrc('server.js'));
fs.writeFileSync(path.join(TMP, 'app.js'), prevSrc('js/app.js'));
const PREV_INDEX = prevSrc('index.html').toString('utf8');
const OVERRIDE = path.join(TMP, 'prev-override.cjs');
fs.writeFileSync(OVERRIDE, `'use strict';
const fs = require('fs'); const path = require('path');
const key = (p) => path.resolve(p).toLowerCase();
const MAP = new Map([[key(${JSON.stringify(path.join(ROOT, 'server.js'))}), ${JSON.stringify(path.join(TMP, 'server.js'))}],
                     [key(${JSON.stringify(path.join(ROOT, 'js', 'app.js'))}), ${JSON.stringify(path.join(TMP, 'app.js'))}]]);
const _r = fs.readFileSync;
fs.readFileSync = function (p, ...a) { if (typeof p === 'string') { const k = key(p); if (MAP.has(k)) return _r.call(fs, MAP.get(k), ...a); } return _r.call(fs, p, ...a); };
`);
const ENV = { PORT: '', WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' };
const boot = (root, port, pre) => spawn(process.execPath, ['-r', GUARD, ...(pre ? ['-r', pre] : []), 'server.js'], { cwd: root, stdio: 'ignore', env: { ...process.env, ...ENV, PORT: String(port) } });
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
// ---- stored cities (names / coordinates as in db/places/curated-places.json)
const CITY = {
    'hong-kong':    { ar: 'هونغ كونغ', en: 'Hong Kong', lat: 22.3193, lng: 114.1694, cc: 'hk', country: 'Hong Kong' },
    'central':      { ar: 'سنترال', en: 'Central', lat: 22.28299, lng: 114.15846, cc: 'hk', country: 'Hong Kong' },
    'tin-shui-wai': { ar: 'تين شوي واي', en: 'Tin Shui Wai', lat: 22.45679, lng: 114.00234, cc: 'hk', country: 'Hong Kong' },
    'macau':        { ar: 'ماكاو', en: 'Macau', lat: 22.20056, lng: 113.54611, cc: 'mo', country: 'Macau' },
    'london':       { ar: 'لندن', en: 'London', lat: 51.5074, lng: -0.1278, cc: 'gb', country: 'United Kingdom' },
    'riyadh':       { ar: 'الرياض', en: 'Riyadh', lat: 24.7136, lng: 46.6753, cc: 'sa', country: 'Saudi Arabia' },
    'cairo':        { ar: 'القاهرة', en: 'Cairo', lat: 30.0444, lng: 31.2357, cc: 'eg', country: 'Egypt' },
    'seattle':      { ar: 'سياتل', en: 'Seattle', lat: 47.6062, lng: -122.3321, cc: 'us', country: 'United States' }
};
const STORES = ['lsb+cc', 'lsb-nocc', 'ctx+cc', 'ctx-nocc'];
const storeJs = (slug, store) => {
    const c = CITY[slug];
    if (store.startsWith('lsb')) {
        const o = { arCity: c.ar, lat: c.lat, lng: c.lng, enName: c.en, country: c.country, names: { ar: c.ar, en: c.en }, ts: '__TS__' };
        if (store === 'lsb+cc') o.countryCode = c.cc;
        return "localStorage.setItem('lsb_detected', " + JSON.stringify(JSON.stringify(o)).replace('\\"__TS__\\"', '"+Date.now()+"') + ');';
    }
    const o = { name: c.ar, englishName: c.en, lat: c.lat, lng: c.lng };
    if (store === 'ctx+cc') o.countryCode = c.cc.toUpperCase();   // upper case on purpose: the pill lower-cases it
    return "sessionStorage.setItem('last_city_context', " + JSON.stringify(JSON.stringify(o)) + ');';
};
const PILL_JS = "(()=>{const p=document.getElementById('moon-hub-smart-pill');if(!p)return null;const q=(s)=>{const e=p.querySelector(s);return e?e.textContent:null};return {hidden:p.hidden,visible:p.classList.contains('is-visible'),rendered:!!(p.offsetWidth||p.offsetHeight),href:p.getAttribute('href'),prefix:q('.mhsp-prefix'),city:q('.mhsp-city'),cta:q('.mhsp-cta')}})()";
const DOM_JS = "(()=>{const r=document.getElementById('page-moon')||document.body;const c=r.cloneNode(true);const p=c.querySelector('#moon-hub-smart-pill');if(p)p.remove();return c.outerHTML})()";
const domNorm = (s) => String(s || '').replace(/nonce="[^"]*"/g, '').replace(/\d+/g, '#');   // live moon values / clocks: digit runs (their length moves too)
const ISLAND_RE = /<script nonce="[^"]*" id="ssr-moon-hub-sar">window\.__MOON_HUB_SAR__=(\{[^<]*\});<\/script>/g;
const ISLAND_CUT_RE = /\n    <script nonce="[^"]*" id="ssr-moon-hub-sar">[^<]*<\/script>/g;   // renderSeoHeadHtml joins its parts with "\n    "
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.prev, OVERRIDE), boot(ROOT, PORT.cand)];
let chrome = null;
try {
    for (const port of [PORT.base, PORT.prev, PORT.cand]) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    // ---------------------------------------------------------------- [S]
    console.log('-- [S] source (CAND vs PREV ' + PREV_REF + ')');
    const sC = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8'), sP = fs.readFileSync(path.join(TMP, 'server.js'), 'utf8');
    const aC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8'), aP = fs.readFileSync(path.join(TMP, 'app.js'), 'utf8');
    const SRV_CUTS = [
        /\/\/ TODAY-PAGES-ACCURACY-1 \(moon-hub smart pill, Hong Kong \/ Macau\)[\s\S]*?\r\nfunction _moonHubSarPaths\(\) \{[\s\S]*?\r\n    return out;\r\n\}\r\n/,
        /        moonGeneralHub: \(corePath === '\/moon'\),[^\r\n]*\r\n/,
        /    \/\/ TODAY-PAGES-ACCURACY-1: on the bare \/moon hub only[\s\S]*?id="ssr-moon-hub-sar"[^\r\n]*\r\n    \}\r\n/
    ];
    let sCut = sC; const sHits = SRV_CUTS.map((re) => { const b = sCut; sCut = sCut.replace(re, ''); return b !== sCut; });
    ok(sHits.every(Boolean) && sCut === sP, '[S] server.js: CAND == PREV byte for byte once the 3 added blocks are cut (helper, seo flag, /moon island)', 'cuts ' + sHits.join(',') + ' eq ' + (sCut === sP));
    const OLD_PILL = "            // MLRC (Option-1): smart-pill carries cc → emit nested hub URL (MOON-DAY-PAGES-REMOVAL-1: was /today).\r\n            const target = pageUrl(_nestedMoonHrefClient(slug, '', 'hub', (cc || '').toLowerCase()));\r\n";
    const NEW_PILL_RE = /            \/\/ TODAY-PAGES-ACCURACY-1 \(Hong Kong \/ Macau\)[\s\S]*?            const target = pageUrl\(_hubPath\);\r\n/;
    const aCut = aC.replace(NEW_PILL_RE, OLD_PILL);
    ok(aCut !== aC && aCut === aP, '[S] js/app.js: CAND == PREV byte for byte once the pill block is put back to the two original lines (nothing else changed)');
    const pillFn = aC.slice(aC.indexOf('function _wireMoonHubSmartPill() {'), aC.indexOf('function _wireMoonHubHero() {'));
    ok(NEW_PILL_RE.test(pillFn) && (aC.match(/__MOON_HUB_SAR__/g) || []).length === 1, '[S] js/app.js: the new block sits inside _wireMoonHubSmartPill and is the only reader of __MOON_HUB_SAR__');
    ok(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8') === PREV_INDEX, '[S] index.html unchanged vs PREV (app.js?v stays 857 — never deployed)');
    const crlf = (s) => (s.match(/\r\n/g) || []).length === (s.match(/\n/g) || []).length;
    ok(crlf(sC) && crlf(aC), '[S] server.js + js/app.js keep CRLF throughout');
    const minP = (await get(PORT.prev, '/js/app.js')).b, minC = (await get(PORT.cand, '/js/app.js')).b;
    ok(minP.length > 100000 && minC.length > 100000 && !minP.includes('__MOON_HUB_SAR__') && minC.includes('__MOON_HUB_SAR__'), '[S] served (minified) app.js: PREV without, CAND with the island reader (the PREV preload works)', minP.length + ' / ' + minC.length);
    // ---------------------------------------------------------------- [R]
    console.log('-- [R] routes (BASE vs CAND) + island');
    const curated = require(path.join(ROOT, 'db/places/curated-places.json')).filter((p) => p && /^(hk|mo)$/i.test(p.countryCode || '')).map((p) => p.slug).sort();
    const hubC = (await get(PORT.cand, '/moon')).b;
    const isl = [...hubC.matchAll(ISLAND_RE)];
    const island = isl.length === 1 ? JSON.parse(isl[0][1]) : {};
    console.log('     island: ' + JSON.stringify(island));
    ok(JSON.stringify(Object.keys(island).sort()) === JSON.stringify(curated) && curated.length === 4, '[R] island keys == the curated hk / mo cities (' + curated.join(', ') + ')', JSON.stringify(Object.keys(island)));
    ok(island['hong-kong'] === '/moon/china/hong-kong' && island.macau === '/moon/china/macau' && island.central === '' && island['tin-shui-wai'] === '', '[R] island: hong-kong + macau -> /moon/china/{city}; central + tin-shui-wai -> "" (no moon page)', JSON.stringify(island));
    const RT = [];
    for (const s of Object.keys(CITY).slice(0, 4)) for (const L of ['ar', 'en']) for (const p of ['/moon/china/' + s, '/moon/hong-kong/' + s, '/moon/macau/' + s, '/moon-in-' + s]) RT.push(lpOf(L) + p);
    RT.push('/moon/china', '/moon/hong-kong', '/moon/macau', '/en/moon/china', '/en/moon/hong-kong');
    let rOk = 0; const rBad = [];
    for (const p of RT) { const b = await get(PORT.base, p), c = await get(PORT.cand, p); if (b.st === c.st && b.loc === c.loc) rOk++; else rBad.push(p + ' ' + b.st + '>' + b.loc + ' / ' + c.st + '>' + c.loc); }
    ok(rOk === RT.length, '[R] ' + RT.length + ' hk / mo moon URLs: status + Location identical on BASE and CAND (no route change)', rBad.join(' | '));
    for (const L of LANGS) {
        for (const s of Object.keys(island)) {
            if (island[s]) {
                const hub = await get(PORT.cand, lpOf(L) + island[s]); const leg = await get(PORT.cand, lpOf(L) + '/moon-in-' + s);
                ok(hub.st === 200 && leg.st === 301 && leg.loc === lpOf(L) + island[s], '[R] ' + L + ' ' + s + ': ' + lpOf(L) + island[s] + ' answers 200 and is the legacy /moon-in-' + s + ' 301 target', hub.st + ' / ' + leg.st + ' > ' + leg.loc);
            } else if (L === 'ar' || L === 'en') {
                const c1 = await chain(PORT.cand, lpOf(L) + '/moon-in-' + s), c2 = await chain(PORT.cand, lpOf(L) + '/moon/china/' + s), c3 = await chain(PORT.cand, lpOf(L) + '/moon/hong-kong/' + s);
                ok([c1, c2, c3].every((c) => finalSt(c) === 404), '[R] ' + L + ' ' + s + ': no moon page answers 200 (legacy, /moon/china/, /moon/hong-kong/ all end in 404 — pre-existing, BASE identical)', [c1, c2, c3].map((c) => c.join(' > ')).join(' | '));
            }
        }
    }
    // ---------------------------------------------------------------- [E]
    console.log('-- [E] SSR (PREV vs CAND)');
    for (const L of LANGS) {
        let p = await get(PORT.prev, lpOf(L) + '/moon'), c = await get(PORT.cand, lpOf(L) + '/moon');
        const cut = (s) => noise(s.replace(ISLAND_CUT_RE, ''));
        if (cut(c.b) !== noise(p.b)) { await sleep(1500); p = await get(PORT.prev, lpOf(L) + '/moon'); c = await get(PORT.cand, lpOf(L) + '/moon'); }
        const m = [...c.b.matchAll(ISLAND_RE)];
        ok(p.st === 200 && c.st === 200 && m.length === 1 && m[0][1] === JSON.stringify(island) && ![...p.b.matchAll(ISLAND_RE)].length && cut(c.b) === noise(p.b),
            '[E] ' + lpOf(L) + '/moon: one island (same content), PREV has none, HTML otherwise identical', p.st + '/' + c.st + ' islands ' + m.length);
    }
    const OTHER = ['/', '/en', '/moon/china', '/moon/china/hong-kong', '/en/moon/china/macau', '/moon/united-kingdom/london', '/moon/china/hong-kong/2026', '/en/moon/united-kingdom/london/2026/10', '/prayer-times-in-hong-kong', '/en/prayer-times-in-macau', '/today-hijri-date', '/qibla'];
    let eOk = 0; const eBad = [];
    for (const p of OTHER) {
        let b = await get(PORT.prev, p), c = await get(PORT.cand, p);
        if (noise(b.b) !== noise(c.b)) { await sleep(1500); b = await get(PORT.prev, p); c = await get(PORT.cand, p); }
        if (b.st === c.st && noise(b.b) === noise(c.b) && !c.b.includes('ssr-moon-hub-sar')) eOk++; else eBad.push(p + ' ' + b.st + '/' + c.st);
    }
    ok(eOk === OTHER.length, '[E] ' + OTHER.length + ' other pages (home, moon country / city / year / month, prayer, hijri, qibla): identical, no island', eBad.join(', '));
    // ---------------------------------------------------------------- [B]
    console.log('-- [B] headless Chrome');
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-hkmo-chrome-'));
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    const cd = await cdp(ws);
    let caught = [], uncaught = [];
    cd.on((d) => {
        if (d.method === 'Debugger.paused') {
            const p = d.params || {};
            if (p.reason === 'exception' || p.reason === 'promiseRejection') {
                const ex = p.data || {};
                caught.push({ desc: String(ex.description || ex.value || ex.className || p.reason).split('\n')[0], frames: (p.callFrames || []).map((f) => f.functionName || '(anon)') });
            }
            cd.send('Debugger.resume');
        } else if (d.method === 'Runtime.exceptionThrown') {
            const e = (d.params && d.params.exceptionDetails) || {};
            uncaught.push(String((e.exception && e.exception.description) || e.text || '').split('\n')[0]);
        }
    });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Network.setBypassServiceWorker', { bypass: true });
    await cd.send('Page.enable'); await cd.send('Runtime.enable'); await cd.send('Debugger.enable');
    await cd.send('Debugger.setPauseOnExceptions', { state: 'all' });
    await cd.send('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Riyadh' });
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    let initId = null;
    const load = async (side, L, slug, store, withDom) => {
        if (initId) await cd.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initId });
        const r = await cd.send('Page.addScriptToEvaluateOnNewDocument', { source: '(()=>{try{localStorage.clear();sessionStorage.clear();' + storeJs(slug, store) + '}catch(_e){}})()' });
        initId = r.result && r.result.identifier;
        caught = []; uncaught = [];
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT[side] + lpOf(L) + '/moon' });
        for (let i = 0; i < 80; i++) { await sleep(150); if ((await ev('document.readyState')) === 'complete') break; }
        await sleep(withDom ? 1800 : 400);
        return { caught: caught.slice(), uncaught: uncaught.slice(), pill: await ev(PILL_JS), dom: withDom ? await ev(DOM_JS) : '', lang: await ev('document.documentElement.lang'), sar: await ev('JSON.stringify(window.__MOON_HUB_SAR__||null)') };
    };
    const pillExc = (R) => R.caught.filter((x) => x.frames.some((f) => /_wireMoonHubSmartPill|_nestedMoonHrefClient|makeCountrySlug/.test(f)));
    const multiset = (arr) => { const m = {}; arr.forEach((x) => { m[x] = (m[x] || 0) + 1; }); return JSON.stringify(Object.keys(m).sort().map((k) => [k, m[k]])); };
    // (1) hk / mo stored cities on CAND, 10 languages x 4 stores
    console.log('   · CAND: 4 hk / mo cities x 4 stores x 10 languages');
    let nB = 0; const bBad = [];
    for (const L of LANGS) {
        for (const slug of ['hong-kong', 'central', 'tin-shui-wai', 'macau']) {
            for (const store of STORES) {
                const C = await load('cand', L, slug, store, false);
                const id = L + ' ' + slug + ' ' + store;
                const errs = [];
                if (C.lang !== L) errs.push('lang ' + C.lang);
                if (C.sar !== JSON.stringify(island)) errs.push('island ' + C.sar);
                if (pillExc(C).length || C.uncaught.length) errs.push('exceptions ' + JSON.stringify(pillExc(C)) + ' ' + C.uncaught.join('|'));
                if (!C.pill) errs.push('no pill element');
                else if (/\/moon\/(?:hong-kong|macau)\//.test(C.pill.href || '')) errs.push('404 link ' + C.pill.href);
                else if (island[slug]) {
                    const want = lpOf(L) + island[slug];
                    const city = L === 'ar' ? CITY[slug].ar : CITY[slug].en;
                    if (!(C.pill.hidden === false && C.pill.visible && C.pill.rendered)) errs.push('pill not shown ' + JSON.stringify(C.pill));
                    if (C.pill.href !== want) errs.push('href ' + C.pill.href + ' != ' + want);
                    if (C.pill.city !== city || C.pill.prefix !== tr(L, 'moon.hub.smart_pill_prefix') || C.pill.cta !== tr(L, 'moon.hub.smart_pill_cta')) errs.push('text ' + JSON.stringify(C.pill));
                    const lk = await get(PORT.cand, C.pill.href || '/__none__');
                    if (lk.st !== 200) errs.push('link status ' + lk.st);
                } else if (!(C.pill.hidden === true && !C.pill.visible && !C.pill.rendered && (C.pill.href === null || C.pill.href === '#') && C.pill.city === null)) errs.push('pill should stay hidden, untouched ' + JSON.stringify(C.pill));   // SSR strips the placeholder href="#"
                if (errs.length) bBad.push(id + ': ' + errs.join('; ')); else nB++;
            }
        }
    }
    ok(bBad.length === 0, '[B] CAND, ' + nB + '/160 stored-city loads: hong-kong + macau -> visible pill to {lang}/moon/china/{city} (200, no redirect, i18n text, stored name); central + tin-shui-wai -> hidden; no 404 link; no pill exception; no uncaught exception', bBad.slice(0, 6).join(' || '));
    // (2) PREV, same 16 stored cities in ar + en: the defect
    console.log('   · PREV: the same 16 stored cities in ar + en (defect reproduction)');
    let nP = 0; const pBad = [];
    for (const L of ['ar', 'en']) {
        for (const slug of ['hong-kong', 'central', 'tin-shui-wai', 'macau']) {
            for (const store of STORES) {
                const P = await load('prev', L, slug, store, false);
                const ch = P.pill && P.pill.href && P.pill.href !== '#' ? await chain(PORT.prev, P.pill.href) : [];
                const id = L + ' ' + slug + ' ' + store + ' -> ' + (P.pill && P.pill.href) + ' [' + ch.join(' > ') + ']';
                console.log('     PREV ' + id);
                // with countryCode: /moon/hong-kong|macau/{city} -> 404; without: /moon/saudi-arabia/{city} -> 301 -> server target
                const broken = P.pill && P.pill.visible && ch.length && finalSt(ch) === 404;
                const hasCc = store.endsWith('+cc');
                if (hasCc ? (broken && /\/moon\/(?:hong-kong|macau)\//.test(P.pill.href)) : (island[slug] ? finalSt(ch) === 200 : broken)) nP++; else pBad.push(id);
            }
        }
    }
    ok(pBad.length === 0, '[B] PREV reproduces the defect (' + nP + '/32): with countryCode the pill links /moon/hong-kong|macau/{city} -> 404; without it, central + tin-shui-wai end in 404 too (hong-kong + macau only via a 301)', pBad.join(' || '));
    // (3) controls PREV vs CAND
    console.log('   · controls PREV vs CAND');
    const CTRL = [];
    for (const L of ['ar', 'en', 'fr']) for (const slug of ['london', 'riyadh', 'cairo', 'seattle']) for (const store of STORES) CTRL.push([L, slug, store]);
    for (const L of ['tr', 'ur', 'de', 'id', 'es', 'bn', 'ms']) { CTRL.push([L, 'london', 'lsb+cc']); CTRL.push([L, 'seattle', 'ctx-nocc']); }
    let nC = 0; const cBad = [];
    for (const [L, slug, store] of CTRL) {
        const P = await load('prev', L, slug, store, true);
        const C = await load('cand', L, slug, store, true);
        const chP = P.pill && P.pill.href && P.pill.href !== '#' ? await chain(PORT.prev, P.pill.href) : [];
        const chC = C.pill && C.pill.href && C.pill.href !== '#' ? await chain(PORT.cand, C.pill.href) : [];
        const id = L + ' ' + slug + ' ' + store;
        const errs = [];
        if (JSON.stringify(P.pill) !== JSON.stringify(C.pill)) errs.push('pill ' + JSON.stringify(P.pill) + ' vs ' + JSON.stringify(C.pill));
        if (!(C.pill && C.pill.visible && C.pill.href && C.pill.href.startsWith(lpOf(L) + '/moon/'))) errs.push('pill not shown with a ' + L + ' link ' + JSON.stringify(C.pill));
        if (JSON.stringify(chP.map((x) => x.replace(/^\S+ /, ''))) !== JSON.stringify(chC.map((x) => x.replace(/^\S+ /, ''))) || chP.join() !== chC.join() || finalSt(chC) !== 200) errs.push('chain ' + chP.join(' > ') + ' vs ' + chC.join(' > '));
        if (multiset(P.caught.map((x) => x.desc)) !== multiset(C.caught.map((x) => x.desc)) || C.uncaught.length || P.uncaught.length) errs.push('exceptions ' + multiset(P.caught.map((x) => x.desc)) + ' vs ' + multiset(C.caught.map((x) => x.desc)) + ' ' + C.uncaught.join('|'));
        if (pillExc(C).length) errs.push('pill exception ' + JSON.stringify(pillExc(C)));
        const dP = domNorm(P.dom), dC = domNorm(C.dom);
        if (!(dP.length > 1000 && dP === dC)) { let at = 0; while (at < dP.length && dP[at] === dC[at]) at++; errs.push('DOM diff @' + at + ' …' + dP.slice(Math.max(0, at - 80), at + 120) + '… vs …' + dC.slice(Math.max(0, at - 80), at + 120)); }
        if (L === 'ar' && store === 'lsb+cc') console.log('     ' + id + ': ' + (C.pill && C.pill.href) + ' [' + chC.join(' > ') + ']');
        if (L === 'ar' && store === 'ctx-nocc') console.log('     ' + id + ': ' + (C.pill && C.pill.href) + ' [' + chC.join(' > ') + ']');
        if (errs.length) cBad.push(id + ': ' + errs.join('; ')); else nC++;
    }
    ok(cBad.length === 0, '[B] controls (' + nC + '/' + CTRL.length + ' London / Riyadh / Cairo / Seattle cases): pill + link + status chain (ends 200) identical PREV vs CAND, same caught exceptions, no uncaught, #page-moon DOM identical', cBad.slice(0, 4).join(' || '));
    cd.close();
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
