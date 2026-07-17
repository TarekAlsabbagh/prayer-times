// Smoke — QURAN-AR-FINAL-OFFICIAL-ENGLISH-SLUG-URL-STRUCTURE-NO-REDIRECTS-1 §16: SOURCE-DERIVED NAMES.
//
// Every English surah name, and therefore every URL this site publishes for the Quran, traces to the official
// KFGQPC package and to nothing else. That claim is only worth something if it is checked, so this asserts the
// whole chain rather than the end of it:
//
//   the ZIP's three published fingerprints  →  6236 ayah records  →  114 surahs, each spelt ONE way across all
//   of its ayat  →  114 slugs, all distinct, none reserved, none carrying a digit  →  the committed
//   surah-routes.json is byte-for-byte what that source produces today.
//
// It also proves the FAILURE path, which matters more than the happy one: a missing or tampered source must
// abort with a non-zero exit and leave NO file behind. A builder that half-writes a manifest from a corrupt
// download would publish 114 URLs nobody can vouch for.
//
//   QURAN_SOURCE_DIR=/path/to/.quran-source node scripts/_smoke_quran_surah_routes_source_names_1.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { slugify, RESERVED } from './quran/build_surah_routes.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0');
const BUILDER = path.join(ROOT, 'scripts', 'quran', 'build_surah_routes.mjs');
const SRC_DIR = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
// core.autocrlf=true materialises text files with CRLF on checkout while the builder writes LF. Same content,
// different bytes — so byte comparisons normalise first, or they fail on a fresh clone and tell us nothing.
const lf = (b) => Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');

const ROUTES = JSON.parse(fs.readFileSync(path.join(D, 'metadata/surah-routes.json'), 'utf8'));
const R = ROUTES.surahs;
const CH = JSON.parse(fs.readFileSync(path.join(D, 'metadata/chapters.json'), 'utf8'));

console.log('\n--- 1) the slug rule is a pure function of the name, with no per-surah exceptions ---');
// Imported from the builder itself: if these drift apart the URLs drift with them.
for (const [nameEn, want, why] of [
  ["Al-Anbiyā’", 'al-anbiya', 'combining marks dropped, apostrophe VANISHES (not turned into a dash)'],
  ["Al-Mā’idah", 'al-maidah', 'an interior apostrophe never becomes al-ma-idah'],
  ['Al-Fātiḥah', 'al-fatihah', 'ḥ decomposes to h + a combining mark, which is dropped'],
  ['An-Nās', 'an-nas', 'plain macron'],
  ['Yā-Sīn', 'ya-sin', 'a real hyphen survives as the separator'],
  ['Āl-‘Imrān', 'al-imran', 'a leading ‘ayn mark is dropped, not transliterated'],
]) ok(slugify(nameEn) === want, `slugify("${nameEn}") → "${want}" (${why}) — got "${slugify(nameEn)}"`);
ok(slugify('Al-Anbiyā’') === slugify('Al-Anbiyā’'), 'slugify is deterministic for the same input');

console.log('\n--- 2) the committed manifest is exactly what the official source produces TODAY ---');
// --check rebuilds in memory from the fingerprint-gated ZIP and prints the hash it WOULD write. If that
// differs from the committed file, either the file was hand-edited or the source changed — both must be loud.
let checkOut = '';
try {
  checkOut = execFileSync(process.execPath, [BUILDER, '--check'], {
    cwd: ROOT, stdio: 'pipe', env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: SRC_DIR }),
  }).toString();
} catch (e) { checkOut = 'BUILDER FAILED: ' + (e.stdout || '') + (e.stderr || ''); }
if (/BUILDER FAILED/.test(checkOut)) {
  ok(false, 'the builder runs against the source — ' + checkOut.slice(0, 300));
} else {
  const want = (checkOut.match(/sha256\(surah-routes\.json\) = ([0-9A-F]+)/) || [])[1];
  const got = sha(lf(fs.readFileSync(path.join(D, 'metadata/surah-routes.json'))));
  ok(!!want, 'the builder reports the sha256 it would write');
  ok(want === got, `the committed surah-routes.json IS the source's output — want ${want}, on disk ${got}`);
  ok(/114 surahs, 114 unique slugs, no reserved collision/.test(checkOut), 'the builder itself reports 114 surahs + 114 unique slugs + no reserved collision');
}

console.log('\n--- 3) the manifest agrees with chapters.json, name for name ---');
// Two files, one source. If a name disagrees, one of them was typed by a human.
const nameMismatch = R.filter(r => {
  const c = CH.find(x => x.number === r.number);
  return !c || c.nameAr !== r.nameArSource || c.nameEn !== r.nameEnSource;
});
ok(nameMismatch.length === 0, 'all 114 nameArSource/nameEnSource match chapters.json exactly'
   + (nameMismatch.length ? ' — ' + JSON.stringify(nameMismatch.slice(0, 3).map(r => r.number)) : ''));
ok(R.length === 114 && CH.length === 114, `both carry 114 records — routes=${R.length}, chapters=${CH.length}`);
ok(R.every((r, i) => r.number === i + 1), 'the manifest is sorted 1..114 with no gap and no repeat');
ok(R.every(r => r.dataFile === String(r.number).padStart(3, '0') + '.json'), 'every record names its own data file');
ok(R.every(r => fs.existsSync(path.join(D, 'surahs', r.dataFile))), 'every named data file exists on disk');

console.log('\n--- 4) the slugs themselves ---');
ok(R.every(r => r.slug === slugify(r.nameEnSource)), 'every slug is what slugify() returns for its OWN source name — no hand-edited entry');
ok(new Set(R.map(r => r.slug)).size === 114, '114 DISTINCT slugs — no two surahs share a URL');
ok(!R.some(r => RESERVED.includes(r.slug)), 'no slug collides with a reserved Quran path (' + RESERVED.join(', ') + ')');
ok(!R.some(r => /\d/.test(r.slug)), 'NO slug contains a digit — the surah number never appears in the URL');
ok(R.every(r => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug)), 'every slug matches ^[a-z0-9]+(?:-[a-z0-9]+)*$');
ok(R.every(r => r.path === '/quran/' + r.slug), 'every path is exactly /quran/{slug} — one pattern, no variants');

console.log('\n--- 5) the manifest carries provenance and NO clock ---');
// A timestamp would make two identical builds differ, which is the one thing §16 forbids. The source name +
// its fingerprint identify the input exactly, so nothing is lost by leaving the clock out.
const rawManifest = fs.readFileSync(path.join(D, 'metadata/surah-routes.json'), 'utf8');
ok(ROUTES.source === 'KFGQPC Uthmanic Hafs v2.0' && ROUTES.sourceArchive === 'UthmanicHafs_v2-0.zip', 'the manifest names its source package + archive');
ok(/^[0-9A-F]{64}$/.test(ROUTES.sourceSha256 || ''), 'the manifest records the source SHA-256 it was gated on');
ok(JSON.stringify(ROUTES.sourceFields) === JSON.stringify(['sura_no', 'sura_name_ar', 'sura_name_en']), 'the manifest names the exact source fields the names came from');
ok(!/generatedAt|timestamp|"date"|\d{4}-\d{2}-\d{2}T/i.test(rawManifest), 'NO timestamp anywhere in the manifest (a clock would break byte-identical rebuilds)');
const builderSrc = fs.readFileSync(BUILDER, 'utf8');
ok(!/Date\.now\(\)|new Date\(|Math\.random\(/.test(builderSrc), 'the builder reads NO clock and NO randomness — its output is a pure function of the source');
ok(!rawManifest.includes('\r\n') && rawManifest.endsWith('\n') && !rawManifest.endsWith('\n\n'), 'LF-only, exactly one trailing newline');

console.log('\n--- 6) the FAILURE path: a missing or tampered source aborts and writes NOTHING ---');
// This is the assertion that actually protects the reader. A builder that limps on after a bad download would
// mint 114 URLs from names nobody can vouch for.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-routes-guard-'));
const run = (srcDir, outDir) => {
  try {
    execFileSync(process.execPath, [BUILDER, '--out-dir=' + outDir], {
      cwd: ROOT, stdio: 'pipe', env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: srcDir }),
    });
    return { code: 0, err: '' };
  } catch (e) { return { code: e.status || 1, err: ((e.stdout || '') + (e.stderr || '')).toString() }; }
};
const wrote = (outDir) => fs.existsSync(path.join(outDir, 'metadata', 'surah-routes.json'));

// (a) source directory does not exist at all
const outA = path.join(tmp, 'out-a');
const a = run(path.join(tmp, 'no-such-source'), outA);
ok(a.code !== 0 && /IMPORT FAILED/.test(a.err), `a missing source aborts with IMPORT FAILED (exit ${a.code})`);
ok(!wrote(outA), '…and writes NO manifest — zero partial files');

// (b) the ZIP is present but its bytes are not the approved package
const badSrc = path.join(tmp, 'bad-source');
fs.mkdirSync(badSrc, { recursive: true });
fs.writeFileSync(path.join(badSrc, 'UthmanicHafs_v2-0.zip'), Buffer.from('this is not the approved package'));
fs.copyFileSync(path.join(SRC_DIR, 'hafsData_v2-0.json'), path.join(badSrc, 'hafsData_v2-0.json'));
const outB = path.join(tmp, 'out-b');
const b = run(badSrc, outB);
ok(b.code !== 0 && /mismatch/i.test(b.err), `a tampered ZIP fails the fingerprint gate (exit ${b.code})`);
ok(/MD5|SHA/i.test(b.err), '…and says which fingerprint disagreed');
ok(!wrote(outB), '…and writes NO manifest — the fingerprint gate runs BEFORE any name is read');

// (c) the ZIP is genuine but the JSON payload is truncated
const truncSrc = path.join(tmp, 'trunc-source');
fs.mkdirSync(truncSrc, { recursive: true });
fs.copyFileSync(path.join(SRC_DIR, 'UthmanicHafs_v2-0.zip'), path.join(truncSrc, 'UthmanicHafs_v2-0.zip'));
const full = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'hafsData_v2-0.json'), 'utf8'));
const rows = Array.isArray(full) ? full : (full.data || full.hafs || []);
fs.writeFileSync(path.join(truncSrc, 'hafsData_v2-0.json'), JSON.stringify(rows.slice(0, 6000)));
const outC = path.join(tmp, 'out-c');
const c = run(truncSrc, outC);
ok(c.code !== 0 && /6236 ayah records, got 6000/.test(c.err), `a truncated payload is caught by the 6236 count (exit ${c.code})`);
ok(!wrote(outC), '…and writes NO manifest');

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
