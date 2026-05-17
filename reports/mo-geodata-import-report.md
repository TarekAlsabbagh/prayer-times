# MO GeoNames Import Report (refined)

**Country**: Macao (ماكاو)
**Generated**: 2026-05-17T07:53:16.939Z
**Phase**: `CURATED-GEODATA-MO-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/mo-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/mo-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/mo-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/mo-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 9 |
| Normalized candidates                     | 9 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **1** |
| **medium_confidence_pending**             | **0** |
| **low_confidence_pending**                | **0** |
| needs_review                              | 8 |
| existing (matched, no action)             | 0 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 0 |

**Shortlist size (high + medium):** 1

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| macau | ئاۋمېن | Macau | ماكاو | PPLC | 100 | 649335 | - | - |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

_(empty)_

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **0**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| taipa | Taipa | Taipa |  | PPL | missing_real_ar_name |
| lai-chi-van | Lai Chi Van | Lai Chi Van |  | PPL | missing_real_ar_name |
| heisha | Heisha | Heisha |  | PPL | missing_real_ar_name |
| luhuan | Luhuan | Luhuan |  | PPL | missing_real_ar_name |
| zhuojiacun | Zhuojiacun | Zhuojiacun |  | PPL | missing_real_ar_name |
| jiuao | Jiu’ao | Jiu’ao |  | PPL | missing_real_ar_name |
| cotai | Cotai | Cotai | ماكاو | PPLA2 | missing_real_ar_name |
| se | Sé | Sé | ماكاو | PPLA2 | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

_(none)_

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
