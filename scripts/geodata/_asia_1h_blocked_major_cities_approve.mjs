// scripts/geodata/_asia_1h_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1 — approve 33 user-approved Central Asia
// + Mongolia blocked-major cities with manual Arabic corrections.
//
// User decision (2026-05-17): "approve all 33 as proposed".
// All bare slugs — 0 renames. 3 spurious-collision overrides
// (kz/turkestan, kg/naryn, kg/talas — over-flagged, name.ar already clean).
//
// 🚨 CRITICAL semantic correction for kg/manas:
//   Current ar="جلال آباد" is WRONG — Manas is a town near Talas (admin1=03),
//   NOT Jalal-Abad. All existing aliases (`جلال-آباد`, etc.) are wrong-city
//   cross-pollution and must be DROPPED entirely. New ar="ماناس".
//
// Mutates candidates JSONs (5 countries):
//   - kz-geonames-candidates.json (10 entries)
//   - uz-geonames-candidates.json (8 entries)
//   - mn-geonames-candidates.json (10 entries)
//   - kg-geonames-candidates.json (4 entries — includes kg/manas semantic fix)
//   - tj-geonames-candidates.json (1 entry)
//
// Idempotent re-run support.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨۋېۆۇۈىڭەۊۏ]/;
const LATIN = /[A-Za-z]/;

function cleanArabicChars(s) {
    if (!s) return '';
    return String(s)
        .replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/پ/g, 'ب')
        .replace(/گ/g, 'غ').replace(/چ/g, 'ج').replace(/ٹ/g, 'ت')
        .replace(/ڈ/g, 'د').replace(/ڑ/g, 'ر').replace(/ہ/g, 'ه')
        .replace(/ے/g, 'ي').replace(/ۀ/g, 'ه')
        .replace(/ۆ/g, 'و')   // Uyghur (stable since ASIA-1I-MCF)
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
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

// ═══ FIXES — 33 entries with user-approved name.ar ═══
const FIXES = [
    // === KZ (10) — priority + mid-tier ===
    { cc:'kz', slug:'shymkent',         newAr:'شيمكنت' },              // 1.2M PPLA — user priority
    { cc:'kz', slug:'aktobe',           newAr:'أكتوبه' },              // 501k PPLA — user priority
    { cc:'kz', slug:'karagandy',        newAr:'كاراغاندا' },           // 498k PPLA — user (AR Wikipedia)
    { cc:'kz', slug:'ust-kamenogorsk',  newAr:'أوست كامينوغورسك' },    // 319k PPLA — user priority
    { cc:'kz', slug:'semey',            newAr:'سيمي' },                // 293k PPLA — user priority
    { cc:'kz', slug:'atyrau',           newAr:'أتيراو' },              // 291k PPLA — user priority
    { cc:'kz', slug:'turkestan',        newAr:'تركستان', override:'wave' }, // 227k — over-flagged, clean
    { cc:'kz', slug:'kostanay',         newAr:'كوستاناي' },            // 210k PPLA — user priority
    { cc:'kz', slug:'ekibastuz',        newAr:'إيكيباستوز' },          // 121k PPLA2
    { cc:'kz', slug:'taldykorgan',      newAr:'تالديكورغان' },         // 117k PPLA

    // === UZ (8) ===
    { cc:'uz', slug:'andijon',          newAr:'أنديجان' },             // 748k PPLA — user priority
    { cc:'uz', slug:'namangan',         newAr:'نمنغان' },              // 713k PPLA — user priority
    { cc:'uz', slug:'nukus',            newAr:'نوكوس' },               // 333k PPLA
    { cc:'uz', slug:'qarshi',           newAr:'قارشي' },               // 278k PPLA — user priority (with ا)
    { cc:'uz', slug:'angren',           newAr:'أنغرين' },              // 191k — user priority
    { cc:'uz', slug:'navoiy',           newAr:'نوائي' },               // 144k PPLA — user priority
    { cc:'uz', slug:'olmaliq',          newAr:'ألمالك' },              // 133k
    { cc:'uz', slug:'guliston',         newAr:'غولستان' },             // 90k PPLA

    // === MN (10) ===
    { cc:'mn', slug:'darhan',           newAr:'دارخان' },              // 84k PPLA — user priority
    { cc:'mn', slug:'bayanhongor',      newAr:'بايان هنغور' },         // 31k PPLA
    { cc:'mn', slug:'arvayheer',        newAr:'أرفايهير' },            // 29k PPLA
    { cc:'mn', slug:'dalandzadgad',     newAr:'دالانزادغاد' },         // 25k PPLA
    { cc:'mn', slug:'suehbaatar',       newAr:'سوخباتر' },             // 23k PPLA
    { cc:'mn', slug:'saynshand',        newAr:'سايانشاند' },           // 20k PPLA
    { cc:'mn', slug:'baruun-urt',       newAr:'بارون أورت' },          // 18k PPLA
    { cc:'mn', slug:'bulgan',           newAr:'بولغان' },              // 17k PPLA
    { cc:'mn', slug:'uliastay',         newAr:'أوليسطاي' },            // 16k PPLA
    { cc:'mn', slug:'mandalgovi',       newAr:'ماندالغوفي' },          // 12k PPLA

    // === KG (4) — includes manas SEMANTIC FIX ===
    { cc:'kg', slug:'manas',            newAr:'ماناس', dropAllAliases: true }, // 123k PPLA — 🚨 WRONG-AR FIX
    { cc:'kg', slug:'karakol',          newAr:'كاراكول' },             // 84k PPLA — user priority
    { cc:'kg', slug:'naryn',            newAr:'نارين', override:'wave' }, // 41k — over-flagged, clean
    { cc:'kg', slug:'talas',            newAr:'تالاس', override:'wave' }, // 40k — over-flagged, clean

    // === TJ (1) ===
    { cc:'tj', slug:'konibodom',        newAr:'كان بادام' }            // 211k PPLA2 ("City of Almonds")
];

function main() {
    // Pre-flight
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

    const byCc = {};
    for (const fix of FIXES) (byCc[fix.cc] = byCc[fix.cc] || []).push(fix);

    let totalApproved = 0;
    let totalCollisionOverride = 0;
    let totalAliasCleaned = 0;
    let totalAliasesDropped = 0;
    let totalAliasesDroppedSemantic = 0;
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
                console.error('[major-fix] FAILED — no blocked-high-tier entry for ' + key);
                process.exit(1);
            }
            const alreadyApplied = candidates.find(c => c.status === 'approved' && c.candidate.names.ar === fix.newAr);
            if (alreadyApplied) {
                console.log('[major-fix] ' + key.padEnd(28) + ' SKIP (already applied)');
                totalSkipped++;
                continue;
            }
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
            let aliases = (target.candidate.aliases && target.candidate.aliases.ar) || [];
            let semanticDrops = 0;
            if (fix.dropAllAliases) {
                // Special handling — kg/manas: aliases reference wrong city (Jalal-Abad)
                semanticDrops = aliases.length;
                aliases = [];
                totalAliasesDroppedSemantic += semanticDrops;
                console.log('[major-fix]   SEMANTIC-DROP ' + key + ' — ' + semanticDrops + ' wrong-city aliases removed');
            }
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
                detail: fix.dropAllAliases
                    ? 'user-supplied canonical Arabic + dropped all aliases (wrong-city semantic fix) via ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1'
                    : 'user-supplied canonical Arabic via ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1',
                fromArTag: false
            };
            // Override spurious wave-collision when applicable
            if (fix.override === 'wave' || target.collisionInWave) {
                target.collisionInWave = false;
                target._collisionOverrideReason =
                    'manually resolved via user-approved ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1: ' +
                    'spurious wave-flag (entry name.ar already clean — over-flagged; not a real collision with curated)';
                totalCollisionOverride++;
            }
            totalApproved++;
            const tag = fix.dropAllAliases ? ' 🚨SEMANTIC-FIX' : (fix.override ? ' OVERRIDE=' + fix.override : '');
            console.log('[major-fix] ' + key.padEnd(28) +
                ' ar:"' + oldAr.slice(0, 22) + '" → "' + fix.newAr + '"' + tag);
        }
        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[major-fix] ' + cc.toUpperCase() + ' — ' + fixes.length + ' entries processed.');
    }

    console.log('');
    console.log('═══ ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1 — Summary ═══');
    console.log('  Total approved (new):                ' + totalApproved);
    console.log('  Total skipped (idempotent):          ' + totalSkipped);
    console.log('  Collision overrides:                  ' + totalCollisionOverride);
    console.log('  Aliases cleaned (Persian→Arabic):    ' + totalAliasCleaned);
    console.log('  Aliases dropped (mojibake):          ' + totalAliasesDropped);
    console.log('  🚨 Aliases dropped (wrong-city semantic — kg/manas): ' + totalAliasesDroppedSemantic);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs kz/uz/mn/kg/tj');
}

main();
