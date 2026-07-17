// Smoke — QURAN-AR-SSR-114-DISPLAY-NAMES-AYAH-COUNT-AND-FULL-TEST-SUITE-FINAL-GATE-1 §1/§3, in a real browser.
// The short surah names are the whole problem: «ص» sits inside القصص / الصافات / الإخلاص, and «ق» inside
// البقرة / الفلق / الطلاق. A plain substring filter buries the surah actually NAMED «ص» among a dozen wrong
// answers. The filter is tiered (whole name → prefix → substring), and this proves each tier on the live DOM.
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_smoke_quran_drawer_search_priority_1.mjs
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';
import { fileURLToPath } from 'url';
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
// /quran/{official-english-slug} — the ONE URL per surah, read from the source-derived routes table.
// Never spell a slug out in a test: this file SKIPs (not fails) when the page 404s, so a drifted literal
// would go quietly green with zero coverage.
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

let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-search-smoke-' + process.pid);
async function main() {
  if (!(await fetch(BASE + P(21)).then(r => r.ok).catch(() => false))) { console.log('SKIP — no server at ' + BASE); process.exit(0); }
  const PORT = 9374;
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
  const ev = async (e) => { const r = await cdp.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error('EVAL ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text)); return r.result.value; };
  loaded = false; await cdp.send('Page.navigate', { url: BASE + P(21) });
  for (let i = 0; i < 100 && !loaded; i++) await sleep(100);
  await sleep(800);
  await ev(`document.querySelector('[data-quran-surah-browser-trigger]').click()`);
  await sleep(400);

  // type a query and read back which surahs remain visible
  const search = async (q) => ev(`(function(){
    var i = document.querySelector('[data-quran-surah-filter]');
    i.value = ${JSON.stringify(q)};
    i.dispatchEvent(new Event('input', { bubbles: true }));
    var vis = [].slice.call(document.querySelectorAll('.quran-idx-li')).filter(function(li){ return !li.hidden; });
    return { n: vis.length, nums: vis.map(function(li){ return +li.getAttribute('data-num'); }) };
  })()`);

  console.log('\n--- §3 a single letter finds the surah NAMED that letter, and nothing else ---');
  for (const [q, want] of [['ص', 38], ['ق', 50], ['يس', 36], ['يسٓ', 36]]) {
    const r = await search(q);
    ok(r.n === 1 && r.nums[0] === want, `«${q}» → surah ${want} alone — got ${r.n} result(s): ${JSON.stringify(r.nums.slice(0, 8))}`);
  }

  console.log('\n--- §3 the surah number matches by equality, in either digit set ---');
  for (const [q, want] of [['36', 36], ['٣٦', 36], ['38', 38], ['50', 50], ['1', 1], ['114', 114]]) {
    const r = await search(q);
    ok(r.n === 1 && r.nums[0] === want, `«${q}» → surah ${want} alone — got ${r.n}: ${JSON.stringify(r.nums.slice(0, 8))}`);
  }

  console.log('\n--- §3 the looser tiers still work when nothing matches exactly ---');
  const bq = await search('بق');   // no surah is named «بق»; البقرة contains it
  ok(bq.nums.includes(2), `«بق» falls through to substring and still finds Al-Baqara (2) — got ${JSON.stringify(bq.nums)}`);
  const fat = await search('الفاتحة');
  ok(fat.n === 1 && fat.nums[0] === 1, `a full name «الفاتحة» → surah 1 alone — got ${fat.n}`);
  const nas = await search('nas');  // prefix tier on the English name (An-Nās)
  ok(nas.nums.includes(114), `English «nas» finds An-Nas (114) — got ${JSON.stringify(nas.nums)}`);
  const none = await search('زقزقة');
  ok(none.n === 0, `a nonsense query matches nothing — got ${none.n}`);
  const all = await search('');
  ok(all.n === 114, `clearing the box restores all 114 — got ${all.n}`);

  console.log('\n--- §1 the drawer shows the conventional names, not the mushaf marks ---');
  const names = await ev(`(function(){
    var o = {};
    [36, 38, 50, 1, 2].forEach(function(n){
      var li = document.querySelector('.quran-idx-li[data-num="' + n + '"]');
      o[n] = li.querySelector('.quran-idx-name').textContent;
    });
    return o;
  })()`);
  for (const [n, want] of [[36, 'يس'], [38, 'ص'], [50, 'ق'], [1, 'الفاتحة'], [2, 'البقرة']]) {
    ok(names[n] === want, `drawer entry ${n} reads «${names[n]}» (want «${want}»)`);
  }
  const marks = await ev(`[].slice.call(document.querySelectorAll('.quran-idx-name')).filter(function(e){ return /[\\u064B-\\u0653\\u0670]/.test(e.textContent); }).length`);
  ok(marks === 0, `no drawer entry carries a combining mark — got ${marks}`);

  console.log('\n--- §2 the drawer counts agree with Arabic ---');
  const counts = await ev(`(function(){
    var o = {};
    [1, 2, 7, 10, 18, 108, 112, 114].forEach(function(n){
      o[n] = document.querySelector('.quran-idx-li[data-num="' + n + '"] .quran-idx-ay').textContent;
    });
    return o;
  })()`);
  for (const [n, want] of [[1, '٧ آيات'], [2, '٢٨٦ آية'], [7, '٢٠٦ آيات'], [10, '١٠٩ آيات'],
                           [18, '١١٠ آيات'], [108, '٣ آيات'], [112, '٤ آيات'], [114, '٦ آيات']]) {
    ok(counts[n] === want, `drawer ${n} → «${counts[n]}» (want «${want}»)`);
  }

  console.log('\n--- §1 the Quran TEXT keeps every mark, including U+0653 ---');
  loaded = false; await cdp.send('Page.navigate', { url: BASE + P(36) });
  for (let i = 0; i < 100 && !loaded; i++) await sleep(100);
  await sleep(700);
  const t36 = await ev(`(function(){
    var a1 = document.querySelector('#ayah-1 .quran-ayah-text').textContent;
    return { text: a1, hasMaddah: /\\u0653/.test(a1), h1: document.querySelector('#quran-surah-h1').textContent };
  })()`);
  ok(t36.hasMaddah, `surah 36 ayah 1 «${t36.text}» STILL contains U+0653 — the cleaner never touched the text`);
  ok(t36.h1.indexOf('سورة يس ') === 0, `…while its H1 reads «سورة يس …» — got «${t36.h1.slice(0, 20)}…»`);

  console.log('\n--- runtime cleanliness ---');
  ok(pageErrors.length === 0, 'pageerror = 0' + (pageErrors.length ? ' — ' + pageErrors.slice(0, 3) : ''));
  ok(consoleErrors.length === 0, 'console.error = 0' + (consoleErrors.length ? ' — ' + consoleErrors.slice(0, 3) : ''));
}

try { await main(); } finally {
  try { chrome && chrome.kill(); } catch (e) {}
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
}
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
