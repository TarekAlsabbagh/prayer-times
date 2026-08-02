// Smoke — AZKAR-EVENING-DUA-CARD-07-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// evening-007 = Sayyid al-Istighfar («اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ…فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.»,
// Bukhari, repeat 1 «مرة واحدة») gains the 9 static non-ar MEANING translations. This dua is IDENTICAL morning &
// evening (only a 1-diacritic diff «إِلَٰهَ» vs «إِلَهَ»), so eight langs (fr/ur/tr/bn/ms/de/es/id) reuse morning-007
// BYTE-IDENTICAL. English is the ONE exception: morning-007 en (HadeethEnc 5503) DROPS the tawhid clause «لا إله إلا
// أنت», so evening en is the COMPLETE Bukhari/Hisn al-Muslim form («there is none worthy of worship but You») — a
// DIFFERENT string from morning-007 en. The TEN meanings each lang must keep: ① O Allah, You are my Lord ② none
// worthy of worship but You (tawhid) ③ You created me and I am Your slave ④ I keep Your covenant AND promise
// ⑤ as much as I am able ⑥ refuge from the evil of what I have done ⑦ I acknowledge Your blessing upon me (أبوء =
// acknowledge, NOT return) ⑧ I acknowledge my sin ⑨ so forgive me ⑩ none forgives sins but You. NO translation_ar,
// NO reference/repeat/source/sanad/virtue inside the block, NO transliteration, NO footnote digits, NO time-of-day
// wording (this dua is not time-bound). The «فضل» (virtue) stays Arabic-only (virtue.en === null). Renderers
// (server.js/app.js) untouched. Sources: en=Hisn al-Muslim #79 / Sahih al-Bukhari 6306 (sunnah.com); the eight
// reused langs inherit morning-007's approved sources (HadeethEnc 5503 + Hisnii Invocation 10 + AkuIslam).
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
const card = E.find(d => d.id === 'evening-007');
const morn = M.find(d => d.id === 'morning-007');
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const REUSE8 = ['fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id']; // en is the exception

// The TEN meanings, per language, as exact substrings that MUST all be present.
const MEAN = {
  en: ['O Allah, You are my Lord', 'there is none worthy of worship but You', 'You created me and I am your slave',
       'I keep Your covenant', 'so far as I am able', 'I seek refuge in You from the evil of what I have done',
       'I admit to Your blessings upon me', 'I admit to my misdeeds', 'Forgive me',
       'there is none who may forgive sins but You'],
  fr: ['Tu es mon Seigneur', 'aucune divinité', 'Ton serviteur', 'mon engagement et à ma promesse',
       'autant que je peux', 'contre le mal que', 'Je reconnais Ton bienfait', 'je reconnais mon péché',
       'Pardonne-moi', 'nul autre que Toi ne pardonnes les péchés'],
  ur: ['تو میرا رب ہے', 'تیرے سوا کوئی معبود', 'میں تیرا بندہ ہوں', 'عہد اور وعدے پر قائم',
       'اپنی طاقت کے مطابق', 'شر سے تیری پناہ', 'نعمتوں کا اقرار', 'گناہوں کا بھی اعتراف',
       'مغفرت فرما', 'تیرے سوا کوئی گناہوں'],
  tr: ['Sen benim Rabbimsin', 'ibadete layık', 'ben senin kulunum', 'sözümde ve vaadimde',
       'gücüm yettiğince', 'şerrinden sana sığınırım', 'nimetleri itiraf', 'Günahlarımı itiraf',
       'Beni affet', 'günahları senden başka affedecek yoktur'],
  bn: ['আপনিই আমার রব', 'আপনি ছাড়া কোনো সত্য মাবূদ নেই', 'আমি আপনার বান্দা', 'অঙ্গীকার ও ওয়াদার ওপর',
       'যথাসাধ্য', 'অনিষ্ট থেকে আপনার নিকট', 'আমার ওপর আপনার নি', 'আমার পাপ স্বীকার করছি',
       'ক্ষমা করুন', 'আপনি ব্যতীত কেউ পাপ ক্ষমা'],
  ms: ['Engkaulah Tuhanku', 'tiada tuhan yang disembah melainkan Engkau', 'aku ialah hamba Mu', 'amanah-Mu dan janji-Mu',
       'sekadar kesanggupan', 'kejahatan yang telah aku lakukan', 'nikmatMu ke atasku', 'aku mengakui dosaku',
       'ampunilah aku', 'tiada siapa yang dapat mengampuni dosa-dosaku selain Engkau'],
  de: ['Du bist mein Herr', 'keinen Gott außer Dir', 'ich bin Dein Diener', 'Deinem Bund und Deinem Versprechen',
       'so gut ich kann', 'Zuflucht bei Dir vor dem Bösen', 'bekenne Deine Gnade', 'bekenne meine Sünden',
       'So vergib mir', 'niemand vergibt Sünden außer Dir'],
  es: ['Tú eres mi Señor', 'No hay más divinidad que Tú', 'soy Tu Siervo', 'Mantengo mi pacto y mi promesa',
       'de la mejor manera que puedo', 'En Ti me refugio del mal que he cometido', 'Reconozco Tus gracias',
       'reconozco mis pecados', 'Perdóname', 'nadie perdona los pecados sino Tú'],
  id: ['Engkau adalah Tuhanku', 'tidak ada Tuhan yang berhak disembah kecuali Engkau', 'aku adalah hamba-Mu',
       'perjanjian dan janjiku', 'semampuku', 'berlindung kepada-Mu dari keburukan perbuatanku',
       'mengakui nikmat-Mu atas diriku', 'aku mengakui dosaku', 'ampunilah aku', 'tiada yang mengampuni dosa selain Engkau'],
};
// meaning ② — the TAWHID clause «لا إله إلا أنت» that MUST be present in every lang (morning-007 en DROPS it).
const TAWHID = { en:/none worthy of worship but You/i, fr:/aucune divinité/i, ur:/تیرے سوا کوئی معبود/,
  tr:/ibadete layık/i, bn:/কোনো সত্য মাবূদ নেই/, ms:/tiada tuhan yang disembah melainkan Engkau/i,
  de:/keinen Gott außer Dir/, es:/No hay más divinidad que Tú/, id:/berhak disembah kecuali Engkau/i };
// «أبوء» = acknowledge, NOT return — the mistranslation trap the audit warned about.
const ABU_RETURN = { en:/\breturn(s|ed|ing)?\b/i, fr:/\bretour|reviens\b/i, es:/retorno|regres/i, de:/Rückkehr|zurückkehr/i };
// NO time-of-day wording (this dua is timeless — not the this-night/this-day forms).
const NOTIME = { en:/\b(this night|this day|morning|evening|today|daytime)\b/i, fr:/\b(cette nuit|ce jour|matin|soir)\b/i,
  de:/\b(Morgen|Abend|heute|Tag)\b/, es:/\b(esta noche|este día|mañana|hoy)\b/i };
// reference / repeat / source / sanad / virtue tokens that MUST NOT appear inside a translation value
const REF = /رواه|البخاري|Bukhari|Bukhārī|Tirmidhi|صحيح|Sahih|رقم|مرة واحدة|\bonce\b|\bhadith\b|sayyid al|master of|سيد الاستغفار|Istighfar/i;
// the virtue («whoever says it… enters Paradise») MUST NOT leak into the block
const VIRTUE = /Paradise|Paradis|Paraíso|Cennet|جنّ?ت|جنة|জান্নাত|surga|dies that (very )?day|whoever says|quien lo dice/i;
// LATIN transliteration of the Arabic that MUST NOT appear
const TRANSLIT = /Allahumma|Anta rabbi|La ilaha illa|khalaqtani|abu['`]u|astata['`]tu|a['`]udhu bika|fa-?ghfir/i;
const SUP = /[¹²³⁴⁵⁶⁷⁸⁹⁰]/;

console.log('================ 1. evening-007 identity + all 9 translations, TEN meanings each ================');
ok(!!card && card.id === 'evening-007', 'AzkarEvening has evening-007');
ok(card.type === 'dhikr' && E.length === 23, 'card is a dhikr; evening list still 23 items');
for (const l of ALL9) {
  const t = card['translation_' + l];
  ok(typeof t === 'string' && t.length > 200, `evening-007 translation_${l} present (full-length)`);
  if (typeof t !== 'string') continue;
  ok(MEAN[l].every(x => has(t, x)), `${l}: ALL TEN meanings preserved`);
  ok(TAWHID[l].test(t), `${l}: ② tawhid «لا إله إلا أنت» present (the clause morning-007 en drops)`);
  ok(!/[\p{Nd}]/u.test(t), `${l}: no digits (any script)`);
  ok(!SUP.test(t), `${l}: no superscript footnote marker`);
  ok(!/­/.test(t), `${l}: no soft hyphen`);
}
for (const l of Object.keys(ABU_RETURN)) ok(!ABU_RETURN[l].test(card['translation_' + l]), `${l}: «أبوء» rendered as acknowledge, NOT return`);
for (const l of Object.keys(NOTIME)) ok(!NOTIME[l].test(card['translation_' + l]), `${l}: no time-of-day wording (timeless istighfar form)`);

console.log('\n================ 2. NO reference/repeat/source/sanad/virtue + NO transliteration inside the block ================');
for (const l of ALL9) ok(!REF.test(card['translation_' + l]), `${l}: no reference/repeat/source/sanad token`);
for (const l of ALL9) ok(!VIRTUE.test(card['translation_' + l]), `${l}: virtue («enters Paradise») NOT leaked into the meaning block`);
for (const l of ALL9) ok(!TRANSLIT.test(card['translation_' + l]), `${l}: no transliteration`);

console.log('\n================ 3. en is the COMPLETE Bukhari form; 8 langs reuse morning-007 byte-identical ================');
ok(/there is none worthy of worship but You/i.test(card.translation_en),
  'en KEEPS the tawhid clause «none worthy of worship but You» (complete Bukhari/Hisn #79 form)');
ok(card.translation_en !== morn.translation_en,
  'en is a DIFFERENT string from morning-007 en (morning drops the tawhid clause — out of scope, untouched)');
ok(!/none worthy of worship/i.test(morn.translation_en),
  'morning-007 en still DROPS the tawhid clause (NOT retro-fixed by this ticket)');
for (const l of REUSE8) ok(card['translation_' + l] === morn['translation_' + l], `${l}: byte-identical reuse of morning-007 (programmatic extract)`);
ok(N(card.translation_ur).includes(N('مغفرت')) && !N(card.translation_ur).includes(N('مغرفت')),
  'ur uses the correct «مغفرت» (never the audit-flagged typo «مغرفت»)');
ok(N(morn.translation_ur).includes(N('مغفرت')) && !N(morn.translation_ur).includes(N('مغرفت')),
  'morning-007 ur is also clean «مغفرت» (unchanged)');

console.log('\n================ 4. NO translation_ar + Arabic text/source/repeat byte-identical + virtue Arabic-only ================');
ok(card.translation_ar === undefined, 'evening-007 object has NO translation_ar');
const b7 = dataSrc.slice(dataSrc.indexOf("id: 'evening-007'"), dataSrc.indexOf("id: 'evening-008'"));
ok(!/translation_ar\s*:/.test(b7), 'evening-007 source block declares NO translation_ar field');
ok(card.text.startsWith('اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ') && card.text.endsWith('لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.'),
  'Arabic text opening + closing intact (byte-identical anchors)');
ok(card.text.includes('خَلَقْتَنِي وَأَنَا عَبْدُكَ') && card.text.includes('أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ') && card.text.includes('وَأَبُوءُ بِذَنْبِي'),
  'Arabic text distinctive interior phrases intact (created/slave + acknowledge blessing + acknowledge sin)');
ok(card.source && card.source.ref === 'رواه البخاري', 'source ref «رواه البخاري» unchanged');
ok(card.repeat === 1 && card.repeatLabel && card.repeatLabel.ar === 'مرة واحدة' && card.repeatLabel.en === 'once',
  'repeat 1 «مرة واحدة» / «once» unchanged');
ok(card.authenticity === 'sahih', "authenticity 'sahih' unchanged");
ok(card.virtue != null && card.virtue.en === null && typeof card.virtue.ar === 'string' && card.virtue.ar.length > 10,
  'virtue present, Arabic-only (virtue.en === null) — NOT translated by this ticket');

console.log('\n================ 5. Per-region translation counts — evening 7, morning 25, prayer 0, ar 0 ================');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
const mornRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarMorning'), dataSrc.indexOf('window.AzkarEvening'));
const prayRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 12, `evening region translation_${l}: EXACTLY 12 (001-004 Quran + 005-012 dua)`);
for (const l of ALL9) ok((mornRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 25, `morning region translation_${l}: EXACTLY 25 (unchanged)`);
ok(!/translation_[a-z]+\s*:/.test(prayRegion), 'prayer region has NO translation fields (unchanged)');
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 6. Evening 001-007 translated; 008+ untranslated; morning-007 unchanged; lists intact ================');
for (const id of ['evening-001','evening-002','evening-003','evening-004','evening-005','evening-006','evening-007']) {
  const c = E.find(d => d.id === id);
  ok(ALL9.every(l => typeof c['translation_' + l] === 'string'), `${id} carries all 9 translations`);
}
ok(E.slice(12).every(d => ALL9.every(l => d['translation_' + l] == null)), 'evening cards 013+ carry NO translation fields');
ok(morn.translation_en.includes('You are my Lord') && morn.translation_en.includes('You created me') && morn.translation_en.includes('none can forgive sins but You'),
  'morning-007 en still intact (You are my Lord + created + none can forgive) — UNCHANGED');
ok(M.length === 25 && E.length === 23 && P.length > 0, '25 morning + 23 evening + prayer intact');
ok(M.every(d => ALL9.every(l => typeof d['translation_' + l] === 'string')), 'all 25 morning cards still fully translated (untouched)');

console.log('\n================ 7. Renderers (server.js / app.js) untouched ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation rendered ABOVE the Arabic text');

console.log('\n================ 8. Cache-busters bumped (azkar-data.js?v=44 + sw v542) ================');
ok(/js\/azkar-data\.js\?v=44\b/.test(htmlSrc), 'index.html loads js/azkar-data.js?v=44');
ok(!/js\/azkar-data\.js\?v=38\b/.test(htmlSrc), 'no stale ?v=38 azkar-data reference in index.html');
ok(/CACHE_VERSION\s*=\s*'v542'/.test(swSrc), "sw.js CACHE_VERSION = 'v542'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
