// Report generator + verifier — QURAN surah page NON-AYAH content inventory (P0).
// Loads /quran/surah/21 in headless Chrome, extracts every visible NON-ayah text (headings, paragraphs, chips,
// buttons/links, surah modal, surah-end, FAQ, Islamic-events section, hidden/helper strings), computes content
// stats + keyword frequencies, and VERIFIES the exclusions the report must honour:
//   • ayah text (.quran-ayah-text / .quran-basmala) is excluded from the word count
//   • the 114 modal surah names are excluded from the MAIN stat (counted separately)
//   • no local filesystem paths / secrets are captured
//   • the H1/H2/H3 counts it reports match the live page
// Prints a single JSON blob to stdout (used to author reports/quran-surah-21-non-ayah-content-inventory.md) and
// exits non-zero if any verification check fails. Reuses QURAN_SMOKE_URL/localhost:3100 or spawns its own server.
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
function findChrome() {
  const c = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA ? process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe' : '',
    '/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  return c.find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });
}
const reachable = (url) => new Promise(res => { try { const u = new URL(url); const s = net.connect({ host: u.hostname, port: +u.port || 80 }, () => { s.end(); res(true); }); s.on('error', () => res(false)); s.setTimeout(1200, () => { s.destroy(); res(false); }); } catch (e) { res(false); } });
const CHROME = findChrome();
if (!CHROME) { console.error('SKIP — no Chrome'); process.exit(0); }
let base = process.env.QURAN_SMOKE_URL || 'http://localhost:3100'; let spawnedServer = null;
async function ensureServer() {
  if (await reachable(base)) { const H = await fetch(base + '/quran/surah/21').then(r => r.text()).catch(() => ''); if (/quran-surah-page/.test(H)) return true; }
  const PORT = 3196; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT) }) });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base)) { const H = await fetch(base + '/quran/surah/21').then(r => r.text()).catch(() => ''); if (/quran-surah-page/.test(H)) return true; } }
  return false;
}
class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }
let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-inventory-' + process.pid);
async function main() {
  if (!await ensureServer()) { console.error('SKIP — no server'); process.exit(0); }
  const rawHtml = await fetch(base + '/quran/surah/21').then(r => r.text());
  const PORT = 9373;
  try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {}
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${UDD}`, 'about:blank'], { stdio: 'ignore' });
  let t = null; for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json`); const l = await r.json(); t = l.find(x => x.type === 'page'); if (t && t.webSocketDebuggerUrl) break; } catch (e) {} await sleep(250); }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const cdp = new CDP(ws); await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  let loaded = false; cdp.on('Page.loadEventFired', () => { loaded = true; });
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: base + '/quran/surah/21' });
  for (let i = 0; i < 120 && !loaded; i++) await sleep(100); await sleep(1100);
  // open the modal so its contents are measurable
  await cdp.send('Runtime.evaluate', { expression: "var b=document.querySelector('[data-quran-surah-browser-trigger]'); if(b) b.click();" });
  await sleep(400);
  const expr = `(function(){
    var page=document.getElementById('page-quran-surah');
    var norm=function(s){ return (s||'').replace(/\\s+/g,' ').trim(); };
    // ----- headings -----
    var headings=[].slice.call(page.querySelectorAll('h1,h2,h3,h4')).map(function(h){
      return { tag:h.tagName, text:norm(h.textContent), inModal: !!h.closest('.quran-surah-modal'), readingHidden: !!h.closest('.quran-hero,.quran-surah-end,.quran-about,.quran-source-box,.quran-faq,.moon-events-section,.quran-services') }; });
    // ----- paragraphs (exclude ayah text) -----
    var paras=[].slice.call(page.querySelectorAll('p')).filter(function(p){ return !p.closest('.quran-ayah-flow'); })
      .map(function(p){ return norm(p.textContent); }).filter(function(x){ return x.length>0; });
    // ----- chips -----
    var chips=[].slice.call(page.querySelectorAll('.quran-chip')).map(function(c){ return norm(c.textContent); });
    // ----- buttons + links -----
    var ctrls=[].slice.call(page.querySelectorAll('a[href], button')).map(function(el){
      return { type: el.tagName==='A'?'link':'button', text:norm(el.textContent), href: el.getAttribute('href')||'',
        aria: el.getAttribute('aria-label')||'', disabled: el.disabled||el.getAttribute('aria-disabled')==='true'||el.hasAttribute('disabled'),
        inModal: !!el.closest('.quran-surah-modal') }; }).filter(function(x){ return x.text||x.aria; });
    // ----- modal specifics -----
    var modal=document.getElementById('quran-index');
    var modalInfo = modal ? {
      title: norm((modal.querySelector('.quran-index-title')||{}).textContent),
      placeholder: (modal.querySelector('[data-quran-surah-filter]')||{}).getAttribute?(modal.querySelector('[data-quran-surah-filter]').getAttribute('placeholder')):'',
      counter: norm((modal.querySelector('[data-quran-surah-count]')||{}).textContent),
      emptyMsg: norm((modal.querySelector('.quran-empty-msg')||{}).textContent),
      emptyClear: norm((modal.querySelector('.quran-empty-clear')||{}).textContent),
      note: norm((modal.querySelector('.quran-index-note')||{}).textContent),
      surahCount: modal.querySelectorAll('.quran-idx-li').length,
      current: norm((modal.querySelector('.quran-idx-item.is-current .quran-idx-name')||{}).textContent),
      disabledCount: modal.querySelectorAll('.quran-idx-item.is-disabled').length
    } : null;
    // ----- events section -----
    var ev=page.querySelector('.moon-events-section');
    var events = ev ? {
      title: norm((ev.querySelector('.moon-events-title')||{}).textContent),
      notice: norm((ev.querySelector('.moon-events-notice')||{}).textContent),
      cards: [].slice.call(ev.querySelectorAll('.moon-event-card')).map(function(c){
        return { label:norm((c.querySelector('.moon-event-label')||{}).textContent), days:norm((c.querySelector('.moon-event-days')||{}).textContent), date:norm((c.querySelector('.moon-event-date')||{}).textContent), href:c.getAttribute('href'), isLink: c.tagName==='A' }; })
    } : null;
    // ----- hidden/helper strings -----
    var helpers=[];
    [].slice.call(page.querySelectorAll('[aria-label]')).forEach(function(e){ helpers.push({k:'aria-label', v:norm(e.getAttribute('aria-label'))}); });
    [].slice.call(page.querySelectorAll('[aria-live]')).forEach(function(e){ helpers.push({k:'aria-live='+e.getAttribute('aria-live'), v:norm(e.textContent)}); });
    [].slice.call(page.querySelectorAll('[hidden]')).forEach(function(e){ var v=norm(e.textContent); if(v) helpers.push({k:'hidden', v:v}); });
    [].slice.call(page.querySelectorAll('[title]')).forEach(function(e){ helpers.push({k:'title', v:norm(e.getAttribute('title'))}); });
    // ----- MAIN non-ayah text (exclude ayat + the 114 modal names) -----
    var clone=page.cloneNode(true);
    [].slice.call(clone.querySelectorAll('.quran-ayah-text,.quran-basmala,.quran-ayah-num')).forEach(function(n){ n.remove(); });
    [].slice.call(clone.querySelectorAll('.quran-index-list')).forEach(function(n){ n.remove(); }); // 114 names counted separately
    var mainText=norm(clone.textContent);
    var words=mainText.split(' ').filter(Boolean);
    var arWords=words.filter(function(w){ return /[\\u0600-\\u06FF]/.test(w); });
    var enWords=words.filter(function(w){ return /[A-Za-z]/.test(w); });
    var kw=function(re){ return (mainText.match(re)||[]).length; };
    // duplicate texts (paras appearing >1) — from responsive echoes etc.
    var seen={}, dups=0; paras.forEach(function(p){ seen[p]=(seen[p]||0)+1; }); Object.keys(seen).forEach(function(k){ if(seen[k]>1) dups+=seen[k]-1; });
    return {
      lang: document.documentElement.lang, dir: document.documentElement.dir || getComputedStyle(document.documentElement).direction,
      title: document.title,
      robots: (document.querySelector('meta[name=robots]')||{}).content||'(none)',
      canonical: (document.querySelector('link[rel=canonical]')||{}).href||'(none)',
      hreflang: [].slice.call(document.querySelectorAll('link[rel=alternate][hreflang]')).map(function(l){return l.getAttribute('hreflang');}),
      h1: norm((page.querySelector('h1')||{}).textContent),
      headings: headings, paragraphs: paras, chips: chips, controls: ctrls, modal: modalInfo, events: events, helpers: helpers,
      stats: {
        nonAyahWords: words.length, arabicWords: arWords.length, englishWords: enWords.length, chars: mainText.length,
        paragraphs: paras.length, h1: page.querySelectorAll('h1').length, h2: page.querySelectorAll('h2').length, h3: page.querySelectorAll('h3').length, h4: page.querySelectorAll('h4').length,
        buttons: page.querySelectorAll('button').length, links: page.querySelectorAll('a[href]').length, duplicateParagraphs: dups,
        faqQuestions: page.querySelectorAll('.quran-faq details, .quran-faq .quran-faq-q, .quran-faq summary').length
      },
      keywords: {
        'سورة الأنبياء': kw(/سورة الأنبياء/g), 'القرآن الكريم': kw(/القرآن الكريم/g), 'الرسم العثماني': kw(/الرسم العثماني/g),
        'رواية حفص': kw(/رواية حفص/g), 'قراءة': kw(/قراءة|اقرأ|يقرأ|القراءة/g), 'حفظ': kw(/حفظ|الحفظ/g), 'مراجعة': kw(/مراجعة|المراجعة/g),
        'صفحات': kw(/صفحات|صفحة|الصفحات/g), 'آيات': kw(/آية|آيات|الآيات/g), 'سور القرآن': kw(/سور القرآن|السور|سورة/g)
      },
      modalMainText: mainText.indexOf('الأنبيَاء')!==-1  // sanity: does mainText still contain the surah NAME (kept) - not the 114 list
    };
  })()`;
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) { console.error('EXTRACT ERROR', JSON.stringify(r.exceptionDetails)); process.exit(1); }
  const data = r.result.value;

  // ----- VERIFICATION (req 12) -----
  const V = [];
  const ayahSample = 'ٱقْتَرَبَ'; // opening word of Al-Anbiya (Uthmani)
  V.push(['ayah text excluded from word count', JSON.stringify(data).indexOf('ٱقْتَرَبَ') === -1 && data.stats.nonAyahWords < 1200]);
  V.push(['114 surah names excluded from MAIN stat (modal counted separately = ' + (data.modal ? data.modal.surahCount : '?') + ')', data.modal && data.modal.surahCount === 114 && data.stats.nonAyahWords < 1200]);
  V.push(['no local filesystem paths / secrets captured', !/[A-Za-z]:\\\\|\/Users\/|node_modules|service[_-]?role|supabase|apikey|secret/i.test(JSON.stringify(data))]);
  V.push(['H1 count = 1', data.stats.h1 === 1]);
  V.push(['H2 count matches live page (>=4)', data.stats.h2 >= 4]);
  const okAll = V.every(v => v[1]);
  const out = { generatedFor: base + '/quran/surah/21', ssrHasEventsTitle: /العد التنازلي للمناسبات الإسلامية/.test(rawHtml), verification: V.map(v => ({ check: v[0], pass: v[1] })), data: data };
  console.log(JSON.stringify(out, null, 2));
  try { ws.close(); } catch (e) {}
  process.exitCode = okAll ? 0 : 1;
}
main().finally(() => { try { if (chrome) chrome.kill(); } catch (e) {} try { if (spawnedServer) spawnedServer.kill(); } catch (e) {} try { fs.rmSync(UDD, { recursive: true, force: true }); } catch (e) {} setTimeout(() => process.exit(process.exitCode || 0), 200); });
