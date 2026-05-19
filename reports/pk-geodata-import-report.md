# PK GeoNames Import Report (refined)

**Country**: Pakistan (باكستان)
**Generated**: 2026-05-19T06:44:10.408Z
**Phase**: `CURATED-GEODATA-PK-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/pk-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/pk-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/pk-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/pk-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 150394 |
| Normalized candidates                     | 145788 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **60** |
| **medium_confidence_pending**             | **0** |
| **low_confidence_pending**                | **495** |
| needs_review                              | 145143 |
| existing (matched, no action)             | 58 |
| rejected (bad data / religious site)      | 32 |
| Alias enrichment opps (in separate report) | 28 |

**Shortlist size (high + medium):** 60

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 32 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 51 |
| coords<1km | 6 |
| en_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rawalakot | rawla kwٹ | Rawalakot | المناطق القبلية | PPLA2 | 100 | 50000 | 68.63 | islamabad |
| umarkot | amrڪwٽ | Umarkot | السند | PPLA2 | 100 | 144558 | 139.09 | hyderabad-pk |
| turbat | تربت | Turbat | بلوشستان | PPLA2 | 100 | 75694 | 416.67 | karachi |
| sukkur | سکر | Sukkur | السند | PPLA2 | 100 | 563851 | 261.35 | hyderabad-pk |
| sibi | سبي | Sibi | بلوشستان | PPLA2 | 100 | 64069 | 112.18 | quetta |
| shekhupura | شيخوپوره | Shekhupura | البنجاب | PPLA2 | 100 | 591424 | 41.31 | lahore |
| sargodha | سرگودها | Sargodha | البنجاب | PPLA2 | 100 | 975886 | 83.01 | faisalabad |
| sahiwal | saہiwal | Sahiwal | البنجاب | PPLA2 | 100 | 538344 | 87.28 | faisalabad |
| rahim-yar-khan | رحيم يار خان | Rahim Yar Khan | البنجاب | PPLA2 | 100 | 517000 | 226.63 | multan |
| new-mirpur-city | nya myrpr shہr | New Mirpur City | المناطق القبلية | PPLA2 | 100 | 124352 | 82.54 | rawalpindi |
| muzaffargarh | مظفر گره، پاکستان | Muzaffargarh | البنجاب | PPLA2 | 100 | 235541 | 33.22 | multan |
| muzaffarabad | مظفر آباد | Muzaffarābād | المناطق القبلية | PPLA | 100 | 725000 | 85.62 | islamabad |
| mirpur-khas | ميرپور خاص | Mirpur Khas | السند | PPLA2 | 100 | 267833 | 67.34 | hyderabad-pk |
| jhelum | جهلم | Jhelum | البنجاب | PPLA2 | 100 | 190425 | 88.78 | sialkot |
| jacobabad | jyڪb abad | Jacobabad | السند | PPLA2 | 100 | 219315 | 254.32 | quetta |
| gwadar | جوادر | Gwadar | بلوشستان | PPLA2 | 100 | 70852 | 472.10 | karachi |
| gujranwala | gwjranwalہ | Gujranwala | البنجاب | PPLA2 | 100 | 2511118 | 49.15 | sialkot |
| gilgit | كلكت | Gilgit | إقليم العاصمة إسلام آباد | PPLA | 100 | 216760 | 273.95 | islamabad |
| dera-ghazi-khan | دیره غازی‌خان، پاکستان | Dera Ghazi Khan | البنجاب | PPLA2 | 100 | 494464 | 86.00 | multan |
| chitral | chھtrar | Chitral | خيبر بختونخوا | PPLA2 | 100 | 57157 | 205.62 | peshawar |
| chiniot | چنيوټ | Chiniot | البنجاب | PPLA2 | 100 | 318165 | 33.54 | faisalabad |
| skardu | سکردو | Skardu | إقليم العاصمة إسلام آباد | PPLA2 | 95 | 260000 | 297.22 | islamabad |
| mardan | مردان | Mardan | خيبر بختونخوا | PPLA2 | 95 | 300424 | 52.42 | peshawar |
| gujrat | گجرات | Gujrat | البنجاب | PPLA2 | 95 | 574240 | 42.88 | sialkot |
| dadu | دادُو | Dadu | السند | PPLA2 | 95 | 201017 | 159.31 | hyderabad-pk |
| bannu | بنوں | Bannu | خيبر بختونخوا | PPLA2 | 95 | 1357890 | 142.84 | peshawar |
| bahawalnagar | بہاولپور | Bahawalnagar | البنجاب | PPLA2 | 95 | 241873 | 161.85 | faisalabad |
| badin | بدين‎ | Badin | السند | PPLA2 | 95 | 117455 | 95.40 | hyderabad-pk |
| wazirabad | وزير آباد | Wazirabad | البنجاب | PPL | 85 | 102444 | 38.23 | sialkot |
| tordher | توردهر | Tordher | خيبر بختونخوا | PPL | 85 | 150000 | 70.24 | peshawar |
| shahdadpur | شهدادبور | Shahdadpur | السند | PPL | 85 | 67249 | 64.58 | hyderabad-pk |
| sambrial | سمبریال | Sambrial | البنجاب | PPL | 85 | 62874 | 16.00 | sialkot |
| rohri | rwھڙy | Rohri | السند | PPL | 85 | 50649 | 260.84 | hyderabad-pk |
| pattoki | پتوكى | Pattoki | البنجاب | PPL | 85 | 70436 | 73.49 | lahore |
| nankana-sahib | نانكانا صاحب | Nankana Sahib | البنجاب | PPL | 85 | 56366 | 54.22 | faisalabad |
| muridke | مريدکی | Muridke | البنجاب | PPL | 85 | 164246 | 32.80 | lahore |
| mingora | منگورا | Mingora | خيبر بختونخوا | PPL | 85 | 279914 | 114.60 | peshawar |
| matli | ماتلى | Matli | السند | PPL | 85 | 50398 | 49.41 | hyderabad-pk |
| mailsi | تصیل میلسی | Mailsi | البنجاب | PPL | 85 | 64545 | 74.01 | multan |
| lala-musa | lalہ mwsy | Lala Musa | البنجاب | PPL | 85 | 65197 | 57.75 | sialkot |
| kamalia | كماليا | Kamalia | البنجاب | PPL | 85 | 112426 | 92.93 | faisalabad |
| kabirwala | کبیر والا | Kabirwala | البنجاب | PPL | 85 | 60782 | 42.52 | multan |
| jhang-sadr | جانغ صدر | Jhang Sadr | البنجاب | PPL | 85 | 341210 | 80.23 | faisalabad |
| jaranwala | جرانوالا | Jaranwala | البنجاب | PPL | 85 | 119785 | 29.91 | faisalabad |
| jahangira | جهانگیرا | Jahangira | خيبر بختونخوا | PPL | 85 | 57011 | 64.42 | peshawar |
| hasilpur | حاصل پور | Hasilpur | البنجاب | PPL | 85 | 88031 | 111.15 | multan |
| gujar-khan | گجر خاں | Gujar Khan | البنجاب | PPL | 85 | 69374 | 43.68 | rawalpindi |
| gojra | جوجرا | Gojra | البنجاب | PPL | 85 | 139726 | 54.44 | faisalabad |
| dipalpur | ديپالپور | Dipalpur | البنجاب | PPL | 85 | 74640 | 99.84 | faisalabad |
| chunian | تصیل چونیاں | Chunian | البنجاب | PPL | 85 | 57312 | 71.41 | lahore |
| chishtian | ششتيان شريف | Chishtian | البنجاب | PPL | 85 | 122199 | 134.48 | multan |
| bhalwal | بالوال | Bhalwal | البنجاب | PPL | 85 | 74744 | 93.38 | faisalabad |
| ahmadpur-east | احمد پور | Ahmadpur East | البنجاب | PPL | 85 | 116579 | 115.76 | multan |
| kambar | قمبر | Kambar | السند | PPL | 80 | 77481 | 246.26 | hyderabad-pk |
| pasrur | پسرور | Pasrur | البنجاب | PPL | 80 | 53364 | 28.93 | sialkot |
| kotri | کوٹری | Kotri | السند | PPL | 80 | 72672 | 6.01 | hyderabad-pk |
| kharian | kھaryaں | Kharian | البنجاب | PPL | 80 | 81435 | 69.45 | sialkot |
| jamrud | جمرود | Jamrud | خيبر بختونخوا | PPL | 80 | 56513 | 13.44 | peshawar |
| chaman | چمن | Chaman | بلوشستان | PPL | 80 | 88568 | 96.10 | quetta |
| buni | بُنِی | Buni | خيبر بختونخوا | PPL | 80 | 50000 | 259.83 | peshawar |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

_(empty)_

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **495**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| jabbar |  | Jabbar | البنجاب | PPL | missing_real_ar_name |
| dhangdev-saiyidan |  | Dhangdev Saiyidan | البنجاب | PPL | missing_real_ar_name |
| dheri |  | Dheri | البنجاب | PPL | missing_real_ar_name |
| sohawa-mirza |  | Sohawa Mirza | البنجاب | PPL | missing_real_ar_name |
| mohra-bhutia |  | Mohra Bhutia | المناطق القبلية | PPL | missing_real_ar_name |
| mohra-kanial |  | Mohra Kanial | البنجاب | PPL | missing_real_ar_name |
| sui-hafizan |  | Sui Hafizan | البنجاب | PPL | missing_real_ar_name |
| kilawala-mohra |  | Kilawala Mohra | البنجاب | PPL | missing_real_ar_name |
| mohra-phadiaia |  | Mohra Phadiaia | البنجاب | PPL | missing_real_ar_name |
| mohra-muridan |  | Mohra Muridan | البنجاب | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| mianji-masjid |  | Mianji Masjid | religious_site_not_city | \bmasjid\b |
| maskat |  | Maskat | religious_site_not_city | \bmasjid\b |
| chak-sixteen-eight-b-right |  | Chak Sixteen -Eight B Right | religious_site_not_city | \bmasjid\b |
| goth-achhi-masjid |  | Goth Achhi Masjid | religious_site_not_city | \bmasjid\b |
| shaikh-taru-masjid |  | Shaikh Taru Masjid | religious_site_not_city | \bmasjid\b |
| goth-achhi-masjid |  | Goth Achhi Masjid | religious_site_not_city | \bmasjid\b |
| ali-masjid |  | Ali Masjid | religious_site_not_city | \bmasjid\b |
| chitti-masjid |  | Chitti Masjid | religious_site_not_city | \bmasjid\b |
| pakki-masjid |  | Pakki Masjid | religious_site_not_city | \bmasjid\b |
| baggi-masjid |  | Baggi Masjid | religious_site_not_city | \bmasjid\b |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| sialkot | sialkot | slug |
| sialkot | sialkot | slug |
| sialkot | sialkot | slug |
| rawalpindi | rawalpindi | slug |
| quetta | quetta | slug |
| peshawar | peshawar | slug |
| multan | multan | slug |
| maida-halim | islamabad | coords<1km (d=0.95km) |
| lahore | lahore | slug |
| karachi | karachi | slug |

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
