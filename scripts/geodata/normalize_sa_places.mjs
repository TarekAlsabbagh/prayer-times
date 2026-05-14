// scripts/geodata/normalize_sa_places.mjs
// ─────────────────────────────────────────────────────────────────────────
// CURATED-SA-GEODATA-IMPORT-1 — Stage 2: NORMALIZE
//
// Reads sa-geonames-raw.json, filters + transforms each row into our
// candidate schema, writes sa-geonames-normalized.json.
//
// Filters applied here:
//   1. feature_code is in ACCEPTED_FEATURE_CODES
//   2. coordinates are inside Saudi bounding box
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
    PATHS,
    ACCEPTED_FEATURE_CODES, REJECTED_FEATURE_CODES,
    SA_ADMIN1_TO_REGION, SA_COUNTRY,
    isInSaudiBox, makeSlug,
    parseAlternateNames, isArabicScript, isMostlyLatin,
    priorityForPopulation, typeForFeatureCode,
    fillLangMap, SUPPORTED_LANGS
} from './_geonames_common.mjs';

function main() {
    if (!fs.existsSync(PATHS.rawJson)) {
        console.error('[stage2] missing input', PATHS.rawJson);
        console.error('         run import_sa_geonames.mjs first');
        process.exit(1);
    }
    const raw = JSON.parse(fs.readFileSync(PATHS.rawJson, 'utf8'));
    console.log('[stage2] raw rows:', raw.length);

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
        if (!isInSaudiBox(r.latitude, r.longitude)) {
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
        if (!slug) slug = 'sa-geonameid-' + r.geonameid;

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
        const region = SA_ADMIN1_TO_REGION[r.admin1_code] || null;

        // Flags
        const flags = [];
        if (!arName) { flags.push('missing_ar_name'); stats.flag_missing_ar++; }
        if (pop <= 0) { flags.push('missing_population'); stats.flag_missing_population++; }
        if (!region) { flags.push('unknown_region:' + r.admin1_code); stats.flag_unknown_region++; }

        out.push({
            geonameid:    r.geonameid,
            slug,
            type,
            countryCode:  SA_COUNTRY.countryCode,
            lat:          Number(r.latitude),
            lng:          Number(r.longitude),
            timezone:     r.timezone || SA_COUNTRY.timezone,
            names,
            aliases,
            admin: {
                countryAr: SA_COUNTRY.countryAr,
                countryEn: SA_COUNTRY.countryEn,
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

    fs.writeFileSync(PATHS.normalizedJson, JSON.stringify(out, null, 2) + '\n');
    console.log('[stage2] wrote', PATHS.normalizedJson, '(' + out.length + ' candidates)');
    console.log('[stage2] stats:', JSON.stringify(stats, null, 2));
    console.log('[stage2] DONE');
}

main();
