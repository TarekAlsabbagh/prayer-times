// scripts/geodata/_asia_1d_pk_missing_ar_1b_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-PK-MISSING-AR-MAJORS-1B (Fast Track) — BATCH B of the 77 remaining
// missing-ar PK majors: Tier 2-3 cities with pop ≥ 50k.
//
// User decision (2026-05-19): Fast Track Review+Apply.
//
// GeoNames had ZERO Arabic content for all 29 cities. All names manually
// transliterated from Arabic Wikipedia + standard conventions:
//   -abad → آباد, -pur → بور, -kot → كوت, -khan → خان
//   Dera- → ديرة, Tando- → تاندو
//
// EXCLUDED per user direction:
//   - model-town (generic English neighborhood name, pop=100k PPL — same
//     exclusion as in MAJORS-1A)
//   - all pop=0 admin stubs (deferred to BATCH-C / MAJORS-1C)
//   - bahawalnagar PPL dup (already excluded in MAJORS-1A)
//
// Mutates only pk-geonames-candidates.json (flips 29 entries to approved).
// Stage 4 merge runs separately via apply_curated_candidates.mjs.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'pk';

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

// ═══ BATCH B — 29 cities (pop ≥ 50k, excluding model-town) ═══
const FIXES = [
    // Tier 2 (pop 100k-155k) — 23 cities
    { slug: 'layyah',              newAr: 'ليه',             note: 'pop=151k Punjab' },
    { slug: 'lodhran',             newAr: 'لودهران',         note: 'pop=145k Punjab' },
    { slug: 'khanpur',             newAr: 'خانبور',          note: 'pop=142k Punjab; -pur→بور' },
    { slug: 'attock-city',         newAr: 'أتوك',            note: 'pop=142k Punjab; Wikipedia AR canonical' },
    { slug: 'khuzdar',             newAr: 'خضدار',           note: 'pop=141k Balochistan; Wikipedia AR' },
    { slug: 'manjhand',            newAr: 'مانجاند',         note: 'pop=141k Sindh' },
    { slug: 'bhakkar',             newAr: 'بهاكر',           note: 'pop=132k Punjab' },
    { slug: 'narowal',             newAr: 'نارووال',         note: 'pop=131k Punjab' },
    { slug: 'mandi-bahauddin',     newAr: 'مندي بهاء الدين', note: 'pop=130k Punjab' },
    { slug: 'mianwali',            newAr: 'ميانوالي',        note: 'pop=130k Punjab; Wikipedia AR' },
    { slug: 'pakpattan',           newAr: 'باكباتان',        note: 'pop=127k Punjab' },
    { slug: 'tando-adam',          newAr: 'تاندو آدم',       note: 'pop=126k Sindh; Tando→تاندو' },
    { slug: 'toba-tek-singh',      newAr: 'توبا تيك سينغ',   note: 'pop=123k Punjab' },
    { slug: 'shahdad-kot',         newAr: 'شهداد كوت',       note: 'pop=121k Sindh; -kot→كوت' },
    { slug: 'charsadda',           newAr: 'شارسده',          note: 'pop=120k KP; Wikipedia AR' },
    { slug: 'ghotki',              newAr: 'غوتكي',           note: 'pop=120k Sindh' },
    { slug: 'phool-nagar',         newAr: 'بهول ناغر',       note: 'pop=115k Punjab (Phool=flower)' },
    { slug: 'tando-muhammad-khan', newAr: 'تاندو محمد خان',  note: 'pop=114k Sindh; Muhammad canonical محمد' },
    { slug: 'vihari',              newAr: 'فيهاري',          note: 'pop=113k Punjab' },
    { slug: 'dera-murad-jamali',   newAr: 'ديرة مراد جمالي', note: 'pop=107k Balochistan; Dera→ديرة' },
    { slug: 'kot-addu',            newAr: 'كوت أدو',         note: 'pop=104k Punjab' },
    { slug: 'khushab',             newAr: 'خوشاب',           note: 'pop=103k Punjab; Wikipedia AR' },
    { slug: 'chakwal',             newAr: 'جكوال',           note: 'pop=101k Punjab; Wikipedia AR' },
    // Tier 3 (pop 50k-99k) — 6 cities
    { slug: 'swabi',               newAr: 'صوابي',           note: 'pop=97k KP; Wikipedia AR' },
    { slug: 'mansehra',            newAr: 'مانسهره',         note: 'pop=66k KP' },
    { slug: 'sanghar',             newAr: 'سنغر',            note: 'pop=62k Sindh' },
    { slug: 'haripur',             newAr: 'هاريبور',         note: 'pop=57k KP' },
    { slug: 'rajanpur',            newAr: 'رجن بور',         note: 'pop=51k Punjab; -pur→بور' },
    { slug: 'zhob',                newAr: 'زهوب',            note: 'pop=51k Balochistan' },
];

const DROP_SLUGS = new Set(['model-town', 'bahawalnagar']); // excluded per user direction

function main() {
    const errors = [];
    const seenAr = new Map();
    const seenSlugs = new Set();
    for (const fix of FIXES) {
        if (DROP_SLUGS.has(fix.slug)) errors.push('FIXES targets DROP_SLUG: ' + fix.slug);
        if (seenSlugs.has(fix.slug)) errors.push('Duplicate slug: ' + fix.slug);
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
        console.error('[pk-1b] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[pk-1b] pre-flight OK — ' + FIXES.length + ' NAME_AR_FIXES validated');

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    let totalApproved = 0, totalSkipped = 0;

    for (const fix of FIXES) {
        const slug = fix.slug;
        const matches = list.filter(e =>
            e.slug === slug
            && (
                (e.status === 'needs_review' && e.reason === 'missing_real_ar_name')
                || (e.status === 'approved' && e.candidate.names.ar === fix.newAr)
            )
        );
        if (!matches.length) {
            console.error('[pk-1b] FAILED — no missing-ar entry for pk/' + slug);
            process.exit(1);
        }
        const alreadyApplied = matches.find(c =>
            c.status === 'approved' && c.candidate.names.ar === fix.newAr
        );
        if (alreadyApplied) {
            console.log('[pk-1b] pk/' + slug.padEnd(22) + ' SKIP (already applied)');
            totalSkipped++;
            continue;
        }

        matches.sort((a, b) => {
            const rank = (fc) => ({'PPLC':0,'PPLA':1,'PPLA2':2,'PPLA3':3,'PPL':4}[fc] || 9);
            if (rank(a.candidate.featureCode) !== rank(b.candidate.featureCode)) {
                return rank(a.candidate.featureCode) - rank(b.candidate.featureCode);
            }
            return (b.candidate.population || 0) - (a.candidate.population || 0);
        });
        const target = matches[0];
        const oldAr = target.candidate.names.ar || '(empty)';

        target.candidate.names.ar = fix.newAr;
        target.candidate.aliases = target.candidate.aliases || {};
        if (!Array.isArray(target.candidate.aliases.ar)) target.candidate.aliases.ar = [];
        target.status = 'approved';
        target.pendingAfterArGate = true;
        target.tier = 'high';
        target.arQuality = {
            quality: 'manual',
            detail: 'user-supplied Arabic via ASIA-1D-PK-MISSING-AR-MAJORS-1B (Fast Track)',
            fromArTag: false,
        };

        totalApproved++;
        console.log('[pk-1b] pk/' + slug.padEnd(22) +
            ' ar:"' + (oldAr.slice(0, 16) || '').padEnd(16) + '" → "' + fix.newAr + '"' +
            '  (' + fix.note + ')');
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-PK-MISSING-AR-MAJORS-1B (Fast Track) — Summary ═══');
    console.log('  Total approved (new):           ' + totalApproved);
    console.log('  Total skipped (idempotent):     ' + totalSkipped);
    console.log('  Excluded slugs:                 ' + DROP_SLUGS.size + ' (model-town, bahawalnagar)');
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs pk');
}

main();
