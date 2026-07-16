// Smoke — QURAN REVISION-3: ONE outer width for EVERY box (site container); the ayah text sits in a
// centered inner column. NO second reading-container width; all page cards fill the container; no 100vw.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// (1) ONE outer container wraps everything; the old two-width wrappers are gone
ok(/class="quran-surah-page quran-site-container" id="quran-top"/.test(b), 'single outer container .quran-surah-page.quran-site-container');
ok(!/quran-reading-container/.test(b) && !/quran-reading-container/.test(css), 'NO reading-container (the 820 second width is gone)');
ok(!/quran-site-container-lower/.test(b) && !/quran-site-container-lower/.test(css), 'NO separate lower container (all boxes share one width)');
// every major box lives directly in the one container (source-literal markers)
['moon-breadcrumb', 'quran-hero', 'quran-toolbar', 'quran-progress', '${pagesHtml}', 'quran-surah-end', '${_quranAboutHtml(surah)}', '${_quranSourceHtml(surah, manifest)}', '${_quranFaqHtml(surah)}', "_quranServiceLinksHtml('quran-services-full')"].forEach(k =>
  ok(b.indexOf(k) > 0, 'box present in the one container: ' + k));
// (2) CSS: ONE outer width (1180) + page cards fill it + ayah text in a narrower inner column; no 100vw
ok(/\.quran-site-container\s*\{[^}]*max-width:\s*1180px/.test(css), 'the ONE outer width is 1180px (site content wrap)');
ok(/\.quran-page-card\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/.test(css), 'page cards fill the container (width:100% + max-width:none)');
ok(/\.quran-ayah-flow,\s*\.quran-basmala\s*\{\s*max-width:\s*var\(--q-read-col\)/.test(css) && /--q-read-col:\s*860px/.test(css), 'ayah text sits in a centered inner column (~860px) INSIDE the full-width card');
ok(!/width:\s*100vw/.test(css), 'NO width:100vw anywhere');
// no THIRD content px max-width: only 1180 remains as a layout width (drawer uses min(); text uses ch/var)
const pxMax = [...new Set([...css.matchAll(/[;{]\s*max-width:\s*(\d+)px/g)].map(m => m[1]))].sort();
// content boxes share ONE px width (1180); the only other px max-width is the surah MODAL dialog (960) — not a
// content box. Text uses ch/var; cards use max-width:none.
ok(JSON.stringify(pxMax.filter(w => w !== '960')) === JSON.stringify(['1180']), 'the ONLY content px max-width is 1180 (the extra 960 is the surah modal) — found: ' + pxMax.join(','));
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
