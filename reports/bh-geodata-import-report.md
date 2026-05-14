# BH GeoNames Import Report (refined)

**Country**: Bahrain (البحرين)
**Generated**: 2026-05-14T16:18:38.764Z
**Phase**: `CURATED-GEODATA-BH-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/bh-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/bh-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/bh-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/bh-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 124 |
| Normalized candidates                     | 97 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **8** |
| **medium_confidence_pending**             | **9** |
| **low_confidence_pending**                | **75** |
| needs_review                              | 3 |
| existing (matched, no action)             | 2 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 2 |

**Shortlist size (high + medium):** 17

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| ar_name+coords | 1 |
| slug | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| sitrah | سترة | Sitrah | محافظة العاصمة | PPL | 85 | 72601 | 8.90 | manama |
| madinat-isa | شهرک عیسی | Madīnat ‘Īsá | المحافظة الشمالية | PPL | 85 | 38090 | 7.20 | manama |
| madinat-hamad | مدينة حمد | Madīnat Ḩamad | المحافظة الوسطى | PPL | 85 | 133550 | 14.86 | manama |
| ar-rifa | الرفاع | Ar Rifā‘ | المحافظة الشمالية | PPL | 85 | 115495 | 11.38 | manama |
| sanabis | سَنَابِس | Sanābis | محافظة العاصمة | PPL | 80 | 6564 | 3.51 | manama |
| jidd-hafs | جِدّ حَفْص | Jidd Ḩafş | محافظة العاصمة | PPL | 80 | 66588 | 3.97 | manama |
| dar-kulayb | دَار كُلَيْب | Dār Kulayb | المحافظة الشمالية | PPL | 80 | 65466 | 19.58 | manama |
| al-hadd | اَلْحَدّ | Al Ḩadd | محافظة المحرق | PPL | 80 | 12797 | 4.49 | muharraq |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| sanad | سند | Sanad | محافظة العاصمة | PPL | 70 | 8.71 |
| jaww | جو | Jaww | المحافظة الشمالية | PPL | 70 | 25.75 |
| az-zallaq | الزلاق | Az Zallāq | المحافظة الشمالية | PPL | 70 | 22.45 |
| ash-shakhurah | الشاخوره | Ash Shākhūrah | المحافظة الوسطى | PPL | 70 | 8.03 |
| ar-rumaythah | الرميثا | Ar Rumaythah | المحافظة الشمالية | PPL | 70 | 34.39 |
| al-jasrah | الجسره | Al Jasrah | المحافظة الوسطى | PPL | 70 | 15.51 |
| al-budayyi | البديع | Al Budayyi‘ | المحافظة الوسطى | PPL | 70 | 13.68 |
| ad-diraz | الدراز | Ad Dirāz | المحافظة الوسطى | PPL | 70 | 11.57 |
| seef | السیف | Seef | محافظة العاصمة | PPL | 70 | 5.06 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **75**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| wadiyan | وَادِيَان | Wādiyān | محافظة العاصمة | PPL | non_place_keyword (kw: وادي) |
| jabalat-habashi | جَبَلَة حَبَشِي | Jabalat Ḩabashī | المحافظة الوسطى | PPL | non_place_keyword (kw: جبل) |
| ayn-ad-dar | عَيْن اَلدَّار | ‘Ayn ad Dār | محافظة (قديمة) | PPL | non_place_keyword (kw: عين) |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| al-muharraq | muharraq | ar_name+coords (d=0.08km) |
| manama | manama | slug |

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
