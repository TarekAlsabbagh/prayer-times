/* QURAN-HOME-VISIBLE-CONTENT-DEPTH-AND-SEARCH-INTENT-1 — visible-word-count budget for /quran.

   SEOptimer counts RENDERED text, so this measures `innerText` in a real browser, never the raw HTML. Four
   numbers are reported separately because they answer different questions:
     1. total visible words in #page-quran-home
     2. the new guidance section
     3. the FAQ — measured BOTH ways, because <details> are closed by default and a closed <details> is not
        rendered, so its answers do not count as visible text. The SSR figure proves the answers ship; the
        visible figure is what a crawler actually sees. The word budget is never allowed to lean on the
        closed answers.
     4. editorial words = total minus the 114 surah cards, the 30 juz cards, breadcrumb, hero chips and the
        services links — i.e. the prose a reader actually reads, which is what «Amount of Content» is about.

   Run with QURAN_SMOKE_URL / QURAN_SSR_BASE (default http://localhost:3000). BASELINE_ONLY=1 prints the
   numbers without asserting, which is how the before-figures in the report were taken. */
import { spawn } from 'child_process';
import os from 'os'; import path from 'path'; import fs from 'fs';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
const BASELINE = process.env.BASELINE_ONLY === '1';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
      else if (m.method && this.h[m.method]) this.h[m.method](m.params);
    });
  }
  send(m, p = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method: m, params: p })); }); }
  on(m, f) { this.h[m] = f; }
}

const PORT = 9503, UDD = path.join(os.tmpdir(), 'qdepth-' + process.pid);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--incognito',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
let t = null;
for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); t = l.find(x => x.type === 'page'); if (t?.webSocketDebuggerUrl) break; } catch (e) { } await sleep(250); }
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
const cdp = new CDP(ws);
await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
let loaded = false; const errs = [], cerr = [];
cdp.on('Page.loadEventFired', () => { loaded = true; });
cdp.on('Runtime.exceptionThrown', p => errs.push(String(p.exceptionDetails?.text || '')));
cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') cerr.push((p.args || []).map(a => a.value || '').join(' ')); });
const ev = async e => (await cdp.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;
const go = async u => { loaded = false; await cdp.send('Page.navigate', { url: u }); for (let i = 0; i < 300 && !loaded; i++) await sleep(100); await sleep(1200); };

let P = 0, F = 0;
const ok = (c, m) => { if (BASELINE) { console.log('  ---- ' + m); return; } if (c) { P++; console.log('  PASS ' + m); } else { F++; console.log('  FAIL ' + m); } };

await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await go(B + '/quran');

// One evaluate, so every figure comes from the SAME layout pass.
const M = JSON.parse(await ev(`(()=>{
  const words = s => (String(s||'').trim().match(/\\S+/g)||[]).length;
  const vis = el => el ? words(el.innerText) : 0;          // rendered text only
  const ssr = el => el ? words(el.textContent) : 0;        // ships in the HTML, rendered or not
  const page = document.getElementById('page-quran-home');
  const guide = document.getElementById('quran-home-guide');
  const faq = document.querySelector('.quran-home-faq');
  const source = document.getElementById('quran-home-source');
  // containers whose text is data, not prose
  const dataBits = [...document.querySelectorAll('#page-quran-home .quran-home-idx-grid, #page-quran-home .quran-home-juz-grid, #page-quran-home .moon-breadcrumb, #page-quran-home .quran-home-stats, #page-quran-home .quran-home-stats-cards, #page-quran-home .quran-services-grid, #page-quran-home .quran-services, #page-quran-home .quran-home-idx-grouptitle')];
  const dataWords = dataBits.reduce((a,el)=>a+vis(el),0);
  return JSON.stringify({
    total: vis(page),
    guide: vis(guide), guideSsr: ssr(guide),
    faqVisible: vis(faq), faqSsr: ssr(faq),
    source: vis(source),
    dataWords, editorial: vis(page) - dataWords,
    h1: document.querySelectorAll('#page-quran-home h1').length,
    h2: document.querySelectorAll('#page-quran-home h2').length,
    h3: document.querySelectorAll('#page-quran-home h3').length,
    cards: document.querySelectorAll('.quran-home-idx-card').length,
    juz: document.querySelectorAll('.quran-home-juz-card').length,
    guideCards: document.querySelectorAll('#quran-home-guide .quran-home-guide-card').length,
    detailsOpen: [...document.querySelectorAll('.quran-home-faq details')].filter(d=>d.open).length,
    detailsTotal: document.querySelectorAll('.quran-home-faq details').length
  });
})()`));

console.log('--- §11 word budget (rendered, 1440px) ---');
console.log(JSON.stringify(M, null, 2));

ok(M.total >= 1050 && M.total <= 1250, `total visible words in #page-quran-home = ${M.total} (target 1050–1250)`);
ok(M.total <= 1350, `hard ceiling respected — ${M.total} <= 1350`);
ok(M.editorial >= 500, `editorial words (excluding the 114 + 30 cards, breadcrumb, chips, services) = ${M.editorial} (target >= 500)`);
ok(M.guide >= 300 && M.guide <= 430, `guidance section = ${M.guide} words (target 300–430)`);
ok(M.faqSsr >= 220 && M.faqSsr <= 320, `FAQ text shipped in SSR = ${M.faqSsr} words (target 220–320)`);
// The check that stops a closed accordion from being used as a word-count trick. `total` is innerText, and
// a closed <details> is not rendered, so its answers are ALREADY outside that figure — the assertion is that
// the target is cleared by text a reader can see, while the collapsed answers stay a measurable extra.
// (Do not "subtract the collapsed words from the total": they were never in it. That was this test's own
// first mistake, and it double-counted the gap.)
ok(M.total >= 1050 && M.faqSsr > M.faqVisible,
   `the ${M.total} visible words exclude the collapsed answers — innerText counts only ${M.faqVisible} FAQ words; ${M.faqSsr - M.faqVisible} more ship in closed <details> and are NOT part of the total`);
ok(M.detailsOpen === 0, `no <details> forced open to inflate the count — ${M.detailsOpen}/${M.detailsTotal} open`);

console.log('\n--- §13 the page still works ---');
ok(M.h1 === 1, `H1 = ${M.h1}`);
ok(M.h2 === 9, `H2 = ${M.h2} (7 base + guidance + the al-Kahf feature card)`);
ok(M.h3 === 17, `H3 = ${M.h3} (14 before + 3 card titles)`);
ok(M.cards === 114 && M.juz === 30, `114 surah cards + 30 juz cards — ${M.cards}/${M.juz}`);
ok(M.guideCards === 3, `3 guidance cards — ${M.guideCards}`);

// heading order: every H3 must sit under an H2, and the H1 comes first
const order = JSON.parse(await ev(`JSON.stringify([...document.querySelectorAll('#page-quran-home h1,#page-quran-home h2,#page-quran-home h3')].map(h=>h.tagName))`));
ok(order[0] === 'H1' && !order.slice(1).includes('H1'), 'H1 is first and unique');
ok(!order.some((tg, i) => tg === 'H3' && !order.slice(0, i).includes('H2')), 'no H3 appears before its first H2');

console.log('\n--- §1/§12 nothing hidden, nothing off-screen ---');
const hidden = JSON.parse(await ev(`(()=>{
  const g = document.getElementById('quran-home-guide');
  if (!g) return JSON.stringify({missing:true});
  const bad = [];
  for (const el of [g, ...g.querySelectorAll('*')]) {
    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (c.display === 'none') bad.push('display:none ' + el.className);
    if (c.visibility === 'hidden') bad.push('visibility:hidden ' + el.className);
    if (+c.opacity === 0) bad.push('opacity:0 ' + el.className);
    if (el.hasAttribute('aria-hidden')) bad.push('aria-hidden ' + el.className);
    if (el.hasAttribute('hidden')) bad.push('hidden ' + el.className);
    if (r.width > 0 && (r.right < -100 || r.left > innerWidth + 100)) bad.push('off-screen ' + el.className);
    if (c.fontSize && parseFloat(c.fontSize) < 10 && el.textContent.trim()) bad.push('tiny-font ' + el.className);
  }
  return JSON.stringify({bad});
})()`));
ok(!hidden.missing && hidden.bad.length === 0, `no hidden / off-screen / aria-hidden text in the new section — ${(hidden.bad || []).join(' | ') || 'clean'}`);

const contrast = JSON.parse(await ev(`(()=>{
  const g = document.getElementById('quran-home-guide');
  const els = g ? [...g.querySelectorAll('p,h2,h3,li')] : [];
  const same = els.filter(el => { const c = getComputedStyle(el); return c.color === c.backgroundColor; });
  return JSON.stringify({same: same.length});
})()`));
ok(contrast.same === 0, `no text painted in its own background colour — ${contrast.same}`);

console.log('\n--- §9 responsive: 3 / 2 / 1 across the breakpoints ---');
for (const [w, h, expect, label] of [[1440, 900, 3, 'desktop'], [900, 1000, 2, 'tablet'], [390, 844, 1, 'mobile']]) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await sleep(500);
  const d = JSON.parse(await ev(`(()=>{
    const cards=[...document.querySelectorAll('#quran-home-guide .quran-home-guide-card')];
    const tops=[...new Set(cards.map(c=>Math.round(c.getBoundingClientRect().top)))];
    const perRow = tops.length ? cards.filter(c=>Math.round(c.getBoundingClientRect().top)===tops[0]).length : 0;
    const doc=document.documentElement;
    return JSON.stringify({perRow, rows:tops.length, overflow: doc.scrollWidth - doc.clientWidth,
      clipped: cards.some(c=>c.scrollHeight - c.clientHeight > 2)});
  })()`));
  ok(d.perRow === expect, `${label} ${w}px: ${d.perRow} card(s) in the first row (expected ${expect}), ${d.rows} row(s)`);
  ok(d.overflow <= 0, `${label}: no horizontal overflow — scrollWidth-clientWidth = ${d.overflow}`);
  ok(!d.clipped, `${label}: no card clips its own text (no fixed height cutting content)`);
}
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

console.log('\n--- §12 no duplicated prose ---');
const dup = JSON.parse(await ev(`(()=>{
  const norm = s => String(s||'').replace(/[\\u064B-\\u0652]/g,'').replace(/[^\\p{L}\\p{N}\\s]/gu,' ').replace(/\\s+/g,' ').trim();
  const paras = [...document.querySelectorAll('#page-quran-home p, #page-quran-home li')]
    .map(p=>norm(p.innerText)).filter(s=>s.split(' ').length >= 8);
  const seen = new Map(), dups = [];
  for (const p of paras) { if (seen.has(p)) dups.push(p.slice(0,60)); else seen.set(p,1); }
  const hero = norm((document.querySelector('.quran-hero-intro')||{}).innerText);
  const meta = norm((document.querySelector('meta[name="description"]')||{}).content);
  const guide = norm((document.getElementById('quran-home-guide')||{}).innerText||'');
  return JSON.stringify({dups, heroInGuide: hero && guide.includes(hero), metaInGuide: meta && guide.includes(meta),
    quranKareem: (guide.match(/القرآن الكريم/g)||[]).length, guideWords: guide.split(' ').filter(Boolean).length});
})()`));
ok(dup.dups.length === 0, `no paragraph repeated verbatim — ${dup.dups.join(' | ') || 'none'}`);
ok(!dup.heroInGuide, 'the hero sentence is not copied into the new section');
ok(!dup.metaInGuide, 'the meta description is not copied into the page body');
ok(dup.quranKareem <= 6, `«القرآن الكريم» appears ${dup.quranKareem}× in the new section — natural, not stuffed`);

/* QURAN-HOME-VISIBLE-CONTENT-TRUTH-AND-UX-COPY-FINAL-PASS-1 — claims the page is NOT allowed to make again.
   Each phrase below was on the page once and was removed because the code does not back it: there are no
   ayah-to-ayah controls, the narration's reach is unsourced, an absolute "nothing is sent" is stronger than
   a network capture can prove, and the reader is not owed the words «جافاسكربت» or a page-load mechanic.
   A regression that re-introduces any of them is a truth regression, so it fails here. */
console.log('\n--- truth guard: retired claims must not come back ---');
{
  const text = await ev(`document.getElementById('page-quran-home').textContent`);
  const banned = [
    ['التنقل بين الآيات', 'no ayah-to-ayah controls exist'],
    ['الأكثر انتشارًا', 'unsourced claim about the narration'],
    ['لا يُرسل شيء إلى الخادم', 'absolute privacy promise'],
    ['جافاسكربت', 'jargon in reader-facing copy'],
    ['تحميل الصفحة من جديد', 'page-load mechanics in reader-facing copy'],
  ];
  for (const [phrase, why] of banned) ok(!text.includes(phrase), `«${phrase}» absent — ${why}`);
}
// …and the two capabilities the copy DOES name must exist on a surah page.
{
  const html = await (await fetch(B + '/quran/al-baqarah')).text();
  ok(/id="quran-ayah-input"/.test(html) && /اذهب إلى آية/.test(html), 'the «اذهب إلى آية» field the copy promises exists');
  ok(/العودة إلى أوّل السورة/.test(html), 'the «العودة إلى أوّل السورة» control the copy promises exists');
  ok(!/data-quran-prev-ayah|data-quran-next-ayah/.test(html), 'still no ayah-to-ayah controls (the copy must keep not claiming them)');
}

console.log('\n--- §13 the page still functions ---');
ok(await ev(`!!document.querySelector('#quran-home-q')`), 'the search box is present');
{
  await ev(`(()=>{const i=document.getElementById('quran-home-q'); i.focus(); i.value='الكهف';
    i.dispatchEvent(new Event('input',{bubbles:true})); return 1})()`);
  await sleep(700);
  const n = await ev(`document.querySelectorAll('#quran-home-suggestions [role="option"]').length`);
  ok(n > 0, `live search still returns results for «الكهف» — ${n} suggestion(s)`);
  await ev(`(()=>{const i=document.getElementById('quran-home-q'); i.value=''; i.dispatchEvent(new Event('input',{bubbles:true})); return 1})()`);
}
{
  // last-read: seed the exact store js/quran.js writes — `quran.pos.last` = {n, ayah, path, t}. The card's
  // href is rebuilt by the page from the SSR index entry for `n`, never from the stored path, so a correct
  // href here also proves that resolution still works after the new section was inserted.
  await ev(`(()=>{try{localStorage.setItem('quran.pos.last', JSON.stringify({n:18,ayah:10,path:'/quran/al-kahf',t:1}))}catch(e){} return 1})()`);
  await go(B + '/quran');
  const lr = JSON.parse(await ev(`(()=>{const c=document.getElementById('quran-home-lastread');
    return JSON.stringify({shown: !!c && getComputedStyle(c).display!=='none',
      href: (c&&c.querySelector('a')||{}).getAttribute ? c.querySelector('a').getAttribute('href') : ''})})()`));
  ok(lr.shown && /^\/quran\/[a-z-]+#ayah-\d+$/.test(lr.href), `continue-reading card works — href = ${lr.href}`);
  await ev(`(()=>{try{localStorage.removeItem('quran.pos.last')}catch(e){} return 1})()`);
}
{
  await go(B + '/quran');
  await ev(`(()=>{document.querySelector('#page-quran-home a[href="/quran#quran-surah-index"]').click(); return 1})()`);
  await sleep(700);
  ok(await ev(`location.pathname+location.hash`) === '/quran#quran-surah-index', 'in-page hash link still resolves against /quran');
}

console.log('\n--- §13 no-JS ---');
await cdp.send('Emulation.setScriptExecutionDisabled', { value: true });
await go(B + '/quran');
{
  const d = JSON.parse(await ev(`(()=>JSON.stringify({
    guide: !!document.getElementById('quran-home-guide'),
    guideCards: document.querySelectorAll('#quran-home-guide .quran-home-guide-card').length,
    guideWords: (String((document.getElementById('quran-home-guide')||{}).innerText||'').match(/\\S+/g)||[]).length,
    cards: document.querySelectorAll('.quran-home-idx-card').length,
    juz: document.querySelectorAll('.quran-home-juz-card').length,
    pages: document.querySelectorAll('.page').length}))()`));
  ok(d.guide && d.guideCards === 3 && d.guideWords >= 330, `no-JS: the guidance section renders in full — ${d.guideWords} words, ${d.guideCards} cards`);
  ok(d.cards === 114 && d.juz === 30 && d.pages === 1, `no-JS: 114 cards, 30 juz, .page = ${d.pages}`);
}
await cdp.send('Emulation.setScriptExecutionDisabled', { value: false });

console.log('\n--- runtime cleanliness ---');
ok(errs.length === 0, `pageerror = ${errs.length}${errs.length ? ' :: ' + errs.slice(0, 2).join(' | ') : ''}`);
ok(cerr.length === 0, `console.error = ${cerr.length}${cerr.length ? ' :: ' + cerr.slice(0, 2).join(' | ') : ''}`);

try { chrome.kill(); } catch (e) { }
try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) { }
if (!BASELINE) console.log(`\nRESULT: ${P} passed, ${F} failed`);
process.exitCode = F ? 1 : 0;
