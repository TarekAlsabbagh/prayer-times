// scripts/geodata/_asia_1d_pk_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1D-PK — "approve A — 43 passes-gate + 3 NAME_AR_FIXES" clean merge
// per user direction 2026-05-19.
//
// User decisions:
//   1. Approve ALL 43 passes-gate entries from Stage 3.5.
//   2. **bahawalnagar NAME_AR_FIX**: GeoNames had "بهاولبور" which is
//      "Bahawalpur" — a DIFFERENT city. Semantic mismatch like IR's
//      `qaem-shahr` (شاه آباد→قائم شهر) and KG's `manas` (جلال آباد→ماناس).
//      OVERRIDE → "بهاولنغر" + DO NOT add wrong "بهاولبور" as alias.
//   3. **mailsi NAME_AR_FIX**: GeoNames had "تصيل ميلسي" (admin-area
//      prefix "تصيل" — misspelling of "تحصيل" meaning sub-district).
//      OVERRIDE → "ميلسي" + DO NOT add the prefixed form as alias.
//   4. **chishtian NAME_AR_FIX**: GeoNames had "ششتيان شريف" (historical
//      honorific suffix "شريف"). OVERRIDE → "ششتيان" (modern admin name)
//      + keep "ششتيان شريف" as alias (clean and useful for historical search).
//
// Does NOT merge — only mutates candidates JSON. Stage 4 runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'pk';

// ── Decision tables ───────────────────────────────────────────────────────

// Semantic + cosmetic name.ar overrides (per-slug)
const NAME_AR_FIXES = {
    'bahawalnagar': 'بهاولنغر',  // semantic fix (GeoNames had wrong "بهاولبور" = Bahawalpur)
    'mailsi':       'ميلسي',     // strip admin prefix "تصيل"
    'chishtian':    'ششتيان'     // strip honorific suffix "شريف" (kept as alias)
};

// Aliases to ADD per slug (user-test variants + preservation of olds)
// chishtian gets "ششتيان شريف" as historical alias (clean Arabic, useful for search)
const USER_TEST_ALIASES = {
    'chishtian': ['ششتيان شريف']
};

// Aliases EXPLICITLY DROPPED per user direction
//   bahawalnagar.بهاولبور → DROPPED (collision with bahawalpur which is
//     a different missing-ar city; user said "do NOT add as alias")
//   mailsi.تصيل ميلسي → DROPPED (admin-prefix variant, not standard city name)
const SHOULD_DROP_ALIAS = {
    'bahawalnagar': new Set(['بهاولبور']),
    'mailsi':       new Set(['تصيل ميلسي'])
};

// Cleaner — same set as IR + Persian/Urdu/Pashto/Kurdish chars to reject
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆڕە]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه')
        .replace(/ۆ/g, 'و').replace(/ڕ/g, 'ر')
        .replace(/ە/g, 'ه')
        .replace(/[‌‍]/g, '');
}

function isCleanAfter(s) {
    if (!s) return false;
    if (PERSIAN_URDU.test(s)) return false;
    if (LATIN.test(s)) return false;
    if (!/[ء-ي]/.test(s)) return false;
    return true;
}

function main() {
    // Pre-flight: validate every NAME_AR_FIXES value passes clean-check
    for (const [slug, ar] of Object.entries(NAME_AR_FIXES)) {
        if (!isCleanAfter(ar)) {
            console.error('[approve] FAILED — NAME_AR_FIXES[' + slug + '] = "' + ar + '" fails clean-check');
            process.exit(1);
        }
    }
    // Pre-flight: validate every USER_TEST_ALIASES value
    for (const [slug, list] of Object.entries(USER_TEST_ALIASES)) {
        for (const a of list) {
            if (!isCleanAfter(a)) {
                console.error('[approve] FAILED — USER_TEST_ALIASES[' + slug + '] = "' + a + '" fails clean-check');
                process.exit(1);
            }
        }
    }
    console.log('[approve] pre-flight OK — ' + Object.keys(NAME_AR_FIXES).length + ' NAME_AR_FIXES validated, '
        + Object.values(USER_TEST_ALIASES).flat().length + ' USER_TEST_ALIASES validated');

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    const cs = {
        approved: 0,
        aliasCleaned: 0,
        aliasesDropped: 0,
        userAliasesAdded: 0,
        nameArFixed: 0,
        droppedSemanticAliases: 0
    };
    const approvedRows = [];
    const droppedAliasReports = [];

    for (const e of list) {
        if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;

        const slug = e.slug;
        const featureCode = e.candidate.featureCode;

        // ── Apply NAME_AR_FIXES (bahawalnagar + mailsi + chishtian) ──
        if (NAME_AR_FIXES[slug]) {
            const oldAr = e.candidate.names.ar;
            const newAr = NAME_AR_FIXES[slug];
            if (oldAr !== newAr) {
                e.candidate.names.ar = newAr;
                cs.nameArFixed++;
                console.log('[approve]   FIX-AR ' + slug + ': "' + oldAr + '" → "' + newAr + '"');
            }
        }

        // Defense in depth
        if (!isCleanAfter(e.candidate.names.ar)) {
            console.error('[approve] FAILED — ' + slug + ' name.ar fails clean-check: "' + e.candidate.names.ar + '"');
            process.exit(1);
        }

        // ── Process aliases ──
        const inAliases = (e.candidate.aliases && e.candidate.aliases.ar) || [];
        const cleanedAliases = [];
        const seen = new Set([e.candidate.names.ar]);
        let cleanedCount = 0;
        let droppedCount = 0;
        let semanticDropped = 0;

        const dropSet = SHOULD_DROP_ALIAS[slug] || new Set();

        for (const orig of inAliases) {
            // Slug-specific alias drops (semantic mismatches)
            if (dropSet.has(orig)) {
                droppedCount++;
                semanticDropped++;
                droppedAliasReports.push({ slug, dropped: orig, reason: 'semantic-mismatch (user direction)' });
                continue;
            }

            const cleaned = cleanArabicChars(orig);
            if (cleaned && isCleanAfter(cleaned) && !seen.has(cleaned) && !dropSet.has(cleaned)) {
                cleanedAliases.push(cleaned);
                seen.add(cleaned);
                if (cleaned !== orig) cleanedCount++;
            } else {
                droppedCount++;
            }
        }

        // Add USER_TEST_ALIASES
        const userAliases = USER_TEST_ALIASES[slug] || [];
        for (const ua of userAliases) {
            if (!isCleanAfter(ua)) {
                console.error('[approve] FAILED — USER_TEST_ALIASES[' + slug + '] = "' + ua + '" fails clean-check');
                process.exit(1);
            }
            if (!seen.has(ua)) {
                cleanedAliases.push(ua);
                seen.add(ua);
                cs.userAliasesAdded++;
                console.log('[approve]   ALIAS-ADD ' + slug + ' += "' + ua + '"');
            }
        }

        if (e.candidate.aliases) e.candidate.aliases.ar = cleanedAliases;
        else e.candidate.aliases = { ar: cleanedAliases };

        cs.aliasCleaned += cleanedCount;
        cs.aliasesDropped += droppedCount;
        cs.droppedSemanticAliases += semanticDropped;

        e.status = 'approved';
        cs.approved++;
        approvedRows.push({
            cc: CC, slug,
            ar: e.candidate.names.ar,
            en: e.candidate.names.en,
            fc: featureCode,
            pop: e.candidate.population || 0,
            aliasesIn: inAliases.length,
            aliasesOut: cleanedAliases.length,
            arFixed: Boolean(NAME_AR_FIXES[slug])
        });
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1D-PK CLEAN APPROVE — Summary ═══');
    console.log('  approved:                     ' + cs.approved);
    console.log('  name.ar fixes applied:        ' + cs.nameArFixed + ' (bahawalnagar, mailsi, chishtian)');
    console.log('  user-test aliases added:      ' + cs.userAliasesAdded);
    console.log('  aliases cleaned (Persian→AR): ' + cs.aliasCleaned);
    console.log('  aliases dropped (overall):    ' + cs.aliasesDropped);
    console.log('    └─ semantic mismatch drops: ' + cs.droppedSemanticAliases);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        const fixMark = r.arFixed ? '  [AR-FIXED]' : '';
        console.log('  ' + (r.cc + '/' + r.slug).padEnd(28)
            + '  pop=' + String(r.pop).padStart(8)
            + '  ' + r.fc.padEnd(5)
            + '  ar="' + r.ar.padEnd(18) + '"  aliases=' + r.aliasesIn + '→' + r.aliasesOut
            + fixMark);
    }
    console.log('');
    console.log('Dropped aliases:');
    for (const r of droppedAliasReports) console.log('  ' + CC + '/' + r.slug + ' dropped "' + r.dropped + '" — ' + r.reason);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs pk');
}

main();
