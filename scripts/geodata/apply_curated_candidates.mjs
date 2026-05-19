// scripts/geodata/apply_curated_candidates.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 4: APPLY (country-agnostic)
//
// Usage: node scripts/geodata/apply_curated_candidates.mjs <cc>
//   <cc> = lowercase 2-letter ISO code. Default 'sa'.
//
// Reads <cc>-geonames-candidates.json and merges ONLY entries with
// status === 'approved' into db/places/curated-places.json.
//
// Safety rules (same as SA reference):
//   * Only `approved` entries are merged.
//   * Skip if slug already in curated (defense in depth).
//   * Every merged entry validated by `isPrayerTimesReady` (must have
//     slug + countryCode + lat + lng + timezone + names.ar + names.en).
//   * Pipeline metadata stripped before merge.
//   * Idempotent: re-running produces no further changes.
//
// Data attribution:
//   © GeoNames — licensed CC-BY 4.0
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { pathsFor, SUPPORTED_LANGS } from './_geonames_common.mjs';

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
    // PLACE-NAMES-L10N-PIPELINE-GUARD-1 (extension applied during
    // ASIA-1D-PK Stage 4, 2026-05-19): only carry langs explicitly
    // present in `cand.names` — DO NOT fill Latin placeholders into
    // names.ur/bn/fr/de/tr/id/es/ms. Server's `_pickCuratedName`
    // gracefully falls back to names.en when a per-lang value is
    // missing, so absent langs are safe. The previous behavior
    // (fillchain en-as-fallback for every lang) was the source of
    // 1,755 legacy fillchain rows that PLACE-NAMES-UR-AF-1 + UR-IR-1
    // had to clean up retroactively. Stop creating new fillchain.
    if (cand.names && typeof cand.names === 'object') {
        for (const l of SUPPORTED_LANGS) {
            if (cand.names[l] && typeof cand.names[l] === 'string' && cand.names[l].trim()) {
                out.names[l] = cand.names[l];
            }
        }
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
    const cc = (process.argv[2] || 'sa').toLowerCase();
    const paths = pathsFor(cc);

    if (!fs.existsSync(paths.candidatesJson)) {
        console.error('[stage4] missing input', paths.candidatesJson);
        console.error('         run: node scripts/geodata/validate_candidates.mjs', cc);
        process.exit(1);
    }
    if (!fs.existsSync(paths.curatedPath)) {
        console.error('[stage4] missing input', paths.curatedPath);
        process.exit(1);
    }

    const candidates = JSON.parse(fs.readFileSync(paths.candidatesJson, 'utf8'));
    const curated    = JSON.parse(fs.readFileSync(paths.curatedPath, 'utf8'));
    const existingSlugs = new Set(curated.map(x => x.slug));
    const beforeCount = curated.length;
    const beforeCC    = curated.filter(x => x.countryCode === cc).length;

    const approved = candidates.filter(c => c.status === 'approved');
    console.log('[stage4]', cc.toUpperCase(), '— approved candidates:', approved.length);

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

    fs.writeFileSync(paths.curatedPath, JSON.stringify(curated, null, 2) + '\n');

    const afterCC = curated.filter(x => x.countryCode === cc).length;
    console.log('[stage4] ─────────────────────────────────');
    console.log('[stage4] Summary for', cc.toUpperCase() + ':');
    console.log('[stage4]   added:           ', added);
    console.log('[stage4]   skipped (dup):   ', skippedDup);
    console.log('[stage4]   skipped (invalid):', skippedInvalid);
    console.log('[stage4]   curated total:   ', beforeCount, '→', curated.length);
    console.log('[stage4]   ' + cc + ' entries:     ', beforeCC, '→', afterCC);
    console.log('[stage4] ─────────────────────────────────');
    if (addedSlugs.length) {
        console.log('[stage4] Slugs added:');
        for (const s of addedSlugs) console.log('         •', s);
    }
    console.log('[stage4] DONE for', cc.toUpperCase());
}

main();
