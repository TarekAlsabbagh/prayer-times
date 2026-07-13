// Smoke — AZKAR-MORNING-DUA-CARD-17-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-017 («يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين», Tirmidhi, ×1, virtue null)
// gains ALL 9 static translations of the dua MEANING ONLY — no repeat label, reference, hadith story, the advice-to-
// Fatimah narration, ruling, isnad, whole-dhikr transliteration, footnotes/digits, explanation, evening variant. It
// is a du-a with NO salawat in the matn. Dhikr = Hisn al-Muslim 88 / Al-Hakim 1/545 / Sahih at-Targhib 1/273 (also
// Tirmidhi 3524 — supports the card source «رواه الترمذي»; source stays unchanged, virtue stays null). ALL nine keep
// the three meanings: Ya Hayyu Ya Qayyum + by Your mercy I seek relief + set right all my affairs and do not leave me
// to myself for the blink of an eye. Sources: en/es/id/bn=HisnMuslim ch.27 88; fr=Dar Al Athar 88; ur=Mukhtasar Hisn
// al-Muslim 99 (Islamic Urdu Books); tr=Turkish Hisn al-Muslim ch.27 (Ya Hayy/Ya Kayyum = divine-names invocation,
// NOT Islamiokul which has a different Ya Hayy Ya Kayyum «asking Paradise» dua); de=Islamische Datenbank 88. Approved:
// ms «biarkankan»->«biarkan» typo-fix; glosses kept es (un instante) / de (bei Dir) / id (semua urusan).
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
const card17 = M[16];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  "en": "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
  "fr": "Ô Vivant ! Ô Toi qui es le Seul à être imploré pour ce que nous désirons ! C'est à Ta miséricorde que j'en appelle. Améliore ma situation et ne me livre pas à moi-même, ne serait-ce qu'un seul instant.",
  "ur": "اے ہمیشہ زندہ رہنے والے، اے قائم رکھنے والے، تیری رحمت کے ساتھ ہی میں مدد مانگتا ہوں، میری مکمل حالت درست فرما دے، اور مجھے لحظہ بھر بھی میرے نفس کے سپرد نہ کر۔",
  "tr": "Ya Hayy, Ya Kayyûm! Senin rahmetinle yardım dilerim. Bütün işlerimi düzelt ve göz açıp kapayınca kadar -bile olsa- beni nefsime bırakma.",
  "bn": "হে চিরঞ্জীব, হে চিরস্থায়ী! আমি আপনার রহমতের অসীলায় আপনার কাছে উদ্ধার কামনা করি, আপনি আমার সার্বিক অবস্থা সংশোধন করে দিন, আর আমাকে আমার নিজের কাছে নিমেষের জন্যও সোপর্দ করবেন না।",
  "ms": "Wahai tuhan yang Tetap Hidup, Yang Kekal memerintah selama-lamanya, dengan rahmatMu aku memohon pertolongan. Perelokkanlah bagiku segala urusanku dan janganlah Engkau biarkan nasibku ditentukan oleh diriku sendiri walaupun sekadar sekelip mata.",
  "de": "O Lebendiger und Beständiger. Ich suche Zuflucht (bei Dir) mit Deiner Barmherzigkeit. Verbessere all meine Angelegenheiten. Überlass mir keinen Augenblick eine meiner Angelegenheiten.",
  "es": "Oh Viviente, Oh Subsistente, en Tu misericordia busco asistencia, rectifica todos mis asuntos y no me dejes librado a mi mismo, ni siquiera por un pestañeo (un instante).",
  "id": "Wahai Yang Maha Hidup dan Maha Terjaga, dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan Engkau limpahkan (semua urusan) terhadap diriku walau sekejap mata."
};
const A = {
  en: { has: ["O Ever Living, O Self-Subsisting", "blink of an eye"], not: ["Hakim", "Tirmidhi", "Fatimah", "Whoever", "three times", "once", "peace be upon"] },
  fr: { has: ["Ô Vivant", "un seul instant"], not: ["Hakim", "Fatima", "une fois", "088"] },
  ur: { has: ["اے ہمیشہ زندہ رہنے والے", "نفس کے سپرد نہ کر"], not: ["حاکم", "المستدرک", "[", "ترمذی"] },
  tr: { has: ["Ya Hayy, Ya Kayyûm", "nefsime bırakma"], not: ["Hakim", "cennet", "cehennem", "bir kere"] },
  bn: { has: ["হে চিরঞ্জীব", "সোপর্দ করবেন না"], not: ["হাকেম", "৮৮", "একবার"] },
  ms: { has: ["Wahai tuhan yang Tetap Hidup", "sekelip mata"], not: ["Hakim", "biarkankan", "sekali"] },
  de: { has: ["O Lebendiger und Beständiger", "keinen Augenblick"], not: ["Hakim", "einmal", "Dhahabi"] },
  es: { has: ["Oh Viviente, Oh Subsistente", "un pestañeo"], not: ["Hakim", "Ahmad", "An-Nasai", "una vez"] },
  id: { has: ["Wahai Yang Maha Hidup dan Maha Terjaga", "sekejap mata"], not: ["Hakim", "Nasai", "sekali"] },
};
// the THREE meanings that MUST all appear
const MEAN = {
  en: ["O Ever Living", "by Your mercy I seek assistance", "blink of an eye"],
  fr: ["Ô Vivant", "Ta miséricorde", "un seul instant"],
  ur: ["زندہ رہنے والے", "تیری رحمت", "نفس کے سپرد نہ کر"],
  tr: ["Ya Hayy, Ya Kayyûm", "rahmetinle yardım", "nefsime bırakma"],
  bn: ["চিরঞ্জীব", "রহমতের", "সোপর্দ করবেন না"],
  ms: ["Tetap Hidup", "rahmatMu aku memohon", "sekelip mata"],
  de: ["Lebendiger und Beständiger", "Barmherzigkeit", "Angelegenheiten"],
  es: ["Viviente, Oh Subsistente", "misericordia busco", "pestañeo"],
  id: ["Maha Hidup dan Maha Terjaga", "rahmat-Mu aku minta", "sekejap mata"],
};

console.log('================ 1. Card 17 = morning-017 — ALL 9 translations (dua meaning only) ================');
ok(card17 && card17.id === 'morning-017', "AzkarMorning[16].id === 'morning-017' (actual id confirmed)");
ok(card17.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card17['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 40, `Card 17 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 17 ${l}: EXACTLY matches approved source string`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 17 ${l}: opening + closing anchors present`);
  ok(MEAN[l].every((x) => N(t).includes(N(x))), `Card 17 ${l}: preserves THREE meanings (Ya Hayyu Ya Qayyum + mercy/relief + affairs/blink)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 17 ${l}: NO reference/ruling/isnad/repeat/wrong-dua leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 17 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 17 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Du-a has NO salawat / no ruling / no Fatimah narration ================');
for (const l of ALL9) ok(!/ﷺ|صلى الله|sallallahu|peace be upon|pbuh|Fatimah|Fatima|فاطمة|hasan|sahih|صحیح|المستدرک|1\/545|3524|Targhib|Terğib|Targhib/i.test(card17['translation_' + l]), `${l}: no salawat/ruling/Fatimah/reference`);

console.log('\n================ 3. Approved source decisions ================');
ok(card17.translation_tr.includes('Ya Hayy, Ya Kayyûm'), 'tr: keeps «Ya Hayy, Ya Kayyûm» (divine-names invocation, not whole-dhikr transliteration)');
ok(!/cennet|cehennem/.test(card17.translation_tr), 'tr: NOT the Islamiokul «asking Paradise/Hell» dua');
ok(card17.translation_ms.includes('Engkau biarkan nasibku') && !card17.translation_ms.includes('biarkankan'), 'ms: source typo «biarkankan» corrected to «biarkan»');
ok(card17.translation_es.includes('(un instante)'), 'es: keeps gloss «(un instante)»');
ok(card17.translation_de.includes('(bei Dir)'), 'de: keeps gloss «(bei Dir)»');
ok(card17.translation_id.includes('(semua urusan)'), 'id: keeps gloss «(semua urusan)»');
ok(card17.translation_ur.startsWith('اے ہمیشہ زندہ رہنے والے') && !card17.translation_ur.includes('المستدرک'), 'ur: Mukhtasar Hisn al-Muslim #99 (dua text only, no reference)');
ok(card17.translation_en.startsWith('O Ever Living, O Self-Subsisting') && !/Ya hayyu|birahmatika/i.test(card17.translation_en), 'en: HisnMuslim (English meaning only, no transliteration prefix)');

console.log('\n================ 4. NO ar + source/repeat/virtue unchanged ================');
ok(card17.translation_ar === undefined, 'Card 17 has NO translation_ar');
const b17 = dataSrc.slice(dataSrc.indexOf("id: 'morning-017'"), dataSrc.indexOf("id: 'morning-018'"));
ok(!/translation_ar\s*:/.test(b17), 'morning-017 source block declares NO translation_ar field');
ok(b17.includes("text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.'"), 'Card 17 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b17.includes("source: { ref: 'رواه الترمذي', sourceUrl: null }"), "Card 17 source stays «رواه الترمذي» (NOT changed to Hakim)");
ok(b17.includes('repeat: 1,') && b17.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 17 repeat stays 1 («مرة واحدة»)");
ok(/id: 'morning-017'[\s\S]*?virtue: null/.test(b17), 'Card 17 virtue stays null');
ok(b17.includes("title: { ar: 'يا حي يا قيوم'"), 'Card 17 title untouched');

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 17 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 19, `morning region translation_${l}: EXACTLY 19`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-16 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 16; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[15].translation_en.startsWith('I am pleased with Allah as a Lord'), 'Card 16 en intact');
ok(M[14].translation_en.includes('the All-Hearing, the All-Knowing'), 'Card 15 en intact');
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
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamiokul\.com|islamicurdubooks\.com|hadiskutuphanesi|moe-dl\.edu\.my|duaa\.my/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hisnmuslim\.com|islamhouse\.com|daralathar\.fr|hadeethenc\.com|islamicurdubooks\.com/i.test(srvSrc) && !/hadeethenc\.com|islamhouse\.com/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=27/.test(htmlSrc), 'index.html azkar-data.js?v=27 (Card 17 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v523'/.test(swSrc), "sw.js CACHE_VERSION 'v523'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
