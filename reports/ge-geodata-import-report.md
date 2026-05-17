# GE GeoNames Import Report — Asia-1I

**Country**: Georgia (جورجيا)
**Wave**: `CURATED-GEODATA-ASIA-1I`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T11:17:51.050Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ge-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ge-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ge-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1i-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 5337 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **6** |
| pending — medium tier             | 0 |
| pending — low tier                | 65 |
| needs_review                      | 5265 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 1 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 5 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 1
**Blocked by ar-gate (high-tier):** 5

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | mtskheta | متسختا | Mtskheta | Mtskheta | ge | PPLA | 7380 | موتسخيتا-منيانيتي | 41.8451 | 44.7188 | Asia/Tbilisi | 17.02 | tbilisi | arabic_only |  |  | 75 | always_include:PPLA |
| ⚠️ | batumi | باتومی | Batumi | Batumi | ge | PPLA | 186949 | أجاريا | 41.6408 | 41.6306 | Asia/Tbilisi | 265.58 | tbilisi | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | gori | گوری | Gori | Gori | ge | PPLA | 41933 | شيدا كارتلي | 41.9853 | 44.1129 | Asia/Tbilisi | 66.35 | tbilisi | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | akhaltsikhe | آخالت سیکه | Akhaltsikhe | Akhaltsikhe | ge | PPLA | 17445 | سامتسخي-جافاخيتي | 41.6395 | 42.9860 | Asia/Tbilisi | 153.13 | tbilisi | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | ozurgeti | ازرگتی | Ozurgeti | Ozurgeti | ge | PPLA | 13935 | غوريا | 41.9234 | 42.0052 | Asia/Tbilisi | 234.97 | tbilisi | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | ambrolauri | آمبرولائوری | Ambrolauri | Ambrolauri | ge | PPLA | 1952 | راتشا-ليتشخومي | 42.5232 | 43.1498 | Asia/Tbilisi | 164.96 | tbilisi | mixed_script |  |  | 70 | always_include:PPLA |

## Collision-watch list for GE

Cities the user pre-flagged (kickoff 2026-05-16): `baku`, `ganja`, `sumqayit`, `mingachevir`, `lankaran`, `sheki`, `shirvan`, `khirdalan`, `tbilisi`, `batumi`, `kutaisi`, `rustavi`, `zugdidi`, `gori`, `sokhumi`, `yerevan`, `gyumri`, `vanadzor`, `hrazdan`, `ararat`, `armavir`, `kapan`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tbilisi | existing |  | tbilisi | 1049498 |  |  |  |  |
| gori | pending | high | gori | 41933 | 66.35 | tbilisi |  |  |
| batumi | pending | high | batumi | 186949 | 265.58 | tbilisi |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/ge-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ge` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/GE.zip
