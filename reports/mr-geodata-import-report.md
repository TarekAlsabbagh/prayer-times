# MR GeoNames Import Report (refined)

**Country**: Mauritania (موريتانيا)
**Generated**: 2026-05-15T07:35:51.344Z
**Phase**: `CURATED-GEODATA-MR-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/mr-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/mr-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/mr-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/mr-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 7653 |
| Normalized candidates                     | 7635 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **9** |
| **medium_confidence_pending**             | **1** |
| **low_confidence_pending**                | **710** |
| needs_review                              | 6910 |
| existing (matched, no action)             | 5 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 5 |

**Shortlist size (high + medium):** 10

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 4 |
| coords<1km | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ndiago | انجاكو | Ndiago | ولاية الترارزة | PPL | 85 | 8440 | 219.89 | nouakchott |
| chinguetti | شنقيط | Chingueṭṭi | ولاية أدرار | PPL | 85 | 4711 | 71.91 | atar |
| bogue | بوغي | Bogué | ولاية لبراكنة | PPL | 85 | 20291 | 243.98 | nouakchott |
| woumpou | ومبو | Woumpou | ولاية كيدي ماغا | PPL | 80 | 3746 | 475.09 | nouakchott |
| tembedgha | تمبدغة | Tembedgha | ولاية الحوض الشرقي | PPL | 80 | 17465 | 700.46 | atar |
| ganki-un | ﯖانكي 1 | Ganki Un | ولاية كوركول | PPL | 80 | 11250 | 355.15 | nouakchott |
| lexeibaun | لكصيبه 1 | Lexeiba Un | ولاية كوركول | PPL | 80 | 11417 | 363.10 | nouakchott |
| djiguenni | جكني | Djiguenni | ولاية الحوض الشرقي | PPL | 80 | 8293 | 705.38 | atar |
| diaguily | ادياكيلي | Diaguily | ولاية كيدي ماغا | PPL | 80 | 6278 | 522.64 | nouakchott |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| tanit | تانيت | Tânît | ولاية الترارزة | PPL | 70 | 60.43 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **710**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| hassi-guendres | Hassi Guendres | Hassi Guendres |  | PPL | missing_real_ar_name |
| zreig | Zreïg | Zreïg | ولاية كوركول | PPL | missing_real_ar_name |
| zreif-el-azra | Zreïf el Azra | Zreïf el Azra | ولاية الحوض الغربي | PPL | missing_real_ar_name |
| jraif | Jraif | Jraif | ولاية الحوض الغربي | PPL | missing_real_ar_name |
| zmeyte | Zmèyté | Zmèyté | ولاية الحوض الشرقي | PPL | missing_real_ar_name |
| ghligehelboya | Ghlig Ehel Boya | Ghlig Ehel Boya | ولاية الحوض الشرقي | PPL | missing_real_ar_name |
| zenegue-bou | Zénégué-Bou | Zénégué-Bou | ولاية كيدي ماغا | PPL | missing_real_ar_name |
| zegha | Zegha | Zegha | ولاية لعصابة | PPL | missing_real_ar_name |
| zainat | Zainat | Zainat | ولاية الحوض الشرقي | PPL | missing_real_ar_name |
| youmane-yire | Youmane Yiré | Youmane Yiré |  | PPL | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| nouakchott | nouakchott | slug |
| nouadhibou | nouadhibou | slug |
| atar | atar | slug |
| mnacir | atar | coords<1km (d=0.99km) |
| nouakchott | nouakchott | slug |

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
