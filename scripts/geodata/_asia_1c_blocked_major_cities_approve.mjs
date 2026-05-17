// scripts/geodata/_asia_1c_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1 — approve 26 user-approved
// blocked-major CJK cities with manual Arabic corrections.
//
// User decision (2026-05-17): "approve A — all 26 with proposed names".
// All bare slugs — 0 renames.
// 2 spurious-collision overrides (jp/fuji, kr/andong — collisions only
// against pop=0 needs_review PPL stubs in jp/tw/id/kr).
//
// Plus 1 extra alias for tw/zhongxing-new-village:
//   tw/zhongxing-new-village → aliases.ar += "قرية تشونغشينغ الجديدة"
//
// Mutates candidates JSONs:
//   - jp-geonames-candidates.json (14 entries)
//   - kr-geonames-candidates.json (7 entries)
//   - hk-geonames-candidates.json (1 entry)
//   - tw-geonames-candidates.json (3 entries)
//   - mo-geonames-candidates.json (1 entry)
//
// For each target entry:
//   1. Replace candidate.names.ar with user-approved canonical Arabic
//   2. Set entry.status = 'approved'
//   3. Set entry.pendingAfterArGate = true (override original ar-gate block)
//   4. Set entry.collisionInWave = false (override spurious wave-flags)
//      for `jp/fuji` + `kr/andong`
//   5. Re-classify arQuality as 'manual'
//   6. Clean aliases.ar via standard Persian/Urdu → Arabic rules
//   7. Add zhongxing extra alias
//
// Defense in depth: refuses if proposed Arabic fails clean-check.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
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
        .replace(/ۀ/g, 'ه');
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

// ═══ FIXES — 26 entries with user-approved name.ar ═══
const FIXES = [
    // === Japan (14) — sorted by pop desc ===
    { cc:'jp', slug:'higashiosaka',           newAr:'هيغاشي أوساكا' },              // 493,940 PPLA2
    { cc:'jp', slug:'kurashiki',              newAr:'كوراشيكي' },                   // 483,576 PPLA2
    { cc:'jp', slug:'fukuyama',               newAr:'فوكوياما' },                   // 468,812 PPLA2
    { cc:'jp', slug:'hirakata',               newAr:'هيراكاتا' },                   // 406,331 PPLA2
    { cc:'jp', slug:'suita',                  newAr:'سويتا' },                      // 385,567 PPLA2
    { cc:'jp', slug:'toyohashi',              newAr:'تويوهاشي' },                   // 377,453 PPLA2
    { cc:'jp', slug:'iwaki',                  newAr:'إيواكي' },                     // 357,309 PPLA2
    { cc:'jp', slug:'asahikawa',              newAr:'أساهيكاوا' },                  // 333,530 PPLA2
    { cc:'jp', slug:'akita',                  newAr:'أكيتا' },                      // 307,672 PPLA
    { cc:'jp', slug:'akashi',                 newAr:'أكاشي' },                      // 303,601 PPLA2
    { cc:'jp', slug:'fuji',                   newAr:'فوجي', override:'wave' },      // 245,392 PPLA2 — spurious-collision override
    { cc:'jp', slug:'sasebo',                 newAr:'ساسيبو' },                     // 243,223 PPLA2
    { cc:'jp', slug:'atsugi',                 newAr:'أتسوغي' },                     // 223,960 PPLA2
    { cc:'jp', slug:'matsue',                 newAr:'ماتسوي' },                     // 203,616 PPLA — semantic fix

    // === Korea (7) ===
    { cc:'kr', slug:'jeju-city',              newAr:'جيجو' },                       // 488,844 PPLA — jambi-city pattern
    { cc:'kr', slug:'sejong',                 newAr:'سيجونغ' },                     // 394,630 PPLA
    { cc:'kr', slug:'yangsan',                newAr:'يانغسان' },                    // 358,074 PPLA2 — semantic fix (Y not S)
    { cc:'kr', slug:'iksan',                  newAr:'إكسان' },                      // 307,000 PPL
    { cc:'kr', slug:'yeosu',                  newAr:'يوسو' },                       // 268,823 PPLA2
    { cc:'kr', slug:'andong',                 newAr:'أندونغ', override:'wave' },    // 153,348 PPLA — spurious-collision override
    { cc:'kr', slug:'hongseong',              newAr:'هونغسيونغ' },                  // 89,174 PPLA

    // === Hong Kong (1) ===
    { cc:'hk', slug:'tin-shui-wai',           newAr:'تين شوي واي' },                // 282,400 PPL

    // === Taiwan (3) ===
    { cc:'tw', slug:'kaohsiung',              newAr:'كاوهسيونغ' },                  // 2,737,660 PPLA — user-priority
    { cc:'tw', slug:'jincheng',               newAr:'جينتشينغ' },                   // 37,507 PPLA
    { cc:'tw', slug:'zhongxing-new-village',  newAr:'تشونغشينغ' },                  // 25,549 PPLA — extra alias below

    // === Macau (1) ===
    { cc:'mo', slug:'macau',                  newAr:'ماكاو' }                       // 649,335 PPLC — user-priority
];

// ═══ Extra aliases to ADD (per user direction) ═══
const EXTRA_ALIASES = {
    'tw/zhongxing-new-village': ['قرية تشونغشينغ الجديدة']
};

function main() {
    // Pre-flight: validate all proposed Arabic names + extra aliases
    const arErrors = [];
    for (const fix of FIXES) {
        if (!isCleanArabic(fix.newAr)) {
            arErrors.push(fix.cc + '/' + fix.slug + ' → newAr="' + fix.newAr + '" failed clean-check');
        }
    }
    for (const [key, aliases] of Object.entries(EXTRA_ALIASES)) {
        for (const a of aliases) {
            if (!isCleanArabic(a)) {
                arErrors.push('EXTRA_ALIASES[' + key + '] = "' + a + '" failed clean-check');
            }
        }
    }
    if (arErrors.length) {
        console.error('[major-fix] FAILED — Arabic clean-check:');
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
    let totalExtraAliasAdded = 0;

    for (const cc of Object.keys(byCc)) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const fixes = byCc[cc];

        for (const fix of fixes) {
            const key = cc + '/' + fix.slug;

            // Find best entry — high-tier blocked
            // pendingAfterArGate === false: standard ar-gate-blocked
            // pendingAfterArGate === undefined: MO crashed before ar-gate set the flag
            //   (see validate_candidates.mjs null-distance fix); treat as blocked too
            const candidates = list.filter(e => e.slug === fix.slug
                && e.tier === 'high'
                && (e.status === 'pending' || (e.status === 'approved' && e.candidate.names.ar === fix.newAr)));
            if (!candidates.length) {
                console.error('[major-fix] FAILED — no blocked-high-tier entry found for ' + key);
                process.exit(1);
            }
            // Idempotency: if already approved with the same name.ar, skip
            const alreadyApplied = candidates.find(c => c.status === 'approved' && c.candidate.names.ar === fix.newAr);
            if (alreadyApplied) {
                console.log('[major-fix] ' + key.padEnd(34) + ' SKIP (already applied)');
                continue;
            }
            // Sort: PPLC/PPLA first, then by pop desc
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
            target.candidate._normalizationFlags =
                (target.candidate._normalizationFlags || []).filter(f => f !== 'missing_ar_name');

            // Clean aliases.ar — same logic as standard clean-approve
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
            totalAliasCleaned += cleanedCount;
            totalAliasesDropped += droppedCount;

            // Add extra aliases if any
            const extras = EXTRA_ALIASES[key];
            if (extras) {
                for (const extra of extras) {
                    if (!seen.has(extra)) {
                        cleanedAliases.push(extra);
                        seen.add(extra);
                        totalExtraAliasAdded++;
                    }
                }
            }

            target.candidate.aliases = target.candidate.aliases || {};
            target.candidate.aliases.ar = cleanedAliases;

            target.status = 'approved';
            target.pendingAfterArGate = true;
            target.arQuality = {
                quality: 'manual',
                detail: 'user-supplied canonical Arabic via ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1',
                fromArTag: false
            };
            // Override spurious wave-collision when applicable
            if (fix.override === 'wave' || target.collisionInWave) {
                target.collisionInWave = false;
                target._collisionOverrideReason =
                    'manually resolved via user-approved ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1: ' +
                    'spurious wave-flag (collisions only with pop=0 needs_review PPLs that never merge)';
                totalCollisionOverride++;
            }
            totalApproved++;
            console.log('[major-fix] ' + key.padEnd(34) +
                ' ar:"' + oldAr.slice(0, 30) + '" → "' + fix.newAr + '"' +
                (fix.override ? ' OVERRIDE=' + fix.override : '') +
                (extras ? ' +' + extras.length + ' extra alias' : ''));
        }
        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[major-fix] ' + cc.toUpperCase() + ' — ' + fixes.length + ' entries flipped.');
    }

    console.log('');
    console.log('═══ ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1 — Summary ═══');
    console.log('  Total approved:               ' + totalApproved);
    console.log('  Collision overrides:           ' + totalCollisionOverride);
    console.log('  Aliases cleaned (Persian→Arabic): ' + totalAliasCleaned);
    console.log('  Aliases dropped (mojibake):    ' + totalAliasesDropped);
    console.log('  Extra aliases added:           ' + totalExtraAliasAdded);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs jp/kr/hk/tw/mo');
}

main();
