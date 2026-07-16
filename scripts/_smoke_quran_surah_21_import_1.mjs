// Smoke — QURAN prototype: raw import integrity + surah 21 (Al-Anbiya) structure.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const HAFS = path.join(SRC, 'hafsData_v2-0.json');
if (!fs.existsSync(HAFS)) { console.log('SKIP — local Quran source cache not present (' + SRC + '); raw-source checks need .quran-source/'); process.exit(0); }
const raw = JSON.parse(fs.readFileSync(HAFS, 'utf8'));
ok(raw.length === 6236, 'raw source has EXACTLY 6236 ayat');
ok(new Set(raw.map(r => Number(r.sura_no))).size === 114, 'raw source has 114 suras');
const s = JSON.parse(fs.readFileSync(path.join(BASE, 'surahs', '021.json'), 'utf8'));
ok(s.surah === 21 && s.ayahCount === 112, 'surah 21 with 112 ayat');
ok(s.firstPage === 322 && s.lastPage === 331 && s.pageCount === 10, 'pages 322..331 (10 groups)');
const all = s.pages.flatMap(p => p.ayahs);
ok(all.length === 112, 'exactly 112 ayah entries across the page groups');
ok(all.every((a, i) => a.ayah === i + 1), 'ayahs 1..112 in sequence, no gap/dup');
ok(all[0].ayah === 1 && all[all.length - 1].ayah === 112, 'first ayah 21:1, last ayah 21:112');
const pgList = s.pages.map(p => p.page);
ok(JSON.stringify(pgList) === JSON.stringify([322,323,324,325,326,327,328,329,330,331]), 'page groups ordered 322..331');
ok(s.pages.every(p => p.ayahs.every(a => a.page === p.page)), 'every ayah sits under its own page group');
ok(new Set(all.map(a => a.page)).size === 10 && [...new Set(all.map(a => a.page))].every(p => p >= 322 && p <= 331), 'no page outside 322..331');
ok(raw.filter(r => Number(r.sura_no) === 21).length === 112, 'source surah 21 also = 112 ayat');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
