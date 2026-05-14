# JO GeoNames Import Report (refined)

**Country**: Jordan (الأردن)
**Generated**: 2026-05-14T17:12:20.713Z
**Phase**: `CURATED-GEODATA-JO-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/jo-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/jo-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/jo-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/jo-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 1756 |
| Normalized candidates                     | 1318 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **120** |
| **medium_confidence_pending**             | **93** |
| **low_confidence_pending**                | **983** |
| needs_review                              | 117 |
| existing (matched, no action)             | 4 |
| rejected (bad data / religious site)      | 1 |
| Alias enrichment opps (in separate report) | 4 |

**Shortlist size (high + medium):** 213

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 1 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 4 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| umm-al-qittayn | أم القطين | Umm al Qiţţayn | محافظة المفرق | PPLA3 | 100 | 4225 | 57.54 | zarqa |
| kafr-asad | كفر أسد | Kafr Asad | محافظة إربد | PPLA2 | 100 | 8203 | 13.71 | irbid |
| al-mazar-al-janubi | المزار | Al Mazār al Janūbī | محافظة الكرك | PPLA2 | 100 | 9383 | 100.13 | amman |
| al-jizah | الجيزة | Al Jīzah | محافظة العاصمة | PPLA2 | 100 | 4397 | 27.52 | amman |
| az-zulayl | الضليل | Az̧ Z̧ulayl | محافظة الزرقاء | PPLA3 | 100 | 50931 | 18.90 | zarqa |
| yarqa | يرقا | Yarqā | محافظة البلقاء | PPLA3 | 95 | 4786 | 22.15 | amman |
| sakhrah | صخرة | Şakhrah | محافظة عجلون | PPLA3 | 95 | 10616 | 20.55 | irbid |
| sahab | سحاب | Saḩāb | محافظة العاصمة | PPLA2 | 95 | 40241 | 11.03 | amman |
| sabha | صبحا | Şabḩā | محافظة المفرق | PPLA3 | 95 | 5315 | 48.13 | zarqa |
| busayra | بصيرا | Buşayrā | محافظة الطفيلة | PPLA2 | 95 | 7154 | 138.22 | amman |
| burma | برما | Burmā | محافظة جرش | PPLA3 | 95 | 4735 | 32.81 | zarqa |
| ayy | عي | ‘Ayy | محافظة الكرك | PPLA2 | 95 | 7340 | 94.20 | amman |
| at-tayyibah | الطيبة | Aţ Ţayyibah | محافظة إربد | PPLA2 | 95 | 12615 | 12.49 | irbid |
| ash-shawbak | الشوبك | Ash Shawbak | محافظة معان | PPLA2 | 95 | 50 | 123.24 | aqaba |
| ar-ramtha | الرمثا | Ar Ramthā | محافظة إربد | PPLA2 | 95 | 155693 | 14.83 | irbid |
| al-qatranah | القطرانة | Al Qaţrānah | محافظة الكرك | PPLA2 | 95 | 7070 | 78.08 | amman |
| al-qasr | القصر | Al Qaşr | محافظة الكرك | PPLA2 | 95 | 3840 | 72.34 | amman |
| al-jubayhah | الجبيهة | Al Jubayhah | محافظة العاصمة | PPLA2 | 95 | 46834 | 7.81 | amman |
| al-jafr | الجفر | Al Jafr | محافظة معان | PPLA3 | 95 | 3557 | 143.13 | aqaba |
| al-fuhays | الفحيص | Al Fuḩayş | محافظة البلقاء | PPLA2 | 95 | 18916 | 15.40 | amman |
| sarfa | صرفا | Şarfā | محافظة الكرك | PPL | 85 | 4873 | 73.22 | amman |
| samma-ar-rawsan | سما | Sammā ar Rawsān | محافظة إربد | PPLA2 | 85 | - | 9.41 | irbid |
| sama-as-sirhan | سما | Samā as Sirḩān | محافظة المفرق | PPLA3 | 85 | - | 38.16 | irbid |
| sakib | ساكب | Sakib | محافظة جرش | PPL | 85 | 11586 | 30.41 | irbid |
| saham-al-kaffarat | سحم | Saḩam al Kaffārāt | محافظة إربد | PPL | 85 | 6203 | 17.39 | irbid |
| rujm-ash-shami-al-gharbi | رجم الشامي | Rujm ash Shāmī al Gharbī | محافظة العاصمة | PPLA3 | 85 | - | 14.06 | amman |
| al-mughayyir | المغير | Al Mughayyir | محافظة الكرك | PPLA3 | 85 | - | 61.77 | amman |
| malka | ملكا | Malkā | محافظة إربد | PPL | 85 | 6856 | 16.46 | irbid |
| kafr-abil | كفر آبيل | Kafr Abīl | محافظة إربد | PPL | 85 | 6333 | 23.31 | irbid |
| dayr-abu-sa-id | دير أبي سعيد | Dayr Abū Sa‘īd | محافظة إربد | PPLA2 | 85 | - | 16.59 | irbid |
| bayt-idis | بيت إيدس | Bayt Īdis | محافظة إربد | PPL | 85 | 4723 | 19.39 | irbid |
| al-khinzirah | الخنزيرة | Al Khinzīrah | محافظة الكرك | PPL | 85 | 5231 | 104.09 | amman |
| safi | الصافي | Safi | محافظة الكرك | PPL | 85 | 15200 | 110.23 | amman |
| al-mazar-ash-shamali | المزار | Al Mazār ash Shamālī | محافظة إربد | PPLA2 | 85 | - | 10.70 | irbid |
| manshiyat-bani-hasan | المنشية | Manshīyat Banī Ḩasan | محافظة المفرق | PPLA3 | 85 | - | 29.76 | irbid |
| russeifa | الرصيفة | Russeifa | محافظة الزرقاء | PPL | 85 | 268237 | 7.25 | zarqa |
| rukban | الرُّقبان | Rukban | محافظة المفرق | PPL | 85 | 85000 | 279.32 | irbid |
| zahar | زحر | Zaḩar | محافظة إربد | PPL | 80 | 4150 | 6.85 | irbid |
| waqqas | وقاص | Waqqāş | محافظة إربد | PPL | 80 | 5678 | 23.00 | irbid |
| umm-qays | أم قيس | Umm Qays | محافظة إربد | PPL | 80 | 4294 | 18.94 | irbid |
| umm-as-summaq | ام السمّاق | Umm as Summāq | محافظة العاصمة | PPL | 80 | 18274 | 9.66 | amman |
| umm-ar-rasas | أم الرصاص | Umm ar Raşāş | محافظة العاصمة | PPLA3 | 80 | - | 48.17 | amman |
| umm-al-jimal | أم الجمال | Umm al Jimāl | محافظة المفرق | PPLA3 | 80 | - | 38.79 | zarqa |
| umm-al-basatin | أم البساتين | Umm al Basātīn | محافظة العاصمة | PPLA3 | 80 | - | 14.26 | amman |
| adhruh | أذرح | Adhruḩ | محافظة معان | PPLA3 | 80 | - | 105.94 | aqaba |
| tibnah | تبنة | Tibnah | محافظة إربد | PPL | 80 | 5229 | 14.33 | irbid |
| tabaqat-fahl | طبقة فحل | Ţabaqat Faḩl | محافظة إربد | PPL | 80 | 1000 | 25.42 | irbid |
| suf | سوف | Sūf | محافظة جرش | PPL | 80 | 12942 | 26.92 | irbid |
| ash-shunah-al-janubiyah | الشونة الجنوبية | Ash Shūnah al Janūbīyah | محافظة البلقاء | PPLA2 | 80 | - | 29.92 | amman |
| samma | صما | Şammā | محافظة إربد | PPL | 80 | 8926 | 15.11 | irbid |
| sal | سال | Sāl | محافظة إربد | PPL | 80 | 6896 | 5.98 | irbid |
| rasun | راسون | Rāsūn | محافظة عجلون | PPL | 80 | 2586 | 19.28 | irbid |
| qumaym | قميم | Qumaym | محافظة إربد | PPL | 80 | 5111 | 10.97 | irbid |
| qafqafa | قفقفا | Qafqafā | محافظة جرش | PPL | 80 | 4402 | 24.48 | irbid |
| na-ur | ناعور | Nā‘ūr | محافظة العاصمة | PPLA2 | 80 | - | 12.58 | amman |
| mulayh | مليح | Mulayḩ | محافظة مادبا | PPLA3 | 80 | - | 41.66 | amman |
| mahis | ماحص | Māḩiş | محافظة البلقاء | PPL | 80 | 17754 | 15.64 | amman |
| kurayyimah | كريمة | Kurayyimah | محافظة إربد | PPL | 80 | 17837 | 38.95 | irbid |
| kufrinjah | كفرنجة | Kufrinjah | محافظة عجلون | PPLA2 | 80 | - | 31.87 | irbid |
| al-faysaliyah | الفيصلية | Al Fayşalīyah | محافظة مادبا | PPLA3 | 80 | - | 26.51 | amman |
| kitim | كتم | Kitim | محافظة إربد | PPL | 80 | 5292 | 13.76 | irbid |
| khuraybat-as-suq | خريبة السوق | Khuraybat as Sūq | محافظة العاصمة | PPL | 80 | 186158 | 7.40 | amman |
| birayn | بيرين | Bīrayn | محافظة الزرقاء | PPLA3 | 80 | - | 12.58 | zarqa |
| al-murayghah | المريغة | Al Murayghah | محافظة معان | PPLA3 | 80 | - | 80.50 | aqaba |
| kharja | خرجا | Kharjā | محافظة إربد | PPL | 80 | 5498 | 12.12 | irbid |
| kafr-sawm | كفر سوم | Kafr Sawm | محافظة إربد | PPL | 80 | 7152 | 15.13 | irbid |
| juraynah | جرينة | Juraynah | محافظة مادبا | PPLA3 | 80 | - | 24.18 | amman |
| judita | جديتا | Judita | محافظة إربد | PPL | 80 | 20000 | 21.14 | irbid |
| jawa | جاوا | Jāwā | محافظة العاصمة | PPL | 80 | 10628 | 10.38 | amman |
| irjan | عرجان | ‘Irjān | محافظة عجلون | PPLA3 | 80 | - | 20.99 | irbid |
| hisban | حسبان | Ḩisbān | محافظة العاصمة | PPLA3 | 80 | - | 19.83 | amman |
| hawsha | حوشا | Ḩawshā | محافظة المفرق | PPLA3 | 80 | - | 26.07 | irbid |
| hatim | حاتم | Ḩātim | محافظة إربد | PPL | 80 | 5542 | 12.02 | irbid |
| halawah | حلاوة | Ḩalāwah | محافظة عجلون | PPL | 80 | 5376 | 25.98 | irbid |
| hakama | حكما | Ḩakamā | محافظة إربد | PPL | 80 | 7075 | 5.24 | irbid |
| fuqu | فقوع | Fuqū‘ | محافظة الكرك | PPLA2 | 80 | - | 67.67 | amman |
| dhiban | ذيبان | Dhībān | محافظة مادبا | PPLA2 | 80 | - | 51.52 | amman |
| dayr-yusuf | دير يوسف | Dayr Yūsuf | محافظة إربد | PPL | 80 | 6223 | 9.14 | irbid |
| dayr-alla | دير علا | Dayr ‘Allā | محافظة البلقاء | PPLA2 | 80 | - | 40.13 | amman |
| dana | ضانا | Ḑānā | محافظة الطفيلة | PPL | 80 | 50 | 140.26 | aqaba |
| bayt-yafa | بيت يافا | Bayt Yāfā | محافظة إربد | PPL | 80 | 7788 | 7.02 | irbid |
| balila | بليلا | Balīlā | محافظة جرش | PPL | 80 | 5206 | 20.08 | irbid |
| bal-ama | بلعما | Bal‘amā | محافظة المفرق | PPLA3 | 80 | - | 18.20 | zarqa |
| muthallath-al-azraq | مثلث الأزرق | Muthallath al Azraq | محافظة الزرقاء | PPLA3 | 80 | - | 73.63 | zarqa |
| al-azraq-ash-shamali | الأزرق الشمالي | Al Azraq ash Shamālī | محافظة الزرقاء | PPL | 80 | 14800 | 73.18 | zarqa |
| ayl | ايل | Ayl | محافظة معان | PPLA3 | 80 | - | 91.17 | aqaba |
| at-turrah | الطرة | Aţ Ţurrah | محافظة إربد | PPL | 80 | 14619 | 16.07 | irbid |
| at-taybeh | الطيبة | At-Taybeh | محافظة معان | PPL | 80 | 4265 | 91.92 | aqaba |
| as-subayhi | الصبيحي | Aş Şubayḩī | محافظة البلقاء | PPLA3 | 80 | - | 30.85 | amman |
| ash-shunah-ash-shamaliyah | الشونة الشمالية | Ash Shūnah ash Shamālīyah | محافظة إربد | PPLA2 | 80 | - | 23.20 | irbid |
| ash-shajarah | الشجرة | Ash Shajarah | محافظة إربد | PPL | 80 | 11243 | 13.05 | irbid |
| ar-ruwayshid | الرويشد | Ar Ruwayshid | محافظة المفرق | PPLA2 | 80 | - | 204.58 | zarqa |
| ar-rusayfah | الرصيفة | Ar Ruşayfah | محافظة الزرقاء | PPLA2 | 80 | - | 8.06 | zarqa |
| ar-rabbah | الربة | Ar Rabbah | محافظة الكرك | PPL | 80 | 4229 | 77.31 | amman |
| anjarah | عنجرة | ‘Anjarah | محافظة عجلون | PPL | 80 | 17634 | 29.10 | irbid |
| al-quwayrah | القويرة | Al Quwayrah | محافظة معان | PPL | 80 | 7372 | 42.36 | aqaba |
| al-mastabah | المصطبة | Al Maşţabah | محافظة جرش | PPLA3 | 80 | - | 25.10 | zarqa |
| allan | علان | ‘Allān | محافظة البلقاء | PPLA3 | 80 | - | 25.94 | amman |
| al-kittah | الكتة | Al Kittah | محافظة جرش | PPL | 80 | 5626 | 31.01 | irbid |
| al-karamah | الكرامة | Al Karāmah | محافظة البلقاء | PPL | 80 | 9384 | 32.86 | amman |
| qir-moav | الكرك | Qīr Moāv | محافظة معان | PPL | 80 | 22581 | 87.55 | amman |
| al-juwayyidah | الجويدة | Al Juwayyidah | محافظة العاصمة | PPLA2 | 80 | - | 6.48 | amman |
| al-husayniyah | الحسينية | Al Ḩusaynīyah | محافظة الكرك | PPLA3 | 80 | - | 104.07 | amman |
| al-hisn | الحصن | Al Ḩişn | محافظة إربد | PPLA2 | 80 | - | 8.52 | irbid |
| al-hashimiyah | الهاشمية | Al Hāshimīyah | محافظة الزرقاء | PPLA3 | 80 | - | 7.01 | zarqa |
| al-hasa | الحسا | Al Ḩasā | محافظة الطفيلة | PPLA2 | 80 | - | 125.07 | amman |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة المفرق | PPL | 80 | 6211 | 31.15 | irbid |
| al-arid | العريض | Al ‘Arīḑ | محافظة مادبا | PPLA3 | 80 | - | 50.09 | amman |
| adir | أدر | Adir | محافظة الكرك | PPL | 80 | 4441 | 84.14 | amman |
| al-khalidiyah | الخالدية | Al Khālidīyah | محافظة المفرق | PPLA3 | 80 | - | 23.49 | zarqa |
| ar-rishah | الريشة | Ar Rīshah | محافظة العقبة | PPLA3 | 80 | - | 80.17 | aqaba |
| al-muwaqqar | الموقر | Al Muwaqqar | محافظة العاصمة | PPLA2 | 80 | - | 22.39 | amman |
| al-husayniyah | الحسينية | Al Ḩusaynīyah | محافظة معان | PPLA2 | 80 | - | 141.09 | aqaba |
| ad-disah | الديسة | Ad Dīsah | محافظة العقبة | PPLA3 | 80 | - | 50.76 | aqaba |
| muthallath-sabha | مثلث صبحا | Muthallath Şabḩā | محافظة المفرق | PPLA2 | 80 | - | 41.41 | zarqa |
| dayr-al-kahf | دير الكهف | Dayr al Kahf | محافظة المفرق | PPLA3 | 80 | - | 74.27 | zarqa |
| ruwaished | الرويشد | Ruwaished | محافظة المفرق | PPL | 80 | 9805 | 204.37 | zarqa |
| umm-al-khashab | ام الخشب | Umm al Khashab | محافظة عجلون | PPL | 80 | 80 | 31.58 | irbid |
| suwaylih | صويلح | Ṣuwayliḥ | محافظة البلقاء | PPL | 80 | 151016 | 11.67 | amman |
| marj-al-hamam | مرج الحمام | Marj Al Hamam | محافظة العاصمة | PPL | 80 | 82788 | 9.07 | amman |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| hammamat-al-umush | حمامات العشوش | Ḩammāmat al ‘Umūsh | محافظة المفرق | PPL | 70 | 27.82 |
| zabdah-al-wasatiyah | زبدة | Zabdah al Wasaţīyah | محافظة إربد | PPL | 70 | 17.12 |
| uraynibah-al-gharbiyah | أرينبة | Uraynibah al Gharbīyah | محافظة العاصمة | PPL | 70 | 34.17 |
| al-khalidiyah | الخالدية | Al Khālidīyah | محافظة الكرك | PPL | 70 | 103.39 |
| al-junaynah | أم صوّانة | Al Junaynah | محافظة معان | PPL | 70 | 115.86 |
| al-fayha | أم جريسات | Al Fayḩā’ | محافظة مادبا | PPL | 70 | 31.64 |
| umm-an-na-am-al-gharbiyah | ام النعام | Umm an Na‘ām al Gharbīyah | محافظة المفرق | PPL | 70 | 32.14 |
| umm-al-khanazir | أم الخنازير | Umm al Khanāzīr | محافظة الكرك | PPL | 70 | 106.71 |
| dar-al-basha | بلد الباشا | Dār al Bāshā | محافظة إربد | PPL | 70 | 16.40 |
| umm-al-birak | ام البرك | Umm al Birak | محافظة العاصمة | PPL | 70 | 16.03 |
| thughrat-al-jubb | الثغرة | Thughrat al Jubb | محافظة المفرق | PPL | 70 | 25.82 |
| suwaymirah | سويمرة | Suwaymirah | محافظة معان | PPL | 70 | 77.64 |
| khirbat-subayrah | اسبيرة | Khirbat Subayrah | محافظة إربد | PPL | 70 | 31.35 |
| shuqayra-ash-sharqiyah | شقيرا | Shuqayrā ash Sharqīyah | محافظة الكرك | PPL | 70 | 108.19 |
| sab-asir | سبع اصير | Sab‘ Aşīr | محافظة المفرق | PPL | 70 | 46.12 |
| aruwaym | ارويم | Aruwaym | محافظة الطفيلة | PPL | 70 | 129.21 |
| al-khalidi | الخالدي | Al Khālidī | محافظة العقبة | PPL | 70 | 24.88 |
| arhaba | إرحابا | Arḩābā | محافظة إربد | PPL | 70 | 14.98 |
| ras-an-naqb | النقب | Ra’s an Naqb | محافظة معان | PPL | 70 | 70.49 |
| falha | فلحا | Falḩā | محافظة مادبا | PPL | 70 | 48.06 |
| khirbat-qasr-ad-dayr | خربة قصر الدير | Khirbat Qaşr ad Dayr | محافظة الطفيلة | PPL | 70 | 132.08 |
| iskan-ma-adh | اسكان معاذ | Iskān Ma‘ādh | محافظة إربد | PPL | 70 | 22.95 |
| askayin | اسكايين | Askāyīn | محافظة إربد | PPL | 70 | 20.69 |
| irkhaym | ارخيم | Irkhaym | محافظة إربد | PPL | 70 | 18.00 |
| khirbat-khaww | خربة خو | Khirbat Khaww | محافظة الزرقاء | PPL | 70 | 4.30 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **983**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| yajuz | Yājūz | Yājūz | محافظة العاصمة | PPL | missing_real_ar_name |
| wadi-sararah | وادي صرارة | Wādī Şarārah | محافظة الكرك | PPL | non_place_keyword (kw: وادي) |
| wadi-musa | بترا | Wādī Mūsá | محافظة معان | PPLA2 | non_place_keyword (kw: وادي) |
| wadi-as-sir | وادي السير | Wādī as Sīr | محافظة العاصمة | PPLA2 | non_place_keyword (kw: وادي) |
| uyun-adh-dhib | ‘Uyūn adh Dhi’b | ‘Uyūn adh Dhi’b | محافظة العاصمة | PPL | missing_real_ar_name |
| umm-sawwanah | Umm Şawwānah | Umm Şawwānah | محافظة الكرك | PPL | missing_real_ar_name |
| umm-rummanah | Umm Rummānah | Umm Rummānah | محافظة الزرقاء | PPL | missing_real_ar_name |
| umm-nuwwarah | Umm Nuwwārah | Umm Nuwwārah | محافظة العاصمة | PPL | missing_real_ar_name |
| umm-al-qanafidh | Umm al Qanāfidh | Umm al Qanāfidh | محافظة العاصمة | PPL | missing_real_ar_name |
| tall-al-mistah | Tall al Misţāḩ | Tall al Misţāḩ | محافظة البلقاء | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| al-musalla | المصلى | Al Muşallá | religious_site_not_city | مصلى |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| irbid | irbid | slug |
| zarqa | zarqa | slug |
| amman | amman | slug |
| aqaba | aqaba | slug |

## What to do next

1. Read the **high-confidence shortlist** above. Decide which
   entries are real Saudi places worth curating.
2. Open `db/places/candidates/sa-geonames-candidates.json`.
3. For each entry you approve: change `"status": "pending"`
   to `"status": "approved"`. (Leave `"tier"` as-is for audit.)
4. For obvious rejections (junk, dupes you missed, sub-areas):
   change to `"status": "rejected"`.
5. Once you're done with high, optionally repeat for medium.
6. After review, when Stage 4 exists, it will merge only the
   `status="approved"` entries into curated-places.json.

## License + Attribution

Place data is derived from the GeoNames geographical database,
licensed under Creative Commons Attribution 4.0 (CC-BY 4.0).
Source: https://download.geonames.org/export/dump/SA.zip
GeoNames: https://www.geonames.org/
