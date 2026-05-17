# UZ GeoNames Import Report — Asia-1H

**Country**: Uzbekistan (أوزبكستان)
**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T13:06:22.686Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/uz-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/uz-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/uz-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1h-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 7935 |
| existing (matched, no action)     | 5 |
| **pending — high tier**           | **16** |
| pending — medium tier             | 0 |
| pending — low tier                | 88 |
| needs_review                      | 7826 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 8 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 7 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 8
**Blocked by ar-gate (high-tier):** 8

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | fergana | فرغانة | Fergana | Fergana | uz | PPLA | 299200 | منطقة فرغانة | 40.3842 | 71.7843 | Asia/Tashkent | 236.97 | tashkent | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | tirmiz | الترمذ | Tirmiz | Tirmiz | uz | PPLA | 182800 | منطقة صرخندريا | 37.2242 | 67.2783 | Asia/Samarkand | 268.49 | samarkand | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | jizzax | جيزاخ | Jizzax | Jizzax | uz | PPLA | 179200 | منطقة جيزاخ | 40.1335 | 67.8296 | Asia/Samarkand | 92.14 | samarkand | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | chirchiq | تشيرتشيق | Chirchiq | Chirchiq | uz | PPL | 162800 | منطقة طشقند | 41.4689 | 69.5822 | Asia/Tashkent | 34.20 | tashkent | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | urganch | أورجينج | Urganch | Urganch | uz | PPLA | 145000 | منطقة خوارزم | 41.5518 | 60.6314 | Asia/Samarkand | 378.61 | bukhara | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | shahrisabz | شهرسبز | Shahrisabz | Shahrisabz | uz | PPL | 142700 | منطقة قشقاديريا | 39.0578 | 66.8342 | Asia/Samarkand | 64.44 | samarkand | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | xiva | خيوة | Xiva | Xiva | uz | PPLA2 | 115000 | منطقة خوارزم | 41.3856 | 60.3641 | Asia/Samarkand | 389.50 | bukhara | arabic_only |  |  | 90 | pop_gte_100000 |
| ✅ | amir-timur | أمير تيمور | Amir Timur | Amir Timur | uz | PPLA | - | منطقة طشقند | 41.0194 | 68.9408 | Asia/Tashkent | 39.97 | tashkent | arabic_only |  |  | 60 | always_include:PPLA |
| ⚠️ | andijon | anڈyjan | Andijon | Andijon | uz | PPLA | 747800 | منطقة أنديجان | 40.7834 | 72.3507 | Asia/Tashkent | 267.10 | tashkent | mixed_script |  |  | 95 | always_include:PPLA |
| ⚠️ | namangan | namngaں | Namangan | Namangan | uz | PPLA | 713220 | منطقة نمنغان | 40.9983 | 71.6726 | Asia/Tashkent | 206.40 | tashkent | mixed_latin |  |  | 95 | always_include:PPLA |
| ⚠️ | nukus | نؤکیس | Nukus | Nukus | uz | PPLA | 332500 | قرقالباغستان | 42.4586 | 59.6058 | Asia/Samarkand | 504.42 | bukhara | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | qarshi | قارشی | Qarshi | Qarshi | uz | PPLA | 278300 | منطقة قشقاديريا | 38.8606 | 65.7891 | Asia/Samarkand | 133.01 | samarkand | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | angren | آنگرن، ازبکستان | Angren | Angren | uz | PPL | 191300 | منطقة طشقند | 41.0167 | 70.1436 | Asia/Tashkent | 81.92 | tashkent | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | navoiy | ناوائی | Navoiy | Navoiy | uz | PPLA | 144158 | منطقة نوائي | 40.0844 | 65.3792 | Asia/Samarkand | 86.25 | bukhara | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | olmaliq | آلمالیق | Olmaliq | Olmaliq | uz | PPL | 133400 | منطقة طشقند | 40.8447 | 69.5983 | Asia/Tashkent | 58.81 | tashkent | mixed_script |  |  | 90 | pop_gte_100000 |
| ⚠️ | guliston | گلستان | Guliston | Guliston | uz | PPLA | 90398 | منطقة سيرداريا | 40.4954 | 68.7754 | Asia/Tashkent | 97.57 | tashkent | mixed_script | wave | guliston-uz | 85 | always_include:PPLA |

## Collision-watch list for UZ

Cities the user pre-flagged (kickoff 2026-05-16): `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| nukus | pending | high | nukus | 332500 | 504.42 | bukhara |  |  |
| samarkand | existing |  | samarkand | 595200 |  |  |  |  |
| samarkand | existing |  | samarkand | - |  |  |  |  |
| qarshi | pending | high | qarshi | 278300 | 133.01 | samarkand |  |  |
| bukhara | existing |  | bukhara | 280187 |  |  |  |  |
| tashkent | existing |  | tashkent | 1978028 |  |  |  |  |
| tashkent | existing |  | tashkent | - |  |  |  |  |
| namangan | pending | high | namangan | 713220 | 206.40 | tashkent |  |  |
| fergana | pending | high | fergana | 299200 | 236.97 | tashkent |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/uz-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-uz` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/UZ.zip
