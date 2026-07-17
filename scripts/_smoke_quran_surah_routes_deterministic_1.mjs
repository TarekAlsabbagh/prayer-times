// Smoke — QURAN-AR-FINAL-OFFICIAL-ENGLISH-SLUG-URL-STRUCTURE-NO-REDIRECTS-1 §16: DETERMINISTIC BUILD.
//
// Two builds of surah-routes.json from EMPTY directories must be byte-identical. This is not tidiness: the
// manifest decides 114 public URLs, so "rebuild it" has to be a safe instruction. If the output could differ
// between runs, nobody could ever tell a real source change from noise, and a rebuilt file would show up as a
// spurious diff that reviewers learn to wave through.
//
// The usual way a generator fails this is a clock — `generatedAt`, a build stamp — or key order that follows
// object insertion instead of the surah number. Both are checked here by actually running the thing twice
// rather than by reading the code and hoping.
//
//   QURAN_SOURCE_DIR=/path/to/.quran-source node scripts/_smoke_quran_surah_routes_deterministic_1.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILDER = path.join(ROOT, 'scripts', 'quran', 'build_surah_routes.mjs');
const SRC_DIR = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const COMMITTED = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0/metadata/surah-routes.json');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
// core.autocrlf=true materialises the committed file with CRLF on checkout while the builder writes LF: same
// content, different bytes. Fresh builds are compared RAW (both LF, no git involved); only the comparison
// against the committed file normalises, and that is a checkout artefact, not slack in the test.
const lf = (b) => Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');

if (!fs.existsSync(path.join(SRC_DIR, 'UthmanicHafs_v2-0.zip'))) {
  console.log('SKIP — no source package at ' + SRC_DIR + ' (set QURAN_SOURCE_DIR)');
  process.exit(0);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-routes-det-'));
const build = (outDir) => {
  fs.mkdirSync(outDir, { recursive: true });          // empty dir, nothing to inherit from a previous run
  execFileSync(process.execPath, [BUILDER, '--out-dir=' + outDir], {
    cwd: ROOT, stdio: 'pipe', env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: SRC_DIR }),
  });
  return fs.readFileSync(path.join(outDir, 'metadata', 'surah-routes.json'));
};

console.log('\n--- two independent builds, each from an EMPTY directory ---');
const one = build(path.join(tmp, 'build-1'));
const two = build(path.join(tmp, 'build-2'));
ok(one.length > 0 && two.length > 0, `both builds produced a file — ${one.length} and ${two.length} bytes`);
ok(one.length === two.length, `identical length — ${one.length} vs ${two.length}`);
ok(one.equals(two), `BYTE-IDENTICAL across two builds — sha256 ${sha(one)}`);

console.log('\n--- …and the file in the repo is that same output ---');
const committed = fs.readFileSync(COMMITTED);
const crlf = committed.includes('\r\n');
ok(lf(committed).equals(one), 'the committed surah-routes.json equals a fresh build'
   + (crlf ? ' (committed file is CRLF in this working tree — content identical)' : ''));
ok(sha(lf(committed)) === sha(one), `same sha256 — ${sha(one)}`);

console.log('\n--- the output is ordered by surah, not by whatever order the source happened to be read in ---');
const parsed = JSON.parse(one.toString('utf8'));
ok(parsed.surahs.every((r, i) => r.number === i + 1), 'records run 1..114 in order');
const keys = Object.keys(parsed.surahs[0]);
ok(parsed.surahs.every(r => JSON.stringify(Object.keys(r)) === JSON.stringify(keys)),
   'every record carries the SAME keys in the SAME order — ' + keys.join(', '));
ok(parsed.surahCount === 114 && parsed.surahs.length === 114, `surahCount agrees with the array — ${parsed.surahCount}/${parsed.surahs.length}`);

console.log('\n--- nothing in the output can vary between runs ---');
const text = one.toString('utf8');
ok(!/generatedAt|"timestamp"|buildTime|\d{4}-\d{2}-\d{2}T\d{2}:/i.test(text), 'no timestamp / build stamp of any kind');
ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(text), 'no uuid / random id');
ok(!text.includes(os.tmpdir()) && !text.includes(ROOT) && !/[A-Za-z]:\\|\/home\/|\/Users\//.test(text),
   'no absolute filesystem path leaked into the manifest (the --out-dir did not bleed through)');
ok(!text.includes('\r\n') && text.endsWith('\n'), 'LF-only with a single trailing newline (stable across platforms)');

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
