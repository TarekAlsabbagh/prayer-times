// scripts/geodata/_asia_1d_in_e_dedupe_audit.mjs
//
// ASIA-1D-IN-E — DEDUPE-FIRST AUDIT (read-only).
//
// Builds the truly-new candidate list for IN-E by EXCLUDING:
//   1. Any slug already in curated-places.json (any country)
//   2. Any geonameId already in curated
//   3. Any candidate whose en/native name closely matches an existing
//      curated IN city (or any city) — to catch rename pairs missed
//      by slug equality (e.g., thoothukudi vs tuticorin)
//   4. Localities inside metro cities (admin1/admin2-derived heuristic)
//   5. Population-suspect entries (very low pop with PPL but suspicious gid)
//
// Inspiration list from user is matched against the dedup-filtered
// remaining pool — used as ranking hint, NOT as authoritative scope.
//
// NO mutations. Pure analysis.

import { readFileSync, writeFileSync } from 'node:fs';

const CURATED_PATH = new URL('../../db/places/curated-places.json', import.meta.url);
const CANDS_PATH   = new URL('../../db/places/candidates/in-geonames-candidates.json', import.meta.url);
const RAW_PATH     = new URL('../../db/places/candidates/in-geonames-raw.json', import.meta.url);
const OUT_PATH     = new URL('../../reports/asia-1d-in-e-dedupe-audit.json', import.meta.url);

const curated = JSON.parse(readFileSync(CURATED_PATH, 'utf8'));
const cands = JSON.parse(readFileSync(CANDS_PATH, 'utf8'));
const candItems = Array.isArray(cands) ? cands : (cands.candidates || cands.places || []);

// ───────────────────────────────────────────────────────────────────────
// Build the "already-in-curated" exclusion set
// ───────────────────────────────────────────────────────────────────────
const existingSlugs    = new Set();
const existingGids     = new Set();
const existingEnNames  = new Set();   // lowercase normalized
const existingAllNames = new Set();   // lowercase normalized — every lang + aliases
const inEntriesBySlug  = new Map();

function norm(s) {
    return String(s || '').toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')   // strip accents
        .replace(/[^a-z0-9]+/g, '').trim();
}

for (const e of curated) {
    if (e.slug) existingSlugs.add(e.slug);
    if (e.sourceId) {
        const gid = String(e.sourceId).replace(/^geonames:/, '');
        if (gid && /^\d+$/.test(gid)) existingGids.add(gid);
    }
    if (e.countryCode === 'in') inEntriesBySlug.set(e.slug, e);
    if (e.names) {
        for (const L of Object.keys(e.names)) {
            const v = e.names[L];
            if (typeof v === 'string' && v.trim()) {
                existingAllNames.add(norm(v));
                if (L === 'en') existingEnNames.add(norm(v));
            }
        }
    }
    if (e.aliases) {
        for (const L of Object.keys(e.aliases)) {
            if (!Array.isArray(e.aliases[L])) continue;
            for (const a of e.aliases[L]) {
                if (typeof a === 'string' && a.trim()) existingAllNames.add(norm(a));
            }
        }
    }
}

console.log('Existing curated slugs       : ' + existingSlugs.size);
console.log('Existing curated geonameIds  : ' + existingGids.size);
console.log('Existing curated en names    : ' + existingEnNames.size);
console.log('Existing curated all names+aliases: ' + existingAllNames.size);
console.log('Current IN entries           : ' + inEntriesBySlug.size);
console.log('');

// ───────────────────────────────────────────────────────────────────────
// Inspiration list (user-suggested for IN-E) — for ranking hint only
// ───────────────────────────────────────────────────────────────────────
const INSPIRATION = new Set([
    'hosur','nagercoil','thanjavur','vellore','tiruvottiyur','ambattur','ozhukarai',
    'karaikudi','cuddalore','dindigul','thoothukudi','tuticorin','sivakasi',
    'kanchipuram','kumbakonam','pallavaram','tambaram','ambur','ranipet',
    'nagapattinam','gudiyatham','pollachi','rajapalayam','palakkad','thrissur',
    'kollam','alappuzha','kannur','kayamkulam','kottayam','malappuram',
    'pathanamthitta','thiruvananthapuram'
]);

// ───────────────────────────────────────────────────────────────────────
// Filter candidates
// ───────────────────────────────────────────────────────────────────────
const excludedSlugMatch = [];
const excludedGidMatch  = [];
const excludedNameMatch = [];
const excludedLowQuality = [];
const eligible = [];

for (const it of candItems) {
    const c = it.candidate;
    if (!c || c.countryCode !== 'in') continue;
    const slug = c.slug;
    const gid = String(c.sourceId || '').replace(/^geonames:/, '');
    const en = c.names && c.names.en;

    // (1) slug already in curated
    if (existingSlugs.has(slug)) {
        excludedSlugMatch.push({ slug, gid, en, reason: 'slug already in curated' });
        continue;
    }
    // (2) geonameId already in curated
    if (existingGids.has(gid)) {
        excludedGidMatch.push({ slug, gid, en, reason: 'geonameId already in curated', existingSlug: [...curated].find(e => e.sourceId === 'geonames:' + gid)?.slug });
        continue;
    }
    // (3) en name (normalized) matches an existing en name OR alias
    const enN = norm(en);
    if (enN && existingAllNames.has(enN)) {
        excludedNameMatch.push({ slug, gid, en, reason: 'en name matches existing curated name/alias' });
        continue;
    }
    // (4) Low-quality filters
    const pop = Number(c.population) || 0;
    const fc = c.featureCode || '';
    if (pop < 50000) {
        excludedLowQuality.push({ slug, gid, en, pop, fc, reason: 'population < 50k (next-tier threshold)' });
        continue;
    }
    if (!['PPL','PPLA','PPLA2','PPLA3','PPLC'].includes(fc)) {
        excludedLowQuality.push({ slug, gid, en, pop, fc, reason: 'non-PPL feature code' });
        continue;
    }
    // PASS — eligible
    eligible.push({
        slug, gid, en, pop, fc,
        status: it.status,
        tier: it.tier,
        inInspiration: INSPIRATION.has(slug)
    });
}

// Sort eligible by population desc
eligible.sort((a, b) => b.pop - a.pop);

console.log('Excluded — slug already in curated   : ' + excludedSlugMatch.length);
console.log('Excluded — geonameId already in curated: ' + excludedGidMatch.length);
console.log('Excluded — name matches existing     : ' + excludedNameMatch.length);
console.log('Excluded — low-quality (pop/fc)      : ' + excludedLowQuality.length);
console.log('ELIGIBLE candidates                  : ' + eligible.length);
console.log('');

// Show inspiration-list status
console.log('=== Inspiration list (user-suggested) status ===');
const inspirationResult = [];
for (const slug of INSPIRATION) {
    const isCurated = existingSlugs.has(slug);
    const inEligible = eligible.find(e => e.slug === slug);
    if (isCurated) {
        inspirationResult.push({ slug, status: 'already-in-curated' });
    } else if (inEligible) {
        inspirationResult.push({ slug, status: 'eligible', en: inEligible.en, pop: inEligible.pop });
    } else {
        // Check if excluded for any reason
        const sm = excludedSlugMatch.find(x => x.slug === slug);
        const gm = excludedGidMatch.find(x => x.slug === slug);
        const nm = excludedNameMatch.find(x => x.slug === slug);
        const lq = excludedLowQuality.find(x => x.slug === slug);
        if (sm) inspirationResult.push({ slug, status: 'excluded:slug-match' });
        else if (gm) inspirationResult.push({ slug, status: 'excluded:gid-match' });
        else if (nm) inspirationResult.push({ slug, status: 'excluded:name-match' });
        else if (lq) inspirationResult.push({ slug, status: 'excluded:low-quality', pop: lq.pop });
        else inspirationResult.push({ slug, status: 'not-in-candidates' });
    }
}
for (const r of inspirationResult) {
    console.log('  ' + r.slug.padEnd(22) + ' ' + r.status + (r.en ? ' (en=' + r.en + ', pop=' + r.pop + ')' : (r.pop !== undefined ? ' (pop=' + r.pop + ')' : '')));
}

console.log('');
console.log('=== Top 40 eligible candidates (sorted by pop desc) ===');
for (const e of eligible.slice(0, 40)) {
    const mark = e.inInspiration ? '★' : ' ';
    console.log('  ' + mark + ' ' + e.slug.padEnd(22) + ' en=' + (e.en||'').padEnd(22) + ' pop=' + String(e.pop).padEnd(10) + ' fc=' + e.fc.padEnd(6) + ' status=' + e.status + ' tier=' + e.tier);
}

writeFileSync(OUT_PATH, JSON.stringify({
    timestamp: new Date().toISOString(),
    counts: {
        existingCurated: existingSlugs.size,
        existingIn: inEntriesBySlug.size,
        excludedSlugMatch: excludedSlugMatch.length,
        excludedGidMatch: excludedGidMatch.length,
        excludedNameMatch: excludedNameMatch.length,
        excludedLowQuality: excludedLowQuality.length,
        eligible: eligible.length
    },
    inspirationListStatus: inspirationResult,
    eligibleTop60: eligible.slice(0, 60),
    excludedSlugMatch: excludedSlugMatch.slice(0, 50),
    excludedGidMatch,
    excludedNameMatch: excludedNameMatch.slice(0, 30)
}, null, 2), 'utf8');

console.log('');
console.log('Report: ' + OUT_PATH.pathname);
