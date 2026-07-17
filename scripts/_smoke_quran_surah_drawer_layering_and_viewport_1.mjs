// Smoke — QURAN surah modal layering + viewport (P0 fix). ONE modal, shared by every "browse surahs" button,
// PORTALED to <body> so no overflow:clip / low-z-index ancestor hides it behind the sidebar. Overlay above the
// sidebar (1100); modal above the overlay; both below the site's 9999 dialogs. Content-area-centered on desktop
// (right offset = sidebar width), full-screen sheet on phones. Full a11y: scroll-lock, focus-trap, Escape,
// overlay-click, focus-return, background inert. Prototype: only Al-Anbiya active, no /surah/{20,22} links.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
const js  = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = srv.indexOf('function _buildQuranSurahBody(n)');
const b = srv.slice(b0, srv.indexOf('// ===== HTTP Server =====', b0));

// --- ONE modal, dialog semantics, shared by ALL browse buttons ---
ok((b.match(/id="quran-index"/g) || []).length === 1, 'exactly ONE modal element (no duplicate id)');
ok(/class="quran-surah-modal" id="quran-index" role="dialog" aria-modal="true" aria-labelledby="quran-index-title"/.test(b), 'modal is role=dialog aria-modal with aria-labelledby');
ok((b.match(/_quranBrowseCta\(/g) || []).length >= 2, 'opened from ≥2 CTAs (hero + surah-end) — all share ONE modal');
ok(/id="quran-index-title"/.test(b) && /data-quran-surah-filter/.test(b) && /data-quran-close-index/.test(b), 'modal head has title + filter + close');

// --- CSS layering: overlay + modal ABOVE the site sidebar (1100), content-area centered, scrollable, sheet on mobile ---
const ovZ = (css.match(/\.quran-index-overlay\s*\{[^}]*z-index:\s*(\d+)/) || [])[1];
const mdZ = (css.match(/\.quran-surah-modal\s*\{[^}]*z-index:\s*(\d+)/) || [])[1];
ok(ovZ && +ovZ > 1100, 'overlay z-index is ABOVE the site sidebar (1100) — got ' + ovZ);
ok(mdZ && +mdZ > +ovZ && +mdZ < 9999, 'modal z-index is above the overlay and below the 9999 dialogs — got ' + mdZ);
ok(/\.quran-surah-modal\s*\{[^}]*position:\s*fixed/.test(css), 'modal is position:fixed (viewport-anchored, escapes overflow:clip)');
ok(/\.quran-surah-modal\s*\{[^}]*right:\s*calc\(var\(--q-sidebar-w/.test(css), 'modal right offset reserves the sidebar width (stays in the content area)');
ok(/\.quran-surah-modal\s*\{[^}]*max-width:\s*960px/.test(css), 'modal max-width ~960px');
ok(/\.quran-surah-modal-body\s*\{[^}]*overflow-y:\s*auto/.test(css), 'the surah list scrolls INSIDE the modal (sticky head)');
ok(/body\.quran-modal-open\s*\{\s*overflow:\s*hidden/.test(css), 'background page scroll is locked while the modal is open');
ok(/@media\s*\(max-width:\s*768px\)[\s\S]*\.quran-surah-modal\s*\{[^}]*(left|right):\s*env\(safe-area/.test(css), 'mobile → full-screen sheet inside the safe areas');
// NOT hidden in reading mode (must be usable over the reading view)
ok(!/body\.quran-reading[^{]*\.quran-surah-modal[^{]*\{[^}]*display:\s*none/.test(css), 'modal is NOT hidden in reading mode');

// --- JS: portal + full a11y ---
ok(/document\.body\.appendChild\(modal\)/.test(js) && /document\.body\.appendChild\(idxOverlay\)/.test(js), 'PORTAL: modal + overlay relocated to <body>');
ok(/document\.body\.classList\.add\('quran-modal-open'\)/.test(js), 'scroll-lock class toggled on open');
ok(/function setBackgroundInert/.test(js) && /\.inert = true/.test(js), 'background is made inert while the modal is open');
ok(/Escape|keyCode === 27/.test(js) && /closeIndex\(\)/.test(js), 'Escape closes the modal');
ok(/idxOverlay\.addEventListener\('click', closeIndex\)/.test(js), 'clicking the overlay closes the modal');
ok(/e\.key === 'Tab'|keyCode === 9/.test(js) && /focusables\(\)/.test(js), 'focus trap on Tab');
ok(/lastOpener[\s\S]{0,40}\.focus\(\)/.test(js), 'focus returns to the button that opened the modal');
ok(/data-quran-surah-filter/.test(js) && /li\.hidden = !match/.test(js), 'in-modal filter shows/hides surah items');

// --- link safety: the drawer never emits a URL from the retired numeric structure ---
ok(!/href="\/quran\/surah\//.test(b), 'NO /quran/surah/… link survives in the surah body (that structure is retired → 404)');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); } else console.log('  surah modal layering + viewport OK');
