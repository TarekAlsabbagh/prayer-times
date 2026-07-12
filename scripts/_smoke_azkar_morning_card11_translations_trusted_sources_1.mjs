// Smoke — AZKAR-MORNING-DUA-CARD-11-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-011 («اللهم إني أعوذ بك من الهم والحزن…وقهر الرجال», Abu Dawud, ×1) gains ALL 9 static translations of the
// DUA MEANING ONLY — no repeat label, no reference, no virtue, no transliteration, no story, no footnotes/digits, no
// evening variant. Card matn = Abu Dawud «غلبة الدين وقهر الرجال»; trusted Hisnul-Muslim sources render the Bukhari
// «ضلع الدين وغلبة الرجال» (equivalent meaning). Sources: en/es/id/bn=HisnMuslim ch.34; fr=Dar Al Athar ch.34;
// ur=IslamHouse (al-Qahtani); tr=Turkish Hisnul Müslim (Islamiokul); ms=e-JAUHAR (MOE Malaysia); de=Islamische Datenbank.
// ar never renders a block. Cards 01-10 + evening + prayer untouched.
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
const card11 = M[10];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang: dua opening (start) + debt/men closing anchors (has) + forbidden leaks (not: reference/repeat/story/translit/evening)
const A = {
  en: { start: 'O Allah, I take refuge in You from anxiety and sorrow', has: ['the burden of debts', 'over powered by men'], not: ['(three times)', 'Bukhari', 'Abu Dawud', 'Umamah', ' once'] },
  fr: { start: 'Ô Seigneur! Je me mets sous Ta protection contre les soucis', has: ['poids de la dette', 'domination des hommes'], not: ['Boukhari', 'Bukhari', 'Abu D', 'une fois', 'Oumama'] },
  ur: { start: 'اے اللہ! میں تیری پناہ مانگتا ہوں حزن و ملال', has: ['قرض کے بوجھ', 'لوگوں کے غلبے'], not: ['بخاری', 'ابوداود', 'ابو داؤد', 'ایک بار'] },
  tr: { start: 'Allahım! Keder ve hüzünden', has: ['borcun belimi bükmesinden', 'insanların bana galip gelmesinden'], not: ['Buhari', 'Buhârî', 'Ebu Davud', 'bir kez', 'bir kere', 'Ümame'] },
  bn: { start: 'হে আল্লাহ! নিশ্চয় আমি আপনার আশ্রয় নিচ্ছি দুশ্চিন্তা', has: ['ঋণের ভার', 'মানুষদের দমন-পীড়ন'], not: ['বুখারী', 'আবূ দাউদ', 'একবার', 'উমামা'] },
  ms: { start: 'Ya Allah, aku berlindung denganMu daripada ditimpa kesusahan', has: ['desakan berhutang', 'paksaan orang'], not: ['Bukhari', 'Al-Bukhari', 'sekali', 'Umamah'] },
  de: { start: 'O Allāh, ich nehme Zuflucht bei Dir vor der Sorge und Trauer', has: ['Last der Schulden', 'von Männern unterdrückt'], not: ['Buẖārī', 'Bukhari', 'einmal', 'Umāma'] },
  es: { start: 'Oh Señor me refugio en Ti de las preocupaciones', has: ['peso de las deudas', 'dominado por los hombres'], not: ['Bujari', 'Bukhari', 'una vez', 'Umama'] },
  id: { start: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari keluh kesah', has: ['cengkraman utang', 'menindas'], not: ['Bukhari', 'Abu Dawud', 'sekali', 'Umamah'] },
};

console.log('================ 1. Card 11 = morning-011 — ALL 9 translations (dua meaning only) ================');
ok(card11 && card11.id === 'morning-011', "AzkarMorning[10].id === 'morning-011' (actual id confirmed)");
ok(card11.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card11['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 90, `Card 11 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 11 ${l}: starts with the dua opening («${a.start.slice(0, 24)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 11 ${l}: debt+men closing anchors present (full 4-clause dua)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 11 ${l}: NO reference/repeat/story/transliteration/evening leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 11 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 11 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved source/cleaning decisions ================');
ok(card11.translation_fr === 'Ô Seigneur! Je me mets sous Ta protection contre les soucis et la tristesse, contre l’incapacité et la paresse, contre l’avarice et la lâcheté, contre le poids de la dette et la domination des hommes.', 'fr: Dar Al Athar ch.34 approved text verbatim');
ok(card11.translation_ms.includes('perasaaan takut') && card11.translation_ms.endsWith('paksaan orang.'), 'ms: e-JAUHAR verbatim (source spelling «perasaaan» kept)');
ok(card11.translation_id.includes('menindas-(ku)'), 'id: keeps translator bracketed clarification «(ku)»');
ok(card11.translation_ur.endsWith('لوگوں کے غلبے سے۔'), 'ur: IslamHouse (al-Qahtani) full ending «لوگوں کے غلبے سے۔»');

console.log('\n================ 3. NO ar + repeat/source/virtue unchanged ================');
ok(card11.translation_ar === undefined, 'Card 11 has NO translation_ar (Arabic UI shows no block)');
const b11 = dataSrc.slice(dataSrc.indexOf("id: 'morning-011'"), dataSrc.indexOf("id: 'morning-012'"));
ok(!/translation_ar\s*:/.test(b11), 'morning-011 source block declares NO translation_ar field');
ok(/virtue: null,/.test(b11), 'Card 11 virtue stays null');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 11 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 15, `morning region translation_${l}: EXACTLY 15`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 11 Arabic text/source/repeat byte-identical ================');
ok(b11.includes("text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.'"), 'Card 11 Arabic text byte-identical (full literal, tashkeel intact, Abu Dawud matn)');
ok(b11.includes("source: { ref: 'رواه أبو داود', sourceUrl: null }"), "Card 11 source stays «رواه أبو داود»");
ok(b11.includes('repeat: 1,') && b11.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 11 repeat stays 1 («مرة واحدة»)");
ok(b11.includes("title: { ar: 'اللهم إني أعوذ بك من الهم والحزن'"), 'Card 11 title untouched');

console.log('\n================ 6. Cards 01-10 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 10; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[9].translation_en.startsWith('O Allah, grant my body health'), 'Card 10 en intact');
ok(M[8].translation_en.startsWith('O Allah, whatever blessing has been received'), 'Card 09 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 4, `evening region translation_${l} still EXACTLY 4`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched — generic read, no fallback, ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), 'server ar-gate intact');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation requests / source URLs ================');
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com|hadiskutuphanesi|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my|islamiokul\.com/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|daralathar\.fr|islamiokul\.com|moe-dl\.edu\.my/i.test(srvSrc) && !/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|daralathar\.fr|islamiokul\.com|moe-dl\.edu\.my/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=23/.test(htmlSrc), 'index.html azkar-data.js?v=23 (Card 11 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v519'/.test(swSrc), "sw.js CACHE_VERSION 'v519'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
