// Smoke — AZKAR-MORNING-DUA-CARD-10-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-010 («اللهم عافني في بدني», Ahmad, three times) gains ALL 9 static translations of the DUA MEANING ONLY —
// no repeat label, no reference, no virtue, no transliteration, no explanation, no footnotes/digits, no evening
// variant. The phrase «لا إله إلا أنت» is rendered TWICE per language, matching the Arabic structure.
// Sources: en=Sunnah Hisn 85; es/id/bn=HisnMuslim item 82; de=Islamische Datenbank Hisnu-l-Muslim Kap.27;
// fr=Turjman Islam Évocation (shahada twice; REPLACED Dar Al Athar); ur=IslamHouse morning azkar; tr=Turkish Hisnul
// Müslim (morning form); ms=Malaysian Ministry of Education Hisnul Muslim / e-JAUHAR (shahada twice; REPLACED Duaa.my).
// id keeps HisnMuslim's bracketed translator clarifications «(dari penyakit ...)». ar never renders a block.
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
const twice = (t, s) => N(t).split(N(s)).length - 1;

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const M = sandbox.window.AzkarMorning;
const card10 = M[9];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang: dua opening (start) + grave-refuge closing anchors (has) + forbidden leaks (not) + shahada phrase (sh, ×2)
const A = {
  en: { start: 'O Allah, grant my body health', has: ['punishment of the grave'], not: ['(three times)', 'Abu Dawud', 'Ahmad', 'Whoever'], sh: 'None has the right to be worshipped except You' },
  fr: { start: 'Ô Allah ! Préserve-moi dans mon corps', has: ['supplice de la tombe'], not: ['Trois fois', 'Évocation', 'Abu D', 'Ahmad'], sh: 'Nulle divinité ne mérite l’adoration hormis Toi' },
  ur: { start: 'اے اللہ! مجھے میرے جسم میں عافیت دے', has: ['عذاب قبر سے تیری پناہ'], not: ['(تین مرتبہ)', 'ابوداود', 'ابو داؤد'], sh: 'تیرے علاوہ کوئی عبادت کے لائق نہیں' },
  tr: { start: "Allah'ım! Bedenime afiyet ver", has: ['Kabir azabından sana sığınırım'], not: ['Üç kere', 'Ebu Davud', 'akşam'], sh: 'Senden başka ilah yok' },
  bn: { start: 'হে আল্লাহ! আমাকে নিরাপত্তা দিন আমার শরীরে', has: ['কবরের আযাব থেকে'], not: ['(৩ বার)', 'আবূ দাউদ', 'আহমাদ'], sh: 'হক্ব ইলাহ নেই' },
  ms: { start: 'Ya Allah, kurniakanlah kesihatan pada badanku', has: ['azab kubur'], not: ['Tiga kali', 'Abu Dawud', 'Ibn Hibban', 'petang'], sh: 'tiada Tuhan yang berhak disembah melainkan Engkau' },
  de: { start: 'O Allāh, schenke mir Heil in meinem Körper', has: ['Strafe im Grab'], not: ['dreimal', 'Abū Dawūd', 'Ahmad'], sh: 'keinen wahren Ilāh' },
  es: { start: 'Oh Allah, concede salud a mi cuerpo', has: ['tormento de la tumba'], not: ['(3 veces)', 'Abu Dawúd', 'Ahmad'], sh: 'no hay dios sino Tú' },
  id: { start: 'Ya Allah, selamatkan tubuh-ku', has: ['siksa kubur'], not: ['Dibaca tiga kali', 'Abu Dawud', 'petang', 'Ahmad'], sh: 'tiada Tuhan (yang berhak disembah) kecuali Engkau' },
};

console.log('================ 1. Card 10 = morning-010 — ALL 9 translations (dua meaning only) ================');
ok(card10 && card10.id === 'morning-010', "AzkarMorning[9].id === 'morning-010' (actual id confirmed)");
ok(card10.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card10['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 100, `Card 10 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 10 ${l}: starts with the dua opening («${a.start.slice(0, 26)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 10 ${l}: grave-refuge closing anchor present (full dua)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 10 ${l}: NO repeat/reference/evening/transliteration/virtue leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 10 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 10 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 1b. «لا إله إلا أنت» meaning appears EXACTLY TWICE in every language ================');
for (const l of ALL9) ok(twice(card10['translation_' + l], A[l].sh) === 2, `Card 10 ${l}: shahada «${A[l].sh.slice(0, 22)}…» appears EXACTLY twice`);

console.log('\n================ 2. Approved source/cleaning decisions (fr=Turjman, ms=e-JAUHAR, id brackets) ================');
ok(twice(card10.translation_fr, 'Nulle divinité ne mérite l’adoration hormis Toi') === 2 && !/Trois fois/.test(card10.translation_fr), 'fr: Turjman Islam — shahada twice, no repeat label (NOT Dar Al Athar single-shahada)');
ok(card10.translation_ms === 'Ya Allah, kurniakanlah kesihatan pada badanku, Ya Allah, kurniakanlah kesihatan pada pendengaranku, Ya Allah, kurniakanlah kesihatan pada penglihatanku, tiada Tuhan yang berhak disembah melainkan Engkau. Ya Allah, aku berlindung denganMu daripada kekufuran dan kefakiran. Ya Allah aku berlindung denganMu daripada azab kubur, tiada Tuhan yang berhak disembah melainkan Engkau.', 'ms: e-JAUHAR (MOE Malaysia) approved text verbatim (shahada twice)');
ok(card10.translation_id.includes('(dari penyakit dan yang tidak aku inginkan)') && card10.translation_id.includes('(dari penyakit dan maksiat atau sesuatu yang tidak aku inginkan)'), 'id: keeps HisnMuslim bracketed translator clarifications as published');

console.log('\n================ 3. NO ar + virtue stays null (no virtue field leak) ================');
ok(card10.translation_ar === undefined, 'Card 10 has NO translation_ar (Arabic UI shows no block)');
const b10 = dataSrc.slice(dataSrc.indexOf("id: 'morning-010'"), dataSrc.indexOf("id: 'morning-011'"));
ok(!/translation_ar\s*:/.test(b10), 'morning-010 source block declares NO translation_ar field');
ok(/virtue: null,/.test(b10), 'Card 10 virtue stays null (no virtue rendered)');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 10 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 10 Arabic text/source/repeat byte-identical ================');
ok(b10.includes("text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.'"), 'Card 10 Arabic text byte-identical (full literal, tashkeel intact, shahada twice)');
ok(b10.includes("source: { ref: 'رواه أحمد', sourceUrl: null }"), "Card 10 source stays «رواه أحمد»");
ok(b10.includes('repeat: 3,') && b10.includes("repeatLabel: { ar: 'ثلاث مرات', en: 'three times' }"), "Card 10 repeat stays 3 («ثلاث مرات»)");
ok(b10.includes("title: { ar: 'اللهم عافني في بدني'"), 'Card 10 title untouched');

console.log('\n================ 6. Cards 01-09 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 9; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations`);
ok(M[8].translation_en.startsWith('O Allah, whatever blessing has been received'), 'Card 09 en intact');
ok(M[7].translation_en.startsWith('O Allah, I have entered a new morning'), 'Card 08 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l} still EXACTLY 23`);
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
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com|hadiskutuphanesi|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my/i.test(srvSrc) && !/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=55/.test(htmlSrc), 'index.html azkar-data.js?v=55 (Card 10 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v553'/.test(swSrc), "sw.js CACHE_VERSION 'v553'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
