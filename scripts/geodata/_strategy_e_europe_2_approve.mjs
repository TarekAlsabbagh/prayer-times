// scripts/geodata/_strategy_e_europe_2_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-EUROPE-2 — approve passes-gate (minus 2 manual exclusions)
//
// Strategy E classification produced 121 passes-gate entries. During
// manual quality review (Strategy E §3: "الاسم العربي مناسب وشائع قدر
// الإمكان"), 2 IT entries were flagged for semantic correctness even
// though they pass the script-only gate:
//
//   it/trieste → "إسطاجانكو" — factually wrong (correct ≈ تريستا)
//   it/foggia  → "بيرودجا"   — duplicate of Perugia's Arabic name
//                              (correct ≈ فوجا)
//
// Both deferred to `EUROPE-2-BLOCKED-REVIEW` for manual ar-name fix.
//
// Final approval set:
//   DE=47, AT=4, CH=13, IT=20 (22-2), DK=2, SE=10, NO=6, FI=14, IS=3
//   TOTAL = 119
//
// Curated total: 1,142 → 1,261.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['de','at','ch','it','dk','se','no','fi','is'];
const EXPECTED_PASSES = { de: 47, at: 4, ch: 13, it: 22, dk: 2, se: 10, no: 6, fi: 14, is: 3 };
const MANUAL_EXCLUSIONS = {
    it: new Set(['trieste','foggia'])    // wrong/duplicate Arabic; deferred for fix
};
const EXPECTED_MERGED = { de: 47, at: 4, ch: 13, it: 20, dk: 2, se: 10, no: 6, fi: 14, is: 3 };
const EXPECTED_TOTAL_MERGED = 119;

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN_IN_AR = /[A-Za-z]/;

function isCleanArabic(name) {
    if (!name) return false;
    const stripped = String(name).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN_IN_AR.test(stripped))  return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

function main() {
    const filesByCc = {};
    const approvedByCc = {};
    const excludedByCc = {};
    const allApprovedSlugs = new Map();   // slug → cc
    const curated = JSON.parse(fs.readFileSync(pathsFor('de').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));

    let totalApproved = 0;
    let totalExcluded = 0;
    const errors = [];

    for (const cc of CCS) {
        const list = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
        filesByCc[cc] = list;
        approvedByCc[cc] = [];
        excludedByCc[cc] = [];

        const exclusions = MANUAL_EXCLUSIONS[cc] || new Set();

        for (const e of list) {
            if (e.status === 'approved') continue;                       // idempotency
            if (!(e.status === 'pending' && e.tier === 'high')) continue;
            if (e.pendingAfterArGate !== true) continue;

            if (exclusions.has(e.slug)) {
                excludedByCc[cc].push(e.slug);
                totalExcluded++;
                continue;
            }

            const arName = e.candidate.names && e.candidate.names.ar;
            const enName = e.candidate.names && e.candidate.names.en;

            if (!arName)             errors.push(cc + '/' + e.slug + ': empty Arabic name');
            else if (!isCleanArabic(arName))
                                     errors.push(cc + '/' + e.slug + ': Arabic not clean ("' + arName + '")');
            if (!enName)             errors.push(cc + '/' + e.slug + ': empty English name');
            if (curatedSlugs.has(e.slug))
                                     errors.push(cc + '/' + e.slug + ': slug already in curated');
            if (allApprovedSlugs.has(e.slug))
                                     errors.push(cc + '/' + e.slug + ': duplicate in approved set (also '
                                         + allApprovedSlugs.get(e.slug) + ')');

            allApprovedSlugs.set(e.slug, cc);
            approvedByCc[cc].push(e);
            totalApproved++;
        }
    }

    // Verify counts
    console.log('[approve-2] Pre-flight counts:');
    let countMismatch = false;
    for (const cc of CCS) {
        const got = approvedByCc[cc].length;
        const exp = EXPECTED_MERGED[cc];
        const excl = excludedByCc[cc].length;
        const mark = got === exp ? '✓' : '✗';
        if (got !== exp) countMismatch = true;
        console.log('[approve-2]   ' + cc.toUpperCase() + ': expected ' + exp + ', got ' + got
            + (excl ? ' (excluded: ' + excludedByCc[cc].join(', ') + ')' : '') + ' ' + mark);
    }
    console.log('[approve-2]   TOTAL: expected ' + EXPECTED_TOTAL_MERGED + ', got ' + totalApproved
        + ' (excluded ' + totalExcluded + ')'
        + (totalApproved === EXPECTED_TOTAL_MERGED ? ' ✓' : ' ✗'));

    if (countMismatch || totalApproved !== EXPECTED_TOTAL_MERGED) {
        console.error('[approve-2] FAILED — count mismatch. Aborting.');
        process.exit(1);
    }
    if (errors.length) {
        console.error('[approve-2] FAILED — safety violations:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }

    console.log('[approve-2] All safety checks passed. Flipping status → approved...');
    for (const cc of CCS) {
        for (const e of approvedByCc[cc]) e.status = 'approved';
        fs.writeFileSync(pathsFor(cc).candidatesJson, JSON.stringify(filesByCc[cc], null, 2) + '\n');
        console.log('[approve-2]   ' + cc.toUpperCase() + ': flipped ' + approvedByCc[cc].length);
    }
    console.log('[approve-2] DONE — ready for Stage 4.');
}

main();
