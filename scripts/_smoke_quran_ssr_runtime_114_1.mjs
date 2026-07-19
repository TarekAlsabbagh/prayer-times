// Smoke — QURAN-AR-FINAL-OFFICIAL-ENGLISH-SLUG-URL-STRUCTURE-NO-REDIRECTS-1 §16: RUNTIME in a real
// (headless) browser. SSR being right is not enough: app.js owns the SPA page activator and js/quran.js owns
// the jump bar and the reading-position key. The activator now matches a SLUG shape rather than a number, and
// the position key reads a data- attribute the server wrote — so a browser has to prove it. This drives one
// over several surahs and checks the reader ends up looking at the surah they asked for — on first load, after
// a reload, and after back/forward — with no pageerror and no console.error.
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_smoke_quran_ssr_runtime_114_1.mjs
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
// /quran/{official-english-slug} — read from the source-derived table, never spelled out in a test.
const ROUTES = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..',
  'data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json'), 'utf8')).surahs;
const P = n => ROUTES.find(x => x.number === n).path;
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }

let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-runtime-smoke-' + process.pid);
async function main() {
  if (!(await fetch(BASE + P(21)).then(r => r.ok).catch(() => false))) { console.log('SKIP — no server at ' + BASE); process.exit(0); }
  const PORT = 9373;
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
  let t = null;
  for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); t = l.find(x => x.type === 'page'); if (t?.webSocketDebuggerUrl) break; } catch (e) {} await sleep(250); }
  if (!t) { console.log('SKIP — headless Chrome did not expose a debugging target'); process.exit(0); }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  let loaded = false; cdp.on('Page.loadEventFired', () => { loaded = true; });
  const pageErrors = [], consoleErrors = [];
  cdp.on('Runtime.exceptionThrown', p => pageErrors.push(JSON.stringify(p.exceptionDetails?.text)));
  cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') consoleErrors.push((p.args || []).map(a => a.value || a.description || '').join(' ')); });
  const ev = async (expr) => { const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; };
  const goto = async (url) => { loaded = false; await cdp.send('Page.navigate', { url }); for (let i = 0; i < 100 && !loaded; i++) await sleep(100); await sleep(700); };

  // What the READER sees — app.js flips these classes at DOMContentLoaded. A page that is in the DOM but whose
  // ancestor .page is display:none is not "shown", so the visibility is read from computed style, not rects.
  const STATE = `(() => {
    const act = [...document.querySelectorAll('.page.active')].map(p => p.id);
    const h1 = document.querySelector('#quran-surah-h1');
    const host = h1 && h1.closest('.page');
    return { active: act, h1: h1 ? h1.textContent.trim() : null,
             visible: !!(host && getComputedStyle(host).display !== 'none'),
             ayahs: document.querySelectorAll('.quran-ayah').length,
             navPrev: !!document.querySelector('.quran-surah-nav-card--prev'),
             navNext: !!document.querySelector('.quran-surah-nav-card--next'),
             ayahMax: (document.querySelector('#quran-ayah-input') || {}).max || null };
  })()`;

  console.log('\n--- §13/§14 first load: the SSR page stays active; app.js does not flash it home ---');
  for (const [n, name, ayat] of [[1, 'الفاتحة', 7], [2, 'البقرة', 286], [9, 'التوبة', 129], [21, 'الأنبياء', 112], [108, 'الكوثر', 3], [114, 'الناس', 6]]) {
    await goto(`${BASE}${P(n)}`);
    const st = await ev(STATE);
    ok(st.active.length === 1 && st.active[0] === 'page-quran-surah', `surah ${n}: exactly one active page, and it is #page-quran-surah — got ${JSON.stringify(st.active)}`);
    ok(st.visible && st.h1 === `سورة ${name} مكتوبة كاملة بالتشكيل والرسم العثماني`, `surah ${n}: the VISIBLE H1 is «سورة ${name}…» — got «${st.h1}» visible=${st.visible}`);
    ok(st.ayahs === ayat, `surah ${n}: ${ayat} ayat in the DOM — got ${st.ayahs}`);
    ok(st.ayahMax === String(ayat), `surah ${n}: the jump ceiling is this surah's own (${ayat}) — got ${st.ayahMax}`);
    ok(st.navPrev === (n !== 1) && st.navNext === (n !== 114), `surah ${n}: prev=${n !== 1}/next=${n !== 114} — got prev=${st.navPrev}/next=${st.navNext}`);
  }

  console.log('\n--- §12 the jump bar validates against THIS surah, not Al-Anbiya\'s 112 ---');
  const JUMP = v => `(() => {
    const f = document.querySelector('[data-quran-ayah-jump]'), i = document.querySelector('#quran-ayah-input');
    i.value = '${v}'; f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    return document.querySelector('[data-quran-ayah-errmsg]').hidden === false;
  })()`;
  await goto(`${BASE}${P(1)}`);
  ok(await ev(JUMP(8)) === true, 'Al-Fatiha: ayah 8 is REJECTED (the old literal 112 would have accepted it)');
  ok(await ev(JUMP(7)) === false, 'Al-Fatiha: ayah 7 is accepted');
  await goto(`${BASE}${P(2)}`);
  ok(await ev(JUMP(150)) === false, 'Al-Baqara: ayah 150 is accepted (the old literal 112 would have refused it)');
  ok(await ev(JUMP(287)) === true, 'Al-Baqara: ayah 287 is rejected');

  console.log('\n--- §14 the reading position is stored per surah ---');
  // localStorage survives navigation, so the keys from the loop above are still here — that is the point:
  // every surah visited so far must have written its OWN key. Clearing first would test less, not more.
  await goto(`${BASE}${P(1)}`); await ev('window.scrollTo(0, 300)'); await sleep(400);
  await goto(`${BASE}${P(2)}`); await ev('window.scrollTo(0, 900)'); await sleep(400);
  const pos = await ev(`(() => {
    const o = {}; Object.keys(localStorage).filter(k => k.indexOf('quran.pos.') === 0).forEach(k => o[k] = localStorage.getItem(k)); return o;
  })()`);
  // QURAN-AR-HOME-INDEX-SSR-1 added ONE more key in this namespace — `quran.pos.last`, the recency pointer
  // /quran reads. It is separated out here rather than added to the list: the assertion below is about the
  // PER-SURAH keys, and folding a global pointer into that set would quietly weaken it.
  const keys = Object.keys(pos).filter(k => k !== 'quran.pos.last').sort();
  const want = ['quran.pos.surah1', 'quran.pos.surah108', 'quran.pos.surah114', 'quran.pos.surah2', 'quran.pos.surah21', 'quran.pos.surah9'].sort();
  ok(keys.join() === want.join(), `each visited surah wrote its OWN position key — got ${keys.length}: «${keys.join(', ')}» (the prototype wrote every surah to one «quran.pos.surah21»)`);
  // and the pointer itself must name the surah just left (2), with a real ayah — a stale or absent pointer
  // would make /quran offer to resume in the wrong place.
  let last = null; try { last = JSON.parse(pos['quran.pos.last'] || 'null'); } catch (e) {}
  ok(!!last && last.n === 2 && last.ayah >= 1, `quran.pos.last points at the surah just read (2) — got ${JSON.stringify(last)}`);
  // …and every stored value is a page from THAT surah's own range. (Which page exactly depends on where the
  // scroll landed — Al-Baqara spans 48 pages, so 900px in is page 3, not page 2. The invariant that matters is
  // that surah N's key never holds a page belonging to a different surah.)
  const RANGES = { 1: [1, 1], 2: [2, 49], 9: [187, 207], 21: [322, 331], 108: [602, 602], 114: [604, 604] };
  const strays = Object.entries(RANGES).filter(([n, [lo, hi]]) => { const v = +pos['quran.pos.surah' + n]; return !(v >= lo && v <= hi); })
    .map(([n]) => `surah ${n} → ${pos['quran.pos.surah' + n]}`);
  ok(strays.length === 0, `every key holds a page from ITS OWN surah's range — Fatiha=${pos['quran.pos.surah1']}, Baqara=${pos['quran.pos.surah2']}, Anbiya=${pos['quran.pos.surah21']}, Nas=${pos['quran.pos.surah114']}`
     + (strays.length ? ' — strays: ' + strays : ''));

  console.log('\n--- §14 reload / back / forward land on the right surah with no stale content ---');
  await goto(`${BASE}${P(21)}`);
  await goto(`${BASE}${P(36)}`);
  await goto(`${BASE}${P(36)}`);
  let st = await ev(STATE);
  ok(st.h1.includes('يس') && st.ayahs === 83, `reload of surah 36 re-renders Ya-Sin (83 ayat) — got «${st.h1}» / ${st.ayahs}`);
  await ev('history.back()'); await sleep(1800);
  st = await ev(STATE);
  ok(st.h1.includes('الأنبياء') && st.ayahs === 112, `back → Al-Anbiya (112 ayat), no stale Ya-Sin — got «${st.h1}» / ${st.ayahs}`);
  await ev('history.forward()'); await sleep(1800);
  st = await ev(STATE);
  ok(st.h1.includes('يس') && st.ayahs === 83, `forward → Ya-Sin again — got «${st.h1}» / ${st.ayahs}`);

  console.log('\n--- §10/§14 the drawer opens once and its entries are real links ---');
  await goto(`${BASE}${P(21)}`);
  // The drawer lists all 114: 113 links OUT, plus the surah you are already reading as an in-page anchor
  // (href="#page-N") rather than a link to itself. So the entries split exactly 113 + 1, and every one of the
  // 113 must be a path the routes table knows — a stray numeric or misspelt href fails to match rather than
  // slipping through a shape test.
  const wantHrefs = ROUTES.filter(x => x.number !== 21).map(x => x.path);
  const modal = await ev(`(() => {
    document.querySelector('[data-quran-surah-browser-trigger]').click();
    const m = document.querySelectorAll('#quran-index');
    const l = document.querySelector('.quran-idx-item[href="${P(36)}"]');
    const all = Array.from(document.querySelectorAll('.quran-idx-item')).map(a => a.getAttribute('href'));
    return { modals: m.length, open: m[0].getAttribute('aria-hidden') === 'false', href: l ? l.getAttribute('href') : null,
             all: all, links: all.filter(h => h && h.charAt(0) !== '#'), self: all.filter(h => h && h.charAt(0) === '#') };
  })()`);
  ok(modal.modals === 1 && modal.open, `exactly one drawer node, and it opens — got ${modal.modals} node(s), open=${modal.open}`);
  ok(modal.href === P(36) && modal.links.length === 113, `the drawer holds 113 real surah links — got ${modal.links.length}, Ya-Sin → ${modal.href}`);
  ok(modal.self.length === 1, `…and exactly 1 in-page anchor for the surah being read — got ${modal.self.length}: ${JSON.stringify(modal.self)}`);
  const notSlug = modal.links.filter(h => !wantHrefs.includes(h));
  ok(notSlug.length === 0, 'every drawer link is one of the 114 official slug paths — no number, no /quran/surah/' + (notSlug.length ? ' | ' + JSON.stringify(notSlug.slice(0, 5)) : ''));

  console.log('\n--- runtime cleanliness across every navigation above ---');
  ok(pageErrors.length === 0, 'pageerror = 0' + (pageErrors.length ? ' — ' + pageErrors.slice(0, 3) : ''));
  ok(consoleErrors.length === 0, 'console.error = 0' + (consoleErrors.length ? ' — ' + consoleErrors.slice(0, 3) : ''));
}

try { await main(); } finally {
  try { chrome && chrome.kill(); } catch (e) {}
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
}
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
