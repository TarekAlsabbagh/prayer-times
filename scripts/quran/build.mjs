// QURAN-AR-DATA-BUILD-ALL-114-1 — import pipeline (dev-only, deterministic, re-runnable).
// Reads the OFFICIAL KFGQPC package, verifies its fingerprints (HARD fail on mismatch), and generates
// EVERY derived runtime file for all 114 surahs. NEVER edit the derived files by hand — re-run this.
//
//   node scripts/quran/build.mjs
//   QURAN_SOURCE_DIR=/path/to/.quran-source node scripts/quran/build.mjs
//
// OFFICIAL BUILD OUTPUTS — exactly 118 files, and nothing else:
//     surahs/001.json … 114.json                    (114)
//     metadata/chapters.json, basmala.json, juz.json, surah-checksums.json   (4)
// `source-manifest.json` is NOT an output: it is read-only PROVENANCE (see [9]). It records `downloadedAt`,
// a wall-clock fact this build cannot know, so writing it made a fresh-directory build differ from a re-run.
//
// Determinism contract: the same verified source MUST produce byte-identical output — 118/118 across two
// independent empty directories. Nothing written to a derived file may embed a timestamp, a random value,
// or an unsorted Map/Set iteration order. There is deliberately no Date.now()/new Date() anywhere below.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const T0 = process.hrtime.bigint();
let PEAK_RSS = 0;
const mem = () => { const r = process.memoryUsage().rss; if (r > PEAK_RSS) PEAK_RSS = r; return r; };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
// Raw KFGQPC package (ZIP + hafsData) is NOT tracked in git (license + 14 MB). It lives in a LOCAL cache:
// default <repo>/.quran-source, overridable via `node build.mjs <dir>` or QURAN_SOURCE_DIR=<dir>.
// HARD-fails below if the ZIP is absent, and re-verifies md5/sha1/sha256 before building anything.
const SRC = process.argv[2] || process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const META = path.join(BASE, 'metadata');
const SURAHS = path.join(BASE, 'surahs');

// ---- Verified reference fingerprints (verified LOCALLY against the approved package; NOT described as officially published) ----
const PIN = {
  md5:    'CF6841AEA5B1D1FD70D032B43FF08278',
  sha1:   '36EA5AB0D7EA1702F17FF43F9B50924CCCD77EBF',
  sha256: 'A7B0E5591945712EC5E4D6142938AE4D1E9B49BDC89DFF06222789BFEBDFD72C',
};
const NBSP = 0x00A0;  // separator before the end-of-ayah medallion in 6235 of the 6236 records
const SP   = 0x0020;  // …and a PLAIN space in exactly one: the documented 2:286 exception
const FC0  = 0xFC00;  // end-of-ayah medallion base: marker code point = FC00 + (aya_no - 1)
const SP_EXCEPTION = '2:286';          // the ONLY record allowed to use U+0020
const TOTAL_AYAT = 6236, TOTAL_SURAS = 114, TOTAL_JUZ = 30, LAST_PAGE = 604;
const FATIHA = 1, TAWBA = 9;           // basmala special cases (An-Naml 27:30 needs no flag — see [4])

function die(msg) { console.error('IMPORT FAILED: ' + msg); process.exit(1); }
function hash(buf, algo) { return crypto.createHash(algo).update(buf).digest('hex').toUpperCase(); }
function cps(str) { return [...str].map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')); }
function u(cp) { return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'); }
function sha256Str(s) { return crypto.createHash('sha256').update(s, 'utf8').digest('hex').toUpperCase(); }
// every derived file goes through this: 2-space JSON + trailing LF, so re-runs are byte-identical
function writeJson(file, obj) { const s = JSON.stringify(obj, null, 2) + '\n'; fs.writeFileSync(file, s); return Buffer.byteLength(s); }

// ============ 1. HARD fingerprint gate on the archive ============
const zipPath = path.join(SRC, 'UthmanicHafs_v2-0.zip');
if (!fs.existsSync(zipPath)) die('source ZIP missing at ' + zipPath);
const zip = fs.readFileSync(zipPath);
const got = { md5: hash(zip, 'md5'), sha1: hash(zip, 'sha1'), sha256: hash(zip, 'sha256') };
for (const a of ['md5', 'sha1', 'sha256']) {
  if (got[a] !== PIN[a]) die(`${a.toUpperCase()} mismatch — got ${got[a]}, expected ${PIN[a]}. Refusing to build from an unverified package.`);
}
console.log('[1] fingerprint gate PASSED (md5/sha1/sha256 match the verified reference).');

// ============ 2. Load raw records (unmodified) ============
const dataPath = path.join(SRC, 'hafsData_v2-0.json');
if (!fs.existsSync(dataPath)) die('source hafsData missing at ' + dataPath);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if (data.length !== TOTAL_AYAT) die(`expected ${TOTAL_AYAT} raw records, got ${data.length}`);
const suras = [...new Set(data.map(r => Number(r.sura_no)))].sort((a, b) => a - b);
if (suras.length !== TOTAL_SURAS) die(`expected ${TOTAL_SURAS} suras, got ${suras.length}`);
if (suras[0] !== 1 || suras[TOTAL_SURAS - 1] !== TOTAL_SURAS) die('sura numbers are not the contiguous range 1..114');
mem();
console.log(`[2] raw records loaded: ${data.length} ayat, ${suras.length} suras.`);

// ============ 3. Surgical end-marker split ============
// The medallion is the LAST code point; the code point before it is the separator. 6235 records use U+00A0;
// 2:286 alone uses U+0020. Each is accepted ONLY where documented — a U+0020 anywhere else is a hard fail,
// and so is 2:286 losing its exception. NO trim(), NO global replace(), NO body mutation: the body is a pure
// code-point slice and `body + sep + marker` must equal the raw string exactly.
const sepCensus = { [NBSP]: 0, [SP]: 0 };
function splitAya(rec, countIt) {
  const raw = rec.aya_text;
  const arr = [...raw];
  if (arr.length < 3) die(`${rec.sura_no}:${rec.aya_no} — record too short to carry a separator + marker`);
  const marker = arr[arr.length - 1];
  const sep = arr[arr.length - 2];
  const mcp = marker.codePointAt(0);
  const scp = sep.codePointAt(0);
  const key = `${rec.sura_no}:${rec.aya_no}`;
  if (key === SP_EXCEPTION) {
    if (scp !== SP) die(`${key} — the documented ${u(SP)} exception is NOT present (got ${u(scp)}). The source changed; refusing to build.`);
  } else if (scp === SP) {
    die(`${key} — ${u(SP)} separator outside the single documented ${SP_EXCEPTION} exception. Refusing to build.`);
  } else if (scp !== NBSP) {
    die(`${key} — expected ${u(NBSP)} separator, got ${u(scp)}`);
  }
  if (mcp < FC0 || mcp > 0xFDFF) die(`${key} — aya mark ${u(mcp)} outside expected FC00..FDFF range`);
  if (mcp - FC0 + 1 !== Number(rec.aya_no)) die(`${key} — aya mark ${u(mcp)} != FC00+(aya_no-1)`);
  const body = arr.slice(0, arr.length - 2).join('');
  if (body + sep + marker !== raw) die(`${key} — reassembly != raw (code-point mismatch)`);
  if (countIt) sepCensus[scp]++;
  return { body, marker, sepCp: u(scp), markerCp: u(mcp) };
}

// ============ 4. Build surahs/001.json … 114.json ============
const bySura = new Map(suras.map(n => [n, []]));
for (const r of data) bySura.get(Number(r.sura_no)).push(r);
const chapters = [];
const fileSizes = [];
let ayatWritten = 0;
for (const n of suras) {
  const rows = bySura.get(n).slice().sort((a, b) => Number(a.aya_no) - Number(b.aya_no));
  rows.forEach((r, i) => { if (Number(r.aya_no) !== i + 1) die(`surah ${n} ayah sequence gap at index ${i}: got ${r.aya_no}`); });
  const ayahCount = rows.length;
  const pageNums = [...new Set(rows.map(r => Number(r.page)))].sort((a, b) => a - b);
  for (let i = 1; i < pageNums.length; i++) if (pageNums[i] !== pageNums[i - 1] + 1) die(`surah ${n} page range has a gap: ${pageNums.join(',')}`);
  const juzNums = [...new Set(rows.map(r => Number(r.jozz)))].sort((a, b) => a - b);
  // Basmala state — DATA ONLY (the renderer decides what to draw; nothing is injected into the text here):
  //   fatiha      → the basmala IS ayah 1, so NOTHING extra may ever be prepended
  //   at-tawba    → the one surah with no opening basmala at all
  //   every other → the basmala is a separate opener, drawn before ayah 1
  // An-Naml needs no flag: its basmala sits INSIDE the text of 27:30 and stays there untouched, because the
  // body is a pure slice of the raw record (verified by the reassembly invariant + the data smoke).
  const basmalaMode = n === FATIHA ? 'first-ayah' : (n === TAWBA ? 'none' : 'separate');
  const pages = pageNums.map(pg => {
    const pageRows = rows.filter(r => Number(r.page) === pg);
    return {
      page: pg,
      juz: Number(pageRows[0].jozz),
      ayahs: pageRows.map(r => {
        const { body, sepCp, markerCp } = splitAya(r, true);
        ayatWritten++;
        return {
          ayah: Number(r.aya_no),
          page: Number(r.page),
          lineStart: Number(r.line_start),
          lineEnd: Number(r.line_end),
          textUthmaniRaw: r.aya_text,
          textUthmaniBody: body,
          textImlaei: r.aya_text_emlaey,
          rawEndSeparatorCodePoint: sepCp,
          rawEndMarkerCodePoint: markerCp,
        };
      }),
    };
  });
  const out = {
    surah: n,
    nameAr: rows[0].sura_name_ar,
    nameEn: rows[0].sura_name_en,
    ayahCount,
    firstPage: pageNums[0],
    lastPage: pageNums[pageNums.length - 1],
    pageCount: pageNums.length,
    juz: juzNums,
    basmalaMode,
    pages,
  };
  const file = String(n).padStart(3, '0') + '.json';
  const bytes = writeJson(path.join(SURAHS, file), out);
  fileSizes.push({ file, bytes, ayahCount, surah: n });
  chapters.push({ number: n, nameAr: out.nameAr, nameEn: out.nameEn, ayahCount, firstPage: out.firstPage, lastPage: out.lastPage, pageCount: out.pageCount });
  mem();
}
if (ayatWritten !== TOTAL_AYAT) die(`wrote ${ayatWritten} ayat, expected ${TOTAL_AYAT}`);
if (sepCensus[NBSP] !== TOTAL_AYAT - 1 || sepCensus[SP] !== 1) die(`separator census off: ${u(NBSP)}=${sepCensus[NBSP]}, ${u(SP)}=${sepCensus[SP]} (expected ${TOTAL_AYAT - 1} / 1)`);
console.log(`[4] surahs/001.json … 114.json written: ${ayatWritten} ayat (${u(NBSP)}×${sepCensus[NBSP]}, ${u(SP)}×${sepCensus[SP]} — the ${SP_EXCEPTION} exception).`);

// ============ 5. Basmala derived from record 1:1 (NEVER hand-written) ============
const r11 = data.find(r => Number(r.sura_no) === 1 && Number(r.aya_no) === 1);
if (!r11) die('record 1:1 not found');
const b = splitAya(r11, false);   // countIt=false: the census must stay a pure 6236-record statement
const basmala = {
  derivedFrom: '1:1',
  textUthmaniRaw: r11.aya_text,
  textUthmaniBody: b.body,
  rawEndSeparatorCodePoint: b.sepCp,
  rawEndMarkerCodePoint: b.markerCp,
  codePointsBody: cps(b.body),
  sha256: sha256Str(b.body),
};
writeJson(path.join(META, 'basmala.json'), basmala);
console.log('[5] metadata/basmala.json written (derived from 1:1).');

// ============ 6. chapters.json (114 rows; NO makki/madani — not in source) ============
writeJson(path.join(META, 'chapters.json'), chapters);
console.log(`[6] metadata/chapters.json written (${chapters.length} rows, no revelation-place).`);

// ============ 7. juz.json (30 rows, derived — never hand-written) ============
const juzRows = [];
for (let j = 1; j <= TOTAL_JUZ; j++) {
  const rows = data.filter(r => Number(r.jozz) === j);
  if (!rows.length) die(`juz ${j} has no ayat`);
  const pp = rows.map(r => Number(r.page));
  const inJuz = [...new Set(rows.map(r => Number(r.sura_no)))].sort((a, b) => a - b).map(sn => {
    const sr = rows.filter(r => Number(r.sura_no) === sn).map(r => Number(r.aya_no));
    return { surah: sn, firstAyah: Math.min(...sr), lastAyah: Math.max(...sr), ayahCount: sr.length };
  });
  juzRows.push({ juz: j, firstPage: Math.min(...pp), lastPage: Math.max(...pp), ayahCount: rows.length, surahCount: inJuz.length, surahs: inJuz });
}
const juzAyat = juzRows.reduce((s, j) => s + j.ayahCount, 0);
if (juzAyat !== TOTAL_AYAT) die(`juz ayah total ${juzAyat} != ${TOTAL_AYAT}`);
if (juzRows[0].firstPage !== 1) die(`juz 1 does not start at page 1 (got ${juzRows[0].firstPage})`);
if (juzRows[TOTAL_JUZ - 1].lastPage !== LAST_PAGE) die(`juz 30 does not end at page ${LAST_PAGE} (got ${juzRows[TOTAL_JUZ - 1].lastPage})`);
writeJson(path.join(META, 'juz.json'), juzRows);
console.log(`[7] metadata/juz.json written (${juzRows.length} juz, ${juzAyat} ayat, pages ${juzRows[0].firstPage}..${juzRows[TOTAL_JUZ - 1].lastPage}).`);

// ============ 8. surah-checksums.json (SHA-256 of every derived surah file) ============
const checksums = fileSizes.map(f => ({
  file: f.file,
  ayahCount: f.ayahCount,
  bytes: f.bytes,
  sha256: hash(fs.readFileSync(path.join(SURAHS, f.file)), 'sha256'),
}));
const rollup = sha256Str(checksums.map(c => c.file + ':' + c.sha256).join('\n'));
const totalBytes = checksums.reduce((s, c) => s + c.bytes, 0);
writeJson(path.join(META, 'surah-checksums.json'), { algorithm: 'sha256', fileCount: checksums.length, totalBytes, rollupSha256: rollup, files: checksums });
console.log(`[8] metadata/surah-checksums.json written (${checksums.length} files, rollup ${rollup.slice(0, 16)}…).`);

// ============ 9. source-manifest.json — READ-ONLY PROVENANCE GATE (never written) ============
// This file records WHERE the package came from and WHEN it was downloaded. It is NOT a build output:
// it carries `downloadedAt`, a wall-clock fact about the download that this build has no business
// inventing. Writing it here made the build non-deterministic (a fresh output dir stamped "now"), so the
// build now only READS it and verifies that it still describes the exact package we just hashed.
// Location: <BASE>/source-manifest.json by default, overridable read-only via QURAN_MANIFEST_FILE.
const MANIFEST_FILE = process.env.QURAN_MANIFEST_FILE || path.join(BASE, 'source-manifest.json');
if (fs.existsSync(MANIFEST_FILE)) {
  let mf;
  try { mf = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8')); }
  catch (e) { die('source-manifest.json is unreadable/invalid JSON at ' + MANIFEST_FILE); }
  const expectVersion = 'kfgqpc-hafs-v2-0-' + got.sha256.slice(0, 8).toLowerCase();
  const checks = [
    ['archiveFile', mf.archiveFile, 'UthmanicHafs_v2-0.zip'],
    ['packageVersion', mf.packageVersion, '2.0'],
    ['md5', mf.md5, got.md5],
    ['sha1', mf.sha1, got.sha1],
    ['sha256', mf.sha256, got.sha256],
    ['dataVersion', mf.dataVersion, expectVersion],
  ];
  for (const [field, actual, expected] of checks) {
    if (actual !== expected) die(`source-manifest.json ${field} = ${JSON.stringify(actual)} but the package we just hashed says ${JSON.stringify(expected)}. The manifest no longer describes this source — refusing to build.`);
  }
  console.log(`[9] source-manifest.json VERIFIED (read-only, not rewritten): ${mf.archiveFile} v${mf.packageVersion}, ${TOTAL_AYAT} records, dataVersion=${mf.dataVersion}.`);
} else {
  console.log(`[9] source-manifest.json absent at ${MANIFEST_FILE} — provenance not verified (it is an INPUT, not an output; nothing written).`);
}

// ============ 10. build stats (console ONLY — never written to a derived file: they would break determinism) ============
const ms = Number(process.hrtime.bigint() - T0) / 1e6;
const sorted = fileSizes.slice().sort((a, b) => a.bytes - b.bytes);
const pick = n => fileSizes.find(f => f.surah === n);
console.log('\n--- build stats ---');
console.log(`  surah files      : ${checksums.length}`);
console.log(`  ayat             : ${ayatWritten}`);
console.log(`  surah data bytes : ${totalBytes} (${(totalBytes / 1048576).toFixed(2)} MB)`);
console.log(`  smallest         : ${sorted[0].file} — ${sorted[0].bytes} B (${sorted[0].ayahCount} ayat)`);
console.log(`  largest          : ${sorted[sorted.length - 1].file} — ${sorted[sorted.length - 1].bytes} B (${sorted[sorted.length - 1].ayahCount} ayat)`);
console.log(`  002 al-baqara    : ${pick(2).bytes} B (${pick(2).ayahCount} ayat)`);
console.log(`  108 al-kawthar   : ${pick(108).bytes} B (${pick(108).ayahCount} ayat)`);
console.log(`  build time       : ${ms.toFixed(0)} ms`);
console.log(`  peak RSS         : ${(PEAK_RSS / 1048576).toFixed(1)} MB`);
console.log('\nIMPORT OK — all 114 surahs regenerated from the verified source.');
