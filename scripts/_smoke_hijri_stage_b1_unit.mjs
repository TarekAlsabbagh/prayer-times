#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HIJRI-UMM-AL-QURA-STAGE-B1-ALGORITHM-FLIP (2026-05-23)
 *  Unit tests for the table-driven js/hijri-date.js helpers.
 *
 *  Run:  node scripts/_smoke_hijri_stage_b1_unit.mjs
 *  Exit: 0 if every assertion passes, 1 if any fails.
 *
 *  Methodology:
 *    1. Pre-load db/hijri/umm-al-qura.json and inject into globalThis
 *       before requiring js/hijri-date.js (mimics SSR table injection).
 *    2. Exercise the full public API:
 *         isYearInRange, isValidHijriDate, getDaysInHijriMonth,
 *         getHijriYearLength, isHijriLeapYear, hijriToGregorian,
 *         gregorianToHijri, getToday, getHijriCalendar, hijriToJD,
 *         gregorianToJD.
 *    3. Round-trip property tests.
 *    4. Headline assertions for the user-reported bug zone (1447-12).
 *    5. Anomaly verification (1356, 1364-08, 1401).
 *    6. Boundary tests (1355, 1356, 1500, 1501).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');
const require    = createRequire(import.meta.url);

// Inject table into globalThis BEFORE loading hijri-date.js
const table = require(path.join(ROOT, 'db', 'hijri', 'umm-al-qura.json'));
globalThis._HIJRI_UMM_AL_QURA = table;

// Now load the table-driven module
const HijriDate = require(path.join(ROOT, 'js', 'hijri-date.js'));

let pass = 0, fail = 0;
const failures = [];

function eq(label, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) pass++;
    else { fail++; failures.push(`${label}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`); }
}
function truthy(label, val) { if (val) pass++; else { fail++; failures.push(`${label} — expected truthy, got ${JSON.stringify(val)}`); } }

// ─── Category 1: Range gates ────────────────────────────────────────────
console.log('• Category 1: isYearInRange');
eq('1356 in range', HijriDate.isYearInRange(1356), true);
eq('1500 in range', HijriDate.isYearInRange(1500), true);
eq('1447 in range', HijriDate.isYearInRange(1447), true);
eq('1355 out of range', HijriDate.isYearInRange(1355), false);
eq('1501 out of range', HijriDate.isYearInRange(1501), false);
eq('1300 out of range', HijriDate.isYearInRange(1300), false);
eq('non-number false', HijriDate.isYearInRange('1447'), false);

// ─── Category 2: getDaysInHijriMonth ────────────────────────────────────
console.log('• Category 2: getDaysInHijriMonth');
eq('1447 M12 === 29 (HEADLINE)', HijriDate.getDaysInHijriMonth(1447, 12), 29);
eq('1447 M1 === 30', HijriDate.getDaysInHijriMonth(1447, 1), 30);
eq('1447 M4 === 30 (Rabi al-Akhir has extra leap day)', HijriDate.getDaysInHijriMonth(1447, 4), 30);
eq('1448 M1 === 29', HijriDate.getDaysInHijriMonth(1448, 1), 29);
eq('1356 M1 === 29 (anomaly year starts 29)', HijriDate.getDaysInHijriMonth(1356, 1), 29);
eq('1364 M8 === 28 (Shaban anomaly)', HijriDate.getDaysInHijriMonth(1364, 8), 28);
eq('out-of-range year returns 0', HijriDate.getDaysInHijriMonth(1300, 1), 0);
eq('month 0 returns 0', HijriDate.getDaysInHijriMonth(1447, 0), 0);
eq('month 13 returns 0', HijriDate.getDaysInHijriMonth(1447, 13), 0);

// ─── Category 3: getHijriYearLength + isHijriLeapYear ───────────────────
console.log('• Category 3: getHijriYearLength + isHijriLeapYear');
eq('1447 length === 355 (HEADLINE)', HijriDate.getHijriYearLength(1447), 355);
eq('1447 is leap', HijriDate.isHijriLeapYear(1447), true);
eq('1446 length === 354', HijriDate.getHijriYearLength(1446), 354);
eq('1446 not leap', HijriDate.isHijriLeapYear(1446), false);
eq('1356 length === 353 (anomaly)', HijriDate.getHijriYearLength(1356), 353);
eq('1356 NOT leap (353 ≠ 355)', HijriDate.isHijriLeapYear(1356), false);
eq('1401 length === 353 (anomaly)', HijriDate.getHijriYearLength(1401), 353);
eq('out-of-range returns 0', HijriDate.getHijriYearLength(1300), 0);

// ─── Category 4: isValidHijriDate ───────────────────────────────────────
console.log('• Category 4: isValidHijriDate (HEADLINE phantom-date guard)');
eq('1447-12-01 valid', HijriDate.isValidHijriDate(1447, 12, 1), true);
eq('1447-12-29 valid', HijriDate.isValidHijriDate(1447, 12, 29), true);
eq('1447-12-30 INVALID (phantom date)', HijriDate.isValidHijriDate(1447, 12, 30), false);
eq('1448-01-01 valid', HijriDate.isValidHijriDate(1448, 1, 1), true);
eq('1447-04-30 valid (M4 has 30 days)', HijriDate.isValidHijriDate(1447, 4, 30), true);
eq('1447-04-31 INVALID', HijriDate.isValidHijriDate(1447, 4, 31), false);
eq('1364-08-28 valid', HijriDate.isValidHijriDate(1364, 8, 28), true);
eq('1364-08-29 INVALID', HijriDate.isValidHijriDate(1364, 8, 29), false);
eq('1355-01-01 INVALID (year out of range)', HijriDate.isValidHijriDate(1355, 1, 1), false);
eq('1501-01-01 INVALID', HijriDate.isValidHijriDate(1501, 1, 1), false);
eq('1447-13-01 INVALID', HijriDate.isValidHijriDate(1447, 13, 1), false);
eq('1447-00-01 INVALID', HijriDate.isValidHijriDate(1447, 0, 1), false);
eq('1447-01-00 INVALID', HijriDate.isValidHijriDate(1447, 1, 0), false);

// ─── Category 5: hijriToGregorian (HEADLINE conversions) ────────────────
console.log('• Category 5: hijriToGregorian (HEADLINE)');
eq('1447-12-01 → 2026-05-18', HijriDate.toGregorian(1447, 12, 1), {year:2026, month:5, day:18});
eq('1447-12-29 → 2026-06-15', HijriDate.toGregorian(1447, 12, 29), {year:2026, month:6, day:15});
eq('1448-01-01 → 2026-06-16', HijriDate.toGregorian(1448, 1, 1), {year:2026, month:6, day:16});
eq('1447-12-30 → null (invalid)', HijriDate.toGregorian(1447, 12, 30), null);
eq('1447-01-01 → 2025-06-26', HijriDate.toGregorian(1447, 1, 1), {year:2025, month:6, day:26});
eq('out-of-range 1300-01-01 → null', HijriDate.toGregorian(1300, 1, 1), null);

// ─── Category 6: gregorianToHijri (reverse — must round-trip) ───────────
console.log('• Category 6: gregorianToHijri (round-trip)');
eq('2026-05-18 → 1447-12-01', HijriDate.toHijri(2026, 5, 18), {year:1447, month:12, day:1});
eq('2026-06-15 → 1447-12-29', HijriDate.toHijri(2026, 6, 15), {year:1447, month:12, day:29});
eq('2026-06-16 → 1448-01-01', HijriDate.toHijri(2026, 6, 16), {year:1448, month:1, day:1});
eq('2025-06-26 → 1447-01-01', HijriDate.toHijri(2025, 6, 26), {year:1447, month:1, day:1});

// Round-trip property: H → G → H must match original (sample 20 random)
let roundTripFails = 0;
for (let n = 0; n < 50; n++) {
    const y = 1400 + Math.floor(Math.random() * 100); // 1400-1499
    const m = 1 + Math.floor(Math.random() * 12);
    const maxD = HijriDate.getDaysInHijriMonth(y, m);
    if (!maxD) continue;
    const d = 1 + Math.floor(Math.random() * maxD);
    const g = HijriDate.toGregorian(y, m, d);
    if (!g) { roundTripFails++; continue; }
    const back = HijriDate.toHijri(g.year, g.month, g.day);
    if (!back || back.year !== y || back.month !== m || back.day !== d) {
        roundTripFails++;
        failures.push(`Round-trip failed: ${y}-${m}-${d} → ${JSON.stringify(g)} → ${JSON.stringify(back)}`);
    }
}
if (roundTripFails === 0) pass++; else fail += roundTripFails;
console.log(`  - 50 random round-trips: ${roundTripFails === 0 ? 'OK' : roundTripFails + ' failed'}`);

// ─── Category 7: getToday (sanity — must be in range) ───────────────────
console.log('• Category 7: getToday');
const today = HijriDate.getToday();
truthy('getToday returns valid object', today && Number.isInteger(today.year));
truthy('today year in range', HijriDate.isYearInRange(today.year));
truthy('today month 1..12', today.month >= 1 && today.month <= 12);
truthy('today day valid', HijriDate.isValidHijriDate(today.year, today.month, today.day));

// ─── Category 8: getHijriCalendar (month-grid) ──────────────────────────
console.log('• Category 8: getHijriCalendar for 1447-12');
const cal = HijriDate.getHijriCalendar(1447, 12);
eq('1447-12 daysInMonth === 29', cal.daysInMonth, 29);
let cellCount = 0;
for (const week of cal.weeks) for (const cell of week) if (cell) cellCount++;
eq('1447-12 has 29 non-null cells', cellCount, 29);
// First day Greg
truthy('1447-12 grid day-1 = 2026-05-18',
    cal.weeks[0].find(c => c && c.hijri === 1)?.gregorian?.day === 18);
// Last day Greg
let lastCell = null;
for (const week of cal.weeks) for (const cell of week) if (cell && cell.hijri === 29) lastCell = cell;
truthy('1447-12 grid day-29 = 2026-06-15',
    lastCell && lastCell.gregorian.year === 2026 && lastCell.gregorian.month === 6 && lastCell.gregorian.day === 15);

// Out-of-range calendar
const calOut = HijriDate.getHijriCalendar(1300, 1);
eq('Out-of-range calendar empty', calOut.daysInMonth, 0);

// ─── Category 9: hijriToJD + gregorianToJD (backward-compat helpers) ────
console.log('• Category 9: JD helpers (backward compat)');
eq('gregorianToJD(2026, 5, 18) === 2461179', HijriDate.gregorianToJD(2026, 5, 18), 2461179);
eq('hijriToJD(1447, 12, 1) === 2461179', HijriDate.hijriToJD(1447, 12, 1), 2461179);
eq('hijriToJD(1447, 12, 29) === 2461207', HijriDate.hijriToJD(1447, 12, 29), 2461207);
eq('hijriToJD(1448, 1, 1) === 2461208', HijriDate.hijriToJD(1448, 1, 1), 2461208);
eq('hijriToJD(1447, 12, 30) === null (invalid)', HijriDate.hijriToJD(1447, 12, 30), null);

// ─── Category 10: No overlap, no gap between 1447 end and 1448 start ────
console.log('• Category 10: 1447/1448 boundary continuity');
const g_1447_12_29 = HijriDate.toGregorian(1447, 12, 29);
const g_1448_01_01 = HijriDate.toGregorian(1448, 1, 1);
const jd_29 = HijriDate.gregorianToJD(g_1447_12_29.year, g_1447_12_29.month, g_1447_12_29.day);
const jd_01 = HijriDate.gregorianToJD(g_1448_01_01.year, g_1448_01_01.month, g_1448_01_01.day);
eq('1448-01-01 is exactly 1 day after 1447-12-29', jd_01 - jd_29, 1);
const h_jd_30 = HijriDate.toHijri(g_1448_01_01.year, g_1448_01_01.month, g_1448_01_01.day);
eq('JD of 1448-01-01 reverse-maps to {1448,1,1}, not phantom {1447,12,30}', h_jd_30, {year:1448, month:1, day:1});

// ─── Category 11: Constants unchanged ───────────────────────────────────
console.log('• Category 11: constants (backward compat)');
eq('hijriMonths length === 12', HijriDate.hijriMonths.length, 12);
eq('hijriMonths[11]', HijriDate.hijriMonths[11], 'ذو الحجة');
eq('gregorianMonths length === 12', HijriDate.gregorianMonths.length, 12);
eq('dayNames length === 7', HijriDate.dayNames.length, 7);

// ─── Summary ────────────────────────────────────────────────────────────
console.log('');
console.log('─'.repeat(72));
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) console.log('  ✗ ' + f);
    process.exit(1);
} else {
    console.log('✓ ALL UNIT TESTS PASSED — table-driven hijri-date.js is sound.');
    process.exit(0);
}
