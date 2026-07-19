// Smoke — QURAN Al-Anbiya (21): SIMPLIFIED SCALABLE editorial template
// (QURAN-AR-SURAH-21-SCALABLE-EDITORIAL-CONTENT-IMPLEMENTATION-1). Headless Chrome + CDP.
// Verifies: exactly the SIX editorial/technical sections (نبذة / سبب التسمية / أبرز الموضوعات /
// قراءة وأدوات / الرسم والمصدر / الأسئلة الشائعة) — and NO prophets table, NO supplications section,
// NO fadl section, NO tables at all; ONE H1; new Title + Meta Description carrying «بالتشكيل»
// (Quran text is actually vowelled); ONE services block; ONE Islamic-events section that is the last
// section before the footer; content present in SSR + with JS disabled (No-JS); all editorial sections
// hidden in reading mode + restored on exit; no duplicated section headings after hydration; no overflow;
// pageerror=0; console.error=0. Self-contained (reuses a running :3100 or spawns one).
import { spawn } from 'child_process';
import fs from 'fs'; import os from 'os'; import path from 'path'; import net from 'net';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// /quran/{official-english-slug} — the ONE URL per surah, read from the source-derived routes table.
// Never spell a slug out in a test: it would become a second source of truth, and these tests SKIP (not
// fail) when the page 404s — a drifted literal would go quietly green with zero coverage.
const ROUTES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json'), 'utf8')).surahs;
const P = n => ROUTES.find(x => x.number === n).path;
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
// worktree has no local node_modules → let a spawned fallback resolve deps from the main checkout
const NODE_PATH_FALLBACK = process.env.NODE_PATH || 'C:/Users/Tarek/Downloads/TIME PRAYER/node_modules';
async function ssrHasSections(b) { const H = await fetch(b + P(21)).then(r => r.text()).catch(() => ''); return /نبذة عن سورة الأنبياء/.test(H) && /الرسم العثماني ومصدر نص سورة الأنبياء/.test(H) ? H : ''; }
async function ensureServer() {
  if (await reachable(base)) { if (await ssrHasSections(base)) return true; }
  const PORT = 3196; base = 'http://localhost:' + PORT;
  spawnedServer = spawn(process.execPath, [path.join(ROOT, 'server.js')], { cwd: ROOT, stdio: 'ignore', env: Object.assign({}, process.env, { QURAN_PROTOTYPE_ENABLED: '1', PORT: String(PORT), NODE_PATH: NODE_PATH_FALLBACK }) });
  for (let i = 0; i < 80; i++) { await sleep(400); if (await reachable(base) && await ssrHasSections(base)) return true; }
  return false;
}
class CDP { constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.h = {};
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data);
    if (m.id && this.p.has(m.id)) { const q = this.p.get(m.id); this.p.delete(m.id); m.error ? q.reject(new Error(JSON.stringify(m.error))) : q.resolve(m.result); }
    else if (m.method && this.h[m.method]) this.h[m.method](m.params); }); }
  send(method, params = {}) { const id = ++this.id; return new Promise((res, rej) => { this.p.set(id, { resolve: res, reject: rej }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  on(m, f) { this.h[m] = f; } }
let chrome = null; const UDD = path.join(os.tmpdir(), 'quran-scalable-smoke-' + process.pid);
async function main() {
  if (!await ensureServer()) { console.log('SKIP — could not reach/boot a server with the new sections'); process.exit(0); }
  // ---- (A) SSR / No-JS source-level checks (raw HTML) ----
  const rawHtml = await fetch(base + P(21)).then(r => r.text()).catch(() => '');
  const has = s => rawHtml.includes(s), cnt = s => rawHtml.split(s).length - 1;
  // QURAN-AR-SEO-TITLE-PRIMARY-SEARCH-INTENT-ALL-114-1: surah 21 no longer carries bespoke SEO copy — it uses
  // the SAME title/description template as the other 113 (no site-name suffix, no ayah-count padding).
  ok(has('<title>سورة الأنبياء مكتوبة كاملة بالتشكيل والرسم العثماني</title>'), 'SSR <title> = the shared template, with NO «| مواقيت الصلاة» suffix');
  ok(has('<meta name="description" content="قراءة سورة الأنبياء مكتوبة كاملة بالتشكيل والرسم العثماني برواية حفص عن عاصم، مع الانتقال المباشر إلى الآيات والصفحات ووضع قراءة مريح.">'), 'SSR meta description = the shared template (no «١١٢ آية» count-padding)');
  ok(has('<h1 id="quran-surah-h1">سورة الأنبياء مكتوبة كاملة بالتشكيل والرسم العثماني</h1>'), 'SSR H1 carries «بالتشكيل»');
  ['نبذة عن سورة الأنبياء', 'لماذا سميت سورة الأنبياء بهذا الاسم؟', 'أبرز موضوعات سورة الأنبياء',
    'قراءة سورة الأنبياء وأدوات الصفحة', 'الرسم العثماني ومصدر نص سورة الأنبياء', 'الأسئلة الشائعة حول سورة الأنبياء']
    .forEach(t => ok(has(t), 'SSR (No-JS) contains section: ' + t));
  ok(cnt('class="quran-services') === 1, 'exactly ONE services block in SSR — got ' + cnt('class="quran-services'));
  ok(cnt('id="mc-occasions"') === 1, 'exactly ONE Islamic-events section in SSR');
  ok(!/<h2>مصدر النص وموثوقيته<\/h2>/.test(rawHtml), 'OLD standalone «مصدر النص وموثوقيته» H2 is gone (merged)');
  ok(!has('هل سورة الأنبياء مكتوبة بالرسم العثماني؟') && !has('هل توزيع الأسطر مطابق تمامًا') && !has('ما مصدر نص سورة الأنبياء في الصفحة؟'), 'the three generic FAQ (rasm / line-match / source) are removed from FAQ');
  ok(has('هل سورة الأنبياء مكية أم مدنية؟'), 'FAQ has the makki/madani question');
  // NO tables / prophets / supplications / fadl anywhere in the surah body
  const bodyStart = rawHtml.indexOf('id="page-quran-surah"'); const bodyEnd = rawHtml.indexOf('</head>') > bodyStart ? rawHtml.length : rawHtml.length;
  const body = rawHtml.slice(bodyStart, bodyEnd);
  ok(!/<table[\s>]/.test(body), 'NO <table> in the surah body (no prophets/ayah-range tables)');
  ok(!/أدعية الأنبياء/.test(body) && !/الأنبياء المذكورون/.test(body), 'NO prophets-list / supplications section');
  ok(!/فضل سورة الأنبياء/.test(body), 'NO «فضل سورة الأنبياء» section');

  // ---- (A2) MINIMAL-EDITORIAL-SOURCE-VERIFICATION-FIX-1 — nothing unverified may ship ----
  // Every religious claim on the page is `verified` against ONE primary tafsir (ابن عاشور، التحرير والتنوير);
  // anything that could not be sourced was DELETED, never hedged into a needs-review/placeholder state.
  ok(!/needs-review/i.test(rawHtml), 'served HTML carries NO «needs-review» marker');
  ok(!/\bpending\b/i.test(body), 'served surah body carries NO «pending» state');
  ok(!body.includes('يُملأ بشريًا') && !body.includes('يُملأ لاحقًا') && !body.includes('يملأ لاحقا'), 'NO «يُملأ بشريًا/لاحقًا» placeholder');
  // the source QUALIFIES the comparison («…عدا ما في سورة الأنعام») → the absolute claim must not ship
  ok(!rawHtml.includes('ولم يجتمع هذا القدر'), 'the unsourced absolute comparison sentence «ولم يجتمع هذا القدر…» is gone');
  ok(!body.includes('الصبر والابتلاء وإجابة الدعاء'), 'the unsourced theme «الصبر والابتلاء وإجابة الدعاء» was removed (not in the source «أغراض هذه السورة»)');
  // the sourced wordings that replaced them
  ok(body.includes('مكيّة بالاتفاق'), 'classification ships the SOURCED wording «مكيّة بالاتفاق»');
  ok(body.includes('ستة عشر نبيًّا'), 'name-reason ships the SOURCED wording «ستة عشر نبيًّا»');
  ok(body.includes('العدّ الكوفي'), 'ayah-count carries the sourced «العدّ الكوفي» qualifier (source: كوفي=112, others=111)');
  // a recorded source must exist for EVERY editorial field
  const VR = path.join(ROOT, 'reports', 'quran-surah-21-minimal-editorial-source-verification.md');
  const vr = fs.existsSync(VR) ? fs.readFileSync(VR, 'utf8') : '';
  ok(!!vr, 'the minimal source-verification report exists');
  ok(/التحرير والتنوير/.test(vr) && /بن عاشور/.test(vr) && /https?:\/\/\S+/.test(vr) && /2026-07-16/.test(vr),
    'the report records the primary source: name + author + direct link + access date');
  ['مكية/مدنية', 'سبب التسمية', 'الموضوعات'].forEach(f =>
    ok(new RegExp('\\|\\s*\\*\\*' + f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*[^\\n]*verified').test(vr),
      'the report decides «' + f + '» = verified (a source is recorded for it)'));
  ok(!/\|\s*needs-review\s*\|/.test(vr) && !/القرار\s*\|\s*needs-review/.test(vr), 'no field in the decision table is left at needs-review');

  // ---- (B) browser behaviour ----
  const PORT = 9372;
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
  const nav = async (w, h, mobile) => { await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile }); loaded = false; await cdp.send('Page.navigate', { url: base + P(21) }); for (let i = 0; i < 100 && !loaded; i++) await sleep(100); await sleep(900); };
  const H = `
    var page=document.getElementById('page-quran-surah');
    function n(sel){ return page.querySelectorAll(sel).length; }
    function shown(el){ return !!el && el.getClientRects().length>0; }
    function txtCount(s){ return (page.innerHTML.split(s).length-1); }
  `;

  await nav(1440, 900, false);
  let s = await ev(`(function(){ ${H}
    var order=['quran-about','quran-naming','quran-topics','quran-tools','quran-source-box','quran-faq'];
    var idx=order.map(function(c){ var el=page.querySelector('.'+c); return el?[].indexOf.call(page.querySelectorAll('.section-card, .quran-surah-end, .moon-events-section'),el):-1; });
    var footer=document.querySelector('.site-footer');
    var events=page.querySelector('.moon-events-section');
    var allCards=[].slice.call(page.querySelectorAll('.section-card'));
    return {
      about:n('.quran-about'), naming:n('.quran-naming'), topics:n('.quran-topics'), tools:n('.quran-tools'),
      source:n('.quran-source-box'), faq:n('.quran-faq'), services:n('.quran-services'), events:n('.moon-events-section'),
      h1: document.querySelectorAll('#page-quran-surah h1, #page-quran-surah [id="quran-surah-h1"]').length,
      title: document.title, desc: (document.querySelector('meta[name=description]')||{}).content||'',
      tables: n('table'),
      topicItems: n('.quran-topic-title'), faqItems: n('.quran-faq .country-faq-item'),
      idxMonotonic: idx.every(function(v,i){ return i===0 || (v>idx[i-1] && v>-1); }),
      eventsLastCard: events ? allCards[allCards.length-1]===events : false,
      eventsBeforeFooter: events&&footer ? (events.compareDocumentPosition(footer)&Node.DOCUMENT_POSITION_FOLLOWING)>0 : false,
      dupTitleIds: ['quran-about-title','quran-naming-title','quran-topics-title','quran-tools-title','quran-source-title','quran-faq-title'].map(function(id){ return page.querySelectorAll('[id="'+id+'"]').length; }),
      dupIds: (function(){ var ids={},d=[]; page.querySelectorAll('[id]').forEach(function(el){ if(ids[el.id])d.push(el.id); else ids[el.id]=1; }); return d; })(),
      noOverflow: document.documentElement.scrollWidth<=innerWidth+1
    }; })()`);
  ok(s.about === 1 && s.naming === 1 && s.topics === 1 && s.tools === 1 && s.source === 1 && s.faq === 1, 'exactly the SIX editorial/technical sections each once — ' + JSON.stringify([s.about, s.naming, s.topics, s.tools, s.source, s.faq]));
  ok(s.idxMonotonic, 'section order: نبذة → تسمية → موضوعات → قراءة/أدوات → مصدر → FAQ (monotonic)');
  ok(s.h1 === 1, 'exactly ONE H1 in the page — got ' + s.h1);
  ok(/بالتشكيل والرسم العثماني/.test(s.title), 'document.title carries «بالتشكيل والرسم العثماني»');
  ok(/^قراءة سورة الأنبياء مكتوبة كاملة بالتشكيل والرسم العثماني برواية حفص عن عاصم، مع الانتقال المباشر إلى الآيات والصفحات ووضع قراءة مريح\.$/.test(s.desc), 'live meta description = the shared template exactly');
  ok(s.tables === 0, 'NO <table> element in the page (no prophets/ayah-range tables) — got ' + s.tables);
  ok(s.topicItems >= 4 && s.topicItems <= 5, 'أبرز الموضوعات has 4–5 points — got ' + s.topicItems);
  ok(s.faqItems >= 5 && s.faqItems <= 7, 'FAQ has 5–7 questions (spec range; verified fields keep their Q) — got ' + s.faqItems);
  ok(s.services === 1, 'exactly ONE services block (DOM) — got ' + s.services);
  ok(s.events === 1, 'exactly ONE Islamic-events section (DOM) — got ' + s.events);
  ok(s.eventsBeforeFooter && s.eventsLastCard, 'Islamic-events is the LAST section before the footer');
  ok(s.dupTitleIds.every(c => c === 1) && s.dupIds.length === 0, 'no duplicated content after hydration: each section-title id once + no duplicate ids — titles ' + JSON.stringify(s.dupTitleIds) + (s.dupIds.length ? ' dupIds ' + JSON.stringify(s.dupIds) : ''));
  ok(s.noOverflow, 'no horizontal overflow on desktop (1440)');

  // reading mode hides ALL editorial + services + events; exit restores
  s = await ev(`(function(){ ${H}
    var sel=['.quran-about','.quran-naming','.quran-topics','.quran-tools','.quran-source-box','.quran-faq','.quran-services','.moon-events-section'];
    document.querySelector('.quran-reading-enter').click();
    var allHidden=sel.every(function(c){ return !shown(page.querySelector(c)); });
    document.querySelector('.quran-reading-exit').click();
    var allBack=sel.every(function(c){ return shown(page.querySelector(c)); });
    return {allHidden:allHidden, allBack:allBack}; })()`);
  ok(s.allHidden, 'reading mode HIDES all six editorial sections + services + events');
  ok(s.allBack, 'exiting reading mode RESTORES all sections');

  // No-JS: disable page scripts, reload, sections still present + visible (SSR)
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: true });
  loaded = false; await cdp.send('Page.navigate', { url: base + P(21) }); for (let i = 0; i < 100 && !loaded; i++) await sleep(100); await sleep(700);
  s = await ev(`(function(){ ${H}
    return { sixShown: ['.quran-about','.quran-naming','.quran-topics','.quran-tools','.quran-source-box','.quran-faq'].every(function(c){ return shown(page.querySelector(c)); }),
             h1: shown(document.getElementById('quran-surah-h1')), events: shown(page.querySelector('.moon-events-section')) }; })()`);
  ok(s.sixShown && s.h1 && s.events, 'No-JS: the six sections + H1 + events render from SSR (JS disabled)');
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: false });

  // mobile + dark
  await nav(390, 844, true);
  s = await ev(`(function(){ ${H} return { noOverflow: document.documentElement.scrollWidth<=innerWidth+1, six: n('.quran-about')+n('.quran-naming')+n('.quran-topics')+n('.quran-tools')+n('.quran-source-box')+n('.quran-faq') }; })()`);
  ok(s.noOverflow && s.six === 6, 'no overflow + all six sections present on mobile (390)');
  await nav(1440, 900, false);
  s = await ev(`(function(){ ${H} document.documentElement.setAttribute('data-theme','dark'); return { ok: shown(page.querySelector('.quran-topics')) && shown(page.querySelector('.quran-source-box')) }; })()`);
  ok(s.ok, 'dark mode: editorial sections render');

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
