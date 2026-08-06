// Smoke — AZKAR-EVENING-DUA-CARD-22-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-022 = «أعوذ بكلمات الله التامات من شر ما خلق» (3x, source ref «ورد في كتب الأذكار», authenticity null,
// authenticityNote + virtue = separate Arabic fields) gains the 9 static non-ar MEANING translations.
// FIRST evening card with NO morning counterpart anywhere in the data file → all NINE are independently sourced NATIVE
// renderings, zero reuse baseline. morning-022 is a DIFFERENT dhikr and must NOT be used.
// FIVE meanings each: ①seek-refuge ②WORDS of Allah ③PERFECT/complete ④from the EVIL ⑤of WHAT HE CREATED.
// ⛔ SEMANTIC RULE: the relative/genitive must attach to the CREATED THING, never to the evil — a rendering meaning
// "the evil that He created" makes evil itself the created object and is rejected (this is what disqualified the first
// ms candidate). ⛔ ALSO REJECTED: longer narration, wrath-and-punishment variant, alighting-at-a-place context, fadl.
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
const card = E.find(d => d.id === 'evening-022');
const morn22 = M.find(d => d.id === 'morning-022');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// FIVE meanings — targeted markers per language
const M1 = { en: 'I seek refuge', fr: 'Je me réfugie', ur: 'پناہ چاہتا ہوں', tr: 'sığınırım', bn: 'আশ্রয় চাচ্ছি', ms: 'Aku berlindung', de: 'Ich nehme Zuflucht', es: 'Me refugio', id: 'Aku berlindung' };
const M2 = { en: 'words of Allah', fr: 'paroles', ur: 'کلمات', tr: 'kelimelerine', bn: 'কালেমাসমূহের', ms: 'kalimah-kalimah', de: 'Worten', es: 'palabras', id: 'kalimat-kalimat' };
const M3 = { en: 'perfect', fr: 'parfaites', ur: 'مکمل', tr: 'eksiksiz', bn: 'পরিপূর্ণ', ms: 'sempurna', de: 'vollkommenen', es: 'perfectas', id: 'sempurna' };
const M4 = { en: 'the evil', fr: 'le mal', ur: 'شر', tr: 'şerrinden', bn: 'অনিষ্ট', ms: 'kejahatan', de: 'Übel', es: 'del mal', id: 'kejahatan' };
const M5 = { en: 'of what He has created', fr: "de ce qu'Il a créé", ur: 'ان تمام چیزوں', tr: 'Yarattıklarının', bn: 'তাঁর সৃষ্টির', ms: 'segala makhluk yang Dia ciptakan', de: 'dessen, was Er erschaffen hat', es: 'de lo que ha creado', id: 'sesuatu yang diciptakan-Nya' };
const M_ALL = [M1, M2, M3, M4, M5];

// ⛔ THE SEMANTIC TRAP — renderings that make the EVIL the created object
const COLLAPSE = { en: 'the evil He has created', fr: "le mal qu'Il a créé", ur: null, tr: null, bn: null, ms: 'segala keburukan', de: 'Übel, das Er erschaffen', es: 'del mal que ha creado', id: 'kejahatan yang diciptakan-Nya' };
// ⛔ longer / other variants
const LONGER = /upright nor the corrupt|ni le pieux ni le pervers|ذرأ|برأ|ينزل من السماء|every devil|vermin|envious eye|كل شيطان|هامة|عين لامة|Zorn und (Seiner )?Strafe|غضبه|عقابه|شر عباده|همزات/i;
// ⛔ the alighting-at-a-place narration frame
const CONTEXT = /alights|alighting|whoever stops|nazala manzil|من نزل منزل|Quien haga una parada|singgah|menumpang|konaklama|নেমে|جو کسی جگہ اترے|Wer an einem Ort/i;
// ⛔ virtue / reward
const VIRTUE = /nothing will harm|no le hará daño|nada lo lastimará|kein Gift|tidak akan membahayakan|zarar veremez|ক্ষতি করতে পারবে না|لا تضره|حمة|scorpion|venom|sting/i;
// forbidden: reference / attribution / repeat / hadith number / grade
const REF = /رواه|\bمسلم\b|\bMuslim\b|Tirmidh|Ahmad\b|\bHisn\b|حصن المسلم|ثلاث مرات|three times|tiga kali|üç kere|dreimal|tres veces|তিন বার|تین مرتبہ|\bsahih\b|صحيح|Riwayat/i;
// forbidden: transliteration of THIS dhikr
const TRANSLIT = /A'?udhu|aʿūḏu|Eûzu|bikalimati|bi kalimat|at-?tammat|t-tāmmāti|min sharri|min šarri|ma khalaq|mā ẖalaqa/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-022 identity + all 9 translations, FIVE meanings ================');
ok(!!card && card.id === 'evening-022', 'AzkarEvening has evening-022');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 30, `evening-022 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(M_ALL.every(mm => has(t, mm[l])), `${l}: ALL five meanings preserved (refuge + words + perfect + evil + what-He-created)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ⛔ THE SEMANTIC RULE — the evil is NEVER the created object ================');
for (const l of ALL9) {
  const t = N(card['translation_' + l]);
  ok(has(t, M4[l]) && has(t, M5[l]), `${l}: ④ evil (${M4[l]}) AND ⑤ created-thing (${M5[l]}) both present & distinct`);
  if (COLLAPSE[l]) ok(!has(t, COLLAPSE[l]), `${l}: does NOT carry the collapsing rendering «${COLLAPSE[l]}»`);
}
// the three inflection-decided cases, asserted on the exact tokens
ok(has(card.translation_de, 'dessen, was Er erschaffen hat') && !has(card.translation_de, 'das Er erschaffen'), 'de: genitive correlate «dessen, was» (an accusative one would bind the evil instead)');
ok(has(card.translation_ur, 'جو اس نے پیدا کی ہیں'), 'ur: feminine-plural agreement binds the THINGS, not the (masc. sg.) evil');
ok(has(card.translation_tr, 'Yarattıklarının şerrinden'), 'tr: participle sits inside the possessor, so it cannot reach «şer»');
ok(has(card.translation_ms, 'kejahatan segala makhluk yang Dia ciptakan'), 'ms: a created-thing noun separates the head from the relative clause');
ok(has(card.translation_es, 'del mal de lo que ha creado'), 'es: «de lo que» free relative (not the collapsing «del mal que»)');
ok(has(card.translation_id, 'kejahatan sesuatu yang diciptakan-Nya'), 'id: relative hangs off «sesuatu»');

console.log('\n================ 3. ⛔ NO longer variant / other dhikr / narration context / virtue ================');
for (const l of ALL9) ok(!LONGER.test(N(card['translation_' + l])), `${l}: NO longer variant or other dhikr`);
for (const l of ALL9) ok(!CONTEXT.test(N(card['translation_' + l])), `${l}: NO alighting-at-a-place narration context`);
for (const l of ALL9) ok(!VIRTUE.test(N(card['translation_' + l])), `${l}: NO virtue/reward wording`);

console.log('\n================ 4. NO reference/attribution/repeat/hadith-number/transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/grade token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 5. ms disclosure + the rejected institutional wording ================');
ok(card.translation_ms === 'Aku berlindung dengan kalimah-kalimah Allah yang sempurna daripada kejahatan segala makhluk yang Dia ciptakan.', 'ms: exact USER-approved string (Option A)');
ok(has(card.translation_ms, 'kalimah-kalimah'), 'ms: PLURAL «kalimah-kalimah» (② restored)');
ok(!has(card.translation_ms, 'keburukan'), 'ms: the rejected institutional wording «segala keburukan …» is ABSENT');
const b22 = dataSrc.slice(dataSrc.indexOf("id: 'evening-022'"), dataSrc.indexOf("id: 'evening-023'"));
ok(/SELF-DECLARED/i.test(b22), 'ms: provenance comment records that the affiliation is SELF-DECLARED');
ok(/NOT as an institutional release/i.test(b22), 'ms: provenance comment refuses to present it as an institutional release');
ok(/backs the PHRASING only/i.test(b22), 'ms: the al-Falaq parallel is cited for PHRASING only, not as the text source');

console.log('\n================ 6. NO morning twin — morning-022 is a DIFFERENT dhikr and is untouched ================');
ok(card.text !== morn22.text, 'evening-022 Arabic !== morning-022 Arabic (different dhikr)');
ok(!has(morn22.text, 'التَّامَّاتِ'), 'morning-022 does NOT contain «التامات» (it is the longer tasbih)');
ok((dataSrc.match(/التَّامَّاتِ/g) || []).length === 1, '«التامات» occurs EXACTLY ONCE in the whole data file (no twin anywhere)');
const bM22 = dataSrc.slice(dataSrc.indexOf("id: 'morning-022'"), dataSrc.indexOf("id: 'morning-023'"));
ok(!has(bM22, 'AZKAR-EVENING-DUA-CARD-22'), 'morning-022 block carries NO evening-ticket marker (untouched)');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 7. Arabic + NO translation_ar + source/repeat/authenticity/authenticityNote/virtue unchanged ================');
ok(card.text === 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', 'Arabic text byte-identical to the shipped literal');
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b22), 'evening-022 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'ورد في كتب الأذكار', 'source ref «ورد في كتب الأذكار» unchanged');
ok(card.repeat === 3 && card.repeatLabel && card.repeatLabel.ar === 'ثلاث مرات', 'repeat 3 «ثلاث مرات» unchanged');
ok(card.authenticity === null, 'authenticity stays null (unchanged)');
ok(card.authenticityNote && typeof card.authenticityNote.ar === 'string' && card.authenticityNote.en === null, 'authenticityNote stays an Arabic-only separate field (NOT translated)');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.en === null, 'virtue stays an Arabic-only separate field (NOT translated)');
ok(ALL9.every(l => !has(card['translation_' + l], 'حمة') && !has(card['translation_' + l], 'راجع المصدر')), 'neither virtue nor authenticityNote wording leaked into any translation block');

console.log('\n================ 8. Block carries NO URL/domain (bare source names only) ================');
ok(!/https?:\/\//.test(b22) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b22), 'evening-022 block (incl. comment) carries NO URL/domain (TLD)');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names only');
ok(has(b22, 'AZKAR-EVENING-DUA-CARD-22-TRANSLATIONS'), 'evening-022 block carries the ticket provenance comment');

console.log('\n================ 9. Per-region counts — evening 23, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 10. Evening 001-023 translated; 024+ untranslated; morning/prayer intact ================');
for (let n = 1; n <= 23; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(23).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 024+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 11. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');

console.log('\n================ 12. Cache-busters bumped (azkar-data.js?v=55 + sw v554; app.js?v=843 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=55\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=55');
ok(!/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'no stale ?v=54 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v554'/.test(swSrc), "sw.js CACHE_VERSION = 'v554'");
ok(/js\/app\.js\?v=843\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=843 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
