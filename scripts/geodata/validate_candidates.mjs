// scripts/geodata/validate_candidates.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 3: VALIDATE + tier refinement (country-agnostic)
//
// Usage: node scripts/geodata/validate_candidates.mjs <cc>
//   <cc> = lowercase 2-letter ISO code. Default 'sa'.
//
// Reads <cc>-geonames-normalized.json + db/places/curated-places.json,
// produces:
//   - <cc>-geonames-candidates.json (each candidate with status + tier)
//   - reports/<cc>-geodata-import-report.md
//   - reports/<cc>-geodata-aliases-review.md
//
// Rules:
//   * NO auto-approval — `approved` is always empty until user decides.
//   * Religious / landmark blocklist → status='rejected'.
//   * Non-place blocklist (mountain, farm, station, …) → needs_review.
//   * Distance to nearest curated entry (same country) computed.
//   * Pending pool split into 'high' / 'medium' / 'low' tiers.
//   * Alias enrichment in a separate report file.
//
// Data attribution:
//   © GeoNames — licensed CC-BY 4.0
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import {
    pathsFor, loadCountryConfig,
    normalizeArabic, normalizeLatin, haversineKm,
    RELIGIOUS_KEYWORDS, NON_PLACE_KEYWORDS, matchAnyKeyword,
    effectiveKeywords
} from './_geonames_common.mjs';

// ─── Build dedupe indices from existing curated entries (same country) ───
function buildExistingIndex(curated, cc) {
    const sa = curated.filter(x => x.countryCode === cc);
    const bySlug      = new Map();
    const byArName    = new Map();
    const byEnName    = new Map();
    const bySourceId  = new Map();
    const coordsList  = [];   // { lat, lng, slug, ar, en }

    function pushTo(map, k, v) {
        if (!k) return;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(v);
    }

    for (const e of sa) {
        bySlug.set(e.slug, e);
        if (e.sourceId) bySourceId.set(e.sourceId, e);
        const ar = e.names && e.names.ar;
        const en = e.names && e.names.en;
        pushTo(byArName, normalizeArabic(ar || ''), e);
        pushTo(byEnName, normalizeLatin(en || ''), e);
        for (const a of ((e.aliases && e.aliases.ar) || [])) {
            pushTo(byArName, normalizeArabic(a), e);
        }
        for (const a of ((e.aliases && e.aliases.en) || [])) {
            pushTo(byEnName, normalizeLatin(a), e);
        }
        coordsList.push({ lat: e.lat, lng: e.lng, slug: e.slug, ar, en });
    }
    return { saList: sa, bySlug, byArName, byEnName, bySourceId, coordsList };
}

// ─── Find the best existing match (or null) ───
function findExistingMatch(cand, idx) {
    if (cand.sourceId && idx.bySourceId.has(cand.sourceId)) {
        return { reason: 'sourceId', match: idx.bySourceId.get(cand.sourceId) };
    }
    if (idx.bySlug.has(cand.slug)) {
        return { reason: 'slug', match: idx.bySlug.get(cand.slug) };
    }
    const arKey = normalizeArabic(cand.names.ar || '');
    if (arKey && idx.byArName.has(arKey)) {
        for (const m of idx.byArName.get(arKey)) {
            const d = haversineKm(cand.lat, cand.lng, m.lat, m.lng);
            if (d < 50) return { reason: 'ar_name+coords', match: m, distance: d };
        }
    }
    const enKey = normalizeLatin(cand.names.en || '');
    if (enKey && idx.byEnName.has(enKey)) {
        for (const m of idx.byEnName.get(enKey)) {
            const d = haversineKm(cand.lat, cand.lng, m.lat, m.lng);
            if (d < 50) return { reason: 'en_name+coords', match: m, distance: d };
        }
    }
    for (const c of idx.coordsList) {
        const d = haversineKm(cand.lat, cand.lng, c.lat, c.lng);
        if (d < 1.0) {
            return { reason: 'coords<1km', match: { slug: c.slug, names: { ar: c.ar, en: c.en } }, distance: d };
        }
    }
    return null;
}

// ─── Compute distance from candidate to nearest curated Saudi entry ───
function distanceToNearestCurated(cand, saList) {
    let min = Infinity, nearest = null;
    for (const e of saList) {
        const d = haversineKm(cand.lat, cand.lng, e.lat, e.lng);
        if (d < min) { min = d; nearest = e; }
    }
    return { km: min, slug: nearest ? nearest.slug : '', nameAr: nearest && nearest.names ? nearest.names.ar : '' };
}

// ─── Detect blocklist hits ───
// Returns { hit: 'religious' | 'non_place' | null, keyword: '...', in: 'primary'|'alias'|null }
// `religiousKw` and `nonPlaceKw` allow per-country extensions on top of
// the cross-Arabic defaults.
//
// STAGE-3-RELIGIOUS-EXEMPTION-1 (2026-05-20): religious-keyword check now
// separates `primary` (names.ar/names.en) from `alias` (aliases.ar/aliases.en)
// hits so `decideStatusAndTier` can apply differentiated routing per the
// approved 3-tier policy (admin-exempt + primary-reject + alias-only-review).
// `non_place` check kept on the combined string (no behavior change).
export function checkBlocklist(cand, religiousKw, nonPlaceKw) {
    const primaryStr = (cand.names.ar || '') + ' ' + (cand.names.en || '');
    const aliasStr   = ((cand.aliases && cand.aliases.ar) || []).join(' ') + ' '
                     + ((cand.aliases && cand.aliases.en) || []).join(' ');

    // Religious — check primary first, then aliases. Distinction matters
    // for admin centers + alias-only routing in decideStatusAndTier.
    const relPrimary = matchAnyKeyword(primaryStr, religiousKw);
    if (relPrimary) return { hit: 'religious', keyword: relPrimary, in: 'primary' };
    const relAlias   = matchAnyKeyword(aliasStr,   religiousKw);
    if (relAlias)   return { hit: 'religious', keyword: relAlias,   in: 'alias' };

    // Non-place — same as before (combined check; no breakdown needed)
    const combined = primaryStr + ' ' + aliasStr;
    const np = matchAnyKeyword(combined, nonPlaceKw);
    if (np) return { hit: 'non_place', keyword: np, in: null };
    return { hit: null, keyword: null, in: null };
}

// ─── Quality scoring (same scale as before, 0-100) ───
function qualityScore(cand) {
    const flags = cand._normalizationFlags || [];
    let s = 0;
    if (!flags.includes('missing_ar_name')) s += 30;
    if (!flags.some(f => f.startsWith('unknown_region'))) s += 20;
    if (['PPLC','PPLA','PPLA2','PPLA3','PPLA4'].includes(cand.featureCode)) s += 25;
    else if (cand.featureCode === 'PPLS') s += 15;
    else if (cand.featureCode === 'PPL')  s += 10;
    else if (cand.featureCode === 'PPLL') s += 5;
    if (!flags.includes('missing_population')) s += 15;
    if (cand.aliases && cand.aliases.ar && cand.aliases.ar.length > 0) s += 5;
    if (cand.aliases && cand.aliases.en && cand.aliases.en.length > 0) s += 5;
    return s;
}

// ─── Decide status + tier ───
//
// IMPORTANT: per user spec for refinement (1B), nothing is auto-approved.
// All eligible entries become `pending` with a `tier` field. The user
// reviews high → medium → low and flips to `approved` manually before
// Stage 4.
//
// `config` is the per-country config (from loadCountryConfig). When
// config.popMin is defined (Europe Strategy E), the high tier requires
// either pop ≥ popMin OR feature_code in config.alwaysIncludeFeatureCodes.
// When config.popMin is undefined (MENA legacy waves), the original
// logic is preserved exactly — no behavior change for SA/QA/AE/.../MR.
export function decideStatusAndTier(cand, blocklist, distInfo, config) {
    // Hard rejections (data integrity)
    if (!isFinite(cand.lat) || !isFinite(cand.lng) ||
        cand.lat < -90 || cand.lat > 90 ||
        cand.lng < -180 || cand.lng > 180) {
        return { status: 'rejected', reason: 'bad_coords', tier: null };
    }
    if (!cand.slug)     return { status: 'rejected', reason: 'no_slug', tier: null };
    if (!cand.timezone) return { status: 'rejected', reason: 'no_timezone', tier: null };
    if (!cand.names.en) return { status: 'rejected', reason: 'no_en_name', tier: null };

    // ─── STAGE-3-RELIGIOUS-EXEMPTION-1 (2026-05-20) ───
    // Original behavior was: religious-keyword hit anywhere (primary name
    // OR aliases) → reject candidate. That caused false positives like
    // `bd/rangpur` (PPLA pop=1M rejected because aliases.en contained
    // "Mosque Rangpur"), `ir/masjed-soleyman` (real PPLA2 city named after
    // a famous mosque), and `us/lexington` (PPLA2 with "Shrine of the
    // South" descriptor alias).
    //
    // Plan ref: reports/stage-3-religious-exemption-1-plan.md (Option C —
    // admin-exempt + primary-reject + alias-only → needs_review).
    //
    // New 3-tier rule applied below:
    //   (a) Admin centers (PPLC/PPLA/PPLA2/PPLA3): NEVER reject via
    //       religious-keyword. Trust GeoNames featureCode — these are
    //       real cities by definition. Log warning via
    //       `_religiousExemptionWarning` and fall through to normal
    //       tier-assignment. (suspicious alias remains attached;
    //       downstream apply scripts may drop it explicitly — the BD-A
    //       `Mosque Rangpur` drop pattern.)
    //
    //   (b) Non-admin + primary-name hit: REJECT (status quo). Preserves
    //       the ~360 true positives across all countries — small villages
    //       whose primary name literally identifies them as a mosque/
    //       shrine/mausoleum site.
    //
    //   (c) Non-admin + alias-only hit: SOFT-REJECT → `needs_review`
    //       with reason `religious_alias_only`. User can manually audit
    //       (drop the alias + approve) or confirm the rejection. Avoids
    //       the previous hard-reject that conflated descriptive aliases
    //       with actual religious-site classification.
    if (blocklist.hit === 'religious') {
        const ADMIN_FEATURES = new Set(['PPLC', 'PPLA', 'PPLA2', 'PPLA3']);

        if (ADMIN_FEATURES.has(cand.featureCode)) {
            // (a) Admin exemption — DO NOT reject. Annotate for audit.
            // Flow falls through to the rest of decideStatusAndTier
            // (missing_ar_name check, non_place check, tier-assignment).
            cand._religiousExemptionWarning = blocklist.keyword
                + ' (' + (blocklist.in || 'unknown') + ')';
            // (intentional no early return — continue below)
        } else if (blocklist.in === 'primary') {
            // (b) Primary-name explicit religious → reject (true positive)
            return { status: 'rejected', reason: 'religious_site_not_city',
                     tier: null, keyword: blocklist.keyword };
        } else {
            // (c) Alias-only on non-admin → soft-reject (needs_review)
            return { status: 'needs_review', reason: 'religious_alias_only',
                     tier: null, keyword: blocklist.keyword };
        }
    }

    const flags = cand._normalizationFlags || [];
    const hasRealAr = !flags.includes('missing_ar_name');

    // No real Arabic name → needs_review (user must add translation)
    if (!hasRealAr) {
        return { status: 'needs_review', reason: 'missing_real_ar_name', tier: null };
    }

    // Non-place blocklist (geography / infra) with real Arabic →
    // needs_review (user decides if it's actually a populated place)
    if (blocklist.hit === 'non_place') {
        return { status: 'needs_review', reason: 'non_place_keyword', tier: null,
                 keyword: blocklist.keyword };
    }

    // All remaining go to `pending` with a tier.
    const hasRegion = !flags.some(f => f.startsWith('unknown_region'));
    const hasPop    = !flags.includes('missing_population');
    const fc = cand.featureCode;
    const qs = qualityScore(cand);
    const distOK = distInfo.km > 3;

    // ─── Strategy E branch (Europe-1A): popMin + alwaysIncludeFeatureCodes ───
    if (config && typeof config.popMin === 'number') {
        const popMin = config.popMin;
        const alwaysFC = new Set(config.alwaysIncludeFeatureCodes || []);
        const meetsPopThreshold = (Number(cand.population) || 0) >= popMin;
        const isAlwaysInclude = alwaysFC.has(fc);

        // High tier: distance OK + (pop ≥ popMin OR PPLC/PPLA always-include)
        // Region is preferred but not required for capitals (some
        // micro-states / island territories have no admin1 codes).
        if (distOK && (meetsPopThreshold || isAlwaysInclude)) {
            if (isAlwaysInclude || (meetsPopThreshold && qs >= 75)) {
                return { status: 'pending', tier: 'high',
                         reason: isAlwaysInclude
                             ? ('always_include:' + fc)
                             : 'pop_gte_' + popMin };
            }
            // Below qScore threshold but above popMin → medium
            return { status: 'pending', tier: 'medium', reason: 'pop_pass_qs_below_75' };
        }

        // Failed the popMin gate AND not always-include → low
        return { status: 'pending', tier: 'low',
                 reason: 'below_popMin_and_not_always_include' };
    }

    // ─── Legacy MENA branch (SA/QA/AE/.../MR — unchanged) ───
    const isAdminOrPPL = ['PPLA2', 'PPLA3', 'PPLA4', 'PPL'].includes(fc);

    // Hard requirements to enter the shortlist (high or medium)
    const shortlistEligible = hasRegion && isAdminOrPPL && distOK;

    if (shortlistEligible && qs >= 80 && (hasPop || qs >= 80)) {
        return { status: 'pending', tier: 'high', reason: 'strict_all_pass' };
    }
    if (shortlistEligible && qs >= 70) {
        return { status: 'pending', tier: 'medium', reason: 'qScore_70_79' };
    }
    return { status: 'pending', tier: 'low', reason: 'default_pending' };
}

// ─── Alias enrichment scanning (split into its own report) ───
function aliasEnrichmentFor(existing, candidate) {
    if (!existing || !existing.names) return null;
    const out = { ar: [], en: [] };
    const existingAr = new Set(
        [(existing.names.ar || '')]
            .concat((existing.aliases && existing.aliases.ar) || [])
            .map(s => normalizeArabic(s)).filter(Boolean)
    );
    const existingEn = new Set(
        [(existing.names.en || '')]
            .concat((existing.aliases && existing.aliases.en) || [])
            .map(s => normalizeLatin(s)).filter(Boolean)
    );
    const candAr = [candidate.names.ar, ...((candidate.aliases && candidate.aliases.ar) || [])].filter(Boolean);
    const candEn = [candidate.names.en, ...((candidate.aliases && candidate.aliases.en) || [])].filter(Boolean);
    for (const a of candAr) {
        if (!existingAr.has(normalizeArabic(a))) out.ar.push(a);
    }
    for (const a of candEn) {
        if (!existingEn.has(normalizeLatin(a))) out.en.push(a);
    }
    return (out.ar.length || out.en.length) ? out : null;
}

// ─── Render main report ───
function renderMainReport(stats, sample, ctx) {
    const cc = ctx.cc.toLowerCase();
    const CC = ctx.cc.toUpperCase();
    const lines = [];
    lines.push('# ' + CC + ' GeoNames Import Report (refined)');
    lines.push('');
    lines.push('**Country**: ' + ctx.countryEn + ' (' + ctx.countryAr + ')');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Phase**: `' + ctx.phaseLabel + '`');
    lines.push('');
    lines.push('## Pipeline');
    lines.push('');
    lines.push('| Stage | Output |');
    lines.push('| --- | --- |');
    lines.push('| 1. IMPORT    | `db/places/candidates/' + cc + '-geonames-raw.json` |');
    lines.push('| 2. NORMALIZE | `db/places/candidates/' + cc + '-geonames-normalized.json` |');
    lines.push('| 3. VALIDATE  | `db/places/candidates/' + cc + '-geonames-candidates.json` + THIS report |');
    lines.push('| 3b. ALIAS REVIEW | `reports/' + cc + '-geodata-aliases-review.md` (separate) |');
    lines.push('| 4. APPLY     | **NOT RUN — awaiting your decision** |');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Bucket | Count |');
    lines.push('| --- | --- |');
    lines.push('| Raw GeoNames rows (P-class only)         | ' + stats.rawCount + ' |');
    lines.push('| Normalized candidates                     | ' + stats.normalizedCount + ' |');
    lines.push('| **approved_auto**                         | **' + stats.approved + '** (always 0 under 1B refinement) |');
    lines.push('| **high_confidence_pending**               | **' + stats.tierCounts.high + '** |');
    lines.push('| **medium_confidence_pending**             | **' + stats.tierCounts.medium + '** |');
    lines.push('| **low_confidence_pending**                | **' + stats.tierCounts.low + '** |');
    lines.push('| needs_review                              | ' + stats.needs_review + ' |');
    lines.push('| existing (matched, no action)             | ' + stats.existing + ' |');
    lines.push('| rejected (bad data / religious site)      | ' + stats.rejected + ' |');
    lines.push('| Alias enrichment opps (in separate report) | ' + stats.aliasEnrichCount + ' |');
    lines.push('');
    lines.push('**Shortlist size (high + medium):** ' + (stats.tierCounts.high + stats.tierCounts.medium));
    lines.push('');
    lines.push('## Rejection breakdown');
    lines.push('');
    lines.push('| Reason | Count |');
    lines.push('| --- | --- |');
    for (const [k, v] of Object.entries(stats.rejectionReasons).sort((a,b)=>b[1]-a[1])) {
        lines.push('| ' + k + ' | ' + v + ' |');
    }
    lines.push('');
    lines.push('## Match-reason breakdown (existing)');
    lines.push('');
    lines.push('| Reason | Count |');
    lines.push('| --- | --- |');
    for (const [k, v] of Object.entries(stats.matchReasons).sort((a,b)=>b[1]-a[1])) {
        lines.push('| ' + k + ' | ' + v + ' |');
    }
    lines.push('');
    lines.push('## High-confidence shortlist (full listing)');
    lines.push('');
    lines.push('These are the candidates the user should review FIRST.');
    lines.push('All satisfy: real Arabic name + known region + admin or PPL');
    lines.push('feature + qScore ≥ 80 + distance >3km to nearest existing entry');
    lines.push('+ no blocklist match.');
    lines.push('');
    if (!sample.high.length) {
        lines.push('_(empty — no candidate met all strict gates)_');
        lines.push('');
    } else {
        lines.push('| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |');
        lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const e of sample.high) {
            const c = e.candidate;
            lines.push('| ' + c.slug
                     + ' | ' + (c.names.ar || '')
                     + ' | ' + (c.names.en || '')
                     + ' | ' + (c.admin?.regionAr || '')
                     + ' | ' + c.featureCode
                     + ' | ' + e.qualityScore
                     + ' | ' + (c.population || '-')
                     + ' | ' + (e.distanceToNearestKm != null ? e.distanceToNearestKm.toFixed(2) : '-')
                     + ' | ' + (e.nearestCuratedSlug || '-')
                     + ' |');
        }
        lines.push('');
    }
    lines.push('## Medium-confidence pending (top 25 by qScore, full set in JSON)');
    lines.push('');
    lines.push('Same gates as high, but qScore 70-79. Review AFTER high.');
    lines.push('');
    if (!sample.medium.length) {
        lines.push('_(empty)_');
        lines.push('');
    } else {
        lines.push('| slug | name.ar | name.en | region | fc | qScore | distNearestKm |');
        lines.push('| --- | --- | --- | --- | --- | --- | --- |');
        for (const e of sample.medium.slice(0, 25)) {
            const c = e.candidate;
            lines.push('| ' + c.slug
                     + ' | ' + (c.names.ar || '')
                     + ' | ' + (c.names.en || '')
                     + ' | ' + (c.admin?.regionAr || '')
                     + ' | ' + c.featureCode
                     + ' | ' + e.qualityScore
                     + ' | ' + (e.distanceToNearestKm != null ? e.distanceToNearestKm.toFixed(2) : '-')
                     + ' |');
        }
        lines.push('');
    }
    lines.push('## Low-confidence pending');
    lines.push('');
    lines.push('Failed at least one strict gate (unknown region OR not PPL/PPLA*');
    lines.push('OR qScore <70 OR within 3km of existing entry).');
    lines.push('Recommended: DO NOT review this tier in the first pass.');
    lines.push('');
    lines.push('Count: **' + stats.tierCounts.low + '**');
    lines.push('');
    lines.push('## needs_review examples (no Arabic OR non-place keyword)');
    lines.push('');
    if (!sample.needs_review.length) {
        lines.push('_(none)_');
    } else {
        lines.push('| slug | name.ar | name.en | region | fc | reason |');
        lines.push('| --- | --- | --- | --- | --- | --- |');
        for (const e of sample.needs_review.slice(0, 10)) {
            const c = e.candidate;
            const reason = e.reason + (e.keyword ? ' (kw: ' + e.keyword + ')' : '');
            lines.push('| ' + c.slug
                     + ' | ' + (c.names.ar || '')
                     + ' | ' + (c.names.en || '')
                     + ' | ' + (c.admin?.regionAr || '')
                     + ' | ' + c.featureCode
                     + ' | ' + reason
                     + ' |');
        }
    }
    lines.push('');
    lines.push('## rejected examples');
    lines.push('');
    if (!sample.rejected.length) {
        lines.push('_(none)_');
    } else {
        lines.push('| slug | name.ar | name.en | reason | keyword |');
        lines.push('| --- | --- | --- | --- | --- |');
        for (const e of sample.rejected.slice(0, 10)) {
            const c = e.candidate;
            lines.push('| ' + c.slug
                     + ' | ' + (c.names.ar || '')
                     + ' | ' + (c.names.en || '')
                     + ' | ' + (e.reason || '')
                     + ' | ' + (e.keyword || '')
                     + ' |');
        }
    }
    lines.push('');
    lines.push('## existing examples (already in curated)');
    lines.push('');
    if (!sample.existing.length) {
        lines.push('_(none)_');
    } else {
        lines.push('| candidate.slug | matched existing.slug | reason |');
        lines.push('| --- | --- | --- |');
        for (const e of sample.existing.slice(0, 10)) {
            lines.push('| ' + e.candidate.slug + ' | ' + (e.matchedExisting || '') + ' | ' + (e.matchedReason || e.reason) + ' |');
        }
    }
    lines.push('');
    lines.push('## What to do next');
    lines.push('');
    lines.push('1. Read the **high-confidence shortlist** above. Decide which');
    lines.push('   entries are real Saudi places worth curating.');
    lines.push('2. Open `db/places/candidates/sa-geonames-candidates.json`.');
    lines.push('3. For each entry you approve: change `"status": "pending"`');
    lines.push('   to `"status": "approved"`. (Leave `"tier"` as-is for audit.)');
    lines.push('4. For obvious rejections (junk, dupes you missed, sub-areas):');
    lines.push('   change to `"status": "rejected"`.');
    lines.push('5. Once you\'re done with high, optionally repeat for medium.');
    lines.push('6. After review, when Stage 4 exists, it will merge only the');
    lines.push('   `status="approved"` entries into curated-places.json.');
    lines.push('');
    lines.push('## License + Attribution');
    lines.push('');
    lines.push('Place data is derived from the GeoNames geographical database,');
    lines.push('licensed under Creative Commons Attribution 4.0 (CC-BY 4.0).');
    lines.push('Source: https://download.geonames.org/export/dump/SA.zip');
    lines.push('GeoNames: https://www.geonames.org/');
    lines.push('');
    return lines.join('\n');
}

// ─── Render alias enrichment report (separate file) ───
function renderAliasReport(opportunities, ctx) {
    const CC = ctx.cc.toUpperCase();
    const lines = [];
    lines.push('# ' + CC + ' GeoNames — Alias Enrichment Review');
    lines.push('');
    lines.push('**Country**: ' + ctx.countryEn + ' (' + ctx.countryAr + ')');
    lines.push('**Generated**: ' + new Date().toISOString());
    lines.push('**Phase**: `' + ctx.phaseLabel + '`');
    lines.push('');
    lines.push('## Overview');
    lines.push('');
    lines.push('These are EXISTING curated ' + ctx.countryEn + ' entries that could');
    lines.push('gain additional aliases from GeoNames data. They are listed here');
    lines.push('separately because:');
    lines.push('');
    lines.push('* Adding aliases is less risky than adding new places.');
    lines.push('* But each new alias should still be verified before applying.');
    lines.push('* Stage 4 will NOT auto-apply these.');
    lines.push('');
    lines.push('**Count: ' + opportunities.length + '** existing entries with at least one new alias.');
    lines.push('');
    lines.push('## How to apply (manual, recommended)');
    lines.push('');
    lines.push('When you\'re happy with a row below, edit the matching entry in');
    lines.push('`db/places/curated-places.json` and add the new aliases to its');
    lines.push('`aliases.ar` / `aliases.en` arrays.');
    lines.push('');
    lines.push('## Opportunities');
    lines.push('');
    lines.push('| existing.slug | new aliases.ar | new aliases.en |');
    lines.push('| --- | --- | --- |');
    for (const o of opportunities) {
        const ar = (o.newAliases.ar || []).join('، ');
        const en = (o.newAliases.en || []).join(', ');
        lines.push('| ' + o.existingSlug + ' | ' + ar + ' | ' + en + ' |');
    }
    lines.push('');
    lines.push('## License + Attribution');
    lines.push('');
    lines.push('© GeoNames — licensed CC-BY 4.0.');
    lines.push('Source: https://download.geonames.org/export/dump/' + CC + '.zip');
    lines.push('');
    return lines.join('\n');
}

async function main() {
    const cc = (process.argv[2] || 'sa').toLowerCase();
    const config = await loadCountryConfig(cc);
    const paths  = pathsFor(cc);

    // Effective keyword sets: cross-Arabic defaults + per-country extras
    const religiousKw = effectiveKeywords(RELIGIOUS_KEYWORDS, config.extraReligious || []);
    const nonPlaceKw  = effectiveKeywords(NON_PLACE_KEYWORDS, config.extraNonPlace  || []);

    const ctx = {
        cc,
        countryAr: config.countryAr,
        countryEn: config.countryEn,
        // Phase label — uniform "CURATED-GEODATA-{CC}-1" naming.
        // For SA we keep the original "CURATED-SA-GEODATA-IMPORT-1B" label
        // so re-runs reproduce the existing audit trail.
        phaseLabel: cc === 'sa'
            ? 'CURATED-SA-GEODATA-IMPORT-1B'
            : ('CURATED-GEODATA-' + cc.toUpperCase() + '-1')
    };

    if (!fs.existsSync(paths.normalizedJson)) {
        console.error('[stage3] missing input', paths.normalizedJson);
        console.error('         run: node scripts/geodata/normalize_places.mjs', cc);
        process.exit(1);
    }
    if (!fs.existsSync(paths.curatedPath)) {
        console.error('[stage3] missing input', paths.curatedPath);
        process.exit(1);
    }

    const normalized = JSON.parse(fs.readFileSync(paths.normalizedJson, 'utf8'));
    const curated    = JSON.parse(fs.readFileSync(paths.curatedPath, 'utf8'));
    console.log('[stage3]', cc.toUpperCase(), '— normalized candidates:', normalized.length);
    console.log('[stage3] curated total:', curated.length,
                '(' + cc + ':', curated.filter(x => x.countryCode === cc).length + ')');

    const idx = buildExistingIndex(curated, cc);

    const out = [];
    const aliasEnrich = [];
    const stats = {
        rawCount: 0,
        normalizedCount: normalized.length,
        existing: 0, approved: 0, pending: 0, needs_review: 0, rejected: 0,
        tierCounts: { high: 0, medium: 0, low: 0 },
        matchReasons: {}, rejectionReasons: {},
        aliasEnrichCount: 0
    };
    const sample = {
        high: [], medium: [], low: [],
        needs_review: [], existing: [], rejected: []
    };

    try {
        const raw = JSON.parse(fs.readFileSync(paths.rawJson, 'utf8'));
        stats.rawCount = raw.length;
    } catch (_) {}

    for (const cand of normalized) {
        // First check for existing match
        const m = findExistingMatch(cand, idx);
        let status, reason, tier = null, keyword = null;
        let matchedExisting = null, matchedReason = null;
        let distInfo = { km: Infinity, slug: '', nameAr: '' };

        if (m) {
            status = 'existing';
            reason = m.reason;
            matchedExisting = m.match.slug || (m.match && m.match.slug);
            matchedReason = m.reason + (m.distance != null ? (' (d=' + m.distance.toFixed(2) + 'km)') : '');
            stats.matchReasons[m.reason] = (stats.matchReasons[m.reason] || 0) + 1;
            if (m.match && m.match.names) {
                const enrich = aliasEnrichmentFor(m.match, cand);
                if (enrich) {
                    aliasEnrich.push({
                        existingSlug: matchedExisting,
                        candidateSlug: cand.slug,
                        newAliases: enrich
                    });
                }
            }
        } else {
            const blocklist = checkBlocklist(cand, religiousKw, nonPlaceKw);
            distInfo = distanceToNearestCurated(cand, idx.saList);
            const d = decideStatusAndTier(cand, blocklist, distInfo, config);
            status  = d.status;
            reason  = d.reason;
            tier    = d.tier;
            keyword = d.keyword;
            if (status === 'rejected') {
                stats.rejectionReasons[reason] = (stats.rejectionReasons[reason] || 0) + 1;
            }
        }

        stats[status]++;
        if (status === 'pending' && tier) stats.tierCounts[tier]++;

        const entry = {
            geonameid: cand.geonameid,
            slug: cand.slug,
            status,
            tier,
            reason,
            keyword,
            qualityScore: qualityScore(cand),
            distanceToNearestKm: isFinite(distInfo.km) ? +distInfo.km.toFixed(3) : null,
            nearestCuratedSlug: distInfo.slug,
            matchedExisting,
            matchedReason,
            candidate: cand
        };

        // Sample collection — tier-aware
        if (status === 'pending') {
            if (tier === 'high')   sample.high.push(entry);
            else if (tier === 'medium') sample.medium.push(entry);
            else if (tier === 'low')    sample.low.push(entry);
        } else if (sample[status]) {
            sample[status].push(entry);
        }
        out.push(entry);
    }

    // Sort high/medium samples by qScore desc so the report shows best first
    sample.high.sort((a, b) => b.qualityScore - a.qualityScore);
    sample.medium.sort((a, b) => b.qualityScore - a.qualityScore);
    // Keep all of high (small set), truncate medium to 25 in render

    stats.aliasEnrichCount = aliasEnrich.length;

    fs.writeFileSync(paths.candidatesJson, JSON.stringify(out, null, 2) + '\n');
    console.log('[stage3] wrote', paths.candidatesJson);

    const mainReport = renderMainReport(stats, sample, ctx);
    fs.writeFileSync(paths.reportMd, mainReport);
    console.log('[stage3] wrote', paths.reportMd);

    const aliasReport = renderAliasReport(aliasEnrich, ctx);
    fs.writeFileSync(paths.aliasReportMd, aliasReport);
    console.log('[stage3] wrote', paths.aliasReportMd);

    console.log('[stage3] summary:', JSON.stringify({
        existing: stats.existing,
        approved: stats.approved,
        pending: {
            total: stats.pending,
            high: stats.tierCounts.high,
            medium: stats.tierCounts.medium,
            low: stats.tierCounts.low
        },
        needs_review: stats.needs_review,
        rejected: stats.rejected,
        rejectionReasons: stats.rejectionReasons,
        aliasEnrichmentOpps: stats.aliasEnrichCount,
        shortlistSize: stats.tierCounts.high + stats.tierCounts.medium
    }, null, 2));
    console.log('[stage3] DONE for', cc.toUpperCase());
}

main().catch(e => {
    console.error('[stage3] FAILED:', e && e.message);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
});
