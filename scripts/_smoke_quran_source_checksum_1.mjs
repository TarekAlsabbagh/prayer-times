// Smoke — Tanzil model: vendor + per-surah + combined checksums all match the data on disk.
import fs from 'fs'; import path from 'path'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
let pass = 0, fail = 0; const ok = (c, m) => c ? pass++ : (fail++, console.log('  FAIL ' + m));
const ck = JSON.parse(fs.readFileSync(path.join(BASE,'vendor','checksums.json'),'utf8'));
const man = JSON.parse(fs.readFileSync(path.join(BASE,'vendor','manifest.json'),'utf8'));
ok(sha(fs.readFileSync(path.join(BASE,'vendor','quran-uthmani-1.1.xml'))) === ck.textRawSha256, 'text raw SHA matches checksums.json');
ok(sha(fs.readFileSync(path.join(BASE,'vendor','quran-data-1.1.xml'))) === ck.metaRawSha256, 'meta raw SHA matches checksums.json');
ok(man.textRawSha256 === ck.textRawSha256 && man.metaRawSha256 === ck.metaRawSha256, 'manifest SHAs match checksums.json');
const per = JSON.parse(fs.readFileSync(path.join(BASE,'metadata','surah-checksums.json'),'utf8')).perSurah;
let bad = 0, bodies = [];
for (let n = 1; n <= 114; n++) { const buf = fs.readFileSync(path.join(BASE,'surahs',String(n).padStart(3,'0')+'.json'));
  if (sha(buf) !== per[n] || sha(buf) !== ck.perSurah[n]) bad++;
  const s = JSON.parse(buf.toString('utf8')); for (const a of s.ayahs) bodies.push(n+':'+a.ayah+'\t'+a.textUthmaniBody); }
ok(bad === 0, 'all 114 per-surah SHA-256 match surah-checksums.json + vendor checksums.json');
ok(sha(Buffer.from(bodies.slice().sort().join('\n'))) === ck.verseBodiesSha256, 'combined verse-bodies SHA matches checksums.json');
ok(!!JSON.parse(fs.readFileSync(path.join(BASE,'metadata','basmala.json'),'utf8')).textUthmaniBody, 'basmala present');
console.log('RESULT source_checksum(Tanzil): '+pass+' passed, '+fail+' failed');
if (fail) process.exit(1);
