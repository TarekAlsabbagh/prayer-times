// scripts/geodata/_asia_1i_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1I — "approve B" clean merge (per user direction 2026-05-17):
//   - 56 passes-gate entries (AZ 49 + GE 1 + AM 6) — standard clean-approve
//   - 5 GE manual missing-ar additions (kutaisi/rustavi/sokhumi/zugdidi/telavi
//     were in `status=needs_review` because GeoNames had no Arabic name; user
//     supplied canonical Arabic transliterations manually)
//
// Total approved: 61.
//
// User-supplied manual Arabic for GE missing-ar entries (per user 2026-05-17):
//   kutaisi  → كوتايسي
//   rustavi  → روستافي
//   sokhumi  → سوخومي
//   zugdidi  → زوغديدي
//   telavi   → تيلافي
//
// 23 blocked-major candidates (mostly AZ rayons + GE batumi/gori) NOT touched
// — they remain pending for future ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1.
//
// Does NOT merge — only mutates candidates JSONs to set status=approved
// for the clean set + 5 missing-ar promotions. Stage 4 runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['az','ge','am'];

// User-approved manual Arabic for GE missing-ar entries (needs_review → approved)
const MISSING_AR_ADDITIONS = {
    'ge/kutaisi':  'كوتايسي',
    'ge/rustavi':  'روستافي',
    'ge/sokhumi':  'سوخومي',
    'ge/zugdidi':  'زوغديدي',
    'ge/telavi':   'تيلافي'
};

// USER_TEST_ALIASES — none for ASIA-1I (preflight didn't surface mismatches).
const USER_TEST_ALIASES = {};

// Arabic cleaning rules (standard since ASIA-1B-MCF)
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه')
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
    // Pre-flight: validate all user-supplied Arabic
    for (const [key, ar] of Object.entries(MISSING_AR_ADDITIONS)) {
        if (!isCleanAfter(ar)) {
            console.error('[approve] FAILED — MISSING_AR_ADDITIONS[' + key + '] = "' + ar + '" fails clean-check');
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
    let totalMissingArAdded = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalUserAliasesAdded = 0;
    const approvedRows = [];

    for (const cc of CCS) {
        const p = pathsFor(cc);
        if (!fs.existsSync(p.candidatesJson)) {
            console.log('[approve] ' + cc.toUpperCase() + ': SKIP (no candidates JSON)');
            summary[cc] = { approved: 0, aliasCleaned: 0, aliasesDropped: 0, missingArAdded: 0, userAliasesAdded: 0 };
            continue;
        }
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const cs = { approved: 0, aliasCleaned: 0, aliasesDropped: 0, missingArAdded: 0, userAliasesAdded: 0 };

        // STAGE A: process standard passes-gate entries (high-tier + pendingAfterArGate=true)
        for (const e of list) {
            if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;

            const key = cc + '/' + e.slug;

            // Defense in depth: re-verify name.ar is clean
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

            // Append USER_TEST_ALIASES if present
            const userAliases = USER_TEST_ALIASES[key] || [];
            for (const ua of userAliases) {
                if (!seen.has(ua)) {
                    cleanedAliases.push(ua);
                    seen.add(ua);
                    cs.userAliasesAdded++;
                    totalUserAliasesAdded++;
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
                isMissingAr: false,
                aliasesIn: aliases.length,
                aliasesOut: cleanedAliases.length
            });
        }

        // STAGE B: promote missing-ar entries (status=needs_review → approved with user-supplied Arabic)
        for (const [key, newAr] of Object.entries(MISSING_AR_ADDITIONS)) {
            if (!key.startsWith(cc + '/')) continue;
            const slug = key.split('/')[1];
            // Find the matching candidate (could be in needs_review status)
            const candidates = list.filter(e => e.slug === slug
                && ['PPLC', 'PPLA'].includes(e.candidate.featureCode)
                && (e.status === 'needs_review' || (e.status === 'approved' && e.candidate.names.ar === newAr)));
            if (!candidates.length) {
                console.error('[approve] FAILED — no needs_review entry found for missing-ar key ' + key);
                process.exit(1);
            }
            // Idempotency check
            const alreadyApplied = candidates.find(c => c.status === 'approved' && c.candidate.names.ar === newAr);
            if (alreadyApplied) {
                console.log('[approve]   MISSING-AR ' + key.padEnd(20) + ' SKIP (already applied)');
                continue;
            }
            // Pick by feature code rank + pop
            const fcRank = fc => fc === 'PPLC' ? 4 : fc === 'PPLA' ? 3 : fc === 'PPLA2' ? 2 : 1;
            candidates.sort((a, b) => {
                const aR = fcRank(a.candidate.featureCode);
                const bR = fcRank(b.candidate.featureCode);
                if (aR !== bR) return bR - aR;
                return (b.candidate.population || 0) - (a.candidate.population || 0);
            });
            const target = candidates[0];

            const oldAr = target.candidate.names.ar || '(empty)';
            target.candidate.names.ar = newAr;
            target.candidate._normalizationFlags =
                (target.candidate._normalizationFlags || []).filter(f => f !== 'missing_ar_name');

            // Clean aliases (likely mostly Latin — drop most)
            const aliases = (target.candidate.aliases && target.candidate.aliases.ar) || [];
            const cleanedAliases = [];
            const seen = new Set([newAr]);
            let droppedCount = 0;
            for (const orig of aliases) {
                const cleaned = cleanArabicChars(orig);
                if (cleaned && isCleanAfter(cleaned) && !seen.has(cleaned)) {
                    cleanedAliases.push(cleaned);
                    seen.add(cleaned);
                } else {
                    droppedCount++;
                }
            }
            target.candidate.aliases = target.candidate.aliases || {};
            target.candidate.aliases.ar = cleanedAliases;

            // Promote from needs_review → approved
            target.status = 'approved';
            target.tier = 'high';
            target.pendingAfterArGate = true;
            target.arQuality = {
                quality: 'manual',
                detail: 'user-supplied canonical Arabic via ASIA-1I missing-ar-addition (GE)',
                fromArTag: false
            };

            cs.missingArAdded++;
            totalMissingArAdded++;
            totalAliasesDropped += droppedCount;
            cs.aliasesDropped += droppedCount;
            console.log('[approve]   MISSING-AR ' + key.padEnd(20) + ' ar:"' + oldAr + '" → "' + newAr + '"');
            approvedRows.push({
                cc, slug,
                ar: newAr,
                en: target.candidate.names.en,
                fc: target.candidate.featureCode,
                pop: target.candidate.population || 0,
                isMissingAr: true,
                aliasesIn: aliases.length,
                aliasesOut: cleanedAliases.length
            });
            totalApproved++;
        }

        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        summary[cc] = cs;
        console.log('[approve] ' + cc.toUpperCase() + ': ' + JSON.stringify(cs));
    }

    console.log('');
    console.log('═══ ASIA-1I CLEAN APPROVE — Summary ═══');
    for (const cc of CCS) {
        const cs = summary[cc];
        console.log('  ' + cc.toUpperCase() + ': approved=' + cs.approved
            + ' missingArAdded=' + cs.missingArAdded
            + ' userAliasesAdded=' + cs.userAliasesAdded
            + ' aliasCleaned=' + cs.aliasCleaned
            + ' aliasesDropped=' + cs.aliasesDropped);
    }
    console.log('  TOTAL approved: ' + totalApproved);
    console.log('  TOTAL missing-ar manual additions: ' + totalMissingArAdded);
    console.log('  TOTAL user-test aliases added: ' + totalUserAliasesAdded);
    console.log('  TOTAL alias cleaned: ' + totalAliasCleaned);
    console.log('  TOTAL alias dropped: ' + totalAliasesDropped);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        const tag = r.isMissingAr ? ' [missing-ar]' : '';
        console.log('  ' + (r.cc + '/' + r.slug).padEnd(24) + '  pop=' + String(r.pop).padStart(7)
            + '  ar="' + r.ar + '"  aliases=' + r.aliasesIn + '→' + r.aliasesOut + tag);
    }
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs az/ge/am');
}

main();
