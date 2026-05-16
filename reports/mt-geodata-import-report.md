# MT GeoNames Import Report — Europe-3

**Country**: Malta (مالطا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.511Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/mt-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/mt-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/mt-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 191 |
| existing (matched, no action)     | 3 |
| **pending — high tier**           | **35** |
| pending — medium tier             | 0 |
| pending — low tier                | 12 |
| needs_review                      | 125 |
| rejected                          | 0 |
| collisions in this wave           | 4 |
| collisions against existing curated | 3 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 21 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 14 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 20
**Blocked by ar-gate (high-tier):** 15

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ghaxaq | غاكساق | Għaxaq | Għaxaq | mt | PPLA | 4860 |  | 35.8493 | 14.5169 | 5.52 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | balzan | بالزان | Balzan | Balzan | mt | PPLA | 4689 |  | 35.9021 | 14.4521 | 5.64 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | nadur | نادور | Nadur | Nadur | mt | PPLA | 3933 |  | 36.0379 | 14.2938 | 25.17 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | pembroke | بيمبروك | Pembroke | Pembroke | mt | PPLA | 3842 |  | 35.9302 | 14.4779 | 4.80 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | imgarr | إمغار | Imġarr | Imġarr | mt | PPLA | 3802 |  | 35.9215 | 14.3650 | 13.71 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | dingli | دينجلي | Dingli | Dingli | mt | PPLA | 3711 |  | 35.8615 | 14.3821 | 12.64 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | xaghra | خاغرا | Xagħra | Xagħra | mt | PPLA | 3680 |  | 36.0500 | 14.2642 | 28.11 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | l-iklin | إل إكلين | L-Iklin | L-Iklin | mt | PPLA | 3422 |  | 35.9041 | 14.4542 | 5.48 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | lija | ليجا | Lija | Lija | mt | PPLA | 3202 |  | 35.9005 | 14.4463 | 6.16 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | gudja | غودجة | Gudja | Gudja | mt | PPLA | 3184 |  | 35.8505 | 14.5059 | 5.43 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ghajnsielem | غاجنسيليم | Għajnsielem | Għajnsielem | mt | PPLA | 2931 |  | 36.0257 | 14.2864 | 24.91 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | hal-gharghur | حال غرغور | Hal Gharghur | Hal Gharghur | mt | PPLA | 2857 |  | 35.9241 | 14.4512 | 6.36 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | kirkop | كيركوب | Kirkop | Kirkop | mt | PPLA | 2397 |  | 35.8423 | 14.4856 | 6.81 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | xghajra | خحايرا | Xgħajra | Xgħajra | mt | PPLA | 1830 |  | 35.8856 | 14.5475 | 3.31 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | zebbug | زبّوج | Żebbuġ | Żebbuġ | mt | PPLA | 1770 |  | 36.0719 | 14.2370 | 31.52 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | sannat | ساننات | Sannat | Sannat | mt | PPLA | 1681 |  | 36.0245 | 14.2428 | 28.17 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | kercem | كركيم | Kerċem | Kerċem | mt | PPLA | 1627 |  | 36.0416 | 14.2269 | 30.36 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | gharb | غارب | Għarb | Għarb | mt | PPLA | 1298 |  | 36.0597 | 14.2092 | 32.78 | valletta | arabic_only |  | 70 | always_include:PPLA |
| ✅ | munxar | منكسار | Munxar | Munxar | mt | PPLA | 840 |  | 36.0305 | 14.2347 | 29.13 | valletta | arabic_only |  | 65 | always_include:PPLA |
| ✅ | san-lawrenz | سان لورنز | San Lawrenz | San Lawrenz | mt | PPLA | 530 |  | 36.0554 | 14.2039 | 32.93 | valletta | arabic_only |  | 65 | always_include:PPLA |
| ⚠️ | mosta | mwsٹa | Mosta | Mosta | mt | PPLA | 23482 |  | 35.9094 | 14.4257 | 8.10 | valletta | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | qormi | آورمی | Qormi | Qormi | mt | PPLA | 16801 |  | 35.8760 | 14.4720 | 4.61 | valletta | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | mellieha | mlyہa | Mellieħa | Mellieħa | mt | PPLA | 11389 |  | 35.9566 | 14.3626 | 15.12 | valletta | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | zurrieq | زریق | Żurrieq | Żurrieq | mt | PPLA | 10962 |  | 35.8296 | 14.4759 | 8.46 | valletta | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | marsaskala | مارسا سکالا | Marsaskala | Marsaskala | mt | PPLA | 10024 |  | 35.8622 | 14.5670 | 6.24 | valletta | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | tarxien | تارشیئن | Tarxien | Tarxien | mt | PPLA | 8627 |  | 35.8656 | 14.5151 | 3.70 | valletta | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | victoria | wykٹwrya | Victoria | Victoria | mt | PPLA | 6596 |  | 36.0447 | 14.2412 | 29.47 | valletta | mixed_script | wave→victoria-mt | 75 | always_include:PPLA |
| ⚠️ | marsaxlokk | مارسکسلوک | Marsaxlokk | Marsaxlokk | mt | PPLA | 3660 |  | 35.8421 | 14.5430 | 6.81 | valletta | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | mqabba | mqabہ | Mqabba | Mqabba | mt | PPLA | 3339 |  | 35.8476 | 14.4682 | 7.07 | valletta | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | xewkija | خیوکیجا | Xewkija | Xewkija | mt | PPLA | 3303 |  | 36.0341 | 14.2559 | 27.71 | valletta | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | qrendi | آریندی | Qrendi | Qrendi | mt | PPLA | 3148 |  | 35.8345 | 14.4578 | 8.80 | valletta | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | imtarfa | amtrfہ | Imtarfa | Imtarfa | mt | PPLA | 2615 |  | 35.8924 | 14.3982 | 10.51 | valletta | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | safi | صافي | Safi | Safi | mt | PPLA | 2280 |  | 35.8331 | 14.4849 | 7.80 | valletta | arabic_only | curated:ma | 70 | always_include:PPLA |
| ⚠️ | fontana | fwnٹana | Fontana | Fontana | mt | PPLA | 922 |  | 36.0380 | 14.2360 | 29.47 | valletta | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | imdina | amdynہ | Imdina | Imdina | mt | PPLA | 193 |  | 35.8864 | 14.4031 | 10.14 | valletta | mixed_script |  | 65 | always_include:PPLA |

## Collision-watch list for MT

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| valletta | existing |  | valletta | 6794 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/mt-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-mt` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/MT.zip
