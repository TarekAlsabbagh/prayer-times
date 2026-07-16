// Smoke — QURAN-AR-SSR-114-DISPLAY-NAMES-AYAH-COUNT-AND-FULL-TEST-SUITE-FINAL-GATE-1 §1/§2.
// Two units, tested against the REAL 114 chapter records and the ticket's mandatory examples:
//   • _quranCleanName  — the display-name helper: strips ornamental marks (now including U+0653, which is
//     what makes «يسٓ» «صٓ» «قٓ» print as «يس» «ص» «ق») while KEEPING the letter-forming hamzas U+0654/U+0655.
//   • _quranAyahPhrase — Arabic counted-noun agreement from CLDR (Intl.PluralRules), not a hand-rolled rule.
//     A `k <= 10 ? plural : singular` rule is wrong for 3 real surahs (206/109/110 → last two digits are
//     `few`), which is exactly why this file exists.
// Neither helper may touch the Quran text or any data file — asserted at the bottom.
//
//   node scripts/_smoke_quran_display_name_and_ayah_count_1.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = path.join(ROOT, 'data/quran/kfgqpc-hafs-v2-0');
const CH = JSON.parse(fs.readFileSync(path.join(D, 'metadata/chapters.json'), 'utf8'));
const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
let pass = 0, fail = 0; const F = [];
const ok = (c, m) => c ? (pass++, console.log('  PASS ' + m)) : (fail++, F.push(m), console.log('  FAIL ' + m));

// Load the real implementations out of server.js — testing a copy would test nothing.
const grab = (re) => { const m = src.match(re); if (!m) throw new Error('helper not found: ' + re); return m[0]; };
const _quranAr = new Function('return ' + grab(/function _quranAr\(n\)[^\n]*/))();
const _quranCleanName = new Function('return ' + grab(/function _quranCleanName\(nameAr\)[^\n]*/))();
const ayahSrc = grab(/const _AR_PLURAL = new Intl\.PluralRules\('ar'\);[\s\S]*?function _quranAyahPhrase\(k\)[^\n]*/);
const _quranAyahPhrase = new Function('_quranAr', ayahSrc + '\nreturn _quranAyahPhrase;')(_quranAr);
const pageSrc = grab(/const _AR_PLURAL = new Intl\.PluralRules\('ar'\);[\s\S]*?function _quranPagePhrase\(k\)[^\n]*/);
const _quranPagePhrase = new Function('_quranAr', pageSrc + '\nreturn _quranPagePhrase;')(_quranAr);

console.log('\n--- §1 the three muqatta\'at names print in their conventional form ---');
for (const [n, want] of [[36, 'يس'], [38, 'ص'], [50, 'ق']]) {
  const raw = CH.find(c => c.number === n).nameAr;
  const got = _quranCleanName(raw);
  ok(got === want, `surah ${n}: «${raw}» → «${got}» (want «${want}»)`);
}

console.log('\n--- §1 the strip set is exactly what it claims ---');
// U+0654/U+0655 are letter-forming: stripping them would turn «مؤمنون» into «مومنون» — a different word.
ok(_quranCleanName('مؤمنون') === 'مؤمنون', 'U+0654 (hamza above) is PRESERVED — «مؤمنون» stays «مؤمنون»');
ok(_quranCleanName('إسلام') === 'إسلام', 'U+0655 (hamza below) is PRESERVED — «إسلام» stays «إسلام»');
ok(_quranCleanName('ًٌٍَُِّْٰٓـ') === '', 'every mark in the declared set is stripped (064B–0653, 0670, 0640)');
// the marks removed across all 114, counted — the audit the ticket asked for
const removed = {};
for (const c of CH) {
  const a = c.nameAr, b = _quranCleanName(a);
  for (const ch of a) {
    const k = 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    if ([...a].filter(x => x === ch).length > [...b].filter(x => x === ch).length) removed[k] = (removed[k] || 0) + 1;
  }
}
console.log('     marks removed across the 114 names: ' + JSON.stringify(removed));
ok(removed['U+0653'] === 3, `U+0653 is removed exactly 3 times — one each for 36/38/50 — got ${removed['U+0653']}`);
ok(!removed['U+0654'] && !removed['U+0655'], 'no hamza was removed from any of the 114 names');
// nothing may survive that would still render as a mark
const dirty = CH.map(c => [c.number, _quranCleanName(c.nameAr)]).filter(([, n]) => /[ً-ٰٟ]/.test(n));
ok(dirty.length === 0, 'no cleaned name still carries a combining mark' + (dirty.length ? ' — ' + JSON.stringify(dirty) : ''));
// …and cleaning must never empty or mangle a name
const broken = CH.map(c => [c.number, c.nameAr, _quranCleanName(c.nameAr)]).filter(([, , n]) => !n || n.length < 1);
ok(broken.length === 0, 'no name is emptied by cleaning' + (broken.length ? ' — ' + JSON.stringify(broken) : ''));

console.log('\n--- §2 the ticket\'s mandatory ayah-count examples ---');
for (const [k, want] of [[7, '٧ آيات'], [286, '٢٨٦ آية'], [3, '٣ آيات'], [4, '٤ آيات'], [6, '٦ آيات'],
                         [11, '١١ آية'], [111, '١١١ آية'], [112, '١١٢ آية'],
                         [1, 'آية واحدة'], [2, 'آيتان']]) {
  const got = _quranAyahPhrase(k);
  ok(got === want, `${String(k).padStart(3)} → «${got}» (want «${want}»)`);
}

console.log('\n--- §2 the cases a hand-rolled «k <= 10» rule gets wrong (last two digits are `few`) ---');
for (const [n, k, want] of [[7, 206, '٢٠٦ آيات'], [10, 109, '١٠٩ آيات'], [18, 110, '١١٠ آيات']]) {
  const got = _quranAyahPhrase(k);
  ok(got === want, `surah ${n} (${k} ayat) → «${got}» (want «${want}» — the old rule said «${k} آية»)`);
}

console.log('\n--- §2 every one of the 114 agrees with CLDR ---');
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

console.log('\n--- §2 the page phrase uses the same engine and did NOT drift ---');
// pages span 1..48, where the old hand-rolled rule and CLDR happen to agree — proving that keeps this
// refactor honest: routing pages through the shared formatter changed no output.
const oldPage = k => k === 1 ? 'صفحة مرجعية واحدة' : k === 2 ? 'صفحتان مرجعيتان'
  : k <= 10 ? `${_quranAr(k)} صفحات مرجعية` : `${_quranAr(k)} صفحة مرجعية`;
const drift = CH.filter(c => _quranPagePhrase(c.pageCount) !== oldPage(c.pageCount)).map(c => `${c.number}:${c.pageCount}`);
ok(drift.length === 0, 'all 114 page phrases are byte-identical to the pre-refactor output' + (drift.length ? ' — ' + drift : ''));

console.log('\n--- the helpers never touch the Quran text or the data files ---');
const fn = grab(/function _quranCleanName[^\n]*/);
ok(/nameAr/.test(fn) && !/textUthmani/.test(fn), '_quranCleanName takes a NAME, never ayah text');
const body = src.slice(src.indexOf('function _buildQuranSurahBody(n)'), src.indexOf('// ===== HTTP Server ====='));
ok(!/_quranCleanName\((?!surah\.nameAr|c\.nameAr|chapter\.nameAr|_ch\.nameAr)/.test(body), 'the page builder only ever cleans a chapter/surah NAME field');
const ayahLine = (body.match(/<span class="quran-ayah-text">[^\n]*/) || [''])[0];
ok(!/_quranCleanName/.test(ayahLine), 'the ayah text is rendered WITHOUT the name cleaner (U+0653 stays in the Quran text)');
ok(!/writeFileSync|appendFileSync|rmSync|unlinkSync/.test(src.slice(src.indexOf('function _quranShared'), src.indexOf('// ===== HTTP Server ====='))), 'the Quran layer never writes to disk (chapters.json / surah files are read-only)');

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:'); F.forEach(x => console.log('  - ' + x)); process.exit(1); }
