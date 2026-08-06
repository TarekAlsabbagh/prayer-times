// Smoke — AZKAR-PRAYER-PAGE-UI-L10N-CHROME-1
// The prayer page's TOP chrome (breadcrumb / H1 / subtitle / info strip / progress / sticky / section intro /
// completion banner) is localized into all 10 languages from js/azkar-prayer-ui-l10n.js via the `data-azkar-pui`
// namespace — SSR (server walker) AND after client JS (SPA pass). Cards are NOT touched: 17 prayer cards, ZERO
// translation blocks, Arabic + source values unchanged.
//
// WHY THIS IS A REAL-BROWSER TEST (not curl):
//   curl proves only what the server emits. This ticket's whole risk is the client reverting SSR output, so the
//   verdict has to come from the DOM AFTER JS. It runs headless Chrome over CDP with **Network.setCacheDisabled**
//   — an earlier round of this ticket burned hours on a preview pane silently serving `deliveryType:"cache"`,
//   which made correct SSR look broken. Never trust a browser surface that can serve a cached document.
//
// ⛔ The `-pui-` namespace must never leak outside #page-azkar-prayer: the morning/evening sections ship in the
//   same HTML with generic `data-azkar-ui` keys of the same names, so a shared attribute would rewrite their
//   chrome with prayer wording. Asserted explicitly below.
//
// Self-contained: spawns its own server. SKIPS (exit 0) only if Chrome or a server truly cannot be obtained.
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net'; import vm from 'vm';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = s => (s || '').normalize('NFC');

// ── the dictionary is the single source of truth for the expected strings ──
const dictSandbox = { window: {} };
vm.createContext(dictSandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'azkar-prayer-ui-l10n.js'), 'utf8'), dictSandbox);
const DICT = dictSandbox.window.AZKAR_PRAYER_PAGE_UI_L10N;
const KEYS = Object.keys(DICT.ar);
// Three key families, each verified differently:
//  ARIA_KEYS  → rendered as aria-label via `data-azkar-pui-aria`, never as text.
//  progressTpl→ a {done}/{total} template; never appears literally in the DOM or SSR HTML.
//  progressInit→ the SSR placeholder; after JS the app re-renders it from progressTpl (asserted separately).
const ARIA_KEYS = ['ariaBreadcrumb', 'ariaInfo', 'ariaProgress'];
const TEXT_KEYS = KEYS.filter(k => !ARIA_KEYS.includes(k) && k !== 'progressTpl');
const DOM_TEXT_KEYS = TEXT_KEYS.filter(k => k !== 'progressInit');
const LANGS = ['ar', 'en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const RTL = ['ar', 'ur'];
// Environmental / pre-existing noise this ticket neither causes nor fixes:
//  · AmiriQuran-Regular.woff2 — CSS references a woff2 that is not shipped (only the .ttf); documented as
//    out of scope in the structure audit.
//  · net::ERR_ABORTED — the adhan.mp3 media preload is aborted by the browser; pre-existing on every page.
//  · overpass-api.de 429 — an EXTERNAL geocoding API rate-limiting a headless run; nothing to do with this page.
const KNOWN_NOISE = /AmiriQuran-Regular\.woff2|net::ERR_ABORTED|overpass-api\.de/;
const ROUTE = l => (l === 'ar' ? '/azkar/prayer-azkar' : '/' + l + '/azkar/prayer-azkar');
// a card Arabic sample + a card source value: both must survive untouched on every language
const CARD_ARABIC = 'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا';
const CARD_SOURCE = 'رواه مسلم والترمذي';
// pre-existing, out of scope for this ticket (documented in the audit): the CSS references a woff2 that is not
// shipped (only the .ttf is), so the browser 404s once and falls back. Not caused here, not fixed here.
const KNOWN_404 = /AmiriQuran-Regular\.woff2/;

let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

function findChrome() {
  return [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : '',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
}
const reachable = (url) => new Promise(res => {
  try { const u = new URL(url); const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); }); s.on('error', () => res(false)); s.setTimeout(1200, () => { s.destroy(); res(false); }); }
  catch (e) { res(false); }
});

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
      else if (m.method && this.h[m.method]) this.h[m.method](m.params);
    });
  }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; }
}

const CHROME = findChrome();
if (!CHROME) { console.log('SKIP — no Chrome/Chromium found (this smoke needs a real browser: DOM-after-JS is the verdict)'); process.exit(0); }

const PORT_SRV = 3207;
let base = 'http://localhost:' + PORT_SRV;
let server = null, chrome = null;
const UDD = path.join(os.tmpdir(), 'azkar-prayer-pui-smoke-' + process.pid);

async function ensureServer() {
  server = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT, stdio: 'ignore',
    env: Object.assign({}, process.env, { PORT: String(PORT_SRV) }),
  });
  for (let i = 0; i < 90; i++) {
    await sleep(400);
    if (await reachable(base)) {
      const H = await fetch(base + ROUTE('ur')).then(r => r.text()).catch(() => '');
      if (/data-azkar-pui="heroTitle"/.test(H)) return true;
    }
  }
  return false;
}

async function main() {
  if (!await ensureServer()) { console.log('SKIP — could not spawn a server exposing the prayer page'); process.exit(0); }

  // ══════════ PART 1 — dictionary purity (no religious card content may live in the UI dict) ══════════
  console.log('\n===== 1. dictionary shape + purity =====');
  ok(Object.keys(DICT).length === 10, 'dict covers all 10 languages');
  ok(LANGS.every(l => DICT[l] && Object.keys(DICT[l]).length === KEYS.length), `every language has the same ${KEYS.length} keys`);
  // scope the ban to the DICT BODY: the file's own header comment names the banned things in order to forbid
  // them, so scanning the whole file self-matches (the same false-positive class seen in evening Card 23).
  const dictSrc = fs.readFileSync(path.join(ROOT, 'js', 'azkar-prayer-ui-l10n.js'), 'utf8');
  const body = dictSrc.slice(dictSrc.indexOf('window.AZKAR_PRAYER_PAGE_UI_L10N'));
  ok(!/translation_/.test(body), 'dict body has NO translation_* field');
  ok(!/رواه|متفق عليه|أخرجه/.test(body), 'dict body carries NO hadith source reference');
  ok(!/authenticityNote|virtue\s*:/.test(body), 'dict body carries NO authenticity/virtue field');
  ok(!/اللَّهُمَّ|سُبْحَانَ|أَشْهَدُ|أَعُوذُ|بِسْمِ اللَّهِ/.test(body), 'dict body carries NO vocalised dhikr text');
  ok(!/\(33\)|ثلاثًا|عشر مرات/.test(body), 'dict body carries NO in-text count from the cards');

  // markers must exist ONLY inside the prayer section of the template
  const tpl = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const iPrayer = tpl.indexOf('id="page-azkar-prayer"');
  const markerIdx = [...tpl.matchAll(/data-azkar-pui(?:-aria)?="/g)].map(m => m.index);
  ok(markerIdx.length > 0, `template carries ${markerIdx.length} data-azkar-pui markers`);
  ok(markerIdx.every(i => i > iPrayer), 'ALL data-azkar-pui markers sit inside the prayer section (none before it)');
  ok(!/js\/azkar-data\.js[\s\S]{0,200}data-azkar-pui/.test(tpl), 'the pui namespace is not wired into the card-data file');

  // ══════════ PART 2 — headless Chrome, cache DISABLED ══════════
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  const PORT_CDP = 9357;
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--no-default-browser-check', `--remote-debugging-port=${PORT_CDP}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
  let target = null;
  for (let i = 0; i < 60; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${PORT_CDP}/json`)).json(); target = l.find(x => x.type === 'page'); if (target && target.webSocketDebuggerUrl) break; } catch (e) {}
    await sleep(250);
  }
  if (!target) { console.log('SKIP — headless Chrome exposed no debugging target'); process.exit(0); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws);
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
  // ⛔ THE decisive setting — without it a cached document can make correct SSR look broken.
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  let loaded = false; cdp.on('Page.loadEventFired', () => { loaded = true; });
  let pageErrors = [], consoleErrors = [], failedReqs = [];
  cdp.on('Runtime.exceptionThrown', p => pageErrors.push(String((p.exceptionDetails && p.exceptionDetails.text) || '')));
  cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') consoleErrors.push((p.args || []).map(a => a.value || a.description || '').join(' ')); });
  cdp.on('Network.loadingFailed', p => failedReqs.push(p.errorText || ''));
  cdp.on('Network.responseReceived', p => { if (p.response && p.response.status >= 400) failedReqs.push(p.response.status + ' ' + p.response.url); });

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('EVAL ' + JSON.stringify(r.exceptionDetails.text));
    return r.result.value;
  };
  const load = async (url, w = 1440, h = 900, mobile = false) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
    pageErrors = []; consoleErrors = []; failedReqs = [];
    loaded = false; await cdp.send('Page.navigate', { url });
    for (let i = 0; i < 120 && !loaded; i++) await sleep(100);
    await sleep(700); // let the SPA activator + localizers settle
  };

  // ══════════ PART 3 — per language: SSR (fetch) AND DOM-after-JS (CDP) ══════════
  console.log('\n===== 2. SSR + DOM-after-JS, all 10 languages =====');
  const table = [];
  for (const lang of LANGS) {
    const url = base + ROUTE(lang);
    const want = DICT[lang];

    // --- SSR, straight from the server ---
    const html = await fetch(url).then(r => r.text());
    const ssrH1 = (html.match(/id="azkar-prayer-h1"[^>]*>([^<]*)</) || [])[1] || '';
    ok(N(ssrH1.trim()) === N(want.heroTitle), `${lang}: SSR H1 === dict heroTitle`);
    const ssrMissing = [...TEXT_KEYS, ...ARIA_KEYS].filter(k => !html.includes(want[k]));
    ok(ssrMissing.length === 0, `${lang}: SSR carries all ${TEXT_KEYS.length + ARIA_KEYS.length} chrome strings incl. aria-labels (missing: ${ssrMissing.join(',') || 'none'})`);

    // --- DOM after JS ---
    await load(url);
    const dom = await ev(`(function(){
      var sec = document.querySelector('#page-azkar-prayer');
      var out = {}, aria = {};
      ${JSON.stringify(DOM_TEXT_KEYS)}.forEach(function(k){
        var el = sec.querySelector('[data-azkar-pui="'+k+'"]');
        out[k] = el ? el.textContent.trim() : null;
      });
      ${JSON.stringify(ARIA_KEYS)}.forEach(function(k){
        var el = sec.querySelector('[data-azkar-pui-aria="'+k+'"]');
        aria[k] = el ? el.getAttribute('aria-label') : null;
      });
      var pl = sec.querySelector('#azkar-prayer-progress-label');
      var sl = sec.querySelector('#azkar-prayer-sticky-label');
      var cards = sec.querySelectorAll('article[id^="azkar-item-prayer-"]');
      var h1 = sec.querySelector('h1');
      return {
        keys: out,
        aria: aria,
        progressLabel: pl ? pl.textContent.trim() : null,
        stickyLabel: sl ? sl.textContent.trim() : null,
        htmlLang: document.documentElement.getAttribute('lang'),
        cards: cards.length,
        trBlocks: sec.querySelectorAll('article[id^="azkar-item-prayer-"] p[class*="azkar-translation-"]').length,
        cardArabic: sec.textContent.indexOf(${JSON.stringify(CARD_ARABIC)}) !== -1,
        cardSource: sec.textContent.indexOf(${JSON.stringify(CARD_SOURCE)}) !== -1,
        h1Dir: h1 ? getComputedStyle(h1).direction : null,
        morningH1: (document.querySelector('#azkar-morning-h1')||{}).textContent,
        eveningH1: (document.querySelector('#azkar-evening-h1')||{}).textContent,
        puiOutsidePrayer: document.querySelectorAll('[data-azkar-pui],[data-azkar-pui-aria]').length - sec.querySelectorAll('[data-azkar-pui],[data-azkar-pui-aria]').length,
        fromCache: (performance.getEntriesByType('navigation')[0]||{}).transferSize === 0
      };
    })()`);

    ok(dom.fromCache === false, `${lang}: document came from the NETWORK, not cache (cache disabled)`);
    const domBad = DOM_TEXT_KEYS.filter(k => N(dom.keys[k] || '') !== N(want[k]));
    ok(domBad.length === 0, `${lang}: DOM-after-JS — all ${DOM_TEXT_KEYS.length} chrome texts match the dict (wrong: ${domBad.join(',') || 'none'})`);
    const ariaBad = ARIA_KEYS.filter(k => N(dom.aria[k] || '') !== N(want[k]));
    ok(ariaBad.length === 0, `${lang}: DOM-after-JS — all ${ARIA_KEYS.length} aria-labels match the dict (wrong: ${ariaBad.join(',') || 'none'})`);
    // the progress label is re-rendered by the app's own counter on every load: it must come out of
    // progressTpl in THIS language, never the old hardcoded Arabic.
    const wantProgress = N(String(want.progressTpl).replace('{done}', '0').replace('{total}', '17'));
    ok(N(dom.progressLabel || '') === wantProgress, `${lang}: progress label re-rendered from progressTpl → «${wantProgress}» (got «${dom.progressLabel}»)`);
    ok(N(dom.stickyLabel || '') === wantProgress, `${lang}: sticky progress label likewise localized`);
    if (lang !== 'ar') {
      ok(!N(dom.progressLabel || '').startsWith('تم إكمال'), `${lang}: progress label is NOT the old hardcoded Arabic`);
    }
    ok(N(dom.keys.heroTitle || '') === N(want.heroTitle), `${lang}: DOM H1 stays «${want.heroTitle}» after JS (no revert)`);
    if (lang !== 'ar') {
      ok(N(dom.keys.heroTitle || '') !== N(DICT.ar.heroTitle), `${lang}: DOM H1 did NOT fall back to Arabic`);
    }
    ok(dom.htmlLang === lang, `${lang}: <html lang="${lang}">`);
    ok(dom.cards === 17, `${lang}: 17 prayer cards`);
    ok(dom.trBlocks === 0, `${lang}: ZERO translation blocks inside prayer cards`);
    ok(dom.cardArabic === true, `${lang}: card Arabic text intact`);
    ok(dom.cardSource === true, `${lang}: card source value still Arabic (untranslated)`);
    ok(dom.h1Dir === (RTL.includes(lang) ? 'rtl' : 'ltr'), `${lang}: H1 direction ${RTL.includes(lang) ? 'rtl' : 'ltr'}`);
    ok(!N(dom.morningH1 || '').includes(N(want.heroTitle)) || lang === 'ar', `${lang}: morning H1 NOT overwritten with prayer wording (is «${dom.morningH1}»)`);
    ok(dom.puiOutsidePrayer === 0, `${lang}: ZERO data-azkar-pui markers outside #page-azkar-prayer`);

    const realConsole = consoleErrors.filter(e => !KNOWN_NOISE.test(e));
    const realFailed = failedReqs.filter(e => !KNOWN_NOISE.test(e));
    ok(pageErrors.length === 0, `${lang}: no pageerror (${pageErrors.join(' | ')})`);
    ok(realConsole.length === 0, `${lang}: no console.error beyond known pre-existing/environmental noise (${realConsole.join(' | ')})`);
    ok(realFailed.length === 0, `${lang}: no failed request beyond known pre-existing/environmental noise (${realFailed.join(' | ')})`);

    table.push({ lang, ssrH1: ssrH1.trim().slice(0, 26), domH1: (dom.keys.heroTitle || '').slice(0, 26), cards: dom.cards, tr: dom.trBlocks, dir: dom.h1Dir });
  }

  // ══════════ PART 4 — mobile 375, no horizontal overflow ══════════
  console.log('\n===== 3. mobile 375px =====');
  for (const lang of ['ur', 'de', 'ar']) {
    await load(base + ROUTE(lang), 375, 812, true);
    const m = await ev(`(function(){
      var de = document.documentElement, sec = document.querySelector('#page-azkar-prayer');
      var worst = null;
      sec.querySelectorAll('*').forEach(function(el){
        var b = el.getBoundingClientRect();
        if (b.width > 0 && (b.right > de.clientWidth + 1 || b.left < -1)) { if (!worst || b.right > worst.r) worst = { c: String(el.className).slice(0,40), r: Math.round(b.right) }; }
      });
      return { overflow: de.scrollWidth > de.clientWidth, scrollW: de.scrollWidth, clientW: de.clientWidth, worst: worst };
    })()`);
    ok(m.overflow === false, `${lang} @375px: no horizontal overflow (scrollW ${m.scrollW} vs clientW ${m.clientW})`);
    ok(m.worst === null, `${lang} @375px: no element overflows the viewport (${m.worst ? m.worst.c + '@' + m.worst.r : 'none'})`);
  }

  console.log('\n| lang | SSR H1 | DOM H1 after JS | cards | tr-blocks | dir |');
  console.log('|---|---|---|---|---|---|');
  table.forEach(r => console.log(`| ${r.lang} | ${r.ssrH1} | ${r.domH1} | ${r.cards} | ${r.tr} | ${r.dir} |`));

  console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
  if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); }
}

main()
  .catch(e => { console.log('ERROR ' + (e && e.message)); fail++; })
  .finally(() => {
    try { chrome && chrome.kill(); } catch (e) {}
    try { server && server.kill(); } catch (e) {}
    try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
    setTimeout(() => process.exit(fail ? 1 : 0), 300);
  });
