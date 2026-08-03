// Smoke — AZKAR-EVENING-DUA-CARD-13-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-013 = «اللهم إني أسألك العفو والعافية في الدنيا والآخرة ... اللهم استر عوراتي وآمن روعاتي ... احفظني من بين
// يدي ومن خلفي وعن يميني وعن شمالي ومن فوقي وأعوذ بعظمتك أن أغتال من تحتي.» (Abu Dawud 5074, once) gains the 9 static
// non-ar MEANING translations. THIRTEEN meanings each lang must keep: pardon+afiya (dunya/akhira), then in din, dunya,
// ahl, mal; ⑥ «استر عوراتي» = COVER FAULTS (never a literal/anatomical rendering); ⑦ «آمن روعاتي» = calm fears; then the
// SIX SEPARATE directions front/behind/right/left/above/below; ⑬ «أغتال من تحتي» = harm/destruction from beneath (NOT
// political assassination). Time-neutral dua → 7 langs (en/fr/ur/tr/bn/ms/id) = morning-013 BYTE-IDENTICAL; de + es DIVERGE
// by EXACTLY one fault-term (de Schamteile→Schwächen, es «cubre mi desnudes»→«cubre mis defectos»); morning-013 UNTOUCHED.
// NO translation_ar; NO reference/repeat/source/sanad/virtue/transliteration/footnote inside the block; renderers untouched.
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
const card = E.find(d => d.id === 'evening-013');
const morn = M.find(d => d.id === 'morning-013');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// The THIRTEEN meanings — distinctive substrings per language (from the finalized texts)
const MEAN = {
  en: ['pardon and well-being', 'in this life and the next', 'religious', 'worldly', 'my family', 'my wealth', 'veil my weaknesses', 'set at ease my dismay', 'from the front', 'from behind', 'on my right', 'on my left', 'from above', 'swallowed up by the earth'],
  fr: ['pardon', 'protection', "cette vie et dans l'au-delà", 'religion', 'ma vie', 'ma famille', 'mes biens', 'Couvre mes défauts', 'rassure', 'peurs', 'devant', 'derrière', 'droite', 'gauche', 'au-dessus', "d'en-dessous"],
  ur: ['عفو اور عافیت', 'دنیا اور آخرت', 'دین', 'اہل', 'مال', 'عیوب چھپا دے', 'مامون', 'آگے', 'پیچھے', 'دائیں', 'بائیں', 'اوپر', 'نیچے سے ہلاک'],
  tr: ['af ve afiyet', 'dinim', 'dünyam', 'aile', 'malım', 'Ayıplarımı ört', 'korkularımdan emin', 'önümden', 'arkamdan', 'sağımdan', 'solumdan', 'üstümden', 'Altımdan helak'],
  bn: ['ক্ষমা ও নিরাপত্তা', 'দুনিয়া ও আখেরাত', 'দ্বীন', 'পরিবার', 'সম্পদ', 'গোপন ত্রুটিসমূহ', 'উদ্বিগ্নতা', 'সামনের', 'পিছনের', 'ডান', 'বাম', 'উপরের', 'নীচ'],
  ms: ['keampunan dan kesejahteraan', 'dunia dan di akhirat', 'agamaku', 'duniaku', 'keluargaku', 'hartaku', 'tutupkanlah keaibanku', 'rasa takut', 'hadapan', 'belakang', 'kanan', 'kiri', 'atas', 'bawah'],
  de: ['Vergebung und Heil', 'Diesseits und im Jenseits', 'Dīn', 'Leben', 'Angehörigen', 'Vermögen', 'verberge meine Schwächen', 'Sicherheit vor meiner Furcht', 'von vorne', 'von hinten', 'von rechts', 'von links', 'von oben', 'von unten'],
  es: ['indulgencia y el bienestar', 'esta vida y en la otra', 'religiosos', 'mundanales', 'mi familia', 'mis bienes', 'cubre mis defectos', 'confórtame ante el miedo', 'delante', 'detrás', 'derecha', 'izquierda', 'sobre mí', 'engullido por la tierra'],
  id: ['ampunan dan keselamatan', 'dunia dan akhirat', 'agamaku', 'duniaku', 'keluargaku', 'hartaku', 'auratku (aib', 'ketentraman di hatiku', 'depan', 'belakang', 'kanan', 'kiri', 'atas', 'bawah'],
};
// SIX SEPARATE directions (front, behind, right, left, above, below) — must all appear, not collapsed to "all sides"
const DIRS = {
  en: ['from the front', 'from behind', 'on my right', 'on my left', 'from above', 'swallowed up by the earth'],
  fr: ['devant', 'derrière', 'droite', 'gauche', 'au-dessus', "d'en-dessous"],
  ur: ['آگے', 'پیچھے', 'دائیں', 'بائیں', 'اوپر', 'نیچے'],
  tr: ['önümden', 'arkamdan', 'sağımdan', 'solumdan', 'üstümden', 'Altımdan'],
  bn: ['সামনের', 'পিছনের', 'ডান', 'বাম', 'উপরের', 'নীচ'],
  ms: ['hadapan', 'belakang', 'kanan', 'kiri', 'atas', 'bawah'],
  de: ['von vorne', 'von hinten', 'von rechts', 'von links', 'von oben', 'von unten'],
  es: ['delante', 'detrás', 'derecha', 'izquierda', 'sobre mí', 'engullido'],
  id: ['depan', 'belakang', 'kanan', 'kiri', 'atas', 'bawah'],
};
// ⑥ cover-FAULTS marker (not literal); ⑦ calm-fears marker
const FAULT = { en: 'veil my weaknesses', fr: 'défauts', ur: 'عیوب', tr: 'Ayıplarımı', bn: 'ত্রুটি', ms: 'keaibanku', de: 'Schwächen', es: 'defectos', id: 'aib' };
const FEAR  = { en: 'dismay', fr: 'peurs', ur: 'مامون', tr: 'korkular', bn: 'উদ্বিগ্নতা', ms: 'takut', de: 'Furcht', es: 'miedo', id: 'ketentraman' };

// forbidden: literal/anatomical rendering of «عورات» (the whole point of the de/es cleanup). id «auratku» is allowed (glossed).
const EMBARRASS = /Schamteile|desnude|genital|private parts|nakedness|parties intimes|verg[üu]enzas|شرم\s*گاہ/i;
// forbidden: political-assassination reading of «أغتال من تحتي»
const ASSASSIN = /assassinat|assassination|asesinat|asesinen|magnicid|Attentat|ermorde|suikast|قتل\s*غيلة|dibunuh secara/i;
// forbidden es alternatives that were explicitly NOT chosen
const ES_REJECTED = /\bfaltas\b|\bdebilidades\b|desnude/i;
// forbidden: reference / repeat label / source / narrator / hadith number
const REF = /رواه|أبو داود|Abu Daw|Ibn Maj|ابن ماجه|ابن السني|\bHisn\b|حصن المسلم|مرة واحدة|\bonce\b|5074|3871/i;
// forbidden: romanized transliteration of THIS dua (single glosses Allah/Rabb/Din are allowed)
const TRANSLIT = /Allahumma inni|as'?aluka|ustur|awrat[iy]|raw[a3]at|ihfazni|bi'?azamatik|ughtala/i;
// forbidden: virtue / authenticity-note leakage
const VIRTUE_LEAK = /كفاه الله|أهل العلم|إسناد/;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-013 identity + all 9 translations, THIRTEEN meanings ================');
ok(!!card && card.id === 'evening-013', 'AzkarEvening has evening-013');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 120, `evening-013 translation_${l} present (full-length dua)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL thirteen meanings preserved`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. SIX SEPARATE directions (front/behind/right/left/above/below) — not collapsed ================');
for (const l of ALL9) ok(DIRS[l].every(x => has(card['translation_' + l], x)), `${l}: all six directions present and distinct`);

console.log('\n================ 3. ⑥ «استر عوراتي» = cover FAULTS (no literal/anatomical) + ⑦ «آمن روعاتي» = calm fears ================');
for (const l of ALL9) ok(has(card['translation_' + l], FAULT[l]), `${l}: ⑥ faults/weaknesses term present (${FAULT[l]})`);
for (const l of ALL9) ok(has(card['translation_' + l], FEAR[l]), `${l}: ⑦ calm-fears term present (${FEAR[l]})`);
for (const l of ALL9) ok(!EMBARRASS.test(card['translation_' + l]), `${l}: NO literal/anatomical rendering of «عورات»`);

console.log('\n================ 4. ⑬ «أغتال من تحتي» = harm from below, NOT political assassination ================');
for (const l of ALL9) ok(!ASSASSIN.test(card['translation_' + l]), `${l}: no political-assassination reading`);

console.log('\n================ 5. de/es targeted cleanup + all others; rejected tokens absent ================');
ok(has(card.translation_de, 'verberge meine Schwächen') && !card.translation_de.includes('Schamteile'), 'de uses «Schwächen» (NOT «Schamteile»)');
ok(has(card.translation_es, 'cubre mis defectos') && !ES_REJECTED.test(card.translation_es), 'es uses «cubre mis defectos» (NOT desnudes/faltas/debilidades)');

console.log('\n================ 6. NO reference/repeat/source/narrator/hadith-number/transliteration/virtue inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat-label/source/narrator/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
for (const l of ALL9) ok(!VIRTUE_LEAK.test(card['translation_' + l]), `${l}: no virtue/authenticity-note text leaked in`);

console.log('\n================ 7. Time-neutral reuse: 7 langs byte-identical to morning-013; de/es diverge by ONE word only ================');
for (const l of ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'id']) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-013 == morning-013 byte-identical (verbatim reuse)`);
ok(card.translation_de !== morn.translation_de, 'de: evening-013 DIVERGES from morning-013 (fault-term cleanup)');
ok(morn.translation_de.replace('Schamteile', 'Schwächen') === card.translation_de, 'de: the ONLY difference vs morning-013 is Schamteile→Schwächen');
ok(card.translation_es !== morn.translation_es, 'es: evening-013 DIVERGES from morning-013 (fault-term cleanup)');
ok(morn.translation_es.replace('cubre mi desnudes', 'cubre mis defectos') === card.translation_es, 'es: the ONLY difference vs morning-013 is «cubre mi desnudes»→«cubre mis defectos»');

console.log('\n================ 8. morning-013 UNTOUCHED (still carries the pre-fix literal wording) ================');
ok(morn.translation_de.includes('Schamteile'), 'morning-013 de still has «Schamteile» (NOT touched by this ticket)');
ok(morn.translation_es.includes('cubre mi desnudes'), 'morning-013 es still has «cubre mi desnudes» (NOT touched by this ticket)');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 9. Arabic text byte-identical + NO translation_ar + source/repeat/virtue unchanged ================');
ok(card.text === morn.text, 'evening-013 Arabic == morning-013 Arabic byte-identical (time-neutral twin)');
ok(card.text.startsWith('اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ') && card.text.endsWith('أَنْ أُغْتَالَ مِنْ تَحْتِي.'), 'Arabic opening «اللهم إني أسألك العفو والعافية» + closing «أن أغتال من تحتي.» intact');
ok(has(card.text, 'اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي'), 'Arabic keeps «استر عوراتي وآمن روعاتي» intact');
const b13 = dataSrc.slice(dataSrc.indexOf("id: 'evening-013'"), dataSrc.indexOf("id: 'evening-014'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b13), 'evening-013 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه أبو داود', 'source ref «رواه أبو داود» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة', 'repeat 1 «مرة واحدة» unchanged');
ok(card.virtue === null, 'virtue stays null (unchanged)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 10. Per-region counts — evening 13, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 17, `evening region translation_${l}: EXACTLY 17 (001-004 Quran + 005-017 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 11. Evening 001-017 translated; 018+ untranslated; prayer intact ================');
for (let n = 1; n <= 17; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(17).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 018+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 12. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b13, 'AZKAR-EVENING-DUA-CARD-13-TRANSLATIONS'), 'evening-013 block carries the ticket provenance comment');

console.log('\n================ 17. Cache-busters bumped (azkar-data.js?v=49 + sw v547; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=49\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=49');
ok(!/js\/azkar-data\.js\?v=48\b/.test(htmlSrc), 'no stale ?v=44 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v547'/.test(swSrc), "sw.js CACHE_VERSION = 'v547'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
