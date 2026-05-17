# HK GeoNames Import Report — Asia-1C

**Country**: Hong Kong (هونغ كونغ)
**Wave**: `CURATED-GEODATA-ASIA-1C`
**Strategy**: E (popMin 200000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T07:44:15.075Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/hk-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/hk-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/hk-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1c-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 1335 |
| existing (matched, no action)     | 10 |
| **pending — high tier**           | **2** |
| pending — medium tier             | 0 |
| pending — low tier                | 4 |
| needs_review                      | 1319 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 1 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 1
**Blocked by ar-gate (high-tier):** 1

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | central | سنترال | Central | Central | hk | PPLA | 11077 | سنترال | 22.2830 | 114.1585 | Asia/Hong_Kong | 4.19 | hong-kong | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | tin-shui-wai | تین شوی وای | Tin Shui Wai | Tin Shui Wai | hk | PPL | 282400 | يوين لونغ | 22.4568 | 114.0023 | Asia/Hong_Kong | 22.99 | hong-kong | mixed_script |  |  | 90 | pop_gte_200000 |

## Collision-watch list for HK

Cities the user pre-flagged (kickoff 2026-05-16): `tokyo`, `osaka`, `kyoto`, `yokohama`, `nagoya`, `sapporo`, `sendai`, `nara`, `okinawa`, `seoul`, `busan`, `daegu`, `daejeon`, `incheon`, `hong-kong`, `macau`, `macao`, `taipei`, `kaohsiung`, `taichung`, `tainan`, `kobe`, `fukuoka`, `hiroshima`, `nagasaki`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| hong-kong | existing |  | hong-kong | 7396076 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/hk-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-hk` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/HK.zip
