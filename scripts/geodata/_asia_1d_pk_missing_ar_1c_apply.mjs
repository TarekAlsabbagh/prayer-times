// scripts/geodata/_asia_1d_pk_missing_ar_1c_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-PK-MISSING-AR-MAJORS-1C (Fast Track conditional) — BATCH-C of the
// 77 candidates evaluated. User picked scope Option 1: T3 ONLY = 30 PPL
// cities pop 50-99k. After STOP/ask resolution, dropped 1 (arifwala) due
// to duplicate-Arabic conflict with already-merged arif-wala (MAJORS-1A).
//
// Final scope: 29 cities.
//
// All Arabic names manually transliterated from Wikipedia AR + standard
// compound conventions (-abad→آباد, -pur→بور, -kot→كوت, -khan→خان,
// -garh→غره, -wala→والا, hujra→حجرة).
//
// EXCLUDED per user direction (2026-05-19):
//   - All 21 PPLA2 pop>0 (admin centers) — deferred to future phase
//   - All 26 PPLA2 pop=0 admin stubs — deferred / no value
//   - jhang-city (semantic dup with jhang-sadr; already excluded)
//   - eidghah, dambudas, tolti (weak/borderline stubs)
//   - musa-khel-bazar (unusual "bazar" suffix)
//   - arifwala (Punjab major city) — duplicate Arabic عارف والا with existing
//     arif-wala (Balochistan); future MAJORS-1A polish to re-target
//
// Mutates only pk-geonames-candidates.json (flips entries to approved).
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

// ═══ BATCH C — 29 PPL T3 cities (pop 50-99k, excluding arifwala dup) ═══
const FIXES = [
    { slug: 'qubo-saeed-khan',     newAr: 'قبو سعيد خان',     note: 'pop=99k Sindh' },
    { slug: 'jalalpur-jattan',     newAr: 'جلال بور جتان',    note: 'pop=94k Punjab; -pur→بور' },
    { slug: 'daharki',             newAr: 'داهاركي',          note: 'pop=90k Sindh' },
    { slug: 'kandhkot',            newAr: 'كنده كوت',         note: 'pop=88k Sindh; -kot→كوت' },
    { slug: 'nowshera-kalan',      newAr: 'نوشيرا كلان',      note: 'pop=88k KP; kalan=big' },
    { slug: 'chichawatni',         newAr: 'جيجاواتني',        note: 'pop=83k Punjab; ch→ج' },
    { slug: 'fatehjang',           newAr: 'فاتح جانغ',        note: 'pop=81k Punjab' },
    { slug: 'alahabad',            newAr: 'الله آباد',        note: 'pop=80k Punjab Kasur; -abad→آباد' },
    { slug: 'moro',                newAr: 'مورو',             note: 'pop=77k Sindh' },
    { slug: 'mian-channun',        newAr: 'ميان جانون',       note: 'pop=76k Punjab; ch→ج' },
    { slug: 'topi',                newAr: 'توبي',             note: 'pop=75k KP' },
    { slug: 'pano-aqil',           newAr: 'بانو عاقل',        note: 'pop=73k Sindh' },
    { slug: 'harunabad',           newAr: 'هارون آباد',       note: 'pop=72k Punjab; -abad→آباد' },
    { slug: 'rabwah',              newAr: 'ربوة',             note: 'pop=70k Punjab (Chenab Nagar); Wikipedia AR' },
    { slug: 'kahror-pakka',        newAr: 'كاهرور باكا',      note: 'pop=70k Punjab' },
    { slug: 'chuhar-kana',         newAr: 'جوهار كانا',       note: 'pop=69k Punjab; ch→ج' },
    { slug: 'shorkot',             newAr: 'شور كوت',          note: 'pop=67k Punjab; -kot→كوت' },
    { slug: 'minchinabad',         newAr: 'مينتشين آباد',     note: 'pop=67k Punjab; ch→تش; -abad→آباد' },
    { slug: 'shabqadar',           newAr: 'شب قدر',           note: 'pop=66k KP (Persian-loan term, written as AR)' },
    { slug: 'shujaabad',           newAr: 'شجاع آباد',        note: 'pop=66k Punjab; -abad→آباد' },
    { slug: 'haveli-lakha',        newAr: 'حويلي لاكا',       note: 'pop=65k Punjab' },
    { slug: 'shakargarh',          newAr: 'شكر غره',          note: 'pop=64k Punjab; -garh→غره (MCF convention)' },
    { slug: 'jampur',              newAr: 'جام بور',          note: 'pop=64k Punjab; -pur→بور' },
    { slug: 'hujra-shah-muqim',    newAr: 'حجرة شاه مقيم',    note: 'pop=62k Punjab; Hujra→حجرة' },
    { slug: 'sangla-hill',         newAr: 'سنغلا هيل',        note: 'pop=57k Punjab; English-loan "hill"' },
    { slug: 'sharifabad',          newAr: 'شريف آباد',        note: 'pop=55k KP; -abad→آباد' },
    { slug: 'pabbi',               newAr: 'بابي',             note: 'pop=53k KP' },
    { slug: 'qabula',              newAr: 'قابولا',           note: 'pop=52k Punjab' },
    { slug: 'jahanian',            newAr: 'جهانيان',          note: 'pop=50k Punjab' },
];

// Slugs we MUST NOT include — duplicates / weak / user-excluded
const DROP_SLUGS = new Set([
    'arifwala',          // duplicate Arabic with existing arif-wala (MAJORS-1A)
    'model-town',        // generic English (MAJORS-1A exclusion)
    'bahawalnagar',      // PPL dup of existing PPLA2 (MAJORS-1A exclusion)
    'jhang-city',        // semantic dup with jhang-sadr; user-excluded
    'eidghah',           // generic Eidgah name, not a real city
    'dambudas',          // obscure village stub
    'tolti',             // small village near Skardu
    'musa-khel-bazar',   // bazar suffix unusual
]);

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
        console.error('[pk-1c] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[pk-1c] pre-flight OK — ' + FIXES.length + ' NAME_AR_FIXES validated');

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    // Cross-check: each AR name MUST be unique across ALL existing curated PK entries
    const curated = JSON.parse(fs.readFileSync('C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json', 'utf8'));
    const pkExisting = curated.filter(x => x.countryCode === 'pk');
    const existingArSet = new Set(pkExisting.map(e => e && e.names && e.names.ar).filter(Boolean));
    const collisions = [];
    for (const fix of FIXES) {
        if (existingArSet.has(fix.newAr)) {
            collisions.push(fix.slug + ' → "' + fix.newAr + '" collides with existing PK entry');
        }
    }
    if (collisions.length) {
        console.error('[pk-1c] FAILED — Arabic-name collision with existing curated PK:');
        for (const c of collisions) console.error('  - ' + c);
        process.exit(1);
    }
    console.log('[pk-1c] cross-check OK — no Arabic-name collision with 119 existing PK entries');

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
            console.error('[pk-1c] FAILED — no missing-ar entry for pk/' + slug);
            process.exit(1);
        }
        const alreadyApplied = matches.find(c =>
            c.status === 'approved' && c.candidate.names.ar === fix.newAr
        );
        if (alreadyApplied) {
            console.log('[pk-1c] pk/' + slug.padEnd(22) + ' SKIP (already applied)');
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
            detail: 'user-supplied Arabic via ASIA-1D-PK-MISSING-AR-MAJORS-1C (Fast Track)',
            fromArTag: false,
        };

        totalApproved++;
        console.log('[pk-1c] pk/' + slug.padEnd(22) +
            ' ar:"' + (oldAr.slice(0, 16) || '').padEnd(16) + '" → "' + fix.newAr + '"' +
            '  (' + fix.note + ')');
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-PK-MISSING-AR-MAJORS-1C (Fast Track) — Summary ═══');
    console.log('  Total approved (new):           ' + totalApproved);
    console.log('  Total skipped (idempotent):     ' + totalSkipped);
    console.log('  Excluded slugs:                 ' + DROP_SLUGS.size + ' (arifwala dup + 7 others)');
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs pk');
}

main();
