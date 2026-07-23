/* QURAN-AR-HOME-SEARCH-AUTOCOMPLETE-SUGGESTIONS-UX-FINAL-GATE-1 — the /quran search combobox.
   Drives a real Chrome over CDP: typing, clicking, arrows, Enter, Escape, Tab, the clear button, and the
   ARIA contract. Expectations come from the page's own SSR index (which itself comes from the source
   metadata), never from surah names typed into this file. */
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
class CDP { constructor(ws){ this.ws=ws; this.id=0; this.p=new Map(); this.h={};
  ws.addEventListener('message', ev=>{ const m=JSON.parse(ev.data);
    if(m.id&&this.p.has(m.id)){ const q=this.p.get(m.id); this.p.delete(m.id); m.error?q.reject(new Error(JSON.stringify(m.error))):q.resolve(m.result); }
    else if(m.method&&this.h[m.method]) this.h[m.method](m.params); }); }
  send(m,p={}){ const id=++this.id; return new Promise((res,rej)=>{ this.p.set(id,{resolve:res,reject:rej}); this.ws.send(JSON.stringify({id,method:m,params:p})); }); }
  on(m,f){ this.h[m]=f; } }

const PORT = 9419;
const UDD = path.join(os.tmpdir(), 'qcombo-' + Date.now());
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--incognito',
  '--disable-extensions', `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio:'ignore' });
let t=null;
for(let i=0;i<60;i++){ try{ const l=await(await fetch(`http://127.0.0.1:${PORT}/json`)).json(); t=l.find(x=>x.type==='page'); if(t?.webSocketDebuggerUrl)break; }catch(e){} await sleep(250); }
const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise((r,j)=>{ ws.addEventListener('open',r); ws.addEventListener('error',j); });
const cdp=new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
let loaded=false; cdp.on('Page.loadEventFired',()=>{loaded=true;});
let errs=[], cerr=[], net=[];
cdp.on('Runtime.exceptionThrown', p=>errs.push(String(p.exceptionDetails?.text)));
cdp.on('Runtime.consoleAPICalled', p=>{ if(p.type==='error') cerr.push((p.args||[]).map(a=>a.value||a.description||'').join(' ')); });
cdp.on('Network.requestWillBeSent', p=>net.push(p.request.url));
const ev = async e => (await cdp.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result.value;
const go = async u => { errs=[]; cerr=[]; loaded=false; await cdp.send('Page.navigate',{url:u});
  for(let i=0;i<200&&!loaded;i++) await sleep(100); await sleep(1600); };
let pass=0, fail=0;
const ok=(c,m)=>{ if(c){pass++;console.log('  PASS '+m);} else {fail++;console.log('  FAIL '+m);} };

// type by setting value + dispatching input — the component listens to `input`, like a real keystroke
const type = async q => { await ev(`(()=>{const i=document.querySelector('[data-quran-search]');i.focus();i.value=${JSON.stringify(q)};i.dispatchEvent(new Event('input',{bubbles:true}));})()`); await sleep(140); };
const key  = async k => { await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:k,code:k,windowsVirtualKeyCode:{ArrowDown:40,ArrowUp:38,Enter:13,Escape:27,Tab:9}[k]});
                          await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:k,windowsVirtualKeyCode:{ArrowDown:40,ArrowUp:38,Enter:13,Escape:27,Tab:9}[k]}); await sleep(160); };
const state = () => ev(`(()=>{const i=document.querySelector('[data-quran-search]'),l=document.querySelector('[data-quran-suggest]');
  const opts=[...l.querySelectorAll('[role="option"]:not([aria-disabled])')];
  return { openList: !l.hidden, expanded: i.getAttribute('aria-expanded'),
    n: opts.length, first: opts[0] ? opts[0].querySelector('.quran-home-suggest-name').textContent : null,
    firstHref: opts[0] ? opts[0].querySelector('a').getAttribute('href') : null,
    names: opts.map(o=>o.querySelector('.quran-home-suggest-name').textContent),
    activeId: i.getAttribute('aria-activedescendant'),
    selected: opts.findIndex(o=>o.getAttribute('aria-selected')==='true'),
    none: !!l.querySelector('.quran-home-suggest-none'),
    more: (l.querySelector('.quran-home-suggest-more')||{}).textContent || null,
    live: (document.querySelector('[data-quran-search-count]')||{}).textContent || '',
    clearHidden: document.querySelector('[data-quran-search-clear]').hidden,
    idxVisible: document.querySelectorAll('#page-quran-home .quran-home-idx-li:not([hidden])').length }})()`);

/* §0 — static: no two `var`s may share a name in boot()'s own scope.
   js/quran-home.js hosts three unrelated components in one function body, so `var` collisions are silent
   and expensive: the combobox originally declared `box`, `open` and `L10N`, all three of which the
   last-read card and the language modal re-declare further down. Nothing throws, nothing logs — the
   listbox simply stops re-opening and the announcements go blank. A parse-level check catches the next
   one at commit time instead of via a CDP session. */
console.log('--- §0 static: duplicate `var` names in the same scope ---');
{
  const src = fs.readFileSync('js/quran-home.js', 'utf8').split('\n');
  const seen = new Map(); let inBlock = false;
  src.forEach((line, idx) => {
    let t = line;                                        // strip comments: a `var X` inside prose is not a declaration
    if (inBlock) { if (t.includes('*/')) { t = t.split('*/')[1]; inBlock = false; } else return; }
    if (t.includes('/*')) { const [pre, rest] = t.split(/\/\*(.*)/s);
      if (rest && rest.includes('*/')) t = pre + rest.split('*/')[1]; else { t = pre; inBlock = true; } }
    t = t.split('//')[0];
    if (line.length - line.trimStart().length !== 4) return;   // 4 spaces == direct body of boot()
    const m = t.match(/^\s*var\s+(.+)/); if (!m) return;
    m[1].split(',').forEach(part => {
      const n = part.match(/^\s*([A-Za-z_$][\w$]*)/); if (!n) return;
      const prev = seen.get(n[1]);
      if (prev) ok(false, `\`var ${n[1]}\` re-declared at line ${idx + 1} (already at ${prev}) — same scope, silent overwrite`);
      else seen.set(n[1], idx + 1);
    });
  });
  ok(true, `scanned ${seen.size} top-scope declarations in js/quran-home.js`);
}

await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await go(B + '/quran');

console.log('\n--- §8 ARIA contract (before typing) ---');
const aria = await ev(`(()=>{const i=document.querySelector('[data-quran-search]'),l=document.querySelector('[data-quran-suggest]');
  return { role:i.getAttribute('role'), auto:i.getAttribute('aria-autocomplete'), exp:i.getAttribute('aria-expanded'),
           ctrl:i.getAttribute('aria-controls'), listRole:l.getAttribute('role'), listId:l.id,
           liveRole:(document.querySelector('[data-quran-search-count]')||{}).getAttribute('aria-live') }})()`);
ok(aria.role==='combobox', 'input role=combobox');
ok(aria.auto==='list', 'aria-autocomplete=list');
ok(aria.exp==='false', 'aria-expanded starts false');
ok(aria.ctrl===aria.listId && !!aria.listId, 'aria-controls points at the listbox id — ' + aria.ctrl);
ok(aria.listRole==='listbox', 'the suggestion container is role=listbox');
ok(aria.liveRole==='polite', 'a polite aria-live region exists for announcements');

console.log('\n--- §5 empty field ---');
let s = await state();
ok(!s.openList, 'empty field → list closed');
ok(!s.none, 'empty field shows no "no results" message');
ok(s.idxVisible === 114, 'the 114-card index stays complete and visible — got ' + s.idxVisible);
ok(s.clearHidden, 'clear button hidden while empty');

console.log('\n--- §1/§2 live results + ranking ---');
net.length = 0;
const CASES = [
  ['البقرة',   '2',  true],
  ['البق',     '2',  false],
  ['الأنبياء', '21', true],
  ['الانبياء', '21', true],
  ['Al-Anbiya','21', true],
  ['al-anbiya','21', true],
  ['21',       '21', true],
  ['٢١',       '21', true],
  ['يس',       '36', true],
  ['يسٓ',      '36', true],
  ['ص',        '38', true],
  ['ق',        '50', true],
  ['آل عمران', '3',  true],
];
for (const [q, wantNum, onlyOne] of CASES) {
  await type(q);
  const st = await state();
  const firstNum = await ev(`(()=>{const o=document.querySelector('[data-quran-suggest] [role="option"]:not([aria-disabled])');
    if(!o) return null; const h=o.querySelector('a').getAttribute('href');
    const li=[...document.querySelectorAll('#page-quran-home .quran-home-idx-li')].find(x=>x.querySelector('.quran-home-idx-card').getAttribute('href')===h);
    return li ? li.getAttribute('data-num') : null; })()`);
  ok(st.openList, `«${q}» → list opens`);
  ok(firstNum === wantNum, `«${q}» → first result is surah ${wantNum}` + (firstNum === wantNum ? '' : ' — got ' + firstNum));
  if (onlyOne) ok(st.n === 1, `«${q}» → exactly one result (exact match wins)` + (st.n === 1 ? '' : ' — got ' + st.n + ': ' + st.names.slice(0,4)));
}
const netTyped = net.filter(u => !/^data:|devtools/.test(u));
ok(netTyped.length === 0, '§10 ZERO network requests during all of that typing — got ' + netTyped.length);

console.log('\n--- §3 result cap ---');
await type('ال');
s = await state();
ok(s.n <= 8, 'at most 8 options rendered — got ' + s.n);
ok(!!s.more, 'an "showing best 8 of N" line appears when there are more — «' + (s.more || '') + '»');
ok(/٨/.test(s.more || ''), 'that line uses Arabic-Indic numerals');

console.log('\n--- §4 no results ---');
await type('زززز');
s = await state();
ok(s.openList, 'a query with no match still OPENS the list (never a silent field)');
ok(s.none, 'the list shows the "no match" message');
ok(s.n === 0, 'no selectable option is offered');
ok(s.idxVisible === 114, 'the index below is untouched — got ' + s.idxVisible);

console.log('\n--- §6 keyboard ---');
await type('ال');
await key('ArrowDown');
s = await state();
ok(s.selected === 0, 'ArrowDown highlights the first option — got index ' + s.selected);
ok(!!s.activeId, 'aria-activedescendant is set — ' + s.activeId);
ok(s.live.length > 0, 'the highlighted surah is announced — «' + s.live + '»');
await key('ArrowDown');
s = await state();
ok(s.selected === 1, 'ArrowDown moves to the next option');
await key('ArrowUp');
s = await state();
ok(s.selected === 0, 'ArrowUp moves back');
await key('Escape');
s = await state();
ok(!s.openList, 'Escape closes the list');
ok(await ev(`document.querySelector('[data-quran-search]').value`) === 'ال', 'Escape keeps the typed text');
await type('ال');
await key('Tab');
s = await state();
ok(!s.openList, 'Tab closes the list');

console.log('\n--- §12 Enter ---');
await type('ال');                       // many results, nothing highlighted
const before = await ev('location.pathname');
await key('Enter');
await sleep(500);
ok(await ev('location.pathname') === before, 'Enter with several results and no selection does NOT navigate');
s = await state();
ok(/عدة نتائج|[٠-٩]/.test(s.live), 'instead it tells the reader there are several — «' + s.live + '»');
await type('الأنبياء');                 // exactly one
await key('Enter');
await sleep(1200);
ok(await ev('location.pathname') === '/quran/al-anbiya', 'Enter with a single result opens it — got ' + await ev('location.pathname'));

console.log('\n--- §7/§13 click + real links ---');
await go(B + '/quran');
await type('البق');
const href = await ev(`document.querySelector('[data-quran-suggest] a').getAttribute('href')`);
const tag  = await ev(`document.querySelector('[data-quran-suggest] [role="option"] > *').tagName`);
ok(tag === 'A', 'each option wraps a real <a> (Ctrl+click / new tab / SPA all work) — got ' + tag);
ok(href === '/quran/al-baqarah', 'the link is the official slug path — got ' + href);
const box = await ev(`(()=>{const a=document.querySelector('[data-quran-suggest] a').getBoundingClientRect();return{h:a.height,w:a.width}})()`);
ok(box.h >= 44, 'the whole row is the tap target, ≥44px tall — got ' + Math.round(box.h));
await ev(`document.querySelector('[data-quran-suggest] a').click()`);
await sleep(1300);
ok(await ev('location.pathname') === '/quran/al-baqarah', 'clicking a result opens the surah — got ' + await ev('location.pathname'));

console.log('\n--- §7 outside click + re-open ---');
await go(B + '/quran');
await type('البق');
await ev(`document.querySelector('#quran-surah-index h2').click()`);
await sleep(200);
s = await state();
ok(!s.openList, 'clicking outside closes the list');
await ev(`document.querySelector('[data-quran-search]').click()`);
await sleep(220);
s = await state();
ok(s.openList, 'clicking back into the field re-opens the current results');

console.log('\n--- §5 clear button ---');
await ev(`document.querySelector('[data-quran-search-clear]').click()`);
await sleep(200);
s = await state();
ok(!s.openList, 'clear closes the list');
ok(await ev(`document.querySelector('[data-quran-search]').value`) === '', 'clear empties the field');
ok(await ev(`document.activeElement === document.querySelector('[data-quran-search]')`), 'focus returns to the search box');
ok(s.idxVisible === 114, 'the index is still complete after clearing');

console.log('\n--- §13 SPA re-entry: no duplicate handlers, no stale selection ---');
await go(B + '/quran');
await type('البق');
await ev(`document.querySelector('[data-quran-suggest] a').click()`);
await sleep(1300);
await go(B + '/quran');
await type('البق');
s = await state();
ok(s.openList && s.n === 1, 'search still works after returning from a surah — ' + s.n + ' result');
const dupLists = await ev(`document.querySelectorAll('#page-quran-home [data-quran-suggest]').length`);
ok(dupLists === 1, 'exactly ONE listbox in the DOM (no duplicate component) — got ' + dupLists);
ok(s.selected === -1, 'no stale keyboard selection carried over');

console.log('\n--- §9 mobile + dark ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await go(B + '/quran');
await type('الأنبياء');
const m = await ev(`(()=>{const l=document.querySelector('[data-quran-suggest]'),r=l.getBoundingClientRect();
  return { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth+1,
           insideViewport: r.left >= -1 && r.right <= innerWidth+1, maxH: r.height,
           z: getComputedStyle(l).zIndex, pos: getComputedStyle(l).position } })()`);
ok(!m.overflow, 'no horizontal overflow at 390 with the list open');
ok(m.insideViewport, 'the list stays inside the viewport');
ok(m.maxH <= 844 * 0.6, 'the list does not swallow the screen — ' + Math.round(m.maxH) + 'px');
ok(m.pos === 'absolute' && +m.z >= 10, 'the list floats above the sections below (position/z-index)');
await ev(`(typeof toggleTheme==='function')&&toggleTheme()`); await sleep(400);
await type('الأنبياء');
const dk = await ev(`(()=>{const l=document.querySelector('[data-quran-suggest]');const c=getComputedStyle(l);
  return { theme: document.documentElement.getAttribute('data-theme'), bg: c.backgroundColor, open: !l.hidden } })()`);
ok(dk.theme === 'dark' && dk.open, 'the list renders in dark mode');
ok(dk.bg !== 'rgba(0, 0, 0, 0)', 'the list has a solid background in dark mode — ' + dk.bg);

/* §14 — the listbox and the language modal must not share state.
   They live in the same function body and both once used a variable literally named `open`, so an open
   suggestion list silently blocked the language modal from ever opening (and vice-versa). Both directions
   are asserted here because a rename alone leaves no visible trace to regress against. */
console.log('\n--- §14 listbox state is independent of the language modal ---');
await go(B + '/quran');
await type('البق');
s = await state();
ok(s.openList, 'precondition: the suggestion list is open');
await ev(`(()=>{const it=document.querySelector('.lang-menu [data-lang="en"]');it.click();})()`);
await sleep(400);
const modalOpen = await ev(`(()=>{const m=document.querySelector('[data-quran-locale-modal]')||document.querySelector('.quran-locale-modal');
  return !!(m && m.classList.contains('is-open'));})()`);
ok(modalOpen, 'the language modal still opens while the suggestion list is open');
await ev(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));})()`);
await sleep(300);
await type('الفات');
s = await state();
ok(s.openList, 'and the suggestion list still opens after the modal has been used');

/* §15 — QURAN-AR-HOME-SEARCH-AUTOCOMPLETE-VISUAL-CORRECTIONS-FINAL-1.
   These assert COMPUTED PIXELS, not DOM properties. The previous pass checked `button.hidden` and passed
   while the button was plainly visible on screen, because a component rule was overriding the UA's
   [hidden]{display:none}. Anything a reader can see is measured here the way the reader sees it. */
console.log('\n--- §15a clear button: attribute AND pixels ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await go(B + '/quran');
const clr = () => ev(`(()=>{const c=document.querySelector('[data-quran-search-clear]');const cs=getComputedStyle(c);
  const r=c.getBoundingClientRect();
  return {display:cs.display, w:+r.width.toFixed(1), h:+r.height.toFixed(1), painted:r.width>0&&r.height>0}})()`);
let c0 = await clr();
ok(c0.display === 'none', `empty field → computed display is none — got ${c0.display}`);
ok(!c0.painted, 'empty field → the button paints nothing (0×0)');
await type('البق');
let c1 = await clr();
ok(c1.display !== 'none' && c1.painted, `typed text → the button is visible — display ${c1.display}`);
ok(c1.w >= 44 && c1.w <= 48 && c1.h >= 44 && c1.h <= 48, `clear button is 44–48px — got ${c1.w}×${c1.h}`);
await ev(`document.querySelector('[data-quran-search-clear]').click()`);
await sleep(250);
let c2 = await clr();
ok(c2.display === 'none', 'after clearing → hidden again by computed style');
ok(await ev(`document.querySelector('[data-quran-search]').value`) === '', 'after clearing → the field is empty');
ok(await ev(`document.activeElement === document.querySelector('[data-quran-search]')`), 'after clearing → focus is back in the field');
// Chrome paints its own ✕ inside input[type=search]; it must be suppressed so only one clear affordance exists
await type('البق');
/* getComputedStyle cannot see this one. Chrome returns the HOST element's styles for any unknown internal
   pseudo — proven by asking for ::-webkit-slider-thumb, which cannot apply to a search input and still
   reports display:block / width:1024px. So assert the rule is loaded and actually parsed instead, and let
   the focused screenshot carry the visual proof. */
const native = await ev(`(()=>{let rule=null;
  for(const ss of document.styleSheets){ try{ for(const r of ss.cssRules){
    if(r.cssText && r.cssText.indexOf('search-cancel-button')!==-1) rule=r.cssText; } }catch(e){} }
  const i=document.querySelector('[data-quran-search]');
  const bogus=getComputedStyle(i,'::-webkit-slider-thumb').display;   // control: proves the API is useless here
  return {rule, hidesIt: !!rule && /display:\\s*none/.test(rule), bogus}})()`);
ok(!!native.rule, 'a ::-webkit-search-cancel-button rule is loaded and parsed by the browser');
ok(native.hidesIt, `…and it sets display:none — ${String(native.rule).slice(0, 90)}`);
ok(native.bogus === 'block', 'control: getComputedStyle on an inapplicable pseudo also returns block — so pixel proof comes from the screenshot, not this API');
ok(await ev(`document.querySelectorAll('.quran-home-search-field button, .quran-home-search-field [role="button"]').length`) === 1,
   'exactly ONE clear control exists in the field');

console.log('\n--- §15b layout stability: the index must not move while typing ---');
await go(B + '/quran');
// Measure the index's ABSOLUTE offset from the top of the document (rect.top + scrollY), not its
// viewport-relative top. The suggestion listbox is position:absolute and must not reflow the page — that is
// the real invariant (CLS). Focusing the search input, however, legitimately scrolls it into view now that
// the stat + al-Kahf cards sit above it (QURAN-HOME-STATS-CARDS-AND-AL-KAHF-FRIDAY-FEATURE-1), and a browser
// scroll is NOT a layout shift. Adding scrollY cancels the scroll so the assertion measures reflow only.
const idxTop = () => ev(`(()=>{const c=document.querySelector('.quran-home-idx-li');return +(c.getBoundingClientRect().top + window.scrollY).toFixed(2)})()`);
const base = await idxTop();
await type('ال');                     const t1 = await idxTop();
ok(Math.abs(t1 - base) <= 1, `typing a query moves the index by ≤1px — moved ${(t1-base).toFixed(2)}px`);
await type('زززز');                   const t2 = await idxTop();
ok(Math.abs(t2 - base) <= 1, `a no-results query moves the index by ≤1px — moved ${(t2-base).toFixed(2)}px`);
await type('البق');                   const t3 = await idxTop();
ok(Math.abs(t3 - base) <= 1, `a single-result query moves the index by ≤1px — moved ${(t3-base).toFixed(2)}px`);
await ev(`document.querySelector('[data-quran-search-clear]').click()`); await sleep(250);
const t4 = await idxTop();
ok(Math.abs(t4 - base) <= 1, `clearing moves the index by ≤1px — moved ${(t4-base).toFixed(2)}px`);
// the live region still has to exist and still be announced — clipped, not removed
const live = await ev(`(()=>{const c=document.querySelector('[data-quran-search-count]');const cs=getComputedStyle(c);
  return {inDom:!!c, display:cs.display, visibility:cs.visibility, ariaLive:c.getAttribute('aria-live'),
          w:+c.getBoundingClientRect().width.toFixed(1)}})()`);
ok(live.inDom, 'the live region is still in the DOM');
ok(live.display !== 'none' && live.visibility !== 'hidden',
   `the live region is clipped, not display:none / visibility:hidden — ${live.display}/${live.visibility}`);
ok(live.ariaLive === 'polite' || live.ariaLive === 'assertive', `the live region still announces — aria-live=${live.ariaLive}`);
ok(live.w <= 2, `the live region occupies no visual width — ${live.w}px`);

console.log('\n--- §15c mobile: compact rows in a scrollable list ---');
for (const [vw, vh] of [[390, 844], [360, 800]]) {
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:vw,height:vh,deviceScaleFactor:1,mobile:true});
  await go(B + '/quran');
  // Scroll the field into view first — that is the only state in which a reader ever sees this list, and
  // measuring "does it fit the viewport" from the top of a long page would test nothing real.
  await ev(`document.querySelector('[data-quran-combobox]').scrollIntoView({block:'center'})`);
  await sleep(350);
  await type('ال');
  const m = await ev(`(()=>{const l=document.querySelector('[data-quran-suggest]');const cs=getComputedStyle(l);
    const r=l.getBoundingClientRect();
    const rows=[...l.querySelectorAll('[role="option"]')];
    const h=rows.length?+rows[0].getBoundingClientRect().height.toFixed(1):null;
    const badge=l.querySelector('.quran-home-suggest-num');
    const br=badge?badge.getBoundingClientRect():null;
    return {maxH:cs.maxHeight, overflowY:cs.overflowY, overscroll:cs.overscrollBehaviorY,
      boxH:+r.height.toFixed(1), scrollH:+l.scrollHeight.toFixed(1), rowH:h, rows:rows.length,
      badge: br?+br.height.toFixed(1):null,
      docOverflow: document.documentElement.scrollWidth-document.documentElement.clientWidth,
      fitsViewport: r.bottom <= window.innerHeight + .5}})()`);
  ok(m.overflowY === 'auto', `${vw}px: overflow-y is auto — ${m.overflowY}`);
  ok(m.maxH !== 'none', `${vw}px: a max-height is applied — ${m.maxH}`);
  ok(m.rowH >= 58 && m.rowH <= 64, `${vw}px: row height is 58–64px — got ${m.rowH}`);
  ok(m.rowH >= 44, `${vw}px: the row is still a ≥44px touch target — ${m.rowH}`);
  ok(m.badge >= 44 && m.badge <= 50, `${vw}px: the number badge is 44–50px — got ${m.badge}`);
  ok(m.scrollH > m.boxH, `${vw}px: the list actually scrolls (content ${m.scrollH} > box ${m.boxH})`);
  const visibleRows = m.boxH / m.rowH;
  ok(visibleRows >= 4.2 && visibleRows <= 4.9, `${vw}px: about 4 rows read in full and the next peeks — ${visibleRows.toFixed(2)} rows`);
  ok(m.docOverflow === 0, `${vw}px: no horizontal overflow — ${m.docOverflow}`);
  ok(m.fitsViewport, `${vw}px: the list ends inside the viewport`);
  // the 8th result must be reachable, and arrowing to it must not scroll the PAGE
  const pageY0 = await ev('window.scrollY');
  for (let i = 0; i < 8; i++) await key('ArrowDown');
  const after = await ev(`(()=>{const l=document.querySelector('[data-quran-suggest]');
    const sel=l.querySelector('[aria-selected="true"]'); const lr=l.getBoundingClientRect();
    const sr=sel?sel.getBoundingClientRect():null;
    return {selName: sel?sel.querySelector('.quran-home-suggest-name').textContent:null,
      inside: sr ? (sr.top >= lr.top - 1 && sr.bottom <= lr.bottom + 1) : false,
      listScrolled: l.scrollTop > 0, pageY: window.scrollY}})()`);
  ok(!!after.selName, `${vw}px: the 8th result is reachable by keyboard — «${after.selName}»`);
  ok(after.inside, `${vw}px: the selected row is kept inside the list viewport`);
  ok(after.listScrolled, `${vw}px: the LIST scrolled to reveal it (scrollTop > 0)`);
  ok(after.pageY === pageY0, `${vw}px: the PAGE did not scroll — ${pageY0} → ${after.pageY}`);
}

console.log('\n--- §15d dark mode: the selected row must be unmistakable ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]});
await go(B + '/quran');
await type('ال'); await key('ArrowDown');
const dkSel = await ev(`(()=>{
  const lum=c=>{const [r,g,b]=c.match(/\\d+(\\.\\d+)?/g).slice(0,3).map(Number).map(v=>{v/=255;
    return v<=.03928? v/12.92 : Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b};
  const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
  const l=document.querySelector('[data-quran-suggest]');
  const sel=l.querySelector('[aria-selected="true"] .quran-home-suggest-link');
  const other=l.querySelector('[aria-selected="false"] .quran-home-suggest-link');
  const paint=el=>{ // walk up for the first non-transparent background
    let n=el; while(n){const bg=getComputedStyle(n).backgroundColor;
      if(bg && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(bg)) return bg; n=n.parentElement;} return 'rgb(255,255,255)'};
  const selBg=getComputedStyle(sel).backgroundColor, selBgUsed=/rgba\\(0, 0, 0, 0\\)/.test(selBg)?paint(sel):selBg;
  const othBg=paint(other);
  const name=sel.querySelector('.quran-home-suggest-name'), meta=sel.querySelector('.quran-home-suggest-meta');
  const num=sel.querySelector('.quran-home-suggest-num');
  return {selBg:selBgUsed, othBg,
    nameContrast:+ratio(getComputedStyle(name).color, selBgUsed).toFixed(2),
    metaContrast:+ratio(getComputedStyle(meta).color, selBgUsed).toFixed(2),
    numContrast:+ratio(getComputedStyle(num).color, paint(num)).toFixed(2),
    selVsOther:+ratio(selBgUsed, othBg).toFixed(2),
    outline:getComputedStyle(sel).outlineColor, outlineW:getComputedStyle(sel).outlineWidth}})()`);
ok(dkSel.nameContrast >= 4.5, `dark: surah name on the selected row ≥4.5:1 — ${dkSel.nameContrast}:1`);
ok(dkSel.metaContrast >= 4.5, `dark: ayah count on the selected row ≥4.5:1 — ${dkSel.metaContrast}:1`);
ok(dkSel.numContrast >= 4.5, `dark: number badge ≥4.5:1 — ${dkSel.numContrast}:1`);
ok(dkSel.selVsOther >= 1.25, `dark: the selected row's surface differs clearly from the others — ${dkSel.selVsOther}:1`);
ok(parseFloat(dkSel.outlineW) >= 2, `dark: the selected row carries a ≥2px outline — ${dkSel.outlineW}`);
await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});

console.log('\n--- runtime cleanliness ---');
ok(errs.length === 0, 'pageerror = 0' + (errs.length ? ': ' + errs.slice(0,2) : ''));
ok(cerr.length === 0, 'console.error = 0' + (cerr.length ? ': ' + cerr.slice(0,2) : ''));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
try{ chrome.kill(); }catch(e){}
try{ fs.rmSync(UDD,{recursive:true,force:true}); }catch(e){}
process.exit(fail ? 1 : 0);
