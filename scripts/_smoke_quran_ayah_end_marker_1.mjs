// Smoke — QURAN prototype: ayah end-marker extraction (documented ending only) + reassembly invariant.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const s = JSON.parse(fs.readFileSync(path.join(BASE, 'surahs', '021.json'), 'utf8'));
const all = s.pages.flatMap(p => p.ayahs);
const FC0 = 0xFC00;
let markerOk = 0, reassemble = 0, noFcInBody = 0, cpMatch = 0;
for (const a of all) {
  const mcp = parseInt(a.rawEndMarkerCodePoint.replace('U+', ''), 16);
  if (mcp - FC0 + 1 === a.ayah) markerOk++;                         // marker code point == FC00 + (aya-1)
  const marker = String.fromCodePoint(mcp);
  if (a.textUthmaniBody + ' ' + marker === a.textUthmaniRaw) reassemble++;  // body + NBSP + marker == raw, code-point exact
  if (![...a.textUthmaniBody].some(ch => { const c = ch.codePointAt(0); return c >= 0xFB50 && c <= 0xFDFF; })) noFcInBody++; // no FCxx presentation glyph in body
  // raw must end with exactly NBSP + marker (2 trailing code points)
  const arr = [...a.textUthmaniRaw];
  if (arr[arr.length - 2].codePointAt(0) === 0x00A0 && arr[arr.length - 1].codePointAt(0) === mcp) cpMatch++;
}
ok(markerOk === 112, 'all 112: extracted marker == aya_no (FC00 + aya-1)');
ok(reassemble === 112, 'all 112: textUthmaniBody + NBSP + marker === textUthmaniRaw (code-point exact)');
ok(noFcInBody === 112, 'all 112: NO U+FBxx/FCxx presentation glyph inside textUthmaniBody');
ok(cpMatch === 112, 'all 112: raw ends with exactly NBSP(U+00A0) + the marker code point');
ok(all.every(a => a.textUthmaniBody.length < a.textUthmaniRaw.length), 'body is strictly shorter than raw (marker removed)');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
