// Smoke — QURAN-AR-DATA-BUILD-ALL-114-1: DETERMINISTIC BUILD (118/118).
// The build must be a pure function of the verified source: two builds into two INDEPENDENT EMPTY output
// directories must produce byte-identical files. A build that is not reproducible cannot be trusted to carry
// the Quran text — any drift (a timestamp, an unsorted Map, a locale-dependent sort) means the committed data
// is not provably the verified source.
//
// The OFFICIAL output set is exactly 118 files: 114 surahs + chapters/basmala/juz/surah-checksums.
// `source-manifest.json` is NOT one of them — it is read-only provenance carrying `downloadedAt` (a
// wall-clock fact the build cannot invent). This test proves the build never writes it.
//
//   node scripts/_smoke_quran_data_deterministic_build_1.mjs
//   QURAN_SOURCE_DIR=/path/to/.quran-source node scripts/_smoke_quran_data_deterministic_build_1.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const MANIFEST = path.join(BASE, 'source-manifest.json');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').toUpperCase();

if (!fs.existsSync(path.join(SRC, 'UthmanicHafs_v2-0.zip'))) { console.log('SKIP — raw source not available at ' + SRC + ' (set QURAN_SOURCE_DIR)'); process.exit(0); }

// ---- the official output list, declared UP FRONT (not discovered from disk) ----
const OFFICIAL = [
  ...Array.from({ length: 114 }, (_, i) => 'surahs/' + String(i + 1).padStart(3, '0') + '.json'),
  'metadata/chapters.json', 'metadata/basmala.json', 'metadata/juz.json', 'metadata/surah-checksums.json',
];
ok(OFFICIAL.length === 118, 'the official output set is exactly 118 files — declared ' + OFFICIAL.length);

// ---- build into a fresh EMPTY directory (no pre-existing derived file, no other worktree) ----
function buildInto(dir) {
  fs.mkdirSync(path.join(dir, 'scripts', 'quran'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'surahs'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'metadata'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'scripts', 'quran', 'build.mjs'), path.join(dir, 'scripts', 'quran', 'build.mjs'));
  execFileSync(process.execPath, [path.join(dir, 'scripts', 'quran', 'build.mjs')], {
    cwd: dir, stdio: 'pipe',
    // the manifest is passed as a READ-ONLY input — never copied into the output dir
    env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: SRC, QURAN_MANIFEST_FILE: MANIFEST }),
  });
  return path.join(dir, 'data', 'quran', 'kfgqpc-hafs-v2-0');
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-det-'));
const A = buildInto(path.join(tmp, 'a'));
const B = buildInto(path.join(tmp, 'b'));

// ---- 1) two independent empty-dir builds are byte-identical, 118/118 ----
const missingA = OFFICIAL.filter(f => !fs.existsSync(path.join(A, f)));
ok(missingA.length === 0, 'build A produced all 118 official outputs from an EMPTY dir' + (missingA.length ? ' — missing ' + missingA.slice(0, 4) : ''));
const drift = OFFICIAL.filter(f => sha(path.join(A, f)) !== sha(path.join(B, f)));
ok(drift.length === 0, `two independent empty-dir builds are byte-identical — ${OFFICIAL.length - drift.length}/${OFFICIAL.length}` + (drift.length ? ' | drifted: ' + drift.slice(0, 6).join(', ') : ''));

// ---- 2) the output dir contains ONLY the official 118 (no manifest, no strays) ----
const produced = [
  ...fs.readdirSync(path.join(A, 'surahs')).map(f => 'surahs/' + f),
  ...fs.readdirSync(path.join(A, 'metadata')).map(f => 'metadata/' + f),
  ...fs.readdirSync(A).filter(f => fs.statSync(path.join(A, f)).isFile()),
].sort();
ok(produced.length === 118, 'the empty output dir holds exactly 118 files afterwards — got ' + produced.length + (produced.length !== 118 ? ' → ' + JSON.stringify(produced.filter(f => !OFFICIAL.includes(f))) : ''));
ok(!produced.includes('source-manifest.json'), 'source-manifest.json was NOT written into the output directory (it is provenance, not an output)');

// ---- 3) the repo's manifest is untouched by a build ----
const mfBefore = sha(MANIFEST), mtimeBefore = fs.statSync(MANIFEST).mtimeMs;
execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'quran', 'build.mjs')], {
  cwd: ROOT, stdio: 'pipe', env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: SRC }),
});
ok(sha(MANIFEST) === mfBefore, 'a real in-repo build leaves source-manifest.json byte-identical');
ok(fs.statSync(MANIFEST).mtimeMs === mtimeBefore, 'the build does not even re-write source-manifest.json (mtime unchanged)');

// ---- 4) no wall-clock in the build, and no timestamp in the outputs ----
const src = fs.readFileSync(path.join(ROOT, 'scripts', 'quran', 'build.mjs'), 'utf8');
const code = src.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n'); // ignore comments
ok(!/\bDate\.now\s*\(/.test(code), 'build.mjs contains no Date.now()');
ok(!/\bnew\s+Date\s*\(/.test(code), 'build.mjs contains no new Date() (nothing derived from the wall clock)');
ok(!/Math\.random\s*\(/.test(code), 'build.mjs contains no Math.random()');
const stamped = OFFICIAL.filter(f => /"(builtAt|generatedAt|timestamp|downloadedAt|date)"\s*:/i.test(fs.readFileSync(path.join(A, f), 'utf8')));
ok(stamped.length === 0, 'none of the 118 outputs embeds a timestamp field' + (stamped.length ? ' — ' + stamped.slice(0, 4) : ''));
const isoish = OFFICIAL.filter(f => /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(fs.readFileSync(path.join(A, f), 'utf8')));
ok(isoish.length === 0, 'none of the 118 outputs contains an ISO date-time string' + (isoish.length ? ' — ' + isoish.slice(0, 4) : ''));

// ---- 5) fails closed on a corrupt/absent source, before touching anything ----
const guardDir = path.join(tmp, 'guard');
fs.mkdirSync(path.join(guardDir, 'scripts', 'quran'), { recursive: true });
fs.mkdirSync(path.join(guardDir, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'surahs'), { recursive: true });
fs.mkdirSync(path.join(guardDir, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'metadata'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'scripts', 'quran', 'build.mjs'), path.join(guardDir, 'scripts', 'quran', 'build.mjs'));
// (a) missing source
let missErr = '';
try { execFileSync(process.execPath, [path.join(guardDir, 'scripts', 'quran', 'build.mjs')], { cwd: guardDir, stdio: 'pipe', env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: path.join(tmp, 'no-such-dir') }) }); }
catch (e) { missErr = String(e.stderr || ''); }
ok(/IMPORT FAILED: source ZIP missing/.test(missErr), 'the build HARD-fails when the source ZIP is missing');
// (b) corrupt fingerprint
const badSrc = path.join(tmp, 'badsrc');
fs.mkdirSync(badSrc, { recursive: true });
fs.writeFileSync(path.join(badSrc, 'UthmanicHafs_v2-0.zip'), Buffer.from('not the verified package'));
fs.copyFileSync(path.join(SRC, 'hafsData_v2-0.json'), path.join(badSrc, 'hafsData_v2-0.json'));
let badErr = '';
try { execFileSync(process.execPath, [path.join(guardDir, 'scripts', 'quran', 'build.mjs')], { cwd: guardDir, stdio: 'pipe', env: Object.assign({}, process.env, { QURAN_SOURCE_DIR: badSrc }) }); }
catch (e) { badErr = String(e.stderr || ''); }
ok(/IMPORT FAILED: MD5 mismatch/.test(badErr), 'the build HARD-fails on a corrupt source fingerprint');
const leftovers = [
  ...fs.readdirSync(path.join(guardDir, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'surahs')),
  ...fs.readdirSync(path.join(guardDir, 'data', 'quran', 'kfgqpc-hafs-v2-0', 'metadata')),
];
ok(leftovers.length === 0, 'a failed build leaves NO partial output behind — found ' + leftovers.length + ' file(s)');

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
