// scripts/geodata/_strategy_e_europe_1b_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-EUROPE-1B — approve passes-gate + 3 collision-resolved
//
// User decision (verbatim):
//   • approve all 44 passes-gate entries (ES: 35, PT: 9)
//   • apply renames + approve 3 PT collision-blocked entries:
//       - faro       → faro          (PT wins bare slug; ES is needs_review/0-pop)
//       - vila-real  → vila-real-pt  (forward-compat against ES Vila-real pop=50k)
//       - beja       → beja-pt       (Tunisia `beja` already in curated)
//
// Expected merge: ES=35, PT=12 (9 passes + 3 renamed), total=47.
// Final curated count: 1,095 → 1,142.
//
// Safety: refuses to write if any approved entry has:
//   - duplicate slug across the approved set
//   - slug already in curated AFTER rename
//   - empty/dirty Arabic (re-checked)
//   - missing required fields
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['es','pt'];
const EXPECTED_PASSES = { es: 35, pt: 9 };

// Specific collision overrides for this phase (user-decided).
// Per-cc { originalSlug → { newSlug, reason } }.
const COLLISION_RENAMES = {
    pt: {
        'faro':       { newSlug: 'faro',          reason: 'PT wins bare slug (ES Faro is needs_review/zero-pop)' },
        'vila-real':  { newSlug: 'vila-real-pt',  reason: 'Forward-compat: ES Vila-real pop=50k may come in future' },
        'beja':       { newSlug: 'beja-pt',       reason: 'Tunisia beja (باجة) already owns bare slug' }
    },
    es: {}
};

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
    const allApprovedSlugs = new Map();   // newSlug → cc
    const curated = JSON.parse(fs.readFileSync(pathsFor('es').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));

    let totalApproved = 0;
    let totalRenamed = 0;
    const errors = [];

    for (const cc of CCS) {
        const list = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
        filesByCc[cc] = list;
        approvedByCc[cc] = [];

        const renames = COLLISION_RENAMES[cc] || {};

        for (const e of list) {
            // Skip already-approved (idempotency)
            if (e.status === 'approved') continue;

            // Must be high-tier pending
            if (!(e.status === 'pending' && e.tier === 'high')) continue;

            const isPassesGate = e.pendingAfterArGate === true;
            const renameRule   = renames[e.slug];

            if (!isPassesGate && !renameRule) continue;
            // For renameRule entries, we override the collision block
            // BUT still require clean Arabic.

            const arName = e.candidate.names && e.candidate.names.ar;
            const enName = e.candidate.names && e.candidate.names.en;

            if (!arName)             errors.push(cc + '/' + e.slug + ': empty Arabic name');
            else if (!isCleanArabic(arName))
                                     errors.push(cc + '/' + e.slug + ': Arabic not clean ("' + arName + '")');
            if (!enName)             errors.push(cc + '/' + e.slug + ': empty English name');

            // Apply rename if defined
            let finalSlug = e.slug;
            let renamedFrom = null;
            if (renameRule) {
                finalSlug = renameRule.newSlug;
                renamedFrom = e.slug;
                totalRenamed++;
            }

            // For non-renamed passes-gate, the original collision checks already passed.
            // For renamed entries, we MUST verify the NEW slug is collision-free.
            if (curatedSlugs.has(finalSlug)) {
                errors.push(cc + '/' + e.slug + ' → ' + finalSlug + ': new slug already in curated');
            }
            if (allApprovedSlugs.has(finalSlug)) {
                errors.push(cc + '/' + e.slug + ' → ' + finalSlug
                    + ': duplicate in approved set (also ' + allApprovedSlugs.get(finalSlug) + ')');
            }

            allApprovedSlugs.set(finalSlug, cc);
            approvedByCc[cc].push({ entry: e, finalSlug, renamedFrom });
            totalApproved++;
        }
    }

    // Verify expected counts
    const esCount = approvedByCc.es.length;
    const ptCount = approvedByCc.pt.length;
    const expectedTotal = EXPECTED_PASSES.es + EXPECTED_PASSES.pt + Object.keys(COLLISION_RENAMES.pt).length;
    console.log('[approve-1b] Pre-flight counts:');
    console.log('[approve-1b]   ES: expected ' + EXPECTED_PASSES.es + ', got ' + esCount
        + (esCount === EXPECTED_PASSES.es ? ' ✓' : ' ✗'));
    console.log('[approve-1b]   PT: expected ' + (EXPECTED_PASSES.pt + Object.keys(COLLISION_RENAMES.pt).length)
        + ' (' + EXPECTED_PASSES.pt + ' passes + ' + Object.keys(COLLISION_RENAMES.pt).length + ' renamed)'
        + ', got ' + ptCount + (ptCount === EXPECTED_PASSES.pt + Object.keys(COLLISION_RENAMES.pt).length ? ' ✓' : ' ✗'));
    console.log('[approve-1b]   TOTAL: expected ' + expectedTotal + ', got ' + totalApproved
        + (totalApproved === expectedTotal ? ' ✓' : ' ✗'));
    console.log('[approve-1b]   Renames applied: ' + totalRenamed);

    if (esCount !== EXPECTED_PASSES.es ||
        ptCount !== EXPECTED_PASSES.pt + Object.keys(COLLISION_RENAMES.pt).length ||
        totalApproved !== expectedTotal) {
        console.error('[approve-1b] FAILED — count mismatch. Aborting. No JSONs written.');
        process.exit(1);
    }
    if (errors.length) {
        console.error('[approve-1b] FAILED — safety violations:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }

    // All checks pass — flip status + apply renames + write back
    console.log('[approve-1b] All safety checks passed. Applying changes...');
    for (const cc of CCS) {
        const list = filesByCc[cc];
        const renames = [];
        for (const { entry, finalSlug, renamedFrom } of approvedByCc[cc]) {
            entry.status = 'approved';
            if (renamedFrom && finalSlug !== renamedFrom) {
                // Apply rename to both entry.slug AND entry.candidate.slug
                // (Stage 4 reads candidate.slug via candidateToCuratedEntry)
                entry.slug = finalSlug;
                entry.candidate.slug = finalSlug;
                entry.appliedRename = { from: renamedFrom, to: finalSlug };
                renames.push(renamedFrom + ' → ' + finalSlug);
            }
        }
        fs.writeFileSync(pathsFor(cc).candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[approve-1b]   ' + cc.toUpperCase() + ': flipped ' + approvedByCc[cc].length + ' entries'
            + (renames.length ? '; renames: ' + renames.join(', ') : ''));
    }
    console.log('[approve-1b] DONE — ready for Stage 4.');
}

main();
