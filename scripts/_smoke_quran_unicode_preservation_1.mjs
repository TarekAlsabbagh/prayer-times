// Smoke — QURAN prototype: Unicode preservation (derived raw text == source, code-point exact; no mutation).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const HAFS = path.join(SRC, 'hafsData_v2-0.json');
if (!fs.existsSync(HAFS)) { console.log('SKIP — local Quran source cache not present (' + SRC + '); raw-source checks need .quran-source/'); process.exit(0); }
const raw = JSON.parse(fs.readFileSync(HAFS, 'utf8'));
const s = JSON.parse(fs.readFileSync(path.join(BASE, 'surahs', '021.json'), 'utf8'));
const all = s.pages.flatMap(p => p.ayahs);
const srcById = new Map(raw.filter(r => Number(r.sura_no) === 21).map(r => [Number(r.aya_no), r]));
let rawEq = 0, imlaeiEq = 0, nbsp = 0;
for (const a of all) {
  const r = srcById.get(a.ayah);
  if (a.textUthmaniRaw === r.aya_text) rawEq++;               // byte/code-point identical to unmodified source
  if (a.textImlaei === r.aya_text_emlaey) imlaeiEq++;         // search text preserved from source
  if ([...a.textUthmaniRaw].slice(-2)[0].codePointAt(0) === 0x00A0) nbsp++;  // NBSP before the aya mark preserved
}
ok(rawEq === 112, 'all 112: textUthmaniRaw === source aya_text (code-point identical, unmodified)');
ok(imlaeiEq === 112, 'all 112: textImlaei === source aya_text_emlaey (search text preserved)');
ok(nbsp === 112, 'all 112: NBSP (U+00A0) preserved before the aya mark');
// no Private Use Area glyphs anywhere in the display body (KFGQPC data is standard Unicode, not PUA glyphs)
ok(all.every(a => ![...a.textUthmaniBody].some(ch => { const c = ch.codePointAt(0); return c >= 0xE000 && c <= 0xF8FF; })), 'no PUA (U+E000..F8FF) glyphs in any display body');
// dagger alif preserved in body where the source has it (e.g. ٱلرَّحۡمَٰن in 21:26)
const a26 = all.find(a => a.ayah === 26);
ok(a26 && [...a26.textUthmaniRaw].some(ch => ch.codePointAt(0) === 0x0670), '21:26 retains dagger-alif (U+0670) from source');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
