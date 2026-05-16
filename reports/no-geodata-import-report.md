# NO GeoNames Import Report — Europe-2

**Country**: Norway (النرويج)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.976Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/no-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/no-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/no-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 13187 |
| existing (matched, no action)     | 4 |
| **pending — high tier**           | **17** |
| pending — medium tier             | 0 |
| pending — low tier                | 94 |
| needs_review                      | 13072 |
| rejected                          | 0 |
| collisions in this wave           | 1874 |
| collisions against existing curated | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 8 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 6
**Blocked by ar-gate (high-tier):** 11

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | trondheim | تروندهايم | Trondheim | Trondheim | no | PPL | 216518 | تروندلاغ | 63.4305 | 10.3951 | 391.48 | oslo | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | drammen | درامن | Drammen | Drammen | no | PPLA | 105042 | بوسكرود | 59.7439 | 10.2045 | 35.98 | oslo | arabic_only |  | 90 | always_include:PPLA |
| ✅ | tromso | ترومسا | Tromsø | Tromsø | no | PPLA | 41915 | ترومس | 69.6489 | 18.9551 | 1147.74 | oslo | arabic_only |  | 80 | always_include:PPLA |
| ✅ | bodo | بودو | Bodø | Bodø | no | PPLA | 34073 | نوردلاند | 67.2827 | 14.3751 | 838.37 | oslo | arabic_only |  | 80 | always_include:PPLA |
| ✅ | hamar | هامار | Hamar | Hamar | no | PPLA | 29479 | إنلاندت | 60.7945 | 11.0680 | 99.45 | oslo | arabic_only |  | 80 | always_include:PPLA |
| ✅ | vadso | فادسو | Vadsø | Vadsø | no | PPLA | 4654 | فينمارك | 70.0735 | 29.7494 | 1427.16 | oslo | arabic_only |  | 70 | always_include:PPLA |
| ⚠️ | bergen | برغن | Bergen | Bergen | no | PPLA | 294029 | فيستلاند | 60.3930 | 5.3242 | 304.98 | oslo | arabic_only | wave→bergen-no | 90 | always_include:PPLA |
| ⚠️ | stavanger | sٹawnjr | Stavanger | Stavanger | no | PPLA | 148682 | روغالاند | 58.9701 | 5.7333 | 302.43 | oslo | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | kristiansand | krystyansynڈ | Kristiansand | Kristiansand | no | PPLA | 117237 | أغدر | 58.1467 | 7.9956 | 251.93 | oslo | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | sarpsborg | سارپس برگ | Sarpsborg | Sarpsborg | no | PPLA | 59038 | أوستفولد | 59.2839 | 11.1096 | 72.88 | oslo | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | tonsberg | تونسبرگ | Tønsberg | Tønsberg | no | PPLA | 55387 | فيستفولد | 59.2675 | 10.4076 | 74.44 | oslo | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | skien | اسکین | Skien | Skien | no | PPLA | 50595 | تيليمارك | 59.2096 | 9.6090 | 101.39 | oslo | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | arendal | أرندال | Arendal | Arendal | no | PPLA | 30916 | أغدر | 58.4615 | 8.7725 | 196.95 | oslo | arabic_only | wave→arendal-no | 80 | always_include:PPLA |
| ⚠️ | lillehammer | lylے ہymr | Lillehammer | Lillehammer | no | PPLA | 29011 | إنلاندت | 61.1151 | 10.4663 | 134.49 | oslo | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | molde | mwlڈے | Molde | Molde | no | PPLA | 22410 | مور أوغ رومسدال | 62.7375 | 7.1591 | 367.75 | oslo | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | steinkjer | sٹyn kjr | Steinkjer | Steinkjer | no | PPLA | 13060 | تروندلاغ | 64.0149 | 11.4954 | 457.65 | oslo | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | hermansverk | هرمانسورک | Hermansverk | Hermansverk | no | PPLA | 2144 | فيستلاند | 61.1846 | 6.8502 | 255.82 | oslo | mixed_script |  | 70 | always_include:PPLA |

## Collision-watch list for NO

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| trondheim | pending | high | trondheim | 216518 | 391.48 | oslo |  |  |
| stavanger | pending | high | stavanger | 148682 | 302.43 | oslo |  |  |
| oslo | existing |  | oslo | 1082575 |  |  |  |  |
| bergen | pending | high | bergen | 294029 | 304.98 | oslo | wave | bergen-no |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/no-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-no` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/NO.zip
