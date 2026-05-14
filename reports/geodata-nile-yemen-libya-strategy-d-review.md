# Nile + Yemen + Libya — Strategy D Review

**Generated**: 2026-05-14T20:46:56.422Z
**Phase**: `CURATED-GEODATA-NILE-YEMEN-LIBYA-1` — Strategy D filter pass
**Target wave size**: ~100 entries (matching LEVANT-IRAQ-1's 99-entry wave)

Strategy D is a per-country tailored filter:

* **EG**: PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high
* **SD**: PPLC/PPLA/PPL + pop ≥ 30,000 (PPLA seats force-included)
* **LY**: PPLC/PPLA/PPL + pop ≥ 30,000 + tier=high (+ PPLA seats force-included)
* **YE**: Strategy A — PPLC/PPLA/PPLA2 + pop > 0 + tier=high

Plus collision-rename rules:
* `rafah` (EG) → `rafah-eg` (PS `rafah` already curated; user-mandated rename per GCC-1 convention)

---

## Summary

| Country | Strategy D matches | Renamed | Existing curated | Net new |
| ---     | ---:               | ---:    | ---:             | ---:    |
| EG | 39 | 0 | 15 | 39 |
| SD | 27 | 0 | 7 | 27 |
| LY | 28 | 1 | 8 | 28 |
| YE | 16 | 0 | 9 | 16 |
| **TOTAL** | **110** | **1** | — | **110** |

## Collision check

✅ **Zero cross-country slug collisions** among Strategy D picks (after `rafah-eg` rename).

✅ **Zero collisions with existing curated entries** (after `rafah-eg` rename).

## EG — 39 Strategy D picks

**Filter**: PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `shubra-al-khaymah` | شبرا الخيمة | Shubrā al Khaymah | PPLA2 | 1,240,289 | 95 | محافظة القليوبية / Qalyubia Governorate | 30.1251, 31.2505 | 9.1 km → cairo | rule_match (fc=PPLA2, pop=1240289, tier=high) |
| 2 | `al-mahallah-al-kubra` | المحلة الكبرى | Al Maḩallah al Kubrá | PPL | 592,573 | 95 | محافظة الغربية / Gharbia Governorate | 30.9706, 31.1669 | 21.6 km → mansoura | rule_match (fc=PPL, pop=592573, tier=high) |
| 3 | `esna` | إسنا | Esna | PPL | 462,787 | 90 | محافظة قنا / Qena Governorate | 25.2934, 32.5540 | 44.6 km → luxor | rule_match (fc=PPL, pop=462787, tier=high) |
| 4 | `new-cairo` | القاهرة الجديدة | New Cairo | PPL | 313,139 | 90 | محافظة القاهرة / Cairo Governorate | 30.0300, 31.4700 | 22.6 km → cairo | rule_match (fc=PPL, pop=313139, tier=high) |
| 5 | `rosetta` | رشيد | Rosetta | PPL | 301,795 | 90 | محافظة البحيرة / Beheira Governorate | 31.3995, 30.4172 | 52.3 km → alexandria | rule_match (fc=PPL, pop=301795, tier=high) |
| 6 | `al-ashir-min-ramadan` | 10 رمضان شہر | Al ‘Āshir min Ramaḑān | PPL | 246,148 | 90 | محافظة الشرقية / Sharqia Governorate | 30.2964, 31.7463 | 40.0 km → zagazig | rule_match (fc=PPL, pop=246148, tier=high) |
| 7 | `halwan` | حلوان | Ḩalwān | PPL | 230,000 | 90 | محافظة القاهرة / Cairo Governorate | 29.8414, 31.3008 | 21.0 km → giza | rule_match (fc=PPL, pop=230000, tier=high) |
| 8 | `mallawi` | ملوي | Mallawī | PPL | 212,628 | 90 | محافظة المنيا / Minya Governorate | 27.7326, 30.8413 | 40.2 km → minya | rule_match (fc=PPL, pop=212628, tier=high) |
| 9 | `bilbeis` | بلبيس | Bilbeis | PPL | 185,237 | 90 | محافظة الشرقية / Sharqia Governorate | 30.4204, 31.5622 | 19.5 km → zagazig | rule_match (fc=PPL, pop=185237, tier=high) |
| 10 | `idku` | إدكو | Idkū | PPLA2 | 177,152 | 90 | محافظة البحيرة / Beheira Governorate | 31.3073, 30.2981 | 38.0 km → alexandria | rule_match (fc=PPLA2, pop=177152, tier=high) |
| 11 | `al-matariyah` | المطرية | Al Maţarīyah | PPL | 162,045 | 90 | محافظة الدقهلية / Dakahlia Governorate | 31.1829, 32.0311 | 27.3 km → port-said | rule_match (fc=PPL, pop=162045, tier=high) |
| 12 | `qalyub` | قليوب | Qalyub | PPL | 156,363 | 90 | محافظة القليوبية / Qalyubia Governorate | 30.1792, 31.2056 | 15.3 km → cairo | rule_match (fc=PPL, pop=156363, tier=high) |
| 13 | `abu-kabir` | أبو كبير | Abū Kabīr | PPL | 154,466 | 90 | محافظة الشرقية / Sharqia Governorate | 30.7251, 31.6715 | 22.3 km → zagazig | rule_match (fc=PPL, pop=154466, tier=high) |
| 14 | `mit-ghamr` | ميت غمر | Mīt Ghamr | PPL | 153,754 | 90 | محافظة الدقهلية / Dakahlia Governorate | 30.7152, 31.2592 | 26.0 km → tanta | rule_match (fc=PPL, pop=153754, tier=high) |
| 15 | `akhmim` | أخميم | Akhmīm | PPL | 151,430 | 90 | محافظة سوهاج / Sohag Governorate | 26.5622, 31.7457 | 5.1 km → sohag | rule_match (fc=PPL, pop=151430, tier=high) |
| 16 | `girga` | جرجا | Girga | PPL | 151,256 | 90 | محافظة سوهاج / Sohag Governorate | 26.3372, 31.8929 | 31.4 km → sohag | rule_match (fc=PPL, pop=151256, tier=high) |
| 17 | `disuq` | دسوق | Disūq | PPL | 149,291 | 90 | محافظة كفر الشيخ / Kafr El Sheikh Governorate | 31.1326, 30.6478 | 51.1 km → tanta | rule_match (fc=PPL, pop=149291, tier=high) |
| 18 | `samalut` | سمالوط | Samālūţ | PPL | 142,009 | 90 | محافظة المنيا / Minya Governorate | 28.3121, 30.7101 | 25.5 km → minya | rule_match (fc=PPL, pop=142009, tier=high) |
| 19 | `al-ubur` | العبور | Al-'Ubūr | PPLA2 | 138,987 | 90 | محافظة القليوبية / Qalyubia Governorate | 30.2289, 31.4815 | 31.3 km → cairo | rule_match (fc=PPLA2, pop=138987, tier=high) |
| 20 | `kirdasah` | كرداسة | Kirdāsah | PPL | 137,588 | 90 | محافظة الجيزة / Giza Governorate | 30.0310, 31.1111 | 9.6 km → giza | rule_match (fc=PPL, pop=137588, tier=high) |
| 21 | `bilqas` | بلقاس | Bilqās | PPL | 137,080 | 90 | محافظة الدقهلية / Dakahlia Governorate | 31.2145, 31.3580 | 19.9 km → mansoura | rule_match (fc=PPL, pop=137080, tier=high) |
| 22 | `bush` | ناصر-بوش سابقا | Būsh | PPL | 136,441 | 90 | محافظة بني سويف / Beni Suef Governorate | 29.1482, 31.1273 | 32.9 km → fayoum | rule_match (fc=PPL, pop=136441, tier=high) |
| 23 | `tahta` | طهطا | Ţahţā | PPL | 134,314 | 90 | محافظة سوهاج / Sohag Governorate | 26.7687, 31.5020 | 30.4 km → sohag | rule_match (fc=PPL, pop=134314, tier=high) |
| 24 | `kafr-ad-dawwar` | كفر الدوار | Kafr ad Dawwār | PPL | 128,539 | 90 | محافظة البحيرة / Beheira Governorate | 31.1338, 30.1297 | 21.4 km → alexandria | rule_match (fc=PPL, pop=128539, tier=high) |
| 25 | `al-manzalah` | المنزلة | Al Manzalah | PPL | 127,394 | 90 | محافظة الدقهلية / Dakahlia Governorate | 31.1582, 31.9360 | 36.8 km → port-said | rule_match (fc=PPL, pop=127394, tier=high) |
| 26 | `munuf` | منوف | Munūf | PPL | 125,707 | 90 | محافظة المنوفية / Monufia Governorate | 30.4660, 30.9320 | 36.2 km → tanta | rule_match (fc=PPL, pop=125707, tier=high) |
| 27 | `ashmun` | أشمون | Ashmūn | PPL | 124,483 | 90 | محافظة المنوفية / Monufia Governorate | 30.2974, 30.9764 | 37.6 km → cairo | rule_match (fc=PPL, pop=124483, tier=high) |
| 28 | `as-sinbillawayn` | السنبلاوين | As Sinbillāwayn | PPL | 124,020 | 90 | محافظة الدقهلية / Dakahlia Governorate | 30.8825, 31.4627 | 18.8 km → mansoura | rule_match (fc=PPL, pop=124020, tier=high) |
| 29 | `maghaghah` | مغاغة | Maghāghah | PPL | 118,223 | 90 | محافظة المنيا / Minya Governorate | 28.6478, 30.8410 | 62.8 km → minya | rule_match (fc=PPL, pop=118223, tier=high) |
| 30 | `manfalut` | منفلوط | Manfalūţ | PPL | 117,925 | 90 | محافظة أسيوط / Asyut Governorate | 27.3126, 30.9699 | 25.7 km → asyut | rule_match (fc=PPL, pop=117925, tier=high) |
| 31 | `faqus` | فاقوس | Fāqūs | PPL | 116,945 | 90 | محافظة الشرقية / Sharqia Governorate | 30.7282, 31.7970 | 32.2 km → zagazig | rule_match (fc=PPL, pop=116945, tier=high) |
| 32 | `bani-mazar` | بني مزار | Banī Mazār | PPL | 115,759 | 90 | محافظة المنيا / Minya Governorate | 28.4946, 30.8053 | 45.5 km → minya | rule_match (fc=PPL, pop=115759, tier=high) |
| 33 | `al-fashn` | الفشن | Al Fashn | PPL | 112,999 | 90 | محافظة بني سويف / Beni Suef Governorate | 28.8231, 30.8990 | 54.2 km → fayoum | rule_match (fc=PPL, pop=112999, tier=high) |
| 34 | `abnub` | أبنوب | Abnūb | PPL | 111,785 | 90 | محافظة أسيوط / Asyut Governorate | 27.2688, 31.1523 | 10.3 km → asyut | rule_match (fc=PPL, pop=111785, tier=high) |
| 35 | `zefta` | زفتى | Zefta | PPL | 111,700 | 90 | محافظة الغربية / Gharbia Governorate | 30.7142, 31.2443 | 24.6 km → tanta | rule_match (fc=PPL, pop=111700, tier=high) |
| 36 | `abu-tij` | أبو تيج | Abū Tīj | PPL | 105,418 | 90 | محافظة أسيوط / Asyut Governorate | 27.0451, 31.3184 | 20.1 km → asyut | rule_match (fc=PPL, pop=105418, tier=high) |
| 37 | `dayrut` | ديروط | Dayrūţ | PPL | 102,570 | 90 | محافظة أسيوط / Asyut Governorate | 27.5564, 30.8106 | 55.7 km → asyut | rule_match (fc=PPL, pop=102570, tier=high) |
| 38 | `tima` | طما | Ţimā | PPL | 101,130 | 90 | محافظة سوهاج / Sohag Governorate | 26.9084, 31.4347 | 39.2 km → asyut | rule_match (fc=PPL, pop=101130, tier=high) |
| 39 | `dikirnis` | دكرنس | Dikirnis | PPL | 101,082 | 90 | محافظة الدقهلية / Dakahlia Governorate | 31.0890, 31.5948 | 21.2 km → mansoura | rule_match (fc=PPL, pop=101082, tier=high) |

## SD — 27 Strategy D picks

**Filter**: PPLC/PPLA/PPL + pop ≥ 30,000 (PPLA seats force-included)

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `khartoum-north` | الخرطوم بحري | Khartoum North | PPL | 1,012,211 | 95 | ولاية الخرطوم / Khartoum State | 15.6493, 32.5346 | 6.1 km → omdurman | rule_match (fc=PPL, pop=1012211, tier=high) |
| 2 | `al-qadarif` | القضارف | Al Qadarif | PPLA | 363,945 | 90 | ولاية القضارف / Al Qadarif State | 14.0349, 35.3834 | 191.6 km → kassala | force_ppla_seat (fc=PPLA, pop=363945, tier=low) |
| 3 | `kosti` | ربك | Kosti | PPL | 345,068 | 90 | ولاية النيل الأبيض / White Nile State | 13.1629, 32.6635 | 165.9 km → wad-madani | rule_match (fc=PPL, pop=345068, tier=high) |
| 4 | `el-fasher` | الفاشر | El Fasher | PPLA | 252,609 | 90 | ولاية شمال دارفور / North Darfur State | 13.6279, 25.3494 | 182.6 km → nyala | force_ppla_seat (fc=PPLA, pop=252609, tier=low) |
| 5 | `singa` | sngہ | Singa | PPLA | 250,000 | 90 | ولاية سنار / Sennar State | 13.1483, 33.9312 | 146.3 km → wad-madani | force_ppla_seat (fc=PPLA, pop=250000, tier=low) |
| 6 | `ad-damazin` | الدمازين | Ad-Damazin | PPLA | 186,051 | 90 | ولاية النيل الأزرق / Blue Nile State | 11.7891, 34.3592 | 304.4 km → wad-madani | force_ppla_seat (fc=PPLA, pop=186051, tier=low) |
| 7 | `al-junaynah` | aljnynہ | Al-Junaynah | PPLA | 162,981 | 90 | ولاية غرب دارفور / West Darfur State | 13.4526, 22.4473 | 306.8 km → nyala | force_ppla_seat (fc=PPLA, pop=162981, tier=low) |
| 8 | `rabak` | رباک | Rabak | PPLA | 135,281 | 90 | ولاية النيل الأبيض / White Nile State | 13.1809, 32.7400 | 159.7 km → wad-madani | force_ppla_seat (fc=PPLA, pop=135281, tier=low) |
| 9 | `sennar` | سنار | Sennar | PPL | 130,122 | 90 | ولاية سنار / Sennar State | 13.5691, 33.5672 | 92.7 km → wad-madani | rule_match (fc=PPL, pop=130122, tier=high) |
| 10 | `gereida` | قريضة | Gereida | PPL | 120,000 | 90 | ولاية جنوب دارفور / South Darfur State | 11.2754, 25.1403 | 90.6 km → nyala | rule_match (fc=PPL, pop=120000, tier=high) |
| 11 | `atbara` | عطبرة | Atbara | PPL | 112,021 | 90 | ولاية نهر النيل / River Nile State | 17.7022, 33.9864 | 279.6 km → omdurman | rule_match (fc=PPL, pop=112021, tier=high) |
| 12 | `an-nuhud` | النهود | An Nuhūd | PPL | 108,008 | 90 | ولاية غرب كردفان / West Kordofan State | 12.7000, 28.4333 | 200.7 km → el-obeid | rule_match (fc=PPL, pop=108008, tier=high) |
| 13 | `ad-damir` | الدامر | Ad-Damir | PPLA | 103,941 | 90 | ولاية نهر النيل / River Nile State | 17.5990, 33.9721 | 269.4 km → omdurman | force_ppla_seat (fc=PPLA, pop=103941, tier=low) |
| 14 | `kadugli` | كادقلى | Kadugli | PPLA | 87,666 | 85 | ولاية جنوب كردفان / South Kordofan State | 11.0111, 29.7183 | 247.5 km → el-obeid | force_ppla_seat (fc=PPLA, pop=87666, tier=low) |
| 15 | `ad-douiem` | الدويم (مدينة) | Ad Douiem | PPL | 87,068 | 85 | ولاية النيل الأبيض / White Nile State | 14.0012, 32.3116 | 137.6 km → wad-madani | rule_match (fc=PPL, pop=87068, tier=high) |
| 16 | `shendi` | شندى | Shendi | PPL | 63,746 | 85 | ولاية نهر النيل / River Nile State | 16.6915, 33.4341 | 154.9 km → omdurman | rule_match (fc=PPL, pop=63746, tier=high) |
| 17 | `new-halfa` | حلفا الجديدة | New Halfa | PPL | 63,589 | 85 | ولاية كسلا / Kassala State | 15.3302, 35.5985 | 87.0 km → kassala | rule_match (fc=PPL, pop=63589, tier=high) |
| 18 | `er-roseires` | الروصيرص | Er Roseires | PPL | 58,712 | 85 | ولاية النيل الأزرق / Blue Nile State | 11.8659, 34.3869 | 297.2 km → wad-madani | rule_match (fc=PPL, pop=58712, tier=high) |
| 19 | `umm-ruwaba` | أم روابة | Umm Ruwaba | PPL | 56,833 | 85 | ولاية شمال كردفان / North Kordofan State | 12.9061, 31.2158 | 112.4 km → el-obeid | rule_match (fc=PPL, pop=56833, tier=high) |
| 20 | `dongola` | دنقلا | Dongola | PPLA | 56,167 | 85 | الولاية الشمالية / Northern State | 19.1816, 30.4769 | 447.0 km → omdurman | force_ppla_seat (fc=PPLA, pop=56167, tier=low) |
| 21 | `khashm-al-qirbah` | خشم القربة | Khashm al Qirbah | PPL | 42,900 | 80 | ولاية القضارف / Al Qadarif State | 14.9667, 35.9167 | 74.7 km → kassala | rule_match (fc=PPL, pop=42900, tier=high) |
| 22 | `suakin` | سواكن | Suakin | PPL | 42,456 | 80 | ولاية البحر الأحمر / Red Sea State | 19.1059, 37.3321 | 58.0 km → port-sudan | rule_match (fc=PPL, pop=42456, tier=high) |
| 23 | `tokar` | طوكر | Tokār | PPL | 37,051 | 80 | ولاية البحر الأحمر / Red Sea State | 18.4254, 37.7290 | 142.9 km → port-sudan | rule_match (fc=PPL, pop=37051, tier=high) |
| 24 | `ar-rahad` | الرهد | Ar Rahad | PPL | 36,518 | 80 | ولاية شمال كردفان / North Kordofan State | 12.7167, 30.6500 | 69.9 km → el-obeid | rule_match (fc=PPL, pop=36518, tier=high) |
| 25 | `zalinjay` | zalnjے | Zalinjay | PPLA | 35,061 | 80 | ولاية وسط دارفور / Central Darfur State | 12.9092, 23.4706 | 180.7 km → nyala | force_ppla_seat (fc=PPLA, pop=35061, tier=low) |
| 26 | `jubayt` | جبيت | Jubayt | PPL | 30,856 | 80 | ولاية البحر الأحمر / Red Sea State | 18.9533, 36.8336 | 83.9 km → port-sudan | rule_match (fc=PPL, pop=30856, tier=high) |
| 27 | `al-fulah` | alfwlہ | Al-Fulah | PPLA | 0 | 60 | ولاية غرب كردفان / West Kordofan State | 11.7119, 28.3462 | 260.8 km → el-obeid | force_ppla_seat (fc=PPLA, pop=0, tier=low) |

## LY — 28 Strategy D picks

**Filter**: PPLC/PPLA/PPL + pop ≥ 30,000 + tier=high (+ PPLA seats force-included)

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `zliten` | زليتن | Zliten | PPL | 203,790 | 90 | مصراتة / Misrata District | 32.4674, 14.5687 | 50.2 km → misrata | rule_match (fc=PPL, pop=203790, tier=high) |
| 2 | `al-khums` | الخمس | Al Khums | PPLA | 201,943 | 90 | المرقب / Murqub District | 32.6486, 14.2619 | 83.6 km → misrata | force_ppla_seat (fc=PPLA, pop=201943, tier=low) |
| 3 | `janzur` | جنزور | Janzūr | PPL | 154,389 | 90 | الجفارة / Jafara District | 32.8187, 13.0173 | 18.0 km → tripoli-ly | rule_match (fc=PPL, pop=154389, tier=high) |
| 4 | `al-ajaylat` | العجيلات | Al Ajaylat | PPL | 130,546 | 90 | النقاط الخمس / An Nuqat al Khams District | 32.7572, 12.3763 | 32.9 km → zawiya | rule_match (fc=PPL, pop=130546, tier=high) |
| 5 | `al-bayda` | البيضاء | Al Bayḑā’ | PPLA | 129,439 | 90 | الجبل الأخضر / Al Jabal al Akhdar District | 32.7627, 21.7551 | 83.2 km → derna | force_ppla_seat (fc=PPLA, pop=129439, tier=low) |
| 6 | `al-jadid` | الجديد | Al Jadīd | PPL | 126,386 | 90 | سبها / Sabha District | 27.0500, 14.4000 | 3.1 km → sabha | rule_match (fc=PPL, pop=126386, tier=high) |
| 7 | `darnah` | drnہ | Darnah | PPLA | 102,581 | 90 | درنة / Derna District | 32.7670, 22.6367 | 1.3 km → derna | force_ppla_seat (fc=PPLA, pop=102581, tier=low) |
| 8 | `al-jumayl` | الجميل | Al Jumayl | PPL | 102,000 | 90 | النقاط الخمس / An Nuqat al Khams District | 32.8529, 12.0612 | 63.3 km → zawiya | rule_match (fc=PPL, pop=102000, tier=high) |
| 9 | `sabratah` | صبراتة | Şabrātah | PPL | 83,398 | 85 | الزاوية / Az Zawiyah District | 32.7933, 12.4885 | 22.9 km → zawiya | rule_match (fc=PPL, pop=83398, tier=high) |
| 10 | `al-hurshah` | الحرشة | Al Ḩurshah | PPL | 81,119 | 85 | الزاوية / Az Zawiyah District | 32.7647, 12.6739 | 5.2 km → zawiya | rule_match (fc=PPL, pop=81119, tier=high) |
| 11 | `surman` | صرمان | Şurmān | PPL | 77,114 | 85 | الزاوية / Az Zawiyah District | 32.7567, 12.5716 | 14.6 km → zawiya | rule_match (fc=PPL, pop=77114, tier=high) |
| 12 | `msalatah` | مسلاتة | Msalātah | PPL | 73,907 | 85 | المرقب / Murqub District | 32.5834, 14.0363 | 85.9 km → tripoli-ly | rule_match (fc=PPL, pop=73907, tier=high) |
| 13 | `al-aziziyah-ly` (renamed from `al-aziziyah`) | alʿzyzyہ | Al ‘Azīzīyah | PPLA | 52,404 | 85 | الجفارة / Jafara District | 32.5319, 13.0175 | 36.5 km → zawiya | force_ppla_seat (fc=PPLA, pop=52404, tier=low) |
| 14 | `qasr-al-qarabulli` | قصر القربولي | Qaşr al Qarabūllī | PPL | 49,610 | 80 | طرابلس / Tripoli District | 32.7451, 13.7147 | 51.4 km → tripoli-ly | rule_match (fc=PPL, pop=49610, tier=high) |
| 15 | `bani-walid` | بني وليد | Bani Walid | PPL | 45,734 | 80 | مصراتة / Misrata District | 31.7455, 13.9835 | 125.8 km → misrata | rule_match (fc=PPL, pop=45734, tier=high) |
| 16 | `al-jawf` | الجوف | Al Jawf | PPL | 42,079 | 80 | الكفرة / Al Kufrah District | 24.1989, 23.2909 | 878.5 km → tobruk | rule_match (fc=PPL, pop=42079, tier=high) |
| 17 | `gharyan` | غريان | Gharyan | PPLA | 36,110 | 80 | الجبل الغربي / Jabal al Gharbi District | 32.1722, 13.0203 | 70.1 km → zawiya | force_ppla_seat (fc=PPLA, pop=36110, tier=low) |
| 18 | `zuwarah` | zwarہ | Zuwarah | PPLA | 33,887 | 80 | النقاط الخمس / An Nuqat al Khams District | 32.9312, 12.0820 | 63.5 km → zawiya | force_ppla_seat (fc=PPLA, pop=33887, tier=low) |
| 19 | `ubari` | أوباري | Ubari | PPLA | 33,569 | 80 | وادي الحياة / Wadi al Hayaa District | 26.5903, 12.7751 | 171.4 km → sabha | force_ppla_seat (fc=PPLA, pop=33569, tier=low) |
| 20 | `zintan` | الزنتان، لیبی | Zintan | PPL | 33,000 | 80 | الجبل الغربي / Jabal al Gharbi District | 31.9316, 12.2529 | 101.6 km → zawiya | rule_match (fc=PPL, pop=33000, tier=high) |
| 21 | `al-abyar` | الأبيار‎ | Al Abyār | PPL | 32,563 | 80 | المرج / Al Marj District | 32.1900, 20.5965 | 48.6 km → benghazi | rule_match (fc=PPL, pop=32563, tier=high) |
| 22 | `sidi-bin-zinah` | سيدي بن زينة | Sīdī Bin Zīnah | PPL | 31,607 | 80 | النقاط الخمس / An Nuqat al Khams District | 32.8872, 11.9873 | 70.8 km → zawiya | rule_match (fc=PPL, pop=31607, tier=high) |
| 23 | `al-burayqah` | البريقة | Al Burayqah | PPL | 31,300 | 80 | الواحات / Al Wahat District | 30.4062, 19.5739 | 196.6 km → benghazi | rule_match (fc=PPL, pop=31300, tier=high) |
| 24 | `murzuk` | مرزق | Murzuk | PPLA | 30,491 | 80 | مرزق / Murzuq District | 25.9155, 13.9184 | 134.7 km → sabha | force_ppla_seat (fc=PPLA, pop=30491, tier=low) |
| 25 | `nalut` | نالوت | Nālūt | PPLA | 28,431 | 80 | نالوت / Nalut District | 31.8685, 10.9812 | 191.3 km → zawiya | force_ppla_seat (fc=PPLA, pop=28431, tier=low) |
| 26 | `hun` | مدينة هون | Hūn | PPLA | 24,431 | 80 | الجفرة / Al Jufrah District | 29.1268, 15.9477 | 239.6 km → sirte | force_ppla_seat (fc=PPLA, pop=24431, tier=low) |
| 27 | `ghat` | غات | Ghat | PPLA | 14,630 | 80 | غات / Ghat District | 24.9633, 10.1800 | 483.1 km → sabha | force_ppla_seat (fc=PPLA, pop=14630, tier=low) |
| 28 | `idri` | أدري | Idrī | PPLA | 4,696 | 70 | وادي الشاطئ / Wadi al Shatii District | 27.4471, 13.0517 | 143.5 km → sabha | force_ppla_seat (fc=PPLA, pop=4696, tier=low) |

## YE — 16 Strategy D picks

**Filter**: Strategy A — PPLC/PPLA/PPLA2 + pop > 0 + tier=high

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `sayyan` | سيان | Sayyān | PPLA2 | 69,404 | 85 | محافظة صنعاء / Sana'a Governorate | 15.1718, 44.3244 | 26.2 km → sanaa | rule_match (fc=PPLA2, pop=69404, tier=high) |
| 2 | `zabid` | زبيد | Zabīd | PPLA2 | 52,590 | 85 | محافظة الحديدة / Hodeidah Governorate | 14.1951, 43.3152 | 77.5 km → hodeidah | rule_match (fc=PPLA2, pop=52590, tier=high) |
| 3 | `bajil` | باجل | Bājil | PPLA2 | 48,218 | 80 | محافظة الحديدة / Hodeidah Governorate | 15.0590, 43.2873 | 46.1 km → hodeidah | rule_match (fc=PPLA2, pop=48218, tier=high) |
| 4 | `dhi-as-sufal` | ذي السفال | Dhī as Sufāl | PPLA2 | 37,997 | 80 | محافظة إب / Ibb Governorate | 13.8345, 44.1147 | 16.5 km → ibb | rule_match (fc=PPLA2, pop=37997, tier=high) |
| 5 | `bayt-al-faqih` | بيت الفقيه | Bayt al Faqīh | PPLA2 | 34,204 | 80 | محافظة الحديدة / Hodeidah Governorate | 14.5163, 43.3245 | 50.6 km → hodeidah | rule_match (fc=PPLA2, pop=34204, tier=high) |
| 6 | `yarim` | يريم | Yarīm | PPLA2 | 33,050 | 80 | محافظة إب / Ibb Governorate | 14.2980, 44.3779 | 28.1 km → dhamar | rule_match (fc=PPLA2, pop=33050, tier=high) |
| 7 | `ghayl-ba-wazir` | غيل با وزير | Ghayl Bā Wazīr | PPLA2 | 21,259 | 80 | محافظة حضرموت / Hadhramaut Governorate | 14.7761, 49.3661 | 36.8 km → mukalla | rule_match (fc=PPLA2, pop=21259, tier=high) |
| 8 | `hadibu` | حديبو | Hadibu | PPLA2 | 8,545 | 75 | محافظة سقطرى / Socotra Governorate | 12.6488, 54.0189 | 569.3 km → mukalla | rule_match (fc=PPLA2, pop=8545, tier=high) |
| 9 | `qalansiyah` | قلنسية | Qalansīyah | PPLA2 | 3,500 | 70 | محافظة سقطرى / Socotra Governorate | 12.6896, 53.4871 | 514.5 km → mukalla | rule_match (fc=PPLA2, pop=3500, tier=high) |
| 10 | `suhayl-shibam` | سحيل شبام | Suḩayl Shibām | PPLA2 | 645 | 65 | محافظة حضرموت / Hadhramaut Governorate | 15.9145, 48.6386 | 161.2 km → mukalla | rule_match (fc=PPLA2, pop=645, tier=high) |
| 11 | `al-inan` | العنان | Al ‘Inān | PPLA2 | 100 | 65 | محافظة الجوف / Al Jawf Governorate | 16.7219, 44.3125 | 63.3 km → saada | rule_match (fc=PPLA2, pop=100, tier=high) |
| 12 | `bani-al-awwam` | بني العوام | Banī al ‘Awwām | PPLA2 | 41 | 65 | محافظة حجة / Hajjah Governorate | 15.5812, 43.5873 | 68.9 km → sanaa | rule_match (fc=PPLA2, pop=41, tier=high) |
| 13 | `saqayn` | ساقين | Sāqayn | PPLA2 | 41 | 65 | محافظة صعدة / Saada Governorate | 16.8770, 43.5250 | 26.3 km → saada | rule_match (fc=PPLA2, pop=41, tier=high) |
| 14 | `ash-shawati` | الشواتي | Ash Shawātī | PPLA2 | 25 | 65 | محافظة صعدة / Saada Governorate | 16.7831, 43.8126 | 18.2 km → saada | rule_match (fc=PPLA2, pop=25, tier=high) |
| 15 | `al-musaymir` | المسيمير | Al Musaymīr | PPLA2 | 3 | 65 | محافظة لحج / Lahij Governorate | 13.4439, 44.6153 | 66.0 km → taiz | rule_match (fc=PPLA2, pop=3, tier=high) |
| 16 | `al-khaniq` | الخانق | Al Khāniq | PPLA2 | 2 | 65 | محافظة صنعاء / Sana'a Governorate | 15.5025, 44.1816 | 14.8 km → sanaa | rule_match (fc=PPLA2, pop=2, tier=high) |

---

## Data quality notes

GeoNames' Arabic field is uneven — some entries store the proper
Arabic city name (الدوحة, جدة, زليتن), while others store a non-
Arabic transliteration that landed in `name:ar` by accident (e.g. an
Urdu form like `sngہ` for Singa, or a different city's name like `ربك`
for Kosti). Scanning the Strategy D shortlist for entries where the
Arabic name fails a "pure Arabic word" check:

⚠️ 10 entries have problematic `names.ar` and should
be reviewed (recommended action: manual fix in candidates JSON before
Stage 4, OR exclude from this wave):

| cc | final slug | current names.ar | english | suggested action |
| --- | --- | --- | --- | --- |
| EG | `al-ashir-min-ramadan` | 10 رمضان شہر | Al ‘Āshir min Ramaḑān | review + fix (or exclude) |
| SD | `singa` | sngہ | Singa | review + fix (or exclude) |
| SD | `al-junaynah` | aljnynہ | Al-Junaynah | review + fix (or exclude) |
| SD | `rabak` | رباک | Rabak | review + fix (or exclude) |
| SD | `zalinjay` | zalnjے | Zalinjay | review + fix (or exclude) |
| SD | `al-fulah` | alfwlہ | Al-Fulah | review + fix (or exclude) |
| LY | `darnah` | drnہ | Darnah | review + fix (or exclude) |
| LY | `al-aziziyah-ly` | alʿzyzyہ | Al ‘Azīzīyah | review + fix (or exclude) |
| LY | `zuwarah` | zwarہ | Zuwarah | review + fix (or exclude) |
| LY | `zintan` | الزنتان، لیبی | Zintan | review + fix (or exclude) |

Note: the english names are reliable across all 110 entries. The
issue is only on the Arabic side, and only for the 10 entries
listed above. None of the existing 64 curated entries from prior waves
shipped with bad Arabic — the pipeline's `flag_missing_ar` step is the
main guard, but it doesn't catch transliterations stored as if they
were native Arabic (GeoNames data quirk).

---

## Decision matrix

Once you finish reviewing each country's table above, signal one of:

1. **Approve all 110 entries** as-is → Stage 4 merges everything
   (with the `rafah-eg` rename applied automatically).
2. **Approve per-country**: list which countries to approve in full.
   Example: "approve EG + YE; skip SD + LY for now".
3. **Exclude specific slugs**: list slugs you want skipped.
   Example: "skip al-jadid (no clear governorate), skip gereida".
4. **Rename specific slugs**: list `<final-slug>` → `<new-slug>` pairs.
   (rafah-eg is already pre-applied — only mention NEW renames.)

Stage 4 does NOT run until you signal explicitly.

## Untouched (per phase contract)

* `db/places/curated-places.json` — `git diff` clean.
* `db/places/candidates/*-geonames-candidates.json` — none of the
  candidate statuses have been flipped. Stage 4 will flip them when
  you approve.
* Homepage search, `/api/search-place`, `/search-test`, Qibla / Moon /
  Prayer pages, Supabase schema — none touched.

## License + attribution

Place data derived from GeoNames country dumps (EG, SD, LY, YE),
CC-BY 4.0. Sources: https://download.geonames.org/export/dump/{cc}.zip
