// scripts/geodata/apply_sa_curated_candidates.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-SA-GEODATA-IMPORT-1 — Stage 4: APPLY
//
// Reads sa-geonames-candidates.json and merges ONLY entries with
// status === 'approved' into db/places/curated-places.json.
//
// Hard safety rules:
//   * Only `approved` entries are merged. Everything else (`pending`,
//     `medium`, `needs_review`, `existing`, `rejected`) is ignored.
//   * Duplicate slug detection: if slug already exists in curated, the
//     candidate is skipped with a warning (defense in depth — Stage 3
//     already deduped, but this catches user-induced slug collisions).
//   * Every merged entry is validated for prayer-times-readiness:
//     slug + countryCode + lat + lng + timezone + names.ar + names.en.
//     Missing any → SKIP with warning, do not merge.
//   * Metadata fields (geonameid, _normalizationFlags, status, tier,
//     reason, qualityScore, distanceToNearestKm, nearestCuratedSlug,
//     matchedExisting, matchedReason, reviewNote, featureCode,
//     population, admin1Code, admin2Code) are STRIPPED before merge.
//     The clean entry carries: slug, type, countryCode, lat, lng,
//     timezone, names, aliases, admin (with regionAr/regionEn),
//     priority, source='curated', sourceId, verified=true.
//   * Idempotent: re-running produces no further changes.
//
// Output:
//   * curated-places.json — grows by N (where N = approved count)
//   * stdout summary: N added, M skipped (duplicate / invalid)
//
// Data attribution:
//   © GeoNames — licensed CC-BY 4.0
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { PATHS, SUPPORTED_LANGS } from './_geonames_common.mjs';

// Inline copy of `_isPrayerTimesReady` from server.js to avoid pulling
// in the entire server module here.
function isPrayerTimesReady(p) {
    if (!p || typeof p !== 'object') return false;
    if (typeof p.slug !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.slug)) return false;
    if (typeof p.countryCode !== 'string' || !/^[a-z]{2}$/.test(p.countryCode)) return false;
    const lat = Number(p.lat), lng = Number(p.lng);
    if (!isFinite(lat) || lat < -90 || lat > 90) return false;
    if (!isFinite(lng) || lng < -180 || lng > 180) return false;
    if (typeof p.timezone !== 'string' || !p.timezone) return false;
    if (!p.names || typeof p.names !== 'object') return false;
    // We additionally require ar + en at minimum (Saudi audience essential)
    if (!p.names.ar || !p.names.en) return false;
    return true;
}

// Convert a candidate (with all the pipeline metadata) into the final
// curated shape. Strips everything we don't want long-term.
function candidateToCuratedEntry(cand) {
    const out = {
        slug:        cand.slug,
        type:        cand.type,
        countryCode: cand.countryCode,
        lat:         Number(cand.lat),
        lng:         Number(cand.lng),
        timezone:    cand.timezone,
        names:       {},
        aliases:     {}
    };
    for (const l of SUPPORTED_LANGS) {
        out.names[l] = cand.names && cand.names[l] ? cand.names[l] : (cand.names && cand.names.en) || '';
    }
    // Carry aliases as-is (already filtered in Stage 2)
    if (cand.aliases && typeof cand.aliases === 'object') {
        for (const k of Object.keys(cand.aliases)) {
            const arr = cand.aliases[k];
            if (Array.isArray(arr) && arr.length > 0) out.aliases[k] = arr;
        }
    }
    out.admin = {
        countryAr: cand.admin && cand.admin.countryAr,
        countryEn: cand.admin && cand.admin.countryEn
    };
    if (cand.admin && cand.admin.regionAr) out.admin.regionAr = cand.admin.regionAr;
    if (cand.admin && cand.admin.regionEn) out.admin.regionEn = cand.admin.regionEn;
    out.priority = cand.priority || 70;
    out.source   = 'curated';
    if (cand.sourceId) out.sourceId = cand.sourceId;
    out.verified = true;
    return out;
}

function main() {
    if (!fs.existsSync(PATHS.candidatesJson)) {
        console.error('[stage4] missing input', PATHS.candidatesJson);
        console.error('         run validate_sa_candidates.mjs first');
        process.exit(1);
    }
    if (!fs.existsSync(PATHS.curatedPath)) {
        console.error('[stage4] missing input', PATHS.curatedPath);
        process.exit(1);
    }

    const candidates = JSON.parse(fs.readFileSync(PATHS.candidatesJson, 'utf8'));
    const curated    = JSON.parse(fs.readFileSync(PATHS.curatedPath, 'utf8'));
    const existingSlugs = new Set(curated.map(x => x.slug));
    const beforeCount = curated.length;
    const beforeSA    = curated.filter(x => x.countryCode === 'sa').length;

    const approved = candidates.filter(c => c.status === 'approved');
    console.log('[stage4] approved candidates:', approved.length);

    let added = 0, skippedDup = 0, skippedInvalid = 0;
    const addedSlugs = [];

    for (const a of approved) {
        const entry = candidateToCuratedEntry(a.candidate);

        if (existingSlugs.has(entry.slug)) {
            console.warn('[stage4] SKIP duplicate slug:', entry.slug,
                         '(already in curated — Stage 3 should have caught this)');
            skippedDup++;
            continue;
        }
        if (!isPrayerTimesReady(entry)) {
            console.warn('[stage4] SKIP invalid entry:', entry.slug,
                         '(failed isPrayerTimesReady)');
            skippedInvalid++;
            continue;
        }

        curated.push(entry);
        existingSlugs.add(entry.slug);
        addedSlugs.push(entry.slug);
        added++;
    }

    if (added === 0 && skippedDup === 0 && skippedInvalid === 0) {
        console.log('[stage4] nothing to do — no approved candidates found');
        console.log('[stage4] (this is normal if you re-run Stage 4 after a successful merge —');
        console.log('         re-run Stage 3 first if you want to add more)');
        return;
    }

    fs.writeFileSync(PATHS.curatedPath, JSON.stringify(curated, null, 2) + '\n');

    const afterSA = curated.filter(x => x.countryCode === 'sa').length;
    console.log('[stage4] ─────────────────────────────────');
    console.log('[stage4] Summary:');
    console.log('[stage4]   added:           ', added);
    console.log('[stage4]   skipped (dup):   ', skippedDup);
    console.log('[stage4]   skipped (invalid):', skippedInvalid);
    console.log('[stage4]   curated total:   ', beforeCount, '→', curated.length);
    console.log('[stage4]   Saudi entries:   ', beforeSA, '→', afterSA);
    console.log('[stage4] ─────────────────────────────────');
    if (addedSlugs.length) {
        console.log('[stage4] Slugs added:');
        for (const s of addedSlugs) console.log('         •', s);
    }
    console.log('[stage4] DONE');
}

main();
