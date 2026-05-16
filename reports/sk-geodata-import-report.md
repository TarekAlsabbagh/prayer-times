# SK GeoNames Import Report — Europe-3

**Country**: Slovakia (سلوفاكيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:12.742Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/sk-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/sk-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/sk-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 4975 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **4** |
| pending — medium tier             | 0 |
| pending — low tier                | 92 |
| needs_review                      | 4875 |
| rejected                          | 0 |
| collisions in this wave           | 782 |
| collisions against existing curated | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 3 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 4

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | kosice | كوشيتسه | Košice | Košice | sk | PPLA | 225044 | كوشيتسه | 48.7144 | 21.2580 | 312.56 | bratislava | arabic_only | wave→kosice-sk | 90 | always_include:PPLA |
| ⚠️ | zilina | جيلينا | Žilina | Žilina | sk | PPLA | 81219 | جيلينا | 49.2231 | 18.7394 | 169.18 | bratislava | arabic_only | wave→zilina-sk | 85 | always_include:PPLA |
| ⚠️ | trnava | ترنافا | Trnava | Trnava | sk | PPLA | 62806 | ترنافا | 48.3777 | 17.5860 | 43.62 | bratislava | arabic_only | wave→trnava-sk | 85 | always_include:PPLA |
| ⚠️ | trencin | ترنچین | Trenčín | Trenčín | sk | PPLA | 58278 | ترنتشين | 48.8945 | 18.0444 | 107.88 | bratislava | mixed_script | wave→trencin-sk | 85 | always_include:PPLA |

## Collision-watch list for SK

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

_(no watch-list cities appear in SK candidates)_

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/sk-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-sk` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/SK.zip
