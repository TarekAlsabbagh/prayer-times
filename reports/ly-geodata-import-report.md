# LY GeoNames Import Report (refined)

**Country**: Libya (ليبيا)
**Generated**: 2026-05-14T21:14:40.660Z
**Phase**: `CURATED-GEODATA-LY-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/ly-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/ly-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/ly-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/ly-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 909 |
| Normalized candidates                     | 821 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **68** |
| **medium_confidence_pending**             | **26** |
| **low_confidence_pending**                | **248** |
| needs_review                              | 469 |
| existing (matched, no action)             | 10 |
| rejected (bad data / religious site)      | 0 |
| Alias enrichment opps (in separate report) | 10 |

**Shortlist size (high + medium):** 94

## Rejection breakdown

| Reason | Count |
| --- | --- |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 5 |
| coords<1km | 4 |
| en_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| al-bardiyah | البردية | Al Bardīyah | البطنان | PPL | 85 | 9149 | 110.56 | tobruk |
| mukhayla | المخيلى | Mukhaylá | درنة | PPL | 85 | 1764 | 74.72 | derna |
| susah | أبولونيا | Sūsah | الجبل الأخضر | PPL | 85 | 7285 | 65.29 | derna |
| qaryat-suluq | سلوق | Qaryat Sulūq | بنغازي | PPL | 85 | 19918 | 52.48 | benghazi |
| massah | ماسة | Massah | الجبل الأخضر | PPL | 85 | 7831 | 95.04 | derna |
| zliten | زليتن | Zliten | مصراتة | PPL | 85 | 203790 | 50.21 | misrata |
| zillah | زلة | Zillah | الجفرة | PPL | 85 | 10030 | 309.55 | sirte |
| qasr-al-qarabulli | قصر القربولي | Qaşr al Qarabūllī | طرابلس | PPL | 85 | 49610 | 51.40 | tripoli-ly |
| al-burayqah | البريقة | Al Burayqah | الواحات | PPL | 85 | 31300 | 196.57 | benghazi |
| brak | براك | Brak | وادي الشاطئ | PPL | 85 | 16200 | 58.99 | sabha |
| bani-walid | بني وليد | Bani Walid | مصراتة | PPL | 85 | 45734 | 125.80 | misrata |
| zintan | الزنتان، لیبی | Zintan | الجبل الغربي | PPL | 85 | 33000 | 101.58 | zawiya |
| qasr-abu-hadi | قصر ابو هادى | Qasr Abu Hadi | سرت | PPL | 85 | 4890 | 17.94 | sirte |
| umm-ar-rizam | أم الرزم | Umm ar Rizam | درنة | PPL | 80 | 8742 | 42.23 | derna |
| qaryat-umar-al-mukhtar | قرية عمر المختار | Qaryat ‘Umar al Mukhtār | الجبل الأخضر | PPL | 80 | 8031 | 91.67 | derna |
| qandulah | قندولة | Qandūlah | الجبل الأخضر | PPL | 80 | 7760 | 103.02 | derna |
| qaminis | قمينس | Qamīnis | بنغازي | PPL | 80 | 8688 | 51.70 | benghazi |
| martubah | مرتوبة | Martūbah | درنة | PPL | 80 | 9357 | 23.17 | derna |
| kambut | كمبوت | Kambūt | البطنان | PPL | 80 | 6973 | 51.07 | tobruk |
| jardas-al-abid | جردس العبيد | Jardas al ‘Abīd | المرج | PPL | 80 | 6744 | 87.07 | benghazi |
| daryanah | دريانة | Daryānah | بنغازي | PPL | 80 | 7558 | 32.94 | benghazi |
| az-zuwaytinah | الزويتينة | Az Zuwaytīnah | الواحات | PPL | 80 | 21015 | 129.76 | benghazi |
| awjilah | أوجلة | Awjilah | الواحات | PPL | 80 | 5125 | 353.93 | benghazi |
| tukrah | توكرة | Tūkrah | المرج | PPL | 80 | 12593 | 65.37 | benghazi |
| al-qubbah | القبة | Al Qubbah | درنة | PPL | 80 | 24631 | 37.72 | derna |
| al-jawf | الجوف | Al Jawf | الكفرة | PPL | 80 | 42079 | 878.49 | tobruk |
| qaryat-al-bayyadah | قرية البياضة | Qaryat al Bayyāḑah | المرج | PPL | 80 | 5538 | 120.38 | benghazi |
| al-abyar | الأبيار‎ | Al Abyār | المرج | PPL | 80 | 32563 | 48.64 | benghazi |
| al-abraq | الأبرق | Al Abraq | الجبل الأخضر | PPL | 80 | 8276 | 60.31 | derna |
| zawilah | زويلة | Zawīlah | مرزق | PPL | 80 | 4434 | 119.52 | sabha |
| zaltan | زلطن | Zalţan | النقاط الخمس | PPL | 80 | 14131 | 83.32 | zawiya |
| wazin | وازن | Wāzin | نالوت | PPL | 80 | 4715 | 213.68 | zawiya |
| waddan | ودان | Waddān | الجفرة | PPL | 80 | 10150 | 231.74 | sirte |
| umm-al-aranib | أم الأرانب | Umm al Arānib | مرزق | PPL | 80 | 10493 | 105.09 | sabha |
| tiji | تيجي | Tījī | نالوت | PPL | 80 | 6905 | 152.81 | zawiya |
| taraghin | تراغن | Tarāghin | مرزق | PPL | 80 | 8167 | 123.92 | sabha |
| tamzawah | تمزاوة | Tamzāwah | وادي الشاطئ | PPL | 80 | 7410 | 63.42 | sabha |
| surman | صرمان | Şurmān | الزاوية | PPL | 80 | 77114 | 14.63 | zawiya |
| suknah | سوكنة | Sūknah | الجفرة | PPL | 80 | 12077 | 250.21 | sirte |
| sinawin | سيناون | Sīnāwin | نالوت | PPL | 80 | 4059 | 277.68 | zawiya |
| samnu | سمنو | Samnū | سبها | PPL | 80 | 4492 | 52.04 | sabha |
| sabratah | صبراتة | Şabrātah | الزاوية | PPL | 80 | 83398 | 22.86 | zawiya |
| sidi-bin-zinah | سيدي بن زينة | Sīdī Bin Zīnah | النقاط الخمس | PPL | 80 | 31607 | 70.83 | zawiya |
| qirah | قيرة | Qīrah | وادي الشاطئ | PPL | 80 | 6997 | 61.41 | sabha |
| qasr-khiyar | قصر خيار | Qaşr Khiyār | طرابلس | PPL | 80 | 16708 | 64.79 | tripoli-ly |
| mizdah | مزدة | Mizdah | الجبل الغربي | PPL | 80 | 16735 | 146.88 | zawiya |
| maradah | مرادة | Marādah | الواحات | PPL | 80 | 2229 | 333.13 | benghazi |
| kabaw | كاباو | Kābāw | نالوت | PPL | 80 | 7686 | 165.46 | zawiya |
| janzur | جنزور | Janzūr | الجفارة | PPL | 80 | 154389 | 17.95 | tripoli-ly |
| jadu | جادو | Jādū | الجبل الغربي | PPL | 80 | 12507 | 110.31 | zawiya |
| ghadames | غدامس | Ghadames | نالوت | PPL | 80 | 12096 | 422.46 | zawiya |
| daraj | درج | Daraj | نالوت | PPL | 80 | 6051 | 359.31 | zawiya |
| barqin | برقن | Barqin | وادي الشاطئ | PPL | 80 | 5902 | 97.24 | sabha |
| qaryat-al-qian | قرية القيعان | Qaryat al Qī‘ān | نالوت | PPL | 80 | 3797 | 135.55 | zawiya |
| ar-rujban | الرجبان | Ar Rujbān | الجبل الغربي | PPL | 80 | 6419 | 103.62 | zawiya |
| aqar | آقار | Āqār | وادي الشاطئ | PPL | 80 | 4832 | 61.63 | sabha |
| al-ajaylat | العجيلات | Al Ajaylat | النقاط الخمس | PPL | 80 | 130546 | 32.89 | zawiya |
| al-qatrun | القطرون | Al Qaţrūn | مرزق | PPL | 80 | 7243 | 233.03 | sabha |
| al-mayah | الماية | Al Māyah | الجفارة | PPL | 80 | 14203 | 15.18 | zawiya |
| al-khadra | الخضراء | Al Khaḑrā’ | المرقب | PPL | 80 | 9521 | 73.05 | tripoli-ly |
| al-jumayl | الجميل | Al Jumayl | النقاط الخمس | PPL | 80 | 102000 | 63.32 | zawiya |
| al-jadid | الجديد | Al Jadīd | سبها | PPL | 80 | 126386 | 3.12 | sabha |
| al-hurshah | الحرشة | Al Ḩurshah | الزاوية | PPL | 80 | 81119 | 5.25 | zawiya |
| al-ghurayfah | الغريفة | Al Ghurayfah | وادي الحياة | PPL | 80 | 23449 | 151.97 | sabha |
| al-barakat | البركات | Al Barakāt | غات | PPL | 80 | 9908 | 486.68 | sabha |
| tazirbu | تازربو | Tāzirbū | الكفرة | PPL | 80 | 8085 | 679.12 | sabha |
| ar-rahaibat | الرحيبات | Ar-Raḥaībāt | الجبل الغربي | PPL | 80 | 9989 | 130.59 | zawiya |
| msalatah | مسلاتة | Msalātah | المرقب | PPL | 80 | 73907 | 85.95 | tripoli-ly |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| zawiyat-masus | زاوية مسوس | Zāwiyat Masūs | المرج | PPL | 70 | 105.83 |
| zawiyat-al-izziyat | زاوية العزيات | Zāwiyat al ‘Izzīyāt | درنة | PPL | 70 | 55.89 |
| qaryat-sidi-mahyub | سيدي مهيوس | Qaryat Sīdī Mahyūb | المرج | PPL | 70 | 62.92 |
| qaryat-umm-as-safa | قرية أم الصفا | Qaryat Umm aş Şafā’ | بنغازي | PPL | 70 | 31.17 |
| qaryat-qunfudhah | قرية قنفودة | Qaryat Qunfūdhah | بنغازي | PPL | 70 | 11.98 |
| qaryat-ailat-zaydan | قرية عائلة زيدان | Qaryat ‘Ā’ilat Zaydān | البطنان | PPL | 70 | 7.10 |
| qaryat-jardinah | جردينة | Qaryat Jardīnah | بنغازي | PPL | 70 | 37.92 |
| qaryat-al-qawarishah | القوارشة | Qaryat al Qawārishah | بنغازي | PPL | 70 | 12.13 |
| madinat-tulmaythah | طلميثة | Madīnat Ţulmaythah | المرج | PPL | 70 | 103.08 |
| zizaw | جيزاو | Zīzāw | مرزق | PPL | 70 | 129.16 |
| tawurghah | تاورغاء | Tāwurghah | مصراتة | PPL | 70 | 40.46 |
| sha-wa | شعوا | Sha‘wā’ | نالوت | PPL | 70 | 284.18 |
| qaryat-bishr | بشر | Qaryat Bishr | الواحات | PPL | 70 | 212.70 |
| qabilat-awlad-at-tamid | قبيلة أولاد الطامد | Qabīlat Awlād aţ Ţāmid | مصراتة | PPL | 70 | 43.11 |
| awlad-abu-humayra | أولاد أبو حميرة | Awlad Abu Humayra | الزاوية | PPL | 70 | 3.39 |
| qabilat-al-mu-ammariyin | قبيلة المعمرين | Qabīlat al Mu‘ammarīyīn | المرقب | PPL | 70 | 80.01 |
| qaryat-jital | قرية جيتال | Qaryat Jītāl | الجبل الغربي | PPL | 70 | 124.00 |
| jarmah | جرمة | Jarmah | وادي الحياة | PPL | 70 | 146.33 |
| buwayrat-al-hasun | البؤيرات | Buwayrāt al Ḩasūn | سرت | PPL | 70 | 84.68 |
| qaryat-az-zarruq | زروق | Qaryat az Zarrūq | مصراتة | PPL | 70 | 3.85 |
| al-uqaylah | العقيلة | Al ‘Uqaylah | الواحات | PPL | 70 | 223.50 |
| al-qaryat-ash-sharqiyah | القريات الشرقية | Al Qaryāt ash Sharqīyah | الجبل الغربي | PPL | 70 | 263.51 |
| qaryat-al-qaddahiyah | القداحية | Qaryat al Qaddāḩīyah | مصراتة | PPL | 70 | 113.84 |
| al-hishah | ال هیشاه | Al Hīshah | مصراتة | PPL | 70 | 82.68 |
| ad-dafinah | الدافينة | Ad Dāfīnah | المرقب | PPL | 70 | 28.44 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **248**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| zawiyat-al-urqub | Zāwiyat al ‘Urqūb | Zāwiyat al ‘Urqūb | الجبل الأخضر | PPL | missing_real_ar_name |
| zawiyat-al-habib | Zāwiyat al Ḩabīb | Zāwiyat al Ḩabīb | درنة | PPL | missing_real_ar_name |
| zahrah | Zahrah | Zahrah | درنة | PPL | missing_real_ar_name |
| suq-al-ajaj | Sūq al ‘Ajāj | Sūq al ‘Ajāj | البطنان | PPL | missing_real_ar_name |
| sultan | Sulţān | Sulţān | بنغازي | PPL | missing_real_ar_name |
| riasat-difa-barqah | Ri’āsat Difā‘ Barqah | Ri’āsat Difā‘ Barqah | بنغازي | PPL | missing_real_ar_name |
| rashidah | Rāshidah | Rāshidah | الواحات | PPL | missing_real_ar_name |
| qirnadah | Qirnādah | Qirnādah | الجبل الأخضر | PPL | missing_real_ar_name |
| qasr-libiya | Qaşr Lībiyā | Qaşr Lībiyā | الجبل الأخضر | PPL | missing_real_ar_name |
| qasr-al-urayyid | Qaşr al ‘Urayyiḑ | Qaşr al ‘Urayyiḑ | بنغازي | PPL | missing_real_ar_name |

## rejected examples

_(none)_

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tobruk | tobruk | slug |
| benghazi | benghazi | slug |
| tripoli | tripoli-ly | en_name+coords (d=0.37km) |
| sirte | sirte | slug |
| sabha | sabha | slug |
| qaryat-ras-ath-thumah | misrata | coords<1km (d=0.80km) |
| qabilat-al-maqsabah | misrata | coords<1km (d=0.57km) |
| misratah | misrata | coords<1km (d=0.01km) |
| zawiya | zawiya | slug |
| az-zawiyah | zawiya | coords<1km (d=0.55km) |

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
