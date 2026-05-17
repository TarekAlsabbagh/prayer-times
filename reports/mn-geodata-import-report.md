# MN GeoNames Import Report — Asia-1H

**Country**: Mongolia (منغوليا)
**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T13:06:22.851Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/mn-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/mn-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/mn-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1h-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 1530 |
| existing (matched, no action)     | 0 |
| **pending — high tier**           | **22** |
| pending — medium tier             | 0 |
| pending — low tier                | 0 |
| needs_review                      | 1507 |
| rejected                          | 1 |
| collisions in this wave (high)    | 0 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 12 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 8 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 2 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 12
**Blocked by ar-gate (high-tier):** 10

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ulan-bator | أولان باتور | Ulan Bator | Ulan Bator | mn | PPLC | 844818 | أولان باتور | 47.9077 | 106.8832 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 95 | always_include:PPLC |
| ✅ | erdenet | إردنيت | Erdenet | Erdenet | mn | PPLA | 97814 | أورخون | 49.0333 | 104.0833 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | choibalsan | تشويبالسان | Choibalsan | Choibalsan | mn | PPLA | 44835 | دورنود | 48.0726 | 114.5326 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | moeroen | موران | Mörön | Mörön | mn | PPLA | 39404 | خوبسغول | 49.6342 | 100.1625 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | ulaangom | أولاانجوم | Ulaangom | Ulaangom | mn | PPLA | 30092 | أوبس | 49.9811 | 92.0667 | Asia/Hovd |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | khovd | خوفد | Khovd | Khovd | mn | PPLA | 29800 | خوفد | 48.0056 | 91.6419 | Asia/Hovd |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | oelgii | أولجي | Ölgii | Ölgii | mn | PPLA | 28400 | بايانخونغور | 48.9683 | 89.9625 | Asia/Hovd |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | undurkhaan | اندورخان | Undurkhaan | Undurkhaan | mn | PPLA | 22741 | خنتي | 47.3194 | 110.6556 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | tsetserleg | تسيتسيرليج | Tsetserleg | Tsetserleg | mn | PPLA | 21620 | أرخانغاي | 47.4750 | 101.4542 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | altai | ألتاي | Altai | Altai | mn | PPLA | 17617 | غوبي ألطاي | 46.3722 | 96.2583 | Asia/Hovd |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | dzuunmod | جزون مود | Dzuunmod | Dzuunmod | mn | PPLA | 16953 | توف | 47.7069 | 106.9528 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | choyr | تشوير | Choyr | Choyr | mn | PPLA | 10434 | غوفي سومبر | 46.3611 | 108.3611 | Asia/Ulaanbaatar |  |  | arabic_only |  |  | 80 | always_include:PPLA |
| ⚠️ | darhan | darہan | Darhan | Darhan | mn | PPLA | 83883 | دارخان أول | 49.4867 | 105.9228 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 85 | always_include:PPLA |
| ⚠️ | bayanhongor | byan hnګwr | Bayanhongor | Bayanhongor | mn | PPLA | 30931 | بايان أولغي | 46.1944 | 100.7181 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | arvayheer | arwyہyr | Arvayheer | Arvayheer | mn | PPLA | 29420 | أوبور خانغاي | 46.2639 | 102.7750 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | dalandzadgad | dalanzadgaڈ | Dalandzadgad | Dalandzadgad | mn | PPLA | 24863 | أومنوغوبي | 43.5708 | 104.4250 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | suehbaatar | swkھ batr | Sühbaatar | Sühbaatar | mn | PPLA | 22741 | سوخباتر | 50.2314 | 106.2078 | Asia/Ulaanbaatar |  |  | mixed_latin |  |  | 80 | always_include:PPLA |
| ⚠️ | saynshand | sayshynڈ | Saynshand | Saynshand | mn | PPLA | 19891 | دورنوغوبي | 44.8824 | 110.1163 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | baruun-urt | barwn arټ | Baruun-Urt | Baruun-Urt | mn | PPLA | 18190 | سوخباتر آيماغ | 46.6806 | 113.2792 | Asia/Ulaanbaatar |  |  | mixed_latin |  |  | 80 | always_include:PPLA |
| ⚠️ | bulgan | bwlګan | Bulgan | Bulgan | mn | PPLA | 17348 | بولغان | 48.8125 | 103.5347 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | uliastay | awlyastے | Uliastay | Uliastay | mn | PPLA | 16265 | دزافخان | 47.7417 | 96.8444 | Asia/Hovd |  |  | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | mandalgovi | mnڈalgwwy | Mandalgovi | Mandalgovi | mn | PPLA | 12339 | دوندغوبي | 45.7625 | 106.2708 | Asia/Ulaanbaatar |  |  | mixed_script |  |  | 80 | always_include:PPLA |

## Collision-watch list for MN

Cities the user pre-flagged (kickoff 2026-05-16): `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| khovd | pending | high | khovd | 29800 |  |  |  |  |
| erdenet | pending | high | erdenet | 97814 |  |  |  |  |
| choibalsan | pending | high | choibalsan | 44835 |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/mn-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-mn` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/MN.zip
