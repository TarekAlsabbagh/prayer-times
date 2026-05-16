# RO GeoNames Import Report — Europe-3

**Country**: Romania (رومانيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:12.877Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ro-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ro-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ro-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 15425 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **13** |
| pending — medium tier             | 0 |
| pending — low tier                | 85 |
| needs_review                      | 15304 |
| rejected                          | 0 |
| collisions in this wave           | 604 |
| collisions against existing curated | 6 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 2 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 10 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 0
**Blocked by ar-gate (high-tier):** 13

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ⚠️ | iasi | ایاشی | Iaşi | Iaşi | ro | PPLA | 378954 |  | 47.1667 | 27.6000 | 326.01 | bucharest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | constanta | qstntynہ | Constanţa | Constanţa | ro | PPLA | 317832 |  | 44.1807 | 28.6343 | 203.31 | bucharest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | galati | غالاتس | Galaţi | Galaţi | ro | PPLA | 217851 |  | 45.4369 | 28.0503 | 190.06 | bucharest | arabic_only | wave→galati-ro | 90 | always_include:PPLA |
| ⚠️ | targu-mures | tarګw mwrys | Târgu Mureş | Târgu Mureş | ro | PPLA | 212752 |  | 46.5425 | 24.5575 | 264.28 | bucharest | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | braila | براIلا | Brăila | Brăila | ro | PPLA | 154686 |  | 45.2715 | 27.9743 | 174.91 | bucharest | mixed_latin |  | 90 | always_include:PPLA |
| ⚠️ | ramnicu-valcea | رامنيكو فالچيا | Râmnicu Vâlcea | Râmnicu Vâlcea | ro | PPLA | 93151 |  | 45.1000 | 24.3667 | 156.15 | bucharest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | drobeta-turnu-severin | اتلا دروبیتا ترنو | Drobeta-Turnu Severin | Drobeta-Turnu Severin | ro | PPLA | 79865 |  | 44.6269 | 22.6529 | 274.35 | bucharest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | targu-jiu | tarګw jyw | Târgu Jiu | Târgu Jiu | ro | PPLA | 73545 |  | 45.0500 | 23.2833 | 233.19 | bucharest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | targoviste | targwwyshtے | Târgovişte | Târgovişte | ro | PPLA | 66965 |  | 44.9254 | 25.4567 | 75.38 | bucharest | mixed_script | wave→targoviste-ro | 85 | always_include:PPLA |
| ⚠️ | alba-iulia | آلبا ایولیا | Alba Iulia | Alba Iulia | ro | PPLA | 64227 |  | 46.0667 | 23.5833 | 268.57 | bucharest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | slatina | ستیئا | Slatina | Slatina | ro | PPLA | 63487 |  | 44.4333 | 24.3667 | 137.83 | bucharest | mixed_script | wave→slatina-ro | 85 | always_include:PPLA |
| ⚠️ | sfantu-gheorghe | sfantw gywrjے | Sfântu Gheorghe | Sfântu Gheorghe | ro | PPLA | 50080 |  | 45.8667 | 25.7833 | 162.05 | bucharest | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | alexandria | أليكساندريا | Alexandria | Alexandria | ro | PPLA | 40390 |  | 43.9833 | 25.3333 | 78.68 | bucharest | arabic_only | curated:eg | 80 | always_include:PPLA |

## Collision-watch list for RO

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bucharest | existing |  | bucharest | 1877155 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/ro-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ro` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/RO.zip
