/* QURAN-AR-SURAH-TO-HOME-NAVIGATION-AND-BREADCRUMB-FIX-1
   Proves the 114 surah pages link back to /quran the way a reader and a crawler both need:
   a real <a> in the breadcrumb, a real <a> CTA to the home index anchor, and a matching 3-rung
   BreadcrumbList. Part 1 is a pure HTTP sweep over all 114; part 2 drives Chrome for the runtime
   behaviours (click, Ctrl+Click, back/forward, drawer, scroll offset, no-JS). */
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const ROUTES = JSON.parse(fs.readFileSync('data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json', 'utf8')).surahs;
const CHAPTERS = JSON.parse(fs.readFileSync('data/quran/tanzil-uthmani-1-1/metadata/chapters.json', 'utf8'));
const chByNum = new Map((Array.isArray(CHAPTERS) ? CHAPTERS : CHAPTERS.chapters).map(c => [c.number, c]));
// mirrors server.js _quranCleanName — display names only, never the ayah text
const clean = s => String(s || '').replace(/[ً-ٰٓـ]/g, '');

// isolate the surah page block so shell markup from other .page blocks can never be counted
function pageBlock(html, id) {
  const i = html.indexOf(`id="${id}"`); if (i < 0) return '';
  const start = html.lastIndexOf('<div', i);
  let d = 0;
  const re = /<div\b|<\/div>/g; re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) { d += m[0].startsWith('<div') ? 1 : -1; if (d === 0) return html.slice(start, m.index + m[0].length); }
  return html.slice(start);
}
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
  .map(m => { try { return JSON.parse(m[1]); } catch { return null; } }).filter(Boolean);

console.log('--- §1 sweep: all 114 surah pages, visible breadcrumb + CTA + BreadcrumbList ---');
let bcOk = 0, bcLdOk = 0, homeLinkOk = 0, anchorLinkOk = 0, ctaAnchorOk = 0, noBadHref = 0, currentOk = 0, orderOk = 0;
const problems = [];
for (const rec of ROUTES) {
  const url = B + rec.path;
  const html = await (await fetch(url)).text();
  const page = pageBlock(html, 'page-quran-surah');
  const name = 'سورة ' + clean(chByNum.get(rec.number).nameAr);

  const bc = (page.match(/<nav[^>]*breadcrumb[\s\S]*?<\/nav>/i) || [''])[0];
  const hasHome    = /<a class="bc-link" href="\/">الرئيسية<\/a>/.test(bc);
  const hasQuran   = /<a class="bc-link" href="\/quran">القرآن الكريم<\/a>/.test(bc);
  const hasCurrent = bc.includes(`<span aria-current="page">${name}</span>`);
  // the current rung must NOT link to itself
  const selfLink   = new RegExp(`<a[^>]*href="${rec.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>${name}`).test(bc);
  if (hasHome && hasQuran && hasCurrent && !selfLink) bcOk++; else problems.push(`${rec.path}: breadcrumb home=${hasHome} quran=${hasQuran} current=${hasCurrent} selfLink=${selfLink}`);
  if (hasCurrent && !selfLink) currentOk++;
  // rung order: الرئيسية before القرآن الكريم before the surah name
  if (bc.indexOf('الرئيسية') < bc.indexOf('القرآن الكريم') && bc.indexOf('القرآن الكريم') < bc.indexOf(name)) orderOk++;

  if ((page.match(/href="\/quran"/g) || []).length >= 1) homeLinkOk++;
  const anchors = (page.match(/href="\/quran#quran-surah-index"/g) || []).length;
  if (anchors >= 1) anchorLinkOk++;
  // every browse CTA must be an <a>, never a <button>
  if ((page.match(/<a [^>]*quran-browse-cta/g) || []).length >= 1 && !/\<button[^>]*quran-browse-cta/.test(page)) ctaAnchorOk++;
  if (!/href="#"/.test(page) && !/javascript:void/.test(page)) noBadHref++;

  const bl = jsonLd(html).find(d => d['@type'] === 'BreadcrumbList');
  const el = bl && bl.itemListElement;
  const good = !!el && el.length === 3
    && el[0].position === 1 && el[1].position === 2 && el[2].position === 3
    && /\/quran$/.test(el[1].item)
    && el[2].item.endsWith(rec.path)
    && el[1].name === 'القرآن الكريم' && el[2].name === name
    && !/\/quran\/surah\//.test(el[2].item) && !/\/quran\/\d+$/.test(el[2].item);
  if (good) bcLdOk++; else problems.push(`${rec.path}: BreadcrumbList ${el ? JSON.stringify(el.map(x => x.item)) : 'MISSING'}`);
}
ok(bcOk === 114, `114/114 visible breadcrumbs are correct — ${bcOk}`);
ok(currentOk === 114, `114/114 current rungs are non-linking — ${currentOk}`);
ok(orderOk === 114, `114/114 rung orders are الرئيسية ← القرآن الكريم ← سورة … — ${orderOk}`);
ok(homeLinkOk === 114, `114/114 pages carry at least one crawlable href="/quran" — ${homeLinkOk}`);
ok(anchorLinkOk === 114, `114/114 pages carry href="/quran#quran-surah-index" — ${anchorLinkOk}`);
ok(ctaAnchorOk === 114, `114/114 browse CTAs are <a>, none is a <button> — ${ctaAnchorOk}`);
ok(noBadHref === 114, `114/114 pages free of href="#" and javascript:void — ${noBadHref}`);
ok(bcLdOk === 114, `114/114 BreadcrumbList blocks are valid 3-rung — ${bcLdOk}`);
if (problems.length) console.log('   first problems:\n' + problems.slice(0, 5).map(p => '     ' + p).join('\n'));

console.log('\n--- §2 the home index anchor ---');
{
  const html = await (await fetch(B + '/quran')).text();
  const idCount = (html.match(/id="quran-surah-index"/g) || []).length;
  ok(idCount === 1, `#quran-surah-index exists exactly once on /quran — ${idCount}`);
  const home = pageBlock(html, 'page-quran-home');
  ok(/id="quran-surah-index"[^>]*>[\s\S]{0,400}?فهرس سور القرآن الكريم/.test(home),
     'the anchor sits on the section that holds the index heading');
  ok((html.match(/id="quran-home-index"/g) || []).length === 0, 'the old id is gone (no stale duplicate anchor)');
}

/* ---------- part 2: runtime ---------- */
const PORT = 9451, UDD = path.join(os.tmpdir(), 'qnav-' + Date.now());
class CDP { constructor(ws){ this.ws=ws; this.id=0; this.p=new Map(); this.h={};
  ws.addEventListener('message', ev=>{ const m=JSON.parse(ev.data);
    if(m.id&&this.p.has(m.id)){ const q=this.p.get(m.id); this.p.delete(m.id); m.error?q.reject(new Error(JSON.stringify(m.error))):q.resolve(m.result); }
    else if(m.method&&this.h[m.method]) this.h[m.method](m.params); }); }
  send(m,p={}){ const id=++this.id; return new Promise((res,rej)=>{ this.p.set(id,{resolve:res,reject:rej}); this.ws.send(JSON.stringify({id,method:m,params:p})); }); }
  on(m,f){ this.h[m]=f; } }
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--hide-scrollbars','--no-first-run','--incognito',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio:'ignore' });
let t=null;
for(let i=0;i<60;i++){ try{ const l=await(await fetch(`http://127.0.0.1:${PORT}/json`)).json(); t=l.find(x=>x.type==='page'); if(t?.webSocketDebuggerUrl)break; }catch(e){} await sleep(250); }
const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise((r,j)=>{ ws.addEventListener('open',r); ws.addEventListener('error',j); });
const cdp=new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
let loaded=false, errs=[], cerr=[];
cdp.on('Page.loadEventFired',()=>{loaded=true;});
cdp.on('Runtime.exceptionThrown', p=>errs.push(String(p.exceptionDetails?.text)));
cdp.on('Runtime.consoleAPICalled', p=>{ if(p.type==='error') cerr.push((p.args||[]).map(a=>a.value||'').join(' ')); });
const ev = async e => (await cdp.send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result.value;
// wait up to 5s for the load event (the flat Quran page renders in well under 1s; the old 20s cap × ~9 navs
// pushed the whole run past the suite timeout without changing any assertion — the content is present after
// navigate + settle regardless of when loadEventFired arrives).
const go = async u => { loaded=false; await cdp.send('Page.navigate',{url:u}); for(let i=0;i<50&&!loaded;i++) await sleep(100); await sleep(1200); };
const key = async k => { const vk = {Escape:27, Tab:9, Enter:13}[k];
  await cdp.send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:k,code:k,windowsVirtualKeyCode:vk});
  await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:k,windowsVirtualKeyCode:vk}); await sleep(200); };

console.log('\n--- §3 runtime: breadcrumb click, CTA click, back/forward ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await go(B + '/quran/al-baqarah');
await ev(`document.querySelector('#page-quran-surah .bc-link[href="/quran"]').click()`);
await sleep(1500);
ok(await ev('location.pathname') === '/quran', 'breadcrumb «القرآن الكريم» navigates to /quran — ' + await ev('location.pathname'));

await go(B + '/quran/al-anbiya');
await ev(`document.querySelector('#page-quran-surah a.quran-browse-cta').click()`);
await sleep(1500);
ok(await ev('location.pathname + location.hash') === '/quran#quran-surah-index',
   'the CTA lands on /quran#quran-surah-index — ' + await ev('location.pathname + location.hash'));
await ev('history.back()'); await sleep(1600);
ok(await ev('location.pathname') === '/quran/al-anbiya', 'Back returns to سورة الأنبياء — ' + await ev('location.pathname'));
await ev('history.forward()'); await sleep(1600);
ok(await ev('location.pathname + location.hash') === '/quran#quran-surah-index',
   'Forward returns to the index anchor — ' + await ev('location.pathname + location.hash'));

console.log('\n--- §4 scroll position: the index heading must clear the header ---');
for (const [w, h, label] of [[1440,900,'desktop'], [768,1024,'tablet'], [390,844,'mobile']]) {
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<500});
  await go(B + '/quran#quran-surah-index');
  const m = await ev(`(()=>{const s=document.getElementById('quran-surah-index');
    const hd=document.querySelector('.top-header'); const r=s.getBoundingClientRect();
    const hb=hd?hd.getBoundingClientRect():null; const cs=getComputedStyle(hd||document.body);
    const heading=s.querySelector('h2').getBoundingClientRect();
    return {top:+r.top.toFixed(1), headingTop:+heading.toFixed?0:+heading.top.toFixed(1),
      headerBottom: hb? +hb.bottom.toFixed(1):0, headerFixed: hd? (cs.position==='fixed'||cs.position==='sticky'):false,
      scrollMargin:getComputedStyle(s).scrollMarginTop, inView: heading.top>=0 && heading.top<window.innerHeight}})()`);
  ok(m.scrollMargin !== '0px', `${label}: scroll-margin-top is applied — ${m.scrollMargin}`);
  ok(m.headingTop >= (m.headerFixed ? m.headerBottom - 1 : -1),
     `${label}: the index heading is not hidden behind the header — heading ${m.headingTop} vs header bottom ${m.headerBottom}`);
  ok(m.inView, `${label}: the index heading is inside the viewport after the jump`);
}

console.log('\n--- §5 the drawer still opens, from its own button ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await go(B + '/quran/al-baqarah');
const pick = await ev(`(()=>{const b=document.querySelector('#page-quran-surah .quran-pick-surah-btn');
  return b? {text:b.textContent.trim(), tag:b.tagName, haspopup:b.getAttribute('aria-haspopup')} : null})()`);
ok(!!pick && pick.tag === 'BUTTON', 'the drawer trigger is a <button>, not a link');
ok(!!pick && pick.text.includes('اختيار سورة'), `its label says what it does — «${pick && pick.text}»`);
await ev(`document.querySelector('#page-quran-surah .quran-pick-surah-btn').click()`);
await sleep(600);
ok(await ev(`(()=>{const m=document.getElementById('quran-index');return m && m.getAttribute('aria-hidden')==='false'})()`),
   'clicking it opens the surah drawer');
ok(await ev('location.pathname') === '/quran/al-baqarah', 'and it does NOT navigate away');

console.log('\n--- §6 no-JS: the links still work as plain HTML ---');
await cdp.send('Emulation.setScriptExecutionDisabled', { value: true });
await go(B + '/quran/ya-sin');
const nojs = await ev(`1`);   // returns undefined while scripting is off — read the DOM over CDP instead
const doc = await (await fetch(B + '/quran/ya-sin')).text();
const yb = pageBlock(doc, 'page-quran-surah');
ok(/<a class="bc-link" href="\/quran">/.test(yb), 'no-JS: the breadcrumb link is present in the served HTML');
ok(/<a [^>]*quran-browse-cta[^>]*href="\/quran#quran-surah-index"/.test(yb) ||
   /<a [^>]*href="\/quran#quran-surah-index"[^>]*quran-browse-cta/.test(yb),
   'no-JS: the CTA is an anchor with a real href in the served HTML');
await cdp.send('Emulation.setScriptExecutionDisabled', { value: false });

console.log('\n--- §8 the approved literals, exactly ---');
await go(B + '/quran/al-baqarah');
const lit = await ev(`(()=>{const p=document.getElementById('page-quran-surah');
  const ctas=[...p.querySelectorAll('.quran-browse-cta')];
  const pick=p.querySelector('.quran-pick-surah-btn');
  return {
    ctaTitles: ctas.map(c=>c.querySelector('.quran-cta-title').textContent.trim()),
    ctaAria:   ctas.map(c=>c.getAttribute('aria-label')),
    ctaHrefs:  ctas.map(c=>c.getAttribute('href')),
    pickText:  pick? pick.textContent.trim() : null,
    pickHasHref: pick? pick.hasAttribute('href') : null,
    pickHasQuranLink: pick? /\\/quran/.test(pick.outerHTML.replace(/aria-[^=]*="[^"]*"/g,'')) : null }})()`);
ok(lit.ctaTitles.every(t => t === 'تصفح سور القرآن'),
   `every CTA title is exactly «تصفح سور القرآن» — ${JSON.stringify(lit.ctaTitles)}`);
ok(lit.ctaAria.every(a => a === 'الانتقال إلى فهرس سور القرآن الكريم'),
   'every CTA carries the approved aria-label');
ok(lit.ctaHrefs.every(h => h === '/quran#quran-surah-index'), 'every CTA href is the home-index anchor');
ok(lit.pickText === 'اختيار سورة', `the drawer button reads exactly «اختيار سورة» — «${lit.pickText}»`);
ok(lit.pickHasHref === false, 'the drawer button has NO href');
ok(lit.pickHasQuranLink === false, 'the drawer button carries no /quran link of any kind');
// the same words must never mean two things
ok(lit.ctaTitles.length === 2 && new Set(lit.ctaTitles).size === 1,
   'both CTAs use one and the same label — one text, one behaviour');

console.log('\n--- §9 Ctrl+Click / new tab / refresh ---');
{
  const before = await ev('history.length');
  // ctrl+click must NOT navigate the current tab (the browser opens a background tab instead)
  await ev(`(()=>{const a=document.querySelector('#page-quran-surah a.quran-browse-cta');
    a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true}));})()`);
  await sleep(700);
  ok(await ev('location.pathname') === '/quran/al-baqarah',
     'Ctrl+Click leaves the current tab on the surah — ' + await ev('location.pathname'));
  ok(await ev('history.length') === before, 'Ctrl+Click adds no history entry to this tab');
  const tgt = await ev(`document.querySelector('#page-quran-surah a.quran-browse-cta').getAttribute('target')`);
  ok(tgt === null, 'the CTA has no target="_blank" (opening a new tab stays the reader\'s choice)');
  const rel = await ev(`document.querySelector('#page-quran-surah a.quran-browse-cta').getAttribute('rel')`);
  ok(rel === null || !/nofollow/.test(rel), 'the CTA carries no nofollow');
}
await go(B + '/quran#quran-surah-index');
ok(await ev('location.hash') === '#quran-surah-index', 'a direct load of the anchored URL keeps the hash');
await cdp.send('Page.reload'); await sleep(1600);
ok(await ev('location.pathname + location.hash') === '/quran#quran-surah-index',
   'Refresh preserves the anchored URL — ' + await ev('location.pathname + location.hash'));

console.log('\n--- §10 drawer: Escape, focus trap, single handler, and picking a surah ---');
await go(B + '/quran/al-baqarah');
{
  await ev(`document.querySelector('#page-quran-surah .quran-pick-surah-btn').click()`);
  await sleep(500);
  ok(await ev(`document.getElementById('quran-index').getAttribute('aria-hidden')==='false'`), 'drawer opens');
  // focus must be inside the dialog, and Tab must not escape it
  const trap = await ev(`(()=>{const m=document.getElementById('quran-index');
    const inside = m.contains(document.activeElement);
    const f=[...m.querySelectorAll('a[href],button,input,[tabindex]:not([tabindex="-1"])')].filter(e=>e.offsetParent!==null);
    return {inside, focusables:f.length, modalRole:m.getAttribute('role'), aModal:m.getAttribute('aria-modal')}})()`);
  ok(trap.inside, 'focus moves inside the dialog on open');
  ok(trap.modalRole === 'dialog' && trap.aModal === 'true', 'the dialog is role=dialog + aria-modal=true (focus trap contract)');
  ok(trap.focusables > 0, `the dialog holds focusable controls — ${trap.focusables}`);
  await key('Escape'); await sleep(400);
  ok(await ev(`document.getElementById('quran-index').getAttribute('aria-hidden')==='true'`), 'Escape closes the drawer');
  ok(await ev(`document.activeElement === document.querySelector('#page-quran-surah .quran-pick-surah-btn')`),
     'focus returns to the drawer button');
  // one handler, not two: open/close twice and confirm the state still toggles cleanly
  await ev(`document.querySelector('#page-quran-surah .quran-pick-surah-btn').click()`); await sleep(350);
  const openA = await ev(`document.getElementById('quran-index').getAttribute('aria-hidden')`);
  await key('Escape'); await sleep(300);
  await ev(`document.querySelector('#page-quran-surah .quran-pick-surah-btn').click()`); await sleep(350);
  const openB = await ev(`document.getElementById('quran-index').getAttribute('aria-hidden')`);
  ok(openA === 'false' && openB === 'false', 'repeated open/close stays consistent (no duplicated handler flipping it back)');
  // pick a different surah from inside the drawer → real route + real content
  const target = await ev(`(()=>{const m=document.getElementById('quran-index');
    const a=[...m.querySelectorAll('a[href^="/quran/"]')].find(x=>x.getAttribute('href')!=='/quran/al-baqarah');
    return a? a.getAttribute('href') : null})()`);
  ok(!!target, 'the drawer lists other surahs as real links — ' + target);
  await ev(`(()=>{const m=document.getElementById('quran-index');
    [...m.querySelectorAll('a[href^="/quran/"]')].find(x=>x.getAttribute('href')!=='/quran/al-baqarah').click()})()`);
  await sleep(1700);
  ok(await ev('location.pathname') === target, `picking a surah routes to it — ${await ev('location.pathname')}`);
  const content = await ev(`(()=>{const p=document.getElementById('page-quran-surah');
    return {h1:!!p.querySelector('#quran-surah-h1'), ayat:p.querySelectorAll('.quran-ayah').length,
            bc:!!p.querySelector('.bc-link[href="/quran"]')}})()`);
  ok(content.h1 && content.ayat > 0, `…and renders that surah's content — ${content.ayat} ayah node(s)`);
  ok(content.bc, '…with its breadcrumb link intact');
}

console.log('\n--- §11 the full journey, repeated on mobile (390) ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await go(B + '/quran');
await ev(`document.querySelector('#page-quran-home a.quran-home-idx-card[href="/quran/al-baqarah"]').click()`);
await sleep(1700);
ok(await ev('location.pathname') === '/quran/al-baqarah', 'mobile: opening البقرة from the index');
await ev(`document.querySelector('#page-quran-surah .bc-link[href="/quran"]').click()`); await sleep(1600);
ok(await ev('location.pathname') === '/quran', 'mobile: breadcrumb returns to /quran');
await go(B + '/quran/al-anbiya');
await ev(`document.querySelector('#page-quran-surah a.quran-browse-cta').click()`); await sleep(1600);
ok(await ev('location.pathname + location.hash') === '/quran#quran-surah-index', 'mobile: CTA reaches the index anchor');
await ev('history.back()'); await sleep(1700);
ok(await ev('location.pathname') === '/quran/al-anbiya', 'mobile: Back returns to الأنبياء');
await ev('history.forward()'); await sleep(1700);
ok(await ev('location.pathname + location.hash') === '/quran#quran-surah-index', 'mobile: Forward returns to the anchor');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});

/* §12 — QURAN-AR-SURAH-SOURCE-TRUST-INPAGE-LINK-FIX-1.
   The source/trust link used to be href="#quran-source". The shell ships <base href="/">, and per the HTML
   spec a bare fragment resolves against the BASE url, not the current document — so clicking it navigated to
   "/#quran-source": the home page, with the target gone. The fix is to carry the surah's own path before the
   fragment (the /quran page already used that form). Asserted here on all 114 and at runtime. */
console.log('\n--- §12 source/trust anchor: SSR sweep over all 114 ---');
{
  let idOnce = 0, linkOk = 0, textOk = 0, noBare = 0, noHomeTarget = 0, noButton = 0;
  const bad = [];
  for (const rec of ROUTES) {
    const html = await (await fetch(B + rec.path)).text();
    const page = pageBlock(html, 'page-quran-surah');
    if ((page.match(/id="quran-source-trust"/g) || []).length === 1) idOnce++; else bad.push(rec.path + ': id count');
    const want = `href="${rec.path}#quran-source-trust"`;
    const hits = (page.match(new RegExp(want.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (hits >= 1) linkOk++; else bad.push(`${rec.path}: no ${want}`);
    // the visible label must still be the approved one, on a real anchor
    if (new RegExp(`<a[^>]*${rec.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}#quran-source-trust"[^>]*>\\s*مصدر النص وموثوقيته`).test(page)) textOk++;
    // and no source link may be bare-hash, home, or a button
    if (!/href="#quran-source/.test(page)) noBare++;
    if (!/<a[^>]*href="\/"[^>]*>\s*مصدر/.test(page) && !/<a[^>]*href="\/quran"[^>]*>\s*مصدر/.test(page)) noHomeTarget++;
    if (!/<button[^>]*>\s*مصدر النص وموثوقيته/.test(page)) noButton++;
  }
  ok(idOnce === 114, `114/114 pages carry id="quran-source-trust" exactly once — ${idOnce}`);
  ok(linkOk === 114, `114/114 pages link to {own-path}#quran-source-trust — ${linkOk}`);
  ok(textOk === 114, `114/114 links read «مصدر النص وموثوقيته» on a real <a> — ${textOk}`);
  ok(noBare === 114, `114/114 free of the bare href="#quran-source…" form — ${noBare}`);
  ok(noHomeTarget === 114, `114/114 have no source link pointing at / or /quran — ${noHomeTarget}`);
  ok(noButton === 114, `114/114 use no <button> for the source jump — ${noButton}`);
  if (bad.length) console.log('   first problems: ' + bad.slice(0, 3).join(' | '));
  // the id must not leak onto /quran
  const home = await (await fetch(B + '/quran')).text();
  ok((home.match(/id="quran-source-trust"/g) || []).length === 0, 'the id does not appear on /quran');
}

console.log('\n--- §13 source anchor: click, hash, scroll position ---');
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await go(B + '/quran/al-baqarah');
await ev(`(()=>{const a=[...document.querySelectorAll('#page-quran-surah a')].find(x=>x.textContent.trim()==='مصدر النص وموثوقيته');a.click()})()`);
await sleep(1400);
ok(await ev('location.pathname') === '/quran/al-baqarah',
   'clicking keeps the surah route — ' + await ev('location.pathname'));
ok(await ev('location.hash') === '#quran-source-trust',
   'and adds only the fragment — ' + await ev('location.hash'));
const srcPos = () => ev(`(()=>{const s=document.getElementById('quran-source-trust');
  if(!s) return null;
  const head=s.querySelector('h2').getBoundingClientRect();
  const h=document.querySelector('.top-header'); const hb=h?h.getBoundingClientRect():null;
  const bar=[...document.querySelectorAll('#page-quran-surah *')].find(e=>{const c=getComputedStyle(e);
    return (c.position==='sticky'||c.position==='fixed') && e.getBoundingClientRect().height>0 && e.getBoundingClientRect().top<200;});
  const br=bar?bar.getBoundingClientRect():null;
  const blocker = Math.max(hb?hb.bottom:0, br?br.bottom:0);
  return {headingTop:+head.top.toFixed(1), headerBottom:hb?+hb.bottom.toFixed(1):0,
    stickyBottom: br?+br.bottom.toFixed(1):0, stickyClass: bar?String(bar.className).slice(0,40):null,
    scrollMargin:getComputedStyle(s).scrollMarginTop, clear:+(head.top-blocker).toFixed(1),
    visible: head.top >= blocker - 1 && head.top < window.innerHeight}})()`);
let sp = await srcPos();
ok(!!sp, 'the target section exists after the jump');
ok(sp.scrollMargin !== '0px', `scroll-margin-top applied — ${sp.scrollMargin}`);
ok(sp.visible, `the heading clears the header (${sp.headerBottom}) and the sticky bar (${sp.stickyBottom}) — clearance ${sp.clear}px`);
console.log(`   measured: header ${sp.headerBottom}px · sticky ${sp.stickyBottom}px (${sp.stickyClass}) · scroll-margin ${sp.scrollMargin} · heading ${sp.headingTop}px · clearance ${sp.clear}px`);

console.log('\n--- §14 direct URL, refresh, back/forward, mobile, dark ---');
await go(B + '/quran/al-baqarah#quran-source-trust');
sp = await srcPos();
ok(sp && sp.visible, `opening the full URL directly lands on the section — clearance ${sp && sp.clear}px`);
await cdp.send('Page.reload'); await sleep(1700);
sp = await srcPos();
ok(await ev('location.pathname + location.hash') === '/quran/al-baqarah#quran-source-trust', 'Refresh keeps path + hash');
ok(sp && sp.visible, 'and the section is still in view after reload');
await go(B + '/quran/al-baqarah');
await ev(`(()=>{const a=[...document.querySelectorAll('#page-quran-surah a')].find(x=>x.textContent.trim()==='مصدر النص وموثوقيته');a.click()})()`);
await sleep(1200);
await ev('history.back()'); await sleep(1200);
ok(await ev('location.pathname') === '/quran/al-baqarah' && await ev('location.hash') === '',
   'Back removes the fragment and keeps the surah — ' + await ev('location.pathname + location.hash'));
await ev('history.forward()'); await sleep(1200);
ok(await ev('location.pathname + location.hash') === '/quran/al-baqarah#quran-source-trust', 'Forward restores the fragment');
for (const [w,h,dark,label] of [[390,844,false,'mobile'], [1440,900,true,'dark']]) {
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<500});
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:dark?'dark':'light'}]});
  await go(B + '/quran/al-baqarah#quran-source-trust');
  const m = await srcPos();
  ok(m && m.visible, `${label}: the source heading clears the chrome — clearance ${m && m.clear}px`);
}
await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});

console.log('\n--- §15 the four link roles stay separate ---');
await go(B + '/quran/al-baqarah');
const roles = await ev(`(()=>{const p=document.getElementById('page-quran-surah');
  const bc=p.querySelector('.bc-link[href="/quran"]');
  const cta=p.querySelector('a.quran-browse-cta');
  const pick=p.querySelector('.quran-pick-surah-btn');
  const src=[...p.querySelectorAll('a')].find(x=>x.textContent.trim()==='مصدر النص وموثوقيته');
  return {bc:bc&&bc.getAttribute('href'), cta:cta&&cta.getAttribute('href'),
    pickTag:pick&&pick.tagName, pickHref:pick&&pick.getAttribute('href'),
    src:src&&src.getAttribute('href')}})()`);
ok(roles.bc === '/quran', 'breadcrumb → /quran');
ok(roles.cta === '/quran#quran-surah-index', 'CTA → /quran#quran-surah-index');
ok(roles.pickTag === 'BUTTON' && roles.pickHref === null, 'drawer → <button>, no href');
ok(roles.src === '/quran/al-baqarah#quran-source-trust', 'source → own path + #quran-source-trust');
ok(new Set([roles.bc, roles.cta, roles.src]).size === 3, 'the three links have three distinct targets — no link does two jobs');

console.log('\n--- §7 runtime cleanliness ---');
await go(B + '/quran/al-baqarah');
ok(errs.length === 0, 'pageerror = 0' + (errs.length ? ': ' + errs.slice(0,2) : ''));
ok(cerr.length === 0, 'console.error = 0' + (cerr.length ? ': ' + cerr.slice(0,2) : ''));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
try{ chrome.kill(); }catch(e){}
// process.exit BEFORE rmSync: on Windows the just-killed Chrome can still hold locks on its --user-data-dir,
// so rmSync would block/retry and hang the process long after RESULT printed. The temp dir is OS-cleaned.
process.exit(fail ? 1 : 0);
