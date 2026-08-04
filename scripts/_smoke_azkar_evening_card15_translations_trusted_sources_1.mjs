// Smoke — AZKAR-EVENING-DUA-CARD-15-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-015 = «بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم» (Ibn Majah 3869, ×3 «ثلاث مرات»,
// authenticity 'sahih', HAS an Arabic-only virtue) gains the 9 static non-ar MEANING translations. SIX meanings each lang must
// keep: ①بسم الله ②«لا يضر مع اسمه شيء» — keep «مع اسمه» (with/by His name), NEVER «Allah does not harm» ③في الأرض ④ولا في
// السماء ⑤وهو السميع = All-HEARING (NEVER All-Seeing — the known HisnMuslim-EN error) ⑥العليم = All-Knowing. TIME-NEUTRAL (the
// once/thrice + أصبح/أمسى live only in the separate virtue field) → all NINE = morning-015 BYTE-IDENTICAL (clean reuse, no
// divergence). morning-015 UNTOUCHED. NO translation_ar; NO reference/repeat/source/virtue/transliteration inside the block.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(ROOT, 'js', 'azkar-data.js'), 'utf8');
const srvSrc  = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }
const N = (s) => (s || '').normalize('NFC');
const has = (t, x) => N(t).includes(N(x));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const E = sandbox.window.AzkarEvening;
const M = sandbox.window.AzkarMorning;
const P = sandbox.window.AzkarPrayer;
const card = E.find(d => d.id === 'evening-015');
const morn = M.find(d => d.id === 'morning-015');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// SIX meanings — distinctive substrings per language
const MEAN = {
  en: ['In the name of Allah', 'with Whose name', 'in the earth', 'the heaven', 'All-Hearing', 'All-Knowing'],
  fr: ["Au Nom d'Allah", 'la mention', 'sur la terre', 'dans le ciel', "l'Audient", "l'Omniscient"],
  ur: ['اللہ کے نام', 'نام کے ساتھ', 'زمین', 'آسمان', 'سننے والا', 'جاننے والا'],
  tr: ["Allah'ın adıyla", 'ismiyle birlikte', 'Yerde', 'gökte', 'işiten', 'bilendir'],
  bn: ['আল্লাহর নামে', 'নামের সাথে', 'যমীন', 'আসমান', 'সর্বশ্রোতা', 'মহাজ্ঞানী'],
  ms: ['Dengan Nama Allah', 'bersama namaNya', 'di bumi', 'di langit', 'Maha Mendengar', 'Maha Mengetahui'],
  de: ['Im Namen Allāhs', 'mit Dessen Namen', 'auf der Erde', 'im Himmel', 'Allhörende', 'Allwissende'],
  es: ['En el nombre de Allah', 'en su nombre', 'en la tierra', 'los cielos', 'quien todo lo oye', 'Omnisapiente'],
  id: ['Dengan nama Allah', 'bersama nama-Nya', 'di bumi', 'di langit', 'Maha Mendengar', 'Maha Mengetahui'],
};
// ② «مع اسمه» marker (with/by His name — must NOT collapse to «Allah does not harm»)
const WITHNAME = { en: 'with Whose name', fr: 'la mention', ur: 'نام کے ساتھ', tr: 'ismiyle birlikte', bn: 'নামের সাথে', ms: 'bersama namaNya', de: 'mit Dessen Namen', es: 'en su nombre', id: 'bersama nama-Nya' };
// ⑤ «السميع» = All-Hearing marker (must NOT be All-Seeing)
const HEARING = { en: 'All-Hearing', fr: "l'Audient", ur: 'سننے والا', tr: 'işiten', bn: 'সর্বশ্রোতা', ms: 'Maha Mendengar', de: 'Allhörende', es: 'quien todo lo oye', id: 'Maha Mendengar' };

// forbidden: As-Samee mis-rendered as All-Seeing (any lang)
const SEEING = /All-Seeing|Allsehende|All-?Sehende|\bgören\b|todo lo ve\b|el Vidente|tout[- ]voyant|voyant\b|দ্রষ্টা|دیکھنے والا|melihat\b/i;
// forbidden: reference / repeat / source / narrator / hadith number
const REF = /رواه|ابن ماجه|Ibn Maj|Abu Daw|Tirmidh|\bHisn\b|حصن المسلم|ثلاث مرات|three times|3869|5088|3388|6093/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /Bismillahi? l|alladhi la yadurru|ma'?a ismihi|as-?samee|al-?alim|fil ard|fis sama/i;
// forbidden: the Arabic virtue text leaking into a translation
const VIRTUE_LEAK = /أصبح|أمسى|لم يضره|من قالها/;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-015 identity + all 9 translations, SIX meanings ================');
ok(!!card && card.id === 'evening-015', 'AzkarEvening has evening-015');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `evening-015 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL six meanings preserved`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ② «مع اسمه» preserved (NOT «Allah does not harm») ================');
for (const l of ALL9) ok(has(card['translation_' + l], WITHNAME[l]), `${l}: «مع اسمه»/with-His-name marker present (${WITHNAME[l]})`);

console.log('\n================ 3. ⑤ «السميع» = All-HEARING (NOT All-Seeing) ================');
for (const l of ALL9) ok(has(card['translation_' + l], HEARING[l]), `${l}: All-Hearing marker present (${HEARING[l]})`);
for (const l of ALL9) ok(!SEEING.test(card['translation_' + l]), `${l}: NO All-Seeing mis-rendering of As-Samee`);

console.log('\n================ 4. NO reference/repeat/source/hadith-number/transliteration/virtue inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat-label/source/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
for (const l of ALL9) ok(!VIRTUE_LEAK.test(card['translation_' + l]), `${l}: no virtue text (أصبح/أمسى/لم يضره) leaked in`);

console.log('\n================ 5. Time-neutral reuse: all 9 evening-015 == morning-015 byte-identical ================');
for (const l of ALL9) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-015 == morning-015 byte-identical (verbatim reuse)`);

console.log('\n================ 6. morning-015 UNTOUCHED + all 25 morning intact ================');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_es, 'quien todo lo oye') && has(morn.translation_de, 'Allhörende'), 'morning-015 still carries its sound es/de renderings (NOT touched)');

console.log('\n================ 7. Arabic byte-identical to morning-015 + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text === morn.text, 'evening-015 Arabic == morning-015 Arabic byte-identical (time-neutral twin)');
ok(card.text.startsWith('بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ') && card.text.endsWith('وَهُوَ السَّمِيعُ الْعَلِيمُ.'), 'Arabic opening «بسم الله الذي لا يضر» + closing «وهو السميع العليم.» intact');
const b15 = dataSrc.slice(dataSrc.indexOf("id: 'evening-015'"), dataSrc.indexOf("id: 'evening-016'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b15), 'evening-015 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه ابن ماجه', 'source ref «رواه ابن ماجه» unchanged');
ok(card.repeat === 3 && card.repeatLabel && card.repeatLabel.ar === 'ثلاث مرات', 'repeat 3 «ثلاث مرات» unchanged');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 0 && card.virtue.en == null, 'virtue stays Arabic-only (en=null, NOT translated)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 8. Per-region counts — evening 15, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 21, `evening region translation_${l}: EXACTLY 21 (001-004 Quran + 005-021 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 9. Evening 001-021 translated; 022+ untranslated; prayer intact ================');
for (let n = 1; n <= 21; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(21).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 022+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 10. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b15, 'AZKAR-EVENING-DUA-CARD-15-TRANSLATIONS'), 'evening-015 block carries the ticket provenance comment');

console.log('\n================ 11. Cache-busters bumped (azkar-data.js?v=53 + sw v551; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=53\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=53');
ok(!/js\/azkar-data\.js\?v=52\b/.test(htmlSrc), 'no stale ?v=46 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v551'/.test(swSrc), "sw.js CACHE_VERSION = 'v551'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
