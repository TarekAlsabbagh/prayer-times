# DZ GeoNames Import Report (refined)

**Country**: Algeria (الجزائر)
**Generated**: 2026-05-15T07:35:50.997Z
**Phase**: `CURATED-GEODATA-DZ-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/dz-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/dz-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/dz-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/dz-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 8333 |
| Normalized candidates                     | 8138 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **76** |
| **medium_confidence_pending**             | **50** |
| **low_confidence_pending**                | **129** |
| needs_review                              | 7872 |
| existing (matched, no action)             | 11 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 11 |

**Shortlist size (high + medium):** 126

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 10 |
| coords<1km | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ziama-mansouria | بلدية زيامة منصورية | Ziama Mansouria | ولاية جيجل | PPL | 85 | 12642 | 36.46 | bejaia |
| tit | تيت | Tit | ولاية أدرار | PPL | 85 | 4417 | 651.85 | ghardaia |
| tirmitine | تيرمتين | Tirmitine | ولاية تيزي وزو | PPL | 85 | 26261 | 83.00 | algiers |
| el-hed | إلماثن | el hed | ولاية بجاية | PPL | 85 | 31890 | 29.95 | bejaia |
| salah-bey | باسكال | Salah Bey | ولاية سطيف | PPL | 85 | 23339 | 38.91 | setif |
| remchi | الرمشي | Remchi | ولاية تلمسان | PPL | 85 | 31837 | 22.65 | tlemcen |
| rais-hamidou | الرئيس حميدو | Rais Hamidou | ولاية الجزائر | PPL | 85 | 30000 | 8.13 | algiers |
| lakhdaria | الأخضرية | Lakhdaria | ولاية البويرة | PPL | 85 | 42886 | 52.11 | algiers |
| khemis-miliana | أفرفيل | Khemis Miliana | ولاية عين الدفلى | PPL | 85 | 80512 | 59.15 | blida |
| hammam-bou-hadjar | حمام أبو حجر | Hammam Bou Hadjar | ولاية عين تموشنت | PPL | 85 | 25912 | 46.58 | oran |
| gdyel | سان كلو | Gdyel | ولاية وهران | PPL | 85 | 32774 | 20.93 | oran |
| el-malah | المالح | El Malah | ولاية عين تموشنت | PPL | 85 | 19415 | 53.68 | oran |
| el-amria | العامرية | El Amria | ولاية عين تموشنت | PPL | 85 | 26407 | 39.55 | oran |
| douera | بلدية دويرة | Douéra | ولاية الجزائر | PPL | 85 | 46266 | 13.81 | algiers |
| bou-saada | بلد السعادة | Bou Saâda | ولاية المسيلة | PPL | 85 | 111787 | 156.33 | setif |
| bordj-el-bahri | برج البحري | Bordj el Bahri | ولاية الجزائر | PPL | 85 | 52816 | 17.48 | algiers |
| barbacha | برباشة | Barbacha | ولاية بجاية | PPL | 85 | 31983 | 23.18 | bejaia |
| bab-ezzouar | باب الزوار | Bab Ezzouar | ولاية الجزائر | PPL | 85 | 275630 | 11.48 | algiers |
| azzaba | جماب | Azzaba | ولاية سكيكدة | PPL | 85 | 33766 | 60.45 | constantine |
| arzew | أرزيو | Arzew | ولاية وهران | PPL | 85 | 58162 | 33.17 | oran |
| aoulef | آولف | Aoulef | ولاية أدرار | PPL | 85 | 21723 | 662.47 | ghardaia |
| babor | بابور | Babor | ولاية سطيف | PPL | 85 | 18445 | 35.20 | setif |
| zaouiet-ed-debarh | زاوية دباغ | Zaouiet ed Debarh | ولاية تيميمون | PPL | 80 | 5915 | 418.74 | ghardaia |
| tsabit | تسابيت | Tsabit | ولاية أدرار | PPL | 80 | 1224 | 592.28 | ghardaia |
| tilouline | تيلولين | Tilouline | ولاية أدرار | PPL | 80 | 6120 | 706.13 | ghardaia |
| timokten | تيمقتن | Timokten | ولاية أدرار | PPL | 80 | 1255 | 659.28 | ghardaia |
| timgad | تيمقاد | Timgad | ولاية باتنة | PPL | 80 | 11828 | 27.68 | batna |
| tidmaine | تيطاوين | Tidmaine | ولاية أدرار | PPL | 80 | 4442 | 702.67 | ghardaia |
| tamest | تامست | Tamest | ولاية أدرار | PPL | 80 | 1133 | 677.15 | ghardaia |
| tamentit | تامنطيت | Tamentit | ولاية أدرار | PPL | 80 | 4835 | 647.16 | ghardaia |
| tamalous | تمالوس | Tamalous | ولاية سكيكدة | PPL | 80 | 32579 | 52.60 | constantine |
| sidi-khaled | سيدي خالد | Sidi Khaled | ولاية أولاد جلال | PPL | 80 | 38987 | 169.04 | batna |
| sfizef | سفيزف | Sfizef | ولاية سيدي بلعباس | PPL | 80 | 27914 | 62.40 | oran |
| seddouk | صدوق | Seddouk | ولاية بجاية | PPL | 80 | 19884 | 42.23 | bejaia |
| sali | سالي | Sali | ولاية أدرار | PPL | 80 | 3948 | 710.61 | ghardaia |
| rouiba | الرويبة | Rouiba | ولاية الجزائر | PPL | 80 | 117558 | 19.85 | algiers |
| reguiba | الرقيبة | Reguiba | ولاية الوادي | PPL | 80 | 25210 | 226.74 | batna |
| reggane | رقان | Reggane | ولاية أدرار | PPL | 80 | 32974 | 725.16 | ghardaia |
| oulad-said | أولاد السعيد | Oulad Saïd | ولاية تيميمون | PPL | 80 | 3357 | 472.50 | ghardaia |
| ngaous | نقاوس | N’Gaous | ولاية باتنة | PPL | 80 | 29453 | 50.98 | batna |
| miliana | مليانة | Miliana | ولاية عين الدفلى | PPL | 80 | 43366 | 56.98 | blida |
| mers-el-kebir | بلدية المرسى الكبير | Mers el Kebir | ولاية وهران | PPL | 80 | 20178 | 7.51 | oran |
| mekla | مقلع | Mekla | ولاية تيزي وزو | PPL | 80 | 29560 | 73.56 | bejaia |
| draa-klalouche | ذراع قلالوش | Draa Klalouche | ولاية باتنة | PPL | 80 | 5000 | 31.75 | batna |
| kerkera | الكركرة | Kerkera | ولاية سكيكدة | PPL | 80 | 27177 | 62.79 | constantine |
| hassi-messaoud | حاسي مسعود | Hassi Messaoud | ولاية ورقلة | PPL | 80 | 44478 | 243.11 | ghardaia |
| feraoun | فرعون | Feraoun | ولاية بجاية | PPL | 80 | 21700 | 29.60 | bejaia |
| fatis | فاتيس | Fatis | ولاية تيميمون | PPL | 80 | 3209 | 419.39 | ghardaia |
| es-senia | السانية‎ | Es Senia | ولاية وهران | PPL | 80 | 39064 | 5.61 | oran |
| el-kseur | القصر | El Kseur | ولاية بجاية | PPL | 80 | 26050 | 21.95 | bejaia |
| el-kala | القالة | El Kala | ولاية الطارف | PPL | 80 | 35449 | 60.17 | annaba |
| el-achir | اليشير | El Achir | ولاية برج بوعريريج | PPL | 80 | 158333 | 71.99 | setif |
| dellys | دلّس | Dellys | ولاية بومرداس | PPL | 80 | 26384 | 78.17 | algiers |
| dar-el-beida | الدار البيضاء | Dar el Beïda | ولاية الجزائر | PPL | 80 | 37311 | 14.42 | algiers |
| cherchell | شرشال | Cherchell | ولاية تيبازة | PPL | 80 | 34372 | 58.85 | blida |
| chebli | الشبلي | Chebli | ولاية البليدة | PPL | 80 | 19901 | 20.13 | blida |
| charouine | شروين | Charouine | ولاية تيميمون | PPL | 80 | 1536 | 538.79 | ghardaia |
| boumagueur | بومقر | Boumagueur | ولاية باتنة | PPL | 80 | 8474 | 56.53 | batna |
| boukadir | بوقادير | Boukadir | ولاية الشلف | PPL | 80 | 28652 | 159.02 | blida |
| boudouaou | بودواو | Boudouaou | ولاية بومرداس | PPL | 80 | 56398 | 31.43 | algiers |
| bordj-el-kiffan | برج الكيفان | Bordj el Kiffan | ولاية الجزائر | PPL | 80 | 123246 | 11.92 | algiers |
| boghni | بوغني | Boghni | ولاية تيزي وزو | PPL | 80 | 54666 | 83.18 | algiers |
| beni-saf | بني صاف | Beni Saf | ولاية عين تموشنت | PPL | 80 | 39749 | 46.91 | tlemcen |
| beni-amrane | بني عمران | Beni Amrane | ولاية بومرداس | PPL | 80 | 18414 | 48.41 | algiers |
| bouda | بودة | Bouda | ولاية أدرار | PPL | 80 | 2349 | 634.80 | ghardaia |
| barika | بريكة | Barika | ولاية باتنة | PPL | 80 | 98141 | 75.51 | batna |
| baraki | براقي | Baraki | ولاية الجزائر | PPL | 80 | 105402 | 10.26 | algiers |
| aougrout | أوقروت | Aougrout | ولاية تيميمون | PPL | 80 | 7310 | 528.01 | ghardaia |
| akbou | أقبو | Akbou | ولاية بجاية | PPL | 80 | 38291 | 59.00 | bejaia |
| akabli | أقبلي | Akabli | ولاية أدرار | PPL | 80 | 4409 | 679.54 | ghardaia |
| abou-el-hassan | دائرة أبو الحسن | Abou el Hassan | ولاية الشلف | PPL | 80 | 24022 | 146.06 | blida |
| timiaouine | تيمياوين | Timiaouine | ولاية برج باجي مختار | PPL | 80 | 4493 | 1351.94 | ghardaia |
| zaouia | الزاوية | Zaouia | ولاية أدرار | PPL | 80 | 3026 | 679.78 | ghardaia |
| deldoul | دلدول | Deldoul | ولاية تيميمون | PPL | 80 | 1748 | 539.09 | ghardaia |
| ksar-kaddour | قصر قدور | Ksar Kaddour | ولاية تيميمون | PPL | 80 | 1016 | 449.92 | ghardaia |
| talmine | طالمين | Talmine | ولاية تيميمون | PPL | 80 | 1067 | 530.39 | ghardaia |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| zerhamra | الزغامرة | Zerhamra | ولاية بني عباس | PPL | 70 | 555.17 |
| zelfana | برج زلفانة | Zelfana | ولاية غرداية | PPL | 70 | 52.71 |
| ti-n-zaouatene | برج بيير بورد | Ti-n-Zaouâtene | ولاية سعيدة | PPL | 70 | 1395.04 |
| tifra | تيفرة | Tifra | ولاية بجاية | PPL | 70 | 35.81 |
| tazrouk | تازروق | Tazrouk | ولاية تمنراست | PPL | 70 | 1040.03 |
| tazbent | برج تازبنت | Tazbent | ولاية تبسة | PPL | 70 | 162.03 |
| taskriout | تاسقريوت | Taskriout | ولاية بجاية | PPL | 70 | 29.03 |
| tasfaout | تاسفاوت | Tasfaout | ولاية تيميمون | PPL | 70 | 511.53 |
| tasfaout | تاسفاوت | Tasfaout | ولاية أدرار | PPL | 70 | 658.78 |
| tarhaouhaout | تاغاوهاوت | Tarhaouhaout | ولاية تمنراست | PPL | 70 | 1112.67 |
| tamzoura | تامزوغة | Tamzoura | ولاية عين تموشنت | PPL | 70 | 32.19 |
| souk-et-tenine | سوق اثنین | Souk et Tenine | ولاية بجاية | PPL | 70 | 26.29 |
| sidi-safi | سيدي الصافي | Sidi Safi | ولاية عين تموشنت | PPL | 70 | 44.33 |
| seggana | برج سقانة | Seggana | ولاية باتنة | PPL | 70 | 55.22 |
| ouled-maamar | أولاد معمر | Ouled Maamar | ولاية الجزائر | PPL | 70 | 21.39 |
| moulay-larbi | مولاي العربي | Moulay Larbi | ولاية سعيدة | PPL | 70 | 124.38 |
| mechta-reggada | مشتة الرقادة | Mechta Reggada | ولاية سكيكدة | PPL | 70 | 44.04 |
| maoussa | ماوسا | Maoussa | ولاية معسكر | PPL | 70 | 87.12 |
| magra | برج مقرة | Magra | ولاية المسيلة | PPL | 70 | 70.63 |
| kali | قالي | Kali | ولاية تيميمون | PPL | 70 | 475.95 |
| ideles | أدلس | Idelès | ولاية تمنراست | PPL | 70 | 988.09 |
| hassi-rmel | حاسي الرمل | Hassi R’mel | ولاية الأغواط | PPL | 70 | 63.69 |
| guernini | القرنيني | Guernini | ولاية باتنة | PPL | 70 | 87.46 |
| gouraya | قوراية | Gouraya | ولاية تيبازة | PPL | 70 | 83.35 |
| el-ogla | العقلة | El Ogla | ولاية تبسة | PPL | 70 | 124.16 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **129**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| i-n-ezzane | I-n-Ezzane | I-n-Ezzane | ولاية جانت | PPL | missing_real_ar_name |
| zribet-kaba-rhzel | Zrîbet Ka’ba Rhzêl | Zrîbet Ka’ba Rhzêl | ولاية سكيكدة | PPL | missing_real_ar_name |
| zribet-ben-ouaar | Zrîbet Ben Ouaar | Zrîbet Ben Ouaar | ولاية بسكرة | PPL | missing_real_ar_name |
| zekara | Zekara | Zekara | ولاية عين الدفلى | PPL | missing_real_ar_name |
| zraoui | Zraoui | Zraoui | ولاية بجاية | PPL | missing_real_ar_name |
| zraia | Zraïa | Zraïa | ولاية سطيف | PPL | missing_real_ar_name |
| zra-el-mial | Zra el Mial | Zra el Mial | ولاية جيجل | PPL | missing_real_ar_name |
| zraa-el-hadjer | Zraa el Hadjer | Zraa el Hadjer | ولاية جيجل | PPL | missing_real_ar_name |
| zoui | Zoui | Zoui | ولاية خنشلة | PPL | missing_real_ar_name |
| zouggara | Zouggara | Zouggara | ولاية بومرداس | PPL | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tlemcen | tlemcen | slug |
| setif | setif | slug |
| oran | oran | slug |
| melika | ghardaia | coords<1km (d=0.73km) |
| ghardaia | ghardaia | slug |
| constantine | constantine | slug |
| blida | blida | slug |
| bejaia | bejaia | slug |
| batna | batna | slug |
| annaba | annaba | slug |

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
