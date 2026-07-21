// Smoke — Tanzil model: 6236/6236 generated verse texts are codepoint-identical to the official Tanzil vendor XML.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const xml = fs.readFileSync(path.join(BASE,'vendor','quran-uthmani-1.1.xml'),'utf8');
const dec = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const src = new Map(); let sm; const sr = /<sura\s+index="(\d+)"\s+name="[^"]*"\s*>([\s\S]*?)<\/sura>/g;
while ((sm = sr.exec(xml))) { const s=+sm[1]; let am; const ar=/<aya\s+index="(\d+)"\s+text="([^"]*)"(?:\s+bismillah="[^"]*")?\s*\/>/g;
  while ((am = ar.exec(sm[2]))) src.set(s+':'+ +am[1], dec(am[2])); }
ok(src.size === 6236, 'vendor XML has 6236 verses');
let same = 0, diff = 0;
for (let n = 1; n <= 114; n++) { const s = JSON.parse(fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'),'utf8'));
  for (const a of s.ayahs) { if (a.textUthmaniBody === src.get(n+':'+a.ayah)) same++; else diff++; } }
ok(same === 6236, '6236/6236 verse texts identical to official Tanzil source');
ok(diff === 0, 'zero verses differ from source');
console.log('RESULT full_source_integrity_6236(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail === 0) console.log('  6236/6236 VERSE TEXTS IDENTICAL TO OFFICIAL TANZIL SOURCE');
if (fail) process.exit(1);
