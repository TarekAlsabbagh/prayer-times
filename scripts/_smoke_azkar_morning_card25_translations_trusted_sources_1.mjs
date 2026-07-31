// Smoke — AZKAR-MORNING-DUA-CARD-25-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-025 («اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.», salawat, repeat 10 «عشر مرات», virtue = Ahzab:56 +
// hadith, authenticity sahih) gains ALL 9 static translations — meaning only. Preserve the FOUR meanings:
// ① ask Allah ② صل/salat (blessings) ③ وسلم/salam (peace) ④ نبينا محمد (our Prophet Muhammad). SHORT form ONLY —
// NO Ibrahimi salawat: «آل محمد» / «كما صليت على إبراهيم» / «وبارك» / «إنك حميد مجيد» must NOT appear. Repeat, virtue
// (hadith), morning/evening context, sanad, transliteration, reference all stay OUT of the block. Sources: en=HisnMuslim
// #98 + Sunnah.com (Allaah→Allah); fr=Dar Al Athar #98 (keeps «Ô Seigneur»); ur=Talaqqi (Hisn+Nasai, keeps the honorific
// «صلی اللہ علیہ وسلم» inside the Prophet's name — ACCEPTED); tr=İlme Davet #98; bn=HisnMuslim #98; ms=Zikir.my (« & »→«dan»);
// de=printed German edition #98 (meaning, no translit); es=HisnMuslim; id=HisnMuslim (keeps published «(sampaikanlah)»).
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
const card25 = M[24];
const card24 = M[23];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "O Allah, send prayers and peace upon our Prophet Muhammad.",
  fr: "Ô Seigneur ! Accorde Tes bénédictions et la paix à notre Prophète Muhammad.",
  ur: "اے اللہ، ہمارے نبی محمد صلی اللہ علیہ وسلم پر درود و سلام بھیج۔",
  tr: "Allahım! Peygamberimiz Muhammed'e salât ve selâm eyle.",
  bn: "হে আল্লাহ! আপনি সালাত ও সালাম পেশ করুন আমাদের নবী মুহাম্মাদের উপর।",
  ms: "Ya Allah, limpahkan selawat dan salam atas Nabi kami Muhammad.",
  de: "O Allah, Segen und Frieden auf unserem Propheten Muhammad.",
  es: "Oh Señor, concede paz y bendiciones a nuestro Profeta Muhammad.",
  id: "Ya Allah, (sampaikanlah) shalawat dan salam kepada Nabi kami Muhammad.",
};
// FOUR meanings per lang: [ask Allah, salat/blessings, salam/peace, our Prophet Muhammad]
const FOUR = {
  en: ['O Allah', 'prayers', 'peace', 'our Prophet Muhammad'],
  fr: ['Seigneur', 'bénédictions', 'paix', 'notre Prophète Muhammad'],
  ur: ['اے اللہ', 'درود', 'سلام', 'نبی محمد'],
  tr: ['Allahım', 'salât', 'selâm', 'Peygamberimiz Muhammed'],
  bn: ['হে আল্লাহ', 'সালাত', 'সালাম', 'নবী মুহাম্মাদ'],
  ms: ['Ya Allah', 'selawat', 'salam', 'Nabi kami Muhammad'],
  de: ['O Allah', 'Segen', 'Frieden', 'unserem Propheten Muhammad'],
  es: ['Señor', 'bendiciones', 'paz', 'nuestro Profeta Muhammad'],
  id: ['Ya Allah', 'shalawat', 'salam', 'Nabi kami Muhammad'],
};
// Ibrahimi / longer-form tokens that MUST NOT appear (the honorific «صلی اللہ علیہ وسلم» is ALLOWED, not here)
const IBRAHIMI = /آل محمد|إبراهيم|ابراہیم|Ibrahim|Ibrāhīm|وبارك|وبارک|كما صليت|إنك حميد مجيد|حميد مجيد|حمید مجید|famille de Muhammad|keluarga Muhammad|মুহাম্মাদের পরিবার/i;
// reference / repeat / virtue / context / sanad tokens that MUST NOT appear inside the block
const REF = /رواه|الحديث الصحيح|Sahih Muslim|Bukhari|Bukhārī|Nasai|Nasā'i|Tabarani|طبراني|النسائي|ten times|dix fois|zehnmal|sepuluh kali|10 kali|دس مرتبہ|عشر مرات|من صلى|شفاعت|intercession|Al-Aḥzāb|الأحزاب|Ahzab/i;
// LATIN transliteration of the Arabic that MUST NOT appear
const TRANSLIT = /Allahumma salli|salli wa sallim|nabiyyina Muhammad|sallallahu ['`]alayhi/i;

console.log('================ 1. Card 25 = morning-025 — ALL 9 translations, FOUR meanings (exact) ================');
ok(card25 && card25.id === 'morning-025', "AzkarMorning[24].id === 'morning-025'");
ok(card25.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card25['translation_' + l];
  ok(typeof t === 'string' && t.length > 20, `Card 25 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 25 ${l}: EXACTLY matches approved source string`);
  ok(FOUR[l].every((x) => N(t).includes(N(x))), `Card 25 ${l}: ALL FOUR meanings preserved (Allah+salat+salam+our Prophet Muhammad)`);
  ok(!/[\p{Nd}]/u.test(t), `Card 25 ${l}: no digits (any script)`);
  ok(!/­/.test(t), `Card 25 ${l}: no soft hyphen`);
}

console.log('\n================ 2. NO Ibrahimi/longer salawat + no reference/repeat/translit inside block ================');
for (const l of ALL9) ok(!IBRAHIMI.test(card25['translation_' + l]), `${l}: no «آل محمد»/«إبراهيم»/«وبارك»/«حميد مجيد»/Ibrahimi form`);
for (const l of ALL9) ok(!REF.test(card25['translation_' + l]), `${l}: no reference/repeat/virtue/context inside block`);
for (const l of ALL9) ok(!TRANSLIT.test(card25['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. Approved source decisions ================');
ok(!/Allaah/.test(card25.translation_en) && card25.translation_en.includes('Allah'), 'en: «Allaah» normalized to «Allah»');
ok(card25.translation_fr.includes('Ô Seigneur') && !card25.translation_fr.includes('Ibrahim'), 'fr: Dar Al Athar «Ô Seigneur» (accepted)');
ok(card25.translation_ur.includes('صلی اللہ علیہ وسلم'), 'ur: Talaqqi keeps the honorific «صلی اللہ علیہ وسلم» inside the name (ACCEPTED decision)');
ok(card25.translation_ms.includes('selawat dan salam') && !card25.translation_ms.includes('&') && !card25.translation_ms.includes('shalawat'), 'ms: Zikir.my «dan» (« & » normalized), Malay «selawat»');
ok(card25.translation_id.includes('(sampaikanlah)') && card25.translation_id.includes('shalawat'), 'id: keeps published «(sampaikanlah)», Indonesian «shalawat»');
ok(card25.translation_de.startsWith('O Allah, Segen und Frieden') && !TRANSLIT.test(card25.translation_de), 'de: German meaning line (NOT transliteration)');

console.log('\n================ 4. NO ar + Arabic/source/repeat + virtue(Ahzab) + authenticity sahih ================');
ok(card25.translation_ar === undefined, 'Card 25 has NO translation_ar');
const mStart = dataSrc.indexOf("id: 'morning-025'");
const b25 = dataSrc.slice(mStart, dataSrc.indexOf('];', mStart));
ok(!/translation_ar\s*:/.test(b25), 'morning-025 source block declares NO translation_ar');
ok(b25.includes("text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.'"), 'Card 25 Arabic text byte-identical');
ok(b25.includes("source: { ref: 'الحديث الصحيح', sourceUrl: null }"), "Card 25 source stays «الحديث الصحيح»");
ok(b25.includes('repeat: 10,') && b25.includes("repeatLabel: { ar: 'عشر مرات', en: 'ten times' }"), "Card 25 repeat stays 10 («عشر مرات»)");
ok(/authenticity:\s*'sahih'/.test(b25), "Card 25 authenticity 'sahih'");
ok(b25.includes('سورة الأحزاب: 56'), 'Card 25 virtue (Ahzab 56 + hadith) present & OUTSIDE the translation block');

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 25; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-24 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 24; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(card24.translation_en.startsWith("I seek Allah's forgiveness"), 'Card 24 en (istighfar) intact');
ok(card25.translation_en === "O Allah, send prayers and peace upon our Prophet Muhammad.", 'Card 25 en is the new salawat');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 11, `evening region translation_${l} still EXACTLY 11`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation / source URLs ================');
ok(!/sunnah\.com|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|ilmedavetdernegi\.org|akuislam\.com|archive\.org|hisnii\.com|zikir\.my|talaqqi\.app/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=43/.test(htmlSrc), 'index.html azkar-data.js?v=43 (Card 25 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v541'/.test(swSrc), "sw.js CACHE_VERSION 'v541'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
