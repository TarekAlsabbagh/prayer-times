// scripts/geodata/_strategy_e_europe_3_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-EUROPE-3 — approve passes-gate (minus semantic policy)
//
// Strategy E classification produced 257 passes-gate across 20 countries.
// Manual semantic review identified 82 PPLA entries with population
// < 5,000 — these are administrative seats of single-village
// municipalities (mostly in SI/MT/MK/ME/LV/HR), not real cities suitable
// for a prayer-times curated entry. Deferred to EUROPE-3-BLOCKED-REVIEW.
//
// Pristina (XK): clean Arabic gate FAILED ("prysٹyna" has Urdu ٹ).
// Per user policy, XK should win bare `pristina` slug, but the gate
// must hold — deferred to EUROPE-3-BLOCKED-REVIEW for manual Arabic fix.
//
// Final approval set after semantic exclusions:
//   PL: 24, CZ: 7, SK: 3, HU: 4, RO: 22, BG: 15, GR: 5, HR: 6,
//   SI: 9 (59 - 50 tiny), RS: 2, BA: 2, ME: 3 (5 - 2 tiny),
//   MK: 14 (21 - 7 tiny), AL: 9, XK: 2, EE: 3, LV: 18 (20 - 2 tiny),
//   LT: 7, MT: 17 (36 - 19 tiny), CY: 4
//   TOTAL ≈ 176 (will compute exactly at runtime)
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['pl','cz','sk','hu','ro','bg','gr','hr','si','rs','ba','me','mk','al','xk','ee','lv','lt','mt','cy'];
const MIN_POP_FOR_PPLA = 5000;   // PPLA below this is treated as non-city (semantic exclusion)

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
    const excludedBySemantic = {};
    const allApprovedSlugs = new Map();   // slug → cc
    const allApprovedAr = new Map();      // ar → cc/slug (dup check)
    const curated = JSON.parse(fs.readFileSync(pathsFor('pl').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));

    let totalApproved = 0;
    let totalSemanticExcluded = 0;
    const errors = [];

    for (const cc of CCS) {
        const list = JSON.parse(fs.readFileSync(pathsFor(cc).candidatesJson, 'utf8'));
        filesByCc[cc] = list;
        approvedByCc[cc] = [];
        excludedBySemantic[cc] = [];

        for (const e of list) {
            if (e.status === 'approved') continue;                       // idempotency
            if (!(e.status === 'pending' && e.tier === 'high')) continue;
            if (e.pendingAfterArGate !== true) continue;

            const pop = Number(e.candidate.population) || 0;
            const fc  = e.candidate.featureCode;

            // SEMANTIC POLICY: PPLA with pop < 5,000 → defer (too small)
            // PPLC always included regardless of pop (national capital)
            if (fc === 'PPLA' && pop < MIN_POP_FOR_PPLA) {
                excludedBySemantic[cc].push({ slug: e.slug, pop, reason: 'PPLA pop<5k semantic exclusion' });
                totalSemanticExcluded++;
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
                                     errors.push(cc + '/' + e.slug + ': duplicate slug in approved set (also '
                                         + allApprovedSlugs.get(e.slug) + ')');
            if (allApprovedAr.has(arName))
                                     errors.push(cc + '/' + e.slug + ': duplicate Arabic name "' + arName + '" (also '
                                         + allApprovedAr.get(arName) + ')');

            allApprovedSlugs.set(e.slug, cc);
            allApprovedAr.set(arName, cc + '/' + e.slug);
            approvedByCc[cc].push(e);
            totalApproved++;
        }
    }

    console.log('[approve-3] Pre-flight counts:');
    for (const cc of CCS) {
        const got = approvedByCc[cc].length;
        const excl = excludedBySemantic[cc].length;
        console.log('[approve-3]   ' + cc.toUpperCase() + ': approved=' + got + (excl ? '  excluded(pop<5k)=' + excl : ''));
    }
    console.log('[approve-3]   TOTAL approved: ' + totalApproved);
    console.log('[approve-3]   TOTAL semantic-excluded (PPLA pop<5k): ' + totalSemanticExcluded);

    if (errors.length) {
        console.error('[approve-3] FAILED — safety violations:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }

    console.log('[approve-3] All safety checks passed. Flipping status → approved...');
    for (const cc of CCS) {
        for (const e of approvedByCc[cc]) e.status = 'approved';
        fs.writeFileSync(pathsFor(cc).candidatesJson, JSON.stringify(filesByCc[cc], null, 2) + '\n');
        if (approvedByCc[cc].length > 0)
            console.log('[approve-3]   ' + cc.toUpperCase() + ': flipped ' + approvedByCc[cc].length);
    }
    console.log('[approve-3] DONE — ready for Stage 4.');
}

main();
