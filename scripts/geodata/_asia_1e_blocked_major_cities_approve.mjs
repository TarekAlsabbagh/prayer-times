// scripts/geodata/_asia_1e_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1 — approve 70 user-approved blocked-major
// small-Asian cities with manual Arabic corrections + 1 slug rename + 6
// collision overrides.
//
// User decision (2026-05-17): "approve A مع استبعاد pop=0".
// Excluded (2): mv/nilandhoo (pop=0), bt/lungtenzampa (pop=0) — admin stubs.
// Total approved: 70.
//
// 1 slug rename: bn/bangar → bn/bangar-bn (avoid future ph/bangar PPLA3
//                pop=11k collision; PH version is larger).
// 6 collision overrides (1 real + 5 spurious):
//   - kh/kep (real: vs vn/kep PPL pop=12k not merged; kh PPLA dominates)
//   - tl/suai (spurious: vs pop=0 PPL stubs in id/my)
//   - la/sekong (spurious: vs pop=0 PPL stubs in kh/id)
//   - tl/same (spurious: vs pop=0 PPL stubs in mm)
//   - bt/daga (spurious: vs pop=0 PPL stubs in np/mm/ph)
//   - mv/muli (spurious: vs pop=0 PPL stubs in np/id/ph)
//
// Mutates candidates JSONs (9 countries):
//   - np-geonames-candidates.json (6 entries)
//   - lk-geonames-candidates.json (3 entries)
//   - mv-geonames-candidates.json (12 entries — 13 minus 1 pop=0)
//   - bt-geonames-candidates.json (16 entries — 17 minus 1 pop=0)
//   - bn-geonames-candidates.json (2 entries, including 1 rename)
//   - mm-geonames-candidates.json (7 entries)
//   - kh-geonames-candidates.json (12 entries)
//   - la-geonames-candidates.json (9 entries)
//   - tl-geonames-candidates.json (3 entries)
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

// ═══ FIXES — 70 entries with user-approved name.ar + optional slug rename ═══
const FIXES = [
    // === MM (7) ===
    { cc:'mm', slug:'mawlamyine',           newAr:'مولامين' },
    { cc:'mm', slug:'amarapura',            newAr:'أمارابورا' },
    { cc:'mm', slug:'meiktila',             newAr:'مييكتيلا' },
    { cc:'mm', slug:'dawei',                newAr:'داوي' },
    { cc:'mm', slug:'pyay',                 newAr:'بياي' },
    { cc:'mm', slug:'hinthada',             newAr:'هينثادا' },
    { cc:'mm', slug:'magway',               newAr:'ماغوي' },

    // === NP (6) ===
    { cc:'np', slug:'bharatpur',            newAr:'بهاراتبور' },
    { cc:'np', slug:'hetauda',              newAr:'هيتاودا' },
    { cc:'np', slug:'butwal',               newAr:'بوتوال' },
    { cc:'np', slug:'birendranagar',        newAr:'بيريندراناغار' },
    { cc:'np', slug:'madhyapur-thimi',      newAr:'مادهيابور تيمي' },
    { cc:'np', slug:'dhankuta',             newAr:'دانكوتا' },

    // === LK (3) ===
    { cc:'lk', slug:'maharagama',           newAr:'ماهاراغاما' },
    { cc:'lk', slug:'trincomalee',          newAr:'ترينكومالي' },
    { cc:'lk', slug:'anuradhapura',         newAr:'أنورادابورا' },

    // === BT (16 — 17 minus lungtenzampa pop=0) ===
    { cc:'bt', slug:'thimphu',              newAr:'ثيمفو' },                  // PPLC — user priority
    { cc:'bt', slug:'phuntsholing',         newAr:'بونتشولينغ' },
    { cc:'bt', slug:'tsirang',              newAr:'تسيرانغ' },
    { cc:'bt', slug:'punakha',              newAr:'بوناخا' },
    { cc:'bt', slug:'pemagatshel',          newAr:'بيماغاتشيل' },
    { cc:'bt', slug:'sarpang',              newAr:'ساربانغ' },
    { cc:'bt', slug:'samdrup-jongkhar',     newAr:'سامدروب جونغخار' },
    { cc:'bt', slug:'wangdue-phodrang',     newAr:'وانغدو فودرانغ' },
    { cc:'bt', slug:'samtse',               newAr:'سامتسي' },
    { cc:'bt', slug:'trashi-yangtse',       newAr:'تراشي يانغتسي' },
    { cc:'bt', slug:'mongar',               newAr:'مونغار' },
    { cc:'bt', slug:'trongsa',              newAr:'ترونغسا' },
    { cc:'bt', slug:'daga',                 newAr:'داغا',  override:'wave' }, // spurious-override
    { cc:'bt', slug:'lhuentse',             newAr:'لهوينتسي' },
    { cc:'bt', slug:'trashigang',           newAr:'تراشيغانغ' },
    { cc:'bt', slug:'shemgang',             newAr:'شيمغانغ' },

    // === LA (9) ===
    { cc:'la', slug:'thakhek',              newAr:'تاخك' },
    { cc:'la', slug:'luang-prabang',        newAr:'لوانغ برابانغ' },
    { cc:'la', slug:'muang-phonsavan',      newAr:'موانغ فونساوان' },
    { cc:'la', slug:'muang-xay',            newAr:'موانغ ساي' },
    { cc:'la', slug:'ban-houayxay',         newAr:'بان هواي ساي' },
    { cc:'la', slug:'muang-phon-hong',      newAr:'موانغ فون هونغ' },
    { cc:'la', slug:'attapeu',              newAr:'أتابيو' },
    { cc:'la', slug:'luang-namtha',         newAr:'لوانغ نامثا' },
    { cc:'la', slug:'sekong',               newAr:'سيكونغ', override:'wave' }, // spurious-override

    // === KH (12) ===
    { cc:'kh', slug:'kampong-chhnang',      newAr:'كامبونغ تشنانغ' },
    { cc:'kh', slug:'sihanoukville',        newAr:'سيهانوكفيل' },
    { cc:'kh', slug:'kep',                  newAr:'كيب',   override:'wave' }, // real-collision override
    { cc:'kh', slug:'koh-kong',             newAr:'كوه كونغ' },
    { cc:'kh', slug:'prey-veng',            newAr:'بريي فينغ' },
    { cc:'kh', slug:'suong',                newAr:'سوونغ' },
    { cc:'kh', slug:'stung-treng',          newAr:'ستونغ ترينغ' },
    { cc:'kh', slug:'tbeng-meanchey',       newAr:'تبينغ ميانتشي' },
    { cc:'kh', slug:'svay-rieng',           newAr:'سفاي رينغ' },
    { cc:'kh', slug:'kratie',               newAr:'كراتي' },
    { cc:'kh', slug:'kampong-thom',         newAr:'كامبونغ توم' },
    { cc:'kh', slug:'banlung',              newAr:'بانلونغ' },

    // === BN (2) — including 1 rename ===
    { cc:'bn', slug:'bandar-seri-begawan',  newAr:'بندر سري بكاوان' },     // PPLC — user priority
    { cc:'bn', slug:'bangar',               newAr:'بنغار', renameTo:'bangar-bn' }, // avoid ph/bangar collision

    // === TL (3) ===
    { cc:'tl', slug:'suai',                 newAr:'سواي',  override:'wave' }, // spurious-override
    { cc:'tl', slug:'same',                 newAr:'سامي',  override:'wave' }, // spurious-override
    { cc:'tl', slug:'pante-makasar',        newAr:'بانتي ماكاسار' },

    // === MV (12 — 13 minus nilandhoo pop=0) ===
    { cc:'mv', slug:'fuvahmulah',           newAr:'فوفاهمولاه' },
    { cc:'mv', slug:'kulhudhuffushi',       newAr:'كولهودوفوشي' },
    { cc:'mv', slug:'thinadhoo',            newAr:'ثينادو' },
    { cc:'mv', slug:'naifaru',              newAr:'نايفارو' },
    { cc:'mv', slug:'funadhoo',             newAr:'فونادهو' },         // Shaviyani Atoll
    { cc:'mv', slug:'eydhafushi',           newAr:'إيدافوشي' },
    { cc:'mv', slug:'mahibadhoo',           newAr:'ماهيبادو' },
    { cc:'mv', slug:'manadhoo',             newAr:'ماندو' },
    { cc:'mv', slug:'fonadhoo',             newAr:'فوناذو' },          // Laamu Atoll — distinct from funadhoo
    { cc:'mv', slug:'kudahuvadhoo',         newAr:'كودا هوفادو' },
    { cc:'mv', slug:'muli',                 newAr:'مولي',  override:'wave' }, // spurious-override
    { cc:'mv', slug:'felidhoo',             newAr:'فيليدو' }
];

// Explicitly excluded entries (pop=0 admin stubs, per user direction)
const EXCLUDED = ['mv/nilandhoo', 'bt/lungtenzampa'];

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
    let totalRenamed = 0;
    let totalSkipped = 0;

    for (const cc of Object.keys(byCc)) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const fixes = byCc[cc];

        for (const fix of fixes) {
            const key = cc + '/' + fix.slug;
            const renameTo = fix.renameTo || null;

            // Find best entry — high-tier blocked (or already-approved with matching name.ar = idempotent)
            const candidates = list.filter(e => e.slug === fix.slug
                && e.tier === 'high'
                && (e.status === 'pending' || (e.status === 'approved' && e.candidate.names.ar === fix.newAr)));
            if (!candidates.length) {
                console.error('[major-fix] FAILED — no blocked-high-tier entry found for ' + key);
                process.exit(1);
            }
            const alreadyApplied = candidates.find(c => c.status === 'approved' && c.candidate.names.ar === fix.newAr);
            if (alreadyApplied) {
                console.log('[major-fix] ' + key.padEnd(34) + ' SKIP (already applied)');
                totalSkipped++;
                continue;
            }

            // Sort: PPLC > PPLA > PPLA2 > rest, then by pop desc
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

            // Slug rename (if any)
            const oldSlug = target.slug;
            if (renameTo) {
                target.slug = renameTo;
                target.candidate.slug = renameTo;
                totalRenamed++;
            }

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
                detail: 'user-supplied canonical Arabic via ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1',
                fromArTag: false
            };
            // Override spurious wave-collision when applicable
            if (fix.override === 'wave' || target.collisionInWave) {
                target.collisionInWave = false;
                target._collisionOverrideReason =
                    'manually resolved via user-approved ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1: ' +
                    (fix.slug === 'kep'
                        ? 'real cross-wave collision (kh PPLA pop=36k vs vn/kep PPL pop=12k not merged); kh dominates as province seat'
                        : 'spurious wave-flag (collisions only with pop=0 needs_review PPLs that never merge)');
                totalCollisionOverride++;
            }
            totalApproved++;
            console.log('[major-fix] ' + key.padEnd(34) +
                ' ar:"' + oldAr.slice(0, 28) + '" → "' + fix.newAr + '"' +
                (renameTo ? ' SLUG ' + oldSlug + '→' + renameTo : '') +
                (fix.override ? ' OVERRIDE=' + fix.override : ''));
        }
        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[major-fix] ' + cc.toUpperCase() + ' — ' + fixes.length + ' entries processed.');
    }

    console.log('');
    console.log('═══ ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1 — Summary ═══');
    console.log('  Total approved (new):       ' + totalApproved);
    console.log('  Total skipped (idempotent): ' + totalSkipped);
    console.log('  Slug renames:                 ' + totalRenamed);
    console.log('  Collision overrides:           ' + totalCollisionOverride);
    console.log('  Aliases cleaned:             ' + totalAliasCleaned);
    console.log('  Aliases dropped:             ' + totalAliasesDropped);
    console.log('  Excluded (pop=0 stubs):     ' + EXCLUDED.length + ' (' + EXCLUDED.join(', ') + ')');
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs np/lk/mv/bt/bn/mm/kh/la/tl');
}

main();
