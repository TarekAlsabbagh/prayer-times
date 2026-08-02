// Smoke — AZKAR-MORNING-DUA-CARD-19-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-019 («أصبحنا على فطرة الإسلام، وعلى كلمة الإخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا
// إبراهيم، حنيفًا مسلمًا وما كان من المشركين.», Ahmad, ×1, virtue null) gains ALL 9 static MORNING translations —
// meaning only, no repeat label, reference, isnad, story, transliteration, footnotes/digits, explanation, or evening
// variant. MORNING form only (asbahna) — NOT evening (amsayna). Dhikr = Hisn al-Muslim 90 / Ahmad 3/406-7 / An-Nasa'i /
// Ibn as-Sunni. ALL nine keep the SIX meanings: fitrat-al-islam + kalimat-al-ikhlas + din-Nabina-Muhammad +
// millat-Ibrahim + hanifan-musliman + wa-ma-kana-min-al-mushrikin. Salawat ﷺ per source: KEPT in fr/ur/tr/bn/es/id/ms;
// OMITTED (faithful) in en/de. Sources: en=HisnMuslim; fr=Dar Al Athar 90 ([ou au soir] removed); ur=IslamHouse 827527
// (evening note + [احمد] removed); tr=Ilme Davet (sabaha eristik, no glosses); bn=HisnMuslim 90 (footnote digits removed);
// ms=Mufti Wilayah/JAKIM ((kalimah syahadah) removed; source wording landasan/yang-juga kept, NOT reworded);
// de=printed German edition (all six incl. muslim; salawat omitted); es=La Fortaleza 93 (Al-Lah kept); id=muslim.or.id
// (plain Allah, keeps fitrah). HadeethEnc NOT used (dead-end for this hadith).
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
const card19 = M[18];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "We rise upon the fitrah of Islam, and the word of pure faith, and upon the religion of our Prophet Muhammad and upon the religion of our forefather Ibraheem, who was a Muslim and of true faith and was not of those who associate others with Allah.",
  fr: "Nous voici au matin, et en nous se trouve la nature première qui est l'Islam, en nous, la parole du monothéisme ; nous sommes dans la religion de notre Prophète Muhammad (صلى الله عليه وسلم) et sur la voie de notre père Abraham qui vouait son culte exclusivement à Allah, soumis à Lui, et n'était point du nombre des associateurs.",
  ur: "ہم نے فطرت اسلام اور کلمہ اخلاص اور نبی محمدﷺ کے دین اور اپنے باپ ابراہیم علیہ السلام کی ملت پر صبح کی جو یک طرفہ خالص مسلمان تھے، اور وہ مشرکوں میں سے نہیں تھے۔",
  tr: "İslâm fıtratı, ihlas kelimesi ve Nebîmiz Muhammed -sallallahu aleyhi ve sellem-'in dini üzere; hanif ve müslüman olan, müşriklerden olmayan babamız İbrahim'in milleti üzere sabaha eriştik.",
  bn: "আমরা সকালে উপনীত হয়েছি ইসলামের ফিত্বরাতের ওপর, নিষ্ঠাপূর্ণ বাণী (তাওহীদ) এর ওপর, আমাদের নবী মুহাম্মাদ সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম-এর দীনের ওপর, আর আমাদের পিতা ইব্রাহীম আলাইহিস সালাম-এর মিল্লাতের ওপর—যিনি ছিলেন একনিষ্ঠ মুসলিম এবং যিনি মুশরিকদের অন্তর্ভুক্ত ছিলেন না।",
  ms: "Kami hayati pagi ini di atas landasan fitrah dan perwatakan Islam, berpegang kepada kalimah ikhlas, dan berpegang kepada agama Nabi kami Muhammad SAW yang juga agama ayah kami Ibrahim, yang berada di atas jalan yang lurus, muslim dan tidak tergolong dari kalangan orang-orang musyrik.",
  de: "Wir sind mit der Fitrah (natürliche Veranlagung) des Islam in den Morgen eingetreten, und mit dem Wort der Aufrichtigkeit und mit der Religion unseres Propheten Muhammad und der Religion unseres Vaters Ibrahim, der ein Anhänger des rechten Glaubens war, einer, der sich Allah ergeben hat, und er gehörte nicht zu den Götzendienern.",
  es: "Amanecimos en la naturaleza del Islam, en la palabra del monoteísmo, en la religión de nuestro profeta Mujammad (La paz y las bendiciones de Al-Lah sean con él) en la comunidad de Abraham monoteístas, musulmán y no era de los idolatras",
  id: "Kami berada di waktu pagi di atas fitrah Islam, di atas kalimat ikhlas, di atas agama Nabi kami Muhammad ﷺ, dan di atas millah (ajaran) bapak kami Ibrahim yang lurus, seorang muslim, dan beliau tidak termasuk dari golongan orang-orang musyrik.",
};
// Six meanings per language: [fitrah-islam, kalimat-ikhlas, din-Nabi-Muhammad, millat-Ibrahim, hanif+muslim, not-mushrik]
const SIX = {
  en: ["fitrah of Islam", "word of pure faith", "our Prophet Muhammad", "our forefather Ibraheem", "was a Muslim", "associate others with Allah"],
  fr: ["nature première qui est l'Islam", "parole du monothéisme", "Prophète Muhammad", "notre père Abraham", "soumis à Lui", "associateurs"],
  ur: ["فطرت اسلام", "کلمہ اخلاص", "محمدﷺ کے دین", "ابراہیم علیہ السلام کی ملت", "خالص مسلمان", "مشرکوں میں سے نہیں"],
  tr: ["İslâm fıtratı", "ihlas kelimesi", "Muhammed", "İbrahim'in milleti", "müslüman olan", "müşriklerden olmayan"],
  bn: ["ইসলামের ফিত্বরাত", "নিষ্ঠাপূর্ণ বাণী", "মুহাম্মাদ", "ইব্রাহীম", "একনিষ্ঠ মুসলিম", "মুশরিকদের অন্তর্ভুক্ত ছিলেন না"],
  ms: ["fitrah dan perwatakan Islam", "kalimah ikhlas", "Nabi kami Muhammad", "ayah kami Ibrahim", "muslim", "musyrik"],
  de: ["Fitrah", "Wort der Aufrichtigkeit", "Propheten Muhammad", "Vaters Ibrahim", "sich Allah ergeben hat", "Götzendienern"],
  es: ["naturaleza del Islam", "palabra del monoteísmo", "profeta Mujammad", "comunidad de Abraham", "musulmán", "idolatras"],
  id: ["fitrah Islam", "kalimat ikhlas", "Nabi kami Muhammad", "bapak kami Ibrahim", "seorang muslim", "musyrik"],
};
const MORN = { en: "We rise upon", fr: "Nous voici au matin", ur: "صبح کی", tr: "sabaha eriştik", bn: "সকালে উপনীত", ms: "hayati pagi ini", de: "in den Morgen eingetreten", es: "Amanecimos", id: "berada di waktu pagi" };
// Salawat per source: KEEP => must contain marker; OMIT => must NOT contain any tasliya form
const SALAWAT_KEEP = { fr: "(صلى الله عليه وسلم)", ur: "محمدﷺ", tr: "sallallahu aleyhi ve sellem", bn: "সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম", es: "La paz y las bendiciones", id: "ﷺ", ms: "SAW" };
const SALAWAT_OMIT = ['en', 'de'];

console.log('================ 1. Card 19 = morning-019 — ALL 9 MORNING translations, SIX meanings ================');
ok(card19 && card19.id === 'morning-019', "AzkarMorning[18].id === 'morning-019'");
ok(card19.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card19['translation_' + l];
  ok(typeof t === 'string' && t.length > 60, `Card 19 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 19 ${l}: EXACTLY matches approved source string`);
  ok(SIX[l].every((x) => N(t).includes(N(x))), `Card 19 ${l}: ALL SIX meanings preserved`);
  ok(N(t).includes(N(MORN[l])), `Card 19 ${l}: MORNING form ("${MORN[l]}")`);
  ok(!/[\p{Nd}]/u.test(t), `Card 19 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 19 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. NO evening wording (morning-only extraction) ================');
for (const l of ALL9) {
  const t = card19['translation_' + l];
  ok(!/this night|tonight|au soir|ce soir|akşam|amsayna|petang|malam|Nacht|Abend|esta noche|anochec|أمسينا|رات|শام|সন্ধ্যা/i.test(t), `${l}: NO evening wording`);
}

console.log('\n================ 3. Salawat KEEP/OMIT per source (faithful, no add/remove) ================');
for (const l of Object.keys(SALAWAT_KEEP)) ok(N(card19['translation_' + l]).includes(N(SALAWAT_KEEP[l])), `${l}: salawat KEPT per source ("${SALAWAT_KEEP[l]}")`);
for (const l of SALAWAT_OMIT) ok(!/peace and blessings|be upon him|ﷺ|صلى الله|sallallahu|segne ihn|Frieden auf ihm|Segen und/i.test(card19['translation_' + l]), `${l}: salawat OMITTED per source (none added)`);

console.log('\n================ 3b. Approved source-cleaning decisions ================');
ok(card19.translation_es.includes('naturaleza del Islam') && card19.translation_es.includes('Al-Lah') && !card19.translation_es.includes('93.') && !card19.translation_es.includes('anochecer'), 'es: Al-Lah kept; item no. + evening note absent');
ok(card19.translation_id.includes('fitrah Islam') && !card19.translation_id.includes('SWT') && !card19.translation_id.includes('memegang agama Islam'), 'id: keeps «fitrah» (NOT «memegang agama Islam»); no «SWT»');
ok(card19.translation_ms.includes('kalimah ikhlas') && !card19.translation_ms.includes('(kalimah syahadah)'), 'ms: gloss «(kalimah syahadah)» removed');
ok(card19.translation_ms.includes('landasan fitrah dan perwatakan Islam') && card19.translation_ms.includes('yang juga agama ayah kami') && card19.translation_ms.includes('Nabi kami Muhammad SAW'), 'ms: source wording (landasan/yang juga/possessives) NOT reworded');
ok(card19.translation_tr.includes('sabaha eriştik') && !card19.translation_tr.includes('(hak dîni)') && !card19.translation_tr.includes('(kelime-i şehâdet)') && !/akşam/.test(card19.translation_tr), 'tr: İlme Davet morning «sabaha eriştik», NO explanatory glosses');
ok(!card19.translation_fr.includes('[ou') && !/\bau soir\b/.test(card19.translation_fr), 'fr: evening bracket «[ou au soir]» removed');
ok(card19.translation_ur.includes('صبح کی') && !card19.translation_ur.includes('اسناد') && !card19.translation_ur.includes('[احمد]') && !card19.translation_ur.includes('['), 'ur: IslamHouse 827527 — evening note + [احمد] removed, no isnad');
ok(card19.translation_de.includes('Anhänger des rechten Glaubens') && card19.translation_de.includes('sich Allah ergeben hat') && card19.translation_de.includes('Götzendienern') && !card19.translation_de.includes('rechtgläubig'), 'de: printed edition keeps ALL SIX incl. «muslim» (einer, der sich Allah ergeben hat); NOT the rejected «rechtgläubig»-only Isla-DB text');
ok(card19.translation_en.includes('fitrah of Islam') && card19.translation_en.includes('was a Muslim'), 'en: HisnMuslim keeps fitrah + Muslim');
// no reference / hadith tokens inside any block (exact-match already guards; defensive)
for (const l of ALL9) ok(!/رواه|Ahmad|An-Nasa|Ibn as-Sunni|Hisn al|صحیح|Musnad|15360|3096/.test(card19['translation_' + l]), `${l}: no reference/isnad token inside block`);

console.log('\n================ 4. NO ar + Arabic text / source / repeat / virtue unchanged ================');
ok(card19.translation_ar === undefined, 'Card 19 has NO translation_ar');
const b19 = dataSrc.slice(dataSrc.indexOf("id: 'morning-019'"), dataSrc.indexOf("id: 'morning-020'"));
ok(!/translation_ar\s*:/.test(b19), 'morning-019 source block declares NO translation_ar');
ok(b19.includes("text: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.'"), 'Card 19 Arabic text byte-identical');
ok(b19.includes("source: { ref: 'رواه أحمد', sourceUrl: null }"), "Card 19 source stays «رواه أحمد»");
ok(b19.includes('repeat: 1,') && b19.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 19 repeat stays 1 («مرة واحدة»)");
ok(/id: 'morning-019'[\s\S]*?virtue: null/.test(b19), 'Card 19 virtue stays null');

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 19; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-18 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 18; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[17].translation_en.startsWith('We have reached the morning'), 'Card 18 en intact');
ok(M[16].translation_en.startsWith('O Ever Living'), 'Card 17 en intact');
ok(M[15].translation_en.startsWith('I am pleased with Allah as a Lord'), 'Card 16 en intact');
ok(M[18].translation_en.startsWith('We rise upon the fitrah'), 'Card 19 en is the new fitrah dua');
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
ok(!/sunnah\.com|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamicurdubooks\.com|ilmedavetdernegi\.org|way-to-allah\.com|zulkiflialbakri\.com|ecentral\.my|zikir\.my|muslim\.or\.id|archive\.org|detik\.com|hadiskutuphanesi/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hadeethenc\.com/i.test(dataSrc), 'HadeethEnc NOT referenced (dead-end for this card)');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=44/.test(htmlSrc), 'index.html azkar-data.js?v=44 (Card 19 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v542'/.test(swSrc), "sw.js CACHE_VERSION 'v542'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
