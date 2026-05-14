# EG GeoNames Import Report (refined)

**Country**: Egypt (مصر)
**Generated**: 2026-05-14T21:14:40.379Z
**Phase**: `CURATED-GEODATA-EG-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/eg-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/eg-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/eg-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/eg-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 12086 |
| Normalized candidates                     | 11608 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **173** |
| **medium_confidence_pending**             | **276** |
| **low_confidence_pending**                | **8334** |
| needs_review                              | 2797 |
| existing (matched, no action)             | 19 |
| rejected (bad data / religious site)      | 9 |
| Alias enrichment opps (in separate report) | 19 |

**Shortlist size (high + medium):** 449

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 9 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 12 |
| coords<1km | 5 |
| ar_name+coords | 2 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| shubra-al-khaymah | شبرا الخيمة | Shubrā al Khaymah | محافظة القليوبية | PPLA2 | 95 | 1240289 | 9.09 | cairo |
| rafah | رفح | Rafaḩ | محافظة شمال سيناء | PPLA2 | 95 | 44215 | 184.08 | port-said |
| ash-shaykh-zuwayd | الشيخ زويد | Ash Shaykh Zuwayd | محافظة شمال سيناء | PPLA2 | 95 | 26713 | 172.05 | port-said |
| idku | إدكو | Idkū | محافظة البحيرة | PPLA2 | 95 | 177152 | 37.98 | alexandria |
| al-ubur | العبور | Al-'Ubūr | محافظة القليوبية | PPLA2 | 95 | 138987 | 31.30 | cairo |
| sidi-barani | سيدى برانى | Sīdī Barānī | محافظة مطروح | PPL | 85 | 38253 | 381.71 | alexandria |
| shirbin | شربين | Shirbīn | محافظة الدقهلية | PPL | 85 | 76081 | 22.48 | mansoura |
| sharm-el-sheikh | شرم الشيخ | Sharm el-Sheikh | محافظة جنوب سيناء | PPL | 85 | 38478 | 286.38 | suez |
| rosetta | رشيد | Rosetta | محافظة البحيرة | PPL | 85 | 301795 | 52.30 | alexandria |
| quwaysina | قويسنا | Quwaysinā | محافظة المنوفية | PPL | 85 | 65690 | 28.88 | tanta |
| al-ashir-min-ramadan | 10 رمضان شہر | Al ‘Āshir min Ramaḑān | محافظة الشرقية | PPL | 85 | 246148 | 39.97 | zagazig |
| kafr-az-zayyat | كفر الزيات | Kafr az Zayyāt | محافظة الغربية | PPL | 85 | 83348 | 17.93 | tanta |
| as-salahat | الصلاحات | Aş Şalāḩāt | محافظة الدقهلية | PPL | 85 | 45557 | 23.71 | mansoura |
| kafr-al-kurdi | الكردي | Kafr al Kurdī | محافظة الدقهلية | PPL | 85 | 44905 | 39.47 | mansoura |
| jarajus | جراجوس | Jarājūs | محافظة قنا | PPL | 85 | 20427 | 23.61 | luxor |
| edfu | إدفو | Edfu | محافظة أسوان | PPL | 85 | 79510 | 82.27 | luxor |
| fuwwah | فوة | Fuwwah | محافظة كفر الشيخ | PPL | 85 | 93392 | 59.96 | alexandria |
| dikirnis | دكرنس | Dikirnis | محافظة الدقهلية | PPL | 85 | 101082 | 21.21 | mansoura |
| safaga | سفاجا | Safaga | محافظة البحر الأحمر | PPL | 85 | 53639 | 175.33 | luxor |
| biyala | بيلا | Biyalā | محافظة كفر الشيخ | PPL | 85 | 89068 | 21.53 | mansoura |
| bilbeis | بلبيس | Bilbeis | محافظة الشرقية | PPL | 85 | 185237 | 19.48 | zagazig |
| as-sahil | الساحل | As Sāḩil | محافظة أسيوط | PPL | 85 | 54094 | 20.59 | asyut |
| al-waqf | الوقف | Al Waqf | محافظة قنا | PPL | 85 | 34723 | 49.43 | luxor |
| al-qassasin | القصاصين | Al Qaşşāşīn | محافظة الشرقية | PPL | 85 | 24364 | 32.52 | ismailia |
| al-ghanayim | الغنايم | Al Ghanāyim | محافظة أسيوط | PPL | 85 | 70884 | 36.93 | asyut |
| al-bawiti | الباويطى | Al Bawīţī | محافظة الجيزة | PPL | 85 | 15653 | 187.68 | minya |
| abu-qir | أبو قير | Abū Qīr | محافظة الإسكندرية | PPL | 85 | 37997 | 18.32 | alexandria |
| makadi-bay | خليج مكادى | Makadi Bay | محافظة البحر الأحمر | PPL | 85 | 4000 | 191.80 | luxor |
| shalateen | الشلاتين | Shalateen | محافظة البحر الأحمر | PPL | 85 | 12443 | 294.09 | aswan |
| santkatrina | سانت كاترين | Sānt Kātrīnā | محافظة جنوب سيناء | PPLA2 | 85 | - | 207.00 | suez |
| zefta | زفتى | Zefta | محافظة الغربية | PPL | 80 | 111700 | 24.65 | tanta |
| zawyat-umm-ar-rakham | زاوية أم الرخم | Zāwyat Umm ar Rakham | محافظة مطروح | PPL | 80 | 2643 | 273.88 | alexandria |
| tukh | طوخ | Ţūkh | محافظة القليوبية | PPL | 80 | 52593 | 34.68 | cairo |
| timayy-al-imdid | تمي الإمديد | Timayy al Imdīd | محافظة الدقهلية | PPL | 80 | 20389 | 17.51 | mansoura |
| tima | طما | Ţimā | محافظة سوهاج | PPL | 80 | 101130 | 39.19 | asyut |
| tud | طود | Ţūd | محافظة الأقصر | PPL | 80 | 30780 | 15.79 | luxor |
| tala | تلا | Talā | محافظة المنوفية | PPL | 80 | 72536 | 13.05 | tanta |
| tahta | طهطا | Ţahţā | محافظة سوهاج | PPL | 80 | 134314 | 30.36 | sohag |
| taba | طابا | Taba | محافظة جنوب سيناء | PPL | 80 | 700 | 232.59 | suez |
| sumusta-al-waqf | سمسطا الوقف | Sumusţā al Waqf | محافظة بني سويف | PPL | 80 | 64965 | 43.09 | fayoum |
| siwah | واحة سيوة | Sīwah | محافظة مطروح | PPL | 80 | 25031 | 477.46 | alexandria |
| sirs-al-layyanah | سرس الليانة | Sirs al Layyānah | محافظة المنوفية | PPL | 80 | 78168 | 38.33 | tanta |
| sidi-salim | سيدي سالم | Sīdī Sālim | محافظة كفر الشيخ | PPL | 80 | 44709 | 57.65 | tanta |
| sidi-ghazi | سيدي غازي | Sīdī Ghāzī | محافظة كفر الشيخ | PPL | 80 | 28136 | 36.90 | mansoura |
| sidfa | صدفا | Şidfā | محافظة أسيوط | PPL | 80 | 30228 | 30.74 | asyut |
| shubrakhit | شبراخيت | Shubrākhīt | محافظة البحيرة | PPL | 80 | 41233 | 38.24 | tanta |
| shibin-al-qanatir | شبين القناطر | Shibīn al Qanāţir | محافظة القليوبية | PPL | 80 | 73711 | 30.92 | cairo |
| saqultah | ساقلتة | Sāqultah | محافظة سوهاج | PPL | 80 | 34273 | 11.50 | sohag |
| saqqarah | سقارة | Şaqqārah | محافظة الجيزة | PPL | 80 | 450 | 18.15 | giza |
| san-al-hajar-al-qibliyah | صان الحجر القبلية | Şān al Ḩajar al Qiblīyah | محافظة الشرقية | PPL | 80 | 30969 | 47.35 | mansoura |
| samannud | سمنود | Samannūd | محافظة الغربية | PPL | 80 | 87921 | 15.72 | mansoura |
| samalut | سمالوط | Samālūţ | محافظة المنيا | PPL | 80 | 142009 | 25.53 | minya |
| qutur | قطور | Quţūr | محافظة الغربية | PPL | 80 | 32043 | 21.08 | tanta |
| qus | قوص | Qūş | محافظة قنا | PPL | 80 | 84386 | 28.22 | luxor |
| qift | قفط | Qifţ | محافظة قنا | PPL | 80 | 24010 | 38.95 | luxor |
| qalyub | قليوب | Qalyub | محافظة القليوبية | PPL | 80 | 156363 | 15.27 | cairo |
| qillin | قلين | Qillīn | محافظة كفر الشيخ | PPL | 80 | 48233 | 32.17 | tanta |
| qaha | قها | Qahā | محافظة القليوبية | PPL | 80 | 36225 | 26.37 | cairo |
| nuwaybi-a | نويبع | Nuwaybi‘a | محافظة جنوب سيناء | PPL | 80 | 5000 | 228.69 | suez |
| naqadah | نقادة | Naqādah | محافظة قنا | PPL | 80 | 26774 | 25.23 | luxor |
| nag-hammadi | نجع حمادى | Nag Hammâdi | محافظة قنا | PPL | 80 | 59601 | 56.66 | luxor |
| nabaruh | نبروه | Nabarūh | محافظة الدقهلية | PPL | 80 | 59202 | 10.04 | mansoura |
| mutubas | مطوبس | Muţūbas | محافظة كفر الشيخ | PPL | 80 | 43899 | 58.35 | alexandria |
| mit-salsil | ميت سلسيل | Mīt Salsīl | محافظة الدقهلية | PPL | 80 | 48166 | 42.62 | mansoura |
| mit-ghamr | ميت غمر | Mīt Ghamr | محافظة الدقهلية | PPL | 80 | 153754 | 25.97 | tanta |
| mit-abu-ghalib | ميت أبو غالب | Mīt Abū Ghālib | محافظة دمياط | PPL | 80 | 20470 | 39.76 | mansoura |
| minyat-an-nasr | منية النصر | Minyat an Naşr | محافظة الدقهلية | PPL | 80 | 82429 | 26.91 | mansoura |
| minya-al-qamh | منيا القمح | Minyā al Qamḩ | محافظة الشرقية | PPL | 80 | 99284 | 16.96 | zagazig |
| munuf | منوف | Munūf | محافظة المنوفية | PPL | 80 | 125707 | 36.24 | tanta |
| munshaat-abu-umar | منشأة أبو عمر | Munsha‘at Abū ‘Umar | محافظة الشرقية | PPL | 80 | 22543 | 41.89 | ismailia |
| matay | مطاي | Maţāy | محافظة المنيا | PPL | 80 | 82328 | 36.91 | minya |
| marsa-alam | مرسى علم | Marsa Alam | محافظة البحر الأحمر | PPL | 80 | 10000 | 228.55 | aswan |
| manshiyat-al-qanatir | منشية القناطر | Manshīyat al Qanāţir | محافظة الجيزة | PPL | 80 | 19185 | 19.95 | cairo |
| manfalut | منفلوط | Manfalūţ | محافظة أسيوط | PPL | 80 | 117925 | 25.72 | asyut |
| mallawi | ملوي | Mallawī | محافظة المنيا | PPL | 80 | 212628 | 40.18 | minya |
| mahallat-damanah | محلة دمنة | Maḩallat Damanah | محافظة الدقهلية | PPL | 80 | 31921 | 11.62 | mansoura |
| maghaghah | مغاغة | Maghāghah | محافظة المنيا | PPL | 80 | 118223 | 62.82 | minya |
| kirdasah | كرداسة | Kirdāsah | محافظة الجيزة | PPL | 80 | 137588 | 9.63 | giza |
| kawm-hamadah | كوم حماده | Kawm Ḩamādah | محافظة البحيرة | PPL | 80 | 55652 | 28.86 | tanta |
| kafr-saqr | كفر صقر | Kafr Şaqr | محافظة الشرقية | PPL | 80 | 44529 | 25.73 | zagazig |
| kafr-sad | كفر سعد | Kafr Sa‘d | محافظة دمياط | PPL | 80 | 18120 | 45.80 | mansoura |
| kafr-al-battikh | كفر البطيخ | Kafr al Baţţīkh | محافظة دمياط | PPL | 80 | 47198 | 53.14 | mansoura |
| kafr-ad-dawwar | كفر الدوار | Kafr ad Dawwār | محافظة البحيرة | PPL | 80 | 128539 | 21.39 | alexandria |
| juhaynah | جهينة | Juhaynah | محافظة سوهاج | PPL | 80 | 76555 | 23.61 | sohag |
| girga | جرجا | Girga | محافظة سوهاج | PPL | 80 | 151256 | 31.40 | sohag |
| izbat-al-burj | عزبة البرج | ‘Izbat al Burj | محافظة الدقهلية | PPL | 80 | 37953 | 51.42 | port-said |
| itay-al-barud | إيتاي البارود | Ītāy al Bārūd | محافظة البحيرة | PPL | 80 | 77606 | 33.71 | tanta |
| esna | إسنا | Esna | محافظة قنا | PPL | 80 | 462787 | 44.63 | luxor |
| ibshaway | إبشواي | Ibshawāy | محافظة الفيوم | PPL | 80 | 86186 | 16.70 | fayoum |
| halwan | حلوان | Ḩalwān | محافظة القاهرة | PPL | 80 | 230000 | 21.04 | giza |
| hihya | ههيا | Hihyā | محافظة الشرقية | PPL | 80 | 74823 | 12.39 | zagazig |
| farshut | فرشوط | Farshūţ | محافظة قنا | PPL | 80 | 71013 | 62.84 | luxor |
| faraskur | فارسكور | Fāraskūr | محافظة دمياط | PPL | 80 | 43400 | 45.56 | mansoura |
| faqus | فاقوس | Fāqūs | محافظة الشرقية | PPL | 80 | 116945 | 32.23 | zagazig |
| diyarb-najm | ديرب نجم | Diyarb Najm | محافظة الشرقية | PPL | 80 | 80954 | 19.45 | zagazig |
| disuq | دسوق | Disūq | محافظة كفر الشيخ | PPL | 80 | 149291 | 51.10 | tanta |
| dishna | دشنا | Dishnā | محافظة قنا | PPL | 80 | 64744 | 51.37 | luxor |
| dahab | دهب | Dahab | محافظة جنوب سيناء | PPL | 80 | 8000 | 250.77 | suez |
| dayrut | ديروط | Dayrūţ | محافظة أسيوط | PPL | 80 | 102570 | 55.69 | asyut |
| dayr-mawas | دير مواس | Dayr Mawās | محافظة المنيا | PPL | 80 | 60835 | 50.31 | minya |
| bush | ناصر-بوش سابقا | Būsh | محافظة بني سويف | PPL | 80 | 136441 | 32.86 | fayoum |
| burj-al-arab | برج العرب | Burj al ‘Arab | محافظة الإسكندرية | PPL | 80 | 22444 | 48.02 | alexandria |
| birkat-as-sab | بركة السبح | Birkat as Sab‘ | محافظة المنوفية | PPL | 80 | 50924 | 19.17 | tanta |
| bilqas | بلقاس | Bilqās | محافظة الدقهلية | PPL | 80 | 137080 | 19.92 | mansoura |
| biba | ببا | Bibā | محافظة بني سويف | PPL | 80 | 94677 | 44.93 | fayoum |
| bani-ubayd | بني عبيد | Banī ‘Ubayd | محافظة المنيا | PPL | 80 | 46060 | 15.09 | minya |
| bani-mazar | بني مزار | Banī Mazār | محافظة المنيا | PPL | 80 | 115759 | 45.51 | minya |
| baltim | بلطيم | Balţīm | محافظة كفر الشيخ | PPL | 80 | 51280 | 64.06 | mansoura |
| az-zayniyah-qibli | الزينية قبلي | Az Zaynīyah Qiblī | محافظة الأقصر | PPL | 80 | 20000 | 8.04 | luxor |
| awsim | أوسيم | Awsīm | محافظة الجيزة | PPL | 80 | 94174 | 13.00 | cairo |
| at-tall-al-kabir | التل الكبير | At Tall al Kabīr | محافظة الشرقية | PPL | 80 | 46962 | 27.53 | zagazig |
| as-sinbillawayn | السنبلاوين | As Sinbillāwayn | محافظة الدقهلية | PPL | 80 | 124020 | 18.82 | mansoura |
| as-sibaiyah | السباعية | As Sibā‘īyah | محافظة أسوان | PPL | 80 | 21610 | 54.96 | luxor |
| as-sarw | السرو | As Sarw | محافظة دمياط | PPL | 80 | 29286 | 34.37 | mansoura |
| as-santah | السنطه | As Sanţah | محافظة الغربية | PPL | 80 | 45813 | 13.14 | tanta |
| as-sallum | السلوم | As Sallūm | محافظة مطروح | PPL | 80 | 16545 | 453.63 | alexandria |
| as-saff | الصف | Aş Şaff | محافظة الجيزة | PPL | 80 | 61531 | 50.34 | giza |
| ash-shuhada | الشهداء | Ash Shuhadā’ | محافظة المنوفية | PPL | 80 | 76071 | 23.20 | tanta |
| ashmun | أشمون | Ashmūn | محافظة المنوفية | PPL | 80 | 124483 | 37.58 | cairo |
| ar-rahmaniyah | الرحمانية | Ar Raḩmānīyah | محافظة البحيرة | PPL | 80 | 44482 | 49.25 | tanta |
| armant | أرمنت | Armant | محافظة قنا | PPL | 80 | 78695 | 12.23 | luxor |
| al-qusiyah | القوصية | Al Qūşīyah | محافظة أسيوط | PPL | 80 | 99598 | 46.30 | asyut |
| al-qusayr | القصير | Al Quşayr | محافظة البحر الأحمر | PPL | 80 | 24653 | 170.30 | luxor |
| al-qurayn | القرين | Al Qurayn | محافظة الشرقية | PPL | 80 | 94632 | 22.52 | zagazig |
| al-qantarah | القنطرة | Al Qanţarah | محافظة الإسماعيلية | PPL | 80 | 31808 | 29.23 | ismailia |
| al-qanayat | القنايات | Al Qanāyāt | محافظة الشرقية | PPL | 80 | 70687 | 5.23 | zagazig |
| al-matariyah | المطرية | Al Maţarīyah | محافظة الدقهلية | PPL | 80 | 162045 | 27.33 | port-said |
| al-maraghah | المراغة | Al Marāghah | محافظة سوهاج | PPL | 80 | 53643 | 18.24 | sohag |
| al-manzalah | المنزلة | Al Manzalah | محافظة الدقهلية | PPL | 80 | 127394 | 36.78 | port-said |
| al-minshah | المنشاة | Al Minshāh | محافظة سوهاج | PPL | 80 | 91149 | 13.99 | sohag |
| al-mahmudiyah | المحمودية | Al Maḩmūdīyah | محافظة البحيرة | PPL | 80 | 34660 | 57.65 | alexandria |
| al-mahallah-al-kubra | المحلة الكبرى | Al Maḩallah al Kubrá | محافظة الغربية | PPL | 80 | 592573 | 21.65 | mansoura |
| al-jammaliyah | الجمالية | Al Jammālīyah | محافظة الدقهلية | PPL | 80 | 99641 | 42.60 | port-said |
| al-idwah | العدوة | Al ‘Idwah | محافظة المنيا | PPL | 80 | 26092 | 68.06 | minya |
| al-ibrahimiyah | الإبراهيمية | Al Ibrāhīmīyah | محافظة الشرقية | PPL | 80 | 53791 | 15.68 | zagazig |
| izbat-ali-as-sayyid | عزبة علي السيد | ‘Izbat ‘Alī as Sayyid | محافظة البحيرة | PPL | 80 | 53079 | 22.32 | alexandria |
| al-husayniyah | الحسينية | Al Ḩusaynīyah | محافظة الشرقية | PPL | 80 | 50651 | 44.84 | ismailia |
| al-hamul | الحامول | Al Ḩāmūl | محافظة كفر الشيخ | PPL | 80 | 58430 | 37.78 | mansoura |
| al-hammam | الحمام | Al Ḩammām | محافظة مطروح | PPL | 80 | 18407 | 64.12 | alexandria |
| al-fashn | الفشن | Al Fashn | محافظة بني سويف | PPL | 80 | 112999 | 54.24 | fayoum |
| al-burj | البرج | Al Burj | محافظة كفر الشيخ | PPL | 80 | 60320 | 71.60 | mansoura |
| al-balyana | البلينا | Al Balyanā | محافظة سوهاج | PPL | 80 | 68413 | 47.09 | sohag |
| al-bajur | الباجور | Al Bājūr | محافظة المنوفية | PPL | 80 | 62961 | 39.74 | tanta |
| al-badari | البداري | Al Badārī | محافظة أسيوط | PPL | 80 | 56033 | 31.07 | asyut |
| al-alamayn | العلمين | Al ‘Alamayn | محافظة مطروح | PPL | 80 | 7400 | 100.63 | alexandria |
| akhmim | أخميم | Akhmīm | محافظة سوهاج | PPL | 80 | 151430 | 5.09 | sohag |
| aga | أجا | Aga | محافظة الدقهلية | PPL | 80 | 47013 | 13.61 | mansoura |
| ad-dilinjat | الدلنجات | Ad Dilinjāt | محافظة البحيرة | PPL | 80 | 68901 | 44.64 | tanta |
| el-dabaa | الضبعة | El Dabaa | محافظة مطروح | PPL | 80 | 27697 | 141.59 | alexandria |
| abu-tisht | أبو طشت | Abū Ţisht | محافظة قنا | PPL | 80 | 18194 | 62.85 | sohag |
| abu-tij | أبو تيج | Abū Tīj | محافظة أسيوط | PPL | 80 | 105418 | 20.14 | asyut |
| abu-simbel | أبو سمبل | Abu Simbel | محافظة أسوان | PPL | 80 | 5000 | 234.04 | aswan |
| abu-qurqas | أبو قرقاص | Abū Qurqāş | محافظة المنيا | PPL | 80 | 90266 | 18.97 | minya |
| abu-kabir | أبو كبير | Abū Kabīr | محافظة الشرقية | PPL | 80 | 154466 | 22.25 | zagazig |
| abu-hummus | أبو حمص | Abū Ḩummuş | محافظة البحيرة | PPL | 80 | 61388 | 39.47 | alexandria |
| abu-hammad | أبو حماد | Abū Ḩammād | محافظة الشرقية | PPL | 80 | 43001 | 17.80 | zagazig |
| abnub | أبنوب | Abnūb | محافظة أسيوط | PPL | 80 | 111785 | 10.26 | asyut |
| an-nubariyah | النوبارية | An Nūbārīyah | محافظة البحيرة | PPL | 80 | 23282 | 60.91 | alexandria |
| awlad-saqr | أولاد صقر | Awlād Şaqr | محافظة الشرقية | PPL | 80 | 32840 | 32.51 | mansoura |
| ar-riyad | الرياض | Ar Riyāḑ | محافظة كفر الشيخ | PPL | 80 | 24254 | 47.34 | mansoura |
| az-zarqa | الزرقا | Az Zarqā | محافظة دمياط | PPL | 80 | 26955 | 30.89 | mansoura |
| dumyat-al-jadidah | دمياط الجديدة | Dumyāţ al Jadīdah | محافظة دمياط | PPL | 80 | 54508 | 52.40 | mansoura |
| as-salihiyah-al-jadidah | الصالحية الجديدة | Aş Şāliḩīyah al Jadīdah | محافظة الشرقية | PPL | 80 | 59320 | 32.03 | ismailia |
| burj-al-arab-al-jadidah | برج العرب الجديدة | Burj al ‘Arab al Jadīdah | محافظة الإسكندرية | PPL | 80 | 45865 | 47.79 | alexandria |
| dar-as-salam | دار السلام | Dār as Salām | محافظة سوهاج | PPL | 80 | 38008 | 47.47 | sohag |
| el-gouna | الجونة | El Gouna | محافظة البحر الأحمر | PPL | 80 | 15000 | 216.10 | luxor |
| new-cairo | القاهرة الجديدة | New Cairo | محافظة القاهرة | PPL | 80 | 313139 | 22.61 | cairo |
| el-shorouk | الشروق | El Shorouk | محافظة القاهرة | PPL | 80 | 91899 | 38.00 | cairo |
| at-tarif | الطارف | Aţ Ţārif | محافظة الوادي الجديد | PPL | 80 | 38871 | 5.68 | luxor |
| munshat-ali-agha | منشأة علي آغا | Munshāt ‘Alī Āghā | محافظة كفر الشيخ | PPL | 80 | 3847 | 50.16 | tanta |
| shalatin | شلاتين | Shalātīn | محافظة البحر الأحمر | PPL | 80 | 12421 | 294.51 | aswan |
| an-najaylah | النجيلة | An-Najaylah | محافظة مطروح | PPL | 80 | 19768 | 317.72 | alexandria |
| ash-shaykh-zayid | الشيخ زايد | Ash-Shaykh Zāyid | محافظة الجيزة | PPL | 80 | 95854 | 20.13 | giza |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| warwarah | ورورة | Warwarah | محافظة القليوبية | PPL | 70 | 32.68 |
| tawwat-bani-ibrahim | طوة | Ţawwat Banī Ibrāhīm | محافظة المنيا | PPL | 70 | 7.37 |
| tilbant-abshish | تلبنة أبشيش | Tilbant Abshīsh | محافظة المنوفية | PPL | 70 | 37.84 |
| sarawah | صراوة | Şarāwah | محافظة المنوفية | PPL | 70 | 27.19 |
| qarqashandah | قرقشندة | Qarqashandah | محافظة القليوبية | PPL | 70 | 29.64 |
| izbat-ar-rabawat | عزبة الربوات | ‘Izbat ar Rabawāt | محافظة الدقهلية | PPL | 70 | 16.53 |
| nazlat-qarar | نزة قرار | Nazlat Qarār | محافظة أسيوط | PPL | 70 | 31.00 |
| nazlat-iqfahs | نزلة إقفهص | Nazlat Iqfahş | محافظة بني سويف | PPL | 70 | 59.46 |
| naj-layyu | نجع سبع | Naj‘ Layyū | محافظة أسيوط | PPL | 70 | 14.41 |
| naj-idris | نجع إدريس | Naj‘ Idrīs | محافظة سوهاج | PPL | 70 | 31.14 |
| mujul | مجول | Mujūl | محافظة القليوبية | PPL | 70 | 38.13 |
| mit-al-wusta | ميت الواسطى | Mīt al Wusţá | محافظة المنوفية | PPL | 70 | 38.88 |
| mit-abu-al-harith | ميت أبو الحارث | Mīt Abū al Ḩārith | محافظة الدقهلية | PPL | 70 | 18.91 |
| qaryat-ma-niya | قرية معنيا | Qaryat Ma‘nīyā | محافظة البحيرة | PPL | 70 | 33.48 |
| manawahlah | مناوهلة | Manāwahlah | محافظة المنوفية | PPL | 70 | 36.35 |
| manakhullah | الروضة | Manākhullah | محافظة الدقهلية | PPL | 70 | 10.15 |
| izbat-al-khalij | عزبة الخليج | ‘Izbat al Khalīj | محافظة كفر الشيخ | PPL | 70 | 56.91 |
| isfaht | إسفحت | Isfaḩt | محافظة أسيوط | PPL | 70 | 30.58 |
| kawm-al-atrun | كوم الأطرون | Kawm al Aţrūn | محافظة القليوبية | PPL | 70 | 34.59 |
| kafr-uthman-atiyah | الطباخين | Kafr ‘Uthmān ‘Atīyah | محافظة الشرقية | PPL | 70 | 11.65 |
| kafr-sulayman-tadrus | كفر سليمان تادرس | Kafr Sulaymān Tādrus | محافظة الدقهلية | PPL | 70 | 18.79 |
| kafr-shalshalamun | شلشلمون | Kafr Shalshalamūn | محافظة الشرقية | PPL | 70 | 16.48 |
| kafr-muways | كفر مويس | Kafr Muways | محافظة القليوبية | PPL | 70 | 28.42 |
| kafr-manawahlah | كفر مناوهلة | Kafr Manāwahlah | محافظة المنوفية | PPL | 70 | 34.68 |
| kafr-isa | كفر العلما | Kafr ‘Īsá | محافظة الشرقية | PPL | 70 | 25.73 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **8334**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| nahal-diqla | Naẖal Diqla | Naẖal Diqla | محافظة شمال سيناء | PPL | missing_real_ar_name |
| 1-ezbet-has-salib | 1 ‘Ezbet Haṣ Sâlib | 1 ‘Ezbet Haṣ Sâlib | محافظة الغربية | PPL | missing_real_ar_name |
| zufaytat-mashtul | Zufaytat Mashtūl | Zufaytat Mashtūl | محافظة القليوبية | PPL | missing_real_ar_name |
| zawyet-sa-d-abu-shu-eib | Zawyet Sa‘d Abû Shu‘eib | Zawyet Sa‘d Abû Shu‘eib | محافظة مطروح | PPL | missing_real_ar_name |
| zawyet-el-saiyid-idris-el-sinusi | Zawyet el-Saiyid Idrîs el- Sinûsî | Zawyet el-Saiyid Idrîs el- Sinûsî | محافظة مطروح | PPL | missing_real_ar_name |
| zawiyat-umm-husayn | Zāwiyat Umm Ḩusayn | Zāwiyat Umm Ḩusayn | محافظة الجيزة | PPL | missing_real_ar_name |
| zawiyat-sidi-sanad | Zāwiyat Sīdī Sanad | Zāwiyat Sīdī Sanad | محافظة القليوبية | PPL | missing_real_ar_name |
| zawiyat-saqr | Zāwiyat Şaqr | Zāwiyat Şaqr | محافظة البحيرة | PPL | missing_real_ar_name |
| zawiyat-salim | Zāwiyat Sālim | Zāwiyat Sālim | محافظة البحيرة | PPL | missing_real_ar_name |
| zawiyat-nu-aym | Zāwiyat Nu‘aym | Zāwiyat Nu‘aym | محافظة البحيرة | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| munshaat-masjid-khidr | منشأة مسجد خضر | Munsha’at Masjid Khiḑr | religious_site_not_city | مسجد |
| masjid-wasif | مسجد وصيف | Masjid Waşīf | religious_site_not_city | مسجد |
| masjid-musa | Masjid Mūsá | Masjid Mūsá | religious_site_not_city | \bmasjid\b |
| masjid-al-khidr | مسجد الخضر | Masjid al Khiḑr | religious_site_not_city | مسجد |
| izbat-al-jami | عزبة الجامع | ‘Izbat al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| izbat-sidi-jami | عزبة سيدي جامع | ‘Izbat Sīdī Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| izbat-al-jami | عزبة الجامع | ‘Izbat al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| izbat-al-jami | عزبة الجامع | ‘Izbat al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| izbat-masjid-ar-rahman | عزبة مسجد الرحمن | ‘Izbat Masjid ar Raḩmān | religious_site_not_city | مسجد |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tanta | tanta | slug |
| sohag | sohag | slug |
| naj-al-khutbah | luxor | coords<1km (d=0.76km) |
| kafr-an-nahhal | zagazig | coords<1km (d=0.54km) |
| kafr-al-isharah | zagazig | coords<1km (d=0.54km) |
| port-said | port-said | slug |
| zagazig | zagazig | slug |
| assiut | asyut | ar_name+coords (d=0.01km) |
| aswan | aswan | slug |
| suez | suez | slug |

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
