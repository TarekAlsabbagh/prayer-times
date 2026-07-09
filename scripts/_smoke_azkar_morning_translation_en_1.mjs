// Smoke — AZKAR-MORNING-ADD-ENGLISH-TRANSLATION-ABOVE-ARABIC-1
// The FIRST morning dhikr (Ayat al-Kursi, id morning-001) shows a Saheeh-International English translation
// ABOVE the Arabic text — but ONLY in the English UI (route prefix /en). The Arabic UI (no prefix) and every
// other language are unchanged; evening/prayer azkar are unchanged; the Arabic text/tashkeel is untouched and
// stays visible in all cases. SSR (server.js, /en-gated) and the client SPA rebuild (js/app.js, getCurrentLang)
// both add the same paragraph; the CSS class .azkar-translation-en (+ dark variant) styles it.
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

let pass = 0, fail = 0; const fails = [];
function ok(c, m) { if (c) { pass++; console.log('  PASS  ' + m); } else { fail++; fails.push(m); console.log('  FAIL  ' + m); } }

const SAHEEH_SNIPPET = 'the Ever-Living, the Sustainer of [all] existence';

console.log('================ 1. Data — translation_en on morning-001 ONLY ================');
ok(/translation_en:/.test(dataSrc), 'js/azkar-data.js declares a translation_en field');
ok((dataSrc.match(/translation_en:/g) || []).length === 1, 'EXACTLY ONE translation_en entry in the whole data file (first item only)');
ok(dataSrc.includes(SAHEEH_SNIPPET), 'the Saheeh International text is the translation value');
// The translation_en must belong to the morning-001 (Ayat al-Kursi) entry: it appears between that id and the
// next entry id.
const m001 = dataSrc.indexOf("id: 'morning-001'");
const m002 = dataSrc.indexOf("id: 'morning-002'");
const trIdx = dataSrc.indexOf('translation_en:');
ok(m001 > -1 && m002 > m001, 'morning-001 and morning-002 ids both present (schema intact)');
ok(trIdx > m001 && trIdx < m002, 'translation_en sits inside the morning-001 entry (not morning-002+)');
// Arabic text + tashkeel of Ayat al-Kursi is still present and untouched (the ayah opener with harakat).
ok(dataSrc.includes('اللَّهُ'), 'Arabic Ayat al-Kursi text (with tashkeel) still present in data');

console.log('\n================ 2. SSR (server.js) — en-gated, ABOVE the Arabic ================');
ok(/function _buildAzkarCardHtml\(dhikr, idx, lang\)/.test(srvSrc), '_buildAzkarCardHtml gained a lang parameter');
const cardStart = srvSrc.indexOf('function _buildAzkarCardHtml(dhikr, idx, lang)');
const cardEnd   = srvSrc.indexOf('function _buildAzkarMorningListHtml', cardStart);
const cardBody  = srvSrc.slice(cardStart, cardEnd);
ok(/const translationHtml = \(lang === 'en' && dhikr\.translation_en\)/.test(cardBody),
   'translationHtml is gated on lang===\'en\' AND dhikr.translation_en');
ok(/class="azkar-translation-en" dir="ltr" lang="en"/.test(cardBody), 'SSR paragraph carries class + dir=ltr + lang=en');
ok(/_escHtml\(dhikr\.translation_en\)/.test(cardBody), 'SSR escapes the translation text (_escHtml)');
// Ordering in the concat chain: translationHtml must come BEFORE textHtml (Arabic).
const concat = cardBody.match(/headerHtml \+ translationHtml \+ textHtml \+ [^\n]+/);
ok(!!concat, 'card body concat chain located (headerHtml + translationHtml + textHtml + …)');
ok(concat && concat[0].indexOf('translationHtml') < concat[0].indexOf('textHtml'),
   'concat order puts translationHtml BEFORE textHtml (English above Arabic)');

console.log('\n================ 3. SSR — morning passes lang; evening/prayer do NOT (unchanged) ================');
ok(/function _buildAzkarMorningListHtml\(lang\)/.test(srvSrc), '_buildAzkarMorningListHtml gained a lang parameter');
ok(/_AZKAR_MORNING_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, lang\)\)/.test(srvSrc),
   'morning list forwards lang into _buildAzkarCardHtml');
ok(/_AZKAR_EVENING_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, 'ar'\)\)/.test(srvSrc),
   "evening list calls _buildAzkarCardHtml with 'ar' (out of scope → no translation)");
ok(/_AZKAR_PRAYER_DATA\.map\(\(dhikr, idx\) => _buildAzkarCardHtml\(dhikr, idx, 'ar'\)\)/.test(srvSrc),
   "prayer list calls _buildAzkarCardHtml with 'ar' (out of scope → no translation)");

console.log('\n================ 4. SSR injection — UI lang from route prefix ================');
ok(/const _azkarUiLang = \(urlPath\.match\(\/\^\\\/\(en\|fr\|tr\|ur\|de\|id\|es\|bn\|ms\)\\\/\/\) \|\| \[\]\)\[1\] \|\| 'ar';/.test(srvSrc),
   'injection computes _azkarUiLang from the route prefix (no prefix ⇒ ar)');
ok(/_buildAzkarMorningListHtml\(_azkarUiLang\)/.test(srvSrc), 'injection passes _azkarUiLang into the morning list builder');

console.log('\n================ 5. Client (js/app.js) — same gate on SPA rebuild ================');
ok(/const _azkarUiLang = \(typeof getCurrentLang === 'function'\) \? getCurrentLang\(\) : 'ar';/.test(appSrc),
   'client derives _azkarUiLang from getCurrentLang()');
const cIdx = appSrc.indexOf("if (_azkarUiLang === 'en' && dhikr.translation_en) {");
ok(cIdx > -1, 'client gates the translation on _azkarUiLang===\'en\' AND dhikr.translation_en');
const cBlock = appSrc.slice(cIdx, cIdx + 320);
ok(/trEl\.className = 'azkar-translation-en'/.test(cBlock), 'client builds a .azkar-translation-en paragraph');
ok(/trEl\.setAttribute\('dir', 'ltr'\)/.test(cBlock) && /trEl\.setAttribute\('lang', 'en'\)/.test(cBlock),
   'client sets dir=ltr + lang=en');
ok(/trEl\.textContent = dhikr\.translation_en/.test(cBlock), 'client uses textContent (no HTML injection)');
// The client block sits AFTER the header append and BEFORE the Arabic text element.
const hdrIdx  = appSrc.indexOf('card.appendChild(headerRow);');
const textIdx = appSrc.indexOf("textEl.className = (dhikr.type === 'quran') ? 'azkar-quran-text' : 'azkar-text';");
ok(hdrIdx > -1 && cIdx > hdrIdx && cIdx < textIdx, 'client translation block is AFTER header and BEFORE the Arabic text');

console.log('\n================ 6. CSS — rule + dark variant present ================');
ok(/\.azkar-translation-en\s*\{/.test(cssSrc), 'css declares .azkar-translation-en');
ok(/html\[data-theme="dark"\]\s*\.azkar-translation-en\s*\{/.test(cssSrc), 'css declares a dark-theme variant');
ok(/\.azkar-translation-en[\s\S]{0,220}direction:\s*ltr/.test(cssSrc), '.azkar-translation-en is direction:ltr');

console.log('\n================ 7. Cache-busters bumped ================');
ok(/js\/app\.js\?v=83[0-9]/.test(htmlSrc), 'index.html app.js?v bumped (≥831)');
ok(/css\/style\.css\?v=497/.test(htmlSrc), 'index.html style.css?v=497');
ok(/js\/azkar-data\.js\?v=6/.test(htmlSrc), 'index.html azkar-data.js?v=6');
ok(/CACHE_VERSION = 'v\d{3}'/.test(swSrc), "sw.js CACHE_VERSION is a 3-digit version (bumped)");

console.log('\n================ 8. Out-of-scope guardrails (nothing leaked) ================');
// The only English translation the site ships is this one paragraph on the morning card path — the marker
// class/field must not have leaked into evening/prayer/other builders.
ok((srvSrc.match(/azkar-translation-en/g) || []).length === 1, 'server.js emits the translation markup in exactly ONE place');
ok((appSrc.match(/azkar-translation-en/g) || []).length === 1, 'app.js builds the translation paragraph in exactly ONE place');

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
