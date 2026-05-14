# QA GeoNames Import Report (refined)

**Country**: Qatar (قطر)
**Generated**: 2026-05-14T16:18:38.492Z
**Phase**: `CURATED-GEODATA-QA-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/qa-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/qa-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/qa-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/qa-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 275 |
| Normalized candidates                     | 179 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **15** |
| **medium_confidence_pending**             | **64** |
| **low_confidence_pending**                | **86** |
| needs_review                              | 12 |
| existing (matched, no action)             | 2 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 2 |

**Shortlist size (high + medium):** 79

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| coords<1km | 1 |
| slug | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| umm-salal-muhammad | أم صلال محمد | Umm Şalāl Muḩammad | بلدية أم صلال | PPL | 85 | 29391 | 13.91 | al-rayyan |
| musay-id | أم سعيد | Musay‘īd | بلدية الوكرة | PPL | 85 | 5769 | 32.66 | doha |
| muaydhir-rawdat-rashid | معيذر روضة راشد | Mu‘aydhir Rawḑat Rāshid | بلدية الريان | PPL | 85 | 27569 | 4.22 | al-rayyan |
| ar-ruways | الرويس | Ar Ruways | بلدية الشمال | PPL | 85 | 3334 | 96.65 | al-rayyan |
| al-wukayr | الوكير | Al Wukayr | بلدية الوكرة | PPL | 85 | 5146 | 14.95 | doha |
| al-kharrarah | الخرارة | Al Kharrārah | بلدية الوكرة | PPL | 85 | 179 | 49.81 | al-rayyan |
| al-jumayliyah | الجميلية | Al Jumaylīyah | بلدية الشيحانية | PPL | 85 | 1788 | 48.74 | al-rayyan |
| al-ghuwayriyah | الغويرية | Al Ghuwayrīyah | بلدية الخور والذخيرة | PPL | 85 | 2332 | 62.39 | al-rayyan |
| fuwayrit | فويرط | Fuwayriţ | بلدية الشمال | PPL | 85 | 1333 | 81.86 | al-rayyan |
| umm-ghuwaylinah | أُمّ غُوَيْلِينَة | Umm Ghuwaylīnah | بلدية الشيحانية | PPL | 80 | 39457 | 42.87 | al-rayyan |
| umm-bab | أُمّ بَاب | Umm Bāb | بلدية الريان | PPL | 80 | 2500 | 62.56 | al-rayyan |
| nuayjah | نُعَيْجَة | Nu‘ayjah | بلدية الدوحة | PPL | 80 | 19975 | 4.36 | doha |
| dukhan | دُخَان | Dukhān | بلدية الشيحانية | PPL | 80 | 7250 | 66.12 | al-rayyan |
| ash-shaqra | اَلشَّقْرَاء | Ash Shaqrā’ | بلدية الوكرة | PPL | 80 | 43 | 51.73 | al-rayyan |
| abu-samrah | أبو سمرة | Abū Samrah | بلدية الريان | PPL | 80 | 938 | 85.20 | al-rayyan |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| umm-ubayriyah | أم عبيرية | Umm ‘Ubayrīyah | بلدية أم صلال | PPL | 70 | 23.03 |
| rawdat-shamim | أُمّ شَمِيم | Rawḑat Shamīm | بلدية الشيحانية | PPL | 70 | 25.88 |
| umm-qarn | أم قرن | Umm Qarn | بلدية الضعاين | PPL | 70 | 29.09 |
| umm-juway-id | أم جويعد | Umm Juway‘id | بلدية الخور والذخيرة | PPL | 70 | 69.94 |
| umm-az-zubar-ash-sharqiyah | أم الزبار الشرقية | Umm az Zubār ash Sharqīyah | بلدية الشيحانية | PPL | 70 | 19.50 |
| umm-suwayyah | أم سوية | Umm Suwayyah | بلدية الضعاين | PPL | 70 | 39.77 |
| umm-al-quhab | أم القهاب | Umm al Quhāb | بلدية الخور والذخيرة | PPL | 70 | 53.13 |
| as-sunay | أُمّ القُهَاب عَبْد اللَّٰه بِن نَاصِر | Aş Şunay‘ | بلدية الشيحانية | PPL | 70 | 51.23 |
| umm-al-quhab | أم القهاب | Umm al Quhāb | بلدية الشيحانية | PPL | 70 | 16.00 |
| umm-al-amad | أم العمد | Umm al ‘Amad | بلدية أم صلال | PPL | 70 | 22.34 |
| umm-al-afa-i | أم الأفاعي | Umm al Afā‘ī | بلدية الريان | PPL | 70 | 11.76 |
| sumaysimah | سميسمة | Sumaysimah | بلدية الضعاين | PPL | 70 | 32.49 |
| musaykah | مسيكة | Musaykah | بلدية الشمال | PPL | 70 | 81.15 |
| madinat-al-ka-ban | اَلْكَعْبَان | Madīnat al Ka‘bān | بلدية الخور والذخيرة | PPL | 70 | 65.14 |
| lisha | لشا | Lishā | بلدية الشمال | PPL | 70 | 82.10 |
| al-kharsa-ah | الخرسعة | Al Kharsa‘ah | بلدية الشيحانية | PPL | 70 | 45.87 |
| ath-thaqab | الثغب | Ath Thaqab | بلدية الشمال | PPL | 70 | 87.94 |
| as-suwayhiliyah | السويحلية | As Suwayḩilīyah | بلدية الشيحانية | PPL | 70 | 66.70 |
| as-sulaymi-al-gharbi | السليمي الغربي | As Sulaymī al Gharbī | بلدية الخور والذخيرة | PPL | 70 | 67.86 |
| al-jatlawiyah | الجتلاوية | Al Jatlāwīyah | بلدية الخور والذخيرة | PPL | 70 | 71.84 |
| makin-al-fatiyah | اَلسِّدْرِيَّة | Makīn al Fatīyah | بلدية الشمال | PPL | 70 | 86.47 |
| as-samriyah | السمرية | As Samrīyah | بلدية الشيحانية | PPL | 70 | 16.51 |
| qaryat-ar-rufayq | الرَّفِيج | Qaryat ar Rufayq | بلدية الشيحانية | PPL | 70 | 52.34 |
| al-wabrah | الوبرة | Al Wabrah | بلدية الشيحانية | PPL | 70 | 25.70 |
| al-wa-b | الوعب | Al Wa‘b | بلدية الخور والذخيرة | PPL | 70 | 61.26 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **86**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| ayn-az-zughayn | زُغَيْن اَلْبَحْث | ‘Ayn az Zughayn | بلدية الشيحانية | PPL | non_place_keyword (kw: عين) |
| bir-zikrit | بِئْر زِكْرِيت | Bi’r Zikrīt | بلدية الشيحانية | PPL | non_place_keyword (kw: بئر) |
| turaynah | ترينة | Turaynah | بلدية الوكرة | PPL | non_place_keyword (kw: مزرعة) |
| bir-al-husayn | بِئْر الحُسَيْن | Bi’r al Ḩusayn | بلدية الشيحانية | PPL | non_place_keyword (kw: بئر) |
| ayn-sinan | عين سنان | ‘Ayn Sinān | بلدية الشمال | PPL | non_place_keyword (kw: عين) |
| mazra-at-as-sin | الصُّنْع | Mazra‘at aş Şin‘ | بلدية الشيحانية | PPL | non_place_keyword (kw: مزرعة) |
| ayn-an-nu-man | عين النعمان | ‘Ayn an Nu‘mān | بلدية الشمال | PPL | non_place_keyword (kw: عين) |
| wadi-jallal | وَادِي جَلاَّل | Wādī Jallāl | بلدية الوكرة | PPL | non_place_keyword (kw: وادي) |
| mazra-at-al-majidah | اَلْمَاجِدَة | Mazra‘at al Mājidah | بلدية الخور والذخيرة | PPL | non_place_keyword (kw: مزرعة) |
| wadi-al-jamal-ash-shamali | وادي الجمال الشمالي | Wādī al Jamāl ash Shamālī | بلدية الشيحانية | PPL | non_place_keyword (kw: وادي) |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| ar-rayyan | al-rayyan | coords<1km (d=0.14km) |
| doha | doha | slug |

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
