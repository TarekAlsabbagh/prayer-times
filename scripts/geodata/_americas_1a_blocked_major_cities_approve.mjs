// scripts/geodata/_americas_1a_blocked_major_cities_approve.mjs
// ─────────────────────────────────────────────────────────────────────────
// AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1 — approve 24 user-approved
// blocked-major cities with manual Arabic + slug-rename decisions.
//
// User decision (2026-05-16):
//   Salem → bare slug
//   Toledo → toledo-us
//   All other 22 cities per the review report
//
// Mutates candidates JSONs:
//   - ca-geonames-candidates.json  (7 entries)
//   - mx-geonames-candidates.json  (4 entries)
//   - us-geonames-candidates.json  (13 entries)
//
// For each target entry:
//   1. Replace candidate.names.ar with user-approved canonical Arabic
//   2. Replace candidate.slug + entry.slug with proposed final slug
//   3. Set entry.status = 'approved'
//   4. Set entry.pendingAfterArGate = true (override original block)
//   5. Set entry.collisionInWave = false (override spurious wave-flags)
//   6. Re-classify arQuality as 'manual'
//   7. Record _renameFrom + _collisionOverrideReason for audit
//
// Defense in depth: refuses if proposed Arabic fails clean-check.
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor } from './_geonames_common.mjs';

const FIXES = [
    // Canada (7)
    { cc:'ca', slug:'edmonton',  newAr:'إدمونتون',   newSlug:'edmonton'     },
    { cc:'ca', slug:'halifax',   newAr:'هاليفاكس',   newSlug:'halifax'      },
    { cc:'ca', slug:'quebec',    newAr:'مدينة كيبك', newSlug:'quebec'       },
    { cc:'ca', slug:'winnipeg',  newAr:'وينيبيغ',    newSlug:'winnipeg'     },
    { cc:'ca', slug:'regina',    newAr:'ريجاينا',    newSlug:'regina'       },
    { cc:'ca', slug:'victoria',  newAr:'فيكتوريا',   newSlug:'victoria'     },
    { cc:'ca', slug:'cambridge', newAr:'كامبريدج',   newSlug:'cambridge-ca' },

    // Mexico (4)
    { cc:'mx', slug:'zapopan',   newAr:'سابوبان',    newSlug:'zapopan'      },
    { cc:'mx', slug:'ecatepec',  newAr:'إيكاتيبيك',  newSlug:'ecatepec'     },
    { cc:'mx', slug:'merida',    newAr:'ميريدا',     newSlug:'merida-mx'    },
    { cc:'mx', slug:'cordoba',   newAr:'كوردوبا',    newSlug:'cordoba-mx'   },

    // United States (13)
    { cc:'us', slug:'philadelphia', newAr:'فيلادلفيا',     newSlug:'philadelphia'    },
    { cc:'us', slug:'san-antonio',  newAr:'سان أنطونيو',   newSlug:'san-antonio'     },
    { cc:'us', slug:'austin',       newAr:'أوستن',          newSlug:'austin'          },
    { cc:'us', slug:'indianapolis', newAr:'إنديانابوليس',  newSlug:'indianapolis'    },
    { cc:'us', slug:'las-vegas',    newAr:'لاس فيغاس',     newSlug:'las-vegas'       },
    { cc:'us', slug:'albuquerque',  newAr:'ألباكركي',      newSlug:'albuquerque'     },
    { cc:'us', slug:'milwaukee',    newAr:'ميلواكي',       newSlug:'milwaukee'       },
    { cc:'us', slug:'birmingham',   newAr:'برمنغهام',       newSlug:'birmingham-us'   },
    { cc:'us', slug:'manchester',   newAr:'مانشستر',        newSlug:'manchester-us'   },
    { cc:'us', slug:'cambridge',    newAr:'كامبريدج',       newSlug:'cambridge-us'    },
    { cc:'us', slug:'athens',       newAr:'أثينا',          newSlug:'athens-us'       },
    { cc:'us', slug:'salem',        newAr:'سايلم',          newSlug:'salem'           },
    { cc:'us', slug:'toledo',       newAr:'توليدو',         newSlug:'toledo-us'       }
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
    // Pre-flight: validate all proposed Arabic names
    const arErrors = [];
    for (const fix of FIXES) {
        if (!isCleanArabic(fix.newAr)) {
            arErrors.push(fix.cc + '/' + fix.slug + ' → newAr="' + fix.newAr + '" failed clean-check');
        }
    }
    if (arErrors.length) {
        console.error('[major-fix] FAILED — Arabic clean-check:');
        for (const e of arErrors) console.error('  - ' + e);
        process.exit(1);
    }

    // Verify final slugs are unique within the fix set + not in curated
    const curated = JSON.parse(fs.readFileSync(pathsFor('us').curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));
    const newSlugSeen = new Set();
    const dupErrors = [];
    for (const fix of FIXES) {
        if (newSlugSeen.has(fix.newSlug)) {
            dupErrors.push('duplicate final slug ' + fix.newSlug + ' in fix set');
        }
        newSlugSeen.add(fix.newSlug);
        if (curatedSlugs.has(fix.newSlug)) {
            dupErrors.push(fix.cc + '/' + fix.slug + ' → ' + fix.newSlug + ': already in curated');
        }
    }
    if (dupErrors.length) {
        console.error('[major-fix] FAILED — slug uniqueness:');
        for (const e of dupErrors) console.error('  - ' + e);
        process.exit(1);
    }

    // Group fixes by cc
    const byCc = {};
    for (const fix of FIXES) (byCc[fix.cc] = byCc[fix.cc] || []).push(fix);

    for (const cc of Object.keys(byCc)) {
        const p = pathsFor(cc);
        const list = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        const fixes = byCc[cc];

        for (const fix of fixes) {
            // Find best entry for this slug: prefer PPLA/PPLC, then highest pop
            const candidates = list.filter(e => e.slug === fix.slug && e.status !== 'rejected' && e.status !== 'existing');
            if (!candidates.length) {
                console.error('[major-fix] FAILED — no entry found for ' + cc + '/' + fix.slug);
                process.exit(1);
            }
            // Sort: PPLA/PPLC first, then by pop desc
            candidates.sort((a, b) => {
                const aIsAdmin = ['PPLC','PPLA'].includes(a.candidate.featureCode) ? 1 : 0;
                const bIsAdmin = ['PPLC','PPLA'].includes(b.candidate.featureCode) ? 1 : 0;
                if (aIsAdmin !== bIsAdmin) return bIsAdmin - aIsAdmin;
                return (b.candidate.population || 0) - (a.candidate.population || 0);
            });
            const target = candidates[0];

            const oldAr = target.candidate.names.ar || '(empty)';
            const oldSlug = target.slug;
            target.candidate.names.ar = fix.newAr;
            target.candidate._normalizationFlags =
                (target.candidate._normalizationFlags || []).filter(f => f !== 'missing_ar_name');

            // Apply slug rename if needed
            if (fix.newSlug !== oldSlug) {
                target.slug = fix.newSlug;
                target.candidate.slug = fix.newSlug;
                target._renamedFrom = oldSlug;
                target._renameReason = 'AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1: ' +
                    (fix.newSlug.endsWith('-us') ? 'US suffix (collision with non-US owner)' :
                     fix.newSlug.endsWith('-ca') ? 'CA suffix (collision)' :
                     fix.newSlug.endsWith('-mx') ? 'MX suffix (collision with ES)' :
                     'user-decided');
            }

            target.status = 'approved';
            target.pendingAfterArGate = true;
            target.arQuality = {
                quality: 'manual',
                detail: 'user-supplied canonical Arabic via AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1',
                fromArTag: false
            };
            // Override spurious wave-flag collisions
            target.collisionInWave = false;
            target._collisionOverrideReason =
                'manually resolved via user-approved slug decision (bare or -cc suffix)';

            console.log('[major-fix] ' + cc + '/' + oldSlug.padEnd(20) + ' ar:"' + oldAr + '" → "' + fix.newAr + '"' +
                (fix.newSlug !== oldSlug ? '   slug→ ' + fix.newSlug : '') +
                '   status=approved ✓');
        }
        fs.writeFileSync(p.candidatesJson, JSON.stringify(list, null, 2) + '\n');
    }
    console.log('');
    console.log('═══ Summary ═══');
    let total = 0;
    for (const cc of Object.keys(byCc)) {
        console.log('  ' + cc.toUpperCase() + ': ' + byCc[cc].length + ' entries flipped');
        total += byCc[cc].length;
    }
    console.log('  TOTAL: ' + total);
    console.log('');
    console.log('Ready for Stage 4 → apply_curated_candidates.mjs ca/mx/us');
}

main();
