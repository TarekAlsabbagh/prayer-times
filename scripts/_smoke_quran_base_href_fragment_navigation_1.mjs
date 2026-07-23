/* QURAN-BASE-HREF-FRAGMENT-NAVIGATION-AND-HIDDEN-CONTINUE-FINAL-FIX-1
   The shell serves <base href="/">, so a bare «#target» anchor inside a Quran component resolves against the
   base URL and jumps to «/». This smoke is the durable guard: it proves every in-page jump in the Quran home
   and in all 114 surah pages is a ROUTE-QUALIFIED anchor (/quran#… or /quran/{slug}#…), that ZERO component
   -scoped a[href^="#"] survive, and that the hero «متابعة القراءة» button is genuinely hidden with no saved
   position yet carries a full route-qualified href (derived from the surah NUMBER, never a stored path) once a
   valid one exists. Part 1 = pure HTTP sweep; part 2 = Chrome for the runtime behaviours. */
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const ROUTES = JSON.parse(fs.readFileSync('data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json', 'utf8')).surahs;

// isolate ONE .page block by balanced-div matching, so shell chrome (the footer's cookie <a href="#">, nav,
// other .page blocks) can never be counted against a Quran component.
function pageBlock(html, id) {
  const i = html.indexOf(`id="${id}"`); if (i < 0) return '';
  const start = html.lastIndexOf('<div', i);
  let d = 0; const re = /<div\b|<\/div>/g; re.lastIndex = start; let m;
  while ((m = re.exec(html))) { d += m[0].startsWith('<div') ? 1 : -1; if (d === 0) return html.slice(start, m.index + m[0].length); }
  return html.slice(start);
}
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

console.log('--- §1 SSR sweep: all 114 surah pages are base-aware ---');
let bareHash = 0, ayah1 = 0, src = 0, drawer = 0, cta = 0, bc = 0, badScheme = 0, route200 = 0;
const problems = [];
for (const rec of ROUTES) {
  const res = await fetch(B + rec.path);
  if (res.status === 200) route200++;
  const html = await res.text();
  const page = pageBlock(html, 'page-quran-surah');
  const nBare = (page.match(/<a\b[^>]*href="#[^"]*"/g) || []).length;                       // §13 zero fragment-only
  const nAyah = (page.match(new RegExp(`href="${esc(rec.path)}#ayah-1"`, 'g')) || []).length; // start + return
  const nSrc  = (page.match(new RegExp(`href="${esc(rec.path)}#quran-source-trust"`, 'g')) || []).length;
  const nDraw = (page.match(new RegExp(`href="${esc(rec.path)}"[^>]*aria-current="page"`, 'g')) || []).length;
  const nCta  = (page.match(/href="\/quran#quran-surah-index"/g) || []).length;
  const hasBc = /<a class="bc-link" href="\/quran">القرآن الكريم<\/a>/.test(page);
  const noBad = !/href="#"/.test(page) && !/javascript:void/.test(page) && !/href="\/quran\/\d+/.test(page);
  if (nBare === 0) bareHash++; else problems.push(`${rec.path}: ${nBare} bare-hash anchors`);
  if (nAyah >= 2) ayah1++; else problems.push(`${rec.path}: ${nAyah} #ayah-1 links (want ≥2)`);
  if (nSrc === 2) src++;
  if (nDraw === 1) drawer++; else problems.push(`${rec.path}: drawer current x${nDraw}`);
  if (nCta >= 1) cta++;
  if (hasBc) bc++;
  if (noBad) badScheme++;
}
ok(route200 === 114, `114/114 surah routes return 200 — ${route200}`);
ok(bareHash === 114, `114/114 have ZERO component-scoped a[href^="#"] — ${bareHash}`);
ok(ayah1 === 114, `114/114 carry ≥2 «{path}#ayah-1» links (start + return) — ${ayah1}`);
ok(src === 114, `114/114 carry exactly 2 «{path}#quran-source-trust» links — ${src}`);
ok(drawer === 114, `114/114 drawer current-surah item = «{path}» + aria-current="page" — ${drawer}`);
ok(cta === 114, `114/114 index CTA = «/quran#quran-surah-index» — ${cta}`);
ok(bc === 114, `114/114 breadcrumb links to «/quran» — ${bc}`);
ok(badScheme === 114, `114/114 free of href="#", javascript:void, and numeric routes — ${badScheme}`);
if (problems.length) problems.slice(0, 8).forEach(p => console.log('    - ' + p));

console.log('\n--- §2 SSR: /quran home is base-aware ---');
{
  const html = await (await fetch(B + '/quran')).text();
  const home = pageBlock(html, 'page-quran-home');
  ok((home.match(/<a\b[^>]*href="#[^"]*"/g) || []).length === 0, 'home component has ZERO a[href^="#"]');
  ok((home.match(/href="\/quran#quran-surah-index"/g) || []).length >= 1, 'browse CTA = «/quran#quran-surah-index»');
  ok(/id="quran-home-continue" href="\/quran#quran-surah-index"[^>]*hidden/.test(home)
     || /id="quran-home-continue"[^>]*href="\/quran#quran-surah-index"[^>]*hidden/.test(home),
     'continue button SSR default is route-qualified AND ships hidden');
  ok(/quran-home-lastread-btn" href="\/quran#quran-surah-index"/.test(home), 'last-read card button SSR default is route-qualified (no href="#")');
  ok(!/quran-home-lastread-btn" href="#"/.test(home), 'last-read card button no longer ships href="#"');
  // the 114 index cards + 30 juz links are untouched full paths
  ok((home.match(/class="quran-home-idx-card" href="\/quran\/[a-z-]+"/g) || []).length === 114, 'all 114 index cards keep their full /quran/{slug} href');
}

/* ---------- part 2: runtime ---------- */
const PORT = 9481, UDD = path.join(os.tmpdir(), 'qbase-' + Date.now());
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
const go = async u => { loaded=false; await cdp.send('Page.navigate',{url:u}); for(let i=0;i<200&&!loaded;i++) await sleep(100); await sleep(1200); };
await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});

console.log('\n--- §3 runtime: «متابعة القراءة» hidden with no saved position ---');
await go(B + '/quran');
await ev(`(()=>{try{localStorage.removeItem('quran.pos.last')}catch(e){}return 1})()`);
await go(B + '/quran');
{
  const j = JSON.parse(await ev(`(()=>{const e=document.getElementById('quran-home-continue');const r=e.getBoundingClientRect();
    return JSON.stringify({hiddenAttr:e.hasAttribute('hidden'),display:getComputedStyle(e).display,w:+r.width.toFixed(0),h:+r.height.toFixed(0),
      offsetParentNull:e.offsetParent===null,focusable:(function(){e.focus();return document.activeElement===e})()})})()`));
  ok(j.hiddenAttr && j.display === 'none' && j.w === 0 && j.h === 0 && j.offsetParentNull && !j.focusable,
    `continue hidden: [hidden]+display:none+0×0+offsetParent null+not focusable — ${JSON.stringify(j)}`);
  const card = JSON.parse(await ev(`(()=>{const e=document.getElementById('quran-home-lastread');
    return JSON.stringify({display:getComputedStyle(e).display,visible:e.getBoundingClientRect().height>0&&e.offsetParent!==null})})()`));
  ok(card.display === 'none' && !card.visible, 'last-read card hidden too');
}

console.log('\n--- §4 runtime: valid saved position → full href from NUMBER (never the stored path) ---');
await ev(`(()=>{localStorage.setItem('quran.pos.last', JSON.stringify({n:21,ayah:35,path:'/quran/EVIL',t:1}));return 1})()`);
await go(B + '/quran');
{
  const j = JSON.parse(await ev(`(()=>{const btns=[...document.querySelectorAll('#quran-home-continue')];const e=btns[0];
    const link=document.querySelector('#quran-home-lastread [data-quran-lastread-link]');
    return JSON.stringify({count:btns.length,shown:!e.hasAttribute('hidden'),hero:new URL(e.href).pathname+new URL(e.href).hash,
      card:link?new URL(link.href).pathname+new URL(link.href).hash:null})})()`));
  ok(j.count === 1 && j.shown && j.hero === '/quran/al-anbiya#ayah-35' && j.card === '/quran/al-anbiya#ayah-35',
    `valid record → shown once, /quran/al-anbiya#ayah-35 (not EVIL) — ${JSON.stringify(j)}`);
}
for (const [desc, val] of [['surah>114','{"n":999,"ayah":5}'], ['ayah>count','{"n":21,"ayah":9999}'], ['bad JSON','xx']]) {
  await ev(`(()=>{localStorage.setItem('quran.pos.last', ${JSON.stringify(val)});return 1})()`);
  await go(B + '/quran');
  ok(await ev(`document.getElementById('quran-home-continue').hasAttribute('hidden')`), `corrupt (${desc}) → continue stays hidden`);
}
await ev(`(()=>{try{localStorage.removeItem('quran.pos.last')}catch(e){}return 1})()`);

console.log('\n--- §5 runtime: resolved URLs after a real click (never «/») ---');
const clickCheck = async (page, label, sel, want) => {
  await go(B + page);
  await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.scrollIntoView({block:'center'});e.click();return 1})()`);
  await sleep(900);
  const after = await ev(`location.pathname+location.hash`);
  ok(after === want, `${label} → ${after}`);
};
await clickCheck('/quran/al-baqarah', 'start reading', '#page-quran-surah .quran-hero-actions a[href$="#ayah-1"]', '/quran/al-baqarah#ayah-1');
await clickCheck('/quran/al-baqarah', 'return to start', '#page-quran-surah a.quran-btn-secondary[href$="#ayah-1"]', '/quran/al-baqarah#ayah-1');
await clickCheck('/quran/al-baqarah', 'source', '#page-quran-surah a[href$="#quran-source-trust"]', '/quran/al-baqarah#quran-source-trust');
await clickCheck('/quran/al-baqarah', 'browse CTA', '#page-quran-surah .quran-browse-cta', '/quran#quran-surah-index');
await clickCheck('/quran', 'home browse CTA', '#page-quran-home .quran-btn-primary[href="/quran#quran-surah-index"]', '/quran#quran-surah-index');

console.log('\n--- §6 no-JS: the anchors still navigate correctly ---');
await cdp.send('Emulation.setScriptExecutionDisabled', { value: true });
const noJs = async (page, label, sel, want) => {
  await go(B + page);
  await ev(`(()=>{document.querySelector(${JSON.stringify(sel)}).click();return 1})()`);
  await sleep(700);
  const u = await ev(`location.pathname+location.hash`);
  ok(u === want, `no-JS ${label} → ${u}`);
};
await noJs('/quran/al-baqarah', 'start', '#page-quran-surah .quran-hero-actions a[href$="#ayah-1"]', '/quran/al-baqarah#ayah-1');
await noJs('/quran/al-baqarah', 'source', '#page-quran-surah a[href$="#quran-source-trust"]', '/quran/al-baqarah#quran-source-trust');
await noJs('/quran', 'home CTA', '#page-quran-home .quran-btn-primary[href="/quran#quran-surah-index"]', '/quran#quran-surah-index');
await cdp.send('Emulation.setScriptExecutionDisabled', { value: false });

console.log('\n--- §7 runtime cleanliness ---');
ok(errs.length === 0, `pageerror = ${errs.length}`);
ok(cerr.length === 0, `console.error = ${cerr.length}`);

try { chrome.kill(); } catch {} try { fs.rmSync(UDD, { recursive: true, force: true }); } catch {}
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
