# KH GeoNames Import Report — Asia-1E

**Country**: Cambodia (كمبوديا)
**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T10:03:54.160Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/kh-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/kh-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/kh-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1e-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 11193 |
| existing (matched, no action)     | 6 |
| **pending — high tier**           | **23** |
| pending — medium tier             | 0 |
| pending — low tier                | 0 |
| needs_review                      | 11164 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 12 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 11
**Blocked by ar-gate (high-tier):** 12

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | takeo | تاكيو | Takeo | Takeo | kh | PPLA | 843931 | مقاطعة تاكيو | 10.9908 | 104.7850 | Asia/Phnom_Penh | 64.80 | phnom-penh | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | battambang | باتامبانج | Battambang | Battambang | kh | PPLA | 119251 | مقاطعة باتامبانغ | 13.1027 | 103.1982 | Asia/Phnom_Penh | 75.92 | siem-reap | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | kampong-cham | كامبونج تشام | Kampong Cham | Kampong Cham | kh | PPLA | 61750 | مقاطعة كامبونغ تشام | 11.9934 | 105.4635 | Asia/Phnom_Penh | 75.87 | phnom-penh | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | pursat | بورسات | Pursat | Pursat | kh | PPLA | 52476 | مقاطعة بورسات | 12.5388 | 103.9192 | Asia/Phnom_Penh | 92.47 | siem-reap | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | ta-khmau | تا خماؤ | Ta Khmau | Ta Khmau | kh | PPLA | 52066 | مقاطعة كانديل | 11.4833 | 104.9500 | Asia/Phnom_Penh | 8.46 | phnom-penh | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | kampong-speu | كامبونج سبيو | Kampong Speu | Kampong Speu | kh | PPLA | 33231 | مقاطعة كامبونغ سبو | 11.4533 | 104.5208 | Asia/Phnom_Penh | 45.84 | phnom-penh | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | sisophon | سسوفون | Sisophon | Sisophon | kh | PPLA | 23218 | مقاطعة بانتيي مينتشي | 13.5859 | 102.9737 | Asia/Phnom_Penh | 97.28 | siem-reap | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | kampot | كامبوت | Kampot | Kampot | kh | PPLA | 22691 | مقاطعة كامبوت | 10.6104 | 104.1814 | Asia/Phnom_Penh | 133.06 | phnom-penh | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | samraong | سامراونج | Samraong | Samraong | kh | PPLA | 18694 | مقاطعة أودار مينتشي | 14.1817 | 103.5176 | Asia/Phnom_Penh | 97.22 | siem-reap | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | pailin | بايلين | Pailin | Pailin | kh | PPLA | 17850 | مقاطعة بايلين | 12.8490 | 102.6093 | Asia/Phnom_Penh | 145.69 | siem-reap | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | sen-monorom | سن مونوروم | Sen Monorom | Sen Monorom | kh | PPLA | 7944 | مقاطعة موندولكيري | 12.4558 | 107.1881 | Asia/Phnom_Penh | 265.36 | phnom-penh | arabic_only |  |  | 75 | always_include:PPLA |
| ⚠️ | kampong-chhnang | kmpwng chھnang | Kampong Chhnang | Kampong Chhnang | kh | PPLA | 75244 | مقاطعة كامبونغ تشنانغ | 12.2500 | 104.6667 | Asia/Phnom_Penh | 82.21 | phnom-penh | mixed_latin |  |  | 85 | always_include:PPLA |
| ⚠️ | sihanoukville | syhanwk wېl | Sihanoukville | Sihanoukville | kh | PPLA | 73036 | مقاطعة سيهانوكفيل | 10.6093 | 103.5296 | Asia/Phnom_Penh | 185.42 | phnom-penh | mixed_latin |  |  | 85 | always_include:PPLA |
| ⚠️ | kep | كيب | Kep | Kep | kh | PPLA | 35990 | كيب | 10.4829 | 104.3167 | Asia/Phnom_Penh | 136.76 | phnom-penh | arabic_only | wave | kep-kh | 80 | always_include:PPLA |
| ⚠️ | koh-kong | kwہ kang | Koh Kong | Koh Kong | kh | PPLA | 33134 | مقاطعة كوه كونغ | 11.6153 | 102.9838 | Asia/Phnom_Penh | 211.90 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | prey-veng | pryے wyng | Prey Veng | Prey Veng | kh | PPLA | 33079 | مقاطعة بريي فينغ | 11.4868 | 105.3253 | Asia/Phnom_Penh | 43.95 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | suong | swwnګ | Suong | Suong | kh | PPLA | 30000 | مقاطعة تبونغ خموم | 11.9118 | 105.6582 | Asia/Phnom_Penh | 88.76 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | stung-treng | sٹng ٹrng | Stung Treng | Stung Treng | kh | PPLA | 25000 | مقاطعة ستونغ ترينغ | 13.5259 | 105.9683 | Asia/Phnom_Penh | 230.33 | siem-reap | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | tbeng-meanchey | تبنج میانچی | Tbeng Meanchey | Tbeng Meanchey | kh | PPLA | 24380 | مقاطعة بريا فيهيار | 13.8073 | 104.9805 | Asia/Phnom_Penh | 132.14 | siem-reap | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | svay-rieng | swې rynګ | Svay Rieng | Svay Rieng | kh | PPLA | 23956 | مقاطعة سواي رينغ | 11.0878 | 105.7994 | Asia/Phnom_Penh | 108.33 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | kratie | kryٹy | Kratié | Kratié | kh | PPLA | 19975 | مقاطعة كراتيي | 12.4881 | 106.0188 | Asia/Phnom_Penh | 157.48 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | kampong-thom | kmpwng ٹm | Kampong Thom | Kampong Thom | kh | PPLA | 19951 | مقاطعة كامبونغ تهوم | 12.7111 | 104.8887 | Asia/Phnom_Penh | 128.47 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | banlung | بانلنگ | Banlung | Banlung | kh | PPLA | 17000 | مقاطعة راتاناكيري | 13.7394 | 106.9873 | Asia/Phnom_Penh | 329.88 | phnom-penh | mixed_script |  |  | 80 | always_include:PPLA |

## Collision-watch list for KH

Cities the user pre-flagged (kickoff 2026-05-16): `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| phnom-penh | existing |  | phnom-penh | 1573544 |  |  |  |  |
| takeo | pending | high | takeo | 843931 | 64.80 | phnom-penh |  |  |
| siem-reap | existing |  | siem-reap | 139458 |  |  |  |  |
| sihanoukville | pending | high | sihanoukville | 73036 | 185.42 | phnom-penh |  |  |
| battambang | pending | high | battambang | 119251 | 75.92 | siem-reap |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/kh-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-kh` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/KH.zip
