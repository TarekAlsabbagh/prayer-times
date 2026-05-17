// scripts/geodata/_asia_1c_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1C — "approve all 71" clean merge (per user direction 2026-05-17).
//
// User decisions:
//   1. Approve ALL 71 passes-gate entries (JP 53 + KR 13 + HK 1 + TW 4 + MO 0)
//      → effective 71 across JP/KR/HK/TW (MO has 0 passes-gate)
//   2. Accept incomplete compound names AS-IS (no -shi/-si suffix in name.ar):
//        jp/tottori-shi  → "توتوري"
//        jp/nara-shi     → "نارا"
//        kr/cheongju-si  → "تشيونغجو"
//      (rationale: same pattern as jambi-city/mandaluyong-city in ASIA-1A/1B)
//   3. Add OPTIONAL user-test-variant aliases for the 3 above (search-only,
//      NOT primary name.ar) so users searching "نارا شي" or "توتوري شي" or
//      "تشيونغجو سي" still find them.
//   4. Apply Persian/Urdu → Arabic cleaning rules to aliases.ar of the 71
//      passes-gate entries (ی→ي ک→ك پ→ب گ→غ چ→ج ٹ→ت ڈ→د ڑ→ر ہ→ه ے→ي ۀ→ه).
//   5. If alias still has Persian/Urdu/Latin glyphs after cleaning OR is
//      mojibake → drop it.
//   6. Flip status='approved' for all 71.
//   7. NO NAME_AR_FIXES this wave (every passes-gate name.ar is clean as-is).
//   8. The 26 blocked-major candidates (kaohsiung/macau/higashiosaka/etc.)
//      are NOT touched — deferred to ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1.
//
// Does NOT merge — only mutates candidates JSONs to set status=approved
// for the clean set. Stage 4 (apply_curated_candidates.mjs) runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['jp','kr','hk','tw','mo'];

// User-approved name.ar corrections (cc/slug → new ar). None this wave.
const NAME_AR_FIXES = {};

// USER_TEST_ALIASES — add these aliases to passes-gate entries so user-test
// variants are searchable WITHOUT changing primary name.ar. Pattern proven
// in ASIA-1B-MCF (vn/thanh-hoa + ثانه هوا, etc.).
// For ASIA-1C: 3 incomplete-compound entries get their "with -shi/-si"
// variant as a searchable alias.
const USER_TEST_ALIASES = {
    'jp/tottori-shi': ['توتوري شي'],
    'jp/nara-shi':    ['نارا شي'],
    'kr/cheongju-si': ['تشيونغجو سي']
};

// Arabic-name cleaning regex map (per user-approved rules)
// ی → ي    ک → ك    گ → غ (default)    پ → ب    چ → ج
// ٹ → ت    ڈ → د    ڑ → ر    ہ → ه    ے → ي    ۀ → ه
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي')
        .replace(/ک/g, 'ك')
        .replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ')   // default — may be wrong; drop if Persian-leftover remains
        .replace(/چ/g, 'ج')
        .replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د')
        .replace(/ڑ/g, 'ر')
        .replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي')
        .replace(/ۀ/g, 'ه');
}

function isCleanAfter(s) {
    if (!s) return false;
    if (PERSIAN_URDU.test(s)) return false;
    if (LATIN.test(s)) return false;
    if (!/[ء-ي]/.test(s)) return false;
    return true;
}

function main() {
    // Pre-flight: validate proposed NAME_AR_FIXES + USER_TEST_ALIASES pass clean-check
    for (const [key, newAr] of Object.entries(NAME_AR_FIXES)) {
        if (!isCleanAfter(newAr)) {
            console.error('[approve] FAILED — NAME_AR_FIXES[' + key + '] = "' + newAr + '" fails clean-check');
            process.exit(1);
        }
    }
    for (const [key, aliases] of Object.entries(USER_TEST_ALIASES)) {
        for (const a of aliases) {
            if (!isCleanAfter(a)) {
                console.error('[approve] FAILED — USER_TEST_ALIASES[' + key + '] = "' + a + '" fails clean-check');
                process.exit(1);
            }
        }
    }

    const summary = {};
    let totalApproved = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalNameFixed = 0;
    let totalUserAliasesAdded = 0;
    const approvedRows = [];

    for (const cc of CCS) {
        const p = pathsFor(cc);
        if (!fs.existsSync(p.candidatesJson)) {
            console.log('[approve] ' + cc.toUpperCase() + ': SKIP (no candidates JSON)');
            summary[cc] = { approved: 0, aliasCleaned: 0, aliasesDropped: 0, nameFixed: 0, userAliasesAdded: 0 };
            continue;
        }
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const cs = { approved: 0, aliasCleaned: 0, aliasesDropped: 0, nameFixed: 0, userAliasesAdded: 0 };

        for (const e of list) {
            if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;

            const key = cc + '/' + e.slug;

            // Apply NAME_AR_FIXES first (if any) BEFORE clean-check
            if (NAME_AR_FIXES[key]) {
                const oldAr = e.candidate.names.ar;
                const newAr = NAME_AR_FIXES[key];
                e.candidate.names.ar = newAr;
                cs.nameFixed++;
                totalNameFixed++;
                console.log('[approve]   NAME-FIX ' + key + ' ar: "' + oldAr + '" → "' + newAr + '"');
            }

            // Defense in depth: re-verify name.ar is clean
            if (!isCleanAfter(e.candidate.names.ar)) {
                console.error('[approve] FAILED — ' + cc + '/' + e.slug
                    + ' name.ar fails clean-check: "' + e.candidate.names.ar + '"');
                process.exit(1);
            }

            // Clean aliases.ar
            const aliases = (e.candidate.aliases && e.candidate.aliases.ar) || [];
            const cleanedAliases = [];
            const seen = new Set([e.candidate.names.ar]);
            let cleanedCount = 0;
            let droppedCount = 0;
            for (const orig of aliases) {
                const cleaned = cleanArabicChars(orig);
                if (cleaned && isCleanAfter(cleaned) && !seen.has(cleaned)) {
                    cleanedAliases.push(cleaned);
                    seen.add(cleaned);
                    if (cleaned !== orig) cleanedCount++;
                } else {
                    droppedCount++;
                }
            }

            // Append USER_TEST_ALIASES if present and not duplicate
            const userAliases = USER_TEST_ALIASES[key] || [];
            for (const ua of userAliases) {
                if (!seen.has(ua)) {
                    cleanedAliases.push(ua);
                    seen.add(ua);
                    cs.userAliasesAdded++;
                    totalUserAliasesAdded++;
                    console.log('[approve]   ALIAS-ADD ' + key + ' += "' + ua + '"');
                }
            }

            if (e.candidate.aliases) {
                e.candidate.aliases.ar = cleanedAliases;
            } else {
                e.candidate.aliases = { ar: cleanedAliases };
            }
            cs.aliasCleaned += cleanedCount;
            cs.aliasesDropped += droppedCount;
            totalAliasCleaned += cleanedCount;
            totalAliasesDropped += droppedCount;

            // Flip status
            e.status = 'approved';
            cs.approved++;
            totalApproved++;
            approvedRows.push({
                cc, slug: e.slug,
                ar: e.candidate.names.ar,
                en: e.candidate.names.en,
                fc: e.candidate.featureCode,
                pop: e.candidate.population || 0,
                aliasesIn: aliases.length,
                aliasesOut: cleanedAliases.length
            });
        }

        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        summary[cc] = cs;
        console.log('[approve] ' + cc.toUpperCase() + ': ' + JSON.stringify(cs));
    }

    console.log('');
    console.log('═══ ASIA-1C CLEAN APPROVE — Summary ═══');
    for (const cc of CCS) {
        const cs = summary[cc];
        console.log('  ' + cc.toUpperCase() + ': approved=' + cs.approved
            + ' nameFixed=' + cs.nameFixed
            + ' userAliasesAdded=' + cs.userAliasesAdded
            + ' aliasCleaned=' + cs.aliasCleaned
            + ' aliasesDropped=' + cs.aliasesDropped);
    }
    console.log('  TOTAL approved: ' + totalApproved);
    console.log('  TOTAL name.ar fixed: ' + totalNameFixed);
    console.log('  TOTAL user-test aliases added: ' + totalUserAliasesAdded);
    console.log('  TOTAL alias cleaned: ' + totalAliasCleaned);
    console.log('  TOTAL alias dropped: ' + totalAliasesDropped);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        console.log('  ' + r.cc + '/' + r.slug.padEnd(28) + '  pop=' + String(r.pop).padStart(8)
            + '  ar="' + r.ar + '"  aliases=' + r.aliasesIn + '→' + r.aliasesOut);
    }
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs jp/kr/hk/tw/mo');
}

main();
