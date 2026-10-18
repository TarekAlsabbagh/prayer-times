// SEO-SHARE-LINKS-OFFICIAL-1 + SEO-HOME-URL-NO-SLASH-1 + SEO-BREADCRUMB-HOME-LABEL-1 + SEO-MOON-BREADCRUMB-PLACEHOLDERS-1
//   local regression guard (no network: outbound guard, non-loopback hosts unresolvable in Chrome, ads blocked/off).
//   BASE = clean production tree (env TP_BASE_ROOT), CAND = this tree.
//   [S] share buttons share THIS page: url = the page canonical (official domain, path + language), text = its <title>;
//       no Render hostname anywhere in the served HTML / llms.txt.
//   [H] no /{lang}/ home URL (301) left in hrefs or BreadcrumbList items on 9 non-Arabic languages × the families;
//       /{lang} answers 200.
//   [L] the visible breadcrumb «Home» label == the BreadcrumbList home name (country, moon city/year/month, zakat,
//       hijri month/year, prayer city) × 10 languages.
//   [M] nested moon city pages: no hidden year / month / day rung left; visible rungs == BreadcrumbList items; no href="#".
//   [E] nothing else changed: BASE and CAND are byte-identical after normalising exactly these four changes (+ noise).
//   [C] hydrated (headless Chrome, en): the client home links / BreadcrumbList home items carry no trailing slash; no
//       new page errors.
//   node scripts/_smoke_seo_share_breadcrumb_links_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
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
const P0 = Number(process.env.TP_SMOKE_PORT || 8921);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 2 };
const ORIGIN = 'https://timesprayers.com';
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const NONAR = LANGS.slice(1);
const pfx = (L) => (L === 'ar' ? '' : '/' + L);
const HOME = { ar: 'الرئيسية', en: 'Home', fr: 'Accueil', tr: 'Ana Sayfa', ur: 'ہوم', de: 'Startseite', id: 'Beranda', es: 'Inicio', bn: 'হোম', ms: 'Utama' };
const AD_BLOCK = ['*googlesyndication.com*', '*doubleclick.net*', '*googleadservices.com*', '*adtrafficquality.google*', '*fundingchoicesmessages.google.com*', '*googletagmanager.com*', '*google-analytics.com*', '*google.com/pagead*', '*gstatic.com/ads*'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (port, p) => new Promise((res) => {
    const r = http.get({ host: '127.0.0.1', port, path: p, headers: { 'accept-encoding': 'identity' } }, (x) => {
        const c = []; x.on('data', (d) => c.push(d)); x.on('end', () => res({ st: x.statusCode, h: x.headers, b: Buffer.concat(c).toString('utf8') }));
    });
    r.on('error', () => res({ st: 0, h: {}, b: '' }));
});
let pass = 0, fail = 0;
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 700) : '')); } };
const dec = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const noise = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""').replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO').replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS').replace(/(id="next-prayer-countdown">)[\d:]+/g, '$1COUNTDOWN')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA').replace(/js\/app\.js\?v=\d+/g, 'js/app.js?v=N');
// normalise exactly the four intended changes, applied to BOTH sides
const intended = (s) => noise(s)
    .replace(/(<a class="home-share-btn" id="share-[a-z]+" href=")[^"]*(")/g, '$1SHARE$2')
    .replace(/(href=")\/(en|fr|tr|ur|de|id|es|bn|ms)\/(")/g, '$1/$2$3')
    .replace(/("item":"https:\/\/timesprayers\.com\/(?:en|fr|tr|ur|de|id|es|bn|ms))\/(")/g, '$1$2')
    // the 404 page (noindex) builds its canonical from the same home URL: /{lang}/ → /{lang}
    .replace(/(<link rel="canonical" href="https:\/\/timesprayers\.com\/(?:en|fr|tr|ur|de|id|es|bn|ms))\/(")/g, '$1$2')
    .replace(/<li class="[^"]*" id="bc-(?:moon-year-sep|moon-year-li|month-sep|month-li|date-sep|date)"[^>]*\shidden(?=[\s>])[^>]*>(?:(?!<\/li>)[\s\S])*<\/li>[ \t]*\r?\n?/g, '')
    .replace(/(<a class="bc-link"[^>]*?)(?: data-i18n="(?:nav|breadcrumb)\.home")?(>)[^<]*(<\/a>)/g, (m, a, b, c) => /href="\/(?:[a-z]{2})?"|id="cbc-home"|id="bc-home"/.test(a) ? a + b + 'HOME' + c : m)
    .replace(/(<span itemprop="name" id="bc-home-name"[^>]*>)[^<]*(<\/span>)/g, '$1HOME$2')
    .replace(/(<nav class="country-breadcrumb" id="country-breadcrumb" aria-label=")[^"]*"(?: data-i18n-aria-label="common\.breadcrumb")?/, '$1BC"')
    .replace(/("@type":"ListItem","position":1,"name":")[^"]*(")/g, '$1HOME$2')
    .replace(/PrayerTimesApp\/1\.0 \(\+https:\/\/[^)]*\)/g, 'UA')
    // the inline home-link code this ticket changes in countries.html / guides.html / legal.html / prayer-times-cities.html
    .replace(/window\.location\.href = \(l === 'ar'\) \? '\/' : \('\/' \+ l(?: \+ '\/')?\);/g, 'GOHOME')
    .replace(/const homeHref    = [^\r\n]*/g, 'HOMEHREF');
const ldBlocks = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch (_) { return null; } }).filter(Boolean);
const bcLists = (html) => ldBlocks(html).flatMap((b) => (b['@graph'] ? b['@graph'] : [b])).filter((n) => n && n['@type'] === 'BreadcrumbList');
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: ORIGIN, SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.cand)];
const FAMILIES = ['', '/prayer-times-in-riyadh', '/prayer-times-in-london', '/prayer-times-in-saudi-arabia', '/prayer-times-worldwide', '/qibla', '/qibla-in-cairo',
    '/moon', '/moon/egypt', '/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026', '/moon/saudi-arabia/riyadh/2026/10', '/next-prayer-in-london',
    '/time-left-until-next-prayer-in-cairo', '/today-hijri-date', '/hijri-calendar', '/hijri-calendar/1448', '/hijri-calendar/1448-05', '/date-converter',
    '/ramadan-countdown', '/azkar', '/azkar/morning-azkar', '/zakat-calculator', '/msbaha', '/guides', '/guides/why-prayer-times-differ', '/about-us', '/privacy', '/does-not-exist-404'];
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
let chrome = null;
try {
    for (const port of [PORT.base, PORT.cand]) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    // ---------------------------------------------------------------- [S]
    console.log('-- [S] share buttons');
    let sOk = 0, sN = 0; const sBad = [];
    for (const p of ['/prayer-times-in-riyadh', '/en/prayer-times-in-london', '/ur/prayer-times-in-karachi', '/fr/qibla-in-cairo', '/en/today-hijri-date', '/prayer-times-worldwide', '/en/prayer-times-worldwide', '/de/prayer-times-in-saudi-arabia']) {
        const c = await get(PORT.cand, p);
        if (!/home-share-btn/.test(c.b)) continue;
        sN++;
        const can = (c.b.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
        const title = dec((c.b.match(/<title>([^<]*)<\/title>/) || [])[1] || '').trim();
        const hrefs = Object.fromEntries([...c.b.matchAll(/<a class="home-share-btn" id="(share-[a-z]+)" href="([^"]+)"/g)].map((m) => [m[1], dec(m[2])]));
        const q = (u, k) => { try { return new URL(u).searchParams.get(k); } catch (_) { return null; } };
        const good = can && can.startsWith(ORIGIN) && q(hrefs['share-twitter'], 'url') === can && q(hrefs['share-twitter'], 'text') === title
            && q(hrefs['share-facebook'], 'u') === can && q(hrefs['share-telegram'], 'url') === can && q(hrefs['share-whatsapp'], 'text') === title + ' ' + can;
        if (good) sOk++; else sBad.push(p + ' can=' + can + ' tw=' + hrefs['share-twitter']);
    }
    ok(sN >= 4 && sOk === sN,'share buttons = this page canonical (official domain, path + language) + its <title> (' + sN + ' pages)', sBad.join(' | '));
    let onr = 0; const onrBad = [];
    for (const p of ['/', '/en', '/prayer-times-in-riyadh', '/en/prayer-times-worldwide', '/llms.txt']) { const c = await get(PORT.cand, p); if (!/onrender\.com/.test(c.b)) onr++; else onrBad.push(p); }
    ok(onr === 5, 'no Render hostname in the served HTML / llms.txt', onrBad.join(', '));
    // ---------------------------------------------------------------- [H] + [L] + [E]
    console.log('-- [H][L][E] ' + FAMILIES.length + ' routes × 10 langs');
    let hBad = [], lBad = [], eBad = [], hBaseCount = 0, eN = 0, lN = 0;
    for (const L of LANGS) for (const f of FAMILIES) {
        const p = (pfx(L) + f) || '/';
        let b = await get(PORT.base, p), c = await get(PORT.cand, p);
        if (intended(b.b) !== intended(c.b)) { await sleep(1500); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
        eN++; if (b.st !== c.st || intended(b.b) !== intended(c.b)) eBad.push(p + ' ' + b.st + '/' + c.st);
        if (L !== 'ar') {
            const re = new RegExp('href="/' + L + '/"|"item":"' + ORIGIN.replace(/\./g, '\\.') + '/' + L + '/"', 'g');
            if ((b.b.match(re) || []).length) hBaseCount++;
            if ((c.b.match(re) || []).length) hBad.push(p);
        }
        // [L] visible home label vs BreadcrumbList home name (where both exist)
        const lists = bcLists(c.b);
        const vis = (c.b.match(/<a class="bc-link"[^>]*(?:id="cbc-home"|href="\/(?:[a-z]{2})?")[^>]*>([^<]*)<\/a>/) || c.b.match(/<span itemprop="name" id="bc-home-name"[^>]*>([^<]*)<\/span>/) || [])[1];
        if (vis && lists.length) { lN++; const ldHome = lists[0].itemListElement && lists[0].itemListElement[0] && lists[0].itemListElement[0].name; if (dec(vis).trim() !== ldHome || ldHome !== HOME[L]) lBad.push(p + ' vis=' + vis + ' ld=' + ldHome); }
    }
    ok(hBaseCount > 0 && hBad.length === 0, '[H] no /{lang}/ home URL in hrefs or BreadcrumbList items (BASE had them on ' + hBaseCount + ' pages)', hBad.slice(0, 8).join(', '));
    const homes = await Promise.all(NONAR.map((L) => get(PORT.cand, '/' + L)));
    ok(homes.every((r) => r.st === 200), '[H] /{lang} answers 200 for the 9 languages');
    ok(lBad.length === 0 && lN > 60, '[L] visible «Home» label == BreadcrumbList home name == the one label per language (' + lN + ' pages)', lBad.slice(0, 8).join(' | '));
    ok(eBad.length === 0, '[E] BASE == CAND after normalising only these four changes (' + eN + ' pages)', eBad.slice(0, 10).join(', '));
    // side effect on the 404 page: its canonical is built from the same home URL (/{lang}/ → /{lang}). The page must stay a
    //   real HTTP 404 with noindex — the canonical value is NOT a fix for indexing an error page, only reported here.
    let nfOk = 0; const nfBad = [], nfCan = [];
    for (const L of LANGS) {
        const p = pfx(L) + '/does-not-exist-404';
        const b = await get(PORT.base, p), c = await get(PORT.cand, p);
        const rb = (b.b.match(/<meta name="robots" content="([^"]*)"/) || [])[1], rc = (c.b.match(/<meta name="robots" content="([^"]*)"/) || [])[1];
        const cb = (b.b.match(/<link rel="canonical" href="([^"]*)"/) || [])[1], cc = (c.b.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
        if (c.st === 404 && b.st === 404 && rc === rb && /noindex/.test(rc || '')) nfOk++; else nfBad.push(p + ' ' + b.st + '/' + c.st + ' robots ' + rb + '/' + rc);
        if (cb !== cc) nfCan.push(L + ': ' + cb + ' → ' + cc);
    }
    ok(nfOk === 10, '[404] the 404 page stays HTTP 404 with the same noindex robots meta (10 langs)', nfBad.join(' | '));
    console.log('     [404] side effect (reported, not a fix): canonical changed on ' + nfCan.length + ' langs, e.g. ' + nfCan.slice(0, 2).join(' ; '));
    // ---------------------------------------------------------------- [M]
    console.log('-- [M] nested moon city breadcrumbs');
    let mOk = 0, mN = 0; const mBad = [];
    for (const L of LANGS) for (const f of ['/moon/saudi-arabia/riyadh', '/moon/saudi-arabia/riyadh/2026/10', '/moon/egypt/cairo']) {
        const p = pfx(L) + f; mN++;
        const c = await get(PORT.cand, p), b = await get(PORT.base, p);
        const nav = (c.b.match(/<nav class="moon-breadcrumb"[\s\S]*?<\/nav>/) || [''])[0];
        const hiddenLeft = /id="bc-(?:moon-year-li|month-li|date|moon-year-sep|month-sep|date-sep)"[^>]*\shidden(?=[\s>])/.test(nav);
        const visItems = [...nav.matchAll(/<li class="bc-item[^"]*"(?![^>]*\shidden(?=[\s>]))[^>]*>/g)].length;
        const ld = bcLists(c.b)[0];
        const baseHad = /id="bc-month-li"[^>]*\shidden/.test(b.b) || /id="bc-date"[^>]*\shidden/.test(b.b);
        if (c.st === 200 && !hiddenLeft && !/href="#"/.test(nav) && ld && ld.itemListElement.length === visItems && baseHad) mOk++; else mBad.push(p + ' hidden=' + hiddenLeft + ' vis=' + visItems + ' ld=' + (ld && ld.itemListElement.length));
    }
    ok(mOk === mN, '[M] no hidden placeholder rung left; visible rungs == BreadcrumbList items (' + mN + ' pages)', mBad.slice(0, 6).join(' | '));
    // ---------------------------------------------------------------- [C]
    console.log('-- [C] hydrated (headless Chrome, en)');
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-bc-'));
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    const cd = await cdp(ws); const errs = [];
    cd.on((d) => { if (d.method === 'Runtime.exceptionThrown') errs.push(String(d.params.exceptionDetails && (d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text)).slice(0, 160)); });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Page.enable'); await cd.send('Runtime.enable');
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    const READ = "(()=>{const a=[...document.querySelectorAll('a[href]')].map(e=>e.getAttribute('href')).filter(h=>/^(?:https?:\\/\\/[^/]+)?\\/en\\/$/.test(h));const ld=[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>s.textContent).join(' ');const ldBad=(ld.match(/\"item\":\"[^\"]*\\/en\\/\"/g)||[]).length;return {slashLinks:a.length,ldBad}})()";
    const res = { base: [], cand: [] };
    for (const side of ['base', 'cand']) {
        for (const p of ['/en/prayer-times-in-london', '/en/prayer-times-in-saudi-arabia', '/en/qibla', '/en/qibla-in-cairo', '/en/today-hijri-date', '/en/hijri-calendar/1448-05', '/en/moon/saudi-arabia/riyadh']) {
            errs.length = 0;
            await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT[side] + p });
            for (let i = 0; i < 60; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
            await sleep(3500);
            res[side].push(Object.assign({ p }, await ev(READ), { errs: errs.length }));
        }
    }
    const baseSlash = res.base.reduce((a, r) => a + r.slashLinks + r.ldBad, 0), candSlash = res.cand.reduce((a, r) => a + r.slashLinks + r.ldBad, 0);
    ok(baseSlash > 0 && candSlash === 0, '[C] after hydration no /en/ home link or BreadcrumbList item (BASE ' + baseSlash + ', CAND ' + candSlash + ')', JSON.stringify(res.cand.filter((r) => r.slashLinks || r.ldBad)));
    // review finding: the CLIENT BreadcrumbList on the Hijri year / month pages used its own ui.home (tr 'Anasayfa',
    //   ms 'Laman Utama'). After JS, every BreadcrumbList home name in the DOM must equal the one label per language.
    let hl = 0; const hlBad = [];
    for (const [L, p] of [['tr', '/tr/hijri-calendar/1448'], ['tr', '/tr/hijri-calendar/1448-05'], ['ms', '/ms/hijri-calendar/1448'], ['ms', '/ms/hijri-calendar/1448-05'], ['ur', '/ur/hijri-calendar/1448-05']]) {
        await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT.cand + p });
        for (let i = 0; i < 60; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
        await sleep(3500);
        const names = await ev("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].flatMap(s=>{try{const j=JSON.parse(s.textContent);return (j['@graph']||[j]).filter(n=>n&&n['@type']==='BreadcrumbList').map(n=>n.itemListElement&&n.itemListElement[0]&&n.itemListElement[0].name)}catch(e){return []}})");
        if (names && names.length && names.every((n) => n === HOME[L])) hl++; else hlBad.push(p + ' ' + JSON.stringify(names));
    }
    ok(hl === 5, '[C] after hydration every BreadcrumbList home name == the one label (tr Ana Sayfa, ms Utama, ur ہوم) on Hijri year/month pages', hlBad.join(' | '));
    ok(res.cand.reduce((a, r) => a + r.errs, 0) <= res.base.reduce((a, r) => a + r.errs, 0), '[C] no new page errors (base ' + res.base.reduce((a, r) => a + r.errs, 0) + ', cand ' + res.cand.reduce((a, r) => a + r.errs, 0) + ')');
    cd.close();
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
