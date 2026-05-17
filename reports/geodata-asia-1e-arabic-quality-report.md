# Asia-1E — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E — Strategy E + Stage 3.5 ar-quality gate
**Generated**: 2026-05-17T10:03:54.575Z

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
| NP | 10 | 0 | 4 | 5 | 1 | 0 | 0 | **4** | **6** |
| LK | 10 | 0 | 7 | 2 | 1 | 0 | 0 | **7** | **3** |
| MV | 18 | 0 | 6 | 8 | 4 | 0 | 0 | **5** | **13** |
| BT | 22 | 0 | 5 | 14 | 3 | 0 | 0 | **5** | **17** |
| BN | 4 | 0 | 3 | 1 | 0 | 0 | 0 | **2** | **2** |
| MM | 20 | 0 | 13 | 7 | 0 | 0 | 0 | **13** | **7** |
| KH | 23 | 0 | 12 | 9 | 2 | 0 | 0 | **11** | **12** |
| LA | 16 | 0 | 8 | 5 | 3 | 0 | 0 | **7** | **9** |
| TL | 12 | 0 | 9 | 3 | 0 | 0 | 0 | **9** | **3** |
| **TOTAL** | **135** | **0** | **67** | **54** | **14** | **0** | **0** | **63** | **72** |

## Collision summary (high-tier only)

| Collision type | Count |
| --- | ---: |
| Within Asia-1E wave (NP/LK/MV/BT/BN/MM/KH/LA/TL same slug) | 6 |
| Against existing curated (other cc owns slug already) | 0 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | name.en | pop |
| --- | --- | --- | --- | --- | --- |
| mv | muli | muli-mv | مولي | Muli | 1008 |
| bt | daga | daga-bt | daګa | Daga | 2243 |
| bn | bangar | bangar-bn | بانجار | Bangar | 3970 |
| kh | kep | kep-kh | كيب | Kep | 35990 |
| la | sekong | sekong-la | سيكونج | Sekong | 20116 |
| tl | same | same-tl | saہmے  mshrqy tymwr | Same | 7500 |

## arabic_only (67)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kh | takeo | تاكيو | Takeo | Takeo | PPLA | 843931 | مقاطعة تاكيو | 64.80 |  |  |
| np | birganj | برغنج | Birgañj | Birgañj | PPL | 268273 | الإقليم الأوسط | 89.30 |  |  |
| np | biratnagar | بيراتناغار | Biratnagar | Biratnagar | PPL | 244750 | الإقليم الشرقي | 238.35 |  |  |
| mm | bago | باغو | Bago | Bago | PPLA | 244376 | منطقة باغو | 63.97 |  |  |
| mm | pathein | باثيين | Pathein | Pathein | PPLA | 237089 | منطقة آيياروادي | 153.58 |  |  |
| np | janakpur | جانكبور | Janakpur | Janakpur | PPLA | 195438 | الإقليم الأوسط | 125.00 |  |  |
| mm | monywa | مونيوا | Monywa | Monywa | PPLA | 182011 | منطقة سعجاينغ | 99.66 |  |  |
| mm | kyaukpyu | كياوكبيو | Kyaukpyu | Kyaukpyu | PPL | 180000 | ولاية راخين | 385.83 |  |  |
| mm | sittwe | سيتوي | Sittwe | Sittwe | PPLA | 177743 | ولاية راخين | 387.61 |  |  |
| mm | myeik | ماييك | Myeik | Myeik | PPL | 173298 | منطقة تاينثاري | 554.66 |  |  |
| lk | jaffna | جافنا | Jaffna | Jaffna | PPLA | 169102 | المقاطعة الشمالية | 273.23 |  |  |
| lk | moratuwa | موراتووا | Moratuwa | Moratuwa | PPL | 168280 | المقاطعة الغربية | 17.28 |  |  |
| mm | taunggyi | تاونجي | Taunggyi | Taunggyi | PPLA | 160115 | ولاية شان | 162.98 |  |  |
| tl | dili | دلي | Dili | Dili | PPLC | 150000 | بلدية ديلي |  |  |  |
| mm | myingyan | ماينجيان | Myingyan | Myingyan | PPL | 141713 | منطقة ماندالاي | 91.19 |  |  |
| lk | negombo | نجومبو | Negombo | Negombo | PPL | 137223 | المقاطعة الغربية | 31.39 |  |  |
| mm | lashio | لاشيو | Lashio | Lashio | PPL | 131000 | ولاية شان | 202.31 |  |  |
| la | savannakhet | سافان ناخيت | Savannakhet | Savannakhet | PPLA | 125760 | مقاطعة سافاناخيت | 274.82 |  |  |
| kh | battambang | باتامبانج | Battambang | Battambang | PPLA | 119251 | مقاطعة باتامبانغ | 75.92 |  |  |
| lk | galle | غالي | Galle | Galle | PPLA | 93118 | المقاطعة الجنوبية | 105.28 |  |  |
| mm | myitkyina | ميتكينا | Myitkyina | Myitkyina | PPLA | 90894 | ولاية كاتشين | 403.38 |  |  |
| la | pakse | باكسي | Pakse | Pakse | PPLA | 77900 | مقاطعة تشامباساك | 463.31 |  |  |
| kh | kampong-cham | كامبونج تشام | Kampong Cham | Kampong Cham | PPLA | 61750 | مقاطعة كامبونغ تشام | 75.87 |  |  |
| la | xam-nua | خام نوا | Xam Nua | Xam Nua | PPLA | 56900 | مقاطعة هوافان | 309.25 |  |  |
| kh | pursat | بورسات | Pursat | Pursat | PPLA | 52476 | مقاطعة بورسات | 92.47 |  |  |
| kh | ta-khmau | تا خماؤ | Ta Khmau | Ta Khmau | PPLA | 52066 | مقاطعة كانديل | 8.46 |  |  |
| mm | hpa-an | هبا آن | Hpa-An | Hpa-An | PPLA | 50000 | ولاية كاين | 155.60 |  |  |
| lk | ratnapura | راتنابورا | Ratnapura | Ratnapura | PPLA | 47832 | مقاطعة سابراغاموا | 65.62 |  |  |
| lk | badulla | بادولا | Badulla | Badulla | PPLA | 47587 | مقاطعة أوفا | 58.14 |  |  |
| kh | kep | كيب | Kep | Kep | PPLA | 35990 | كيب | 136.76 | wave | kep-kh |
| np | dipayal | ديبايال | Dipayal | Dipayal | PPLA | 33968 | الإقليم الغربي البعيد | 319.11 |  |  |
| kh | kampong-speu | كامبونج سبيو | Kampong Speu | Kampong Speu | PPLA | 33231 | مقاطعة كامبونغ سبو | 45.84 |  |  |
| bn | kuala-belait | كوالا بيلايت | Kuala Belait | Kuala Belait | PPLA | 31178 | منطقة بليت |  |  |  |
| lk | kurunegala | كورونيغالا | Kurunegala | Kurunegala | PPLA | 28571 | المقاطعة الشمالية الغربية | 36.31 |  |  |
| mm | hakha | هاخا | Hakha | Hakha | PPLA | 24926 | ولاية تشين | 266.12 |  |  |
| kh | sisophon | سسوفون | Sisophon | Sisophon | PPLA | 23218 | مقاطعة بانتيي مينتشي | 97.28 |  |  |
| kh | kampot | كامبوت | Kampot | Kampot | PPLA | 22691 | مقاطعة كامبوت | 133.06 |  |  |
| tl | maliana | ماليانا | Maliana | Maliana | PPLA | 22000 | بلدية بوبونارو |  |  |  |
| la | pakxan | باكسان | Pakxan | Pakxan | PPLA | 21967 | مقاطعة بوليخامساي | 118.15 |  |  |
| la | sekong | سيكونج | Sekong | Sekong | PPLA | 20116 | مقاطعة سيكونغ | 524.74 | wave | sekong-la |
| bn | tutong | توتونج | Tutong | Tutong | PPLA | 19151 | منطقة توتونغ |  |  |  |
| tl | likisa | ليكيسا | Likisá | Likisá | PPLA | 19000 | بلدية ليكيسا |  |  |  |
| kh | samraong | سامراونج | Samraong | Samraong | PPLA | 18694 | مقاطعة أودار مينتشي | 97.22 |  |  |
| kh | pailin | بايلين | Pailin | Pailin | PPLA | 17850 | مقاطعة بايلين | 145.69 |  |  |
| tl | aileu | آيليو | Aileu | Aileu | PPLA | 17356 | بلدية أيليو |  |  |  |
| mm | loikaw | لويكاو | Loikaw | Loikaw | PPLA | 17293 | ولاية كايا | 279.08 |  |  |
| tl | lospalos | لوسبالوس | Lospalos | Lospalos | PPLA | 17186 | بلدية لاوتيم |  |  |  |
| tl | baukau | باوكاو | Baukau | Baukau | PPLA | 16000 | بلدية باوكاو |  |  |  |
| la | phongsali | فونغسالي | Phôngsali | Phôngsali | PPLA | 13500 | مقاطعة فونغسالي | 415.74 |  |  |
| la | sainyabuli | سايني آبولي | Sainyabuli | Sainyabuli | PPLA | 13500 | مقاطعة سايابولي | 172.54 |  |  |
| tl | ainaro | آينارو | Ainaro | Ainaro | PPLA | 12000 | بلدية أينارو |  |  |  |
| bt | paro | بارو | Paro | Paro | PPLA | 11448 | دزونغخاغ بارو |  |  |  |
| mv | hithadhoo | هيثاذو | Hithadhoo | Hithadhoo | PPLA | 9927 | أتول سيينو | 533.12 |  |  |
| kh | sen-monorom | سن مونوروم | Sen Monorom | Sen Monorom | PPLA | 7944 | مقاطعة موندولكيري | 265.36 |  |  |
| bt | jakar | جاكار | Jakar | Jakar | PPLA | 6243 | دزونغخاغ بومثانغ |  |  |  |
| tl | viqueque | فيكيك | Viqueque | Viqueque | PPLA | 6078 | بلدية فيكيكي |  |  |  |
| la | salavan | سالافان | Salavan | Salavan | PPLA | 5521 | مقاطعة سالافان | 474.63 |  |  |
| bn | bangar | بانجار | Bangar | Bangar | PPLA | 3970 | منطقة تمبورنغ |  | wave | bangar-bn |
| mv | dhihdhoo | ذيذو | Dhihdhoo | Dhihdhoo | PPLA | 3039 | أتول هاء ألف | 304.71 |  |  |
| mv | viligili | فيليجيلي | Viligili | Viligili | PPLA | 2925 | أتول غاف ألف | 379.99 |  |  |
| bt | tsimasham | تسيماشام | Tsimasham | Tsimasham | PPLA | 2855 | دزونغخاغ تشوكا |  |  |  |
| tl | manatutu | مانتوتو | Manatutu | Manatutu | PPLA | 1924 | بلدية مانتوتو |  |  |  |
| mv | ungoofaaru | أن جوفارو | Un’goofaaru | Un’goofaaru | PPLA | 1575 | أتول راء | 174.25 |  |  |
| bt | ha | ها | Ha | Ha | PPLA | 1449 | دزونغخاغ هاآ |  |  |  |
| mv | veymandoo | فيمندو | Veymandoo | Veymandoo | PPLA | 1100 | أتول ثاء | 225.75 |  |  |
| mv | muli | مولي | Muli | Muli | PPLA | 1008 | أتول ميم | 139.65 | wave | muli-mv |
| bt | gasa | غاسا | Gasa | Gasa | PPLA | 548 | دزونغخاغ غاسا |  |  |  |

## mixed_script (54)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mm | mawlamyine | ماولامیئن | Mawlamyine | Mawlamyine | PPLA | 438861 | ولاية مون | 159.79 |  |  |
| np | bharatpur | باراتپور، نپال | Bharatpur | Bharatpur | PPL | 369377 | باغماتي | 73.66 |  |  |
| mm | amarapura | امراپورا | Amarapura | Amarapura | PPLA3 | 237618 | منطقة ماندالاي | 7.09 |  |  |
| np | hetauda | ہیٹوڈا | Hetauda | Hetauda | PPL | 195951 | باغماتي | 43.11 |  |  |
| lk | maharagama | ماهاراگاما | Maharagama | Maharagama | PPL | 195355 | المقاطعة الغربية | 11.37 |  |  |
| np | butwal | bٹwal | Butwāl | Butwāl | PPLA | 195054 | إقليم لومبيني | 77.39 |  |  |
| mm | meiktila | میئکتیلا | Meiktila | Meiktila | PPL | 177442 | منطقة ماندالاي | 122.55 |  |  |
| np | birendranagar | بریندرنگر | Birendranagar | Birendranagar | PPLA | 154886 | الإقليم الأوسط الغربي | 235.67 |  |  |
| mm | dawei | داوئی | Dawei | Dawei | PPLA | 136783 | منطقة تاينثاري | 375.30 |  |  |
| mm | pyay | پیاے | Pyay | Pyay | PPL | 135308 | منطقة باغو | 242.29 |  |  |
| mm | hinthada | حینتھادا | Hinthada | Hinthada | PPL | 134947 | منطقة آيياروادي | 117.78 |  |  |
| np | madhyapur-thimi | مدھیہپور تھمی | Madhyapur Thimi | Madhyapur Thimi | PPL | 119955 | باغماتي | 7.46 |  |  |
| lk | trincomalee | ترنکومالی | Trincomalee | Trincomalee | PPLA | 108420 | المقاطعة الشرقية | 157.43 |  |  |
| bt | thimphu | تىمپۇ | Thimphu | Thimphu | PPLC | 98676 | دزونغخاغ ثيمفو |  |  |  |
| mm | magway | mygwے | Magway | Magway | PPLA | 96954 | منطقة ماغواي | 234.26 |  |  |
| bn | bandar-seri-begawan | باندار سەرى بەگاۋان | Bandar Seri Begawan | Bandar Seri Begawan | PPLC | 64409 | بروناي ومووارا |  |  |  |
| la | luang-prabang | لوآنگ پرابانگ | Luang Prabang | Luang Prabang | PPLA | 55027 | مقاطعة لوانغ برابانغ | 219.14 |  |  |
| kh | koh-kong | kwہ kang | Koh Kong | Koh Kong | PPLA | 33134 | مقاطعة كوه كونغ | 211.90 |  |  |
| kh | prey-veng | pryے wyng | Prey Veng | Prey Veng | PPLA | 33079 | مقاطعة بريي فينغ | 43.95 |  |  |
| kh | suong | swwnګ | Suong | Suong | PPLA | 30000 | مقاطعة تبونغ خموم | 88.76 |  |  |
| bt | phuntsholing | پھونتشولنگ | Phuntsholing | Phuntsholing | PPL | 27658 | دزونغخاغ تشوكا |  |  |  |
| kh | stung-treng | sٹng ٹrng | Stung Treng | Stung Treng | PPLA | 25000 | مقاطعة ستونغ ترينغ | 230.33 |  |  |
| la | muang-xay | mwang saے | Muang Xay | Muang Xay | PPLA | 25000 | مقاطعة أودومكساي | 309.66 |  |  |
| kh | tbeng-meanchey | تبنج میانچی | Tbeng Meanchey | Tbeng Meanchey | PPLA | 24380 | مقاطعة بريا فيهيار | 132.14 |  |  |
| kh | svay-rieng | swې rynګ | Svay Rieng | Svay Rieng | PPLA | 23956 | مقاطعة سواي رينغ | 108.33 |  |  |
| bt | tsirang | tsyranګ | Tsirang | Tsirang | PPLA | 22376 | دزونغخاغ تسيرانغ |  |  |  |
| tl | suai | سوائی | Suai | Suai | PPLA | 21539 | بلدية كوفا ليما |  |  |  |
| kh | kratie | kryٹy | Kratié | Kratié | PPLA | 19975 | مقاطعة كراتيي | 157.48 |  |  |
| kh | kampong-thom | kmpwng ٹm | Kampong Thom | Kampong Thom | PPLA | 19951 | مقاطعة كامبونغ تهوم | 128.47 |  |  |
| kh | banlung | بانلنگ | Banlung | Banlung | PPLA | 17000 | مقاطعة راتاناكيري | 329.88 |  |  |
| bt | pemagatshel | pymaګtshyl | Pemagatshel | Pemagatshel | PPLA | 13864 | دزونغخاغ بيماغاتشيل |  |  |  |
| la | ban-houayxay | ban ہwayے saے | Ban Houayxay | Ban Houayxay | PPLA | 12500 | مقاطعة بوكيو | 345.31 |  |  |
| mv | fuvahmulah | fwwہ mwlaہ | Fuvahmulah | Fuvahmulah | PPLA | 11140 | أتول غنافياني | 497.61 |  |  |
| bt | sarpang | sarpnګ | Sarpang | Sarpang | PPLA | 10416 | دزونغخاغ سارباغ |  |  |  |
| la | muang-phon-hong | mwang fwn-ہang | Muang Phôn-Hông | Muang Phôn-Hông | PPLA | 10112 | مقاطعة فينتيان | 62.19 |  |  |
| bt | samdrup-jongkhar | samdrwp jwnګkhar | Samdrup Jongkhar | Samdrup Jongkhar | PPLA | 9325 | دزونغخاغ سامدروب جونغخار |  |  |  |
| bt | wangdue-phodrang | wangdyw fwڈrang | Wangdue Phodrang | Wangdue Phodrang | PPLA | 8954 | دزونغخاغ وانغديو فودرانغ |  |  |  |
| tl | same | saہmے  mshrqy tymwr | Same | Same | PPLA | 7500 | بلدية مانوفاي |  | wave | same-tl |
| mv | thinadhoo | tھynaڈھw | Thinadhoo | Thinadhoo | PPLA | 6376 | أتول غاف داال | 409.23 |  |  |
| tl | pante-makasar | pantے makasar | Pante Makasar | Pante Makasar | PPLA | 4730 | بلدية أوي-كوسي |  |  |  |
| la | attapeu | aٹapyw | Attapeu | Attapeu | PPLA | 4297 | مقاطعة أتابو | 569.56 |  |  |
| bt | trashi-yangtse | trashy yanګtsې | Trashi Yangtse | Trashi Yangtse | PPLA | 3025 | دزونغخاغ تراشي يانغتسي |  |  |  |
| bt | mongar | mwnګar | Mongar | Mongar | PPLA | 2969 | دزونغخاغ مونغار |  |  |  |
| mv | funadhoo | fna ڈھw | Funadhoo | Funadhoo | PPLA | 2900 | أتول شافياني | 220.99 |  |  |
| bt | trongsa | trwnګsa | Trongsa | Trongsa | PPLA | 2805 | دزونغخاغ ترونغسا |  |  |  |
| bt | daga | daګa | Daga | Daga | PPLA | 2243 | دزونغخاغ داغانا |  | wave | daga-bt |
| mv | mahibadhoo | maہy badھw | Mahibadhoo | Mahibadhoo | PPLA | 2156 | أتول أليف داال | 75.88 |  |  |
| mv | fonadhoo | fwna ڈھw | Fonadhoo | Fonadhoo | PPLA | 1773 | أتول لافياني | 260.54 |  |  |
| mv | manadhoo | mnaڈھw | Manadhoo | Manadhoo | PPLA | 1580 | أتول نون | 177.27 |  |  |
| mv | kudahuvadhoo | kڈaہwwadھw | Kudahuvadhoo | Kudahuvadhoo | PPLA | 1562 | أتول داال | 180.71 |  |  |
| bt | trashigang | trashyګnګ | Trashigang | Trashigang | PPLA | 872 | دزونغخاغ تراشيغانغ |  |  |  |
| bt | shemgang | shymګnګ | Shemgang | Shemgang | PPLA | 852 | دزونغخاغ زهيمغانغ |  |  |  |
| mv | felidhoo | fyly ڈھw | Felidhoo | Felidhoo | PPLA | 541 | أتول فآفو | 78.36 |  |  |
| bt | lungtenzampa | lnګtnzmpa | Lungtenzampa | Lungtenzampa | PPLA | - | دزونغخاغ ثيمفو |  |  |  |

## mixed_latin (14)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| la | thakhek | tھakhyk | Thakhèk | Thakhèk | PPLA | 90800 | مقاطعة خامواني | 241.14 |  |  |
| kh | kampong-chhnang | kmpwng chھnang | Kampong Chhnang | Kampong Chhnang | PPLA | 75244 | مقاطعة كامبونغ تشنانغ | 82.21 |  |  |
| kh | sihanoukville | syhanwk wېl | Sihanoukville | Sihanoukville | PPLA | 73036 | مقاطعة سيهانوكفيل | 185.42 |  |  |
| lk | anuradhapura | anwrad ھa pwra | Anuradhapura | Anuradhapura | PPLA | 60943 | المقاطعة الشمالية الوسطى | 116.17 |  |  |
| la | muang-phonsavan | مواang فونسافان | Muang Phônsavan | Muang Phônsavan | PPLA | 37507 | مقاطعة شيانغ خوانغ | 174.11 |  |  |
| np | dhankuta | dھnkwta | Dhankutā | Dhankutā | PPLA | 22084 | الإقليم الشرقي | 214.57 |  |  |
| bt | punakha | pwnakھa | Punākha | Punākha | PPLA | 21500 | دزونغخاغ بوناخا |  |  |  |
| mv | kulhudhuffushi | kwlھwdwfwshy | Kulhudhuffushi | Kulhudhuffushi | PPLA | 9500 | أتول هاء داال | 276.36 |  |  |
| bt | samtse | samtsې | Samtse | Samtse | PPLA | 5396 | دزونغخاغ سامتسي |  |  |  |
| mv | naifaru | nayy farwں | Naifaru | Naifaru | PPLA | 5044 | أتول لافياني | 141.99 |  |  |
| la | luang-namtha | lwang namtھa | Luang Namtha | Luang Namtha | PPLA | 3225 | مقاطعة لوانغ نامتا | 354.87 |  |  |
| mv | eydhafushi | ayydھa fwshy | Eydhafushi | Eydhafushi | PPLA | 2808 | أتول بآا | 114.04 |  |  |
| bt | lhuentse | lhwyntsې | Lhuentse | Lhuentse | PPLA | 1935 | دزونغخاغ لهونتسي |  |  |  |
| mv | nilandhoo | nylandھw | Nilandhoo | Nilandhoo | PPLA | - | أتول فآاف | 142.13 |  |  |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
