// Phase MM1 — moon-in-{city}/{YYYY-MM} Title extension.
//
// SEOptimer audit on /moon-in-makkah/2026-05:
//   • On-Page SEO grade: A+ — only ONE issue:
//     Title length is 39 chars: "تقويم القمر في مكة المكرمة | مايو 2026"
//     SEOptimer wants 50-60 chars sweet spot.
//   • Meta length is fine (passing).
//   • H1, content, structure all good.
//   • Performance is 74 (LCP/TBT/CLS already good — Speed Index is the dip,
//     not a blocker for SEO). Out of MM1 scope.
//
// Per user spec:
//   1. Update Title template for /moon-in-{city}/{YYYY-MM} ONLY.
//   2. Do NOT touch Hub /moon-in-{city}.
//   3. Do NOT touch /moon-today, /moon-today-in-{city}, date pages.
//   4. Do NOT touch Meta (passing).
//   5. Do NOT touch H1 (single, accurate).
//   6. Do NOT touch Keyword Consistency (not flagged here).
//   7. Apply to 10 langs.
//
// Templates (per user):
//   AR: "تقويم القمر في {city} لشهر {month} {year} ومراحل القمر"
//   EN: "Moon Calendar in {city} for {month} {year} and Moon Phases"
//   FR: "Calendrier lunaire à {city} pour {month} {year} et phases lunaires"
//   ... 10 langs total
//
// Char count for Makkah AR: "تقويم القمر في مكة المكرمة لشهر مايو 2026 ومراحل القمر"
//   ~54 chars ✅ (in SEOptimer's 50-60 sweet spot)
// Char count for Riyadh AR: "تقويم القمر في الرياض لشهر مايو 2026 ومراحل القمر"
//   ~49 chars (borderline — still much better than 39, well above the
//   SEOptimer red threshold of ~30)
//
// Same pattern as M1's Hub Title:
//   • CRLF-safe replaceOnce
//   • Phase marker comment
//   • Header marker check (refuses to re-run)
//   • Gated by `if (_isMoonMonthPage)` block (server.js:4845)

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase MM1 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] MM1 already applied (header marker present)');
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
// Replace Month-page _moonTitle 10-lang block (server.js:4847-4858).
// Old format: "{calendar prefix} {city} | {month} {year}"  → 39 chars (Makkah)
// New format: "{calendar prefix} {city} for {month} {year} and {phases suffix}"
//             → ~50-55 chars depending on city name length.
// ═══════════════════════════════════════════════════════════════════════════
const MM1_OLD = `                // ── UAT-Moon-Hub-Month: صفحة الشهر — مثل hub لكن مخصَّصة لشهر محدَّد ──
                _moonTitle = {
                    ar: \`تقويم القمر في \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                    en: \`Moon Calendar in \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                    fr: \`Calendrier lunaire à \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                    tr: \`\${cityDisplay} Ay Takvimi | \${_mNameT} \${_mYearT}\`,
                    ur: \`\${cityDisplay} چاند کیلنڈر | \${_mNameT} \${_mYearT}\`,
                    de: \`Mondkalender \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                    id: \`Kalender Bulan \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                    es: \`Calendario lunar en \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                    bn: \`\${cityDisplay} চাঁদের ক্যালেন্ডার | \${_mNameT} \${_mYearT}\`,
                    ms: \`Kalendar Bulan \${cityDisplay} | \${_mNameT} \${_mYearT}\`,
                };`;

const MM1_NEW = `                // ── UAT-Moon-Hub-Month: صفحة الشهر — مثل hub لكن مخصَّصة لشهر محدَّد ──
                // Phase MM1 (2026-05-03): extended Title from "...{city} | {month} {year}"
                // (~39 chars) to "...{city} for {month} {year} and Moon Phases" (~50-55
                // chars) so SEOptimer's "Title too short" warning flips green. Prior
                // format was a pipe-separated tag-line; new format is a natural-language
                // sentence that explicitly mentions "moon phases" / "مراحل القمر" — a
                // legitimate keyword for this page (not stuffing).
                _moonTitle = {
                    ar: \`تقويم القمر في \${cityDisplay} لشهر \${_mNameT} \${_mYearT} ومراحل القمر\`,
                    en: \`Moon Calendar in \${cityDisplay} for \${_mNameT} \${_mYearT} and Moon Phases\`,
                    fr: \`Calendrier lunaire à \${cityDisplay} pour \${_mNameT} \${_mYearT} et phases lunaires\`,
                    tr: \`\${cityDisplay} Ay Takvimi: \${_mNameT} \${_mYearT} ve Ay Evreleri\`,
                    ur: \`\${cityDisplay} چاند کیلنڈر: \${_mNameT} \${_mYearT} اور چاند کے مراحل\`,
                    de: \`Mondkalender in \${cityDisplay} für \${_mNameT} \${_mYearT} und Mondphasen\`,
                    id: \`Kalender Bulan \${cityDisplay} untuk \${_mNameT} \${_mYearT} dan Fase Bulan\`,
                    es: \`Calendario lunar en \${cityDisplay} para \${_mNameT} \${_mYearT} y fases de la Luna\`,
                    bn: \`\${cityDisplay}-এ \${_mNameT} \${_mYearT} এর চাঁদের ক্যালেন্ডার ও দশা\`,
                    ms: \`Kalendar Bulan \${cityDisplay} untuk \${_mNameT} \${_mYearT} dan Fasa Bulan\`,
                };`;

replaceOnce('MM1 — Month Title 10-lang extension', MM1_OLD, MM1_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase MM1 — Month Title extension complete.');
console.log('\nChanges applied:');
console.log('  • /moon-in-{city}/{YYYY-MM} Title extended in 10 langs (~39 → ~50-55 chars)');
console.log('  • Format: "tag-line" → natural sentence ending with "ومراحل القمر" / "and Moon Phases"');
console.log('\nNo change to: Hub Title, Today titles, Date titles, Meta, H1, perf,');
console.log('  M1-M6 SEO sections, calendar table.');
