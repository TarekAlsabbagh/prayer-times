# AZ GeoNames Import Report — Asia-1I

**Country**: Azerbaijan (أذربيجان)
**Wave**: `CURATED-GEODATA-ASIA-1I`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T11:17:51.013Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/az-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/az-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/az-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1i-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 5028 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **64** |
| pending — medium tier             | 0 |
| pending — low tier                | 1916 |
| needs_review                      | 3047 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 50 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 13 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 1 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 49
**Blocked by ar-gate (high-tier):** 15

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ganja | جنجا | Ganja | Ganja | az | PPLA | 335600 | غنجة | 40.6816 | 46.3613 | Asia/Baku | 297.75 | baku | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | lankaran | لنكاران | Lankaran | Lankaran | az | PPLA | 240300 | لنكران | 38.7543 | 48.8506 | Asia/Baku | 203.60 | baku | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | tovuz | توز | Tovuz | Tovuz | az | PPLA | 177200 | توفوز | 40.9925 | 45.6284 | Asia/Baku | 363.12 | baku | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | yevlakh | يفلاخ | Yevlakh | Yevlakh | az | PPLA | 127400 | يفلاخ | 40.6183 | 47.1501 | Asia/Baku | 230.84 | baku | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | naxcivan | ناختشيفان | Naxçıvan | Naxçıvan | az | PPLA | 97200 | ناختشيفان | 39.2089 | 45.4122 | Asia/Baku | 403.20 | baku | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | saatli | ساتلي | Saatlı | Saatlı | az | PPLA | 87000 | سعتلي | 39.9321 | 48.3689 | Asia/Baku | 137.91 | baku | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | lerik | لريك | Lerik | Lerik | az | PPLA | 87000 | ليريك | 38.7739 | 48.4150 | Asia/Baku | 220.34 | baku | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | sirvan | سروان | Şirvan | Şirvan | az | PPLA | 70220 | شيرفان | 39.9378 | 48.9290 | Asia/Baku | 95.40 | baku | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | sheki | شكي | Sheki | Sheki | az | PPLA | 68400 | شكي | 41.1919 | 47.1706 | Asia/Baku | 243.07 | baku | arabic_only |  |  | 85 | always_include:PPLA |
| ✅ | agdam | آغدام | Ağdam | Ağdam | az | PPLA | 39451 | أغدام | 39.9910 | 46.9274 | Asia/Baku | 253.96 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | khirdalan | خيردالان | Khirdalan | Khirdalan | az | PPLA | 37949 | أبشيرون | 40.4481 | 49.7550 | Asia/Baku | 10.42 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | xacmaz | خاشماز | Xaçmaz | Xaçmaz | az | PPLA | 37175 | خاتشماز | 41.4643 | 48.8056 | Asia/Baku | 147.34 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | salyan | ساليان | Salyan | Salyan | az | PPLA | 36555 | سالين | 39.5962 | 48.9848 | Asia/Baku | 117.57 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | jalilabad | جليلاباد | Jalilabad | Jalilabad | az | PPLA | 36259 | جليلاباد | 39.2096 | 48.4919 | Asia/Baku | 177.74 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | shamkhor | شامخور | Shamkhor | Shamkhor | az | PPLA | 35421 | شامكير | 40.8297 | 46.0178 | Asia/Baku | 328.21 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | imishli | إميشلي | Imishli | Imishli | az | PPLA | 34178 | إيميشلي | 39.8710 | 48.0600 | Asia/Baku | 164.87 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | zaqatala | زاقاتالا | Zaqatala | Zaqatala | az | PPLA | 32171 | زاكاتالا | 41.6316 | 46.6448 | Asia/Baku | 302.55 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | shamakhi | شماخي | Shamakhi | Shamakhi | az | PPLA | 29403 | شماخي | 40.6314 | 48.6414 | Asia/Baku | 106.51 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | ismayilli | إسماعيلي | İsmayıllı | İsmayıllı | az | PPLA | 28776 | إسماعيلي | 40.7848 | 48.1514 | Asia/Baku | 150.75 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | divichibazar | ديفيتشي بازار | Divichibazar | Divichibazar | az | PPLA | 23248 | شاباران | 41.2012 | 48.9871 | Asia/Baku | 115.06 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | haciqabul | حاجي قابول | Hacıqabul | Hacıqabul | az | PPLA | 23102 | حاجي قابل | 40.0387 | 48.9429 | Asia/Baku | 88.63 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | quba | قوبا | Quba | Quba | az | PPLA | 22405 | قوبا | 41.3611 | 48.5134 | Asia/Baku | 155.40 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | kyurdarmir | كيوردامير | Kyurdarmir | Kyurdarmir | az | PPLA | 19088 | كوردمير | 40.3426 | 48.1565 | Asia/Baku | 145.09 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | qazax | قازاخ | Qazax | Qazax | az | PPLA | 18903 | قازاخ | 41.0925 | 45.3656 | Asia/Baku | 386.68 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | susa | سوسا | Şuşa | Şuşa | az | PPLA | 18662 | شوشا | 39.7601 | 46.7499 | Asia/Baku | 274.83 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | neftcala | نفتجالا | Neftçala | Neftçala | az | PPLA | 18661 | نفط تشالا | 39.3768 | 49.2470 | Asia/Baku | 126.41 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | goygol | جويجول | Göygöl | Göygöl | az | PPLA | 17816 | غويغل | 40.5858 | 46.3189 | Asia/Baku | 300.64 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | aghsu | آغسو | Aghsu | Aghsu | az | PPLA | 17209 | أغسو | 40.5703 | 48.4009 | Asia/Baku | 125.28 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | qusar | قوسار | Qusar | Qusar | az | PPLA | 16022 | قوسار | 41.4275 | 48.4302 | Asia/Baku | 165.51 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | ujar | أوجار | Ujar | Ujar | az | PPLA | 15741 | أوجار | 40.5190 | 47.6542 | Asia/Baku | 187.60 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | beylagan | بيلاجان | Beylagan | Beylagan | az | PPLA | 15599 | بيلاغان | 39.7756 | 47.6186 | Asia/Baku | 203.83 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | aghstafa | آغستافا | Aghstafa | Aghstafa | az | PPLA | 12542 | آغستافا | 41.1189 | 45.4539 | Asia/Baku | 379.92 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | qax | قاخ | Qax | Qax | az | PPLA | 11992 | قاخ | 41.4183 | 46.9204 | Asia/Baku | 271.82 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | zardob | زاردوب | Zardob | Zardob | az | PPLA | 10612 | زردب | 40.2184 | 47.7121 | Asia/Baku | 183.94 | baku | arabic_only |  |  | 80 | always_include:PPLA |
| ✅ | yukhary-dashkesan | يوخاري-داشكيسان | Yukhary-Dashkesan | Yukhary-Dashkesan | az | PPLA | 9900 | داشكيسان | 40.5239 | 46.0819 | Asia/Baku | 320.44 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | masally | ماسالي | Masally | Masally | az | PPLA | 9604 | مسالي | 39.0353 | 48.6654 | Asia/Baku | 184.13 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | kyadabek | كيادابك | Kyadabek | Kyadabek | az | PPLA | 8657 | كاداباي | 40.5705 | 45.8123 | Asia/Baku | 343.34 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | kalbajar | كالباجار | Kalbajar | Kalbajar | az | PPLA | 8400 | كلبجار | 40.1098 | 46.0445 | Asia/Baku | 326.05 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | jebrail | جبرائيل | Jebrail | Jebrail | az | PPLA | 8396 | جبرائيل | 39.3992 | 47.0284 | Asia/Baku | 266.91 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | yardimli | يارديملي | Yardımlı | Yardımlı | az | PPLA | 7623 | ياردمالي | 38.9077 | 48.2405 | Asia/Baku | 217.40 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | zangilan | زنجيلان | Zangilan | Zangilan | az | PPLA | 7483 | زنجيلان | 39.0837 | 46.6599 | Asia/Baku | 311.28 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | naftalan | نافتالان | Naftalan | Naftalan | az | PPLA | 7045 | نفطالان | 40.5082 | 46.8203 | Asia/Baku | 258.00 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | qubadli | قبادلي | Qubadlı | Qubadlı | az | PPLA | 6890 | قبادلي | 39.3444 | 46.5818 | Asia/Baku | 304.30 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | oguz | أوغوز | Oğuz | Oğuz | az | PPLA | 6600 | أوغوز | 41.0713 | 47.4653 | Asia/Baku | 215.32 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | samux | سامخ | Samux | Samux | az | PPLA | 6013 | ساموخ | 40.7649 | 46.4087 | Asia/Baku | 294.69 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | novyy-karanlug | نوفي كارانلوغ | Novyy Karanlug | Novyy Karanlug | az | PPLA | 5079 | خانكندي | 39.7950 | 47.1117 | Asia/Baku | 244.09 | baku | arabic_only |  |  | 75 | always_include:PPLA |
| ✅ | qobustan | قوبوستان | Qobustan | Qobustan | az | PPLA | 3754 | قوبستان | 40.5336 | 48.9282 | Asia/Baku | 80.61 | baku | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | xizi | خيزي | Xızı | Xızı | az | PPLA | 1024 | خيزي | 40.9085 | 49.0748 | Asia/Baku | 86.88 | baku | arabic_only |  |  | 70 | always_include:PPLA |
| ✅ | kyzyl-burun | قيزيل بورون | Kyzyl-Burun | Kyzyl-Burun | az | PPLA | 3 | سيازان | 41.0781 | 49.1156 | Asia/Baku | 97.66 | baku | arabic_only |  |  | 65 | always_include:PPLA |
| ⚠️ | sumqayit | سمقاییت | Sumqayıt | Sumqayıt | az | PPLA | 358675 | سومقاييت | 40.5897 | 49.6686 | Asia/Baku | 26.16 | baku | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | mingachevir | منجاچویر | Mingachevir | Mingachevir | az | PPLA | 106048 | مينغاتشيفير | 40.7642 | 47.0623 | Asia/Baku | 240.10 | baku | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | agdzhabedy | آغجابیدی | Agdzhabedy | Agdzhabedy | az | PPLA | 43000 | أغجاباي | 40.0502 | 47.4594 | Asia/Baku | 208.26 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | goeycay | gwے jے | Göyçay | Göyçay | az | PPLA | 42500 | غويتشاي | 40.6506 | 47.7422 | Asia/Baku | 181.58 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | barda | bardہ | Barda | Barda | az | PPLA | 37372 | باردا | 40.3758 | 47.1262 | Asia/Baku | 232.14 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | sabirabad | سبیر آباد | Sabirabad | Sabirabad | az | PPLA | 30612 | سابيراباد | 40.0087 | 48.4770 | Asia/Baku | 126.17 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | fizuli | فضولی | Fizuli | Fizuli | az | PPLA | 26765 | فضولي | 39.6009 | 47.1453 | Asia/Baku | 248.63 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | agdas | آغ‌داش | Ağdaş | Ağdaş | az | PPLA | 23528 | أغداش | 40.6470 | 47.4738 | Asia/Baku | 203.99 | baku | mixed_unknown |  |  | 80 | always_include:PPLA |
| ⚠️ | terter | trٹr | Terter | Terter | az | PPLA | 18185 | تارتر | 40.3420 | 46.9316 | Asia/Baku | 248.77 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | pushkino | بوشكينو | Pushkino | Pushkino | az | PPLA | 18182 | بيلاسوفار | 39.4583 | 48.5450 | Asia/Baku | 154.56 | baku | arabic_only | wave | pushkino-az | 80 | always_include:PPLA |
| ⚠️ | astara | astarہ | Astara | Astara | az | PPLA | 15190 | أستارا | 38.4560 | 48.8750 | Asia/Baku | 233.31 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | belokany | بلوکانی | Belokany | Belokany | az | PPLA | 14800 | بالاكان | 41.7263 | 46.4048 | Asia/Baku | 325.07 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | qabala | qbalہ | Qabala | Qabala | az | PPLA | 11867 | قبلة | 40.9814 | 47.8458 | Asia/Baku | 181.89 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | goranboy | gwranbwayے | Goranboy | Goranboy | az | PPLA | 10186 | غورنبوي | 40.6103 | 46.7897 | Asia/Baku | 261.11 | baku | mixed_script |  |  | 80 | always_include:PPLA |
| ⚠️ | lacin | لاچن | Laçın | Laçın | az | PPLA | 2300 | لاتشين | 39.6374 | 46.5498 | Asia/Baku | 295.20 | baku | mixed_script |  |  | 70 | always_include:PPLA |

## Collision-watch list for AZ

Cities the user pre-flagged (kickoff 2026-05-16): `baku`, `ganja`, `sumqayit`, `mingachevir`, `lankaran`, `sheki`, `shirvan`, `khirdalan`, `tbilisi`, `batumi`, `kutaisi`, `rustavi`, `zugdidi`, `gori`, `sokhumi`, `yerevan`, `gyumri`, `vanadzor`, `hrazdan`, `ararat`, `armavir`, `kapan`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lankaran | pending | high | lankaran | 240300 | 203.60 | baku |  |  |
| sumqayit | pending | high | sumqayit | 358675 | 26.16 | baku |  |  |
| sheki | pending | high | sheki | 68400 | 243.07 | baku |  |  |
| mingachevir | pending | high | mingachevir | 106048 | 240.10 | baku |  |  |
| khirdalan | pending | high | khirdalan | 37949 | 10.42 | baku |  |  |
| ganja | pending | high | ganja | 335600 | 297.75 | baku |  |  |
| baku | existing |  | baku | 2351300 |  |  |  |  |
| sheki | pending | low | sheki | - | 230.69 | baku |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/az-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-az` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/AZ.zip
