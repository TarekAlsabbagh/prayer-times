// QURAN-AR-FINAL-OFFICIAL-ENGLISH-SLUG-URL-STRUCTURE-NO-REDIRECTS-1
// Derives data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json from the OFFICIAL KFGQPC source.
//
// Every English name and every slug in this project comes from here and nowhere else. Nothing is typed by
// hand: a hand-written surah name is an unverifiable claim about the Quran, and a hand-written slug is a URL
// that no source backs. The source is fingerprint-gated before a single name is read, and the whole run is a
// pure function of it — no clock, no randomness, so two builds are byte-identical.
//
// If the source disagrees with itself (one surah spelled two ways across its ayat) or two surahs collapse to
// the same slug, this STOPS. It does not pick a winner and it does not invent a suffix — a human decides.
//
//   node scripts/quran/build_surah_routes.mjs
//   QURAN_SOURCE_DIR=/path/to/.quran-source node scripts/quran/build_surah_routes.mjs
//   ... --out-dir=<dir>     (write the manifest under <dir> instead of the repo — used by the determinism test)
//   ... --check             (build in memory and report; write nothing)
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC_DIR = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const ZIP = path.join(SRC_DIR, 'UthmanicHafs_v2-0.zip');
const RAW = path.join(SRC_DIR, 'hafsData_v2-0.json');
const argv = process.argv.slice(2);
const OUT_DIR = (argv.find(a => a.startsWith('--out-dir=')) || '').split('=')[1] || path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
const CHECK_ONLY = argv.includes('--check');

// The published fingerprints of the approved package. Verified BEFORE any name is read, so a swapped or
// truncated download can never reach the slug layer.
const FP = {
  md5:    'CF6841AEA5B1D1FD70D032B43FF08278',
  sha1:   '36EA5AB0D7EA1702F17FF43F9B50924CCCD77EBF',
  sha256: 'A7B0E5591945712EC5E4D6142938AE4D1E9B49BDC89DFF06222789BFEBDFD72C',
};
const TOTAL_SURAHS = 114;
const TOTAL_AYAT = 6236;

const die = (msg) => { console.error('IMPORT FAILED: ' + msg); process.exit(1); };
const hash = (algo, buf) => crypto.createHash(algo).update(buf).digest('hex').toUpperCase();

// ---- 1) hard fingerprint gate ----------------------------------------------------------------
if (!fs.existsSync(ZIP)) die('source ZIP missing at ' + ZIP + ' (set QURAN_SOURCE_DIR)');
if (!fs.existsSync(RAW)) die('source JSON missing at ' + RAW + ' (set QURAN_SOURCE_DIR)');
const zipBuf = fs.readFileSync(ZIP);
for (const [algo, want] of [['md5', FP.md5], ['sha1', FP.sha1], ['sha256', FP.sha256]]) {
  const got = hash(algo, zipBuf);
  if (got !== want) die(`${algo.toUpperCase()} mismatch on ${path.basename(ZIP)}\n  expected ${want}\n  got      ${got}`);
}

// ---- 2) the ONE slug helper --------------------------------------------------------------------
// Deterministic, source-driven, no per-surah exceptions. The steps are the ticket's, in its order.
export function slugify(nameEn) {
  return String(nameEn)
    .normalize('NFKD')                                   // 1. decompose, so accents become combining marks
    .toLowerCase()                                       // 2.
    .replace(/[̀-ͯ]/g, '')                     // 3. drop the Latin combining marks NFKD exposed
    .replace(/['’‘ʼʻ′`´]/g, '')  // 4. apostrophes vanish (not turned into a dash):
                                                         //    Al-Ma'idah -> al-maidah, never al-ma-idah
    .replace(/[\s _/,.:;()[\]{}‐-―−]+/g, '-')  // 5. spaces + separators + any dash variant -> '-'
    .replace(/[^a-z0-9-]/g, '')                          // 6. nothing outside a-z 0-9 -
    .replace(/-{2,}/g, '-')                              // 7. collapse runs
    .replace(/^-+|-+$/g, '');                            // 8. trim
}

// Static paths the Quran section owns (built or planned). A surah slug must never shadow one of these, or the
// surah would eat a real page — or a future page would silently steal a surah.
export const RESERVED = ['quran', 'search', 'juz', 'page', 'bookmarks', 'settings', 'surah', 'source', 'index'];

// ---- 3) read the source, group by sura_no ------------------------------------------------------
const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const rows = Array.isArray(raw) ? raw : (raw.data || raw.hafs || []);
if (rows.length !== TOTAL_AYAT) die(`expected ${TOTAL_AYAT} ayah records, got ${rows.length}`);

const byNo = new Map();
for (const r of rows) {
  const n = Number(r.sura_no);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_SURAHS) die(`ayah record with an out-of-range sura_no: ${r.sura_no}`);
  if (!byNo.has(n)) byNo.set(n, { number: n, ar: new Set(), en: new Set(), ayat: 0 });
  const g = byNo.get(n);
  g.ar.add(String(r.sura_name_ar ?? ''));
  g.en.add(String(r.sura_name_en ?? ''));
  g.ayat++;
}

// ---- 4) the source must agree with itself ------------------------------------------------------
const problems = [];
if (byNo.size !== TOTAL_SURAHS) problems.push(`grouped ${byNo.size} surahs, expected ${TOTAL_SURAHS}`);
for (let n = 1; n <= TOTAL_SURAHS; n++) if (!byNo.has(n)) problems.push(`surah ${n} is missing from the source`);
for (const g of byNo.values()) {
  if (g.en.size !== 1) problems.push(`surah ${g.number} carries ${g.en.size} different English spellings across its ayat: ${JSON.stringify([...g.en])}`);
  if (g.ar.size !== 1) problems.push(`surah ${g.number} carries ${g.ar.size} different Arabic spellings across its ayat: ${JSON.stringify([...g.ar])}`);
  if (![...g.en][0]) problems.push(`surah ${g.number} has an empty English name`);
  if (![...g.ar][0]) problems.push(`surah ${g.number} has an empty Arabic name`);
}
if (problems.length) { console.error('IMPORT FAILED: the official source does not agree with itself.'); problems.forEach(p => console.error('  - ' + p)); process.exit(1); }

// ---- 5) build the records ----------------------------------------------------------------------
const records = [];
for (let n = 1; n <= TOTAL_SURAHS; n++) {
  const g = byNo.get(n);
  const nameEnSource = [...g.en][0];
  const nameArSource = [...g.ar][0];
  const slug = slugify(nameEnSource);
  if (!slug) die(`surah ${n} ("${nameEnSource}") slugified to an empty string`);
  records.push({
    number: n,
    nameArSource,
    nameEnSource,
    slug,
    path: `/quran/${slug}`,
    dataFile: String(n).padStart(3, '0') + '.json',
  });
}

// ---- 6) collisions STOP the run — they are never auto-resolved ---------------------------------
const bySlug = new Map();
for (const r of records) { if (!bySlug.has(r.slug)) bySlug.set(r.slug, []); bySlug.get(r.slug).push(r.number); }
const dupes = [...bySlug.entries()].filter(([, ns]) => ns.length > 1);
if (dupes.length) {
  console.error('IMPORT FAILED: two or more surahs collapse to the same slug. A human must decide — this script');
  console.error('               will not pick a winner and will not invent a suffix.');
  for (const [slug, ns] of dupes) console.error(`  - "${slug}" <- surahs ${ns.join(', ')} (${ns.map(n => records[n - 1].nameEnSource).join(' | ')})`);
  process.exit(1);
}
const reserved = records.filter(r => RESERVED.includes(r.slug));
if (reserved.length) {
  console.error('IMPORT FAILED: a surah slug collides with a reserved Quran path.');
  reserved.forEach(r => console.error(`  - surah ${r.number} "${r.nameEnSource}" -> "${r.slug}" (reserved)`));
  process.exit(1);
}
const shape = records.filter(r => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug));
if (shape.length) { console.error('IMPORT FAILED: slug does not match ^[a-z0-9]+(?:-[a-z0-9]+)*$'); shape.forEach(r => console.error(`  - ${r.number}: "${r.slug}"`)); process.exit(1); }

// ---- 7) emit --------------------------------------------------------------------------------------
// Provenance WITHOUT any clock reading: the source name + its fingerprint identify the input exactly, and a
// timestamp would only make two identical builds differ. `source-manifest.json` already carries downloadedAt.
const manifest = {
  source: 'KFGQPC Uthmanic Hafs v2.0',
  sourceArchive: 'UthmanicHafs_v2-0.zip',
  sourceSha256: FP.sha256,
  sourceFields: ['sura_no', 'sura_name_ar', 'sura_name_en'],
  slugRule: 'NFKD -> lowercase -> drop combining marks -> drop apostrophes -> separators to "-" -> keep [a-z0-9-] -> collapse "-" -> trim',
  pathPattern: '/quran/{slug}',
  surahCount: records.length,
  surahs: records,
};
const json = JSON.stringify(manifest, null, 2) + '\n';   // fixed 2-space indent + a single trailing LF

if (CHECK_ONLY) {
  console.log(`OK — ${records.length} surahs, ${bySlug.size} unique slugs, no reserved collision.`);
  console.log('sha256(surah-routes.json) = ' + hash('sha256', Buffer.from(json, 'utf8')));
  process.exit(0);
}
const outFile = path.join(OUT_DIR, 'metadata', 'surah-routes.json');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, json, 'utf8');
console.log(`wrote ${path.relative(ROOT, outFile)} — ${records.length} surahs, ${bySlug.size} unique slugs`);
console.log('sha256 = ' + hash('sha256', Buffer.from(json, 'utf8')));
