// Smoke — QURAN-TANZIL-ORPHANED-SMOKES-AND-COMPLETE-LIGHTHOUSE-CLOSURE-1 §3.
//
// Retargeted from the REMOVED KFGQPC metadata (data/quran/kfgqpc-hafs-v2-0/…) to the LIVE Tanzil source
// (data/quran/tanzil-uthmani-1-1/…). Two things are proved, against the REAL 114 chapter records and the
// per-surah ayah files that ship today:
//
//   • data integrity — 114 chapters, 114 valid Arabic names (no mojibake / empty / duplicate), numbered 1..114
//     in order, and each chapter's ayahCount equal to the actual number of verse records in its surah file.
//   • the two display helpers in server.js still behave:
//       _quranCleanName  — strips ornamental marks (incl. U+0653, which makes «يسٓ» «صٓ» «قٓ» print «يس» «ص» «ق»)
//                          while KEEPING the letter-forming hamzas U+0654/U+0655.
//       _quranAyahPhrase — Arabic counted-noun agreement from CLDR (Intl.PluralRules), where `k <= 10 ? …`
//                          is wrong for 206/109/110 (last two digits are `few`).
//
// The old page-count-phrase drift check was RETIRED, not moved: the Tanzil flat model carries no pageCount
// (0 references in server.js), so there is nothing to count pages of. _quranPagePhrase still ships but is fed
// no data — testing a value the model no longer has would be theatre. Neither helper may touch the Quran text
// or any data file — asserted at the bottom.
//
//   node scripts/_smoke_quran_display_name_and_ayah_count_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = path.join(ROOT, 'data/quran/tanzil-uthmani-1-1');            // LIVE Tanzil source — never KFGQPC
const CH = JSON.parse(fs.readFileSync(path.join(BASE, 'metadata/chapters.json'), 'utf8'));
const surah = (n) => JSON.parse(fs.readFileSync(path.join(BASE, 'surahs', String(n).padStart(3, '0') + '.json'), 'utf8'));
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

// Load the real implementations out of server.js — testing a copy would test nothing.
const grab = (re) => { const m = src.match(re); if (!m) throw new Error('helper not found: ' + re); return m[0]; };
const _quranAr = new Function('return ' + grab(/function _quranAr\(n\)[^\n]*/))();
const _quranCleanName = new Function('return ' + grab(/function _quranCleanName\(nameAr\)[^\n]*/))();
// _quranAyahPhrase now delegates to the shared _quranCountPhrase + _AYAH_FORMS (CLDR via _AR_PLURAL); grab that block.
const ayahSrc = grab(/const _AR_PLURAL = new Intl\.PluralRules\('ar'\);[\s\S]*?function _quranAyahPhrase\(k\)[^\n]*\}/);
const _quranAyahPhrase = new Function('_quranAr', ayahSrc + '\nreturn _quranAyahPhrase;')(_quranAr);

console.log('\n--- §3 the Tanzil chapters file: 114 records, numbered 1..114 in order ---');
ok(Array.isArray(CH) && CH.length === 114, `chapters.json holds 114 records — ${CH.length}`);
ok(CH.every((c, i) => c.number === i + 1), 'records run 1..114 in order, no gap and no repeat');

console.log('\n--- §3 114 valid Arabic names: no mojibake, no empty, no duplicate ---');
const MOJIBAKE = /[À-ÿ]{2,}|Ø|Ù|Ã| Â|Ÿ/;                          // UTF-8-as-Latin-1 double-encoding
const nonArabic = CH.filter(c => !/[؀-ۿ]/.test(String(c.nameAr || '')));
ok(nonArabic.length === 0, 'every nameAr contains Arabic-script letters' + (nonArabic.length ? ' — ' + JSON.stringify(nonArabic.slice(0, 3).map(c => c.number)) : ''));
const mojibake = CH.filter(c => MOJIBAKE.test(String(c.nameAr || '')));
ok(mojibake.length === 0, 'no nameAr shows mojibake (Ø…/Ù… double-encoding)' + (mojibake.length ? ' — ' + JSON.stringify(mojibake.slice(0, 3).map(c => [c.number, c.nameAr])) : ''));
const empty = CH.filter(c => !c.nameAr || !String(c.nameAr).trim());
ok(empty.length === 0, 'no nameAr is empty' + (empty.length ? ' — ' + JSON.stringify(empty.map(c => c.number)) : ''));
const dupes = Object.entries(CH.reduce((m, c) => ((m[c.nameAr] = (m[c.nameAr] || 0) + 1), m), {})).filter(([, n]) => n > 1);
ok(dupes.length === 0, 'no two chapters share a nameAr' + (dupes.length ? ' — ' + JSON.stringify(dupes) : ''));

console.log('\n--- §3 each surah file carries its own number, and its ayahCount = the real verse-record count ---');
let numOk = 0, cntOk = 0; const numBad = [], cntBad = [];
for (let n = 1; n <= 114; n++) {
  const s = surah(n);
  const verses = s.ayahs || s.verses || [];
  if (s.surah === n) numOk++; else numBad.push(`${n}:surah=${s.surah}`);
  const declared = CH[n - 1].ayahCount;
  if (verses.length === declared && s.ayahCount === declared) cntOk++;
  else cntBad.push(`${n}: chapters=${declared} file.ayahCount=${s.ayahCount} records=${verses.length}`);
}
ok(numOk === 114, `114/114 surah files carry the correct surah number` + (numBad.length ? ' — ' + numBad.slice(0, 3) : ''));
ok(cntOk === 114, `114/114 ayahCounts equal the real verse-record count in every surah file` + (cntBad.length ? ' — ' + cntBad.slice(0, 3) : ''));

console.log('\n--- §3 the ticket\'s mandatory ayah counts ---');
for (const [n, want] of [[1, 7], [2, 286], [9, 129], [18, 110], [27, 93], [36, 83], [55, 78], [67, 30], [112, 4], [113, 5], [114, 6]]) {
  const got = CH[n - 1].ayahCount;
  ok(got === want, `surah ${n}: ayahCount ${got} (want ${want})`);
}

console.log('\n--- §3 the ticket\'s mandatory names (display form) ---');
for (const [n, want] of [[1, 'الفاتحة'], [2, 'البقرة'], [9, 'التوبة'], [18, 'الكهف'], [27, 'النمل'],
                         [36, 'يس'], [55, 'الرحمن'], [67, 'الملك'], [112, 'الإخلاص'], [113, 'الفلق'], [114, 'الناس']]) {
  const got = _quranCleanName(CH[n - 1].nameAr);
  ok(got === want, `surah ${n}: «${CH[n - 1].nameAr}» → «${got}» (want «${want}»)`);
}

console.log('\n--- (preserved) the three muqatta\'at names print in their conventional form ---');
for (const [n, want] of [[36, 'يس'], [38, 'ص'], [50, 'ق']]) {
  const raw = CH.find(c => c.number === n).nameAr;
  ok(_quranCleanName(raw) === want, `surah ${n}: «${raw}» → «${_quranCleanName(raw)}» (want «${want}»)`);
}

console.log('\n--- (preserved) the strip set is exactly what it claims — hamzas survive ---');
ok(_quranCleanName('مؤمنون') === 'مؤمنون', 'U+0654 (hamza above) is PRESERVED — «مؤمنون» stays «مؤمنون»');
ok(_quranCleanName('إسلام') === 'إسلام', 'U+0655 (hamza below) is PRESERVED — «إسلام» stays «إسلام»');
ok(_quranCleanName('ًٌٍَُِّْٰٓـ') === '', 'every mark in the declared set is stripped (064B–0653, 0670, 0640)');
const removed = {};
for (const c of CH) {
  const a = c.nameAr, b = _quranCleanName(a);
  for (const ch of a) if ([...a].filter(x => x === ch).length > [...b].filter(x => x === ch).length) {
    const k = 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    removed[k] = (removed[k] || 0) + 1;
  }
}
console.log('     marks removed across the 114 names: ' + JSON.stringify(removed));
ok(!removed['U+0654'] && !removed['U+0655'], 'no hamza (U+0654/U+0655) was removed from any of the 114 names');
const dirty = CH.map(c => [c.number, _quranCleanName(c.nameAr)]).filter(([, n]) => /[ً-ْٰٓ]/.test(n));
ok(dirty.length === 0, 'no cleaned name still carries a combining mark' + (dirty.length ? ' — ' + JSON.stringify(dirty) : ''));
const broken = CH.map(c => [c.number, _quranCleanName(c.nameAr)]).filter(([, n]) => !n || n.length < 1);
ok(broken.length === 0, 'no name is emptied by cleaning' + (broken.length ? ' — ' + JSON.stringify(broken) : ''));

console.log('\n--- (preserved) the mandatory ayah-PHRASE examples + the «k<=10» traps ---');
for (const [k, want] of [[7, '٧ آيات'], [286, '٢٨٦ آية'], [3, '٣ آيات'], [4, '٤ آيات'], [6, '٦ آيات'],
                         [11, '١١ آية'], [111, '١١١ آية'], [112, '١١٢ آية'], [1, 'آية واحدة'], [2, 'آيتان']]) {
  ok(_quranAyahPhrase(k) === want, `${String(k).padStart(3)} → «${_quranAyahPhrase(k)}» (want «${want}»)`);
}
for (const [n, k, want] of [[7, 206, '٢٠٦ آيات'], [10, 109, '١٠٩ آيات'], [18, 110, '١١٠ آيات']]) {
  ok(_quranAyahPhrase(k) === want, `surah ${n} (${k} ayat) → «${_quranAyahPhrase(k)}» (want «${want}» — the old rule said «${k} آية»)`);
}

console.log('\n--- (preserved) every one of the 114 ayah phrases agrees with CLDR ---');
const PR = new Intl.PluralRules('ar');
const FORMS = { zero: 'آيات', one: 'آية واحدة', two: 'آيتان', few: 'آيات', many: 'آية', other: 'آية' };
const bad = [];
for (const c of CH) {
  const cat = PR.select(c.ayahCount);
  const want = (cat === 'one' || cat === 'two') ? FORMS[cat] : `${_quranAr(c.ayahCount)} ${FORMS[cat]}`;
  if (_quranAyahPhrase(c.ayahCount) !== want) bad.push(`${c.number}:${c.ayahCount}`);
}
ok(bad.length === 0, `all 114 ayah phrases match the CLDR category` + (bad.length ? ' — ' + bad.slice(0, 5) : ''));
const few = CH.filter(c => PR.select(c.ayahCount) === 'few');
console.log(`     (${few.length} surahs are \`few\` → «آيات»: ${few.map(c => c.number + ':' + c.ayahCount).join(', ')})`);

console.log('\n--- the helpers never touch the Quran text or write to disk ---');
const fn = grab(/function _quranCleanName[^\n]*/);
ok(/nameAr/.test(fn) && !/textUthmani/.test(fn), '_quranCleanName takes a NAME, never ayah text');
ok(!/kfgqpc-hafs-v2-0/i.test(src.slice(src.indexOf('function _quranShared'), src.indexOf('function _quranAyahPhrase'))),
   'the Quran layer no longer references the removed KFGQPC data path');
const layer = src.slice(src.indexOf('function _quranShared'), src.indexOf('// ===== HTTP Server ====='));
ok(!/writeFileSync|appendFileSync|rmSync|unlinkSync/.test(layer), 'the Quran layer never writes to disk (chapters.json / surah files are read-only)');

console.log(`\nRESULT display_name_and_ayah_count(Tanzil): ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
