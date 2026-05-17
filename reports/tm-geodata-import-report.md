# TM GeoNames Import Report — Asia-1H

**Country**: Turkmenistan (تركمانستان)
**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T13:06:22.841Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/tm-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/tm-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/tm-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1h-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 1443 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **5** |
| pending — medium tier             | 0 |
| pending — low tier                | 26 |
| needs_review                      | 1411 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 5 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 0 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 5
**Blocked by ar-gate (high-tier):** 0

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | tuerkmenabat | تركمينابات | Türkmenabat | Türkmenabat | tm | PPLA | 230861 | منطقة لباب | 39.0733 | 63.5786 | Asia/Ashgabat | 473.37 | ashgabat | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | dasoguz | داسوغوز | Daşoguz | Daşoguz | tm | PPLA | 201142 | منطقة داشوغوز | 41.8362 | 59.9666 | Asia/Ashgabat | 453.13 | ashgabat | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | mary | ماري | Mary | Mary | tm | PPLA | 167027 | منطقة مرو | 37.5938 | 61.8303 | Asia/Ashgabat | 310.64 | ashgabat | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | balkanabat | بالكانابات | Balkanabat | Balkanabat | tm | PPLA | 87822 | منطقة بلخان | 39.5108 | 54.3671 | Asia/Ashgabat | 384.20 | ashgabat | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | aenew | آب نو | Änew | Änew | tm | PPLA | 28653 | منطقة أحال | 37.8875 | 58.5160 | Asia/Ashgabat | 18.50 | ashgabat | arabic_only |  |  | 80 | always_include:PPLA |

## Collision-watch list for TM

Cities the user pre-flagged (kickoff 2026-05-16): `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| balkanabat | pending | high | balkanabat | 87822 | 384.20 | ashgabat |  |  |
| ashgabat | existing |  | ashgabat | 1030063 |  |  |  |  |
| dasoguz | pending | high | dasoguz | 201142 | 453.13 | ashgabat |  |  |
| mary | pending | high | mary | 167027 | 310.64 | ashgabat |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/tm-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-tm` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/TM.zip
