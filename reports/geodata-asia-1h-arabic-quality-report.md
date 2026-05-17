# Asia-1H — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-ASIA-1H`
**Strategy**: E — Strategy E + Stage 3.5 ar-quality gate
**Generated**: 2026-05-17T13:06:22.919Z

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
| UZ | 16 | 0 | 8 | 7 | 1 | 0 | 0 | **8** | **8** |
| KZ | 21 | 0 | 12 | 7 | 2 | 0 | 0 | **11** | **10** |
| TJ | 6 | 0 | 5 | 1 | 0 | 0 | 0 | **5** | **1** |
| KG | 6 | 0 | 5 | 0 | 0 | 1 | 0 | **2** | **4** |
| TM | 5 | 0 | 5 | 0 | 0 | 0 | 0 | **5** | **0** |
| MN | 22 | 0 | 12 | 8 | 2 | 0 | 0 | **12** | **10** |
| **TOTAL** | **76** | **0** | **47** | **23** | **5** | **1** | **0** | **43** | **33** |

## Collision summary (high-tier only)

| Collision type | Count |
| --- | ---: |
| Within Asia-1H wave (NP/LK/MV/BT/BN/MM/KH/LA/TL same slug) | 7 |
| Against existing curated (other cc owns slug already) | 0 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | name.en | pop |
| --- | --- | --- | --- | --- | --- |
| uz | guliston | guliston-uz | گلستان | Guliston | 90398 |
| kz | karagandy | karagandy-kz | karagnڈy | Karagandy | 497777 |
| kz | turkestan | turkestan-kz | تركستان | Turkestan | 227098 |
| kg | manas | manas-kg | جلال آباد | Manas | 123239 |
| kg | karakol | karakol-kg | قاراقۆل | Karakol | 84351 |
| kg | naryn | naryn-kg | نارين | Naryn | 41178 |
| kg | talas | talas-kg | تالاس | Talas | 40308 |

## arabic_only (47)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mn | ulan-bator | أولان باتور | Ulan Bator | Ulan Bator | PPLC | 844818 | أولان باتور |  |  |  |
| kz | taraz | تاراز | Taraz | Taraz | PPLA | 358153 | منطقة جامبيل | 446.42 |  |  |
| kz | kyzylorda | قزل اوردا | Kyzylorda | Kyzylorda | PPLA | 354800 | منطقة قيزيلوردا | 829.18 |  |  |
| kz | oral | أورال | Oral | Oral | PPLA | 330000 | كازاخستان الغربية | 1390.61 |  |  |
| kz | pavlodar | بافلودار | Pavlodar | Pavlodar | PPLA | 329002 | منطقة بافلودار | 399.50 |  |  |
| kg | osh | أوش | Osh | Osh | PPLA | 322164 | أوش | 299.47 |  |  |
| uz | fergana | فرغانة | Fergana | Fergana | PPLA | 299200 | منطقة فرغانة | 236.97 |  |  |
| tj | isfara | اسفرة | Isfara | Isfara | PPLA2 | 274000 | منطقة سغد | 237.68 |  |  |
| tj | istaravshan | استروشن | Istaravshan | Istaravshan | PPLA2 | 273500 | منطقة سغد | 154.48 |  |  |
| tm | tuerkmenabat | تركمينابات | Türkmenabat | Türkmenabat | PPLA | 230861 | منطقة لباب | 473.37 |  |  |
| kz | turkestan | تركستان | Turkestan | Turkestan | PPLA | 227098 | منطقة تركستان | 695.71 | wave | turkestan-kz |
| tm | dasoguz | داسوغوز | Daşoguz | Daşoguz | PPLA | 201142 | منطقة داشوغوز | 453.13 |  |  |
| kz | petropavl | بتروبافل | Petropavl | Petropavl | PPLA | 200920 | كازاخستان الشمالية | 439.56 |  |  |
| tj | khujand | خجند | Khujand | Khujand | PPLA | 191000 | منطقة سغد | 207.29 |  |  |
| uz | tirmiz | الترمذ | Tirmiz | Tirmiz | PPLA | 182800 | منطقة صرخندريا | 268.49 |  |  |
| uz | jizzax | جيزاخ | Jizzax | Jizzax | PPLA | 179200 | منطقة جيزاخ | 92.14 |  |  |
| kz | temirtau | تميرتاو | Temirtau | Temirtau | PPLA2 | 170600 | منطقة قاراغندي | 163.49 |  |  |
| tm | mary | ماري | Mary | Mary | PPLA | 167027 | منطقة مرو | 310.64 |  |  |
| uz | chirchiq | تشيرتشيق | Chirchiq | Chirchiq | PPL | 162800 | منطقة طشقند | 34.20 |  |  |
| kz | kokshetau | كوكشيتو | Kokshetau | Kokshetau | PPLA | 150649 | منطقة أقمولا | 273.64 |  |  |
| kz | aktau | آقتاؤ | Aktau | Aktau | PPLA | 147443 | منطقة منغستاو | 1730.91 |  |  |
| uz | urganch | أورجينج | Urganch | Urganch | PPLA | 145000 | منطقة خوارزم | 378.61 |  |  |
| uz | shahrisabz | شهرسبز | Shahrisabz | Shahrisabz | PPL | 142700 | منطقة قشقاديريا | 64.44 |  |  |
| kg | manas | جلال آباد | Manas | Manas | PPLA | 123239 | منطقة تالاس | 251.11 | wave | manas-kg |
| uz | xiva | خيوة | Xiva | Xiva | PPLA2 | 115000 | منطقة خوارزم | 389.50 |  |  |
| tj | bokhtar | بختار | Bokhtar | Bokhtar | PPLA | 110800 | منطقة خاتلون | 77.75 |  |  |
| kz | zhezqazghan | جيزقازغان | Zhezqazghan | Zhezqazghan | PPLA | 104357 | منطقة جيزقازغان | 462.44 |  |  |
| mn | erdenet | إردنيت | Erdenet | Erdenet | PPLA | 97814 | أورخون |  |  |  |
| tm | balkanabat | بالكانابات | Balkanabat | Balkanabat | PPLA | 87822 | منطقة بلخان | 384.20 |  |  |
| kz | baikonur | بايكونور | Baikonur | Baikonur | PPLA | 70000 | منطقة قيزيلوردا | 860.28 |  |  |
| mn | choibalsan | تشويبالسان | Choibalsan | Choibalsan | PPLA | 44835 | دورنود |  |  |  |
| kz | konayev | كونايف | Konayev | Konayev | PPLA | 42167 | منطقة ألما آتا | 73.70 |  |  |
| kg | naryn | نارين | Naryn | Naryn | PPLA | 41178 | منطقة نارين | 199.19 | wave | naryn-kg |
| kg | talas | تالاس | Talas | Talas | PPLA | 40308 | منطقة تالاس | 194.23 | wave | talas-kg |
| mn | moeroen | موران | Mörön | Mörön | PPLA | 39404 | خوبسغول |  |  |  |
| tj | khorugh | خروغ | Khorugh | Khorugh | PPLA | 30500 | كوهستان بدخشان | 269.40 |  |  |
| mn | ulaangom | أولاانجوم | Ulaangom | Ulaangom | PPLA | 30092 | أوبس |  |  |  |
| mn | khovd | خوفد | Khovd | Khovd | PPLA | 29800 | خوفد |  |  |  |
| tm | aenew | آب نو | Änew | Änew | PPLA | 28653 | منطقة أحال | 18.50 |  |  |
| mn | oelgii | أولجي | Ölgii | Ölgii | PPLA | 28400 | بايانخونغور |  |  |  |
| kg | batken | باتكن | Batken | Batken | PPLA | 27730 | منطقة باتكن | 442.15 |  |  |
| mn | undurkhaan | اندورخان | Undurkhaan | Undurkhaan | PPLA | 22741 | خنتي |  |  |  |
| mn | tsetserleg | تسيتسيرليج | Tsetserleg | Tsetserleg | PPLA | 21620 | أرخانغاي |  |  |  |
| mn | altai | ألتاي | Altai | Altai | PPLA | 17617 | غوبي ألطاي |  |  |  |
| mn | dzuunmod | جزون مود | Dzuunmod | Dzuunmod | PPLA | 16953 | توف |  |  |  |
| mn | choyr | تشوير | Choyr | Choyr | PPLA | 10434 | غوفي سومبر |  |  |  |
| uz | amir-timur | أمير تيمور | Amir Timur | Amir Timur | PPLA | - | منطقة طشقند | 39.97 |  |  |

## mixed_script (23)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kz | shymkent | شمکنت | Shymkent | Shymkent | PPLA | 1200000 | شيمكنت | 600.32 |  |  |
| uz | andijon | anڈyjan | Andijon | Andijon | PPLA | 747800 | منطقة أنديجان | 267.10 |  |  |
| kz | karagandy | karagnڈy | Karagandy | Karagandy | PPLA | 497777 | منطقة قاراغندي | 191.82 | wave | karagandy-kz |
| uz | nukus | نؤکیس | Nukus | Nukus | PPLA | 332500 | قرقالباغستان | 504.42 |  |  |
| kz | ust-kamenogorsk | asٹ kamnwګwrsk | Ust-Kamenogorsk | Ust-Kamenogorsk | PPLA | 319067 | كازاخستان الشرقية | 798.30 |  |  |
| kz | atyrau | آتیراؤ | Atyrau | Atyrau | PPLA | 290700 | منطقة أتيراو | 1488.15 |  |  |
| uz | qarshi | قارشی | Qarshi | Qarshi | PPLA | 278300 | منطقة قشقاديريا | 133.01 |  |  |
| tj | konibodom | کان بادام | Konibodom | Konibodom | PPLA2 | 211100 | منطقة سغد | 241.59 |  |  |
| kz | kostanay | قسطنائی | Kostanay | Kostanay | PPLA | 210000 | منطقة قوستاناي | 579.41 |  |  |
| uz | angren | آنگرن، ازبکستان | Angren | Angren | PPL | 191300 | منطقة طشقند | 81.92 |  |  |
| uz | navoiy | ناوائی | Navoiy | Navoiy | PPLA | 144158 | منطقة نوائي | 86.25 |  |  |
| uz | olmaliq | آلمالیق | Olmaliq | Olmaliq | PPL | 133400 | منطقة طشقند | 58.81 |  |  |
| kz | ekibastuz | ئێکیباستوز | Ekibastuz | Ekibastuz | PPLA2 | 121470 | منطقة بافلودار | 275.41 |  |  |
| kz | taldykorgan | taldy kwrګan | Taldykorgan | Taldykorgan | PPLA | 116558 | منطقة جيتيسو | 233.55 |  |  |
| uz | guliston | گلستان | Guliston | Guliston | PPLA | 90398 | منطقة سيرداريا | 97.57 | wave | guliston-uz |
| mn | darhan | darہan | Darhan | Darhan | PPLA | 83883 | دارخان أول |  |  |  |
| mn | bayanhongor | byan hnګwr | Bayanhongor | Bayanhongor | PPLA | 30931 | بايان أولغي |  |  |  |
| mn | arvayheer | arwyہyr | Arvayheer | Arvayheer | PPLA | 29420 | أوبور خانغاي |  |  |  |
| mn | dalandzadgad | dalanzadgaڈ | Dalandzadgad | Dalandzadgad | PPLA | 24863 | أومنوغوبي |  |  |  |
| mn | saynshand | sayshynڈ | Saynshand | Saynshand | PPLA | 19891 | دورنوغوبي |  |  |  |
| mn | bulgan | bwlګan | Bulgan | Bulgan | PPLA | 17348 | بولغان |  |  |  |
| mn | uliastay | awlyastے | Uliastay | Uliastay | PPLA | 16265 | دزافخان |  |  |  |
| mn | mandalgovi | mnڈalgwwy | Mandalgovi | Mandalgovi | PPLA | 12339 | دوندغوبي |  |  |  |

## mixed_latin (5)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| uz | namangan | namngaں | Namangan | Namangan | PPLA | 713220 | منطقة نمنغان | 206.40 |  |  |
| kz | aktobe | aktwbې | Aktobe | Aktobe | PPLA | 500757 | منطقة أكتوبه | 1005.79 |  |  |
| kz | semey | smې | Semey | Semey | PPLA | 292780 | منطقة سيمي | 623.79 |  |  |
| mn | suehbaatar | swkھ batr | Sühbaatar | Sühbaatar | PPLA | 22741 | سوخباتر |  |  |  |
| mn | baruun-urt | barwn arټ | Baruun-Urt | Baruun-Urt | PPLA | 18190 | سوخباتر آيماغ |  |  |  |

## mixed_unknown (1)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kg | karakol | قاراقۆل | Karakol | Karakol | PPLA | 84351 | منطقة إيسيك-كول | 315.31 | wave | karakol-kg |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
