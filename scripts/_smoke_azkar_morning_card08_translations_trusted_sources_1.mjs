// Smoke — AZKAR-MORNING-DUA-CARD-08-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-008 («اللهم إني أصبحت أشهدك», Abu Dawud, ×4) gains ALL 9 static translations of the DUA MEANING ONLY —
// no repeat label, no reference, no virtue, no transliteration, no explanation, no footnotes/digits, no evening
// variant. Sources: en=Sunnah.com Hisn 80; es/id/bn=HisnMuslim.com ch.1; de=Islamische Datenbank Hisnu-l-Muslim
// ch.27; fr=Dar Al Athar ch.27; ur=IslamHouse morning/evening azkar; ms=AkuIslam (Pagi); tr=Kuranla Şifa.
// Approved cleaning: ur/bn drop the honorific after the Prophet's name; es «Muhammmad»→«Muhammad»; ms «‘Arys»→«‘Arsy»;
// fr drop «[ou au soir]». ar never renders a block. Cards 01-07 + evening + prayer untouched.
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
const card8 = M[7];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang: dua opening (start) + servant/Messenger closing (has) + forbidden leaks (not)
const A = {
  en: { start: 'O Allah, I have entered a new morning', has: ['bearers of Your Throne', 'Your slave and Your Messenger'], not: ['Recite', 'four times', 'Allāhumma', 'Whoever', 'Abu Dawud'] },
  fr: { start: 'Ô Seigneur ! Me voici au matin', has: ['porteurs de Ton Trône', 'Ton esclave et Ton messager'], not: ['ou au soir', 'quatre reprise', 'Abu Dawud', 'Bukhari'] },
  ur: { start: 'اے اللہ! میں نے اس حال میں صبح کی', has: ['عرش اٹھانے والوں', 'تیرے بندے اور تیرے رسول'], not: ['ﷺ', 'چار بار', 'أَمْسَيْتُ', 'ابو داؤد', 'بخاری'] },
  tr: { start: "Allah'ım! Senin, kendinden başka ilah", has: ['arşını taşıyanları', 'şahit tutarak sabahladım'], not: ['Dört kere', 'Ebu Davud', 'akşam'] },
  bn: { start: 'হে আল্লাহ! আমি সকালে উপনীত হয়েছি', has: ['আরশ বহনকারীদেরকে', 'বান্দা ও রাসূল'], not: ['সাল্লাল্লাহু', 'বার', 'আবূ দাউদ', 'বুখারী'] },
  ms: { start: 'Ya Allah, sesungguhnya aku di waktu pagi ini mempersaksikan', has: ['memikul ‘Arsy-Mu', 'hamba dan utusan-Mu'], not: ['Arys', 'empat kali', 'Abu Daud', 'petang'] },
  de: { start: 'O Allāh, wahrlich habe ich den Morgen erreicht', has: ['Deinen Thron tragenden', 'Dein Diener und Gesandter'], not: ['viermal', 'Abū Dawūd', 'Abend'] },
  es: { start: 'Oh Allah, ciertamente amanezco y atestiguo', has: ['sostienen Tu Trono', 'siervo y mensajero'], not: ['Muhammmad', '4 veces', 'Abu Dawúd', 'tarde'] },
  id: { start: 'Ya Allah, sesungguhnya aku di waktu pagi bersaksi', has: ['memikul ‘Arasy-Mu', 'hamba dan utusan-Mu'], not: ['Dibaca', 'Abu Dawud', 'sore'] },
};

console.log('================ 1. Card 08 = morning-008 — ALL 9 translations (dua meaning only) ================');
ok(card8 && card8.id === 'morning-008', "AzkarMorning[7].id === 'morning-008' (actual id confirmed)");
ok(card8.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card8['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 150, `Card 08 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 08 ${l}: starts with the dua opening («${a.start.slice(0, 26)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 08 ${l}: Throne-bearers + servant/Messenger anchors present (full dua)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 08 ${l}: NO repeat/reference/evening/transliteration/honorific leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 08 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 08 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved incidental-cleaning decisions ================');
ok(!/ﷺ/.test(card8.translation_ur), 'ur: honorific «ﷺ» dropped from the translation');
ok(!/সাল্লাল্লাহু/.test(card8.translation_bn), 'bn: honorific «সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম» dropped');
ok(card8.translation_es.includes('Muhammad') && !card8.translation_es.includes('Muhammmad'), 'es: «Muhammmad» corrected to «Muhammad»');
ok(card8.translation_ms.includes('‘Arsy-Mu') && !card8.translation_ms.includes('Arys'), 'ms: «‘Arys»→«‘Arsy»');
ok(!/ou au soir/.test(card8.translation_fr) && card8.translation_fr.includes('Me voici au matin'), 'fr: «[ou au soir]» dropped, morning form kept');

console.log('\n================ 3. NO ar + virtue stays in the separate Arabic field ================');
ok(card8.translation_ar === undefined, 'Card 08 has NO translation_ar (Arabic UI shows no block)');
const b8 = dataSrc.slice(dataSrc.indexOf("id: 'morning-008'"), dataSrc.indexOf("id: 'morning-009'"));
ok(!/translation_ar\s*:/.test(b8), 'morning-008 source block declares NO translation_ar field');
ok(b8.includes('من قالها حين يصبح أو يمسي أربع مرات أعتقه الله من النار'), 'virtue (Arabic) untouched — kept OUTSIDE the translations');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 8 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 10, `morning region translation_${l}: EXACTLY 10`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 08 Arabic text/source/repeat byte-identical ================');
ok(b8.includes("text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.'"), 'Card 08 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b8.includes("source: { ref: 'رواه أبو داود', sourceUrl: null }"), "Card 08 source stays «رواه أبو داود»");
ok(b8.includes('repeat: 4,') && b8.includes("repeatLabel: { ar: 'أربع مرات', en: 'four times' }"), "Card 08 repeat stays 4 («أربع مرات»)");
ok(b8.includes("title: { ar: 'اللهم إني أصبحت أشهدك'"), 'Card 08 title untouched');

console.log('\n================ 6. Cards 01-07 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 7; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations`);
ok(M[6].translation_en.startsWith('O Allah, You are my Lord'), 'Card 07 (Sayyid al-Istighfar) en intact');
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

console.log('\n================ 8. NO runtime external translation requests ================');
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|akuislam\.com|kuranlasifa\.com/i.test(srvSrc) && !/qurani\.io|hisnmuslim\.com|islamhouse\.com|akuislam\.com|kuranlasifa\.com/i.test(appSrc), 'no source URLs (domains) in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=18/.test(htmlSrc), 'index.html azkar-data.js?v=18 (later card bumped it)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v514'/.test(swSrc), "sw.js CACHE_VERSION 'v514'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
