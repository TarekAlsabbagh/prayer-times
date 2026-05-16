// scripts/geodata/_europe_3_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// EUROPE-3-BLOCKED-MAJOR-CITIES-FIX-1 — manual Arabic fix + approve for 8
// blocked major European cities. User-approved per-row Arabic corrections.
//
// Mutates candidates JSONs:
//   - lv-geonames-candidates.json (riga)
//   - hr-geonames-candidates.json (dubrovnik, split, rijeka, osijek)
//   - ba-geonames-candidates.json (banja-luka, sarajevo)
//   - xk-geonames-candidates.json (pristina)
//
// For each target entry:
//   1. Replace candidate.names.ar with user-approved canonical Arabic.
//   2. Set entry.status = 'approved'
//   3. Set entry.pendingAfterArGate = true (override original block)
//   4. Set entry.collisionInWave = false for rijeka/osijek (override
//      spurious wave-flag from zero-pop villages in BA/RS/ME).
//   5. Re-classify arQuality as 'manual' (user-supplied clean Arabic).
//
// Defense in depth: refuses if the new Arabic still contains Persian/Urdu
// characters or Latin letters.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const FIXES = [
    { cc: 'lv', slug: 'riga',       newAr: 'ريغا',         overrideCollision: false },
    { cc: 'hr', slug: 'dubrovnik',  newAr: 'دوبروفنيك',     overrideCollision: false },
    { cc: 'ba', slug: 'banja-luka', newAr: 'بانيا لوكا',    overrideCollision: false },
    { cc: 'ba', slug: 'sarajevo',   newAr: 'سراييفو',        overrideCollision: false },
    { cc: 'hr', slug: 'split',      newAr: 'سبليت',          overrideCollision: false },
    { cc: 'hr', slug: 'rijeka',     newAr: 'رييكا',          overrideCollision: true  },  // wave-flag spurious
    { cc: 'hr', slug: 'osijek',     newAr: 'أوسييك',         overrideCollision: true  },  // wave-flag spurious
    { cc: 'xk', slug: 'pristina',   newAr: 'بريشتينا',       overrideCollision: false }
];

const PERSIAN_URDU = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;
const LATIN_IN_AR = /[A-Za-z]/;

function isCleanArabic(name) {
    if (!name) return false;
    const stripped = String(name).replace(/[ً-ٰٟۖ-ۭـ]/g, '')
        .replace(/[\s.,()'\-/؛؟،]/g, '')
        .replace(/[0-9٠-٩]/g, '');
    if (!stripped) return false;
    if (PERSIAN_URDU.test(stripped)) return false;
    if (LATIN_IN_AR.test(stripped))  return false;
    return /^[ء-يٰ-ٳـ]+$/.test(stripped);
}

function main() {
    // Defense in depth: validate all proposed new Arabic names first
    const errors = [];
    for (const fix of FIXES) {
        if (!isCleanArabic(fix.newAr)) {
            errors.push(fix.cc + '/' + fix.slug + ': proposed Arabic "' + fix.newAr + '" failed clean-check');
        }
    }
    if (errors.length) {
        console.error('[major-cities-fix] FAILED — proposed Arabic not clean:');
        for (const e of errors) console.error('  - ' + e);
        process.exit(1);
    }

    // Check no duplicate target slugs across the fix set
    const seen = new Set();
    for (const f of FIXES) {
        const key = f.slug;
        if (seen.has(key)) {
            console.error('[major-cities-fix] FAILED — duplicate target slug: ' + key);
            process.exit(1);
        }
        seen.add(key);
    }

    // Verify none of these slugs already in curated
    const curated = JSON.parse(fs.readFileSync(pathsFor('lv').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));
    for (const fix of FIXES) {
        if (curatedSlugs.has(fix.slug)) {
            console.error('[major-cities-fix] FAILED — slug already in curated: ' + fix.slug);
            process.exit(1);
        }
    }

    // Group by cc
    const byCc = {};
    for (const f of FIXES) {
        (byCc[f.cc] = byCc[f.cc] || []).push(f);
    }

    for (const cc of Object.keys(byCc)) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const fixes = byCc[cc];

        for (const fix of fixes) {
            const entries = list.filter(e => e.slug === fix.slug);
            const target = entries.find(e =>
                e.candidate && e.candidate.featureCode &&
                (e.candidate.featureCode === 'PPLC' || e.candidate.featureCode === 'PPLA')
            ) || entries[0];

            if (!target) {
                console.error('[major-cities-fix] FAILED — entry not found: ' + cc + '/' + fix.slug);
                process.exit(1);
            }

            const oldAr = target.candidate.names.ar || '(empty)';
            target.candidate.names.ar = fix.newAr;
            target.candidate._normalizationFlags =
                (target.candidate._normalizationFlags || []).filter(f => f !== 'missing_ar_name');
            target.status = 'approved';
            target.pendingAfterArGate = true;
            target.arQuality = {
                quality: 'manual',
                detail: 'user-supplied canonical Arabic in EUROPE-3-BLOCKED-MAJOR-CITIES-FIX-1',
                fromArTag: false
            };
            if (fix.overrideCollision) {
                target.collisionInWave = false;
                target._collisionOverrideReason =
                    'wave-flag was spurious — other slugs in same wave are zero-pop villages';
            }
            console.log('[major-cities-fix] ' + cc + '/' + fix.slug
                + ' ar: "' + oldAr + '" → "' + fix.newAr + '" '
                + (fix.overrideCollision ? '(collision override) ' : '')
                + 'status=approved ✓');
        }
        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
        console.log('[major-cities-fix]   wrote ' + p.candidatesJson + ' (' + fixes.length + ' fixed)');
    }
    console.log('[major-cities-fix] DONE — 8 entries ready for Stage 4.');
}

main();
