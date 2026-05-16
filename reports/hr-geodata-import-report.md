# HR GeoNames Import Report — Europe-3

**Country**: Croatia (كرواتيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.046Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/hr-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/hr-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/hr-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 11361 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **8** |
| pending — medium tier             | 0 |
| pending — low tier                | 79 |
| needs_review                      | 11267 |
| rejected                          | 0 |
| collisions in this wave           | 3451 |
| collisions against existing curated | 3 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 5 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 3 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 1
**Blocked by ar-gate (high-tier):** 7

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | pazin | بازين | Pazin | Pazin | hr | PPLA | 3981 |  | 45.2392 | 13.9395 | 171.50 | zagreb | arabic_only |  | 70 | always_include:PPLA |
| ⚠️ | split | اسپلیت | Split | Split | hr | PPLA | 149830 |  | 43.5089 | 16.4392 | 258.96 | zagreb | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | slavonski-brod | اسلاونسکی برد | Slavonski Brod | Slavonski Brod | hr | PPLA | 45005 |  | 45.1616 | 18.0163 | 174.43 | zagreb | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | karlovac | كارلوفاتش | Karlovac | Karlovac | hr | PPLA | 41869 |  | 45.4917 | 15.5500 | 49.19 | zagreb | arabic_only | wave→karlovac-hr | 80 | always_include:PPLA |
| ⚠️ | sibenik | سیبنیک | Šibenik | Šibenik | hr | PPLA | 31115 |  | 43.7343 | 15.8942 | 231.47 | zagreb | mixed_script | wave→sibenik-hr | 80 | always_include:PPLA |
| ⚠️ | koprivnica | كوبريفنيتسا | Koprivnica | Koprivnica | hr | PPLA | 22262 |  | 46.1636 | 16.8297 | 76.11 | zagreb | arabic_only | wave→koprivnica-hr | 80 | always_include:PPLA |
| ⚠️ | pozega | بوزيغا | Požega | Požega | hr | PPLA | 16867 |  | 45.3403 | 17.6853 | 142.69 | zagreb | arabic_only | wave→pozega-hr | 80 | always_include:PPLA |
| ⚠️ | cakovec | تشاكوفيتش | Čakovec | Čakovec | hr | PPLA | 15078 |  | 46.3844 | 16.4339 | 72.28 | zagreb | arabic_only | wave→cakovec-hr | 80 | always_include:PPLA |

## Collision-watch list for HR

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| zagreb | existing |  | zagreb | 663592 |  |  |  |  |
| split | pending | high | split | 149830 | 258.96 | zagreb |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/hr-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-hr` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/HR.zip
