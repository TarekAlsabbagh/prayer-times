# TN GeoNames Import Report (refined)

**Country**: Tunisia (تونس)
**Generated**: 2026-05-15T07:35:51.124Z
**Phase**: `CURATED-GEODATA-TN-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/tn-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/tn-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/tn-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/tn-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 2245 |
| Normalized candidates                     | 1813 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **68** |
| **medium_confidence_pending**             | **2** |
| **low_confidence_pending**                | **37** |
| needs_review                              | 1697 |
| existing (matched, no action)             | 8 |
| rejected (bad data / religious site)      | 1 |
| Alias enrichment opps (in separate report) | 8 |

**Shortlist size (high + medium):** 70

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 1 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 7 |
| coords<1km | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| zaafrane | زعفران | Zaafrane | ولاية قبلي | PPL | 85 | 1094 | 119.40 | gabes |
| teboulba | ريج | Teboulba | ولاية المنستير | PPL | 85 | 37485 | 19.93 | monastir |
| sbeitla | سبيطلة | Sbeitla | ولاية القصرين | PPL | 85 | 23764 | 101.16 | kairouan |
| zarzis | جرجيس | Zarzis | ولاية مدنين | PPL | 85 | 79316 | 41.84 | djerba |
| houmt-souk | حومة السوق | Houmt Souk | ولاية مدنين | PPL | 85 | 75904 | 7.66 | djerba |
| rhar-el-melah | رأس زبيب | Rhar el Melah | ولاية بنزرت | PPL | 85 | 10530 | 30.39 | bizerte |
| enfidha | النفيضة | Enfidha | ولاية سوسة | PPL | 85 | 10990 | 41.41 | sousse |
| hammamet | الحمامات | Hammamet | ولاية نابل | PPL | 85 | 97579 | 59.60 | tunis |
| fernana | الفرنانة | Fernana | ولاية جندوبة | PPL | 85 | 4681 | 125.26 | bizerte |
| matmata | مطماطة | Matmata | ولاية قابس | PPL | 80 | 2406 | 39.26 | gabes |
| thelepte | تلابت | Thelepte | ولاية القصرين | PPL | 80 | 6932 | 157.07 | kairouan |
| testour | تستور | Testour | ولاية باجة | PPL | 80 | 13397 | 71.70 | tunis |
| tamaghzah | تمغزة | Tamaghzah | ولاية توزر | PPL | 80 | 2750 | 206.20 | gabes |
| tabursuq | تبرسق | Tabursuq | ولاية باجة | PPL | 80 | 12727 | 91.96 | tunis |
| tebourba | طبربة | Tebourba | ولاية منوبة | PPL | 80 | 27545 | 30.56 | tunis |
| tabarka | طبرقة | Tabarka | ولاية جندوبة | PPL | 80 | 19770 | 105.16 | bizerte |
| sukrah | سكرة | Sukrah | ولاية أريانة | PPL | 80 | 129693 | 9.80 | tunis |
| sidi-el-hani | سيدي الهاني | Sidi el Hani | ولاية سوسة | PPL | 80 | 2820 | 19.41 | kairouan |
| sidi-bou-said | سيدي بو سعيد | Sidi Bou Said | ولاية تونس | PPL | 80 | 7206 | 15.85 | tunis |
| chebika | الشبيكة | Chebika | ولاية توزر | PPL | 80 | 1820 | 205.02 | gabes |
| salakta | سلقطة | Salakta | ولاية المهدية | PPL | 80 | 3477 | 46.96 | monastir |
| sejenane | سجنان | Sejenane | ولاية بنزرت | PPL | 80 | 5718 | 61.31 | bizerte |
| rades | رادس | Radès | ولاية بن عروس | PPL | 80 | 59998 | 9.26 | tunis |
| ksour-essaf | قصور الساف | Ksour Essaf | ولاية المهدية | PPL | 80 | 36274 | 42.83 | monastir |
| ksibet-el-mediouni | قصيبة المديوني | Ksibet el Mediouni | ولاية المنستير | PPL | 80 | 13122 | 10.38 | monastir |
| korbous | قُرْبُص | Korbous | ولاية نابل | PPL | 80 | 3581 | 34.48 | tunis |
| kelibia | قليبية | Kélibia | ولاية نابل | PPL | 80 | 58524 | 81.33 | tunis |
| el-fahs | الفحص | El Fahs | ولاية زغوان | PPL | 80 | 23561 | 53.98 | tunis |
| gafour | قعفور | Gafour | ولاية سليانة | PPL | 80 | 10272 | 93.72 | tunis |
| nibbar | نبر | Nibbar | ولاية الكاف | PPL | 80 | 3557 | 138.60 | kairouan |
| msaken | مساكن | Msaken | ولاية سوسة | PPL | 80 | 72953 | 11.80 | sousse |
| mareth | مارث | Mareth | ولاية قابس | PPL | 80 | 11644 | 34.02 | gabes |
| menzel-jemil | منزل جميل | Menzel Jemil | ولاية بنزرت | PPL | 80 | 22231 | 5.58 | bizerte |
| menzel-bourguiba | منزل بورقيبة | Menzel Bourguiba | ولاية بنزرت | PPL | 80 | 54536 | 15.54 | bizerte |
| menzel-abderhaman | منزل عبد الرحمان | Menzel Abderhaman | ولاية بنزرت | PPL | 80 | 19085 | 4.25 | bizerte |
| mellouleche | ملولش‎ | Melloulèche | ولاية المهدية | PPL | 80 | 6948 | 53.54 | sfax |
| maktar | مكثر | Maktar | ولاية سليانة | PPL | 80 | 14500 | 83.83 | kairouan |
| kesra | كسرى | Kesra | ولاية سليانة | PPL | 80 | 2729 | 68.33 | kairouan |
| kalaat-khasba | القلعة الخصباء | Kalaat Khasba | ولاية الكاف | PPL | 80 | 2558 | 136.87 | kairouan |
| djemmal | جمال | Djemmal | ولاية المنستير | PPL | 80 | 50275 | 18.41 | monastir |
| harqalah | هرقلة | Harqalah | ولاية سوسة | PPL | 80 | 7423 | 25.49 | sousse |
| hammam-lif | حمام الأنف | Hammam-Lif | ولاية بن عروس | PPL | 80 | 47760 | 16.68 | tunis |
| haidra | حيدرة | Haïdra | ولاية القصرين | PPL | 80 | 3451 | 150.21 | kairouan |
| ghardimaou | غار الدماء | Ghardimaou | ولاية جندوبة | PPL | 80 | 19574 | 157.14 | bizerte |
| rhennouch | غنوش | Rhennouch | ولاية قابس | PPL | 80 | 28051 | 7.28 | gabes |
| feriana | فريانة | Feriana | ولاية القصرين | PPL | 80 | 29572 | 160.83 | kairouan |
| dahmani | الدهماني | Dahmani | ولاية الكاف | PPL | 80 | 13240 | 118.74 | kairouan |
| bou-salem | بوسالم | Bou Salem | ولاية جندوبة | PPL | 80 | 20818 | 109.37 | bizerte |
| ben-gardane | بنڤردان | Ben Gardane | ولاية مدنين | PPL | 80 | 66567 | 82.18 | djerba |
| le-bardo | باردو | Le Bardo | ولاية تونس | PPL | 80 | 71961 | 4.18 | tunis |
| beni-kheddache | بني خداش | Beni Kheddache | ولاية مدنين | PPL | 80 | 3588 | 70.52 | gabes |
| zarat | الزرات | Zarat | ولاية قابس | PPL | 80 | 5661 | 33.29 | gabes |
| zeramedine | زرمدين | Zeramedine | ولاية المنستير | PPL | 80 | 16806 | 24.02 | monastir |
| skhira | الصخيرة | Skhira | ولاية صفاقس | PPL | 80 | 11944 | 46.53 | gabes |
| seiada | صيادة | Seïada | ولاية المنستير | PPL | 80 | 12962 | 13.53 | monastir |
| as-sanad | السند | As Sanad | ولاية قفصة | PPL | 80 | 9533 | 100.34 | gabes |
| ar-rudayyif | الرّدَيِّف | Ar Rudayyif | ولاية قفصة | PPL | 80 | 26976 | 187.29 | gabes |
| el-ksour | القصور | El Ksour | ولاية الكاف | PPL | 80 | 5576 | 112.50 | kairouan |
| el-qantara | القنطرة | El Qantara | ولاية مدنين | PPL | 80 | 51 | 15.53 | djerba |
| metlaoui | متلوي | Metlaoui | ولاية قفصة | PPL | 80 | 38634 | 163.68 | gabes |
| mezzouna | المزونة | Mezzouna | ولاية سيدي بوزيد | PPL | 80 | 7390 | 80.92 | gabes |
| mahires | المحرس | Mahires | ولاية صفاقس | PPL | 80 | 15878 | 33.54 | sfax |
| kellabine | الكلابين | Kellabine | ولاية صفاقس | PPL | 80 | 15501 | 41.68 | sfax |
| el-hamma | الحامة | El Hamma | ولاية قابس | PPL | 80 | 73512 | 27.89 | gabes |
| ghraiba | الغريبة‬ | Ghraiba | ولاية صفاقس | PPL | 80 | 3251 | 57.17 | sfax |
| bekalta | البقالطة | Bekalta | ولاية المنستير | PPL | 80 | 17850 | 23.46 | monastir |
| ajim | أجيم | Ajim | ولاية مدنين | PPL | 80 | 24294 | 12.18 | djerba |
| port-el-kantaoui | مرسى القنطاوي | Port el Kantaoui | ولاية سوسة | PPL | 80 | 6000 | 8.34 | sousse |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| hiboun | هيبون | Hiboun | ولاية المهدية | PPL | 70 | 35.15 |
| rejim-maatoug | رجيم معتوق | Rejim Maatoug | ولاية قبلي | PPL | 70 | 208.05 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **37**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| zorgane | Zorgane | Zorgane | ولاية توزر | PPL | missing_real_ar_name |
| zreg-berrania | Zreg Berrania | Zreg Berrania | ولاية قابس | PPL | missing_real_ar_name |
| zola | Zola | Zola | ولاية المنستير | PPL | missing_real_ar_name |
| zmertene | Zmertene | Zmertene | ولاية قابس | PPL | missing_real_ar_name |
| zaouiet-sousse | Zaouiet Sousse | Zaouiet Sousse | ولاية سوسة | PPL | missing_real_ar_name |
| zaouia-sidi-ameur | Zaouïa Sidi Ameur | Zaouïa Sidi Ameur | ولاية سليانة | PPL | missing_real_ar_name |
| zaouia-sidi-abd-er-rahmane-el-gara | Zaouïa Sidi Abd er Rahmane el Gara | Zaouïa Sidi Abd er Rahmane el Gara | ولاية سوسة | PPL | missing_real_ar_name |
| zaouiet-sidi-abdelli | Zaouïet Sidi Abdelli | Zaouïet Sidi Abdelli | ولاية باجة | PPL | missing_real_ar_name |
| zaouiet-kountech | Zaouiet Kountech | Zaouiet Kountech | ولاية المنستير | PPL | missing_real_ar_name |
| zaouiet-medien | Zaouiet Medien | Zaouiet Medien | ولاية باجة | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| mesdjed-aissa | Mesdjed Aïssa | Mesdjed Aïssa | religious_site_not_city | \bmasjid\b |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tunis | tunis | slug |
| sousse | sousse | slug |
| sidi-el-rhedamsi | monastir | coords<1km (d=0.87km) |
| sfax | sfax | slug |
| gabes | gabes | slug |
| bizerte | bizerte | slug |
| kairouan | kairouan | slug |
| monastir | monastir | slug |

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
