// Smoke — Tanzil model: the importer is deterministic (run twice from the same vendor files -> byte-identical),
// carries no timestamps inside surah files, and does no network I/O.
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url'; import { execFileSync } from 'child_process';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const snap = () => { const h = {}; for (let n = 1; n <= 114; n++) { h[n] = sha(fs.readFileSync(path.join(BASE, 'surahs', String(n).padStart(3, '0') + '.json'))); } return h; };
const before = snap();
execFileSync(process.execPath, [path.join(ROOT, 'scripts', '_build_quran_tanzil_uthmani_1.mjs')], { stdio: 'ignore' });
const after = snap();
let changed = 0; for (let n = 1; n <= 114; n++) if (before[n] !== after[n]) changed++;
ok(changed === 0, 're-running the importer produces byte-identical surah files (changed=' + changed + ')');
let ts = 0; for (let n = 1; n <= 114; n++) { if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(fs.readFileSync(path.join(BASE, 'surahs', String(n).padStart(3, '0') + '.json'), 'utf8'))) ts++; }
ok(ts === 0, 'no timestamps embedded in surah files');
const imp = fs.readFileSync(path.join(ROOT, 'scripts', '_build_quran_tanzil_uthmani_1.mjs'), 'utf8');
// only real network primitives — NOT URL string literals like "https://tanzil.net" or the word "download"
const netCall = /(?:require|import)\s*\(?\s*['"](?:node:)?https?['"]|\bfetch\s*\(|\bhttps?\.(?:get|request)\s*\(|\bXMLHttpRequest\b/;
ok(!netCall.test(imp), 'importer has no network calls');
ok(!/kfgqpc-hafs-v2-0\/surahs/i.test(imp), 'importer does not read verse text from the old KFGQPC surah files');
console.log('RESULT data_deterministic_build(Tanzil): ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
