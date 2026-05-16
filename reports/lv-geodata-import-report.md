# LV GeoNames Import Report — Europe-3

**Country**: Latvia (لاتفيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.401Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/lv-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/lv-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/lv-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 7635 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **21** |
| pending — medium tier             | 0 |
| pending — low tier                | 10 |
| needs_review                      | 7586 |
| rejected                          | 0 |
| collisions in this wave           | 450 |
| collisions against existing curated | 2 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 2 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 16 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 3 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 2
**Blocked by ar-gate (high-tier):** 19

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | valka | فالكا | Valka | Valka | lv | PPLA | 4615 |  | 57.7752 | 26.0101 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ✅ | varaklani | فاراكلاني | Varakļāni | Varakļāni | lv | PPLA | 1619 |  | 56.6083 | 26.7538 |  |  | arabic_only |  | 70 | always_include:PPLA |
| ⚠️ | riga | رىگا | Riga | Riga | lv | PPLC | 742572 |  | 56.9460 | 24.1059 |  |  | mixed_script |  | 95 | always_include:PPLC |
| ⚠️ | daugavpils | daګawpls | Daugavpils | Daugavpils | lv | PPLA | 78126 |  | 55.8833 | 26.5333 |  |  | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | jelgava | jlګawa | Jelgava | Jelgava | lv | PPLA | 54834 |  | 56.6500 | 23.7128 |  |  | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | ventspils | wynٹspls | Ventspils | Ventspils | lv | PPLA | 32723 |  | 57.3948 | 21.5612 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | rezekne | rzyknے | Rēzekne | Rēzekne | lv | PPLA | 26429 |  | 56.5103 | 27.3400 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | ogre | awګry | Ogre | Ogre | lv | PPLA | 22767 |  | 56.8162 | 24.6140 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | marupe | marpې | Mārupe | Mārupe | lv | PPLA | 19096 |  | 56.9054 | 24.0511 |  |  | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | sigulda | sygwlڈa | Sigulda | Sigulda | lv | PPLA | 14757 |  | 57.1538 | 24.8595 |  |  | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | kuldiga | kwlڈyga | Kuldīga | Kuldīga | lv | PPLA | 9863 |  | 56.9740 | 21.9572 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | saldus | salڈs | Saldus | Saldus | lv | PPLA | 9553 |  | 56.6636 | 22.4881 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | ludza | lڈza | Ludza | Ludza | lv | PPLA | 7332 |  | 56.5337 | 27.7216 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | adazi | آدازی | Ādaži | Ādaži | lv | PPLA | 6734 |  | 57.0708 | 24.3368 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | aizkraukle | ayzkrawklې | Aizkraukle | Aizkraukle | lv | PPLA | 6689 |  | 56.6048 | 25.2553 |  |  | mixed_latin |  | 75 | always_include:PPLA |
| ⚠️ | madona | myڈwna | Madona | Madona | lv | PPLA | 6575 |  | 56.8533 | 26.2170 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | limbazi | لمبازی | Limbaži | Limbaži | lv | PPLA | 6517 |  | 57.5129 | 24.7194 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | aluksne | alwksnې | Alūksne | Alūksne | lv | PPLA | 6188 |  | 57.4215 | 27.0467 |  |  | mixed_latin |  | 75 | always_include:PPLA |
| ⚠️ | smiltene | smylٹyn | Smiltene | Smiltene | lv | PPLA | 5073 |  | 57.4244 | 25.9016 |  |  | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | saulkrasti | سالکراستی | Saulkrasti | Saulkrasti | lv | PPLA | 3124 |  | 57.2622 | 24.4147 |  |  | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | bergi | برگي | Berģi | Berģi | lv | PPLA | 2950 |  | 56.9864 | 24.2992 |  |  | mixed_script |  | 70 | always_include:PPLA |

## Collision-watch list for LV

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| riga | pending | high | riga | 742572 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/lv-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-lv` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/LV.zip
