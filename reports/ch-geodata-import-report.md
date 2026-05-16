# CH GeoNames Import Report — Europe-2

**Country**: Switzerland (سويسرا)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.386Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ch-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ch-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ch-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 11423 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **26** |
| pending — medium tier             | 0 |
| pending — low tier                | 225 |
| needs_review                      | 11171 |
| rejected                          | 0 |
| collisions in this wave           | 2054 |
| collisions against existing curated | 6 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 18 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 6 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 13
**Blocked by ar-gate (high-tier):** 13

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | geneve | جنيف | Genève | Genève | ch | PPLA | 201741 | جنيف | 46.2022 | 6.1457 | 224.34 | zurich | arabic_only |  | 90 | always_include:PPLA |
| ✅ | lausanne | لوزان | Lausanne | Lausanne | ch | PPLA | 139111 | فو | 46.5160 | 6.6328 | 173.66 | zurich | arabic_only |  | 90 | always_include:PPLA |
| ✅ | bern | برن | Bern | Bern | ch | PPLC | 121631 | برن | 46.9481 | 7.4474 | 95.49 | zurich | arabic_only |  | 90 | always_include:PPLC |
| ✅ | winterthur | فينترتور | Winterthur | Winterthur | ch | PPLA2 | 111840 | زيورخ | 47.5056 | 8.7241 | 19.83 | zurich | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | luzern | لوسرن | Luzern | Luzern | ch | PPLA | 81691 | لوتسرن | 47.0505 | 8.3064 | 40.41 | zurich | arabic_only |  | 85 | always_include:PPLA |
| ✅ | fribourg | فريبور | Fribourg | Fribourg | ch | PPLA | 38365 | فريبورغ | 46.8024 | 7.1513 | 123.13 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | neuchatel | نوشاتل | Neuchâtel | Neuchâtel | ch | PPLA | 33475 | نوشاتيل | 46.9918 | 6.9310 | 129.03 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | aarau | آراؤ | Aarau | Aarau | ch | PPLA | 21503 | أرغاو | 47.3925 | 8.0442 | 37.49 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | schwyz | اشووتس | Schwyz | Schwyz | ch | PPLA | 15181 | شفيتس | 47.0208 | 8.6541 | 40.50 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | delemont | دلمون | Delémont | Delémont | ch | PPLA | 12682 | جورا | 47.3649 | 7.3445 | 90.16 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | glarus | غلروس | Glarus | Glarus | ch | PPLA | 12425 | غلاروس | 47.0406 | 9.0680 | 54.58 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | sarnen | زارنن | Sarnen | Sarnen | ch | PPLA | 10368 | أوبفالدن | 46.8961 | 8.2453 | 57.97 | zurich | arabic_only |  | 80 | always_include:PPLA |
| ✅ | appenzell | أبنتسل | Appenzell | Appenzell | ch | PPLA | 5649 | أبنزل إنرهودن | 47.3310 | 9.4100 | 65.61 | zurich | arabic_only |  | 75 | always_include:PPLA |
| ⚠️ | basel | بازل | Basel | Basel | ch | PPLA | 177595 | بازل-شتات | 47.5584 | 7.5733 | 75.54 | zurich | arabic_only | wave→basel-ch | 90 | always_include:PPLA |
| ⚠️ | sankt-gallen | synٹ gyln | Sankt Gallen | Sankt Gallen | ch | PPLA | 75833 | سانت غالن | 47.4239 | 9.3748 | 62.92 | zurich | mixed_script | wave→sankt-gallen-ch | 85 | always_include:PPLA |
| ⚠️ | bellinzona | بلینتسونا | Bellinzona | Bellinzona | ch | PPLA | 43220 | تيتشينو | 46.1928 | 9.0170 | 136.55 | zurich | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | schaffhausen | شافهاوزن | Schaffhausen | Schaffhausen | ch | PPLA | 36587 | شافهاوزن | 47.6973 | 8.6349 | 36.31 | zurich | arabic_only | wave→schaffhausen-ch | 80 | always_include:PPLA |
| ⚠️ | chur | خور | Chur | Chur | ch | PPLA | 35373 | غراوبوندن | 46.8499 | 9.5329 | 95.18 | zurich | arabic_only | wave→chur-ch | 80 | always_include:PPLA |
| ⚠️ | sitten | سيون | Sitten | Sitten | ch | PPLA | 34708 | فاليه | 46.2274 | 7.3556 | 156.48 | zurich | arabic_only | wave→sitten-ch | 80 | always_include:PPLA |
| ⚠️ | zug | zګ | Zug | Zug | ch | PPLA | 30542 | تسوغ | 47.1724 | 8.5175 | 22.81 | zurich | mixed_script | wave→zug-ch | 80 | always_include:PPLA |
| ⚠️ | frauenfeld | frawnfylڈ | Frauenfeld | Frauenfeld | ch | PPLA | 25607 | تورغاو | 47.5578 | 8.8989 | 33.55 | zurich | mixed_script | wave→frauenfeld-ch | 80 | always_include:PPLA |
| ⚠️ | solothurn | swlwtھrn | Solothurn | Solothurn | ch | PPLA | 16777 | زولوتورن | 47.2079 | 7.5371 | 78.06 | zurich | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | herisau | اریزو | Herisau | Herisau | ch | PPLA | 15744 | أبنزل أوسرهودن | 47.3862 | 9.2792 | 55.53 | zurich | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | liestal | lysٹl | Liestal | Liestal | ch | PPLA | 12832 | بازل-لاندشافت | 47.4845 | 7.7345 | 61.89 | zurich | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | altdorf | آلتدورف | Altdorf | Altdorf | ch | PPLA | 9401 | أوري | 46.8804 | 8.6444 | 55.75 | zurich | arabic_only | wave→altdorf-ch | 75 | always_include:PPLA |
| ⚠️ | stans | sټans | Stans | Stans | ch | PPLA | 8393 | نيدفالدن | 46.9581 | 8.3661 | 48.43 | zurich | mixed_latin | wave→stans-ch | 75 | always_include:PPLA |

## Collision-watch list for CH

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lausanne | pending | high | lausanne | 139111 | 173.66 | zurich |  |  |
| bern | pending | high | bern | 121631 | 95.49 | zurich |  |  |
| basel | pending | high | basel | 177595 | 75.54 | zurich | wave | basel-ch |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/ch-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ch` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/CH.zip
