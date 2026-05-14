# SY GeoNames Import Report (refined)

**Country**: Syria (سوريا)
**Generated**: 2026-05-14T17:12:20.114Z
**Phase**: `CURATED-GEODATA-SY-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/sy-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/sy-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/sy-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/sy-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 11741 |
| Normalized candidates                     | 10809 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **278** |
| **medium_confidence_pending**             | **1454** |
| **low_confidence_pending**                | **7882** |
| needs_review                              | 1166 |
| existing (matched, no action)             | 22 |
| rejected (bad data / religious site)      | 7 |
| Alias enrichment opps (in separate report) | 22 |

**Shortlist size (high + medium):** 1732

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 7 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| slug | 15 |
| ar_name+coords | 4 |
| coords<1km | 3 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tallkalakh | تل كلخ | Tallkalakh | محافظة حمص | PPLA2 | 100 | 29754 | 42.09 | homs |
| shaykh-miskin | الشيخ مسكين | Shaykh Miskīn | محافظة درعا | PPLA3 | 100 | 25920 | 23.66 | daraa |
| shathah | شطحة | Shaţḩah | محافظة حماة | PPLA3 | 100 | 8076 | 41.48 | maarat-al-numan |
| as-salamiyah | السلمية | As Salamīyah | محافظة حماة | PPLA2 | 100 | 94887 | 30.04 | hama |
| safita | برج صافيتا | Şāfītā | محافظة طرطوس | PPLA2 | 100 | 27815 | 22.67 | tartus |
| nawa | نوا | Nawá | محافظة درعا | PPLA3 | 100 | 47066 | 30.40 | daraa |
| mukharram-al-fawqani | المخرم الفوقاني | Mukharram al Fawqānī | محافظة حمص | PPLA2 | 100 | 9112 | 35.30 | homs |
| maharda | الكرمة | Maharda | محافظة حماة | PPLA2 | 100 | 17578 | 21.22 | hama |
| ma-arratmisrin | معرة مصرين | Ma‘arratmişrīn | محافظة إدلب | PPLA3 | 100 | 32163 | 9.36 | idlib |
| kafr-zayta | الزيتية | Kafr Zaytā | محافظة حماة | PPLA3 | 100 | 21845 | 30.39 | hama |
| kafranbel | كفر نبل | Kafranbel | محافظة إدلب | PPLA3 | 100 | 45652 | 10.07 | maarat-al-numan |
| jindayris | جنديرس | Jindayris | محافظة حلب | PPLA3 | 100 | 13661 | 38.48 | azaz |
| ad-duraykish | الدريكيش | Ad Duraykīsh | محافظة طرطوس | PPLA2 | 100 | 11918 | 23.38 | tartus |
| ad-darbasiyah | الدرباسية | Ad Darbāsīyah | محافظة الحسكة | PPLA3 | 100 | 21481 | 51.42 | qamishli |
| darayya | داريا | Dārayyā | محافظة ريف دمشق | PPLA2 | 100 | 71596 | 7.39 | damascus |
| busra-ash-sham | بصرى | Buşrá ash Shām | محافظة درعا | PPLA3 | 100 | 1000 | 22.80 | as-suwayda |
| babila | باب بيلا | Babīlā | محافظة ريف دمشق | PPLA3 | 100 | 50880 | 6.92 | damascus |
| al-tabqa | الثورة | Al-Tabqa | محافظة الرقة | PPLA2 | 100 | 87880 | 43.33 | raqqa |
| as-sanamayn | الصنمين | Aş Şanamayn | محافظة درعا | PPLA2 | 100 | 25702 | 49.90 | damascus |
| as-safirah | السفيرة | As Safīrah | محافظة حلب | PPLA2 | 100 | 63708 | 25.52 | aleppo |
| amuda | عامودا | ‘Āmūdā | محافظة الحسكة | PPLA3 | 100 | 26821 | 27.31 | qamishli |
| al-qutayfah | القطيفة | Al Quţayfah | محافظة ريف دمشق | PPLA2 | 100 | 16118 | 39.05 | damascus |
| al-mayadin | الميادين | Al Mayādīn | محافظة دير الزور | PPLA2 | 100 | 54534 | 45.07 | deir-ez-zor |
| al-malikiyah | dێryk | Al Mālikīyah | محافظة الحسكة | PPLA2 | 100 | 26311 | 81.78 | qamishli |
| al-kiswah | الكسوة | Al Kiswah | محافظة ريف دمشق | PPLA3 | 100 | 23526 | 17.61 | damascus |
| albu-kamal | أبو كمال | Ālbū Kamāl | محافظة دير الزور | PPLA2 | 100 | 57572 | 121.17 | deir-ez-zor |
| yabrud | يبرود | Yabrūd | محافظة ريف دمشق | PPLA2 | 95 | 40502 | 61.68 | damascus |
| tall-rif-at | تل رفعت | Tall Rif‘at | محافظة حلب | PPLA3 | 95 | 25658 | 13.45 | azaz |
| tallbisah | تلبيسة | Tallbīsah | محافظة حمص | PPLA3 | 95 | 38491 | 12.15 | homs |
| tadmur | تدمر | Tadmur | محافظة حمص | PPLA2 | 95 | 51015 | 144.88 | homs |
| suran | صوران | Şūrān | محافظة حماة | PPLA3 | 95 | 30716 | 17.83 | hama |
| shaqqa | شقّا | Shaqqā | محافظة السويداء | PPLA3 | 95 | 5116 | 24.20 | as-suwayda |
| shahba | شهبا | Shahbā | محافظة السويداء | PPLA2 | 95 | 14784 | 16.91 | as-suwayda |
| salqin | سلقين | Salqīn | محافظة إدلب | PPLA3 | 95 | 31608 | 28.03 | idlib |
| salkhad | صلخد | Şalkhad | محافظة السويداء | PPLA2 | 95 | 9155 | 27.72 | as-suwayda |
| sahnaya | صحنايا | Şaḩnāyā | محافظة ريف دمشق | PPLA3 | 95 | 30519 | 10.92 | damascus |
| qatana | قطنا | Qaţanā | محافظة ريف دمشق | PPLA2 | 95 | 18511 | 20.19 | damascus |
| jasim | جاسم | Jāsim | محافظة درعا | PPLA3 | 95 | 30283 | 41.62 | daraa |
| nubl | نبل | Nubl | محافظة حلب | PPLA3 | 95 | 25546 | 23.37 | aleppo |
| masyaf | مصياف | Maşyāf | محافظة حماة | PPLA2 | 95 | 32262 | 38.67 | hama |
| ma-lula | معلولا | Ma‘lūlā | محافظة ريف دمشق | PPLA3 | 95 | 5000 | 44.46 | damascus |
| khan-shaykhun | خان شيخون | Khān Shaykhūn | محافظة إدلب | PPLA3 | 95 | 48975 | 22.42 | maarat-al-numan |
| kafr-takharim | كفر تخاريم | Kafr Takhārīm | محافظة إدلب | PPLA3 | 95 | 22436 | 23.00 | idlib |
| jisr-ash-shughur | جسر الشغور | Jisr ash Shughūr | محافظة إدلب | PPLA2 | 95 | 39311 | 31.20 | idlib |
| jayrud | جيرود | Jayrūd | محافظة ريف دمشق | PPLA3 | 95 | 32352 | 53.78 | damascus |
| jaramana | جرمانا | Jaramānā | محافظة ريف دمشق | PPLA3 | 95 | 99999 | 7.15 | damascus |
| jarabulus | جرابلس | Jarābulus | محافظة حلب | PPLA2 | 95 | 24997 | 32.54 | manbij |
| izra | ازرع | Izra‘ | محافظة درعا | PPLA2 | 95 | 13882 | 30.75 | daraa |
| irbin | عربين | ‘Irbīn | محافظة ريف دمشق | PPLA3 | 95 | 42474 | 8.72 | damascus |
| harasta | حرستا | Ḩarastā | محافظة ريف دمشق | PPLA3 | 95 | 37348 | 9.61 | damascus |
| duma | دوما | Dūmā | محافظة ريف دمشق | PPLA2 | 95 | 111864 | 13.35 | damascus |
| dayr-hafir | دير حافر | Dayr Ḩāfir | محافظة حلب | PPLA3 | 95 | 28905 | 29.24 | al-bab |
| dail | داعل | Dā‘il | محافظة درعا | PPLA3 | 95 | 29408 | 15.15 | daraa |
| binnish | بنش | Binnish | محافظة إدلب | PPLA3 | 95 | 30354 | 7.70 | idlib |
| baniyas | بانياس | Bāniyās | محافظة طرطوس | PPLA2 | 95 | 39066 | 32.30 | tartus |
| az-zabadani | الزبداني | Az Zabadānī | محافظة ريف دمشق | PPLA2 | 95 | 29549 | 28.57 | damascus |
| at-tall | التل | At Tall | محافظة ريف دمشق | PPLA2 | 95 | 55561 | 11.19 | damascus |
| as-susah | السوسة | As Sūsah | محافظة دير الزور | PPLA3 | 95 | 8797 | 116.21 | deir-ez-zor |
| ar-rastan | الرستن | Ar Rastan | محافظة حمص | PPLA2 | 95 | 53152 | 21.67 | homs |
| an-nabk | النبك | An Nabk | محافظة ريف دمشق | PPLA2 | 95 | 49372 | 70.46 | damascus |
| al-qusayr | القصير | Al Quşayr | محافظة حمص | PPLA2 | 95 | 41062 | 27.80 | homs |
| al-qurayya | القريا | Al Qurayyā | محافظة السويداء | PPLA3 | 95 | 6789 | 18.70 | as-suwayda |
| al-qaryatayn | القريتين | Al Qaryatayn | محافظة حمص | PPLA3 | 95 | 31748 | 73.89 | homs |
| al-musayfirah | المسيفرة | Al Musayfirah | محافظة درعا | PPLA3 | 95 | 10466 | 21.96 | daraa |
| al-hirak | الحراك | Al Ḩirāk | محافظة درعا | PPLA3 | 95 | 23784 | 23.69 | daraa |
| afrin | عفرين | ‘Afrīn | محافظة حلب | PPLA2 | 95 | 48693 | 17.91 | azaz |
| ad-dana | الدانا | Ad Dānā | محافظة إدلب | PPLA3 | 95 | 21987 | 32.71 | aleppo |
| hajin | هجين | Hajīn | محافظة دير الزور | PPLA3 | 95 | 29237 | 95.02 | deir-ez-zor |
| al-karamah | الكرامة | Al Karāmah | محافظة الرقة | PPLA3 | 85 | - | 26.07 | raqqa |
| ariqah | تل عمار | ‘Arīqah | محافظة السويداء | PPLA3 | 85 | - | 21.52 | as-suwayda |
| as-surah-as-saghirah | الصورة الصغرى | Aş Şūrah aş Şaghīrah | محافظة السويداء | PPLA3 | 85 | - | 35.92 | as-suwayda |
| muh-hasan | موح حسن | Mūḩ Ḩasan | محافظة دير الزور | PPLA3 | 85 | - | 19.59 | deir-ez-zor |
| tall-tamr | تل تامر | Tall Tamr | محافظة الحسكة | PPLA3 | 85 | - | 37.16 | al-hasakah |
| tall-salhab | تل سلحب | Tall Salḩab | محافظة حماة | PPLA3 | 85 | - | 36.73 | hama |
| talldaww | تل دو | Talldaww | محافظة حمص | PPLA3 | 85 | - | 23.58 | homs |
| tall-ad-daman | تل الضمان | Tall aḑ Ḑamān | محافظة حلب | PPLA3 | 85 | - | 40.63 | saraqib |
| as-suqaylibiyah | السقيلبية | As Suqaylibīyah | محافظة حماة | PPLA2 | 85 | - | 39.62 | maarat-al-numan |
| subaykhan | سبيخان | Subaykhān | محافظة دير الزور | PPL | 85 | 25514 | 68.00 | deir-ez-zor |
| sirrin-ash-shamaliyah | سرين الشمالية | Şirrīn ash Shamālīyah | محافظة حلب | PPLA3 | 85 | - | 31.31 | manbij |
| sharan | شران | Sharān | محافظة حلب | PPLA3 | 85 | - | 10.65 | azaz |
| suluk | سلوق | Sulūk | محافظة الرقة | PPLA3 | 85 | - | 72.35 | raqqa |
| ar-riqama | الرقاما | Ar Riqāmā | محافظة حمص | PPLA3 | 85 | - | 28.58 | homs |
| rasm-al-harmal | رسم الحرمل | Rasm al Ḩarmal | محافظة حلب | PPLA3 | 85 | - | 22.64 | al-bab |
| al-qutaylibiyah | القطيلبية | Al Quţaylibīyah | محافظة اللاذقية | PPLA3 | 85 | - | 32.83 | latakia |
| qurqina | قورقنيا | Qūrqīnā | محافظة إدلب | PPLA3 | 85 | - | 22.89 | idlib |
| al-qahtaniyah | القحطانية | Al Qaḩţānīyah | محافظة الحسكة | PPLA3 | 85 | - | 28.08 | qamishli |
| qastal-ma-af | قسطل المعاف | Qasţal Ma‘āf | محافظة اللاذقية | PPLA3 | 85 | - | 37.52 | latakia |
| al-qamsiyah | القمصية | Al Qamşīyah | محافظة طرطوس | PPLA3 | 85 | - | 19.24 | tartus |
| qal-at-al-hisn | دژ کردان | Qal`at al Ḩişn | محافظة حمص | PPL | 85 | 356 | 37.27 | tartus |
| al-muzayri-ah | المزيرعة | Al Muzayri‘ah | محافظة اللاذقية | PPLA3 | 85 | - | 26.20 | latakia |
| al-jala | الجلاء | Al Jalā’ | محافظة دير الزور | PPLA3 | 85 | - | 100.80 | deir-ez-zor |
| al-yarmuk | اردوگاه یرموک | al-Yarmūk | محافظة دمشق | PPL | 85 | 99999 | 5.42 | damascus |
| muhambal | محمبل | Muḩambal | محافظة إدلب | PPLA3 | 85 | - | 21.78 | idlib |
| mu-aysirah | معيصرة | Mu‘ayşirah | محافظة حلب | PPL | 85 | 2 | 18.45 | manbij |
| maskanah | بالس | Maskanah | محافظة حلب | PPLA3 | 85 | - | 63.03 | manbij |
| masadah | المسعدة | Mas‘adah | محافظة القنيطرة | PPLA3 | 85 | - | 57.62 | damascus |
| markadah | مرقدا | Markadah | محافظة الحسكة | PPLA3 | 85 | - | 71.77 | deir-ez-zor |
| ma-dan | معدان | Ma‘dān | محافظة الرقة | PPLA3 | 85 | - | 57.58 | raqqa |
| al-ma-batli | المعبطلي | Al Ma‘baţlī | محافظة حلب | PPLA3 | 85 | - | 27.29 | azaz |
| rabi-ah | ربيعة | Rabī‘ah | محافظة اللاذقية | PPLA3 | 85 | - | 37.94 | latakia |
| qabbasin | خربة السودة | Qabbāsīn | محافظة حلب | PPL | 85 | 12000 | 30.39 | manbij |
| al-qabw | القبو | Al Qabw | محافظة حمص | PPLA3 | 85 | - | 26.65 | homs |
| khirbat-al-ma-azzah | خربة المعزة | Khirbat al Ma‘azzah | محافظة طرطوس | PPLA3 | 85 | - | 14.54 | tartus |
| khirbat-ghazalah | خربة الغزالة | Khirbat Ghazālah | محافظة درعا | PPLA3 | 85 | - | 15.77 | daraa |
| khan-arnabah | خان أرنبة | Khān Arnabah | محافظة القنيطرة | PPLA3 | 85 | - | 51.23 | damascus |
| al-khafsah | الخفسة | Al Khafsah | محافظة حلب | PPLA3 | 85 | - | 33.58 | manbij |
| al-ghandurah | العلكانة | Al Ghandūrah | محافظة حلب | PPLA3 | 85 | - | 25.34 | manbij |
| ras-al-khashufah | الكشفة | Ra’s al Khashūfah | محافظة طرطوس | PPLA3 | 85 | - | 16.91 | tartus |
| al-karimah | الكريمة | Al Karīmah | محافظة طرطوس | PPLA3 | 85 | - | 30.52 | tartus |
| kafr-laha | الحولة‎‎ | Kafr Lāhā | محافظة حمص | PPL | 85 | 21819 | 26.86 | homs |
| kafr-buhum | الغانية | Kafr Buhum | محافظة حماة | PPL | 85 | 12194 | 9.64 | hama |
| judaydat-yabus | جديدة | Judaydat Yābūs | محافظة ريف دمشق | PPL | 85 | 994 | 32.15 | damascus |
| al-jizah | الجيزة | Al Jīzah | محافظة درعا | PPLA3 | 85 | - | 20.37 | daraa |
| ar-ra-i | الراعي | Ar Rā‘ī | محافظة حلب | PPLA3 | 85 | - | 27.59 | al-bab |
| al-jarniyah | الجرنية | Al Jarnīyah | محافظة الرقة | PPLA3 | 85 | - | 47.88 | manbij |
| lislamin | سلامين | Lislāmīn | محافظة إدلب | PPL | 85 | 1022 | 8.62 | saraqib |
| hisya | حسيا | Ḩisyā’ | محافظة حمص | PPLA3 | 85 | - | 35.87 | homs |
| al-hadir | الحاضر | Al Ḩāḑir | محافظة حلب | PPLA3 | 85 | - | 24.72 | aleppo |
| al-furqlus | الفرقلس | Al Furqlus | محافظة حمص | PPLA3 | 85 | - | 36.94 | homs |
| ad-dumayr | الضمير | Aḑ Ḑumayr | محافظة ريف دمشق | PPLA3 | 85 | - | 41.27 | damascus |
| dhiban | ديبان | Dhībān | محافظة دير الزور | PPLA3 | 85 | - | 48.98 | deir-ez-zor |
| darat-izzah | دار تعزة | Dārat ‘Izzah | محافظة حلب | PPLA3 | 85 | - | 26.84 | aleppo |
| buqata | بقعاتا | Buq‘ātā | محافظة القنيطرة | PPL | 85 | 6528 | 57.81 | damascus |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة طرطوس | PPLA3 | 85 | - | 19.74 | tartus |
| batabo | باتبو | Batabo | محافظة حلب | PPL | 85 | 25560 | 24.33 | idlib |
| az-zarbah | الزربة | Az Zarbah | محافظة حلب | PPLA3 | 85 | - | 20.37 | aleppo |
| ayyubiyah | أيوبية | Ayyūbīyah | محافظة حماة | PPL | 85 | 1980 | 11.18 | hama |
| at-tawahin | الطواحين | Aţ Ţawāḩīn | محافظة طرطوس | PPLA3 | 85 | - | 39.42 | tartus |
| at-tamani-ah | التمانعة | At Tamāni‘ah | محافظة إدلب | PPLA3 | 85 | - | 21.72 | maarat-al-numan |
| as-sisniyah | السيسنية | As Sīsnīyah | محافظة طرطوس | PPLA3 | 85 | - | 26.65 | tartus |
| as-sawda | السودا | As Sawdā | محافظة طرطوس | PPLA3 | 85 | - | 10.86 | tartus |
| as-safsafah | الصفصافة | Aş Şafşāfah | محافظة طرطوس | PPLA3 | 85 | - | 23.49 | tartus |
| ash-shaykh-badr | الشيخ بدر | Ash Shaykh Badr | محافظة طرطوس | PPLA2 | 85 | - | 20.86 | tartus |
| ash-shaddadah | الشدادة | Ash Shaddādah | محافظة الحسكة | PPLA3 | 85 | - | 50.51 | al-hasakah |
| ar-ruhaybah | الرحيبة | Ar Ruḩaybah | محافظة ريف دمشق | PPLA3 | 85 | - | 47.15 | damascus |
| al-qardahah | القرداحة | Al Qardāḩah | محافظة اللاذقية | PPLA2 | 85 | - | 26.05 | latakia |
| al-mushannaf | المشنف | Al Mushannaf | محافظة السويداء | PPLA3 | 85 | - | 19.95 | as-suwayda |
| mismiyah | المسمية | Mismīyah | محافظة درعا | PPLA3 | 85 | - | 44.16 | damascus |
| an-nasirah | الناصرة | An Nāşirah | محافظة حمص | PPLA3 | 85 | - | 38.34 | tartus |
| al-janudiyah | الجانودية | Al Jānūdīyah | محافظة إدلب | PPLA3 | 85 | - | 31.29 | idlib |
| al-hinadi | الهنادي | Al Hinādī | محافظة اللاذقية | PPLA3 | 85 | - | 8.45 | latakia |
| al-hawash | الحواش | Al Ḩawāsh | محافظة حمص | PPLA3 | 85 | - | 35.99 | homs |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة حماة | PPLA3 | 85 | - | 36.13 | hama |
| al-hamidiyah | الحميدية | Al Ḩamīdīyah | محافظة طرطوس | PPLA3 | 85 | - | 21.02 | tartus |
| al-ghizlaniyah | الغزلانية | Al Ghizlānīyah | محافظة ريف دمشق | PPLA3 | 85 | - | 21.06 | damascus |
| al-bariqiyah | البارقية | Al Bāriqīyah | محافظة طرطوس | PPLA3 | 85 | - | 32.07 | tartus |
| al-atarib | اتارب | Al Atārib | محافظة حلب | PPLA3 | 85 | - | 28.63 | aleppo |
| al-asharah | الأشارة | Al ‘Ashārah | محافظة دير الزور | PPLA3 | 85 | - | 59.81 | deir-ez-zor |
| al-arimah | العريمة | Al ‘Arīmah | محافظة حلب | PPLA3 | 85 | - | 21.58 | al-bab |
| al-annazah | العنازة | Al ‘Annāzah | محافظة طرطوس | PPLA3 | 85 | - | 37.04 | tartus |
| ihsim | إحسم | Iḩsim | محافظة إدلب | PPLA3 | 85 | - | 13.41 | maarat-al-numan |
| ad-dimas | الديماس | Ad Dīmās | محافظة ريف دمشق | PPLA3 | 85 | - | 18.90 | damascus |
| ad-daliyah | الدالي | Ad Dālīyah | محافظة اللاذقية | PPLA3 | 85 | - | 44.47 | tartus |
| abu-az-zuhur | أبو الظهور | Abū az̧ Z̧uhūr | محافظة إدلب | PPLA3 | 85 | - | 25.30 | saraqib |
| al-ya-rubiyah | tەl kۆchەk | Al Ya‘rubīyah | محافظة الحسكة | PPLA3 | 85 | - | 78.59 | qamishli |
| arishah | العريشة | ‘Arīshah | محافظة الحسكة | PPLA3 | 85 | - | 31.24 | al-hasakah |
| al-kasrah | الكسرا | Al Kasrah | محافظة دير الزور | PPLA3 | 85 | - | 32.61 | deir-ez-zor |
| al-hajar-al-aswad | الحجر الأسود | Al Ḩajar al Aswad | محافظة ريف دمشق | PPLA3 | 85 | - | 6.76 | damascus |
| khirbat-adh-dhababir | خربة الذبابير | Khirbat adh Dhabābīr | محافظة درعا | PPL | 80 | 2 | 39.34 | as-suwayda |
| zakiyah | زاكية | Zākīyah | محافظة ريف دمشق | PPL | 80 | 18553 | 22.78 | damascus |
| wuraydah | وديرة | Wuraydah | محافظة حلب | PPL | 80 | 2 | 17.65 | manbij |
| uqayribat | عقيربات | ‘Uqayribāt | محافظة حماة | PPLA3 | 80 | - | 65.05 | hama |
| umm-as-safa | أم الصفا | Umm aş Şafā | محافظة حلب | PPL | 80 | 2 | 3.68 | manbij |
| tayyibat-al-imam | طيبة الامام | Ţayyibat al Imām | محافظة حماة | PPL | 80 | 29259 | 15.48 | hama |
| altala | طاوي | Altala | محافظة الرقة | PPL | 80 | 170 | 41.22 | manbij |
| tasil | تسيل | Tasīl | محافظة درعا | PPLA3 | 80 | - | 27.09 | daraa |
| tall-hamis | تل حميس | Tall Ḩamīs | محافظة الحسكة | PPLA3 | 80 | - | 36.14 | qamishli |
| tall-abyad | تل أبيض | Tall Abyaḑ | محافظة الرقة | PPLA2 | 80 | - | 82.83 | raqqa |
| talin | تالين | Tālīn | محافظة طرطوس | PPLA3 | 80 | - | 31.08 | tartus |
| taftanaz | تفتناز | Taftanāz | محافظة إدلب | PPLA3 | 80 | - | 15.19 | saraqib |
| tafas | طفس | Ţafas | محافظة درعا | PPL | 80 | 31249 | 13.65 | daraa |
| suran | صوران | Şūrān | محافظة حلب | PPLA3 | 80 | - | 14.98 | azaz |
| slinfah | صلنفة | Şlinfah | محافظة اللاذقية | PPLA3 | 80 | - | 37.88 | latakia |
| sirghaya | سرغايا | Sirghāyā | محافظة ريف دمشق | PPLA3 | 80 | - | 34.76 | damascus |
| sinjar | سنجار | Sinjār | محافظة إدلب | PPLA3 | 80 | - | 30.83 | maarat-al-numan |
| shuyukh-tahtani | شيوخ تحتاني | Shuyūkh Taḩtānī | محافظة حلب | PPLA3 | 80 | - | 26.98 | manbij |
| shin | شين | Shīn | محافظة حمص | PPLA3 | 80 | - | 26.99 | homs |
| shaykh-al-hadid | شيخ الحديد | Shaykh al Ḩadīd | محافظة حلب | PPLA3 | 80 | - | 41.12 | azaz |
| saydnaya | صيدنايا | Şaydnāyā | محافظة ريف دمشق | PPLA3 | 80 | - | 21.96 | damascus |
| sa-sa | سعسع | Sa‘sa‘ | محافظة ريف دمشق | PPLA3 | 80 | - | 35.13 | damascus |
| sarmin | سرمين | Sarmīn | محافظة إدلب | PPLA3 | 80 | - | 8.78 | saraqib |
| samad | صماد | Şamād | محافظة درعا | PPL | 80 | 3098 | 26.27 | as-suwayda |
| salakhid | صلاخد | Şalākhid | محافظة السويداء | PPL | 80 | 12842 | 18.02 | as-suwayda |
| sadad | صدد | Şadad | محافظة حمص | PPLA3 | 80 | - | 50.57 | homs |
| sabburah | صبورة | Şabbūrah | محافظة حماة | PPLA3 | 80 | - | 41.12 | hama |
| rankus | رنكوس | Rankūs | محافظة ريف دمشق | PPLA3 | 80 | - | 28.88 | damascus |
| raju | راجو | Rājū | محافظة حلب | PPLA3 | 80 | - | 35.57 | azaz |
| qarah | قارة | Qārah | محافظة ريف دمشق | PPL | 80 | 20656 | 64.19 | homs |
| qanawat | قنوات | Qanawāt | محافظة السويداء | PPL | 80 | 8324 | 6.68 | as-suwayda |
| qal-at-al-madiq | قلعة المضيق | Qal‘at al Maḑīq | محافظة حماة | PPLA3 | 80 | - | 35.82 | maarat-al-numan |
| qadsayya | قدسيا | Qadsayyā | محافظة ريف دمشق | PPLA3 | 80 | - | 6.82 | damascus |
| kabbasin | قباسين | Kabbasin | محافظة حلب | PPL | 80 | 51230 | 8.38 | al-bab |
| al-muzayrib | المزيريب | Al Muzayrīb | محافظة درعا | PPLA3 | 80 | - | 12.58 | daraa |
| murak | مورك | Mūrak | محافظة حماة | PPL | 80 | 14307 | 27.86 | hama |
| mashta-al-hulw | مشتى الحلو | Mashtá al Ḩulw | محافظة طرطوس | PPLA3 | 80 | - | 33.31 | tartus |
| mari | مارع | Māri‘ | محافظة حلب | PPLA3 | 80 | - | 17.74 | azaz |
| malah | ملح | Malaḩ | محافظة السويداء | PPLA3 | 80 | - | 35.09 | as-suwayda |
| mahin | مهين | Mahīn | محافظة حمص | PPLA3 | 80 | - | 63.05 | homs |
| madaya | مضايا | Maḑāyā | محافظة ريف دمشق | PPLA3 | 80 | - | 25.34 | damascus |
| madanah-saghir | مدنة صغيرة | Madanah Şaghīr | محافظة حلب | PPL | 80 | 2 | 5.86 | manbij |
| madanah-kabir | مدنة كبير | Madanah Kabīr | محافظة حلب | PPL | 80 | 2 | 6.81 | manbij |
| kuwayris-sharqi | كويرس شرقي | Kuwayris Sharqī | محافظة حلب | PPLA3 | 80 | - | 22.67 | al-bab |
| kujuk-kuy | كوجوك كوي | Kūjūk Kūy | محافظة حلب | PPL | 80 | 2 | 10.28 | manbij |
| kurnaz | كرناز | Kurnāz | محافظة حماة | PPLA3 | 80 | - | 32.64 | maarat-al-numan |
| kinnsibba | كنّسبّا | Kinnsibbā | محافظة اللاذقية | PPLA3 | 80 | - | 42.85 | latakia |
| khusham | خشام | Khushām | محافظة دير الزور | PPLA3 | 80 | - | 14.01 | deir-ez-zor |
| khirbat-tin-nur | خربة تين نور | Khirbat Tīn Nūr | محافظة حمص | PPLA3 | 80 | - | 14.77 | homs |
| khirbat-ash-shiyab | خربة الشياب | Khirbat ash Shiyāb | محافظة حلب | PPL | 80 | 2 | 15.04 | manbij |
| khanasir | خناصر | Khanāşir | محافظة حلب | PPLA3 | 80 | - | 57.13 | aleppo |
| kassab | كسب | Kassab | محافظة اللاذقية | PPLA3 | 80 | - | 49.28 | latakia |
| kanakir | كناكر | Kanākir | محافظة ريف دمشق | PPL | 80 | 13950 | 32.18 | damascus |
| kafr-shams | كفر شمس | Kafr Shams | محافظة درعا | PPL | 80 | 12435 | 46.76 | damascus |
| kafr-nasij | كفر ناسج | Kafr Nāsij | محافظة درعا | PPL | 80 | 2381 | 46.04 | damascus |
| kafr-batna | كفر بطنا | Kafr Baţnā | محافظة ريف دمشق | PPLA3 | 80 | - | 8.93 | damascus |
| kafr-saghir | كفرصغير | Kafr Şaghīr | محافظة حلب | PPL | 80 | 3130 | 14.84 | aleppo |
| junaynat-raslan | جنينة رسلان | Junaynat Raslān | محافظة طرطوس | PPLA3 | 80 | - | 21.93 | tartus |
| jubb-ramlah | جب رملة | Jubb Ramlah | محافظة حماة | PPLA3 | 80 | - | 30.92 | hama |
| jubb-al-jarrah | جب الجرّاح | Jubb al Jarrāḩ | محافظة حمص | PPLA3 | 80 | - | 56.88 | homs |
| jawbat-burghal | جوبة برغال | Jawbat Burghāl | محافظة اللاذقية | PPLA3 | 80 | - | 35.76 | latakia |
| jaba | جبا | Jabā | محافظة القنيطرة | PPL | 80 | 5281 | 50.83 | damascus |
| inkhil | انخل | Inkhil | محافظة درعا | PPL | 80 | 29076 | 44.44 | daraa |
| hish | حيش | Ḩīsh | محافظة إدلب | PPLA3 | 80 | - | 10.85 | maarat-al-numan |
| himmin | حمين | Ḩimmīn | محافظة طرطوس | PPLA3 | 80 | - | 14.00 | tartus |
| harran-al-awamid | حرّان العواميد | Ḩarrān al ‘Awāmīd | محافظة ريف دمشق | PPLA3 | 80 | - | 27.27 | damascus |
| huraytan | حريتان | Ḩuraytān | محافظة حلب | PPLA3 | 80 | - | 10.58 | aleppo |
| harim | حارم | Ḩārim | محافظة إدلب | PPLA2 | 80 | - | 32.57 | idlib |
| harf-al-musaytirah | حرف المسيترة | Ḩarf al Musaytirah | محافظة اللاذقية | PPLA3 | 80 | - | 35.06 | latakia |
| harbinafsah | حربنفسه | Ḩarbinafsah | محافظة حماة | PPLA3 | 80 | - | 24.27 | homs |
| hammam-wasil | حمام واصل | Ḩammām Wāşil | محافظة طرطوس | PPLA3 | 80 | - | 26.95 | tartus |
| halfaya | حلفايا | Ḩalfāyā | محافظة حماة | PPL | 80 | 23403 | 19.86 | hama |
| hadidah | حديدة | Ḩadīdah | محافظة حمص | PPLA3 | 80 | - | 29.66 | homs |
| ghasam | غصم | Ghaşam | محافظة درعا | PPL | 80 | 3666 | 25.53 | as-suwayda |
| ghabaghib | غباغب | Ghabāghib | محافظة درعا | PPLA3 | 80 | - | 37.16 | damascus |
| al-fakhurah | الفاخورة | Al Fākhūrah | محافظة اللاذقية | PPLA3 | 80 | - | 20.78 | latakia |
| duwayr-raslan | دوير رسلان | Duwayr Raslān | محافظة طرطوس | PPLA3 | 80 | - | 27.55 | tartus |
| dhibbin | ذيبين | Dhībbīn | محافظة السويداء | PPLA3 | 80 | - | 30.31 | as-suwayda |
| dayr-makir | دير ماكر | Dayr Mākir | محافظة ريف دمشق | PPL | 80 | 3228 | 38.86 | damascus |
| dayr-atiyah | دير عطية | Dayr ‘Aţīyah | محافظة ريف دمشق | PPLA3 | 80 | - | 71.00 | homs |
| dayr-al-asafir | دير العصافير | Dayr al ‘Aşāfīr | محافظة ريف دمشق | PPL | 80 | 6209 | 14.37 | damascus |
| darkush | دركوش | Darkūsh | محافظة إدلب | PPLA3 | 80 | - | 22.53 | idlib |
| burj-islam | برج إسلام | Burj Islām | محافظة اللاذقية | PPL | 80 | 30000 | 17.58 | latakia |
| bulbul | بلبل | Bulbul | محافظة حلب | PPLA3 | 80 | - | 28.68 | azaz |
| brummanat-al-mashayikh | برمانة المشايخ | Brummānat al Mashāyikh | محافظة طرطوس | PPLA3 | 80 | - | 29.28 | tartus |
| bdama | بداما | Bdāmā | محافظة إدلب | PPLA3 | 80 | - | 41.62 | idlib |
| basir | بصير | Başīr | محافظة درعا | PPL | 80 | 1442 | 50.17 | as-suwayda |
| barri-ash-sharqi | برّي الشرقي | Barrī ash Sharqī | محافظة حماة | PPLA3 | 80 | - | 43.68 | hama |
| banan | بنان | Banān | محافظة حلب | PPLA3 | 80 | - | 29.56 | aleppo |
| az-ziyarah | الزيارة | Az Ziyārah | محافظة حماة | PPLA3 | 80 | - | 30.28 | maarat-al-numan |
| awaj | عوج | ‘Awaj | محافظة حماة | PPLA3 | 80 | - | 34.27 | homs |
| at-tibni | التبني | At Tibnī | محافظة دير الزور | PPLA3 | 80 | - | 42.38 | deir-ez-zor |
| as-sukhnah | السخنة | As Sukhnah | محافظة حمص | PPLA3 | 80 | - | 119.34 | raqqa |
| assal-al-ward | عسال الورد | ‘Assāl al Ward | محافظة ريف دمشق | PPLA3 | 80 | - | 41.02 | damascus |
| as-sabkhah | السبخة | As Sabkhah | محافظة الرقة | PPLA3 | 80 | - | 27.80 | raqqa |
| as-si-in | السعن | As Si‘in | محافظة حماة | PPLA3 | 80 | - | 57.88 | hama |
| ash-shajarah | الشجرة | Ash Shajarah | محافظة درعا | PPLA3 | 80 | - | 27.14 | daraa |
| arwad | أرواد | Arwād | محافظة طرطوس | PPLA3 | 80 | - | 5.12 | tartus |
| armanaz | أرمناز | Armanāz | محافظة إدلب | PPLA3 | 80 | - | 20.41 | idlib |
| ariha | أريحا | Arīḩā | محافظة إدلب | PPLA2 | 80 | - | 13.46 | idlib |
| aqwiran | اقويران | Aqwīrān | محافظة حلب | PPL | 80 | 2 | 13.11 | manbij |
| an-nashabiyah | النشابية | An Nashābīyah | محافظة ريف دمشق | PPLA3 | 80 | - | 19.40 | damascus |
| al-ghantu | الغنطو | Al Ghanţū | محافظة حمص | PPL | 80 | 9412 | 10.09 | homs |
| al-qadmus | القدموس | Al Qadmūs | محافظة طرطوس | PPLA3 | 80 | - | 33.57 | tartus |
| al-mulayhah | المليحة | Al Mulayḩah | محافظة ريف دمشق | PPLA3 | 80 | - | 9.72 | damascus |
| al-hawl | الحول | Al Ḩawl | محافظة الحسكة | PPLA3 | 80 | - | 38.52 | al-hasakah |
| al-hajib | الحاجب | Al Ḩājib | محافظة حلب | PPLA3 | 80 | - | 44.38 | aleppo |
| al-haffah | الحفة | Al Ḩaffah | محافظة اللاذقية | PPLA2 | 80 | - | 24.27 | latakia |
| al-ghariyah | الغارية | Al Ghāriyah | محافظة السويداء | PPLA3 | 80 | - | 36.03 | as-suwayda |
| al-busayrah | البصيرة | Al Buşayrah | محافظة دير الزور | PPLA3 | 80 | - | 32.78 | deir-ez-zor |
| al-bahluliyah | البهلولية | Al Bahlūlīyah | محافظة اللاذقية | PPLA3 | 80 | - | 20.99 | latakia |
| akhtarin | أخترين | Akhtarīn | محافظة حلب | PPLA3 | 80 | - | 22.52 | al-bab |
| afis | افس | Afis | محافظة إدلب | PPL | 80 | 6338 | 4.91 | saraqib |
| abu-qalqal | أبو قلقل | Abū Qalqal | محافظة حلب | PPLA3 | 80 | - | 17.80 | manbij |
| salman | سلمان | Salmān | محافظة الحسكة | PPL | 80 | 3 | 58.12 | al-hasakah |
| kaff-al-jaa | كاف الجاع | Kaff al-Jaa | محافظة طرطوس | PPL | 80 | 3500 | 35.98 | tartus |
| nahiyat-as-sab-biyar | ناحية السبع بيار | Nāḩiyat as Sab‘ Biyār | محافظة ريف دمشق | PPLA3 | 80 | - | 160.54 | damascus |
| al-mansurah | المنصورة | Al Manşūrah | محافظة الرقة | PPLA3 | 80 | - | 27.00 | raqqa |
| bayt-yashut | بيت ياشوط | Bayt Yāshūţ | محافظة اللاذقية | PPLA3 | 80 | - | 38.01 | latakia |
| flaleh | فلاح ربو | Flaleh | محافظة الرقة | PPL | 80 | 120 | 47.25 | manbij |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| al-musayritiyah | المسيرتية | Al Musayritīyah | محافظة درعا | PPL | 70 | 33.83 |
| al-mushayrifah | المشيرفة | Al Mushayrifah | محافظة حمص | PPL | 70 | 40.97 |
| al-jamaliyah | الجمالية | Al Jamālīyah | محافظة حمص | PPL | 70 | 30.95 |
| ar-razzuqiyah | الرزوقية | Ar Razzūqīyah | محافظة حمص | PPL | 70 | 30.84 |
| al-hammudiyah | الحمودية | Al Ḩammūdīyah | محافظة حمص | PPL | 70 | 30.92 |
| al-muhashsham | المهشم | Al Muhashsham | محافظة حمص | PPL | 70 | 41.88 |
| sunaydah | السنيدة | Sunaydah | محافظة حماة | PPL | 70 | 32.70 |
| butaysah | بتيسة | Butaysah | محافظة حمص | PPL | 70 | 20.17 |
| salim-at-tahtani | سليم | Salīm at Taḩtānī | محافظة حمص | PPL | 70 | 29.15 |
| sammuqah | سموقة | Sammūqah | محافظة طرطوس | PPL | 70 | 29.41 |
| khirbat-as-sawdah | خربة السودة | Khirbat as Sawdah | محافظة حمص | PPL | 70 | 9.99 |
| huwayk | الحاوي | Ḩuwayk | محافظة حمص | PPL | 70 | 33.65 |
| hamush-raslan | حاموش السلامة | Ḩāmūsh Raslān | محافظة طرطوس | PPL | 70 | 25.54 |
| jawbar | جوبر | Jawbar | محافظة حمص | PPL | 70 | 7.17 |
| busayrah | بصيرة | Buşayrah | محافظة طرطوس | PPL | 70 | 36.11 |
| az-zaybaq | الزبيق | Az Zaybaq | محافظة حمص | PPL | 70 | 17.18 |
| az-zahiriyah | الطاهرية | Az̧ Z̧āhirīyah | محافظة حمص | PPL | 70 | 30.34 |
| al-khalidiyah | الخالدية | Al Khālidīyah | محافظة حمص | PPL | 70 | 31.12 |
| al-mazhariyah | أم دولاب | Al Maz̧harīyah | محافظة حمص | PPL | 70 | 19.44 |
| al-barjudiyah | البرجود | Al Barjūdīyah | محافظة حمص | PPL | 70 | 20.60 |
| zughayr | زعير | Zughayr | محافظة دير الزور | PPL | 70 | 21.85 |
| asili | اصيلة | Aşīlī | محافظة حماة | PPL | 70 | 25.46 |
| aqrab | عقرب | ‘Aqrab | محافظة حماة | PPL | 70 | 26.84 |
| wa-r-ma-arrzaf | وعر معر زاف | Wa‘r Ma‘arrzāf | محافظة حماة | PPL | 70 | 18.45 |
| bilhusayn-al-wala | بلح الأولى | Bilḩusayn al Walā | محافظة حماة | PPL | 70 | 8.62 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **7882**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| sanawbar | Şanawbar | Şanawbar | محافظة القنيطرة | PPL | missing_real_ar_name |
| al-khushniyah | Al Khushnīyah | Al Khushnīyah | محافظة القنيطرة | PPL | missing_real_ar_name |
| mazra-at-habl-at-tin | مزرعة حبل التين | Mazra‘at Ḩabl at Tīn | محافظة حمص | PPL | non_place_keyword (kw: مزرعة) |
| matallat-rasm-kasad | Maţallat Rasm Kasād | Maţallat Rasm Kasād | محافظة حمص | PPL | missing_real_ar_name |
| rasm-at-tuwayliyah | Rasm aţ Ţuwaylīyah | Rasm aţ Ţuwaylīyah | محافظة حمص | PPL | missing_real_ar_name |
| at-tawil | Aţ Ţawīl | Aţ Ţawīl | محافظة حمص | PPL | missing_real_ar_name |
| khalfah | Khalfah | Khalfah | محافظة حمص | PPL | missing_real_ar_name |
| furaytan | Furaytān | Furaytān | محافظة حماة | PPL | missing_real_ar_name |
| barghutiyah | Barghūtīyah | Barghūtīyah | محافظة حماة | PPL | missing_real_ar_name |
| khirbat-buzliya | Khirbat Buzliyā | Khirbat Buzliyā | محافظة حمص | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| umm-jami | أم جامع | Umm Jāmi’ | religious_site_not_city | جامع(?!ة) |
| umm-jami | أم جامع | Umm Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| tall-ka-bah | تل كعبة | Tall Ka‘bah | religious_site_not_city | كعبة |
| anab | الجامعية | Anāb | religious_site_not_city | جامع(?!ة) |
| mawqi-karm-al-jami | موقع كرم الجامع | Mawqi‘ Karm al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| ard-ash-shaykh-jami | أرض الشيخ جامع | Arḑ ash Shaykh Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| khirbat-al-jami | خربة الجامع | Khirbat al Jāmi‘ | religious_site_not_city | جامع(?!ة) |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| tartus | tartus | slug |
| as-suwayda | as-suwayda | slug |
| saraqib | saraqib | slug |
| manbij | manbij | slug |
| ma-arrat-an-nu-man | maarat-al-numan | ar_name+coords (d=0.86km) |
| idlib | idlib | slug |
| homs | homs | slug |
| hamah | hama | ar_name+coords (d=0.00km) |
| aleppo | aleppo | slug |
| damascus | damascus | slug |

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
