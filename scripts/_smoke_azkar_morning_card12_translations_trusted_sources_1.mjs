// Smoke — AZKAR-MORNING-DUA-CARD-12-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-012 («حسبي الله لا إله إلا هو…رب العرش العظيم», Ibn As-Sunni, ×7) gains ALL 9 static translations of the
// DUA MEANING ONLY — no repeat label, no reference, no virtue, NO hadith-grade/weak note, no transliteration, no
// footnotes/digits, no explanation, no evening variant. Dhikr text = Quran 9:129; Hisn al-Muslim 83.
// Sources: en/es/id/bn=HisnMuslim ch.27; fr=Dar Al Athar ch.27; ur=IslamHouse (al-Qahtani, item 17);
// tr=Turkish Hisnul Müslim (Islamiokul); ms=e-JAUHAR (MOE Malaysia); de=Islamische Datenbank.
// Card KEEPS its Arabic virtue + authenticityNote (weak_hadith) as SEPARATE fields — never inside a translation block.
// ar never renders a block. Cards 01-11 + evening + prayer untouched.
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
const card12 = M[11];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang: opening (start) + sufficiency+throne anchors (has) + forbidden leaks (not: reference/repeat/weak-note/translit/evening)
const A = {
  en: { start: 'Allah is Sufficient for me', has: ['none has the right to be worshipped except Him', 'Lord of the exalted throne'], not: ['seven times', 'Sunni', 'Abu Daw', 'weak', 'evening', 'Hasbiya'] },
  fr: { start: 'Allah me suffit', has: ["il n'y a de divinité que Lui", 'Seigneur du Trône immense'], not: ['sept fois', 'Sunni', 'Abu D', 'Ibn', 'faible', 'soir', 'Hasbiya'] },
  ur: { start: 'میرے لیے اللہ کافی ہے', has: ['کوئی معبود برحق نہیں', 'بڑے عرش کا مالک'], not: ['سات بار', 'ابن السني', 'ابو داود', 'ضعیف', 'شام'] },
  tr: { start: 'Yeterli bana Allah', has: ['ibâdete lâyık hiçbir ilah yoktur', "arş'ın Rabbidir"], not: ['yedi defa', 'yedi kez', 'Sünni', 'Ebu Davud', 'zayıf', 'akşam'] },
  bn: { start: 'আল্লাহই আমার জন্য যথেষ্ট', has: ['কোনো হক্ব ইলাহ নেই', 'মহান আরশের রব্ব'], not: ['সাত বার', 'ইবনুস সুন্নী', 'আবূ দাউদ', 'দুর্বল', 'সন্ধ্যা'] },
  ms: { start: 'Cukuplah Allah (sebagai pelindung) bagiku', has: ['tiada Tuhan yang berhak disembah', 'Arasy yang agung'], not: ['tujuh kali', 'Ibn As-Sunni', 'Abu Dawud', 'petang', 'daif', 'Hasbiya'] },
  de: { start: 'Allāh genügt mir', has: ['keinen wahren Ilāh', 'des gewaltigen Thrones'], not: ['siebenmal', 'Sunni', 'Abu Daw', 'schwach', 'Abend', 'Hasbiya'] },
  es: { start: 'Allah me es suficiente', has: ['no hay divinidad excepto Él', 'Señor del Trono Magnífico'], not: ['siete veces', 'Sunni', 'Abu D', 'débil', 'tarde', 'Hasbiya'] },
  id: { start: 'Cukup bagiku Allah (sebagai pelindung)', has: ['tiada Tuhan (yang berhak disembah) kecuali Dia', "'Arasy yang Agung"], not: ['tujuh kali', 'Ibnu Sunni', 'Abu Dawud', 'lemah', 'petang', 'Hasbiya'] },
};

console.log('================ 1. Card 12 = morning-012 — ALL 9 translations (dua meaning only) ================');
ok(card12 && card12.id === 'morning-012', "AzkarMorning[11].id === 'morning-012' (actual id confirmed)");
ok(card12.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card12['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 40, `Card 12 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 12 ${l}: starts with the dua opening («${a.start.slice(0, 22)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 12 ${l}: sufficiency + throne anchors present (full dhikr)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 12 ${l}: NO reference/repeat/weak-note/transliteration/evening leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 12 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 12 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved source/cleaning decisions ================');
ok(card12.translation_en === 'Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.', 'en: HisnMuslim verbatim, no stray trailing quote');
ok(card12.translation_fr === "Allah me suffit, il n'y a de divinité que Lui, c'est en Lui que je place ma confiance et Il est le Seigneur du Trône immense.", 'fr: Dar Al Athar p2898 approved text verbatim');
ok(card12.translation_es === 'Allah me es suficiente, no hay divinidad excepto Él, en Él confío que es el Señor del Trono Magnífico.', 'es: HisnMuslim verbatim «en Él confío que es el Señor» kept');
ok(card12.translation_ur.includes('اور وہ بڑے عرش') && !card12.translation_ur.includes('اور وه بڑے'), 'ur: heh normalized «وہ» (Arabic «وه» absent)');
ok(card12.translation_ur.endsWith('عرش کا مالک ہے۔'), 'ur: IslamHouse (al-Qahtani #17) full ending «عرش کا مالک ہے۔»');
ok(card12.translation_de.includes('(Anbetungswürdigen)') && card12.translation_de.includes('(Herr)'), 'de: source glosses «(Anbetungswürdigen)»/«(Herr)» kept');
ok(card12.translation_id.includes('(sebagai pelindung)') && card12.translation_id.includes('(yang berhak disembah)'), 'id: source glosses kept');
ok(card12.translation_ms.includes('(sebagai pelindung)') && card12.translation_ms.endsWith('Arasy yang agung.'), 'ms: e-JAUHAR verbatim, gloss «(sebagai pelindung)» kept');
ok(card12.translation_tr.endsWith("arş'ın Rabbidir."), 'tr: Islamiokul (#84) full ending');
ok(card12.translation_bn.endsWith('মহান আরশের রব্ব।'), 'bn: HisnMuslim full ending «মহান আরশের রব্ব।»');

console.log('\n================ 3. NO ar + virtue & authenticityNote stay OUT of every translation block ================');
ok(card12.translation_ar === undefined, 'Card 12 has NO translation_ar (Arabic UI shows no block)');
const b12 = dataSrc.slice(dataSrc.indexOf("id: 'morning-012'"), dataSrc.indexOf("id: 'morning-013'"));
ok(!/translation_ar\s*:/.test(b12), 'morning-012 source block declares NO translation_ar field');
for (const l of ALL9) {
  const t = card12['translation_' + l] || '';
  ok(!t.includes('من قالها') && !t.includes('كفاه الله') && !/Whoever|Barangsiapa|Sesiapa|Wer /i.test(t), `Card 12 ${l}: VIRTUE (فضل) NOT inside translation block`);
  ok(!t.includes('حديث ضعيف') && !t.includes('ورد في فضل') && !/\bweak\b|ضعیف|zayıf|débil|schwach|দুর্বল|\bdaif\b|hadith\s+faible/i.test(t), `Card 12 ${l}: authenticityNote/weak-hadith NOT inside translation block`);
}

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 12 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 12 Arabic text/source/repeat/virtue/note byte-identical ================');
ok(b12.includes("text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.'"), 'Card 12 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b12.includes("source: { ref: 'رواه ابن السني', sourceUrl: null }"), "Card 12 source stays «رواه ابن السني»");
ok(b12.includes('repeat: 7,') && b12.includes("repeatLabel: { ar: 'سبع مرات', en: 'seven times' }"), "Card 12 repeat stays 7 («سبع مرات»)");
ok(b12.includes("title: { ar: 'حسبي الله لا إله إلا هو'"), 'Card 12 title untouched');
ok(b12.includes('من قالها حين يصبح وحين يمسي سبع مرات كفاه الله ما أهمه من أمر الدنيا والآخرة.'), 'Card 12 virtue (Arabic) unchanged as SEPARATE field');
ok(b12.includes("authenticity: 'weak_hadith'"), 'Card 12 authenticity stays weak_hadith');
ok(b12.includes('ورد في فضل هذا الذكر حديث ضعيف، ويجوز قوله كذكر ودعاء دون الجزم بثواب مخصوص.'), 'Card 12 authenticityNote (Arabic) unchanged as SEPARATE field');
ok(card12.virtue && card12.virtue.en === null && card12.authenticityNote && card12.authenticityNote.en === null, 'Card 12 virtue.en + authenticityNote.en stay null (NOT translated)');

console.log('\n================ 6. Cards 01-11 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 11; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[10].translation_en.startsWith('O Allah, I take refuge in You from anxiety and sorrow'), 'Card 11 en intact');
ok(M[9].translation_en.startsWith('O Allah, grant my body health'), 'Card 10 en intact');
ok(M[8].translation_en.startsWith('O Allah, whatever blessing has been received'), 'Card 09 en intact');
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
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com|hadiskutuphanesi|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my|islamiokul\.com/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|daralathar\.fr|islamiokul\.com|moe-dl\.edu\.my/i.test(srvSrc) && !/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|daralathar\.fr|islamiokul\.com|moe-dl\.edu\.my/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=55/.test(htmlSrc), 'index.html azkar-data.js?v=55 (Card 12 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v553'/.test(swSrc), "sw.js CACHE_VERSION 'v553'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
