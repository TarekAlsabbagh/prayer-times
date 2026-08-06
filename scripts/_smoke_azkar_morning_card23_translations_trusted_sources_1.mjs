// Smoke — AZKAR-MORNING-DUA-CARD-23-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-023 («اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.», Ibn Majah 925, repeat 1
// «مرة واحدة», virtue null, authenticity null) gains ALL 9 static translations — meaning only. Preserve the THREE requests:
// ① عِلْمًا نَافِعًا (beneficial knowledge) ② رِزْقًا طَيِّبًا (good/lawful/pure provision — NOT money-only) ③ عَمَلًا مُتَقَبَّلًا
// (accepted deeds). No repeat label, reference (Ibn Majah), after-Fajr context, isnad, transliteration, footnotes, or
// explanation inside the block. Sources: en=HisnMuslim #95; fr=Hisnii (keeps published «[de m'accorder]»); ur=IslamHouse
// 827527 (DOM); tr=İlme Davet #95; bn=HisnMuslim #95-(21); ms=AkuIslam (2 explanatory glosses stripped); de=printed German
// edition #95 (German meaning, NOT translit); es=HisnMuslim; id=HisnMuslim. HadeethEnc NOT used (no standalone page).
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
const card23 = M[22];
const card22 = M[21];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "O Allah, I ask You for knowledge which is beneficial and sustenance which is good, and deeds which are acceptable.",
  fr: "Ô Allah ! Je Te demande [de m'accorder] un savoir utile, une subsistance licite et des œuvres que Tu agrées.",
  ur: "اے اللہ! میں تجھ سے نفع دینے والے علم اور پاکیزہ رزق اور قابل قبول عمل کا سوال کرتا ہوں۔",
  tr: "Allahım! Senden, faydalı bir ilim, temiz bir rızık ve makbul bir amel dilerim.",
  bn: "হে আল্লাহ! আমি আপনার নিকট উপকারী জ্ঞান, পবিত্র রিযিক এবং কবুলযোগ্য আমল প্রার্থনা করি।",
  ms: "Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang halal dan amal yang diterima.",
  de: "O Allah, ich bitte dich um nützliches Wissen, gute Versorgung und angenommene Taten.",
  es: "Oh Señor te ruego un conocimiento beneficioso, un sustento agradable y la aceptación de las obras.",
  id: "Ya Allah, sesungguhnya aku mohon kepada-Mu ilmu yang bermanfaat, rezki yang baik dan amal yang diterima.",
};
// THREE requests per language: [beneficial knowledge, good provision, accepted deeds]
const THREE = {
  en: ["knowledge which is beneficial", "sustenance which is good", "deeds which are acceptable"],
  fr: ["savoir utile", "subsistance licite", "œuvres que Tu agrées"],
  ur: ["نفع دینے والے علم", "پاکیزہ رزق", "قابل قبول عمل"],
  tr: ["faydalı bir ilim", "temiz bir rızık", "makbul bir amel"],
  bn: ["উপকারী জ্ঞান", "পবিত্র রিযিক", "কবুলযোগ্য আমল"],
  ms: ["ilmu yang bermanfaat", "rezeki yang halal", "amal yang diterima"],
  de: ["nützliches Wissen", "gute Versorgung", "angenommene Taten"],
  es: ["conocimiento beneficioso", "sustento agradable", "aceptación de las obras"],
  id: ["ilmu yang bermanfaat", "rezki yang baik", "amal yang diterima"],
};
// rizq must NOT be reduced to money-only
const MONEY = /\bmoney\b|\bwealth\b|\bargent\b|\bdinero\b|\bGeld\b|\buang\b|টাকা|پیسہ/i;
// after-Fajr context / narrator / transliteration must NOT appear in any block
const CONTEXT = /بعد الفجر|after Fajr|après le Fajr|أم سلمة|Umm Salamah/i;
const TRANSLIT = /Allähumma|Allahumma inni|as['-]aluka/i;

console.log('================ 1. Card 23 = morning-023 — ALL 9 translations, THREE requests ================');
ok(card23 && card23.id === 'morning-023', "AzkarMorning[22].id === 'morning-023'");
ok(card23.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card23['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `Card 23 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 23 ${l}: EXACTLY matches approved source string`);
  ok(THREE[l].every((x) => N(t).includes(N(x))), `Card 23 ${l}: ALL THREE requests preserved`);
  ok(!/[\p{Nd}]/u.test(t), `Card 23 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 23 ${l}: no footnote digit-brackets, no soft hyphen`);
}

console.log('\n================ 2. rizq NOT money-only + no after-Fajr context / translit ================');
for (const l of ALL9) ok(!MONEY.test(card23['translation_' + l]), `${l}: rizq NOT reduced to money`);
for (const l of ALL9) ok(!CONTEXT.test(card23['translation_' + l]), `${l}: no after-Fajr context / narrator`);
for (const l of ALL9) ok(!TRANSLIT.test(card23['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. Approved source decisions + no reference/repeat inside block ================');
ok(card23.translation_fr.includes("[de m'accorder]"), 'fr: keeps published «[de m\'accorder]»');
ok(!card23.translation_ms.includes('(bagi diriku') && !card23.translation_ms.includes('(di sisi-Mu'), 'ms: 2 explanatory glosses stripped');
ok(card23.translation_de.startsWith('O Allah, ich bitte dich') && !TRANSLIT.test(card23.translation_de), 'de: German meaning line (NOT transliteration)');
for (const l of ALL9) ok(!/رواه|Ibn Majah|Ibnu Majah|ابن ماجہ|ইবন মাজাহ|once\b|مرة واحدة|kali|Dibaca|بار\b/.test(card23['translation_' + l]), `${l}: no reference/repeat token inside block`);

console.log('\n================ 4. NO ar + Arabic/source/repeat + virtue/authenticity null ================');
ok(card23.translation_ar === undefined, 'Card 23 has NO translation_ar');
const b23 = dataSrc.slice(dataSrc.indexOf("id: 'morning-023'"), dataSrc.indexOf("id: 'morning-024'"));
ok(!/translation_ar\s*:/.test(b23), 'morning-023 source block declares NO translation_ar');
ok(b23.includes("text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.'"), 'Card 23 Arabic text byte-identical');
ok(b23.includes("source: { ref: 'رواه ابن ماجه', sourceUrl: null }"), "Card 23 source stays «رواه ابن ماجه»");
ok(b23.includes('repeat: 1,') && b23.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 23 repeat stays 1 («مرة واحدة»)");
ok(/virtue:\s*null/.test(b23) && /authenticity:\s*null/.test(b23), "Card 23 virtue null + authenticity null");

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 25; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-22 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 22; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(card22.translation_en.startsWith('How perfect Allah is and I praise Him by the number'), 'Card 22 en (4-measures) intact');
ok(M[20].translation_en === 'How perfect Allah is and I praise Him.', 'Card 21 en (short) intact');
ok(card23.translation_en.startsWith('O Allah, I ask You for knowledge which is beneficial'), 'Card 23 en is the new dua');
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
ok(/js\/azkar-data\.js\?v=55/.test(htmlSrc), 'index.html azkar-data.js?v=55 (Card 23 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=843/.test(htmlSrc), 'index.html app.js?v=843 UNCHANGED');
ok(/CACHE_VERSION = 'v554'/.test(swSrc), "sw.js CACHE_VERSION 'v554'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
