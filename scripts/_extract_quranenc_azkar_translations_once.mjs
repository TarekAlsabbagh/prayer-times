// AZKAR-MORNING-QURAN-TRANSLATIONS-AYAT-KURSI-IKHLAS-ALL-LANGUAGES-1
// DEVELOPER-ONLY, RUN ONCE. Extracts Quran translations from QuranEnc.com's public API and prints JSON.
// The site NEVER calls QuranEnc at runtime — the printed strings are pasted as STATIC data into js/azkar-data.js.
// Source: QuranEnc.com API (https://quranenc.com/api/v1/translation). Only `result.translation` is used;
// `footnotes` are NEVER used. Inline footnote markers like [1] are removed; the meaning text is untouched.
//
// Run:  node scripts/_extract_quranenc_azkar_translations_once.mjs   (needs network — run via PowerShell on Windows)
//       Set env QE_OUT=<path> to also write UTF-8 JSON to a file (PowerShell '>' mangles non-Latin scripts).

import { writeFileSync } from 'node:fs';

const QURANENC_TRANSLATION_KEYS = {
  fr: 'french_rashid',
  ur: 'urdu_junagarhi',
  tr: 'turkish_rwwad',
  bn: 'bengali_zakaria',
  ms: 'malay_basumayyah',
  de: 'german_rwwad',
  es: 'spanish_garcia',
  id: 'indonesian_affairs',
};

const BASE = 'https://quranenc.com/api/v1/translation';

// Remove ONLY inline footnote markers (a bracket wrapping ONLY digits in ANY script: [1], [١], [১] …) and
// normalise whitespace. \p{Nd} = any Unicode decimal digit (ASCII, Arabic-Indic, Bengali, …). Meaning is never rewritten.
function stripFootnoteMarkers(text) {
  return String(text).replace(/\s*\[\p{Nd}+\]\s*/gu, ' ').replace(/\s+/g, ' ').trim();
}
// Detect residual NON-numeric brackets ([...] that are part of the meaning, not a footnote marker) — reported, NOT stripped.
function residualBrackets(text) {
  const m = String(text).match(/\[[^\]]*\]/g) || [];
  return m.filter(b => !/^\[\p{Nd}+\]$/u.test(b));
}
// Strip a LEADING verse-number token ("255. ", "1. ", any Unicode digits + dot) that some QuranEnc translations
// (e.g. Spanish García) prefix to each verse. ONLY at the very start — never touches numbers inside the meaning.
function stripLeadingVerseNumber(text) {
  return String(text).replace(/^\s*\p{Nd}+\.\s*/u, '');
}
// Languages whose QuranEnc basmala (1:1) comes back as a TRANSLITERATION, not a meaning translation → OMIT the
// basmala from that language's Al-Ikhlas (per the "no transliteration" rule). Verified by manual review of 1:1.
const OMIT_BASMALA_LANGS = new Set(['tr']);

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json();
}
async function getAya(key, sura, aya) {
  const json = await getJson(`${BASE}/aya/${key}/${sura}/${aya}`);
  const text = json && json.result && json.result.translation;
  if (!text || typeof text !== 'string') throw new Error(`Missing translation for ${key} ${sura}:${aya}`);
  return text;
}
async function getSura(key, sura) {
  const json = await getJson(`${BASE}/sura/${key}/${sura}`);
  const items = json && json.result;
  if (!Array.isArray(items)) throw new Error(`Missing sura result for ${key} ${sura}`);
  return items;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const output = { 'morning-001': {}, 'morning-002': {} };
const warnings = [];
const failures = [];
const basmalas = [];

for (const [lang, key] of Object.entries(QURANENC_TRANSLATION_KEYS)) {
  try {
    // 1) Ayat al-Kursi 2:255 (NO basmala for Kursi)
    const kursiRaw = await getAya(key, 2, 255); await sleep(120);
    // 2) Basmala 1:1
    const basmalaRaw = await getAya(key, 1, 1); await sleep(120);
    // 3) Surah Al-Ikhlas 112:1-4
    const ikhlasSura = await getSura(key, 112); await sleep(120);
    const ikhlasRaw = [1, 2, 3, 4].map((ayaNumber) => {
      const row = ikhlasSura.find((it) => Number(it.aya) === ayaNumber);
      if (!row || !row.translation) throw new Error(`Missing ${key} 112:${ayaNumber}`);
      return String(row.translation);
    });

    // residual-bracket detection (before stripping numeric markers) — meaning brackets must be reported, not removed
    for (const [label, raw] of [['2:255', kursiRaw], ['1:1', basmalaRaw], ['112:1', ikhlasRaw[0]], ['112:2', ikhlasRaw[1]], ['112:3', ikhlasRaw[2]], ['112:4', ikhlasRaw[3]]]) {
      const rb = residualBrackets(raw);
      if (rb.length) warnings.push(`${lang} ${label}: residual non-footnote brackets ${JSON.stringify(rb)} in: ${raw}`);
    }

    // clean each verse: strip a leading verse-number ("255."/"1.") THEN footnote markers ([1]/[১]) + whitespace
    const clean = (t) => stripFootnoteMarkers(stripLeadingVerseNumber(t));
    const kursi = clean(kursiRaw);
    const basmala = clean(basmalaRaw);
    const ikhlas = ikhlasRaw.map(clean);
    basmalas.push(`${lang}: ${basmala}`);

    const ikhlasJoined = `${ikhlas[0]}\n${ikhlas[1]}\n${ikhlas[2]}\n${ikhlas[3]}`;
    output['morning-001'][`translation_${lang}`] = kursi;
    // Al-Ikhlas: basmala + surah, EXCEPT for langs whose basmala is a transliteration (tr) → surah only.
    output['morning-002'][`translation_${lang}`] = OMIT_BASMALA_LANGS.has(lang) ? ikhlasJoined : `${basmala}\n\n${ikhlasJoined}`;
  } catch (e) {
    failures.push(`${lang} (${key}): ${e.message}`);
  }
}

if (failures.length) {
  console.error('\n===== EXTRACTION FAILURES (language UNAVAILABLE via QuranEnc — STOP + report in PRE-PUSH) =====');
  failures.forEach(f => console.error('  ✗ ' + f));
  console.error('===== end failures =====');
}

console.error('\n===== BASMALA (1:1) per language — REVIEW for transliteration (omit if not a meaning translation) =====');
basmalas.forEach(b => console.error('  ' + b));
console.error('===== end basmala review =====');

if (warnings.length) {
  console.error('\n===== RESIDUAL-BRACKET WARNINGS (report in PRE-PUSH; text NOT modified) =====');
  warnings.forEach(w => console.error('  ! ' + w));
  console.error('===== end warnings =====\n');
} else {
  console.error('(no residual non-footnote brackets detected)');
}
const json = JSON.stringify(output, null, 2);
if (process.env.QE_OUT) { writeFileSync(process.env.QE_OUT, json, 'utf8'); console.error('wrote UTF-8 → ' + process.env.QE_OUT); }
console.log(json);
