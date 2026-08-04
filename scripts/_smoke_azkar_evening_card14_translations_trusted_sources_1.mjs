// Smoke — AZKAR-EVENING-DUA-CARD-14-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-014 = «اللهم عالم الغيب والشهادة، فاطر السماوات والأرض، رب كل شيء ومليكه، أشهد أن لا إله إلا أنت، أعوذ بك من شر
// نفسي، ومن شر الشيطان وشركه، وأن أقترف على نفسي سوءًا، أو أجره إلى مسلم» (Tirmidhi 3392, once, authenticity 'sahih') gains
// the 9 static non-ar MEANING translations. TEN meanings each lang must keep: ①عالم الغيب والشهادة ②فاطر السماوات والأرض
// ③رب كل شيء ④ومليكه (Sovereign/Owner/King — NOT angels) ⑤أشهد أن لا إله إلا أنت ⑥شر نفسي ⑦شر الشيطان ⑧وشركه (his shirk /
// incitement to shirk — NOT allies/troops/angels) ⑨أقترف على نفسي سوءًا (against MYSELF) ⑩أو أجره إلى مسلم (upon A MUSLIM).
// TIME-NEUTRAL: 5 langs (en/ur/tr/bn/de) = morning-014 BYTE-IDENTICAL; fr/es/id/ms DIVERGE by a trusted-source fix (morning-
// 014 deficient): fr «autrui»→«un musulman», es «ángeles»→«Amo», id «bala tentaranya»→«ajakannya menyekutukan Allah»,
// ms «sekutunya»→«godaan untuk berbuat syirik». morning-014 UNTOUCHED. evening-014 Arabic (dagger-alef «إِلَٰهَ») kept AS-IS.
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
const card = E.find(d => d.id === 'evening-014');
const morn = M.find(d => d.id === 'morning-014');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

// TEN meanings — distinctive substrings per language
const MEAN = {
  en: ['unseen and the seen', 'Creator of the heavens and the Earth', 'Lord', 'Sovereign of all things', 'none has the right to be worshipped except You', 'evil of my soul', 'the devil', 'shirk of the devil', 'against my soul', 'another Muslim'],
  fr: ["l'invisible et le visible", 'Créateur des cieux et de la terre', 'Maître', 'Possesseur de toute chose', "n'est d'autre divinité", 'mal de mon âme', 'du diable', "incitation à T'attribuer un associé", 'envers moi-même', 'un musulman'],
  ur: ['غیب اور حاضر', 'آسمانوں اور زمین', 'ہر چیز کے پروردگار', 'مالک', 'عبادت کے لائق نہیں', 'اپنے نفس کے شر', 'شیطان کے شر', 'اس کے شرک', 'اپنے نفس پر برائی', 'کسی مسلمان'],
  tr: ['Gizli ve âşikarı bilen', 'göklerin ve yerin yaratıcısı', 'Her şeyin Rabbi', 'sahibi', 'şehâdet ederim', 'Nefsimin şerrinden', 'Şeytan', 'şirkinin', 'nefsime kötülük', 'bir müslümana'],
  bn: ['গায়েব ও উপস্থিতের', 'আসমানসমূহ ও যমীনের স্রষ্টা', 'সব কিছুর রব্ব', 'মালিক', 'সাক্ষ্য দিচ্ছি', 'আমার আত্মার অনিষ্ট', 'শয়তানের অনিষ্ট', 'তার শির্ক', 'নিজের উপর', 'মুসলিমের'],
  ms: ['mengetahui perkara ghaib dan nyata', 'Pencipta langit dan bumi', 'Tuhan setiap sesuatu', 'Pemiliknya', 'Tiada Tuhan yang berhak disembah', 'kejahatan diriku', 'kejahatan syaitan', 'godaan untuk berbuat syirik', 'terhadap diriku', 'seorang muslim'],
  de: ['Kenner des Verborgenen und des Offenkundigen', 'Erschaffer der Himmel und der Erde', 'Rabb', 'Besitzer aller Dinge', 'Ich bezeuge', 'meiner üblen Seele', 'Übel des Šaiṭān', 'dessen Širk', 'gegen meine Seele', 'einen anderen Muslim'],
  es: ['Conocedor de lo oculto y lo manifiesto', 'Creador de los cielos y de la tierra', 'Señor', 'Amo de todas las cosas', 'no hay divinidad sino Tu', 'mal de mi mismo', 'del Sheitan', 'de su idolatría', 'en contra de mi mismo', 'un musulmán'],
  id: ['Mengetahui yang ghaib dan yang nyata', 'Pencipta langit dan bumi', 'Tuhan segala sesuatu', 'merajainya', 'Aku bersaksi', 'kejahatan diriku', 'setan', 'ajakannya menyekutukan Allah', 'terhadap diriku', 'orang Islam'],
};
// ④ «مليكه» marker (Sovereign/Owner/King — must NOT be angels)
const MALIK = { en: 'Sovereign of all things', fr: 'Possesseur de toute chose', ur: 'مالک', tr: 'sahibi', bn: 'মালিক', ms: 'Pemiliknya', de: 'Besitzer aller Dinge', es: 'Amo de todas las cosas', id: 'merajainya' };
// ⑧ «شركه» marker (shirk / incitement to shirk — must NOT be allies/troops/angels)
const SHIRK = { en: 'shirk of the devil', fr: "incitation à T'attribuer un associé", ur: 'اس کے شرک', tr: 'şirkinin', bn: 'তার শির্ক', ms: 'godaan untuk berbuat syirik', de: 'dessen Širk', es: 'de su idolatría', id: 'ajakannya menyekutukan Allah' };
// ⑨ «على نفسي» marker
const SELF = { en: 'against my soul', fr: 'envers moi-même', ur: 'اپنے نفس پر', tr: 'nefsime', bn: 'নিজের উপর', ms: 'terhadap diriku', de: 'gegen meine Seele', es: 'en contra de mi mismo', id: 'terhadap diriku' };
// ⑩ «إلى مسلم» marker
const MUSLIM = { en: 'another Muslim', fr: 'un musulman', ur: 'کسی مسلمان', tr: 'bir müslümana', bn: 'মুসলিমের', ms: 'seorang muslim', de: 'einen anderen Muslim', es: 'un musulmán', id: 'orang Islam' };

// forbidden: «شركه» degraded to allies / troops / angels; and the specific rejected morning tokens
const FORBIDDEN = /\bautrui\b|ángeles|bala tentaranya|sekutunya|his allies|his troops|ses alliés|ses troupes|Verbündete/i;
// forbidden: reference / repeat / source / narrator / hadith number
const REF = /رواه|الترمذي|Tirmidh|Tirmiz|Abu Daw|Ebû Dâvûd|\bHisn\b|حصن المسلم|مرة واحدة|\bonce\b|3392|5067/i;
// forbidden: romanized transliteration of THIS dua
const TRANSLIT = /Allahumma alima|al-ghayb|fatiras samawat|rabba kulli|ashhadu an la ilaha|a'?udhu bika|sharri nafsi|wa shirkihi/i;
const VIRTUE_LEAK = /كفاه الله|أهل العلم|إسناد/;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-014 identity + all 9 translations, TEN meanings ================');
ok(!!card && card.id === 'evening-014', 'AzkarEvening has evening-014');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 120, `evening-014 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL ten meanings preserved`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ④ «مليكه» = Sovereign/Owner/King (NOT angels) ================');
for (const l of ALL9) ok(has(card['translation_' + l], MALIK[l]), `${l}: ④ «مليكه» kept (${MALIK[l]})`);

console.log('\n================ 3. ⑧ «شركه» = shirk/incitement (NOT allies/troops/angels) + rejected tokens absent ================');
for (const l of ALL9) ok(has(card['translation_' + l], SHIRK[l]), `${l}: ⑧ «شركه» kept as shirk/incitement (${SHIRK[l]})`);
for (const l of ALL9) ok(!FORBIDDEN.test(card['translation_' + l]), `${l}: NO allies/troops/angels/autrui degradation`);

console.log('\n================ 4. ⑨ «على نفسي» + ⑩ «إلى مسلم» preserved ================');
for (const l of ALL9) ok(has(card['translation_' + l], SELF[l]), `${l}: ⑨ «على نفسي» kept (${SELF[l]})`);
for (const l of ALL9) ok(has(card['translation_' + l], MUSLIM[l]), `${l}: ⑩ «إلى مسلم» kept (${MUSLIM[l]})`);

console.log('\n================ 5. NO reference/repeat/source/narrator/hadith-number/transliteration/virtue inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat-label/source/narrator/hadith-number token`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);
for (const l of ALL9) ok(!VIRTUE_LEAK.test(card['translation_' + l]), `${l}: no virtue/authenticity-note text leaked in`);

console.log('\n================ 6. Reuse: 5 langs byte-identical morning-014; fr/es/id one-token fix; ms trusted-source rewrite ================');
for (const l of ['en', 'ur', 'tr', 'bn', 'de']) ok(card['translation_' + l] === morn['translation_' + l], `${l}: evening-014 == morning-014 byte-identical (verbatim reuse)`);
ok(card.translation_fr !== morn.translation_fr && morn.translation_fr.replace('ou envers autrui', 'ou envers un musulman') === card.translation_fr, 'fr: ONLY diff vs morning-014 is «autrui»→«un musulman»');
ok(card.translation_es !== morn.translation_es && morn.translation_es.replace('Señor de los ángeles y de todas las cosas', 'Señor y Amo de todas las cosas') === card.translation_es, 'es: ONLY diff vs morning-014 is «los ángeles»→«y Amo»');
ok(card.translation_id !== morn.translation_id && morn.translation_id.replace('setan dan bala tentaranya', 'setan dan ajakannya menyekutukan Allah') === card.translation_id, 'id: ONLY diff vs morning-014 is «bala tentaranya»→«ajakannya menyekutukan Allah»');
ok(card.translation_ms !== morn.translation_ms && has(card.translation_ms, 'godaan untuk berbuat syirik pada Allah') && !card.translation_ms.includes('sekutunya') && !card.translation_ms.includes('bala tentaranya'), 'ms: DIVERGES with «godaan untuk berbuat syirik» (no sekutunya/bala tentaranya)');

console.log('\n================ 7. morning-014 UNTOUCHED (still carries its pre-fix deficient wording) ================');
ok(morn.translation_fr.includes('ou envers autrui'), 'morning-014 fr still has «autrui» (NOT touched)');
ok(morn.translation_es.includes('los ángeles'), 'morning-014 es still has «los ángeles» (NOT touched)');
ok(morn.translation_id.includes('bala tentaranya'), 'morning-014 id still has «bala tentaranya» (NOT touched)');
ok(morn.translation_ms.includes('sekutunya'), 'morning-014 ms still has «sekutunya» (NOT touched)');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 8. Arabic kept AS-IS (dagger-alef «إِلَٰهَ», NOT morning-014) + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
ok(has(card.text, 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ'), 'evening-014 Arabic keeps dagger-alef «إِلَٰهَ» form');
ok(card.text !== morn.text, 'evening-014 Arabic NOT identical to morning-014 (dagger-alef differs) — kept as-is, not overwritten');
ok(card.text.startsWith('اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ') && card.text.endsWith('أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.'), 'Arabic opening «اللهم عالم الغيب والشهادة» + closing «أو أجره إلى مسلم.» intact');
const b14 = dataSrc.slice(dataSrc.indexOf("id: 'evening-014'"), dataSrc.indexOf("id: 'evening-015'"));
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b14), 'evening-014 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'رواه الترمذي', 'source ref «رواه الترمذي» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة', 'repeat 1 «مرة واحدة» unchanged');
ok(card.virtue === null, 'virtue stays null (unchanged)');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");

console.log('\n================ 9. Per-region counts — evening 14, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 22, `evening region translation_${l}: EXACTLY 22 (001-004 Quran + 005-022 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 10. Evening 001-022 translated; 023+ untranslated; prayer intact ================');
for (let n = 1; n <= 22; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(22).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 023+ carry NO translation fields');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');

console.log('\n================ 11. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(has(b14, 'AZKAR-EVENING-DUA-CARD-14-TRANSLATIONS'), 'evening-014 block carries the ticket provenance comment');

console.log('\n================ 12. Cache-busters bumped (azkar-data.js?v=54 + sw v552; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=54');
ok(!/js\/azkar-data\.js\?v=53\b/.test(htmlSrc), 'no stale ?v=53 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v552'/.test(swSrc), "sw.js CACHE_VERSION = 'v552'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
