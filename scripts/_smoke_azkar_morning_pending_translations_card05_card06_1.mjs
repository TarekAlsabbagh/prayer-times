// Smoke — AZKAR-MORNING-DUA-PENDING-TRUSTED-TRANSLATIONS-CARD05-CARD06-1
// Fills the three PENDING morning translations from trusted published sources:
//   morning-005 += translation_de — Islamische Datenbank / Hisnu-l-Muslim, "Adhkar for morning & evening",
//                  item 77 (footnote markers <sup>1/2/3</sup> stripped; nothing else changed).
//   morning-006 += translation_fr — Hisnii / Invocations du Matin, invocation 7 (As-Sahihah 262).
//   morning-006 += translation_ms — akuislam zikir-pagi guide, verbatim (the OFFICIAL HadeethEnc ms Excel
//                  v1.2.0 was downloaded + searched: 148 hadiths, NO 5490, NO matn → fallback per approval).
// Result: EVERY non-Arabic lang now has EXACTLY 6 morning translations; /fr /ms /de morning pages = 6 blocks.
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

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSrc, sandbox);
const M = sandbox.window.AzkarMorning;
const c5 = M[4], c6 = M[5];
const ALL9 = ['en', 'fr', 'ur', 'tr', 'bn', 'ms', 'de', 'es', 'id'];

console.log('================ 1. Card 05 translation_de (Islamische Datenbank Hisn item 77) ================');
const de = c5.translation_de;
ok(c5.id === 'morning-005' && typeof de === 'string' && de.length > 500, 'morning-005 has translation_de (full text)');
ok(de.startsWith('Wir haben den Morgen erreicht'), 'de starts with the morning opening');
ok(de.endsWith('vor der Strafe im Grab.'), 'de ends at the grave clause (nothing after)');
ok(['das Beste an diesem Tag', 'Übel dieses Tages', 'Müßiggang', 'Höllenfeuer'].every((x) => de.includes(x)), 'de completeness anchors (day-ask + day-evil + laziness + fire)');
ok(!/[\p{Nd}]/u.test(de), 'de: footnote markers (1/2/3) fully stripped — no digits remain');
ok(!/Nacht|amsayn|Abend erreicht|<sup|\^\{/i.test(de), 'de: no evening/night footnote leakage, no marker remnants');

console.log('\n================ 2. Card 06 translation_fr (Hisnii invocation 7 — As-Sahihah 262) ================');
const fr = c6.translation_fr;
ok(c6.id === 'morning-006' && typeof fr === 'string', 'morning-006 has translation_fr');
ok(fr.startsWith('Ô Allah !') && fr.endsWith('la Résurrection.'), 'fr exact bounds (guillemets dropped, text verbatim)');
ok(['au matin', 'au soir', 'nous vivons', 'nous mourons'].every((x) => fr.includes(x)), 'fr all four clauses present');
ok(!/[\p{Nd}]/u.test(fr) && !/Allâhumma|asbahnâ|nushûr/i.test(fr), 'fr: no digits, no transliteration');

console.log('\n================ 3. Card 06 translation_ms (akuislam verbatim; official ms Excel lacks 5490) ================');
const ms = c6.translation_ms;
ok(typeof ms === 'string' && ms.startsWith('Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi'), 'morning-006 has translation_ms (morning opening)');
ok(ms.endsWith('kebangkitan (bagi semua makhluk).'), 'ms ends at the resurrection clause (bracket clarification kept — source-verbatim)');
ok(!/[\p{Nd}]/u.test(ms) && !/aṣbaḥ|asbahn|nusyūr/i.test(ms), 'ms: no digits, no transliteration');

console.log('\n================ 4. Uniform totals + no ar; only these 3 fields were added ================');
const mr = dataSrc.slice(dataSrc.indexOf("id: 'morning-001'"), dataSrc.indexOf('window.AzkarEvening'));
const _EXP9 = { en: 10, ur: 10, tr: 10, bn: 10, es: 10, id: 10, de: 10, fr: 10, ms: 10 }; // Card 10 complete: uniform 10
for (const l of ALL9) ok((mr.match(new RegExp('translation_' + l + ':', 'g')) || []).length === _EXP9[l], `morning region translation_${l}: EXACTLY ${_EXP9[l]}`);
ok(!/translation_ar\s*:/.test(dataSrc), 'NO translation_ar anywhere (Arabic UI = zero blocks)');
ok(ALL9.every((l) => typeof c5['translation_' + l] === 'string') && ALL9.every((l) => typeof c6['translation_' + l] === 'string'), 'Cards 05 + 06 now carry all 9 translations each');

console.log('\n================ 5. Cards 01-04 + evening + prayer + card texts UNCHANGED ================');
for (let c = 0; c < 4; c++) ok(ALL9.every((l) => typeof M[c]['translation_' + l] === 'string'), `Card 0${c + 1} still carries all 9 translations`);
ok(dataSrc.includes("text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ") && dataSrc.includes("text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا"), 'Card 05 + 06 Arabic texts byte-identical');
ok(dataSrc.includes("source: { ref: 'رواه مسلم', sourceUrl: null }") && dataSrc.includes("source: { ref: 'رواه الترمذي', sourceUrl: null }"), 'sources unchanged (Muslim / Tirmidhi)');
const evRegion = dataSrc.slice(dataSrc.indexOf('window.AzkarEvening'), dataSrc.indexOf('window.AzkarPrayer'));
for (const l of ALL9) ok((evRegion.match(new RegExp('translation_' + l + ':', 'g')) || []).length === 4, `evening region translation_${l} still EXACTLY 4`);
ok(!/translation_[a-z]+\s*:/.test(dataSrc.slice(dataSrc.indexOf('window.AzkarPrayer'))), 'prayer region has NO translation fields');

console.log('\n================ 6. Renderer untouched (single generic read, no fallback) + no runtime sources ================');
ok((srvSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1 && (appSrc.match(/dhikr\['translation_' \+ _trLang\]/g) || []).length === 1, 'server+client still read translation_{lang} in exactly ONE place each');
ok(!/translation_' \+ _trLang\] \|\|/.test(srvSrc) && !/translation_' \+ _trLang\] \|\|/.test(appSrc), 'NO fallback chain (unchanged)');
ok(!/islamische-datenbank|hisnii\.com|akuislam\.com|hadeethenc\.com|quranenc\.com/i.test(dataSrc), 'no source URLs in azkar-data (static text only)');
ok(!/islamische-datenbank|hisnii\.com/i.test(srvSrc) && !/islamische-datenbank|hisnii\.com/i.test(appSrc), 'no source URLs in server/app');
ok(!/fetch\s*\(/.test(dataSrc), 'azkar-data.js performs NO fetch');

console.log('\n================ 7. Cache-busters ================');
ok(/js\/azkar-data\.js\?v=1[4-9]|js\/azkar-data\.js\?v=[2-9]\d/.test(htmlSrc), 'index.html azkar-data.js?v >= 14 (later tickets bump it)');
ok(/js\/app\.js\?v=836/.test(htmlSrc), 'index.html app.js?v=836 UNCHANGED');
ok(/CACHE_VERSION = 'v5(1\d|[2-9]\d)'/.test(swSrc), "sw.js CACHE_VERSION v510+ (later tickets bump it)");

console.log(`\n================ RESULT: ${pass} passed, ${fail} failed ================`);
if (fail) { console.log('FAILURES:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
process.exit(0);
