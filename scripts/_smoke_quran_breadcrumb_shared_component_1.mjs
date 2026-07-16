// Smoke — QURAN REVISION-2: breadcrumb is the SITE's shared component (not redesigned in quran.css).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'quran.css'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
const bc = b.slice(b.indexOf('class="moon-breadcrumb"'), b.indexOf('</nav>', b.indexOf('class="moon-breadcrumb"')));
ok(/class="moon-breadcrumb"/.test(b), 'uses the shared .moon-breadcrumb wrapper');
ok(/<ol class="breadcrumb-list">/.test(bc), 'uses the shared .breadcrumb-list');
ok((bc.match(/class="bc-item/g) || []).length === 3, 'three bc-item rungs (home / القرآن الكريم / current)');
ok(/class="bc-sep" aria-hidden="true">›</.test(bc), 'uses the shared › separators (.bc-sep)');
ok(/<a class="bc-link" href="\/">الرئيسية<\/a>/.test(bc), 'الرئيسية is a REAL link to /');
ok(!/href="\/quran/.test(bc), 'NO link to /quran (route is 404 — kept non-clickable)');
ok(/<span aria-current="page">سورة الأنبياء<\/span>/.test(bc), 'current page has aria-current="page" and is not a link');
// quran.css must NOT redefine the breadcrumb component
ok(!/\.breadcrumb-list\s*\{/.test(css) && !/\.bc-item\s*\{/.test(css) && !/\.bc-link\s*\{/.test(css) && !/\.bc-sep\s*\{/.test(css), 'quran.css does NOT redefine .breadcrumb-list/.bc-* (shared component reused, not restyled)');
ok(!/quran-crumbs/.test(b) && !/quran-crumbs/.test(css), 'the old bespoke .quran-crumbs breadcrumb is gone');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
