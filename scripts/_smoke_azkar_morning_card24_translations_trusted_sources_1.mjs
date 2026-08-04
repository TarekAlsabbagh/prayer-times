// Smoke — AZKAR-MORNING-DUA-CARD-24-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-024 («أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.», Bukhari 6307, repeat 100 «مائة مرة», virtue null,
// authenticity sahih) gains ALL 9 static translations — meaning only. Preserve the TWO meanings:
// ① أَسْتَغْفِرُ اللَّهَ (seek Allah's forgiveness) ② وَأَتُوبُ إِلَيْهِ (repent / turn to Him). No repeat label,
// reference (Bukhari), daily-count context, isnad, transliteration, footnotes, or explanation inside the block.
// NO longer/different form: «العظيم» / «أستغفر الله العظيم» / «رب اغفر لي وتب علي». Sources: en=HisnMuslim #96
// («Allaah»→«Allah» normalized); fr=Dar Al Athar #96 (keeps «وأتوب إليه» — Hisnii dropped it, REJECTED);
// ur=IslamHouse 827527 (DOM); tr=İlme Davet #96; bn=HisnMuslim #96-(22); ms=AkuIslam (bertaubat);
// de=printed German edition #96 (German meaning, NOT translit); es=HisnMuslim; id=HisnMuslim (bertobat).
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
const card24 = M[23];
const card23 = M[22];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "I seek Allah's forgiveness and I turn to Him in repentance.",
  fr: "J'implore le pardon d'Allah et à Lui je me repens.",
  ur: "میں اللہ سے مغفرت طلب کرتا ہوں اور اس کے حضور توبہ کرتا ہوں۔",
  tr: "Allah'tan mağfiret diler ve O'na tevbe ederim.",
  bn: "আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি এবং তাঁর নিকটই তাওবা করছি।",
  ms: "Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.",
  de: "Ich bitte Allah um Vergebung und ich bereue bei Ihm.",
  es: "Te pido perdón y a Ti vuelvo arrepentido.",
  id: "Aku memohon ampun kepada Allah dan bertobat kepada-Nya.",
};
// TWO meanings per language: [seeking forgiveness, repentance / turning to Him]
const TWO = {
  en: ["forgiveness", "repentance"],
  fr: ["pardon", "je me repens"],
  ur: ["مغفرت", "توبہ"],
  tr: ["mağfiret", "tevbe"],
  bn: ["ক্ষমা", "তাওবা"],
  ms: ["ampun", "bertaubat"],
  de: ["Vergebung", "bereue"],
  es: ["perdón", "arrepentido"],
  id: ["ampun", "bertobat"],
};
// longer / different istighfar form that MUST NOT be rendered («العظيم» in any language)
const GREAT = /Al-?[‘']?Az[iî]m|Azeem|Magnificent|l'Immense|\bimmense\b|Grandioso|Gewaltige|Großartige|عظيم|عظیم|মহান|Maha Agung|Maha Besar/i;
// imperative «رب اغفر لي وتب علي» form (Lord, forgive me…) that MUST NOT be rendered
const IMPER = /forgive me|pardonne-moi|perd[oó]name|vergib mir|\bLord\b|Seigneur|\bHerr\b|Señor/i;
// reference / repeat / daily-count / isnad tokens that MUST NOT appear inside the block
const REF = /رواه|البخاري|Bukhari|Bukhārī|Bujari|hundred times|cien veces|seratus kali|hundertmal|einhundert|سو مرتبہ|১০০ বার|প্রতি দিন|durante el día|Abu Dawud|ابوداود/i;
// transliteration of the Arabic that MUST NOT appear
const TRANSLIT = /Astaghfiru|astaghfiru|wa-?atubu|atubu ilayh|Astaghfirullah/i;

console.log('================ 1. Card 24 = morning-024 — ALL 9 translations, TWO meanings (exact) ================');
ok(card24 && card24.id === 'morning-024', "AzkarMorning[23].id === 'morning-024'");
ok(card24.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card24['translation_' + l];
  ok(typeof t === 'string' && t.length > 20, `Card 24 translation_${l} present`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 24 ${l}: EXACTLY matches approved source string`);
  ok(TWO[l].every((x) => N(t).includes(N(x))), `Card 24 ${l}: BOTH meanings preserved (forgiveness + repentance)`);
  ok(!/[\p{Nd}]/u.test(t), `Card 24 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 24 ${l}: no footnote digit-brackets, no soft hyphen`);
}

console.log('\n================ 2. NO longer/different form («العظيم» / «رب اغفر لي») + no translit ================');
for (const l of ALL9) ok(!GREAT.test(card24['translation_' + l]), `${l}: no «العظيم»/Al-Azim/longer-form meaning`);
for (const l of ALL9) ok(!IMPER.test(card24['translation_' + l]), `${l}: no «رب اغفر لي وتب علي» imperative form`);
for (const l of ALL9) ok(!TRANSLIT.test(card24['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. Approved source decisions + no reference/repeat inside block ================');
ok(!/Allaah/.test(card24.translation_en) && card24.translation_en.includes('Allah'), 'en: «Allaah» normalized to «Allah»');
ok(card24.translation_fr.includes('je me repens'), 'fr: Dar Al Athar keeps repentance «je me repens» (Hisnii drop REJECTED)');
ok(card24.translation_ms.includes('bertaubat') && !card24.translation_ms.includes('bertobat'), 'ms: Malay spelling «bertaubat»');
ok(card24.translation_id.includes('bertobat') && !card24.translation_id.includes('bertaubat'), 'id: Indonesian spelling «bertobat»');
ok(card24.translation_de.startsWith('Ich bitte Allah um Vergebung') && !TRANSLIT.test(card24.translation_de), 'de: German meaning line (NOT transliteration)');
for (const l of ALL9) ok(!REF.test(card24['translation_' + l]), `${l}: no reference/repeat/context token inside block`);

console.log('\n================ 4. NO ar + Arabic/source/repeat + virtue null / authenticity sahih ================');
ok(card24.translation_ar === undefined, 'Card 24 has NO translation_ar');
const b24 = dataSrc.slice(dataSrc.indexOf("id: 'morning-024'"), dataSrc.indexOf("id: 'morning-025'"));
ok(!/translation_ar\s*:/.test(b24), 'morning-024 source block declares NO translation_ar');
ok(b24.includes("text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.'"), 'Card 24 Arabic text byte-identical');
ok(b24.includes("source: { ref: 'رواه البخاري', sourceUrl: null }"), "Card 24 source stays «رواه البخاري»");
ok(b24.includes('repeat: 100,') && b24.includes("repeatLabel: { ar: 'مائة مرة', en: 'one hundred times' }"), "Card 24 repeat stays 100 («مائة مرة»)");
ok(/authenticity:\s*'sahih'/.test(b24) && /virtue:\s*null/.test(b24), "Card 24 authenticity 'sahih' + virtue null");

console.log('\n================ 5. Per-lang MORNING totals — UNIFORM 25; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Cards 01-23 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 23; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(card23.translation_en.startsWith('O Allah, I ask You for knowledge which is beneficial'), 'Card 23 en (prev dua) intact');
ok(card24.translation_en === "I seek Allah's forgiveness and I turn to Him in repentance.", 'Card 24 en is the new istighfar');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 22, `evening region translation_${l} still EXACTLY 22`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation / source URLs (HadeethEnc not used) ================');
ok(!/sunnah\.com|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|hadeethenc\.com|islamicurdubooks\.com|ilmedavetdernegi\.org|way-to-allah\.com|akuislam\.com|muslim\.or\.id|archive\.org|hisnii\.com/i.test(dataSrc), 'no source URLs (domains) in azkar-data');
ok(!/hadeethenc\.com/i.test(dataSrc), 'HadeethEnc NOT referenced');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=54/.test(htmlSrc), 'index.html azkar-data.js?v=54 (Card 24 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 UNCHANGED');
ok(/CACHE_VERSION = 'v552'/.test(swSrc), "sw.js CACHE_VERSION 'v552'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
