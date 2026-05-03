// Phase MD1 — moon-in-{city}/{YYYY-MM-DD} (Date page) Title extension.
//
// SEOptimer audit on /moon-in-makkah/2026-06-16 (AR):
//   • Performance 75, Accessibility 100, Best Practices 100, SEO 100
//   • Keyword Consistency: ✅
//   • Title Tag: ❌ — only 41 chars
//     "حالة القمر في مكة المكرمة | 16 يونيو 2026"
//   • Need to extend to 50-60 chars sweet spot.
//
// Per user spec:
//   1. Update Title template for /moon-in-{city}/{YYYY-MM-DD} ONLY.
//   2. Do NOT touch Hub /moon-in-{city}.
//   3. Do NOT touch Month /moon-in-{city}/{YYYY-MM}.
//   4. Do NOT touch /moon-today, /moon-today-in-{city}.
//   5. Do NOT change Meta (passing).
//   6. Do NOT change H1.
//   7. Do NOT touch Keyword Consistency (passing).
//   8. Apply to 10 langs.
//
// Templates (per user):
//   AR: "حالة القمر في {city} يوم {date} وطور القمر"
//   EN: "Moon Phase in {city} on {date} and Lunar Details"
//   ... 10 langs total
//
// Word "وطور القمر" / "and Lunar Details" / etc. is contextually appropriate
// for a Date page (single day's moon status) — NOT "phases plural" which
// belongs to the Month page (MM1's "ومراحل القمر").
//
// Char count for Makkah AR:
//   "حالة القمر في مكة المكرمة يوم 16 يونيو 2026 وطور القمر" → ~51 chars ✅
//
// Same pattern as M1 (Hub Title) + MM1 (Month Title):
//   • CRLF-safe replaceOnce
//   • Phase marker comment
//   • Header marker check (refuses to re-run)
//   • Gated by `else if (_moonDateIso && _moonDateInRange)` block (server.js:4914)

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase MD1 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] MD1 already applied (header marker present)');
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
// Replace Date-page _moonTitle 10-lang block (server.js:4916-4927).
// Old: "{prefix} {city} | {date}"          → ~41 chars (Makkah)
// New: "{prefix} {city} {prep} {date} {phase suffix}"  → ~50-55 chars
// ═══════════════════════════════════════════════════════════════════════════
const MD1_OLD = `            } else if (_moonDateIso && _moonDateInRange) {
                // ── عناوين خاصّة بصفحة التاريخ ── (التاريخ الأساسيّ + الموافق بين قوسين)
                _moonTitle = {
                    ar: \`حالة القمر في \${cityDisplay} | \${_primaryDateLabel}\`,
                    en: \`Moon in \${cityDisplay} | \${_primaryDateLabel}\`,
                    fr: \`La Lune à \${cityDisplay} | \${_primaryDateLabel}\`,
                    tr: \`\${cityDisplay} Ay | \${_primaryDateLabel}\`,
                    ur: \`\${cityDisplay} میں چاند | \${_primaryDateLabel}\`,
                    de: \`Mond in \${cityDisplay} | \${_primaryDateLabel}\`,
                    id: \`Bulan di \${cityDisplay} | \${_primaryDateLabel}\`,
                    es: \`Luna en \${cityDisplay} | \${_primaryDateLabel}\`,
                    bn: \`\${cityDisplay}-এ চাঁদ | \${_primaryDateLabel}\`,
                    ms: \`Bulan di \${cityDisplay} | \${_primaryDateLabel}\`,
                };`;

const MD1_NEW = `            } else if (_moonDateIso && _moonDateInRange) {
                // ── عناوين خاصّة بصفحة التاريخ ── (التاريخ الأساسيّ + الموافق بين قوسين)
                // Phase MD1 (2026-05-03): extended Title from "...{city} | {date}" (~41
                // chars) to "...{city} {prep} {date} {single-day phase suffix}" (~50-55
                // chars) so SEOptimer's "Title too short" warning flips green. Suffix
                // wording is single-day specific ("وطور القمر" / "and Lunar Details" /
                // etc.) — NOT plural "phases" (which belongs to Month page MM1).
                _moonTitle = {
                    ar: \`حالة القمر في \${cityDisplay} يوم \${_primaryDateLabel} وطور القمر\`,
                    en: \`Moon Phase in \${cityDisplay} on \${_primaryDateLabel} and Lunar Details\`,
                    fr: \`Phase de la Lune à \${cityDisplay} le \${_primaryDateLabel} et détails lunaires\`,
                    tr: \`\${cityDisplay} Ay Evresi: \${_primaryDateLabel} ve Ay Detayları\`,
                    ur: \`\${cityDisplay} میں چاند کا طور: \${_primaryDateLabel} اور تفصیلات\`,
                    de: \`Mondphase in \${cityDisplay} am \${_primaryDateLabel} und Monddetails\`,
                    id: \`Fase Bulan di \${cityDisplay} pada \${_primaryDateLabel} dan Detail Bulan\`,
                    es: \`Fase de la Luna en \${cityDisplay} el \${_primaryDateLabel} y detalles lunares\`,
                    bn: \`\${cityDisplay}-এ \${_primaryDateLabel} তারিখে চাঁদের দশা ও বিবরণ\`,
                    ms: \`Fasa Bulan di \${cityDisplay} pada \${_primaryDateLabel} dan Butiran Bulan\`,
                };`;

replaceOnce('MD1 — Date Title 10-lang extension', MD1_OLD, MD1_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase MD1 — Date Title extension complete.');
console.log('\nChanges applied:');
console.log('  • /moon-in-{city}/{YYYY-MM-DD} Title extended in 10 langs (~41 → ~50-55 chars)');
console.log('  • Format: "{prefix} {city} | {date}" → "{prefix} {city} {prep} {date} {single-day suffix}"');
console.log('  • Suffix: "وطور القمر" / "and Lunar Details" / etc. (single-day specific)');
console.log('\nNo change to: Hub Title, Month Title (MM1), Today titles, Meta, H1,');
console.log('  Performance, M1-M6 SEO sections, calendar table, Keyword Consistency.');
