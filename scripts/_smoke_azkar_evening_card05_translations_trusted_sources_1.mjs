// Smoke — AZKAR-EVENING-DUA-CARD-05-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-005 («أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...», Ibn Mas'ud, Sahih Muslim, repeat 1 «مرة واحدة») gains the 9
// static non-ar MEANING translations (en/fr/ur/tr/bn/ms/de/es/id) — EVENING form only. The dua carries ELEVEN
// meanings that every language must preserve: ① reached the evening ② dominion is Allah's ③ all praise is Allah's
// ④ tawhid: none worthy but Allah, alone, no partner ⑤ His the dominion & praise ⑥ over all things omnipotent
// ⑦ ask the good of THIS NIGHT + what follows ⑧ refuge from the evil of THIS NIGHT + what follows ⑨ refuge from
// laziness ⑩ refuge from the evil of old age ⑪ refuge from torment in the Fire + torment in the grave. NO morning
// wording («this day»/«matin»/«sabah»/«pagi»…). NO Arabic translation, NO reference/repeat/source/sanad/virtue,
// NO transliteration, NO footnote digits. Renderers (server.js/app.js) untouched. Sources per the approved audit:
// en/ms/bn/ur=Hisn al-Muslim; fr=Dar Al Athar; tr=resulullah.org; de=printed German (footnote-1 evening form);
// es=HadeethEnc /es/3008 (NOT hisnmuslim.es/Way-to-Allah); id=muslim.or.id / Almanhaj.
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
const has = (t, x) => (Array.isArray(x) ? x.every(y => N(t).includes(N(y))) : N(t).includes(N(x)));

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const E = sandbox.window.AzkarEvening;
const M = sandbox.window.AzkarMorning;
const P = sandbox.window.AzkarPrayer;
const card = E.find(d => d.id === 'evening-005');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// The ELEVEN meanings, per language, as exact substrings that MUST all be present.
// (meaning ⑪ = Fire + grave → an array; both tokens required.)
const MEAN = {
  en: ['reached the evening', 'unto Allah belongs all sovereignty', 'all praise is for Allah',
       ['None has the right to be worshipped except Allah', 'alone, without partner'],
       'to Him belongs all sovereignty and praise', 'over all things omnipotent',
       'the good of this night and the good of what follows it', 'the evil of this night and the evil of what follows it',
       'laziness', 'senility', ['torment in the Fire', 'punishment in the grave']],
  fr: ['au soir', 'le règne appartient à Allah', 'Louange à Allah',
       ['aucune divinité', 'Seul, sans associé'],
       'À Lui la royauté, à Lui la louange', 'capable de toute chose',
       'le bien que contient cette nuit et le bien qui vient après', 'le mal que contient cette nuit et le mal qui vient après',
       'paresse', 'vieillesse', ["l'Enfer", 'la tombe']],
  ur: ['شام کی', 'اللہ کی بادشاہت', 'تمام تعریفیں اللہ کے لیے',
       ['الٰہ نہیں', 'شریک نہیں'],
       'بادشاہی اسی کی ہے', 'ہر چیز پر قدرت',
       ['رات کی بھلائی', 'اس کے بعد'], 'اس رات کی برائی',
       'سستی', 'بڑھاپے', ['جہنم', 'قبر']],
  tr: ['Akşama ulaştık', "mülk de Allah'a ait", "Hamd sadece Allah'adır",
       ['ilâh yoktur', 'ortağı yoktur'],
       "Mülk O'na aittir, hamd O'na mahsustur", 'her şeye kadirdir',
       ['gecenin hayrını', 'sonrasının hayrını'], ['gecenin şerrinden', 'sonrasının şerrinden'],
       'Tembellik', 'ihtiyarlık', ['Cehennem', 'kabir']],
  bn: ['বিকালে উপনীত', 'রাজত্বও বিকালে উপনীত', 'সমুদয় প্রশংসা',
       ['ইলাহ নেই', 'শরীক নেই'],
       'রাজত্ব তাঁরই এবং প্রশংসাও তাঁর', 'সকল কিছুর উপর ক্ষমতাবান',
       ['রাতের মাঝে এবং এর পরে', 'কল্যাণ'], 'অকল্যাণ',
       'অলসতা', 'বার্ধক্য', ['জাহান্নাম', 'কবর']],
  ms: ['memasuki waktu petang', 'kerajaan pada waktu petang ini adalah milik Allah', 'segala puji bagi Allah',
       ['berhak disembah melainkan Allah', 'tiada sekutu'],
       'milik-Nyalah kerajaan dan bagi-Nyalah segala pujian', 'Maha Berkuasa atas segala sesuatu',
       'kebaikan malam ini dan kebaikan selepasnya', 'kejahatan malam ini dan kejahatan selepasnya',
       'kemalasan', 'usia tua', ['neraka', 'kubur']],
  de: ['in den Abend eingetreten', 'die Herrschaft Allahs', 'alles Lob gebührt Allah',
       ['keine Gottheit außer Allah', 'keinen Partner'],
       'Ihm gehört die Herrschaft und Ihm gehört das Lob', 'über alle Dinge mächtig',
       'das Gute dieser Nacht und das Gute dessen, was ihr folgt', 'dem Übel dieser Nacht und dem Übel dessen',
       'Trägheit', 'Greisenalter', ['Höllenfeuers', 'Grabes']],
  es: ['Hemos anochecido', 'anochecido el Reino de Al-lah', 'Las alabanzas son para Al-lah',
       ['No hay más dios que Al-lah', 'único y sin asociado'],
       'Para Él es el Reino y la alabanza', 'el Poderoso sobre todas las cosas',
       'el bien que haya en esta noche y después de ella', 'del mal que haya en esta noche y después de ella',
       'pereza', 'decrepitud', ['Fuego', 'tumba']],
  id: ['memasuki waktu sore', 'kerajaan hanya milik Allah', 'segala puji hanya milik Allah',
       ['berhak diibadahi', 'tiada sekutu'],
       'Bagi-Nya kerajaan dan bagi-Nya pujian', 'Mahakuasa atas segala sesuatu',
       'kebaikan di malam ini dan kebaikan sesudahnya', 'kejahatan yang ada di malam ini dan kejahatan sesudahnya',
       'kemalasan', 'hari tua', ['neraka', 'kubur']],
};
// EVENING marker that MUST appear (this-night form)
const EVENING = { en:/this night/i, fr:/cette nuit/i, ur:/اس رات|اِس رات/, tr:/bu gece/i, bn:/এই রাত/, ms:/malam ini/i, de:/dieser Nacht/, es:/esta noche/i, id:/malam ini/i };
// MORNING wording that MUST NOT appear (evening form only)
const MORNING = {
  en:/\b(morning|this day|today|daytime)\b/i, fr:/\b(matin|matinée|ce jour|aujourd'hui)\b/i,
  ur:/(صبح|اِس دن|اس دن)/, tr:/\b(sabah|bu gün|gündüz)\b/i, bn:/(সকাল|এই দিন)/,
  ms:/(\bpagi\b|\bsiang\b|hari ini)/i, de:/\b(Morgen|dieses Tages|am Tag)\b/, es:/\b(mañana|este día|amanec)/i,
  id:/(\bpagi\b|\bsiang\b|hari ini)/i,
};
// reference / repeat / source / sanad tokens that MUST NOT appear inside a translation value
const REF = /رواه|صحيح مسلم|Sahih Muslim|Bukhari|Bukhārī|Tirmidhi|Tirmizî|Nasa'i|Ibn Mas|ابن مسعود|\bhadith\b|\bnarrated\b|رقم|مرة واحدة|\bonce\b/i;
// LATIN transliteration of the Arabic that MUST NOT appear
const TRANSLIT = /Amsayna|Amsaina|Allahumma|a['`]udhu|na['`]udhu|La ilaha illa|rabbi as|wa sallim|\bqadir\b/i;
// superscript footnote markers that MUST NOT appear
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-005 identity + all 9 translations, ELEVEN meanings each ================');
ok(!!card && card.id === 'evening-005', "AzkarEvening has evening-005");
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 200, `evening-005 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL ELEVEN meanings preserved`);
  ok(EVENING[l].test(t), `${l}: EVENING marker present (this-night form)`);
  ok(!MORNING[l].test(t), `${l}: NO morning/day wording`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
  ok(!/­/.test(t), `${l}: no soft hyphen`);
}

console.log('\n================ 2. NO reference/repeat/source/sanad + NO transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat/source/sanad token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. Approved per-language source decisions ================');
ok(card.translation_es.includes('pereza') && card.translation_es.includes('decrepitud') && !/avaricia|orgullo/i.test(card.translation_es),
  'es: HadeethEnc «pereza»+«decrepitud» (NOT hisnmuslim.es «avaricia» / Way-to-Allah «orgullo»)');
ok(card.translation_de.startsWith('Wir sind in den Abend eingetreten') && card.translation_de.includes('dieser Nacht'),
  'de: printed-German EVENING form (footnote-1 substitution «in den Abend … dieser Nacht»)');
ok(card.translation_tr.includes("O'na aittir") && !card.translation_tr.includes("O'ona") && !/bunaklık|kendine hakim/.test(card.translation_tr),
  "tr: cleaned «O'na» + explanatory parenthetical removed (no meaning change)");
ok(card.translation_bn.includes('বিকালে') && card.translation_bn.includes('এই রাত'),
  'bn: Hisn al-Muslim EVENING form («বিকালে» + «এই রাত»)');

console.log('\n================ 4. NO translation_ar + Arabic text/source/repeat byte-identical ================');
ok(card.translation_ar === undefined, 'evening-005 object has NO translation_ar');
const b5 = dataSrc.slice(dataSrc.indexOf("id: 'evening-005'"), dataSrc.indexOf("id: 'evening-006'"));
ok(!/translation_ar\s*:/.test(b5), 'evening-005 source block declares NO translation_ar field');
ok(card.text.startsWith('أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ') && card.text.endsWith('عَذَابٍ فِي الْقَبْرِ.'),
  'Arabic text opening + closing intact (byte-identical anchors)');
ok(card.text.includes('لَا إِلَٰهَ إِلَّا اللَّهُ') && card.text.includes('هَذِهِ اللَّيْلَةِ') && card.text.includes('وَسُوءِ الْكِبَرِ'),
  'Arabic text distinctive interior phrases intact (tawhid + this-night + evil-of-old-age)');
ok(/source:\s*\{\s*ref:\s*'رواه مسلم'\s*\}/.test(b5), "source stays { ref: 'رواه مسلم' }");
ok(/repeat:\s*1,/.test(b5) && /repeatLabel:\s*\{\s*ar:\s*'مرة واحدة',\s*en:\s*'once'\s*\}/.test(b5), "repeat stays 1 («مرة واحدة» / «once»)");
ok(/authenticity:\s*'sahih'/.test(b5) && /virtue:\s*null/.test(b5), "authenticity 'sahih' + virtue null unchanged");

console.log('\n================ 5. Per-region translation counts — evening 7, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 11, `evening region translation_${l}: EXACTLY 11 (001-004 Quran + 005-011 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Evening 001-007 still translated; 008+ untranslated; lists intact ================');
for (const id of ['evening-001','evening-002','evening-003','evening-004','evening-005','evening-006','evening-007']) {
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} still carries all 9 translations`);
}
ok(E.slice(11).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 012+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 7. Renderers (server.js / app.js) untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation rendered ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation / source URLs / fetch ================');
ok(!/https?:\/\//.test(b5) && !/\.(com|org|net|my|es|de|app|fr)\b/i.test(b5), 'evening-005 block (incl. comment) carries NO URL/domain');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names in comments are fine');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=43/.test(htmlSrc), 'index.html azkar-data.js?v=43 (evening-005 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v541'/.test(swSrc), "sw.js CACHE_VERSION 'v541'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
