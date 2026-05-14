# PS GeoNames Import Report (refined)

**Country**: Palestine (فلسطين)
**Generated**: 2026-05-14T17:12:20.943Z
**Phase**: `CURATED-GEODATA-PS-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/ps-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/ps-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/ps-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/ps-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 1269 |
| Normalized candidates                     | 837 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **422** |
| **medium_confidence_pending**             | **4** |
| **low_confidence_pending**                | **198** |
| needs_review                              | 204 |
| existing (matched, no action)             | 9 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 9 |

**Shortlist size (high + medium):** 426

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 5 |
| coords<1km | 3 |
| ar_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rafah | رفح | Rafaḩ | قطاع غزة | PPLA2 | 95 | 126305 | 31.08 | gaza |
| khan-yunis | خان يونس | Khān Yūnis | قطاع غزة | PPLA2 | 95 | 173183 | 23.55 | gaza |
| dayr-al-balah | دير البلح | Dayr al Balaḩ | قطاع غزة | PPLA2 | 95 | 59504 | 14.49 | gaza |
| tubas | طوباس | Ţūbās | الضفة الغربية | PPLA2 | 95 | 15591 | 14.90 | nablus |
| bayt-hanun | بيت حانون | Bayt Ḩānūn | قطاع غزة | PPL | 85 | 37392 | 7.53 | gaza |
| bani-suhayla | بني سهيلا | Banī Suhaylā | قطاع غزة | PPL | 85 | 31272 | 22.25 | gaza |
| umm-al-amd | أم العمد | Umm al ‘Amd | الضفة الغربية | PPL | 85 | 150 | 9.49 | hebron |
| qaffin | فقين | Qaffīn | الضفة الغربية | PPL | 85 | 8489 | 14.52 | tulkarem |
| jannatah | بيت فلوح | Jannātah | الضفة الغربية | PPL | 85 | 5348 | 4.30 | bethlehem |
| bir-zayt | بير زيت | Bīr Zayt | الضفة الغربية | PPL | 85 | 6398 | 7.37 | ramallah |
| baytunya | بيتونيا | Baytūnyā | الضفة الغربية | PPL | 85 | 12822 | 3.21 | ramallah |
| al-ittihad | الاتحاد | Al Ittiḩād | الضفة الغربية | PPL | 85 | 2978 | 11.48 | ramallah |
| an-nasr | البيوك | An Naşr | قطاع غزة | PPL | 85 | 6211 | 29.04 | gaza |
| abasan-al-jadidah | عبسان الجديدة | ‘Abasān al Jadīdah | قطاع غزة | PPL | 85 | 5984 | 21.18 | gaza |
| umm-an-nasr | أم النصر | Umm an Naşr | قطاع غزة | PPL | 85 | 2763 | 8.21 | gaza |
| al-mughraqah | ابو مدين | Al Mughrāqah | قطاع غزة | PPL | 85 | 6448 | 6.54 | gaza |
| huwara | حوارة | Huwara | الضفة الغربية | PPL | 85 | 5570 | 7.83 | nablus |
| al-kaabinah-tajammu-badawi | الكعابنه | Al Ka‘ābinah (Tajammu‘ Badawī) | الضفة الغربية | PPL | 85 | 688 | 11.61 | jerusalem |
| umm-ad-daraj | أم الدرج | Umm ad Daraj | الضفة الغربية | PPL | 85 | 801 | 13.62 | hebron |
| khashm-ad-daraj | الهذالين | Khashm ad Daraj | الضفة الغربية | PPL | 85 | 597 | 18.51 | hebron |
| umm-al-khayr | أم الخير | Umm al Khayr | الضفة الغربية | PPL | 85 | 508 | 14.98 | hebron |
| shukat-as-sufi | شوكة الصوفي | Shūkat aş Şūfī | قطاع غزة | PPL | 80 | 10566 | 32.07 | gaza |
| an-nusayrat | النصيرات | An Nuşayrāt | قطاع غزة | PPL | 80 | 36123 | 9.19 | gaza |
| khuzaah | خزاعة | Khuzā‘ah | قطاع غزة | PPL | 80 | 9023 | 23.89 | gaza |
| jabalya | جباليا | Jabālyā | قطاع غزة | PPL | 80 | 168568 | 3.25 | gaza |
| bayt-lahya | بيت لاهيا | Bayt Lāhyā | قطاع غزة | PPL | 80 | 56919 | 5.65 | gaza |
| al-fukhkhari | الفخاري | Al Fukhkhārī | قطاع غزة | PPL | 80 | 5464 | 26.59 | gaza |
| al-burayj | البريج | Al Burayj | قطاع غزة | PPL | 80 | 34951 | 9.19 | gaza |
| abasan-al-kabirah | عبسان الكبيرة | ‘Abasān al Kabīrah | قطاع غزة | PPL | 80 | 18163 | 23.60 | gaza |
| zububah | زبوبه | Zubūbah | الضفة الغربية | PPL | 80 | 2063 | 11.72 | jenin |
| zabdah | زبدة | Zabdah | الضفة الغربية | PPL | 80 | 933 | 15.48 | jenin |
| zayta | زيتا | Zaytā | الضفة الغربية | PPL | 80 | 3052 | 8.63 | tulkarem |
| az-zawiyah | الزاوية | Az Zāwiyah | الضفة الغربية | PPL | 80 | 761 | 10.77 | jenin |
| zawata | زواتا | Zawātā | الضفة الغربية | PPL | 80 | 1855 | 4.24 | nablus |
| zatarah | زعترة | Za‘tarah | الضفة الغربية | PPL | 80 | 6210 | 6.23 | bethlehem |
| yatta | يطا | Yaţţā | الضفة الغربية | PPL | 80 | 41425 | 9.64 | hebron |
| yatma | يتما | Yatmā | الضفة الغربية | PPL | 80 | 2897 | 12.67 | nablus |
| yasuf | ياسوف | Yāsūf | الضفة الغربية | PPL | 80 | 1604 | 12.91 | nablus |
| yasid | ياصيد | Yāşīd | الضفة الغربية | PPL | 80 | 2226 | 8.38 | nablus |
| yanun | يانون | Yānūn | الضفة الغربية | PPL | 80 | 101 | 12.28 | nablus |
| yabrud | يبرود | Yabrūd | الضفة الغربية | PPL | 80 | 635 | 8.68 | ramallah |
| yabad | يعبد | Ya‘bad | الضفة الغربية | PPL | 80 | 13477 | 11.91 | jenin |
| urif | عوريف | ‘Ūrīf | الضفة الغربية | PPL | 80 | 2890 | 7.96 | nablus |
| umm-safa | أم صفا | Umm Şafā | الضفة الغربية | PPL | 80 | 604 | 12.24 | ramallah |
| umm-at-tut | أم التوت | Umm at Tūt | الضفة الغربية | PPL | 80 | 977 | 5.42 | jenin |
| udalah | أودلا | Ūdalah | الضفة الغربية | PPL | 80 | 1123 | 7.80 | nablus |
| turmusayya | ترمسعيا | Turmus‘ayyā | الضفة الغربية | PPL | 80 | 3686 | 16.56 | ramallah |
| turah-ash-sharqiyah | طورة الشرقية | Ţūrah ash Sharqīyah | الضفة الغربية | PPL | 80 | 172 | 11.59 | jenin |
| turah-al-gharbiyah | طورة الغربية | Ţūrah al Gharbīyah | الضفة الغربية | PPL | 80 | 907 | 13.38 | jenin |
| tilfit | تلفيت | Tilfīt | الضفة الغربية | PPL | 80 | 235 | 7.60 | jenin |
| tiinnik | تعنك | Ti‘innik | الضفة الغربية | PPL | 80 | 988 | 9.87 | jenin |
| tayasir | تياسير | Tayāsīr | الضفة الغربية | PPL | 80 | 2323 | 16.11 | jenin |
| tarqumya | ترقوميا | Tarqūmyā | الضفة الغربية | PPL | 80 | 14202 | 9.58 | hebron |
| at-tarm | الطرم | Aţ Ţarm | الضفة الغربية | PPL | 80 | 365 | 9.72 | jenin |
| tammun | طمون | Ţammūn | الضفة الغربية | PPL | 80 | 10119 | 13.28 | nablus |
| talluzah | طلوزة | Ţallūzah | الضفة الغربية | PPL | 80 | 2604 | 6.15 | nablus |
| till | تل | Till | الضفة الغربية | PPL | 80 | 4605 | 5.23 | nablus |
| talfit | تلفيت | Talfīt | الضفة الغربية | PPL | 80 | 2906 | 15.37 | nablus |
| taffuh | تفوح | Taffūḩ | الضفة الغربية | PPL | 80 | 9480 | 4.80 | hebron |
| surif-city | صوريف | Surif City | الضفة الغربية | PPL | 80 | 25242 | 13.57 | hebron |
| surda | صردا | Surdā | الضفة الغربية | PPL | 80 | 1017 | 3.70 | ramallah |
| siris | سيريس | Sīrīs | الضفة الغربية | PPL | 80 | 4898 | 12.06 | nablus |
| sir | صير | Şīr | الضفة الغربية | PPL | 80 | 735 | 10.60 | jenin |
| sinjil | سنجل | Sinjil | الضفة الغربية | PPL | 80 | 5371 | 15.55 | ramallah |
| silwad | سلواد | Silwād | الضفة الغربية | PPL | 80 | 7006 | 9.73 | ramallah |
| silat-az-zahr | سيلة الظهر | Sīlat az̧ Z̧ahr | الضفة الغربية | PPL | 80 | 6079 | 13.01 | nablus |
| silat-al-harithiyah | سيلة الحارثية | Sīlat al Ḩārithīyah | الضفة الغربية | PPL | 80 | 9557 | 8.48 | jenin |
| sair | سعير | Sa‘īr | الضفة الغربية | PPL | 80 | 17775 | 6.39 | hebron |
| shuqba | شقبا | Shuqbā | الضفة الغربية | PPL | 80 | 4188 | 17.97 | ramallah |
| shufah | شوفة | Shūfah | الضفة الغربية | PPL | 80 | 2174 | 6.30 | tulkarem |
| shabtin | شبتين | Shabtīn | الضفة الغربية | PPL | 80 | 833 | 16.43 | ramallah |
| sayda | صيدا | Şaydā | الضفة الغربية | PPL | 80 | 2988 | 11.83 | tulkarem |
| sartah | صرطة | Şarţah | الضفة الغربية | PPL | 80 | 2528 | 20.72 | nablus |
| sarrah | صرة | Şarrah | الضفة الغربية | PPL | 80 | 2810 | 6.80 | nablus |
| sanur | صانور | Şānūr | الضفة الغربية | PPL | 80 | 4141 | 12.14 | jenin |
| sannirya | سنيريا | Sannīryā | الضفة الغربية | PPL | 80 | 2887 | 20.27 | tulkarem |
| salim | سالم | Sālim | الضفة الغربية | PPL | 80 | 4940 | 6.58 | nablus |
| salfit | سلفيت | Salfīt | الضفة الغربية | PPL | 80 | 11000 | 17.25 | nablus |
| saffarin | سفارين | Saffārīn | الضفة الغربية | PPL | 80 | 753 | 9.36 | tulkarem |
| saffa | صفا | Şaffā | الضفة الغربية | PPL | 80 | 3904 | 13.45 | ramallah |
| sabastiyah | سبسطية | Sabasţīyah | الضفة الغربية | PPL | 80 | 2823 | 8.38 | nablus |
| rummanah | رمنة | Rummanah | الضفة الغربية | PPL | 80 | 3275 | 11.26 | jenin |
| rujayb | روجيب | Rūjayb | الضفة الغربية | PPL | 80 | 3805 | 4.62 | nablus |
| ras-karkar | راس كركر | Rās Karkar | الضفة الغربية | PPL | 80 | 1641 | 10.00 | ramallah |
| rantis | رنتيس | Rantīs | الضفة الغربية | PPL | 80 | 2795 | 22.22 | ramallah |
| rammun | رمون | Rammūn | الضفة الغربية | PPL | 80 | 3101 | 9.54 | ramallah |
| ramin | رامين | Rāmīn | الضفة الغربية | PPL | 80 | 2040 | 11.71 | tulkarem |
| rafat | رافات | Rāfāt | الضفة الغربية | PPL | 80 | 1952 | 24.52 | ramallah |
| rafat | رافات | Rāfāt | الضفة الغربية | PPL | 80 | 2061 | 3.81 | ramallah |
| raba | رابا | Rābā | الضفة الغربية | PPL | 80 | 2951 | 11.41 | jenin |
| qusrah | قصرة | Quşrah | الضفة الغربية | PPL | 80 | 4316 | 16.55 | nablus |
| qusin | قوصين | Qūşīn | الضفة الغربية | PPL | 80 | 1691 | 7.64 | nablus |
| qirah | قيرة | Qīrah | الضفة الغربية | PPL | 80 | 1131 | 14.05 | nablus |
| qibyah | قبيه | Qibyah | الضفة الغربية | PPL | 80 | 4761 | 20.01 | ramallah |
| qatanah | قطنه | Qaţanah | الضفة الغربية | PPL | 80 | 7274 | 11.15 | ramallah |
| innab-al-kabir | عناب الكبير | ‘Innāb al Kabīr | الضفة الغربية | PPL | 80 | 330 | 22.31 | hebron |
| qaryut | قريوت | Qaryūt | الضفة الغربية | PPL | 80 | 2399 | 17.24 | nablus |
| qarawat-bani-zayd | قراوة بني زيد | Qarāwat Banī Zayd | الضفة الغربية | PPL | 80 | 2673 | 18.18 | ramallah |
| qarawat-bani-hasan | قراوة بني حسان | Qarāwat Banī Ḩasan | الضفة الغربية | PPL | 80 | 3761 | 18.64 | nablus |
| qalqilyah | قلقيلية | Qalqīlyah | الضفة الغربية | PPL | 80 | 43212 | 14.49 | tulkarem |
| qalandiya | قلنديا | Qalandiyā | الضفة الغربية | PPL | 80 | 1169 | 4.57 | ramallah |
| qabatiyah | قباطية | Qabāţīyah | الضفة الغربية | PPL | 80 | 19127 | 5.35 | jenin |
| qabalan | قبلان | Qabalān | الضفة الغربية | PPL | 80 | 7043 | 13.68 | nablus |
| nuba | نوبا | Nūbā | الضفة الغربية | PPL | 80 | 4328 | 10.52 | hebron |
| nisf-jubayl | نصف جبيل | Nişf Jubayl | الضفة الغربية | PPL | 80 | 390 | 7.94 | nablus |
| nilin | نعلين | Ni‘līn | الضفة الغربية | PPL | 80 | 4512 | 17.95 | ramallah |
| nazlat-isa | نزلة عيسى | Nazlat ‘Īsá | الضفة الغربية | PPL | 80 | 2313 | 12.04 | tulkarem |
| nahhalin | نحالين | Naḩḩālīn | الضفة الغربية | PPL | 80 | 6215 | 8.03 | bethlehem |
| mikhmas | مخماس | Mikhmās | الضفة الغربية | PPL | 80 | 1461 | 7.70 | ramallah |
| misliyah | مسلية | Mislīyah | الضفة الغربية | PPL | 80 | 2187 | 7.92 | jenin |
| mirkah | مركة | Mirkah | الضفة الغربية | PPL | 80 | 1592 | 8.62 | jenin |
| maythalun | ميثلون | Maythalūn | الضفة الغربية | PPL | 80 | 6804 | 12.28 | jenin |
| mashah | مسحة | Masḩah | الضفة الغربية | PPL | 80 | 1982 | 22.57 | tulkarem |
| marj-najah | مرج نعجة | Marj Na‘jah | الضفة الغربية | PPL | 80 | 706 | 26.39 | nablus |
| marda | مردا | Mardā | الضفة الغربية | PPL | 80 | 2142 | 13.64 | nablus |
| al-malih | المالح | Al Māliḩ | الضفة الغربية | PPL | 80 | 364 | 21.33 | jenin |
| majdal-bani-fadil | مجدل بني فاضل | Majdal Banī Fāḑil | الضفة الغربية | PPL | 80 | 2122 | 18.19 | nablus |
| madama | مادما | Mādamā | الضفة الغربية | PPL | 80 | 1735 | 5.03 | nablus |
| al-lubban-ash-sharqiyah | اللبن الشرقية | Al Lubban ash Sharqīyah | الضفة الغربية | PPL | 80 | 2439 | 17.09 | nablus |
| kur | كور | Kūr | الضفة الغربية | PPL | 80 | 260 | 10.56 | tulkarem |
| kufayrit | كفيرت | Kufayrit | الضفة الغربية | PPL | 80 | 2376 | 8.81 | jenin |
| kifil-haris | كفل حارس | Kifil Ḩāris | الضفة الغربية | PPL | 80 | 3132 | 15.24 | nablus |
| qila-zayta | قلاع زيتا | Qilā‘ Zaytā | الضفة الغربية | PPL | 80 | 889 | 3.02 | hebron |
| zahr-al-abd | ظهر العبد | Z̧ahr al ‘Abd | الضفة الغربية | PPL | 80 | 359 | 16.66 | tulkarem |
| umm-salmunah | أم سلمونة | Umm Salmūnah | الضفة الغربية | PPL | 80 | 933 | 7.56 | bethlehem |
| ar-ramadin | الرماضين | Ar Ramāḑīn | الضفة الغربية | PPL | 80 | 3232 | 24.60 | hebron |
| umm-ar-rihan | أم الريحان | Umm ar Rīḩān | الضفة الغربية | PPL | 80 | 366 | 14.69 | jenin |
| khirbat-sir | خربة صير | Khirbat Şīr | الضفة الغربية | PPL | 80 | 442 | 12.86 | tulkarem |
| ras-at-tirah | راس الطيرة | Rās aţ Ţīrah | الضفة الغربية | PPL | 80 | 389 | 16.63 | tulkarem |
| ras-atiyah | راس عطية | Rās ‘Aţīyah | الضفة الغربية | PPL | 80 | 2129 | 17.26 | tulkarem |
| qalqas | قلقس | Qalqas | الضفة الغربية | PPL | 80 | 1132 | 4.51 | hebron |
| khirbat-qays | خربة قيس | Khirbat Qays | الضفة الغربية | PPL | 80 | 224 | 17.85 | ramallah |
| imrish | إمريش | Imrīsh | الضفة الغربية | PPL | 80 | 1640 | 11.20 | hebron |
| marah-rabbah | مراح رباح | Marāḩ Rabbāḩ | الضفة الغربية | PPL | 80 | 1303 | 8.07 | bethlehem |
| ad-dabah | الضبعة | Aḑ Ḑab‘ah | الضفة الغربية | PPL | 80 | 331 | 17.00 | tulkarem |
| kashdah | كشدة | Kashdah | الضفة الغربية | PPL | 80 | 66 | 12.52 | nablus |
| kurzah | كرزة | Kurzah | الضفة الغربية | PPL | 80 | 759 | 13.93 | hebron |
| dayr-ar-razih | دير الرازح | Dayr ar Rāziḩ | الضفة الغربية | PPL | 80 | 294 | 9.16 | hebron |
| dayr-al-asal-at-tahta | دير العسل التحتا | Dayr al ‘Asal at Taḩtā | الضفة الغربية | PPL | 80 | 547 | 16.12 | hebron |
| dayr-al-asal-al-fawqa | دير العسل الفوقا | Dayr al ‘Asal al Fawqā | الضفة الغربية | PPL | 80 | 1859 | 16.89 | hebron |
| bayt-tamar | بيت تعمر | Bayt Ta‘mar | الضفة الغربية | PPL | 80 | 1214 | 4.58 | bethlehem |
| khallat-sakarya | خلة سكاريا | Khallat Sakāryā | الضفة الغربية | PPL | 80 | 183 | 8.82 | bethlehem |
| bayt-mirsim | بيت مرسم | Bayt Mirsim | الضفة الغربية | PPL | 80 | 313 | 19.74 | hebron |
| bayt-hasan | بيت حسن | Bayt Ḩasan | الضفة الغربية | PPL | 80 | 1109 | 13.46 | nablus |
| bayt-awwa | بيت عوا | Bayt ‘Awwā | الضفة الغربية | PPL | 80 | 7943 | 14.49 | hebron |
| bayt-amin | بيت أمين | Bayt Amīn | الضفة الغربية | PPL | 80 | 998 | 19.91 | tulkarem |
| kharaib-umm-al-lahm | خرائب أم اللحم | Kharā’ib Umm al Laḩm | الضفة الغربية | PPL | 80 | 360 | 12.54 | ramallah |
| khirbat-atuf | خربة عطوف | Khirbat ‘Aţūf | الضفة الغربية | PPL | 80 | 168 | 17.10 | nablus |
| tarramah | طرامة | Ţarrāmah | الضفة الغربية | PPL | 80 | 622 | 8.59 | hebron |
| sikkah | سكة | Sikkah | الضفة الغربية | PPL | 80 | 842 | 15.54 | hebron |
| ash-shaykh-sad | الشيخ سعد | Ash Shaykh Sa‘d | الضفة الغربية | PPL | 80 | 1932 | 5.39 | jerusalem |
| bayt-ar-rush-at-tahta | بيت الروش التحتا | Bayt ar Rūsh at Taḩtā | الضفة الغربية | PPL | 80 | 367 | 17.33 | hebron |
| bayt-ar-rush-al-fawqa | بيت الروش الفوقا | Bayt ar Rūsh al Fawqā | الضفة الغربية | PPL | 80 | 964 | 18.71 | hebron |
| akkabah | عكابة | ‘Akkābah | الضفة الغربية | PPL | 80 | 252 | 16.11 | tulkarem |
| nazlat-ash-shaykh-zayd | نزلة الشيخ زيد | Nazlat ash Shaykh Zayd | الضفة الغربية | PPL | 80 | 696 | 11.22 | jenin |
| al-mutillah | المطلة | Al Muţillah | الضفة الغربية | PPL | 80 | 291 | 11.38 | jenin |
| an-nassariyah | النصارية | An Naşşārīyah | الضفة الغربية | PPL | 80 | 1568 | 11.86 | nablus |
| kharbatha-al-misbah | خربثا المصباح | Kharbathā al Mişbāḩ | الضفة الغربية | PPL | 80 | 5141 | 12.59 | ramallah |
| al-majd | المجد | Al Majd | الضفة الغربية | PPL | 80 | 1896 | 15.26 | hebron |
| karmah | كرمة | Karmah | الضفة الغربية | PPL | 80 | 1365 | 11.31 | hebron |
| al-jarushiyah | الجاروشية | Al Jārūshīyah | الضفة الغربية | PPL | 80 | 924 | 4.54 | tulkarem |
| al-burj | البرج | Al Burj | الضفة الغربية | PPL | 80 | 2381 | 20.38 | hebron |
| khirbat-al-ashqar | خربة الأشقر | Khirbat al Ashqar | الضفة الغربية | PPL | 80 | 311 | 18.88 | tulkarem |
| shuyukh-al-arrub | شيوخ العروب | Shuyūkh al ‘Arrūb | الضفة الغربية | PPL | 80 | 1527 | 10.31 | hebron |
| al-aqrabaniyah | العقربانية | Al ‘Aqrabānīyah | الضفة الغربية | PPL | 80 | 990 | 11.42 | nablus |
| khirbat-ad-dayr | خربة الدير | Khirbat ad Dayr | الضفة الغربية | PPL | 80 | 260 | 15.39 | hebron |
| khirbat-abu-falah | خربة أبو فلاح | Khirbat Abū Falāḩ | الضفة الغربية | PPL | 80 | 3961 | 15.60 | ramallah |
| khirbat-abd-allah-al-yunis | خربة عبد الله اليونس | Khirbat ‘Abd Allāh al Yūnis | الضفة الغربية | PPL | 80 | 136 | 17.05 | jenin |
| kharbatha-bani-harith | خربثا بني حارث | Kharbathā Banī Ḩārith | الضفة الغربية | PPL | 80 | 2808 | 13.23 | ramallah |
| kharas | خاراس | Khārās | الضفة الغربية | PPL | 80 | 6885 | 10.68 | hebron |
| khallat-al-mayyah | خلة المية | Khallat al Mayyah | الضفة الغربية | PPL | 80 | 1391 | 10.84 | hebron |
| kubar | كوبر | Kūbar | الضفة الغربية | PPL | 80 | 3546 | 10.22 | ramallah |
| kafr-zibad | كفر زيباد | Kafr Zībād | الضفة الغربية | PPL | 80 | 1068 | 10.24 | tulkarem |
| kafr-thulth | كفر ثلث | Kafr Thulth | الضفة الغربية | PPL | 80 | 4218 | 17.55 | tulkarem |
| kafr-sur | كفر صور | Kafr Şūr | الضفة الغربية | PPL | 80 | 1107 | 8.13 | tulkarem |
| kafr-rai | كفر راعي | Kafr Rā‘ī | الضفة الغربية | PPL | 80 | 7276 | 13.78 | tulkarem |
| kafr-qud | كفر قود | Kafr Qūd | الضفة الغربية | PPL | 80 | 1129 | 6.37 | jenin |
| kafr-qallil | كفر قليل | Kafr Qallīl | الضفة الغربية | PPL | 80 | 2421 | 3.79 | nablus |
| kafr-qaddum | كفر قدوم | Kafr Qaddūm | الضفة الغربية | PPL | 80 | 3376 | 11.04 | nablus |
| kafr-malik | كفر مالك | Kafr Mālik | الضفة الغربية | PPL | 80 | 2903 | 13.72 | ramallah |
| kafr-laqif | كفر لاقف | Kafr Lāqif | الضفة الغربية | PPL | 80 | 846 | 15.28 | tulkarem |
| kafr-jammal | كفر جمال | Kafr Jammāl | الضفة الغربية | PPL | 80 | 2481 | 9.54 | tulkarem |
| kafr-dan | كفر دان | Kafr Dān | الضفة الغربية | PPL | 80 | 4967 | 4.46 | jenin |
| kafr-al-labad | كفر اللبد | Kafr al Labad | الضفة الغربية | PPL | 80 | 3915 | 7.70 | tulkarem |
| kafr-ad-dik | كفر الديك | Kafr ad Dīk | الضفة الغربية | PPL | 80 | 4986 | 21.42 | ramallah |
| kafr-abbush | كفر عبوش | Kafr ‘Abbūsh | الضفة الغربية | PPL | 80 | 1444 | 11.02 | tulkarem |
| jurish | جوريش | Jūrīsh | الضفة الغربية | PPL | 80 | 1385 | 14.56 | nablus |
| jurat-ash-shamah | جورة الشمعة | Jūrat ash Sham‘ah | الضفة الغربية | PPL | 80 | 1472 | 6.83 | bethlehem |
| al-judayyidah | الجديدة | Al Judayyidah | الضفة الغربية | PPL | 80 | 4681 | 13.06 | nablus |
| jit | جيت | Jīt | الضفة الغربية | PPL | 80 | 2243 | 8.64 | nablus |
| jiljiliya | جلجيليا | Jiljīlīyā | الضفة الغربية | PPL | 80 | 731 | 14.14 | ramallah |
| jifna | جفنا | Jifnā | الضفة الغربية | PPL | 80 | 1693 | 6.53 | ramallah |
| jibiya | جيبيا | Jībiyā | الضفة الغربية | PPL | 80 | 146 | 11.25 | ramallah |
| jayyus | جيوس | Jayyūs | الضفة الغربية | PPL | 80 | 3196 | 12.15 | tulkarem |
| jammalah | جمالة | Jammālah | الضفة الغربية | PPL | 80 | 1664 | 12.90 | ramallah |
| jalud | جالود | Jālūd | الضفة الغربية | PPL | 80 | 459 | 18.09 | nablus |
| jalqamus | جلقموس | Jalqamūs | الضفة الغربية | PPL | 80 | 1968 | 7.48 | jenin |
| jalbun | جلبون | Jalbūn | الضفة الغربية | PPL | 80 | 2421 | 11.33 | jenin |
| al-jalamah | الجلمة | Al Jalamah | الضفة الغربية | PPL | 80 | 2035 | 5.95 | jenin |
| jaba | جبع | Jaba‘ | الضفة الغربية | PPL | 80 | 8391 | 11.91 | nablus |
| jaba | جبع | Jaba‘ | الضفة الغربية | PPL | 80 | 3214 | 7.35 | ramallah |
| izbat-at-tabib | عزبة الطبيب | ‘Izbat aţ Ţabīb | الضفة الغربية | PPL | 80 | 228 | 14.34 | tulkarem |
| aslah | عسلة | ‘Aslah | الضفة الغربية | PPL | 80 | 845 | 15.26 | tulkarem |
| iskaka | إسكاكة | Iskākā | الضفة الغربية | PPL | 80 | 902 | 13.70 | nablus |
| iraq-burin | عراق بورين | ‘Irāq Būrīn | الضفة الغربية | PPL | 80 | 760 | 3.11 | nablus |
| immatin | إماتين | Immātīn | الضفة الغربية | PPL | 80 | 2368 | 10.35 | nablus |
| illar | علار | ‘Illār | الضفة الغربية | PPL | 80 | 6681 | 9.93 | tulkarem |
| ijnisinya | إجنسنيا | Ijnisinyā | الضفة الغربية | PPL | 80 | 500 | 7.11 | nablus |
| idhna | إذنا | Idhnā | الضفة الغربية | PPL | 80 | 18727 | 12.24 | hebron |
| ibziq | إبزيق | Ibzīq | الضفة الغربية | PPL | 80 | 208 | 13.77 | jenin |
| huwwarah | حوارة | Ḩuwwārah | الضفة الغربية | PPL | 80 | 5633 | 7.85 | nablus |
| husan | حوسان | Ḩūsān | الضفة الغربية | PPL | 80 | 5535 | 6.41 | bethlehem |
| khirbat-humsah | خربة حمصة | Khirbat Ḩumşah | الضفة الغربية | PPL | 80 | 131 | 21.59 | nablus |
| hizma | حزما | Ḩizmā | الضفة الغربية | PPL | 80 | 5916 | 8.61 | jerusalem |
| haris | حارس | Ḩāris | الضفة الغربية | PPL | 80 | 2967 | 16.54 | nablus |
| halhul | حلحول | Ḩalḩūl | الضفة الغربية | PPL | 80 | 21076 | 5.32 | hebron |
| hajjah | حجة | Ḩajjah | الضفة الغربية | PPL | 80 | 2444 | 12.52 | nablus |
| hablah | حبلة | Ḩablah | الضفة الغربية | PPL | 80 | 5945 | 16.84 | tulkarem |
| khirbat-al-fakhit | خربة الفخيت | Khirbat al Fakhīt | الضفة الغربية | PPL | 80 | 228 | 18.44 | hebron |
| farkhah | فرخة | Farkhah | الضفة الغربية | PPL | 80 | 1351 | 18.95 | ramallah |
| farata | فرعتا | Far‘atā | الضفة الغربية | PPL | 80 | 634 | 9.71 | nablus |
| faqquah | فقوعة | Faqqū‘ah | الضفة الغربية | PPL | 80 | 3426 | 10.70 | jenin |
| falamyah | فلامية | Falāmyah | الضفة الغربية | PPL | 80 | 625 | 9.51 | tulkarem |
| fahmah | فحمة | Faḩmah | الضفة الغربية | PPL | 80 | 2369 | 13.61 | jenin |
| dura-al-qar | دورا قرع | Dūrā al Qar‘ | الضفة الغربية | PPL | 80 | 2858 | 6.50 | ramallah |
| dura | دورا | Dūrā | الضفة الغربية | PPL | 80 | 20835 | 7.23 | hebron |
| duma | دوما | Dūmā | الضفة الغربية | PPL | 80 | 2157 | 20.97 | nablus |
| dayr-sharaf | دير شرف | Dayr Sharaf | الضفة الغربية | PPL | 80 | 2681 | 7.67 | nablus |
| dayr-qiddis | دير قديس | Dayr Qiddīs | الضفة الغربية | PPL | 80 | 1916 | 15.81 | ramallah |
| dayr-nizam | دير نظام | Dayr Niz̧ām | الضفة الغربية | PPL | 80 | 867 | 13.85 | ramallah |
| dayr-jarir | دير جرير | Dayr Jarīr | الضفة الغربية | PPL | 80 | 4156 | 10.92 | ramallah |
| dayr-istiya | دير إستيا | Dayr Istiyā | الضفة الغربية | PPL | 80 | 3730 | 15.39 | nablus |
| dayr-ibzi | دير إبزيع | Dayr Ibzī‘ | الضفة الغربية | PPL | 80 | 2041 | 7.92 | ramallah |
| dayr-ghazalah | دير غزالة | Dayr Ghazālah | الضفة الغربية | PPL | 80 | 884 | 6.84 | jenin |
| dayr-dibwan | دير دبوان | Dayr Dibwān | الضفة الغربية | PPL | 80 | 6692 | 6.02 | ramallah |
| dayr-ballut | دير بلوط | Dayr Ballūţ | الضفة الغربية | PPL | 80 | 3566 | 24.66 | ramallah |
| dayr-as-sudan | دير السودان | Dayr as Sūdān | الضفة الغربية | PPL | 80 | 2104 | 15.18 | ramallah |
| dayr-al-hatab | دير الحطب | Dayr al Ḩaţab | الضفة الغربية | PPL | 80 | 2194 | 5.60 | nablus |
| dayr-al-ghusun | دير الغصون | Dayr al Ghuşūn | الضفة الغربية | PPL | 80 | 9187 | 6.51 | tulkarem |
| dayr-abu-mashal | دير أبو مشعل | Dayr Abū Mash‘al | الضفة الغربية | PPL | 80 | 3475 | 16.55 | ramallah |
| dayr-abu-daif | دير أبو ضعيف | Dayr Abū Ḑa‘īf | الضفة الغربية | PPL | 80 | 5506 | 6.31 | jenin |
| bruqin | بروقين | Brūqīn | الضفة الغربية | PPL | 80 | 3538 | 21.13 | ramallah |
| birqin | برقين | Birqīn | الضفة الغربية | PPL | 80 | 5730 | 3.17 | jenin |
| burqah | برقة | Burqah | الضفة الغربية | PPL | 80 | 3631 | 10.95 | nablus |
| burqah | برقة | Burqah | الضفة الغربية | PPL | 80 | 2238 | 4.87 | ramallah |
| burin | بورين | Būrīn | الضفة الغربية | PPL | 80 | 2500 | 4.39 | nablus |
| burham | برهام | Burhām | الضفة الغربية | PPL | 80 | 608 | 9.94 | ramallah |
| budrus | بدرس | Budrus | الضفة الغربية | PPL | 80 | 1380 | 20.95 | ramallah |
| bir-nabala | بير نبالا | Bīr Nabālā | الضفة الغربية | PPL | 80 | 4776 | 5.89 | ramallah |
| khirbat-bir-al-idd | خربة بير العد | Khirbat Bīr al ‘Idd | الضفة الغربية | PPL | 80 | 117 | 17.73 | hebron |
| biddu | بدو | Biddū | الضفة الغربية | PPL | 80 | 6180 | 9.21 | ramallah |
| bidya | بديا | Bidyā | الضفة الغربية | PPL | 80 | 8065 | 20.91 | nablus |
| bazzaryah | بزاريه | Bazzāryah | الضفة الغربية | PPL | 80 | 2091 | 12.91 | tulkarem |
| bayt-wazan | بيت وزن | Bayt Wazan | الضفة الغربية | PPL | 80 | 1046 | 4.46 | nablus |
| bayt-ur-at-tahta | بيت عور التحتا | Bayt ‘Ūr at Taḩtā | الضفة الغربية | PPL | 80 | 4313 | 11.51 | ramallah |
| bayt-ur-al-fawqa | بيت عور الفوقا | Bayt ‘Ūr al Fawqā | الضفة الغربية | PPL | 80 | 852 | 8.56 | ramallah |
| bayt-imrin | بيت إمرين | Bayt Imrīn | الضفة الغربية | PPL | 80 | 2794 | 8.94 | nablus |
| bayt-surik | بيت سوريك | Bayt Sūrīk | الضفة الغربية | PPL | 80 | 3705 | 8.70 | jerusalem |
| bayt-sira | بيت سيرا | Bayt Sīrā | الضفة الغربية | PPL | 80 | 2744 | 14.94 | ramallah |
| bayt-qad | بيت قاد | Bayt Qād | الضفة الغربية | PPL | 80 | 1430 | 5.97 | jenin |
| bayt-nuba | بيت نوبا | Bayt Nūbā | الضفة الغربية | PPL | 80 | 246 | 15.89 | ramallah |
| bayt-liqya | بيت لقيا | Bayt Liqyā | الضفة الغربية | PPL | 80 | 7795 | 13.57 | ramallah |
| bayt-lid | بيت ليد | Bayt Līd | الضفة الغربية | PPL | 80 | 5740 | 11.14 | tulkarem |
| bayt-kahil | بيت كاحل | Bayt Kāḩil | الضفة الغربية | PPL | 80 | 5663 | 5.33 | hebron |
| bayt-anan | بيت عنان | Bayt ‘Anān | الضفة الغربية | PPL | 80 | 3946 | 10.42 | ramallah |
| baytin | بيتين | Baytīn | الضفة الغربية | PPL | 80 | 2948 | 4.37 | ramallah |
| bayt-ummar | بيت أومر | Bayt Ūmmar | الضفة الغربية | PPL | 80 | 12238 | 10.11 | hebron |
| bayt-iksa | بيت إكسا | Bayt Iksā | الضفة الغربية | PPL | 80 | 1734 | 6.34 | jerusalem |
| bayt-ijza | بيت إجزا | Bayt Ijzā | الضفة الغربية | PPL | 80 | 692 | 8.00 | ramallah |
| bayt-iba | بيت إيبا | Bayt Ībā | الضفة الغربية | PPL | 80 | 3175 | 5.18 | nablus |
| bayt-hanina | بيت حنينا | Bayt Ḩanīnā | الضفة الغربية | PPL | 80 | 27000 | 6.95 | jerusalem |
| bayt-furik | بيت فوريك | Bayt Fūrīk | الضفة الغربية | PPL | 80 | 10108 | 8.57 | nablus |
| bayt-fajjar | بيت فجار | Bayt Fajjār | الضفة الغربية | PPL | 80 | 10579 | 10.08 | bethlehem |
| bayt-duqqu | بيت دقو | Bayt Duqqū | الضفة الغربية | PPL | 80 | 1637 | 8.43 | ramallah |
| bayt-dajan | بيت دجن | Bayt Dajan | الضفة الغربية | PPL | 80 | 3487 | 10.79 | nablus |
| bayt-ula | بيت أولا | Bayt Ūlā | الضفة الغربية | PPL | 80 | 9159 | 9.71 | hebron |
| battir | بتير | Battīr | الضفة الغربية | PPL | 80 | 4092 | 6.01 | bethlehem |
| bartaah-ash-sharqiyah | برطعة الشرقية | Barţa‘ah ash Sharqīyah | الضفة الغربية | PPL | 80 | 4126 | 18.92 | jenin |
| bardalah | بردلة | Bardalah | الضفة الغربية | PPL | 80 | 1612 | 19.19 | jenin |
| baqah-ash-sharqiyah | باقة الشرقية | Bāqah ash Sharqīyah | الضفة الغربية | PPL | 80 | 4165 | 11.79 | tulkarem |
| baqat-al-hatab | باقة الحطب | Bāqat al Ḩaţab | الضفة الغربية | PPL | 80 | 1624 | 14.05 | nablus |
| bani-naim | بني نعيم | Banī Na‘īm | الضفة الغربية | PPL | 80 | 19783 | 6.37 | hebron |
| bala | بلعا | Bal‘ā | الضفة الغربية | PPL | 80 | 6545 | 8.23 | tulkarem |
| azzun | عزون | ‘Azzūn | الضفة الغربية | PPL | 80 | 7727 | 15.30 | tulkarem |
| az-zawiyah | الزاوية | Az Zāwiyah | الضفة الغربية | PPL | 80 | 4917 | 23.83 | tulkarem |
| az-zahiriyah | الظاهرية | Az̧ Z̧āhirīyah | الضفة الغربية | PPL | 80 | 27616 | 18.18 | hebron |
| az-zababidah | الزبابدة | Az Zabābidah | الضفة الغربية | PPL | 80 | 3751 | 8.31 | jenin |
| azmut | عزموط | ‘Azmūţ | الضفة الغربية | PPL | 80 | 2622 | 4.50 | nablus |
| usarin | أوصرين | Ūşarīn | الضفة الغربية | PPL | 80 | 1595 | 11.76 | nablus |
| awarta | عورتا | ‘Awartā | الضفة الغربية | PPL | 80 | 5563 | 7.15 | nablus |
| at-tirah | الطيرة | Aţ Ţīrah | الضفة الغربية | PPL | 80 | 1340 | 8.14 | ramallah |
| attil | عتيل | ‘Attīl | الضفة الغربية | PPL | 80 | 10100 | 7.71 | tulkarem |
| at-taybah | الطيبة | Aţ Ţaybah | الضفة الغربية | PPL | 80 | 2129 | 12.05 | jenin |
| at-taybah | الطيبة | Aţ Ţaybah | الضفة الغربية | PPL | 80 | 1433 | 10.67 | ramallah |
| atarah | عطارة | ‘Aţārah | الضفة الغربية | PPL | 80 | 2240 | 10.76 | ramallah |
| as-sawiyah | الساوية | As Sāwiyah | الضفة الغربية | PPL | 80 | 2236 | 15.28 | nablus |
| as-samu | السموع | As Samū‘ | الضفة الغربية | PPL | 80 | 19355 | 15.43 | hebron |
| asirah-ash-shamaliyah | عصيرة الشمالية | ‘Aşīrah ash Shamālīyah | الضفة الغربية | PPL | 80 | 7475 | 3.21 | nablus |
| asirah-al-qibliyah | عصيرة القبلية | ‘Aşīrah al Qiblīyah | الضفة الغربية | PPL | 80 | 2341 | 6.58 | nablus |
| ash-shuyukh | الشيوخ | Ash Shuyūkh | الضفة الغربية | PPL | 80 | 8151 | 6.77 | hebron |
| ash-shuhada | الشهداء | Ash Shuhadā’ | الضفة الغربية | PPL | 80 | 1727 | 3.77 | jenin |
| ar-rihiyah | الريحية | Ar Rīḩīyah | الضفة الغربية | PPL | 80 | 3369 | 7.31 | hebron |
| ar-ras | الراس | Ar Rās | الضفة الغربية | PPL | 80 | 535 | 7.28 | tulkarem |
| arranah | عرانة | ‘Arrānah | الضفة الغربية | PPL | 80 | 1972 | 5.19 | jenin |
| ar-ramah | الرامة | Ar Rāmah | الضفة الغربية | PPL | 80 | 953 | 14.46 | tulkarem |
| ar-ram-wa-dahiyat-al-barid | الرام وضاحية البريد | Ar Rām wa Ḑāḩiyat al Barīd | الضفة الغربية | PPL | 80 | 24838 | 6.71 | ramallah |
| arrabah | عرابة | ‘Arrābah | الضفة الغربية | PPL | 80 | 9703 | 10.43 | jenin |
| al-araqa | العرقة | Al ‘Araqa | الضفة الغربية | PPL | 80 | 2135 | 8.96 | jenin |
| arabbunah | عربونة | ‘Arabbūnah | الضفة الغربية | PPL | 80 | 800 | 8.81 | jenin |
| aqraba | عقربا | ‘Aqrabā | الضفة الغربية | PPL | 80 | 7707 | 13.41 | nablus |
| anzah | عنزة | ‘Anzah | الضفة الغربية | PPL | 80 | 1851 | 12.93 | jenin |
| an-nuwayimah | النويعمة | An Nuway‘imah | الضفة الغربية | PPL | 80 | 1229 | 21.95 | ramallah |
| an-nazlah-ash-sharqiyah | النزلة الشرقية | An Nazlah ash Sharqīyah | الضفة الغربية | PPL | 80 | 1500 | 13.48 | tulkarem |
| an-nazlah-al-wusta | النزلة الوسطى | An Nazlah al Wusţá | الضفة الغربية | PPL | 80 | 337 | 12.57 | tulkarem |
| an-nazlah-al-gharbiyah | النزلة الغربية | An Nazlah al Gharbīyah | الضفة الغربية | PPL | 80 | 929 | 11.53 | tulkarem |
| an-naqurah | الناقورة | An Nāqūrah | الضفة الغربية | PPL | 80 | 1528 | 7.41 | nablus |
| an-nabi-samuil | النبي صنوئيل | An Nabī Şamū’īl | الضفة الغربية | PPL | 80 | 256 | 7.76 | jerusalem |
| an-nabi-salih | النبي صالح | An Nabī Şāliḩ | الضفة الغربية | PPL | 80 | 527 | 14.59 | ramallah |
| an-nabi-ilyas | النبي إلياس | An Nabī Ilyās | الضفة الغربية | PPL | 80 | 1157 | 14.00 | tulkarem |
| anin | عنين | ‘Anīn | الضفة الغربية | PPL | 80 | 3647 | 13.00 | jenin |
| anata | عناتا | ‘Anātā | الضفة الغربية | PPL | 80 | 11946 | 6.25 | jerusalem |
| anabta | عنبتا | ‘Anabtā | الضفة الغربية | PPL | 80 | 7106 | 8.31 | tulkarem |
| ammuryah | عمورية | ‘Ammūryah | الضفة الغربية | PPL | 80 | 299 | 17.77 | ramallah |
| al-yamun | اليامون | Al Yāmūn | الضفة الغربية | PPL | 80 | 16164 | 6.82 | jenin |
| al-qubaybah | القبيبة | Al Qubaybah | الضفة الغربية | PPL | 80 | 2008 | 9.58 | ramallah |
| al-mughayyir | المغير | Al Mughayyir | الضفة الغربية | PPL | 80 | 2175 | 9.32 | jenin |
| al-mughayyir | المغير | Al Mughayyir | الضفة الغربية | PPL | 80 | 2328 | 18.72 | ramallah |
| al-midyah | المدية | Al Midyah | الضفة الغربية | PPL | 80 | 1284 | 19.06 | ramallah |
| al-lubban-al-gharbi | اللبن الغربي | Al Lubban al Gharbī | الضفة الغربية | PPL | 80 | 1456 | 21.27 | ramallah |
| al-khadir | الخضر | Al Khaḑir | الضفة الغربية | PPL | 80 | 9003 | 3.59 | bethlehem |
| al-judayrah | الجديرة | Al Judayrah | الضفة الغربية | PPL | 80 | 2059 | 5.36 | ramallah |
| al-jib | الجيب | Al Jīb | الضفة الغربية | PPL | 80 | 4505 | 6.03 | ramallah |
| al-janiyah | الجانية | Al Jāniyah | الضفة الغربية | PPL | 80 | 1147 | 8.64 | ramallah |
| al-hashimiyah | الهاشمية | Al Hāshimīyah | الضفة الغربية | PPL | 80 | 1038 | 7.08 | jenin |
| al-funduq | الفندق | Al Funduq | الضفة الغربية | PPL | 80 | 747 | 12.29 | nablus |
| al-fasayil | الفصايل | Al Faşāyil | الضفة الغربية | PPL | 80 | 1064 | 26.36 | ramallah |
| al-fandaqumiyah | الفتدقومية | Al Fandaqūmīyah | الضفة الغربية | PPL | 80 | 3266 | 12.21 | nablus |
| al-ayzariyah | العيزرية | Al ‘Ayzarīyah | الضفة الغربية | PPL | 80 | 17455 | 5.25 | jerusalem |
| al-awja | العوجا | Al ‘Awjā | الضفة الغربية | PPL | 80 | 4067 | 25.47 | ramallah |
| al-attarah | العطارة | Al ‘Aţţārah | الضفة الغربية | PPL | 80 | 1145 | 12.81 | tulkarem |
| ajjul | عجول | ‘Ajjūl | الضفة الغربية | PPL | 80 | 1220 | 13.37 | ramallah |
| ajjah | عجة | ‘Ajjah | الضفة الغربية | PPL | 80 | 4995 | 14.15 | jenin |
| ibwayn | عبوين | ‘Ibwayn | الضفة الغربية | PPL | 80 | 3077 | 14.20 | ramallah |
| abu-qashsh | أبو قش | Abū Qashsh | الضفة الغربية | PPL | 80 | 1385 | 5.32 | ramallah |
| abu-dis | أبو ديس | Abū Dīs | الضفة الغربية | PPL | 80 | 11753 | 4.58 | jerusalem |
| abud | عابود | ‘Ābūd | الضفة الغربية | PPL | 80 | 2056 | 17.86 | ramallah |
| al-qararah | القرارة | Al Qarārah | قطاع غزة | PPL | 80 | 19500 | 18.57 | gaza |
| juhr-ad-dik | جحر الديك | Juḩr ad Dīk | قطاع غزة | PPL | 80 | 2880 | 5.83 | gaza |
| az-zuwaydah | الزوايدة | Az Zuwāydah | قطاع غزة | PPL | 80 | 16688 | 10.71 | gaza |
| al-musaddar | المصدر | Al Muşaddar | قطاع غزة | PPL | 80 | 1845 | 13.18 | gaza |
| al-masqufah | المسقوفة | Al Masqūfah | الضفة الغربية | PPL | 80 | 258 | 3.86 | tulkarem |
| al-hafasi | الحفاصي | Al Ḩafāşī | الضفة الغربية | PPL | 80 | 156 | 4.98 | tulkarem |
| khirbat-jubarah | خربة جبارة | Khirbat Jubārah | الضفة الغربية | PPL | 80 | 290 | 4.86 | tulkarem |
| arab-abu-fardah | عرب أبو فردة | ‘Arab Abū Fardah | الضفة الغربية | PPL | 80 | 115 | 14.50 | tulkarem |
| jinsafut | جنصافوط | Jinşāfūţ | الضفة الغربية | PPL | 80 | 2089 | 13.31 | nablus |
| arab-ar-ramadin-al-janubi | عرب الرمضين الجنوبي | ‘Arab ar Ramāḑīn al Janūbī | الضفة الغربية | PPL | 80 | 219 | 15.54 | tulkarem |
| izbat-jalud | عزبة جلعود | ‘Izbat Jal‘ūd | الضفة الغربية | PPL | 80 | 111 | 18.09 | tulkarem |
| izbat-salman | عزبة سلمان | ‘Izbat Salmān | الضفة الغربية | PPL | 80 | 713 | 18.92 | tulkarem |
| bani-zayd | بني زيد | Banī Zayd | الضفة الغربية | PPL | 80 | 5441 | 17.78 | ramallah |
| ad-dawhah | الدوحة | Ad Dawḩah | الضفة الغربية | PPL | 80 | 49 | 5.81 | ramallah |
| badiw-al-muarrajat | بدو المعرجات | Badiw al Mu‘arrajāt | الضفة الغربية | PPL | 80 | 743 | 11.11 | ramallah |
| az-zaayyim | الزعيم | Az Za‘ayyim | الضفة الغربية | PPL | 80 | 3373 | 5.35 | jerusalem |
| arab-al-jahalin | عرب الجهالين | ‘Arab al Jahālīn | الضفة الغربية | PPL | 80 | 715 | 6.82 | jerusalem |
| al-ubaydiyah | العبيدية | Al ‘Ubaydīyah | الضفة الغربية | PPL | 80 | 10618 | 8.39 | bethlehem |
| khallat-an-numan | خلة النعمان | Khallat an Nu‘mān | الضفة الغربية | PPL | 80 | 1397 | 4.00 | bethlehem |
| al-khas | الخاص | Al Khāş | الضفة الغربية | PPL | 80 | 389 | 4.99 | bethlehem |
| al-haddadiyah | الحدادية | Al Ḩaddādīyah | الضفة الغربية | PPL | 80 | 53 | 9.44 | bethlehem |
| khallat-al-luzah | خلة اللوزة | Khallat al Lūzah | الضفة الغربية | PPL | 80 | 571 | 3.52 | bethlehem |
| jubbit-adh-dhib | جبة الذيب | Jubbit adh Dhīb | الضفة الغربية | PPL | 80 | 160 | 6.36 | bethlehem |
| khallat-al-haddad | خلة الحداد | Khallat al Ḩaddād | الضفة الغربية | PPL | 80 | 402 | 5.38 | bethlehem |
| marah-maalla | مراح معلا | Marāḩ Ma‘allā | الضفة الغربية | PPL | 80 | 676 | 6.77 | bethlehem |
| al-manshiyah | المنشية | Al Manshīyah | الضفة الغربية | PPL | 80 | 428 | 7.05 | bethlehem |
| al-maniyah | المنية | Al Manīyah | الضفة الغربية | PPL | 80 | 999 | 9.82 | bethlehem |
| kisan | كيسان | Kīsān | الضفة الغربية | PPL | 80 | 448 | 10.72 | bethlehem |
| arab-ar-rashaydah | عرب الرشايدة | ‘Arab ar Rashāydah | الضفة الغربية | PPL | 80 | 1435 | 13.27 | hebron |
| jala | جالا | Jālā | الضفة الغربية | PPL | 80 | 245 | 9.99 | hebron |
| hatta | حتا | Ḩattā | الضفة الغربية | PPL | 80 | 878 | 12.01 | hebron |
| bayt-maqdum | بيت مقدوم | Bayt Maqdum | الضفة الغربية | PPL | 80 | 2568 | 12.12 | hebron |
| al-buqah | البقعة | Al Buq‘ah | الضفة الغربية | PPL | 80 | 1200 | 4.21 | hebron |
| al-buwayrah | البويرة | Al Buwayrah | الضفة الغربية | PPL | 80 | 684 | 5.21 | hebron |
| khallat-ad-dar | خلة الدار | Khallat ad Dār | الضفة الغربية | PPL | 80 | 2153 | 4.12 | hebron |
| dayr-samit | دير سامت | Dayr Sāmit | الضفة الغربية | PPL | 80 | 6144 | 11.96 | hebron |
| khirbat-as-salamah | خربة السلامة | Khirbat as Salāmah | الضفة الغربية | PPL | 80 | 365 | 10.50 | hebron |
| fuqayqis | فقيقيس | Fuqayqīs | الضفة الغربية | PPL | 80 | 267 | 12.00 | hebron |
| marah-al-baqqar | مراح البقار | Marāḩ al Baqqār | الضفة الغربية | PPL | 80 | 212 | 12.91 | hebron |
| al-hilah | الحيلة | Al Ḩīlah | الضفة الغربية | PPL | 80 | 1258 | 6.49 | hebron |
| as-surrah | الصورة | Aş Şūrrah | الضفة الغربية | PPL | 80 | 1896 | 11.76 | hebron |
| zif | زيف | Zīf | الضفة الغربية | PPL | 80 | 835 | 8.09 | hebron |
| khallat-al-aqd | خلة العقد | Khallat al ‘Aqd | الضفة الغربية | PPL | 80 | 268 | 12.96 | hebron |
| al-buwayb | البويب | Al Buwayb | الضفة الغربية | PPL | 80 | 598 | 9.10 | hebron |
| hadb-al-alqah | حدب العلقة | Ḩadb al ‘Alqah | الضفة الغربية | PPL | 80 | 631 | 13.12 | hebron |
| bayt-amrah | بيت عمرة | Bayt ‘Amrah | الضفة الغربية | PPL | 80 | 2133 | 10.32 | hebron |
| umm-ash-shaqhan | أم الشقحان | Umm ash Shaqḩān | الضفة الغربية | PPL | 80 | 292 | 10.01 | hebron |
| khayr-wa-shuyush-wal-hadidiyah | خير وشيوش والحديدية | Khayr wa Shuyūsh wal Ḩadīdīyah | الضفة الغربية | PPL | 80 | 373 | 10.44 | hebron |
| ad-dayrat | الديرات | Ad Dayrāt | الضفة الغربية | PPL | 80 | 783 | 11.57 | hebron |
| rabud | رابود | Rābūd | الضفة الغربية | PPL | 80 | 2228 | 13.07 | hebron |
| umm-lasafa | أم لصفا | Umm Laşafā | الضفة الغربية | PPL | 80 | 840 | 11.99 | hebron |
| al-karmil | الكرمل | Al Karmil | الضفة الغربية | PPL | 80 | 3685 | 12.57 | hebron |
| khallat-salih | خلة صالح | Khallat Şāliḩ | الضفة الغربية | PPL | 80 | 1077 | 12.58 | hebron |
| at-tuwani | التواني | At Tuwānī | الضفة الغربية | PPL | 80 | 321 | 14.28 | hebron |
| an-najadah | النجادة | An Najādah | الضفة الغربية | PPL | 80 | 407 | 17.49 | hebron |
| khirbat-tawil-ash-shih | خربة طويل الشيح | Khirbat Ţawīl ash Shīḩ | الضفة الغربية | PPL | 80 | 179 | 20.45 | hebron |
| imnizil | إمنيزل | Imnīzil | الضفة الغربية | PPL | 80 | 384 | 17.92 | hebron |
| arab-al-furayjat | عرب الفريجات | ‘Arab al Furayjāt | الضفة الغربية | PPL | 80 | 563 | 25.93 | hebron |
| zahr-al-malih | ظهر المالح | Z̧ahr al Māliḩ | الضفة الغربية | PPL | 80 | 196 | 13.67 | jenin |
| umm-dar | أم دار | Umm Dār | الضفة الغربية | PPL | 80 | 550 | 14.80 | jenin |
| al-khuljan | الخلجان | Al Khuljān | الضفة الغربية | PPL | 80 | 503 | 14.09 | jenin |
| imriha | إمريحا | Imrīḩā | الضفة الغربية | PPL | 80 | 418 | 14.19 | jenin |
| bir-al-basha | بير الباشا | Bīr al Bāshā | الضفة الغربية | PPL | 80 | 1291 | 7.29 | jenin |
| al-mansurah | المنصورة | Al Manşūrah | الضفة الغربية | PPL | 80 | 171 | 10.74 | jenin |
| al-asasah | العصاعصة | Al ‘Aşā‘şah | الضفة الغربية | PPL | 80 | 458 | 13.06 | nablus |
| al-badhan | الباذان | Al Bādhān | الضفة الغربية | PPL | 80 | 2458 | 7.73 | nablus |
| al-farisiyah | الفارسية | Al Fārisīyah | الضفة الغربية | PPL | 80 | 149 | 24.03 | jenin |
| ath-thaghrah | الثغرة | Ath Thaghrah | الضفة الغربية | PPL | 80 | 538 | 16.73 | jenin |
| al-aqbah | العقبة | Al ‘Aqbah | الضفة الغربية | PPL | 80 | 102 | 17.82 | jenin |
| khirbat-ar-ras-al-ahmar | خربة الراس الأحمر | Khirbat ar Rās al Aḩmar | الضفة الغربية | PPL | 80 | 176 | 18.80 | nablus |
| az-zubaydat | الزبيدات | Az Zubaydāt | الضفة الغربية | PPL | 80 | 1403 | 25.80 | nablus |
| marj-al-ghazal | مرج الغزال | Marj al Ghazāl | الضفة الغربية | PPL | 80 | 200 | 25.66 | nablus |
| al-jiftlik | الجفتلك | Al Jiftlik | الضفة الغربية | PPL | 80 | 3666 | 23.08 | nablus |
| an-nabi-musa | النبي موسى | An Nabī Mūsá | الضفة الغربية | PPL | 80 | 305 | 20.71 | jerusalem |
| al-masarah | المعصرة | Al Ma‘şarah | الضفة الغربية | PPL | 80 | 793 | 5.98 | bethlehem |
| khursa | خرسا | Khursā | الضفة الغربية | PPL | 80 | 3388 | 9.60 | hebron |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| arab-maslakh-bayt-lahya | عرب مسلخ بيت لائيا | ‘Arab Maslakh Bayt Lāhyā | قطاع غزة | PPL | 70 | 5.76 |
| al-mawasi | المواصي | Al Mawāşī | قطاع غزة | PPL | 70 | 29.47 |
| idhna | إذنا | Idhna | الضفة الغربية | PPL | 70 | 12.07 |
| yabad | يعبد | Ya'bad | الضفة الغربية | PPL | 70 | 11.70 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **198**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| saknat-az-zarqa | Saknat az Zarqā’ | Saknat az Zarqā’ | قطاع غزة | PPL | missing_real_ar_name |
| rafiah-yam | Rafiaẖ Yam | Rafiaẖ Yam | قطاع غزة | PPL | missing_real_ar_name |
| nahal-qatif | Naḥal Qatif | Naḥal Qatif | قطاع غزة | PPL | missing_real_ar_name |
| an-nazlah | An Nazlah | An Nazlah | قطاع غزة | PPL | missing_real_ar_name |
| al-mashahirah | Al Mashāhirah | Al Mashāhirah | قطاع غزة | PPL | missing_real_ar_name |
| zayta-jammain | زيتا جماعين | Zaytā Jammā‘īn | الضفة الغربية | PPL | non_place_keyword (kw: عين) |
| zahrat-zayn-ad-din | Z̧ahrat Zayn ad Dīn | Z̧ahrat Zayn ad Dīn | الضفة الغربية | PPL | missing_real_ar_name |
| wadi-fukin | وادي فوكين | Wādī Fūkīn | الضفة الغربية | PPL | non_place_keyword (kw: وادي) |
| shuwaykah | Shuwaykah | Shuwaykah | الضفة الغربية | PPL | missing_real_ar_name |
| shufat | Shu‘fāţ | Shu‘fāţ | الضفة الغربية | PPL | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| gaza | gaza | slug |
| tulkarm | tulkarem | coords<1km (d=0.21km) |
| ramallah | ramallah | slug |
| nablus | nablus | slug |
| janin | jenin | ar_name+coords (d=0.66km) |
| bethlehem | bethlehem | slug |
| balamah | jenin | coords<1km (d=0.86km) |
| hebron | hebron | slug |
| al-imarah | hebron | coords<1km (d=0.62km) |

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
