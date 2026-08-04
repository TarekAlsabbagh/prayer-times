// Smoke — AZKAR-EVENING-DUA-CARD-18-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-018 = «أمسينا وأمسى الملك لله رب العالمين، اللهم إني أسألك خير هذه الليلة، فتحها، ونصرها، ونورها، وبركتها،
// وهداها، وأعوذ بك من شر ما فيها وشر ما بعدها» (Abu Dawud, ×1 «مرة واحدة», authenticity 'sahih', virtue null) gains the 9
// static non-ar MEANING translations. NOT time-neutral: explicit EVENING form → each of 8 langs (en/fr/ur/tr/bn/ms/de/es)
// = its morning-018 twin with the documented night-form swap; id = native evening source. TEN meanings each:
// ①amsayna(evening reached) ②al-mulk lillah rabb al-alamin ③good of THIS NIGHT ④fath ⑤nasr ⑥light ⑦blessing ⑧guidance
// ⑨evil within it ⑩evil after it. NO day/morning wording anywhere. bn typo fixed (baraka correct spelling). de keeps the
// (Unterstützung) gloss. tr/es/ms disclosed (blog/forum host, medium confidence). morning-018 UNTOUCHED. NO translation_ar.
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
const card = E.find(d => d.id === 'evening-018');
const morn = M.find(d => d.id === 'morning-018');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const SWAP8 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es'];
const NATIVE = ['id'];

// TEN meanings — targeted distinct markers per language
const M1  = { en: 'reached the evening', fr: 'au soir', ur: 'شام کی', tr: 'akşamladık', bn: 'বিকালে', ms: 'petang', de: 'den Abend erreicht', es: 'Anochecimos', id: 'petang' }; // ① amsayna
const M2  = { en: 'sovereignty belongs to Allah', fr: 'le règne appartient à Allah', ur: 'بادشاہت', tr: 'Mülk', bn: 'রাজত্ব', ms: 'Kekuasaan', de: 'Herrschaft', es: 'el reino', id: 'kerajaan' }; // ② al-mulk
const M3  = { en: 'good of this night', fr: 'bien de cette nuit', ur: 'اس رات کی بھلائی', tr: 'bu gecenin', bn: 'এই রাতের কল্যাণ', ms: 'kebaikan malam ini', de: 'Gute dieser Nacht', es: 'lo mejor de esta noche', id: 'kebaikan malam ini' }; // ③ this NIGHT
const M4  = { en: 'triumphs', fr: 'conquêtes', ur: 'فتح', tr: 'fethini', bn: 'বিজয়', ms: 'pembukaannya', de: 'Sieg', es: 'su triunfo', id: 'pembukaannya' }; // ④ fath
const M5  = { en: 'victories', fr: 'victoires', ur: 'نصرت', tr: 'zaferini', bn: 'সাহায্য', ms: 'pertolongannya', de: 'Hilfe', es: 'su victoria', id: 'kemenangannya' }; // ⑤ nasr
const M6  = { en: 'light', fr: 'lumière', ur: 'نور', tr: 'nûrunu', bn: 'নূর', ms: 'cahayanya', de: 'Licht', es: 'su luz', id: 'cahayanya' }; // ⑥ light
const M7  = { en: 'blessings', fr: 'bénédiction', ur: 'برکت', tr: 'bereketini', bn: 'বরকত', ms: 'berkatnya', de: 'Segnung', es: 'su bendición', id: 'keberkahannya' }; // ⑦ blessing
const M8  = { en: 'guidance', fr: 'guidée', ur: 'ہدایت', tr: 'hidâyetini', bn: 'হেদায়াত', ms: 'petunjuknya', de: 'Rechtleitung', es: 'su guía', id: 'petunjuknya' }; // ⑧ guidance
const M9  = { en: 'evil of this night', fr: 'mal de cette nuit', ur: 'اس پر جو شر', tr: 'Onda', bn: 'এ রাতের', ms: 'kejahatan malam ini', de: 'an ihr', es: 'en ella', id: 'di dalamnya' }; // ⑨ evil within
const M10 = { en: 'the evil that follows it', fr: 'après elle', ur: 'اس کے بعد جو شر', tr: 'sonrasındaki', bn: 'পরের', ms: 'selepasnya', de: 'danach kommt', es: 'después de ella', id: 'setelahnya' }; // ⑩ evil after
const M_ALL = [M1, M2, M3, M4, M5, M6, M7, M8, M9, M10];

// forbidden: DAY/MORNING wording per language (night-not-day gate)
const DAY = {
  en: /\bmorning\b|this day|\btoday\b/i,
  fr: /\bmatin\b|ce jour/i,
  ur: /صبح|اس دن/,
  tr: /sabah|bu günün|bugün/i,
  bn: /সকালে|এই দিনের|এ দিনের/,
  ms: /\bpagi\b|hari ini/i,
  de: /\bMorgen\b|\bTag(es)?\b|dieses Tages/i,
  es: /amanec/i,
  id: /\bpagi\b|hari ini/i,
};
// forbidden: reference / attribution / repeat / hadith number
const REF = /رواه|أبو داود|أبو داؤد|\bAbu Daw|\bDawud|\bDaoud|\bHisn\b|حصن المسلم|مرة واحدة|\bonce\b|\b5084\b|\bsahih\b|صحيح/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /Amsayna|amsayna|wa-?amsa|khaira hadhihi|fath[au]ha|nasraha|barakataha|hudaha/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-018 identity + all 9 translations, TEN meanings ================');
ok(!!card && card.id === 'evening-018', 'AzkarEvening has evening-018');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 60, `evening-018 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(M_ALL.every(mm => has(t, mm[l])), `${l}: ALL ten meanings preserved (amsayna+mulk+this-night+fath+nasr+light+blessing+guidance+evil-in+evil-after)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. NIGHT-NOT-DAY gate — night wording present, ZERO day/morning leak ================');
for (const l of ALL9) ok(has(card['translation_' + l], M3[l]), `${l}: ③ «خير هذه الليلة» (this NIGHT) marker present (${M3[l]})`);
for (const l of ALL9) ok(!DAY[l].test(N(card['translation_' + l])), `${l}: NO day/morning wording leak (this day/today/matin/صبح/pagi/hari-ini/Morgen/amanec)`);

console.log('\n================ 3. Five elements distinct (fath≠nasr) + two refuges distinct (within≠after) ================');
for (const l of ALL9) ok(M4[l] !== M5[l] && has(card['translation_' + l], M4[l]) && has(card['translation_' + l], M5[l]), `${l}: ④ fath (${M4[l]}) AND ⑤ nasr (${M5[l]}) present & distinct`);
for (const l of ALL9) ok(M9[l] !== M10[l] && has(card['translation_' + l], M9[l]) && has(card['translation_' + l], M10[l]), `${l}: ⑨ evil-within (${M9[l]}) AND ⑩ evil-after (${M10[l]}) present & distinct`);

console.log('\n================ 4. NO reference/attribution/repeat/hadith-number/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 5. Mandatory execution decisions: bn typo-fix + de gloss ================');
ok(has(card.translation_bn, 'বরকত') && !has(card.translation_bn, 'রবকত'), 'bn: ⑦ uses «বরকত» (correct) — morning typo «রবকত» NOT present (typo-fix only, no meaning change)');
ok(has(card.translation_de, '(Unterstützung)'), 'de: ⑤ keeps the «(Unterstützung)» sense-gloss (consistency with morning twin)');
ok(has(card.translation_de, 'ihren Sieg') && has(card.translation_de, 'ihre Hilfe'), 'de: fath=«Sieg» + nasr=«Hilfe» both present (distinct)');

console.log('\n================ 6. Strategy: 8 SWAP diverge from morning-018 (night form); id NATIVE-EVE; morning-018 UNTOUCHED ================');
for (const l of ALL9) ok(card['translation_' + l] !== morn['translation_' + l], `${l}: evening-018 differs from morning-018 (night form, not the day twin)`);
// morning-018 still carries its DAY wording + the bn typo (proof it was NOT touched)
ok(has(morn.translation_en, 'this day') && has(morn.translation_fr, 'ce jour') && has(morn.translation_ur, 'اس دن') && has(morn.translation_tr, 'bu günün'), 'morning-018 en/fr/ur/tr still carry DAY wording (untouched)');
ok(has(morn.translation_de, 'dieses Tages') && has(morn.translation_es, 'este día') && has(morn.translation_ms, 'hari ini') && has(morn.translation_id, 'hari ini'), 'morning-018 de/es/ms/id still carry DAY wording (untouched)');
ok(has(morn.translation_bn, 'রবকত'), 'morning-018 bn still carries its original «রবকত» typo (NOT retro-fixed — deferred)');

console.log('\n================ 7. Arabic + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(card.text.startsWith('أَمْسَيْنَا وَأَمْسَى الْمُلْكُ') && card.text.endsWith('وَشَرِّ مَا بَعْدَهَا.'), 'Arabic opening «أمسينا وأمسى الملك» + closing «وشر ما بعدها.» intact (byte-identical)');
const b18 = dataSrc.slice(dataSrc.indexOf("id: 'evening-018'"), dataSrc.indexOf("id: 'evening-019'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b18), 'evening-018 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه أبو داود', 'source ref «رواه أبو داود» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة', 'repeat 1 «مرة واحدة» unchanged');
ok(card.virtue === null, 'virtue stays null (unchanged)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 8. Block carries NO URL/domain (bare source names only) ================');
ok(!/https?:\/\//.test(b18) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b18), 'evening-018 block (incl. comment) carries NO URL/domain (TLD)');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names only');
ok(has(b18, 'AZKAR-EVENING-DUA-CARD-18-TRANSLATIONS'), 'evening-018 block carries the ticket provenance comment');

console.log('\n================ 9. Per-region counts — evening 19, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 19, `evening region translation_${l}: EXACTLY 19 (001-004 Quran + 005-019 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 10. Evening 001-019 translated; 020+ untranslated; morning/prayer intact ================');
for (let n = 1; n <= 19; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(19).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 020+ carry NO translation fields');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 11. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 12. Cache-busters bumped (azkar-data.js?v=51 + sw v549; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=51\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=51');
ok(!/js\/azkar-data\.js\?v=50\b/.test(htmlSrc), 'no stale ?v=49 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v549'/.test(swSrc), "sw.js CACHE_VERSION = 'v549'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
