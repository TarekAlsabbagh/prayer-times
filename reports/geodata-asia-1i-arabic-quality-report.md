# Asia-1I — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-ASIA-1I`
**Strategy**: E — Strategy E + Stage 3.5 ar-quality gate
**Generated**: 2026-05-17T11:17:51.096Z

## What this report tells you

Same as Americas-1A/1B: Asian Wikipedia ar: tags have moderate
Persian/Urdu/Pashto contamination in GeoNames; Strategy E gate
separates clean Arabic from contaminated. JP/KR/HK/TW/MO CJK East Asia
have strong Arabic Wikipedia coverage for major cities (passes-gate ~70-80%
expected — Japan in particular is well-covered; Macao single PPLC may block).

* Accept the clean (`wikidata`/`arabic_only`) ones in bulk;
* Review and fix the (`mixed_script`/`mixed_latin`/`empty`) ones one by one.

## Quality bucket meanings

| Bucket | Meaning | Default action |
| --- | --- | --- |
| `wikidata`     | Arabic from explicit `ar:` tag in GeoNames altnames | ✅ approve if no collision |
| `arabic_only`  | Untagged altname but characters are 100% pure-Arabic | ✅ approve if no collision |
| `mixed_script` | Contains Persian/Urdu/Pashto letters (پ چ ژ گ ٹ ڈ ڑ ی ک ہ ے ۀ ...) | ⚠️ fix Arabic manually |
| `mixed_latin`  | Contains Latin letters (A-Z) mixed in | ⚠️ fix Arabic manually |
| `mixed_unknown`| Arabic plus other non-Arabic chars we did not catch | ⚠️ inspect manually |
| `empty`        | No Arabic name at all | 🔴 supply manually |

## Aggregate summary (high-tier only)

| Country | high-tier | wikidata | arabic_only | mixed_script | mixed_latin | mixed_unknown | empty | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AZ | 64 | 0 | 50 | 13 | 0 | 1 | 0 | **49** | **15** |
| GE | 6 | 0 | 1 | 5 | 0 | 0 | 0 | **1** | **5** |
| AM | 9 | 0 | 6 | 1 | 2 | 0 | 0 | **6** | **3** |
| **TOTAL** | **79** | **0** | **57** | **19** | **2** | **1** | **0** | **56** | **23** |

## Collision summary (high-tier only)

| Collision type | Count |
| --- | ---: |
| Within Asia-1I wave (NP/LK/MV/BT/BN/MM/KH/LA/TL same slug) | 1 |
| Against existing curated (other cc owns slug already) | 0 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | name.en | pop |
| --- | --- | --- | --- | --- | --- |
| az | pushkino | pushkino-az | بوشكينو | Pushkino | 18182 |

## arabic_only (57)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| az | ganja | جنجا | Ganja | Ganja | PPLA | 335600 | غنجة | 297.75 |  |  |
| az | lankaran | لنكاران | Lankaran | Lankaran | PPLA | 240300 | لنكران | 203.60 |  |  |
| az | tovuz | توز | Tovuz | Tovuz | PPLA | 177200 | توفوز | 363.12 |  |  |
| az | yevlakh | يفلاخ | Yevlakh | Yevlakh | PPLA | 127400 | يفلاخ | 230.84 |  |  |
| am | gyumri | غيومري | Gyumri | Gyumri | PPLA | 114667 | شيراك | 87.96 |  |  |
| az | naxcivan | ناختشيفان | Naxçıvan | Naxçıvan | PPLA | 97200 | ناختشيفان | 403.20 |  |  |
| az | saatli | ساتلي | Saatlı | Saatlı | PPLA | 87000 | سعتلي | 137.91 |  |  |
| az | lerik | لريك | Lerik | Lerik | PPLA | 87000 | ليريك | 220.34 |  |  |
| az | sirvan | سروان | Şirvan | Şirvan | PPLA | 70220 | شيرفان | 95.40 |  |  |
| az | sheki | شكي | Sheki | Sheki | PPLA | 68400 | شكي | 243.07 |  |  |
| am | hrazdan | هرازدان | Hrazdan | Hrazdan | PPLA | 49500 | كوتايك | 41.95 |  |  |
| az | agdam | آغدام | Ağdam | Ağdam | PPLA | 39451 | أغدام | 253.96 |  |  |
| az | khirdalan | خيردالان | Khirdalan | Khirdalan | PPLA | 37949 | أبشيرون | 10.42 |  |  |
| az | xacmaz | خاشماز | Xaçmaz | Xaçmaz | PPLA | 37175 | خاتشماز | 147.34 |  |  |
| az | salyan | ساليان | Salyan | Salyan | PPLA | 36555 | سالين | 117.57 |  |  |
| az | jalilabad | جليلاباد | Jalilabad | Jalilabad | PPLA | 36259 | جليلاباد | 177.74 |  |  |
| az | shamkhor | شامخور | Shamkhor | Shamkhor | PPLA | 35421 | شامكير | 328.21 |  |  |
| az | imishli | إميشلي | Imishli | Imishli | PPLA | 34178 | إيميشلي | 164.87 |  |  |
| am | kapan | قابان | Kapan | Kapan | PPLA | 32900 | سيونيك | 195.07 |  |  |
| az | zaqatala | زاقاتالا | Zaqatala | Zaqatala | PPLA | 32171 | زاكاتالا | 302.55 |  |  |
| az | shamakhi | شماخي | Shamakhi | Shamakhi | PPLA | 29403 | شماخي | 106.51 |  |  |
| az | ismayilli | إسماعيلي | İsmayıllı | İsmayıllı | PPLA | 28776 | إسماعيلي | 150.75 |  |  |
| az | divichibazar | ديفيتشي بازار | Divichibazar | Divichibazar | PPLA | 23248 | شاباران | 115.06 |  |  |
| az | haciqabul | حاجي قابول | Hacıqabul | Hacıqabul | PPLA | 23102 | حاجي قابل | 88.63 |  |  |
| am | artashat | آرتاشات | Artashat | Artashat | PPLA | 22800 | آرارات | 25.99 |  |  |
| az | quba | قوبا | Quba | Quba | PPLA | 22405 | قوبا | 155.40 |  |  |
| am | ijevan | إيجيفان | Ijevan | Ijevan | PPLA | 19500 | تافوش | 93.80 |  |  |
| az | kyurdarmir | كيوردامير | Kyurdarmir | Kyurdarmir | PPLA | 19088 | كوردمير | 145.09 |  |  |
| az | qazax | قازاخ | Qazax | Qazax | PPLA | 18903 | قازاخ | 386.68 |  |  |
| az | susa | سوسا | Şuşa | Şuşa | PPLA | 18662 | شوشا | 274.83 |  |  |
| az | neftcala | نفتجالا | Neftçala | Neftçala | PPLA | 18661 | نفط تشالا | 126.41 |  |  |
| az | pushkino | بوشكينو | Pushkino | Pushkino | PPLA | 18182 | بيلاسوفار | 154.56 | wave | pushkino-az |
| az | goygol | جويجول | Göygöl | Göygöl | PPLA | 17816 | غويغل | 300.64 |  |  |
| am | ashtarak | آشتاراك | Ashtarak | Ashtarak | PPLA | 17600 | أراغاتسوتن | 17.91 |  |  |
| az | aghsu | آغسو | Aghsu | Aghsu | PPLA | 17209 | أغسو | 125.28 |  |  |
| az | qusar | قوسار | Qusar | Qusar | PPLA | 16022 | قوسار | 165.51 |  |  |
| az | ujar | أوجار | Ujar | Ujar | PPLA | 15741 | أوجار | 187.60 |  |  |
| az | beylagan | بيلاجان | Beylagan | Beylagan | PPLA | 15599 | بيلاغان | 203.83 |  |  |
| az | aghstafa | آغستافا | Aghstafa | Aghstafa | PPLA | 12542 | آغستافا | 379.92 |  |  |
| az | qax | قاخ | Qax | Qax | PPLA | 11992 | قاخ | 271.82 |  |  |
| az | zardob | زاردوب | Zardob | Zardob | PPLA | 10612 | زردب | 183.94 |  |  |
| az | yukhary-dashkesan | يوخاري-داشكيسان | Yukhary-Dashkesan | Yukhary-Dashkesan | PPLA | 9900 | داشكيسان | 320.44 |  |  |
| az | masally | ماسالي | Masally | Masally | PPLA | 9604 | مسالي | 184.13 |  |  |
| az | kyadabek | كيادابك | Kyadabek | Kyadabek | PPLA | 8657 | كاداباي | 343.34 |  |  |
| az | kalbajar | كالباجار | Kalbajar | Kalbajar | PPLA | 8400 | كلبجار | 326.05 |  |  |
| az | jebrail | جبرائيل | Jebrail | Jebrail | PPLA | 8396 | جبرائيل | 266.91 |  |  |
| az | yardimli | يارديملي | Yardımlı | Yardımlı | PPLA | 7623 | ياردمالي | 217.40 |  |  |
| az | zangilan | زنجيلان | Zangilan | Zangilan | PPLA | 7483 | زنجيلان | 311.28 |  |  |
| ge | mtskheta | متسختا | Mtskheta | Mtskheta | PPLA | 7380 | موتسخيتا-منيانيتي | 17.02 |  |  |
| az | naftalan | نافتالان | Naftalan | Naftalan | PPLA | 7045 | نفطالان | 258.00 |  |  |
| az | qubadli | قبادلي | Qubadlı | Qubadlı | PPLA | 6890 | قبادلي | 304.30 |  |  |
| az | oguz | أوغوز | Oğuz | Oğuz | PPLA | 6600 | أوغوز | 215.32 |  |  |
| az | samux | سامخ | Samux | Samux | PPLA | 6013 | ساموخ | 294.69 |  |  |
| az | novyy-karanlug | نوفي كارانلوغ | Novyy Karanlug | Novyy Karanlug | PPLA | 5079 | خانكندي | 244.09 |  |  |
| az | qobustan | قوبوستان | Qobustan | Qobustan | PPLA | 3754 | قوبستان | 80.61 |  |  |
| az | xizi | خيزي | Xızı | Xızı | PPLA | 1024 | خيزي | 86.88 |  |  |
| az | kyzyl-burun | قيزيل بورون | Kyzyl-Burun | Kyzyl-Burun | PPLA | 3 | سيازان | 97.66 |  |  |

## mixed_script (19)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| az | sumqayit | سمقاییت | Sumqayıt | Sumqayıt | PPLA | 358675 | سومقاييت | 26.16 |  |  |
| ge | batumi | باتومی | Batumi | Batumi | PPLA | 186949 | أجاريا | 265.58 |  |  |
| az | mingachevir | منجاچویر | Mingachevir | Mingachevir | PPLA | 106048 | مينغاتشيفير | 240.10 |  |  |
| az | agdzhabedy | آغجابیدی | Agdzhabedy | Agdzhabedy | PPLA | 43000 | أغجاباي | 208.26 |  |  |
| az | goeycay | gwے jے | Göyçay | Göyçay | PPLA | 42500 | غويتشاي | 181.58 |  |  |
| ge | gori | گوری | Gori | Gori | PPLA | 41933 | شيدا كارتلي | 66.35 |  |  |
| az | barda | bardہ | Barda | Barda | PPLA | 37372 | باردا | 232.14 |  |  |
| az | sabirabad | سبیر آباد | Sabirabad | Sabirabad | PPLA | 30612 | سابيراباد | 126.17 |  |  |
| am | armavir | آرماویر | Armavir | Armavir | PPLA | 29700 | أرمافير | 40.63 |  |  |
| az | fizuli | فضولی | Fizuli | Fizuli | PPLA | 26765 | فضولي | 248.63 |  |  |
| az | terter | trٹr | Terter | Terter | PPLA | 18185 | تارتر | 248.77 |  |  |
| ge | akhaltsikhe | آخالت سیکه | Akhaltsikhe | Akhaltsikhe | PPLA | 17445 | سامتسخي-جافاخيتي | 153.13 |  |  |
| az | astara | astarہ | Astara | Astara | PPLA | 15190 | أستارا | 233.31 |  |  |
| az | belokany | بلوکانی | Belokany | Belokany | PPLA | 14800 | بالاكان | 325.07 |  |  |
| ge | ozurgeti | ازرگتی | Ozurgeti | Ozurgeti | PPLA | 13935 | غوريا | 234.97 |  |  |
| az | qabala | qbalہ | Qabala | Qabala | PPLA | 11867 | قبلة | 181.89 |  |  |
| az | goranboy | gwranbwayے | Goranboy | Goranboy | PPLA | 10186 | غورنبوي | 261.11 |  |  |
| az | lacin | لاچن | Laçın | Laçın | PPLA | 2300 | لاتشين | 295.20 |  |  |
| ge | ambrolauri | آمبرولائوری | Ambrolauri | Ambrolauri | PPLA | 1952 | راتشا-ليتشخومي | 164.96 |  |  |

## mixed_latin (2)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| am | vanadzor | vanadzۆr | Vanadzor | Vanadzor | PPLA | 78100 | لوري | 68.98 |  |  |
| am | yeghegnadzor | yەghەgnadzۆr | Yeghegnadzor | Yeghegnadzor | PPLA | 7300 | فايوتس دزور | 84.04 |  |  |

## mixed_unknown (1)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| az | agdas | آغ‌داش | Ağdaş | Ağdaş | PPLA | 23528 | أغداش | 203.99 |  |  |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
