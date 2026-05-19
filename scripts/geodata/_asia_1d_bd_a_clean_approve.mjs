// scripts/geodata/_asia_1d_bd_a_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-BD-A (Fast Track) — clean-approve + anomaly-override for first
// Bangladesh geodata wave.
//
// User-approved 2026-05-19 per:
//   reports/asia-1d-bd-a-plan.md
//
// SCOPE: 13 cities = 10 high-tier pending + 3 anomaly-resolved
//   - 10 normal high-tier (gazipur/comilla/bagerhat/mymensingh/bogra/
//     jamalpur/habiganj/feni/netrakona/lalmonirhat)
//   - rangpur (PPLA pop=1M) — was REJECTED via religious-keyword false
//     positive ("Mosque Rangpur" in aliases.en); override → approved
//   - nilphamari + gaibandha (PPLA2 pop=0) — were pending low (admin
//     centers); override → high
//
// EXCLUDED:
//   - barishal PPLA pop=202k — DUPLICATE of curated `barisal` (1.76 km);
//     handled separately via PLACE-NAMES-ALIASES-BD-SEED-1 (future phase)
//   - chandpur + 63 other pop≥50k PPLs — in needs_review (missing AR);
//     deferred to ASIA-1D-BD-MISSING-AR-MAJORS-1A (future)
//
// Per user's 11-point apply rules (2026-05-19):
//   1. BATCH-A only — 13 cities; no others
//   2. Don't merge barishal (duplicate of barisal)
//   3. Don't touch 6 existing BD seed entries
//   4. Don't touch names.bn / aliases.bn (separate PLACE-NAMES-BN-BD-1 phase)
//   5. Don't change server.js / js/app.js / fillLangMap / index.html
//   6. No runtime translation
//   7. No fake localized fillchain (apply_curated_candidates.mjs guard enforces)
//   8. names.ar + names.en only for new entries
//   9. Drop "Mosque Rangpur" alias.en (prevents religious-keyword false-positive recurrence)
//  10. Add Cumilla (alias.en for comilla) + Bogura (alias.en for bogra) — 2018 renames
//  11. NO Brunei data (bn-* files untouched)
//
// Mutates only bd-geonames-candidates.json (flips 13 entries to approved
// + sets names.ar + manages aliases). Stage 4 (apply_curated_candidates.mjs)
// runs separately to actually merge into curated-places.json.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'bd';

// ─── Script-purity helpers (mirror PK MAJORS-1A) ─────────────────────────
const PERSIAN_URDU       = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
const LATIN              = /[A-Za-z]/;
const URDU_NUN_GHUNNA    = /[ں]/;
const PASHTO_SINDHI      = /[ټېڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanArabic(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped))     return false;
    if (LATIN.test(stripped))            return false;
    if (URDU_NUN_GHUNNA.test(stripped))  return false;
    if (PASHTO_SINDHI.test(stripped))    return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// ═══ 13 BATCH-A FIXES — user-approved per asia-1d-bd-a-plan.md §5 ══════════
// startState:
//   'pending-high'  — already pending tier=high; clean approve
//   'pending-low'   — anomaly B: promote nilphamari/gaibandha PPLA2 from low
//   'rejected'      — anomaly C: override rangpur religious-false-positive
const FIXES = [
    // ────── 10 high-tier pending ──────
    { slug: 'gazipur',     fc: 'PPLA2', newAr: 'غازيبور',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=2.67M Dhaka Div; PROMOTE clean alias' },

    { slug: 'comilla',     fc: 'PPL',   newAr: 'كوميلا',
      addAliasesEn: ['Cumilla'], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=1.03M Chittagong Div; +Cumilla 2018 rename' },

    { slug: 'bagerhat',    fc: 'PPLA2', newAr: 'باغرهات',
      addAliasesEn: [], dropAliasesEn: [], addAliasesAr: ['باغر هات'],
      startState: 'pending-high', note: 'pop=266k Khulna Div; +spaced AR variant' },

    { slug: 'mymensingh',  fc: 'PPLA',  newAr: 'ميمنسينغ',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=225k Mymensingh Div (admin1=H)' },

    { slug: 'bogra',       fc: 'PPL',   newAr: 'بوغرا',
      addAliasesEn: ['Bogura'], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=210k Rajshahi Div; +Bogura 2018 rename' },

    { slug: 'jamalpur',    fc: 'PPLA2', newAr: 'جمالبور',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=168k Mymensingh Div; primary already clean' },

    { slug: 'habiganj',    fc: 'PPL',   newAr: 'حبيغنج',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=89k Sylhet Div; PROMOTE (Bengali গ→غ)' },

    { slug: 'feni',        fc: 'PPL',   newAr: 'فيني',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=84k Chittagong Div; PROMOTE clean alias' },

    { slug: 'netrakona',   fc: 'PPLA2', newAr: 'نيتراكونا',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-high', note: 'pop=79k Mymensingh Div; MANUAL standard AR' },

    { slug: 'lalmonirhat', fc: 'PPLA2', newAr: 'لالمونيرهات',
      addAliasesEn: [], dropAliasesEn: [], addAliasesAr: ['لال منير هات'],
      startState: 'pending-high', note: 'pop=65k Rangpur Div; +spaced AR variant' },

    // ────── 3 anomaly-resolved cities ──────
    { slug: 'rangpur',     fc: 'PPLA',  newAr: 'رنغبور',
      addAliasesEn: [], dropAliasesEn: ['Mosque Rangpur'],
      addAliasesAr: ['رانجبور'],
      startState: 'rejected',
      anomalyOverride: 'religious_false_positive',
      note: 'pop=1.03M Rangpur Div; ANOMALY C — drop "Mosque Rangpur" alias to prevent regression' },

    { slug: 'nilphamari',  fc: 'PPLA2', newAr: 'نيلفاماري',
      addAliasesEn: [], dropAliasesEn: [],
      startState: 'pending-low',
      anomalyOverride: 'low_tier_admin_promotion',
      note: 'pop=0 PPLA2 Rangpur Div admin center; promote low→high' },

    { slug: 'gaibandha',   fc: 'PPLA2', newAr: 'غايباندا',
      addAliasesEn: [], dropAliasesEn: [], addAliasesAr: ['غيبندا'],
      startState: 'pending-low',
      anomalyOverride: 'low_tier_admin_promotion',
      note: 'pop=0 PPLA2 Rangpur Div admin center; promote low→high' },
];

// ─── Slugs we MUST NOT include (deferred to other phases) ────────────────
const DROP_SLUGS = new Set([
    'barishal',     // DUPLICATE of curated `barisal` (1.76 km away); → alias-enrichment phase
    'chandpur',     // pop=203k PPLA2 in needs_review; → ASIA-1D-BD-MISSING-AR-MAJORS-1A
    'magura',       // pop=0 PPLA2 in needs_review; → MAJORS-1A
    'jessore',      // pop=244k PPL in needs_review (Jashore 2018 rename); → MAJORS-1A
    'coxs-bazar',   // pop=254k PPL in needs_review; → MAJORS-1A
]);

// Aliases.en strings to forcibly drop globally (regardless of slug)
// "Mosque Rangpur" is in rangpur's aliases — would re-trigger religious
// keyword false-positive on any future Stage 3 re-run.
const GLOBAL_DROP_ALIASES_EN = new Set(['Mosque Rangpur']);

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenAr = new Map();
    for (const f of FIXES) {
        if (DROP_SLUGS.has(f.slug)) errors.push('FIXES targets DROP_SLUG: ' + f.slug);
        if (seenSlugs.has(f.slug))  errors.push('Duplicate slug: ' + f.slug);
        seenSlugs.add(f.slug);

        if (!isCleanArabic(f.newAr)) {
            errors.push(f.slug + ' → newAr="' + f.newAr + '" failed clean-Arabic check');
        }
        if (seenAr.has(f.newAr)) {
            errors.push('DUP-AR: "' + f.newAr + '" used by ' + seenAr.get(f.newAr) + ' AND ' + f.slug);
        }
        seenAr.set(f.newAr, f.slug);

        // Validate aliases too
        for (const a of (f.addAliasesAr || [])) {
            if (!isCleanArabic(a)) {
                errors.push(f.slug + ' addAliasesAr "' + a + '" failed clean-Arabic check');
            }
        }
    }
    if (errors.length) {
        console.error('[bd-a] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[bd-a] pre-flight OK — ' + FIXES.length + ' fixes validated');

    // ─── Cross-check against existing curated BD entries ───
    const curated = JSON.parse(fs.readFileSync(
        'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json', 'utf8'));
    const bdExisting = curated.filter(x => x.countryCode === 'bd');
    const existingArSet = new Set(bdExisting.map(e => e && e.names && e.names.ar).filter(Boolean));
    const existingSlugSet = new Set(bdExisting.map(e => e.slug));

    const collisions = [];
    for (const f of FIXES) {
        if (existingArSet.has(f.newAr)) {
            collisions.push('Arabic collision: "' + f.newAr + '" already used by existing BD entry');
        }
        if (existingSlugSet.has(f.slug)) {
            collisions.push('Slug collision: bd/' + f.slug + ' already exists in curated');
        }
    }
    if (collisions.length) {
        console.error('[bd-a] FAILED cross-check against existing 6 BD curated:');
        for (const c of collisions) console.error('  - ' + c);
        process.exit(1);
    }
    console.log('[bd-a] cross-check OK — no collision with 6 existing BD entries');

    // ─── Load candidates JSON ───
    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    const stats = {
        approvedNew: 0,
        skippedIdempotent: 0,
        slugNotFound: [],
        anomalyOverrides: 0,
        aliasesEnDropped: 0,
        aliasesEnAdded: 0,
        aliasesArAdded: 0,
        nameArFixed: 0
    };
    const approvedRows = [];

    for (const fix of FIXES) {
        // Find the target candidate. Match by slug + featureCode for uniqueness
        // (handles the case where same slug appears multiple times with different fc).
        let matches = list.filter(e => e.slug === fix.slug && e.candidate &&
            e.candidate.featureCode === fix.fc);

        if (!matches.length) {
            stats.slugNotFound.push(fix.slug + ' (fc=' + fix.fc + ')');
            continue;
        }

        // Filter by acceptable start states
        const acceptableStates = (() => {
            switch (fix.startState) {
                case 'pending-high':
                    return ['pending'];   // tier should be high
                case 'pending-low':
                    return ['pending'];   // tier should be low (anomaly override)
                case 'rejected':
                    return ['rejected'];  // anomaly override
                default:
                    return ['pending', 'rejected'];
            }
        })();

        // Also accept already-approved with target AR (idempotent re-run)
        const stateMatch = matches.find(e =>
            acceptableStates.includes(e.status) ||
            (e.status === 'approved' && e.candidate.names.ar === fix.newAr)
        );

        if (!stateMatch) {
            stats.slugNotFound.push(fix.slug + ' (fc=' + fix.fc + ', startState=' + fix.startState + ' — found ' + matches.map(m => m.status).join(',') + ')');
            continue;
        }

        // Idempotent: already-applied
        if (stateMatch.status === 'approved' && stateMatch.candidate.names.ar === fix.newAr) {
            console.log('[bd-a] bd/' + fix.slug.padEnd(15) + ' SKIP (already applied)');
            stats.skippedIdempotent++;
            continue;
        }

        const oldStatus = stateMatch.status;
        const oldAr = stateMatch.candidate.names.ar || '(empty)';
        const oldTier = stateMatch.tier || '(none)';

        // ── Apply name.ar fix ──
        stateMatch.candidate.names.ar = fix.newAr;
        stats.nameArFixed++;

        // ── Manage aliases.en ──
        const currentAliasesEn = (stateMatch.candidate.aliases && stateMatch.candidate.aliases.en) || [];
        let cleanedAliasesEn = currentAliasesEn.filter(a => {
            if (GLOBAL_DROP_ALIASES_EN.has(a)) {
                stats.aliasesEnDropped++;
                return false;
            }
            if ((fix.dropAliasesEn || []).includes(a)) {
                stats.aliasesEnDropped++;
                return false;
            }
            return true;
        });
        for (const newAlias of (fix.addAliasesEn || [])) {
            if (!cleanedAliasesEn.includes(newAlias)) {
                cleanedAliasesEn.push(newAlias);
                stats.aliasesEnAdded++;
            }
        }

        // ── Manage aliases.ar (drop polluted + add user-test variants) ──
        const currentAliasesAr = (stateMatch.candidate.aliases && stateMatch.candidate.aliases.ar) || [];
        let cleanedAliasesAr = currentAliasesAr.filter(a => isCleanArabic(a) && a !== fix.newAr);
        for (const newAr of (fix.addAliasesAr || [])) {
            if (!cleanedAliasesAr.includes(newAr) && newAr !== fix.newAr) {
                cleanedAliasesAr.push(newAr);
                stats.aliasesArAdded++;
            }
        }

        if (!stateMatch.candidate.aliases) stateMatch.candidate.aliases = {};
        stateMatch.candidate.aliases.en = cleanedAliasesEn;
        stateMatch.candidate.aliases.ar = cleanedAliasesAr;

        // ── Flip status + tier ──
        stateMatch.status = 'approved';
        stateMatch.tier = 'high';
        stateMatch.pendingAfterArGate = true;
        stateMatch.arQuality = {
            quality: 'manual',
            detail: 'user-supplied Arabic via ASIA-1D-BD-A (plan ref: reports/asia-1d-bd-a-plan.md)',
            fromArTag: false
        };
        if (fix.anomalyOverride) {
            stateMatch.anomalyOverride = fix.anomalyOverride;
            stats.anomalyOverrides++;
        }

        stats.approvedNew++;
        approvedRows.push({
            slug: fix.slug,
            fc: fix.fc,
            pop: stateMatch.candidate.population || 0,
            oldStatus,
            oldTier,
            oldAr,
            newAr: fix.newAr,
            anomaly: fix.anomalyOverride || ''
        });
        console.log('[bd-a] bd/' + fix.slug.padEnd(15) +
            ' [' + oldStatus.padEnd(13) + ' ' + oldTier.padEnd(4) + '] → approved/high' +
            (fix.anomalyOverride ? ' [' + fix.anomalyOverride + ']' : '') +
            '  ar:"' + oldAr.slice(0, 16).padEnd(16) + '" → "' + fix.newAr + '"');
    }

    if (stats.slugNotFound.length) {
        console.error('[bd-a] FAILED — slugs not found in candidates:');
        for (const s of stats.slugNotFound) console.error('  - ' + s);
        process.exit(1);
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-BD-A — Apply Summary ═══');
    console.log('  Approved (new):              ' + stats.approvedNew);
    console.log('  Skipped (idempotent):        ' + stats.skippedIdempotent);
    console.log('  name.ar fixes applied:       ' + stats.nameArFixed);
    console.log('  Anomaly overrides:           ' + stats.anomalyOverrides + ' (rangpur, nilphamari, gaibandha)');
    console.log('  aliases.en dropped:          ' + stats.aliasesEnDropped + ' (incl. "Mosque Rangpur")');
    console.log('  aliases.en added:            ' + stats.aliasesEnAdded + ' (Cumilla, Bogura)');
    console.log('  aliases.ar added:            ' + stats.aliasesArAdded);
    console.log('  DROP_SLUGS (deferred):       ' + DROP_SLUGS.size + ' (' + [...DROP_SLUGS].join(', ') + ')');
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        const anom = r.anomaly ? '  [' + r.anomaly + ']' : '';
        console.log('  bd/' + r.slug.padEnd(15)
            + '  pop=' + String(r.pop).padStart(9)
            + '  ' + r.fc.padEnd(6)
            + '  ar="' + r.newAr + '"' + anom);
    }
    console.log('');
    console.log('Ready for Stage 4 → node scripts/geodata/apply_curated_candidates.mjs bd');
}

main();
