// scripts/geodata/_strategy_d_apply_prep.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-NILE-YEMEN-LIBYA-1 — Fix-and-approve preparation
//
// User decided: "Fix-and-approve" for all 110 Strategy D entries.
//
// This script flips matching candidates to `status='approved'` AFTER
// applying:
//   1. names.ar corrections for the 11 entries flagged by Strategy D's
//      "Data Quality" section (GeoNames stored Urdu transliterations or
//      a different city's name in `name:ar` for these).
//   2. Slug renames for the 2 known collisions:
//        rafah        → rafah-eg     (collides with PS rafah)
//        al-aziziyah  → al-aziziyah-ly (collides with IQ al-aziziyah)
//      The aliases.ar are also extended where the corrected Arabic name
//      differs from any existing alias, so search keeps working.
//
// After this runs, the existing apply script can be used unchanged:
//   node scripts/geodata/apply_curated_candidates.mjs eg
//   node scripts/geodata/apply_curated_candidates.mjs sd
//   node scripts/geodata/apply_curated_candidates.mjs ly
//   node scripts/geodata/apply_curated_candidates.mjs ye
//
// This script does NOT touch curated-places.json. Only candidate JSONs.
// Idempotent: re-running has no further effect.
//
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CCS          = ['eg','sd','ly','ye'];
const CURATED_PATH = path.resolve('db', 'places', 'curated-places.json');

// Strategy D rules — must match _strategy_d_filter.mjs EXACTLY,
// PLUS one EG correction: forcePPLA=true so governorate capitals like
// Damanhur (Beheira, pop 318k), Beni Suef (Beni Suef, pop 273k), Banha
// (Qalyubia), Kafr El Sheikh, Damietta, Marsa Matruh, Arish (North
// Sinai), El-Tor (South Sinai), Shebin El-Kom (Monufia), and Kharga
// (New Valley) get pulled in regardless of the validator's `tier=low`
// assignment (which falls out of `isAdminOrPPL` excluding PPLA). The
// user listed Damanhur + Beni Suef in their EG test list and clearly
// expected them in curated — consistent with how SD and LY treat their
// PPLA seats. Same change is reflected in the report filter for
// consistency (see _strategy_d_filter.mjs).
const RULES = {
    eg: { allowedFC: new Set(['PPLC','PPLA','PPLA2','PPL']), minPop: 100000, tierHigh: true,  forcePPLA: true  },
    sd: { allowedFC: new Set(['PPLC','PPLA','PPL']),         minPop: 30000,  tierHigh: false, forcePPLA: true  },
    ly: { allowedFC: new Set(['PPLC','PPLA','PPL']),         minPop: 30000,  tierHigh: true,  forcePPLA: true  },
    ye: { allowedFC: new Set(['PPLC','PPLA','PPLA2']),       minPop: 1,      tierHigh: true,  forcePPLA: false }
};

// Names.ar corrections for the 11 entries the user explicitly listed.
// Keyed by the candidate's ORIGINAL slug (before rename).
const FIX_AR_NAMES = {
    eg: {
        'al-ashir-min-ramadan': 'العاشر من رمضان'
    },
    sd: {
        'singa':       'سنجة',
        'al-junaynah': 'الجنينة',
        'rabak':       'ربك',        // already 'ربک' with Urdu kaf — fix to Arabic kaf
        'zalinjay':    'زالنجي',
        'al-fulah':    'الفولة',
        'kosti':       'كوستي'        // GeoNames had 'ربك' (wrong city) — fix to Kosti's proper Arabic
    },
    ly: {
        'darnah':       'درنة',
        'al-aziziyah':  'العزيزية',   // matched by ORIGINAL slug, before rename to al-aziziyah-ly
        'zuwarah':      'زوارة',
        'zintan':       'الزنتان'
    },
    ye: {}
};

// Slug renames (per user's mandate + auto-rename for the LY case).
// Keyed by ORIGINAL slug.
const SLUG_RENAMES = {
    eg: { 'rafah': 'rafah-eg' },
    sd: {},
    ly: { 'al-aziziyah': 'al-aziziyah-ly' },
    ye: {}
};

// ALIAS_REMOVALS: aliases to STRIP from candidates before merge to
// prevent search-confusion with already-curated cities. GeoNames stores
// every transliteration variant it encounters, some of which collide
// with the canonical English spelling of unrelated, more famous cities.
//
// Example: LY `al-khums` (الخمس) had `Homs` in its aliases.en — when a
// user searched "Homs" in English the LY entry won the score tie over
// the canonical SY `homs` (حمص), purely on alias coverage. Stripping
// these conflict aliases keeps the more famous canonical city as the
// top result. Each removed alias remains searchable via the entry's
// other variants (Al Khums, Khums, Khoms, Lebda, etc.).
const ALIAS_REMOVALS = {
    ly: {
        'al-khums': { en: ['Homs', 'El Choms', 'El Hums', 'El Xums', 'Humsas'] }
    }
};

// FORCE_INCLUDES: entries the user explicitly listed in their spot-check
// suite but which Strategy D's filter rules would otherwise exclude.
// Adding them here pulls them into the approved set regardless of pop
// floor or tier. Each entry is keyed by ORIGINAL slug.
//
//   EG `rafah` (pop=44k < 100k floor → would be excluded) — user listed
//   "رفح" in EG tests AND mentioned the `rafah-eg` rename rule. Force
//   include + rename.
//
//   YE `seiyun` (pop=0 from GeoNames is wrong — Sayun in Hadhramaut has
//   ~50k pop. The validator put it as tier=medium so Strategy A
//   excluded it.) — user listed "سيئون" in YE tests. Force include.
const FORCE_INCLUDES = {
    eg: new Set(['rafah']),
    sd: new Set(),
    ly: new Set(),
    ye: new Set(['seiyun'])
};

function loadCandidates(cc) {
    const p = path.resolve('db', 'places', 'candidates', cc + '-geonames-candidates.json');
    return { path: p, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

function passesStrategyD(cc, e) {
    const rule = RULES[cc];
    const fc   = e.candidate.featureCode;
    const pop  = Number(e.candidate.population) || 0;
    const isPPLA = (fc === 'PPLA' || fc === 'PPLC');
    if (e.status !== 'pending' && e.status !== 'approved') return false;
    // FORCE_INCLUDES: user-listed cities bypass the rule entirely
    if (FORCE_INCLUDES[cc] && FORCE_INCLUDES[cc].has(e.candidate.slug)) return true;
    // forcePPLA branch: any PPLA/PPLC seat passes
    if (rule.forcePPLA && isPPLA) return true;
    if (!rule.allowedFC.has(fc)) return false;
    if (pop < rule.minPop) return false;
    if (rule.tierHigh && e.tier !== 'high') return false;
    return true;
}

// Ensure the corrected Arabic name is also present in aliases.ar so that
// search continues to match the OLD (incorrect) form too — this protects
// any external link or bookmark that already used the GeoNames Urdu form.
function ensureArAlias(cand, oldAr) {
    if (!oldAr) return;
    if (!cand.aliases) cand.aliases = {};
    if (!Array.isArray(cand.aliases.ar)) cand.aliases.ar = [];
    if (!cand.aliases.ar.includes(oldAr)) {
        cand.aliases.ar.push(oldAr);
    }
}

function main() {
    const curated = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf8'));
    const existingSlugs = new Set(curated.map(x => x.slug));

    let totalApproved = 0;
    let totalFixedAr  = 0;
    let totalRenamed  = 0;

    for (const cc of CCS) {
        const { path: jsonPath, data: cands } = loadCandidates(cc);
        let approvedCC = 0, fixedArCC = 0, renamedCC = 0;
        const approvedSlugs = [];

        for (const e of cands) {
            if (!passesStrategyD(cc, e)) continue;
            const c = e.candidate;
            const originalSlug = c.slug;

            // 1. Fix bad names.ar if applicable
            const arFix = FIX_AR_NAMES[cc][originalSlug];
            if (arFix) {
                const oldAr = c.names && c.names.ar;
                if (oldAr && oldAr !== arFix) {
                    ensureArAlias(c, oldAr);
                }
                if (!c.names) c.names = {};
                c.names.ar = arFix;
                fixedArCC++;
            }

            // 2. Apply slug rename ONLY when explicitly listed in
            //    SLUG_RENAMES. We DO NOT auto-rename on collision —
            //    auto-rename is dangerous on re-runs because the
            //    previously-merged entries appear "in curated" and
            //    would double-rename (e.g. al-aziziyah-ly → al-aziziyah-ly-ly).
            //    Strategy 3D collisions are surfaced by the report; the
            //    user explicitly adds them to SLUG_RENAMES here. Apply
            //    is idempotent because every entry stays under its
            //    pre-determined slug.
            const finalSlug = SLUG_RENAMES[cc][originalSlug] || originalSlug;
            if (finalSlug !== originalSlug && c.slug !== finalSlug) {
                // Preserve the original slug in aliases.en so search finds
                // it via the GeoNames-native form too.
                if (!c.aliases) c.aliases = {};
                if (!Array.isArray(c.aliases.en)) c.aliases.en = [];
                if (!c.aliases.en.includes(originalSlug)) c.aliases.en.push(originalSlug);
                c.slug = finalSlug;
                renamedCC++;
            }

            // 3. Strip ambiguous aliases (per ALIAS_REMOVALS dict)
            const removeRule = ALIAS_REMOVALS[cc] && ALIAS_REMOVALS[cc][c.slug];
            if (removeRule && c.aliases) {
                for (const langKey of Object.keys(removeRule)) {
                    const block = new Set(removeRule[langKey]);
                    if (Array.isArray(c.aliases[langKey])) {
                        c.aliases[langKey] = c.aliases[langKey].filter(a => !block.has(a));
                    }
                }
            }

            // 4. Flip to approved (idempotent)
            if (e.status !== 'approved') {
                e.status = 'approved';
                e.reason = 'strategy_d_approved_by_user';
            }
            approvedSlugs.push(finalSlug);
            approvedCC++;
        }

        // Write back
        fs.writeFileSync(jsonPath, JSON.stringify(cands, null, 2) + '\n');

        console.log('[apply-prep]', cc.toUpperCase(),
                    '— approved:', approvedCC,
                    '· fixed_ar:', fixedArCC,
                    '· renamed:', renamedCC);
        console.log('             slugs:', approvedSlugs.join(', '));
        totalApproved += approvedCC;
        totalFixedAr  += fixedArCC;
        totalRenamed  += renamedCC;
    }

    console.log('');
    console.log('[apply-prep] ─────────────────────────────────────');
    console.log('[apply-prep] TOTAL approved:', totalApproved);
    console.log('[apply-prep] TOTAL fixed_ar:', totalFixedAr);
    console.log('[apply-prep] TOTAL renamed:', totalRenamed);
    console.log('[apply-prep] ─────────────────────────────────────');
    console.log('[apply-prep] Next: run Stage 4 per country:');
    console.log('  for cc in eg sd ly ye; do');
    console.log('    node scripts/geodata/apply_curated_candidates.mjs $cc');
    console.log('  done');
}

main();
