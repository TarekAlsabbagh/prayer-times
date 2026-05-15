# Maghreb — Strategy D Review

**Generated**: 2026-05-15T07:45:03.250Z
**Phase**: `CURATED-GEODATA-MAGHREB-1` — Strategy D filter pass
**Target wave size**: ~110-135 entries (matching LEVANT-IRAQ-1 / NILE-YEMEN-LIBYA-1)

Per-country filter rules:

* **MA**: PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high + forcePPLA
* **DZ**: PPLC/PPLA/PPL + pop ≥ 50,000 + tier=high + forcePPLA
* **TN**: PPLC/PPLA/PPL + pop ≥ 30,000 + tier=high + forcePPLA
* **MR**: PPLC/PPLA/PPL + pop ≥ 10,000 + tier=high + forcePPLA

Slug collision handling: `city-cc` suffix per the established GCC-1
convention. Explicit rename: `saida` (DZ) → `saida-dz` (existing MA
saida in curated). Cross-country auto-renames applied as detected.

Western Sahara (MA admin1 11 + 12) → deferred to
`needs_manual_decision` section (not auto-merged).

---

## Summary

| Country | Strategy D matches | Renamed | Existing curated | Net new |
| ---     | ---:               | ---:    | ---:             | ---:    |
| MA | 8 | 0 | 10 | 8 |
| DZ | 54 | 1 | 10 | 54 |
| TN | 33 | 0 | 8 | 33 |
| MR | 17 | 0 | 3 | 17 |
| **TOTAL** | **112** | **1** | — | **112** |

Plus **6** entries deferred to `needs_manual_decision`
(Western Sahara) and **16** flagged in `bad_arabic_names`.

## Collision check

✅ **Zero cross-country slug collisions** among Strategy D picks (after renames).

✅ **Zero collisions with existing curated entries** (after renames).

## MA — 8 Strategy D picks

**Filter**: PPLC/PPLA/PPLA2/PPL + pop ≥ 100,000 + tier=high + forcePPLA

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `sale` | سلا | Salé | PPL | 972,299 | 95 | الرباط-سلا-القنيطرة / Rabat-Salé-Kénitra | 34.0531, -6.7985 | 5.4 km → rabat | rule_match (fc=PPL, pop=972299, tier=high) |
| 2 | `al-hoceima` | الحسيمة | Al Hoceïma | PPLA2 | 395,644 | 90 | طنجة-تطوان-الحسيمة / Tanger-Tétouan-Al Hoceima | 35.2516, -3.9372 | 134.7 km → tetouan | rule_match (fc=PPLA2, pop=395644, tier=high) |
| 3 | `safi` | آسفي | Safi | PPLA2 | 336,883 | 90 | مراكش-آسفي / Marrakech-Safi | 32.2994, -9.2372 | 140.0 km → marrakesh | rule_match (fc=PPLA2, pop=336883, tier=high) |
| 4 | `el-jadida` | الجديدة | El Jadida | PPL | 212,863 | 90 | الدار البيضاء-سطات / Casablanca-Settat | 33.2568, -8.5088 | 92.3 km → casablanca | rule_match (fc=PPL, pop=212863, tier=high) |
| 5 | `beni-mellal` | بني ملال | Beni Mellal | PPLA | 210,397 | 90 | بني ملال-خنيفرة / Béni Mellal-Khénifra | 32.3372, -6.3498 | 172.8 km → marrakesh | force_ppla_seat (fc=PPLA, pop=210397, tier=low) |
| 6 | `taza` | تازة | Taza | PPLA2 | 162,110 | 90 | فاس-مكناس / Fès-Meknès | 34.2100, -4.0100 | 94.3 km → fes | rule_match (fc=PPLA2, pop=162110, tier=high) |
| 7 | `settat` | سطات | Settat | PPLA2 | 155,333 | 90 | الدار البيضاء-سطات / Casablanca-Settat | 33.0010, -7.6166 | 63.7 km → casablanca | rule_match (fc=PPLA2, pop=155333, tier=high) |
| 8 | `guelmim` | كلميم | Guelmim | PPLA | 129,200 | 90 | كلميم-واد نون / Guelmim-Oued Noun | 28.9870, -10.0574 | 166.2 km → agadir | force_ppla_seat (fc=PPLA, pop=129200, tier=low) |

## DZ — 54 Strategy D picks

**Filter**: PPLC/PPLA/PPL + pop ≥ 50,000 + tier=high + forcePPLA

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `bab-ezzouar` | باب الزوار | Bab Ezzouar | PPL | 275,630 | 90 | ولاية الجزائر / Algiers Province | 36.7261, 3.1829 | 11.5 km → algiers | rule_match (fc=PPL, pop=275630, tier=high) |
| 2 | `djelfa` | jlfہ | Djelfa | PPLA | 265,833 | 90 | ولاية الجلفة / Djelfa Province | 34.6728, 3.2630 | 203.7 km → blida | force_ppla_seat (fc=PPLA, pop=265833, tier=low) |
| 3 | `sidi-bel-abbes` | سيدي بلعباس | Sidi Bel Abbes | PPLA | 210,146 | 90 | ولاية سيدي بلعباس / Sidi Bel Abbès Province | 35.1899, -0.6309 | 56.5 km → oran | force_ppla_seat (fc=PPLA, pop=210146, tier=low) |
| 4 | `biskra` | bskrہ | Biskra | PPLA | 204,661 | 90 | ولاية بسكرة / Biskra Province | 34.8504, 5.7280 | 88.3 km → batna | force_ppla_seat (fc=PPLA, pop=204661, tier=low) |
| 5 | `tebessa` | تبسة | Tébessa | PPLA | 194,461 | 90 | ولاية تبسة / Tébessa Province | 35.4042, 8.1242 | 169.4 km → annaba | force_ppla_seat (fc=PPLA, pop=194461, tier=low) |
| 6 | `skikda` | سكيكدة | Skikda | PPLA | 182,903 | 90 | ولاية سكيكدة / Skikda Province | 36.8762, 6.9092 | 62.6 km → constantine | force_ppla_seat (fc=PPLA, pop=182903, tier=low) |
| 7 | `tiaret` | تيارت | Tiaret | PPLA | 178,915 | 90 | ولاية تيارت / Tiaret Province | 35.3710, 1.3170 | 180.2 km → oran | force_ppla_seat (fc=PPLA, pop=178915, tier=low) |
| 8 | `chlef` | أورليانفيل | Chlef | PPLA | 178,616 | 90 | ولاية الشلف / Chlef Province | 36.1653, 1.3345 | 138.0 km → blida | force_ppla_seat (fc=PPLA, pop=178616, tier=low) |
| 9 | `ouargla` | ورقلة | Ouargla | PPLA | 169,928 | 90 | ولاية ورقلة / Ouargla Province | 31.9493, 5.3250 | 166.4 km → ghardaia | force_ppla_seat (fc=PPLA, pop=169928, tier=low) |
| 10 | `bechar` | بشار | Béchar | PPLA | 165,241 | 90 | ولاية بشار / Béchar Province | 31.6167, -2.2167 | 372.7 km → tlemcen | force_ppla_seat (fc=PPLA, pop=165241, tier=low) |
| 11 | `mostaganem` | مستاغانم | Mostaganem | PPLA | 162,885 | 90 | ولاية مستغانم / Mostaganem Province | 35.9312, 0.0892 | 70.2 km → oran | force_ppla_seat (fc=PPLA, pop=162885, tier=low) |
| 12 | `bordj-bou-arreridj` | برج بوعريريج | Bordj Bou Arreridj | PPLA | 158,812 | 90 | ولاية برج بوعريريج / Bordj Bou Arréridj Province | 36.0739, 4.7614 | 60.0 km → setif | force_ppla_seat (fc=PPLA, pop=158812, tier=low) |
| 13 | `el-achir` | اليشير | El Achir | PPL | 158,333 | 90 | ولاية برج بوعريريج / Bordj Bou Arréridj Province | 36.0639, 4.6274 | 72.0 km → setif | rule_match (fc=PPL, pop=158333, tier=high) |
| 14 | `souk-ahras` | سوق أهراس | Souk Ahras | PPLA | 153,479 | 90 | ولاية سوق أهراس / Souk Ahras Province | 36.2864, 7.9511 | 70.2 km → annaba | force_ppla_seat (fc=PPLA, pop=153479, tier=low) |
| 15 | `medea` | المدية | Médéa | PPLA | 145,441 | 90 | ولاية المدية / Médéa Province | 36.2642, 2.7539 | 23.8 km → blida | force_ppla_seat (fc=PPLA, pop=145441, tier=low) |
| 16 | `touggourt` | تقرت | Touggourt | PPLA | 143,270 | 90 | ولاية تقرت / Touggourt Province | 33.1108, 6.0700 | 234.6 km → ghardaia | force_ppla_seat (fc=PPLA, pop=143270, tier=low) |
| 17 | `saida-dz` (renamed from `saida`) | سعيدة | Saïda | PPLA | 142,497 | 90 | ولاية سعيدة / Saïda Province | 34.8303, 0.1517 | 119.9 km → oran | force_ppla_seat (fc=PPLA, pop=142497, tier=low) |
| 18 | `laghouat` | اغواط | Laghouat | PPLA | 134,372 | 90 | ولاية الأغواط / Laghouat Province | 33.8000, 2.8651 | 164.5 km → ghardaia | force_ppla_seat (fc=PPLA, pop=134372, tier=low) |
| 19 | `msila` | المسيلة | M'Sila | PPLA | 132,975 | 90 | ولاية المسيلة / M'Sila Province | 35.7089, 4.5372 | 95.3 km → setif | force_ppla_seat (fc=PPLA, pop=132975, tier=low) |
| 20 | `jijel` | جيجل | Jijel | PPLA | 131,513 | 90 | ولاية جيجل / Jijel Province | 36.8210, 5.7635 | 61.0 km → bejaia | force_ppla_seat (fc=PPLA, pop=131513, tier=low) |
| 21 | `relizane` | غليزان | Relizane | PPLA | 123,255 | 90 | ولاية غليزان / Relizane Province | 35.7373, 0.5560 | 107.5 km → oran | force_ppla_seat (fc=PPLA, pop=123255, tier=low) |
| 22 | `bordj-el-kiffan` | برج الكيفان | Bordj el Kiffan | PPL | 123,246 | 90 | ولاية الجزائر / Algiers Province | 36.7487, 3.1925 | 11.9 km → algiers | rule_match (fc=PPL, pop=123246, tier=high) |
| 23 | `guelma` | qalmہ | Guelma | PPLA | 120,004 | 90 | ولاية قالمة / Guelma Province | 36.4621, 7.4261 | 57.4 km → annaba | force_ppla_seat (fc=PPLA, pop=120004, tier=low) |
| 24 | `rouiba` | الرويبة | Rouiba | PPL | 117,558 | 90 | ولاية الجزائر / Algiers Province | 36.7383, 3.2808 | 19.9 km → algiers | rule_match (fc=PPL, pop=117558, tier=high) |
| 25 | `khenchela` | خنشلة | Khenchela | PPLA | 114,472 | 90 | ولاية خنشلة / Khenchela Province | 35.4358, 7.1433 | 88.8 km → batna | force_ppla_seat (fc=PPLA, pop=114472, tier=low) |
| 26 | `bou-saada` | بلد السعادة | Bou Saâda | PPL | 111,787 | 90 | ولاية المسيلة / M'Sila Province | 35.2086, 4.1740 | 156.3 km → setif | rule_match (fc=PPL, pop=111787, tier=high) |
| 27 | `mascara` | مسکره | Mascara | PPLA | 108,629 | 90 | ولاية معسكر / Mascara Province | 35.3966, 0.1403 | 77.6 km → oran | force_ppla_seat (fc=PPLA, pop=108629, tier=low) |
| 28 | `baraki` | براقي | Baraki | PPL | 105,402 | 90 | ولاية الجزائر / Algiers Province | 36.6666, 3.0961 | 10.3 km → algiers | rule_match (fc=PPL, pop=105402, tier=high) |
| 29 | `tizi-ouzou` | تيزي وزو | Tizi Ouzou | PPLA | 104,312 | 90 | ولاية تيزي وزو / Tizi Ouzou Province | 36.7118, 4.0459 | 88.1 km → algiers | force_ppla_seat (fc=PPLA, pop=104312, tier=low) |
| 30 | `barika` | بريكة | Barika | PPL | 98,141 | 85 | ولاية باتنة / Batna Province | 35.3890, 5.3658 | 75.5 km → batna | rule_match (fc=PPL, pop=98141, tier=high) |
| 31 | `el-bayadh` | البلیده | El Bayadh | PPLA | 85,577 | 85 | ولاية البيض / El Bayadh Province | 33.6832, 1.0193 | 252.6 km → tlemcen | force_ppla_seat (fc=PPLA, pop=85577, tier=low) |
| 32 | `tamanghasset` | تامنراست | Tamanghasset | PPLA | 81,752 | 85 | ولاية تمنراست / Tamanrasset Province | 22.7850, 5.5228 | 1093.7 km → ghardaia | force_ppla_seat (fc=PPLA, pop=81752, tier=low) |
| 33 | `khemis-miliana` | أفرفيل | Khemis Miliana | PPL | 80,512 | 85 | ولاية عين الدفلى / Aïn Defla Province | 36.2610, 2.2201 | 59.2 km → blida | rule_match (fc=PPL, pop=80512, tier=high) |
| 34 | `bouira` | bwyrہ | Bouïra | PPLA | 68,545 | 85 | ولاية البويرة / Bouïra Province | 36.3749, 3.9020 | 86.3 km → algiers | force_ppla_seat (fc=PPLA, pop=68545, tier=low) |
| 35 | `adrar` | أدرار | Adrar | PPLA | 68,276 | 85 | ولاية أدرار / Adrar Province | 27.8743, -0.2939 | 638.7 km → ghardaia | force_ppla_seat (fc=PPLA, pop=68276, tier=low) |
| 36 | `oum-el-bouaghi` | أم البواقي | Oum el Bouaghi | PPLA | 67,201 | 85 | ولاية أم البواقي / Oum El Bouaghi Province | 35.8754, 7.1135 | 70.5 km → constantine | force_ppla_seat (fc=PPLA, pop=67201, tier=low) |
| 37 | `tissemsilt` | تسمسيلت | Tissemsilt | PPLA | 66,084 | 85 | ولاية تيسمسيلت / Tissemsilt Province | 35.6072, 1.8108 | 132.5 km → blida | force_ppla_seat (fc=PPLA, pop=66084, tier=low) |
| 38 | `mila` | ميلة | Mila | PPLA | 63,251 | 85 | ولاية ميلة / Mila Province | 36.4503, 6.2644 | 32.7 km → constantine | force_ppla_seat (fc=PPLA, pop=63251, tier=low) |
| 39 | `ouled-djellal` | أولاد جلال | Ouled Djellal | PPLA | 58,481 | 85 | ولاية أولاد جلال / Ouled Djellal Province | 34.4300, 5.0614 | 161.1 km → batna | force_ppla_seat (fc=PPLA, pop=58481, tier=low) |
| 40 | `arzew` | أرزيو | Arzew | PPL | 58,162 | 85 | ولاية وهران / Oran Province | 35.8505, -0.3180 | 33.2 km → oran | rule_match (fc=PPL, pop=58162, tier=high) |
| 41 | `el-menia` | almnyہ | El Menia | PPLA | 57,344 | 85 | ولاية المنيعة / El Meniaa Province | 30.5756, 2.8842 | 225.0 km → ghardaia | force_ppla_seat (fc=PPLA, pop=57344, tier=low) |
| 42 | `boudouaou` | بودواو | Boudouaou | PPL | 56,398 | 85 | ولاية بومرداس / Boumerdès Province | 36.7274, 3.4099 | 31.4 km → algiers | rule_match (fc=PPL, pop=56398, tier=high) |
| 43 | `boghni` | بوغني | Boghni | PPL | 54,666 | 85 | ولاية تيزي وزو / Tizi Ouzou Province | 36.5422, 3.9531 | 83.2 km → algiers | rule_match (fc=PPL, pop=54666, tier=high) |
| 44 | `bordj-el-bahri` | برج البحري | Bordj el Bahri | PPL | 52,816 | 85 | ولاية الجزائر / Algiers Province | 36.7907, 3.2495 | 17.5 km → algiers | rule_match (fc=PPL, pop=52816, tier=high) |
| 45 | `tindouf` | تندوف | Tindouf | PPLA | 45,610 | 80 | ولاية تندوف / Tindouf Province | 27.6711, -8.1474 | 1031.1 km → tlemcen | force_ppla_seat (fc=PPLA, pop=45610, tier=low) |
| 46 | `el-meghaier` | المغير | El Meghaïer | PPLA | 39,106 | 80 | ولاية المغير / El Meghaïer Province | 33.9514, 5.9222 | 179.9 km → batna | force_ppla_seat (fc=PPLA, pop=39106, tier=low) |
| 47 | `boumerdas` | أبو مرداس | Boumerdas | PPLA | 28,996 | 80 | ولاية بومرداس / Boumerdès Province | 36.7664, 3.4772 | 37.3 km → algiers | force_ppla_seat (fc=PPLA, pop=28996, tier=low) |
| 48 | `timimoun` | تميمون | Timimoun | PPLA | 22,086 | 80 | ولاية تيميمون / Timimoun Province | 29.2642, 0.2358 | 485.5 km → ghardaia | force_ppla_seat (fc=PPLA, pop=22086, tier=low) |
| 49 | `tipasa` | تبسہ | Tipasa | PPLA | 15,180 | 80 | ولاية تيبازة / Tipaza Province | 36.5897, 2.4489 | 36.4 km → blida | force_ppla_seat (fc=PPLA, pop=15180, tier=low) |
| 50 | `naama` | النعامة | Naama | PPLA | 14,624 | 80 | ولاية النعامة / Naâma Province | 33.2667, -0.3167 | 201.9 km → tlemcen | force_ppla_seat (fc=PPLA, pop=14624, tier=low) |
| 51 | `el-tarf` | الطارف | El Tarf | PPLA | 13,346 | 80 | ولاية الطارف / El Tarf Province | 36.7672, 8.3138 | 50.9 km → annaba | force_ppla_seat (fc=PPLA, pop=13346, tier=low) |
| 52 | `illizi` | إليزي | Illizi | PPLA | 13,029 | 80 | ولاية إليزي / Illizi Province | 26.4833, 8.4667 | 812.5 km → ghardaia | force_ppla_seat (fc=PPLA, pop=13029, tier=low) |
| 53 | `beni-abbes` | بني عباس | Béni Abbès | PPLA | 11,416 | 80 | ولاية بني عباس / Béni Abbès Province | 30.1331, -2.1661 | 534.1 km → tlemcen | force_ppla_seat (fc=PPLA, pop=11416, tier=low) |
| 54 | `djanet` | جانت | Djanet | PPLA | 0 | 60 | ولاية جانت / Djanet Province | 24.5553, 9.4850 | 1048.2 km → ghardaia | force_ppla_seat (fc=PPLA, pop=0, tier=low) |

## TN — 33 Strategy D picks

**Filter**: PPLC/PPLA/PPL + pop ≥ 30,000 + tier=high + forcePPLA

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `sukrah` | سكرة | Sukrah | PPL | 129,693 | 90 | ولاية أريانة / Ariana Governorate | 36.8774, 10.2468 | 9.8 km → tunis | rule_match (fc=PPL, pop=129693, tier=high) |
| 2 | `aryanah` | aryanہ | Aryanah | PPLA | 114,486 | 90 | ولاية أريانة / Ariana Governorate | 36.8601, 10.1934 | 6.1 km → tunis | force_ppla_seat (fc=PPLA, pop=114486, tier=low) |
| 3 | `hammamet` | الحمامات | Hammamet | PPL | 97,579 | 85 | ولاية نابل / Nabeul Governorate | 36.4000, 10.6167 | 59.6 km → tunis | rule_match (fc=PPL, pop=97579, tier=high) |
| 4 | `gafsa` | qfsہ | Gafsa | PPLA | 95,242 | 85 | ولاية قفصة / Gafsa Governorate | 34.4250, 8.7842 | 135.2 km → gabes | force_ppla_seat (fc=PPLA, pop=95242, tier=low) |
| 5 | `ben-arous` | بن عروس | Ben Arous | PPLA | 88,322 | 85 | ولاية بن عروس / Ben Arous Governorate | 36.7545, 10.2217 | 6.8 km → tunis | force_ppla_seat (fc=PPLA, pop=88322, tier=low) |
| 6 | `kasserine` | القصرين | Kasserine | PPLA | 84,365 | 85 | ولاية القصرين / Kasserine Governorate | 35.1676, 8.8365 | 127.5 km → kairouan | force_ppla_seat (fc=PPLA, pop=84365, tier=low) |
| 7 | `zarzis` | جرجيس | Zarzis | PPL | 79,316 | 85 | ولاية مدنين / Medenine Governorate | 33.5040, 11.1121 | 41.8 km → djerba | rule_match (fc=PPL, pop=79316, tier=high) |
| 8 | `houmt-souk` | حومة السوق | Houmt Souk | PPL | 75,904 | 85 | ولاية مدنين / Medenine Governorate | 33.8758, 10.8575 | 7.7 km → djerba | rule_match (fc=PPL, pop=75904, tier=high) |
| 9 | `el-hamma` | الحامة | El Hamma | PPL | 73,512 | 85 | ولاية قابس / Gabès Governorate | 33.8915, 9.7963 | 27.9 km → gabes | rule_match (fc=PPL, pop=73512, tier=high) |
| 10 | `msaken` | مساكن | Msaken | PPL | 72,953 | 85 | ولاية سوسة / Sousse Governorate | 35.7292, 10.5808 | 11.8 km → sousse | rule_match (fc=PPL, pop=72953, tier=high) |
| 11 | `le-bardo` | باردو | Le Bardo | PPL | 71,961 | 85 | ولاية تونس / Tunis Governorate | 36.8106, 10.1348 | 4.2 km → tunis | rule_match (fc=PPL, pop=71961, tier=high) |
| 12 | `medenine` | مدنين | Medenine | PPLA | 71,406 | 85 | ولاية مدنين / Medenine Governorate | 33.3550, 10.5055 | 59.4 km → djerba | force_ppla_seat (fc=PPLA, pop=71406, tier=low) |
| 13 | `nabeul` | نابل | Nabeul | PPLA | 70,437 | 85 | ولاية نابل / Nabeul Governorate | 36.4561, 10.7376 | 63.1 km → tunis | force_ppla_seat (fc=PPLA, pop=70437, tier=low) |
| 14 | `tataouine` | تطاوين | Tataouine | PPLA | 66,924 | 85 | ولاية تطاوين / Tataouine Governorate | 32.9297, 10.4518 | 104.2 km → djerba | force_ppla_seat (fc=PPLA, pop=66924, tier=low) |
| 15 | `ben-gardane` | بنڤردان | Ben Gardane | PPL | 66,567 | 85 | ولاية مدنين / Medenine Governorate | 33.1378, 11.2196 | 82.2 km → djerba | rule_match (fc=PPL, pop=66567, tier=high) |
| 16 | `beja` | bajہ | Béja | PPLA | 61,568 | 85 | ولاية باجة / Béja Governorate | 36.7256, 9.1817 | 86.6 km → bizerte | force_ppla_seat (fc=PPLA, pop=61568, tier=low) |
| 17 | `rades` | رادس | Radès | PPL | 59,998 | 85 | ولاية بن عروس / Ben Arous Governorate | 36.7695, 10.2747 | 9.3 km → tunis | rule_match (fc=PPL, pop=59998, tier=high) |
| 18 | `kelibia` | قليبية | Kélibia | PPL | 58,524 | 85 | ولاية نابل / Nabeul Governorate | 36.8476, 11.0939 | 81.3 km → tunis | rule_match (fc=PPL, pop=58524, tier=high) |
| 19 | `menzel-bourguiba` | منزل بورقيبة | Menzel Bourguiba | PPL | 54,536 | 85 | ولاية بنزرت / Bizerte Governorate | 37.1537, 9.7859 | 15.5 km → bizerte | rule_match (fc=PPL, pop=54536, tier=high) |
| 20 | `el-kef` | الكاف | El Kef | PPLA | 53,596 | 85 | ولاية الكاف / Kef Governorate | 36.1742, 8.7049 | 137.6 km → kairouan | force_ppla_seat (fc=PPLA, pop=53596, tier=low) |
| 21 | `mahdia` | المهدية | Mahdia | PPLA | 51,803 | 85 | ولاية المهدية / Mahdia Governorate | 35.5047, 11.0622 | 37.1 km → monastir | force_ppla_seat (fc=PPLA, pop=51803, tier=low) |
| 22 | `jendouba` | jndwbہ | Jendouba | PPLA | 51,408 | 85 | ولاية جندوبة / Jendouba Governorate | 36.5011, 8.7802 | 129.5 km → tunis | force_ppla_seat (fc=PPLA, pop=51408, tier=low) |
| 23 | `djemmal` | جمال | Djemmal | PPL | 50,275 | 85 | ولاية المنستير / Monastir Governorate | 35.6223, 10.7570 | 18.4 km → monastir | rule_match (fc=PPL, pop=50275, tier=high) |
| 24 | `hammam-lif` | حمام الأنف | Hammam-Lif | PPL | 47,760 | 80 | ولاية بن عروس / Ben Arous Governorate | 36.7287, 10.3416 | 16.7 km → tunis | rule_match (fc=PPL, pop=47760, tier=high) |
| 25 | `sidi-bouzid` | سيدي بوزيد | Sidi Bouzid | PPLA | 47,595 | 80 | ولاية سيدي بوزيد / Sidi Bouzid Governorate | 35.0382, 9.4849 | 89.9 km → kairouan | force_ppla_seat (fc=PPLA, pop=47595, tier=low) |
| 26 | `metlaoui` | متلوي | Metlaoui | PPL | 38,634 | 80 | ولاية قفصة / Gafsa Governorate | 34.3208, 8.4016 | 163.7 km → gabes | rule_match (fc=PPL, pop=38634, tier=high) |
| 27 | `teboulba` | ريج | Teboulba | PPL | 37,485 | 80 | ولاية المنستير / Monastir Governorate | 35.6402, 10.9673 | 19.9 km → monastir | rule_match (fc=PPL, pop=37485, tier=high) |
| 28 | `tozeur` | توزر | Tozeur | PPLA | 37,370 | 80 | ولاية توزر / Tozeur Governorate | 33.9197, 8.1335 | 181.4 km → gabes | force_ppla_seat (fc=PPLA, pop=37370, tier=low) |
| 29 | `ksour-essaf` | قصور الساف | Ksour Essaf | PPL | 36,274 | 80 | ولاية المهدية / Mahdia Governorate | 35.4181, 10.9947 | 42.8 km → monastir | rule_match (fc=PPL, pop=36274, tier=high) |
| 30 | `manouba` | mnwbہ | Manouba | PPLA | 32,005 | 80 | ولاية منوبة / Manouba Governorate | 36.8101, 10.0956 | 7.7 km → tunis | force_ppla_seat (fc=PPLA, pop=32005, tier=low) |
| 31 | `siliana` | slyanہ | Siliana | PPLA | 31,251 | 80 | ولاية سليانة / Siliana Governorate | 36.0850, 9.3708 | 80.3 km → kairouan | force_ppla_seat (fc=PPLA, pop=31251, tier=low) |
| 32 | `kebili` | قبلي | Kebili | PPLA | 26,310 | 80 | ولاية قبلي / Kebili Governorate | 33.7044, 8.9690 | 106.2 km → gabes | force_ppla_seat (fc=PPLA, pop=26310, tier=low) |
| 33 | `zaghouan` | زغوان | Zaghouan | PPLA | 20,798 | 80 | ولاية زغوان / Zaghouan Governorate | 36.4029, 10.1429 | 45.0 km → tunis | force_ppla_seat (fc=PPLA, pop=20798, tier=low) |

## MR — 17 Strategy D picks

**Filter**: PPLC/PPLA/PPL + pop ≥ 10,000 + tier=high + forcePPLA

| # | final slug | name.ar | name.en | fc | pop | priority | region (ar / en) | lat,lng | dist→nearest curated | reason |
| --:| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |
| 1 | `kiffa` | kfہ | Kiffa | PPLA | 62,051 | 85 | ولاية لعصابة / Assaba Region | 16.6207, -11.4021 | 466.7 km → atar | force_ppla_seat (fc=PPLA, pop=62051, tier=low) |
| 2 | `dar-naim` | دار النعيم | Dar Naim | PPLA | 61,089 | 85 | ولاية نواكشوط الشمالية / Nouakchott Nord Region | 18.1081, -15.9267 | 5.1 km → nouakchott | force_ppla_seat (fc=PPLA, pop=61089, tier=low) |
| 3 | `nema` | النعمة | Néma | PPLA | 60,000 | 85 | ولاية الحوض الشرقي / Hodh Ech Chargui Region | 16.6170, -7.2565 | 748.8 km → atar | force_ppla_seat (fc=PPLA, pop=60000, tier=low) |
| 4 | `kaedi` | كيهيدي | Kaédi | PPLA | 56,283 | 85 | ولاية كوركول / Gorgol Region | 16.1507, -13.5058 | 337.1 km → nouakchott | force_ppla_seat (fc=PPLA, pop=56283, tier=low) |
| 5 | `zouerat` | ازويرات | Zouérat | PPLA | 55,183 | 85 | ولاية تيرس زمور / Tiris Zemmour Region | 22.7354, -12.4713 | 253.9 km → atar | force_ppla_seat (fc=PPLA, pop=55183, tier=low) |
| 6 | `tevragh-zeina` | tfragh zynہ | Tevragh Zeina | PPLA | 48,093 | 80 | ولاية نواكشوط الغربية / Nouakchott Ouest Region | 18.0989, -15.9885 | 4.3 km → nouakchott | force_ppla_seat (fc=PPLA, pop=48093, tier=low) |
| 7 | `selibaby` | سيلبابي | Sélibaby | PPLA | 32,653 | 80 | ولاية كيدي ماغا / Guidimaka Region | 15.1585, -12.1843 | 516.4 km → nouakchott | force_ppla_seat (fc=PPLA, pop=32653, tier=low) |
| 8 | `ayoun-el-atrous` | العيون | Ayoun El Atrous | PPLA | 28,174 | 80 | ولاية الحوض الغربي / Hodh El Gharbi Region | 16.6614, -9.6149 | 561.0 km → atar | force_ppla_seat (fc=PPLA, pop=28174, tier=low) |
| 9 | `bogue` | بوغي | Bogué | PPL | 20,291 | 80 | ولاية لبراكنة / Brakna Region | 16.5915, -14.2631 | 244.0 km → nouakchott | rule_match (fc=PPL, pop=20291, tier=high) |
| 10 | `aleg` | ألاك | Aleg | PPLA | 19,183 | 80 | ولاية لبراكنة / Brakna Region | 17.0531, -13.9131 | 244.7 km → nouakchott | force_ppla_seat (fc=PPLA, pop=19183, tier=low) |
| 11 | `tembedgha` | تمبدغة | Tembedgha | PPL | 17,465 | 80 | ولاية الحوض الشرقي / Hodh Ech Chargui Region | 16.2414, -8.1732 | 700.5 km → atar | rule_match (fc=PPL, pop=17465, tier=high) |
| 12 | `rosso` | روسو | Rosso | PPLA | 15,870 | 80 | ولاية الترارزة / Trarza Region | 16.5138, -15.8050 | 174.2 km → nouakchott | force_ppla_seat (fc=PPLA, pop=15870, tier=low) |
| 13 | `akjoujt` | أكجوجت | Akjoujt | PPLA | 15,851 | 80 | ولاية إنشيري / Inchiri Region | 19.7416, -14.3853 | 163.9 km → atar | force_ppla_seat (fc=PPLA, pop=15851, tier=low) |
| 14 | `tidjikja` | تيجيكجة | Tidjikja | PPLA | 13,479 | 80 | ولاية تكانت / Tagant Region | 18.5564, -11.4271 | 276.5 km → atar | force_ppla_seat (fc=PPLA, pop=13479, tier=low) |
| 15 | `lexeibaun` | لكصيبه 1 | Lexeiba Un | PPL | 11,417 | 80 | ولاية كوركول / Gorgol Region | 16.2251, -13.1409 | 363.1 km → nouakchott | rule_match (fc=PPL, pop=11417, tier=high) |
| 16 | `ganki-un` | ﯖانكي 1 | Ganki Un | PPL | 11,250 | 80 | ولاية كوركول / Gorgol Region | 16.2141, -13.2404 | 355.1 km → nouakchott | rule_match (fc=PPL, pop=11250, tier=high) |
| 17 | `arafat` | عرفات | Arafat | PPLA | 0 | 60 | ولاية نواكشوط الجنوبية / Nouakchott Sud Region | 18.0464, -15.9719 | 3.3 km → nouakchott | force_ppla_seat (fc=PPLA, pop=0, tier=low) |

---

## Needs manual decision — Western Sahara (MA admin1 11 + 12)

GeoNames assigns these places to MA (Morocco), but the political
status of Western Sahara is contested. They are NOT included in
Strategy D's auto-merge — you decide whether to:

1. Approve all (treat as MA per GeoNames) — pulls them into curated
   with cc=ma and `Africa/Casablanca` timezone.
2. Approve some (specific slugs only).
3. Skip all — leave Western Sahara for a separate phase.

Listing includes every PENDING entry from admin1=11 or admin1=12
regardless of whether it would have passed Strategy D's filters.

**Note on Laâyoune + Dakhla**: GeoNames' MA dump does NOT tag the
cities of Laâyoune (capital of region 11) or Dakhla (capital of
region 12) as PPLA/PPLC — likely a side effect of the political
contested status. If neither appears in the table below, they are
absent from candidates entirely. The user can still add them manually
after a separate decision (curated entries can be authored without
going through the GeoNames pipeline).

| slug | name.ar | name.en | fc | admin1 | pop | tier | lat,lng | passes Strategy D? |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `smara` | السمارة | Smara | PPL | 11 (Laâyoune-Sakia El Hamra) | 42,056 | high | 26.7384, -11.6719 | no |
| `aousserd` | آوسرد | Aousserd | PPL | 12 (Dakhla-Oued Ed-Dahab) | 5,832 | high | 22.5540, -14.3300 | no |
| `tarfaya` | طرفاية | Tarfaya | PPL | 11 (Laâyoune-Sakia El Hamra) | 5,615 | high | 27.9392, -12.9260 | no |
| `imlili` | إمليلي | Imlili | PPL | 12 (Dakhla-Oued Ed-Dahab) | 2,269 | high | 22.6558, -15.6072 | no |
| `oum-dreyga` | أم ادريكة | Oum Dreyga | PPL | 12 (Dakhla-Oued Ed-Dahab) | 0 | low | 24.1667, -13.2500 | no |
| `falaklak` | فالاكلاك | Falaklak | PPL | 12 (Dakhla-Oued Ed-Dahab) | 0 | low | 21.7891, -13.6244 | no |

## Bad Arabic names — flagged for manual review

⚠️ 16 entries have problematic `names.ar`.
Recommended actions: (a) provide a manual correction at apply-prep
time, OR (b) exclude from this wave.

| cc | final slug | current names.ar | english | issue |
| --- | --- | --- | --- | --- |
| DZ | `djelfa` | jlfہ | Djelfa | no Arabic letters (looks Latin) |
| DZ | `biskra` | bskrہ | Biskra | no Arabic letters (looks Latin) |
| DZ | `guelma` | qalmہ | Guelma | no Arabic letters (looks Latin) |
| DZ | `mascara` | مسکره | Mascara | mixed script (Latin/Urdu chars present) |
| DZ | `el-bayadh` | البلیده | El Bayadh | mixed script (Latin/Urdu chars present) |
| DZ | `bouira` | bwyrہ | Bouïra | no Arabic letters (looks Latin) |
| DZ | `el-menia` | almnyہ | El Menia | no Arabic letters (looks Latin) |
| DZ | `tipasa` | تبسہ | Tipasa | mixed script (Latin/Urdu chars present) |
| TN | `aryanah` | aryanہ | Aryanah | no Arabic letters (looks Latin) |
| TN | `gafsa` | qfsہ | Gafsa | no Arabic letters (looks Latin) |
| TN | `beja` | bajہ | Béja | no Arabic letters (looks Latin) |
| TN | `jendouba` | jndwbہ | Jendouba | no Arabic letters (looks Latin) |
| TN | `manouba` | mnwbہ | Manouba | no Arabic letters (looks Latin) |
| TN | `siliana` | slyanہ | Siliana | no Arabic letters (looks Latin) |
| MR | `kiffa` | kfہ | Kiffa | no Arabic letters (looks Latin) |
| MR | `tevragh-zeina` | tfragh zynہ | Tevragh Zeina | no Arabic letters (looks Latin) |

---

## Decision matrix

Once you finish reviewing each country's table above, signal one of:

1. **Approve all 112 entries** as-is → Stage 4 merges
   everything with the explicit + auto renames applied.
2. **Approve per-country**: list which countries to approve in full.
3. **Exclude specific slugs**: list slugs you want skipped.
4. **Rename specific slugs**: list `<final-slug>` → `<new-slug>` pairs
   (auto renames already applied — only mention NEW renames).
5. **Fix names.ar then approve**: 16 entries in bad_arabic_names
   need user-provided Arabic corrections.

Separately, decide on Western Sahara (6 entries): approve / skip / partial.

Stage 4 does NOT run until you signal.

## Untouched (per phase contract)

* `db/places/curated-places.json` — `git diff` clean.
* `db/places/candidates/*-geonames-candidates.json` — status flags
  untouched (no flip to `approved`).
* Homepage search, `/api/search-place`, `/search-test`, Qibla / Moon /
  Prayer pages, Supabase schema — none touched.

## License + attribution

Place data derived from GeoNames country dumps (MA, DZ, TN, MR),
CC-BY 4.0. Sources: https://download.geonames.org/export/dump/{cc}.zip
