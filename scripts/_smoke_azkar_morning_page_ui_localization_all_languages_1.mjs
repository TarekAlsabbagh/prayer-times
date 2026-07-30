// Smoke — AZKAR-MORNING-PAGE-UI-LOCALIZATION-ALL-LANGUAGES-1
// The morning-azkar PAGE UI CHROME (hero title/subtitle, breadcrumb, info-strip, progress, reset,
// section-intro, completed banner, card chrome: repeat/source/virtue/authenticity labels, repeat
// VALUES, counter/undo/reset, status/toasts) is localized to all 10 languages via a single shared
// dict (window.AZKAR_MORNING_UI_L10N in js/azkar-data.js) read on BOTH sides — server.js SSR walker +
// builder, and js/app.js Proxy chrome + client walker. SCOPE = UI chrome only: the Arabic dhikr text,
// tashkeel, virtue/authenticityNote bodies, and source *values* stay Arabic; evening/prayer unchanged.
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

console.log('================ 1. Shared dict — 10 langs, complete, single source ================');
// Load the dict exactly like server.js does (sandbox).
const sb = { window: {}, console: { log: () => {} } };
new Function('window', 'console', dataSrc)(sb.window, sb.console);
const U = sb.window.AZKAR_MORNING_UI_L10N;
ok(!!U && typeof U === 'object', 'window.AZKAR_MORNING_UI_L10N exported');
ok(LANGS.every(l => U[l]), 'all 10 languages present: ' + LANGS.join(','));
const refKeys = Object.keys(U.ar);
const missing = [];
for (const l of LANGS) for (const k of refKeys) if (!(k in U[l])) missing.push(l + '.' + k);
ok(missing.length === 0, 'every language has all ' + refKeys.length + ' keys (no gaps): ' + (missing.slice(0, 3).join(',') || 'none'));
ok(LANGS.every(l => U[l].heroTitle && U[l].repeatLabel && U[l].sourceLabel && U[l].resetBtn && U[l].progressTpl),
   'core keys (heroTitle/repeatLabel/sourceLabel/resetBtn/progressTpl) populated in every language');
ok(U.en.heroTitle === 'Morning Athkar' && U.fr.heroTitle === 'Invocations du matin' && U.de.heroTitle === 'Morgen-Adhkar',
   'sample hero titles are native (en/fr/de)');
ok(U.ar.heroTitle === 'أذكار الصباح', 'ar hero title unchanged');
ok(U.en.rep && U.en.rep['1'] === 'once' && U.fr.rep['3'] === 'trois fois' && U.ar.rep['7'] === 'سبع مرات',
   'repeat VALUE map localized (en once / fr trois fois / ar سبع مرات)');
ok(/\{done\}/.test(U.en.progressTpl) && /\{total\}/.test(U.en.progressTpl), 'progressTpl carries {done}/{total} placeholders');

console.log('\n================ 2. Data invariants — dhikr text/virtue NOT touched ================');
ok((dataSrc.match(/translation_en:/g) || []).length >= 1, 'translation_en present (count owned by the translation smoke; later tickets add more langs/cards)');
ok(dataSrc.includes('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ'), 'Ayat al-Kursi Arabic text (with tashkeel) intact in data');
ok(sb.window.AzkarMorning.length === 25, 'still 25 morning items');
// virtue/authenticityNote remain { ar, en } data objects (NOT localized this ticket)
ok(sb.window.AzkarMorning.some(d => d.virtue && d.virtue.ar), 'virtue bodies still Arabic data objects (out of scope)');

console.log('\n================ 3. SSR (server.js) — dict-driven chrome + walker ================');
ok(/_AZKAR_MORNING_UI_L10N = \(_azkarSandbox\.window\.AZKAR_MORNING_UI_L10N/.test(srvSrc), 'server plucks the dict from the same sandbox');
ok(/function _azkarUiL10n\(lang\)/.test(srvSrc), '_azkarUiL10n(lang) helper present');
ok(/function _azkarRepeatLabel\(n, lang\)/.test(srvSrc), '_azkarRepeatLabel(n, lang) helper present');
ok(/function _translateAzkarMorningUi\(html, lang\)/.test(srvSrc), '_translateAzkarMorningUi walker present');
ok(!/_AZKAR_AR_CHROME_SSR/.test(srvSrc), 'old AR-only chrome constant fully removed from server.js');
ok(/const ui = _azkarUiL10n\(lang\);/.test(srvSrc), 'card builder resolves ui from the page language');
ok(/ui\.repeatLabel/.test(srvSrc) && /ui\.sourceLabel/.test(srvSrc) && /ui\.showVirtue/.test(srvSrc), 'card chrome reads ui.* (repeat/source/virtue labels)');
ok(/const repeatText = _azkarRepeatLabel\(target, lang\);/.test(srvSrc), 'SSR repeat value uses lang-aware label');
ok(/html = _translateAzkarMorningUi\(html, _azkarUiLang\);/.test(srvSrc), 'walker applied to the morning route in the page language');
// virtue/authenticityNote stay AR via _azkarLocalizedAR
ok(/_azkarLocalizedAR\(dhikr\.virtue/.test(srvSrc), 'virtue still rendered via _azkarLocalizedAR (Arabic, out of scope)');

console.log('\n================ 4. SSR — evening now forwards lang (AZKAR-EVENING…-1); prayer still \'ar\' ================');
// AZKAR-EVENING-PAGE-UI-LOCALIZATION-AND-QURAN-TRANSLATIONS-ALL-LANGUAGES-1 localized the evening page, so the
// evening list builder now forwards the route language (was hardcoded 'ar'). Prayer remains out of scope ('ar').
ok(/_AZKAR_EVENING_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, lang \|\| 'ar'\)\)/.test(srvSrc), "evening list forwards lang (evening now localized)");
ok(/_AZKAR_PRAYER_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, 'ar'\)\)/.test(srvSrc), "prayer list still forces 'ar'");

console.log('\n================ 5. Client (js/app.js) — Proxy chrome + walker ================');
ok(/function _azkarActivePageIsMorning\(\)/.test(appSrc), '_azkarActivePageIsMorning() gate present');
ok(/function _azkarMorningUiMap\(\)/.test(appSrc), '_azkarMorningUiMap() present');
ok(/new Proxy\(_AZKAR_AR_CHROME_BASE/.test(appSrc), 'chrome is a Proxy over the Arabic base (localizes on morning only)');
ok(/if \(_azkarActivePageIsMorning\(\)\)/.test(appSrc), 'Proxy/repeat gate on active morning page');
ok(/function _azkarLocalizeStaticUi\(\)/.test(appSrc), 'client static-chrome walker present (SPA nav)');
ok(/_azkarLocalizeStaticUi\(\);/.test(appSrc), 'client walker invoked in _loadAzkarMorning');
ok(/const repeatText = _azkarRepeatLabelAR\(target\);/.test(appSrc), 'render loop uses the (now lang-aware) repeat label directly');
// reset confirm + toast localized on morning only
ok(/opts = Object\.assign\(\{\}, opts, \{[\s\S]{0,120}resetConfirmTitle/.test(appSrc), 'reset-confirm overrides from dict on morning page');
ok(/message === 'تمت إعادة ضبط العدادات' && _azkarActivePageIsMorning\(\)/.test(appSrc), 'reset toast localized on morning page');

console.log('\n================ 6. index.html — data-azkar-ui on static chrome ================');
ok(/<h1 id="azkar-morning-h1" data-azkar-ui="heroTitle">/.test(htmlSrc), 'H1 carries data-azkar-ui="heroTitle"');
ok(/data-azkar-ui="heroSubtitle"/.test(htmlSrc) && /data-azkar-ui="bcHub"/.test(htmlSrc) && /data-azkar-ui="bcCurrent"/.test(htmlSrc), 'hero subtitle + breadcrumb keyed');
ok(/data-azkar-ui="infoCount"/.test(htmlSrc) && /data-azkar-ui="progressInit"/.test(htmlSrc) && /data-azkar-ui="resetBtn"/.test(htmlSrc), 'info-strip + progress + reset keyed');
ok(/data-azkar-ui="completedTitle"/.test(htmlSrc) && /data-azkar-ui="sectionTitle"/.test(htmlSrc), 'section-intro + completed banner keyed');
ok(/data-azkar-ui-aria="ariaBreadcrumb"/.test(htmlSrc), 'aria-label keyed too (data-azkar-ui-aria)');
ok((htmlSrc.match(/data-azkar-ui/g) || []).length >= 18, 'at least 18 data-azkar-ui markers on the page');

console.log('\n================ 7. Cache-busters ================');
ok(/js\/app\.js\?v=84[0-9]/.test(htmlSrc), 'index.html app.js?v bumped (≥831)');
ok(/js\/azkar-data\.js\?v=\d+/.test(htmlSrc), 'index.html azkar-data.js?v is bumped (version-agnostic; later tickets bump it)');
ok(/CACHE_VERSION = 'v\d{3}'/.test(swSrc), "sw.js CACHE_VERSION is a 3-digit version (bumped)");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
