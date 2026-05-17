# TL GeoNames Import Report — Asia-1E

**Country**: Timor-Leste (تيمور الشرقية)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 20000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:54.264Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/tl-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/tl-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/tl-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 3325 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **12** |
| pending — medium tier             | 0 |
| pending — low tier                | 3 |
| needs_review                      | 3310 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 9 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 3 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 9
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | dili | دلي | Dili | Dili | tl | PPLC | 150000 | بلدية ديلي | -8.5586 | 125.5736 | Asia/Dili |  |  | arabic_only |  |  | 90 | always_include:PPLC |
| ✅ | maliana | ماليانا | Maliana | Maliana | tl | PPLA | 22000 | بلدية بوبونارو | -8.9917 | 125.2197 | Asia/Dili |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | likisa | ليكيسا | Likisá | Likisá | tl | PPLA | 19000 | بلدية ليكيسا | -8.5875 | 125.3419 | Asia/Dili |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | aileu | آيليو | Aileu | Aileu | tl | PPLA | 17356 | بلدية أيليو | -8.7281 | 125.5664 | Asia/Dili |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | lospalos | لوسبالوس | Lospalos | Lospalos | tl | PPLA | 17186 | بلدية لاوتيم | -8.5217 | 126.9983 | Asia/Dili |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | baukau | باوكاو | Baukau | Baukau | tl | PPLA | 16000 | بلدية باوكاو | -8.4757 | 126.4563 | Asia/Dili |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | ainaro | آينارو | Ainaro | Ainaro | tl | PPLA | 12000 | بلدية أينارو | -8.9924 | 125.5082 | Asia/Dili |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | viqueque | فيكيك | Viqueque | Viqueque | tl | PPLA | 6078 | بلدية فيكيكي | -8.8575 | 126.3647 | Asia/Dili |  |  | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | manatutu | مانتوتو | Manatutu | Manatutu | tl | PPLA | 1924 | بلدية مانتوتو | -8.5114 | 126.0131 | Asia/Dili |  |  | arabic_only |  |  | 70 | always_include:PPLA |
| ⚠️ | suai | سوائی | Suai | Suai | tl | PPLA | 21539 | بلدية كوفا ليما | -9.3129 | 125.2565 | Asia/Dili |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | same | saہmے  mshrqy tymwr | Same | Same | tl | PPLA | 7500 | بلدية مانوفاي | -9.0042 | 125.6486 | Asia/Dili |  |  | mixed_script | wave | same-tl | 75 | always_include:PPLA |
| ⚠️ | pante-makasar | pantے makasar | Pante Makasar | Pante Makasar | tl | PPLA | 4730 | بلدية أوي-كوسي | -9.2000 | 124.3833 | Asia/Dili |  |  | mixed_script |  |  | 70 | always_include:PPLA |

## Collision-watch list for TL

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| suai | pending | high | suai | 21539 |  |  |  |  |
| maliana | pending | high | maliana | 22000 |  |  |  |  |
| dili | pending | high | dili | 150000 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/tl-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-tl` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/TL.zip
