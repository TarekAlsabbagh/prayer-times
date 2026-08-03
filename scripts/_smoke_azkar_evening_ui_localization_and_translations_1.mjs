// Smoke — AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1
// The EVENING azkar page (/azkar/evening-azkar) is localized to all 10 languages: (1) its UI chrome via
// AZKAR_EVENING_UI_L10N (derived from AZKAR_MORNING_UI_L10N — shared keys inherited byte-identical, only the
// evening-specific keys overridden) + a parallel SSR walker (_translateAzkarEveningUi) + client evening chrome
// (Proxy/toast/confirm generalized to the ACTIVE azkar page); (2) the first 4 Quran cards (evening-001..004 =
// Kursi/Ikhlas/Falaq/An-Nas) carry the SAME translation fields as morning-001..004 (Arabic byte-identical,
// copied verbatim — en=Saheeh, 8=QuranEnc static, NO runtime). Morning/prayer/rest-of-evening unchanged.
import fs from 'fs';
import path from 'path';
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

const LANGS = ['ar', 'en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const NONAR = LANGS.filter(l => l !== 'ar');

// Load the shared data + dicts exactly like server.js (sandbox).
const sb = { window: {}, console: { log: () => {} } };
new Function('window', 'console', dataSrc)(sb.window, sb.console);
const M = sb.window.AzkarMorning, E = sb.window.AzkarEvening;
const MUI = sb.window.AZKAR_MORNING_UI_L10N, EUI = sb.window.AZKAR_EVENING_UI_L10N;
const byId = (arr, id) => arr.find(d => d.id === id);
const PAIRS = [['morning-001','evening-001','Kursi'],['morning-002','evening-002','Ikhlas'],['morning-003','evening-003','Falaq'],['morning-004','evening-004','An-Nas']];

console.log('================ 1. Evening UI dict — 10 langs, derived from morning, evening overrides ================');
ok(!!EUI && typeof EUI === 'object', 'window.AZKAR_EVENING_UI_L10N exported');
ok(LANGS.every(l => EUI[l]), 'all 10 languages present in evening dict');
// shared/generic keys inherited byte-identical from morning (same internal lexicon)
ok(LANGS.every(l => EUI[l].progressTpl === MUI[l].progressTpl && EUI[l].resetBtn === MUI[l].resetBtn &&
   EUI[l].undo === MUI[l].undo && EUI[l].sourceLabel === MUI[l].sourceLabel &&
   JSON.stringify(EUI[l].rep) === JSON.stringify(MUI[l].rep)), 'shared keys (progressTpl/resetBtn/undo/sourceLabel/rep) inherited byte-identical from morning');
// evening-specific overrides differ from morning
ok(EUI.en.heroTitle === 'Evening Athkar' && EUI.ar.heroTitle === 'أذكار المساء' && EUI.de.heroTitle === 'Abend-Adhkar', 'heroTitle overridden per lang (en/ar/de)');
ok(LANGS.every(l => /23/.test(EUI[l].infoCount)) && MUI.en.infoCount === '25 adhkar', 'evening infoCount = 23 (morning stays 25)');
ok(LANGS.every(l => EUI[l].heroTitle !== MUI[l].heroTitle), 'every lang heroTitle differs from morning (morning→evening)');
// ar overrides equal the current hardcoded evening template (so /ar UI unchanged)
ok(EUI.ar.completedSub === 'نسأل الله أن يجعل ليلتك عامرة بالذكر والطمأنينة.', 'ar completedSub matches the existing evening template');

console.log('\n================ 2. Evening Quran translations — copied VERBATIM from morning (byte-identical Arabic) ================');
for (const [mid, eid, name] of PAIRS) {
  const m = byId(M, mid), e = byId(E, eid);
  ok(!!m && !!e, `${eid} present`);
  ok(m.text === e.text, `${name}: ${eid}.text byte-identical to ${mid}.text`);
  ok(NONAR.every(l => e['translation_' + l] === m['translation_' + l]), `${name}: all 9 translations copied verbatim from ${mid}`);
  ok(NONAR.every(l => e['translation_' + l] != null), `${name}: has all 9 non-ar translations`);
  ok(e['translation_ar'] == null, `${name}: NO translation_ar (Arabic UI shows no translation block)`);
}
// exactly 8 per non-ar lang in the EVENING region (001-004 Quran + 005-015 dua); rest-of-evening (009+) has none
const evEnd = dataSrc.indexOf('window.AzkarPrayer');
const e1 = dataSrc.indexOf("id: 'evening-001'");
const eveningRegion = (evEnd > e1) ? dataSrc.slice(e1, evEnd) : dataSrc.slice(e1);
for (const l of NONAR) ok((eveningRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 15, `translation_${l}: appears EXACTLY 15 times in the evening region`);
ok(E.slice(15).every(d => NONAR.every(l => d['translation_' + l] == null)), 'evening cards 016+ carry NO translation fields');

console.log('\n================ 3. Morning totals (Cards 01-06; owned by the morning/card smokes — pinned here) ================');
// CARD-05 ticket: morning-005 carries 8 translations (no de). CARD-06 ticket: morning-006 carries 7
// (en/ur/tr/bn/de/es/id — no fr/ms). Expected per-lang totals pinned below.
const mornEnd = dataSrc.indexOf('window.AzkarEvening');
const m1 = dataSrc.indexOf("id: 'morning-001'");
const morningRegion = dataSrc.slice(m1, mornEnd);
const _MORN_EXPECT = { en: 25, ur: 25, tr: 25, bn: 25, es: 25, id: 25, de: 25, fr: 25, ms: 25 }; // Card 25 complete: uniform 25
for (const l of NONAR) { const _exp = _MORN_EXPECT[l]; ok((morningRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === _exp, `morning translation_${l} EXACTLY ${_exp}`); }
ok(sb.window.AzkarMorning.length === 25 && sb.window.AzkarEvening.length === 23, 'still 25 morning + 23 evening items');

console.log('\n================ 4. No transliteration / footnotes / leading verse numbers in evening translations ================');
const eb1 = dataSrc.slice(e1, dataSrc.indexOf("id: 'evening-002'"));
const eb2 = dataSrc.slice(dataSrc.indexOf("id: 'evening-002'"), dataSrc.indexOf("id: 'evening-003'"));
const eb3 = dataSrc.slice(dataSrc.indexOf("id: 'evening-003'"), dataSrc.indexOf("id: 'evening-004'"));
const eb4 = dataSrc.slice(dataSrc.indexOf("id: 'evening-004'"), dataSrc.indexOf("id: 'evening-005'"));
ok(![eb1, eb2, eb3, eb4].some(b => /\[\p{Nd}+\]/u.test(b)), 'no footnote-marker digit-brackets in any evening translation');
ok(!/Bismill/i.test(eb1 + eb2 + eb3 + eb4), 'no transliterated Basmala (tr omits it) in evening translations');
ok(/translation_es:\s*"En el nombre de Dios/.test(eb2) && /translation_es:\s*"En el nombre de Dios/.test(eb3), 'evening es Ikhlas/Falaq start with the Basmala (no leading verse number)');
ok(/translation_tr:\s*"De ki: Ben, sabahın Rabbine/.test(eb3), 'evening tr Al-Falaq starts with the surah (Basmala omitted)');

console.log('\n================ 5. SSR (server.js) — evening list forwards lang + evening walker + dict ================');
ok(/_AZKAR_EVENING_UI_L10N = \(_azkarSandbox\.window\.AZKAR_EVENING_UI_L10N/.test(srvSrc), 'server plucks AZKAR_EVENING_UI_L10N from the same sandbox');
ok(/function _azkarEveningUiL10n\(lang\)/.test(srvSrc), '_azkarEveningUiL10n(lang) helper present');
ok(/function _translateAzkarEveningUi\(html, lang\)/.test(srvSrc), '_translateAzkarEveningUi walker present');
ok(/function _buildAzkarEveningListHtml\(lang\)/.test(srvSrc), '_buildAzkarEveningListHtml now takes lang');
ok(/_AZKAR_EVENING_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, lang \|\| 'ar'\)\)/.test(srvSrc), 'evening list forwards the lang to the card builder');
ok(/const _azkarEveningLang = \(urlPath\.match\(/.test(srvSrc) && /_azkarEveningLang \|\| 'ar'|_buildAzkarEveningListHtml\(_azkarEveningLang\)/.test(srvSrc), 'evening route derives _azkarEveningLang from the path prefix + feeds the list builder');
ok(/html = _translateAzkarEveningUi\(html, _azkarEveningLang\);/.test(srvSrc), 'evening route applies the evening UI walker');
ok(/_AZKAR_PRAYER_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, 'ar'\)\)/.test(srvSrc), "prayer list still forces 'ar' (unchanged)");
// morning walker + list builder untouched
ok(/function _translateAzkarMorningUi\(html, lang\)/.test(srvSrc), 'morning walker signature unchanged');
ok(/html = _translateAzkarMorningUi\(html, _azkarUiLang\);/.test(srvSrc), 'morning route still calls the morning walker');

console.log('\n================ 6. Client (js/app.js) — evening chrome (Proxy/toast/confirm) generalized ================');
ok(/function _azkarActivePageIsEvening\(\)/.test(appSrc), '_azkarActivePageIsEvening() present');
ok(/function _azkarEveningUiMap\(\)/.test(appSrc), '_azkarEveningUiMap() present');
ok(/function _azkarActiveUiMap\(\)/.test(appSrc), '_azkarActiveUiMap() (morning OR evening) present');
ok(/new Proxy\(_AZKAR_AR_CHROME_BASE/.test(appSrc), 'chrome Proxy over the Arabic base still present');
ok(/get: function \(base, prop\) \{\s*const ui = _azkarActiveUiMap\(\);/.test(appSrc), 'Proxy resolves the ACTIVE azkar page chrome (morning or evening)');
ok(/else if \(message === 'تمت إعادة ضبط العدادات' && _azkarActivePageIsEvening\(\)\)/.test(appSrc), 'reset toast localized on the evening page too');
ok(/else if \(_azkarActivePageIsEvening\(\)\) \{[\s\S]{0,360}resetConfirmTitle/.test(appSrc), 'reset-confirm dialog localized on the evening page too');
// morning gates still present (behavior byte-identical)
ok(/if \(_azkarActivePageIsMorning\(\)\)/.test(appSrc), 'morning gate still present (morning behavior unchanged)');
ok(/message === 'تمت إعادة ضبط العدادات' && _azkarActivePageIsMorning\(\)/.test(appSrc), 'morning reset-toast gate intact');

console.log('\n================ 7. index.html — evening template carries data-azkar-ui markers (mirrors morning) ================');
const evStart = htmlSrc.indexOf('id="page-azkar-evening"');
const evEndH = htmlSrc.indexOf('id="page-azkar-prayer"', evStart);
const evTpl = (evStart > -1 && evEndH > evStart) ? htmlSrc.slice(evStart, evEndH) : htmlSrc.slice(evStart);
ok(/<h1 id="azkar-evening-h1" data-azkar-ui="heroTitle">/.test(evTpl), 'evening H1 carries data-azkar-ui="heroTitle"');
ok(/data-azkar-ui="heroSubtitle"/.test(evTpl) && /data-azkar-ui="bcHub"/.test(evTpl) && /data-azkar-ui="bcCurrent"/.test(evTpl), 'evening hero subtitle + breadcrumb keyed');
ok(/data-azkar-ui="infoCount"/.test(evTpl) && /data-azkar-ui="progressInit"/.test(evTpl) && /data-azkar-ui="resetBtn"/.test(evTpl), 'evening info-strip + progress + reset keyed');
ok(/data-azkar-ui="sectionTitle"/.test(evTpl) && /data-azkar-ui="completedTitle"/.test(evTpl) && /data-azkar-ui="completedSub"/.test(evTpl), 'evening section-intro + completed banner keyed');
ok(/data-azkar-ui-aria="ariaBreadcrumb"/.test(evTpl) && /data-azkar-ui-aria="ariaInfo"/.test(evTpl) && /data-azkar-ui-aria="resetBtn"/.test(evTpl), 'evening aria markers present');
ok((evTpl.match(/data-azkar-ui(?:-aria)?="/g) || []).length >= 18, 'at least 18 data-azkar-ui markers on the evening template');

console.log('\n================ 8. NO runtime external translation requests ================');
ok(!/quranenc\.com/i.test(srvSrc) && !/quranenc\.com/i.test(appSrc) && !/quranenc\.com/i.test(dataSrc), 'no quranenc.com URL in server/app/azkar-data (static only)');

console.log('\n================ 9. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=47/.test(htmlSrc), 'index.html azkar-data.js?v=47 (bumped by the Card 09 ticket)');
ok(/js\/app\.js\?v=842/.test(htmlSrc), 'index.html app.js?v=842');
ok(/CACHE_VERSION = 'v545'/.test(swSrc), "sw.js CACHE_VERSION 'v545' (bumped by the Card 09 ticket)");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
