// Smoke — AZKAR-EVENING-DUA-CARD-10-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-010 = «اللَّهُمَّ عَافِنِي فِي بَدَنِي… لَا إِلَٰهَ إِلَّا أَنْتَ، … أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ… عَذَابِ الْقَبْرِ، لَا إِلَٰهَ إِلَّا أَنْتَ.»
// (Ahmad, repeat 3 «ثلاث مرات») gains the 9 static non-ar MEANING translations. This dua is TIME-NEUTRAL (no «أصبح/أمسى»),
// said morning AND evening with one text ⇒ the evening translations are the already-approved morning-010, BYTE-IDENTICAL
// (no time-word swap, no composite). EIGHT meanings each lang must keep: ① grant health in body ② hearing ③ sight
// ④ «لا إله إلا أنت» (first) ⑤ refuge from disbelief(kufr) ⑥ poverty ⑦ refuge from punishment of the grave
// ⑧ «لا إله إلا أنت» (final). «عافني»=grant health/wellbeing (not merely heal); «الكفر»=disbelief (not ingratitude).
// Sources: en=Hisn 85; fr=Turjman Islam; ur=IslamHouse; tr=Kuran'la Şifa; bn/es/id=HisnMuslim; ms=e-JAUHAR (MOE Malaysia);
// de=Islamische Datenbank. id keeps the published bracketed clarifications «(dari penyakit…)». NO translation_ar; NO
// reference/repeat/source/sanad/virtue/transliteration/footnote inside the block; renderers untouched; morning-010 untouched.
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
const countOf = (t, x) => N(t).split(N(x)).length - 1;   // substring count (no regex escaping)

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const E = sandbox.window.AzkarEvening;
const M = sandbox.window.AzkarMorning;
const P = sandbox.window.AzkarPrayer;
const card = E.find(d => d.id === 'evening-010');
const morn = M.find(d => d.id === 'morning-010');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// 8 meaning substrings per language (from the approved texts)
const MEAN = {
  en: ['O Allah', 'grant my body health', 'grant my hearing health', 'grant my sight health', 'None has the right to be worshipped except You', 'disbelief', 'poverty', 'punishment of the grave'],
  fr: ['Ô Allah', 'Préserve-moi dans mon corps', 'dans mon ouïe', 'dans ma vue', 'Nulle divinité ne mérite', 'mécréance', 'pauvreté', 'supplice de la tombe'],
  ur: ['اے اللہ', 'جسم میں عافیت', 'کانوں میں عافیت', 'آنکھوں میں عافیت', 'تیرے علاوہ کوئی عبادت کے لائق نہیں', 'کفر', 'فقر', 'عذاب قبر'],
  tr: ['Bedenime afiyet', 'Kulağıma afiyet', 'Gözüme afiyet', 'Senden başka ilah yok', 'Küfürden', 'fakirlikten', 'Kabir azab'],
  bn: ['হে আল্লাহ', 'শরীরে', 'শ্রবণশক্তিতে', 'দৃষ্টিশক্তিতে', 'হক্ব ইলাহ নেই', 'কুফুরী', 'দারিদ্র্য', 'কবরের আযাব'],
  ms: ['Ya Allah', 'kesihatan pada badanku', 'kesihatan pada pendengaranku', 'kesihatan pada penglihatanku', 'tiada Tuhan yang berhak disembah melainkan Engkau', 'kekufuran', 'kefakiran', 'azab kubur'],
  de: ['Heil in meinem Körper', 'Heil in meinem Gehör', 'Heil in meinem Sehen', 'keinen wahren Ilāh', 'Kufr', 'Armut', 'Strafe im Grab'],
  es: ['Oh Allah', 'salud a mi cuerpo', 'salud a mis oídos', 'salud a mi vista', 'no hay dios sino Tú', 'incredulidad', 'pobreza', 'tormento de la tumba'],
  id: ['Ya Allah', 'selamatkan tubuh-ku', 'selamatkan pendengaranku', 'selamatkan penglihatanku', 'tiada Tuhan (yang berhak disembah) kecuali Engkau', 'kekufuran', 'kefakiran', 'siksa kubur'],
};
// «لا إله إلا أنت» must appear EXACTLY TWICE (first + final)
const SHAHADA = { en:'None has the right to be worshipped except You', fr:'Nulle divinité ne mérite', ur:'تیرے علاوہ کوئی عبادت کے لائق نہیں', tr:'Senden başka ilah yok', bn:'হক্ব ইলাহ নেই', ms:'tiada Tuhan yang berhak disembah melainkan Engkau', de:'keinen wahren Ilāh', es:'no hay dios sino Tú', id:'tiada Tuhan (yang berhak disembah) kecuali Engkau' };
// explicit: kufr(disbelief) + poverty + punishment of the grave
const KUFR    = { en:'disbelief', fr:'mécréance', ur:'کفر', tr:'Küfür', bn:'কুফুরী', ms:'kekufuran', de:'Kufr', es:'incredulidad', id:'kekufuran' };
const POVERTY = { en:'poverty', fr:'pauvreté', ur:'فقر', tr:'fakirlik', bn:'দারিদ্র্য', ms:'kefakiran', de:'Armut', es:'pobreza', id:'kefakiran' };
const GRAVE   = { en:'punishment of the grave', fr:'supplice de la tombe', ur:'عذاب قبر', tr:'Kabir azab', bn:'কবরের আযাব', ms:'azab kubur', de:'Strafe im Grab', es:'tormento de la tumba', id:'siksa kubur' };
// forbidden inside a translation value (repeat labels / references). NB: exclude published words (Ilāh/Allāh/afiyet/ilah)
const REF = /رواه|أحمد|\bAhmad\b|Abu Dawud|Ebu Davud|\bHisn\b|حصن المسلم|ثلاث مرات|three times|Trois fois|Tiga kali|dreimal|3 veces|تین مرتبہ|তিন বার|৩ বার|An-Nasa|Ibn as-Sunni|Ibn Hibban|4\/324|5090/i;
const TRANSLIT = /Allahumma|aafini|aafinee|min al-kufr|wal-faqr|azab al-qabr|la ilaha illa anta/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-010 identity + all 9 translations, EIGHT meanings + shahada TWICE ================');
ok(!!card && card.id === 'evening-010', 'AzkarEvening has evening-010');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 90, `evening-010 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL EIGHT meanings preserved`);
  ok(countOf(t, SHAHADA[l]) === 2, `${l}: «لا إله إلا أنت» appears EXACTLY twice (first + final)`);
  ok(has(t, KUFR[l]), `${l}: ⑤ «الكفر» = disbelief/kufr present (not ingratitude)`);
  ok(has(t, POVERTY[l]), `${l}: ⑥ «الفقر» = poverty present`);
  ok(has(t, GRAVE[l]), `${l}: ⑦ «عذاب القبر» = punishment of the grave present`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. NO reference/repeat/source/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat-label/source token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. Time-neutral reuse: evening-010 == morning-010 byte-identical; id keeps published brackets ================');
for (const l of ALL9) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-010 == morning-010 byte-identical (time-neutral reuse)`);
ok(has(card.translation_id, '(dari penyakit'), 'id: keeps the published bracketed clarification «(dari penyakit…)» (accepted)');

console.log('\n================ 4. NO translation_ar + Arabic text/source/repeat/virtue unchanged ================');
ok(card.translation_ar === undefined, 'evening-010 object has NO translation_ar');
const b10 = dataSrc.slice(dataSrc.indexOf("id: 'evening-010'"), dataSrc.indexOf("id: 'evening-011'"));
ok(!/translation_ar\s*:/.test(b10), 'evening-010 source block declares NO translation_ar field');
ok(card.text.startsWith('اللَّهُمَّ عَافِنِي فِي بَدَنِي') && card.text.endsWith('لَا إِلَٰهَ إِلَّا أَنْتَ.'),
  'Arabic text opening «عافني في بدني» + closing «لا إله إلا أنت.» intact (byte-identical anchors)');
ok(countOf(card.text, 'لَا إِلَٰهَ إِلَّا أَنْتَ') === 2, 'Arabic «لا إله إلا أنت» appears TWICE');
ok(card.text.includes('أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ') && card.text.includes('عَذَابِ الْقَبْرِ'), 'Arabic interior (kufr+faqr + grave) intact');
ok(card.source && card.source.ref === 'رواه أحمد', 'source ref «رواه أحمد» unchanged');
ok(card.repeat === 3 && card.repeatLabel && card.repeatLabel.ar === 'ثلاث مرات' && card.repeatLabel.en === 'three times', 'repeat 3 «ثلاث مرات» / «three times» unchanged');
ok(card.virtue == null, 'virtue is null (unchanged — nothing to translate)');
ok(card.authenticity === 'sahih', "authenticity 'sahih' unchanged");

console.log('\n================ 5. Per-region counts — evening 10, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 16, `evening region translation_${l}: EXACTLY 16 (001-004 Quran + 005-016 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Evening 001-010 translated; 011+ untranslated; morning + prayer intact; morning-010 UNCHANGED ================');
for (let n = 1; n <= 10; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(16).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 017+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_en, 'grant my body health') && morn.translation_id.includes('(dari penyakit'), 'morning-010 still intact (NOT touched)');

console.log('\n================ 7. Renderers (server.js / app.js) untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 8. Cache-busters bumped (azkar-data.js?v=48 + sw v546; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=48\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=48');
ok(!/js\/azkar-data\.js\?v=47\b/.test(htmlSrc), 'no stale ?v=43 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v546'/.test(swSrc), "sw.js CACHE_VERSION = 'v546'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
