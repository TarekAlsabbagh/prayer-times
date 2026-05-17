# JP GeoNames Import Report — Asia-1C

**Country**: Japan (اليابان)
**Wave**: `CURATED-GEODATA-ASIA-1C`
**Strategy**: E (popMin 200000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-17T07:44:14.652Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/jp-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/jp-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/jp-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `asia-1c-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 45022 |
| existing (matched, no action)     | 92 |
| **pending — high tier**           | **67** |
| pending — medium tier             | 0 |
| pending — low tier                | 358 |
| needs_review                      | 44505 |
| rejected                          | 0 |
| collisions in this wave (high)    | 1 |
| collisions against existing curated (high) | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 54 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 9 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 4 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 53
**Blocked by ar-gate (high-tier):** 14

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`, `timezone`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | tz | nearestKm | nearest | arQuality | collision | suggestedRename | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | kawasaki | كاواساكي | Kawasaki | Kawasaki | jp | PPLA2 | 1538262 | كاناغاوا | 35.5206 | 139.7172 | Asia/Tokyo | 11.16 | yokohama | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | saitama | سايتاما | Saitama | Saitama | jp | PPLA | 1324854 | سايتاما | 35.9081 | 139.6566 | Asia/Tokyo | 25.79 | tokyo | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | chiba | تشيبا | Chiba | Chiba | jp | PPLA | 979768 | تشيبا | 35.6000 | 140.1167 | Asia/Tokyo | 42.99 | tokyo | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | kitakyushu | كيتاكيوشو | Kitakyushu | Kitakyushu | jp | PPLA2 | 940978 | فوكوكا | 33.8518 | 130.8503 | Asia/Tokyo | 50.66 | fukuoka | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | hamamatsu | هاماماتسو | Hamamatsu | Hamamatsu | jp | PPLA2 | 791707 | شيزوكا | 34.7000 | 137.7333 | Asia/Tokyo | 92.44 | nagoya | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | sagamihara | ساغاميهارا | Sagamihara | Sagamihara | jp | PPLA2 | 720780 | كاناغاوا | 35.5671 | 139.2417 | Asia/Tokyo | 38.41 | yokohama | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | shizuoka | شيزوكا | Shizuoka | Shizuoka | jp | PPLA | 693389 | شيزوكا | 34.9833 | 138.3833 | Asia/Tokyo | 124.95 | yokohama | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | kawaguchi | كاواغوتشي | Kawaguchi | Kawaguchi | jp | PPLA2 | 607373 | سايتاما | 35.8052 | 139.7107 | Asia/Tokyo | 15.35 | tokyo | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | kagoshima | كاغوشيما | Kagoshima | Kagoshima | jp | PPLA | 595049 | كاغوشيما | 31.5667 | 130.5500 | Asia/Tokyo | 146.03 | nagasaki | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | hachioji | هاتشيؤوجي | Hachiōji | Hachiōji | jp | PPLA2 | 579355 | طوكيو | 35.6558 | 139.3239 | Asia/Tokyo | 29.57 | tokyo | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | himeji | هيميجي | Himeji | Himeji | jp | PPLA2 | 530495 | هيوغو | 34.8167 | 134.7000 | Asia/Tokyo | 47.41 | kobe | arabic_only |  |  | 95 | pop_gte_200000 |
| ✅ | matsuyama | ماتسوياما | Matsuyama | Matsuyama | jp | PPLA | 511192 | إيهيمي | 33.8392 | 132.7657 | Asia/Tokyo | 67.12 | hiroshima | arabic_only |  |  | 95 | always_include:PPLA |
| ✅ | matsudo | ماتسودو | Matsudo | Matsudo | jp | PPLA2 | 498575 | تشيبا | 35.7799 | 139.9014 | Asia/Tokyo | 25.44 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | fujisawa | فوجيساوا | Fujisawa | Fujisawa | jp | PPLA2 | 439728 | كاناغاوا | 35.3493 | 139.4767 | Asia/Tokyo | 18.00 | yokohama | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | kashiwa | كاشيوا | Kashiwa | Kashiwa | jp | PPLA2 | 433436 | تشيبا | 35.8622 | 139.9773 | Asia/Tokyo | 36.03 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | machida | ماتشيدا | Machida | Machida | jp | PPLA2 | 431079 | طوكيو | 35.5403 | 139.4508 | Asia/Tokyo | 20.06 | yokohama | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | toyota | تويوتا | Toyota | Toyota | jp | PPLA2 | 426162 | آيتشي | 35.0833 | 137.1500 | Asia/Tokyo | 24.68 | nagoya | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | takamatsu | تاكاماتسو | Takamatsu | Takamatsu | jp | PPLA | 418994 | كاغاوا | 34.3333 | 134.0500 | Asia/Tokyo | 112.20 | kobe | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | yokosuka | يوكوسوكا | Yokosuka | Yokosuka | jp | PPLA2 | 409478 | كاناغاوا | 35.2836 | 139.6672 | Asia/Tokyo | 18.00 | yokohama | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | okazaki | أوكازاكي | Okazaki | Okazaki | jp | PPLA2 | 384654 | آيتشي | 34.9500 | 137.1667 | Asia/Tokyo | 34.97 | nagoya | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | ichinomiya | إيتشينوميا | Ichinomiya | Ichinomiya | jp | PPLA2 | 380073 | آيتشي | 35.3000 | 136.8000 | Asia/Tokyo | 16.35 | nagoya | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | takasaki | تاكاساكي | Takasaki | Takasaki | jp | PPLA2 | 372973 | غونما | 36.3333 | 139.0167 | Asia/Tokyo | 92.67 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | nara-shi | نارا | Nara-shi | Nara-shi | jp | PPLA | 367353 | نارا | 34.6850 | 135.8048 | Asia/Tokyo | 27.68 | osaka | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | kawagoe | كاواغويه | Kawagoe | Kawagoe | jp | PPLA2 | 354571 | سايتاما | 35.9086 | 139.4853 | Asia/Tokyo | 29.82 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | koshigaya | كوشيغايا | Koshigaya | Koshigaya | jp | PPLA2 | 345353 | سايتاما | 35.8903 | 139.7892 | Asia/Tokyo | 26.91 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | otsu | أوتسو | Ōtsu | Ōtsu | jp | PPLA | 345070 | شيغا | 35.0000 | 135.8667 | Asia/Tokyo | 9.07 | kyoto | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | nakano | ناكانو | Nakano | Nakano | jp | PPLA2 | 344880 | طوكيو | 35.7045 | 139.6695 | Asia/Tokyo | 3.59 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | tokorozawa | توكوروزاوا | Tokorozawa | Tokorozawa | jp | PPLA2 | 344194 | سايتاما | 35.7992 | 139.4690 | Asia/Tokyo | 21.32 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | koriyama | كورياما | Kōriyama | Kōriyama | jp | PPLA2 | 327692 | فوكوشيما | 37.4000 | 140.3833 | Asia/Tokyo | 202.56 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | kasugai | كاسوغاي | Kasugai | Kasugai | jp | PPLA2 | 308681 | آيتشي | 35.2476 | 136.9723 | Asia/Tokyo | 9.47 | nagoya | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | yokkaichi | يوكايتشي | Yokkaichi | Yokkaichi | jp | PPLA2 | 305424 | ميي | 34.9667 | 136.6167 | Asia/Tokyo | 35.59 | nagoya | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | kurume | كورومي | Kurume | Kurume | jp | PPLA2 | 303579 | فوكوكا | 33.3167 | 130.5167 | Asia/Tokyo | 32.25 | fukuoka | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | aomori | آوموري | Aomori | Aomori | jp | PPLA | 298394 | آوموري | 40.8167 | 140.7333 | Asia/Tokyo | 254.88 | sapporo | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | morioka | موريوكا | Morioka | Morioka | jp | PPLA | 290700 | إيواتي | 39.7000 | 141.1500 | Asia/Tokyo | 374.20 | sapporo | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | ibaraki | إباراكي | Ibaraki | Ibaraki | jp | PPLA2 | 287730 | أوساكا | 34.8164 | 135.5683 | Asia/Tokyo | 14.92 | osaka | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | ichihara | إيتشيهارا | Ichihara | Ichihara | jp | PPLA2 | 283531 | تشيبا | 35.5167 | 140.0833 | Asia/Tokyo | 41.13 | yokohama | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | hakodate | هاكوداته | Hakodate | Hakodate | jp | PPLA2 | 275730 | هوكايدو | 41.7758 | 140.7367 | Asia/Tokyo | 151.72 | sapporo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | nagaoka | ناغاوكا | Nagaoka | Nagaoka | jp | PPLA2 | 266936 | نييغاتا | 37.4500 | 138.8500 | Asia/Tokyo | 209.79 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | shimonoseki | شيمونوسكي | Shimonoseki | Shimonoseki | jp | PPL | 265684 | ياماغوتشي | 33.9555 | 130.9371 | Asia/Tokyo | 64.01 | fukuoka | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | hiratsuka | هيراتسوكا | Hiratsuka | Hiratsuka | jp | PPLA2 | 258422 | كاناغاوا | 35.3278 | 139.3373 | Asia/Tokyo | 30.15 | yokohama | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | chigasaki | تشيغاساكي | Chigasaki | Chigasaki | jp | PPLA2 | 242798 | كاناغاوا | 35.3364 | 139.4043 | Asia/Tokyo | 24.31 | yokohama | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | tsukuba | تسوكوبا | Tsukuba | Tsukuba | jp | PPLA2 | 241656 | إيباراكي | 36.0833 | 140.1167 | Asia/Tokyo | 61.77 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | matsumoto | ماتسوموتو | Matsumoto | Matsumoto | jp | PPLA2 | 241145 | ناغانو | 36.2333 | 137.9667 | Asia/Tokyo | 151.13 | nagoya | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | saga | ساغا | Saga | Saga | jp | PPLA | 233301 | ساغا | 33.2333 | 130.3000 | Asia/Tokyo | 40.81 | fukuoka | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | kasukabe | كاسوكابي | Kasukabe | Kasukabe | jp | PPLA2 | 229792 | سايتاما | 35.9831 | 139.7497 | Asia/Tokyo | 35.28 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | takarazuka | تاكارازوكا | Takarazuka | Takarazuka | jp | PPLA2 | 226432 | هيوغو | 34.7994 | 135.3570 | Asia/Tokyo | 17.73 | osaka | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | ota | أوتا | Ōta | Ōta | jp | PPLA2 | 224358 | غونما | 36.3000 | 139.3667 | Asia/Tokyo | 73.91 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | kure | كورشي | Kure | Kure | jp | PPLA2 | 214592 | هيروشيما | 34.2322 | 132.5666 | Asia/Tokyo | 19.86 | hiroshima | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | isesaki | إسيساكي | Isesaki | Isesaki | jp | PPLA2 | 211850 | غونما | 36.3167 | 139.2000 | Asia/Tokyo | 81.93 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | nagareyama | ناغاره ياما | Nagareyama | Nagareyama | jp | PPLA2 | 200136 | تشيبا | 35.8563 | 139.9027 | Asia/Tokyo | 30.32 | tokyo | arabic_only |  |  | 90 | pop_gte_200000 |
| ✅ | yamaguchi | ياماغوتشي | Yamaguchi | Yamaguchi | jp | PPLA | 193966 | ياماغوتشي | 34.1833 | 131.4667 | Asia/Tokyo | 93.56 | hiroshima | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | kofu | كوفو | Kofu | Kofu | jp | PPLA | 189591 | ياماناشي | 35.6667 | 138.5667 | Asia/Tokyo | 97.89 | tokyo | arabic_only |  |  | 90 | always_include:PPLA |
| ✅ | tottori-shi | توتوري | Tottori-shi | Tottori-shi | jp | PPLA | 188465 | توتوري | 35.5000 | 134.2333 | Asia/Tokyo | 125.59 | kobe | arabic_only |  |  | 90 | always_include:PPLA |
| ⚠️ | higashiosaka | هيغاشيوساكا، أوساكا | Higashiosaka | Higashiosaka | jp | PPLA2 | 493940 | أوساكا | 34.6667 | 135.5833 | Asia/Tokyo | 8.00 | osaka | mixed_unknown |  |  | 90 | pop_gte_200000 |
| ⚠️ | kurashiki | كوراشيكي، أوكاياما | Kurashiki | Kurashiki | jp | PPLA2 | 483576 | أوكاياما | 34.5833 | 133.7667 | Asia/Tokyo | 122.19 | hiroshima | mixed_unknown |  |  | 90 | pop_gte_200000 |
| ⚠️ | fukuyama | فوکویاما | Fukuyama | Fukuyama | jp | PPLA2 | 468812 | هيروشيما | 34.4833 | 133.3667 | Asia/Tokyo | 84.29 | hiroshima | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | hirakata | هيراكاتا، أوساكا | Hirakata | Hirakata | jp | PPLA2 | 406331 | أوساكا | 34.8135 | 135.6491 | Asia/Tokyo | 18.91 | osaka | mixed_unknown |  |  | 90 | pop_gte_200000 |
| ⚠️ | suita | سوئیتا، اوساکا | Suita | Suita | jp | PPLA2 | 385567 | أوساكا | 34.7614 | 135.5157 | Asia/Tokyo | 7.63 | osaka | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | toyohashi | تويوهاشي، آيتشي | Toyohashi | Toyohashi | jp | PPLA2 | 377453 | آيتشي | 34.7667 | 137.3833 | Asia/Tokyo | 63.36 | nagoya | mixed_unknown |  |  | 90 | pop_gte_200000 |
| ⚠️ | iwaki | ایواکی، فوکوشیما | Iwaki | Iwaki | jp | PPLA2 | 357309 | فوكوشيما | 37.0500 | 140.8833 | Asia/Tokyo | 188.48 | tokyo | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | asahikawa | آساهیکاوا، هوکایدو | Asahikawa | Asahikawa | jp | PPLA2 | 333530 | هوكايدو | 43.7706 | 142.3649 | Asia/Tokyo | 113.45 | sapporo | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | akita | آکیتا | Akita | Akita | jp | PPLA | 307672 | أكيتا | 39.7167 | 140.1167 | Asia/Tokyo | 386.02 | sapporo | mixed_script |  |  | 90 | always_include:PPLA |
| ⚠️ | akashi | آکاشی | Akashi | Akashi | jp | PPLA2 | 303601 | هيوغو | 34.6552 | 135.0069 | Asia/Tokyo | 17.68 | kobe | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | fuji | فوجي | Fuji | Fuji | jp | PPLA2 | 245392 | شيزوكا | 35.1667 | 138.6833 | Asia/Tokyo | 91.94 | yokohama | arabic_only | wave | fuji-jp | 90 | pop_gte_200000 |
| ⚠️ | sasebo | ساسه‌بو، ناگازاکی | Sasebo | Sasebo | jp | PPLA2 | 243223 | ناغازاكي | 33.1683 | 129.7250 | Asia/Tokyo | 48.62 | nagasaki | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | atsugi | آتسوگی، کاناگاوا | Atsugi | Atsugi | jp | PPLA2 | 223960 | كاناغاوا | 35.4427 | 139.3693 | Asia/Tokyo | 24.34 | yokohama | mixed_script |  |  | 90 | pop_gte_200000 |
| ⚠️ | matsue | ماتسو، شیمانے | Matsue | Matsue | jp | PPLA | 203616 | شيمانه | 35.4833 | 133.0500 | Asia/Tokyo | 133.59 | hiroshima | mixed_script |  |  | 90 | always_include:PPLA |

## Collision-watch list for JP

Cities the user pre-flagged (kickoff 2026-05-16): `tokyo`, `osaka`, `kyoto`, `yokohama`, `nagoya`, `sapporo`, `sendai`, `nara`, `okinawa`, `seoul`, `busan`, `daegu`, `daejeon`, `incheon`, `hong-kong`, `macau`, `macao`, `taipei`, `kaohsiung`, `taichung`, `tainan`, `kobe`, `fukuoka`, `hiroshima`, `nagasaki`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| yokohama | existing |  | yokohama | 3777491 |  |  |  |  |
| yokohama | existing |  | yokohama | - |  |  |  |  |
| yokohama | existing |  | yokohama | - |  |  |  |  |
| tokyo | existing |  | tokyo | 9733276 |  |  |  |  |
| sendai | pending | low | sendai | 92403 | 111.14 | nagasaki |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | 2753862 |  |  |  |  |
| nara-shi | pending | high | nara | 367353 | 27.68 | osaka |  |  |
| nagoya | existing |  | nagoya | 2332176 |  |  |  |  |
| nagasaki | existing |  | nagasaki | 409118 |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| kyoto | existing |  | kyoto | 1463723 |  |  |  |  |
| kobe | existing |  | kobe | - |  |  |  |  |
| kobe | existing |  | kobe | 1525152 |  |  |  |  |
| hiroshima | existing |  | hiroshima | 1200754 |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | 1612392 |  |  |  |  |
| okinawa | pending | low | okinawa | 142752 | 740.95 | nagasaki |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | 10746 |  |  |  |  |
| yokohama | existing |  | yokohama | 4412 |  |  |  |  |
| sapporo | existing |  | sapporo | 1973832 |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagoya | existing |  | nagoya | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| osaka | existing |  | osaka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| yokohama | existing |  | yokohama | - |  |  |  |  |
| fukuoka | existing |  | fukuoka | - |  |  |  |  |
| yokohama | existing |  | yokohama | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |
| nagasaki | existing |  | nagasaki | - |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/jp-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-jp` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/JP.zip
