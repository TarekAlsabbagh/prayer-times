// Smoke — AZKAR-MORNING-DUA-CARD-09-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-009 («اللهم ما أصبح بي من نعمة», Abu Dawud, ×1) gains ALL 9 static translations of the DUA MEANING ONLY —
// no repeat label, no reference, no virtue, no transliteration, no explanation, no footnotes/digits, no evening
// variant. Sources: en=Sunnah Hisn 81; es/id/bn=HisnMuslim item 81; de=Islamische Datenbank Hisnu-l-Muslim Kap.27;
// fr=Dar Al Athar ch.27; ur=IslamHouse morning/evening azkar; tr=hadiskutuphanesi Hisnul Müslim böl.27 (morning form
// «sabaha çıkan», NOT Kuranla Şifa which showed the evening form); ms=Duaa.my Mathurat Sughra (Doa 19, Pagi).
// ar never renders a block. Cards 01-08 + evening + prayer untouched.
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
const card9 = M[8];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang: dua opening (start) + praise/thanks closing (has) + forbidden leaks (not)
const A = {
  en: { start: 'O Allah, whatever blessing has been received', has: ['from You alone', 'thanks is to You'], not: ['Whoever', 'Abu Dawud', 'blessing 1', 'evening'] },
  fr: { start: 'Ô Seigneur ! Tout ce qui m’arrive comme bienfaits', has: ['en ce jour qui se lève', 'la louange ainsi que la gratitude'], not: ['ou ce soir', 'Abu Dawud', 'quiconque'] },
  ur: { start: 'اے اللہ! مجھ پر یا تیری مخلوق میں سے کسی پر', has: ['جس نعمت نے بھی صبح کی ہے', 'تیرے ہی لئے شکر ہے۔'], not: ['ما أَمْسَى', 'شام کے وقت', 'ابو داؤد'] },
  tr: { start: 'Allahım! Benim veya kullarından birisinin yanında sabaha çıkan', has: ['her nimet, yalnızca sendendir', 'Şükür de sanadır'], not: ['akşama çıkan', 'Akşamleyin', 'Ebu Dâvud', 'Kim bunu'] },
  bn: { start: 'হে আল্লাহ! যে নি‘আমত আমার সাথে সকালে উপনীত হয়েছে', has: ['কেবলমাত্র আপনার নিকট থেকেই', 'সকল কৃতজ্ঞতা আপনারই'], not: ['আবূ দাউদ', 'যে ব্যক্তি', 'বিকাল'] },
  ms: { start: 'Ya Allah, apa saja nikmat yang kami dapati pagi ini', has: ['Tidak ada sekutu bagiMu', 'Puji dan kesyukuran (kami) untukMu'], not: ['Abu Daud', 'petang', 'Barang siapa'] },
  de: { start: 'O Allāh, all meine Gaben und die Gaben', has: ['an diesem Morgen sind von Dir allein', 'al-ḥamd (das Lob) und Dank Dir'], not: ['Abū Dawūd', 'Abend', 'viermal'] },
  es: { start: '¡Oh Allah! Toda la gracia que poseo o posea', has: ['único sin asociados', 'la alabanza y el agradecimiento'], not: ['Abu Dawúd', 'Quienquiera', 'tarde'] },
  id: { start: 'Ya Allah, nikmat yang kuterima atau diterima', has: ['di pagi ini adalah dari-Mu', 'panjatan syukur'], not: ['Abu Dawud', 'Barang siapa', 'Bila sore'] },
};

console.log('================ 1. Card 09 = morning-009 — ALL 9 translations (dua meaning only) ================');
ok(card9 && card9.id === 'morning-009', "AzkarMorning[8].id === 'morning-009' (actual id confirmed)");
ok(card9.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card9['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 100, `Card 09 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 09 ${l}: starts with the dua opening («${a.start.slice(0, 26)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 09 ${l}: praise/thanks closing anchors present (full dua)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 09 ${l}: NO repeat/reference/evening/transliteration/virtue leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 09 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 09 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved source/cleaning decisions ================');
ok(card9.translation_tr.includes('sabaha çıkan') && !/akşama çıkan/.test(card9.translation_tr), 'tr: MORNING form «sabaha çıkan» (not Kuranla Şifa evening form)');
ok(card9.translation_fr.includes('en ce jour qui se lève') && !/ou ce soir/.test(card9.translation_fr), 'fr: «[ou ce soir]» dropped, morning form kept');
ok(card9.translation_ms === 'Ya Allah, apa saja nikmat yang kami dapati pagi ini dari mana-mana makhlukMu maka sebenarnya dari Engkau jua. Tidak ada sekutu bagiMu. Puji dan kesyukuran (kami) untukMu.', 'ms: Duaa.my approved text verbatim');
ok(card9.translation_ur.endsWith('شکر ہے۔'), 'ur: full sentence ending «شکر ہے۔»');

console.log('\n================ 3. NO ar + virtue stays in the separate Arabic field ================');
ok(card9.translation_ar === undefined, 'Card 09 has NO translation_ar (Arabic UI shows no block)');
const b9 = dataSrc.slice(dataSrc.indexOf("id: 'morning-009'"), dataSrc.indexOf("id: 'morning-010'"));
ok(!/translation_ar\s*:/.test(b9), 'morning-009 source block declares NO translation_ar field');
ok(b9.includes('من قالها حين يصبح فقد أدى شكر يومه'), 'virtue (Arabic) untouched — kept OUTSIDE the translations');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 9 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 09 Arabic text/source/repeat byte-identical ================');
ok(b9.includes("text: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ، أَوْ بِأَحَدٍ مِنْ خَلْقِكَ، فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.'"), 'Card 09 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b9.includes("source: { ref: 'رواه أبو داود', sourceUrl: null }"), "Card 09 source stays «رواه أبو داود»");
ok(b9.includes('repeat: 1,') && b9.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 09 repeat stays 1 («مرة واحدة»)");
ok(b9.includes("title: { ar: 'اللهم ما أصبح بي من نعمة'"), 'Card 09 title untouched');

console.log('\n================ 6. Cards 01-08 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 8; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations`);
ok(M[7].translation_en.startsWith('O Allah, I have entered a new morning'), 'Card 08 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 20, `evening region translation_${l} still EXACTLY 20`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched — generic read, no fallback, ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), 'server ar-gate intact');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation requests ================');
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com|hadiskutuphanesi|duaa\.my/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my/i.test(srvSrc) && !/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=52/.test(htmlSrc), 'index.html azkar-data.js?v=52 (Card 09 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v550'/.test(swSrc), "sw.js CACHE_VERSION 'v550'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
