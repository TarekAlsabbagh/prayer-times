# CZ GeoNames Import Report — Europe-3

**Country**: Czech Republic (التشيك)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:12.710Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/cz-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/cz-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/cz-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 16420 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **5** |
| pending — medium tier             | 0 |
| pending — low tier                | 69 |
| needs_review                      | 16338 |
| rejected                          | 0 |
| collisions in this wave           | 2220 |
| collisions against existing curated | 6 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 0 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 5 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 5

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | ostrava | asٹrawa | Ostrava | Ostrava | cz | PPLA | 279791 |  | 49.8347 | 18.2820 | 276.29 | prague | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | liberec | لبریک | Liberec | Liberec | cz | PPLA | 102951 |  | 50.7671 | 15.0562 | 88.51 | prague | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | ceske-budejovice | syskے bwdyjwwys | České Budějovice | České Budějovice | cz | PPLA | 93426 | أولومونتس | 48.9745 | 14.4743 | 122.46 | prague | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | usti-nad-labem | asٹy naڈ labym | Ústí nad Labem | Ústí nad Labem | cz | PPLA | 90378 |  | 50.6607 | 14.0323 | 71.14 | prague | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | jihlava | jہlawa | Jihlava | Jihlava | cz | PPLA | 50108 | زلين | 49.3961 | 15.5912 | 112.15 | prague | mixed_script |  | 85 | always_include:PPLA |

## Collision-watch list for CZ

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| prague | existing |  | prague | 1165581 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/cz-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-cz` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/CZ.zip
