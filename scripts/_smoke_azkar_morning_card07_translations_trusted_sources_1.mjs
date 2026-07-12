// Smoke — AZKAR-MORNING-DUA-CARD-07-SAYYIDUL-ISTIGHFAR-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-007 («سيد الاستغفار», Bukhari) gains ALL 9 STATIC translations of the DUA MEANING ONLY — no narrator
// intro ("The best way of seeking…"), no transliteration, no virtue sentence (the virtue stays in the separate
// Arabic `virtue` field), no explanation/footnotes/numbers. Sources: en/ur/tr/bn/de/es/id = HadeethEnc
// encyclopedia (hadith 5503; bracketed dua meaning sliced verbatim; ur punctuation-space normalized only);
// fr = Hisnii morning invocations (invocation 10 — HadeethEnc has no fr for 5503); ms = akuislam istighfar
// guide ("Maksudnya" text; cites Bukhari & Abu Dawud). ar never renders a block. Cards 01-06 untouched.
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
const card7 = M[6];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// per-lang anchors: dua opening ("O Allah, You are my Lord") + servant + forgive-sins closing;
// NOT: narrator intro, transliteration, virtue (Paradise wording)
const ANCHOR = {
  en: { start: 'O Allah, You are my Lord', has: ['Your slave', 'none can forgive sins but You'], not: ['best way', 'Paradise', 'Allāhumma', 'whoever says'] },
  fr: { start: 'Ô Allah ! Tu es mon Seigneur', has: ['Ton serviteur', 'ne pardonnes les péchés', "[digne d’être adorée]"], not: ['Allâhumma', 'Paradis', 'Khalaqtanî'] },
  ur: { start: 'اے اللہ! تو میرا رب ہے', has: ['تیرا بندہ', 'مغفرت کرنے والا نہیں'], not: ['جنتی', 'سید الاستغفار', 'اے اللہ !'] },
  tr: { start: 'Allah’ım! Sen benim Rabbimsin', has: ['senin kulunum', 'affedecek yoktur'], not: ['Cennet', 'Seyyidu'] },
  bn: { start: 'হে আল্লাহ, আপনিই আমার রব', has: ['আপনার বান্দা', 'ক্ষমা করুন'], not: ['জান্নাতবাসী', 'সাইয়্যেদুল'] },
  ms: { start: 'Ya Allah, Engkaulah Tuhanku', has: ['hamba Mu', 'mengampuni dosa-dosaku selain Engkau'], not: ['Allaahumma', 'Riwayat', 'Maksudnya', 'Kholaq'] },
  de: { start: 'O Allah, Du bist mein Herr', has: ['Dein Diener', 'niemand vergibt Sünden außer Dir'], not: ['Paradieses', 'Führer des Bittens'] },
  es: { start: '¡Oh, Al-lah!, Tú eres mi Señor', has: ['Tu Siervo', 'nadie perdona los pecados sino Tú'], not: ['Al-lahumma', 'paraíso', 'jalaqtani'] },
  id: { start: 'Ya Allah! Engkau adalah Tuhanku', has: ['hamba-Mu', 'mengampuni dosa selain Engkau'], not: ['Allāhumma', 'surga', 'khalaqtanī'] },
};

console.log('================ 1. Card 07 = morning-007 — ALL 9 translations (dua meaning only) ================');
ok(card7 && card7.id === 'morning-007', "AzkarMorning[6].id === 'morning-007' (actual id confirmed)");
ok(card7.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card7['translation_' + l];
  const a = ANCHOR[l];
  ok(typeof t === 'string' && t.length > 200, `Card 07 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t).startsWith(N(a.start)), `Card 07 ${l}: starts with the dua opening («${a.start.slice(0, 28)}…»)`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 07 ${l}: servant + forgive-sins anchors present (full dua)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 07 ${l}: NO narrator intro / NO virtue / NO transliteration`);
  ok(!/[\p{Nd}]/u.test(t), `Card 07 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 07 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Card 07 — NO ar + virtue stays in the separate Arabic field ================');
ok(card7.translation_ar === undefined, 'Card 07 has NO translation_ar (Arabic UI shows no block)');
const b7 = dataSrc.slice(dataSrc.indexOf("id: 'morning-007'"), dataSrc.indexOf("id: 'morning-008'"));
ok(!/translation_ar\s*:/.test(b7), 'morning-007 source block declares NO translation_ar field');
ok(b7.includes('من قالها موقنًا بها حين يصبح'), 'virtue field (Arabic) untouched — kept OUTSIDE the translations');

console.log('\n================ 3. Per-lang MORNING totals — UNIFORM 7 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
const _EXP9 = { en: 10, ur: 10, tr: 10, bn: 10, es: 10, id: 10, de: 10, fr: 10, ms: 10 }; // Card 10 complete: uniform 10
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === _EXP9[l], `morning region translation_${l}: EXACTLY ${_EXP9[l]}`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 4. Card 07 Arabic text/source/repeat byte-identical ================');
ok(b7.includes("text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.'"), 'Card 07 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b7.includes("source: { ref: 'رواه البخاري', sourceUrl: null }"), "Card 07 source stays «رواه البخاري»");
ok(b7.includes('repeat: 1,') && b7.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 07 repeat stays 1 («مرة واحدة»)");
ok(b7.includes("authenticity: 'sahih'"), 'Card 07 authenticity stays sahih');

console.log('\n================ 5. Cards 01-06 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
ok(typeof M[4].translation_de === 'string' && typeof M[5].translation_fr === 'string' && typeof M[5].translation_ms === 'string', 'Cards 05/06 pending fields intact (de/fr/ms)');
for (let c = 0; c < 6; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations`);
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 4, `evening region translation_${l} still EXACTLY 4`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 6. Renderers untouched — generic read, no fallback, ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), 'server ar-gate intact');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 7. NO runtime external translation requests ================');
ok(!/hadeethenc\.com|akuislam\.com|hisnii\.com|islamische-datenbank|quranenc\.com/i.test(dataSrc), 'no source URLs in azkar-data');
ok(!/hadeethenc\.com|akuislam\.com|hisnii\.com/i.test(srvSrc) && !/hadeethenc\.com|akuislam\.com|hisnii\.com/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 8. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=1[5-9]|js\/azkar-data\.js\?v=[2-9]\d/.test(htmlSrc), 'index.html azkar-data.js?v >= 15 (later tickets bump it)');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v5(1[1-9]|[2-9]\d)'/.test(swSrc), "sw.js CACHE_VERSION v511+ (later tickets bump it)");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
