// Smoke — AZKAR-MORNING-DUA-CARD-15-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-015 («بسم الله الذي لا يضر مع اسمه شيء … وهو السميع العليم», Ibn Majah, ×3, virtue NON-null separate field)
// gains ALL 9 static translations of the dua MEANING ONLY — no repeat label, reference, virtue, hadith story,
// isnad, transliteration, footnotes/digits, explanation, evening variant. Dhikr = Hisn al-Muslim 86 / Ibn Majah
// 3869 (+Abu Dawud 5088, Tirmidhi 3388). ALL nine keep BOTH divine names (As-Samee/All-Hearing + Al-Alim/All-
// Knowing). en/id/tr=HadeethEnc hadith 6093 (HisnMuslim en mistranslates As-Samee as "All-Seeing", HisnMuslim id
// drops it, Islamiokul tr has no standalone meaning); es/bn=HisnMuslim ch.27; fr=Dar Al Athar; ms=e-JAUHAR;
// de=Islamische Datenbank ch.27; ur=IslamHouse. The virtue («من قالها ثلاثًا…لم يضره شيء») stays OUT of every block.
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
const card15 = M[14];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  "en": "In the name of Allah, with Whose name nothing in the earth or the heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
  "es": "En el nombre de Allah el cual en su nombre nada perjudica, asi en la tierra como en los cielos, Él es quien todo lo oye el Omnisapiente.",
  "id": "Dengan nama Allah yang tidak akan berbahaya sesuatu pun di bumi dan di langit bersama nama-Nya, dan Dia Maha Mendengar lagi Maha Mengetahui.",
  "bn": "আল্লাহর নামে; যাঁর নামের সাথে আসমান ও যমীনে কোনো কিছুই ক্ষতি করতে পারে না। আর তিনি সর্বশ্রোতা, মহাজ্ঞানী।",
  "fr": "Au Nom d'Allah dont la mention empêche toute chose de nuire, tant sur la terre que dans le ciel, et Il est l'Audient et l'Omniscient.",
  "tr": "Yerde de gökte de O'nun ismiyle birlikte hiçbir şeyin zarar veremeyeceği Allah'ın adıyla. O, her şeyi işiten ve bilendir.",
  "de": "Im Namen Allāhs, mit Dessen Namen kann nichts auf der Erde oder im Himmel Schaden zufügen. Er ist der Allhörende, der Allwissende.",
  "ms": "Dengan Nama Allah yang tidak memberi mudharat bersama namaNya oleh sesuatu di bumi dan tidak juga di langit, Dialah Yang Maha Mendengar lagi Maha Mengetahui.",
  "ur": "اس اللہ کے نام کے ساتھ جس کے نام کے ساتھ زمین وآسمان میں کوئی چیز نقصان نہیں پہنچاتی، اور وہ خوب سننے والا بڑا جاننے والا ہے۔"
};
const A = {
  "en": {
    "has": [
      "In the name of Allah, with Whose name",
      "the All-Hearing, the All-Knowing"
    ],
    "not": [
      "three times",
      "nothing will harm",
      "Whoever",
      "Ibn Majah",
      "Abu Dawud",
      "Tirmidhi",
      "All-Seeing"
    ]
  },
  "fr": {
    "has": [
      "Au Nom d'Allah dont la mention",
      "l'Audient et l'Omniscient"
    ],
    "not": [
      "trois fois",
      "Rien ne peut nuire",
      "Abu Dawud"
    ]
  },
  "ur": {
    "has": [
      "اس اللہ کے نام کے ساتھ",
      "سننے والا بڑا جاننے والا"
    ],
    "not": [
      "تین مرتبہ",
      "ابوداود",
      "ابن ماجہ",
      "["
    ]
  },
  "tr": {
    "has": [
      "Yerde de gökte de",
      "işiten ve bilendir"
    ],
    "not": [
      "üç defa",
      "okursa",
      "musibet",
      "İbn"
    ]
  },
  "bn": {
    "has": [
      "আল্লাহর নামে",
      "সর্বশ্রোতা, মহাজ্ঞানী"
    ],
    "not": [
      "৩ বার",
      "৮৬",
      "তিরমিযী",
      "আবূ দাউদ"
    ]
  },
  "ms": {
    "has": [
      "Dengan Nama Allah yang tidak memberi mudharat",
      "Maha Mendengar lagi Maha Mengetahui"
    ],
    "not": [
      "Tiga kali",
      "Sesiapa",
      "memudharatkan",
      "Abu Dawud"
    ]
  },
  "de": {
    "has": [
      "Im Namen Allāhs, mit Dessen Namen",
      "der Allhörende, der Allwissende"
    ],
    "not": [
      "dreimal",
      "rezitiert",
      "Unglück",
      "Ibn Māǧa"
    ]
  },
  "es": {
    "has": [
      "En el nombre de Allah",
      "todo lo oye el Omnisapiente"
    ],
    "not": [
      "veces",
      "Quien lo diga",
      "Ibn May"
    ]
  },
  "id": {
    "has": [
      "Dengan nama Allah",
      "Maha Mendengar lagi Maha Mengetahui"
    ],
    "not": [
      "tiga kali",
      "Barangsiapa",
      "keburukan",
      "Ibnu Majah"
    ]
  }
};
// per-lang pair of divine names that MUST both appear (As-Samee + Al-Alim)
const NAMES = {
  en: ['All-Hearing', 'All-Knowing'], es: ['todo lo oye', 'Omnisapiente'],
  id: ['Maha Mendengar', 'Maha Mengetahui'], bn: ['সর্বশ্রোতা', 'মহাজ্ঞানী'],
  fr: ["l'Audient", "l'Omniscient"], tr: ['işiten', 'bilendir'],
  de: ['Allhörende', 'Allwissende'], ms: ['Maha Mendengar', 'Maha Mengetahui'],
  ur: ['سننے والا', 'جاننے والا'],
};

console.log('================ 1. Card 15 = morning-015 — ALL 9 translations (dua meaning only) ================');
ok(card15 && card15.id === 'morning-015', "AzkarMorning[14].id === 'morning-015' (actual id confirmed)");
ok(card15.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card15['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 40, `Card 15 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 15 ${l}: EXACTLY matches approved source string`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 15 ${l}: opening + closing anchors present`);
  ok(NAMES[l].every((x) => N(t).includes(N(x))), `Card 15 ${l}: keeps BOTH divine names (As-Samee + Al-Alim)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 15 ${l}: NO repeat/virtue/reference/wrong-name leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 15 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 15 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved source decisions ================');
ok(card15.translation_en.includes('All-Hearing') && !card15.translation_en.includes('All-Seeing'), 'en: HadeethEnc 6093 — As-Samee = All-Hearing (NOT the HisnMuslim "All-Seeing" error)');
ok(card15.translation_id.includes('Maha Mendengar'), 'id: HadeethEnc 6093 — keeps Maha Mendengar (HisnMuslim id drops it)');
ok(card15.translation_tr.includes('işiten') && card15.translation_tr.includes('bilendir'), 'tr: HadeethEnc 6093 — standalone meaning (Islamiokul lacks it)');
ok(card15.translation_es.includes('todo lo oye') && card15.translation_es.includes('Omnisapiente'), 'es: HisnMuslim #86 verbatim');
ok(card15.translation_bn.endsWith('সর্বশ্রোতা, মহাজ্ঞানী।'), 'bn: HisnMuslim #86 full ending');
ok(card15.translation_fr.startsWith("Au Nom d'Allah") && card15.translation_fr.endsWith("l'Omniscient."), 'fr: Dar Al Athar #86');
ok(card15.translation_de.endsWith('der Allwissende.') && !/\(/.test(card15.translation_de), 'de: Islamische Datenbank #86 (clean, no glosses)');
ok(card15.translation_ms.includes('mudharat') && card15.translation_ms.endsWith('Maha Mengetahui.'), 'ms: e-JAUHAR #86');
ok(card15.translation_ur.startsWith('اس اللہ کے نام') && !card15.translation_ur.includes('ابوداود'), 'ur: IslamHouse (no reference)');

console.log('\n================ 3. NO ar + virtue stays a SEPARATE non-null field (out of blocks) ================');
ok(card15.translation_ar === undefined, 'Card 15 has NO translation_ar');
const b15 = dataSrc.slice(dataSrc.indexOf("id: 'morning-015'"), dataSrc.indexOf("id: 'morning-016'"));
ok(!/translation_ar\s*:/.test(b15), 'morning-015 source block declares NO translation_ar field');
ok(card15.virtue && card15.virtue.ar === 'من قالها ثلاثًا إذا أصبح وثلاثًا إذا أمسى لم يضره شيء.', 'Card 15 virtue kept as separate NON-null field');
ok(ALL9.every((l) => !/لم يضره|nothing will harm|Rien ne peut nuire|memudharatkan|Unglück|keburukan|no le/i.test(card15['translation_' + l])), 'virtue text NOT leaked into any translation block');
ok(/authenticity: null/.test(b15) && /authenticityNote: null/.test(b15), 'authenticity + authenticityNote stay null');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 15 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 18, `morning region translation_${l}: EXACTLY 18`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 15 Arabic text/source/repeat byte-identical ================');
ok(b15.includes("text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ، وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.'"), 'Card 15 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b15.includes("source: { ref: 'رواه ابن ماجه', sourceUrl: null }"), "Card 15 source stays «رواه ابن ماجه»");
ok(b15.includes('repeat: 3,') && b15.includes("repeatLabel: { ar: 'ثلاث مرات', en: 'three times' }"), "Card 15 repeat stays 3 («ثلاث مرات»)");
ok(b15.includes("title: { ar: 'بسم الله الذي لا يضر مع اسمه شيء'"), 'Card 15 title untouched');

console.log('\n================ 6. Cards 01-14 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 14; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[13].translation_en.startsWith('O Allah, Knower of the unseen'), 'Card 14 en intact');
ok(M[12].translation_en.startsWith('O Allah, I ask You for pardon'), 'Card 13 en intact');
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
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamiokul\.com|moe-dl\.edu\.my|duaa\.my/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hisnmuslim\.com|islamhouse\.com|daralathar\.fr|hadeethenc\.com|islamiokul\.com/i.test(srvSrc) && !/hadeethenc\.com|islamhouse\.com/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=26/.test(htmlSrc), 'index.html azkar-data.js?v=26 (Card 15 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v522'/.test(swSrc), "sw.js CACHE_VERSION 'v519'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
