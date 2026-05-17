# TJ GeoNames Import Report — Asia-1H

**Country**: Tajikistan (طاجيكستان)
**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T13:06:22.814Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/tj-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/tj-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/tj-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1h-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 2649 |
| existing (matched, no action)     | 4 |
| **pending — high tier**           | **6** |
| pending — medium tier             | 0 |
| pending — low tier                | 75 |
| needs_review                      | 2564 |
| rejected                          | 0 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 5 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 1 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 5
**Blocked by ar-gate (high-tier):** 1

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | isfara | اسفرة | Isfara | Isfara | tj | PPLA2 | 274000 | منطقة سغد | 40.1265 | 70.6253 | Asia/Dushanbe | 237.68 | dushanbe | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | istaravshan | استروشن | Istaravshan | Istaravshan | tj | PPLA2 | 273500 | منطقة سغد | 39.9142 | 69.0033 | Asia/Dushanbe | 154.48 | dushanbe | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | khujand | خجند | Khujand | Khujand | tj | PPLA | 191000 | منطقة سغد | 40.2826 | 69.6222 | Asia/Dushanbe | 207.29 | dushanbe | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | bokhtar | بختار | Bokhtar | Bokhtar | tj | PPLA | 110800 | منطقة خاتلون | 37.8365 | 68.7776 | Asia/Dushanbe | 77.75 | dushanbe | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | khorugh | خروغ | Khorugh | Khorugh | tj | PPLA | 30500 | كوهستان بدخشان | 37.4904 | 71.5534 | Asia/Dushanbe | 269.40 | dushanbe | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | konibodom | کان بادام | Konibodom | Konibodom | tj | PPLA2 | 211100 | منطقة سغد | 40.2941 | 70.4312 | Asia/Dushanbe | 241.59 | dushanbe | mixed_script |  |  | 90 | pop_gte_100000 |

## Collision-watch list for TJ

Cities the user pre-flagged (kickoff 2026-05-16): `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bokhtar | pending | high | bokhtar | 110800 | 77.75 | dushanbe |  |  |
| khorugh | pending | high | khorugh | 30500 | 269.40 | dushanbe |  |  |
| dushanbe | existing |  | dushanbe | 679400 |  |  |  |  |
| dushanbe | existing |  | dushanbe | - |  |  |  |  |
| khujand | pending | high | khujand | 191000 | 207.29 | dushanbe |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/tj-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-tj` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/TJ.zip
