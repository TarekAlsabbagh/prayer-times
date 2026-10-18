// SEO-FAQ-SINGLE-SOURCE-1 (+ the ﷺ glyph fix) — local regression guard (no network: outbound guard, every non-loopback
//   host unresolvable in Chrome, ad domains blocked, ADSENSE off). BASE = clean production tree (env TP_BASE_ROOT).
//   [G] glyph: no U+FEFA left in js/i18n.js or the split bundles; the 17 hijri_ny strings carry U+FDFA; the Hijri
//       new-year countdown pages (8 langs) show ﷺ and not ﻺ in the visible text and the FAQ JSON-LD.
//   [B] split bundles == js/i18n.js for all 10 langs (core + lang loaded in a vm like the browser); pages request
//       the bumped _i18nVersion.
//   [H] home (10 langs): every FAQPage Q/A is the visible FAQ text (same order, same count), inLanguage = page lang,
//       and the JSON-LD of de/id/es/bn/ms has no Arabic script any more (it was Arabic in BASE).
//   [M] moon hub (10 langs): the visible #moon-hub-faq section stays identical to BASE (owner: separate translation ticket);
//       inside, no Arabic on Latin-script pages; the hub FAQPage JSON-LD is byte-identical to BASE; the moon city /
//       month pages no longer ship #moon-hub-faq; the hub no longer ships the empty #moon-general-faq wrapper.
//   [U] guides hub (10 langs): CollectionPage name == visible H1, ItemList == the visible cards (title + absolute URL,
//       language-prefixed); ar / en byte-identical to BASE.
//   [E] other families identical to BASE (normalised per-request noise + the i18n cache-buster).
//   [H2] hydrated (headless Chrome): the moon hub FAQ and the home FAQ keep their SSR text after the client runs
//       (en, fr, ur, de); no new page errors.
//   node scripts/_smoke_seo_faq_single_source_1.mjs   (env TP_BASE_ROOT, TP_GUARD, TP_SMOKE_PORT, TP_CHROME)
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
const P0 = Number(process.env.TP_SMOKE_PORT || 8901);
const PORT = { base: P0, cand: P0 + 1, cdp: P0 + 2 };
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const pfx = (L) => (L === 'ar' ? '' : '/' + L);
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
const ok = (c, n, d) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (d ? '  :: ' + String(d).slice(0, 600) : '')); } };
const dec = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const AR_RE = /[\u0600-\u06FF]/;
const norm = (s) => s.replace(/nonce="[^"]*"/g, 'nonce=""')
    .replace(/("article:modified_time" content=")[^"]*/g, '$1T')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g, 'ISO')
    .replace(/(id="current-time">)\d\d:\d\d:\d\d/g, '$1HMS')
    .replace(/((?:&amp;|&|\?)b=)[0-9a-f]{7,40}/g, '$1SHA')
    .replace(/(i18n(?:-core)?(?:\/[a-z]{2})?\.js\?v=)\d+/g, '$1V');
const ldBlocks = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch (_) { return null; } }).filter(Boolean);
const flat = (blocks) => blocks.flatMap((b) => (b['@graph'] ? b['@graph'] : [b]));
const faqPages = (html) => flat(ldBlocks(html)).filter((n) => n && n['@type'] === 'FAQPage');
const boot = (root, port) => spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: root, stdio: 'ignore',
    env: { ...process.env, PORT: String(port), WEB_CONCURRENCY: '1', TP_SSR_CACHE: '0', SITE_URL: 'https://timesprayers.com', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '', ADSENSE_CLIENT: 'off', TP_MOON_DAY_SHED: '0' } });
const kids = [boot(BASE_ROOT, PORT.base), boot(ROOT, PORT.cand)];
function cdp(wsUrl) {
    const ws = new WebSocket(wsUrl); let id = 0; const pending = new Map(); const handlers = [];
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); return; } if (d.method) handlers.forEach((h) => h(d)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    return new Promise((res) => { ws.onopen = () => res({ send, on: (h) => handlers.push(h), close: () => ws.close() }); });
}
let chrome = null;
try {
    // ---------------------------------------------------------------- [G] + [B] (files)
    console.log('-- [G][B] glyph + bundles');
    const i18nSrc = fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8');
    const bundleFiles = ['js/i18n-core.js', ...LANGS.map((L) => 'js/i18n/' + L + '.js')];
    const feFA = (t) => (t.match(/\uFEFA/g) || []).length;
    ok(feFA(i18nSrc) === 0 && bundleFiles.every((f) => feFA(fs.readFileSync(path.join(ROOT, f), 'utf8')) === 0), 'no U+FEFA in js/i18n.js or the 11 split files');
    const { TRANSLATIONS } = require(path.join(ROOT, 'js/i18n.js'));
    const nyKeys = []; for (const L of LANGS) for (const [k, v] of Object.entries(TRANSLATIONS[L] || {})) if (/^hijri_ny\./.test(k) && /\uFDFA/.test(v)) nyKeys.push(L + ':' + k);
    const fixed = [...['en', 'fr', 'tr', 'de', 'id', 'es', 'bn', 'ms'].flatMap((L) => [L + ':hijri_ny.faq_a5', L + ':hijri_ny.info_h3_body']), 'bn:hijri_ny.info_h1_body'];
    ok(fixed.every((k) => nyKeys.includes(k)), 'the 17 corrected hijri_ny strings carry U+FDFA (' + nyKeys.length + ' hijri_ny strings with ﷺ in all)', fixed.filter((k) => !nyKeys.includes(k)).join(','));
    // browser-like sandbox for the split files (they read location / document / storage at load)
    const noop = () => {};
    const store = { getItem: () => null, setItem: noop, removeItem: noop };
    const docEl = { lang: 'ar', dir: 'rtl', setAttribute: noop, getAttribute: () => null, classList: { add: noop, remove: noop, contains: () => false } };
    const win = { location: { pathname: '/', search: '', hash: '', href: 'http://127.0.0.1/', origin: 'http://127.0.0.1' }, localStorage: store, sessionStorage: store,
        navigator: { language: 'ar', languages: ['ar'] }, addEventListener: noop, removeEventListener: noop, dispatchEvent: noop,
        document: { documentElement: docEl, addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, readyState: 'complete' } };
    const ctx = Object.assign({ console, setTimeout, clearTimeout }, win); ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n-core.js'), 'utf8'), ctx);
    let miss = 0, diff = 0;
    for (const L of LANGS) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n/' + L + '.js'), 'utf8'), ctx);
        const got = (ctx.window.TRANSLATIONS || ctx.TRANSLATIONS || {})[L] || {};
        for (const [k, v] of Object.entries(TRANSLATIONS[L] || {})) { if (!(k in got)) miss++; else if (JSON.stringify(got[k]) !== JSON.stringify(v)) diff++; }
    }
    ok(miss === 0 && diff === 0, 'split bundles == js/i18n.js for 10 langs (vm load like the browser)', 'missing ' + miss + ' valDiff ' + diff);
    for (const port of [PORT.base, PORT.cand]) { for (let i = 0; i < 400; i++) { if ((await get(port, '/health')).st === 200) break; await sleep(300); } }
    const sv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8').match(/const _i18nVersion = '(\d+)'/);
    const pg = await get(PORT.cand, '/en/prayer-times-in-london');
    ok(sv && new RegExp('i18n/en\\.js\\?v=' + sv[1]).test(pg.b), 'pages request the bumped split-bundle version ?v=' + (sv && sv[1]));
    let nyOk = 0; const nyBad = [];
    for (const L of ['en', 'fr', 'tr', 'de', 'id', 'es', 'bn', 'ms']) {
        const r = await get(PORT.cand, pfx(L) + '/hijri-new-year-countdown');
        const ld = JSON.stringify(faqPages(r.b));
        if (r.st === 200 && !/\uFEFA/.test(r.b) && /\uFDFA/.test(r.b) && /\uFDFA/.test(ld)) nyOk++; else nyBad.push(L + ' ' + r.st);
    }
    ok(nyOk === 8, '[G] Hijri new-year countdown (8 langs): ﷺ in text + FAQ JSON-LD, no ﻺ', nyBad.join(', '));
    // ---------------------------------------------------------------- [H] home
    console.log('-- [H] home FAQ (10 langs)');
    let hOk = 0, hAr = 0, baseAr = 0; const hBad = [];
    for (const L of LANGS) {
        const p = pfx(L) || '/';
        const c = await get(PORT.cand, p), b = await get(PORT.base, p);
        const fq = faqPages(c.b).find((n) => String(n['@id'] || '').endsWith('#faq'));
        const vis = [...c.b.matchAll(/<div class="faq-question"[^>]*>([^<]*)<\/div>\s*<div class="faq-answer">\s*<p[^>]*>([^<]*)<\/p>/g)].map((m) => ({ q: dec(m[1]), a: dec(m[2]) }))
            .filter((x) => x.q.trim());   // skip the empty city-only q9 shell (hidden on home)
        const items = fq ? fq.mainEntity.map((e) => ({ q: e.name, a: e.acceptedAnswer.text })) : [];
        const same = items.length === 7 && vis.length === 7 && items.every((x, i) => x.q === vis[i].q && x.a === vis[i].a) && fq.inLanguage === L;
        if (same) hOk++; else hBad.push(L + ' ld ' + items.length + ' vis ' + vis.length);
        if (['de', 'id', 'es', 'bn', 'ms'].includes(L)) {
            if (fq && !AR_RE.test(JSON.stringify(fq))) hAr++;
            const bfq = faqPages(b.b).find((n) => String(n['@id'] || '').endsWith('#faq'));
            if (bfq && AR_RE.test(JSON.stringify(bfq))) baseAr++;
        }
    }
    ok(hOk === 10, '[H] FAQPage == visible home FAQ (7 Q/A, same order) with inLanguage = page lang, 10 langs', hBad.join(' | '));
    ok(baseAr === 5 && hAr === 5, '[H] de/id/es/bn/ms: JSON-LD was Arabic in BASE (' + baseAr + '/5), now has no Arabic (' + hAr + '/5)');
    // ---------------------------------------------------------------- [M] moon
    console.log('-- [M] moon hub FAQ (10 langs)');
    // Owner decision 2026-10-18: the hub's VISIBLE FAQ stays exactly as in production until its own translation ticket
    //   (keep the current topics, translate them, then build visible + JSON-LD from one source). This batch must not
    //   touch it: the #moon-hub-faq section and the hub FAQPage JSON-LD stay byte-identical to BASE.
    let mSec = 0, mLd = 0, mGen = 0; const mBad = [];
    for (const L of LANGS) {
        const p = pfx(L) + '/moon';
        const c = await get(PORT.cand, p), b = await get(PORT.base, p);
        const secOf = (h) => (h.match(/<section class="section-card moon-hub-faq hub-only" id="moon-hub-faq"[\s\S]*?<\/section>/) || [''])[0];
        const fq = faqPages(c.b).find((n) => String(n['@id'] || '').endsWith('#moon-faq'));
        const bfq = faqPages(b.b).find((n) => String(n['@id'] || '').endsWith('#moon-faq'));
        if (secOf(c.b) && norm(secOf(c.b)) === norm(secOf(b.b))) mSec++; else mBad.push(L);
        if (fq && bfq && JSON.stringify(fq) === JSON.stringify(bfq)) mLd++;
        if (!/id="moon-general-faq"/.test(c.b) && /id="moon-general-faq"/.test(b.b)) mGen++;
    }
    ok(mSec === 10, '[M] the hub visible FAQ section is unchanged (identical to BASE) in 10 langs — moved to its own translation ticket', mBad.join(', '));
    ok(mLd === 10, '[M] hub FAQPage JSON-LD byte-identical to BASE', mLd + '/10');
    ok(mGen === 10, '[M] the empty #moon-general-faq wrapper is gone from the hub (BASE had it)', mGen + '/10');
    let cityStrip = 0; const csBad = [];
    for (const p of ['/moon/saudi-arabia/riyadh', '/fr/moon/saudi-arabia/riyadh', '/en/moon/united-kingdom/london/2026/10', '/es/moon/united-states/new-york/2026/10', '/de/moon/egypt/cairo']) {
        const c = await get(PORT.cand, p), b = await get(PORT.base, p);
        if (c.st === 200 && !/id="moon-hub-faq"/.test(c.b) && /id="moon-hub-faq"/.test(b.b)) cityStrip++; else csBad.push(p + ' ' + c.st);
    }
    ok(cityStrip === 5, '[M] moon city / month pages no longer ship the hidden #moon-hub-faq (BASE did)', csBad.join(', '));
    // ---------------------------------------------------------------- [P] full-page guard (review finding: collateral loss)
    //   Everything on the moon hub, the moon city/month pages and the home pages must be identical to BASE once ONLY the
    //   intended regions are cut from BOTH sides: the stripped #moon-general-faq (hub) and #moon-hub-faq (city/month)
    //   and #moon-general-faq (hub) elements, and FAQPage JSON-LD nodes. Whitespace runs are collapsed (the server strip
    //   leaves different indentation) — any text / attribute / markup change still fails.
    console.log('-- [P] full-page guard');
    const removeEl = (html, id) => {
        const m = new RegExp('<(div|section)\\b[^>]*\\bid="' + id + '"[^>]*>').exec(html); if (!m) return html;
        const tag = m[1]; let depth = 0, i = m.index; const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'g'); re.lastIndex = i;
        let t; while ((t = re.exec(html))) { depth += t[1] ? -1 : 1; if (depth === 0) return html.slice(0, m.index) + html.slice(re.lastIndex); }
        return html;
    };
    const dropFaqLd = (html) => html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (m0, a, body, c) => {
        try { const j = JSON.parse(body); if (j['@graph']) { j['@graph'] = j['@graph'].filter((n) => n['@type'] !== 'FAQPage'); return a + JSON.stringify(j) + c; } return j['@type'] === 'FAQPage' ? '' : m0; } catch (_) { return m0; }
    });
    const cutHub = (html) => removeEl(html, 'moon-general-faq');   // only the stripped empty wrapper — the visible hub FAQ must stay identical
    const wsn = (s) => norm(s).replace(/\s+/g, ' ');
    let pOk = 0, pN = 0; const pBad = [];
    const pages = [...LANGS.map((L) => ['hub', pfx(L) + '/moon']), ['city', '/moon/saudi-arabia/riyadh'], ['city', '/en/moon/saudi-arabia/riyadh'], ['city', '/fr/moon/egypt/cairo/2026/10'], ['city', '/ur/moon/united-kingdom/london'],
        ['home', '/'], ['home', '/en'], ['home', '/de'], ['home', '/bn']];
    for (const [kind, p] of pages) {
        pN++;
        let b = await get(PORT.base, p), c = await get(PORT.cand, p);
        // the batch's own glyph fix (U+FEFA → U+FDFA) also shows in sections these pages embed: map exactly that character on BASE
        const cut = (h, side) => dropFaqLd(kind === 'hub' ? cutHub(h) : kind === 'city' ? (side === 'b' ? removeEl(h, 'moon-hub-faq') : h) : h)
            .replace(side === 'b' ? /ﻺ/g : /$^/g, 'ﷺ');
        if (wsn(cut(b.b, 'b')) !== wsn(cut(c.b, 'c'))) { await sleep(1500); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
        const A = wsn(cut(b.b, 'b')), B = wsn(cut(c.b, 'c'));
        if (b.st === c.st && A === B) pOk++; else { let k = 0; while (k < A.length && A[k] === B[k]) k++; pBad.push(p + ' @' + k + ' base:' + JSON.stringify(A.slice(Math.max(0, k - 60), k + 80)) + ' cand:' + JSON.stringify(B.slice(Math.max(0, k - 60), k + 80))); }
    }
    ok(pOk === pN, '[P] moon hub ×10, moon city/month ×4, home ×4: identical to BASE outside the intended regions (incl. the hub moon-seo-note)', pBad.slice(0, 3).join(' | '));
    let noteOk = 0; for (const L of LANGS) { const c = await get(PORT.cand, pfx(L) + '/moon'); if (/<p class="moon-seo-note">/.test(c.b)) noteOk++; }
    ok(noteOk === 10, '[P] the hub keeps its moon-seo-note paragraph in all 10 langs', noteOk + '/10');
    // ---------------------------------------------------------------- [U] guides
    console.log('-- [U] guides hub (10 langs)');
    let uOk = 0, uSame = 0; const uBad = [];
    for (const L of LANGS) {
        const p = pfx(L) + '/guides';
        const c = await get(PORT.cand, p), b = await get(PORT.base, p);
        const cp = flat(ldBlocks(c.b)).find((n) => n['@type'] === 'CollectionPage');
        const h1 = dec((c.b.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || ['', ''])[1].replace(/<[^>]+>/g, '').trim());
        const cards = [...c.b.matchAll(/<li class="guide-hub-card"><h3><a href="([^"]+)">([^<]*)<\/a><\/h3>/g)].map((m) => ({ url: 'https://timesprayers.com' + m[1], name: dec(m[2]).trim() }));
        const items = cp ? cp.mainEntity.itemListElement.map((e) => ({ url: e.url, name: e.name })) : [];
        const good = cp && cp.name === h1 && items.length > 0 && items.length === cards.length && items.every((x, i) => x.url === cards[i].url && x.name === cards[i].name)
            && items.every((x) => x.url.startsWith('https://timesprayers.com' + pfx(L) + '/guides/'));
        if (good) uOk++; else uBad.push(L + ' items ' + items.length + ' cards ' + cards.length + ' name=' + (cp && cp.name) + ' h1=' + h1);
        if ((L === 'ar' || L === 'en') && norm(b.b) === norm(c.b)) uSame++;
    }
    ok(uOk === 10, '[U] CollectionPage name == H1 and ItemList == visible cards (absolute, language-prefixed), 10 langs', uBad.join(' | '));
    ok(uSame === 2, '[U] ar + en guides hubs byte-identical to BASE');
    // ---------------------------------------------------------------- [E] others
    console.log('-- [E] other families');
    let eOk = 0, eN = 0; const eBad = [];
    for (const o of ['/prayer-times-in-riyadh', '/qibla-in-cairo', '/prayer-times-in-india', '/prayer-times-worldwide', '/today-hijri-date', '/hijri-calendar/1448', '/quran', '/azkar/morning-azkar', '/ramadan-countdown', '/next-prayer-in-london'])
        for (const L of ['', '/en', '/ur']) {
            const p = L + o; eN++;
            let b = await get(PORT.base, p), c = await get(PORT.cand, p);
            if (norm(b.b) !== norm(c.b)) { await sleep(1200); b = await get(PORT.base, p); c = await get(PORT.cand, p); }
            if (b.st === c.st && norm(b.b) === norm(c.b)) eOk++; else eBad.push(p);
        }
    ok(eOk === eN, '[E] ' + eN + ' pages of other families identical to BASE (normalised)', eBad.join(', '));
    // ---------------------------------------------------------------- [H2] hydrated
    console.log('-- [H2] hydrated (headless Chrome)');
    const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tp-faq-'));
    chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT.cdp, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
    let ws = null;
    for (let i = 0; i < 60 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + PORT.cdp + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_e) { /* not up */ } if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome did not start');
    const cd = await cdp(ws); const errs = [];
    cd.on((d) => { if (d.method === 'Runtime.exceptionThrown') errs.push(String(d.params.exceptionDetails && (d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text)).slice(0, 160)); });
    await cd.send('Network.enable'); await cd.send('Network.setBlockedURLs', { urls: AD_BLOCK }); await cd.send('Page.enable'); await cd.send('Runtime.enable');
    const ev = async (expr) => { const r = await cd.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };
    const READ_MOON = "[...document.querySelectorAll('#moon-hub-faq details')].map(d=>d.querySelector('summary').textContent.trim()+'|'+d.querySelector('p').textContent.trim()).join('\\n')";
    const READ_HOME = "[...document.querySelectorAll('.faq-item')].map(d=>(d.querySelector('.faq-question')||{}).textContent+'|'+((d.querySelector('.faq-answer p')||{}).textContent||'')).join('\\n')";
    let hyd = 0, hydN = 0; const hydBad = [];
    for (const side of ['base', 'cand']) {
        for (const [p, rd] of [['/en/moon', READ_MOON], ['/fr/moon', READ_MOON], ['/ur/moon', READ_MOON], ['/de', READ_HOME], ['/es', READ_HOME]]) {
            errs.length = 0;
            await cd.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT[side] + p });
            for (let i = 0; i < 60; i++) { await sleep(250); if ((await ev('document.readyState')) === 'complete') break; }
            const before = await ev(rd); await sleep(3500); const after = await ev(rd);
            // no-Arabic check only for the HOME FAQ; the moon hub FAQ is unchanged by this batch (owner: its own ticket)
            if (side === 'cand') { hydN++; if (before && before === after && !(/^\/(?:de|es)$/.test(p) && AR_RE.test(after.replace(/^.*?\|/gm, '')))) hyd++; else hydBad.push(p + ' changed=' + (before !== after)); if (errs.length) hydBad.push(p + ' errors: ' + errs.join(' ; ')); }
        }
    }
    ok(hyd === hydN && !hydBad.some((x) => /errors/.test(x)), '[H2] CAND hub + home FAQ keep their SSR text after hydration, no page errors', hydBad.join(' | '));
    cd.close();
} finally {
    for (const k of kids) { try { k.kill(); } catch (_) { /* gone */ } }
    if (chrome) { try { chrome.kill(); } catch (_) { /* gone */ } }
}
function latinOf(p) { return /^\/(en|fr|de|es)\b/.test(p); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
