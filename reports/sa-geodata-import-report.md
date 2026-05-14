# SA GeoNames Import Report (refined)

**Country**: Saudi Arabia (المملكة العربية السعودية)
**Generated**: 2026-05-14T16:14:34.029Z
**Phase**: `CURATED-SA-GEODATA-IMPORT-1B`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/sa-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/sa-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/sa-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/sa-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 5117 |
| Normalized candidates                     | 4512 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **3** |
| **medium_confidence_pending**             | **90** |
| **low_confidence_pending**                | **2546** |
| needs_review                              | 1677 |
| existing (matched, no action)             | 192 |
| rejected (bad data / religious site)      | 4 |
| Alias enrichment opps (in separate report) | 166 |

**Shortlist size (high + medium):** 93

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 4 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 111 |
| ar_name+coords | 35 |
| coords<1km | 22 |
| sourceId | 19 |
| en_name+coords | 5 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| qahbat-al-ithi | القهبه | Qahbat Āl ‘Īthī | منطقة عسير | PPL | 85 | 500 | 14.54 | al-majaridah |
| baqa | بَقعاء | Baq‘ā’ | منطقة حائل | PPL | 80 | 19659 | 69.96 | baqaa |
| turubah | تربة | Turubah | منطقة حائل | PPL | 80 | 28279 | 135.01 | baqaa |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| as-suwadah | السودة | As Suwadah | منطقة مكة المكرمة | PPL | 70 | 19.56 |
| nujayl | نجيل | Nujayl | منطقة المدينة المنورة | PPL | 70 | 55.95 |
| mawarah | ماوراہ | Mawarah | منطقة المدينة المنورة | PPL | 70 | 39.68 |
| al-iriyah | العيرية | Al ‘Īrīyah | منطقة عسير | PPL | 70 | 21.05 |
| al-khatrashiyah | الخترشية | Al Khatrashīyah | المنطقة الشرقية | PPL | 70 | 5.00 |
| huraymila | حريملا | Ḩuraymilā’ | منطقة الرياض | PPL | 70 | 32.67 |
| fayd | الفيضه | Fayd | منطقة مكة المكرمة | PPL | 70 | 27.57 |
| ma-aqla | الشملول | Ma‘aqlā | المنطقة الشرقية | PPL | 70 | 107.38 |
| ash-sharai-al-ulya | الشرائع | Ash Sharā’i‘ al ‘Ulyā | منطقة مكة المكرمة | PPL | 70 | 26.68 |
| al-quraynah | القرينة | Al Quraynah | منطقة الرياض | PPL | 70 | 16.04 |
| al-muwassam | الموسم | Al Muwassam | منطقة جازان | PPL | 70 | 23.84 |
| hadab | المنيظر | Ḩadāb | منطقة عسير | PPL | 70 | 14.62 |
| al-multasa | ال مالتاسا | Al Multasa | منطقة المدينة المنورة | PPL | 70 | 8.99 |
| al-malbanah | ال ملباناه | Al Malbanah | منطقة المدينة المنورة | PPL | 70 | 64.83 |
| al-karbus | الكربوس | Al Karbūş | منطقة جازان | PPL | 70 | 8.89 |
| alhadithahalqadimah | الحديثة | Al Ḩadīthah al Qadīmah | منطقة الجوف | PPL | 70 | 23.62 |
| ad-dilaymiyah | الدليمية | Ad Dilaymīyah | منطقة القصيم | PPL | 70 | 12.37 |
| aba-ad-dud | أبا الدود | Abā ad Dūd | منطقة القصيم | PPL | 70 | 49.19 |
| hafar-al-atk | حفر العتك | Ḩafar al ‘Atk | منطقة الرياض | PPL | 70 | 78.00 |
| tibrak | تبراك | Tibrāk | منطقة الرياض | PPL | 70 | 33.67 |
| hijratalawsat | الأوسط | Hijrat al Awsaţ | منطقة الرياض | PPL | 70 | 21.56 |
| al-furaysh | ال فورایش | Al Furaysh | منطقة المدينة المنورة | PPL | 70 | 37.16 |
| dughaybjah | دجيبجه | Dughaybjah | منطقة مكة المكرمة | PPL | 70 | 16.66 |
| al-jawwah | ال جواه | Al Jawwah | منطقة جازان | PPL | 70 | 8.39 |
| al-mundassah | ال مانداساه | Al Mundassah | منطقة مكة المكرمة | PPL | 70 | 17.05 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **2546**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| al-ulayin | Al ‘Ulayīn | Al ‘Ulayīn | منطقة جازان | PPL | missing_real_ar_name |
| qitabir | Qiţābir | Qiţābir | منطقة جازان | PPL | missing_real_ar_name |
| al-ma-ayin | Al Ma‘āyin | Al Ma‘āyin | منطقة جازان | PPL | missing_real_ar_name |
| umm-an-narb | Umm an Narb | Umm an Narb | منطقة جازان | PPL | missing_real_ar_name |
| rahwan | Rahwān | Rahwān | منطقة جازان | PPL | missing_real_ar_name |
| mahatah | Maḩāţah | Maḩāţah | منطقة جازان | PPL | missing_real_ar_name |
| al-ma-arif | Al Ma‘ārīf | Al Ma‘ārīf | منطقة جازان | PPL | missing_real_ar_name |
| zurayghit | Zurayghiţ | Zurayghiţ |  | PPL | missing_real_ar_name |
| zurayb | Zurayb | Zurayb |  | PPL | missing_real_ar_name |
| zumayqah | Zumayqah | Zumayqah | منطقة الرياض | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| masjid-ibn-rashid | Masjid Ibn Rashīd | Masjid Ibn Rashīd | religious_site_not_city | \bmasjid\b |
| alqiblatyn-alqbltyn | alQiblatyn القبلتين | alQiblatyn القبلتين | religious_site_not_city | القبلتين |
| zaharalmasla | القهبة | Ẓahār al Maşlá | religious_site_not_city | مصلى |
| almujami | المجامع | Al Mujāmi‘ | religious_site_not_city | جامع(?!ة) |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| yanbu | yanbu | slug |
| wadi-ad-dawasir | wadi-ad-dawasir | slug |
| ushayqir | ushaiqir | ar_name+coords (d=2.59km) |
| uqlat-as-suqur | uqlat-as-suqur | slug |
| unaizah | unaizah | slug |
| umluj | umluj | slug |
| turaif | turaif | slug |
| turayf | turaif | coords<1km (d=0.89km) |
| turabah | turabah | slug |
| at-tubi | qatif | coords<1km (d=0.98km) |

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
