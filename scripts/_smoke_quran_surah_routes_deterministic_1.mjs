// Smoke — QURAN-TANZIL-ORPHANED-SMOKES-AND-COMPLETE-LIGHTHOUSE-CLOSURE-1 §5: DETERMINISTIC ROUTES (Tanzil).
//
// Retargeted from the KFGQPC build pipeline (build_surah_routes.mjs + an external UthmanicHafs ZIP behind
// QURAN_SOURCE_DIR) to the Tanzil model, whose inputs are ALL committed inside Git. There is nothing to skip:
// surah-routes.json is a pure function of two tracked files — vendor/surah-slugs.json (the frozen URL contract)
// and metadata/chapters.json (the source names). This proves the manifest is exactly that reproduction, is
// ordered, and carries no clock — so "rebuild it" stays a safe, diff-free instruction.
//
//   node scripts/_smoke_quran_surah_routes_deterministic_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data/quran/tanzil-uthmani-1-1');                 // committed Tanzil source — no QURAN_SOURCE_DIR
const RAW = fs.readFileSync(path.join(BASE, 'metadata/surah-routes.json'), 'utf8');
const ROUTES = JSON.parse(RAW);
const R = ROUTES.surahs;
const SLUGS = JSON.parse(fs.readFileSync(path.join(BASE, 'vendor/surah-slugs.json'), 'utf8')).surahs;
const CH = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata/chapters.json'), 'utf8'));
const IMPORTER = fs.readFileSync(path.join(ROOT, 'scripts', '_build_quran_tanzil_uthmani_1.mjs'), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

console.log('\n--- the manifest is 114 records, ordered 1..114, uniform shape ---');
ok(ROUTES.surahCount === 114 && R.length === 114, `surahCount agrees with the array — ${ROUTES.surahCount}/${R.length}`);
ok(R.every((r, i) => r.number === i + 1), 'records run 1..114 in order, no gap and no repeat');
const keys0 = JSON.stringify(Object.keys(R[0]));
ok(R.every(r => JSON.stringify(Object.keys(r)) === keys0), 'every record carries the SAME keys in the SAME order — ' + Object.keys(R[0]).join(', '));

console.log('\n--- every record is a pure reproduction of the committed slug contract + chapter names ---');
const slugBy = new Map(SLUGS.map(s => [s.number, s]));
const chBy = new Map(CH.map(c => [c.number, c]));
const mism = [];
for (const r of R) {
  const s = slugBy.get(r.number), c = chBy.get(r.number);
  if (!s || r.slug !== s.slug) mism.push(`${r.number}:slug`);
  else if (r.path !== s.path || r.path !== '/quran/' + r.slug) mism.push(`${r.number}:path`);
  else if (r.dataFile !== s.dataFile || r.dataFile !== String(r.number).padStart(3, '0') + '.json') mism.push(`${r.number}:dataFile`);
  else if (!c || r.nameArSource !== c.nameAr || r.nameEnSource !== c.nameEn) mism.push(`${r.number}:name`);
}
ok(mism.length === 0, 'all 114 records reproduce vendor/surah-slugs.json + chapters.json exactly' + (mism.length ? ' — ' + mism.slice(0, 4) : ''));

console.log('\n--- nothing in the manifest can vary between runs ---');
ok(!/generatedAt|"timestamp"|buildTime|"date"|\d{4}-\d{2}-\d{2}T\d{2}:/i.test(RAW), 'no timestamp / build stamp of any kind');
ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(RAW), 'no uuid / random id');
// Windows drive paths (C:\\… — JSON-escaped) or unix absolute roots; NOT URL schemes like https:// which
// legitimately carry "s:/" and are real data (sourceUrl / licenseUrl).
ok(!/[A-Za-z]:\\\\|\/home\/|\/Users\/|\/tmp\/|\/var\/folders\//.test(RAW), 'no absolute filesystem path leaked into the manifest');
ok(!RAW.includes('\r\n') && RAW.endsWith('\n') && !RAW.endsWith('\n\n'), 'LF-only with exactly one trailing newline (stable across platforms)');

console.log('\n--- the importer that produces it reads no clock, no randomness, no network ---');
ok(!/Date\.now\(\)|new Date\(|Math\.random\(/.test(IMPORTER), 'the importer reads NO clock and NO randomness — its output is a pure function of the committed vendor files');
const netCall = /(?:require|import)\s*\(?\s*['"](?:node:)?https?['"]|\bfetch\s*\(|\bhttps?\.(?:get|request)\s*\(|\bXMLHttpRequest\b/;
ok(!netCall.test(IMPORTER), 'the importer makes no network call');
ok(!/QURAN_SOURCE_DIR|UthmanicHafs|kfgqpc-hafs-v2-0/i.test(IMPORTER), 'the importer needs NO external source dir and never reads the removed KFGQPC files');

console.log('\n--- the manifest names the Tanzil source, not KFGQPC ---');
ok(ROUTES.source === 'Tanzil Uthmani 1.1', `source is «${ROUTES.source}»`);
ok(!/KFGQPC|UthmanicHafs|King Fahd/i.test(RAW), 'no KFGQPC / UthmanicHafs / King-Fahd provenance remains in the manifest');
ok(!('sourceArchive' in ROUTES) && !('sourceFields' in ROUTES), 'the KFGQPC-only sourceArchive / sourceFields keys are gone');

console.log(`\nRESULT surah_routes_deterministic(Tanzil): ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
