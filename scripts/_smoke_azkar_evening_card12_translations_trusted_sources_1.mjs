// Smoke — AZKAR-EVENING-DUA-CARD-12-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-012 = «حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.» (Ibn al-Sunni, 7× «سبع مرات»,
// wording = Quran 9:129, first-person SINGULAR) gains the 9 static non-ar MEANING translations. TIME-NEUTRAL dua → all 9
// evening texts = morning-012 BYTE-IDENTICAL. FOUR meanings each lang must keep: ① «حسبي الله» SINGULAR (for me, NOT «for
// us»/«حسبنا» = the different 3:173 dua) ② «لا إله إلا هو» (tawhid) ③ «عليه توكلت» (trust) ④ «رب العرش العظيم» (throne+azim).
// The Quranic verse-opening «فإن تولوا فقل» is NOT included. NO translation_ar; NO reference/repeat/source/sanad/virtue/
// authenticity-note/transliteration/verse-number inside the block; renderers untouched; morning-012 untouched. evening-012
// Arabic (uses «إِلَٰهَ» + comma) stays byte-identical — NOT replaced with the morning-012 wording.
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
const card = E.find(d => d.id === 'evening-012');
const morn = M.find(d => d.id === 'morning-012');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// 4 meaning substrings per language (from the finalized texts)
const MEAN = {
  en: ['Sufficient for me', 'none has the right to be worshipped except Him', 'upon Him I rely', 'Lord of the exalted throne'],
  fr: ['me suffit', 'y a de divinité que Lui', 'je place ma confiance', 'Seigneur du Trône immense'],
  ur: ['میرے لیے اللہ کافی ہے', 'کوئی معبود برحق نہیں', 'بھروسہ', 'بڑے عرش کا مالک'],
  tr: ['Yeterli bana Allah', 'başka ibâdete lâyık hiçbir ilah yoktur', 'tevekkül ettim', 'yüce arş'],
  bn: ['আমার জন্য যথেষ্ট', 'কোনো হক্ব ইলাহ নেই', 'ভরসা', 'মহান আরশের রব্ব'],
  ms: ['Cukuplah Allah', 'tiada Tuhan yang berhak disembah melainkan Dia', 'bertawakkal', 'Arasy yang agung'],
  de: ['genügt mir', 'keinen wahren Ilāh', 'verlasse ich mich', 'gewaltigen Thrones'],
  es: ['me es suficiente', 'no hay divinidad excepto Él', 'en Él confío', 'Trono Magnífico'],
  id: ['Cukup bagiku Allah', 'tiada Tuhan (yang berhak disembah) kecuali Dia', 'bertawakkal', 'Arasy yang Agung'],
};
// singular pronoun marker («for me») per lang
const SING = { en: 'for me', fr: 'me suffit', ur: 'میرے لیے', tr: 'bana', bn: 'আমার জন্য', ms: 'bagiku', de: 'genügt mir', es: 'me es suficiente', id: 'bagiku' };
// throne + azim words (both must be present)
const THRONE = { en: 'throne', fr: 'Trône', ur: 'عرش', tr: 'arş', bn: 'আরশ', ms: 'Arasy', de: 'Thrones', es: 'Trono', id: 'Arasy' };
const AZIM   = { en: 'exalted', fr: 'immense', ur: 'بڑے', tr: 'yüce', bn: 'মহান', ms: 'agung', de: 'gewaltigen', es: 'Magnífico', id: 'Agung' };

// forbidden: plural «for us / حسبنا» form (the different 3:173 dua)
const PLURAL = /\bfor us\b|\bnous suffit\b|\bbize\b|bagi kami|ہمیں|আমাদের|nos basta|nos es suficiente|genügt uns|حسبنا/i;
// forbidden: the Quranic verse-opening «فإن تولوا فقل» / its translations, or surrounding context
const OPENING = /فإن تولوا|turn away|se détournent|yüz çevir|berpaling|ফিরিয়ে|abkehren|se apartan|منہ پھیر/i;
// forbidden: references / repeat labels / sources / verse number
const REF = /رواه|ابن السني|Ibn al-?Sunni|Abu Daw|\bHisn\b|حصن المسلم|سبع مرات|seven times|9\s*:\s*129|At-?Tawbah|Tawbah|٩\s*:\s*١٢٩/i;
// forbidden: romanized Arabic transliteration of THIS dua (full phrases; single glosses Rabb/Ilāh/Allāh are allowed)
const TRANSLIT = /Hasbiya|Hasbi Allah|la ilaha illa Hu|aleyhi tevekkeltu|alayhi tawakkalt|rabbul arsh|arshil azim/i;
// forbidden: the Arabic virtue / authenticity-note text leaking into a translation
const VIRTUE_LEAK = /كفاه الله|أهل العلم|الدنيا والآخرة|إسناد/;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-012 identity + all 9 translations, FOUR meanings + SINGULAR + throne&azim ================');
ok(!!card && card.id === 'evening-012', 'AzkarEvening has evening-012');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `evening-012 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL FOUR meanings preserved`);
  ok(has(t, SING[l]), `${l}: ① «حسبي الله» SINGULAR marker present (for me)`);
  ok(has(t, THRONE[l]) && has(t, AZIM[l]), `${l}: ④ «العرش»(throne) + «العظيم»(azim) BOTH present`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. SINGULAR only (no plural «for us»/«حسبنا») + NO verse-opening «فإن تولوا فقل» ================');
for (const l of ALL9) ok(!PLURAL.test(card['translation_' + l]), `${l}: no plural «for us / حسبنا» (not the 3:173 dua)`);
for (const l of ALL9) ok(!OPENING.test(card['translation_' + l]), `${l}: no verse-opening «فإن تولوا فقل» / surrounding context`);

console.log('\n================ 3. NO reference/repeat/source/verse-number/virtue/note/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat-label/source/verse-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
for (const l of ALL9) ok(!VIRTUE_LEAK.test(card['translation_' + l]), `${l}: no virtue/authenticity-note text leaked in`);

console.log('\n================ 4. Time-neutral reuse: all 9 evening-012 == morning-012 byte-identical ================');
for (const l of ALL9) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-012 == morning-012 byte-identical (time-neutral reuse)`);
ok(has(card.translation_ms, '(sebagai pelindung') && has(card.translation_id, '(sebagai pelindung'), 'ms + id keep the published «(sebagai pelindung)» gloss (accepted)');
ok(has(card.translation_de, '(Anbetungswürdigen)') && has(card.translation_de, '(Herr)'), 'de keeps the published «(Anbetungswürdigen)/(Herr)» glosses (accepted)');

console.log('\n================ 5. NO translation_ar + Arabic/source/repeat/virtue/note/authenticity unchanged ================');
ok(card.translation_ar === undefined, 'evening-012 object has NO translation_ar');
const b12 = dataSrc.slice(dataSrc.indexOf("id: 'evening-012'"), dataSrc.indexOf("id: 'evening-013'"));
ok(!/translation_ar\s*:/.test(b12), 'evening-012 source block declares NO translation_ar field');
ok(card.text.startsWith('حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ') && card.text.endsWith('رَبُّ الْعَرْشِ الْعَظِيمِ.'),
  'Arabic text opening «حسبي الله لا إلٰه إلا هو» + closing «رب العرش العظيم.» intact (byte-identical anchors)');
ok(has(card.text, 'لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ'), 'Arabic keeps evening form «إِلَٰهَ» (dagger-alef) + comma (NOT the morning-012 wording)');
ok(card.text !== morn.text, 'evening-012 Arabic is NOT identical to morning-012 Arabic (diacritics/comma differ) — evening kept as-is');
ok(card.source && card.source.ref === 'رواه ابن السني', 'source ref «رواه ابن السني» unchanged');
ok(card.repeat === 7 && card.repeatLabel && card.repeatLabel.ar === 'سبع مرات', 'repeat 7 «سبع مرات» unchanged');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 0 && card.virtue.en == null, 'virtue stays Arabic-only (en=null, NOT translated)');
ok(card.authenticity === null, 'authenticity stays null (unchanged)');
ok(card.authenticityNote && typeof card.authenticityNote.ar === 'string' && card.authenticityNote.en == null, 'authenticityNote stays Arabic-only (en=null, NOT translated)');

console.log('\n================ 6. Per-region counts — evening 12, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 20, `evening region translation_${l}: EXACTLY 20 (001-004 Quran + 005-020 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 7. Evening 001-020 translated; 021+ untranslated; morning + prayer intact; morning-012 UNCHANGED ================');
for (let n = 1; n <= 20; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(20).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 021+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_en, 'Allah is Sufficient for me') && morn.text.includes('لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ'), 'morning-012 still intact (plain «إِلَهَ», no comma — NOT touched)');

console.log('\n================ 8. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b12, 'AZKAR-EVENING-DUA-CARD-12-TRANSLATIONS'), 'evening-012 block carries the ticket provenance comment');

console.log('\n================ 9. Cache-busters bumped (azkar-data.js?v=52 + sw v550; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=52\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=52');
ok(!/js\/azkar-data\.js\?v=51\b/.test(htmlSrc), 'no stale ?v=43 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v550'/.test(swSrc), "sw.js CACHE_VERSION = 'v550'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
