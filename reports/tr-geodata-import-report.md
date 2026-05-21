# TR GeoNames Import Report (refined)

**Country**: Turkey (تركيا)
**Generated**: 2026-05-21T07:45:45.576Z
**Phase**: `CURATED-GEODATA-TR-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/tr-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/tr-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/tr-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/tr-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 54597 |
| Normalized candidates                     | 52786 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **74** |
| **medium_confidence_pending**             | **0** |
| **low_confidence_pending**                | **778** |
| needs_review                              | 51912 |
| existing (matched, no action)             | 21 |
| rejected (bad data / religious site)      | 1 |
| Alias enrichment opps (in separate report) | 17 |

**Shortlist size (high + medium):** 74

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 1 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 18 |
| coords<1km | 3 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| yozgat | ywzګat | Yozgat | يوزغات | PPLA | 100 | 87881 | 134.26 | kayseri |
| van | وان | Van | فان | PPLA | 100 | 525016 | 239.95 | erzurum |
| usak | أوشاك | Uşak | أوشاك | PPLA | 100 | 369433 | 171.04 | bursa |
| tunceli | تنجیلی | Tunceli | تونجلي | PPLA | 100 | 35161 | 144.68 | diyarbakir |
| tarsus | تارسوس | Tarsus | إسبارطة | PPLA2 | 100 | 350732 | 25.25 | mersin |
| sivas | سيواس | Sivas | سيواس | PPLA | 100 | 264022 | 174.13 | kayseri |
| silifke | سلوکیه | Silifke | إسبارطة | PPLA2 | 100 | 132665 | 79.48 | mersin |
| siirt | سعرد | Siirt | بارتن | PPLA | 100 | 114034 | 150.07 | diyarbakir |
| samandag | السويدية | Samandağ | هاتاي | PPLA2 | 100 | 123447 | 117.83 | adana |
| nigde | نيغدة | Niğde | شرناق | PPLA | 100 | 91039 | 110.01 | kayseri |
| nevsehir | نو شہر | Nevşehir | نوشهر | PPLA | 100 | 75527 | 67.58 | kayseri |
| mus | موش | Muş | موش | PPLA | 100 | 82536 | 131.22 | erzurum |
| mugla | مغلا | Muğla | موغلا | PPLA | 100 | 92328 | 172.22 | izmir |
| mardin | ماردن | Mardin | باتمان | PPLA | 100 | 129864 | 80.70 | diyarbakir |
| malatya | مالاطیہ | Malatya | ملاطية | PPLA | 100 | 750491 | 139.01 | sanliurfa |
| kuetahya | kwtaہya | Kütahya | كوتاهيا | PPLA | 100 | 185008 | 115.89 | bursa |
| kirsehir | قر شهر | Kırşehir | قرشهر | PPLA | 100 | 150700 | 122.71 | kayseri |
| kirikkale | قیریق قلعہ | Kırıkkale | كيليس | PPLA | 100 | 186960 | 56.04 | ankara |
| karaman | قرامان | Karaman | كارابوك | PPLA | 100 | 175390 | 100.19 | konya |
| agri | آغری | Ağrı | أغري | PPLA | 100 | 124483 | 152.60 | erzurum |
| kahramanmaras | قهرمان مراش | Kahramanmaraş | كهرمان مرعش | PPLA | 100 | 384953 | 70.40 | gaziantep |
| isparta | إسبرطة | Isparta | مرسين | PPLA | 100 | 172334 | 97.51 | antalya |
| iskenderun | إسكندرونة | İskenderun | هاتاي | PPLA2 | 100 | 251682 | 88.69 | adana |
| eskisehir | أسكي شهر | Eskişehir | إسكي شهر | PPLA | 100 | 921630 | 132.52 | bursa |
| erzincan | أرزينجان | Erzincan | أرزنجان | PPLA | 100 | 150714 | 141.81 | trabzon |
| elazig | الازیغ | Elazığ | إلازيغ | PPLA | 100 | 443363 | 121.94 | diyarbakir |
| denizli | دنيزلي | Denizli | دنيزلي | PPLA | 100 | 313238 | 173.71 | antalya |
| hakkari | هكاري | Hakkâri | كرامان | PPLA | 100 | 77699 | 310.93 | diyarbakir |
| burdur | بردود | Burdur | بوردور | PPLA | 100 | 95436 | 98.89 | antalya |
| bitlis | بتليس | Bitlis | بتليس | PPLA | 100 | 53023 | 172.82 | diyarbakir |
| bingoel | بنگول | Bingöl | بينغول | PPLA | 100 | 128935 | 110.31 | diyarbakir |
| batman | ئێلح | Batman | إيغدير | PPLA | 100 | 452157 | 79.17 | diyarbakir |
| balikesir | بالِق أسير | Balıkesir | باليكسير | PPLA | 100 | 238151 | 116.77 | bursa |
| aydin | آیدن | Aydın | آيدن | PPLA | 100 | 163022 | 89.12 | izmir |
| antakya | antakyہ | Antakya | هاتاي | PPLA | 100 | 399045 | 115.55 | adana |
| alanya | آلانیا | Alanya | أنطاليا | PPLA2 | 100 | 364180 | 121.20 | antalya |
| aksaray | aksrayے | Aksaray | أرضاحان | PPLA | 100 | 327575 | 132.52 | kayseri |
| afyonkarahisar | أفيون قره حصار | Afyonkarahisar | أفيون قره حصار | PPLA | 100 | 251799 | 195.90 | konya |
| adiyaman | آدیامان | Adıyaman | أديامان | PPLA | 100 | 290883 | 81.50 | sanliurfa |
| tokat | توقات | Tokat | توكات | PPLA | 100 | 129702 | 198.70 | kayseri |
| tekirdag | تكيرداغ | Tekirdağ | تكيرداغ | PPLA | 100 | 122287 | 123.20 | istanbul |
| sinop | سينوب | Sinop | سينوب | PPLA | 100 | 34834 | 302.56 | ankara |
| samsun | سامسون | Samsun | سامسون | PPLA | 100 | 394050 | 284.83 | trabzon |
| rize | rayzے | Rize | ريزة | PPLA | 100 | 119828 | 67.50 | trabzon |
| ordu | أوردو | Ordu | أوردو | PPLA | 100 | 229214 | 153.39 | trabzon |
| kirklareli | قرقلر ايلي | Kırklareli | قيرق لار إيلي | PPLA | 100 | 58223 | 167.13 | istanbul |
| kastamonu | قسطموني | Kastamonu | قسطموني | PPLA | 100 | 125622 | 178.24 | ankara |
| izmit | إزميت | İzmit | كوجالي | PPLA | 100 | 196571 | 84.39 | istanbul |
| guemueshane | gmshkhanہ | Gümüşhane | بايبورت | PPLA | 100 | 39214 | 63.81 | trabzon |
| giresun | غيرسون | Giresun | غيرسون | PPLA | 100 | 125682 | 112.12 | trabzon |
| gebze | ضلع گیبزے | Gebze | كوجالي | PPLA2 | 100 | 281436 | 44.35 | istanbul |
| edirne | أدرنة | Edirne | أدرنة | PPLA | 100 | 180002 | 215.47 | istanbul |
| corum | جوروم | Çorum | تشوروم | PPLA | 100 | 269595 | 190.42 | ankara |
| corlu | تشورلو | Çorlu | تكيرداغ | PPLA2 | 100 | 202578 | 100.13 | istanbul |
| canakkale | تاناککالے | Çanakkale | تشاناك قلعة | PPLA | 100 | 143622 | 202.66 | izmir |
| bolu | بولو | Bolu | بولو | PPLA | 100 | 184682 | 138.75 | ankara |
| bilecik | بيله جك | Bilecik | بيليجيك | PPLA | 100 | 74457 | 78.20 | bursa |
| bayburt | بايبورت | Bayburt | يالوفا | PPLA | 100 | 48036 | 93.30 | trabzon |
| artvin | آرتوین | Artvin | أرتفين | PPLA | 100 | 25841 | 149.94 | erzurum |
| amasya | آماسیه | Amasya | أماسيا | PPLA | 100 | 114921 | 215.87 | kayseri |
| adapazari | آدابازاري | Adapazarı | سكاريا | PPLA | 100 | 286787 | 122.42 | istanbul |
| nazilli | نازیلی | Nazilli | آيدن | PPLA2 | 95 | 119370 | 118.38 | izmir |
| osmaniye | عثمانية | Osmaniye |  | PPLA | 80 | 202837 | 82.65 | adana |
| kilis | كلس | Kilis |  | PPLA | 80 | 111648 | 45.66 | gaziantep |
| igdir | اغدير | Iğdır |  | PPLA | 80 | 101700 | 236.69 | erzurum |
| zonguldak | زانگولداک | Zonguldak |  | PPLA | 80 | 101749 | 191.25 | ankara |
| yalova | yalwwہ | Yalova |  | PPLA | 80 | 71289 | 46.62 | istanbul |
| ueskuedar | اسکدار | Üsküdar | إسطنبول | PPL | 80 | 524452 | 3.37 | istanbul |
| kars | قارص | Kars |  | PPLA | 80 | 91450 | 172.53 | erzurum |
| karabuek | قره بوک | Karabük |  | PPLA | 80 | 125403 | 142.73 | ankara |
| duezce | دوزجة | Düzce |  | PPLA | 80 | 194097 | 175.40 | ankara |
| cankiri | جانقري | Çankırı |  | PPLA | 80 | 90564 | 98.00 | ankara |
| bartin | بارتن | Bartın |  | PPLA | 80 | 81692 | 194.34 | ankara |
| ardahan | أرداهان | Ardahan |  | PPLA | 80 | 22927 | 180.90 | erzurum |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

_(empty)_

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **778**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| kultak |  | Kultak | موغلا | PPL | missing_real_ar_name |
| adiguezel |  | Adıgüzel | بارتن | PPL | missing_real_ar_name |
| bayirli |  | Bayırlı | أديامان | PPL | missing_real_ar_name |
| zurava |  | Zurava | عثمانية | PPL | missing_real_ar_name |
| zuran |  | Zuran | عثمانية | PPL | missing_real_ar_name |
| demre |  | Demre | أنطاليا | PPLA2 | missing_real_ar_name |
| karaisa |  | Karaisa | أنطاليا | PPL | missing_real_ar_name |
| doluca |  | Doluca | أرزنجان | PPL | missing_real_ar_name |
| zuelfikar |  | Zülfikar |  | PPL | missing_real_ar_name |
| isik |  | Işık | ديار بكر | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| camili | جامع‌لی | Camili | religious_site_not_city | جامع(?!ة) |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| sanliurfa | sanliurfa | slug |
| mersin | mersin | slug |
| konya | konya | slug |
| kayseri | kayseri | slug |
| kayseri | kayseri | slug |
| izmir | izmir | slug |
| gaziantep | gaziantep | slug |
| erzurum | erzurum | slug |
| diyarbakir | diyarbakir | slug |
| antalya | antalya | slug |

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
