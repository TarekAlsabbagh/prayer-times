# IR GeoNames Import Report (refined)

**Country**: Iran (إيران)
**Generated**: 2026-05-17T20:12:19.652Z
**Phase**: `CURATED-GEODATA-IR-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/ir-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/ir-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/ir-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/ir-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 81841 |
| Normalized candidates                     | 71404 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **42** |
| **medium_confidence_pending**             | **0** |
| **low_confidence_pending**                | **63987** |
| needs_review                              | 7296 |
| existing (matched, no action)             | 28 |
| rejected (bad data / religious site)      | 51 |
| Alias enrichment opps (in separate report) | 28 |

**Shortlist size (high + medium):** 42

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 51 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 26 |
| ar_name+coords | 1 |
| coords<1km | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| golestan | شهرك گلستان | Golestān | طهران | PPLA2 | 100 | 240000 | 26.68 | tehran |
| yasuj | ياسوج | Yasuj | كهكيلويه وبوير أحمد | PPLA | 100 | 96786 | 153.30 | shiraz |
| sari | سارى | Sari | مازندران | PPLA | 100 | 255396 | 178.81 | tehran |
| sanandaj | سنندج | Sanandaj | كردستان | PPLA | 100 | 349176 | 111.44 | kermanshah |
| qazvin | قزوين | Qazvin | قزوين | PPLA | 100 | 333635 | 118.62 | rasht |
| qods | شهر قدس | Qods | طهران | PPLA2 | 100 | 309605 | 25.53 | tehran |
| neyshabur | نيسابور | Neyshābūr | خراسان رضوي | PPLA2 | 100 | 220929 | 73.83 | mashhad |
| nazarabad | نظر آباد | Naz̧arābād | البرز | PPLA2 | 100 | 213388 | 76.49 | tehran |
| khorramshahr | الخرمشهر | Khorramshahr | خوزستان | PPLA2 | 100 | 330606 | 108.19 | ahvaz |
| karaj | قَصَبِهِ كَرَج | Karaj | البرز | PPLA | 100 | 1448075 | 39.25 | tehran |
| ilam | اِلام | Īlām | إيلام | PPLA | 100 | 140940 | 95.77 | kermanshah |
| gorgan | اَستِر آباد | Gorgān | كلستان | PPLA | 100 | 244937 | 302.41 | tehran |
| bushehr | بندر بوشهر | Bushehr | بوشهر | PPLA | 100 | 165377 | 183.04 | shiraz |
| borujerd | بروجرد | Borūjerd | لرستان | PPLA2 | 100 | 251958 | 162.05 | kermanshah |
| birjand | بيرجند | Bīrjand | خراسان الجنوبية | PPLA | 100 | 196982 | 351.35 | kerman |
| bandar-abbas | بندر عباس | Bandar Abbas | هرمزغان | PPLA | 100 | 352173 | 353.19 | kerman |
| ardabil | اردبيل | Ardabīl | أردبيل | PPLA | 100 | 410753 | 156.41 | rasht |
| arak | اراک | Arāk | مركزي | PPLA | 100 | 503647 | 123.92 | qom |
| khomeyni-shahr | خمینی شهر | Khomeynī Shahr | أصفهان | PPLA2 | 100 | 277334 | 12.66 | isfahan |
| zahedan | زاهدان | Zahedan | سيستان وبلوشستان | PPLA | 100 | 551980 | 374.71 | kerman |
| pakdasht | مامازان | Pākdasht | طهران | PPLA2 | 100 | 236319 | 35.46 | tehran |
| qarchak | قرچك | Qarchak | طهران | PPLA2 | 95 | 251834 | 33.61 | tehran |
| zanjan | زنجان | Zanjan | زنجان | PPLA | 95 | 357471 | 117.64 | rasht |
| shahr-e-kord | شهر كرد | Shahr-e Kord | تشهارمحال وبختياري | PPLA | 95 | 129153 | 84.16 | isfahan |
| semnan | سمنان | Semnan | سمنان | PPLA | 95 | 124826 | 181.45 | tehran |
| saveh | ساوه | Sāveh | مركزي | PPLA2 | 95 | 220762 | 63.39 | qom |
| maragheh | مراغه | Marāgheh | أذربيجان الشرقية | PPLA2 | 95 | 262604 | 78.36 | tabriz |
| khorramabad | خرم آباد | Khorramabad | لرستان | PPLA | 95 | 329825 | 150.45 | kermanshah |
| hamadan | همدان | Hamadān | همدان | PPLA | 95 | 528256 | 143.28 | kermanshah |
| bukan | بوکان | Būkān | أذربيجان الغربية | PPLA2 | 95 | 213331 | 152.55 | urmia |
| bojnurd | بجنورد | Bojnūrd | خراسان الشمالية | PPLA | 95 | 192041 | 244.22 | mashhad |
| babol | بابل | Bābol | مازندران | PPLA2 | 95 | 202796 | 150.33 | tehran |
| amol | آمل | Āmol | مازندران | PPLA2 | 95 | 237528 | 122.47 | tehran |
| shahriar | شهريار | Shahrīār | طهران | PPLA2 | 95 | 309607 | 30.11 | tehran |
| najafabad | نجف آباد | Najafābād | أصفهان | PPLA2 | 95 | 235281 | 28.24 | isfahan |
| eslamshahr | اسلامشهر | Eslamshahr | طهران | PPLA2 | 95 | 450000 | 20.63 | tehran |
| sirjan | سيرجان | Sirjan | كرمان | PPL | 85 | 207645 | 163.88 | kerman |
| qaem-shahr | شاه آباد | Qā’em Shahr | مازندران | PPL | 85 | 204953 | 157.74 | tehran |
| abadan | آبادان | Abadan | خوزستان | PPL | 85 | 370180 | 114.52 | ahvaz |
| azadshahr | آزادشهر | Āzādshahr | همدان | PPL | 80 | 514102 | 147.66 | kermanshah |
| sabzevar | سبزوار | Sabzevar | خراسان رضوي | PPL | 80 | 226183 | 173.62 | mashhad |
| maragheh | مراغه | Marāgheh | خراسان رضوي | PPL | 80 | 262604 | 47.99 | mashhad |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

_(empty)_

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **63987**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| yekahi | Yekāhī | Yekāhī | خوزستان | PPL | missing_real_ar_name |
| kabutaran | Kabūtarān | Kabūtarān | خوزستان | PPL | missing_real_ar_name |
| tileh | Tīleh | Tīleh | خوزستان | PPL | missing_real_ar_name |
| sheykh-saleh-sa-id | Sheykh Şāleḩ Sā‘īd | Sheykh Şāleḩ Sā‘īd | خوزستان | PPL | missing_real_ar_name |
| sheykh-hoseyn | Sheykh Ḩoseyn | Sheykh Ḩoseyn | خوزستان | PPL | missing_real_ar_name |
| sheykh-ajam | Sheykh ‘Ajam | Sheykh ‘Ajam | خوزستان | PPL | missing_real_ar_name |
| shareh-kani | Shāreh Kanī | Shāreh Kanī | خوزستان | PPL | missing_real_ar_name |
| sharaf-od-din | Sharaf od Dīn | Sharaf od Dīn | خوزستان | PPL | missing_real_ar_name |
| shirinab | Shīrīnāb | Shīrīnāb | خوزستان | PPL | missing_real_ar_name |
| seyyed-sobhan | Seyyed Şobhān | Seyyed Şobhān | خوزستان | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| masjed | مسجد | Masjed | religious_site_not_city | مسجد |
| qarah-masjed | قرة مسجد | Qarah Masjed | religious_site_not_city | مسجد |
| masjedlu | مسجدلو | Masjedlū | religious_site_not_city | مسجد |
| sar-masjed | سر مسجد | Sar Masjed | religious_site_not_city | مسجد |
| boneh-masjed | بنه مسجد | Boneh Masjed | religious_site_not_city | مسجد |
| masjed-qabaqi | مسجد قباقی | Masjed Qabāqī | religious_site_not_city | مسجد |
| masjedlu | مَسجِدلو | Masjedlū | religious_site_not_city | مسجد |
| masjed-e-qushi | مَسجِدِ قوشی | Masjed-e Qūshī | religious_site_not_city | مسجد |
| jame-shuran-e-sofla | جامع شوران سفلی | Jāme‘ Shūrān-e Soflá | religious_site_not_city | جامع(?!ة) |
| jame-shuran-e-olya | جامع شوران علیا | Jāme‘ Shūrān-e ‘Olyā | religious_site_not_city | جامع(?!ة) |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| qom | qom | slug |
| mashhad | mashhad | slug |
| kerman | kerman | slug |
| mashhad | mashhad | slug |
| yazd | yazd | slug |
| tehran | tehran | slug |
| tabriz | tabriz | slug |
| shiraz | shiraz | slug |
| shiraz | shiraz | slug |
| rasht | rasht | slug |

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
