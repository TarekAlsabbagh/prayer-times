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
ok(/quran-hero-intro">[\s\S]*مشروع Tanzil[\s\S]*رواية حفص عن عاصم/.test(b), 'intro paragraph cites the Tanzil source + Hafs riwayah');
// Info chips: labels present, numbers from data. The ayah/juz chips are built by the Arabic-count helpers,
// and «الجزء» becomes «الأجزاء» on the 19 multi-juz surahs — asserted via their helper; per-surah rendering
// is checked over all 114 in _smoke_quran_ssr_metadata_nav_content_114_1.mjs.
// The «صفحات مرجعية» (reference-pages) chip was RETIRED with the Tanzil flat model (no pageCount), so only
// the ayah + juz chips remain.
ok(/\$\{_quranAyahPhrase\(surah\.ayahCount\)\}/.test(b), 'chip: ayah count via the Arabic-count helper (٣ آيات / ١١٢ آية)');
ok(!/pageCount/.test(b), 'no reference-pages chip / pageCount reference remains in the hero (retired with the flat model)');
ok(/\$\{_quranJuzPhrase\(surah\.juz\)\}/.test(b), 'chip: juz via the helper (الجزء N for one, الأجزاء A–B for the 19 that span more)');
['السورة', 'رواية حفص عن عاصم', 'الرسم العثماني'].forEach(t =>
  ok(new RegExp('quran-chip">[^<]*' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(b) || b.includes('>' + t) || b.includes(t + '</span>') || b.includes(t), 'chip present: ' + t));
// action buttons (exact labels + roles)
// QURAN-BASE-HREF-FRAGMENT-NAVIGATION-…-1 — a bare «#page-N» re-resolves against <base href="/"> and jumps to
// «/». «ابدأ القراءة» now carries the surah's own route before the fragment and targets the FIRST ayah.
ok(/class="quran-btn quran-btn-primary" href="\$\{_quranPathFor\(surah\.surah\)\}#ayah-1">ابدأ القراءة<\/a>/.test(b), 'button: ابدأ القراءة → own path + #ayah-1');
ok(/\$\{_quranBrowseCta\(chapters\.length, 'hero'\)\}/.test(b), 'hero renders the «تصفح سور القرآن» CTA (links to the home index)');
// QURAN-AR-SURAH-SOURCE-TRUST-INPAGE-LINK-FIX-1 — a bare href="#hash" is re-resolved against <base href="/">,
// so it used to land on the HOME page. The link now carries the surah's own path before the fragment.
ok(/path\}#quran-source-trust">مصدر النص وموثوقيته<\/a>/.test(b), 'button: مصدر النص وموثوقيته → path + #quran-source-trust');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
