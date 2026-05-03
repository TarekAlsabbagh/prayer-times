// Phase M3 — moon-in-{city} Hub edu section polish (round 2).
//
// Two small remaining tweaks per user feedback after M2:
//
//   1. The label above the 3 cross-links inside #moon-city-hub-edu currently
//      reads "🔗 روابط ذات صلة" (set by CSS ::before in style.css). User says
//      this overlaps semantically with Section 2's H2 "روابط مهمّة عن القمر
//      في {city}", creating perceived redundancy. Rename to "أدوات مرتبطة"
//      (Related tools) which positions Section 1 as utility shortcuts and
//      Section 2 as the main link gallery — clearer functional split.
//
//   2. M2 set _link2 to /moon-today (global Hub). User prefers the more
//      specific "تقويم القمر لشهر {month} {year}" → /moon-in-{city}/{YYYY-MM}
//      (current month in same city). Keeps everything same-city while still
//      offering useful internal navigation.
//
// Files affected:
//   • css/style.css — 10-lang ::before labels
//   • js/app.js — _eduLinkLabels (10 langs) + _link2 href + month computation
//   • css/critical.css — auto-regenerated (in case .moon-city-hub-edu-links is whitelisted)
//   • index.html — bump style.css?v=245→246 + app.js?v=593→594 (cache-bust)
//
// All same-pattern as prior phases:
//   • CRLF-safe replaceOnce
//   • Phase marker comment
//   • Header marker check (refuses to re-run)

import { readFileSync, writeFileSync } from 'node:fs';

const CSS_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\css\\style.css';
const APP_PATH  = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js\\app.js';
const HTML_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\index.html';

let cssRaw  = readFileSync(CSS_PATH, 'utf8');
let appRaw  = readFileSync(APP_PATH, 'utf8');
let htmlRaw = readFileSync(HTML_PATH, 'utf8');

const isCRLFcss  = /\r\n/.test(cssRaw);
const isCRLFapp  = /\r\n/.test(appRaw);
const isCRLFhtml = /\r\n/.test(htmlRaw);

if (/Phase M3 \(2026-05-03\)/.test(appRaw)) {
    throw new Error('[app.js] M3 already applied (header marker present)');
}

function lfToEol(s, isCRLF) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function makeReplacer(getRaw, setRaw, isCRLF) {
    return function replaceOnce(label, oldStr, newStr) {
        const oldNorm = lfToEol(oldStr, isCRLF);
        const newNorm = lfToEol(newStr, isCRLF);
        const raw = getRaw();
        const cnt = raw.split(oldNorm).length - 1;
        if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
        setRaw(raw.replace(oldNorm, newNorm));
        console.log(`✓ ${label}`);
    };
}

const replaceCss  = makeReplacer(() => cssRaw,  v => cssRaw  = v, isCRLFcss);
const replaceApp  = makeReplacer(() => appRaw,  v => appRaw  = v, isCRLFapp);
const replaceHtml = makeReplacer(() => htmlRaw, v => htmlRaw = v, isCRLFhtml);

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — CSS pseudo-element label rename (10 langs).
// ═══════════════════════════════════════════════════════════════════════════
const CSS_PART1_OLD = `.moon-city-hub-edu-links::before {
    content: "🔗 روابط ذات صلة";
    position: absolute;
    top: -12px;
    inset-inline-start: 12px;
    background: var(--card-bg, #ffffff);
    padding: 0 10px;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--primary, #2e7d32);
    letter-spacing: 0.2px;
}
html[lang="en"] .moon-city-hub-edu-links::before { content: "🔗 Related links"; }
html[lang="fr"] .moon-city-hub-edu-links::before { content: "🔗 Liens associés"; }
html[lang="tr"] .moon-city-hub-edu-links::before { content: "🔗 İlgili bağlantılar"; }
html[lang="ur"] .moon-city-hub-edu-links::before { content: "🔗 متعلقہ روابط"; }
html[lang="de"] .moon-city-hub-edu-links::before { content: "🔗 Verwandte Links"; }
html[lang="id"] .moon-city-hub-edu-links::before { content: "🔗 Tautan terkait"; }
html[lang="es"] .moon-city-hub-edu-links::before { content: "🔗 Enlaces relacionados"; }
html[lang="bn"] .moon-city-hub-edu-links::before { content: "🔗 সম্পর্কিত লিঙ্ক"; }
html[lang="ms"] .moon-city-hub-edu-links::before { content: "🔗 Pautan berkaitan"; }`;

const CSS_PART1_NEW = `/* Phase M3 (2026-05-03): renamed from "روابط ذات صلة" → "أدوات مرتبطة" so
   Section 1 (utility shortcuts) doesn't semantically overlap with Section 2's
   H2 "روابط مهمّة عن القمر في {city}" (the main related-links gallery). */
.moon-city-hub-edu-links::before {
    content: "🔗 أدوات مرتبطة";
    position: absolute;
    top: -12px;
    inset-inline-start: 12px;
    background: var(--card-bg, #ffffff);
    padding: 0 10px;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--primary, #2e7d32);
    letter-spacing: 0.2px;
}
html[lang="en"] .moon-city-hub-edu-links::before { content: "🔗 Related tools"; }
html[lang="fr"] .moon-city-hub-edu-links::before { content: "🔗 Outils associés"; }
html[lang="tr"] .moon-city-hub-edu-links::before { content: "🔗 İlgili araçlar"; }
html[lang="ur"] .moon-city-hub-edu-links::before { content: "🔗 متعلقہ ٹولز"; }
html[lang="de"] .moon-city-hub-edu-links::before { content: "🔗 Verwandte Tools"; }
html[lang="id"] .moon-city-hub-edu-links::before { content: "🔗 Alat terkait"; }
html[lang="es"] .moon-city-hub-edu-links::before { content: "🔗 Herramientas relacionadas"; }
html[lang="bn"] .moon-city-hub-edu-links::before { content: "🔗 সম্পর্কিত সরঞ্জাম"; }
html[lang="ms"] .moon-city-hub-edu-links::before { content: "🔗 Alat berkaitan"; }`;

replaceCss('PART 1 — CSS ::before label rename (10 langs)', CSS_PART1_OLD, CSS_PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — JS: replace M2's _link2 logic with month-aware variant.
// Match the M2 block exactly (which already has 10-lang labels + /moon-today).
// ═══════════════════════════════════════════════════════════════════════════
const APP_PART2_OLD = `                // Phase M2 (2026-05-03): 3 internal cross-links at end of edu section.
                //   • _link1: "حالة القمر اليوم في {city}" → /moon-today-in-{slug}      (same-city)
                //   • _link2: "تقويم القمر اليوم"           → /moon-today                 (global moon Hub)
                //   • _link3: "التاريخ الهجري اليوم"        → /today-hijri-date           (generic)
                //
                // Was: _link2 was a cross-city sister link ("تقويم القمر في الرياض" on
                //   Makkah's page) which is bad SEO/UX. Cross-city navigation is now
                //   handled exclusively by the #moon-other-cities section.
                //
                // Was: _eduLinkLabels only had ar+en (8 langs fell back to en). Now
                //   all 10 langs have native labels.
                const _langPrefixEdu = (_lng_ === 'ar') ? '' : ('/' + _lng_);
                const _eduLinkLabels = {
                    ar: [\`حالة القمر اليوم في \${_C}\`, 'تقويم القمر اليوم', 'التاريخ الهجريّ اليوم'],
                    en: [\`Moon status today in \${_C}\`, "Today's moon calendar", "Today's Hijri date"],
                    fr: [\`État de la Lune aujourd'hui à \${_C}\`, 'Calendrier lunaire du jour', "Date hégirienne d'aujourd'hui"],
                    tr: [\`\${_C}'de bugünkü ay durumu\`, 'Bugünün ay takvimi', 'Bugünün hicri tarihi'],
                    ur: [\`\${_C} میں آج چاند کی حالت\`, 'آج کا چاند کیلنڈر', 'آج کی ہجری تاریخ'],
                    de: [\`Mondstatus heute in \${_C}\`, 'Heutiger Mondkalender', 'Heutiges Hidschri-Datum'],
                    id: [\`Status Bulan hari ini di \${_C}\`, 'Kalender Bulan hari ini', 'Tanggal Hijriah hari ini'],
                    es: [\`Estado de la Luna hoy en \${_C}\`, 'Calendario lunar de hoy', 'Fecha hégira de hoy'],
                    bn: [\`\${_C}-এ আজকের চাঁদের অবস্থা\`, 'আজকের চাঁদের ক্যালেন্ডার', 'আজকের হিজরি তারিখ'],
                    ms: [\`Status Bulan hari ini di \${_C}\`, 'Kalendar Bulan hari ini', 'Tarikh Hijrah hari ini']
                };
                const _eduLinks = _eduLinkLabels[_lng_] || _eduLinkLabels.en;
                const _link1 = document.querySelector('.moon-city-hub-edu-link-today');
                const _link2 = document.querySelector('.moon-city-hub-edu-link-other');
                const _link3 = document.querySelector('.moon-city-hub-edu-link-hijri');
                if (_link1) {
                    _link1.textContent = _eduLinks[0];
                    _link1.setAttribute('href', _langPrefixEdu + '/moon-today-in-' + _citySlug);
                }
                if (_link2) {
                    _link2.textContent = _eduLinks[1];
                    _link2.setAttribute('href', _langPrefixEdu + '/moon-today');
                }
                if (_link3) {
                    _link3.textContent = _eduLinks[2];
                    _link3.setAttribute('href', _langPrefixEdu + '/today-hijri-date');
                }`;

const APP_PART2_NEW = `                // Phase M3 (2026-05-03): refined _link2 (was Phase M2 — generic /moon-today,
                //   user prefers same-city current-month link).
                //   • _link1: "حالة القمر اليوم في {city}" → /moon-today-in-{slug}             (same-city)
                //   • _link2: "تقويم القمر لشهر {month} {year}" → /moon-in-{slug}/{YYYY-MM}    (same-city, current month)
                //   • _link3: "التاريخ الهجري اليوم"          → /today-hijri-date                (generic)
                const _langPrefixEdu = (_lng_ === 'ar') ? '' : ('/' + _lng_);
                // Compute current month (browser-local — fine for an educational box).
                const _eduNow = new Date();
                const _eduMonthIdx0 = _eduNow.getMonth();           // 0-11
                const _eduYear = _eduNow.getFullYear();
                const _eduMonthIso = _eduYear + '-' + String(_eduMonthIdx0 + 1).padStart(2, '0');
                const _EDU_MONTHS_BY_LANG = {
                    ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
                    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
                    fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
                    tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
                    ur: ['جنوری','فروری','مارچ','اپریل','مئی','جون','جولائی','اگست','ستمبر','اکتوبر','نومبر','دسمبر'],
                    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
                    id: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
                    bn: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
                    ms: ['Januari','Februari','Mac','April','Mei','Jun','Julai','Ogos','September','Oktober','November','Disember']
                };
                const _eduMonthName = (_EDU_MONTHS_BY_LANG[_lng_] || _EDU_MONTHS_BY_LANG.en)[_eduMonthIdx0];
                const _eduMonthLabelByLang = {
                    ar: \`تقويم القمر لشهر \${_eduMonthName} \${_eduYear}\`,
                    en: \`Moon calendar for \${_eduMonthName} \${_eduYear}\`,
                    fr: \`Calendrier lunaire pour \${_eduMonthName} \${_eduYear}\`,
                    tr: \`\${_eduMonthName} \${_eduYear} ay takvimi\`,
                    ur: \`\${_eduMonthName} \${_eduYear} کا چاند کیلنڈر\`,
                    de: \`Mondkalender für \${_eduMonthName} \${_eduYear}\`,
                    id: \`Kalender Bulan untuk \${_eduMonthName} \${_eduYear}\`,
                    es: \`Calendario lunar para \${_eduMonthName} \${_eduYear}\`,
                    bn: \`\${_eduMonthName} \${_eduYear} এর চাঁদের ক্যালেন্ডার\`,
                    ms: \`Kalendar Bulan untuk \${_eduMonthName} \${_eduYear}\`
                };
                const _eduMonthLabel = _eduMonthLabelByLang[_lng_] || _eduMonthLabelByLang.en;
                const _eduLinkLabels = {
                    ar: [\`حالة القمر اليوم في \${_C}\`, _eduMonthLabel, 'التاريخ الهجريّ اليوم'],
                    en: [\`Moon status today in \${_C}\`, _eduMonthLabel, "Today's Hijri date"],
                    fr: [\`État de la Lune aujourd'hui à \${_C}\`, _eduMonthLabel, "Date hégirienne d'aujourd'hui"],
                    tr: [\`\${_C}'de bugünkü ay durumu\`, _eduMonthLabel, 'Bugünün hicri tarihi'],
                    ur: [\`\${_C} میں آج چاند کی حالت\`, _eduMonthLabel, 'آج کی ہجری تاریخ'],
                    de: [\`Mondstatus heute in \${_C}\`, _eduMonthLabel, 'Heutiges Hidschri-Datum'],
                    id: [\`Status Bulan hari ini di \${_C}\`, _eduMonthLabel, 'Tanggal Hijriah hari ini'],
                    es: [\`Estado de la Luna hoy en \${_C}\`, _eduMonthLabel, 'Fecha hégira de hoy'],
                    bn: [\`\${_C}-এ আজকের চাঁদের অবস্থা\`, _eduMonthLabel, 'আজকের হিজরি তারিখ'],
                    ms: [\`Status Bulan hari ini di \${_C}\`, _eduMonthLabel, 'Tarikh Hijrah hari ini']
                };
                const _eduLinks = _eduLinkLabels[_lng_] || _eduLinkLabels.en;
                const _link1 = document.querySelector('.moon-city-hub-edu-link-today');
                const _link2 = document.querySelector('.moon-city-hub-edu-link-other');
                const _link3 = document.querySelector('.moon-city-hub-edu-link-hijri');
                if (_link1) {
                    _link1.textContent = _eduLinks[0];
                    _link1.setAttribute('href', _langPrefixEdu + '/moon-today-in-' + _citySlug);
                }
                if (_link2) {
                    _link2.textContent = _eduLinks[1];
                    _link2.setAttribute('href', _langPrefixEdu + '/moon-in-' + _citySlug + '/' + _eduMonthIso);
                }
                if (_link3) {
                    _link3.textContent = _eduLinks[2];
                    _link3.setAttribute('href', _langPrefixEdu + '/today-hijri-date');
                }`;

replaceApp('PART 2 — JS: _link2 → current-month same-city link (10 langs)', APP_PART2_OLD, APP_PART2_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — Bump cache versions in index.html.
// ═══════════════════════════════════════════════════════════════════════════
// style.css?v=245 → v=246 (we changed CSS)
// app.js?v=593   → v=594 (we changed JS)
// Each appears 2× (preload + actual link/script tag).
const CSS_VER_OLD = 'style.css?v=245';
const CSS_VER_NEW = 'style.css?v=246';
const APP_VER_OLD = 'app.js?v=593';
const APP_VER_NEW = 'app.js?v=594';

// We use simple split/replace because there are 2 occurrences each (preload + tag)
function replaceAllInHtml(label, oldStr, newStr, expectCount) {
    const cnt = htmlRaw.split(oldStr).length - 1;
    if (cnt !== expectCount) throw new Error(`[${label}] expected ${expectCount} matches, got ${cnt}`);
    htmlRaw = htmlRaw.split(oldStr).join(newStr);
    console.log(`✓ ${label} (replaced ${cnt} occurrences)`);
}

replaceAllInHtml('PART 3 — Bump style.css cache version', CSS_VER_OLD, CSS_VER_NEW, 2);
replaceAllInHtml('PART 3 — Bump app.js cache version',   APP_VER_OLD, APP_VER_NEW, 2);

writeFileSync(CSS_PATH,  cssRaw);
writeFileSync(APP_PATH,  appRaw);
writeFileSync(HTML_PATH, htmlRaw);

console.log('\n✅ Phase M3 — Hub edu polish round 2 complete.');
console.log('\nChanges applied:');
console.log('  • CSS: "روابط ذات صلة" → "أدوات مرتبطة" (10 langs)');
console.log('  • JS:  _link2 → /moon-in-{city}/{YYYY-MM} with "تقويم القمر لشهر {month} {year}"');
console.log('  • HTML: bumped style.css?v=245→246 + app.js?v=593→594');
console.log('\nNext: run `node scripts/_phase_e5_a2_critical_css.mjs` to refresh');
console.log('the inline critical CSS so the new ::before label appears immediately.');
