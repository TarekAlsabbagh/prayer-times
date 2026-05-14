# KW GeoNames Import Report (refined)

**Country**: Kuwait (الكويت)
**Generated**: 2026-05-14T16:18:38.687Z
**Phase**: `CURATED-GEODATA-KW-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/kw-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/kw-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/kw-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/kw-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 127 |
| Normalized candidates                     | 78 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **10** |
| **medium_confidence_pending**             | **6** |
| **low_confidence_pending**                | **52** |
| needs_review                              | 8 |
| existing (matched, no action)             | 2 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 2 |

**Shortlist size (high + medium):** 16

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 2 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ar-riqqah | الرقة | Ar Riqqah | محافظة الأحمدي | PPL | 85 | 52068 | 21.60 | salmiya |
| al-manqaf | المنقف | Al Manqaf | محافظة الأحمدي | PPL | 85 | 39025 | 27.51 | salmiya |
| al-mahbulah | المهبولة | Al Mahbūlah | محافظة الأحمدي | PPL | 85 | 18178 | 22.12 | salmiya |
| al-funaytis | الفنيطيس | Al Funayţīs | محافظة مبارك الكبير | PPL | 85 | 1878 | 12.86 | salmiya |
| al-fahahil | الفحاحيل | Al Faḩāḩīl | محافظة الأحمدي | PPL | 85 | 68290 | 28.97 | salmiya |
| al-fintas | الفنطاس | Al Finţās | محافظة الأحمدي | PPL | 85 | 23071 | 18.80 | salmiya |
| janub-as-surrah | جَنُوب اَلسُّرَّة | Janūb as Surrah | محافظة الفروانية | PPL | 80 | 18496 | 8.58 | hawalli |
| az-zawr | اَلزَّوْر | Az Zawr | محافظة العاصمة | PPL | 80 | 5750 | 21.68 | salmiya |
| al-wafrah | اَلْوَفْرَة | Al Wafrah | محافظة الأحمدي | PPL | 80 | 10017 | 77.69 | hawalli |
| sabah-as-salim | صَبَاح اَلسَّالِم | Şabāḩ as Sālim | محافظة مبارك الكبير | PPL | 80 | 139163 | 8.83 | hawalli |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| shumaymah | شميمة | Shumaymah | محافظة الجهراء | PPL | 70 | 31.56 |
| as-sabahiyah | الصباحية | Aş Şabāḩīyah | محافظة الأحمدي | PPL | 70 | 26.13 |
| al-hujayjah | الحجيجة | Al Ḩujayjah | محافظة الجهراء | PPL | 70 | 34.39 |
| abu-hulayfah | أَبُو حُلَيْفَة | Abū Ḩulayfah | محافظة الأحمدي | PPL | 70 | 23.45 |
| al-arfajiyah | العرفجية | Al ‘Arfajīyah | محافظة الجهراء | PPL | 70 | 37.84 |
| al-ulaymiyah | العليميه | Al ‘Ulaymīyah | محافظة الجهراء | PPL | 70 | 37.15 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **52**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| al-qusur | Al Quşūr | Al Quşūr | محافظة مبارك الكبير | PPL | missing_real_ar_name |
| al-qurayn | Al Qurayn | Al Qurayn | محافظة مبارك الكبير | PPL | missing_real_ar_name |
| al-adan | Al ‘Adan | Al ‘Adan | محافظة مبارك الكبير | PPL | missing_real_ar_name |
| jaber-al-ali | Jaber Al Ali | Jaber Al Ali | محافظة الأحمدي | PPLL | missing_real_ar_name |
| mazari-al-abdali | مزارع العبدلي | Mazāri‘ al ‘Abdalī | محافظة الجهراء | PPL | non_place_keyword (kw: مزارع) |
| al-masayel | Al-Masayel | Al-Masayel | محافظة مبارك الكبير | PPL | missing_real_ar_name |
| abu-fatira | Abu Fatira | Abu Fatira | محافظة مبارك الكبير | PPL | missing_real_ar_name |
| abu-al-hasaniya | Abu Al Hasaniya | Abu Al Hasaniya | محافظة مبارك الكبير | PPL | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| hawalli | hawalli | slug |
| kuwait-city | kuwait-city | slug |

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
