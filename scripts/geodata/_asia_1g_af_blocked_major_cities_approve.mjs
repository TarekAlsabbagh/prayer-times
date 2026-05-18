// scripts/geodata/_asia_1g_af_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 — approve 8 deferred AF PPLA cities
// from ASIA-1G-AF that were blocked by Stage 3.5 (all `mixed_latin` —
// romanized-Latin strings Stage 3.4 cannot synthesize Arabic from).
//
// User decision (2026-05-18): "approve all 8" with explicit choices for
// the 2 variant-rows:
//   - lashkar-gah → "لشكر جاه" (AR Wikipedia canonical; "جاه" Arabic
//                  convention, NOT "گاه" Persian or "غاه" mechanical default)
//   - tarinkot    → "ترين كوت" (standard ت, NOT emphatic ط)
//
// 6 pre-approved:
//   kandahar     → قندهار
//   farah        → فراه
//   fayroz-koh   → فيروز كوه   (+ keep alias جغجران — historical name "Chaghcharan")
//   qala-i-naw   → قلعة نو     (+ keep clean variants قلعة ناو / قلعه ناو / قلعه نو)
//   maydanshakhr → ميدان شهر
//   parun        → بارون
//
// All 8 use bare slugs — 0 collisions, 0 renames per review report.
//
// Polluted aliases to be auto-dropped by the clean-check:
//   lashkar-gah: لشكرغاه بسټ   (Pashto ټ U+067C — not in PERSIAN_CHAR_MAP)
//   qala-i-naw:  qlʿە nw       (Latin + Kurdish ە)
//   parun:       parwں, باروں  (Latin / Urdu ں U+06BA)
//
// Mutates only af-geonames-candidates.json. Idempotent re-run support.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'af';

// Same character class as standard Arabic-quality gate
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆۇۈېەڕڼ]/;
const LATIN = /[A-Za-z]/;
// Urdu ں (U+06BA) is NOT in PERSIAN_CHAR_MAP — explicitly invalid for AF aliases
const URDU_NUN_GHUNNA = /[ں]/;
// Pashto ټ (U+067C) is NOT mapped — invalid for AF aliases
const PASHTO_TT = /[ټ]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه').replace(/ۆ/g, 'و')
        .replace(/ڕ/g, 'ر').replace(/ە/g, 'ه')
        // Pashto extensions
        .replace(/ښ/g, 'ش').replace(/ګ/g, 'غ').replace(/څ/g, 'ج')
        .replace(/ځ/g, 'ز').replace(/ډ/g, 'د').replace(/ړ/g, 'ر')
        .replace(/ڼ/g, 'ن')
        // ZWNJ / ZWJ strip
        .replace(/[‌‍]/g, '');
}

function isCleanArabic(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN.test(stripped))  return false;
    if (URDU_NUN_GHUNNA.test(stripped)) return false;
    if (PASHTO_TT.test(stripped)) return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// ═══ FIXES — 8 entries with user-approved name.ar ═══
const FIXES = [
    { slug: 'kandahar',     newAr: 'قندهار',     note: 'largest deferral, user-priority' },
    { slug: 'lashkar-gah',  newAr: 'لشكر جاه',   note: 'AR Wikipedia canonical convention (NOT "گاه" Persian)' },
    { slug: 'farah',        newAr: 'فراه',       note: 'matches existing alias' },
    { slug: 'fayroz-koh',   newAr: 'فيروز كوه',  note: 'matches existing alias; keep جغجران (historical Chaghcharan name)' },
    { slug: 'tarinkot',     newAr: 'ترين كوت',   note: 'standard ت (NOT emphatic ط)' },
    { slug: 'qala-i-naw',   newAr: 'قلعة نو',    note: 'matches existing alias; keep 3 clean variants' },
    { slug: 'maydanshakhr', newAr: 'ميدان شهر',  note: 'matches existing alias' },
    { slug: 'parun',        newAr: 'بارون',      note: 'matches existing alias (Persian پارون would fail Stage 3.5)' },
];

function main() {
    // Pre-flight: every newAr must pass clean-check
    const arErrors = [];
    const seenAr = new Map();
    for (const fix of FIXES) {
        if (!isCleanArabic(fix.newAr)) {
            arErrors.push(fix.slug + ' → newAr="' + fix.newAr + '" failed clean-check');
        }
        if (seenAr.has(fix.newAr)) {
            arErrors.push('DUP-AR: "' + fix.newAr + '" used by ' + seenAr.get(fix.newAr) + ' AND ' + fix.slug);
        }
        seenAr.set(fix.newAr, fix.slug);
    }
    if (arErrors.length) {
        console.error('[af-mcf] FAILED — pre-flight:');
        for (const e of arErrors) console.error('  - ' + e);
        process.exit(1);
    }

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    let totalApproved = 0;
    let totalSkipped = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalAliasesPreserved = 0;

    for (const fix of FIXES) {
        const slug = fix.slug;
        // Allow either the still-blocked pending row, or an already-approved row
        // with the target name.ar (idempotent re-run)
        const candidates = list.filter(e =>
            e.slug === slug
            && e.tier === 'high'
            && (e.status === 'pending'
                || (e.status === 'approved' && e.candidate.names.ar === fix.newAr))
        );
        if (!candidates.length) {
            console.error('[af-mcf] FAILED — no blocked-high-tier entry for af/' + slug);
            process.exit(1);
        }
        const alreadyApplied = candidates.find(c =>
            c.status === 'approved' && c.candidate.names.ar === fix.newAr
        );
        if (alreadyApplied) {
            console.log('[af-mcf] af/' + slug.padEnd(20) + ' SKIP (already applied)');
            totalSkipped++;
            continue;
        }

        // Pick best candidate (should be only one for AF — PPLA per slug)
        const target = candidates[0];
        const oldAr = target.candidate.names.ar || '(empty)';

        // 1. Apply NAME_AR_FIX
        target.candidate.names.ar = fix.newAr;

        // 2. Clean aliases
        const inAliases = (target.candidate.aliases && target.candidate.aliases.ar) || [];
        const cleanedAliases = [];
        const seen = new Set([fix.newAr]);
        let cleanedCount = 0;
        let droppedCount = 0;
        let preservedCount = 0;

        for (const orig of inAliases) {
            const cleaned = cleanArabicChars(orig);
            if (cleaned && isCleanArabic(cleaned) && !seen.has(cleaned)) {
                cleanedAliases.push(cleaned);
                seen.add(cleaned);
                if (cleaned !== orig) cleanedCount++;
                else preservedCount++;
            } else {
                droppedCount++;
            }
        }
        target.candidate.aliases = target.candidate.aliases || {};
        target.candidate.aliases.ar = cleanedAliases;
        totalAliasCleaned += cleanedCount;
        totalAliasesDropped += droppedCount;
        totalAliasesPreserved += preservedCount;

        // 3. Flip status + arQuality
        target.status = 'approved';
        target.pendingAfterArGate = true;
        target.arQuality = {
            quality: 'manual',
            detail: 'user-supplied canonical Arabic via ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1',
            fromArTag: false,
        };

        totalApproved++;
        console.log('[af-mcf] af/' + slug.padEnd(20) +
            ' ar:"' + (oldAr.slice(0, 22) || '').padEnd(22) + '" → "' + fix.newAr + '"' +
            '  aliases=' + inAliases.length + '→' + cleanedAliases.length +
            '  (' + fix.note + ')');
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 — Summary ═══');
    console.log('  Total approved (new):                ' + totalApproved);
    console.log('  Total skipped (idempotent):          ' + totalSkipped);
    console.log('  Aliases cleaned (Persian→Arabic):    ' + totalAliasCleaned);
    console.log('  Aliases preserved (already clean):   ' + totalAliasesPreserved);
    console.log('  Aliases dropped (mojibake/Pashto/Urdu/Latin): ' + totalAliasesDropped);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs af');
}

main();
