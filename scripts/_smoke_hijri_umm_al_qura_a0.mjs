#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  HIJRI-UMM-AL-QURA-INFRA-STAGE-A0 (2026-05-22)
 *
 *  Smoke tests for the additive infrastructure introduced in Stage A0:
 *      - db/hijri/umm-al-qura.json (placeholder, status=data-pending)
 *      - js/hijri-umm-al-qura.js (Node-only helpers)
 *
 *  Run:  node scripts/_smoke_hijri_umm_al_qura_a0.mjs
 *  Exit: 0 if every assertion passes, 1 if any fails.
 *
 *  Test categories:
 *    1. Module loads + exports the expected API surface.
 *    2. loadTable() returns the placeholder shape.
 *    3. tableMeta() exposes calendar + range + status.
 *    4. isYearInUmmAlQuraRange() honours the configured range bounds.
 *    5. hasYearData() is false for every year (empty placeholder state).
 *    6. getUmmAlQuraMonthLength() returns null in every case
 *       (no data populated yet).
 *    7. isValidUmmAlQuraDate() returns false for EVERY date — the
 *       headline guarantee of the empty-state policy.
 *    8. getUmmAlQuraYearLength() returns null in every case.
 *    9. getUmmAlQuraYearStart() returns null in every case.
 *   10. Injected-table fixture: with a synthetic populated entry for
 *       1447 = 354 days non-leap, helpers behave correctly.
 *   11. Schema validator passes for the current placeholder file.
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

let pass = 0, fail = 0;
const failures = [];

function eq(label, actual, expected) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) {
        pass++;
        // Uncomment for verbose: console.log(`  ✓ ${label}`);
    } else {
        fail++;
        failures.push(`${label}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
    }
}

function truthy(label, val) {
    if (val) { pass++; } else { fail++; failures.push(`${label} — expected truthy, got ${JSON.stringify(val)}`); }
}

function falsy(label, val) {
    if (!val) { pass++; } else { fail++; failures.push(`${label} — expected falsy, got ${JSON.stringify(val)}`); }
}

// ─── Category 1: module exports ─────────────────────────────────────────
console.log('• Category 1: module exports');
const expectedApi = [
    'loadTable', 'tableMeta',
    'isYearInUmmAlQuraRange', 'hasYearData',
    'getUmmAlQuraMonthLength', 'isValidUmmAlQuraDate',
    'getUmmAlQuraYearLength', 'getUmmAlQuraYearStart',
    '_resetForTests', '_setTableForTests', 'TABLE_PATH'
];
for (const k of expectedApi) {
    truthy(`exports.${k} exists`, Helpers[k] !== undefined);
}
eq('TABLE_PATH ends with db/hijri/umm-al-qura.json', Helpers.TABLE_PATH.endsWith(path.join('db', 'hijri', 'umm-al-qura.json')), true);

// ─── Category 2: loadTable returns placeholder ──────────────────────────
console.log('• Category 2: loadTable placeholder shape');
Helpers._resetForTests();
const t = Helpers.loadTable();
truthy('loadTable() returns object', t && typeof t === 'object');
eq('calendar === "umm-al-qura"', t.calendar, 'umm-al-qura');
eq('range.startYear === 1356', t.range.startYear, 1356);
eq('range.endYear === 1500', t.range.endYear, 1500);
eq('status === "data-pending"', t.status, 'data-pending');
eq('source is null', t.source, null);
eq('years is empty object', t.years, {});

// ─── Category 3: tableMeta exposes the right fields ─────────────────────
console.log('• Category 3: tableMeta');
const meta = Helpers.tableMeta();
eq('meta.calendar', meta.calendar, 'umm-al-qura');
eq('meta.range.startYear', meta.range.startYear, 1356);
eq('meta.range.endYear', meta.range.endYear, 1500);
eq('meta.status', meta.status, 'data-pending');
eq('meta.source', meta.source, null);

// ─── Category 4: isYearInUmmAlQuraRange ─────────────────────────────────
console.log('• Category 4: isYearInUmmAlQuraRange');
eq('1356 in range', Helpers.isYearInUmmAlQuraRange(1356), true);
eq('1500 in range', Helpers.isYearInUmmAlQuraRange(1500), true);
eq('1447 in range', Helpers.isYearInUmmAlQuraRange(1447), true);
eq('1355 OUT of range', Helpers.isYearInUmmAlQuraRange(1355), false);
eq('1501 OUT of range', Helpers.isYearInUmmAlQuraRange(1501), false);
eq('1300 OUT of range', Helpers.isYearInUmmAlQuraRange(1300), false);
eq('1342 OUT of range', Helpers.isYearInUmmAlQuraRange(1342), false);
eq('non-number false', Helpers.isYearInUmmAlQuraRange('1447'), false);
eq('NaN false', Helpers.isYearInUmmAlQuraRange(NaN), false);
eq('Infinity false', Helpers.isYearInUmmAlQuraRange(Infinity), false);

// ─── Category 5: hasYearData (empty state) ──────────────────────────────
console.log('• Category 5: hasYearData (empty state)');
eq('1447 no data', Helpers.hasYearData(1447), false);
eq('1356 no data', Helpers.hasYearData(1356), false);
eq('1500 no data', Helpers.hasYearData(1500), false);
eq('out-of-range 1300 no data', Helpers.hasYearData(1300), false);

// ─── Category 6: getUmmAlQuraMonthLength returns null ───────────────────
console.log('• Category 6: getUmmAlQuraMonthLength (empty state → null)');
eq('1447, 12 → null', Helpers.getUmmAlQuraMonthLength(1447, 12), null);
eq('1447, 1 → null', Helpers.getUmmAlQuraMonthLength(1447, 1), null);
eq('1356, 6 → null', Helpers.getUmmAlQuraMonthLength(1356, 6), null);
eq('out-of-range year → null', Helpers.getUmmAlQuraMonthLength(1300, 1), null);
eq('invalid month 0 → null', Helpers.getUmmAlQuraMonthLength(1447, 0), null);
eq('invalid month 13 → null', Helpers.getUmmAlQuraMonthLength(1447, 13), null);
eq('non-numeric month → null', Helpers.getUmmAlQuraMonthLength(1447, '5'), null);

// ─── Category 7: isValidUmmAlQuraDate false for everything ──────────────
console.log('• Category 7: isValidUmmAlQuraDate (empty-state policy)');
eq('1447-12-30 invalid', Helpers.isValidUmmAlQuraDate(1447, 12, 30), false);
eq('1447-12-29 invalid (no data yet)', Helpers.isValidUmmAlQuraDate(1447, 12, 29), false);
eq('1447-12-01 invalid (no data yet)', Helpers.isValidUmmAlQuraDate(1447, 12, 1), false);
eq('1448-01-01 invalid (no data yet)', Helpers.isValidUmmAlQuraDate(1448, 1, 1), false);
eq('1300-01-01 out of range', Helpers.isValidUmmAlQuraDate(1300, 1, 1), false);
eq('1501-01-01 out of range', Helpers.isValidUmmAlQuraDate(1501, 1, 1), false);
eq('zero year invalid', Helpers.isValidUmmAlQuraDate(0, 1, 1), false);
eq('zero month invalid', Helpers.isValidUmmAlQuraDate(1447, 0, 1), false);
eq('zero day invalid', Helpers.isValidUmmAlQuraDate(1447, 1, 0), false);
eq('day 31 invalid', Helpers.isValidUmmAlQuraDate(1447, 1, 31), false);
eq('month 13 invalid', Helpers.isValidUmmAlQuraDate(1447, 13, 1), false);
eq('NaN year invalid', Helpers.isValidUmmAlQuraDate(NaN, 1, 1), false);
eq('Infinity month invalid', Helpers.isValidUmmAlQuraDate(1447, Infinity, 1), false);

// ─── Category 8: getUmmAlQuraYearLength returns null ────────────────────
console.log('• Category 8: getUmmAlQuraYearLength (empty state → null)');
eq('1447 → null', Helpers.getUmmAlQuraYearLength(1447), null);
eq('1356 → null', Helpers.getUmmAlQuraYearLength(1356), null);
eq('1500 → null', Helpers.getUmmAlQuraYearLength(1500), null);
eq('out-of-range → null', Helpers.getUmmAlQuraYearLength(1300), null);

// ─── Category 9: getUmmAlQuraYearStart returns null ─────────────────────
console.log('• Category 9: getUmmAlQuraYearStart (empty state → null)');
eq('1447 → null', Helpers.getUmmAlQuraYearStart(1447), null);
eq('1356 → null', Helpers.getUmmAlQuraYearStart(1356), null);
eq('out-of-range → null', Helpers.getUmmAlQuraYearStart(1300), null);

// ─── Category 10: injected-table fixture (sanity that helpers WORK
//                  when data is provided — guards against future regressions
//                  when Stage A or later populates the file) ──────────────
console.log('• Category 10: injected fixture (synthetic 1447 = 354 days)');
const fixture = {
    calendar: 'umm-al-qura',
    source: 'TEST_FIXTURE',
    range: { startYear: 1356, endYear: 1500 },
    status: 'partial',
    years: {
        '1447': {
            months:     [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29],
            yearStart:  '2025-06-27',
            yearLength: 354
        },
        '1448': {
            months:     [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29, 29],
            yearStart:  '2026-06-16',
            yearLength: 352   // intentionally wrong sum to keep this purely a helper-shape test; will not validate via schema
        }
    }
};
// Replace the parsed table for the rest of category 10
Helpers._setTableForTests(fixture);

eq('fixture: hasYearData(1447) true', Helpers.hasYearData(1447), true);
eq('fixture: hasYearData(1448) true', Helpers.hasYearData(1448), true);
eq('fixture: hasYearData(1449) false (not in fixture)', Helpers.hasYearData(1449), false);
eq('fixture: 1447 monthLen(12) === 29', Helpers.getUmmAlQuraMonthLength(1447, 12), 29);
eq('fixture: 1447 monthLen(1) === 30', Helpers.getUmmAlQuraMonthLength(1447, 1), 30);
eq('fixture: isValidUmmAlQuraDate(1447, 12, 29) true', Helpers.isValidUmmAlQuraDate(1447, 12, 29), true);
eq('fixture: isValidUmmAlQuraDate(1447, 12, 30) false', Helpers.isValidUmmAlQuraDate(1447, 12, 30), false);
eq('fixture: isValidUmmAlQuraDate(1447, 12, 1) true', Helpers.isValidUmmAlQuraDate(1447, 12, 1), true);
eq('fixture: isValidUmmAlQuraDate(1448, 1, 1) true', Helpers.isValidUmmAlQuraDate(1448, 1, 1), true);
eq('fixture: getUmmAlQuraYearLength(1447) === 354', Helpers.getUmmAlQuraYearLength(1447), 354);
eq('fixture: getUmmAlQuraYearStart(1447) === "2025-06-27"', Helpers.getUmmAlQuraYearStart(1447), '2025-06-27');
eq('fixture: getUmmAlQuraYearStart(1448) === "2026-06-16"', Helpers.getUmmAlQuraYearStart(1448), '2026-06-16');

// Restore real table
Helpers._resetForTests();
truthy('after reset, real placeholder re-loads', Helpers.loadTable().status === 'data-pending');

// ─── Category 11: schema validator passes ───────────────────────────────
console.log('• Category 11: schema validator on the placeholder file');
const result = spawnSync(process.execPath, [
    path.join(ROOT, 'scripts', '_validate_hijri_umm_al_qura_schema.mjs')
], { encoding: 'utf-8' });
eq('schema validator exit code === 0', result.status, 0);
truthy('schema validator stdout contains success marker', /Schema OK/.test(result.stdout));

// ─── Summary ────────────────────────────────────────────────────────────
console.log('');
console.log('─'.repeat(72));
console.log(`Results: ${pass} passed, ${fail} failed`);
if (fail > 0) {
    console.log('');
    console.log('Failures:');
    for (const f of failures) {
        console.log('  ✗ ' + f);
    }
    process.exit(1);
} else {
    console.log('✓ ALL TESTS PASSED — Stage A0 infrastructure is sound.');
    process.exit(0);
}
