// Smoke — QURAN-AR-SSR-SURAH-GENERALIZATION-1 §4/§6: TEXT INTEGRITY across all 114 served pages.
// The generalization rewrote the page builder. This test does not trust it: it fetches every one of the 114
// pages and compares the ayah text the SERVER ACTUALLY SENT, character by character, against the verified
// data files — all 6236 ayat. Anything less would let a template bug corrupt the Quran text unnoticed.
//
// Also asserts the basmala rule, which is the one place a plausible-looking template silently ADDS to or
// DUPLICATES the mushaf:
//   • Al-Fatiha  → basmala IS ayah 1 → exactly ONE basmala on the page, inside the ayah text, no opener
//   • At-Tawba   → NO basmala anywhere
//   • An-Naml    → ONE opener + the in-text 27:30 basmala = 2 occurrences (a "dedupe" here would be a bug)
//   • the rest   → exactly ONE opener, above ayah 1
//
//   QURAN_SSR_BASE=http://127.0.0.1:8085 node scripts/_smoke_quran_ssr_text_integrity_114_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.QURAN_SSR_BASE || 'http://127.0.0.1:8085';
const D = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0');
const CH = JSON.parse(fs.readFileSync(path.join(D, 'metadata/chapters.json'), 'utf8'));
// /quran/{official-english-slug} — read from the source-derived table, never spelled out in a test.
const ROUTES = JSON.parse(fs.readFileSync(path.join(D, 'metadata/surah-routes.json'), 'utf8')).surahs;
const P = n => ROUTES.find(x => x.number === n).path;
const BASMALA = JSON.parse(fs.readFileSync(path.join(D, 'metadata/basmala.json'), 'utf8')).textUthmaniBody;
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));
const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const surahFile = n => JSON.parse(fs.readFileSync(path.join(D, 'surahs', String(n).padStart(3, '0') + '.json'), 'utf8'));

let totalAyat = 0, textMismatch = [], numMismatch = [], orderMismatch = [], basmalaWrong = [], missingIds = [];
for (const c of CH) {
  const html = await fetch(`${BASE}${P(c.number)}`).then(r => r.text());
  const s = surahFile(c.number);
  const want = s.pages.flatMap(p => p.ayahs);

  // ---- every rendered ayah, in document order: text + number + id ----
  const got = [...html.matchAll(/<span class="quran-ayah" id="ayah-(\d+)"><span class="quran-ayah-text">([\s\S]*?)<\/span><span class="quran-ayah-num"[^>]*>([^<]*)<\/span><\/span>/g)]
    .map(m => ({ id: +m[1], text: unesc(m[2]), num: m[3] }));

  if (got.length !== want.length) { orderMismatch.push(`${c.number}: rendered ${got.length} ayat, data has ${want.length}`); continue; }
  for (let i = 0; i < want.length; i++) {
    totalAyat++;
    if (got[i].text !== want[i].textUthmaniBody) textMismatch.push(`${c.number}:${want[i].ayah}`);
    if (got[i].id !== want[i].ayah) orderMismatch.push(`${c.number}: slot ${i} has id ${got[i].id}, expected ${want[i].ayah}`);
    // the ayah NUMBER is a real Arabic-Indic numeral, never the FCxx font glyph from the raw text
    const wantNum = String(want[i].ayah).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
    if (got[i].num !== wantNum) numMismatch.push(`${c.number}:${want[i].ayah} → "${got[i].num}"`);
  }
  // ---- basmala: openers vs total occurrences ----
  const openers = (html.match(/<div class="quran-basmala"/g) || []).length;
  const occurrences = html.split(BASMALA).length - 1;
  const wantOpeners = s.basmalaMode === 'separate' ? 1 : 0;
  if (openers !== wantOpeners) basmalaWrong.push(`${c.number} (${s.basmalaMode}): ${openers} opener(s), expected ${wantOpeners}`);
  if (c.number === 1 && occurrences !== 1) basmalaWrong.push(`1: basmala appears ${occurrences}× — it IS ayah 1, so exactly 1`);
  if (c.number === 9 && occurrences !== 0) basmalaWrong.push(`9: basmala appears ${occurrences}× — At-Tawba has none`);
  if (c.number === 27 && occurrences !== 2) basmalaWrong.push(`27: basmala appears ${occurrences}× — expected 2 (opener + in-text 27:30)`);
  // ---- every reference page is an anchor target (the page-jump select points at these) ----
  for (const p of s.pages) if (!html.includes(`id="page-${p.page}"`)) missingIds.push(`${c.number}:page-${p.page}`);
}

console.log('\n--- ayah text served === verified data (all 114 surahs, every ayah) ---');
ok(totalAyat === 6236, `compared ${totalAyat} ayat across 114 pages — expected 6236`);
ok(textMismatch.length === 0, 'every ayah\'s Uthmani text is byte-identical to its data file' + (textMismatch.length ? ` — ${textMismatch.length} differ: ${textMismatch.slice(0, 6)}` : ''));
ok(orderMismatch.length === 0, 'every ayah renders once, in order, under id="ayah-N"' + (orderMismatch.length ? ' — ' + orderMismatch.slice(0, 4) : ''));
ok(numMismatch.length === 0, 'every ayah number is an Arabic-Indic numeral derived from aya_no (never the FCxx glyph)' + (numMismatch.length ? ' — ' + numMismatch.slice(0, 4) : ''));

console.log('\n--- basmala follows the DERIVED basmalaMode, never a render-time guess ---');
ok(basmalaWrong.length === 0, 'Al-Fatiha=in-ayah / At-Tawba=none / An-Naml=opener+27:30 / 111 others=one opener' + (basmalaWrong.length ? ' — ' + basmalaWrong : ''));
console.log('\n--- reference-page anchors ---');
ok(missingIds.length === 0, 'every reference page in the data has a matching id="page-N" target' + (missingIds.length ? ' — ' + missingIds.slice(0, 5) : ''));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
