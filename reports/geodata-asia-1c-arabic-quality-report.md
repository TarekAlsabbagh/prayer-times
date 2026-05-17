# Asia-1C — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-ASIA-1C`
**Strategy**: E — Strategy E + Stage 3.5 ar-quality gate
**Generated**: 2026-05-17T07:44:15.396Z

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
| JP | 67 | 0 | 54 | 9 | 0 | 4 | 0 | **53** | **14** |
| KR | 20 | 0 | 13 | 7 | 0 | 0 | 0 | **13** | **7** |
| HK | 2 | 0 | 1 | 1 | 0 | 0 | 0 | **1** | **1** |
| TW | 7 | 0 | 4 | 2 | 1 | 0 | 0 | **4** | **3** |
| MO | 1 | 0 | 0 | 0 | 0 | 1 | 0 | **0** | **1** |
| **TOTAL** | **97** | **0** | **72** | **19** | **1** | **5** | **0** | **71** | **26** |

## Collision summary (high-tier only)

| Collision type | Count |
| --- | ---: |
| Within Asia-1C wave (JP/KR/HK/TW/MO same slug) | 2 |
| Against existing curated (other cc owns slug already) | 0 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | name.en | pop |
| --- | --- | --- | --- | --- | --- |
| jp | fuji | fuji-jp | فوجي | Fuji | 245392 |
| kr | andong | andong-kr | آندونگ | Andong | 153348 |

## arabic_only (72)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tw | taichung | تاي شانغ | Taichung | Taichung | PPLA2 | 2850285 | تايوان (مقاطعة) | 132.86 |  |  |
| kr | daegu | دائجو | Daegu | Daegu | PPLA | 2365523 | دايغو | 88.43 |  |  |
| tw | tainan | تاينان | Tainan | Tainan | PPLA2 | 1856642 | تايوان (مقاطعة) | 265.37 |  |  |
| jp | kawasaki | كاواساكي | Kawasaki | Kawasaki | PPLA2 | 1538262 | كاناغاوا | 11.16 |  |  |
| kr | daejeon | دائجئون | Daejeon | Daejeon | PPLA | 1441203 | دايجون | 137.15 |  |  |
| kr | gwangju | غوانغجو | Gwangju | Gwangju | PPLA | 1401235 | غوانغجو | 196.36 |  |  |
| jp | saitama | سايتاما | Saitama | Saitama | PPLA | 1324854 | سايتاما | 25.79 |  |  |
| kr | suwon | سوون | Suwon | Suwon | PPLA | 1234582 | غيونغي | 30.74 |  |  |
| kr | ulsan | ألسان | Ulsan | Ulsan | PPLA | 1098421 | أولسان | 45.38 |  |  |
| kr | changwon | تشانغوون | Changwon | Changwon | PPLA | 1025702 | كيونغسانغ الجنوبية | 36.24 |  |  |
| jp | chiba | تشيبا | Chiba | Chiba | PPLA | 979768 | تشيبا | 42.99 |  |  |
| jp | kitakyushu | كيتاكيوشو | Kitakyushu | Kitakyushu | PPLA2 | 940978 | فوكوكا | 50.66 |  |  |
| kr | cheongju-si | تشيونغجو | Cheongju-si | Cheongju-si | PPLA | 852147 | تشونغتشيونغ الشمالية | 112.86 |  |  |
| jp | hamamatsu | هاماماتسو | Hamamatsu | Hamamatsu | PPLA2 | 791707 | شيزوكا | 92.44 |  |  |
| jp | sagamihara | ساغاميهارا | Sagamihara | Sagamihara | PPLA2 | 720780 | كاناغاوا | 38.41 |  |  |
| jp | shizuoka | شيزوكا | Shizuoka | Shizuoka | PPLA | 693389 | شيزوكا | 124.95 |  |  |
| kr | cheonan | تشونان | Cheonan | Cheonan | PPL | 658831 | تشونغتشيونغ الجنوبية | 82.41 |  |  |
| kr | jeonju | جئونجو | Jeonju | Jeonju | PPLA | 638421 | جيولا الشمالية | 185.99 |  |  |
| jp | kawaguchi | كاواغوتشي | Kawaguchi | Kawaguchi | PPLA2 | 607373 | سايتاما | 15.35 |  |  |
| jp | kagoshima | كاغوشيما | Kagoshima | Kagoshima | PPLA | 595049 | كاغوشيما | 146.03 |  |  |
| jp | hachioji | هاتشيؤوجي | Hachiōji | Hachiōji | PPLA2 | 579355 | طوكيو | 29.57 |  |  |
| jp | himeji | هيميجي | Himeji | Himeji | PPLA2 | 530495 | هيوغو | 47.41 |  |  |
| jp | matsuyama | ماتسوياما | Matsuyama | Matsuyama | PPLA | 511192 | إيهيمي | 67.12 |  |  |
| jp | matsudo | ماتسودو | Matsudo | Matsudo | PPLA2 | 498575 | تشيبا | 25.44 |  |  |
| tw | hsinchu | سين شو | Hsinchu | Hsinchu | PPLA2 | 453536 | تايوان (مقاطعة) | 65.36 |  |  |
| jp | fujisawa | فوجيساوا | Fujisawa | Fujisawa | PPLA2 | 439728 | كاناغاوا | 18.00 |  |  |
| jp | kashiwa | كاشيوا | Kashiwa | Kashiwa | PPLA2 | 433436 | تشيبا | 36.03 |  |  |
| jp | machida | ماتشيدا | Machida | Machida | PPLA2 | 431079 | طوكيو | 20.06 |  |  |
| jp | toyota | تويوتا | Toyota | Toyota | PPLA2 | 426162 | آيتشي | 24.68 |  |  |
| jp | takamatsu | تاكاماتسو | Takamatsu | Takamatsu | PPLA | 418994 | كاغاوا | 112.20 |  |  |
| jp | yokosuka | يوكوسوكا | Yokosuka | Yokosuka | PPLA2 | 409478 | كاناغاوا | 18.00 |  |  |
| jp | okazaki | أوكازاكي | Okazaki | Okazaki | PPLA2 | 384654 | آيتشي | 34.97 |  |  |
| jp | ichinomiya | إيتشينوميا | Ichinomiya | Ichinomiya | PPLA2 | 380073 | آيتشي | 16.35 |  |  |
| jp | takasaki | تاكاساكي | Takasaki | Takasaki | PPLA2 | 372973 | غونما | 92.67 |  |  |
| jp | nara-shi | نارا | Nara-shi | Nara-shi | PPLA | 367353 | نارا | 27.68 |  |  |
| tw | keelung | كي لنغ | Keelung | Keelung | PPLA2 | 362487 | تايوان (مقاطعة) | 20.76 |  |  |
| jp | kawagoe | كاواغويه | Kawagoe | Kawagoe | PPLA2 | 354571 | سايتاما | 29.82 |  |  |
| jp | koshigaya | كوشيغايا | Koshigaya | Koshigaya | PPLA2 | 345353 | سايتاما | 26.91 |  |  |
| jp | otsu | أوتسو | Ōtsu | Ōtsu | PPLA | 345070 | شيغا | 9.07 |  |  |
| jp | nakano | ناكانو | Nakano | Nakano | PPLA2 | 344880 | طوكيو | 3.59 |  |  |
| jp | tokorozawa | توكوروزاوا | Tokorozawa | Tokorozawa | PPLA2 | 344194 | سايتاما | 21.32 |  |  |
| jp | koriyama | كورياما | Kōriyama | Kōriyama | PPLA2 | 327692 | فوكوشيما | 202.56 |  |  |
| jp | kasugai | كاسوغاي | Kasugai | Kasugai | PPLA2 | 308681 | آيتشي | 9.47 |  |  |
| jp | yokkaichi | يوكايتشي | Yokkaichi | Yokkaichi | PPLA2 | 305424 | ميي | 35.59 |  |  |
| jp | kurume | كورومي | Kurume | Kurume | PPLA2 | 303579 | فوكوكا | 32.25 |  |  |
| jp | aomori | آوموري | Aomori | Aomori | PPLA | 298394 | آوموري | 254.88 |  |  |
| jp | morioka | موريوكا | Morioka | Morioka | PPLA | 290700 | إيواتي | 374.20 |  |  |
| jp | ibaraki | إباراكي | Ibaraki | Ibaraki | PPLA2 | 287730 | أوساكا | 14.92 |  |  |
| kr | chuncheon | تشنتشون | Chuncheon | Chuncheon | PPLA | 284855 | كانغوون | 74.82 |  |  |
| jp | ichihara | إيتشيهارا | Ichihara | Ichihara | PPLA2 | 283531 | تشيبا | 41.13 |  |  |
| jp | hakodate | هاكوداته | Hakodate | Hakodate | PPLA2 | 275730 | هوكايدو | 151.72 |  |  |
| jp | nagaoka | ناغاوكا | Nagaoka | Nagaoka | PPLA2 | 266936 | نييغاتا | 209.79 |  |  |
| jp | shimonoseki | شيمونوسكي | Shimonoseki | Shimonoseki | PPL | 265684 | ياماغوتشي | 64.01 |  |  |
| jp | hiratsuka | هيراتسوكا | Hiratsuka | Hiratsuka | PPLA2 | 258422 | كاناغاوا | 30.15 |  |  |
| jp | fuji | فوجي | Fuji | Fuji | PPLA2 | 245392 | شيزوكا | 91.94 | wave | fuji-jp |
| jp | chigasaki | تشيغاساكي | Chigasaki | Chigasaki | PPLA2 | 242798 | كاناغاوا | 24.31 |  |  |
| jp | tsukuba | تسوكوبا | Tsukuba | Tsukuba | PPLA2 | 241656 | إيباراكي | 61.77 |  |  |
| jp | matsumoto | ماتسوموتو | Matsumoto | Matsumoto | PPLA2 | 241145 | ناغانو | 151.13 |  |  |
| kr | osan | اوسان | Osan | Osan | PPL | 238788 | غيونغي | 46.77 |  |  |
| jp | saga | ساغا | Saga | Saga | PPLA | 233301 | ساغا | 40.81 |  |  |
| jp | kasukabe | كاسوكابي | Kasukabe | Kasukabe | PPLA2 | 229792 | سايتاما | 35.28 |  |  |
| jp | takarazuka | تاكارازوكا | Takarazuka | Takarazuka | PPLA2 | 226432 | هيوغو | 17.73 |  |  |
| jp | ota | أوتا | Ōta | Ōta | PPLA2 | 224358 | غونما | 73.91 |  |  |
| jp | kure | كورشي | Kure | Kure | PPLA2 | 214592 | هيروشيما | 19.86 |  |  |
| jp | isesaki | إسيساكي | Isesaki | Isesaki | PPLA2 | 211850 | غونما | 81.93 |  |  |
| kr | chungju | تشنغجو | Chungju | Chungju | PPL | 209483 | تشونغتشيونغ الشمالية | 106.67 |  |  |
| jp | nagareyama | ناغاره ياما | Nagareyama | Nagareyama | PPLA2 | 200136 | تشيبا | 30.32 |  |  |
| jp | yamaguchi | ياماغوتشي | Yamaguchi | Yamaguchi | PPLA | 193966 | ياماغوتشي | 93.56 |  |  |
| jp | kofu | كوفو | Kofu | Kofu | PPLA | 189591 | ياماناشي | 97.89 |  |  |
| jp | tottori-shi | توتوري | Tottori-shi | Tottori-shi | PPLA | 188465 | توتوري | 125.59 |  |  |
| kr | muan | موآن | Muan | Muan | PPLA | 92009 | جيولا الجنوبية | 237.20 |  |  |
| hk | central | سنترال | Central | Central | PPLA | 11077 | سنترال | 4.19 |  |  |

## mixed_script (19)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tw | kaohsiung | kawhsywnګ | Kaohsiung | Kaohsiung | PPLA | 2737660 | كاوهسيونغ | 297.38 |  |  |
| kr | jeju-city | jyjw sٹy | Jeju City | Jeju City | PPLA | 488844 | جيجو | 299.05 |  |  |
| jp | fukuyama | فوکویاما | Fukuyama | Fukuyama | PPLA2 | 468812 | هيروشيما | 84.29 |  |  |
| kr | sejong | سئجونگ | Sejong | Sejong | PPLA | 394630 | سيجونغ | 109.28 |  |  |
| jp | suita | سوئیتا، اوساکا | Suita | Suita | PPLA2 | 385567 | أوساكا | 7.63 |  |  |
| kr | yangsan | سانگ‌سان | Yangsan | Yangsan | PPLA2 | 358074 | كيونغسانغ الجنوبية | 18.46 |  |  |
| jp | iwaki | ایواکی، فوکوشیما | Iwaki | Iwaki | PPLA2 | 357309 | فوكوشيما | 188.48 |  |  |
| jp | asahikawa | آساهیکاوا، هوکایدو | Asahikawa | Asahikawa | PPLA2 | 333530 | هوكايدو | 113.45 |  |  |
| jp | akita | آکیتا | Akita | Akita | PPLA | 307672 | أكيتا | 386.02 |  |  |
| kr | iksan | اکسان | Iksan | Iksan | PPL | 307000 | جيولا الشمالية | 169.63 |  |  |
| jp | akashi | آکاشی | Akashi | Akashi | PPLA2 | 303601 | هيوغو | 17.68 |  |  |
| hk | tin-shui-wai | تین شوی وای | Tin Shui Wai | Tin Shui Wai | PPL | 282400 | يوين لونغ | 22.99 |  |  |
| kr | yeosu | یئوسو | Yeosu | Yeosu | PPLA2 | 268823 | جيولا الجنوبية | 136.96 |  |  |
| jp | sasebo | ساسه‌بو، ناگازاکی | Sasebo | Sasebo | PPLA2 | 243223 | ناغازاكي | 48.62 |  |  |
| jp | atsugi | آتسوگی، کاناگاوا | Atsugi | Atsugi | PPLA2 | 223960 | كاناغاوا | 24.34 |  |  |
| jp | matsue | ماتسو، شیمانے | Matsue | Matsue | PPLA | 203616 | شيمانه | 133.59 |  |  |
| kr | andong | آندونگ | Andong | Andong | PPLA | 153348 | كيونغسانغ الشمالية | 157.44 | wave | andong-kr |
| kr | hongseong | هانگ سئونگ | Hongseong | Hongseong | PPLA | 89174 | تشونغتشيونغ الجنوبية | 95.18 |  |  |
| tw | jincheng | jynchynګ | Jincheng | Jincheng | PPLA | 37507 | فوجيان (تايوان) | 334.74 |  |  |

## mixed_latin (1)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tw | zhongxing-new-village | zhwngshng nya gawں | Zhongxing New Village | Zhongxing New Village | PPLA | 25549 | تايوان (مقاطعة) | 148.97 |  |  |

## mixed_unknown (5)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| mo | macau | ئاۋمېن | Macau | Macau | PPLC | 649335 | ماكاو |  |  |  |
| jp | higashiosaka | هيغاشيوساكا، أوساكا | Higashiosaka | Higashiosaka | PPLA2 | 493940 | أوساكا | 8.00 |  |  |
| jp | kurashiki | كوراشيكي، أوكاياما | Kurashiki | Kurashiki | PPLA2 | 483576 | أوكاياما | 122.19 |  |  |
| jp | hirakata | هيراكاتا، أوساكا | Hirakata | Hirakata | PPLA2 | 406331 | أوساكا | 18.91 |  |  |
| jp | toyohashi | تويوهاشي، آيتشي | Toyohashi | Toyohashi | PPLA2 | 377453 | آيتشي | 63.36 |  |  |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
