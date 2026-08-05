// Smoke — AZKAR-EVENING-DUA-CARD-23-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-023 = «اللهم صل وسلم على نبينا محمد» (10x, source ref «سورة الأحزاب 56، والحديث الصحيح», authenticity 'sahih',
// virtue = separate Arabic field) gains the 9 static non-ar MEANING translations. LAST evening card (23/23).
// FOUR meanings each: ①vocative to Allah ②send blessings/salat ③send peace/salam (a SECOND distinct act) ④our Prophet Muhammad.
// ⛔ HARD BAN: the long Ibrahimic formula, the Prophet's family, Ibrahim's family, the "as You blessed" clause, the
// separate "and bless" petition, the closing praise couplet, and ANY longer wording — this card is the short form only.
// STRATEGY: 4 REUSE byte-identical to morning-025 (en/tr/bn/ms) + 5 DIVERGE (fr/es = vocative ONLY; ur = drop the
// embedded honorific formula; de = twin was verbless; id = twin left the verb in parentheses).
// morning-025 is DELIBERATELY left untouched — the vocative-unification work is registered as separate future work.
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
const card = E.find(d => d.id === 'evening-023');
const twin = M.find(d => d.id === 'morning-025');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const REUSE = ['en', 'tr', 'bn', 'ms'];
const DIVERGE = ['fr', 'ur', 'de', 'es', 'id'];

// FOUR meanings — targeted markers per language
const M1 = { en: 'O Allah', fr: 'Ô Allah', ur: 'اے اللہ', tr: 'Allahım', bn: 'হে আল্লাহ', ms: 'Ya Allah', de: 'O Allāh', es: 'Oh Allah', id: 'Ya Allah' };
const M2 = { en: 'send prayers', fr: 'Accorde Tes bénédictions', ur: 'درود', tr: 'salât', bn: 'সালাত', ms: 'limpahkan selawat', de: 'sprich Gebete', es: 'bendiciones', id: 'limpahkanlah shalawat' };
const M3 = { en: 'peace', fr: 'la paix', ur: 'سلام', tr: 'selâm', bn: 'সালাম', ms: 'salam', de: 'Friedensgrüße', es: 'paz', id: 'salam' };
const M4 = { en: 'our Prophet Muhammad', fr: 'notre Prophète Muhammad', ur: 'ہمارے نبی محمد', tr: 'Peygamberimiz Muhammed', bn: 'আমাদের নবী মুহাম্মাদের', ms: 'Nabi kami Muhammad', de: 'unseren Propheten Muḥammad', es: 'nuestro Profeta Muhammad', id: 'Nabi kami Muhammad' };
const M_ALL = [M1, M2, M3, M4];

// ⛔ the long Ibrahimic formula and every one of its parts
const IBRAHIM = /Ibrahim|Ibrāhīm|İbrahim|Abraham|ইবরাহীম|ইব্রাহীম|ابراہیم|إبراهيم|إبْرَاهِيم/i;
const AAL = /family of (Muhammad|Ibrahim)|famille de (Muhammad|Ibrahim)|Familie (des |von )?(Muhammad|Ibrahim)|keluarga (Muhammad|Nabi Ibrahim)|âl-i|âline|ailesine|আলে মুহাম্মাদ|পরিবারবর্গের|آل محمد|آل ابراہیم|la familia de (Muhammad|Ibrahim)/i;
const AS_YOU = /as You (sent|blessed|did|have)|comme Tu as (béni|accordé)|wie Du .* gesegnet|sebagaimana Engkau|seperti Engkau|كما صليت|جیسا کہ تو نے|যেমন আপনি|como (bendijiste|bendecist)|salât ettiğin gibi|rahmet ettiğin gibi/i;
const BARIK = /\band bless\b|\bbārik\b|\bbarik\b|Et bénis|und segne|berkatilah|berkahilah|bereketli kıl|mübarek kıl|বরকত|برکت|bendice a|bendice sobre/i;
const PRAISE = /Worthy of Praise|Full of Glory|Praiseworthy|digne de louange|plein de gloire|Preiswürdig|Ruhmvoll|Maha Terpuji|Maha Mulia|Hamîd|Mecîd|Övgüye|প্রশংসিত|মহিমান্বিত|حمید|مجید|Alabado|Glorioso/i;
// ⛔ the honorific formula embedded INSIDE a translation block (the ur twin's defect)
const HONORIFIC = /صلی اللہ علیہ وسلم|صلى الله عليه وسلم|ﷺ|sallallahu|salla-?llāhu|sallallahu alaihi|peace be upon him|\bPBUH\b|\bSAW\b|que la paix soit sur lui|Friede sei auf ihm|la paz sea con él|সাল্লাল্লাহু/i;
// ⛔ reference / attribution / repeat / grade
const REF = /رواه|Bukhari|Buhârî|Tirmidh|Tirmizî|\bNasai\b|Ahmad\b|حصن المسلم|الأحزاب|Ahzab|Ahzâb|33\s*:\s*56|عشر مرات|ten times|sepuluh kali|on kere|zehnmal|diez veces|দশ বার|دس مرتبہ|\bsahih\b|صحيح|Riwayat/i;
// ⛔ virtue / reward
const VIRTUE = /ten blessings|will send .* upon him tenfold|dix fois|zehnfach|diez veces|sepuluh kali|on misli|দশটি|دس گنا|reward|pahala|ödül|Belohnung|recompensa|ثواب|اجر|সওয়াব/i;
// ⛔ transliteration of THIS dhikr
const TRANSLIT = /Allahumma|Allāhumma|Allahoumma|\bsalli\b|\bṣalli\b|wa sallim|wasallim|nabiyyina|nabiyina|ala nabina/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-023 identity + all 9 translations, FOUR meanings ================');
ok(!!card && card.id === 'evening-023', 'AzkarEvening has evening-023');
ok(card.type === 'dhikr' && card.order === 23 && E.length === 23, 'card is a dhikr, order 23; evening list still 23 items (LAST card)');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 20, `evening-023 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(M_ALL.every(mm => has(t, mm[l])), `${l}: ALL four meanings preserved (vocative + salat + salam + our Prophet Muhammad)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
}

console.log('\n================ 2. ⛔ SHORT FORM ONLY — no Ibrahimic salawat, no family, no barik, no praise couplet ================');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(!IBRAHIM.test(N(t)), `${l}: NO Ibrahim anywhere (no Ibrahimic formula)`);
  ok(!AAL.test(N(t)), `${l}: NO «family of Muhammad» / «family of Ibrahim»`);
  ok(!AS_YOU.test(N(t)), `${l}: NO «as You blessed …» clause`);
  ok(!BARIK.test(N(t)), `${l}: NO separate «and bless» petition`);
  ok(!PRAISE.test(N(t)), `${l}: NO closing praise couplet («Worthy of Praise, Full of Glory»)`);
  ok(t.length < 120, `${l}: short form — ${t.length} chars (< 120), not a longer variant`);
  ok((t.match(/[.!。।۔]/g) || []).length <= 2, `${l}: at most one petition (no chained second sentence beyond the vocative break)`);
}

console.log('\n================ 3. ⛔ NO honorific formula / reference / repeat / virtue / transliteration inside the block ================');
for (const l of ALL9) ok(!HONORIFIC.test(N(card['translation_' + l])), `${l}: NO embedded honorific formula inside the translation block`);
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/attribution/repeat/grade token`);
for (const l of ALL9) ok(!VIRTUE.test(card['translation_' + l]), `${l}: no virtue/reward wording`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 4. The nine USER-APPROVED strings, byte-exact ================');
const GOLD = {
  en: 'O Allah, send prayers and peace upon our Prophet Muhammad.',
  fr: 'Ô Allah ! Accorde Tes bénédictions et la paix à notre Prophète Muhammad.',
  ur: 'اے اللہ، ہمارے نبی محمد پر درود و سلام بھیج۔',
  tr: "Allahım! Peygamberimiz Muhammed'e salât ve selâm eyle.",
  bn: 'হে আল্লাহ! আপনি সালাত ও সালাম পেশ করুন আমাদের নবী মুহাম্মাদের উপর।',
  ms: 'Ya Allah, limpahkan selawat dan salam atas Nabi kami Muhammad.',
  de: 'O Allāh, sprich Gebete über unseren Propheten Muḥammad und sende ihm Friedensgrüße.',
  es: 'Oh Allah, concede paz y bendiciones a nuestro Profeta Muhammad.',
  id: 'Ya Allah, limpahkanlah shalawat dan salam atas Nabi kami Muhammad.'
};
for (const l of ALL9) ok(card['translation_' + l] === GOLD[l], `${l}: exact USER-APPROVED string`);

console.log('\n================ 5. fr/es vocative decision — Ô Allah / Oh Allah, and NOT Ô Seigneur / Oh Señor ================');
ok(has(card.translation_fr, 'Ô Allah'), 'fr USES «Ô Allah»');
ok(!has(card.translation_fr, 'Ô Seigneur') && !has(card.translation_fr, 'Seigneur'), 'fr does NOT use «Ô Seigneur»');
ok(has(card.translation_es, 'Oh Allah'), 'es USES «Oh Allah»');
ok(!has(card.translation_es, 'Oh Señor') && !has(card.translation_es, 'Señor'), 'es does NOT use «Oh Señor»');
// the change is VOCATIVE-ONLY: the publisher's sentence body is kept word for word
ok(card.translation_fr === twin.translation_fr.replace('Ô Seigneur', 'Ô Allah'), 'fr: vocative-ONLY divergence — sentence body byte-identical to the twin');
ok(card.translation_es === twin.translation_es.replace('Oh Señor', 'Oh Allah'), 'es: vocative-ONLY divergence — sentence body byte-identical to the twin');

console.log('\n================ 6. Strategy — 4 REUSE byte-identical, 5 DIVERGE with stated defects ================');
for (const l of REUSE) ok(card['translation_' + l] === twin['translation_' + l], `${l}: REUSE — byte-identical to morning-025`);
for (const l of DIVERGE) ok(card['translation_' + l] !== twin['translation_' + l], `${l}: DIVERGE — differs from morning-025`);
// ur — the twin's embedded honorific is the ONLY removal
ok(HONORIFIC.test(N(twin.translation_ur)), 'ur: the twin DOES carry the embedded honorific (the defect being corrected)');
ok(card.translation_ur === twin.translation_ur.replace(' صلی اللہ علیہ وسلم', ''), 'ur: divergence is EXACTLY the removal of the embedded honorific — nothing else changed');
// de — the twin is verbless; the new string carries two separate imperatives
ok(!/\bsprich\b|\bsende\b|\bschenke\b|\bgib\b/i.test(twin.translation_de), 'de: the twin carries NO finite verb (the defect being corrected)');
ok(/\bsprich\b/.test(card.translation_de) && /\bsende\b/.test(card.translation_de), 'de: two separate imperatives «sprich» + «sende» — ② and ③ are real petitions');
// id — the twin parenthesises its only verb
ok(/\(sampaikanlah\)/.test(twin.translation_id), 'id: the twin parenthesises its only verb (the defect being corrected)');
ok(!/[()]/.test(card.translation_id) && /limpahkanlah/.test(card.translation_id), 'id: verb is overt and unparenthesised');
for (const l of ALL9) ok(!/[()]/.test(card['translation_' + l]), `${l}: no parenthesised insertion anywhere`);

console.log('\n================ 7. morning-025 UNTOUCHED — deferred work registered, NOT implemented ================');
ok(card.text === twin.text, 'evening-023 Arabic is byte-identical to the morning-025 twin (same dhikr)');
// morning-025 is the LAST morning card, so bound the slice at the evening array — never at EOF
const bM25 = dataSrc.slice(dataSrc.indexOf("id: 'morning-025'"), dataSrc.indexOf('window.AzkarEvening'));
ok(!has(bM25, 'AZKAR-EVENING-DUA-CARD-23'), 'morning-025 block carries NO evening-ticket marker (untouched)');
ok(twin.translation_fr === 'Ô Seigneur ! Accorde Tes bénédictions et la paix à notre Prophète Muhammad.', 'morning-025 fr still «Ô Seigneur» — the vocative-unification work was NOT executed');
ok(twin.translation_es === 'Oh Señor, concede paz y bendiciones a nuestro Profeta Muhammad.', 'morning-025 es still «Oh Señor» — the vocative-unification work was NOT executed');
ok(twin.translation_ur === 'اے اللہ، ہمارے نبی محمد صلی اللہ علیہ وسلم پر درود و سلام بھیج۔', 'morning-025 ur still carries the embedded honorific — NOT corrected here');
ok(twin.translation_de === 'O Allah, Segen und Frieden auf unserem Propheten Muhammad.', 'morning-025 de still verbless — NOT corrected here');
ok(twin.translation_id === 'Ya Allah, (sampaikanlah) shalawat dan salam kepada Nabi kami Muhammad.', 'morning-025 id still parenthesised — NOT corrected here');
ok(M.length === 25 && M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 8. Arabic + NO translation_ar + source/repeat/virtue/authenticity unchanged ================');
const b23 = dataSrc.slice(dataSrc.indexOf("id: 'evening-023'"));
ok(card.text === 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.', 'Arabic text byte-identical to the shipped literal');
ok(card.translation_ar === undefined && !/translation_ar\s*:/.test(b23), 'evening-023 has NO translation_ar (object + source block)');
ok(card.source && card.source.ref === 'سورة الأحزاب 56، والحديث الصحيح', 'source ref «سورة الأحزاب 56، والحديث الصحيح» unchanged');
ok(card.repeat === 10 && card.repeatLabel && card.repeatLabel.ar === 'عشر مرات' && card.repeatLabel.en === 'ten times', 'repeat 10 «عشر مرات» / «ten times» unchanged');
ok(card.authenticity === 'sahih', "authenticity stays 'sahih' (unchanged)");
ok(card.authenticityNote === null, 'authenticityNote stays null (unchanged)');
ok(card.title === null, 'title stays null (unchanged)');
ok(card.virtue && typeof card.virtue.ar === 'string' && card.virtue.en === null, 'virtue stays an Arabic-only separate field (NOT translated)');
ok(ALL9.every(l => !has(card['translation_' + l], 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ') && !has(card['translation_' + l], 'عشرًا')), 'virtue wording did NOT leak into any translation block');
for (const l of ALL9.filter(x => x !== 'ur')) ok(!/[ء-ي]/.test(card['translation_' + l]), `${l}: no extra Arabic script inside the block`);

console.log('\n================ 9. Block carries NO URL/domain (bare source names only) ================');
ok(!/https?:\/\//.test(b23) && !/\.(com|org|net|my|app|fr|de|es)\b/i.test(b23), 'evening-023 block (incl. comment) carries NO URL/domain (TLD)');
ok(!/https?:\/\/|www\.|\.(com|org|net|my|app|fr|de|es)\b|\bor\.id\b/i.test(dataSrc), 'no source URLs/domains (TLD) anywhere in azkar-data — bare book/source names only');
ok(has(b23, 'AZKAR-EVENING-DUA-CARD-23-TRANSLATIONS'), 'evening-023 block carries the ticket provenance comment');
ok(/vocative choice here is a per-card meaning decision/i.test(b23), 'provenance comment records that the vocative is a PER-CARD decision, not a corpus rule');
ok(/registered as its own separate future work and is NOT applied here/i.test(b23), 'provenance comment records the unification work as registered-but-not-applied');
ok(/morning-025 is\s*\n?\s*\/\/ deliberately left exactly as it is|deliberately left exactly as it is/i.test(b23), 'provenance comment records that morning-025 is deliberately left as is');

console.log('\n================ 10. Per-region counts — evening 23, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 23, `evening region translation_${l}: EXACTLY 23 (001-004 Quran + 005-023 dua) — the whole page`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 11. ALL 23 evening cards now translated; 01-22 intact ================');
for (let n = 1; n <= 23; n++) {
  const id = 'evening-0' + String(n).padStart(2, '0');
  const c = E.find(d => d.id === id);
  ok(!!c && ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
// frozen spot-check of the previously closed card, proving 01-22 were not disturbed
const c22 = E.find(d => d.id === 'evening-022');
ok(c22.translation_en === 'I seek refuge in the perfect words of Allah from the evil of what He has created.', 'evening-022 en frozen (Card 22 untouched)');
ok(c22.translation_de === 'Ich nehme Zuflucht mit Allāhs vollkommenen Worten vor dem Übel dessen, was Er erschaffen hat.', 'evening-022 de frozen (Card 22 untouched)');
const c21 = E.find(d => d.id === 'evening-021');
ok(c21.translation_de === M.find(d => d.id === 'morning-021').translation_de, 'evening-021 de still REUSE-identical to its twin (Card 21 untouched)');
ok(M.length === 25 && E.length === 23 && P.length === 17, '25 morning + 23 evening + 17 prayer intact');

console.log('\n================ 12. Renderers (server.js / app.js) untouched — no runtime external translation ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
ok(!/fetch\s*\(|XMLHttpRequest|translate\.google|api\.|googleapis/i.test(dataSrc), 'azkar-data.js makes NO runtime request — translations are 100% static');

console.log('\n================ 13. Cache-busters bumped (azkar-data.js?v=55 + sw v553; app.js?v=842 + style.css?v=500 STABLE) ================');
ok(/js\/azkar-data\.js\?v=55\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=55');
ok(!/js\/azkar-data\.js\?v=54\b/.test(htmlSrc), 'no stale ?v=54 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v553'/.test(swSrc), "sw.js CACHE_VERSION = 'v553'");
ok(/js\/app\.js\?v=842\b/.test(htmlSrc) && /style\.css\?v=500\b/.test(htmlSrc), 'app.js?v=842 + style.css?v=500 STABLE (NOT bumped)');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
