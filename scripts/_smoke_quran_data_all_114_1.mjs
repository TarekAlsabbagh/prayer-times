// Smoke — Tanzil model: all 114 surah files structurally sound (flat schema, Tanzil-sourced, no legacy fields).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const LEGACY = ['page','firstPage','lastPage','pageCount','pages','lineStart','lineEnd','textUthmaniRaw','textImlaei','rawEndMarkerCodePoint','rawEndSeparatorCodePoint'];
const chapters = JSON.parse(fs.readFileSync(path.join(BASE,'metadata','chapters.json'),'utf8'));
ok(chapters.length === 114, 'chapters.json has 114 entries');
let total = 0; const nums = [];
for (let n = 1; n <= 114; n++) {
  const s = JSON.parse(fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'),'utf8'));
  nums.push(s.surah);
  ok(s.surah === n, n+': surah number matches file');
  ok(s.ayahs.length === s.ayahCount, n+': ayahs.length === ayahCount');
  ok(s.ayahs.every((a,i)=>a.ayah===i+1), n+': ayah numbers sequential 1..N');
  ok(typeof s.nameAr==='string' && s.nameAr.length>0, n+': nameAr present');
  ok(typeof s.nameEn==='string' && s.nameEn.length>0, n+': nameEn present');
  ok(Array.isArray(s.juz) && s.juz.length>=1 && s.juz.every(j=>j>=1&&j<=30), n+': juz array from Tanzil meta (1..30)');
  ok(s.source === 'Tanzil Uthmani 1.1', n+': source is Tanzil Uthmani 1.1');
  ok(!LEGACY.some(k=>k in s) && s.ayahs.every(a=>!LEGACY.some(k=>k in a)), n+': no legacy KFGQPC fields');
  total += s.ayahs.length;
}
ok(nums.join(',') === Array.from({length:114},(_,i)=>i+1).join(','), 'surah numbers are 1..114 sequential');
ok(total === 6236, 'total ayah count is 6236 (got '+total+')');
console.log('RESULT data_all_114(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail) process.exit(1);
