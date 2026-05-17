# TW GeoNames Import Report — Asia-1C

**Country**: Taiwan (تايوان)
**Wave**: `CURATED-GEODATA-ASIA-1C`
**Strategy**: E (popMin 200000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T07:44:15.162Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/tw-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/tw-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/tw-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1c-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 15674 |
| existing (matched, no action)     | 2 |
| **pending — high tier**           | **7** |
| pending — medium tier             | 0 |
| pending — low tier                | 8 |
| needs_review                      | 15657 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 4 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 2 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 4
**Blocked by ar-gate (high-tier):** 3

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | taichung | تاي شانغ | Taichung | Taichung | tw | PPLA2 | 2850285 | تايوان (مقاطعة) | 24.1469 | 120.6839 | Asia/Taipei | 132.86 | taipei | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | tainan | تاينان | Tainan | Tainan | tw | PPLA2 | 1856642 | تايوان (مقاطعة) | 22.9908 | 120.2133 | Asia/Taipei | 265.37 | taipei | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | hsinchu | سين شو | Hsinchu | Hsinchu | tw | PPLA2 | 453536 | تايوان (مقاطعة) | 24.8036 | 120.9686 | Asia/Taipei | 65.36 | taipei | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | keelung | كي لنغ | Keelung | Keelung | tw | PPLA2 | 362487 | تايوان (مقاطعة) | 25.1309 | 121.7409 | Asia/Taipei | 20.76 | taipei | arabic_only |  |  | 90 | pop_gte_200000 |
| ⚠️ | kaohsiung | kawhsywnګ | Kaohsiung | Kaohsiung | tw | PPLA | 2737660 | كاوهسيونغ | 22.6163 | 120.3133 | Asia/Taipei | 297.38 | taipei | mixed_script |  |  | 95 | always_include:PPLA |
| ⚠️ | jincheng | jynchynګ | Jincheng | Jincheng | tw | PPLA | 37507 | فوجيان (تايوان) | 24.4341 | 118.3171 | Asia/Taipei | 334.74 | taipei | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | zhongxing-new-village | zhwngshng nya gawں | Zhongxing New Village | Zhongxing New Village | tw | PPLA | 25549 | تايوان (مقاطعة) | 23.9591 | 120.6852 | Asia/Taipei | 148.97 | taipei | mixed_latin |  |  | 80 | always_include:PPLA |

## Collision-watch list for TW

Cities the user pre-flagged (kickoff 2026-05-16): `tokyo`, `osaka`, `kyoto`, `yokohama`, `nagoya`, `sapporo`, `sendai`, `nara`, `okinawa`, `seoul`, `busan`, `daegu`, `daejeon`, `incheon`, `hong-kong`, `macau`, `macao`, `taipei`, `kaohsiung`, `taichung`, `tainan`, `kobe`, `fukuoka`, `hiroshima`, `nagasaki`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| taipei | existing |  | taipei | 7871900 |  |  |  |  |
| tainan | pending | high | tainan | 1856642 | 265.37 | taipei |  |  |
| taichung | pending | high | taichung | 2850285 | 132.86 | taipei |  |  |
| kaohsiung | pending | high | kaohsiung | 2737660 | 297.38 | taipei |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/tw-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-tw` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/TW.zip
