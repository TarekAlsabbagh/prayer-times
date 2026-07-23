// Smoke — Tanzil model: PROVES the KFGQPC Madinah-mushaf page/line layout is GONE (flat ayah sequence).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const LAYOUT = ['page','firstPage','lastPage','pageCount','pages','lineStart','lineEnd','lineNumber','pageNumber'];
for (let n = 1; n <= 114; n++) { const s = JSON.parse(fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'),'utf8'));
  ok(Array.isArray(s.ayahs), n+': flat ayahs array');
  ok(!LAYOUT.some(k=>k in s) && s.ayahs.every(a=>!LAYOUT.some(k=>k in a)), n+': no page/line layout fields'); }
const server = fs.readFileSync(path.join(ROOT,'server.js'),'utf8');
ok(!/surah\.pages\b/.test(server), 'server.js: no surah.pages consumption');
ok(!/pageOptions|quran-page-jump|data-quran-page-jump/.test(server), 'server.js: no page-jump control');
ok(!/الصفحة المرجعية|الصفحات المرجعية/.test(server), 'server.js: no reference-mushaf-page wording');
ok(!/_quranPageRangeAr/.test(server), 'server.js: dead page-range helper removed');
console.log('RESULT page_mapping(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail) process.exit(1);
