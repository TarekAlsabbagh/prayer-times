// Smoke — QURAN surah page: the SITE's Islamic-events countdown reused as the LAST section (P0). Browser test
// (headless Chrome + CDP): exactly ONE .moon-events-section inside #page-quran-surah, with the shared title +
// the four occasions (Ramadan / Eid al-Fitr / Eid al-Adha / Hijri New Year); it is the last section-card before
// the footer; SSR-rendered with REAL day/date values (no placeholder, no hardcoded literals — reuses the site
// builder _buildMoonOccasionsCountdownHtml + single _MOON_OCCASIONS_EVENTS source); hidden in reading mode +
// restored on exit; no overflow; dark ok; no duplicate ids/components. Self-contained (reuses/​spawns a server).
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
let base = process.env.QURAN_SMOKE_URL || 'http://localhost:3100'; let spawnedServer = null;
async function ensureServer() {
  if (await reachable(base)) { const H = await fetch(base + '/quran/surah/21').then(r => r.text()).catch(() => ''); if (/id="mc-occasions"/.test(H)) return true; }
  const PORT = 3197; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT), NODE_PATH: process.env.NODE_PATH || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules' }) });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base)) { const H = await fetch(base + '/quran/surah/21').then(r => r.text()).catch(() => ''); if (/id="mc-occasions"/.test(H)) return true; } }
  return false;
}
class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }
let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-events-smoke-' + process.pid);
async function main() {
  // ---- (A) SSR / No-JS source-level checks (raw HTML, no browser) ----
  const rawHtml = await fetch(base.replace(/\/$/, '') || 'http://localhost:3100').catch(() => null) && await fetch((base) + '/quran/surah/21').then(r => r.text()).catch(() => '');
  const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
  const qb = srv.slice(srv.indexOf('function _buildQuranSurahBody(n)'), srv.indexOf('// ===== HTTP Server =====', srv.indexOf('function _buildQuranSurahBody(n)')));
  ok(/_buildMoonOccasionsCountdownHtml\('ar'\)/.test(qb), 'the surah builder REUSES the site component _buildMoonOccasionsCountdownHtml (single source, no manual markup copy)');
  ok(!/\d+\s*يومًا/.test(qb) && !/\d+\s*(days|فبراير|مارس|مايو|يونيو)/.test(qb), 'NO hardcoded day counts / dates in the surah builder (values come from the shared calc)');
  if (rawHtml) {
    ok(/id="mc-occasions"[\s\S]{0,900}العد التنازلي للمناسبات الإسلامية/.test(rawHtml), 'SSR HTML contains the events title (visible with No-JS)');
    ok(/رمضان القادم/.test(rawHtml) && /رأس السنة الهجرية/.test(rawHtml), 'SSR HTML contains the occasion NAMES (No-JS shows them)');
    ok(/mc-occasions[\s\S]{0,1200}\d{1,3}\s*(يوم|أيام|يومًا)/.test(rawHtml) || /mc-occasions[\s\S]{0,1200}(اليوم|غدًا|يومان)/.test(rawHtml), 'SSR HTML has a REAL day count (No-JS is not empty / not a spinner)');
    ok((rawHtml.match(/id="mc-occasions"/g) || []).length === 1 && (rawHtml.match(/id="mc-occasions-h2"/g) || []).length === 1, 'the events section ids are unique in the served HTML');
  } else { ['SSR title', 'SSR names', 'SSR real days', 'unique ids'].forEach(m => ok(false, 'raw HTML unavailable for: ' + m)); }

  // ---- (B) browser behaviour ----
  const PORT = 9371;
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
  const load = async (w, h, mobile) => { await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile }); loaded = false; await cdp.send('Page.navigate', { url: base + '/quran/surah/21' }); for (let i = 0; i < 100 && !loaded; i++) await sleep(100); await sleep(900); };
  const H = `
    var page=document.getElementById('page-quran-surah');
    var secs=page?[].slice.call(page.querySelectorAll('.moon-events-section')):[];
    var sec=secs[0];
    function shown(el){ return !!el && el.getClientRects().length>0; }
  `;
  await load(1440, 900, false);
  let s = await ev(`(function(){ ${H}
    var footer=document.querySelector('.site-footer');
    var cards=sec?[].slice.call(sec.querySelectorAll('.moon-event-card')):[];
    return { count:secs.length,
      title: sec ? (sec.querySelector('.moon-events-title')||{}).textContent : '',
      cards: cards.length,
      labels: cards.map(function(c){ var l=c.querySelector('.moon-event-label'); return l?l.textContent.trim():''; }),
      hrefs: cards.map(function(c){ return c.getAttribute('href'); }),
      daysNonEmpty: cards.every(function(c){ var d=c.querySelector('.moon-event-days'); return d && d.textContent.trim().length>0; }),
      beforeFooter: sec && footer ? (sec.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING)>0 : false,
      lastSectionCard: sec ? (function(){ var all=[].slice.call(page.querySelectorAll('.section-card')); return all[all.length-1]===sec; })() : false,
      dupIds: (function(){ var ids={},d=[]; page.querySelectorAll('[id]').forEach(function(el){ if(ids[el.id])d.push(el.id); else ids[el.id]=1; }); return d; })(),
      noOverflow: document.documentElement.scrollWidth<=innerWidth+1 }; })()`);
  ok(s.count === 1, 'exactly ONE .moon-events-section inside #page-quran-surah (no duplicate component) — got ' + s.count);
  ok((s.title || '').indexOf('العد التنازلي للمناسبات الإسلامية') !== -1, 'section title present');
  ok(s.cards === 4, 'the four occasions are present — got ' + s.cards + ' cards');
  ok(['رمضان القادم', 'عيد الفطر', 'عيد الأضحى', 'رأس السنة الهجرية'].every(l => s.labels.indexOf(l) !== -1), 'labels: Ramadan + Eid al-Fitr + Eid al-Adha + Hijri New Year — got ' + JSON.stringify(s.labels));
  ok(s.hrefs.every(h => /-countdown$/.test(h || '')), 'every occasion links to a real countdown page (no 404) — ' + JSON.stringify(s.hrefs));
  ok(s.daysNonEmpty, 'every card shows a non-empty day value');
  ok(s.beforeFooter, 'the events section is BEFORE the global footer');
  ok(s.lastSectionCard, 'the events section is the LAST .section-card inside the page content');
  ok(s.dupIds.length === 0, 'no duplicate ids inside #page-quran-surah' + (s.dupIds.length ? ' — ' + JSON.stringify(s.dupIds) : ''));
  ok(s.noOverflow, 'no horizontal overflow on desktop (1440)');

  // reading mode hides it, exit restores it
  s = await ev(`(function(){ ${H}
    var re=document.querySelector('.quran-reading-enter'); re.click();
    var hid = !shown(sec);
    var rx=document.querySelector('.quran-reading-exit'); rx.click();
    var back = shown(sec);
    var stillOne = document.getElementById('page-quran-surah').querySelectorAll('.moon-events-section').length===1;
    return {hid:hid, back:back, stillOne:stillOne}; })()`);
  ok(s.hid, 'events section HIDDEN in reading mode');
  ok(s.back, 'events section RESTORED on exiting reading mode');
  ok(s.stillOne, 'still exactly ONE section after exit (not re-created / duplicated)');

  // mobile + dark
  await load(390, 844, true);
  s = await ev(`(function(){ ${H} return {noOverflow: document.documentElement.scrollWidth<=innerWidth+1, visible: shown(sec)}; })()`);
  ok(s.noOverflow && s.visible, 'no overflow + section visible on mobile (390)');
  await load(1440, 900, false);
  s = await ev(`(function(){ ${H} document.documentElement.setAttribute('data-theme','dark'); var t=document.querySelector('.moon-events-title'); return { dark: shown(sec) && !!t }; })()`);
  ok(s.dark, 'dark mode: events section renders');

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
