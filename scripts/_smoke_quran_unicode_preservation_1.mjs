// Smoke — Tanzil model: verse text preserved codepoint-by-codepoint (no normalization/trim/collapse/mojibake).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const xml = fs.readFileSync(path.join(BASE,'vendor','quran-uthmani-1.1.xml'),'utf8');
const dec = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const src = new Map(); let sm; const sr = /<sura\s+index="(\d+)"\s+name="[^"]*"\s*>([\s\S]*?)<\/sura>/g;
while ((sm = sr.exec(xml))) { const s=+sm[1]; let am; const ar=/<aya\s+index="(\d+)"\s+text="([^"]*)"(?:\s+bismillah="[^"]*")?\s*\/>/g;
  while ((am = ar.exec(sm[2]))) src.set(s+':'+ +am[1], dec(am[2])); }
let exact = 0, nfc = 0, trimmed = 0, dbl = 0, repl = 0;
for (let n = 1; n <= 114; n++) { const s = JSON.parse(fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'),'utf8'));
  for (const a of s.ayahs) { const t = a.textUthmaniBody, u = src.get(n+':'+a.ayah);
    if (t === u) exact++;
    if (t.normalize('NFC') !== t && t === u) {} // source itself may be non-NFC; we only forbid US changing it
    if (t !== u && t.normalize('NFC') === u) nfc++;         // a difference caused by NFC normalization
    if (t !== u && t.trim() === u) trimmed++;               // a difference caused by trimming
    if (t !== u && t.replace(/ +/g,' ') === u) dbl++;       // a difference caused by space-collapsing
    if (t.includes('�')) repl++;
  } }
ok(exact === 6236, 'all 6236 verse texts byte-for-byte equal to source (got '+exact+')');
ok(nfc === 0, 'no verse changed by Unicode NFC normalization');
ok(trimmed === 0, 'no verse changed by trimming');
ok(dbl === 0, 'no verse changed by space-collapsing');
ok(repl === 0, 'zero U+FFFD replacement characters (no mojibake)');
console.log('RESULT unicode_preservation(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail) process.exit(1);
