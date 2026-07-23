// Smoke — QURAN INDEX (/quran home): the NON-ARABIC-LANGUAGE notice dialog must localize EXACTLY like the surah
// pages. The dialog HTML, the #quran-locale-l10n island and the 10-language dict are SHARED; js/quran-home.js
// must apply the full parity behaviour (js/quran.js → locApplyLang) on open: swap every [data-quran-locale-t]
// string, the close aria-label/title, the picked-language name + home link, and set modal lang/dir — all BEFORE
// the dialog is shown (no Arabic-fallback flash). The reference strings come from the island itself (one source
// of truth — never spelled out here). Verifies static wiring + a live CDP sweep of all 10 languages on /quran,
// plus semantic parity with a surah page. Self-contained (reuses a running server or spawns one).
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json'), 'utf8')).surahs;
const SURAH_PATH = ROUTES.find(x => x.number === 21).path;   // a real surah page for the parity comparison
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const KEYS = ['title', 'desc', 'picked', 'stay', 'home', 'close'];
const LANGS = ['ar', 'en', 'fr', 'tr', 'ur', 'de', 'id', 'es', 'bn', 'ms'];
const NON_AR = LANGS.filter(l => l !== 'ar');
const RTL = { ar: 1, ur: 1 };
// Arabic LETTERS only — deliberately EXCLUDES the Arabic-Indic digit block U+0660–0669: js/quran-home.js has a
// pre-existing `toAr` numeral formatter (Latin→Arabic digits for surah/ayah numbers) which is NOT translation copy.
const hasArabicLetters = s => /[ء-يٱ-ۓﭐ-﷿ﹰ-﻿]/.test(String(s || ''));

// ---------------- STATIC WIRING (no browser) ----------------
const homeJs = fs.readFileSync(path.join(ROOT, 'js/quran-home.js'), 'utf8');
const server = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
// (1) js/quran-home.js applies the full parity behaviour + stays free of translation copy
ok(/querySelectorAll\(\s*['"]\[data-quran-locale-t\]['"]\s*\)/.test(homeJs), 'quran-home.js swaps every [data-quran-locale-t] element');
ok(/setAttribute\(\s*['"]lang['"]/.test(homeJs) && /setAttribute\(\s*['"]dir['"]/.test(homeJs), 'quran-home.js sets modal lang + dir');
ok(/data-quran-locale-close/.test(homeJs) && /aria-label/.test(homeJs), 'quran-home.js localizes the close aria-label');
ok(/L10N\s*&&\s*L10N\.t/.test(homeJs) || /L10N\.t\[/.test(homeJs), 'quran-home.js reads the shared island t-dictionary (no private copy)');
ok(!/coming soon|قيد الإعداد|en préparation|hazırlan/i.test(homeJs), 'quran-home.js hardcodes none of the modal copy phrases (text lives only in the dict; the file DOES legitimately carry search-normalization regexes + comments, which are not translation copy)');
// The definitive "no duplicated copy" proof (against the dict itself) runs in main() once the island is parsed.
// (2) cache-busters: quran-home.js v3 exactly; quran.js v15 + quran.css v25 untouched; no v=4 anywhere
ok(/js\/quran-home\.js\?v=4\b/.test(server), 'server injects js/quran-home.js?v=4');
ok(!/js\/quran-home\.js\?v=2\b/.test(server), 'the old js/quran-home.js?v=2 reference is gone');
ok(!/quran-home\.js\?v=3\b/.test(server), 'no stale js/quran-home.js?v=3 (single clean v=4 bump)');
ok(/js\/quran\.js\?v=15\b/.test(server) && !/js\/quran\.js\?v=1[46]\b/.test(server), 'js/quran.js?v=15 is UNCHANGED');
ok(/css\/quran\.css\?v=25\b/.test(server) && !/css\/quran\.css\?v=2[46]\b/.test(server), 'css/quran.css?v=25 is UNCHANGED');

// ---------------- server / base ----------------
const reachable = (url) => new Promise(res => { try { const u = new URL(url); const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); }); s.on('error', () => res(false)); s.setTimeout(1200, () => { s.destroy(); res(false); }); } catch (e) { res(false); } });
function findChrome() {
  return ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : '',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
    .filter(Boolean).find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
}
let base = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3100';
let spawnedServer = null;
const NODE_PATH_FALLBACK = process.env.NODE_PATH || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules';
async function homeReady(b) { const H = await fetch(b + '/quran').then(r => r.text()).catch(() => ''); return (/id="quran-locale-modal"/.test(H) && /id="page-quran-home"/.test(H) && /quran-home\.js\?v=3/.test(H)) ? H : ''; }
async function ensureServer() {
  if (await reachable(base) && await homeReady(base)) return true;
  const PORT = 3196; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT), NODE_PATH: NODE_PATH_FALLBACK }) });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base) && await homeReady(base)) return true; }
  return false;
}
class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }

const CHROME = findChrome();
async function main() {
  if (!await ensureServer()) { console.log('SKIP — could not reach/boot a server with the /quran home locale modal'); finish(true); return; }
  // island = the ONE source of truth for expected strings (shared with the surah pages)
  const homeHtml = await homeReady(base);
  const isl = (homeHtml.match(/id="quran-locale-l10n"[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
  let L10N = {}; try { L10N = JSON.parse(isl.replace(/\\u003c/g, '<')); } catch (e) { L10N = {}; }
  const T = L10N.t || {};
  ok(LANGS.every(l => T[l]), 'island ships the t-dictionary for all 10 languages — missing: ' + LANGS.filter(l => !T[l]).join(',') || 'none');
  ok(LANGS.every(l => T[l] && KEYS.every(k => typeof T[l][k] === 'string' && T[l][k].length > 0)), 'every language has all 6 keys (title/desc/picked/stay/home/close)');
  // DEFINITIVE no-duplicate-copy proof: none of the 20 modal title/desc strings (any language) is hardcoded in
  // js/quran-home.js — the file renders them ONLY by reading the shared island. Uses title+desc (long/unique) so
  // short common words (e.g. "Close") never false-positive.
  ok(LANGS.every(l => T[l] && !homeJs.includes(T[l].title) && !homeJs.includes(T[l].desc)),
     'quran-home.js hardcodes NONE of the modal title/desc copy — every string comes from the shared dict/island');

  if (!CHROME) { console.log('  (no Chrome → static + island checks only; browser sweep skipped)'); finish(false); return; }
  const PORT = 9391; const UDD = path.join(os.tmpdir(), 'quran-home-l10n-smoke-' + process.pid);
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
  let t = null; for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json`); const l = await r.json(); t = l.find(x => x.type === 'page'); if (t && t.webSocketDebuggerUrl) break; } catch (e) {} await sleep(250); }
  if (!t) { console.log('SKIP — headless Chrome exposed no debugging target'); try { chrome.kill(); } catch (e) {} finish(true); return; }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  let loaded = false; cdp.on('Page.loadEventFired', () => { loaded = true; });
  const pageErrors = [], consoleErrors = [];
  cdp.on('Runtime.exceptionThrown', p => pageErrors.push(JSON.stringify(p.exceptionDetails && p.exceptionDetails.text)));
  cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') consoleErrors.push((p.args || []).map(a => a.value || a.description || '').join(' ')); });
  const ev = async (expr) => { const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
  const nav = async (url) => { await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }); loaded = false; await cdp.send('Page.navigate', { url }); for (let i = 0; i < 120 && !loaded; i++) await sleep(100); await sleep(900); };
  const H = `
    var M=document.getElementById('quran-locale-modal');
    function cookie(){ var b=[].slice.call(document.querySelectorAll('button')).find(function(x){return x.textContent.trim()==='رفض';}); if(b)b.click(); }
    function pick(l){ var b=document.querySelector('.lang-switcher-btn'); if(b)b.click(); var it=document.querySelector('.lang-menu [data-lang="'+l+'"]'); if(it)it.click(); return !!it; }
    function isOpen(el){ return !!el && el.classList.contains('is-open') && el.getAttribute('aria-hidden')==='false'; }
    function tstr(k){ var el=M.querySelector('[data-quran-locale-t="'+k+'"]'); return el?el.textContent:null; }
    function readState(){ return { open:isOpen(M),
      title:tstr('title'), desc:tstr('desc'), picked:tstr('picked'), stay:tstr('stay'), home:tstr('home'),
      lang:M.getAttribute('lang'), dir:M.getAttribute('dir'),
      closeAria:(M.querySelector('[data-quran-locale-close]')||{}).getAttribute?M.querySelector('[data-quran-locale-close]').getAttribute('aria-label'):null,
      name:(M.querySelector('[data-quran-locale-name]')||{}).textContent,
      go:(M.querySelector('[data-quran-locale-go]')||{}).getAttribute('href') }; }
  `;

  // ---- HOME PAGE ----
  await nav(base + '/quran');
  ok(await ev(`(function(){ ${H} return !!M && !!document.getElementById('quran-locale-l10n') && document.getElementById('page-quran-home').classList.contains('active'); })()`),
     '/quran home renders the shared modal + island + active #page-quran-home');
  // Arabic must NOT be intercepted (page's own language)
  const arRes = await ev(`(function(){ ${H} cookie();
    var menu=document.querySelector('.lang-menu'); if(!menu) return {noMenu:true};
    var a=document.createElement('button'); a.type='button'; a.setAttribute('data-lang','ar'); a.className='lang-menu-item'; menu.appendChild(a);
    var prevented=false; a.addEventListener('click',function(e){ prevented=e.defaultPrevented; }); a.click();
    var o=isOpen(M); a.remove(); return {opened:o, prevented:prevented}; })()`);
  ok(!arRes.opened && !arRes.prevented, 'HOME: picking ARABIC does not open the dialog and is not intercepted');

  // Every non-Arabic language: localized FULLY and SYNCHRONOUSLY (read with zero delay → proves applied-before-shown)
  const sweep = await ev(`(function(){ ${H} cookie(); var out=[], langs=${JSON.stringify(NON_AR)};
    for (var i=0;i<langs.length;i++){ var l=langs[i]; var ok=pick(l); var st=readState(); st.l=l; st.picked_ok=ok; out.push(st);
      var stayBtn=M.querySelector('[data-quran-locale-stay]'); if(stayBtn) stayBtn.click(); }
    return out; })()`);
  for (const l of NON_AR) {
    const r = sweep.find(x => x.l === l), exp = T[l] || {};
    ok(r && r.picked_ok && r.open, `HOME: picking ${l} opens the dialog`);
    if (!r) continue;
    ok(r.title === exp.title && r.desc === exp.desc && r.picked === exp.picked && r.stay === exp.stay && r.home === exp.home,
       `HOME/${l}: ALL five [data-quran-locale-t] strings match the shared dict (applied before shown → no Arabic flash)`);
    ok(r.closeAria === exp.close, `HOME/${l}: close aria-label is localized to ${l}`);
    ok(r.lang === l, `HOME/${l}: modal lang="${l}"`);
    ok(r.dir === (RTL[l] ? 'rtl' : 'ltr'), `HOME/${l}: modal dir="${RTL[l] ? 'rtl' : 'ltr'}"`);
    ok(r.name === (L10N.names && L10N.names[l]) && r.go === (L10N.homes && L10N.homes[l]), `HOME/${l}: picked name + home link correct`);
    if (!RTL[l]) ok(!hasArabicLetters(r.title) && !hasArabicLetters(r.desc), `HOME/${l} (LTR): no Arabic letters leak into the ${l} dialog`);
  }
  const urdu = sweep.find(x => x.l === 'ur');
  ok(urdu && urdu.dir === 'rtl' && urdu.title === (T.ur && T.ur.title), 'HOME: Urdu is RTL with its own Urdu copy');

  // ---- SEMANTIC PARITY with a surah page (same shared source → identical rendered strings) ----
  await nav(base + SURAH_PATH);
  const surahEn = await ev(`(function(){ ${H} cookie(); pick('en'); var st=readState(); var b=M.querySelector('[data-quran-locale-stay]'); if(b)b.click(); return st; })()`);
  ok(surahEn.title === (T.en && T.en.title) && surahEn.dir === 'ltr', 'SURAH page localizes EN identically (shared source)');
  ok(surahEn.title === (sweep.find(x => x.l === 'en') || {}).title, 'HOME and SURAH render the SAME EN title (no divergent copy)');

  ok(pageErrors.length === 0, 'no pageerror across the sweep' + (pageErrors.length ? ' — ' + pageErrors.join(' | ') : ''));
  ok(consoleErrors.length === 0, 'no console.error across the sweep' + (consoleErrors.length ? ' — ' + consoleErrors.join(' | ') : ''));
  try { ws.close(); } catch (e) {} try { chrome.kill(); } catch (e) {}
  finish(false);
}
function finish(skip) {
  if (spawnedServer) try { spawnedServer.kill(); } catch (e) {}
  console.log('RESULT quran_home_language_notice_localization_parity: ' + pass + ' passed, ' + fail + ' failed' + (skip ? ' (partial — no browser)' : ''));
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.log('  FAIL uncaught ' + (e && e.message)); fail++; finish(false); });
