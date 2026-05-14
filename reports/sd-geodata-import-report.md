# SD GeoNames Import Report (refined)

**Country**: Sudan (السودان)
**Generated**: 2026-05-14T21:14:40.577Z
**Phase**: `CURATED-GEODATA-SD-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/sd-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/sd-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/sd-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/sd-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 8134 |
| Normalized candidates                     | 7792 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **30** |
| **medium_confidence_pending**             | **6** |
| **low_confidence_pending**                | **64** |
| needs_review                              | 7684 |
| existing (matched, no action)             | 7 |
| rejected (bad data / religious site)      | 1 |
| Alias enrichment opps (in separate report) | 7 |

**Shortlist size (high + medium):** 36

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 1 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 6 |
| coords<1km | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| umm-ruwaba | أم روابة | Umm Ruwaba | ولاية شمال كردفان | PPL | 85 | 56833 | 112.42 | el-obeid |
| talodi | تالودی | Talodi | ولاية جنوب كردفان | PPL | 85 | 13188 | 284.13 | el-obeid |
| shendi | شندى | Shendi | ولاية نهر النيل | PPL | 85 | 63746 | 154.90 | omdurman |
| suakin | سواكن | Suakin | ولاية البحر الأحمر | PPL | 85 | 42456 | 57.98 | port-sudan |
| khashm-al-qirbah | خشم القربة | Khashm al Qirbah | ولاية القضارف | PPL | 85 | 42900 | 74.71 | kassala |
| jubayt | جبيت | Jubayt | ولاية البحر الأحمر | PPL | 85 | 30856 | 83.91 | port-sudan |
| new-halfa | حلفا الجديدة | New Halfa | ولاية كسلا | PPL | 85 | 63589 | 86.95 | kassala |
| atbara | عطبرة | Atbara | ولاية نهر النيل | PPL | 85 | 112021 | 279.63 | omdurman |
| er-roseires | الروصيرص | Er Roseires | ولاية النيل الأزرق | PPL | 85 | 58712 | 297.16 | wad-madani |
| ar-rahad | الرهد | Ar Rahad | ولاية شمال كردفان | PPL | 85 | 36518 | 69.87 | el-obeid |
| an-nuhud | النهود | An Nuhūd | ولاية غرب كردفان | PPL | 85 | 108008 | 200.68 | el-obeid |
| khartoum-north | الخرطوم بحري | Khartoum North | ولاية الخرطوم | PPL | 85 | 1012211 | 6.10 | omdurman |
| ad-douiem | الدويم (مدينة) | Ad Douiem | ولاية النيل الأبيض | PPL | 85 | 87068 | 137.65 | wad-madani |
| ad-dabbah | ال دابباح | Ad Dabbah | الولاية الشمالية | PPL | 85 | 11626 | 313.06 | omdurman |
| abyei | أبيي | Abyei | ولاية غرب كردفان | PPL | 85 | 20000 | 443.71 | el-obeid |
| nasir-extension | امتداد ناصر | Nasir Extension | ولاية الخرطوم | PPLA3 | 85 | - | 10.38 | khartoum |
| gereida | قريضة | Gereida | ولاية جنوب دارفور | PPL | 85 | 120000 | 90.56 | nyala |
| al-taif | الطائف | ِAl Taif | ولاية الخرطوم | PPLA3 | 85 | - | 7.38 | khartoum |
| garden-city | جاردن سيتي | Garden City | ولاية الخرطوم | PPLA3 | 85 | - | 10.06 | omdurman |
| umm-kaddadah | ام کداده | Umm Kaddadah | ولاية شمال دارفور | PPL | 80 | 10979 | 260.84 | nyala |
| tokar | طوكر | Tokār | ولاية البحر الأحمر | PPL | 80 | 37051 | 142.91 | port-sudan |
| sennar | سنار | Sennar | ولاية سنار | PPL | 80 | 130122 | 92.70 | wad-madani |
| kosti | ربك | Kosti | ولاية النيل الأبيض | PPL | 80 | 345068 | 165.90 | wad-madani |
| burri-al-drayssah | بري الدرايسة | Burri Al Drayssah | ولاية الخرطوم | PPLA3 | 80 | - | 10.52 | omdurman |
| burri-al-shreef | بري الشريف | Burri Al Shreef | ولاية الخرطوم | PPLA3 | 80 | - | 11.72 | khartoum |
| al-manshiya | المنشية | Al Manshiya | ولاية الخرطوم | PPLA3 | 80 | - | 10.61 | khartoum |
| najaru-qryt-njrw | Najaru قرية نجرو | Najaru | ولاية الجزيرة | PPL | 80 | 1153 | 30.32 | wad-madani |
| burri-al-lamab | بري اللاماب | Burri Al Lamab | ولاية الخرطوم | PPLA3 | 80 | - | 11.29 | khartoum |
| burri-al-mahas | بري المحس | Burri Al Mahas | ولاية الخرطوم | PPLA3 | 80 | - | 9.72 | omdurman |
| riyadh | الرياض | Riyadh | ولاية الخرطوم | PPLA3 | 80 | - | 9.23 | khartoum |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| umm-dam | أم دم | Umm Dam | ولاية شمال كردفان | PPL | 70 | 104.09 |
| ambro | ام برو | Ambro | ولاية شمال دارفور | PPL | 70 | 353.96 |
| kurti | كورتى | Kūrtī | الولاية الشمالية | PPL | 70 | 292.13 |
| karkoj | كركوج | Karkoj | ولاية سنار | PPL | 70 | 171.63 |
| forbranga | فور برنج | Forbranga | ولاية غرب دارفور | PPL | 70 | 248.03 |
| arwala | أروالا | Arwala | ولاية وسط دارفور | PPL | 70 | 177.79 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **64**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| koulbous | Koulbous | Koulbous | ولاية غرب دارفور | PPL | missing_real_ar_name |
| zurzur | Zurzūr | Zurzūr | ولاية النيل الأبيض | PPL | missing_real_ar_name |
| zurq | Zurq | Zurq | ولاية جنوب دارفور | PPL | missing_real_ar_name |
| zurq | Zurq | Zurq | ولاية غرب كردفان | PPL | missing_real_ar_name |
| zurga | Zurga | Zurga | ولاية الجزيرة | PPL | missing_real_ar_name |
| zurga | Zurga | Zurga | ولاية الجزيرة | PPL | missing_real_ar_name |
| zurayqa | Zurayqā’ | Zurayqā’ | ولاية شمال كردفان | PPL | missing_real_ar_name |
| zireqa | Zireqa | Zireqa | ولاية النيل الأبيض | PPL | missing_real_ar_name |
| zurayqa | Zurayqā’ | Zurayqā’ | ولاية شمال كردفان | PPL | missing_real_ar_name |
| zurayqa | Zurayqā’ | Zurayqā’ | ولاية شمال كردفان | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| masajid-wad-hashi | Masājid Wad Hashi | Masājid Wad Hashi | religious_site_not_city | \bmasjid\b |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| wad-medani | wad-madani | coords<1km (d=0.04km) |
| omdurman | omdurman | slug |
| nyala | nyala | slug |
| kassala | kassala | slug |
| port-sudan | port-sudan | slug |
| el-obeid | el-obeid | slug |
| khartoum | khartoum | slug |

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
