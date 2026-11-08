// CLIENT-INNERHTML-ESCAPE-1 — local-only browser test of the client renderers that build markup from
// place names the server never cleans (/api/geocode passes Nominatim through, /api/search-place rows,
// the legacy ?name= query, sessionStorage / localStorage seeds).
//
//   node scripts/_test_client_innerhtml_escape_1.mjs [tree] [outDir] [--expect-defect]
//     tree    worktree to serve (default: this repo). outDir: where snapshots/results go.
//     --expect-defect  for the pre-fix tree: exit 0 only if the defect IS detected.
//
// Safety: server = <tree>/server.js with an outbound guard (no non-loopback connect / DNS / fetch),
// ADSENSE_CLIENT=off, empty Supabase, TZ=UTC, SITE_URL=https://timesprayers.com, ports 9960-9965.
// Chrome headless: every host except 127.0.0.1 unresolvable, ad/analytics + sw.js blocked, CDP 9966-9969.
// The browser's own /api/geocode, /api/search-place, /api/place-by-slug and /api/place-selected requests
// are answered by the test (CDP Fetch) — nothing reaches the server's Nominatim proxy, nothing is written.
// Markers are INERT: a made-up <zqmark> element and a data-zq attribute. If a renderer turns a name into
// markup, the marker becomes a real element / attribute (detected); if it escapes, the marker stays text.
import { spawn, execSync } from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const EXPECT_DEFECT = process.argv.includes('--expect-defect');
const TREE = path.resolve(args[0] || path.join(HERE, '..'));
const OUT = path.resolve(args[1] || path.join(os.tmpdir(), 'client-innerhtml-escape-1'));
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── outbound guard (written to a temp file, loaded with -r) ──
const GUARD = path.join(os.tmpdir(), 'tp-client-escape-guard.cjs');
fs.writeFileSync(GUARD, `'use strict';const net=require('net'),dns=require('dns');
const L=h=>!h||['127.0.0.1','::1','localhost','0.0.0.0','::'].includes(String(h))||/^127\\./.test(String(h));
const c=net.Socket.prototype.connect;net.Socket.prototype.connect=function(...a){const o=a[0];let h;
if(o&&typeof o==='object'&&!Array.isArray(o))h=o.host||(o.path?'pipe':'localhost');else if(typeof o==='number'||(typeof o==='string'&&/^\\d+$/.test(o)))h=typeof a[1]==='string'?a[1]:'localhost';else if(typeof o==='string')h='pipe';
if(h!=='pipe'&&!L(h)){const s=this;process.nextTick(()=>{const e=new Error('qa guard '+h);e.code='ECONNREFUSED';s.destroy(e)});return this}return c.apply(this,a)};
const lk=dns.lookup;dns.lookup=function(n,o,cb){if(typeof o==='function'){cb=o;o={}}if(!L(n)){const e=new Error('ENOTFOUND '+n);e.code='ENOTFOUND';process.nextTick(()=>cb(e));return}return lk.call(dns,n,o,cb)};
if(typeof fetch==='function'){const f=fetch;globalThis.fetch=function(i,n){let h='';try{h=new URL(typeof i==='string'?i:(i&&i.url)||String(i)).hostname}catch(_){}if(!L(h))return Promise.reject(new TypeError('qa guard'));return f.call(this,i,n)}}`);

const canListen = (p, h) => new Promise(res => { const s = net.createServer(); s.once('error', () => res(false)); s.listen(p, h, () => s.close(() => res(true))); });
const freePort = async (list) => { for (const p of list) if (await canListen(p, '127.0.0.1') && await canListen(p, '::')) return p; throw new Error('no free port in ' + list); };
const kill = (pid) => { try { execSync('taskkill /PID ' + pid + ' /T /F', { stdio: 'ignore' }); } catch (_) {} };

// ── fixtures ──
const TAG = 'Zq<zqmark data-zq="t">Tag</zqmark>';          // text context
const ATTR = 'Zq" data-zq="a';                              // attribute context
const CC_BAD = 'x" data-zq="c';                             // country code into URL / alt
const LEGIT = ["Xi'an", 'Saint-Pierre & Miquelon', 'Biel/Bienne', 'Al-`Ula', 'العُلا', 'لاہور', 'চট্টগ্রাম',
    'Saint-Étienne', 'Kuala Lumpur (Wilayah)', "N'Djamena", 'Trois-Rivières', 'L\u2019Aquila'];
const place = (name, country, cc, i) => ({ place_id: 7000 + i, osm_type: 'node', lat: String(21 + i * 0.37), lon: String(39 + i * 0.41),
    name, display_name: name + ', ' + country, class: 'place', type: 'city', addresstype: 'city', importance: 0.6 - i * 0.01,
    address: { city: name, country, country_code: cc }, namedetails: { name, 'name:en': name, 'name:ar': name } });
const v2row = (name, country, cc, type, i) => ({ slug: 'zq-row-' + i, displayName: name, secondaryName: name, countryName: country,
    countryCode: cc, typeLabel: type, type: 'city', lat: 21 + i, lng: 39 + i, timezone: 'Asia/Riyadh', source: 'discovered', provider: '' });
let MOCK = {};
const answer = (u) => {
    const url = new URL(u); const p = url.pathname; const q = url.searchParams;
    if (p === '/api/place-by-slug') return { status: 404, body: { found: false } };
    if (p === '/api/place-selected') return { status: 200, body: { ok: true } };
    if (p === '/api/search-place') return { status: 200, body: { status: 'ok', results: (MOCK.v2 || {})[q.get('q')] || [] } };
    if (p === '/api/geocode') {
        if (q.get('type') === 'reverse') return { status: 200, body: MOCK.reverse || {} };
        if (q.get('viewbox')) return { status: 200, body: MOCK.nearby || [] };
        const k = q.get('q') || q.get('city') || '';
        return { status: 200, body: (MOCK.search || {})[k] || MOCK.searchDefault || [] };
    }
    return null;
};

// ── boot server + Chrome ──
const SRVP = await freePort([9960, 9961, 9962, 9963, 9964, 9965]);
const DBG = await freePort([9966, 9967, 9968, 9969]);
const env = Object.assign({}, process.env, { PORT: String(SRVP), ADSENSE_CLIENT: 'off', SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '',
    SUPABASE_ANON_KEY: '', TZ: 'UTC', SITE_URL: 'https://timesprayers.com', WEB_CONCURRENCY: '1' });
const srv = spawn(process.execPath, ['-r', GUARD, 'server.js'], { cwd: TREE, env, stdio: ['ignore', 'pipe', 'pipe'] });
let slog = ''; srv.stdout.on('data', d => slog += d); srv.stderr.on('data', d => slog += d);
const BASE = 'http://127.0.0.1:' + SRVP;
let chrome, sock; const prof = path.join(os.tmpdir(), 'tp-client-escape-prof-' + SRVP);
const results = []; let fail = 0;
const cleanup = async () => { try { sock && sock.close(); } catch (_) {} if (chrome) kill(chrome.pid); kill(srv.pid); await sleep(700); try { fs.rmSync(prof, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch (_) {} };
try {
    for (let i = 0; i < 240 && !slog.includes('Server running at http://localhost:' + SRVP); i++) await sleep(250);
    if (!slog.includes('Server running at')) throw new Error('server did not start:\n' + slog.slice(-1500));
    for (let i = 0; i < 80; i++) { try { if ((await fetch(BASE + '/health')).ok) break; } catch (_) {} await sleep(250); }
    fs.rmSync(prof, { recursive: true, force: true });
    const CH = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
    chrome = spawn(CH, ['--headless=new', '--remote-debugging-port=' + DBG, '--user-data-dir=' + prof, '--no-first-run', '--no-default-browser-check',
        '--disable-extensions', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', '--disable-background-networking',
        '--disable-component-update', '--disable-sync', '--disable-features=OptimizationHints,MediaRouter,Translate', '--window-size=1280,900', 'about:blank'], { stdio: 'ignore' });
    let ws; for (let i = 0; i < 80 && !ws; i++) { try { const r = await fetch('http://127.0.0.1:' + DBG + '/json/new?about:blank', { method: 'PUT' }); if (r.ok) ws = (await r.json()).webSocketDebuggerUrl; } catch (_) {} if (!ws) await sleep(250); }
    if (!ws) throw new Error('chrome CDP not up');
    sock = new WebSocket(ws); await new Promise(r => sock.onopen = r);
    let id = 0; const pend = new Map(); let mocked = 0; const mockedPaths = new Set(); let loaded = false; const dialogs = []; const exceptions = []; const offsite = new Set();
    const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });
    sock.onmessage = (m) => {
        const d = JSON.parse(m.data);
        if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); return; }
        if (d.method === 'Page.loadEventFired') loaded = true;
        if (d.method === 'Page.javascriptDialogOpening') { dialogs.push(d.params.message); send('Page.handleJavaScriptDialog', { accept: false }); }
        if (d.method === 'Runtime.exceptionThrown') exceptions.push(String((d.params.exceptionDetails.exception || {}).description || d.params.exceptionDetails.text).slice(0, 160));
        if (d.method === 'Network.requestWillBeSent') { if (process.env.DEBUGF && d.params.request.url.indexOf("/api/") > 0) console.log('req', d.params.request.url.slice(0, 120)); const u = d.params.request.url; if (!u.startsWith(BASE) && !/^(data|blob|about):/.test(u)) offsite.add(new URL(u).hostname); }
        if (d.method === 'Fetch.requestPaused') { if (process.env.DEBUGF) console.log('paused', d.params.request.url.slice(0, 120));
            const a = answer(d.params.request.url);
            if (!a) { send('Fetch.failRequest', { requestId: d.params.requestId, errorReason: 'BlockedByClient' }); return; }
            mocked++; try { mockedPaths.add(new URL(d.params.request.url).pathname); } catch (_) {}
            send('Fetch.fulfillRequest', { requestId: d.params.requestId, responseCode: a.status,
                responseHeaders: [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }],
                body: Buffer.from(JSON.stringify(a.body), 'utf8').toString('base64') });
        }
    };
    const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : { evalErr: JSON.stringify(r).slice(0, 300) }; };
    await send('Network.enable'); await send('Page.enable'); await send('Runtime.enable');
    await send('Network.setBypassServiceWorker', { bypass: true });   // page requests never go through sw.js
    // One interception layer (CDP Fetch): the four API paths are answered by the test; ad / analytics
    //   hosts, the production host and the service worker script are failed (BlockedByClient).
    const fe = await send('Fetch.enable', { patterns: ['/api/geocode', '/api/search-place', '/api/place-by-slug', '/api/place-selected',
        'googlesyndication.com', 'doubleclick.net', 'googleadservices.com', 'adtrafficquality.google', 'fundingchoicesmessages.google.com',
        'googletagmanager.com', 'google-analytics.com', 'timesprayers.com', '/sw.js'].map(p => ({ urlPattern: '*' + p + '*', requestStage: 'Request' })) });
    if (fe.error) throw new Error('Fetch.enable: ' + JSON.stringify(fe.error));
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `(()=>{const Z=window.__zq={muts:[]};
const bad=e=>e&&e.nodeType===1&&(/^zqmark$/i.test(e.tagName)||e.hasAttribute('data-zq'));
const scan=n=>{if(bad(n))Z.muts.push(n.tagName+' '+n.outerHTML.slice(0,90));if(n&&n.querySelectorAll)n.querySelectorAll('zqmark,[data-zq]').forEach(c=>Z.muts.push(c.tagName+' '+c.outerHTML.slice(0,90)))};
new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')m.addedNodes.forEach(scan);else if(bad(m.target))Z.muts.push('attr '+m.target.tagName)}}).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-zq']});})()` });

    const SEL = ['#city-suggestions', '#faq-section', '#seo-line-1', '#seo-line-2', '#seo-line-3', '#nearby-grid', '#city-country-flag',
        '#loc-hero-smart-pill', '#qibla-breadcrumb', '#qibla-hero-title', '#qibla-main-cta', '#qibla-quicklinks', '#qibla-faq', '#qibla-related',
        '#qibla-hub-smart-pill', '#qibla-hub-visited-grid', '#related-services-grid', '#city-breadcrumb',
        '#cities-container', '#cities-suggestions'];   // country page (prayer-times-cities.html)
    const SNAP = `(()=>{const o={};for(const s of ${JSON.stringify(SEL)}){const e=document.querySelector(s);if(e)o[s]={html:e.innerHTML,text:e.textContent.replace(/\\s+/g,' ').trim()}}
const where=e=>{const a=[];for(let p=e.parentElement;p&&a.length<4;p=p.parentElement)a.push(p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(p.className&&typeof p.className==='string'?'.'+p.className.split(' ')[0]:''));return a.join('<')};const fin=[...document.querySelectorAll('zqmark,[data-zq]')].map(e=>e.tagName+' in '+where(e)+' '+e.outerHTML.slice(0,90));
return {snap:o,muts:[...new Set((window.__zq||{}).muts||[])].slice(0,12),final:fin.slice(0,12),h1:(document.querySelector('h1')||{}).textContent||''}})()`;
    const norm = s => String(s).replace(/http:\/\/127\.0\.0\.1:\d+/g, 'ORIGIN').replace(/\?v=\d+(&b=[0-9a-f]+)?/g, '?v=N');

    // scenario runner: storage = {session:{}, local:{}}; action = JS evaluated after load
    // check(actionResult) → '' when fine, else a reason (counted as a failure for that scenario)
    const run = async (name, { path: p, storage, action, wait = 2500, expectText = [], kind, check }) => {
        if (process.env.ONLY && !new RegExp(process.env.ONLY).test(name)) return null;
        await send('Storage.clearDataForOrigin', { origin: BASE, storageTypes: 'all' });
        await send('Network.clearBrowserCache');
        dialogs.length = 0; exceptions.length = 0; mocked = 0;
        if (storage) {
            loaded = false; await send('Page.navigate', { url: BASE + '/health' }); for (let i = 0; i < 40 && !loaded; i++) await sleep(100);
            await ev(`(()=>{const s=${JSON.stringify(storage)};for(const k in (s.session||{}))sessionStorage.setItem(k,s.session[k]);for(const k in (s.local||{}))localStorage.setItem(k,s.local[k]);return 1})()`);
        } else { await send('Page.navigate', { url: 'about:blank' }); await sleep(200); }
        loaded = false; await send('Page.navigate', { url: BASE + p });
        for (let i = 0; i < 120 && !loaded; i++) await sleep(250);
        await sleep(3500);
        let _ar;
        if (action) { _ar = await ev(action); if (process.env.DEBUGF) console.log("action ->", JSON.stringify(_ar).slice(0, 400)); await sleep(wait); }
        const r = await ev(SNAP);
        const allText = Object.values(r.snap || {}).map(v => v.text).join(' | ') + ' | ' + r.h1;
        const missing = expectText.filter(t => !allText.includes(t));
        const injected = (r.muts || []).length + (r.final || []).length;
        const checkFail = check ? (check(_ar) || '') : '';
        const rec = { name, kind, path: p, injected, muts: r.muts, final: r.final, missingText: missing, checkFail, actionResult: _ar, dialogs: [...dialogs], exceptions: [...exceptions],
            containers: Object.keys(r.snap || {}), snap: Object.fromEntries(Object.entries(r.snap || {}).map(([k, v]) => [k, norm(v.html)])) };
        results.push(rec);
        console.log((injected ? 'INJECTED ' : 'clean    ') + name.padEnd(34) + ' containers=' + rec.containers.length + ' missingText=' + missing.length + ' dialogs=' + dialogs.length + ' mocked=' + mocked + (checkFail ? ' CHECK=' + checkFail : ''));
        return rec;
    };

    // ── malicious scenarios (one per unclean source) ──
    const malPlaces = [place(TAG, 'Zqland', 'sa', 0), place('Zqcity', TAG, 'sa', 1), place('Zqccity', 'Zqland', CC_BAD, 2)];
    MOCK = { search: { zqmal: malPlaces }, nearby: [place(TAG, 'Zqland', 'sa', 3), place(TAG + '2', 'Zqland', 'sa', 4), place(TAG + '3', 'Zqland', 'sa', 5)],
        reverse: { address: { city: TAG, country: TAG, country_code: 'sa' }, namedetails: { 'name:en': TAG } },
        v2: { zqmal: [v2row(TAG, 'Zqland', 'sa', 'City', 0), v2row('Zqrow', TAG, 'sa', TAG, 1), v2row('Zqcc', 'Zqland', CC_BAD, 'City', 2)] } };
    const seed = (name, country, cc) => JSON.stringify({ lat: 21.5, lng: 39.2, name, country, countryCode: cc, englishName: name, englishCountry: country, timezone: 'Asia/Riyadh', _v: 2 });
    const LIT = '<zqmark';   // literal text a correct renderer shows
    // The qibla city renderer is called directly (as the geocodeSlug callback does): on a non-curated slug the
    //   boot call leaves the SSR hub heading in place on both trees, so the seed name would never be rendered.
    const QIBLA = (slug) => "loadQiblaPage({ mode: 'city', citySlug: '" + slug + "' })";
    await run('home-v1-nominatim', { kind: 'mal', path: '/en?searchV=1', action: `onCitySearchInput('zqmal')`, expectText: [LIT] });
    await run('home-online-broader', { kind: 'mal', path: '/en?searchV=1', action: `fetchCityOnlineBroader('zqmal')`, expectText: [LIT] });
    await run('home-online-button-query', { kind: 'mal', path: '/en?searchV=1', action: `onCitySearchInput(${JSON.stringify('zq' + TAG)})`, wait: 3000, expectText: [LIT] });
    await run('home-v2-search-place', { kind: 'mal', path: '/en?searchV=2', action: `fetchCitySuggestionsV2('zqmal')`, expectText: [LIT] });
    await run('city-legacy-query-name', { kind: 'mal', path: '/en/prayer-times-in-zqfake?lat=21.5&lng=39.2&name=' + encodeURIComponent(TAG) + '&country=' + encodeURIComponent(TAG), wait: 500, expectText: [LIT] });
    await run('city-session-seed+flag-alt', { kind: 'mal', path: '/en/prayer-times-in-zqseed', storage: { session: { city_zqseed: seed(TAG, ATTR, 'sa') } }, wait: 500, expectText: [LIT] });
    await run('city-ar-session-seed', { kind: 'mal', path: '/prayer-times-in-zqseed', storage: { session: { city_zqseed: seed(TAG, TAG, 'sa') } }, wait: 500, expectText: [LIT] });
    await run('city-coord-slug-reverse', { kind: 'mal', path: '/en/prayer-times-in-loc-21.5n-39.2e', wait: 500, expectText: [LIT] });
    await run('qibla-city-session-seed', { kind: 'mal', path: '/en/qibla-in-zqseed', storage: { session: { city_zqseed: seed(TAG, TAG, 'sa') } }, action: QIBLA('zqseed'), wait: 500, expectText: [LIT] });
    await run('qibla-hub-pill+visited', { kind: 'mal', path: '/en/qibla', storage: {
        session: { last_city_context: JSON.stringify({ lat: 21.5, lng: 39.2, name: TAG, englishName: TAG, country: 'Zqland', countryCode: 'sa' }) },
        local: { qibla_visited_cities: JSON.stringify([{ slug: 'zq" data-zq="s', englishName: TAG, lat: 21.5, lng: 39.2, ts: Date.now() }]) } }, wait: 500, expectText: [LIT] });
    await run('home-lsb-detected-pill', { kind: 'mal', path: '/en', storage: { local: { lsb_detected: JSON.stringify({ lat: 21.5, lng: 39.2, enName: TAG, arCity: TAG, names: { en: TAG }, ts: Date.now() }) } }, wait: 500, expectText: [LIT] });
    // country page (prayer-times-cities.html): last-location pill (lsb_detected = reverse-geocode name),
    //   discovered pick → grid card, hero "no local results for <query>", hero-dropdown row country code.
    const LSB = (o) => ({ local: { lsb_detected: JSON.stringify(Object.assign({ lat: 21.5, lng: 39.2, ts: Date.now() }, o)) } });
    const PICK = (q) => `(async()=>{const i=document.getElementById('country-city-filter');if(!i)return 'no-filter';i.value=${JSON.stringify(q)};onCountryCityFilter();await new Promise(r=>setTimeout(r,1800));const a=document.querySelector('#cities-container .city-link');if(!a)return 'no-result';a.click();await new Promise(r=>setTimeout(r,800));return 'picked'})()`;
    const NOLOCAL = (q) => `(()=>{const i=document.getElementById('search-input');if(!i)return 'no-input';i.value=${JSON.stringify(q)};onSearch();return 'ok'})()`;
    const HEROCC = (rows) => `(()=>{const b=document.getElementById('cities-suggestions');_heroSearchRender(b,${JSON.stringify(rows)},()=>{});return [...b.querySelectorAll('img.sugg-flag')].map(i=>i.getAttribute('src'))})()`;
    const ccRows = [{ displayName: 'ZqccBad', countryName: 'Zqland', countryCode: CC_BAD }, { displayName: 'ZqccUpper', countryName: 'X', countryCode: 'SA' }, { displayName: 'ZqccSpace', countryName: 'X', countryCode: ' fr ' }];
    const ccCheck = (srcs) => JSON.stringify(srcs) === JSON.stringify(['https://flagcdn.com/28x21/sa.png', 'https://flagcdn.com/28x21/fr.png']) ? '' : 'flags=' + JSON.stringify(srcs);
    MOCK.v2.zqpick = [v2row(TAG, 'Zqland', 'sa', 'City', 0)];
    MOCK.v2.zqpicka = [v2row('Zqar', 'Zqland', 'sa', 'City', 1)];
    MOCK.v2.zqpicka[0].names = { ar: TAG, en: TAG };
    await run('country-lsb-pill', { kind: 'mal', path: '/en/prayer-times-in-saudi-arabia', storage: LSB({ enName: TAG, arCity: TAG, names: { en: TAG } }), wait: 500, expectText: [LIT] });
    await run('country-ar-lsb-pill', { kind: 'mal', path: '/prayer-times-in-saudi-arabia', storage: LSB({ enName: 'Zq', arCity: TAG, names: { ar: TAG } }), wait: 500, expectText: [LIT] });
    await run('country-discovered-pick', { kind: 'mal', path: '/en/prayer-times-in-saudi-arabia', action: PICK('zqpick'), wait: 800, expectText: [LIT] });
    await run('country-ar-discovered-pick', { kind: 'mal', path: '/prayer-times-in-saudi-arabia', action: PICK('zqpicka'), wait: 800, expectText: [LIT] });
    await run('country-no-local-query', { kind: 'mal', path: '/en/prayer-times-in-saudi-arabia', action: NOLOCAL('zq' + TAG), wait: 1500, expectText: [LIT] });
    await run('country-hero-row-cc', { kind: 'mal', path: '/en/prayer-times-in-saudi-arabia', action: HEROCC(ccRows), wait: 300, expectText: ['ZqccBad', 'ZqccUpper', 'ZqccSpace'], check: ccCheck });

    // ── legitimate names: same text as before (and, across trees, the same markup) ──
    MOCK = { search: { zqlega: LEGIT.slice(0, 6).map((n, i) => place(n, 'Legitland', 'fr', i)), zqlegb: LEGIT.slice(6).map((n, i) => place(n, 'Côte d\u2019Ivoire & Co', 'ci', 10 + i)) },
        nearby: LEGIT.slice(0, 5).map((n, i) => place(n, 'Legitland', 'fr', 20 + i)),
        v2: { zqlegit: LEGIT.slice(0, 8).map((n, i) => v2row(n, 'Bosnia & Herzegovina', 'ba', 'City', i)) } };
    await run('legit-home-v1-a', { kind: 'legit', path: '/en?searchV=1', action: `onCitySearchInput('zqlega')`, expectText: LEGIT.slice(0, 6) });
    await run('legit-home-v1-b', { kind: 'legit', path: '/en?searchV=1', action: `onCitySearchInput('zqlegb')`, expectText: LEGIT.slice(6) });
    await run('legit-home-online-broader', { kind: 'legit', path: '/en?searchV=1', action: `fetchCityOnlineBroader('zqlega')`, expectText: LEGIT.slice(0, 6) });
    await run('legit-home-v2', { kind: 'legit', path: '/en?searchV=2', action: `fetchCitySuggestionsV2('zqlegit')`, expectText: LEGIT.slice(0, 8) });
    for (const [i, n] of LEGIT.entries()) {
        await run('legit-city-' + i, { kind: 'legit', path: '/en/prayer-times-in-zqleg' + i, storage: { session: { ['city_zqleg' + i]: seed(n, 'Saint-Pierre & Miquelon', 'pm') } }, wait: 300, expectText: [n] });
        if (i % 3 === 0) await run('legit-qibla-' + i, { kind: 'legit', path: '/en/qibla-in-zqleg' + i, storage: { session: { ['city_zqleg' + i]: seed(n, 'Legitland', 'fr') } }, action: QIBLA("zqleg" + i), wait: 300, expectText: [n] });
    }
    await run('legit-ar-city', { kind: 'legit', path: '/prayer-times-in-zqlegar', storage: { session: { city_zqlegar: seed('العُلا', 'السعودية', 'sa') } }, wait: 300, expectText: ['العُلا'] });
    await run('legit-ur-city', { kind: 'legit', path: '/ur/prayer-times-in-zqlegur', storage: { session: { city_zqlegur: seed('لاہور', 'پاکستان', 'pk') } }, wait: 300, expectText: [] });
    await run('legit-bn-city', { kind: 'legit', path: '/bn/prayer-times-in-zqlegbn', storage: { session: { city_zqlegbn: seed('চট্টগ্রাম', 'বাংলাদেশ', 'bd') } }, wait: 300, expectText: ['চট্টগ্রাম'] });
    // country page, legitimate names (& ' / accents / Arabic): shown as the same text
    MOCK.v2.zqpickl = [v2row("Xi'an & Co", 'Saudi Arabia', 'sa', 'City', 40)];
    MOCK.v2.zqpickla = [v2row('Zqlar', 'Saudi Arabia', 'sa', 'City', 41)];
    MOCK.v2.zqpickla[0].names = { ar: 'العُلا', en: "Al-'Ula & Co" };
    await run('legit-country-lsb-pill', { kind: 'legit', path: '/en/prayer-times-in-saudi-arabia', storage: LSB({ enName: 'Saint-Pierre & Miquelon', arCity: 'x', names: { en: 'Saint-Pierre & Miquelon' } }), wait: 500, expectText: ['Saint-Pierre & Miquelon'] });
    await run('legit-country-ar-lsb-pill', { kind: 'legit', path: '/prayer-times-in-saudi-arabia', storage: LSB({ enName: "Xi'an", arCity: 'العُلا', names: { ar: 'العُلا' } }), wait: 500, expectText: ['العُلا'] });
    await run('legit-country-fr-lsb-pill', { kind: 'legit', path: '/fr/prayer-times-in-saudi-arabia', storage: LSB({ enName: "L'Aquila", arCity: 'x', names: { fr: 'Saint-Étienne & L’Isle' } }), wait: 500, expectText: ['Saint-Étienne & L’Isle'] });
    await run('legit-country-discovered-pick', { kind: 'legit', path: '/en/prayer-times-in-saudi-arabia', action: PICK('zqpickl'), wait: 800, expectText: ["Prayer Times in Xi'an & Co"] });
    await run('legit-country-ar-discovered-pick', { kind: 'legit', path: '/prayer-times-in-saudi-arabia', action: PICK('zqpickla'), wait: 800, expectText: ['العُلا', "Al-'Ula & Co"] });
    await run('legit-country-no-local-query', { kind: 'legit', path: '/en/prayer-times-in-saudi-arabia', action: NOLOCAL("Zq Xi'an & Co"), wait: 1500, expectText: ['No local results for "Zq Xi\'an & Co"'] });
    // curated pages (no mocked names) — markup parity only
    for (const p of ['/en/prayer-times-in-riyadh', '/prayer-times-in-riyadh', '/en/qibla-in-riyadh', '/qibla-in-riyadh', '/en', '/qibla',
        '/en/prayer-times-in-saudi-arabia', '/prayer-times-in-saudi-arabia', '/fr/prayer-times-in-canada', '/en/prayer-times-in-canada', '/bn/prayer-times-in-bangladesh', '/en/moon/saudi-arabia'])
        await run('curated ' + p, { kind: 'legit', path: p, wait: 0 });

    const offsiteList = [...offsite];
    const mal = results.filter(r => r.kind === 'mal'), leg = results.filter(r => r.kind === 'legit');
    const malInjected = mal.filter(r => r.injected || r.checkFail), legBad = leg.filter(r => r.injected || r.missingText.length || r.checkFail);
    const anyDialogs = results.filter(r => r.dialogs.length);
    fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ tree: TREE, offsite: offsiteList, results }, null, 1));
    console.log('\nmalicious scenarios: ' + mal.length + ', injected: ' + malInjected.length + ' [' + malInjected.map(r => r.name).join(', ') + ']');
    console.log('malicious scenarios rendered as text (marker visible): ' + mal.filter(r => !r.missingText.length).length + '/' + mal.length);
    console.log('legit scenarios: ' + leg.length + ', wrong (injected or text missing): ' + legBad.length + ' [' + legBad.map(r => r.name + ':' + r.missingText.join('/')).join(', ') + ']');
    console.log('native dialogs: ' + anyDialogs.length + '; off-site hosts attempted (all unresolvable): ' + offsiteList.join(', '));
    if (EXPECT_DEFECT) { if (!malInjected.length) { console.log('FAIL: defect not detected on this tree'); fail++; } else console.log('OK: defect detected (' + malInjected.length + ' scenarios)'); }
    else {
        if (malInjected.length) { console.log('FAIL: names became markup'); fail++; }
        if (mal.some(r => r.missingText.length)) { console.log('FAIL: a malicious name was not shown as text: ' + mal.filter(r => r.missingText.length).map(r => r.name).join(', ')); fail++; }
        if (legBad.length) { console.log('FAIL: legitimate names'); fail++; }
        if (anyDialogs.length) { console.log('FAIL: dialogs'); fail++; }
        console.log(fail ? 'RESULT: FAIL (' + fail + ')' : 'RESULT: PASS (0 failures)');
    }
} catch (e) { console.error(e); fail++; }
finally { fs.writeFileSync(path.join(OUT, 'server.log'), slog); await cleanup(); }
process.exit(fail ? 1 : 0);
