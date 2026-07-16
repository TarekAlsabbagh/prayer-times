// Smoke — QURAN unified shell (REVISION-3, SPA-integrated): the page is served through the REAL index.html
// shell (site .top-header, shared sidebar, footer, app.js) — NOT a standalone document / copied header.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// (1) served through index.html shell (route classified + SSR-injected + page flipped active)
ok(/\(process\.env\.QURAN_PROTOTYPE_ENABLED === '1' && urlPath === '\/quran\/surah\/21'\)/.test(src), 'route added to _isIndexHtmlRoute (flag-gated) — served as index.html shell');
ok(/<div class="page active" id="page-quran-surah">' \+ _buildQuranSurah21Body\(\) \+ '<\/div>/.test(src), 'serveHtmlWithSeo injects the surah body into #page-quran-surah + flips it active');
ok(/html\.replace\('<div class="page active" id="page-prayer-times">', '<div class="page" id="page-prayer-times">'\)/.test(src), 'strips the default prayer-times active (exactly one active page)');
ok(/if \(\/\^\\\/quran\\\/surah\\\/21\$\/\.test\(path\)\) return \{ kind: 'id', value: 'quran-surah-h1' \}/.test(src), '_getActiveH1Marker registers the single quran H1');
// (2) the REAL shell markup lives in index.html (NOT copied into the body builder)
ok(/<div class="page" id="page-quran-surah"><\/div>/.test(idx), 'index.html has the #page-quran-surah container');
ok(/<div class="top-header">/.test(idx) && /<!--SHARED-SIDEBAR-->/.test(idx) && /class="footer site-footer"/.test(idx), 'the real .top-header + shared sidebar + footer are the index.html shell');
ok(!/<!DOCTYPE|<html |<head>|class="menu-toggle"|\$\{_renderSidebar|class="footer site-footer"|<main /.test(b), 'body builder does NOT recreate the shell (no doctype/html/head/menu-toggle/sidebar/footer/main)');
// (3) app.js recognizes the route in BOTH activation sites (no flash-to-home)
ok(/if \(\/\^\\\/quran\\\/surah\\\/21\$\/\.test\(window\.location\.pathname\)/.test(app), 'app.js initApp activates #page-quran-surah');
ok(/\} else if \(\/\^\\\/quran\\\/surah\\\/21\$\/\.test\(_path\)\) \{[\s\S]*_expectedId = 'page-quran-surah'/.test(app), 'app.js pageshow self-heal keeps #page-quran-surah (no flash-to-home)');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
