// scripts/geodata/_strategy_d_apply_prep_maghreb.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA-MAGHREB-1 — Fix-and-approve preparation
//
// User decision: "Fix-and-approve" for 112 Strategy D entries (after
// names.ar corrections for 16 entries + saida → saida-dz rename).
// Western Sahara entries deferred to a separate phase
// (CURATED-GEODATA-WESTERN-SAHARA-DECISION-1).
//
// This script:
//   1. Matches Strategy D entries (same rules as
//      _strategy_d_filter_maghreb.mjs).
//   2. SKIPS Western Sahara entries (MA admin1 ∈ {11, 12}) entirely —
//      they never get flipped to approved.
//   3. Applies the 16 names.ar corrections.
//   4. Applies the saida → saida-dz rename (DZ).
//   5. Flips matching candidates to `status='approved'`.
//
// Idempotent — re-running has no further effect. Does NOT touch
// curated-places.json. Does NOT auto-rename on collision (lesson
// learned from NILE-YEMEN-LIBYA-1's apply-prep bug).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const CCS          = ['ma','dz','tn','mr'];
const CURATED_PATH = path.resolve('db', 'places', 'curated-places.json');

// Strategy D rules — MUST match _strategy_d_filter_maghreb.mjs.
const RULES = {
    ma: { allowedFC: new Set(['PPLC','PPLA','PPLA2','PPL']), minPop: 100000, tierHigh: true, forcePPLA: true },
    dz: { allowedFC: new Set(['PPLC','PPLA','PPL']),         minPop: 50000,  tierHigh: true, forcePPLA: true },
    tn: { allowedFC: new Set(['PPLC','PPLA','PPL']),         minPop: 30000,  tierHigh: true, forcePPLA: true },
    mr: { allowedFC: new Set(['PPLC','PPLA','PPL']),         minPop: 10000,  tierHigh: true, forcePPLA: true }
};

// Western Sahara — skip entirely (deferred to a separate phase).
const WESTERN_SAHARA_ADMIN1 = new Set(['11', '12']);

// names.ar corrections (user-mandated). Keyed by original slug.
// Note on Mascara: GeoNames had "مسکره" (Urdu transliteration). The
// correct Arabic is "معسكر". User explicitly listed this fix.
// Note on el-bayadh: GeoNames had "البلیده" (= Blida — WRONG city!).
// Correct: "البيض". User flagged this as a data swap.
// Note on tipasa: GeoNames had "تبسہ" (= Tebessa — WRONG city!).
// Correct: "تيبازة". User flagged this as a data swap.
const FIX_AR_NAMES = {
    ma: {},
    dz: {
        'djelfa':    'الجلفة',
        'biskra':    'بسكرة',
        'guelma':    'قالمة',
        'mascara':   'معسكر',
        'el-bayadh': 'البيض',
        'bouira':    'البويرة',
        'el-menia':  'المنيعة',
        'tipasa':    'تيبازة'
    },
    tn: {
        'aryanah':   'أريانة',
        'gafsa':     'قفصة',
        'beja':      'باجة',
        'jendouba':  'جندوبة',
        'manouba':   'منوبة',
        'siliana':   'سليانة'
    },
    mr: {
        'kiffa':         'كيفة',
        'tevragh-zeina': 'تفرغ زينة'
    }
};

// Slug renames (user-mandated). Keyed by ORIGINAL slug.
const SLUG_RENAMES = {
    ma: {},
    dz: { 'saida': 'saida-dz' },   // existing MA `saida` already curated
    tn: {},
    mr: {}
};

// FORCE_INCLUDES: user-listed cities that Strategy D's strict filter
// would exclude. Pull them in regardless of pop floor / tier.
//
//   MA `ouarzazate` (PPLA2, pop=77,603) — below the 100k MA floor.
//     User listed it in MA spot-checks. Famous film tourism city +
//     gateway to the High Atlas.
//   MA `tan-tan` (PPLA2, pop=79,942) — below the 100k MA floor.
//     User listed it in MA spot-checks. Provincial capital of
//     Tan-Tan Province in the Guelmim-Oued Noun region.
//   MA `khouribga` (PPLA3, pop=214,241) — feature_code excluded from
//     Strategy D's allowedFC (only PPLC/PPLA/PPLA2/PPL). User listed
//     in MA spot-checks. Major phosphate-mining city.
//   MA `errachidia` (PPLA3, pop=100,870) — same PPLA3 exclusion.
//     User listed in MA spot-checks. Capital of Drâa-Tafilalet region
//     (admin1=08) that GeoNames tagged as PPLA3 instead of PPLA.
const FORCE_INCLUDES = {
    ma: new Set(['ouarzazate', 'tan-tan', 'khouribga', 'errachidia']),
    dz: new Set(),
    tn: new Set(),
    mr: new Set()
};

// ALIAS_FIXES: aliases that need correction in their script (e.g.,
// Persian yeh ی U+06CC instead of Arabic yeh ي U+064A — these prevent
// Arabic-language search from matching).
//
//   MR `nema` had aliases.ar = ["نیما"] with Persian yeh. Search for
//   "نيما" (Arabic yeh, the canonical Arabic form) didn't match, so
//   nema fell out of results. Replace the Persian-yeh alias with the
//   Arabic-yeh form (keep both — old as ALIAS for the rare Persian-
//   yeh searches, new as canonical).
const ALIAS_FIXES = {
    ma: {
        // Curated khouribga.names.ar = "خريبكة" (no definite article).
        // Users naturally type with "ال" prefix: الخريبكة. Add as alias.
        'khouribga': { arAdd: ['الخريبكة'] },
        // Curated errachidia.names.ar = "الرشيدية" (no alif madda after ر).
        // Users frequently type with alif madda: الراشيدية. Add as alias.
        'errachidia': { arAdd: ['الراشيدية'] }
    },
    mr: {
        'nema': {
            arAdd: ['نيما']  // Arabic-yeh form alongside the existing Persian-yeh form
        }
    }
};

function loadCandidates(cc) {
    const p = path.resolve('db', 'places', 'candidates', cc + '-geonames-candidates.json');
    return { path: p, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

function isWesternSahara(cc, e) {
    if (cc !== 'ma') return false;
    const a1 = (e.candidate.admin && e.candidate.admin.admin1Code) || '';
    return WESTERN_SAHARA_ADMIN1.has(a1);
}

function passesStrategyD(cc, e) {
    const rule = RULES[cc];
    const fc   = e.candidate.featureCode;
    const pop  = Number(e.candidate.population) || 0;
    const isPPLA = (fc === 'PPLA' || fc === 'PPLC');
    if (e.status !== 'pending' && e.status !== 'approved') return false;
    // Skip Western Sahara — deferred to separate phase
    if (isWesternSahara(cc, e)) return false;
    // FORCE_INCLUDES override
    if (FORCE_INCLUDES[cc] && FORCE_INCLUDES[cc].has(e.candidate.slug)) return true;
    // forcePPLA: any PPLA/PPLC seat passes
    if (rule.forcePPLA && isPPLA) return true;
    if (!rule.allowedFC.has(fc)) return false;
    if (pop < rule.minPop) return false;
    if (rule.tierHigh && e.tier !== 'high') return false;
    return true;
}

// Ensure the OLD (incorrect) Arabic name lives in aliases.ar so search
// keeps matching it (bookmarks / old links).
function ensureArAlias(cand, oldAr) {
    if (!oldAr) return;
    if (!cand.aliases) cand.aliases = {};
    if (!Array.isArray(cand.aliases.ar)) cand.aliases.ar = [];
    if (!cand.aliases.ar.includes(oldAr)) cand.aliases.ar.push(oldAr);
}

function main() {
    let totalApproved = 0, totalFixedAr = 0, totalRenamed = 0, totalWesternSaharaSkipped = 0;

    for (const cc of CCS) {
        const { path: jsonPath, data: cands } = loadCandidates(cc);
        let approvedCC = 0, fixedArCC = 0, renamedCC = 0, wsSkipped = 0;
        const approvedSlugs = [];

        // First pass — count WS skips for reporting
        for (const e of cands) {
            if (e.status === 'pending' && isWesternSahara(cc, e)) wsSkipped++;
        }
        totalWesternSaharaSkipped += wsSkipped;

        for (const e of cands) {
            if (!passesStrategyD(cc, e)) continue;
            const c = e.candidate;
            const originalSlug = c.slug;

            // 1. Fix bad names.ar
            const arFix = FIX_AR_NAMES[cc][originalSlug];
            if (arFix) {
                const oldAr = c.names && c.names.ar;
                if (oldAr && oldAr !== arFix) ensureArAlias(c, oldAr);
                if (!c.names) c.names = {};
                c.names.ar = arFix;
                fixedArCC++;
            }

            // 2. Apply explicit slug rename ONLY (no auto-rename on
            // collision — lesson learned from NILE-YEMEN-LIBYA-1).
            const finalSlug = SLUG_RENAMES[cc][originalSlug] || originalSlug;
            if (finalSlug !== originalSlug && c.slug !== finalSlug) {
                // Preserve original slug in aliases.en so search keeps
                // matching the GeoNames-native form.
                if (!c.aliases) c.aliases = {};
                if (!Array.isArray(c.aliases.en)) c.aliases.en = [];
                if (!c.aliases.en.includes(originalSlug)) c.aliases.en.push(originalSlug);
                c.slug = finalSlug;
                renamedCC++;
            }

            // 3. Apply alias fixes (script normalization, e.g.
            //    Persian-yeh → Arabic-yeh)
            const aliasFix = ALIAS_FIXES[cc] && ALIAS_FIXES[cc][finalSlug];
            if (aliasFix && aliasFix.arAdd) {
                if (!c.aliases) c.aliases = {};
                if (!Array.isArray(c.aliases.ar)) c.aliases.ar = [];
                for (const a of aliasFix.arAdd) {
                    if (!c.aliases.ar.includes(a)) c.aliases.ar.push(a);
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
                    '· renamed:', renamedCC,
                    '· WS skipped:', wsSkipped);
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
    console.log('[apply-prep] Western Sahara entries skipped:', totalWesternSaharaSkipped, '(deferred)');
    console.log('[apply-prep] ─────────────────────────────────────');
    console.log('[apply-prep] Next: run Stage 4 per country:');
    console.log('  for cc in ma dz tn mr; do');
    console.log('    node scripts/geodata/apply_curated_candidates.mjs $cc');
    console.log('  done');
}

main();
