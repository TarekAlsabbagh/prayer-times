// scripts/_test_stage_3_large_country_output_fix.mjs
//
// STAGE-3-LARGE-COUNTRY-OUTPUT-FIX-1 verification — checks the indent-
// selection logic in `validate_candidates.mjs` works correctly across
// the 100k threshold.
//
// NO data files touched. Pure unit test with synthetic in-memory data.

import fs from 'node:fs';

let pass = 0, fail = 0;
const ok = (label, cond, extra) => {
    (cond ? pass++ : fail++);
    console.log((cond ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' STAGE-3-LARGE-COUNTRY-OUTPUT-FIX-1 verification');
console.log('═══════════════════════════════════════════════════════════════════════');

// ─── Part A — Verify patch source code presence ────────────────────────────
console.log('\n── Part A — Source code contains the patch ──');

const src = fs.readFileSync('scripts/geodata/validate_candidates.mjs', 'utf8');

ok('Source contains STAGE-3-LARGE-COUNTRY-OUTPUT-FIX-1 marker',
    src.includes('STAGE-3-LARGE-COUNTRY-OUTPUT-FIX-1'));

ok('Source has conditional indent selection (`> 100000 ? 0 : 2`)',
    /out\.length\s*>\s*100000\s*\?\s*0\s*:\s*2/.test(src) ||
    src.includes('out.length > 100000 ? 0 : 2'));

ok('Source still calls JSON.stringify with indent variable',
    /JSON\.stringify\(out,\s*null,\s*indent\)/.test(src));

ok('Source preserves the candidatesJson write site',
    src.includes('fs.writeFileSync(paths.candidatesJson'));

// ─── Part B — Threshold-selection logic (re-implemented for unit testing) ─
console.log('\n── Part B — Threshold-selection logic (re-impl) ──');

function pickIndent(len) {
    return len > 100000 ? 0 : 2;
}

ok('len=0       → indent=2', pickIndent(0) === 2);
ok('len=1       → indent=2', pickIndent(1) === 2);
ok('len=100     → indent=2', pickIndent(100) === 2);
ok('len=49000   → indent=2 (BD-class)',  pickIndent(49000) === 2);
ok('len=99999   → indent=2 (edge below)', pickIndent(99999) === 2);
ok('len=100000  → indent=2 (boundary inclusive)', pickIndent(100000) === 2);
ok('len=100001  → indent=0 (edge above)', pickIndent(100001) === 0);
ok('len=200000  → indent=0 (US-class)',   pickIndent(200000) === 0);
ok('len=547198  → indent=0 (IN actual)',  pickIndent(547198) === 0);
ok('len=700000  → indent=0 (CN expected)',pickIndent(700000) === 0);
ok('len=10000000→ indent=0 (extreme)',    pickIndent(10000000) === 0);

// ─── Part C — Synthetic small list (50k) — pretty JSON ────────────────────
console.log('\n── Part C — Small list (50k) preserves indent=2 ──');

const smallList = Array.from({ length: 50000 }, (_, i) => ({
    slug: 'test-' + i,
    status: 'pending',
    tier: 'high',
    candidate: { geonameid: 1000000 + i, names: { en: 'TestCity' + i } }
}));

const smallIndent = pickIndent(smallList.length);
ok('50k list → indent=2 selected', smallIndent === 2);

const smallStr = JSON.stringify(smallList, null, smallIndent);
ok('50k pretty JSON has newlines (indent=2)', smallStr.includes('\n'));
ok('50k pretty JSON parses back identically',
    JSON.parse(smallStr).length === smallList.length);

// ─── Part D — Synthetic large list (150k) — compact JSON ──────────────────
console.log('\n── Part D — Large list (150k) uses indent=0 ──');

const largeList = Array.from({ length: 150000 }, (_, i) => ({
    slug: 'test-' + i,
    status: 'pending',
    tier: 'high',
    candidate: { geonameid: 1000000 + i, names: { en: 'TestCity' + i } }
}));

const largeIndent = pickIndent(largeList.length);
ok('150k list → indent=0 selected', largeIndent === 0);

const largeStr = JSON.stringify(largeList, null, largeIndent);
ok('150k compact JSON has NO indentation', !/\n  /.test(largeStr));
ok('150k compact JSON parses back identically',
    JSON.parse(largeStr).length === largeList.length);
ok('150k compact JSON is smaller than equivalent pretty would be',
    largeStr.length < JSON.stringify(largeList, null, 2).length);

// Size estimate at IN-scale
const sizeMb = (largeStr.length / 1024 / 1024).toFixed(1);
ok('150k compact JSON fits in V8 string limit (<512MB)',
    largeStr.length < 512 * 1024 * 1024,
    '(actual: ' + sizeMb + ' MB)');

// ─── Part E — Verify no regression in JSON validity at boundary ───────────
console.log('\n── Part E — JSON validity at threshold boundary ──');

for (const size of [1, 50000, 100000, 100001, 200000]) {
    const list = Array.from({ length: size }, (_, i) => ({ id: i, name: 'item' + i }));
    const indent = pickIndent(size);
    let valid = false;
    try {
        const str = JSON.stringify(list, null, indent);
        const parsed = JSON.parse(str);
        valid = parsed.length === size;
    } catch (e) { valid = false; }
    ok('size=' + size + ' (indent=' + indent + ') produces valid round-trip JSON', valid);
}

// ─── Part F — Make sure STAGE-3-RELIGIOUS-EXEMPTION-1 patch still present ─
console.log('\n── Part F — STAGE-3-RELIGIOUS-EXEMPTION-1 patch unaffected ──');

ok('source contains STAGE-3-RELIGIOUS-EXEMPTION-1 marker',
    src.includes('STAGE-3-RELIGIOUS-EXEMPTION-1'));
ok('source contains 3-tier policy admin exemption (ADMIN_FEATURES)',
    src.includes("['PPLC', 'PPLA', 'PPLA2', 'PPLA3']") ||
    src.includes('ADMIN_FEATURES'));
ok('source contains religious_alias_only reason',
    src.includes('religious_alias_only'));
ok('decideStatusAndTier remains exported',
    /export function decideStatusAndTier/.test(src));
ok('checkBlocklist remains exported',
    /export function checkBlocklist/.test(src));

// ─── Result ────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
