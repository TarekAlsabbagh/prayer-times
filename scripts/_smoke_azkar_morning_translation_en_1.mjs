// Smoke — AZKAR-MORNING-ADD-ENGLISH-TRANSLATION-* + …-QURAN-TRANSLATIONS-{AYAT-KURSI-IKHLAS,SURAH-AN-NAS,SURAH-AL-FALAQ}-ALL-LANGUAGES-1
// ALL FOUR Quran cards among the morning dhikr — Ayat al-Kursi (morning-001), Surah Al-Ikhlas (morning-002),
// Surah Al-Falaq (morning-003) and Surah An-Nas (morning-004) — each carry a per-language Quran translation shown
// ABOVE the Arabic, in EVERY non-Arabic UI (en + fr/ur/tr/bn/ms/de/es/id), and NEVER in the Arabic UI.
// English = Saheeh International; the other 8 = QuranEnc.com static data extracted once at dev time
// (scripts/_extract_quranenc_azkar_translations_once.mjs) — NO runtime API calls. Basmala is prepended for
// Al-Ikhlas + Al-Falaq + An-Nas (their Arabic opens with the Basmala), EXCEPT Turkish whose QuranEnc 1:1 is a
// transliteration → omitted. Spanish leading verse-numbers stripped. Urdu renders RTL. Arabic text unchanged.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const dataSrc = fs.readFileSync(path.join(ROOT, 'js', 'azkar-data.js'), 'utf8');
const srvSrc  = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const appSrc  = fs.readFileSync(path.join(ROOT, 'js', 'app.js'), 'utf8');
const cssSrc  = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swSrc   = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const extractPath = path.join(ROOT, 'scripts', '_extract_quranenc_azkar_translations_once.mjs');

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

const NONAR = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];   // every UI lang that shows a translation
// per-language Basmala opener (for "basmala in Al-Ikhlas + Al-Falaq + An-Nas"); tr omitted on purpose (transliteration)
const BASMALA = {
  en: 'In the name of Allah, the Entirely Merciful',
  fr: 'Au nom d’Allah',
  de: 'Im Namen Allahs',
  es: 'En el nombre de Dios',
  id: 'Dengan nama Allah Yang Maha Pengasih',
  ms: 'Dengan nama Allah, Yang Maha Pemurah',
  ur: 'شروع کرتا ہوں',       // شروع کرتا ہوں
  bn: 'রহমান, রহীম',                     // রহমান, রহীম
};

// morning-001 / -002 / -003 / -004 blocks (data)
const i1 = dataSrc.indexOf("id: 'morning-001'");
const i2 = dataSrc.indexOf("id: 'morning-002'");
const i3 = dataSrc.indexOf("id: 'morning-003'");
const i4 = dataSrc.indexOf("id: 'morning-004'");
const i5 = dataSrc.indexOf("id: 'morning-005'");
const block1 = dataSrc.slice(i1, i2);   // Ayat al-Kursi
const block2 = dataSrc.slice(i2, i3);   // Surah Al-Ikhlas
const block3 = dataSrc.slice(i3, i4);   // Surah Al-Falaq
const block4 = dataSrc.slice(i4, i5);   // Surah An-Nas
// AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1: scope the per-lang count to the
// MORNING region — the evening page now ALSO carries these 4 translations (verified by its own smoke), so the
// whole-file count doubles to 8.
// AZKAR-MORNING-DUA-CARD-05-TRANSLATIONS-TRUSTED-SOURCES-AVAILABLE-LANGUAGES-1: morning-005 adds a 5th
// translation for the 8 approved langs (en/fr/ur/tr/bn/ms/es/id); de stays 4 (Card 05 de = PENDING_SOURCE).
// AZKAR-MORNING-DUA-CARD-06-TRANSLATIONS-TRUSTED-SOURCES-AVAILABLE-LANGUAGES-1: morning-006 adds a 6th for
// en/ur/tr/bn/de/es/id (Card 06 HAS de).
// AZKAR-MORNING-DUA-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1: card05 += de (Islamische Datenbank) and
// card06 += fr (Hisnii) + ms (akuislam).
// AZKAR-MORNING-DUA-CARD-07-SAYYIDUL-ISTIGHFAR-…-1: morning-007 adds a 7th for ALL 9 langs.
// AZKAR-MORNING-DUA-CARD-08-…-1: morning-008 adds an 8th for en ONLY (the 8 others = PENDING_SOURCE).
const _mornEnd = dataSrc.indexOf('window.AzkarEvening');
const morningRegion = (_mornEnd > i1) ? dataSrc.slice(i1, _mornEnd) : dataSrc;
const _MORN_EXPECT = { en: 25, ur: 25, tr: 25, bn: 25, es: 25, id: 25, de: 25, fr: 25, ms: 25 };

console.log('================ 1. Data — per-lang MORNING translation totals (Cards 01-06; de/fr/ms map differs) ================');
ok(i1 > -1 && i2 > i1 && i3 > i2 && i4 > i3 && i5 > i4, 'morning-001/002/003/004/005 ids present + ordered');
for (const l of NONAR) {
  const _mornExpected = _MORN_EXPECT[l];
  ok((morningRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === _mornExpected, `translation_${l}: appears EXACTLY ${_mornExpected}x in the MORNING region`);
  ok(block1.includes('translation_' + l + ':'), `Card 01 (Kursi) has translation_${l}`);
  ok(block2.includes('translation_' + l + ':'), `Card 02 (Al-Ikhlas) has translation_${l}`);
  ok(block3.includes('translation_' + l + ':'), `Card 03 (Al-Falaq) has translation_${l}`);
  ok(block4.includes('translation_' + l + ':'), `Card 04 (An-Nas) has translation_${l}`);
}

console.log('\n================ 2. English unchanged (Saheeh International) + Al-Falaq English ================');
ok(dataSrc.includes('the Ever-Living, the Sustainer of [all] existence'), 'Card 01 English (Ayat al-Kursi Saheeh) intact');
ok(dataSrc.includes('In the name of Allah, the Entirely Merciful, the Especially Merciful. Say, "He is Allah, [who is] One'), 'Card 02 English (Al-Ikhlas Saheeh, Basmala-first) intact');
ok(block3.includes('Say, "I seek refuge in the Lord of daybreak') && block3.includes('And from the evil of an envier when he envies."'), 'Card 03 English (Al-Falaq Saheeh, Basmala-first) present');
ok(block4.includes('Say, "I seek refuge in the Lord of mankind') && block4.includes('From among the jinn and mankind."'), 'Card 04 English (An-Nas Saheeh, Basmala-first) intact');

console.log('\n================ 3. Basmala in Al-Ikhlas (02) + Al-Falaq (03) + An-Nas (04); NEVER in Ayat al-Kursi (01) ================');
for (const l of Object.keys(BASMALA)) {
  ok(block2.includes(BASMALA[l]), `Card 02 ${l}: Basmala present (${BASMALA[l].slice(0, 16)}…)`);
  ok(block3.includes(BASMALA[l]), `Card 03 ${l}: Basmala present`);
  ok(block4.includes(BASMALA[l]), `Card 04 ${l}: Basmala present`);
  ok(!block1.includes(BASMALA[l]), `Card 01 ${l}: NO Basmala (Kursi is 2:255 only)`);
}

console.log('\n================ 4. Turkish exception — NO transliterated Basmala anywhere (Card 01/02/03/04) ================');
ok(!/Bismill/i.test(block1) && !/Bismill/i.test(block2) && !/Bismill/i.test(block3) && !/Bismill/i.test(block4), 'no "Bismill…" transliteration in any stored translation (tr Basmala omitted)');
ok(/translation_tr:\s*"De ki:/.test(block2), 'Card 02 Turkish starts with the surah "De ki:" (Basmala omitted)');
ok(/translation_tr:\s*"De ki: Ben, sabahın Rabbine/.test(block3), 'Card 03 Turkish (Al-Falaq) starts with "De ki: Ben, sabahın Rabbine" (Basmala omitted)');
ok(/translation_tr:\s*"De ki: İnsanların Rabbine/.test(block4), 'Card 04 Turkish (An-Nas) starts with "De ki: İnsanların Rabbine" (Basmala omitted)');

console.log('\n================ 5. No footnotes + no leading verse numbers in the stored data ================');
// no digit-brackets in any script ([1] / [١] / [১]) inside the blocks (letter-brackets like es [Eterno]/[único]/[hechiceras] are allowed)
ok(!/\[\p{Nd}+\]/u.test(block1) && !/\[\p{Nd}+\]/u.test(block2) && !/\[\p{Nd}+\]/u.test(block3) && !/\[\p{Nd}+\]/u.test(block4), 'no footnote-marker digit-brackets remain in the translations');
// Spanish leading verse numbers stripped
ok(/translation_es:\s*"¡Dios!/.test(block1), 'Card 01 Spanish starts with "¡Dios!" (leading "255." stripped)');
ok(/translation_es:\s*"En el nombre de Dios/.test(block2), 'Card 02 Spanish starts with the Basmala, not "1." (leading number stripped)');
ok(/translation_es:\s*"En el nombre de Dios/.test(block3), 'Card 03 Spanish starts with the Basmala, not "1." (leading number stripped)');
ok(/translation_es:\s*"En el nombre de Dios/.test(block4), 'Card 04 Spanish starts with the Basmala, not "1." (leading number stripped)');

console.log('\n================ 6. Arabic text byte-identical (untouched) ================');
ok(dataSrc.includes("text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ"), 'Card 01 Arabic (Ayat al-Kursi) intact');
ok(dataSrc.includes("text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\nقُلْ هُوَ اللَّهُ أَحَدٌ"), 'Card 02 Arabic (Basmala + surah) intact');
ok(dataSrc.includes("text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ"), 'Card 03 Arabic (Al-Falaq: Basmala + surah, tashkeel + \\n) intact');
ok(dataSrc.includes("text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ"), 'Card 04 Arabic (An-Nas: Basmala + surah) intact');

console.log('\n================ 7. SSR (server.js) — generalized to translation_{lang}, ar → none, Urdu RTL ================');
const cardStart = srvSrc.indexOf('function _buildAzkarCardHtml(dhikr, idx, lang)');
const cardEnd   = srvSrc.indexOf('function _buildAzkarMorningListHtml', cardStart);
const cardBody  = srvSrc.slice(cardStart, cardEnd);
ok(/const _trLang = \(lang && lang !== 'ar'\) \? lang : null;/.test(cardBody), 'SSR: _trLang gated on lang !== ar');
ok(/dhikr\['translation_' \+ _trLang\]/.test(cardBody), 'SSR: reads dhikr[translation_{lang}] generically');
ok(/dir="' \+ \(_trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(cardBody), 'SSR: Urdu dir=rtl, others ltr');
ok(/_trLang === 'ur' \? ' style="direction:rtl;text-align:right"'/.test(cardBody), 'SSR: Urdu gets inline rtl style (overrides the LTR base)');
ok(/class="azkar-translation-en"/.test(cardBody) && /_escHtml\(_trText\)/.test(cardBody), 'SSR: class kept + _escHtml(_trText)');
const concat = cardBody.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(concat && concat[0].indexOf('translationHtml') < concat[0].indexOf('textHtml'), 'SSR: translation ABOVE Arabic (concat order)');
// morning + evening now forward the UI lang (evening Quran translations localized); prayer stays 'ar'
ok(/_AZKAR_EVENING_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, lang \|\| 'ar'\)\)/.test(srvSrc), "evening list forwards lang (evening Quran translations now localized)");
ok(/_AZKAR_PRAYER_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, 'ar'\)\)/.test(srvSrc), "prayer list still 'ar' (out of scope, unchanged)");

console.log('\n================ 8. Client (js/app.js) — same generalization + Urdu RTL ================');
const cIdx = appSrc.indexOf("const _trLang = (_azkarUiLang && _azkarUiLang !== 'ar') ? _azkarUiLang : null;");
ok(cIdx > -1, 'client: _trLang gated on _azkarUiLang !== ar');
const cBlock = appSrc.slice(cIdx, cIdx + 600);
ok(/dhikr\['translation_' \+ _trLang\]/.test(cBlock), 'client: reads dhikr[translation_{lang}] generically');
ok(/trEl\.setAttribute\('dir', _trLang === 'ur' \? 'rtl' : 'ltr'\)/.test(cBlock), 'client: Urdu dir=rtl');
ok(/_trLang === 'ur'\) \{ trEl\.style\.direction = 'rtl'; trEl\.style\.textAlign = 'right'; \}/.test(cBlock), 'client: Urdu inline rtl style');
ok(/trEl\.textContent = _trText/.test(cBlock), 'client: textContent (no HTML injection)');

console.log('\n================ 9. NO runtime external translation requests (QuranEnc dev-only) ================');
ok(!/quranenc\.com/i.test(srvSrc), 'server.js has NO quranenc.com URL (no runtime fetch; "QuranEnc" in a comment is fine)');
ok(!/quranenc\.com/i.test(appSrc), 'app.js has NO quranenc.com URL (no runtime fetch)');
ok(!/quranenc\.com/i.test(dataSrc), 'azkar-data.js has NO quranenc.com URL (pure static strings)');
ok(fs.existsSync(extractPath), 'dev-only extraction script exists (scripts/_extract_quranenc_azkar_translations_once.mjs)');
ok(!/_extract_quranenc/.test(srvSrc) && !/_extract_quranenc/.test(appSrc), 'extraction script is NOT imported by server.js/app.js (dev-only)');

console.log('\n================ 10. CSS + cache-busters ================');
ok(/\.azkar-translation-en\s*\{/.test(cssSrc), 'css .azkar-translation-en present (base style; Urdu overridden inline)');
ok(/js\/azkar-data\.js\?v=51/.test(htmlSrc), 'index.html azkar-data.js?v=51 (data changed: Card 09 translations added)');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842 (app.js untouched — generic renderer)');
ok(/CACHE_VERSION = 'v549'/.test(swSrc), "sw.js CACHE_VERSION 'v549'");

console.log('\n================ 11. Out-of-scope guardrails ================');
ok((srvSrc.match(/class="azkar-translation-en"/g) || []).length === 1, 'server.js emits the translation <p> markup in exactly ONE place');
ok((appSrc.match(/className = 'azkar-translation-en'/g) || []).length === 1, 'app.js builds the translation paragraph in exactly ONE place');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
