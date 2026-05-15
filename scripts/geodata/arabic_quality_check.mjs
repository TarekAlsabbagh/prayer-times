// scripts/geodata/arabic_quality_check.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 3.5: ARABIC-NAME QA GATE + cross-wave collisions
// (Strategy E — Europe-1A specific)
//
// Usage: node scripts/geodata/arabic_quality_check.mjs <cc1> <cc2> ...
//        node scripts/geodata/arabic_quality_check.mjs gb ie fr be nl lu
//
// Inputs (per country):
//   - db/places/candidates/<cc>-geonames-candidates.json
//   - db/places/curated-places.json
//
// Reads Stage 3 output for each cc and produces:
//   - db/places/candidates/europe-1a-arabic-quality.json
//     Per-candidate ar-quality classification + collision flag.
//   - Adds `arQuality` + `collisionInWave` + `pendingAfterArGate` fields
//     to each entry's Stage 3 candidate JSON (in-place rewrite).
//
// Does NOT touch curated_places.json. Does NOT apply anything. Does NOT
// modify Stage 3 logic; only ADDS fields.
//
// Strategy E rules:
//   * ar-quality = 'wikidata'    → entry has Arabic name from `ar:` tag
//                                  (highest confidence — auto-eligible)
//   * ar-quality = 'arabic_only' → entry has pure-Arabic name without
//                                  an explicit `ar:` tag (untagged)
//   * ar-quality = 'mixed_script'→ contains Persian/Urdu/Pashto letters
//                                  (FLAG — user must review)
//   * ar-quality = 'mixed_latin' → contains Latin letters mixed in
//                                  (FLAG — user must review)
//   * ar-quality = 'empty'       → no Arabic name at all
//                                  (FLAG — user must supply manually)
//   * collisionInWave = true     → slug appears in 2+ countries within
//                                  the same wave (need `city-cc` suffix)
//
// pendingAfterArGate is computed for HIGH-tier entries only:
//   * true  → can flow to Stage 4 once approved
//   * false → must go through manual ar-quality fix first
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import {
    pathsFor, loadCountryConfig, parseAlternateNames,
    haversineKm
} from './_geonames_common.mjs';

// ─── Arabic-script character classes ───
//
// Letters that BELONG to Arabic (the strict set we accept as "clean").
// Range 0621-064A covers all 28 base letters + alef/hamza variants.
// Range 0670-0673 covers some legitimate Arabic ligatures.
const PURE_ARABIC_LETTER = /^[ء-يٰ-ٳـ]+$/;

// Letters that signal NON-Arabic contamination (Persian/Urdu/Pashto/Kurdish):
//   پ چ ژ گ ٹ ڈ ڑ ښ ګ ڵ ݫ ݬ ی ک ہ ے ۀ ڤ ڥ ڨ
const PERSIAN_URDU_LETTERS = /[پچژگٹڈڑښګڵݫݬیکہےۀڤڥڨ]/;

// Latin chars mixed in (any A-Z appearance is suspicious in an Arabic name)
const LATIN_IN_ARABIC = /[A-Za-z]/;

// Strip Arabic diacritics + tatweel for letter-class testing
function stripDiacritics(s) {
    return String(s || '').replace(/[ً-ٰٟۖ-ۭـ]/g, '');
}

// Pure Arabic letters only (after stripping spaces/punctuation/digits)
function isPureArabic(name) {
    if (!name) return false;
    const stripped = stripDiacritics(name)
        .replace(/[\s.,()'\-/؛؟]/g, '')   // punctuation incl. Arabic , ?
        .replace(/[0-9٠-٩]/g, '');         // digits
    if (!stripped) return false;
    return PURE_ARABIC_LETTER.test(stripped);
}

function hasMixedScript(name) {
    if (!name) return false;
    return PERSIAN_URDU_LETTERS.test(stripDiacritics(name));
}

function hasLatinMix(name) {
    if (!name) return false;
    return LATIN_IN_ARABIC.test(name);
}

// Classify an Arabic-name field.
// `cand` is the Stage 2 normalized candidate (includes _normalizationFlags
// and the original alternatenames source via parseAlternateNames re-run).
function classifyArQuality(cand, rawAlternatenamesParsed) {
    const ar = (cand.names && cand.names.ar) || '';
    if (!ar) return { quality: 'empty', detail: 'no Arabic name at all' };

    // Came from `ar:` tag in GeoNames alternatenames?
    const arTagged = (rawAlternatenamesParsed.tagged && rawAlternatenamesParsed.tagged.ar) || [];
    const fromArTag = arTagged.some(v => v === ar);

    if (hasMixedScript(ar)) {
        return { quality: 'mixed_script', detail: 'contains Persian/Urdu letters', fromArTag };
    }
    if (hasLatinMix(ar)) {
        return { quality: 'mixed_latin', detail: 'contains Latin letters', fromArTag };
    }
    if (isPureArabic(ar)) {
        return { quality: fromArTag ? 'wikidata' : 'arabic_only',
                 detail: fromArTag ? 'from ar: tag' : 'untagged Arabic-script altname',
                 fromArTag };
    }
    // Has Arabic but mixed with something else we didn't catch
    return { quality: 'mixed_unknown', detail: 'Arabic + unknown non-Arabic chars', fromArTag };
}

// Determine if an entry can pass through to Stage 4 eligibility after the QA gate.
// Strategy E rule: pending+approved entries must have:
//   * ar-quality in {'wikidata', 'arabic_only'} (no mixing)
//   * collisionInWave === false (or has slug rename)
function passesArGate(quality, collisionInWave) {
    if (quality !== 'wikidata' && quality !== 'arabic_only') return false;
    if (collisionInWave) return false;
    return true;
}

// ─── Main ───
async function main() {
    const ccs = (process.argv.slice(2).length ? process.argv.slice(2) : ['gb','ie','fr','be','nl','lu'])
        .map(c => c.toLowerCase());
    console.log('[stage3.5] running ar-quality check for', ccs.join(', '));

    // 1. Load all candidate files + curated
    const basePaths = pathsFor('gb');  // any cc, we just need projectRoot/curatedPath
    const curated = JSON.parse(fs.readFileSync(basePaths.curatedPath, 'utf8'));
    const curatedSlugs = new Set(curated.map(x => x.slug));

    const allCandidatesByCc = {};   // { cc: [entries] }
    const allConfigsByCc    = {};
    const rawByCc           = {};
    for (const cc of ccs) {
        const p = pathsFor(cc);
        allCandidatesByCc[cc] = JSON.parse(fs.readFileSync(p.candidatesJson, 'utf8'));
        allConfigsByCc[cc]    = await loadCountryConfig(cc);
        // Load raw to recover alternatenames (so we can detect `ar:` tag)
        try {
            const raw = JSON.parse(fs.readFileSync(p.rawJson, 'utf8'));
            const byId = new Map();
            for (const r of raw) byId.set(r.geonameid, r);
            rawByCc[cc] = byId;
        } catch (_) { rawByCc[cc] = new Map(); }
    }

    // 2. Build intra-wave slug index — which slugs appear in MULTIPLE countries
    //    within this wave (and at any tier, including 'low' which user may
    //    promote later)
    const slugCountInWave = new Map();   // slug → Set of cc
    for (const cc of ccs) {
        for (const e of allCandidatesByCc[cc]) {
            if (e.status === 'pending' || e.status === 'needs_review') {
                if (!slugCountInWave.has(e.slug)) slugCountInWave.set(e.slug, new Set());
                slugCountInWave.get(e.slug).add(cc);
            }
        }
    }
    const collisionSlugs = new Set();
    for (const [slug, ccSet] of slugCountInWave) {
        if (ccSet.size >= 2) collisionSlugs.add(slug);
    }
    // Also flag candidates whose slug is already in curated under a DIFFERENT cc
    // (those would conflict at Stage 4 even though Stage 3 didn't see it as a
    // same-country match)
    const curatedSlugByCc = new Map();   // slug → cc
    for (const c of curated) curatedSlugByCc.set(c.slug, c.countryCode);

    // 3. Classify each candidate's Arabic name + collision status
    const arQualityReport = {
        generatedAt: new Date().toISOString(),
        wave: 'CURATED-GEODATA-EUROPE-1A',
        strategy: 'E (popMin + alwaysInclude + ar-quality gate)',
        countries: ccs,
        summary: {
            totalCandidates: 0,
            highTierCount: 0,
            byArQuality: { wikidata: 0, arabic_only: 0, mixed_script: 0, mixed_latin: 0, mixed_unknown: 0, empty: 0 },
            highTierByArQuality: { wikidata: 0, arabic_only: 0, mixed_script: 0, mixed_latin: 0, mixed_unknown: 0, empty: 0 },
            collisionsInWave: 0,
            collisionsAgainstCurated: 0,
            passesArGateInHigh: 0,
            blockedByArGateInHigh: 0
        },
        perCountry: {},
        highTierEntries: []
    };

    for (const cc of ccs) {
        const entries = allCandidatesByCc[cc];
        const perC = {
            normalizedTotal: entries.length,
            statusBreakdown: { existing: 0, pending: 0, needs_review: 0, rejected: 0 },
            tierBreakdown:   { high: 0, medium: 0, low: 0 },
            arQualityBreakdown: { wikidata: 0, arabic_only: 0, mixed_script: 0, mixed_latin: 0, mixed_unknown: 0, empty: 0 },
            highTierArQuality:  { wikidata: 0, arabic_only: 0, mixed_script: 0, mixed_latin: 0, mixed_unknown: 0, empty: 0 },
            collisionsInWave: 0,
            collisionsAgainstCurated: 0,
            highPassingGate: 0,
            highBlockedByGate: 0
        };

        const rawById = rawByCc[cc];

        for (const e of entries) {
            arQualityReport.summary.totalCandidates++;
            perC.statusBreakdown[e.status] = (perC.statusBreakdown[e.status] || 0) + 1;
            if (e.status === 'pending' && e.tier) {
                perC.tierBreakdown[e.tier]++;
            }

            // Recover original alternatenames for `ar:` tag detection
            const rawRow = rawById.get(e.candidate.geonameid);
            const parsed = rawRow ? parseAlternateNames(rawRow.alternatenames) : { tagged: {}, untagged: [] };

            const arQ = classifyArQuality(e.candidate, parsed);
            perC.arQualityBreakdown[arQ.quality] = (perC.arQualityBreakdown[arQ.quality] || 0) + 1;
            arQualityReport.summary.byArQuality[arQ.quality] =
                (arQualityReport.summary.byArQuality[arQ.quality] || 0) + 1;

            const colInWave  = collisionSlugs.has(e.slug);
            const colAgainstCurated = curatedSlugByCc.has(e.slug) && curatedSlugByCc.get(e.slug) !== cc;
            if (colInWave) {
                perC.collisionsInWave++;
                arQualityReport.summary.collisionsInWave++;
            }
            if (colAgainstCurated) {
                perC.collisionsAgainstCurated++;
                arQualityReport.summary.collisionsAgainstCurated++;
            }

            // Annotate the entry IN-PLACE (Stage 3 candidate JSON gets enriched)
            e.arQuality = arQ;
            e.collisionInWave = colInWave;
            e.collisionAgainstCurated = colAgainstCurated ? { existingSlug: e.slug, existingCc: curatedSlugByCc.get(e.slug) } : null;
            e.suggestedSlugIfCollision = (colInWave || colAgainstCurated)
                ? (e.slug + '-' + cc)
                : null;
            // The gate decision — only matters for high-tier (Wave 1A focus)
            if (e.status === 'pending' && e.tier === 'high') {
                arQualityReport.summary.highTierCount++;
                perC.highTierArQuality[arQ.quality]++;
                arQualityReport.summary.highTierByArQuality[arQ.quality]++;
                const passes = passesArGate(arQ.quality, colInWave || colAgainstCurated);
                e.pendingAfterArGate = passes;
                if (passes) {
                    perC.highPassingGate++;
                    arQualityReport.summary.passesArGateInHigh++;
                } else {
                    perC.highBlockedByGate++;
                    arQualityReport.summary.blockedByArGateInHigh++;
                }
                // Collect high-tier entries for the report
                arQualityReport.highTierEntries.push({
                    cc,
                    slug: e.slug,
                    suggestedSlugIfCollision: e.suggestedSlugIfCollision,
                    nameAr: e.candidate.names.ar || '',
                    nameEn: e.candidate.names.en || '',
                    originalName: e.candidate.names.en && (rawRow ? rawRow.name : '') || '',
                    countryCode: e.candidate.countryCode,
                    featureCode: e.candidate.featureCode,
                    population: e.candidate.population || 0,
                    region: e.candidate.admin && (e.candidate.admin.regionAr || e.candidate.admin.regionEn) || '',
                    lat: e.candidate.lat,
                    lng: e.candidate.lng,
                    distanceToNearestKm: e.distanceToNearestKm,
                    nearestCuratedSlug: e.nearestCuratedSlug,
                    arQuality: arQ.quality,
                    arQualityDetail: arQ.detail,
                    collisionInWave: colInWave,
                    collisionAgainstCurated: e.collisionAgainstCurated,
                    suggestedPriority: e.candidate.priority,
                    reasonIncluded: e.reason,
                    pendingAfterArGate: passes
                });
            }
        }
        arQualityReport.perCountry[cc] = perC;

        // Rewrite the Stage 3 candidates JSON in place with the new fields
        const p = pathsFor(cc);
        fs.writeFileSync(p.candidatesJson, JSON.stringify(entries, null, 2) + '\n');
        console.log('[stage3.5]', cc.toUpperCase(),
            '— total', entries.length,
            '— high', perC.tierBreakdown.high,
            '— passing-gate', perC.highPassingGate,
            '— blocked', perC.highBlockedByGate);
    }

    // 4. Write the consolidated ar-quality assessment JSON
    const outJson = path.join(pathsFor('gb').candidateDir, 'europe-1a-arabic-quality.json');
    fs.writeFileSync(outJson, JSON.stringify(arQualityReport, null, 2) + '\n');
    console.log('[stage3.5] wrote', outJson);

    console.log('[stage3.5] summary:', JSON.stringify(arQualityReport.summary, null, 2));
    console.log('[stage3.5] DONE');
}

main().catch(e => {
    console.error('[stage3.5] FAILED:', e && e.message);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
});
