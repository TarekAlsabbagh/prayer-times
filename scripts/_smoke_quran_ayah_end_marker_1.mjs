// Smoke — Tanzil model: NO KFGQPC end-of-ayah marker (U+FC00) / no Private-Use chars; ayah number is data, not text.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
let fc00 = 0, pua = 0, marker = 0, badAyah = 0, total = 0;
for (let n = 1; n <= 114; n++) {
  const s = JSON.parse(fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'),'utf8'));
  for (const a of s.ayahs) {
    total++;
    if ('rawEndMarkerCodePoint' in a) marker++;
    if (typeof a.ayah !== 'number') badAyah++;
    for (const ch of a.textUthmaniBody) { const c = ch.codePointAt(0);
      if (c === 0xFC00) fc00++; if (c >= 0xE000 && c <= 0xF8FF) pua++; if (c >= 0xFC00 && c <= 0xFDFF) fc00++; }
  }
}
ok(total === 6236, '6236 ayat scanned');
ok(fc00 === 0, 'zero U+FC00 / presentation-form markers in verse text');
ok(pua === 0, 'zero Private-Use-Area characters in verse text');
ok(marker === 0, 'no rawEndMarkerCodePoint field remains');
ok(badAyah === 0, 'ayah number is an independent numeric field (not derived from a text glyph)');
console.log('RESULT ayah_end_marker(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail) process.exit(1);
