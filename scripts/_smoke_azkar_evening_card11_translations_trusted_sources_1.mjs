// Smoke — AZKAR-EVENING-DUA-CARD-11-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-011 = «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ… وَالْعَجْزِ وَالْكَسَلِ… وَالْجُبْنِ وَالْبُخْلِ…
// غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.» (Abu Dawud, repeat «مرة واحدة») gains the 9 static non-ar MEANING translations.
// TIME-NEUTRAL dua (no «أصبح/أمسى») ⇒ 7 langs (en/fr/tr/bn/de/es/id) reuse morning-011 BYTE-IDENTICAL; ur + ms DIVERGE:
// ur uses the Sunan Abi Dawud 1555 rendering «غم اور حزن» (NOT morning «حزن و ملال»); ms is a Malaysia-only trusted
// composite whose al-jubn is «sifat pengecut» (NOT morning «perasaan takut»). NINE meanings each lang must keep:
// ① refuge in Allah ② al-hamm=worry/anxiety (not mere sadness) ③ al-hazan=grief ④ al-'ajz=incapacity (not laziness)
// ⑤ al-kasal=laziness ⑥ al-jubn=cowardice ⑦ al-bukhl=miserliness ⑧ ghalabat al-dayn=burden of debt ⑨ qahr al-rijal=
// being overpowered by men. NO translation_ar; NO reference/repeat/source/sanad/virtue/transliteration/footnote inside
// the block; renderers untouched; morning-011 NOT touched.
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
const card = E.find(d => d.id === 'evening-011');
const morn = M.find(d => d.id === 'morning-011');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
// 7 langs reuse morning-011 byte-identical; ur + ms diverge (user-approved)
const REUSE = ['en', 'fr', 'tr', 'bn', 'de', 'es', 'id'];
const DIVERGE = ['ur', 'ms'];

// 9 meaning substrings per language (from the finalized texts)
const MEAN = {
  en: ['O Allah', 'I take refuge in You', 'anxiety', 'sorrow', 'weakness', 'laziness', 'cowardice', 'miserliness', 'burden of debts', 'over powered by men'],
  fr: ['Je me mets sous Ta protection', 'les soucis', 'la tristesse', 'incapacité', 'la paresse', 'lâcheté', 'avarice', 'poids de la dette', 'domination des hommes'],
  ur: ['اے اللہ', 'تیری پناہ مانگتا ہوں', 'غم', 'حزن', 'عاجزی', 'سستی', 'بزدلی', 'کنجوسی', 'قرض کے غلبہ', 'لوگوں کے تسلط'],
  tr: ['Allahım', 'sana sığınırım', 'Keder', 'hüzün', 'acizlik', 'tembellik', 'korkaklık', 'cimrilik', 'borcun belimi bükmesi', 'insanların bana galip gelmesi'],
  bn: ['হে আল্লাহ', 'আশ্রয় নিচ্ছি', 'দুশ্চিন্তা', 'দুঃখ', 'অপারগতা', 'অলসতা', 'ভীরুতা', 'কৃপণতা', 'ঋণের ভার', 'মানুষদের দমন-পীড়ন'],
  ms: ['Ya Allah', 'aku berlindung denganMu', 'kesusahan', 'kedukaan', 'kelemahan', 'kemalasan', 'sifat pengecut', 'kedekut', 'desakan berhutang', 'paksaan orang'],
  de: ['ich nehme Zuflucht bei Dir', 'Sorge', 'Trauer', 'Unfähigkeit', 'Trägheit', 'Feigheit', 'Geiz', 'Last der Schulden', 'von Männern unterdrückt zu werden'],
  es: ['me refugio en Ti', 'preocupaciones', 'tristezas', 'debilidad', 'vagancia', 'cobardía', 'avaricia', 'peso de las deudas', 'dominado por los hombres'],
  id: ['aku berlindung kepada-Mu', 'keluh kesah', 'rasa sedih', 'kelemahan', 'kemalasan', 'penakut', 'sifat bakhil', 'cengkraman utang', 'menindas'],
};
// al-hamm rendering must carry worry/anxiety (present) and al-'ajz must be distinct from al-kasal (present)
const HAMM = { en: 'anxiety', fr: 'les soucis', ur: 'غم', tr: 'Keder', bn: 'দুশ্চিন্তা', ms: 'kesusahan', de: 'Sorge', es: 'preocupaciones', id: 'keluh kesah' };
const AJZ  = { en: 'weakness', fr: 'incapacité', ur: 'عاجزی', tr: 'acizlik', bn: 'অপারগতা', ms: 'kelemahan', de: 'Unfähigkeit', es: 'debilidad', id: 'kelemahan' };
const DAYN = { en: 'burden of debts', fr: 'poids de la dette', ur: 'قرض کے غلبہ', tr: 'borcun belimi bükmesi', bn: 'ঋণের ভার', ms: 'desakan berhutang', de: 'Last der Schulden', es: 'peso de las deudas', id: 'cengkraman utang' };
const RIJAL = { en: 'over powered by men', fr: 'domination des hommes', ur: 'لوگوں کے تسلط', tr: 'insanların bana galip gelmesi', bn: 'মানুষদের দমন-পীড়ন', ms: 'paksaan orang', de: 'von Männern unterdrückt zu werden', es: 'dominado por los hombres', id: 'menindas' };

// forbidden inside a translation value: references / repeat labels / hadith sources
const REF = /رواه|أبو داو|أبو داؤد|Abu Daw|Ebû Dâvûd|Ebu Davud|\bBukhari\b|\bBukhâri\b|Buchari|\bHisn\b|حصن المسلم|مرة واحدة|\bonce\b|une fois|einmal|una vez|sekali|ایک بار|একবার/i;
// forbidden: romanized Arabic transliteration of THIS dua
const TRANSLIT = /Allahumma|a'?udhu\s+bika|al-hamm|al-hazan|al-'?ajz|al-kasal|al-jubn|al-bukhl|ghalabat\s+al|qahr\s+al-rijal/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-011 identity + all 9 translations, NINE meanings each ================');
ok(!!card && card.id === 'evening-011', 'AzkarEvening has evening-011');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 70, `evening-011 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL NINE meanings preserved`);
  ok(has(t, HAMM[l]), `${l}: ② al-hamm = worry/anxiety present (not mere sadness)`);
  ok(has(t, AJZ[l]), `${l}: ④ al-'ajz = incapacity present (distinct from laziness)`);
  ok(has(t, DAYN[l]), `${l}: ⑧ ghalabat al-dayn = burden of debt present (explicit)`);
  ok(has(t, RIJAL[l]), `${l}: ⑨ qahr al-rijal = overpowered by men present (explicit)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. NO reference/repeat/source/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat-label/source token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. ur decision: «غم اور حزن», NOT «ملال» ================');
ok(has(card.translation_ur, 'غم اور حزن'), 'ur uses the approved «غم اور حزن»');
ok(!has(card.translation_ur, 'ملال'), 'ur does NOT use the rejected «ملال»');
ok(has(card.translation_ur, 'قرض کے غلبہ') && has(card.translation_ur, 'لوگوں کے تسلط'), 'ur keeps غلبة الدين + قهر الرجال explicitly');

console.log('\n================ 4. tr decision: «keder ve hüzün» ================');
ok(has(card.translation_tr, 'Keder ve hüzün'), 'tr uses the approved «keder ve hüzün» (trusted Turkish source)');
ok(has(card.translation_tr, 'acizlik') && has(card.translation_tr, 'borcun belimi bükmesi'), 'tr keeps al-ajz + burden-of-debt explicitly');

console.log('\n================ 5. ms composite: «sifat pengecut», NOT «perasaan takut» ================');
ok(has(card.translation_ms, 'sifat pengecut'), 'ms uses the composite-corrected «sifat pengecut» (cowardice)');
ok(!has(card.translation_ms, 'perasaan takut') && !has(card.translation_ms, 'perasaaan takut'), 'ms does NOT use the rejected «perasaan takut» (generic fear)');
ok(has(card.translation_ms, 'kesusahan') && has(card.translation_ms, 'desakan berhutang'), 'ms keeps al-hamm(kesusahan) + burden-of-debt');

console.log('\n================ 6. Time-neutral reuse: 7 langs == morning-011 byte-identical; ur+ms DIVERGE ================');
for (const l of REUSE) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-011 == morning-011 byte-identical (time-neutral reuse)`);
for (const l of DIVERGE) ok(card['translation_' + l] !== morn['translation_' + l], `${l}: evening-011 DIVERGES from morning-011 (user-approved fix)`);

console.log('\n================ 7. NO translation_ar + Arabic text/source/repeat/virtue unchanged ================');
ok(card.translation_ar === undefined, 'evening-011 object has NO translation_ar');
const b11 = dataSrc.slice(dataSrc.indexOf("id: 'evening-011'"), dataSrc.indexOf("id: 'evening-012'"));
ok(!/translation_ar\s*:/.test(b11), 'evening-011 source block declares NO translation_ar field');
ok(card.text.startsWith('اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ') && card.text.endsWith('وَقَهْرِ الرِّجَالِ.'),
  'Arabic text opening «الهم والحزن» + closing «وقهر الرجال.» intact (byte-identical anchors)');
ok(has(card.text, 'الْعَجْزِ وَالْكَسَلِ') && has(card.text, 'الْجُبْنِ وَالْبُخْلِ') && has(card.text, 'غَلَبَةِ الدَّيْنِ'), 'Arabic interior (ajz+kasal / jubn+bukhl / ghalabat al-dayn) intact');
ok(card.source && card.source.ref === 'رواه أبو داود', 'source ref «رواه أبو داود» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة', 'repeat 1 «مرة واحدة» unchanged');
ok(card.virtue == null, 'virtue is null (unchanged — nothing to translate)');
ok(card.authenticity === 'sahih', "authenticity 'sahih' unchanged");

console.log('\n================ 8. Per-region counts — evening 11, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 9. Evening 001-011 translated; 012+ untranslated; morning + prayer intact; morning-011 UNCHANGED ================');
for (let n = 1; n <= 11; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(23).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 024+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(has(morn.translation_ur, 'ملال') && has(morn.translation_ms, 'perasaaan takut'), 'morning-011 NOT touched (still «ملال» / «perasaaan takut»)');

console.log('\n================ 10. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b11, 'AZKAR-EVENING-DUA-CARD-11-TRANSLATIONS'), 'evening-011 block carries the ticket provenance comment (ms composite documented)');

console.log('\n================ 11. Cache-busters bumped (azkar-data.js?v=55 + sw v553; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=55\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=55');
ok(!/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'no stale ?v=54 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v553'/.test(swSrc), "sw.js CACHE_VERSION = 'v553'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
