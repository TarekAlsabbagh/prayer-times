# BD GeoNames Import Report (refined)

**Country**: Bangladesh (بنغلاديش)
**Generated**: 2026-05-19T20:16:46.500Z
**Phase**: `CURATED-GEODATA-BD-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/bd-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/bd-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/bd-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/bd-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 49052 |
| Normalized candidates                     | 48853 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **10** |
| **medium_confidence_pending**             | **0** |
| **low_confidence_pending**                | **62** |
| needs_review                              | 48761 |
| existing (matched, no action)             | 19 |
| rejected (bad data / religious site)      | 1 |
| Alias enrichment opps (in separate report) | 17 |

**Shortlist size (high + medium):** 10

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 1 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| coords<1km | 12 |
| slug | 6 |
| en_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| jamalpur | جمالبور | Jamālpur | ميمنسينغ | PPLA2 | 100 | 167900 | 132.02 | dhaka |
| netrakona | نترکونا | Netrakona | ميمنسينغ | PPLA2 | 100 | 79016 | 114.97 | sylhet |
| mymensingh | mymn sngھ | Mymensingh | ميمنسينغ | PPLA | 100 | 225126 | 105.20 | dhaka |
| lalmonirhat | lal mnyr ہaٹ | Lalmonirhat | رانغبور | PPLA2 | 100 | 65127 | 191.54 | rajshahi |
| bagerhat | baghr ہaٹ | Bagerhat | خولنا | PPLA2 | 100 | 266388 | 33.23 | khulna |
| gazipur | غازي پور | Gazipur | دكا | PPLA2 | 100 | 2674697 | 20.94 | dhaka |
| habiganj | حبيجنج | Habiganj | سيلهت | PPL | 85 | 88760 | 73.44 | sylhet |
| feni | فئنی | Feni | شيتاغونغ | PPL | 85 | 84028 | 83.18 | chittagong |
| comilla | کومیلا | Comilla | شيتاغونغ | PPL | 80 | 1030000 | 87.72 | dhaka |
| bogra | بوگرا | Bogra | راجشاهي | PPL | 80 | 210000 | 92.95 | rajshahi |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

_(empty)_

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **62**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| ullapara |  | Ullāpāra | راجشاهي | PPL | missing_real_ar_name |
| tangibari |  | Tangibāri | دكا | PPL | missing_real_ar_name |
| titalya |  | Titalya | رانغبور | PPL | missing_real_ar_name |
| thakurgaon |  | Thākurgaon | رانغبور | PPL | missing_real_ar_name |
| tejgaon |  | Tejgaon | دكا | PPL | missing_real_ar_name |
| terakhada |  | Terakhāda | خولنا | PPL | missing_real_ar_name |
| teknaf |  | Teknāf | شيتاغونغ | PPL | missing_real_ar_name |
| taras |  | Tārās | راجشاهي | PPL | missing_real_ar_name |
| sikandarnagar |  | Sikandarnagar | دكا | PPL | missing_real_ar_name |
| tungi |  | Tungi | دكا | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| rangpur | rnګpwr | Rangpur | religious_site_not_city | \bmosque\b |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| sylhet | sylhet | slug |
| rajshahi | rajshahi | slug |
| dhaka | dhaka | slug |
| tantipara | rajshahi | coords<1km (d=0.83km) |
| sirail | rajshahi | coords<1km (d=0.83km) |
| ramchandrapur | rajshahi | coords<1km (d=0.83km) |
| matihar | rajshahi | coords<1km (d=1.00km) |
| khulna | khulna | slug |
| khulna | khulna | slug |
| kagla | rajshahi | coords<1km (d=0.76km) |

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
