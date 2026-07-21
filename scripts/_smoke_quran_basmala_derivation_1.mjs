// Smoke — Tanzil model: basmala policy (Fatiha 1:1 / Tawba none / Naml 27:30 / 112 separate / 0 merged / 6236).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const xml = fs.readFileSync(path.join(BASE,'vendor','quran-uthmani-1.1.xml'),'utf8');
const dec = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const bism = new Map(); let sm; const sr = /<sura\s+index="(\d+)"\s+name="[^"]*"\s*>([\s\S]*?)<\/sura>/g;
while ((sm = sr.exec(xml))) { const s=+sm[1]; const m=sm[2].match(/<aya\s+index="1"\s+text="[^"]*"\s+bismillah="([^"]*)"\s*\/>/); if (m) bism.set(s, dec(m[1])); }
const basmala = JSON.parse(fs.readFileSync(path.join(BASE,'metadata','basmala.json'),'utf8'));
const S = n => JSON.parse(fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'),'utf8'));
const modes = {}; let total = 0, merged = 0;
for (let n = 1; n <= 114; n++) { const s = S(n); modes[s.basmalaMode]=(modes[s.basmalaMode]||0)+1; total += s.ayahs.length;
  if (n !== 1 && n !== 9 && s.ayahs[0].textUthmaniBody.startsWith(basmala.textUthmaniBody)) merged++; }
ok(total === 6236, '6236 ayat total');
ok(basmala.textUthmaniBody === bism.get(2), 'basmala display == Tanzil sura-2 bismillah (verbatim)');
ok(S(1).basmalaMode === 'first-ayah', 'Al-Fatiha basmalaMode first-ayah (basmala IS 1:1)');
ok(S(9).basmalaMode === 'none' && !bism.has(9), 'At-Tawba basmalaMode none, no bismillah');
ok(!!S(27).ayahs.find(a=>a.ayah===30), 'An-Naml 27:30 present (its in-verse basmala untouched)');
ok(modes['separate']===112 && modes['none']===1 && modes['first-ayah']===1, 'modes: separate=112 none=1 first-ayah=1');
ok(merged === 0, 'no verse-1 has the basmala merged into its text');
console.log('RESULT basmala_derivation(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail) process.exit(1);
