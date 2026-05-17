// scripts/geodata/_asia_1e_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1E — "approve all 63" clean merge (per user direction 2026-05-17).
//
// User decisions:
//   1. Approve ALL 63 passes-gate entries:
//        NP 4 + LK 7 + MV 5 + BT 5 + BN 2 + MM 13 + KH 11 + LA 7 + TL 9
//      All names.ar already clean from Stage 3.5 (no NAME_AR_FIXES needed).
//   2. Apply Persian/Urdu → Arabic cleaning rules to aliases.ar of the 63
//      passes-gate entries (ی→ي ک→ك پ→ب گ→غ چ→ج ٹ→ت ڈ→د ڑ→ر ہ→ه ے→ي ۀ→ه).
//   3. If alias still has Persian/Urdu/Latin glyphs after cleaning OR is
//      mojibake → drop it.
//   4. Add USER_TEST_ALIASES for 6 entries where user's preferred query
//      spelling differs from the canonical name.ar (search-only, primary
//      name.ar unchanged). Same pattern as ASIA-1B-MCF + ASIA-1C.
//   5. Flip status='approved' for all 63.
//   6. 72 blocked-major candidates deferred to ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1
//      (includes BN bandar-seri-begawan PPLC, BT thimphu PPLC, MM mawlamyine 438k,
//      NP butwal 195k, LK trincomalee 108k, etc.).
//
// Does NOT merge — only mutates candidates JSONs to set status=approved
// for the clean set. Stage 4 (apply_curated_candidates.mjs) runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['np','lk','mv','bt','bn','mm','kh','la','tl'];

// User-approved name.ar corrections — NONE this wave (all name.ar clean as-is).
const NAME_AR_FIXES = {};

// USER_TEST_ALIASES — add searchable Arabic-spelling variants for entries where
// the user's natural query differs from the canonical Stage 3.5 name.ar:
//   np/janakpur:    name.ar "جانكبور"     → user types "جاناكبور" (extra alif)
//   lk/galle:       name.ar "غالي"        → user types "جالي" (ج first letter)
//   mv/hithadhoo:   name.ar "هيثاذو"      → user types "هيثادهو" (د not ذ)
//   mm/pathein:     name.ar "باثيين"      → user types "باتهين" (alt spelling)
//   kh/battambang:  name.ar "باتامبانج"   → user types "باتامبانغ" (غ not ج)
//   la/savannakhet: name.ar "سافان ناخيت" → user types "سافاناكيت" (no space, alt)
const USER_TEST_ALIASES = {
    'np/janakpur':    ['جاناكبور'],
    'lk/galle':       ['جالي'],
    'mv/hithadhoo':   ['هيثادهو'],
    'mm/pathein':     ['باتهين'],
    'kh/battambang':  ['باتامبانغ'],
    'la/savannakhet': ['سافاناكيت']
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
        .replace(/ۀ/g, 'ه')
        .replace(/[‌‍]/g, ''); // ZWNJ, ZWJ
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

            // Apply NAME_AR_FIXES (none this wave, but pattern preserved)
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
    console.log('═══ ASIA-1E CLEAN APPROVE — Summary ═══');
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
        console.log('  ' + (r.cc + '/' + r.slug).padEnd(28) + '  pop=' + String(r.pop).padStart(8)
            + '  ar="' + r.ar + '"  aliases=' + r.aliasesIn + '→' + r.aliasesOut);
    }
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs np/lk/mv/bt/bn/mm/kh/la/tl');
}

main();
