// Smoke — AZKAR-MORNING-DUA-CARD-22-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-022 («سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.», Muslim 2726 /
// حديث جويرية, repeat 3 «ثلاث مرات», virtue null, authenticity 'sahih') gains ALL 9 static translations — the FULL 4-measures
// form, meaning only. CRITICAL: this is NOT the Card-21 short «سبحان الله وبحمده»; every language MUST preserve the FOUR
// measures: ① عدد خلقه (number of His creation) ② رضا نفسه (His pleasure) ③ زنة عرشه (weight of His Throne) ④ مداد كلماته
// (ink of His words). No Juwayriyah story, repeat label, reference, isnad, virtue, transliteration, footnotes, or explanation
// inside the block. Sources: en=HisnMuslim ch.27 #94; fr=Hisnii; ur=IslamHouse 827527 (DOM); tr=İlme Davet #94; bn=HisnMuslim
// #94-(20); ms=AkuIslam #16 (full form, NOT #14=Card21); de=printed German edition #94-20 (German meaning, NOT translit);
// es=HisnMuslim; id=HisnMuslim. bn stripped gloss «(অগণিত অসংখ্য)»; id stripped leading «.». HadeethEnc NOT used.
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
const M = sandbox.window.AzkarMorning;
const card22 = M[21];
const card21 = M[20];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words.",
  fr: "Gloire, pureté et louange à Allah, autant que le nombre de Ses créatures, autant de fois qu'il le faut pour Le satisfaire, d'un nombre égal au poids de Son Trône et au nombre indéterminé de Ses paroles.",
  ur: "اللہ پاک ہے اور اپنی تعریف کے ساتھ ہے، اپنی مخلوق کی گنتی کے برابر، اپنے نفس کی رضامندی کے برابر، اپنے عرش کے وزن کے برابر، اور اپنے کلمات کی روشنائی کے برابر۔",
  tr: "Yarattıklarının sayısınca, kendisinin râzı olacağı kadar, arşının ağırlığı ve kelimelerinin çokluğunca hamdederek Allah'ı tüm noksanlıklardan tenzih ederim.",
  bn: "আমি আল্লাহর প্রশংসাসহ পবিত্রতা ও মহিমা ঘোষণা করছি— তাঁর সৃষ্ট বস্তুসমূহের সংখ্যার সমান, তাঁর নিজের সন্তোষের সমান, তাঁর আরশের ওজনের সমান ও তাঁর বাণীসমূহ লেখার কালি পরিমাণ।",
  ms: "Mahasuci Allah, aku memuji-Nya sebanyak makhluk-Nya, sejauh kerelaan-Nya, seberat timbangan Arsy-Nya, dan sebanyak tinta tulisan kalimat-Nya.",
  de: "Gepriesen sei Allah und Lob sei Ihm gemäß der Anzahl Seiner Geschöpfe und Seines Wohlgefallens und mit dem Gewicht Seines Thrones und der Tinte Seiner Worte.",
  es: "Glorificado sea Allah y alabado sea por el número de cuanto ha creado, por su Complacencia, por el peso de Su Trono y por la tinta de sus palabras.",
  id: "Maha Suci Allah, aku memuji-Nya sebanyak makhluk-Nya, sejauh kerelaan-Nya, seberat timbangan 'Arasy-Nya dan sebanyak tinta tulisan kalimat-Nya.",
};
// FOUR measures per language: [عدد خلقه, رضا نفسه, زنة عرشه, مداد كلماته]
const FOUR = {
  en: ["number of His creation", "His pleasure", "weight of His throne", "ink of His words"],
  fr: ["nombre de Ses créatures", "satisfaire", "poids de Son Trône", "Ses paroles"],
  ur: ["مخلوق کی گنتی", "نفس کی رضامندی", "عرش کے وزن", "کلمات کی روشنائی"],
  tr: ["sayısınca", "râzı olacağı", "arşının ağırlığı", "kelimelerinin çokluğunca"],
  bn: ["সৃষ্ট বস্তুসমূহের সংখ্যার", "সন্তোষের সমান", "আরশের ওজনের", "কালি পরিমাণ"],
  ms: ["sebanyak makhluk-Nya", "kerelaan-Nya", "timbangan Arsy-Nya", "tinta tulisan kalimat-Nya"],
  de: ["Anzahl Seiner Geschöpfe", "Wohlgefallens", "Gewicht Seines Thrones", "Tinte Seiner Worte"],
  es: ["número de cuanto ha creado", "Complacencia", "peso de Su Trono", "tinta de sus palabras"],
  id: ["sebanyak makhluk-Nya", "kerelaan-Nya", "timbangan 'Arasy-Nya", "tinta tulisan kalimat-Nya"],
};
const STORY = /جويرية|Juwayriyah|Juwairiyah|Djuwayriya/i;
const TRANSLIT = /Subh[aä]na|wa bihamdihi|adada khalqihi|Bihamdihi/i;

console.log('================ 1. Card 22 = morning-022 — ALL 9 full 4-measures translations ================');
ok(card22 && card22.id === 'morning-022', "AzkarMorning[21].id === 'morning-022'");
ok(card22.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card22['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `Card 22 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 22 ${l}: EXACTLY matches approved source string`);
  ok(FOUR[l].every((x) => N(t).includes(N(x))), `Card 22 ${l}: ALL FOUR measures preserved`);
  ok(!/[\p{Nd}]/u.test(t), `Card 22 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 22 ${l}: no footnote digit-brackets, no soft hyphen`);
}

console.log('\n================ 2. DISTINCT from Card 21 (NOT the short «سبحان الله وبحمده» form) ================');
for (const l of ALL9) {
  ok(card22['translation_' + l] !== card21['translation_' + l], `${l}: Card 22 text ≠ Card 21 text`);
  ok(card22['translation_' + l].length > card21['translation_' + l].length, `${l}: Card 22 longer than Card 21 (has the 4 measures)`);
}

console.log('\n================ 3. NO Juwayriyah story / transliteration / longer-extra inside block ================');
for (const l of ALL9) ok(!STORY.test(card22['translation_' + l]), `${l}: NO Juwayriyah story token`);
for (const l of ALL9) ok(!TRANSLIT.test(card22['translation_' + l]), `${l}: NO transliteration`);
ok(!card22.translation_bn.includes('অগণিত') && !card22.translation_bn.includes('অসংখ্য'), 'bn: gloss «(অগণিত অসংখ্য)» stripped');
ok(!card22.translation_id.startsWith('.') && !/Agung/.test(card22.translation_id), 'id: no leading dot, no Agung');
ok(!/العظيم|الْعَظِيم/.test(card22.translation_ar || '') , 'no «العظيم» spurious');
for (const l of ALL9) ok(!/رواه|Muslim|مسلم|Bukhari|ثلاث مرات|three times|3 kali|3 veces|dreimal|তিন বার|تین مرتبہ|رقاب/.test(card22['translation_' + l]), `${l}: no reference/repeat token inside block`);

console.log('\n================ 4. NO ar + Arabic/source/repeat/authenticity + virtue null ================');
ok(card22.translation_ar === undefined, 'Card 22 has NO translation_ar');
const b22 = dataSrc.slice(dataSrc.indexOf("id: 'morning-022'"), dataSrc.indexOf("id: 'morning-023'"));
ok(!/translation_ar\s*:/.test(b22), 'morning-022 source block declares NO translation_ar');
ok(b22.includes("text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.'"), 'Card 22 Arabic text byte-identical (4-measures form)');
ok(b22.includes("source: { ref: 'رواه مسلم', sourceUrl: null }"), "Card 22 source stays «رواه مسلم»");
ok(b22.includes('repeat: 3,') && b22.includes("repeatLabel: { ar: 'ثلاث مرات', en: 'three times' }"), "Card 22 repeat stays 3 («ثلاث مرات»)");
ok(b22.includes("authenticity: 'sahih'") && /virtue:\s*null/.test(b22), "Card 22 authenticity 'sahih' + virtue null");

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 25; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-21 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 21; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(card21.translation_en === 'How perfect Allah is and I praise Him.', 'Card 21 en is the SHORT tasbih (exact)');
ok(card22.translation_en.startsWith('How perfect Allah is and I praise Him by the number'), 'Card 22 en is the FULL 4-measures form');
ok(M[19].translation_en.startsWith('None has the right to be worshipped'), 'Card 20 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l} still EXACTLY 23`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation / source URLs (HadeethEnc not used) ================');
ok(!/sunnah\.com|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamicurdubooks\.com|ilmedavetdernegi\.org|way-to-allah\.com|akuislam\.com|muslim\.or\.id|archive\.org|hisnii\.com/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hadeethenc\.com/i.test(dataSrc), 'HadeethEnc NOT referenced');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=55/.test(htmlSrc), 'index.html azkar-data.js?v=55 (Card 22 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v553'/.test(swSrc), "sw.js CACHE_VERSION 'v553'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
