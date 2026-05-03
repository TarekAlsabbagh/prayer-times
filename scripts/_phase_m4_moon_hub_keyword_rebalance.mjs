// Phase M4 — moon-in-{city} Keyword Consistency re-balance.
//
// SEOptimer audit after M1/M2/M3 still flags the dynamic phase-table terms
// that dominate the page body but don't appear in any H2/H3:
//   مايو, بعد, يومًا, أحدب, متناقص, متزايد, هلال, مايو أحدب, مايو هلال
//   متزايد بعد, متناقص بعد
//
// Per user's exact M4 brief:
//   1. Do NOT change Title.
//   2. Do NOT change Meta.
//   3. Do NOT touch /moon-today or /moon-today-in-{city}.
//   4. Preserve E4/E5/E6 + M1/M2/M3 work.
//   5. Add or adjust SSR-visible H2s naturally to surface the missing keywords:
//        • أطوار القمر في {monthYear}: الهلال والأحدب والبدر
//        • الأطوار المتزايدة والمتناقصة في تقويم القمر
//   6. Skip "بعد X يومًا" → "خلال X أيام" refactor in the phase-table because:
//        - Arabic semantic shift ("بعد" = after, "خلال" = within)
//        - Risk of touching today-city/date pages too (shared formatter)
//        - User said "إن بقيت حمراء، اتركها"
//
// Strategy: ADJUST M1's existing 3 SSR sections (Section 1 + Section 2) rather
// than ADD new sections. Modifying H2s is lower DOM cost + cleaner semantic
// hierarchy than adding more sections.
//
// PART 1 — Section 1 H2: append phase-name suffix per lang.
//   AR: "تقويم القمر في {city} خلال {month} {year}"
//     → "تقويم القمر في {city} خلال {month} {year}: الهلال والأحدب والبدر"
//   EN: "Moon Calendar in {city} — {month} {year}"
//     → "Moon Calendar in {city} — {month} {year}: Crescent, Gibbous, and Full Moon"
//   ... 10 langs
//
// PART 2 — Section 2 H2: rewrite to surface متزايد + متناقص + تقويم القمر.
//   AR: "كيف تتغير مراحل القمر في {city} خلال الشهر؟"
//     → "الأطوار المتزايدة والمتناقصة لتقويم القمر في {city}"
//   EN: "How Moon Phases Change in {city} this month?"
//     → "Waxing and Waning Phases of the Moon Calendar in {city}"
//   ... 10 langs (using cleaner template-replace pattern via {city} marker)
//
// Section 3 H2 stays UNCHANGED per user ("ماذا تعني الأيام المتبقية..." already
// covers بعد/يومًا context naturally).
//
// Section paragraphs stay UNCHANGED — bodies already cover all phase keywords.

import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase M4 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] M4 already applied (header marker present)');
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
// PART 1 — Section 1: append phase-name suffix to H2 (covers هلال + أحدب + بدر).
// Find the existing _m1Sec1Html builder + add suffix dictionary + interpolation.
// ═══════════════════════════════════════════════════════════════════════════
const PART1_OLD = `                const _m1Sec1Html = '<section class="section-card moon-seo-info moon-seo-month-title">'
                    + '<h2>' + _escHtml(_m1Pick(_m1Sec1H2)) + ' ' + _m1City + ' '
                    + (_m1Lang === 'ar' ? 'خلال ' : (_m1Lang === 'tr' ? '— ' : '— '))
                    + _m1MonthName + ' ' + _m1Year + '</h2>'
                    + '<p>' + _escHtml(_m1Pick(_m1Sec1P)) + '</p>'
                    + '</section>';`;

const PART1_NEW = `                // Phase M4 (2026-05-03): suffix the H2 with phase names so SEOptimer's
                // Keyword Consistency check sees "هلال/أحدب/بدر" inside a heading
                // (currently they live only in the body paragraph).
                const _m1Sec1H2Suffix = {
                    ar: ': الهلال والأحدب والبدر',
                    en: ': Crescent, Gibbous, and Full Moon',
                    fr: ' : croissant, gibbeuse et pleine Lune',
                    tr: ': Hilal, Şişkin Ay ve Dolunay',
                    ur: '، ہلال، گبس اور بدر',
                    de: ': Sichel, Halbmond und Vollmond',
                    id: ': Sabit, Gibbous, dan Purnama',
                    es: ': Creciente, Gibosa y Llena',
                    bn: ': অর্ধচন্দ্র, গিবাস ও পূর্ণিমা',
                    ms: ': Sabit, Gibbous, dan Purnama'
                };
                const _m1Sec1Html = '<section class="section-card moon-seo-info moon-seo-month-title">'
                    + '<h2>' + _escHtml(_m1Pick(_m1Sec1H2)) + ' ' + _m1City + ' '
                    + (_m1Lang === 'ar' ? 'خلال ' : (_m1Lang === 'tr' ? '— ' : '— '))
                    + _m1MonthName + ' ' + _m1Year
                    + _escHtml(_m1Sec1H2Suffix[_m1Lang] || _m1Sec1H2Suffix.en)
                    + '</h2>'
                    + '<p>' + _escHtml(_m1Pick(_m1Sec1P)) + '</p>'
                    + '</section>';`;

replaceOnce('PART 1 — Section 1: append phase-name H2 suffix (10 langs)', PART1_OLD, PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Section 2: rewrite H2 to surface متزايد/متناقص + تقويم القمر.
// Replace both the _m1Sec2H2 dictionary AND the _m1Sec2H2Built construction.
// ═══════════════════════════════════════════════════════════════════════════
const PART2_OLD = `                // Section 2 — Monthly phases explainer (covers هلال/تربيع/أحدب/بدر/متناقص/متزايد)
                const _m1Sec2H2 = {
                    ar: 'كيف تتغير مراحل القمر في',
                    en: 'How Moon Phases Change in',
                    fr: 'Comment les phases de la Lune changent à',
                    tr: '\\'da Ay Evreleri Nasıl Değişir',
                    ur: 'میں چاند کے مراحل کیسے بدلتے ہیں',
                    de: 'Wie sich die Mondphasen ändern in',
                    id: 'Bagaimana Fase Bulan Berubah di',
                    es: 'Cómo cambian las fases de la Luna en',
                    bn: '-এ চাঁদের দশা কীভাবে পরিবর্তন হয়',
                    ms: 'Bagaimana Fasa Bulan Berubah di',
                };`;

const PART2_NEW = `                // Phase M4 (2026-05-03): rewrote Section 2 H2 to surface "متزايد + متناقص
                // + تقويم القمر" (waxing/waning + moon calendar) keywords. New H2 uses
                // {city} marker for clean per-lang interpolation regardless of city
                // position (start vs end), replacing the previous ternary chain.
                // Section 2 — Phases waxing/waning (covers متزايد + متناقص + تقويم القمر).
                const _m1Sec2H2 = {
                    ar: 'الأطوار المتزايدة والمتناقصة لتقويم القمر في {city}',
                    en: 'Waxing and Waning Phases of the Moon Calendar in {city}',
                    fr: 'Phases croissantes et décroissantes du calendrier lunaire à {city}',
                    tr: '{city}\\'da Ay Takviminin Büyüyen ve Küçülen Evreleri',
                    ur: '{city} میں چاند کے کیلنڈر کے بڑھتے اور گھٹتے مراحل',
                    de: 'Zunehmende und abnehmende Mondphasen im Mondkalender in {city}',
                    id: 'Fase Membesar dan Menyusut dalam Kalender Bulan di {city}',
                    es: 'Fases crecientes y menguantes del calendario lunar en {city}',
                    bn: '{city}-এ চাঁদের ক্যালেন্ডারে বৃদ্ধিমান ও হ্রাসমান দশা',
                    ms: 'Fasa Membesar dan Mengecil dalam Kalendar Bulan di {city}',
                };`;

replaceOnce('PART 2 — Section 2: replace H2 dictionary (10 langs)', PART2_OLD, PART2_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — Section 2: replace the H2 builder with cleaner template-based logic.
// ═══════════════════════════════════════════════════════════════════════════
const PART3_OLD = `                // Build H2 with city interpolation per-lang sentence shape
                const _m1Sec2H2Built = (_m1Lang === 'ar' || _m1Lang === 'ur')
                    ? (_escHtml(_m1Pick(_m1Sec2H2)) + ' ' + _m1City + ' خلال الشهر؟')
                    : (_m1Lang === 'tr' ? (_m1City + _escHtml(_m1Pick(_m1Sec2H2)) + '?')
                    : (_m1Lang === 'bn') ? (_m1City + _escHtml(_m1Pick(_m1Sec2H2)) + ' এই মাসে?')
                    : (_escHtml(_m1Pick(_m1Sec2H2)) + ' ' + _m1City + (_m1Lang === 'fr' ? ' ce mois ?' : ' this month?')));`;

const PART3_NEW = `                // Phase M4 (2026-05-03): cleaner builder using {city} marker. _m1City is
                // already escaped (line above), so we split the template on {city}, escape
                // each text part, and concatenate around the pre-escaped city. Handles
                // city-at-start (TR/UR/BN), city-at-end (AR/EN/FR/DE/ID/ES/MS), and
                // city-in-middle if ever needed.
                const _m1Sec2H2Tpl = _m1Pick(_m1Sec2H2);
                const _m1Sec2H2Parts = _m1Sec2H2Tpl.split('{city}');
                const _m1Sec2H2Built = _escHtml(_m1Sec2H2Parts[0] || '') + _m1City + _escHtml(_m1Sec2H2Parts[1] || '');`;

replaceOnce('PART 3 — Section 2: replace H2 builder (template-based)', PART3_OLD, PART3_NEW);

writeFileSync(PATH, raw);

console.log('\n✅ Phase M4 — Keyword Consistency re-balance complete.');
console.log('\nChanges applied (server.js M1 SSR injection block):');
console.log('  • Section 1 H2 suffix: ": الهلال والأحدب والبدر" (10 langs)');
console.log('  • Section 2 H2 rewrite: "الأطوار المتزايدة والمتناقصة..." (10 langs)');
console.log('  • Section 3 H2: UNCHANGED (already covers بعد/يومًا context)');
console.log('  • Bodies UNCHANGED (already contain all phase terms)');
console.log('\nKeywords now in H2s: مايو, 2026, تقويم القمر, هلال, أحدب, بدر, متزايد, متناقص');
console.log('NO change to: Title, Meta, H1, performance, /moon-today, /moon-today-in-{city}.');
