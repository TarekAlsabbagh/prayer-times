// Smoke — QURAN cross-links to the rest of the site use ONLY real, existing routes (root/Arabic),
// and NEVER link to an unbuilt /quran hub. (Route liveness is verified separately against the server.)
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const m = src.match(/const _QURAN_SERVICE_LINKS = \[([\s\S]*?)\];/);
ok(!!m, '_QURAN_SERVICE_LINKS table defined');
const block = m ? m[1] : '';
const hrefs = [...block.matchAll(/\['([^']+)'/g)].map(x => x[1]);
ok(hrefs.length >= 6, 'at least 6 service links (' + hrefs.length + ')');
// every expected route (all confirmed 200 on the server)
['/', '/qibla', '/moon-today', '/azkar/morning-azkar', '/azkar/evening-azkar', '/hijri-calendar', '/zakat-calculator', '/msbaha'].forEach(r =>
  ok(hrefs.includes(r), 'service route present: ' + r));
// hard guards: no unbuilt hub, no language-prefixed or off-site links
ok(!hrefs.some(h => h.startsWith('/quran')), 'NO link to an unbuilt /quran hub');
ok(hrefs.every(h => h === '/' || /^\/[a-z0-9/-]+$/.test(h)), 'all hrefs are clean root paths');
ok(!hrefs.some(h => /^\/(en|fr|tr|ur|de|id|es|bn|ms)\//.test(h)), 'no language-prefixed routes (Arabic page = root routes)');
ok(!hrefs.some(h => /^https?:/.test(h)), 'no external absolute links');
// the builder actually renders the links section
const b0 = src.indexOf('function _buildQuranSurah21Body()');
const b = src.slice(b0, src.indexOf('// ===== HTTP Server =====', b0));
ok(/_quranServiceLinksHtml\(/.test(b), 'builder renders the service-links section');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
