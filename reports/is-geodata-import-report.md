# IS GeoNames Import Report — Europe-2

**Country**: Iceland (آيسلندا)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:59.127Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/is-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/is-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/is-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 115 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **4** |
| pending — medium tier             | 0 |
| pending — low tier                | 12 |
| needs_review                      | 98 |
| rejected                          | 0 |
| collisions in this wave           | 4 |
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

**Passes ar-gate (high-tier):** 3
**Blocked by ar-gate (high-tier):** 1

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | akureyri | أكوريري | Akureyri | Akureyri | is | PPLA | 19219 | الشمال الشرقي | 65.6835 | -18.0878 | 249.38 | reykjavik | arabic_only |  | 80 | always_include:PPLA |
| ✅ | keflavik | كيفلافيك | Keflavík | Keflavík | is | PPLA | 15930 | سودرنيس | 64.0049 | -22.5624 | 34.00 | reykjavik | arabic_only |  | 80 | always_include:PPLA |
| ✅ | selfoss | سلفوس | Selfoss | Selfoss | is | PPLA | 9000 | الجنوب | 63.9331 | -20.9971 | 51.78 | reykjavik | arabic_only |  | 75 | always_include:PPLA |
| ⚠️ | isafjoerdur | ایسافجرویر | Ísafjörður | Ísafjörður | is | PPLA | 2736 | فيستفيوردير | 66.0747 | -23.1350 | 221.53 | reykjavik | mixed_script |  | 70 | always_include:PPLA |

## Collision-watch list for IS

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reykjavik | existing |  | reykjavik | 118918 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/is-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-is` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/IS.zip
