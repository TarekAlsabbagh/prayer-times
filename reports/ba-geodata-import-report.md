# BA GeoNames Import Report — Europe-3

**Country**: Bosnia and Herzegovina (البوسنة والهرسك)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.238Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ba-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ba-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ba-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 21380 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **4** |
| pending — medium tier             | 0 |
| pending — low tier                | 273 |
| needs_review                      | 21101 |
| rejected                          | 0 |
| collisions in this wave           | 9390 |
| collisions against existing curated | 2 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 0 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 4 | ⚠️ manual review (need Arabic) |
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
| ⚠️ | sarajevo | ساراجیوو | Sarajevo | Sarajevo | ba | PPLC | 696731 |  | 43.8486 | 18.3564 |  |  | mixed_script |  | 95 | always_include:PPLC |
| ⚠️ | banja-luka | بانجا لوکا | Banja Luka | Banja Luka | ba | PPLA | 221106 |  | 44.7788 | 17.2063 |  |  | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | zenica | زنیتسا | Zenica | Zenica | ba | PPLA2 | 164423 |  | 44.2017 | 17.9040 |  |  | mixed_script | wave→zenica-ba | 90 | pop_gte_100000 |
| ⚠️ | tuzla | tzlہ | Tuzla | Tuzla | ba | PPLA2 | 142486 |  | 44.5384 | 18.6671 |  |  | mixed_script | wave→tuzla-ba | 90 | pop_gte_100000 |

## Collision-watch list for BA

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sarajevo | pending | high | sarajevo | 696731 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/ba-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ba` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/BA.zip
