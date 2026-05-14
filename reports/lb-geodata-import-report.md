# LB GeoNames Import Report (refined)

**Country**: Lebanon (لبنان)
**Generated**: 2026-05-14T17:12:20.858Z
**Phase**: `CURATED-GEODATA-LB-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/lb-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/lb-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/lb-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/lb-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 3720 |
| Normalized candidates                     | 3313 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **35** |
| **medium_confidence_pending**             | **233** |
| **low_confidence_pending**                | **1599** |
| needs_review                              | 1433 |
| existing (matched, no action)             | 10 |
| rejected (bad data / religious site)      | 3 |
| Alias enrichment opps (in separate report) | 10 |

**Shortlist size (high + medium):** 268

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 3 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| coords<1km | 5 |
| slug | 2 |
| ar_name+coords | 2 |
| en_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| byblos | بيبلوس | Byblos | محافظة جبل لبنان | PPLA2 | 100 | 20784 | 28.65 | beirut |
| bsharri | بشري | Bsharri | محافظة الشمال | PPLA2 | 100 | 20000 | 25.40 | tripoli-lb |
| aley | عالية | Aley | محافظة جبل لبنان | PPLA2 | 100 | 130000 | 13.38 | beirut |
| jounieh | جونيه | Jounieh | محافظة جبل لبنان | PPLA2 | 95 | 96315 | 14.43 | beirut |
| el-hermel | الهرمل | El Hermel | محافظة بعلبك-الهرمل | PPLA2 | 95 | 22250 | 49.30 | tripoli-lb |
| batroun | البترون | Batroûn | محافظة الشمال | PPLA2 | 95 | 10852 | 26.77 | tripoli-lb |
| srifa | صريفا | Srîfa | محافظة الجنوب | PPL | 85 | 4750 | 18.87 | tyre-lb |
| chaat | شعت | Chaat | محافظة بعلبك-الهرمل | PPL | 85 | 6322 | 44.73 | zahle |
| jezzine | جزين | Jezzine | محافظة الجنوب | PPLA2 | 85 | - | 19.68 | saida |
| hasbaya | حاصبيا | Hasbaya | محافظة النبطية | PPLA2 | 85 | - | 33.94 | saida |
| sarafand | الصرفند | Sarafand | محافظة الجنوب | PPL | 85 | 10965 | 13.77 | saida |
| en-naqoura | الناقورة | En Nâqoûra | محافظة الجنوب | PPL | 85 | 24910 | 17.98 | tyre-lb |
| jdaidet-el-matn | الجديدة | Jdaidet el Matn | محافظة جبل لبنان | PPLA2 | 85 | - | 5.97 | beirut |
| tebnine | تبنين | Tebnine | محافظة النبطية | PPL | 85 | 5000 | 21.92 | tyre-lb |
| zgharta | زغرتا | Zghartā | محافظة الشمال | PPLA2 | 80 | - | 6.03 | tripoli-lb |
| sir-ed-danniye | سير الضنية | Sîr ed Danniyé | محافظة الشمال | PPLA2 | 80 | - | 17.60 | tripoli-lb |
| chmistar | شمسطار | Chmistâr | محافظة بعلبك-الهرمل | PPL | 80 | 30000 | 16.91 | zahle |
| cheikhlar | ضيعة المشايخ اصل الكلمة تركي | Cheïkhlar | محافظة عكار | PPL | 80 | 500 | 43.87 | tripoli-lb |
| qana | قانا | Qâna | محافظة الجنوب | PPL | 80 | 10000 | 12.15 | tyre-lb |
| marjayoun | مرجعيون | Marjayoun | محافظة النبطية | PPLA2 | 80 | - | 29.81 | saida |
| kfar-shouba | كفر شوبا | Kfar Shouba | محافظة النبطية | PPL | 80 | 1000 | 39.13 | saida |
| kfar-kila | كفر كلا | Kfar Kila | محافظة النبطية | PPL | 80 | 5878 | 33.29 | tyre-lb |
| joubb-jannine | جب جنين | Joubb Jannîne | محافظة البقاع | PPLA2 | 80 | - | 26.75 | zahle |
| aarsal | عرسال | Aarsâl | محافظة بعلبك-الهرمل | PPL | 80 | 50000 | 59.75 | tripoli-lb |
| hrajel | حراجل | Hrajel | محافظة جبل لبنان | PPL | 80 | 8000 | 21.48 | zahle |
| habbouch | حبّوش | Habboûch | محافظة النبطية | PPL | 80 | 98433 | 19.48 | saida |
| fadous | Fad`ous Fad`us Fadaaous Fadaouss Fadaoûss Fadouss Fad‘ous Fad‘ūs Fid`aws Fid‘aws fdʿws فدعوس | Fadous | محافظة الشمال | PPL | 80 | 750 | 29.22 | tripoli-lb |
| bent-jbail | بنت جبيل | Bent Jbaïl | محافظة النبطية | PPLA2 | 80 | - | 28.15 | tyre-lb |
| bhamdoun-el-mhatta | بحمدون | Bhamdoûn el Mhatta | محافظة جبل لبنان | PPL | 80 | 5000 | 17.39 | beirut |
| beit-ed-dine | بيت الدين | Beït ed Dîne | محافظة جبل لبنان | PPLA2 | 80 | - | 23.37 | beirut |
| aaitanit | عيتنيت | Aaïtanît | محافظة البقاع | PPL | 80 | 6800 | 27.56 | saida |
| aanjar | عنجر | Aanjar | محافظة البقاع | PPL | 80 | 2400 | 13.50 | zahle |
| amioun | أميون | Amioûn | محافظة الشمال | PPLA2 | 80 | - | 15.65 | tripoli-lb |
| ghazieh | الغازية | Ghazieh | محافظة الجنوب | PPL | 80 | 50000 | 4.42 | saida |
| aajaltoun | عجلتون | Aajaltoûn | محافظة جبل لبنان | PPL | 80 | 10000 | 18.49 | beirut |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| zelhmaya | زلحمايا | Zélhmaya | محافظة جبل لبنان | PPL | 70 | 25.35 |
| zghartaghrine | زغر بتغرين | Zghartaghrîne | محافظة الشمال | PPL | 70 | 12.85 |
| zardeq | زرداق | Zardeq | محافظة جبل لبنان | PPL | 70 | 31.43 |
| zoummar | زمار | Zoummar | محافظة جبل لبنان | PPL | 70 | 32.47 |
| zaghla | الزغلا | Zaghla | محافظة النبطية | PPL | 70 | 33.78 |
| yaroun | يارون | Yâroun | محافظة النبطية | PPL | 70 | 30.18 |
| yanta | ينطا | Yanta | محافظة البقاع | PPL | 70 | 27.26 |
| ouata-tabriye | طبرية | Ouata Tabriyé | محافظة جبل لبنان | PPL | 70 | 24.23 |
| ouata-el-borj | الوطى | Ouata el Borj | محافظة جبل لبنان | PPL | 70 | 33.52 |
| oum-et-tout | أم التوت | Oum et Toût | محافظة الجنوب | PPL | 70 | 18.76 |
| tair-zebna | الشهابية | Taïr Zebna | محافظة الجنوب | PPL | 70 | 17.80 |
| tarouel | البرج | Tarouel | محافظة جبل لبنان | PPL | 70 | 31.12 |
| talssa | زيتونة | Talssâ | محافظة الجنوب | PPL | 70 | 8.55 |
| tall-dunub-al-gadida | تل ذنوب الجديدة | Tall Ḏunūb al-Ǧadida | محافظة البقاع | PPL | 70 | 23.03 |
| tall-dunub | تل ذنوب | Tall Ḏunūb | محافظة البقاع | PPL | 70 | 23.48 |
| taht-el-qalaa | القلعة | Taht el Qalaa | محافظة جبل لبنان | PPL | 70 | 28.98 |
| slaiyeb-bchaale | صليب بشعلة | Slaïyeb Bchaalé | محافظة الشمال | PPL | 70 | 25.85 |
| chqaif | الشقيق | Chqaïf | محافظة جبل لبنان | PPL | 70 | 24.23 |
| chir-hmairine | الشيخ حميرين | Chîr Hmaïrîne | محافظة عكار | PPL | 70 | 31.82 |
| chnata | شناتا | Chnâta | محافظة الشمال | PPL | 70 | 20.02 |
| choualiq | الشواليق | Chouâlîq | محافظة الجنوب | PPL | 70 | 6.16 |
| chabriha | شبريحا | Chabrîha | محافظة الجنوب | PPL | 70 | 4.28 |
| sfenta | سفنتا | Sfenta | محافظة الجنوب | PPL | 70 | 12.66 |
| sfaray | صفاراي | Sfâray | محافظة الجنوب | PPL | 70 | 11.21 |
| sakhra | صخرة | Sakhra | محافظة الشمال | PPL | 70 | 10.66 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **1599**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| qal-at-subaybi | Qal‘at Şubaybī | Qal‘at Şubaybī |  | PPL | missing_real_ar_name |
| bayt-hayrah | Bayt Ḩayrah | Bayt Ḩayrah | محافظة بعلبك-الهرمل | PPL | missing_real_ar_name |
| zouaitini | Zouaïtîni | Zouaïtîni | محافظة جبل لبنان | PPL | missing_real_ar_name |
| zouq-haddara | Zoûq Haddâra | Zoûq Haddâra | محافظة عكار | PPL | missing_real_ar_name |
| zouq-el-mqachrine | Zoûq el Mqachrîne | Zoûq el Mqachrîne | محافظة عكار | PPL | missing_real_ar_name |
| zouq-el-kharab | Zouq el Kharab | Zouq el Kharab | محافظة جبل لبنان | PPL | missing_real_ar_name |
| zouq-el-hosniye | Zoûq el Hosnîyé | Zoûq el Hosnîyé | محافظة عكار | PPL | missing_real_ar_name |
| zouq-el-hbalsa | Zoûq el Hbâlsa | Zoûq el Hbâlsa | محافظة عكار | PPL | missing_real_ar_name |
| zighrine-et-tahte | Zighrîne et Tahte | Zighrîne et Tahte | محافظة بعلبك-الهرمل | PPL | missing_real_ar_name |
| zighrine | Zighrîne | Zighrîne | محافظة بعلبك-الهرمل | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| hai-ej-jamia | حي الجامع | Haï ej Jamia | religious_site_not_city | جامع(?!ة) |
| hai-ej-jamia | حي الجامع | Haï ej Jâmia | religious_site_not_city | جامع(?!ة) |
| hai-ej-jameaa | حي الجامع | Haï ej Jameaa | religious_site_not_city | جامع(?!ة) |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| zahle | zahle | slug |
| tripoli | tripoli-lb | en_name+coords (d=0.62km) |
| tyre | tyre-lb | ar_name+coords (d=0.00km) |
| sidon | saida | ar_name+coords (d=0.14km) |
| beirut | beirut | slug |
| mkatbe | saida | coords<1km (d=0.84km) |
| ed-dikermane | saida | coords<1km (d=0.63km) |
| er-rabatiye | saida | coords<1km (d=0.96km) |
| el-marj | saida | coords<1km (d=0.57km) |
| el-maqsaf | saida | coords<1km (d=0.88km) |

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
