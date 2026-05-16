# AT GeoNames Import Report — Europe-2

**Country**: Austria (النمسا)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.318Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/at-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/at-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/at-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 20030 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **8** |
| pending — medium tier             | 0 |
| pending — low tier                | 145 |
| needs_review                      | 19876 |
| rejected                          | 0 |
| collisions in this wave           | 5920 |
| collisions against existing curated | 1 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 5 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 3 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 4
**Blocked by ar-gate (high-tier):** 4

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | graz | غراتس | Graz | Graz | at | PPLA | 303270 | ستيريا | 47.0673 | 15.4420 | 144.80 | vienna | arabic_only |  | 90 | always_include:PPLA |
| ✅ | innsbruck | إنسبروك | Innsbruck | Innsbruck | at | PPLA | 132493 | تيرول | 47.2627 | 11.3945 | 386.85 | vienna | arabic_only |  | 90 | always_include:PPLA |
| ✅ | bregenz | بريغنتس | Bregenz | Bregenz | at | PPLA | 29806 | فورارلبرغ | 47.5031 | 9.7471 | 500.44 | vienna | arabic_only |  | 80 | always_include:PPLA |
| ✅ | eisenstadt | آئزن شتات | Eisenstadt | Eisenstadt | at | PPLA | 9217 | بورغنلاند | 47.8456 | 16.5233 | 41.82 | vienna | arabic_only |  | 75 | always_include:PPLA |
| ⚠️ | linz | لنز | Linz | Linz | at | PPLA | 204846 | النمسا العليا | 48.3064 | 14.2861 | 154.94 | vienna | arabic_only | wave→linz-at | 90 | always_include:PPLA |
| ⚠️ | salzburg | salzbwrګ | Salzburg | Salzburg | at | PPLA | 157245 | سالزبورغ | 47.7994 | 13.0440 | 251.85 | vienna | mixed_script | wave→salzburg-at | 90 | always_include:PPLA |
| ⚠️ | klagenfurt-am-woerthersee | klagnfrٹ am wrtھrsy | Klagenfurt am Wörthersee | Klagenfurt am Wörthersee | at | PPLA | 100316 | كارينثيا | 46.6247 | 14.3053 | 234.98 | vienna | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | sankt-poelten | synkٹ pwlٹn | Sankt Pölten | Sankt Pölten | at | PPLA | 21911 | النمسا السفلى | 48.2076 | 15.6372 | 54.58 | vienna | mixed_script |  | 80 | always_include:PPLA |

## Collision-watch list for AT

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| salzburg | pending | high | salzburg | 157245 | 251.85 | vienna | wave | salzburg-at |
| linz | pending | high | linz | 204846 | 154.94 | vienna | wave | linz-at |
| innsbruck | pending | high | innsbruck | 132493 | 386.85 | vienna |  |  |
| graz | pending | high | graz | 303270 | 144.80 | vienna |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/at-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-at` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/AT.zip
