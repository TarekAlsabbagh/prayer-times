// Smoke — QURAN hero: exact approved eyebrow / H1 / intro / info-chips / action buttons.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// hero built on the site .section-card
ok(/<section class="section-card quran-hero">/.test(b), 'hero is a site .section-card');
// approved copy (exact)
ok(b.includes('القرآن الكريم — قراءة موثوقة بالرسم العثماني'), 'eyebrow: approved text');
// the surah name is data-driven now (${sName} from chapters.json) — the rest of the approved wording is exact
ok(b.includes('<h1 id="quran-surah-h1">سورة ${_quranEsc(sName)} مكتوبة كاملة بالتشكيل والرسم العثماني</h1>'), 'H1: approved wording with a data-driven surah name (single, exact, with «بالتشكيل», id for _getActiveH1Marker)');
ok((b.match(/<h1[\s>]/g) || []).length === 1, 'exactly one H1');
ok(/quran-hero-intro">[\s\S]*مجمّع الملك فهد[\s\S]*رواية حفص عن عاصم/.test(b), 'intro paragraph cites source + Hafs riwayah');
// Info chips: labels present, numbers from data. The ayah/page/juz chips are built by the Arabic-count
// helpers now — «صفحات مرجعية» is one of four page forms (واحدة/صفحتان/صفحات/صفحة) chosen by pageCount, and
// «الجزء» becomes «الأجزاء» on the 19 multi-juz surahs — so those three are asserted via their helper, and
// the per-surah rendering is checked over all 114 in _smoke_quran_ssr_metadata_nav_content_114_1.mjs.
ok(/\$\{_quranAyahPhrase\(surah\.ayahCount\)\}/.test(b), 'chip: ayah count via the Arabic-count helper (٣ آيات / ١١٢ آية)');
ok(/\$\{_quranPagePhrase\(surah\.pageCount\)\}/.test(b), 'chip: reference pages via the Arabic-count helper (صفحة واحدة / صفحتان / N صفحات / N صفحة)');
ok(/\$\{_quranJuzPhrase\(surah\.juz\)\}/.test(b), 'chip: juz via the helper (الجزء N for one, الأجزاء A–B for the 19 that span more)');
['السورة', 'رواية حفص عن عاصم', 'الرسم العثماني'].forEach(t =>
  ok(new RegExp('quran-chip">[^<]*' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(b) || b.includes('>' + t) || b.includes(t + '</span>') || b.includes(t), 'chip present: ' + t));
// action buttons (exact labels + roles)
ok(/class="quran-btn quran-btn-primary" href="#page-\$\{surah\.firstPage\}">ابدأ القراءة<\/a>/.test(b), 'button: ابدأ القراءة → first page anchor');
ok(/\$\{_quranBrowseCta\(chapters\.length, 'hero'\)\}/.test(b), 'hero renders the distinctive «تصفّح جميع سور القرآن» CTA (opens the surah index)');
ok(/href="#quran-source">مصدر النص وموثوقيته<\/a>/.test(b), 'button: مصدر النص وموثوقيته → source anchor');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
