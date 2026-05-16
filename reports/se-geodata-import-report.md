# SE GeoNames Import Report — Europe-2

**Country**: Sweden (السويد)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.901Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/se-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/se-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/se-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 27961 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **21** |
| pending — medium tier             | 0 |
| pending — low tier                | 415 |
| needs_review                      | 27524 |
| rejected                          | 0 |
| collisions in this wave           | 3611 |
| collisions against existing curated | 8 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 11 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 6 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 4 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 10
**Blocked by ar-gate (high-tier):** 11

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | malmoe | مالمو | Malmö | Malmö | se | PPLA | 362133 | سكونه | 55.6059 | 13.0007 | 512.78 | stockholm | arabic_only |  | 90 | always_include:PPLA |
| ✅ | uppsala | أوبسالا | Uppsala | Uppsala | se | PPLA | 177074 | أوبسالا | 59.8588 | 17.6389 | 63.65 | stockholm | arabic_only |  | 90 | always_include:PPLA |
| ✅ | oerebro | أوربرو | Örebro | Örebro | se | PPLA | 155989 | أوريبرو | 59.2741 | 15.2066 | 162.57 | stockholm | arabic_only |  | 90 | always_include:PPLA |
| ✅ | umea | أوميو | Umeå | Umeå | se | PPLA | 130224 | فاسربوتن | 63.8284 | 20.2597 | 513.47 | stockholm | arabic_only |  | 90 | always_include:PPLA |
| ✅ | helsingborg | هلسينغبورغ | Helsingborg | Helsingborg | se | PPLA2 | 104250 | سكونه | 56.0467 | 12.6944 | 484.74 | stockholm | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | vaexjoe | فاكسيو | Växjö | Växjö | se | PPLA | 71282 | كرونوبيرغ | 56.8777 | 14.8091 | 333.07 | stockholm | arabic_only |  | 85 | always_include:PPLA |
| ✅ | karlskrona | كارلسكرونا | Karlskrona | Karlskrona | se | PPLA | 66675 | بليكينغه | 56.1616 | 15.5866 | 381.73 | stockholm | arabic_only |  | 85 | always_include:PPLA |
| ✅ | nykoeping | نيكوبينج | Nyköping | Nyköping | se | PPLA | 38780 | سودرمانلاند | 58.7530 | 17.0079 | 88.25 | stockholm | arabic_only |  | 80 | always_include:PPLA |
| ✅ | kalmar | كالمار | Kalmar | Kalmar | se | PPLA | 38408 | كالمار | 56.6616 | 16.3616 | 313.20 | stockholm | arabic_only |  | 80 | always_include:PPLA |
| ✅ | falun | فالن | Falun | Falun | se | PPLA | 37291 | دالارنا | 60.6036 | 15.6260 | 196.33 | stockholm | arabic_only |  | 80 | always_include:PPLA |
| ⚠️ | gothenburg | gwtھn brg | Gothenburg | Gothenburg | se | PPLA | 608462 | فاسترا غوتالاند | 57.7072 | 11.9668 | 397.39 | stockholm | mixed_latin |  | 95 | always_include:PPLA |
| ⚠️ | linkoeping | لنشوپنگ | Linköping | Linköping | se | PPLA | 166673 | أوسترغوتلاند | 58.4109 | 15.6216 | 173.81 | stockholm | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | vaesteras | wysٹras | Västerås | Västerås | se | PPLA | 127799 | فاسترمانلاند | 59.6162 | 16.5528 | 91.36 | stockholm | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | joenkoeping | جنکوپنگ | Jönköping | Jönköping | se | PPLA | 112766 | يونشوبينغ | 57.7814 | 14.1562 | 284.76 | stockholm | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | lulea | للیہ | Luleå | Luleå | se | PPLA | 77832 | نوربوتن | 65.5841 | 22.1547 | 726.17 | stockholm | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | gaevle | gawlے | Gävle | Gävle | se | PPLA | 74884 | غافلبرغ | 60.6745 | 17.1417 | 158.20 | stockholm | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | halmstad | halm sټad | Halmstad | Halmstad | se | PPLA | 70480 | هالاند | 56.6745 | 12.8568 | 425.74 | stockholm | mixed_latin |  | 85 | always_include:PPLA |
| ⚠️ | karlstad | karl sټad | Karlstad | Karlstad | se | PPLA | 61492 | فارملاند | 59.3793 | 13.5036 | 258.75 | stockholm | mixed_latin | wave→karlstad-se | 85 | always_include:PPLA |
| ⚠️ | oestersund | asٹrsnډ | Östersund | Östersund | se | PPLA | 49806 | جامتلاند | 63.1792 | 14.6357 | 465.63 | stockholm | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | haernoesand | harnwsnډ | Härnösand | Härnösand | se | PPLA | 25012 | فاسترنورلاند | 62.6323 | 17.9379 | 367.34 | stockholm | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | visby | فيسبي | Visby | Visby | se | PPLA | 23402 | غوتلاند | 57.6409 | 18.2960 | 188.21 | stockholm | arabic_only | wave→visby-se | 80 | always_include:PPLA |

## Collision-watch list for SE

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| uppsala | pending | high | uppsala | 177074 | 63.65 | stockholm |  |  |
| stockholm | existing |  | stockholm | 1515017 |  |  |  |  |
| gothenburg | pending | high | gothenburg | 608462 | 397.39 | stockholm |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/se-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-se` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/SE.zip
