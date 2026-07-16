// Smoke — QURAN hero: exact approved eyebrow / H1 / intro / info-chips / action buttons.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// hero built on the site .section-card
ok(/<section class="section-card quran-hero">/.test(b), 'hero is a site .section-card');
// approved copy (exact)
ok(b.includes('القرآن الكريم — قراءة موثوقة بالرسم العثماني'), 'eyebrow: approved text');
ok(b.includes('<h1 id="quran-surah-h1">سورة الأنبياء مكتوبة كاملة بالتشكيل والرسم العثماني</h1>'), 'H1: approved text (single, exact, with «بالتشكيل», id for _getActiveH1Marker)');
ok((b.match(/<h1[\s>]/g) || []).length === 1, 'exactly one H1');
ok(/quran-hero-intro">[\s\S]*مجمّع الملك فهد[\s\S]*رواية حفص عن عاصم/.test(b), 'intro paragraph cites source + Hafs riwayah');
// info chips (labels present; numbers come from data)
['السورة', 'آية', 'صفحات مرجعية', 'الجزء', 'رواية حفص عن عاصم', 'الرسم العثماني'].forEach(t =>
  ok(new RegExp('quran-chip">[^<]*' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(b) || b.includes('>' + t) || b.includes(t + '</span>') || b.includes(t), 'chip present: ' + t));
// action buttons (exact labels + roles)
ok(/class="quran-btn quran-btn-primary" href="#page-\$\{surah\.firstPage\}">ابدأ القراءة<\/a>/.test(b), 'button: ابدأ القراءة → first page anchor');
ok(/\$\{_quranBrowseCta\(chapters\.length, 'hero'\)\}/.test(b), 'hero renders the distinctive «تصفّح جميع سور القرآن» CTA (opens the surah index)');
ok(/href="#quran-source">مصدر النص وموثوقيته<\/a>/.test(b), 'button: مصدر النص وموثوقيته → source anchor');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
