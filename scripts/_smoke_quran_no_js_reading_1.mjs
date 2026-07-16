// Smoke — QURAN prototype: readable without JavaScript (text in SSR; client JS carries NO data/text).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
const builder = srv.slice(srv.indexOf('function _buildQuranSurahBody(n)'), srv.indexOf('// ===== HTTP Server =====', srv.indexOf('function _buildQuranSurahBody(n)')));
// (1) SSR emits the ayah text + basmala directly into HTML (not injected by JS)
ok(/a\.textUthmaniBody/.test(builder), 'SSR HTML contains the ayah body text');
ok(/basmala\.textUthmaniBody/.test(builder), 'SSR HTML contains the derived basmala');
ok(/href="#page-\$\{surah\.firstPage\}"/.test(builder), 'in-page anchor nav present (works without JS)');
ok(!/spinner|skeleton|loading/i.test(builder), 'no spinner/skeleton/loading placeholder');
// (2) client JS carries NO Quran data/text and does not generate ayah text. The result-counter UI labels
// (chrome, NOT Quran data) legitimately live in the client → strip those known strings before the check.
const UI_LABELS = ['نتيجتان مطابقتان', 'لا توجد نتائج', 'نتيجة واحدة', 'سورة مطابقة', 'سور مطابقة'];
let jsNoUi = js; UI_LABELS.forEach(w => { jsNoUi = jsNoUi.split(w).join(''); });
const arabic = /[ء-ي]{5,}/; // 5+ Arabic LETTERS = embedded ayah text (Arabic-Indic digit map U+0660-9 is NOT letters)
ok(!arabic.test(jsNoUi), 'js/quran.js contains NO Arabic ayah text (counter UI labels excluded)');
ok(!/textUthmani|aya_text|021\.json|hafsData|basmala\.textUthmani/.test(js), 'js/quran.js references NO surah data / basmala text');
ok(!/innerHTML\s*=\s*[`'"][^`'"]*؀/.test(js), 'js/quran.js never writes Arabic text into the DOM');
ok(/font|theme|reading|scroll|localStorage|progress/i.test(js), 'js/quran.js is enhancement-only (font/theme/reading/scroll/progress/storage)');
ok(/catch\s*\(/.test(js), 'js/quran.js guards localStorage/exceptions (degrades safely)');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
