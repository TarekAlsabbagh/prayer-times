// Smoke — AZKAR-EVENING-DUA-CARD-16-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-016 = «رضيت بالله ربًا وبالإسلام دينًا وبمحمد صلى الله عليه وسلم نبيًا» (Ahmad, ×3 «ثلاث مرات», authenticity 'sahih',
// HAS an Arabic-only virtue) gains the 9 static non-ar MEANING translations. THREE meanings each lang must keep: ①رضيت بالله
// ربًا = pleased/content with Allah as (my) Lord — NOT merely "recognize/acknowledge" ②وبالإسلام دينًا = Islam as (my) religion
// ③وبمحمد نبيًا = Muhammad as (my) PROPHET (Nabi) — NEVER Messenger/Rasul (the sister «رسولًا» narration is a DIFFERENT dua).
// TIME-NEUTRAL (the thrice + morning/evening promise live only in the separate virtue field). Eight langs (en/ur/tr/bn/ms/de/es/id)
// = morning-016 BYTE-IDENTICAL reuse. fr DIVERGES: morning-016 fr says «Je reconnais» (recognize=weak) → corrected here to
// «Je suis satisfait» (pleased). morning-016 UNTOUCHED. NO translation_ar; NO reference/repeat/source/virtue/transliteration in the block.
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
const card = E.find(d => d.id === 'evening-016');
const morn = M.find(d => d.id === 'morning-016');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const VERBATIM8 = ['en', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id']; // fr diverges

// THREE meanings — targeted markers per language
const PLEASED  = { en: 'pleased', fr: 'satisfait', ur: 'راضی', tr: 'râzı', bn: 'সন্তুষ্ট', ms: 'redha', de: 'zufrieden', es: 'complazco', id: 'rela' };
const LORD     = { en: 'Lord', fr: 'Seigneur', ur: 'رب', tr: 'Rab', bn: 'রব', ms: 'Tuhan', de: 'Rabb', es: 'Señor', id: 'Tuhan' };
const RELIGION = { en: 'religion', fr: 'religion', ur: 'دین', tr: 'dîn', bn: 'দীন', ms: 'agama', de: 'Dīn', es: 'religión', id: 'agama' };
const PROPHET  = { en: 'Prophet', fr: 'Prophète', ur: 'نبی', tr: 'nebi', bn: 'নবী', ms: 'Nabi', de: 'Prophet', es: 'Profeta', id: 'nabi' };

// forbidden: نبيًا mis-rendered as Messenger/Rasul (any lang) — the sister «رسولًا» narration
const MESSENGER = /\bMessenger\b|Gesandter|messager|mensajero|\bRasul\b|\bResul\b|رسول|রাসূল/i;
// forbidden: reference / attribution / repeat / hadith number
const REF = /رواه|أحمد|\bAhmad\b|\bHisn\b|حصن المسلم|ثلاث مرات|three times|Tirmidh|Ibn Maj|Nasa|3389|3870|5072/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /Rad[ih]?itu|billahi rabban|wa bil-?isl|dinan|nabiyyan|bi-?muhammadin/i;
// forbidden: the Arabic virtue text leaking into a translation
const VIRTUE_LEAK = /حين يصبح|حين يمسي|أن يرضيه|يوم القيامة|Day of Resurrection/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-016 identity + all 9 translations, THREE meanings ================');
ok(!!card && card.id === 'evening-016', 'AzkarEvening has evening-016');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 30, `evening-016 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(has(t, PLEASED[l]) && has(t, LORD[l]) && has(t, RELIGION[l]) && has(t, PROPHET[l]), `${l}: ALL three meanings preserved (pleased+Lord+religion+Prophet)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ① «رضيت» = pleased/content (NOT recognize/acknowledge) ================');
for (const l of ALL9) ok(has(card['translation_' + l], PLEASED[l]), `${l}: pleased/content marker present (${PLEASED[l]})`);
// fr must NOT keep the deficient «reconnais»
ok(!has(card.translation_fr, 'reconnais'), 'fr does NOT use «reconnais» (recognize) — corrected to «satisfait»');

console.log('\n================ 3. ③ «نبيًا» = PROPHET/Nabi (NOT Messenger/Rasul) ================');
for (const l of ALL9) ok(has(card['translation_' + l], PROPHET[l]), `${l}: Prophet/Nabi marker present (${PROPHET[l]})`);
for (const l of ALL9) ok(!MESSENGER.test(card['translation_' + l]), `${l}: NO Messenger/Rasul mis-rendering of Nabi`);

console.log('\n================ 4. NO reference/repeat/attribution/hadith-number/transliteration/virtue inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat-label/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
for (const l of ALL9) ok(!VIRTUE_LEAK.test(card['translation_' + l]), `${l}: no virtue text (حين يصبح/يوم القيامة) leaked in`);

console.log('\n================ 5. Time-neutral reuse: 8 langs evening-016 == morning-016 byte-identical; fr DIVERGES ================');
for (const l of VERBATIM8) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-016 == morning-016 byte-identical (verbatim reuse)`);
ok(card.translation_fr !== morn.translation_fr, 'fr: evening-016 DIVERGES from morning-016 (correction, not reuse)');
ok(has(card.translation_fr, 'Je suis satisfait') && has(card.translation_fr, 'Seigneur') && has(card.translation_fr, 'religion') && has(card.translation_fr, 'Prophète'), 'fr corrected text keeps satisfait + Seigneur + religion + Prophète');

console.log('\n================ 6. morning-016 UNTOUCHED (still deficient fr «reconnais») + all 25 morning intact ================');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_fr, 'Je reconnais'), 'morning-016 fr still says «Je reconnais» (NOT retro-fixed — deferred)');

console.log('\n================ 7. de = source-faithful Islamische Datenbank form (user Option A) ================');
ok(has(card.translation_de, 'Rabb') && has(card.translation_de, 'Herr') && has(card.translation_de, 'Dīn') && has(card.translation_de, 'Glauben') && has(card.translation_de, 'Prophet') && has(card.translation_de, 'zufrieden'), 'de keeps Rabb (Herr) / Dīn (Glauben) / Prophet / zufrieden');
ok(!has(card.translation_de, 'Gesandter'), 'de does NOT use «Gesandter» (Messenger)');

console.log('\n================ 8. Arabic byte-identical to morning-016 + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text === morn.text, 'evening-016 Arabic == morning-016 Arabic byte-identical (time-neutral twin)');
ok(card.text.startsWith('رَضِيتُ بِاللَّهِ رَبًّا') && card.text.endsWith('نَبِيًّا.'), 'Arabic opening «رضيت بالله ربًا» + closing «نبيًا.» intact');
const b16 = dataSrc.slice(dataSrc.indexOf("id: 'evening-016'"), dataSrc.indexOf("id: 'evening-017'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b16), 'evening-016 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه أحمد', 'source ref «رواه أحمد» unchanged');
ok(card.repeat === 3 && card.repeatLabel && card.repeatLabel.ar === 'ثلاث مرات', 'repeat 3 «ثلاث مرات» unchanged');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 0 && card.virtue.en == null, 'virtue stays Arabic-only (en=null, NOT translated)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 9. Per-region counts — evening 16, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 17, `evening region translation_${l}: EXACTLY 17 (001-004 Quran + 005-017 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 10. Evening 001-017 translated; 018+ untranslated; prayer intact ================');
for (let n = 1; n <= 17; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(17).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 018+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 11. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b16, 'AZKAR-EVENING-DUA-CARD-16-TRANSLATIONS'), 'evening-016 block carries the ticket provenance comment');

console.log('\n================ 12. Cache-busters bumped (azkar-data.js?v=49 + sw v547; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=49\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=49');
ok(!/js\/azkar-data\.js\?v=48\b/.test(htmlSrc), 'no stale ?v=47 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v547'/.test(swSrc), "sw.js CACHE_VERSION = 'v547'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
