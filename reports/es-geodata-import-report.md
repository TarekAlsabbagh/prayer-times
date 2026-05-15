# ES GeoNames Import Report — Europe-1B

**Country**: Spain (إسبانيا)
**Wave**: `CURATED-GEODATA-EUROPE-1B`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T21:20:53.001Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/es-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/es-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/es-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1b-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 29242 |
| existing (matched, no action)     | 11 |
| **pending — high tier**           | **44** |
| pending — medium tier             | 0 |
| pending — low tier                | 592 |
| needs_review                      | 28595 |
| rejected                          | 0 |
| collisions in this wave           | 1514 |
| collisions against existing curated | 32 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 35 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 8 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 1 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 35
**Blocked by ar-gate (high-tier):** 9

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | murcia | مرسية | Murcia | Murcia | es | PPLA | 471982 | مرسية | 37.9870 | -1.1300 | 177.38 | valencia | arabic_only |  | 90 | always_include:PPLA |
| ✅ | valladolid | بلد الوليد | Valladolid | Valladolid | es | PPLA | 300618 | قشتالة وليون | 41.6554 | -4.7235 | 162.12 | madrid | arabic_only |  | 90 | always_include:PPLA |
| ✅ | gijon | خيخون | Gijón | Gijón | es | PPLA3 | 271780 | أستورياس | 43.5357 | -5.6615 | 222.35 | bilbao | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | elche | إلش | Elche | Elche | es | PPLA3 | 234765 | بلنسية | 38.2622 | -0.7011 | 137.20 | valencia | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ciudad-lineal | سويداد لينيال | Ciudad Lineal | Ciudad Lineal | es | PPL | 228171 | مدريد | 40.4451 | -3.6513 | 5.44 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | oviedo | أوفييدو | Oviedo | Oviedo | es | PPLA | 220027 | أستورياس | 43.3603 | -5.8448 | 235.66 | bilbao | arabic_only |  | 90 | always_include:PPLA |
| ✅ | badalona | بادالونا | Badalona | Badalona | es | PPLA3 | 217741 | كاتالونيا | 41.4500 | 2.2474 | 9.50 | barcelona | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cartagena | كارتاخينا | Cartagena | Cartagena | es | PPLA3 | 213943 | مرسية | 37.6020 | -0.9840 | 214.32 | valencia | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | santa-cruz-de-tenerife | سانتا كروث دي تينيريفه | Santa Cruz de Tenerife | Santa Cruz de Tenerife | es | PPLA | 211359 | جزر الكناري | 28.4682 | -16.2546 | 1377.61 | seville | arabic_only |  | 90 | always_include:PPLA |
| ✅ | pamplona | بنبلونة | Pamplona | Pamplona | es | PPLA | 208243 | نافارا | 42.8169 | -1.6432 | 116.11 | bilbao | arabic_only |  | 90 | always_include:PPLA |
| ✅ | mostoles | موستولس | Móstoles | Móstoles | es | PPLA3 | 207095 | مدريد | 40.3223 | -3.8650 | 17.23 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | alcala-de-henares | ألكالا دي إيناريس | Alcalá de Henares | Alcalá de Henares | es | PPLA3 | 193751 | مدريد | 40.4821 | -3.3600 | 29.99 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | fuenlabrada | فوينلابرادا | Fuenlabrada | Fuenlabrada | es | PPLA3 | 190496 | مدريد | 40.2842 | -3.7942 | 16.61 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | leganes | ليجانيس | Leganés | Leganés | es | PPLA3 | 188425 | مدريد | 40.3272 | -3.7635 | 11.18 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | getafe | خيتافي | Getafe | Getafe | es | PPLA3 | 187525 | مدريد | 40.3057 | -3.7330 | 12.60 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | san-sebastian | سان سباستيان | Donostia / San Sebastián | Donostia / San Sebastián | es | PPLA2 | 185357 | إقليم الباسك | 43.3128 | -1.9750 | 77.90 | bilbao | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | burgos | برغش | Burgos | Burgos | es | PPLA2 | 176418 | قشتالة وليون | 42.3411 | -3.7018 | 120.10 | bilbao | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | santander | سانتاندر | Santander | Santander | es | PPLA | 173635 | كانتابريا | 43.4659 | -3.8049 | 73.85 | bilbao | arabic_only |  | 90 | always_include:PPLA |
| ✅ | albacete | آلباسته | Albacete | Albacete | es | PPLA2 | 173050 | قشتالة لا مانتشا | 38.9942 | -1.8564 | 138.02 | valencia | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | alcorcon | ألكوركون | Alcorcón | Alcorcón | es | PPLA3 | 172384 | مدريد | 40.3458 | -3.8249 | 12.94 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | marbella | ماربلا | Marbella | Marbella | es | PPLA3 | 156295 | الأندلس | 36.5154 | -4.8858 | 47.35 | malaga | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | logrono | لوغرونيو | Logroño | Logroño | es | PPLA | 151164 | لا ريوخا | 42.4661 | -2.4512 | 96.98 | bilbao | arabic_only |  | 90 | always_include:PPLA |
| ✅ | badajoz | باداخوز | Badajoz | Badajoz | es | PPLA3 | 150530 | إكستريمادورا | 38.8779 | -6.9706 | 186.66 | seville | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | salamanca | سلمنقة | Salamanca | Salamanca | es | PPLA2 | 144825 | قشتالة وليون | 40.9688 | -5.6639 | 176.28 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | leon | ليون | León | León | es | PPLA2 | 124772 | قشتالة وليون | 42.6000 | -5.5703 | 226.85 | bilbao | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | telde | تيلدي | Telde | Telde | es | PPLA3 | 123265 | جزر الكناري | 27.9924 | -15.4192 | 1366.32 | seville | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | algeciras | الجزيرة الخضراء | Algeciras | Algeciras | es | PPLA3 | 121414 | الأندلس | 36.1333 | -5.4505 | 112.93 | malaga | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cadiz | قادس | Cadiz | Cadiz | es | PPLA2 | 116979 | الأندلس | 36.5267 | -6.2891 | 99.64 | seville | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | alcobendas | ألكوبينداس | Alcobendas | Alcobendas | es | PPLA3 | 116037 | مدريد | 40.5475 | -3.6420 | 15.44 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | parla | بارلا | Parla | Parla | es | PPLA3 | 115611 | مدريد | 40.2360 | -3.7675 | 20.81 | madrid | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | jaen | جيان | Jaén | Jaén | es | PPLA2 | 113457 | الأندلس | 37.7692 | -3.7903 | 67.96 | granada-es | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | orihuela | أوريويلا | Orihuela | Orihuela | es | PPLA3 | 101321 | بلنسية | 38.0848 | -0.9440 | 161.68 | valencia | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | santiago-de-compostela | سانتياجو دى كومبوستيلا | Santiago de Compostela | Santiago de Compostela | es | PPLA | 99536 | غاليسيا | 42.8805 | -8.5457 | 457.64 | bilbao | arabic_only |  | 85 | always_include:PPLA |
| ✅ | melilla | مليلية | Melilla | Melilla | es | PPLA | 85985 | مليلية | 35.2937 | -2.9383 | 207.35 | malaga | arabic_only |  | 85 | always_include:PPLA |
| ✅ | merida | ماردة | Mérida | Mérida | es | PPLA | 59857 | إكستريمادورا | 38.9180 | -6.3429 | 172.87 | seville | arabic_only |  | 85 | always_include:PPLA |
| ⚠️ | alicante | آلیکانته | Alicante | Alicante | es | PPLA2 | 348901 | بلنسية | 38.3452 | -0.4815 | 125.39 | valencia | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | vigo | بیگو | Vigo | Vigo | es | PPLA3 | 293642 | غاليسيا | 42.2328 | -8.7226 | 465.10 | madrid | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | a-coruna | اے کرونا | A Coruña | A Coruña | es | PPLA3 | 250438 | غاليسيا | 43.3713 | -8.3960 | 441.89 | bilbao | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | jerez-de-la-frontera | جیراز دی لا فرونتیرا | Jerez de la Frontera | Jerez de la Frontera | es | PPLA3 | 212879 | الأندلس | 36.6865 | -6.1361 | 79.28 | seville | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | almeria | آلمریا | Almería | Almería | es | PPLA2 | 196851 | الأندلس | 36.8381 | -2.4597 | 107.93 | granada-es | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tarragona | تاراگونا | Tarragona | Tarragona | es | PPLA2 | 141542 | كاتالونيا | 41.1191 | 1.2454 | 83.03 | barcelona | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | chamartin | چامارتین | Chamartín | Chamartín | es | PPL | 140000 | مدريد | 40.4621 | -3.6766 | 5.53 | madrid | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | mataro | ماتارو، برشلونة | Mataró | Mataró | es | PPLA3 | 126988 | كاتالونيا | 41.5421 | 2.4445 | 28.55 | barcelona | mixed_unknown |  | 90 | pop_gte_100000 |
| ⚠️ | toledo | تولدو، اسپانیا | Toledo | Toledo | es | PPLA | 86526 | قشتالة لا مانتشا | 39.8581 | -4.0226 | 67.78 | madrid | mixed_script | wave→toledo-es | 85 | always_include:PPLA |

## Collision-watch list for ES

Cities the user pre-flagged: `granada`, `cordoba`, `valencia`, `cartagena`, `toledo`, `barcelona`, `sevilla`, `seville`, `malaga`, `porto`, `braga`, `coimbra`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| valencia-de-alcantara | pending | low | valencia | 6129 | 250.24 | seville |  |  |
| valencia | existing |  | valencia | 824340 |  |  |  |  |
| toledo | pending | high | toledo | 86526 | 67.78 | madrid | wave | toledo-es |
| sevilla | existing |  | sevilla | 686741 |  |  |  |  |
| malaga | existing |  | malaga | 592346 |  |  |  |  |
| granada | existing |  | granada | 233532 |  |  |  |  |
| cordoba | existing |  | cordoba | 325708 |  |  |  |  |
| cartagena | pending | high | cartagena | 213943 | 214.32 | valencia |  |  |
| valencia | existing |  | valencia | - |  |  |  |  |
| barcelona | existing |  | barcelona | 1686208 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/es-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-es` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/ES.zip
