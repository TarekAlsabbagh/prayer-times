// Smoke — AZKAR-MORNING-BOTTOM-CONTENT-FAQ-LOCALIZATION-ALL-LANGUAGES-1 (batch 1: morning only)
// Static checks (no server): (a) the 37 bottom keys exist in AZKAR_MORNING_UI_L10N for all 10 langs,
// ar == the exact on-page Arabic (so /ar stays idempotent), non-ar titles/FAQ are actually translated;
// (b) evening dict stays clean (no morning bottom keys leaked); (c) index.html wires data-azkar-ui on the
// morning edu/FAQ + FAQPage placeholder + NO leftover data-azkar-ui-href; (d) server.js has the FAQPage
// builder + injection and the walker did NOT gain an href rule; (e) cache-busters bumped.
import fs from 'fs';
import vm from 'vm';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
let pass = 0, fail = 0;
const A = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// ---- load dict ----
const ctx = { window: {}, console: { log() {} } };
vm.runInNewContext(read('js/azkar-data.js'), ctx);
const M = ctx.window.AZKAR_MORNING_UI_L10N, E = ctx.window.AZKAR_EVENING_UI_L10N;
const LANGS = ['ar', 'en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const KEYS = ['eduSecAria', 'edu1T', 'edu1P1', 'edu1P2', 'edu2T', 'edu2P1', 'edu2P2', 'edu3T', 'edu3P1', 'edu3P2',
  'linksAria', 'lnkBack', 'lnkEvening', 'lnkPrayer', 'lnkPrayerTimes', 'lnkQibla', 'lnkHijri', 'lnkMoon',
  'faqTitle', 'faqQ1', 'faqA1', 'faqQ2', 'faqA2', 'faqQ3', 'faqA3', 'faqQ4', 'faqA4', 'faqQ5', 'faqA5',
  'faqQ6', 'faqA6', 'faqQ7', 'faqA7', 'faqQ8', 'faqA8', 'faqQ9', 'faqA9'];
const TITLE_FAQ = ['edu1T', 'edu2T', 'edu3T', 'faqTitle', 'faqQ1', 'faqQ9', 'lnkEvening', 'lnkMoon'];

A(KEYS.length === 37, 'dict: 37 bottom keys defined');
// (a) all keys present + non-empty for every lang
LANGS.forEach((l) => {
  A(!!M[l], 'dict has lang ' + l);
  KEYS.forEach((k) => A(M[l] && typeof M[l][k] === 'string' && M[l][k].trim().length > 0, l + ': "' + k + '" present+non-empty'));
});
// ar must equal the exact on-page Arabic (idempotency anchors)
A(M.ar.edu1T === 'فضل أذكار الصباح في بداية اليوم', 'ar.edu1T byte-exact');
A(M.ar.faqTitle === 'أسئلة شائعة حول أذكار الصباح', 'ar.faqTitle byte-exact');
A(M.ar.faqQ1 === 'ما هي أذكار الصباح؟', 'ar.faqQ1 byte-exact');
A(M.ar.lnkEvening === 'أذكار المساء', 'ar.lnkEvening byte-exact');
// non-ar titles/FAQ are genuinely translated (differ from the Arabic)
LANGS.filter((l) => l !== 'ar').forEach((l) => {
  TITLE_FAQ.forEach((k) => A(M[l][k] !== M.ar[k], l + ': "' + k + '" differs from Arabic (translated)'));
  // no Arabic-letter leakage in the localized Latin/Indic titles (skip ur which is Arabic-script)
  if (l !== 'ur') A(!/[ء-ي]/.test(M[l].faqTitle + M[l].edu1T + M[l].edu2T + M[l].edu3T), l + ': edu/FAQ titles carry no Arabic letters');
});

// (b) evening dict stays clean (batch-2 will add its own)
// Batch 2 (AZKAR-EVENING-BOTTOM-CONTENT-FAQ) intentionally populates the evening dict with its OWN
// bottom content, so assert evening now has these keys but DISTINCT from morning, and still uses
// lnkMorning (not the morning-only lnkEvening bottom label).
['edu1T', 'faqTitle', 'faqQ1'].forEach((k) => A(E && E.en && E.en[k] && E.en[k] !== M.en[k], 'evening has its own "' + k + '" (≠ morning)'));
A(E && E.en && E.en.lnkEvening === undefined && !!E.en.lnkMorning, 'evening uses lnkMorning, not morning-only lnkEvening');

// (c) index.html wiring
const html = read('index.html');
// morning region only (up to the evening page)
const mStart = html.indexOf('id="page-azkar-morning"');
const mEnd = html.indexOf('id="page-azkar-evening"');
const region = html.slice(mStart, mEnd);
['eduSecAria', 'linksAria'].forEach((k) => A(region.includes('data-azkar-ui-aria="' + k + '"'), 'index morning has data-azkar-ui-aria="' + k + '"'));
['edu1T', 'edu2T', 'edu3T', 'edu1P1', 'edu3P2', 'lnkBack', 'lnkMoon', 'faqTitle', 'faqQ1', 'faqA1', 'faqQ9', 'faqA9'].forEach((k) =>
  A(region.includes('data-azkar-ui="' + k + '"'), 'index morning has data-azkar-ui="' + k + '"'));
A(html.includes('<!-- AZKAR-MORNING-FAQ-SCHEMA -->'), 'index has FAQPage placeholder');
A(!html.includes('data-azkar-ui-href'), 'index: NO leftover data-azkar-ui-href (href handled by existing unified pass)');
// morning edu-links keep their base href (existing pass prefixes at render)
A(region.includes('href="/azkar/evening-azkar"'), 'index morning evening-link base href intact');
A(region.includes('href="/moon-today"'), 'index morning moon-link base href intact');

// (d) server.js: FAQPage builder + injection; walker NOT given an href rule
const srv = read('server.js');
A(/function _buildAzkarMorningFaqJsonLd\(/.test(srv), 'server: _buildAzkarMorningFaqJsonLd defined');
A(srv.includes("html.replace('<!-- AZKAR-MORNING-FAQ-SCHEMA -->', _buildAzkarMorningFaqJsonLd(_azkarUiLang))"), 'server: FAQPage injected on morning route');
A(srv.includes("'@type': 'FAQPage'") && srv.includes('inLanguage: lang'), 'server: FAQPage schema shape');
A(!srv.includes('data-azkar-ui-href'), 'server: walker has NO href rule (existing pass owns hrefs)');

// (e) cache-busters
A((html.match(/azkar-data\.js\?v=40\b/g) || []).length >= 1, 'index: azkar-data.js?v=40');
A((html.match(/app\.js\?v=842\b/g) || []).length >= 2, 'index: app.js?v=842 (bumped — app.js touched in batch 3)');
A(!/app\.js\?v=839/.test(html), 'index: no app.js?v=839');
A(/CACHE_VERSION\s*=\s*'v538'/.test(read('sw.js')), 'sw.js: CACHE_VERSION v538');

console.log('\n================ AZKAR MORNING BOTTOM L10N SMOKE: ' + pass + ' passed, ' + fail + ' failed ================');
process.exit(fail ? 1 : 0);
