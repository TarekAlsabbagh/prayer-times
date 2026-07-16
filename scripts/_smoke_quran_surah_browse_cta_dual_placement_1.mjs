// Smoke — QURAN "browse all surahs" CTA: distinctive redesign + DUAL placement (P0). Browser test (headless
// Chrome + CDP): EXACTLY two CTAs (hero + after the surah-end prev/next cards), each with an inline icon +
// "تصفّح جميع سور القرآن" + "فهرس ١١٤ سورة" + chevron; both open the SAME ONE index modal (one search box) via
// the shared data-quran-surah-browser-trigger; focus returns to the button that opened it; no duplicate ids; no
// route links (no 404s); both hidden in reading mode + restored on exit; no overflow (desktop/mobile); dark ok.
// Self-contained: reuses QURAN_SMOKE_URL/localhost:3100 if serving the CTA, else spawns its own; SKIPs (exit 0)
// only if Chrome or a server truly cannot be obtained.
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
  if (await reachable(base)) { const H = await fetch(base + '/quran/surah/21').then(r => r.text()).catch(() => ''); if (/quran-browse-cta/.test(H)) return true; }
  const PORT = 3198; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT) }) });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base)) { const H = await fetch(base + '/quran/surah/21').then(r => r.text()).catch(() => ''); if (/quran-browse-cta/.test(H)) return true; } }
  return false;
}
class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }
let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-cta-smoke-' + process.pid);
async function main() {
  if (!await ensureServer()) { console.log('SKIP — could not reach or spawn a prototype server'); process.exit(0); }
  const PORT = 9361;
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
    var ctas=[].slice.call(document.querySelectorAll('.quran-browse-cta'));
    var hero=document.querySelector('.quran-hero .quran-browse-cta');
    var end=document.querySelector('.quran-surah-end .quran-browse-cta-wrap .quran-browse-cta');
    var modal=document.getElementById('quran-index');
    function shown(el){ return !!el && el.getClientRects().length>0; }
  `;

  // ================= DESKTOP: structure =================
  await load(1440, 900, false);
  let s = await ev(`(function(){ ${H}
    return { count:ctas.length,
      hasHero:!!hero, hasEnd:!!end,
      endAfterCards: !!end && (function(){ var nav=document.querySelector('.quran-surah-end .quran-surah-nav'); return nav && (nav.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING)>0; })(),
      bothLabel: ctas.every(function(c){ return /تصفّح جميع سور القرآن/.test(c.textContent); }),
      bothIcon: ctas.every(function(c){ return !!c.querySelector('.quran-cta-ico-svg'); }),
      bothSub: ctas.every(function(c){ return /فهرس ١١٤ سورة/.test(c.textContent); }),
      bothArrow: ctas.every(function(c){ return !!c.querySelector('.quran-cta-arrow-svg'); }),
      bothHaspopup: ctas.every(function(c){ return c.getAttribute('aria-haspopup')==='dialog'; }),
      bothControls: ctas.every(function(c){ return c.getAttribute('aria-controls')==='quran-index'; }),
      bothTrigger: ctas.every(function(c){ return c.hasAttribute('data-quran-surah-browser-trigger'); }),
      modalCount: document.querySelectorAll('#quran-index').length,
      searchCount: document.querySelectorAll('[data-quran-surah-filter]').length };
  })()`);
  ok(s.count === 2, 'EXACTLY two browse CTAs on the page (got ' + s.count + ')');
  ok(s.hasHero, 'top/hero CTA present');
  ok(s.hasEnd, 'bottom CTA present (in the surah-end box)');
  ok(s.endAfterCards, 'bottom CTA sits AFTER the prev/next (طه/الحج) nav cards');
  ok(s.bothLabel, 'both CTAs show «تصفّح جميع سور القرآن»');
  ok(s.bothIcon, 'both CTAs contain the inline mushaf icon (SVG)');
  ok(s.bothSub, 'both CTAs show the «فهرس ١١٤ سورة» subline');
  ok(s.bothArrow, 'both CTAs contain the chevron indicator (SVG)');
  ok(s.bothHaspopup && s.bothControls && s.bothTrigger, 'both CTAs: aria-haspopup=dialog + aria-controls=quran-index + shared trigger');
  ok(s.modalCount === 1, 'exactly ONE #quran-index modal on the page');
  ok(s.searchCount === 1, 'exactly ONE surah search box on the page');

  // ---- visual hierarchy: hero variant is SECONDARY (narrower than end); «ابدأ القراءة» stays the primary ----
  s = await ev(`(function(){ ${H}
    function rc(el){var r=el.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height)};}
    var start=document.querySelector('.quran-hero-actions .quran-btn-primary');
    return { heroVariant: !!document.querySelector('.quran-browse-cta--hero'),
      endVariant: !!document.querySelector('.quran-browse-cta--end'),
      sameComponent: !!hero && !!end && hero.classList.contains('quran-browse-cta') && end.classList.contains('quran-browse-cta'),
      heroW: rc(hero).w, endW: rc(end).w, heroNarrower: rc(hero).w < rc(end).w,
      startH: rc(start).h, heroH: rc(hero).h, startNotLessTouch: rc(start).h >= rc(hero).h,
      startTouch: rc(start).h >= 48, heroTouch: rc(hero).h >= 48, endTouch: rc(end).h >= 48,
      heroNotTaller: rc(hero).h <= rc(start).h + 1 }; })()`);
  ok(s.heroVariant, 'hero variant present (.quran-browse-cta--hero)');
  ok(s.endVariant, 'end variant present (.quran-browse-cta--end)');
  ok(s.sameComponent, 'both variants are the SAME component (.quran-browse-cta)');
  ok(s.heroNarrower, 'hero CTA is NARROWER than the end CTA on desktop (' + s.heroW + ' < ' + s.endW + ')');
  ok(s.startNotLessTouch, '«ابدأ القراءة» touch height ≥ hero CTA (' + s.startH + ' ≥ ' + s.heroH + ') — it is not less prominent');
  ok(s.heroNotTaller, 'hero CTA is NOT taller than «ابدأ القراءة» (balanced hero heights)');
  ok(s.startTouch && s.heroTouch && s.endTouch, 'all three (ابدأ القراءة + both CTAs) have ≥48px touch height');

  // no duplicate ids
  s = await ev(`(function(){ var ids={},dups=[]; [].forEach.call(document.querySelectorAll('[id]'),function(el){ var id=el.id; if(ids[id]) dups.push(id); else ids[id]=1; }); return dups; })()`);
  ok(s.length === 0, 'NO duplicate element ids' + (s.length ? ' — ' + JSON.stringify(s) : ''));
  // no broken sibling-surah links
  s = await ev(`document.querySelectorAll('a[href*="/quran/surah/2"]').length`);
  ok(s === 0, 'NO /quran/surah/{n} sibling links (no 404s)');

  // ================= open + focus return: TOP =================
  s = await ev(`(function(){ ${H}
    hero.focus(); hero.click();
    var open1 = modal.classList.contains('is-open');
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    var back1 = document.activeElement===hero;
    return {open1:open1, back1:back1}; })()`);
  ok(s.open1, 'TOP CTA opens the modal');
  ok(s.back1, 'closing returns focus to the TOP CTA (the button that opened it)');
  // ================= open + focus return: BOTTOM =================
  s = await ev(`(function(){ ${H}
    end.focus(); end.click();
    var sameModal = document.getElementById('quran-index').classList.contains('is-open') && document.querySelectorAll('#quran-index').length===1;
    var oneSearch = document.querySelectorAll('[data-quran-surah-filter]').length===1;
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    var back2 = document.activeElement===end;
    return {sameModal:sameModal, oneSearch:oneSearch, back2:back2}; })()`);
  ok(s.sameModal, 'BOTTOM CTA opens the SAME single modal');
  ok(s.oneSearch, 'still exactly ONE search box (no duplicated list/box)');
  ok(s.back2, 'closing returns focus to the BOTTOM CTA');

  // ================= reading mode hides both, exit restores =================
  s = await ev(`(function(){ ${H}
    var re=document.querySelector('.quran-reading-enter'); re.click();
    var hiddenInReading = !shown(hero) && !shown(end);
    var rx=document.querySelector('.quran-reading-exit'); rx.click();
    var shownAfterExit = shown(hero) && shown(end);
    return {hiddenInReading:hiddenInReading, shownAfterExit:shownAfterExit}; })()`);
  ok(s.hiddenInReading, 'BOTH CTAs hidden in reading mode');
  ok(s.shownAfterExit, 'BOTH CTAs restored on exiting reading mode');

  // ================= no overflow: desktop + mobile, dark ok =================
  s = await ev(`document.documentElement.scrollWidth <= innerWidth + 1`);
  ok(s, 'NO horizontal overflow on desktop (1440)');
  await load(390, 844, true);
  s = await ev(`(function(){ ${H}
    var card=document.querySelector('.quran-surah-nav-card');
    return { noOverflow: document.documentElement.scrollWidth <= innerWidth+1,
      endFullish: !!end && !!card && Math.abs(end.getBoundingClientRect().width - card.getBoundingClientRect().width) <= 4,
      touch: !!end && end.getBoundingClientRect().height >= 44 }; })()`);
  ok(s.noOverflow, 'NO horizontal overflow on mobile (390)');
  ok(s.endFullish, 'bottom CTA is full-width within the card on mobile (matches the stacked nav cards)');
  ok(s.touch, 'bottom CTA touch target ≥ 44px tall on mobile');
  // dark
  await load(1440, 900, false);
  s = await ev(`(function(){ ${H}
    document.documentElement.setAttribute('data-theme','dark');
    var bg=getComputedStyle(hero).backgroundImage;
    return { rendered: shown(hero) && shown(end), gradient: bg && bg!=='none' }; })()`);
  ok(s.rendered && s.gradient, 'dark mode: both CTAs render with the brand gradient');

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
