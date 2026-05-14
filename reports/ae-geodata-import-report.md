# AE GeoNames Import Report (refined)

**Country**: United Arab Emirates (الإمارات العربية المتحدة)
**Generated**: 2026-05-14T16:18:38.605Z
**Phase**: `CURATED-GEODATA-AE-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/ae-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/ae-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/ae-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/ae-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 2406 |
| Normalized candidates                     | 403 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **19** |
| **medium_confidence_pending**             | **10** |
| **low_confidence_pending**                | **55** |
| needs_review                              | 311 |
| existing (matched, no action)             | 8 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 8 |

**Shortlist size (high + medium):** 29

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 6 |
| ar_name+coords | 1 |
| coords<1km | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ar-ruways | الرويس | Ar Ruways | إمارة أبوظبي | PPL | 85 | 25000 | 171.23 | abu-dhabi |
| adh-dhayd | الذيد | Adh Dhayd | إمارة الشارقة | PPL | 85 | 20165 | 46.75 | sharjah |
| warisan | ورسان | Warīsān | إمارة دبي | PPL | 80 | 108759 | 14.33 | dubai |
| zayed-city | مدينة زايد | Zayed City | إمارة أبوظبي | PPL | 80 | 63482 | 112.09 | abu-dhabi |
| khawr-fakkan | مدينة خور فكان | Khawr Fakkān | إمارة الشارقة | PPL | 80 | 40677 | 22.57 | fujairah |
| dibba-al-fujairah | دبا الفجيرة | Dibba Al-Fujairah | إمارة الفجيرة | PPL | 80 | 30000 | 36.03 | ras-al-khaimah |
| al-hamriyah | الحمرية | Al Ḩamrīyah | إمارة الشارقة | PPL | 80 | 3297 | 12.41 | ajman |
| hatta | حتا | Ḩattā | إمارة دبي | PPL | 80 | 15324 | 41.64 | fujairah |
| suwayhan | سُوَيْحَان | Suwayḩān | إمارة أبوظبي | PPL | 80 | 5403 | 50.08 | al-ain |
| the-palm-jumeirah | نخلة الجميرة | The Palm Jumeirah | إمارة دبي | PPL | 80 | 25500 | 16.85 | dubai |
| bur-dubai | بر دبي | Bur Dubai | إمارة دبي | PPL | 80 | 18698 | 6.80 | dubai |
| bani-yas-city | مدينة بني ياس | Bani Yas City | إمارة أبوظبي | PPL | 80 | 80498 | 30.15 | abu-dhabi |
| musaffah | مصفح | Musaffah | إمارة أبوظبي | PPL | 80 | 243341 | 15.01 | abu-dhabi |
| al-shamkhah-city | مدينة الشامخة | Al Shamkhah City | إمارة أبوظبي | PPL | 80 | 61710 | 34.15 | abu-dhabi |
| reef-al-fujairah-city | ريف الفجيرة | Reef Al Fujairah City | إمارة الفجيرة | PPL | 80 | 82310 | 8.13 | fujairah |
| alarad | العراد | Al'Arad | إمارة أبوظبي | PPL | 80 | 1000 | 45.75 | al-ain |
| al-araad | العراد | Al Araad | إمارة أبوظبي | PPL | 80 | 1000 | 44.25 | al-ain |
| lahbab | لهباب | Lahbab | إمارة دبي | PPL | 80 | 53079 | 37.24 | dubai |
| al-madam | ٱlmadam | Al Madam | إمارة الشارقة | PPL | 80 | 8652 | 54.85 | sharjah |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| danhah | ضنحه | Danhah | إمارة الفجيرة | PPL | 70 | 31.36 |
| shawkah | شوكه | Shawkah | إمارة رأس الخيمة | PPL | 70 | 29.69 |
| sakamkam | سكمكم | Sakamkam | إمارة الفجيرة | PPL | 70 | 5.12 |
| al-muhtarqah | المحترقة | Al Muhtarqah | إمارة الفجيرة | PPL | 70 | 31.64 |
| nedaifi | المديفى | Nedaifi | إمارة الشارقة | PPL | 70 | 25.96 |
| khawr-khuwayr | خور خوير | Khawr Khuwayr | إمارة رأس الخيمة | PPL | 70 | 21.19 |
| khatt | خات | Khatt | إمارة رأس الخيمة | PPL | 70 | 19.41 |
| ghayl | الغيل | Ghayl | إمارة رأس الخيمة | PPL | 70 | 39.96 |
| fashrah | الفشغا | Fashrah | إمارة رأس الخيمة | PPL | 70 | 29.83 |
| daftah | دفتا | Daftah | إمارة رأس الخيمة | PPL | 70 | 21.48 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **55**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| suhaylah | Suhaylah | Suhaylah | إمارة دبي | PPL | missing_real_ar_name |
| zuwayhir | Z̧uwayhir | Z̧uwayhir | إمارة أبوظبي | PPL | missing_real_ar_name |
| zuwayhir | Z̧uwayhir | Z̧uwayhir | إمارة أبوظبي | PPL | missing_real_ar_name |
| zubarah | Zubārah | Zubārah | إمارة الفجيرة | PPL | missing_real_ar_name |
| zikt | Zikt | Zikt | إمارة الفجيرة | PPL | missing_real_ar_name |
| zafir | Z̧afīr | Z̧afīr | إمارة أبوظبي | PPL | missing_real_ar_name |
| wamm | Wamm | Wamm | إمارة الفجيرة | PPL | missing_real_ar_name |
| wahala | Wahala | Wahala | إمارة رأس الخيمة | PPL | missing_real_ar_name |
| wafd | Wafd | Wafd | إمارة أبوظبي | PPL | missing_real_ar_name |
| wad-wid | Wad Wid | Wad Wid | إمارة رأس الخيمة | PPL | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| ras-al-khaimah | ras-al-khaimah | slug |
| dubai | dubai | slug |
| sharjah | sharjah | slug |
| fujairah | fujairah | slug |
| al-ain-city | al-ain | ar_name+coords (d=2.38km) |
| ajman | ajman | slug |
| abu-dhabi | abu-dhabi | slug |
| halwan | sharjah | coords<1km (d=0.09km) |

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
