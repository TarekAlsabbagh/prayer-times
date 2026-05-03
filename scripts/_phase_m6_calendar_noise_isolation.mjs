// Phase M6 — Moon Hub Calendar Noise Isolation.
//
// User's brief: the calendar grid is functionally useful but its repeated
// per-cell text pollutes Keyword Distribution. Each of ~30 cells contains:
//   • Relative-time phrase ("خلال 5 أيّام", "قبل 3 أيّام", etc.) — even
//     after M5-b's "بعد→خلال" rewrite, "خلال" + "أيّام" + "يومًا" still
//     occur ~25× per page combined
//   • Date-with-month ("15 ماي") — month name "ماي" duplicated ~30×
//   • Phase name ("أحدب متناقص") — phase keywords ~14× each (user did NOT
//     ask to drop these — keep for UX value)
//
// The user explicitly does NOT want to hide the calendar — they want the
// repetitive text REMOVED from each cell, with the contextual info shown
// ONCE above the table.
//
// Solution per user spec:
//   1. Drop month name from each cell ("15 ماي" → "15"). Month already
//      appears in the H2 above the calendar.
//   3. Replace per-cell relative-time phrase with a signed-delta indicator:
//        offset 0  → "اليوم" (kept — 1 occurrence)
//        offset -1 → "أمس"   (kept — 1 occurrence)
//        offset 1  → "غدًا"  (kept — 1 occurrence)
//        offset >1 → "+5", "+12" (universal — no language repetition)
//        offset <-1 → "-3", "-15" (negative number renders with "−"-like sign)
//      Plus: a single legend ABOVE the calendar explains "+/−" semantics.
//   4. Keep SEO sections (M1-M5) unchanged.
//
// Cleanup (per user's "نظافة الكود" emphasis):
//   • The _hubCalDaysFmt formatter (modified in M5-b) was the producer of
//     the per-cell relative-time phrase. After M6, the formatter is dead
//     code — its only caller (_calDaysFn at line 9036) is removed.
//   • Remove formatter (lines 8862-8887) + _calDaysFn assignment (8913).
//   • Net code reduction: ~28 lines.
//
// Blast radius:
//   `_isMoonHubPageSsr` gate (line 8833) → only Hub + Month pages affected.
//   /moon-today, today-city, date pages: NOT affected (no calendar SSR).
//
// Expected SEO impact (AR baseline /moon-in-makkah):
//   • "خلال" (38× post-M5-b) → ~0× from calendar (massive reduction)
//   • "ماي" (~30× from cells) → 0× from cells (only in H2 once now)
//   • "يومًا" (~10× from cells with offset 11+) → ~0×
//   • "أيّام" (~14× from cells with offset 3-10) → ~0×
//   • "اليوم"/"أمس"/"غدًا" (1 each) → unchanged
//   Phase names ("أحدب", "متناقص", "هلال") preserved per user's scope.

import { readFileSync, writeFileSync } from 'node:fs';

const SRV_PATH = 'C:\\Users\\Tarek\\Downloads\\TIME PRAYER\\server.js';
let raw = readFileSync(SRV_PATH, 'utf8');
const isCRLF = /\r\n/.test(raw);
const EOL = isCRLF ? '\r\n' : '\n';

if (/Phase M6 \(2026-05-03\)/.test(raw)) {
    throw new Error('[server.js] M6 already applied (header marker present)');
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
// PART 1 — Remove the dead _hubCalDaysFmt formatter (M5-b's rewrite).
// After M6 the per-cell label uses signed-delta numerics instead of the
// formatter's natural-language output. The formatter has only one caller
// (line 9036) which is also removed below.
// ═══════════════════════════════════════════════════════════════════════════
const PART1_OLD = `                // Arabic plural ruleset for relative-day labels:
                //   1 → "يوم" (singular)
                //   2 → "يومين" (dual)
                //   3-10 → "{n} أيّام" (sound plural)
                //   11+ → "{n} يومًا" (singular accusative for tamyiz)
                // Phase M5-b (2026-05-03): future cells use "خلال {n}" instead of
                // "بعد {n}" to reduce SEOptimer Keyword Consistency noise (the word
                // "بعد" was repeated ~14× per Hub page across calendar future cells +
                // upcoming-phases summaries). "قبل {n}" for past UNCHANGED — there's
                // no equivalent reduction path for past cells.
                const _hubCalDaysFmt = {
                    ar: (n) => {
                        const _abs = Math.abs(n);
                        let _unit;
                        if (_abs === 1)               _unit = 'يوم';
                        else if (_abs === 2)          _unit = 'يومين';
                        else if (_abs >= 3 && _abs <= 10) _unit = \`\${_abs} أيّام\`;
                        else                          _unit = \`\${_abs} يومًا\`;
                        return n > 0 ? \`خلال \${_unit}\` : \`قبل \${_unit}\`;
                    },
                    en: (n) => (n > 0 ? \`In \${n} days\` : \`\${Math.abs(n)} days ago\`),
                    fr: (n) => (n > 0 ? \`Dans \${n} jours\` : \`Il y a \${Math.abs(n)} jours\`),
                    tr: (n) => (n > 0 ? \`\${n} gün sonra\` : \`\${Math.abs(n)} gün önce\`),
                    ur: (n) => (n > 0 ? \`\${n} دن بعد\` : \`\${Math.abs(n)} دن پہلے\`),
                    de: (n) => (n > 0 ? \`In \${n} Tagen\` : \`Vor \${Math.abs(n)} Tagen\`),
                    id: (n) => (n > 0 ? \`\${n} hari lagi\` : \`\${Math.abs(n)} hari lalu\`),
                    es: (n) => (n > 0 ? \`En \${n} días\` : \`Hace \${Math.abs(n)} días\`),
                    bn: (n) => (n > 0 ? \`\${n} দিন পরে\` : \`\${Math.abs(n)} দিন আগে\`),
                    ms: (n) => (n > 0 ? \`\${n} hari lagi\` : \`\${Math.abs(n)} hari lalu\`)
                };`;

const PART1_NEW = `                // Phase M6 (2026-05-03): retired the natural-language relative-day
                // formatter (was _hubCalDaysFmt — added in earlier UAT, modified
                // in M5-b). Calendar cells now show signed-delta numerics ("+5",
                // "-3") which are language-neutral and don't pollute the page's
                // keyword distribution. A single legend above the calendar (10
                // langs) explains the +/- semantics. See _calLegendByLang below.`;

replaceOnce('PART 1 — Remove dead _hubCalDaysFmt formatter', PART1_OLD, PART1_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — Remove the _calDaysFn assignment (now unused).
// ═══════════════════════════════════════════════════════════════════════════
const PART2_OLD = `                const _calToday     = _hubCalTodayLbl[Lm]     || _hubCalTodayLbl.en;
                const _calYesterday = _hubCalYesterdayLbl[Lm] || _hubCalYesterdayLbl.en;
                const _calTomorrow  = _hubCalTomorrowLbl[Lm]  || _hubCalTomorrowLbl.en;
                const _calDaysFn    = _hubCalDaysFmt[Lm]      || _hubCalDaysFmt.en;`;

const PART2_NEW = `                const _calToday     = _hubCalTodayLbl[Lm]     || _hubCalTodayLbl.en;
                const _calYesterday = _hubCalYesterdayLbl[Lm] || _hubCalYesterdayLbl.en;
                const _calTomorrow  = _hubCalTomorrowLbl[Lm]  || _hubCalTomorrowLbl.en;
                // Phase M6 (2026-05-03): per-lang legend for the +/- delta semantics
                // shown in calendar cells (replaces the old per-cell natural-language
                // relative-time label that polluted Keyword Distribution).
                const _calLegendByLang = {
                    ar: '+ تعني الأيام القادمة، − تعني الأيام السابقة. اضغط أيّ يوم لفتح صفحته.',
                    en: '+ means upcoming days, − means past days. Click any day to open its page.',
                    fr: "+ indique les jours à venir, − les jours passés. Cliquez sur un jour pour l'ouvrir.",
                    tr: '+ gelecek günleri, − geçmiş günleri belirtir. Sayfasını açmak için bir güne tıklayın.',
                    ur: '+ آنے والے دنوں اور − گزشتہ دنوں کی نشاندہی کرتا ہے۔ صفحہ کھولنے کے لیے کسی دن پر کلک کریں۔',
                    de: '+ steht für kommende Tage, − für vergangene. Klicken Sie auf einen Tag, um ihn zu öffnen.',
                    id: '+ menunjukkan hari mendatang, − hari lampau. Klik hari mana saja untuk membuka halamannya.',
                    es: '+ indica días próximos, − días pasados. Pulse cualquier día para abrir su página.',
                    bn: '+ আসন্ন দিনগুলি, − অতীত দিনগুলি বোঝায়। কোনো দিনে ক্লিক করে তার পৃষ্ঠা খুলুন।',
                    ms: '+ menunjukkan hari akan datang, − hari lalu. Klik mana-mana hari untuk membuka halamannya.'
                };
                const _calLegendText = _calLegendByLang[Lm] || _calLegendByLang.en;`;

replaceOnce('PART 2 — Drop _calDaysFn + add _calLegendByLang (10 langs)', PART2_OLD, PART2_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — Per-cell label: signed delta instead of natural-language phrase.
// Per-cell date: drop the month name (already in the H2 above).
// ═══════════════════════════════════════════════════════════════════════════
const PART3_OLD = `                    let _cellLabel;
                    if (_offset === 0)        _cellLabel = _calToday;
                    else if (_offset === -1)  _cellLabel = _calYesterday;
                    else if (_offset === 1)   _cellLabel = _calTomorrow;
                    else                      _cellLabel = _calDaysFn(_offset);
                    const _cellDateTxt = day + ' ' + _gMonthsShort[_calMo - 1];`;

const PART3_NEW = `                    // Phase M6 (2026-05-03): special labels for ±1 / 0; signed-delta
                    // numerics for everything else. Eliminates per-cell natural-language
                    // text repetition that polluted Keyword Distribution. Phase name
                    // (icon + label below) is unchanged — useful UX, not flagged.
                    let _cellLabel;
                    if (_offset === 0)        _cellLabel = _calToday;
                    else if (_offset === -1)  _cellLabel = _calYesterday;
                    else if (_offset === 1)   _cellLabel = _calTomorrow;
                    else if (_offset > 0)     _cellLabel = '+' + _offset;
                    else                      _cellLabel = '−' + Math.abs(_offset);
                    // Phase M6: drop month name from each cell (already in calendar H2).
                    const _cellDateTxt = String(day);`;

replaceOnce('PART 3 — Cell label → signed delta + drop month name', PART3_OLD, PART3_NEW);

// ═══════════════════════════════════════════════════════════════════════════
// PART 4 — Inject the legend <p> between weekday-row and the cells grid.
// ═══════════════════════════════════════════════════════════════════════════
const PART4_OLD = `                const _hubCalHtml = \`<div class="section-card moon-hub-calendar-card" id="moon-hub-cal" tabindex="-1">\`
                    + \`<div class="moon-hub-cal-header">\`
                    +   \`<h2 class="moon-hub-cal-title">\${_escHtml(_calTitle)}</h2>\`
                    +   _pickerHtml
                    + \`</div>\`
                    + _navHtml
                    + \`<ul class="moon-hub-cal-wd-row">\${_calWdHtml}</ul>\`
                    + \`<ul class="moon-hub-cal-grid">\${_calCellsHtml}</ul>\`
                    + \`</div>\\n                \${_hubDetailCtaHtml}\`;`;

const PART4_NEW = `                // Phase M6 (2026-05-03): legend explains +/- semantics shown in cells.
                // Single occurrence per page — no per-cell text repetition.
                const _hubCalHtml = \`<div class="section-card moon-hub-calendar-card" id="moon-hub-cal" tabindex="-1">\`
                    + \`<div class="moon-hub-cal-header">\`
                    +   \`<h2 class="moon-hub-cal-title">\${_escHtml(_calTitle)}</h2>\`
                    +   _pickerHtml
                    + \`</div>\`
                    + _navHtml
                    + \`<p class="moon-hub-cal-legend">\${_escHtml(_calLegendText)}</p>\`
                    + \`<ul class="moon-hub-cal-wd-row">\${_calWdHtml}</ul>\`
                    + \`<ul class="moon-hub-cal-grid">\${_calCellsHtml}</ul>\`
                    + \`</div>\\n                \${_hubDetailCtaHtml}\`;`;

replaceOnce('PART 4 — Inject <p class="moon-hub-cal-legend"> in calendar HTML', PART4_OLD, PART4_NEW);

writeFileSync(SRV_PATH, raw);

console.log('\n✅ Phase M6 — calendar noise isolation complete.');
console.log('\nChanges applied (server.js):');
console.log('  • Removed dead _hubCalDaysFmt formatter (~28 lines)');
console.log('  • Removed _calDaysFn assignment');
console.log('  • Cell label: signed delta (+5/-3) instead of "خلال 5 أيّام"');
console.log('  • Cell date: "15" instead of "15 ماي" (month already in H2)');
console.log('  • Added _calLegendByLang (10 langs) + <p class="moon-hub-cal-legend">');
console.log('\nKept unchanged: phase names ("أحدب متناقص"), phase icons, special');
console.log('labels (اليوم/أمس/غدًا — 1 occurrence each), SEO sections (M1-M5).');
console.log('\nNext: add CSS for .moon-hub-cal-legend (small caption above grid).');
