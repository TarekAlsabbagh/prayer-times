# AM GeoNames Import Report — Asia-1I

**Country**: Armenia (أرمينيا)
**Wave**: `CURATED-GEODATA-ASIA-1I`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T11:17:51.060Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/am-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/am-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/am-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1i-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 1298 |
| existing (matched, no action)     | 13 |
| **pending — high tier**           | **9** |
| pending — medium tier             | 0 |
| pending — low tier                | 111 |
| needs_review                      | 1165 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 6 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 6
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | gyumri | غيومري | Gyumri | Gyumri | am | PPLA | 114667 | شيراك | 40.7931 | 43.8464 | Asia/Yerevan | 87.96 | yerevan | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | hrazdan | هرازدان | Hrazdan | Hrazdan | am | PPLA | 49500 | كوتايك | 40.5169 | 44.7559 | Asia/Yerevan | 41.95 | yerevan | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | kapan | قابان | Kapan | Kapan | am | PPLA | 32900 | سيونيك | 39.2076 | 46.4068 | Asia/Yerevan | 195.07 | yerevan | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | artashat | آرتاشات | Artashat | Artashat | am | PPLA | 22800 | آرارات | 39.9548 | 44.5487 | Asia/Yerevan | 25.99 | yerevan | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | ijevan | إيجيفان | Ijevan | Ijevan | am | PPLA | 19500 | تافوش | 40.8804 | 45.1478 | Asia/Yerevan | 93.80 | yerevan | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | ashtarak | آشتاراك | Ashtarak | Ashtarak | am | PPLA | 17600 | أراغاتسوتن | 40.2976 | 44.3615 | Asia/Yerevan | 17.91 | yerevan | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | vanadzor | vanadzۆr | Vanadzor | Vanadzor | am | PPLA | 78100 | لوري | 40.8074 | 44.4970 | Asia/Yerevan | 68.98 | yerevan | mixed_latin |  |  | 85 | always_include:PPLA |
| ⚠️ | armavir | آرماویر | Armavir | Armavir | am | PPLA | 29700 | أرمافير | 40.1555 | 44.0388 | Asia/Yerevan | 40.63 | yerevan | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | yeghegnadzor | yەghەgnadzۆr | Yeghegnadzor | Yeghegnadzor | am | PPLA | 7300 | فايوتس دزور | 39.7644 | 45.3327 | Asia/Yerevan | 84.04 | yerevan | mixed_latin |  |  | 75 | always_include:PPLA |

## Collision-watch list for AM

Cities the user pre-flagged (kickoff 2026-05-16): `baku`, `ganja`, `sumqayit`, `mingachevir`, `lankaran`, `sheki`, `shirvan`, `khirdalan`, `tbilisi`, `batumi`, `kutaisi`, `rustavi`, `zugdidi`, `gori`, `sokhumi`, `yerevan`, `gyumri`, `vanadzor`, `hrazdan`, `ararat`, `armavir`, `kapan`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kapan | pending | high | kapan | 32900 | 195.07 | yerevan |  |  |
| ararat | pending | low | ararat | 17598 | 39.98 | yerevan |  |  |
| ararat-village | pending | low | ararat | 8287 | 42.71 | yerevan |  |  |
| yerevan | existing |  | yerevan | 1144700 |  |  |  |  |
| vanadzor | pending | high | vanadzor | 78100 | 68.98 | yerevan |  |  |
| hrazdan | pending | high | hrazdan | 49500 | 41.95 | yerevan |  |  |
| armavir | pending | high | armavir | 29700 | 40.63 | yerevan |  |  |
| gyumri | pending | high | gyumri | 114667 | 87.96 | yerevan |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/am-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-am` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/AM.zip
