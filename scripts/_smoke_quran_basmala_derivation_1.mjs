// Smoke — QURAN prototype: basmala derived from record 1:1 (never hand-written).
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const HAFS = path.join(SRC, 'hafsData_v2-0.json');
if (!fs.existsSync(HAFS)) { console.log('SKIP — local Quran source cache not present (' + SRC + '); raw-source checks need .quran-source/'); process.exit(0); }
const raw = JSON.parse(fs.readFileSync(HAFS, 'utf8'));
const b = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', 'basmala.json'), 'utf8'));
const r11 = raw.find(r => Number(r.sura_no) === 1 && Number(r.aya_no) === 1);
const NBSP = 0x00A0;
ok(b.derivedFrom === '1:1', 'basmala.derivedFrom === "1:1"');
ok(b.textUthmaniRaw === r11.aya_text, 'basmala raw == source record 1:1 aya_text (derived, not hand-written)');
// reassembly WITHOUT typing the separator: raw = body + NBSP + marker (code-point exact)
const mcp = parseInt(b.rawEndMarkerCodePoint.replace('U+', ''), 16);
const arr = [...b.textUthmaniRaw];
ok(b.textUthmaniRaw.startsWith(b.textUthmaniBody) && arr.at(-1) === String.fromCodePoint(mcp) && arr.at(-2).codePointAt(0) === NBSP && arr.length === [...b.textUthmaniBody].length + 2,
   'basmala reassembles: textUthmaniBody + NBSP(U+00A0) + marker === raw (code-point exact)');
ok(![...b.textUthmaniBody].some(ch => { const c = ch.codePointAt(0); return c >= 0xFB50 && c <= 0xFDFF; }), 'basmala body has NO FCxx presentation glyph');
ok(b.rawEndMarkerCodePoint === 'U+FC00', 'basmala marker is U+FC00 (aya 1)');
ok(b.sha256 === crypto.createHash('sha256').update(b.textUthmaniBody, 'utf8').digest('hex').toUpperCase(), 'basmala.sha256 matches its body');
ok(Array.isArray(b.codePointsBody) && b.codePointsBody.length === [...b.textUthmaniBody].length, 'codePointsBody enumerated');
// display-rule data assertions (Fatiha / Tawbah / Naml) — needles built from code points (harakat-agnostic)
const bism = String.fromCharCode(0x0628, 0x0633, 0x0645);                                      // بسم
const bismAllah = String.fromCharCode(0x0628, 0x0633, 0x0645, 0x0020, 0x0627, 0x0644, 0x0644, 0x0647); // بسم الله
ok(!raw.find(r => Number(r.sura_no) === 9 && Number(r.aya_no) === 0) && !raw.find(r => Number(r.sura_no) === 9).aya_text_emlaey.startsWith(bism), 'Tawbah (9): NO basmala (no aya 0; first ayah does not start with بسم)');
ok([...r11.aya_text].slice(0, 3).map(c => c.codePointAt(0)).join(',') === '1576,1616,1587', 'Fatiha (1): basmala IS ayah 1 (starts بِسۡ)');
ok(raw.find(r => Number(r.sura_no) === 27 && Number(r.aya_no) === 30).aya_text_emlaey.includes(bismAllah), 'Naml (27:30): basmala «بسم الله» is INSIDE the ayah (emlaei)');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
