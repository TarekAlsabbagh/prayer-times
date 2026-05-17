# KR GeoNames Import Report — Asia-1C

**Country**: South Korea (كوريا الجنوبية)
**Wave**: `CURATED-GEODATA-ASIA-1C`
**Strategy**: E (popMin 200000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T07:44:15.053Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/kr-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/kr-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/kr-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1c-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 61692 |
| existing (matched, no action)     | 12 |
| **pending — high tier**           | **20** |
| pending — medium tier             | 0 |
| pending — low tier                | 9 |
| needs_review                      | 61651 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 13 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 7 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 13
**Blocked by ar-gate (high-tier):** 7

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | daegu | دائجو | Daegu | Daegu | kr | PPLA | 2365523 | دايغو | 35.8703 | 128.5911 | Asia/Seoul | 88.43 | busan | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | daejeon | دائجئون | Daejeon | Daejeon | kr | PPLA | 1441203 | دايجون | 36.3491 | 127.3849 | Asia/Seoul | 137.15 | incheon | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | gwangju | غوانغجو | Gwangju | Gwangju | kr | PPLA | 1401235 | غوانغجو | 35.1547 | 126.9156 | Asia/Seoul | 196.36 | busan | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | suwon | سوون | Suwon | Suwon | kr | PPLA | 1234582 | غيونغي | 37.2911 | 127.0089 | Asia/Seoul | 30.74 | seoul | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | ulsan | ألسان | Ulsan | Ulsan | kr | PPLA | 1098421 | أولسان | 35.5372 | 129.3167 | Asia/Seoul | 45.38 | busan | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | changwon | تشانغوون | Changwon | Changwon | kr | PPLA | 1025702 | كيونغسانغ الجنوبية | 35.2281 | 128.6811 | Asia/Seoul | 36.24 | busan | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | cheongju-si | تشيونغجو | Cheongju-si | Cheongju-si | kr | PPLA | 852147 | تشونغتشيونغ الشمالية | 36.6372 | 127.4897 | Asia/Seoul | 112.86 | seoul | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | cheonan | تشونان | Cheonan | Cheonan | kr | PPL | 658831 | تشونغتشيونغ الجنوبية | 36.8065 | 127.1522 | Asia/Seoul | 82.41 | incheon | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | jeonju | جئونجو | Jeonju | Jeonju | kr | PPLA | 638421 | جيولا الشمالية | 35.8219 | 127.1489 | Asia/Seoul | 185.99 | incheon | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | chuncheon | تشنتشون | Chuncheon | Chuncheon | kr | PPLA | 284855 | كانغوون | 37.8747 | 127.7342 | Asia/Seoul | 74.82 | seoul | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | osan | اوسان | Osan | Osan | kr | PPL | 238788 | غيونغي | 37.1522 | 127.0706 | Asia/Seoul | 46.77 | incheon | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | chungju | تشنغجو | Chungju | Chungju | kr | PPL | 209483 | تشونغتشيونغ الشمالية | 36.9767 | 127.9287 | Asia/Seoul | 106.67 | seoul | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | muan | موآن | Muan | Muan | kr | PPLA | 92009 | جيولا الجنوبية | 34.9901 | 126.4790 | Asia/Seoul | 237.20 | busan | arabic_only |  |  | 85 | always_include:PPLA |
| ⚠️ | jeju-city | jyjw sٹy | Jeju City | Jeju City | kr | PPLA | 488844 | جيجو | 33.5097 | 126.5219 | Asia/Seoul | 299.05 | busan | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | sejong | سئجونگ | Sejong | Sejong | kr | PPLA | 394630 | سيجونغ | 36.5924 | 127.2922 | Asia/Seoul | 109.28 | incheon | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | yangsan | سانگ‌سان | Yangsan | Yangsan | kr | PPLA2 | 358074 | كيونغسانغ الجنوبية | 35.3420 | 129.0336 | Asia/Seoul | 18.46 | busan | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | iksan | اکسان | Iksan | Iksan | kr | PPL | 307000 | جيولا الشمالية | 35.9439 | 126.9544 | Asia/Seoul | 169.63 | incheon | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | yeosu | یئوسو | Yeosu | Yeosu | kr | PPLA2 | 268823 | جيولا الجنوبية | 34.7606 | 127.6621 | Asia/Seoul | 136.96 | busan | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | andong | آندونگ | Andong | Andong | kr | PPLA | 153348 | كيونغسانغ الشمالية | 36.5664 | 128.7227 | Asia/Seoul | 157.44 | busan | mixed_script | wave | andong-kr | 90 | always_include:PPLA |
| ⚠️ | hongseong | هانگ سئونگ | Hongseong | Hongseong | kr | PPLA | 89174 | تشونغتشيونغ الجنوبية | 36.6009 | 126.6650 | Asia/Seoul | 95.18 | incheon | mixed_script |  |  | 85 | always_include:PPLA |

## Collision-watch list for KR

Cities the user pre-flagged (kickoff 2026-05-16): `tokyo`, `osaka`, `kyoto`, `yokohama`, `nagoya`, `sapporo`, `sendai`, `nara`, `okinawa`, `seoul`, `busan`, `daegu`, `daejeon`, `incheon`, `hong-kong`, `macau`, `macao`, `taipei`, `kaohsiung`, `taichung`, `tainan`, `kobe`, `fukuoka`, `hiroshima`, `nagasaki`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| daejeon | pending | high | daejeon | 1441203 | 137.15 | incheon |  |  |
| daegu | pending | high | daegu | 2365523 | 88.43 | busan |  |  |
| seoul | existing |  | seoul | 10349312 |  |  |  |  |
| busan | existing |  | busan | 3285147 |  |  |  |  |
| incheon | existing |  | incheon | 3015482 |  |  |  |  |
| incheon | existing |  | incheon | - |  |  |  |  |
| busan | existing |  | busan | - |  |  |  |  |
| incheon | existing |  | incheon | - |  |  |  |  |
| incheon | existing |  | incheon | - |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/kr-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-kr` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/KR.zip
