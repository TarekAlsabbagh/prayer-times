// Smoke — AZKAR-MORNING-DUA-CARD-06-TRANSLATIONS-TRUSTED-SOURCES-AVAILABLE-LANGUAGES-1
// morning-006 («اللهم بك أصبحنا», Tirmidhi) gains 7 STATIC translations (MORNING form only) shown ABOVE the
// Arabic: en/ur/tr/bn/de/es/id = HadeethEnc encyclopedia (hadith 5490; morning segment sliced verbatim — no
// word swaps; ur punctuation-space normalized only). fr + ms = PENDING_SOURCE → NO translation_fr/_ms:
// /fr and /ms render NO block and NO fallback for this card (their pages stay at 5 blocks = Cards 01-05).
// de HAS a Card-06 translation (first de card beyond 01-04) → /de rises to 5 blocks. ar never renders one.
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
const card6 = M[5];
const card5 = M[4];

const IMPL = ['en', 'ur', 'tr', 'bn', 'de', 'es', 'id'];   // approved langs (Card 06)
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang anchors: morning opening + resurrection word; evening/الم المصير renderings must NOT appear
const ANCHOR = {
  en: { start: 'O Allah, by You we have reached the morning', has: ['Resurrection'], not: ['final destination', 'Upon reaching the evening'] },
  ur: { start: 'اے اللہ! تیری حفاظت میں ہم نے صبح کی', has: ['اٹھ کر جانا'], not: ['لوٹ کر', 'اے اللہ !'] },
  tr: { start: "Allah'ım! Senin lütfunla sabaha ulaştık", has: ['huzurunda toplayacak olan da Sensin'], not: ['Huzuruna varılacak', 'Allahumme'] },
  bn: { start: 'হে আল্লাহ! আপনার অনুগ্রহে আমরা ভোরে', has: ['প্রত্যাবর্তন'], not: ['গন্তব্য'] },
  de: { start: 'O Allah, durch Dich traten wir in den Morgen', has: ['Auferstehung'], not: ['Rückkehr', 'in den Abend ein'] },
  es: { start: '¡Oh Al-lah, por Ti hemos amanecido', has: ['congregados'], not: ['masír', 'retorno'] },
  id: { start: 'Ya Allah! Dengan pertolongan dan rahmat-Mu kami memasuki pagi hari', has: ['kebangkitan'], not: ['maṣīr', 'makhluk kembali'] },
};

console.log('================ 1. Card 06 = morning-006 — has the 7 approved MORNING-form translations ================');
ok(card6 && card6.id === 'morning-006', "AzkarMorning[5].id === 'morning-006' (actual id confirmed)");
ok(card6.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of IMPL) {
  const t = card6['translation_' + l];
  const a = ANCHOR[l];
  ok(typeof t === 'string' && t.length > 80, `Card 06 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 06 ${l}: starts with the source's MORNING opening («${a.start.slice(0, 30)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 06 ${l}: resurrection-clause anchor present (ends the morning form)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 06 ${l}: NO evening form / NO «الم المصير» rendering / NO stale punctuation`);
}

console.log('\n================ 2. Card 06 — NO ar; fr + ms FILLED by the PENDING ticket ================');
ok(card6.translation_ar === undefined, 'Card 06 has NO translation_ar');
// AZKAR-MORNING-DUA-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1: fr (Hisnii inv.7) + ms (akuislam) resolved.
ok(typeof card6.translation_fr === 'string' && card6.translation_fr.startsWith('Ô Allah !') && card6.translation_fr.endsWith('la Résurrection.'), 'Card 06 translation_fr present (Hisnii invocation 7, morning form)');
ok(['au matin', 'au soir', 'nous vivons', 'nous mourons'].every((x) => card6.translation_fr.includes(x)), 'Card 06 fr: all four clauses present');
ok(typeof card6.translation_ms === 'string' && card6.translation_ms.startsWith('Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi'), 'Card 06 translation_ms present (akuislam, morning form)');
ok(card6.translation_ms.includes('kebangkitan (bagi semua makhluk)'), 'Card 06 ms: resurrection clause present (verbatim akuislam)');
const b6 = dataSrc.slice(dataSrc.indexOf("id: 'morning-006'"), dataSrc.indexOf("id: 'morning-007'"));
ok(!/translation_ar\s*:/.test(b6), 'morning-006 source block declares NO translation_ar field');
for (const l of IMPL) {
  const t = card6['translation_' + l];
  ok(!/[\p{Nd}]/u.test(t), `Card 06 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t), `Card 06 ${l}: no footnote digit-brackets`);
  ok(!/Allahumme|asbahn|amsain|aṣbaḥ|nusyūr|nushúr|nuşûr|ileyke/i.test(t), `Card 06 ${l}: no transliteration`);
  ok(!/­/.test(t), `Card 06 ${l}: no soft hyphen`);
}

console.log('\n================ 3. Per-lang MORNING totals + ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
const MORN_EXPECT = { en: 22, ur: 22, tr: 22, bn: 22, es: 22, id: 22, de: 22, fr: 22, ms: 22 }; // Card 22 complete: uniform 22
for (const l of ALL9) {
  ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === MORN_EXPECT[l], `morning region translation_${l}: EXACTLY ${MORN_EXPECT[l]}`);
}
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere (Arabic UI = zero translation blocks)');

console.log('\n================ 4. Card 06 Arabic text/source/repeat byte-identical ================');
ok(b6.includes("text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.'"), 'Card 06 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b6.includes("source: { ref: 'رواه الترمذي', sourceUrl: null }"), "Card 06 source stays «رواه الترمذي» (Tirmidhi is within HadeethEnc's attribution)");
ok(b6.includes('repeat: 1,') && b6.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 06 repeat stays 1 («مرة واحدة»)");

console.log('\n================ 5. Cards 01-05 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) translation intact');
ok(card5.id === 'morning-005' && typeof card5.translation_de === 'string' && typeof card5.translation_ms === 'string', 'Card 05: HAS ms (akuislam) + de (filled by the PENDING ticket)');
ok(['en','fr','ur','tr','bn','ms','de','es','id'].every((l) => typeof card5['translation_' + l] === 'string'), 'Card 05 carries all 9 translations');
for (let c = 0; c < 4; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations (incl. de/fr/ms)`);
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 4, `evening region translation_${l} still EXACTLY 4 (untouched)`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields (untouched)');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 items + prayer list intact');

console.log('\n================ 6. Renderers — generic read, NO fallback (fr/ms/ar show nothing for Card 06), ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server.js reads translation_{lang} in exactly ONE place');
ok((appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'app.js reads translation_{lang} in exactly ONE place');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain anywhere (missing field ⇒ no block; /fr and /ms get no English)');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), "server.js: ar-gate intact");
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc), 'server.js: ur ⇒ dir=rtl, others ltr');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'server.js: translation ABOVE the Arabic text');
ok(/trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'app.js: ur ⇒ dir=rtl');

console.log('\n================ 7. NO runtime external translation requests (all static) ================');
ok(!/hadeethenc\.com/i.test(dataSrc) && !/hadeethenc\.com/i.test(srvSrc) && !/hadeethenc\.com/i.test(appSrc), 'no hadeethenc.com URL in azkar-data/server/app');
ok(!/akuislam\.com/i.test(dataSrc) && !/quranenc\.com/i.test(dataSrc), 'no akuislam.com/quranenc.com URL in azkar-data');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch (pure static data)');

console.log('\n================ 8. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=1[3-9]|js\/azkar-data\.js\?v=[2-9]\d/.test(htmlSrc), 'index.html azkar-data.js?v >= 13 (later tickets bump it)');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer — no app.js edit)');
ok(/CACHE_VERSION = 'v5(09|[1-9]\d)'/.test(swSrc), "sw.js CACHE_VERSION v509+ (later tickets bump it)");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
