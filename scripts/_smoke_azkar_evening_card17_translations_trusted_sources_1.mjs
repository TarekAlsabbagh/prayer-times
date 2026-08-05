// Smoke — AZKAR-EVENING-DUA-CARD-17-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-017 = «يا حي يا قيوم، برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين» (al-Tirmidhi, ×1 «مرة واحدة»,
// authenticity 'hasan', virtue null) gains the 9 static non-ar MEANING translations. SIX meanings each: ①يا حي=Ever-Living
// ②يا قيوم=Sustainer/Self-Subsisting (NOT reduced to Ever-Living) ③برحمتك أستغيث=by Your mercy I seek help ④أصلح لي شأني كله=
// rectify ALL my affairs (كله must survive) ⑤لا تكلني إلى نفسي=do not leave me TO MYSELF (إلى نفسي must survive) ⑥طرفة عين=
// blink of an eye. TIME-NEUTRAL (evening Arabic differs from morning-017 only by a comma after Qayyum → NOT byte-identical).
// FOUR reuse morning-017 verbatim (en/ur/tr/es); FIVE DIVERGE (fr/bn/ms/de/id) because morning-017 underrepresents a meaning.
// bn USER-decision «সবকিছুর ধারক» (NOT «সর্বকিছুর»); ms USER-decision keeps «Kekal memerintah». morning-017 UNTOUCHED. NO translation_ar.
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
const card = E.find(d => d.id === 'evening-017');
const morn = M.find(d => d.id === 'morning-017');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const REUSE4 = ['en', 'ur', 'tr', 'es'];
const DIVERGE5 = ['fr', 'bn', 'ms', 'de', 'id'];

// SIX meanings — targeted markers per language
const M1 = { en: 'Ever Living', fr: 'le Vivant', ur: 'زندہ', tr: 'Ya Hayy', bn: 'চিরঞ্জীব', ms: 'Tetap Hidup', de: 'Lebendiger', es: 'Viviente', id: 'Maha Hidup' }; // Ever-Living
const M2 = { en: 'Self-Subsisting', fr: 'dont toute chose dépend', ur: 'قائم رکھنے والے', tr: 'Kayyûm', bn: 'সবকিছুর ধারক', ms: 'Kekal memerintah', de: 'Beständiger', es: 'Subsistente', id: 'Maha Berdiri Sendiri' }; // Qayyum
const M3 = { en: 'mercy', fr: 'miséricorde', ur: 'رحمت', tr: 'rahmetinle', bn: 'রহমতের', ms: 'rahmatMu', de: 'Barmherzigkeit', es: 'misericordia', id: 'rahmat-Mu' }; // by Your mercy
const M4 = { en: 'all of my affairs', fr: 'en tout point', ur: 'مکمل حالت', tr: 'Bütün işlerimi', bn: 'সার্বিক অবস্থা', ms: 'segala urusanku', de: 'all meine Angelegenheiten', es: 'todos mis asuntos', id: 'seluruh urusanku' }; // ALL affairs
const M5 = { en: 'to myself', fr: 'à mon propre sort', ur: 'میرے نفس کے سپرد', tr: 'nefsime', bn: 'নিজের কাছে', ms: 'kepada diriku sendiri', de: 'mir selbst', es: 'a mi mismo', id: 'kepada diriku sendiri' }; // to MYSELF
const M6 = { en: 'blink of an eye', fr: "clin d'œil", ur: 'لحظہ بھر', tr: 'göz açıp kapayınca', bn: 'নিমেষের', ms: 'sekelip mata', de: 'Augenblick', es: 'pestañeo', id: 'sekejap mata' }; // blink

// forbidden: reference / attribution / repeat / hadith number
const REF = /رواه|الترمذي|\bTirmidh|\bTirmizî|\bHisn\b|حصن المسلم|مرة واحدة|\bonce\b|Nasa|Hakim|3524|1033|661|\bAhmad\b/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /Ya Hayyu ya Qayyum|bi-?rahmatika|astaghith|aslih li sha|takilni|tarfata/i;
// forbidden: sibling-narration verb «أرجو» (Abu Dawud) instead of «أستغيث»
const ARJU_TRAP = /أرجو|ارجو/;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-017 identity + all 9 translations, SIX meanings ================');
ok(!!card && card.id === 'evening-017', 'AzkarEvening has evening-017');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `evening-017 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok([M1, M2, M3, M4, M5, M6].every(mm => has(t, mm[l])), `${l}: ALL six meanings preserved (Hayy+Qayyum+mercy+all-affairs+to-myself+blink)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ② «القيوم» not reduced to «الحي»; ④ «كله»; ⑤ «إلى نفسي»; ⑥ «طرفة عين» present ================');
for (const l of ALL9) ok(has(card['translation_' + l], M2[l]), `${l}: ② Qayyum/Sustainer marker present (${M2[l]})`);
for (const l of ALL9) ok(has(card['translation_' + l], M4[l]), `${l}: ④ «شأني كله» (all affairs) marker present (${M4[l]})`);
for (const l of ALL9) ok(has(card['translation_' + l], M5[l]), `${l}: ⑤ «إلى نفسي» (to myself) marker present (${M5[l]})`);
for (const l of ALL9) ok(has(card['translation_' + l], M6[l]), `${l}: ⑥ «طرفة عين» (blink) marker present (${M6[l]})`);

console.log('\n================ 3. NO reference/attribution/repeat/hadith-number/transliteration/«أرجو»-trap inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
ok(!ARJU_TRAP.test(card.translation_ur) && !ARJU_TRAP.test(card.translation_ur), 'ur: no «أرجو» sibling-narration verb (astaghith sense kept)');

console.log('\n================ 4. FOUR reuse morning-017 verbatim (en/ur/tr/es) ================');
for (const l of REUSE4) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-017 == morning-017 byte-identical (verbatim reuse)`);

console.log('\n================ 5. FIVE DIVERGE (fr/bn/ms/de/id) — corrected, NOT equal to deficient morning-017 ================');
for (const l of DIVERGE5) ok(card['translation_' + l] !== morn['translation_' + l], `${l}: evening-017 DIVERGES from morning-017 (correction)`);
// fr: Qayyum + كله restored
ok(has(card.translation_fr, 'dont toute chose dépend') && has(card.translation_fr, 'en tout point') && !has(card.translation_fr, 'être imploré'), 'fr: Qayyum «dont toute chose dépend» + «en tout point»; NOT morning «être imploré»');
// bn: USER decision «সবকিছুর ধারক», NOT «সর্বকিছুর», NOT «চিরস্থায়ী»
ok(has(card.translation_bn, 'সবকিছুর ধারক') && !has(card.translation_bn, 'সর্বকিছুর') && !has(card.translation_bn, 'চিরস্থায়ী'), 'bn: USER «সবকিছুর ধারক» (NOT «সর্বকিছুর», NOT morning «চিরস্থায়ী»)');
// ms: USER decision keeps «Kekal memerintah»; ⑤ fixed (no «nasibku ditentukan»)
ok(has(card.translation_ms, 'Yang Kekal memerintah selama-lamanya') && has(card.translation_ms, 'serahkan aku kepada diriku sendiri') && !has(card.translation_ms, 'nasibku ditentukan'), 'ms: USER «Kekal memerintah» + ⑤ «serahkan aku kepada diriku sendiri» (NOT morning «nasibku ditentukan»)');
// de: ⑤ «mir selbst» restored (not garbled «eine meiner Angelegenheiten»)
ok(has(card.translation_de, 'überlasse mich nicht mir selbst') && !has(card.translation_de, 'eine meiner Angelegenheiten'), 'de: ⑤ «überlasse mich nicht mir selbst» (NOT morning garbled «eine meiner Angelegenheiten»)');
// id: ② «Maha Berdiri Sendiri» (not «Maha Terjaga»); ⑤ «wakilkan ... kepada diriku sendiri»
ok(has(card.translation_id, 'Maha Berdiri Sendiri') && !has(card.translation_id, 'Maha Terjaga') && has(card.translation_id, 'wakilkan aku kepada diriku sendiri'), 'id: ② «Maha Berdiri Sendiri» (NOT «Maha Terjaga») + ⑤ «wakilkan aku kepada diriku sendiri»');

console.log('\n================ 6. morning-017 UNTOUCHED (still deficient) + all 25 morning intact ================');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_fr, 'être imploré') && has(morn.translation_bn, 'চিরস্থায়ী') && has(morn.translation_de, 'eine meiner Angelegenheiten') && has(morn.translation_id, 'Maha Terjaga') && has(morn.translation_ms, 'nasibku ditentukan'), 'morning-017 still carries its 5 deficiencies (NOT retro-fixed — deferred)');

console.log('\n================ 7. Arabic + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text.startsWith('يَا حَيُّ يَا قَيُّومُ') && card.text.endsWith('طَرْفَةَ عَيْنٍ.'), 'Arabic opening «يا حي يا قيوم» + closing «طرفة عين.» intact');
ok(card.text.includes('يَا قَيُّومُ،'), 'evening-017 Arabic keeps its comma after «قَيُّومُ» (NOT replaced by morning-017 text)');
const b17 = dataSrc.slice(dataSrc.indexOf("id: 'evening-017'"), dataSrc.indexOf("id: 'evening-018'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b17), 'evening-017 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه الترمذي', 'source ref «رواه الترمذي» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة', 'repeat 1 «مرة واحدة» unchanged');
ok(card.virtue === null, 'virtue stays null (unchanged)');
ok(card.authenticity === 'hasan', "authenticity stays 'hasan' (unchanged)");

console.log('\n================ 8. Per-region counts — evening 23, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 9. Evening 001-023 translated; 024+ untranslated; prayer intact ================');
for (let n = 1; n <= 23; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(23).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 024+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 10. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b17, 'AZKAR-EVENING-DUA-CARD-17-TRANSLATIONS'), 'evening-017 block carries the ticket provenance comment');

console.log('\n================ 11. Cache-busters bumped (azkar-data.js?v=55 + sw v553; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=55\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=55');
ok(!/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'no stale ?v=54 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v553'/.test(swSrc), "sw.js CACHE_VERSION = 'v553'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
