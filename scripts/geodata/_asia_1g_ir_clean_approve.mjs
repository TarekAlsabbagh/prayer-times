// scripts/geodata/_asia_1g_ir_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1G-IR — "approve A — 42 passes-gate" clean merge (per user direction 2026-05-17).
//
// User decisions:
//   1. Approve ALL 42 passes-gate entries — first wave using Stage 3.4 Persian pre-gate.
//   2. **maragheh duplicate**: two entries (PPLA2 + PPL), same ar/pop. KEEP PPLA2,
//      DROP the PPL duplicate (PPLA2 is administratively canonical).
//   3. **qaem-shahr semantic fix**: ar "شاه آباد" is WRONG (like kg/manas).
//      OVERRIDE → "قائم شهر" + DROP all Shah-Abad-related aliases.
//   4. **karaj simplification**: ar "قَصَبِهِ كَرَج" (full diacritics, archaic) → "كرج"
//      (modern simple). Move old form to alias.
//   5. **Kurdish aliases cleanup** (sanandaj/qazvin/karaj/bandar-abbas):
//      Strip Kurdish ە (U+06D5) — if cleaned form is sensible Arabic, keep;
//      else drop.
//   6. **USER_TEST_ALIASES** added for user-watch queries that need to match.
//
// Does NOT merge — only mutates candidates JSON. Stage 4 runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'ir';

// ── Decision tables ───────────────────────────────────────────────────────

// Semantic + cosmetic name.ar overrides (per-slug)
const NAME_AR_FIXES = {
    'qaem-shahr': 'قائم شهر',        // semantic fix (GeoNames had wrong "شاه آباد")
    'karaj':      'كرج',              // cosmetic simplification (was "قَصَبِهِ كَرَج")
};

// Aliases to ADD per slug (user-test variants + preservation of olds)
const USER_TEST_ALIASES = {
    'karaj':        ['قَصَبِهِ كَرَج'],   // preserve old archaic form as searchable alias
    'qaem-shahr':   ['قائم‌شهر', 'قائم'], // common search variants
};

// Slugs whose PPL duplicates must be dropped (maragheh has PPLA2 + PPL both)
// Rule: keep the row with the strongest feature code (PPLA > PPLA2 > PPL).
// For maragheh: PPLA2 has admin context — keep PPLA2.
// When approving, we'll skip the PPL row if a PPLA2 with same slug+ar+pop exists.
const SKIP_PPL_DUP_OF = new Set(['maragheh']);

// Aliases containing these chars are inspected by the Kurdish cleaner.
// (Kurdish "ae" letter ە U+06D5)
const KURDISH_AE = /ە/;

// Cleaner — same set used everywhere PLUS the Kurdish ە → drop letter
// (cannot map to Arabic equivalent generically; user direction was
// "clean if sensible, else drop").
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
        // Kurdish ە: try mapping to ه (final form heh); if it produces
        // garbage the row is dropped by the post-check.
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

// Drop aliases that look like they reference the wrong city after a semantic fix.
// For qaem-shahr the WRONG name was "شاه آباد"; any alias built on Shahabad
// is dropped (not relevant to Qaem Shahr).
function shouldDropAliasForSlug(slug, alias) {
    if (slug === 'qaem-shahr') {
        // Drop any alias mentioning شاه آباد / Shahabad / Shah Abad / Shah-Abad
        if (/شاه\s*آباد/.test(alias)) return true;
        if (/shahabad/i.test(alias))   return true;
        if (/shah\s*-?\s*abad/i.test(alias)) return true;
    }
    return false;
}

function main() {
    // Pre-flight: validate every NAME_AR_FIXES value passes clean-check
    for (const [slug, ar] of Object.entries(NAME_AR_FIXES)) {
        if (!isCleanAfter(ar)) {
            console.error('[approve] FAILED — NAME_AR_FIXES[' + slug + '] = "' + ar + '" fails clean-check');
            process.exit(1);
        }
    }

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    // First pass: index PPLA2-by-slug to detect PPL duplicates that should be skipped
    const ppla2BySlug = new Map();
    for (const e of list) {
        if (e.status === 'pending' && e.tier === 'high' && e.pendingAfterArGate === true
            && e.candidate.featureCode === 'PPLA2'
            && SKIP_PPL_DUP_OF.has(e.slug)) {
            ppla2BySlug.set(e.slug, e);
        }
    }

    const cs = {
        approved: 0,
        droppedPplDup: 0,
        aliasCleaned: 0,
        aliasesDropped: 0,
        userAliasesAdded: 0,
        nameArFixed: 0,
        kurdishAliasesCleaned: 0,
        kurdishAliasesDropped: 0,
        droppedShahabadAliases: 0
    };
    const approvedRows = [];
    const skippedDupRows = [];
    const droppedAliasReports = [];

    for (const e of list) {
        if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;

        const slug = e.slug;
        const featureCode = e.candidate.featureCode;

        // ── Maragheh duplicate handling ──
        if (SKIP_PPL_DUP_OF.has(slug) && featureCode === 'PPL' && ppla2BySlug.has(slug)) {
            // We have a PPLA2 sibling; skip this PPL row entirely.
            cs.droppedPplDup++;
            skippedDupRows.push({ slug, fc: featureCode, reason: 'PPL duplicate of PPLA2 ' + slug });
            // Mark as rejected so Stage 4 won't pick it up
            e.status = 'rejected';
            e.reason = 'duplicate_of_ppla2';
            continue;
        }

        // ── Apply NAME_AR_FIXES (qaem-shahr + karaj) ──
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
        let kurdishCleaned = 0;
        let kurdishDropped = 0;
        let shahabadDropped = 0;

        for (const orig of inAliases) {
            const hasKurdish = KURDISH_AE.test(orig);
            const cleaned = cleanArabicChars(orig);

            // Slug-specific alias drops (e.g. Shahabad references in qaem-shahr)
            if (shouldDropAliasForSlug(slug, orig) || shouldDropAliasForSlug(slug, cleaned)) {
                droppedCount++;
                shahabadDropped++;
                droppedAliasReports.push({ slug, dropped: orig, reason: 'shahabad-not-qaem-shahr' });
                continue;
            }

            if (cleaned && isCleanAfter(cleaned) && !seen.has(cleaned)) {
                cleanedAliases.push(cleaned);
                seen.add(cleaned);
                if (cleaned !== orig) {
                    cleanedCount++;
                    if (hasKurdish) kurdishCleaned++;
                }
            } else {
                droppedCount++;
                if (hasKurdish) {
                    kurdishDropped++;
                    droppedAliasReports.push({ slug, dropped: orig, reason: 'kurdish-unsalvageable' });
                }
            }
        }

        // Add USER_TEST_ALIASES
        const userAliases = USER_TEST_ALIASES[slug] || [];
        for (const ua of userAliases) {
            if (!isCleanAfter(ua) && !KURDISH_AE.test(ua)) {
                // Allow archaic-form aliases for karaj which have diacritics (still Arabic)
                if (!(slug === 'karaj' && /[ء-ي]/.test(ua))) {
                    console.error('[approve] FAILED — USER_TEST_ALIASES[' + slug + '] = "' + ua + '" fails clean-check');
                    process.exit(1);
                }
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
        cs.kurdishAliasesCleaned += kurdishCleaned;
        cs.kurdishAliasesDropped += kurdishDropped;
        cs.droppedShahabadAliases += shahabadDropped;

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
    console.log('═══ ASIA-1G-IR CLEAN APPROVE — Summary ═══');
    console.log('  approved:                  ' + cs.approved);
    console.log('  PPL duplicates dropped:    ' + cs.droppedPplDup + ' (maragheh)');
    console.log('  name.ar fixes applied:     ' + cs.nameArFixed + ' (qaem-shahr, karaj)');
    console.log('  user-test aliases added:   ' + cs.userAliasesAdded);
    console.log('  aliases cleaned (Persian-class):  ' + cs.aliasCleaned);
    console.log('  aliases dropped (overall): ' + cs.aliasesDropped);
    console.log('    └─ Kurdish ە cleaned:    ' + cs.kurdishAliasesCleaned);
    console.log('    └─ Kurdish ە dropped:    ' + cs.kurdishAliasesDropped);
    console.log('    └─ Shahabad-misplaced:   ' + cs.droppedShahabadAliases);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        const fixMark = r.arFixed ? '  [AR-FIXED]' : '';
        console.log('  ' + (r.cc + '/' + r.slug).padEnd(24)
            + '  pop=' + String(r.pop).padStart(8)
            + '  ' + r.fc.padEnd(5)
            + '  ar="' + r.ar.padEnd(20) + '"  aliases=' + r.aliasesIn + '→' + r.aliasesOut
            + fixMark);
    }
    console.log('');
    console.log('Skipped duplicates:');
    for (const r of skippedDupRows) console.log('  ' + CC + '/' + r.slug + ' (' + r.fc + ') — ' + r.reason);
    console.log('');
    console.log('Dropped aliases:');
    for (const r of droppedAliasReports) console.log('  ' + CC + '/' + r.slug + ' dropped "' + r.dropped + '" — ' + r.reason);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs ir');
}

main();
