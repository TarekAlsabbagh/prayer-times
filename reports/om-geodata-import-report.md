# OM GeoNames Import Report (refined)

**Country**: Oman (سلطنة عمان)
**Generated**: 2026-05-14T16:18:38.924Z
**Phase**: `CURATED-GEODATA-OM-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/om-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/om-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/om-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/om-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 5997 |
| Normalized candidates                     | 5423 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **18** |
| **medium_confidence_pending**             | **51** |
| **low_confidence_pending**                | **4624** |
| needs_review                              | 718 |
| existing (matched, no action)             | 5 |
| rejected (bad data / religious site)      | 7 |
| Alias enrichment opps (in separate report) | 5 |

**Shortlist size (high + medium):** 69

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 7 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 4 |
| ar_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| seeb | السيب | Seeb | محافظة مسقط | PPL | 85 | 470878 | 24.00 | muscat |
| shinas | شناص | Shināş | محافظة شمال الباطنة | PPL | 80 | 48009 | 51.31 | sohar |
| samail | سمائل | Samā’il | محافظة الداخلية | PPL | 80 | 80538 | 56.18 | muscat |
| qurayyat | قريات | Qurayyāt | محافظة مسقط | PPL | 80 | 63133 | 63.58 | muscat |
| izki | إزكي | Izkī | محافظة الداخلية | PPL | 80 | 36203 | 23.90 | nizwa |
| ibri | والاية عبري | ‘Ibrī | محافظة الظاهرة (قديم) | PPL | 80 | 163473 | 109.05 | nizwa |
| bahla | بهلاء | Bahlā’ | محافظة الداخلية | PPL | 80 | 54338 | 23.95 | nizwa |
| as-suwayq | السويق | As Suwayq | محافظة شمال الباطنة | PPL | 80 | 107143 | 90.83 | sohar |
| rustaq | الرستاق | Rustaq | محافظة شمال الباطنة (قديم) | PPL | 80 | 120000 | 52.08 | nizwa |
| al-qabil | القابل | Al Qābil | محافظة شمال الشرقية | PPL | 80 | 14008 | 116.66 | muscat |
| al-mazim | المازم | Al Māzim | محافظة الظاهرة (قديم) | PPL | 80 | 1318 | 114.57 | sohar |
| liwa | لوى | Liwá | محافظة شمال الباطنة | PPL | 80 | 26372 | 26.43 | sohar |
| al-khaburah | الخابورة | Al Khābūrah | محافظة شمال الباطنة | PPL | 80 | 50223 | 55.78 | sohar |
| adam | أدم | Adam | محافظة الداخلية | PPL | 80 | 17283 | 61.60 | nizwa |
| madha-al-jadidah | مدحاء الجديدة | Madḩā’ al Jadīdah | محافظة مسندم | PPL | 80 | 2260 | 111.47 | sohar |
| yanqul | ينقل | Yanqul | محافظة الظاهرة (قديم) | PPL | 80 | 16599 | 86.84 | sohar |
| al-mazyunah | المزيونة | Al Mazyūnah | محافظة ظفار | PPLA2 | 80 | - | 177.37 | salalah |
| madha | مدحاء | Madḩā’ | محافظة مسندم | PPL | 80 | 4306 | 111.52 | sohar |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| dalkut | ضلكوت | Ḑalkūt | محافظة ظفار | PPL | 70 | 96.86 |
| sadamat-bani-isa | الحجاج | Şadāmat Banī ‘Īsá | محافظة الظاهرة (قديم) | PPL | 70 | 62.93 |
| ash-shuwayhah | اش شویهاه | Ash Shuwayhah | محافظة البريمي | PPL | 70 | 73.03 |
| shihayt | شيهيت | Shīhayt | محافظة ظفار | PPL | 70 | 9.46 |
| al-hawtah | الحوطة | Al Ḩawţah | محافظة ظفار | PPL | 70 | 70.14 |
| rakhyut | رخيوت | Rakhyūt | محافظة ظفار | PPL | 70 | 77.29 |
| al-mughsayl | المغسيل | Al Mughsayl | محافظة ظفار | PPL | 70 | 35.22 |
| as-sumayr-al-alwiyah | السمير | As Sumayr al ‘Alwīyah | محافظة مسقط | PPL | 70 | 52.46 |
| al-kahil | الكحل | Al Kaḩil | محافظة الوسطى | PPL | 70 | 317.24 |
| ash-shisr | الشصر | Ash Shişr | محافظة ظفار | PPL | 70 | 146.22 |
| ghadu | غدو | Ghadū | محافظة ظفار | PPL | 70 | 16.02 |
| halluf | حلوف | Ḩallūf | محافظة ظفار | PPL | 70 | 39.75 |
| al-jissah | الجصه | Al Jişşah | محافظة مسقط | PPL | 70 | 24.11 |
| jiddat-al-bahriyah | جدة البحرية | Jiddat al Baḩrīyah | محافظة مسندم | PPL | 70 | 195.53 |
| jiddat-as-sayfiyah | جدة السيفية | Jiddat as Sayfīyah | محافظة مسندم | PPL | 70 | 196.92 |
| as-sufayrat | الصفيرات | Aş Şufayrāt | محافظة مسندم | PPL | 70 | 206.81 |
| ash-sharyah | الشرية | Ash Sharyah | محافظة مسندم | PPL | 70 | 217.96 |
| tafif | الطيف | Tafif | محافظة مسندم | PPL | 70 | 165.34 |
| al-hajir | الحاجر | Al Ḩājir | محافظة مسقط | PPL | 70 | 74.77 |
| al-ghubrah | الغبرة | Al Ghubrah | محافظة الداخلية | PPL | 70 | 50.15 |
| al-muhtafyah | المحتفية | Al Muḩtafyah | محافظة شمال الشرقية | PPL | 70 | 60.98 |
| yankit | ينكت | Yankit | محافظة مسقط | PPL | 70 | 31.15 |
| dass | اد داس | Daşş | محافظة مسندم | PPL | 70 | 176.58 |
| kizit | كيزت | Kīzīt | محافظة ظفار | PPL | 70 | 8.53 |
| qayranti-barq | غرنيتي برق | Qayrantī Barq | محافظة ظفار | PPL | 70 | 79.35 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **4624**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| zuwayhir | Z̧uwayhir | Z̧uwayhir | محافظة البريمي | PPL | missing_real_ar_name |
| zibarah | Zibārah | Zibārah | محافظة شمال الشرقية | PPL | missing_real_ar_name |
| zawliyah | Zawlīyah | Zawlīyah | محافظة الوسطى | PPL | missing_real_ar_name |
| zahr-sidrah | Z̧ahr Sidrah | Z̧ahr Sidrah | محافظة مسقط | PPL | missing_real_ar_name |
| zahr | Z̧ahr | Z̧ahr | محافظة الوسطى | PPL | missing_real_ar_name |
| dab-ayn | ضبعين | Ḑab‘ayn | محافظة شمال الباطنة | PPL | non_place_keyword (kw: عين) |
| zab | Zāb | Zāb | محافظة البريمي | PPL | missing_real_ar_name |
| yawiyah | Yawīyah | Yawīyah | محافظة الداخلية | PPL | missing_real_ar_name |
| yahi-risakh | Yaḩī Risākh | Yaḩī Risākh | محافظة ظفار | PPL | missing_real_ar_name |
| wughlah | Wughlah | Wughlah | محافظة الداخلية | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| al-musalla | المصلى | Al Muşallá | religious_site_not_city | مصلى |
| jafr-al-masjid | جفر المسجد | Jafr al Masjid | religious_site_not_city | مسجد |
| wadi-musalla | وادي مصلى | Wādī Muşallá | religious_site_not_city | مصلى |
| al-majami | المجامع | Al Majāmi‘ | religious_site_not_city | جامع(?!ة) |
| musalla | مصلّى | Muşallá | religious_site_not_city | مصلى |
| musalla-al-mashayikh | مصلى المشايخ | Muşallá al Mashāyikh | religious_site_not_city | مصلى |
| al-musalla | المصلى | Al Muşallá | religious_site_not_city | مصلى |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| sohar | sohar | slug |
| salalah | salalah | slug |
| nizwa | nizwa | slug |
| muscat | muscat | slug |
| masqat | muscat | ar_name+coords (d=19.12km) |

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
