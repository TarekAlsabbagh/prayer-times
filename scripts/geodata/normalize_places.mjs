// scripts/geodata/normalize_places.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-GEODATA — Stage 2: NORMALIZE (country-agnostic)
//
// Usage: node scripts/geodata/normalize_places.mjs <cc>
//   <cc> = lowercase 2-letter ISO code. Default 'sa'.
//
// Reads <cc>-geonames-raw.json, filters + transforms each row into our
// candidate schema, writes <cc>-geonames-normalized.json.
//
// Filters applied here:
//   1. feature_code is in ACCEPTED_FEATURE_CODES
//   2. coordinates are inside country bounding box
//   3. lat/lng are finite numbers
//   4. has at least an ASCII name (for slug)
//
// What this stage does NOT do:
//   - dedupe vs existing curated entries (that's Stage 3)
//   - assign final status (approved/pending/...) — also Stage 3
//
// Data attribution:
//   © GeoNames — licensed CC-BY 4.0
// ─────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import {
    pathsFor, loadCountryConfig,
    ACCEPTED_FEATURE_CODES, REJECTED_FEATURE_CODES,
    isInBox, makeSlug,
    parseAlternateNames, isArabicScript, isMostlyLatin,
    priorityForPopulation, typeForFeatureCode,
    fillLangMap
} from './_geonames_common.mjs';

async function main() {
    const cc = (process.argv[2] || 'sa').toLowerCase();
    const config = await loadCountryConfig(cc);
    const paths  = pathsFor(cc);

    if (!fs.existsSync(paths.rawJson)) {
        console.error('[stage2] missing input', paths.rawJson);
        console.error('         run: node scripts/geodata/import_geonames.mjs ' + cc);
        process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(paths.rawJson, 'utf8'));
    console.log('[stage2]', cc.toUpperCase(), '— raw rows:', raw.length);

    const stats = {
        rejected_feature_code: 0,
        rejected_coords: 0,
        rejected_no_ascii: 0,
        normalized: 0,
        flag_missing_ar: 0,
        flag_missing_population: 0,
        flag_unknown_region: 0
    };

    const out = [];

    for (const r of raw) {
        // Filter 1: accepted feature code
        if (!ACCEPTED_FEATURE_CODES.has(r.feature_code)) {
            if (REJECTED_FEATURE_CODES.has(r.feature_code)) stats.rejected_feature_code++;
            else stats.rejected_feature_code++;
            continue;
        }
        // Filter 2: coordinates
        if (!isInBox(r.latitude, r.longitude, config.bbox)) {
            stats.rejected_coords++;
            continue;
        }
        // Filter 3: must have an asciiname for slug
        if (!r.asciiname || !r.asciiname.trim()) {
            stats.rejected_no_ascii++;
            continue;
        }

        // Slug
        let slug = makeSlug(r.asciiname);
        if (!slug) slug = cc + '-geonameid-' + r.geonameid;

        // Names — extract from alternatenames + name field
        const parsed = parseAlternateNames(r.alternatenames);
        const arFromTag = (parsed.tagged.ar || []).find(s => isArabicScript(s));
        const arFromUntagged = (parsed.untagged || []).find(isArabicScript);
        const arName = arFromTag || arFromUntagged || (isArabicScript(r.name) ? r.name : '');

        // English name: prefer 'en' tag, then untagged Latin, then the
        // main `name` field if Latin, else asciiname.
        const enFromTag = (parsed.tagged.en || []).find(s => isMostlyLatin(s));
        const enFromUntagged = (parsed.untagged || []).find(isMostlyLatin);
        const enName = enFromTag || (isMostlyLatin(r.name) ? r.name : '') ||
                       enFromUntagged || r.asciiname;

        const namesPartial = { ar: arName, en: enName };
        const names = fillLangMap(namesPartial, enName);  // others fall back to en

        // Aliases — all distinct Arabic-script values for ar, all distinct
        // Latin-script values for en (excluding the canonical name).
        const arAliasSet = new Set();
        const enAliasSet = new Set();
        const addAr = (s) => { if (s && isArabicScript(s) && s !== arName) arAliasSet.add(s); };
        const addEn = (s) => { if (s && isMostlyLatin(s) && s.toLowerCase() !== (enName||'').toLowerCase()) enAliasSet.add(s); };
        for (const t of (parsed.tagged.ar || [])) addAr(t);
        for (const t of parsed.untagged) {
            if (isArabicScript(t)) addAr(t); else if (isMostlyLatin(t)) addEn(t);
        }
        for (const t of (parsed.tagged.en || [])) addEn(t);
        if (isArabicScript(r.name) && r.name !== arName) arAliasSet.add(r.name);
        if (isMostlyLatin(r.name) && r.name.toLowerCase() !== (enName||'').toLowerCase()) enAliasSet.add(r.name);
        // asciiname is usually English; include as alias if not == enName
        if (r.asciiname && r.asciiname.toLowerCase() !== (enName||'').toLowerCase()) enAliasSet.add(r.asciiname);
        const aliases = {};
        if (arAliasSet.size) aliases.ar = [...arAliasSet];
        if (enAliasSet.size) aliases.en = [...enAliasSet];

        // Population + priority + type
        const pop = Number(r.population) || 0;
        const priority = priorityForPopulation(pop);
        const type = typeForFeatureCode(r.feature_code, pop);

        // Region
        const region = (config.admin1ToRegion && config.admin1ToRegion[r.admin1_code]) || null;

        // Flags
        const flags = [];
        if (!arName) { flags.push('missing_ar_name'); stats.flag_missing_ar++; }
        if (pop <= 0) { flags.push('missing_population'); stats.flag_missing_population++; }
        if (!region) { flags.push('unknown_region:' + r.admin1_code); stats.flag_unknown_region++; }

        out.push({
            geonameid:    r.geonameid,
            slug,
            type,
            countryCode:  cc,
            lat:          Number(r.latitude),
            lng:          Number(r.longitude),
            timezone:     r.timezone || config.defaultTimezone,
            names,
            aliases,
            admin: {
                countryAr: config.countryAr,
                countryEn: config.countryEn,
                regionAr:  region ? region.ar : '',
                regionEn:  region ? region.en : '',
                admin1Code: r.admin1_code,
                admin2Code: r.admin2_code || ''
            },
            featureCode:  r.feature_code,
            population:   pop,
            priority,
            source:       'geonames',
            sourceId:     'geonames:' + r.geonameid,
            verified:     false,
            _normalizationFlags: flags
        });
        stats.normalized++;
    }

    fs.writeFileSync(paths.normalizedJson, JSON.stringify(out, null, 2) + '\n');
    console.log('[stage2] wrote', paths.normalizedJson, '(' + out.length + ' candidates)');
    console.log('[stage2] stats:', JSON.stringify(stats, null, 2));
    console.log('[stage2] DONE for', cc.toUpperCase());
}

main().catch(e => {
    console.error('[stage2] FAILED:', e && e.message);
    if (e && e.stack) console.error(e.stack);
    process.exit(1);
});
