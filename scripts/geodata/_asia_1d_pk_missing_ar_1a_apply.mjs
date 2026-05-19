// scripts/geodata/_asia_1d_pk_missing_ar_1a_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-PK-MISSING-AR-MAJORS-1A — apply BATCH A (Top 20 by population)
// of the 97 missing-ar PK majors from ASIA-1D-PK.
//
// User decision (2026-05-19): "execute BATCH A only — Top 20" per:
//   reports/asia-1d-pk-missing-ar-majors-1-review.md
//
// All 20 names manually proposed (zero Arabic in GeoNames). User-approved
// specific spellings:
//   - bahawalpur → بهاولبور (Wikipedia AR, with Arabic ب not Persian پ)
//   - dera-ismail-khan → ديرة إسماعيل خان (with tah-marbuta, NOT ـه)
//   - okara → أوكاره (tah-marbuta, NOT alif)
//   - larkana → لاركانة (tah-marbuta)
//   - abbottabad → إبت آباد (with hamza-on-alif)
//   - kasur → قصور (Arabic Wikipedia canonical — same as the word "palaces")
//   - All compound endings standardized: -abad → آباد, -pur → بور, -kot → كوت
//
// CRITICAL DROP per user direction:
//   - bahawalnagar PPL (pop=126,700) — DUPLICATE of pk/bahawalnagar PPLA2
//     already merged in ASIA-1D-PK. Skip entirely; do NOT add as new entry.
//     This PPL row in candidates JSON has status='needs_review' so it
//     won't reach Stage 4 unless we accidentally approve it. We don't.
//
// Per user's 10-point apply rules:
//   1. BATCH A only — 20 cities. NOT B/C.
//   2. Don't merge bahawalnagar PPL dup
//   3. Don't touch 70 existing PK entries
//   4. Don't touch names.ur / aliases.ur (separate UR-PK-4 phase later)
//   5. Don't change server.js / js/app.js / fillLangMap / index.html
//   6. No runtime translation
//   7. No fake localized fillchain (apply_curated_candidates.mjs guard enforces)
//   8. names.ar + names.en only for new entries
//   9. No pop=0 admin stubs in this batch
//  10. No model-town, jhang-city, upper-dir in this batch
//
// Mutates only pk-geonames-candidates.json (flips 20 entries to approved
// + sets names.ar). Stage 4 runs separately via apply_curated_candidates.mjs.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'pk';

// Cleaner — same as MCF approach
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
const LATIN = /[A-Za-z]/;
const URDU_NUN_GHUNNA = /[ں]/;
const PASHTO_SINDHI = /[ټېڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanArabic(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN.test(stripped))  return false;
    if (URDU_NUN_GHUNNA.test(stripped)) return false;
    if (PASHTO_SINDHI.test(stripped)) return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// ═══ BATCH A — 20 user-approved entries with manual Arabic ═══
// Sorted by population desc (largest first)
const FIXES = [
    { slug: 'bahawalpur',       newAr: 'بهاولبور',        note: 'pop=903,795 PPLA2; Wikipedia AR (Arabic ب not Persian پ)' },
    { slug: 'dera-ismail-khan', newAr: 'ديرة إسماعيل خان', note: 'pop=763,195 PPLA2; Wikipedia AR with tah-marbuta' },
    { slug: 'battagram',        newAr: 'بطغرام',          note: 'pop=700,000 PPLA2 KP' },
    { slug: 'okara',            newAr: 'أوكاره',          note: 'pop=533,693 PPLA2 Punjab; tah-marbuta' },
    { slug: 'kasur',            newAr: 'قصور',            note: 'pop=510,875 PPLA2 Punjab; Wikipedia AR canonical' },
    { slug: 'tando-allahyar',   newAr: 'تاندو اللهيار',   note: 'pop=421,923 PPLA2 Sindh; Tando = town' },
    { slug: 'larkana',          newAr: 'لاركانة',         note: 'pop=364,033 PPLA2 Sindh; tah-marbuta' },
    { slug: 'nawabshah',        newAr: 'نواب شاه',        note: 'pop=363,138 PPLA2 Sindh' },
    { slug: 'hafizabad',        newAr: 'حافظ آباد',       note: 'pop=318,621 PPLA2 Punjab; -abad canonical آباد' },
    { slug: 'kamoke',           newAr: 'كاموكي',          note: 'pop=291,980 PPL Punjab' },
    { slug: 'abbottabad',       newAr: 'إبت آباد',        note: 'pop=275,890 PPLA2 KP; hamza-on-alif initial' },
    { slug: 'shikarpur',        newAr: 'شكاربور',         note: 'pop=204,938 PPLA2 Sindh historic city' },
    { slug: 'shahkot',          newAr: 'شاه كوت',         note: 'pop=200,000 PPL Punjab' },
    { slug: 'hub',              newAr: 'هب',              note: 'pop=195,661 PPL Balochistan' },
    { slug: 'garhi-khairo',     newAr: 'غره خيرو',        note: 'pop=193,297 PPL Sindh' },
    { slug: 'khairpur-mirs',    newAr: 'خيربور مير',      note: 'pop=191,044 PPLA2 Sindh; "Mir\'s" → "مير"' },
    { slug: 'saddiqabad',       newAr: 'صديق آباد',       note: 'pop=189,876 PPL Punjab' },
    { slug: 'burewala',         newAr: 'بوريوالا',        note: 'pop=183,915 PPL Punjab' },
    { slug: 'arif-wala',        newAr: 'عارف والا',       note: 'pop=157,063 PPL Punjab' },
    { slug: 'kohat',            newAr: 'كوهات',           note: 'pop=151,427 PPLA2 KP; Wikipedia AR canonical' },
];

// Confirm: explicit drop of bahawalnagar PPL dup
const DROP_SLUGS = new Set(['bahawalnagar']); // already in curated as PPLA2

function main() {
    // ─── Pre-flight ───
    const errors = [];
    const seenAr = new Map();
    const seenSlugs = new Set();
    for (const fix of FIXES) {
        if (seenSlugs.has(fix.slug)) errors.push('Duplicate slug in FIXES: ' + fix.slug);
        seenSlugs.add(fix.slug);
        if (!isCleanArabic(fix.newAr)) {
            errors.push(fix.slug + ' → newAr="' + fix.newAr + '" failed clean-check');
        }
        if (seenAr.has(fix.newAr)) {
            errors.push('DUP-AR: "' + fix.newAr + '" used by ' + seenAr.get(fix.newAr) + ' AND ' + fix.slug);
        }
        seenAr.set(fix.newAr, fix.slug);
    }
    if (errors.length) {
        console.error('[pk-1a] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[pk-1a] pre-flight OK — ' + FIXES.length + ' NAME_AR_FIXES validated');

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    // Cross-check no FIXES targets a DROP_SLUG
    for (const fix of FIXES) {
        if (DROP_SLUGS.has(fix.slug)) {
            console.error('[pk-1a] FAILED — fix targets DROP_SLUG: ' + fix.slug);
            process.exit(1);
        }
    }

    let totalApproved = 0;
    let totalSkipped = 0;

    for (const fix of FIXES) {
        const slug = fix.slug;
        // Find best match: highest-feature_code, then highest pop, currently needs_review
        // or already-approved-with-target (idempotent re-run)
        const matches = list.filter(e =>
            e.slug === slug
            && (
                (e.status === 'needs_review' && e.reason === 'missing_real_ar_name')
                || (e.status === 'approved' && e.candidate.names.ar === fix.newAr)
            )
        );
        if (!matches.length) {
            console.error('[pk-1a] FAILED — no missing-ar entry for pk/' + slug);
            process.exit(1);
        }
        const alreadyApplied = matches.find(c =>
            c.status === 'approved' && c.candidate.names.ar === fix.newAr
        );
        if (alreadyApplied) {
            console.log('[pk-1a] pk/' + slug.padEnd(22) + ' SKIP (already applied)');
            totalSkipped++;
            continue;
        }

        // Pick best (PPLA2 > PPLA > PPL, then highest pop)
        matches.sort((a, b) => {
            const rank = (fc) => ({'PPLC':0,'PPLA':1,'PPLA2':2,'PPLA3':3,'PPL':4}[fc] || 9);
            if (rank(a.candidate.featureCode) !== rank(b.candidate.featureCode)) {
                return rank(a.candidate.featureCode) - rank(b.candidate.featureCode);
            }
            return (b.candidate.population || 0) - (a.candidate.population || 0);
        });
        const target = matches[0];
        const oldAr = target.candidate.names.ar || '(empty)';

        // Apply
        target.candidate.names.ar = fix.newAr;
        // Drop any stray aliases.ar (these were already missing-ar so should be empty)
        target.candidate.aliases = target.candidate.aliases || {};
        if (!Array.isArray(target.candidate.aliases.ar)) target.candidate.aliases.ar = [];
        // Flip status + arQuality
        target.status = 'approved';
        target.pendingAfterArGate = true;
        target.tier = 'high';
        target.arQuality = {
            quality: 'manual',
            detail: 'user-supplied Arabic via ASIA-1D-PK-MISSING-AR-MAJORS-1A',
            fromArTag: false,
        };

        totalApproved++;
        console.log('[pk-1a] pk/' + slug.padEnd(22) +
            ' ar:"' + (oldAr.slice(0, 18) || '').padEnd(18) + '" → "' + fix.newAr + '"' +
            '  (' + fix.note + ')');
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-PK-MISSING-AR-MAJORS-1A — Summary ═══');
    console.log('  Total approved (new):           ' + totalApproved);
    console.log('  Total skipped (idempotent):     ' + totalSkipped);
    console.log('  Dropped duplicates:             ' + DROP_SLUGS.size + ' (bahawalnagar PPL)');
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs pk');
}

main();
