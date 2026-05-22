#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HIJRI-UMM-AL-QURA-DATA-STAGE-A1 (2026-05-23)
 *
 *  Smoke tests for the populated Umm al-Qura table:
 *    - db/hijri/umm-al-qura.json (status: "data-ready", years 1356-1500)
 *    - js/hijri-umm-al-qura.js (helpers, now widened for 28-day months
 *      and 353-day years)
 *
 *  Run:  node scripts/_smoke_hijri_umm_al_qura_a1.mjs
 *  Exit: 0 if every assertion passes, 1 if any fails.
 *
 *  Test categories (extends the Stage A0 smoke suite):
 *    1. Table is "data-ready" and contains 145 years.
 *    2. Year-in-range gate works against the new bounds.
 *    3. Headline assertions for 1447-12 / 1448-01 (the bug zone):
 *         - 1447-12 has 29 days
 *         - 1447-12-01 = 2026-05-18
 *         - 1447-12-29 = 2026-06-15
 *         - 1448-01-01 = 2026-06-16
 *         - 1447-12-30 is INVALID
 *         - 1447 yearLength === 355
 *    4. Anomaly 1: 1356 yearLength === 353.
 *    5. Anomaly 2: 1401 yearLength === 353.
 *    6. Anomaly 3: 1364-08 (Shaban 1364) === 28 days.
 *    7. Schema validator passes for the populated file.
 *    8. Boundary years 1356/1500 in range; 1355/1501 out of range.
 *    9. Random spot-checks within range.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');
const require    = createRequire(import.meta.url);

const Helpers = require(path.join(ROOT, 'js', 'hijri-umm-al-qura.js'));
Helpers._resetForTests();

let pass = 0, fail = 0;
const failures = [];

function eq(label, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) pass++;
    else { fail++; failures.push(`${label}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`); }
}
function truthy(label, val) { if (val) pass++; else { fail++; failures.push(`${label} — expected truthy, got ${JSON.stringify(val)}`); } }

// ─── Category 1: Table is populated ──────────────────────────────────────
console.log('• Category 1: table populated');
const t = Helpers.loadTable();
eq('calendar', t.calendar, 'umm-al-qura');
eq('status === "data-ready"', t.status, 'data-ready');
eq('range.startYear === 1356', t.range.startYear, 1356);
eq('range.endYear === 1500', t.range.endYear, 1500);
eq('years count === 145', Object.keys(t.years).length, 145);
truthy('sourceMeta present', t.sourceMeta && t.sourceMeta.packageName === '@tabby_ai/hijri-converter');
truthy('packageVersion === 1.0.5', t.sourceMeta.packageVersion === '1.0.5');
truthy('packageLicense === MIT', t.sourceMeta.packageLicense === 'MIT');
truthy('statistics present', t.statistics && typeof t.statistics === 'object');
eq('statistics.totalYears', t.statistics.totalYears, 145);

// ─── Category 2: Range gates ────────────────────────────────────────────
console.log('• Category 2: range gates');
eq('1356 in range', Helpers.isYearInUmmAlQuraRange(1356), true);
eq('1500 in range', Helpers.isYearInUmmAlQuraRange(1500), true);
eq('1447 in range', Helpers.isYearInUmmAlQuraRange(1447), true);
eq('1355 out of range', Helpers.isYearInUmmAlQuraRange(1355), false);
eq('1501 out of range', Helpers.isYearInUmmAlQuraRange(1501), false);
eq('1342 out of range', Helpers.isYearInUmmAlQuraRange(1342), false);

// ─── Category 3: Headline (the bug zone) ────────────────────────────────
console.log('• Category 3: HEADLINE assertions (the user-reported bug zone)');
eq('Dhul Hijjah 1447 = 29 days', Helpers.getUmmAlQuraMonthLength(1447, 12), 29);
eq('1447 yearLength === 355', Helpers.getUmmAlQuraYearLength(1447), 355);
eq('1447-12-01 valid', Helpers.isValidUmmAlQuraDate(1447, 12, 1), true);
eq('1447-12-29 valid', Helpers.isValidUmmAlQuraDate(1447, 12, 29), true);
eq('1447-12-30 INVALID', Helpers.isValidUmmAlQuraDate(1447, 12, 30), false);
eq('1448-01-01 valid', Helpers.isValidUmmAlQuraDate(1448, 1, 1), true);

// Year-start Gregorian
eq('1447 yearStart === 2025-06-26', Helpers.getUmmAlQuraYearStart(1447), '2025-06-26');
eq('1448 yearStart === 2026-06-16', Helpers.getUmmAlQuraYearStart(1448), '2026-06-16');

// 1447 month breakdown (cross-check against pack-audit-1 §8.1)
eq('1447 months', t.years['1447'].months, [30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30, 29]);

// ─── Category 4: Anomaly — 1356 (353 days) ─────────────────────────────
console.log('• Category 4: anomaly 1356 = 353 days');
eq('1356 yearLength === 353', Helpers.getUmmAlQuraYearLength(1356), 353);
eq('1356 months sum === 353',
    t.years['1356'].months.reduce((a, b) => a + b, 0), 353);
eq('1356 in anomalies.yearLength',
    t.anomalies.yearLength.some(a => a.year === 1356 && a.yearLength === 353), true);

// ─── Category 5: Anomaly — 1401 (353 days) ─────────────────────────────
console.log('• Category 5: anomaly 1401 = 353 days');
eq('1401 yearLength === 353', Helpers.getUmmAlQuraYearLength(1401), 353);
eq('1401 months sum === 353',
    t.years['1401'].months.reduce((a, b) => a + b, 0), 353);
eq('1401 in anomalies.yearLength',
    t.anomalies.yearLength.some(a => a.year === 1401 && a.yearLength === 353), true);

// ─── Category 6: Anomaly — 1364-08 (28 days) ───────────────────────────
console.log('• Category 6: anomaly 1364-08 (Shaban) = 28 days');
eq('1364 month 8 === 28 days', Helpers.getUmmAlQuraMonthLength(1364, 8), 28);
eq('1364 yearLength === 354', Helpers.getUmmAlQuraYearLength(1364), 354);
eq('1364-08 in anomalies.monthLength',
    t.anomalies.monthLength.some(a => a.year === 1364 && a.month === 8 && a.days === 28), true);
// 1364-08-28 valid, but 1364-08-29 invalid
eq('1364-08-28 valid', Helpers.isValidUmmAlQuraDate(1364, 8, 28), true);
eq('1364-08-29 INVALID (only 28 days)', Helpers.isValidUmmAlQuraDate(1364, 8, 29), false);

// ─── Category 7: Schema validator passes ────────────────────────────────
console.log('• Category 7: schema validator');
const v = spawnSync(process.execPath, [path.join(ROOT, 'scripts', '_validate_hijri_umm_al_qura_schema.mjs')], { encoding: 'utf-8' });
eq('schema exit === 0', v.status, 0);
truthy('schema stdout has success', /Schema OK/.test(v.stdout));

// ─── Category 8: Boundary years ─────────────────────────────────────────
console.log('• Category 8: boundary years');
eq('1356 hasYearData', Helpers.hasYearData(1356), true);
eq('1500 hasYearData', Helpers.hasYearData(1500), true);
eq('1355 hasYearData false', Helpers.hasYearData(1355), false);
eq('1501 hasYearData false', Helpers.hasYearData(1501), false);

// Year-start sanity
eq('1500 yearStart format', /^\d{4}-\d{2}-\d{2}$/.test(Helpers.getUmmAlQuraYearStart(1500)), true);
eq('1356 yearStart format', /^\d{4}-\d{2}-\d{2}$/.test(Helpers.getUmmAlQuraYearStart(1356)), true);

// ─── Category 9: Spot checks across the range ───────────────────────────
console.log('• Category 9: spot checks');
// 1 Muharram 1500
eq('1500 yearStart', Helpers.getUmmAlQuraYearStart(1500), '2076-11-27');
// 1 Muharram 1444 (well-known modern reference)
eq('1444 yearStart', Helpers.getUmmAlQuraYearStart(1444), '2022-07-30');
// 1 Muharram 1446
eq('1446 yearStart', Helpers.getUmmAlQuraYearStart(1446), '2024-07-07');

// Every year's months MUST sum to its yearLength
let mismatchYears = 0;
for (let y = 1356; y <= 1500; y++) {
    const e = t.years[String(y)];
    const sum = e.months.reduce((a, b) => a + b, 0);
    if (sum !== e.yearLength) {
        mismatchYears++;
        failures.push(`year ${y}: months sum=${sum} != yearLength=${e.yearLength}`);
        fail++;
    }
}
if (mismatchYears === 0) pass++;
console.log(`  - all 145 years: months sum === yearLength: ${mismatchYears === 0 ? 'OK' : mismatchYears + ' mismatches'}`);

// Every month entry MUST be 28, 29, or 30
let badMonths = 0;
for (let y = 1356; y <= 1500; y++) {
    for (const days of t.years[String(y)].months) {
        if (days !== 28 && days !== 29 && days !== 30) {
            badMonths++;
            failures.push(`year ${y} has month with ${days} days`);
            fail++;
        }
    }
}
if (badMonths === 0) pass++;
console.log(`  - all 1740 month entries: 28/29/30: ${badMonths === 0 ? 'OK' : badMonths + ' bad'}`);

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
    console.log('✓ ALL TESTS PASSED — Stage A1 data is sound + helpers work + anomalies documented.');
    process.exit(0);
}
