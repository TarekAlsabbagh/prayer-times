// SEO-UI-I18N-WIRING — local regression guard (no network: outbound guard, non-loopback hosts unresolvable, ads off).
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree.
//   [W] /{lang}/prayer-times-worldwide: the shared chrome is translated (no Arabic script on the 7 Latin-script langs
//       + bn), every internal href carries the language prefix (except /quran and assets), no /moon-today or
//       /prayer-times-in-mecca link (both 301), and every internal link answers 200.
//   [H] top-bar Hijri date (city pages × 10 langs) == "{wday}{sep}{day} {hmonth} {year}{suffix}" from i18n, weekday in
//       the city zone — the string the client writes; unchanged after hydration (browser, en/ur/bn/fr).
//   [A] apple-mobile-web-app-title == og:site_name of the page language (10 langs).
//   [P] the hidden city-only #pt-related-tools block is gone from the home pages and kept on city pages.
//   [C] "Browse all countries" button text == i18n countries.more in all 10 langs; split bundles == js/i18n.js.
//   [E] every other page identical to BASE after normalising exactly these changes (+ noise).
//   node scripts/_smoke_seo_ui_i18n_wiring_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import vm from 'node:vm';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const BASE_ROOT = process.env.TP_BASE_ROOT || 'C:/Users/Tarek/Downloads/timesprayers-shapbot';
const GUARD = process.env.TP_GUARD || 'C:/Users/Tarek/Downloads/timesprayers-shed-qa/guard.cjs';
const CHROME = process.env.TP_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const P0 = Number(process.env.TP_SMOKE_PORT || 8931);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 2 };
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const pfx = (L) => (L === 'ar' ? '' : '/' + L);
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const AR_RE = /[\u0600-\u06FF]/;
const COMBINED = process.env.TP_COMBINED === '1';
const d1Dep = new Set();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p, method) => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port, path: p, method: method || 'GET', headers: { 'accept-encoding': 'identity' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' })); r.end();
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 700) : '')); } };
const dec = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""').replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO').replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA').replace(/(i18n(?:-core)?(?:\/[a-z]{2})?\.js\?v=)\d+/g, '$1V');
const intended = (s) => noise(s)
    .replace(/(id="banner-hijri-date"[^>]*>)[^<]*(<)/g, '$1HIJRI$2')
    .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*/g, '$1T')
    .replace(/(<span data-i18n="countries\.more">)[^<]*(<\/span>)/g, '$1MORE$2');
const { TRANSLATIONS: I18N } = require(path.join(ROOT, 'js/i18n.js'));
const tr = (L, k) => { const D = I18N[L] || I18N.en, E = I18N.en; return D[k] != null ? D[k] : (E[k] != null ? E[k] : ''); };
const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.cand)];
const curated = JSON.parse(fs.readFileSync(path.join(ROOT, 'db/places/curated-places.json'), 'utf8'));
const tzOf = (slug) => ((curated.find((p) => p && p.slug === slug) || {}).timezone) || 'Asia/Riyadh';
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
let chrome = null;
try {
    for (const port of [PORT.base, PORT.cand]) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    // ---------------------------------------------------------------- [W]
    console.log('-- [W] worldwide (10 langs)');
    let wAr = 0, wPfx = 0, w301 = 0; const wBad = []; const links = new Set();
    const nonArScript = ['en', 'fr', 'tr', 'de', 'id', 'es', 'bn', 'ms'];
    for (const L of LANGS) {
        const c = await get(PORT.cand, pfx(L) + '/prayer-times-worldwide');
        const body = (c.b.split(/<body[^>]*>/)[1] || '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
        const text = body.replace(/<[^>]+>/g, ' ');
        if (nonArScript.includes(L)) { if (!AR_RE.test(text)) wAr++; else wBad.push(L + ' arabic: ' + (text.match(/[^\s]*[\u0600-\u06FF][^\s]*/g) || []).slice(0, 6).join(' ')); }
        const hrefs = [...c.b.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
        const unpref = L === 'ar' ? [] : hrefs.filter((h) => !new RegExp('^/' + L + '(?:/|$)').test(h) && !/^\/quran(?:\/|$)/.test(h) && !/\.(?:js|css|png|svg|ico|webmanifest|json|xml|txt)(?:\?|$)/.test(h) && !/^\/api\//.test(h));
        if (!unpref.length) wPfx++; else wBad.push(L + ' unprefixed: ' + unpref.slice(0, 5).join(' '));
        if (!hrefs.some((h) => /\/moon-today$|\/prayer-times-in-mecca$/.test(h))) w301++; else wBad.push(L + ' 301 link');
        // /{lang}/ home links (301) are fixed by batch D1. STANDALONE run (default): listed as a known D1 dependency, not
        //   hidden. COMBINED run (TP_COMBINED=1, all batches applied): no exception — they must be gone / answer 200.
        if (L === 'ar' || L === 'en' || L === 'ur') hrefs.forEach((h) => { if (!COMBINED && /^\/(?:en|fr|tr|ur|de|id|es|bn|ms)\/$/.test(h)) d1Dep.add(h); else links.add(h); });
    }
    ok(wAr === nonArScript.length, '[W] no Arabic script in the worldwide page body on en/fr/tr/de/id/es/bn/ms', wBad.filter((x) => /arabic/.test(x)).join(' | '));
    ok(wPfx === 10, '[W] every internal href carries the language prefix (except /quran, /api, assets)', wBad.filter((x) => /unprefixed/.test(x)).join(' | '));
    ok(w301 === 10, '[W] no /moon-today or /prayer-times-in-mecca link left', wBad.filter((x) => /301/.test(x)).join(' | '));
    let lOk = 0; const lBad = [];
    for (const h of links) { if (/\.(?:js|css|png|svg|ico|webmanifest)(?:\?|$)/.test(h)) { lOk++; continue; } const r = await get(PORT.cand, h, 'HEAD'); if (r.st === 200) lOk++; else lBad.push(h + ' ' + r.st); }
    ok(lOk === links.size, '[W] every internal link on the ar/en/ur worldwide pages answers 200 (' + links.size + ' unique' + (COMBINED ? ', combined run: no exception' : '') + ')', lBad.slice(0, 8).join(', '));
    if (!COMBINED) console.log('     known dependency on batch D1 (not counted here, checked in the combined run): ' + [...d1Dep].join(' ') + (d1Dep.size ? '' : '(none)'));
    // /moon-today fix: the destination of the moon quick-access card = /{lang}/moon, answers 200 in the same language
    let mDest = 0; const mDestBad = [];
    for (const L of LANGS) {
        const c = await get(PORT.cand, pfx(L) + '/prayer-times-worldwide');
        const href = (c.b.match(/<a class="qa-card" href="([^"]*\/moon)"/) || [])[1];
        const r = href ? await get(PORT.cand, href) : { st: 0, b: '' };
        const hl = (r.b.match(/<html lang="([a-z]{2})"/) || [])[1];
        if (href === pfx(L) + '/moon' && r.st === 200 && hl === L) mDest++; else mDestBad.push(L + ' href=' + href + ' st=' + r.st + ' lang=' + hl);
    }
    ok(mDest === 10, '[W] the moon card points to /{lang}/moon, which answers 200 in the same language (10 langs, raw HTML)', mDestBad.join(' | '));
    // ---------------------------------------------------------------- [H]
    console.log('-- [H] top-bar Hijri date');
    let hOk = 0, hN = 0; const hBad = [];
    for (const L of LANGS) for (const city of ['riyadh', 'london', 'karachi', 'new-york']) {
        const p = pfx(L) + '/prayer-times-in-' + city; hN++;
        const c = await get(PORT.cand, p);
        const got = dec((c.b.match(/id="banner-hijri-date"[^>]*>([^<]*)</) || [])[1] || '');
        const m = got.match(/(\d+) (.+) (\d{4})/);
        const wd = WD[new Intl.DateTimeFormat('en-US', { timeZone: tzOf(city), weekday: 'short' }).format(new Date())];
        const sep = (L === 'ar' || L === 'ur') ? '، ' : ', ';
        let want = null;
        if (m) { for (let mo = 1; mo <= 12; mo++) { const w = tr(L, 'wday.' + wd) + sep + m[1] + ' ' + tr(L, 'hmonth.' + mo) + ' ' + m[3] + tr(L, 'date.hijri_suffix'); if (w === got) { want = w; break; } } }
        if (want) hOk++; else hBad.push(p + ' got="' + got + '"');
    }
    ok(hOk === hN, '[H] SSR Hijri date == the client formula from i18n (wday, hmonth, suffix) on ' + hN + ' city pages', hBad.slice(0, 6).join(' | '));
    // ---------------------------------------------------------------- [A] [P] [C]
    console.log('-- [A][P][C]');
    let aOk = 0, pOk = 0, cOk = 0; const aBad = [], pBad = [], cBad = [];
    for (const L of LANGS) {
        const home = await get(PORT.cand, pfx(L) || '/'), city = await get(PORT.cand, pfx(L) + '/prayer-times-in-riyadh');
        const site = (city.b.match(/<meta property="og:site_name" content="([^"]*)"/) || [])[1];
        const app = (city.b.match(/<meta name="apple-mobile-web-app-title" content="([^"]*)"/) || [])[1];
        if (site && app === site) aOk++; else aBad.push(L + ' ' + app + ' vs ' + site);
        if (!/id="pt-related-tools"/.test(home.b) && /id="pt-related-tools"/.test(city.b)) pOk++; else pBad.push(L);
        const more = dec((home.b.match(/<span data-i18n="countries\.more">([^<]*)<\/span>/) || [])[1] || '');
        if (more && more === tr(L, 'countries.more')) cOk++; else cBad.push(L + ' "' + more + '"');
    }
    ok(aOk === 10, '[A] apple-mobile-web-app-title == og:site_name in the page language (10 langs)', aBad.join(' | '));
    // qibla rule (review finding): qibla routes are excluded — their HTML must stay byte-identical to BASE (only the
    //   i18n cache-buster differs; nothing else is normalised here)
    let qOk = 0, qN = 0; const qBad = [];
    for (const L of LANGS) for (const f of ['/qibla', '/qibla-in-cairo']) {
        const p = pfx(L) + f; qN++;
        let b = await get(PORT.base, p), c = await get(PORT.cand, p);
        if (noise(b.b) !== noise(c.b)) { await sleep(1500); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
        if (b.st === c.st && noise(b.b) === noise(c.b)) qOk++; else qBad.push(p);
    }
    ok(qOk === qN, '[A] qibla hub + city pages byte-identical to BASE in 10 langs (standing qibla rule)', qBad.join(', '));
    ok(pOk === 10, '[P] #pt-related-tools gone from the home pages, kept on city pages (10 langs)', pBad.join(', '));
    ok(cOk === 10, '[C] "browse all countries" button == i18n countries.more (10 langs)', cBad.join(' | '));
    const noop = () => {}; const store = { getItem: () => null, setItem: noop, removeItem: noop };
    const ctx = { console, setTimeout, clearTimeout, location: { pathname: '/', search: '', hash: '', href: 'http://127.0.0.1/', origin: 'http://127.0.0.1' }, localStorage: store, sessionStorage: store,
        navigator: { language: 'ar', languages: ['ar'] }, addEventListener: noop, removeEventListener: noop,
        document: { documentElement: { lang: 'ar', setAttribute: noop, getAttribute: () => null, classList: { add: noop, remove: noop } }, addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, readyState: 'complete' } };
    ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n-core.js'), 'utf8'), ctx);
    let miss = 0, diff = 0;
    for (const L of LANGS) { vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n/' + L + '.js'), 'utf8'), ctx); const got = ctx.TRANSLATIONS[L] || {}; for (const [k, v] of Object.entries(I18N[L])) { if (!(k in got)) miss++; else if (JSON.stringify(got[k]) !== JSON.stringify(v)) diff++; } }
    ok(miss === 0 && diff === 0, '[C] split bundles == js/i18n.js for 10 langs', 'missing ' + miss + ' diff ' + diff);
    // ---------------------------------------------------------------- [E]
    console.log('-- [E] other pages');
    let eOk = 0, eN = 0; const eBad = [];
    for (const L of ['', '/en', '/ur', '/bn']) for (const f of ['', '/prayer-times-in-riyadh', '/prayer-times-in-saudi-arabia', '/qibla-in-cairo', '/moon/saudi-arabia/riyadh', '/today-hijri-date', '/hijri-calendar/1448', '/date-converter', '/azkar/morning-azkar', '/zakat-calculator', '/next-prayer-in-london', '/guides']) {
        const p = (L + f) || '/'; eN++;
        let b = await get(PORT.base, p), c = await get(PORT.cand, p);
        // the home pages lose exactly the hidden tools section (<section … </section>; the whitespace around it stays)
        const strip = (s) => intended(s).replace(/<section class="section-card hd1-tools-section pt-related-tools[\s\S]*?<\/section>/, '');
        if (strip(b.b) !== strip(c.b)) { await sleep(1500); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
        if (b.st === c.st && (f === '' ? strip(b.b) === strip(c.b) : intended(b.b) === intended(c.b))) eOk++; else eBad.push(p);
    }
    ok(eOk === eN, '[E] ' + eN + ' pages identical to BASE after normalising only these changes (home: only the hidden #pt-related-tools section removed)', eBad.join(', '));
    // ---------------------------------------------------------------- [H2] hydrated
    console.log('-- [H2] hydrated Hijri date (headless Chrome)');
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-ui-'));
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    const cd = await cdp(ws); const errs = [];
    cd.on((d) => { if (d.method === 'Runtime.exceptionThrown') errs.push(1); });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Page.enable'); await cd.send('Runtime.enable');
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    let hy = 0; const hyBad = []; let errC = 0, errB = 0;
    for (const side of ['base', 'cand']) for (const p of ['/en/prayer-times-in-london', '/ur/prayer-times-in-karachi', '/bn/prayer-times-in-riyadh', '/fr/prayer-times-in-london', '/en/prayer-times-worldwide']) {
        errs.length = 0;
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT[side] + p });
        for (let i = 0; i < 60; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
        const raw = side === 'cand' ? dec(((await get(PORT.cand, p)).b.match(/id="banner-hijri-date"[^>]*>([^<]*)</) || [])[1] || '') : '';
        await sleep(3500);
        const after = await ev("(document.getElementById('banner-hijri-date')||{}).textContent||''");
        if (side === 'cand') { errC += errs.length; if (/worldwide/.test(p) || (raw && raw === after.trim())) hy++; else hyBad.push(p + ' ssr="' + raw + '" hydrated="' + after + '"'); } else errB += errs.length;
    }
    ok(hy === 5, '[H2] the Hijri date does not change after hydration (en/ur/bn/fr) and the worldwide page loads', hyBad.join(' | '));
    // /moon-today fix AFTER JavaScript: no anchor points at /moon-today; the moon card still points at /{lang}/moon
    let wj = 0; const wjBad = [];
    for (const L of ['ar', 'en', 'fr', 'ur']) {
        errs.length = 0;
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT.cand + pfx(L) + '/prayer-times-worldwide' });
        for (let i = 0; i < 60; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
        await sleep(3000);
        const st = await ev("(()=>{const a=[...document.querySelectorAll('a[href]')].map(e=>new URL(e.getAttribute('href'),location.href).pathname);const card=document.querySelector('a.qa-card[href$=\"/moon\"]');return {moonToday:a.filter(p=>/\\/moon-today$/.test(p)).length,card:card?new URL(card.getAttribute('href'),location.href).pathname:null,lang:document.documentElement.lang}})()");
        if (st && st.moonToday === 0 && st.card === (pfx(L) + '/moon') && st.lang === L && !errs.length) wj++; else wjBad.push(L + ' ' + JSON.stringify(st) + ' errors=' + errs.length);
    }
    ok(wj === 4, '[H2] worldwide after JavaScript: no /moon-today link, moon card → /{lang}/moon, page language kept (ar/en/fr/ur)', wjBad.join(' | '));
    ok(errC <= errB, '[H2] no new page errors (base ' + errB + ', cand ' + errC + ')');
    cd.close();
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
