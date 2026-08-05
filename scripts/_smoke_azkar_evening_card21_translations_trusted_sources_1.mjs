// Smoke — AZKAR-EVENING-DUA-CARD-21-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-021 = «سبحان الله وبحمده» (Muslim, 100×, authenticity 'sahih', virtue = separate Arabic field) gains the 9 static
// non-ar MEANING translations of the SHORT tasbih. TIME-NEUTRAL → ALL NINE = the morning-021 twin verbatim (REUSE): zero
// DIVERGE, zero SWAP, zero COMPOSITE, and the Arabic itself is byte-identical to that twin. TWO meanings each: ①tasbih
// (glory/purity — Allah free of every imperfection) ②wa-bihamdih (and with His praise). ⛔ SHORT form ONLY — NO Mighty-
// attribute suffix, NO by-the-number-of-His-creation extension, NO second dhikr appended (each such longer narration is a
// DIFFERENT card). de = USER-decided REUSE (printed German Hisn al-Muslim card 91-17), NO German DIVERGE opened.
// Disclosures asserted: bn keeps the published purity+majesty doublet (rejected-attribute adjective absent); es mid-phrase
// capital is cosmetic; id parenthesis is source meaning, not a footnote. morning-021 UNTOUCHED. NO translation_ar.
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
const card = E.find(d => d.id === 'evening-021');
const morn = M.find(d => d.id === 'morning-021');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// TWO meanings — targeted distinct markers per language
const M1 = { en: 'How perfect Allah is', fr: 'pureté', ur: 'پاک ہے', tr: 'tenzih ederim', bn: 'পবিত্রতা', ms: 'Mahasuci', de: 'Gepriesen sei Allah', es: 'Glorificado sea', id: 'Maha Suci' }; // ① tasbih / purity
const M2 = { en: 'I praise Him', fr: 'louange', ur: 'تعریف', tr: 'Hamdederek', bn: 'প্রশংসাসহ', ms: 'memuji-Nya', de: 'Lob sei Ihm', es: 'Alabado sea', id: 'segala puji' }; // ② wa bihamdih / praise
const M_ALL = [M1, M2];

// ⛔ THE #1 TRAP — Mighty-attribute suffix in ANY language
const AZEEM = /al-?A[zẓ]{1,2}[eî]{1,2}m|العظيم|عظیم|the Magnificent|the Great\b|Most Great|der Gewaltige|der Allmächtige|l'Immense|le Très Grand|el Grandioso|el Magnífico|Maha Agung|Yang Maha Agung|Maha Besar|মহান|Yüce Allah|azametli/i;
// ⛔ by-the-number-of-His-creation extension (the OTHER longer narration = a different card)
const ADAD = /عدد خلقه|number of His creation|Anzahl seiner Schöpfung|nombre de Ses créatures|número de Sus criaturas|bilangan makhluk|সৃষ্টির সংখ্যা|مخلوقات کی تعداد|yarattıklarının sayısı|rida nafsihi|zinata arshihi|midada kalimatihi|رضا نفسه|زنة عرشه|مداد كلماته/i;
// ⛔ any SECOND dhikr appended
const SECOND = /لا إله إلا الله|no god but Allah|no deity|divinité en dehors|Tidak ada ilah|Tiada tuhan|لا حول ولا قوة|no power (and )?no strength|keine Gottheit|no hay divinidad/i;
// forbidden: reference / attribution / repeat / hadith number
const REF = /رواه|\bمسلم\b|\bMuslim\b|\bHisn\b|حصن المسلم|Ibn Majah|ابن ماجه|مئة مرة|مائة مرة|\b100\b|hundred times|\bsahih\b|صحيح/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /Subhan\s?-?Allah|Subhanallah|Subḥān|wa\s?-?bihamdih|bihamdihi/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-021 identity + all 9 translations, TWO meanings ================');
ok(!!card && card.id === 'evening-021', 'AzkarEvening has evening-021');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 20, `evening-021 translation_${l} present (non-empty)`);
  if (typeof t !== 'string') continue;
  ok(M_ALL.every(mm => has(t, mm[l])), `${l}: BOTH meanings preserved (① tasbih/purity + ② wa-bihamdih/praise)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ⛔ NO Mighty-attribute suffix in ANY language (the #1 trap) ================');
for (const l of ALL9) ok(!AZEEM.test(N(card['translation_' + l])), `${l}: NO Mighty-attribute / longer-form suffix`);

console.log('\n================ 3. ⛔ NO by-the-number-of-creation extension, NO second dhikr appended ================');
for (const l of ALL9) ok(!ADAD.test(N(card['translation_' + l])), `${l}: NO by-the-number-of-His-creation extension`);
for (const l of ALL9) ok(!SECOND.test(N(card['translation_' + l])), `${l}: NO second dhikr appended`);

console.log('\n================ 4. NO reference/attribution/repeat/hadith-number/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 5. Strategy: ALL 9 REUSE (morning-021 verbatim) — zero DIVERGE/SWAP/COMPOSITE ================');
for (const l of ALL9) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-021 == morning-021 byte-identical (REUSE)`);
ok(ALL9.every(l => card['translation_' + l] === morn['translation_' + l]), 'ALL NINE are REUSE — not one language diverges');
// de: USER-decided REUSE, both meanings, no other dhikr
ok(card.translation_de === 'Gepriesen sei Allah und Lob sei Ihm.', 'de: exact USER-decided REUSE string (printed German Hisn al-Muslim card 91-17)');
ok(has(card.translation_de, 'Gepriesen sei Allah') && has(card.translation_de, 'Lob sei Ihm') && !AZEEM.test(card.translation_de) && !SECOND.test(card.translation_de), 'de: keeps tasbih + hamd, adds no other dhikr, no Mighty-attribute');

console.log('\n================ 6. Accepted disclosures (bn doublet / es capital / id parenthesis) ================');
ok(has(card.translation_bn, 'মহিমা') && !has(card.translation_bn, 'মহান'), 'bn: published doublet «মহিমা» inside the ONE tasbih; rejected-attribute adjective «মহান» ABSENT');
ok(has(card.translation_es, 'Alabado') && card.translation_es === morn.translation_es, 'es: mid-phrase capital «Alabado» is cosmetic only (byte-identical to the twin)');
ok(has(card.translation_id, '(bagi-Nya)') && card.translation_id === morn.translation_id, 'id: «(bagi-Nya)» is source meaning (byte-identical to the twin), not a footnote/reference');

console.log('\n================ 7. morning-021 UNTOUCHED + all 25 morning intact ================');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(morn.translation_de === 'Gepriesen sei Allah und Lob sei Ihm.' && morn.translation_en === 'How perfect Allah is and I praise Him.', 'morning-021 de/en still original (NOT retro-edited)');
const bM21 = dataSrc.slice(dataSrc.indexOf("id: 'morning-021'"), dataSrc.indexOf("id: 'morning-022'"));
ok(!has(bM21, 'AZKAR-EVENING-DUA-CARD-21'), 'morning-021 block carries NO evening-ticket marker (untouched)');

console.log('\n================ 8. Arabic + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text === 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.', 'Arabic text byte-identical to the shipped literal «سبحان الله وبحمده.»');
ok(card.text === morn.text, 'evening-021 Arabic == morning-021 Arabic byte-identical');
ok(!AZEEM.test(card.text) && !ADAD.test(card.text) && ![...card.text].some(ch => /[\p{Nd}]/u.test(ch)), 'Arabic text is the SHORT form only (no Mighty-attribute, no number-of-creation, no digits)');
const b21 = dataSrc.slice(dataSrc.indexOf("id: 'evening-021'"), dataSrc.indexOf("id: 'evening-022'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b21), 'evening-021 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه مسلم', 'source ref «رواه مسلم» unchanged');
ok(card.repeat === 100 && card.repeatLabel && card.repeatLabel.ar === 'مئة مرة', 'repeat 100 «مئة مرة» unchanged');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 20 && card.virtue.en === null, 'virtue stays a separate Arabic field (present, NOT translated, NOT in block)');
ok(ALL9.every(l => !has(card['translation_' + l], 'حسنة') && !has(card['translation_' + l], 'القيامة')), 'no virtue/reward wording leaked into any translation block');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 9. Block carries NO URL/domain (bare source names only) ================');
ok(!/https?:\/\//.test(b21) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b21), 'evening-021 block (incl. comment) carries NO URL/domain (TLD)');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names only');
ok(has(b21, 'AZKAR-EVENING-DUA-CARD-21-TRANSLATIONS'), 'evening-021 block carries the ticket provenance comment');

console.log('\n================ 10. Per-region counts — evening 23, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 11. Evening 001-023 translated; 024+ untranslated; morning/prayer intact ================');
for (let n = 1; n <= 23; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(23).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 024+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 12. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 13. Cache-busters bumped (azkar-data.js?v=55 + sw v553; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=55\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=55');
ok(!/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'no stale ?v=54 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v553'/.test(swSrc), "sw.js CACHE_VERSION = 'v553'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
