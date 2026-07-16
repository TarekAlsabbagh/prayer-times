// Smoke — QURAN prototype: source archive fingerprints + manifest.
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'kfgqpc-hafs-v2-0');
let pass = 0, fail = 0; const F = []; const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const PIN = { md5: 'CF6841AEA5B1D1FD70D032B43FF08278', sha1: '36EA5AB0D7EA1702F17FF43F9B50924CCCD77EBF', sha256: 'A7B0E5591945712EC5E4D6142938AE4D1E9B49BDC89DFF06222789BFEBDFD72C' };
// Raw source ZIP lives OUTSIDE git in a local cache (.quran-source/, overridable via QURAN_SOURCE_DIR).
const SRC = process.env.QURAN_SOURCE_DIR || path.join(ROOT, '.quran-source');
const ZIP = path.join(SRC, 'UthmanicHafs_v2-0.zip');
if (!fs.existsSync(ZIP)) { console.log('SKIP — local Quran source cache not present (' + SRC + '); ZIP-hash checks need .quran-source/'); process.exit(0); }
const zip = fs.readFileSync(ZIP);
const H = a => crypto.createHash(a).update(zip).digest('hex').toUpperCase();
ok(H('md5') === PIN.md5, 'ZIP MD5 matches verified reference');
ok(H('sha1') === PIN.sha1, 'ZIP SHA-1 matches verified reference');
ok(H('sha256') === PIN.sha256, 'ZIP SHA-256 matches verified reference');
const man = JSON.parse(fs.readFileSync(path.join(BASE, 'source-manifest.json'), 'utf8'));
ok(man.md5 === PIN.md5 && man.sha1 === PIN.sha1 && man.sha256 === PIN.sha256, 'manifest records the 3 verified hashes');
ok(man.hashesVerifiedLocally === true, 'manifest marks hashesVerifiedLocally=true');
ok(man.hashesOfficiallyPublished === false, 'manifest does NOT claim official publication');
ok(man.archiveFile === 'UthmanicHafs_v2-0.zip' && man.packageVersion === '2.0' && man.updateNumber === '13.0' && man.readmeDate === '2022-09-07', 'manifest package/version/update/readmeDate fields present');
ok(man.dataVersion === 'kfgqpc-hafs-v2-0-a7b0e559', 'dataVersion = kfgqpc-hafs-v2-0-<sha256[0:8]>');
ok('sourcePageLastUpdated' in man, 'manifest has a SEPARATE sourcePageLastUpdated field (not mixed with readmeDate)');
console.log(`\nRESULT: ${pass} passed, ${fail} failed`); if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
