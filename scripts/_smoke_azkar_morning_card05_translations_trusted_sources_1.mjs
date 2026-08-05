// Smoke — AZKAR-MORNING-DUA-CARD-05-TRANSLATIONS-TRUSTED-SOURCES-AVAILABLE-LANGUAGES-1
// morning-005 («أصبحنا وأصبح الملك لله», Muslim) gains 8 STATIC translations shown ABOVE the Arabic:
// en/fr/ur/tr/bn/es/id = HadeethEnc encyclopedia (hadith 3008; morning wording built from the SAME source's
// own translation per the hadith's instruction) · ms = akuislam morning-adhkar guide (Sahih Muslim, full text).
// de was PENDING_SOURCE; FILLED later by …-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1 (Islamische Datenbank
// Hisn-ul-Muslim item 77). ar never renders a translation block. Cards 01-04, evening and prayer are untouched.
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
const N = (s) => s.normalize('NFC'); // bn/ur literals: unify composed/decomposed forms

// sandbox-eval the data file (same pattern as the evening smoke)
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const M = sandbox.window.AzkarMorning;
const card5 = M[4];

const IMPL = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'es', 'id'];   // approved langs (Card 05)
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang anchors: [startsWith, mustContain..., mustNOTContain...]
const ANCHOR = {
  en: { start: 'The morning has reached', has: ['laziness', 'torment in the grave', 'this day'], not: ['this night'] },
  fr: { start: 'Nous nous retrouvons au matin', has: ['paresse', 'châtiment de la tombe', 'cette journée', "[digne d'adoration]"], not: ['cette nuit'] },
  ur: { start: 'ہم نے صبح کی', has: ['سستی', 'قبر', 'اِس دن', 'اے رب!'], not: ['رات', 'اے رب !'] },
  tr: { start: "Biz Allah'ın (kulu) olarak sabahladık", has: ['Tembellikten', 'kabirdeki azaptan', 'Bu gündüzde'], not: ['gecede'] },
  bn: { start: 'আমরা ও সারা রাজ্য', has: ['সকালে', 'অলসতা', 'কবরের', 'এই দিনে'], not: ['রাতে', 'রাত্রে', 'সন্ধ্যায়'] },
  ms: { start: 'Kami telah memasuki waktu pagi', has: ['kemalasan', 'alam kubur', 'hari ini'], not: ['petang', 'malam'] },
  es: { start: '¡Hemos amanecido', has: ['pereza', 'castigo de la tumba', 'este día', 'después de él'], not: ['esta noche', 'después de ella'] },
  id: { start: 'Kami memasuki waktu pagi', has: ['kemalasan', 'azab kubur', 'di hari ini'], not: ['malam ini', 'sore hari'] },
};

console.log('================ 1. Card 05 = morning-005 — has the 8 approved translations (values verified) ================');
ok(card5 && card5.id === 'morning-005', "AzkarMorning[4].id === 'morning-005' (actual id confirmed)");
ok(card5.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of IMPL) {
  const t = card5['translation_' + l];
  const a = ANCHOR[l];
  ok(typeof t === 'string' && t.length > 300, `Card 05 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 05 ${l}: starts with the source's MORNING opening («${a.start.slice(0, 28)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 05 ${l}: completeness anchors present (laziness+grave clauses + day-wording)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 05 ${l}: NO leftover evening/night wording`);
}

console.log('\n================ 2. Card 05 — NO ar; de FILLED by the PENDING ticket (Islamische Datenbank Hisn item 77) ================');
ok(card5.translation_ar === undefined, 'Card 05 has NO translation_ar (Arabic UI shows no block)');
// AZKAR-MORNING-DUA-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1: de PENDING resolved.
ok(typeof card5.translation_de === 'string' && card5.translation_de.startsWith('Wir haben den Morgen erreicht'), 'Card 05 translation_de present (Hisn ch.27/77, morning opening)');
ok(['das Beste an diesem Tag', 'Höllenfeuer', 'Strafe im Grab'].every((x) => card5.translation_de.includes(x)), 'Card 05 de: completeness anchors (day-ask + fire + grave clauses)');
ok(!/[\p{Nd}]/u.test(card5.translation_de) && !/Nacht|amsayn/i.test(card5.translation_de), 'Card 05 de: footnote markers stripped, no digits, no evening/night leakage');
const b5 = dataSrc.slice(dataSrc.indexOf("id: 'morning-005'"), dataSrc.indexOf("id: 'morning-006'"));
ok(!/translation_ar\s*:/.test(b5), 'morning-005 source block declares NO translation_ar field');
for (const l of IMPL) {
  const t = card5['translation_' + l];
  ok(!/[\p{Nd}]/u.test(t), `Card 05 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t), `Card 05 ${l}: no footnote digit-brackets`);
  ok(!/Asbahn|Amsain|Emseyn|hadhihil|lillâh|Bismill/i.test(t), `Card 05 ${l}: no transliteration`);
  ok(!/­/.test(t), `Card 05 ${l}: no soft hyphen`);
}

console.log('\n================ 3. Per-lang MORNING totals (updated by the Card 06 ticket); ar = 0 ================');
// CARD-06 ticket: morning-006 adds a 6th translation for en/ur/tr/bn/de/es/id.
// PENDING ticket: card05 += de, card06 += fr + ms → every non-Arabic lang = 6 morning translations.
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
const MORN_EXPECT = { en: 25, ur: 25, tr: 25, bn: 25, es: 25, id: 25, de: 25, fr: 25, ms: 25 }; // Card 25 complete: uniform 25
for (const l of ALL9) {
  const exp = MORN_EXPECT[l];
  ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === exp, `morning region translation_${l}: EXACTLY ${exp}`);
}
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere (Arabic UI = zero translation blocks)');

console.log('\n================ 4. Card 05 Arabic text/source/repeat byte-identical ================');
ok(b5.includes("text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.'"), 'Card 05 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b5.includes("source: { ref: 'رواه مسلم', sourceUrl: null }"), "Card 05 source stays «رواه مسلم»");
ok(b5.includes('repeat: 1,') && b5.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 05 repeat stays 1 («مرة واحدة»)");
ok(b5.includes("authenticity: 'sahih'"), 'Card 05 authenticity stays sahih');

console.log('\n================ 5. Cards 01-04 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) translation intact');
ok(dataSrc.includes('In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, "He is Allah, [who is] One'), 'Card 02 (Ikhlas) translation intact');
for (let c = 0; c < 4; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations (incl. de)`);
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l} still EXACTLY 23 (untouched)`);
const prRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
ok(!/translation_[a-z]+\s*:/.test(prRegion), 'prayer region has NO translation fields (untouched)');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 items + prayer list intact');

console.log('\n================ 6. Renderers — generic field read, NO fallback (de shows nothing), ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server.js reads translation_{lang} in exactly ONE place');
ok((appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'app.js reads translation_{lang} in exactly ONE place');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_en'\]\s*\|\|/.test(srvSrc), 'server.js: NO fallback chain (missing field ⇒ no block; /de gets no English)');
ok(!/translation_' \+ _trLang\] \|\|/.test(appSrc), 'app.js: NO fallback chain (missing field ⇒ no block)');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), "server.js: ar-gate intact (ar ⇒ never a block)");
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc), 'server.js: ur ⇒ dir=rtl, others ltr');
ok(/_trLang === 'ur' \? ' style="direction:rtl;text-align:right"'/.test(srvSrc), 'server.js: ur inline rtl style');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'server.js: translation ABOVE the Arabic text');
ok(/trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'app.js: ur ⇒ dir=rtl');

console.log('\n================ 7. NO runtime external translation requests (all static) ================');
ok(!/hadeethenc\.com/i.test(dataSrc) && !/hadeethenc\.com/i.test(srvSrc) && !/hadeethenc\.com/i.test(appSrc), 'no hadeethenc.com URL in azkar-data/server/app (dev-time extraction only)');
ok(!/akuislam\.com/i.test(dataSrc) && !/akuislam\.com/i.test(srvSrc) && !/akuislam\.com/i.test(appSrc), 'no akuislam.com URL in azkar-data/server/app');
ok(!/quranenc\.com/i.test(dataSrc) && !/quranenc\.com/i.test(srvSrc) && !/quranenc\.com/i.test(appSrc), 'no quranenc.com URL (unchanged rule)');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch (pure static data)');

console.log('\n================ 8. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=36[3-9]|js\/azkar-data\.js\?v=[2-9]\d/.test(htmlSrc), 'index.html azkar-data.js?v >= 13 (later tickets bump it)');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED (generic renderer — no app.js edit)');
ok(/CACHE_VERSION = 'v5(0[89]|[1-9]\d)'/.test(swSrc), "sw.js CACHE_VERSION v508+ (later tickets bump it)");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
