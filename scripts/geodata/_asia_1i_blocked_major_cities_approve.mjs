// scripts/geodata/_asia_1i_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1 — approve 23 user-approved blocked-major
// Caucasus cities with manual Arabic corrections + 1 spurious-collision override.
//
// User decision (2026-05-17): "approve all 23 as proposed".
// All bare slugs — 0 renames. 1 spurious-collision override (az/pushkino —
// over-flagged as collisionInWave=true even though name.ar is already clean).
//
// 🌟 NEW CLEANING RULE: Uyghur ۆ → و (added in ASIA-1I-MCF for vanadzor +
// yeghegnadzor). Carries forward into all future waves.
//
// Mutates candidates JSONs (3 countries):
//   - az-geonames-candidates.json (15 entries)
//   - ge-geonames-candidates.json (5 entries)
//   - am-geonames-candidates.json (3 entries)
//
// Idempotent re-run support (per ASIA-1C-MCF pattern).
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۋېۆۇۈىڭەۊۏ]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي')
        .replace(/ک/g, 'ك')
        .replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ')
        .replace(/چ/g, 'ج')
        .replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د')
        .replace(/ڑ/g, 'ر')
        .replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي')
        .replace(/ۀ/g, 'ه')
        .replace(/ۆ/g, 'و')   // 🌟 NEW (ASIA-1I-MCF): Uyghur ۆ → و
        .replace(/[‌‍]/g, ''); // ZWNJ + ZWJ
}

function isCleanArabic(s) {
    if (!s) return false;
    const stripped = String(s).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN.test(stripped))  return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// ═══ FIXES — 23 entries with user-approved name.ar ═══
const FIXES = [
    // === Priority (user-flagged, pop ≥ 100k or user-mentioned) ===
    { cc:'az', slug:'sumqayit',         newAr:'سومقاييت' },          // 358,675 PPLA — user priority
    { cc:'ge', slug:'batumi',           newAr:'باتومي' },            // 186,949 PPLA — user priority
    { cc:'az', slug:'mingachevir',      newAr:'مينغاشيفير' },        // 106,048 PPLA — user priority
    { cc:'am', slug:'vanadzor',         newAr:'فانادزور' },          //  78,100 PPLA — user priority (Uyghur ۆ cleaning)
    { cc:'ge', slug:'gori',             newAr:'غوري' },              //  41,933 PPLA — user priority

    // === Mid-tier (pop 10k-50k) ===
    { cc:'az', slug:'agdzhabedy',       newAr:'أغجابيدي' },          //  43,000 PPLA
    { cc:'az', slug:'goeycay',          newAr:'غويتشاي' },           //  42,500 PPLA
    { cc:'az', slug:'barda',            newAr:'باردا' },             //  37,372 PPLA
    { cc:'az', slug:'sabirabad',        newAr:'صابر آباد' },         //  30,612 PPLA — canonical Arabic compound
    { cc:'am', slug:'armavir',          newAr:'أرمافير' },           //  29,700 PPLA
    { cc:'az', slug:'fizuli',           newAr:'فضولي' },             //  26,765 PPLA — named after poet
    { cc:'az', slug:'agdas',            newAr:'أغداش' },             //  23,528 PPLA
    { cc:'az', slug:'terter',           newAr:'تارتار' },            //  18,185 PPLA
    { cc:'az', slug:'pushkino',         newAr:'بوشكينو', override:'wave' }, // 18,182 PPLA — over-flagged collision (spurious)
    { cc:'ge', slug:'akhaltsikhe',      newAr:'آخالتسيخه' },         //  17,445 PPLA
    { cc:'az', slug:'astara',           newAr:'آستارا' },            //  15,190 PPLA
    { cc:'az', slug:'belokany',         newAr:'بيلوكاني' },          //  14,800 PPLA
    { cc:'ge', slug:'ozurgeti',         newAr:'أوزورغيتي' },         //  13,935 PPLA

    // === Smaller PPLAs (pop < 12k) ===
    { cc:'az', slug:'qabala',           newAr:'قابالا' },            //  11,867 PPLA
    { cc:'az', slug:'goranboy',         newAr:'غورانبوي' },          //  10,186 PPLA
    { cc:'am', slug:'yeghegnadzor',     newAr:'يغيغنادزور' },        //   7,300 PPLA
    { cc:'az', slug:'lacin',            newAr:'لاتشين' },            //   2,300 PPLA
    { cc:'ge', slug:'ambrolauri',       newAr:'آمبرولاوري' }         //   1,952 PPLA
];

function main() {
    // Pre-flight: validate all proposed Arabic names + dup-Arabic check
    const arErrors = [];
    const seenAr = new Map();
    for (const fix of FIXES) {
        if (!isCleanArabic(fix.newAr)) {
            arErrors.push(fix.cc + '/' + fix.slug + ' → newAr="' + fix.newAr + '" failed clean-check');
        }
        const key = fix.cc + ':' + fix.newAr;
        if (seenAr.has(key)) {
            arErrors.push('DUP-AR within ' + fix.cc + ': "' + fix.newAr + '" used by ' + seenAr.get(key) + ' AND ' + fix.slug);
        }
        seenAr.set(key, fix.slug);
    }
    if (arErrors.length) {
        console.error('[major-fix] FAILED — pre-flight:');
        for (const e of arErrors) console.error('  - ' + e);
        process.exit(1);
    }

    // Group fixes by cc
    const byCc = {};
    for (const fix of FIXES) (byCc[fix.cc] = byCc[fix.cc] || []).push(fix);

    let totalApproved = 0;
    let totalCollisionOverride = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalSkipped = 0;

    for (const cc of Object.keys(byCc)) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const fixes = byCc[cc];

        for (const fix of fixes) {
            const key = cc + '/' + fix.slug;

            const candidates = list.filter(e => e.slug === fix.slug
                && e.tier === 'high'
                && (e.status === 'pending' || (e.status === 'approved' && e.candidate.names.ar === fix.newAr)));
            if (!candidates.length) {
                console.error('[major-fix] FAILED — no blocked-high-tier entry found for ' + key);
                process.exit(1);
            }
            // Idempotency
            const alreadyApplied = candidates.find(c => c.status === 'approved' && c.candidate.names.ar === fix.newAr);
            if (alreadyApplied) {
                console.log('[major-fix] ' + key.padEnd(28) + ' SKIP (already applied)');
                totalSkipped++;
                continue;
            }
            // Sort by fc rank + pop
            const fcRank = fc => fc === 'PPLC' ? 4 : fc === 'PPLA' ? 3 : fc === 'PPLA2' ? 2 : 1;
            candidates.sort((a, b) => {
                const aR = fcRank(a.candidate.featureCode);
                const bR = fcRank(b.candidate.featureCode);
                if (aR !== bR) return bR - aR;
                return (b.candidate.population || 0) - (a.candidate.population || 0);
            });
            const target = candidates[0];

            const oldAr = target.candidate.names.ar || '(empty)';
            target.candidate.names.ar = fix.newAr;

            // Clean aliases.ar
            const aliases = (target.candidate.aliases && target.candidate.aliases.ar) || [];
            const cleanedAliases = [];
            const seen = new Set([fix.newAr]);
            let cleanedCount = 0;
            let droppedCount = 0;
            for (const orig of aliases) {
                const cleaned = cleanArabicChars(orig);
                if (cleaned && isCleanArabic(cleaned) && !seen.has(cleaned)) {
                    cleanedAliases.push(cleaned);
                    seen.add(cleaned);
                    if (cleaned !== orig) cleanedCount++;
                } else {
                    droppedCount++;
                }
            }
            target.candidate.aliases = target.candidate.aliases || {};
            target.candidate.aliases.ar = cleanedAliases;
            totalAliasCleaned += cleanedCount;
            totalAliasesDropped += droppedCount;

            target.status = 'approved';
            target.pendingAfterArGate = true;
            target.arQuality = {
                quality: 'manual',
                detail: 'user-supplied canonical Arabic via ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1',
                fromArTag: false
            };
            // Override spurious wave-collision when applicable
            if (fix.override === 'wave' || target.collisionInWave) {
                target.collisionInWave = false;
                target._collisionOverrideReason =
                    'manually resolved via user-approved ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1: ' +
                    'spurious wave-flag (entry name.ar already clean — over-flagged; not a real collision with curated)';
                totalCollisionOverride++;
            }
            totalApproved++;
            console.log('[major-fix] ' + key.padEnd(28) +
                ' ar:"' + oldAr.slice(0, 24) + '" → "' + fix.newAr + '"' +
                (fix.override ? ' OVERRIDE=' + fix.override : ''));
        }
        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[major-fix] ' + cc.toUpperCase() + ' — ' + fixes.length + ' entries processed.');
    }

    console.log('');
    console.log('═══ ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1 — Summary ═══');
    console.log('  Total approved (new):       ' + totalApproved);
    console.log('  Total skipped (idempotent): ' + totalSkipped);
    console.log('  Collision overrides:         ' + totalCollisionOverride);
    console.log('  Aliases cleaned:             ' + totalAliasCleaned);
    console.log('  Aliases dropped:             ' + totalAliasesDropped);
    console.log('');
    console.log('🌟 NEW cleaning rule: Uyghur ۆ → و (Caucasus-region Arabic transliterations)');
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs az/ge/am');
}

main();
