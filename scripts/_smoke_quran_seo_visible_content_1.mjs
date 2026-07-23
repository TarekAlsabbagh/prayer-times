// Smoke — QURAN REVISION-2: descriptive SEO content is VISIBLE SSR (one H1, the required H2s, no hidden
// keyword list, no meta keywords, no phrases for services that do not exist, does not alter the ayah text).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// The editorial cards moved into _quranEditorialHtml (surah-21-gated) and the reading-tools card into
// _quranToolsHtml (shared by all 114) — this slice spans both, which is what the four H2s below live in.
const a0 = src.indexOf('function _quranEditorialHtml');
const about = src.slice(a0, src.indexOf('function _quranFaqHtml'));
ok((b.match(/<h1[\s>]/g) || []).length === 1, 'exactly one H1');
// the four editorial H2 titles in _quranAboutHtml (surah name is data-driven via ${sName} in the source template)
['نبذة عن سورة ${sName}', 'لماذا سميت سورة ${sName} بهذا الاسم؟', 'أبرز موضوعات سورة ${sName}', 'قراءة سورة ${sName} وأدوات الصفحة'].forEach(h =>
  ok(about.includes('<h2') && about.includes(h), 'required H2 present: ' + h.replace('${sName}', 'الأنبياء').slice(0, 24)));
// visible (a real .section-card, not hidden / not display:none)
ok(/<section class="section-card quran-about"/.test(about) && !/quran-about[^>]*hidden/.test(about) && !/quran-about[^>]*display:\s*none/.test(about), 'about content is a visible section-card (not hidden, no display:none)');
ok(!/display:\s*none[^}]*\/\* *seo/i.test(b), 'no display:none-for-SEO trick');
// no hidden keyword stuffing
ok(!/name="keywords"/.test(b), 'no <meta name="keywords">');
// natural target phrases actually appear in the visible copy
['سورة ${_quranEsc(sName)} مكتوبة كاملة', 'بالرسم العثماني', 'رواية حفص عن عاصم', 'الجزء السابع عشر'].forEach(p =>
  ok(about.includes(p) || b.includes(p), 'target phrase present: ' + p));
// NO phrases for non-existent services or unsourced tafsir (download / audio / tafsir / fadl / reason-of-revelation).
// NOTE: makki classification (مكيّة) is now an APPROVED, sourced editorial field (ticket §2) → no longer forbidden.
['تحميل', 'PDF', 'pdf', 'MP3', 'mp3', 'استماع', 'بصوت', 'تفسير', 'سبب نزول', 'سبب النزول', 'فضل'].forEach(w =>
  ok(!about.includes(w), 'about excludes non-service / unsourced phrase: ' + w));
// the descriptive content must not touch the ayah body text emit
ok(/class="quran-ayah-text">\$\{_quranEsc\(a\.textUthmaniBody\)\}/.test(b), 'ayah body text emit is unchanged (content did not alter the Quran text)');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
