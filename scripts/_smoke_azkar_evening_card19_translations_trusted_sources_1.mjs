// Smoke — AZKAR-EVENING-DUA-CARD-19-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-019 = «أمسينا على فطرة الإسلام، وعلى كلمة الإخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا إبراهيم،
// حنيفًا مسلمًا وما كان من المشركين» (Ahmad, ×1 «مرة واحدة», authenticity 'sahih', virtue null) gains the 9 static non-ar
// MEANING translations. NOT time-neutral: explicit EVENING form. EIGHT meanings each: ①amsayna(evening) ②fitrah of Islam
// ③word of sincerity ④religion of our Prophet Muhammad ⑤millah of our FATHER Ibrahim ⑥hanif ⑦Muslim ⑧not of the polytheists.
// UNIFIED HONORIFIC-STRIP (user policy A): NO salawat/ﷺ/«صلى الله عليه وسلم»/«sallallahu»/«peace and blessings» and NO extra
// honorific on Ibrahim inside ANY translation block (all 9). Arabic text keeps «صلى الله عليه وسلم» byte-identical.
// en=NATIVE-EVE; fr/ur/tr/bn/de/id=SWAP; ms=SWAP/COMPOSITE (disclosed medium); es=DIVERGE (morning twin dropped «our father»).
// morning-019 UNTOUCHED. NO translation_ar.
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
const card = E.find(d => d.id === 'evening-019');
const morn = M.find(d => d.id === 'morning-019');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// EIGHT meanings — targeted distinct markers per language
const M1 = { en: 'entered the evening', fr: 'au soir', ur: 'شام کی', tr: 'akşama eriştik', bn: 'বিকালে', ms: 'waktu petang', de: 'in den Abend', es: 'Anochecimos', id: 'waktu petang' }; // ① amsayna
const M2 = { en: 'natural religion of Islam', fr: "nature première qui est l'Islam", ur: 'فطرت اسلام', tr: 'fıtratı', bn: 'ফিত্বরাত', ms: 'fitrah Islam', de: 'Fitrah', es: 'fitrah del Islam', id: 'fitrah Islam' }; // ② fitrah
const M3 = { en: 'statement of pure faith', fr: 'parole du monothéisme', ur: 'کلمہ اخلاص', tr: 'ihlas kelimesi', bn: 'নিষ্ঠাপূর্ণ বাণী', ms: 'kalimah ikhlas', de: 'Wort der Aufrichtigkeit', es: 'palabra del monoteísmo', id: 'kalimat ikhlas' }; // ③ word of sincerity
const M4 = { en: 'our Prophet Muhammad', fr: 'notre Prophète Muhammad', ur: 'نبی محمد', tr: 'Nebîmiz Muhammed', bn: 'নবী মুহাম্মাদ', ms: 'Nabi kami Muhammad', de: 'unseres Propheten Muhammad', es: 'nuestro Profeta Muhámmad', id: 'Nabi kami Muhammad' }; // ④ religion of our Prophet
const M5 = { en: 'our father Ibrahim', fr: 'notre père Abraham', ur: 'اپنے باپ ابراہیم', tr: 'babamız İbrahim', bn: 'আমাদের পিতা ইব্রাহীম', ms: 'bapa kami Ibrahim', de: 'unseres Vaters Ibrahim', es: 'nuestro padre Abraham', id: 'bapak kami Ibrahim' }; // ⑤ our FATHER Ibrahim
const M6 = { en: 'turned away from all that is false', fr: 'vouait son culte exclusivement à Allah', ur: 'یک طرفہ', tr: 'hanif', bn: 'একনিষ্ঠ', ms: 'lurus', de: 'Anhänger des rechten Glaubens', es: 'monoteísta', id: 'lurus' }; // ⑥ hanif
const M7 = { en: 'having surrendered to Allah', fr: 'soumis à Lui', ur: 'مسلمان', tr: 'müslüman', bn: 'মুসলিম', ms: 'muslim', de: 'sich Allah ergeben', es: 'musulmán', id: 'muslim' }; // ⑦ Muslim
const M8 = { en: 'not of the polytheists', fr: 'associateurs', ur: 'مشرکوں میں سے نہیں', tr: 'müşriklerden', bn: 'মুশরিকদের অন্তর্ভুক্ত ছিলেন না', ms: 'orang-orang musyrik', de: 'Götzendienern', es: 'asociadores', id: 'orang-orang musyrik' }; // ⑧ not of polytheists
const M_ALL = [M1, M2, M3, M4, M5, M6, M7, M8];

// forbidden: DAY/MORNING wording per language (evening-not-morning gate)
const DAY = {
  en: /\bmorning\b|we rise|this day|\btoday\b/i,
  fr: /\bmatin\b/i,
  ur: /صبح/,
  tr: /sabah/i,
  bn: /সকালে/,
  ms: /\bpagi\b/i,
  de: /\bMorgen\b/i,
  es: /amanec/i,
  id: /\bpagi\b/i,
};
// forbidden: salawat / honorific inside the block (policy A — all 9)
const SALAWAT = /ﷺ|صلى الله عليه وسلم|صَلَّى اللَّهُ|sallallahu|sallAllahu|peace and blessings|peace be upon him|\bSAW\b|\bSAWS\b|-sallallahu|عليہ السلام|علیہ السلام|আলাইহি ওয়াসাল্লাম|আলাইহিস সালাম|la paz y las bendiciones/i;
// forbidden: reference / attribution / repeat / hadith number
const REF = /رواه|أحمد|\bAhmad\b|\bHisn\b|حصن المسلم|مرة واحدة|\bonce\b|15360|\bsahih\b|صحيح/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /Amsayna|amsayna|ala fitrat|kalimat al-?ikhlas|millat|hanifan musliman|ma kana min/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-019 identity + all 9 translations, EIGHT meanings ================');
ok(!!card && card.id === 'evening-019', 'AzkarEvening has evening-019');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 60, `evening-019 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(M_ALL.every(mm => has(t, mm[l])), `${l}: ALL eight meanings preserved (amsayna+fitrah+ikhlas+Prophet-Muhammad+father-Ibrahim+hanif+Muslim+not-polytheists)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. EVENING-NOT-MORNING gate — evening wording present, ZERO morning leak ================');
for (const l of ALL9) ok(has(card['translation_' + l], M1[l]), `${l}: ① «أمسينا» (evening) marker present (${M1[l]})`);
for (const l of ALL9) ok(!DAY[l].test(N(card['translation_' + l])), `${l}: NO morning wording leak (morning/we-rise/matin/صبح/sabah/pagi/Morgen/amanec)`);

console.log('\n================ 3. ⑤ «أبينا» (our father) kept in ALL 9 (esp. es DIVERGE); ② fitrah not merely «Islam» ================');
for (const l of ALL9) ok(has(card['translation_' + l], M5[l]), `${l}: ⑤ «ملة أبينا إبراهيم» (our FATHER Ibrahim) present (${M5[l]})`);
for (const l of ALL9) ok(has(card['translation_' + l], M2[l]), `${l}: ② «فطرة الإسلام» (fitrah, not merely Islam) present (${M2[l]})`);
// es DIVERGE: must keep «nuestro padre», must NOT be the deficient morning «comunidad de Abraham»
ok(has(card.translation_es, 'nuestro padre Abraham') && !has(card.translation_es, 'comunidad de Abraham'), 'es: DIVERGE keeps «nuestro padre Abraham» (NOT morning «comunidad de Abraham»)');

console.log('\n================ 4. UNIFIED HONORIFIC-STRIP (policy A) — NO salawat/honorific inside ANY block ================');
for (const l of ALL9) ok(!SALAWAT.test(card['translation_' + l]), `${l}: NO salawat/ﷺ/honorific inside translation block (policy A)`);
// but the Arabic text field MUST still carry the salawat byte-identical
ok(has(card.text, 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'), 'Arabic text field KEEPS «صلى الله عليه وسلم» (byte-identical, only the block is stripped)');

console.log('\n================ 5. NO reference/attribution/repeat/hadith-number/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 6. Strategy: en NATIVE-EVE; ms disclosed medium; all 9 differ from morning-019; morning UNTOUCHED ================');
for (const l of ALL9) ok(card['translation_' + l] !== morn['translation_' + l], `${l}: evening-019 differs from morning-019 (evening form / correction)`);
// morning-019 still carries its DAY wording + its own salawat forms (proof untouched)
ok(has(morn.translation_fr, 'au matin') && has(morn.translation_ur, 'صبح') && has(morn.translation_es, 'Amanecimos') && has(morn.translation_id, 'waktu pagi'), 'morning-019 fr/ur/es/id still carry DAY wording (untouched)');
ok(has(morn.translation_es, 'comunidad de Abraham'), 'morning-019 es still carries deficient «comunidad de Abraham» (NOT retro-fixed — deferred)');
// ms disclosure: evening form set (petang/malam), NOT morning (pagi); 8/8 present
ok(has(card.translation_ms, 'waktu petang') && !has(card.translation_ms, 'pagi'), 'ms: SWAP/COMPOSITE evening «waktu petang» (NO «pagi» morning leak)');

console.log('\n================ 7. Arabic + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text.startsWith('أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ') && card.text.endsWith('وَمَا كَانَ مِنَ الْمُشْرِكِينَ.'), 'Arabic opening «أمسينا على فطرة الإسلام» + closing «وما كان من المشركين.» intact (byte-identical)');
const b19 = dataSrc.slice(dataSrc.indexOf("id: 'evening-019'"), dataSrc.indexOf("id: 'evening-020'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b19), 'evening-019 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه أحمد', 'source ref «رواه أحمد» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة', 'repeat 1 «مرة واحدة» unchanged');
ok(card.virtue === null, 'virtue stays null (unchanged)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 8. Block carries NO URL/domain (bare source names only) ================');
ok(!/https?:\/\//.test(b19) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b19), 'evening-019 block (incl. comment) carries NO URL/domain (TLD)');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names only');
ok(has(b19, 'AZKAR-EVENING-DUA-CARD-19-TRANSLATIONS'), 'evening-019 block carries the ticket provenance comment');

console.log('\n================ 9. Per-region counts — evening 22, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 22, `evening region translation_${l}: EXACTLY 22 (001-004 Quran + 005-022 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 10. Evening 001-022 translated; 023+ untranslated; morning/prayer intact ================');
for (let n = 1; n <= 22; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(22).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 023+ carry NO translation fields');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 11. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 12. Cache-busters bumped (azkar-data.js?v=54 + sw v552; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=54');
ok(!/js\/azkar-data\.js\?v=53\b/.test(htmlSrc), 'no stale ?v=53 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v552'/.test(swSrc), "sw.js CACHE_VERSION = 'v552'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
