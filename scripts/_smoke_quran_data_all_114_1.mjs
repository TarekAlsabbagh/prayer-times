// Smoke — QURAN-AR-DATA-BUILD-ALL-114-1: the DERIVED data for all 114 surahs, re-verified against the RAW
// KFGQPC source (not against itself). Pure data test: no server, no browser, no network.
// Covers: 114 surahs / 6236 ayat / 30 juz / pages 1..604; no duplicates; no gaps; ayah sequence; every end
// marker == FC00+(n-1); EVERY ayah reassembles to the raw record code-point-by-code-point; the U+00A0 /
// U+0020 separator census (6235 / 1 = the 2:286 exception); basmala states (Fatiha / At-Tawba / the rest)
// and An-Naml 27:30 keeping its in-text basmala; juz.json + chapters.json + surah-checksums.json integrity.
//
//   node scripts/_smoke_quran_data_all_114_1.mjs
//   QURAN_SOURCE_DIR=/path/to/.quran-source node scripts/_smoke_quran_data_all_114_1.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
const META = path.join(BASE, 'metadata');
const SURAHS = path.join(BASE, 'surahs');
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const u = cp => 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
const NBSP = 0x00A0, SP = 0x0020, FC0 = 0xFC00;
const TOTAL_AYAT = 6236, TOTAL_SURAS = 114, TOTAL_JUZ = 30, LAST_PAGE = 604;

const rawPath = path.join(SRC, 'hafsData_v2-0.json');
if (!fs.existsSync(rawPath)) { console.log('SKIP — raw source not available at ' + rawPath + ' (set QURAN_SOURCE_DIR)'); process.exit(0); }
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const rawByKey = new Map(raw.map(r => [r.sura_no + ':' + r.aya_no, r]));

// ---- load every derived surah file ----
const files = fs.readdirSync(SURAHS).filter(f => /^\d{3}\.json$/.test(f)).sort();
ok(files.length === TOTAL_SURAS, `${TOTAL_SURAS} surah files exist — got ${files.length}`);
ok(files[0] === '001.json' && files[files.length - 1] === '114.json', 'files run 001.json … 114.json');
const surahs = files.map(f => JSON.parse(fs.readFileSync(path.join(SURAHS, f), 'utf8')));
ok(surahs.every((s, i) => s.surah === i + 1), 'every file carries its own surah number, in order');

// ---- ayat: count, sequence, no gaps, no duplicates, marker, reassembly, separators ----
let ayat = 0, sepNbsp = 0, sepSp = 0, spKeys = [];
let seqOk = true, dupOk = true, markerOk = true, reassemblyOk = true, rawMatchOk = true, pageMonotonic = true;
const badReassembly = [], badMarker = [], badRaw = [];
for (const s of surahs) {
  const seen = new Set();
  let expect = 1, lastPage = 0;
  for (const pg of s.pages) {
    if (pg.page < lastPage) pageMonotonic = false;
    lastPage = pg.page;
    for (const a of pg.ayahs) {
      ayat++;
      if (a.ayah !== expect) seqOk = false;
      expect++;
      const key = s.surah + ':' + a.ayah;
      if (seen.has(key)) dupOk = false; seen.add(key);
      // separator census (from the recorded field)
      const scp = parseInt(a.rawEndSeparatorCodePoint.slice(2), 16);
      if (scp === NBSP) sepNbsp++; else if (scp === SP) { sepSp++; spKeys.push(key); }
      // marker == FC00 + (n-1)
      const mcp = parseInt(a.rawEndMarkerCodePoint.slice(2), 16);
      if (mcp !== FC0 + a.ayah - 1) { markerOk = false; badMarker.push(key); }
      // the raw field must equal the untouched source record
      const src = rawByKey.get(key);
      if (!src || src.aya_text !== a.textUthmaniRaw) { rawMatchOk = false; badRaw.push(key); }
      // body + separator + marker MUST rebuild the raw string exactly
      const rebuilt = a.textUthmaniBody + String.fromCodePoint(scp) + String.fromCodePoint(mcp);
      if (rebuilt !== a.textUthmaniRaw) { reassemblyOk = false; badReassembly.push(key); }
    }
  }
  if (seen.size !== s.ayahCount) dupOk = false;
}
ok(ayat === TOTAL_AYAT, `${TOTAL_AYAT} ayat across all files — got ${ayat}`);
ok(seqOk, 'every surah numbers its ayat 1..N with no gap');
ok(dupOk, 'no duplicate ayah inside any surah');
ok(pageMonotonic, 'pages inside every surah are monotonically increasing');
ok(markerOk, 'every end marker == FC00+(ayah-1)' + (badMarker.length ? ' — ' + badMarker.slice(0, 3) : ''));
ok(rawMatchOk, 'every textUthmaniRaw is byte-equal to its RAW source record' + (badRaw.length ? ' — ' + badRaw.slice(0, 3) : ''));
ok(reassemblyOk, 'every ayah reassembles body+separator+marker == raw, code-point-exact' + (badReassembly.length ? ' — ' + badReassembly.slice(0, 3) : ''));
ok(sepNbsp === TOTAL_AYAT - 1, `${u(NBSP)} separator on exactly ${TOTAL_AYAT - 1} ayat — got ${sepNbsp}`);
ok(sepSp === 1, `${u(SP)} separator on exactly 1 ayah — got ${sepSp}`);
ok(spKeys.length === 1 && spKeys[0] === '2:286', 'the ONLY plain-space separator is 2:286 — got ' + JSON.stringify(spKeys));
// 2:286 in depth
const baqara = surahs[1];
const a286 = baqara.pages.flatMap(p => p.ayahs).find(a => a.ayah === 286);
ok(!!a286 && a286.rawEndSeparatorCodePoint === 'U+0020', '2:286 records its separator as U+0020');
ok(!!a286 && a286.rawEndMarkerCodePoint === 'U+FD1D', '2:286 marker is U+FD1D (FC00+285)');
ok(!!a286 && a286.textUthmaniBody + ' ' + String.fromCodePoint(0xFD1D) === a286.textUthmaniRaw, '2:286 rebuilds with a PLAIN space, exactly as the source has it');
ok(!!a286 && !/ /.test(a286.textUthmaniRaw.slice(-2)), '2:286 does not silently carry an NBSP at the tail');

// ---- chapters.json ----
const chapters = JSON.parse(fs.readFileSync(path.join(META, 'chapters.json'), 'utf8'));
ok(chapters.length === TOTAL_SURAS, `chapters.json has ${TOTAL_SURAS} rows — got ${chapters.length}`);
ok(chapters.every((c, i) => c.number === i + 1), 'chapters.json is ordered 1..114');
ok(chapters.every(c => c.ayahCount === surahs[c.number - 1].ayahCount), 'chapters.json ayahCount matches every surah file');
ok(chapters.reduce((s, c) => s + c.ayahCount, 0) === TOTAL_AYAT, `chapters.json ayah total == ${TOTAL_AYAT}`);
ok(chapters[0].ayahCount === 7 && chapters[1].ayahCount === 286 && chapters[113].ayahCount === 6, 'spot-check: Fatiha 7, Baqara 286, An-Nas 6');

// ---- pages 1..604, no gaps ----
const allPages = new Set();
surahs.forEach(s => s.pages.forEach(p => allPages.add(p.page)));
ok(allPages.size === LAST_PAGE, `${LAST_PAGE} distinct mushaf pages — got ${allPages.size}`);
ok(Math.min(...allPages) === 1 && Math.max(...allPages) === LAST_PAGE, `pages run 1..${LAST_PAGE}`);
let pageGap = null;
for (let p = 1; p <= LAST_PAGE; p++) if (!allPages.has(p)) { pageGap = p; break; }
ok(pageGap === null, 'no missing page in 1..604' + (pageGap ? ' — missing ' + pageGap : ''));

// ---- juz.json ----
const juz = JSON.parse(fs.readFileSync(path.join(META, 'juz.json'), 'utf8'));
ok(juz.length === TOTAL_JUZ, `juz.json has ${TOTAL_JUZ} rows — got ${juz.length}`);
ok(juz.every((j, i) => j.juz === i + 1), 'juz.json is ordered 1..30');
ok(juz.reduce((s, j) => s + j.ayahCount, 0) === TOTAL_AYAT, `juz.json ayah total == ${TOTAL_AYAT}`);
ok(juz[0].firstPage === 1 && juz[TOTAL_JUZ - 1].lastPage === LAST_PAGE, 'juz 1 starts at page 1 and juz 30 ends at page 604');
ok(juz.every(j => j.surahs.length === j.surahCount && j.surahs.every(x => x.ayahCount === x.lastAyah - x.firstAyah + 1)), 'every juz row: surahCount matches, and each surah range is contiguous');
// cross-check against the RAW jozz field
const rawJuzCount = {};
raw.forEach(r => { rawJuzCount[+r.jozz] = (rawJuzCount[+r.jozz] || 0) + 1; });
ok(juz.every(j => j.ayahCount === rawJuzCount[j.juz]), 'every juz ayah count matches the RAW jozz field');

// ---- basmala states ----
const basmala = JSON.parse(fs.readFileSync(path.join(META, 'basmala.json'), 'utf8'));
ok(basmala.derivedFrom === '1:1' && basmala.textUthmaniRaw === rawByKey.get('1:1').aya_text, 'basmala.json is derived from the RAW 1:1 record (never hand-written)');
ok(surahs[0].basmalaMode === 'first-ayah', 'Al-Fatiha → basmalaMode "first-ayah" (the basmala IS ayah 1: no extra one may be prepended)');
ok(surahs[8].basmalaMode === 'none', 'At-Tawba (9) → basmalaMode "none" (no opening basmala)');
const others = surahs.filter(s => s.surah !== 1 && s.surah !== 9);
ok(others.length === 112 && others.every(s => s.basmalaMode === 'separate'), 'the other 112 surahs → basmalaMode "separate"');
// Al-Fatiha ayah 1 IS the basmala
ok(surahs[0].pages[0].ayahs[0].textUthmaniBody === basmala.textUthmaniBody, 'Al-Fatiha ayah 1 body == the derived basmala body');
// At-Tawba must not begin with it
ok(!surahs[8].pages[0].ayahs[0].textUthmaniBody.startsWith(basmala.textUthmaniBody), 'At-Tawba ayah 1 does NOT begin with the basmala');
// An-Naml 27:30 keeps its in-text basmala (the body is a pure slice — nothing was stripped)
const naml30 = surahs[26].pages.flatMap(p => p.ayahs).find(a => a.ayah === 30);
ok(!!naml30 && naml30.textUthmaniBody.includes(basmala.textUthmaniBody), 'An-Naml 27:30 KEEPS the basmala inside its ayah text (not stripped, not moved)');
ok(!!naml30 && naml30.textUthmaniRaw === rawByKey.get('27:30').aya_text, 'An-Naml 27:30 raw text is untouched');

// ---- surah-checksums.json ----
const sums = JSON.parse(fs.readFileSync(path.join(META, 'surah-checksums.json'), 'utf8'));
ok(sums.fileCount === TOTAL_SURAS && sums.files.length === TOTAL_SURAS, 'surah-checksums.json covers all 114 files');
const badSum = sums.files.filter(f => crypto.createHash('sha256').update(fs.readFileSync(path.join(SURAHS, f.file))).digest('hex').toUpperCase() !== f.sha256);
ok(badSum.length === 0, 'every recorded SHA-256 matches the file on disk' + (badSum.length ? ' — ' + badSum.map(b => b.file).slice(0, 3) : ''));
const badBytes = sums.files.filter(f => fs.statSync(path.join(SURAHS, f.file)).size !== f.bytes);
ok(badBytes.length === 0, 'every recorded byte size matches the file on disk');
ok(sums.totalBytes === sums.files.reduce((s, f) => s + f.bytes, 0), 'surah-checksums totalBytes is self-consistent');
ok(sums.files.reduce((s, f) => s + f.ayahCount, 0) === TOTAL_AYAT, `surah-checksums ayah total == ${TOTAL_AYAT}`);

// ---- no hand-editable drift: derived files must not carry a build timestamp ----
const stamped = ['juz.json', 'chapters.json', 'surah-checksums.json', 'basmala.json']
  .filter(f => /"(builtAt|generatedAt|timestamp)"/.test(fs.readFileSync(path.join(META, f), 'utf8')));
ok(stamped.length === 0, 'no derived metadata file embeds a build timestamp (determinism)' + (stamped.length ? ' — ' + stamped : ''));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
