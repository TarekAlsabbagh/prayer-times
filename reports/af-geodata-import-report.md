# AF GeoNames Import Report (refined)

**Country**: Afghanistan (أفغانستان)
**Generated**: 2026-05-18T05:22:49.396Z
**Phase**: `CURATED-GEODATA-AF-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/af-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/af-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/af-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/af-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 32573 |
| Normalized candidates                     | 30921 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **36** |
| **medium_confidence_pending**             | **0** |
| **low_confidence_pending**                | **29784** |
| needs_review                              | 1072 |
| existing (matched, no action)             | 0 |
| rejected (bad data / religious site)      | 29 |
| Alias enrichment opps (in separate report) | 0 |

**Shortlist size (high + medium):** 36

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 29 |

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
| tarinkot | tryn kwٹ | Tarinkot | أوروزغان | PPLA | 100 | 10000 | - | - |
| shibirghan | شبرغان | Shibirghān | جوزجان | PPLA | 100 | 55641 | - | - |
| sidqabad | سدق آباد | Sidqābād | كابيسا | PPLA | 100 | 7407 | - | - |
| sar-e-pul | سر پل | Sar-e Pul | سار اي بل | PPLA | 100 | 52121 | - | - |
| aibak | آي بك | Aībak | سمنغان | PPLA | 100 | 47823 | - | - |
| qala-i-naw | qlʿہ naw | Qala i Naw | بادغيس | PPLA | 100 | 9000 | - | - |
| parun | barwں | Pārūn | نورستان | PPLA | 100 | 1000 | - | - |
| nili | نيلي | Nīlī | دايكندي | PPLA | 100 | 30058 | - | - |
| maymana | ضلع میمنہ | Maymana | فارياب | PPLA | 100 | 75900 | - | - |
| mehtar-lam | مختار لام | Mehtar Lām | لغمان | PPLA | 100 | 17345 | - | - |
| mazar-e-sharif | مزار شريف | Mazār-e Sharīf | بلخ | PPLA | 100 | 523300 | - | - |
| lashkar-gah | lshkrgaہ | Lashkar Gāh | هلمند | PPLA | 100 | 43934 | - | - |
| kunduz | قندز | Kunduz | قندوز | PPLA | 100 | 161902 | - | - |
| khost | خوست | Khōst | خوست | PPLA | 100 | 96123 | - | - |
| kandahar | qndہar | Kandahār | قندهار | PPLA | 100 | 523300 | - | - |
| kabul | كابل | Kabul | كابول | PPLC | 100 | 4434550 | - | - |
| jalalabad | جلال آباد | Jalālābād | نانكرهار | PPLA | 100 | 271900 | - | - |
| herat | هراة | Herāt | هرات | PPLA | 100 | 574300 | - | - |
| ghazni | غزنة | Ghazni | غزني | PPLA | 100 | 141000 | - | - |
| gardez | گرديز | Gardez | باكتيا | PPLA | 100 | 103601 | - | - |
| farah | fraہ | Farah | فراه | PPLA | 100 | 43561 | - | - |
| charikar | چاريكار | Charikar | بروان | PPLA | 100 | 53676 | - | - |
| fayroz-koh | fyrwz kwہ | Fayrōz Kōh | غور | PPLA | 100 | 15000 | - | - |
| bamyan | باميان | Bāmyān | باميان | PPLA | 100 | 61863 | - | - |
| baghlan | باغلان | Baghlān | بغلان | PPLA2 | 100 | 108449 | - | - |
| asadabad | اسد آباد | Asadābād | كنر | PPLA | 100 | 48400 | - | - |
| bazarak | بازاراك | Bāzārak | بانشير | PPLA | 100 | 65000 | - | - |
| maydanshakhr | mydan shہr | Maydanshakhr | وردك | PPLA | 100 | 1600 | - | - |
| sharan | شاران | Sharan | باكتيكا | PPLA | 100 | 2200 | - | - |
| zaranj | زرنج | Zaranj | نيمروز | PPLA | 95 | 49851 | - | - |
| taloqan | تالقان | Taloqan | تخار | PPLA | 95 | 64256 | - | - |
| qalat | قلات | Qalāt | زابل | PPLA | 95 | 12191 | - | - |
| pul-e-khumri | پل خمری | Pul-e Khumrī | بغلان | PPLA | 95 | 56369 | - | - |
| pul-e-alam | پل علم | Pul-e ‘Alam | لوكر | PPLA | 95 | 13247 | - | - |
| fayzabad | فیض آباد | Fayzabad | بدخشان | PPLA | 95 | 44421 | - | - |
| balkh | بلخ | Balkh | بلخ | PPLA2 | 95 | 114883 | - | - |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

_(empty)_

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **29784**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| kushk | Kūshk | Kūshk | غور | PPL | missing_real_ar_name |
| khosh-bay | Khōsh Bāy | Khōsh Bāy | فارياب | PPL | missing_real_ar_name |
| band-e-kajaki | Band-e Kajakī | Band-e Kajakī | هلمند | PPL | missing_real_ar_name |
| jang-ali | Jang `Alī | Jang `Alī | غزني | PPL | missing_real_ar_name |
| zurak | Zūrak | Zūrak | هرات | PPL | missing_real_ar_name |
| ziarat-e-amiran-saheb | Zīārat-e Amīrān Şāḩeb | Zīārat-e Amīrān Şāḩeb | نيمروز | PPL | missing_real_ar_name |
| zirtang-e-nowrak | Zīrtang-e Nowrak | Zīrtang-e Nowrak | غور | PPL | missing_real_ar_name |
| zeni | Zeni | Zeni | بروان | PPL | missing_real_ar_name |
| zardnaye | Zaṟḏnaye | Zaṟḏnaye | باميان | PPL | missing_real_ar_name |
| yidikul | Yidīkul | Yidīkul | جوزجان | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| surkay-masjid | سوركی مسجد | Sūrkay Masjid | religious_site_not_city | مسجد |
| spin-masjid | سپين مسجد | Spīn Masjid | religious_site_not_city | مسجد |
| shini-masjid | شنی مسجد | Shīnī Masjid | religious_site_not_city | مسجد |
| sar-e-masjid | Sar-e Masjid | Sar-e Masjid | religious_site_not_city | \bmasjid\b |
| qishlaq-e-masjid | قشلاق مسجد | Qishlāq-e Masjid | religious_site_not_city | مسجد |
| qaryah-ye-shelah-ye-masjid | قریۀ شېله مسجد | Qaryah-ye Shēlah-ye Masjid | religious_site_not_city | مسجد |
| qalah-ye-masjidi | قلعه مسجدی | Qal‘ah-ye Masjidī | religious_site_not_city | مسجد |
| qalah-ye-gul | قلعه گل | Qal‘ah-ye Gul | religious_site_not_city | \bmosque\b |
| molah | موله | Mōlah | religious_site_not_city | \bmasjid\b |
| masjid-nigar | مسجد نگار | Masjid Nigār | religious_site_not_city | مسجد |

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
