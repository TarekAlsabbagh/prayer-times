// Smoke — QURAN sticky reading bar (P0 fix). The reading toolbar + progress live in ONE sticky wrapper that
// docks BELOW the real site header (top from the MEASURED header height, not a magic number), re-docks to the
// top in reading mode, sits below header/sidebar/modal but above the cards, and drives scroll-margin so
// jump targets are never hidden behind it. No stray position:fixed / width:100vw / duplicate toolbar.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
const js  = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = srv.indexOf('function _buildQuranSurah21Body()');
const b = srv.slice(b0, srv.indexOf('// ===== HTTP Server =====', b0));

// --- markup: ONE sticky wrapper holding the toolbar AND the progress bar ---
ok((b.match(/class="quran-reading-sticky"/g) || []).length === 1, 'exactly ONE .quran-reading-sticky wrapper');
ok((b.match(/class="quran-toolbar"/g) || []).length === 1, 'exactly ONE toolbar (no duplicate)');
const w0 = b.indexOf('class="quran-reading-sticky"');
const wEnd = b.indexOf('${pagesHtml}', w0);
const wrap = b.slice(w0, wEnd);
ok(/class="quran-toolbar"/.test(wrap) && /class="quran-progress"/.test(wrap), 'toolbar + progress are BOTH inside the sticky wrapper');

// --- CSS: sticky (not fixed), measured top, reading-mode top, z-index below header, no 100vw ---
ok(/\.quran-reading-sticky\s*\{[^}]*position:\s*sticky/.test(css), 'wrapper is position:sticky');
ok(/\.quran-reading-sticky\s*\{[^}]*top:\s*var\(--q-reading-sticky-top/.test(css), 'sticky top uses the measured --q-reading-sticky-top var');
ok(/--q-reading-sticky-top:\s*var\(--q-header-h/.test(css), '--q-reading-sticky-top derives from the measured header height (--q-header-h)');
ok(/body\.quran-reading \.quran-reading-sticky\s*\{\s*top:\s*max\(0px,\s*env\(safe-area-inset-top\)\)/.test(css), 'reading mode re-docks the bar to the top (top → safe-area)');
const stZ = (css.match(/\.quran-reading-sticky\s*\{[^}]*z-index:\s*(\d+)/) || [])[1];
ok(stZ && +stZ < 1000 && +stZ > 1, 'sticky z-index sits below the header (1000) and above the cards — got ' + stZ);
ok(!/\.quran-reading-sticky\s*\{[^}]*position:\s*fixed/.test(css) && !/\.quran-toolbar\s*\{[^}]*position:\s*fixed/.test(css), 'no arbitrary position:fixed on the bar');
ok(!/quran-(reading-sticky|toolbar)[^}]*width:\s*100vw/.test(css), 'no width:100vw on the bar');

// --- scroll-margin so jumps clear the header + sticky bar (reading mode = bar only) ---
ok(/\.quran-ayah\s*\{[^}]*scroll-margin-top:\s*var\(--q-scroll-margin/.test(css), 'ayah scroll-margin-top uses --q-scroll-margin');
ok(/\.quran-page-card\s*\{[^}]*scroll-margin-top:\s*var\(--q-scroll-margin/.test(css), 'page-card scroll-margin-top uses --q-scroll-margin');
ok(/--q-scroll-margin:\s*calc\(var\(--q-header-h[^)]*\)\s*\+\s*var\(--q-sticky-h/.test(css), '--q-scroll-margin = header + sticky-bar height + safety');

// --- JS measures the real header height into the CSS var (ResizeObserver), re-measures on reading toggle ---
ok(/function measureChrome\(\)/.test(js), 'measureChrome() present');
ok(/setProperty\('--q-header-h'/.test(js) && /setProperty\('--q-sticky-h'/.test(js), 'measureChrome sets --q-header-h + --q-sticky-h');
ok(/new ResizeObserver\(measureChrome\)/.test(js), 'a ResizeObserver keeps the measured header height current');
ok(/toggleReading[\s\S]{0,160}measureChrome\(\)/.test(js), 'reading toggle re-measures the chrome (header shows/hides)');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); } else console.log('  sticky reading bar OK');
