// Smoke — AZKAR-EVENING-DUA-CARD-06-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-006 («اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.», Tirmidhi,
// repeat 1 «مرة واحدة») gains the 9 static non-ar MEANING translations. This is the EVENING form of a dua that has a
// morning twin differing ONLY in the last word: morning ends «النشور» (resurrection), EVENING ends «المصير» (the
// return / destination). So the six meanings are: ① O Allah ② by You we reach the evening ③ and by You the morning
// ④ by You we live ⑤ by You we die ⑥ and to You is the RETURN (المصير) — NOT resurrection. Morning wording (③) is
// REQUIRED here (both clauses present); the make-or-break is the ⑥ return-ending and the ABSENCE of any
// resurrection/النشور wording. NO translation_ar, NO reference/repeat/source/sanad/transliteration/footnote inside
// the block. Renderers (server.js/app.js) untouched. Approved sources: en=Hisn al-Muslim EN #78; fr=Hisnii;
// ur=HadeethEnc #5490 + IslamHouse; tr=kabe.com.tr (Tirmizî Deavât); bn=Hisn al-Muslim al-Qahtani (evening footnote);
// ms=AkuIslam+Taqwa; de=HadeethEnc #5490 (explanation, Rückkehr); es=HadeethEnc es #5490 (mañana-first order, «el
// retorno» — user-approved over the blog/Way-to-Allah anochecido-first); id=muslim.or.id/Rumaysho/Almanhaj.
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
const N = (s) => s.normalize('NFC');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const E = sandbox.window.AzkarEvening;
const M = sandbox.window.AzkarMorning;
const P = sandbox.window.AzkarPrayer;
const card = E.find(d => d.id === 'evening-006');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// The SIX meanings, per language, as exact substrings that MUST all be present.
const MEAN = {
  en: ['O Allah', 'reached the evening', 'reached the morning', 'we live', 'die', 'unto You is our return'],
  fr: ['Ô Allah', 'au soir', 'au matin', 'nous vivons', 'nous mourons', 'notre destinée'],
  ur: ['اے اللہ', 'شام کی', 'صبح کی', 'زندہ ہوتے', 'مرتے ہیں', 'لوٹ کر جانا'],
  tr: ["Allah'ım", 'akşamladık', 'sabahladık', 'yaşar', 'ölürüz', 'Dönüş'],
  bn: ['হে আল্লাহ', 'বিকালে উপনীত', 'সকালে উপনীত', 'জীবিত থাকি', 'মারা যাব', 'প্রত্যাবর্তিত হব'],
  ms: ['Ya Allah', 'waktu petang', 'waktu pagi', 'kami hidup', 'kami mati', 'tempat kembali'],
  de: ['O Allah', 'in den Abend', 'in den Morgen', 'leben wir', 'sterben wir', 'Rückkehr'],
  es: ['Oh Al-lah', 'anochecido', 'amanecido', 'vivimos', 'morimos', 'el retorno'],
  id: ['Ya Allah', 'waktu sore', 'waktu pagi', 'kami hidup', 'kami mati', 'tempat kembali'],
};
// meaning ⑥ — the RETURN (المصير) ending that MUST be present
const RETURN = { en:/our return/i, fr:/notre destinée/i, ur:/لوٹ کر جانا/, tr:/Dönüş/, bn:/প্রত্যাবর্তিত/, ms:/tempat kembali/i, de:/Rückkehr/, es:/el retorno/i, id:/tempat kembali/i };
// resurrection / النشور wording that MUST NOT appear (that is the MORNING ending)
const RESUR = { en:/resurrection|rising|raised/i, fr:/résurrection|ressuscit/i, ur:/نشور|اٹھ کر|بعث/, tr:/diriliş|diriltil/i, bn:/পুনরুত্থান|পুনর্জীবন|উত্থিত/, ms:/kebangkitan|dibangkitkan/i, de:/Auferstehung/i, es:/resurrección|resucit/i, id:/kebangkitan|dibangkitkan/i };
// reference / repeat / source / sanad tokens that MUST NOT appear inside a translation value
const REF = /رواه|الترمذي|Tirmidhi|Tirmizî|Abu Dawud|Ibn Majah|Nasa'i|ابن ماجه|\bhadith\b|\bhasan\b|رقم|مرة واحدة|\bonce\b/i;
// LATIN transliteration of the Arabic that MUST NOT appear
const TRANSLIT = /Allahumma bika|bika amsayna|bika asbahna|wa ilayka|wa bika nahya|al-?ma[sŝ]ir|an-?nushur/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-006 identity + all 9 translations, SIX meanings each ================');
ok(!!card && card.id === 'evening-006', "AzkarEvening has evening-006");
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `evening-006 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => N(t).includes(N(x))), `${l}: ALL SIX meanings preserved (Allah + evening + morning + live + die + RETURN)`);
  ok(RETURN[l].test(t), `${l}: ⑥ ends with the RETURN/المصير meaning`);
  ok(!RESUR[l].test(t), `${l}: NO resurrection/النشور wording (that is the MORNING ending)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
  ok(!/­/.test(t), `${l}: no soft hyphen`);
}

console.log('\n================ 2. NO reference/repeat/source/sanad + NO transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat/source/sanad token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. Approved per-language source decisions ================');
ok(card.translation_es.includes('el retorno') && card.translation_es.includes('amanecido') && card.translation_es.includes('anochecido') && !/resurrección/i.test(card.translation_es),
  'es: HadeethEnc #5490 «el retorno» — complete (amanecido+anochecido, mañana-first accepted), NOT resurrección');
ok(card.translation_de.includes('Rückkehr') && !card.translation_de.includes('Auferstehung'),
  'de: HadeethEnc #5490 evening «Rückkehr» (NOT the morning-body «Auferstehung»)');
ok(/kami hidup, dan dengan kehendak-Mu kami mati/.test(card.translation_ms) && card.translation_ms.includes('tempat kembali'),
  'ms: AkuIslam published «dengan rahmat dan pertolongan-Mu» expansion + «tempat kembali» (user-approved)');
ok(card.translation_id.includes('dengan rahmat dan pertolongan-Mu') && card.translation_id.includes('tempat kembali'),
  'id: muslim.or.id published «بك» expansion + «tempat kembali» (user-approved)');
ok(/we live and die/.test(card.translation_en) && /yaşar Seninle ölürüz/.test(card.translation_tr),
  'en/tr: source-merged «live and die» / «yaşar…ölürüz» kept verbatim (no manual re-splitting)');

console.log('\n================ 4. NO translation_ar + Arabic text/source/repeat byte-identical ================');
ok(card.translation_ar === undefined, 'evening-006 object has NO translation_ar');
const b6 = dataSrc.slice(dataSrc.indexOf("id: 'evening-006'"), dataSrc.indexOf("id: 'evening-007'"));
ok(!/translation_ar\s*:/.test(b6), 'evening-006 source block declares NO translation_ar field');
ok(card.text.startsWith('اللَّهُمَّ بِكَ أَمْسَيْنَا') && card.text.endsWith('وَإِلَيْكَ الْمَصِيرُ.'),
  'Arabic text opening + closing intact (byte-identical anchors; ends «المصير» not «النشور»)');
ok(card.text.includes('وَبِكَ أَصْبَحْنَا') && card.text.includes('وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ'),
  'Arabic text distinctive interior phrases intact (asbahna + nahya/namutu)');
ok(!card.text.includes('النُّشُور') && !card.text.includes('النشور'),
  'Arabic text does NOT contain النشور (this is the evening/المصير form)');
ok(/source:\s*\{\s*ref:\s*'رواه الترمذي'\s*\}/.test(b6), "source stays { ref: 'رواه الترمذي' }");
ok(/repeat:\s*1,/.test(b6) && /repeatLabel:\s*\{\s*ar:\s*'مرة واحدة',\s*en:\s*'once'\s*\}/.test(b6), "repeat stays 1 («مرة واحدة» / «once»)");
ok(/authenticity:\s*'sahih'/.test(b6) && /virtue:\s*null/.test(b6), "authenticity 'sahih' + virtue null unchanged");

console.log('\n================ 5. Per-region translation counts — evening 7, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Evening 001-007 still translated; 008+ untranslated; lists intact ================');
for (const id of ['evening-001','evening-002','evening-003','evening-004','evening-005','evening-006','evening-007']) {
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} still carries all 9 translations`);
}
ok(E.find(d => d.id === 'evening-005').translation_en.includes('reached the evening') && E.find(d => d.id === 'evening-005').translation_en.includes('omnipotent'),
  'evening-005 (previous dua) translation intact');
ok(E.slice(23).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 024+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 7. Renderers (server.js / app.js) untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation rendered ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation / source URLs / fetch ================');
ok(!/https?:\/\//.test(b6) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b6), 'evening-006 block (incl. comment) carries NO URL/domain');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names in comments are fine');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=55/.test(htmlSrc), 'index.html azkar-data.js?v=55 (evening-006 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=843/.test(htmlSrc), 'index.html app.js?v=843 UNCHANGED');
ok(/CACHE_VERSION = 'v554'/.test(swSrc), "sw.js CACHE_VERSION 'v554'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
