/*
 * _build_quran_tanzil_uthmani_1.mjs
 * ---------------------------------------------------------------------------
 * Reproducible importer: builds the project's Arabic Quran data ENTIRELY from
 * OFFICIAL Tanzil sources (Version 1.1), VERBATIM. ZERO KFGQPC provenance.
 *
 *   Text  : vendor/quran-uthmani-1.1.xml   (verse text + separate bismillah)
 *   Meta  : vendor/quran-data-1.1.xml       (sura names, ayah counts, juz)
 *   Both are CC BY 3.0 (Tanzil Project). No network at build time.
 *
 * The generated surah files are a FLAT ayah sequence. There is NO Madinah-
 * mushaf page/line layout, NO firstPage/lastPage/pageCount, NO KFGQPC private-
 * use markers (U+FC00). Every non-text field is sourced from Tanzil metadata or
 * derived purely from the canonical chapter:verse structure.
 *
 * STRICT: no network, no normalization, no text change, no KFGQPC data, no
 * fuzzy matching. Fails immediately on any anomaly.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const NEW = path.join(ROOT, 'data', 'quran', 'tanzil-uthmani-1-1');
const TEXT_XML = path.join(NEW, 'vendor', 'quran-uthmani-1.1.xml');
const META_XML = path.join(NEW, 'vendor', 'quran-data-1.1.xml');
const EXPECT_TEXT_SHA = '203F0F1BF3158B1E5BE4AB9F8F6870E570AAB6D9A626FE6192A70B75D4AFE0FD';
const EXPECT_META_SHA = '8867C1D88191472ADEC9DB694B3CD9F135B1A2EF580574D32CF888DCB22C5C7A';

const sha = b => crypto.createHash('sha256').update(b).digest('hex').toUpperCase();
const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
function die(m) { console.error('BUILD FAILED: ' + m); process.exit(1); }

// ---- 1. read + verify both vendor files ------------------------------------
const textBuf = fs.readFileSync(TEXT_XML), metaBuf = fs.readFileSync(META_XML);
if (sha(textBuf) !== EXPECT_TEXT_SHA) die('text vendor SHA mismatch: ' + sha(textBuf));
if (sha(metaBuf) !== EXPECT_META_SHA) die('meta vendor SHA mismatch: ' + sha(metaBuf));
const textXml = textBuf.toString('utf8'), metaXml = metaBuf.toString('utf8');
if (textBuf.length === textXml.length) die('text vendor not valid UTF-8 multibyte');

// ---- 2. metadata: sura names + ayah counts + juz boundaries (Tanzil) -------
const metaSura = new Map();   // n -> {name, ayas, tname, ename}
let msm; const msRe = /<sura\s+([^>]*?)\/>/g;
while ((msm = msRe.exec(metaXml))) {
    const a = Object.fromEntries([...msm[1].matchAll(/([a-zA-Z]+)="([^"]*)"/g)].map(x => [x[1], dec(x[2])]));
    if (a.index) metaSura.set(+a.index, { name: a.name, ayas: +a.ayas, tname: a.tname, ename: a.ename });
}
if (metaSura.size !== 114) die('meta sura count ' + metaSura.size + ' != 114');
// ENCODING TRIPWIRE: the Arabic sura names must be genuine UTF-8 Arabic. A metadata file pulled through a
// charset-lossy download re-encodes each Arabic byte into Latin-1 mojibake (Ø Ù …). We NEVER repair that
// here — no Latin-1 re-encode, no per-name fix list, no foreign name source — because the only correct fix
// is re-downloading the official raw file. A corrupt file HARD-FAILS the build instead of being patched.
const ENC_FAIL = 'TANZIL METADATA ENCODING INVALID — OFFICIAL RAW FILE MUST BE RE-DOWNLOADED';
const MOJIBAKE = /[À-ÿ�]/;   // Latin-1 supplement letters + U+FFFD (never in clean Arabic names)
const ARABIC = /[؀-ۿ]/;           // at least one Arabic-script codepoint must be present
const _seenName = new Set();
for (const [n, m] of metaSura) {
    const nm = m.name;
    if (!nm || !nm.trim()) die(ENC_FAIL + ' (empty sura name ' + n + ')');
    if (MOJIBAKE.test(nm)) die(ENC_FAIL + ' (mojibake in sura ' + n + ' name: ' + JSON.stringify(nm) + ')');
    if (!ARABIC.test(nm)) die(ENC_FAIL + ' (sura ' + n + ' name is not Arabic: ' + JSON.stringify(nm) + ')');
    if (_seenName.has(nm)) die(ENC_FAIL + ' (duplicate sura name ' + JSON.stringify(nm) + ')');
    _seenName.add(nm);
}
const juzStarts = [];         // {juz, sura, aya}
let mjm; const mjRe = /<juz\s+index="(\d+)"\s+sura="(\d+)"\s+aya="(\d+)"\s*\/>/g;
while ((mjm = mjRe.exec(metaXml))) juzStarts.push({ juz: +mjm[1], sura: +mjm[2], aya: +mjm[3] });
if (juzStarts.length !== 30) die('juz count ' + juzStarts.length + ' != 30');

// ---- 3. text: verse text + separate bismillah (Tanzil) ---------------------
const suras = new Map();       // n -> { ayat:Map(a->text), bismillah:Map(a->text) }
let sm; const suraRe = /<sura\s+index="(\d+)"\s+name="[^"]*"\s*>([\s\S]*?)<\/sura>/g;
while ((sm = suraRe.exec(textXml))) {
    const n = +sm[1]; const rec = { ayat: new Map(), bismillah: new Map() };
    let am; const ayaRe = /<aya\s+index="(\d+)"\s+text="([^"]*)"(?:\s+bismillah="([^"]*)")?\s*\/>/g;
    while ((am = ayaRe.exec(sm[2]))) { rec.ayat.set(+am[1], dec(am[2])); if (am[3] !== undefined) rec.bismillah.set(+am[1], dec(am[3])); }
    suras.set(n, rec);
}
if (suras.size !== 114) die('text sura count != 114');

// ---- 4. canonical key set + coverage validation ----------------------------
const refKeys = new Set(); const orderedKeys = [];
for (let n = 1; n <= 114; n++) { const c = metaSura.get(n).ayas; for (let a = 1; a <= c; a++) { refKeys.add(n + ':' + a); orderedKeys.push([n, a]); } }
if (refKeys.size !== 6236) die('reference keys != 6236');
let total = 0; const seen = new Set();
for (const [n, rec] of suras) for (const [a, t] of rec.ayat) {
    const k = n + ':' + a; total++;
    if (seen.has(k)) die('dup ' + k); seen.add(k);
    if (!refKeys.has(k)) die('unknown ' + k);
    if (!t || t.trim() === '') die('empty ' + k);
    if ([...t].some(ch => { const c = ch.codePointAt(0); return c === 0xFC00 || (c >= 0xE000 && c <= 0xF8FF) || (c >= 0xFC00 && c <= 0xFDFF); })) die('private-use / FC00 marker in ' + k);
}
if (total !== 6236) die('text ayah total ' + total + ' != 6236');
for (const k of refKeys) if (!seen.has(k)) die('missing ' + k);
let bism = 0; for (const [, r] of suras) bism += r.bismillah.size;
if (bism !== 112) die('bismillah count ' + bism + ' != 112');

// ---- 5. derive per-ayah juz + per-surah juz array + juz.json ----------------
// walk canonical order; each ayah belongs to the latest juz whose start <= it
const startIdx = new Map(juzStarts.map(j => [j.sura + ':' + j.aya, j.juz]));
const ayahJuz = new Map(); let curJuz = 1;
for (const [n, a] of orderedKeys) { const k = n + ':' + a; if (startIdx.has(k)) curJuz = startIdx.get(k); ayahJuz.set(k, curJuz); }
const surahJuz = new Map();    // surah -> sorted juz numbers
const juzSurahs = new Map();   // juz -> Map(surah -> {firstAyah,lastAyah,count})
for (const [n, a] of orderedKeys) {
    const j = ayahJuz.get(n + ':' + a);
    if (!surahJuz.has(n)) surahJuz.set(n, new Set()); surahJuz.get(n).add(j);
    if (!juzSurahs.has(j)) juzSurahs.set(j, new Map());
    const m = juzSurahs.get(j);
    if (!m.has(n)) m.set(n, { surah: n, firstAyah: a, lastAyah: a, ayahCount: 0 });
    const e = m.get(n); e.lastAyah = a; e.ayahCount++;
}
const juzJson = [];
for (let j = 1; j <= 30; j++) {
    const surs = [...juzSurahs.get(j).values()];
    juzJson.push({ juz: j, ayahCount: surs.reduce((s, x) => s + x.ayahCount, 0), surahCount: surs.length, surahs: surs });
}

// ---- 6. write flat surah files (TEXT = Tanzil verbatim; NO page/line) -------
for (const sub of ['surahs', 'metadata']) { const d = path.join(NEW, sub); if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); }
const perSurahSha = {}; const reassembled = []; const basmalaModes = {};
const chaptersJson = [];
for (let n = 1; n <= 114; n++) {
    const meta = metaSura.get(n); const tz = suras.get(n);
    const basmalaMode = tz.bismillah.size ? 'separate' : (n === 9 ? 'none' : 'first-ayah');
    basmalaModes[basmalaMode] = (basmalaModes[basmalaMode] || 0) + 1;
    const juz = [...surahJuz.get(n)].sort((a, b) => a - b);
    const ayahs = [];
    for (let a = 1; a <= meta.ayas; a++) {
        const t = tz.ayat.get(a); if (t === undefined) die('no text ' + n + ':' + a);
        reassembled.push(n + ':' + a + '\t' + t);
        ayahs.push({ ayah: a, textUthmaniBody: t });
    }
    const out = { surah: n, nameAr: meta.name, nameEn: meta.tname, ayahCount: meta.ayas, basmalaMode, juz, source: 'Tanzil Uthmani 1.1', ayahs };
    const json = JSON.stringify(out, null, 2) + '\n';
    fs.writeFileSync(path.join(NEW, 'surahs', String(n).padStart(3, '0') + '.json'), json);
    perSurahSha[n] = sha(Buffer.from(json, 'utf8'));
    chaptersJson.push({ number: n, nameAr: meta.name, nameEn: meta.tname, ename: meta.ename, ayahCount: meta.ayas, juz });
}
if (reassembled.length !== 6236) die('generated ayah total != 6236');
{
    const g = sha(Buffer.from(reassembled.slice().sort().join('\n')));
    const s = sha(Buffer.from([...suras.entries()].flatMap(([n, r]) => [...r.ayat.entries()].map(([a, t]) => n + ':' + a + '\t' + t)).sort().join('\n')));
    if (g !== s) die('generated text != source text (self-check)');
}

// ---- 7. metadata files (all Tanzil-sourced; no page/line) -------------------
fs.writeFileSync(path.join(NEW, 'metadata', 'chapters.json'), JSON.stringify(chaptersJson, null, 2) + '\n');
fs.writeFileSync(path.join(NEW, 'metadata', 'juz.json'), JSON.stringify(juzJson, null, 2) + '\n');
const basmalaText = suras.get(2).bismillah.get(1);
fs.writeFileSync(path.join(NEW, 'metadata', 'basmala.json'), JSON.stringify({
    source: 'Tanzil Uthmani 1.1', license: 'CC BY 3.0', textUthmaniBody: basmalaText,
    note: 'Separate display element for the 112 suras with basmalaMode "separate". Verbatim from Tanzil (sura 2 bismillah). Not part of the 6236 verse keys.',
}, null, 2) + '\n');
// surah-routes.json: preserve the slug/path URL contract from the self-contained vendor slug file
// (NOT the old KFGQPC dir); source the display names from Tanzil metadata.
const slugData = JSON.parse(fs.readFileSync(path.join(NEW, 'vendor', 'surah-slugs.json'), 'utf8'));
const slugByNum = new Map(slugData.surahs.map(r => [r.number, r]));
fs.writeFileSync(path.join(NEW, 'metadata', 'surah-routes.json'), JSON.stringify({
    source: 'Tanzil Uthmani 1.1', sourceUrl: 'https://tanzil.net',
    licenseName: 'Creative Commons Attribution 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    slugRule: slugData.slugRule, pathPattern: slugData.pathPattern, surahCount: 114,
    surahs: [...Array(114)].map((_, i) => { const n = i + 1; const r = slugByNum.get(n); const m = metaSura.get(n); return { number: n, nameArSource: m.name, nameEnSource: m.tname, slug: r.slug, path: r.path, dataFile: r.dataFile }; }),
}, null, 2) + '\n');
fs.writeFileSync(path.join(NEW, 'metadata', 'surah-checksums.json'), JSON.stringify({ source: 'Tanzil Uthmani 1.1', algorithm: 'sha256', perSurah: perSurahSha }, null, 2) + '\n');

// ---- 8. manifests + checksums ----------------------------------------------
const combinedSha = sha(Buffer.from(Object.keys(perSurahSha).sort((a, b) => a - b).map(n => n + ':' + perSurahSha[n]).join('\n')));
const bodiesSha = sha(Buffer.from(reassembled.slice().sort().join('\n')));
const prov = {
    sourceName: 'Tanzil Project', textType: 'Uthmani', sourceVersion: '1.1',
    sourceUrl: 'https://tanzil.net', downloadPage: 'https://tanzil.net/docs/download', updatesUrl: 'https://tanzil.net/updates/',
    licenseName: 'Creative Commons Attribution 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    textUsedVerbatim: true, retrievedAt: process.env.QURAN_BUILD_RETRIEVED_AT || '2026-07-21T00:00:00Z',
    textRawFile: 'quran-uthmani-1.1.xml', textRawSha256: sha(textBuf),
    metaRawFile: 'quran-data-1.1.xml', metaRawSha256: sha(metaBuf),
    chapterCount: 114, verseCount: 6236, bismillahElements: 112,
    dataVersion: 'tanzil-uthmani-1-1-' + sha(textBuf).slice(0, 8).toLowerCase(), encoding: 'UTF-8',
    layout: 'flat ayah sequence (no positional mushaf layout metadata)',
    nonTextFieldsSource: 'Tanzil metadata (quran-data-1.1.xml, CC BY 3.0): sura names, ayah counts, juz boundaries. No proprietary layout data.',
};
fs.writeFileSync(path.join(NEW, 'vendor', 'manifest.json'), JSON.stringify(prov, null, 2) + '\n');
fs.writeFileSync(path.join(NEW, 'vendor', 'checksums.json'), JSON.stringify({ algorithm: 'sha256', textRawSha256: sha(textBuf), metaRawSha256: sha(metaBuf), combinedPerSurahSha256: combinedSha, verseBodiesSha256: bodiesSha, perSurah: perSurahSha }, null, 2) + '\n');
fs.writeFileSync(path.join(NEW, 'source-manifest.json'), JSON.stringify(prov, null, 2) + '\n');

console.log('BUILD OK: Tanzil Uthmani 1.1 (flat, zero KFGQPC)');
console.log('  text sha=' + sha(textBuf) + '  meta sha=' + sha(metaBuf));
console.log('  suras=114 ayat=' + reassembled.length + ' bismillah=' + bism + ' juz=30 missing=0 dup=0 unknown=0 empty=0 fc00=0');
console.log('  basmalaModes=' + JSON.stringify(basmalaModes));
console.log('  verseBodiesSha256=' + bodiesSha);
