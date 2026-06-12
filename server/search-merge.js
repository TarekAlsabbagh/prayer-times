'use strict';
/* =============================================================================
 * server/search-merge.js
 * DISCOVERED-CITY-SEARCH-HOMONYM-MERGE-FIX-1
 *
 * Pure, testable helpers for /api/search-place. The endpoint used to be a strict
 * waterfall (curated → discovered ONLY when curated === 0 → external), which hid a
 * discovered city whenever ANY curated result shared its name — even a homonym in a
 * DIFFERENT country (kenitra/MA hid al-quneitra/SY for "القنيطرة"). These helpers let
 * the endpoint MERGE curated + discovered while de-duplicating real same-place overlaps.
 *
 * Dedup rule (drop the discovered result) — ALL keyed on SAME country:
 *   1. its clean slug ("{base}-{cc}" → "{base}") is already a curated slug in that country
 *      (→ chefchaouen-ma dropped when chefchaouen is curated; uray-irah dropped post-promotion);
 *   2. it matches a curated RESULT in the same country by slug / shared name / geo (<0.15°).
 * A same-name result in a DIFFERENT country is NOT a duplicate → kept (the homonym fix).
 *
 * NO data mutation, NO network — these are synchronous array helpers only.
 * ============================================================================= */

const _SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

// Strip a trailing "-{cc}" suffix that the discovery pipeline appends to a slug.
function cleanDiscoveredSlug(slug, cc) {
    if (typeof slug !== 'string') return '';
    const c = String(cc || '').toLowerCase();
    const suffix = '-' + c;
    if (c && slug.endsWith(suffix) && slug.length > suffix.length) {
        const base = slug.slice(0, -suffix.length);
        if (_SLUG_RE.test(base)) return base;
    }
    return slug;
}

// Lowercased set of every name string carried on a result (curated OR discovered).
function nameSet(r) {
    const out = new Set();
    if (!r || typeof r !== 'object') return out;
    if (r.names && typeof r.names === 'object') {
        for (const v of Object.values(r.names)) if (typeof v === 'string' && v.trim()) out.add(v.trim().toLowerCase());
    }
    if (typeof r.displayName === 'string' && r.displayName.trim()) out.add(r.displayName.trim().toLowerCase());
    if (typeof r.secondaryName === 'string' && r.secondaryName.trim()) out.add(r.secondaryName.trim().toLowerCase());
    return out;
}

function namesOverlap(a, b) {
    const sa = nameSet(a), sb = nameSet(b);
    for (const n of sa) if (sb.has(n)) return true;
    return false;
}

function geoNear(a, b, deg) {
    const al = Number(a.lat), an = Number(a.lng), bl = Number(b.lat), bn = Number(b.lng);
    if (!isFinite(al) || !isFinite(an) || !isFinite(bl) || !isFinite(bn)) return false;
    return Math.abs(al - bl) < deg && Math.abs(an - bn) < deg;
}

// Merge discovered results into curated results (curated kept first, in order), dropping any
// discovered result that is the SAME place as a curated one. opts.findCuratedBySlug(slug) →
// curated entry|null (the global slug index). cap = max total results.
function mergeCuratedDiscovered(curated, discovered, opts) {
    opts = opts || {};
    const cap = opts.cap || 10;
    const nearDeg = (opts.nearDeg != null) ? opts.nearDeg : 0.15;
    const findBySlug = (typeof opts.findCuratedBySlug === 'function') ? opts.findCuratedBySlug : function () { return null; };
    const out = Array.isArray(curated) ? curated.slice() : [];
    const seen = new Set(out.map(r => String(r.countryCode || '').toLowerCase() + '|' + (r.slug || '')));
    for (const d of (Array.isArray(discovered) ? discovered : [])) {
        if (out.length >= cap) break;
        if (!d || typeof d !== 'object') continue;
        const dcc = String(d.countryCode || '').toLowerCase();
        const dslug = d.slug || '';
        const key = dcc + '|' + dslug;
        if (seen.has(key)) continue;                                   // literal (cc,slug) already present
        // (1) already curated globally under clean/raw slug in the SAME country → drop
        const clean = cleanDiscoveredSlug(dslug, dcc);
        const self = findBySlug(clean) || findBySlug(dslug);
        if (self && String(self.countryCode || '').toLowerCase() === dcc) continue;
        // (2) same place as a curated RESULT in the SAME country (slug / name / geo) → drop
        const dup = out.some(c => {
            if (String(c.countryCode || '').toLowerCase() !== dcc) return false;   // different country = homonym → keep
            if (c.slug === clean || c.slug === dslug) return true;
            if (namesOverlap(c, d)) return true;
            if (geoNear(c, d, nearDeg)) return true;
            return false;
        });
        if (dup) continue;
        seen.add(key);
        out.push(d);
    }
    return out.slice(0, cap);
}

module.exports = { cleanDiscoveredSlug, nameSet, namesOverlap, geoNear, mergeCuratedDiscovered };
