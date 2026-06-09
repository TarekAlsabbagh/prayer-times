#!/usr/bin/env node
/* Unit test for scripts/review-discovered-cities.mjs (DISCOVERED-CITY-TO-CURATED-REVIEW-WORKFLOW-FIX-1).
 * Uses a SYNTHETIC in-memory curated set + discovered fixture (deterministic, independent of the
 * real curated-places.json) to assert every classification branch. Pure-function test — no Supabase,
 * no file writes, no curated mutation. */
import {
    buildCuratedIndex, classifyRow, cleanSlugFor, classifyField, isCleanScript, COUNTRY_REQUIRED_LANGS
} from './review-discovered-cities.mjs';

let pass = 0, fail = 0;
const eq = (got, want, msg) => {
    if (got === want) { pass++; }
    else { fail++; console.error(`FAIL ${msg}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); };
};

// ── synthetic curated (3 entries: chefchaouen+rabat in MA, london in GB) ──
const curated = [
    { slug: 'chefchaouen', countryCode: 'ma', lat: 35.1688, lng: -5.2683, names: { ar: 'شفشاون', en: 'Chefchaouen' } },
    { slug: 'rabat', countryCode: 'ma', lat: 34.0209, lng: -6.8417, names: { ar: 'الرباط', en: 'Rabat' } },
    { slug: 'london', countryCode: 'gb', lat: 51.5074, lng: -0.1278, names: { ar: 'لندن', en: 'London' } }
];
const idx = buildCuratedIndex(curated);
const OPTS = { minSelected: 3, nearDeg: 0.15 };

// ── discovered fixture: one row per expected class ──
const rows = [
    // 1. ALREADY_CURATED — chefchaouen already in curated (clean slug + same cc)
    { slug: 'chefchaouen-ma', type: 'city', country_code: 'ma', lat: 35.1688, lng: -5.2683, timezone: 'Africa/Casablanca',
      names: { ar: 'شفشاون', en: 'Chefchaouen' }, name_quality: { ar: 'official' }, selected_count: 5 },
    // 2. READY_FOR_REVIEW — native ar+en + a DISTINCT native local lang (de != en, DE requires de),
    //    free slug, not a dup → demonstrates the suggestion carrying a real local name
    { slug: 'neustadt-de', type: 'city', country_code: 'de', lat: 49.35, lng: 8.14, timezone: 'Europe/Berlin',
      names: { ar: 'نويشتات', en: 'Neustadt', de: 'Neustädt' }, name_quality: { ar: 'official' }, selected_count: 4 },
    // 3. NEEDS_AR_NAME — Latin in the ar slot (polluted) → no trustworthy Arabic name
    { slug: 'someplace-fr', type: 'city', country_code: 'fr', lat: 45.0, lng: 3.0, timezone: 'Europe/Paris',
      names: { ar: 'Someplace', en: 'Someplace', fr: 'Someplace' }, name_quality: { ar: 'fallback_en' }, selected_count: 4 },
    // 4. SLUG_CONFLICT — London, Ontario: clean slug "london" taken by curated london (gb), different place
    { slug: 'london-ca', type: 'city', country_code: 'ca', lat: 42.9849, lng: -81.2453, timezone: 'America/Toronto',
      names: { ar: 'لندن أونتاريو', en: 'London' }, name_quality: { ar: 'official' }, selected_count: 6 },
    // 5. NEAR_DUPLICATE — Temara sits ~10km from curated rabat (within 0.15°), different slug/name
    { slug: 'temara-ma', type: 'city', country_code: 'ma', lat: 33.9287, lng: -6.9063, timezone: 'Africa/Casablanca',
      names: { ar: 'تمارة', en: 'Temara' }, name_quality: { ar: 'official' }, selected_count: 4 },
    // 6. SKIP_LOW_CONFIDENCE — picked only once, below min-selected 3 (has a fine ar name otherwise)
    { slug: 'remote-village-ma', type: 'city', country_code: 'ma', lat: 31.0, lng: -7.0, timezone: 'Africa/Casablanca',
      names: { ar: 'قرية نائية', en: 'Remote Village' }, name_quality: { ar: 'official' }, selected_count: 1 }
];

const expected = ['ALREADY_CURATED', 'READY_FOR_REVIEW', 'NEEDS_AR_NAME', 'SLUG_CONFLICT', 'NEAR_DUPLICATE', 'SKIP_LOW_CONFIDENCE'];
const got = rows.map(r => classifyRow(r, idx, OPTS));
got.forEach((g, i) => eq(g.class, expected[i], `row ${i} (${rows[i].slug})`));

// ── targeted assertions ──
eq(cleanSlugFor('chefchaouen-ma', 'ma'), 'chefchaouen', 'cleanSlug strips -ma');
eq(cleanSlugFor('panama', 'pa'), 'panama', 'cleanSlug keeps non-suffix');
eq(cleanSlugFor('london-ca', 'ca'), 'london', 'cleanSlug strips -ca');
eq(isCleanScript('شفشاون', 'ar'), true, 'ar script accepts Arabic');
eq(isCleanScript('Chefchaouen', 'ar'), false, 'ar script rejects Latin');
eq(classifyField('Someplace', 'ar', 'Someplace'), 'polluted', 'ar Latin = polluted');
eq(classifyField('Larache', 'fr', 'Larache'), 'fillchain', 'fr == en = fillchain');
eq(classifyField('العرائش', 'ar', 'Larache'), 'native', 'real ar = native');
eq(classifyField('', 'ar', 'X'), 'missing', 'empty = missing');
// READY row carries native names INCLUDING the distinct local lang (de) — never a translation
eq(JSON.stringify(got[1].suggestion.names), JSON.stringify({ ar: 'نويشتات', en: 'Neustadt', de: 'Neustädt' }), 'suggestion carries native local (de) name');
// a non-en supported name identical to en is flagged fillchain → excluded (human re-adds if genuine, e.g. Maghreb fr)
eq(classifyField('Larache', 'fr', 'Larache'), 'fillchain', 'fr == en flagged fillchain (excluded from auto-suggestion)');
// NEEDS_AR row drops the polluted ar from the suggestion (never invents one)
eq(got[2].suggestion.names.ar, undefined, 'polluted ar excluded from suggestion');
eq(got[1].suggestion.slug, 'neustadt', 'suggestion uses clean slug');
eq(got[4].dedup.nearHit, 'rabat', 'near-dup names the curated neighbour');
eq(got[3].dedup.slugHit, 'london', 'slug-conflict names the curated holder');
// MA requires fr per the canonical map
eq(JSON.stringify(COUNTRY_REQUIRED_LANGS.ma || []), JSON.stringify([]), 'ma not in required-local map (fr is optional-but-checked)');
eq(JSON.stringify(COUNTRY_REQUIRED_LANGS.pk), JSON.stringify(['ur']), 'pk requires ur');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
