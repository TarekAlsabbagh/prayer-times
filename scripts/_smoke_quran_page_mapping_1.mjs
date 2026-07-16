// Smoke — QURAN prototype: page-group mapping (10 reference pages 322..331) integrity.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const s = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'surahs', '021.json'), 'utf8'));
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
ok(s.pages.length === 10, 'exactly 10 reference-page groups');
ok(s.pages.map(p => p.page).join(',') === '322,323,324,325,326,327,328,329,330,331', 'groups are 322..331 in order');
ok(s.pages.reduce((n, p) => n + p.ayahs.length, 0) === 112, 'page groups cover all 112 ayat (sum)');
ok(s.pages.every(p => p.ayahs.length >= 1), 'no empty page group');
ok(s.pages.every(p => p.ayahs.every(a => a.page === p.page)), 'each ayah page == its group page');
ok(s.pages.every(p => p.ayahs.every((a, i) => i === 0 || a.ayah === p.ayahs[i - 1].ayah + 1)), 'ayahs ascend within each group');
// cross-group continuity: last ayah of group N + 1 == first ayah of group N+1
let cont = true; for (let i = 1; i < s.pages.length; i++) { if (s.pages[i].ayahs[0].ayah !== s.pages[i - 1].ayahs.at(-1).ayah + 1) cont = false; }
ok(cont, 'ayah numbering is continuous across the 10 page groups');
ok(s.pages.every(p => typeof p.juz === 'number' && p.juz === 17), 'each group carries juz 17 (from source)');
ok(s.pages[0].ayahs[0].ayah === 1 && s.pages.at(-1).ayahs.at(-1).ayah === 112, 'first group starts at 21:1, last ends at 21:112');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
