// scripts/geodata/_asia_1d_in_a_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-IN-A — India BATCH-A apply (22 cities, ar+en only)
//
// User-approved 2026-05-20 per:
//   reports/asia-1d-in-a-plan.md (Option A: Top-22 FULL)
//
// Per user spec — NO local Indian languages (HI/UR/BN/TA/MR/etc.) added in
// this BATCH. Only names.ar + names.en + aliases.en + selective aliases.ar
// for documented rename pairs (varanasi, prayagraj).
//
// Differs from BD-MAJORS-1A pattern (which was combined ar+en+bn): IN-A is
// AR+EN ONLY. Indian L10N waves (HI/UR/BN/TA/etc.) deferred to future
// phases per user direction.
//
// Per user's apply rules:
//   1. BATCH-A only — 22 cities; no others
//   2. Don't touch 18 prior IN seed entries (PRIOR-18 post-mutation guard)
//   3. Don't change server.js / js/app.js / fillLangMap / index.html
//   4. Don't change _geonames_common.mjs / validate_candidates.mjs / normalize_places.mjs
//   5. No runtime translation, no AI, no API
//   6. No fillchain (only ar + en for new entries)
//   7. No Brunei (bn-geonames-*/bn.mjs) data used
//   8. No Bangladesh (bd-geonames-*/bd.mjs) data used
//   9. Strict isCleanArabic guard
//  10. EXCLUDED slugs MUST NOT be merged: pimpri, najafgarh, borivli,
//      narela, bhayandar (plus all other deferred per plan §4)
//
// Mutates only in-geonames-candidates.json (flips 22 entries to approved
// + sets names.ar + manages aliases). Stage 4 (apply_curated_candidates.mjs)
// runs separately.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'in';

// ─── Arabic script-purity helpers ────────────────────────────────────────
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

// ═══ 22 BATCH-A FIXES — user-approved per asia-1d-in-a-plan.md §5 ═══════════
// Source classification per user plan:
//   KEEP             — GeoNames Arabic already clean
//   FIX              — minor cleanup (Persian→Arabic)
//   MANUAL           — fresh Wikipedia AR / standard translit
//   COMMON_AR        — well-established Arabic exonym (varanasi → بنارس)
//   REJECT_AND_MANUAL — semantic mismatch (prayagraj → برايا غراج replaces إلٰه‌آباد)
const FIXES = [
    { slug: 'coimbatore',        fc: 'PPL',   newAr: 'كويمباتور',
      addAliasesEn: ['Kovai'], source: 'KEEP' },
    { slug: 'thane',             fc: 'PPL',   newAr: 'تاني',
      addAliasesEn: ['Thana', 'Tana'], source: 'MANUAL' },
    { slug: 'vadodara',          fc: 'PPL',   newAr: 'فادودارا',
      addAliasesEn: ['Baroda'], source: 'KEEP' },
    { slug: 'pimpri-chinchwad',  fc: 'PPL',   newAr: 'بيمبري تشينتشواد',
      addAliasesEn: [], source: 'MANUAL' },
    { slug: 'nashik',            fc: 'PPLA2', newAr: 'ناسيك',
      addAliasesEn: [], source: 'FIX' },
    { slug: 'madurai',           fc: 'PPLA2', newAr: 'مادوراي',
      addAliasesEn: ['Madura', 'Mathurai'], source: 'FIX' },
    { slug: 'tirunelveli',       fc: 'PPLA2', newAr: 'تيرونلفيلي',
      addAliasesEn: ['Tinnevelly', 'Nellai'], source: 'MANUAL' },
    { slug: 'agra',              fc: 'PPLA2', newAr: 'أغرا',
      addAliasesEn: [], source: 'MANUAL' },
    { slug: 'faridabad',         fc: 'PPLA2', newAr: 'فريد آباد',
      addAliasesEn: [], source: 'FIX' },
    { slug: 'jamshedpur',        fc: 'PPL',   newAr: 'جمشدبور',
      addAliasesEn: [], source: 'FIX' },
    { slug: 'dombivali',         fc: 'PPL',   newAr: 'دومبيفلي',
      addAliasesEn: [], source: 'MANUAL' },
    { slug: 'meerut',            fc: 'PPL',   newAr: 'ميروت',
      addAliasesEn: [], source: 'KEEP' },
    { slug: 'ghaziabad',         fc: 'PPLA2', newAr: 'غازي آباد',
      addAliasesEn: [], source: 'MANUAL' },
    { slug: 'dhanbad',           fc: 'PPLA2', newAr: 'دانباد',
      addAliasesEn: [], source: 'MANUAL' },
    { slug: 'aurangabad',        fc: 'PPLA2', newAr: 'أورنك آباد',
      addAliasesEn: ['Chhatrapati Sambhajinagar', 'Sambhajinagar'], source: 'KEEP' },
    { slug: 'varanasi',          fc: 'PPL',   newAr: 'بنارس',
      addAliasesEn: ['Banaras', 'Benares', 'Kashi'],
      addAliasesAr: ['فاراناسي'],
      source: 'COMMON_AR' },
    { slug: 'amritsar',          fc: 'PPL',   newAr: 'أمريتسار',
      addAliasesEn: [], source: 'KEEP' },
    { slug: 'vijayawada',        fc: 'PPL',   newAr: 'فيجاياوادا',
      addAliasesEn: [], source: 'MANUAL' },
    { slug: 'ranchi',            fc: 'PPLA',  newAr: 'رانشي',
      addAliasesEn: [], source: 'KEEP' },
    { slug: 'prayagraj',         fc: 'PPL',   newAr: 'برايا غراج',
      addAliasesEn: ['Allahabad'],
      addAliasesAr: ['إله آباد'],
      source: 'REJECT_AND_MANUAL' },
    { slug: 'visakhapatnam',     fc: 'PPLA2', newAr: 'فيساكاباتنام',
      addAliasesEn: ['Vizag'], source: 'MANUAL' },
    { slug: 'jodhpur',           fc: 'PPL',   newAr: 'جودبور',
      addAliasesEn: [], source: 'MANUAL' },
];

// ─── Slugs we MUST NOT merge (per plan §4) ────────────────────────────────
const DROP_SLUGS = new Set([
    'pimpri',          // DUPLICATE of pimpri-chinchwad (PCMC)
    'najafgarh',       // Delhi sub-district
    'borivli',         // Mumbai BMC ward
    'narela',          // Delhi sub-district
    'bhayandar',       // Mumbai region (deferred to BATCH-B)
]);

// ─── Existing 18 IN curated slugs (PRIOR-18 guard) ───────────────────────
const IN_PRIOR_18_SLUGS = new Set([
    'new-delhi', 'mumbai', 'kolkata', 'hyderabad-in', 'chennai',
    'bengaluru', 'lucknow', 'ahmedabad', 'pune', 'jaipur',
    'surat', 'kanpur', 'indore', 'nagpur', 'bhopal',
    'patna', 'srinagar', 'kochi'
]);

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenAr = new Map();
    for (const f of FIXES) {
        if (DROP_SLUGS.has(f.slug)) errors.push('FIXES targets DROP_SLUG: ' + f.slug);
        if (IN_PRIOR_18_SLUGS.has(f.slug)) errors.push('FIXES targets PRIOR-18 IN slug: ' + f.slug);
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug in FIXES: ' + f.slug);
        seenSlugs.add(f.slug);

        if (!isCleanArabic(f.newAr)) {
            errors.push(f.slug + ' newAr="' + f.newAr + '" fails clean-Arabic guard');
        }
        if (seenAr.has(f.newAr)) {
            errors.push('DUP-AR: "' + f.newAr + '" used by ' + seenAr.get(f.newAr) + ' AND ' + f.slug);
        }
        seenAr.set(f.newAr, f.slug);

        for (const a of (f.addAliasesAr || [])) {
            if (!isCleanArabic(a)) {
                errors.push(f.slug + ' addAliasesAr "' + a + '" fails clean-Arabic guard');
            }
        }
    }
    if (errors.length) {
        console.error('[in-a] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[in-a] pre-flight OK — ' + FIXES.length + ' fixes validated');

    // ─── Cross-check vs existing 18 IN curated ───
    const curated = JSON.parse(fs.readFileSync(
        'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json', 'utf8'));
    const inExisting = curated.filter(x => x.countryCode === 'in');
    const existingArSet = new Set(inExisting.map(e => e.names && e.names.ar).filter(Boolean));
    const existingSlugSet = new Set(inExisting.map(e => e.slug));

    const collisions = [];
    for (const f of FIXES) {
        if (existingArSet.has(f.newAr)) {
            collisions.push('Arabic collision: "' + f.newAr + '" already used by existing IN entry');
        }
        if (existingSlugSet.has(f.slug)) {
            collisions.push('Slug collision: in/' + f.slug + ' already in curated');
        }
    }
    if (collisions.length) {
        console.error('[in-a] FAILED cross-check against existing 18 IN curated:');
        for (const c of collisions) console.error('  - ' + c);
        process.exit(1);
    }
    console.log('[in-a] cross-check OK — no collision with 18 existing IN entries');

    // ─── Load candidates JSON (slim version from preflight) ───
    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    const stats = {
        approvedNew: 0,
        skippedIdempotent: 0,
        slugNotFound: [],
        aliasesEnAdded: 0,
        aliasesArAdded: 0,
        nameArSet: 0,
        sourceBreakdown: {},
    };
    const approvedRows = [];

    for (const fix of FIXES) {
        // Match by slug + featureCode + acceptable starting status
        const matches = list.filter(e =>
            e.slug === fix.slug &&
            e.candidate &&
            e.candidate.featureCode === fix.fc &&
            (
                (e.status === 'pending' && e.tier === 'high')
                || (e.status === 'approved' && e.candidate.names.ar === fix.newAr)
            )
        );
        if (!matches.length) {
            stats.slugNotFound.push(fix.slug + ' (fc=' + fix.fc + ')');
            continue;
        }
        // Idempotent skip
        const alreadyApplied = matches.find(e =>
            e.status === 'approved' && e.candidate.names.ar === fix.newAr
        );
        if (alreadyApplied) {
            console.log('[in-a] in/' + fix.slug.padEnd(20) + ' SKIP (idempotent)');
            stats.skippedIdempotent++;
            continue;
        }

        // Pick best (highest pop)
        matches.sort((a, b) => (b.candidate.population || 0) - (a.candidate.population || 0));
        const target = matches[0];
        const oldAr = target.candidate.names.ar || '(empty)';

        // Apply name.ar
        target.candidate.names.ar = fix.newAr;
        stats.nameArSet++;

        // Drop polluted aliases.ar (only keep clean-Arabic) + add user-specified
        const currentAliasesAr = (target.candidate.aliases && target.candidate.aliases.ar) || [];
        let cleanedAliasesAr = currentAliasesAr.filter(a => isCleanArabic(a) && a !== fix.newAr);
        for (const a of (fix.addAliasesAr || [])) {
            if (!cleanedAliasesAr.includes(a) && a !== fix.newAr) {
                cleanedAliasesAr.push(a);
                stats.aliasesArAdded++;
            }
        }

        // Manage aliases.en — keep Stage 2 derived + add user-specified
        const currentAliasesEn = (target.candidate.aliases && target.candidate.aliases.en) || [];
        const cleanedAliasesEn = currentAliasesEn.slice();
        for (const a of (fix.addAliasesEn || [])) {
            if (!cleanedAliasesEn.includes(a)) {
                cleanedAliasesEn.push(a);
                stats.aliasesEnAdded++;
            }
        }

        if (!target.candidate.aliases) target.candidate.aliases = {};
        target.candidate.aliases.ar = cleanedAliasesAr;
        target.candidate.aliases.en = cleanedAliasesEn;

        // Remove any auto-fillchain leaks (Stage 2 only fills ar + en — no
        // need to drop; but verify we don't accidentally have other langs)
        // CRITICAL: explicitly delete any names.bn/hi/ur/ta/mr/etc. that
        // might have leaked from Stage 2's parseAlternateNames (Stage 2
        // only does ar + en buckets, but defense-in-depth):
        if (target.candidate.names) {
            for (const lang of Object.keys(target.candidate.names)) {
                if (lang !== 'ar' && lang !== 'en') {
                    delete target.candidate.names[lang];
                }
            }
        }

        // Flip status + tier
        target.status = 'approved';
        target.tier = 'high';
        target.pendingAfterArGate = true;
        target.arQuality = {
            quality: 'manual',
            detail: 'user-supplied Arabic via ASIA-1D-IN-A (plan ref: reports/asia-1d-in-a-plan.md). Source: ' + fix.source,
            fromArTag: false
        };

        stats.approvedNew++;
        stats.sourceBreakdown[fix.source] = (stats.sourceBreakdown[fix.source] || 0) + 1;
        approvedRows.push({
            slug: fix.slug, fc: fix.fc, pop: target.candidate.population || 0,
            oldAr, newAr: fix.newAr, source: fix.source
        });
        console.log('[in-a] in/' + fix.slug.padEnd(20) +
            ' [' + fix.source.padEnd(18) + ']' +
            ' ar:"' + oldAr.slice(0, 14).padEnd(14) + '"→"' + fix.newAr + '"');
    }

    if (stats.slugNotFound.length) {
        console.error('[in-a] FAILED — slugs not found:');
        for (const s of stats.slugNotFound) console.error('  - ' + s);
        process.exit(1);
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list) + '\n');  // compact (>100k entries)

    console.log('');
    console.log('═══ ASIA-1D-IN-A — Apply Summary ═══');
    console.log('  Approved (new):              ' + stats.approvedNew);
    console.log('  Skipped (idempotent):        ' + stats.skippedIdempotent);
    console.log('  names.ar set:                ' + stats.nameArSet);
    console.log('  aliases.en added:            ' + stats.aliasesEnAdded);
    console.log('  aliases.ar added:            ' + stats.aliasesArAdded);
    console.log('  DROP_SLUGS (excluded):       ' + DROP_SLUGS.size);
    console.log('  Source breakdown:');
    for (const [src, n] of Object.entries(stats.sourceBreakdown)) {
        console.log('    ' + src.padEnd(20) + ' = ' + n);
    }
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        console.log('  in/' + r.slug.padEnd(20)
            + '  pop=' + String(r.pop).padStart(8)
            + '  ' + r.fc.padEnd(6)
            + '  ar="' + r.newAr + '"  [' + r.source + ']');
    }
    console.log('');
    console.log('Ready for Stage 4 → node scripts/geodata/apply_curated_candidates.mjs in');
}

main();
