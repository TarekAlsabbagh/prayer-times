// Smoke — AZKAR-MORNING-DUA-CARD-14-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-014 («اللهم عالم الغيب والشهادة…أو أجره إلى مسلم», Tirmidhi, ×1, virtue/auth/note ALL null) gains ALL 9
// static translations of the dua MEANING ONLY — no repeat label, reference, virtue, hadith story, isnad/narrator,
// transliteration, footnotes/digits, explanation, or evening variant. Dhikr = Hisn al-Muslim 85 / Tirmidhi 3392 (+Abu
// Dawud 5067). ALL nine keep the final clause meaning («or bringing it upon a Muslim»). Sources: en/es/id/bn=HisnMuslim
// ch.27 #85; fr=Dar Al Athar #85; ur=IslamHouse (Adhkar as-Sabah wal-Masa, dua-only — raw hadith + HadeethEnc DROP the
// clause); tr=Islamiokul #85 (keeps «bir müslümana»); ms=e-JAUHAR (verbatim, rough phrasing); de=Islamische Datenbank
// #85 (glosses kept). fr keeps bracketed «(Et je me réfugie…)»; de keeps «(Herr)/(Satan)»; en shirk-gloss stripped.
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
const card14 = M[13];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  "en": "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil, and from committing wrong against my soul or bringing such upon another Muslim.",
  "fr": "Ô Seigneur ! Toi qui connais parfaitement l'invisible et le visible ! Créateur des cieux et de la terre ! Maître et Possesseur de toute chose ! J'atteste qu'il n'est d'autre divinité méritant l'adoration en dehors de Toi. Je me réfugie auprès de Toi contre le mal de mon âme, contre celui du diable et de son incitation à T'attribuer un associé. (Et je me réfugie auprès de Toi) contre tout méfait que je pourrais perpétrer envers moi-même ou envers autrui.",
  "ur": "اے اللہ! اے غیب اور حاضر کے جاننے والے، آسمانوں اور زمین کو پیدا کرنے والے، ہر چیز کے پروردگار اور مالک! میں شہادت دیتا ہوں کہ تیرے علاوہ کوئی عبادت کے لائق نہیں، میں تیری پناہ مانگتا ہوں اپنے نفس کے شر سے اور شیطان کے شر اور اس کے شرک سے، اور اس بات سے کہ میں اپنے نفس پر برائی کا ارتکاب کروں یا کسی مسلمان کے لئے برائی کا سبب بنوں۔",
  "tr": "Gizli ve âşikarı bilen, göklerin ve yerin yaratıcısı Allahım! Her şeyin Rabbi ve sahibi! Senden başka hakkıyla ibâdete lâyık hiçbir ilah olmadığına şehâdet ederim. Nefsimin şerrinden sana sığınırım. Şeytan ve şirkinin şerrinden, nefsime kötülük etmekten veya o kötülüğü bir müslümana götürmekten sana sığınırım.",
  "bn": "হে আল্লাহ! হে গায়েব ও উপস্থিতের জ্ঞানী, হে আসমানসমূহ ও যমীনের স্রষ্টা, হে সব কিছুর রব্ব ও মালিক! আমি সাক্ষ্য দিচ্ছি যে, আপনি ছাড়া আর কোনো হক্ব ইলাহ নেই। আমি আপনার কাছে আশ্রয় চাই আমার আত্মার অনিষ্ট থেকে, শয়তানের অনিষ্টতা থেকে ও তার শির্ক বা তার ফাঁদ থেকে, আমার নিজের উপর কোনো অনিষ্ট করা, অথবা কোনো মুসলিমের দিকে তা টেনে নেওয়া থেকে।",
  "ms": "Ya Allah, Tuhan yang mengetahui perkara ghaib dan nyata, Pencipta langit dan bumi, Tuhan setiap sesuatu dan Pemiliknya, aku mengaku bahawa Tiada Tuhan yang berhak disembah melainkan Engkau, aku berlindung denganMu daripada kejahatan diriku dan kejahatan syaitan dan sekutunya dan aku berlindung dan tidak pada berusaha untuk melakukan kejahatan terhadap diriku atau aku mendorong orang Islam melakukannya.",
  "de": "O Allāh, Kenner des Verborgenen und des Offenkundigen, Erschaffer der Himmel und der Erde, Rabb (Herr) und Besitzer aller Dinge. Ich bezeuge, dass es keinen wahren Ilāh (Anbetungswürdigen) außer Dir gibt. Ich nehme Zuflucht bei Dir vor meiner üblen Seele und vor dem Übel des Šaiṭān (Satan) und dessen Širk (Beigesellung), und dass ich Unrecht gegen meine Seele oder gegen einen anderen Muslim handele.",
  "es": "Oh Allah, Conocedor de lo oculto y lo manifiesto, Creador de los cielos y de la tierra, Señor de los ángeles y de todas las cosas, atestiguo que no hay divinidad sino Tu, me refugio en Ti del mal de mi mismo, del mal del Sheitan y de su idolatría, y de cometer mal en contra de mi mismo, o en contra de un musulmán.",
  "id": "Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata. Wahai Tuhan Pencipta langit dan bumi, Tuhan segala sesuatu yang merajainya. Aku bersaksi bahwa tiada tuhan yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan bala tentaranya, atau aku menjalankan kejelekan terhadap diriku atau mendorong orang Islam padanya."
};
const A = {
  "en": {
    "has": [
      "Knower of the unseen",
      "bringing such upon another Muslim"
    ],
    "not": [
      "Tirmidhi",
      "Abu Dawud",
      "Ahmad",
      "Abu Bakr",
      "Abu Hurayrah",
      "Whoever",
      "to associate others"
    ]
  },
  "fr": {
    "has": [
      "Toi qui connais",
      "envers autrui"
    ],
    "not": [
      "Tirmidhi",
      "Rapporté",
      "Abou Bakr",
      "une fois",
      "Ahmad"
    ]
  },
  "ur": {
    "has": [
      "اے غیب اور حاضر",
      "کسی مسلمان کے لئے برائی کا سبب بنوں"
    ],
    "not": [
      "ترمذی",
      "ابو داود",
      "ابوہریرہ",
      "ابوبکر",
      "ایک بار"
    ]
  },
  "tr": {
    "has": [
      "Gizli ve âşikarı bilen",
      "bir müslümana götürmekten"
    ],
    "not": [
      "Tirmiz",
      "Ebu Davud",
      "Ebu Bekir",
      "bir kez",
      "bir defa",
      "[121]",
      "85-"
    ]
  },
  "bn": {
    "has": [
      "গায়েব ও উপস্থিতের",
      "মুসলিমের দিকে তা টেনে নেওয়া"
    ],
    "not": [
      "তিরমিযী",
      "আবূ দাউদ",
      "ইবন মাজাহ",
      "একবার"
    ]
  },
  "ms": {
    "has": [
      "Tuhan yang mengetahui perkara ghaib",
      "mendorong orang Islam melakukannya"
    ],
    "not": [
      "Tirmizi",
      "Abu Dawud",
      "Sahih",
      "sekali"
    ]
  },
  "de": {
    "has": [
      "Kenner des Verborgenen",
      "gegen einen anderen Muslim handele"
    ],
    "not": [
      "Tirmiḏ",
      "Abū Dawūd",
      "Ṣaḥīḥ",
      "einmal",
      "Ahmad"
    ]
  },
  "es": {
    "has": [
      "Conocedor de lo oculto",
      "en contra de un musulmán"
    ],
    "not": [
      "Tirmidhi",
      "Abu Daw",
      "Ibn May",
      "una vez",
      "Ahmad"
    ]
  },
  "id": {
    "has": [
      "Yang Maha Mengetahui yang ghaib",
      "mendorong orang Islam padanya"
    ],
    "not": [
      "Tirmidzi",
      "Abu Dawud",
      "sekali",
      "Ahmad"
    ]
  }
};

console.log('================ 1. Card 14 = morning-014 — ALL 9 translations (dua meaning only) ================');
ok(card14 && card14.id === 'morning-014', "AzkarMorning[13].id === 'morning-014' (actual id confirmed)");
ok(card14.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card14['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 100, `Card 14 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 14 ${l}: EXACTLY matches approved source string`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 14 ${l}: opening→last-clause anchors present (full dua kept)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 14 ${l}: NO reference/isnad/repeat/story/gloss leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 14 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 14 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved source/cleaning decisions ================');
ok(card14.translation_ms.includes('dan tidak pada berusaha') && card14.translation_ms.endsWith('mendorong orang Islam melakukannya.'), 'ms: e-JAUHAR verbatim (rough phrasing kept), last clause intact');
ok(card14.translation_fr.includes('(Et je me réfugie auprès de Toi)') && card14.translation_fr.endsWith('envers autrui.'), 'fr: Dar Al Athar #85; bracketed «(Et je me réfugie…)» kept');
ok(card14.translation_de.includes('(Herr)') && card14.translation_de.includes('(Satan)') && !/\(Satan\)\s*[0-9]/.test(card14.translation_de), 'de: translator glosses kept; footnote digit stripped');
ok(card14.translation_ur.startsWith('اے اللہ! اے غیب') && !card14.translation_ur.includes('ابوہریرہ') && !card14.translation_ur.includes('ترمذی'), 'ur: IslamHouse dua-only (no isnad/reference; NOT raw hadith)');
ok(card14.translation_tr.includes('bir müslümana götürmekten') && card14.translation_tr.endsWith('sığınırım.') && !card14.translation_tr.includes('[121]'), 'tr: Islamiokul #85 keeps «bir müslümana»; footnote stripped');
ok(card14.translation_es.includes('ángeles') && card14.translation_es.includes('idolatría'), 'es: HisnMuslim verbatim quirks kept («ángeles»/«idolatría»)');
ok(card14.translation_id.includes('bala tentaranya'), 'id: HisnMuslim verbatim kept («bala tentaranya»)');
ok(card14.translation_en.endsWith('bringing such upon another Muslim.') && !card14.translation_en.includes('to associate others'), 'en: HisnMuslim #85; appended shirk-gloss stripped');
ok(card14.translation_bn.endsWith('তা টেনে নেওয়া থেকে।'), 'bn: HisnMuslim full ending (item-number + footnote stripped)');

console.log('\n================ 3. NO ar + virtue/authenticity/authenticityNote ALL null ================');
ok(card14.translation_ar === undefined, 'Card 14 has NO translation_ar');
const b14 = dataSrc.slice(dataSrc.indexOf("id: 'morning-014'"), dataSrc.indexOf("id: 'morning-015'"));
ok(!/translation_ar\s*:/.test(b14), 'morning-014 source block declares NO translation_ar field');
ok(/virtue: null,/.test(b14) && /authenticity: null,/.test(b14) && /authenticityNote: null/.test(b14), 'Card 14 virtue + authenticity + authenticityNote all stay null');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 14 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 14 Arabic text/source/repeat byte-identical ================');
ok(b14.includes("text: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.'"), 'Card 14 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b14.includes("source: { ref: 'رواه الترمذي', sourceUrl: null }"), "Card 14 source stays «رواه الترمذي»");
ok(b14.includes('repeat: 1,') && b14.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 14 repeat stays 1 («مرة واحدة»)");
ok(b14.includes("title: { ar: 'اللهم عالم الغيب والشهادة'"), 'Card 14 title untouched');

console.log('\n================ 6. Cards 01-13 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 13; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[12].translation_en.startsWith('O Allah, I ask You for pardon'), 'Card 13 en intact');
ok(M[11].translation_en.startsWith('Allah is Sufficient for me'), 'Card 12 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 12, `evening region translation_${l} still EXACTLY 12`);
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
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com|hadiskutuphanesi|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my|islamiokul\.com|islamicurdubooks\.com|duam\.org/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|daralathar\.fr|islamiokul\.com|moe-dl\.edu\.my|islamicurdubooks\.com|hadeethenc\.com/i.test(srvSrc) && !/islamhouse\.com|islamiokul\.com|hadeethenc\.com/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=44/.test(htmlSrc), 'index.html azkar-data.js?v=44 (Card 14 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v542'/.test(swSrc), "sw.js CACHE_VERSION 'v542'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
