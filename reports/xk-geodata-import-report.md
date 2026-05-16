# XK GeoNames Import Report — Europe-3

**Country**: Kosovo (كوسوفو)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.329Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/xk-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/xk-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/xk-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 2563 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **5** |
| pending — medium tier             | 0 |
| pending — low tier                | 1 |
| needs_review                      | 2555 |
| rejected                          | 0 |
| collisions in this wave           | 639 |
| collisions against existing curated | 1 |

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
| ⚠️ | pristina | prysٹyna | Pristina | Pristina | xk | PPLC | 550000 |  | 42.6727 | 21.1669 |  |  | mixed_script |  | 95 | always_include:PPLC |
| ⚠️ | mitrovice | mytrwwychے | Mitrovicë | Mitrovicë | xk | PPLA | 107045 |  | 42.8833 | 20.8667 |  |  | mixed_script | wave→mitrovice-xk | 90 | always_include:PPLA |
| ⚠️ | gjakove | gjakwwے | Gjakovë | Gjakovë | xk | PPLA | 94158 |  | 42.3803 | 20.4308 |  |  | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | ferizaj | فریزاج | Ferizaj | Ferizaj | xk | PPLA | 59504 |  | 42.3706 | 21.1553 |  |  | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | peje | pyjے | Pejë | Pejë | xk | PPLA | 48962 |  | 42.6591 | 20.2883 |  |  | mixed_script |  | 80 | always_include:PPLA |

## Collision-watch list for XK

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pristina | pending | high | pristina | 550000 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/xk-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-xk` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/XK.zip
