// Smoke — AZKAR-MORNING-DUA-CARD-20-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-020 («لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير.», Abu Dawud + Tirmidhi,
// repeat 100 «عشر مرات أو مائة مرة», virtue NON-null) gains ALL 9 static translations — SHORT-FORM tahlil, meaning only,
// no repeat label, reference, isnad, story, virtue («عدل عشر رقاب…»), transliteration, footnotes/digits, or explanation.
// CRITICAL: the SHORT form has NO «يُحْيِي وَيُمِيتُ» (He gives life and causes death) — that clause belongs to a DIFFERENT
// (10×) dhikr and must NOT appear in any language. FIVE meanings preserved: la-ilaha / wahdahu-la-sharika / lahu-l-mulk /
// wa-lahu-l-hamd / wa-huwa-'ala-kulli-shay'in-qadir. This dhikr has NO mention of the Prophet → no salawat. Sources:
// en=HisnMuslim; fr=Hisnii #23 (keeps published gloss «[digne d'être adorée]»); ur=IslamHouse 827527 (DOM-verified);
// tr=İlme Davet #93; bn=HisnMuslim 93-19; ms=AkuIslam #15 (repeat 10× at source; متن = 100× Bukhari/Muslim, repeat NOT in
// block); de=printed German edition 93-19; es=HisnMuslim es; id=HisnMuslim id 93-19. HadeethEnc NOT used; longer-form
// sources (muslim.or.id id 10×, Hisnii fr #22, de item 72-7) REJECTED.
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
const card20 = M[19];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
  fr: "Il n'y a aucune divinité [digne d'être adorée] en dehors d'Allah, Seul, sans associé. À Lui la royauté, à Lui la louange et Il est capable de toute chose.",
  ur: "اللہ کے علاوہ کوئی عبادت کے لائق نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لئے ملک ہے، اور اسی کے لئے حمد ہے اور وہ ہر چیز پر قادر ہے۔",
  tr: "Allah'tan başka hakkıyla ibâdete lâyık hiçbir ilah yoktur. O, birdir ve hiçbir ortağı yoktur. Mülk O'nundur, hamd da O'nadır. O, her şeye gücü yetendir.",
  bn: "একমাত্র আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই, তাঁর কোনো শরীক নেই, রাজত্ব তাঁরই, সমস্ত প্রশংসাও তাঁর, আর তিনি সকল কিছুর উপর ক্ষমতাবান।",
  ms: "Tidak ada Tuhan yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Bagi-Nya kerajaan dan segala pujian. Dia-lah yang berkuasa atas segala sesuatu.",
  de: "Es gibt keine Gottheit außer Allah, Dem Einzigen, Der keinen Partner hat. Sein sind die Herrschaft und das Lob, und Er ist über alle Dinge mächtig.",
  es: "No hay divinidad salvo Allah, único, sin asociado, Suyo es el Reino y Suya es la alabanza y es sobre toda cosa Poderoso.",
  id: "Tidak ada ilah yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya. Milik Allah kerajaan dan segala pujian. Dia-lah yang berkuasa atas segala sesuatu.",
};
// FIVE meanings per language: [la-ilaha, wahdahu/la-sharika, al-mulk, al-hamd, qadir]
const FIVE = {
  en: ["worshipped except Allah", "without partner", "sovereignty", "praise", "over all things omnipotent"],
  fr: ["divinité", "sans associé", "royauté", "louange", "capable de toute chose"],
  ur: ["عبادت کے لائق نہیں", "کوئی شریک نہیں", "ملک ہے", "حمد ہے", "قادر ہے"],
  tr: ["ilah yoktur", "ortağı yoktur", "Mülk O'nundur", "hamd", "gücü yeten"],
  bn: ["ইলাহ নেই", "শরীক নেই", "রাজত্ব তাঁরই", "প্রশংসাও তাঁর", "ক্ষমতাবান"],
  ms: ["berhak disembah selain Allah", "tidak ada sekutu", "kerajaan", "pujian", "berkuasa atas segala sesuatu"],
  de: ["Gottheit außer Allah", "keinen Partner", "Herrschaft", "Lob", "über alle Dinge mächtig"],
  es: ["No hay divinidad salvo Allah", "sin asociado", "Reino", "alabanza", "sobre toda cosa Poderoso"],
  id: ["ilah yang berhak disembah selain Allah", "tidak ada sekutu", "kerajaan", "pujian", "berkuasa atas segala sesuatu"],
};
const LIFE_DEATH = /يحيي|يميت|gives life|causes death|la vie et|fait vivre|fait mourir|öldür|diriltir|menghidupkan|mematikan|lebendig|sterben|জীবন দ|মৃত্যু|زندہ کرتا|مارتا/i;

console.log('================ 1. Card 20 = morning-020 — ALL 9 short-form translations, FIVE meanings ================');
ok(card20 && card20.id === 'morning-020', "AzkarMorning[19].id === 'morning-020'");
ok(card20.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card20['translation_' + l];
  ok(typeof t === 'string' && t.length > 40, `Card 20 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 20 ${l}: EXACTLY matches approved source string`);
  ok(FIVE[l].every((x) => N(t).includes(N(x))), `Card 20 ${l}: ALL FIVE meanings preserved`);
  ok(!/[\p{Nd}]/u.test(t), `Card 20 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 20 ${l}: no footnote digit-brackets, no soft hyphen`);
}

console.log('\n================ 2. NO «يحيي ويميت» / life-and-death clause (short form only) ================');
for (const l of ALL9) ok(!LIFE_DEATH.test(card20['translation_' + l]), `${l}: NO life-and-death clause`);

console.log('\n================ 3. Approved source decisions + no reference/virtue inside block ================');
ok(card20.translation_fr.includes('[digne ') && card20.translation_fr.includes('adorée]'), 'fr: keeps published gloss «[digne d\'être adorée]»');
ok(card20.translation_ms.includes('Bagi-Nya kerajaan dan segala pujian'), 'ms: AkuIslam source wording kept (mulk+hamd combined)');
ok(card20.translation_id.includes('Milik Allah kerajaan dan segala pujian') && !card20.translation_id.includes('menghidupkan'), 'id: HisnMuslim short form (NOT muslim.or.id longer 10× form)');
ok(card20.translation_de.includes('Dem Einzigen') && !/lebendig|sterben/.test(card20.translation_de), 'de: printed edition short form (NOT item 72-7 longer form)');
ok(card20.translation_es.includes('No hay divinidad salvo Allah'), 'es: HisnMuslim es');
for (const l of ALL9) ok(!/رواه|Abu Dawud|Tirmidhi|Bukhari|Muslim|رقاب|حسنة|عدل عشر|حرز|سو مرتبہ|100|kali/.test(card20['translation_' + l]), `${l}: no reference/repeat/virtue token inside block`);

console.log('\n================ 4. NO ar + Arabic/source/repeat + virtue SEPARATE (out of blocks) ================');
ok(card20.translation_ar === undefined, 'Card 20 has NO translation_ar');
const b20 = dataSrc.slice(dataSrc.indexOf("id: 'morning-020'"), dataSrc.indexOf("id: 'morning-021'"));
ok(!/translation_ar\s*:/.test(b20), 'morning-020 source block declares NO translation_ar');
ok(b20.includes("text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.'"), 'Card 20 Arabic text byte-identical');
ok(b20.includes("source: { ref: 'رواه أبو داود، ورواه الترمذي', sourceUrl: null }"), "Card 20 source stays «رواه أبو داود، ورواه الترمذي»");
ok(b20.includes('repeat: 100,') && b20.includes("repeatLabel: { ar: 'عشر مرات أو مائة مرة', en: 'ten or one hundred times' }"), "Card 20 repeat stays 100 («عشر مرات أو مائة مرة»)");
ok(typeof card20.virtue === 'object' && card20.virtue && card20.virtue.ar.includes('عدل عشر رقاب'), 'Card 20 virtue NON-null (separate field) intact');
for (const l of ALL9) ok(!card20['translation_' + l].includes('عدل عشر رقاب'), `${l}: virtue «عدل عشر رقاب» NOT inside translation block`);

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 25; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-19 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 19; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[18].translation_en.startsWith('We rise upon the fitrah'), 'Card 19 en intact');
ok(M[17].translation_en.startsWith('We have reached the morning'), 'Card 18 en intact');
ok(M[19].translation_en.startsWith('None has the right to be worshipped'), 'Card 20 en is the new tahlil');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 12, `evening region translation_${l} still EXACTLY 12`);
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
ok(/js\/azkar-data\.js\?v=44/.test(htmlSrc), 'index.html azkar-data.js?v=44 (Card 20 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v542'/.test(swSrc), "sw.js CACHE_VERSION 'v542'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
