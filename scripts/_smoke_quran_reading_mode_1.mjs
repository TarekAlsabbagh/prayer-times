// Smoke — QURAN reading mode (REVISION-4): a TRUE focused reading experience. The reading-mode CSS hides
// ALL site + page chrome (site header + footer + breadcrumb + hero + services + progress + surah-end +
// about + source + FAQ) and keeps only the Quran cards + a MINIMIZED bar with a clear "exit reading mode"
// button. Toggled via the EXISTING quran.js handler (no new global); the ayah text / position are untouched.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const js  = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = srv.indexOf('function _buildQuranSurahBody(n)');
const b = srv.slice(b0, srv.indexOf('// ===== HTTP Server =====', b0));

// --- markup: a clear, labelled exit button that REUSES the existing reading toggle action ---
ok(/class="quran-tool-btn quran-reading-exit" type="button" data-quran-action="reading"/.test(b), 'exit button present + reuses the reading toggle action');
ok(b.includes('quran-reading-exit-label">الخروج من وضع القراءة'), 'exit button carries a clear "exit reading mode" label');
ok(/class="quran-tool-btn quran-reading-enter"/.test(b), 'the enter "reading mode" button is tagged (hidden in reading mode)');

// --- CSS: reading mode hides ALL site chrome (header, footer, next-prayer bar, sidebar rail, mobile menu
//     button) AND the whole page chrome ---
['.top-header', '.site-footer', '#sticky-next-bar', '#sidebar', '.menu-toggle', '.moon-breadcrumb',
 '.quran-hero', '.quran-services', '.quran-progress', '.quran-surah-end', '.quran-about',
 '.quran-naming', '.quran-topics', '.quran-tools',
 '.quran-source-box', '.quran-faq', '.moon-events-section'].forEach(sel => {
  ok(css.includes('body.quran-reading ' + sel), 'reading mode hides ' + sel);
});
// the desktop sidebar's reserved space is reclaimed so the reading column re-centers
ok(css.includes('body.quran-reading .main-content { margin-right: 0'), 'reading mode zeroes the sidebar margin reservation');
// the { display: none; } terminator for that hide list is present
ok(/body\.quran-reading \.moon-events-section \{ display: none; \}/.test(css), 'reading-mode hide-list (extended to the reused events section) terminates with display:none');

// --- CSS: the minimized bar drops the non-essential controls + the enter button ---
['body.quran-reading .quran-toolbar [data-quran-action="top"]',
 'body.quran-reading .quran-toolbar .quran-tool-spacer',
 'body.quran-reading .quran-toolbar .quran-ayah-jump',
 'body.quran-reading .quran-toolbar .quran-page-jump',
 'body.quran-reading .quran-reading-enter'].forEach(sel => {
  ok(css.includes(sel), 'minimized bar hides: ' + sel);
});
// exit button: hidden by default, shown (prominent) in reading mode
ok(css.includes('.quran-reading-exit { display: none; }'), 'exit button hidden outside reading mode');
ok(/body\.quran-reading \.quran-reading-exit \{ display: inline-flex/.test(css), 'exit button shown in reading mode');

// --- the toggle is driven by the EXISTING handler (no new global); NOTHING re-scrolls the reader ---
ok(/a === 'reading'/.test(js) && /function toggleReading/.test(js), 'reading toggled via the existing quran.js handler');
ok(!/scrollTo\(0/.test(js.slice(js.indexOf('function toggleReading'), js.indexOf('function toggleReading') + 220)), 'toggling reading mode does not reset scroll position');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
