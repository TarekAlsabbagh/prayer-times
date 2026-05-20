// scripts/_test_stage_3_religious_exemption.mjs
//
// STAGE-3-RELIGIOUS-EXEMPTION-1 verification — unit tests for the 3-tier
// religious-keyword routing in `validate_candidates.mjs`.
//
// Tests `checkBlocklist` + `decideStatusAndTier` with synthetic candidates
// covering all 6 required scenarios per the apply spec (2026-05-20).
//
// NO real candidate file touched. NO curated mutation. Pure unit test.

import { checkBlocklist, decideStatusAndTier } from '../scripts/geodata/validate_candidates.mjs';
import { RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS } from '../scripts/geodata/_geonames_common.mjs';

let pass = 0, fail = 0;
const ok = (label, cond, extra) => {
    (cond ? pass++ : fail++);
    console.log((cond ? '  ✓ ' : '  ✗ ') + label + (extra ? '   ' + extra : ''));
};

// Helper — build minimal synthetic candidate
function makeCandidate(opts) {
    return {
        slug: opts.slug || 'test-slug',
        lat: opts.lat || 23.0,
        lng: opts.lng || 90.0,
        timezone: opts.timezone || 'Asia/Dhaka',
        featureCode: opts.featureCode || 'PPL',
        population: opts.population || 0,
        names: {
            ar: opts.nameAr || 'اسم اختبار',  // default non-religious Arabic
            en: opts.nameEn || 'TestName'
        },
        aliases: {
            ar: opts.aliasesAr || [],
            en: opts.aliasesEn || []
        },
        _normalizationFlags: opts.flags || [],
        admin: { admin1Code: '00' }
    };
}

const distInfo = { km: 100 };  // safe distance — won't trigger distOK gate
const config = { popMin: 50000, alwaysIncludeFeatureCodes: ['PPLC', 'PPLA'] };

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' STAGE-3-RELIGIOUS-EXEMPTION-1 verification (unit tests)');
console.log('═══════════════════════════════════════════════════════════════════════');

// ─── Part A — checkBlocklist correctly distinguishes primary vs alias ─────
console.log('\n── Part A — checkBlocklist primary vs alias detection ──');

// A1: primary name has mosque keyword
let c = makeCandidate({ nameEn: 'Sūrkay Masjid' });
let bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
ok('A1: primary-name mosque → hit=religious, in=primary',
    bl.hit === 'religious' && bl.in === 'primary',
    '(got hit=' + bl.hit + ' in=' + bl.in + ' kw=' + bl.keyword + ')');

// A2: alias has mosque keyword (primary clean)
c = makeCandidate({ nameEn: 'Rangpur', aliasesEn: ['Kotwali', 'Mosque Rangpur', 'RAU'] });
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
ok('A2: alias-only mosque → hit=religious, in=alias',
    bl.hit === 'religious' && bl.in === 'alias',
    '(got hit=' + bl.hit + ' in=' + bl.in + ' kw=' + bl.keyword + ')');

// A3: no religious keyword anywhere
c = makeCandidate({ nameEn: 'Dhaka', aliasesEn: ['Daka', 'Dhakka'] });
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
ok('A3: clean candidate → hit=null',
    bl.hit === null && bl.in === null,
    '(got hit=' + bl.hit + ' in=' + bl.in + ')');

// A4: Arabic primary مسجد
c = makeCandidate({ nameAr: 'مسجد سليمان', nameEn: 'Masjed Soleyman' });
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
ok('A4: Arabic primary مسجد → hit=religious, in=primary',
    bl.hit === 'religious' && bl.in === 'primary',
    '(got hit=' + bl.hit + ' in=' + bl.in + ' kw=' + bl.keyword + ')');

// A5: shrine in alias
c = makeCandidate({ nameEn: 'Lexington', aliasesEn: ['Shrine of the South'] });
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
ok('A5: alias "Shrine of the South" → hit=religious, in=alias',
    bl.hit === 'religious' && bl.in === 'alias',
    '(got hit=' + bl.hit + ' in=' + bl.in + ' kw=' + bl.keyword + ')');

// ─── Part B — decideStatusAndTier 3-tier policy ────────────────────────────
console.log('\n── Part B — decideStatusAndTier 3-tier routing ──');

// B1: rangpur-like — PPLA + alias-only mosque hit
c = makeCandidate({
    slug: 'rangpur',
    featureCode: 'PPLA',
    population: 1031388,
    nameEn: 'Rangpur',
    nameAr: 'رنغبور',
    aliasesEn: ['Kotwali', 'Mosque Rangpur', 'RAU']
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
let dec = decideStatusAndTier(c, bl, distInfo, config);
ok('B1 [rangpur PPLA + alias-only]: NOT rejected, admin-exempt',
    dec.status !== 'rejected',
    '(got status=' + dec.status + ' reason=' + dec.reason + ' tier=' + dec.tier + '; warning=' + c._religiousExemptionWarning + ')');
ok('B1: candidate flagged with _religiousExemptionWarning',
    typeof c._religiousExemptionWarning === 'string' && c._religiousExemptionWarning.length > 0,
    '(got "' + c._religiousExemptionWarning + '")');

// B2: masjed-soleyman-like — PPLA2 + primary-name mosque hit
c = makeCandidate({
    slug: 'masjed-soleyman',
    featureCode: 'PPLA2',
    population: 111510,
    nameAr: 'مسجد سليمان',
    nameEn: 'Masjed Soleymān'
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('B2 [masjed-soleyman PPLA2 + primary-hit]: NOT rejected, admin-exempt',
    dec.status !== 'rejected',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// B3: lexington-like — PPLA2 + alias-only shrine
c = makeCandidate({
    slug: 'lexington',
    featureCode: 'PPLA2',
    population: 7262,
    nameEn: 'Lexington',
    nameAr: 'لكسينغتون',
    aliasesEn: ['Shrine of the South']
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('B3 [lexington PPLA2 + alias-only shrine]: NOT rejected, admin-exempt',
    dec.status !== 'rejected',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// B4: true religious place — PPL + primary mosque
c = makeCandidate({
    slug: 'surkay-masjid',
    featureCode: 'PPL',
    population: 0,
    nameEn: 'Sūrkay Masjid',
    nameAr: 'اسم نظيف'
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('B4 [PPL + primary mosque]: rejected (true positive preserved)',
    dec.status === 'rejected' && dec.reason === 'religious_site_not_city',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// B5: alias-only non-admin — PPL + alias-only mosque
c = makeCandidate({
    slug: 'some-village',
    featureCode: 'PPL',
    population: 500,
    nameEn: 'Some Village',
    nameAr: 'قرية نظيفة',
    aliasesEn: ['Near Mosque Site']
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('B5 [PPL + alias-only]: needs_review, reason=religious_alias_only',
    dec.status === 'needs_review' && dec.reason === 'religious_alias_only',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// B6: no religious hit baseline — PPL with clean name and aliases
c = makeCandidate({
    slug: 'clean-city',
    featureCode: 'PPL',
    population: 100000,
    nameEn: 'Clean City',
    nameAr: 'مدينة نظيفة',
    aliasesEn: ['Cleantown']
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('B6 [clean baseline]: hit=null, status determined by other rules',
    bl.hit === null && dec.status !== 'rejected' &&
    dec.reason !== 'religious_site_not_city' &&
    dec.reason !== 'religious_alias_only',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// ─── Part C — admin-tier exemption covers all PPLC/PPLA/PPLA2/PPLA3 ───────
console.log('\n── Part C — admin-tier exemption across all 4 admin codes ──');

for (const fc of ['PPLC', 'PPLA', 'PPLA2', 'PPLA3']) {
    // primary-hit
    c = makeCandidate({
        slug: 'test-' + fc.toLowerCase(),
        featureCode: fc,
        population: 100000,
        nameEn: 'Mosque City Example',
        nameAr: 'اسم نظيف'
    });
    bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
    dec = decideStatusAndTier(c, bl, distInfo, config);
    ok(fc + ' + primary-hit: NOT rejected (admin-exempt)',
        dec.status !== 'rejected',
        '(got status=' + dec.status + ' reason=' + dec.reason + ')');

    // alias-only hit
    c = makeCandidate({
        slug: 'test2-' + fc.toLowerCase(),
        featureCode: fc,
        population: 100000,
        nameEn: 'NormalCity',
        nameAr: 'مدينة عادية',
        aliasesEn: ['Mosque District']
    });
    bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
    dec = decideStatusAndTier(c, bl, distInfo, config);
    ok(fc + ' + alias-only: NOT rejected (admin-exempt)',
        dec.status !== 'rejected',
        '(got status=' + dec.status + ' reason=' + dec.reason + ')');
}

// ─── Part D — non-admin featureCodes get the new routing ───────────────────
console.log('\n── Part D — non-admin codes routing (PPL/PPLL/PPLF/PPLS) ──');

for (const fc of ['PPL', 'PPLL', 'PPLF', 'PPLS']) {
    // primary-hit → reject
    c = makeCandidate({
        slug: 'test-primary-' + fc.toLowerCase(),
        featureCode: fc,
        population: 1000,
        nameEn: 'Mosque Village'
    });
    bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
    dec = decideStatusAndTier(c, bl, distInfo, config);
    ok(fc + ' + primary-hit: rejected (status quo for non-admin)',
        dec.status === 'rejected' && dec.reason === 'religious_site_not_city',
        '(got status=' + dec.status + ' reason=' + dec.reason + ')');

    // alias-only → needs_review
    c = makeCandidate({
        slug: 'test-alias-' + fc.toLowerCase(),
        featureCode: fc,
        population: 1000,
        nameEn: 'Some Place',
        nameAr: 'مكان',
        aliasesEn: ['Old Mosque Reference']
    });
    bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
    dec = decideStatusAndTier(c, bl, distInfo, config);
    ok(fc + ' + alias-only: needs_review (religious_alias_only)',
        dec.status === 'needs_review' && dec.reason === 'religious_alias_only',
        '(got status=' + dec.status + ' reason=' + dec.reason + ')');
}

// ─── Part E — Arabic religious keywords work in primary vs alias ───────────
console.log('\n── Part E — Arabic religious keywords ──');

// E1: Arabic مسجد in primary, PPL → reject
c = makeCandidate({
    slug: 'masjid-test',
    featureCode: 'PPL',
    population: 100,
    nameAr: 'مسجد القرية',
    nameEn: 'Village Mosque'
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('E1: Arabic مسجد in primary + PPL → rejected',
    dec.status === 'rejected' && dec.reason === 'religious_site_not_city',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// E2: Arabic مسجد in primary, PPLA → admin-exempt
c = makeCandidate({
    slug: 'masjid-test-ppla',
    featureCode: 'PPLA',
    population: 100000,
    nameAr: 'مسجد سليمان',
    nameEn: 'Masjed Soleyman'
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('E2: Arabic مسجد in primary + PPLA → NOT rejected (admin-exempt)',
    dec.status !== 'rejected',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// ─── Part F — non_place check still works (no breakdown needed) ────────────
console.log('\n── Part F — non_place keyword still works (unchanged path) ──');

c = makeCandidate({
    slug: 'mountain-test',
    featureCode: 'PPL',
    population: 100,
    nameEn: 'Some Mountain'
});
bl = checkBlocklist(c, RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS);
ok('F1: mountain-keyword detected as non_place',
    bl.hit === 'non_place',
    '(got hit=' + bl.hit + ' kw=' + bl.keyword + ')');

// Provide ar so it doesn't bail at missing_real_ar_name first
c.names.ar = 'اسم نظيف';
dec = decideStatusAndTier(c, bl, distInfo, config);
ok('F1 follow-up: non_place + clean ar → needs_review (status quo)',
    dec.status === 'needs_review' && dec.reason === 'non_place_keyword',
    '(got status=' + dec.status + ' reason=' + dec.reason + ')');

// ─── Result ────────────────────────────────────────────────────────────────
const total = pass + fail;
console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('Result: ' + pass + ' pass / ' + fail + ' fail (out of ' + total + ')');
console.log('═══════════════════════════════════════════════════════════════════════');
process.exit(fail === 0 ? 0 : 1);
