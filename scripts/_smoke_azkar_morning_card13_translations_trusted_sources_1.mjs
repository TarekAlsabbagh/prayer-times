// Smoke — AZKAR-MORNING-DUA-CARD-13-TRANSLATIONS-TRUSTED-SOURCES-ALL-LANGUAGES-1
// morning-013 («اللهم إني أسألك العفو والعافية…أغتال من تحتي», Abu Dawud, ×1, virtue/auth/note ALL null) gains ALL 9
// static translations of the dua MEANING ONLY — no repeat label, reference, virtue, hadith story, isnad/narrator,
// transliteration, footnotes/digits, explanation, or evening variant. Dhikr = Hisn al-Muslim 84 / Abu Dawud 5074.
// Sources: en/es/id/bn=HisnMuslim ch.27 #84; fr=Dar Al Athar ch.27 #84; ur=Islamic Urdu Books (Ibn Majah 3871, dua
// only — al-Qahtani booklet LACKS it); tr=DUAM (Ebu Dawud; Islamiokul rejected); ms=e-JAUHAR; de=Islamische Datenbank.
// tr+de: source explanatory parens stripped; id keeps glosses; es kept verbatim. ar never renders a block.
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
const card13 = M[12];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

const EXP = {
  en: "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge with You lest I be swallowed up by the earth.",
  fr: "Ô Seigneur ! Je T'implore de m'accorder Ton pardon et Ta protection dans cette vie et dans l'au-delà. Ô Seigneur ! Je T'implore de m'accorder Ton pardon et Ta protection dans ma religion, ma vie, ma famille et mes biens. Ô Seigneur ! Couvre mes défauts et rassure moi quant aux peurs qui me tiraillent. Ô Seigneur ! Préserve moi de tout ce qui pourrait survenir de devant ou derrière moi, à ma droite, à ma gauche ou au-dessus de moi, et je me réfugie auprès de Ta toute grandeur contre une mort qui surgirait d'en-dessous de moi.",
  ur: "اے اللہ! میں تجھ سے دنیا اور آخرت میں عفو اور عافیت کا طالب ہوں، اے اللہ! میں تجھ سے اپنے دین و دنیا اور اپنے اہل و مال میں معافی اور عافیت کا طالب ہوں، اے اللہ! میرے عیوب چھپا دے، میرے دل کو مامون کر دے، اور میرے آگے پیچھے، دائیں بائیں، اور اوپر سے میری حفاظت فرما، اور میں تیری پناہ چاہتا ہوں نیچے سے ہلاک کئے جانے سے",
  tr: "Allah'ım! Senden dünya ve ahirette af ve afiyet dilerim. Allah'ım! Senden dinim, dünyam, aile fertlerim ve malım hakkında af ve afiyet dilerim. Allah'ım! Ayıplarımı ört, korkularımdan emin kıl. Allah'ım! Beni önümden, arkamdan, sağımdan solumdan ve üstümden koru. Altımdan helak olmaktan senin büyüklüğüne sığınırım.",
  bn: "হে আল্লাহ! আমি আপনার নিকট দুনিয়া ও আখেরাতে ক্ষমা ও নিরাপত্তা প্রার্থনা করছি। হে আল্লাহ! আমি আপনার নিকট ক্ষমা এবং নিরাপত্তা চাচ্ছি আমার দ্বীন, দুনিয়া, পরিবার ও অর্থ-সম্পদের। হে আল্লাহ! আপনি আমার গোপন ত্রুটিসমূহ ঢেকে রাখুন, আমার উদ্বিগ্নতাকে রূপান্তরিত করুন নিরাপত্তায়। হে আল্লাহ! আপনি আমাকে হেফাযত করুন আমার সামনের দিক থেকে, আমার পিছনের দিক থেকে, আমার ডান দিক থেকে, আমার বাম দিক থেকে এবং আমার উপরের দিক থেকে। আর আপনার মহত্ত্বের অসিলায় আশ্রয় চাই আমার নীচ থেকে হঠাৎ আক্রান্ত হওয়া থেকে।",
  ms: "Ya Allah aku memohon kepadaMu keampunan dan kesejahteraan di dunia dan di akhirat Ya Allah aku memohon kepadaMu keampunan dan kesejahteraan pada agamaku, duniaku keluargaku dan hartaku. Ya Allah, tutupkanlah keaibanku dan amankanlah diriku daripada rasa takut. Ya Allah, peliharalah diriku dari hadapan dan belakangku, dari kanan dan kiriku serta dari atasku dan aku berlindung dengan keagunganMu daripada diceroboh di sebelah bawahku.",
  de: "O Allāh, ich bitte Dich um Vergebung und Heil im Diesseits und im Jenseits. O Allāh, ich bitte Dich um Vergebung und Heil in meinem Dīn und in meinem Leben, für meine Angehörigen und in meinem Vermögen. O Allāh, verberge meine Schamteile und gewähre mir Sicherheit vor meiner Furcht. O Allāh, beschütze mich von vorne, von hinten, von rechts und von links und von oben. Ich suche Zuflucht bei Deiner Gewaltigkeit, dass mich Unheil von unten trifft.",
  es: "Oh Allah ciertamente solicito Tu indulgencia y el bienestar en esta vida y en la otra, Oh Allah ciertamente ruego Tu perdón y el bienestar en mis asuntos religiosos, mundanales, mi familia y mis bienes, Oh Allah cubre mi desnudes, y confórtame ante el miedo, Oh Allah protégeme por todas partes, delante y por detrás, a mi derecha e izquierda, sobre mí. Me refugio en tu grandeza de ser engullido por la tierra.",
  id: "Ya Allah, sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan di dunia dan akhirat. Ya Allah sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan: dalam agamaku, (kehidupan) duniaku, keluargaku, hartaku. Ya Allah tutuplah auratku (aib dan sesuatu yang tidak layak di lihat orang lain) dan berilah ketentraman di hatiku. Ya Allah, peliharalah aku dari arah depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak mendapat bahaya dari bawahku.",
};
const A = {
  en: { has: ['veil my weaknesses', 'swallowed up by the earth'], not: ['seven times', ' once', 'Sunni', 'Abu Daw', 'Ibn Maj', 'Whoever'] },
  fr: { has: ['Couvre mes défauts', "d'en-dessous de moi"], not: ['une fois', 'Abu D', 'Ibn Maj', 'Boukhari'] },
  ur: { has: ['میرے عیوب چھپا دے', 'نیچے سے ہلاک کئے جانے سے'], not: ['عبداللہ بن عمر', 'وکیع', 'ابن ماجہ', 'ابو داود', 'ایک بار'] },
  tr: { has: ['Ayıplarımı ört', 'senin büyüklüğüne sığınırım'], not: ['gelecek her türlü', 'gelecek belalarla', 'deprem', 'Ebu Davud', 'bir kez', 'azametime', 'Dini, dünyası'] },
  bn: { has: ['গোপন ত্রুটিসমূহ ঢেকে রাখুন', 'হঠাৎ আক্রান্ত হওয়া থেকে'], not: ['আবূ দাউদ', 'ইবন মাজাহ', 'একবার'] },
  ms: { has: ['tutupkanlah keaibanku', 'di sebelah bawahku'], not: ['Sahih Ibn Majah', 'Abu Dawud', 'sekali', 'Ghufraanaka'] },
  de: { has: ['verberge meine Schamteile', 'von unten trifft'], not: ['von der Erde verschluckt', 'Ibn Māǧa', 'Abū Dawūd', 'einmal'] },
  es: { has: ['cubre mi desnudes', 'engullido por la tierra'], not: ['Abu D', 'Ibn May', 'una vez', 'Tirmidhi'] },
  id: { has: ['tutuplah auratku', 'bahaya dari bawahku'], not: ['Abu Dawud', 'Ibnu Majah', 'sekali'] },
};

console.log('================ 1. Card 13 = morning-013 — ALL 9 translations (dua meaning only) ================');
ok(card13 && card13.id === 'morning-013', "AzkarMorning[12].id === 'morning-013' (actual id confirmed)");
ok(card13.type === 'dhikr' && M.length === 25, 'card is a dhikr; morning list still 25 items');
for (const l of ALL9) {
  const t = card13['translation_' + l];
  const a = A[l];
  ok(typeof t === 'string' && t.length > 100, `Card 13 translation_${l} present (non-trivial length)`);
  if (typeof t !== 'string') continue;
  ok(N(t) === N(EXP[l]), `Card 13 ${l}: EXACTLY matches approved source string`);
  ok(a.has.every((x) => N(t).includes(N(x))), `Card 13 ${l}: opening→closing anchors present (full dua)`);
  ok(a.not.every((x) => !N(t).includes(N(x))), `Card 13 ${l}: NO reference/isnad/repeat/story/translit/evening leak`);
  ok(!/[\p{Nd}]/u.test(t), `Card 13 ${l}: no digits (any script)`);
  ok(!/\[\p{Nd}+\]/u.test(t) && !/­/.test(t), `Card 13 ${l}: no footnote brackets, no soft hyphen`);
}

console.log('\n================ 2. Approved source/cleaning decisions ================');
ok(card13.translation_tr.includes('senin büyüklüğüne') && !card13.translation_tr.includes('gelecek') && !card13.translation_tr.includes('azametime'), 'tr: DUAM verbatim; explanatory parens stripped; NOT Islamiokul');
ok(!card13.translation_de.includes('von der Erde verschluckt') && card13.translation_de.endsWith('von unten trifft.'), 'de: closing explanatory paren stripped');
ok(card13.translation_ur.startsWith('اے اللہ! میں تجھ سے دنیا اور آخرت') && !card13.translation_ur.includes('عبداللہ') && !card13.translation_ur.includes('وکیع'), 'ur: Islamic Urdu Books dua-only (no isnad/narrator)');
ok(card13.translation_es.includes('cubre mi desnudes') && card13.translation_es.includes('mundanales'), 'es: HisnMuslim verbatim spelling kept («desnudes»/«mundanales»)');
ok(card13.translation_id.includes('(kehidupan)') && card13.translation_id.includes('(aib dan sesuatu yang tidak layak di lihat orang lain)'), 'id: source glosses kept');
ok(card13.translation_fr.startsWith('Ô Seigneur ! Je T'), 'fr: Dar Al Athar #84 verbatim');
ok(card13.translation_ms.endsWith('di sebelah bawahku.'), 'ms: e-JAUHAR full ending');
ok(card13.translation_bn.endsWith('হঠাৎ আক্রান্ত হওয়া থেকে।'), 'bn: HisnMuslim full ending');

console.log('\n================ 3. NO ar + virtue/authenticity/authenticityNote ALL null ================');
ok(card13.translation_ar === undefined, 'Card 13 has NO translation_ar');
const b13 = dataSrc.slice(dataSrc.indexOf("id: 'morning-013'"), dataSrc.indexOf("id: 'morning-014'"));
ok(!/translation_ar\s*:/.test(b13), 'morning-013 source block declares NO translation_ar field');
ok(/virtue: null,/.test(b13) && /authenticity: null,/.test(b13) && /authenticityNote: null/.test(b13), 'Card 13 virtue + authenticity + authenticityNote all stay null');

console.log('\n================ 4. Per-lang MORNING totals — UNIFORM 13 for all 9 langs; ar = 0 ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 16, `morning region translation_${l}: EXACTLY 16`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar field anywhere');

console.log('\n================ 5. Card 13 Arabic text/source/repeat byte-identical ================');
ok(b13.includes("text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.'"), 'Card 13 Arabic text byte-identical (full literal, tashkeel intact)');
ok(b13.includes("source: { ref: 'رواه أبو داود', sourceUrl: null }"), "Card 13 source stays «رواه أبو داود»");
ok(b13.includes('repeat: 1,') && b13.includes("repeatLabel: { ar: 'مرة واحدة', en: 'once' }"), "Card 13 repeat stays 1 («مرة واحدة»)");
ok(b13.includes("title: { ar: 'اللهم إني أسألك العفو والعافية'"), 'Card 13 title untouched');

console.log('\n================ 6. Cards 01-12 + evening + prayer UNCHANGED ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 (Kursi) intact');
for (let c = 0; c < 12; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card ${String(c + 1).padStart(2, '0')} still carries all 9 translations`);
ok(M[11].translation_en.startsWith('Allah is Sufficient for me'), 'Card 12 en intact');
ok(M[10].translation_en.startsWith('O Allah, I take refuge in You from anxiety and sorrow'), 'Card 11 en intact');
ok(M[9].translation_en.startsWith('O Allah, grant my body health'), 'Card 10 en intact');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 4, `evening region translation_${l} still EXACTLY 4`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');
ok(sandbox.window.AzkarEvening.length === 23 && sandbox.window.AzkarPrayer.length > 0, 'evening 23 + prayer intact');

console.log('\n================ 7. Renderers untouched — generic read, no fallback, ur RTL, above Arabic ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain');
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(srvSrc), 'server ar-gate intact');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(srvSrc) && /trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(appSrc), 'ur ⇒ dir=rtl (both sides)');
const srvConcat = srvSrc.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(srvConcat && srvConcat[0].indexOf('translationHtml') < srvConcat[0].indexOf('textHtml'), 'translation ABOVE the Arabic text');

console.log('\n================ 8. NO runtime external translation requests / source URLs ================');
ok(!/sunnah\.com|qurani\.io|hisnmuslim\.com|islamische-datenbank\.de|daralathar\.fr|islamhouse\.com|akuislam\.com|kuranlasifa\.com|hadeethenc\.com|hadiskutuphanesi|duaa\.my|turjmanislam\.com|moe-dl\.edu\.my|islamiokul\.com|islamicurdubooks\.com|duam\.org/i.test(dataSrc), 'no source URLs (domains) in azkar-data (incl. new islamicurdubooks/duam)');
ok(!/qurani\.io|hisnmuslim\.com|islamhouse\.com|duaa\.my|daralathar\.fr|islamiokul\.com|moe-dl\.edu\.my|islamicurdubooks\.com|duam\.org/i.test(srvSrc) && !/islamicurdubooks\.com|duam\.org/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=24/.test(htmlSrc), 'index.html azkar-data.js?v=24 (Card 13 data added)');
ok((htmlSrc.match(/js\/azkar-data\.js\?v=/g) || []).length === 1, 'azkar-data.js referenced EXACTLY once');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED (generic renderer)');
ok(/CACHE_VERSION = 'v520'/.test(swSrc), "sw.js CACHE_VERSION 'v519'");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
