// scripts/_test_persian_pregate_design.mjs
// ─────────────────────────────────────────────────────────────────────────
// Test runner for ASIA-1G-STAGE-3.4-PERSIAN-PREGATE-DESIGN-1
//
// Runs the small in-process fixture through the standalone normalizer.
// Does NOT touch the main pipeline. Does NOT download anything.
//
// Verifies, for each fixture row:
//   1. cleaned text matches expect.cleaned (exact)
//   2. changed flag matches expect.changed
//   3. char-substitution counts match expect.charsSubstituted (exact set)
//   4. running the cleaner twice on the OUTPUT yields the same OUTPUT
//      (idempotency)
//
// Also prints a summary table of every fixture row's before/after, plus
// the batch report from persianPregateBatch().
//
// Exit code 0 only if every assertion passes.
// ─────────────────────────────────────────────────────────────────────────
import { persianPregateClean, persianPregateBatch, PERSIAN_CHAR_MAP }
    from '../scripts/geodata/persian_pregate_normalizer.mjs';
import { FIXTURE } from '../scripts/geodata/_persian_pregate_fixture.mjs';

function eqCharChangeSets(actual, expected) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
    if (actual.length !== expected.length) return false;
    // Order-insensitive compare on (from, to, count)
    const key = (x) => x.from + '|' + x.to + '|' + x.count;
    const sa = new Set(actual.map(key));
    const sb = new Set(expected.map(key));
    if (sa.size !== sb.size) return false;
    for (const k of sa) if (!sb.has(k)) return false;
    return true;
}

let pass = 0;
let fail = 0;
const failures = [];

console.log('═══ Stage 3.4 PERSIAN PRE-GATE — fixture run ═══');
console.log('Total rows: ' + FIXTURE.length);
console.log('Char map size: ' + Object.keys(PERSIAN_CHAR_MAP).length);
console.log('');

for (const row of FIXTURE) {
    const r = persianPregateClean(row.originalAr);
    const okText  = r.cleaned === row.expect.cleaned;
    const okFlag  = r.changed === row.expect.changed;
    const okChars = eqCharChangeSets(r.perCharChanges, row.expect.charsSubstituted);

    // Idempotency: feed the output back in and assert no further change.
    const second = persianPregateClean(r.cleaned);
    const okIdem = second.cleaned === r.cleaned && second.changed === false;

    const ok = okText && okFlag && okChars && okIdem;
    const slot = (row.cc + '/' + row.slug).padEnd(28);
    if (ok) {
        pass++;
        console.log('  ✓ ' + slot + ' "' + row.originalAr + '" → "' + r.cleaned + '"');
    } else {
        fail++;
        failures.push({ slot, row, r, second, okText, okFlag, okChars, okIdem });
        console.log('  ✗ ' + slot + ' FAIL');
        console.log('     note:        ' + row.note);
        console.log('     in:          "' + row.originalAr + '"');
        console.log('     out:         "' + r.cleaned + '"');
        console.log('     expected:    "' + row.expect.cleaned + '"');
        console.log('     changed=' + r.changed + '  expected=' + row.expect.changed);
        console.log('     chars actual=' + JSON.stringify(r.perCharChanges));
        console.log('     chars expect=' + JSON.stringify(row.expect.charsSubstituted));
        console.log('     idem second="' + second.cleaned + '"  changed=' + second.changed);
    }
}

console.log('');
console.log('─── persianPregateBatch report ───');
const rows = FIXTURE.map(f => ({ ar: f.originalAr, slug: f.slug, cc: f.cc }));
const { report } = persianPregateBatch(rows);
console.log('  total:     ' + report.total);
console.log('  changed:   ' + report.changed);
console.log('  unchanged: ' + report.unchanged);
console.log('  empty:     ' + report.empty);
console.log('  top substitutions:');
for (const s of report.topCharSubstitutions) {
    console.log('    ' + s.from + ' → ' + s.to + '  ×' + s.count);
}

console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + FIXTURE.length + ')');
console.log('Idempotency: ' + (failures.every(f => f.okIdem !== false) ? 'OK on passing rows' : 'BROKEN on at least one row'));

process.exit(fail === 0 ? 0 : 1);
