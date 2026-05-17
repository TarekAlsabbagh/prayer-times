# KZ GeoNames Import Report — Asia-1H

**Country**: Kazakhstan (كازاخستان)
**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T13:06:22.793Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/kz-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/kz-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/kz-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1h-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 13382 |
| existing (matched, no action)     | 4 |
| **pending — high tier**           | **21** |
| pending — medium tier             | 0 |
| pending — low tier                | 86 |
| needs_review                      | 13271 |
| rejected                          | 0 |
| collisions in this wave (high)    | 2 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 12 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 7 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 11
**Blocked by ar-gate (high-tier):** 10

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | taraz | تاراز | Taraz | Taraz | kz | PPLA | 358153 | منطقة جامبيل | 42.8980 | 71.3733 | Asia/Almaty | 446.42 | almaty | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | kyzylorda | قزل اوردا | Kyzylorda | Kyzylorda | kz | PPLA | 354800 | منطقة قيزيلوردا | 44.8528 | 65.5092 | Asia/Qyzylorda | 829.18 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | oral | أورال | Oral | Oral | kz | PPLA | 330000 | كازاخستان الغربية | 51.2460 | 51.4256 | Asia/Oral | 1390.61 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | pavlodar | بافلودار | Pavlodar | Pavlodar | kz | PPLA | 329002 | منطقة بافلودار | 52.2760 | 76.9688 | Asia/Almaty | 399.50 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | petropavl | بتروبافل | Petropavl | Petropavl | kz | PPLA | 200920 | كازاخستان الشمالية | 54.8734 | 69.1506 | Asia/Almaty | 439.56 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | temirtau | تميرتاو | Temirtau | Temirtau | kz | PPLA2 | 170600 | منطقة قاراغندي | 50.0520 | 72.9550 | Asia/Almaty | 163.49 | astana | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | kokshetau | كوكشيتو | Kokshetau | Kokshetau | kz | PPLA | 150649 | منطقة أقمولا | 53.2841 | 69.3936 | Asia/Almaty | 273.64 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | aktau | آقتاؤ | Aktau | Aktau | kz | PPLA | 147443 | منطقة منغستاو | 43.6611 | 51.1739 | Asia/Aqtau | 1730.91 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | zhezqazghan | جيزقازغان | Zhezqazghan | Zhezqazghan | kz | PPLA | 104357 | منطقة جيزقازغان | 47.7941 | 67.7063 | Asia/Almaty | 462.44 | astana | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | baikonur | بايكونور | Baikonur | Baikonur | kz | PPLA | 70000 | منطقة قيزيلوردا | 45.6167 | 63.3167 | Asia/Qostanay | 860.28 | astana | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | konayev | كونايف | Konayev | Konayev | kz | PPLA | 42167 | منطقة ألما آتا | 43.8668 | 77.0630 | Asia/Almaty | 73.70 | almaty | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | shymkent | شمکنت | Shymkent | Shymkent | kz | PPLA | 1200000 | شيمكنت | 42.3099 | 69.6004 | Asia/Almaty | 600.32 | almaty | mixed_script |  |  | 95 | always_include:PPLA |
| ⚠️ | aktobe | aktwbې | Aktobe | Aktobe | kz | PPLA | 500757 | منطقة أكتوبه | 50.2797 | 57.2072 | Asia/Aqtobe | 1005.79 | astana | mixed_latin |  |  | 95 | always_include:PPLA |
| ⚠️ | karagandy | karagnڈy | Karagandy | Karagandy | kz | PPLA | 497777 | منطقة قاراغندي | 49.8019 | 73.1021 | Asia/Almaty | 191.82 | astana | mixed_script | wave | karagandy-kz | 90 | always_include:PPLA |
| ⚠️ | ust-kamenogorsk | asٹ kamnwګwrsk | Ust-Kamenogorsk | Ust-Kamenogorsk | kz | PPLA | 319067 | كازاخستان الشرقية | 49.9714 | 82.6059 | Asia/Almaty | 798.30 | astana | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | semey | smې | Semey | Semey | kz | PPLA | 292780 | منطقة سيمي | 50.4206 | 80.2502 | Asia/Almaty | 623.79 | astana | mixed_latin |  |  | 90 | always_include:PPLA |
| ⚠️ | atyrau | آتیراؤ | Atyrau | Atyrau | kz | PPLA | 290700 | منطقة أتيراو | 47.1048 | 51.8843 | Asia/Atyrau | 1488.15 | astana | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | turkestan | تركستان | Turkestan | Turkestan | kz | PPLA | 227098 | منطقة تركستان | 43.2946 | 68.2569 | Asia/Almaty | 695.71 | almaty | arabic_only | wave | turkestan-kz | 90 | always_include:PPLA |
| ⚠️ | kostanay | قسطنائی | Kostanay | Kostanay | kz | PPLA | 210000 | منطقة قوستاناي | 53.2144 | 63.6246 | Asia/Qostanay | 579.41 | astana | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | ekibastuz | ئێکیباستوز | Ekibastuz | Ekibastuz | kz | PPLA2 | 121470 | منطقة بافلودار | 51.7237 | 75.3229 | Asia/Almaty | 275.41 | astana | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | taldykorgan | taldy kwrګan | Taldykorgan | Taldykorgan | kz | PPLA | 116558 | منطقة جيتيسو | 45.0156 | 78.3739 | Asia/Almaty | 233.55 | almaty | mixed_script |  |  | 90 | always_include:PPLA |

## Collision-watch list for KZ

Cities the user pre-flagged (kickoff 2026-05-16): `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| atyrau | pending | high | atyrau | 290700 | 1488.15 | astana |  |  |
| aktobe | pending | high | aktobe | 500757 | 1005.79 | astana |  |  |
| taraz | pending | high | taraz | 358153 | 446.42 | almaty |  |  |
| turkestan | pending | high | turkestan | 227098 | 695.71 | almaty | wave | turkestan-kz |
| shymkent | pending | high | shymkent | 1200000 | 600.32 | almaty |  |  |
| semey | pending | high | semey | 292780 | 623.79 | astana |  |  |
| kyzylorda | pending | high | kyzylorda | 354800 | 829.18 | astana |  |  |
| kostanay | pending | high | kostanay | 210000 | 579.41 | astana |  |  |
| pavlodar | pending | high | pavlodar | 329002 | 399.50 | astana |  |  |
| astana | existing |  | astana | 345604 |  |  |  |  |
| almaty | existing |  | almaty | 1977011 |  |  |  |  |
| almaty | existing |  | almaty | - |  |  |  |  |
| almaty | existing |  | almaty | - |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/kz-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-kz` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/KZ.zip
