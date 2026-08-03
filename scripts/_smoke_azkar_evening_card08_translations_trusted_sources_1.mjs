// Smoke — AZKAR-EVENING-DUA-CARD-08-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-008 = the shahada/witness dua «اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ…وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.»
// (Abu Dawud, repeat 4 «أربع مرات») gains the 9 static non-ar MEANING translations (EVENING form «أمسيت»).
// The NINE meanings each lang must keep: ① O Allah ② I have reached the EVENING & call You to witness ③ bearers of
// Your Throne ④ Your angels ⑤ all creation ⑥ that You are Allah ⑦ no god but You ⑧ You ALONE, no partner
// ⑨ Muhammad is Your servant & Messenger. en/fr/bn/ms/de/es/id = morning-008 reused with ONLY the time-word swapped
// (they already keep ⑧). ur & tr DIVERGE: their morning-008 DROPS ⑧ «وحدك لا شريك لك»; restored here from a trusted
// source (morning NOT retro-fixed). tr = user-approved TRUSTED COMPOSITE (Turkish only): body IslamHouse Hısnu'l-Müslim
// (al-Qahtani) dua 80 «akşamladım» + ⑧ from Diyanet «O tektir, ortağı yoktur» → «tek olduğuna, ortağın olmadığına».
// NO translation_ar; NO reference/repeat/source/sanad/virtue/transliteration/footnote inside the block; NO morning
// wording; renderers (server.js/app.js) untouched.
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
const N = (s) => (s || '').normalize('NFC');
const has = (t, x) => N(t).includes(N(x));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const E = sandbox.window.AzkarEvening;
const M = sandbox.window.AzkarMorning;
const P = sandbox.window.AzkarPrayer;
const card = E.find(d => d.id === 'evening-008');
const morn = M.find(d => d.id === 'morning-008');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const REUSE7 = ['en', 'fr', 'bn', 'ms', 'de', 'es', 'id'];   // reused from morning-008, only the time-word swapped
const DIVERGE = ['ur', 'tr'];                                 // morning DROPS ⑧; evening restores it (composite for tr)

// Distinctive substrings for the 9 meanings, per language.
const MEAN = {
  en: ['O Allah', 'entered a new evening', 'bear witness', 'bearers of Your Throne', 'Your angels', 'all creation', 'You are Allah', 'none worthy of worship but You', 'You alone', 'You have no partners', 'Muhammad is Your slave and Your Messenger'],
  fr: ['Ô Seigneur', 'Me voici au soir', 'prends à témoin', 'porteurs de Ton Trône', 'Tes anges', 'toutes tes créatures', 'c’est Toi Allah', 'il n’y a de divinité que Toi', 'Tu es Seul', 'sans associé', 'Muhammad est Ton esclave et Ton messager'],
  ur: ['اے اللہ', 'شام کی', 'گواہ بناتا ہوں', 'عرش اٹھانے والوں', 'فرشتوں', 'تمام مخلوق', 'تو ہی اللہ ہے', 'تیرے سوا کوئی معبود برحق نہیں', 'تو اکیلا ہے', 'تیرا کوئی شریک نہیں', 'محمد تیرے بندے اور تیرے رسول'],
  tr: ['Allahım', 'akşamladım', 'şahit tutarak', 'arşını taşıyanları', 'meleklerini', 'bütün yarattıklarını', 'Allah olduğuna', 'senden başka hak ilah olmayan', 'tek olduğuna', 'ortağın olmadığına', 'kulun ve elçin'],
  bn: ['হে আল্লাহ', 'বিকালে উপনীত হয়েছি', 'সাক্ষী রাখছি', 'আরশ বহনকারীদেরকে', 'ফেরেশতাগণকে', 'সকল সৃষ্টিকে', 'আপনিই আল্লাহ', 'হক্ব ইলাহ নেই', 'কোনো শরীক নেই', 'মুহাম্মাদ আপনার বান্দা ও রাসূল'],
  ms: ['Ya Allah', 'di waktu petang ini', 'mempersaksikan Engkau', 'memikul ‘Arsy-Mu', 'malaikat-malaikat', 'seluruh makhluk-Mu', 'Engkau adalah Allah', 'tiada Ilah yang berhak disembah kecuali Engkau', 'tiada sekutu bagi-Mu', 'Muhammad adalah hamba dan utusan-Mu'],
  de: ['O Allāh', 'den Abend erreicht', 'zum Bezeugen', 'Thron tragenden', 'Malāʾikah', 'Schöpfung', 'Du bist Allāh', 'keinen wahren Ilāh', 'keinen Teilhaber', 'Muḥammad ist Dein Diener und Gesandter'],
  es: ['Oh Allah', 'anochezco', 'atestiguo', 'sostienen Tu Trono', 'Tus ángeles', 'toda Tu creación', 'Tu eres Allah', 'no hay divinidad salvo Tú', 'sin asociado', 'Muhammad es Tu siervo y mensajero'],
  id: ['Ya Allah', 'di waktu petang', 'bersaksi kepada-Mu', 'memikul ‘Arasy-Mu', 'malaikat-malaikat', 'seluruh makhluk-Mu', 'Engkau adalah Allah', 'tiada Tuhan yang berhak disembah kecuali Engkau', 'tiada sekutu bagi-Mu', 'Muhammad adalah hamba dan utusan-Mu'],
};
// ⑥ «أنك أنت الله» — must be present (the meaning tr sources risk dropping)
const M6 = { en:/You are Allah/i, fr:/c’est Toi Allah/i, ur:/تو ہی اللہ ہے/, tr:/Allah olduğuna/i, bn:/আপনিই আল্লাহ/, ms:/Engkau adalah Allah/i, de:/Du bist Allāh/, es:/Tu eres Allah/i, id:/Engkau adalah Allah/i };
// ⑧ «وحدك لا شريك لك» — must be present in EVERY lang (the meaning ur/tr morning DROP)
const M8 = { en:/You have no partners/i, fr:/sans associé/i, ur:/تیرا کوئی شریک نہیں/, tr:/ortağın olmadığına/i, bn:/কোনো শরীক নেই/, ms:/tiada sekutu bagi-Mu/i, de:/keinen Teilhaber/, es:/sin asociado/i, id:/tiada sekutu bagi-Mu/i };
// evening word present / morning word ABSENT
const EVE = { en:/new evening/i, fr:/au soir/i, ur:/شام کی/, tr:/akşamladım/i, bn:/বিকালে/, ms:/petang/i, de:/den Abend erreicht/i, es:/anochezco/i, id:/petang/i };
const MORN = { en:/new morning|\bmorning\b/i, fr:/au matin|\bmatin\b/i, ur:/صبح کی/, tr:/sabahladım/i, bn:/সকালে/, ms:/\bpagi\b/i, de:/den Morgen erreicht|\bMorgen\b/, es:/amanezco/i, id:/\bpagi\b/i };
// forbidden inside a translation value: reference / repeat / source / sanad / virtue / footnote / transliteration / movement
const REF = /رواه|أبو داود|Abu Da|Ebu Davud|Bukhari|Bukhārī|Nesâi|Tirmidhi|صحيح|Sahih|أربع مرات|four times|Dört kere|\bhadith\b|رقم|IslamHouse|Diyanet|Kahtânî|Kahtani|Hisn|حصن المسلم/i;
const VIRTUE = /من قالها|أعتقه الله|من النار|from the Fire|Hellfire|freed|Cehennem|azad|আগুন থেকে/i;
const TRANSLIT = /Allahumma|amsaytu|asbahtu|ushhiduk|hamalata|'?arshik|abduka|rasuluka|wahdaka|la sharika/i;
const MOVEMENT = /Gülen|Gulen|herkul|Furkan Nesli|musteke/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-008 identity + all 9 translations, NINE meanings each ================');
ok(!!card && card.id === 'evening-008', 'AzkarEvening has evening-008');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 120, `evening-008 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL NINE meanings preserved`);
  ok(M6[l].test(t), `${l}: ⑥ «أنك أنت الله» present`);
  ok(M8[l].test(t), `${l}: ⑧ «وحدك لا شريك لك» present (the clause ur/tr morning drop)`);
  ok(EVE[l].test(t), `${l}: EVENING wording present`);
  ok(!MORN[l].test(t), `${l}: NO morning wording`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. NO reference/repeat/source/virtue/transliteration/movement inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat/source/sanad token`);
for (const l of ALL9) ok(!VIRTUE.test(card['translation_' + l]), `${l}: virtue («freed from the Fire») NOT leaked into the block`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
for (const l of ALL9) ok(!MOVEMENT.test(card['translation_' + l]), `${l}: no Gülen/Furkan/blog source string`);

console.log('\n================ 3. en/fr/bn/ms/de/es/id reuse morning-008 with ONLY the time-word swapped ================');
const SWAP = { en:['I have entered a new morning','I have entered a new evening'], fr:['Me voici au matin','Me voici au soir'],
  bn:['সকালে উপনীত হয়েছি','বিকালে উপনীত হয়েছি'], ms:['di waktu pagi ini','di waktu petang ini'],
  de:['den Morgen erreicht','den Abend erreicht'], es:['amanezco','anochezco'], id:['di waktu pagi','di waktu petang'] };
for (const l of REUSE7) {
  const expect = N(morn['translation_' + l]).replace(N(SWAP[l][0]), N(SWAP[l][1]));
  ok(expect === N(card['translation_' + l]), `${l}: evening = morning-008 with ONLY «${SWAP[l][0]}»→«${SWAP[l][1]}» (byte-identical otherwise)`);
}

console.log('\n================ 4. ur & tr DIVERGE — restore ⑧; morning-008 ur/tr still DROP it (unchanged) ================');
for (const l of DIVERGE) {
  ok(card['translation_' + l] !== morn['translation_' + l], `${l}: evening is a DIFFERENT string from morning-008 (⑧ restored)`);
  ok(!M8[l].test(morn['translation_' + l]), `${l}: morning-008 STILL drops ⑧ «وحدك لا شريك لك» (NOT retro-fixed)`);
}
ok(has(card.translation_ur, 'تو اکیلا ہے') && has(card.translation_ur, 'تیرا کوئی شریک نہیں'), 'ur ⑧ restored «تو اکیلا ہے، تیرا کوئی شریک نہیں»');
// Turkish composite specifics
ok(has(card.translation_tr, 'tek olduğuna') && has(card.translation_tr, 'ortağın olmadığına'), 'tr ⑧ composite «tek olduğuna, ortağın olmadığına» (Diyanet lexicon)');
ok(has(card.translation_tr, 'Allah olduğuna') && has(card.translation_tr, 'akşamladım') && has(card.translation_tr, 'kulun ve elçin'), 'tr composite keeps ⑥ Allah olduğuna + evening akşamladım + ⑨ kulun ve elçin (Kahtani body)');
ok(!/sabahladım/i.test(card.translation_tr) && !/Hazreti|sallallahu/i.test(card.translation_tr), 'tr: no morning «sabahladım», no honorific/salawat in the block');

console.log('\n================ 5. NO translation_ar + Arabic text/source/repeat byte-identical + virtue Arabic-only ================');
ok(card.translation_ar === undefined, 'evening-008 object has NO translation_ar');
const b8 = dataSrc.slice(dataSrc.indexOf("id: 'evening-008'"), dataSrc.indexOf("id: 'evening-009'"));
ok(!/translation_ar\s*:/.test(b8), 'evening-008 source block declares NO translation_ar field');
ok(card.text.startsWith('اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ') && card.text.endsWith('وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.'),
  'Arabic text (EVENING «أمسيت») opening + closing intact (byte-identical anchors)');
ok(card.text.includes('حَمَلَةَ عَرْشِكَ') && card.text.includes('وَحْدَكَ لَا شَرِيكَ لَكَ'), 'Arabic distinctive interior phrases intact (bearers of Throne + alone no partner)');
ok(card.source && card.source.ref === 'رواه أبو داود', 'source ref «رواه أبو داود» unchanged');
ok(card.repeat === 4 && card.repeatLabel && card.repeatLabel.ar === 'أربع مرات' && card.repeatLabel.en === 'four times', 'repeat 4 «أربع مرات» / «four times» unchanged');
ok(card.authenticity === 'sahih', "authenticity 'sahih' unchanged");
ok(card.virtue != null && card.virtue.en === null && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 10, 'virtue present, Arabic-only (virtue.en === null) — NOT translated');

console.log('\n================ 6. Per-region counts — evening 8, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 17, `evening region translation_${l}: EXACTLY 17 (001-004 Quran + 005-017 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 7. Evening 001-008 translated; 009+ untranslated; morning + prayer intact ================');
for (const id of ['evening-001','evening-002','evening-003','evening-004','evening-005','evening-006','evening-007','evening-008']) {
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(17).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 018+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(morn.translation_en.includes('I have entered a new morning'), 'morning-008 en still MORNING form (unchanged)');

console.log('\n================ 8. Renderers (server.js / app.js) untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 9. Cache-busters bumped (azkar-data.js?v=49 + sw v547) ================');
ok(/js\/azkar-data\.js\?v=49\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=49');
ok(!/js\/azkar-data\.js\?v=39\b/.test(htmlSrc), 'no stale ?v=39 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v547'/.test(swSrc), "sw.js CACHE_VERSION = 'v547'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
