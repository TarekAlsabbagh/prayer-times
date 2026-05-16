# AL GeoNames Import Report — Europe-3

**Country**: Albania (ألبانيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.315Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/al-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/al-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/al-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 4153 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **3** |
| pending — medium tier             | 0 |
| pending — low tier                | 40 |
| needs_review                      | 4101 |
| rejected                          | 0 |
| collisions in this wave           | 334 |
| collisions against existing curated | 3 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 0 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | vlore | wlwrې | Vlorë | Vlorë | al | PPLA | 115261 |  | 40.4696 | 19.4838 |  |  | mixed_latin |  | 90 | always_include:PPLA |
| ⚠️ | korce | kwrchې | Korçë | Korçë | al | PPLA | 58259 |  | 40.6186 | 20.7808 |  |  | mixed_latin | wave→korce-al | 85 | always_include:PPLA |
| ⚠️ | gjirokaster | ارجیر | Gjirokastër | Gjirokastër | al | PPLA | 23437 |  | 40.0758 | 20.1389 |  |  | mixed_script |  | 80 | always_include:PPLA |

## Collision-watch list for AL

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

_(no watch-list cities appear in AL candidates)_

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/al-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-al` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/AL.zip
