// Smoke — AZKAR-MORNING-DUA-CARD-18-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-018 («أصبحنا وأصبح الملك لله رب العالمين… خير هذا اليوم فتحه ونصره ونوره وبركته وهداه…», Abu Dawud, ×1,
// virtue null) gains ALL 9 static MORNING translations — meaning only, no repeat label, reference, isnad, story,
// transliteration, footnotes/digits, explanation, evening variant, or evening-instruction footnote. MORNING form only
// (asbahna/this day) — NOT evening (amsayna/this night). Dhikr = Hisn al-Muslim 89 / Abu Dawud 4/322 (Abu Malik al-
// Ashari); NOT the longer tahlil hadith (Muslim: …la ilaha illallah…) so HadeethEnc is NOT used. ALL nine keep the FIVE
// goodness elements: fath+nasr+nur+baraka+huda. Sources: en/bn=HisnMuslim 89; fr=Dar Al Athar 89 ([ou au soir]
// removed); de=Islamische Datenbank 89; ms=e-JAUHAR ((petang)+instruction removed, typos fixed); ur=Mukhtasar Hisn 100;
// tr=Turkish Hisnul Muslim (Ilme Davet); es=La Fortaleza del Musulman 91 (su victoria not su fin; Al-Lah kept);
// id=Indonesian dhikr source (Abu Malik/Abu Dawud), full opening + five elements (SWT normalized to Allah).
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
const card18 = M[17];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  "en": "We have reached the morning and at this very time all sovereignty belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day, its triumphs and its victories, its light and its blessings and its guidance, and I take refuge in You from the evil of this day and the evil that follows it.",
  "fr": "Nous voilà au matin et le règne appartient à Allah, le Seigneur de l'univers. Ô Seigneur ! Je Te demande le bien de ce jour : ce qu'il contient comme conquêtes, victoires, lumière, bénédiction et guidée. Je me mets sous Ta protection contre le mal de ce jour et le mal qui vient après lui.",
  "ur": "ہم نے صبح کی اور اللہ رب العالمین کے لئے (بادشاہت) نے بھی صبح کی، اے اللہ! میں تجھ سے اس دن کی بھلائی، فتح، نصرت، نور، برکت اور اس کی ہدایت کا سوال کرتا ہوں اور اس پر جو شر ہے اور اس کے بعد جو شر ہے اس سے تیری پناہ میں آتا ہوں۔",
  "tr": "Mülk, Âlemlerin Rabbi Allah'ın olduğu halde sabahladık. Allahım! Senden bu günün hayrını, fethini, zaferini, nûrunu, bereketini ve hidâyetini dilerim. Onda ve sonrasındaki şerden sana sığınırım.",
  "bn": "আমরা সকালে উপনীত হয়েছি, অনুরূপ যাবতীয় রাজত্বও সকালে উপনীত হয়েছে সৃষ্টিকুলের রব্ব আল্লাহর জন্য। হে আল্লাহ! আমি আপনার কাছে কামনা করি এই দিনের কল্যাণ: বিজয়, সাহায্য, নূর, রবকত ও হেদায়াত। আর আমি আপনার কাছে আশ্রয় চাই এ দিনের এবং এ দিনের পরের অকল্যাণ থেকে।",
  "ms": "Kami hayati pagi kami dan pagi yang penuh Kekuasaan bagi Allah tuhan sekalian alam. Ya Allah, aku memohon kepadaMu kebaikan hari ini, pembukaannya, pertolongannya, cahayanya, berkatnya dan petunjuknya. Aku berlindung denganMu daripada kejahatan hari ini dan yang selepasnya.",
  "de": "Wahrlich haben wir den Morgen erreicht, und die Herrschaft an diesem Morgen gehört Allāh, dem Rabb (Herr) der Welten. O Allāh, ich bitte Dich um das Gute dieses Tages, seinen Sieg, seine Hilfe (Unterstützung), sein Licht, seine Segnung und seine Rechtleitung. Ich suche Zuflucht bei Dir vor dem Übel an ihm (diesem Tag) und alldem, was danach kommt.",
  "es": "Amanecimos y amaneció el reino para Al-Lah Señor del universo, ¡Oh Al-Lah! Te pido lo mejor de este día: su triunfo, su victoria, su luz, su bendición y su guía; me protejo en Ti del mal que haya en él y después de él.",
  "id": "Kami telah berada di pagi hari dan kekuasaan ini hanyalah milik Allah, Tuhan semesta Alam. Ya Allah aku memohon kebaikan hari ini kepada-Mu, kemenangan, pertolongan, cahaya, keberkahan, dan petunjuknya. Aku juga berlindung kepada-Mu dari keburukannya dan keburukan sesudahnya."
};
const FIVE = {
  en: ["its triumphs", "its victories", "its light", "its blessings", "its guidance"],
  fr: ["conquêtes", "victoires", "lumière", "bénédiction", "guidée"],
  ur: ["فتح", "نصرت", "نور", "برکت", "ہدایت"],
  tr: ["fethini", "zaferini", "nûrunu", "bereketini", "hidâyetini"],
  bn: ["বিজয়", "সাহায্য", "নূর", "রবকত", "হেদায়াত"],
  ms: ["pembukaannya", "pertolongannya", "cahayanya", "berkatnya", "petunjuknya"],
  de: ["Sieg", "Hilfe", "Licht", "Segnung", "Rechtleitung"],
  es: ["su triunfo", "su victoria", "su luz", "su bendición", "su guía"],
  id: ["kemenangan", "pertolongan", "cahaya", "keberkahan", "petunjuknya"],
};
const MORN = { en: "reached the morning", fr: "au matin", ur: "صبح", tr: "sabahladık", bn: "সকালে", ms: "pagi", de: "Morgen", es: "Amanecimos", id: "pagi hari" };
const DAY = { en: "this day", fr: "ce jour", ur: "اس دن", tr: "bu gün", bn: "এই দিন", ms: "hari ini", de: "dieses Tages", es: "este día", id: "hari ini" };

console.log('================ 1. Card 18 = morning-018 — ALL 9 MORNING translations ================');
ok(card18 && card18.id === 'morning-018', "AzkarMorning[17].id === 'morning-018'");
ok(card18.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card18['translation_' + l];
  ok(typeof t === 'string' && t.length > 60, `Card 18 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 18 ${l}: EXACTLY matches approved source string`);
  ok(FIVE[l].every((x) => N(t).includes(N(x))), `Card 18 ${l}: ALL FIVE goodness elements (fath+nasr+nur+baraka+huda)`);
  ok(N(t).includes(N(MORN[l])) && N(t).includes(N(DAY[l])), `Card 18 ${l}: MORNING form + "this day"`);
  ok(!/[\p{Nd}]/u.test(t), `Card 18 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 18 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. NO evening wording + NO long tahlil hadith ================');
for (const l of ALL9) {
  const t = card18['translation_' + l];
  ok(!/this night|tonight|au soir|ce soir|akşam|gece|amsayna|petang|malam|Nacht|Abend|esta noche|al anochecer|أمسينا|رات|شام/i.test(t), `${l}: NO evening wording`);
  ok(!/la ilaha illallah|there is no god but Allah|لا إله إلا الله|il n'y a de/i.test(t), `${l}: NOT the long tahlil hadith`);
}

console.log('\n================ 3. Approved source decisions ================');
ok(card18.translation_es.includes('su victoria') && !card18.translation_es.includes('su fin'), 'es: keeps «su victoria» for nasr (NOT «su fin»)');
ok(card18.translation_es.includes('Al-Lah') && !card18.translation_es.includes('91.') && !card18.translation_es.includes('anochecer'), 'es: «Al-Lah» kept; item no. + evening note removed');
ok(card18.translation_id.includes('milik Allah, Tuhan semesta') && !card18.translation_id.includes('SWT'), 'id: honorific «SWT» normalized to «Allah»');
ok(card18.translation_id.includes('Kami telah berada di pagi hari') && card18.translation_id.includes('petunjuknya'), 'id: full opening + five elements (Detik/Abu Dawud)');
ok(card18.translation_tr.includes('fethini') && card18.translation_tr.includes('zaferini') && !/\(ilim ve amelde|\(kolay helal/.test(card18.translation_tr), 'tr: İlme Davet — explicit fethini+zaferini, NO explanatory gloss');
ok(!card18.translation_fr.includes('[ou') && !/\bsoir\b/.test(card18.translation_fr), 'fr: evening bracket [ou au soir] removed');
ok(card18.translation_ms.includes('pembukaannya') && !card18.translation_ms.includes('(petang)') && !card18.translation_ms.includes('pembukaaannya') && !card18.translation_ms.includes('petolongannya'), 'ms: (petang) removed; typos pembukaannya/pertolongannya fixed');
ok(card18.translation_ur.startsWith('ہم نے صبح کی') && !card18.translation_ur.includes('اسناده') && !card18.translation_ur.includes('['), 'ur: Mukhtasar #100 (no isnad note)');

console.log('\n================ 4. NO ar + source/repeat/virtue unchanged ================');
ok(card18.translation_ar === undefined, 'Card 18 has NO translation_ar');
const b18 = dataSrc.slice(dataSrc.indexOf("id: 'morning-018'"), dataSrc.indexOf("id: 'morning-019'"));
ok(!/translation_ar\s*:/.test(b18), 'morning-018 source block declares NO translation_ar');
ok(b18.includes("text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ، فَتْحَهُ وَنَصْرَهُ وَنُورَهُ وَبَرَكَتَهُ وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ.'"), 'Card 18 Arabic text byte-identical');
ok(b18.includes("source: { ref: 'رواه أبو داود', sourceUrl: null }"), "Card 18 source stays «رواه أبو داود»");
ok(b18.includes('repeat: 1,') && b18.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 18 repeat stays 1 («مرة واحدة»)");
ok(/id: 'morning-018'[\s\S]*?virtue: null/.test(b18), 'Card 18 virtue stays null');

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 18; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-17 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 17; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[16].translation_en.startsWith('O Ever Living'), 'Card 17 en intact');
ok(M[15].translation_en.startsWith('I am pleased with Allah as a Lord'), 'Card 16 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 22, `evening region translation_${l} still EXACTLY 22`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation requests / source URLs (HadeethEnc not used) ================');
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamicurdubooks\.com|ilmedavetdernegi\.org|way-to-allah\.com|detik\.com|hadiskutuphanesi/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hadeethenc\.com/i.test(dataSrc), 'HadeethEnc NOT referenced (dead-end for this card)');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=54/.test(htmlSrc), 'index.html azkar-data.js?v=54 (Card 18 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v552'/.test(swSrc), "sw.js CACHE_VERSION 'v552'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
