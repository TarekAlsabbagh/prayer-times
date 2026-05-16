# DK GeoNames Import Report — Europe-2

**Country**: Denmark (الدنمارك)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.763Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/dk-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/dk-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/dk-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 7107 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **6** |
| pending — medium tier             | 0 |
| pending — low tier                | 22 |
| needs_review                      | 7078 |
| rejected                          | 0 |
| collisions in this wave           | 803 |
| collisions against existing curated | 2 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 2 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 3 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 2
**Blocked by ar-gate (high-tier):** 4

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | odense | أودنسه | Odense | Odense | dk | PPLA2 | 180863 | جنوب الدنمارك | 55.3959 | 10.3883 | 140.66 | copenhagen | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | soro | سورو | Sorø | Sorø | dk | PPLA | 7999 | زيلاند | 55.4318 | 11.5555 | 69.25 | copenhagen | arabic_only |  | 75 | always_include:PPLA |
| ⚠️ | aalborg | albwrګ | Aalborg | Aalborg | dk | PPLA | 142937 | جوتلاند الشمالية | 57.0480 | 9.9187 | 223.37 | copenhagen | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | vejle | wyjlے | Vejle | Vejle | dk | PPLA | 60231 | جنوب الدنمارك | 55.7093 | 9.5357 | 190.08 | copenhagen | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | viborg | wybwrګ | Viborg | Viborg | dk | PPLA | 41239 | جوتلاند الوسطى | 56.4532 | 9.4020 | 214.68 | copenhagen | mixed_script | wave→viborg-dk | 80 | always_include:PPLA |
| ⚠️ | hillerod | hylrwډ | Hillerød | Hillerød | dk | PPLA | 35357 | منطقة العاصمة | 55.9279 | 12.3008 | 32.61 | copenhagen | mixed_latin |  | 80 | always_include:PPLA |

## Collision-watch list for DK

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| odense | pending | high | odense | 180863 | 140.66 | copenhagen |  |  |
| copenhagen | existing |  | copenhagen | 1153615 |  |  |  |  |
| aalborg | pending | high | aalborg | 142937 | 223.37 | copenhagen |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/dk-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-dk` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/DK.zip
