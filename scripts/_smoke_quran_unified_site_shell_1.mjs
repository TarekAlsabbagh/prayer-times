// Smoke — QURAN unified shell (REVISION-3, SPA-integrated): the page is served through the REAL index.html
// shell (site .top-header, shared sidebar, footer, app.js) — NOT a standalone document / copied header.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurahBody(n)');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// (1) served through index.html shell (route classified + SSR-injected + page flipped active)
ok(/\(!!_quranSurahRoute\(urlPath\)\) \|\|/.test(src) && !/QURAN_PROTOTYPE_ENABLED/.test(src), 'route added to _isIndexHtmlRoute UNCONDITIONALLY (exact slug match; QURAN_PROTOTYPE_ENABLED gate removed at public release) — served as index.html shell');
ok(/<div class="page active" id="page-quran-surah">' \+ _buildQuranSurahBody\(_qsPage\.n\) \+ '<\/div>/.test(src), 'serveHtmlWithSeo injects the REQUESTED surah body into #page-quran-surah + flips it active');
ok(/html\.replace\('<div class="page active" id="page-prayer-times">', '<div class="page" id="page-prayer-times">'\)/.test(src), 'strips the default prayer-times active (exactly one active page)');
ok(/if \(_quranSurahRoute\(path\)\) return \{ kind: 'id', value: 'quran-surah-h1' \}/.test(src), '_getActiveH1Marker registers the single quran H1 for every surah route');
// (2) the REAL shell markup lives in index.html (NOT copied into the body builder)
ok(/<div class="page" id="page-quran-surah"><\/div>/.test(idx), 'index.html has the #page-quran-surah container');
ok(/<div class="top-header">/.test(idx) && /<!--SHARED-SIDEBAR-->/.test(idx) && /class="footer site-footer"/.test(idx), 'the real .top-header + shared sidebar + footer are the index.html shell');
ok(!/<!DOCTYPE|<html |<head>|class="menu-toggle"|\$\{_renderSidebar|class="footer site-footer"|<main /.test(b), 'body builder does NOT recreate the shell (no doctype/html/head/menu-toggle/sidebar/footer/main)');
// (3) app.js recognizes the route in BOTH activation sites (no flash-to-home).
// The client matches the slug SHAPE and deliberately carries no slug list — the table is the server's, and a
// copied one would drift. That makes the DOM half load-bearing, not decorative: `/quran/anything-else` has the
// same shape, and only a real surah route gets `.quran-surah-page` injected. Each site is asserted as the PAIR
// (shape && DOM) — a lone shape test would activate an empty page on any /quran/xyz.
const SHAPE = String.raw`\/\^\\\/quran\\\/\[a-z0-9\]\+\(\?:-\[a-z0-9\]\+\)\*\$\/`;
ok(new RegExp(`if \\(${SHAPE}\\.test\\(window\\.location\\.pathname\\)\\s*&&\\s*document\\.querySelector\\('#page-quran-surah \\.quran-surah-page'\\)`).test(app),
   'app.js initApp activates #page-quran-surah on the slug shape AND only when the server injected a body');
ok(new RegExp(`\\} else if \\(${SHAPE}\\.test\\(_path\\)\\s*&&\\s*document\\.querySelector\\('#page-quran-surah \\.quran-surah-page'\\)\\) \\{[\\s\\S]*?_expectedId = 'page-quran-surah'`).test(app),
   'app.js pageshow self-heal keeps #page-quran-surah on the same pair (no flash-to-home, no empty page)');
const SLUGS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/quran/tanzil-uthmani-1-1/metadata/surah-routes.json'), 'utf8')).surahs;
const leaked = SLUGS.filter(r => app.includes(r.path));
ok(leaked.length === 0, 'app.js carries NOT ONE of the 114 slug paths — the routes table stays the server\'s alone'
   + (leaked.length ? ' — leaked: ' + JSON.stringify(leaked.slice(0, 3).map(r => r.path)) : ''));
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
