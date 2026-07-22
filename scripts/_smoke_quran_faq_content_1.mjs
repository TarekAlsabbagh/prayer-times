// Smoke — QURAN (scalable template): FAQ = 7 answered questions, SSR, native <details> (works with NO
// JavaScript), site's shared FAQ component. Includes the APPROVED sourced makki/madani + name-reason
// questions (ticket §7); still NO tafsir / fadl / reason-of-revelation / maqasid; no duplicate id.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const f0 = src.indexOf('function _quranFaqHtml');
const faq = src.slice(f0, src.indexOf('function _quranSourceHtml'));
ok(f0 > 0, 'FAQ builder present');
ok((src.match(/id="quran-faq-title"/g) || []).length === 1, 'exactly one FAQ section title id (no duplicate id)');
ok(/<section class="section-card quran-faq" aria-labelledby="quran-faq-title">/.test(faq), 'FAQ section is a labelled .section-card');
ok(/<div class="country-faq-list moon-country-faq">/.test(faq), 'reuses the SITE shared FAQ component (.country-faq-list.moon-country-faq)');
// items come from a [q, a] data array mapped to <details> — count questions (each ends ؟) in the array
const qCount = (faq.match(/؟',/g) || []).length;
// Tanzil flat model: the mushaf «من أي صفحة إلى أي صفحة» (which page → which page) question was RETIRED with the
// page/line layout, so the answered set is 6, not the KFGQPC-era 7.
ok(qCount === 6, 'exactly 6 FAQ questions in the data array (' + qCount + ')');
ok(/<details class="country-faq-item"><summary><h3>\$\{_quranEsc\(q\)\}<\/h3><\/summary><p>\$\{_quranEsc\(a\)\}<\/p><\/details>/.test(faq), 'each item renders summary(question) + <p>(answer) — every question is answered');
ok(/<details/.test(faq) && /<summary>/.test(faq) && !/data-quran-faq|addEventListener/.test(faq), 'native <details>/<summary> — works without JavaScript (no JS accordion)');
// required question stems present (data-driven answers)
['كم عدد آيات سورة', 'ما رقم سورة', 'في أي جزء تقع', 'مكية أم مدنية', 'لماذا سميت سورة', 'كيف أنتقل إلى آية'].forEach(q =>
  ok(faq.includes(q), 'FAQ question present: ' + q.slice(0, 20)));
// forbidden (needs an independent religious source that this prototype does not fetch): no tafsir / fadl /
// reason-of-revelation / maqasid. NOTE: makki-madani + name-reason are now APPROVED sourced questions (ticket §7).
['تفسير', 'فضل', 'سبب نزول', 'سبب النزول', 'مقاصد'].forEach(w =>
  ok(!faq.includes(w), 'FAQ excludes: ' + w));
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
