# EE GeoNames Import Report — Europe-3

**Country**: Estonia (إستونيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.363Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ee-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ee-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ee-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 6919 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **9** |
| pending — medium tier             | 0 |
| pending — low tier                | 52 |
| needs_review                      | 6854 |
| rejected                          | 0 |
| collisions in this wave           | 209 |
| collisions against existing curated | 4 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 0 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 9

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | rakvere | راکوره | Rakvere | Rakvere | ee | PPLA | 14984 |  | 59.3481 | 26.3578 | 91.36 | tallinn | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | kuressaare | کورساره | Kuressaare | Kuressaare | ee | PPLA | 12698 |  | 58.2538 | 22.4922 | 185.00 | tallinn | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | haapsalu | هاپسالو | Haapsalu | Haapsalu | ee | PPLA | 11805 |  | 58.9394 | 23.5413 | 88.48 | tallinn | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | valga | والگا، استونی | Valga | Valga | ee | PPLA | 11792 |  | 57.7778 | 26.0473 | 199.12 | tallinn | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | johvi | یووی | Jõhvi | Jõhvi | ee | PPLA | 10130 |  | 59.3592 | 27.4211 | 151.24 | tallinn | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | jogeva | یوگاوا | Jõgeva | Jõgeva | ee | PPLA | 6396 |  | 58.7467 | 26.3939 | 121.11 | tallinn | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | rapla | رپلا | Rapla | Rapla | ee | PPLA | 5132 |  | 59.0076 | 24.7939 | 47.80 | tallinn | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | polva | پولوا | Põlva | Põlva | ee | PPLA | 5115 |  | 58.0603 | 27.0694 | 203.16 | tallinn | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | kaerdla | کاردلا | Kärdla | Kärdla | ee | PPLA | 3160 |  | 58.9978 | 22.7492 | 124.08 | tallinn | mixed_script |  | 70 | always_include:PPLA |

## Collision-watch list for EE

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tallinn | existing |  | tallinn | 394024 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/ee-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ee` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/EE.zip
