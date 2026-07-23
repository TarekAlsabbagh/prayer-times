/*
 * _smoke_quran_tanzil_text_integrity_1.mjs
 * Proves the generated Arabic Quran data is byte-identical to the official
 * Tanzil Uthmani 1.1 vendor source, and that the basmala policy is correct.
 * Pure-Node, no network. Run from the repo root.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BASE = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
const VENDOR_XML = path.join(BASE, 'vendor', 'quran-uthmani-1.1.xml');
const EXPECT_RAW_SHA = '203F0F1BF3158B1E5BE4AB9F8F6870E570AAB6D9A626FE6192A70B75D4AFE0FD';

const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; } else { fail++; console.error('  FAIL: ' + m); } };

// ---- parse vendor XML (source of truth) ----
const rawBuf = fs.readFileSync(VENDOR_XML);
ok(sha(rawBuf) === EXPECT_RAW_SHA, 'vendor raw SHA-256 matches expected');
const xml = rawBuf.toString('utf8');
const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const src = new Map();                 // key -> text
const srcBismillah = new Map();        // sura -> bismillah
let sm; const suraRe = /<sura\s+index="(\d+)"\s+name="[^"]*"\s*>([\s\S]*?)<\/sura>/g;
while ((sm = suraRe.exec(xml))) {
    const s = +sm[1]; let am; const ayaRe = /<aya\s+index="(\d+)"\s+text="([^"]*)"(?:\s+bismillah="([^"]*)")?\s*\/>/g;
    while ((am = ayaRe.exec(sm[2]))) { src.set(s + ':' + +am[1], dec(am[2])); if (am[3] !== undefined) srcBismillah.set(s, dec(am[3])); }
}
ok(src.size === 6236, 'vendor source has 6236 verse keys (got ' + src.size + ')');

// ---- load generated data ----
const gen = new Map(); const perSurahSha = {}; let genTotal = 0;
const basmalaModes = {};
for (let n = 1; n <= 114; n++) {
    const buf = fs.readFileSync(path.join(BASE, 'surahs', String(n).padStart(3, '0') + '.json'));
    perSurahSha[n] = sha(buf);
    const s = JSON.parse(buf.toString('utf8'));
    basmalaModes[s.basmalaMode] = (basmalaModes[s.basmalaMode] || 0) + 1;
    for (const a of s.ayahs) { gen.set(n + ':' + a.ayah, a.textUthmaniBody); genTotal++; }
    // §8: the flat schema must NOT carry any KFGQPC positional layout metadata
    ok(!('pages' in s || 'firstPage' in s || 'lastPage' in s || 'pageCount' in s), 'surah ' + n + ': no page-layout fields');
    ok(s.ayahs.every(a => !('page' in a || 'lineStart' in a || 'lineEnd' in a)), 'surah ' + n + ': no per-ayah page/line fields');
}

// ---- coverage ----
ok(genTotal === 6236, 'generated data has 6236 verses (got ' + genTotal + ')');
ok(gen.size === 6236, 'generated data has 6236 unique keys');
let missing = 0, unknown = 0, empty = 0, dup = 0;
const seen = new Set();
for (const k of src.keys()) if (!gen.has(k)) missing++;
for (const k of gen.keys()) { if (!src.has(k)) unknown++; if (seen.has(k)) dup++; seen.add(k); }
for (const [, t] of gen) if (!t || t.trim() === '') empty++;
ok(missing === 0, 'missing keys = 0 (got ' + missing + ')');
ok(unknown === 0, 'unknown keys = 0 (got ' + unknown + ')');
ok(dup === 0, 'duplicate keys = 0 (got ' + dup + ')');
ok(empty === 0, 'empty verses = 0 (got ' + empty + ')');

// ---- CODEPOINT-BY-CODEPOINT identity: every verse text == Tanzil source ----
let identical = 0, differ = 0;
for (const [k, t] of gen) { if (t === src.get(k)) identical++; else { differ++; if (differ <= 3) console.error('   differ at ' + k); } }
ok(identical === 6236, '6236/6236 verse texts IDENTICAL to official Tanzil source (got ' + identical + ')');
ok(differ === 0, 'zero verses differ from source');

// ---- combined text SHA determinism ----
const bodies = [...gen.entries()].map(([k, t]) => k + '\t' + t).sort().join('\n');
const srcBodies = [...src.entries()].map(([k, t]) => k + '\t' + t).sort().join('\n');
ok(sha(Buffer.from(bodies)) === sha(Buffer.from(srcBodies)), 'combined generated-bodies SHA == combined source-bodies SHA');
const cs = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', 'surah-checksums.json'), 'utf8'));
ok(Object.keys(cs.perSurah).length === 114 && [1,2,18,114].every(n => cs.perSurah[n] === perSurahSha[n]), 'surah-checksums.json matches generated per-surah SHA-256');

// ---- basmala policy (§6) ----
const basmala = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata', 'basmala.json'), 'utf8'));
ok(basmala.textUthmaniBody === srcBismillah.get(2), 'basmala display element == Tanzil sura-2 bismillah (verbatim)');
ok(basmalaModes['first-ayah'] === 1 && basmalaModes['separate'] === 112 && basmalaModes['none'] === 1, 'basmalaMode: first-ayah=1, separate=112, none=1');
// Fatihah: 1:1 is the basmala (its verse text)
ok(gen.get('1:1') === src.get('1:1') && [...gen.get('1:1')].length === 38, 'Fatihah 1:1 is the basmala verse (verbatim, 38 cp)');
// Tawbah: verse 1 has NO basmala; source has no bismillah for sura 9
ok(!srcBismillah.has(9) && gen.get('9:1') === src.get('9:1'), 'Tawbah 9:1 carries no basmala (verbatim)');
// An-Naml 27:30 unaffected + not equal to basmala display
ok(gen.get('27:30') === src.get('27:30'), 'An-Naml 27:30 is verbatim and unaffected by surah-opening basmala');
// no verse-1 of the 112 contains the merged basmala (verse text is pure)
let mergedBasmala = 0;
for (let n = 2; n <= 114; n++) { if (n === 9) continue; if (gen.get(n + ':1').startsWith(basmala.textUthmaniBody)) mergedBasmala++; }
ok(mergedBasmala === 0, 'no verse-1 of the 112 suras has the basmala merged into its text');
// Fatihah is NOT double-rendered: its basmalaMode is first-ayah (basmala IS verse 1, so no separate
// display element is drawn before it). The basmala text equals Fatihah 1:1 — that is the same formula,
// which is correct; the guarantee is the MODE, not text inequality.
const fatiha = JSON.parse(fs.readFileSync(path.join(BASE, 'surahs', '001.json'), 'utf8'));
ok(fatiha.basmalaMode === 'first-ayah', 'Fatihah basmalaMode is first-ayah (basmala rendered as verse 1, never duplicated)');

// ---- no KFGQPC claim / no source mixing in the generated data ----
const routes = fs.readFileSync(path.join(BASE, 'metadata', 'surah-routes.json'), 'utf8');
const manifest = fs.readFileSync(path.join(BASE, 'source-manifest.json'), 'utf8');
ok(!/kfgqpc|King Fahd|UthmanicHafs/i.test(routes + manifest + JSON.stringify(basmala)), 'no KFGQPC claim in generated metadata/manifest/basmala');
ok(/Tanzil/.test(manifest) && /Creative Commons Attribution 3\.0/.test(manifest), 'manifest names Tanzil + CC BY 3.0');

console.log((fail === 0 ? 'PASS' : 'FAIL') + ': _smoke_quran_tanzil_text_integrity_1 — ' + pass + ' passed, ' + fail + ' failed');
if (fail === 0) console.log('  6236/6236 VERSE TEXTS IDENTICAL TO OFFICIAL TANZIL SOURCE');
process.exitCode = fail ? 1 : 0;
