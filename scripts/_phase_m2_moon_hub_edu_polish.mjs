// Phase M2 — moon-in-{city} Hub edu section polish.
//
// Issues reported by user on /moon-in-makkah:
//   1. The H2 of the educational box (`#moon-city-hub-edu`) reads
//      "فهم تقويم القمر في مكة المكرمة" — user prefers the simpler
//      "تقويم القمر في {city}" (drop the "Understanding/فهم/Memahami"
//      prefix in all 10 langs).
//
//   2. The 2nd link inside the edu box is a CROSS-CITY link:
//      "تقويم القمر في الرياض" → /moon-in-riyadh
//      Shown INSIDE the Makkah page. This is bad SEO/UX (a Makkah-themed
//      educational box should not advertise Riyadh in its body links —
//      the dedicated `#moon-other-cities` section already handles cross-
//      city navigation).
//
// This phase fixes both issues — minimum-risk, JS-only changes:
//
//   PART 1: Title — drop the prefix in all 10 langs.
//           AR:  فهم تقويم القمر في {city}  →  تقويم القمر في {city}
//           EN:  Understanding the moon calendar in {city}  →  Moon calendar in {city}
//           FR:  Comprendre le calendrier lunaire à {city}  →  Calendrier lunaire à {city}
//           TR:  {city} ay takvimini anlama  →  {city} ay takvimi
//           UR:  {city} میں چاند کے کیلنڈر کو سمجھنا  →  {city} میں چاند کا کیلنڈر
//           DE:  Den Mondkalender in {city} verstehen  →  Mondkalender in {city}
//           ID:  Memahami kalender bulan di {city}  →  Kalender bulan di {city}
//           ES:  Comprender el calendario lunar en {city}  →  Calendario lunar en {city}
//           BN:  {city}-এ চাঁদের ক্যালেন্ডার বোঝা  →  {city}-এ চাঁদের ক্যালেন্ডার
//           MS:  Memahami kalendar bulan di {city}  →  Kalendar bulan di {city}
//
//   PART 2: Replace `_link2` (the cross-city link) with a same-context
//           link to /moon-today (the global Moon Hub) instead. This:
//           • Keeps Section 1 same-city (no Riyadh on Makkah page)
//           • Doesn't duplicate any link from Section 2 (`#moon-hub-related-links`)
//             which has /moon-today-in-{city}, current/next month, prayer-times,
//             qibla, hijri-date — none of those is /moon-today
//           • Adds 8 more lang labels (currently only ar+en defined,
//             others fall back to en) so each lang sees its own translation.
//
//   PART 3: Remove the now-unused `_altCitySlug` and `_altCityName`
//           computations to keep the code clean (and silence linter warns).
//
// Same code-cleanliness pattern as M1:
//   • CRLF-safe replaceOnce
//   • Phase marker comment
//   • Header marker check (refuses to re-run if marker present)

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\js\\app.js';
let raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase M2 \(2026-05-03\)/.test(raw)) {
    throw new Error('[app.js] M2 already applied (header marker present)');
}

function lfToEol(s) { return isCRLF ? s.replace(/\r?\n/g, '\r\n') : s; }

function replaceOnce(label, oldStr, newStr) {
    const oldNorm = lfToEol(oldStr);
    const newNorm = lfToEol(newStr);
    const cnt = raw.split(oldNorm).length - 1;
    if (cnt !== 1) throw new Error(`[${label}] expected 1 anchor match, got ${cnt}`);
    raw = raw.replace(oldNorm, newNorm);
    console.log(`✓ ${label}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — Title in 10 langs (drop "Understanding/فهم/etc." prefix).
// Each replacement is a single-line precise match (uses unique surrounding
// punctuation/text to ensure 1-and-only-1 match per anchor).
// ═══════════════════════════════════════════════════════════════════════════
const TITLE_REPLACEMENTS = [
    // [oldLine, newLine, label]
    [
        "['.moon-city-hub-edu-title', `فهم تقويم القمر في ${_C}`],",
        "['.moon-city-hub-edu-title', `تقويم القمر في ${_C}`],  // Phase M2 (2026-05-03): drop 'فهم' prefix per user request",
        'PART 1.ar — Title (drop فهم)'
    ],
    [
        "['.moon-city-hub-edu-title', `Understanding the moon calendar in ${_C}`],",
        "['.moon-city-hub-edu-title', `Moon calendar in ${_C}`],  // Phase M2",
        'PART 1.en — Title (drop Understanding)'
    ],
    [
        "['.moon-city-hub-edu-title', `Comprendre le calendrier lunaire à ${_C}`],",
        "['.moon-city-hub-edu-title', `Calendrier lunaire à ${_C}`],  // Phase M2",
        'PART 1.fr — Title (drop Comprendre)'
    ],
    [
        "['.moon-city-hub-edu-title', `${_C} ay takvimini anlama`],",
        "['.moon-city-hub-edu-title', `${_C} ay takvimi`],  // Phase M2",
        'PART 1.tr — Title (drop anlama)'
    ],
    [
        "['.moon-city-hub-edu-title', `${_C} میں چاند کے کیلنڈر کو سمجھنا`],",
        "['.moon-city-hub-edu-title', `${_C} میں چاند کا کیلنڈر`],  // Phase M2",
        'PART 1.ur — Title (drop سمجھنا)'
    ],
    [
        "['.moon-city-hub-edu-title', `Den Mondkalender in ${_C} verstehen`],",
        "['.moon-city-hub-edu-title', `Mondkalender in ${_C}`],  // Phase M2",
        'PART 1.de — Title (drop verstehen)'
    ],
    [
        "['.moon-city-hub-edu-title', `Memahami kalender bulan di ${_C}`],",
        "['.moon-city-hub-edu-title', `Kalender bulan di ${_C}`],  // Phase M2",
        'PART 1.id — Title (drop Memahami)'
    ],
    [
        "['.moon-city-hub-edu-title', `Comprender el calendario lunar en ${_C}`],",
        "['.moon-city-hub-edu-title', `Calendario lunar en ${_C}`],  // Phase M2",
        'PART 1.es — Title (drop Comprender)'
    ],
    [
        "['.moon-city-hub-edu-title', `${_C}-এ চাঁদের ক্যালেন্ডার বোঝা`],",
        "['.moon-city-hub-edu-title', `${_C}-এ চাঁদের ক্যালেন্ডার`],  // Phase M2",
        'PART 1.bn — Title (drop বোঝা)'
    ],
    [
        "['.moon-city-hub-edu-title', `Memahami kalendar bulan di ${_C}`],",
        "['.moon-city-hub-edu-title', `Kalendar bulan di ${_C}`],  // Phase M2",
        'PART 1.ms — Title (drop Memahami)'
    ],
];

for (const [oldStr, newStr, label] of TITLE_REPLACEMENTS) {
    replaceOnce(label, oldStr, newStr);
}

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Replace _link2 logic:
//   • Drop _altCitySlug + _altCityName computations
//   • Replace _eduLinkLabels (currently ar+en only) with 10-lang map
//     where _link2 is now "تقويم القمر اليوم" (or local equivalent)
//   • Change _link2 href from `/moon-in-{altSlug}` to `/moon-today`
// ═══════════════════════════════════════════════════════════════════════════
const PART2_OLD = `                // UAT-Moon-City-Hub-Polish: 3 internal cross-links at end of edu section
                //   • "حالة القمر اليوم في {city}" → /moon-today-in-{slug}
                //   • "تقويم القمر في {alt-city}"  → /moon-in-{alt-slug}  (sample sister)
                //   • "التاريخ الهجري اليوم"        → /today-hijri-date
                // Sister-city: pick a popular AR city different from current. Default
                //   "riyadh"; if current IS riyadh, pick "makkah" instead.
                const _altCitySlug = (_citySlug === 'riyadh') ? 'makkah' : 'riyadh';
                const _altCityName = (typeof _moonCityDisplayName === 'function')
                    ? _moonCityDisplayName(_altCitySlug)
                    : (_altCitySlug === 'makkah' ? (_lng_ === 'ar' ? 'مكة المكرمة' : 'Makkah') : (_lng_ === 'ar' ? 'الرياض' : 'Riyadh'));
                const _langPrefixEdu = (_lng_ === 'ar') ? '' : ('/' + _lng_);
                const _eduLinkLabels = {
                    ar: [
                        \`حالة القمر اليوم في \${_C}\`,
                        \`تقويم القمر في \${_altCityName}\`,
                        'التاريخ الهجريّ اليوم'
                    ],
                    en: [
                        \`Moon status today in \${_C}\`,
                        \`Moon calendar in \${_altCityName}\`,
                        "Today's Hijri date"
                    ]
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
                    _link2.setAttribute('href', _langPrefixEdu + '/moon-in-' + _altCitySlug);
                }
                if (_link3) {
                    _link3.textContent = _eduLinks[2];
                    _link3.setAttribute('href', _langPrefixEdu + '/today-hijri-date');
                }`;

const PART2_NEW = `                // Phase M2 (2026-05-03): 3 internal cross-links at end of edu section.
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

replaceOnce('PART 2 — Replace _link2 (cross-city → /moon-today) + 10-lang labels', PART2_OLD, PART2_NEW);

writeFileSync(PATH, raw);

console.log('\n✅ Phase M2 — moon Hub edu polish complete.');
console.log('\nChanges applied:');
console.log('  • Title in 10 langs: dropped "فهم/Understanding/etc." prefix');
console.log('  • _link2: cross-city link → /moon-today (10-lang labels)');
console.log('  • Removed unused _altCitySlug + _altCityName computations');
console.log('\nNo Riyadh-link inside Makkah page anymore. Cross-city nav stays in');
console.log('the dedicated #moon-other-cities section (out of edu scope).');
