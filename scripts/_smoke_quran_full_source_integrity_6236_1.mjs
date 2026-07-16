// Smoke — QURAN FULL-PACKAGE integrity (all 6236 ayat), not just Al-Anbiya. Validates the ENTIRE verified
// KFGQPC source: ZIP fingerprints, documented ayah-end marker on every record, code-point-exact reassembly,
// no char loss, 114 suras / 6236 ayat, no dup, no gap, the 3 basmala cases, and page/juz mapping.
// The raw package lives OUTSIDE git in a local cache (.quran-source/, overridable via QURAN_SOURCE_DIR);
// this test SKIPS cleanly when that cache is absent (e.g. a fresh clone) and runs fully when it is present.
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++) : (fail++, F.push(m), console.log('  FAIL ' + m));
const ZIP = path.join(SRC, 'UthmanicHafs_v2-0.zip');
const HAFS = path.join(SRC, 'hafsData_v2-0.json');
if (!fs.existsSync(ZIP) || !fs.existsSync(HAFS)) { console.log('SKIP — local Quran source cache not present (' + SRC + '); full-6236 integrity needs .quran-source/'); process.exit(0); }

const NBSP = 0x00A0, SPACE = 0x20, FC0 = 0xFC00, FDFF = 0xFDFF;
const man = JSON.parse(fs.readFileSync(path.join(BASE, 'source-manifest.json'), 'utf8'));
const basmalaBody = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', 'basmala.json'), 'utf8')).textUthmaniBody;

// 1) ZIP fingerprints match the manifest's recorded (locally-verified) hashes
const zip = fs.readFileSync(ZIP);
const H = a => crypto.createHash(a).update(zip).digest('hex').toUpperCase();
ok(H('md5') === man.md5, 'ZIP MD5 matches manifest');
ok(H('sha1') === man.sha1, 'ZIP SHA-1 matches manifest');
ok(H('sha256') === man.sha256, 'ZIP SHA-256 matches manifest');

// 2) load raw + top-level shape
const data = JSON.parse(fs.readFileSync(HAFS, 'utf8'));
ok(Array.isArray(data) && data.length === 6236, 'exactly 6236 raw ayat records — got ' + data.length);
ok(new Set(data.map(r => Number(r.sura_no))).size === 114, 'exactly 114 distinct suras');

// 3) every record: documented end marker + code-point-exact reassembly + no char loss (surgical split).
//    The separator before the marker is NBSP (U+00A0) for 6235 records; the OFFICIAL KFGQPC source uses a
//    plain space (U+0020) for exactly ONE — Al-Baqarah 2:286 — asserted separately below (not a corruption).
let markerBad = 0, sepBad = 0, reassemblyBad = 0, bodyBad = 0;
const bodyOf = {}; const spaceSep = [];
for (const r of data) {
  const raw = r.aya_text; const arr = [...raw];
  const marker = arr[arr.length - 1], sep = arr[arr.length - 2];
  const mcp = marker.codePointAt(0), scp = sep.codePointAt(0);
  if (mcp < FC0 || mcp > FDFF || (mcp - FC0 + 1) !== Number(r.aya_no)) { markerBad++; continue; }  // ayah number encoded in the medallion == aya_no
  if (scp !== NBSP && scp !== SPACE) { sepBad++; continue; }  // separator is a documented whitespace (NBSP or space)
  if (scp === SPACE) spaceSep.push(r.sura_no + ':' + r.aya_no);
  const body = arr.slice(0, arr.length - 2).join('');
  if (body + sep + marker !== raw) { reassemblyBad++; continue; }  // body + the ACTUAL separator + marker reconstructs raw exactly
  if (!body.length || [...body].some(c => { const p = c.codePointAt(0); return p >= FC0 && p <= FDFF; })) { bodyBad++; continue; }  // non-empty + no stray medallion glyph inside the body
  bodyOf[r.sura_no + ':' + r.aya_no] = body;
}
ok(markerBad === 0, 'every ayah ends with an FC00+(aya_no-1) medallion marker — bad: ' + markerBad);
ok(sepBad === 0, 'every ayah separates the marker with NBSP or a plain space — bad: ' + sepBad);
ok(reassemblyBad === 0, 'body + separator + marker reconstructs raw code-point-by-code-point for ALL — bad: ' + reassemblyBad);
ok(bodyBad === 0, 'every ayah body is non-empty and contains NO stray medallion glyph — bad: ' + bodyBad);
ok(spaceSep.length === 1 && spaceSep[0] === '2:286', 'exactly ONE record (Al-Baqarah 2:286) uses a plain space before its marker — documented KFGQPC quirk; the other 6235 use NBSP — got [' + spaceSep.join(', ') + ']');

// 4) per-sura ayah counts: no dup, no gap, 1..N sequence; total = 6236; suras exactly 1..114
const bySura = new Map();
for (const r of data) { const s = Number(r.sura_no); if (!bySura.has(s)) bySura.set(s, []); bySura.get(s).push(Number(r.aya_no)); }
let seqBad = 0, dupBad = 0, total = 0;
for (const [, ayas] of bySura) {
  total += ayas.length;
  const sorted = [...ayas].sort((a, b) => a - b);
  if (new Set(ayas).size !== ayas.length) dupBad++;
  if (!sorted.every((a, i) => a === i + 1)) seqBad++;
}
ok(total === 6236, 'sum of per-sura ayah counts = 6236 — got ' + total);
ok(dupBad === 0, 'no duplicate ayah number within any sura — bad suras: ' + dupBad);
ok(seqBad === 0, 'every sura numbers its ayat 1..N with no gap — bad suras: ' + seqBad);
ok([...bySura.keys()].sort((a, b) => a - b).every((s, i) => s === i + 1), 'suras are exactly 1..114 (no missing/extra)');

// 5) the three basmala cases
ok(bodyOf['1:1'] === basmalaBody, 'Al-Fatiha 1:1 body == the derived basmala (counted as ayah 1)');
ok(bodyOf['9:1'] && bodyOf['9:1'] !== basmalaBody, 'At-Tawbah 9:1 is NOT a basmala (surah 9 has none)');
ok(bodyOf['27:30'] && bodyOf['27:30'].includes(basmalaBody), 'An-Naml 27:30 CONTAINS the basmala in-body');

// 6) page + juz mapping present and in range for every record
let pageBad = 0, juzBad = 0;
for (const r of data) { const p = Number(r.page), j = Number(r.jozz); if (!(p >= 1 && p <= 604)) pageBad++; if (!(j >= 1 && j <= 30)) juzBad++; }
ok(pageBad === 0, 'every record has a page in 1..604 — bad: ' + pageBad);
ok(juzBad === 0, 'every record has a juz in 1..30 — bad: ' + juzBad);
ok(new Set(data.map(r => Number(r.page))).size === 604, 'all 604 mushaf pages are represented');
ok(new Set(data.map(r => Number(r.jozz))).size === 30, 'all 30 ajza are represented');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); } else console.log('  full-6236 integrity OK');
