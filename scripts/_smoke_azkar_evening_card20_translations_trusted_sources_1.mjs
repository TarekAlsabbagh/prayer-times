// Smoke — AZKAR-EVENING-DUA-CARD-20-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-020 = «لا إله إلا الله، وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير» (al-Tirmidhi, 100×,
// authenticity 'sahih', virtue = separate Arabic field) gains the 9 static non-ar MEANING translations of the SHORT tahlil.
// TIME-NEUTRAL → each = its morning-020 twin verbatim (REUSE), EXCEPT de + es (DIVERGE). SIX meanings each: ①none-worthy-
// except-Allah ②wahdah/ALONE (distinct from no-partner) ③no-partner ④to-Him-the-dominion ⑤to-Him-the-praise ⑥over-all-
// things-powerful. ⛔ SHORT form only — NO «يحيي ويميت / gives life and causes death», NO «بيده الخير», NO «حي لا يموت»,
// NO other-narration addition (longer 10×/post-prayer variant rejected in all 9). de=DIVERGE (HadeethEnc German 5517,
// restores worthy-of-worship + alone). es=DIVERGE-limited (added «digna de adoración» only). morning-020 UNTOUCHED. NO translation_ar.
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
const card = E.find(d => d.id === 'evening-020');
const morn = M.find(d => d.id === 'morning-020');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const REUSE7 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'id'];
const DIVERGE2 = ['de', 'es'];

// SIX meanings — targeted distinct markers per language
const M1 = { en: 'right to be worshipped', fr: "[digne d'être adorée]", ur: 'عبادت کے لائق نہیں', tr: 'ibâdete lâyık', bn: 'হক্ব ইলাহ', ms: 'berhak disembah', de: 'anbetungswürdigen', es: 'digna de adoración', id: 'berhak disembah' }; // ① none worthy except Allah
const M2 = { en: 'alone', fr: 'Seul', ur: 'وہ اکیلا ہے', tr: 'O, birdir', bn: 'একমাত্র', ms: 'semata', de: 'Ihm allein', es: 'único', id: 'semata' }; // ② wahdah/ALONE
const M3 = { en: 'without partner', fr: 'sans associé', ur: 'کوئی شریک نہیں', tr: 'ortağı yoktur', bn: 'শরীক নেই', ms: 'tidak ada sekutu', de: 'keinen Partner', es: 'sin asociado', id: 'tidak ada sekutu' }; // ③ no partner
const M4 = { en: 'sovereignty', fr: 'la royauté', ur: 'ملک', tr: "Mülk O'nundur", bn: 'রাজত্ব', ms: 'kerajaan', de: 'die Herrschaft', es: 'el Reino', id: 'kerajaan' }; // ④ dominion
const M5 = { en: 'praise', fr: 'la louange', ur: 'حمد', tr: "hamd da O'nadır", bn: 'প্রশংসা', ms: 'pujian', de: 'das Lob', es: 'la alabanza', id: 'pujian' }; // ⑤ praise
const M6 = { en: 'omnipotent', fr: 'capable de toute chose', ur: 'ہر چیز پر قادر', tr: 'gücü yetendir', bn: 'ক্ষমতাবান', ms: 'berkuasa atas segala sesuatu', de: 'zu allem die Macht', es: 'sobre toda cosa Poderoso', id: 'berkuasa atas segala sesuatu' }; // ⑥ powerful
const M_ALL = [M1, M2, M3, M4, M5, M6];

// ⛔ forbidden: «يحيي ويميت» / other-narration additions in ANY language
const YUHYI = /gives life|causes death|life and death|belebt|leben und sterben|sterben lässt|fait vivre|fait mourir|donne la vie|da la vida|da la muerte|menghidupkan|mematikan|জীবন দান|মৃত্যু|زندگی اور موت|زندہ کرتا|diriltir|öldürür|يحيي|يميت|بيده الخير|حي لا يموت|hayyun|glorificado sea|con amor y exaltación/i;
// forbidden: reference / attribution / repeat / hadith number
const REF = /رواه|الترمذي|\bTirmidh|\bTirmizî|\bHisn\b|حصن المسلم|مئة مرة|مائة مرة|عشر مرات|\b100\b|hundred times|\bsahih\b|صحيح/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /La ilaha illa|wahdahu la sharik|lahu al-?mulk|ala kulli shay/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-020 identity + all 9 translations, SIX meanings ================');
ok(!!card && card.id === 'evening-020', 'AzkarEvening has evening-020');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `evening-020 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(M_ALL.every(mm => has(t, mm[l])), `${l}: ALL six meanings preserved (none-worthy+alone+no-partner+dominion+praise+powerful)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ⛔ NO «يحيي ويميت» / other-narration addition in ANY language (the #1 trap) ================');
for (const l of ALL9) ok(!YUHYI.test(N(card['translation_' + l])), `${l}: NO «يحيي ويميت»/gives-life-and-death/biyadihi-al-khayr/hayyun-la-yamut/long-tafsir`);

console.log('\n================ 3. ② «وحده/alone» present AND distinct from ③ «no partner» ================');
for (const l of ALL9) ok(M2[l] !== M3[l] && has(card['translation_' + l], M2[l]) && has(card['translation_' + l], M3[l]), `${l}: ② alone (${M2[l]}) AND ③ no-partner (${M3[l]}) present & distinct`);

console.log('\n================ 4. NO reference/attribution/repeat/hadith-number/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 5. Strategy: 7 REUSE (morning-020 verbatim); de+es DIVERGE; morning-020 UNTOUCHED ================');
for (const l of REUSE7) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-020 == morning-020 byte-identical (REUSE)`);
for (const l of DIVERGE2) ok(card['translation_' + l] !== morn['translation_' + l], `${l}: evening-020 DIVERGES from morning-020 (correction)`);
// de: restores worthy-of-worship + distinct «Ihm allein»; NOT the blurred morning «keine Gottheit … Dem Einzigen»
ok(has(card.translation_de, 'anbetungswürdigen') && has(card.translation_de, 'Ihm allein') && !has(card.translation_de, 'keine Gottheit'), 'de: DIVERGE «anbetungswürdigen Gott … Ihm allein» (NOT morning «keine Gottheit … Dem Einzigen»)');
// es: DIVERGE-limited — adds «digna de adoración», rest identical to morning twin; no long tafsir
ok(has(card.translation_es, 'digna de adoración') && !has(card.translation_es, 'glorificado sea') && !has(card.translation_es, 'con amor y exaltación'), 'es: DIVERGE-limited «digna de adoración» present; NO long HadeethEnc tafsir (glorificado sea / con amor y exaltación)');
ok(card.translation_es === morn.translation_es.replace('No hay divinidad salvo', 'No hay divinidad digna de adoración salvo'), 'es: rest byte-identical to morning-020 twin except the inserted «digna de adoración»');

console.log('\n================ 6. morning-020 UNTOUCHED (de/es still original) + all 25 morning intact ================');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_de, 'keine Gottheit') && has(morn.translation_es, 'No hay divinidad salvo Allah'), 'morning-020 de/es still original (NOT retro-fixed — de «keine Gottheit», es «No hay divinidad salvo Allah»)');

console.log('\n================ 7. Arabic + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text.startsWith('لَا إِلَٰهَ إِلَّا اللَّهُ') && card.text.endsWith('عَلَى كُلِّ شَيْءٍ قَدِيرٌ.'), 'Arabic opening «لا إله إلا الله» + closing «على كل شيء قدير.» intact (byte-identical)');
ok(!has(card.text, 'يُحْيِي') && !has(card.text, 'وَيُمِيتُ') && !has(card.text, 'بِيَدِهِ الْخَيْرُ') && !has(card.text, 'حَيٌّ لَا يَمُوتُ'), 'Arabic text has NO «يحيي ويميت / بيده الخير / حي لا يموت» (short form only)');
const b20 = dataSrc.slice(dataSrc.indexOf("id: 'evening-020'"), dataSrc.indexOf("id: 'evening-021'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b20), 'evening-020 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه الترمذي', 'source ref «رواه الترمذي» unchanged');
ok(card.repeat === 100 && card.repeatLabel && card.repeatLabel.ar === 'عشر مرات أو مئة مرة', 'repeat 100 «عشر مرات أو مئة مرة» unchanged');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 20, 'virtue stays a separate Arabic field (present, NOT translated, NOT in block)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 8. Block carries NO URL/domain (bare source names only) ================');
ok(!/https?:\/\//.test(b20) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b20), 'evening-020 block (incl. comment) carries NO URL/domain (TLD)');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names only');
ok(has(b20, 'AZKAR-EVENING-DUA-CARD-20-TRANSLATIONS'), 'evening-020 block carries the ticket provenance comment');

console.log('\n================ 9. Per-region counts — evening 21, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 21, `evening region translation_${l}: EXACTLY 21 (001-004 Quran + 005-021 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 10. Evening 001-021 translated; 022+ untranslated; morning/prayer intact ================');
for (let n = 1; n <= 21; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(21).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 022+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 11. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 12. Cache-busters bumped (azkar-data.js?v=53 + sw v551; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=53\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=53');
ok(!/js\/azkar-data\.js\?v=52\b/.test(htmlSrc), 'no stale ?v=52 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v551'/.test(swSrc), "sw.js CACHE_VERSION = 'v551'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
