// Smoke — QURAN surah page: NON-ARABIC LANGUAGE UNAVAILABLE modal (P0).
// Quran pages are Arabic-only. Picking any non-Arabic language must NOT navigate to /{lang}/quran/surah/21
// (a real 404) — it opens an explanatory dialog instead and the reader keeps their exact place. Verifies:
// Arabic never opens it; every non-Arabic language does; URL/history/scroll/reading-mode/font all untouched;
// the picked language name + its own copy (Arabic = fallback); primary closes; secondary points at the locale
// HOME; no link to an unbuilt surah route; one dialog; no duplicate ids; focus trap; Escape; focus return;
// body scroll lock; No-JS lands on the locale home (never a 404); dark; desktop + mobile; no overflow;
// pageerror/console.error = 0. Self-contained (reuses a running :3100 or spawns one).
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
function findChrome() {
  const c = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : '',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  return c.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
}
const reachable = (url) => new Promise(res => { try { const u = new URL(url); const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); }); s.on('error', () => res(false)); s.setTimeout(1200, () => { s.destroy(); res(false); }); } catch (e) { res(false); } });
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const CHROME = findChrome();
if (!CHROME) { console.log('SKIP — no Chrome/Chromium found'); process.exit(0); }
const NON_AR = ['en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
let base = process.env.QURAN_SMOKE_URL || 'http://localhost:3100'; let spawnedServer = null;
const NODE_PATH_FALLBACK = process.env.NODE_PATH || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules';
async function ready(b) { const H = await fetch(b + '/quran/surah/21').then(r => r.text()).catch(() => ''); return /id="quran-locale-modal"/.test(H) ? H : ''; }
async function ensureServer() {
  if (await reachable(base) && await ready(base)) return true;
  const PORT = 3195; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT), NODE_PATH: NODE_PATH_FALLBACK }) });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base) && await ready(base)) return true; }
  return false;
}
class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }
let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-locale-smoke-' + process.pid);
async function main() {
  if (!await ensureServer()) { console.log('SKIP — could not reach/boot a server with the locale modal'); process.exit(0); }
  // ---- (A) source + SSR / No-JS ----
  const rawHtml = await ready(base);
  ok(/id="quran-locale-modal"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="quran-locale-title"[^>]*aria-describedby="quran-locale-desc"/.test(rawHtml), 'SSR dialog: role=dialog + aria-modal + aria-labelledby + aria-describedby');
  ok((rawHtml.match(/id="quran-locale-modal"/g) || []).length === 1, 'exactly ONE locale dialog in the served HTML');
  ok(/aria-label="إغلاق"/.test(rawHtml), 'close button carries an aria-label');
  ok(/هذه اللغة قيد الإعداد/.test(rawHtml) && /متابعة القراءة بالعربية/.test(rawHtml) && /الانتقال إلى الرئيسية باللغة المختارة/.test(rawHtml),
    'the dialog SSRs with real Arabic copy (never empty, never raw keys — this IS the fallback)');
  // No-JS: the SSR menu must link to the locale HOME, never to an unbuilt surah route
  const menu = rawHtml.slice(rawHtml.indexOf('<div class="lang-menu"'), rawHtml.indexOf('</div>', rawHtml.indexOf('<div class="lang-menu"')) + 6);
  const pairs = [...menu.matchAll(/href="([^"]+)"[^>]*data-lang="([^"]+)"/g)].map(m => ({ href: m[1], lang: m[2] }));
  ok(pairs.length === NON_AR.length, 'SSR menu renders all ' + NON_AR.length + ' non-Arabic languages — got ' + pairs.length);
  ok(NON_AR.every(l => pairs.some(p => p.lang === l && p.href === '/' + l)), 'every SSR item points at its locale HOME (/en, /fr, …)');
  ok(!/href="\/(en|fr|tr|ur|de|id|es|bn|ms)\/quran/.test(rawHtml), 'NO href anywhere points at /{locale}/quran/... (the unbuilt route)');
  ok(/<noscript><style>\.lang-switcher:focus-within \.lang-menu\{display:block\}<\/style><\/noscript>/.test(rawHtml), 'a <noscript> rule lets the SSR links be reached with JS disabled');
  // the locale homes are live, and the surah route under a locale prefix is NOT (that is the whole point)
  for (const l of ['en', 'ur', 'fr']) {
    const home = await fetch(base + '/' + l, { redirect: 'follow' }).then(r => r.status).catch(() => 0);
    ok(home === 200, 'No-JS destination /' + l + ' is a live page (200) — got ' + home);
  }
  const bad = await fetch(base + '/en/quran/surah/21').then(r => r.status).catch(() => 0);
  ok(bad === 404, 'control: /en/quran/surah/21 really is a 404 → the modal is what prevents reaching it');
  // scope: the interception lives in js/quran.js (surah route only) — no global switcher file touched
  const qjs = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
  ok(/addEventListener\('click', function \(e\) \{[\s\S]{0,400}lang-menu \[data-lang\][\s\S]{0,900}\}, true\);/.test(qjs), 'js/quran.js intercepts .lang-menu [data-lang] in the CAPTURE phase (setLanguage never runs)');
  ok(!/(window\.)?setLanguage\s*=|_renderLangSwitcher\s*=|toggleLangMenu\s*=/.test(qjs), 'js/quran.js does NOT patch/replace the global switcher functions (every other page keeps its behaviour)');

  // ---- (B) browser ----
  const PORT = 9373;
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
  let t = null; for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json`); const l = await r.json(); t = l.find(x => x.type === 'page'); if (t && t.webSocketDebuggerUrl) break; } catch (e) {} await sleep(250); }
  if (!t) { console.log('SKIP — headless Chrome did not expose a debugging target'); process.exit(0); }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  let loaded = false; cdp.on('Page.loadEventFired', () => { loaded = true; });
  const pageErrors = [], consoleErrors = [];
  cdp.on('Runtime.exceptionThrown', p => pageErrors.push(JSON.stringify(p.exceptionDetails && p.exceptionDetails.text)));
  cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') consoleErrors.push((p.args || []).map(a => a.value || a.description || '').join(' ')); });
  const ev = async (expr) => { const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
  const nav = async (w, h, mobile) => { await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile }); loaded = false; await cdp.send('Page.navigate', { url: base + '/quran/surah/21' }); for (let i = 0; i < 100 && !loaded; i++) await sleep(100); await sleep(900); };
  // helpers injected into every eval
  const H = `
    var M=document.getElementById('quran-locale-modal');
    var OV=document.querySelector('[data-quran-locale-overlay]');
    // NOTE: getClientRects() alone is NOT enough — the dialog closes via opacity/visibility (it keeps its
    // fixed-position box), so a rects-only probe would report it as permanently "open". Test the real CSS.
    function shown(el){ if(!el) return false; var c=getComputedStyle(el);
      return c.display!=='none' && c.visibility!=='hidden' && parseFloat(c.opacity)>0 && el.getClientRects().length>0; }
    function cookie(){ var b=[].slice.call(document.querySelectorAll('button')).find(function(x){return x.textContent.trim()==='رفض';}); if(b)b.click(); }
    function pick(l){ var b=document.querySelector('.lang-switcher-btn'); if(b)b.click();
      var it=document.querySelector('.lang-menu [data-lang="'+l+'"]'); if(it)it.click(); return it; }
    function after(ms,fn){ return new Promise(function(r){ setTimeout(function(){ r(fn()); }, ms); }); }
    // state probe (no transition wait) — for the 9-language logic sweep; shown() proves the rendered result
    function isOpen(el){ return !!el && el.classList.contains('is-open') && el.getAttribute('aria-hidden')==='false'; }
  `;

  await nav(1440, 900, false);
  // 1) Arabic must NOT open it (the JS menu omits the current language, so we inject a synthetic ar item)
  let s = await ev(`(function(){ ${H} cookie();
    var menu=document.querySelector('.lang-menu');
    var a=document.createElement('button'); a.type='button'; a.setAttribute('data-lang','ar'); a.className='lang-menu-item'; menu.appendChild(a);
    var prevented=false; a.addEventListener('click',function(e){ prevented=e.defaultPrevented; });
    a.click();
    return after(200, function(){ var o=shown(M); a.remove(); return {opened:o, prevented:prevented}; }); })()`);
  ok(!s.opened && !s.prevented, 'picking ARABIC does not open the dialog and is not intercepted');

  // 2) English opens it, and NOTHING about the reader's state changes
  s = await ev(`(function(){ ${H} cookie();
    window.scrollTo(0, 1200);
    var before={url:location.href, hist:history.length, y:window.scrollY, lang:document.documentElement.lang,
                fs:getComputedStyle(document.documentElement).getPropertyValue('--q-font-size')};
    pick('en');
    var now={url:location.href, hist:history.length, y:window.scrollY, lang:document.documentElement.lang,
             fs:getComputedStyle(document.documentElement).getPropertyValue('--q-font-size')};
    // read the settled state AFTER the open transition + the focus timeout
    return after(300, function(){ return {
      open:shown(M), overlay:shown(OV), urlSame:before.url===now.url, histSame:before.hist===now.hist,
      scrollSame:before.y===now.y, langSame:before.lang===now.lang, fontSame:before.fs===now.fs,
      menuClosed:!document.querySelector('.lang-switcher.open'),
      name:(M.querySelector('[data-quran-locale-name]')||{}).textContent,
      title:(M.querySelector('[data-quran-locale-t="title"]')||{}).textContent,
      go:(M.querySelector('[data-quran-locale-go]')||{}).getAttribute('href'),
      dlgLang:M.getAttribute('lang'), dlgDir:M.getAttribute('dir'),
      bodyLocked:document.body.classList.contains('quran-modal-open'),
      focusInside:M.contains(document.activeElement),
      dialogs:document.querySelectorAll('[role="dialog"][aria-modal="true"]:not([aria-hidden="true"])').length,
      noOverflow:document.documentElement.scrollWidth<=innerWidth+1 }; }); })()`);
  ok(s.open && s.overlay, 'picking ENGLISH opens the dialog + overlay');
  ok(s.urlSame, 'URL does NOT change');
  ok(s.histSame, 'no history entry is added');
  ok(s.scrollSame, 'scroll position is preserved');
  ok(s.langSame, 'the page language does NOT change');
  ok(s.fontSame, 'the reader font size is untouched');
  ok(s.menuClosed, 'the language menu closes before the dialog opens');
  ok(s.name === 'English', 'the picked language name is shown — got ' + JSON.stringify(s.name));
  ok(s.title === 'This language is coming soon', 'the copy is in the PICKED language — got ' + JSON.stringify(s.title));
  ok(s.go === '/en', 'the secondary button points at the locale HOME (/en) — got ' + s.go);
  ok(s.dlgLang === 'en' && s.dlgDir === 'ltr', 'the dialog declares the picked language + its direction');
  ok(s.bodyLocked, 'background scroll is locked while open');
  ok(s.focusInside, 'focus moves into the dialog');
  ok(s.dialogs === 1, 'exactly ONE open dialog — got ' + s.dialogs);
  ok(s.noOverflow, 'no horizontal overflow with the dialog open (desktop)');

  // 3) focus trap + Escape + focus return
  s = await ev(`(function(){ ${H}
    var f=[].slice.call(M.querySelectorAll('a[href],button:not([disabled])')).filter(function(el){return el.offsetParent!==null;});
    var last=f[f.length-1]; last.focus();
    var e=new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}); document.dispatchEvent(e);
    var trapped=e.defaultPrevented && document.activeElement===f[0];
    var esc=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}); document.dispatchEvent(esc);
    return after(300, function(){ return { trapped:trapped, closed:!shown(M), overlayGone:!shown(OV),
             unlocked:!document.body.classList.contains('quran-modal-open'),
             // the menu item itself was hidden with the menu before the dialog opened (§3), so a hidden node
             // cannot take focus — the language CONTROL (item, or the switcher button that owns it) must.
             focusBack:!!document.activeElement && document.activeElement!==document.body &&
                       (document.activeElement.getAttribute('data-lang')==='en' ||
                        document.activeElement.classList.contains('lang-switcher-btn')),
             inertCleared:!document.querySelector('.top-header[inert]') }; }); })()`);
  ok(s.trapped, 'focus trap: Tab from the last control wraps to the first');
  ok(s.closed && s.overlayGone, 'Escape closes the dialog + overlay');
  ok(s.unlocked, 'background scroll is restored on close');
  ok(s.focusBack, 'focus returns to the language item that opened it');
  ok(s.inertCleared, 'background inert is cleared on close');

  // 4) primary button closes; reader stays put
  s = await ev(`(function(){ ${H} cookie(); window.scrollTo(0,900); var y=window.scrollY;
    pick('fr');
    return after(280, function(){
      var opened=shown(M);
      var fr=(M.querySelector('[data-quran-locale-t="title"]')||{}).textContent;
      M.querySelector('[data-quran-locale-stay]').click();
      return after(300, function(){ return { opened:opened, fr:fr, closed:!shown(M), sameY:window.scrollY===y, url:location.pathname }; });
    }); })()`);
  ok(s.opened && /Cette langue/.test(s.fr || ''), 'FRENCH opens it with French copy — got ' + JSON.stringify(s.fr));
  ok(s.closed && s.sameY && s.url === '/quran/surah/21', 'the primary button closes it and the reader keeps their place + URL');

  // 5) Urdu (RTL) + every remaining non-Arabic language behaves identically
  s = await ev(`(function(){ ${H} cookie();
    var out=[], langs=${JSON.stringify(NON_AR)};
    for (var i=0;i<langs.length;i++){ var l=langs[i];
      pick(l);
      out.push({ l:l, open:isOpen(M),
                 name:(M.querySelector('[data-quran-locale-name]')||{}).textContent,
                 go:(M.querySelector('[data-quran-locale-go]')||{}).getAttribute('href'),
                 titleFilled:((M.querySelector('[data-quran-locale-t="title"]')||{}).textContent||'').length>3 });
      M.querySelector('[data-quran-locale-stay]').click();
    }
    return out; })()`);
  ok(s.every(r => r.open), 'EVERY non-Arabic language opens the dialog — ' + s.filter(r => !r.open).map(r => r.l).join(',') || 'all 9 ok');
  ok(s.every(r => r.go === '/' + r.l), 'EVERY language gets its own home destination — ' + s.map(r => r.l + ':' + r.go).join(' '));
  ok(s.every(r => r.titleFilled && r.name && r.name !== '—'), 'every language shows a filled title + its own name (no raw keys, no empty dialog)');
  const urdu = s.find(r => r.l === 'ur');
  ok(urdu && urdu.name === 'اردو', 'Urdu shows its native name — got ' + JSON.stringify(urdu && urdu.name));

  // 6) reading mode: opens on top, never exits, restores
  s = await ev(`(function(){ ${H} cookie();
    document.querySelector('.quran-reading-enter').click();
    var inReading=document.body.classList.contains('quran-reading');
    var y=window.scrollY;
    pick('de');
    var stillReading=document.body.classList.contains('quran-reading');
    var headerHidden=!shown(document.querySelector('.top-header'));
    var z=parseInt(getComputedStyle(M).zIndex,10), zBar=parseInt(getComputedStyle(document.querySelector('.quran-reading-sticky')).zIndex,10);
    M.querySelector('[data-quran-locale-stay]').click();
    var afterReading=document.body.classList.contains('quran-reading');
    var sameY=window.scrollY===y;
    document.querySelector('.quran-reading-exit').click();
    return { inReading:inReading, stillReading:stillReading, headerHidden:headerHidden, z:z, zBar:zBar, afterReading:afterReading, sameY:sameY }; })()`);
  ok(s.inReading && s.stillReading, 'reading mode is NOT exited when a language is picked');
  ok(s.z > s.zBar, 'the dialog sits above the minimized reading toolbar (' + s.z + ' > ' + s.zBar + ')');
  ok(s.headerHidden, 'the global header does not reappear because the dialog opened');
  ok(s.afterReading && s.sameY, 'after closing, the reader is still in reading mode at the same position');

  // 7) layering vs the surah index modal + no duplicate ids
  s = await ev(`(function(){ ${H}
    var idx=document.getElementById('quran-index');
    var zi=parseInt(getComputedStyle(idx).zIndex,10), zm=parseInt(getComputedStyle(M).zIndex,10);
    var zo=parseInt(getComputedStyle(OV).zIndex,10);
    var ids={},dup=[]; document.querySelectorAll('[id]').forEach(function(el){ if(ids[el.id])dup.push(el.id); else ids[el.id]=1; });
    return { above:zm>zi, below9999:zm<9999, overlayAbove:zo>zi, dup:dup, portaled:M.parentNode===document.body }; })()`);
  ok(s.above && s.below9999 && s.overlayAbove, 'layer: above the surah index modal, below the 9999 critical dialogs');
  ok(s.portaled, 'the dialog is portaled to <body> (cannot be clipped by an ancestor)');
  ok(s.dup.length === 0, 'no duplicate ids on the page' + (s.dup.length ? ' — ' + JSON.stringify(s.dup) : ''));

  // 8) overlay click closes
  s = await ev(`(function(){ ${H} cookie(); pick('es');
    return after(280, function(){ var o=shown(M); OV.click();
      return after(300, function(){ return {o:o, closed:!shown(M)}; }); }); })()`);
  ok(s.o && s.closed, 'clicking the overlay closes the dialog');

  // 9) mobile + dark
  await nav(390, 844, true);
  s = await ev(`(function(){ ${H} cookie(); pick('en');
    return after(320, function(){
      var r=M.getBoundingClientRect();
      var btns=[].slice.call(M.querySelectorAll('.quran-locale-actions .quran-btn'));
      return { open:shown(M), inView:r.left>=-1 && r.right<=innerWidth+1 && r.bottom<=innerHeight+1,
               touch:btns.every(function(b){return b.getBoundingClientRect().height>=48;}),
               fullW:btns.every(function(b){return b.getBoundingClientRect().width>=innerWidth-40;}),
               noOverflow:document.documentElement.scrollWidth<=innerWidth+1 }; }); })()`);
  ok(s.open && s.inView, 'mobile 390: the dialog is fully on-screen (buttons never under the edge)');
  ok(s.touch && s.fullW, 'mobile: full-width action buttons with a ≥48px touch target');
  ok(s.noOverflow, 'mobile: no horizontal overflow');
  await nav(1440, 900, false);
  s = await ev(`(function(){ ${H} cookie(); document.documentElement.setAttribute('data-theme','dark'); pick('en');
    return after(320, function(){ return { open:shown(M), bg:getComputedStyle(M).backgroundColor }; }); })()`);
  ok(s.open && s.bg && s.bg !== 'rgba(0, 0, 0, 0)', 'dark mode: the dialog renders on a real card background — ' + s.bg);

  ok(pageErrors.length === 0, 'pageerror = 0' + (pageErrors.length ? ' ' + JSON.stringify(pageErrors) : ''));
  ok(consoleErrors.length === 0, 'console.error = 0' + (consoleErrors.length ? ' ' + JSON.stringify(consoleErrors) : ''));
  try { ws.close(); } catch (e) {}
}
main().catch(e => { fail++; F.push('EXCEPTION: ' + e.message); console.log('  FAIL EXCEPTION ' + e.message); }).finally(() => {
  try { if (chrome) chrome.kill(); } catch (e) {}
  try { if (spawnedServer) spawnedServer.kill(); } catch (e) {}
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); }
  setTimeout(() => process.exit(fail ? 1 : 0), 200);
});
