// Smoke — AZKAR-MORNING-DUA-CARD-16-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-016 («رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد صلى الله عليه وسلم نبيًا», Ahmad, ×3, virtue/promise NON-null
// separate field) gains ALL 9 static translations of the dua MEANING ONLY — no repeat label, reference, virtue/promise,
// hadith story, isnad, transliteration, footnotes/digits, explanation, evening variant. Dhikr = Hisn al-Muslim 87 /
// Ibn Majah 3870 (+Ahmad 4/337, Nasai Amal 4, Ibn as-Sunni 68, Abu Dawud 5072, Tirmidhi 3389). ALL nine preserve the
// THREE meanings: Allah as Lord + Islam as religion + Muhammad as Prophet (Nabi, NEVER Messenger/Rasul). Sources:
// en/es/id/bn=HisnMuslim ch.27; fr=Dar Al Athar 87; tr=Turkish Hisn al-Muslim ch.27 87 (NOT Islamiokul, which has only
// the adhan Rasul form; NOT HadeethEnc, which lacks the morning/evening Nabi version); ms=e-JAUHAR 87 (lslam->Islam);
// de=Islamische Datenbank ch.27 87; ur=IslamHouse. Salawat kept where the source has it (ur/tr/bn/ms/de/es) and NOT
// added where the source omits it (en/fr/id). The virtue/promise stays in the separate virtue field.
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
const card16 = M[15];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  "en": "I am pleased with Allah as a Lord, and Islam as a religion and Muhammad as a Prophet.",
  "fr": "Je reconnais Allah en tant que Seigneur, l'Islam en tant que religion et Muhammad en tant que Prophète.",
  "ur": "میں راضی ہو گیا اللہ کے رب ہونے پر اور اسلام کو دین اختیار کرنے پر اور محمدﷺ کو نبی تسلیم کرنے پر۔",
  "tr": "Rab olarak Allah'tan, dîn olarak İslam'dan, nebi olarak Muhammed -sallallahu aleyhi ve sellem-'den râzı oldum.",
  "bn": "আল্লাহকে রব, ইসলামকে দীন ও মুহাম্মাদ সাল্লাল্লাহু আলাইহি ওয়াসাল্লামকে নবীরূপে গ্রহণ করে আমি সন্তুষ্ট।",
  "ms": "Aku redha Allah sebagai Tuhan, Islam sebagai agama dan Muhammad saw sebagai Nabi.",
  "de": "Ich bin mit Allāh als Rabb (Herr), dem Islām als Dīn (Glauben) und Muḥammad, Allāh segne ihn gebe ihm Heil, als Prophet zufrieden.",
  "es": "Me complazco de Allah como Señor, del Islam como religión, y de Muhámmad (la paz y las bendiciones de Allah sean con él) como Profeta.",
  "id": "Aku rela Allah sebagai Tuhanku, Islam sebagai agamaku dan Muhammad sebagai nabiku."
};
// per-lang anchors: has = opening + prophet-clause; not = repeat/virtue/promise/story/reference/wrong-name leak
const A = {
  en: { has: ["I am pleased with Allah as a Lord", "Muhammad as a Prophet"], not: ["three times", "Whoever", "Judgment", "Resurrection", "Tirmidhi", "Messenger", "peace be upon him"] },
  fr: { has: ["Je reconnais Allah en tant que Seigneur", "en tant que Prophète"], not: ["trois fois", "Résurrection", "se doit", "Ahmad", "Messager", "paix"] },
  ur: { has: ["اللہ کے رب ہونے پر", "کو نبی تسلیم کرنے"], not: ["تین مرتبہ", "ترمذی", "[", "رسول"] },
  tr: { has: ["Rab olarak Allah'tan", "nebi olarak Muhammed"], not: ["üç kere", "kıyamet", "Rasul", "resul", "İbn"] },
  bn: { has: ["আল্লাহকে রব", "নবীরূপে গ্রহণ করে আমি সন্তুষ্ট"], not: ["৩ বার", "কিয়ামত", "তিরমিযী", "৮৭", "রাসূল"] },
  ms: { has: ["Aku redha Allah sebagai Tuhan", "sebagai Nabi"], not: ["Tiga kali", "kiamat", "Sesiapa", "rasul", "lslam", "utusan"] },
  de: { has: ["Ich bin mit Allāh als Rabb", "als Prophet zufrieden"], not: ["dreimal", "Auferstehung", "Gesandter", "wer dies"] },
  es: { has: ["Me complazco de Allah como Señor", "como Profeta"], not: ["veces", "Resurrección", "Quien lo diga", "Mensajero"] },
  id: { has: ["Aku rela Allah sebagai Tuhanku", "sebagai nabiku"], not: ["tiga kali", "kiamat", "Siapa", "rasul", "-(ku)", "utusan"] },
};
// the THREE meanings that MUST all appear (Allah as Lord + Islam as religion + Muhammad as Prophet)
const MEAN = {
  en: ["Allah as a Lord", "Islam as a religion", "as a Prophet"],
  fr: ["Allah en tant que Seigneur", "l'Islam en tant que religion", "en tant que Prophète"],
  ur: ["اللہ کے رب", "اسلام کو دین", "کو نبی"],
  tr: ["Rab olarak Allah", "dîn olarak İslam", "nebi olarak Muhammed"],
  bn: ["আল্লাহকে রব", "ইসলামকে দীন", "নবীরূপে"],
  ms: ["Allah sebagai Tuhan", "Islam sebagai agama", "sebagai Nabi"],
  de: ["Allāh als Rabb", "Islām als Dīn", "als Prophet"],
  es: ["Allah como Señor", "Islam como religión", "como Profeta"],
  id: ["Allah sebagai Tuhanku", "Islam sebagai agamaku", "sebagai nabiku"],
};

console.log('================ 1. Card 16 = morning-016 — ALL 9 translations (dua meaning only) ================');
ok(card16 && card16.id === 'morning-016', "AzkarMorning[15].id === 'morning-016' (actual id confirmed)");
ok(card16.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card16['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 40, `Card 16 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 16 ${l}: EXACTLY matches approved source string`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 16 ${l}: opening + Prophet-clause anchors present`);
  ok(MEAN[l].every((x) => N(t).includes(N(x))), `Card 16 ${l}: preserves THREE meanings (Lord + religion + Prophet)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 16 ${l}: NO repeat/virtue/promise/reference/wrong-name leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 16 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 16 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Muhammad = PROPHET/NABI everywhere — never Messenger/Rasul ================');
for (const l of ALL9) ok(!/messenger|rasul|resul|utusan|mensajero|gesandter|messager|رسول|রাসূল/i.test(card16['translation_' + l]), `${l}: no Messenger/Rasul wording (Prophet/Nabi only)`);

console.log('\n================ 3. Salawat — kept where source has it, NOT added where source omits it ================');
ok(!/ﷺ|صلى الله|peace be upon|pbuh|sallallahu|blessings|salla /i.test(card16.translation_en), 'en OMITS salawat (source omits — not added)');
ok(!/ﷺ|sallallahu|paix|bénédiction|salut sur|salla /i.test(card16.translation_fr), 'fr OMITS salawat (source omits — not added)');
ok(!/ﷺ|sallallahu|shalallahu| saw |semoga/i.test(card16.translation_id), 'id OMITS salawat (source omits — not added)');
ok(card16.translation_ur.includes('ﷺ'), 'ur KEEPS salawat «ﷺ» (source has it)');
ok(card16.translation_tr.includes('sallallahu aleyhi ve sellem'), 'tr KEEPS salawat «-sallallahu aleyhi ve sellem-» (source has it)');
ok(card16.translation_bn.includes('সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম'), 'bn KEEPS salawat (source has it)');
ok(card16.translation_ms.includes(' saw '), 'ms KEEPS salawat «saw» (source has it)');
ok(card16.translation_de.includes('Allāh segne ihn gebe ihm Heil'), 'de KEEPS salawat (source has it)');
ok(card16.translation_es.includes('la paz y las bendiciones de Allah sean con él'), 'es KEEPS salawat (source has it)');

console.log('\n================ 4. Approved source decisions ================');
ok(card16.translation_en.startsWith('I am pleased with Allah as a Lord') && card16.translation_en.endsWith('as a Prophet.'), 'en: HisnMuslim ch.27');
ok(card16.translation_fr.startsWith('Je reconnais Allah en tant que Seigneur') && !/Ahmad|trois fois/.test(card16.translation_fr), 'fr: Dar Al Athar #87 (no reference/repeat)');
ok(card16.translation_ur.startsWith('میں راضی ہو گیا اللہ کے رب') && !card16.translation_ur.includes('ترمذی'), 'ur: IslamHouse (no reference/repeat)');
ok(card16.translation_tr.includes('nebi olarak Muhammed') && !/Rasul|resul/i.test(card16.translation_tr), 'tr: Turkish Hisn al-Muslim ch.27 #87 — NABI (NOT Islamiokul adhan Rasul, NOT HadeethEnc)');
ok(card16.translation_bn.endsWith('গ্রহণ করে আমি সন্তুষ্ট।'), 'bn: HisnMuslim #87 full ending');
ok(card16.translation_ms.includes('Islam sebagai agama') && !card16.translation_ms.includes('lslam'), 'ms: e-JAUHAR #87 — source typo lslam corrected to Islam');
ok(card16.translation_de.endsWith('als Prophet zufrieden.'), 'de: Islamische Datenbank #87');
ok(card16.translation_es.endsWith('como Profeta.') && !card16.translation_es.includes('Quien lo diga'), 'es: HisnMuslim (no virtue)');
ok(card16.translation_id.includes('Tuhanku') && card16.translation_id.includes('agamaku') && card16.translation_id.includes('nabiku') && !card16.translation_id.includes('-(ku)'), 'id: HisnMuslim — -(ku) notation resolved to natural Tuhanku/agamaku/nabiku');

console.log('\n================ 5. NO ar + virtue/promise stays a SEPARATE non-null field (out of blocks) ================');
ok(card16.translation_ar === undefined, 'Card 16 has NO translation_ar');
const b16 = dataSrc.slice(dataSrc.indexOf("id: 'morning-016'"), dataSrc.indexOf("id: 'morning-017'"));
ok(!/translation_ar\s*:/.test(b16), 'morning-016 source block declares NO translation_ar field');
ok(card16.virtue && card16.virtue.ar === 'من قالها ثلاثًا حين يصبح وثلاثًا حين يمسي كان حقًا على الله أن يرضيه يوم القيامة.', 'Card 16 virtue/promise kept as separate NON-null field');
ok(ALL9.every((l) => !/يرضيه يوم القيامة|Judgment|Résurrection|Resurrección|Auferstehung|hari kiamat|kıyamet|কিয়ামত/i.test(card16['translation_' + l])), 'virtue/promise (Judgment Day) NOT leaked into any translation block');
ok(/authenticity: null/.test(b16) && /authenticityNote: null/.test(b16), 'authenticity + authenticityNote stay null');

console.log('\n================ 6. Per-lang MORNING totals — UNIFORM 16 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 7. Card 16 Arabic text/source/repeat byte-identical ================');
ok(b16.includes("text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.'"), 'Card 16 Arabic text byte-identical (full literal, tashkeel intact, keeps صلى الله عليه وسلم)');
ok(b16.includes("source: { ref: 'رواه أحمد', sourceUrl: null }"), "Card 16 source stays «رواه أحمد»");
ok(b16.includes('repeat: 3,') && b16.includes("repeatLabel: { ar: 'ثلاث مرات', en: 'three times' }"), "Card 16 repeat stays 3 («ثلاث مرات»)");
ok(b16.includes("title: { ar: 'رضيت بالله ربًا'"), 'Card 16 title untouched');

console.log('\n================ 8. Cards 01-15 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 15; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[14].translation_en.includes('the All-Hearing, the All-Knowing'), 'Card 15 en intact');
ok(M[13].translation_en.startsWith('O Allah, Knower of the unseen'), 'Card 14 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 7, `evening region translation_${l} still EXACTLY 7`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 9. Renderers untouched — generic read, no fallback, ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), 'server ar-gate intact');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 10. NO runtime external translation requests / source URLs ================');
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamiokul\.com|moe-dl\.edu\.my|duaa\.my|hadiskutuphanesi|islamway\.net|eraykitap/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hisnmuslim\.com|islamhouse\.com|daralathar\.fr|hadeethenc\.com|islamiokul\.com/i.test(srvSrc) && !/hadeethenc\.com|islamhouse\.com/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 11. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=39/.test(htmlSrc), 'index.html azkar-data.js?v=39 (Card 16 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=838/.test(htmlSrc), 'index.html app.js?v=838 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v536'/.test(swSrc), "sw.js CACHE_VERSION 'v536'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
