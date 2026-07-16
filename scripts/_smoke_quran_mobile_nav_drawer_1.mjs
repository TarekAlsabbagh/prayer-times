// Smoke — QURAN mobile nav (REVISION-3, SPA-integrated): the site drawer comes from the REAL index.html
// header + app.js (NOT redefined here); the surah-index drawer opens/closes with focus + Escape.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'js', 'quran.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
// (a) the site drawer is the REAL index.html one (menu-toggle + overlay + toggleSidebar live in the shell/app.js)
ok(/class="menu-toggle" onclick="toggleSidebar\(\)"/.test(idx), 'index.html has the site menu-toggle (calls toggleSidebar)');
ok(/class="sidebar-overlay" onclick="toggleSidebar\(\)"/.test(idx), 'index.html has the sidebar-overlay');
ok(!/toggleSidebar|toggleTheme/.test(js) || !/window\.toggleSidebar\s*=/.test(js), 'quran.js does NOT redefine the site globals (toggleSidebar/toggleTheme come from app.js)');
ok(/window\.toggleTheme/.test(js), 'quran.js delegates the theme button to the site toggleTheme');
// (b) surah-index drawer + its client behaviour
ok(/id="quran-index"/.test(b) && /aria-hidden="true"/.test(b), 'surah-index drawer present (aria-hidden default)');
ok(/data-quran-surah-browser-trigger/.test(src) && /data-quran-close-index/.test(b), 'open (shared surah-browser trigger) + close triggers present');
ok(/function openIndex\(/.test(js) && /function closeIndex\(/.test(js), 'quran.js open/close index (modal)');
ok(/is-open/.test(js) && /aria-hidden/.test(js), 'quran.js toggles drawer visibility + aria-hidden');
ok(/e\.key === 'Escape'/.test(js), 'quran.js closes the drawer on Escape');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
