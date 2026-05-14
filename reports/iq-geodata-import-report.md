# IQ GeoNames Import Report (refined)

**Country**: Iraq (العراق)
**Generated**: 2026-05-14T17:12:20.614Z
**Phase**: `CURATED-GEODATA-IQ-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/iq-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/iq-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/iq-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/iq-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 23823 |
| Normalized candidates                     | 21285 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **131** |
| **medium_confidence_pending**             | **4229** |
| **low_confidence_pending**                | **13833** |
| needs_review                              | 3067 |
| existing (matched, no action)             | 19 |
| rejected (bad data / religious site)      | 6 |
| Alias enrichment opps (in separate report) | 19 |

**Shortlist size (high + medium):** 4360

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 6 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 14 |
| coords<1km | 4 |
| ar_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| zaxo | زاخو | Zaxo | محافظة دهوك | PPLA2 | 100 | 95052 | 41.28 | duhok |
| tallkayf | تلكيف | Tallkayf | محافظة نينوى | PPLA2 | 100 | 23524 | 16.16 | mosul |
| sumayl | sێmێl | Sumayl | محافظة دهوك | PPLA2 | 100 | 152512 | 12.53 | duhok |
| shaqlawah | شقلاوة | Shaqlāwah | محافظة أربيل | PPLA2 | 100 | 32599 | 36.94 | erbil |
| ruwandiz | راوندوز | Ṟuwandiz | محافظة أربيل | PPLA2 | 100 | 22943 | 65.49 | erbil |
| ranyah | رانية | Rānyah | محافظة السليمانية | PPLA2 | 100 | 114173 | 78.63 | erbil |
| al-qaim | القائم | Al Qā’im | محافظة الأنبار | PPLA2 | 100 | 74100 | 239.50 | ramadi |
| mawet | mawەt | Mawet | محافظة السليمانية | PPLA2 | 100 | 1464 | 37.42 | sulaymaniyah |
| koysinceq | كوية | Koysinceq | محافظة أربيل | PPLA2 | 100 | 44987 | 56.90 | erbil |
| kifri | كفرى | Kifrī | محافظة ديالى | PPLA2 | 100 | 30143 | 100.83 | kirkuk |
| khanaqin | khanەqyn | Khānaqīn | محافظة ديالى | PPLA2 | 100 | 175000 | 135.36 | sulaymaniyah |
| kelar | كلار | Kelar | محافظة السليمانية | PPLA2 | 100 | 250000 | 104.70 | sulaymaniyah |
| soran | dyanە | Soran | محافظة أربيل | PPLA2 | 100 | 91589 | 70.28 | erbil |
| jamjamal | chەmchەmaڵ | Jamjamāl | محافظة السليمانية | PPLA2 | 100 | 42593 | 40.67 | kirkuk |
| baynjiwayn | بنجوين | Baynjiwayn | محافظة السليمانية | PPLA2 | 100 | 27116 | 47.08 | sulaymaniyah |
| baharkah | بحركة | Baḥarkah | محافظة أربيل | PPLA3 | 100 | 130518 | 14.03 | erbil |
| aqrah | ئاكرێ | ‘Aqrah | محافظة نينوى | PPLA2 | 100 | 23000 | 64.13 | erbil |
| abu-ghurayb | أبو غريب | Abū Ghurayb | محافظة بغداد | PPLA2 | 100 | 900000 | 16.88 | baghdad |
| khasnahzan | كستران ستي اسماعيل | Khasnahzān | محافظة أربيل | PPLA3 | 100 | 146639 | 11.98 | erbil |
| sinjar | سنجار | Sinjār | محافظة نينوى | PPLA2 | 100 | 38294 | 114.80 | mosul |
| anah | الريحانة | ‘Anah | محافظة الأنبار | PPLA2 | 100 | 27000 | 157.57 | tikrit |
| ash-sharqat | الشرقاط | Ash Sharqāt | محافظة صلاح الدين | PPLA2 | 95 | 160000 | 92.69 | mosul |
| rawah | راوة | Rāwah | محافظة الأنبار | PPLA2 | 95 | 13000 | 161.68 | tikrit |
| qalat-salih | قلعة صالح | Qal‘at Şāliḩ | محافظة ميسان | PPLA2 | 95 | 39698 | 111.57 | nasiriyah |
| hit | هيت | Hīt | محافظة الأنبار | PPLA2 | 95 | 31901 | 50.38 | ramadi |
| hadithah | حديثة | Ḩadīthah | محافظة الأنبار | PPLA2 | 95 | 30925 | 116.87 | ramadi |
| bayji | بيجي | Bayjī | محافظة صلاح الدين | PPLA2 | 95 | 173677 | 40.92 | tikrit |
| balad | بلد | Balad | محافظة صلاح الدين | PPLA2 | 95 | 42088 | 77.55 | tikrit |
| az-zubayr | الزبير | Az Zubayr | محافظة البصرة | PPLA2 | 95 | 122676 | 14.98 | basra |
| as-suwayrah | الصويرة | Aş Şuwayrah | محافظة واسط | PPLA2 | 95 | 77200 | 57.73 | baghdad |
| ash-shatrah | الشطرة | Ash Shaţrah | محافظة ذي قار | PPLA2 | 95 | 182175 | 40.08 | nasiriyah |
| ash-shamiyah | الشامية | Ash Shāmīyah | محافظة القادسية | PPLA2 | 95 | 57661 | 25.06 | najaf |
| ar-rutbah | الرطبة | Ar Ruţbah | محافظة الأنبار | PPLA2 | 95 | 22370 | 284.45 | ramadi |
| ar-rumaythah | الرميثة | Ar Rumaythah | محافظة المثنى | PPLA2 | 95 | 47248 | 97.19 | najaf |
| an-numaniyah | النعمانية | An Nu‘mānīyah | محافظة واسط | PPLA2 | 95 | 110000 | 118.35 | najaf |
| al-qurnah | القرنة | Al Qurnah | محافظة البصرة | PPLA2 | 95 | 134174 | 65.39 | basra |
| al-musayab | المسيب | Al-Musayab | محافظة بابل | PPLA2 | 95 | 101873 | 30.71 | karbala |
| al-miqdadiyah | المقدادية | Al Miqdādīyah | محافظة ديالى | PPLA2 | 95 | 155968 | 90.74 | baghdad |
| al-mahmudiyah | المحمودية | Al Maḩmūdīyah | محافظة بغداد | PPLA2 | 95 | 350000 | 28.13 | baghdad |
| al-mahawil | المحاويل | Al Maḩāwīl | محافظة بابل | PPLA2 | 95 | 31200 | 36.27 | karbala |
| al-madinah | المدينة | Al Madīnah | محافظة البصرة | PPLA2 | 95 | 255000 | 70.26 | basra |
| ali-al-gharbi | علي الغربي | ‘Alī al Gharbī | محافظة ميسان | PPLA2 | 95 | 19711 | 161.53 | nasiriyah |
| al-hindiyah | الهندية | Al Hindīyah | محافظة كربلاء | PPLA2 | 95 | 139578 | 20.45 | karbala |
| al-hayy | الحي | Al Ḩayy | محافظة واسط | PPLA2 | 95 | 78272 | 125.98 | nasiriyah |
| al-faw | الفاو | Al Fāw | محافظة البصرة | PPLA2 | 95 | 104569 | 89.20 | basra |
| al-aziziyah | العزيزية | Al ‘Azīzīyah | محافظة واسط | PPLA2 | 95 | 44751 | 79.09 | baghdad |
| afak | عفك | ‘Afak | محافظة القادسية | PPLA2 | 95 | 35536 | 85.93 | najaf |
| zawitah | zawytە | Zāwītah | محافظة دهوك | PPLA3 | 85 | - | 14.54 | duhok |
| tazah-khurmatu | تازة خورماتو | Tāzah Khūrmātū | محافظة كركوك | PPL | 85 | 21788 | 19.37 | kirkuk |
| tall-afar | tەlەʿfەr | Tall ‘Afar | محافظة نينوى | PPLA2 | 85 | - | 63.63 | mosul |
| sinah | سينة | Sīnah | محافظة دهوك | PPL | 85 | 128776 | 7.91 | duhok |
| seyid-sadiq | سيد صادق | Seyid Sadiq | محافظة السليمانية | PPLA2 | 85 | - | 45.84 | sulaymaniyah |
| taxa-cheya | grێ hsێn mەlhەm | Taxa Cheya | محافظة دهوك | PPL | 85 | 2790 | 71.16 | duhok |
| pirmam | سەلاحەدين | Pīrmām | محافظة أربيل | PPL | 85 | 38686 | 27.36 | erbil |
| saddat-al-hindiyah | سدة الهندية | Saddat al Hindīyah | محافظة بابل | PPL | 85 | 35720 | 26.20 | karbala |
| qeredagh | qەrەdagh | Qeredagh | محافظة السليمانية | PPLA2 | 85 | - | 28.93 | sulaymaniyah |
| qeladize | qەڵadzێ | Qeładizê | محافظة السليمانية | PPLA2 | 85 | - | 73.89 | sulaymaniyah |
| hetite | hێtytێ | Hetite | محافظة دهوك | PPL | 85 | 750 | 69.77 | duhok |
| mergasur | mێrgە swr | Mêrgasur | محافظة أربيل | PPLA2 | 85 | - | 76.83 | erbil |
| mangesh | مانكيش | Mangêsh | محافظة دهوك | PPL | 85 | 1285 | 21.09 | duhok |
| mexmur | mەkhmwr | Mexmur | محافظة أربيل | PPLA2 | 85 | - | 60.19 | erbil |
| kani-masi | كانى ماسى | Kānī Māsī | محافظة دهوك | PPLA3 | 85 | - | 56.54 | duhok |
| al-abbasi | العباسي | Al ‘Abbāsī | محافظة كركوك | PPLA3 | 85 | - | 75.33 | kirkuk |
| hiran | خۆشاو | Hīrān | محافظة أربيل | PPLA3 | 85 | - | 44.51 | erbil |
| harir | hەryr | Ḩarir | محافظة أربيل | PPL | 85 | 32171 | 50.46 | erbil |
| xebat | خبات | Xebat | محافظة أربيل | PPLA2 | 85 | - | 31.88 | erbil |
| dibis | دبز | Dibis | محافظة كركوك | PPLA2 | 85 | - | 37.08 | kirkuk |
| derkar | دركار عجم | Derkar | محافظة دهوك | PPLA3 | 85 | - | 39.82 | duhok |
| chwarta | جوارتا | Chwarta | محافظة السليمانية | PPLA2 | 85 | - | 21.35 | sulaymaniyah |
| al-jabayish | الجبايش | Al Jabāyish | محافظة ذي قار | PPLA2 | 85 | - | 71.65 | nasiriyah |
| begova | kwmەlgەھa bێgwva | Begova | محافظة دهوك | PPL | 85 | 15000 | 44.01 | duhok |
| bamarni | بامرني | Bāmarnī | محافظة دهوك | PPLA3 | 85 | - | 37.83 | duhok |
| nahiyat-ash-shinafiyah | الشنافية | Nāḩiyat ash Shināfīyah | محافظة القادسية | PPL | 85 | 22643 | 54.75 | najaf |
| ar-riyad | الرياض | Ar Riyāḑ | محافظة كركوك | PPLA3 | 85 | - | 48.93 | kirkuk |
| al-qayyarah | القيارة | Al Qayyārah | محافظة نينوى | PPLA3 | 85 | - | 62.33 | mosul |
| al-qasim | القاسم | Al-Qāsim | محافظة بابل | PPL | 85 | 93546 | 46.26 | najaf |
| kufa | الكوفة | Kufa | محافظة النجف | PPL | 85 | 110000 | 11.06 | najaf |
| al-khalis | الخالص | Al Khāliş | محافظة ديالى | PPLA2 | 85 | - | 61.29 | baghdad |
| nahiyat-al-iskandariyah | الإسكندرية | Nāḩiyat al Iskandarīyah | محافظة بابل | PPL | 85 | 100600 | 42.58 | karbala |
| nahiyat-ghammas | غماس | Nahiyat Ghammas | محافظة القادسية | PPL | 85 | 30909 | 39.04 | najaf |
| al-awjah | العوجة | Al ‘Awjah | محافظة صلاح الدين | PPLA3 | 85 | - | 8.56 | tikrit |
| al-amadiyah | ئاميدى | Al ‘Amādīyah | محافظة دهوك | PPLA2 | 85 | - | 50.92 | duhok |
| al-manadhirah | ابو صخير | Al Manādhirah | محافظة النجف | PPLA2 | 85 | - | 17.41 | najaf |
| abi-al-khasib | أبي الخصيب | Abī al Khaşīb | محافظة البصرة | PPLA2 | 85 | - | 20.17 | basra |
| derbendixan | دربندخان | Derbendîxan | محافظة السليمانية | PPLA2 | 85 | - | 55.37 | sulaymaniyah |
| al-hawijah | الحويجة | Al Ḩawījah | محافظة كركوك | PPLA2 | 85 | - | 58.35 | kirkuk |
| qushtepe | قوش تبة | Qushtepe | محافظة أربيل | PPLA3 | 85 | - | 20.36 | erbil |
| dare-tu | darەtww | Dare Tû | محافظة أربيل | PPLA3 | 85 | - | 7.92 | erbil |
| choman | جومان | Choman | محافظة أربيل | PPLA2 | 85 | - | 92.94 | erbil |
| halshaw | الشو | Halshaw | محافظة السليمانية | PPLA3 | 85 | - | 72.81 | sulaymaniyah |
| al-alam | العلم | Al-'Alam | محافظة صلاح الدين | PPL | 85 | 25662 | 12.66 | tikrit |
| ibrahim-al-khalil | ئيبراهيم خەليل | Ibrāhīm al Khalīl | محافظة دهوك | PPLA3 | 85 | - | 47.98 | duhok |
| kays-qalah | kys qەlێ | Kays Qal‘ah | محافظة نينوى | PPL | 85 | 10000 | 33.89 | mosul |
| nahiyat-ali-ash-sharqi | علي الشرقي | Nāḩiyat Alī ash Sharqī | محافظة ميسان | PPLA3 | 85 | - | 127.45 | nasiriyah |
| hayraw | هيرو | Hayraw | محافظة السليمانية | PPLA3 | 85 | - | 63.92 | sulaymaniyah |
| taxe-cheya-azadiye | yazadyێ | Taxe Cheya Azadiye | محافظة دهوك | PPL | 85 | 2643 | 38.69 | duhok |
| taxe-nerwa-doskiya | تاخي نيروا دوسکیا | Taxe Nerwa Doskiya | محافظة دهوك | PPL | 85 | 563 | 73.74 | duhok |
| kuchka | کوجکا | Kuchka | محافظة أربيل | PPL | 85 | 2700 | 78.84 | duhok |
| umm-qasr | ام قصر | Umm Qaşr | محافظة البصرة | PPL | 80 | 107620 | 54.19 | basra |
| daquq | داقوق | Dāqūq | محافظة كركوك | PPLA2 | 80 | - | 36.93 | kirkuk |
| suq-ash-shuyukh | سوق الشيوخ | Sūq ash Shuyūkh | محافظة ذي قار | PPLA2 | 80 | - | 26.27 | nasiriyah |
| samarra | سامراء | Sāmarrā’ | محافظة صلاح الدين | PPL | 80 | 158508 | 48.36 | tikrit |
| safwan | صفوان | Şafwān | محافظة البصرة | PPL | 80 | 22929 | 44.02 | basra |
| qalat-sukkar | قلعة سکر | Qal‘at Sukkar | محافظة ذي قار | PPL | 80 | 110000 | 91.44 | nasiriyah |
| mandali | مندلي | Mandalī | محافظة ديالى | PPL | 80 | 29785 | 120.25 | baghdad |
| al-haqlaniyah | الحقلانية | Al Ḩaqlānīyah | محافظة الأنبار | PPLA3 | 80 | - | 114.26 | ramadi |
| dukan | دوكان | Dukan | محافظة السليمانية | PPLA2 | 80 | - | 58.65 | sulaymaniyah |
| bartalah | برطلة | Barţalah | محافظة نينوى | PPL | 80 | 15000 | 20.03 | mosul |
| baladruz | بلدروز | Baladrūz | محافظة ديالى | PPLA2 | 80 | - | 78.42 | baghdad |
| badrah | بدرة | Badrah | محافظة واسط | PPLA2 | 80 | - | 147.49 | baghdad |
| at-tarmiyah | الطارمية | Aţ Ţārmīyah | محافظة بغداد | PPLA2 | 80 | - | 40.04 | baghdad |
| as-salman | السلمان | As Salmān | محافظة المثنى | PPLA2 | 80 | - | 167.47 | najaf |
| ar-rifai | الرفاعي | Ar Rifā‘ī | محافظة ذي قار | PPLA2 | 80 | - | 75.28 | nasiriyah |
| al-mishkhab | المشخاب | Al Mishkhāb | محافظة النجف | PPL | 80 | 23189 | 26.06 | najaf |
| al-maymunah | الميمونة | Al Maymūnah | محافظة ميسان | PPLA2 | 80 | - | 96.72 | nasiriyah |
| khalis | خالص | Khāliş | محافظة ديالى | PPL | 80 | 70046 | 56.96 | baghdad |
| al-kahla | الكحلاء | Al Kaḩlā’ | محافظة ميسان | PPLA2 | 80 | - | 119.68 | nasiriyah |
| al-hashimiyah | الهاشمية | Al Hāshimīyah | محافظة بابل | PPLA2 | 80 | - | 50.39 | najaf |
| al-hamzah | الحمزة | Al Ḩamzah | محافظة القادسية | PPLA2 | 80 | - | 67.64 | najaf |
| al-hadar | الحضر | Al Ḩaḑar | محافظة نينوى | PPLA2 | 80 | - | 94.34 | mosul |
| al-baaj | البعاج | Al Ba‘āj | محافظة نينوى | PPLA2 | 80 | - | 133.75 | mosul |
| ad-dawr | الدور | Ad Dawr | محافظة صلاح الدين | PPLA2 | 80 | - | 18.77 | tikrit |
| akra | بيوك | 'Ākra | محافظة نينوى | PPL | 80 | 105370 | 61.42 | erbil |
| khalifan | خليفان | Khalīfān | محافظة أربيل | PPL | 80 | 19891 | 58.38 | erbil |
| nahiyat-hiran | ناحية هيران | Nāḩiyat Hīrān | محافظة أربيل | PPLA3 | 80 | - | 44.04 | erbil |
| nahiyat-bahar | ناحية بحار | Nāḩiyat Baḩār | محافظة البصرة | PPLA3 | 80 | - | 69.80 | basra |
| nahiyat-atbah | ناحية عتبة | Nāḩiyat ‘Atbah | محافظة البصرة | PPLA3 | 80 | - | 22.61 | basra |
| sadr-city | مدينة الصدر | Sadr City | محافظة بغداد | PPL | 80 | 1211849 | 11.85 | baghdad |
| hilora | هلورا | Hilora | محافظة دهوك | PPL | 80 | 750 | 77.69 | duhok |
| hetit | هتيت | Hetit | محافظة دهوك | PPL | 80 | 2700 | 68.44 | duhok |
| shurash | شورش | Shūrash | محافظة السليمانية | PPL | 80 | 29960 | 41.11 | kirkuk |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| majid-salar | مجيد سالار | Majīd Sālār | محافظة ديالى | PPL | 70 | 109.98 |
| qaryat-az-zuwiyah | الزوية | Qaryat az Zuwīyah | محافظة صلاح الدين | PPL | 70 | 77.82 |
| zurbatiyah | زرباتیه | Zurbāţīyah | محافظة واسط | PPL | 70 | 156.52 |
| hizan | قرية هيزان | Hīzān | محافظة نينوى | PPL | 70 | 47.73 |
| ziyaret | زيارت | Ziyaret | محافظة أربيل | PPL | 70 | 101.94 |
| rabiyah-kah | ربية كة | Rabiyah Kah | محافظة السليمانية | PPL | 70 | 19.94 |
| zaywah-biramus | زيوه براموس | Zaywah Birāmūs | محافظة دهوك | PPL | 70 | 35.62 |
| zirinjaw | زرنجو | Zirinjaw | محافظة السليمانية | PPL | 70 | 30.37 |
| zirkwayz | زيركويز | Zīrkwayz | محافظة السليمانية | PPL | 70 | 20.10 |
| zireza | زريزة | Zireza | محافظة دهوك | PPL | 70 | 38.54 |
| zinu-strokan | zynۆy yەstێrۆkan | Zinu Strokān | محافظة أربيل | PPL | 70 | 72.80 |
| kochina-mala-farzo | كوچينە مەلا فەرزو | Kochina Mala Farzo | محافظة نينوى | PPL | 70 | 62.11 |
| kaylah-zindan | كيلة زندان | Kaylah Zindān | محافظة أربيل | PPL | 70 | 63.71 |
| zaniwah-atiq | zynava kەvn | Zanīwah ‘Atīq | محافظة نينوى | PPL | 70 | 41.18 |
| zaniwah-ghazi | زانيوة غازي | Zānīwah Ghāzī | محافظة نينوى | PPL | 70 | 44.77 |
| zinawah | زيناوه | Zīnāwah | محافظة دهوك | PPL | 70 | 21.72 |
| qaryat-zumrah-abd-allah | زومارە عەبدوڵڵا | Qaryat Zumrah ‘Abd Allāh | محافظة أربيل | PPL | 70 | 47.81 |
| zumar | زومار | Zumar | محافظة أربيل | PPL | 70 | 47.44 |
| zilkah-shaykh-abd-al-aziz | zێlkە ʿەbdwlʿzyz | Zilkah Shaykh ‘Abd al ‘Azīz | محافظة نينوى | PPL | 70 | 51.67 |
| ziye | رياه | Zîye | محافظة السليمانية | PPL | 70 | 32.11 |
| kamalan-al-ulya | كمالان العليا | Kamālān al ‘Ulyā | محافظة السليمانية | PPL | 70 | 23.99 |
| jiliya | جيليا | Jīliyā | محافظة أربيل | PPL | 70 | 93.00 |
| jajuk | زازوك | Jajuk | محافظة أربيل | PPL | 70 | 79.09 |
| jaj | جاش | Jaj | محافظة السليمانية | PPL | 70 | 48.84 |
| zalah-as-sufla | زاله السفلى | Zālah as Suflá | محافظة السليمانية | PPL | 70 | 9.09 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **13833**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| barchoqa | Barchoqā | Barchoqā | محافظة ديالى | PPL | missing_real_ar_name |
| taha | Ţāhā | Ţāhā | محافظة البصرة | PPL | missing_real_ar_name |
| khamis-al-qata | Khamīs al Qaţā | Khamīs al Qaţā | محافظة ديالى | PPL | missing_real_ar_name |
| al-huwaykiyah | Al Ḩuwaykīyah | Al Ḩuwaykīyah | محافظة ميسان | PPL | missing_real_ar_name |
| zuwayyah | Zuwayyah | Zuwayyah | محافظة واسط | PPL | missing_real_ar_name |
| zurarq | Zurarq | Zurarq | محافظة الأنبار | PPL | missing_real_ar_name |
| zunbur | Zunbūr | Zunbūr | محافظة ديالى | PPL | missing_real_ar_name |
| zunbur | Zunbūr | Zunbūr | محافظة واسط | PPL | missing_real_ar_name |
| zummar | Zummār | Zummār | محافظة نينوى | PPL | missing_real_ar_name |
| zulaymat | Zulaymāt | Zulaymāt | محافظة ذي قار | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| jami-ash-shaykh-hamad | جامع الشيخ حمد | Jāmi‘ ash Shaykh Ḩamad | religious_site_not_city | جامع(?!ة) |
| qaryat-al-jami | قرية الجامع | Qaryat al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| ayid-as-sayyid-jam | عايد السيد جامع | ‘Āyid as Sayyid Jām‘ | religious_site_not_city | جامع(?!ة) |
| qaryat-umm-masjid | قرية ام مسجد | Qaryat Umm Masjid | religious_site_not_city | مسجد |
| kiri-jami | كري جامع | Kirī Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| kurka-mizgeft | kwrka mzgەft | Kurka Mizgeft | religious_site_not_city | \bmasjid\b |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tikrit | tikrit | slug |
| sulaymaniyah | sulaymaniyah | slug |
| sulaymaniyah | sulaymaniyah | slug |
| sulaymaniyah | sulaymaniyah | slug |
| kirkuk | kirkuk | slug |
| karbala | karbala | slug |
| erbil | erbil | slug |
| dihok | duhok | coords<1km (d=0.11km) |
| baghdad | baghdad | slug |
| sulaymaniyah | sulaymaniyah | slug |

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
