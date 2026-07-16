// QURAN-AR-SURAH-21-SSR-TEN-REFERENCE-PAGES-PROTOTYPE-1 — import pipeline (dev-only, run once).
// Reads the OFFICIAL KFGQPC package, verifies its fingerprints (HARD fail on mismatch),
// and generates the derived runtime files. NEVER edit the derived files by hand — re-run this.
//
//   node scripts/quran/build.mjs
//
// Source of truth = data/quran/kfgqpc-hafs-v2-0/source/{UthmanicHafs_v2-0.zip, hafsData_v2-0.json} (unmodified).
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

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
const NBSP = 0x00A0;
const FC0 = 0xFC00; // end-of-ayah medallion base: marker code point = FC00 + (aya_no - 1)

function die(msg) { console.error('IMPORT FAILED: ' + msg); process.exit(1); }
function hash(buf, algo) { return crypto.createHash(algo).update(buf).digest('hex').toUpperCase(); }
function cps(str) { return [...str].map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')); }

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
const data = JSON.parse(fs.readFileSync(path.join(SRC, 'hafsData_v2-0.json'), 'utf8'));
if (data.length !== 6236) die(`expected 6236 raw records, got ${data.length}`);
const suras = new Set(data.map(r => Number(r.sura_no)));
if (suras.size !== 114) die(`expected 114 suras, got ${suras.size}`);
console.log(`[2] raw records loaded: ${data.length} ayat, ${suras.size} suras.`);

// ============ 3. Surgical end-marker split (documented ending only; NO global replace; NO body mutation) ============
function splitAya(rec) {
  const raw = rec.aya_text;
  const arr = [...raw];
  const marker = arr[arr.length - 1];
  const sep = arr[arr.length - 2];
  const mcp = marker.codePointAt(0);
  if (sep.codePointAt(0) !== NBSP) die(`${rec.sura_no}:${rec.aya_no} — expected NBSP before aya mark, got U+${sep.codePointAt(0).toString(16)}`);
  if (mcp < FC0 || mcp > 0xFDFF) die(`${rec.sura_no}:${rec.aya_no} — aya mark U+${mcp.toString(16)} outside expected FC00..FDFF range`);
  if (mcp - FC0 + 1 !== Number(rec.aya_no)) die(`${rec.sura_no}:${rec.aya_no} — aya mark U+${mcp.toString(16)} != FC00+(aya_no-1)`);
  const body = arr.slice(0, arr.length - 2).join('');
  // reassembly invariant: body + NBSP + marker MUST equal raw, code-point-by-code-point
  if (body + ' ' + marker !== raw) die(`${rec.sura_no}:${rec.aya_no} — reassembly != raw (code-point mismatch)`);
  return { body, marker, markerCp: 'U+' + mcp.toString(16).toUpperCase() };
}

// ============ 4. Build surah 021 (Al-Anbiya) ============
const s21 = data.filter(r => Number(r.sura_no) === 21).sort((a, b) => Number(a.aya_no) - Number(b.aya_no));
if (s21.length !== 112) die(`surah 21 expected 112 ayat, got ${s21.length}`);
s21.forEach((r, i) => { if (Number(r.aya_no) !== i + 1) die(`surah 21 ayah sequence gap at index ${i}: got ${r.aya_no}`); });
const pagesSet = [...new Set(s21.map(r => Number(r.page)))].sort((a, b) => a - b);
if (pagesSet.join(',') !== '322,323,324,325,326,327,328,329,330,331') die(`surah 21 pages != 322..331, got ${pagesSet.join(',')}`);

const pages = pagesSet.map(pg => {
  const ayahs = s21.filter(r => Number(r.page) === pg).map(r => {
    const { body, markerCp } = splitAya(r);
    return {
      ayah: Number(r.aya_no),
      page: Number(r.page),
      lineStart: Number(r.line_start),
      lineEnd: Number(r.line_end),
      textUthmaniRaw: r.aya_text,
      textUthmaniBody: body,
      textImlaei: r.aya_text_emlaey,
      rawEndMarkerCodePoint: markerCp,
    };
  });
  return { page: pg, juz: Number(ayahs[0] ? s21.find(r => Number(r.page) === pg).jozz : 0), ayahs };
});
const surahOut = {
  surah: 21,
  nameAr: s21[0].sura_name_ar,
  nameEn: s21[0].sura_name_en,
  ayahCount: 112,
  firstPage: 322,
  lastPage: 331,
  pageCount: 10,
  juz: [...new Set(s21.map(r => Number(r.jozz)))].sort((a, b) => a - b),
  pages,
};
fs.writeFileSync(path.join(SURAHS, '021.json'), JSON.stringify(surahOut, null, 2) + '\n');
console.log(`[4] surahs/021.json written: 112 ayat over ${pages.length} pages (${surahOut.juz.join('/')} juz).`);

// ============ 5. Basmala derived from record 1:1 (NEVER hand-written) ============
const r11 = data.find(r => Number(r.sura_no) === 1 && Number(r.aya_no) === 1);
if (!r11) die('record 1:1 not found');
const b = splitAya(r11);
const basmala = {
  derivedFrom: '1:1',
  textUthmaniRaw: r11.aya_text,
  textUthmaniBody: b.body,
  rawEndMarkerCodePoint: b.markerCp,
  codePointsBody: cps(b.body),
  sha256: crypto.createHash('sha256').update(b.body, 'utf8').digest('hex').toUpperCase(),
};
fs.writeFileSync(path.join(META, 'basmala.json'), JSON.stringify(basmala, null, 2) + '\n');
console.log('[5] metadata/basmala.json written (derived from 1:1).');

// ============ 6. chapters.json (114 rows; NO makki/madani — not in source) ============
const chapters = [...suras].sort((a, b) => a - b).map(n => {
  const rows = data.filter(r => Number(r.sura_no) === n);
  const pp = rows.map(r => Number(r.page));
  return {
    number: n,
    nameAr: rows[0].sura_name_ar,
    nameEn: rows[0].sura_name_en,
    ayahCount: Math.max(...rows.map(r => Number(r.aya_no))),
    firstPage: Math.min(...pp),
    lastPage: Math.max(...pp),
    pageCount: (Math.max(...pp) - Math.min(...pp) + 1),
  };
});
fs.writeFileSync(path.join(META, 'chapters.json'), JSON.stringify(chapters, null, 2) + '\n');
console.log(`[6] metadata/chapters.json written (${chapters.length} rows, no revelation-place).`);

// ============ 7. source-manifest.json ============
// Preserve the ORIGINAL downloadedAt if a manifest already exists, so re-running this on the SAME verified
// source regenerates a byte-identical manifest (only a genuine re-download should change the timestamp).
let _downloadedAt = new Date().toISOString();
try { const _prev = JSON.parse(fs.readFileSync(path.join(BASE, 'source-manifest.json'), 'utf8')); if (_prev && _prev.downloadedAt) _downloadedAt = _prev.downloadedAt; } catch (e) {}
const manifest = {
  archiveFile: 'UthmanicHafs_v2-0.zip',
  packageVersion: '2.0',
  updateNumber: '13.0',
  readmeDate: '2022-09-07',
  downloadedAt: _downloadedAt,
  md5: got.md5,
  sha1: got.sha1,
  sha256: got.sha256,
  dataVersion: 'kfgqpc-hafs-v2-0-' + got.sha256.slice(0, 8).toLowerCase(),
  hashesVerifiedLocally: true,
  hashesOfficiallyPublished: false,
  sourcePageLastUpdated: null,
  source: {
    name: 'King Fahd Glorious Quran Printing Complex (KFGQPC)',
    downloadUrl: 'https://download.qurancomplex.gov.sa/resources_dev/UthmanicHafs_v2-0.zip',
    recitation: "Hafs 'an Asim",
    script: 'Uthmani',
    fontFamily: 'kfgqpc_hafs_uthmanic_script',
    fontLicense: 'KFGQPC embedded EULA (name table ID 13): Use/Copy/Distribute; NOT Sold/Modified/Altered/Reproduced; provided AS IS. TTF->WOFF2/subset requires express written approval.',
  },
};
fs.writeFileSync(path.join(BASE, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`[7] source-manifest.json written (dataVersion=${manifest.dataVersion}).`);
console.log('\nIMPORT OK — derived files regenerated from the verified source.');
