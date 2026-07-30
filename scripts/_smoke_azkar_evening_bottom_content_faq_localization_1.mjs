// Smoke — AZKAR-EVENING-BOTTOM-CONTENT-FAQ-LOCALIZATION-ALL-LANGUAGES-1 (batch 2/3: Evening)
// Static invariants (no server boot): evening chrome dict has the 37 bottom keys × 10 langs,
// ar byte-exact (idempotent), non-ar distinct from ar AND from the morning dict, index.html evening
// region wired with data-azkar-ui / -aria + FAQ-schema placeholder (and NO data-azkar-ui-href),
// server.js evening FAQPage builder + injection present, morning untouched, cache-busters synced.
import fs from 'fs';
import vm from 'vm';
const ROOT = 'C:/Users/Tarek/Downloads/TIME PRAYER';
let pass = 0, fail = 0;
const A = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// ---- 1. dict load ----
const ctx = { window: {}, console: { log() {} } };
vm.runInNewContext(fs.readFileSync(ROOT + '/js/azkar-data.js', 'utf8'), ctx);
const M = ctx.window.AZKAR_MORNING_UI_L10N, E = ctx.window.AZKAR_EVENING_UI_L10N;
const LANGS = ['ar', 'en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];
const KEYS = ['eduSecAria', 'edu1T', 'edu1P1', 'edu1P2', 'edu2T', 'edu2P1', 'edu2P2', 'edu3T', 'edu3P1', 'edu3P2',
  'linksAria', 'lnkBack', 'lnkMorning', 'lnkPrayer', 'lnkPrayerTimes', 'lnkQibla', 'lnkHijri', 'lnkMoon',
  'faqTitle', 'faqQ1', 'faqA1', 'faqQ2', 'faqA2', 'faqQ3', 'faqA3', 'faqQ4', 'faqA4', 'faqQ5', 'faqA5',
  'faqQ6', 'faqA6', 'faqQ7', 'faqA7', 'faqQ8', 'faqA8', 'faqQ9', 'faqA9'];
A(!!E && typeof E === 'object', 'AZKAR_EVENING_UI_L10N present');
for (const l of LANGS) {
  A(!!E[l], l + ': evening dict exists');
  KEYS.forEach(k => A(E[l] && typeof E[l][k] === 'string' && E[l][k].trim().length > 0, l + ': E.' + k + ' non-empty'));
}

// ---- 2. ar byte-exact vs HTML source (idempotency spot checks) ----
A(E.ar.eduSecAria === 'معلومات تعليمية عن أذكار المساء', 'ar eduSecAria byte-exact');
A(E.ar.edu1T === 'فضل أذكار المساء في ختام اليوم', 'ar edu1T byte-exact');
A(E.ar.edu3T === 'الفرق بين أذكار الصباح والمساء', 'ar edu3T byte-exact');
A(E.ar.lnkMorning === 'أذكار الصباح', 'ar lnkMorning byte-exact');
A(E.ar.faqTitle === 'أسئلة شائعة حول أذكار المساء', 'ar faqTitle byte-exact');
A(E.ar.faqQ8 === 'هل أذكار المساء تحفظ تقدمي تلقائيًا في هذه الصفحة؟', 'ar faqQ8 byte-exact');
A(E.ar.faqA9 === 'يساعدك عداد أذكار المساء على إكمال الأذكار المتكررة بسهولة، خاصة الأذكار التي تُقال ثلاث مرات أو سبع مرات أو مئة مرة، دون الحاجة إلى العد يدويًا.', 'ar faqA9 byte-exact');

// ---- 3. non-ar distinct from ar AND from morning dict ----
for (const l of LANGS.filter(x => x !== 'ar')) {
  ['edu1T', 'edu2T', 'faqTitle', 'faqQ1', 'faqA1'].forEach(k => {
    A(E[l][k] !== E.ar[k], l + ': E.' + k + ' localized (≠ ar)');
    A(E[l][k] !== M[l][k], l + ': E.' + k + ' ≠ morning M.' + k);
  });
}
// evening carries lnkMorning, NOT the morning-only lnkEvening bottom label
for (const l of LANGS) {
  A(E[l].lnkMorning !== undefined, l + ': E.lnkMorning present');
  A(E[l].lnkEvening === undefined, l + ': E.lnkEvening absent (evening dict clean of morning bottom)');
}
// morning dict intact: still lnkEvening, no lnkMorning, edu1T still morning
A(M.en.lnkEvening === 'Evening Athkar' && M.en.lnkMorning === undefined, 'morning dict intact (lnkEvening, no lnkMorning)');
A(M.ar.edu1T === 'فضل أذكار الصباح في بداية اليوم', 'morning ar edu1T intact');
// evening lnkMorning === morning heroTitle (symmetry)
A(E.en.lnkMorning === 'Morning Athkar' && E.fr.lnkMorning === 'Invocations du matin', 'evening lnkMorning = morning heroTitle');

// ---- 4. index.html evening region wiring ----
const html = fs.readFileSync(ROOT + '/index.html', 'utf8');
const s = html.indexOf('id="page-azkar-evening"'), e = html.indexOf('id="page-azkar-prayer"');
A(s > -1 && e > s, 'evening region bounds found');
const region = html.slice(s, e);
['edu1T', 'edu2T', 'edu3T', 'edu1P1', 'edu1P2', 'edu2P1', 'edu2P2', 'edu3P1', 'edu3P2',
  'lnkBack', 'lnkMorning', 'lnkPrayer', 'lnkPrayerTimes', 'lnkQibla', 'lnkHijri', 'lnkMoon', 'faqTitle',
  'faqQ1', 'faqQ5', 'faqQ9', 'faqA1', 'faqA5', 'faqA9'].forEach(k =>
    A(region.includes('data-azkar-ui="' + k + '"'), 'evening HTML has data-azkar-ui="' + k + '"'));
A(region.includes('data-azkar-ui-aria="eduSecAria"'), 'evening HTML eduSecAria aria');
A(region.includes('data-azkar-ui-aria="linksAria"'), 'evening HTML linksAria aria');
A(region.includes('<!-- AZKAR-EVENING-FAQ-SCHEMA -->'), 'evening HTML FAQ-schema placeholder');
A(!region.includes('data-azkar-ui-href'), 'evening HTML has NO data-azkar-ui-href (hrefs via existing lang-prefix pass)');
// evening related links keep bare base hrefs (existing SSR pass prefixes them)
A(region.includes('href="/azkar/morning-azkar"'), 'evening bare href /azkar/morning-azkar (pass prefixes)');
A(region.includes('href="/qibla"') && region.includes('href="/moon-today"'), 'evening bare hrefs /qibla + /moon-today');

// ---- 5. server.js builder + injection ----
const server = fs.readFileSync(ROOT + '/server.js', 'utf8');
A(/function _buildAzkarEveningFaqJsonLd\(lang\)/.test(server), 'server _buildAzkarEveningFaqJsonLd defined');
A(server.includes("_buildAzkarEveningFaqJsonLd(_azkarEveningLang)"), 'server injects evening FAQ JSON-LD');
A(server.includes("html.replace('<!-- AZKAR-EVENING-FAQ-SCHEMA -->'"), 'server replaces evening FAQ placeholder');
A(/_buildAzkarEveningFaqJsonLd[\s\S]{0,400}_azkarEveningUiL10n\(lang\)/.test(server), 'evening builder reads evening dict');

// ---- 6. morning untouched ----
const ms = html.indexOf('id="page-azkar-morning"'), me = html.indexOf('id="page-azkar-evening"');
const mRegion = html.slice(ms, me);
A(mRegion.includes('data-azkar-ui="edu1T"') && mRegion.includes('<!-- AZKAR-MORNING-FAQ-SCHEMA -->'), 'morning region still wired');

// ---- 7. cache-busters ----
A(html.includes('azkar-data.js?v=40'), 'index.html azkar-data.js?v=40');
A(html.includes('app.js?v=842'), 'index.html app.js?v=842 (unchanged)');
A(fs.readFileSync(ROOT + '/sw.js', 'utf8').includes("CACHE_VERSION = 'v538'"), "sw.js CACHE_VERSION 'v538'");

console.log('\n================ AZKAR EVENING BOTTOM SMOKE: ' + pass + ' passed, ' + fail + ' failed ================');
process.exit(fail ? 1 : 0);
