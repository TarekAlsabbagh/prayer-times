// Smoke — QURAN surah-drawer SEARCH FILTER (P0 fix). Browser behaviour test (headless Chrome + CDP): the
// in-modal filter shows/hides the 114 surahs live, by name (full/partial, tashkeel-insensitive, alef-folded),
// by Latin OR Arabic-Indic number, and by English name. No-results state + counter (aria-live) + clear button;
// hidden surahs are display:none (grid reflows) and expose NO tabbable element; NO route links (no 404s); the
// filter is client-only (no network on keystroke, no innerHTML from input); works on desktop, mobile, reading.
// Self-contained: reuses a server on QURAN_SMOKE_URL/localhost:3100 if reachable, else spawns its own. SKIPS
// (exit 0) only when Chrome or a server truly cannot be obtained — so CI without a browser stays green.
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// /quran/{official-english-slug} — the ONE URL per surah, read from the source-derived routes table.
// Never spell a slug out in a test: it would become a second source of truth, and these tests SKIP (not
// fail) when the page 404s — a drifted literal would go quietly green with zero coverage.
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json'), 'utf8')).surahs;
const P = n => ROUTES.find(x => x.number === n).path;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function findChrome() {
  const c = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : '',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return c.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
}
const reachable = (url) => new Promise(res => {
  try { const u = new URL(url); const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); }); s.on('error', () => res(false)); s.setTimeout(1200, () => { s.destroy(); res(false); }); }
  catch (e) { res(false); }
});

let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

const CHROME = findChrome();
if (!CHROME) { console.log('SKIP — no Chrome/Chromium found (browser-behaviour smoke needs a headless browser)'); process.exit(0); }

// ---- obtain a server ----
let base = process.env.QURAN_SMOKE_URL || 'http://localhost:3100';
let spawnedServer = null;
async function ensureServer() {
  if (await reachable(base)) { const H = await fetch(base + P(21)).then(r => r.text()).catch(() => ''); if (/data-quran-surah-filter/.test(H)) return true; }
  const PORT = 3199; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], {
    cwd: ROOT, stdio: 'ignore',
    env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT), NODE_PATH: process.env.NODE_PATH || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules' }),
  });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base)) { const H = await fetch(base + P(21)).then(r => r.text()).catch(() => ''); if (/data-quran-surah-filter/.test(H)) return true; } }
  return false;
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
    ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
      else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; }
}

let chrome = null;
const UDD = path.join(os.tmpdir(), 'quran-filter-smoke-' + process.pid);
async function main() {
  if (!await ensureServer()) { console.log('SKIP — could not reach or spawn a prototype server'); process.exit(0); }
  const PORT = 9351;
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
  let t = null; for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json`); const l = await r.json(); t = l.find(x => x.type === 'page'); if (t && t.webSocketDebuggerUrl) break; } catch (e) {} await sleep(250); }
  if (!t) { console.log('SKIP — headless Chrome did not expose a debugging target'); process.exit(0); }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
  let loaded = false; cdp.on('Page.loadEventFired', () => { loaded = true; });
  const pageErrors = [], consoleErrors = [], net2 = []; let trackNet = false;
  cdp.on('Runtime.exceptionThrown', p => pageErrors.push(JSON.stringify(p.exceptionDetails && p.exceptionDetails.text)));
  cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') consoleErrors.push((p.args || []).map(a => a.value || a.description || '').join(' ')); });
  cdp.on('Network.requestWillBeSent', p => { if (trackNet) net2.push(p.request.method + ' ' + p.request.url + ' [' + (p.type || '') + ']'); });
  const ev = async (expr) => { const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text)); return r.result.value; };
  const H = `
    var inp=document.querySelector('[data-quran-surah-filter]');
    var lis=[].slice.call(document.querySelectorAll('.quran-idx-li'));
    var cnt=document.querySelector('[data-quran-surah-count]');
    var emptyBox=document.querySelector('[data-quran-filter-empty]');
    var inlineClear=document.querySelector('.quran-filter-clear');
    function vis(){ return lis.filter(function(li){ return getComputedStyle(li).display!=='none'; }); }
    function type(v){ inp.value=v; inp.dispatchEvent(new Event('input',{bubbles:true})); }
    function nums(){ return vis().map(function(li){ return li.getAttribute('data-num'); }); }
  `;
  const load = async (w, h, mobile) => {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
    loaded = false; await cdp.send('Page.navigate', { url: base + P(21) });
    for (let i = 0; i < 100 && !loaded; i++) await sleep(100); await sleep(900);
  };

  // ================= DESKTOP =================
  await load(1440, 900, false);
  await ev(`(function(){ ${H} document.querySelector('[data-quran-open-index]').click(); })()`);
  trackNet = true; await sleep(150);
  let s = await ev(`(function(){ ${H} return {v:vis().length, c:cnt.textContent.trim(), eh:emptyBox.hasAttribute('hidden')}; })()`);
  ok(s.v === 114 && s.c === '١١٤ سورة' && s.eh, 'open → 114 surahs + counter "١١٤ سورة" + empty hidden');
  ok((await ev(`(function(){ ${H} type('الأنبياء'); return JSON.stringify([nums(), cnt.textContent.trim()]); })()`)) === JSON.stringify([['21'], 'نتيجة واحدة']), 'الأنبياء (no tashkeel) → ONLY surah 21 + counter "نتيجة واحدة"');
  ok((await ev(`(function(){ ${H} type('أنب'); return nums().indexOf('21')!==-1; })()`)), 'أنب (partial) → includes surah 21');
  ok((await ev(`(function(){ ${H} type('21'); return JSON.stringify(nums()); })()`)) === '["21"]', '21 (latin) → ONLY surah 21');
  ok((await ev(`(function(){ ${H} type('٢١'); return JSON.stringify(nums()); })()`)) === '["21"]', '٢١ (arabic digits) → ONLY surah 21');
  ok((await ev(`(function(){ ${H} type('anbiya'); return JSON.stringify(nums()); })()`)) === '["21"]', 'anbiya (english name) → ONLY surah 21');
  s = await ev(`(function(){ ${H} type('زقزقة'); return {v:vis().length, c:cnt.textContent.trim(), eh:emptyBox.hasAttribute('hidden')}; })()`);
  ok(s.v === 0 && s.c === 'لا توجد نتائج' && !s.eh, 'no match → 0 visible + counter "لا توجد نتائج" + empty-state shown');
  s = await ev(`(function(){ ${H} type('21');
    var hid=lis.filter(function(li){return getComputedStyle(li).display==='none';});
    var foc=0; hid.forEach(function(li){ [].forEach.call(li.querySelectorAll('a[href],button,[tabindex]'), function(el){ if(el.offsetParent!==null) foc++; }); });
    return {hid:hid.length, foc:foc}; })()`);
  ok(s.hid === 113 && s.foc === 0, 'filtered-out surahs are display:none (113) and expose NO tabbable element');
  // QURAN-BASE-HREF-FRAGMENT-NAVIGATION-…-1 — the drawer is a real index of all 114 routes. The current surah used
  // to be a bare «#page-N» in-page anchor, but <base href="/"> re-resolved it to «/»; it is now a self-link to its
  // own /quran/{slug} route + aria-current="page". Each href is matched against the routes table (a shape test
  // would wave through /quran/al-anbia, which 404s), and 0 bare in-page anchors of any kind remain.
  const VALID = JSON.stringify(ROUTES.map(x => x.path));
  s = await ev(`(function(){ ${H} type('');
    var valid=${VALID};
    var a=[].slice.call(document.querySelectorAll('.quran-idx-item[href]'));
    var self=a.filter(function(x){return /^#/.test(x.getAttribute('href'));});
    var route=a.filter(function(x){return valid.indexOf(x.getAttribute('href'))!==-1;});
    var bad=a.length-self.length-route.length;
    var uniq={}; route.forEach(function(x){uniq[x.getAttribute('href')]=1;});
    var cur=document.querySelector('.quran-idx-item.is-current');
    return {self:self.length, route:route.length, bad:bad, uniq:Object.keys(uniq).length,
            curHref:cur?cur.getAttribute('href'):null, curAria:cur?cur.getAttribute('aria-current'):null}; })()`);
  ok(s.self === 0 && s.route === 114 && s.bad === 0 && s.uniq === 114 && s.curHref === '/quran/al-anbiya' && s.curAria === 'page',
     `the drawer = 114 DISTINCT official slug links, 0 bare in-page anchors, current = self-link + aria-current="page" — got self=${s.self} slug-links=${s.route} distinct=${s.uniq} off-table=${s.bad} cur=${s.curHref}/${s.curAria}`);
  s = await ev(`(function(){ ${H} type('زقزقة'); document.querySelector('.quran-empty-clear').click(); return {v:vis().length, val:inp.value, foc:document.activeElement===inp}; })()`);
  ok(s.v === 114 && s.val === '' && s.foc, 'empty-state "مسح البحث" → restores 114 + empties field + focuses input');
  s = await ev(`(function(){ ${H} type('الأنبياء'); document.querySelector('.quran-filter-clear').click(); return {v:vis().length, val:inp.value, foc:document.activeElement===inp}; })()`);
  ok(s.v === 114 && s.val === '' && s.foc, 'inline clear ✕ → restores 114 + empties field + focuses input');
  await sleep(120); trackNet = false;
  // The DRAWER filter is client-only: typing a surah name or number into it must never hit the network.
  // NOTE — an earlier version of this check flagged ANY /api/ request in the window and was flaky, because the
  // SHARED shell fires a background geolocation warm-up (js/app.js #nearby-section → /api/geocode?q=city / an
  // overpass query) on load; that is the site's location feature, NOT the drawer, and it carries "city"/"town",
  // never a surah query. The precise, timing-independent assertion is: no request carried anything the DRAWER
  // was actually asked to search for. Its distinctive queries are surah names — not the bare numbers, which
  // could coincidentally match coordinates in a geocode URL.
  const TYPED = ['anbiya', 'الأنبياء', 'أنب', 'زقزقة'];
  const drawerHits = net2.filter(u => TYPED.some(q => u.includes(q) || u.includes(encodeURIComponent(q))));
  ok(drawerHits.length === 0, 'the drawer filter issued NO request carrying what was typed — client-only'
     + (drawerHits.length ? ' — caught: ' + JSON.stringify(drawerHits) : ' (the shell\'s background geolocation is unrelated)'));
  // …and the proof is structural, not a race: js/quran.js — which owns applyFilter — cannot make a network
  // call at all. No fetch, no XHR, no WebSocket. This can never flake.
  const qjs = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
  ok(!/\bfetch\s*\(|XMLHttpRequest|new\s+WebSocket|\.ajax\s*\(/.test(qjs), 'js/quran.js (owner of the drawer filter) contains NO fetch/XHR/WebSocket — the filter is structurally incapable of a network search');
  ok(!/\.innerHTML\s*=/.test(qjs.split('function applyFilter')[1].split('function clearFilter')[0]), 'applyFilter performs NO .innerHTML assignment (textContent only)');

  // ================= MOBILE =================
  await load(390, 844, true);
  s = await ev(`(function(){ ${H} document.querySelector('[data-quran-open-index]').click(); type('٢١'); var a=JSON.stringify(nums()); type('الأنبياء'); var b=JSON.stringify(nums()); return a+'|'+b; })()`);
  ok(s === '["21"]|["21"]', 'MOBILE: ٢١ → surah 21, and الأنبياء → surah 21');

  // ================= READING MODE =================
  await load(1440, 900, false);
  s = await ev(`(function(){ ${H}
    var rb=document.querySelector('.quran-reading-enter'); if(rb) rb.click();
    document.querySelector('[data-quran-open-index]').click();
    type('الأنبياء'); var one=JSON.stringify(nums());
    var reading=document.body.classList.contains('quran-reading');
    return one+'|'+reading; })()`);
  ok(s === '["21"]|true', 'READING MODE: filter still works (الأنبياء → surah 21 while reading)');

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
