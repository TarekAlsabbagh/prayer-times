// scripts/geodata/_strategy_e_europe_1a_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-EUROPE-1A — approve only `pendingAfterArGate === true`
//
// This script is the bridge between Stage 3.5 (Arabic-Quality Gate) and
// Stage 4 (apply). It:
//
//   1. Reads each candidates JSON for [gb, ie, fr, be, nl, lu].
//   2. For every entry where status==='pending' AND tier==='high' AND
//      pendingAfterArGate===true, flips status to 'approved'.
//   3. Pre-merge safety verification (defense in depth):
//        - No duplicate slug across all approved entries.
//        - No slug already in curated.
//        - No collisionInWave on any approved entry.
//        - No collisionAgainstCurated on any approved entry.
//        - Arabic name passes pure-Arabic regex.
//        - All required fields present.
//   4. If ANY safety check fails, refuses to write and exits with code 1.
//   5. Otherwise writes back the candidates JSONs and prints per-country
//      approval counts.
//
// The user explicitly approved 84 passes-gate entries.
// Expected counts: GB=44, IE=2, FR=19, BE=6, NL=11, LU=2 → 84 total.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['gb','ie','fr','be','nl','lu'];
const EXPECTED = { gb: 44, ie: 2, fr: 19, be: 6, nl: 11, lu: 2 };

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN_IN_AR = /[A-Za-z]/;

function isCleanArabic(name) {
    if (!name) return false;
    const stripped = String(name).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN_IN_AR.test(stripped))  return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

function main() {
    // Phase A: read everything, build the prospective approved set
    const filesByCc  = {};
    const approvedByCc = {};
    const allApprovedSlugs = new Map();   // slug → cc (for cross-cc dup detection)
    const curated = JSON.parse(fs.readFileSync(pathsFor('gb').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));

    let totalApproved = 0;
    const errors = [];

    for (const cc of CCS) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        filesByCc[cc]    = list;
        approvedByCc[cc] = [];

        for (const e of list) {
            const shouldApprove =
                e.status === 'pending' &&
                e.tier   === 'high' &&
                e.pendingAfterArGate === true;
            if (!shouldApprove) continue;

            // Defense in depth — verify the entry would still pass the gate
            const arName = e.candidate.names && e.candidate.names.ar;
            const enName = e.candidate.names && e.candidate.names.en;

            if (!arName)               errors.push(cc + '/' + e.slug + ': empty Arabic name');
            else if (!isCleanArabic(arName))
                                       errors.push(cc + '/' + e.slug + ': Arabic not clean ("' + arName + '")');
            if (!enName)               errors.push(cc + '/' + e.slug + ': empty English name');
            if (e.collisionInWave)     errors.push(cc + '/' + e.slug + ': flagged collisionInWave');
            if (e.collisionAgainstCurated)
                                       errors.push(cc + '/' + e.slug + ': flagged collisionAgainstCurated');
            if (curatedSlugs.has(e.slug))
                                       errors.push(cc + '/' + e.slug + ': slug already in curated');
            if (allApprovedSlugs.has(e.slug))
                                       errors.push(cc + '/' + e.slug + ': duplicate slug in approved set (also '
                                           + allApprovedSlugs.get(e.slug) + ')');

            allApprovedSlugs.set(e.slug, cc);
            approvedByCc[cc].push(e);
            totalApproved++;
        }
    }

    // Phase B: verify counts match expectations
    console.log('[approve] Pre-flight counts:');
    let countMismatch = false;
    for (const cc of CCS) {
        const got = approvedByCc[cc].length;
        const exp = EXPECTED[cc];
        const mark = got === exp ? '✓' : '✗';
        if (got !== exp) countMismatch = true;
        console.log('[approve]   ' + cc.toUpperCase() + ': expected ' + exp + ', got ' + got + ' ' + mark);
    }
    console.log('[approve]   TOTAL: expected 84, got ' + totalApproved
        + ' ' + (totalApproved === 84 ? '✓' : '✗'));

    if (countMismatch || totalApproved !== 84) {
        console.error('[approve] FAILED — count mismatch. Aborting flip. No JSONs written.');
        process.exit(1);
    }
    if (errors.length) {
        console.error('[approve] FAILED — safety violations:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }

    // Phase C: all checks pass — flip status to 'approved' and write back
    console.log('[approve] All safety checks passed. Flipping status → approved...');
    for (const cc of CCS) {
        const list = filesByCc[cc];
        for (const e of approvedByCc[cc]) {
            e.status = 'approved';
        }
        fs.writeFileSync(pathsFor(cc).candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[approve]   ' + cc.toUpperCase() + ': flipped ' + approvedByCc[cc].length + ' entries');
    }
    console.log('[approve] DONE — ready to run Stage 4 per country.');
}

main();
