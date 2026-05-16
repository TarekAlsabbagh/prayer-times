# FI GeoNames Import Report — Europe-2

**Country**: Finland (فنلندا)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:59.108Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/fi-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/fi-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/fi-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 24550 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **17** |
| pending — medium tier             | 0 |
| pending — low tier                | 107 |
| needs_review                      | 24425 |
| rejected                          | 0 |
| collisions in this wave           | 861 |
| collisions against existing curated | 5 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 14 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 3 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 14
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | tampere | تامبيري | Tampere | Tampere | fi | PPLA | 260646 | بيركانماا | 61.4991 | 23.7871 | 160.42 | helsinki | arabic_only |  | 90 | always_include:PPLA |
| ✅ | vantaa | فانتا | Vantaa | Vantaa | fi | PPLA3 | 252724 | أوسيما | 60.2941 | 25.0410 | 14.93 | helsinki | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | oulu | أولو | Oulu | Oulu | fi | PPLA | 216066 | أوستروبوثنيا الشمالية | 65.0124 | 25.4682 | 539.13 | helsinki | arabic_only |  | 90 | always_include:PPLA |
| ✅ | kuopio | كووبيو | Kuopio | Kuopio | fi | PPLA | 125462 | شمال سافو | 62.8924 | 27.6770 | 335.66 | helsinki | arabic_only |  | 90 | always_include:PPLA |
| ✅ | pori | بوري | Pori | Pori | fi | PPLA | 83157 | ساتاكونتا | 61.4807 | 21.7852 | 224.59 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | joensuu | جوئنسو | Joensuu | Joensuu | fi | PPLA | 78398 | شمال كاريليا | 62.6012 | 29.7632 | 372.77 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | kouvola | كوفولا | Kouvola | Kouvola | fi | PPLA | 78094 | كيمي | 60.8667 | 26.7000 | 123.67 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | lappeenranta | لابينرنتا | Lappeenranta | Lappeenranta | fi | PPLA | 72909 | جنوب كاريليا | 61.0587 | 28.1887 | 202.99 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | vaasa | فآسا | Vaasa | Vaasa | fi | PPLA | 69819 | أوستروبوثنيا | 63.0960 | 21.6158 | 369.59 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | haemeenlinna | هامينلينا | Hämeenlinna | Hämeenlinna | fi | PPLA | 68473 | كانتا-هامي | 60.9960 | 24.4643 | 95.43 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | seinaejoki | سينايوكي | Seinäjoki | Seinäjoki | fi | PPLA | 66848 | جنوب أوستروبوثنيا | 62.7945 | 22.8282 | 312.56 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | rovaniemi | روفانييمي | Rovaniemi | Rovaniemi | fi | PPLA | 65670 | لابلاند | 66.4990 | 25.6887 | 704.74 | helsinki | arabic_only |  | 85 | always_include:PPLA |
| ✅ | kokkola | كوكولا | Kokkola | Kokkola | fi | PPLA | 48361 | أوستروبوثنيا الوسطى | 63.8385 | 23.1307 | 418.65 | helsinki | arabic_only |  | 80 | always_include:PPLA |
| ✅ | kajaani | كايآني | Kajaani | Kajaani | fi | PPLA | 36458 | كاينو | 64.2273 | 27.7285 | 473.68 | helsinki | arabic_only |  | 80 | always_include:PPLA |
| ⚠️ | turku | ترکو | Turku | Turku | fi | PPLA | 206655 | فنلندا الجنوبية الغربية | 60.4515 | 22.2687 | 150.32 | helsinki | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | jyvaeskylae | جیواسکیلا | Jyväskylä | Jyväskylä | fi | PPLA | 148744 | فنلندا الوسطى | 62.2415 | 25.7209 | 234.13 | helsinki | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | lahti | لاختی | Lahti | Lahti | fi | PPLA | 121622 | باياتها-هامي | 60.9827 | 25.6615 | 98.63 | helsinki | mixed_script | wave→lahti-fi | 90 | always_include:PPLA |

## Collision-watch list for FI

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| vantaa | pending | high | vantaa | 252724 | 14.93 | helsinki |  |  |
| turku | pending | high | turku | 206655 | 150.32 | helsinki |  |  |
| tampere | pending | high | tampere | 260646 | 160.42 | helsinki |  |  |
| oulu | pending | high | oulu | 216066 | 539.13 | helsinki |  |  |
| helsinki | existing |  | helsinki | 658864 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/fi-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-fi` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/FI.zip
