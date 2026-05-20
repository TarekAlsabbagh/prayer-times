// scripts/geodata/_asia_1d_bd_missing_ar_majors_1a_apply.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-BD-MISSING-AR-MAJORS-1A — Bangladesh BATCH-1A apply (19 cities)
//
// User-approved 2026-05-20 per:
//   reports/asia-1d-bd-missing-ar-majors-1a-plan.md (Option A: Top-19)
//
// Differs from PK MAJORS-1A pattern:
//   - This wave is COMBINED (ar + en + bn in single merge), not split
//     into geodata + l10n. Reason: plan phase already pre-decided all
//     19 Bengali names from documented sources (3 GeoNames raw + 16
//     Bengali Wikipedia), so we apply all three localizations together.
//   - PK split into MAJORS-1A (ar+en) + UR-PK-4 (ur) waves.
//
// Sources (NO runtime translation, NO AI, NO fillchain):
//   - 19 names.ar — MANUAL standard Bengali→Arabic transliteration per
//     plan §8 conventions (-পুর→بور, -গঞ্জ→غنج, ng-cluster→غ)
//   - 19 names.bn — 3 from GeoNames raw alternatenames (sirajganj,
//     dinajpur, narail) + 16 from Bengali Wikipedia canonical district
//     article titles (per plan §9)
//   - 5 aliases.en — Jashore (2018 rename), Naogaon (canonical), Joypurhat
//     (no-space), Noakhali (district), Cox's Bazar + Coxs Bazar (variant)
//   - 1 alias.bn — নোয়াখালী (Noakhali Bengali variant for maijdi)
//
// Per user's apply rules:
//   1. BATCH-1A only — 19 cities; no others
//   2. Don't touch 19 prior BD entries (PRIOR-19 post-mutation guard)
//   3. Don't change server.js / js/app.js / fillLangMap / index.html
//   4. Don't change _geonames_common.mjs / validate_candidates.mjs / normalize_places.mjs
//   5. No runtime translation, no AI, no API
//   6. No fillchain
//   7. No Brunei (bn-geonames-* / bn.mjs) data used
//   8. Strict Bengali script guard (Unicode U+0980-U+09FF)
//   9. Strict isCleanArabic guard
//  10. EXCLUDED slugs MUST NOT be merged: barishal, kafrul, bhatara,
//      motijheel, paltan, azimpur, tungi, mohammadpur, hathazari,
//      bandarban, shibganj, natore, savar, narsingdi, nagar-naluakot
//
// Mutates only bd-geonames-candidates.json (flips 19 entries to approved
// + sets names.ar + names.bn + manages aliases). Stage 4
// (apply_curated_candidates.mjs) runs separately to actually merge into
// curated-places.json.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'bd';

// ─── Arabic script-purity helpers (mirror PK MAJORS-1A) ──────────────────
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

// ─── Bengali script-purity helpers ───────────────────────────────────────
const BENGALI_BLOCK   = /[ঀ-৿]/;       // U+0980-U+09FF (Bengali script)
const ASSAMESE_ONLY   = /[ৰৱ]/;        // U+09F0 ৰ + U+09F1 ৱ — reject
const DEVANAGARI      = /[ऀ-ॿ]/;       // U+0900-U+097F (Hindi/Sanskrit)
const ARABIC_BLOCK    = /[؀-ۿ]/;       // U+0600-U+06FF (Arabic/Persian/Urdu)
const OTHER_INDIC     = /[਀-௿]/;        // U+0A00-U+0BFF (Gurmukhi/Gujarati/Tamil/Telugu)

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (LATIN.test(s))         return false;
    if (DEVANAGARI.test(s))    return false;
    if (ARABIC_BLOCK.test(s))  return false;
    if (OTHER_INDIC.test(s))   return false;
    if (ASSAMESE_ONLY.test(s)) return false;
    return BENGALI_BLOCK.test(s);
}

// ═══ 19 BATCH-1A FIXES — user-approved per plan §4 ═══════════════════════
// All starting state: needs_review (missing_real_ar_name)
// All target state: approved/high with names.ar + names.bn set
const FIXES = [
    { slug: 'chandpur',     fc: 'PPLA2', newAr: 'شاندبور',       newBn: 'চাঁদপুর',         addAliasesEn: [], note: 'pop=203k Chittagong Div; PPLA2 admin' },
    { slug: 'jessore',      fc: 'PPL',   newAr: 'جيسور',         newBn: 'যশোর',           addAliasesEn: ['Jashore'], note: 'pop=244k Khulna Div; Jashore 2018 rename' },
    { slug: 'maijdi',       fc: 'PPL',   newAr: 'ميجدي',         newBn: 'মাইজদী',         addAliasesEn: ['Noakhali'], addAliasesBn: ['নোয়াখালী'], note: 'pop=132k Chittagong Div; Noakhali district capital' },
    { slug: 'kushtia',      fc: 'PPL',   newAr: 'كوشتيا',        newBn: 'কুষ্টিয়া',         addAliasesEn: [], note: 'pop=136k Khulna Div' },
    { slug: 'tangail',      fc: 'PPL',   newAr: 'تنغايل',        newBn: 'টাঙ্গাইল',        addAliasesEn: [], note: 'pop=180k Dhaka Div' },
    { slug: 'faridpur',     fc: 'PPL',   newAr: 'فريدبور',       newBn: 'ফরিদপুর',        addAliasesEn: [], note: 'pop=112k Dhaka Div' },
    { slug: 'pabna',        fc: 'PPL',   newAr: 'بابنا',         newBn: 'পাবনা',          addAliasesEn: [], note: 'pop=187k Rajshahi Div' },
    { slug: 'sirajganj',    fc: 'PPL',   newAr: 'سراج غنج',      newBn: 'সিরাজগঞ্জ',       addAliasesEn: [], note: 'pop=127k Rajshahi Div; bn from GeoNames raw' },
    { slug: 'par-naogaon',  fc: 'PPL',   newAr: 'بار نوغاون',    newBn: 'নওগাঁ',           addAliasesEn: ['Naogaon'], note: 'pop=192k Rajshahi Div; common name "Naogaon"' },
    { slug: 'sherpur',      fc: 'PPL',   newAr: 'شيربور',        newBn: 'শেরপুর',         addAliasesEn: [], note: 'pop=107k Mymensingh Div (admin1=H)' },
    { slug: 'madaripur',    fc: 'PPL',   newAr: 'مادري بور',     newBn: 'মাদারীপুর',       addAliasesEn: [], note: 'pop=85k Dhaka Div' },
    { slug: 'narail',       fc: 'PPL',   newAr: 'نارايل',        newBn: 'নড়াইল',          addAliasesEn: [], note: 'pop=55k Khulna Div; bn from GeoNames raw' },
    { slug: 'satkhira',     fc: 'PPL',   newAr: 'ساتخيرا',       newBn: 'সাতক্ষীরা',       addAliasesEn: [], note: 'pop=129k Khulna Div' },
    { slug: 'dinajpur',     fc: 'PPL',   newAr: 'دينابور',       newBn: 'দিনাজপুর',       addAliasesEn: [], note: 'pop=206k Rangpur Div; bn from GeoNames raw' },
    { slug: 'thakurgaon',   fc: 'PPL',   newAr: 'تاكورغاون',     newBn: 'ঠাকুরগাঁও',       addAliasesEn: [], note: 'pop=71k Rangpur Div' },
    { slug: 'joypur-hat',   fc: 'PPL',   newAr: 'جوي بور هات',   newBn: 'জয়পুরহাট',       addAliasesEn: ['Joypurhat'], note: 'pop=73k Rajshahi Div; no-space form' },
    { slug: 'coxs-bazar',   fc: 'PPL',   newAr: 'كوكس بازار',    newBn: 'কক্সবাজার',      addAliasesEn: ["Cox's Bazar", 'Coxs Bazar'], note: 'pop=254k Chittagong Div; tourist hub' },
    { slug: 'brahmanbaria', fc: 'PPL',   newAr: 'براهمن باريا',  newBn: 'ব্রাহ্মণবাড়িয়া',  addAliasesEn: [], note: 'pop=264k Chittagong Div' },
    { slug: 'narayanganj',  fc: 'PPL',   newAr: 'نارايان غنج',   newBn: 'নারায়ণগঞ্জ',     addAliasesEn: [], note: 'pop=224k Dhaka Div; satellite of Dhaka' },
];

// ─── Slugs we MUST NOT merge (per plan §5) ────────────────────────────────
const DROP_SLUGS = new Set([
    'barishal',         // duplicate of barisal (1.8km)
    'kafrul',           // Dhaka thana (4.7km)
    'bhatara',          // Dhaka thana (4km)
    'motijheel',        // Dhaka thana (9.2km)
    'paltan',           // Dhaka thana (8.2km)
    'azimpur',          // Dhaka thana (9.4km)
    'tungi',            // Dhaka satellite (9.1km) - borderline
    'mohammadpur',      // pop-inflated, possibly upazila
    'hathazari',        // pop-inflated (Hathazari Upazila of Chittagong)
    'bandarban',        // pop-inflated (Hill District)
    'shibganj',         // pop-inflated upazila
    'natore',           // pop-inflated upazila
    'savar',            // Dhaka satellite upazila
    'narsingdi',        // district capital — defer to BATCH-1B
    'nagar-naluakot',   // unusual name — defer
]);

// ─── Existing 19 BD curated slugs (PRIOR-19 guard) ───────────────────────
const BD_PRIOR_19_SLUGS = new Set([
    // 6 seed
    'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal',
    // 13 BD-A
    'gazipur', 'comilla', 'bagerhat', 'mymensingh', 'bogra', 'jamalpur',
    'habiganj', 'feni', 'netrakona', 'lalmonirhat', 'rangpur',
    'nilphamari', 'gaibandha'
]);

function main() {
    // ─── Pre-flight validation ───
    const errors = [];
    const seenSlugs = new Set();
    const seenAr = new Map();
    const seenBn = new Map();
    for (const f of FIXES) {
        if (DROP_SLUGS.has(f.slug)) errors.push('FIXES targets DROP_SLUG: ' + f.slug);
        if (BD_PRIOR_19_SLUGS.has(f.slug)) errors.push('FIXES targets PRIOR-19 BD slug: ' + f.slug);
        if (seenSlugs.has(f.slug)) errors.push('Duplicate slug in FIXES: ' + f.slug);
        seenSlugs.add(f.slug);

        if (!isCleanArabic(f.newAr)) {
            errors.push(f.slug + ' newAr="' + f.newAr + '" fails clean-Arabic guard');
        }
        if (!isCleanBengaliScript(f.newBn)) {
            errors.push(f.slug + ' newBn="' + f.newBn + '" fails clean-Bengali guard');
        }
        if (seenAr.has(f.newAr)) {
            errors.push('DUP-AR: "' + f.newAr + '" used by ' + seenAr.get(f.newAr) + ' AND ' + f.slug);
        }
        if (seenBn.has(f.newBn)) {
            errors.push('DUP-BN: "' + f.newBn + '" used by ' + seenBn.get(f.newBn) + ' AND ' + f.slug);
        }
        seenAr.set(f.newAr, f.slug);
        seenBn.set(f.newBn, f.slug);

        for (const a of (f.addAliasesBn || [])) {
            if (!isCleanBengaliScript(a)) {
                errors.push(f.slug + ' addAliasesBn "' + a + '" fails clean-Bengali guard');
            }
        }
    }
    if (errors.length) {
        console.error('[bd-1a] FAILED pre-flight:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }
    console.log('[bd-1a] pre-flight OK — ' + FIXES.length + ' fixes validated (ar + bn + script guards)');

    // ─── Cross-check vs existing 19 BD curated ───
    const curated = JSON.parse(fs.readFileSync(
        'C:/Users/Tarek/Downloads/TIME PRAYER/db/places/curated-places.json', 'utf8'));
    const bdExisting = curated.filter(x => x.countryCode === 'bd');
    const existingArSet = new Set(bdExisting.map(e => e.names && e.names.ar).filter(Boolean));
    const existingBnSet = new Set(bdExisting.map(e => e.names && e.names.bn).filter(Boolean));
    const existingSlugSet = new Set(bdExisting.map(e => e.slug));

    const collisions = [];
    for (const f of FIXES) {
        if (existingArSet.has(f.newAr)) {
            collisions.push('Arabic collision: "' + f.newAr + '" already used by existing BD entry');
        }
        if (existingBnSet.has(f.newBn)) {
            collisions.push('Bengali collision: "' + f.newBn + '" already used by existing BD entry');
        }
        if (existingSlugSet.has(f.slug)) {
            collisions.push('Slug collision: bd/' + f.slug + ' already in curated');
        }
    }
    if (collisions.length) {
        console.error('[bd-1a] FAILED cross-check against existing 19 BD curated:');
        for (const c of collisions) console.error('  - ' + c);
        process.exit(1);
    }
    console.log('[bd-1a] cross-check OK — no collision with 19 existing BD entries');

    // ─── Load candidates JSON ───
    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    const stats = {
        approvedNew: 0,
        skippedIdempotent: 0,
        slugNotFound: [],
        aliasesEnAdded: 0,
        aliasesBnAdded: 0,
        nameArSet: 0,
        nameBnSet: 0,
    };
    const approvedRows = [];

    for (const fix of FIXES) {
        // Match candidates by slug + featureCode + status acceptable
        const matches = list.filter(e =>
            e.slug === fix.slug &&
            e.candidate &&
            e.candidate.featureCode === fix.fc &&
            (
                (e.status === 'needs_review' && e.reason === 'missing_real_ar_name')
                || (e.status === 'approved' && e.candidate.names.ar === fix.newAr && e.candidate.names.bn === fix.newBn)
            )
        );
        if (!matches.length) {
            stats.slugNotFound.push(fix.slug + ' (fc=' + fix.fc + ')');
            continue;
        }
        // Idempotent: skip if already applied
        const alreadyApplied = matches.find(e =>
            e.status === 'approved' && e.candidate.names.ar === fix.newAr && e.candidate.names.bn === fix.newBn
        );
        if (alreadyApplied) {
            console.log('[bd-1a] bd/' + fix.slug.padEnd(15) + ' SKIP (idempotent)');
            stats.skippedIdempotent++;
            continue;
        }

        // Pick the best match (highest pop)
        matches.sort((a, b) => (b.candidate.population || 0) - (a.candidate.population || 0));
        const target = matches[0];
        const oldAr = target.candidate.names.ar || '(empty)';
        const oldBn = target.candidate.names.bn || '(absent)';

        // Apply name.ar
        target.candidate.names.ar = fix.newAr;
        stats.nameArSet++;

        // Apply name.bn
        target.candidate.names.bn = fix.newBn;
        stats.nameBnSet++;

        // Drop polluted aliases.ar (only keep clean-Arabic per isCleanArabic)
        // Most needs_review entries have no Arabic aliases or only mojibake
        const currentAliasesAr = (target.candidate.aliases && target.candidate.aliases.ar) || [];
        const cleanedAliasesAr = currentAliasesAr.filter(a => isCleanArabic(a) && a !== fix.newAr);

        // Drop polluted aliases.bn (only keep clean-Bengali per isCleanBengaliScript)
        const currentAliasesBn = (target.candidate.aliases && target.candidate.aliases.bn) || [];
        const cleanedAliasesBn = currentAliasesBn.filter(a => isCleanBengaliScript(a) && a !== fix.newBn);
        // Add user-specified bn aliases
        for (const a of (fix.addAliasesBn || [])) {
            if (!cleanedAliasesBn.includes(a) && a !== fix.newBn) {
                cleanedAliasesBn.push(a);
                stats.aliasesBnAdded++;
            }
        }

        // Manage aliases.en — keep Stage 2 derived + add user-specified
        const currentAliasesEn = (target.candidate.aliases && target.candidate.aliases.en) || [];
        const cleanedAliasesEn = currentAliasesEn.slice(); // Keep all Stage 2 aliases.en
        for (const a of (fix.addAliasesEn || [])) {
            if (!cleanedAliasesEn.includes(a)) {
                cleanedAliasesEn.push(a);
                stats.aliasesEnAdded++;
            }
        }

        if (!target.candidate.aliases) target.candidate.aliases = {};
        target.candidate.aliases.ar = cleanedAliasesAr;
        target.candidate.aliases.bn = cleanedAliasesBn;
        target.candidate.aliases.en = cleanedAliasesEn;

        // Flip status + tier
        target.status = 'approved';
        target.tier = 'high';
        target.pendingAfterArGate = true;
        target.arQuality = {
            quality: 'manual',
            detail: 'user-supplied Arabic via ASIA-1D-BD-MISSING-AR-MAJORS-1A (plan ref: reports/asia-1d-bd-missing-ar-majors-1a-plan.md)',
            fromArTag: false
        };
        target.bnQuality = {
            quality: 'manual',
            detail: 'user-supplied Bengali (3 from GeoNames raw + 16 from Bengali Wikipedia canonical district titles)',
            fromAltsRaw: ['sirajganj', 'dinajpur', 'narail'].includes(fix.slug)
        };

        stats.approvedNew++;
        approvedRows.push({
            slug: fix.slug,
            fc: fix.fc,
            pop: target.candidate.population || 0,
            oldAr, newAr: fix.newAr,
            oldBn, newBn: fix.newBn,
            aliasesEnAddedRow: (fix.addAliasesEn || []).length,
            aliasesBnAddedRow: (fix.addAliasesBn || []).length
        });
        console.log('[bd-1a] bd/' + fix.slug.padEnd(15) +
            ' ar:"' + oldAr.slice(0, 14).padEnd(14) + '"→"' + fix.newAr.padEnd(18) + '"' +
            ' bn:"' + oldBn.slice(0, 6).padEnd(6) + '"→"' + fix.newBn + '"');
    }

    if (stats.slugNotFound.length) {
        console.error('[bd-1a] FAILED — slugs not found in candidates:');
        for (const s of stats.slugNotFound) console.error('  - ' + s);
        process.exit(1);
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-BD-MISSING-AR-MAJORS-1A — Apply Summary ═══');
    console.log('  Approved (new):              ' + stats.approvedNew);
    console.log('  Skipped (idempotent):        ' + stats.skippedIdempotent);
    console.log('  names.ar set:                ' + stats.nameArSet);
    console.log('  names.bn set:                ' + stats.nameBnSet);
    console.log('  aliases.en added:            ' + stats.aliasesEnAdded);
    console.log('  aliases.bn added:            ' + stats.aliasesBnAdded);
    console.log('  DROP_SLUGS (excluded):       ' + DROP_SLUGS.size);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        console.log('  bd/' + r.slug.padEnd(15)
            + '  pop=' + String(r.pop).padStart(8)
            + '  ' + r.fc.padEnd(6)
            + '  ar="' + r.newAr.padEnd(18) + '"  bn="' + r.newBn + '"');
    }
    console.log('');
    console.log('Ready for Stage 4 → node scripts/geodata/apply_curated_candidates.mjs bd');
}

main();
