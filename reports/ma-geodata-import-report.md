# MA GeoNames Import Report (refined)

**Country**: Morocco (المغرب)
**Generated**: 2026-05-15T07:35:50.764Z
**Phase**: `CURATED-GEODATA-MA-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/ma-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/ma-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/ma-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/ma-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 46945 |
| Normalized candidates                     | 45718 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **42** |
| **medium_confidence_pending**             | **3** |
| **low_confidence_pending**                | **12** |
| needs_review                              | 45607 |
| existing (matched, no action)             | 47 |
| rejected (bad data / religious site)      | 7 |
| Alias enrichment opps (in separate report) | 47 |

**Shortlist size (high + medium):** 45

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 7 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 43 |
| coords<1km | 4 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tiznit | تزنيت | Tiznit | سوس-ماسة | PPLA3 | 100 | 81569 | 82.22 | agadir |
| taza | تازة | Taza | فاس-مكناس | PPLA2 | 100 | 162110 | 94.30 | fes |
| settat | سطات | Settat | الدار البيضاء-سطات | PPLA2 | 100 | 155333 | 63.66 | casablanca |
| safi | آسفي | Safi | مراكش-آسفي | PPLA2 | 100 | 336883 | 139.96 | marrakesh |
| oulmes | أولماس | Oulmes | الرباط-سلا-القنيطرة | PPLA3 | 100 | 19014 | 66.86 | meknes |
| ouarzazate | ورزازات | Ouarzazate | درعة-تافيلالت | PPLA2 | 100 | 77603 | 130.11 | marrakesh |
| nador | الناظور | Nador | الشرق | PPLA3 | 100 | 176600 | 107.98 | oujda |
| mohammedia | المحمدية | Mohammedia | الدار البيضاء-سطات | PPLA3 | 100 | 227799 | 22.90 | casablanca |
| larache | العرائش | Larache | طنجة-تطوان-الحسيمة | PPLA3 | 100 | 136505 | 69.38 | tangier |
| khenifra | خنيفرة | Khenifra | بني ملال-خنيفرة | PPLA3 | 100 | 128318 | 107.12 | meknes |
| ifrane | إفران | Ifrane | فاس-مكناس | PPLA3 | 100 | 73782 | 55.46 | fes |
| essaouira | الصويرة | Essaouira | مراكش-آسفي | PPLA3 | 100 | 85137 | 121.72 | agadir |
| berkane | بركان | Berkane | الشرق | PPLA3 | 100 | 119284 | 45.99 | oujda |
| azrou | أزرو | Azrou | فاس-مكناس | PPLA3 | 100 | 59348 | 59.30 | meknes |
| al-hoceima | الحسيمة | Al Hoceïma | طنجة-تطوان-الحسيمة | PPLA2 | 100 | 395644 | 134.68 | tetouan |
| errachidia | الرشيدية | Errachidia | درعة-تافيلالت | PPLA3 | 100 | 100870 | 238.28 | fes |
| taroudant | تارودانت | Taroudant | سوس-ماسة | PPLA3 | 95 | 87520 | 69.29 | agadir |
| tan-tan | طانطان | Tan-Tan | كلميم-واد نون | PPLA2 | 95 | 79942 | 264.94 | agadir |
| sidi-ifni | سيدي إفني | Sidi Ifni | سوس-ماسة | PPLA3 | 95 | 23606 | 129.04 | agadir |
| khouribga | خريبكة | Khouribga | بني ملال-خنيفرة | PPLA3 | 95 | 214241 | 99.81 | casablanca |
| goulmima | كلميمة | Goulmima | درعة-تافيلالت | PPLA3 | 95 | 17929 | 251.00 | meknes |
| debdou | دبدو | Debdou | الشرق | PPLA3 | 95 | 5416 | 129.95 | oujda |
| chefchaouen | شفشاون | Chefchaouen | طنجة-تطوان-الحسيمة | PPLA2 | 95 | 46721 | 46.54 | tetouan |
| smara | السمارة | Smara | العيون-الساقية الحمراء | PPL | 85 | 42056 | 457.47 | agadir |
| aousserd | آوسرد | Aousserd | الداخلة-وادي الذهب | PPL | 85 | 5832 | 993.82 | agadir |
| touissite | تويسيت | Touissite | الشرق | PPL | 85 | 3425 | 25.95 | oujda |
| tarfaya | طرفاية | Tarfaya | العيون-الساقية الحمراء | PPL | 85 | 5615 | 425.34 | agadir |
| reggada | الرقادة | Reggada | سوس-ماسة | PPLA3 | 85 | - | 94.77 | agadir |
| marzouga | مرزوقه | Marzouga | درعة-تافيلالت | PPL | 85 | 500 | 337.69 | fes |
| lake-lalla-takerkoust | لالا ٹاکیرکوسٹ | Lake Lalla Takerkoust | مراكش-آسفي | PPL | 85 | 4455 | 33.09 | marrakesh |
| el-jadida | الجديدة | El Jadida | الدار البيضاء-سطات | PPL | 85 | 212863 | 92.26 | casablanca |
| asilah | أصيلة | Asilah | طنجة-تطوان-الحسيمة | PPL | 85 | 34011 | 37.39 | tangier |
| ajdir | أجدير | Ajdir | طنجة-تطوان-الحسيمة | PPL | 85 | 5802 | 138.75 | tetouan |
| imlili | إمليلي | Imlili | الداخلة-وادي الذهب | PPL | 85 | 2269 | 1050.31 | agadir |
| tameslouht | تامصلوحت | Tameslouht | مراكش-آسفي | PPL | 80 | 9929 | 18.62 | marrakesh |
| sidi-kacem | سدي قاسم | Sidi Kacem | الرباط-سلا-القنيطرة | PPL | 80 | 82632 | 39.35 | meknes |
| sale | سلا | Salé | الرباط-سلا-القنيطرة | PPL | 80 | 972299 | 5.36 | rabat |
| khemis-sahel | خميس الساحل | Khemis Sahel | طنجة-تطوان-الحسيمة | PPL | 80 | 6816 | 60.50 | tangier |
| foum-zguid | فم زكيد | Foum Zguid | سوس-ماسة | PPL | 80 | 9812 | 201.51 | marrakesh |
| figuig | مركز فكيك | Figuig | الشرق | PPL | 80 | 12516 | 292.93 | oujda |
| boujniba | ابي الجعد (البلدية) | Boujniba | بني ملال-خنيفرة | PPL | 80 | 17504 | 106.50 | casablanca |
| douar-sfari | قرية الفيتنام | Douar Sfari | الرباط-سلا-القنيطرة | PPL | 80 | 340 | 24.94 | kenitra |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| touggana | توكانة | Touggana | مراكش-آسفي | PPL | 70 | 8.61 |
| douar-oulad-nouil | أولاد نوال | Douar Oulad Nouil | الرباط-سلا-القنيطرة | PPL | 70 | 76.88 |
| wawizaght | واويزجت | Wawizaght | بني ملال-خنيفرة | PPL | 70 | 164.54 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **12**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| lgli | lgli | lgli | بني ملال-خنيفرة | PPL | missing_real_ar_name |
| ozlaba | Ozlaba | Ozlaba | طنجة-تطوان-الحسيمة | PPL | missing_real_ar_name |
| zrok | Zrok | Zrok | الرباط-سلا-القنيطرة | PPL | missing_real_ar_name |
| zrit | Zrit | Zrit | مراكش-آسفي | PPL | missing_real_ar_name |
| douar-zri-ouled | Douar Zri Ouled | Douar Zri Ouled | الرباط-سلا-القنيطرة | PPL | missing_real_ar_name |
| zriouila | Zriouila | Zriouila | كلميم-واد نون | PPL | missing_real_ar_name |
| zrigat | Zrigat | Zrigat | درعة-تافيلالت | PPL | missing_real_ar_name |
| zribt | Zribt | Zribt | مراكش-آسفي | PPL | missing_real_ar_name |
| zriba | Zriba | Zriba | مراكش-آسفي | PPL | missing_real_ar_name |
| az-zrazra | Az Zrazra | Az Zrazra | مراكش-آسفي | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| zaouia-taleb | Zaouia Taleb | Zaouia Taleb | religious_site_not_city | \bkaaba\b |
| ksebt-ait-hamed-ben-ali | Ksebt Aït Hamed Ben Ali | Ksebt Aït Hamed Ben Ali | religious_site_not_city | \bkaaba\b |
| ksabt-el-kaaba | Ksabt el Kaaba | Ksabt el Kaaba | religious_site_not_city | \bkaaba\b |
| douar-leghoual | Douar Leghoual | Douar Leghoual | religious_site_not_city | \bkaaba\b |
| mosque-saadiyline | Mosque Saadiyline | Mosque Saadiyline | religious_site_not_city | \bmosque\b |
| douar-bou-kaaba | Douar Bou Kaaba | Douar Bou Kaaba | religious_site_not_city | \bkaaba\b |
| douar-bou-kaaba | Douar Bou Kaaba | Douar Bou Kaaba | religious_site_not_city | \bkaaba\b |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tetouan | tetouan | slug |
| tangier | tangier | slug |
| rabat | rabat | slug |
| oujda | oujda | slug |
| meknes | meknes | slug |
| marrakesh | marrakesh | slug |
| kenitra | kenitra | slug |
| fes | fes | slug |
| el-menzeh | meknes | coords<1km (d=0.48km) |
| casablanca | casablanca | slug |

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
