/* QURAN-HOME-STATS-CARDS-AND-AL-KAHF-FRIDAY-FEATURE-1 — the three stat cards and the al-Kahf feature card.

   SSR half (no browser): exactly three stat cards, each printing its DERIVED number next to the right title
   and carrying an accessible name; three distinct icons; one al-Kahf card with the approved badge / title /
   text / meta / single CTA to /quran/al-kahf; the figures match chapters.json + juz.json; the internal H1→H2
   outline is intact (the cards are NOT headings; only al-Kahf adds an H2).

   Browser half (CDP): 3 / 2 / 1 columns across 1440 / 900 / 390 with no horizontal overflow and no clipped
   text, the al-Kahf link opens /quran/al-kahf with JavaScript disabled, and the accessible names are exposed.
   Run with QURAN_SSR_BASE / QURAN_SMOKE_URL (default http://localhost:3000). */
import { spawn } from 'child_process'; import os from 'os'; import path from 'path'; import fs from 'fs';

const B = process.env.QURAN_SSR_BASE || process.env.QURAN_SMOKE_URL || 'http://localhost:3000';
const ROOT = 'data/quran/kfgqpc-hafs-v2-0';
const CH = JSON.parse(fs.readFileSync(ROOT + '/metadata/chapters.json', 'utf8'));
const JZ = JSON.parse(fs.readFileSync(ROOT + '/metadata/juz.json', 'utf8'));
const kahf = CH.find(c => c.number === 18);
const ar = n => String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
const SURAHS = ar(CH.length), JUZ = ar(JZ.length), AYAT = ar(CH.reduce((a, c) => a + c.ayahCount, 0));

let P = 0, F = 0;
const ok = (c, m) => { if (c) { P++; console.log('  PASS ' + m); } else { F++; console.log('  FAIL ' + m); } };

console.log('--- §1/§4 SSR: three stat cards, derived numbers, three icons, accessible names ---');
const html = await (await fetch(B + '/quran')).text();
{
  ok((html.match(/class="quran-stat-card"/g) || []).length === 3, 'exactly three stat cards');
  ok(html.includes('<strong class="quran-stat-num">' + SURAHS + '</strong><span class="quran-stat-title">سورة'), `surah card shows ${SURAHS} سورة`);
  ok(html.includes('<strong class="quran-stat-num">' + JUZ + '</strong><span class="quran-stat-title">جزءًا'), `juz card shows ${JUZ} جزءًا`);
  ok(html.includes('<strong class="quran-stat-num">' + AYAT + '</strong><span class="quran-stat-title">آية'), `ayah card shows ${AYAT} آية`);
  // §4 accessible names — one per card, and they name the figure
  ok(html.includes(`aria-label="${SURAHS} سورة في القرآن الكريم"`), 'surah card accessible name');
  ok(html.includes(`aria-label="${JUZ} جزءًا في القرآن الكريم"`), 'juz card accessible name');
  ok(html.includes(`aria-label="${AYAT} آية في النص القرآني المعروض"`), 'ayah card accessible name');
  // three DISTINCT svg icons, all aria-hidden, no emoji / no <img> / no external ref
  const icons = [...html.matchAll(/<span class="quran-stat-ico" aria-hidden="true">(<svg[\s\S]*?<\/svg>)<\/span>/g)].map(m => m[1]);
  ok(icons.length === 3, `three inline stat icons — ${icons.length}`);
  ok(new Set(icons).size === 3, 'the three icons are distinct');
  ok(icons.every(s => /stroke-width="1\.6"/.test(s)), 'all icons share one stroke weight');
  ok((html.match(/class="quran-home-stats-cards"[^>]*role="list"[^>]*aria-label="إحصاءات القرآن الكريم"/) || []).length === 1,
     'the group has role=list + an accessible name');
  ok(!/quran-stat-card[^>]*>\s*<[^>]*>[^<]*<img/i.test(html) && !/quran-home-stats-cards[\s\S]{0,600}<img/.test(html), 'no <img> in the stat cards');
}

console.log('\n--- §5 SSR: the al-Kahf feature card ---');
{
  ok((html.match(/class="quran-home-kahf"/g) || []).length === 1, 'exactly one al-Kahf card');
  const seg = (html.split('class="quran-home-kahf"')[1] || '').split('</section>')[0];
  ok(/quran-kahf-badge">قراءة يوم الجمعة</.test(seg), 'badge: «قراءة يوم الجمعة»');
  ok(/<h2 id="quran-home-kahf-title"[^>]*>سورة الكهف<\/h2>/.test(seg), 'title is an H2 «سورة الكهف»');
  ok(/اقرأ سورة الكهف كاملة بالتشكيل والرسم العثماني برواية حفص عن عاصم\./.test(seg), 'approved description text');
  ok(seg.includes(`${ar(kahf.ayahCount)} آيات · السورة رقم ${ar(kahf.number)}`), `meta shows ${ar(kahf.ayahCount)} آيات · السورة رقم ${ar(kahf.number)} (derived)`);
  ok(kahf.ayahCount === 110 && kahf.number === 18, `al-Kahf data: ${kahf.ayahCount} ayat, surah ${kahf.number}`);
  const links = [...seg.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map(m => m[1]);
  ok(links.length === 1, `exactly one link in the card — ${links.length}`);
  ok(links[0] === '/quran/al-kahf', `the CTA points at /quran/al-kahf — ${links[0]}`);
  ok(/quran-kahf-btn"[^>]*>قراءة سورة الكهف/.test(seg), 'button label «قراءة سورة الكهف»');
  ok(!/href="#/.test(seg), 'no bare fragment link in the card');
}

console.log('\n--- §9 outline: H1 stays single, al-Kahf adds the only new H2, cards are not headings ---');
{
  const heads = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m => m[1].toLowerCase());
  ok(heads.filter(h => h === 'h1').length === 1, `one H1 — ${heads.filter(h => h === 'h1').length}`);
  ok(!/quran-stat-(num|title|sub)"[^>]*>\s*<h[1-6]/.test(html), 'stat cards contain no heading tags');
  // ORDER (per the user): the search box is the first element under the hero, then continue-reading, then
  // the stat cards, then the al-Kahf card — so the search H2 precedes the al-Kahf H2 in source order.
  const searchIdx = html.indexOf('quran-home-search-title');
  const statsIdx = html.indexOf('quran-home-stats-cards');
  const kahfIdx = html.indexOf('quran-home-kahf-title');
  ok(searchIdx > 0 && searchIdx < statsIdx && statsIdx < kahfIdx,
     'order is search → stat cards → al-Kahf (search is the first element under the hero)');
}

// ─────────────── browser half ───────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
    ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
      if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
      else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(m, p = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method: m, params: p })); }); }
  on(m, f) { this.h[m] = f; } }
const PORT = 9515, UDD = path.join(os.tmpdir(), 'qkahf-' + process.pid);
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--incognito',
   `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
let t = null;
for (let i = 0; i < 60; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); t = l.find(x => x.type === 'page'); if (t?.webSocketDebuggerUrl) break; } catch (e) { } await sleep(250); }
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
const cdp = new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
let loaded = false; const errs = [], cerr = [];
cdp.on('Page.loadEventFired', () => { loaded = true; });
cdp.on('Runtime.exceptionThrown', p => errs.push(String(p.exceptionDetails?.text || '')));
cdp.on('Runtime.consoleAPICalled', p => { if (p.type === 'error') cerr.push((p.args || []).map(a => a.value || '').join(' ')); });
const ev = async e => (await cdp.send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.value;
const go = async u => { loaded = false; await cdp.send('Page.navigate', { url: u }); for (let i = 0; i < 300 && !loaded; i++) await sleep(100); await sleep(900); };

console.log('\n--- §3 responsive: 3 / 2 / 1 columns, no overflow, no clipped text ---');
for (const [w, h, expect, label] of [[1440, 1000, 3, 'desktop'], [900, 1100, 2, 'tablet'], [390, 1400, 1, 'mobile']]) {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  await go(B + '/quran');
  const d = JSON.parse(await ev(`(()=>{
    const cards=[...document.querySelectorAll('.quran-stat-card')];
    const tops=[...new Set(cards.map(c=>Math.round(c.getBoundingClientRect().top)))];
    const perRow = tops.length? cards.filter(c=>Math.round(c.getBoundingClientRect().top)===tops[0]).length : 0;
    const doc=document.documentElement;
    const numClipped = cards.some(c=>{const n=c.querySelector('.quran-stat-num');return n && n.scrollWidth>n.clientWidth+1;});
    const clipped = cards.some(c=>c.scrollHeight - c.clientHeight > 2);
    const k=document.querySelector('.quran-home-kahf'); const btn=k&&k.querySelector('.quran-kahf-btn');
    const btnOut = btn ? (btn.getBoundingClientRect().right > k.getBoundingClientRect().right+1 || btn.getBoundingClientRect().left < k.getBoundingClientRect().left-1) : false;
    return JSON.stringify({perRow, overflow: doc.scrollWidth-doc.clientWidth, clipped, numClipped, btnOut,
      firstOnRight: cards.length? Math.round(cards[0].getBoundingClientRect().right) >= Math.round((cards[1]||cards[0]).getBoundingClientRect().right) : true});
  })()`));
  ok(d.perRow === expect, `${label} ${w}px: ${d.perRow} card(s) per row (expected ${expect})`);
  ok(d.overflow <= 0, `${label}: no horizontal overflow — ${d.overflow}`);
  ok(!d.clipped && !d.numClipped, `${label}: no clipped card text and the big number never wraps/clips`);
  ok(!d.btnOut, `${label}: the al-Kahf button stays inside the card`);
  if (w >= 900) ok(d.firstOnRight, `${label}: RTL — the first (surah) card sits on the right`);
}
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

console.log('\n--- §4 accessible names are exposed to the tree; icons are hidden ---');
await go(B + '/quran');
{
  const d = JSON.parse(await ev(`(()=>{
    const cards=[...document.querySelectorAll('.quran-stat-card')];
    return JSON.stringify({
      names: cards.map(c=>c.getAttribute('aria-label')),
      iconsHidden: [...document.querySelectorAll('.quran-stat-ico, .quran-kahf-ico, .quran-kahf-deco')].every(e=>e.getAttribute('aria-hidden')==='true'),
      kahfName: (document.getElementById('quran-home-kahf-title')||{}).textContent||''
    });
  })()`));
  ok(d.names.length === 3 && d.names.every(n => n && n.includes('القرآن الكريم') || n && n.includes('النص القرآني')),
     `three cards expose an accessible name — ${d.names.join(' | ')}`);
  ok(d.iconsHidden, 'every decorative icon is aria-hidden');
  ok(d.kahfName.trim() === 'سورة الكهف', `al-Kahf H2 text — «${d.kahfName.trim()}»`);
}

console.log('\n--- §7 the al-Kahf link works with JavaScript disabled ---');
await cdp.send('Emulation.setScriptExecutionDisabled', { value: true });
await go(B + '/quran');
{
  const href = await ev(`(document.querySelector('.quran-kahf-btn')||{}).getAttribute?document.querySelector('.quran-kahf-btn').getAttribute('href'):''`);
  ok(href === '/quran/al-kahf', `no-JS: the al-Kahf CTA is a real link to /quran/al-kahf — ${href}`);
  const cards = await ev(`document.querySelectorAll('.quran-stat-card').length`);
  ok(cards === 3, `no-JS: the three stat cards render — ${cards}`);
}
await cdp.send('Emulation.setScriptExecutionDisabled', { value: false });
// and the destination is a real 200 surah page
{
  const res = await fetch(B + '/quran/al-kahf');
  const kh = await res.text();
  ok(res.status === 200, `/quran/al-kahf → ${res.status}`);
  ok((kh.match(/class="quran-ayah"/g) || []).length === 110, `al-Kahf page shows 110 ayat — ${(kh.match(/class="quran-ayah"/g) || []).length}`);
}

console.log('\n--- runtime cleanliness ---');
ok(errs.length === 0, `pageerror = ${errs.length}${errs.length ? ' :: ' + errs.slice(0, 2).join(' | ') : ''}`);
ok(cerr.length === 0, `console.error = ${cerr.length}${cerr.length ? ' :: ' + cerr.slice(0, 2).join(' | ') : ''}`);

try { chrome.kill(); } catch (e) { } try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) { }
console.log(`\nRESULT: ${P} passed, ${F} failed`);
process.exitCode = F ? 1 : 0;
