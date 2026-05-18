// scripts/geodata/_asia_1g_af_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1G-AF — "fix arabic per row ثم merge 28" clean merge
// (per user direction 2026-05-18).
//
// User decisions:
//   1. Merge ALL 28 passes-gate entries.
//   2. **4 semantic NAME_AR_FIXES** to override Stage 3.4 mechanical
//      defaults that produced unusable transliterations for real city
//      names:
//        charikar       → "تشاريكار"    (NOT "جاريكار" — چ→ج default mangles "Char")
//        pul-e-khumri   → "بول خمري"    (NOT "بل خمري" — پ→ب gives no-meaning "Bul")
//        pul-e-alam     → "بول علم"     (NOT "بل علم")
//        sar-e-pul      → "سر بول"      (NOT "سر بل")
//   3. **4 alias additions** to preserve the mechanically-cleaned form
//      so users searching it still find the city:
//        charikar aliases.ar += شاريكار
//        pul-e-khumri aliases.ar += بل خمري
//        pul-e-alam aliases.ar += بل علم
//        sar-e-pul aliases.ar += سر بل
//   4. **Sheberghan alias for af/shibirghan** (user-watch query
//      spelling). Adds `شبرغان` to aliases.ar (already equals name.ar
//      so dedup will drop) AND `Sheberghan` to aliases.en (meaningful).
//   5. 8 high-tier blocked deferred → ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1.
//
// Does NOT merge — only mutates candidates JSON. Stage 4 runs after.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CC = 'af';

// ── Decision tables ───────────────────────────────────────────────────────

// User-approved semantic NAME_AR_FIXES (override Stage 3.4 mechanical defaults)
const NAME_AR_FIXES = {
    'charikar':     'تشاريكار',
    'pul-e-khumri': 'بول خمري',
    'pul-e-alam':   'بول علم',
    'sar-e-pul':    'سر بول',
};

// Aliases (Arabic + English) to ADD per slug.
const USER_TEST_ALIASES_AR = {
    'charikar':     ['شاريكار'],     // preserve mechanically-cleaned form as searchable alias
    'pul-e-khumri': ['بل خمري'],
    'pul-e-alam':   ['بل علم'],
    'sar-e-pul':    ['سر بل'],
    'shibirghan':   ['شبرغان'],      // already equals name.ar (after Stage 3.4) — dedup will skip
};
const USER_TEST_ALIASES_EN = {
    'shibirghan':   ['Sheberghan'],  // common romanization variant
};

// Standard Arabic-character cleaner (Persian/Urdu/Pashto/Uyghur/Kurdish→Arabic)
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۆڕە]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه').replace(/ۆ/g, 'و')
        .replace(/ڕ/g, 'ر').replace(/ە/g, 'ه')
        // Pashto extensions (production firsts in AF)
        .replace(/ښ/g, 'ش').replace(/ګ/g, 'غ').replace(/څ/g, 'ج')
        .replace(/ځ/g, 'ز').replace(/ډ/g, 'د').replace(/ړ/g, 'ر')
        .replace(/ڼ/g, 'ن')
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
    // Pre-flight: every NAME_AR_FIXES value must pass clean-check
    for (const [slug, ar] of Object.entries(NAME_AR_FIXES)) {
        if (!isCleanAfter(ar)) {
            console.error('[approve] FAILED — NAME_AR_FIXES[' + slug + '] = "' + ar + '" fails clean-check');
            process.exit(1);
        }
    }
    // Pre-flight: every Arabic alias must pass clean-check (except deliberate
    // archaic forms — none in AF this wave)
    for (const [slug, aliases] of Object.entries(USER_TEST_ALIASES_AR)) {
        for (const a of aliases) {
            if (!isCleanAfter(a)) {
                console.error('[approve] FAILED — USER_TEST_ALIASES_AR[' + slug + '] = "' + a + '" fails clean-check');
                process.exit(1);
            }
        }
    }

    const p = pathsFor(CC);
    const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));

    const cs = {
        approved: 0,
        nameArFixed: 0,
        userAliasesArAdded: 0,
        userAliasesEnAdded: 0,
        aliasCleaned: 0,
        aliasesDropped: 0,
    };
    const approvedRows = [];

    for (const e of list) {
        if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;

        const slug = e.slug;
        const fc = e.candidate.featureCode;

        // ── Apply NAME_AR_FIXES (4 semantic overrides) ──
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

        // ── Process Arabic aliases ──
        const inAliasesAr = (e.candidate.aliases && e.candidate.aliases.ar) || [];
        const cleanedAliasesAr = [];
        const seenAr = new Set([e.candidate.names.ar]);
        let cleanedCount = 0;
        let droppedCount = 0;

        for (const orig of inAliasesAr) {
            const cleaned = cleanArabicChars(orig);
            if (cleaned && isCleanAfter(cleaned) && !seenAr.has(cleaned)) {
                cleanedAliasesAr.push(cleaned);
                seenAr.add(cleaned);
                if (cleaned !== orig) cleanedCount++;
            } else {
                droppedCount++;
            }
        }

        // Add USER_TEST_ALIASES_AR
        const extraAr = USER_TEST_ALIASES_AR[slug] || [];
        for (const ua of extraAr) {
            if (!seenAr.has(ua)) {
                cleanedAliasesAr.push(ua);
                seenAr.add(ua);
                cs.userAliasesArAdded++;
                console.log('[approve]   ALIAS-AR-ADD ' + slug + ' += "' + ua + '"');
            }
        }

        // ── Process English aliases (only for sheberghan rename) ──
        const inAliasesEn = (e.candidate.aliases && e.candidate.aliases.en) || [];
        const seenEn = new Set([e.candidate.names.en, ...inAliasesEn]);
        const cleanedAliasesEn = inAliasesEn.slice();
        const extraEn = USER_TEST_ALIASES_EN[slug] || [];
        for (const ue of extraEn) {
            if (!seenEn.has(ue)) {
                cleanedAliasesEn.push(ue);
                seenEn.add(ue);
                cs.userAliasesEnAdded++;
                console.log('[approve]   ALIAS-EN-ADD ' + slug + ' += "' + ue + '"');
            }
        }

        if (!e.candidate.aliases) e.candidate.aliases = {};
        e.candidate.aliases.ar = cleanedAliasesAr;
        if (cleanedAliasesEn.length) e.candidate.aliases.en = cleanedAliasesEn;

        cs.aliasCleaned += cleanedCount;
        cs.aliasesDropped += droppedCount;

        e.status = 'approved';
        cs.approved++;
        approvedRows.push({
            slug,
            ar: e.candidate.names.ar,
            en: e.candidate.names.en,
            fc,
            pop: e.candidate.population || 0,
            aliasesArOut: cleanedAliasesAr.length,
            aliasesEnOut: cleanedAliasesEn.length,
            arFixed: Boolean(NAME_AR_FIXES[slug]),
        });
    }

    fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');

    console.log('');
    console.log('═══ ASIA-1G-AF CLEAN APPROVE — Summary ═══');
    console.log('  approved:                  ' + cs.approved);
    console.log('  name.ar fixes applied:     ' + cs.nameArFixed + ' (4 semantic: charikar/pul-e-khumri/pul-e-alam/sar-e-pul)');
    console.log('  user-test aliases.ar added:' + cs.userAliasesArAdded);
    console.log('  user-test aliases.en added:' + cs.userAliasesEnAdded);
    console.log('  aliases.ar cleaned:        ' + cs.aliasCleaned);
    console.log('  aliases.ar dropped:        ' + cs.aliasesDropped);
    console.log('');
    console.log('Approved entries (sorted by pop desc):');
    approvedRows.sort((a, b) => b.pop - a.pop);
    for (const r of approvedRows) {
        const fixMark = r.arFixed ? '  [AR-FIXED]' : '';
        console.log('  af/' + r.slug.padEnd(24)
            + '  pop=' + String(r.pop).padStart(8)
            + '  ' + r.fc.padEnd(5)
            + '  ar="' + r.ar.padEnd(20) + '"  aliases=' + r.aliasesArOut + '/' + r.aliasesEnOut
            + fixMark);
    }
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs af');
}

main();
