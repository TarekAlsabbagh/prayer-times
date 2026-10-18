// TODAY-PAGES-ACCURACY-1 item 2b (JS error only) — local regression guard (no network: outbound guard on both servers,
//   every non-loopback host unresolvable in Chrome, ad / analytics URLs blocked, ADSENSE_CLIENT=off).
//   Defect: on /moon (+ 9 language copies) with a stored city (localStorage lsb_detected or sessionStorage
//   last_city_context) the smart pill threw "ReferenceError: Cannot access 'COUNTRY_SLUG_OVERRIDES' before
//   initialization". The _autoWireMoonHub IIFE calls _wireMoonHubSmartPill() synchronously while the deferred
//   app.js is still being evaluated (document.readyState === 'interactive'), and makeCountrySlug read a const that
//   was declared ~2,000 lines further down (temporal dead zone). _show swallowed the error, so the pill stayed hidden.
//   Fix: the const is declared next to COUNTRY_EN_NAMES near the top of js/app.js (moved; same value, same timing).
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree.
//   [S] source: CAND declares the const once, above the IIFE (BASE: below it), same value; CAND == BASE byte for byte
//       once the declaration block is cut from both; the minified app.js the servers actually serve: same check.
//   [B] headless Chrome; caught AND uncaught exceptions recorded (Debugger.setPauseOnExceptions 'all' +
//       Runtime.exceptionThrown):
//       - /moon and /en/moon with London stored (lsb_detected), /moon with Cairo in last_city_context:
//         BASE throws the TDZ error (chain makeCountrySlug <- _nestedMoonHrefClient <- ... <- _wireMoonHubSmartPill)
//         and keeps the pill hidden; CAND throws none and shows the pill exactly as BASE does when
//         _wireMoonHubSmartPill() is re-run after load (= the intended link /{lang}/moon/{country}/{city} with the
//         i18n prefix + CTA of the page language); the link answers 200.
//       - moon city pages with London stored, and /moon + /en/moon with no stored city (controls): same pill state on
//         both sides, no TDZ error on CAND.
//       - every other caught exception is the same on BASE and CAND, and the page DOM after JS is identical apart
//         from the pill (digits normalised: live moon values / clocks move between two loads).
//   [E] raw SSR HTML identical BASE vs CAND after normalising per-request noise (nonce, article:modified_time, ISO ms
//       stamps, #current-time / #next-prayer-countdown clocks, &b= build stamp, app.js?v).
//   node scripts/_smoke_today_pages_moon_pill_tdz_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-today-pages-base';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 9740);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 2 };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p, method) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method: method || 'GET', headers: { 'accept-encoding': 'identity', 'user-agent': 'Mozilla/5.0 smoke' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.end();
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 900) : '')); } };
// per-request / per-checkout noise only
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
const { TRANSLATIONS: I18N } = require(path.join(ROOT, 'js/i18n.js'));
const tr = (L, k) => { const D = I18N[L] || I18N.en; return D[k] != null ? D[k] : (I18N.en[k] != null ? I18N.en[k] : I18N.ar[k]); };
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
const TDZ_RE = /Cannot access 'COUNTRY_SLUG_OVERRIDES' before initialization/;
// ---- the declaration block (BASE position: after renderSchedule; CAND position: after COUNTRY_EN_NAMES)
//   = its comment lines + the const line + the blank line after it (cut from both → the two files must be identical)
const DECL_RE = /\/\/ COUNTRY-PRAYER-PAGE-COUNTRY-SLUG-MAPPING-FIX-1: SAR\/territory codes[^\n]*\n(?:\/\/[^\n]*\n)*const COUNTRY_SLUG_OVERRIDES = \{ mo: 'macau', hk: 'hong-kong' \};\r?\n\r?\n/;
const MIN_DECL = [/const COUNTRY_SLUG_OVERRIDES=\{mo:"macau",hk:"hong-kong"\};/, /,COUNTRY_SLUG_OVERRIDES=\{mo:"macau",hk:"hong-kong"\}/, /COUNTRY_SLUG_OVERRIDES=\{mo:"macau",hk:"hong-kong"\},/];
const cutMin = (s) => { for (const re of MIN_DECL) { if (re.test(s)) return s.replace(re, ''); } return s; };
const IIFE_SRC = '(function _autoWireMoonHub() {';
const IIFE_MIN = 'moon\\/?$)/.test(';   // the hub-path regex literal of the IIFE survives minification
const STORES = {
    none: '',
    'lsb-london': "localStorage.setItem('lsb_detected', JSON.stringify({arCity:'لندن',lat:51.5074,lng:-0.1278,enName:'London',country:'United Kingdom',countryCode:'gb',names:{ar:'لندن',en:'London'},ts:Date.now()}));",
    'ctx-cairo': "sessionStorage.setItem('last_city_context', JSON.stringify({name:'القاهرة',englishName:'Cairo',lat:30.0444,lng:31.2357,countryCode:'EG'}));"
};
// fix = the pill is expected to be shown on CAND (hub + stored city); want = the intended link + city label
const CASES = [
    { id: 'hub ar + London (lsb_detected)', path: '/moon', L: 'ar', store: 'lsb-london', fix: true, want: { href: '/moon/united-kingdom/london', city: 'لندن' } },
    { id: 'hub en + London (lsb_detected)', path: '/en/moon', L: 'en', store: 'lsb-london', fix: true, want: { href: '/en/moon/united-kingdom/london', city: 'London' } },
    { id: 'hub ar + Cairo (last_city_context)', path: '/moon', L: 'ar', store: 'ctx-cairo', fix: true, want: { href: '/moon/egypt/cairo', city: 'القاهرة' } },
    { id: 'city page ar + London stored', path: '/moon/united-kingdom/london', L: 'ar', store: 'lsb-london', fix: false },
    { id: 'city page en + London stored', path: '/en/moon/saudi-arabia/riyadh', L: 'en', store: 'lsb-london', fix: false },
    { id: 'hub ar, no stored city', path: '/moon', L: 'ar', store: 'none', fix: false },
    { id: 'hub en, no stored city', path: '/en/moon', L: 'en', store: 'none', fix: false }
];
const PILL_JS = "(()=>{const p=document.getElementById('moon-hub-smart-pill');if(!p)return null;const q=(s)=>{const e=p.querySelector(s);return e?e.textContent:null};return {hidden:p.hidden,visible:p.classList.contains('is-visible'),rendered:!!(p.offsetWidth||p.offsetHeight),href:p.getAttribute('href'),prefix:q('.mhsp-prefix'),city:q('.mhsp-city'),cta:q('.mhsp-cta')}})()";
const DOM_JS = "(()=>{const r=document.getElementById('page-moon')||document.body;const c=r.cloneNode(true);const p=c.querySelector('#moon-hub-smart-pill');if(p)p.remove();return c.outerHTML})()";
const domNorm = (s) => String(s || '').replace(/nonce="[^"]*"/g, '').replace(/\d/g, '#');
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.cand)];
let chrome = null;
try {
    for (const port of [PORT.base, PORT.cand]) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    // ---------------------------------------------------------------- [S]
    console.log('-- [S] source + served app.js');
    const srcB = fs.readFileSync(path.join(BASE_ROOT, 'js/app.js'), 'utf8'), srcC = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
    const declB = srcB.indexOf('const COUNTRY_SLUG_OVERRIDES ='), declC = srcC.indexOf('const COUNTRY_SLUG_OVERRIDES =');
    const nDeclC = srcC.split('const COUNTRY_SLUG_OVERRIDES').length - 1;
    ok(declB > srcB.indexOf(IIFE_SRC) && srcB.indexOf(IIFE_SRC) > 0, '[S] BASE declares the const AFTER the load-time _autoWireMoonHub IIFE (defect premise)', 'decl ' + declB + ' iife ' + srcB.indexOf(IIFE_SRC));
    ok(nDeclC === 1 && declC > 0 && declC < srcC.indexOf(IIFE_SRC) && declC < srcC.indexOf('function makeCountrySlug('), '[S] CAND declares it exactly once, above the IIFE and above makeCountrySlug', 'n=' + nDeclC + ' decl ' + declC + ' iife ' + srcC.indexOf(IIFE_SRC));
    ok(declC > srcC.indexOf('const COUNTRY_EN_NAMES = {'), '[S] CAND places it after COUNTRY_EN_NAMES (the other table makeCountrySlug reads)');
    const cutB = srcB.replace(DECL_RE, ''), cutC = srcC.replace(DECL_RE, '');
    ok(cutB !== srcB && cutC !== srcC && cutB === cutC, '[S] js/app.js: CAND == BASE byte for byte once the declaration block is cut from both (only the block moved)', 'cutB ' + (cutB !== srcB) + ' cutC ' + (cutC !== srcC) + ' eq ' + (cutB === cutC));
    ok(!/\r(?!\n)|[^\r]\n/.test(srcC.slice(0, 200000)) && (srcC.match(/\r\n/g) || []).length === (srcC.match(/\n/g) || []).length, '[S] CAND js/app.js keeps CRLF line endings throughout');
    const minB = (await get(PORT.base, '/js/app.js')).b, minC = (await get(PORT.cand, '/js/app.js')).b;
    const mDeclB = minB.indexOf('COUNTRY_SLUG_OVERRIDES={'), mDeclC = minC.indexOf('COUNTRY_SLUG_OVERRIDES={');
    ok(minB.length > 100000 && mDeclB > minB.indexOf(IIFE_MIN) && minB.indexOf(IIFE_MIN) > 0, '[S] served (minified) BASE app.js: declaration after the IIFE', mDeclB + ' / ' + minB.indexOf(IIFE_MIN));
    ok(minC.length > 100000 && mDeclC > 0 && mDeclC < minC.indexOf(IIFE_MIN), '[S] served (minified) CAND app.js: declaration before the IIFE', mDeclC + ' / ' + minC.indexOf(IIFE_MIN));
    ok(cutMin(minB) === cutMin(minC) && cutMin(minC) !== minC, '[S] served app.js: CAND == BASE once the minified declaration is cut from both', 'sizes ' + minB.length + ' / ' + minC.length);
    // ---------------------------------------------------------------- [E]
    console.log('-- [E] raw SSR HTML');
    const SSR = ['/moon', '/en/moon', '/fr/moon', '/ur/moon', '/moon/united-kingdom/london', '/en/moon/united-kingdom/london', '/moon/saudi-arabia/makkah', '/bn/moon/egypt/cairo',
        '/', '/en', '/prayer-times-in-london', '/en/prayer-times-in-cairo', '/today-hijri-date', '/en/today-hijri-date', '/qibla', '/en/qibla-in-cairo', '/prayer-times-in-saudi-arabia', '/en/moon/saudi-arabia'];
    let eOk = 0; const eBad = [];
    for (const p of SSR) {
        let b = await get(PORT.base, p), c = await get(PORT.cand, p);
        if (noise(b.b) !== noise(c.b)) { await sleep(1500); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
        if (b.st === c.st && b.st === 200 && noise(b.b) === noise(c.b)) eOk++; else eBad.push(p + ' ' + b.st + '/' + c.st);
    }
    ok(eOk === SSR.length, '[E] ' + SSR.length + ' URLs (moon hub + city pages, home, prayer, hijri, qibla, country) answer 200 with identical HTML after noise normalisation', eBad.join(', '));
    // ---------------------------------------------------------------- [B]
    console.log('-- [B] headless Chrome, stored-city scenarios');
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-tdz-'));
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
    const load = async (side, c) => {
        if (initId) await cd.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: initId });
        const r = await cd.send('Page.addScriptToEvaluateOnNewDocument', { source: '(()=>{try{localStorage.clear();sessionStorage.clear();' + STORES[c.store] + '}catch(_e){}})()' });
        initId = r.result && r.result.identifier;
        caught = []; uncaught = [];
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT[side] + c.path });
        for (let i = 0; i < 80; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
        await sleep(2500);
        const res = { caught: caught.slice(), uncaught: uncaught.slice(), pill: await ev(PILL_JS), dom: await ev(DOM_JS), lang: await ev('document.documentElement.lang') };
        res.tdz = res.caught.filter((x) => TDZ_RE.test(x.desc));
        return res;
    };
    const multiset = (arr) => { const m = {}; arr.forEach((x) => { m[x] = (m[x] || 0) + 1; }); return JSON.stringify(Object.keys(m).sort().map((k) => [k, m[k]])); };
    for (const c of CASES) {
        console.log('   · ' + c.id + '  (' + c.path + ')');
        const B = await load('base', c);
        const intended = c.fix ? await ev('(()=>{_wireMoonHubSmartPill();return ' + PILL_JS + '})()') : null;   // BASE, after full evaluation
        const C = await load('cand', c);
        const chain = B.tdz[0] ? B.tdz[0].frames.join(' <- ') : '';
        console.log('     BASE: TDZ ' + B.tdz.length + (chain ? ' [' + chain + ']' : '') + ', pill ' + JSON.stringify(B.pill));
        console.log('     CAND: TDZ ' + C.tdz.length + ', pill ' + JSON.stringify(C.pill));
        const others = C.caught.filter((x) => !TDZ_RE.test(x.desc)).map((x) => x.desc.replace(/^(\w+): /, '$1 ') + ' @' + x.frames.slice(0, 2).join('<'));
        if (others.length) console.log('     other caught exceptions (CAND; compared with BASE below): ' + others.join(' | '));
        ok(B.lang === c.L && C.lang === c.L, '[B] page language ' + c.L + ' on both sides', B.lang + ' / ' + C.lang);
        if (c.fix) {
            ok(B.tdz.length >= 1 && ['makeCountrySlug', '_nestedMoonHrefClient', '_wireMoonHubSmartPill'].every((f) => B.tdz[0].frames.includes(f)),
                '[B] BASE reproduces the defect: ReferenceError COUNTRY_SLUG_OVERRIDES (makeCountrySlug <- _nestedMoonHrefClient <- … <- _wireMoonHubSmartPill)', chain || JSON.stringify(B.caught.slice(0, 5)));
            ok(B.pill && B.pill.hidden === true && !B.pill.visible, '[B] BASE keeps the smart pill hidden', JSON.stringify(B.pill));
            ok(C.tdz.length === 0 && !C.caught.some((x) => /^ReferenceError/.test(x.desc)) && C.uncaught.length === 0, '[B] CAND: no TDZ / ReferenceError / uncaught exception', JSON.stringify(C.tdz.concat(C.caught.filter((x) => /^ReferenceError/.test(x.desc)))) + ' ' + C.uncaught.join(' | '));
            ok(C.pill && C.pill.hidden === false && C.pill.visible && C.pill.rendered, '[B] CAND shows the smart pill (visible + rendered)', JSON.stringify(C.pill));
            ok(intended && JSON.stringify(C.pill) === JSON.stringify(intended), '[B] CAND pill == BASE pill when _wireMoonHubSmartPill() is re-run after load (the intended result)', JSON.stringify(intended) + ' vs ' + JSON.stringify(C.pill));
            ok(C.pill && C.pill.href === c.want.href && C.pill.city === c.want.city && C.pill.prefix === tr(c.L, 'moon.hub.smart_pill_prefix') && C.pill.cta === tr(c.L, 'moon.hub.smart_pill_cta'),
                '[B] CAND pill: link ' + c.want.href + ', city "' + c.want.city + '", prefix + CTA from i18n (' + c.L + ')', JSON.stringify(C.pill));
            const lk = C.pill && C.pill.href ? await get(PORT.cand, C.pill.href) : { st: 0 };
            ok(lk.st === 200, '[B] the pill link answers 200 on CAND', (C.pill && C.pill.href) + ' ' + lk.st);
        } else {
            ok(C.tdz.length === 0 && C.uncaught.length === 0, '[B] CAND: no TDZ error, no uncaught exception (BASE TDZ ' + B.tdz.length + ')', JSON.stringify(C.tdz) + ' ' + C.uncaught.join(' | '));
            ok(JSON.stringify(B.pill) === JSON.stringify(C.pill), '[B] pill state identical on BASE and CAND', JSON.stringify(B.pill) + ' vs ' + JSON.stringify(C.pill));
        }
        const restB = multiset(B.caught.filter((x) => !TDZ_RE.test(x.desc)).map((x) => x.desc)), restC = multiset(C.caught.map((x) => x.desc));
        ok(restB === restC && multiset(B.uncaught) === multiset(C.uncaught), '[B] every other caught / uncaught exception identical (BASE ' + (B.caught.length - B.tdz.length) + ', CAND ' + C.caught.length + ')', restB + ' vs ' + restC + ' ; uncaught ' + B.uncaught.join('|') + ' vs ' + C.uncaught.join('|'));
        const dB = domNorm(B.dom), dC = domNorm(C.dom);
        let at = 0; while (at < dB.length && dB[at] === dC[at]) at++;
        ok(dB.length > 1000 && dB === dC, '[B] #page-moon DOM after JS identical apart from the pill (' + dB.length + ' chars, digits normalised)', 'first diff @' + at + ': BASE …' + dB.slice(Math.max(0, at - 120), at + 160) + '…  CAND …' + dC.slice(Math.max(0, at - 120), at + 160) + '…');
    }
    cd.close();
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
