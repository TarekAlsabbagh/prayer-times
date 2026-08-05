// Smoke — AZKAR-EVENING-DUA-CARD-09-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-009 = «اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ، أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.»
// (Abu Dawud, repeat 1 «مرة واحدة») gains the 9 static non-ar MEANING translations (EVENING form «أمسى»).
// EIGHT meanings each lang must keep: ① O Allah ② whatever blessing this EVENING ③ or to anyone of Your creation
// ④ from You ⑤ alone ⑥ no partner ⑦ all praise ⑧ all thanks. Sources: en=printed Evening Adhkar ref; fr=French Hisnul
// Muslim ch.27 (ce soir); ur=Urdu adhkar (شام کی); tr=Turkish Hisnul Muslim ch.27 (akşama çıkan); bn=Bengali Hisnul
// Muslim (বিকালে); ms=Malay Ma'thurat Sughra Doa 20 Petang; de=German Hisnu-l-Muslim ch.27 (an diesem Abend, CLEAN — no
// al-ḥamd transliteration); es=TRUSTED COMPOSITE (Spanish Hisnul Muslim body + documented «al anochecer»); id=Indonesian
// Hisnul Muslim (di sore ini). NO translation_ar; NO reference/repeat/source/sanad/virtue/transliteration/footnote inside
// the block; NO morning wording; renderers (server.js/app.js) untouched; morning-009 NOT touched.
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
const card = E.find(d => d.id === 'evening-009');
const morn = M.find(d => d.id === 'morning-009');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// Distinctive substrings for the 8 meanings, per language (from the approved final texts).
const MEAN = {
  en: ['O Allah', 'received in the evening', 'anyone from Your creation', 'from You Alone', 'You have no partner', 'all praise', 'all thanks'],
  fr: ['Ô Seigneur', 'ce soir', "l'une de Tes créatures", 'provient de Toi Seul', 'sans associé', 'la louange', 'la gratitude'],
  ur: ['اے اللہ', 'شام کی ہے', 'تیری مخلوق میں سے کسی', 'تیری طرف سے', 'تو اکیلا ہے', 'تیرا کوئی شریک نہیں', 'حمد', 'شکر'],
  tr: ['Allahım', 'akşama çıkan', 'kullarından birisinin', 'yalnızca sendendir', 'Senin ortağın yoktur', 'Hamd', 'Şükür'],
  bn: ['হে আল্লাহ', 'বিকালে উপনীত', 'আপনার সৃষ্টির অন্য কারও', 'আপনার নিকট থেকেই', 'কোনো শরীক নেই', 'সকল প্রশংসা', 'সকল কৃতজ্ঞতা'],
  ms: ['Ya Allah', 'pada petang ini', 'mana-mana makhluk-Mu', 'datang dari Engkau', 'Engkau sahaja', 'Tidak ada sekutu bagi-Mu', 'segala puji', 'segala kesyukuran'],
  de: ['O Allāh', 'an diesem Abend', 'Deinen Geschöpfen', 'von Dir allein', 'keinen Teilhaber', 'Lob', 'Dank'],
  es: ['Oh Allah', 'al anochecer', 'alguien de Tu creación', 'proviene de Ti', 'único', 'sin asociados', 'la alabanza', 'el agradecimiento'],
  id: ['Ya Allah', 'di sore ini', 'seseorang di antara makhluk-Mu', 'dari-Mu', 'tiada sekutu bagi-Mu', 'segala puji', 'panjatan syukur'],
};
// ③ «أو بأحد من خلقك» — must be present in EVERY lang
const M3 = { en:/anyone from Your creation/i, fr:/l'une de Tes créatures/i, ur:/تیری مخلوق میں سے کسی/, tr:/kullarından birisinin/i, bn:/আপনার সৃষ্টির অন্য কারও/, ms:/mana-mana makhluk-Mu/i, de:/Deinen Geschöpfen/, es:/alguien de Tu creación/i, id:/seseorang di antara makhluk-Mu/i };
// ⑥ «لا شريك لك» — must be present in EVERY lang
const M6 = { en:/no partner/i, fr:/sans associé/i, ur:/تیرا کوئی شریک نہیں/, tr:/Senin ortağın yoktur/i, bn:/কোনো শরীক নেই/, ms:/Tidak ada sekutu bagi-Mu/i, de:/keinen Teilhaber/, es:/sin asociados/i, id:/tiada sekutu bagi-Mu/i };
// ⑦ praise + ⑧ thanks present
const M7 = { en:/all praise/i, fr:/la louange/i, ur:/حمد/, tr:/Hamd/, bn:/সকল প্রশংসা/, ms:/segala puji/i, de:/Lob/, es:/la alabanza/i, id:/segala puji/i };
const M8 = { en:/all thanks/i, fr:/la gratitude/i, ur:/شکر/, tr:/Şükür/, bn:/সকল কৃতজ্ঞতা/, ms:/segala kesyukuran/i, de:/Dank/, es:/el agradecimiento/i, id:/panjatan syukur/i };
// evening word present / morning word ABSENT
const EVE  = { en:/in the evening/i, fr:/ce soir/i, ur:/شام کی/, tr:/akşama çıkan/i, bn:/বিকালে/, ms:/petang ini/i, de:/an diesem Abend/i, es:/al anochecer/i, id:/di sore ini/i };
const MORN = { en:/in the morning|\bmorning\b/i, fr:/ce matin|\bmatin\b/i, ur:/صبح کی/, tr:/sabaha çıkan|\bsabah\b/i, bn:/সকালে/, ms:/\bpagi\b/i, de:/diesem Morgen|\bMorgen\b/, es:/mañana|amanezco|al amanecer/i, id:/\bpagi\b/i };
// forbidden inside a translation value (NB: exclude tokens that legitimately appear — tr «sanadır», the divine name «Allah/Allāh»)
const REF = /رواه|أبو داود|Abu Dawud|Ebu Davud|Bukhari|Tirmidhi|صحيح|\bSahih\b|النسائي|An-Nasa|Ibn as-Sunni|أربع مرات|مرة واحدة|\bHisn\b|حصن المسلم|Fortaleza|Datenbank|5073|5075|4\/31[78]/i;
const VIRTUE = /من قالها|أدى شكر|شكر ليلته|night's thanks|offered his night|adı şükr|malamnya/i;
const TRANSLIT = /Allahumma|maa amsa|maa asbaha|min ni'mat|fa minka|wahdaka|la sharika|fa lakal|lakash|al-ḥamd|al-hamd/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-009 identity + all 9 translations, EIGHT meanings each ================');
ok(!!card && card.id === 'evening-009', 'AzkarEvening has evening-009');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 90, `evening-009 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL EIGHT meanings preserved`);
  ok(M3[l].test(t), `${l}: ③ «أو بأحد من خلقك» present`);
  ok(M6[l].test(t), `${l}: ⑥ «لا شريك لك» present`);
  ok(M7[l].test(t) && M8[l].test(t), `${l}: ⑦ praise + ⑧ thanks present`);
  ok(EVE[l].test(t), `${l}: EVENING wording present`);
  ok(!MORN[l].test(t), `${l}: NO morning wording`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. NO reference/repeat/source/virtue/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat/source/sanad token`);
for (const l of ALL9) ok(!VIRTUE.test(card['translation_' + l]), `${l}: virtue («shukr of his night») NOT leaked into the block`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. es TRUSTED COMPOSITE + ms Duaa.my Petang + de CLEAN (no al-ḥamd) ================');
ok(has(card.translation_es, 'al anochecer') && !/mañana|amanezco|al amanecer/i.test(card.translation_es), 'es: composite has «al anochecer», no morning «mañana/al amanecer»');
ok(has(card.translation_es, 'Toda la gracia') && has(card.translation_es, 'sin asociados'), 'es: La Fortaleza body («Toda la gracia» + «sin asociados») preserved');
ok(has(card.translation_ms, 'petang ini') && /apa sahaja/i.test(card.translation_ms) && /mana-mana/i.test(card.translation_ms), 'ms: Malay evening «petang ini» + Malay markers «apa sahaja»/«mana-mana» (not Indonesian)');
ok(!/al-ḥamd|al-hamd/i.test(card.translation_de) && has(card.translation_de, 'So gebühren Dir allein Lob und Dank'), 'de: CLEAN — no «al-ḥamd» transliteration; ends «So gebühren Dir allein Lob und Dank»');
ok(has(card.translation_tr, 'yalnızca sendendir') && has(card.translation_tr, 'Senin ortağın yoktur'), 'tr: keeps «yalnızca sendendir» + «Senin ortağın yoktur» (وحدك لا شريك لك)');

console.log('\n================ 4. NO translation_ar + Arabic text/source/repeat byte-identical + virtue Arabic-only ================');
ok(card.translation_ar === undefined, 'evening-009 object has NO translation_ar');
const b9 = dataSrc.slice(dataSrc.indexOf("id: 'evening-009'"), dataSrc.indexOf("id: 'evening-010'"));
ok(!/translation_ar\s*:/.test(b9), 'evening-009 source block declares NO translation_ar field');
ok(card.text.startsWith('اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ') && card.text.endsWith('فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.'),
  'Arabic text (EVENING «أمسى») opening + closing intact (byte-identical anchors)');
ok(card.text.includes('أَوْ بِأَحَدٍ مِنْ خَلْقِكَ') && card.text.includes('فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ'), 'Arabic distinctive interior phrases intact (or anyone of Your creation + alone no partner)');
ok(card.source && card.source.ref === 'رواه أبو داود', 'source ref «رواه أبو داود» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة' && card.repeatLabel.en === 'once', 'repeat 1 «مرة واحدة» / «once» unchanged');
ok(card.authenticity === 'hasan', "authenticity 'hasan' unchanged");
ok(card.virtue != null && card.virtue.en === null && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 10, 'virtue present, Arabic-only (virtue.en === null) — NOT translated');

console.log('\n================ 5. Per-region counts — evening 9, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Evening 001-009 translated; 010+ untranslated; morning + prayer intact; morning-009 UNCHANGED ================');
for (const id of ['evening-001','evening-002','evening-003','evening-004','evening-005','evening-006','evening-007','evening-008','evening-009']) {
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(23).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 024+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
// morning-009 (the twin) must be UNCHANGED — still MORNING form, still has its own wording
ok(has(morn.text, 'أَصْبَحَ') && !has(morn.text, 'أَمْسَى'), 'morning-009 Arabic still MORNING «أصبح» (twin untouched)');
ok(has(morn.translation_en, 'has been received') && has(morn.translation_de, 'an diesem Morgen'), 'morning-009 en/de still MORNING form (NOT retro-fixed)');
ok(has(morn.translation_id, '(dari seluruh makhluk-Mu)'), 'morning-009 id still keeps «(dari seluruh makhluk-Mu)» (evening dropped it; morning untouched)');

console.log('\n================ 7. Renderers (server.js / app.js) untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 8. Cache-busters bumped (azkar-data.js?v=55 + sw v553; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=55\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=55');
ok(!/js\/azkar-data\.js\?v=40\b/.test(htmlSrc), 'no stale ?v=40 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v553'/.test(swSrc), "sw.js CACHE_VERSION = 'v553'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
