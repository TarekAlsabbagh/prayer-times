// scripts/geodata/_americas_1a_clean_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// AMERICAS-1A — Option A "Clean passes-gate only" approval.
//
// Per user direction (2026-05-16):
//   1. Apply Arabic corrections for 6 incomplete-name slugs
//   2. Dedupe: keep us/columbus = Ohio (913k PPLA); drop Georgia (207k)
//   3. Dedupe: keep us/columbia = South Carolina (142k PPLA); drop Missouri
//   4. Exclude us/frankfort entirely (conflicts with de/frankfurt Arabic)
//   5. Clean aliases.ar for entries we approve (Persian/Urdu → Arabic)
//      Drop aliases that are mojibake/Latin-only and can't be cleaned
//   6. Flip status='approved' for the final ~130 clean set
//
// Does NOT merge — only mutates candidates JSONs to set status=approved
// for the clean set. Stage 4 runs after this.
//
// Major collision-blocked cities (Birmingham US, Cambridge US/CA, etc.)
// and Urdu-Arabic-blocked majors (Philadelphia, San Antonio, Austin, ...)
// are NOT touched — they remain pending for the future
// AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1 phase.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const CCS = ['us','ca','mx'];

// User-approved Arabic corrections for incomplete compound names
const NAME_AR_FIXES = {
    'us/salt-lake-city':    'سولت ليك سيتي',
    'us/carson-city':       'كارسون سيتي',
    'us/pompano-beach':     'بومبانو بيتش',
    'us/coral-springs':     'كورال سبرينغز',
    'us/colorado-springs':  'كولورادو سبرينغز',
    'us/sioux-falls':       'سو فولز'
};

// User-decided dedup/exclusions (only keep one of multi-entry slugs)
const KEEP_GEONAMEID = {
    'us/columbus':  4509177,   // Ohio PPLA, pop 913k (drop Georgia)
    'us/columbia':  4575352    // South Carolina PPLA, pop 142k (drop Missouri PPLA2)
};

const EXCLUDE_FROM_WAVE = new Set([
    'us/frankfort'   // conflicts with de/frankfurt Arabic
]);

// Arabic-name cleaning regex map (apply to alias strings)
const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/g;
const LATIN = /[A-Za-z]/;
function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي')
        .replace(/ک/g, 'ك')
        .replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ')   // default; per-row review may differ
        .replace(/چ/g, 'ج')
        .replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د')
        .replace(/ڑ/g, 'ر')
        .replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي')
        .replace(/ۀ/g, 'ه')
        // remaining Persian/Urdu glyphs we don't have rules for → drop the alias
        ;
}
function isCleanAfter(s) {
    if (!s) return false;
    if (PERSIAN_URDU.test(s)) return false;
    PERSIAN_URDU.lastIndex = 0;   // reset regex global state
    if (LATIN.test(s)) return false;
    if (!/[ء-ي]/.test(s)) return false;
    return true;
}

function main() {
    const summary = {};
    let totalApproved = 0;
    let totalDeduped = 0;
    let totalArFixed = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalExcluded = 0;

    for (const cc of CCS) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const cs = { approved: 0, excluded: 0, deduped: 0, arFixed: 0,
                     aliasCleaned: 0, aliasesDropped: 0 };

        // Pass 1: identify which entries to approve
        const slugMap = new Map();   // slug → entries (passes-gate only)
        for (const e of list) {
            if (e.status !== 'pending' || e.tier !== 'high' || e.pendingAfterArGate !== true) continue;
            if (!slugMap.has(e.slug)) slugMap.set(e.slug, []);
            slugMap.get(e.slug).push(e);
        }

        // Pass 2: process each slug
        for (const [slug, entries] of slugMap) {
            const key = cc + '/' + slug;

            // Exclude check
            if (EXCLUDE_FROM_WAVE.has(key)) {
                cs.excluded++;
                totalExcluded++;
                continue;
            }

            // Dedup check
            let chosenEntry;
            if (entries.length === 1) {
                chosenEntry = entries[0];
            } else if (KEEP_GEONAMEID[key]) {
                chosenEntry = entries.find(e => e.candidate.geonameid === KEEP_GEONAMEID[key]);
                if (!chosenEntry) {
                    console.error('[approve] FAILED — KEEP_GEONAMEID ' + KEEP_GEONAMEID[key]
                        + ' not found in ' + key + ' candidates'); process.exit(1);
                }
                cs.deduped += (entries.length - 1);
                totalDeduped += (entries.length - 1);
            } else {
                // Unexpected duplicate — abort for safety
                console.error('[approve] FAILED — unexpected duplicate ' + key
                    + ' with ' + entries.length + ' entries and no KEEP_GEONAMEID rule');
                process.exit(1);
            }

            // Apply Arabic-name fix if specified
            if (NAME_AR_FIXES[key]) {
                const oldAr = chosenEntry.candidate.names.ar;
                const newAr = NAME_AR_FIXES[key];
                chosenEntry.candidate.names.ar = newAr;
                cs.arFixed++;
                totalArFixed++;
                console.log('[approve]   ' + key + ' ar: "' + oldAr + '" → "' + newAr + '"');
            }

            // Clean aliases.ar
            const aliases = (chosenEntry.candidate.aliases && chosenEntry.candidate.aliases.ar) || [];
            const cleanedAliases = [];
            const seen = new Set([chosenEntry.candidate.names.ar]);
            let cleanedCount = 0;
            let droppedCount = 0;
            for (const orig of aliases) {
                // Try to clean
                const cleaned = cleanArabicChars(orig);
                if (cleaned && isCleanAfter(cleaned) && !seen.has(cleaned)) {
                    cleanedAliases.push(cleaned);
                    seen.add(cleaned);
                    if (cleaned !== orig) cleanedCount++;
                } else {
                    droppedCount++;
                }
            }
            if (chosenEntry.candidate.aliases) {
                chosenEntry.candidate.aliases.ar = cleanedAliases;
            }
            if (cleanedCount > 0 || droppedCount > 0) {
                cs.aliasCleaned += cleanedCount;
                cs.aliasesDropped += droppedCount;
                totalAliasCleaned += cleanedCount;
                totalAliasesDropped += droppedCount;
            }

            // Flip status
            chosenEntry.status = 'approved';
            cs.approved++;
            totalApproved++;
        }

        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        summary[cc] = cs;
        console.log('[approve] ' + cc.toUpperCase() + ': ' + JSON.stringify(cs));
    }

    console.log('');
    console.log('═══ AMERICAS-1A CLEAN APPROVE — Summary ═══');
    for (const cc of CCS) {
        const cs = summary[cc];
        console.log('  ' + cc.toUpperCase() + ': approved=' + cs.approved
            + ' deduped=' + cs.deduped + ' excluded=' + cs.excluded
            + ' arFixed=' + cs.arFixed
            + ' aliasCleaned=' + cs.aliasCleaned + ' aliasesDropped=' + cs.aliasesDropped);
    }
    console.log('  TOTAL approved: ' + totalApproved);
    console.log('  TOTAL deduped: ' + totalDeduped);
    console.log('  TOTAL excluded: ' + totalExcluded);
    console.log('  TOTAL ar-name fixes: ' + totalArFixed);
    console.log('  TOTAL alias cleaned: ' + totalAliasCleaned);
    console.log('  TOTAL alias dropped: ' + totalAliasesDropped);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs us/ca/mx');
}

main();
