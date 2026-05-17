// scripts/geodata/_asia_1h_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1H — "approve A — 43 passes-gate" clean merge (per user direction 2026-05-17).
//
// User decisions:
//   1. Approve ALL 43 passes-gate entries (UZ 8 + KZ 11 + TJ 5 + KG 2 + TM 5 + MN 12).
//   2. Apply Persian/Urdu/Uyghur → Arabic cleaning rules to aliases.ar
//      (including 🌟 Uyghur ۆ → و rule introduced in ASIA-1I-MCF).
//   3. 33 blocked-major candidates deferred to ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1.
//   4. Document kg/manas ar="جلال آباد" as wrong (Manas is near Talas, NOT
//      Jalal-Abad) — manas is in blocked list so excluded from this merge.
//   5. tm/aenew ar="آب نو" accepted as-is (passed ar-gate) but flagged
//      for deferred review (Persian for "new water" — unusual transliteration
//      for Ashgabat satellite town).
//   6. 7 USER_TEST_ALIASES added to make user-test queries match
//      canonical entries (uz/tirmiz "ترمذ", uz/jizzax "جيزك",
//      uz/urganch "أورغنج", kz/kyzylorda "قيزيل أوردا", tj/khujand "خوجند",
//      tm/tuerkmenabat "تركمان آباد", mn/erdenet "إردنت").
//
// Does NOT merge — only mutates candidates JSONs to set status=approved
// for the clean set. Stage 4 runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['uz','kz','tj','kg','tm','mn'];

// User-approved name.ar corrections — NONE this wave (all 43 clean from Stage 3.5)
const NAME_AR_FIXES = {};

// USER_TEST_ALIASES — make user-test queries match canonical entries
const USER_TEST_ALIASES = {
    'uz/tirmiz':         ['ترمذ'],         // canonical: "الترمذ"
    'uz/jizzax':         ['جيزك'],         // canonical: "جيزاخ"
    'uz/urganch':        ['أورغنج'],       // canonical: "أورجينج"
    'kz/kyzylorda':      ['قيزيل أوردا'],  // canonical: "قزل اوردا"
    'tj/khujand':        ['خوجند'],        // canonical: "خجند"
    'tm/tuerkmenabat':   ['تركمان آباد'],  // canonical: "تركمينابات"
    'mn/erdenet':        ['إردنت']         // canonical: "إردنيت"
};

// Arabic cleaning regex map (standard + Uyghur ۆ→و from ASIA-1I-MCF)
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه')
        .replace(/ۆ/g, 'و')   // 🌟 Uyghur (ASIA-1I-MCF rule, applied here)
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
    // Pre-flight: validate all USER_TEST_ALIASES
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
    let totalUserAliasesAdded = 0;
    const approvedRows = [];

    for (const cc of CCS) {
        const p = pathsFor(cc);
        if (!fs.existsSync(p.candidatesJson)) {
            console.log('[approve] ' + cc.toUpperCase() + ': SKIP (no candidates JSON)');
            summary[cc] = { approved: 0, aliasCleaned: 0, aliasesDropped: 0, userAliasesAdded: 0 };
            continue;
        }
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const cs = { approved: 0, aliasCleaned: 0, aliasesDropped: 0, userAliasesAdded: 0 };

        for (const e of list) {
            if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;

            const key = cc + '/' + e.slug;

            // Defense in depth
            if (!isCleanAfter(e.candidate.names.ar)) {
                console.error('[approve] FAILED — ' + key + ' name.ar fails clean-check: "' + e.candidate.names.ar + '"');
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

            // Add USER_TEST_ALIASES
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
    console.log('═══ ASIA-1H CLEAN APPROVE — Summary ═══');
    for (const cc of CCS) {
        const cs = summary[cc];
        console.log('  ' + cc.toUpperCase() + ': approved=' + cs.approved
            + ' userAliasesAdded=' + cs.userAliasesAdded
            + ' aliasCleaned=' + cs.aliasCleaned
            + ' aliasesDropped=' + cs.aliasesDropped);
    }
    console.log('  TOTAL approved: ' + totalApproved);
    console.log('  TOTAL user-test aliases added: ' + totalUserAliasesAdded);
    console.log('  TOTAL alias cleaned: ' + totalAliasCleaned);
    console.log('  TOTAL alias dropped: ' + totalAliasesDropped);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        console.log('  ' + (r.cc + '/' + r.slug).padEnd(24) + '  pop=' + String(r.pop).padStart(8)
            + '  ar="' + r.ar + '"  aliases=' + r.aliasesIn + '→' + r.aliasesOut);
    }
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs uz/kz/tj/kg/tm/mn');
}

main();
