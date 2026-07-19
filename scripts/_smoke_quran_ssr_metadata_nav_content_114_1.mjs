// Smoke — QURAN-AR-SSR-SURAH-GENERALIZATION-1 §5/§7/§8/§9/§10/§11/§12: METADATA + NAVIGATION + CONTENT POLICY.
// Every assertion runs against all 114 served pages, not a sample.
//
// The content-policy half is the important one. 113 of these surahs have NO editorial source, so the page must
// say only what the data file states. This test fails if a religious claim (مكية/مدنية, سبب التسمية, الموضوعات,
// الفضل) appears on a surah with no verification report — a template that "fills in" such a section would be
// inventing scripture commentary, and that must be impossible to ship by accident.
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_smoke_quran_ssr_metadata_nav_content_114_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
const D = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0');
const CH = JSON.parse(fs.readFileSync(path.join(D, 'metadata/chapters.json'), 'utf8'));
// The one URL per surah — /quran/{official-english-slug}. Read from the source-derived table, never spelled
// out here: a slug typed into a test is a second source of truth, and the first one to drift.
const ROUTES = JSON.parse(fs.readFileSync(path.join(D, 'metadata/surah-routes.json'), 'utf8')).surahs;
const P = n => ROUTES.find(x => x.number === n).path;
const surahFile = n => JSON.parse(fs.readFileSync(path.join(D, 'surahs', String(n).padStart(3, '0') + '.json'), 'utf8'));
// mirrors server.js `_quranCleanName` exactly — U+064B–U+0653 (maddah included, so 36/38/50 read «يس» «ص» «ق»)
// + U+0670 + U+0640, and NOTHING beyond: U+0654/U+0655 are letter-forming and must survive.
const clean = s => String(s).replace(/[ً-ٰٓـ]/g, '');
const ar = n => String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
const EDITORIAL = new Set([21]); // the ONLY surah with a completed source-verification report
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

const pages = new Map();
for (const c of CH) pages.set(c.number, await fetch(`${BASE}${P(c.number)}`).then(r => r.text()));
// The page is served inside the SHARED index.html shell, whose other (inactive) .page sections carry their own
// markup — 7 aria-disabled azkar cards and 3 empty <h2></h2> among them. A body-level assertion must therefore
// look ONLY inside #page-quran-surah, or it fails on markup this ticket does not own and never touched.
const bodyOf = (html) => {
  const i = html.indexOf('<div class="page active" id="page-quran-surah">');
  return i < 0 ? '' : html.slice(i, html.indexOf('</body>', i));
};

const bad = { title: [], desc: [], h1: [], h1count: [], bc: [], robots: [], canon: [], hreflang: [],
              prev: [], next: [], badge: [], note: [], disabled: [], links: [], juz: [], pages: [],
              ayahMax: [], action: [], editorial: [], stub: [], emptyH2: [] };
const titleLens = [];
for (const c of CH) {
  const n = c.number, html = pages.get(n), body = bodyOf(html), s = surahFile(n), nm = clean(c.nameAr);

  // ---- §7 title / desc / H1 / breadcrumb, all built from this surah's own name ----
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  // QURAN-AR-SEO-TITLE-PRIMARY-SEARCH-INTENT-ALL-114-1: the title is the search query and nothing else —
  // no «| مواقيت الصلاة» site-name suffix on surah pages (every other section keeps it).
  if (title !== `سورة ${nm} مكتوبة كاملة بالتشكيل والرسم العثماني`) bad.title.push(n + ': ' + title);
  titleLens.push([n, [...title].length]);
  // The description is now ONE template for all 114 — surah 21 included. Asserting the whole string (not just
  // "does it name the surah") is what catches a silent drift back to per-surah copy or count-padding.
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc !== `قراءة سورة ${nm} مكتوبة كاملة بالتشكيل والرسم العثماني برواية حفص عن عاصم، مع الانتقال المباشر إلى الآيات والصفحات ووضع قراءة مريح.`) bad.desc.push(n + ': ' + desc);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => m[1].trim());
  if (h1s.length !== 1) bad.h1count.push(`${n}: ${h1s.length} H1`);
  if (h1s[0] !== `سورة ${nm} مكتوبة كاملة بالتشكيل والرسم العثماني`) bad.h1.push(n + ': ' + (h1s[0] || ''));
  if (!html.includes(`<span aria-current="page">سورة ${nm}</span>`)) bad.bc.push(n);

  // ---- §8 noindex + self canonical + NO hreflang ----
  if (!/content="noindex,follow,max-snippet:-1,max-image-preview:large"/.test(html)) bad.robots.push(n);
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
  if (!canon.endsWith(P(n))) bad.canon.push(`${n}: ${canon}`);
  if (/rel="alternate" hreflang/.test(html)) bad.hreflang.push(n);

  // ---- §9 prev/next are real links; the boundaries carry NO card at all ----
  const hasPrev = html.includes(`class="quran-surah-nav-card quran-surah-nav-card--prev" href="${n > 1 ? P(n - 1) : ''}"`);
  const hasNext = html.includes(`class="quran-surah-nav-card quran-surah-nav-card--next" href="${n < 114 ? P(n + 1) : ''}"`);
  if (n === 1 ? /nav-card--prev/.test(html) : !hasPrev) bad.prev.push(n);
  if (n === 114 ? /nav-card--next/.test(html) : !hasNext) bad.next.push(n);

  // ---- §9/§10 no disabled control and no "coming soon" survives anywhere ----
  if (/is-disabled|aria-disabled="true"|ستتوفر عند إطلاق/.test(body)) bad.disabled.push(n);
  if (/quran-index-note|في هذا النموذج الأولي/.test(body)) bad.note.push(n);

  // ---- §10 the drawer lists all 114: 113 links + the current one as an in-page anchor with its badge ----
  // Capture the href itself rather than a number pulled out of it: that way a stray numeric or /quran/surah/
  // entry cannot slip through as a "match", it simply fails to equal the slug path the table demands.
  const idxLinks = [...html.matchAll(/class="quran-idx-item" href="(\/quran\/[^"#]+)"/g)].map(m => m[1]);
  const wantLinks = CH.map(x => x.number).filter(x => x !== n).map(P);
  if (idxLinks.length !== 113 || idxLinks.join() !== wantLinks.join()) bad.links.push(`${n}: ${idxLinks.length} links`);
  if (!html.includes(`<a class="quran-idx-item is-current" href="#page-${s.firstPage}" aria-current="true"`)) bad.badge.push(n);
  if ((html.match(/quran-idx-badge">الحالية/g) || []).length !== 1) bad.badge.push(n + ' (badge×)');

  // ---- §11 single vs multi juz, single vs multi page ----
  const juzChip = s.juz.length === 1 ? `الجزء ${ar(s.juz[0])}` : `الأجزاء ${ar(s.juz[0])}–${ar(s.juz[s.juz.length - 1])}`;
  if (!html.includes(`<span class="quran-chip">${juzChip}</span>`)) bad.juz.push(`${n}: want "${juzChip}"`);
  const pgChip = s.pageCount === 1 ? 'صفحة مرجعية واحدة' : s.pageCount === 2 ? 'صفحتان مرجعيتان'
               : s.pageCount <= 10 ? `${ar(s.pageCount)} صفحات مرجعية` : `${ar(s.pageCount)} صفحة مرجعية`;
  if (!html.includes(`<span class="quran-chip">${pgChip}</span>`)) bad.pages.push(`${n}: want "${pgChip}"`);
  // a single-page surah must never claim a page RANGE ("٦٠٤–٦٠٤")
  if (s.pageCount === 1 && html.includes(`${ar(s.firstPage)}–${ar(s.lastPage)}`)) bad.pages.push(`${n}: fake range`);

  // ---- §12 the jump bar is bounded by THIS surah and posts to THIS surah ----
  if (!html.includes(`max="${s.ayahCount}"`)) bad.ayahMax.push(n);
  if ((html.match(new RegExp(`action="${P(n)}"`, 'g')) || []).length !== 2) bad.action.push(n);
  for (const p of s.pages) if (!html.includes(`<option value="${p.page}">الصفحة ${ar(p.page)}</option>`)) bad.pages.push(`${n}: option ${p.page}`);

  // ---- §5 editorial gate: unsourced religious claims must NOT appear on the other 113 ----
  const claims = [/quran-about-title/, /quran-naming-title/, /quran-topics-title/, /مكيّة|مدنيّة|مكية بالاتفاق/, /سُمِّيت/, /أبرز موضوعات/];
  const hasClaim = claims.some(re => re.test(html));
  if (EDITORIAL.has(n) !== hasClaim) bad.editorial.push(`${n}: editorial=${hasClaim}, verified=${EDITORIAL.has(n)}`);
  // ---- §5 no placeholder / no empty section heading anywhere ----
  if (/المحتوى قيد الإعداد|سيتم إضافة|قريبًا بإذن الله|TODO|Lorem ipsum/i.test(body)) bad.stub.push(n);
  for (const m of body.matchAll(/<h2[^>]*>\s*<\/h2>/g)) bad.emptyH2.push(n);
}

console.log('\n--- §7 title / meta / H1 / breadcrumb (per-surah, from chapters.json) ---');
ok(bad.title.length === 0, 'all 114 titles follow the template with their own clean name, and NONE carries the «| مواقيت الصلاة» suffix' + (bad.title.length ? ' — ' + bad.title.slice(0, 3) : ''));
ok(bad.desc.length === 0, 'all 114 meta descriptions are the ONE template with their own surah name' + (bad.desc.length ? ' — ' + bad.desc.slice(0, 3) : ''));
// Uniqueness: the name is the only variable, so 114 distinct titles/descriptions is the proof that no surah
// silently inherited another's copy.
const uTitles = new Set(), uDescs = new Set();
for (const c of CH) { const h = pages.get(c.number);
  uTitles.add((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  uDescs.add((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''); }
ok(uTitles.size === 114, `114 DISTINCT titles — got ${uTitles.size}`);
ok(uDescs.size === 114, `114 DISTINCT meta descriptions — got ${uDescs.size}`);
ok(bad.h1count.length === 0, 'exactly ONE H1 per page' + (bad.h1count.length ? ' — ' + bad.h1count.slice(0, 3) : ''));
ok(bad.h1.length === 0, 'every H1 names its own surah' + (bad.h1.length ? ' — ' + bad.h1.slice(0, 3) : ''));
ok(bad.bc.length === 0, 'every breadcrumb ends on its own surah' + (bad.bc.length ? ' — ' + bad.bc.slice(0, 5) : ''));
titleLens.sort((a, b) => a[1] - b[1]);
// Now ASSERTED, not merely reported: dropping the site-name suffix was the whole point, so a title that grows
// back past a comfortable SERP width must fail rather than be noticed later. 60 is our internal ceiling — it
// is not a documented Google limit, and the pages are noindex today; this guards the template, not a ranking.
const overLong = titleLens.filter(([, len]) => len > 60);
ok(overLong.length === 0, `no title exceeds 60 code points (internal ceiling) — longest surah ${titleLens[113][0]} = ${titleLens[113][1]} cp`
   + (overLong.length ? ' — over: ' + JSON.stringify(overLong.slice(0, 5)) : ''));
console.log(`     (title length: shortest surah ${titleLens[0][0]} = ${titleLens[0][1]} cp, longest surah ${titleLens[113][0]} = ${titleLens[113][1]} cp)`);

console.log('\n--- §8 noindex + self canonical + NO hreflang ---');
ok(bad.robots.length === 0, 'all 114 keep robots=noindex,follow' + (bad.robots.length ? ' — ' + bad.robots.slice(0, 5) : ''));
ok(bad.canon.length === 0, 'all 114 self-canonical' + (bad.canon.length ? ' — ' + bad.canon.slice(0, 5) : ''));
ok(bad.hreflang.length === 0, 'NO page advertises an hreflang alternate (the /{lang} twins do not exist)' + (bad.hreflang.length ? ' — ' + bad.hreflang.slice(0, 5) : ''));

console.log('\n--- §9 prev/next ---');
ok(bad.prev.length === 0, 'prev card is a real link on 2..114 and ABSENT on Al-Fatiha' + (bad.prev.length ? ' — ' + bad.prev.slice(0, 5) : ''));
ok(bad.next.length === 0, 'next card is a real link on 1..113 and ABSENT on An-Nas' + (bad.next.length ? ' — ' + bad.next.slice(0, 5) : ''));
ok(bad.disabled.length === 0, 'no disabled control and no «ستتوفر عند إطلاق جميع سور القرآن» on any page' + (bad.disabled.length ? ' — ' + bad.disabled.slice(0, 5) : ''));

console.log('\n--- §10 surah drawer ---');
ok(bad.links.length === 0, 'every page lists the other 113 surahs as real links, in order' + (bad.links.length ? ' — ' + bad.links.slice(0, 3) : ''));
ok(bad.badge.length === 0, 'the current surah stays an in-page anchor and keeps exactly one «الحالية» badge' + (bad.badge.length ? ' — ' + bad.badge.slice(0, 5) : ''));
ok(bad.note.length === 0, 'the prototype note is gone from all 114' + (bad.note.length ? ' — ' + bad.note.slice(0, 5) : ''));

console.log('\n--- §11 juz + reference pages adapt to the surah ---');
ok(bad.juz.length === 0, '«الجزء N» for single-juz surahs, «الأجزاء A–B» for the 19 that span more' + (bad.juz.length ? ' — ' + bad.juz.slice(0, 4) : ''));
ok(bad.pages.length === 0, 'page chip + page options match the data; no single-page surah claims a range' + (bad.pages.length ? ' — ' + bad.pages.slice(0, 4) : ''));

console.log('\n--- §12 jump bar bounded by this surah ---');
ok(bad.ayahMax.length === 0, 'the ayah input max = this surah\'s ayah count' + (bad.ayahMax.length ? ' — ' + bad.ayahMax.slice(0, 5) : ''));
ok(bad.action.length === 0, 'both jump forms post to THIS surah\'s route' + (bad.action.length ? ' — ' + bad.action.slice(0, 5) : ''));

console.log('\n--- §5 editorial gate: no unsourced religious claim on the 113 ---');
ok(bad.editorial.length === 0, 'ONLY surah 21 (the one with a verification report) renders نبذة/سبب التسمية/الموضوعات' + (bad.editorial.length ? ' — ' + bad.editorial.slice(0, 4) : ''));
ok(bad.stub.length === 0, 'no content-stub / placeholder section anywhere (the language modal keeps its own «هذه اللغة قيد الإعداد» title — approved copy, asserted below)' + (bad.stub.length ? ' — ' + bad.stub.slice(0, 5) : ''));
ok(bad.emptyH2.length === 0, 'no empty section heading anywhere' + (bad.emptyH2.length ? ' — ' + bad.emptyH2.slice(0, 5) : ''));
// The stub check above deliberately does NOT match «هذه اللغة قيد الإعداد»: that is the language modal's own
// approved title (a true statement about the translations, not a stand-in for missing content). Asserting it is
// present keeps that exemption honest — if the modal ever disappears, this fails instead of passing silently.
const modalOk = [...pages.values()].filter(h => h.includes('data-quran-locale-t="title">هذه اللغة قيد الإعداد</h2>')).length;
ok(modalOk === 114, `the language-unavailable modal keeps its own «هذه اللغة قيد الإعداد» title on all 114 — found ${modalOk}`);
// …and it must never name a surah, since one dict serves all 114 pages.
const modalNames = [...pages.entries()].filter(([, h]) => /data-quran-locale-desc[^>]*>[^<]*سورة /.test(h)).map(([n]) => n);
ok(modalNames.length === 0, 'the Arabic modal text names NO surah (it is shared by all 114)' + (modalNames.length ? ' — ' + modalNames.slice(0, 5) : ''));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
