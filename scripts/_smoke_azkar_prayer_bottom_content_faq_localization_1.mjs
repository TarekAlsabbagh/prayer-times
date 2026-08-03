// Smoke — AZKAR-PRAYER-BOTTOM-CONTENT-FAQ-LOCALIZATION-ALL-LANGUAGES-1 (batch 3/3: Prayer, full build)
// Static invariants (no server boot): prayer chrome dict has the 36 bottom keys × 10 langs, ar byte-exact,
// salawat ﷺ preserved, non-ar distinct from ar/morning/evening; index.html prayer region wired with
// data-azkar-ui / -aria + FAQ-schema placeholder (NO data-azkar-ui-href); server.js has the NEW prayer dict
// load + accessor + walker + FAQPage builder + SSR-branch wiring; app.js has the NEW prayer map + client
// walker + its call inside _loadAzkarPrayer; morning/evening untouched; cache-busters synced (app touched).
import fs from 'fs';
import vm from 'vm';
const ROOT = 'C:/Users/Tarek/Downloads/TIME PRAYER';
let pass = 0, fail = 0;
const A = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// ---- 1. dict load ----
const ctx = { window: {}, console: { log() {} } };
vm.runInNewContext(fs.readFileSync(ROOT + '/js/azkar-data.js', 'utf8'), ctx);
const M = ctx.window.AZKAR_MORNING_UI_L10N, E = ctx.window.AZKAR_EVENING_UI_L10N, P = ctx.window.AZKAR_PRAYER_UI_L10N;
const LANGS = ['ar', 'en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const KEYS = ['eduSecAria', 'edu1T', 'edu1P1', 'edu1P2', 'edu2T', 'edu2P1', 'edu2P2', 'edu3T', 'edu3P1', 'edu3P2',
  'linksAria', 'lnkBack', 'lnkMorning', 'lnkEvening', 'lnkPrayerTimes', 'lnkQibla', 'lnkHijri',
  'faqTitle', 'faqQ1', 'faqA1', 'faqQ2', 'faqA2', 'faqQ3', 'faqA3', 'faqQ4', 'faqA4', 'faqQ5', 'faqA5',
  'faqQ6', 'faqA6', 'faqQ7', 'faqA7', 'faqQ8', 'faqA8', 'faqQ9', 'faqA9'];
A(!!P && typeof P === 'object', 'AZKAR_PRAYER_UI_L10N present');
for (const l of LANGS) {
  A(!!P[l], l + ': prayer dict exists');
  KEYS.forEach(k => A(P[l] && typeof P[l][k] === 'string' && P[l][k].trim().length > 0, l + ': P.' + k + ' non-empty'));
  A(Object.keys(P[l] || {}).length === 36, l + ': exactly 36 keys (' + Object.keys(P[l] || {}).length + ')');
}

// ---- 2. ar byte-exact vs HTML source (idempotency spot checks) ----
A(P.ar.eduSecAria === 'معلومات تعليمية عن أذكار الصلاة', 'ar eduSecAria byte-exact');
A(P.ar.edu1T === 'فضل أذكار الصلاة وأهميتها', 'ar edu1T byte-exact');
A(P.ar.faqTitle === 'أسئلة شائعة حول أذكار الصلاة', 'ar faqTitle byte-exact');
A(P.ar.faqQ2 === 'هل أذكار الصلاة كلها ثابتة عن النبي ﷺ؟', 'ar faqQ2 byte-exact (ﷺ)');
A(P.ar.lnkMorning === 'أذكار الصباح' && P.ar.lnkEvening === 'أذكار المساء', 'ar links byte-exact (morning+evening)');

// ---- 3. salawat ﷺ preserved in all langs (source has it at edu1P1, faqQ2, faqA7) ----
for (const l of LANGS) ['edu1P1', 'faqQ2', 'faqA7'].forEach(k => A(P[l][k].indexOf('ﷺ') !== -1, l + ': ﷺ kept in ' + k));

// ---- 4. non-ar distinct from ar AND from morning/evening ----
for (const l of LANGS.filter(x => x !== 'ar')) {
  ['edu1T', 'faqTitle', 'faqQ1'].forEach(k => {
    A(P[l][k] !== P.ar[k], l + ': P.' + k + ' localized (≠ ar)');
    A(!M[l] || P[l][k] !== M[l][k], l + ': P.' + k + ' ≠ morning');
    A(!E[l] || P[l][k] !== E[l][k], l + ': P.' + k + ' ≠ evening');
  });
}
// no Cyrillic contamination in Latin-script langs
const CYR = /[Ѐ-ӿ]/;
for (const l of ['en', 'fr', 'tr', 'ms', 'de', 'es', 'id']) KEYS.forEach(k => A(!CYR.test(P[l][k]), l + ': no Cyrillic in ' + k));
// morning/evening intact
A(M.ar.edu1T === 'فضل أذكار الصباح في بداية اليوم', 'morning ar edu1T intact');
A(E.ar.edu1T === 'فضل أذكار المساء في ختام اليوم', 'evening ar edu1T intact');

// ---- 5. index.html prayer region wiring ----
const html = fs.readFileSync(ROOT + '/index.html', 'utf8');
const s = html.indexOf('id="page-azkar-prayer"'); A(s > -1, 'prayer region found');
const e = html.indexOf('<div class="page"', s + 20);
const region = html.slice(s, e > s ? e : undefined);
['edu1T', 'edu2T', 'edu3T', 'edu1P1', 'edu2P1', 'edu3P1', 'lnkBack', 'lnkMorning', 'lnkEvening', 'lnkPrayerTimes',
  'lnkQibla', 'lnkHijri', 'faqTitle', 'faqQ1', 'faqQ5', 'faqQ9', 'faqA1', 'faqA7', 'faqA9'].forEach(k =>
    A(region.includes('data-azkar-ui="' + k + '"'), 'prayer HTML has data-azkar-ui="' + k + '"'));
A(region.includes('data-azkar-ui-aria="eduSecAria"') && region.includes('data-azkar-ui-aria="linksAria"'), 'prayer HTML aria markers');
A(region.includes('<!-- AZKAR-PRAYER-FAQ-SCHEMA -->'), 'prayer HTML FAQ-schema placeholder');
A(!region.includes('data-azkar-ui-href'), 'prayer HTML NO data-azkar-ui-href (hrefs via existing pass)');
A(region.includes('href="/azkar/morning-azkar"') && region.includes('href="/azkar/evening-azkar"'), 'prayer bare hrefs morning+evening (pass prefixes)');
// prayer links to morning + evening, NOT to itself
A(!region.includes('href="/azkar/prayer-azkar"'), 'prayer does NOT self-link');

// ---- 6. server.js: prayer dict load + accessor + walker + FAQ builder + branch wiring ----
const server = fs.readFileSync(ROOT + '/server.js', 'utf8');
A(/let _AZKAR_PRAYER_UI_L10N = \{\};/.test(server), 'server declares _AZKAR_PRAYER_UI_L10N');
A(server.includes('_azkarSandbox.window.AZKAR_PRAYER_UI_L10N'), 'server loads prayer dict from sandbox');
A(/function _azkarPrayerUiL10n\(lang\)/.test(server), 'server _azkarPrayerUiL10n accessor');
A(/function _translateAzkarPrayerUi\(html, lang\)/.test(server), 'server _translateAzkarPrayerUi walker');
A(/function _buildAzkarPrayerFaqJsonLd\(lang\)/.test(server), 'server _buildAzkarPrayerFaqJsonLd builder');
A(server.includes('html = _translateAzkarPrayerUi(html, _azkarPrayerLang);'), 'server wires prayer walker in branch');
A(server.includes("html.replace('<!-- AZKAR-PRAYER-FAQ-SCHEMA -->'"), 'server injects prayer FAQ JSON-LD');

// ---- 7. app.js: prayer map + client walker + call inside _loadAzkarPrayer ----
const app = fs.readFileSync(ROOT + '/js/app.js', 'utf8');
A(/function _azkarPrayerUiMap\(\)/.test(app), 'app _azkarPrayerUiMap');
A(app.includes('window.AZKAR_PRAYER_UI_L10N'), 'app reads AZKAR_PRAYER_UI_L10N');
A(/function _azkarLocalizePrayerStaticUi\(\)/.test(app), 'app _azkarLocalizePrayerStaticUi client walker');
A(app.includes("document.getElementById('page-azkar-prayer')"), 'app client walker targets #page-azkar-prayer');
A(/function _loadAzkarPrayer\(\)[\s\S]{0,120}_azkarLocalizePrayerStaticUi\(\);/.test(app), 'app calls prayer localizer inside _loadAzkarPrayer');

// ---- 8. morning/evening region untouched ----
const mR = html.slice(html.indexOf('id="page-azkar-morning"'), html.indexOf('id="page-azkar-evening"'));
const eR = html.slice(html.indexOf('id="page-azkar-evening"'), html.indexOf('id="page-azkar-prayer"'));
A(mR.includes('<!-- AZKAR-MORNING-FAQ-SCHEMA -->') && mR.includes('data-azkar-ui="edu1T"'), 'morning region still wired');
A(eR.includes('<!-- AZKAR-EVENING-FAQ-SCHEMA -->') && eR.includes('data-azkar-ui="edu1T"'), 'evening region still wired');

// ---- 9. cache-busters (app.js WAS touched → 838) ----
A(html.includes('azkar-data.js?v=46'), 'index.html azkar-data.js?v=46');
A(html.includes('app.js?v=842') && !html.includes('app.js?v=837'), 'index.html app.js?v=842 (bumped, no stale 837)');
A(fs.readFileSync(ROOT + '/sw.js', 'utf8').includes("CACHE_VERSION = 'v544'"), "sw.js CACHE_VERSION 'v544'");

console.log('\n================ AZKAR PRAYER BOTTOM SMOKE: ' + pass + ' passed, ' + fail + ' failed ================');
process.exit(fail ? 1 : 0);
