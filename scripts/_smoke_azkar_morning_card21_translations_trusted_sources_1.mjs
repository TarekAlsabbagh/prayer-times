// Smoke — AZKAR-MORNING-DUA-CARD-21-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-021 («سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.», Muslim, repeat 100 «مائة مرة», virtue NON-null, authenticity 'sahih')
// gains ALL 9 static translations — SHORT-FORM tasbih, meaning only, no repeat label, reference, isnad, story, virtue
// («لم يأت أحد…» / «زبد البحر»/foam of the sea), transliteration, footnotes/digits, or explanation.
// CRITICAL: the SHORT form has NO «الْعَظِيمِ» (Magnificent/Immense) and NO «عَدَدَ خَلْقِهِ» (as many as His creation) — those
// belong to DIFFERENT (longer) dhikr and must NOT appear in any language. TWO meanings preserved: tasbih (glorify/purity)
// + hamd (praise). Sources: en=HisnMuslim; fr=Hisnii #20 (Muslim 2692, NOT #21 «العظيم»); ur=IslamHouse 827527 (DOM);
// tr=İlme Davet #94; bn=HisnMuslim 91-17; ms=AkuIslam #14 (NOT #16 «عدد خلقه»); de=printed German edition 91-17 (German
// meaning line, NOT the transliteration line); es=HisnMuslim es (Muslim 4/2081); id=HisnMuslim id (Muslim 4/2071).
// HadeethEnc NOT used; longer-form sources («سبحان الله العظيم وبحمده», «عدد خلقه») REJECTED.
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
const card21 = M[20];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "How perfect Allah is and I praise Him.",
  fr: "Gloire, pureté et louange à Allah.",
  ur: "اللہ پاک ہے اور اپنی تعریف کے ساتھ ہے۔",
  tr: "Hamdederek Allah'ı tüm noksanlıklardan tenzih ederim.",
  bn: "আমি আল্লাহর প্রশংসাসহ পবিত্রতা ও মহিমা ঘোষণা করছি।",
  ms: "Mahasuci Allah, aku memuji-Nya.",
  de: "Gepriesen sei Allah und Lob sei Ihm.",
  es: "Glorificado sea Allah y Alabado sea.",
  id: "Maha Suci Allah dan segala puji (bagi-Nya).",
};
// TWO meanings per language: [tasbih (glorify/purity), hamd (praise)]
const TWO = {
  en: ["perfect Allah", "praise"],
  fr: ["Gloire", "louange"],
  ur: ["پاک", "تعریف"],
  tr: ["tenzih", "Hamd"],
  bn: ["পবিত্রতা", "প্রশংসা"],
  ms: ["Mahasuci", "memuji"],
  de: ["Gepriesen", "Lob"],
  es: ["Glorificado", "Alabado"],
  id: ["Maha Suci", "puji"],
};
// longer-form / added-adjective («العظيم» / «عدد خلقه») tokens that must NOT appear in any block
const LONGER = /الْعَظِيم|العظيم|عظیم|عَدَدَ خَلْقِهِ|عدد خلقه|Magnificent|Immense|l['’]Immense|Grandioso|Inmenso|Gewaltige|Großartige|Maha Agung|Agung|azîm|azim|মহান|sebanyak|number of His creation|as many as/i;
// virtue («لم يأت أحد…» / «زبد البحر»/foam of the sea / sins wiped) tokens that must NOT appear in any block
const VIRTUE = /لم يأت أحد|زبد البحر|foam of the sea|écume|حطت خطاياه|wiped|forgiven|péchés|Sünden|pecados|গুনাহ|گناہ|dosa-dosa/i;
// transliteration must NOT appear in any block
const TRANSLIT = /Subh[aä]na|bihamdihi|Subhan Allah|Alhamdulillah|Wa bihamdihi/i;

console.log('================ 1. Card 21 = morning-021 — ALL 9 short-form translations, TWO meanings ================');
ok(card21 && card21.id === 'morning-021', "AzkarMorning[20].id === 'morning-021'");
ok(card21.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card21['translation_' + l];
  ok(typeof t === 'string' && t.length > 15, `Card 21 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 21 ${l}: EXACTLY matches approved source string`);
  ok(TWO[l].every((x) => N(t).includes(N(x))), `Card 21 ${l}: BOTH meanings (tasbih + hamd) preserved`);
  ok(!/[\p{Nd}]/u.test(t), `Card 21 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 21 ${l}: no footnote digit-brackets, no soft hyphen`);
}

console.log('\n================ 2. NO «العظيم» / longer form / «عدد خلقه» (short form only) ================');
for (const l of ALL9) ok(!LONGER.test(card21['translation_' + l]), `${l}: NO «العظيم»/longer-form/«عدد خلقه» token`);

console.log('\n================ 3. Approved source decisions + no reference/virtue/translit inside block ================');
ok(card21.translation_fr === 'Gloire, pureté et louange à Allah.', 'fr: Hisnii #20 short form (NOT #21 «العظيم»/«l\'Immense»)');
ok(card21.translation_de === 'Gepriesen sei Allah und Lob sei Ihm.' && !TRANSLIT.test(card21.translation_de), 'de: German meaning line (NOT the transliteration line)');
ok(card21.translation_ms === 'Mahasuci Allah, aku memuji-Nya.' && !/Agung/.test(card21.translation_ms), 'ms: AkuIslam #14 short form (NOT #16 «عدد خلقه»)');
ok(card21.translation_id === 'Maha Suci Allah dan segala puji (bagi-Nya).' && !/SWT|Agung/.test(card21.translation_id), 'id: HisnMuslim short, plain «Allah» (no SWT, no Agung)');
for (const l of ALL9) ok(!VIRTUE.test(card21['translation_' + l]), `${l}: no virtue («لم يأت أحد…»/«زبد البحر»/sins) inside block`);
for (const l of ALL9) ok(!TRANSLIT.test(card21['translation_' + l]), `${l}: no transliteration inside block`);
for (const l of ALL9) ok(!/رواه|Muslim|مسلم|مائة|100|مرة|times|kali|veces|mal\b/.test(card21['translation_' + l]), `${l}: no reference/repeat token inside block`);

console.log('\n================ 4. NO ar + Arabic/source/repeat + virtue SEPARATE (out of blocks) ================');
ok(card21.translation_ar === undefined, 'Card 21 has NO translation_ar');
const b21 = dataSrc.slice(dataSrc.indexOf("id: 'morning-021'"), dataSrc.indexOf("id: 'morning-022'"));
ok(!/translation_ar\s*:/.test(b21), 'morning-021 source block declares NO translation_ar');
ok(b21.includes("text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.'"), 'Card 21 Arabic text byte-identical');
ok(b21.includes("source: { ref: 'رواه مسلم', sourceUrl: null }"), "Card 21 source stays «رواه مسلم»");
ok(b21.includes('repeat: 100,') && b21.includes("repeatLabel: { ar: 'مائة مرة', en: 'one hundred times' }"), "Card 21 repeat stays 100 («مائة مرة»)");
ok(b21.includes("authenticity: 'sahih'"), "Card 21 authenticity stays 'sahih'");
ok(typeof card21.virtue === 'object' && card21.virtue && card21.virtue.ar.includes('لم يأت أحد'), 'Card 21 virtue NON-null (separate field) intact');
for (const l of ALL9) ok(!card21['translation_' + l].includes('لم يأت أحد'), `${l}: virtue «لم يأت أحد» NOT inside translation block`);

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 25; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-20 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 20; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[19].translation_en.startsWith('None has the right to be worshipped'), 'Card 20 en intact');
ok(M[18].translation_en.startsWith('We rise upon the fitrah'), 'Card 19 en intact');
ok(M[17].translation_en.startsWith('We have reached the morning'), 'Card 18 en intact');
ok(M[20].translation_en === 'How perfect Allah is and I praise Him.', 'Card 21 en is the new tasbih');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 15, `evening region translation_${l} still EXACTLY 15`);
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
ok(/js\/azkar-data\.js\?v=47/.test(htmlSrc), 'index.html azkar-data.js?v=47 (Card 21 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v545'/.test(swSrc), "sw.js CACHE_VERSION 'v545'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
