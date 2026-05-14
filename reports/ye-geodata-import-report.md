# YE GeoNames Import Report (refined)

**Country**: Yemen (اليمن)
**Generated**: 2026-05-14T21:14:41.942Z
**Phase**: `CURATED-GEODATA-YE-1`

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT    | `db/places/candidates/ye-geonames-raw.json` |
| 2. NORMALIZE | `db/places/candidates/ye-geonames-normalized.json` |
| 3. VALIDATE  | `db/places/candidates/ye-geonames-candidates.json` + THIS report |
| 3b. ALIAS REVIEW | `reports/ye-geodata-aliases-review.md` (separate) |
| 4. APPLY     | **NOT RUN — awaiting your decision** |

## Summary

| Bucket | Count |
| --- | --- |
| Raw GeoNames rows (P-class only)         | 81303 |
| Normalized candidates                     | 78114 |
| **approved_auto**                         | **0** (always 0 under 1B refinement) |
| **high_confidence_pending**               | **7857** |
| **medium_confidence_pending**             | **151** |
| **low_confidence_pending**                | **52919** |
| needs_review                              | 17059 |
| existing (matched, no action)             | 25 |
| rejected (bad data / religious site)      | 103 |
| Alias enrichment opps (in separate report) | 25 |

**Shortlist size (high + medium):** 8008

## Rejection breakdown

| Reason | Count |
| --- | --- |
| religious_site_not_city | 103 |

## Match-reason breakdown (existing)

| Reason | Count |
| --- | --- |
| coords<1km | 13 |
| slug | 11 |
| en_name+coords | 1 |

## High-confidence shortlist (full listing)

These are the candidates the user should review FIRST.
All satisfy: real Arabic name + known region + admin or PPL
feature + qScore ≥ 80 + distance >3km to nearest existing entry
+ no blocklist match.

| slug | name.ar | name.en | region | fc | qScore | pop | distNearestKm | nearest |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| al-inan | العنان | Al ‘Inān | محافظة الجوف | PPLA2 | 100 | 100 | 63.27 | saada |
| dhi-as-sufal | ذي السفال | Dhī as Sufāl | محافظة إب | PPLA2 | 100 | 37997 | 16.46 | ibb |
| zabid | زبيد | Zabīd | محافظة الحديدة | PPLA2 | 95 | 52590 | 77.45 | hodeidah |
| yarim | يريم | Yarīm | محافظة إب | PPLA2 | 95 | 33050 | 28.13 | dhamar |
| sayyan | سيان | Sayyān | محافظة صنعاء | PPLA2 | 95 | 69404 | 26.23 | sanaa |
| qalansiyah | قلنسية | Qalansīyah | محافظة سقطرى | PPLA2 | 95 | 3500 | 514.52 | mukalla |
| al-musaymir | المسيمير | Al Musaymīr | محافظة لحج | PPLA2 | 95 | 3 | 66.01 | taiz |
| hadibu | حديبو | Hadibu | محافظة سقطرى | PPLA2 | 95 | 8545 | 569.35 | mukalla |
| ghayl-ba-wazir | غيل با وزير | Ghayl Bā Wazīr | محافظة حضرموت | PPLA2 | 95 | 21259 | 36.78 | mukalla |
| bayt-al-faqih | بيت الفقيه | Bayt al Faqīh | محافظة الحديدة | PPLA2 | 95 | 34204 | 50.63 | hodeidah |
| bajil | باجل | Bājil | محافظة الحديدة | PPLA2 | 95 | 48218 | 46.07 | hodeidah |
| saqayn | ساقين | Sāqayn | محافظة صعدة | PPLA2 | 95 | 41 | 26.33 | saada |
| bani-al-awwam | بني العوام | Banī al ‘Awwām | محافظة حجة | PPLA2 | 95 | 41 | 68.85 | sanaa |
| ash-shawati | الشواتي | Ash Shawātī | محافظة صعدة | PPLA2 | 95 | 25 | 18.23 | saada |
| suhayl-shibam | سحيل شبام | Suḩayl Shibām | محافظة حضرموت | PPLA2 | 95 | 645 | 161.22 | mukalla |
| al-khaniq | الخانق | Al Khāniq | محافظة صنعاء | PPLA2 | 95 | 2 | 14.84 | sanaa |
| judaydah | الجديدة | Judaydah | محافظة مأرب | PPLA2 | 85 | - | 43.70 | marib |
| zalmah-al-ulya | ظلمة العليا | Z̧almah al ‘Ulyā | محافظة إب | PPLA2 | 85 | - | 17.89 | ibb |
| suq-ar-rubu | ربع عتمة | Sūq ar Rubū‘ | محافظة ذمار | PPLA2 | 85 | - | 41.83 | dhamar |
| ash-shuqayrah | التريس | Ash Shuqayrah | محافظة تعز | PPLA2 | 85 | - | 55.61 | taiz |
| al-masaliyah | المسالية | Al Masālīyah | محافظة تعز | PPLA2 | 85 | - | 5.95 | taiz |
| suq-sirwah | السوق | Sūq Şirwāḩ | محافظة مأرب | PPLA2 | 85 | - | 32.55 | marib |
| al-atfah | العطفة | Al ‘Aţfah | محافظة صعدة | PPL | 85 | 39 | 42.44 | saada |
| as-suwayda | السويدا | As Suwaydā | محافظة لحج | PPLA2 | 85 | - | 113.69 | aden |
| shaharat-al-ghis | شهارة | Shahārat al Ghīs | محافظة عمران | PPLA2 | 85 | - | 84.33 | saada |
| markaz-mudhaykirah | مديخرة | Markaz Mudhaykirah | محافظة إب | PPLA2 | 85 | - | 24.69 | ibb |
| mayfa-ah | ميفعة | Mayfa‘ah | محافظة شبوة | PPLA2 | 85 | - | 168.50 | mukalla |
| kilmia | كلمية | Kilmia | محافظة حضرموت | PPL | 85 | 2013 | 426.36 | mukalla |
| dhaybin | ذي بين | Dhaybīn | محافظة عمران | PPLA2 | 85 | - | 67.90 | sanaa |
| al-awabil | العوابل | Al ‘Awābil | محافظة الضالع | PPLA2 | 85 | - | 74.90 | ibb |
| ash-shatt | أم شط | Ash Shaţţ | محافظة لحج | PPLA2 | 85 | - | 76.29 | taiz |
| marbat | الرباط | Marbāţ | محافظة شبوة | PPLA2 | 85 | - | 181.16 | marib |
| al-wuday | أم وضيع | Al Wuday‘ | محافظة أبين | PPLA2 | 85 | - | 154.03 | aden |
| al-ma-udah | ال معوضة | Āl Ma‘ūdah | محافظة البيضاء | PPLA2 | 85 | - | 112.67 | dhamar |
| mocha | المخا | Mocha | محافظة تعز | PPL | 85 | 16794 | 88.30 | taiz |
| al-khamis | الخميس | Al Khamīs | محافظة المحويت | PPLA2 | 85 | - | 73.71 | hodeidah |
| al-urrah | العر | Al ‘Urrah | محافظة صنعاء | PPLA2 | 85 | - | 35.21 | sanaa |
| al-nashmah | النشمة | Al Nashmah | محافظة تعز | PPLA2 | 85 | - | 21.80 | taiz |
| al-khirab | الخراب | Al Khirāb | محافظة الجوف | PPLA2 | 85 | - | 70.63 | saada |
| ar-rawd | الروض | Ar Rawḑ | محافظة الجوف | PPLA2 | 85 | - | 85.80 | marib |
| zabah | ضباه | Z̧abah | محافظة ذمار | PPLA2 | 85 | - | 29.87 | dhamar |
| hammam-damt | حمام دمت | Ḩammām Damt | محافظة الضالع | PPLA2 | 85 | - | 54.28 | ibb |
| madghil | مدغل | Madghil | محافظة مأرب | PPLA2 | 85 | - | 33.53 | marib |
| rahabah | الكولة | Raḩabah | محافظة مأرب | PPLA2 | 85 | - | 72.98 | marib |
| al-qurayshiyah | القريشية | Al Qurayshīyah | محافظة البيضاء | PPLA2 | 85 | - | 48.82 | dhamar |
| al-majashinah | المجاشنة | Al Majāshinah | محافظة حجة | PPL | 85 | 7 | 129.29 | saada |
| al-jarahiyah | الجراحية | Al Jarāḩīyah | محافظة حجة | PPL | 85 | 13 | 110.50 | saada |
| al-jawfa | الجوفا | Al Jawfā’ | محافظة الجوف | PPL | 85 | 10 | 166.98 | marib |
| rumah | رماة | Rumāh | محافظة حضرموت | PPLA2 | 85 | - | 359.24 | mukalla |
| baqim-as-suq | باقم | Bāqim as Sūq | محافظة صعدة | PPLA2 | 85 | - | 59.20 | saada |
| khimar | خمار | Khimār | محافظة شبوة | PPL | 85 | 3000 | 198.69 | marib |
| al-husun | الحصون | Al Ḩuşūn | محافظة مأرب | PPLA2 | 85 | - | 4.87 | marib |
| dahasuways | دحسويس | Daḩasuways | محافظة المهرة | PPLA2 | 80 | - | 216.67 | mukalla |
| ash-shihr | الشحر | Ash Shiḩr | محافظة حضرموت | PPLA2 | 80 | - | 57.15 | mukalla |
| al-ghaylah | الغيلة | Al Ghaylah | محافظة البيضاء | PPLA2 | 80 | - | 100.91 | marib |
| dawran | ضوران | Ḑawrān | محافظة الضالع | PPLA2 | 80 | - | 35.17 | ibb |
| najd-al-jama-i | نجد الجماعي | Najd al Jamā‘ī | محافظة إب | PPLA2 | 80 | - | 16.25 | ibb |
| ar-rawnah | الرونة | Ar Rawnah | محافظة تعز | PPLA2 | 80 | - | 30.69 | taiz |
| ar-ramadi | الرمادي | Ar Ramādī | محافظة إب | PPLA2 | 80 | - | 43.04 | ibb |
| al-ahad | الأحد | Al Aḩad | محافظة ذمار | PPLA2 | 80 | - | 66.81 | ibb |
| ad-dil | الضلع | Aḑ Ḑil‘ | محافظة ريمة | PPLA2 | 80 | - | 64.22 | dhamar |
| majzar | مجزر | Majzar | محافظة مأرب | PPLA2 | 80 | - | 72.38 | marib |
| bidbadah | بدبدة | Bidbadah | محافظة مأرب | PPLA2 | 80 | - | 54.92 | sanaa |
| albuq | البقع | Albuq | محافظة صعدة | PPL | 80 | 69 | 99.60 | saada |
| al-aqlayn | العقلين | Al ‘Aqlayn | محافظة صعدة | PPL | 80 | 43 | 38.70 | saada |
| al-jabajib | الجباجب | Al Jabājib | محافظة صعدة | PPL | 80 | 164 | 4.41 | saada |
| matwah | متوح | Matwaḩ | محافظة صنعاء | PPLA2 | 80 | - | 67.78 | sanaa |
| suwayr | صوير | Şuwayr | محافظة عمران | PPLA2 | 80 | - | 85.91 | saada |
| wadarah | وضرة | Waḑarah | محافظة حجة | PPLA2 | 80 | - | 84.79 | sanaa |
| al-mirwah | المرواح | Al Mirwāḩ | محافظة المحويت | PPLA2 | 80 | - | 82.44 | sanaa |
| suq-shamar | سوق شمر | Sūq Shamar | محافظة حجة | PPLA2 | 80 | - | 105.13 | sanaa |
| mustaba | مستباء | Mustabā’ | محافظة حجة | PPLA2 | 80 | - | 96.31 | saada |
| an-nazir | النظير | An Naz̧īr | محافظة صعدة | PPLA2 | 80 | - | 53.43 | saada |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة المحويت | PPLA2 | 80 | - | 49.48 | sanaa |
| zarajah | زراجة | Zarājah | محافظة ذمار | PPLA2 | 80 | - | 35.33 | dhamar |
| az-zahir | الزاهر | Az Zāhir | محافظة البيضاء | PPLA2 | 80 | - | 133.40 | dhamar |
| yufrus | يفرس | Yufrus | محافظة تعز | PPLA2 | 80 | - | 15.95 | taiz |
| washhah | وشحة | Washḩah | محافظة حجة | PPLA2 | 80 | - | 79.74 | saada |
| wa-lan | وعلان | Wa‘lān | محافظة صنعاء | PPLA2 | 80 | - | 34.51 | sanaa |
| dhi-jalal | ذي جلال | Dhī Jalāl | محافظة الضالع | PPLA2 | 80 | - | 68.25 | ibb |
| usaylan | عسيلان | ‘Usaylān | محافظة شبوة | PPLA2 | 80 | - | 72.77 | marib |
| ubal | عبال | ‘Ubāl | محافظة الحديدة | PPLA2 | 80 | - | 66.83 | hodeidah |
| thamud | ثمود | Thamūd | محافظة حضرموت | PPLA2 | 80 | - | 317.39 | mukalla |
| tarim | تريم | Tarim | محافظة حضرموت | PPLA2 | 80 | - | 168.94 | mukalla |
| abs | عبس | Abs | محافظة حجة | PPLA2 | 80 | - | 120.44 | saada |
| sif | صيف | Şīf | محافظة حضرموت | PPLA2 | 80 | - | 121.00 | mukalla |
| shihan-as-sufla | شحن السفلى | Shiḩan as Suflá | محافظة المهرة | PPLA2 | 80 | - | 507.86 | mukalla |
| shibam | شبام | Shibām | محافظة حضرموت | PPL | 80 | 7000 | 162.94 | mukalla |
| shibam | شبام | Shibām | محافظة المحويت | PPLA2 | 80 | - | 34.44 | sanaa |
| ash-sharyah | الشرية | Ash Sharyah | محافظة البيضاء | PPLA2 | 80 | - | 70.21 | dhamar |
| sharas | شرس | Sharas | محافظة حجة | PPLA2 | 80 | - | 69.44 | sanaa |
| sayhut | سيحوت | Sayḩūt | محافظة المهرة | PPLA2 | 80 | - | 239.78 | mukalla |
| sana | صناء | Şanā’ | محافظة حضرموت | PPLA2 | 80 | - | 174.24 | mukalla |
| salabah | الصلبة | Salābah | محافظة شبوة | PPL | 80 | 1000 | 197.77 | marib |
| sahar | سحر | Saḩar | محافظة صنعاء | PPL | 80 | 31859 | 13.94 | sanaa |
| sah | ساه | Sāh | محافظة حضرموت | PPLA2 | 80 | - | 118.76 | mukalla |
| rihab | رحاب | Riḩāb | محافظة إب | PPLA2 | 80 | - | 29.02 | ibb |
| rada | رداع | Radā‘ | محافظة البيضاء | PPLA2 | 80 | - | 49.22 | dhamar |
| ar-raydah | الريدة | Ar Raydah | محافظة حضرموت | PPLA2 | 80 | - | 155.63 | mukalla |
| raydah | ريدة | Raydah | محافظة عمران | PPLA2 | 80 | - | 52.01 | sanaa |
| rudum | رضوم | Ruḑūm | محافظة شبوة | PPLA2 | 80 | - | 157.25 | mukalla |
| qishn | قشن | Qishn | محافظة المهرة | PPLA2 | 80 | - | 291.34 | mukalla |
| qa-tabah | قعطبة | Qa‘ţabah | محافظة الضالع | PPLA2 | 80 | - | 57.75 | ibb |
| nisab | نصاب | Nişāb | محافظة شبوة | PPLA2 | 80 | - | 165.01 | marib |
| mukayras | مكيراس | Mukayrās | محافظة البيضاء | PPLA2 | 80 | - | 146.89 | aden |
| mudiyah | مودية | Mūdīyah | محافظة أبين | PPLA2 | 80 | - | 171.45 | aden |
| minwakh | منوخ | Minwakh | محافظة حضرموت | PPLA2 | 80 | - | 273.61 | mukalla |
| midi | ميدي | Mīdī | محافظة حجة | PPLA2 | 80 | - | 122.46 | saada |
| mawza | موزع | Mawza‘ | محافظة تعز | PPLA2 | 80 | - | 65.20 | taiz |
| mawiyah | ماوية | Māwiyah | محافظة تعز | PPLA2 | 80 | - | 35.32 | taiz |
| al-jawl | الجول | Al Jawl | محافظة حضرموت | PPLA2 | 80 | - | 91.31 | mukalla |
| manakhah | مناخة | Manākhah | محافظة صنعاء | PPLA2 | 80 | - | 58.33 | sanaa |
| milah | ملاح | Milāḩ | محافظة البيضاء | PPLA2 | 80 | - | 43.99 | dhamar |
| al-malahit | الملاحيط | Al Malāḩīţ | محافظة صعدة | PPLA2 | 80 | - | 55.30 | saada |
| al-mafud | المافود | Al Māfūd | محافظة شبوة | PPLA2 | 80 | - | 207.38 | marib |
| mafhaq | مفحق | Mafḩaq | محافظة صنعاء | PPLA2 | 80 | - | 42.91 | sanaa |
| al-madid | المديد | Al Madīd | محافظة صنعاء | PPLA2 | 80 | - | 43.03 | sanaa |
| ma-bar | معبر | Ma‘bar | محافظة ذمار | PPLA2 | 80 | - | 29.52 | dhamar |
| al-ma-abirah | المعابرة | Al Ma‘ābirah | محافظة حجة | PPL | 80 | 2 | 135.01 | hodeidah |
| lawdar | لودر | Lawdar | محافظة أبين | PPLA2 | 80 | - | 152.79 | aden |
| kuhlan-affar | كحلان عفار | Kuḩlān ‘Affār | محافظة حجة | PPLA2 | 80 | - | 64.74 | sanaa |
| ku-aydinah | كعيدنة | Ku‘aydinah | محافظة حجة | PPLA2 | 80 | - | 104.33 | sanaa |
| kitaf | كتاف | Kitāf | محافظة صعدة | PPLA2 | 80 | - | 38.13 | saada |
| khawr-maksar | خور مكسر | Khawr Maksar | محافظة عدن | PPLA2 | 80 | - | 3.38 | aden |
| khawrah | خورة | Khawrah | محافظة شبوة | PPLA2 | 80 | - | 145.78 | marib |
| khamir | خمر | Khamir | محافظة عمران | PPLA2 | 80 | - | 73.32 | sanaa |
| juban | جبن | Juban | محافظة الضالع | PPLA2 | 80 | - | 74.76 | ibb |
| jihanah | جحانة | Jiḩānah | محافظة صنعاء | PPLA2 | 80 | - | 35.08 | sanaa |
| ja-ar | جعار | Ja‘ār | محافظة أبين | PPLA2 | 80 | - | 57.73 | aden |
| huth | حوث | Ḩūth | محافظة عمران | PPLA2 | 80 | - | 81.82 | saada |
| as-salasil | السلاسل | As Salāsil | محافظة حضرموت | PPLA2 | 80 | - | 217.68 | mukalla |
| al-abr | العبر | Al ‘Abr | محافظة حضرموت | PPLA2 | 80 | - | 217.86 | marib |
| hays | حيس | Ḩays | محافظة الحديدة | PPLA2 | 80 | - | 70.06 | taiz |
| hayfan | حيفان | Ḩayfān | محافظة تعز | PPLA2 | 80 | - | 40.41 | taiz |
| hawf | حوف | Ḩawf | محافظة المهرة | PPLA2 | 80 | - | 478.94 | mukalla |
| haswayn | حصوين | Ḩaşwayn | محافظة المهرة | PPLA2 | 80 | - | 340.18 | mukalla |
| harib | حريب | Ḩarīb | محافظة مأرب | PPLA2 | 80 | - | 62.70 | marib |
| hammam-ali | حمام علي | Ḩammām ‘Alī | محافظة ذمار | PPLA2 | 80 | - | 30.12 | dhamar |
| madinat-lab-us | مدينة لبعوس | Madīnat Lab‘ūs | محافظة لحج | PPLA2 | 80 | - | 115.67 | ibb |
| habil-al-jabr | حبيل الجبر | Ḩabīl al Jabr | محافظة لحج | PPLA2 | 80 | - | 91.11 | aden |
| al-habilayn | الحبيلين | Al Ḩabīlayn | محافظة لحج | PPLA2 | 80 | - | 83.67 | aden |
| habban | حبان | Ḩabbān | محافظة شبوة | PPLA2 | 80 | - | 221.49 | mukalla |
| hababah | حبابة | Ḩabābah | محافظة عمران | PPLA2 | 80 | - | 38.99 | sanaa |
| dhubab | ذباب | Dhubāb | محافظة تعز | PPLA2 | 80 | - | 96.83 | taiz |
| dhi-na-im | ذي ناعم | Dhī Nā‘im | محافظة البيضاء | PPLA2 | 80 | - | 123.08 | dhamar |
| dawran-ad-daydah | ضورتن الديدة | Ḑawrān ad Daydah | محافظة ذمار | PPLA2 | 80 | - | 29.72 | dhamar |
| burum | بروم | Burūm | محافظة حضرموت | PPLA2 | 80 | - | 25.24 | mukalla |
| bayt-adhaqah | بيت عذاقة | Bayt ‘Adhāqah | محافظة عمران | PPLA2 | 80 | - | 59.10 | sanaa |
| as-suq-al-jadid | السوق الجديد | As Sūq al Jadīd | محافظة عمران | PPLA2 | 80 | - | 52.51 | sanaa |
| bayhan | بيحان | Bayḩān | محافظة شبوة | PPLA2 | 80 | - | 85.52 | marib |
| bani-bakr | بني بكر | Banī Bakr | محافظة لحج | PPLA2 | 80 | - | 115.73 | dhamar |
| bani-akkad | بني عكاد | Banī ‘Akkād | محافظة حجة | PPL | 80 | 1 | 134.88 | hodeidah |
| az-zuhrah | الزهرة | Az Zuhrah | محافظة الحديدة | PPLA2 | 80 | - | 103.06 | hodeidah |
| az-zaydiyah | الزيدية | Az Zaydīyah | محافظة الحديدة | PPLA2 | 80 | - | 59.49 | hodeidah |
| az-zahir | الزاهر | Az Zāhir | محافظة الجوف | PPLA2 | 80 | - | 104.27 | saada |
| at-turbah | التربة | At Turbah | محافظة تعز | PPLA2 | 80 | - | 42.29 | taiz |
| at-tulul | الطلول | Aţ Ţulūl | محافظة صعدة | PPL | 80 | 47 | 7.93 | saada |
| at-tuhayta | التحيتاء | At Tuḩaytā’ | محافظة الحديدة | PPLA2 | 80 | - | 74.31 | hodeidah |
| at-tawahi | التواهي | At Tawāhī | محافظة عدن | PPLA2 | 80 | - | 4.18 | aden |
| as-sudah | السودة | As Sūdah | محافظة عمران | PPLA2 | 80 | - | 78.87 | sanaa |
| as-sayyani | السياني | As Sayyānī | محافظة إب | PPLA2 | 80 | - | 13.83 | ibb |
| as-sawma-ah | الصومعة | Aş Şawma‘ah | محافظة البيضاء | PPLA2 | 80 | - | 159.38 | dhamar |
| al-bilad | البلاد | Al Bilād | محافظة حضرموت | PPLA2 | 80 | - | 178.34 | mukalla |
| as-sawad | السواد | As Sawād | محافظة صعدة | PPL | 80 | 72 | 10.91 | saada |
| as-salif | الصليف | Aş Şalīf | محافظة الحديدة | PPLA2 | 80 | - | 64.34 | hodeidah |
| as-sa-id | الصعيد | Aş Şa‘īd | محافظة شبوة | PPLA2 | 80 | - | 209.21 | marib |
| as-safaqayn | الصفقين | Aş Şafaqayn | محافظة المحويت | PPLA2 | 80 | - | 81.75 | hodeidah |
| as-saddah | السدة | As Saddah | محافظة إب | PPLA2 | 80 | - | 30.95 | ibb |
| ash-shaykh-uthman | الشيخ عثمان | Ash Shaykh ‘Uthmān | محافظة عدن | PPLA2 | 80 | - | 10.52 | aden |
| ash-shahil | الشاهل | Ash Shāhil | محافظة حجة | PPLA2 | 80 | - | 100.71 | sanaa |
| ash-shaghadirah | الشغادرة | Ash Shaghādirah | محافظة حجة | PPLA2 | 80 | - | 77.06 | sanaa |
| asdas | أسداس | Asdās | محافظة مأرب | PPLA2 | 80 | - | 42.01 | marib |
| ar-rawdah | الروضة | Ar Rawḑah | أمانة العاصمة | PPLA2 | 80 | - | 7.86 | sanaa |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة شبوة | PPLA2 | 80 | - | 199.09 | mukalla |
| an-nadirah | النادرة | An Nādirah | محافظة إب | PPLA2 | 80 | - | 34.67 | ibb |
| amd | عمد | ‘Amd | محافظة حضرموت | PPLA2 | 80 | - | 148.74 | mukalla |
| al-udayn | العدين | Al ‘Udayn | محافظة إب | PPLA2 | 80 | - | 20.13 | ibb |
| al-qurh | القرح | Al Qurḩ | محافظة المهرة | PPLA2 | 80 | - | 350.93 | mukalla |
| al-qanawis | القناوص | Al Qanāwiş | محافظة الحديدة | PPLA2 | 80 | - | 79.66 | hodeidah |
| al-qaflah | القفلة | Al Qaflah | محافظة عمران | PPLA2 | 80 | - | 69.08 | saada |
| qaryat-al-qabil | قرية القابل | Qaryat al Qābil | أمانة العاصمة | PPLA2 | 80 | - | 11.27 | sanaa |
| al-munirah | المنيرة | Al Munīrah | محافظة الحديدة | PPLA2 | 80 | - | 58.40 | hodeidah |
| al-misrakh | المسراخ | Al Misrākh | محافظة تعز | PPLA2 | 80 | - | 13.22 | taiz |
| al-milah | الملاح | Al Milāḩ | محافظة لحج | PPLA2 | 80 | - | 74.24 | aden |
| al-mighlaf | المغلاف | Al Mighlāf | محافظة الحديدة | PPLA2 | 80 | - | 60.02 | hodeidah |
| markaz-al-marir | مركز المرير | Markaz al Marīr | محافظة الحديدة | PPLA2 | 80 | - | 63.45 | ibb |
| al-marawi-ah | المراوعة | Al Marāwi‘ah | محافظة الحديدة | PPLA2 | 80 | - | 21.75 | hodeidah |
| al-mansuriyah | المنصورية | Al Manşūrīyah | محافظة الحديدة | PPLA2 | 80 | - | 39.11 | hodeidah |
| al-mansurah | المنصورة | Al Manşūrah | محافظة عدن | PPLA2 | 80 | - | 9.22 | aden |
| al-makhadir | المخادر | Al Makhādir | محافظة إب | PPLA2 | 80 | - | 17.37 | ibb |
| al-mahfid | المحفد | Al Maḩfid | محافظة أبين | PPLA2 | 80 | - | 232.00 | marib |
| al-madu | المضو | Al Madu | محافظة الضالع | PPL | 80 | 1986 | 69.63 | ibb |
| al-luhayyah | اللحية | Al Luḩayyah | محافظة الحديدة | PPLA2 | 80 | - | 104.56 | hodeidah |
| kirsh | كرش | Kirsh | محافظة لحج | PPLA2 | 80 | - | 56.11 | taiz |
| al-khawkhah | الخوخة | Al Khawkhah | محافظة الحديدة | PPLA2 | 80 | - | 87.12 | taiz |
| al-jurbah | الجربة | Al Jurbah | محافظة لحج | PPLA2 | 80 | - | 107.11 | ibb |
| al-jarrahi | الجراحي | Al Jarrāḩī | محافظة الحديدة | PPLA2 | 80 | - | 87.49 | hodeidah |
| al-husayn | الحصين | Al Ḩusayn | محافظة الضالع | PPLA2 | 80 | - | 66.13 | ibb |
| huraydah | حريضة | Ḩurayḑah | محافظة حضرموت | PPLA2 | 80 | - | 154.95 | mukalla |
| al-qatan | القطن | Al Qaţan | محافظة حضرموت | PPLA2 | 80 | - | 161.20 | mukalla |
| al-harf | الحرف | Al Ḩarf | محافظة عمران | PPLA2 | 80 | - | 73.12 | saada |
| hajar-al-mashaikh | حجر المشائخ | Ḩajar al Mashā’ikh | محافظة حضرموت | PPLA2 | 80 | - | 225.23 | mukalla |
| al-burayqah | البريقة | Al Burayqah | محافظة عدن | PPLA2 | 80 | - | 15.46 | aden |
| al-batinah | الباطنة | Al Bāţinah | محافظة حضرموت | PPLA2 | 80 | - | 128.27 | mukalla |
| al-aqir | العاقر | Al ‘Āqir | محافظة شبوة | PPLA2 | 80 | - | 118.36 | marib |
| ahwar | أحور | Aḩwar | محافظة أبين | PPLA2 | 80 | - | 200.89 | aden |
| ad-durayhimi | الدريهمي | Ad Durayhimī | محافظة الحديدة | PPLA2 | 80 | - | 20.89 | hodeidah |
| ad-dis-ash-sharqiyah | الديس الشرقية | Ad Dīs ash Sharqīyah | محافظة حضرموت | PPLA2 | 80 | - | 97.54 | mukalla |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة تعز | PPLA2 | 80 | - | 22.29 | taiz |
| ad-dann | الدن | Ad Dann | محافظة ذمار | PPLA2 | 80 | - | 55.71 | ibb |
| az-zali-ah | الظليعة | Az̧ Z̧alī‘ah | محافظة حضرموت | PPLA2 | 80 | - | 130.23 | mukalla |
| ad-dahi | الضحي | Aḑ Ḑaḩī | محافظة الحديدة | PPLA2 | 80 | - | 48.05 | hodeidah |
| markaz-bilad-at-ta-am | مركز بلاد الطعام | Markaz Bilād aţ Ţa‘ām | محافظة ريمة | PPLA2 | 80 | - | 62.68 | hodeidah |
| al-jum-ah | الجمعة | Al Jum‘ah | محافظة ذمار | PPLA2 | 80 | - | 51.42 | dhamar |
| al-hadiyah | الحدية | Al Ḩadīyah | محافظة ريمة | PPLA2 | 80 | - | 72.81 | hodeidah |
| kusmah | كسمة | Kusmah | محافظة ريمة | PPLA2 | 80 | - | 77.22 | hodeidah |
| riqab | رقاب | Riqāb | محافظة الحديدة | PPLA2 | 80 | - | 55.73 | hodeidah |
| as-sukhnah | السخنة | As Sukhnah | محافظة الحديدة | PPLA2 | 80 | - | 51.79 | hodeidah |
| ar-rujum | الرجم | Ar Rujum | محافظة المحويت | PPLA2 | 80 | - | 60.70 | sanaa |
| al-maghrabah | المغربة | Al Maghrabah | محافظة حجة | PPLA2 | 80 | - | 79.63 | sanaa |
| as-sararah | الصرارة | Aş Şarārah | محافظة عمران | PPLA2 | 80 | - | 58.45 | sanaa |
| an-nasirah | الناصرة | An Nāşirah | محافظة عمران | PPLA2 | 80 | - | 60.71 | sanaa |
| mabyan | مبين | Mabyan | محافظة حجة | PPLA2 | 80 | - | 79.31 | sanaa |
| matnah | متنة | Matnah | محافظة صنعاء | PPLA2 | 80 | - | 22.01 | sanaa |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة صنعاء | PPLA2 | 80 | - | 40.95 | sanaa |
| an-nusub | النصب | An Nuşub | محافظة صعدة | PPL | 80 | 36 | 26.35 | saada |
| as-sahah | الساحة | As Sāḩah | محافظة صعدة | PPL | 80 | 119 | 15.90 | saada |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة صعدة | PPL | 80 | 11 | 17.28 | saada |
| ad-darb | الدرب | Ad Darb | محافظة صعدة | PPL | 80 | 53 | 9.11 | saada |
| sifyan | سفيان | Sifyān | محافظة صعدة | PPL | 80 | 92 | 7.81 | saada |
| al-khays | الخيس | Al Khays | محافظة صعدة | PPL | 80 | 30 | 45.82 | saada |
| al-hashwah | الحشوة | Al Ḩashwah | محافظة صعدة | PPLA2 | 80 | - | 54.67 | saada |
| al-mawsatah | الموسطة | Al Mawsaţah | محافظة صعدة | PPL | 80 | 39 | 50.86 | saada |
| sibahalah | سبهلة | Sibahalah | محافظة صعدة | PPL | 80 | 98 | 9.82 | saada |
| al-qabil | القابل | Al Qābil | محافظة صعدة | PPL | 80 | 180 | 11.72 | saada |
| al-ishash | العشاش | Al ‘Ishāsh | محافظة صعدة | PPL | 80 | 169 | 16.34 | saada |
| qayf-saqayn | قيف ساقين | Qayf Sāqayn | محافظة صعدة | PPL | 80 | 51 | 26.99 | saada |
| al-ashraf | الأشراف | Al Ashrāf | محافظة صعدة | PPL | 80 | 40 | 30.14 | saada |
| al-khirab | الخراب | Al Khirāb | محافظة صعدة | PPL | 80 | 12 | 30.37 | saada |
| al-husayn | آل حسين | Āl Ḩusayn | محافظة صعدة | PPL | 80 | 123 | 14.91 | saada |
| bin-hunaysh | بن حنيش | Bin Ḩunaysh | محافظة الجوف | PPL | 80 | 46 | 53.72 | saada |
| al-mahjal | المحجل | Al Maḩjal | محافظة الجوف | PPLA2 | 80 | - | 118.16 | saada |
| rajuzah | رجوزة | Rajūzah | محافظة الجوف | PPLA2 | 80 | - | 74.24 | saada |
| haram-al-maranah | حرم المرانة | Ḩaram al Marānah | محافظة الجوف | PPL | 80 | 147 | 74.84 | saada |
| al-humaydat | الحميدات | Al Ḩumaydāt | محافظة الجوف | PPLA2 | 80 | - | 87.16 | saada |
| al-mawsatah | الموسطة | Al Mawsaţah | محافظة الجوف | PPL | 80 | 119 | 75.49 | saada |
| al-madan | المدان | Al Madān | محافظة عمران | PPLA2 | 80 | - | 80.64 | saada |
| al-ashshah | العشة | Al ‘Ashshah | محافظة عمران | PPLA2 | 80 | - | 76.64 | saada |
| hisn-bani-sa-d | حصن بني سعد | Ḩişn Banī Sa‘d | محافظة الجوف | PPLA2 | 80 | - | 105.03 | sanaa |
| al-matun | المتون | Al Matūn | محافظة الجوف | PPLA2 | 80 | - | 104.62 | sanaa |
| al-maslub | المصلوب | Al Maşlūb | محافظة الجوف | PPLA2 | 80 | - | 101.72 | sanaa |
| al-ghayl | الغيل | Al Ghayl | محافظة الجوف | PPLA2 | 80 | - | 97.36 | sanaa |
| al-jamimah | الجميمة | Al Jamīmah | محافظة حجة | PPLA2 | 80 | - | 96.18 | sanaa |
| habur | حبور | Ḩabūr | محافظة عمران | PPLA2 | 80 | - | 91.80 | sanaa |
| ar-rubu | الربوع | Ar Rubū‘ | محافظة تعز | PPLA2 | 80 | - | 27.70 | taiz |
| maqbanah | مقبنة | Maqbanah | محافظة تعز | PPLA2 | 80 | - | 37.25 | taiz |
| ar-ridai | الرضائي | Ar Riḑā’ī | محافظة إب | PPLA2 | 80 | - | 23.42 | ibb |
| al-mayfaah | الميفعة | Al Mayfa’ah | محافظة ذمار | PPLA2 | 80 | - | 18.49 | dhamar |
| ar-radmah | الرضمة | Ar Raḑmah | محافظة إب | PPLA2 | 80 | - | 41.77 | dhamar |
| zakhim | زخم | Zakhim | محافظة البيضاء | PPLA2 | 80 | - | 41.66 | dhamar |
| maswarah | مسورة | Maswarah | محافظة البيضاء | PPLA2 | 80 | - | 132.26 | marib |
| tawr-al-bahah | طور الباحة | Ţawr al Bāḩah | محافظة لحج | PPLA2 | 80 | - | 53.53 | taiz |
| nakhlan | نخلان | Nakhlān | محافظة حجة | PPL | 80 | 16 | 125.86 | saada |
| kushar | كشر | Kushar | محافظة حجة | PPLA2 | 80 | - | 94.61 | saada |
| aslam | أسلم | Aslam | محافظة حجة | PPLA2 | 80 | - | 108.39 | saada |
| al-kidf | الكدف | Al Kidf | محافظة حجة | PPL | 80 | 46 | 98.31 | saada |
| al-qarn | القرن | Al Qarn | محافظة حجة | PPL | 80 | 48 | 98.01 | saada |
| haydan | حيدان | Ḩaydān | محافظة صعدة | PPLA2 | 80 | - | 39.41 | saada |
| al-miftah | المفتاح | Al Miftāḩ | محافظة حجة | PPLA2 | 80 | - | 102.89 | sanaa |
| al-harjah | الحرجة | Al Ḩarjah | محافظة مأرب | PPLA2 | 80 | - | 52.59 | sanaa |
| bani-an-nahari | بني النهاري | Banī an Nahārī | محافظة حجة | PPLA2 | 80 | - | 74.36 | sanaa |
| al-halafah | الحلفة | Al Ḩalafah | محافظة الجوف | PPL | 80 | 9 | 82.71 | saada |
| rawban | روبان | Rawbān | محافظة الجوف | PPL | 80 | 19 | 82.12 | saada |
| ash-sharahah | الشراحة | Ash Sharāḩah | محافظة الجوف | PPL | 80 | 3 | 113.81 | saada |
| qaryat-bin-jaran | بني جدان | Qaryat Bin Jarān | محافظة صعدة | PPL | 80 | 41 | 52.18 | saada |
| thal | الهوبج | Thāl | محافظة صعدة | PPL | 80 | 9 | 55.97 | saada |
| bir-qusaym | بير منيمر | Bi’r Qusaym | محافظة صعدة | PPL | 80 | 1 | 43.49 | saada |
| al-ja-milah | الجعملة | Al Ja‘milah | محافظة صعدة | PPL | 80 | 137 | 28.34 | saada |
| ma-it | ماعط | Mā‘iţ | محافظة صعدة | PPL | 80 | 48 | 20.79 | saada |
| ar-rajaw | الرجو | Ar Rajaw | محافظة صعدة | PPL | 80 | 4 | 24.75 | saada |
| al-habajir | آل حباجر | Āl Ḩabājir | محافظة صعدة | PPL | 80 | 39 | 9.25 | saada |
| al-ibyan | الإبين | Āl Ibyan | محافظة صعدة | PPL | 80 | 77 | 7.38 | saada |
| al-kuzaz | الكزاز | Al Kuzāz | محافظة صعدة | PPL | 80 | 43 | 10.41 | saada |
| al-hijrah | الهجرة | Al Hijrah | محافظة صعدة | PPLA2 | 80 | - | 56.40 | saada |
| suq-al-khamis | سوق الخميس | Sūq al Khamīs | محافظة صعدة | PPLA2 | 80 | - | 57.20 | saada |
| al-mashaf | المشاف | Al Mashāf | محافظة صعدة | PPLA2 | 80 | - | 60.87 | saada |
| al-qabal | القبل | Al Qabal | محافظة صعدة | PPL | 80 | 40 | 27.73 | saada |
| al-mishraq | المشراق | Al Mishrāq | محافظة صعدة | PPL | 80 | 19 | 27.86 | saada |
| habr | حبر | Ḩabr | محافظة صعدة | PPL | 80 | 23 | 28.23 | saada |
| dabyan | ضبيان | Ḑabyān | محافظة صعدة | PPL | 80 | 6 | 27.97 | saada |
| hamak | حمك | Ḩamak | محافظة صعدة | PPL | 80 | 6 | 28.11 | saada |
| al-kharab | الخراب | Al Kharāb | محافظة صعدة | PPLA2 | 80 | - | 45.52 | saada |
| ar-razwi | الرزوي | Ar Razwī | محافظة حجة | PPL | 80 | 8 | 100.87 | saada |
| bani-qarras | بني قراص | Banī Qarrāş | محافظة حجة | PPL | 80 | 17 | 102.75 | saada |
| al-haramilah | الحراملة | Al Ḩarāmilah | محافظة حجة | PPL | 80 | 30 | 116.88 | saada |
| al-khabrayah | الخبراية | Al Khabrāyah | محافظة حجة | PPL | 80 | 17 | 115.25 | saada |
| qaryat-ad-da-is | قرية الدعيس | Qaryat ad Da‘īs | محافظة إب | PPLA2 | 80 | - | 10.16 | ibb |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة صعدة | PPL | 80 | 16 | 18.02 | saada |
| al-hajjaj | آل حجاج | Āl Ḩajjāj | محافظة صعدة | PPL | 80 | 42 | 7.99 | saada |
| kuddad | كداد | Kuddād | محافظة صعدة | PPL | 80 | 118 | 15.87 | saada |
| bayt-shani | بيت شنيع | Bayt Shanī‘ | محافظة صنعاء | PPL | 80 | 20 | 18.77 | sanaa |
| bayt-al-hisam | بيت الحسام | Bayt al Ḩisām | محافظة صنعاء | PPL | 80 | 34 | 17.50 | sanaa |
| bayt-bishr | بيت بشر | Bayt Bishr | محافظة صنعاء | PPL | 80 | 23 | 18.45 | sanaa |
| al-afarah | العفرة | Al ‘Afarah | محافظة صعدة | PPL | 80 | 25 | 39.51 | saada |
| al-akhshub | الأخشب | Al Akhshub | محافظة صعدة | PPL | 80 | 14 | 51.06 | saada |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة صعدة | PPL | 80 | 20 | 45.97 | saada |
| al-hayd | الحيد | Al Ḩayd | محافظة صعدة | PPL | 80 | 35 | 31.10 | saada |
| al-jawwah-al-khatar | الجوة | Al Jawwah al Khaţār | محافظة صعدة | PPL | 80 | 25 | 47.34 | saada |
| al-juma-iyah | الجماعية | Al Jumā‘īyah | محافظة صعدة | PPL | 80 | 14 | 50.34 | saada |
| al-khanaq | الخنق | Al Khanaq | محافظة صعدة | PPL | 80 | 17 | 40.16 | saada |
| al-mutawahiyah | المتوحية | Al Mutawaḩīyah | محافظة صعدة | PPL | 80 | 21 | 51.90 | saada |
| al-qabil | القابل | Al Qābil | محافظة صعدة | PPL | 80 | 8 | 45.11 | saada |
| as-sallamiyah | السلامية | As Sallāmīyah | محافظة صعدة | PPL | 80 | 8 | 42.85 | saada |
| as-sudrah | الصدرة | Aş Şudrah | محافظة صعدة | PPL | 80 | 12 | 47.93 | saada |
| damrah | ضمرة | Ḑamrah | محافظة صعدة | PPL | 80 | 17 | 48.84 | saada |
| darb-as-sufah | درب الصفاه | Darb aş Şufāh | محافظة صعدة | PPL | 80 | 20 | 41.21 | saada |
| hafsah | حفصة | Ḩafşah | محافظة صعدة | PPL | 80 | 19 | 47.86 | saada |
| adh-dhiyab | الذياب | Adh Dhiyāb | محافظة صعدة | PPL | 80 | 12 | 49.74 | saada |
| nawwash | نواش | Nawwāsh | محافظة صعدة | PPL | 80 | 27 | 36.84 | saada |
| watan-al-maqash | وطن المقاش | Waţan al Maqāsh | محافظة صعدة | PPL | 80 | 46 | 44.02 | saada |
| ad-dahrah | الدحرة | Ad Daḩrah | محافظة صعدة | PPL | 80 | 18 | 32.04 | saada |
| tharbah | ثربة | Tharbah | محافظة الجوف | PPL | 80 | 13 | 55.17 | saada |
| al-waza | الوزاء | Al Wazā’ | محافظة الجوف | PPL | 80 | 107 | 74.52 | saada |
| al-miqati-ah | المقاطعة | Al Miqāţi‘ah | محافظة حجة | PPL | 80 | 46 | 102.08 | saada |
| ash-shabakiyah | الشباكية | Ash Shabākīyah | محافظة حجة | PPL | 80 | 17 | 107.38 | saada |
| dughayj | دغيج | Dughayj | محافظة حجة | PPL | 80 | 29 | 101.44 | saada |
| al-muqatibah | المقاطبة | Al Muqāţibah | محافظة حجة | PPL | 80 | 23 | 99.95 | saada |
| aftah | عفطة | ‘Afţah | محافظة حجة | PPL | 80 | 26 | 97.71 | saada |
| aqmat-sihayl | عقمة سهيل | ‘Aqmat Sihayl | محافظة حجة | PPL | 80 | 26 | 96.97 | saada |
| bani-urjan | بني عرجان | Banī ‘Urjān | محافظة حجة | PPL | 80 | 65 | 123.89 | saada |
| dayr-abkar | دير أبكر | Dayr Abkar | محافظة حجة | PPL | 80 | 13 | 119.93 | saada |
| al-markuzah | المركوزة | Al Markūzah | محافظة حجة | PPL | 80 | 43 | 96.89 | saada |
| quzzan | قزان | Quzzān | محافظة حجة | PPL | 80 | 25 | 124.31 | saada |
| al-jirfah | الجرفة | Al Jirfah | محافظة حجة | PPL | 80 | 30 | 99.23 | saada |
| al-muqdar | المقدر | Al Muqdar | محافظة حجة | PPL | 80 | 32 | 104.43 | saada |
| dayr-dhiyab | دير ذياب | Dayr Dhiyāb | محافظة حجة | PPL | 80 | 53 | 110.48 | saada |
| a-waj | أعوج | A‘waj | محافظة صعدة | PPL | 80 | 46 | 9.06 | saada |
| ad-dawar | الدوار | Ad Dawār | محافظة صعدة | PPL | 80 | 67 | 12.48 | saada |
| rayd-anam | ريد عنم | Rayd ‘Anam | محافظة صعدة | PPL | 80 | 17 | 17.35 | saada |
| sawdan | سودان | Sawdān | محافظة صعدة | PPL | 80 | 110 | 10.59 | saada |
| shi-ab-al-alb | شعاب العلب | Shi‘āb al ‘Alb | محافظة صعدة | PPL | 80 | 33 | 11.74 | saada |
| suwayh | صويح | Suwayḩ | محافظة صعدة | PPL | 80 | 9 | 28.42 | saada |
| wahabah | وهابة | Wahābah | محافظة صعدة | PPL | 80 | 6 | 26.30 | saada |
| yaharah | يهرة | Yaharah | محافظة صعدة | PPL | 80 | 73 | 9.88 | saada |
| al-amidah | العميدة | Al ‘Amīdah | محافظة صعدة | PPL | 80 | 39 | 15.89 | saada |
| al-uqab | آل عقاب | Āl ‘Uqāb | محافظة صعدة | PPL | 80 | 109 | 5.18 | saada |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة صعدة | PPL | 80 | 7 | 17.56 | saada |
| as-sa-ib | الصعيب | Aş Şa‘īb | محافظة صعدة | PPL | 80 | 36 | 13.41 | saada |
| al-surabi | آل سربي | Āl Surabī | محافظة صعدة | PPL | 80 | 91 | 9.01 | saada |
| al-barakat | البركات | Al Barakāt | محافظة صعدة | PPL | 80 | 61 | 11.28 | saada |
| al-bizawah | البزاوة | Al Bizāwah | محافظة صعدة | PPL | 80 | 42 | 10.26 | saada |
| al-buq-ah | البقعة | Al Buq‘ah | محافظة صعدة | PPL | 80 | 10 | 9.30 | saada |
| al-hadabah | الحدبة | Al Ḩadabah | محافظة صعدة | PPL | 80 | 39 | 26.02 | saada |
| al-hadirah | الحضيرة | Al Ḩaḑīrah | محافظة صعدة | PPL | 80 | 21 | 9.25 | saada |
| al-jassar | الجسار | Al Jassār | محافظة صعدة | PPL | 80 | 59 | 13.48 | saada |
| al-ma-tin | المعطن | Al Ma‘ţin | محافظة صعدة | PPL | 80 | 3 | 26.02 | saada |
| al-mahwal | المحول | Al Maḩwal | محافظة صعدة | PPL | 80 | 3 | 25.21 | saada |
| al-makannah-sabar | المكنة | Al Makannah Şabar | محافظة صعدة | PPL | 80 | 28 | 13.63 | saada |
| al-ma-mar | المعمر | Al Ma‘mar | محافظة صعدة | PPL | 80 | 21 | 5.78 | saada |
| al-mas-ud | آل مسعود | Āl Mas‘ūd | محافظة صعدة | PPL | 80 | 64 | 4.28 | saada |
| al-qanabirah | القنابرة | Al Qanābirah | محافظة صعدة | PPL | 80 | 10 | 12.20 | saada |
| al-uqal | العقل | Al ‘Uqal | محافظة صعدة | PPL | 80 | 19 | 31.66 | saada |
| alt-al-umari | الت العمري | Alt al ‘Umarī | محافظة صعدة | PPL | 80 | 11 | 27.22 | saada |
| al-say-ar | آل صيعر | Āl Şay‘ar | محافظة صعدة | PPL | 80 | 13 | 30.39 | saada |
| an-najd | النجد | An Najd | محافظة صعدة | PPL | 80 | 22 | 29.14 | saada |
| an-nubhan | النبهان | An Nubhān | محافظة صعدة | PPL | 80 | 17 | 15.09 | saada |
| an-nuhud | النهود | An Nuhūd | محافظة صعدة | PPL | 80 | 73 | 8.69 | saada |
| ar-rabrabah | الربربة | Ar Rabrabah | محافظة صعدة | PPL | 80 | 3 | 28.66 | saada |
| ar-rukub | الركوب | Ar Rukūb | محافظة صعدة | PPL | 80 | 30 | 12.71 | saada |
| ar-rusa | الرصاع | Ar Ruşā‘ | محافظة صعدة | PPL | 80 | 5 | 29.61 | saada |
| as-safra | الصفراء | Aş Şafrā | محافظة صعدة | PPL | 80 | 52 | 9.44 | saada |
| ash-shibhah | الشبحة | Ash Shibḩah | محافظة صعدة | PPL | 80 | 19 | 28.18 | saada |
| ash-shurh | الشرح | Ash Shurḩ | محافظة صعدة | PPL | 80 | 78 | 11.67 | saada |
| az-zubayrah | الزبيرة | Az Zubayrah | محافظة صعدة | PPL | 80 | 49 | 11.52 | saada |
| dhi-akbiran | ذي عكبران | Dhī ‘Akbirān | محافظة صعدة | PPL | 80 | 28 | 10.60 | saada |
| dhu-husayn | ذو حسين | Dhū Ḩusayn | محافظة صعدة | PPL | 80 | 57 | 10.91 | saada |
| farwah | فروة | Farwah | محافظة صعدة | PPL | 80 | 160 | 9.36 | saada |
| haris | حريس | Ḩarīs | محافظة صعدة | PPL | 80 | 29 | 26.89 | saada |
| haris | حريس | Ḩarīs | محافظة صعدة | PPL | 80 | 44 | 8.36 | saada |
| harjab | حرجب | Ḩarjab | محافظة صعدة | PPL | 80 | 11 | 27.82 | saada |
| ibn-hasan | إبن حسن | Ibn Ḩasan | محافظة صعدة | PPL | 80 | 9 | 16.89 | saada |
| al-musalli | المسلي | Al Musallī | محافظة صعدة | PPL | 80 | 51 | 14.74 | saada |
| ibn-tawwah | الة توة | Ibn Tawwah | محافظة صعدة | PPL | 80 | 24 | 20.52 | saada |
| ja-dab | جعدب | Ja‘dab | محافظة صعدة | PPL | 80 | 28 | 12.80 | saada |
| kabbin | كبين | Kabbīn | محافظة صعدة | PPL | 80 | 21 | 25.40 | saada |
| al-ubaydi | العبيدي | Al ‘Ubaydī | محافظة صعدة | PPL | 80 | 58 | 14.25 | saada |
| khilbanah | خلبانة | Khilbānah | محافظة صعدة | PPL | 80 | 4 | 26.08 | saada |
| bayt-mijammil | بيت مجمل | Bayt Mijammil | محافظة صعدة | PPL | 80 | 11 | 27.36 | saada |
| mahzah | محظة | Maḩz̧ah | محافظة صعدة | PPL | 80 | 6 | 5.00 | saada |
| mu-aniq | معانق | Mu‘āniq | محافظة صعدة | PPL | 80 | 19 | 12.11 | saada |
| muhayt | محيط | Muḩayţ | محافظة صعدة | PPL | 80 | 121 | 10.19 | saada |
| an-najd | النجد | An Najd | محافظة البيضاء | PPLA2 | 80 | - | 97.33 | dhamar |
| al-amud | العمود | Al ‘Amūd | محافظة مأرب | PPLA2 | 80 | - | 83.92 | marib |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة البيضاء | PPLA2 | 80 | - | 51.76 | dhamar |
| ad-danifah-aldnft | Ad Danifah الدنفة | Ad Danifah الدنفة | محافظة المحويت | PPL | 80 | 450 | 77.74 | sanaa |
| al-murnaf | المرناف | Al Murnāf | محافظة حجة | PPL | 80 | 59 | 121.38 | saada |
| al-batil | الباطل | Al Bāţil | محافظة حجة | PPL | 80 | 80 | 121.58 | saada |
| ad-damash | الدمش | Ad Damash | محافظة حجة | PPL | 80 | 42 | 88.04 | saada |
| al-aksh | العكش | Al ‘Aksh | محافظة حجة | PPL | 80 | 61 | 90.10 | saada |
| al-arradah | العرادة | Al ‘Arrādah | محافظة حجة | PPL | 80 | 12 | 87.91 | saada |
| al-kharazah | الخرازة | Al Kharāzah | محافظة حجة | PPL | 80 | 18 | 77.07 | saada |
| al-khurshah | الخرشة | Al Khurshah | محافظة حجة | PPL | 80 | 18 | 88.21 | saada |
| al-kurdiyah | الكردية | Al Kurdīyah | محافظة حجة | PPL | 80 | 29 | 99.68 | saada |
| al-balayit | البلايط | Al Balāyiţ | محافظة حجة | PPL | 80 | 16 | 99.13 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة حجة | PPL | 80 | 9 | 101.26 | saada |
| al-qarn | القرن | Al Qarn | محافظة حجة | PPL | 80 | 6 | 100.60 | saada |
| ar-rawn | الرون | Ar Rawn | محافظة حجة | PPL | 80 | 10 | 97.81 | saada |
| as-sayabah | الصيابة | Aş Şayābah | محافظة حجة | PPL | 80 | 14 | 97.66 | saada |
| salban | سلبان | Salbān | محافظة صعدة | PPL | 80 | 25 | 86.57 | saada |
| ghuraz | غراز | Ghurāz | محافظة صعدة | PPL | 80 | 137 | 4.20 | saada |
| hawrah | حورة | Ḩawrah | محافظة تعز | PPLA2 | 80 | - | 28.14 | taiz |
| al-balad-al-fawqiyah | البلاد الفوقية | Al Balād al Fawqīyah | محافظة المهرة | PPL | 80 | 80 | 235.37 | mukalla |
| bayt-al-hazil-al-jari | بيت الهازل الجري | Bayt al Hāzil al Jarī | محافظة حجة | PPL | 80 | 8 | 132.62 | hodeidah |
| buyut-al-majazibi | بيوت المجازبي | Buyūt al Majāzibī | محافظة حجة | PPL | 80 | 10 | 133.03 | hodeidah |
| ad-dabaiyah | الدباعية | Ad Dabā‘īyah | محافظة حجة | PPL | 80 | 29 | 135.89 | hodeidah |
| as-sawalimah | السوالمة | As Sawālimah | محافظة حجة | PPL | 80 | 2 | 134.78 | hodeidah |
| al-majashinah | المجاشنة | Al Majāshinah | محافظة حجة | PPL | 80 | 3 | 134.52 | hodeidah |
| al-haramilah | الحراملة | Al Ḩarāmilah | محافظة حجة | PPL | 80 | 50 | 105.09 | saada |
| ad-duraysh | الدريش | Ad Duraysh | محافظة حجة | PPL | 80 | 14 | 101.88 | saada |
| makhshush | مخشوش | Makhshūsh | محافظة حجة | PPL | 80 | 12 | 96.76 | saada |
| al-mutawwalah | المطولة | Al Muţawwalah | محافظة حجة | PPL | 80 | 44 | 102.06 | saada |
| al-mashariqah | المشارقة | Al Mashāriqah | محافظة حجة | PPL | 80 | 2 | 101.52 | saada |
| as-sawalimah | السوالمة | As Sawālimah | محافظة حجة | PPL | 80 | 21 | 130.32 | saada |
| al-mararah | المررة | Al Mararah | محافظة حجة | PPL | 80 | 48 | 129.88 | saada |
| bani-akkad | بني عكاد | Banī ‘Akkād | محافظة حجة | PPL | 80 | 2 | 129.45 | saada |
| al-bahailah-ash-sharqiyah | البهائلة الشرقية | Al Bahā’ilah ash Sharqīyah | محافظة حجة | PPL | 80 | 11 | 128.93 | saada |
| at-tawahirah | الطواهرة | Aţ Ţawāhirah | محافظة حجة | PPL | 80 | 31 | 128.81 | saada |
| bani-yamani | بني يماني | Banī Yamānī | محافظة حجة | PPL | 80 | 20 | 129.40 | saada |
| al-maqatiah | المقاطعة | Al Maqāţi‘ah | محافظة حجة | PPL | 80 | 13 | 129.98 | saada |
| al-makasirah | المكاسرة | Al Makāsirah | محافظة حجة | PPL | 80 | 39 | 128.64 | saada |
| al-khabashiyah | الخباشية | Al Khabāshīyah | محافظة حجة | PPL | 80 | 5 | 133.77 | saada |
| al-bahailah | البهائلة | Al Bahā’ilah | محافظة حجة | PPL | 80 | 9 | 127.54 | saada |
| al-majashinah | المجاشنة | Al Majāshinah | محافظة حجة | PPL | 80 | 16 | 127.47 | saada |
| bani-al-makki | بني المكي | Banī al Makkī | محافظة حجة | PPL | 80 | 8 | 127.17 | saada |
| jaidi | جعيدي | Ja‘īdī | محافظة حجة | PPL | 80 | 1 | 129.44 | saada |
| al-ghubdat | الغويدات | Al Ghūbdāt | محافظة حجة | PPL | 80 | 13 | 109.93 | saada |
| al-binayah | البنايـة | Al Bināyah | محافظة حجة | PPL | 80 | 18 | 111.81 | saada |
| at-tuwal | الطوال | Aţ Ţuwāl | محافظة حجة | PPL | 80 | 33 | 111.40 | saada |
| ad-dawfash | الدوفش | Ad Dawfash | محافظة حجة | PPL | 80 | 5 | 113.83 | saada |
| al-khabt-al-athm | الخبت الاثم | Al Khabt al Athm | محافظة حجة | PPL | 80 | 14 | 111.97 | saada |
| ad-dinalah | الدنالة | Ad Dinālah | محافظة حجة | PPL | 80 | 10 | 111.68 | saada |
| ar-rawn | الرون | Ar Rawn | محافظة حجة | PPL | 80 | 5 | 111.75 | saada |
| al-qaym | القيم | Al Qaym | محافظة حجة | PPL | 80 | 19 | 113.44 | saada |
| al-aqm | العقم | Al ‘Aqm | محافظة حجة | PPL | 80 | 7 | 115.30 | saada |
| bayt-majuri | بيت مجوري | Bayt Majūrī | محافظة حجة | PPL | 80 | 13 | 113.56 | saada |
| al-qaryah | القريـة | Al Qaryah | محافظة حجة | PPL | 80 | 8 | 112.77 | saada |
| ar-rahah | الراحة | Ar Rāḩah | محافظة حجة | PPL | 80 | 50 | 121.89 | saada |
| al-asmah | العصمة | Al ‘Aşmah | محافظة حجة | PPL | 80 | 24 | 121.71 | saada |
| bani-bari | بني باري | Banī Bārī | محافظة حجة | PPL | 80 | 9 | 120.38 | saada |
| bushinah | بوشينة | Būshīnah | محافظة حجة | PPL | 80 | 7 | 119.30 | saada |
| al-majarishah | المجارشة | Al Majārishah | محافظة حجة | PPL | 80 | 10 | 120.49 | saada |
| bani-shaywar | بني شيور | Banī Shaywar | محافظة حجة | PPL | 80 | 10 | 118.00 | saada |
| as-sarah | الصرة | Aş Şarah | محافظة حجة | PPL | 80 | 32 | 119.31 | saada |
| bani-makki | بني مكي | Banī Makkī | محافظة حجة | PPL | 80 | 7 | 120.04 | saada |
| al-maqriyah | المقرية | Al Maqrīyah | محافظة حجة | PPL | 80 | 3 | 119.89 | saada |
| hayyashah | هياشة | Hayyāshah | محافظة حجة | PPL | 80 | 3 | 120.13 | saada |
| as-suwayd | السويد | As Suwayd | محافظة حجة | PPL | 80 | 37 | 121.80 | saada |
| ash-shuaybah | الشعيبة | Ash Shu‘aybah | محافظة حجة | PPL | 80 | 24 | 119.34 | saada |
| al-qahum | القحوم | Al Qaḩūm | محافظة حجة | PPL | 80 | 21 | 121.94 | saada |
| as-saddaqiyah | الصداقية | Aş Şaddāqīyah | محافظة حجة | PPL | 80 | 17 | 120.88 | saada |
| bani-aqil | بني عقيل | Banī ‘Aqīl | محافظة حجة | PPL | 80 | 15 | 117.96 | saada |
| al-jarabihah | الجرابحة | Al Jarābiḩah | محافظة حجة | PPL | 80 | 20 | 117.36 | saada |
| qabarah | قبارة | Qabārah | محافظة حجة | PPL | 80 | 15 | 117.94 | saada |
| al-amashiyah | العماشية | Al ‘Amāshīyah | محافظة حجة | PPL | 80 | 3 | 118.29 | saada |
| al-khazzan | الخزان | Al Khazzān | محافظة حجة | PPL | 80 | 46 | 121.36 | saada |
| az-zawbalah | الزوبلة | Az Zawbalah | محافظة حجة | PPL | 80 | 19 | 99.79 | saada |
| al-musawwadiyah | المسودية | Al Musawwadīyah | محافظة حجة | PPL | 80 | 15 | 99.09 | saada |
| al-adhir | العذير | Al ‘Adhīr | محافظة حجة | PPL | 80 | 5 | 103.41 | saada |
| bani-al-adabi | بني العضابي | Banī al ‘Aḑābī | محافظة حجة | PPL | 80 | 12 | 128.78 | saada |
| al-majd-wa-al-mughtaribin | المجد و المغتربين | Al Majd wa al Mughtaribīn | محافظة حجة | PPL | 80 | 108 | 120.01 | saada |
| bani-shayi | بني شايع | Banī Shāyi‘ | محافظة حجة | PPL | 80 | 13 | 121.16 | saada |
| al-ajimiyah | الأعجمية | Al A‘jimīyah | محافظة حجة | PPL | 80 | 19 | 101.78 | saada |
| ar-rashadilah-al-yamani | الرشادلة اليمنى | Ar Rashādilah al Yamanī | محافظة حجة | PPL | 80 | 18 | 115.73 | saada |
| ath-thamar | الثمار | Ath Thamār | محافظة حجة | PPL | 80 | 11 | 106.12 | saada |
| al-maqradah | المقردة | Al Maqradah | محافظة حجة | PPL | 80 | 7 | 105.65 | saada |
| an-nasim | النسيم | An Nasīm | محافظة حجة | PPL | 80 | 111 | 120.56 | saada |
| ar-rizum | الرزوم | Ar Rizūm | محافظة حجة | PPL | 80 | 34 | 120.77 | saada |
| mahall-al-ghazi | محل الغازي | Maḩall al Ghāzī | محافظة حجة | PPL | 80 | 64 | 120.82 | saada |
| abu-ghuraysh | أبو غريش | Abū Ghuraysh | محافظة حجة | PPL | 80 | 19 | 121.59 | saada |
| al-qarush-al-gharbiyah | القروش الغربية | Al Qarūsh al Gharbīyah | محافظة حجة | PPL | 80 | 24 | 121.48 | saada |
| al-jarabiyah | الجرابية | Al Jarābīyah | محافظة حجة | PPL | 80 | 30 | 120.81 | saada |
| al-azamiyah | العزمية | Al ‘Azamīyah | محافظة حجة | PPL | 80 | 2 | 124.21 | saada |
| maras | معراص | Ma‘rāş | محافظة حجة | PPL | 80 | 22 | 122.14 | saada |
| bin-ali-aswad | بن علي أسود | Bin ‘Alī Aswad | محافظة حجة | PPL | 80 | 7 | 128.93 | saada |
| bin-al-hanabi | بن الحنبي | Bin al Ḩanabī | محافظة حجة | PPL | 80 | 15 | 127.87 | saada |
| at-tawil | الطويل | Aţ Ţawīl | محافظة حجة | PPL | 80 | 45 | 126.86 | saada |
| bayt-muhammad-ali | بيت محمد علي | Bayt Muḩammad ‘Alī | محافظة حجة | PPL | 80 | 7 | 123.94 | saada |
| samitah | سامطة | Sāmiţah | محافظة حجة | PPL | 80 | 21 | 123.84 | saada |
| dayr-al-mihnab | دير المحنب | Dayr al Miḩnab | محافظة حجة | PPL | 80 | 7 | 123.66 | saada |
| al-quwadir | القوادر | Al Quwādir | محافظة حجة | PPL | 80 | 16 | 111.13 | saada |
| as-sakkah | السكــة | As Sakkah | محافظة حجة | PPL | 80 | 3 | 110.89 | saada |
| dayr-abadah | دير عبدة | Dayr ‘Abadah | محافظة حجة | PPL | 80 | 9 | 111.30 | saada |
| al-malakhah | الملاخة | Al Malākhah | محافظة حجة | PPL | 80 | 11 | 114.51 | saada |
| al-jurb | الجرب | Al Jurb | محافظة حجة | PPL | 80 | 5 | 114.19 | saada |
| jurb-al-abal | جرب الأبل | Jurb al Abal | محافظة حجة | PPL | 80 | 5 | 107.97 | saada |
| al-mahar | المعهر | Al Ma‘har | محافظة حجة | PPL | 80 | 8 | 107.11 | saada |
| al-jurbah | الجربة | Al Jurbah | محافظة حجة | PPL | 80 | 2 | 106.50 | saada |
| ad-dakhil | الداخل | Ad Dākhil | محافظة حجة | PPL | 80 | 19 | 115.99 | saada |
| bayt-adh-dhubaydi | بيت الذبيدي | Bayt adh Dhubaydī | محافظة حجة | PPL | 80 | 7 | 117.82 | saada |
| al-muqarimah | المفارمة | Al Muqārimah | محافظة حجة | PPL | 80 | 17 | 117.24 | saada |
| al-anifah | الأنفة | Al Anifah | محافظة حجة | PPL | 80 | 17 | 116.91 | saada |
| shuwai-harib | شوعي هارب | Shuwa‘ī Hārib | محافظة حجة | PPL | 80 | 8 | 113.69 | saada |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة حجة | PPL | 80 | 3 | 110.02 | saada |
| ar-radhah | الردحة | Ar Radḩah | محافظة حجة | PPL | 80 | 3 | 110.03 | saada |
| al-aqaid | العقائد | Al ‘Aqā’id | محافظة حجة | PPL | 80 | 12 | 112.45 | saada |
| bani-sadiq | بني صديق | Banī Şadīq | محافظة حجة | PPL | 80 | 13 | 117.61 | saada |
| bayt-bani-qahtan | بيت بني قحطان | Bayt Banī Qaḩţān | محافظة حجة | PPL | 80 | 56 | 118.58 | saada |
| al-uqil | العقيل | Al ‘Uqīl | محافظة حجة | PPL | 80 | 8 | 100.24 | saada |
| lujj-faraj | لـج فـرج | Lujj Faraj | محافظة حجة | PPL | 80 | 5 | 102.51 | saada |
| dayr-at-tawil | دير الطويل | Dayr aţ Ţawīl | محافظة حجة | PPL | 80 | 11 | 102.48 | saada |
| al-kharraq | الخرق | Al Kharraq | محافظة حجة | PPL | 80 | 7 | 100.91 | saada |
| shati-umar | شاطي عمر | Shāţī ‘Umar | محافظة حجة | PPL | 80 | 4 | 103.19 | saada |
| al-marafi | المراوغ | Al Marāfi‘ | محافظة حجة | PPL | 80 | 3 | 103.99 | saada |
| ash-shaub | الشعوب | Ash Sha‘ūb | محافظة حجة | PPL | 80 | 3 | 105.46 | saada |
| al-marawih | المراوح | Al Marāwiḩ | محافظة حجة | PPL | 80 | 2 | 105.89 | saada |
| juruf-bani-hasan | جروف بنى حسن | Jurūf Banī Ḩasan | محافظة حجة | PPL | 80 | 17 | 113.73 | saada |
| az-zahar | الظهر | Az̧ Z̧ahar | محافظة حجة | PPL | 80 | 17 | 116.70 | saada |
| lujj-al-mazbil | لج المزبل | Lujj al Mazbil | محافظة حجة | PPL | 80 | 12 | 116.33 | saada |
| al-matbaq | المطبق | Al Maţbaq | محافظة حجة | PPL | 80 | 12 | 116.17 | saada |
| al-huwaij | الحوائج | Al Ḩuwā’ij | محافظة حجة | PPL | 80 | 4 | 116.44 | saada |
| al-madfan | المدفن | Al Madfan | محافظة حجة | PPL | 80 | 16 | 115.31 | saada |
| al-mahraq | المحراق | Al Maḩrāq | محافظة حجة | PPL | 80 | 1 | 110.57 | saada |
| samarah | سمرة | Samarah | محافظة حجة | PPL | 80 | 1 | 110.31 | saada |
| an-naqd | التقد | An Naqd | محافظة حجة | PPL | 80 | 16 | 110.29 | saada |
| al-jaww | الجو | Al Jaww | محافظة حجة | PPL | 80 | 16 | 107.78 | saada |
| al-mushtabbah | المشتبة | Al Mushtabbah | محافظة حجة | PPL | 80 | 3 | 106.72 | saada |
| shabwah | شبوة | Shabwah | محافظة حجة | PPL | 80 | 7 | 106.94 | saada |
| al-khurshah | الخرشة | Al Khurshah | محافظة حجة | PPL | 80 | 3 | 107.57 | saada |
| al-ayya | العيا | Al ‘Ayyā | محافظة حجة | PPL | 80 | 4 | 107.31 | saada |
| hajr | حجر | Ḩajr | محافظة حجة | PPL | 80 | 2 | 108.40 | saada |
| al-amya | العمياء | Al ‘Amyā’ | محافظة حجة | PPL | 80 | 23 | 101.72 | saada |
| al-mi-sar | المعصار | Al Mi‘şār | محافظة حجة | PPL | 80 | 11 | 104.87 | saada |
| jadi-sayf | جاضع سيف | Jāḑi‘ Sayf | محافظة حجة | PPL | 80 | 1 | 101.20 | saada |
| lajh-bin-milaba | لجح بن ملابا | Lajḩ Bin Milābā | محافظة حجة | PPL | 80 | 9 | 95.48 | saada |
| al-faqah | الفقعة | Al Faq‘ah | محافظة حجة | PPL | 80 | 5 | 100.15 | saada |
| abu-dhirayah | أبو ذراية | Abū Dhirāyah | محافظة حجة | PPL | 80 | 4 | 96.64 | saada |
| makhshush | مخشوش | Makhshūsh | محافظة حجة | PPL | 80 | 4 | 96.33 | saada |
| al-hanabiyah | الحنابية | Al Ḩanābīyah | محافظة حجة | PPL | 80 | 10 | 92.32 | saada |
| ash-shuniyah | الشنية | Ash Shunīyah | محافظة حجة | PPL | 80 | 12 | 95.23 | saada |
| majim | معجم | Ma‘jim | محافظة حجة | PPL | 80 | 16 | 95.70 | saada |
| bani-yusif-al-hidadi | بني يوسف الحدادي | Banī Yūsif al Ḩidādī | محافظة حجة | PPL | 80 | 4 | 92.26 | saada |
| khudud-qutbah | خدود قطبة | Khudūd Quţbah | محافظة حجة | PPL | 80 | 11 | 95.00 | saada |
| basir-mahawwar | بصير محور | Başīr Maḩawwar | محافظة حجة | PPL | 80 | 6 | 94.06 | saada |
| bani-ad-damim | بني الدميم | Banī ad Damīm | محافظة حجة | PPL | 80 | 10 | 93.34 | saada |
| abu-kisar | أبو كسار | Abū Kisār | محافظة حجة | PPL | 80 | 6 | 97.15 | saada |
| al-julbah | الجلباح | Al Julbāḩ | محافظة حجة | PPL | 80 | 7 | 96.52 | saada |
| al-bahilah | الباهلة | Al Bāhilah | محافظة حجة | PPL | 80 | 12 | 97.55 | saada |
| al-mudarim-al-yumna | المدارم اليمناء | Al Mudārim al Yumnā’ | محافظة حجة | PPL | 80 | 5 | 100.67 | saada |
| al-mudarim-ash-shawma | المدارم الشوماء | Al Mudārim ash Shawmā’ | محافظة حجة | PPL | 80 | 6 | 100.00 | saada |
| jarf-isa | جرف عيسى | Jarf ‘Īsá | محافظة حجة | PPL | 80 | 3 | 98.74 | saada |
| sibabah | صبابة | Şibābah | محافظة حجة | PPL | 80 | 7 | 98.38 | saada |
| kurs-jihah | كرس جحاح | Kurs Jiḩāḩ | محافظة حجة | PPL | 80 | 5 | 97.93 | saada |
| al-milam | الملام | Al Milām | محافظة حجة | PPL | 80 | 8 | 98.44 | saada |
| al-musbah | المصبح | Al Muşbaḩ | محافظة حجة | PPL | 80 | 17 | 97.43 | saada |
| al-humayzah | الحميزة | Al Ḩumayzah | محافظة حجة | PPL | 80 | 5 | 99.75 | saada |
| mahall-aslam | محل أسلم | Maḩall Aslam | محافظة حجة | PPL | 80 | 7 | 99.98 | saada |
| al-mushayhiyah | المشيحية | Al Mushayḩīyah | محافظة حجة | PPL | 80 | 12 | 99.42 | saada |
| az-zahr | الظهر | Az̧ Z̧ahr | محافظة حجة | PPL | 80 | 7 | 97.30 | saada |
| adh-dhahbani | الذهباني | Adh Dhahbānī | محافظة حجة | PPL | 80 | 3 | 97.23 | saada |
| ghurab-al-ala | غراب الأعلى | Ghurāb al A‘lá | محافظة حجة | PPL | 80 | 10 | 97.96 | saada |
| al-khiraq-al-asfal | الخرق الأسفل | Al Khiraq al Asfal | محافظة حجة | PPL | 80 | 3 | 98.07 | saada |
| yukbah | يوكبة | Yūkbah | محافظة حجة | PPL | 80 | 6 | 98.68 | saada |
| al-huzuq-al-ala | الحزق الأعلى | Al Ḩuzuq al A‘lá | محافظة حجة | PPL | 80 | 18 | 97.33 | saada |
| al-urnah | العرنة | Al ‘Urnah | محافظة حجة | PPL | 80 | 13 | 97.40 | saada |
| salman | سلمان | Salmān | محافظة حجة | PPL | 80 | 9 | 99.17 | saada |
| ash-shujaysah-as-sufla | الشجيصة السفلى | Ash Shujayşah as Suflá | محافظة حجة | PPL | 80 | 9 | 100.10 | saada |
| majwar-as-sufla | مجوار السفلى | Majwār as Suflá | محافظة حجة | PPL | 80 | 13 | 100.41 | saada |
| al-firnuq | الفرنوق | Al Firnūq | محافظة حجة | PPL | 80 | 3 | 96.45 | saada |
| al-mihnab | المحناب | Al Miḩnāb | محافظة حجة | PPL | 80 | 1 | 96.64 | saada |
| al-khazirah | الخزيرة | Al Khazīrah | محافظة حجة | PPL | 80 | 3 | 96.39 | saada |
| al-maqab | المعقاب | Al Ma‘qāb | محافظة حجة | PPL | 80 | 7 | 96.40 | saada |
| mahall-mahbur | محل محبور | Maḩall Maḩbūr | محافظة حجة | PPL | 80 | 18 | 96.02 | saada |
| at-tuwathi-al-ala | التواثي الأعلى | At Tuwāthī al A‘lá | محافظة حجة | PPL | 80 | 4 | 94.99 | saada |
| at-tuwathi-al-asfal | التواثي الأسفل | At Tuwāthī al Asfal | محافظة حجة | PPL | 80 | 2 | 95.38 | saada |
| al-hazah | الحازة | Al Ḩāzah | محافظة حجة | PPL | 80 | 8 | 95.23 | saada |
| mahall-awlad-mahsan | محل أولاد محسن | Maḩall Awlād Maḩsan | محافظة حجة | PPL | 80 | 6 | 98.06 | saada |
| mawsimah | موسمة | Mawsimah | محافظة حجة | PPL | 80 | 38 | 99.87 | saada |
| al-maqqar | المقر | Al Maqqar | محافظة حجة | PPL | 80 | 10 | 100.67 | saada |
| al-khamisin | الخميسين | Al Khamīsīn | محافظة حجة | PPL | 80 | 9 | 98.67 | saada |
| bani-kuraysh | بني كريش | Banī Kuraysh | محافظة حجة | PPL | 80 | 6 | 98.29 | saada |
| qitbah | قطبة | Qiţbah | محافظة حجة | PPL | 80 | 4 | 98.16 | saada |
| bani-fadil | بني فاضل | Banī Fāḑil | محافظة حجة | PPL | 80 | 8 | 97.69 | saada |
| bani-kaladah | بني كلادة | Banī Kalādah | محافظة حجة | PPL | 80 | 16 | 101.40 | saada |
| al-mulqa | الملقأ | Al Mulqa’ | محافظة حجة | PPL | 80 | 11 | 101.24 | saada |
| al-malqa-al-janubi | الملقا الجنوبي | Al Malqa’ al Janūbī | محافظة حجة | PPL | 80 | 7 | 101.21 | saada |
| al-khazan | الخزن | Al Khazan | محافظة حجة | PPL | 80 | 18 | 90.53 | saada |
| al-hassaniyah | الحسانية | Al Ḩassānīyah | محافظة حجة | PPL | 80 | 7 | 92.83 | saada |
| bayt-al-ama | بيت الأعمى | Bayt al A‘má | محافظة حجة | PPL | 80 | 7 | 95.52 | saada |
| al-hijawarah | الحجاورة | Al Ḩijāwarah | محافظة حجة | PPL | 80 | 2 | 101.28 | saada |
| ar-rahah | الراحة | Ar Rāḩah | محافظة حجة | PPL | 80 | 1 | 101.41 | saada |
| qasim-as-sabt | قاسم السبت | Qāsim as Sabt | محافظة حجة | PPL | 80 | 11 | 77.39 | saada |
| al-akshabi | العكشبي | Al ‘Akshabī | محافظة حجة | PPL | 80 | 9 | 78.25 | saada |
| qaim-mukabbath | قائم مكبث | Qāi’m Mukabbath | محافظة حجة | PPL | 80 | 3 | 81.28 | saada |
| matrah | مطرة | Maţrah | محافظة حجة | PPL | 80 | 4 | 92.27 | saada |
| miqqash | بقاش | Miqqāsh | محافظة حجة | PPL | 80 | 9 | 93.45 | saada |
| kurs-al-haqlah | كرس الحلقة | Kurs al Ḩaqlah | محافظة حجة | PPL | 80 | 9 | 94.58 | saada |
| al-haqlah | الحقلة | Al Ḩaqlah | محافظة حجة | PPL | 80 | 4 | 94.54 | saada |
| ad-dammin | الدمن | Ad Dammin | محافظة حجة | PPL | 80 | 9 | 91.83 | saada |
| khatwat-al-mihahi | خطوة المحاحي | Khaţwat al Miḩāḩī | محافظة حجة | PPL | 80 | 1 | 89.30 | saada |
| al-madhqir | المذقر | Al Madhqir | محافظة حجة | PPL | 80 | 7 | 92.69 | saada |
| lujj-mahdir | لج محضر | Lujj Maḩḑir | محافظة حجة | PPL | 80 | 6 | 93.84 | saada |
| al-kasir | الكسر | Al Kasir | محافظة حجة | PPL | 80 | 16 | 94.17 | saada |
| ad-dayirah | الدايرة | Ad Dāyirah | محافظة حجة | PPL | 80 | 12 | 96.55 | saada |
| al-adhir | العذير | Al ‘Adhīr | محافظة حجة | PPL | 80 | 4 | 93.98 | saada |
| ad-diwakilah | الدواكلة | Ad Diwākilah | محافظة حجة | PPL | 80 | 10 | 96.06 | saada |
| al-mamal | المعمال | Al Ma‘māl | محافظة حجة | PPL | 80 | 4 | 97.05 | saada |
| mahall-yahya-zayid | محل يحيى زايد | Maḩall Yaḩyá Zāyid | محافظة حجة | PPL | 80 | 11 | 97.56 | saada |
| bani-al-khal | بني الخال | Banī al Khāl | محافظة حجة | PPL | 80 | 10 | 100.27 | saada |
| mahall-shawi-ibrahim-qabih | محل شوعي إبراهيم قبيح | Maḩall Shaw‘ī Ibrāhīm Qabīḩ | محافظة حجة | PPL | 80 | 12 | 103.70 | saada |
| al-qambur | القمبور | Al Qambūr | محافظة حجة | PPL | 80 | 8 | 98.98 | saada |
| al-usilah | العسلة | Al ‘Usilah | محافظة حجة | PPL | 80 | 16 | 96.87 | saada |
| al-jamaiyah | الجماعية | Al Jamā‘īyah | محافظة حجة | PPL | 80 | 9 | 97.62 | saada |
| al-hiyashah | الهياشة | Al Hiyāshah | محافظة حجة | PPL | 80 | 10 | 98.45 | saada |
| as-sabkhah | الصبخة | Aş Şabkhah | محافظة حجة | PPL | 80 | 48 | 100.38 | saada |
| al-harithi | الحارثي | Al Ḩārithī | محافظة حجة | PPL | 80 | 64 | 101.75 | saada |
| al-mushafiqah | المشقفة | Al Mushafiqah | محافظة حجة | PPL | 80 | 69 | 102.05 | saada |
| al-ghuraniah | الغرانئة | Al Ghurāni’ah | محافظة حجة | PPL | 80 | 16 | 103.29 | saada |
| al-muwasimah | المواسمة | Al Muwāsimah | محافظة حجة | PPL | 80 | 9 | 101.15 | saada |
| al-kursa | الكرسى | Al Kursá | محافظة حجة | PPL | 80 | 21 | 99.77 | saada |
| bani-as-salih | بني الصالح | Banī aş Şāliḩ | محافظة حجة | PPL | 80 | 32 | 101.90 | saada |
| al-malasiyah | الملاصية | Al Malāşīyah | محافظة حجة | PPL | 80 | 18 | 106.26 | saada |
| al-hijafiyah | الحجافية | Al Ḩijāfīyah | محافظة حجة | PPL | 80 | 21 | 106.56 | saada |
| al-maghtarribin | المغتربين | Al Maghtarribīn | محافظة حجة | PPL | 80 | 7 | 106.71 | saada |
| al-khabt-al-ashim | الخبت الأشيم | Al Khabt al Ashīm | محافظة حجة | PPL | 80 | 26 | 105.42 | saada |
| al-khabt-ash-shami | الخبت الشامي | Al Khabt ash Shāmī | محافظة حجة | PPL | 80 | 10 | 107.25 | saada |
| zahar-al-jamal | ظهر الجمل | Z̧ahar al Jamal | محافظة حجة | PPL | 80 | 3 | 106.64 | saada |
| kurs-al-hiyashah | كرس الهياشة | Kurs al Hiyāshah | محافظة حجة | PPL | 80 | 9 | 98.92 | saada |
| al-khafi | الخافي | Al Khāfī | محافظة حجة | PPL | 80 | 2 | 98.21 | saada |
| al-miwakhil | المواخل | Al Miwākhil | محافظة حجة | PPL | 80 | 27 | 98.63 | saada |
| al-qayyimah | القيمة | Al Qayyimah | محافظة حجة | PPL | 80 | 3 | 100.35 | saada |
| abu-awfan | أبو عوفان | Abū ‘Awfān | محافظة حجة | PPL | 80 | 3 | 100.56 | saada |
| lujj-al-ghurai | لـج الغراعي | Lujj al Ghurā‘ī | محافظة حجة | PPL | 80 | 3 | 100.24 | saada |
| al-hiwar | الحـوار | Al Ḩiwār | محافظة حجة | PPL | 80 | 1 | 100.43 | saada |
| dayr-ar-rakhim | دير الرخم | Dayr ar Rakhim | محافظة حجة | PPL | 80 | 6 | 101.08 | saada |
| al-ghurab-alman | الغراب ألمان | Al Ghurāb Almān | محافظة حجة | PPL | 80 | 7 | 100.97 | saada |
| alman | المان | Almān | محافظة حجة | PPL | 80 | 7 | 100.88 | saada |
| al-maslam | المسلم | Al Maslam | محافظة حجة | PPL | 80 | 6 | 94.20 | saada |
| bani-nayif | بني نايـف | Banī Nāyif | محافظة حجة | PPL | 80 | 2 | 93.85 | saada |
| al-mafus | المفوس | Al Mafūs | محافظة حجة | PPL | 80 | 5 | 95.24 | saada |
| majarib-an-nawwi | مجارب النوي | Majārib an Nawwī | محافظة حجة | PPL | 80 | 4 | 94.13 | saada |
| al-bayjara | البيجراء | Al Bayjarā’ | محافظة حجة | PPL | 80 | 2 | 94.32 | saada |
| al-ghumrah | الغمرة | Al Ghumrah | محافظة حجة | PPL | 80 | 3 | 94.28 | saada |
| ad-dammin-al-asham | الدمن الأشم | Ad Dammin al Asham | محافظة حجة | PPL | 80 | 4 | 98.68 | saada |
| ar-raffaf | الرفاف | Ar Raffāf | محافظة حجة | PPL | 80 | 6 | 98.25 | saada |
| al-qullah | القلة | Al Qullah | محافظة حجة | PPL | 80 | 16 | 98.64 | saada |
| lujj-al-qari | لج القاري | Lujj al Qārī | محافظة حجة | PPL | 80 | 5 | 98.53 | saada |
| qamyurah | قميورة | Qamyūrah | محافظة حجة | PPL | 80 | 6 | 98.88 | saada |
| qita-as-sarhah | قطاع الصرحة | Qiţā‘ aş Şarḩah | محافظة حجة | PPL | 80 | 1 | 97.39 | saada |
| al-makhlutah | المخلوطة | Al Makhlūţah | محافظة حجة | PPL | 80 | 5 | 97.27 | saada |
| al-mafrah-al-ayman | المفرح الأيمن | Al Mafraḩ al Ayman | محافظة حجة | PPL | 80 | 4 | 98.97 | saada |
| al-mafrah-al-asham | المفرح الأشـم | Al Mafraḩ al Asham | محافظة حجة | PPL | 80 | 3 | 98.88 | saada |
| al-mitrawis | المتراوس | Al Mitrāwis | محافظة حجة | PPL | 80 | 2 | 96.08 | saada |
| al-maqar | المعقر | Al Ma‘qar | محافظة حجة | PPL | 80 | 4 | 95.84 | saada |
| ad-dawhah | الدوحة | Ad Dawḩah | محافظة حجة | PPL | 80 | 1 | 96.46 | saada |
| al-aqam | العقم | Al ‘Aqam | محافظة حجة | PPL | 80 | 2 | 96.34 | saada |
| ad-damigh | الدمغ | Ad Damigh | محافظة حجة | PPL | 80 | 3 | 96.19 | saada |
| gharib-mathwah | غارب مثوة | Ghārib Mathwah | محافظة حجة | PPL | 80 | 1 | 95.43 | saada |
| gharib-darah | غارب دارة | Ghārib Dārah | محافظة حجة | PPL | 80 | 1 | 95.20 | saada |
| gharib-sarhah | غارب صرحة | Ghārib Şarḩah | محافظة حجة | PPL | 80 | 5 | 95.29 | saada |
| gharib-maqta | غارب مقطع | Ghārib Maqţa‘ | محافظة حجة | PPL | 80 | 5 | 95.28 | saada |
| ad-daqqah | الدقة | Ad Daqqah | محافظة حجة | PPL | 80 | 5 | 97.76 | saada |
| al-jafiyah | الجافيـة | Al Jāfīyah | محافظة حجة | PPL | 80 | 1 | 97.90 | saada |
| lahij-abu-abdal | لحج أبو عبدل | Laḩij Abū ‘Abdal | محافظة حجة | PPL | 80 | 4 | 95.22 | saada |
| al-majdarah | المجدارة | Al Majdārah | محافظة حجة | PPL | 80 | 23 | 93.89 | saada |
| as-sariq | السارق | As Sāriq | محافظة حجة | PPL | 80 | 2 | 94.79 | saada |
| al-aqil | العقل | Al ‘Aqil | محافظة حجة | PPL | 80 | 9 | 94.42 | saada |
| al-murtafa | المرتفع | Al Murtafa‘ | محافظة حجة | PPL | 80 | 9 | 94.38 | saada |
| dushayn | دشين | Dushayn | محافظة حجة | PPL | 80 | 10 | 94.55 | saada |
| ad-daghghah | الداغة | Ad Dāghghah | محافظة حجة | PPL | 80 | 11 | 94.24 | saada |
| al-aquq | العقوق | Al ‘Aqūq | محافظة حجة | PPL | 80 | 4 | 93.98 | saada |
| al-kurf | الكرف | Al Kurf | محافظة حجة | PPL | 80 | 6 | 93.61 | saada |
| bani-sami | بني صمع | Banī Şami‘ | محافظة حجة | PPL | 80 | 4 | 92.94 | saada |
| al-qayyimah | القيمة | Al Qayyimah | محافظة حجة | PPL | 80 | 6 | 94.01 | saada |
| bani-jabran | بني جبران | Banī Jabrān | محافظة حجة | PPL | 80 | 9 | 94.31 | saada |
| rai-ad-daqqah | راعي الدقعة | Rā‘ī ad Daqq‘ah | محافظة حجة | PPL | 80 | 3 | 93.75 | saada |
| al-qurayn | القرين | Al Qurayn | محافظة حجة | PPL | 80 | 11 | 93.64 | saada |
| al-hafish | الحافش | Al Ḩāfish | محافظة حجة | PPL | 80 | 2 | 93.26 | saada |
| majran-said | مجران سعد | Majrān Sa‘id | محافظة حجة | PPL | 80 | 3 | 93.34 | saada |
| abu-adlah | أبو عدلة | Abū ‘Adlah | محافظة حجة | PPL | 80 | 6 | 92.11 | saada |
| al-qimmah-ash-shawma | القمة الشوماء | Al Qimmah ash Shawmā’ | محافظة حجة | PPL | 80 | 16 | 92.80 | saada |
| makawiah | مكاوعة | Makāwi‘ah | محافظة حجة | PPL | 80 | 10 | 93.06 | saada |
| mufabishah | مفابشة | Mufābishah | محافظة حجة | PPL | 80 | 5 | 93.17 | saada |
| al-maqilya | المقليا | Al Maqilyā | محافظة حجة | PPL | 80 | 7 | 92.46 | saada |
| shurfan | شرفان | Shurfān | محافظة حجة | PPL | 80 | 4 | 92.38 | saada |
| al-juzi | الجزء | Al Juzi’ | محافظة حجة | PPL | 80 | 1 | 92.61 | saada |
| al-waqis | الوقيص | Al Waqīş | محافظة حجة | PPL | 80 | 4 | 92.44 | saada |
| al-urayqin | العريقين | Al ‘Urayqīn | محافظة حجة | PPL | 80 | 5 | 93.11 | saada |
| awlad-al-labis | أولاد اللبيص | Awlād al Labīş | محافظة حجة | PPL | 80 | 17 | 91.00 | saada |
| bayt-al-mallah | بيت الملاح | Bayt al Mallāḩ | محافظة حجة | PPL | 80 | 4 | 91.02 | saada |
| al-lakbah | اللكبة | Al Lakbah | محافظة حجة | PPL | 80 | 6 | 90.97 | saada |
| al-jawwah | الجوة | Al Jawwah | محافظة حجة | PPL | 80 | 3 | 91.25 | saada |
| taizz | تعز | Ta‘izz | محافظة حجة | PPL | 80 | 5 | 91.62 | saada |
| ar-rabiyah | الرابية | Ar Rābīyah | محافظة حجة | PPL | 80 | 7 | 91.88 | saada |
| hadi-mashaji | هادي مشاجي | Hādī Mashājī | محافظة حجة | PPL | 80 | 3 | 92.05 | saada |
| at-tuwalah | الطوالة | Aţ Ţuwālah | محافظة حجة | PPL | 80 | 10 | 91.38 | saada |
| al-abrayah | الأبراية | Al Abrāyah | محافظة حجة | PPL | 80 | 15 | 91.47 | saada |
| lujj-majum | لج مجوم | Lujj Majūm | محافظة حجة | PPL | 80 | 8 | 91.01 | saada |
| qurr-al-bitan | قر البطان | Qurr al Biţān | محافظة حجة | PPL | 80 | 9 | 91.26 | saada |
| al-kuran | الكران | Al Kurān | محافظة حجة | PPL | 80 | 8 | 91.49 | saada |
| al-lubbah | اللبة | Al Lubbah | محافظة حجة | PPL | 80 | 11 | 91.82 | saada |
| mahday-kharifi | محداي خريفي | Maḩdāy Kharīfī | محافظة حجة | PPL | 80 | 8 | 91.97 | saada |
| qaryat-yahya-halil | قرية يحي حليل | Qaryat Yaḩya Ḩalīl | محافظة حجة | PPL | 80 | 3 | 91.89 | saada |
| as-salafi | الصلفي | Aş Şalafī | محافظة حجة | PPL | 80 | 19 | 93.06 | saada |
| shati-jaman | شاطى جمعان | Shāţi’ Jam‘ān | محافظة حجة | PPL | 80 | 2 | 93.14 | saada |
| damnat-bani-shaddad | دمنة بني شداد | Damnat Banī Shaddād | محافظة حجة | PPL | 80 | 4 | 92.68 | saada |
| lujh-ahmad | لجح أحمد | Lujḩ Aḩmad | محافظة حجة | PPL | 80 | 2 | 92.82 | saada |
| as-saidi | الصاعدي | Aş Şā‘idī | محافظة حجة | PPL | 80 | 2 | 92.36 | saada |
| dhura-al-hadbah | ذراع الحدبة | Dhurā‘ al Ḩadbah | محافظة حجة | PPL | 80 | 2 | 92.24 | saada |
| al-kibarah | الكبارة | Al Kibārah | محافظة حجة | PPL | 80 | 3 | 92.33 | saada |
| dhura-al-muqanar | ذراع المقنعر | Dhurā‘ al Muqan‘ar | محافظة حجة | PPL | 80 | 2 | 92.49 | saada |
| ar-raddah | الرداح | Ar Raddāḩ | محافظة حجة | PPL | 80 | 4 | 92.73 | saada |
| al-uql | العقل | Al ‘Uql | محافظة حجة | PPL | 80 | 7 | 93.09 | saada |
| yaydan | ييضان | Yayḑān | محافظة حجة | PPL | 80 | 10 | 88.91 | saada |
| al-mufaltah | المفلطح | Al Mufalţaḩ | محافظة حجة | PPL | 80 | 7 | 89.54 | saada |
| as-sahilah | السهلة | As Sahilah | محافظة حجة | PPL | 80 | 11 | 89.79 | saada |
| ash-shamalah | الشمالة | Ash Shamālah | محافظة حجة | PPL | 80 | 5 | 90.22 | saada |
| al-mizawir | المزاور | Al Mizāwir | محافظة حجة | PPL | 80 | 15 | 91.56 | saada |
| az-zabta | الزبطاء | Az Zabţā’ | محافظة حجة | PPL | 80 | 4 | 92.10 | saada |
| ash-sharqi | الشرقي | Ash Sharqī | محافظة حجة | PPL | 80 | 2 | 91.98 | saada |
| al-haydah | الحيضة | Al Ḩayḑah | محافظة حجة | PPL | 80 | 2 | 91.94 | saada |
| an-nawaqi | النواقع | An Nawāqi‘ | محافظة حجة | PPL | 80 | 3 | 91.40 | saada |
| al-jarrab | الجرب | Al Jarrab | محافظة حجة | PPL | 80 | 2 | 91.60 | saada |
| al-haqawiyah | الحقوية | Al Ḩaqawīyah | محافظة حجة | PPL | 80 | 6 | 91.26 | saada |
| mihdab | محداب | Miḩdāb | محافظة حجة | PPL | 80 | 5 | 91.00 | saada |
| al-mudannaf | المدنف | Al Mudannaf | محافظة حجة | PPL | 80 | 2 | 91.02 | saada |
| al-birkah | البركة | Al Birkah | محافظة حجة | PPL | 80 | 6 | 91.45 | saada |
| ar-ramaj | الرماج | Ar Ramāj | محافظة حجة | PPL | 80 | 8 | 90.18 | saada |
| al-majdarah | المجدارة | Al Majdārah | محافظة حجة | PPL | 80 | 8 | 89.35 | saada |
| sirmus | سرموس | Sirmūs | محافظة حجة | PPL | 80 | 4 | 89.43 | saada |
| ar-rijayah | الرجاية | Ar Rijāyah | محافظة حجة | PPL | 80 | 6 | 89.33 | saada |
| rabbah | رباح | Rabbāḩ | محافظة حجة | PPL | 80 | 9 | 96.70 | saada |
| al-mihsam | المحصام | Al Miḩşām | محافظة حجة | PPL | 80 | 11 | 96.94 | saada |
| ash-shafiyah | الشافية | Ash Shāfīyah | محافظة حجة | PPL | 80 | 23 | 99.00 | saada |
| al-harrah | الحارة | Al Ḩārrah | محافظة حجة | PPL | 80 | 19 | 98.39 | saada |
| gharib-al-midawmi | غارب المدومي | Ghārib al Midawmī | محافظة حجة | PPL | 80 | 10 | 98.31 | saada |
| al-khatmah | الخطمة | Al Khaţmah | محافظة حجة | PPL | 80 | 14 | 97.51 | saada |
| al-haqlah | الحقلة | Al Ḩaqlah | محافظة حجة | PPL | 80 | 12 | 98.22 | saada |
| al-milaib | الملاعيب | Al Milā‘īb | محافظة حجة | PPL | 80 | 2 | 97.61 | saada |
| al-qalt | القلت | Al Qalt | محافظة حجة | PPL | 80 | 3 | 98.86 | saada |
| al-khanayah | الخناية | Al Khanāyah | محافظة حجة | PPL | 80 | 8 | 97.52 | saada |
| al-maqbis | المقبص | Al Maqbiş | محافظة حجة | PPL | 80 | 11 | 97.72 | saada |
| al-maslam | المسلام | Al Maslām | محافظة حجة | PPL | 80 | 7 | 97.84 | saada |
| lahij-ad-diqah | لحج الدقعة | Laḩij ad Diq‘ah | محافظة حجة | PPL | 80 | 17 | 97.52 | saada |
| al-bilahah | البلاحة | Al Bilāḩah | محافظة حجة | PPL | 80 | 2 | 97.35 | saada |
| al-khadimah | الخادمة | Al Khādimah | محافظة حجة | PPL | 80 | 8 | 96.53 | saada |
| ad-dahar | الضهار | Aḑ Ḑahār | محافظة حجة | PPL | 80 | 9 | 96.19 | saada |
| al-miqshab | المقشاب | Al Miqshāb | محافظة حجة | PPL | 80 | 4 | 96.32 | saada |
| al-markabah | المركابة | Al Markābah | محافظة حجة | PPL | 80 | 8 | 96.37 | saada |
| shufadigh | شفادغ | Shufādigh | محافظة حجة | PPL | 80 | 4 | 92.49 | saada |
| al-arqayn | العرقين | Al ‘Arqayn | محافظة حجة | PPL | 80 | 11 | 95.33 | saada |
| al-hawlah | الحولة | Al Ḩawlah | محافظة حجة | PPL | 80 | 7 | 92.57 | saada |
| al-majrab | المجرب | Al Majrab | محافظة حجة | PPL | 80 | 2 | 95.15 | saada |
| al-hujayr | الحجير | Al Ḩujayr | محافظة حجة | PPL | 80 | 7 | 97.09 | saada |
| al-mawakiyah | المواكية | Al Mawākīyah | محافظة حجة | PPL | 80 | 4 | 95.67 | saada |
| al-hazah-al-qasai | الحازة القصاعي | Al Ḩāzah al Qaşā‘ī | محافظة حجة | PPL | 80 | 10 | 94.78 | saada |
| an-nishmat | النشمات | An Nishmāt | محافظة حجة | PPL | 80 | 9 | 95.67 | saada |
| ash-shahi | الشاحي | Ash Shāḩī | محافظة حجة | PPL | 80 | 3 | 96.49 | saada |
| qita-at-tabib | قطاع الطبيب | Qiţā‘ aţ Ţabīb | محافظة حجة | PPL | 80 | 5 | 96.08 | saada |
| an-nakhayil | النخايل | An Nakhāyil | محافظة حجة | PPL | 80 | 9 | 95.40 | saada |
| juruf-arbid | جروف عربد | Jurūf ‘Arbid | محافظة حجة | PPL | 80 | 1 | 93.14 | saada |
| al-mabrak | المبرك | Al Mabrak | محافظة حجة | PPL | 80 | 4 | 93.61 | saada |
| al-maqsumah | المقسومة | Al Maqsūmah | محافظة حجة | PPL | 80 | 25 | 95.61 | saada |
| al-khaririyah-ash-sharqiyah | الخريرية الشرقية | Al Kharīrīyah ash Sharqīyah | محافظة حجة | PPL | 80 | 7 | 95.88 | saada |
| al-khadir-as-sufla | الخدير السفلى | Al Khadīr as Suflá | محافظة حجة | PPL | 80 | 5 | 95.69 | saada |
| al-qalah | القلعة | Al Qal‘ah | محافظة حجة | PPL | 80 | 2 | 94.67 | saada |
| qatiat-rabi | قطعة رابع | Qaţi‘at Rābi‘ | محافظة حجة | PPL | 80 | 13 | 94.27 | saada |
| sayban | سيبان | Saybān | محافظة حجة | PPL | 80 | 3 | 93.54 | saada |
| al-marhab | المرحب | Al Marḩab | محافظة حجة | PPL | 80 | 16 | 95.31 | saada |
| al-amishah | العمشة | Al ‘Amishah | محافظة حجة | PPL | 80 | 17 | 96.54 | saada |
| al-khaririyah-al-gharbiyah | الخريرية الغربية | Al Kharīrīyah al Gharbīyah | محافظة حجة | PPL | 80 | 7 | 96.00 | saada |
| dayr-qamus | دير قعموس | Dayr Qa‘mūs | محافظة حجة | PPL | 80 | 12 | 104.00 | saada |
| gharib-dahiyah | غارب داهية | Ghārib Dāhīyah | محافظة حجة | PPL | 80 | 4 | 103.92 | saada |
| al-matlayah | المطلاية | Al Maţlāyah | محافظة حجة | PPL | 80 | 8 | 103.80 | saada |
| al-badawi | البدوي | Al Badawī | محافظة حجة | PPL | 80 | 3 | 103.76 | saada |
| al-ashlah | العشلة | Al ‘Ashlah | محافظة حجة | PPL | 80 | 11 | 103.87 | saada |
| al-ghazalah | الغزالـــة | Al Ghazālah | محافظة حجة | PPL | 80 | 3 | 102.69 | saada |
| habil-ath-thuah | حبيل الثـوعــة | Ḩabīl ath Thū‘ah | محافظة حجة | PPL | 80 | 3 | 102.49 | saada |
| as-sadaqah | الصدقة | Aş Şadaqah | محافظة حجة | PPL | 80 | 9 | 103.50 | saada |
| al-arish | العريش | Al ‘Arīsh | محافظة حجة | PPL | 80 | 5 | 104.00 | saada |
| al-bidah | البداح | Al Bidāḩ | محافظة حجة | PPL | 80 | 5 | 103.87 | saada |
| ghayr-adh-dhir | غير الذعر | Ghayr adh Dhi‘r | محافظة حجة | PPL | 80 | 6 | 103.99 | saada |
| ar-raffah | الرفة | Ar Raffah | محافظة حجة | PPL | 80 | 6 | 103.15 | saada |
| habil-ash-shaf | حبيل الشاف | Ḩabīl ash Shāf | محافظة حجة | PPL | 80 | 5 | 102.69 | saada |
| al-mishbab | المشباب | Al Mishbāb | محافظة حجة | PPL | 80 | 4 | 102.82 | saada |
| ar-rahhan | الرهن | Ar Rahhan | محافظة حجة | PPL | 80 | 1 | 103.38 | saada |
| ghayr-al-maswad | غير المسود | Ghayr al Maswad | محافظة حجة | PPL | 80 | 2 | 103.49 | saada |
| as-safwah | الصفوة | Aş Şafwah | محافظة حجة | PPL | 80 | 8 | 102.89 | saada |
| al-mukhkhis | المخص | Al Mukhkhiş | محافظة حجة | PPL | 80 | 5 | 103.81 | saada |
| ad-damigh | الدمغ | Ad Damigh | محافظة حجة | PPL | 80 | 6 | 103.09 | saada |
| al-makhaylah | المكحيلة | Al Makḩaylah | محافظة حجة | PPL | 80 | 5 | 102.11 | saada |
| al-kawmah | الكومة | Al Kawmah | محافظة حجة | PPL | 80 | 4 | 103.47 | saada |
| as-sultan | السلطان | As Sulţān | محافظة حجة | PPL | 80 | 1 | 102.53 | saada |
| al-muqabil | المقابل | Al Muqābil | محافظة حجة | PPL | 80 | 8 | 105.75 | saada |
| al-mashshak | المشك | Al Mashshak | محافظة حجة | PPL | 80 | 6 | 105.91 | saada |
| ad-damagh | الدماغ | Ad Damāgh | محافظة حجة | PPL | 80 | 6 | 105.37 | saada |
| al-qufrah | القفرة | Al Qufrah | محافظة حجة | PPL | 80 | 1 | 106.13 | saada |
| al-qiza | القزاع | Al Qizā‘ | محافظة حجة | PPL | 80 | 3 | 105.57 | saada |
| al-miwari | المواري | Al Miwārī | محافظة حجة | PPL | 80 | 3 | 105.69 | saada |
| al-muzaffar | المظفر | Al Muz̧affar | محافظة حجة | PPL | 80 | 1 | 103.20 | saada |
| al-awja-ash-sharqiyah | الأوجا الشرقية | Al Awjā ash Sharqīyah | محافظة حجة | PPL | 80 | 3 | 103.47 | saada |
| al-awja-al-gharbiyah | الأوجا الغربية | Al Awjā al Gharbīyah | محافظة حجة | PPL | 80 | 4 | 103.41 | saada |
| habil-al-adan | حبيل العدن | Ḩabīl al ‘Adan | محافظة حجة | PPL | 80 | 5 | 103.37 | saada |
| al-matarik | المعتارك | Al Ma‘tārik | محافظة حجة | PPL | 80 | 14 | 103.65 | saada |
| al-hashan | الحشــن | Al Ḩashan | محافظة حجة | PPL | 80 | 2 | 101.94 | saada |
| hasan-al-usrah | حصن العســرة | Ḩaşan al ‘Usrah | محافظة حجة | PPL | 80 | 3 | 102.19 | saada |
| al-khirabah | الخرابة | Al Khirābah | محافظة حجة | PPL | 80 | 5 | 101.95 | saada |
| al-mushabbik-bilati | المشبـك بلاطـي | Al Mushabbik Bilāţī | محافظة حجة | PPL | 80 | 4 | 101.52 | saada |
| al-maydal | الميدل | Al Maydal | محافظة حجة | PPL | 80 | 6 | 101.78 | saada |
| al-kuwaydir | الكويدر | Al Kuwaydir | محافظة حجة | PPL | 80 | 5 | 102.10 | saada |
| al-muslim-bani-shifarah | المسلم بني شقارة | Al Muslim Banī Shifārah | محافظة حجة | PPL | 80 | 4 | 102.28 | saada |
| ash-shuayib | الشعايب | Ash Shu‘āyib | محافظة حجة | PPL | 80 | 15 | 101.62 | saada |
| gharib-maqzil | غارب مقـزل | Ghārib Maqzil | محافظة حجة | PPL | 80 | 3 | 101.10 | saada |
| al-miqshab | المقشاب | Al Miqshāb | محافظة حجة | PPL | 80 | 5 | 101.68 | saada |
| al-ariq | العرق | Al ‘Ariq | محافظة حجة | PPL | 80 | 4 | 101.29 | saada |
| ad-dahr-bani-shitarah | الضهر بنى شطارة | Aḑ Ḑahr Banī Shiţārah | محافظة حجة | PPL | 80 | 7 | 101.36 | saada |
| al-ashshah | العشــة | Al ‘Ashshah | محافظة حجة | PPL | 80 | 4 | 100.98 | saada |
| maghribat-mujma | مغـربة مجمع | Maghribat Mujma‘ | محافظة حجة | PPL | 80 | 3 | 101.58 | saada |
| bani-zayn | بنى زين | Banī Zayn | محافظة حجة | PPL | 80 | 23 | 101.83 | saada |
| al-mislam-bani-zayn | المسلام بنى زين | Al Mislām Banī Zayn | محافظة حجة | PPL | 80 | 5 | 101.84 | saada |
| al-hamliyah | الحملية | Al Ḩamlīyah | محافظة حجة | PPL | 80 | 1 | 101.73 | saada |
| gharib-fanna | غارب فنا | Ghārib Fannā | محافظة حجة | PPL | 80 | 7 | 101.70 | saada |
| al-mislam-bani-jabir | المسلام بنى جابر | Al Mislām Banī Jābir | محافظة حجة | PPL | 80 | 9 | 102.00 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة حجة | PPL | 80 | 2 | 102.01 | saada |
| al-muwazzia | الموزعى | Al Muwazzi‘á | محافظة حجة | PPL | 80 | 3 | 102.26 | saada |
| bayt-ar-rujm | بيت الرجم | Bayt ar Rujm | محافظة حجة | PPL | 80 | 4 | 102.15 | saada |
| al-murniq | المرنـق | Al Murniq | محافظة حجة | PPL | 80 | 2 | 98.60 | saada |
| al-biah | البيعة | Al Bī‘ah | محافظة حجة | PPL | 80 | 9 | 99.84 | saada |
| ad-dabbur | الدبـر | Ad Dabbur | محافظة حجة | PPL | 80 | 7 | 100.31 | saada |
| ad-dammin | الدمن | Ad Dammin | محافظة حجة | PPL | 80 | 3 | 99.72 | saada |
| al-minuf | المنـوف | Al Minūf | محافظة حجة | PPL | 80 | 3 | 99.55 | saada |
| lujj-duhaynah | لج دهينة | Lujj Duhaynah | محافظة حجة | PPL | 80 | 1 | 99.65 | saada |
| al-qalah | القلعة | Al Qal‘ah | محافظة حجة | PPL | 80 | 5 | 99.54 | saada |
| al-mihsam | المحصام | Al Miḩşām | محافظة حجة | PPL | 80 | 6 | 101.70 | saada |
| azzan | عزان | ‘Azzān | محافظة حجة | PPL | 80 | 1 | 101.21 | saada |
| al-bidah | البداح | Al Bidāḩ | محافظة حجة | PPL | 80 | 3 | 101.45 | saada |
| al-qurai | القراعي | Al Qurā‘ī | محافظة حجة | PPL | 80 | 3 | 100.01 | saada |
| lujj-al-maghribah | لج المغربة | Lujj al Maghribah | محافظة حجة | PPL | 80 | 2 | 100.27 | saada |
| al-masayil | المسايل | Al Masāyil | محافظة حجة | PPL | 80 | 1 | 100.22 | saada |
| al-hidamiyah | الهضامية | Al Hiḑāmīyah | محافظة حجة | PPL | 80 | 1 | 100.39 | saada |
| dammin-ad-darah | دمن الدارة | Dammin ad Dārah | محافظة حجة | PPL | 80 | 2 | 100.44 | saada |
| al-mahdir | المحدر | Al Maḩdir | محافظة حجة | PPL | 80 | 1 | 99.71 | saada |
| al-butihah | البطحة | Al Buţiḩah | محافظة حجة | PPL | 80 | 1 | 99.25 | saada |
| al-muqlabiyah | المقلعبية | Al Muqla‘bīyah | محافظة حجة | PPL | 80 | 2 | 99.52 | saada |
| ar-raqibiyah | الراقبية | Ar Rāqibīyah | محافظة حجة | PPL | 80 | 3 | 100.34 | saada |
| al-kudaydah | الكديدة | Al Kudaydah | محافظة حجة | PPL | 80 | 1 | 100.29 | saada |
| makhshush | مخشــوش | Makhshūsh | محافظة حجة | PPL | 80 | 10 | 99.27 | saada |
| gharib-al-misari | غارب المساريع | Ghārib al Misārī‘ | محافظة حجة | PPL | 80 | 2 | 98.64 | saada |
| juqishah | جقشــة | Juqishah | محافظة حجة | PPL | 80 | 6 | 99.15 | saada |
| al-juruf | الجروف | Al Jurūf | محافظة حجة | PPL | 80 | 6 | 99.27 | saada |
| ar-rizayhiyah | الرزيحيـة | Ar Rizayḩīyah | محافظة حجة | PPL | 80 | 4 | 99.75 | saada |
| al-mishuk | المشوك | Al Mishūk | محافظة حجة | PPL | 80 | 3 | 100.05 | saada |
| rabid | رابض | Rābiḑ | محافظة حجة | PPL | 80 | 2 | 100.19 | saada |
| sulfaq | صلفاق | Şulfāq | محافظة حجة | PPL | 80 | 6 | 99.12 | saada |
| al-mahquq | المحقوق | Al Maḩqūq | محافظة حجة | PPL | 80 | 3 | 99.28 | saada |
| al-mujaddilah | المجدلـة | Al Mujaddilah | محافظة حجة | PPL | 80 | 2 | 99.87 | saada |
| al-jirayab | الجرايب | Al Jirāyab | محافظة حجة | PPL | 80 | 3 | 101.08 | saada |
| al-hidadiyah | الحداديـة | Al Ḩidādīyah | محافظة حجة | PPL | 80 | 3 | 100.07 | saada |
| al-musajidiyah | المساجدية | Al Musājidīyah | محافظة حجة | PPL | 80 | 3 | 100.94 | saada |
| ad-diwahimah | الدواحمـة | Ad Diwāḩimah | محافظة حجة | PPL | 80 | 4 | 101.95 | saada |
| al-jayyid | الجيد | Al Jayyid | محافظة حجة | PPL | 80 | 4 | 101.62 | saada |
| ad-daymah | الديمة | Ad Daymah | محافظة حجة | PPL | 80 | 2 | 101.60 | saada |
| habil-al-aqqam | حبيل العقــم | Ḩabīl al ‘Aqqam | محافظة حجة | PPL | 80 | 3 | 102.70 | saada |
| jalih | جلـــح | Jaliḩ | محافظة حجة | PPL | 80 | 4 | 102.37 | saada |
| al-khali | الخلـي | Al Khalī | محافظة حجة | PPL | 80 | 9 | 101.87 | saada |
| al-mashilah | المشلــة | Al Mashilah | محافظة حجة | PPL | 80 | 6 | 101.99 | saada |
| gharib-al-muqatiah | غارب المقاطعــة | Ghārib al Muqāţi‘ah | محافظة حجة | PPL | 80 | 4 | 101.81 | saada |
| al-mujaffirah | المجفــرة | Al Mujaffirah | محافظة حجة | PPL | 80 | 1 | 101.61 | saada |
| al-hazah | الحازة | Al Ḩāzah | محافظة حجة | PPL | 80 | 2 | 99.08 | saada |
| ad-dammin | الدمن | Ad Dammin | محافظة حجة | PPL | 80 | 2 | 99.68 | saada |
| wair | وعر | Wa‘ir | محافظة حجة | PPL | 80 | 1 | 99.58 | saada |
| ad-daymah | الديمة | Ad Daymah | محافظة حجة | PPL | 80 | 1 | 99.53 | saada |
| al-bidah | البداح | Al Bidāḩ | محافظة حجة | PPL | 80 | 7 | 99.16 | saada |
| habil-al-majin | حبيل الماجن | Ḩabīl al Mājin | محافظة حجة | PPL | 80 | 19 | 98.72 | saada |
| al-qusbah | القصبة | Al Quşbah | محافظة حجة | PPL | 80 | 2 | 99.01 | saada |
| gharib-al-majnah | غارب المجنـة | Ghārib al Majnah | محافظة حجة | PPL | 80 | 4 | 98.30 | saada |
| al-ayab | العياب | Al ‘Ayāb | محافظة حجة | PPL | 80 | 8 | 98.43 | saada |
| as-sammakiyah | السمكية | As Sammakīyah | محافظة حجة | PPL | 80 | 4 | 98.34 | saada |
| at-tiffah | الطفـة | Aţ Ţiffah | محافظة حجة | PPL | 80 | 5 | 108.69 | saada |
| al-ashshah | العشــة | Al ‘Ashshah | محافظة حجة | PPL | 80 | 4 | 108.43 | saada |
| as-sawdi | السودي | As Sawdī | محافظة حجة | PPL | 80 | 8 | 108.14 | saada |
| tansir | تنصير | Tanşīr | محافظة حجة | PPL | 80 | 11 | 107.70 | saada |
| al-ariq | العرق | Al ‘Ariq | محافظة حجة | PPL | 80 | 4 | 112.41 | saada |
| ash-shurayj | الشريج | Ash Shurayj | محافظة حجة | PPL | 80 | 8 | 108.12 | saada |
| al-mudi | المضيع | Al Muḑī‘ | محافظة حجة | PPL | 80 | 1 | 108.35 | saada |
| ad-darimah | الدرمة | Ad Darimah | محافظة حجة | PPL | 80 | 4 | 108.56 | saada |
| ghayr-al-mudhakkir | غير المذكر | Ghayr al Mudhakkir | محافظة حجة | PPL | 80 | 3 | 110.21 | saada |
| ad-dumaynah | الدمينة | Ad Dumaynah | محافظة حجة | PPL | 80 | 1 | 110.00 | saada |
| habil-shayban | حبيل شيبان | Ḩabīl Shaybān | محافظة حجة | PPL | 80 | 3 | 110.45 | saada |
| al-awfayn | العوفين | Al ‘Awfayn | محافظة حجة | PPL | 80 | 14 | 109.01 | saada |
| bani-jabir | بني جابر | Banī Jābir | محافظة حجة | PPL | 80 | 6 | 109.11 | saada |
| at-takhyal | التخيال | At Takhyāl | محافظة حجة | PPL | 80 | 3 | 109.63 | saada |
| al-mujran | المجران | Al Mujrān | محافظة حجة | PPL | 80 | 24 | 113.52 | saada |
| labadah | لبادة | Labādah | محافظة حجة | PPL | 80 | 8 | 114.90 | saada |
| al-hadawushah | الهداوشة | Al Hadāwushah | محافظة حجة | PPL | 80 | 12 | 114.97 | saada |
| al-mikayn | المكين | Al Mikayn | محافظة حجة | PPL | 80 | 6 | 115.19 | saada |
| al-muzahir | المظاهر | Al Muz̧āhir | محافظة حجة | PPL | 80 | 15 | 109.74 | saada |
| dayr-al-asid | دير الأسـد | Dayr al Asid | محافظة حجة | PPL | 80 | 6 | 109.69 | saada |
| al-milahah | الملاحــة | Al Milāḩah | محافظة حجة | PPL | 80 | 5 | 110.93 | saada |
| al-misadirah | المسادرة | Al Misādirah | محافظة حجة | PPL | 80 | 4 | 108.22 | saada |
| al-lujj | اللج | Al Lujj | محافظة حجة | PPL | 80 | 4 | 108.40 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 9 | 109.62 | saada |
| al-murdah | المرداح | Al Murdāḩ | محافظة حجة | PPL | 80 | 2 | 115.00 | saada |
| lujj-al-muayyun | لج المعيون | Lujj al Mu‘ayyūn | محافظة حجة | PPL | 80 | 3 | 107.80 | saada |
| ad-dammiyah | الدمية | Ad Dammīyah | محافظة حجة | PPL | 80 | 1 | 107.20 | saada |
| an-namidah | النمضــة | An Namiḑah | محافظة حجة | PPL | 80 | 3 | 109.38 | saada |
| ar-ranfah | الرنفــة | Ar Ranfah | محافظة حجة | PPL | 80 | 3 | 107.66 | saada |
| al-kirkun | الكركون | Al Kirkūn | محافظة حجة | PPL | 80 | 3 | 114.90 | saada |
| al-munib | المعنـب | Al Mu‘nib | محافظة حجة | PPL | 80 | 2 | 112.94 | saada |
| al-jurb | الجرب | Al Jurb | محافظة حجة | PPL | 80 | 5 | 110.69 | saada |
| al-mirnaf | المرناف | Al Mirnāf | محافظة حجة | PPL | 80 | 5 | 112.71 | saada |
| al-qari | القريع | Al Qarī‘ | محافظة حجة | PPL | 80 | 2 | 112.92 | saada |
| bani-qudri | بيت قدري | Banī Qudrī | محافظة حجة | PPL | 80 | 7 | 106.16 | saada |
| lujj-al-khirabah | لـج الخرابــة | Lujj al Khirābah | محافظة حجة | PPL | 80 | 8 | 103.82 | saada |
| hidayat-dafran | حداية دفران | Ḩidāyat Dafrān | محافظة حجة | PPL | 80 | 5 | 103.46 | saada |
| habil-al-husni | حبيل الحسني | Ḩabīl al Ḩusnī | محافظة حجة | PPL | 80 | 7 | 103.23 | saada |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 3 | 103.36 | saada |
| al-hamirah | الحمـرة | Al Ḩamirah | محافظة حجة | PPL | 80 | 2 | 115.55 | saada |
| al-bayyitah | البيتة | Al Bayyitah | محافظة حجة | PPL | 80 | 5 | 114.83 | saada |
| al-qari | القـرئ | Al Qari’ | محافظة حجة | PPL | 80 | 2 | 113.83 | saada |
| al-kawr | الكور | Al Kawr | محافظة حجة | PPL | 80 | 3 | 112.91 | saada |
| lujj-al-azif | لـج العطيف | Lujj al ‘Az̧īf | محافظة حجة | PPL | 80 | 1 | 112.75 | saada |
| lujj-al-fashari | لـج الفشري | Lujj al Fasharī | محافظة حجة | PPL | 80 | 3 | 112.73 | saada |
| al-kharijiyah | الخارجيـة | Al Khārijīyah | محافظة حجة | PPL | 80 | 1 | 108.75 | saada |
| jimanah | جمانة | Jimānah | محافظة حجة | PPL | 80 | 2 | 104.91 | saada |
| al-mufjar | المفجار | Al Mufjār | محافظة حجة | PPL | 80 | 3 | 104.87 | saada |
| al-qurinaj | القرنـج | Al Qurinaj | محافظة حجة | PPL | 80 | 4 | 105.09 | saada |
| al-muqarihah | المقارحـة | Al Muqāriḩah | محافظة حجة | PPL | 80 | 4 | 105.29 | saada |
| al-misahirah | المساهرة | Al Misāhirah | محافظة حجة | PPL | 80 | 4 | 105.69 | saada |
| as-sabah | السابــة | As Sābah | محافظة حجة | PPL | 80 | 1 | 105.97 | saada |
| al-qizah | القزعــة | Al Qiz‘ah | محافظة حجة | PPL | 80 | 3 | 106.54 | saada |
| al-qurayn | القرين | Al Qurayn | محافظة حجة | PPL | 80 | 2 | 105.24 | saada |
| lujj-ash-shifa | لج الشرفاء | Lujj ash Shifā’ | محافظة حجة | PPL | 80 | 3 | 107.33 | saada |
| al-mizan | المعزاب | Al Mi‘zān | محافظة حجة | PPL | 80 | 5 | 108.40 | saada |
| al-marabiah | المر ابعة | Al Marābi‘ah | محافظة حجة | PPL | 80 | 9 | 105.82 | saada |
| ad-dawdinah | الدودنة | Ad Dawdinah | محافظة حجة | PPL | 80 | 5 | 105.06 | saada |
| al-matbah | المطبح | Al Maţbaḩ | محافظة حجة | PPL | 80 | 3 | 104.94 | saada |
| az-zujj | الزج | Az Zujj | محافظة حجة | PPL | 80 | 6 | 107.54 | saada |
| al-masbar | المصبار | Al Maşbār | محافظة حجة | PPL | 80 | 3 | 109.20 | saada |
| lujj-al-anq | لج العنق | Lujj al ‘Anq | محافظة حجة | PPL | 80 | 3 | 110.11 | saada |
| as-sirhah | الصرحة | Aş Şirḩah | محافظة حجة | PPL | 80 | 2 | 109.78 | saada |
| ash-sharah | الشارة | Ash Shārah | محافظة حجة | PPL | 80 | 10 | 109.89 | saada |
| dayrus | ديربس | Dayrus | محافظة حجة | PPL | 80 | 6 | 110.07 | saada |
| al-musfa | المصفـى | Al Muşfá | محافظة حجة | PPL | 80 | 8 | 112.05 | saada |
| al-khiraib | الخرائب | Al Khirā’ib | محافظة حجة | PPL | 80 | 5 | 112.36 | saada |
| ad-dubri | الضبري | Aḑ Ḑubrī | محافظة حجة | PPL | 80 | 6 | 112.22 | saada |
| al-khirabah | الخرابة | Al Khirābah | محافظة حجة | PPL | 80 | 2 | 113.08 | saada |
| al-hamirah | الحمرة | Al Ḩamirah | محافظة حجة | PPL | 80 | 2 | 113.42 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة حجة | PPL | 80 | 3 | 113.77 | saada |
| al-madbar | المضبار | Al Maḑbār | محافظة حجة | PPL | 80 | 4 | 112.76 | saada |
| al-ashraf | الأشراف | Al Ashrāf | محافظة حجة | PPL | 80 | 13 | 113.87 | saada |
| al-maqrud | المقرود | Al Maqrūd | محافظة حجة | PPL | 80 | 5 | 113.09 | saada |
| al-biwat | البوات | Al Biwāt | محافظة حجة | PPL | 80 | 3 | 102.34 | saada |
| al-milut | الملوط | Al Milūţ | محافظة حجة | PPL | 80 | 9 | 115.27 | saada |
| al-malhah | الملحة | Al Malḩah | محافظة حجة | PPL | 80 | 5 | 115.94 | saada |
| al-usaydah | العصيدة | Al ‘Uşaydah | محافظة حجة | PPL | 80 | 11 | 96.79 | saada |
| al-mihdadah | المحدادة | Al Miḩdādah | محافظة حجة | PPL | 80 | 4 | 97.56 | saada |
| al-majrib | المجرب | Al Majrib | محافظة حجة | PPL | 80 | 8 | 97.88 | saada |
| al-maghriyah | المغربة | Al Maghrīyah | محافظة حجة | PPL | 80 | 6 | 97.61 | saada |
| al-birkah | البركة | Al Birkah | محافظة حجة | PPL | 80 | 4 | 97.39 | saada |
| al-maqtaf | المقطاف | Al Maqţāf | محافظة حجة | PPL | 80 | 7 | 97.66 | saada |
| al-jihut | الجهوت | Al Jihūt | محافظة حجة | PPL | 80 | 7 | 97.04 | saada |
| al-malit | المالط | Al Māliţ | محافظة حجة | PPL | 80 | 4 | 97.16 | saada |
| bani-salih | بنى صالح | Banī Şāliḩ | محافظة حجة | PPL | 80 | 3 | 96.63 | saada |
| bani-maslah | بنى مصلح | Banī Maşlaḩ | محافظة حجة | PPL | 80 | 2 | 96.27 | saada |
| al-masawd | المسود | Al Masawd | محافظة حجة | PPL | 80 | 3 | 96.12 | saada |
| ar-rakiyah | الركية | Ar Rakīyah | محافظة حجة | PPL | 80 | 1 | 96.35 | saada |
| al-arish | العريش | Al ‘Arīsh | محافظة حجة | PPL | 80 | 2 | 96.39 | saada |
| gharib-qays | غارب قيـس | Ghārib Qays | محافظة حجة | PPL | 80 | 4 | 96.33 | saada |
| ad-dimnah | الدمنـة | Ad Dimnah | محافظة حجة | PPL | 80 | 5 | 95.82 | saada |
| al-mahil | الماحل | Al Māḩil | محافظة حجة | PPL | 80 | 6 | 96.70 | saada |
| qila-al-basal | قلاع البصل | Qilā‘ al Başal | محافظة حجة | PPL | 80 | 27 | 97.78 | saada |
| al-makawaah | المكاوعة | Al Makāwa‘ah | محافظة حجة | PPL | 80 | 186 | 98.12 | saada |
| mabaytih | مبيطح | Mabayţiḩ | محافظة حجة | PPL | 80 | 55 | 98.06 | saada |
| al-maayzbah | المعيزبة | Al Ma‘ayzbah | محافظة حجة | PPL | 80 | 109 | 97.92 | saada |
| aqam-ar-rajim | عقم الرجيم | ‘Aqam ar Rajīm | محافظة حجة | PPL | 80 | 54 | 97.92 | saada |
| al-aqqam | العقم | Al ‘Aqqam | محافظة حجة | PPL | 80 | 64 | 97.95 | saada |
| al-mujarin | المجارين | Al Mujārīn | محافظة حجة | PPL | 80 | 71 | 98.08 | saada |
| al-wasit | الواسط | Al Wāsiţ | محافظة حجة | PPL | 80 | 3 | 97.09 | saada |
| al-makhyat | المخياط | Al Makhyāţ | محافظة حجة | PPL | 80 | 6 | 97.26 | saada |
| al-maqiyah | المقعية | Al Maq‘īyah | محافظة حجة | PPL | 80 | 8 | 97.07 | saada |
| majran-ash-shati | مجران الشاطـي | Majrān ash Shāţi’ | محافظة حجة | PPL | 80 | 2 | 97.17 | saada |
| al-juruf | الجروف | Al Jurūf | محافظة حجة | PPL | 80 | 3 | 96.19 | saada |
| al-maqiyah-as-sufla | المقعية السفلى | Al Maq‘īyah as Suflá | محافظة حجة | PPL | 80 | 7 | 96.14 | saada |
| bayt-as-sawda | بيت السودى | Bayt as Sawdá | محافظة حجة | PPL | 80 | 7 | 95.98 | saada |
| al-musbar | المصبار | Al Muşbār | محافظة حجة | PPL | 80 | 5 | 96.33 | saada |
| al-qaflah | القفلة | Al Qaflah | محافظة حجة | PPL | 80 | 8 | 96.36 | saada |
| al-jadah-al-ulya | الجادة العليا | Al Jādah al ‘Ulyā | محافظة حجة | PPL | 80 | 9 | 94.80 | saada |
| al-maghribah | المغربة | Al Maghribah | محافظة حجة | PPL | 80 | 17 | 94.43 | saada |
| bani-shariyah | بنى شربة | Banī Sharīyah | محافظة حجة | PPL | 80 | 13 | 95.10 | saada |
| al-jadah-as-sufla | الجادة السفلى | Al Jādah as Suflá | محافظة حجة | PPL | 80 | 48 | 95.17 | saada |
| al-marid | المعرض | Al Ma‘riḑ | محافظة حجة | PPL | 80 | 6 | 95.07 | saada |
| adhir | غدير | Adhīr | محافظة حجة | PPL | 80 | 11 | 95.17 | saada |
| al-bayda | البيضاء | Al Bayḑā’ | محافظة حجة | PPL | 80 | 5 | 95.12 | saada |
| as-sawdah | السودة | As Sawdah | محافظة حجة | PPL | 80 | 13 | 95.22 | saada |
| al-kawmah | الكومة | Al Kawmah | محافظة حجة | PPL | 80 | 4 | 94.78 | saada |
| shafawi | شفاوي | Shafāwī | محافظة حجة | PPL | 80 | 2 | 92.97 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة حجة | PPL | 80 | 2 | 93.28 | saada |
| al-muaqib | المعاقب | Al Mu‘āqib | محافظة حجة | PPL | 80 | 10 | 93.45 | saada |
| al-kadhiyah-bani-hayat | الكاذية بنى حياط | Al Kādhīyah Banī Ḩayāţ | محافظة حجة | PPL | 80 | 9 | 94.85 | saada |
| al-muqaddir | المقدر | Al Muqaddir | محافظة حجة | PPL | 80 | 19 | 98.62 | saada |
| gharib-sawalib | غارب صوالب | Ghārib Şawālib | محافظة حجة | PPL | 80 | 3 | 98.23 | saada |
| gharib-al-mujarin | غارب المجارين | Ghārib al Mujārīn | محافظة حجة | PPL | 80 | 3 | 98.34 | saada |
| al-maghribah | المغربة | Al Maghribah | محافظة حجة | PPL | 80 | 6 | 98.59 | saada |
| al-ariq | العرق | Al ‘Ariq | محافظة حجة | PPL | 80 | 11 | 98.67 | saada |
| al-marakibah | المركابة | Al Marākibah | محافظة حجة | PPL | 80 | 3 | 98.63 | saada |
| as-sawalib | الصوالب | Aş Şawālib | محافظة حجة | PPL | 80 | 9 | 98.30 | saada |
| gharib-majdibah | غارب مجدبة | Ghārib Majdibah | محافظة حجة | PPL | 80 | 25 | 97.36 | saada |
| majran-as-suq | مجران السوق | Majrān as Sūq | محافظة حجة | PPL | 80 | 27 | 97.87 | saada |
| al-mushayb | المشيب | Al Mushayb | محافظة حجة | PPL | 80 | 52 | 97.80 | saada |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 8 | 98.68 | saada |
| al-qadah | القضـاه | Al Qaḑāh | محافظة حجة | PPL | 80 | 10 | 98.37 | saada |
| al-mawdanah | المودنــة | Al Mawdanah | محافظة حجة | PPL | 80 | 5 | 98.74 | saada |
| al-qayyam | القيـم | Al Qayyam | محافظة حجة | PPL | 80 | 2 | 98.70 | saada |
| al-hajar | الحجار | Al Ḩajār | محافظة حجة | PPL | 80 | 7 | 97.42 | saada |
| al-kuma | الكوما | Al Kūmā | محافظة حجة | PPL | 80 | 2 | 97.50 | saada |
| al-khalwah | الخلوة | Al Khalwah | محافظة حجة | PPL | 80 | 3 | 97.38 | saada |
| al-hawl | الحول | Al Ḩawl | محافظة حجة | PPL | 80 | 2 | 97.05 | saada |
| al-qiza | القزاع | Al Qizā‘ | محافظة حجة | PPL | 80 | 4 | 96.98 | saada |
| al-qarrah | القرة | Al Qarrah | محافظة حجة | PPL | 80 | 5 | 97.23 | saada |
| ar-ramadah | الرمادة | Ar Ramādah | محافظة حجة | PPL | 80 | 2 | 97.58 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة حجة | PPL | 80 | 5 | 96.19 | saada |
| as-sidaq | الصداق | Aş Şidāq | محافظة حجة | PPL | 80 | 10 | 97.05 | saada |
| al-atamah | العتمة | Al ‘Atamah | محافظة حجة | PPL | 80 | 2 | 96.98 | saada |
| gharib-al-mijrab | غارب المجراب | Ghārib al Mijrāb | محافظة حجة | PPL | 80 | 15 | 96.66 | saada |
| al-khartum | الخرطوم | Al Kharţūm | محافظة حجة | PPL | 80 | 2 | 96.78 | saada |
| al-atamah | العتمة | Al ‘Atamah | محافظة حجة | PPL | 80 | 11 | 97.60 | saada |
| gharib-al-fundi | غارب الفندي | Ghārib al Fundī | محافظة حجة | PPL | 80 | 3 | 98.14 | saada |
| ash-shawbah | الشوبة | Ash Shawbah | محافظة حجة | PPL | 80 | 10 | 97.33 | saada |
| al-ghawl | الغول | Al Ghawl | محافظة حجة | PPL | 80 | 34 | 98.44 | saada |
| al-madirah | المديرة | Al Madīrah | محافظة حجة | PPL | 80 | 50 | 97.89 | saada |
| al-jawfa | الجوفاء | Al Jawfā’ | محافظة حجة | PPL | 80 | 15 | 99.18 | saada |
| ad-durayb | الدريب | Ad Durayb | محافظة حجة | PPL | 80 | 11 | 99.30 | saada |
| al-amisha | العميشاء | Al ‘Amīshā’ | محافظة حجة | PPL | 80 | 18 | 99.29 | saada |
| al-mahdadah | المحدادة | Al Maḩdādah | محافظة حجة | PPL | 80 | 20 | 99.33 | saada |
| al-masur-al-asfal | المعصور الأسفل | Al Ma‘şūr al Asfal | محافظة حجة | PPL | 80 | 35 | 99.00 | saada |
| ar-rakub | الركوب | Ar Rakūb | محافظة حجة | PPL | 80 | 15 | 99.36 | saada |
| al-hirabaysh | الحرابيش | Al Ḩirābaysh | محافظة حجة | PPL | 80 | 44 | 97.94 | saada |
| bani-rajih | بنى راجح | Banī Rājiḩ | محافظة حجة | PPL | 80 | 22 | 98.10 | saada |
| al-madbab | المضباب | Al Maḑbāb | محافظة حجة | PPL | 80 | 2 | 94.67 | saada |
| habil-gharib-as-safarah | حبيل غارب السفارة | Ḩabīl Ghārib as Safārah | محافظة حجة | PPL | 80 | 6 | 95.25 | saada |
| al-matiriyah | الماطرية | Al Māţirīyah | محافظة حجة | PPL | 80 | 1 | 95.36 | saada |
| ar-rasaiyah | الرصاعية | Ar Raşā‘īyah | محافظة حجة | PPL | 80 | 3 | 95.96 | saada |
| ad-dabr | الضبر | Aḑ Ḑabr | محافظة حجة | PPL | 80 | 2 | 95.88 | saada |
| gharib-kara | غارب كراع | Ghārib Karā‘ | محافظة حجة | PPL | 80 | 3 | 96.14 | saada |
| al-muthayl | المثيل | Al Muthayl | محافظة حجة | PPL | 80 | 8 | 96.35 | saada |
| al-mirhah | المرهــة | Al Mirhah | محافظة حجة | PPL | 80 | 1 | 94.79 | saada |
| as-sira | الصيراء | Aş Şīrā’ | محافظة حجة | PPL | 80 | 4 | 93.90 | saada |
| al-mihzun | المحزون | Al Miḩzūn | محافظة حجة | PPL | 80 | 2 | 93.93 | saada |
| al-habwah | الحبوة | Al Ḩabwah | محافظة حجة | PPL | 80 | 34 | 94.17 | saada |
| al-kadhiyah | الكاذية | Al Kādhīyah | محافظة حجة | PPL | 80 | 10 | 93.23 | saada |
| ar-raqah | الرقعة | Ar Raq‘ah | محافظة حجة | PPL | 80 | 8 | 93.52 | saada |
| ar-rajwah | الرجوة | Ar Rajwah | محافظة حجة | PPL | 80 | 7 | 93.76 | saada |
| al-jurayb | الجريب | Al Jurayb | محافظة حجة | PPL | 80 | 19 | 96.99 | saada |
| al-juruf | الجروف | Al Jurūf | محافظة حجة | PPL | 80 | 3 | 97.08 | saada |
| ad-darah | الدارة | Ad Dārah | محافظة حجة | PPL | 80 | 8 | 96.79 | saada |
| ash-shaiyah | الشعية | Ash Sha‘īyah | محافظة حجة | PPL | 80 | 2 | 97.28 | saada |
| al-mizab | المعزاب | Al Mi‘zāb | محافظة حجة | PPL | 80 | 3 | 97.11 | saada |
| al-mafil | المفل | Al Mafil | محافظة حجة | PPL | 80 | 3 | 97.23 | saada |
| al-majnah | المجنة | Al Majnah | محافظة حجة | PPL | 80 | 2 | 96.86 | saada |
| bayt-kamil | بيت كامل | Bayt Kāmil | محافظة حجة | PPL | 80 | 18 | 93.82 | saada |
| bayt-al-umari | بيت العمري | Bayt al ‘Umarī | محافظة حجة | PPL | 80 | 4 | 92.43 | saada |
| al-madbar | المضبار | Al Maḑbār | محافظة حجة | PPL | 80 | 1 | 93.25 | saada |
| al-mahraq | المحراق | Al Maḩrāq | محافظة حجة | PPL | 80 | 6 | 91.93 | saada |
| al-hazir | الحزر | Al Ḩazir | محافظة حجة | PPL | 80 | 5 | 88.47 | saada |
| al-badh | البدح | Al Badḩ | محافظة حجة | PPL | 80 | 4 | 90.70 | saada |
| at-tabbab | التبب | At Tabbab | محافظة حجة | PPL | 80 | 8 | 89.12 | saada |
| al-khabb | الخب | Al Khabb | محافظة حجة | PPL | 80 | 17 | 91.42 | saada |
| al-qaim | القائم | Al Qāi’m | محافظة حجة | PPL | 80 | 4 | 90.81 | saada |
| al-hawl | الحول | Al Ḩawl | محافظة حجة | PPL | 80 | 8 | 91.13 | saada |
| as-sabir | الصابر | Aş Şābir | محافظة حجة | PPL | 80 | 7 | 91.24 | saada |
| al-munadhir | المناذر | Al Munādhir | محافظة حجة | PPL | 80 | 13 | 91.09 | saada |
| al-markaz | المزكر | Al Markaz | محافظة حجة | PPL | 80 | 7 | 90.83 | saada |
| maghribat-al-jarubah | مغربة الجروبة | Maghribat al Jarūbah | محافظة حجة | PPL | 80 | 7 | 92.38 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 1 | 89.53 | saada |
| ar-riyahin | الرياحين | Ar Riyāḩīn | محافظة حجة | PPL | 80 | 2 | 90.97 | saada |
| ad-dafinah | الدفنة | Ad Dafinah | محافظة حجة | PPL | 80 | 5 | 90.12 | saada |
| al-mujawaz | المجواز | Al Mujawāz | محافظة حجة | PPL | 80 | 11 | 89.94 | saada |
| al-jurub | الجروب | Al Jurūb | محافظة حجة | PPL | 80 | 1 | 89.87 | saada |
| as-saghi | الصاغي | Aş Şāghī | محافظة حجة | PPL | 80 | 1 | 90.46 | saada |
| ash-shadidah | الشديدة | Ash Shadīdah | محافظة حجة | PPL | 80 | 9 | 89.40 | saada |
| lajih-al-akshah | لجح العكشة | Lajiḩ al ‘Akshah | محافظة حجة | PPL | 80 | 1 | 89.44 | saada |
| ar-razm | الرزم | Ar Razm | محافظة حجة | PPL | 80 | 1 | 93.16 | saada |
| al-matzul | المتزل | Al Matzul | محافظة حجة | PPL | 80 | 7 | 87.50 | saada |
| al-jurriq | الجرق | Al Jurriq | محافظة حجة | PPL | 80 | 8 | 87.42 | saada |
| at-tarf | الطرف | Aţ Ţarf | محافظة حجة | PPL | 80 | 7 | 88.02 | saada |
| ad-dahar | الداحر | Ad Dāhar | محافظة حجة | PPL | 80 | 3 | 88.00 | saada |
| al-khirab | الخراب | Al Khirāb | محافظة حجة | PPL | 80 | 8 | 88.60 | saada |
| al-mafjar | المفجر | Al Mafjar | محافظة حجة | PPL | 80 | 8 | 90.20 | saada |
| al-majhaf | المجهف | Al Majhaf | محافظة حجة | PPL | 80 | 3 | 89.95 | saada |
| lujj-shani | لج شانع | Lujj Shāni‘ | محافظة حجة | PPL | 80 | 2 | 88.50 | saada |
| al-kadis | الكدس | Al Kadis | محافظة حجة | PPL | 80 | 3 | 88.97 | saada |
| al-aquq | العقوق | Al ‘Aqūq | محافظة حجة | PPL | 80 | 10 | 88.94 | saada |
| al-juruf | الجروف | Al Jurūf | محافظة حجة | PPL | 80 | 4 | 88.81 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة حجة | PPL | 80 | 10 | 88.73 | saada |
| qimat-al-hajj | قيمة الحاج | Qīmat al Ḩājj | محافظة حجة | PPL | 80 | 2 | 88.77 | saada |
| al-qatifah | القطفة | Al Qaţifah | محافظة حجة | PPL | 80 | 7 | 88.27 | saada |
| al-jifanah | الجفانة | Al Jifānah | محافظة حجة | PPL | 80 | 6 | 89.08 | saada |
| al-khiraib | الجرائب | Al Khirā’ib | محافظة حجة | PPL | 80 | 25 | 92.64 | saada |
| al-jarb | الجرب | Al Jarb | محافظة حجة | PPL | 80 | 3 | 93.53 | saada |
| gharb-al-mudakkil | غرب المدكل | Gharb al Mudakkil | محافظة حجة | PPL | 80 | 11 | 92.72 | saada |
| al-mihudah | المحودة | Al Miḩūdah | محافظة حجة | PPL | 80 | 6 | 92.28 | saada |
| as-siwani | الصوانع | Aş Şiwāni‘ | محافظة حجة | PPL | 80 | 20 | 92.40 | saada |
| shati-as-sawligh | شاطى الصولغ | Shāţi’ aş Şawligh | محافظة حجة | PPL | 80 | 4 | 93.27 | saada |
| as-sawdi | السودي | As Sawdī | محافظة حجة | PPL | 80 | 10 | 93.33 | saada |
| as-safr | الصفر | Aş Şafr | محافظة حجة | PPL | 80 | 23 | 92.08 | saada |
| ar-rahah | الراحة | Ar Rāḩah | محافظة حجة | PPL | 80 | 3 | 89.07 | saada |
| al-alayah | العلاية | Al ‘Alāyah | محافظة حجة | PPL | 80 | 37 | 87.57 | saada |
| ar-rujum | الرجم | Ar Rujum | محافظة حجة | PPL | 80 | 1 | 86.68 | saada |
| al-makhyam | المخيام | Al Makhyām | محافظة حجة | PPL | 80 | 6 | 87.50 | saada |
| al-hamar | الحمر | Al Ḩamar | محافظة حجة | PPL | 80 | 11 | 87.70 | saada |
| adh-dhaniyah | الذنية | Adh Dhanīyah | محافظة حجة | PPL | 80 | 6 | 87.96 | saada |
| al-mawkhal-lujj-shani | الموخل لج شانع | Al Mawkhal Lujj Shāni‘ | محافظة حجة | PPL | 80 | 3 | 88.11 | saada |
| al-mahma | المحما | Al Maḩmā | محافظة حجة | PPL | 80 | 5 | 86.17 | saada |
| samir | سامر | Sāmir | محافظة حجة | PPL | 80 | 3 | 86.41 | saada |
| al-mijrab | المجرب | Al Mijrab | محافظة حجة | PPL | 80 | 1 | 87.06 | saada |
| al-qasbah | القصبة | Al Qaşbah | محافظة حجة | PPL | 80 | 2 | 86.29 | saada |
| khirab-al-aqabah | خراب العقبة | Khirāb al ‘Aqabah | محافظة حجة | PPL | 80 | 4 | 86.47 | saada |
| dhira-al-gharbah | ذراع الغربة | Dhirā‘ al Gharbah | محافظة حجة | PPL | 80 | 4 | 86.97 | saada |
| al-aratayj | العراتيج | Al ‘Arātayj | محافظة حجة | PPL | 80 | 2 | 87.03 | saada |
| al-qadbah | القضبة | Al Qaḑbah | محافظة حجة | PPL | 80 | 2 | 87.02 | saada |
| al-haqlah | الحلقة | Al Ḩaqlah | محافظة حجة | PPL | 80 | 3 | 88.93 | saada |
| lujj-mirab | لج مرعان | Lujj Mir‘āb | محافظة حجة | PPL | 80 | 1 | 89.29 | saada |
| ar-raqqah | الرقة | Ar Raqqah | محافظة حجة | PPL | 80 | 7 | 88.03 | saada |
| al-hamirah | الحمرة | Al Ḩamirah | محافظة حجة | PPL | 80 | 2 | 89.64 | saada |
| ash-shaashi | الشعاشع | Ash Sha‘āshi‘ | محافظة حجة | PPL | 80 | 2 | 89.48 | saada |
| al-hadibah | الحدبة | Al Ḩadibah | محافظة حجة | PPL | 80 | 2 | 88.78 | saada |
| habil-ar-rakkib-ash-sharqi | حبيل الركب الشرقي | Ḩabīl ar Rakkib ash Sharqī | محافظة حجة | PPL | 80 | 21 | 95.91 | saada |
| habil-ar-rakkib-al-gharbi | حبيل الركب الغربى | Ḩabīl ar Rakkib al Gharbī | محافظة حجة | PPL | 80 | 15 | 95.86 | saada |
| al-jadlah | الجدلة | Al Jadlah | محافظة حجة | PPL | 80 | 3 | 104.52 | saada |
| al-madhabil | المذابل | Al Madhābil | محافظة حجة | PPL | 80 | 6 | 103.09 | saada |
| as-salibah | الصالبة | Aş Şālibah | محافظة حجة | PPL | 80 | 13 | 102.90 | saada |
| yaghnam | يغنم | Yaghnam | محافظة حجة | PPL | 80 | 15 | 102.86 | saada |
| ad-dabil | الدعبـل | Ad Da‘bil | محافظة حجة | PPL | 80 | 43 | 102.92 | saada |
| al-quwabil | القوابل | Al Quwābil | محافظة حجة | PPL | 80 | 13 | 103.17 | saada |
| al-huthan | الحثــن | Al Ḩuthan | محافظة حجة | PPL | 80 | 23 | 103.26 | saada |
| al-lujaym | اللجيم | Al Lujaym | محافظة حجة | PPL | 80 | 1 | 102.55 | saada |
| al-buwahilah | البواحلة | Al Buwāḩilah | محافظة حجة | PPL | 80 | 7 | 101.86 | saada |
| al-hushnays | الحشنيس | Al Ḩushnays | محافظة حجة | PPL | 80 | 3 | 101.21 | saada |
| bayt-qasim | بيت قاسم | Bayt Qāsim | محافظة حجة | PPL | 80 | 3 | 102.74 | saada |
| bayt-al-aqil | بيت العقيل | Bayt al ‘Aqīl | محافظة حجة | PPL | 80 | 2 | 102.69 | saada |
| bayt-hamran | بيت حمران | Bayt Ḩamrān | محافظة حجة | PPL | 80 | 7 | 102.51 | saada |
| as-sami | الصمع | Aş Şami‘ | محافظة حجة | PPL | 80 | 18 | 102.65 | saada |
| bayt-jabir | بيت جابر | Bayt Jābir | محافظة حجة | PPL | 80 | 7 | 102.59 | saada |
| bayt-qayyah | بيت قية | Bayt Qayyah | محافظة حجة | PPL | 80 | 4 | 102.42 | saada |
| al-jarb | الجرب | Al Jarb | محافظة حجة | PPL | 80 | 3 | 102.45 | saada |
| al-hafuz | الحفوز | Al Ḩafūz | محافظة حجة | PPL | 80 | 18 | 101.89 | saada |
| lujj-al-hanish | لج الحنش | Lujj al Ḩanish | محافظة حجة | PPL | 80 | 2 | 101.68 | saada |
| ali-hadi | علي هادي | ‘Alī Hādī | محافظة حجة | PPL | 80 | 6 | 111.94 | saada |
| al-mahlali | المحلالي | Al Maḩlālī | محافظة حجة | PPL | 80 | 3 | 110.73 | saada |
| al-madman | المدمن | Al Madman | محافظة حجة | PPL | 80 | 1 | 110.19 | saada |
| al-dayr-mahall-as-sayyid | الدير محل السيد | Al Dayr Maḩall as Sayyid | محافظة حجة | PPL | 80 | 7 | 110.75 | saada |
| dahir-az-zaydi | داحر الزيدي | Dāḩir az Zaydī | محافظة حجة | PPL | 80 | 13 | 109.98 | saada |
| al-murbakh | المربخ | Al Murbakh | محافظة حجة | PPL | 80 | 14 | 108.51 | saada |
| al-alaya | العلايا | Al ‘Alāyā | محافظة حجة | PPL | 80 | 5 | 108.88 | saada |
| al-jillah | الجلة | Al Jillah | محافظة حجة | PPL | 80 | 2 | 108.62 | saada |
| as-sarr | السر | As Sarr | محافظة حجة | PPL | 80 | 6 | 108.66 | saada |
| al-muqta | المقطع | Al Muqţa‘ | محافظة حجة | PPL | 80 | 7 | 101.32 | saada |
| bayt-al-hanuma | بيت الهنومى | Bayt al Hanūmá | محافظة حجة | PPL | 80 | 10 | 99.81 | saada |
| hayjah-al-majil | هيجة الماجل | Hayjah al Mājil | محافظة حجة | PPL | 80 | 9 | 98.43 | saada |
| bayt-khamjan | بيت خمجان | Bayt Khamjān | محافظة حجة | PPL | 80 | 3 | 98.62 | saada |
| qanan-ash-shawarifah | قنان الشوارفة | Qanān ash Shawārifah | محافظة حجة | PPL | 80 | 34 | 98.27 | saada |
| bani-tahir | بنى طاهر | Banī Ţāhir | محافظة حجة | PPL | 80 | 10 | 98.90 | saada |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة حجة | PPL | 80 | 12 | 102.07 | saada |
| al-karawa | الكراوى | Al Karāwá | محافظة حجة | PPL | 80 | 73 | 100.29 | saada |
| al-muhayibah | المهايبة | Al Muhāyibah | محافظة حجة | PPL | 80 | 20 | 99.84 | saada |
| akabah | عكابة | ‘Akābah | محافظة حجة | PPL | 80 | 17 | 101.45 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 9 | 101.29 | saada |
| lahudin | لحودين | Laḩūdīn | محافظة حجة | PPL | 80 | 7 | 104.47 | saada |
| bayt-qays | بيت قيس | Bayt Qays | محافظة حجة | PPL | 80 | 5 | 104.30 | saada |
| al-jarf | الجرف | Al Jarf | محافظة حجة | PPL | 80 | 10 | 103.96 | saada |
| al-badh | البدح | Al Badḩ | محافظة حجة | PPL | 80 | 9 | 104.29 | saada |
| al-jarir | الجرير | Al Jarīr | محافظة حجة | PPL | 80 | 4 | 100.59 | saada |
| al-manaqim | المناقم | Al Manāqim | محافظة حجة | PPL | 80 | 10 | 100.42 | saada |
| bayt-al-haburi | بيت الحبوري | Bayt al Ḩabūrī | محافظة حجة | PPL | 80 | 5 | 101.45 | saada |
| bayt-kadim | بيت كديم | Bayt Kadīm | محافظة حجة | PPL | 80 | 4 | 100.93 | saada |
| al-hafasi | الحفصـي | Al Ḩafaşī | محافظة حجة | PPL | 80 | 3 | 101.04 | saada |
| al-qulaibah | القلاعبة | Al Qulā‘ibah | محافظة حجة | PPL | 80 | 17 | 101.64 | saada |
| ghasyan | غصيان | Ghaşyān | محافظة حجة | PPL | 80 | 59 | 98.58 | saada |
| haythan | هيثان | Haythān | محافظة حجة | PPL | 80 | 22 | 98.27 | saada |
| al-jarrib | الجرب | Al Jarrib | محافظة حجة | PPL | 80 | 15 | 98.82 | saada |
| qilhah | قلحاح | Qilḩāḩ | محافظة حجة | PPL | 80 | 13 | 98.81 | saada |
| al-kiyanah | الكيانة | Al Kiyānah | محافظة حجة | PPL | 80 | 57 | 98.81 | saada |
| lujj-ad-dabba | لج الدبا | Lujj ad Dabbā | محافظة حجة | PPL | 80 | 20 | 99.39 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 5 | 99.10 | saada |
| al-mawziyat | الموزيات | Al Mawzīyāt | محافظة حجة | PPL | 80 | 6 | 99.17 | saada |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة حجة | PPL | 80 | 14 | 99.29 | saada |
| al-qawayyidah | القويعدة | Al Qawayyi‘dah | محافظة حجة | PPL | 80 | 14 | 99.47 | saada |
| shati-ar-rukbah | شاطئ الركبة | Shāţi’ ar Rukbah | محافظة حجة | PPL | 80 | 11 | 99.60 | saada |
| al-mahall | المحل | Al Maḩall | محافظة حجة | PPL | 80 | 7 | 99.35 | saada |
| al-wasitah | الواسطة | Al Wāsiţah | محافظة حجة | PPL | 80 | 7 | 99.32 | saada |
| al-ashimah | العشمة | Al ‘Ashimah | محافظة حجة | PPL | 80 | 3 | 100.11 | saada |
| gharib-muhammad | غارب محمد | Ghārib Muḩammad | محافظة حجة | PPL | 80 | 2 | 104.42 | saada |
| ashat-at-taqah | عشة التقعة | ‘Ashat at Taq‘ah | محافظة حجة | PPL | 80 | 6 | 104.32 | saada |
| as-sulahayt | السلاحيط | As Sulāḩayţ | محافظة حجة | PPL | 80 | 6 | 104.04 | saada |
| shaharah | شهارة | Shahārah | محافظة حجة | PPL | 80 | 23 | 103.97 | saada |
| ghurab-hayran | غراب حيران | Ghurāb Ḩayrān | محافظة حجة | PPL | 80 | 23 | 103.82 | saada |
| ad-dahlah | الدحلة | Ad Daḩlah | محافظة حجة | PPL | 80 | 7 | 104.22 | saada |
| al-maqlifa | المقلفع | Al Maqlifa‘ | محافظة حجة | PPL | 80 | 17 | 104.33 | saada |
| dayr-al-yadu | دير اليدو | Dayr al Yadū | محافظة حجة | PPL | 80 | 23 | 104.01 | saada |
| az-zahirah-as-sufla | الظهرة السفلى | Az̧ Z̧ahirah as Suflá | محافظة حجة | PPL | 80 | 40 | 101.29 | saada |
| lujj-harb | لج حرب | Lujj Ḩarb | محافظة حجة | PPL | 80 | 3 | 101.41 | saada |
| bani-abidah | بنى عبدة | Banī ‘Abidah | محافظة حجة | PPL | 80 | 3 | 100.99 | saada |
| an-nuzlah | النزلة | An Nuzlah | محافظة حجة | PPL | 80 | 3 | 100.70 | saada |
| gharib-al-qaryah | غارب القرية | Ghārib al Qaryah | محافظة حجة | PPL | 80 | 4 | 101.20 | saada |
| al-asah | العصــة | Al ‘Aşah | محافظة حجة | PPL | 80 | 7 | 101.70 | saada |
| suq-tinan | سوق طناب | Sūq Ţinān | محافظة حجة | PPL | 80 | 7 | 101.29 | saada |
| as-sahamin | السهمين | As Sahamīn | محافظة حجة | PPL | 80 | 7 | 101.52 | saada |
| ath-thaluqah | الثالوقة | Ath Thālūqah | محافظة حجة | PPL | 80 | 1 | 101.44 | saada |
| gharib-al-mahrath | غارب المحراث | Ghārib al Maḩrāth | محافظة حجة | PPL | 80 | 3 | 101.56 | saada |
| al-habil-bani-nur | الحبيل بنى نور | Al Ḩabīl Banī Nūr | محافظة حجة | PPL | 80 | 3 | 102.13 | saada |
| az-zahirah-al-ulya | الظهرة العليا | Az̧ Z̧ahirah al ‘Ulyā | محافظة حجة | PPL | 80 | 10 | 102.18 | saada |
| al-minjarah | المنجارة | Al Minjārah | محافظة حجة | PPL | 80 | 6 | 102.34 | saada |
| al-ajajah | العجاجة | Al ‘Ajājah | محافظة حجة | PPL | 80 | 3 | 102.13 | saada |
| gharib-umar | غارب عمر | Ghārib ‘Umar | محافظة حجة | PPL | 80 | 7 | 102.29 | saada |
| al-hawariq | الحوارق | Al Ḩawāriq | محافظة حجة | PPL | 80 | 17 | 102.51 | saada |
| al-miqashayb | المقاشيب | Al Miqāshayb | محافظة حجة | PPL | 80 | 3 | 102.39 | saada |
| habil-al-fasil | حبيل الفصل | Ḩabīl al Faşil | محافظة حجة | PPL | 80 | 45 | 101.74 | saada |
| al-maqam | المقم | Al Maqam | محافظة حجة | PPL | 80 | 14 | 100.88 | saada |
| al-khirayib | الخرايب | Al Khirāyib | محافظة حجة | PPL | 80 | 15 | 103.56 | saada |
| al-hibaji | الحباجـي | Al Ḩibājī | محافظة حجة | PPL | 80 | 5 | 104.11 | saada |
| al-hamadiyah | الحمادية | Al Ḩamādīyah | محافظة حجة | PPL | 80 | 2 | 104.02 | saada |
| ash-shuramah | الشرامة | Ash Shurāmah | محافظة حجة | PPL | 80 | 6 | 97.91 | saada |
| at-tawil | الطويل | Aţ Ţawīl | محافظة حجة | PPL | 80 | 4 | 98.12 | saada |
| al-jaddub | الجدب | Al Jaddub | محافظة حجة | PPL | 80 | 5 | 97.96 | saada |
| az-zafar | الظفر | Az̧ Z̧afar | محافظة حجة | PPL | 80 | 1 | 97.64 | saada |
| al-kabbi | الكبي | Al Kabbī | محافظة حجة | PPL | 80 | 2 | 97.72 | saada |
| al-jurdah | الجردة | Al Jurdah | محافظة حجة | PPL | 80 | 6 | 97.52 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 3 | 97.90 | saada |
| al-musahim | المساهم | Al Musāhim | محافظة حجة | PPL | 80 | 21 | 108.72 | saada |
| al-mazbur | المزبور | Al Mazbūr | محافظة حجة | PPL | 80 | 9 | 108.28 | saada |
| al-kiyadah | الكيعدة | Al Kiya‘dah | محافظة حجة | PPL | 80 | 1 | 105.49 | saada |
| lujj-al-hamar | لج الحمر | Lujj al Ḩamar | محافظة حجة | PPL | 80 | 1 | 105.72 | saada |
| al-qullah | القلة | Al Qullah | محافظة حجة | PPL | 80 | 1 | 105.27 | saada |
| al-alaya | العلايا | Al ‘Alāyā | محافظة حجة | PPL | 80 | 2 | 104.92 | saada |
| al-jurf | الجرف | Al Jurf | محافظة حجة | PPL | 80 | 4 | 104.90 | saada |
| as-saham | السهم | As Saham | محافظة حجة | PPL | 80 | 5 | 104.62 | saada |
| al-masad | المعصاد | Al Ma‘şād | محافظة حجة | PPL | 80 | 10 | 105.83 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة حجة | PPL | 80 | 3 | 104.96 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 11 | 104.79 | saada |
| adh-dhara-bayt-jaman | الذارى بيت جمعان | Adh Dhārá Bayt Jam‘ān | محافظة حجة | PPL | 80 | 9 | 105.29 | saada |
| an-niyabah | النيابة | An Niyābah | محافظة حجة | PPL | 80 | 8 | 104.85 | saada |
| al-hudayshiyah | الهديشية | Al Hudayshīyah | محافظة حجة | PPL | 80 | 30 | 105.82 | saada |
| as-saham | السهم | As Saham | محافظة حجة | PPL | 80 | 4 | 105.88 | saada |
| al-bursh | البرش | Al Bursh | محافظة حجة | PPL | 80 | 21 | 105.70 | saada |
| al-hijayyiziyah | الحجيزية | Al Ḩijayyizīyah | محافظة حجة | PPL | 80 | 2 | 105.07 | saada |
| gharib-al-hals | غارب الحلص | Ghārib al Ḩalş | محافظة حجة | PPL | 80 | 11 | 105.28 | saada |
| al-amish | العميش | Al ‘Amīsh | محافظة حجة | PPL | 80 | 26 | 105.36 | saada |
| bayt-surayd | بيت سريد | Bayt Surayd | محافظة حجة | PPL | 80 | 6 | 105.70 | saada |
| al-bilahiyah | البلاحية | Al Bilāḩīyah | محافظة حجة | PPL | 80 | 15 | 105.25 | saada |
| as-sawdah | السودة | As Sawdah | محافظة حجة | PPL | 80 | 11 | 106.04 | saada |
| al-mirazinah | المرازنة | Al Mirāzinah | محافظة حجة | PPL | 80 | 27 | 105.60 | saada |
| lujj-an-nasham | لج النشم | Lujj an Nasham | محافظة حجة | PPL | 80 | 5 | 107.19 | saada |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة حجة | PPL | 80 | 4 | 106.74 | saada |
| bayt-al-jabar | بيت الجبر | Bayt al Jabar | محافظة حجة | PPL | 80 | 4 | 107.04 | saada |
| al-alaya-bani-faraj | العلايا بنى فرج | Al ‘Alāyā Banī Faraj | محافظة حجة | PPL | 80 | 7 | 107.19 | saada |
| al-qashabah | القشبة | Al Qashabah | محافظة حجة | PPL | 80 | 7 | 107.60 | saada |
| al-awlah | العولة | Al ‘Awlah | محافظة حجة | PPL | 80 | 9 | 108.60 | saada |
| majli | مجلى | Majlī | محافظة حجة | PPL | 80 | 7 | 84.41 | saada |
| kufan | كوفان | Kūfān | محافظة حجة | PPL | 80 | 1 | 87.00 | saada |
| al-hursha | الحرشا | Al Ḩurshā | محافظة حجة | PPL | 80 | 1 | 86.15 | saada |
| as-sariyah | الصارية | Aş Şārīyah | محافظة حجة | PPL | 80 | 13 | 86.20 | saada |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة حجة | PPL | 80 | 21 | 86.26 | saada |
| azzan | عزان | ‘Azzān | محافظة حجة | PPL | 80 | 5 | 87.03 | saada |
| al-harijah | الحرجة | Al Ḩarijah | محافظة حجة | PPL | 80 | 6 | 86.52 | saada |
| ash-shati | الشاطئ | Ash Shāţi’ | محافظة حجة | PPL | 80 | 3 | 86.96 | saada |
| al-musayniah | المصينعة | Al Muşayni‘ah | محافظة حجة | PPL | 80 | 1 | 87.09 | saada |
| mahmatah | محمطة | Maḩmaţah | محافظة حجة | PPL | 80 | 3 | 87.10 | saada |
| al-hasmah | الحصمة | Al Ḩaşmah | محافظة حجة | PPL | 80 | 5 | 86.50 | saada |
| ash-shujnah | الشجنة | Ash Shujnah | محافظة حجة | PPL | 80 | 3 | 86.71 | saada |
| al-majamam | المجعمم | Al Maja‘mam | محافظة حجة | PPL | 80 | 2 | 86.94 | saada |
| al-usrah | العصرة | Al ‘Uşrah | محافظة حجة | PPL | 80 | 4 | 87.34 | saada |
| al-jaribiyah | الجربية | Al Jaribīyah | محافظة حجة | PPL | 80 | 9 | 86.40 | saada |
| al-muqabil | المقابل | Al Muqābil | محافظة حجة | PPL | 80 | 7 | 85.62 | saada |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة حجة | PPL | 80 | 4 | 85.60 | saada |
| al-ariq | العرق | Al ‘Ariq | محافظة حجة | PPL | 80 | 3 | 86.24 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 8 | 86.04 | saada |
| bayt-al-qalah | بيت القلعة | Bayt al Qal‘ah | محافظة حجة | PPL | 80 | 16 | 85.81 | saada |
| al-qawfa | القوفع | Al Qawfa‘ | محافظة حجة | PPL | 80 | 5 | 85.11 | saada |
| al-jillah | الجلة | Al Jillah | محافظة حجة | PPL | 80 | 3 | 85.37 | saada |
| al-khalif | الخليف | Al Khalīf | محافظة حجة | PPL | 80 | 5 | 85.30 | saada |
| al-aqifa | العقفا | Al ‘Aqifā | محافظة حجة | PPL | 80 | 10 | 85.22 | saada |
| al-mashab | المشب | Al Mashab | محافظة حجة | PPL | 80 | 8 | 86.49 | saada |
| ad-damnah | الدمنة | Ad Damnah | محافظة حجة | PPL | 80 | 16 | 86.78 | saada |
| ghadhaf | غذاف | Ghadhāf | محافظة حجة | PPL | 80 | 19 | 87.89 | saada |
| al-hadabah | الحدبة | Al Ḩadabah | محافظة حجة | PPL | 80 | 10 | 85.80 | saada |
| qalat-al-batrah | قلعة البترة | Qal‘at al Batrah | محافظة حجة | PPL | 80 | 4 | 86.44 | saada |
| qalat-bashrah | قلعة بشرة | Qal‘at Bashrah | محافظة حجة | PPL | 80 | 2 | 86.75 | saada |
| mismam | مسمام | Mismām | محافظة حجة | PPL | 80 | 8 | 92.79 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 3 | 92.93 | saada |
| dimat-al-umaysi | ديمة العميصي | Dīmat al ‘Umayşī | محافظة حجة | PPL | 80 | 8 | 92.66 | saada |
| najd-al-jawwah | نجد الجوة | Najd al Jawwah | محافظة حجة | PPL | 80 | 9 | 84.32 | saada |
| maktaf | مكتاف | Maktāf | محافظة حجة | PPL | 80 | 22 | 84.82 | saada |
| gharib-at-tuwab | غارب التواب | Ghārib at Tuwāb | محافظة حجة | PPL | 80 | 6 | 84.60 | saada |
| shati-mahsan | شاطئ محسن | Shāţi’ Maḩsan | محافظة حجة | PPL | 80 | 6 | 83.59 | saada |
| ghawl-al-mada | غول المضى | Ghawl al Maḑá | محافظة حجة | PPL | 80 | 13 | 83.89 | saada |
| ar-rayaghah | الرايغة | Ar Rāyaghah | محافظة حجة | PPL | 80 | 31 | 83.59 | saada |
| duqan | ضقعان | Ḑuq‘ān | محافظة حجة | PPL | 80 | 1 | 83.63 | saada |
| al-majdal | المجدل | Al Majdal | محافظة حجة | PPL | 80 | 10 | 82.98 | saada |
| gharib-as-sada | غارب الصعداء | Ghārib aş Şa‘dā’ | محافظة حجة | PPL | 80 | 33 | 84.64 | saada |
| as-sila | السلع | As Sila‘ | محافظة حجة | PPL | 80 | 16 | 85.14 | saada |
| as-sulb | الصلب | Aş Şulb | محافظة حجة | PPL | 80 | 6 | 83.43 | saada |
| an-nahyal | النحيال | An Naḩyāl | محافظة حجة | PPL | 80 | 13 | 83.28 | saada |
| naqil-umar | نقيل عمر | Naqīl ‘Umar | محافظة حجة | PPL | 80 | 11 | 83.74 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة حجة | PPL | 80 | 17 | 84.03 | saada |
| al-hudaytin | الحديتين | Al Ḩudaytīn | محافظة حجة | PPL | 80 | 8 | 83.97 | saada |
| al-gharib | الغارب | Al Ghārib | محافظة حجة | PPL | 80 | 1 | 84.10 | saada |
| al-qimamah | القمامة | Al Qimāmah | محافظة حجة | PPL | 80 | 23 | 84.17 | saada |
| al-baqah | البقعة | Al Baq‘ah | محافظة حجة | PPL | 80 | 4 | 84.04 | saada |
| jubb-al-arish | جب العريش | Jubb al ‘Arīsh | محافظة حجة | PPL | 80 | 2 | 83.90 | saada |
| al-hanut | الحانوت | Al Ḩānūt | محافظة حجة | PPL | 80 | 8 | 84.28 | saada |
| al-mathbah | المثبة | Al Mathbah | محافظة حجة | PPL | 80 | 6 | 84.43 | saada |
| an-nasub | النصب | An Naşub | محافظة حجة | PPL | 80 | 9 | 84.33 | saada |
| dhira-al-qalah | ذراع القلعة | Dhirā‘ al Qal‘ah | محافظة حجة | PPL | 80 | 4 | 84.14 | saada |
| al-isabah | العصابة | Al ‘Işābah | محافظة حجة | PPL | 80 | 7 | 84.40 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة حجة | PPL | 80 | 3 | 84.46 | saada |
| al-hanshush | الحنشوش | Al Ḩanshūsh | محافظة حجة | PPL | 80 | 1 | 84.54 | saada |
| maghribat-as-silah | مغربة السلعة | Maghribat as Sil‘ah | محافظة حجة | PPL | 80 | 5 | 84.50 | saada |
| al-waqah | الوقعة | Al Waq‘ah | محافظة حجة | PPL | 80 | 4 | 93.09 | saada |
| al-miqabil | المقابل | Al Miqābil | محافظة حجة | PPL | 80 | 10 | 92.19 | saada |
| al-bawhah | البوحة | Al Bawḩah | محافظة حجة | PPL | 80 | 3 | 91.95 | saada |
| al-qila | القلاع | Al Qilā‘ | محافظة حجة | PPL | 80 | 1 | 91.68 | saada |
| hijrah | هجرة | Hijrah | محافظة حجة | PPL | 80 | 4 | 91.78 | saada |
| al-qazah | القزعة | Al Qaz‘ah | محافظة حجة | PPL | 80 | 9 | 91.97 | saada |
| al-faysh | الفيش | Al Faysh | محافظة حجة | PPL | 80 | 3 | 92.95 | saada |
| al-qatifah | القطفة | Al Qaţifah | محافظة حجة | PPL | 80 | 8 | 92.16 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة حجة | PPL | 80 | 8 | 92.38 | saada |
| al-qubayr | القبير | Al Qubayr | محافظة حجة | PPL | 80 | 5 | 92.66 | saada |
| al-hadabah | الحدبة | Al Ḩadabah | محافظة حجة | PPL | 80 | 9 | 92.85 | saada |
| gharib-durayn | غارب درين | Ghārib Durayn | محافظة حجة | PPL | 80 | 2 | 92.76 | saada |
| al-hilani | الهلاني | Al Hilānī | محافظة حجة | PPL | 80 | 4 | 92.50 | saada |
| shirqah | شرقة | Shirqah | محافظة حجة | PPL | 80 | 5 | 92.66 | saada |
| qila-al-magharib | قلاع المغارب | Qilā‘ al Maghārib | محافظة حجة | PPL | 80 | 1 | 92.83 | saada |
| awaq-al-harb | عوق الحرب | ‘Awaq al Ḩarb | محافظة حجة | PPL | 80 | 15 | 93.22 | saada |
| al-muqabil | المقابل | Al Muqābil | محافظة حجة | PPL | 80 | 27 | 91.86 | saada |
| awaq-mata | عوق متــى | ‘Awaq Matá | محافظة حجة | PPL | 80 | 14 | 92.27 | saada |
| ash-shutayn | الشطين | Ash Shuţayn | محافظة حجة | PPL | 80 | 31 | 93.12 | saada |
| an-naqil | النقيل | An Naqīl | محافظة حجة | PPL | 80 | 18 | 92.86 | saada |
| al-qayyam | القيم | Al Qayyam | محافظة حجة | PPL | 80 | 9 | 88.66 | saada |
| al-ariq | العرق | Al ‘Ariq | محافظة حجة | PPL | 80 | 6 | 89.08 | saada |
| awaq-ash-shar | عوق الشاعر | ‘Awaq ash Shā‘r | محافظة حجة | PPL | 80 | 28 | 89.06 | saada |
| kawlat-mijum | كولة مجوم | Kawlat Mijūm | محافظة حجة | PPL | 80 | 19 | 91.51 | saada |
| kawlat-jamah | كولة جمعة | Kawlat Jam‘ah | محافظة حجة | PPL | 80 | 9 | 91.31 | saada |
| sasaah | صعصعة | Şa‘şa‘ah | محافظة حجة | PPL | 80 | 7 | 91.42 | saada |
| al-umash | العماش | Al ‘Umāsh | محافظة حجة | PPL | 80 | 5 | 91.06 | saada |
| az-ziqaf-wa-al-ariqah | الزقاف و العرقة | Az Ziqāf wa al ‘Ariqah | محافظة حجة | PPL | 80 | 20 | 91.28 | saada |
| shati-al-jadab | شاطئ الجدب | Shāţi’ al Jadab | محافظة حجة | PPL | 80 | 8 | 89.67 | saada |
| ad-damnah-wa-adh-dhira | الدمنة و الذراع | Ad Damnah wa adh Dhirā‘ | محافظة حجة | PPL | 80 | 11 | 89.96 | saada |
| awaq-al-aqar | عوق العقار | ‘Awaq al ‘Aqār | محافظة حجة | PPL | 80 | 1 | 89.63 | saada |
| mata | متى | Matá | محافظة حجة | PPL | 80 | 4 | 91.59 | saada |
| al-manawwar | المنور | Al Manawwar | محافظة حجة | PPL | 80 | 13 | 90.72 | saada |
| awaq-jamil | عوق جميل | ‘Awaq Jamīl | محافظة حجة | PPL | 80 | 2 | 91.82 | saada |
| ras-an-naqil | رأس النقيل | Ra’s an Naqīl | محافظة حجة | PPL | 80 | 3 | 91.08 | saada |
| kawlat-al-marwa | كولة المرو | Kawlat al Marwa | محافظة حجة | PPL | 80 | 11 | 91.08 | saada |
| kawlat-as-siyad | كولة الصياد | Kawlat aş Şiyād | محافظة حجة | PPL | 80 | 17 | 91.36 | saada |
| al-majbar | المجبر | Al Majbar | محافظة حجة | PPL | 80 | 6 | 91.42 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 12 | 91.15 | saada |
| al-qa | القاع | Al Qā‘ | محافظة حجة | PPL | 80 | 10 | 92.10 | saada |
| hawd-al-qawaid | حود القواعد | Ḩawd al Qawā‘id | محافظة حجة | PPL | 80 | 8 | 92.15 | saada |
| al-jaww | الجو | Al Jaww | محافظة حجة | PPL | 80 | 3 | 91.72 | saada |
| al-awarid | العوارض | Al ‘Awāriḑ | محافظة حجة | PPL | 80 | 31 | 91.81 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة حجة | PPL | 80 | 41 | 92.31 | saada |
| al-mahruj | المحروج | Al Maḩrūj | محافظة حجة | PPL | 80 | 10 | 93.45 | saada |
| al-mazabah | المعزبة | Al Ma‘zabah | محافظة حجة | PPL | 80 | 20 | 90.36 | saada |
| al-mawjar | الموجر | Al Mawjar | محافظة حجة | PPL | 80 | 26 | 90.20 | saada |
| al-qaryah-ash-shamiyah | القرية الشامية | Al Qaryah ash Shāmīyah | محافظة حجة | PPL | 80 | 7 | 90.08 | saada |
| al-baynun | البينون | Al Baynūn | محافظة حجة | PPL | 80 | 3 | 90.53 | saada |
| darb-al-arish | درب العريش | Darb al ‘Arīsh | محافظة حجة | PPL | 80 | 11 | 90.17 | saada |
| al-andija | العندجاء | Al ‘Andijā’ | محافظة حجة | PPL | 80 | 9 | 89.95 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 12 | 89.81 | saada |
| ash-shiharah | الشحارة | Ash Shiḩārah | محافظة حجة | PPL | 80 | 13 | 89.74 | saada |
| bayt-az-zawm | بيت الزوم | Bayt az Zawm | محافظة حجة | PPL | 80 | 12 | 89.61 | saada |
| baydan | بيضان | Bayḑān | محافظة حجة | PPL | 80 | 8 | 89.48 | saada |
| damnam | دمنام | Damnām | محافظة حجة | PPL | 80 | 7 | 89.38 | saada |
| al-masuq | المسوق | Al Masūq | محافظة حجة | PPL | 80 | 2 | 90.24 | saada |
| at-tarf | الطرف | Aţ Ţarf | محافظة حجة | PPL | 80 | 1 | 90.16 | saada |
| al-hanakah | الحنكـة | Al Ḩanakah | محافظة حجة | PPL | 80 | 1 | 89.61 | saada |
| al-fatihah | الفتحــة | Al Fatiḩah | محافظة حجة | PPL | 80 | 1 | 90.44 | saada |
| al-mirbayh | المربيح | Al Mirbayḩ | محافظة حجة | PPL | 80 | 1 | 89.97 | saada |
| gharib-shuwi | غارب شويـع | Ghārib Shuwī‘ | محافظة حجة | PPL | 80 | 1 | 89.23 | saada |
| dhira-al-jayd | ذراع الجيد | Dhirā‘ al Jayd | محافظة حجة | PPL | 80 | 4 | 88.56 | saada |
| ariq-ad-dali | عرق الضالع | ‘Ariq aḑ Ḑāli‘ | محافظة حجة | PPL | 80 | 6 | 88.40 | saada |
| gharib-jafar | غارب جعفر | Ghārib Ja‘far | محافظة حجة | PPL | 80 | 4 | 87.13 | saada |
| ash-sharqi | الشرقي | Ash Sharqī | محافظة حجة | PPL | 80 | 10 | 88.40 | saada |
| al-qayyim | القيم | Al Qayyim | محافظة حجة | PPL | 80 | 6 | 87.46 | saada |
| al-bawash | النواش | Al Bawāsh | محافظة حجة | PPL | 80 | 4 | 87.78 | saada |
| al-midhrub | المذروب | Al Midhrūb | محافظة حجة | PPL | 80 | 6 | 87.93 | saada |
| al-qalah | القلعة | Al Qal‘ah | محافظة حجة | PPL | 80 | 17 | 87.64 | saada |
| al-ghawarib | الغوارب | Al Ghawārib | محافظة حجة | PPL | 80 | 16 | 88.06 | saada |
| al-muqta | المقطع | Al Muqţa‘ | محافظة حجة | PPL | 80 | 10 | 87.75 | saada |
| amizat-hulays | عمزة حليس | ‘Amizat Ḩulays | محافظة حجة | PPL | 80 | 10 | 86.50 | saada |
| ghayl-al-haqqah | غيل الحقة | Ghayl al Ḩaqqah | محافظة حجة | PPL | 80 | 13 | 85.89 | saada |
| al-maghlul | المغلول | Al Maghlūl | محافظة حجة | PPL | 80 | 5 | 92.43 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة حجة | PPL | 80 | 3 | 92.55 | saada |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 1 | 92.73 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة حجة | PPL | 80 | 1 | 92.84 | saada |
| imqurah | إمقرعة | Imqur‘ah | محافظة حجة | PPL | 80 | 17 | 92.07 | saada |
| al-mahjarah | المحجرة | Al Maḩjarah | محافظة حجة | PPL | 80 | 4 | 92.62 | saada |
| qayyim-al-limasi | قيم اللماصي | Qayyim al Limāşī | محافظة حجة | PPL | 80 | 50 | 92.19 | saada |
| kawlat-said | كولة سعيد | Kawlat Sa‘īd | محافظة حجة | PPL | 80 | 7 | 91.98 | saada |
| bayt-al-qasibi | بيت القصبي | Bayt al Qaşibī | محافظة حجة | PPL | 80 | 2 | 91.75 | saada |
| as-siwayagh | الصوايغ | Aş Şiwāyagh | محافظة حجة | PPL | 80 | 2 | 91.28 | saada |
| al-mamarah | المعمرة | Al Ma‘marah | محافظة حجة | PPL | 80 | 2 | 92.66 | saada |
| umhilabiyah | أمحلابية | Umḩilābīyah | محافظة حجة | PPL | 80 | 16 | 90.85 | saada |
| imshami | إمشامي | Imshāmī | محافظة حجة | PPL | 80 | 2 | 92.34 | saada |
| arijan-hasan | عرجان حسن | ‘Arijān Ḩasan | محافظة حجة | PPL | 80 | 2 | 91.62 | saada |
| shati-matri | شاطئ مطري | Shāţi’ Maţrī | محافظة حجة | PPL | 80 | 2 | 91.82 | saada |
| al-majzan | المجزآن | Al Majz’ān | محافظة حجة | PPL | 80 | 2 | 91.74 | saada |
| dimat-shawiiyah | ديمة شوعية | Dīmat Shawi‘īyah | محافظة حجة | PPL | 80 | 2 | 92.10 | saada |
| kawlat-al-mayzab | كولة الميزاب | Kawlat al Mayzāb | محافظة حجة | PPL | 80 | 2 | 91.84 | saada |
| al-qayyim | القيـم | Al Qayyim | محافظة حجة | PPL | 80 | 2 | 92.95 | saada |
| hadiyat-as-salimah | حدية السلمة | Ḩadīyat as Salimah | محافظة حجة | PPL | 80 | 15 | 91.47 | saada |
| al-manibah | المعنبة | Al Ma‘nibah | محافظة حجة | PPL | 80 | 4 | 92.20 | saada |
| al-gharar | الغـرر | Al Gharar | محافظة حجة | PPL | 80 | 7 | 91.92 | saada |
| al-maha | الماهى | Al Māhá | محافظة حجة | PPL | 80 | 15 | 93.42 | saada |
| al-fariqah | الفرفة | Al Fariqah | محافظة حجة | PPL | 80 | 5 | 92.51 | saada |
| judayshah | جدبيبة | Judayshah | محافظة حجة | PPL | 80 | 9 | 86.75 | saada |
| dhira-al-qamaliyah | ذراع القملية | Dhirā‘ al Qamalīyah | محافظة حجة | PPL | 80 | 2 | 87.45 | saada |
| awaq-al-alamah | عوق العلامة | ‘Awaq al ‘Alāmah | محافظة حجة | PPL | 80 | 3 | 87.80 | saada |
| kawlat-al-jammah | كولة الجمة | Kawlat al Jammah | محافظة حجة | PPL | 80 | 4 | 88.16 | saada |
| awaq-az-zahib | عوق الزهـب | ‘Awaq az Zahib | محافظة حجة | PPL | 80 | 5 | 91.06 | saada |
| gharib-al-matin | غارب المعطـن | Ghārib al Ma‘ţin | محافظة حجة | PPL | 80 | 8 | 90.76 | saada |
| as-sawalib | الصوالب | Aş Şawālib | محافظة حجة | PPL | 80 | 11 | 90.29 | saada |
| as-saba | السباع | As Sabā‘ | محافظة حجة | PPL | 80 | 10 | 90.20 | saada |
| dhira-as-sarir | ذراع الصرير | Dhirā‘ aş Şarīr | محافظة حجة | PPL | 80 | 7 | 90.03 | saada |
| ad-dahlah | الدحلـة | Ad Daḩlah | محافظة حجة | PPL | 80 | 10 | 90.24 | saada |
| awaq-ghaythah | عوق غيثـة | ‘Awaq Ghaythah | محافظة حجة | PPL | 80 | 3 | 90.07 | saada |
| as-sarifah | الصرفــة | Aş Şarifah | محافظة حجة | PPL | 80 | 5 | 90.24 | saada |
| dhira-al-ahmar | ذراع الأحمر | Dhirā‘ al Aḩmar | محافظة حجة | PPL | 80 | 5 | 89.65 | saada |
| ad-diwayriyah | الدويرية | Ad Diwayrīyah | محافظة حجة | PPL | 80 | 8 | 89.75 | saada |
| al-ahdaj | الأحدج | Al Aḩdaj | محافظة حجة | PPL | 80 | 5 | 89.11 | saada |
| majda | مجدع | Majda‘ | محافظة حجة | PPL | 80 | 2 | 89.64 | saada |
| aqim-al-wair | عقم الوعـر | ‘Aqim al Wa‘ir | محافظة حجة | PPL | 80 | 2 | 89.91 | saada |
| gharib-al-matrizi-al-fil | غارب المطرزي الفيل | Ghārib al Maţrizī al Fīl | محافظة حجة | PPL | 80 | 3 | 89.81 | saada |
| al-arish | العريش | Al ‘Arīsh | محافظة حجة | PPL | 80 | 6 | 89.72 | saada |
| al-mashhad | المشهد | Al Mashhad | محافظة حجة | PPL | 80 | 4 | 89.62 | saada |
| al-gharib | الغارب | Al Ghārib | محافظة حجة | PPL | 80 | 8 | 90.44 | saada |
| an-nayd-al-ala | النيد الأعلى | An Nayd al A‘lá | محافظة حجة | PPL | 80 | 10 | 88.81 | saada |
| an-nid-al-asfal | النيد الأسفل | An Nīd al Asfal | محافظة حجة | PPL | 80 | 22 | 88.99 | saada |
| maqimah | مقمة | Maqimah | محافظة حجة | PPL | 80 | 2 | 89.47 | saada |
| jurashah | جراشـة | Jurāshah | محافظة حجة | PPL | 80 | 4 | 88.76 | saada |
| al-jurfa | الجرفاء | Al Jurfā’ | محافظة حجة | PPL | 80 | 2 | 88.53 | saada |
| amishah | عميشة | ‘Amīshah | محافظة حجة | PPL | 80 | 2 | 88.45 | saada |
| al-wairah | الوعرة | Al Wa‘irah | محافظة حجة | PPL | 80 | 5 | 88.30 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة حجة | PPL | 80 | 3 | 88.86 | saada |
| al-qaidah | القاعدة | Al Qā’idah | محافظة حجة | PPL | 80 | 5 | 88.97 | saada |
| gharib-buhaydah | غارب بجيدة | Ghārib Buḩaydah | محافظة حجة | PPL | 80 | 25 | 89.13 | saada |
| al-jirayr | الجرير | Al Jirayr | محافظة حجة | PPL | 80 | 17 | 87.30 | saada |
| al-qayyim | القيــم | Al Qayyim | محافظة حجة | PPL | 80 | 4 | 87.03 | saada |
| al-gharib | الغارب | Al Ghārib | محافظة حجة | PPL | 80 | 29 | 87.11 | saada |
| dawrat-al-hajwah | دورة الحجوة | Dawrat al Ḩajwah | محافظة حجة | PPL | 80 | 5 | 95.27 | saada |
| al-majarin | المجارين | Al Majārīn | محافظة حجة | PPL | 80 | 2 | 95.45 | saada |
| maghribat-ar-rifai | مغربة الرفاعي | Maghribat ar Rifā‘ī | محافظة حجة | PPL | 80 | 3 | 95.64 | saada |
| hadibat-al-ma | حدبة الماء | Ḩadibat al Mā’ | محافظة حجة | PPL | 80 | 6 | 96.03 | saada |
| hadibat-ar-rakhimah | حدبة الرخمة | Ḩadibat ar Rakhimah | محافظة حجة | PPL | 80 | 5 | 96.15 | saada |
| ar-rawhah | الروحة | Ar Rawḩah | محافظة حجة | PPL | 80 | 8 | 93.97 | saada |
| al-qabilah | القابلة | Al Qābilah | محافظة حجة | PPL | 80 | 4 | 93.84 | saada |
| al-madayiah | المضايعة | Al Maḑāyi‘ah | محافظة حجة | PPL | 80 | 15 | 93.98 | saada |
| al-awas | العواص | Al ‘Awāş | محافظة حجة | PPL | 80 | 5 | 94.23 | saada |
| thabir | ثبر | Thabir | محافظة حجة | PPL | 80 | 4 | 95.84 | saada |
| al-kawal | الكوال | Al Kawāl | محافظة حجة | PPL | 80 | 11 | 95.46 | saada |
| al-mawalit | الموالط | Al Mawāliţ | محافظة حجة | PPL | 80 | 1 | 95.65 | saada |
| al-qiyash | القياش | Al Qiyāsh | محافظة حجة | PPL | 80 | 9 | 96.75 | saada |
| at-tawf | الطوف | Aţ Ţawf | محافظة حجة | PPL | 80 | 5 | 96.45 | saada |
| al-majlis | المجلس | Al Majlis | محافظة حجة | PPL | 80 | 12 | 96.32 | saada |
| az-zuraybah | الزريبة | Az Zuraybah | محافظة حجة | PPL | 80 | 9 | 96.06 | saada |
| al-masrahiyah | المسرحية | Al Masraḩīyah | محافظة حجة | PPL | 80 | 8 | 96.02 | saada |
| al-hiwasah | الحواصة | Al Ḩiwāşah | محافظة حجة | PPL | 80 | 7 | 96.19 | saada |
| ash-sharf | الشرف | Ash Sharf | محافظة حجة | PPL | 80 | 14 | 96.18 | saada |
| al-munqidah | المنقضـة | Al Munqiḑah | محافظة حجة | PPL | 80 | 5 | 96.30 | saada |
| al-mirash | المراشى | Al Mirāsh | محافظة حجة | PPL | 80 | 2 | 96.15 | saada |
| bani-jafar | بني جعفر | Banī Ja‘far | محافظة حجة | PPL | 80 | 14 | 95.97 | saada |
| ash-shujaah | الشجاعة | Ash Shujā‘ah | محافظة حجة | PPL | 80 | 9 | 95.84 | saada |
| al-jidaniyah | الجعدانية | Al Ji‘dānīyah | محافظة حجة | PPL | 80 | 6 | 95.65 | saada |
| al-birahi | البراهي | Al Birāhī | محافظة حجة | PPL | 80 | 7 | 95.80 | saada |
| ad-dasham | الدشم | Ad Dasham | محافظة حجة | PPL | 80 | 4 | 96.10 | saada |
| al-midarah | المدارة | Al Midārah | محافظة حجة | PPL | 80 | 9 | 95.88 | saada |
| bani-akush | بني عكوش | Banī ‘Akūsh | محافظة حجة | PPL | 80 | 3 | 95.77 | saada |
| al-midahi | المداهي | Al Midāhī | محافظة حجة | PPL | 80 | 2 | 95.90 | saada |
| al-marawi | المراوي | Al Marāwī | محافظة حجة | PPL | 80 | 9 | 95.39 | saada |
| al-bihashinah | البحاشنة | Al Biḩāshinah | محافظة حجة | PPL | 80 | 49 | 95.22 | saada |
| al-atimi | العتمي | Al ‘Atimī | محافظة حجة | PPL | 80 | 6 | 97.03 | saada |
| al-khiraib | الخرائب | Al Khirāi’b | محافظة حجة | PPL | 80 | 13 | 96.87 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 6 | 96.90 | saada |
| bayt-al-mahdi | بيت المهدي | Bayt al Mahdī | محافظة حجة | PPL | 80 | 10 | 96.91 | saada |
| bani-jadan | بني جعدان | Banī Ja‘dān | محافظة حجة | PPL | 80 | 1 | 96.62 | saada |
| ath-thawahir | الثواهر | Ath Thawāhir | محافظة حجة | PPL | 80 | 8 | 96.93 | saada |
| al-ghushaymiyah | الغشيمية | Al Ghushaymīyah | محافظة حجة | PPL | 80 | 9 | 97.49 | saada |
| at-tawf | الطوف | Aţ Ţawf | محافظة حجة | PPL | 80 | 15 | 97.58 | saada |
| ghirab-at-turays | غراب التريس | Ghirāb at Turays | محافظة حجة | PPL | 80 | 3 | 97.73 | saada |
| as-sahilah | السهلة | As Sahilah | محافظة حجة | PPL | 80 | 4 | 97.49 | saada |
| gharib-kadishah | غارب كدشة | Ghārib Kadishah | محافظة حجة | PPL | 80 | 3 | 93.00 | saada |
| al-qaryah-al-asfal | القرية الأسفل | Al Qaryah al Asfal | محافظة حجة | PPL | 80 | 8 | 95.38 | saada |
| al-falah | الفالة | Al Fālah | محافظة حجة | PPL | 80 | 18 | 95.53 | saada |
| al-khazin | الخزين | Al Khazīn | محافظة حجة | PPL | 80 | 34 | 95.42 | saada |
| kawlat-al-asad | كولة العصاد | Kawlat al ‘Aşād | محافظة حجة | PPL | 80 | 1 | 95.81 | saada |
| al-murbakh | المربخ | Al Murbakh | محافظة حجة | PPL | 80 | 1 | 96.04 | saada |
| al-khamilah | الخميلة | Al Khamīlah | محافظة حجة | PPL | 80 | 8 | 96.54 | saada |
| awdhan-as-asfal | عوذان الأسفل | ‘Awdhān as Asfal | محافظة حجة | PPL | 80 | 6 | 96.67 | saada |
| gharib-al-hamiliyah | غارب الحملي | Ghārib al Ḩamilīyah | محافظة حجة | PPL | 80 | 2 | 96.60 | saada |
| hawd-al-kulban | حود الكلبان | Ḩawd al Kulbān | محافظة حجة | PPL | 80 | 4 | 96.38 | saada |
| ad-dahlah | الدحلة | Ad Daḩlah | محافظة حجة | PPL | 80 | 15 | 96.19 | saada |
| al-qufayl | القفيل | Al Qufayl | محافظة حجة | PPL | 80 | 8 | 95.87 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 5 | 96.09 | saada |
| hadiyat-al-hass | حدية الحس | Ḩadīyat al Ḩass | محافظة حجة | PPL | 80 | 4 | 95.98 | saada |
| al-qazah | القزعة | Al Qaz‘ah | محافظة حجة | PPL | 80 | 1 | 95.78 | saada |
| al-maqfi | المقفي | Al Maqfī | محافظة حجة | PPL | 80 | 2 | 94.64 | saada |
| al-hadan | الحضن | Al Ḩaḑan | محافظة حجة | PPL | 80 | 3 | 94.55 | saada |
| razih | رازح | Rāziḩ | محافظة حجة | PPL | 80 | 5 | 94.56 | saada |
| gharib-ghurayj | غارب غريج | Ghārib Ghurayj | محافظة حجة | PPL | 80 | 2 | 94.47 | saada |
| jashimi-al-hayjah | جشمي الهيجة | Jashimī al Hayjah | محافظة حجة | PPL | 80 | 3 | 93.83 | saada |
| al-majd | المجد | Al Majd | محافظة حجة | PPL | 80 | 1 | 94.37 | saada |
| al-masnaah | المصنعــة | Al Maşna‘ah | محافظة حجة | PPL | 80 | 1 | 94.33 | saada |
| al-marati | المراتعي | Al Marāt‘ī | محافظة حجة | PPL | 80 | 2 | 94.18 | saada |
| bayt-al-marwah | بيت المروة | Bayt al Marwah | محافظة حجة | PPL | 80 | 5 | 94.41 | saada |
| az-zahirah | الظهرة | Az̧ Z̧ahirah | محافظة حجة | PPL | 80 | 11 | 94.97 | saada |
| ar-rajmah | الرجمــة | Ar Rajmah | محافظة حجة | PPL | 80 | 1 | 94.91 | saada |
| bayt-qati | بيت قطيع | Bayt Qaţī‘ | محافظة حجة | PPL | 80 | 11 | 95.61 | saada |
| al-qahirah | القاهرة | Al Qāhirah | محافظة حجة | PPL | 80 | 13 | 95.40 | saada |
| al-hudhra | الحذرا | Al Ḩudhrā | محافظة حجة | PPL | 80 | 6 | 95.60 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة حجة | PPL | 80 | 9 | 95.56 | saada |
| gharib-al-hajj | غارب الحاج | Ghārib al Ḩājj | محافظة حجة | PPL | 80 | 9 | 95.28 | saada |
| gharib-al-marashi | غارب المراشي | Ghārib al Marāshī | محافظة حجة | PPL | 80 | 8 | 95.19 | saada |
| bayt-zahir | بيت زاهر | Bayt Zāhir | محافظة حجة | PPL | 80 | 30 | 95.08 | saada |
| al-adari | العداري | Al ‘Adārī | محافظة حجة | PPL | 80 | 38 | 94.59 | saada |
| maysham | ميشام | Mayshām | محافظة حجة | PPL | 80 | 33 | 94.89 | saada |
| al-misayh | المسيح | Al Misayḩ | محافظة حجة | PPL | 80 | 17 | 95.03 | saada |
| al-milatah | الملاطة | Al Milāţah | محافظة حجة | PPL | 80 | 34 | 94.84 | saada |
| ar-radim | الردم | Ar Radim | محافظة حجة | PPL | 80 | 13 | 93.45 | saada |
| al-ghadir | الغدير | Al Ghadīr | محافظة حجة | PPL | 80 | 4 | 95.00 | saada |
| al-majwaz | المجواز | Al Majwāz | محافظة حجة | PPL | 80 | 1 | 94.96 | saada |
| dhira-al-qaidah | ذراع القاعدة | Dhirā‘ al Qā‘idah | محافظة حجة | PPL | 80 | 2 | 95.48 | saada |
| al-mashqab | المشقب | Al Mashqab | محافظة حجة | PPL | 80 | 10 | 94.75 | saada |
| dhira-al-hindi | ذراع الهندي | Dhirā‘ al Hindī | محافظة حجة | PPL | 80 | 27 | 95.54 | saada |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة حجة | PPL | 80 | 5 | 93.80 | saada |
| al-qufayl | القفيل | Al Qufayl | محافظة حجة | PPL | 80 | 6 | 93.86 | saada |
| al-hunaykah | الحنيكة | Al Ḩunaykah | محافظة حجة | PPL | 80 | 13 | 93.78 | saada |
| as-sabahiyah | الصباحية | Aş Şabāḩīyah | محافظة حجة | PPL | 80 | 3 | 96.08 | saada |
| al-hayjah | الهيجة | Al Hayjah | محافظة حجة | PPL | 80 | 1 | 96.88 | saada |
| mashab | مشعاب | Mash‘āb | محافظة حجة | PPL | 80 | 19 | 96.70 | saada |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 10 | 94.35 | saada |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة حجة | PPL | 80 | 3 | 94.79 | saada |
| al-qaymi | القيمي | Al Qaymī | محافظة حجة | PPL | 80 | 3 | 94.44 | saada |
| bahriyah | بحرية | Baḩrīyah | محافظة حجة | PPL | 80 | 3 | 95.51 | saada |
| al-hamam | الحمام | Al Ḩamām | محافظة حجة | PPL | 80 | 13 | 95.07 | saada |
| gharib-al-jisar | غارب الجسار | Ghārib al Jisār | محافظة حجة | PPL | 80 | 7 | 94.05 | saada |
| bayt-ash-shair | بيت الشاعر | Bayt ash Shā‘ir | محافظة حجة | PPL | 80 | 12 | 93.93 | saada |
| ash-shujaynah | الشجينة | Ash Shujaynah | محافظة حجة | PPL | 80 | 7 | 94.49 | saada |
| ath-thahrah | الثهرة | Ath Thahrah | محافظة حجة | PPL | 80 | 23 | 94.22 | saada |
| al-mashid | المسحيد | Al Masḩīd | محافظة حجة | PPL | 80 | 17 | 94.19 | saada |
| al-hayjah | الهيجـة | Al Hayjah | محافظة حجة | PPL | 80 | 1 | 93.23 | saada |
| bayt-al-mirab | بيت الميراب | Bayt al Mīrāb | محافظة حجة | PPL | 80 | 3 | 93.21 | saada |
| ash-shari | الشارع | Ash Shāri‘ | محافظة حجة | PPL | 80 | 3 | 93.59 | saada |
| amhidad | أمحداد | Amḩidād | محافظة حجة | PPL | 80 | 5 | 93.40 | saada |
| gharib-zahir | غارب زاهر | Ghārib Zāhir | محافظة حجة | PPL | 80 | 2 | 93.41 | saada |
| al-lafij | اللفج | Al Lafij | محافظة حجة | PPL | 80 | 3 | 93.38 | saada |
| maslah | مصلـة | Maşlah | محافظة حجة | PPL | 80 | 2 | 93.51 | saada |
| as-saqah | الساقة | As Sāqah | محافظة حجة | PPL | 80 | 3 | 97.07 | saada |
| al-madafinah | المدافنة | Al Madāfinah | محافظة حجة | PPL | 80 | 4 | 95.11 | saada |
| al-qiyasah | القياسة | Al Qiyāsah | محافظة حجة | PPL | 80 | 10 | 95.95 | saada |
| dhi-an-naqim | ذي النقم | Dhī an Naqim | محافظة حجة | PPL | 80 | 2 | 95.88 | saada |
| al-qati | القطع | Al Qaţi‘ | محافظة حجة | PPL | 80 | 23 | 95.63 | saada |
| damra | ضمراء | Ḑamrā’ | محافظة حجة | PPL | 80 | 5 | 95.31 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة حجة | PPL | 80 | 2 | 95.80 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة حجة | PPL | 80 | 13 | 95.34 | saada |
| ash-shatin | الشطين | Ash Shaţīn | محافظة حجة | PPL | 80 | 9 | 95.33 | saada |
| as-saqah | الساقة | As Sāqah | محافظة حجة | PPL | 80 | 4 | 96.66 | saada |
| ash-shabkah | الشبكـة | Ash Shabkah | محافظة حجة | PPL | 80 | 3 | 100.70 | saada |
| bani-amir | بني عميــر | Banī ‘Amīr | محافظة حجة | PPL | 80 | 27 | 101.17 | saada |
| al-majnabah | المجنبــة | Al Majnabah | محافظة حجة | PPL | 80 | 50 | 100.97 | saada |
| bayt-al-hajj | بيت الحاج | Bayt al Ḩājj | محافظة حجة | PPL | 80 | 19 | 100.91 | saada |
| al-qahar | القحـر | Al Qaḩar | محافظة حجة | PPL | 80 | 4 | 99.80 | saada |
| al-hajirah | الحجرة | Al Ḩajirah | محافظة حجة | PPL | 80 | 10 | 98.55 | saada |
| al-hadibah | الحدبة | Al Ḩadibah | محافظة حجة | PPL | 80 | 5 | 98.93 | saada |
| al-mikhalif | المخالف | Al Mikhālif | محافظة حجة | PPL | 80 | 8 | 98.75 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة حجة | PPL | 80 | 18 | 98.81 | saada |
| dhi-sila | ذي سلع | Dhī Sila‘ | محافظة حجة | PPL | 80 | 3 | 99.12 | saada |
| maghribat-al-hajifah | مغربة الحجفة | Maghribat al Ḩajifah | محافظة حجة | PPL | 80 | 2 | 99.52 | saada |
| hulqah-al-ulya | حلقة العليا | Ḩulqah al ‘Ulyā | محافظة حجة | PPL | 80 | 5 | 99.23 | saada |
| al-aridah | العارضة | Al ‘Āriḑah | محافظة حجة | PPL | 80 | 6 | 99.46 | saada |
| dhira-as-sadif | ذراع الصديف | Dhirā‘ aş Şadīf | محافظة حجة | PPL | 80 | 9 | 99.50 | saada |
| as-sirah | الصيرة | Aş Şīrah | محافظة حجة | PPL | 80 | 3 | 99.50 | saada |
| al-maflaq | المفلق | Al Maflaq | محافظة حجة | PPL | 80 | 3 | 99.42 | saada |
| al-hisar | الحصار | Al Ḩişār | محافظة حجة | PPL | 80 | 2 | 99.41 | saada |
| al-jahifah | الجحفة | Al Jaḩifah | محافظة حجة | PPL | 80 | 3 | 99.68 | saada |
| awaq-ash-shala | عوق الشلاء | ‘Awaq ash Shalā’ | محافظة حجة | PPL | 80 | 3 | 99.28 | saada |
| matlah | مطلة | Maţlah | محافظة حجة | PPL | 80 | 3 | 99.51 | saada |
| gharib-sukran | غارب سكران | Ghārib Sukrān | محافظة حجة | PPL | 80 | 7 | 99.84 | saada |
| hadibat-sabiyah | حدبة صبية | Ḩadibat Şabīyah | محافظة حجة | PPL | 80 | 5 | 100.00 | saada |
| hadibat-al-farbi | حدبة الفربي | Ḩadibat al Farbī | محافظة حجة | PPL | 80 | 5 | 99.34 | saada |
| kawlat-al-atif | كولة العاطف | Kawlat al ‘Āţif | محافظة حجة | PPL | 80 | 6 | 99.50 | saada |
| gharib-az-zawti | غارب الزوطي | Ghārib az Zawţī | محافظة حجة | PPL | 80 | 5 | 96.88 | saada |
| shati-an-nashimah | شاطئ النشمة | Shāţi’ an Nashimah | محافظة حجة | PPL | 80 | 4 | 97.05 | saada |
| dhira-ad-daqiq | ذراع الدقيق | Dhirā‘ ad Daqīq | محافظة حجة | PPL | 80 | 4 | 98.18 | saada |
| gharib-al-marwa | غارب المرو | Ghārib al Marwa | محافظة حجة | PPL | 80 | 1 | 98.32 | saada |
| hufayla-ulkam | حفيلا علكم | Ḩufaylā ‘Ulkam | محافظة حجة | PPL | 80 | 6 | 98.61 | saada |
| al-qatib | القتب | Al Qatib | محافظة حجة | PPL | 80 | 3 | 98.57 | saada |
| dar-as-salib | دار السلب | Dar as Salib | محافظة حجة | PPL | 80 | 3 | 98.27 | saada |
| dhira-dakhis | ذراع دخس | Dhirā‘ Dakhis | محافظة حجة | PPL | 80 | 19 | 98.71 | saada |
| damad | دمـض | Damaḑ | محافظة حجة | PPL | 80 | 5 | 99.59 | saada |
| al-khursh | الخرش | Al Khursh | محافظة حجة | PPL | 80 | 5 | 97.53 | saada |
| ash-shuayb | الشعيب | Ash Shu‘ayb | محافظة حجة | PPL | 80 | 5 | 97.41 | saada |
| al-maali | المعالي | Al Ma‘ālī | محافظة حجة | PPL | 80 | 4 | 97.88 | saada |
| ad-dammin | الدمن | Ad Dammin | محافظة حجة | PPL | 80 | 3 | 98.10 | saada |
| ash-shuaib | الشعائب | Ash Shu‘āi’b | محافظة حجة | PPL | 80 | 8 | 98.09 | saada |
| ar-rahan | الرهن | Ar Rahan | محافظة حجة | PPL | 80 | 7 | 98.33 | saada |
| al-khuzanah | الخزانة | Al Khuzānah | محافظة حجة | PPL | 80 | 5 | 98.22 | saada |
| aqam-al-ghirab | عقم الغراب | ‘Aqam al Ghirāb | محافظة حجة | PPL | 80 | 3 | 98.41 | saada |
| al-hadibah | الحدبة | Al Ḩadibah | محافظة حجة | PPL | 80 | 3 | 98.51 | saada |
| bani-shamilah | بني شميلة | Banī Shamīlah | محافظة حجة | PPL | 80 | 5 | 99.30 | saada |
| as-siyab | الصياب | Aş Şiyāb | محافظة حجة | PPL | 80 | 4 | 99.24 | saada |
| al-ghamirah | الغميرة | Al Ghamīrah | محافظة حجة | PPL | 80 | 4 | 99.12 | saada |
| al-maslihah | المصلحة | Al Maşliḩah | محافظة حجة | PPL | 80 | 4 | 99.72 | saada |
| al-qayyim | القيـم | Al Qayyim | محافظة حجة | PPL | 80 | 37 | 98.37 | saada |
| al-musin | المسن | Al Musin | محافظة حجة | PPL | 80 | 2 | 100.05 | saada |
| al-ghurzah | الغرزة | Al Ghurzah | محافظة حجة | PPL | 80 | 4 | 99.91 | saada |
| al-mudbab | المضباب | Al Muḑbāb | محافظة حجة | PPL | 80 | 6 | 98.71 | saada |
| al-qariyin | القرين | Al Qariyīn | محافظة حجة | PPL | 80 | 31 | 101.43 | saada |
| al-mahdadah-as-sufla | المحدادة السفلى | Al Maḩdādah as Suflá | محافظة حجة | PPL | 80 | 9 | 104.48 | saada |
| al-qasbah | القصبة | Al Qaşbah | محافظة حجة | PPL | 80 | 5 | 104.09 | saada |
| al-qasbah | القصبة | Al Qaşbah | محافظة حجة | PPL | 80 | 19 | 102.89 | saada |
| al-jaraib | الجرائب | Al Jarāi’b | محافظة حجة | PPL | 80 | 2 | 106.50 | saada |
| al-jurb | الجرب | Al Jurb | محافظة حجة | PPL | 80 | 5 | 86.06 | saada |
| awaq-ad-darah | عوق الدارة | ‘Awaq ad Dārah | محافظة حجة | PPL | 80 | 1 | 89.80 | saada |
| awaq-ad-darah | عوق الدارة | ‘Awaq ad Dārah | محافظة حجة | PPL | 80 | 1 | 90.44 | saada |
| al-majrab | المجرب | Al Majrab | محافظة حجة | PPL | 80 | 2 | 95.66 | saada |
| gharib-quaysh | غارب قعيش | Ghārib Qu‘aysh | محافظة حجة | PPL | 80 | 6 | 101.06 | saada |
| al-mawjar | الموخر | Al Mawjar | محافظة حجة | PPL | 80 | 11 | 101.16 | saada |
| bani-lubays | بني لبيص | Banī Lubayş | محافظة حجة | PPL | 80 | 4 | 101.31 | saada |
| bayt-ash-shami | بيت الشامـي | Bayt ash Shāmī | محافظة حجة | PPL | 80 | 2 | 101.18 | saada |
| ash-shajah | الشجعة | Ash Shaj‘ah | محافظة حجة | PPL | 80 | 9 | 101.42 | saada |
| al-jubhah | الجبهــة | Al Jubhah | محافظة حجة | PPL | 80 | 3 | 101.67 | saada |
| hashid | حاشـد | Ḩāshid | محافظة حجة | PPL | 80 | 8 | 101.28 | saada |
| as-sabihah | الصبيحة | Aş Şabīḩah | محافظة حجة | PPL | 80 | 3 | 102.40 | saada |
| dhira-sawbi | ذراع صوبي | Dhirā‘ Şawbī | محافظة حجة | PPL | 80 | 12 | 100.63 | saada |
| gharib-al-bayda | غارب البيضاء | Ghārib al Bayḑā’ | محافظة حجة | PPL | 80 | 1 | 99.26 | saada |
| ar-rawha | الروحاء | Ar Rawḩā’ | محافظة حجة | PPL | 80 | 2 | 99.65 | saada |
| qadim | قادم | Qādim | محافظة حجة | PPL | 80 | 3 | 99.52 | saada |
| qawan | قعوان | Qa‘wān | محافظة حجة | PPL | 80 | 4 | 104.08 | saada |
| khirab-al-jidari | خراب الجداري | Khirāb al Jidārī | محافظة حجة | PPL | 80 | 43 | 104.07 | saada |
| ar-rajmah | الرجمـة | Ar Rajmah | محافظة حجة | PPL | 80 | 2 | 103.88 | saada |
| rashid | راشـد | Rāshid | محافظة حجة | PPL | 80 | 5 | 104.19 | saada |
| al-mihras | المحرس | Al Miḩras | محافظة حجة | PPL | 80 | 16 | 99.65 | saada |
| bayt-al-qatri | بيت القطري | Bayt al Qaţrī | محافظة حجة | PPL | 80 | 3 | 99.41 | saada |
| bayt-jahnam | بيت جهنم | Bayt Jahnam | محافظة حجة | PPL | 80 | 20 | 98.68 | saada |
| al-lawiyah | اللاوية | Al Lāwīyah | محافظة حجة | PPL | 80 | 3 | 101.18 | saada |
| al-khudra | الخدراء | Al Khudrā’ | محافظة حجة | PPL | 80 | 3 | 101.36 | saada |
| al-wahanin | الوهانين | Al Wahānīn | محافظة حجة | PPL | 80 | 1 | 101.15 | saada |
| al-midhab | المذاب | Al Midhāb | محافظة حجة | PPL | 80 | 4 | 100.22 | saada |
| as-sidarah | الصدارة | Aş Şidārah | محافظة حجة | PPL | 80 | 4 | 100.38 | saada |
| ad-diyam | الديام | Ad Diyām | محافظة حجة | PPL | 80 | 2 | 100.81 | saada |
| al-ashah | العاشة | Al ‘Āshah | محافظة حجة | PPL | 80 | 5 | 100.84 | saada |
| al-arish | العريش | Al ‘Arīsh | محافظة حجة | PPL | 80 | 17 | 100.89 | saada |
| al-madha | المضحى | Al Maḑḩá | محافظة حجة | PPL | 80 | 4 | 101.50 | saada |
| qasabat-al-gharib | قصبة الغارب | Qaşabat al Ghārib | محافظة حجة | PPL | 80 | 4 | 100.83 | saada |
| ad-damnah | الدمنة | Ad Damnah | محافظة حجة | PPL | 80 | 6 | 101.20 | saada |
| al-qari | القريع | Al Qarī‘ | محافظة حجة | PPL | 80 | 5 | 100.53 | saada |
| an-nushmah | النشمة | An Nushmah | محافظة حجة | PPL | 80 | 4 | 100.02 | saada |
| as-sari | السريع | As Sarī‘ | محافظة حجة | PPL | 80 | 3 | 99.70 | saada |
| al-maqiq | المقيق | Al Maqīq | محافظة حجة | PPL | 80 | 8 | 99.13 | saada |
| al-mahma | المحماء | Al Maḩmā’ | محافظة حجة | PPL | 80 | 6 | 99.63 | saada |
| jumanah | جمانة | Jumānah | محافظة حجة | PPL | 80 | 10 | 100.61 | saada |
| abu-dijla | أبو دجلا | Abū Dijlā | محافظة حجة | PPL | 80 | 1 | 101.77 | saada |
| fatis | فطيس | Faţīs | محافظة حجة | PPL | 80 | 2 | 98.74 | saada |
| al-mawkir | الموكر | Al Mawkir | محافظة حجة | PPL | 80 | 1 | 99.19 | saada |
| al-ghumrah | الغمرة | Al Ghumrah | محافظة حجة | PPL | 80 | 1 | 99.53 | saada |
| azzan | عزان | ‘Azzān | محافظة حجة | PPL | 80 | 9 | 99.86 | saada |
| al-mujbar | المجبار | Al Mujbār | محافظة حجة | PPL | 80 | 2 | 99.94 | saada |
| bayt-al-marhi | بيت المرحي | Bayt al Marḩī | محافظة حجة | PPL | 80 | 3 | 98.27 | saada |
| darat-al-ashqaq | دارة الأشقاق | Dārat al Ashqāq | محافظة حجة | PPL | 80 | 12 | 97.81 | saada |
| bayt-dhibayal | بيت ذبايل | Bayt Dhibāyal | محافظة حجة | PPL | 80 | 3 | 98.54 | saada |
| bani-al-qurayta | بني القريطى | Banī al Qurayţá | محافظة حجة | PPL | 80 | 5 | 98.76 | saada |
| bani-sinan | بني سنان | Banī Sinān | محافظة حجة | PPL | 80 | 1 | 98.94 | saada |
| gharib-al-hamalah | غارب الحمالة | Ghārib al Ḩamālah | محافظة حجة | PPL | 80 | 3 | 98.58 | saada |
| al-mashab | المشب | Al Mashab | محافظة حجة | PPL | 80 | 7 | 98.87 | saada |
| al-hawlah | الحولة | Al Ḩawlah | محافظة حجة | PPL | 80 | 6 | 104.19 | saada |
| al-bayt-al-ala | البيت الأعلى | Al Bayt al A‘lá | محافظة حجة | PPL | 80 | 1 | 101.96 | saada |
| al-yamani | اليمانى | Al Yamānī | محافظة حجة | PPL | 80 | 1 | 103.58 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة حجة | PPL | 80 | 1 | 104.12 | saada |
| al-mirjam | المرخام | Al Mirjām | محافظة حجة | PPL | 80 | 1 | 105.14 | sanaa |
| al-maghribah | المغربة | Al Maghribah | محافظة حجة | PPL | 80 | 1 | 104.11 | sanaa |
| bayt-ar-rahwi | بيت الرحوي | Bayt ar Raḩwī | محافظة حجة | PPL | 80 | 2 | 103.98 | sanaa |
| as-suq-al-qadim | السوق القديم | As Sūq al Qadīm | محافظة حجة | PPL | 80 | 1 | 104.66 | sanaa |
| gharib-al-midam | غارب المدام | Ghārib al Midām | محافظة حجة | PPL | 80 | 1 | 106.15 | saada |
| bani-awas | بني عواض | Banī ‘Awāş | محافظة حجة | PPL | 80 | 1 | 107.02 | saada |
| mawqar-said | موقر سعيد | Mawqar Sa‘īd | محافظة حجة | PPL | 80 | 1 | 105.12 | sanaa |
| adhabah | عذبة | ‘Adhabah | محافظة حجة | PPL | 80 | 1 | 103.28 | saada |
| al-malitah | الملطة | Al Maliţah | محافظة حجة | PPL | 80 | 2 | 103.59 | saada |
| al-mufaliq | المفاليق | Al Mufālīq | محافظة حجة | PPL | 80 | 3 | 103.55 | saada |
| al-mafraq | المفرق | Al Mafraq | محافظة حجة | PPL | 80 | 3 | 103.31 | saada |
| an-naqitiyah | الناقطية | An Nāqiţīyah | محافظة حجة | PPL | 80 | 3 | 103.67 | saada |
| al-barih | البرح | Al Bariḩ | محافظة حجة | PPL | 80 | 11 | 103.25 | saada |
| al-mahraq | المحراق | Al Maḩrāq | محافظة حجة | PPL | 80 | 7 | 102.79 | saada |
| ar-raqqah | الرقة | Ar Raqqah | محافظة حجة | PPL | 80 | 4 | 101.74 | saada |
| ash-shajnah | الشجنة | Ash Shajnah | محافظة حجة | PPL | 80 | 3 | 103.02 | saada |
| al-masiqa | المسقى | Al Masiqá | محافظة حجة | PPL | 80 | 5 | 103.50 | saada |
| bani-shariyah | بني شرية | Banī Sharīyah | محافظة حجة | PPL | 80 | 7 | 102.54 | saada |
| dhira-muthaybir | ذراع مثيبر | Dhirā‘ Muthaybir | محافظة حجة | PPL | 80 | 3 | 102.66 | saada |
| kawlat-al-mahrab | كولة المحران | Kawlat al Maḩrāb | محافظة حجة | PPL | 80 | 10 | 102.47 | saada |
| maghribat-al-qatah | مغربة القطعة | Maghribat al Qaţ‘ah | محافظة حجة | PPL | 80 | 6 | 102.39 | saada |
| bayt-al-mugharib | بيت المغارب | Bayt al Mughārib | محافظة حجة | PPL | 80 | 6 | 102.76 | saada |
| ash-shamiyah | الشامية | Ash Shāmīyah | محافظة حجة | PPL | 80 | 1 | 102.45 | saada |
| shamsan | شمسان | Shamsān | محافظة حجة | PPL | 80 | 12 | 102.37 | saada |
| ash-shajnah | الشجنة | Ash Shajnah | محافظة حجة | PPL | 80 | 1 | 102.32 | saada |
| darb-jaman | درب جمعان | Darb Jam‘ān | محافظة حجة | PPL | 80 | 5 | 103.35 | saada |
| shati-al-ahwas | شاطى الأحوص | Shāţi’ al Aḩwaş | محافظة حجة | PPL | 80 | 3 | 103.00 | saada |
| bani-al-fawqin | بني الفوفين | Banī al Fawqīn | محافظة حجة | PPL | 80 | 4 | 102.00 | saada |
| at-tala | الطلاء | Aţ Ţalā’ | محافظة حجة | PPL | 80 | 5 | 102.11 | saada |
| al-majrab | المجرب | Al Majrab | محافظة حجة | PPL | 80 | 22 | 103.11 | saada |
| qasabat-al-aqil | قصبة العقيل | Qaşabat al ‘Aqīl | محافظة حجة | PPL | 80 | 2 | 103.04 | saada |
| al-lasiyah | اللصيــة | Al Laşīyah | محافظة حجة | PPL | 80 | 1 | 103.81 | saada |
| al-aqsam | الأقسام | Al Aqsām | محافظة حجة | PPL | 80 | 4 | 104.36 | saada |
| kawlat-an-nawb-dawba | كولة النوب دوبع | Kawlat an Nawb Dawba‘ | محافظة حجة | PPL | 80 | 16 | 102.30 | saada |
| al-kabiyah-ash-sharqiyah | الكعبية الشرقية | Al Ka‘bīyah ash Sharqīyah | محافظة حجة | PPL | 80 | 84 | 104.99 | saada |
| sawalib-ash-shami | صوالب الشامي | Şawālib ash Shāmī | محافظة حجة | PPL | 80 | 11 | 104.75 | saada |
| kawlat-shihab | كولة شهاب | Kawlat Shihāb | محافظة حجة | PPL | 80 | 26 | 104.41 | saada |
| al-ghawarib | الغوارب | Al Ghawārib | محافظة حجة | PPL | 80 | 10 | 104.39 | saada |
| al-aswari | العصواري | Al ‘Aşwārī | محافظة حجة | PPL | 80 | 18 | 105.44 | saada |
| al-kabiyah-al-gharbiyah | الكعبية الغربية | Al Ka‘bīyah al Gharbīyah | محافظة حجة | PPL | 80 | 73 | 104.92 | saada |
| al-alakim | العلاكم | Al ‘Alākim | محافظة حجة | PPL | 80 | 14 | 105.13 | saada |
| kawlat-an-nawsani | كولة النوساني | Kawlat an Nawsānī | محافظة حجة | PPL | 80 | 17 | 104.78 | saada |
| lujj-sulayman | لج سليمان | Lujj Sulaymān | محافظة حجة | PPL | 80 | 15 | 104.62 | saada |
| adh-dhari | الذاري | Adh Dhārī | محافظة حجة | PPL | 80 | 23 | 104.74 | saada |
| an-nayifah | النايفة | An Nāyifah | محافظة حجة | PPL | 80 | 10 | 104.74 | saada |
| al-jaww | الخـــو | Al Jaww | محافظة حجة | PPL | 80 | 3 | 104.74 | saada |
| al-makan | المكان | Al Makān | محافظة حجة | PPL | 80 | 16 | 104.44 | saada |
| al-khurbah | الخربة | Al Khurbah | محافظة حجة | PPL | 80 | 16 | 104.69 | saada |
| kawlat-ad-dimagh | كولة الدماغ | Kawlat ad Dimāgh | محافظة حجة | PPL | 80 | 14 | 104.57 | saada |
| al-khirab | الخراب | Al Khirāb | محافظة حجة | PPL | 80 | 7 | 104.61 | saada |
| al-maghribah | المغربة | Al Maghribah | محافظة حجة | PPL | 80 | 4 | 104.68 | saada |
| al-jawad | الجواد | Al Jawād | محافظة حجة | PPL | 80 | 11 | 104.72 | saada |
| al-majrab | المجرب | Al Majrab | محافظة حجة | PPL | 80 | 2 | 104.45 | saada |
| al-madram | المدرام | Al Madrām | محافظة حجة | PPL | 80 | 8 | 104.33 | saada |
| mihdab | محداب | Miḩdāb | محافظة حجة | PPL | 80 | 2 | 105.18 | saada |
| bayt-wahan | بيت وهان | Bayt Wahān | محافظة حجة | PPL | 80 | 6 | 105.36 | saada |
| al-kawlah-as-sawda | الكولة السوداء | Al Kawlah as Sawdā’ | محافظة حجة | PPL | 80 | 10 | 105.27 | saada |
| al-maqza | المقزع | Al Maqza‘ | محافظة حجة | PPL | 80 | 2 | 105.25 | saada |
| bayt-al-majid | بيت الماجد | Bayt al Mājid | محافظة حجة | PPL | 80 | 8 | 105.35 | saada |
| al-khadhlah | الخذلة | Al Khadhlah | محافظة حجة | PPL | 80 | 15 | 105.20 | saada |
| al-maghribah-al-ulya | المغربة العليا | Al Maghribah al ‘Ulyā | محافظة حجة | PPL | 80 | 25 | 105.23 | saada |
| qabur-al-ajwah | قبور الأخوة | Qabūr al Ajwah | محافظة حجة | PPL | 80 | 10 | 105.10 | saada |
| bayt-al-ahnawmi | بيت الأهنومي | Bayt al Ahnawmī | محافظة حجة | PPL | 80 | 20 | 105.02 | saada |
| al-hathrah | الحثرة | Al Ḩathrah | محافظة حجة | PPL | 80 | 9 | 105.01 | saada |
| al-hudhaylah | الهذيلة | Al Hudhaylah | محافظة حجة | PPL | 80 | 4 | 105.06 | saada |
| qawdi-as-sahal | قودي السهل | Qawdī as Sahal | محافظة حجة | PPL | 80 | 2 | 105.08 | saada |
| ash-shatur | الشطور | Ash Shaţūr | محافظة حجة | PPL | 80 | 9 | 104.92 | saada |
| al-aqsam | الأقسام | Al Aqsām | محافظة حجة | PPL | 80 | 5 | 104.97 | saada |
| al-maghribah-as-sufla | المغربة السفلى | Al Maghribah as Suflá | محافظة حجة | PPL | 80 | 2 | 104.84 | saada |
| bani-ali | بني على | Banī ‘Alī | محافظة حجة | PPL | 80 | 16 | 104.72 | saada |
| bayt-al-awja | بيت العوجاء | Bayt al ‘Awjā’ | محافظة حجة | PPL | 80 | 4 | 102.50 | saada |
| as-saqiyah | الساقية | As Sāqīyah | محافظة حجة | PPL | 80 | 17 | 104.69 | saada |
| al-matin | المعطن | Al Ma‘ţin | محافظة حجة | PPL | 80 | 22 | 104.70 | saada |
| kawlat-salihah | كولة صالحة | Kawlat Şāliḩah | محافظة حجة | PPL | 80 | 6 | 104.63 | saada |
| bayt-al-ubayd-al-ghumrah | بيت العبيد الغمرة | Bayt al ‘Ubayd al Ghumrah | محافظة حجة | PPL | 80 | 2 | 104.78 | saada |
| gharib-al-mukarimah | غارب المكارمة | Ghārib al Mukārimah | محافظة حجة | PPL | 80 | 5 | 104.76 | saada |
| bayt-fatimah | بيت فاطمة | Bayt Fāţimah | محافظة حجة | PPL | 80 | 5 | 104.86 | saada |
| bayt-al-khamusi | بيت الخموسي | Bayt al Khamūsī | محافظة حجة | PPL | 80 | 6 | 104.58 | saada |
| bayt-az-zaydiyah | بيت الزيدية | Bayt az Zaydīyah | محافظة حجة | PPL | 80 | 17 | 104.56 | saada |
| bayt-al-shuwayti | بيت الشويطي | Bayt al Shuwayţī | محافظة حجة | PPL | 80 | 3 | 104.67 | saada |
| bayt-al-uthmaniyah | بيت العثمانية | Bayt al ‘Uthmānīyah | محافظة حجة | PPL | 80 | 3 | 104.33 | saada |
| at-takadah | النكادة | At Takādah | محافظة حجة | PPL | 80 | 9 | 104.57 | saada |
| qurn-ash-shaytan | قرن الشيطان | Qurn ash Shayţān | محافظة حجة | PPL | 80 | 2 | 104.04 | saada |
| an-naqa | النقاع | An Naqā‘ | محافظة حجة | PPL | 80 | 8 | 104.16 | saada |
| bayt-hadith-jafar | بيت حديث جعفر | Bayt Ḩadīth Ja‘far | محافظة حجة | PPL | 80 | 5 | 103.82 | saada |
| hayfat-al-anib | حيفة العنب | Ḩayfat al ‘Anib | محافظة حجة | PPL | 80 | 1 | 105.50 | saada |
| al-midabil | المدابل | Al Midābil | محافظة حجة | PPL | 80 | 3 | 105.30 | saada |
| al-quwaid | القواعد | Al Quwā‘id | محافظة حجة | PPL | 80 | 3 | 105.45 | saada |
| kawlat-bin-jabir | كولة بن جابر | Kawlat Bin Jābir | محافظة حجة | PPL | 80 | 7 | 105.43 | saada |
| bayt-al-hammadi | بيت الحمادي | Bayt al Ḩammādī | محافظة حجة | PPL | 80 | 7 | 105.63 | saada |
| dhira-al-makan | ذراع المكان | Dhirā‘ al Makān | محافظة حجة | PPL | 80 | 2 | 105.36 | saada |
| al-mahyul | المحيول | Al Maḩyūl | محافظة حجة | PPL | 80 | 6 | 105.25 | saada |
| hadab-al-hinabah | حدب الحنابة | Ḩadab al Ḩinābah | محافظة حجة | PPL | 80 | 3 | 105.13 | saada |
| bayt-husaynah | بيت حسينة | Bayt Ḩusaynah | محافظة حجة | PPL | 80 | 20 | 105.36 | saada |
| al-makhrash | المخرش | Al Makhrash | محافظة حجة | PPL | 80 | 10 | 105.32 | saada |
| bayt-al-qadi | بيت القاضي | Bayt al Qāḑī | محافظة حجة | PPL | 80 | 14 | 105.28 | saada |
| al-hajab | الحاجب | Al Ḩājab | محافظة حجة | PPL | 80 | 6 | 104.93 | saada |
| ath-thaminah | الثامنة | Ath Thāminah | محافظة حجة | PPL | 80 | 21 | 104.22 | saada |
| al-khibayah | الخباية | Al Khibāyah | محافظة حجة | PPL | 80 | 24 | 103.84 | saada |
| al-isabah | العصابة | Al ‘Işābah | محافظة حجة | PPL | 80 | 8 | 103.79 | saada |
| al-mizab | المعزاب | Al Mi‘zāb | محافظة حجة | PPL | 80 | 26 | 103.84 | saada |
| bayt-al-hadi | بيت هادي | Bayt al Hādī | محافظة حجة | PPL | 80 | 2 | 105.33 | saada |
| al-mashrafiyah | المشرفية | Al Mashrafīyah | محافظة حجة | PPL | 80 | 4 | 104.08 | saada |
| az-zaybah | الزيبة | Az Zaybah | محافظة حجة | PPL | 80 | 3 | 104.28 | saada |
| kawlat-al-fayadi | كولة الفياضي | Kawlat al Fayāḑī | محافظة حجة | PPL | 80 | 11 | 104.30 | saada |
| al-athilah | الأثلة | Al Athilah | محافظة حجة | PPL | 80 | 4 | 101.66 | saada |
| al-jibar | الجبار | Al Jibār | محافظة حجة | PPL | 80 | 2 | 101.81 | saada |
| as-sulbah | الصلبة | Aş Şulbah | محافظة حجة | PPL | 80 | 3 | 101.84 | saada |
| al-ghuraythah | الغريثة | Al Ghuraythah | محافظة حجة | PPL | 80 | 4 | 101.68 | saada |
| ash-shajnah | الشجنة | Ash Shajnah | محافظة حجة | PPL | 80 | 5 | 101.69 | saada |
| bayt-al-qalah | بيت القلعة | Bayt al Qal‘ah | محافظة حجة | PPL | 80 | 10 | 103.82 | saada |
| ar-rawha | الروحاء | Ar Rawhā’ | محافظة حجة | PPL | 80 | 3 | 103.69 | saada |
| bayt-al-lujj | بيت اللج | Bayt al Lujj | محافظة حجة | PPL | 80 | 7 | 102.78 | saada |
| al-mayjanah | الميجانة | Al Mayjānah | محافظة حجة | PPL | 80 | 23 | 102.72 | saada |
| al-badi | البدعي | Al Bad‘ī | محافظة حجة | PPL | 80 | 27 | 102.87 | saada |
| bayt-as-suqayf | بيت السقيف | Bayt as Suqayf | محافظة حجة | PPL | 80 | 8 | 103.01 | saada |
| bayt-al-muqattir | بيت المقطر | Bayt al Muqaţţir | محافظة حجة | PPL | 80 | 3 | 102.43 | saada |
| ghumrat-al-faqih | غمرة الفقيه | Ghumrat al Faqīh | محافظة حجة | PPL | 80 | 20 | 102.91 | saada |
| ghumrat-bani-as-saadi | غمرة بني السعدي | Ghumrat Banī as Sa‘adī | محافظة حجة | PPL | 80 | 12 | 102.93 | saada |
| al-mathawi-al-ala | المثاوي الأعلى | Al Mathāwī al A‘lá | محافظة حجة | PPL | 80 | 11 | 103.43 | saada |
| al-udhirah | العذرة | Al ‘Udhirah | محافظة حجة | PPL | 80 | 3 | 103.89 | saada |
| ash-shihali | الشهالي | Ash Shihālī | محافظة حجة | PPL | 80 | 8 | 103.60 | saada |
| al-qalah | القلعة | Al Qal‘ah | محافظة حجة | PPL | 80 | 6 | 104.73 | saada |
| gharib-an-nawwarah | غارب النوارة | Ghārib an Nawwārah | محافظة حجة | PPL | 80 | 4 | 104.52 | saada |
| as-saniah | الصانعة | Aş Şāni‘ah | محافظة حجة | PPL | 80 | 3 | 103.78 | saada |
| al-mathwi | المثوي | Al Mathwī | محافظة حجة | PPL | 80 | 3 | 105.13 | saada |
| bayt-ar-ridai | بيت الرضاعي | Bayt ar Riḑā‘ī | محافظة حجة | PPL | 80 | 7 | 104.62 | saada |
| bayt-at-tabar | بيت الطبر | Bayt aţ Ţabar | محافظة حجة | PPL | 80 | 1 | 103.62 | saada |
| bayt-al-lughah | بيت اللغة | Bayt al Lughah | محافظة حجة | PPL | 80 | 3 | 103.71 | saada |
| al-muqlib | المقلب | Al Muqlib | محافظة حجة | PPL | 80 | 2 | 104.04 | saada |
| bayt-at-tawilah | بيت الطويلة | Bayt aţ Ţawīlah | محافظة حجة | PPL | 80 | 3 | 104.11 | saada |
| gharib-al-matri | غارب المطري | Ghārib al Maţrī | محافظة حجة | PPL | 80 | 2 | 104.37 | saada |
| bayt-al-hadiyah | بيت الحدية | Bayt al Ḩadīyah | محافظة حجة | PPL | 80 | 10 | 104.41 | saada |
| al-muhayyimiyah | المحيمية | Al Muḩayyimīyah | محافظة حجة | PPL | 80 | 4 | 105.08 | saada |
| al-jadibah | الجدبة | Al Jadibah | محافظة حجة | PPL | 80 | 7 | 105.07 | saada |
| al-mikhaniq | المخانق | Al Mikhāniq | محافظة حجة | PPL | 80 | 4 | 104.81 | saada |
| bayt-muhammad-ali | بيت محمد على | Bayt Muḩammad ‘Alī | محافظة حجة | PPL | 80 | 15 | 104.90 | saada |
| ath-thuah | الثوعة | Ath Thū‘ah | محافظة حجة | PPL | 80 | 9 | 106.82 | saada |
| hunaykah | حنيكة | Ḩunaykah | محافظة حجة | PPL | 80 | 2 | 108.93 | sanaa |
| gharib-shibat | غارب شباط | Ghārib Shibāţ | محافظة حجة | PPL | 80 | 11 | 108.22 | saada |
| kawlat-tahir | كولة طاهر | Kawlat Ţāhir | محافظة حجة | PPL | 80 | 1 | 108.33 | sanaa |
| mujrib-as-sumali | مجرب الصومالي | Mujrib aş Şūmālī | محافظة حجة | PPL | 80 | 1 | 108.22 | sanaa |
| al-jalayam | الجلايم | Al Jalāyam | محافظة حجة | PPL | 80 | 4 | 106.71 | saada |
| al-mahfari | المحفاري | Al Maḩfārī | محافظة حجة | PPL | 80 | 10 | 107.14 | saada |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة حجة | PPL | 80 | 1 | 106.18 | saada |
| al-qashab | القاشب | Al Qāshab | محافظة حجة | PPL | 80 | 3 | 106.99 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة حجة | PPL | 80 | 3 | 107.04 | saada |
| al-bayhin | البيحين | Al Bayḩīn | محافظة حجة | PPL | 80 | 4 | 107.23 | saada |
| al-mushtira | المشتراء | Al Mushtirā’ | محافظة حجة | PPL | 80 | 4 | 107.49 | saada |
| dhira-al-miqshab | ذراع المقشاب | Dhirā‘ al Miqshāb | محافظة حجة | PPL | 80 | 5 | 106.44 | saada |
| qasabat-al-ghilaywah | قصبة الغليوة | Qaşabat al Ghilaywah | محافظة حجة | PPL | 80 | 6 | 106.06 | saada |
| bayt-al-musinn | بيت المسن | Bayt al Musinn | محافظة حجة | PPL | 80 | 2 | 106.12 | saada |
| bayt-al-kudri | بيت الكدري | Bayt al Kudrī | محافظة حجة | PPL | 80 | 1 | 106.15 | saada |
| bayt-al-mahwal | بيت المحوال | Bayt al Maḩwāl | محافظة حجة | PPL | 80 | 10 | 106.24 | saada |
| al-muhadhib | المحاذيب | Al Muḩādhīb | محافظة حجة | PPL | 80 | 1 | 106.16 | saada |
| al-qalah | القلعـة | Al Qal‘ah | محافظة حجة | PPL | 80 | 2 | 106.13 | saada |
| al-muhami-al-asfal | المحمي الأسفل | Al Muḩamī al Asfal | محافظة حجة | PPL | 80 | 2 | 106.08 | saada |
| al-muhami-al-ala | المحمي الأعلى | Al Muḩamī al A‘lá | محافظة حجة | PPL | 80 | 2 | 105.95 | saada |
| al-marawigh | المراوغ | Al Marāwigh | محافظة حجة | PPL | 80 | 4 | 105.89 | saada |
| al-muhathilah | المحثلة | Al Muḩathilah | محافظة حجة | PPL | 80 | 11 | 105.35 | saada |
| al-ghurayf | الغريف | Al Ghurayf | محافظة حجة | PPL | 80 | 4 | 105.62 | saada |
| al-hariq | الحريق | Al Ḩarīq | محافظة حجة | PPL | 80 | 13 | 105.93 | saada |
| ar-rayfah | الريفة | Ar Rayfah | محافظة حجة | PPL | 80 | 3 | 106.33 | saada |
| al-marawigh | المراوغ | Al Marāwigh | محافظة حجة | PPL | 80 | 2 | 105.96 | saada |
| al-mihraq | المحراق | Al Miḩrāq | محافظة حجة | PPL | 80 | 3 | 105.70 | saada |
| al-mahawi | المحاوي | Al Maḩāwī | محافظة حجة | PPL | 80 | 7 | 105.99 | saada |
| al-khurshibah | الخرشبة | Al Khurshibah | محافظة حجة | PPL | 80 | 8 | 106.75 | saada |
| majil-umar | ماجل عمر | Mājil ‘Umar | محافظة حجة | PPL | 80 | 9 | 105.78 | saada |
| al-hazibah | الحزبة | Al Ḩazibah | محافظة حجة | PPL | 80 | 20 | 106.80 | saada |
| al-jirzu | الجرزوع | Al Jirzū‘ | محافظة حجة | PPL | 80 | 9 | 106.84 | saada |
| al-fubarah | الفبرة | Al Fubarah | محافظة حجة | PPL | 80 | 15 | 106.86 | saada |
| al-mahdadah | المحدادة | Al Maḩdādah | محافظة حجة | PPL | 80 | 18 | 107.04 | saada |
| al-majbarah | المجبارة | Al Majbārah | محافظة حجة | PPL | 80 | 10 | 106.78 | saada |
| al-maradimah | المردمة | Al Maradimah | محافظة حجة | PPL | 80 | 5 | 106.69 | saada |
| al-usayliyah | العسيلية | Al ‘Usaylīyah | محافظة حجة | PPL | 80 | 4 | 106.55 | saada |
| bayt-ar-rahbani | بيت الرحباني | Bayt ar Raḩbānī | محافظة حجة | PPL | 80 | 12 | 106.42 | saada |
| al-jahili-mujarif | الجاهلي مجاريف | Al Jāhilī Mujārīf | محافظة حجة | PPL | 80 | 5 | 105.68 | saada |
| bayt-dahman | بيت دهمان | Bayt Dahmān | محافظة حجة | PPL | 80 | 9 | 105.46 | saada |
| ash-sharukh | الشروخ | Ash Sharūkh | محافظة حجة | PPL | 80 | 3 | 105.62 | saada |
| bayt-al-kurt | بيت الكرت | Bayt al Kurt | محافظة حجة | PPL | 80 | 20 | 105.94 | saada |
| bayt-al-qahtani | بيت القحطاني | Bayt al Qaḩţānī | محافظة حجة | PPL | 80 | 4 | 106.34 | saada |
| hayfat-nasir | حيفة ناصر | Ḩayfat Nāşir | محافظة حجة | PPL | 80 | 2 | 106.22 | saada |
| bayt-al-qadi | بيت القاضي | Bayt al Qāḑī | محافظة حجة | PPL | 80 | 3 | 106.37 | saada |
| bayt-al-jarad | بيت الجراد | Bayt al Jarād | محافظة حجة | PPL | 80 | 2 | 106.33 | saada |
| al-anaq | العنق | Al ‘Anaq | محافظة حجة | PPL | 80 | 1 | 107.20 | saada |
| al-qusayyah | القصية | Al Quşayyah | محافظة حجة | PPL | 80 | 5 | 106.23 | saada |
| zahir-al-jamal | ظهر الجمل | Z̧ahir al Jamal | محافظة حجة | PPL | 80 | 3 | 107.72 | saada |
| al-jirubah | الجروبة | Al Jirūbah | محافظة حجة | PPL | 80 | 6 | 106.72 | saada |
| naqil-al-wa | نقيل الواء | Naqīl al Wā’ | محافظة حجة | PPL | 80 | 1 | 106.69 | saada |
| ar-razwah | الرزوة | Ar Razwah | محافظة حجة | PPL | 80 | 5 | 106.88 | saada |
| an-niyas | النياس | An Niyās | محافظة حجة | PPL | 80 | 1 | 106.64 | saada |
| al-jirubah | الجروبــة | Al Jirūbah | محافظة حجة | PPL | 80 | 3 | 107.22 | saada |
| al-qawaid | القواعــد | Al Qawā‘id | محافظة حجة | PPL | 80 | 5 | 107.11 | saada |
| ar-rab | الربع | Ar Rab‘ | محافظة حجة | PPL | 80 | 1 | 107.08 | saada |
| bayt-al-maghribah | بيت المغربـة | Bayt al Maghribah | محافظة حجة | PPL | 80 | 3 | 106.86 | saada |
| al-masnab | المسنب | Al Masnab | محافظة حجة | PPL | 80 | 3 | 107.41 | saada |
| ash-shawairah | الشواعرة | Ash Shawā‘irah | محافظة حجة | PPL | 80 | 3 | 107.17 | saada |
| qasabat-bani-rashidi | قصبة بني رشدي | Qaşabat Banī Rashidī | محافظة حجة | PPL | 80 | 2 | 107.57 | saada |
| bayt-al-qusi | بيت القوسي | Bayt al Qūsī | محافظة حجة | PPL | 80 | 2 | 107.87 | saada |
| al-muhaffir | المحفر | Al Muḩaffir | محافظة حجة | PPL | 80 | 1 | 107.83 | saada |
| al-yafi | اليافع | Al Yāfi‘ | محافظة حجة | PPL | 80 | 2 | 107.83 | saada |
| sahal-al-quza | سهل القزع | Sahal al Quza‘ | محافظة حجة | PPL | 80 | 2 | 107.55 | saada |
| al-maftuqah | المفتوقة | Al Maftūqah | محافظة حجة | PPL | 80 | 3 | 107.31 | saada |
| al-kayyad | الكيد | Al Kayyad | محافظة حجة | PPL | 80 | 4 | 108.80 | saada |
| bayt-as-sirrah | بيت السرة | Bayt as Sirrah | محافظة حجة | PPL | 80 | 8 | 108.40 | saada |
| bayt-as-salih | بيت الصالح | Bayt aş Şāliḩ | محافظة حجة | PPL | 80 | 3 | 108.16 | saada |
| dhu-al-hamar | ذو الحمر | Dhū al Ḩamar | محافظة حجة | PPL | 80 | 7 | 108.22 | saada |
| al-mushtiqah | المشتقة | Al Mushtiqah | محافظة حجة | PPL | 80 | 2 | 108.24 | saada |
| az-zawrab | الزورب | Az Zawrab | محافظة حجة | PPL | 80 | 2 | 108.21 | saada |
| bayt-al-qarai | بيت القراعي | Bayt al Qarā‘ī | محافظة حجة | PPL | 80 | 4 | 108.92 | saada |
| an-nisah | النصعة | An Niş‘ah | محافظة حجة | PPL | 80 | 4 | 109.14 | saada |
| al-mahsi | المحصي | Al Maḩşī | محافظة حجة | PPL | 80 | 1 | 108.98 | saada |
| al-mutaris | المتارس | Al Mutāris | محافظة حجة | PPL | 80 | 9 | 109.79 | saada |
| al-maqayir | المقايير | Al Maqāyīr | محافظة حجة | PPL | 80 | 4 | 109.17 | saada |
| al-arid | العرض | Al ‘Ariḑ | محافظة حجة | PPL | 80 | 12 | 109.66 | saada |
| bayt-as-salih | بيت الصالح | Bayt aş Şāliḩ | محافظة حجة | PPL | 80 | 3 | 109.30 | saada |
| al-hasir | الحـاسـر | Al Ḩāsir | محافظة حجة | PPL | 80 | 10 | 109.41 | saada |
| al-mudrajah | المدراجة | Al Mudrājah | محافظة حجة | PPL | 80 | 9 | 109.56 | saada |
| lujj-al-aridah | لج العارضة | Lujj al ‘Āriḑah | محافظة حجة | PPL | 80 | 3 | 110.31 | saada |
| al-maghafal | المغافل | Al Maghāfal | محافظة حجة | PPL | 80 | 2 | 110.58 | saada |
| mashrab-jabir | مشرب جابر | Mashrab Jābir | محافظة حجة | PPL | 80 | 38 | 110.23 | saada |
| dhira-ad-dimashah | ذراع الدماشة | Dhirā‘ ad Dimāshah | محافظة حجة | PPL | 80 | 4 | 110.07 | saada |
| bayt-falah | بيت فلاح | Bayt Falāḩ | محافظة حجة | PPL | 80 | 8 | 109.80 | saada |
| al-qati | القطع | Al Qaţi‘ | محافظة حجة | PPL | 80 | 1 | 107.43 | saada |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 2 | 107.52 | saada |
| bahal-ad-darb | باحل الدرب | Bāḩal ad Darb | محافظة حجة | PPL | 80 | 3 | 107.63 | saada |
| bayt-al-maghribah | بيت المغربة | Bayt al Maghribah | محافظة حجة | PPL | 80 | 1 | 107.36 | saada |
| al-muqabil | المقابل | Al Muqābil | محافظة حجة | PPL | 80 | 2 | 107.40 | saada |
| al-ikhwad | الإخواض | Al Ikhwāḑ | محافظة حجة | PPL | 80 | 2 | 107.63 | saada |
| dar-ash-shamiyah | دار الشامية | Dār ash Shāmīyah | محافظة حجة | PPL | 80 | 18 | 107.75 | saada |
| gharib-ad-dukayn | غارب الدكين | Ghārib ad Dukayn | محافظة حجة | PPL | 80 | 5 | 108.00 | saada |
| bayt-al-jayyir | بيت الجير | Bayt al Jayyir | محافظة حجة | PPL | 80 | 3 | 107.72 | saada |
| al-mishani | المشانيع | Al Mishānī‘ | محافظة حجة | PPL | 80 | 8 | 107.75 | saada |
| al-mukhayt | المخيط | Al Mukhayţ | محافظة حجة | PPL | 80 | 36 | 107.86 | saada |
| al-fadjar | الفدجار | Al Fadjār | محافظة حجة | PPL | 80 | 2 | 107.89 | saada |
| bayt-ath-thayyah | بيت الثيـة | Bayt ath Thayyah | محافظة حجة | PPL | 80 | 4 | 108.44 | saada |
| al-muzaybah | المعزيبة | Al Mu‘zaybah | محافظة حجة | PPL | 80 | 12 | 109.34 | saada |
| dayrisah | ديربسـة | Dayrisah | محافظة حجة | PPL | 80 | 2 | 110.19 | saada |
| at-tawatiyah | الطواطية | Aţ Ţawāţīyah | محافظة حجة | PPL | 80 | 10 | 110.41 | saada |
| al-miqshab | المقشاب | Al Miqshāb | محافظة حجة | PPL | 80 | 3 | 110.34 | saada |
| dayr-al-ashraq | دير الأشراق | Dayr al Ashrāq | محافظة حجة | PPL | 80 | 16 | 109.77 | saada |
| al-manha | المنحاء | Al Manḩā’ | محافظة حجة | PPL | 80 | 70 | 108.73 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 16 | 108.67 | saada |
| lujj-al-wajar | لج الوجار | Lujj al Wajār | محافظة حجة | PPL | 80 | 8 | 108.92 | saada |
| an-naqil | النقيل | An Naqīl | محافظة حجة | PPL | 80 | 14 | 108.38 | saada |
| al-hazibah | الحزبة | Al Ḩazibah | محافظة حجة | PPL | 80 | 21 | 108.35 | saada |
| al-hajawirah | الحجاورة | Al Ḩajāwirah | محافظة حجة | PPL | 80 | 9 | 108.29 | saada |
| shamsan | شمسان | Shamsān | محافظة حجة | PPL | 80 | 4 | 107.34 | saada |
| as-siwani | الصوانع | Aş Şiwāni‘ | محافظة حجة | PPL | 80 | 3 | 107.70 | saada |
| al-maawilah | المعاولة | Al Ma‘āwilah | محافظة حجة | PPL | 80 | 23 | 107.94 | saada |
| ash-shirukh | الشروخ | Ash Shirūkh | محافظة حجة | PPL | 80 | 23 | 108.06 | saada |
| al-kubaysiyah | الكبيسية | Al Kubaysīyah | محافظة حجة | PPL | 80 | 13 | 107.30 | saada |
| bayt-al-munakhkhir | بيت المنخر | Bayt al Munakhkhir | محافظة حجة | PPL | 80 | 13 | 107.67 | saada |
| al-qayyimah | القيمة | Al Qayyimah | محافظة حجة | PPL | 80 | 8 | 107.52 | saada |
| al-kadimah | الكدمة | Al Kadimah | محافظة حجة | PPL | 80 | 33 | 107.20 | saada |
| as-siwani | الصوانع | Aş Şiwāni‘ | محافظة حجة | PPL | 80 | 10 | 107.04 | saada |
| shati-al-hajj | شاطئ الحاج | Shāţi’ al Ḩājj | محافظة حجة | PPL | 80 | 15 | 107.76 | saada |
| ar-rajimah | الرجمة | Ar Rajimah | محافظة حجة | PPL | 80 | 3 | 108.44 | sanaa |
| al-matbaqiyah | المطبقية | Al Maţbaqīyah | محافظة حجة | PPL | 80 | 1 | 108.72 | sanaa |
| al-ghafilah | الغافلة | Al Ghāfilah | محافظة حجة | PPL | 80 | 16 | 108.97 | sanaa |
| al-jurb | الجرب | Al Jurb | محافظة حجة | PPL | 80 | 8 | 109.25 | sanaa |
| gharib-rabbi | غارب ربي | Ghārib Rabbī | محافظة حجة | PPL | 80 | 9 | 109.63 | sanaa |
| al-awjah | العوجة | Al ‘Awjah | محافظة حجة | PPL | 80 | 9 | 111.39 | saada |
| albu-zaynah | آلبو زينة | Ālbū Zaynah | محافظة صعدة | PPL | 80 | 17 | 23.47 | saada |
| al-ghawari | الغواري | Al Ghawārī | محافظة صعدة | PPL | 80 | 6 | 21.92 | saada |
| dhi-qadim | ذي قديم | Dhī Qadīm | محافظة صعدة | PPL | 80 | 27 | 23.32 | saada |
| ar-rus | الروس | Ar Rūs | محافظة صعدة | PPL | 80 | 19 | 23.63 | saada |
| al-alabi | العلابي | Al ‘Alābī | محافظة صعدة | PPL | 80 | 27 | 25.08 | saada |
| al-mahjal | المحجل | Al Maḩjal | محافظة صعدة | PPL | 80 | 18 | 25.57 | saada |
| al-ar-rus | آل الروس | Āl ar Rūs | محافظة صعدة | PPL | 80 | 26 | 24.36 | saada |
| ash-shawlan | الشولان | Ash Shawlān | محافظة صعدة | PPL | 80 | 10 | 23.20 | saada |
| ar-ruzmah | الرزمة | Ar Ruzmah | محافظة عمران | PPL | 80 | 43 | 48.05 | saada |
| majair | مجاعر | Majā‘ir | محافظة عمران | PPL | 80 | 5 | 48.76 | saada |
| rayyik | ريــك | Rayyik | محافظة عمران | PPL | 80 | 13 | 47.26 | saada |
| qarn-saylan | قرن سيلان | Qarn Saylān | محافظة عمران | PPL | 80 | 5 | 48.87 | saada |
| jawwah-al-hamra | جوة الحمراء | Jawwah al Ḩamrā’ | محافظة عمران | PPL | 80 | 10 | 45.63 | saada |
| ash-sharijah | الشرجــة | Ash Sharijah | محافظة عمران | PPL | 80 | 30 | 45.82 | saada |
| al-munasir | المناصير | Al Munāşīr | محافظة عمران | PPL | 80 | 21 | 46.00 | saada |
| ash-shatab | الشطب | Ash Shaţab | محافظة عمران | PPL | 80 | 9 | 39.54 | saada |
| mahla | محلى | Maḩlá | محافظة عمران | PPL | 80 | 11 | 30.39 | saada |
| al-maqirah | المقرة | Al Maqirah | محافظة عمران | PPL | 80 | 12 | 35.16 | saada |
| al-milhah-as-sufla | الملحة السفلى | Al Milḩah as Suflá | محافظة صعدة | PPL | 80 | 4 | 29.06 | saada |
| ramram | رمرم | Ramram | محافظة صعدة | PPL | 80 | 5 | 36.81 | saada |
| dhu-anadal | ذو عندل | Dhū ‘Anadal | محافظة صعدة | PPL | 80 | 4 | 36.03 | saada |
| sharah | شعرة | Sha‘rah | محافظة صعدة | PPL | 80 | 1 | 36.13 | saada |
| al-matarid | المعترض | Al Ma‘tariḑ | محافظة صعدة | PPL | 80 | 1 | 35.95 | saada |
| shirmat | شرمات | Shirmāt | محافظة صعدة | PPL | 80 | 3 | 36.25 | saada |
| ghaful | غافل | Ghāful | محافظة صعدة | PPL | 80 | 8 | 34.91 | saada |
| al-ghirus | الغروس | Al Ghirūs | محافظة صعدة | PPL | 80 | 2 | 35.03 | saada |
| dhu-juhaysh | ذو جحيش | Dhū Juḩaysh | محافظة صعدة | PPL | 80 | 7 | 35.16 | saada |
| as-sulayl | السليل | As Sulayl | محافظة صعدة | PPL | 80 | 2 | 34.38 | saada |
| mayhaz | ميحاز | Mayḩāz | محافظة صعدة | PPL | 80 | 4 | 34.90 | saada |
| dhu-nashir | ذو ناشر | Dhū Nāshir | محافظة صعدة | PPL | 80 | 3 | 34.65 | saada |
| dhu-aziz | ذو عزيز | Dhū ‘Azīz | محافظة صعدة | PPL | 80 | 4 | 34.41 | saada |
| bir-rashid | بير راشد | Bīr Rāshid | محافظة صعدة | PPL | 80 | 6 | 34.46 | saada |
| maqam-al-huraysi | مقام الحريسي | Maqām al Ḩuraysī | محافظة صعدة | PPL | 80 | 7 | 23.54 | saada |
| sirbat-zahir | سربة زاهر | Sirbat Zahir | محافظة صعدة | PPL | 80 | 21 | 30.17 | saada |
| dhu-jashman | ذو جشمان | Dhū Jashmān | محافظة صعدة | PPL | 80 | 4 | 30.53 | saada |
| dhat-al-jawar | ذات الجوار | Dhāt al Jawār | محافظة صعدة | PPL | 80 | 3 | 30.82 | saada |
| shakhir | شاجر | Shākhir | محافظة صعدة | PPL | 80 | 3 | 34.09 | saada |
| al-hudhaylat | الهذيلات | Al Hudhaylāt | محافظة صعدة | PPL | 80 | 3 | 34.18 | saada |
| jurayban | جريبان | Juraybān | محافظة صعدة | PPL | 80 | 2 | 33.59 | saada |
| al-hit | الحيط | Al Ḩīţ | محافظة صعدة | PPL | 80 | 18 | 26.59 | saada |
| al-asharah | العشرة | Al ‘Asharah | محافظة صعدة | PPL | 80 | 9 | 27.70 | saada |
| al-khudra | الخضراء | Al Khuḑrā’ | محافظة صعدة | PPL | 80 | 6 | 30.10 | saada |
| raghwah | رغوة | Raghwah | محافظة صعدة | PPL | 80 | 4 | 27.86 | saada |
| al-wasil | آل واصل | Āl Wāşil | محافظة صعدة | PPL | 80 | 5 | 22.12 | saada |
| al-khashwah | الحشوة | Al Khashwah | محافظة عمران | PPL | 80 | 6 | 47.95 | saada |
| al-ishshah | العشة | Al ‘Ishshah | محافظة عمران | PPL | 80 | 4 | 50.81 | saada |
| habah | هابة | Hābah | محافظة عمران | PPL | 80 | 6 | 48.87 | saada |
| qa-dhu-at-talla | قاع ذو الطلى | Qā‘ Dhū aţ Ţallá | محافظة عمران | PPL | 80 | 2 | 47.17 | saada |
| al-wulaj | الولج | Al Wulaj | محافظة عمران | PPL | 80 | 4 | 44.33 | saada |
| ghul-dhu-qinaf | غول ذو قناف | Ghūl Dhū Qināf | محافظة عمران | PPL | 80 | 19 | 46.32 | saada |
| dhu-busi | ذو بوصي | Dhū Būşī | محافظة عمران | PPL | 80 | 20 | 42.02 | saada |
| al-uwayrah | العويرة | Al ‘Uwayrah | محافظة عمران | PPL | 80 | 8 | 36.19 | saada |
| at-tayah-as-sawda | الطاية السوداء | Aţ Ţāyah as Sawdā’ | محافظة عمران | PPL | 80 | 3 | 37.84 | saada |
| naqa-hatman | نقع حطمان | Naqa‘ Ḩaţmān | محافظة عمران | PPL | 80 | 44 | 31.30 | saada |
| ghalat-maghdi | غالة مغدي | Ghālat Maghdī | محافظة عمران | PPL | 80 | 5 | 34.27 | saada |
| al-ghurafi | الغرافى | Al Ghurāfī | محافظة عمران | PPL | 80 | 12 | 35.41 | saada |
| an-nabjah | النبجة | An Nabjah | محافظة عمران | PPL | 80 | 4 | 40.45 | saada |
| dhu-riyash | ذو رياش | Dhū Riyāsh | محافظة صعدة | PPL | 80 | 16 | 13.32 | saada |
| aytan | عيطان | ‘Ayţān | محافظة صعدة | PPL | 80 | 11 | 13.81 | saada |
| al-unayb | العنيب | Al ‘Unayb | محافظة صعدة | PPL | 80 | 3 | 11.99 | saada |
| dhu-shanan | ذو شنان | Dhū Shanān | محافظة صعدة | PPL | 80 | 7 | 12.23 | saada |
| as-saqur | الصقور | Aş Şaqūr | محافظة صعدة | PPL | 80 | 17 | 12.80 | saada |
| rizah | رزاح | Rizāḩ | محافظة صعدة | PPL | 80 | 7 | 12.63 | saada |
| al-lahaq | اللحق | Al Laḩaq | محافظة صعدة | PPL | 80 | 18 | 14.20 | saada |
| dhu-hudhayl | ذو هذيل | Dhū Hudhayl | محافظة صعدة | PPL | 80 | 15 | 18.19 | saada |
| al-ghubays | الغبيس | Al Ghubays | محافظة صعدة | PPL | 80 | 4 | 14.18 | saada |
| sanwan | سنوان | Sanwān | محافظة صعدة | PPL | 80 | 1 | 14.23 | saada |
| dhu-bilal | ذو بلال | Dhū Bilāl | محافظة صعدة | PPL | 80 | 7 | 16.73 | saada |
| al-sharq | آل شرق | Āl Sharq | محافظة صعدة | PPL | 80 | 29 | 17.88 | saada |
| al-hursha | الحرشاء | Al Ḩurshā’ | محافظة صعدة | PPL | 80 | 14 | 17.38 | saada |
| as-safiq | الصفق | Aş Şafiq | محافظة صعدة | PPL | 80 | 7 | 14.88 | saada |
| al-jihadimah | الجحادمة | Al Jiḩādimah | محافظة صعدة | PPL | 80 | 15 | 17.28 | saada |
| al-watan | الوطن | Al Waţan | محافظة صعدة | PPL | 80 | 62 | 6.65 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة صعدة | PPL | 80 | 27 | 6.31 | saada |
| al-dharwah | آل ذروة | Āl Dharwah | محافظة صعدة | PPL | 80 | 36 | 6.47 | saada |
| al-nasir | آل ناصر | Āl Nāşir | محافظة صعدة | PPL | 80 | 73 | 6.79 | saada |
| al-maamis | المعاميس | Al Ma‘āmīs | محافظة صعدة | PPL | 80 | 19 | 15.61 | saada |
| al-maqawaah | المقاوعة | Al Maqāwa‘ah | محافظة صعدة | PPL | 80 | 15 | 14.61 | saada |
| bakil | بكيل | Bakīl | محافظة صعدة | PPL | 80 | 17 | 16.05 | saada |
| as-sabir | الصابر | Aş Şābir | محافظة صعدة | PPL | 80 | 29 | 14.32 | saada |
| al-masnah | المسنة | Al Masnah | محافظة صعدة | PPL | 80 | 7 | 9.94 | saada |
| at-tairah | الطائرة | Aţ Ţā’irah | محافظة صعدة | PPL | 80 | 9 | 10.44 | saada |
| al-al-qanam | آل القنم | Āl al Qanam | محافظة صعدة | PPL | 80 | 25 | 9.71 | saada |
| al-hajirin | الحجرين | Al Ḩajirīn | محافظة صعدة | PPL | 80 | 13 | 9.07 | saada |
| al-maqam | المقام | Al Maqām | محافظة صعدة | PPL | 80 | 12 | 10.52 | saada |
| al-qatimah | القاتمة | Al Qātimah | محافظة صعدة | PPL | 80 | 28 | 8.06 | saada |
| ar-rabiyah | الرابية | Ar Rābīyah | محافظة صعدة | PPL | 80 | 34 | 8.23 | saada |
| al-abd-allah | آل عبدالله | Āl ‘Abd Allāh | محافظة صعدة | PPL | 80 | 13 | 7.80 | saada |
| al-al-harifah | آل الحرفة | Āl al Ḩarifah | محافظة صعدة | PPL | 80 | 45 | 7.96 | saada |
| al-ar-rabi | آل الربيع | Āl ar Rabī‘ | محافظة صعدة | PPL | 80 | 11 | 8.39 | saada |
| al-abu-ulya | آل أبو عليا | Āl Abū ‘Ulyā | محافظة صعدة | PPL | 80 | 29 | 7.65 | saada |
| al-ishshah | العشة | Al ‘Ishshah | محافظة صعدة | PPL | 80 | 10 | 7.51 | saada |
| az-zaylah | الزيلة | Az Zaylah | محافظة صعدة | PPL | 80 | 4 | 5.97 | saada |
| an-naqu | النقوع | An Naqū‘ | محافظة صعدة | PPL | 80 | 14 | 6.36 | saada |
| al-al-lawm | آل اللوم | Āl al Lawm | محافظة صعدة | PPL | 80 | 10 | 5.54 | saada |
| al-musadir | المسادير | Al Musādīr | محافظة صعدة | PPL | 80 | 9 | 5.31 | saada |
| al-al-wana | آل الوناء | Āl al Wanā’ | محافظة صعدة | PPL | 80 | 18 | 3.29 | saada |
| al-khursan | آل خرصان | Āl Khurşān | محافظة صعدة | PPL | 80 | 45 | 3.03 | saada |
| al-ar-rittas | آل الرطاس | Āl ar Riţţās | محافظة صعدة | PPL | 80 | 7 | 3.04 | saada |
| al-sawma | آل صومع | Āl Şawma‘ | محافظة صعدة | PPL | 80 | 40 | 15.55 | saada |
| as-sirab | الصراب | Aş Şirāb | محافظة صعدة | PPL | 80 | 4 | 7.97 | saada |
| al-qaridat | القرضات | Al Qariḑāt | محافظة صعدة | PPL | 80 | 1 | 7.24 | saada |
| as-sadiyah | السعدية | As Sa‘dīyah | محافظة صعدة | PPL | 80 | 5 | 8.97 | saada |
| dhat-al-waram | ذات الوارم | Dhāt al Wāram | محافظة صعدة | PPL | 80 | 5 | 7.46 | saada |
| al-hudayrah | الحضيرة | Al Ḩuḑayrah | محافظة صعدة | PPL | 80 | 3 | 7.69 | saada |
| al-madfir | المدفر | Al Madfir | محافظة صعدة | PPL | 80 | 7 | 8.41 | saada |
| maqam-ad-dars | مقام الدرس | Maqām ad Dars | محافظة صعدة | PPL | 80 | 14 | 24.21 | saada |
| al-milhah-al-ulya | الملحة العليا | Al Milḩah al ‘Ulyā | محافظة صعدة | PPL | 80 | 7 | 27.89 | saada |
| al-awjari | العوجري | Al ‘Awjarī | محافظة صعدة | PPL | 80 | 31 | 3.18 | saada |
| al-qatah | القطعة | Al Qaţ‘ah | محافظة صعدة | PPL | 80 | 4 | 3.13 | saada |
| al-marbat | المربط | Al Marbaţ | محافظة صعدة | PPL | 80 | 39 | 3.47 | saada |
| an-nayd | النيد | An Nayd | محافظة صعدة | PPL | 80 | 36 | 3.63 | saada |
| al-wadan | آل وضان | Āl Waḑān | محافظة صعدة | PPL | 80 | 22 | 3.94 | saada |
| mankhur | منخور | Mankhūr | محافظة صعدة | PPL | 80 | 31 | 4.22 | saada |
| ar-rahwah | الرهوة | Ar Rahwah | محافظة صعدة | PPL | 80 | 34 | 4.87 | saada |
| ar-raqah | الرقعة | Ar Raq‘ah | محافظة صعدة | PPL | 80 | 14 | 5.12 | saada |
| jumaydah | جميدة | Jumaydah | محافظة صعدة | PPL | 80 | 26 | 4.05 | saada |
| al-hajar | الحجر | Al Ḩajar | محافظة صعدة | PPL | 80 | 37 | 23.65 | saada |
| al-idal | العدال | Al ‘Idāl | محافظة صعدة | PPL | 80 | 9 | 22.99 | saada |
| dhu-rabi | ذو ربيع | Dhū Rabī‘ | محافظة صعدة | PPL | 80 | 9 | 19.22 | saada |
| shatt-salim | شط سالم | Shaţţ Sālim | محافظة صعدة | PPL | 80 | 4 | 28.66 | saada |
| watan-khayran | وطن خيران | Waţan Khayrān | محافظة صعدة | PPL | 80 | 8 | 28.38 | saada |
| tudhra | تذرع | Tudhra‘ | محافظة صعدة | PPL | 80 | 11 | 30.34 | saada |
| bani-gharban | بني غربان | Banī Gharbān | محافظة صعدة | PPL | 80 | 51 | 29.99 | saada |
| ahdaq | أحداق | Aḩdāq | محافظة صعدة | PPL | 80 | 10 | 26.51 | saada |
| al-karasah | الكرسعة | Al Karas‘ah | محافظة صعدة | PPL | 80 | 12 | 26.71 | saada |
| al-maqashib | المقاشب | Al Maqāshib | محافظة صعدة | PPL | 80 | 8 | 26.41 | saada |
| al-al-maayyid | آل المعيض | Āl al Ma‘ayyiḑ | محافظة صعدة | PPL | 80 | 8 | 27.01 | saada |
| al-asi | آل عاصي | Āl ‘Āşī | محافظة صعدة | PPL | 80 | 3 | 26.00 | saada |
| alt-jadab | الت جعدب | Alt Ja‘dab | محافظة صعدة | PPL | 80 | 21 | 26.13 | saada |
| al-jabji | الجبجي | Al Jabjī | محافظة صعدة | PPL | 80 | 13 | 20.51 | saada |
| al-zubayri | آل الزبيري | Āl Zubayrī | محافظة صعدة | PPL | 80 | 15 | 20.13 | saada |
| al-nasir | آل ناصر | Āl Nāşir | محافظة صعدة | PPL | 80 | 13 | 22.95 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة صعدة | PPL | 80 | 132 | 14.13 | saada |
| qabyan | قبيان | Qabyān | محافظة الجوف | PPL | 80 | 2 | 112.68 | saada |
| al-haniqah | الحنقة | Al Ḩaniqah | محافظة الجوف | PPL | 80 | 1 | 112.29 | saada |
| al-mishraq | المشراق | Al Mishrāq | محافظة الجوف | PPL | 80 | 21 | 117.02 | saada |
| al-atab | الأعطب | Al A‘ţab | محافظة الجوف | PPL | 80 | 3 | 113.72 | saada |
| yaarah | يعارة | Ya‘ārah | محافظة الجوف | PPL | 80 | 14 | 111.98 | saada |
| al-harrah | الحرة | Al Ḩarrah | محافظة الجوف | PPL | 80 | 3 | 111.41 | saada |
| tanan | طناب | Ţanān | محافظة الجوف | PPL | 80 | 4 | 110.21 | saada |
| al-abalah | العبالة | Al ‘Abālah | محافظة الجوف | PPL | 80 | 18 | 109.66 | saada |
| abu-ishah | أبو عشة | Abū ‘Ishah | محافظة الجوف | PPL | 80 | 4 | 106.55 | saada |
| al-waqirah | الوقيرة | Al Waqīrah | محافظة الجوف | PPL | 80 | 3 | 104.86 | saada |
| al-jufaynah | الجفينة | Al Jufaynah | محافظة الجوف | PPL | 80 | 9 | 102.03 | saada |
| rah | راة | Rāh | محافظة الجوف | PPL | 80 | 22 | 106.88 | saada |
| al-madba | المضباع | Al Maḑbā‘ | محافظة الجوف | PPL | 80 | 7 | 107.50 | saada |
| lujayraf | لجيرف | Lujayraf | محافظة الجوف | PPL | 80 | 9 | 107.16 | saada |
| al-ghawiyah | الغاوية | Al Ghāwīyah | محافظة الجوف | PPL | 80 | 6 | 104.39 | saada |
| makhabi | مخبي | Makhabī | محافظة الجوف | PPL | 80 | 6 | 103.57 | saada |
| al-maatarah-al-maytha | المعاطرة الميثاء | Al Ma‘āţarah al Maythā’ | محافظة الجوف | PPL | 80 | 5 | 104.74 | saada |
| dahal-jalal | دحل جلال | Daḩal Jalāl | محافظة الجوف | PPL | 80 | 5 | 114.30 | saada |
| gharra-al-hajaf | غراء الحجف | Gharrā’ al Ḩajaf | محافظة الجوف | PPL | 80 | 3 | 105.16 | saada |
| at-tulayhah | الطليحة | Aţ Ţulayḩah | محافظة الجوف | PPL | 80 | 3 | 116.21 | saada |
| al-harasah | الهراسة | Al Harāsah | محافظة الجوف | PPL | 80 | 4 | 132.22 | saada |
| al-maltaqa | الملتقى | Al Maltaqá | محافظة الجوف | PPL | 80 | 8 | 134.53 | saada |
| al-jabub | الجبوب | Al Jabūb | محافظة الجوف | PPL | 80 | 5 | 134.82 | saada |
| ath-thabiliyah | الثعبلية | Ath Tha‘bilīyah | محافظة الجوف | PPL | 80 | 2 | 132.03 | saada |
| al-mahjarah | المحجرة | Al Maḩjarah | محافظة الجوف | PPL | 80 | 1 | 134.51 | saada |
| al-mirkham | المرخام | Al Mirkhām | محافظة الجوف | PPL | 80 | 4 | 114.15 | saada |
| zawr-jabir | زور جابر | Zawr Jābir | محافظة الجوف | PPL | 80 | 1 | 113.14 | saada |
| al-mahrash | المهرش | Al Mahrash | محافظة الجوف | PPL | 80 | 4 | 112.06 | saada |
| al-miswah | المسواح | Al Miswāḩ | محافظة الجوف | PPL | 80 | 2 | 112.94 | saada |
| lathar | لثار | Lathār | محافظة الجوف | PPL | 80 | 2 | 112.91 | saada |
| al-jifar | الجفار | Al Jifār | محافظة الجوف | PPL | 80 | 1 | 110.99 | saada |
| al-bahirah | البحرة | Al Baḩirah | محافظة الجوف | PPL | 80 | 5 | 113.86 | saada |
| gharra-al-hunaya | غراء الحنايا | Gharrā’ al Ḩunāyā | محافظة الجوف | PPL | 80 | 4 | 104.08 | saada |
| gharra-al-qawz | غراء القوز | Gharrā’ al Qawz | محافظة الجوف | PPL | 80 | 2 | 104.32 | saada |
| gharra-al-qada | غراء القضاء | Gharrā’ al Qaḑā’ | محافظة الجوف | PPL | 80 | 9 | 105.83 | saada |
| gharra-al-ashayrah | غراء العشيرة | Gharrā’ al ‘Ashayrah | محافظة الجوف | PPL | 80 | 3 | 104.74 | saada |
| gharra-sarah | غراء صارة | Gharrā’ Şārah | محافظة الجوف | PPL | 80 | 6 | 104.27 | saada |
| as-salam | السلام | As Salām | محافظة الجوف | PPL | 80 | 2 | 113.95 | saada |
| dahal-said | دحل سعيد | Daḩal Sa‘īd | محافظة الجوف | PPL | 80 | 2 | 111.10 | saada |
| zawr-uksah | زور عكصة | Zawr ‘Ukşah | محافظة الجوف | PPL | 80 | 2 | 113.00 | saada |
| al-mirkham-al-ala | المرخام الأعلى | Al Mirkhām al A‘lá | محافظة الجوف | PPL | 80 | 5 | 114.10 | saada |
| khashmanah-al-ulya | خشمانة العليا | Khashmānah al ‘Ulyā | محافظة الجوف | PPL | 80 | 1 | 113.49 | saada |
| khashmanah-as-sufla | خشمانة السفلى | Khashmānah as Suflá | محافظة الجوف | PPL | 80 | 1 | 114.19 | saada |
| al-hadhiyah-al-ulya | الحذية العليا | Al Ḩadhīyah al ‘Ulyā | محافظة الجوف | PPL | 80 | 2 | 113.87 | saada |
| al-hadhiyah-as-sufla | الحذية السفلى | Al Ḩadhīyah as Suflá | محافظة الجوف | PPL | 80 | 2 | 113.95 | saada |
| ad-dahal-al-jabb | الدحل الجب | Ad Daḩal al Jabb | محافظة الجوف | PPL | 80 | 1 | 114.66 | saada |
| dahal-adh-dhib | دحل الذئب | Daḩal adh Dhi’b | محافظة الجوف | PPL | 80 | 2 | 115.03 | saada |
| al-khaluj-al-ulya | الخلوج العليا | Al Khalūj al ‘Ulyā | محافظة الجوف | PPL | 80 | 3 | 115.48 | saada |
| al-maqsarah | المقصرة | Al Maqşarah | محافظة الجوف | PPL | 80 | 4 | 116.26 | saada |
| abu-yahya | أبو يحيى | Abū Yaḩyá | محافظة الجوف | PPL | 80 | 4 | 116.61 | saada |
| zawr-al-bayda | زور البيضاء | Zawr al Bayḑā’ | محافظة الجوف | PPL | 80 | 1 | 117.01 | saada |
| ayarah | أيعارة | Ay‘ārah | محافظة الجوف | PPL | 80 | 3 | 117.47 | saada |
| jabub-bin-hashhash | جبوب بن حشحش | Jabūb Bin Ḩashḩash | محافظة الجوف | PPL | 80 | 2 | 118.39 | saada |
| burkan | بركان | Burkān | محافظة الجوف | PPL | 80 | 2 | 114.50 | saada |
| afi | عفى | ‘Afī | محافظة الجوف | PPL | 80 | 25 | 120.11 | saada |
| tamir | تمر | Tamir | محافظة الجوف | PPL | 80 | 2 | 118.58 | saada |
| saham | سحام | Saḩām | محافظة الجوف | PPL | 80 | 3 | 136.41 | saada |
| lawdihah | لوضحة | Lawḑiḩah | محافظة الجوف | PPL | 80 | 3 | 135.76 | saada |
| ar-rajaiz | الرجائز | Ar Rajā’iz | محافظة صعدة | PPL | 80 | 22 | 84.54 | saada |
| marr-al-qa | مرر القع | Marr al Qa‘ | محافظة صعدة | PPL | 80 | 2 | 87.00 | saada |
| kurayd | كريد | Kurayd | محافظة صعدة | PPL | 80 | 3 | 85.32 | saada |
| abraq-al-majza | أبرق المجزع | Abraq al Majza‘ | محافظة صعدة | PPL | 80 | 21 | 89.76 | saada |
| zujj-al-atifayn | زج العطفين | Zujj al ‘Aţifayn | محافظة صعدة | PPL | 80 | 24 | 92.84 | saada |
| ibt-al-atifayn | إبط العطفين | Ibţ al ‘Aţifayn | محافظة صعدة | PPL | 80 | 20 | 95.20 | saada |
| at-tahami | الطحامي | Aţ Ţaḩāmī | محافظة صعدة | PPL | 80 | 7 | 91.37 | saada |
| al-miqarah | المقارة | Al Miqārah | محافظة حجة | PPL | 80 | 21 | 99.02 | saada |
| bani-muharriz | بني محرز | Banī Muḩarriz | محافظة حجة | PPL | 80 | 1 | 102.70 | saada |
| ad-daman | الدمن | Ad Daman | محافظة حجة | PPL | 80 | 12 | 103.56 | saada |
| al-hayfah-ash-sharqiyah | الحيفة الشرقية | Al Ḩayfah ash Sharqīyah | محافظة حجة | PPL | 80 | 17 | 105.09 | saada |
| al-hayfah-al-gharbiyah | الحيفة الغربية | Al Ḩayfah al Gharbīyah | محافظة حجة | PPL | 80 | 9 | 105.08 | saada |
| ras-al-hayfah | راس الحيفة | Ra’s al Ḩayfah | محافظة حجة | PPL | 80 | 5 | 105.23 | saada |
| al-hazah | الحازة | Al Ḩāzah | محافظة حجة | PPL | 80 | 11 | 104.91 | saada |
| bayt-al-maslihah | بيت المصلحة | Bayt al Maşliḩah | محافظة حجة | PPL | 80 | 5 | 103.29 | saada |
| kawlat-al-qaidah | كولة القاعدة | Kawlat al Qā‘idah | محافظة حجة | PPL | 80 | 2 | 107.10 | saada |
| kawlat-al-mizab | كولة المعزاب | Kawlat al Mi‘zāb | محافظة حجة | PPL | 80 | 4 | 107.96 | saada |
| al-jarab | الجرب | Al Jarab | محافظة حجة | PPL | 80 | 1 | 106.28 | saada |
| bayt-adh-dhira | بيت الذراع | Bayt adh Dhirā‘ | محافظة حجة | PPL | 80 | 3 | 105.57 | saada |
| bayt-adh-dhira | بيت الذراع | Bayt adh Dhirā‘ | محافظة حجة | PPL | 80 | 3 | 106.34 | saada |
| bayt-adh-dhira | بيت الذراع | Bayt adh Dhirā‘ | محافظة حجة | PPL | 80 | 1 | 105.56 | saada |
| al-hazah | الحازة | Al Ḩāzah | محافظة حجة | PPL | 80 | 5 | 106.63 | saada |
| bayt-ash-sharah | بيت الشرة | Bayt ash Sharah | محافظة حجة | PPL | 80 | 2 | 106.30 | saada |
| al-ghurfah | الغرفــة | Al Ghurfah | محافظة حجة | PPL | 80 | 12 | 107.06 | saada |
| qasabat-bani-amir | قصبة بني عامر | Qaşabat Banī ‘Āmir | محافظة حجة | PPL | 80 | 7 | 107.12 | saada |
| bayt-al-qaidah | بيت القاعدة | Bayt al Qā‘idah | محافظة حجة | PPL | 80 | 3 | 109.00 | saada |
| bayt-al-khirabah | بيت الخرابة | Bayt al Khirābah | محافظة حجة | PPL | 80 | 2 | 108.92 | saada |
| al-majdayyirah | المجديرة | Al Majdayyirah | محافظة حجة | PPL | 80 | 10 | 108.52 | saada |
| al-mudbar | المضبار | Al Muḑbār | محافظة حجة | PPL | 80 | 4 | 109.60 | sanaa |
| al-aqilah | العقلة | Al ‘Aqilah | محافظة حجة | PPL | 80 | 10 | 109.62 | sanaa |
| abu-mashaf | أبو مشعف | Abū Mash‘af | محافظة صعدة | PPL | 80 | 27 | 3.08 | saada |
| nasrin | نسرين | Nasrīn | محافظة صعدة | PPL | 80 | 23 | 4.35 | saada |
| al-bawaid | البوائد | Al Bawāi’d | محافظة صعدة | PPL | 80 | 16 | 5.48 | saada |
| az-zawiyah | الزاوية | Az Zāwiyah | محافظة صعدة | PPL | 80 | 25 | 4.46 | saada |
| ash-shatrah | الشطرة | Ash Shaţrah | محافظة صعدة | PPL | 80 | 96 | 5.14 | saada |
| al-musayl-badi | المسيل بديع | Al Musayl Badī‘ | محافظة صعدة | PPL | 80 | 35 | 9.35 | saada |
| al-ashraq | العشرق | Al ‘Ashraq | محافظة صعدة | PPL | 80 | 27 | 10.37 | saada |
| al-gharbiyah | الغربية | Al Gharbīyah | محافظة صعدة | PPL | 80 | 53 | 9.46 | saada |
| al-gharbi | الغربي | Al Gharbī | محافظة صعدة | PPL | 80 | 35 | 3.83 | saada |
| alt-al-umar | الت العمر | Alt al ‘Umar | محافظة صعدة | PPL | 80 | 29 | 30.36 | saada |
| al-madras | آل مرداس | Āl Madrās | محافظة صعدة | PPL | 80 | 15 | 25.58 | saada |
| al-mahjal | المحجل | Al Maḩjal | محافظة صعدة | PPL | 80 | 12 | 11.41 | saada |
| al-mahawal | المحاول | Al Maḩāwal | محافظة صعدة | PPL | 80 | 23 | 13.75 | saada |
| julaydan | جليدان | Julaydān | محافظة صعدة | PPL | 80 | 26 | 8.66 | saada |
| al-abd-allah | آل عبدالله | Āl ‘Abd Allāh | محافظة صعدة | PPL | 80 | 78 | 7.18 | saada |
| al-harf | الحرف | Al Ḩarf | محافظة صعدة | PPL | 80 | 65 | 11.76 | saada |
| lahman | لحمان | Laḩmān | محافظة صعدة | PPL | 80 | 19 | 9.85 | saada |
| al-al-anqarah | آل العنقرة | Āl al ‘Anqarah | محافظة صعدة | PPL | 80 | 20 | 5.34 | saada |
| al-hayjah | الهيجة | Al Hayjah | محافظة صعدة | PPL | 80 | 34 | 5.06 | saada |
| al-maalla | المعلاء | Al Ma‘allā’ | محافظة صعدة | PPL | 80 | 44 | 3.62 | saada |
| al-tahir | ال طاهر | Āl Ţāhir | محافظة صعدة | PPL | 80 | 42 | 9.45 | saada |
| al-khashab | الخشب | Al Khashab | محافظة صعدة | PPL | 80 | 12 | 12.46 | saada |
| al-jaif | الجائف | Al Jāi’f | محافظة صعدة | PPL | 80 | 11 | 13.59 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة صعدة | PPL | 80 | 48 | 12.51 | saada |
| al-ghulayl | الغليل | Al Ghulayl | محافظة صعدة | PPL | 80 | 6 | 14.18 | saada |
| al-hatabi | الحطابي | Al Ḩaţābī | محافظة صعدة | PPL | 80 | 28 | 14.94 | saada |
| al-mahjar | المحجر | Al Maḩjar | محافظة صعدة | PPL | 80 | 95 | 7.69 | saada |
| al-khafji | الخفجي | Al Khafjī | محافظة صعدة | PPL | 80 | 90 | 10.27 | saada |
| al-lasam | اللصم | Al Laşam | محافظة صعدة | PPL | 80 | 12 | 8.96 | saada |
| khulaydah | خليدة | Khulaydah | محافظة صعدة | PPL | 80 | 16 | 9.15 | saada |
| ar-rawashid | الرواشد | Ar Rawāshid | محافظة صعدة | PPL | 80 | 13 | 10.25 | saada |
| al-qayf | القيف | Al Qayf | محافظة صعدة | PPL | 80 | 11 | 23.98 | saada |
| ash-shaqqah | الشقة | Ash Shaqqah | محافظة صعدة | PPL | 80 | 4 | 5.70 | saada |
| as-safari | الصفاري | Aş Şafārī | محافظة صعدة | PPL | 80 | 22 | 4.88 | saada |
| al-khadra | الخضراء | Al Khaḑrā’ | محافظة الجوف | PPL | 80 | 3 | 54.36 | saada |
| ar-rahab-al-ulya | الرحاب العليا | Ar Raḩāb al ‘Ulyā | محافظة صعدة | PPL | 80 | 6 | 43.20 | saada |
| al-mahritayn | المهرتين | Al Mahritayn | محافظة صعدة | PPL | 80 | 21 | 49.81 | saada |
| ar-rahab-as-sufla | الرحاب السفلى | Ar Raḩāb as Suflá | محافظة صعدة | PPL | 80 | 7 | 45.99 | saada |
| qariah | قريعة | Qarī‘ah | محافظة صعدة | PPL | 80 | 1 | 51.26 | saada |
| al-arsubah | الأرصوبة | Al Arşūbah | محافظة صعدة | PPL | 80 | 4 | 45.88 | saada |
| buraykh | بريخ | Buraykh | محافظة صعدة | PPL | 80 | 15 | 45.46 | saada |
| al-qasir | آل قاصر | Āl Qāşir | محافظة صعدة | PPL | 80 | 6 | 45.31 | saada |
| rahwan | رهوان | Rahwān | محافظة صعدة | PPL | 80 | 8 | 45.66 | saada |
| al-bayadah | البيادة | Al Bayādah | محافظة صعدة | PPL | 80 | 8 | 46.08 | saada |
| mawqid | موقد | Mawqid | محافظة صعدة | PPL | 80 | 10 | 49.60 | saada |
| abu-hamdan | أبو همدان | Abū Hamdān | محافظة صعدة | PPL | 80 | 12 | 49.28 | saada |
| rahban | رحبان | Raḩbān | محافظة صعدة | PPL | 80 | 5 | 49.37 | saada |
| al-atafiyah | العطافية | Al ‘Aţāfīyah | محافظة صعدة | PPL | 80 | 29 | 48.87 | saada |
| saydih | صيدح | Şaydiḩ | محافظة صعدة | PPL | 80 | 1 | 52.80 | saada |
| as-suways | السويس | As Suways | محافظة صعدة | PPL | 80 | 1 | 46.04 | saada |
| hibshah | حبشة | Ḩibshah | محافظة صعدة | PPL | 80 | 1 | 46.16 | saada |
| amarah | عمارة | ‘Amārah | محافظة صعدة | PPL | 80 | 4 | 45.11 | saada |
| dhi-malah | ذى ملاح | Dhī Malāḩ | محافظة صعدة | PPL | 80 | 2 | 52.62 | saada |
| tarayan | ترايان | Tarāyān | محافظة صعدة | PPL | 80 | 5 | 48.76 | saada |
| al-jawar | الجوار | Al Jawār | محافظة صعدة | PPL | 80 | 14 | 48.47 | saada |
| al-urayn | العرين | Al ‘Urayn | محافظة صعدة | PPL | 80 | 14 | 47.14 | saada |
| al-qawba | آل قوبع | Āl Qawba‘ | محافظة صعدة | PPL | 80 | 6 | 47.85 | saada |
| qirtan | قرطان | Qirţān | محافظة صعدة | PPL | 80 | 5 | 48.50 | saada |
| al-awsh | العوش | Al ‘Awsh | محافظة صعدة | PPL | 80 | 8 | 46.84 | saada |
| al-ghamriyah | الغامرية | Al Ghāmrīyah | محافظة صعدة | PPL | 80 | 4 | 48.22 | saada |
| al-khulaydiyah | الخليدية | Al Khulaydīyah | محافظة صعدة | PPL | 80 | 2 | 50.59 | saada |
| sahilah | سهلة | Sahilah | محافظة صعدة | PPL | 80 | 29 | 49.91 | saada |
| al-mabruqah | المبروقة | Al Mabrūqah | محافظة صعدة | PPL | 80 | 5 | 50.22 | saada |
| jalabah | جلابة | Jalābah | محافظة صعدة | PPL | 80 | 8 | 49.04 | saada |
| alkam | علكم | ‘Alkam | محافظة صعدة | PPL | 80 | 5 | 52.39 | saada |
| arash | عراش | ‘Arāsh | محافظة صعدة | PPL | 80 | 11 | 52.00 | saada |
| ghusaynah | غصينة | Ghuşaynah | محافظة صعدة | PPL | 80 | 11 | 51.09 | saada |
| rihub | رحوب | Riḩūb | محافظة صعدة | PPL | 80 | 4 | 43.71 | saada |
| ash-shaabat | الشعابات | Ash Sha‘ābāt | محافظة صعدة | PPL | 80 | 5 | 48.61 | saada |
| al-hazimah | الحزمة | Al Ḩazimah | محافظة صعدة | PPL | 80 | 9 | 48.69 | saada |
| al-buyut | البيوت | Al Buyūt | محافظة صعدة | PPL | 80 | 9 | 44.33 | saada |
| as-sirwah | السرواح | As Sirwāḩ | محافظة صعدة | PPL | 80 | 11 | 33.55 | saada |
| ar-rahibah | الرحبة | Ar Raḩibah | محافظة صعدة | PPL | 80 | 6 | 31.91 | saada |
| al-al-hasasi | آل الحصاصى | Āl al Ḩaşāşī | محافظة صعدة | PPL | 80 | 9 | 33.71 | saada |
| al-aqidah | العقدة | Al ‘Aqidah | محافظة صعدة | PPL | 80 | 9 | 40.62 | saada |
| al-kalwah | الكلوة | Al Kalwah | محافظة صعدة | PPL | 80 | 2 | 39.99 | saada |
| usilah | عسيلة | ‘Usīlah | محافظة صعدة | PPL | 80 | 2 | 40.77 | saada |
| nuayzah | نعيظة | Nu‘ayz̧ah | محافظة صعدة | PPL | 80 | 3 | 39.62 | saada |
| qash-dhu-dakam | قشع ذو دعكم | Qash‘ Dhū Da‘kam | محافظة صعدة | PPL | 80 | 8 | 28.80 | saada |
| al-jillah | الجلة | Al Jillah | محافظة صعدة | PPL | 80 | 11 | 35.28 | saada |
| al-masad | آل مسعد | Āl Mas‘ad | محافظة صعدة | PPL | 80 | 5 | 38.06 | saada |
| wahdan | وحدان | Waḩdān | محافظة صعدة | PPL | 80 | 3 | 37.88 | saada |
| al-zaynah | آل زينة | Āl Zaynah | محافظة صعدة | PPL | 80 | 17 | 38.11 | saada |
| al-misrah | المسرح | Al Misraḩ | محافظة صعدة | PPL | 80 | 2 | 37.14 | saada |
| al-dahmish | آل دهمش | Āl Dahmish | محافظة صعدة | PPL | 80 | 16 | 38.16 | saada |
| dhu-hatwah | ذو حتوة | Dhū Ḩatwah | محافظة صعدة | PPL | 80 | 2 | 31.96 | saada |
| al-qimshah | آل قمشة | Āl Qimshah | محافظة صعدة | PPL | 80 | 1 | 38.12 | saada |
| dhu-dakam | ذو دعكم | Dhū Da‘kam | محافظة صعدة | PPL | 80 | 8 | 28.68 | saada |
| dhu-said | ذو سعيد | Dhū Sa‘īd | محافظة صعدة | PPL | 80 | 12 | 31.57 | saada |
| dhu-matir | ذو ماطر | Dhū Māţir | محافظة صعدة | PPL | 80 | 1 | 31.70 | saada |
| al-hiyarah | الحيارة | Al Ḩiyārah | محافظة صعدة | PPL | 80 | 5 | 31.82 | saada |
| al-sawad | آل سواد | Āl Sawād | محافظة صعدة | PPL | 80 | 26 | 31.62 | saada |
| al-madarah | المدارة | Al Madārah | محافظة صعدة | PPL | 80 | 41 | 31.89 | saada |
| dhu-sawab | ذو صواب | Dhū Şawāb | محافظة صعدة | PPL | 80 | 4 | 36.55 | saada |
| al-busayrah | البصيرة | Al Buşayrah | محافظة صعدة | PPL | 80 | 7 | 36.72 | saada |
| udayb | عضيب | ‘Uḑayb | محافظة صعدة | PPL | 80 | 7 | 37.08 | saada |
| as-safaq | الصفق | Aş Şafaq | محافظة صعدة | PPL | 80 | 2 | 36.91 | saada |
| alwanah | علوانة | ‘Alwānah | محافظة صعدة | PPL | 80 | 14 | 44.89 | saada |
| al-jabub | الجبوب | Al Jabūb | محافظة صعدة | PPL | 80 | 7 | 44.32 | saada |
| al-bayadah | البيادة | Al Bayādah | محافظة صعدة | PPL | 80 | 9 | 44.03 | saada |
| al-qatam | آل قطام | Āl Qaţām | محافظة صعدة | PPL | 80 | 20 | 43.53 | saada |
| al-al-adawal | آل الأدول | Āl al Adawal | محافظة صعدة | PPL | 80 | 11 | 42.66 | saada |
| ar-rafidah | الرفدة | Ar Rafidah | محافظة صعدة | PPL | 80 | 19 | 42.39 | saada |
| al-hiwam | الحوام | Al Ḩiwām | محافظة صعدة | PPL | 80 | 9 | 43.84 | saada |
| qawbirah | قوبرة | Qawbirah | محافظة صعدة | PPL | 80 | 2 | 40.37 | saada |
| ar-rahwah | الرهوة | Ar Rahwah | محافظة الجوف | PPL | 80 | 11 | 80.52 | saada |
| ad-dahal | الدحل | Ad Daḩal | محافظة الجوف | PPL | 80 | 7 | 80.81 | saada |
| thalaghim | ثلاغم | Thalāghim | محافظة الجوف | PPL | 80 | 1 | 80.94 | saada |
| at-tarah-ash-sharqiyah | الطراه الشرقية | Aţ Ţarāh ash Sharqīyah | محافظة صعدة | PPL | 80 | 5 | 83.53 | saada |
| rabad | ربد | Rabad | محافظة صعدة | PPL | 80 | 8 | 79.54 | saada |
| al-qam | القمع | Al Qam‘ | محافظة صعدة | PPL | 80 | 4 | 75.49 | saada |
| al-jawwah | الجوة | Al Jawwah | محافظة الجوف | PPL | 80 | 3 | 78.10 | saada |
| al-aruq | العروق | Al ‘Arūq | محافظة الجوف | PPL | 80 | 9 | 78.24 | saada |
| al-hawak | الحوك | Al Ḩawak | محافظة الجوف | PPL | 80 | 8 | 78.22 | saada |
| masudah | مسعودة | Mas‘ūdah | محافظة الجوف | PPL | 80 | 5 | 78.41 | saada |
| al-yaur | اليعور | Al Ya‘ūr | محافظة الجوف | PPL | 80 | 3 | 78.56 | saada |
| maud | معوض | Ma‘ūḑ | محافظة الجوف | PPL | 80 | 1 | 79.53 | saada |
| rakham | رخام | Rakhām | محافظة الجوف | PPL | 80 | 7 | 79.55 | saada |
| al-lajmah | اللجمة | Al Lajmah | محافظة الجوف | PPL | 80 | 6 | 85.20 | saada |
| al-hujayrah | الحجيرة | Al Ḩujayrah | محافظة الجوف | PPL | 80 | 5 | 85.63 | saada |
| jawwat-al-asharah | جوة العشرة | Jawwat al ‘Asharah | محافظة الجوف | PPL | 80 | 3 | 85.70 | saada |
| al-maayin | المعاين | Al Ma‘āyin | محافظة الجوف | PPL | 80 | 7 | 85.76 | saada |
| al-maqam-ash-sharqi | المقام الشرقي | Al Maqām ash Sharqī | محافظة الجوف | PPL | 80 | 6 | 85.72 | saada |
| ar-rishah | الرشاح | Ar Rishāḩ | محافظة الجوف | PPL | 80 | 10 | 85.55 | saada |
| ar-rahwah | الرهوة | Ar Rahwah | محافظة الجوف | PPL | 80 | 5 | 85.49 | saada |
| al-mayyalah | الميالة | Al Mayyālah | محافظة الجوف | PPL | 80 | 7 | 81.83 | saada |
| as-samnah | السمنة | As Samnah | محافظة الجوف | PPL | 80 | 11 | 81.63 | saada |
| tawim | تويم | Tawīm | محافظة الجوف | PPL | 80 | 5 | 81.36 | saada |
| al-hasharah | الحشارة | Al Ḩashārah | محافظة الجوف | PPL | 80 | 25 | 81.27 | saada |
| makhtah | مخطة | Makhţah | محافظة الجوف | PPL | 80 | 2 | 81.42 | saada |
| tahar | طهار | Ţahār | محافظة الجوف | PPL | 80 | 1 | 84.68 | saada |
| as-suways | السويس | As Suways | محافظة الجوف | PPL | 80 | 1 | 86.10 | saada |
| khatwat-al-masawaqah | خطوة المساوقـة | Khaţwat al Masāwaqah | محافظة حجة | PPL | 80 | 2 | 67.66 | saada |
| at-turayf | الطريف | Aţ Ţurayf | محافظة حجة | PPL | 80 | 1 | 67.70 | saada |
| qarn-jamilah | قرن جميلة | Qarn Jamīlah | محافظة حجة | PPL | 80 | 2 | 68.02 | saada |
| jurbat-al-harah | جربـة الحارة | Jurbat al Ḩārah | محافظة حجة | PPL | 80 | 1 | 67.76 | saada |
| wadah | وادعــة | Wād‘ah | محافظة حجة | PPL | 80 | 2 | 67.92 | saada |
| diwah | دواح | Diwāḩ | محافظة حجة | PPL | 80 | 3 | 67.58 | saada |
| dhira-jamilah | ذراع جميلة | Dhirā‘ Jamīlah | محافظة حجة | PPL | 80 | 1 | 68.02 | saada |
| an-naq | النقع | An Naq‘ | محافظة حجة | PPL | 80 | 6 | 69.54 | saada |
| gharib-al-hakm | غارب الحكم | Ghārib al Ḩakm | محافظة حجة | PPL | 80 | 5 | 65.13 | saada |
| abu-uraysh | أبو عريش | Abū ‘Uraysh | محافظة حجة | PPL | 80 | 3 | 65.49 | saada |
| shati-al-makhlifah | شاطئ المخلفة | Shāţi’ al Makhlifah | محافظة حجة | PPL | 80 | 4 | 64.50 | saada |
| gharib-hayban | غارب حيبان | Ghārib Ḩaybān | محافظة حجة | PPL | 80 | 3 | 66.33 | saada |
| shati-as-sarin | شاطئ السرين | Shāţi’ as Sarīn | محافظة حجة | PPL | 80 | 1 | 64.90 | saada |
| al-badah | البدعة | Al Bad‘ah | محافظة حجة | PPL | 80 | 1 | 65.45 | saada |
| shati-al-milh | شاطى الملح | Shāţi’ al Milḩ | محافظة حجة | PPL | 80 | 1 | 65.24 | saada |
| gharib-duwaysh | غارب دويش | Ghārib Duwaysh | محافظة حجة | PPL | 80 | 4 | 66.26 | saada |
| gharib-sarran | غارب صران | Ghārib Şarrān | محافظة حجة | PPL | 80 | 4 | 66.26 | saada |
| qarn-sawqah | قرن صوقة | Qarn Şawqah | محافظة حجة | PPL | 80 | 2 | 66.28 | saada |
| as-samarah | السمرة | As Samarah | محافظة حجة | PPL | 80 | 1 | 66.44 | saada |
| qarn-falal | قرن قعلل | Qarn Fa‘lal | محافظة حجة | PPL | 80 | 1 | 66.59 | saada |
| gharib-habbab | غارب حباب | Ghārib Ḩabbāb | محافظة حجة | PPL | 80 | 4 | 67.12 | saada |
| qarn-al-badi | قرن البديع | Qarn al Badī‘ | محافظة حجة | PPL | 80 | 3 | 66.27 | saada |
| dhira-al-jumlan | ذراع الجملان | Dhirā‘ al Jumlān | محافظة حجة | PPL | 80 | 1 | 67.41 | saada |
| gharib-al-birwiyah | غارب البرويـة | Ghārib al Birwīyah | محافظة حجة | PPL | 80 | 1 | 67.54 | saada |
| shati-hadhdha | شاطئ هذاء | Shāţi’ Hadhdhā’ | محافظة حجة | PPL | 80 | 3 | 67.59 | saada |
| as-surdahi | السرداحي | As Surdāḩī | محافظة حجة | PPL | 80 | 1 | 70.03 | saada |
| bayt-saylan | بيت سيلان | Bayt Saylān | محافظة حجة | PPL | 80 | 1 | 73.11 | saada |
| lasfi | لصقي | Laşfī | محافظة حجة | PPL | 80 | 2 | 71.70 | saada |
| shati-al-ghurf | شاطى الغرف | Shāţi’ al Ghurf | محافظة حجة | PPL | 80 | 4 | 70.34 | saada |
| dhira-al-muqayyim | ذراع المقيم | Dhirā‘ al Muqayyim | محافظة حجة | PPL | 80 | 2 | 70.63 | saada |
| mahall-al-aqabi | محل العقبى | Maḩall al ‘Aqabī | محافظة حجة | PPL | 80 | 5 | 70.40 | saada |
| qarn-maqtu | قرن مقطوع | Qarn Maqţū‘ | محافظة حجة | PPL | 80 | 1 | 70.71 | saada |
| shati-al-milat | شاطى المعلط | Shāţi’ al Mi‘laţ | محافظة حجة | PPL | 80 | 3 | 70.32 | saada |
| qarn-al-hunayah | قرن الحناية | Qarn al Ḩunāyah | محافظة حجة | PPL | 80 | 4 | 70.81 | saada |
| mirthumah | مرثومة | Mirthūmah | محافظة حجة | PPL | 80 | 3 | 69.93 | saada |
| bayt-al-mamari | بيت المعمري | Bayt al Ma‘marī | محافظة حجة | PPL | 80 | 5 | 71.39 | saada |
| arjash | عرجاش | ‘Arjāsh | محافظة حجة | PPL | 80 | 4 | 71.50 | saada |
| al-junayb | الجنيب | Al Junayb | محافظة حجة | PPL | 80 | 6 | 72.01 | saada |
| al-fashakh | الفشاخ | Al Fashākh | محافظة حجة | PPL | 80 | 4 | 72.22 | saada |
| dhira-al-hamra | ذراع الحمراء | Dhirā‘ al Ḩamrā’ | محافظة حجة | PPL | 80 | 3 | 72.74 | saada |
| shati-alwan | شاطى علوان | Shāţi’ ‘Alwān | محافظة حجة | PPL | 80 | 4 | 73.23 | saada |
| gharib-musaliq | غارب مصالق | Ghārib Muşāliq | محافظة حجة | PPL | 80 | 7 | 72.38 | saada |
| al-awarid | العوارض | Al ‘Awāriḑ | محافظة حجة | PPL | 80 | 5 | 72.53 | saada |
| ghurayf | غريف | Ghurayf | محافظة حجة | PPL | 80 | 3 | 73.40 | saada |
| ad-duraybah | الدريبة | Ad Duraybah | محافظة حجة | PPL | 80 | 6 | 73.60 | saada |
| al-ghumrah | الغمرة | Al Ghumrah | محافظة حجة | PPL | 80 | 6 | 73.66 | saada |
| al-mahub | المهوب | Al Mahūb | محافظة حجة | PPL | 80 | 5 | 73.38 | saada |
| qiran | قران | Qirān | محافظة حجة | PPL | 80 | 17 | 73.83 | saada |
| al-khawrimah | الخورمة | Al Khawrimah | محافظة حجة | PPL | 80 | 12 | 73.87 | saada |
| shamwu | شامو | Shāmwu | محافظة حجة | PPL | 80 | 1 | 68.55 | saada |
| dhira-al-muqayyim | ذراع المقيم | Dhirā‘ al Muqayyim | محافظة حجة | PPL | 80 | 3 | 69.43 | saada |
| al-hadabah | الحدبة | Al Ḩadabah | محافظة حجة | PPL | 80 | 4 | 69.53 | saada |
| ar-rawgh | الروغ | Ar Rawgh | محافظة حجة | PPL | 80 | 1 | 71.00 | saada |
| mirka-muraym | مركاع مريم | Mirkā‘ Muraym | محافظة حجة | PPL | 80 | 2 | 70.87 | saada |
| al-habit | الحابط | Al Ḩābiţ | محافظة حجة | PPL | 80 | 4 | 70.35 | saada |
| madliyah | مدلية | Madlīyah | محافظة حجة | PPL | 80 | 10 | 70.15 | saada |
| al-jufnah | الجفنة | Al Jufnah | محافظة حجة | PPL | 80 | 19 | 68.99 | saada |
| tur-ghaylan | طور غيلان | Ţūr Ghaylān | محافظة حجة | PPL | 80 | 1 | 75.23 | saada |
| habbah | حبة | Ḩabbah | محافظة حجة | PPL | 80 | 22 | 75.74 | saada |
| ad-dalah | الضالعة | Aḑ Ḑāl‘ah | محافظة حجة | PPL | 80 | 38 | 75.52 | saada |
| maqtar | مقطر | Maqţar | محافظة حجة | PPL | 80 | 48 | 75.46 | saada |
| ar-radim | الردم | Ar Radim | محافظة حجة | PPL | 80 | 9 | 75.63 | saada |
| al-qalah | القلعة | Al Qal‘ah | محافظة حجة | PPL | 80 | 13 | 74.98 | saada |
| dabush | دعبوش | Da‘būsh | محافظة حجة | PPL | 80 | 13 | 75.68 | saada |
| al-ghumrah | الغمرة | Al Ghumrah | محافظة حجة | PPL | 80 | 11 | 75.61 | saada |
| al-khubaybah | الخبيبة | Al Khubaybah | محافظة حجة | PPL | 80 | 15 | 76.63 | saada |
| al-qawmi | القومى | Al Qawmī | محافظة حجة | PPL | 80 | 3 | 76.66 | saada |
| zajir | زاجر | Zājir | محافظة حجة | PPL | 80 | 10 | 76.79 | saada |
| ar-rukayb | الركيب | Ar Rukayb | محافظة حجة | PPL | 80 | 6 | 77.15 | saada |
| ash-shurfah | الشرفة | Ash Shurfah | محافظة حجة | PPL | 80 | 19 | 77.31 | saada |
| al-hunayyah | الحنية | Al Ḩunayyah | محافظة حجة | PPL | 80 | 7 | 76.96 | saada |
| gharib-al-falaq | غارب الفلق | Ghārib al Falaq | محافظة حجة | PPL | 80 | 6 | 74.78 | saada |
| qarr-al-jahfa | قر الجهفاء | Qarr al Jahfā’ | محافظة حجة | PPL | 80 | 6 | 74.50 | saada |
| al-wishwash | الوشواش | Al Wishwāsh | محافظة حجة | PPL | 80 | 2 | 71.87 | saada |
| al-quwaidah | القواعدة | Al Quwā‘idah | محافظة حجة | PPL | 80 | 8 | 72.26 | saada |
| al-qurayn | القرين | Al Qurayn | محافظة حجة | PPL | 80 | 1 | 71.71 | saada |
| ash-shabkah | الشبكة | Ash Shabkah | محافظة حجة | PPL | 80 | 3 | 78.03 | saada |
| saydah | سيدة | Saydah | محافظة حجة | PPL | 80 | 36 | 78.83 | saada |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة حجة | PPL | 80 | 10 | 75.48 | saada |
| al-qasiyah | القصية | Al Qaşīyah | محافظة حجة | PPL | 80 | 5 | 75.20 | saada |
| tur-ash-shaykh | طور الشيخ | Ţūr ash Shaykh | محافظة حجة | PPL | 80 | 8 | 76.01 | saada |
| ras-makhshab | راس مخشب | Ra’s Makhshab | محافظة حجة | PPL | 80 | 19 | 75.98 | saada |
| ad-dumaynah | الدمينة | Ad Dumaynah | محافظة حجة | PPL | 80 | 12 | 75.76 | saada |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 11 | 75.11 | saada |
| al-artub | العرتوب | Al ‘Artūb | محافظة حجة | PPL | 80 | 4 | 75.09 | saada |
| gharib-al-khiyalah | غارب الخيالة | Ghārib al Khiyālah | محافظة حجة | PPL | 80 | 9 | 74.98 | saada |
| masmar | مسمار | Masmār | محافظة حجة | PPL | 80 | 13 | 75.03 | saada |
| al-qubayr | القبير | Al Qubayr | محافظة حجة | PPL | 80 | 11 | 74.67 | saada |
| al-jammah | الجمة | Al Jammah | محافظة حجة | PPL | 80 | 29 | 74.10 | saada |
| al-lahlali | اللهلالي | Al Lahlālī | محافظة حجة | PPL | 80 | 8 | 74.20 | saada |
| al-mahraq | المحرق | Al Maḩraq | محافظة حجة | PPL | 80 | 5 | 73.85 | saada |
| ad-dayr | الدير | Ad Dayr | محافظة حجة | PPL | 80 | 1 | 75.94 | saada |
| al-mujarin | المجارين | Al Mujārīn | محافظة حجة | PPL | 80 | 14 | 75.06 | saada |
| bayt-bashir | بيت بشير | Bayt Bashīr | محافظة حجة | PPL | 80 | 10 | 75.22 | saada |
| at-tarf | الطرف | Aţ Ţarf | محافظة حجة | PPL | 80 | 10 | 75.76 | saada |
| al-himmah | الحمة | Al Ḩimmah | محافظة حجة | PPL | 80 | 10 | 76.06 | saada |
| al-qashaf | القشف | Al Qashaf | محافظة حجة | PPL | 80 | 16 | 76.22 | saada |
| qawm-ahmad | قوم أحمد | Qawm Aḩmad | محافظة حجة | PPL | 80 | 17 | 74.55 | saada |
| dhu-said | ذو سعيد | Dhū Sa‘īd | محافظة حجة | PPL | 80 | 51 | 74.02 | saada |
| al-khawar | الخوار | Al Khawār | محافظة حجة | PPL | 80 | 15 | 73.83 | saada |
| dhu-zaqlan | ذو زقلان | Dhū Zaqlān | محافظة حجة | PPL | 80 | 28 | 73.79 | saada |
| bayt-al-ghumri | بيت الغمرى | Bayt al Ghumrī | محافظة حجة | PPL | 80 | 20 | 73.72 | saada |
| ar-rawgh | الروغ | Ar Rawgh | محافظة حجة | PPL | 80 | 19 | 74.18 | saada |
| al-qari | القريع | Al Qarī‘ | محافظة حجة | PPL | 80 | 5 | 75.00 | saada |
| al-hawaya | الحوايا | Al Ḩawāyā | محافظة حجة | PPL | 80 | 5 | 74.44 | saada |
| al-qashab | القشب | Al Qashab | محافظة حجة | PPL | 80 | 4 | 76.84 | saada |
| al-udaynah | العدينة | Al ‘Udaynah | محافظة حجة | PPL | 80 | 8 | 76.65 | saada |
| al-himmah | الحمة | Al Ḩimmah | محافظة حجة | PPL | 80 | 6 | 74.93 | saada |
| bayt-ar-raydi | بيت الريدى | Bayt ar Raydī | محافظة حجة | PPL | 80 | 5 | 74.79 | saada |
| ash-shadnah | الشدنة | Ash Shadnah | محافظة حجة | PPL | 80 | 8 | 75.22 | saada |
| hayjat-al-huthi | هيجة الحوثى | Hayjat al Ḩūthī | محافظة حجة | PPL | 80 | 16 | 76.38 | saada |
| az-zuqqaq | الـزقاق | Az Zuqqāq | محافظة حجة | PPL | 80 | 1 | 63.59 | saada |
| khatwat-muzaym | خطوة مظيم | Khaţwat Muz̧aym | محافظة حجة | PPL | 80 | 1 | 64.27 | saada |
| al-hamhamah | الحمحمة | Al Ḩamḩamah | محافظة حجة | PPL | 80 | 1 | 64.51 | saada |
| shati-at-tamarah | شاطئ التمارة | Shāţi’ at Tamārah | محافظة حجة | PPL | 80 | 9 | 64.53 | saada |
| afawah | عفاوة | ‘Afāwah | محافظة حجة | PPL | 80 | 6 | 71.16 | saada |
| qarwa | قروا | Qarwā | محافظة حجة | PPL | 80 | 8 | 71.83 | saada |
| khishash | خشـاش | Khishāsh | محافظة حجة | PPL | 80 | 8 | 72.77 | saada |
| al-qabbah | القبــة | Al Qabbah | محافظة حجة | PPL | 80 | 2 | 72.36 | saada |
| masfa | مسفـع | Masfa‘ | محافظة حجة | PPL | 80 | 7 | 71.74 | saada |
| hadibat-awnah | حدبـة عونـة | Ḩadibat ‘Awnah | محافظة حجة | PPL | 80 | 5 | 71.93 | saada |
| al-maghdarah | المغدرة | Al Maghdarah | محافظة حجة | PPL | 80 | 11 | 72.02 | saada |
| jurban | جربان | Jurbān | محافظة حجة | PPL | 80 | 5 | 71.80 | saada |
| shaqma | شقماء | Shaqmā’ | محافظة حجة | PPL | 80 | 2 | 68.43 | saada |
| al-khadra | الخدراء | Al Khadrā’ | محافظة حجة | PPL | 80 | 8 | 71.88 | saada |
| ash-shahabiyah | الشهابية | Ash Shahābīyah | محافظة حجة | PPL | 80 | 1 | 71.70 | saada |
| qaim-al-hayf | قائم الحيف | Qā’im al Ḩayf | محافظة حجة | PPL | 80 | 4 | 70.81 | saada |
| al-maqla | المقلاع | Al Maqlā‘ | محافظة حجة | PPL | 80 | 3 | 70.47 | saada |
| al-maridah | المعرضة | Al Ma‘riḑah | محافظة حجة | PPL | 80 | 2 | 70.75 | saada |
| al-kunayf | الكنيف | Al Kunayf | محافظة حجة | PPL | 80 | 4 | 70.97 | saada |
| al-manyar | المنيار | Al Manyār | محافظة حجة | PPL | 80 | 2 | 71.34 | saada |
| al-ahdab | الأحداب | Al Aḩdāb | محافظة حجة | PPL | 80 | 2 | 71.90 | saada |
| az-zahirah | الظهرة | Az̧ Z̧ahirah | محافظة حجة | PPL | 80 | 1 | 72.16 | saada |
| ath-thahirah | الثاهرة | Ath Thāhirah | محافظة حجة | PPL | 80 | 10 | 72.14 | saada |
| al-mashwali | المشوالي | Al MashwālĪ | محافظة حجة | PPL | 80 | 1 | 69.91 | saada |
| al-hasimat | الحصمات | Al Ḩaşimāt | محافظة حجة | PPL | 80 | 2 | 69.21 | saada |
| sharqah | شرقة | Sharqah | محافظة حجة | PPL | 80 | 2 | 68.90 | saada |
| gharib-qardai | غارب قرداعى | Ghārib Qardā‘ī | محافظة حجة | PPL | 80 | 2 | 69.02 | saada |
| al-aqabi | العقبي | Al ‘Aqabī | محافظة حجة | PPL | 80 | 2 | 69.23 | saada |
| al-hifa | الحفاء | Al Ḩifā’ | محافظة حجة | PPL | 80 | 4 | 69.34 | saada |
| al-matfayah | المطفاية | Al Maţfāyah | محافظة حجة | PPL | 80 | 1 | 69.36 | saada |
| al-habil | الحبيل | Al Ḩabīl | محافظة حجة | PPL | 80 | 3 | 69.28 | saada |
| dhira-bin-ayad | ذراع بن عيد | Dhirā‘ Bin ‘Ayad | محافظة حجة | PPL | 80 | 6 | 71.40 | saada |
| ad-dahah | الدحة | Ad Daḩah | محافظة حجة | PPL | 80 | 3 | 72.54 | saada |
| mahall-bin-naji | محل بن ناجي | Maḩall Bin Nājī | محافظة حجة | PPL | 80 | 8 | 72.51 | saada |
| dhira-al-humaydi | ذراع الحميدى | Dhirā‘ al Ḩumaydī | محافظة حجة | PPL | 80 | 1 | 72.10 | saada |
| al-majbar | المجبر | Al Majbar | محافظة حجة | PPL | 80 | 1 | 72.69 | saada |
| qarn-awbal | قرن أوبل | Qarn Awbal | محافظة حجة | PPL | 80 | 1 | 73.05 | saada |
| al-hisar | الحصار | Al Ḩişār | محافظة حجة | PPL | 80 | 4 | 81.41 | saada |
| ad-dabah | الدبعة | Ad Dab‘ah | محافظة حجة | PPL | 80 | 9 | 83.24 | saada |
| an-nasab | النصب | An Naşab | محافظة حجة | PPL | 80 | 9 | 83.26 | saada |
| al-mashat | المسحط | Al Masḩaţ | محافظة حجة | PPL | 80 | 19 | 84.74 | saada |
| al-fasah | الفصعة | Al Faş‘ah | محافظة حجة | PPL | 80 | 10 | 85.00 | saada |
| al-balawilah | البلاولة | Al Balāwilah | محافظة حجة | PPL | 80 | 7 | 84.01 | saada |
| maqahilah | مقاحلة | Maqāḩilah | محافظة حجة | PPL | 80 | 8 | 83.38 | saada |
| damnat-as-saynah | دمنة السينة | Damnat as Saynah | محافظة حجة | PPL | 80 | 4 | 82.89 | saada |
| mafjar-maqrud | مفجر مقرود | Mafjar Maqrūd | محافظة حجة | PPL | 80 | 3 | 86.21 | saada |
| ad-dakhni | الدخني | Ad Dakhnī | محافظة حجة | PPL | 80 | 10 | 87.83 | saada |
| al-hadibah | الحدبة | Al Ḩadibah | محافظة حجة | PPL | 80 | 1 | 91.12 | saada |
| al-mamlah | المملاح | Al Mamlāḩ | محافظة حجة | PPL | 80 | 4 | 90.29 | saada |
| mishaf | المشاف | Mishāf | محافظة حجة | PPL | 80 | 17 | 89.53 | saada |
| gharib-siari | غارب سعاري | Ghārib Si‘ārī | محافظة حجة | PPL | 80 | 11 | 85.20 | saada |
| ad-duwaymah | الدويمة | Ad Duwaymah | محافظة حجة | PPL | 80 | 12 | 85.52 | saada |
| al-qashari | القشاري | Al Qashārī | محافظة حجة | PPL | 80 | 7 | 85.70 | saada |
| ribakhah | رباخة | Ribākhah | محافظة حجة | PPL | 80 | 8 | 90.93 | saada |
| ar-rawha | الروحا | Ar Rawḩā | محافظة حجة | PPL | 80 | 14 | 83.48 | saada |
| damsh-al-fawiyah | دمش الفاوية | Damsh al Fāwīyah | محافظة حجة | PPL | 80 | 4 | 90.43 | saada |
| ad-dakmah | الدكمة | Ad Dakmah | محافظة حجة | PPL | 80 | 3 | 90.34 | saada |
| mijran-maqbal | مجران مقبل | Mijrān Maqbal | محافظة حجة | PPL | 80 | 3 | 90.15 | saada |
| arid-abu-rashid | عارض أبو رشيد | ‘Āriḑ Abū Rashīd | محافظة حجة | PPL | 80 | 2 | 90.86 | saada |
| al-jadal | الجدل | Al Jadal | محافظة حجة | PPL | 80 | 7 | 90.19 | saada |
| awas-al-kahal | عوص الكحل | ‘Awaş al Kaḩal | محافظة حجة | PPL | 80 | 9 | 89.43 | saada |
| shiblah | شبلة | Shiblah | محافظة حجة | PPL | 80 | 11 | 89.09 | saada |
| hulayl-al-maydarah | حليل الميدارة | Ḩulayl al Maydārah | محافظة حجة | PPL | 80 | 5 | 90.45 | saada |
| al-anibat | العنبات | Al ‘Anibāt | محافظة حجة | PPL | 80 | 6 | 89.86 | saada |
| an-najdayn | النجدين | An Najdayn | محافظة حجة | PPL | 80 | 4 | 89.92 | saada |
| rakib-al-akshi | راكب العكشي | Rākib al ‘Akshī | محافظة حجة | PPL | 80 | 50 | 88.74 | saada |
| hudayt-mawi | حديت معوي | Ḩudayt Ma‘wī | محافظة حجة | PPL | 80 | 4 | 88.65 | saada |
| al-ubaydiyah | العبيدية | Al ‘Ubaydīyah | محافظة حجة | PPL | 80 | 5 | 88.38 | saada |
| qarn-al-khawf | قرن الخوف | Qarn al Khawf | محافظة حجة | PPL | 80 | 27 | 87.25 | saada |
| al-awahimah | العواهمة | Al ‘Awāhimah | محافظة حجة | PPL | 80 | 4 | 88.00 | saada |
| ad-dihanah | الدحانة | Ad Diḩānah | محافظة حجة | PPL | 80 | 8 | 88.23 | saada |
| al-ujayrat | العجيرات | Al ‘Ujayrāt | محافظة حجة | PPL | 80 | 7 | 87.77 | saada |
| al-jaabirah | الجعابرة | Al Ja‘ābirah | محافظة حجة | PPL | 80 | 11 | 87.86 | saada |
| naqil | نقيل | Naqīl | محافظة حجة | PPL | 80 | 9 | 87.16 | saada |
| al-madinah | المدينة | Al Madīnah | محافظة حجة | PPL | 80 | 15 | 88.09 | saada |
| al-wazir | الوزير | Al Wazīr | محافظة حجة | PPL | 80 | 21 | 88.38 | saada |
| dimnat-ad-dimanah | دمنة الدمانة | Dimnat ad Dimānah | محافظة حجة | PPL | 80 | 3 | 88.19 | saada |
| maqjar-ar-rakab | مقجر الركب | Maqjar ar Rakab | محافظة حجة | PPL | 80 | 16 | 86.80 | saada |
| al-masharimah | المشارمة | Al Mashārimah | محافظة حجة | PPL | 80 | 12 | 86.04 | saada |
| abu-sadah | أبو سداح | Abū Sadāḩ | محافظة حجة | PPL | 80 | 6 | 86.50 | saada |
| gharb-ath-thaghra | غرب الثغراء | Gharb ath Thaghrā’ | محافظة حجة | PPL | 80 | 14 | 89.58 | saada |
| ad-dabar | الضبر | Aḑ Ḑabar | محافظة حجة | PPL | 80 | 2 | 89.77 | saada |
| al-hinawishah | الحناوشة | Al Ḩināwishah | محافظة حجة | PPL | 80 | 24 | 90.11 | saada |
| al-qarah | القعرة | Al Qa‘rah | محافظة حجة | PPL | 80 | 10 | 84.63 | saada |
| al-khadimah | الخدمة | Al Khadimah | محافظة حجة | PPL | 80 | 8 | 84.63 | saada |
| ad-dimagh | الدماغ | Ad Dimāgh | محافظة حجة | PPL | 80 | 3 | 85.82 | saada |
| qalat-ash-shuayb | قلعة الشعيب | Qal‘at ash Shu‘ayb | محافظة حجة | PPL | 80 | 3 | 85.77 | saada |
| qalat-al-jannah | قلعة الجنة | Qal‘at al Jannah | محافظة حجة | PPL | 80 | 3 | 85.97 | saada |
| bayn-al-buyut | بين البيوت | Bayn al Buyūt | محافظة حجة | PPL | 80 | 6 | 86.17 | saada |
| as-sawdah | السودة | As Sawdah | محافظة حجة | PPL | 80 | 2 | 81.07 | saada |
| gharib-muraym | غارب مريم | Ghārib Muraym | محافظة حجة | PPL | 80 | 1 | 82.96 | saada |
| al-kathab | الكعثب | Al Ka‘thab | محافظة حجة | PPL | 80 | 10 | 81.44 | saada |
| sirar | صرار | Şirār | محافظة حجة | PPL | 80 | 3 | 81.35 | saada |
| qaraah | قراعة | Qarā‘ah | محافظة حجة | PPL | 80 | 4 | 81.17 | saada |
| al-mustaliqah | المستلقة | Al Mustaliqah | محافظة حجة | PPL | 80 | 4 | 81.40 | saada |
| talan | طلان | Ţalān | محافظة حجة | PPL | 80 | 2 | 81.30 | saada |
| al-qubbah | القبة | Al Qubbah | محافظة حجة | PPL | 80 | 3 | 81.58 | saada |
| shawf-biqam | شوف بقام | Shawf Biqām | محافظة حجة | PPL | 80 | 1 | 81.66 | saada |
| bayt-al-mahdi | بيت المهدى | Bayt al Mahdī | محافظة حجة | PPL | 80 | 4 | 81.74 | saada |
| al-qilah | القلة | Al Qilah | محافظة حجة | PPL | 80 | 2 | 81.96 | saada |
| an-nuwayrah | النويرة | An Nuwayrah | محافظة حجة | PPL | 80 | 1 | 82.05 | saada |
| ar-ruknah | الركنة | Ar Ruknah | محافظة حجة | PPL | 80 | 2 | 82.30 | saada |
| al-maqad | المقعد | Al Maq‘ad | محافظة حجة | PPL | 80 | 1 | 82.50 | saada |
| al-mirbah | المرباح | Al Mirbāḩ | محافظة حجة | PPL | 80 | 2 | 82.71 | saada |
| al-jaradi | الجراضى | Al Jarāḑī | محافظة حجة | PPL | 80 | 8 | 82.70 | saada |
| al-ashaish | العشائش | Al ‘Ashā’ish | محافظة حجة | PPL | 80 | 4 | 82.86 | saada |
| qalwa-sari | قلواع سارى | Qalwā‘ Sārī | محافظة حجة | PPL | 80 | 2 | 82.95 | saada |
| al-marawi | المرعوى | Al Mara‘wī | محافظة حجة | PPL | 80 | 5 | 82.74 | saada |
| at-tawaf-an-nafirah | الطوف النافرة | Aţ Ţawaf an Nāfirah | محافظة حجة | PPL | 80 | 4 | 82.72 | saada |
| al-hawsh | الحوش | Al Ḩawsh | محافظة حجة | PPL | 80 | 5 | 82.63 | saada |
| jism-al-athirah | جشم العاثرة | Jism al ‘Āthirah | محافظة حجة | PPL | 80 | 3 | 82.68 | saada |
| al-milat | الملاط | Al Milāţ | محافظة حجة | PPL | 80 | 2 | 82.84 | saada |
| rahanah | راحانة | Rāḩānah | محافظة حجة | PPL | 80 | 2 | 83.24 | saada |
| gharib-an-nayd | غارب النيد | Ghārib an Nayd | محافظة حجة | PPL | 80 | 2 | 84.72 | saada |
| ad-dahrah | الدحرة | Ad Daḩrah | محافظة حجة | PPL | 80 | 10 | 84.87 | saada |
| haqq-al-misallaq | حق المسالق | Ḩaqq al Misāllaq | محافظة حجة | PPL | 80 | 2 | 85.57 | saada |
| khirab-araj | خراب عراج | Khirāb ‘Arāj | محافظة حجة | PPL | 80 | 2 | 85.18 | saada |
| qusayyat-baqshah | قصية بقشة | Quşayyat Baqshah | محافظة حجة | PPL | 80 | 3 | 83.51 | saada |
| rakab-al-jurf | ركب الجرف | Rakab al Jurf | محافظة حجة | PPL | 80 | 6 | 82.31 | saada |
| al-mishal | المشال | Al Mishāl | محافظة حجة | PPL | 80 | 8 | 81.58 | saada |
| as-sanawl | السنعول | As San‘awl | محافظة حجة | PPL | 80 | 1 | 82.77 | saada |
| al-mizfan | المزفن | Al Mizfan | محافظة حجة | PPL | 80 | 4 | 80.97 | saada |
| ayyashu | عياشو | ‘Ayyāshū | محافظة حجة | PPL | 80 | 3 | 80.83 | saada |
| at-tujbah | الطخبة | Aţ Ţujbah | محافظة حجة | PPL | 80 | 3 | 81.43 | saada |
| al-mashruah | المشروعة | Al Mashrū‘ah | محافظة حجة | PPL | 80 | 2 | 80.96 | saada |
| al-qufayl | القفيل | Al Qufayl | محافظة حجة | PPL | 80 | 6 | 80.94 | saada |
| al-karawi | الكراوي | Al Karāwī | محافظة حجة | PPL | 80 | 7 | 80.71 | saada |
| as-sawad | السود | As Sawad | محافظة حجة | PPL | 80 | 2 | 81.23 | saada |
| bayt-ghulmas | بيت غلماس | Bayt Ghulmās | محافظة حجة | PPL | 80 | 1 | 81.33 | saada |
| wira-al-maqbal | وراء المقبل | Wirā’ al Maqbal | محافظة حجة | PPL | 80 | 16 | 81.71 | saada |
| al-awsat | الأوسط | Al Awsaţ | محافظة حجة | PPL | 80 | 4 | 81.37 | saada |
| shufi-habbah | شوفى حبة | Shūfī Ḩabbah | محافظة حجة | PPL | 80 | 3 | 80.65 | saada |
| al-habit | الحابط | Al Ḩābiţ | محافظة حجة | PPL | 80 | 5 | 80.36 | saada |
| adur-al-awas | عضور العوص | ‘Aḑūr al ‘Awaş | محافظة حجة | PPL | 80 | 17 | 81.83 | saada |
| ghizalah | غزالة | Ghizālah | محافظة حجة | PPL | 80 | 3 | 81.86 | saada |
| shaghir | شاغر | Shāghir | محافظة حجة | PPL | 80 | 2 | 81.54 | saada |
| al-hurayb | الحريب | Al Ḩurayb | محافظة حجة | PPL | 80 | 26 | 80.58 | saada |
| as-salah | الصلاح | Aş Şalāḩ | محافظة حجة | PPL | 80 | 3 | 80.63 | saada |
| al-khadra | الخدراء | Al Khadrā’ | محافظة حجة | PPL | 80 | 5 | 80.70 | saada |
| al-kuhayla | الكحيلاء | Al Kuhaylā’ | محافظة حجة | PPL | 80 | 3 | 80.51 | saada |
| gharib-qurshan | غارب قرشان | Ghārib Qurshān | محافظة حجة | PPL | 80 | 4 | 80.64 | saada |
| duraynah | درينة | Duraynah | محافظة حجة | PPL | 80 | 3 | 80.71 | saada |
| al-majatir | المجعتر | Al Maj‘atir | محافظة حجة | PPL | 80 | 3 | 81.15 | saada |
| al-aqiyah | العقية | Al ‘Aqīyah | محافظة حجة | PPL | 80 | 6 | 81.39 | saada |
| al-kadhibah | الكذبة | Al Kadhibah | محافظة حجة | PPL | 80 | 2 | 81.17 | saada |
| al-musalayh | المصاليح | Al Muşālayḩ | محافظة حجة | PPL | 80 | 10 | 81.18 | saada |
| al-qahri | القهري | Al Qahrī | محافظة حجة | PPL | 80 | 6 | 81.02 | saada |
| al-wasim | الوسم | Al Wasim | محافظة حجة | PPL | 80 | 3 | 80.89 | saada |
| al-muslih | المصلح | Al Muşliḩ | محافظة حجة | PPL | 80 | 2 | 80.92 | saada |
| al-ghumrah | الغمرة | Al Ghumrah | محافظة حجة | PPL | 80 | 1 | 80.55 | saada |
| al-madandanah | المدندنة | Al Madandanah | محافظة حجة | PPL | 80 | 8 | 81.34 | saada |
| al-jirfa | الجرفاء | Al Jirfā’ | محافظة حجة | PPL | 80 | 1 | 80.59 | saada |
| ghuraybu | غريبو | Ghuraybū | محافظة حجة | PPL | 80 | 1 | 81.77 | saada |
| ash-shawaji | الشواجع | Ash Shawāji‘ | محافظة حجة | PPL | 80 | 1 | 80.30 | saada |
| ar-rushnah | الرشنة | Ar Rushnah | محافظة حجة | PPL | 80 | 6 | 81.69 | saada |
| al-wasatah | الوسطة | Al Wasaţah | محافظة حجة | PPL | 80 | 6 | 80.39 | saada |
| al-hajir | الهجر | Al Hajir | محافظة حجة | PPL | 80 | 8 | 87.17 | saada |
| al-madirah | المديرة | Al Madīrah | محافظة حجة | PPL | 80 | 8 | 87.48 | saada |
| al-jurfah | الجرفة | Al Jurfah | محافظة حجة | PPL | 80 | 2 | 87.58 | saada |
| al-mazwar | المزوار | Al Mazwār | محافظة حجة | PPL | 80 | 10 | 87.89 | saada |
| ar-ratibiyah | الرتبية | Ar Ratibīyah | محافظة حجة | PPL | 80 | 6 | 88.52 | saada |
| al-muqahilah | المقاحلة | Al Muqāḩilah | محافظة حجة | PPL | 80 | 6 | 83.41 | saada |
| gharib-al-masqa | غارب المصقع | Ghārib al Maşqa‘ | محافظة حجة | PPL | 80 | 4 | 83.51 | saada |
| qaryat-ar-ruwasah | قرية الرواسة | Qaryat ar Ruwāsah | محافظة حجة | PPL | 80 | 8 | 85.61 | saada |
| al-mishaf | المشاف | Al Mishāf | محافظة حجة | PPL | 80 | 4 | 86.11 | saada |
| al-hidaya-al-yamaniyah | الحدايا اليمانية | Al Ḩidāyā al Yamānīyah | محافظة حجة | PPL | 80 | 9 | 87.02 | saada |
| al-lakuk | اللكوك | Al Lakūk | محافظة حجة | PPL | 80 | 4 | 86.34 | saada |
| naqil-ar-rifaf | نقيل الرفاف | Naqīl ar Rifāf | محافظة حجة | PPL | 80 | 6 | 86.91 | saada |
| shirak-al-adinah | شراك العدنة | Shirāk al ‘Adinah | محافظة حجة | PPL | 80 | 2 | 86.39 | saada |
| al-qutayn | القطين | Al Quţayn | محافظة حجة | PPL | 80 | 7 | 87.38 | saada |
| mawaj | معوج | Ma‘waj | محافظة حجة | PPL | 80 | 4 | 87.92 | saada |
| mawkhir | الموخر | Mawkhir | محافظة حجة | PPL | 80 | 11 | 88.53 | saada |
| al-turdimah | التردمة | Al Turdimah | محافظة حجة | PPL | 80 | 5 | 88.95 | saada |
| al-musnayn | المسنين | Al Musnayn | محافظة حجة | PPL | 80 | 3 | 89.27 | saada |
| al-hidaya-ash-shamiyah | الحدايا الشامية | Al Ḩidāyā ash Shāmīyah | محافظة حجة | PPL | 80 | 9 | 86.18 | saada |
| al-qasabiyah | القصيبة | Al Qaşabīyah | محافظة حجة | PPL | 80 | 3 | 88.94 | saada |
| hiran | هران | Hirān | محافظة حجة | PPL | 80 | 4 | 88.53 | saada |
| al-mirkabah | المركابة | Al Mirkābah | محافظة حجة | PPL | 80 | 3 | 88.66 | saada |
| qayyim-ghayshim | قيم غيثيم | Qayyim Ghayshīm | محافظة حجة | PPL | 80 | 7 | 88.42 | saada |
| qaymat-al-majni | قيمة المجني | Qaymat al Majnī | محافظة حجة | PPL | 80 | 2 | 88.65 | saada |
| falah-al-arih | فلاح العرح | Falāḩ al ‘Ariḩ | محافظة حجة | PPL | 80 | 4 | 89.38 | saada |
| al-mararah-wa-al-yamna | المرارة واليمناء | Al Marārah wa al Yamnā’ | محافظة حجة | PPL | 80 | 8 | 88.01 | saada |
| al-hanidh | الحانذ | Al Ḩānidh | محافظة حجة | PPL | 80 | 4 | 87.98 | saada |
| al-mararah-al-ulya | المرارة العليا | Al Marārah al ‘Ulyā | محافظة حجة | PPL | 80 | 13 | 87.71 | saada |
| al-mararah-as-sufla | المرارة السفلى | Al Marārah as Suflá | محافظة حجة | PPL | 80 | 15 | 87.78 | saada |
| as-sanif | الصنف | Aş Şanif | محافظة حجة | PPL | 80 | 9 | 86.97 | saada |
| al-manbaah | المنبعة | Al Manba‘ah | محافظة حجة | PPL | 80 | 8 | 86.45 | saada |
| al-wasit | الواسط | Al Wāsiţ | محافظة حجة | PPL | 80 | 3 | 85.90 | saada |
| ash-shabniyah | الشبنية | Ash Shabnīyah | محافظة حجة | PPL | 80 | 1 | 85.44 | saada |
| al-aruf | العرعوف | Al ‘Ar‘ūf | محافظة حجة | PPL | 80 | 9 | 86.17 | saada |
| umm-al-fajil | أم الفجل | Umm al Fajil | محافظة حجة | PPL | 80 | 3 | 88.24 | saada |
| bahrah | بحرة | Baḩrah | محافظة حجة | PPL | 80 | 5 | 88.96 | saada |
| qaryat-muanis | قرية مؤانس | Qaryat Mu’ānis | محافظة حجة | PPL | 80 | 3 | 86.41 | saada |
| al-qaynbirah | القينبرة | Al Qaynbirah | محافظة حجة | PPL | 80 | 3 | 86.92 | saada |
| al-hawq-al-gharbiyah | الحوق الغربي | Al Ḩawq al Gharbīyah | محافظة حجة | PPL | 80 | 11 | 86.54 | saada |
| darijat-ash-sharif | درجة الشريف | Darijat ash Sharīf | محافظة حجة | PPL | 80 | 10 | 86.47 | saada |
| qaryat-al-khamis | قرية الخميس | Qaryat al Khamīs | محافظة حجة | PPL | 80 | 3 | 85.51 | saada |
| jarwad | جارود | Jārwad | محافظة حجة | PPL | 80 | 10 | 85.42 | saada |
| al-mughaysilah | المغيسلة | Al Mughaysilah | محافظة حجة | PPL | 80 | 15 | 85.30 | saada |
| al-jihafir | الجهافر | Al Jihāfir | محافظة حجة | PPL | 80 | 11 | 84.31 | saada |
| al-mahufah | المحوفة | Al Maḩūfah | محافظة حجة | PPL | 80 | 6 | 84.20 | saada |
| al-jarubah | الجروبة | Al Jarūbah | محافظة حجة | PPL | 80 | 11 | 84.79 | saada |
| ar-rifaf | الرفاف | Ar Rifāf | محافظة حجة | PPL | 80 | 5 | 82.55 | saada |
| hadibat-al-bissah | حدبة البسة | Ḩadibat al Bissah | محافظة حجة | PPL | 80 | 6 | 82.79 | saada |
| ash-shala | الشالع | Ash Shāla‘ | محافظة حجة | PPL | 80 | 10 | 82.72 | saada |
| al-mahsan | المحصن | Al Maḩşan | محافظة حجة | PPL | 80 | 4 | 82.95 | saada |
| an-nid | النيــد | An Nīd | محافظة حجة | PPL | 80 | 14 | 82.96 | saada |
| al-jafr | الجافر | Al Jāfr | محافظة حجة | PPL | 80 | 8 | 83.04 | saada |
| al-maghsalah | المغسالة | Al Maghsālah | محافظة حجة | PPL | 80 | 14 | 83.13 | saada |
| bayt-al-wasit | بيت الواسط | Bayt al Wāsiţ | محافظة حجة | PPL | 80 | 2 | 82.94 | saada |
| makhdir | مخدر | Makhdir | محافظة حجة | PPL | 80 | 6 | 84.35 | saada |
| al-hatul | الحتول | Al Ḩatūl | محافظة حجة | PPL | 80 | 3 | 84.16 | saada |
| hawd-al-majdur | حود المجدور | Ḩawd al Majdūr | محافظة حجة | PPL | 80 | 2 | 82.90 | saada |
| al-malitah | الملطة | Al Maliţah | محافظة حجة | PPL | 80 | 3 | 83.34 | saada |
| malit-al-hajar | مالط الهجر | Māliţ al Hajar | محافظة حجة | PPL | 80 | 5 | 83.71 | saada |
| al-mathwah | المثوة | Al Mathwah | محافظة حجة | PPL | 80 | 4 | 83.77 | saada |
| ash-sharul | الشرول | Ash Sharūl | محافظة حجة | PPL | 80 | 3 | 84.00 | saada |
| al-muqalit | المقالط | Al Muqāliţ | محافظة حجة | PPL | 80 | 6 | 84.06 | saada |
| jashimi-al-mahall | جشمي المحل | Jashimī al Maḩall | محافظة حجة | PPL | 80 | 2 | 84.57 | saada |
| khirab-silbah | خراب صلبة | Khirāb Şilbah | محافظة حجة | PPL | 80 | 2 | 84.71 | saada |
| al-madawilah | المدولة | Al Madawilah | محافظة حجة | PPL | 80 | 3 | 83.38 | saada |
| al-mirbakh | المربخ | Al Mirbakh | محافظة حجة | PPL | 80 | 7 | 83.70 | saada |
| al-qahir | القهـر | Al Qahir | محافظة حجة | PPL | 80 | 4 | 83.59 | saada |
| qayhimah | قيهمــة | Qayhimah | محافظة حجة | PPL | 80 | 3 | 83.52 | saada |
| al-wasit | الواسط | Al Wāsiţ | محافظة حجة | PPL | 80 | 2 | 83.64 | saada |
| al-jatmurah | الجتمورة | Al Jatmūrah | محافظة حجة | PPL | 80 | 3 | 84.73 | saada |
| al-atibah | العتبة | Al ‘Atibah | محافظة حجة | PPL | 80 | 10 | 83.18 | saada |
| ad-damun | الدمون | Ad Damūn | محافظة حجة | PPL | 80 | 3 | 84.26 | saada |
| al-hajib | الحاجب | Al Ḩājib | محافظة حجة | PPL | 80 | 17 | 84.81 | saada |
| gharib-jirbah | غارب جربة | Ghārib Jirbah | محافظة حجة | PPL | 80 | 7 | 85.18 | saada |
| al-qatib | القتب | Al Qatib | محافظة حجة | PPL | 80 | 5 | 84.78 | saada |
| zubaydah | زبيدة | Zubaydah | محافظة حجة | PPL | 80 | 3 | 84.31 | saada |
| al-jufaynat | الجفينات | Al Jufaynāt | محافظة حجة | PPL | 80 | 3 | 84.89 | saada |
| al-qatat | القطعات | Al Qaţ‘āt | محافظة حجة | PPL | 80 | 7 | 85.14 | saada |
| al-mawqad | الموقد | Al Mawqad | محافظة حجة | PPL | 80 | 3 | 84.55 | saada |
| al-qamamah | القمامة | Al Qamāmah | محافظة حجة | PPL | 80 | 8 | 84.37 | saada |
| al-habwah | الحبوة | Al Ḩabwah | محافظة حجة | PPL | 80 | 1 | 83.61 | saada |
| qaram | قارم | Qāram | محافظة حجة | PPL | 80 | 4 | 84.04 | saada |
| al-hijrah | الهجرة | Al Hijrah | محافظة حجة | PPL | 80 | 4 | 83.96 | saada |
| ash-shirak | الشراك | Ash Shirāk | محافظة حجة | PPL | 80 | 4 | 83.89 | saada |
| gharib-marqam | غارب مرقم | Ghārib Marqam | محافظة حجة | PPL | 80 | 3 | 84.12 | saada |
| al-khadir | الخدر | Al Khadir | محافظة حجة | PPL | 80 | 5 | 83.97 | saada |
| al-maarid | المعاريض | Al Ma‘ārīḑ | محافظة حجة | PPL | 80 | 2 | 83.89 | saada |
| bayt-salah | بيت صلاح | Bayt Şalāḩ | محافظة حجة | PPL | 80 | 2 | 83.41 | saada |
| al-judamayd | الجداميد | Al Judāmayd | محافظة حجة | PPL | 80 | 6 | 83.44 | saada |
| ash-sharqiyah | الشرقية | Ash Sharqīyah | محافظة حجة | PPL | 80 | 6 | 83.15 | saada |
| kanan | كنان | Kanān | محافظة حجة | PPL | 80 | 5 | 83.78 | saada |
| mithrarah | مثرارة | Mithrārah | محافظة حجة | PPL | 80 | 4 | 83.95 | saada |
| al-wasit | الواسط | Al Wāsiţ | محافظة حجة | PPL | 80 | 4 | 83.71 | saada |
| al-irq-al-asfal | العرق الأسفل | Al ‘Irq al Asfal | محافظة حجة | PPL | 80 | 10 | 84.05 | saada |
| dhira-as-siyab | ذراع الصياب | Dhirā‘ aş Şiyāb | محافظة حجة | PPL | 80 | 1 | 83.42 | saada |
| as-sawda | السودى | As Sawdá | محافظة حجة | PPL | 80 | 9 | 85.33 | saada |
| ambarat | أمبارات | Ambārāt | محافظة حجة | PPL | 80 | 2 | 85.28 | saada |
| dabu | دابو | Dābū | محافظة حجة | PPL | 80 | 4 | 86.11 | saada |
| al-mulayha | المليحا | Al Mulayḩā | محافظة حجة | PPL | 80 | 9 | 86.18 | saada |
| al-bilda | البلدا | Al Bildā | محافظة حجة | PPL | 80 | 5 | 86.86 | saada |
| al-hajwah | الحجوة | Al Ḩajwah | محافظة حجة | PPL | 80 | 4 | 86.02 | saada |
| gharib-mayzab | غارب ميزاب | Ghārib Mayzāb | محافظة حجة | PPL | 80 | 14 | 85.53 | saada |
| talan | طلان | Ţalān | محافظة حجة | PPL | 80 | 2 | 85.30 | saada |
| gharib-dahiyah | غارب ضهية | Ghārib Ḑahīyah | محافظة حجة | PPL | 80 | 4 | 85.09 | saada |
| al-arqub | العرقوب | Al ‘Arqūb | محافظة حجة | PPL | 80 | 4 | 84.58 | saada |
| al-kiruf | الكروف | Al Kirūf | محافظة حجة | PPL | 80 | 2 | 84.16 | saada |
| az-zabiyah | الزبية | Az Zabīyah | محافظة حجة | PPL | 80 | 6 | 86.54 | saada |
| al-jamlul | الجملول | Al Jamlūl | محافظة حجة | PPL | 80 | 2 | 85.74 | saada |
| al-hatrush | الحتروش | Al Ḩatrūsh | محافظة حجة | PPL | 80 | 2 | 86.02 | saada |
| jurayb-banah | جريب بنة | Jurayb Banah | محافظة حجة | PPL | 80 | 1 | 85.83 | saada |
| ad-darah-al-gharbiyah | الدارة الغربية | Ad Dārah al Gharbīyah | محافظة حجة | PPL | 80 | 13 | 83.21 | saada |
| as-sawani | الصوانع | Aş Şawāni‘ | محافظة حجة | PPL | 80 | 1 | 83.52 | saada |
| al-hajab | الحاجب | Al Ḩājab | محافظة حجة | PPL | 80 | 3 | 84.79 | saada |
| al-mishraqi | المشرقي | Al Mishraqī | محافظة حجة | PPL | 80 | 3 | 84.81 | saada |
| al-athilah | الأثلة | Al Athilah | محافظة حجة | PPL | 80 | 4 | 85.22 | saada |
| tawaf-al-mishah | طوف المشاح | Ţawaf al Mishāḩ | محافظة حجة | PPL | 80 | 3 | 83.40 | saada |
| al-maswaq | المسوق | Al Maswaq | محافظة حجة | PPL | 80 | 4 | 84.02 | saada |
| al-maghribiyah | المغربية | Al Maghribīyah | محافظة حجة | PPL | 80 | 4 | 85.60 | saada |
| al-midayir | المداير | Al Midāyir | محافظة حجة | PPL | 80 | 5 | 87.11 | saada |
| qaymat-aradif | قيمة عرادف | Qaymat ‘Arādif | محافظة حجة | PPL | 80 | 7 | 84.45 | saada |
| dhira-mishab | ذراع مشعاب | Dhirā‘ Mish‘āb | محافظة حجة | PPL | 80 | 3 | 85.71 | saada |
| ash-sharab | الشارب | Ash Shārab | محافظة حجة | PPL | 80 | 4 | 76.03 | saada |
| gharib-al-hawak | غارب الحواك | Ghārib al Ḩawāk | محافظة حجة | PPL | 80 | 9 | 76.11 | saada |
| ash-shawaf | الشوف | Ash Shawaf | محافظة حجة | PPL | 80 | 2 | 74.86 | saada |
| al-amishah | العمشة | Al ‘Amishah | محافظة حجة | PPL | 80 | 11 | 83.39 | saada |
| al-mitrawisah | المتراوسة | Al Mitrāwisah | محافظة حجة | PPL | 80 | 18 | 89.81 | saada |
| asfal-al-qaryah | أسفل القرية | Asfal al Qaryah | محافظة حجة | PPL | 80 | 1 | 82.16 | saada |
| al-muflitah | المفلطح | Al Mufliţaḩ | محافظة حجة | PPL | 80 | 19 | 82.69 | saada |
| as-safir | الصفير | Aş Şafīr | محافظة حجة | PPL | 80 | 3 | 83.68 | saada |
| dhira-al-qaryah | ذراع القرية | Dhirā‘ al Qaryah | محافظة حجة | PPL | 80 | 3 | 84.49 | saada |
| gharib-al-manzalah | غارب المنزالة | Ghārib al Manzālah | محافظة حجة | PPL | 80 | 2 | 85.01 | saada |
| dhira-ash-shaf | ذراع الشعف | Dhirā‘ ash Sha‘f | محافظة حجة | PPL | 80 | 1 | 80.80 | saada |
| qalat-al-mazbar | قلعة المزبر | Qal‘at al Mazbar | محافظة حجة | PPL | 80 | 2 | 80.45 | saada |
| al-mikhyam | المخيام | Al Mikhyām | محافظة حجة | PPL | 80 | 3 | 81.59 | saada |
| al-qalah-al-hamra | القلعة الحمراء | Al Qal‘ah al Ḩamrā’ | محافظة حجة | PPL | 80 | 3 | 86.65 | saada |
| al-hawq-ash-sharqi | الحوق الشرقي | Al Ḩawq ash Sharqī | محافظة حجة | PPL | 80 | 2 | 86.56 | saada |
| as-sawdi-al-ghawiyah | السودي الغاوية | As Sawdī al Ghāwīyah | محافظة حجة | PPL | 80 | 5 | 84.88 | saada |
| al-uqla | العقلاء | Al ‘Uqlā’ | محافظة حجة | PPL | 80 | 1 | 83.24 | saada |
| al-musayniah | المصينعة | Al Muşayni‘ah | محافظة حجة | PPL | 80 | 1 | 85.37 | saada |
| al-qaim | القائم | Al Qā’im | محافظة حجة | PPL | 80 | 14 | 86.85 | saada |
| al-marwa | المروى | Al Marwá | محافظة حجة | PPL | 80 | 7 | 86.05 | saada |
| gharib-majar | غارب مجعر | Ghārib Maj‘ar | محافظة حجة | PPL | 80 | 22 | 82.80 | saada |
| mahrakah | محركة | Maḩrakah | محافظة حجة | PPL | 80 | 11 | 80.90 | saada |
| dimnat-ghallah | دمنة غلة | Dimnat Ghallah | محافظة حجة | PPL | 80 | 4 | 80.83 | saada |
| al-miqshab | المقشاب | Al Miqshāb | محافظة حجة | PPL | 80 | 13 | 80.13 | saada |
| al-ghurzah | الغرزة | Al Ghurzah | محافظة حجة | PPL | 80 | 12 | 80.91 | saada |
| al-maqir | المعقر | Al Ma‘qir | محافظة حجة | PPL | 80 | 6 | 80.58 | saada |
| ash-shajaah | الشجاعة | Ash Shajā‘ah | محافظة حجة | PPL | 80 | 1 | 80.47 | saada |
| shati-akkash | شاطئ عكاش | Shāţi’ ‘Akkāsh | محافظة حجة | PPL | 80 | 8 | 80.61 | saada |
| qarn-al-mawt | قرن الموت | Qarn al Mawt | محافظة حجة | PPL | 80 | 5 | 80.66 | saada |
| al-jarf-al-gharbi | الجرف الغربي | Al Jarf al Gharbī | محافظة حجة | PPL | 80 | 8 | 81.36 | saada |
| al-jarf-ash-sharqi | الجرف الشرقية | Al Jarf ash Sharqī | محافظة حجة | PPL | 80 | 2 | 81.13 | saada |
| as-sawan | الصوان | Aş Şawān | محافظة حجة | PPL | 80 | 9 | 81.91 | saada |
| khafat-ad-dadifah | خافة الددفة | Khāfat ad Dadifah | محافظة حجة | PPL | 80 | 2 | 81.89 | saada |
| qila-an-nata | قلاع النعتاء | Qilā‘ an Na‘tā’ | محافظة حجة | PPL | 80 | 7 | 81.80 | saada |
| al-mizwar | المزوار | Al Mizwār | محافظة حجة | PPL | 80 | 3 | 81.11 | saada |
| bani-mina | بني مناع | Banī Minā‘ | محافظة حجة | PPL | 80 | 11 | 81.78 | saada |
| qimmat-al-hiwa | قمة الهواء | Qimmat al Hiwā’ | محافظة حجة | PPL | 80 | 1 | 81.64 | saada |
| qayim-madab | قايم مضب | Qāyim Maḑab | محافظة حجة | PPL | 80 | 4 | 82.00 | saada |
| qalat-al-mashribah | قلعة المشربة | Qal‘at al Mashribah | محافظة حجة | PPL | 80 | 5 | 82.03 | saada |
| adh-dhara | الذارى | Adh Dhārá | محافظة حجة | PPL | 80 | 3 | 79.66 | saada |
| al-kirah | الكيرة | Al Kīrah | محافظة حجة | PPL | 80 | 3 | 80.39 | saada |
| gharib-adh-dhanabah | غارب الذنبة | Ghārib adh Dhanabah | محافظة حجة | PPL | 80 | 4 | 80.51 | saada |
| shuqat | شفاط | Shuqāţ | محافظة حجة | PPL | 80 | 4 | 82.29 | saada |
| miqas | مقعــص | Miq‘aş | محافظة حجة | PPL | 80 | 26 | 82.31 | saada |
| al-majadilah | المجعدلة | Al Maj‘adilah | محافظة حجة | PPL | 80 | 8 | 82.23 | saada |
| qimat-sinnan | قيمة سناب | Qīmat Sinnān | محافظة حجة | PPL | 80 | 13 | 82.08 | saada |
| al-araq | العرق | Al ‘Araq | محافظة حجة | PPL | 80 | 14 | 82.00 | saada |
| al-mahturah | المحطورة | Al Maḩţūrah | محافظة حجة | PPL | 80 | 4 | 82.07 | saada |
| al-mijabiri | المجابري | Al Mijābirī | محافظة حجة | PPL | 80 | 11 | 82.14 | saada |
| al-maqla | المقلاع | Al Maqlā‘ | محافظة حجة | PPL | 80 | 3 | 82.07 | saada |
| al-khariqah | الخرقة | Al Khariqah | محافظة حجة | PPL | 80 | 6 | 81.96 | saada |
| qibad | قباض | Qibāḑ | محافظة حجة | PPL | 80 | 2 | 81.62 | saada |
| al-miqshab | المقشاب | Al Miqshāb | محافظة حجة | PPL | 80 | 4 | 81.85 | saada |
| qimat-halim | قيمة حليم | Qīmat Ḩalīm | محافظة حجة | PPL | 80 | 4 | 81.56 | saada |
| al-aqafi | العقافي | Al ‘Aqāfī | محافظة حجة | PPL | 80 | 10 | 82.03 | saada |
| qatilah | قاتلة | Qātilah | محافظة حجة | PPL | 80 | 15 | 82.13 | saada |
| al-mitrash | المطراش | Al Miţrāsh | محافظة حجة | PPL | 80 | 4 | 74.96 | saada |
| ar-radim | الردم | Ar Radim | محافظة حجة | PPL | 80 | 8 | 74.78 | saada |
| al-mubarrak | المبارك | Al Mubārrak | محافظة حجة | PPL | 80 | 10 | 75.06 | saada |
| shughban | شغبان | Shughbān | محافظة حجة | PPL | 80 | 2 | 79.22 | saada |
| al-qalah | القعلة | Al Qa‘lah | محافظة حجة | PPL | 80 | 6 | 80.35 | saada |
| an-niyabah | النيابة | An Niyābah | محافظة حجة | PPL | 80 | 2 | 80.11 | saada |
| as-salitah | الصلطة | Aş Şaliţah | محافظة حجة | PPL | 80 | 5 | 79.85 | saada |
| dhira-an-naqil | ذراع النقيل | Dhirā‘ an Naqīl | محافظة حجة | PPL | 80 | 2 | 80.10 | saada |
| thawab | ثواب | Thawāb | محافظة حجة | PPL | 80 | 4 | 79.61 | saada |
| al-kaburah | الكبورة | Al Kabūrah | محافظة حجة | PPL | 80 | 6 | 79.28 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 6 | 78.37 | saada |
| mahjarah | محجرة | Maḩjarah | محافظة حجة | PPL | 80 | 6 | 78.30 | saada |
| al-kahwal | الكحوال | Al Kaḩwāl | محافظة حجة | PPL | 80 | 4 | 78.63 | saada |
| ar-raddah | الردة | Ar Raddah | محافظة حجة | PPL | 80 | 9 | 77.90 | saada |
| ghawlabah | غولبة | Ghawlabah | محافظة حجة | PPL | 80 | 2 | 77.78 | saada |
| shuf-bin-sara | شوف بن سارى | Shūf Bin Sārá | محافظة حجة | PPL | 80 | 26 | 77.58 | saada |
| al-marwa | المروى | Al Marwá | محافظة حجة | PPL | 80 | 6 | 77.77 | saada |
| al-qushayb | القشيب | Al Qushayb | محافظة حجة | PPL | 80 | 11 | 77.47 | saada |
| bayt-ash-shamzi | بيت الشمزي | Bayt ash Shamzī | محافظة حجة | PPL | 80 | 9 | 78.31 | saada |
| al-qabil | القابل | Al Qābil | محافظة حجة | PPL | 80 | 4 | 77.34 | saada |
| al-mikhyam | المخيام | Al Mikhyām | محافظة حجة | PPL | 80 | 5 | 76.88 | saada |
| al-qatab | القتب | Al Qatab | محافظة حجة | PPL | 80 | 10 | 77.43 | saada |
| al-musail | المسائل | Al Musā’il | محافظة حجة | PPL | 80 | 11 | 76.74 | saada |
| al-qarn-al-ahmar | القرن الأحمر | Al Qarn al Aḩmar | محافظة حجة | PPL | 80 | 12 | 76.82 | saada |
| al-isariyah | العصارية | Al ‘Işārīyah | محافظة حجة | PPL | 80 | 6 | 76.80 | saada |
| al-umsha | العمشى | Al ‘Umshá | محافظة حجة | PPL | 80 | 3 | 76.94 | saada |
| al-mawdinah | المودنة | Al Mawdinah | محافظة حجة | PPL | 80 | 1 | 75.71 | saada |
| al-qishab | القشاب | Al Qishāb | محافظة حجة | PPL | 80 | 6 | 77.07 | saada |
| al-amsh | العمش | Al ‘Amsh | محافظة حجة | PPL | 80 | 9 | 76.47 | saada |
| ash-shaar | الشعار | Ash Sha‘ār | محافظة حجة | PPL | 80 | 1 | 75.52 | saada |
| al-humrur | الحمرور | Al Ḩumrūr | محافظة حجة | PPL | 80 | 1 | 74.87 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 12 | 76.56 | saada |
| al-adilah | العدلة | Al ‘Adilah | محافظة حجة | PPL | 80 | 10 | 76.38 | saada |
| an-nazi | النازع | An Nāzi‘ | محافظة حجة | PPL | 80 | 3 | 75.68 | saada |
| an-nimah | النمة | An Nimah | محافظة حجة | PPL | 80 | 1 | 75.71 | saada |
| al-halhal | الحلحل | Al Ḩalḩal | محافظة حجة | PPL | 80 | 3 | 75.63 | saada |
| al-ashah | العشة | Al ‘Ashah | محافظة حجة | PPL | 80 | 4 | 75.86 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة حجة | PPL | 80 | 2 | 75.40 | saada |
| al-majamah | المجعمة | Al Maj‘amah | محافظة حجة | PPL | 80 | 4 | 75.27 | saada |
| al-basit | البسيط | Al Basīţ | محافظة حجة | PPL | 80 | 1 | 75.59 | saada |
| al-quayr | القعير | Al Qu‘ayr | محافظة حجة | PPL | 80 | 2 | 75.35 | saada |
| al-waraqi | الوراقي | Al Warāqī | محافظة حجة | PPL | 80 | 3 | 75.10 | saada |
| al-maysiri | الميسري | Al Maysirī | محافظة حجة | PPL | 80 | 2 | 75.13 | saada |
| al-mudir | المدير | Al Mudīr | محافظة حجة | PPL | 80 | 4 | 74.86 | saada |
| al-maqta | المقطع | Al Maqţa‘ | محافظة حجة | PPL | 80 | 1 | 74.66 | saada |
| habta | حبطاء | Ḩabţā’ | محافظة حجة | PPL | 80 | 2 | 74.60 | saada |
| gharib-al-atib | غارب العطب | Ghārib al ‘Aţib | محافظة حجة | PPL | 80 | 1 | 75.18 | saada |
| ash-shawf | الشوف | Ash Shawf | محافظة حجة | PPL | 80 | 4 | 73.84 | saada |
| gharib-mabrayah | غارب مبراية | Ghārib Mabrāyah | محافظة حجة | PPL | 80 | 3 | 73.71 | saada |
| al-qisharah | القشارة | Al Qishārah | محافظة حجة | PPL | 80 | 3 | 76.32 | saada |
| al-qimmah | القمة | Al Qimmah | محافظة حجة | PPL | 80 | 13 | 75.32 | saada |
| an-nazakiyah | النزكية | An Nazakīyah | محافظة حجة | PPL | 80 | 2 | 74.95 | saada |
| al-lami | اللمع | Al Lami‘ | محافظة حجة | PPL | 80 | 8 | 74.78 | saada |
| ar-rawha | الروحا | Ar Rawḩā | محافظة حجة | PPL | 80 | 4 | 74.57 | saada |
| al-hadi | الهادي | Al Hādī | محافظة حجة | PPL | 80 | 10 | 74.68 | saada |
| al-ghuthamah | الغثامة | Al Ghuthāmah | محافظة حجة | PPL | 80 | 7 | 74.26 | saada |
| ras-al-mitab | راس المعتاب | Ra’s al Mi‘tāb | محافظة حجة | PPL | 80 | 1 | 73.94 | saada |
| qimat-al-jafami | قيمة الجفمي | Qīmat al Jafamī | محافظة حجة | PPL | 80 | 6 | 79.63 | saada |
| qatabah | قعطبة | Qa‘ţabah | محافظة حجة | PPL | 80 | 3 | 79.05 | saada |
| makhir-ash-shiqqah | ماخر الشقة | Makhir ash Shiqqah | محافظة حجة | PPL | 80 | 3 | 79.77 | saada |
| makhir-al-qimah | ماخر القيمة | Makhir al Qīmah | محافظة حجة | PPL | 80 | 2 | 80.04 | saada |
| al-ghubayb | الغبيب | Al Ghubayb | محافظة حجة | PPL | 80 | 13 | 79.80 | saada |
| al-jabar | الجبر | Al Jabar | محافظة حجة | PPL | 80 | 3 | 79.58 | saada |
| qalat-al-malik | قلعة الملك | Qal‘at al Malik | محافظة حجة | PPL | 80 | 4 | 79.59 | saada |
| dhira-al-qimah | ذراع القيمة | Dhirā‘ al Qīmah | محافظة حجة | PPL | 80 | 3 | 79.89 | saada |
| majlih | مجلح | Majliḩ | محافظة حجة | PPL | 80 | 3 | 79.58 | saada |
| al-uwayrah | العويرة | Al ‘Uwayrah | محافظة حجة | PPL | 80 | 1 | 79.14 | saada |
| al-manamah | المنامة | Al Manāmah | محافظة حجة | PPL | 80 | 3 | 79.79 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة حجة | PPL | 80 | 7 | 79.61 | saada |
| darqilah | درقلة | Darqilah | محافظة حجة | PPL | 80 | 6 | 79.67 | saada |
| al-arajah | العراجة | Al ‘Arājah | محافظة حجة | PPL | 80 | 5 | 79.58 | saada |
| al-hulayqa | الحليقاء | Al Ḩulayqā’ | محافظة حجة | PPL | 80 | 10 | 78.82 | saada |
| as-sula | الصلى | Aş Şulá | محافظة حجة | PPL | 80 | 13 | 79.03 | saada |
| muhrima | محمراء | Muḩrimā’ | محافظة حجة | PPL | 80 | 3 | 78.94 | saada |
| al-arajah | العراجة | Al ‘Arājah | محافظة حجة | PPL | 80 | 8 | 78.76 | saada |
| al-khaw | الخو | Al Khaw | محافظة حجة | PPL | 80 | 10 | 78.51 | saada |
| al-humaysh | الحميش | Al Ḩumaysh | محافظة حجة | PPL | 80 | 6 | 78.33 | saada |
| qibaqab | قباقب | Qibāqab | محافظة حجة | PPL | 80 | 3 | 77.96 | saada |
| shurukh-al-ulbah | شروخ العلبة | Shurūkh al ‘Ulbah | محافظة حجة | PPL | 80 | 2 | 77.95 | saada |
| at-tubruq | الطربق | Aţ Ţubruq | محافظة حجة | PPL | 80 | 4 | 77.93 | saada |
| khirab-ash-shaybah | خراب الشيبة | Khirāb ash Shaybah | محافظة حجة | PPL | 80 | 3 | 77.99 | saada |
| al-liwala | اللوالى | Al Liwālá | محافظة حجة | PPL | 80 | 2 | 77.89 | saada |
| bayt-shayban | بيت شيبان | Bayt Shaybān | محافظة حجة | PPL | 80 | 2 | 78.81 | saada |
| al-hidaraj | الحدارج | Al Ḩidāraj | محافظة حجة | PPL | 80 | 3 | 78.35 | saada |
| mudahilah | مداحلة | Mudāḩilah | محافظة حجة | PPL | 80 | 8 | 78.07 | saada |
| gharib-al-laa | غارب اللاعى | Ghārib al Lā‘á | محافظة حجة | PPL | 80 | 3 | 78.61 | saada |
| al-mihdadah | المحدادة | Al Miḩdādah | محافظة حجة | PPL | 80 | 4 | 78.79 | saada |
| ad-dayam | الديام | Ad Dayām | محافظة حجة | PPL | 80 | 5 | 78.35 | saada |
| al-mudirah | المديرة | Al Mudīrah | محافظة حجة | PPL | 80 | 5 | 78.29 | saada |
| an-nushayf | النشيف | An Nushayf | محافظة حجة | PPL | 80 | 3 | 77.98 | saada |
| al-majarah | المجعارة | Al Maj‘ārah | محافظة حجة | PPL | 80 | 8 | 78.07 | saada |
| al-amsh | العمش | Al ‘Amsh | محافظة حجة | PPL | 80 | 8 | 78.19 | saada |
| al-mitrash | المطراش | Al Miţrāsh | محافظة حجة | PPL | 80 | 2 | 78.89 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 2 | 78.88 | saada |
| al-wijar | الوجار | Al Wijār | محافظة حجة | PPL | 80 | 3 | 78.77 | saada |
| al-hamrah | الحمرة | Al Ḩamrah | محافظة حجة | PPL | 80 | 1 | 78.86 | saada |
| al-qulfa | القلفع | Al Qulfa‘ | محافظة حجة | PPL | 80 | 2 | 78.96 | saada |
| al-khurshibah | الخرشبة | Al Khurshibah | محافظة حجة | PPL | 80 | 3 | 78.83 | saada |
| bayt-al-jalal | بيت الجلال | Bayt al Jalāl | محافظة حجة | PPL | 80 | 6 | 77.49 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة حجة | PPL | 80 | 1 | 77.28 | saada |
| al-hadiyah | الحدية | Al Ḩadīyah | محافظة حجة | PPL | 80 | 2 | 77.10 | saada |
| diman-rahanah | دمن رحانة | Diman Raḩānah | محافظة حجة | PPL | 80 | 2 | 77.03 | saada |
| al-manayish | المنايس | Al Manāyish | محافظة حجة | PPL | 80 | 4 | 77.57 | saada |
| gharib-as-suayb | غارب الصعيب | Ghārib aş Şu‘ayb | محافظة حجة | PPL | 80 | 1 | 77.29 | saada |
| arish-maqbal | عريش مقبل | ‘Arīsh Maqbal | محافظة حجة | PPL | 80 | 2 | 77.18 | saada |
| al-mawdinah | المودنة | Al Mawdinah | محافظة حجة | PPL | 80 | 2 | 77.41 | saada |
| qalat-al-abs | قلعة العبس | Qal‘at al ‘Abs | محافظة حجة | PPL | 80 | 3 | 77.66 | saada |
| ar-rukayb | الركيب | Ar Rukayb | محافظة حجة | PPL | 80 | 1 | 77.51 | saada |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة حجة | PPL | 80 | 2 | 77.21 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة حجة | PPL | 80 | 3 | 77.23 | saada |
| qulqalan | قلقلان | Qulqalān | محافظة حجة | PPL | 80 | 3 | 77.27 | saada |
| al-iraq | العراق | Al ‘Irāq | محافظة حجة | PPL | 80 | 3 | 77.51 | saada |
| silfaq | سلفاق | Silfāq | محافظة حجة | PPL | 80 | 2 | 77.29 | saada |
| al-jatiz | الجعتز | Al Ja‘tiz | محافظة حجة | PPL | 80 | 3 | 76.94 | saada |
| razm-an-nahmi | رزم النهمي | Razm an Nahmī | محافظة حجة | PPL | 80 | 1 | 77.49 | saada |
| al-makharish | المخارش | Al Makhārish | محافظة حجة | PPL | 80 | 3 | 77.32 | saada |
| gharib-az-zahiyah | غارب الظهية | Ghārib az̧ Z̧ahīyah | محافظة حجة | PPL | 80 | 1 | 77.25 | saada |
| al-hayudah | الحيودة | Al Ḩayūdah | محافظة حجة | PPL | 80 | 6 | 77.32 | saada |
| diman-ar-raha | دمن الرحاء | Diman ar Raḩā’ | محافظة حجة | PPL | 80 | 6 | 77.27 | saada |
| al-maquhar | المقوهر | Al Maqūhar | محافظة حجة | PPL | 80 | 3 | 77.45 | saada |
| al-mujabir | المجابر | Al Mujābir | محافظة حجة | PPL | 80 | 11 | 77.68 | saada |
| as-sarw | الصرو | Aş Şarw | محافظة حجة | PPL | 80 | 7 | 79.79 | saada |
| qalat-al-miqabish-bani-mihawash | قلعة المقابس بني مهاوش | Qal‘at al Miqābish Banī Mihāwash | محافظة حجة | PPL | 80 | 6 | 80.28 | saada |
| qawm-jaman | قوم جمعان | Qawm Jam‘ān | محافظة حجة | PPL | 80 | 9 | 80.96 | saada |
| suq-al-umaydah | سوق العميدة | Sūq al ‘Umaydah | محافظة حجة | PPL | 80 | 4 | 79.28 | saada |
| hurayn | حرين | Ḩurayn | محافظة حجة | PPL | 80 | 1 | 79.69 | saada |
| al-qahimah | القاهمة | Al Qāhimah | محافظة حجة | PPL | 80 | 4 | 80.06 | saada |
| ash-shajaah | الشجاعة | Ash Shajā‘ah | محافظة حجة | PPL | 80 | 9 | 80.39 | saada |
| shajaat-as-sarw | شجاعة الصرو | Shajā‘at aş Şarw | محافظة حجة | PPL | 80 | 4 | 80.59 | saada |
| as-sawdi | السودي | As Sawdī | محافظة حجة | PPL | 80 | 9 | 80.30 | saada |
| gharib-mithrar | غارب مثرار | Ghārib Mithrār | محافظة حجة | PPL | 80 | 3 | 79.40 | saada |
| hajr-ash-shaf | حجر الشعف | Ḩajr ash Sha‘f | محافظة حجة | PPL | 80 | 3 | 80.20 | saada |
| al-quflah | القفلة | Al Quflah | محافظة حجة | PPL | 80 | 6 | 80.37 | saada |
| an-naqah | النقعة | An Naq‘ah | محافظة حجة | PPL | 80 | 12 | 81.37 | saada |
| al-quflah-al-yamaniyah | القفلة اليمانية | Al Quflah al Yamānīyah | محافظة حجة | PPL | 80 | 3 | 80.68 | saada |
| as-sirr | السر | As Sirr | محافظة حجة | PPL | 80 | 4 | 80.87 | saada |
| mizab-umar | معزاب عمر | Mi‘zāb ‘Umar | محافظة حجة | PPL | 80 | 4 | 80.09 | saada |
| al-hidaiq | الحدائق | Al Ḩidā’iq | محافظة حجة | PPL | 80 | 17 | 80.39 | saada |
| ad-dayqah | الضيقة | Aḑ Ḑayqah | محافظة حجة | PPL | 80 | 30 | 80.14 | saada |
| al-qadi | القاضي | Al Qāḑī | محافظة حجة | PPL | 80 | 13 | 81.05 | saada |
| al-mitrash | المطراش | Al Miţrāsh | محافظة حجة | PPL | 80 | 11 | 78.80 | saada |
| qalat-durayn | قلعة درين | Qal‘at Durayn | محافظة حجة | PPL | 80 | 8 | 79.10 | saada |
| al-marwa | المروى | Al Marwá | محافظة حجة | PPL | 80 | 13 | 79.33 | saada |
| as-sawdi | السودي | As Sawdī | محافظة حجة | PPL | 80 | 5 | 79.77 | saada |
| al-mizab | المعزاب | Al Mi‘zāb | محافظة حجة | PPL | 80 | 8 | 79.45 | saada |
| hawd-al-arijah | هود العرجة | Hawd al ‘Arijah | محافظة حجة | PPL | 80 | 3 | 79.94 | saada |
| al-maqlifa | المقلفاع | Al Maqlifā‘ | محافظة حجة | PPL | 80 | 5 | 80.64 | saada |
| gharib-as-salib | غارب الصلب | Ghārib aş Şalib | محافظة حجة | PPL | 80 | 6 | 80.84 | saada |
| al-maqla | المقلاع | Al Maqlā‘ | محافظة حجة | PPL | 80 | 3 | 81.34 | saada |
| al-milwayah | الملواية | Al Milwāyah | محافظة حجة | PPL | 80 | 4 | 81.06 | saada |
| ad-dahlah | الدحلة | Ad Daḩlah | محافظة حجة | PPL | 80 | 2 | 81.02 | saada |
| qimat-daram | قيمة دعرم | Qīmat Da‘ram | محافظة حجة | PPL | 80 | 3 | 81.38 | saada |
| ad-damsh | الدمش | Ad Damsh | محافظة حجة | PPL | 80 | 4 | 81.43 | saada |
| ad-dawamih | الدوامح | Ad Dawāmiḩ | محافظة حجة | PPL | 80 | 6 | 81.51 | saada |
| al-muthallath | المثلث | Al Muthallath | محافظة حجة | PPL | 80 | 3 | 81.53 | saada |
| dhira-al-asad | ذراع العصاد | Dhirā‘ al ‘Aşād | محافظة حجة | PPL | 80 | 1 | 81.11 | saada |
| al-hunanah | الحنانى | Al Ḩunānah | محافظة حجة | PPL | 80 | 4 | 81.45 | saada |
| gharib-al-wahmi | غارب الوهمي | Ghārib al Wahmī | محافظة حجة | PPL | 80 | 3 | 81.24 | saada |
| gharb-maghribah | غرب مغربة | Gharb Maghribah | محافظة حجة | PPL | 80 | 4 | 81.44 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة حجة | PPL | 80 | 39 | 81.10 | saada |
| al-madbab | المضباب | Al Maḑbāb | محافظة حجة | PPL | 80 | 6 | 81.21 | saada |
| dhira-al-hariqah | ذراع الحريقة | Dhirā‘ al Ḩarīqah | محافظة حجة | PPL | 80 | 14 | 80.71 | saada |
| al-fawil | الفويل | Al Fawīl | محافظة حجة | PPL | 80 | 5 | 80.22 | saada |
| gharib-kulkan | غارب كلكان | Ghārib Kulkān | محافظة حجة | PPL | 80 | 3 | 80.87 | saada |
| ar-raznah | الرزنة | Ar Raznah | محافظة حجة | PPL | 80 | 34 | 80.97 | saada |
| al-jali | الجلعي | Al Jal‘ī | محافظة حجة | PPL | 80 | 6 | 81.02 | saada |
| al-bahrayn | البحرين | Al Baḩrayn | محافظة حجة | PPL | 80 | 3 | 78.77 | saada |
| gharib-mabradah | غارب مبرادة | Ghārib Mabrādah | محافظة حجة | PPL | 80 | 2 | 78.67 | saada |
| bayt-al-jadi | بيت الجادعي | Bayt al Jād‘ī | محافظة حجة | PPL | 80 | 4 | 78.89 | saada |
| sulaytah | سليطة | Sulayţah | محافظة حجة | PPL | 80 | 6 | 79.40 | saada |
| al-muslah | المصلاه | Al Muşlāh | محافظة حجة | PPL | 80 | 4 | 78.89 | saada |
| al-midwam | المدوم | Al Midwam | محافظة حجة | PPL | 80 | 5 | 78.94 | saada |
| al-hawil | الحويل | Al Ḩawīl | محافظة حجة | PPL | 80 | 3 | 78.71 | saada |
| bayt-al-qadi | بيت القاضي | Bayt al Qāḑī | محافظة حجة | PPL | 80 | 1 | 79.38 | saada |
| arthub-al-qararah | عرثوب القرارة | ‘Arthūb al Qarārah | محافظة حجة | PPL | 80 | 17 | 79.51 | saada |
| arthub-al-malah | عرثوب الملاح | ‘Arthūb al Malāḩ | محافظة حجة | PPL | 80 | 12 | 79.94 | saada |
| zubaydu | زببيدو | Zubaydū | محافظة حجة | PPL | 80 | 13 | 77.22 | saada |
| al-midarah | المدارة | Al Midārah | محافظة حجة | PPL | 80 | 2 | 76.08 | saada |
| al-ghirr | الغر | Al Ghirr | محافظة حجة | PPL | 80 | 3 | 76.26 | saada |
| al-bidah | البداح | Al Bidāḩ | محافظة حجة | PPL | 80 | 1 | 76.26 | saada |
| al-marqab | المرقب | Al Marqab | محافظة حجة | PPL | 80 | 8 | 76.01 | saada |
| shirub-ad-dahiyah | شروب الضهية | Shirūb aḑ Ḑahīyah | محافظة حجة | PPL | 80 | 3 | 76.33 | saada |
| gharib-kis | غارب كيس | Ghārib Kīs | محافظة حجة | PPL | 80 | 3 | 76.22 | saada |
| al-manhar | المنحر | Al Manḩar | محافظة حجة | PPL | 80 | 2 | 75.35 | saada |
| al-jirfalah | الجرفلة | Al Jirfalah | محافظة حجة | PPL | 80 | 3 | 75.34 | saada |
| al-maru | المرو | Al Marū | محافظة حجة | PPL | 80 | 5 | 76.44 | saada |
| bayt-dawud | بيت داود | Bayt Dāwud | محافظة حجة | PPL | 80 | 2 | 79.73 | saada |
| gharib-mashjan | غارب مشجن | Ghārib Mashjan | محافظة حجة | PPL | 80 | 1 | 79.61 | saada |
| al-qasabah-taydan | القصبة طيدان | Al Qaşabah Ţaydān | محافظة حجة | PPL | 80 | 1 | 79.65 | saada |
| al-mawjid | الموجد | Al Mawjid | محافظة حجة | PPL | 80 | 5 | 80.66 | saada |
| an-naqa | النقاع | An Naqā‘ | محافظة حجة | PPL | 80 | 5 | 80.17 | saada |
| al-fujalah | الفجالة | Al Fujālah | محافظة حجة | PPL | 80 | 4 | 79.73 | saada |
| gharib-tihamah | غارب تهامة | Ghārib Tihāmah | محافظة حجة | PPL | 80 | 2 | 79.86 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة حجة | PPL | 80 | 14 | 78.97 | saada |
| al-hawiyah | الحوية | Al Ḩawīyah | محافظة حجة | PPL | 80 | 6 | 78.61 | saada |
| al-hudayb | الحديب | Al Ḩudayb | محافظة حجة | PPL | 80 | 8 | 78.13 | saada |
| al-marish | المعرش | Al Ma‘rish | محافظة حجة | PPL | 80 | 3 | 78.48 | saada |
| al-hadibah | الحدبة | Al Ḩadibah | محافظة حجة | PPL | 80 | 1 | 79.14 | saada |
| ad-dakhil | الداخل | Ad Dākhil | محافظة حجة | PPL | 80 | 1 | 78.56 | saada |
| al-maghwas | المغوس | Al Maghwas | محافظة حجة | PPL | 80 | 1 | 78.29 | saada |
| adh-dhara | الذارى | Adh Dhārá | محافظة حجة | PPL | 80 | 7 | 78.25 | saada |
| al-bahimah | البهمة | Al Bahimah | محافظة حجة | PPL | 80 | 7 | 78.15 | saada |
| al-markabah | المركابة | Al Markābah | محافظة حجة | PPL | 80 | 7 | 77.46 | saada |
| bani-al-wahib | بنى الوهيب | Banī al Wahīb | محافظة حجة | PPL | 80 | 11 | 77.91 | saada |
| al-hibaj | الهباج | Al Hibāj | محافظة حجة | PPL | 80 | 24 | 78.48 | saada |
| ash-sharf | الشرف | Ash Sharf | محافظة حجة | PPL | 80 | 6 | 77.89 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 9 | 77.79 | saada |
| al-marqab | المرقاب | Al Marqāb | محافظة حجة | PPL | 80 | 4 | 77.79 | saada |
| al-musayd | المعصيد | Al Mu‘şayd | محافظة حجة | PPL | 80 | 21 | 77.64 | saada |
| ash-shawf | الشوف | Ash Shawf | محافظة حجة | PPL | 80 | 13 | 77.78 | saada |
| nid-jaman | نيد جمعان | Nīd Jam‘ān | محافظة حجة | PPL | 80 | 16 | 77.88 | saada |
| al-mihqaq | المحقاف | Al Miḩqāq | محافظة حجة | PPL | 80 | 3 | 76.79 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 5 | 76.92 | saada |
| al-matan | المعطــن | Al Ma‘ţan | محافظة حجة | PPL | 80 | 1 | 77.16 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 6 | 77.41 | saada |
| as-sawghah | الصوغة | Aş Şawghah | محافظة حجة | PPL | 80 | 3 | 77.32 | saada |
| al-mahjan | المحجن | Al Maḩjan | محافظة حجة | PPL | 80 | 7 | 73.28 | saada |
| al-mas-al-asfal | المعس الأسفل | Al Ma‘s al Asfal | محافظة حجة | PPL | 80 | 8 | 73.77 | saada |
| al-mushqilah | المشقلة | Al Mushqilah | محافظة حجة | PPL | 80 | 1 | 73.82 | saada |
| ath-thibani | الثعبانى | Ath Thi‘bānī | محافظة حجة | PPL | 80 | 3 | 73.51 | saada |
| al-qaiq | القاعق | Al Qā‘iq | محافظة حجة | PPL | 80 | 7 | 75.81 | saada |
| al-jarah | الجعرة | Al Ja‘rah | محافظة حجة | PPL | 80 | 1 | 73.42 | saada |
| al-bayda | البيضاء | Al Bayḑā’ | محافظة حجة | PPL | 80 | 7 | 74.39 | saada |
| ath-thimran | الثيمران | Ath Thīmrān | محافظة حجة | PPL | 80 | 1 | 74.56 | saada |
| al-qilaah | القلاعة | Al Qilā‘ah | محافظة حجة | PPL | 80 | 6 | 74.60 | saada |
| gharib-jidrat | غارب جدرات | Ghārib Jidrāt | محافظة حجة | PPL | 80 | 4 | 74.47 | saada |
| al-mashab | المشب | Al Mashab | محافظة حجة | PPL | 80 | 1 | 74.72 | saada |
| al-kira | الكراع | Al Kirā‘ | محافظة حجة | PPL | 80 | 1 | 74.91 | saada |
| ar-ruways | الرويس | Ar Ruways | محافظة حجة | PPL | 80 | 2 | 74.90 | saada |
| ar-rajmah | الرجمة | Ar Rajmah | محافظة حجة | PPL | 80 | 3 | 75.04 | saada |
| al-ashash | العشاش | Al ‘Ashāsh | محافظة حجة | PPL | 80 | 3 | 74.75 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 5 | 74.75 | saada |
| al-ghafil | الغافل | Al Ghāfil | محافظة حجة | PPL | 80 | 5 | 74.88 | saada |
| al-maqallit | المقالط | Al Maqālliţ | محافظة حجة | PPL | 80 | 2 | 74.89 | saada |
| al-maqam | المقم | Al Maqam | محافظة حجة | PPL | 80 | 3 | 75.44 | saada |
| gharib-ruzaynah | غارب رزينة | Ghārib Ruzaynah | محافظة حجة | PPL | 80 | 1 | 75.57 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة حجة | PPL | 80 | 5 | 75.75 | saada |
| gharib-al-ghurra | غارب الغرا | Ghārib al Ghurrā | محافظة حجة | PPL | 80 | 5 | 75.52 | saada |
| al-lahab | اللحب | Al Laḩab | محافظة حجة | PPL | 80 | 2 | 76.14 | saada |
| al-kaburah | الكبورة | Al Kabūrah | محافظة حجة | PPL | 80 | 2 | 76.35 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 1 | 78.83 | saada |
| al-qalaid | القلاعد | Al Qalā‘id | محافظة حجة | PPL | 80 | 2 | 78.42 | saada |
| ar-rahah | الراحة | Ar Rāḩah | محافظة حجة | PPL | 80 | 1 | 76.26 | saada |
| shiath | شعــاث | Shi‘āth | محافظة حجة | PPL | 80 | 2 | 79.38 | saada |
| al-miqab | المعقاب | Al Mi‘qāb | محافظة حجة | PPL | 80 | 4 | 79.60 | saada |
| al-hawiyah | الحوية | Al Ḩawīyah | محافظة حجة | PPL | 80 | 13 | 79.83 | saada |
| al-araqah | العرقـة | Al ‘Araqah | محافظة حجة | PPL | 80 | 2 | 79.96 | saada |
| az-zuqaq | الزقاق | Az Zuqāq | محافظة حجة | PPL | 80 | 1 | 80.22 | saada |
| shafi | شافع | Shāfi‘ | محافظة حجة | PPL | 80 | 3 | 79.93 | saada |
| bayt-al-anib | بيت العنب | Bayt al ‘Anib | محافظة حجة | PPL | 80 | 4 | 79.80 | saada |
| gharib-al-araq | غارب العرق | Ghārib al ‘Araq | محافظة حجة | PPL | 80 | 10 | 79.92 | saada |
| akramah | عكرمة | ‘Akramah | محافظة حجة | PPL | 80 | 4 | 79.90 | saada |
| al-mahdadah | المحدادة | Al Maḩdādah | محافظة حجة | PPL | 80 | 6 | 79.53 | saada |
| al-hamrah | الحمـرة | Al Ḩamrah | محافظة حجة | PPL | 80 | 6 | 80.06 | saada |
| ar-razinah | الرزنة | Ar Razinah | محافظة حجة | PPL | 80 | 4 | 79.84 | saada |
| al-awala | العوالى | Al ‘Awālá | محافظة حجة | PPL | 80 | 4 | 79.81 | saada |
| al-hayf | الحيــف | Al Ḩayf | محافظة حجة | PPL | 80 | 17 | 80.46 | saada |
| al-misawad | المساود | Al Misāwad | محافظة حجة | PPL | 80 | 12 | 79.78 | saada |
| al-majdarah | المجدرة | Al Majdarah | محافظة حجة | PPL | 80 | 10 | 79.74 | saada |
| al-manasirah | المناصرة | Al Manāşirah | محافظة حجة | PPL | 80 | 4 | 79.71 | saada |
| al-jada | الجدع | Al Jada‘ | محافظة حجة | PPL | 80 | 3 | 79.66 | saada |
| an-nasiri | الناصري | An Nāşirī | محافظة حجة | PPL | 80 | 3 | 79.26 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 3 | 79.13 | saada |
| al-mawzah | الموزة | Al Mawzah | محافظة حجة | PPL | 80 | 3 | 79.38 | saada |
| haqqah | حقــة | Ḩaqqah | محافظة حجة | PPL | 80 | 1 | 79.08 | saada |
| al-jadab | الجدب | Al Jadab | محافظة حجة | PPL | 80 | 6 | 76.69 | saada |
| al-qamhah | القمحة | Al Qamḩah | محافظة حجة | PPL | 80 | 1 | 78.73 | saada |
| al-miqab | المعقاب | Al Mi‘qāb | محافظة حجة | PPL | 80 | 2 | 77.24 | saada |
| ash-shujna | الشجنا | Ash Shujnā | محافظة حجة | PPL | 80 | 5 | 78.90 | saada |
| al-mihlah | المحلة | Al Miḩlah | محافظة حجة | PPL | 80 | 4 | 77.04 | saada |
| al-mudafin | المدافن | Al Mudāfin | محافظة حجة | PPL | 80 | 4 | 77.03 | saada |
| al-jahjah | الجهجاه | Al Jahjāh | محافظة صعدة | PPL | 80 | 1 | 58.48 | saada |
| ash-shaqyar | الشقيار | Ash Shaqyār | محافظة صعدة | PPL | 80 | 16 | 58.67 | saada |
| al-ubayl | ال عبيل | Āl ‘Ubayl | محافظة صعدة | PPL | 80 | 29 | 82.14 | saada |
| rakhil | راخل | Rākhil | محافظة صعدة | PPL | 80 | 6 | 64.37 | saada |
| ad-dawamin | الدوامين | Ad Dawāmīn | محافظة صعدة | PPL | 80 | 22 | 59.26 | saada |
| al-umda | ال عمداء | Āl ‘Umdā’ | محافظة صعدة | PPL | 80 | 10 | 59.50 | saada |
| al-badhah | ال بذة | Āl Badhah | محافظة صعدة | PPL | 80 | 37 | 59.92 | saada |
| majzah | مجزة | Majzah | محافظة صعدة | PPL | 80 | 7 | 60.24 | saada |
| as-sulayl | السليل | As Sulayl | محافظة صعدة | PPL | 80 | 5 | 61.74 | saada |
| al-khadra | الخضراء | Al Khaḑrā’ | محافظة صعدة | PPL | 80 | 4 | 60.11 | saada |
| bahajah | بهجة | Bahajah | محافظة صعدة | PPL | 80 | 7 | 60.11 | saada |
| muammar-al-mahdi | معمر ال مهدي | Mu‘ammar Āl Mahdī | محافظة صعدة | PPL | 80 | 2 | 60.48 | saada |
| al-hashraj | الحشرج | Al Ḩashraj | محافظة صعدة | PPL | 80 | 4 | 61.33 | saada |
| al-wayashiyah | الوايشية | Al Wāyashīyah | محافظة صعدة | PPL | 80 | 8 | 60.71 | saada |
| al-mubarrak | ال مبارك | Āl Mubārrak | محافظة صعدة | PPL | 80 | 5 | 61.65 | saada |
| usaylah | عصيلة | ‘Uşaylah | محافظة صعدة | PPL | 80 | 8 | 60.27 | saada |
| al-baydban | البيدبن | Al Baydban | محافظة صعدة | PPL | 80 | 7 | 60.98 | saada |
| murshadah | مرشدة | Murshadah | محافظة صعدة | PPL | 80 | 6 | 61.27 | saada |
| billah | بلة | Billah | محافظة صعدة | PPL | 80 | 8 | 60.79 | saada |
| masudah | مسعودة | Mas‘ūdah | محافظة صعدة | PPL | 80 | 2 | 60.48 | saada |
| ad-daram | الدرم | Ad Daram | محافظة صعدة | PPL | 80 | 5 | 60.88 | saada |
| muflihah | مفلحـة | Mufliḩah | محافظة صعدة | PPL | 80 | 3 | 60.68 | saada |
| al-hamrah | ال حمرة | Āl Ḩamrah | محافظة صعدة | PPL | 80 | 5 | 61.06 | saada |
| al-muammar | المعمر | Al Mu‘ammar | محافظة صعدة | PPL | 80 | 11 | 63.40 | saada |
| jurbat-al-ghaliyah | جربة ال غالية | Jurbat Āl Ghālīyah | محافظة صعدة | PPL | 80 | 3 | 62.51 | saada |
| zur-wail | زور وعيل | Zūr Wa‘īl | محافظة صعدة | PPL | 80 | 5 | 62.81 | saada |
| bayhan | بيحان | Bayḩān | محافظة صعدة | PPL | 80 | 15 | 62.65 | saada |
| al-zamal | ال زمال | Āl Zamāl | محافظة صعدة | PPL | 80 | 29 | 62.74 | saada |
| ar-ratibiyah | الراتبية | Ar Rātibīyah | محافظة صعدة | PPL | 80 | 3 | 62.31 | saada |
| al-yadmah | اليدمة | Al Yadmah | محافظة صعدة | PPL | 80 | 3 | 57.98 | saada |
| rah | راه | Rāh | محافظة صعدة | PPL | 80 | 15 | 58.43 | saada |
| quryan | قريان | Quryān | محافظة صعدة | PPL | 80 | 10 | 57.62 | saada |
| sadrah | سدرة | Sadrah | محافظة صعدة | PPL | 80 | 4 | 56.67 | saada |
| as-sanif | الصنيف | Aş Şanīf | محافظة صعدة | PPL | 80 | 12 | 59.71 | saada |
| al-qarayir | القراير | Al Qarāyir | محافظة صعدة | PPL | 80 | 10 | 75.49 | saada |
| ghathir | غثير | Ghathīr | محافظة صعدة | PPL | 80 | 1 | 74.68 | saada |
| ad-dahah | الضاحة | Aḑ Ḑāḩah | محافظة صعدة | PPL | 80 | 9 | 74.83 | saada |
| al-hushaymah | الهشيمة | Al Hushaymah | محافظة صعدة | PPL | 80 | 4 | 75.56 | saada |
| al-hayat | الحايط | Al Ḩāyaţ | محافظة صعدة | PPL | 80 | 17 | 74.28 | saada |
| al-malhah | الملحة | Al Malḩah | محافظة صعدة | PPL | 80 | 1 | 72.52 | saada |
| al-halah | الحلة | Al Ḩalah | محافظة صعدة | PPL | 80 | 4 | 73.28 | saada |
| astan | أستن | Astan | محافظة صعدة | PPL | 80 | 11 | 76.77 | saada |
| unays | أنيس | Unays | محافظة صعدة | PPL | 80 | 1 | 77.03 | saada |
| qihah | قهاه | Qihāh | محافظة صعدة | PPL | 80 | 15 | 79.16 | saada |
| al-muslib | المصلب | Al Muşlib | محافظة صعدة | PPL | 80 | 6 | 81.28 | saada |
| malhah-al-ulya | ملحة العليا | Malḩah al ‘Ulyā | محافظة صعدة | PPL | 80 | 6 | 69.83 | saada |
| adh-dhawa | الذاعوا | Adh Dhā‘wā | محافظة صعدة | PPL | 80 | 4 | 74.84 | saada |
| at-tinajir | التناجر | At Tinājir | محافظة صعدة | PPL | 80 | 1 | 80.41 | saada |
| dhat-yay | ذات ياي | Dhāt Yāy | محافظة صعدة | PPL | 80 | 2 | 76.92 | saada |
| al-atlal | الأطلال | Al Aţlāl | محافظة صعدة | PPL | 80 | 7 | 57.91 | saada |
| rayyak | ريك | Rayyak | محافظة صعدة | PPL | 80 | 1 | 62.33 | saada |
| ashshat-al-alman | عشة العلمان | ‘Ashshat al ‘Almān | محافظة صعدة | PPL | 80 | 4 | 39.92 | saada |
| al-irafat | العرافط | Al ‘Irāfaţ | محافظة صعدة | PPL | 80 | 24 | 39.64 | saada |
| fudaylah | فضيلة | Fuḑaylah | محافظة صعدة | PPL | 80 | 6 | 43.40 | saada |
| al-mahjar | المحجر | Al Maḩjar | محافظة صعدة | PPL | 80 | 6 | 39.66 | saada |
| ad-dakhshah | الدخشة | Ad Dakhshah | محافظة صعدة | PPL | 80 | 28 | 39.12 | saada |
| hannan | حنان | Ḩannān | محافظة صعدة | PPL | 80 | 6 | 42.26 | saada |
| shatab | شطب | Shaţab | محافظة صعدة | PPL | 80 | 5 | 39.06 | saada |
| as-sifah | الصفعة | Aş Şif‘ah | محافظة صعدة | PPL | 80 | 1 | 50.96 | saada |
| dhibah | ذهبة | Dhibah | محافظة صعدة | PPL | 80 | 6 | 33.89 | saada |
| al-jabih | الجابح | Al Jābiḩ | محافظة صعدة | PPL | 80 | 4 | 33.66 | saada |
| al-ubayd | ال عبيد | Āl ‘Ubayd | محافظة صعدة | PPL | 80 | 18 | 38.93 | saada |
| as-sanai | الصناعي | Aş Şanā‘ī | محافظة صعدة | PPL | 80 | 1 | 37.76 | saada |
| al-arafayn | العرفين | Al ‘Arafayn | محافظة صعدة | PPL | 80 | 6 | 41.32 | saada |
| al-qabil | القابل | Al Qābil | محافظة صعدة | PPL | 80 | 3 | 38.39 | saada |
| atfah-al-abd | عطفة ال عبد | ‘Aţfah Āl ‘Abd | محافظة صعدة | PPL | 80 | 1 | 39.18 | saada |
| ar-rahwah | الرهوة | Ar Rahwah | محافظة صعدة | PPL | 80 | 1 | 38.01 | saada |
| al-basan | ال باسان | Āl Bāsān | محافظة صعدة | PPL | 80 | 11 | 32.23 | saada |
| rahabah | رحبة | Raḩabah | محافظة صعدة | PPL | 80 | 2 | 30.47 | saada |
| al-madarah-al-musinn | المدارة المسن | Al Madārah al Musinn | محافظة صعدة | PPL | 80 | 2 | 31.86 | saada |
| as-safiq | الصفق | Aş Şafiq | محافظة صعدة | PPL | 80 | 3 | 32.83 | saada |
| at-talhah | الطلحة | Aţ Ţalḩah | محافظة صعدة | PPL | 80 | 3 | 32.07 | saada |
| ubaydah-al-asnaj | عبيدة الأصنج | ‘Ubaydah al Aşnaj | محافظة صعدة | PPL | 80 | 2 | 32.17 | saada |
| al-ashshah | العشة | Al ‘Ashshah | محافظة صعدة | PPL | 80 | 6 | 32.28 | saada |
| al-misrakh | المصراخ | Al Misrākh | محافظة صعدة | PPL | 80 | 3 | 31.94 | saada |
| bin-zabah | بن ظبعة | Bin Z̧ab‘ah | محافظة صعدة | PPL | 80 | 2 | 32.52 | saada |
| sahilah | سهلة | Sahilah | محافظة صعدة | PPL | 80 | 3 | 33.05 | saada |
| samarah | سمارة | Samārah | محافظة صعدة | PPL | 80 | 4 | 33.64 | saada |
| al-bidayah | البديعة | Al Biday‘ah | محافظة صعدة | PPL | 80 | 3 | 34.13 | saada |
| al-habitah | الهابطة | Al Hābiţah | محافظة صعدة | PPL | 80 | 6 | 32.24 | saada |
| as-saddah | السادة | As Sāddah | محافظة صعدة | PPL | 80 | 5 | 32.79 | saada |
| al-wasat | الوسط | Al Wasaţ | محافظة صعدة | PPL | 80 | 5 | 33.94 | saada |
| asfal-al-ghul | أسفل الغول | Asfal al Ghūl | محافظة صعدة | PPL | 80 | 2 | 48.51 | saada |
| al-matraq | المطرق | Al Maţraq | محافظة صعدة | PPL | 80 | 1 | 49.83 | saada |
| ad-diwar | الدوار | Ad Diwār | محافظة صعدة | PPL | 80 | 1 | 52.01 | saada |
| ar-ridum | الرضوم | Ar Riḑūm | محافظة صعدة | PPL | 80 | 6 | 52.10 | saada |
| sadr-al-fahlawayn | صدر الفحلوين | Şadr al Faḩlawayn | محافظة صعدة | PPL | 80 | 18 | 49.57 | saada |
| asfal-al-fahlawayn | أسفل الفحلوين | Asfal al Faḩlawayn | محافظة صعدة | PPL | 80 | 7 | 51.55 | saada |
| as-safiq | الصفق | Aş Şafiq | محافظة صعدة | PPL | 80 | 4 | 51.33 | saada |
| ribaq | رباق | Ribāq | محافظة صعدة | PPL | 80 | 2 | 47.04 | saada |
| ras-al-fahlawayn | راس الفحلوين | Ra’s al Faḩlawayn | محافظة صعدة | PPL | 80 | 10 | 51.70 | saada |
| as-sahluqah | السحلوقة | As Saḩlūqah | محافظة صعدة | PPL | 80 | 1 | 42.24 | saada |
| khadwan | خضوان | Khaḑwān | محافظة صعدة | PPL | 80 | 17 | 43.52 | saada |
| tawarith | تواريث | Tawārith | محافظة صعدة | PPL | 80 | 32 | 42.02 | saada |
| al-dahmah | ال دحمة | Āl Daḩmah | محافظة صعدة | PPL | 80 | 11 | 42.16 | saada |
| bir-muammar | بير معمر | Bi’r Mu‘ammar | محافظة صعدة | PPL | 80 | 4 | 42.20 | saada |
| shamlil | شملل | Shamlil | محافظة صعدة | PPL | 80 | 12 | 55.00 | saada |
| al-aql | العقل | Al ‘Aql | محافظة صعدة | PPL | 80 | 18 | 46.67 | saada |
| ad-dafnah | الدفنة | Ad Dafnah | محافظة صعدة | PPL | 80 | 9 | 38.67 | saada |
| mawram | مورم | Mawram | محافظة صعدة | PPL | 80 | 2 | 35.52 | saada |
| al-adiyah | العادية | Al ‘Ādīyah | محافظة صعدة | PPL | 80 | 16 | 36.47 | saada |
| al-ulya | العليا | Al ‘Ulyā | محافظة صعدة | PPL | 80 | 10 | 36.18 | saada |
| maqbilah | مقبلة | Maqbilah | محافظة صعدة | PPL | 80 | 12 | 35.26 | saada |
| al-itfah | العطفة | Al ‘Iţfah | محافظة صعدة | PPL | 80 | 8 | 35.00 | saada |
| al-hirar | الحرار | Al Ḩirār | محافظة صعدة | PPL | 80 | 1 | 56.88 | saada |
| ar-radim | الردم | Ar Radim | محافظة صعدة | PPL | 80 | 2 | 56.84 | saada |
| saidah | سعيدة | Sa‘īdah | محافظة صعدة | PPL | 80 | 3 | 58.12 | saada |
| judhaymat-at-tinanah | جذيمة الطنانة | Judhaymat aţ Ţinānah | محافظة صعدة | PPL | 80 | 2 | 59.25 | saada |
| al-misqal | المسقال | Al Misqāl | محافظة صعدة | PPL | 80 | 2 | 57.73 | saada |
| iwad | عوض | ‘Iwaḑ | محافظة صعدة | PPL | 80 | 3 | 57.45 | saada |
| khiyah | خية | Khiyah | محافظة صعدة | PPL | 80 | 6 | 55.80 | saada |
| as-sahn | الصحن | Aş Şaḩn | محافظة صعدة | PPL | 80 | 8 | 60.37 | saada |
| shuqaym | شقيم | Shuqaym | محافظة صعدة | PPL | 80 | 32 | 62.54 | saada |
| al-fari | الفرع | Al Fari‘ | محافظة صعدة | PPL | 80 | 25 | 58.23 | saada |
| al-mabradah | المبرادة | Al Mabrādah | محافظة صعدة | PPL | 80 | 1 | 63.61 | saada |
| nuaydah | نعيضة | Nu‘ayḑah | محافظة صعدة | PPL | 80 | 5 | 57.15 | saada |
| al-khanaq | الخنق | Al Khanaq | محافظة صعدة | PPL | 80 | 3 | 60.06 | saada |
| shibah | شيبة | Shībah | محافظة صعدة | PPL | 80 | 14 | 53.61 | saada |
| az-zujj | الزج | Az Zujj | محافظة صعدة | PPL | 80 | 5 | 47.89 | saada |
| al-alb-al-afjah | العلب الأفجح | Al ‘Alb al Afjaḩ | محافظة صعدة | PPL | 80 | 2 | 47.69 | saada |
| al-maaf | ال معاف | Āl Ma‘āf | محافظة صعدة | PPL | 80 | 8 | 55.47 | saada |
| al-lujiyah | اللجية | Al Lujīyah | محافظة صعدة | PPL | 80 | 29 | 34.81 | saada |
| al-amur | العمور | Al ‘Amūr | محافظة صعدة | PPL | 80 | 8 | 12.93 | saada |
| al-hashirah | الحشرة | Al Ḩashirah | محافظة صعدة | PPL | 80 | 8 | 12.03 | saada |
| al-hazah | الحازة | Al Ḩāzah | محافظة صعدة | PPL | 80 | 24 | 12.08 | saada |
| al-kuhaylin | الكحيلين | Al Kuḩaylīn | محافظة صعدة | PPL | 80 | 15 | 12.92 | saada |
| bir-ash-shaykh | بير الشيخ | Bi’r ash Shaykh | محافظة صعدة | PPL | 80 | 13 | 19.97 | saada |
| al-ar-raqabi | ال الرقابي | Āl ar Raqābī | محافظة صعدة | PPL | 80 | 8 | 20.41 | saada |
| al-rashid | ال رشيد | Āl Rashīd | محافظة صعدة | PPL | 80 | 2 | 20.32 | saada |
| al-murshad | ال مرشد | Āl Murshad | محافظة صعدة | PPL | 80 | 20 | 20.27 | saada |
| al-zabin | ال زابن | Āl Zābin | محافظة صعدة | PPL | 80 | 6 | 19.77 | saada |
| al-qumlan | ال قملان | Āl Qumlān | محافظة صعدة | PPL | 80 | 3 | 20.35 | saada |
| al-kharijah | الخارجة | Al Khārijah | محافظة صعدة | PPL | 80 | 20 | 10.44 | saada |
| ash-shaar | الشعار | Ash Sha‘ār | محافظة صعدة | PPL | 80 | 10 | 10.73 | saada |
| al-hadhi | ال حاذي | Āl Ḩādhī | محافظة صعدة | PPL | 80 | 16 | 11.93 | saada |
| al-shurwayd | ال شرويد | Āl Shurwayd | محافظة صعدة | PPL | 80 | 2 | 11.52 | saada |
| al-al-waqar | ال الوقر | Āl al Waqar | محافظة صعدة | PPL | 80 | 4 | 11.36 | saada |
| al-samir | ال سامر | Āl Sāmir | محافظة صعدة | PPL | 80 | 18 | 11.83 | saada |
| midar | مدار | Midār | محافظة صعدة | PPL | 80 | 16 | 12.18 | saada |
| al-at-tirlahij | ال الطرلحج | Āl aţ Ţirlaḩij | محافظة صعدة | PPL | 80 | 23 | 13.28 | saada |
| al-abu-hasirah | ال أبو حاسرة | Āl Abū Ḩāsirah | محافظة صعدة | PPL | 80 | 25 | 13.02 | saada |
| al-al-mara | ال المرى | Āl al Mará | محافظة صعدة | PPL | 80 | 20 | 13.25 | saada |
| zaabir | زعابر | Za‘ābir | محافظة صعدة | PPL | 80 | 4 | 13.47 | saada |
| al-sharif | ال شريف | Āl Sharīf | محافظة صعدة | PPL | 80 | 5 | 20.56 | saada |
| al-munazzir | المنظر | Al Munaz̧z̧ir | محافظة صعدة | PPL | 80 | 19 | 18.92 | saada |
| al-lujbah-al-ulya | اللجبة العليا | Al Lujbah al ‘Ulyā | محافظة صعدة | PPL | 80 | 13 | 33.37 | saada |
| al-jadidah | الجديدة | Al Jadīdah | محافظة صعدة | PPL | 80 | 10 | 10.14 | saada |
| salwa | سلوى | Salwá | محافظة صعدة | PPL | 80 | 10 | 10.29 | saada |
| al-qabil | القابل | Al Qābil | محافظة صعدة | PPL | 80 | 14 | 10.67 | saada |
| al-hufshi | الحفشي | Al Ḩufshī | محافظة صعدة | PPL | 80 | 1 | 9.61 | saada |
| al-quram | ال قرام | Āl Qurām | محافظة صعدة | PPL | 80 | 26 | 12.38 | saada |
| al-raqi | ال راقع | Āl Rāqi‘ | محافظة صعدة | PPL | 80 | 6 | 7.32 | saada |
| al-rashid | ال رشيد | Āl Rashīd | محافظة صعدة | PPL | 80 | 36 | 7.61 | saada |
| al-jalah-al-shamah | الجلعة ال شمعة | Al Jal‘ah Āl Sham‘ah | محافظة صعدة | PPL | 80 | 19 | 7.12 | saada |
| al-ubayd | ال عبيد | Āl ‘Ubayd | محافظة صعدة | PPL | 80 | 34 | 7.35 | saada |
| al-awad | ال العود | Āl ‘Awad | محافظة صعدة | PPL | 80 | 17 | 7.63 | saada |
| al-al-qahum | ال القحم | Āl al Qaḩum | محافظة صعدة | PPL | 80 | 46 | 7.75 | saada |
| al-hurban | ال حربان | Āl Ḩurbān | محافظة صعدة | PPL | 80 | 37 | 7.44 | saada |
| al-ali-bin-rashid | ال علي بن راشد | Āl ‘Alī Bin Rāshid | محافظة صعدة | PPL | 80 | 6 | 11.59 | saada |
| al-jadhyamah | الجذيامة | Al Jadhyāmah | محافظة صعدة | PPL | 80 | 4 | 12.09 | saada |
| al-muslabah | المصلابة | Al Muşlābah | محافظة صعدة | PPL | 80 | 49 | 9.59 | saada |
| al-shabbah | ال شبة | Āl Shabbah | محافظة صعدة | PPL | 80 | 2 | 9.48 | saada |
| al-al-hanabi | ال الحنبي | Āl al Ḩanabī | محافظة صعدة | PPL | 80 | 1 | 9.86 | saada |
| al-khadr | ال خضر | Āl Khaḑr | محافظة صعدة | PPL | 80 | 27 | 9.15 | saada |
| qahtan | قحطان | Qaḩţān | محافظة صعدة | PPL | 80 | 15 | 8.46 | saada |
| al-ar-rubayi | ال الربيعي | Āl ar Rubay‘ī | محافظة صعدة | PPL | 80 | 10 | 7.71 | saada |
| al-miqabi | المقابع | Al Miqābi‘ | محافظة صعدة | PPL | 80 | 46 | 7.17 | saada |
| al-shawkan | ال شوكان | Āl Shawkān | محافظة صعدة | PPL | 80 | 77 | 8.37 | saada |
| ar-ruwabidah | الروابضة | Ar Ruwābiḑah | محافظة صعدة | PPL | 80 | 34 | 9.18 | saada |
| ar-rubayi | الربيعي | Ar Rubay‘ī | محافظة صعدة | PPL | 80 | 4 | 8.28 | saada |
| najd-al-qaidah | نجد القاعدة | Najd al Qā‘idah | محافظة صعدة | PPL | 80 | 5 | 24.75 | saada |
| al-asayir | العصاير | Al ‘Aşāyir | محافظة صعدة | PPL | 80 | 1 | 23.55 | saada |
| as-sayilah | السايلة | As Sāyilah | محافظة صعدة | PPL | 80 | 3 | 29.28 | saada |
| al-maqamah | المقامة | Al Maqāmah | محافظة صعدة | PPL | 80 | 46 | 17.89 | saada |
| ad-dabkah | الدبكة | Ad Dabkah | محافظة صعدة | PPL | 80 | 9 | 19.12 | saada |
| ar-rahabah-al-khadra | الرحبة الخضراء | Ar Raḩabah al Khaḑrā’ | محافظة صعدة | PPL | 80 | 16 | 21.91 | saada |
| kadim | كدم | Kadim | محافظة صعدة | PPL | 80 | 21 | 21.05 | saada |
| atusah | عطوسة | ‘Aţūsah | محافظة حضرموت | PPL | 80 | 9 | 132.65 | mukalla |
| duqm-ash-sharif | دقم الشريف | Duqm ash Sharīf | محافظة حضرموت | PPL | 80 | 7 | 132.14 | mukalla |
| al-barak | البرك | Al Barak | محافظة حضرموت | PPL | 80 | 10 | 130.06 | mukalla |
| hajr-al-murayah | حجر المربعة | Ḩajr al Muray‘ah | محافظة حضرموت | PPL | 80 | 6 | 133.20 | mukalla |
| al-muayin | المعاين | Al Mu‘āyin | محافظة حضرموت | PPL | 80 | 4 | 132.09 | mukalla |
| aqimat-ghazi | عقمة غازي | ‘Aqimat Ghāzī | محافظة أبين | PPL | 80 | 18 | 51.18 | aden |
| al-ghul | الغول | Al Ghūl | محافظة الجوف | PPL | 80 | 3 | 53.81 | saada |
| al-qadah | القضاه | Al Qaḑāh | محافظة الجوف | PPL | 80 | 6 | 54.07 | saada |
| al-qara | القرى | Al Qará | محافظة الجوف | PPL | 80 | 2 | 56.84 | saada |
| ar-rukhaymah | الرخيمة | Ar Rukhaymah | محافظة الجوف | PPL | 80 | 5 | 53.57 | saada |
| al-maqar | المعقر | Al Ma‘qar | محافظة الجوف | PPL | 80 | 3 | 64.61 | saada |
| al-qaridah-al-qabil | القرضة القابل | Al Qariḑah al Qābil | محافظة الجوف | PPL | 80 | 7 | 64.98 | saada |
| jurdan | جردان | Jurdān | محافظة الجوف | PPL | 80 | 3 | 66.16 | saada |
| zubayd | زبيد | Zubayd | محافظة الجوف | PPL | 80 | 11 | 65.69 | saada |
| hirawish | هراوش | Hirāwish | محافظة الجوف | PPL | 80 | 12 | 57.25 | saada |
| mibadi | مبادع | Mibādi‘ | محافظة الجوف | PPL | 80 | 9 | 56.97 | saada |
| maqam-dhu-fasil | مقام ذو فاصل | Maqām Dhū Fāşil | محافظة الجوف | PPL | 80 | 4 | 56.78 | saada |
| maqam-dhu-mahdi | مقام ذو مهدي | Maqām Dhū Mahdī | محافظة الجوف | PPL | 80 | 3 | 56.66 | saada |
| khudayrmiyah | خضيرمية | Khuḑayrmīyah | محافظة صعدة | PPL | 80 | 3 | 18.99 | saada |
| al-ad-dawlah | ال الدولة | Āl ad Dawlah | محافظة صعدة | PPL | 80 | 17 | 16.77 | saada |
| al-qamburah | القمبورة | Al Qambūrah | محافظة صعدة | PPL | 80 | 7 | 11.35 | saada |
| al-atif | ال عاطف | Āl ‘Āţif | محافظة صعدة | PPL | 80 | 6 | 12.47 | saada |
| al-hashul | ال هشول | Āl Hashūl | محافظة صعدة | PPL | 80 | 89 | 13.02 | saada |
| al-muawwid | ال معوض | Āl Mu‘awwid | محافظة صعدة | PPL | 80 | 47 | 12.70 | saada |
| al-matab | ال متعب | Āl Mat‘ab | محافظة صعدة | PPL | 80 | 23 | 12.18 | saada |
| al-hudrah | الحضرة | Al Ḩuḑrah | محافظة صعدة | PPL | 80 | 25 | 12.29 | saada |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة صعدة | PPL | 80 | 44 | 11.13 | saada |
| al-al-qahum | ال القحم | Āl al Qaḩum | محافظة صعدة | PPL | 80 | 119 | 12.45 | saada |
| al-tayif | ال طايف | Āl Ţāyif | محافظة صعدة | PPL | 80 | 23 | 11.41 | saada |
| al-khanaq | الخنق | Al Khanaq | محافظة صعدة | PPL | 80 | 19 | 13.21 | saada |
| ad-diqaiq | الدقائق | Ad Diqā’iq | محافظة صعدة | PPL | 80 | 70 | 14.47 | saada |
| al-jabir | ال جابر | Āl Jābir | محافظة صعدة | PPL | 80 | 8 | 8.07 | saada |
| al-bakir | ال باكر | Āl Bākir | محافظة صعدة | PPL | 80 | 7 | 8.06 | saada |
| al-tishli | ال طشلي | Āl Ţishlī | محافظة صعدة | PPL | 80 | 19 | 17.85 | saada |
| al-bayyih | البيح | Al Bayyiḩ | محافظة صعدة | PPL | 80 | 20 | 19.73 | saada |
| ad-dumayd | الضميد | Aḑ Ḑumayd | محافظة صعدة | PPL | 80 | 23 | 17.54 | saada |
| al-hidab | الحداب | Al Ḩidāb | محافظة صعدة | PPL | 80 | 77 | 19.74 | saada |
| al-ghubshan | ال غبشان | Āl Ghubshān | محافظة صعدة | PPL | 80 | 18 | 20.90 | saada |
| al-isa | ال عيسى | Āl ‘Īsá | محافظة صعدة | PPL | 80 | 17 | 20.13 | saada |
| al-firwan | ال فروان | Āl Firwān | محافظة صعدة | PPL | 80 | 6 | 26.25 | saada |
| yahbir | يهبر | Yahbir | محافظة صعدة | PPL | 80 | 16 | 28.07 | saada |
| talah | طلاح | Ţalāḩ | محافظة صعدة | PPL | 80 | 17 | 28.51 | saada |
| al-saad | ال سعد | Āl Sa‘ad | محافظة صعدة | PPL | 80 | 2 | 27.97 | saada |
| akbar | أكبر | Akbar | محافظة صعدة | PPL | 80 | 15 | 37.50 | saada |
| alt-ash-shughban | الت الشغبان | Alt ash Shughbān | محافظة صعدة | PPL | 80 | 3 | 28.53 | saada |
| al-udhrat | العذرات | Al ‘Udhrāt | محافظة صعدة | PPL | 80 | 6 | 28.57 | saada |
| al-qarn | القرن | Al Qarn | محافظة صعدة | PPL | 80 | 4 | 28.77 | saada |
| al-muayyid | ال المؤيد | Āl Mu’ayyid | محافظة صعدة | PPL | 80 | 2 | 28.91 | saada |
| diwan | دعوان | Di‘wān | محافظة صعدة | PPL | 80 | 2 | 28.87 | saada |
| al-firayin | الفرايين | Al Firāyīn | محافظة صعدة | PPL | 80 | 60 | 21.05 | saada |
| az-zaylah-al-ulya | الزيلة العليا | Az Zaylah al ‘Ulyā | محافظة صعدة | PPL | 80 | 94 | 22.36 | saada |
| amran | عمران | ‘Amrān | محافظة صعدة | PPL | 80 | 16 | 25.45 | saada |
| bir-anqan | بير عنقان | Bi’r ‘Anqān | محافظة صعدة | PPL | 80 | 4 | 24.18 | saada |
| al-sharikah | آل شركة | Āl Sharikah | محافظة صعدة | PPL | 80 | 33 | 23.53 | saada |
| bir-jandab | بير جندب | Bi’r Jandab | محافظة صعدة | PPL | 80 | 30 | 22.80 | saada |
| thandub | ثنضوب | Thanḑūb | محافظة صعدة | PPL | 80 | 33 | 25.35 | saada |
| ashar | عشر | ‘Ashar | محافظة الجوف | PPL | 80 | 53 | 56.53 | saada |
| tiddah | طدة | Ţiddah | محافظة الجوف | PPL | 80 | 20 | 49.08 | saada |
| al-jutham | الجثام | Al Juthām | محافظة صعدة | PPL | 80 | 16 | 40.03 | saada |
| al-madba | المضباع | Al Maḑbā‘ | محافظة صعدة | PPL | 80 | 9 | 39.87 | saada |
| dawasilan | دوعصلان | Daw‘aşilān | محافظة صعدة | PPL | 80 | 6 | 38.06 | saada |
| al-makhlatah | المخلطة | Al Makhlaţah | محافظة صعدة | PPL | 80 | 8 | 38.67 | saada |
| zanbaqah | زنبقة | Zanbaqah | محافظة صعدة | PPL | 80 | 7 | 38.64 | saada |
| al-mazkhat | المزخاط | Al Mazkhāţ | محافظة عمران | PPL | 80 | 12 | 52.35 | saada |
| ar-rabah | الربعة | Ar Rab‘ah | محافظة الجوف | PPL | 80 | 2 | 65.95 | saada |
| muaydah | معيضة | Mu‘ayḑah | محافظة عمران | PPL | 80 | 1 | 59.62 | saada |
| milfaj | ملفاج | Milfāj | محافظة عمران | PPL | 80 | 1 | 62.49 | saada |
| midhab | مذاب | Midhāb | محافظة عمران | PPL | 80 | 1 | 63.34 | saada |
| as-saddah | السادة | As Sāddah | محافظة عمران | PPL | 80 | 1 | 65.61 | saada |
| al-fawz | القوز | Al Fawz | محافظة عمران | PPL | 80 | 1 | 65.73 | saada |
| al-mahjazah | المحجزة | Al Maḩjazah | محافظة عمران | PPL | 80 | 1 | 64.64 | saada |
| al-jaradi | الجرادي | Al Jarādī | محافظة عمران | PPL | 80 | 1 | 62.51 | saada |
| ar-rawnah | الرونة | Ar Rawnah | محافظة عمران | PPL | 80 | 2 | 60.19 | saada |
| jubair | خباعر | Jubā‘ir | محافظة عمران | PPL | 80 | 1 | 59.01 | saada |
| al-wurqa | الورقاء | Al Wurqā’ | محافظة عمران | PPL | 80 | 1 | 61.71 | saada |
| shiab-sibarah | شعاب صبارة | Shi‘āb Şibārah | محافظة عمران | PPL | 80 | 4 | 52.73 | saada |
| ad-duluf | الضلف | Aḑ Ḑuluf | محافظة عمران | PPL | 80 | 2 | 53.31 | saada |
| zubayn | ظبين | Z̧ubayn | محافظة عمران | PPL | 80 | 14 | 51.38 | saada |
| al-ashshah | العشة | Al ‘Ashshah | محافظة عمران | PPL | 80 | 5 | 51.66 | saada |
| qarn-bin-umayr | قرن بن عمير | Qarn Bin ‘Umayr | محافظة عمران | PPL | 80 | 11 | 51.66 | saada |
| khuraysan | خريسان | Khuraysān | محافظة عمران | PPL | 80 | 8 | 43.61 | saada |
| radan | رعدان | Ra‘dān | محافظة عمران | PPL | 80 | 3 | 51.45 | saada |
| an-namr | النمر | An Namr | محافظة عمران | PPL | 80 | 3 | 54.87 | saada |
| anbarah | عنبرة | ‘Anbarah | محافظة عمران | PPL | 80 | 7 | 54.00 | saada |
| al-hayarah | الحيارة | Al Ḩayārah | محافظة صعدة | PPL | 80 | 5 | 37.09 | saada |
| umm-al-halaq | أم الحلق | Umm al Ḩalaq | محافظة صعدة | PPL | 80 | 1 | 37.13 | saada |
| tibrah | تبرة | Tibrah | محافظة صعدة | PPL | 80 | 3 | 37.78 | saada |
| jabirah | جابرة | Jābirah | محافظة صعدة | PPL | 80 | 5 | 37.70 | saada |
| ad-dahrah | الدحرة | Ad Daḩrah | محافظة عمران | PPL | 80 | 8 | 67.61 | saada |
| al-khadabiyah | الخدبية | Al Khadabīyah | محافظة عمران | PPL | 80 | 5 | 67.42 | saada |
| al-qabil | القابل | Al Qābil | محافظة الجوف | PPL | 80 | 4 | 66.84 | saada |
| al-qinanah | القنانة | Al Qinānah | محافظة الجوف | PPL | 80 | 4 | 66.55 | saada |
| al-hidham | الحذام | Al Ḩidhām | محافظة الجوف | PPL | 80 | 5 | 67.26 | saada |
| al-habiyah | الحبية | Al Ḩabīyah | محافظة الجوف | PPL | 80 | 31 | 64.73 | saada |
| al-burayk | البريك | Al Burayk | محافظة الجوف | PPL | 80 | 26 | 65.17 | saada |
| yad-khayran | يد خيران | Yad Khayrān | محافظة الجوف | PPL | 80 | 41 | 65.51 | saada |
| as-suhaybat | الصهيبات | Aş Şuhaybāt | محافظة الجوف | PPL | 80 | 1 | 58.74 | saada |
| al-qaydh | القيدح | Al Qaydḩ | محافظة الجوف | PPL | 80 | 2 | 57.18 | saada |
| al-ghumra | الغمراء | Al Ghumrā’ | محافظة الجوف | PPL | 80 | 12 | 57.21 | saada |
| al-mahukah | المحوكة | Al Maḩūkah | محافظة الجوف | PPL | 80 | 8 | 56.97 | saada |
| al-qadr | القدر | Al Qadr | محافظة الجوف | PPL | 80 | 27 | 57.84 | saada |
| al-midah | المضعة | Al Miḑ‘ah | محافظة الجوف | PPL | 80 | 2 | 61.04 | saada |
| al-arabiyah | العربية | Al ‘Arabīyah | محافظة الجوف | PPL | 80 | 3 | 60.89 | saada |
| al-mabdah | المبدعة | Al Mabd‘ah | محافظة الجوف | PPL | 80 | 3 | 61.06 | saada |
| ash-shaqqab | الشقب | Ash Shaqqab | محافظة الجوف | PPL | 80 | 2 | 55.85 | saada |
| sibah | سباح | Sibāḩ | محافظة الجوف | PPL | 80 | 4 | 63.72 | saada |
| ad-duwaysan | الدويسان | Ad Duwaysān | محافظة الجوف | PPL | 80 | 16 | 63.72 | saada |
| muqbilah | مقبلة | Muqbilah | محافظة الجوف | PPL | 80 | 2 | 62.78 | saada |
| wadin-al-bari | ودن الباري | Wadin al Bārī | محافظة الجوف | PPL | 80 | 4 | 64.28 | saada |
| sihlah | سهلة | Sihlah | محافظة الجوف | PPL | 80 | 3 | 64.69 | saada |
| bir-al-milahah | بير الملاحة | Bi’r al Milāḩah | محافظة الجوف | PPL | 80 | 1 | 63.92 | saada |
| an-nujayf | النجيف | An Nujayf | محافظة الجوف | PPL | 80 | 4 | 64.16 | saada |
| al-qayfah | القيفة | Al Qayfah | محافظة الجوف | PPL | 80 | 23 | 67.45 | saada |
| atfat-al-jamil | عطفة ال جميل | ‘Aţfat Āl Jamīl | محافظة الجوف | PPL | 80 | 14 | 67.98 | saada |
| sirab-adh-dhiyab | سراب الذياب | Sirāb adh Dhiyāb | محافظة الجوف | PPL | 80 | 5 | 66.73 | saada |
| maqam-abu-athwah | مقام أبو عثوة | Maqām Abū ‘Athwah | محافظة الجوف | PPL | 80 | 17 | 66.89 | saada |
| zafq-al-halsan | زفق الحلسان | Zafq al Ḩalsān | محافظة الجوف | PPL | 80 | 9 | 67.90 | saada |
| al-muhandh | المحانذ | Al Muḩāndh | محافظة الجوف | PPL | 80 | 21 | 67.11 | saada |
| al-jannah | الجنة | Al Jannah | محافظة الجوف | PPL | 80 | 7 | 75.20 | saada |
| raghwan | رغوان | Raghwān | محافظة الجوف | PPL | 80 | 6 | 76.22 | saada |
| midhafi | مذافي | Midhāfī | محافظة الجوف | PPL | 80 | 7 | 76.45 | saada |
| al-khaymah | الخيمة | Al Khaymah | محافظة الجوف | PPL | 80 | 4 | 77.61 | saada |
| al-himyud | الحميوض | Al Ḩimyūḑ | محافظة الجوف | PPL | 80 | 5 | 78.00 | saada |
| kudaydah | كديدة | Kudaydah | محافظة الجوف | PPL | 80 | 9 | 62.51 | saada |
| sinwan | سنوان | Sinwān | محافظة الجوف | PPL | 80 | 9 | 61.42 | saada |
| al-uzayli | العظيلي | Al ‘Uz̧aylī | محافظة الجوف | PPL | 80 | 6 | 60.99 | saada |
| al-khirab | الخراب | Al Khirāb | محافظة الجوف | PPL | 80 | 2 | 60.67 | saada |
| bir-jushman | بير جشمان | Bi’r Jushmān | محافظة الجوف | PPL | 80 | 14 | 59.19 | saada |
| thalul | ثلول | Thalūl | محافظة الجوف | PPL | 80 | 2 | 59.36 | saada |
| al-ghurayb-al-ala | الغريب الأعلى | Al Ghurayb al A‘lá | محافظة الجوف | PPL | 80 | 5 | 75.03 | saada |
| al-ghurayb-al-wasit | الغريب الواسط | Al Ghurayb al Wāsiţ | محافظة الجوف | PPL | 80 | 12 | 74.92 | saada |
| jawwat-huwa | جوة حوا | Jawwat Ḩuwā | محافظة الجوف | PPL | 80 | 1 | 74.72 | saada |
| hazm-adh-dhayb | حزم الذيب | Ḩazm adh Dhayb | محافظة الجوف | PPL | 80 | 2 | 74.81 | saada |
| jawwat-yahya | جوة يحي | Jawwat Yaḩya | محافظة الجوف | PPL | 80 | 2 | 75.08 | saada |
| al-hashirah | الحشرة | Al Ḩashirah | محافظة الجوف | PPL | 80 | 2 | 74.99 | saada |
| an-nimrah | النمرة | An Nimrah | محافظة الجوف | PPL | 80 | 1 | 75.99 | saada |
| al-ablah | العبلة | Al ‘Ablah | محافظة الجوف | PPL | 80 | 1 | 65.89 | saada |
| zamzam | زمزم | Zamzam | محافظة الجوف | PPL | 80 | 4 | 66.20 | saada |
| zur-al-quman | زور القمعان | Zūr al Qum‘ān | محافظة الجوف | PPL | 80 | 6 | 64.99 | saada |
| ash-shukhayd | الشخيض | Ash Shukhayḑ | محافظة الجوف | PPL | 80 | 1 | 64.38 | saada |
| al-maqam-al-wasit | المقام الواسط | Al Maqām al Wāsiţ | محافظة الجوف | PPL | 80 | 1 | 64.50 | saada |
| al-dahim | ال دحيم | Āl Daḩīm | محافظة الجوف | PPL | 80 | 1 | 66.41 | saada |
| al-qaban | القبعان | Al Qab‘ān | محافظة الجوف | PPL | 80 | 5 | 66.52 | saada |
| ribabah | ربابة | Ribābah | محافظة الجوف | PPL | 80 | 7 | 65.28 | saada |
| zafq-hajan | زفق حجان | Zafq Ḩajān | محافظة الجوف | PPL | 80 | 13 | 66.13 | saada |
| ad-dur | الدور | Ad Dūr | محافظة الجوف | PPL | 80 | 11 | 66.29 | saada |
| dahyah | دحية | Daḩyah | محافظة الجوف | PPL | 80 | 2 | 66.55 | saada |
| bir-as-saghirah | بير الصغيرة | Bi’r aş Şaghīrah | محافظة الجوف | PPL | 80 | 4 | 66.72 | saada |
| al-majdu | ال مجدوع | Āl Majdū‘ | محافظة الجوف | PPL | 80 | 3 | 66.48 | saada |
| al-furah | الفورة | Al Fūrah | محافظة الجوف | PPL | 80 | 2 | 76.64 | saada |
| al-khirar | الخرار | Al Khirār | محافظة الجوف | PPL | 80 | 4 | 77.18 | saada |
| al-banah-al-ulya | البانة العليا | Al Bānah al ‘Ulyā | محافظة الجوف | PPL | 80 | 3 | 77.34 | saada |
| al-khalif | الخليف | Al Khalīf | محافظة الجوف | PPL | 80 | 3 | 77.50 | saada |
| al-banah-as-sufla | البانة السفلى | Al Bānah as Suflá | محافظة الجوف | PPL | 80 | 2 | 77.61 | saada |
| al-urr | العر | Al ‘Urr | محافظة الجوف | PPL | 80 | 3 | 77.73 | saada |
| al-muarik | المعارك | Al Mu‘ārik | محافظة الجوف | PPL | 80 | 4 | 70.08 | saada |
| al-bayda | البيضاء | Al Bayḑā’ | محافظة الجوف | PPL | 80 | 1 | 71.83 | saada |
| al-hasan | الحصن | Al Ḩaşan | محافظة الجوف | PPL | 80 | 5 | 72.44 | saada |
| al-mashduqah | المشدوقة | Al Mashdūqah | محافظة الجوف | PPL | 80 | 2 | 73.96 | saada |
| al-mukhtaybah | المختبية | Al Mukhtaybah | محافظة الجوف | PPL | 80 | 2 | 74.14 | saada |
| qaryat-an-nasir | قرية الناصر | Qaryat an Nāşir | محافظة الجوف | PPL | 80 | 1 | 74.69 | saada |
| al-bitra | البتراء | Al Bitrā’ | محافظة الجوف | PPL | 80 | 15 | 71.30 | saada |
| al-majari | المجاري | Al Majārī | محافظة الجوف | PPL | 80 | 6 | 70.11 | saada |
| as-sifah | الصفاة | Aş Şifāh | محافظة الجوف | PPL | 80 | 6 | 73.94 | saada |
| al-madmun | المضمون | Al Maḑmūn | محافظة الجوف | PPL | 80 | 4 | 74.65 | saada |
| al-kays | الكيس | Al Kays | محافظة الجوف | PPL | 80 | 2 | 74.34 | saada |
| al-balas | البالس | Al Bālas | محافظة الجوف | PPL | 80 | 6 | 74.47 | saada |
| adhad | أدحض | Adḩaḑ | محافظة الجوف | PPL | 80 | 4 | 74.77 | saada |
| walan | ولعان | Wal‘ān | محافظة الجوف | PPL | 80 | 1 | 75.09 | saada |
| al-halwah-al-ulya | الحلوة العليا | Al Ḩalwah al ‘Ulyā | محافظة الجوف | PPL | 80 | 2 | 75.73 | saada |
| al-halwah-as-sufla | الحلوة السفلى | Al Ḩalwah as Suflá | محافظة الجوف | PPL | 80 | 2 | 75.46 | saada |
| maqam-ahmad | مقام أحمد | Maqām Aḩmad | محافظة الجوف | PPL | 80 | 3 | 75.72 | saada |
| al-itfah | العطفة | Al ‘Iţfah | محافظة الجوف | PPL | 80 | 7 | 73.31 | saada |
| al-hazm | الحزم | Al Ḩazm | محافظة الجوف | PPL | 80 | 3 | 72.44 | saada |
| ad-dayqah-al-asfal | الضيفة الأسفل | Aḑ Ḑayqah al Asfal | محافظة الجوف | PPL | 80 | 1 | 71.86 | saada |
| al-masnah | المسنة | Al Masnah | محافظة الجوف | PPL | 80 | 7 | 71.40 | saada |
| haydah | هيضة | Hayḑah | محافظة الجوف | PPL | 80 | 5 | 71.23 | saada |
| dubays | دبيس | Dubays | محافظة الجوف | PPL | 80 | 1 | 70.88 | saada |
| qaddah | قضة | Qaḑḑah | محافظة الجوف | PPL | 80 | 1 | 70.77 | saada |
| maqam-al-hashful | مقام الحشفول | Maqām al Ḩashfūl | محافظة الجوف | PPL | 80 | 3 | 73.53 | saada |
| miltaqi | الملتقي | Miltaqī | محافظة الجوف | PPL | 80 | 79 | 68.91 | saada |
| al-qabili | القبلي | Al Qabilī | محافظة الجوف | PPL | 80 | 35 | 74.75 | saada |
| ar-rabat | الرباط | Ar Rabāţ | محافظة الجوف | PPL | 80 | 10 | 75.30 | saada |
| dasimi | داسمي | Dāsimī | محافظة الجوف | PPL | 80 | 62 | 71.87 | saada |
| al-mifas | المعفاس | Al Mi‘fās | محافظة الجوف | PPL | 80 | 27 | 71.50 | saada |
| al-urayn | العرين | Al ‘Urayn | محافظة الجوف | PPL | 80 | 1 | 79.58 | saada |
| al-majari | المجاري | Al Majārī | محافظة الجوف | PPL | 80 | 21 | 69.39 | saada |
| al-bari | آل بارع | Āl Bāri‘ | محافظة الجوف | PPL | 80 | 11 | 70.18 | saada |
| al-sari | ال ساري | Āl Sārī | محافظة صعدة | PPL | 80 | 3 | 55.90 | saada |
| al-muraym | ال مريم | Āl Muraym | محافظة صعدة | PPL | 80 | 6 | 55.66 | saada |
| al-daram | ال درام | Āl Darām | محافظة صعدة | PPL | 80 | 10 | 56.96 | saada |
| bayt-dhat-insab | بيت ذات إنصاب | Bayt Dhāt Inşāb | محافظة صعدة | PPL | 80 | 4 | 58.33 | saada |
| thibat-al-gharbiyah | ثيبة الغربية | Thībat al Gharbīyah | محافظة صعدة | PPL | 80 | 4 | 54.84 | saada |
| mahfar | محفار | Maḩfār | محافظة صعدة | PPL | 80 | 1 | 56.37 | saada |
| qawdir | قودر | Qawdir | محافظة صعدة | PPL | 80 | 12 | 58.27 | saada |
| al-shuub | ال شعون | Āl Shu‘ūb | محافظة صعدة | PPL | 80 | 6 | 56.50 | saada |
| bathbah | بثبة | Bathbah | محافظة صعدة | PPL | 80 | 4 | 54.81 | saada |
| at-tuwayq | الطويق | Aţ Ţuwayq | محافظة صعدة | PPL | 80 | 5 | 56.24 | saada |
| al-mishna | المشنع | Al Mishna‘ | محافظة صعدة | PPL | 80 | 4 | 54.76 | saada |
| sayhid | صيهد | Şayhid | محافظة صعدة | PPL | 80 | 6 | 54.52 | saada |
| al-walah | الوالة | Al Wālah | محافظة صعدة | PPL | 80 | 8 | 54.69 | saada |
| fari-al-walah | فرع الوالة | Fari‘ al Wālah | محافظة صعدة | PPL | 80 | 2 | 54.88 | saada |
| al-huwayj | الهويج | Al Huwayj | محافظة صعدة | PPL | 80 | 15 | 53.21 | saada |
| dawhan | دوحان | Dawḩān | محافظة صعدة | PPL | 80 | 22 | 53.84 | saada |
| dhira-ar-rafiqah | ذراع الرفيقة | Dhirā‘ ar Rafīqah | محافظة صعدة | PPL | 80 | 7 | 54.17 | saada |
| al-hissas-al-ala | الحصاص الأعلى | Al Ḩişşāş al A‘lá | محافظة صعدة | PPL | 80 | 3 | 56.89 | saada |
| al-hissas-al-asfal | الحصاص الأسفل | Al Ḩişşāş al Asfal | محافظة صعدة | PPL | 80 | 12 | 56.92 | saada |
| al-akhshab | الأخشب | Al Akhshab | محافظة صعدة | PPL | 80 | 2 | 54.79 | saada |
| ar-rakb | الركب | Ar Rakb | محافظة صعدة | PPL | 80 | 17 | 52.70 | saada |
| al-hanu | الحنو | Al Ḩanū | محافظة صعدة | PPL | 80 | 28 | 53.60 | saada |
| naybat-qarn | نيبة قرب | Naybat Qarn | محافظة صعدة | PPL | 80 | 15 | 54.27 | saada |
| al-madya | المضياع | Al Maḑyā‘ | محافظة صعدة | PPL | 80 | 6 | 57.88 | saada |
| al-khadah-rahnah | الخداه رهنا | Al Khadāh Rahnah | محافظة الجوف | PPL | 80 | 14 | 86.64 | saada |
| al-arsh | العرش | Al ‘Arsh | محافظة الجوف | PPL | 80 | 6 | 80.88 | saada |
| as-silah | السيلة | As Sīlah | محافظة الجوف | PPL | 80 | 3 | 81.58 | saada |
| al-jawwah-as-sawda | الجوة السوداء | Al Jawwah as Sawdā’ | محافظة الجوف | PPL | 80 | 4 | 80.69 | saada |
| al-atif | العطف | Al ‘Aţif | محافظة الجوف | PPL | 80 | 17 | 81.02 | saada |
| bayt-al-abd | بيت العبد | Bayt al ‘Abd | محافظة الجوف | PPL | 80 | 1 | 81.90 | saada |
| bahrah | بحرة | Baḩrah | محافظة الجوف | PPL | 80 | 2 | 81.57 | saada |
| al-maqam | المقام | Al Maqām | محافظة الجوف | PPL | 80 | 4 | 81.14 | saada |
| sawadah | سوادة | Sawādah | محافظة الجوف | PPL | 80 | 4 | 81.15 | saada |
| ash-shawl | الشول | Ash Shawl | محافظة الجوف | PPL | 80 | 15 | 81.10 | saada |
| qaryat-ash-shawl | قرية الشول | Qaryat ash Shawl | محافظة الجوف | PPL | 80 | 24 | 81.09 | saada |
| wadan-marzuq | ودن مرزوق | Wadan Marzūq | محافظة الجوف | PPL | 80 | 11 | 81.03 | saada |
| an-nadiyah | الندية | An Nadīyah | محافظة الجوف | PPL | 80 | 2 | 80.83 | saada |
| al-maqiqah | المقيقة | Al Maqīqah | محافظة الجوف | PPL | 80 | 1 | 79.94 | saada |
| mawdan | مودان | Mawdān | محافظة الجوف | PPL | 80 | 3 | 62.30 | saada |
| maqam-abu-ras | مقام أبو رأس | Maqām Abū Ra’s | محافظة الجوف | PPL | 80 | 3 | 62.50 | saada |
| bir-an-namah | بير النعمة | Bi’r an Na‘mah | محافظة الجوف | PPL | 80 | 7 | 62.84 | saada |
| atiyah | عطية | ‘Aţīyah | محافظة الجوف | PPL | 80 | 2 | 63.18 | saada |
| sahlah | سهلة | Sahlah | محافظة الجوف | PPL | 80 | 4 | 63.29 | saada |
| umm-al-hala | أم الحلاء | Umm al Ḩalā’ | محافظة الجوف | PPL | 80 | 4 | 64.43 | saada |
| maswar | مسور | Maswar | محافظة الجوف | PPL | 80 | 7 | 63.13 | saada |
| rawwah | روة | Rawwah | محافظة الجوف | PPL | 80 | 37 | 62.71 | saada |
| al-awanah | ال عوانة | Āl ‘Awānah | محافظة الجوف | PPL | 80 | 10 | 65.56 | saada |
| matar | مطر | Maţar | محافظة الجوف | PPL | 80 | 2 | 64.94 | saada |
| al-ash | العش | Al ‘Ash | محافظة الجوف | PPL | 80 | 19 | 61.95 | saada |
| al-araq | العرق | Al ‘Araq | محافظة الجوف | PPL | 80 | 3 | 61.59 | saada |
| al-wadaj | الواضج | Al Wāḑaj | محافظة الجوف | PPL | 80 | 2 | 61.67 | saada |
| al-ghirabin | الغرابين | Al Ghirābīn | محافظة الجوف | PPL | 80 | 22 | 58.72 | saada |
| al-hijair | الحجائر | Al Ḩijā’ir | محافظة الجوف | PPL | 80 | 12 | 59.70 | saada |
| al-khadra | الخضراء | Al Khaḑrā’ | محافظة الجوف | PPL | 80 | 17 | 63.95 | saada |
| al-ghayib | الغيب | Al Ghayib | محافظة الجوف | PPL | 80 | 8 | 63.23 | saada |
| al-muqati | المقاطع | Al Muqāţi‘ | محافظة الجوف | PPL | 80 | 5 | 65.21 | saada |
| mittat | مطاط | Miţţāţ | محافظة الجوف | PPL | 80 | 18 | 66.34 | saada |
| as-sahah-al-ulya | الساحة العليا | As Sāḩah al ‘Ulyā | محافظة الجوف | PPL | 80 | 24 | 68.79 | saada |
| al-hazm | الحزم | Al Ḩazm | محافظة الجوف | PPL | 80 | 2 | 69.00 | saada |
| dawud | داود | Dāwud | محافظة الجوف | PPL | 80 | 3 | 69.32 | saada |
| hijlah | حجلة | Ḩijlah | محافظة الجوف | PPL | 80 | 8 | 68.98 | saada |
| jamah | جمعة | Jam‘ah | محافظة الجوف | PPL | 80 | 3 | 69.21 | saada |
| al-aridah | العارضة | Al ‘Āriḑah | محافظة الجوف | PPL | 80 | 11 | 69.56 | saada |
| harid | حارد | Ḩārid | محافظة الجوف | PPL | 80 | 15 | 69.33 | saada |
| al-bariqah | البرقة | Al Bariqah | محافظة الجوف | PPL | 80 | 6 | 67.87 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة الجوف | PPL | 80 | 5 | 69.73 | saada |
| al-mashaf | المشاف | Al Mashāf | محافظة الجوف | PPL | 80 | 10 | 69.26 | saada |
| shuniah | شنيعة | Shunī‘ah | محافظة الجوف | PPL | 80 | 2 | 69.95 | saada |
| al-hajil | الحجل | Al Ḩajil | محافظة الجوف | PPL | 80 | 6 | 70.08 | saada |
| al-anadil | العنادل | Al ‘Anādil | محافظة الجوف | PPL | 80 | 12 | 70.12 | saada |
| abdanah | عبدانة | ‘Abdānah | محافظة الجوف | PPL | 80 | 3 | 74.44 | saada |
| hazm-badi-al-miharah | حزم بديع المحارة | Ḩazm Badī‘ al Miḩārah | محافظة الجوف | PPL | 80 | 17 | 75.42 | saada |
| al-hasan | الحصن | Al Ḩaşan | محافظة الجوف | PPL | 80 | 10 | 74.57 | saada |
| al-qudfan | القضفان | Al Quḑfān | محافظة الجوف | PPL | 80 | 8 | 74.45 | saada |
| hazm-ad-dayim | حزم الديم | Ḩazm ad Dayim | محافظة الجوف | PPL | 80 | 9 | 74.75 | saada |
| al-munba | المنباع | Al Munbā‘ | محافظة الجوف | PPL | 80 | 26 | 75.31 | saada |
| al-hazm-binhayah | الحزم بنهاية | Al Ḩazm Binhāyah | محافظة الجوف | PPL | 80 | 33 | 74.55 | saada |
| ghayl-daqan | غيل دعقان | Ghayl Da‘qān | محافظة الجوف | PPL | 80 | 20 | 72.17 | saada |
| an-nataq | النطاق | An Naţāq | محافظة الجوف | PPL | 80 | 6 | 71.99 | saada |
| al-hijlah | الحجلة | Al Ḩijlah | محافظة الجوف | PPL | 80 | 6 | 72.49 | saada |
| al-qawaz | القوز | Al Qawaz | محافظة الجوف | PPL | 80 | 5 | 72.91 | saada |
| an-najd | النجد | An Najd | محافظة الجوف | PPL | 80 | 31 | 71.43 | saada |
| as-samara | السامرى | As Sāmará | محافظة الجوف | PPL | 80 | 18 | 71.89 | saada |
| bayt-al-ari | بيت العاري | Bayt al ‘Ārī | محافظة الجوف | PPL | 80 | 12 | 72.55 | saada |
| as-sirar | السرار | As Sirār | محافظة الجوف | PPL | 80 | 42 | 71.62 | saada |
| as-sirh | الصرح | Aş Şirḩ | محافظة الجوف | PPL | 80 | 17 | 72.37 | saada |
| al-miqshab | المقشب | Al Miqshab | محافظة الجوف | PPL | 80 | 16 | 72.09 | saada |
| jawwat-madrak | جوة مدرك | Jawwat Madrak | محافظة الجوف | PPL | 80 | 6 | 71.70 | saada |
| al-ghawiyah | الغاوية | Al Ghāwīyah | محافظة الجوف | PPL | 80 | 3 | 72.20 | saada |
| al-jurshah | الجرشة | Al Jurshah | محافظة الجوف | PPL | 80 | 10 | 72.95 | saada |
| al-hajil | الحجل | Al Ḩajil | محافظة الجوف | PPL | 80 | 7 | 69.85 | saada |
| kuthan | كثان | Kuthān | محافظة الجوف | PPL | 80 | 12 | 68.48 | saada |
| maqam-abu-nawas | مقام أبو نواس | Maqām Abū Nawās | محافظة الجوف | PPL | 80 | 28 | 64.09 | saada |
| mazhar | مزهر | Mazhar | محافظة الجوف | PPL | 80 | 21 | 63.40 | saada |
| miqshab | المقشب | Miqshab | محافظة الجوف | PPL | 80 | 8 | 67.13 | saada |
| fulayhah | فليحة | Fulayḩah | محافظة الجوف | PPL | 80 | 24 | 66.98 | saada |
| jarram | جرم | Jarram | محافظة الجوف | PPL | 80 | 14 | 66.24 | saada |
| al-mainah | المعنة | Al Ma‘inah | محافظة الجوف | PPL | 80 | 27 | 76.20 | saada |
| abyat-hatim | أبيات حاتم | Abyāt Ḩātim | محافظة الجوف | PPL | 80 | 22 | 76.14 | saada |
| al-hajil | الحجل | Al Ḩajil | محافظة الجوف | PPL | 80 | 13 | 75.83 | saada |
| al-jathwah | الجثوة | Al Jathwah | محافظة الجوف | PPL | 80 | 20 | 76.66 | saada |
| umm-al-awal | أم العوال | Umm al ‘Awāl | محافظة الجوف | PPL | 80 | 56 | 76.60 | saada |
| al-mukhays | المخيس | Al Mukhays | محافظة الجوف | PPL | 80 | 8 | 76.75 | saada |
| al-qadim | القديم | Al Qadīm | محافظة الجوف | PPL | 80 | 2 | 79.69 | saada |
| al-labniyah | اللبنية | Al Labnīyah | محافظة الجوف | PPL | 80 | 6 | 73.44 | saada |
| bin-halwan | بن حلوان | Bin Ḩalwān | محافظة الجوف | PPL | 80 | 7 | 73.44 | saada |
| al-alah | العلاه | Al ‘Alāh | محافظة الجوف | PPL | 80 | 6 | 73.27 | saada |
| al-khadra | الخضراء | Al Khaḑrā’ | محافظة الجوف | PPL | 80 | 9 | 73.95 | saada |
| masudah | مسعودة | Mas‘ūdah | محافظة الجوف | PPL | 80 | 15 | 73.89 | saada |
| al-mishwaf | المشواف | Al Mishwāf | محافظة الجوف | PPL | 80 | 2 | 74.03 | saada |
| al-qafl | القفل | Al Qafl | محافظة الجوف | PPL | 80 | 3 | 75.04 | saada |
| al-bulisah | البليسة | Al Bulīsah | محافظة الجوف | PPL | 80 | 6 | 75.28 | saada |
| maqam-al-qadi | مقام القاضي | Maqām al Qāḑī | محافظة الجوف | PPL | 80 | 2 | 73.12 | saada |
| al-qurayd | الفريض | Al Qurayḑ | محافظة الجوف | PPL | 80 | 24 | 74.31 | saada |
| al-khabtan | الخبطن | Al Khabţan | محافظة الجوف | PPL | 80 | 7 | 74.04 | saada |
| an-najad | النجاد | An Najād | محافظة الجوف | PPL | 80 | 4 | 73.57 | saada |
| dhi-husayn | ذي حسين | Dhī Ḩusayn | محافظة الجوف | PPL | 80 | 6 | 74.34 | saada |
| saran | سرعان | Sar‘ān | محافظة الجوف | PPL | 80 | 4 | 77.20 | saada |
| ad-dibbah | الضبة | Aḑ Ḑibbah | محافظة الجوف | PPL | 80 | 20 | 71.78 | saada |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة الجوف | PPL | 80 | 13 | 71.25 | saada |
| asbah | أسبة | Asbah | محافظة الجوف | PPL | 80 | 17 | 72.87 | saada |
| ar-rushin | الرشن | Ar Rushin | محافظة الجوف | PPL | 80 | 18 | 73.15 | saada |
| al-wadan | الودن | Al Wadan | محافظة الجوف | PPL | 80 | 21 | 74.45 | saada |
| al-hajil | الحجل | Al Ḩajil | محافظة الجوف | PPL | 80 | 16 | 74.37 | saada |
| al-jawad | الجود | Al Jawad | محافظة الجوف | PPL | 80 | 11 | 74.53 | saada |
| juhush | جحوش | Juḩūsh | محافظة الجوف | PPL | 80 | 10 | 74.22 | saada |
| maqshab-salih | مقشب صالح | Maqshab Şāliḩ | محافظة الجوف | PPL | 80 | 14 | 73.01 | saada |
| maqshab-at-taliq | مقشب الطليق | Maqshab aţ Ţalīq | محافظة الجوف | PPL | 80 | 20 | 71.67 | saada |
| al-naji | آل ناجي | Āl Nājī | محافظة الجوف | PPL | 80 | 25 | 68.47 | saada |
| al-kawb | الكوب | Al Kawb | محافظة الجوف | PPL | 80 | 16 | 68.25 | saada |
| milhaqat-khayr | ملحقة خير | Milḩaqat Khayr | محافظة الجوف | PPL | 80 | 11 | 67.94 | saada |
| sirhah | سرحة | Sirḩah | محافظة الجوف | PPL | 80 | 50 | 67.81 | saada |
| ash-shaabiyah | الشعابية | Ash Sha‘ābīyah | محافظة الجوف | PPL | 80 | 38 | 70.76 | saada |
| al-shai | آل شائع | Āl Shā’i‘ | محافظة الجوف | PPL | 80 | 16 | 71.56 | saada |
| ad-daribah | الضربة | Aḑ Ḑaribah | محافظة الجوف | PPL | 80 | 11 | 71.77 | saada |
| al-musinnah | المسنة | Al Musinnah | محافظة الجوف | PPL | 80 | 20 | 72.03 | saada |
| al-salih | آل صالح | Āl Şāliḩ | محافظة الجوف | PPL | 80 | 20 | 71.54 | saada |
| al-ali | آل علي | Āl ‘Alī | محافظة الجوف | PPL | 80 | 13 | 71.29 | saada |
| al-maqam-al-gharbi | المقام الغربي | Al Maqām al Gharbī | محافظة الجوف | PPL | 80 | 10 | 71.45 | saada |
| al-al-qasim | آل القسم | Āl al Qasim | محافظة الجوف | PPL | 80 | 10 | 71.36 | saada |
| al-walidayn | الوليدين | Al Walīdayn | محافظة الجوف | PPL | 80 | 27 | 71.56 | saada |
| bani-qahtan | بني قحطان | Banī Qaḩţān | محافظة الجوف | PPL | 80 | 30 | 71.89 | saada |
| al-yahya | آل يحي | Āl Yaḩya | محافظة الجوف | PPL | 80 | 8 | 71.41 | saada |
| as-safiyah | الصافية | Aş Şāfīyah | محافظة الجوف | PPL | 80 | 6 | 70.63 | saada |
| as-sadr | الصدر | Aş Şadr | محافظة الجوف | PPL | 80 | 3 | 70.94 | saada |
| al-shayi | آل شايع | Āl Shāyi‘ | محافظة الجوف | PPL | 80 | 41 | 70.83 | saada |
| al-ghanim | آل غانم | Āl Ghānim | محافظة الجوف | PPL | 80 | 1 | 70.14 | saada |
| an-nushayqah-al-al-hizam | النشيفة ال الحزام | An Nushayqah Āl al Ḩizām | محافظة الجوف | PPL | 80 | 30 | 73.47 | saada |
| al-kafilah | الكفيلة | Al Kafīlah | محافظة الجوف | PPL | 80 | 16 | 73.97 | saada |
| al-yahya | آل يحي | Āl Yaḩya | محافظة الجوف | PPL | 80 | 10 | 74.11 | saada |
| al-miyad | المعياد | Al Mi‘yād | محافظة الجوف | PPL | 80 | 20 | 74.27 | saada |
| al-qurha | القرحاء | Al Qurḩā’ | محافظة الجوف | PPL | 80 | 35 | 74.43 | saada |
| utayd | عتيد | ‘Utayd | محافظة الجوف | PPL | 80 | 9 | 76.96 | saada |
| al-furshah | الفرشة | Al Furshah | محافظة الجوف | PPL | 80 | 7 | 77.08 | saada |
| qiwan | قعوان | Qi‘wān | محافظة الجوف | PPL | 80 | 7 | 77.40 | saada |
| ashan | عشان | ‘Ashān | محافظة الجوف | PPL | 80 | 7 | 76.64 | saada |
| hayah | هاية | Hāyah | محافظة الجوف | PPL | 80 | 5 | 78.15 | saada |
| al-mushani | المشانع | Al Mushāni‘ | محافظة الجوف | PPL | 80 | 23 | 77.22 | saada |
| maqtil-qirad | مقتل قراد | Maqtil Qirād | محافظة الجوف | PPL | 80 | 15 | 72.04 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة الجوف | PPL | 80 | 12 | 71.73 | saada |
| as-sulbah | الصلبة | Aş Şulbah | محافظة الجوف | PPL | 80 | 10 | 71.81 | saada |
| al-misal | المعسال | Al Mi‘sāl | محافظة الجوف | PPL | 80 | 4 | 74.07 | saada |
| al-barad | البراد | Al Barād | محافظة الجوف | PPL | 80 | 3 | 74.21 | saada |
| sakirah | سكرة | Sakirah | محافظة الجوف | PPL | 80 | 5 | 73.11 | saada |
| ar-ras | الرأس | Ar Ra’s | محافظة الجوف | PPL | 80 | 33 | 77.56 | saada |
| as-sawas | السواس | As Sawās | محافظة الجوف | PPL | 80 | 38 | 82.52 | saada |
| ar-radi | الراضع | Ar Rāḑi‘ | محافظة الجوف | PPL | 80 | 30 | 82.70 | saada |
| bayt-al-waysh | بيت الويش | Bayt al Waysh | محافظة الجوف | PPL | 80 | 21 | 82.28 | saada |
| ad-dahl | الدحل | Ad Daḩl | محافظة الجوف | PPL | 80 | 24 | 82.06 | saada |
| al-ardimah-al-ulya | العرضمة العليا | Al ‘Arḑimah al ‘Ulyā | محافظة الجوف | PPL | 80 | 5 | 83.00 | saada |
| al-madlaj | المدلج | Al Madlaj | محافظة الجوف | PPL | 80 | 4 | 82.64 | saada |
| al-khasman | الخسمان | Al Khasmān | محافظة الجوف | PPL | 80 | 3 | 82.92 | saada |
| bayt-al-ama | بيت الآعمى | Bayt al Ā‘má | محافظة الجوف | PPL | 80 | 2 | 83.08 | saada |
| ar-raqah | الراقة | Ar Rāqah | محافظة الجوف | PPL | 80 | 2 | 82.15 | saada |
| hillat-al-biqaf | حلة البقاف | Ḩillat al Biqāf | محافظة الجوف | PPL | 80 | 3 | 81.62 | saada |
| al-wuayrah-al-ulya | الوعيرة العليا | Al Wu‘ayrah al ‘Ulyā | محافظة الجوف | PPL | 80 | 4 | 81.59 | saada |
| al-wuayrah-as-sufla | الوعيرة السفلى | Al Wu‘ayrah as Suflá | محافظة الجوف | PPL | 80 | 8 | 81.69 | saada |
| al-fari-al-aghbar | الفرع الأغبر | Al Fari‘ al Aghbar | محافظة الجوف | PPL | 80 | 4 | 81.74 | saada |
| mukhaylat-al-baruq | مخيلة البروق | Mukhaylat al Barūq | محافظة الجوف | PPL | 80 | 2 | 81.97 | saada |
| al-araq | العرق | Al ‘Araq | محافظة الجوف | PPL | 80 | 17 | 82.29 | saada |
| al-miqrah | المقرة | Al Miqrah | محافظة الجوف | PPL | 80 | 9 | 82.27 | saada |
| al-ghawjan | ال غوجان | Āl Ghawjān | محافظة الجوف | PPL | 80 | 14 | 83.48 | saada |
| al-hashil | ال هاشل | Āl Hāshil | محافظة الجوف | PPL | 80 | 24 | 83.67 | saada |
| al-hayjan | ال هيجان | Āl Hayjān | محافظة الجوف | PPL | 80 | 9 | 83.58 | saada |
| irq-dibbah | عرق دبة | ‘Irq Dibbah | محافظة الجوف | PPL | 80 | 6 | 83.84 | saada |
| subrah-al-ulya | صبرة العليا | Şubrah al ‘Ulyā | محافظة الجوف | PPL | 80 | 4 | 74.15 | saada |
| subrah-as-sufla | صبرة السفلى | Şubrah as Suflá | محافظة الجوف | PPL | 80 | 2 | 74.06 | saada |
| al-khaniq | الخنق | Al Khaniq | محافظة الجوف | PPL | 80 | 6 | 74.39 | saada |
| al-ras | الرأس | Al Ra’s | محافظة الجوف | PPL | 80 | 1 | 74.93 | saada |
| bin-hadyan | بن هديان | Bin Hadyān | محافظة الجوف | PPL | 80 | 2 | 74.17 | saada |
| al-bariqah | البرقة | Al Bariqah | محافظة الجوف | PPL | 80 | 16 | 73.98 | saada |
| al-qumr | القمر | Al Qumr | محافظة الجوف | PPL | 80 | 12 | 74.52 | saada |
| al-hijrah | الهجرة | Al Hijrah | محافظة الجوف | PPL | 80 | 14 | 74.67 | saada |
| ar-rahab | الرحب | Ar Raḩab | محافظة الجوف | PPL | 80 | 40 | 74.63 | saada |
| al-anabi | العنابي | Al ‘Anābī | محافظة الجوف | PPL | 80 | 31 | 74.78 | saada |
| al-anunah | العنونة | Al ‘Anūnah | محافظة الجوف | PPL | 80 | 30 | 74.56 | saada |
| al-salih-bin-nasir | آل صالح بن ناصر | Āl Şāliḩ Bin Nāşir | محافظة الجوف | PPL | 80 | 22 | 71.94 | saada |
| zafq-hamad | زفق حمد | Zafq Ḩamad | محافظة الجوف | PPL | 80 | 10 | 71.90 | saada |
| tishba | تشبع | Tishba‘ | محافظة الجوف | PPL | 80 | 31 | 72.41 | saada |
| al-khataq | الختق | Al Khataq | محافظة الجوف | PPL | 80 | 8 | 71.34 | saada |
| al-arishah | العريشة | Al ‘Arīshah | محافظة الجوف | PPL | 80 | 12 | 80.81 | saada |
| hawwah-hadhul | حوة حذول | Ḩawwah Ḩadhūl | محافظة الجوف | PPL | 80 | 5 | 82.39 | saada |
| al-qarhazah | القرحزة | Al Qarḩazah | محافظة الجوف | PPL | 80 | 7 | 80.78 | saada |
| dhi-salah | ذي صلاح | Dhī Şalāḩ | محافظة الجوف | PPL | 80 | 11 | 82.04 | saada |
| hariqat-idayliman | حارقة عضيلمان | Ḩāriqat ‘Iḑaylimān | محافظة الجوف | PPL | 80 | 21 | 82.29 | saada |
| jawwat-ash-shawf | جوة الشوف | Jawwat ash Shawf | محافظة الجوف | PPL | 80 | 15 | 81.23 | saada |
| hisn-an-naqib | حصن النقيب | Ḩişn an Naqīb | محافظة الجوف | PPL | 80 | 63 | 82.31 | saada |
| al-misak | المساك | Al Misāk | محافظة الجوف | PPL | 80 | 16 | 80.83 | saada |
| al-muhammad-bin-salim | ال محمد بن سالم | Āl Muḩammad Bin Sālim | محافظة الجوف | PPL | 80 | 12 | 81.93 | saada |
| al-irabah-as-sulfa | العرابة السفلى | Al ‘Irābah as Sulfá | محافظة الجوف | PPL | 80 | 10 | 82.48 | saada |
| muqbilah | مقبلة | Muqbilah | محافظة الجوف | PPL | 80 | 12 | 81.34 | saada |
| al-qumr | القمر | Al Qumr | محافظة الجوف | PPL | 80 | 29 | 82.46 | saada |
| al-mawbirah | الموبرة | Al Mawbirah | محافظة الجوف | PPL | 80 | 9 | 82.50 | saada |
| mahliyah | محلية | Maḩlīyah | محافظة الجوف | PPL | 80 | 25 | 82.08 | saada |
| al-malil | المليل | Al Malīl | محافظة الجوف | PPL | 80 | 11 | 82.35 | saada |
| al-makhrum | المخروم | Al Makhrūm | محافظة الجوف | PPL | 80 | 15 | 79.63 | saada |
| al-tisyaan | ال تسيعان | Āl Tisya‘ān | محافظة الجوف | PPL | 80 | 21 | 82.48 | saada |
| ad-dahl | الدحل | Ad Daḩl | محافظة الجوف | PPL | 80 | 24 | 79.77 | saada |
| ad-dayrah | الديرة | Ad Dayrah | محافظة الجوف | PPL | 80 | 15 | 78.39 | saada |
| al-al-qufuah | ال القفوعة | Āl al Qufū‘ah | محافظة الجوف | PPL | 80 | 21 | 80.61 | saada |
| al-matasir | المعتصر | Al Ma‘taşir | محافظة الجوف | PPL | 80 | 9 | 80.73 | saada |
| al-qurha | القرحاء | Al Qurḩā’ | محافظة الجوف | PPL | 80 | 10 | 82.41 | saada |
| jawar | جوار | Jawār | محافظة الجوف | PPL | 80 | 10 | 81.13 | saada |
| al-rayhan | ال ريحان | Āl Rayḩān | محافظة الجوف | PPL | 80 | 8 | 83.26 | saada |
| zubayd | زبيد | Zubayd | محافظة عمران | PPL | 80 | 7 | 68.90 | saada |
| al-hazm | الحزم | Al Ḩazm | محافظة عمران | PPL | 80 | 35 | 68.56 | saada |
| bayt-ayidah | بيت عيدة | Bayt ‘Ayidah | محافظة عمران | PPL | 80 | 6 | 68.51 | saada |
| bayt-kandush | بيت كندش | Bayt Kandush | محافظة عمران | PPL | 80 | 2 | 68.63 | saada |
| al-jabran | ال جبران | Āl Jabrān | محافظة عمران | PPL | 80 | 3 | 68.37 | saada |
| al-jahwah | الجهوة | Al Jahwah | محافظة الجوف | PPL | 80 | 1 | 69.55 | saada |
| as-safh | السفح | As Safḩ | محافظة الجوف | PPL | 80 | 1 | 69.39 | saada |
| maqrah | مقرح | Maqraḩ | محافظة عمران | PPL | 80 | 12 | 69.14 | saada |
| al-khalwayn | الخلوين | Al Khalwayn | محافظة حجة | PPL | 80 | 10 | 83.30 | saada |
| al-jurfa | الجرفاء | Al Jurfā’ | محافظة حجة | PPL | 80 | 5 | 76.39 | saada |
| al-qubrayn | القبرين | Al Qubrayn | محافظة حجة | PPL | 80 | 6 | 76.18 | saada |
| as-siwani | الصوانع | Aş Şiwāni‘ | محافظة حجة | PPL | 80 | 3 | 78.14 | saada |
| al-muslib | المصلب | Al Muşlib | محافظة حجة | PPL | 80 | 2 | 77.20 | saada |
| gharib-kirbas | غارب كرباس | Ghārib Kirbās | محافظة حجة | PPL | 80 | 4 | 81.08 | saada |
| al-mughaylah | المغيلة | Al Mughaylah | محافظة حجة | PPL | 80 | 5 | 79.26 | saada |
| al-maghribah | المغربة | Al Maghribah | محافظة حجة | PPL | 80 | 10 | 79.83 | saada |
| al-wasiyah | الوصية | Al Waşīyah | محافظة حجة | PPL | 80 | 7 | 80.02 | saada |
| al-burkah | البركة | Al Burkah | محافظة صعدة | PPL | 80 | 16 | 7.07 | saada |
| suq-al-jirbah | سوق الجربة | Sūq al Jirbah | محافظة حجة | PPL | 80 | 1 | 71.05 | saada |
| ghawl-hiban | غول حبان | Ghawl Ḩibān | محافظة حجة | PPL | 80 | 2 | 74.79 | saada |
| qasiyat-mari | قصية مرعي | Qaşīyat Mar‘ī | محافظة حجة | PPL | 80 | 13 | 78.74 | saada |
| mirwayk | مرويك | Mirwayk | محافظة عمران | PPL | 80 | 9 | 52.83 | saada |
| shati-al-bidah | شاطئ البدعــة | Shāţi’ al Bid‘ah | محافظة عمران | PPL | 80 | 9 | 53.17 | saada |
| al-ghumr | الغمـر | Al Ghumr | محافظة عمران | PPL | 80 | 46 | 52.70 | saada |
| al-hawban | الحوبان | Al Ḩawbān | محافظة عمران | PPL | 80 | 22 | 52.96 | saada |
| shimakh | شماخ | Shimākh | محافظة عمران | PPL | 80 | 9 | 52.73 | saada |
| hayjat-barrum | هيجة برم | Hayjat Barrum | محافظة عمران | PPL | 80 | 14 | 52.05 | saada |
| ash-shaf | الشعف | Ash Sha‘f | محافظة عمران | PPL | 80 | 15 | 53.07 | saada |
| majlil | مجليل | Majlīl | محافظة عمران | PPL | 80 | 14 | 51.71 | saada |
| al-armidah | العرمضة | Al ‘Armiḑah | محافظة عمران | PPL | 80 | 40 | 52.20 | saada |
| qarn-zahirah | قرن زاهرة | Qarn Zāhirah | محافظة عمران | PPL | 80 | 21 | 53.20 | saada |
| al-mahdhat | المحذاة | Al Maḩdhāt | محافظة عمران | PPL | 80 | 8 | 52.98 | saada |
| al-muzayzah | المظيظة | Al Muz̧ayz̧ah | محافظة عمران | PPL | 80 | 24 | 51.78 | saada |
| mandil | منديل | Mandīl | محافظة عمران | PPL | 80 | 12 | 50.23 | saada |
| dhu-bayhan | ذو بيحان | Dhū Bayḩān | محافظة عمران | PPL | 80 | 6 | 51.55 | saada |
| al-miqatir | المقاطر | Al Miqāţir | محافظة عمران | PPL | 80 | 4 | 52.48 | saada |
| mazqar | مزقر | Mazqar | محافظة عمران | PPL | 80 | 4 | 52.92 | saada |
| ghawl-sayf | غول سيـف | Ghawl Sayf | محافظة عمران | PPL | 80 | 4 | 52.98 | saada |
| al-muwaqi | المواقـع | Al Muwāqi‘ | محافظة عمران | PPL | 80 | 4 | 54.24 | saada |
| hayjat-hajr | هيجة حجـر | Hayjat Ḩajr | محافظة عمران | PPL | 80 | 19 | 53.37 | saada |
| usayb | عسيب | ‘Usayb | محافظة عمران | PPL | 80 | 17 | 54.14 | saada |
| al-arishah | العريشة | Al ‘Arīshah | محافظة عمران | PPL | 80 | 5 | 54.48 | saada |
| kharab-mudayiz | خراب مدعيز | Kharāb Mud‘ayiz | محافظة عمران | PPL | 80 | 6 | 75.67 | saada |
| al-fatiri | الفطيري | Al Faţīrī | محافظة عمران | PPL | 80 | 6 | 77.04 | saada |
| athlah | عتلة | ‘Athlah | محافظة عمران | PPL | 80 | 2 | 77.63 | saada |
| mitrash | مطراش | Miţrāsh | محافظة عمران | PPL | 80 | 3 | 76.18 | saada |
| al-hawamirah | الحومرة | Al Ḩawamirah | محافظة عمران | PPL | 80 | 1 | 76.94 | saada |
| al-hawq | الحوق | Al Ḩawq | محافظة عمران | PPL | 80 | 6 | 77.16 | saada |
| as-safih | الصافح | Aş Şāfiḩ | محافظة عمران | PPL | 80 | 3 | 77.74 | saada |
| al-faqi | الفاقع | Al Fāqi‘ | محافظة عمران | PPL | 80 | 3 | 77.99 | saada |
| ash-shariqat | الشريفات | Ash Sharīqāt | محافظة عمران | PPL | 80 | 7 | 77.71 | saada |
| dhu-naji | ذو ناجي | Dhū Nājī | محافظة عمران | PPL | 80 | 3 | 76.21 | saada |
| dhu-buras | ذو بوراس | Dhū Būrās | محافظة عمران | PPL | 80 | 2 | 76.29 | saada |
| dhu-fusaylah | ذو فصيلة | Dhū Fuşaylah | محافظة عمران | PPL | 80 | 2 | 76.37 | saada |
| al-hadumi | الحدومي | Al Ḩadūmī | محافظة عمران | PPL | 80 | 2 | 75.63 | saada |
| al-qushaybi | القشيبي | Al Qushaybī | محافظة عمران | PPL | 80 | 2 | 75.88 | saada |
| al-aqiliyah-ad-dakhliyah | العاقلية الداخلية | Al ‘Āqilīyah ad Dākhlīyah | محافظة عمران | PPL | 80 | 2 | 77.79 | saada |
| qawm-as-saidi | قوم السعيدي | Qawm as Sa‘īdī | محافظة عمران | PPL | 80 | 3 | 73.84 | saada |
| qawm-al-fatiri | قوم الفطري | Qawm al Faţirī | محافظة عمران | PPL | 80 | 3 | 73.60 | saada |
| qawm-al-jubashi | قوم الجبشعي | Qawm al Jubash‘ī | محافظة عمران | PPL | 80 | 3 | 72.32 | saada |
| dhu-naji | ذو ناجي | Dhū Nājī | محافظة عمران | PPL | 80 | 3 | 72.81 | saada |
| dhu-bura | ذو بوراع | Dhū Būrā‘ | محافظة عمران | PPL | 80 | 4 | 72.37 | saada |
| bayt-al-faqih | بيت الفقيه | Bayt al Faqīh | محافظة عمران | PPL | 80 | 3 | 72.23 | saada |
| bayt-al-harfi | بيت الحرفي | Bayt al Ḩarfī | محافظة عمران | PPL | 80 | 2 | 76.75 | saada |
| al-aqiliyah-al-ulya | العاقلية العليا | Al ‘Āqilīyah al ‘Ulyā | محافظة عمران | PPL | 80 | 2 | 78.15 | saada |
| al-aqiliyah-as-sufla | العاقلية السفلى | Al ‘Āqilīyah as Suflá | محافظة عمران | PPL | 80 | 3 | 78.05 | saada |
| al-aqiliyah-al-wasitah | العاقلية الواسطة | Al ‘Āqilīyah al Wāsiţah | محافظة عمران | PPL | 80 | 3 | 77.97 | saada |
| abu-suwayd-al-husni | أبو سويد الحسني | Abū Suwayd al Ḩusnī | محافظة عمران | PPL | 80 | 33 | 63.59 | saada |
| qudbah | قضبة | Quḑbah | محافظة عمران | PPL | 80 | 7 | 64.55 | saada |
| al-biran | البران | Al Birān | محافظة عمران | PPL | 80 | 17 | 65.64 | saada |
| jurayz-asfal | جريز أسفل | Jurayz Asfal | محافظة عمران | PPL | 80 | 5 | 68.60 | saada |
| as-sud | السؤد | As Su’d | محافظة عمران | PPL | 80 | 13 | 68.48 | saada |
| ghawl-al-maddi | غول المضي | Ghawl al Maḑḑī | محافظة عمران | PPL | 80 | 11 | 67.65 | saada |
| shati-ad-dibb | شاطى الضب | Shāţi’ aḑ Ḑibb | محافظة عمران | PPL | 80 | 4 | 68.18 | saada |
| ad-dughar | الدغار | Ad Dughār | محافظة عمران | PPL | 80 | 11 | 64.79 | saada |
| milhan | ملحان | Milḩān | محافظة عمران | PPL | 80 | 6 | 67.02 | saada |
| al-usra | العصراء | Al ‘Uşrā’ | محافظة عمران | PPL | 80 | 11 | 72.04 | saada |
| majlil | مجليل | Majlīl | محافظة عمران | PPL | 80 | 18 | 72.18 | saada |
| bitabit | بطابط | Biţābiţ | محافظة عمران | PPL | 80 | 3 | 71.93 | saada |
| ghawl-al-madd | غول المض | Ghawl al Maḑḑ | محافظة عمران | PPL | 80 | 7 | 71.04 | saada |
| shati-sadah | شاطئ سعدة | Shāţi’ Sa‘dah | محافظة عمران | PPL | 80 | 13 | 72.97 | saada |
| al-gharafi | الغرافى | Al Gharāfī | محافظة عمران | PPL | 80 | 13 | 73.12 | saada |
| al-waqirah | الوقيرة | Al Waqīrah | محافظة عمران | PPL | 80 | 2 | 73.45 | saada |
| al-bahtirah | البحطيرة | Al Baḩţīrah | محافظة عمران | PPL | 80 | 30 | 70.17 | saada |
| hadiyah | حدية | Ḩadīyah | محافظة عمران | PPL | 80 | 1 | 70.85 | saada |
| ghawl-al-buwayish | غول البوايش | Ghawl al Buwāyish | محافظة عمران | PPL | 80 | 20 | 71.74 | saada |
| naamah | نعامة | Na‘āmah | محافظة عمران | PPL | 80 | 23 | 59.67 | saada |
| shati-al-jurayda | شاطئ الجريداء | Shāţi’ al Juraydā’ | محافظة عمران | PPL | 80 | 20 | 53.88 | saada |
| bayt-wahban | بيت وهبان | Bayt Wahbān | محافظة عمران | PPL | 80 | 3 | 76.38 | saada |
| mihyat-alam | محياة أعلم | Miḩyāt A‘lam | محافظة عمران | PPL | 80 | 2 | 76.77 | saada |
| hadibat-dukhar | حدبة ضخار | Ḩadibat Ḑukhār | محافظة عمران | PPL | 80 | 11 | 70.80 | saada |
| ghazwah | غزوة | Ghazwah | محافظة عمران | PPL | 80 | 6 | 68.68 | saada |
| al-mawqir | الموقر | Al Mawqir | محافظة عمران | PPL | 80 | 2 | 67.67 | saada |
| hadibi-dhu-faiz | حدبي ذو فائز | Ḩadibī Dhū Fā’iz | محافظة عمران | PPL | 80 | 10 | 68.11 | saada |
| al-mihwar | المحوار | Al Miḩwār | محافظة عمران | PPL | 80 | 9 | 67.64 | saada |
| ad-dudamah | الضدامة | Aḑ Ḑudāmah | محافظة عمران | PPL | 80 | 6 | 66.92 | saada |
| khurayfan | خريفان | Khurayfān | محافظة عمران | PPL | 80 | 1 | 67.36 | saada |
| dhu-rafi | ذو رافع | Dhū Rāfi‘ | محافظة عمران | PPL | 80 | 13 | 67.66 | saada |
| gharib-rajih | غارب رجح | Ghārib Rajiḩ | محافظة عمران | PPL | 80 | 4 | 74.97 | saada |
| ad-dahrah | الدحرة | Ad Daḩrah | محافظة عمران | PPL | 80 | 22 | 71.88 | saada |
| al-hijrah | الهجرة | Al Hijrah | محافظة عمران | PPL | 80 | 13 | 72.42 | saada |
| qarn-kuhayl | قرن كحيل | Qarn Kuḩayl | محافظة عمران | PPL | 80 | 20 | 70.80 | saada |
| ash-shawaqi | السواقي | Ash Shawāqī | محافظة عمران | PPL | 80 | 19 | 69.70 | saada |
| ar-rabuah | الربوعة | Ar Rabū‘ah | محافظة عمران | PPL | 80 | 18 | 71.41 | saada |
| ash-shaawithah | الشعاوثة | Ash Sha‘āwithah | محافظة عمران | PPL | 80 | 2 | 69.95 | saada |
| abu-sharqiyah | أبو شرقية | Abū Sharqīyah | محافظة عمران | PPL | 80 | 1 | 70.94 | saada |
| qarn-al-kharaf | قرن الخرف | Qarn al Kharaf | محافظة عمران | PPL | 80 | 9 | 67.10 | saada |
| al-winnan | الونان | Al Winnān | محافظة عمران | PPL | 80 | 23 | 66.99 | saada |
| al-hayjah | الهيجة | Al Hayjah | محافظة عمران | PPL | 80 | 22 | 67.25 | saada |
| al-fara | الفراع | Al Farā‘ | محافظة عمران | PPL | 80 | 17 | 66.92 | saada |
| ash-shaqqab | الشقب | Ash Shaqqab | محافظة عمران | PPL | 80 | 7 | 68.68 | saada |
| ash-shajn | الشجن | Ash Shajn | محافظة عمران | PPL | 80 | 5 | 67.70 | saada |
| al-awayah | الأواية | Al Awāyah | محافظة عمران | PPL | 80 | 3 | 71.22 | saada |
| al-mishbah | المشبة | Al Mishbah | محافظة عمران | PPL | 80 | 2 | 70.71 | saada |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة عمران | PPL | 80 | 1 | 71.07 | saada |
| al-arjaf | العرجف | Al ‘Arjaf | محافظة عمران | PPL | 80 | 2 | 71.53 | saada |
| qurdu | قردوع | Qurdū‘ | محافظة عمران | PPL | 80 | 1 | 73.61 | saada |
| dhu-qumsan | ذو قمسان | Dhū Qumsān | محافظة عمران | PPL | 80 | 6 | 73.93 | saada |
| qarn-dhu-hayd | قرن ذو حيد | Qarn Dhū Ḩayd | محافظة عمران | PPL | 80 | 10 | 74.60 | saada |
| ash-shiah | الشيعة | Ash Shī‘ah | محافظة عمران | PPL | 80 | 11 | 72.81 | saada |
| al-maawil | المعاويل | Al Ma‘āwīl | محافظة عمران | PPL | 80 | 23 | 71.12 | saada |
| az-zihar-al-ala | الظهار الأعلى | Az̧ Z̧ihār al A‘lá | محافظة عمران | PPL | 80 | 7 | 71.83 | saada |
| al-mukhaym | المخيم | Al Mukhaym | محافظة عمران | PPL | 80 | 10 | 72.62 | saada |
| ash-shati | الشاطئ | Ash Shāţi’ | محافظة عمران | PPL | 80 | 7 | 72.39 | saada |
| dhu-sarabi | ذو صربي | Dhū Şarabī | محافظة عمران | PPL | 80 | 16 | 73.53 | saada |
| az-zihar-al-asfal | الظهار الأسفل | Az̧ Z̧ihār al Asfal | محافظة عمران | PPL | 80 | 7 | 70.85 | saada |
| az-zala | الزعلا | Az Za‘lā | محافظة عمران | PPL | 80 | 15 | 73.30 | saada |
| qawm-hadi | قوم هادي | Qawm Hādī | محافظة عمران | PPL | 80 | 8 | 67.95 | saada |
| qawm-al-ajlani | قوم العجلاني | Qawm al ‘Ajlānī | محافظة عمران | PPL | 80 | 7 | 66.23 | saada |
| az-zihar | الظهار | Az̧ Z̧ihār | محافظة عمران | PPL | 80 | 11 | 64.27 | saada |
| sawlah | صولاح | Şawlāḩ | محافظة عمران | PPL | 80 | 6 | 64.85 | saada |
| mashhaf | مشهف | Mashhaf | محافظة عمران | PPL | 80 | 22 | 63.17 | saada |
| al-ghallah | الغالة | Al Ghāllah | محافظة عمران | PPL | 80 | 4 | 64.54 | saada |
| qasabat-aziz | قصبة عزيز | Qaşabat ‘Azīz | محافظة عمران | PPL | 80 | 13 | 63.14 | saada |
| qasabat-mitash | قصبة متاش | Qaşabat Mitāsh | محافظة عمران | PPL | 80 | 12 | 63.14 | saada |
| kiran | كران | Kirān | محافظة عمران | PPL | 80 | 10 | 63.70 | saada |
| as-sirbah | السربة | As Sirbah | محافظة عمران | PPL | 80 | 27 | 63.17 | saada |
| ash-shamiyah | الشامية | Ash Shāmīyah | محافظة عمران | PPL | 80 | 15 | 60.76 | saada |
| al-maqlab | المقلب | Al Maqlab | محافظة عمران | PPL | 80 | 3 | 61.20 | saada |
| qawm-sad | قوم سعد | Qawm Sa‘d | محافظة عمران | PPL | 80 | 6 | 61.45 | saada |
| al-luzzah | اللزة | Al Luzzah | محافظة عمران | PPL | 80 | 16 | 61.45 | saada |
| al-qarn-al-aghbar | القرن الأغبر | Al Qarn al Aghbar | محافظة عمران | PPL | 80 | 5 | 61.66 | saada |
| ash-shaqqab | الشقب | Ash Shaqqab | محافظة عمران | PPL | 80 | 5 | 61.69 | saada |
| al-balisah | البلسة | Al Balisah | محافظة عمران | PPL | 80 | 17 | 61.98 | saada |
| al-hadibah-al-wista | الحدبة الوسطى | Al Ḩadibah al Wisţá | محافظة عمران | PPL | 80 | 5 | 62.03 | saada |
| ghayl-al-abla | غيل العبلاء | Ghayl al ‘Ablā’ | محافظة عمران | PPL | 80 | 6 | 70.66 | saada |
| qasabat-jabir | قصبة جابر | Qaşabat Jābir | محافظة عمران | PPL | 80 | 6 | 71.24 | saada |
| qasabat-qawm-hadi | قصبة قوم هادي | Qaşabat Qawm Hādī | محافظة عمران | PPL | 80 | 24 | 70.87 | saada |
| qawm-muqbil | قوم مقبل | Qawm Muqbil | محافظة عمران | PPL | 80 | 8 | 71.59 | saada |
| as-saribah | الصربة | Aş Şaribah | محافظة عمران | PPL | 80 | 23 | 70.17 | saada |
| dhu-dahsh | ذو داحش | Dhū Dāḩsh | محافظة عمران | PPL | 80 | 13 | 70.31 | saada |
| qawm-talan | قوم طلان | Qawm Ţalān | محافظة عمران | PPL | 80 | 26 | 69.46 | saada |
| qawm-muqtayb | قوم مقطيب | Qawm Muqţayb | محافظة عمران | PPL | 80 | 21 | 70.31 | saada |
| shurhah | شرحة | Shurḩah | محافظة عمران | PPL | 80 | 27 | 74.09 | saada |
| dhu-maysir | ذو الميسر | Dhū Maysir | محافظة عمران | PPL | 80 | 31 | 78.41 | saada |
| al-mughlah | المغلاه | Al Mughlāh | محافظة عمران | PPL | 80 | 19 | 74.56 | saada |
| al-akkan | العكن | Al ‘Akkan | محافظة عمران | PPL | 80 | 9 | 79.41 | saada |
| ath-thaybah | الثيبة | Ath Thaybah | محافظة عمران | PPL | 80 | 25 | 78.09 | saada |
| al-adanah | العدنة | Al ‘Adanah | محافظة عمران | PPL | 80 | 14 | 76.85 | saada |
| al-qawad | القواد | Al Qawād | محافظة حجة | PPL | 80 | 7 | 62.81 | saada |
| as-sarabi | الصرابي | Aş Şarābī | محافظة حجة | PPL | 80 | 5 | 59.79 | saada |
| al-batayha | البطيحاء | Al Baţayḩā’ | محافظة حجة | PPL | 80 | 6 | 60.38 | saada |
| abu-ramadah | أبو رمادة | Abū Ramādah | محافظة حجة | PPL | 80 | 11 | 63.71 | saada |
| ar-rakib | الركب | Ar Rakib | محافظة حجة | PPL | 80 | 11 | 62.94 | saada |
| ghawl-as-sawda | غول السوداء | Ghawl as Sawdā’ | محافظة حجة | PPL | 80 | 4 | 62.68 | saada |
| as-sawab | الصوان | Aş Şawāb | محافظة حجة | PPL | 80 | 2 | 61.44 | saada |
| hiran | هران | Hirān | محافظة حجة | PPL | 80 | 7 | 61.79 | saada |
| dubaylah | دبيلة | Dubaylah | محافظة حجة | PPL | 80 | 3 | 61.45 | saada |
| an-nudaysh | النديش | An Nudaysh | محافظة حجة | PPL | 80 | 6 | 61.04 | saada |
| darwish | درويش | Darwīsh | محافظة حجة | PPL | 80 | 4 | 60.04 | saada |
| al-malahiyat | الملاحيات | Al Malāḩiyāt | محافظة حجة | PPL | 80 | 5 | 58.90 | saada |
| gharib-al-jahim | غارب الجحيم | Ghārib al Jaḩīm | محافظة حجة | PPL | 80 | 2 | 55.92 | saada |
| dabush | دعبوش | Da‘būsh | محافظة حجة | PPL | 80 | 3 | 61.74 | saada |
| al-waqair | الوقائر | Al Waqā’ir | محافظة حجة | PPL | 80 | 6 | 61.59 | saada |
| al-jarashib | الجراشب | Al Jarāshib | محافظة حجة | PPL | 80 | 3 | 62.72 | saada |
| umm-ash-shuraykh | أم الشريج | Umm ash Shuraykh | محافظة حجة | PPL | 80 | 3 | 63.57 | saada |
| ash-shuraykh-al-hadi | الشريج الهادي | Ash Shuraykh al Hādī | محافظة حجة | PPL | 80 | 8 | 57.08 | saada |
| sahimah | سهمة | Sahimah | محافظة حجة | PPL | 80 | 8 | 60.51 | saada |
| afqaah | أفقعـة | Afqa‘ah | محافظة حجة | PPL | 80 | 4 | 55.14 | saada |
| mudir | مديــر | Mudīr | محافظة حجة | PPL | 80 | 4 | 54.45 | saada |
| madrah | مدرة | Madrah | محافظة حجة | PPL | 80 | 5 | 54.94 | saada |
| al-qimah | القيمة | Al Qīmah | محافظة حجة | PPL | 80 | 3 | 54.54 | saada |
| al-malatah | الملطة | Al Malaţah | محافظة حجة | PPL | 80 | 3 | 54.41 | saada |
| nuqaybah | نقيبة | Nuqaybah | محافظة حجة | PPL | 80 | 11 | 59.79 | saada |
| al-baqili | الباقلي | Al Bāqilī | محافظة حجة | PPL | 80 | 5 | 60.01 | saada |
| ash-shuraykh-ash-shaqq | الشريج الشق | Ash Shuraykh ash Shaqq | محافظة حجة | PPL | 80 | 6 | 58.38 | saada |
| husaykah | حصيكــة | Ḩuşaykah | محافظة حجة | PPL | 80 | 9 | 58.10 | saada |
| miyahah | مياحة | Miyāḩah | محافظة حجة | PPL | 80 | 13 | 56.70 | saada |
| qarn-bin-suqah | قرن بن سوقة | Qarn Bin Sūqah | محافظة حجة | PPL | 80 | 5 | 69.16 | saada |
| ghawl-al-mirdani | غول المرداني | Ghawl al Mirdānī | محافظة حجة | PPL | 80 | 4 | 69.31 | saada |
| bukhayt | بخيت | Bukhayt | محافظة حجة | PPL | 80 | 7 | 69.41 | saada |
| qarn-al-madfa | قرن المدفع | Qarn al Madfa‘ | محافظة حجة | PPL | 80 | 5 | 67.87 | saada |
| at-tiffah | الطفة | Aţ Ţiffah | محافظة حجة | PPL | 80 | 6 | 69.79 | saada |
| al-makarkam | المكركم | Al Makarkam | محافظة حجة | PPL | 80 | 5 | 69.75 | saada |
| raqlat-shibaah | رقلة شباعة | Raqlat Shibā‘ah | محافظة حجة | PPL | 80 | 8 | 69.98 | saada |
| maqur | مقعور | Maq‘ūr | محافظة حجة | PPL | 80 | 3 | 70.34 | saada |
| al-kiyal | الكيال | Al Kiyāl | محافظة حجة | PPL | 80 | 9 | 70.05 | saada |
| ad-dashyat | الدشيات | Ad Dashyāt | محافظة حجة | PPL | 80 | 10 | 70.99 | saada |
| al-hunaya | الحنايا | Al Ḩunāyā | محافظة حجة | PPL | 80 | 6 | 69.21 | saada |
| al-aridah | العارضة | Al ‘Āriḑah | محافظة حجة | PPL | 80 | 3 | 70.44 | saada |
| al-marwah | المروة | Al Marwah | محافظة حجة | PPL | 80 | 2 | 69.86 | saada |
| al-jubaybah | الجبيبة | Al Jubaybah | محافظة حجة | PPL | 80 | 3 | 72.50 | saada |
| mablaghah | مبلغة | Mablaghah | محافظة حجة | PPL | 80 | 5 | 64.79 | saada |
| al-majbut | المجبت | Al Majbut | محافظة حجة | PPL | 80 | 3 | 65.36 | saada |
| al-maqar | المقر | Al Maqar | محافظة حجة | PPL | 80 | 2 | 70.88 | saada |
| al-qasib | القصب | Al Qaşib | محافظة حجة | PPL | 80 | 4 | 70.87 | saada |
| al-mudrib | المضرب | Al Muḑrib | محافظة حجة | PPL | 80 | 4 | 70.88 | saada |
| ash-shujaah | الشجاعة | Ash Shujā‘ah | محافظة حجة | PPL | 80 | 4 | 71.06 | saada |
| ad-dashyat-al-kubra | الدشيات الكبرى | Ad Dashyāt al Kubrá | محافظة حجة | PPL | 80 | 3 | 70.95 | saada |
| al-qatifah | القطفة | Al Qaţifah | محافظة حجة | PPL | 80 | 3 | 70.83 | saada |
| al-jindali | الجندلي | Al Jindalī | محافظة حجة | PPL | 80 | 26 | 66.60 | saada |
| bani-talib | بني طالب | Banī Ţālib | محافظة حجة | PPL | 80 | 3 | 68.39 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة حجة | PPL | 80 | 2 | 68.02 | saada |
| maqar-al-aswad | مقر الأسود | Maqar al Aswad | محافظة حجة | PPL | 80 | 1 | 67.92 | saada |
| shuraykh-al-bill | شريخ البل | Shuraykh al Bill | محافظة حجة | PPL | 80 | 3 | 67.52 | saada |
| murzim-al-husayn | مرزم الحسين | Murzim al Ḩusayn | محافظة حجة | PPL | 80 | 5 | 65.89 | saada |
| shati-az-zabr | شاطئ الظــبر | Shāţi’ az̧ Z̧abr | محافظة حجة | PPL | 80 | 6 | 67.20 | saada |
| tulaylah | طليلـة | Ţulaylah | محافظة حجة | PPL | 80 | 4 | 65.89 | saada |
| al-madid | المديد | Al Madīd | محافظة حجة | PPL | 80 | 2 | 65.47 | saada |
| ghawl-al-arjat | غول العرجات | Ghawl al ‘Arjāt | محافظة حجة | PPL | 80 | 2 | 66.33 | saada |
| dhira-qayid | ذراع قايد | Dhirā’ Qāyid | محافظة حجة | PPL | 80 | 2 | 66.74 | saada |
| dhira-al-qiblah | ذراع القبلة | Dhirā‘ al Qiblah | محافظة حجة | PPL | 80 | 1 | 65.73 | saada |
| ghalib-an-nur | غالب النور | Ghālib an Nūr | محافظة حجة | PPL | 80 | 2 | 65.96 | saada |
| rakah | راكة | Rākah | محافظة حجة | PPL | 80 | 2 | 66.28 | saada |
| ghalib-fadilah | غالب فضلة | Ghālib Faḑilah | محافظة حجة | PPL | 80 | 3 | 66.33 | saada |
| al-badh | البدح | Al Badḩ | محافظة حجة | PPL | 80 | 2 | 66.53 | saada |
| al-hadd | الحض | Al Ḩaḑḑ | محافظة حجة | PPL | 80 | 3 | 66.73 | saada |
| gharib-ad-darb | غارب الدرب | Ghārib ad Darb | محافظة حجة | PPL | 80 | 12 | 63.67 | saada |
| qarn-at-tibbaz | قرن الطباز | Qarn aţ Ţibbāz | محافظة حجة | PPL | 80 | 1 | 64.13 | saada |
| tahar-al-hisn | طهر الحصن | Ţahar al Ḩişn | محافظة حجة | PPL | 80 | 2 | 64.27 | saada |
| ghawl-ash-shar | غول الشار | Ghawl ash Shār | محافظة حجة | PPL | 80 | 1 | 64.91 | saada |
| qazhi | قزحي | Qazḩī | محافظة حجة | PPL | 80 | 6 | 64.84 | saada |
| gharat-as-suq | غارة السوق | Ghārat as Sūq | محافظة حجة | PPL | 80 | 2 | 64.30 | saada |
| ghawl-al-kadah | غول الكادة | Ghawl al Kādah | محافظة حجة | PPL | 80 | 3 | 64.38 | saada |
| ghawl-fatimah | غول فاطمة | Ghawl Fāţimah | محافظة حجة | PPL | 80 | 4 | 64.85 | saada |
| kursa-an-nawab | كرسى النوب | Kursá an Nawab | محافظة حجة | PPL | 80 | 3 | 67.90 | saada |
| ad-damariyah | الضمارية | Aḑ Ḑamārīyah | محافظة حجة | PPL | 80 | 3 | 66.63 | saada |
| al-ashshah | العشة | Al ‘Ashshah | محافظة حجة | PPL | 80 | 8 | 66.04 | saada |
| qarn-al-misal | قرن المعسال | Qarn al Mi‘sāl | محافظة حجة | PPL | 80 | 1 | 65.98 | saada |
| qarn-dhayban | قرن ذيبان | Qarn Dhaybān | محافظة حجة | PPL | 80 | 1 | 65.46 | saada |
| gharib-al-maqsam | غارب المقسم | Ghārib al Maqsam | محافظة حجة | PPL | 80 | 3 | 65.66 | saada |
| al-musfihah | المصفحــة | Al Muşfiḩah | محافظة حجة | PPL | 80 | 2 | 64.32 | saada |
| hisn-al-bariqah | حصن البرقة | Ḩişn al Bariqah | محافظة حجة | PPL | 80 | 1 | 64.84 | saada |
| al-mashribah | المشربة | Al Mashribah | محافظة حجة | PPL | 80 | 2 | 65.06 | saada |
| al-qashat | القشاط | Al Qashāţ | محافظة حجة | PPL | 80 | 2 | 68.61 | saada |
| al-qashat-al-ala | القشاط الأعلى | Al Qashāţ al A‘lá | محافظة حجة | PPL | 80 | 4 | 68.25 | saada |
| al-manjaf | المنجـف | Al Manjaf | محافظة حجة | PPL | 80 | 1 | 67.54 | saada |
| al-madwi | المدوي | Al Madwī | محافظة حجة | PPL | 80 | 3 | 67.29 | saada |
| al-miqshaah | المقشعـة | Al Miqsha‘ah | محافظة حجة | PPL | 80 | 8 | 62.66 | saada |
| az-zalah | الظلعة | Az̧ Z̧al‘ah | محافظة حجة | PPL | 80 | 4 | 61.20 | saada |
| ar-rudayh | الرديح | Ar Rudayḩ | محافظة حجة | PPL | 80 | 6 | 61.43 | saada |
| abu-al-hunayah | أبو الحناية | Abū al Ḩunāyah | محافظة حجة | PPL | 80 | 5 | 62.08 | saada |
| shaar | شعار | Sha‘ār | محافظة حجة | PPL | 80 | 5 | 63.86 | saada |
| ghadir | غدير | Ghadīr | محافظة حجة | PPL | 80 | 9 | 63.66 | saada |
| umm-al-aruq | أم العروق | Umm al ‘Arūq | محافظة حجة | PPL | 80 | 27 | 64.32 | saada |
| az-zafah | الزعفة | Az Za‘fah | محافظة حجة | PPL | 80 | 9 | 66.16 | saada |
| ad-dahr-abath | الداحر عابث | Ad Dāḩr ‘Ābath | محافظة حجة | PPL | 80 | 12 | 64.14 | saada |
| ashshat-as-sawdin | عشة السودن | ‘Ashshat as Sawdin | محافظة حجة | PPL | 80 | 2 | 64.60 | saada |
| al-mughsil | المغسل | Al Mughsil | محافظة حجة | PPL | 80 | 5 | 62.81 | saada |
| jawjiraf | جوجراف | Jawjirāf | محافظة حجة | PPL | 80 | 2 | 63.23 | saada |
| surays | سرعيس | Sur‘ays | محافظة حجة | PPL | 80 | 7 | 61.82 | saada |
| al-jaadil | الجعادل | Al Ja‘ādil | محافظة حجة | PPL | 80 | 3 | 62.98 | saada |
| ad-dumaydim | الدميدم | Ad Dumaydim | محافظة حجة | PPL | 80 | 4 | 65.24 | saada |
| gharib-yarwaz | غارب يرواز | Ghārib Yarwāz | محافظة حجة | PPL | 80 | 3 | 56.79 | saada |
| qadi-al-ala | قاضي الأعلى | Qāḑī al A‘lá | محافظة حجة | PPL | 80 | 2 | 56.59 | saada |
| radhah-ash-shurayl | ردحة الشريل | Radḩah ash Shurayl | محافظة صعدة | PPL | 80 | 9 | 56.19 | saada |
| al-mashaf | المشاف | Al Mashāf | محافظة صعدة | PPL | 80 | 4 | 56.05 | saada |
| at-turbah | التربة | At Turbah | محافظة صعدة | PPL | 80 | 3 | 57.03 | saada |
| qaim-isa | قائم عيسى | Qā’im ‘Īsá | محافظة صعدة | PPL | 80 | 3 | 60.47 | saada |
| al-mashabi | المشابيح | Al Mashābī‘ | محافظة صعدة | PPL | 80 | 17 | 57.88 | saada |
| al-ghurzah | الغرزة | Al Ghurzah | محافظة صعدة | PPL | 80 | 2 | 58.24 | saada |
| dhira-al-muhayb | ذراع المحيب | Dhirā‘ al Muḩayb | محافظة صعدة | PPL | 80 | 1 | 57.51 | saada |
| al-kirfuh | الكرفوح | Al Kirfūḩ | محافظة صعدة | PPL | 80 | 3 | 60.47 | saada |
| al-basitah | البسطة | Al Basiţah | محافظة صعدة | PPL | 80 | 5 | 60.32 | saada |
| al-julhib | الجلحيب | Al Julḩīb | محافظة صعدة | PPL | 80 | 3 | 57.54 | saada |
| al-qatat | القطعات | Al Qaţ‘āt | محافظة صعدة | PPL | 80 | 5 | 57.57 | saada |
| ar-razmah | الرزمة | Ar Razmah | محافظة صعدة | PPL | 80 | 1 | 57.44 | saada |
| hayfat-as-subayqah | حيفة السبيقة | Ḩayfat as Subayqah | محافظة صعدة | PPL | 80 | 3 | 57.37 | saada |
| thahir-al-hamrah | ثاهر الحمرة | Thāhir al Ḩamrah | محافظة صعدة | PPL | 80 | 1 | 57.17 | saada |
| al-barirah | البريرة | Al Barīrah | محافظة صعدة | PPL | 80 | 2 | 57.26 | saada |
| thahir-al-waqidah | ثاهر الوقيدة | Thāhir al Waqīdah | محافظة صعدة | PPL | 80 | 2 | 56.87 | saada |
| ash-sharafiyah | الشرفية | Ash Sharafīyah | محافظة صعدة | PPL | 80 | 1 | 56.69 | saada |
| ad-duhabil | الدحابل | Ad Duḩābil | محافظة صعدة | PPL | 80 | 3 | 56.96 | saada |
| as-sabih | السابح | As Sābiḩ | محافظة صعدة | PPL | 80 | 2 | 56.87 | saada |
| al-muhayb | المحيب | Al Muḩayb | محافظة صعدة | PPL | 80 | 1 | 56.88 | saada |
| qaim-salimah | قائم سليمة | Qā’im Salīmah | محافظة صعدة | PPL | 80 | 2 | 56.99 | saada |
| al-maqtal | المقتل | Al Maqtal | محافظة صعدة | PPL | 80 | 1 | 56.90 | saada |
| shuub-bin-abidah | شعوب بن عبدة | Shu‘ūb Bin ‘Abidah | محافظة صعدة | PPL | 80 | 1 | 57.03 | saada |
| al-madraj | المدرج | Al Madraj | محافظة صعدة | PPL | 80 | 2 | 57.04 | saada |
| al-arram | العرام | Al ‘Arrām | محافظة صعدة | PPL | 80 | 1 | 57.26 | saada |
| hariqat-al-juhaynah | حريقة الجحينة | Ḩarīqat al Juḩaynah | محافظة صعدة | PPL | 80 | 1 | 57.16 | saada |
| al-mityanah | المطيانة | Al Miţyānah | محافظة صعدة | PPL | 80 | 1 | 56.88 | saada |
| gharib-hathayt | غارب حتحيت | Ghārib Ḩatḩayt | محافظة صعدة | PPL | 80 | 2 | 57.13 | saada |
| al-afla | العفلاء | Al ‘Aflā’ | محافظة صعدة | PPL | 80 | 2 | 56.82 | saada |
| al-jashami | الجشمي | Al Jashamī | محافظة صعدة | PPL | 80 | 1 | 57.08 | saada |
| gharib-as-sinnam | غارب السنام | Ghārib as Sinnām | محافظة صعدة | PPL | 80 | 1 | 57.28 | saada |
| radhat-al-araji | ردحة العراجي | Radḩat al ‘Arājī | محافظة صعدة | PPL | 80 | 1 | 57.46 | saada |
| fawkhan | فوخان | Fawkhān | محافظة صعدة | PPL | 80 | 1 | 57.57 | saada |
| dimnat-at-tawr | دمنة الطور | Dimnat aţ Ţawr | محافظة صعدة | PPL | 80 | 2 | 57.48 | saada |
| al-khursayah | الخرصاية | Al Khurşāyah | محافظة صعدة | PPL | 80 | 2 | 57.51 | saada |
| shati-ad-dalalimi | شاطئ الضلالمي | Shāţi’ aḑ Ḑalālimī | محافظة صعدة | PPL | 80 | 1 | 57.57 | saada |
| kurs-mabhas | كرس مبحص | Kurs Mabḩaş | محافظة صعدة | PPL | 80 | 1 | 57.69 | saada |
| gharib-al-husayn | غارب الحسين | Ghārib al Ḩusayn | محافظة صعدة | PPL | 80 | 2 | 57.95 | saada |
| dimnat-al-mirbah | دمنة المرباح | Dimnat al Mirbāḩ | محافظة صعدة | PPL | 80 | 2 | 57.94 | saada |
| mihlat-ar-rakab | محلة الركب | Miḩlat ar Rakab | محافظة صعدة | PPL | 80 | 1 | 58.20 | saada |
| qaim-mikhat | قائم مخاط | Qā’im Mikhāţ | محافظة صعدة | PPL | 80 | 1 | 58.25 | saada |
| mawal-shawai | موال شوعي | Mawāl Shawa‘ī | محافظة صعدة | PPL | 80 | 1 | 58.45 | saada |
| radhat-al-araji | ردحة العراجي | Radḩat al ‘Arājī | محافظة صعدة | PPL | 80 | 1 | 58.78 | saada |
| bilad-abd-allah | بلاد عبد الله | Bilād ‘Abd Allāh | محافظة صعدة | PPL | 80 | 2 | 57.95 | saada |
| thahir-al-birkah | ثاهر البركة | Thāhir al Birkah | محافظة صعدة | PPL | 80 | 1 | 57.78 | saada |
| al-manshuh | المنشوح | Al Manshūḩ | محافظة صعدة | PPL | 80 | 1 | 58.25 | saada |
| az-zahirah | الظهرة | Az̧ Z̧ahirah | محافظة صعدة | PPL | 80 | 2 | 57.97 | saada |
| hayfat-at-tamarah | حيفة التمارة | Ḩayfat at Tamārah | محافظة صعدة | PPL | 80 | 1 | 58.20 | saada |
| al-muthamil | المثامل | Al Muthāmil | محافظة صعدة | PPL | 80 | 1 | 58.05 | saada |
| gharib-buaytah | غارب بعيطة | Ghārib Bu‘ayţah | محافظة صعدة | PPL | 80 | 3 | 58.43 | saada |
| al-mahall | المحل | Al Maḩall | محافظة صعدة | PPL | 80 | 1 | 58.28 | saada |
| gharib-al-umya | غارب العمياء | Ghārib al ‘Umyā’ | محافظة صعدة | PPL | 80 | 1 | 58.09 | saada |
| thahir-al-matrabi | ثاهر المطربي | Thāhir al Maţrabī | محافظة صعدة | PPL | 80 | 2 | 58.18 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة صعدة | PPL | 80 | 3 | 58.36 | saada |
| al-markabah | المركابة | Al Markābah | محافظة صعدة | PPL | 80 | 2 | 58.45 | saada |
| mazab-wasil | معزب واصل | Ma‘zab Wāşil | محافظة صعدة | PPL | 80 | 3 | 58.59 | saada |
| sirr-al-mawqad | سر الموقد | Sirr al Mawqad | محافظة صعدة | PPL | 80 | 2 | 58.51 | saada |
| gharib-at-tawil | غارب الطويل | Ghārib aţ Ţawīl | محافظة صعدة | PPL | 80 | 3 | 58.76 | saada |
| ad-dibayat | الدبايات | Ad Dibāyāt | محافظة صعدة | PPL | 80 | 2 | 58.24 | saada |
| bilad-bin-awad | بلاد بن عوض | Bilād Bin ‘Awaḑ | محافظة صعدة | PPL | 80 | 1 | 58.92 | saada |
| thahir-al-fushayn | ثاهر الفشين | Thāhir al Fushayn | محافظة صعدة | PPL | 80 | 1 | 58.65 | saada |
| al-majrab | المجرب | Al Majrab | محافظة صعدة | PPL | 80 | 2 | 58.51 | saada |
| al-maqbas | المقبص | Al Maqbaş | محافظة صعدة | PPL | 80 | 3 | 58.51 | saada |
| al-birtamiyah | البرطمية | Al Birţamīyah | محافظة صعدة | PPL | 80 | 6 | 58.48 | saada |
| as-sabir | الصابر | Aş Şābir | محافظة صعدة | PPL | 80 | 1 | 58.56 | saada |
| sirr-an-nujar | سر النجار | Sirr an Nujār | محافظة صعدة | PPL | 80 | 1 | 58.37 | saada |
| ar-radif | الرادف | Ar Rādif | محافظة صعدة | PPL | 80 | 4 | 57.51 | saada |
| al-gharib | الغارب | Al Ghārib | محافظة صعدة | PPL | 80 | 4 | 59.56 | saada |
| adh-dhihaliyah | الذهالية | Adh Dhihālīyah | محافظة صعدة | PPL | 80 | 5 | 56.92 | saada |
| al-husayn | الحسين | Al Ḩusayn | محافظة صعدة | PPL | 80 | 2 | 58.11 | saada |
| ash-shurmah | الشرمة | Ash Shurmah | محافظة صعدة | PPL | 80 | 2 | 58.11 | saada |
| al-maqsu | المقسوع | Al Maqsū‘ | محافظة صعدة | PPL | 80 | 2 | 58.13 | saada |
| qaim-farwah | قائم فروة | Qā’im Farwah | محافظة صعدة | PPL | 80 | 4 | 57.45 | saada |
| miltutah | ملطوطة | Milţūţah | محافظة صعدة | PPL | 80 | 4 | 58.74 | saada |
| madraj-ath-thuah | مدرج الثوعة | Madraj ath Thū‘ah | محافظة صعدة | PPL | 80 | 5 | 56.70 | saada |
| al-batih | البطيح | Al Baţīḩ | محافظة صعدة | PPL | 80 | 2 | 58.39 | saada |
| al-qushuf | القشف | Al Qushuf | محافظة صعدة | PPL | 80 | 3 | 59.01 | saada |
| al-halaq | الحلق | Al Ḩalaq | محافظة صعدة | PPL | 80 | 4 | 57.00 | saada |
| subayqah | سبيقة | Subayqah | محافظة صعدة | PPL | 80 | 3 | 58.78 | saada |
| haqwan | حقوان | Ḩaqwān | محافظة صعدة | PPL | 80 | 1 | 58.97 | saada |
| mawas | معوص | Ma‘waş | محافظة صعدة | PPL | 80 | 1 | 59.03 | saada |
| al-qushfah | القشفة | Al Qushfah | محافظة صعدة | PPL | 80 | 1 | 58.95 | saada |
| dayr-al-musawi | دير المساوي | Dayr al Musāwī | محافظة صعدة | PPL | 80 | 1 | 58.83 | saada |
| al-birkah | البركة | Al Birkah | محافظة صعدة | PPL | 80 | 1 | 58.83 | saada |
| al-arram | العرام | Al ‘Arrām | محافظة صعدة | PPL | 80 | 1 | 58.80 | saada |
| al-mawasilat | المواصلات | Al Mawāşilāt | محافظة صعدة | PPL | 80 | 5 | 59.06 | saada |
| hayfah | حيفة | Ḩayfah | محافظة صعدة | PPL | 80 | 2 | 59.04 | saada |
| jahthath | جحثث | Jaḩthath | محافظة صعدة | PPL | 80 | 3 | 59.09 | saada |
| zahab-an-nami | زهب النمي | Zahab an Namī | محافظة صعدة | PPL | 80 | 3 | 58.99 | saada |
| al-butayh | البطيح | Al Buţayḩ | محافظة صعدة | PPL | 80 | 2 | 59.06 | saada |
| al-mudafin | المدافن | Al Mudāfin | محافظة صعدة | PPL | 80 | 2 | 59.13 | saada |
| al-mawqid-al-ala | الموقد الاعلى | Al Mawqid al ‘Ālá | محافظة صعدة | PPL | 80 | 4 | 57.78 | saada |
| al-mansurah | المنصورة | Al Manşūrah | محافظة صعدة | PPL | 80 | 1 | 57.55 | saada |
| as-salb | السلب | As Salb | محافظة صعدة | PPL | 80 | 2 | 57.60 | saada |
| al-mawqid-al-asfal | الموقد الأسفل | Al Mawqid al Asfal | محافظة صعدة | PPL | 80 | 1 | 57.87 | saada |
| bayt-ajlan | بيت عجلان | Bayt ‘Ajlān | محافظة صعدة | PPL | 80 | 4 | 58.00 | saada |
| sirr-jabir | سر جابر | Sirr Jābir | محافظة صعدة | PPL | 80 | 6 | 57.96 | saada |
| al-halat | الحلط | Al Ḩalaţ | محافظة صعدة | PPL | 80 | 1 | 57.85 | saada |
| waar-al-mihlal | وعر المحلال | Wa‘ar al Miḩlāl | محافظة صعدة | PPL | 80 | 1 | 58.05 | saada |
| qaim-sirr-al-khudayr | قائم سر الخضير | Qā’im Sirr al Khuḑayr | محافظة صعدة | PPL | 80 | 1 | 58.02 | saada |
| gharib-qumr | غارب قمر | Ghārib Qumr | محافظة صعدة | PPL | 80 | 2 | 57.58 | saada |
| bayt-al-usri | بيت العسري | Bayt al ‘Usrī | محافظة صعدة | PPL | 80 | 4 | 57.58 | saada |
| kurs-al-muhayb | كرس المحيب | Kurs al Muḩayb | محافظة صعدة | PPL | 80 | 2 | 57.63 | saada |
| kurs-al-qahzah | كرس القحزة | Kurs al Qaḩzah | محافظة صعدة | PPL | 80 | 3 | 57.88 | saada |
| al-hisn | الحصن | Al Ḩişn | محافظة صعدة | PPL | 80 | 1 | 57.51 | saada |
| al-manjiyah | المنجية | Al Manjīyah | محافظة صعدة | PPL | 80 | 2 | 58.50 | saada |
| hawd-jaar | حود جعار | Ḩawd Ja‘ār | محافظة صعدة | PPL | 80 | 3 | 58.72 | saada |
| al-qataf | القطف | Al Qaţaf | محافظة صعدة | PPL | 80 | 4 | 59.03 | saada |
| qabur-al-abadi | قبور العبادي | Qabūr al ‘Abādī | محافظة صعدة | PPL | 80 | 1 | 58.45 | saada |
| gharib-huways | غارب حويس | Ghārib Ḩuways | محافظة صعدة | PPL | 80 | 4 | 58.98 | saada |
| mirmad | المرماد | Mirmād | محافظة صعدة | PPL | 80 | 7 | 61.06 | saada |
| zahr-mansur | ظهر منصور | Z̧ahr Manşūr | محافظة صعدة | PPL | 80 | 5 | 59.44 | saada |
| al-habat | الحبط | Al Ḩabaţ | محافظة صعدة | PPL | 80 | 4 | 58.58 | saada |
| al-hawla | الحولاء | Al Ḩawlā’ | محافظة صعدة | PPL | 80 | 2 | 58.67 | saada |
| al-aradi | العراضي | Al ‘Arāḑī | محافظة صعدة | PPL | 80 | 1 | 58.58 | saada |
| al-mawrithah | المورثة | Al Mawrithah | محافظة صعدة | PPL | 80 | 1 | 58.73 | saada |
| al-makhqah | المخقة | Al Makhqah | محافظة صعدة | PPL | 80 | 1 | 58.49 | saada |
| ash-shalakh | الشلخ | Ash Shalakh | محافظة صعدة | PPL | 80 | 1 | 61.31 | saada |
| jafrah | الجفرة | Jafrah | محافظة صعدة | PPL | 80 | 2 | 58.79 | saada |
| al-hafarthi | الحفرثي | Al Ḩafarthī | محافظة صعدة | PPL | 80 | 1 | 59.31 | saada |
| radhat-masud | ردحة مسعود | Radḩat Mas‘ūd | محافظة صعدة | PPL | 80 | 3 | 59.33 | saada |
| al-jindabi | الجنادي | Al Jindābī | محافظة صعدة | PPL | 80 | 1 | 61.08 | saada |
| ash-shanami | الشنامي | Ash Shanāmī | محافظة صعدة | PPL | 80 | 2 | 61.19 | saada |
| hayfat-as-siyal | حيفة السيال | Ḩayfat as Siyāl | محافظة صعدة | PPL | 80 | 5 | 57.66 | saada |
| al-kawmah | الكومة | Al Kawmah | محافظة صعدة | PPL | 80 | 1 | 57.63 | saada |
| al-maghribat | المغربات | Al Maghribāt | محافظة صعدة | PPL | 80 | 1 | 58.32 | saada |
| azzan | عزان | ‘Azzān | محافظة صعدة | PPL | 80 | 2 | 58.43 | saada |
| ar-rawnah | الرونح | Ar Rawnaḩ | محافظة صعدة | PPL | 80 | 3 | 59.65 | saada |
| al-qawad | القعود | Al Qa‘wad | محافظة صعدة | PPL | 80 | 1 | 58.44 | saada |
| al-maraniyah | المرانية | Al Marānīyah | محافظة صعدة | PPL | 80 | 1 | 58.32 | saada |
| sirr-al-araja | سر العرجا | Sirr al ‘Arajā | محافظة صعدة | PPL | 80 | 1 | 57.96 | saada |
| al-mishayimah | المشايمة | Al Mishāyimah | محافظة صعدة | PPL | 80 | 1 | 57.70 | saada |
| al-shalakh | الشلخ | Al Shalakh | محافظة صعدة | PPL | 80 | 2 | 57.74 | saada |
| shatt-ash-sharaf | شط الشارف | Shaţţ ash Shāraf | محافظة صعدة | PPL | 80 | 1 | 57.90 | saada |
| ar-rakibah | الراكبة | Ar Rākibah | محافظة صعدة | PPL | 80 | 3 | 58.25 | saada |
| ash-shurtabi | الشرطبي | Ash Shurţabī | محافظة صعدة | PPL | 80 | 5 | 58.51 | saada |
| sirr-al-fawi | سر الفاوي | Sirr al Fāwī | محافظة صعدة | PPL | 80 | 4 | 58.42 | saada |
| sirr-al-askari | سر العسكري | Sirr al ‘Askarī | محافظة صعدة | PPL | 80 | 5 | 58.55 | saada |
| al-mawakhil | المواخيل | Al Mawākhīl | محافظة صعدة | PPL | 80 | 5 | 59.38 | saada |
| at-tamarah | التمارة | At Tamārah | محافظة صعدة | PPL | 80 | 2 | 59.74 | saada |
| ad-diman | الدمن | Ad Diman | محافظة صعدة | PPL | 80 | 1 | 60.17 | saada |
| gharib-al-hanak | غارب الحنك | Ghārib al Ḩanak | محافظة صعدة | PPL | 80 | 3 | 60.33 | saada |
| al-khurshat | الخرشات | Al Khurshāt | محافظة صعدة | PPL | 80 | 5 | 60.41 | saada |
| qarn-mashul | قرن مشول | Qarn Mashūl | محافظة صعدة | PPL | 80 | 1 | 60.60 | saada |
| ar-rudayh | الرديح | Ar Rudayḩ | محافظة صعدة | PPL | 80 | 4 | 61.02 | saada |
| al-kadirah | الكدرة | Al Kadirah | محافظة صعدة | PPL | 80 | 3 | 60.85 | saada |
| al-aflah | العفلة | Al ‘Aflah | محافظة صعدة | PPL | 80 | 2 | 60.63 | saada |
| al-quayti | القعيطي | Al Qu‘ayţī | محافظة صعدة | PPL | 80 | 3 | 60.46 | saada |
| ath-thuah | الثوعة | Ath Thū‘ah | محافظة صعدة | PPL | 80 | 5 | 60.39 | saada |
| al-mujarin | المجارين | Al Mujārīn | محافظة صعدة | PPL | 80 | 1 | 57.76 | saada |
| gharib-an-nayd | غارب النيد | Ghārib an Nayd | محافظة صعدة | PPL | 80 | 1 | 57.66 | saada |
| sirr-utayfah | سر عطيفة | Sirr ‘Uţayfah | محافظة صعدة | PPL | 80 | 3 | 57.83 | saada |
| kurs-al-wasit | كرس الواسط | Kurs al Wāsiţ | محافظة صعدة | PPL | 80 | 1 | 57.75 | saada |
| az-zawat | الزعوط | Az Za‘waţ | محافظة صعدة | PPL | 80 | 1 | 57.65 | saada |
| al-julahit | الجلاحيت | Al Julāḩīt | محافظة صعدة | PPL | 80 | 1 | 57.86 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة صعدة | PPL | 80 | 3 | 57.84 | saada |
| qaim-ushaysh | قائم عشيش | Qā’im ‘Ushaysh | محافظة صعدة | PPL | 80 | 1 | 57.16 | saada |
| al-mujahim | المجاهم | Al Mujāhim | محافظة صعدة | PPL | 80 | 1 | 57.17 | saada |
| bayt-al-quflah | بيت القفلة | Bayt al Quflah | محافظة صعدة | PPL | 80 | 1 | 57.25 | saada |
| al-gharbi | الغربي | Al Gharbī | محافظة صعدة | PPL | 80 | 3 | 57.24 | saada |
| dimnat-al-mikhanaqah | دمنة المخانقة | Dimnat al Mikhānaqah | محافظة صعدة | PPL | 80 | 1 | 57.30 | saada |
| bayt-an-nuqayl | بيت النقيل | Bayt an Nuqayl | محافظة صعدة | PPL | 80 | 1 | 57.24 | saada |
| thahir-al-aqam | ثاهر العقم | Thāhir al ‘Aqam | محافظة صعدة | PPL | 80 | 23 | 57.01 | saada |
| ash-shajin | الشاجن | Ash Shājin | محافظة صعدة | PPL | 80 | 1 | 57.27 | saada |
| al-jafr | الجفر | Al Jafr | محافظة صعدة | PPL | 80 | 2 | 57.33 | saada |
| as-sarw | الصرو | Aş Şarw | محافظة صعدة | PPL | 80 | 1 | 56.84 | saada |
| sirr-ghaythan | سر غيثان | Sirr Ghaythān | محافظة صعدة | PPL | 80 | 3 | 57.07 | saada |
| ash-shaqabah | الشقبة | Ash Shaqabah | محافظة صعدة | PPL | 80 | 1 | 57.22 | saada |
| qaim-salih | قائم صالح | Qā’im Şāliḩ | محافظة صعدة | PPL | 80 | 2 | 56.93 | saada |
| al-madbabi | المضبابي | Al Maḑbābī | محافظة صعدة | PPL | 80 | 6 | 57.41 | saada |
| ash-shaqibah | الشقبة | Ash Shaqibah | محافظة صعدة | PPL | 80 | 2 | 57.65 | saada |
| kurs-as-sabih | كرس السابح | Kurs as Sābiḩ | محافظة صعدة | PPL | 80 | 1 | 57.63 | saada |
| al-kurdi | الكدري | Al Kurdī | محافظة صعدة | PPL | 80 | 2 | 57.69 | saada |
| al-madribah | المضربة | Al Maḑribah | محافظة صعدة | PPL | 80 | 1 | 57.66 | saada |
| ar-ruayliyah | الرعيلية | Ar Ru‘aylīyah | محافظة صعدة | PPL | 80 | 1 | 57.65 | saada |
| al-lasabah | اللصبة | Al Laşabah | محافظة صعدة | PPL | 80 | 3 | 57.48 | saada |
| siyad | صياد | Şiyād | محافظة صعدة | PPL | 80 | 2 | 57.65 | saada |
| al-midyar | المديار | Al Midyār | محافظة صعدة | PPL | 80 | 1 | 57.75 | saada |
| al-aqabi | العقبي | Al ‘Aqabī | محافظة صعدة | PPL | 80 | 1 | 57.38 | saada |
| al-mazab | المعزب | Al Ma‘zab | محافظة صعدة | PPL | 80 | 5 | 57.35 | saada |
| al-qushaf | القشف | Al Qushaf | محافظة صعدة | PPL | 80 | 1 | 57.30 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة صعدة | PPL | 80 | 1 | 57.19 | saada |
| ar-ritum | الرتوم | Ar Ritūm | محافظة صعدة | PPL | 80 | 1 | 57.59 | saada |
| al-khurshai | الخرشعي | Al Khursha‘ī | محافظة صعدة | PPL | 80 | 3 | 56.92 | saada |
| al-mafjarat | المفجرات | Al Mafjarāt | محافظة صعدة | PPL | 80 | 5 | 56.83 | saada |
| al-dahiyah | الضهية | Al Ḑahīyah | محافظة صعدة | PPL | 80 | 5 | 56.65 | saada |
| al-qurdai | القرضعي | Al Qurḑa‘ī | محافظة صعدة | PPL | 80 | 1 | 56.93 | saada |
| markuzah | مركوزة | Markūzah | محافظة صعدة | PPL | 80 | 1 | 56.72 | saada |
| al-khabati | الخباطي | Al Khabāţī | محافظة صعدة | PPL | 80 | 2 | 56.53 | saada |
| al-hillah | الهلة | Al Hillah | محافظة صعدة | PPL | 80 | 1 | 56.36 | saada |
| mawamisahi | موامسهي | Mawāmisahī | محافظة صعدة | PPL | 80 | 3 | 56.25 | saada |
| arajah | عراجة | ‘Arājah | محافظة صعدة | PPL | 80 | 1 | 56.36 | saada |
| al-marqi | المرقي | Al Marqī | محافظة صعدة | PPL | 80 | 4 | 55.77 | saada |
| jadi | جاضع | Jāḑi‘ | محافظة صعدة | PPL | 80 | 4 | 55.59 | saada |
| qurman | قرمان | Qurmān | محافظة صعدة | PPL | 80 | 1 | 55.77 | saada |
| ad-daba | الدباع | Ad Dabā‘ | محافظة صعدة | PPL | 80 | 8 | 55.53 | saada |
| mararah | مرارة | Marārah | محافظة صعدة | PPL | 80 | 2 | 54.97 | saada |
| gharib-jabir | غارب جابر | Ghārib Jābir | محافظة صعدة | PPL | 80 | 1 | 55.02 | saada |
| kurs-al-ghazayah | كرس العزاية | Kurs al Ghazāyah | محافظة صعدة | PPL | 80 | 2 | 55.03 | saada |
| kurs-umaysh | كرس عميش | Kurs ‘Umaysh | محافظة صعدة | PPL | 80 | 2 | 55.03 | saada |
| al-abr | العبر | Al ‘Abr | محافظة صعدة | PPL | 80 | 5 | 57.78 | saada |
| dhira-abu-jadah | ذراع أبو جدعة | Dhirā‘ Abū Jad‘ah | محافظة صعدة | PPL | 80 | 2 | 57.38 | saada |
| ar-ruzmah | الرزمة | Ar Ruzmah | محافظة صعدة | PPL | 80 | 2 | 55.13 | saada |
| gharib-azzan | غارب عزان | Ghārib ‘Azzān | محافظة صعدة | PPL | 80 | 2 | 55.00 | saada |
| dimnat-siyar | دمنات سيار | Dimnāt Siyār | محافظة صعدة | PPL | 80 | 2 | 55.25 | saada |
| shati-al-araj | شاطئ العراج | Shāţi’ al ‘Arāj | محافظة صعدة | PPL | 80 | 1 | 55.04 | saada |
| mathalith | مثاليث | Mathālīth | محافظة صعدة | PPL | 80 | 5 | 61.30 | saada |
| ar-rukub | الركوب | Ar Rukūb | محافظة صعدة | PPL | 80 | 3 | 54.86 | saada |
| al-waqayir | الوقاير | Al Waqāyir | محافظة صعدة | PPL | 80 | 1 | 51.96 | saada |
| ad-daqi | الضاقى | Aḑ Ḑāqī | محافظة صعدة | PPL | 80 | 1 | 53.04 | saada |
| abu-nawas | أبو نواس | Abū Nawās | محافظة صعدة | PPL | 80 | 2 | 52.71 | saada |
| al-jalah | الجلعة | Al Jal‘ah | محافظة صعدة | PPL | 80 | 2 | 53.22 | saada |
| ar-rawbah | الروبة | Ar Rawbah | محافظة صعدة | PPL | 80 | 1 | 52.92 | saada |
| ad-darb | الدرب | Ad Darb | محافظة صعدة | PPL | 80 | 1 | 53.03 | saada |
| al-aqum | العقوم | Al ‘Aqūm | محافظة صعدة | PPL | 80 | 2 | 52.81 | saada |
| al-muhabbab | المحبب | Al Muḩabbab | محافظة صعدة | PPL | 80 | 3 | 52.42 | saada |
| al-jihyu | الجهيو | Al Jihyū | محافظة صعدة | PPL | 80 | 3 | 52.70 | saada |
| al-amrah | العمرة | Al ‘Amrah | محافظة صعدة | PPL | 80 | 9 | 52.51 | saada |
| shawkan | شوكان | Shawkān | محافظة صعدة | PPL | 80 | 5 | 52.84 | saada |
| al-mutarris | المتارس | Al Mutārris | محافظة صعدة | PPL | 80 | 2 | 52.92 | saada |
| al-ghawl | الغول | Al Ghawl | محافظة صعدة | PPL | 80 | 5 | 48.10 | saada |
| al-masraq | المسرق | Al Masraq | محافظة صعدة | PPL | 80 | 1 | 48.26 | saada |
| al-qazah | القزعة | Al Qaz‘ah | محافظة صعدة | PPL | 80 | 4 | 48.40 | saada |
| as-salali | الصلالي | Aş Şalālī | محافظة صعدة | PPL | 80 | 1 | 47.81 | saada |
| al-hisn | الحصن | Al Ḩişn | محافظة صعدة | PPL | 80 | 2 | 47.70 | saada |
| ash-shitir | الشطر | Ash Shiţir | محافظة صعدة | PPL | 80 | 1 | 47.77 | saada |
| az-zuqq | الزق | Az Zuqq | محافظة صعدة | PPL | 80 | 3 | 47.87 | saada |
| as-salw | الصلو | Aş Şalw | محافظة صعدة | PPL | 80 | 1 | 47.88 | saada |
| jaww-al-murshid | جو المرشد | Jaww al Murshid | محافظة صعدة | PPL | 80 | 1 | 47.82 | saada |
| al-mudiq | المدق | Al Mudiq | محافظة صعدة | PPL | 80 | 2 | 49.49 | saada |
| al-qita | القطع | Al Qiţa‘ | محافظة صعدة | PPL | 80 | 1 | 48.94 | saada |
| shayban | شيبان | Shaybān | محافظة صعدة | PPL | 80 | 7 | 48.95 | saada |
| al-mujair | المجاعير | Al Mujā‘īr | محافظة صعدة | PPL | 80 | 2 | 49.80 | saada |
| al-khallah | الخلة | Al Khallah | محافظة صعدة | PPL | 80 | 7 | 49.94 | saada |
| ad-diqnah | الدقنة | Ad Diqnah | محافظة صعدة | PPL | 80 | 3 | 49.43 | saada |
| az-zafr | الظفر | Az̧ Z̧afr | محافظة صعدة | PPL | 80 | 1 | 49.88 | saada |
| kurs-as-sawdi | كرس السودي | Kurs as Sawdī | محافظة صعدة | PPL | 80 | 1 | 49.55 | saada |
| al-huwayli | الحويلي | Al Ḩuwaylī | محافظة صعدة | PPL | 80 | 1 | 50.10 | saada |
| at-tawail | الطوائل | Aţ Ţawā’il | محافظة صعدة | PPL | 80 | 1 | 49.48 | saada |
| akkal | عكال | ‘Akkāl | محافظة صعدة | PPL | 80 | 2 | 49.25 | saada |
| al-milz | الملز | Al Milz | محافظة صعدة | PPL | 80 | 1 | 49.31 | saada |
| midba | مدباع | Midbā‘ | محافظة صعدة | PPL | 80 | 1 | 49.42 | saada |
| al-jabah | الجعبة | Al Ja‘bah | محافظة صعدة | PPL | 80 | 2 | 49.25 | saada |
| al-halaw | الحلاو | Al Ḩalāw | محافظة صعدة | PPL | 80 | 1 | 49.11 | saada |
| an-nayd | النيد | An Nayd | محافظة صعدة | PPL | 80 | 2 | 48.94 | saada |
| al-muqatir | المقاطر | Al Muqāţir | محافظة صعدة | PPL | 80 | 1 | 49.39 | saada |
| qayf-ghurab | قيف غراب | Qayf Ghurāb | محافظة صعدة | PPL | 80 | 3 | 48.59 | saada |
| ghurrat-ash-sharwi | غرة الشروي | Ghurrat ash Sharwī | محافظة صعدة | PPL | 80 | 1 | 49.34 | saada |
| akhbab | أخباب | Akhbāb | محافظة صعدة | PPL | 80 | 1 | 49.61 | saada |
| humiran | حومران | Ḩūmirān | محافظة صعدة | PPL | 80 | 2 | 49.82 | saada |
| qullat-ar-rakhim | قلة الرخم | Qullat ar Rakhim | محافظة صعدة | PPL | 80 | 3 | 49.29 | saada |
| mahall-ajam | محل أعجم | Maḩall A‘jam | محافظة صعدة | PPL | 80 | 1 | 49.93 | saada |
| qufrat-taashshar | قفرة تعشر | Qufrat Ta‘ashshar | محافظة صعدة | PPL | 80 | 1 | 49.37 | saada |
| ar-raymah-al-ulya | الريمة العليا | Ar Raymah al ‘Ulyā | محافظة صعدة | PPL | 80 | 3 | 48.41 | saada |
| qullat-shahran | قلة شهران | Qullat Shahrān | محافظة صعدة | PPL | 80 | 1 | 48.99 | saada |
| al-maziyah | المعزبة | Al Ma‘zīyah | محافظة صعدة | PPL | 80 | 1 | 49.13 | saada |
| al-ghumrah | الغمرة | Al Ghumrah | محافظة صعدة | PPL | 80 | 1 | 47.54 | saada |
| jumaymah | الجميمة | Jumaymah | محافظة صعدة | PPL | 80 | 1 | 52.55 | saada |
| saadah | سعادة | Sa‘ādah | محافظة صعدة | PPL | 80 | 1 | 49.71 | saada |
| al-mathrad | المثرض | Al Mathraḑ | محافظة صعدة | PPL | 80 | 1 | 45.55 | saada |
| usri | عصري | ‘Uşrī | محافظة صعدة | PPL | 80 | 3 | 46.92 | saada |
| al-faysh | الفيش | Al Faysh | محافظة صعدة | PPL | 80 | 2 | 46.05 | saada |
| al-hujayb | الحجيب | Al Ḩujayb | محافظة صعدة | PPL | 80 | 1 | 46.05 | saada |
| ad-dalwah | الدلوة | Ad Dalwah | محافظة صعدة | PPL | 80 | 3 | 45.69 | saada |
| al-hamra | الحمرأ | Al Ḩamra’ | محافظة صعدة | PPL | 80 | 2 | 45.63 | saada |
| ash-shararah | الشرارة | Ash Sharārah | محافظة صعدة | PPL | 80 | 1 | 46.08 | saada |
| adba | أدبع | Adba‘ | محافظة صعدة | PPL | 80 | 3 | 45.04 | saada |
| az-zahrah | الظهرة | Az̧ Z̧ahrah | محافظة صعدة | PPL | 80 | 3 | 45.71 | saada |
| arbayn | عربين | ‘Arbayn | محافظة صعدة | PPL | 80 | 1 | 45.84 | saada |
| bayn-al-qayfayn | بين القيفين | Bayn al Qayfayn | محافظة صعدة | PPL | 80 | 4 | 45.65 | saada |
| al-asilah | العسلة | Al ‘Asilah | محافظة صعدة | PPL | 80 | 8 | 50.02 | saada |
| al-jawhili | الجوحلي | Al Jawḩilī | محافظة صعدة | PPL | 80 | 6 | 49.70 | saada |
| as-sarw | السرو | As Sarw | محافظة صعدة | PPL | 80 | 2 | 49.99 | saada |
| ad-dibbah | الدبة | Ad Dibbah | محافظة صعدة | PPL | 80 | 1 | 49.80 | saada |
| ash-shihadah | الشهادة | Ash Shihādah | محافظة صعدة | PPL | 80 | 6 | 50.13 | saada |
| shawkan | شوكان | Shawkān | محافظة صعدة | PPL | 80 | 3 | 51.01 | saada |
| shuhmah | شحمة | Shuḩmah | محافظة صعدة | PPL | 80 | 6 | 50.68 | saada |
| talhah | طلحة | Ţalḩah | محافظة صعدة | PPL | 80 | 1 | 50.87 | saada |
| al-mazab | المعزب | Al Ma‘zab | محافظة صعدة | PPL | 80 | 3 | 50.76 | saada |
| an-nakhlat | النخلات | An Nakhlāt | محافظة صعدة | PPL | 80 | 3 | 51.26 | saada |
| jarwah | جروة | Jarwah | محافظة صعدة | PPL | 80 | 4 | 51.21 | saada |
| al-hujali | الحجالي | Al Ḩujālī | محافظة صعدة | PPL | 80 | 6 | 52.96 | saada |
| ash-shiraqib | الشراقب | Ash Shirāqib | محافظة صعدة | PPL | 80 | 4 | 52.74 | saada |
| daban | دبعان | Dab‘ān | محافظة صعدة | PPL | 80 | 3 | 52.88 | saada |
| al-qawayim | القوايم | Al Qawāyim | محافظة صعدة | PPL | 80 | 1 | 52.73 | saada |
| as-safiyah | الصافية | Aş Şāfīyah | محافظة صعدة | PPL | 80 | 2 | 52.64 | saada |
| al-jahaw | الجهاو | Al Jahāw | محافظة صعدة | PPL | 80 | 1 | 52.40 | saada |
| al-majlibah | المجلبة | Al Majlibah | محافظة صعدة | PPL | 80 | 2 | 53.32 | saada |
| al-qazu | القزوع | Al Qazū‘ | محافظة صعدة | PPL | 80 | 1 | 53.16 | saada |
| ash-shati | الشاطئ | Ash Shāţi’ | محافظة صعدة | PPL | 80 | 3 | 53.31 | saada |
| kursi-ash-shati | كرسي الشاطئ | Kursī ash Shāţi’ | محافظة صعدة | PPL | 80 | 3 | 52.90 | saada |
| al-qadim | القديم | Al Qadīm | محافظة صعدة | PPL | 80 | 10 | 52.94 | saada |
| shidanah | شدانة | Shidānah | محافظة صعدة | PPL | 80 | 2 | 52.47 | saada |
| al-mashribah | المشربة | Al Mashribah | محافظة صعدة | PPL | 80 | 2 | 51.78 | saada |
| al-jadah | الجعدة | Al Ja‘dah | محافظة صعدة | PPL | 80 | 7 | 52.87 | saada |
| zahir-qusadi | ظاهر قصادي | Z̧āhir Quşādī | محافظة صعدة | PPL | 80 | 1 | 53.03 | saada |
| al-mashbab | المشباب | Al Mashbāb | محافظة صعدة | PPL | 80 | 2 | 53.15 | saada |
| al-muhaddah | المحدة | Al Muḩaddah | محافظة صعدة | PPL | 80 | 1 | 53.48 | saada |
| al-jabjab | الجبجب | Al Jabjab | محافظة صعدة | PPL | 80 | 4 | 53.36 | saada |
| qabr-hita | قبرحطاء | Qabr Ḩiţā’ | محافظة صعدة | PPL | 80 | 6 | 53.04 | saada |
| al-marwaniyah | المروانية | Al Marwānīyah | محافظة صعدة | PPL | 80 | 3 | 52.85 | saada |
| al-hariq | الحريق | Al Ḩarīq | محافظة صعدة | PPL | 80 | 4 | 52.37 | saada |
| zahir-ash-shawk | ظاهر الشوك | Z̧āhir ash Shawk | محافظة صعدة | PPL | 80 | 2 | 52.66 | saada |
| zahir-dihmah | ظاهر دهمة | Z̧āhir Dihmah | محافظة صعدة | PPL | 80 | 3 | 53.14 | saada |
| al-khaddad | الخدد | Al Khaddad | محافظة صعدة | PPL | 80 | 1 | 52.71 | saada |
| al-halaq | الحلق | Al Ḩalaq | محافظة صعدة | PPL | 80 | 3 | 52.61 | saada |
| al-mashrihah | المشرحة | Al Mashriḩah | محافظة صعدة | PPL | 80 | 1 | 52.60 | saada |
| al-hadab | الحدب | Al Ḩadab | محافظة صعدة | PPL | 80 | 2 | 52.59 | saada |
| al-mawthabah | الموثبة | Al Mawthabah | محافظة صعدة | PPL | 80 | 4 | 52.49 | saada |
| al-kharab | الخرب | Al Kharab | محافظة صعدة | PPL | 80 | 6 | 52.21 | saada |
| thamil | ثامل | Thāmil | محافظة صعدة | PPL | 80 | 6 | 52.28 | saada |
| mazab-al-ubayd | معزب العبيد | Ma‘zab al ‘Ubayd | محافظة صعدة | PPL | 80 | 5 | 53.07 | saada |
| dhira-ar-rashid | ذراع الرشيد | Dhirā’ ar Rashīd | محافظة صعدة | PPL | 80 | 4 | 53.04 | saada |
| al-an-nasib | ال النصب | Āl an Naşib | محافظة صعدة | PPL | 80 | 2 | 52.85 | saada |
| shatt-jamilah | شط جميلة | Shaţţ Jamīlah | محافظة صعدة | PPL | 80 | 1 | 52.76 | saada |
| hayfat-al-qiq | حيفة القيق | Ḩayfat al Qīq | محافظة صعدة | PPL | 80 | 1 | 52.78 | saada |
| qurthan | قرثان | Qurthān | محافظة صعدة | PPL | 80 | 3 | 53.09 | saada |
| qaim-al-jahub | قائم الجحب | Qā’im al Jaḩub | محافظة صعدة | PPL | 80 | 6 | 53.01 | saada |
| al-qazah | القزعة | Al Qaz‘ah | محافظة صعدة | PPL | 80 | 4 | 53.07 | saada |
| al-mahfirah | المحفرة | Al Maḩfirah | محافظة صعدة | PPL | 80 | 2 | 53.48 | saada |
| zahir-shughub | ظاهر شغب | Z̧āhir Shughub | محافظة صعدة | PPL | 80 | 1 | 53.53 | saada |
| zahir-al-buyut | ظاهر البيوت | Z̧āhir al Buyūt | محافظة صعدة | PPL | 80 | 1 | 53.58 | saada |
| al-mazab | المعزب | Al Ma‘zab | محافظة صعدة | PPL | 80 | 6 | 53.15 | saada |
| al-manqil | المنقل | Al Manqil | محافظة صعدة | PPL | 80 | 3 | 53.80 | saada |
| bayt-tayyib | بيت طيب | Bayt Ţayyib | محافظة صعدة | PPL | 80 | 1 | 53.49 | saada |
| shatt-ar-ruqbah | شط الرقبة | Shaţţ ar Ruqbah | محافظة صعدة | PPL | 80 | 1 | 53.32 | saada |
| bayt-daghshur | بيت دغشر | Bayt Daghshur | محافظة صعدة | PPL | 80 | 1 | 53.90 | saada |
| ash-sharqi | الشرقي | Ash Sharqī | محافظة صعدة | PPL | 80 | 1 | 53.77 | saada |
| an-nuqayl | النقيل | An Nuqayl | محافظة صعدة | PPL | 80 | 1 | 53.80 | saada |
| bayt-qamshu | بيت قمشوع | Bayt Qamshū‘ | محافظة صعدة | PPL | 80 | 1 | 53.80 | saada |
| shatt-hibhan | شط حبهان | Shaţţ Ḩibhān | محافظة صعدة | PPL | 80 | 1 | 53.31 | saada |
| al-khawjirah-al-ulya | الخوجرة العليا | Al Khawjirah al ‘Ulyā | محافظة صعدة | PPL | 80 | 5 | 53.65 | saada |
| sharqi-as-sawfah | شرقي الصوفة | Sharqī aş Şawfah | محافظة صعدة | PPL | 80 | 1 | 53.59 | saada |
| waar-masud | وعر مسعود | Wa‘ar Mas‘ūd | محافظة صعدة | PPL | 80 | 1 | 53.54 | saada |
| al-marafi | المرافع | Al Marāfi‘ | محافظة صعدة | PPL | 80 | 2 | 53.31 | saada |
| shitut-mad-hur | شطوط مدهور | Shitut Mad hur | محافظة صعدة | PPL | 80 | 1 | 53.09 | saada |
| al-mirajih | المراجح | Al Mirājiḩ | محافظة صعدة | PPL | 80 | 2 | 52.97 | saada |
| zahir-al-baytash | ظاهر البيطش | Z̧āhir al Bayţash | محافظة صعدة | PPL | 80 | 1 | 52.72 | saada |
| hayfat-as-suwaydi | حيفة السويدي | Ḩayfat as Suwaydī | محافظة صعدة | PPL | 80 | 1 | 53.19 | saada |
| asiri | عصري | ‘Aşirī | محافظة صعدة | PPL | 80 | 1 | 56.41 | saada |
| basah | بعصة | Ba‘şah | محافظة صعدة | PPL | 80 | 2 | 56.47 | saada |
| al-qazu | القزوع | Al Qazū‘ | محافظة صعدة | PPL | 80 | 1 | 56.50 | saada |
| al-muharriq | المحرق | Al Muḩarriq | محافظة صعدة | PPL | 80 | 1 | 56.27 | saada |
| al-mawajih | المواجح | Al Mawājiḩ | محافظة صعدة | PPL | 80 | 2 | 56.04 | saada |
| ash-shirani | الشراني | Ash Shirānī | محافظة صعدة | PPL | 80 | 3 | 56.70 | saada |
| al-mahthabi | المحثبى | Al Maḩthabī | محافظة صعدة | PPL | 80 | 4 | 56.31 | saada |
| gharib-as-sahw | غارب السهو | Ghārib as Sahw | محافظة صعدة | PPL | 80 | 3 | 56.00 | saada |
| wair-al-marwa | وعير المروع | Wa‘īr al Marwa‘ | محافظة صعدة | PPL | 80 | 1 | 56.82 | saada |
| al-qullah | القلة | Al Qullah | محافظة صعدة | PPL | 80 | 1 | 57.28 | saada |
| al-amash | العماش | Al ‘Amāsh | محافظة صعدة | PPL | 80 | 1 | 56.92 | saada |
| al-haynah | الهينة | Al Haynah | محافظة صعدة | PPL | 80 | 2 | 56.33 | saada |
| zaymah | ظيمة | Z̧aymah | محافظة صعدة | PPL | 80 | 1 | 57.10 | saada |
| al-mulqat | الملقط | Al Mulqaţ | محافظة صعدة | PPL | 80 | 4 | 56.71 | saada |
| al-mishbab | المشباب | Al Mishbāb | محافظة صعدة | PPL | 80 | 2 | 57.06 | saada |
| dayal | دعيبل | Da‘yal | محافظة صعدة | PPL | 80 | 2 | 57.14 | saada |
| ash-shaytaniyah | الشيطانية | Ash Shayţānīyah | محافظة صعدة | PPL | 80 | 6 | 56.14 | saada |
| al-gharbi | الغربي | Al Gharbī | محافظة صعدة | PPL | 80 | 4 | 57.26 | saada |
| as-sarir | الصرير | Aş Şarīr | محافظة صعدة | PPL | 80 | 2 | 57.24 | saada |
| dimn-ash | دمن عش | Dimn ‘Ash | محافظة صعدة | PPL | 80 | 7 | 54.37 | saada |
| tahir-al-araji | طاهر العرجي | Ţāhir al ‘Arajī | محافظة صعدة | PPL | 80 | 1 | 54.48 | saada |
| al-majur | المجعور | Al Maj‘ūr | محافظة صعدة | PPL | 80 | 3 | 54.96 | saada |
| mawsil | الموصل | Mawşil | محافظة صعدة | PPL | 80 | 3 | 54.09 | saada |
| suq-al-ahad | سوق الأحد | Sūq al Aḩad | محافظة صعدة | PPL | 80 | 1 | 54.45 | saada |
| al-khatwah | الخطوة | Al Khatwah | محافظة صعدة | PPL | 80 | 1 | 54.38 | saada |
| al-qaim | القائم | Al Qā’im | محافظة صعدة | PPL | 80 | 4 | 54.26 | saada |
| ash-shabir | الشبر | Ash Shabir | محافظة صعدة | PPL | 80 | 1 | 54.82 | saada |
| al-hayfat | الحيفات | Al Ḩayfāt | محافظة صعدة | PPL | 80 | 1 | 54.58 | saada |
| al-mawajir | المواجر | Al Mawājir | محافظة صعدة | PPL | 80 | 4 | 54.16 | saada |
| al-mihmay | المحماي | Al Miḩmāy | محافظة صعدة | PPL | 80 | 1 | 52.36 | saada |
| al-khazi | الخزيع | Al KhazĪ‘ | محافظة صعدة | PPL | 80 | 1 | 55.23 | saada |
| hayf-mubarrak | حيف مبارك | Ḩayf Mubārrak | محافظة صعدة | PPL | 80 | 2 | 54.94 | saada |
| al-mashuq | المعشوق | Al Ma‘shūq | محافظة صعدة | PPL | 80 | 2 | 55.13 | saada |
| al-qutaynat | القطينات | Al Quţaynāt | محافظة صعدة | PPL | 80 | 3 | 55.24 | saada |
| al-quhsah | القحصة | Al Quḩsah | محافظة صعدة | PPL | 80 | 1 | 55.23 | saada |
| ghalibah | غالبة | Ghālibah | محافظة صعدة | PPL | 80 | 5 | 55.05 | saada |
| al-qaim | القائم | Al Qā’im | محافظة صعدة | PPL | 80 | 1 | 53.78 | saada |
| al-muhajirin | المحجارين | Al Muḩājirīn | محافظة صعدة | PPL | 80 | 3 | 55.03 | saada |
| al-afla | العفلاء | Al ‘Aflā’ | محافظة صعدة | PPL | 80 | 3 | 54.89 | saada |
| gharib-al-qashabah | غارب القشبة | Ghārib al Qashabah | محافظة صعدة | PPL | 80 | 1 | 54.91 | saada |
| al-huwayl | الحويل | Al Ḩuwayl | محافظة صعدة | PPL | 80 | 1 | 55.01 | saada |
| amahazin | أمحظن | Amaḩaz̧in | محافظة صعدة | PPL | 80 | 1 | 54.68 | saada |
| al-mirazim | المرازم | Al Mirāzim | محافظة صعدة | PPL | 80 | 1 | 54.75 | saada |
| al-ahmar | الأحمر | Al Aḩmar | محافظة صعدة | PPL | 80 | 5 | 54.56 | saada |
| zahir-afjah | ظاهر أفجح | Z̧āhir Afjaḩ | محافظة صعدة | PPL | 80 | 2 | 54.57 | saada |
| zahar-salih | ظهر صالح | Z̧ahar Şāliḩ | محافظة صعدة | PPL | 80 | 2 | 54.35 | saada |
| ash-shibab-wa-al-birkat | الشباب و البركات | Ash Shibāb wa al Birkāt | محافظة صعدة | PPL | 80 | 2 | 54.53 | saada |
| al-mujayrah | المجعيرة | Al Muj‘ayrah | محافظة صعدة | PPL | 80 | 4 | 51.51 | saada |
| ad-diya | الضياع | Aḑ Ḑiyā‘ | محافظة صعدة | PPL | 80 | 2 | 51.66 | saada |
| walan | وعلان | Wa‘lān | محافظة صعدة | PPL | 80 | 1 | 52.16 | saada |
| al-jawz | الجوز | Al Jawz | محافظة صعدة | PPL | 80 | 6 | 51.51 | saada |
| az-zihar | الظهار | Az̧ Z̧ihār | محافظة صعدة | PPL | 80 | 5 | 51.64 | saada |
| gharib-hawtan | غارب حوتان | Ghārib Ḩawtān | محافظة صعدة | PPL | 80 | 3 | 51.72 | saada |
| jadwah | جدوة | Jadwah | محافظة صعدة | PPL | 80 | 1 | 51.40 | saada |
| as-samahani | الصماحني | Aş Şamāḩanī | محافظة صعدة | PPL | 80 | 1 | 51.57 | saada |
| as-sawani | الصوانع | Aş Şawāni‘ | محافظة صعدة | PPL | 80 | 1 | 51.19 | saada |
| az-zihar | الظهار | Az̧ Z̧ihār | محافظة صعدة | PPL | 80 | 2 | 51.05 | saada |
| gharibah | غربة | Gharibah | محافظة صعدة | PPL | 80 | 1 | 51.59 | saada |
| asiri | عصري | ‘Aşirī | محافظة صعدة | PPL | 80 | 5 | 51.35 | saada |
| wad-al-farakh | وعد الفرخ | Wa‘d al Farakh | محافظة صعدة | PPL | 80 | 1 | 51.33 | saada |
| majran-al-ahmar | مجران الأحمر | Majrān al Aḩmar | محافظة صعدة | PPL | 80 | 1 | 51.56 | saada |
| as-salw | الصلو | Aş Şalw | محافظة صعدة | PPL | 80 | 1 | 51.73 | saada |
| saaw-al-madw | سعاو المدو | Sa‘āw al Madw | محافظة صعدة | PPL | 80 | 1 | 51.49 | saada |
| jawziyad | جوزياد | Jawziyād | محافظة صعدة | PPL | 80 | 10 | 51.40 | saada |
| anmi | عنمي | ‘Anmī | محافظة صعدة | PPL | 80 | 2 | 52.05 | saada |
| az-zahirah | الظهرة | Az̧ Z̧ahirah | محافظة صعدة | PPL | 80 | 2 | 51.71 | saada |
| al-jufrah | الجفرة | Al Jufrah | محافظة صعدة | PPL | 80 | 1 | 51.60 | saada |
| hujimi | حوجمي | Ḩūjimī | محافظة صعدة | PPL | 80 | 4 | 51.66 | saada |
| ar-riyani | الرياني | Ar Riyānī | محافظة صعدة | PPL | 80 | 1 | 52.04 | saada |
| al-muqatir | المقاطر | Al Muqāţir | محافظة صعدة | PPL | 80 | 3 | 51.68 | saada |
| as-sarikhah | الصرخة | Aş Şarikhah | محافظة صعدة | PPL | 80 | 1 | 51.81 | saada |
| al-wujya | الوجياء | Al Wujyā’ | محافظة صعدة | PPL | 80 | 2 | 51.77 | saada |
| al-qaim | القائم | Al Qā’im | محافظة صعدة | PPL | 80 | 4 | 51.89 | saada |
| al-ahil | العهل | Al ‘Ahil | محافظة صعدة | PPL | 80 | 2 | 51.28 | saada |
| ad-dahrah | الدحرة | Ad Daḩrah | محافظة صعدة | PPL | 80 | 2 | 51.51 | saada |
| tayti | تيتويع | Taytī‘ | محافظة صعدة | PPL | 80 | 1 | 51.36 | saada |
| al-mawqi | الموقعي | Al Mawq‘ī | محافظة صعدة | PPL | 80 | 1 | 51.44 | saada |
| al-muayin | المعاين | Al Mu‘āyin | محافظة صعدة | PPL | 80 | 3 | 51.29 | saada |
| gharib-al-aruj | غارب العروج | Ghārib al ‘Arūj | محافظة صعدة | PPL | 80 | 3 | 51.44 | saada |
| hayud-jannah | حيود جنة | Ḩayūd Jannah | محافظة صعدة | PPL | 80 | 3 | 51.16 | saada |
| al-masa | المسعى | Al Mas‘á | محافظة صعدة | PPL | 80 | 3 | 51.81 | saada |
| al-muhallal | المهلل | Al Muhallal | محافظة صعدة | PPL | 80 | 3 | 52.11 | saada |
| al-mazab | المعزب | Al Ma‘zab | محافظة صعدة | PPL | 80 | 2 | 52.58 | saada |
| al-hazah | الحازة | Al Ḩāzah | محافظة صعدة | PPL | 80 | 4 | 52.58 | saada |
| raghdan | رغدان | Raghdān | محافظة صعدة | PPL | 80 | 4 | 52.42 | saada |
| gharib-al-qayf | غارب القيف | Ghārib al Qayf | محافظة صعدة | PPL | 80 | 3 | 52.25 | saada |
| al-makhsha | المخشاع | Al Makhshā‘ | محافظة صعدة | PPL | 80 | 3 | 52.10 | saada |
| al-hisn | الحصن | Al Ḩişn | محافظة صعدة | PPL | 80 | 6 | 52.06 | saada |
| al-qullah | القلة | Al Qullah | محافظة صعدة | PPL | 80 | 2 | 52.38 | saada |
| al-hajilat | الحجلات | Al Ḩajilāt | محافظة صعدة | PPL | 80 | 2 | 52.66 | saada |
| al-mihmat | المحماة | Al Miḩmāt | محافظة صعدة | PPL | 80 | 2 | 52.68 | saada |
| an-nuqayl | النقيل | An Nuqayl | محافظة صعدة | PPL | 80 | 3 | 52.75 | saada |
| adh-dhanibah | الذنبة | Adh Dhanibah | محافظة صعدة | PPL | 80 | 2 | 53.00 | saada |
| al-mahatt | المحط | Al Maḩaţţ | محافظة صعدة | PPL | 80 | 9 | 52.00 | saada |
| at-tawail | الطوائل | Aţ Ţawā’il | محافظة صعدة | PPL | 80 | 8 | 52.81 | saada |
| al-qazwa | القزوع | Al Qazwa‘ | محافظة صعدة | PPL | 80 | 7 | 50.16 | saada |
| al-marqab | المرقب | Al Marqab | محافظة صعدة | PPL | 80 | 5 | 50.87 | saada |
| al-makhbi | المخبي | Al Makhbī | محافظة صعدة | PPL | 80 | 8 | 51.55 | saada |
| al-mabrak | المبرك | Al Mabrak | محافظة صعدة | PPL | 80 | 8 | 51.33 | saada |
| al-marqab | المقرب | Al Marqab | محافظة صعدة | PPL | 80 | 10 | 51.48 | saada |
| badah | بضعة | Baḑ‘ah | محافظة صعدة | PPL | 80 | 6 | 51.58 | saada |
| al-mawasilat | الموصلات | Al Mawaşilāt | محافظة صعدة | PPL | 80 | 4 | 51.69 | saada |
| shati-husayn | شاطئ حسين | Shāţi’ Ḩusayn | محافظة صعدة | PPL | 80 | 2 | 50.28 | saada |
| al-qadwaliyat | القضوليات | Al Qaḑwalīyāt | محافظة صعدة | PPL | 80 | 1 | 50.83 | saada |
| tajdhal | تجذل | Tajdhal | محافظة صعدة | PPL | 80 | 1 | 49.98 | saada |
| al-majrib | المجرب | Al Majrib | محافظة صعدة | PPL | 80 | 3 | 50.67 | saada |
| al-jabran | ال جبران | Āl Jabrān | محافظة صعدة | PPL | 80 | 15 | 50.54 | saada |
| al-khayati | الخياطي | Al Khayāţī | محافظة صعدة | PPL | 80 | 4 | 50.38 | saada |
| ar-rahwah | الرهوة | Ar Rahwah | محافظة صعدة | PPL | 80 | 3 | 45.69 | saada |
| ash-sharqi | الشرقي | Ash Sharqī | محافظة صعدة | PPL | 80 | 3 | 44.80 | saada |
| baynah | بينة | Baynah | محافظة صعدة | PPL | 80 | 14 | 43.97 | saada |
| gharib-al-qarad | غارب القرض | Ghārib al Qaraḑ | محافظة صعدة | PPL | 80 | 5 | 41.66 | saada |
| aziyah | عزبة | ‘Azīyah | محافظة صعدة | PPL | 80 | 3 | 42.86 | saada |
| qillat-al-haml | قلة الهمل | Qillat al Haml | محافظة صعدة | PPL | 80 | 7 | 42.20 | saada |
| ash-sharqi | الشرقي | Ash Sharqī | محافظة صعدة | PPL | 80 | 5 | 41.67 | saada |
| talh | طلح | Ţalḩ | محافظة صعدة | PPL | 80 | 1 | 44.17 | saada |
| al-al-baylim | ال البيلم | Āl al Baylim | محافظة صعدة | PPL | 80 | 15 | 43.62 | saada |
| ar-rasi | الرصع | Ar Raşi‘ | محافظة صعدة | PPL | 80 | 7 | 41.97 | saada |
| jarlimah | جرلمة | Jarlimah | محافظة صعدة | PPL | 80 | 1 | 41.90 | saada |
| jurban | جربان | Jurbān | محافظة صعدة | PPL | 80 | 1 | 41.97 | saada |
| al-khumair | الخمائر | Al Khumā’ir | محافظة صعدة | PPL | 80 | 24 | 41.10 | saada |
| shiran | شعران | Shi‘rān | محافظة صعدة | PPL | 80 | 1 | 44.47 | saada |
| as-sanmah | السنمة | As Sanmah | محافظة صعدة | PPL | 80 | 4 | 44.68 | saada |
| as-salail | السلائل | As Salā’il | محافظة صعدة | PPL | 80 | 5 | 45.34 | saada |
| asurah | عصورة | ‘Aşūrah | محافظة صعدة | PPL | 80 | 16 | 45.13 | saada |
| mawin | ماون | Māwin | محافظة صعدة | PPL | 80 | 3 | 39.05 | saada |
| al-mizrab | المزراب | Al Mizrāb | محافظة صعدة | PPL | 80 | 2 | 40.07 | saada |
| muwahhirah | موهرة | Muwahhirah | محافظة صعدة | PPL | 80 | 2 | 40.63 | saada |
| qarn-al-baytar | قرن البيطار | Qarn al Bayţār | محافظة صعدة | PPL | 80 | 7 | 40.04 | saada |
| amaqiyah | عماقية | ‘Amāqīyah | محافظة صعدة | PPL | 80 | 10 | 39.91 | saada |
| mijran-bardah | مجران بردة | Mijrān Bardah | محافظة صعدة | PPL | 80 | 5 | 40.39 | saada |
| qayran | قيران | Qayrān | محافظة صعدة | PPL | 80 | 3 | 41.80 | saada |
| darb-an-nuqayb | درب النقيب | Darb an Nuqayb | محافظة صعدة | PPL | 80 | 8 | 44.75 | saada |
| al-qawah | القعوة | Al Qa‘wah | محافظة صعدة | PPL | 80 | 25 | 46.82 | saada |
| shidhanah | شذانة | Shidhānah | محافظة صعدة | PPL | 80 | 2 | 48.22 | saada |
| bilad-dahimi | بلاد دهمة | Bilād Dahimī | محافظة صعدة | PPL | 80 | 33 | 46.69 | saada |
| al-balaqi | البلقي | Al Balaqī | محافظة صعدة | PPL | 80 | 16 | 45.75 | saada |
| al-qurash | ال قراش | Āl Qurāsh | محافظة صعدة | PPL | 80 | 8 | 46.01 | saada |
| al-jaysh | الجيش | Al Jaysh | محافظة صعدة | PPL | 80 | 19 | 44.92 | saada |
| al-qaradiyah | القرضية | Al Qaraḑīyah | محافظة صعدة | PPL | 80 | 6 | 44.33 | saada |
| musaydah | مصيدة | Muşaydah | محافظة صعدة | PPL | 80 | 5 | 45.25 | saada |
| an-naashuh | النعاشوة | An Na‘āshūh | محافظة صعدة | PPL | 80 | 36 | 50.08 | saada |
| al-ghuthwat | ال غثوات | Āl Ghuthwāt | محافظة صعدة | PPL | 80 | 15 | 49.87 | saada |
| al-miran | ال ميران | Āl Mīrān | محافظة صعدة | PPL | 80 | 38 | 49.95 | saada |
| bayt-rawiyah | بيت راوية | Bayt Rāwīyah | محافظة صعدة | PPL | 80 | 9 | 49.75 | saada |
| ar-radim | الردم | Ar Radim | محافظة صعدة | PPL | 80 | 11 | 49.58 | saada |
| gharib-al-juhayr | غارب الجهير | Ghārib al Juhayr | محافظة صعدة | PPL | 80 | 8 | 49.25 | saada |
| al-al-asimi | ال العصمي | Āl al ‘Aşimī | محافظة صعدة | PPL | 80 | 19 | 49.17 | saada |
| shirbub | شربوب | Shirbūb | محافظة صعدة | PPL | 80 | 6 | 48.73 | saada |
| al-al-kaami | ال الكعمي | Āl al Ka‘amī | محافظة صعدة | PPL | 80 | 4 | 48.31 | saada |
| al-qaridah | القرضة | Al Qariḑah | محافظة صعدة | PPL | 80 | 4 | 48.01 | saada |
| sirw-al-kaami | سرو الكعمي | Sirw al Ka‘amī | محافظة صعدة | PPL | 80 | 13 | 48.74 | saada |
| qullat-bin-naam | قلة بن ناعم | Qullat Bin Nā‘am | محافظة صعدة | PPL | 80 | 8 | 47.52 | saada |
| al-al-wasi | ال الواسي | Āl al Wāsī | محافظة صعدة | PPL | 80 | 24 | 47.30 | saada |
| gharib-al-aqim | غارب العقيم | Ghārib al ‘Aqīm | محافظة صعدة | PPL | 80 | 4 | 47.03 | saada |
| ash-shaqaf | الشقف | Ash Shaqaf | محافظة صعدة | PPL | 80 | 4 | 49.77 | saada |
| thalah | ثعلة | Tha‘lah | محافظة صعدة | PPL | 80 | 4 | 50.08 | saada |
| al-mudawwarat | المدورات | Al Mudawwarāt | محافظة صعدة | PPL | 80 | 6 | 65.40 | saada |
| as-sarah | السارة | As Sārah | محافظة صعدة | PPL | 80 | 3 | 61.65 | saada |
| as-sahr | السحر | As Saḩr | محافظة صعدة | PPL | 80 | 5 | 62.54 | saada |
| ar-rahban | الرحبان | Ar Raḩbān | محافظة صعدة | PPL | 80 | 8 | 62.70 | saada |
| al-ashshah | العشة | Al ‘Ashshah | محافظة صعدة | PPL | 80 | 23 | 64.90 | saada |
| al-uslan | ال عسلان | Āl ‘Uslān | محافظة صعدة | PPL | 80 | 28 | 65.11 | saada |
| ad-dahah | الضاحة | Aḑ Ḑāḩah | محافظة صعدة | PPL | 80 | 6 | 61.39 | saada |
| al-wilaj | الولاج | Al Wilāj | محافظة صعدة | PPL | 80 | 6 | 61.14 | saada |
| al-al-waghbi | ال الوغبي | Āl al Waghbī | محافظة صعدة | PPL | 80 | 31 | 61.30 | saada |
| basnam | بسنم | Basnam | محافظة صعدة | PPL | 80 | 50 | 52.13 | saada |
| al-jalhah | الجلهة | Al Jalhah | محافظة صعدة | PPL | 80 | 7 | 65.01 | saada |
| al-qaniyah | القانية | Al Qānīyah | محافظة صعدة | PPL | 80 | 4 | 64.93 | saada |
| al-ghubayb | الغبيب | Al Ghubayb | محافظة صعدة | PPL | 80 | 1 | 65.09 | saada |
| al-jalabi | الجلابي | Al Jalābī | محافظة صعدة | PPL | 80 | 7 | 65.31 | saada |
| al-qishatayn | القيشتين | Al Qīshatayn | محافظة صعدة | PPL | 80 | 9 | 64.87 | saada |
| al-hitafir | ال هتافر | Āl Hitāfir | محافظة صعدة | PPL | 80 | 15 | 63.82 | saada |
| al-hankirah | الحنكرة | Al Ḩankirah | محافظة صعدة | PPL | 80 | 18 | 66.86 | saada |
| as-suqaf | السقاف | As Suqāf | محافظة صعدة | PPL | 80 | 7 | 63.99 | saada |
| safwan | صفوان | Şafwān | محافظة صعدة | PPL | 80 | 4 | 62.87 | saada |
| ash-shanah | الشانة | Ash Shānah | محافظة صعدة | PPL | 80 | 15 | 62.79 | saada |
| al-ghanim | ال غانم | Āl Ghānim | محافظة صعدة | PPL | 80 | 5 | 62.53 | saada |
| al-udhbat | العذبات | Al ‘Udhbāt | محافظة صعدة | PPL | 80 | 2 | 62.67 | saada |
| ar-raqraqah | الرقرقة | Ar Raqraqah | محافظة صعدة | PPL | 80 | 8 | 68.02 | saada |
| al-majhud | ال مجحود | Āl Majḩūd | محافظة صعدة | PPL | 80 | 5 | 68.53 | saada |
| ash-shuraytha | الشريثاء | Ash Shuraythā’ | محافظة صعدة | PPL | 80 | 2 | 68.17 | saada |
| as-sama | الصمع | Aş Şama‘ | محافظة صعدة | PPL | 80 | 10 | 64.08 | saada |
| futaysh | فتيش | Futaysh | محافظة صعدة | PPL | 80 | 19 | 67.22 | saada |
| anjayh | أنجيح | Anjayḩ | محافظة صعدة | PPL | 80 | 15 | 64.39 | saada |
| al-muhtajaf | المحتجف | Al Muḩtajaf | محافظة صعدة | PPL | 80 | 2 | 65.01 | saada |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة صعدة | PPL | 80 | 2 | 62.74 | saada |
| al-manquzah | المنقوزة | Al Manqūzah | محافظة صعدة | PPL | 80 | 12 | 58.83 | saada |
| umm-al-shatb | أم الشطب | Umm al Shaţb | محافظة صعدة | PPL | 80 | 3 | 58.95 | saada |
| hisn-al-uqlah | حصن العقلة | Ḩişn al ‘Uqlah | محافظة صعدة | PPL | 80 | 2 | 73.44 | saada |
| dahrat-as-sawh | دحرة الصوح | Daḩrat aş Şawḩ | محافظة صعدة | PPL | 80 | 1 | 74.00 | saada |
| shukhmah | سخمة | Shukhmah | محافظة صعدة | PPL | 80 | 2 | 73.93 | saada |
| nayd-as-suayn | نيد الصعيب | Nayd aş Şu‘ayn | محافظة صعدة | PPL | 80 | 2 | 69.00 | saada |
| al-mashraqah | المشرقة | Al Mashraqah | محافظة صعدة | PPL | 80 | 2 | 69.37 | saada |
| baghur-nawah | بغور نعوة | Baghūr Na‘wah | محافظة صعدة | PPL | 80 | 1 | 71.71 | saada |
| at-tariq | الطريق | Aţ Ţarīq | محافظة صعدة | PPL | 80 | 2 | 71.31 | saada |
| al-arari | العرعري | Al ‘Ara‘rī | محافظة صعدة | PPL | 80 | 6 | 71.04 | saada |
| al-mashqaf | المشقف | Al Mashqaf | محافظة صعدة | PPL | 80 | 2 | 72.06 | saada |
| al-wulaj | الولاج | Al Wulāj | محافظة صعدة | PPL | 80 | 3 | 73.59 | saada |
| mabayid | مبايد | Mabāyid | محافظة صعدة | PPL | 80 | 2 | 73.94 | saada |
| as-sarir | السرير | As Sarīr | محافظة صعدة | PPL | 80 | 1 | 74.30 | saada |
| ash-shalakh | الشلخ | Ash Shalakh | محافظة صعدة | PPL | 80 | 4 | 74.33 | saada |
| ash-sharajayn | الشرجين | Ash Sharajayn | محافظة صعدة | PPL | 80 | 6 | 74.38 | saada |
| ath-thawmaran | الثومران | Ath Thawmarān | محافظة صعدة | PPL | 80 | 4 | 74.48 | saada |
| al-khuththat | الخثات | Al Khuththāt | محافظة صعدة | PPL | 80 | 1 | 74.49 | saada |
| al-aramah | العرامة | Al ‘Arāmah | محافظة صعدة | PPL | 80 | 2 | 74.61 | saada |
| al-hathirah | الحثيرة | Al Ḩathīrah | محافظة صعدة | PPL | 80 | 2 | 74.92 | saada |
| al-halwah | الحلوة | Al Ḩalwah | محافظة صعدة | PPL | 80 | 1 | 75.26 | saada |
| alayh | الية | Alayh | محافظة صعدة | PPL | 80 | 3 | 74.15 | saada |
| sunamah | سنامة | Sunāmah | محافظة صعدة | PPL | 80 | 2 | 80.71 | saada |
| al-qawas | القوس | Al Qawas | محافظة صعدة | PPL | 80 | 10 | 78.22 | saada |
| al-firqad | الفرقد | Al Firqad | محافظة صعدة | PPL | 80 | 7 | 78.31 | saada |
| al-firqad-al-asfal | الفرقد الأسفل | Al Firqad al Asfal | محافظة صعدة | PPL | 80 | 6 | 78.44 | saada |
| al-manhar | المنحر | Al Manḩar | محافظة صعدة | PPL | 80 | 8 | 79.00 | saada |
| at-tataan | الطعطعان | Aţ Ţa‘ţa‘ān | محافظة صعدة | PPL | 80 | 9 | 79.31 | saada |
| al-ta | ال تاء | Āl Tā’ | محافظة صعدة | PPL | 80 | 9 | 73.39 | saada |
| al-arijayn | العرجين | Al ‘Arijayn | محافظة صعدة | PPL | 80 | 6 | 75.38 | saada |
| al-musakkinah | المسكنة | Al Musakkinah | محافظة صعدة | PPL | 80 | 10 | 76.65 | saada |
| al-ubayl | العبيل | Al ‘Ubayl | محافظة صعدة | PPL | 80 | 14 | 76.22 | saada |
| al-anijah | العنجة | Al ‘Anijah | محافظة صعدة | PPL | 80 | 17 | 77.67 | saada |
| al-araj | العرج | Al ‘Araj | محافظة صعدة | PPL | 80 | 3 | 77.61 | saada |
| al-ujrimah | العجرمة | Al ‘Ujrimah | محافظة صعدة | PPL | 80 | 6 | 77.88 | saada |
| mirbat | مريط | Mirbaţ | محافظة صعدة | PPL | 80 | 4 | 77.01 | saada |
| al-mawtir | الموتر | Al Mawtir | محافظة صعدة | PPL | 80 | 4 | 75.28 | saada |
| al-mughtassib | المغتصب | Al Mughtaşşib | محافظة صعدة | PPL | 80 | 5 | 78.18 | saada |
| as-suq | السوق | As Sūq | محافظة صعدة | PPL | 80 | 25 | 77.37 | saada |
| al-albalabi | العلبلابي | Al ‘Albalābī | محافظة صعدة | PPL | 80 | 1 | 70.44 | saada |
| asfal-al-aqabah | أسفل العقبة | Asfal al ‘Aqabah | محافظة صعدة | PPL | 80 | 1 | 72.48 | saada |
| al-ashhat | الأشحات | Al Ashḩāt | محافظة صعدة | PPL | 80 | 1 | 76.73 | saada |
| al-quhmah | القهمة | Al Quhmah | محافظة صعدة | PPL | 80 | 1 | 75.98 | saada |
| at-tahmid | التحمد | At Taḩmid | محافظة صعدة | PPL | 80 | 1 | 76.16 | saada |
| thamrat | ثمرات | Thamrāt | محافظة صعدة | PPL | 80 | 1 | 72.70 | saada |
| qabis | قابس | Qābis | محافظة صعدة | PPL | 80 | 1 | 72.75 | saada |
| al-mashtub | المشطوب | Al Mashţūb | محافظة صعدة | PPL | 80 | 1 | 73.06 | saada |
| al-mirad | المعراض | Al Mi‘rāḑ | محافظة صعدة | PPL | 80 | 1 | 72.72 | saada |
| dhira-ash-shaqqah | ذراع الشقة | Dhirā‘ ash Shaqqah | محافظة صعدة | PPL | 80 | 1 | 73.18 | saada |
| bayn-ash-shibabayn | بين الشبابين | Bayn ash Shibābayn | محافظة صعدة | PPL | 80 | 1 | 73.02 | saada |
| al-jufra | الجفراء | Al Jufrā’ | محافظة صعدة | PPL | 80 | 1 | 72.88 | saada |
| al-kitf | الكتف | Al Kitf | محافظة صعدة | PPL | 80 | 1 | 72.86 | saada |
| labwah | لبوة | Labwah | محافظة صعدة | PPL | 80 | 1 | 71.53 | saada |
| ath-thiharah | الثهارة | Ath Thihārah | محافظة صعدة | PPL | 80 | 3 | 71.48 | saada |
| at-tiran | الترعان | At Tir‘ān | محافظة صعدة | PPL | 80 | 2 | 72.21 | saada |
| al-fahil | الفحل | Al Faḩil | محافظة صعدة | PPL | 80 | 2 | 72.45 | saada |
| as-silah | السلعة | As Sil‘ah | محافظة صعدة | PPL | 80 | 1 | 72.92 | saada |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة صعدة | PPL | 80 | 1 | 72.38 | saada |
| al-hayjah | الهيجة | Al Hayjah | محافظة صعدة | PPL | 80 | 1 | 72.19 | saada |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة صعدة | PPL | 80 | 1 | 73.84 | saada |
| qullat-sulayman | قلة سليمان | Qullat Sulaymān | محافظة صعدة | PPL | 80 | 1 | 73.55 | saada |
| al-mujaah | المجاعة | Al Mujā‘ah | محافظة صعدة | PPL | 80 | 1 | 73.45 | saada |
| al-qurthiyah | القرثية | Al Qurthīyah | محافظة صعدة | PPL | 80 | 1 | 73.50 | saada |
| as-sarir | السرير | As Sarīr | محافظة صعدة | PPL | 80 | 1 | 73.82 | saada |
| as-sahibah | السحبة | As Saḩibah | محافظة صعدة | PPL | 80 | 1 | 73.76 | saada |
| al-mihmay | المحماي | Al Miḩmāy | محافظة صعدة | PPL | 80 | 1 | 73.86 | saada |
| al-ada | العادى | Al ‘Ādá | محافظة صعدة | PPL | 80 | 1 | 74.46 | saada |
| at-tuhaylah | الطحيلة | Aţ Ţuḩaylah | محافظة صعدة | PPL | 80 | 1 | 72.67 | saada |
| shuja | شجاع | Shujā‘ | محافظة صعدة | PPL | 80 | 1 | 73.64 | saada |
| al-khitam | الخطام | Al Khiţām | محافظة صعدة | PPL | 80 | 1 | 73.70 | saada |
| al-muwayrah | الموبرة | Al Muwayrah | محافظة صعدة | PPL | 80 | 3 | 73.74 | saada |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة صعدة | PPL | 80 | 2 | 73.98 | saada |
| ar-radim | الردم | Ar Radim | محافظة صعدة | PPL | 80 | 1 | 74.14 | saada |
| talhat | طلحات | Ţalḩāt | محافظة صعدة | PPL | 80 | 1 | 74.59 | saada |
| al-majimah | المعجمة | Al Ma‘jimah | محافظة صعدة | PPL | 80 | 1 | 74.30 | saada |
| badiyah | بادية | Bādīyah | محافظة صعدة | PPL | 80 | 1 | 74.06 | saada |
| al-ablayah | العبلاية | Al ‘Ablāyah | محافظة صعدة | PPL | 80 | 6 | 73.61 | saada |
| qaryat-al-jabbar | قرية الجبار | Qaryat al Jabbār | محافظة صعدة | PPL | 80 | 5 | 70.47 | saada |
| ash-shawbi | الشوبي | Ash Shawbī | محافظة صعدة | PPL | 80 | 2 | 70.39 | saada |
| hajwan | حجوان | Ḩajwān | محافظة صعدة | PPL | 80 | 4 | 70.52 | saada |
| as-sayb | السيب | As Sayb | محافظة صعدة | PPL | 80 | 3 | 70.45 | saada |
| al-khuzaynah | الخزينة | Al Khuzaynah | محافظة صعدة | PPL | 80 | 7 | 70.35 | saada |
| tahir-al-khuznah | تهر الخزنة | Tahir al Khuznah | محافظة صعدة | PPL | 80 | 2 | 70.09 | saada |
| ar-rahilah | الراحلة | Ar Rāḩilah | محافظة صعدة | PPL | 80 | 2 | 70.41 | saada |
| maniqah | معنقة | Ma‘niqah | محافظة صعدة | PPL | 80 | 5 | 73.03 | saada |
| dahiyah | ضحية | Ḑaḩīyah | محافظة صعدة | PPL | 80 | 2 | 73.06 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة صعدة | PPL | 80 | 1 | 73.17 | saada |
| al-ubayd | العبيد | Al ‘Ubayd | محافظة صعدة | PPL | 80 | 1 | 72.84 | saada |
| al-barik | البارك | Al Bārik | محافظة صعدة | PPL | 80 | 2 | 72.45 | saada |
| ash-shaqrah | الشقرة | Ash Shaqrah | محافظة صعدة | PPL | 80 | 5 | 73.78 | saada |
| al-hayjah | الهيجة | Al Hayjah | محافظة صعدة | PPL | 80 | 5 | 70.69 | saada |
| al-gharram | الغرم | Al Gharram | محافظة صعدة | PPL | 80 | 5 | 70.59 | saada |
| as-sadarah | الصدارة | Aş Şadārah | محافظة صعدة | PPL | 80 | 4 | 71.85 | saada |
| al-udayni | العديني | Al ‘Udaynī | محافظة صعدة | PPL | 80 | 3 | 71.69 | saada |
| as-sahil | الساحل | As Sāḩil | محافظة صعدة | PPL | 80 | 11 | 72.31 | saada |
| as-sambariyah | الصمبرية | Aş Şambarīyah | محافظة صعدة | PPL | 80 | 2 | 72.91 | saada |
| al-marwi | المروي | Al Marwī | محافظة صعدة | PPL | 80 | 2 | 72.03 | saada |
| al-uqali | العقالي | Al ‘Uqālī | محافظة صعدة | PPL | 80 | 10 | 71.52 | saada |
| al-hayjah | الهيجة | Al Hayjah | محافظة صعدة | PPL | 80 | 6 | 71.88 | saada |
| ad-dahrah | الدحرة | Ad Daḩrah | محافظة صعدة | PPL | 80 | 4 | 71.71 | saada |
| ar-rathth | الرث | Ar Rathth | محافظة صعدة | PPL | 80 | 3 | 61.60 | saada |
| adh-dhiyur | الذيور | Adh Dhiyūr | محافظة صعدة | PPL | 80 | 3 | 67.52 | saada |
| dhawat-al-arsh | ذوات العرش | Dhawāt al ‘Arsh | محافظة صعدة | PPL | 80 | 5 | 61.66 | saada |
| qullat-al-ashwah | قلة العشوة | Qullat al ‘Ashwah | محافظة صعدة | PPL | 80 | 4 | 61.67 | saada |
| al-akwan | الأكوان | Al Akwān | محافظة صعدة | PPL | 80 | 2 | 62.08 | saada |
| juhaymah | جحيمة | Juḩaymah | محافظة صعدة | PPL | 80 | 7 | 61.73 | saada |
| saad | سعاد | Sa‘ād | محافظة صعدة | PPL | 80 | 12 | 61.25 | saada |
| yar-al-ala | يعر الأعلى | Ya‘r al A‘lá | محافظة صعدة | PPL | 80 | 2 | 63.59 | saada |
| al-hurayqah | الحريقة | Al Ḩurayqah | محافظة صعدة | PPL | 80 | 9 | 67.83 | saada |
| al-ghuthra | الغثرا | Al Ghuthrā | محافظة صعدة | PPL | 80 | 3 | 62.01 | saada |
| al-mashawhit | المشوحط | Al Mashawḩiţ | محافظة صعدة | PPL | 80 | 5 | 69.84 | saada |
| as-sawniah | الصونعة | Aş Şawni‘ah | محافظة صعدة | PPL | 80 | 6 | 70.55 | saada |
| birdan | بردان | Birdān | محافظة صعدة | PPL | 80 | 6 | 70.24 | saada |
| al-aghthar | الأغثر | Al Aghthar | محافظة صعدة | PPL | 80 | 5 | 64.41 | saada |
| yar-al-asfal | يعر الأسفل | Ya‘r al Asfal | محافظة صعدة | PPL | 80 | 6 | 64.98 | saada |
| makhbay | مخباي | Makhbāy | محافظة صعدة | PPL | 80 | 8 | 64.81 | saada |
| ad-duwayhah | الضويحة | Aḑ Ḑuwayḩah | محافظة صعدة | PPL | 80 | 1 | 69.75 | saada |
| al-qawai | القواعي | Al Qawā‘ī | محافظة صعدة | PPL | 80 | 1 | 69.60 | saada |
| at-taluq | التالوق | At Tālūq | محافظة صعدة | PPL | 80 | 1 | 70.16 | saada |
| al-jihdaah | الجهدعة | Al Jihda‘ah | محافظة صعدة | PPL | 80 | 2 | 63.01 | saada |
| al-karanah | الكرانة | Al Karānah | محافظة صعدة | PPL | 80 | 1 | 67.81 | saada |
| al-atiq-al-ala | العتيق الأعلى | Al ‘Atīq al A‘lá | محافظة صعدة | PPL | 80 | 1 | 67.69 | saada |
| al-atiq-al-asfal | العتيق الأسفل | Al ‘Atīq al Asfal | محافظة صعدة | PPL | 80 | 1 | 67.77 | saada |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة صعدة | PPL | 80 | 3 | 67.67 | saada |
| al-bazawah | البزاوة | Al Bazāwah | محافظة صعدة | PPL | 80 | 2 | 68.82 | saada |
| al-hadd-al-asfal | الحد الأسفل | Al Ḩadd al Asfal | محافظة صعدة | PPL | 80 | 2 | 67.23 | saada |
| al-hadd-al-ala | الحد الأعلى | Al Ḩadd al A‘lá | محافظة صعدة | PPL | 80 | 3 | 67.03 | saada |
| al-mawbirah | الموبرة | Al Mawbirah | محافظة صعدة | PPL | 80 | 3 | 67.17 | saada |
| al-fusayha | الفسيحاء | Al Fusayḩā’ | محافظة صعدة | PPL | 80 | 4 | 67.26 | saada |
| shahran | شهران | Shahrān | محافظة صعدة | PPL | 80 | 1 | 67.60 | saada |
| al-khatwah | الخطوة | Al Khaţwah | محافظة صعدة | PPL | 80 | 2 | 66.86 | saada |
| shadhnah | شذنة | Shadhnah | محافظة صعدة | PPL | 80 | 1 | 68.75 | saada |
| al-jabhah | الجبهة | Al Jabhah | محافظة صعدة | PPL | 80 | 1 | 69.37 | saada |
| al-qullah | القلة | Al Qullah | محافظة صعدة | PPL | 80 | 3 | 67.56 | saada |
| ath-thayl | الثيل | Ath Thayl | محافظة صعدة | PPL | 80 | 4 | 66.61 | saada |
| al-madarah | المدرة | Al Madarah | محافظة صعدة | PPL | 80 | 5 | 66.91 | saada |
| shayd-an-nabshah | شيد النبشة | Shayd an Nabshah | محافظة صعدة | PPL | 80 | 3 | 66.03 | saada |
| aqil-wabrah | عاقل وبرة | ‘Āqil Wabrah | محافظة صعدة | PPL | 80 | 4 | 67.87 | saada |
| talan | طلان | Ţalān | محافظة صعدة | PPL | 80 | 16 | 56.70 | saada |
| al-rafi | ال رفيع | Āl Rafī‘ | محافظة صعدة | PPL | 80 | 5 | 57.04 | saada |
| al-sabhan | ال صبحان | Āl Şabḩān | محافظة صعدة | PPL | 80 | 10 | 56.99 | saada |
| kuhlan | كهلان | Kuhlān | محافظة صعدة | PPL | 80 | 12 | 57.15 | saada |
| al-haqlayn | الحقلين | Al Ḩaqlayn | محافظة صعدة | PPL | 80 | 20 | 56.29 | saada |
| as-sawh | الصوح | Aş Şawḩ | محافظة صعدة | PPL | 80 | 4 | 57.24 | saada |
| al-harf | الحرف | Al Ḩarf | محافظة صعدة | PPL | 80 | 4 | 54.57 | saada |
| ar-ruways | الرويس | Ar Ruways | محافظة صعدة | PPL | 80 | 2 | 61.87 | saada |
| al-hanibah | الحنبة | Al Ḩanibah | محافظة صعدة | PPL | 80 | 3 | 63.07 | saada |
| al-qinnah | القنة | Al Qinnah | محافظة صعدة | PPL | 80 | 4 | 62.55 | saada |
| nayd-al-marhah | نيد المرحة | Nayd al Marḩah | محافظة صعدة | PPL | 80 | 3 | 63.32 | saada |
| habil-al-juhaynah | حبيل الجحينة | Ḩabīl al Juḩaynah | محافظة صعدة | PPL | 80 | 3 | 63.46 | saada |
| hiraz | حراز | Ḩirāz | محافظة صعدة | PPL | 80 | 1 | 62.80 | saada |
| al-khawrimah | الخورمة | Al Khawrimah | محافظة صعدة | PPL | 80 | 1 | 63.06 | saada |
| al-malhah | الملحة | Al Malḩah | محافظة صعدة | PPL | 80 | 1 | 62.37 | saada |
| nayd-al-badi | نيد البدع | Nayd al Badi‘ | محافظة صعدة | PPL | 80 | 1 | 62.31 | saada |
| al-khalaf | الخلف | Al Khalaf | محافظة صعدة | PPL | 80 | 3 | 61.29 | saada |
| al-maqsirah | المقصرة | Al Maqşirah | محافظة صعدة | PPL | 80 | 1 | 64.32 | saada |
| nayd-madhbah | نبد مذبح | Nayd Madhbaḩ | محافظة صعدة | PPL | 80 | 3 | 64.41 | saada |
| lawh-as-sibahah | لوح السباحة | Lawḩ as Sibāḩah | محافظة صعدة | PPL | 80 | 3 | 62.53 | saada |
| nayd-aishah | نيد عائشة | Nayd ‘Ā’ishah | محافظة صعدة | PPL | 80 | 4 | 63.06 | saada |
| mahsharah | المحشرة | Maḩsharah | محافظة صعدة | PPL | 80 | 3 | 64.54 | saada |
| hubayl-al-hattah | حبيل الحتة | Ḩubayl al Ḩattah | محافظة صعدة | PPL | 80 | 7 | 64.62 | saada |
| nayd-al-khariqah | نيد الخرقة | Nayd al Khariqah | محافظة صعدة | PPL | 80 | 2 | 64.52 | saada |
| nayd-at-tarb | نيد الترب | Nayd at Tarb | محافظة صعدة | PPL | 80 | 2 | 64.17 | saada |
| al-mawbal | الموبل | Al Mawbal | محافظة صعدة | PPL | 80 | 2 | 62.38 | saada |
| ad-daharah | الدحرة | Ad Daḩarah | محافظة صعدة | PPL | 80 | 28 | 57.78 | saada |
| al-arid | العارض | Al ‘Āriḑ | محافظة صعدة | PPL | 80 | 2 | 58.34 | saada |
| ad-dala | الضلاع | Aḑ Ḑalā‘ | محافظة صعدة | PPL | 80 | 8 | 59.02 | saada |
| nayd-al-mahdar | نيد المحضر | Nayd al Maḩḑar | محافظة صعدة | PPL | 80 | 2 | 60.92 | saada |
| qihf | قحف | Qiḩf | محافظة صعدة | PPL | 80 | 11 | 61.60 | saada |
| al-burs | البرس | Al Burs | محافظة صعدة | PPL | 80 | 17 | 58.89 | saada |
| al-hadinah | الحاضنة | Al Ḩāḑinah | محافظة صعدة | PPL | 80 | 2 | 57.60 | saada |
| al-hadhifiyah | الحذفية | Al Ḩadhifīyah | محافظة صعدة | PPL | 80 | 1 | 62.45 | saada |
| as-sai | السعي | As Sa‘ī | محافظة صعدة | PPL | 80 | 7 | 57.48 | saada |
| nayd-an-nasab | نيد النصب | Nayd an Naşab | محافظة صعدة | PPL | 80 | 3 | 58.88 | saada |
| as-suwayr | السوير | As Suwayr | محافظة صعدة | PPL | 80 | 1 | 57.89 | saada |
| harf-yahya | حرف يحي | Ḩarf Yaḩya | محافظة صعدة | PPL | 80 | 1 | 61.41 | saada |
| idafah | عدافة | ‘Idāfah | محافظة صعدة | PPL | 80 | 1 | 57.38 | saada |
| bida | بداع | Bidā‘ | محافظة صعدة | PPL | 80 | 1 | 61.09 | saada |
| samuah | سموعة | Samū‘ah | محافظة صعدة | PPL | 80 | 21 | 61.27 | saada |
| al-kahafah | الكهافة | Al Kahāfah | محافظة صعدة | PPL | 80 | 4 | 61.10 | saada |
| al-ghurbabah | الغربابة | Al Ghurbābah | محافظة صعدة | PPL | 80 | 7 | 61.31 | saada |
| qullat-az-zafir | قلة الظفير | Qullat az̧ Z̧afīr | محافظة صعدة | PPL | 80 | 3 | 62.24 | saada |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة صعدة | PPL | 80 | 3 | 61.63 | saada |
| ash-shakhir | الشاخر | Ash Shākhir | محافظة صعدة | PPL | 80 | 6 | 63.36 | saada |
| uqaybah | عقيبة | ‘Uqaybah | محافظة صعدة | PPL | 80 | 2 | 62.36 | saada |
| al-atifah | العطفة | Al ‘Aţifah | محافظة صعدة | PPL | 80 | 2 | 62.07 | saada |
| lawh-ash-sharani | لوح الشرني | Lawḩ ash Sharanī | محافظة صعدة | PPL | 80 | 6 | 61.83 | saada |
| al-ariq | العريق | Al ‘Arīq | محافظة صعدة | PPL | 80 | 3 | 61.47 | saada |
| bayt-mafza | بيت مفزع | Bayt Mafza‘ | محافظة صعدة | PPL | 80 | 3 | 61.61 | saada |
| al-quwayah | القويعة | Al Quway‘ah | محافظة صعدة | PPL | 80 | 11 | 61.73 | saada |
| as-sawdah | السودة | As Sawdah | محافظة صعدة | PPL | 80 | 2 | 61.93 | saada |
| thahir-hadhayah | ثاهر حذاية | Thāhir Ḩadhāyah | محافظة صعدة | PPL | 80 | 5 | 62.45 | saada |
| lahij-mishqat | لحج مشقاة | Laḩij Mishqāt | محافظة صعدة | PPL | 80 | 1 | 61.42 | saada |
| ash-shawhit | الشوحط | Ash Shawḩiţ | محافظة صعدة | PPL | 80 | 16 | 61.02 | saada |
| at-taraqah | الطرقة | Aţ Ţaraqah | محافظة صعدة | PPL | 80 | 5 | 62.84 | saada |
| al-hashish | الحشيش | Al Ḩashīsh | محافظة صعدة | PPL | 80 | 3 | 62.57 | saada |
| al-marwiyah | المروية | Al Marwīyah | محافظة صعدة | PPL | 80 | 4 | 63.31 | saada |
| as-sitaih | السطائح | As Siţā’iḩ | محافظة صعدة | PPL | 80 | 3 | 63.10 | saada |
| al-hunanah | الحنانة | Al Ḩunānah | محافظة صعدة | PPL | 80 | 2 | 61.24 | saada |
| al-haliti | الحالطي | Al Ḩāliţī | محافظة صعدة | PPL | 80 | 4 | 63.26 | saada |
| mihjab | محجاب | Miḩjāb | محافظة صعدة | PPL | 80 | 4 | 61.96 | saada |
| kamb-az-ziraah | كمب الزراعة | Kamb az Zirā‘ah | محافظة مأرب | PPL | 80 | 30 | 3.20 | marib |
| al-hanjali | الحنجلي | Al Ḩanjalī | محافظة مأرب | PPL | 80 | 4 | 5.26 | marib |
| as-sailah | السائلة | As Sā’ilah | محافظة مأرب | PPL | 80 | 10 | 5.41 | marib |
| al-bahi | الباهي | Al Bāhī | محافظة مأرب | PPL | 80 | 31 | 4.85 | marib |
| as-saqit | الساقط | As Sāqiţ | محافظة مأرب | PPL | 80 | 20 | 6.02 | marib |
| ar-rabwah | الربوة | Ar Rabwah | محافظة مأرب | PPL | 80 | 8 | 6.07 | marib |
| as-sailah | السائلة | As Sā’ilah | محافظة مأرب | PPL | 80 | 13 | 5.23 | marib |
| nakhrat-al-irq | نخرة العرق | Nakhrat al ‘Irq | محافظة مأرب | PPL | 80 | 8 | 10.77 | marib |
| ar-rumaylah | الرميلة | Ar Rumaylah | محافظة مأرب | PPL | 80 | 9 | 3.65 | marib |
| jaww-an-nasim | جو النسيم | Jaww an Nasīm | محافظة مأرب | PPL | 80 | 21 | 3.25 | marib |
| harmalat-al-talib | حرمالة ال طالب | Ḩarmālat Āl Ţālib | محافظة مأرب | PPL | 80 | 6 | 5.39 | marib |
| al-harmal | ال حرمل | Āl Ḩarmal | محافظة مأرب | PPL | 80 | 38 | 8.44 | marib |
| al-wakhtan | ال وختان | Āl Wakhtān | محافظة مأرب | PPL | 80 | 10 | 12.44 | marib |
| al-juayshiyah | الجعيشية | Al Ju‘ayshīyah | محافظة مأرب | PPL | 80 | 5 | 12.57 | marib |
| ar-rab | الربع | Ar Rab‘ | محافظة مأرب | PPL | 80 | 15 | 11.32 | marib |
| al-bitran | ال بتران | Āl Bitrān | محافظة مأرب | PPL | 80 | 45 | 6.36 | marib |
| al-jamil | ال جميل | Āl Jamīl | محافظة مأرب | PPL | 80 | 14 | 15.98 | marib |
| fulayful | فليفل | Fulayful | محافظة مأرب | PPL | 80 | 49 | 12.42 | marib |
| as-saqit | الصاقط | Aş Şāqiţ | محافظة مأرب | PPL | 80 | 19 | 6.28 | marib |
| al-marif | المعرف | Al Ma‘rif | محافظة مأرب | PPL | 80 | 38 | 7.62 | marib |
| al-ghurayb | ال غريب | Āl Ghurayb | محافظة مأرب | PPL | 80 | 5 | 5.17 | marib |
| al-huwayn | ال حوين | Āl Ḩuwayn | محافظة مأرب | PPL | 80 | 6 | 6.20 | marib |
| al-rabi | ال ربيع | Āl Rabī‘ | محافظة مأرب | PPL | 80 | 9 | 7.03 | marib |
| al-jabir | ال جابر | Āl Jābir | محافظة مأرب | PPL | 80 | 7 | 7.19 | marib |
| al-karyan | ال كريان | Āl Karyān | محافظة مأرب | PPL | 80 | 3 | 15.08 | marib |
| ash-shaykh | الشيخ | Ash Shaykh | محافظة مأرب | PPL | 80 | 34 | 6.04 | marib |
| ath-thaman | الثمان | Ath Thamān | محافظة مأرب | PPL | 80 | 14 | 10.17 | marib |
| al-akrimah | العكرمة | Al ‘Akrimah | محافظة مأرب | PPL | 80 | 7 | 12.44 | marib |
| al-qimmad | ال قماد | Āl Qimmād | محافظة مأرب | PPL | 80 | 23 | 9.01 | marib |
| al-dalil | ال دليل | Āl Dalīl | محافظة مأرب | PPL | 80 | 9 | 9.20 | marib |
| hadba-al-mizari | حدباء المزاريع | Ḩadbā’ al Mizārī‘ | محافظة مأرب | PPL | 80 | 15 | 8.68 | marib |
| al-ghuzayl | ال غزيل | Āl Ghuzayl | محافظة مأرب | PPL | 80 | 13 | 7.85 | marib |
| al-zaydah | ال زيدة | Āl Zaydah | محافظة مأرب | PPL | 80 | 10 | 8.11 | marib |
| al-buray-imah | آل بريعمة | Āl Buray‘imah | محافظة مأرب | PPL | 80 | 12 | 7.33 | marib |
| al-ash-shiflut | ال الشفلوت | Āl ash Shiflūt | محافظة مأرب | PPL | 80 | 10 | 10.30 | marib |
| al-al-qadiri | ال القادري | Āl al Qādirī | محافظة مأرب | PPL | 80 | 13 | 11.11 | marib |
| al-al-bakiri | ال الباكري | Āl al Bākirī | محافظة مأرب | PPL | 80 | 5 | 10.60 | marib |
| al-mamlah | المملح | Al Mamlaḩ | محافظة مأرب | PPL | 80 | 32 | 16.71 | marib |
| al-hufrayn | ال حفرين | Āl Ḩufrayn | محافظة مأرب | PPL | 80 | 7 | 15.08 | marib |
| al-raqisyan | ال رقيصيان | Āl Raqīşyān | محافظة مأرب | PPL | 80 | 8 | 14.64 | marib |
| al-mitraf | ال مطرف | Āl Miţraf | محافظة مأرب | PPL | 80 | 7 | 13.29 | marib |
| al-al-baqma | ال البقماء | Āl al Baqmā’ | محافظة مأرب | PPL | 80 | 1 | 13.67 | marib |
| al-diyash | ال دياش | Āl Diyāsh | محافظة مأرب | PPL | 80 | 5 | 11.62 | marib |
| al-az-zaman | ال الظمن | Āl az̧ Z̧aman | محافظة مأرب | PPL | 80 | 5 | 17.96 | marib |
| al-mayran | ال ميران | Āl Mayrān | محافظة مأرب | PPL | 80 | 2 | 18.77 | marib |
| al-al-hudhayfi | ال الحذيفي | Āl al Ḩudhayfī | محافظة مأرب | PPL | 80 | 2 | 21.00 | marib |
| al-sada | ال سعداء | Āl Sa‘dā’ | محافظة مأرب | PPL | 80 | 7 | 21.06 | marib |
| al-as-sararah | ال الصرارة | Āl aş Şarārah | محافظة مأرب | PPL | 80 | 12 | 18.68 | marib |
| as-saqyan | السقيان | As Saqyān | محافظة مأرب | PPL | 80 | 3 | 19.95 | marib |
| al-dumaydan | ال ضميدان | Āl Ḑumaydān | محافظة مأرب | PPL | 80 | 6 | 21.43 | marib |
| al-al-kutayni | ال الكتيني | Āl al Kutaynī | محافظة مأرب | PPL | 80 | 2 | 21.03 | marib |
| al-sada | ال سعداء | Āl Sa‘dā’ | محافظة مأرب | PPL | 80 | 5 | 21.92 | marib |
| jarran | جران | Jarrān | محافظة مأرب | PPL | 80 | 11 | 21.70 | marib |
| al-masud | ال مسعود | Āl Mas‘ūd | محافظة مأرب | PPL | 80 | 9 | 12.83 | marib |
| al-al-ujay | ال العجي | Āl al ‘Ujay | محافظة مأرب | PPL | 80 | 2 | 16.96 | marib |
| al-judaylan | ال جديلان | Āl Judaylān | محافظة مأرب | PPL | 80 | 15 | 16.67 | marib |
| al-al-hurr | ال الحر | Āl al Ḩurr | محافظة مأرب | PPL | 80 | 9 | 17.34 | marib |
| az-zamin | الظمين | Az̧ Z̧amīn | محافظة مأرب | PPL | 80 | 48 | 19.93 | marib |
| al-mashar | المعشار | Al Ma‘shār | محافظة مأرب | PPL | 80 | 3 | 22.92 | marib |
| al-al-aqtam | ال الأقطم | Āl al Aqţam | محافظة مأرب | PPL | 80 | 4 | 24.18 | marib |
| al-al-ashram | ال الأشرم | Āl al Ashram | محافظة مأرب | PPL | 80 | 8 | 24.33 | marib |
| al-ishaq | آل إسحق | Āl Isḩāq | محافظة مأرب | PPL | 80 | 4 | 24.10 | marib |
| ash-shaqqah | الشقة | Ash Shaqqah | محافظة مأرب | PPL | 80 | 4 | 23.30 | marib |
| al-huwaydah | الحويضة | Al Ḩuwayḑah | محافظة مأرب | PPL | 80 | 39 | 3.32 | marib |
| al-husyan | ال حصيان | Āl Ḩuşyān | محافظة مأرب | PPL | 80 | 22 | 8.36 | marib |
| manin-al-ashraf | منين الأشراف | Manīn al Ashrāf | محافظة مأرب | PPL | 80 | 3 | 7.53 | marib |
| al-musa | ال موسى | Āl Mūsá | محافظة مأرب | PPL | 80 | 19 | 8.26 | marib |
| marbat-ad-damm | مربط الدم | Marbaţ ad Damm | محافظة مأرب | PPL | 80 | 8 | 8.86 | marib |
| al-faw | الفاو | Al Fāw | محافظة مأرب | PPL | 80 | 118 | 3.09 | marib |
| mafraq-as-sadd | مفرق السد | Mafraq as Sadd | محافظة مأرب | PPL | 80 | 31 | 5.12 | marib |
| al-jurayn | ال جريب | Āl Jurayn | محافظة مأرب | PPL | 80 | 18 | 3.85 | marib |
| al-abbud | آل عبود | Āl ‘Abbūd | محافظة مأرب | PPL | 80 | 87 | 3.87 | marib |
| al-ijayyan | آل عجيان | Āl ‘Ijayyān | محافظة مأرب | PPL | 80 | 2 | 6.80 | marib |
| al-arsh | العرش | Al ‘Arsh | محافظة مأرب | PPL | 80 | 176 | 7.66 | marib |
| al-huwayshan | ال حويشان | Āl Ḩuwayshān | محافظة مأرب | PPL | 80 | 3 | 10.74 | marib |
| al-samarah | ال سمرة | Āl Samarah | محافظة مأرب | PPL | 80 | 7 | 20.20 | marib |
| al-al-alwaq | ال الألوق | Āl al Alwaq | محافظة مأرب | PPL | 80 | 4 | 20.52 | marib |
| al-mayqan | ال ميقان | Āl Mayqān | محافظة مأرب | PPL | 80 | 2 | 20.03 | marib |
| al-hurayqdan | ال حريقدان | Āl Ḩurayqdān | محافظة مأرب | PPL | 80 | 5 | 19.51 | marib |
| al-jamaah-as-sufla | الجماعة السفلى | Al Jamā‘ah as Suflá | محافظة مأرب | PPL | 80 | 3 | 15.69 | marib |
| al-hammud-bin-al-ashja | ال حمود بن الأشجع | Āl Ḩammūd Bin al Ashja‘ | محافظة مأرب | PPL | 80 | 3 | 14.49 | marib |
| ar-rab | الربع | Ar Rab‘ | محافظة مأرب | PPL | 80 | 9 | 13.94 | marib |
| al-murzi | ال مرظي | Āl Murz̧ī | محافظة مأرب | PPL | 80 | 5 | 14.00 | marib |
| al-maqarihah | المقارحة | Al Maqāriḩah | محافظة مأرب | PPL | 80 | 6 | 14.01 | marib |
| al-al-ujay | ال العجي | Āl al ‘Ujay | محافظة مأرب | PPL | 80 | 6 | 15.46 | marib |
| ishaq-as-sufla | إسحاق السفلى | Isḩāq as Suflá | محافظة مأرب | PPL | 80 | 5 | 15.38 | marib |
| al-jabul | الجبول | Al Jabūl | محافظة مأرب | PPL | 80 | 133 | 5.94 | marib |
| al-ziyar | آل زبار | Āl Ziyār | محافظة مأرب | PPL | 80 | 7 | 8.47 | marib |
| al-judaylan | ال جديلان | Āl Judaylān | محافظة مأرب | PPL | 80 | 4 | 10.14 | marib |
| al-waqtayn | الوقطين | Al Waqţayn | محافظة مأرب | PPL | 80 | 5 | 3.29 | marib |
| al-jamil | ال جميل | Āl Jamīl | محافظة مأرب | PPL | 80 | 1 | 11.28 | marib |
| jaww-al-abr | جو العبر | Jaww al ‘Abr | محافظة مأرب | PPL | 80 | 47 | 7.35 | marib |
| al-hadr | ال حدر | Āl Ḩadr | محافظة مأرب | PPL | 80 | 18 | 3.15 | marib |
| ash-shuwahiti | الشوحطي | Ash Shuwaḩiţī | محافظة صعدة | PPL | 80 | 2 | 49.95 | saada |
| al-lujm | اللجم | Al Lujm | محافظة صعدة | PPL | 80 | 4 | 49.71 | saada |
| al-aqqah | العقة | Al ‘Aqqah | محافظة صعدة | PPL | 80 | 1 | 51.39 | saada |
| al-waq | الوقع | Al Waq‘ | محافظة صعدة | PPL | 80 | 2 | 50.33 | saada |
| sahat-al-adan | صحط العدن | Şaḩaţ al ‘Adan | محافظة صعدة | PPL | 80 | 12 | 51.10 | saada |
| al-ghamdan | ال غمان | Āl Ghamdān | محافظة صعدة | PPL | 80 | 15 | 49.75 | saada |
| al-hammud | ال حمود | Āl Ḩammūd | محافظة صعدة | PPL | 80 | 10 | 49.62 | saada |
| ash-shawamikh | الشوامخ | Ash Shawāmikh | محافظة صعدة | PPL | 80 | 5 | 54.60 | saada |
| rabkhan | ربخان | Rabkhān | محافظة صعدة | PPL | 80 | 7 | 54.62 | saada |
| al-husayn | ال حسين | Āl Ḩusayn | محافظة صعدة | PPL | 80 | 2 | 47.49 | saada |
| qullat-ash-shidani | قلة الشداني | Qullat ash Shidānī | محافظة صعدة | PPL | 80 | 1 | 47.05 | saada |
| ar-rahmah | الرحمة | Ar Raḩmah | محافظة صعدة | PPL | 80 | 6 | 53.35 | saada |
| al-jumaymah | الجميمة | Al Jumaymah | محافظة صعدة | PPL | 80 | 7 | 53.64 | saada |
| as-sayal | السيال | As Sayāl | محافظة صعدة | PPL | 80 | 1 | 47.83 | saada |
| ar-rakibah | الركبة | Ar Rakibah | محافظة صعدة | PPL | 80 | 4 | 48.17 | saada |
| aytam | عيتم | ‘Aytam | محافظة صعدة | PPL | 80 | 3 | 48.47 | saada |
| shawban | شوبان | Shawbān | محافظة صعدة | PPL | 80 | 3 | 49.15 | saada |
| al-misyal | المسيل | Al Misyal | محافظة صعدة | PPL | 80 | 1 | 48.02 | saada |
| al-misrab | المسراب | Al Misrāb | محافظة صعدة | PPL | 80 | 1 | 47.19 | saada |
| al-mawhir | الموهر | Al Mawhir | محافظة صعدة | PPL | 80 | 1 | 46.84 | saada |
| shatt-al-amudi | شط العمودي | Shaţţ al ‘Amūdī | محافظة صعدة | PPL | 80 | 1 | 47.31 | saada |
| qullat-shatt-khabyan | قلة شط خبيان | Qullat Shaţţ Khabyān | محافظة صعدة | PPL | 80 | 5 | 47.43 | saada |
| nayd-maktuf | نيد مكتوف | Nayd Maktūf | محافظة صعدة | PPL | 80 | 8 | 46.62 | saada |
| gharrat-barkah | غرة بركة | Gharrat Barkah | محافظة صعدة | PPL | 80 | 1 | 46.75 | saada |
| al-unaybin | العنيين | Al ‘Unaybīn | محافظة صعدة | PPL | 80 | 35 | 37.86 | saada |
| at-tawil | الطويل | Aţ Ţawīl | محافظة صعدة | PPL | 80 | 3 | 41.78 | saada |
| ajajah | عجاجة | ‘Ajājah | محافظة صعدة | PPL | 80 | 7 | 42.51 | saada |
| aqaris | عقارس | ‘Aqāris | محافظة صعدة | PPL | 80 | 7 | 41.60 | saada |
| as-samakhiyah | الصمخية | Aş Şamakhīyah | محافظة صعدة | PPL | 80 | 23 | 34.24 | saada |
| ar-raqib | الرقب | Ar Raqib | محافظة صعدة | PPL | 80 | 7 | 32.40 | saada |
| as-sawdah | السودة | As Sawdah | محافظة صعدة | PPL | 80 | 5 | 51.24 | saada |
| al-hajirah | الهجرة | Al Hajirah | محافظة صعدة | PPL | 80 | 5 | 50.32 | saada |
| ash-shaf | الشعف | Ash Sha‘f | محافظة صعدة | PPL | 80 | 5 | 47.19 | saada |
| al-mizab | المعزاب | Al Mi‘zāb | محافظة صعدة | PPL | 80 | 10 | 47.13 | saada |
| ar-ruhayb | الرحيب | Ar Ruḩayb | محافظة صعدة | PPL | 80 | 4 | 47.40 | saada |
| al-kitna | الكتناء | Al Kitnā’ | محافظة صعدة | PPL | 80 | 7 | 51.42 | saada |
| lahij-suwayd | لحج سويد | Laḩij Suwayd | محافظة صعدة | PPL | 80 | 6 | 50.39 | saada |
| qam-al-jahili | قمع الجهلى | Qam‘ al Jahilī | محافظة صعدة | PPL | 80 | 12 | 51.14 | saada |
| al-ghamir | الغمير | Al Ghamīr | محافظة صعدة | PPL | 80 | 6 | 49.22 | saada |
| al-idhanah | الإذانة | Al Idhānah | محافظة صعدة | PPL | 80 | 3 | 49.10 | saada |
| nayd-al-ghamir | نيد الغمير | Nayd al Ghamīr | محافظة صعدة | PPL | 80 | 7 | 46.24 | saada |
| al-majziah | المجزعة | Al Majzi‘ah | محافظة صعدة | PPL | 80 | 5 | 44.25 | saada |
| al-hima | الحماء | Al Ḩimā’ | محافظة صعدة | PPL | 80 | 33 | 54.03 | saada |
| shaji | شجع | Shaji‘ | محافظة صعدة | PPL | 80 | 21 | 42.57 | saada |
| hayyash | هياش | Hayyāsh | محافظة صعدة | PPL | 80 | 1 | 58.38 | saada |
| at-tawbiyah | التوبية | At Tawbīyah | محافظة صعدة | PPL | 80 | 2 | 58.55 | saada |
| al-qani | القاني | Al Qānī | محافظة صعدة | PPL | 80 | 2 | 53.38 | saada |
| al-mushari | المشارع | Al Mushāri‘ | محافظة صعدة | PPL | 80 | 5 | 51.11 | saada |
| adh-dhuwayr | الذوير | Adh Dhuwayr | محافظة صعدة | PPL | 80 | 3 | 58.02 | saada |
| akawal | عكاول | ‘Akāwal | محافظة صعدة | PPL | 80 | 3 | 58.00 | saada |
| al-midarah | المدرة | Al Midarah | محافظة صعدة | PPL | 80 | 9 | 57.12 | saada |
| al-martika | المرتكاء | Al Martikā’ | محافظة صعدة | PPL | 80 | 3 | 56.98 | saada |
| hiyaf-al-habil | حياف الحبيل | Ḩiyāf al Ḩabīl | محافظة صعدة | PPL | 80 | 1 | 56.03 | saada |
| hayd-al-mithlah | حيد المثلة | Ḩayd al Mithlah | محافظة صعدة | PPL | 80 | 2 | 56.24 | saada |
| qullat-ramadah | قلة رمادة | Qullat Ramādah | محافظة صعدة | PPL | 80 | 3 | 56.68 | saada |
| al-burud | البرود | Al Burūd | محافظة صعدة | PPL | 80 | 1 | 56.13 | saada |
| umm-tariq | أم طارق | Umm Ţāriq | محافظة صعدة | PPL | 80 | 2 | 55.56 | saada |
| umm-majma | أم مجمع | Umm Majma‘ | محافظة صعدة | PPL | 80 | 6 | 55.58 | saada |
| habil-al-miraghah | حبيل المراغة | Ḩabīl al Mirāghah | محافظة صعدة | PPL | 80 | 5 | 55.42 | saada |
| khatwat-al-isarah | خطوة العصارة | Khaţwat al ‘Işārah | محافظة صعدة | PPL | 80 | 2 | 57.46 | saada |
| al-jurfah | الجرفة | Al Jurfah | محافظة صعدة | PPL | 80 | 1 | 57.18 | saada |
| dhira-hazim | ذراع حازم | Dhirā‘ Ḩāzim | محافظة صعدة | PPL | 80 | 2 | 57.10 | saada |
| al-murtaj | المرتاج | Al Murtāj | محافظة صعدة | PPL | 80 | 2 | 57.02 | saada |
| al-kulaykilah | الكليكلة | Al Kulaykilah | محافظة صعدة | PPL | 80 | 6 | 56.99 | saada |
| al-fatayih | الفطايح | Al Faţāyiḩ | محافظة صعدة | PPL | 80 | 8 | 57.19 | saada |
| nayd-dumran | نيد ضمران | Nayd Ḑumrān | محافظة صعدة | PPL | 80 | 1 | 56.52 | saada |
| ash-shujn | الشجن | Ash Shujn | محافظة صعدة | PPL | 80 | 4 | 56.48 | saada |
| as-samitah | الصمطة | Aş Şamiţah | محافظة صعدة | PPL | 80 | 2 | 56.31 | saada |
| hiyaf-al-hujayl | حياف الحجيل | Ḩiyāf al Ḩujayl | محافظة صعدة | PPL | 80 | 2 | 56.69 | saada |
| dhi-al-mathab | ذي المثب | Dhī al Mathab | محافظة صعدة | PPL | 80 | 4 | 56.49 | saada |
| habil-al-wasit | حبيل الواسط | Ḩabīl al Wāsiţ | محافظة صعدة | PPL | 80 | 2 | 56.19 | saada |
| lahij-jabran | لحج جبران | Laḩij Jabrān | محافظة صعدة | PPL | 80 | 5 | 57.62 | saada |
| al-madahi | المداحي | Al Madāḩī | محافظة صعدة | PPL | 80 | 4 | 57.60 | saada |
| at-tirrah | الطرة | Aţ Ţirrah | محافظة صعدة | PPL | 80 | 5 | 57.73 | saada |
| al-hamil | الحامل | Al Ḩāmil | محافظة صعدة | PPL | 80 | 3 | 54.98 | saada |
| al-muatin | المعطن | Al Mu‘aţin | محافظة صعدة | PPL | 80 | 6 | 54.90 | saada |
| ghawiyah | غاوية | Ghāwīyah | محافظة صعدة | PPL | 80 | 2 | 55.07 | saada |
| al-hanwa | الحنواء | Al Ḩanwā’ | محافظة صعدة | PPL | 80 | 4 | 53.82 | saada |
| habil-ar-ruways | حبيل الرويس | Ḩabīl ar Ruways | محافظة صعدة | PPL | 80 | 2 | 54.79 | saada |
| ath-tharibah | الثربة | Ath Tharibah | محافظة صعدة | PPL | 80 | 6 | 54.16 | saada |
| al-muqahim | المقاهم | Al Muqāhim | محافظة صعدة | PPL | 80 | 1 | 55.88 | saada |
| silat-ar-raqah | صلة الرقعة | Şilat ar Raq‘ah | محافظة صعدة | PPL | 80 | 1 | 56.03 | saada |
| dhamshar | ذمشار | Dhamshār | محافظة صعدة | PPL | 80 | 1 | 55.45 | saada |
| al-khayshah | الخيشة | Al Khayshah | محافظة صعدة | PPL | 80 | 1 | 55.70 | saada |
| ar-rakhdah | الرخدة | Ar Rakhdah | محافظة صعدة | PPL | 80 | 3 | 50.50 | saada |
| hubayl-al-lusq | حبيل اللصق | Ḩubayl al Luşq | محافظة صعدة | PPL | 80 | 3 | 53.98 | saada |
| al-maruj | المعروج | Al Ma‘rūj | محافظة صعدة | PPL | 80 | 2 | 53.37 | saada |
| maslihat-at-turuqat | مصلحة الطرقات | Maşliḩat aţ Ţuruqāt | محافظة صعدة | PPL | 80 | 5 | 54.45 | saada |
| hutayl | هطيل | Huţayl | محافظة صعدة | PPL | 80 | 6 | 54.68 | saada |
| hayd-al-muslim | حيد المسلم | Ḩayd al Muslim | محافظة صعدة | PPL | 80 | 6 | 51.89 | saada |
| al-halat | الحلط | Al Ḩalaţ | محافظة صعدة | PPL | 80 | 24 | 52.36 | saada |
| al-jadlah | الجدلة | Al Jadlah | محافظة صعدة | PPL | 80 | 6 | 59.05 | saada |
| al-anaqah | العنقة | Al ‘Anaqah | محافظة صعدة | PPL | 80 | 6 | 55.26 | saada |
| majjat-kharyah | مجة خارية | Majjat Khāryah | محافظة صعدة | PPL | 80 | 14 | 55.28 | saada |
| an-nuqayl | النقيل | An Nuqayl | محافظة صعدة | PPL | 80 | 4 | 54.47 | saada |
| ash-shaqray | الشقراي | Ash Shaqrāy | محافظة صعدة | PPL | 80 | 5 | 54.54 | saada |
| badi-habil | بادي حبيل | Bādī Ḩabīl | محافظة صعدة | PPL | 80 | 6 | 54.88 | saada |
| al-hawzah | الحوزة | Al Ḩawzah | محافظة صعدة | PPL | 80 | 14 | 55.33 | saada |
| sami | سميع | Samī‘ | محافظة صعدة | PPL | 80 | 4 | 55.07 | saada |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة صعدة | PPL | 80 | 2 | 57.79 | saada |
| al-aniqah | العنقة | Al ‘Aniqah | محافظة صعدة | PPL | 80 | 9 | 58.80 | saada |
| falakh | فلخ | Falakh | محافظة صعدة | PPL | 80 | 4 | 58.86 | saada |
| ath-thuah | الثوعة | Ath Thū‘ah | محافظة صعدة | PPL | 80 | 1 | 56.80 | saada |
| al-basim | الباسم | Al Bāsim | محافظة صعدة | PPL | 80 | 4 | 59.52 | saada |
| al-juhmah | ال جحمة | Āl Juḩmah | محافظة صعدة | PPL | 80 | 4 | 60.18 | saada |
| marhah | مارحة | Mārḩah | محافظة صعدة | PPL | 80 | 2 | 58.91 | saada |
| sharaqib | شراقب | Sharāqib | محافظة صعدة | PPL | 80 | 4 | 58.59 | saada |
| al-madhan | المذن | Al Madhan | محافظة صعدة | PPL | 80 | 4 | 58.46 | saada |
| thuah | ثوعة | Thū‘ah | محافظة صعدة | PPL | 80 | 4 | 55.87 | saada |
| al-marid | المعرض | Al Ma‘riḑ | محافظة صعدة | PPL | 80 | 2 | 56.02 | saada |
| al-mithyat | الميثيات | Al Mīthyāt | محافظة صعدة | PPL | 80 | 1 | 55.66 | saada |
| nayd-ar-ras | نيد الرأس | Nayd ar Ra’s | محافظة صعدة | PPL | 80 | 4 | 54.34 | saada |
| al-malahibah | الملاحبة | Al Malāḩibah | محافظة صعدة | PPL | 80 | 2 | 53.29 | saada |
| ash-shalilah | الشللة | Ash Shalilah | محافظة صعدة | PPL | 80 | 9 | 53.90 | saada |
| nayd-al-khatwah | نيد الخطوة | Nayd al Khaţwah | محافظة صعدة | PPL | 80 | 5 | 54.69 | saada |
| qati-al-qarad | قطع القرض | Qaţi‘ al Qaraḑ | محافظة صعدة | PPL | 80 | 1 | 55.44 | saada |
| thahir-ash-shibab | ثاهر الشباب | Thāhir ash Shibāb | محافظة صعدة | PPL | 80 | 1 | 54.58 | saada |
| nayd-as-sijad | نيد السجاد | Nayd as Sijād | محافظة صعدة | PPL | 80 | 2 | 55.04 | saada |
| nayd-al-mawhibah | نيد الموهبة | Nayd al Mawhibah | محافظة صعدة | PPL | 80 | 2 | 55.09 | saada |
| kanin | كنين | Kanīn | محافظة صعدة | PPL | 80 | 21 | 53.66 | saada |
| az-zalami | الظلامي | Az̧ Z̧alāmī | محافظة صعدة | PPL | 80 | 4 | 56.31 | saada |
| al-qufrah | القفرة | Al Qufrah | محافظة صعدة | PPL | 80 | 10 | 57.11 | saada |
| jira-dahim | جراع داهم | Jirā‘ Dāhim | محافظة صعدة | PPL | 80 | 1 | 57.22 | saada |
| al-hayirah | الحايرة | Al Ḩāyirah | محافظة صعدة | PPL | 80 | 3 | 56.81 | saada |
| ras-an-nuqayl | رأس النقيل | Ra’s an Nuqayl | محافظة صعدة | PPL | 80 | 8 | 54.81 | saada |
| hubayl-umar | حبيل عمر | Ḩubayl ‘Umar | محافظة صعدة | PPL | 80 | 2 | 54.94 | saada |
| al-hajirah | الهجرة | Al Hajirah | محافظة صعدة | PPL | 80 | 14 | 54.99 | saada |
| nayd-al-fizar | نيد الفظار | Nayd al Fiz̧ār | محافظة صعدة | PPL | 80 | 2 | 58.77 | saada |
| nayd-al-khudhlah | نيد الخذلة | Nayd al Khudhlah | محافظة صعدة | PPL | 80 | 4 | 58.38 | saada |
| al-maftul | المفتول | Al Maftūl | محافظة صعدة | PPL | 80 | 6 | 58.80 | saada |
| al-halah | الحلة | Al Ḩalah | محافظة صعدة | PPL | 80 | 17 | 56.64 | saada |
| al-irq | العرق | Al ‘Irq | محافظة صعدة | PPL | 80 | 12 | 59.37 | saada |
| hayfat-al-ubrayn | حيفة الوبرين | Ḩayfat al Ubrayn | محافظة صعدة | PPL | 80 | 2 | 59.86 | saada |
| al-muhid | المهيد | Al Muhīd | محافظة صعدة | PPL | 80 | 6 | 59.94 | saada |
| al-qanah | القانة | Al Qānah | محافظة صعدة | PPL | 80 | 3 | 60.69 | saada |
| al-kursi | الكرسي | Al Kursī | محافظة صعدة | PPL | 80 | 3 | 60.73 | saada |
| nayd-khalid | نيد خالد | Nayd Khālid | محافظة صعدة | PPL | 80 | 1 | 60.24 | saada |
| ar-ruharih | الرحارح | Ar Ruḩāriḩ | محافظة صعدة | PPL | 80 | 7 | 60.15 | saada |
| az-zujj | الزج | Az Zujj | محافظة صعدة | PPL | 80 | 7 | 60.28 | saada |
| as-sudah | السودة | As Sūdah | محافظة صعدة | PPL | 80 | 1 | 62.03 | saada |
| al-marzuqah | المرزوقة | Al Marzūqah | محافظة صعدة | PPL | 80 | 3 | 61.22 | saada |
| ar-ramanah | الرمانة | Ar Ramānah | محافظة صعدة | PPL | 80 | 6 | 54.67 | saada |
| al-marwi | المروي | Al Marwī | محافظة صعدة | PPL | 80 | 16 | 58.76 | saada |
| al-maftul | المفتول | Al Maftūl | محافظة صعدة | PPL | 80 | 3 | 59.00 | saada |
| as-sahra | الصحراء | Aş Şaḩrā’ | محافظة صعدة | PPL | 80 | 7 | 59.36 | saada |
| al-walijah | الولجة | Al Walijah | محافظة صعدة | PPL | 80 | 11 | 59.84 | saada |
| ash-shukhayf | الشخيف | Ash Shukhayf | محافظة صعدة | PPL | 80 | 1 | 59.16 | saada |
| al-usayli | العسيلي | Al ‘Usaylī | محافظة صعدة | PPL | 80 | 1 | 59.58 | saada |
| jahu-al-bariq | جهو البارق | Jahū al Bāriq | محافظة صعدة | PPL | 80 | 1 | 59.83 | saada |
| ad-dimmah | الدمة | Ad Dimmah | محافظة صعدة | PPL | 80 | 1 | 54.77 | saada |
| al-irq | العرق | Al ‘Irq | محافظة صعدة | PPL | 80 | 6 | 55.04 | saada |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة صعدة | PPL | 80 | 3 | 54.32 | saada |
| al-lawh | اللوح | Al Lawḩ | محافظة صعدة | PPL | 80 | 7 | 54.06 | saada |
| ar-rawagh | الرواغ | Ar Rawāgh | محافظة صعدة | PPL | 80 | 3 | 61.72 | saada |
| lahij-al-liwa | لحج اللواء | Laḩij al Liwā’ | محافظة صعدة | PPL | 80 | 2 | 61.73 | saada |
| badiyah | بادية | Bādīyah | محافظة صعدة | PPL | 80 | 7 | 62.44 | saada |
| al-faninah | الفننة | Al Faninah | محافظة صعدة | PPL | 80 | 3 | 61.62 | saada |
| al-hajarah | الحجارة | Al Ḩajārah | محافظة صعدة | PPL | 80 | 6 | 63.71 | saada |
| nayd-al-quad | نيد القعاد | Nayd al Qu‘ād | محافظة صعدة | PPL | 80 | 6 | 63.53 | saada |
| al-mawafirah | الموافرة | Al Mawāfirah | محافظة صعدة | PPL | 80 | 1 | 62.47 | saada |
| al-qazah | القرعة | Al Qaz‘ah | محافظة صعدة | PPL | 80 | 5 | 62.80 | saada |
| anwazah | أنوازة | Anwāzah | محافظة صعدة | PPL | 80 | 1 | 60.61 | saada |
| al-hamiri | الحامري | Al Ḩāmirī | محافظة صعدة | PPL | 80 | 15 | 55.62 | saada |
| al-maqrah | المقرح | Al Maqraḩ | محافظة صعدة | PPL | 80 | 8 | 57.34 | saada |
| bayn-al-qulal | بين القلل | Bayn al Qulal | محافظة صعدة | PPL | 80 | 6 | 54.94 | saada |
| qullat-sawdan | قلة سودان | Qullat Sawdān | محافظة صعدة | PPL | 80 | 1 | 55.32 | saada |
| hazat-al-ghurfah | حازة الغرفة | Ḩāzat al Ghurfah | محافظة صعدة | PPL | 80 | 5 | 56.25 | saada |
| al-aslam-jabbar | ال أسلم جبار | Āl Aslam Jabbār | محافظة صعدة | PPL | 80 | 2 | 56.24 | saada |
| tamir | تعمر | Ta‘mir | محافظة صعدة | PPL | 80 | 11 | 55.78 | saada |
| sihayah | سحاية | Siḩāyah | محافظة صعدة | PPL | 80 | 10 | 56.07 | saada |
| habrah | حبرة | Ḩabrah | محافظة صعدة | PPL | 80 | 7 | 55.51 | saada |
| al-shubayli | ال شبيلي | Āl Shubaylī | محافظة صعدة | PPL | 80 | 2 | 56.28 | saada |
| ash-shuraybah | الشريبة | Ash Shuraybah | محافظة صعدة | PPL | 80 | 9 | 56.34 | saada |
| al-jabir | ال جابر | Āl Jābir | محافظة صعدة | PPL | 80 | 3 | 56.77 | saada |
| ad-dawahah | الضواحة | Aḑ Ḑawāḩah | محافظة صعدة | PPL | 80 | 2 | 57.13 | saada |
| famah | فعمة | Fa‘mah | محافظة صعدة | PPL | 80 | 1 | 60.21 | saada |
| hiraz | حراز | Ḩirāz | محافظة صعدة | PPL | 80 | 5 | 60.37 | saada |
| bashri | بشري | Bashrī | محافظة صعدة | PPL | 80 | 9 | 60.45 | saada |
| nayd-al-naim | نيد النعيم | Nayd al Na‘īm | محافظة صعدة | PPL | 80 | 3 | 60.63 | saada |
| al-majnab | المجنب | Al Majnab | محافظة صعدة | PPL | 80 | 2 | 60.49 | saada |
| ash-shirmat | الشرمات | Ash Shirmāt | محافظة صعدة | PPL | 80 | 6 | 60.42 | saada |
| ath-thihar | الثهار | Ath Thihār | محافظة صعدة | PPL | 80 | 4 | 60.56 | saada |
| al-labidah | اللبدة | Al Labidah | محافظة صعدة | PPL | 80 | 7 | 58.06 | saada |
| ath-thuah | الثوعة | Ath Thū‘ah | محافظة صعدة | PPL | 80 | 3 | 57.92 | saada |
| ghadawin | غضاون | Ghaḑāwin | محافظة صعدة | PPL | 80 | 1 | 45.40 | saada |
| dhu-nahayah | ذو نحاية | Dhū Naḩāyah | محافظة صعدة | PPL | 80 | 10 | 54.38 | saada |
| ad-dahlah | الدحلة | Ad Daḩlah | محافظة صعدة | PPL | 80 | 7 | 49.81 | saada |
| nuqayl-al-himrar | نقيل الحمرار | Nuqayl al Ḩimrār | محافظة صعدة | PPL | 80 | 3 | 47.08 | saada |
| lawh-al-jifrah | لوح الجرفة | Lawḩ al Jifrah | محافظة صعدة | PPL | 80 | 1 | 47.15 | saada |
| al-hamdan | ال همدان | Āl Hamdān | محافظة صعدة | PPL | 80 | 48 | 46.62 | saada |
| al-rabih | ال رابح | Āl Rābiḩ | محافظة صعدة | PPL | 80 | 15 | 45.56 | saada |
| al-ali | ال علي | Āl ‘Alī | محافظة صعدة | PPL | 80 | 57 | 45.20 | saada |
| hadqan | حدقان | Ḩadqān | محافظة صعدة | PPL | 80 | 5 | 45.84 | saada |
| ikhbab | إخباب | Ikhbāb | محافظة صعدة | PPL | 80 | 6 | 39.56 | saada |
| alt-at-tihami | الت التهامي | Alt at Tihāmī | محافظة صعدة | PPL | 80 | 9 | 40.19 | saada |
| al-qullah | القلة | Al Qullah | محافظة صعدة | PPL | 80 | 18 | 35.55 | saada |
| al-lawiyah | اللوية | Al Lawīyah | محافظة صعدة | PPL | 80 | 16 | 35.56 | saada |
| al-qabil | القابل | Al Qābil | محافظة صعدة | PPL | 80 | 12 | 35.13 | saada |
| al-khabl | الخبل | Al Khabl | محافظة صعدة | PPL | 80 | 41 | 33.39 | saada |
| al-hillah | الحلة | Al Ḩillah | محافظة صعدة | PPL | 80 | 8 | 48.98 | saada |
| al-shaib | ال شاعب | Āl Shā‘ib | محافظة صعدة | PPL | 80 | 16 | 49.55 | saada |
| al-waqqar | ال وقار | Āl Waqqār | محافظة صعدة | PPL | 80 | 7 | 46.31 | saada |
| mahall-hawshib | محل حوشب | Maḩall Ḩawshib | محافظة صعدة | PPL | 80 | 23 | 43.75 | saada |
| qawah | قوعة | Qaw‘ah | محافظة صعدة | PPL | 80 | 18 | 43.72 | saada |
| ad-daqrah | الدقرة | Ad Daqrah | محافظة صعدة | PPL | 80 | 20 | 43.97 | saada |
| uthyah | عثية | ‘Uthyah | محافظة صعدة | PPL | 80 | 5 | 59.10 | saada |
| al-irq | العرق | Al ‘Irq | محافظة صعدة | PPL | 80 | 1 | 59.84 | saada |
| al-musaid | ال مساعد | Āl Musā‘id | محافظة صعدة | PPL | 80 | 10 | 59.82 | saada |
| ar-ruqbah | الرقبة | Ar Ruqbah | محافظة صعدة | PPL | 80 | 5 | 57.58 | saada |
| mishshat-ar-ruwayq | مشة الرويق | Mishshat ar Ruwayq | محافظة صعدة | PPL | 80 | 9 | 58.48 | saada |
| al-jumaymah | الجميمة | Al Jumaymah | محافظة صعدة | PPL | 80 | 3 | 59.92 | saada |
| al-jamalah | الجمالة | Al Jamālah | محافظة صعدة | PPL | 80 | 4 | 58.02 | saada |
| al-muqta | المقطع | Al Muqţa‘ | محافظة صعدة | PPL | 80 | 4 | 58.06 | saada |
| nayd-al-baddah | نيد البدة | Nayd al Baddah | محافظة صعدة | PPL | 80 | 1 | 58.38 | saada |
| al-marqab | المرقب | Al Marqab | محافظة صعدة | PPL | 80 | 1 | 57.26 | saada |
| nayd-dalay | نيد دلاي | Nayd Dalāy | محافظة صعدة | PPL | 80 | 3 | 55.76 | saada |
| al-qabbah | القبة | Al Qabbah | محافظة صعدة | PPL | 80 | 5 | 55.86 | saada |
| jabarah | جبارة | Jabārah | محافظة صعدة | PPL | 80 | 3 | 58.94 | saada |
| al-mafjar | المفجر | Al Mafjar | محافظة صعدة | PPL | 80 | 17 | 53.08 | saada |
| al-jarnibah | الجرنبة | Al Jarnibah | محافظة صعدة | PPL | 80 | 5 | 55.36 | saada |
| rayhan | ريحان | Rayḩān | محافظة صعدة | PPL | 80 | 7 | 55.51 | saada |
| al-mabrak | المبرك | Al Mabrak | محافظة صعدة | PPL | 80 | 5 | 55.22 | saada |
| hiraz | حراز | Ḩirāz | محافظة صعدة | PPL | 80 | 4 | 55.34 | saada |
| lujm-al-mahni | لجم المحنى | Lujm al Maḩnī | محافظة صعدة | PPL | 80 | 2 | 55.25 | saada |
| ali-jabirah | علي جابرة | ‘Alī Jābirah | محافظة صعدة | PPL | 80 | 2 | 58.45 | saada |
| al-madarah | المدارة | Al Madārah | محافظة صعدة | PPL | 80 | 1 | 58.58 | saada |
| umqa | عمقاء | ‘Umqā’ | محافظة صعدة | PPL | 80 | 4 | 58.23 | saada |
| ar-ramah | الرمعة | Ar Ram‘ah | محافظة صعدة | PPL | 80 | 6 | 58.45 | saada |
| al-urayirah | العريعرة | Al ‘Uray‘irah | محافظة صعدة | PPL | 80 | 2 | 58.12 | saada |
| al-wajar | الوجر | Al Wajar | محافظة صعدة | PPL | 80 | 2 | 57.67 | saada |
| al-lahij | اللحج | Al Laḩij | محافظة صعدة | PPL | 80 | 4 | 58.49 | saada |
| ash-shibah | الشباح | Ash Shibāḩ | محافظة صعدة | PPL | 80 | 2 | 56.89 | saada |
| an-nakhlah | النخلة | An Nakhlah | محافظة صعدة | PPL | 80 | 2 | 57.17 | saada |
| bayn-ar-ruways | بين الرويس | Bayn ar Ruways | محافظة صعدة | PPL | 80 | 4 | 56.99 | saada |
| al-harah | الحارة | Al Ḩārah | محافظة صعدة | PPL | 80 | 2 | 56.93 | saada |
| shahr-al-mardaf | شهر المردف | Shahr al Mardaf | محافظة صعدة | PPL | 80 | 2 | 57.08 | saada |
| al-bahirah | البهرة | Al Bahirah | محافظة صعدة | PPL | 80 | 3 | 57.83 | saada |
| al-majal | المجعل | Al Maj‘al | محافظة صعدة | PPL | 80 | 2 | 57.73 | saada |
| al-badlah | البدلة | Al Badlah | محافظة صعدة | PPL | 80 | 3 | 58.94 | saada |
| al-marami | المرامي | Al Marāmī | محافظة صعدة | PPL | 80 | 6 | 58.36 | saada |
| sharayin-al-butayh | شراين البطيح | Sharāyin al Buţayḩ | محافظة صعدة | PPL | 80 | 5 | 58.31 | saada |
| al-marwah | المروة | Al Marwah | محافظة صعدة | PPL | 80 | 8 | 57.94 | saada |
| qullat-al-luhayyin | قلة اللحبين | Qullat al Luḩayyin | محافظة صعدة | PPL | 80 | 12 | 57.79 | saada |
| dhira-qamqam | ذراع قمقم | Dhirā‘ Qamqam | محافظة صعدة | PPL | 80 | 3 | 57.75 | saada |
| ras-al-malabah | رأس الملعبة | Ra’s al Mala‘bah | محافظة صعدة | PPL | 80 | 4 | 58.08 | saada |
| nayd-al-khayal | نيد الخيال | Nayd al Khayāl | محافظة صعدة | PPL | 80 | 2 | 62.23 | saada |
| suhayf | صحيف | Şuḩayf | محافظة صعدة | PPL | 80 | 4 | 52.24 | saada |
| al-mawad | ال معوض | Āl Ma‘waḑ | محافظة صعدة | PPL | 80 | 4 | 53.02 | saada |
| az-zurayd | الزريد | Az Zurayd | محافظة صعدة | PPL | 80 | 9 | 61.25 | saada |
| al-mulayh | المليح | Al Mulayḩ | محافظة صعدة | PPL | 80 | 1 | 62.17 | saada |
| al-hayayyifah | الحييفة | Al Ḩayayyifah | محافظة صعدة | PPL | 80 | 7 | 61.98 | saada |
| al-masna | المصنع | Al Maşna‘ | محافظة صعدة | PPL | 80 | 2 | 62.44 | saada |
| ar-ruhtah | الرهطة | Ar Ruhţah | محافظة صعدة | PPL | 80 | 8 | 61.55 | saada |
| azz-al-jarf | عز الجرف | ‘Azz al Jarf | محافظة صعدة | PPL | 80 | 2 | 62.38 | saada |
| thahir-khushan | ثاهر خشان | Thāhir Khushān | محافظة صعدة | PPL | 80 | 2 | 62.36 | saada |
| ar-rawh | الروح | Ar Rawḩ | محافظة صعدة | PPL | 80 | 1 | 62.98 | saada |
| lahij-masrah | لحج مسرح | Laḩij Masraḩ | محافظة صعدة | PPL | 80 | 3 | 63.10 | saada |
| thahir-manfa | ثاهر منفاء | Thāhir Manfā’ | محافظة صعدة | PPL | 80 | 3 | 62.45 | saada |
| al-majhad | المجحض | Al Majḩaḑ | محافظة صعدة | PPL | 80 | 1 | 62.56 | saada |
| al-manwar | المنور | Al Manwar | محافظة صعدة | PPL | 80 | 2 | 61.76 | saada |
| marbuat-ath-thawahir | مربوعة الثواهر | Marbū‘at ath Thawāhir | محافظة صعدة | PPL | 80 | 2 | 62.06 | saada |
| al-hadhayah | الحذاية | Al Ḩadhāyah | محافظة صعدة | PPL | 80 | 5 | 57.55 | saada |
| al-jurdan | الجردان | Al Jurdān | محافظة صعدة | PPL | 80 | 1 | 57.46 | saada |
| an-nahjah | النهجة | An Nahjah | محافظة صعدة | PPL | 80 | 3 | 59.19 | saada |
| al-jurfan | الجرفان | Al Jurfān | محافظة صعدة | PPL | 80 | 2 | 59.15 | saada |
| al-marawi | المراوي | Al Marāwī | محافظة صعدة | PPL | 80 | 8 | 59.04 | saada |
| al-husaynah | الحسينة | Al Ḩusaynah | محافظة صعدة | PPL | 80 | 2 | 58.79 | saada |
| al-hawjimah | الحوجمة | Al Ḩawjimah | محافظة صعدة | PPL | 80 | 1 | 59.44 | saada |
| mashshat-al-marid | مشة المعرض | Mashshat al Ma‘riḑ | محافظة صعدة | PPL | 80 | 11 | 58.94 | saada |
| jahu-ath-thuayli | جهو الثعيلي | Jahū ath Thu‘aylī | محافظة صعدة | PPL | 80 | 2 | 58.24 | saada |
| al-bitahi | البطاحي | Al Biţāḩī | محافظة صعدة | PPL | 80 | 4 | 59.06 | saada |
| al-hamizah | الحامظة | Al Ḩāmiz̧ah | محافظة عمران | PPL | 80 | 6 | 67.30 | saada |
| lawh-al-lati | لوح اللاطي | Lawḩ al Lāţī | محافظة صعدة | PPL | 80 | 3 | 62.02 | saada |
| al-qalah-al-ghubra | القلعة الغبراء | Al Qal‘ah al Ghubrā’ | محافظة حجة | PPL | 80 | 3 | 77.25 | saada |
| az-zahi | الظاهي | Az̧ Z̧āhī | محافظة صعدة | PPL | 80 | 1 | 57.60 | saada |
| bawan | بوعان | Baw‘ān | محافظة صعدة | PPL | 80 | 2 | 49.53 | saada |
| al-mashraq | المشرق | Al Mashraq | محافظة صعدة | PPL | 80 | 3 | 52.03 | saada |
| adh-dhiru | الذروع | Adh Dhirū‘ | محافظة صعدة | PPL | 80 | 1 | 53.45 | saada |
| qarn-mayjun | قرن ميجون | Qarn Mayjūn | محافظة صعدة | PPL | 80 | 1 | 41.51 | saada |
| al-marda-al-muayli | المرداء ال معيلي | Al Mardā’ Āl Mu‘aylī | محافظة مأرب | PPL | 80 | 38 | 14.48 | marib |
| marda-al-awshan | مرداء ال عوشان | Mardā’ Āl ‘Awshān | محافظة مأرب | PPL | 80 | 70 | 16.85 | marib |
| nayd-al-bayah | نيد البيعة | Nayd al Bay‘ah | محافظة صعدة | PPL | 80 | 1 | 57.41 | saada |
| nadiyah | بادية | Nādīyah | محافظة صعدة | PPL | 80 | 4 | 55.58 | saada |
| al-mashshah | المشة | Al Mashshah | محافظة صعدة | PPL | 80 | 7 | 55.94 | saada |
| khudayhah | خديحة | Khudayḩah | محافظة شبوة | PPL | 80 | 5 | 208.51 | marib |
| al-hamiyah | الهامية | Al Hāmīyah | محافظة شبوة | PPL | 80 | 10 | 209.21 | marib |
| al-kuraybah | الكريبة | Al Kuraybah | محافظة شبوة | PPL | 80 | 156 | 194.30 | marib |
| sarqab | صرقاب | Şarqāb | محافظة شبوة | PPL | 80 | 51 | 195.73 | marib |
| bayt-al-barati | بيت البرطي | Bayt al Baraţī | أمانة العاصمة | PPL | 80 | 15 | 18.80 | sanaa |
| bayt-al-hamzi | بيت الحمزي | Bayt al Ḩamzī | أمانة العاصمة | PPL | 80 | 15 | 18.72 | sanaa |
| bayt-ad-dali | بيت الدالي | Bayt ad Dālī | أمانة العاصمة | PPL | 80 | 16 | 18.91 | sanaa |
| bayt-ash-shami | بيت الشامي | Bayt ash Shāmī | أمانة العاصمة | PPL | 80 | 15 | 19.20 | sanaa |
| bayt-sawa | بيت سواء | Bayt Sawā’ | أمانة العاصمة | PPL | 80 | 15 | 19.85 | sanaa |
| bayt-al-ashwal | بيت الأشول | Bayt al Ashwal | أمانة العاصمة | PPL | 80 | 26 | 19.39 | sanaa |
| bayt-halwan | بيت حلوان | Bayt Ḩalwān | أمانة العاصمة | PPL | 80 | 29 | 19.20 | sanaa |
| bayt-baqilah | بيت بقلة | Bayt Baqilah | أمانة العاصمة | PPL | 80 | 4 | 19.04 | sanaa |
| bayt-jawan | بيت جعوان | Bayt Ja‘wān | أمانة العاصمة | PPL | 80 | 23 | 18.79 | sanaa |
| bayt-al-qushum | بيت القشم | Bayt al Qushum | أمانة العاصمة | PPL | 80 | 9 | 20.25 | sanaa |
| bayt-zuhayr | بيت زهير | Bayt Zuhayr | أمانة العاصمة | PPL | 80 | 6 | 19.79 | sanaa |
| bayt-al-jurayzi | بيت الجريزع | Bayt al Jurayzi‘ | أمانة العاصمة | PPL | 80 | 16 | 19.78 | sanaa |
| bayt-al-busi | بيت البوصي | Bayt al Būşī | أمانة العاصمة | PPL | 80 | 41 | 19.61 | sanaa |
| bayt-uthman | بيت عثمان | Bayt ‘Uthmān | أمانة العاصمة | PPL | 80 | 9 | 18.77 | sanaa |
| al-mujamma-as-sakani | المجمع السكني | Al Mujamma‘ as Sakanī | أمانة العاصمة | PPL | 80 | 131 | 16.94 | sanaa |
| bayt-hiran | بيت هران | Bayt Hirān | أمانة العاصمة | PPL | 80 | 6 | 17.03 | sanaa |
| as-subayrah | الصبيرة | Aş Şubayrah | أمانة العاصمة | PPL | 80 | 35 | 17.43 | sanaa |
| dawahi-al-qaryah | ضواحي القرية | Ḑawāḩī al Qaryah | أمانة العاصمة | PPL | 80 | 162 | 10.96 | sanaa |
| al-arasi | العراسي | Al ‘Arāsī | أمانة العاصمة | PPL | 80 | 126 | 10.97 | sanaa |
| al-hajib | الحاجب | Al Ḩājib | أمانة العاصمة | PPL | 80 | 46 | 10.40 | sanaa |
| ashr | عشر | ‘Ashr | أمانة العاصمة | PPL | 80 | 81 | 11.80 | sanaa |
| al-jawwah | الجوة | Al Jawwah | أمانة العاصمة | PPL | 80 | 95 | 10.70 | sanaa |
| al-hadn | الحضن | Al Ḩaḑn | أمانة العاصمة | PPL | 80 | 43 | 10.54 | sanaa |
| bayt-mansar | بيت منصر | Bayt Manşar | أمانة العاصمة | PPL | 80 | 36 | 10.22 | sanaa |
| bayt-ar-rafiq | بيت الرفيق | Bayt ar Rafīq | أمانة العاصمة | PPL | 80 | 20 | 15.21 | sanaa |
| bayt-madhkur | بيت مذكور | Bayt Madhkūr | أمانة العاصمة | PPL | 80 | 28 | 15.99 | sanaa |
| al-batah | البطاح | Al Baţāḩ | محافظة صنعاء | PPL | 80 | 3 | 19.72 | sanaa |
| al-mawqiri | الموقري | Al Mawqirī | محافظة صنعاء | PPL | 80 | 7 | 18.89 | sanaa |
| as-sulayl | السليل | As Sulayl | محافظة صنعاء | PPL | 80 | 2 | 19.07 | sanaa |
| al-hadiyah | الهادية | Al Hādīyah | محافظة صنعاء | PPL | 80 | 44 | 11.70 | sanaa |
| al-khushaybah | الخشيبة | Al Khushaybah | محافظة صنعاء | PPL | 80 | 72 | 11.03 | sanaa |
| al-ahdan | الأحضان | Al Aḩḑān | محافظة صنعاء | PPL | 80 | 23 | 9.01 | sanaa |
| bayt-jawlah | بيت جولة | Bayt Jawlah | محافظة صنعاء | PPL | 80 | 12 | 19.25 | sanaa |
| bayt-sawfan | بيت صوفان | Bayt Şawfān | محافظة صنعاء | PPL | 80 | 12 | 19.36 | sanaa |
| bayt-at-tamm | بيت التام | Bayt at Tāmm | محافظة صنعاء | PPL | 80 | 33 | 19.57 | sanaa |
| al-asharah | العشرة | Al ‘Asharah | محافظة صنعاء | PPL | 80 | 7 | 17.22 | sanaa |
| bayt-silah | بيت سعلة | Bayt Si‘lah | محافظة صنعاء | PPL | 80 | 12 | 19.71 | sanaa |
| halawah | حلاوة | Ḩalāwah | محافظة صنعاء | PPL | 80 | 11 | 17.38 | sanaa |
| al-matshufah | المتشوفة | Al Matshūfah | محافظة صنعاء | PPL | 80 | 5 | 14.46 | sanaa |
| az-zahari | الظهاري | Az̧ Z̧ahārī | محافظة صنعاء | PPL | 80 | 15 | 13.87 | sanaa |
| bayt-al-jahdari | بيت الجحدري | Bayt al Jaḩdarī | محافظة صنعاء | PPL | 80 | 2 | 14.33 | sanaa |
| al-madinah-as-sakaniyah | المدينة السكنية | Al Madīnah as Sakanīyah | محافظة صنعاء | PPL | 80 | 18 | 12.96 | sanaa |
| al-maqarib | المقارب | Al Maqārib | أمانة العاصمة | PPL | 80 | 30 | 9.63 | sanaa |
| ad-dahirah | الضهرة | Aḑ Ḑahirah | أمانة العاصمة | PPL | 80 | 44 | 19.13 | sanaa |
| al-shuwayl | ال شويل | Āl Shuwayl | محافظة الجوف | PPL | 80 | 12 | 84.49 | marib |
| al-attiyah | ال عطية | Āl ‘Aţţīyah | محافظة الجوف | PPL | 80 | 2 | 68.13 | marib |
| al-nadil | آل نديل | Āl Nadīl | محافظة الجوف | PPL | 80 | 1 | 70.08 | marib |
| safiyat-an-nil | صافية النيل | Şāfīyat an Nīl | محافظة الجوف | PPL | 80 | 1 | 68.84 | marib |
| huzmat-jayan | حزمة جيعان | Ḩuzmat Jay‘ān | محافظة الجوف | PPL | 80 | 2 | 64.41 | marib |
| al-khasf-al-marwan | الخسف ال مروان | Al Khasf Āl Marwān | محافظة الجوف | PPL | 80 | 1 | 55.71 | marib |
| al-arfaj | ال عرفج | Āl ‘Arfaj | محافظة الجوف | PPL | 80 | 8 | 54.67 | marib |
| at-taybas | التيباس | At Taybās | محافظة الجوف | PPL | 80 | 6 | 55.88 | marib |
| al-sayda | ال صيداء | Āl Şaydā’ | محافظة الجوف | PPL | 80 | 3 | 88.18 | marib |
| mihzam-ash-shala | محزم الشلا | Miḩzam ash Shalā | محافظة الجوف | PPL | 80 | 6 | 65.28 | marib |
| al-harishah | الحرشة | Al Ḩarishah | محافظة الجوف | PPL | 80 | 3 | 66.02 | marib |
| labinat-al-mari | لبنات ال مرعي | Labināt Āl Mar‘ī | محافظة الجوف | PPL | 80 | 26 | 59.19 | marib |
| al-qinafidhah | القنافذة | Al Qināfidhah | محافظة الجوف | PPL | 80 | 13 | 63.09 | marib |
| zahran | زهران | Zahrān | محافظة الجوف | PPL | 80 | 24 | 100.32 | marib |
| al-quhaqibah | القهاقبة | Al Quhāqibah | محافظة الجوف | PPL | 80 | 21 | 97.31 | marib |
| said-al-ubayr | ساعد ال عبير | Sā‘id Āl ‘Ubayr | محافظة الجوف | PPL | 80 | 2 | 79.18 | marib |
| said-hasan | ساعد حسن | Sā‘id Ḩasan | محافظة الجوف | PPL | 80 | 2 | 82.03 | marib |
| ash-shuqub | الشقب | Ash Shuqub | محافظة الجوف | PPL | 80 | 3 | 94.64 | marib |
| al-khayrat | الخيرات | Al Khayrāt | محافظة الجوف | PPL | 80 | 6 | 94.39 | marib |
| bin-shafah | بن شافعة | Bin Shāf‘ah | محافظة الجوف | PPL | 80 | 2 | 65.53 | marib |
| al-umaysan | ال عميسان | Āl ‘Umaysān | محافظة الجوف | PPL | 80 | 3 | 88.39 | marib |
| al-mihzam | المحزام | Al Miḩzām | محافظة الجوف | PPL | 80 | 4 | 96.78 | marib |
| shayhat | شيحاط | Shayḩāţ | محافظة الجوف | PPL | 80 | 6 | 96.10 | marib |
| qawz-adh-dhaybah | قوز الذيبة | Qawz adh Dhaybah | محافظة الجوف | PPL | 80 | 1 | 95.63 | marib |
| zaylan | زيلان | Zaylān | محافظة الجوف | PPL | 80 | 3 | 95.26 | marib |
| mayhar | ميهر | Mayhar | محافظة الجوف | PPL | 80 | 10 | 94.85 | marib |
| al-uqayla | العقيلاء | Al ‘Uqaylā’ | محافظة الجوف | PPL | 80 | 4 | 93.64 | marib |
| hamdanah | حمضانة | Ḩamḑānah | محافظة الجوف | PPL | 80 | 4 | 93.45 | marib |
| al-qursan | ال قرصان | Āl Qurşān | محافظة الجوف | PPL | 80 | 2 | 93.99 | marib |
| umm-al-mishwar | أم المشوار | Umm al Mishwār | محافظة الجوف | PPL | 80 | 1 | 93.96 | marib |
| siran | صيران | Şīrān | محافظة الجوف | PPL | 80 | 8 | 95.54 | marib |
| al-hamamah | ال حمامة | Āl Ḩamāmah | محافظة الجوف | PPL | 80 | 11 | 95.83 | marib |
| umm-az-zubar | أم الزبار | Umm az Zubār | محافظة الجوف | PPL | 80 | 5 | 93.54 | marib |
| haqqan-qurhash | حقن قرحاش | Ḩaqqan Qurḩāsh | محافظة الجوف | PPL | 80 | 16 | 90.36 | marib |
| hiran | هران | Hirān | محافظة الجوف | PPL | 80 | 7 | 92.40 | marib |
| abu-far | أبو فار | Abū Fār | محافظة الجوف | PPL | 80 | 7 | 95.35 | marib |
| al-salimah | ال سالمة | Āl Sālimah | محافظة الجوف | PPL | 80 | 13 | 94.85 | marib |
| al-khabbah | الخبة | Al Khabbah | محافظة الجوف | PPL | 80 | 4 | 87.51 | marib |
| as-sulayl | السليل | As Sulayl | محافظة الجوف | PPL | 80 | 9 | 95.51 | marib |
| al-murtafi | المرتفع | Al Murtafi‘ | محافظة الجوف | PPL | 80 | 16 | 88.08 | marib |
| az-zihafah | الزحافة | Az Ziḩāfah | محافظة الجوف | PPL | 80 | 14 | 73.02 | marib |
| said-khamsan | ساعد خمسان | Sā‘id Khamsān | محافظة الجوف | PPL | 80 | 13 | 82.91 | marib |
| al-qushabah | القشابة | Al Qushābah | محافظة الجوف | PPL | 80 | 3 | 83.63 | marib |
| al-jadabani-nawf | الجدبنى نوف | Al Jadabanī Nawf | محافظة الجوف | PPL | 80 | 9 | 85.38 | marib |
| arhab-yinabba | أرحب ينباء | Arḩab Yinabbā’ | محافظة الجوف | PPL | 80 | 1 | 85.04 | marib |
| al-sumnan | ال سمنان | Āl Sumnān | محافظة الجوف | PPL | 80 | 17 | 85.03 | marib |
| al-jirbu | ال جربوع | Āl Jirbū‘ | محافظة الجوف | PPL | 80 | 11 | 86.66 | marib |
| al-uthman | ال عثمان | Āl ‘Uthmān | محافظة الجوف | PPL | 80 | 20 | 87.27 | marib |
| al-shatrah | ال شترة | Āl Shatrah | محافظة الجوف | PPL | 80 | 17 | 87.14 | marib |
| ar-rahalah | الرحلة | Ar Raḩalah | محافظة الجوف | PPL | 80 | 1 | 83.61 | marib |
| ar-rab | الربع | Ar Rab‘ | محافظة الجوف | PPL | 80 | 2 | 86.83 | marib |
| al-matali | المطاليع | Al Maţālī‘ | محافظة الجوف | PPL | 80 | 4 | 97.55 | marib |
| halwan | حلوان | Ḩalwān | محافظة الجوف | PPL | 80 | 28 | 97.20 | marib |
| al-ushshah | العشة | Al ‘Ushshah | محافظة الجوف | PPL | 80 | 31 | 95.00 | marib |
| hazm-amlah | حزم أملاح | Ḩazm Amlāḩ | محافظة مأرب | PPL | 80 | 4 | 81.28 | marib |
| hisn-al-bilad | حصن البلاد | Ḩişn al Bilād | محافظة مأرب | PPL | 80 | 6 | 81.56 | marib |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة مأرب | PPL | 80 | 5 | 82.03 | marib |
| al-mubarriz | المبرز | Al Mubarriz | محافظة مأرب | PPL | 80 | 2 | 82.01 | marib |
| al-ladhah | اللاذعة | Al Lādh‘ah | محافظة مأرب | PPL | 80 | 2 | 82.16 | marib |
| ad-dirman | الدرمان | Ad Dirmān | محافظة مأرب | PPL | 80 | 5 | 83.16 | marib |
| al-ghizmul | الغزمول | Al Ghizmūl | محافظة مأرب | PPL | 80 | 5 | 78.26 | marib |
| huzmat-bin-shahirah | حزمة بن شاهرة | Ḩuzmat Bin Shāhirah | محافظة مأرب | PPL | 80 | 1 | 81.65 | marib |
| huzmat-mawdi | حزمة موضع | Ḩuzmat Mawḑi‘ | محافظة مأرب | PPL | 80 | 1 | 82.55 | marib |
| al-asil | العصل | Al ‘Aşil | محافظة مأرب | PPL | 80 | 2 | 80.07 | marib |
| al-khawr | الخور | Al Khawr | محافظة مأرب | PPL | 80 | 5 | 82.11 | marib |
| al-quwayrah | القويرة | Al Quwayrah | محافظة مأرب | PPL | 80 | 21 | 79.02 | marib |
| as-safiqah | الصفقة | Aş Şafiqah | محافظة مأرب | PPL | 80 | 9 | 78.16 | marib |
| khays-al-umar | خيس ال عمر | Khays Āl ‘Umar | محافظة مأرب | PPL | 80 | 15 | 81.56 | marib |
| al-hanu | الحنو | Al Ḩanū | محافظة مأرب | PPL | 80 | 14 | 79.61 | marib |
| bad-al-hasan | بدع الحصان | Bad‘ al Ḩaşān | محافظة مأرب | PPL | 80 | 8 | 80.88 | marib |
| al-uyaynah | العيينة | Al ‘Uyaynah | محافظة مأرب | PPL | 80 | 9 | 74.99 | marib |
| al-uwayr | العوير | Al ‘Uwayr | محافظة مأرب | PPL | 80 | 6 | 75.81 | marib |
| tihal-sawan | طحال صوان | Ţiḩāl Şawān | محافظة مأرب | PPL | 80 | 3 | 78.09 | marib |
| al-anam | العنم | Al ‘Anam | محافظة مأرب | PPL | 80 | 5 | 75.84 | marib |
| al-jithwah | الجثوة | Al Jithwah | محافظة مأرب | PPL | 80 | 6 | 77.86 | marib |
| bin-sinnan | بن سنان | Bin Sinnān | محافظة مأرب | PPL | 80 | 8 | 75.77 | marib |
| al-bilad-as-sufla | البلاد السفلى | Al Bilād as Suflá | محافظة مأرب | PPL | 80 | 7 | 76.71 | marib |
| al-khalif | الخليف | Al Khalīf | محافظة مأرب | PPL | 80 | 7 | 76.68 | marib |
| nawb-al-faras | نوب الفرس | Nawb al Faras | محافظة مأرب | PPL | 80 | 2 | 75.81 | marib |
| al-lajmah | اللجمة | Al Lajmah | محافظة مأرب | PPL | 80 | 2 | 76.76 | marib |
| al-amyan | ال عميان | Āl ‘Amyān | محافظة مأرب | PPL | 80 | 10 | 76.47 | marib |
| muhayjir | محيجر | Muḩayjir | محافظة مأرب | PPL | 80 | 22 | 77.61 | marib |
| al-mukaylah | المكيلة | Al Mukaylah | محافظة مأرب | PPL | 80 | 5 | 78.03 | marib |
| al-mustawwi | المستوي | Al Mustawwī | محافظة مأرب | PPL | 80 | 2 | 78.16 | marib |
| juwayfan | جويفان | Juwayfān | محافظة الجوف | PPL | 80 | 11 | 165.42 | marib |
| buramah | برامة | Burāmah | محافظة الجوف | PPL | 80 | 16 | 166.58 | marib |
| hammam | همام | Hammām | محافظة الجوف | PPL | 80 | 20 | 165.76 | marib |
| ajajah | عجاجة | ‘Ajājah | محافظة الجوف | PPL | 80 | 19 | 167.32 | marib |
| al-mirayigh | المرايغ | Al Mirāyigh | محافظة الجوف | PPL | 80 | 4 | 165.42 | marib |
| umm-as-sarha | أم السرحاء | Umm as Sarḩā’ | محافظة الجوف | PPL | 80 | 2 | 167.44 | marib |
| umm-harmal | أم حرمل | Umm Ḩarmal | محافظة الجوف | PPL | 80 | 2 | 174.01 | marib |
| al-buhayh | البحيح | Al Buḩayḩ | محافظة الجوف | PPL | 80 | 18 | 162.79 | marib |
| abraq-bin-ghadban | أبرق بن غضبان | Abraq Bin Ghaḑbān | محافظة الجوف | PPL | 80 | 10 | 160.34 | marib |
| hishsh-ad-dashinah | حش الدشنة | Ḩishsh ad Dashinah | محافظة الجوف | PPL | 80 | 5 | 163.53 | marib |
| al-hadi | آل هادي | Āl Hādī | محافظة صعدة | PPL | 80 | 4 | 35.49 | saada |
| itarah | عطارة | ‘Iţārah | محافظة صعدة | PPL | 80 | 3 | 37.13 | saada |
| al-manibah | المعنبة | Al Ma‘nibah | محافظة صعدة | PPL | 80 | 5 | 36.02 | saada |
| ash-shuiyah | الشعية | Ash Shu‘īyah | محافظة صعدة | PPL | 80 | 3 | 35.56 | saada |
| alt-al-ashari | الت العشاري | Alt al ‘Ashārī | محافظة صعدة | PPL | 80 | 4 | 36.37 | saada |
| nashwan | نشوان | Nashwān | محافظة صعدة | PPL | 80 | 12 | 38.38 | saada |
| al-mashhad | المشهد | Al Mashhad | محافظة صعدة | PPL | 80 | 23 | 38.71 | saada |
| hadaqi | حدقي | Ḩadaqī | محافظة صعدة | PPL | 80 | 26 | 39.67 | saada |
| mazaqah | مزقة | Mazaqah | محافظة صعدة | PPL | 80 | 19 | 39.62 | saada |
| al-lawwi | اللوي | Al Lawwī | محافظة صعدة | PPL | 80 | 2 | 39.66 | saada |
| al-matiq | المعتق | Al Ma‘tiq | محافظة صعدة | PPL | 80 | 2 | 39.57 | saada |
| al-munazzir | المنظر | Al Munaz̧z̧ir | محافظة صعدة | PPL | 80 | 14 | 39.01 | saada |
| al-marqab | المرقب | Al Marqab | محافظة صعدة | PPL | 80 | 13 | 38.98 | saada |
| quraysh | قريش | Quraysh | محافظة صعدة | PPL | 80 | 13 | 41.54 | saada |
| ar-rimmam | الرمام | Ar Rimmām | محافظة صعدة | PPL | 80 | 11 | 41.78 | saada |
| khawli | خولي | Khawlī | محافظة صعدة | PPL | 80 | 6 | 40.84 | saada |
| al-ardum | ال عردوم | Āl ‘Ardūm | محافظة صعدة | PPL | 80 | 16 | 40.41 | saada |
| qamlan | قملان | Qamlān | محافظة صعدة | PPL | 80 | 7 | 41.04 | saada |
| al-hidhayah | الحذاية | Al Ḩidhāyah | محافظة صعدة | PPL | 80 | 36 | 41.08 | saada |
| al-maatiq | المعاتق | Al Ma‘ātiq | محافظة صعدة | PPL | 80 | 8 | 40.94 | saada |
| al-hawazin | الحواظن | Al Ḩawāz̧in | محافظة صعدة | PPL | 80 | 25 | 40.35 | saada |
| ahl-al-wasat | أهل الوسط | Ahl al Waşaţ | محافظة صعدة | PPL | 80 | 18 | 41.37 | saada |
| alt-hunaysh | الت حنيش | Alt Ḩunaysh | محافظة صعدة | PPL | 80 | 16 | 51.66 | saada |
| al-mahall | المحل | Al Maḩall | محافظة صعدة | PPL | 80 | 5 | 51.85 | saada |
| al-arsh | العرش | Al ‘Arsh | محافظة صعدة | PPL | 80 | 10 | 51.74 | saada |
| al-bakili | البكيلي | Al Bakīlī | محافظة صعدة | PPL | 80 | 5 | 51.73 | saada |
| an-nayd | النيد | An Nayd | محافظة صعدة | PPL | 80 | 3 | 50.25 | saada |
| as-sirw | الصرو | Aş Şirw | محافظة صعدة | PPL | 80 | 6 | 53.77 | saada |
| al-mashabah | المشبة | Al Mashabah | محافظة صعدة | PPL | 80 | 2 | 53.26 | saada |
| sharqi-al-mashabah | شرقي المشبة | Sharqī al Mashabah | محافظة صعدة | PPL | 80 | 9 | 52.90 | saada |
| qullat-al-ghaylani | قلة الغيلاني | Qullat al Ghaylānī | محافظة صعدة | PPL | 80 | 1 | 53.98 | saada |
| al-jurayn | الجرين | Al Jurayn | محافظة صعدة | PPL | 80 | 7 | 53.72 | saada |
| al-hurur | الحرور | Al Ḩurūr | محافظة صعدة | PPL | 80 | 4 | 53.84 | saada |
| al-mahall | المحل | Al Maḩall | محافظة صعدة | PPL | 80 | 3 | 53.45 | saada |
| al-mirwah | المرواح | Al Mirwāḩ | محافظة صعدة | PPL | 80 | 9 | 49.81 | saada |
| sirw-juhayl | صرو جهيل | Şirw Juhayl | محافظة صعدة | PPL | 80 | 20 | 52.54 | saada |
| bayt-al-bayriqi | بيت البيرقي | Bayt al Bayriqī | محافظة صعدة | PPL | 80 | 4 | 53.67 | saada |
| qawz-jawlan | قوز خولان | Qawz Jawlān | محافظة صعدة | PPL | 80 | 2 | 39.25 | saada |
| al-mazat | المزات | Al Mazāt | محافظة صعدة | PPL | 80 | 7 | 39.09 | saada |
| al-jirhah | الجرهة | Al Jirhah | محافظة صعدة | PPL | 80 | 6 | 39.99 | saada |
| at-tirabah | الترابة | At Tirābah | محافظة صعدة | PPL | 80 | 5 | 39.11 | saada |
| athran | عثران | ‘Athrān | محافظة صعدة | PPL | 80 | 7 | 38.94 | saada |
| as-sarwayn | السروين | As Sarwayn | محافظة صعدة | PPL | 80 | 33 | 39.16 | saada |
| al-faqwah | الفقوة | Al Faqwah | محافظة صعدة | PPL | 80 | 10 | 38.28 | saada |
| sinamah | سنامة | Sināmah | محافظة صعدة | PPL | 80 | 7 | 39.22 | saada |
| buhaymah | بهيمة | Buhaymah | محافظة صعدة | PPL | 80 | 3 | 39.40 | saada |
| sawar | سوار | Sawār | محافظة صعدة | PPL | 80 | 17 | 38.13 | saada |
| al-dawman | ال دومان | Āl Dawmān | محافظة صعدة | PPL | 80 | 17 | 38.75 | saada |
| mataq-as-suq | معتق السوق | Ma‘taq as Sūq | محافظة صعدة | PPL | 80 | 10 | 38.33 | saada |
| kirkir | كركر | Kirkir | محافظة صعدة | PPL | 80 | 13 | 41.61 | saada |
| awal | أوعل | Aw‘al | محافظة صعدة | PPL | 80 | 13 | 39.83 | saada |
| ar-riqrawash | الرقرواش | Ar Riqrawāsh | محافظة صعدة | PPL | 80 | 6 | 40.61 | saada |
| al-makhbaz | المخبز | Al Makhbaz | محافظة صعدة | PPL | 80 | 12 | 41.99 | saada |
| al-utfah | العطفة | Al ‘Uţfah | محافظة صعدة | PPL | 80 | 17 | 40.33 | saada |
| mihdan | محضان | Miḩḑān | محافظة صعدة | PPL | 80 | 5 | 42.20 | saada |
| al-hadabah | الحدبة | Al Ḩadabah | محافظة صعدة | PPL | 80 | 8 | 31.12 | saada |
| sadat-nawas | سادة نواس | Sādat Nawās | محافظة صعدة | PPL | 80 | 2 | 30.86 | saada |
| qabtanat-tarish | قبطنات طارش | Qabţanāt Ţārish | محافظة صعدة | PPL | 80 | 9 | 31.69 | saada |
| alt-al-hudaysh | الت الهديش | Alt al Hudaysh | محافظة صعدة | PPL | 80 | 32 | 30.61 | saada |
| az-zuhqah | الزحقة | Az Zuḩqah | محافظة صعدة | PPL | 80 | 8 | 31.05 | saada |
| al-shamilah | ال شميلة | Āl Shamīlah | محافظة صعدة | PPL | 80 | 20 | 29.42 | saada |
| al-maqdar | ال مقدر | Āl Maqdar | محافظة صعدة | PPL | 80 | 4 | 29.53 | saada |
| qalt-kirat | قلت كرات | Qalt Kirāt | محافظة صعدة | PPL | 80 | 6 | 30.54 | saada |
| ibn-azrus | إبن عظروس | Ibn ‘Az̧rūs | محافظة صعدة | PPL | 80 | 3 | 30.13 | saada |
| alt-at-tilli | الت الطلي | Alt aţ Ţillī | محافظة صعدة | PPL | 80 | 5 | 29.98 | saada |
| qullat-habshi | قلة حبشي | Qullat Ḩabshī | محافظة صعدة | PPL | 80 | 10 | 36.84 | saada |
| qarn-az-zihar | قرن الظهار | Qarn az̧ Z̧ihār | محافظة صعدة | PPL | 80 | 8 | 36.91 | saada |
| khassah | خسة | Khassah | محافظة صعدة | PPL | 80 | 9 | 36.21 | saada |
| qawwat-al-qamah | قوة القامة | Qawwat al Qāmah | محافظة صعدة | PPL | 80 | 6 | 36.77 | saada |
| sari | سري | Sarī | محافظة صعدة | PPL | 80 | 15 | 36.69 | saada |
| abu-hasan | أبو حسن | Abū Ḩasan | محافظة صعدة | PPL | 80 | 5 | 38.39 | saada |
| qarn-masudah | قرن مسعودة | Qarn Mas‘ūdah | محافظة صعدة | PPL | 80 | 4 | 36.78 | saada |
| adh-dhihnah | الذحنة | Adh Dhiḩnah | محافظة صعدة | PPL | 80 | 18 | 35.75 | saada |
| al-abu-asharah | ال أبو عشرة | Āl Abū ‘Asharah | محافظة صعدة | PPL | 80 | 7 | 36.64 | saada |
| al-farhah | الفرحة | Al Farḩah | محافظة صعدة | PPL | 80 | 19 | 35.73 | saada |
| al-urr | العر | Al ‘Urr | محافظة صعدة | PPL | 80 | 10 | 35.85 | saada |
| al-maatiq | المعاتق | Al Ma‘ātiq | محافظة صعدة | PPL | 80 | 6 | 36.23 | saada |
| midhurah | معذورة | Mi‘dhūrah | محافظة صعدة | PPL | 80 | 4 | 40.06 | saada |
| as-sahilah | السهلة | As Sahilah | محافظة صعدة | PPL | 80 | 6 | 39.86 | saada |
| al-yaqub | ال يعقوب | Āl Ya‘qūb | محافظة صعدة | PPL | 80 | 9 | 39.78 | saada |
| alt-al-arbid | ألت العربد | Alt al ‘Arbid | محافظة صعدة | PPL | 80 | 6 | 39.41 | saada |
| al-kudrah | الكدرة | Al Kudrah | محافظة صعدة | PPL | 80 | 6 | 39.40 | saada |
| al-maddah | المضة | Al Maḑḑah | محافظة صعدة | PPL | 80 | 11 | 40.58 | saada |
| alt-al-jadan | الت الجعدان | Alt al Ja‘dān | محافظة صعدة | PPL | 80 | 2 | 38.99 | saada |
| ash-shirmat | الشرمات | Ash Shirmāt | محافظة صعدة | PPL | 80 | 3 | 39.09 | saada |
| jallat-al-ghamran | جلة الغمران | Jallat al Ghamrān | محافظة صعدة | PPL | 80 | 14 | 39.73 | saada |
| alt-al-hitrush | الة الحتروش | Alt al Ḩitrūsh | محافظة صعدة | PPL | 80 | 1 | 40.13 | saada |
| al-shayhan | ال شيحان | Āl Shayḩān | محافظة صعدة | PPL | 80 | 9 | 40.27 | saada |
| alt-zitan | الت زطان | Alt Ziţān | محافظة صعدة | PPL | 80 | 3 | 32.91 | saada |
| al-hatafi | الهطفى | Al Haţafī | محافظة صعدة | PPL | 80 | 16 | 33.24 | saada |
| alt-hatman | الت حطمان | Alt Ḩaţmān | محافظة صعدة | PPL | 80 | 13 | 32.35 | saada |
| al-murazim | المرازم | Al Murāzim | محافظة صعدة | PPL | 80 | 9 | 37.42 | saada |
| al-muhay | المهيع | Al Muhay‘ | محافظة صعدة | PPL | 80 | 4 | 36.92 | saada |
| al-hijr | الهجر | Al Hijr | محافظة صعدة | PPL | 80 | 16 | 37.18 | saada |
| al-maddah | المضة | Al Maḑḑah | محافظة صعدة | PPL | 80 | 7 | 36.80 | saada |
| kisafah | كسافة | Kisāfah | محافظة صعدة | PPL | 80 | 17 | 38.09 | saada |
| qullat-tawilah | قلة طويلة | Qullat Ţawīlah | محافظة صعدة | PPL | 80 | 14 | 35.12 | saada |
| qayfranah | قيفرانة | Qayfrānah | محافظة صعدة | PPL | 80 | 6 | 35.02 | saada |
| al-mikahil | المكاحل | Al Mikāḩil | محافظة صعدة | PPL | 80 | 11 | 37.98 | saada |
| al-jarrad | ال جراد | Āl Jarrād | محافظة صعدة | PPL | 80 | 7 | 34.64 | saada |
| al-ar-ruzi | ال الروزي | Āl ar Rūzī | محافظة صعدة | PPL | 80 | 8 | 34.42 | saada |
| as-salam | السلام | As Salām | محافظة صعدة | PPL | 80 | 19 | 34.40 | saada |
| thayyum | ثيوم | Thayyūm | محافظة صعدة | PPL | 80 | 5 | 34.52 | saada |
| al-jarn | الجرن | Al Jarn | محافظة صعدة | PPL | 80 | 11 | 34.59 | saada |
| alt-qarash | الت قرش | Alt Qarash | محافظة صعدة | PPL | 80 | 15 | 32.31 | saada |
| al-ar-ruzi-ash-shamaliyah | ال الروزي الشمالي | Āl ar Rūzī ash Shamālīyah | محافظة صعدة | PPL | 80 | 2 | 34.56 | saada |
| balw | بلو | Balw | محافظة صعدة | PPL | 80 | 11 | 41.77 | saada |
| al-khishah | الخشة | Al Khishah | محافظة صعدة | PPL | 80 | 5 | 43.42 | saada |
| bahamah | بهامة | Bahāmah | محافظة صعدة | PPL | 80 | 14 | 49.35 | saada |
| al-mahrath | المحرث | Al Maḩrath | محافظة صعدة | PPL | 80 | 15 | 50.27 | saada |
| al-adni | العدني | Al ‘Adnī | محافظة صعدة | PPL | 80 | 15 | 44.86 | saada |
| al-manasi | المناصع | Al Manāşi‘ | محافظة صعدة | PPL | 80 | 9 | 45.35 | saada |
| al-jarnayn | الجرنين | Al Jarnayn | محافظة صعدة | PPL | 80 | 6 | 44.39 | saada |
| al-ayyanah | العيانة | Al ‘Ayyānah | محافظة صعدة | PPL | 80 | 25 | 46.34 | saada |
| qullat-al-biyad | قلة البياد | Qullat al Biyād | محافظة صعدة | PPL | 80 | 34 | 45.05 | saada |
| qullat-as-siddad | قلة السداد | Qullat as Siddād | محافظة صعدة | PPL | 80 | 17 | 45.79 | saada |
| abway | أبواي | Abwāy | محافظة صعدة | PPL | 80 | 51 | 45.89 | saada |
| irq | عرق | ‘Irq | محافظة صعدة | PPL | 80 | 12 | 42.84 | saada |
| al-mushari | المشارح | Al Mushāri‘ | محافظة صعدة | PPL | 80 | 7 | 42.55 | saada |
| muthib | مؤثب | Mu’thib | محافظة صعدة | PPL | 80 | 21 | 43.77 | saada |
| dhira-ar-rufsah | ذراع الرفضة | Dhirā‘ ar Rufşah | محافظة صعدة | PPL | 80 | 12 | 44.09 | saada |
| al-awaji | العواجي | Al ‘Awājī | محافظة صعدة | PPL | 80 | 11 | 43.70 | saada |
| shawhitah | شوحطة | Shawḩiţah | محافظة صعدة | PPL | 80 | 13 | 42.80 | saada |
| al-muraysh | المريش | Al Muraysh | محافظة صعدة | PPL | 80 | 7 | 44.17 | saada |
| qullat-mawjan | قلة موجان | Qullat Mawjān | محافظة صعدة | PPL | 80 | 9 | 44.57 | saada |
| qullat-jaar | قلة جعار | Qullat Ja‘ār | محافظة صعدة | PPL | 80 | 6 | 44.50 | saada |
| shatt-ajwan | شط عجوان | Shaţţ ‘Ajwān | محافظة صعدة | PPL | 80 | 2 | 44.38 | saada |
| ti-anib | تعنب | Ti ‘Anib | محافظة صعدة | PPL | 80 | 5 | 45.25 | saada |
| humayrah | حميرة | Ḩumayrah | محافظة صعدة | PPL | 80 | 36 | 46.99 | saada |
| hayfat-ad-dar-al-ulya | حيفة الدار العليا | Ḩayfat ad Dār al ‘Ulyā | محافظة صعدة | PPL | 80 | 7 | 39.28 | saada |
| hayfat-ad-dar-as-sufla | حيفة الدار السفلى | Ḩayfat ad Dār as Suflá | محافظة صعدة | PPL | 80 | 8 | 39.43 | saada |
| alt-al-lakwan | الت اللكوان | Alt al Lakwān | محافظة صعدة | PPL | 80 | 11 | 32.08 | saada |
| ash-shuwayf | الشويف | Ash Shuwayf | محافظة صعدة | PPL | 80 | 5 | 36.71 | saada |
| al-ash-shami | ال الشامي | Āl ash Shāmī | محافظة صعدة | PPL | 80 | 4 | 42.77 | saada |
| al-hudhayfi | الحذيفي | Al Ḩudhayfī | محافظة صعدة | PPL | 80 | 1 | 42.64 | saada |
| al-jihadir | ال جحادر | Āl Jiḩādir | محافظة صعدة | PPL | 80 | 9 | 42.20 | saada |
| al-mulasib | الملاصب | Al Mulāşib | محافظة صعدة | PPL | 80 | 9 | 42.88 | saada |
| az-zahrah | الظهرة | Az̧ Z̧ahrah | محافظة صعدة | PPL | 80 | 3 | 42.77 | saada |
| al-shulfan | ال شلفان | Āl Shulfān | محافظة صعدة | PPL | 80 | 8 | 42.85 | saada |
| al-jabal | ال جعبل | Āl Ja‘bal | محافظة صعدة | PPL | 80 | 7 | 42.57 | saada |
| al-masnah | ال مصبح | Āl Maşnaḩ | محافظة صعدة | PPL | 80 | 6 | 42.84 | saada |
| al-quthub | القثب | Al Quthub | محافظة صعدة | PPL | 80 | 15 | 43.65 | saada |
| arayah | عراية | ‘Arāyah | محافظة صعدة | PPL | 80 | 18 | 43.38 | saada |
| shirwan | شروان | Shirwān | محافظة صعدة | PPL | 80 | 12 | 46.07 | saada |
| al-rissam | ال رسام | Āl Rissām | محافظة صعدة | PPL | 80 | 18 | 44.63 | saada |
| bayn-al-mihrabayn | بين المحرابين | Bayn al Miḩrābayn | محافظة صعدة | PPL | 80 | 6 | 45.27 | saada |
| akadah | عكدة | ‘Akadah | محافظة صعدة | PPL | 80 | 7 | 44.81 | saada |
| al-haraiq | الحرائق | Al Ḩarā’iq | محافظة صعدة | PPL | 80 | 9 | 45.13 | saada |
| qudam-al-ala | قدم الأعلى | Qudam al A‘lá | محافظة صعدة | PPL | 80 | 1 | 43.69 | saada |
| al-qulqul | القلقل | Al Qulqul | محافظة صعدة | PPL | 80 | 5 | 43.46 | saada |
| mazab-al-said | معزب ال سعيد | Ma‘zab Āl Sa‘īd | محافظة صعدة | PPL | 80 | 7 | 44.05 | saada |
| mazab-al-daud | معزب ال داؤد | Ma‘zab Āl Dā’ud | محافظة صعدة | PPL | 80 | 6 | 43.88 | saada |
| al-jamil | ال جميل | Āl Jamīl | محافظة صعدة | PPL | 80 | 4 | 45.71 | saada |
| mahbil | مهبل | Mahbil | محافظة صعدة | PPL | 80 | 4 | 45.30 | saada |
| dumrah | ضمرة | Ḑumrah | محافظة صعدة | PPL | 80 | 8 | 42.68 | saada |
| al-al-mushayb | ال المسيب | Āl al Mushayb | محافظة صعدة | PPL | 80 | 2 | 43.99 | saada |
| al-maqbal | المقبل | Al Maqbal | محافظة صعدة | PPL | 80 | 2 | 43.31 | saada |
| al-khirban | الخربان | Al Khirbān | محافظة صعدة | PPL | 80 | 2 | 43.97 | saada |
| al-mihdani | المحضاني | Al Miḩḑānī | محافظة صعدة | PPL | 80 | 4 | 44.31 | saada |
| al-khashyat | الخشيات | Al Khashyāt | محافظة صعدة | PPL | 80 | 5 | 45.28 | saada |
| al-hiyaf | الحياف | Al Ḩiyāf | محافظة صعدة | PPL | 80 | 6 | 41.98 | saada |
| al-al-mawali | ال المعولي | Āl al Ma‘walī | محافظة صعدة | PPL | 80 | 15 | 42.33 | saada |
| al-nisar | ال نصار | Āl Nişār | محافظة صعدة | PPL | 80 | 3 | 42.41 | saada |
| al-jihad | الجهاد | Al Jihād | محافظة صعدة | PPL | 80 | 3 | 37.62 | saada |
| jarr-al-sirran | جر ال سران | Jarr Āl Sirrān | محافظة الجوف | PPL | 80 | 2 | 91.48 | marib |
| alt-al-umar | الت العمر | Alt al ‘Umar | محافظة صعدة | PPL | 80 | 11 | 38.91 | saada |
| al-hijarah | الهجارة | Al Hijārah | محافظة صعدة | PPL | 80 | 8 | 39.24 | saada |
| mayfa | ميفع | Mayfa‘ | محافظة صعدة | PPL | 80 | 10 | 51.72 | saada |
| al-jihaw | الجهاو | Al Jihāw | محافظة صعدة | PPL | 80 | 14 | 51.42 | saada |
| al-shiddad | ال شداد | Āl Shiddād | محافظة صعدة | PPL | 80 | 6 | 51.61 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة صعدة | PPL | 80 | 20 | 51.75 | saada |
| al-dabush | ال دعبوش | Āl Da‘būsh | محافظة صعدة | PPL | 80 | 8 | 51.71 | saada |
| as-sawdah | السودة | As Sawdah | محافظة صعدة | PPL | 80 | 18 | 52.03 | saada |
| baynaw | بيناو | Baynāw | محافظة صعدة | PPL | 80 | 21 | 53.08 | saada |
| qullat-al-harbayn | قلة الحربين | Qullat al Ḩarbayn | محافظة صعدة | PPL | 80 | 8 | 52.27 | saada |
| al-aram | العارم | Al ‘Āram | محافظة صعدة | PPL | 80 | 4 | 52.37 | saada |
| wad-aqir | واد أقر | Wād Aqir | محافظة صعدة | PPL | 80 | 9 | 53.67 | saada |
| al-misarifah | المصارفة | Al Misārifah | محافظة صعدة | PPL | 80 | 4 | 53.72 | saada |
| bayt-qalam | بيت قلم | Bayt Qalam | محافظة صعدة | PPL | 80 | 2 | 51.37 | saada |
| qabr-sinnan | قبر سنان | Qabr Sinnān | محافظة صعدة | PPL | 80 | 11 | 52.43 | saada |
| ash-shiraqi | الشراقي | Ash Shirāqī | محافظة صعدة | PPL | 80 | 10 | 51.79 | saada |
| wilaah | ولاعة | Wilā‘ah | محافظة صعدة | PPL | 80 | 10 | 51.17 | saada |
| al-mughawayr | المغاوير | Al Mughāwayr | محافظة صعدة | PPL | 80 | 20 | 51.13 | saada |
| qullat-udhr | قلة عذر | Qullat ‘Udhr | محافظة صعدة | PPL | 80 | 18 | 53.78 | saada |
| umm-sariyah | أم سرية | Umm Sarīyah | محافظة صعدة | PPL | 80 | 10 | 51.80 | saada |
| al-jumaymah | الجميمة | Al Jumaymah | محافظة صعدة | PPL | 80 | 7 | 53.40 | saada |
| bayn-al-hawamir | بين الحوامر | Bayn al Ḩawāmir | محافظة صعدة | PPL | 80 | 3 | 53.03 | saada |
| al-aqabah | العقبة | Al ‘Aqabah | محافظة صعدة | PPL | 80 | 3 | 54.82 | saada |
| qullat-mijran | قلة مجران | Qullat Mijrān | محافظة صعدة | PPL | 80 | 8 | 54.35 | saada |
| al-qadum | القدوم | Al Qadūm | محافظة صعدة | PPL | 80 | 3 | 54.14 | saada |
| ad-dahirah | الدحرة | Ad Daḩirah | محافظة صعدة | PPL | 80 | 6 | 55.71 | saada |
| ad-dahshiliyah | الدهشلية | Ad Dahshilīyah | محافظة صعدة | PPL | 80 | 5 | 55.20 | saada |
| as-saladim | الصلادم | Aş Şalādim | محافظة صعدة | PPL | 80 | 7 | 55.21 | saada |
| al-mutajarraf | المتجرف | Al Mutajarraf | محافظة صعدة | PPL | 80 | 8 | 55.41 | saada |
| ar-rahah | الراحة | Ar Rāḩah | محافظة صعدة | PPL | 80 | 4 | 53.87 | saada |
| markabat-majibah | مركابة معجبة | Markābat Ma‘jibah | محافظة صعدة | PPL | 80 | 18 | 52.38 | saada |
| miqhutah | مقحوطة | Miqḩūţah | محافظة صعدة | PPL | 80 | 4 | 53.30 | saada |
| al-markabah | المركابة | Al Markābah | محافظة صعدة | PPL | 80 | 7 | 52.30 | saada |
| at-taffiyah | الطفية | Aţ Ţaffīyah | محافظة صعدة | PPL | 80 | 5 | 53.04 | saada |
| al-marisah | المعرسة | Al Ma‘risah | محافظة صعدة | PPL | 80 | 8 | 53.54 | saada |
| ridah | رداح | Ridāḩ | محافظة صعدة | PPL | 80 | 2 | 53.72 | saada |
| al-maddah | المدة | Al Maddah | محافظة صعدة | PPL | 80 | 2 | 54.08 | saada |
| tirani | تراني | Tirānī | محافظة صعدة | PPL | 80 | 8 | 54.35 | saada |
| sirr-al-abd | سر العبد | Sirr al ‘Abd | محافظة صعدة | PPL | 80 | 5 | 54.03 | saada |
| an-naghrah | النغرة | An Naghrah | محافظة صعدة | PPL | 80 | 8 | 54.70 | saada |
| as-safiyah | الصافية | Aş Şāfīyah | محافظة صعدة | PPL | 80 | 4 | 55.29 | saada |
| al-wasit | الواسط | Al Wāsiţ | محافظة صعدة | PPL | 80 | 2 | 53.77 | saada |
| at-tumayliyat | التميليات | At Tumayliyāt | محافظة صعدة | PPL | 80 | 4 | 53.09 | saada |
| dhira-as-safra | ذراع الصفراء | Dhirā‘ aş Şafrā’ | محافظة صعدة | PPL | 80 | 4 | 53.30 | saada |
| ad-daqqah | الضقة | Aḑ Ḑaqqah | محافظة صعدة | PPL | 80 | 4 | 55.22 | saada |
| al-maytma | الميتمى | Al Maytmá | محافظة صعدة | PPL | 80 | 16 | 56.38 | saada |
| al-jarubah | الجروبة | Al Jarūbah | محافظة صعدة | PPL | 80 | 1 | 50.85 | saada |
| al-jallah | الجلة | Al Jallah | محافظة صعدة | PPL | 80 | 1 | 50.91 | saada |
| ar-raqi | الرقعي | Ar Raq‘ī | محافظة صعدة | PPL | 80 | 5 | 50.60 | saada |
| shajab | شجب | Shajab | محافظة صعدة | PPL | 80 | 1 | 50.59 | saada |
| al-hazaqi | الحزقي | Al Ḩazaqī | محافظة صعدة | PPL | 80 | 2 | 51.34 | saada |
| al-khalab | الخلب | Al Khalab | محافظة صعدة | PPL | 80 | 1 | 51.48 | saada |
| al-madkhal | المدخل | Al Madkhal | محافظة صعدة | PPL | 80 | 3 | 50.03 | saada |
| al-barak | البراك | Al Barāk | محافظة صعدة | PPL | 80 | 13 | 46.91 | saada |
| al-mirakib | المراكيب | Al Mirākīb | محافظة صعدة | PPL | 80 | 1 | 47.07 | saada |
| al-mishawi | المشاوي | Al Mishāwī | محافظة صعدة | PPL | 80 | 3 | 46.67 | saada |
| al-madiliyah | المعدلية | Al Ma‘dilīyah | محافظة صعدة | PPL | 80 | 10 | 56.23 | saada |
| zabiyah | زبية | Zabīyah | محافظة صعدة | PPL | 80 | 5 | 56.09 | saada |
| al-barukiyah | البروكية | Al Barūkīyah | محافظة صعدة | PPL | 80 | 8 | 56.70 | saada |
| ash-shutayfi | الشتيفي | Ash Shutayfī | محافظة صعدة | PPL | 80 | 13 | 57.31 | saada |
| as-sabah | الصبة | Aş Şabah | محافظة صعدة | PPL | 80 | 22 | 57.12 | saada |
| al-markabah | المركابة | Al Markābah | محافظة صعدة | PPL | 80 | 2 | 56.82 | saada |
| al-anaqah | العنقة | Al ‘Anaqah | محافظة صعدة | PPL | 80 | 12 | 55.32 | saada |
| al-al-majru | ال المجرو | Āl al Majrū | محافظة صعدة | PPL | 80 | 20 | 55.75 | saada |
| rabkhan | ربخان | Rabkhān | محافظة صعدة | PPL | 80 | 3 | 49.29 | saada |
| ash-sharafayn | الشرفين | Ash Sharafayn | محافظة صعدة | PPL | 80 | 8 | 49.23 | saada |
| naqil-al-fuhaysh | نقيل الفحيش | Naqīl al Fuḩaysh | محافظة صعدة | PPL | 80 | 5 | 52.44 | saada |
| gharib-al-himrar | غارب الحمرار | Ghārib al Ḩimrār | محافظة صعدة | PPL | 80 | 2 | 51.88 | saada |
| qaim-numan | قائم نعمان | Qā’im Nu‘mān | محافظة صعدة | PPL | 80 | 3 | 51.46 | saada |
| qitran | قطران | Qiţrān | محافظة صعدة | PPL | 80 | 2 | 50.88 | saada |
| al-muwaqif | المواقف | Al Muwāqif | محافظة صعدة | PPL | 80 | 9 | 51.31 | saada |
| qaim-tabah | قائم تاعبة | Qā’im Tā‘bah | محافظة صعدة | PPL | 80 | 1 | 51.52 | saada |
| al-maghna | المغنى | Al Maghná | محافظة صعدة | PPL | 80 | 2 | 51.78 | saada |
| al-mafjurah | المفجورة | Al Mafjūrah | محافظة صعدة | PPL | 80 | 2 | 51.35 | saada |
| gharib-as-saruf | غارب الصروف | Ghārib aş Şarūf | محافظة صعدة | PPL | 80 | 4 | 52.53 | saada |
| namah | نامة | Nāmah | محافظة صعدة | PPL | 80 | 14 | 53.99 | saada |
| markabat-salman | مركابة سلمان | Markābat Salmān | محافظة صعدة | PPL | 80 | 5 | 53.91 | saada |
| kunayyah | كنية | Kunayyah | محافظة صعدة | PPL | 80 | 35 | 44.30 | saada |
| ash-sharw | الشرو | Ash Sharw | محافظة صعدة | PPL | 80 | 12 | 44.05 | saada |
| naqmat | نقمات | Naqmāt | محافظة صعدة | PPL | 80 | 3 | 43.46 | saada |
| fawz-as-suqayf | فوز السقيف | Fawz as Suqayf | محافظة صعدة | PPL | 80 | 3 | 43.78 | saada |
| al-amran | ال عمران | Āl ‘Amrān | محافظة صعدة | PPL | 80 | 20 | 43.55 | saada |
| al-mutarrar | ال مطيرر | Āl Muţarrar | محافظة صعدة | PPL | 80 | 9 | 43.21 | saada |
| al-hind | ال هند | Āl Hind | محافظة صعدة | PPL | 80 | 10 | 43.04 | saada |
| mawbran | موبران | Mawbrān | محافظة صعدة | PPL | 80 | 19 | 43.14 | saada |
| midarah | مدارة | Midārah | محافظة صعدة | PPL | 80 | 13 | 43.25 | saada |
| bil | بلع | Bil‘ | محافظة صعدة | PPL | 80 | 16 | 43.33 | saada |
| adh-dhirawah | الذراوة | Adh Dhirāwah | محافظة صعدة | PPL | 80 | 23 | 43.66 | saada |
| al-irqat | العرقات | Al ‘Irqāt | محافظة صعدة | PPL | 80 | 5 | 43.61 | saada |
| al-qami | القعمي | Al Qa‘mī | محافظة صعدة | PPL | 80 | 8 | 42.85 | saada |
| al-mashiqi | ال مشقي | Āl Mashiqī | محافظة صعدة | PPL | 80 | 22 | 43.53 | saada |
| ar-rawas | الروس | Ar Rawas | محافظة صعدة | PPL | 80 | 20 | 45.70 | saada |
| malhah | ملحة | Malḩah | محافظة صعدة | PPL | 80 | 22 | 45.86 | saada |
| qullat-al-hazmi | قلة الهزمي | Qullat al Hazmī | محافظة صعدة | PPL | 80 | 4 | 45.55 | saada |
| hafit | هافت | Hāfit | محافظة صعدة | PPL | 80 | 4 | 45.93 | saada |
| al-ad-durayb | ال الدريب | Āl ad Durayb | محافظة صعدة | PPL | 80 | 10 | 47.19 | saada |
| ghurran | غران | Ghurrān | محافظة صعدة | PPL | 80 | 11 | 46.86 | saada |
| qara-zayd | قرى زيد | Qará Zayd | محافظة صعدة | PPL | 80 | 12 | 46.69 | saada |
| al-khamis | الخميس | Al Khamīs | محافظة صعدة | PPL | 80 | 27 | 45.71 | saada |
| ash-shaqab | الشقب | Ash Shaqab | محافظة صعدة | PPL | 80 | 12 | 45.61 | saada |
| al-qad | القعد | Al Qa‘d | محافظة صعدة | PPL | 80 | 11 | 45.94 | saada |
| qura-isa | قرى عيسى | Qurá ‘Īsá | محافظة صعدة | PPL | 80 | 6 | 46.58 | saada |
| al-mujahayz | المجاحيز | Al Mujāḩayz | محافظة صعدة | PPL | 80 | 3 | 46.69 | saada |
| tabashi | تباشع | Tabāshi‘ | محافظة صعدة | PPL | 80 | 9 | 46.55 | saada |
| qara-as-suwayr | قرى الصوير | Qará aş Şuwayr | محافظة صعدة | PPL | 80 | 8 | 46.24 | saada |
| qara-al-adi | قرى العادي | Qará al ‘Ādī | محافظة صعدة | PPL | 80 | 6 | 43.38 | saada |
| al-kabud | الكبود | Al Kabūd | محافظة صعدة | PPL | 80 | 7 | 45.27 | saada |
| al-junni | الجني | Al Junnī | محافظة صعدة | PPL | 80 | 6 | 44.08 | saada |
| al-jumaymah | الجميمة | Al Jumaymah | محافظة صعدة | PPL | 80 | 13 | 44.54 | saada |
| al-gharbi | الغربي | Al Gharbī | محافظة صعدة | PPL | 80 | 14 | 44.69 | saada |
| al-ghathayah | ال غثاية | Āl Ghathāyah | محافظة صعدة | PPL | 80 | 24 | 45.26 | saada |
| al-juhuf | ال جحف | Āl Juḩuf | محافظة صعدة | PPL | 80 | 6 | 45.11 | saada |
| al-jarahi | الجرهي | Al Jarahī | محافظة صعدة | PPL | 80 | 11 | 44.34 | saada |
| al-juat | الجوعان | Al Jū‘āt | محافظة صعدة | PPL | 80 | 3 | 46.97 | saada |
| al-arram | العرام | Al ‘Arrām | محافظة صعدة | PPL | 80 | 8 | 45.37 | saada |
| al-satir | ال ساتر | Āl Sātir | محافظة صعدة | PPL | 80 | 7 | 45.13 | saada |
| al-dhayban | ال ذيبان | Āl Dhaybān | محافظة صعدة | PPL | 80 | 9 | 44.24 | saada |
| al-lasibah | اللصبة | Al Laşibah | محافظة صعدة | PPL | 80 | 4 | 44.72 | saada |
| al-kuayb | الكعيت | Al Ku‘ayb | محافظة صعدة | PPL | 80 | 13 | 45.01 | saada |
| al-adi-al-ala | العادي الأعلى | Al ‘Ādī al A‘lá | محافظة صعدة | PPL | 80 | 10 | 43.94 | saada |
| al-adi-al-asfal | العادي الأسفل | Al ‘Ādī al Asfal | محافظة صعدة | PPL | 80 | 9 | 44.04 | saada |
| al-jayhah | الجيهة | Al Jayhah | محافظة صعدة | PPL | 80 | 9 | 45.24 | saada |
| birkat-al-naqam | بركة النقم | Birkat al Naqam | محافظة صعدة | PPL | 80 | 8 | 44.78 | saada |
| daruk | داروك | Dārūk | محافظة صعدة | PPL | 80 | 10 | 44.68 | saada |
| al-mitrud | ال مطرود | Āl Miţrūd | محافظة صعدة | PPL | 80 | 9 | 45.42 | saada |
| al-jarad | ال جراد | Āl Jarād | محافظة صعدة | PPL | 80 | 10 | 45.54 | saada |
| al-halhal | الحلحل | Al Ḩalḩal | محافظة صعدة | PPL | 80 | 4 | 46.68 | saada |
| ghurabiq | غرابق | Ghurābiq | محافظة صعدة | PPL | 80 | 7 | 45.92 | saada |
| al-wahidah | الوهدة | Al Wahidah | محافظة صعدة | PPL | 80 | 2 | 45.75 | saada |
| afarah | عفارة | ‘Afārah | محافظة صعدة | PPL | 80 | 10 | 45.43 | saada |
| al-mataf | المعطف | Al Ma‘ţaf | محافظة صعدة | PPL | 80 | 4 | 45.55 | saada |
| az-ziyadah | الزيادة | Az Ziyādah | محافظة صعدة | PPL | 80 | 3 | 45.57 | saada |
| ar-rahah | الراحة | Ar Rāḩah | محافظة صعدة | PPL | 80 | 3 | 45.24 | saada |
| al-zafir | ال ظافر | Āl Z̧āfir | محافظة صعدة | PPL | 80 | 12 | 45.32 | saada |
| mathbir | مثبر | Mathbir | محافظة صعدة | PPL | 80 | 2 | 45.21 | saada |
| al-mizhah | المزحة | Al Mizḩah | محافظة صعدة | PPL | 80 | 1 | 45.15 | saada |
| al-al-uqaribi | ال العقاربي | Āl al ‘Uqāribī | محافظة صعدة | PPL | 80 | 5 | 45.03 | saada |
| al-abu-riah | ال أبو ريعة | Āl Abū Rī‘ah | محافظة صعدة | PPL | 80 | 16 | 47.37 | saada |
| al-khuzamah | الخزامة | Al Khuzāmah | محافظة صعدة | PPL | 80 | 7 | 47.46 | saada |
| al-talib | ال طالب | Āl Ţālib | محافظة صعدة | PPL | 80 | 7 | 46.34 | saada |
| al-marka | المركع | Al Marka‘ | محافظة صعدة | PPL | 80 | 19 | 46.62 | saada |
| al-mudarib | المضارب | Al Muḑārib | محافظة صعدة | PPL | 80 | 4 | 46.24 | saada |
| al-zayd | ال زيد | Āl Zayd | محافظة صعدة | PPL | 80 | 14 | 47.42 | saada |
| al-qahirah | القاهرة | Al Qāhirah | محافظة صعدة | PPL | 80 | 5 | 47.68 | saada |
| matwah | مطوة | Maţwah | محافظة صعدة | PPL | 80 | 3 | 47.74 | saada |
| al-salah | ال صلاح | Āl Şalāḩ | محافظة صعدة | PPL | 80 | 3 | 47.84 | saada |
| al-ghathwan | ال عثوان | Āl Ghathwān | محافظة صعدة | PPL | 80 | 5 | 47.96 | saada |
| al-maazib | المعازب | Al Ma‘āzib | محافظة صعدة | PPL | 80 | 5 | 48.10 | saada |
| dar-al-mawash | دار المعوش | Dār al Ma‘wash | محافظة صعدة | PPL | 80 | 2 | 47.71 | saada |
| al-misan | المسن | Al Misan | محافظة صعدة | PPL | 80 | 4 | 47.49 | saada |
| al-mutay | ال مطيع | Āl Muţay‘ | محافظة صعدة | PPL | 80 | 1 | 47.51 | saada |
| dhira-as-sadah | ذراع السادة | Dhirā‘ as Sādah | محافظة صعدة | PPL | 80 | 18 | 48.08 | saada |
| al-harah | الحرة | Al Ḩarah | محافظة صعدة | PPL | 80 | 1 | 47.41 | saada |
| al-al-balim | ال البليم | Āl al Balīm | محافظة صعدة | PPL | 80 | 26 | 47.57 | saada |
| al-minqa | المنقع | Al Minqa‘ | محافظة صعدة | PPL | 80 | 5 | 47.53 | saada |
| al-muzarif | المظاريف | Al Muz̧ārīf | محافظة صعدة | PPL | 80 | 9 | 47.73 | saada |
| al-abu-hashid | ال أبو حاشد | Āl Abū Ḩāshid | محافظة صعدة | PPL | 80 | 3 | 48.05 | saada |
| al-as-sandubi | ال السندوبي | Āl as Sandūbī | محافظة صعدة | PPL | 80 | 20 | 47.55 | saada |
| al-al-kharabi | ال الخربي | Āl al Kharabī | محافظة صعدة | PPL | 80 | 8 | 47.65 | saada |
| duwar-an-nashar | دوار النشر | Duwār an Nashar | محافظة صعدة | PPL | 80 | 20 | 47.37 | saada |
| al-hamat | الحمات | Al Ḩamāt | محافظة صعدة | PPL | 80 | 4 | 46.88 | saada |
| al-qara | القرى | Al Qará | محافظة صعدة | PPL | 80 | 7 | 47.18 | saada |
| sihar | سحار | Siḩār | محافظة صعدة | PPL | 80 | 5 | 47.05 | saada |
| arimah | عريمة | ‘Arīmah | محافظة صعدة | PPL | 80 | 12 | 46.31 | saada |
| az-zuwahir | الظواهر | Az̧ Z̧uwāhir | محافظة صعدة | PPL | 80 | 5 | 50.30 | saada |
| al-sinhan | ال سنحان | Āl Sinḩān | محافظة صعدة | PPL | 80 | 11 | 47.05 | saada |
| bani-al-hayftayn | بني الحيفتين | Banī al Ḩayftayn | محافظة صعدة | PPL | 80 | 12 | 46.82 | saada |
| al-khawtah | الخوطة | Al Khawţah | محافظة صعدة | PPL | 80 | 3 | 45.38 | saada |
| al-salihah | ال صالحة | Āl Şāliḩah | محافظة صعدة | PPL | 80 | 39 | 45.17 | saada |
| ar-raqqah | الرقة | Ar Raqqah | محافظة صعدة | PPL | 80 | 30 | 47.55 | saada |
| al-ghathar | الغثر | Al Ghathar | محافظة صعدة | PPL | 80 | 4 | 46.38 | saada |
| dhira-bin-juhlan | ذراع بن جحلان | Dhirā‘ Bin Juḩlān | محافظة صعدة | PPL | 80 | 13 | 46.58 | saada |
| al-jurabi | الجرابي | Al Jurābī | محافظة صعدة | PPL | 80 | 7 | 48.57 | saada |
| al-ghadrah | الغدرة | Al Ghadrah | محافظة صعدة | PPL | 80 | 2 | 49.43 | saada |
| al-maqbir | المقبر | Al Maqbir | محافظة صعدة | PPL | 80 | 5 | 48.68 | saada |
| ash-shawariq | الشوارق | Ash Shawāriq | محافظة صعدة | PPL | 80 | 16 | 50.59 | saada |
| al-masna | المصبح | Al Maşna‘ | محافظة صعدة | PPL | 80 | 12 | 50.87 | saada |
| al-jadr | الجدر | Al Jadr | محافظة صعدة | PPL | 80 | 3 | 53.99 | saada |
| dhi-shudayn | ذي شدين | Dhī Shudayn | محافظة صعدة | PPL | 80 | 3 | 53.83 | saada |
| al-ard | العرض | Al ‘Arḑ | محافظة صعدة | PPL | 80 | 4 | 53.63 | saada |
| ar-rukbah | الركبة | Ar Rukbah | محافظة صعدة | PPL | 80 | 10 | 53.70 | saada |
| adh-dhuwayr | الذوير | Adh Dhuwayr | محافظة صعدة | PPL | 80 | 6 | 53.58 | saada |
| al-bitahi | البطاحي | Al Biţāḩī | محافظة صعدة | PPL | 80 | 7 | 54.95 | saada |
| al-masajid | المساجد | Al Masājid | محافظة صعدة | PPL | 80 | 8 | 54.57 | saada |
| halab-ash-shawariq | حلب الشوارق | Ḩalab ash Shawāriq | محافظة صعدة | PPL | 80 | 13 | 49.38 | saada |
| thu-muwan | ثو موان | Thū Muwān | محافظة صعدة | PPL | 80 | 8 | 50.62 | saada |
| suwayr | سوير | Suwayr | محافظة صعدة | PPL | 80 | 11 | 49.73 | saada |
| al-jidur | الجدور | Al Jidūr | محافظة صعدة | PPL | 80 | 4 | 49.53 | saada |
| mahawlah | محولة | Maḩawlah | محافظة صعدة | PPL | 80 | 13 | 49.76 | saada |
| al-lahij | اللحج | Al Laḩij | محافظة صعدة | PPL | 80 | 15 | 49.22 | saada |
| al-hunak | الحناك | Al Ḩunāk | محافظة صعدة | PPL | 80 | 28 | 49.14 | saada |
| al-mansifah | المنسفة | Al Mansifah | محافظة صعدة | PPL | 80 | 9 | 48.91 | saada |
| kuniyah | كنية | Kunīyah | محافظة صعدة | PPL | 80 | 18 | 50.58 | saada |
| afarah | عفارة | ‘Afārah | محافظة صعدة | PPL | 80 | 8 | 51.31 | saada |
| al-mukaddis | المكدس | Al Mukaddis | محافظة صعدة | PPL | 80 | 18 | 50.34 | saada |
| al-uwali | العوالي | Al ‘Uwālī | محافظة صعدة | PPL | 80 | 25 | 50.69 | saada |
| jahwat-thamirah | جهوة ثميرة | Jahwat Thamīrah | محافظة صعدة | PPL | 80 | 8 | 51.14 | saada |
| an-numan | النعمان | An Nu‘mān | محافظة صعدة | PPL | 80 | 4 | 50.82 | saada |
| as-subl | الصبل | Aş Şubl | محافظة صعدة | PPL | 80 | 12 | 50.03 | saada |
| farah | فرح | Faraḩ | محافظة صعدة | PPL | 80 | 13 | 51.28 | saada |
| as-sawdi | السودي | As Sawdī | محافظة صعدة | PPL | 80 | 6 | 51.46 | saada |
| al-haydirah | الحيدرة | Al Ḩaydirah | محافظة صعدة | PPL | 80 | 4 | 53.95 | saada |
| al-barak | البرك | Al Barak | محافظة صعدة | PPL | 80 | 5 | 53.86 | saada |
| alt-haywan | الت حيوان | Alt Ḩaywān | محافظة صعدة | PPL | 80 | 11 | 54.16 | saada |
| al-baqah | البقعة | Al Baq‘ah | محافظة صعدة | PPL | 80 | 9 | 54.69 | saada |
| sadan | سعدان | Sa‘dān | محافظة صعدة | PPL | 80 | 6 | 54.83 | saada |
| dhi-rashaf | ذي رشاف | Dhī Rashāf | محافظة صعدة | PPL | 80 | 2 | 52.38 | saada |
| haynamah | حينمة | Ḩaynamah | محافظة صعدة | PPL | 80 | 18 | 52.21 | saada |
| jidar-mawqar | جدار موقار | Jidār Mawqār | محافظة صعدة | PPL | 80 | 3 | 51.78 | saada |
| al-maqashi | المقشي | Al Maqashī | محافظة صعدة | PPL | 80 | 14 | 51.88 | saada |
| arabah-as-sufla | عرابة السفلى | ‘Arābah as Suflá | محافظة صعدة | PPL | 80 | 4 | 52.92 | saada |
| arabat-al-ulya | عرابة العليا | ‘Arābat al Ulyā | محافظة صعدة | PPL | 80 | 56 | 52.94 | saada |
| al-haydir | ال حيدر | Āl Ḩaydir | محافظة صعدة | PPL | 80 | 19 | 52.73 | saada |
| al-barak | البرك | Al Barak | محافظة صعدة | PPL | 80 | 19 | 53.05 | saada |
| hijlat-mashraqah | حجلة مشرقة | Ḩijlat Mashraqah | محافظة صعدة | PPL | 80 | 22 | 51.55 | saada |
| shaybab-dahwan | شيباب دهوان | Shaybāb Dahwān | محافظة صعدة | PPL | 80 | 18 | 52.48 | saada |
| al-muzayd | المزيد | Al Muzayd | محافظة صعدة | PPL | 80 | 9 | 52.52 | saada |
| al-al-faqwa | ال الفقوع | Āl al Faqwa‘ | محافظة صعدة | PPL | 80 | 11 | 52.73 | saada |
| al-qulla | القلا | Al Qullā | محافظة صعدة | PPL | 80 | 16 | 52.23 | saada |
| al-awqan | ال عوقان | Āl ‘Awqān | محافظة صعدة | PPL | 80 | 15 | 50.56 | saada |
| al-hisn | الحصن | Al Ḩişn | محافظة صعدة | PPL | 80 | 14 | 49.76 | saada |
| alt-al-huduri | الت الحضوري | Alt al Ḩuḑūrī | محافظة صعدة | PPL | 80 | 7 | 50.34 | saada |
| sajr | سجر | Sajr | محافظة صعدة | PPL | 80 | 11 | 50.21 | saada |
| as-silwa | السلوى | As Silwá | محافظة صعدة | PPL | 80 | 16 | 49.11 | saada |
| az-zafir | الظافر | Az̧ Z̧āfir | محافظة صعدة | PPL | 80 | 8 | 49.53 | saada |
| al-qawz | القوز | Al Qawz | محافظة صعدة | PPL | 80 | 4 | 49.35 | saada |
| al-dabush | ال دعبوس | Āl Da‘būsh | محافظة صعدة | PPL | 80 | 25 | 50.78 | saada |
| alt-qulayli | الت قليلي | Alt Qulaylī | محافظة صعدة | PPL | 80 | 15 | 50.92 | saada |
| al-alaki | العلكي | Al ‘Alakī | محافظة صعدة | PPL | 80 | 8 | 50.67 | saada |
| tall-hajr | تل هجر | Tall Hajr | محافظة صعدة | PPL | 80 | 3 | 51.09 | saada |
| mataq-ziyad | معتق زياد | Ma‘taq Ziyād | محافظة صعدة | PPL | 80 | 36 | 50.88 | saada |
| al-milath | الملاث | Al Milāth | محافظة صعدة | PPL | 80 | 2 | 53.11 | saada |
| al-mitzal | المتزل | Al Mitzal | محافظة صعدة | PPL | 80 | 16 | 54.85 | saada |
| ash-shiraqi | الشراقي | Ash Shirāqī | محافظة صعدة | PPL | 80 | 3 | 53.92 | saada |
| bayn-al-liwa | بين اللواء | Bayn al Liwā’ | محافظة صعدة | PPL | 80 | 2 | 54.69 | saada |
| al-hijrah | الحجرة | Al Ḩijrah | محافظة صعدة | PPL | 80 | 6 | 54.98 | saada |
| am-ataq-al-mashuf | أمعتق المشعوف | Am ‘Ataq al Mash‘ūf | محافظة صعدة | PPL | 80 | 6 | 55.27 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة صعدة | PPL | 80 | 12 | 55.30 | saada |
| bayn-al-mashbah | بين المشبة | Bayn al Mashbah | محافظة صعدة | PPL | 80 | 2 | 55.40 | saada |
| bayn-al-khalifah | بين الخلفة | Bayn al Khalifah | محافظة صعدة | PPL | 80 | 14 | 53.31 | saada |
| qullat-al-ajbar | قلة الأجبار | Qullat al Ajbār | محافظة صعدة | PPL | 80 | 4 | 53.51 | saada |
| mahall-umm-washah | محل أم وعشة | Maḩall Umm Wa‘shah | محافظة صعدة | PPL | 80 | 10 | 51.79 | saada |
| bayn-ash-shirbah | بين السربة | Bayn ash Shirbah | محافظة صعدة | PPL | 80 | 4 | 53.44 | saada |
| ad-diman | الدمن | Ad Diman | محافظة صعدة | PPL | 80 | 2 | 54.94 | saada |
| aflah | عفلة | ‘Aflah | محافظة صعدة | PPL | 80 | 3 | 54.69 | saada |
| al-qarah | القرعة | Al Qar‘ah | محافظة صعدة | PPL | 80 | 1 | 53.93 | saada |
| alt-karamah | الت كرامة | Alt Karāmah | محافظة صعدة | PPL | 80 | 7 | 51.09 | saada |
| alt-al-badi | الت البادي | Alt al Bādī | محافظة صعدة | PPL | 80 | 4 | 51.32 | saada |
| as-samatin | السمطين | As Samaţīn | محافظة صعدة | PPL | 80 | 27 | 51.94 | saada |
| az-zirawa | الظراوع | Az̧ Z̧irāwa‘ | محافظة صعدة | PPL | 80 | 23 | 51.61 | saada |
| shaybab-dahwan | شيباب دهوان | Shaybāb Dahwān | محافظة صعدة | PPL | 80 | 10 | 51.96 | saada |
| alt-suhayl-wa-dahwan | الت سحيل ودهوان | Alt Suḩayl wa Dahwān | محافظة صعدة | PPL | 80 | 21 | 52.06 | saada |
| al-mawjin | الموجن | Al Mawjin | محافظة صعدة | PPL | 80 | 33 | 50.87 | saada |
| al-khaliqah | الخلقة | Al Khaliqah | محافظة صعدة | PPL | 80 | 12 | 51.64 | saada |
| ad-damigh | الدامغ | Ad Dāmigh | محافظة صعدة | PPL | 80 | 2 | 51.19 | saada |
| alt-halasah | الت حلاسة | Alt Ḩalāsah | محافظة صعدة | PPL | 80 | 4 | 52.26 | saada |
| as-samighah | الصمغة | Aş Şamighah | محافظة صعدة | PPL | 80 | 15 | 52.90 | saada |
| alt-kutaybah | الت كتيبة | Alt Kutaybah | محافظة صعدة | PPL | 80 | 18 | 52.58 | saada |
| al-markah | المركح | Al Markaḩ | محافظة صعدة | PPL | 80 | 20 | 52.74 | saada |
| alt-ashah | الت عاشة | Alt ‘Āshah | محافظة صعدة | PPL | 80 | 26 | 52.40 | saada |
| alt-shulaylah | الت شليلة | Alt Shulaylah | محافظة صعدة | PPL | 80 | 22 | 52.52 | saada |
| al-ajim | العجيم | Al ‘Ajīm | محافظة صعدة | PPL | 80 | 9 | 53.86 | saada |
| alt-shakir | الت شاكر | Alt Shākir | محافظة صعدة | PPL | 80 | 8 | 53.70 | saada |
| ad-diman | الدمن | Ad Diman | محافظة صعدة | PPL | 80 | 7 | 53.34 | saada |
| alt-mashiyah | الت معشية | Alt Ma‘shīyah | محافظة صعدة | PPL | 80 | 5 | 53.31 | saada |
| al-alay | العلاي | Al ‘Alāy | محافظة صعدة | PPL | 80 | 4 | 52.35 | saada |
| ghaylan | غيلان | Ghaylān | محافظة صعدة | PPL | 80 | 10 | 51.02 | saada |
| al-as | العاس | Al ‘Ās | محافظة صعدة | PPL | 80 | 10 | 50.87 | saada |
| as-sari-ghaylan | السريع غيلان | As Sarī‘ Ghaylān | محافظة صعدة | PPL | 80 | 12 | 51.07 | saada |
| makab | مكعب | Mak‘ab | محافظة صعدة | PPL | 80 | 2 | 54.42 | saada |
| as-sawdah | السودة | As Sawdah | محافظة صعدة | PPL | 80 | 4 | 54.69 | saada |
| abd-al-wahid | عبد الواحد | ‘Abd al Wāḩid | محافظة صعدة | PPL | 80 | 16 | 54.63 | saada |
| bani-jadir | بني جدير | Banī Jadīr | محافظة صعدة | PPL | 80 | 41 | 51.78 | saada |
| ash-shaf | الشعف | Ash Sha’f | محافظة صعدة | PPL | 80 | 12 | 51.68 | saada |
| az-zira | الزراع | Az Zirā‘ | محافظة صعدة | PPL | 80 | 22 | 52.20 | saada |
| siyaf-al-bayt | صياف البيت | Şiyāf al Bayt | محافظة صعدة | PPL | 80 | 15 | 52.34 | saada |
| al-atif | العطف | Al ‘Aţif | محافظة صعدة | PPL | 80 | 16 | 52.57 | saada |
| an-nimrah | النمرة | An Nimrah | محافظة صعدة | PPL | 80 | 9 | 52.93 | saada |
| al-qasabah | القصبة | Al Qaşabah | محافظة صعدة | PPL | 80 | 16 | 53.84 | saada |
| sihab | سحاب | Siḩāb | محافظة صعدة | PPL | 80 | 10 | 52.57 | saada |
| al-shaykhin | ال شيخين | Āl Shaykhīn | محافظة صعدة | PPL | 80 | 11 | 53.74 | saada |
| al-mihmah | المحماه | Al Miḩmāh | محافظة صعدة | PPL | 80 | 12 | 53.75 | saada |
| sarw-al-hariz | صرو الحرز | Şarw al Ḩariz | محافظة صعدة | PPL | 80 | 7 | 53.79 | saada |
| al-mujarin | المجارين | Al Mujārīn | محافظة صعدة | PPL | 80 | 2 | 54.36 | saada |
| al-atiyah | ال عطية | Āl ‘Aţīyah | محافظة صعدة | PPL | 80 | 4 | 53.49 | saada |
| as-sufla | السفلى | As Suflá | محافظة صعدة | PPL | 80 | 6 | 54.49 | saada |
| bayt-badrah | بيت بدرة | Bayt Badrah | محافظة صعدة | PPL | 80 | 1 | 54.04 | saada |
| bayt-sawdan | بيت سودان | Bayt Sawdān | محافظة صعدة | PPL | 80 | 2 | 53.72 | saada |
| al-muwari | المواري | Al Muwārī | محافظة صعدة | PPL | 80 | 10 | 41.28 | saada |
| al-qiyafin | القيافين | Al Qiyāfīn | محافظة صعدة | PPL | 80 | 3 | 40.59 | saada |
| al-wasil | ال واصل | Āl Wāşil | محافظة صعدة | PPL | 80 | 6 | 43.16 | saada |
| al-haylan | ال هيلان | Āl Haylān | محافظة صعدة | PPL | 80 | 7 | 43.16 | saada |
| al-qufrah | القفرة | Al Qufrah | محافظة صعدة | PPL | 80 | 1 | 42.25 | saada |
| dhu-wahiqah | ذو وحقة | Dhū Waḩiqah | محافظة صعدة | PPL | 80 | 8 | 44.45 | saada |
| usaydah | عصيدة | ‘Uşaydah | محافظة صعدة | PPL | 80 | 3 | 44.25 | saada |
| al-fumrah | الفمرة | Al Fumrah | محافظة صعدة | PPL | 80 | 3 | 44.08 | saada |
| raht | رهط | Rahţ | محافظة صعدة | PPL | 80 | 5 | 44.61 | saada |
| al-ghawarib | الغوارب | Al Ghawārib | محافظة صعدة | PPL | 80 | 6 | 45.43 | saada |
| aqra | أقرع | Aqra‘ | محافظة صعدة | PPL | 80 | 5 | 45.45 | saada |
| qullat-gharbah | قلة غربة | Qullat Gharbah | محافظة صعدة | PPL | 80 | 5 | 44.58 | saada |
| zabin | زبن | Zabin | محافظة صعدة | PPL | 80 | 4 | 44.91 | saada |
| as-silbah | الصلبة | Aş Şilbah | محافظة صعدة | PPL | 80 | 1 | 43.36 | saada |
| al-sinhan | ال سنحان | Āl Sinḩān | محافظة صعدة | PPL | 80 | 4 | 43.73 | saada |
| al-shaddad | ال شداد | Āl Shaddād | محافظة صعدة | PPL | 80 | 3 | 44.29 | saada |
| al-ghayda | ال غيدا | Āl Ghaydā | محافظة صعدة | PPL | 80 | 7 | 45.78 | saada |
| al-hajib | ال حاجب | Āl Ḩājib | محافظة صعدة | PPL | 80 | 1 | 45.19 | saada |
| dhira-al-miraj | ذراع المعراج | Dhirā‘ al Mi‘rāj | محافظة صعدة | PPL | 80 | 2 | 45.85 | saada |
| tahawwad | تحود | Taḩawwad | محافظة صعدة | PPL | 80 | 3 | 46.40 | saada |
| dhu-khamal | ذو خمل | Dhū Khamal | محافظة صعدة | PPL | 80 | 3 | 43.62 | saada |
| rayis | رايس | Rāyis | محافظة صعدة | PPL | 80 | 4 | 44.32 | saada |
| al-akim | ال عكيم | Āl ‘Akīm | محافظة صعدة | PPL | 80 | 2 | 42.19 | saada |
| al-mawsha | ال موشى | Āl Mawshá | محافظة صعدة | PPL | 80 | 2 | 41.73 | saada |
| al-said | ال سعيد | Āl Sa‘īd | محافظة صعدة | PPL | 80 | 5 | 43.67 | saada |
| al-zaynah | ال زينة | Āl Zaynah | محافظة صعدة | PPL | 80 | 5 | 43.85 | saada |
| al-ghaliyah | ال غالية | Āl Ghālīyah | محافظة صعدة | PPL | 80 | 4 | 43.88 | saada |
| ti-jinn | تي جن | Tī Jinn | محافظة صعدة | PPL | 80 | 5 | 43.14 | saada |
| bani-urayj | بني عريج | Banī ‘Urayj | محافظة صعدة | PPL | 80 | 1 | 35.94 | saada |
| jawz-al-alah | جوز العالة | Jawz al ‘Ālah | محافظة صعدة | PPL | 80 | 5 | 41.66 | saada |
| al-halaf | الحلف | Al Ḩalaf | محافظة صعدة | PPL | 80 | 7 | 40.73 | saada |
| as-sadr | السدر | As Sadr | محافظة صعدة | PPL | 80 | 2 | 40.69 | saada |
| al-daur | ال دعور | Āl Da‘ūr | محافظة صعدة | PPL | 80 | 6 | 40.70 | saada |
| al-al-hudhayf | ال الحذيف | Āl al Ḩudhayf | محافظة صعدة | PPL | 80 | 3 | 42.86 | saada |
| al-baqah | البقعة | Al Baq‘ah | محافظة صعدة | PPL | 80 | 8 | 43.83 | saada |
| arwan | عروان | ‘Arwān | محافظة صعدة | PPL | 80 | 2 | 42.92 | saada |
| khirafij | خرافج | Khirāfij | محافظة صعدة | PPL | 80 | 1 | 43.83 | saada |
| al-qanman | ال قنمان | Āl Qanmān | محافظة صعدة | PPL | 80 | 9 | 43.21 | saada |
| al-maghribah | المغربة | Al Maghribah | محافظة صعدة | PPL | 80 | 6 | 43.41 | saada |
| al-uwayri | العويري | Al ‘Uwayrī | محافظة صعدة | PPL | 80 | 1 | 45.32 | saada |
| ladrah | لضرة | Laḑrah | محافظة صعدة | PPL | 80 | 4 | 43.43 | saada |
| al-mirqu | المرقوع | Al Mirqū‘ | محافظة صعدة | PPL | 80 | 6 | 44.44 | saada |
| dhira-qiyash | ذراع قياش | Dhirā‘ Qiyāsh | محافظة صعدة | PPL | 80 | 7 | 45.83 | saada |
| al-lakwan | ال لكوان | Āl Lakwān | محافظة صعدة | PPL | 80 | 11 | 43.38 | saada |
| al-hajar | الهجر | Al Hajar | محافظة صعدة | PPL | 80 | 6 | 45.14 | saada |
| al-al-wunani | ال الوناني | Āl al Wunānī | محافظة صعدة | PPL | 80 | 2 | 45.61 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة صعدة | PPL | 80 | 6 | 45.35 | saada |
| al-mansar | المنصر | Al Manşar | محافظة صعدة | PPL | 80 | 11 | 34.32 | saada |
| al-hisn | الحصن | Al Ḩişn | محافظة صعدة | PPL | 80 | 26 | 47.49 | saada |
| labakh | لباخ | Labākh | محافظة صعدة | PPL | 80 | 13 | 47.12 | saada |
| al-amir | ال عامر | Āl ‘Āmir | محافظة صعدة | PPL | 80 | 6 | 46.37 | saada |
| as-sarw | الصرو | Aş Şarw | محافظة صعدة | PPL | 80 | 7 | 52.67 | saada |
| ar-ras | الرأس | Ar Ra’s | محافظة صعدة | PPL | 80 | 6 | 41.19 | saada |
| al-harabi | ال حربي | Āl Ḩarabī | محافظة صعدة | PPL | 80 | 25 | 45.04 | saada |
| bayt-al-hayaf | بيت الحياف | Bayt al Ḩayāf | محافظة صعدة | PPL | 80 | 17 | 44.41 | saada |
| al-mihrab | المحراب | Al Miḩrāb | محافظة صعدة | PPL | 80 | 3 | 44.57 | saada |
| al-khiyalah | الخيالة | Al Khiyālah | محافظة صعدة | PPL | 80 | 2 | 53.95 | saada |
| ti-al-hawjam | تالحوجم | Ti al Ḩawjam | محافظة صعدة | PPL | 80 | 7 | 51.78 | saada |
| raymah | ريمة | Raymah | محافظة صعدة | PPL | 80 | 3 | 51.91 | saada |
| at-talibi | التالبي | At Tālibī | محافظة صعدة | PPL | 80 | 5 | 52.51 | saada |
| bajbajah | بجبجة | Bajbajah | محافظة صعدة | PPL | 80 | 5 | 52.22 | saada |
| al-kadisah | الكدسة | Al Kadisah | محافظة صعدة | PPL | 80 | 8 | 54.19 | saada |
| bayt-al-hayaf | بيت الحياف | Bayt al Ḩayāf | محافظة صعدة | PPL | 80 | 7 | 54.50 | saada |
| al-qufayl | القفيل | Al Qufayl | محافظة صعدة | PPL | 80 | 16 | 48.98 | saada |
| ath-thawahir | الثواهر | Ath Thawāhir | محافظة صعدة | PPL | 80 | 10 | 53.40 | saada |
| qullat-al-mujarin | قلة المجارين | Qullat al Mujārīn | محافظة صعدة | PPL | 80 | 3 | 54.98 | saada |
| jurban | جربان | Jurbān | محافظة صعدة | PPL | 80 | 7 | 40.69 | saada |
| mahinah | معهنة | Ma‘hinah | محافظة صعدة | PPL | 80 | 2 | 47.29 | saada |
| mahallat-al-muammar | محلة المعمر | Maḩallat al Mu‘ammar | محافظة حجة | PPL | 80 | 29 | 97.88 | sanaa |
| al-jallah | الجلة | Al Jallah | محافظة حجة | PPL | 80 | 22 | 94.39 | sanaa |
| aqm-al-mawqir | عقم الموقر | ‘Aqm al Mawqir | محافظة حجة | PPL | 80 | 2 | 94.78 | sanaa |
| ash-shari-al-asfal | الشرع الأسفل | Ash Shari‘ al Asfal | محافظة حجة | PPL | 80 | 10 | 94.47 | sanaa |
| qasabat-al-mudahi | قصبة المضاحـي | Qaşabat al Muḑāḩī | محافظة حجة | PPL | 80 | 37 | 94.71 | sanaa |
| qufad | قفاد | Qufād | محافظة حجة | PPL | 80 | 2 | 96.60 | sanaa |
| saqayat-rayhan | سقاية ريحان | Saqāyat Rayḩān | محافظة حجة | PPL | 80 | 7 | 95.63 | sanaa |
| al-qaryah-as-sawda | القرية السوداء | Al Qaryah as Sawdā’ | محافظة حجة | PPL | 80 | 9 | 96.22 | sanaa |
| ar-rawha | الروحاء | Ar Rawḩā’ | محافظة حجة | PPL | 80 | 52 | 97.64 | sanaa |
| al-mahdurah | المحدورة | Al Maḩdūrah | محافظة حجة | PPL | 80 | 19 | 97.98 | sanaa |
| at-tawf-al-yamani | الطوف اليماني | Aţ Ţawf al Yamānī | محافظة حجة | PPL | 80 | 61 | 97.93 | sanaa |
| mahallat-al-qasabah | محلة القصبة | Maḩallat al Qaşabah | محافظة حجة | PPL | 80 | 16 | 98.32 | sanaa |
| qasabat-al-maafa | قصبة المعافاء | Qaşabat al Ma‘āfā’ | محافظة حجة | PPL | 80 | 8 | 97.72 | sanaa |
| arshan | عرشان | ‘Arshān | محافظة حجة | PPL | 80 | 20 | 98.75 | sanaa |
| khafash | خافش | Khāfash | محافظة حجة | PPL | 80 | 20 | 95.00 | sanaa |
| ghallat-jabir | غلة جابر | Ghallat Jābir | محافظة حجة | PPL | 80 | 10 | 92.83 | sanaa |
| jiz-mawzan | جزع موزان | Jiz‘ Mawzān | محافظة حجة | PPL | 80 | 10 | 93.00 | sanaa |
| al-manzil | المنزل | Al Manzil | محافظة حجة | PPL | 80 | 6 | 93.19 | sanaa |
| qasabat-al-adain | قصبة العدائن | Qaşabat al ‘Adā’in | محافظة حجة | PPL | 80 | 2 | 93.36 | sanaa |
| al-hayjah | الهيجة | Al Hayjah | محافظة حجة | PPL | 80 | 3 | 93.71 | sanaa |
| al-lujj | اللج | Al Lujj | محافظة حجة | PPL | 80 | 7 | 93.67 | sanaa |
| al-minaki | المناكع | Al Mināki‘ | محافظة حجة | PPL | 80 | 5 | 94.42 | sanaa |
| arwan | عروان | ‘Arwān | محافظة حجة | PPL | 80 | 6 | 94.50 | sanaa |
| ash-shari-al-ala | الشرع الأعلى | Ash Shari‘ al A‘lá | محافظة حجة | PPL | 80 | 25 | 94.54 | sanaa |
| qimash | قماش | Qimāsh | محافظة حجة | PPL | 80 | 18 | 94.87 | sanaa |
| al-muhanidh | المحانذ | Al Muḩānidh | محافظة حجة | PPL | 80 | 12 | 94.82 | sanaa |
| qasabat-dahyah | قصبة دحياه | Qaşabat Daḩyāh | محافظة حجة | PPL | 80 | 3 | 96.47 | sanaa |
| as-surbah | السربة | As Surbah | محافظة حجة | PPL | 80 | 33 | 96.81 | sanaa |
| hadabat-dahruj | حدبة دحروج | Ḩadabat Daḩrūj | محافظة حجة | PPL | 80 | 7 | 96.81 | sanaa |
| qasabat-dahshush | قصبة دهشوش | Qaşabat Dahshūsh | محافظة حجة | PPL | 80 | 15 | 96.72 | sanaa |
| ash-shati | الشاطئ | Ash Shāţi’ | محافظة حجة | PPL | 80 | 13 | 97.06 | sanaa |
| al-mashaf | المشاف | Al Mashāf | محافظة حجة | PPL | 80 | 16 | 95.00 | sanaa |
| al-umzah | العمزة | Al ‘Umzah | محافظة حجة | PPL | 80 | 25 | 94.95 | sanaa |
| aqm-al-jazif | عقم الجزف | ‘Aqm al Jazif | محافظة حجة | PPL | 80 | 26 | 95.09 | sanaa |
| ad-dali | الضالع | Aḑ Ḑāli‘ | محافظة حجة | PPL | 80 | 7 | 95.58 | sanaa |
| ar-raqiqah | الرقيقة | Ar Raqīqah | محافظة حجة | PPL | 80 | 6 | 95.19 | sanaa |
| at-tawf-ash-shami | الطوف الشامي | Aţ Ţawf ash Shāmī | محافظة حجة | PPL | 80 | 14 | 97.77 | sanaa |
| al-juhrah | الجحرة | Al Juḩrah | محافظة حجة | PPL | 80 | 9 | 94.53 | sanaa |
| al-qadhqadhah | القذقذة | Al Qadhqadhah | محافظة حجة | PPL | 80 | 17 | 94.48 | sanaa |
| al-ahjal | الأحجال | Al Aḩjāl | محافظة حجة | PPL | 80 | 4 | 94.66 | sanaa |
| bayt-ash-sharqi | بيت الشرقي | Bayt ash Sharqī | محافظة حجة | PPL | 80 | 6 | 94.69 | sanaa |
| al-kawr | الكور | Al Kawr | محافظة حجة | PPL | 80 | 2 | 94.57 | sanaa |
| as-sada | الصعداء | Aş Şa‘dā’ | محافظة حجة | PPL | 80 | 11 | 94.39 | sanaa |
| arash | عراش | ‘Arāsh | محافظة حجة | PPL | 80 | 2 | 94.70 | sanaa |
| az-zafir | الظفير | Az̧ Z̧afīr | محافظة حجة | PPL | 80 | 70 | 97.21 | sanaa |
| al-hayfa | الحيفـاء | Al Ḩayfā’ | محافظة حجة | PPL | 80 | 3 | 96.38 | sanaa |
| ad-dawdan | الدودان | Ad Dawdān | محافظة حجة | PPL | 80 | 5 | 95.94 | sanaa |
| ar-rayb | الريب | Ar Rayb | محافظة حجة | PPL | 80 | 1 | 95.89 | sanaa |
| ad-darb | الدرب | Ad Darb | محافظة حجة | PPL | 80 | 9 | 95.97 | sanaa |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة حجة | PPL | 80 | 8 | 96.05 | sanaa |
| al-madarah | المدارة | Al Madārah | محافظة حجة | PPL | 80 | 3 | 96.63 | sanaa |
| al-masnaah | المصنعة | Al Maşna‘ah | محافظة حجة | PPL | 80 | 1 | 96.31 | sanaa |
| aqm-as-sawfi | عقم الصوفى | ‘Aqm aş Şawfī | محافظة حجة | PPL | 80 | 2 | 98.23 | saada |
| baqtah | بقطة | Baqţah | محافظة حجة | PPL | 80 | 2 | 100.40 | sanaa |
| dhu-mada-is | ذو مداعس | Dhū Madā‘is | محافظة حجة | PPL | 80 | 2 | 100.08 | sanaa |
| qai | قعي | Qa‘ī | محافظة حجة | PPL | 80 | 3 | 98.16 | saada |
| al-badh | البدح | Al Badḩ | محافظة حجة | PPL | 80 | 4 | 98.28 | saada |
| sawadah | سوادة | Sawādah | محافظة حجة | PPL | 80 | 5 | 98.75 | saada |
| al-kharshabi | الخرشبى | Al Kharshabī | محافظة حجة | PPL | 80 | 2 | 101.25 | sanaa |
| ad-daraj | الدرج | Ad Daraj | محافظة حجة | PPL | 80 | 2 | 99.36 | sanaa |
| ar-ruknah | الركنة | Ar Ruknah | محافظة حجة | PPL | 80 | 15 | 100.91 | sanaa |
| ghalat-al-matri | غالة الماطري | Ghālat al Māţrī | محافظة حجة | PPL | 80 | 17 | 100.97 | sanaa |
| az-zuraybah | الزريبة | Az Zuraybah | محافظة حجة | PPL | 80 | 38 | 101.10 | sanaa |
| al-kawm | الكوم | Al Kawm | محافظة حجة | PPL | 80 | 3 | 100.29 | sanaa |
| ath-thahirah | الثهرة | Ath Thahirah | محافظة حجة | PPL | 80 | 2 | 99.03 | sanaa |
| bab-malis | باب مالص | Bāb Māliş | محافظة حجة | PPL | 80 | 4 | 97.53 | sanaa |
| al-quad | القعاد | Al Qu‘ād | محافظة عمران | PPL | 80 | 9 | 83.62 | saada |
| saqam | سقام | Saqām | محافظة عمران | PPL | 80 | 4 | 84.13 | saada |
| ar-rajat | الرجاة | Ar Rajāt | محافظة عمران | PPL | 80 | 3 | 82.82 | saada |
| ka | كاع | Kā‘ | محافظة عمران | PPL | 80 | 9 | 81.33 | saada |
| ash-shamiyah | الشامية | Ash Shāmīyah | محافظة عمران | PPL | 80 | 17 | 81.33 | saada |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة عمران | PPL | 80 | 18 | 81.91 | saada |
| gharib-ash-sharif | غارب الشريف | Ghārib ash Sharīf | محافظة عمران | PPL | 80 | 15 | 82.10 | saada |
| al-qawba | القوباء | Al Qawbā’ | محافظة عمران | PPL | 80 | 2 | 97.17 | sanaa |
| ad-dayyiq | الضيق | Aḑ Ḑayyiq | محافظة عمران | PPL | 80 | 9 | 97.20 | sanaa |
| mahwir | محوير | Maḩwīr | محافظة عمران | PPL | 80 | 4 | 97.69 | sanaa |
| baghdad | بغداد | Baghdād | محافظة عمران | PPL | 80 | 8 | 96.94 | sanaa |
| mahall-baqi-abu-shayiqah | محل باقي أبو شايقة | Maḩall Bāqī Abū Shāyiqah | محافظة عمران | PPL | 80 | 4 | 97.71 | sanaa |
| mahall-qasim-hammud-mas-ad | محل قاسم حمود مسعد | Maḩall Qāsim Ḩammūd Mas‘ad | محافظة عمران | PPL | 80 | 3 | 97.19 | sanaa |
| kawlat-salah | كولة صلاح | Kawlat Şalāḩ | محافظة عمران | PPL | 80 | 3 | 97.42 | sanaa |
| qasabat-matwan | قصبة مطون | Qaşabat Maţwan | محافظة عمران | PPL | 80 | 2 | 97.50 | sanaa |
| kawlat-ad-dawlah | كولة الدولة | Kawlat ad Dawlah | محافظة عمران | PPL | 80 | 4 | 97.38 | sanaa |
| al-husaybah | الحسيبة | Al Ḩusaybah | محافظة عمران | PPL | 80 | 3 | 97.05 | sanaa |
| qarn-zahirah | فرن زهرة | Qarn Zahirah | محافظة عمران | PPL | 80 | 5 | 92.53 | saada |
| mahall-as-sawad | محل السواد | Maḩall as Sawād | محافظة عمران | PPL | 80 | 3 | 92.81 | saada |
| al-mahwal | المحول | Al Maḩwal | محافظة عمران | PPL | 80 | 7 | 93.29 | saada |
| qarn-mani | قرن مانع | Qarn Māni‘ | محافظة عمران | PPL | 80 | 22 | 93.58 | saada |
| afra | عفراء | ‘Afrā’ | محافظة عمران | PPL | 80 | 2 | 93.89 | saada |
| al-mishyah | المشياح | Al Mishyāḩ | محافظة عمران | PPL | 80 | 2 | 92.76 | saada |
| zahrat | زهرات | Zahrāt | محافظة عمران | PPL | 80 | 2 | 92.75 | saada |
| kawlat-jamilah | كولة جميلة | Kawlat Jamīlah | محافظة عمران | PPL | 80 | 2 | 93.21 | saada |
| bayt-alwas | بيت علوس | Bayt ‘Alwas | محافظة عمران | PPL | 80 | 7 | 96.77 | saada |
| al-maruf | المعروف | Al Ma‘rūf | محافظة عمران | PPL | 80 | 1 | 96.80 | saada |
| bayt-yahya-rafi | بيت يحي رافع | Bayt Yaḩya Rāfi‘ | محافظة عمران | PPL | 80 | 2 | 96.38 | saada |
| al-manjarah | المنجارة | Al Manjārah | محافظة عمران | PPL | 80 | 47 | 81.45 | saada |
| ad-dabbah | الضبة | Aḑ Ḑabbah | محافظة عمران | PPL | 80 | 12 | 80.67 | saada |
| al-makhba | المخباء | Al Makhbā’ | محافظة عمران | PPL | 80 | 1 | 83.12 | saada |
| ad-darub | الدروب | Ad Darūb | محافظة عمران | PPL | 80 | 4 | 83.15 | saada |
| bayt-jabran | بيت جبران | Bayt Jabrān | محافظة عمران | PPL | 80 | 9 | 82.10 | saada |
| bayt-al-mandaliq | بيت المندليق | Bayt al Mandalīq | محافظة عمران | PPL | 80 | 17 | 81.97 | saada |
| al-quad | القعاد | Al Qu‘ād | محافظة عمران | PPL | 80 | 6 | 79.18 | saada |
| al-jabhah | الجبهة | Al Jabhah | محافظة عمران | PPL | 80 | 2 | 79.44 | saada |
| qarash | قـرش | Qarash | محافظة عمران | PPL | 80 | 1 | 81.60 | saada |
| bayt-tanin | بيت طنيـن | Bayt Tanīn | محافظة عمران | PPL | 80 | 24 | 82.46 | saada |
| al-tifa | الطفاء | Al Ţifā’ | محافظة عمران | PPL | 80 | 4 | 80.57 | saada |
| ghayl-mahsan | غيل محسن | Ghayl Maḩsan | محافظة عمران | PPL | 80 | 3 | 80.11 | saada |
| qa-al-wahad | قاع الوحـد | Qā‘ al Waḩad | محافظة عمران | PPL | 80 | 1 | 78.73 | saada |
| al-hafn | الحفـن | Al Ḩafn | محافظة عمران | PPL | 80 | 1 | 77.93 | saada |
| ad-dabr | الدبر | Ad Dabr | محافظة عمران | PPL | 80 | 6 | 80.72 | saada |
| al-khafish | الخافش | Al Khāfish | محافظة عمران | PPL | 80 | 6 | 80.23 | saada |
| bayt-durham | بيت درهم | Bayt Durham | محافظة عمران | PPL | 80 | 3 | 79.08 | saada |
| bayt-daqayn | بيت دعقين | Bayt Da‘qayn | محافظة عمران | PPL | 80 | 2 | 79.52 | saada |
| al-junayd | الجنيد | Al Junayd | محافظة عمران | PPL | 80 | 4 | 84.49 | saada |
| dhu-janis | ذو جانس | Dhū Jānis | محافظة عمران | PPL | 80 | 3 | 81.05 | saada |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة عمران | PPL | 80 | 12 | 82.07 | saada |
| halaqin | حلقين | Ḩalaqīn | محافظة عمران | PPL | 80 | 5 | 82.92 | saada |
| al-asharat | العشرات | Al ‘Asharāt | محافظة عمران | PPL | 80 | 4 | 83.07 | saada |
| bir-al-hallah | بير الحلة | Bi’r al Ḩallah | محافظة عمران | PPL | 80 | 2 | 83.30 | saada |
| mahall-at-tays | محل التيس | Maḩall at Tays | محافظة عمران | PPL | 80 | 3 | 84.28 | saada |
| majil-ash-shaykh | ماجل الشيخ | Mājil ash Shaykh | محافظة عمران | PPL | 80 | 3 | 82.55 | saada |
| al-marwah | المروة | Al Marwah | محافظة عمران | PPL | 80 | 4 | 82.15 | saada |
| al-midawwar | المدور | Al Midawwar | محافظة عمران | PPL | 80 | 3 | 82.60 | saada |
| darb-al-atl | درب العطل | Darb al ‘Aţl | محافظة عمران | PPL | 80 | 7 | 82.50 | saada |
| shaghir | شاغر | Shāghir | محافظة عمران | PPL | 80 | 3 | 83.97 | saada |
| dhu-ayyash | ذو عياش | Dhū ‘Ayyāsh | محافظة عمران | PPL | 80 | 7 | 81.36 | saada |
| bayt-al-faddali | بيت الفضلي | Bayt al Faḑḑalī | محافظة عمران | PPL | 80 | 11 | 85.57 | saada |
| al-qalah | القلعة | Al Qal‘ah | محافظة عمران | PPL | 80 | 3 | 85.52 | saada |
| ash-shar | الشرع | Ash Shar‘ | محافظة عمران | PPL | 80 | 1 | 85.46 | saada |
| al-qudayb | القضيب | Al Quḑayb | محافظة عمران | PPL | 80 | 1 | 85.45 | saada |
| al-quad | القعاد | Al Qu‘ād | محافظة عمران | PPL | 80 | 1 | 86.67 | saada |
| as-suq-al-ala | السوق الأعلى | As Sūq al A‘lá | محافظة عمران | PPL | 80 | 1 | 86.86 | saada |
| as-suq-al-asfal | السوق الأسفل | As Sūq al Asfal | محافظة عمران | PPL | 80 | 5 | 86.81 | saada |
| al-qarn | القرن | Al Qarn | محافظة عمران | PPL | 80 | 5 | 87.20 | saada |
| qarn-al-hayfi | قرن الحيفي | Qarn al Ḩayfī | محافظة عمران | PPL | 80 | 5 | 87.50 | saada |
| al-warah | الوعرة | Al Wa‘rah | محافظة عمران | PPL | 80 | 4 | 86.65 | saada |
| al-awdan | الأودان | Al Awdān | محافظة عمران | PPL | 80 | 1 | 87.80 | saada |
| bayt-al-araji | بيت العرجي | Bayt al ‘Arajī | محافظة عمران | PPL | 80 | 6 | 89.12 | saada |
| al-mabruqah | المبروقة | Al Mabrūqah | محافظة عمران | PPL | 80 | 6 | 88.89 | saada |
| al-wajd | الوجد | Al Wajd | محافظة عمران | PPL | 80 | 6 | 89.59 | saada |
| daws-an-naqil | دوس النقيل | Daws an Naqīl | محافظة عمران | PPL | 80 | 6 | 88.87 | saada |
| dakhmar | دخمر | Dakhmar | محافظة عمران | PPL | 80 | 4 | 89.38 | saada |
| gharib-ash-sharif | غارب الشريف | Ghārib ash Sharīf | محافظة عمران | PPL | 80 | 4 | 89.41 | saada |
| at-tawwi | الطوي | Aţ Ţawwī | محافظة عمران | PPL | 80 | 4 | 89.19 | saada |
| qusayb-atif | قصيب عاطف | Quşayb ‘Āţif | محافظة عمران | PPL | 80 | 3 | 89.99 | saada |
| al-jaww | الجو | Al Jaww | محافظة عمران | PPL | 80 | 3 | 90.03 | saada |
| ghalat-shunayf | غالة شنيف | Ghalat Shunayf | محافظة عمران | PPL | 80 | 1 | 89.66 | saada |
| sulb-dahmis | صلب دهمس | Şulb Dahmis | محافظة عمران | PPL | 80 | 1 | 89.68 | saada |
| hawbaj | هوبج | Hawbaj | محافظة عمران | PPL | 80 | 2 | 89.33 | saada |
| al-mikar | المكار | Al Mikār | محافظة عمران | PPL | 80 | 2 | 88.56 | saada |
| saqayat-sulayman | سقاية سليمان | Saqāyat Sulaymān | محافظة عمران | PPL | 80 | 2 | 88.64 | saada |
| ar-rajah | الرجاه | Ar Rajāh | محافظة عمران | PPL | 80 | 2 | 88.89 | saada |
| qusayb-awadi | قصيب عواضي | Quşayb ‘Awāḑī | محافظة عمران | PPL | 80 | 3 | 89.75 | saada |
| ar-rakin | الركن | Ar Rakin | محافظة عمران | PPL | 80 | 6 | 88.78 | saada |
| hurdu | هردو | Hurdū | محافظة عمران | PPL | 80 | 6 | 89.08 | saada |
| al-ghul-al-khariji | الغول الخارجي | Al Ghūl al Kharijī | محافظة عمران | PPL | 80 | 6 | 89.12 | saada |
| hibalah | هبالة | Hibālah | محافظة عمران | PPL | 80 | 3 | 87.06 | saada |
| udhr-ash-sharib | عذر الشارب | ‘Udhr ash Shārib | محافظة عمران | PPL | 80 | 9 | 89.38 | saada |
| al-hajuri | الحجوري | Al Ḩajūrī | محافظة عمران | PPL | 80 | 16 | 86.73 | saada |
| al-mihanah | المحانة | Al Miḩānah | محافظة عمران | PPL | 80 | 4 | 86.82 | saada |
| bayt-at-tawf | بيت الطـوف | Bayt aţ Ţawf | محافظة عمران | PPL | 80 | 4 | 88.01 | saada |
| ghayl-al-qushayb | غيل القشيب | Ghayl al Qushayb | محافظة عمران | PPL | 80 | 2 | 87.71 | saada |
| al-muktimah | المكتمـة | Al Muktimah | محافظة عمران | PPL | 80 | 6 | 87.36 | saada |
| al-hunayyah | الحنية | Al Ḩunayyah | محافظة عمران | PPL | 80 | 2 | 89.57 | saada |
| ras-as-sayil | رأس السايل | Ra’s as Sāyil | محافظة عمران | PPL | 80 | 2 | 90.08 | saada |
| bayt-awn | بيت عون | Bayt ‘Awn | محافظة عمران | PPL | 80 | 2 | 89.71 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة عمران | PPL | 80 | 6 | 87.03 | saada |
| al-muhajin | المحاجن | Al Muḩājin | محافظة عمران | PPL | 80 | 8 | 89.59 | saada |
| wathiq | وثيق | Wathīq | محافظة عمران | PPL | 80 | 1 | 89.28 | saada |
| ajdar | أجدار | Ajdār | محافظة عمران | PPL | 80 | 3 | 89.18 | saada |
| al-hayfah | الحيفة | Al Ḩayfah | محافظة عمران | PPL | 80 | 3 | 89.81 | saada |
| al-mahfadah | المحفدة | Al Maḩfadah | محافظة عمران | PPL | 80 | 5 | 89.95 | saada |
| al-mukhrijiyah | المخرجية | Al Mukhrijīyah | محافظة عمران | PPL | 80 | 5 | 89.81 | saada |
| bayt-as-silaf | بيت الصلاف | Bayt aş Şilāf | محافظة عمران | PPL | 80 | 1 | 86.76 | saada |
| al-qahirah | القهرة | Al Qahirah | محافظة عمران | PPL | 80 | 9 | 88.55 | saada |
| as-sabil | السابل | As Sābil | محافظة عمران | PPL | 80 | 3 | 85.87 | saada |
| ghayl-fali | غيل فلي | Ghayl Falī | محافظة عمران | PPL | 80 | 6 | 85.10 | saada |
| suq-ath-thuluth | سوق الثلوث | Sūq ath Thulūth | محافظة عمران | PPL | 80 | 33 | 90.62 | saada |
| al-kara | الكراع | Al Karā‘ | محافظة عمران | PPL | 80 | 19 | 90.40 | saada |
| hadadah | حدادة | Ḩadādah | محافظة لحج | PPLA2 | 80 | - | 52.66 | taiz |
| al-shiruj | الشروج | Al Shirūj | محافظة حضرموت | PPLA2 | 80 | - | 146.65 | mukalla |
| jawl-al-majma | جول المجمع | Jawl al Majma‘ | محافظة شبوة | PPLA2 | 80 | - | 192.44 | marib |
| suq-sibah | سوق سباح | Sūq Sibāḩ | محافظة أبين | PPLA2 | 80 | - | 121.34 | aden |
| al-hazm | الحزم | Al Ḩazm | محافظة البيضاء | PPLA2 | 80 | - | 91.89 | marib |
| al-aqta | الأقطع | Al Aqţa‘ | محافظة مأرب | PPLA2 | 80 | - | 89.60 | marib |
| az-zahirin | الظاهرين | Az̧ Z̧āhirīn | محافظة صعدة | PPL | 80 | 2 | 51.06 | saada |
| qullat-as-sarw | قلة السرو | Qullat as Sarw | محافظة صعدة | PPL | 80 | 6 | 40.51 | saada |
| al-marhah | المرحة | Al Marḩah | محافظة صعدة | PPL | 80 | 1 | 43.38 | saada |
| mashbah-az-zahi | مشباح الظهي | Mashbāḩ az̧ Z̧ahī | محافظة صعدة | PPL | 80 | 5 | 55.93 | saada |
| al-bajar | ال بجر | Āl Bajar | محافظة صعدة | PPL | 80 | 25 | 43.47 | saada |
| al-tiran | ال طيران | Āl Ţīrān | محافظة صعدة | PPL | 80 | 7 | 44.64 | saada |
| al-qarni | القرني | Al Qarnī | محافظة صعدة | PPL | 80 | 3 | 50.70 | saada |
| al-jumaim | الجمائم | Al Jumā’im | محافظة صعدة | PPL | 80 | 12 | 49.22 | saada |
| al-kharabah | الخرابة | Al Kharābah | محافظة صعدة | PPL | 80 | 4 | 49.91 | saada |
| as-sarw-al-asfal | السرو الأسفل | As Sarw al Asfal | محافظة صعدة | PPL | 80 | 11 | 54.44 | saada |
| as-sarw-al-ala | السرو الأعلى | As Sarw al A‘lá | محافظة صعدة | PPL | 80 | 3 | 54.55 | saada |
| al-amir | ال عامر | Āl ‘Āmir | محافظة صعدة | PPL | 80 | 4 | 45.08 | saada |
| bayt-al-akush | بيت العكوش | Bayt al ‘Akūsh | محافظة عمران | PPL | 80 | 3 | 83.35 | saada |
| samir | سامر | Sāmir | محافظة عمران | PPL | 80 | 5 | 81.63 | saada |
| al-jaws | الجوس | Al Jaws | محافظة عمران | PPL | 80 | 6 | 81.10 | saada |
| al-hait | الحائط | Al Ḩā’iţ | محافظة عمران | PPL | 80 | 11 | 81.21 | saada |
| al-kawmah | الكومــة | Al Kawmah | محافظة عمران | PPL | 80 | 3 | 81.33 | saada |
| bayt-al-matri | بيت المطري | Bayt al Maţrī | محافظة عمران | PPL | 80 | 15 | 81.28 | saada |
| madat | معداة | Ma‘dāt | محافظة عمران | PPL | 80 | 3 | 86.11 | saada |
| al-mikhrat | المخراط | Al Mikhrāţ | محافظة عمران | PPL | 80 | 9 | 82.40 | saada |
| al-qaryah | القرية | Al Qaryah | محافظة عمران | PPL | 80 | 2 | 82.11 | saada |
| al-hait | الحائط | Al Ḩā’iţ | محافظة عمران | PPL | 80 | 11 | 81.80 | saada |
| al-qayid | القايد | Al Qāyid | محافظة عمران | PPL | 80 | 4 | 82.93 | saada |
| bayt-shiraah | بيت شراعة | Bayt Shirā‘ah | محافظة عمران | PPL | 80 | 8 | 82.72 | saada |
| bayt-az-zawab | بيت الزوب | Bayt az Zawab | محافظة عمران | PPL | 80 | 4 | 82.36 | saada |
| qaryat-ash-shami | قرية الشامـي | Qaryat ash Shāmī | محافظة عمران | PPL | 80 | 5 | 83.50 | saada |
| al-qaryah-al-asliyah | القرية الأصليـة | Al Qaryah al Aşlīyah | محافظة عمران | PPL | 80 | 8 | 83.39 | saada |
| bin-al-kharab | بن الخراب | Bin al Kharāb | محافظة عمران | PPL | 80 | 17 | 83.16 | saada |
| majil-al-maghrabah | ماجل المغربـة | Mājil al Maghrabah | محافظة عمران | PPL | 80 | 1 | 83.44 | saada |
| al-hiyaf | الحيـاف | Al Ḩiyāf | محافظة عمران | PPL | 80 | 9 | 83.03 | saada |
| atran | عطران | ‘Aţrān | محافظة عمران | PPL | 80 | 3 | 88.38 | saada |
| al-maslakh | المسلخ | Al Maslakh | محافظة عمران | PPL | 80 | 2 | 89.01 | saada |
| al-amarah | العمارة | Al ‘Amārah | محافظة عمران | PPL | 80 | 2 | 88.90 | saada |
| dawghal | دوغل | Dawghal | محافظة عمران | PPL | 80 | 3 | 88.93 | saada |
| al-kadhah | الكدحـة | Al Kadḩah | محافظة عمران | PPL | 80 | 1 | 89.38 | saada |
| ash-shudayn | الشدين | Ash Shudayn | محافظة عمران | PPL | 80 | 1 | 89.29 | saada |
| al-markun | المركون | Al Markūn | محافظة عمران | PPL | 80 | 2 | 89.28 | saada |
| duluq | دلق | Duluq | محافظة عمران | PPL | 80 | 1 | 89.43 | saada |
| jiz-ad-darah | جزع الدارة | Jiz‘ ad Dārah | محافظة عمران | PPL | 80 | 2 | 89.53 | saada |
| at-tawfah | الطوفة | Aţ Ţawfah | محافظة عمران | PPL | 80 | 6 | 93.60 | saada |
| bayt-al-kawlah | بيت الكولة | Bayt al Kawlah | محافظة عمران | PPL | 80 | 4 | 93.57 | saada |
| al-hizwan | الحزون | Al Ḩizwan | محافظة عمران | PPL | 80 | 1 | 92.64 | saada |
| hujayrah | حجيرة | Ḩujayrah | محافظة عمران | PPL | 80 | 1 | 92.43 | saada |
| ash-sharyah | الشرية | Ash Sharyah | محافظة عمران | PPL | 80 | 1 | 86.50 | saada |
| bayt-al-aswad | بيت الأسود | Bayt al Aswad | محافظة عمران | PPL | 80 | 1 | 86.55 | saada |
| al-birqah | البرقة | Al Birqah | محافظة عمران | PPL | 80 | 1 | 87.17 | saada |
| udhra-ash-sharqi | عذرى الشرقي | ‘Udhrá ash Sharqī | محافظة عمران | PPL | 80 | 1 | 87.19 | saada |
| ishash | عشاش | ‘Ishāsh | محافظة عمران | PPL | 80 | 1 | 86.78 | saada |
| amarah | عمارة | ‘Amārah | محافظة عمران | PPL | 80 | 1 | 86.27 | saada |
| al-farrah | الفرة | Al Farrah | محافظة عمران | PPL | 80 | 15 | 86.62 | saada |
| al-jumayim | الجمايم | Al Jumāyim | محافظة عمران | PPL | 80 | 3 | 88.28 | saada |
| al-aridah | العارضة | Al ‘Āriḑah | محافظة عمران | PPL | 80 | 4 | 86.24 | saada |
| ad-dukhrah | الدخرة | Ad Dukhrah | محافظة عمران | PPL | 80 | 6 | 90.35 | saada |
| as-sabah-as-sufla | الصابة السفلى | Aş Şābah as Suflá | محافظة عمران | PPL | 80 | 7 | 90.51 | saada |
| as-sabah | الصابة | Aş Şābah | محافظة عمران | PPL | 80 | 41 | 89.80 | saada |
| al-mirabid | المرابض | Al Mirābiḑ | محافظة عمران | PPL | 80 | 10 | 92.54 | saada |
| al-munashin | المناشن | Al Munāshin | محافظة عمران | PPL | 80 | 2 | 91.18 | saada |
| al-hait | الحائط | Al Ḩā’iţ | محافظة عمران | PPL | 80 | 4 | 83.96 | saada |
| ash-shaqqah | الشقة | Ash Shaqqah | محافظة عمران | PPL | 80 | 2 | 83.91 | saada |
| bayt-harawah | بيت هراوة | Bayt Harāwah | محافظة عمران | PPL | 80 | 2 | 85.05 | saada |
| akhal | أكحال | Akḩāl | محافظة عمران | PPL | 80 | 5 | 84.83 | saada |
| ghayl-jafar | غيل جعفر | Ghayl Ja‘far | محافظة عمران | PPL | 80 | 2 | 84.90 | saada |
| al-bayt-al-ala | البيت الأعلى | Al Bayt al A‘lá | محافظة عمران | PPL | 80 | 3 | 83.89 | saada |
| asfal-an-nahr | أسفل النحر | Asfal an Naḩr | محافظة عمران | PPL | 80 | 1 | 85.00 | saada |
| bayt-as-sultan | بيت السلطان | Bayt as Sulţān | محافظة عمران | PPL | 80 | 2 | 84.01 | saada |
| bayt-al-isa | بيت العيسى | Bayt al ‘Īsá | محافظة عمران | PPL | 80 | 8 | 83.55 | saada |
| al-hala | الحلاء | Al Ḩalā’ | محافظة عمران | PPL | 80 | 2 | 93.38 | sanaa |
| asfal-ajwan | أسفل عجوان | Asfal ‘Ajwān | محافظة عمران | PPL | 80 | 3 | 93.22 | sanaa |
| al-qahirah | القاهرة | Al Qāhirah | محافظة عمران | PPL | 80 | 3 | 94.24 | sanaa |
| mararah | مرارة | Marārah | محافظة عمران | PPL | 80 | 1 | 94.39 | sanaa |
| al-qara | القرعاء | Al Qar‘ā’ | محافظة عمران | PPL | 80 | 3 | 96.89 | sanaa |
| hawashi-rajab | حواشي رجب | Ḩawāshī Rajab | محافظة عمران | PPL | 80 | 1 | 97.33 | sanaa |
| al-adnah | العدنة | Al ‘Adnah | محافظة عمران | PPL | 80 | 11 | 96.32 | sanaa |
| hadabat-salma | حدبة سلمـى | Ḩadabat Salmá | محافظة عمران | PPL | 80 | 3 | 96.91 | sanaa |
| al-kawlah | الكولة | Al Kawlah | محافظة عمران | PPL | 80 | 4 | 96.31 | sanaa |
| al-gharib | الغارب | Al Ghārib | محافظة عمران | PPL | 80 | 4 | 94.74 | sanaa |
| al-kawlah | الكولة | Al Kawlah | محافظة عمران | PPL | 80 | 5 | 93.61 | sanaa |
| al-hadabah | الحدبة | Al Ḩadabah | محافظة عمران | PPL | 80 | 1 | 91.83 | sanaa |
| al-karsh | الكرش | Al Karsh | محافظة عمران | PPL | 80 | 6 | 94.08 | saada |
| ghanamah | غنامة | Ghanāmah | محافظة عمران | PPL | 80 | 3 | 95.71 | saada |
| ad-dahshi | الدحشي | Ad Daḩshī | محافظة عمران | PPL | 80 | 12 | 95.08 | saada |
| darb-al-liwa | درب اللواء | Darb al Liwā’ | محافظة عمران | PPL | 80 | 1 | 90.97 | sanaa |
| adhir-hidha | عاذر حذاء | ‘Ādhir Ḩidhā’ | محافظة عمران | PPL | 80 | 7 | 91.28 | sanaa |
| ad-dawsira | الدوسرى | Ad Dawsirá | محافظة عمران | PPL | 80 | 1 | 91.96 | sanaa |
| al-maghrabah | المغربة | Al Maghrabah | محافظة عمران | PPL | 80 | 2 | 92.19 | sanaa |
| al-hudayrah | الحضيرة | Al Ḩuḑayrah | محافظة عمران | PPL | 80 | 3 | 91.54 | sanaa |
| ar-rahab-al-asfal | الرهب الأسفل | Ar Rahab al Asfal | محافظة عمران | PPL | 80 | 2 | 92.17 | sanaa |
| ar-rahab-al-ala | الرهب الأعلى | Ar Rahab al A‘lá | محافظة عمران | PPL | 80 | 2 | 92.18 | sanaa |
| al-hijlah | الحجلة | Al Ḩijlah | محافظة عمران | PPL | 80 | 7 | 92.51 | sanaa |
| ash-shiab | الشعاب | Ash Shi‘āb | محافظة عمران | PPL | 80 | 4 | 92.13 | sanaa |
| al-irqah | العرقـة | Al ‘Irqah | محافظة عمران | PPL | 80 | 3 | 92.44 | sanaa |
| shaybah | شيبــة | Shaybah | محافظة عمران | PPL | 80 | 4 | 96.08 | sanaa |
| al-haqqah | الحقــة | Al Ḩaqqah | محافظة عمران | PPL | 80 | 2 | 94.25 | sanaa |
| al-qusayb | القصيب | Al Quşayb | محافظة عمران | PPL | 80 | 3 | 96.15 | sanaa |
| ad-dimnah | الدمنة | Ad Dimnah | محافظة عمران | PPL | 80 | 1 | 95.77 | saada |
| jawaf | جاوف | Jāwaf | محافظة عمران | PPL | 80 | 1 | 95.72 | saada |
| ghallat-at-tirab | غلة التراب | Ghallat at Tirāb | محافظة عمران | PPL | 80 | 1 | 95.19 | sanaa |
| al-maqta | المقطع | Al Maqţa‘ | محافظة عمران | PPL | 80 | 1 | 95.05 | sanaa |
| dhayfan | ذيفان | Dhayfān | محافظة عمران | PPL | 80 | 1 | 95.22 | sanaa |
| al-jawsha | الجوشعى | Al Jawsh‘á | محافظة عمران | PPL | 80 | 1 | 95.80 | sanaa |
| sawfan | صوفان | Şawfān | محافظة عمران | PPL | 80 | 1 | 95.84 | sanaa |
| as-silah | الصلة | Aş Şilah | محافظة عمران | PPL | 80 | 1 | 93.54 | sanaa |
| al-madhyabi | المذيابي | Al Madhyābī | محافظة عمران | PPL | 80 | 7 | 93.07 | sanaa |
| malhan | ملحان | Malḩān | محافظة عمران | PPL | 80 | 8 | 93.01 | sanaa |
| ash-shajah | الشجعة | Ash Shaj‘ah | محافظة عمران | PPL | 80 | 11 | 93.44 | sanaa |
| al-maghrabah | المغربة | Al Maghrabah | محافظة عمران | PPL | 80 | 5 | 93.44 | sanaa |
| suq-al-khayr | سوق الخير | Sūq al Khayr | محافظة عمران | PPL | 80 | 11 | 93.98 | sanaa |
| as-sawda | السودى | As Sawdá | محافظة عمران | PPL | 80 | 4 | 93.46 | sanaa |
| al-gharbi | الغربي | Al Gharbī | محافظة عمران | PPL | 80 | 5 | 93.59 | sanaa |
| ash-shar | الشرع | Ash Shar‘ | محافظة عمران | PPL | 80 | 1 | 95.05 | sanaa |
| al-mazmiyah | المظمية | Al Maz̧mīyah | محافظة عمران | PPL | 80 | 8 | 94.99 | sanaa |
| ar-rahabah | الرحبة | Ar Raḩabah | محافظة عمران | PPL | 80 | 25 | 91.44 | sanaa |
| al-musayr | المسير | Al Musayr | محافظة عمران | PPL | 80 | 21 | 91.37 | sanaa |
| hisn-al-ahmar | حصن الأحمر | Ḩişn al Aḩmar | محافظة عمران | PPL | 80 | 11 | 91.40 | sanaa |
| shutayfan | شطيفان | Shuţayfān | محافظة عمران | PPL | 80 | 2 | 92.21 | sanaa |
| al-manqam | المنقـم | Al Manqam | محافظة عمران | PPL | 80 | 5 | 93.10 | sanaa |
| al-lisan | اللسان | Al Lisān | محافظة عمران | PPL | 80 | 1 | 92.63 | sanaa |
| qawan | قعوان | Qa‘wān | محافظة عمران | PPL | 80 | 1 | 93.66 | sanaa |
| diyam-dalghus | ديام دلغوص | Diyām Dalghūş | محافظة عمران | PPL | 80 | 1 | 91.78 | sanaa |
| darb-al-halas | درب الحلص | Darb al Ḩalaş | محافظة عمران | PPL | 80 | 1 | 85.55 | sanaa |
| al-hawwi | الحوي | Al Ḩawwī | محافظة عمران | PPL | 80 | 1 | 85.29 | sanaa |
| al-hiraqi | الحراقى | Al Ḩirāqī | محافظة عمران | PPL | 80 | 1 | 86.07 | sanaa |
| shatt-ar-razz | شط الرز | Shaţţ ar Razz | محافظة عمران | PPL | 80 | 2 | 88.14 | sanaa |
| al-jurrah | الجرة | Al Jurrah | محافظة عمران | PPL | 80 | 4 | 88.65 | sanaa |
| al-miradah | المعراضة | Al Mi‘rāḑah | محافظة عمران | PPL | 80 | 5 | 88.42 | sanaa |
| shatt-salim | شط سالم | Shaţţ Sālim | محافظة عمران | PPL | 80 | 4 | 88.07 | sanaa |
| al-qaza | القزعى | Al Qaz‘á | محافظة عمران | PPL | 80 | 2 | 89.22 | sanaa |
| al-madur | المدور | Al Madūr | محافظة عمران | PPL | 80 | 7 | 88.13 | sanaa |
| wasat-al-jaww | وسط الجو | Wasaţ al Jaww | محافظة عمران | PPL | 80 | 4 | 87.79 | sanaa |
| bab-al-jaww | باب الجو | Bāb al Jaww | محافظة عمران | PPL | 80 | 1 | 87.81 | sanaa |
| zibunah | زبونة | Zibūnah | محافظة عمران | PPL | 80 | 6 | 87.62 | sanaa |
| asfal-al-majil | أسفل الماجل | Asfal al Mājil | محافظة عمران | PPL | 80 | 1 | 86.32 | sanaa |
| an-nawah | النوعة | An Naw‘ah | محافظة عمران | PPL | 80 | 3 | 91.06 | sanaa |
| al-marka | المركع | Al Marka‘ | محافظة عمران | PPL | 80 | 2 | 86.23 | sanaa |
| qumayhirah | قميهدة | Qumayhirah | محافظة عمران | PPL | 80 | 1 | 92.43 | sanaa |
| qahrah | قهـرة | Qahrah | محافظة عمران | PPL | 80 | 17 | 93.09 | saada |
| al-wakifah | الواكفـة | Al Wākifah | محافظة عمران | PPL | 80 | 5 | 91.63 | saada |
| al-qardai | القرداعي | Al Qardā‘ī | محافظة عمران | PPL | 80 | 1 | 94.78 | sanaa |
| an-nuqayl | النقيل | An Nuqayl | محافظة عمران | PPL | 80 | 3 | 93.58 | saada |
| bayt-al-mahras | بيت المحرس | Bayt al Maḩras | محافظة عمران | PPL | 80 | 3 | 93.88 | sanaa |
| al-kurbat | الكربات | Al Kurbāt | محافظة عمران | PPL | 80 | 2 | 93.23 | saada |
| ad-darah | الدارة | Ad Dārah | محافظة عمران | PPL | 80 | 2 | 92.09 | saada |
| al-khurshibah | الخرشبة | Al Khurshibah | محافظة عمران | PPL | 80 | 1 | 92.20 | saada |
| al-hiyaf | الحياف | Al Ḩiyāf | محافظة عمران | PPL | 80 | 2 | 93.86 | sanaa |
| al-jallah | الجلة | Al Jallah | محافظة عمران | PPL | 80 | 2 | 93.84 | sanaa |
| bayt-sulayman | بيت سليمان | Bayt Sulaymān | محافظة عمران | PPL | 80 | 3 | 93.54 | sanaa |
| as-sufayh | الصفيح | Aş Şufayḩ | محافظة عمران | PPL | 80 | 1 | 94.61 | saada |
| al-waqab | الوقب | Al Waqab | محافظة عمران | PPL | 80 | 2 | 94.70 | saada |
| darb-saqr | درب صقر | Darb Şaqr | محافظة عمران | PPL | 80 | 2 | 94.18 | sanaa |
| hiwaz-sulayman | حواز سليمان | Ḩiwāz Sulaymān | محافظة عمران | PPL | 80 | 5 | 94.20 | saada |
| fawq-al-amish | فوق العمش | Fawq al ‘Amish | محافظة عمران | PPL | 80 | 6 | 94.06 | saada |
| ad-darah | الدارة | Ad Dārah | محافظة عمران | PPL | 80 | 1 | 91.33 | saada |
| al-mafhi | المفحي | Al Mafḩī | محافظة عمران | PPL | 80 | 8 | 94.96 | sanaa |
| ash-shirwa | الشروع | Ash Shirwa‘ | محافظة عمران | PPL | 80 | 5 | 94.72 | saada |
| shar-hamzah | شرع حمزة | Shar‘ Ḩamzah | محافظة عمران | PPL | 80 | 4 | 94.95 | saada |
| al-kubab | الكبب | Al Kubab | محافظة عمران | PPL | 80 | 2 | 93.62 | saada |
| al-jinah | الجناح | Al Jināḩ | محافظة عمران | PPL | 80 | 4 | 95.06 | sanaa |
| kharab-al-haji | خراب الحجي | Kharāb al Ḩajī | محافظة عمران | PPL | 80 | 1 | 95.14 | sanaa |
| utbah | عتبة | ‘Utbah | محافظة عمران | PPL | 80 | 3 | 94.17 | saada |
| ad-darb | الدرب | Ad Darb | محافظة عمران | PPL | 80 | 2 | 93.38 | saada |
| aqabat-ath-thawr | عقبة الثور | ‘Aqabat ath Thawr | محافظة عمران | PPL | 80 | 2 | 93.23 | saada |
| al-kawlah | الكولة | Al Kawlah | محافظة عمران | PPL | 80 | 8 | 94.22 | saada |
| al-madghar | المدغر | Al Madghar | محافظة عمران | PPL | 80 | 2 | 94.84 | saada |
| al-fursah | الفرصة | Al Furşah | محافظة عمران | PPL | 80 | 4 | 91.10 | saada |
| al-fad | الفدع | Al Fad‘ | محافظة عمران | PPL | 80 | 6 | 91.02 | saada |
| al-maghdhur | المغذور | Al Maghdhūr | محافظة عمران | PPL | 80 | 1 | 93.43 | saada |
| bayt-hadi | بيت هادي | Bayt Hādī | محافظة عمران | PPL | 80 | 1 | 93.84 | saada |
| al-waqab | الوقب | Al Waqab | محافظة عمران | PPL | 80 | 1 | 93.89 | sanaa |
| ar-rajjah | الرجة | Ar Rajjah | محافظة عمران | PPL | 80 | 1 | 91.88 | sanaa |
| hisn-ash-shajnah | حصن الشجنة | Ḩişn ash Shajnah | محافظة عمران | PPL | 80 | 1 | 91.54 | sanaa |
| al-hadan | الحضن | Al Ḩaḑan | محافظة عمران | PPL | 80 | 1 | 91.85 | sanaa |
| al-qism | القسم | Al Qism | محافظة عمران | PPL | 80 | 1 | 92.12 | sanaa |
| al-hishwah | الحشوة | Al Ḩishwah | محافظة عمران | PPL | 80 | 3 | 91.67 | sanaa |
| darb-al-harithi | درب الحارثي | Darb al Ḩārithī | محافظة عمران | PPL | 80 | 1 | 91.61 | sanaa |
| hayd-asad | حيد أسعد | Ḩayd As‘ad | محافظة عمران | PPL | 80 | 9 | 90.59 | sanaa |
| al-gharrah | الغرة | Al Gharrah | محافظة عمران | PPL | 80 | 2 | 90.81 | sanaa |
| hayfat-jaman | حيقة جمعان | Ḩayfat Jam‘ān | محافظة عمران | PPL | 80 | 1 | 90.90 | sanaa |
| hisn-al-hayj | حصن الهيج | Ḩişn al Hayj | محافظة عمران | PPL | 80 | 2 | 90.73 | sanaa |
| al-maghrabah | المغربة | Al Maghrabah | محافظة عمران | PPL | 80 | 1 | 91.30 | sanaa |
| al-mizab | المعزاب | Al Mi‘zāb | محافظة عمران | PPL | 80 | 9 | 91.40 | sanaa |
| ajlan | عجلان | ‘Ajlān | محافظة عمران | PPL | 80 | 2 | 89.61 | sanaa |
| al-hudayrah | الحضيرة | Al Ḩuḑayrah | محافظة عمران | PPL | 80 | 1 | 89.40 | sanaa |
| zuhayrat-muayd | ظهيرة معيض | Z̧uhayrat Mu‘ayḑ | محافظة عمران | PPL | 80 | 2 | 89.62 | sanaa |
| ghawl-ad-darb | غول الدرب | Ghawl ad Darb | محافظة عمران | PPL | 80 | 1 | 88.88 | sanaa |
| al-ghawl-al-asfal | الغول الأسفل | Al Ghawl al Asfal | محافظة عمران | PPL | 80 | 1 | 89.03 | sanaa |
| al-quflah | القفلــة | Al Quflah | محافظة عمران | PPL | 80 | 2 | 88.99 | sanaa |
| al-maghrabah | المغربة | Al Maghrabah | محافظة عمران | PPL | 80 | 2 | 92.23 | sanaa |
| ash-sharyah-al-ulya | الشرية العليا | Ash Sharyah al ‘Ulyā | محافظة عمران | PPL | 80 | 1 | 92.81 | sanaa |
| ash-sharyah-as-sufla | الشرية السفلى | Ash Sharyah as Suflá | محافظة عمران | PPL | 80 | 1 | 93.43 | sanaa |
| ghallat-suwaydan | غلة سويدان | Ghallat Suwaydān | محافظة عمران | PPL | 80 | 2 | 96.73 | sanaa |
| dalat-zaynab | ضلعة زينب | Ḑal‘at Zaynab | محافظة عمران | PPL | 80 | 8 | 95.16 | sanaa |
| at-tawaqir | التواقر | At Tawāqir | محافظة عمران | PPL | 80 | 2 | 92.53 | sanaa |
| al-madhbah | المذبح | Al Madhbaḩ | محافظة عمران | PPL | 80 | 4 | 96.47 | sanaa |
| al-haqqah | الحقة | Al Ḩaqqah | محافظة عمران | PPL | 80 | 2 | 95.74 | sanaa |
| bani-nuzayl | بني نزيل | Banī Nuzayl | محافظة عمران | PPL | 80 | 3 | 93.00 | sanaa |
| jallat-as-sarhi | جلة الصرحـي | Jallat aş Şarḩī | محافظة عمران | PPL | 80 | 2 | 92.74 | sanaa |
| al-qafi | القافع | Al Qāfi‘ | محافظة عمران | PPL | 80 | 5 | 92.22 | sanaa |
| al-asirah | العصرة | Al ‘Aşirah | محافظة عمران | PPL | 80 | 3 | 91.93 | sanaa |
| ath-thaminah | الثامنة | Ath Thāminah | محافظة عمران | PPL | 80 | 1 | 92.77 | sanaa |
| al-misbah | المسبح | Al Misbaḩ | محافظة عمران | PPL | 80 | 1 | 92.94 | sanaa |
| darb-ash-shasha | درب الشعشع | Darb ash Sha‘sha‘ | محافظة عمران | PPL | 80 | 1 | 91.23 | sanaa |
| ar-rajmah | الرجمة | Ar Rajmah | محافظة عمران | PPL | 80 | 1 | 90.48 | sanaa |
| maghrabat-al-hadi | مغربة الهادى | Maghrabat al Hādī | محافظة عمران | PPL | 80 | 1 | 92.08 | sanaa |
| al-ghaysh | الغيش | Al Ghaysh | محافظة عمران | PPL | 80 | 10 | 90.56 | sanaa |
| darb-razih | درب رازح | Darb Rāziḩ | محافظة عمران | PPL | 80 | 1 | 91.99 | sanaa |
| al-ghuwayrah | الغويرة | Al Ghuwayrah | محافظة عمران | PPL | 80 | 2 | 92.02 | sanaa |
| al-hawal | الحول | Al Ḩawal | محافظة عمران | PPL | 80 | 2 | 92.29 | sanaa |
| ad-dami | الدامع | Ad Dāmi‘ | محافظة عمران | PPL | 80 | 1 | 91.71 | sanaa |
| al-gharrah | الغرة | Al Gharrah | محافظة عمران | PPL | 80 | 2 | 93.10 | sanaa |
| al-maqtar | المقطر | Al Maqţar | محافظة عمران | PPL | 80 | 1 | 93.36 | sanaa |
| al-jawaz | الجواز | Al Jawāz | محافظة عمران | PPL | 80 | 2 | 90.72 | sanaa |
| hadiyat-al-qutaybah | حدية القطبية | Ḩadīyat al Quţaybah | محافظة حجة | PPL | 80 | 3 | 95.65 | sanaa |
| gharb-shirah | غرب شراح | Gharb Shirāḩ | محافظة حجة | PPL | 80 | 28 | 94.90 | sanaa |
| at-tarifah | الطارفـة | Aţ Ţārifah | محافظة حجة | PPL | 80 | 21 | 94.76 | sanaa |
| imsah | إمصاح | Imşāḩ | محافظة صعدة | PPL | 80 | 14 | 74.27 | saada |
| khushban | خشبان | Khushbān | محافظة صعدة | PPL | 80 | 10 | 75.32 | saada |
| al-jurb-al-qabr | الجرب القبر | Al Jurb al Qabr | محافظة صعدة | PPL | 80 | 24 | 75.08 | saada |
| al-bitahi | البطاحي | Al Biţāḩī | محافظة صعدة | PPL | 80 | 1 | 74.41 | saada |
| al-masqat | المسقط | Al Masqaţ | محافظة صعدة | PPL | 80 | 2 | 75.15 | saada |
| al-hitawir | الحطاور | Al Ḩiţāwir | محافظة صعدة | PPL | 80 | 2 | 79.06 | saada |
| as-sawmilah | الصوملة | Aş Şawmilah | محافظة صعدة | PPL | 80 | 1 | 77.97 | saada |
| al-hamrat | الحمرات | Al Ḩamrāt | محافظة صعدة | PPL | 80 | 1 | 77.72 | saada |
| al-matan | المعطن | Al Ma‘ţan | محافظة صعدة | PPL | 80 | 2 | 77.78 | saada |
| al-juhfa | الجحفاء | Al Juḩfā’ | محافظة صعدة | PPL | 80 | 1 | 78.08 | saada |
| al-ghayirah | الغايرة | Al Ghāyirah | محافظة صعدة | PPL | 80 | 2 | 79.64 | saada |
| al-jumaymah | الجميمة | Al Jumaymah | محافظة صعدة | PPL | 80 | 2 | 79.84 | saada |
| kulayib | كلايب | Kulāyib | محافظة صعدة | PPL | 80 | 2 | 81.00 | saada |
| samrad | سمرد | Samrad | محافظة صعدة | PPL | 80 | 1 | 80.98 | saada |
| shuwahit | شواحط | Shuwāḩiţ | محافظة صعدة | PPL | 80 | 2 | 80.46 | saada |
| al-karanah | الكرانة | Al Karānah | محافظة صعدة | PPL | 80 | 1 | 80.55 | saada |
| al-kharashib-al-asfal | الخراشب الأسفل | Al Kharāshib al Asfal | محافظة صعدة | PPL | 80 | 1 | 80.86 | saada |
| al-mawtad | الموتد | Al Mawtad | محافظة صعدة | PPL | 80 | 1 | 81.13 | saada |
| ajr | عجر | ‘Ajr | محافظة صعدة | PPL | 80 | 3 | 80.86 | saada |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة عمران | PPL | 80 | 3 | 84.17 | saada |
| dahyah | دحية | Daḩyah | محافظة عمران | PPL | 80 | 4 | 83.31 | saada |
| kharab-ash-shaqaf | خراب الشقف | Kharāb ash Shaqaf | محافظة عمران | PPL | 80 | 1 | 85.06 | saada |
| al-mirsabah | المرسابة | Al Mirsābah | محافظة عمران | PPL | 80 | 1 | 85.15 | saada |
| qa-al-madan | قاع المدان | Qā‘ al Madān | محافظة عمران | PPL | 80 | 8 | 87.54 | saada |
| al-ghamar | الغمار | Al Ghamār | محافظة عمران | PPL | 80 | 3 | 78.28 | saada |
| al-manqar | المنقر | Al Manqar | محافظة عمران | PPL | 80 | 31 | 80.11 | saada |
| al-ghumar | الغمار | Al Ghumār | محافظة عمران | PPL | 80 | 36 | 80.02 | saada |
| al-manas | المنـس | Al Manas | محافظة عمران | PPL | 80 | 15 | 83.27 | saada |
| ar-rumaid | الرمائد | Ar Rumā’id | محافظة عمران | PPL | 80 | 6 | 84.40 | saada |
| masadah | مسعدة | Mas‘adah | محافظة عمران | PPL | 80 | 1 | 80.16 | saada |
| birkat-al-hasan | بركة الحسن | Birkat al Ḩasan | محافظة عمران | PPL | 80 | 3 | 80.26 | saada |
| bayt-al-humaydi | بيت الحميدي | Bayt al Ḩumaydī | محافظة عمران | PPL | 80 | 10 | 81.01 | saada |
| as-sifha | الصفحاء | Aş Şifḩā’ | محافظة عمران | PPL | 80 | 9 | 80.05 | saada |
| al-mahdi | المهدي | Al Mahdī | محافظة عمران | PPL | 80 | 5 | 80.53 | saada |
| dhi-awsijah | ذي عوسجـة | Dhī ‘Awsijah | محافظة عمران | PPL | 80 | 8 | 80.48 | saada |
| as-siratih | الصراطـح | Aş Şirāţiḩ | محافظة عمران | PPL | 80 | 9 | 80.18 | saada |
| ash-shawhiti | الشوحطي | Ash Shawḩiţī | محافظة عمران | PPL | 80 | 2 | 90.00 | saada |
| al-mawzirah | الموزرة | Al Mawzirah | محافظة عمران | PPL | 80 | 5 | 90.76 | saada |
| aqbal | أقبال | Aqbāl | محافظة عمران | PPL | 80 | 8 | 88.15 | saada |
| al-hajjah | الهجة | Al Hajjah | محافظة عمران | PPL | 80 | 6 | 88.03 | saada |
| darb-shabih | درب شابح | Darb Shābiḩ | محافظة عمران | PPL | 80 | 23 | 88.67 | saada |
| dhu-wafiz | ذو وفيـز | Dhū Wafīz | محافظة عمران | PPL | 80 | 14 | 87.01 | saada |
| dhu-amir | ذو عامـر | Dhū ‘Āmir | محافظة عمران | PPL | 80 | 2 | 87.12 | saada |
| hadabat-al-jash | حدبة الجش | Ḩadabat al Jash | محافظة عمران | PPL | 80 | 3 | 89.31 | saada |
| hadiyat-al-birr | حدية البر | Ḩadīyat al Birr | محافظة عمران | PPL | 80 | 5 | 89.76 | saada |
| al-khalb | الخلب | Al Khalb | محافظة عمران | PPL | 80 | 12 | 89.32 | saada |
| gharib-as-sawad | غارب السواد | Ghārib as Sawād | محافظة عمران | PPL | 80 | 12 | 88.92 | saada |
| az-zakiyah | الزكيـة | Az Zakīyah | محافظة عمران | PPL | 80 | 1 | 90.03 | saada |
| alat-yimani | عالـة يمانـي | ‘Ālat Yimānī | محافظة عمران | PPL | 80 | 2 | 90.10 | saada |
| darb-qahman | ضرب قحمـان | Ḑarb Qaḩmān | محافظة عمران | PPL | 80 | 3 | 90.22 | saada |
| kharab-tamish | خراب طامش | Kharāb Ţāmish | محافظة عمران | PPL | 80 | 15 | 91.03 | saada |
| hadiyat-ad-dimar | حدية الضمار | Ḩadīyat aḑ Ḑimār | محافظة عمران | PPL | 80 | 17 | 89.59 | saada |
| ar-rusaysah | الرسيسة | Ar Rusaysah | محافظة عمران | PPL | 80 | 1 | 91.12 | saada |
| al-irq | العرق | Al ‘Irq | محافظة عمران | PPL | 80 | 1 | 92.60 | sanaa |
| al-madarah | المدارة | Al Madārah | محافظة عمران | PPL | 80 | 5 | 93.87 | sanaa |
| al-hudayrah | الحضيرة | Al Ḩuḑayrah | محافظة عمران | PPL | 80 | 1 | 94.06 | sanaa |
| ash-shibak | الشباك | Ash Shibāk | محافظة عمران | PPL | 80 | 1 | 94.03 | sanaa |
| al-mamlihah | المملحة | Al Mamliḩah | محافظة عمران | PPL | 80 | 1 | 93.93 | sanaa |
| al-aridah | العارضة | Al ‘Āriḑah | محافظة عمران | PPL | 80 | 2 | 94.20 | saada |
| al-awshah | العوشة | Al ‘Awshah | محافظة عمران | PPL | 80 | 3 | 94.26 | saada |
| daqlah | داقلة | Dāqlah | محافظة عمران | PPL | 80 | 3 | 94.46 | sanaa |
| darb-saud | درب سعود | Darb Sa‘ūd | محافظة عمران | PPL | 80 | 3 | 94.50 | saada |
| ad-dirwa | الضرواء | Aḑ Ḑirwā’ | محافظة عمران | PPL | 80 | 1 | 93.74 | saada |
| al-qabli | القبلي | Al Qablī | محافظة عمران | PPL | 80 | 2 | 94.50 | saada |
| ar-ruqbah | الرقبة | Ar Ruqbah | محافظة عمران | PPL | 80 | 1 | 93.04 | sanaa |
| dalat-al-buraykah | ضلعة البريكة | Ḑal‘at al Buraykah | محافظة عمران | PPL | 80 | 1 | 94.62 | sanaa |
| al-qazi | القزعـي | Al Qaz‘ī | محافظة عمران | PPL | 80 | 6 | 92.65 | saada |
| al-qazi | القزعي | Al Qaz‘ī | محافظة عمران | PPL | 80 | 2 | 93.89 | sanaa |
| an-naqah | النقعة | An Naq‘ah | محافظة عمران | PPL | 80 | 2 | 94.64 | sanaa |
| al-muhays | المهيس | Al Muhays | محافظة عمران | PPL | 80 | 1 | 94.71 | saada |
| qadih | قدح | Qadiḩ | محافظة عمران | PPL | 80 | 2 | 94.60 | saada |
| qa-an-najd | قاع النجد | Qā‘ an Najd | محافظة عمران | PPL | 80 | 3 | 94.33 | saada |
| al-maqta | المقطع | Al Maqţa‘ | محافظة عمران | PPL | 80 | 4 | 91.06 | saada |
| al-masasiq | المساصيق | Al Masāşīq | محافظة عمران | PPL | 80 | 10 | 91.84 | saada |
| mahtus | محتوس | Maḩtūs | محافظة عمران | PPL | 80 | 10 | 92.85 | saada |
| al-maqshab | المقشب | Al Maqshab | محافظة عمران | PPL | 80 | 4 | 92.39 | saada |
| al-mandirah | المنضرة | Al Manḑirah | محافظة عمران | PPL | 80 | 3 | 92.51 | saada |
| al-martabah | المرتبة | Al Martabah | محافظة عمران | PPL | 80 | 7 | 92.56 | saada |
| khala-waas | خلعى وعاس | Khal‘á Wa‘ās | محافظة عمران | PPL | 80 | 1 | 94.40 | sanaa |
| qasabat-khaza | قصبة خزاع | Qaşabat Khazā‘ | محافظة عمران | PPL | 80 | 1 | 94.68 | saada |
| alab-yahya | علب يحي | ‘Alab Yaḩya | محافظة عمران | PPL | 80 | 2 | 93.24 | saada |
| al-maqumah | المقومة | Al Maqūmah | محافظة عمران | PPL | 80 | 2 | 94.25 | saada |
| ar-rabizah | الرابظة | Ar Rābiz̧ah | محافظة عمران | PPL | 80 | 18 | 84.97 | saada |
| dhu-mayar | ذو ميعر | Dhū May‘ar | محافظة عمران | PPL | 80 | 6 | 84.48 | saada |
| as-suq | السوق | As Sūq | محافظة صعدة | PPL | 80 | 2 | 74.12 | saada |
| basr | بصر | Başr | محافظة صعدة | PPL | 80 | 1 | 73.85 | saada |
| maslam | مسلم | Maslam | محافظة صعدة | PPL | 80 | 1 | 73.54 | saada |
| al-shamman | ال شمان | Āl Shammān | محافظة صعدة | PPL | 80 | 6 | 60.17 | saada |
| alafah | علافة | ‘Alāfah | محافظة صعدة | PPL | 80 | 17 | 62.24 | saada |
| zahr-al-mash | ظهر المش | Z̧ahr al Mash | محافظة صعدة | PPL | 80 | 4 | 62.33 | saada |
| nayd-al-maqran | نيد المقران | Nayd al Maqrān | محافظة صعدة | PPL | 80 | 7 | 60.77 | saada |
| at-taifah | الطائفة | Aţ Ţā’ifah | محافظة صعدة | PPL | 80 | 3 | 61.26 | saada |
| al-jadibah | الجدبة | Al Jadibah | محافظة صعدة | PPL | 80 | 1 | 60.88 | saada |
| al-alak | العلك | Al ‘Alak | محافظة صعدة | PPL | 80 | 11 | 62.14 | saada |
| hatt-as-siyalah | حت السيالة | Ḩatt as Siyālah | محافظة صعدة | PPL | 80 | 2 | 61.99 | saada |
| al-war | الوعر | Al Wa‘r | محافظة صعدة | PPL | 80 | 6 | 62.04 | saada |
| ala-adh-dhari | على الذارع | Alá adh Dhāri‘ | محافظة صعدة | PPL | 80 | 4 | 62.29 | saada |
| khawaq | خوق | Khawaq | محافظة صعدة | PPL | 80 | 6 | 61.40 | saada |
| al-mahamah | المحاماه | Al Maḩāmāh | محافظة صعدة | PPL | 80 | 2 | 60.63 | saada |
| dhira-at-tinah | ذراع الطينة | Dhirā‘ aţ Ţīnah | محافظة صعدة | PPL | 80 | 7 | 60.77 | saada |
| al-farhah | الفرحة | Al Farḩah | محافظة صعدة | PPL | 80 | 2 | 60.34 | saada |
| ad-dahi | الضحى | Aḑ Ḑaḩī | محافظة صعدة | PPL | 80 | 1 | 61.71 | saada |
| al-mihdab | المحداب | Al Miḩdāb | محافظة صعدة | PPL | 80 | 6 | 63.59 | saada |
| dhira-umm-quflah | ذراع أم قفلة | Dhirā‘ Umm Quflah | محافظة صعدة | PPL | 80 | 10 | 63.26 | saada |
| nayd-umm-khatwah | نيد أم خطوة | Nayd Umm Khaţwah | محافظة صعدة | PPL | 80 | 7 | 64.08 | saada |
| al-udnah | العدنة | Al ‘Udnah | محافظة صعدة | PPL | 80 | 4 | 63.04 | saada |
| habil-an-nabah | حبيل النبعة | Ḩabīl an Nab‘ah | محافظة صعدة | PPL | 80 | 5 | 63.41 | saada |
| khatwat-ash-shuqrah | خطوة الشقرة | Khaţwat ash Shuqrah | محافظة صعدة | PPL | 80 | 2 | 63.15 | saada |
| al-hathul | الحثول | Al Ḩathūl | محافظة صعدة | PPL | 80 | 11 | 61.91 | saada |
| al-mahdiyah | ال مهدية | Al Mahdīyah | محافظة صعدة | PPL | 80 | 17 | 58.56 | saada |
| al-hama | الحمى | Al Ḩamá | محافظة صعدة | PPL | 80 | 7 | 61.23 | saada |
| nayd-qusayrah | نيد قصيرة | Nayd Quşayrah | محافظة صعدة | PPL | 80 | 11 | 59.88 | saada |
| mashraf | مشرف | Mashraf | محافظة صعدة | PPL | 80 | 14 | 61.41 | saada |
| rayd-al-kadis | ريد الكدس | Rayd al Kadis | محافظة صعدة | PPL | 80 | 3 | 60.91 | saada |
| shir | شعر | Shi‘r | محافظة صعدة | PPL | 80 | 6 | 62.07 | saada |
| hunahid | حناحد | Ḩunāḩid | محافظة صعدة | PPL | 80 | 6 | 62.30 | saada |
| al-jabiyah | الجيبة | Al Jabīyah | محافظة صعدة | PPL | 80 | 10 | 62.38 | saada |
| al-handud | الحندود | Al Ḩandūd | محافظة صعدة | PPL | 80 | 7 | 62.77 | saada |
| al-qullah | القلة | Al Qullah | محافظة صعدة | PPL | 80 | 8 | 62.88 | saada |
| al-qudaynah | القدينة | Al Qudaynah | محافظة صعدة | PPL | 80 | 4 | 60.87 | saada |
| ad-dukhays | الدخيس | Ad Dukhays | محافظة صعدة | PPL | 80 | 4 | 62.19 | saada |
| habil-wudhah | حبيل وذاح | Ḩabīl Wudhāḩ | محافظة صعدة | PPL | 80 | 11 | 60.18 | saada |
| ad-duqaymiyah | الدقيمية | Ad Duqaymīyah | محافظة صعدة | PPL | 80 | 6 | 61.59 | saada |
| azzan | عزان | ‘Azzān | محافظة صعدة | PPL | 80 | 5 | 59.31 | saada |
| ar-ranfah | الرنفة | Ar Ranfah | محافظة صعدة | PPL | 80 | 15 | 61.96 | saada |
| al-ghadayah | الغداية | Al Ghadāyah | محافظة صعدة | PPL | 80 | 11 | 60.37 | saada |
| hajf | حجف | Ḩajf | محافظة صعدة | PPL | 80 | 7 | 62.15 | saada |
| ali-tariyah | علي طارية | ‘Alī Ţāriyah | محافظة صعدة | PPL | 80 | 1 | 57.95 | saada |
| al-hadan | الحضن | Al Ḩaḑan | محافظة صعدة | PPL | 80 | 1 | 58.21 | saada |
| al-harash | الحرش | Al Ḩarash | محافظة صعدة | PPL | 80 | 3 | 57.73 | saada |
| habil-al-madah | حبيل المضة | Ḩabīl al Maḑah | محافظة صعدة | PPL | 80 | 2 | 58.05 | saada |
| ad-dajai | الضجاعي | Aḑ Ḑajā‘ī | محافظة صعدة | PPL | 80 | 1 | 57.55 | saada |
| aram-al-mighsha | عرام المغشى | ‘Arām al Mighshá | محافظة صعدة | PPL | 80 | 3 | 57.64 | saada |
| dhira-sabiq | ذراع سابق | Dhirā‘ Sābiq | محافظة صعدة | PPL | 80 | 3 | 57.36 | saada |
| lahij-fayi | لحج فايع | Laḩij Fāyi‘ | محافظة صعدة | PPL | 80 | 1 | 57.06 | saada |
| habil-al-qimmah | حبيل القمة | Ḩabīl al Qimmah | محافظة صعدة | PPL | 80 | 5 | 57.56 | saada |
| hayd-sulayah | حيد سليعة | Ḩayd Sulay‘ah | محافظة صعدة | PPL | 80 | 2 | 59.70 | saada |
| azzan | عزان | ‘Azzān | محافظة صعدة | PPL | 80 | 12 | 58.74 | saada |
| al-qalalah | القلالة | Al Qalālah | محافظة صعدة | PPL | 80 | 2 | 58.38 | saada |
| al-mashbirah | المشبيرة | Al Mashbīrah | محافظة صعدة | PPL | 80 | 5 | 58.88 | saada |
| ar-rafhah | الرفحة | Ar Rafḩah | محافظة صعدة | PPL | 80 | 19 | 59.86 | saada |
| al-majham | المجهم | Al Majham | محافظة صعدة | PPL | 80 | 3 | 60.19 | saada |
| al-hamriyah | الحمرية | Al Ḩamrīyah | محافظة صعدة | PPL | 80 | 1 | 59.44 | saada |
| nayd-ath-thahir | نيد الثاهر | Nayd ath Thāhir | محافظة صعدة | PPL | 80 | 9 | 60.04 | saada |
| al-quad | القعاد | Al Qu‘ād | محافظة صعدة | PPL | 80 | 10 | 60.59 | saada |
| dhira-khira | ذراع خرعاء | Dhirā‘ Khir‘ā’ | محافظة صعدة | PPL | 80 | 7 | 60.16 | saada |
| al-hadn | الحدن | Al Ḩadn | محافظة صعدة | PPL | 80 | 1 | 60.40 | saada |
| hayfat-qasim | حيفة قاسم | Ḩayfat Qāsim | محافظة صعدة | PPL | 80 | 3 | 60.96 | saada |
| lahij-ad-dujaj | لحج الدجاج | Laḩij ad Dujāj | محافظة صعدة | PPL | 80 | 2 | 60.83 | saada |
| al-makhlab | المخلب | Al Makhlab | محافظة صعدة | PPL | 80 | 8 | 62.64 | saada |
| khatimah | خاتمة | Khātimah | محافظة صعدة | PPL | 80 | 1 | 61.87 | saada |
| al-majim | المعجم | Al Ma‘jim | محافظة صعدة | PPL | 80 | 1 | 63.31 | saada |
| al-munayfir | المنيفر | Al Munayfir | محافظة صعدة | PPL | 80 | 6 | 62.74 | saada |
| al-maqmar | المقمر | Al Maqmar | محافظة صعدة | PPL | 80 | 1 | 63.66 | saada |
| zabdah | زبدة | Zabdah | محافظة صعدة | PPL | 80 | 4 | 63.23 | saada |
| hazm-al-husayn | حزم الحسين | Ḩazm al Ḩusayn | محافظة صعدة | PPL | 80 | 2 | 63.53 | saada |
| ala-suhayf | على صحيف | ‘Alá Şuḩayf | محافظة صعدة | PPL | 80 | 2 | 62.52 | saada |
| hajaah | هجاعة | Hajā‘ah | محافظة صعدة | PPL | 80 | 1 | 62.56 | saada |
| buth | بوث | Būth | محافظة صعدة | PPL | 80 | 4 | 62.83 | saada |
| al-kurs | الكرس | Al Kurs | محافظة صعدة | PPL | 80 | 2 | 62.66 | saada |
| al-qullah | القلة | Al Qullah | محافظة صعدة | PPL | 80 | 4 | 62.27 | saada |
| qamal | قعمل | Qa‘mal | محافظة صعدة | PPL | 80 | 4 | 62.32 | saada |
| al-quayd | القعيد | Al Qu‘ayd | محافظة صعدة | PPL | 80 | 2 | 61.79 | saada |
| al-makhdumah | المخدومة | Al Makhdūmah | محافظة صعدة | PPL | 80 | 4 | 62.61 | saada |
| al-mihdadah | المحدادة | Al Miḩdādah | محافظة صعدة | PPL | 80 | 3 | 61.30 | saada |
| ash-shawkah | الشوكة | Ash Shawkah | محافظة صعدة | PPL | 80 | 3 | 62.54 | saada |
| nishwan | نشوان | Nishwān | محافظة صعدة | PPL | 80 | 14 | 62.90 | saada |
| mishat-aqil | مشة عاقل | Mishat ‘Āqil | محافظة صعدة | PPL | 80 | 5 | 62.40 | saada |
| saqiyah | ساقية | Sāqiyah | محافظة صعدة | PPL | 80 | 5 | 63.36 | saada |
| ash-shuayb | الشعيب | Ash Shu‘ayb | محافظة صعدة | PPL | 80 | 3 | 61.87 | saada |
| mashkhith | مشخث | Mashkhith | محافظة صعدة | PPL | 80 | 1 | 62.17 | saada |
| juhnah | جحنة | Juḩnah | محافظة صعدة | PPL | 80 | 3 | 62.02 | saada |
| al-maqnadir | المقندر | Al Maqnadir | محافظة صعدة | PPL | 80 | 7 | 61.88 | saada |
| adh-dhari | الذاري | Adh Dhārī | محافظة صعدة | PPL | 80 | 32 | 63.02 | saada |
| al-kuhaylah | الكهيلة | Al Kuhaylah | محافظة صعدة | PPL | 80 | 21 | 63.14 | saada |
| shudhnah | شذنة | Shudhnah | محافظة صعدة | PPL | 80 | 1 | 61.96 | saada |
| al-washah | الوشاح | Al Washāḩ | محافظة صعدة | PPL | 80 | 2 | 62.62 | saada |
| al-maqraah | المقرعة | Al Maqra‘ah | محافظة صعدة | PPL | 80 | 7 | 62.78 | saada |
| shuzayin | شظاين | Shuz̧āyin | محافظة صعدة | PPL | 80 | 6 | 63.35 | saada |
| ath-thuwa | الثواع | Ath Thuwā‘ | محافظة صعدة | PPL | 80 | 8 | 63.73 | saada |
| al-jubaynah | الجبينة | Al Jubaynah | محافظة صعدة | PPL | 80 | 6 | 63.55 | saada |
| al-quma | القمع | Al Quma‘ | محافظة صعدة | PPL | 80 | 1 | 65.55 | saada |
| dhu-haqayn | ذو حقين | Dhū Ḩaqayn | محافظة صعدة | PPL | 80 | 7 | 63.44 | saada |
| nayd-al-wabid | نيد الوبيد | Nayd al Wabīd | محافظة صعدة | PPL | 80 | 4 | 63.92 | saada |
| kurs-al-manqas | كرس المنقص | Kurs al Manqaş | محافظة صعدة | PPL | 80 | 1 | 63.22 | saada |
| jaman | جمعان | Jam‘ān | محافظة صعدة | PPL | 80 | 3 | 62.51 | saada |
| qam-dhari | قمع ذارع | Qam‘ Dhāri‘ | محافظة صعدة | PPL | 80 | 6 | 63.02 | saada |
| al-qafili | القعفلي | Al Qa‘filī | محافظة صعدة | PPL | 80 | 5 | 65.55 | saada |
| al-khudhaylah | الخذيلة | Al Khudhaylah | محافظة صعدة | PPL | 80 | 1 | 63.10 | saada |
| al-jayyibah | الجيبة | Al Jayyibah | محافظة صعدة | PPL | 80 | 3 | 64.25 | saada |
| habil-shaddad | حبيل شداد | Ḩabīl Shaddād | محافظة صعدة | PPL | 80 | 6 | 63.40 | saada |
| hayd-al-quflah | حيد القفلة | Ḩayd al Quflah | محافظة صعدة | PPL | 80 | 3 | 63.66 | saada |
| rayhanah | ريحانة | Rayḩānah | محافظة صعدة | PPL | 80 | 1 | 64.87 | saada |
| nayd-al-khatwah | نيد الخطوة | Nayd al Khaţwah | محافظة صعدة | PPL | 80 | 3 | 64.48 | saada |
| ash-shuqrah | الشقرة | Ash Shuqrah | محافظة صعدة | PPL | 80 | 2 | 64.13 | saada |
| al-mishbah | المشباح | Al Mishbāḩ | محافظة صعدة | PPL | 80 | 2 | 66.03 | saada |
| khishan | خشان | Khishān | محافظة صعدة | PPL | 80 | 2 | 65.19 | saada |
| harf-mahdam | حرف مهدم | Ḩarf Mahdam | محافظة صعدة | PPL | 80 | 2 | 64.51 | saada |
| khatwat-sihaq | خطوة سحاق | Khaţwat Siḩāq | محافظة صعدة | PPL | 80 | 2 | 65.19 | saada |
| ar-rakhayah | الرخاية | Ar Rakhāyah | محافظة صعدة | PPL | 80 | 1 | 65.48 | saada |
| habil-ar-raythi | حبيل الريثي | Ḩabīl ar Raythī | محافظة صعدة | PPL | 80 | 2 | 64.82 | saada |
| habil-ihsan | حبيل إحسان | Ḩabīl Iḩsān | محافظة صعدة | PPL | 80 | 2 | 65.09 | saada |
| al-kharishah | الجرشة | Al Kharishah | محافظة صعدة | PPL | 80 | 6 | 64.37 | saada |
| al-hama | الحما | Al Ḩamā | محافظة صعدة | PPL | 80 | 3 | 64.28 | saada |
| ath-thuayfah | الثعيفة | Ath Thu‘ayfah | محافظة صعدة | PPL | 80 | 2 | 63.52 | saada |
| bani-irqayn | بني عرقين | Banī ‘Irqayn | محافظة صعدة | PPL | 80 | 2 | 63.29 | saada |
| ad-dijrah | الضجرة | Aḑ Ḑijrah | محافظة صعدة | PPL | 80 | 1 | 64.59 | saada |
| ash-shara | الشعراء | Ash Sha‘rā’ | محافظة صعدة | PPL | 80 | 2 | 64.69 | saada |
| nayd-hamati | نيد حمطي | Nayd Ḩamaţī | محافظة صعدة | PPL | 80 | 2 | 64.97 | saada |
| al-udnah | العدنة | Al ‘Udnah | محافظة صعدة | PPL | 80 | 1 | 64.98 | saada |
| haydan | حيدان | Ḩaydān | محافظة صعدة | PPL | 80 | 2 | 64.98 | saada |
| qurayshah | قريشة | Qurayshah | محافظة صعدة | PPL | 80 | 1 | 64.97 | saada |
| habil-al-harash | حبيل الحرش | Ḩabīl al Ḩarash | محافظة صعدة | PPL | 80 | 1 | 65.72 | saada |
| as-samah | الصمعة | Aş Şam‘ah | محافظة صعدة | PPL | 80 | 1 | 65.48 | saada |
| qullat-al-firush | قلة الفروش | Qullat al Firūsh | محافظة صعدة | PPL | 80 | 2 | 65.10 | saada |
| al-mahsub | المحصوب | Al Maḩşūb | محافظة صعدة | PPL | 80 | 8 | 65.94 | saada |
| al-kazimah | الكزيمة | Al Kazīmah | محافظة صعدة | PPL | 80 | 1 | 65.99 | saada |
| hada | حدا | Ḩadā | محافظة صعدة | PPL | 80 | 2 | 65.37 | saada |
| nayd-shamlah | نيد شملة | Nayd Shamlah | محافظة صعدة | PPL | 80 | 5 | 65.76 | saada |
| al-farhah | الفرحة | Al Farḩah | محافظة صعدة | PPL | 80 | 2 | 66.10 | saada |
| al-mawal | المعول | Al Ma‘wal | محافظة صعدة | PPL | 80 | 2 | 65.27 | saada |
| ar-raqw | الرقو | Ar Raqw | محافظة صعدة | PPL | 80 | 18 | 69.13 | saada |
| al-maqtar | المقطار | Al Maqţār | محافظة صعدة | PPL | 80 | 4 | 66.17 | saada |
| al-mujanib | المجانب | Al Mujānib | محافظة صعدة | PPL | 80 | 4 | 65.89 | saada |
| al-mirbah | المربة | Al Mirbah | محافظة صعدة | PPL | 80 | 4 | 63.75 | saada |
| al-quhlah | القحلة | Al Quḩlah | محافظة صعدة | PPL | 80 | 4 | 63.98 | saada |
| habil-al-mithlah | حبيل المثلة | Ḩabīl al Mithlah | محافظة صعدة | PPL | 80 | 1 | 62.54 | saada |
| habil-adh-dhalih | حبيل الذلح | Ḩabīl adh Dhaliḩ | محافظة صعدة | PPL | 80 | 1 | 63.66 | saada |
| habil-al-kharsh | حبيل الخرش | Ḩabīl al Kharsh | محافظة صعدة | PPL | 80 | 4 | 66.28 | saada |
| al-jiz | الجزع | Al Jiz‘ | محافظة صعدة | PPL | 80 | 8 | 59.81 | saada |
| al-quhuf | القحوف | Al Quḩūf | محافظة صعدة | PPL | 80 | 3 | 60.74 | saada |
| al-hudba | الحدباء | Al Ḩudbā’ | محافظة صعدة | PPL | 80 | 4 | 60.64 | saada |
| al-musl | المصل | Al Muşl | محافظة صعدة | PPL | 80 | 4 | 59.52 | saada |
| ar-rahrahah | الرحرحة | Ar Raḩraḩah | محافظة صعدة | PPL | 80 | 1 | 60.26 | saada |
| at-tulaah | الطلاعة | Aţ Ţulā‘ah | محافظة صعدة | PPL | 80 | 10 | 61.56 | saada |
| nayd-jabar | نيد جبار | Nayd Jabār | محافظة صعدة | PPL | 80 | 12 | 61.21 | saada |
| ash-shabb | الشاب | Ash Shābb | محافظة صعدة | PPL | 80 | 8 | 60.32 | saada |
| al-uthman | ال عثمان | Āl ‘Uthmān | محافظة صعدة | PPL | 80 | 4 | 61.17 | saada |
| al-quhum | القحوم | Al Quḩūm | محافظة عمران | PPL | 80 | 10 | 72.59 | saada |
| al-hariz | الحرز | Al Ḩariz | محافظة عمران | PPL | 80 | 7 | 72.64 | saada |
| al-mudafin | المدافن | Al Mudāfin | محافظة عمران | PPL | 80 | 1 | 73.80 | saada |
| al-qadah | القضاه | Al Qaḑāh | محافظة عمران | PPL | 80 | 4 | 72.03 | saada |
| al-qarar-al-ala | القرار الأعلى | Al Qarār al A‘lá | محافظة عمران | PPL | 80 | 8 | 70.94 | saada |
| al-qarar-al-asfal | القرار الأسفل | Al Qarār al Asfal | محافظة عمران | PPL | 80 | 4 | 71.12 | saada |
| al-mamal | المعمل | Al Ma‘mal | محافظة عمران | PPL | 80 | 5 | 72.81 | saada |
| afra | أفراء | Afrā’ | محافظة عمران | PPL | 80 | 7 | 71.60 | saada |
| abu-hashilah | أبو هاشلة | Abū Hāshilah | محافظة عمران | PPL | 80 | 5 | 70.71 | saada |
| dhu-zayid | ذو زايد | Dhū Zāyid | محافظة عمران | PPL | 80 | 5 | 70.90 | saada |
| abu-sabah | أبو سبعة | Abū Sab‘ah | محافظة عمران | PPL | 80 | 4 | 70.84 | saada |
| as-sabr | الصبر | Aş Şabr | محافظة عمران | PPL | 80 | 7 | 69.25 | saada |
| shirqan | شرقان | Shirqān | محافظة عمران | PPL | 80 | 10 | 69.75 | saada |
| jantar | جنتر | Jantar | محافظة عمران | PPL | 80 | 8 | 73.89 | saada |
| bayt-al-jitham | بيت الجثام | Bayt al Jithām | محافظة عمران | PPL | 80 | 25 | 71.67 | saada |
| abu-isa | أبو عصاء | Abū ‘Işā’ | محافظة عمران | PPL | 80 | 12 | 71.48 | saada |
| al-yahwi | اليحوي | Al Yaḩwī | محافظة البيضاء | PPL | 80 | 17 | 146.12 | dhamar |
| haddah | حضة | Ḩaḑḑah | محافظة البيضاء | PPL | 80 | 82 | 140.21 | dhamar |
| al-makhfaj | المخفاج | Al Makhfāj | محافظة البيضاء | PPL | 80 | 48 | 140.13 | dhamar |
| hayd-azzan | حيد عزان | Ḩayd ‘Azzān | محافظة البيضاء | PPL | 80 | 121 | 140.13 | dhamar |
| al-maslah | المصلح | Al Maşlaḩ | محافظة البيضاء | PPL | 80 | 7 | 143.21 | aden |
| al-abir | العابر | Al ‘Ābir | محافظة البيضاء | PPL | 80 | 70 | 146.25 | dhamar |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة البيضاء | PPL | 80 | 5 | 145.94 | dhamar |
| ash-shibab | الشباب | Ash Shibāb | محافظة صعدة | PPL | 80 | 3 | 62.85 | saada |
| kawlat-aqm-al-gharib | كولة عقم الغارب | Kawlat ‘Aqm al Ghārib | محافظة عمران | PPL | 80 | 3 | 93.17 | saada |
| qahir-al-balhah | قاهر البلحة | Qāhir al Balḩah | محافظة عمران | PPL | 80 | 4 | 86.58 | saada |
| al-hayfah-al-ulya | الحيفة العليا | Al Ḩayfah al ‘Ulyā | محافظة عمران | PPL | 80 | 1 | 93.06 | sanaa |
| hayd-al-hail | حيد الحائل | Ḩayd al Ḩā’il | محافظة عمران | PPL | 80 | 4 | 91.50 | sanaa |
| al-qar | القرع | Al Qar‘ | محافظة صعدة | PPL | 80 | 20 | 60.91 | saada |
| az-zulami | الظلامي | Az̧ Z̧ulāmī | محافظة صعدة | PPL | 80 | 3 | 62.10 | saada |
| dhira-al-basim | ذراع الباصم | Dhirā‘ al Bāşim | محافظة صعدة | PPL | 80 | 8 | 64.06 | saada |
| nayd-an-nasb | نيد النصب | Nayd an Naşb | محافظة صعدة | PPL | 80 | 1 | 64.85 | saada |
| habil-al-marwah | حبيل المروة | Ḩabīl al Marwah | محافظة صعدة | PPL | 80 | 3 | 65.75 | saada |
| annah | عنة | ‘Annah | محافظة البيضاء | PPL | 80 | 25 | 124.55 | dhamar |
| al-bilghith | ال بلغيث | Āl Bilghīth | محافظة البيضاء | PPL | 80 | 6 | 122.89 | dhamar |
| jimat-al-mansar | جعمة ال منصر | Ji‘mat Āl Manşar | محافظة البيضاء | PPL | 80 | 7 | 121.67 | dhamar |
| masmar | مسمار | Masmār | محافظة البيضاء | PPL | 80 | 4 | 120.27 | dhamar |
| al-qawah | القوعة | Al Qaw‘ah | محافظة البيضاء | PPL | 80 | 27 | 122.01 | dhamar |
| shamakh | شماخ | Shamākh | محافظة البيضاء | PPL | 80 | 2 | 119.29 | dhamar |
| al-abd-allah-alwa | ال عبد الله علوى | Āl ‘Abd Allāh ‘Alwá | محافظة البيضاء | PPL | 80 | 7 | 119.60 | dhamar |
| sarab-al-mansar | صرب ال منصر | Şarab Āl Manşar | محافظة البيضاء | PPL | 80 | 10 | 118.23 | dhamar |
| mahrur | محرور | Maḩrūr | محافظة البيضاء | PPL | 80 | 5 | 124.63 | dhamar |
| al-rashid | ال راشد | Āl Rāshid | محافظة البيضاء | PPL | 80 | 10 | 121.93 | dhamar |
| al-qawah | القوعة | Al Qaw‘ah | محافظة البيضاء | PPL | 80 | 5 | 126.02 | dhamar |
| as-saqayah | السقاية | As Saqāyah | محافظة البيضاء | PPL | 80 | 10 | 127.80 | dhamar |
| al-hawtah | الحوطة | Al Ḩawţah | محافظة البيضاء | PPL | 80 | 6 | 128.03 | dhamar |
| al-jannab | الجناب | Al Jannāb | محافظة البيضاء | PPL | 80 | 17 | 91.78 | dhamar |
| arshidah | أرشيدة | Arshīdah | محافظة البيضاء | PPL | 80 | 12 | 91.68 | dhamar |
| sudah | سودة | Sūdah | محافظة البيضاء | PPL | 80 | 9 | 90.06 | dhamar |
| as-sirba | السرباء | As Sirbā’ | محافظة البيضاء | PPL | 80 | 17 | 88.85 | dhamar |
| sudah-al-hazaz | سودة الحزز | Sūdah al Ḩazaz | محافظة البيضاء | PPL | 80 | 4 | 90.87 | dhamar |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة البيضاء | PPL | 80 | 3 | 95.50 | dhamar |
| amran | عمران | ‘Amrān | محافظة البيضاء | PPL | 80 | 12 | 95.39 | dhamar |
| ashshat-sawdan | عشة سودان | ‘Ashshat Sawdān | محافظة البيضاء | PPL | 80 | 4 | 105.04 | dhamar |
| as-sadus | السدوس | As Sadūs | محافظة البيضاء | PPL | 80 | 2 | 105.12 | dhamar |
| al-firaah | الفراعة | Al Firā‘ah | محافظة البيضاء | PPL | 80 | 5 | 104.68 | dhamar |
| hanakat-baran | حنكة بران | Ḩanakat Barān | محافظة البيضاء | PPL | 80 | 8 | 107.51 | dhamar |
| al-hizbah | الحزبة | Al Ḩizbah | محافظة البيضاء | PPL | 80 | 2 | 112.17 | dhamar |
| al-hayd | الحيد | Al Ḩayd | محافظة البيضاء | PPL | 80 | 5 | 111.27 | dhamar |
| al-hayd | الحيد | Al Ḩayd | محافظة البيضاء | PPL | 80 | 4 | 108.61 | dhamar |
| al-haydah | الحيدة | Al Ḩaydah | محافظة البيضاء | PPL | 80 | 7 | 108.30 | dhamar |
| al-far | الفرع | Al Far‘ | محافظة البيضاء | PPL | 80 | 5 | 104.25 | dhamar |
| al-qabil | القابل | Al Qābil | محافظة البيضاء | PPL | 80 | 2 | 103.78 | dhamar |
| haran | حران | Ḩarān | محافظة البيضاء | PPL | 80 | 26 | 104.08 | dhamar |
| maskut | مسكوت | Maskūt | محافظة البيضاء | PPL | 80 | 4 | 107.91 | dhamar |
| abasirah | عباصرة | ‘Abāşirah | محافظة البيضاء | PPL | 80 | 24 | 107.83 | dhamar |
| al-jabnah | الجبنة | Al Jabnah | محافظة البيضاء | PPL | 80 | 10 | 107.81 | dhamar |
| saidah | سعيدة | Sa‘īdah | محافظة البيضاء | PPL | 80 | 6 | 107.39 | dhamar |
| shamsan | شمسان | Shamsān | محافظة البيضاء | PPL | 80 | 3 | 107.36 | dhamar |
| al-jurub | الجروب | Al Jurūb | محافظة البيضاء | PPL | 80 | 2 | 108.37 | dhamar |
| al-khirbah | الخربة | Al Khirbah | محافظة البيضاء | PPL | 80 | 4 | 109.69 | dhamar |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة البيضاء | PPL | 80 | 7 | 109.71 | dhamar |
| al-ghashshah | الغشة | Al Ghashshah | محافظة البيضاء | PPL | 80 | 6 | 110.88 | dhamar |
| as-siffah | السفة | As Siffah | محافظة البيضاء | PPL | 80 | 1 | 109.15 | dhamar |
| wakhir | واخر | Wākhir | محافظة البيضاء | PPL | 80 | 8 | 109.08 | dhamar |
| al-khaniq | الخانق | Al Khāniq | محافظة البيضاء | PPL | 80 | 15 | 110.85 | dhamar |
| maghrad | مغرض | Maghraḑ | محافظة البيضاء | PPL | 80 | 9 | 112.61 | dhamar |
| al-hawsh | الحوش | Al Ḩawsh | محافظة البيضاء | PPL | 80 | 29 | 112.83 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 5 | 113.17 | dhamar |
| al-madrab | المضرب | Al Maḑrab | محافظة البيضاء | PPL | 80 | 1 | 104.42 | dhamar |
| al-ash-shaybah | ال الشيبة | Āl ash Shaybah | محافظة البيضاء | PPL | 80 | 7 | 105.28 | dhamar |
| far-al-umari | فرع العمري | Far‘ al ‘Umarī | محافظة البيضاء | PPL | 80 | 3 | 105.25 | dhamar |
| janab-jawhar | جنب جوهر | Janab Jawhar | محافظة البيضاء | PPL | 80 | 2 | 102.84 | dhamar |
| irq-ash-shari | عرق الشري | ‘Irq ash Sharī | محافظة البيضاء | PPL | 80 | 6 | 103.33 | dhamar |
| ibn-haydir | إبن حيدر | Ibn Ḩaydir | محافظة البيضاء | PPL | 80 | 5 | 103.28 | dhamar |
| al-madfan | المدفن | Al Madfan | محافظة البيضاء | PPL | 80 | 7 | 103.75 | dhamar |
| ash-shari | الشري | Ash Sharī | محافظة البيضاء | PPL | 80 | 7 | 104.10 | dhamar |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة البيضاء | PPL | 80 | 4 | 104.46 | dhamar |
| al-ghishshah | الغشة | Al Ghishshah | محافظة البيضاء | PPL | 80 | 6 | 105.09 | dhamar |
| naqiz-al-ulya | ناقظ العليا | Nāqiz̧ al ‘Ulyā | محافظة البيضاء | PPL | 80 | 4 | 105.49 | dhamar |
| al-uqlah-an-nismah | العقلة النسمة | Al ‘Uqlah an Nismah | محافظة البيضاء | PPL | 80 | 5 | 104.48 | dhamar |
| falhan | فلحان | Falḩān | محافظة البيضاء | PPL | 80 | 4 | 92.36 | dhamar |
| hayd-ar-rawdah | حيد الروضة | Ḩayd ar Rawḑah | محافظة البيضاء | PPL | 80 | 3 | 89.41 | dhamar |
| ash-shaqqi | الشقي | Ash Shaqqī | محافظة البيضاء | PPL | 80 | 11 | 96.21 | dhamar |
| an-namsha | النمشى | An Namshá | محافظة البيضاء | PPL | 80 | 20 | 96.28 | dhamar |
| al-wuhayshi | الوحيشي | Al Wuḩayshī | محافظة البيضاء | PPL | 80 | 18 | 96.41 | dhamar |
| far-al-kharashi | فرع الخراشي | Far‘ al Kharāshī | محافظة البيضاء | PPL | 80 | 3 | 95.96 | dhamar |
| khurshan | خرشان | Khurshān | محافظة البيضاء | PPL | 80 | 6 | 97.45 | dhamar |
| bayt-al-jahrani | بيت الجهراني | Bayt al Jahrānī | محافظة البيضاء | PPL | 80 | 6 | 96.48 | dhamar |
| al-jubub | الجبوب | Al Jubūb | محافظة البيضاء | PPL | 80 | 4 | 98.82 | dhamar |
| al-harat | الحرات | Al Ḩarāt | محافظة البيضاء | PPL | 80 | 18 | 98.27 | dhamar |
| an-nuzayhah | النزيهة | An Nuzayhah | محافظة البيضاء | PPL | 80 | 11 | 99.35 | dhamar |
| al-minzaf | المنزاف | Al Minzāf | محافظة البيضاء | PPL | 80 | 14 | 98.60 | dhamar |
| al-qaramid | القراميد | Al Qarāmīd | محافظة البيضاء | PPL | 80 | 1 | 98.03 | dhamar |
| jihaf | جحاف | Jiḩāf | محافظة البيضاء | PPL | 80 | 5 | 93.01 | dhamar |
| al-jumaym | الجميم | Al Jumaym | محافظة البيضاء | PPL | 80 | 5 | 99.84 | dhamar |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة البيضاء | PPL | 80 | 4 | 94.54 | dhamar |
| al-milh | الملح | Al Milḩ | محافظة البيضاء | PPL | 80 | 4 | 94.75 | dhamar |
| al-qalat | القلاط | Al Qalāţ | محافظة البيضاء | PPL | 80 | 1 | 93.69 | dhamar |
| al-khadra | الخضراء | Al Khaḑrā’ | محافظة البيضاء | PPL | 80 | 4 | 93.78 | dhamar |
| hayd-al-masban | حيد المصبان | Ḩayd al Maşbān | محافظة البيضاء | PPL | 80 | 4 | 97.02 | dhamar |
| al-judaydah | الجديدة | Al Judaydah | محافظة البيضاء | PPL | 80 | 21 | 96.61 | dhamar |
| al-hulayqah | الحليقة | Al Ḩulayqah | محافظة البيضاء | PPL | 80 | 1 | 96.52 | dhamar |
| ruhban | رهبان | Ruhbān | محافظة البيضاء | PPL | 80 | 7 | 97.06 | dhamar |
| al-masarib | المسارب | Al Masārib | محافظة البيضاء | PPL | 80 | 6 | 97.59 | dhamar |
| hayran | حيران | Ḩayrān | محافظة البيضاء | PPL | 80 | 4 | 97.57 | dhamar |
| al-hulayqah | الحليقة | Al Ḩulayqah | محافظة البيضاء | PPL | 80 | 11 | 97.59 | dhamar |
| al-jaawin | الجعاون | Al Ja‘āwin | محافظة البيضاء | PPL | 80 | 7 | 93.33 | dhamar |
| al-hayd-al-abyad | الحيد الأبيض | Al Ḩayd al Abyaḑ | محافظة البيضاء | PPL | 80 | 2 | 94.52 | dhamar |
| al-khaymah | الخيمة | Al Khaymah | محافظة البيضاء | PPL | 80 | 2 | 114.73 | dhamar |
| hayd-as-salb | حيد الصلب | Ḩayd aş Şalb | محافظة البيضاء | PPL | 80 | 3 | 114.98 | dhamar |
| hanakat-shaykh | حنكة شيخ | Ḩanakat Shaykh | محافظة البيضاء | PPL | 80 | 4 | 114.14 | dhamar |
| al-sad-ar-ruhab | ال سعد الرحاب | Āl Sa‘d ar Ruḩāb | محافظة البيضاء | PPL | 80 | 12 | 114.78 | dhamar |
| al-al-hadda | آل الحدي | Āl al Ḩaddá | محافظة البيضاء | PPL | 80 | 2 | 116.01 | dhamar |
| al-al-maura | ال المعورى | Āl al Ma‘ūrá | محافظة البيضاء | PPL | 80 | 9 | 116.93 | dhamar |
| al-ba-bakr | ال با بكر | Āl Bā Bakr | محافظة البيضاء | PPL | 80 | 6 | 117.45 | dhamar |
| al-jarash | الجرش | Al Jarash | محافظة البيضاء | PPL | 80 | 7 | 117.10 | dhamar |
| fajhar | فجحر | Fajḩar | محافظة البيضاء | PPL | 80 | 17 | 117.20 | dhamar |
| hayd-al-anabah | حيد العنبة | Ḩayd al ‘Anabah | محافظة البيضاء | PPL | 80 | 23 | 116.96 | dhamar |
| al-al-ayd | ال العيد | Āl al ‘Ayd | محافظة البيضاء | PPL | 80 | 6 | 115.07 | dhamar |
| al-umar-sad | ال عمر سعد | Āl ‘Umar Sa‘d | محافظة البيضاء | PPL | 80 | 6 | 115.23 | dhamar |
| bayhan | بيحان | Bayḩān | محافظة البيضاء | PPL | 80 | 2 | 115.33 | dhamar |
| az-zahar | الظهر | Az̧ Z̧ahar | محافظة البيضاء | PPL | 80 | 7 | 118.38 | dhamar |
| ash-sharyah | الشرية | Ash Sharyah | محافظة البيضاء | PPL | 80 | 4 | 116.09 | dhamar |
| hims | حمص | Ḩimş | محافظة البيضاء | PPL | 80 | 5 | 117.43 | dhamar |
| lahman-al-gharb | لحمان الغرب | Laḩmān al Gharb | محافظة البيضاء | PPL | 80 | 8 | 116.85 | dhamar |
| ghawl-jabir | غول جابر | Ghawl Jābir | محافظة البيضاء | PPL | 80 | 3 | 116.03 | dhamar |
| al-ahmad | ال أحمد | Āl Aḩmad | محافظة البيضاء | PPL | 80 | 5 | 106.84 | dhamar |
| badbah | بادبة | Bādbah | محافظة البيضاء | PPL | 80 | 2 | 110.57 | dhamar |
| hayd-as-sarir | حيد الصرير | Ḩayd aş Şarīr | محافظة البيضاء | PPL | 80 | 5 | 115.31 | dhamar |
| zahr-al-abd-allah-husayn | ظهر ال عبد الله حسين | Z̧ahr Āl ‘Abd Allāh Ḩusayn | محافظة البيضاء | PPL | 80 | 11 | 115.69 | dhamar |
| matrah-al-musa | مطرح ال موسى | Maţraḩ Āl Mūsá | محافظة البيضاء | PPL | 80 | 15 | 115.60 | dhamar |
| al-hadbah | الهضبة | Al Haḑbah | محافظة البيضاء | PPL | 80 | 8 | 116.29 | dhamar |
| hayd-al-muhammad-ali | حيد ال محمد علي | Ḩayd Āl Muḩammad ‘Alī | محافظة البيضاء | PPL | 80 | 2 | 115.86 | dhamar |
| hazzaz | هزاز | Hazzāz | محافظة البيضاء | PPL | 80 | 12 | 109.82 | dhamar |
| matrah-al-hajj | مطرح الحاج | Maţraḩ al Ḩājj | محافظة البيضاء | PPL | 80 | 2 | 109.59 | dhamar |
| al-hayd-al-ahmar | الحيد الأحمر | Al Ḩayd al Aḩmar | محافظة البيضاء | PPL | 80 | 3 | 110.10 | dhamar |
| hayd-al-nuas | حيد النعاس | Ḩayd al Nu‘ās | محافظة البيضاء | PPL | 80 | 8 | 109.87 | dhamar |
| qaryat-as-sayli | قرية السيلي | Qaryat as Saylī | محافظة البيضاء | PPL | 80 | 14 | 114.79 | dhamar |
| al-hadarah | الهدارة | Al Hadārah | محافظة البيضاء | PPL | 80 | 3 | 107.70 | dhamar |
| mahall-sirhan | محل سرحان | Maḩall Sirḩān | محافظة البيضاء | PPL | 80 | 1 | 107.91 | dhamar |
| al-makhdam | المخدم | Al Makhdam | محافظة البيضاء | PPL | 80 | 2 | 106.56 | dhamar |
| al-hamdani | الهمداني | Al Hamdānī | محافظة البيضاء | PPL | 80 | 6 | 111.64 | dhamar |
| al-arqa | العرقى | Al ‘Arqá | محافظة البيضاء | PPL | 80 | 1 | 109.94 | dhamar |
| al-haykal | الحيكل | Al Ḩaykal | محافظة البيضاء | PPL | 80 | 5 | 110.19 | dhamar |
| al-hajilah | الحاجلة | Al Ḩājilah | محافظة البيضاء | PPL | 80 | 1 | 110.77 | dhamar |
| samir | سامر | Sāmir | محافظة البيضاء | PPL | 80 | 2 | 110.29 | dhamar |
| ad-daqiq | الدقيق | Ad Daqīq | محافظة البيضاء | PPL | 80 | 1 | 112.51 | dhamar |
| al-warika | الوركاء | Al Warikā’ | محافظة البيضاء | PPL | 80 | 10 | 102.77 | dhamar |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة البيضاء | PPL | 80 | 12 | 103.01 | dhamar |
| al-jahurah | آل جحورة | Āl Jaḩūrah | محافظة البيضاء | PPL | 80 | 21 | 102.54 | dhamar |
| hayd-al-kaldi | حيد الكلدي | Ḩayd al Kaldī | محافظة البيضاء | PPL | 80 | 4 | 102.60 | dhamar |
| al-markhah | المرخة | Al Markhah | محافظة البيضاء | PPL | 80 | 21 | 109.39 | dhamar |
| al-munqatti | المنقطع | Al Munqaţţi‘ | محافظة البيضاء | PPL | 80 | 12 | 109.42 | dhamar |
| ash-shaqrah | الشقرة | Ash Shaqrah | محافظة البيضاء | PPL | 80 | 3 | 109.89 | dhamar |
| at-taras | الطرس | Aţ Ţaras | محافظة البيضاء | PPL | 80 | 3 | 110.06 | dhamar |
| dhi-al-qulayh | ذي الفليح | Dhī al Qulayḩ | محافظة البيضاء | PPL | 80 | 12 | 109.34 | dhamar |
| al-maqna | المقنع | Al Maqna‘ | محافظة البيضاء | PPL | 80 | 5 | 109.17 | dhamar |
| al-makhlaf | المخلف | Al Makhlaf | محافظة البيضاء | PPL | 80 | 16 | 107.37 | dhamar |
| al-huyud | الحيود | Al Ḩuyūd | محافظة البيضاء | PPL | 80 | 8 | 105.24 | dhamar |
| huyud-ali-hasan | حيود علي حسن | Ḩuyūd ‘Alī Ḩasan | محافظة البيضاء | PPL | 80 | 6 | 105.33 | dhamar |
| al-ajram | الأجرم | Al Ajram | محافظة البيضاء | PPL | 80 | 3 | 105.22 | dhamar |
| sibah | سباح | Sibāḩ | محافظة البيضاء | PPL | 80 | 5 | 109.37 | dhamar |
| as-sadah | السادة | As Sādah | محافظة البيضاء | PPL | 80 | 10 | 109.53 | dhamar |
| al-abd-al-hubayb | ال عبد الحبيب | Āl ‘Abd al Ḩubayb | محافظة البيضاء | PPL | 80 | 8 | 109.22 | dhamar |
| buqah | بوقة | Būqah | محافظة البيضاء | PPL | 80 | 14 | 109.06 | dhamar |
| al-khabb | الخب | Al Khabb | محافظة البيضاء | PPL | 80 | 14 | 108.82 | dhamar |
| al-jarda | الجرداء | Al Jardā’ | محافظة البيضاء | PPL | 80 | 8 | 108.57 | dhamar |
| al-amran | ال عمران | Āl ‘Amrān | محافظة البيضاء | PPL | 80 | 76 | 108.20 | dhamar |
| matrah-ali-ahmad-al-amrani | مطرح علي أحمد العمراني | Maţraḩ ‘Alī Aḩmad al ‘Amrānī | محافظة البيضاء | PPL | 80 | 5 | 108.56 | dhamar |
| al-ubayd | ال عبيد | Āl ‘Ubayd | محافظة البيضاء | PPL | 80 | 13 | 108.10 | dhamar |
| al-abd-allah | ال عبد الله | Āl ‘Abd Allāh | محافظة البيضاء | PPL | 80 | 9 | 108.07 | dhamar |
| al-ihsam | الإحصام | Al Iḩşām | محافظة البيضاء | PPL | 80 | 6 | 107.00 | dhamar |
| al-jumri | الجمري | Al Jumrī | محافظة البيضاء | PPL | 80 | 4 | 95.61 | dhamar |
| masud | مسعود | Mas‘ūd | محافظة البيضاء | PPL | 80 | 4 | 95.83 | dhamar |
| al-khashab | الخشب | Al Khashab | محافظة البيضاء | PPL | 80 | 2 | 98.76 | dhamar |
| al-qamalah | القمعلة | Al Qam‘alah | محافظة البيضاء | PPL | 80 | 6 | 111.34 | dhamar |
| al-maythabah | الميثابة | Al Maythābah | محافظة البيضاء | PPL | 80 | 6 | 111.14 | dhamar |
| al-mahjan | المحجن | Al Maḩjan | محافظة البيضاء | PPL | 80 | 3 | 108.05 | dhamar |
| wasit | واسط | Wāsiţ | محافظة البيضاء | PPL | 80 | 4 | 112.51 | dhamar |
| al-hadbah | الهضبة | Al Haḑbah | محافظة البيضاء | PPL | 80 | 6 | 112.24 | dhamar |
| al-amir | ال عمير | Āl ‘Amīr | محافظة البيضاء | PPL | 80 | 6 | 112.56 | dhamar |
| al-hamran | الحمران | Al Ḩamrān | محافظة البيضاء | PPL | 80 | 10 | 109.86 | dhamar |
| al-bawt | البوت | Al Bawt | محافظة البيضاء | PPL | 80 | 7 | 105.58 | dhamar |
| at-tuhzah | التحظة | At Tuḩz̧ah | محافظة البيضاء | PPL | 80 | 11 | 105.16 | dhamar |
| al-mishyaf | المشياف | Al Mishyāf | محافظة البيضاء | PPL | 80 | 3 | 107.15 | dhamar |
| masrub-al-khalif | مصروب الخالف | Maşrūb al Khālif | محافظة البيضاء | PPL | 80 | 2 | 108.42 | dhamar |
| tall-faras | تل فرس | Tall Faras | محافظة البيضاء | PPL | 80 | 2 | 107.43 | dhamar |
| ghaymal-al-malban | غيمال الملبن | Ghaymāl al Malban | محافظة البيضاء | PPL | 80 | 1 | 107.71 | dhamar |
| as-sufri | الصفري | Aş Şufrī | محافظة البيضاء | PPL | 80 | 3 | 107.25 | dhamar |
| al-jumaymah | الجميمة | Al Jumaymah | محافظة البيضاء | PPL | 80 | 1 | 107.66 | dhamar |
| khalif | خالف | Khālif | محافظة البيضاء | PPL | 80 | 8 | 109.78 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 2 | 109.66 | dhamar |
| dhu-an-nimrin-qushayib | ذو النمرين قشايب | Dhū an Nimrīn Qushāyib | محافظة البيضاء | PPL | 80 | 5 | 109.96 | dhamar |
| al-judum | الجدوم | Al Judūm | محافظة البيضاء | PPL | 80 | 3 | 110.68 | dhamar |
| al-jahlan | ال جحلان | Āl Jaḩlān | محافظة البيضاء | PPL | 80 | 3 | 109.79 | dhamar |
| ar-rahabah | الرحبة | Ar Raḩabah | محافظة البيضاء | PPL | 80 | 3 | 108.06 | dhamar |
| lashqam | لشقم | Lashqam | محافظة البيضاء | PPL | 80 | 10 | 107.75 | dhamar |
| saraq | سرق | Saraq | محافظة البيضاء | PPL | 80 | 9 | 107.58 | dhamar |
| al-hudaydah | الحديدة | Al Ḩudaydah | محافظة البيضاء | PPL | 80 | 7 | 107.49 | dhamar |
| farashah | فراشة | Farāshah | محافظة البيضاء | PPL | 80 | 2 | 107.51 | dhamar |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة البيضاء | PPL | 80 | 2 | 107.69 | dhamar |
| sayyid | سيد | Sayyid | محافظة البيضاء | PPL | 80 | 4 | 107.47 | dhamar |
| al-amiriyah | العامرية | Al ‘Āmirīyah | محافظة البيضاء | PPL | 80 | 6 | 106.89 | dhamar |
| tihnays | تيحنيس | Tīḩnays | محافظة البيضاء | PPL | 80 | 9 | 106.69 | dhamar |
| al-jizar | الجزار | Al Jizār | محافظة البيضاء | PPL | 80 | 8 | 106.23 | dhamar |
| ghawl-hassan | غول حسن | Ghawl Ḩassan | محافظة البيضاء | PPL | 80 | 9 | 112.72 | dhamar |
| al-muhsin-ali | ال محسن علي | Āl Muḩsin ‘Alī | محافظة البيضاء | PPL | 80 | 8 | 112.96 | dhamar |
| rahab-al-qawani | رحاب القوانع | Raḩāb al Qawāni‘ | محافظة البيضاء | PPL | 80 | 5 | 113.09 | dhamar |
| hayd-ahmad-iwad | حيد أحمد عوض | Ḩayd Aḩmad ‘Iwaḑ | محافظة البيضاء | PPL | 80 | 15 | 112.98 | dhamar |
| al-hasan-ali | ال حسن علي | Āl Ḩasan ‘Alī | محافظة البيضاء | PPL | 80 | 5 | 113.14 | dhamar |
| al-malhah | الملحة | Al Malḩah | محافظة البيضاء | PPL | 80 | 12 | 104.47 | dhamar |
| al-maalla | المعلاء | Al Ma‘allā’ | محافظة البيضاء | PPL | 80 | 9 | 105.01 | dhamar |
| al-jarda | الجرداء | Al Jardā’ | محافظة البيضاء | PPL | 80 | 3 | 105.23 | dhamar |
| al-mualliq | المعلق | Al Mu‘alliq | محافظة البيضاء | PPL | 80 | 6 | 105.05 | dhamar |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة البيضاء | PPL | 80 | 10 | 105.64 | dhamar |
| ar-raghwaf | الرغوف | Ar Raghwaf | محافظة البيضاء | PPL | 80 | 6 | 105.69 | dhamar |
| matas | مطعاس | Maţ‘ās | محافظة البيضاء | PPL | 80 | 3 | 106.20 | dhamar |
| al-hajni | الحجني | Al Ḩajnī | محافظة البيضاء | PPL | 80 | 3 | 105.41 | dhamar |
| hayd-al-jarf | حيد الجرف | Ḩayd al Jarf | محافظة البيضاء | PPL | 80 | 6 | 106.10 | dhamar |
| ad-daraj | الدرج | Ad Daraj | محافظة البيضاء | PPL | 80 | 36 | 106.38 | dhamar |
| al-masqa | المسقى | Al Masqá | محافظة البيضاء | PPL | 80 | 4 | 104.44 | dhamar |
| ghawl-al-awar-al-mughta | غول العوار المغطى | Ghawl al ‘Awār al Mughţá | محافظة البيضاء | PPL | 80 | 3 | 104.61 | dhamar |
| al-aqzal | الأقزل | Al Aqzal | محافظة البيضاء | PPL | 80 | 6 | 106.66 | dhamar |
| al-mukhannaq | المخنق | Al Mukhannaq | محافظة البيضاء | PPL | 80 | 12 | 104.81 | dhamar |
| rahab | رحاب | Raḩāb | محافظة البيضاء | PPL | 80 | 4 | 105.08 | dhamar |
| hayd-habas | حيد حباس | Ḩayd Ḩabās | محافظة البيضاء | PPL | 80 | 5 | 103.58 | dhamar |
| naamah | نعامة | Na‘āmah | محافظة البيضاء | PPL | 80 | 26 | 103.11 | dhamar |
| al-haddad | الحدد | Al Ḩaddad | محافظة البيضاء | PPL | 80 | 8 | 103.71 | dhamar |
| adh-dhayb | الذيب | Adh Dhayb | محافظة البيضاء | PPL | 80 | 7 | 101.86 | dhamar |
| al-maghti | المغطي | Al Maghţī | محافظة البيضاء | PPL | 80 | 10 | 102.23 | dhamar |
| at-talas | الطلاس | Aţ Ţalās | محافظة البيضاء | PPL | 80 | 2 | 101.72 | dhamar |
| al-ghubar | الغبار | Al Ghubār | محافظة البيضاء | PPL | 80 | 7 | 101.87 | dhamar |
| ghawl-ali | غول علي | Ghawl ‘Alī | محافظة البيضاء | PPL | 80 | 11 | 101.38 | dhamar |
| al-hawtah | الحوطة | Al Ḩawţah | محافظة البيضاء | PPL | 80 | 6 | 101.42 | dhamar |
| hawsh-al-maiz | حوش الماعز | Ḩawsh al Mā‘iz | محافظة البيضاء | PPL | 80 | 3 | 104.48 | dhamar |
| hayd-al-babayn | حيد البابين | Ḩayd al Bābayn | محافظة البيضاء | PPL | 80 | 5 | 104.31 | dhamar |
| al-jawhir | ال جوهر | Āl Jawhir | محافظة البيضاء | PPL | 80 | 10 | 111.79 | dhamar |
| al-muhammad | ال محمد | Āl Muḩammad | محافظة البيضاء | PPL | 80 | 4 | 112.71 | dhamar |
| al-madid | ال مديد | Āl Madīd | محافظة البيضاء | PPL | 80 | 6 | 112.65 | dhamar |
| al-hilal | ال هلال | Āl Hilāl | محافظة البيضاء | PPL | 80 | 36 | 111.84 | dhamar |
| al-fuqara | الفقراء | Al Fuqarā’ | محافظة البيضاء | PPL | 80 | 17 | 111.38 | dhamar |
| al-khalif | الخالف | Al Khālif | محافظة البيضاء | PPL | 80 | 5 | 103.53 | dhamar |
| al-qawashir | القواشر | Al Qawāshir | محافظة البيضاء | PPL | 80 | 4 | 103.69 | dhamar |
| jawhar | جوهر | Jawhar | محافظة البيضاء | PPL | 80 | 16 | 106.34 | dhamar |
| al-alawi | العلاوي | Al ‘Alāwī | محافظة البيضاء | PPL | 80 | 11 | 106.77 | dhamar |
| jirbat-al-khadr | جربة الخضر | Jirbat al Khaḑr | محافظة البيضاء | PPL | 80 | 2 | 104.47 | dhamar |
| al-junubah | الجنوبة | Al Junūbah | محافظة البيضاء | PPL | 80 | 11 | 103.63 | dhamar |
| al-manatrah | المنطرح | Al Manaţraḩ | محافظة البيضاء | PPL | 80 | 3 | 105.39 | dhamar |
| al-jazah | الجزعة | Al Jaz‘ah | محافظة البيضاء | PPL | 80 | 5 | 103.43 | dhamar |
| saqayat-al-qawashir | سقاية القواشر | Saqāyat al Qawāshir | محافظة البيضاء | PPL | 80 | 3 | 103.98 | dhamar |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة البيضاء | PPL | 80 | 5 | 104.88 | dhamar |
| al-harf | الحرف | Al Ḩarf | محافظة البيضاء | PPL | 80 | 19 | 104.72 | dhamar |
| marad-at-tubay | مرد التبيع | Marad at Tubay‘ | محافظة البيضاء | PPL | 80 | 6 | 104.29 | dhamar |
| ash-shakribah | الشكربة | Ash Shakribah | محافظة البيضاء | PPL | 80 | 5 | 105.38 | dhamar |
| al-ali-salih | ال علي صالح | Āl ‘Alī Şāliḩ | محافظة البيضاء | PPL | 80 | 5 | 104.95 | dhamar |
| al-ismail | ال إسماعيل | Āl Ismā‘īl | محافظة البيضاء | PPL | 80 | 7 | 129.50 | dhamar |
| al-humayqan | ال حميقان | Āl Ḩumayqān | محافظة البيضاء | PPL | 80 | 4 | 129.06 | dhamar |
| al-yusifiyah | اليوسفية | Al Yūsifīyah | محافظة البيضاء | PPL | 80 | 7 | 124.46 | dhamar |
| am-hadbah | أمهضبة | Am Haḑbah | محافظة البيضاء | PPL | 80 | 4 | 124.73 | dhamar |
| al-malajim | الملاجم | Al Malājim | محافظة البيضاء | PPL | 80 | 16 | 122.07 | dhamar |
| al-hudayb | ال هديب | Āl Hudayb | محافظة البيضاء | PPL | 80 | 9 | 121.82 | dhamar |
| al-hassan | ال حسن | Āl Ḩassan | محافظة البيضاء | PPL | 80 | 7 | 122.58 | dhamar |
| al-mazrab | المظرب | Al Maz̧rab | محافظة البيضاء | PPL | 80 | 8 | 122.82 | dhamar |
| al-sanib | ال صانب | Āl Şānib | محافظة البيضاء | PPL | 80 | 2 | 122.60 | dhamar |
| tawzah | توزة | Tawzah | محافظة البيضاء | PPL | 80 | 3 | 124.47 | dhamar |
| al-madhas | المدحس | Al Madḩas | محافظة البيضاء | PPL | 80 | 8 | 123.63 | dhamar |
| al-hadbah | الهضبة | Al Haḑbah | محافظة البيضاء | PPL | 80 | 4 | 123.63 | dhamar |
| as-salam | السلام | As Salām | محافظة البيضاء | PPL | 80 | 32 | 122.42 | dhamar |
| al-qurayn-al-wusta | القرين الوسطى | Al Qurayn al Wustá | محافظة البيضاء | PPL | 80 | 43 | 121.08 | dhamar |
| hayd-abd-allah | حيد عبد الله | Ḩayd ‘Abd Allāh | محافظة البيضاء | PPL | 80 | 18 | 123.65 | dhamar |
| al-mansurah | المنصورة | Al Manşūrah | محافظة البيضاء | PPL | 80 | 44 | 121.95 | dhamar |
| al-mujraysh | المجريش | Al Mujraysh | محافظة البيضاء | PPL | 80 | 41 | 121.47 | dhamar |
| al-hammas | ال حماص | Āl Ḩammāş | محافظة البيضاء | PPL | 80 | 47 | 121.88 | dhamar |
| al-hamati | الحماطي | Al Ḩamāţī | محافظة البيضاء | PPL | 80 | 43 | 121.23 | dhamar |
| al-mashabah | المشبة | Al Mashabah | محافظة البيضاء | PPL | 80 | 25 | 121.69 | dhamar |
| zimhar | زمهر | Zimhar | محافظة البيضاء | PPL | 80 | 49 | 123.66 | dhamar |
| an-nuqub | النقوب | An Nuqūb | محافظة البيضاء | PPL | 80 | 27 | 122.96 | dhamar |
| al-mahtad | المحتد | Al Maḩtad | محافظة البيضاء | PPL | 80 | 11 | 123.40 | dhamar |
| an-naq | النقع | An Naq‘ | محافظة البيضاء | PPL | 80 | 9 | 123.63 | dhamar |
| ghulban | غلبان | Ghulbān | محافظة البيضاء | PPL | 80 | 8 | 124.12 | dhamar |
| salalah | صلالة | Şalālah | محافظة البيضاء | PPL | 80 | 2 | 124.30 | dhamar |
| al-udhaynah | العذيبة | Al ‘Udhaynah | محافظة البيضاء | PPL | 80 | 6 | 125.40 | dhamar |
| al-mansurah | المنصورة | Al Manşūrah | محافظة البيضاء | PPL | 80 | 24 | 81.28 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 5 | 81.14 | dhamar |
| ahdam | أحدم | Aḩdam | محافظة البيضاء | PPL | 80 | 2 | 81.15 | dhamar |
| khurr-al-mahsan | خر المحسن | Khurr al Maḩsan | محافظة البيضاء | PPL | 80 | 43 | 71.85 | dhamar |
| as-sawda | السوداء | As Sawdā’ | محافظة البيضاء | PPL | 80 | 2 | 76.43 | dhamar |
| hayd-nasir | حيد ناصر | Ḩayd Nāşir | محافظة البيضاء | PPL | 80 | 13 | 76.52 | dhamar |
| ad-darb | الدرب | Ad Darb | محافظة البيضاء | PPL | 80 | 6 | 76.42 | dhamar |
| al-aylat | العيلات | Al ‘Aylāt | محافظة البيضاء | PPL | 80 | 12 | 74.12 | dhamar |
| al-birsh | البرش | Al Birsh | محافظة البيضاء | PPL | 80 | 1 | 66.58 | dhamar |
| al-hat | الحاط | Al Ḩāţ | محافظة البيضاء | PPL | 80 | 12 | 65.75 | dhamar |
| as-sadiq | الصادق | Aş Şādiq | محافظة البيضاء | PPL | 80 | 19 | 66.50 | dhamar |
| al-qawz | القوز | Al Qawz | محافظة البيضاء | PPL | 80 | 5 | 68.83 | dhamar |
| dar-aziz | دار عزيز | Dār ‘Azīz | محافظة البيضاء | PPL | 80 | 9 | 70.15 | dhamar |
| maznajah | مزنجة | Maznajah | محافظة البيضاء | PPL | 80 | 8 | 69.45 | dhamar |
| al-qawz | القوز | Al Qawz | محافظة البيضاء | PPL | 80 | 17 | 69.45 | dhamar |
| qada | قداع | Qadā‘ | محافظة البيضاء | PPL | 80 | 23 | 70.51 | dhamar |
| az-zukhmah | الزخمة | Az Zukhmah | محافظة البيضاء | PPL | 80 | 6 | 71.97 | dhamar |
| al-mansurah | المنصورة | Al Manşūrah | محافظة البيضاء | PPL | 80 | 7 | 71.37 | dhamar |
| al-khadra | الخضراء | Al Khaḑrā’ | محافظة البيضاء | PPL | 80 | 9 | 70.77 | dhamar |
| at-tubayl | الطبيل | Aţ Ţubayl | محافظة البيضاء | PPL | 80 | 6 | 71.92 | dhamar |
| al-amiqah | العمقة | Al ‘Amiqah | محافظة البيضاء | PPL | 80 | 4 | 74.89 | dhamar |
| al-qawz | القوز | Al Qawz | محافظة البيضاء | PPL | 80 | 11 | 74.32 | dhamar |
| al-ibli | العبلي | Al ‘Iblī | محافظة البيضاء | PPL | 80 | 11 | 74.10 | dhamar |
| maalla | معلاء | Ma‘allā’ | محافظة البيضاء | PPL | 80 | 2 | 74.38 | dhamar |
| dabaah | ضباعة | Ḑabā‘ah | محافظة البيضاء | PPL | 80 | 5 | 74.05 | dhamar |
| at-tam | التام | At Tām | محافظة البيضاء | PPL | 80 | 4 | 75.23 | dhamar |
| al-uthaymiyah | العثيمية | Al ‘Uthaymīyah | محافظة البيضاء | PPL | 80 | 8 | 76.40 | dhamar |
| al-qubbah | القبة | Al Qubbah | محافظة البيضاء | PPL | 80 | 5 | 76.70 | dhamar |
| al-yazid-al-gharus | ال يزيد الغروس | Āl Yazīd al Gharūs | محافظة البيضاء | PPL | 80 | 8 | 77.05 | dhamar |
| al-qawz-adh-dhira | ال قوز الذراع | Āl Qawz adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 3 | 75.73 | dhamar |
| ubaydat | عبيدات | ‘Ubaydāt | محافظة البيضاء | PPL | 80 | 2 | 75.59 | dhamar |
| at-tawam | التوام | At Tawām | محافظة البيضاء | PPL | 80 | 29 | 85.28 | dhamar |
| al-khaniq | الخانق | Al Khāniq | محافظة البيضاء | PPL | 80 | 10 | 85.45 | dhamar |
| al-quray | القريع | Al Quray‘ | محافظة البيضاء | PPL | 80 | 4 | 85.22 | dhamar |
| ash-shadqa | الشدقاء | Ash Shadqā‘ | محافظة البيضاء | PPL | 80 | 11 | 85.00 | dhamar |
| awkabah | عوكبة | ‘Awkabah | محافظة البيضاء | PPL | 80 | 4 | 84.41 | dhamar |
| al-junab | الجناب | Al Junāb | محافظة البيضاء | PPL | 80 | 5 | 84.73 | dhamar |
| ar-riyud | الريود | Ar Riyūd | محافظة البيضاء | PPL | 80 | 14 | 85.28 | dhamar |
| far-ar-riyud | فرع الريود | Far‘ ar Riyūd | محافظة البيضاء | PPL | 80 | 13 | 85.25 | dhamar |
| kharabat-ar-riyud | خرابة الريود | Kharābat ar Riyūd | محافظة البيضاء | PPL | 80 | 21 | 85.17 | dhamar |
| hayd-ar-riyud | حيد الريود | Ḩayd ar Riyūd | محافظة البيضاء | PPL | 80 | 8 | 85.13 | dhamar |
| ad-dahah | الضاحة | Aḑ Ḑāḩah | محافظة البيضاء | PPL | 80 | 3 | 71.17 | dhamar |
| as-sabl | الصبل | Aş Şabl | محافظة البيضاء | PPL | 80 | 3 | 80.12 | dhamar |
| bayt-nasir | بيت ناصر | Bayt Nāşir | محافظة البيضاء | PPL | 80 | 2 | 80.11 | dhamar |
| al-qalumah | القلومة | Al Qalūmah | محافظة البيضاء | PPL | 80 | 6 | 81.90 | dhamar |
| dhuban | ذبان | Dhubān | محافظة البيضاء | PPL | 80 | 29 | 82.52 | dhamar |
| al-khirbah | الخربة | Al Khirbah | محافظة البيضاء | PPL | 80 | 31 | 85.72 | dhamar |
| al-hammah | الحمة | Al Ḩammah | محافظة البيضاء | PPL | 80 | 12 | 85.36 | dhamar |
| al-hadbah | الهضبة | Al Haḑbah | محافظة البيضاء | PPL | 80 | 11 | 86.27 | dhamar |
| al-quflah | القفلة | Al Quflah | محافظة البيضاء | PPL | 80 | 4 | 84.11 | dhamar |
| al-muhjibah | المحجبة | Al Muḩjibah | محافظة البيضاء | PPL | 80 | 2 | 84.19 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 23 | 83.77 | dhamar |
| al-faragh | الفرغ | Al Faragh | محافظة البيضاء | PPL | 80 | 16 | 84.83 | dhamar |
| al-qabil | القابل | Al Qābil | محافظة البيضاء | PPL | 80 | 11 | 84.74 | dhamar |
| al-bidayi | البدايع | Al Bidāyi‘ | محافظة البيضاء | PPL | 80 | 8 | 83.16 | dhamar |
| hakr-al-asfal | هكر الأسفل | Hakr al Asfal | محافظة البيضاء | PPL | 80 | 7 | 82.68 | dhamar |
| hakr-al-ala | هكر الأعلى | Hakr al A‘lá | محافظة البيضاء | PPL | 80 | 18 | 82.37 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 17 | 82.38 | dhamar |
| al-jurayda | الجريداء | Al Juraydā’ | محافظة البيضاء | PPL | 80 | 21 | 82.72 | dhamar |
| al-kharabah | الخرابة | Al Kharābah | محافظة البيضاء | PPL | 80 | 25 | 82.90 | dhamar |
| al-qatah | القطعة | Al Qaţ‘ah | محافظة البيضاء | PPL | 80 | 25 | 79.91 | dhamar |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة البيضاء | PPL | 80 | 3 | 79.84 | dhamar |
| al-munqati | المنقطع | Al Munqaţi‘ | محافظة البيضاء | PPL | 80 | 3 | 80.02 | dhamar |
| al-ghubayb | الغبيب | Al Ghubayb | محافظة البيضاء | PPL | 80 | 3 | 80.09 | dhamar |
| al-kharabah | الخرابة | Al Kharābah | محافظة البيضاء | PPL | 80 | 5 | 79.59 | dhamar |
| al-amud | العمود | Al ‘Amūd | محافظة البيضاء | PPL | 80 | 10 | 84.23 | dhamar |
| sinnan | سنان | Sinnān | محافظة البيضاء | PPL | 80 | 4 | 85.39 | dhamar |
| ar-rayah | الريعة | Ar Ray‘ah | محافظة البيضاء | PPL | 80 | 11 | 85.53 | dhamar |
| al-kurayfin | الكريفين | Al Kurayfīn | محافظة البيضاء | PPL | 80 | 13 | 85.80 | dhamar |
| al-qazah | القزعة | Al Qaz‘ah | محافظة البيضاء | PPL | 80 | 2 | 85.87 | dhamar |
| mani | مانع | Māni‘ | محافظة البيضاء | PPL | 80 | 15 | 85.51 | dhamar |
| shahab | شهاب | Shahāb | محافظة البيضاء | PPL | 80 | 4 | 85.06 | dhamar |
| al-ashar | الأشعر | Al Ash‘ar | محافظة البيضاء | PPL | 80 | 17 | 85.39 | dhamar |
| ghalib | غالب | Ghālib | محافظة البيضاء | PPL | 80 | 7 | 83.41 | dhamar |
| al-kharayitah | الخرايطة | Al Kharāyiţah | محافظة البيضاء | PPL | 80 | 4 | 83.56 | dhamar |
| takhlal | تخلال | Takhlāl | محافظة البيضاء | PPL | 80 | 4 | 83.80 | dhamar |
| al-ghumlah | الغملة | Al Ghumlah | محافظة البيضاء | PPL | 80 | 6 | 84.13 | dhamar |
| hamumah | حمومة | Ḩamūmah | محافظة البيضاء | PPL | 80 | 5 | 84.39 | dhamar |
| al-buday | البديع | Al Buday‘ | محافظة البيضاء | PPL | 80 | 5 | 85.04 | dhamar |
| as-sarm | الصرم | Aş Şarm | محافظة البيضاء | PPL | 80 | 8 | 85.44 | dhamar |
| al-irq | العرق | Al ‘Irq | محافظة البيضاء | PPL | 80 | 16 | 85.26 | dhamar |
| an-nashur | النشور | An Nashūr | محافظة الضالع | PPL | 80 | 8 | 86.09 | dhamar |
| al-qullatayn | القلتين | Al Qullatayn | محافظة الضالع | PPL | 80 | 8 | 86.25 | dhamar |
| al-akrimah | العكرمة | Al ‘Akrimah | محافظة مأرب | PPL | 80 | 8 | 58.16 | marib |
| shamsan | شمسان | Shamsān | محافظة البيضاء | PPL | 80 | 8 | 93.05 | dhamar |
| al-urr | العر | Al ‘Urr | محافظة البيضاء | PPL | 80 | 2 | 94.23 | dhamar |
| al-qushlah | القشلة | Al Qushlah | محافظة البيضاء | PPL | 80 | 4 | 92.97 | dhamar |
| al-muhammad | ال محمد | Āl Muḩammad | محافظة البيضاء | PPL | 80 | 20 | 102.37 | dhamar |
| lawjar | لوجر | Lawjar | محافظة البيضاء | PPL | 80 | 3 | 102.11 | dhamar |
| al-husayn-muhammad | ال حسين محمد | Āl Ḩusayn Muḩammad | محافظة البيضاء | PPL | 80 | 9 | 102.38 | dhamar |
| al-muhammad | ال محمد | Āl Muḩammad | محافظة البيضاء | PPL | 80 | 8 | 101.97 | dhamar |
| al-ghuramah | ال غرامة | Āl Ghurāmah | محافظة البيضاء | PPL | 80 | 4 | 102.78 | dhamar |
| al-ibrahim | ال إبراهيم | Āl Ibrāhīm | محافظة البيضاء | PPL | 80 | 17 | 101.63 | dhamar |
| al-faran | الفرعان | Al Far‘ān | محافظة البيضاء | PPL | 80 | 6 | 101.23 | dhamar |
| al-malih-zaydan | المالح زيدان | Al Māliḩ Zaydān | محافظة البيضاء | PPL | 80 | 3 | 101.74 | dhamar |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة البيضاء | PPL | 80 | 2 | 102.01 | dhamar |
| al-mansurah | المنصورة | Al Manşūrah | محافظة البيضاء | PPL | 80 | 3 | 101.91 | dhamar |
| az-zawahir | الزواهر | Az Zawāhir | محافظة البيضاء | PPL | 80 | 10 | 102.02 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 19 | 101.28 | dhamar |
| al-shirqan | ال شرقان | Āl Shirqān | محافظة البيضاء | PPL | 80 | 15 | 101.13 | dhamar |
| al-abl-as-samarah | العبل السمرة | Al ‘Abl as Samarah | محافظة البيضاء | PPL | 80 | 2 | 100.44 | marib |
| an-nusbah | النصبة | An Nuşbah | محافظة البيضاء | PPL | 80 | 12 | 103.45 | dhamar |
| al-mudhabih | المذابح | Al Mudhābiḩ | محافظة البيضاء | PPL | 80 | 15 | 103.88 | dhamar |
| an-nusbah | النصبة | An Nuşbah | محافظة البيضاء | PPL | 80 | 6 | 104.47 | dhamar |
| al-ulayb | العليب | Al ‘Ulayb | محافظة البيضاء | PPL | 80 | 3 | 105.69 | marib |
| mishabi | مشابي | Mishābī | محافظة البيضاء | PPL | 80 | 4 | 99.76 | marib |
| qaryat-jalum | قرية جلعوم | Qaryat Jal‘ūm | محافظة البيضاء | PPL | 80 | 1 | 101.66 | dhamar |
| al-misawah | المساوح | Al Misāwaḩ | محافظة البيضاء | PPL | 80 | 2 | 93.98 | marib |
| ar-rasmah | الرسمة | Ar Rasmah | محافظة البيضاء | PPL | 80 | 2 | 93.98 | marib |
| al-muhit | المحيط | Al Muḩīţ | محافظة البيضاء | PPL | 80 | 2 | 94.12 | marib |
| al-hammah | الحمة | Al Ḩammah | محافظة البيضاء | PPL | 80 | 22 | 94.33 | marib |
| jarim | جريم | Jarīm | محافظة البيضاء | PPL | 80 | 6 | 89.32 | dhamar |
| al-arjamah | العرجمة | Al ‘Arjamah | محافظة البيضاء | PPL | 80 | 3 | 89.45 | dhamar |
| as-sadah | السادة | As Sādah | محافظة البيضاء | PPL | 80 | 4 | 89.11 | dhamar |
| al-juzbah | الجزبة | Al Juzbah | محافظة البيضاء | PPL | 80 | 7 | 89.56 | dhamar |
| al-quflah | القفلة | Al Quflah | محافظة البيضاء | PPL | 80 | 2 | 89.42 | dhamar |
| qawa | قوى | Qawá | محافظة البيضاء | PPL | 80 | 15 | 87.60 | dhamar |
| far-ad-dirah | فرع الديرة | Far‘ ad Dīrah | محافظة البيضاء | PPL | 80 | 3 | 87.51 | dhamar |
| al-muhsin | ال محسن | Āl Muḩsin | محافظة البيضاء | PPL | 80 | 6 | 87.58 | dhamar |
| al-makhwal | المخوال | Al Makhwāl | محافظة البيضاء | PPL | 80 | 4 | 87.85 | dhamar |
| at-taif | الطائف | Aţ Ţā’if | محافظة البيضاء | PPL | 80 | 20 | 88.65 | dhamar |
| al-batan-al-asfal | البطان الأسفل | Al Baţān al Asfal | محافظة البيضاء | PPL | 80 | 2 | 89.61 | dhamar |
| wasit | واسط | Wāsiţ | محافظة مأرب | PPL | 80 | 1 | 96.74 | dhamar |
| at-tarifah | الطارفة | Aţ Ţārifah | محافظة البيضاء | PPL | 80 | 1 | 98.05 | dhamar |
| al-aqal | العقال | Al ‘Aqāl | محافظة مأرب | PPL | 80 | 1 | 95.12 | dhamar |
| al-kurayf | الكريف | Al Kurayf | محافظة البيضاء | PPL | 80 | 11 | 95.49 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة البيضاء | PPL | 80 | 2 | 94.71 | dhamar |
| al-milh | الملح | Al Milḩ | محافظة البيضاء | PPL | 80 | 3 | 95.32 | dhamar |
| as-saqiyah | الساقية | As Sāqīyah | محافظة البيضاء | PPL | 80 | 1 | 95.60 | dhamar |
| al-mansaah | المنصاعة | Al Manşā‘ah | محافظة البيضاء | PPL | 80 | 3 | 95.78 | dhamar |
| al-qufl | القفل | Al Qufl | محافظة البيضاء | PPL | 80 | 1 | 94.76 | dhamar |
| al-uthayl | الأثيل | Al Uthayl | محافظة البيضاء | PPL | 80 | 2 | 72.44 | dhamar |
| lamlal | لملال | Lamlāl | محافظة البيضاء | PPL | 80 | 2 | 69.26 | dhamar |
| al-mawtal | الموطل | Al Mawţal | محافظة البيضاء | PPL | 80 | 6 | 68.54 | dhamar |
| rummum | رمم | Rummum | محافظة البيضاء | PPL | 80 | 3 | 70.26 | dhamar |
| al-hanu | الحنو | Al Ḩanū | محافظة البيضاء | PPL | 80 | 3 | 71.42 | dhamar |
| nasir | نصير | Naşīr | محافظة مأرب | PPL | 80 | 6 | 54.73 | marib |
| ahrah | أحرة | Aḩrah | محافظة مأرب | PPL | 80 | 4 | 55.76 | marib |
| al-jazi | الجازع | Al Jāzi‘ | محافظة مأرب | PPL | 80 | 3 | 93.55 | marib |
| al-kharabah | الخرابة | Al Kharābah | محافظة مأرب | PPL | 80 | 4 | 92.89 | marib |
| darb-al-habbah | درب الحبة | Darb al Ḩabbah | محافظة مأرب | PPL | 80 | 4 | 93.74 | marib |
| al-judaydah | الجديدة | Al Judaydah | محافظة مأرب | PPL | 80 | 2 | 90.00 | marib |
| al-hayd-al-ahmar | الحيد الأحمر | Al Ḩayd al Aḩmar | محافظة مأرب | PPL | 80 | 2 | 90.50 | marib |
| al-khalifah | الخالفة | Al Khālifah | محافظة مأرب | PPL | 80 | 6 | 90.98 | marib |
| bayt-al-udhri | بيت العذري | Bayt al ‘Udhrī | محافظة مأرب | PPL | 80 | 3 | 91.37 | marib |
| al-qatah | القطعة | Al Qaţ‘ah | محافظة مأرب | PPL | 80 | 3 | 92.78 | marib |
| al-bashirin | البشرين | Al Bashirīn | محافظة مأرب | PPL | 80 | 5 | 93.00 | marib |
| an-nas | النصع | An Naş‘ | محافظة مأرب | PPL | 80 | 1 | 92.78 | marib |
| dhira-marwan | ذراع مروان | Dhirā’ Marwān | محافظة مأرب | PPL | 80 | 3 | 93.52 | marib |
| bayt-ajwan | بيت عجوان | Bayt ‘Ajwān | محافظة مأرب | PPL | 80 | 6 | 93.14 | marib |
| at-talhah | الطلحة | Aţ Ţalḩah | محافظة مأرب | PPL | 80 | 10 | 93.36 | marib |
| dhira-al-habab | ذراع الحباب | Dhirā’ al Ḩabāb | محافظة مأرب | PPL | 80 | 2 | 93.08 | marib |
| al-mansar | المنسر | Al Mansar | محافظة مأرب | PPL | 80 | 8 | 87.39 | marib |
| al-hajr | الهجر | Al Hajr | محافظة مأرب | PPL | 80 | 16 | 87.99 | marib |
| al-hujayrah | الهجيرة | Al Hujayrah | محافظة مأرب | PPL | 80 | 10 | 87.95 | marib |
| al-mitrash | المطراش | Al Miţrāsh | محافظة مأرب | PPL | 80 | 9 | 85.75 | marib |
| ujaym-al-asaq | عجيم العسق | ‘Ujaym al ‘Asaq | محافظة مأرب | PPL | 80 | 10 | 85.73 | marib |
| falhan | فلحان | Falḩān | محافظة مأرب | PPL | 80 | 4 | 85.43 | marib |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة مأرب | PPL | 80 | 7 | 85.57 | marib |
| al-kharabah-as-sufla | الخرابة السفلى | Al Kharābah as Suflá | محافظة مأرب | PPL | 80 | 3 | 89.35 | marib |
| ad-dulfa | الضلفاء | Aḑ Ḑulfā’ | محافظة مأرب | PPL | 80 | 2 | 88.97 | marib |
| al-kharabah | الخرابة | Al Kharābah | محافظة مأرب | PPL | 80 | 3 | 88.71 | marib |
| al-jayf | الجيف | Al Jayf | محافظة مأرب | PPL | 80 | 1 | 89.10 | marib |
| majab | معجب | Ma‘jab | محافظة مأرب | PPL | 80 | 4 | 89.04 | marib |
| al-adbah | العدبة | Al ‘Adbah | محافظة مأرب | PPL | 80 | 6 | 89.54 | marib |
| khalilah-al-ulya | خليلة العليا | Khalīlah al ‘Ulyā | محافظة مأرب | PPL | 80 | 4 | 89.19 | marib |
| as-samih | الصامح | Aş Şāmiḩ | محافظة مأرب | PPL | 80 | 1 | 89.34 | marib |
| al-uqlah | العقلة | Al ‘Uqlah | محافظة مأرب | PPL | 80 | 5 | 89.24 | marib |
| ash-shaqiqah | الشقيقة | Ash Shaqīqah | محافظة مأرب | PPL | 80 | 8 | 83.76 | marib |
| an-najd | النجد | An Najd | محافظة مأرب | PPL | 80 | 1 | 90.85 | marib |
| al-jazi | الجازع | Al Jāzi‘ | محافظة مأرب | PPL | 80 | 9 | 91.95 | marib |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة مأرب | PPL | 80 | 1 | 92.27 | marib |
| al-hadbah | الهضبة | Al Haḑbah | محافظة مأرب | PPL | 80 | 4 | 92.64 | marib |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة مأرب | PPL | 80 | 8 | 92.02 | marib |
| ash-shurayzah | الشريزة | Ash Shurayzah | محافظة مأرب | PPL | 80 | 3 | 91.70 | marib |
| al-husayr | الحصير | Al Ḩuşayr | محافظة مأرب | PPL | 80 | 16 | 91.26 | marib |
| al-hayf | الحيف | Al Ḩayf | محافظة مأرب | PPL | 80 | 4 | 91.44 | marib |
| al-khalifan | الخلفان | Al Khalifān | محافظة مأرب | PPL | 80 | 2 | 71.86 | marib |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة مأرب | PPL | 80 | 1 | 71.91 | marib |
| as-saniqah | الصنيقة | Aş Şanīqah | محافظة مأرب | PPL | 80 | 2 | 71.34 | marib |
| abbad-maqbal | عباد مقبل | ‘Abbād Maqbal | محافظة مأرب | PPL | 80 | 3 | 72.19 | marib |
| asatinah | عساتنة | ‘Asātinah | محافظة مأرب | PPL | 80 | 6 | 76.37 | marib |
| sifh-quwayr | صفح قوير | Şifḩ Quwayr | محافظة مأرب | PPL | 80 | 2 | 72.54 | marib |
| ajmat-al-quflah | عجمة القفلة | ‘Ajmat al Quflah | محافظة مأرب | PPL | 80 | 2 | 71.75 | marib |
| al-wadih | الواضح | Al Wāḑiḩ | محافظة مأرب | PPL | 80 | 3 | 71.94 | marib |
| al-haylan | الهيلان | Al Haylān | محافظة مأرب | PPL | 80 | 2 | 73.11 | marib |
| ath-thamarah | الثمرة | Ath Thamarah | محافظة مأرب | PPL | 80 | 3 | 73.64 | marib |
| hazm-maqbal | حزم مقبل | Ḩazm Maqbal | محافظة مأرب | PPL | 80 | 20 | 72.68 | marib |
| mawqa | موقع | Mawqa‘ | محافظة مأرب | PPL | 80 | 4 | 94.28 | marib |
| jayf-al-humaydi | جيف الحميدي | Jayf al Ḩumaydī | محافظة مأرب | PPL | 80 | 3 | 93.86 | marib |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة مأرب | PPL | 80 | 1 | 93.69 | marib |
| al-furush | الفروش | Al Furūsh | محافظة مأرب | PPL | 80 | 2 | 83.25 | marib |
| al-uhayd | العهيد | Al ‘Uhayd | محافظة مأرب | PPL | 80 | 3 | 71.51 | marib |
| radim | رضم | Raḑim | محافظة مأرب | PPL | 80 | 20 | 71.06 | marib |
| adh-dhira-ash-sharqi | الذراع الشرفي | Adh Dhirā‘ ash Sharqī | محافظة مأرب | PPL | 80 | 3 | 70.94 | marib |
| khalilah-al-ulya | خليلة العيا | Khalīlah al ‘Ulyā | محافظة مأرب | PPL | 80 | 3 | 84.73 | marib |
| as-sammam | السمم | As Sammam | محافظة مأرب | PPL | 80 | 7 | 83.85 | marib |
| quraydah | قريضة | Qurayḑah | محافظة مأرب | PPL | 80 | 7 | 83.48 | marib |
| al-kharabah | الخرابة | Al Kharābah | محافظة مأرب | PPL | 80 | 9 | 83.64 | marib |
| al-qaryah | القرية | Al Qaryah | محافظة مأرب | PPL | 80 | 2 | 83.47 | marib |
| qara | قرا | Qarā | محافظة مأرب | PPL | 80 | 2 | 80.09 | marib |
| al-janab | الجنب | Al Janab | محافظة مأرب | PPL | 80 | 6 | 84.25 | marib |
| al-lajmah | اللجمة | Al Lajmah | محافظة مأرب | PPL | 80 | 8 | 84.11 | marib |
| al-qatf | القطف | Al Qaţf | محافظة مأرب | PPL | 80 | 1 | 83.85 | marib |
| as-sawmaah | الصومعة | Aş Şawma‘ah | محافظة مأرب | PPL | 80 | 1 | 84.19 | marib |
| thubayn | ثبين | Thubayn | محافظة مأرب | PPL | 80 | 1 | 70.37 | marib |
| fahaz | فحظ | Faḩaz̧ | محافظة مأرب | PPL | 80 | 2 | 71.53 | marib |
| layliyah | ليلية | Laylīyah | محافظة مأرب | PPL | 80 | 4 | 70.08 | marib |
| al-majba | المجبا | Al Majbā | محافظة مأرب | PPL | 80 | 2 | 73.80 | marib |
| nakhl | نخل | Nakhl | محافظة مأرب | PPL | 80 | 2 | 70.59 | marib |
| al-buwarah | البوارة | Al Buwārah | محافظة مأرب | PPL | 80 | 15 | 82.24 | marib |
| al-mahkamah | المحكمة | Al Maḩkamah | محافظة مأرب | PPL | 80 | 5 | 86.51 | marib |
| az-zarwah | الزروة | Az Zarwah | محافظة مأرب | PPL | 80 | 1 | 87.89 | marib |
| as-sammam | السمم | As Sammam | محافظة مأرب | PPL | 80 | 3 | 86.89 | marib |
| al-jaraah | الجراعة | Al Jarā‘ah | محافظة مأرب | PPL | 80 | 1 | 86.95 | marib |
| al-batha | البطحاء | Al Baţḩā’ | محافظة مأرب | PPL | 80 | 1 | 91.41 | marib |
| hajr | حجر | Ḩajr | محافظة مأرب | PPL | 80 | 3 | 90.83 | marib |
| at-tulayhah-al-urr | الطليحة العر | Aţ Ţulayḩah al ‘Urr | محافظة مأرب | PPL | 80 | 12 | 98.42 | marib |
| al-shanun | ال شعنون | Āl Sha‘nūn | محافظة مأرب | PPL | 80 | 16 | 56.95 | marib |
| daban | ضبعان | Ḑab‘ān | محافظة مأرب | PPL | 80 | 2 | 55.72 | marib |
| al-utayyir | ال عطير | Āl ‘Uţayyir | محافظة مأرب | PPL | 80 | 50 | 57.02 | marib |
| usur | عصور | ‘Uşūr | محافظة مأرب | PPL | 80 | 3 | 66.49 | marib |
| as-suwayrah | الصويرة | Aş Şuwayrah | محافظة مأرب | PPL | 80 | 1 | 68.58 | marib |
| az-zawaq | الزوق | Az Zawaq | محافظة مأرب | PPL | 80 | 1 | 64.20 | marib |
| ath-thajarah | الثجرة | Ath Thajarah | محافظة مأرب | PPL | 80 | 8 | 64.08 | marib |
| hadban | هضبان | Haḑbān | محافظة مأرب | PPL | 80 | 5 | 62.97 | marib |
| al-qasr-abu-dhira | القصر أبو ذراع | Al Qaşr Abū Dhirā‘ | محافظة مأرب | PPL | 80 | 3 | 61.98 | marib |
| ad-dayyiq | الضيق | Aḑ Ḑayyiq | محافظة مأرب | PPL | 80 | 1 | 63.16 | marib |
| an-najad | النجاد | An Najād | محافظة مأرب | PPL | 80 | 2 | 60.30 | marib |
| al-kawlah | الكولة | Al Kawlah | محافظة مأرب | PPL | 80 | 3 | 69.12 | marib |
| al-hushaymah | الهشمية | Al Hushaymah | محافظة مأرب | PPL | 80 | 3 | 68.92 | marib |
| al-far-al-ahmar | الفرع الأحمر | Al Far‘ al Aḩmar | محافظة مأرب | PPL | 80 | 1 | 69.56 | marib |
| al-waqit | الوقيط | Al Waqīţ | محافظة مأرب | PPL | 80 | 4 | 70.36 | marib |
| awsha-ar-raqah | أوشع الرقعة | Awsha‘ ar Raq‘ah | محافظة مأرب | PPL | 80 | 4 | 74.69 | marib |
| al-hadhyanah | الحذيانة | Al Ḩadhyānah | محافظة مأرب | PPL | 80 | 4 | 75.41 | marib |
| al-abtar | الأبتر | Al Abtar | محافظة مأرب | PPL | 80 | 4 | 79.23 | marib |
| al-iqdaf | الإقضاف | Al Iqḑāf | محافظة مأرب | PPL | 80 | 9 | 79.92 | marib |
| al-muragh | المراغ | Al Murāgh | محافظة مأرب | PPL | 80 | 3 | 82.15 | marib |
| al-afah | الأفعة | Al Af‘ah | محافظة مأرب | PPL | 80 | 3 | 81.93 | marib |
| ath-thawrah | الثورة | Ath Thawrah | محافظة مأرب | PPL | 80 | 7 | 62.37 | marib |
| al-al-mabsuh | ال المبسوح | Āl al Mabsūḩ | محافظة مأرب | PPL | 80 | 12 | 65.74 | marib |
| far-al-mudhib | قرع المذب | Far‘ al Mudhib | محافظة مأرب | PPL | 80 | 2 | 77.18 | marib |
| umm-kamin | أم كمين | Umm Kamīn | محافظة مأرب | PPL | 80 | 2 | 77.86 | marib |
| al-harijah | الحرجة | Al Ḩarijah | محافظة مأرب | PPL | 80 | 1 | 79.01 | marib |
| dhira-al-ghawl | ذراع الغول | Dhirā‘ al Ghawl | محافظة مأرب | PPL | 80 | 2 | 77.97 | marib |
| al-ujayhar | الأجيحار | Al Ujayḩār | محافظة مأرب | PPL | 80 | 1 | 77.48 | marib |
| al-mirwa | المرواح | Al Mirwā | محافظة مأرب | PPL | 80 | 2 | 77.34 | marib |
| mawshir-al-asfal | موشرالاسفل | Mawshir al Asfal | محافظة مأرب | PPL | 80 | 1 | 81.25 | marib |
| al-falakiyah | الفلكية | Al Falakīyah | محافظة مأرب | PPL | 80 | 2 | 77.98 | marib |
| al-aghwal | الأغوال | Al Aghwāl | محافظة مأرب | PPL | 80 | 5 | 73.07 | marib |
| al-amrat | الأمرط | Al Amraţ | محافظة مأرب | PPL | 80 | 1 | 73.22 | marib |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة مأرب | PPL | 80 | 8 | 56.79 | marib |
| al-salim | ال سالم | Āl Sālim | محافظة مأرب | PPL | 80 | 8 | 57.88 | marib |
| al-husun | الحصون | Al Ḩuşūn | محافظة مأرب | PPL | 80 | 5 | 55.71 | marib |
| al-awarid | العوارض | Al ‘Awāriḑ | محافظة مأرب | PPL | 80 | 10 | 54.73 | marib |
| marashah | مرشة | Marashah | محافظة مأرب | PPL | 80 | 7 | 56.66 | marib |
| al-khuwaylif | الخويلف | Al Khuwaylif | محافظة مأرب | PPL | 80 | 6 | 55.28 | marib |
| al-atafah | العطفة | Al ‘Aţafah | محافظة مأرب | PPL | 80 | 5 | 54.86 | marib |
| al-qasim | ال قاسم | Āl Qāsim | محافظة مأرب | PPL | 80 | 2 | 56.55 | marib |
| al-khashabah | الخشبة | Al Khashabah | محافظة مأرب | PPL | 80 | 2 | 60.41 | marib |
| ar-rawqa | الروقى | Ar Rawqá | محافظة مأرب | PPL | 80 | 1 | 57.61 | marib |
| al-ababah | العبابة | Al ‘Abābah | محافظة مأرب | PPL | 80 | 4 | 58.47 | marib |
| al-akramah | العكرمة | Al ‘Akramah | محافظة مأرب | PPL | 80 | 6 | 58.35 | marib |
| rumaylan | رميلان | Rumaylān | محافظة مأرب | PPL | 80 | 3 | 58.82 | marib |
| umm-sayf | أم صيف | Umm Şayf | محافظة مأرب | PPL | 80 | 9 | 59.31 | marib |
| al-hazm | الحزم | Al Ḩazm | محافظة مأرب | PPL | 80 | 18 | 58.65 | marib |
| akramat-al-abbud | عكرمة ال عبود | ‘Akramat Āl ‘Abbūd | محافظة مأرب | PPL | 80 | 13 | 60.37 | marib |
| al-hajr | الهجر | Al Hajr | محافظة مأرب | PPL | 80 | 6 | 60.16 | marib |
| al-qadisiyah | القادسية | Al Qādisīyah | محافظة مأرب | PPL | 80 | 8 | 61.13 | marib |
| al-hafr | الحفر | Al Ḩafr | محافظة مأرب | PPL | 80 | 3 | 60.21 | marib |
| tarf-al-azib | طرف العزب | Ţarf al ‘Azib | محافظة مأرب | PPL | 80 | 8 | 61.04 | marib |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة مأرب | PPL | 80 | 1 | 60.67 | marib |
| awsha-as-salim | أوشع السلم | Awsha‘ as Salim | محافظة مأرب | PPL | 80 | 3 | 68.00 | marib |
| ashirah | عشيرة | ‘Ashīrah | محافظة مأرب | PPL | 80 | 3 | 69.60 | marib |
| al-qarn | القرن | Al Qarn | محافظة مأرب | PPL | 80 | 2 | 69.73 | marib |
| al-midyar | المديار | Al Midyār | محافظة مأرب | PPL | 80 | 2 | 68.55 | marib |
| al-ansab | الأنصب | Al Anşab | محافظة مأرب | PPL | 80 | 2 | 68.69 | marib |
| al-maqrah | المقرة | Al Maqrah | محافظة مأرب | PPL | 80 | 2 | 69.00 | marib |
| al-utayfah | العطيفة | Al ‘Uţayfah | محافظة مأرب | PPL | 80 | 2 | 69.41 | marib |
| as-sabah | السبح | As Sabaḩ | محافظة مأرب | PPL | 80 | 3 | 61.69 | marib |
| al-gharadah | الغردة | Al Gharadah | محافظة مأرب | PPL | 80 | 8 | 61.67 | marib |
| al-kuraybid | الكريبض | Al Kuraybiḑ | محافظة مأرب | PPL | 80 | 3 | 62.68 | marib |
| ath-thaji | الثجي | Ath Thajī | محافظة مأرب | PPL | 80 | 2 | 64.90 | marib |
| as-sawar | السوار | As Sawār | محافظة مأرب | PPL | 80 | 8 | 65.25 | marib |
| al-laksir | ال لكسر | Āl Laksir | محافظة مأرب | PPL | 80 | 1 | 56.66 | marib |
| al-muslimani | المسلماني | Al Muslimānī | محافظة مأرب | PPL | 80 | 2 | 56.75 | marib |
| qash-al-mawsitah | قشع الموسطة | Qash‘ al Mawsiţah | محافظة مأرب | PPL | 80 | 5 | 56.88 | marib |
| al-mamalih | الممالح | Al Mamāliḩ | محافظة مأرب | PPL | 80 | 6 | 56.47 | marib |
| al-asfar | الأصفر | Al Aşfar | محافظة مأرب | PPL | 80 | 1 | 56.97 | marib |
| al-mubarak | ال مبارك | Āl Mubārak | محافظة مأرب | PPL | 80 | 2 | 56.63 | marib |
| al-jabih | الجابح | Al Jābiḩ | محافظة مأرب | PPL | 80 | 9 | 57.12 | marib |
| bani-qays | بني قيس | Banī Qays | محافظة مأرب | PPL | 80 | 8 | 55.83 | marib |
| al-mawsay | الموساي | Al Mawsāy | محافظة مأرب | PPL | 80 | 10 | 56.35 | marib |
| al-hisn | الحصن | Al Ḩişn | محافظة مأرب | PPL | 80 | 6 | 57.17 | marib |
| as-sirrah | السرة | As Sirrah | محافظة مأرب | PPL | 80 | 10 | 56.74 | marib |
| as-sahah | الساحة | As Sāḩah | محافظة مأرب | PPL | 80 | 10 | 56.73 | marib |
| an-naysah | النيسة | An Naysah | محافظة مأرب | PPL | 80 | 25 | 57.24 | marib |
| qash-jamil | قشع جميل | Qash‘ Jamīl | محافظة مأرب | PPL | 80 | 3 | 56.66 | marib |
| al-hanjali | الحنجلي | Al Ḩanjalī | محافظة مأرب | PPL | 80 | 1 | 56.21 | marib |
| al-hadd | الحد | Al Ḩadd | محافظة مأرب | PPL | 80 | 3 | 65.42 | marib |
| yala | يعلا | Ya‘lā | محافظة مأرب | PPL | 80 | 1 | 65.45 | marib |
| al-ajmah | العجمة | Al ‘Ajmah | محافظة مأرب | PPL | 80 | 5 | 64.75 | marib |
| hamash-alqisah | حمش ألقيسة | Ḩamash Alqīsah | محافظة مأرب | PPL | 80 | 12 | 61.40 | marib |
| al-al-jadi | ال الجدع | Āl al Jadi‘ | محافظة مأرب | PPL | 80 | 14 | 61.63 | marib |
| al-mahfuz | ال محفوظ | Āl Maḩfūz̧ | محافظة مأرب | PPL | 80 | 3 | 61.92 | marib |
| al-amir | ال عامر | Āl ‘Āmir | محافظة مأرب | PPL | 80 | 5 | 61.83 | marib |
| al-hajnah-al-ulya | الحجنة العليا | Al Ḩajnah al ‘Ulyā | محافظة مأرب | PPL | 80 | 6 | 61.95 | marib |
| al-hajfah-as-sufla | الحجفة السفلى | Al Ḩajfah as Suflá | محافظة مأرب | PPL | 80 | 10 | 61.37 | marib |
| al-abayah | العباية | Al ‘Abāyah | محافظة مأرب | PPL | 80 | 10 | 61.20 | marib |
| al-shadlif | ال شدليف | Āl Shadlīf | محافظة مأرب | PPL | 80 | 2 | 64.13 | marib |
| al-hadurin | الحدورن | Al Ḩadūrin | محافظة مأرب | PPL | 80 | 3 | 65.15 | marib |
| al-juhdah-as-sufla | الجحضة السفلى | Al Juḩḑah as Suflá | محافظة مأرب | PPL | 80 | 2 | 60.61 | marib |
| as-safih | الصفح | Aş Şafiḩ | محافظة مأرب | PPL | 80 | 4 | 60.39 | marib |
| al-ajmah | العجمة | Al ‘Ajmah | محافظة مأرب | PPL | 80 | 8 | 60.57 | marib |
| as-sifah | الصفاه | Aş Şifāh | محافظة مأرب | PPL | 80 | 10 | 61.27 | marib |
| al-tafzuz | ال طفزوز | Āl Ţafzūz | محافظة مأرب | PPL | 80 | 2 | 62.64 | marib |
| al-biflah | البفلة | Al Biflah | محافظة مأرب | PPL | 80 | 6 | 62.35 | marib |
| asharah | عشرة | ‘Asharah | محافظة مأرب | PPL | 80 | 1 | 61.48 | marib |
| al-qadah | القضاه | Al Qaḑāh | محافظة مأرب | PPL | 80 | 2 | 63.32 | marib |
| al-qasha | القشع | Al Qasha‘ | محافظة مأرب | PPL | 80 | 2 | 63.88 | marib |
| al-khalaqah | الخلقة | Al Khalaqah | محافظة مأرب | PPL | 80 | 8 | 63.58 | marib |
| umm-kamin | أم كمين | Umm Kamīn | محافظة مأرب | PPL | 80 | 7 | 63.37 | marib |
| as-sabil | السبيل | As Sabīl | محافظة مأرب | PPL | 80 | 1 | 70.05 | marib |
| al-makhram | المخرم | Al Makhram | محافظة مأرب | PPL | 80 | 8 | 70.98 | marib |
| al-qasim | ال قاسم | Āl Qāsim | محافظة مأرب | PPL | 80 | 4 | 72.84 | marib |
| al-quraysh | القريش | Al Quraysh | محافظة مأرب | PPL | 80 | 3 | 73.62 | marib |
| mahraq | محرق | Maḩraq | محافظة مأرب | PPL | 80 | 2 | 74.41 | marib |
| ash-shibtan | الشبطان | Ash Shibţān | محافظة مأرب | PPL | 80 | 2 | 66.19 | marib |
| al-jashim | الجشيم | Al Jashīm | محافظة مأرب | PPL | 80 | 5 | 66.02 | marib |
| al-hammah | الحمة | Al Ḩammah | محافظة مأرب | PPL | 80 | 3 | 66.47 | marib |
| hudayjah | هديجة | Hudayjah | محافظة مأرب | PPL | 80 | 4 | 66.97 | marib |
| ar-razwah | الرزوة | Ar Razwah | محافظة مأرب | PPL | 80 | 2 | 67.31 | marib |
| al-abayid | الأبايض | Al Abāyiḑ | محافظة مأرب | PPL | 80 | 2 | 67.28 | marib |
| al-mutraq | المطراق | Al Muţrāq | محافظة مأرب | PPL | 80 | 7 | 75.35 | marib |
| al-abl | العبل | Al ‘Abl | محافظة مأرب | PPL | 80 | 1 | 64.91 | marib |
| al-mahras | المحرس | Al Maḩras | محافظة مأرب | PPL | 80 | 1 | 59.13 | marib |
| al-aqzar | العقزر | Al ‘Aqzar | محافظة مأرب | PPL | 80 | 6 | 62.12 | marib |
| al-lal | اللال | Al Lāl | محافظة مأرب | PPL | 80 | 2 | 61.63 | marib |
| utayfah | عطيفة | ‘Uţayfah | محافظة مأرب | PPL | 80 | 3 | 58.41 | marib |
| dhira-suud | ذراع سعود | Dhirā‘ Su‘ūd | محافظة مأرب | PPL | 80 | 2 | 56.80 | marib |
| an-nuqm | النقم | An Nuqm | محافظة مأرب | PPL | 80 | 3 | 59.31 | marib |
| shirwam | شروام | Shirwām | محافظة مأرب | PPL | 80 | 1 | 57.60 | marib |
| al-maqtabil | المقتبل | Al Maqtabil | محافظة مأرب | PPL | 80 | 1 | 57.06 | marib |
| al-mukhaylifah | المخيلفة | Al Mukhaylifah | محافظة مأرب | PPL | 80 | 1 | 57.13 | marib |
| ash-sharyah | الشرية | Ash Sharyah | محافظة مأرب | PPL | 80 | 1 | 56.67 | marib |
| an-niyu | النيو | An Niyū | محافظة مأرب | PPL | 80 | 2 | 55.92 | marib |
| al-ijam-as-sud | العجام السود | Al ‘Ijām as Sūd | محافظة مأرب | PPL | 80 | 1 | 61.24 | marib |
| an-najd | النجد | An Najd | محافظة مأرب | PPL | 80 | 1 | 63.53 | marib |
| al-hubaysah | الحبيسة | Al Ḩubaysah | محافظة مأرب | PPL | 80 | 2 | 62.47 | marib |
| waynan | وينان | Waynān | محافظة مأرب | PPL | 80 | 5 | 57.16 | marib |
| najd-al-mujammaah | نجدالمجمعة | Najd al Mujamma‘ah | محافظة مأرب | PPL | 80 | 10 | 63.38 | marib |
| al-maqsirah | المقصرة | Al Maqşirah | محافظة مأرب | PPL | 80 | 2 | 56.37 | marib |
| al-awjariyah | العوجرية | Al ‘Awjarīyah | محافظة مأرب | PPL | 80 | 2 | 56.01 | marib |
| al-atf | العطف | Al ‘Aţf | محافظة مأرب | PPL | 80 | 3 | 61.04 | marib |
| zabib | زبيب | Zabīb | محافظة مأرب | PPL | 80 | 3 | 65.25 | marib |
| alfa | علفاء | ‘Alfā’ | محافظة مأرب | PPL | 80 | 1 | 56.90 | marib |
| al-qarnayn | القرنين | Al Qarnayn | محافظة مأرب | PPL | 80 | 5 | 59.65 | marib |
| al-aqnal | الأقنال | Al Aqnāl | محافظة مأرب | PPL | 80 | 2 | 60.23 | marib |
| al-wadih | الواضح | Al Wāḑiḩ | محافظة مأرب | PPL | 80 | 4 | 60.73 | marib |
| al-madrijah | المدرجة | Al Madrijah | محافظة مأرب | PPL | 80 | 5 | 60.06 | marib |
| al-mukhalifah | المخالفة | Al Mukhālifah | محافظة مأرب | PPL | 80 | 5 | 59.74 | marib |
| baqthah-al-ulya | بقثة العليا | Baqthah al ‘Ulyā | محافظة مأرب | PPL | 80 | 6 | 59.42 | marib |
| al-haylah | الهيلة | Al Haylah | محافظة مأرب | PPL | 80 | 9 | 61.06 | marib |
| an-najd | النجد | An Najd | محافظة مأرب | PPL | 80 | 4 | 61.28 | marib |
| al-irq | العرق | Al ‘Irq | محافظة مأرب | PPL | 80 | 3 | 60.23 | marib |
| al-aram | العرام | Al ‘Arām | محافظة مأرب | PPL | 80 | 3 | 59.17 | marib |
| qarwa | قروع | Qarwa‘ | محافظة مأرب | PPL | 80 | 3 | 54.58 | marib |
| al-qishash | القشاش | Al Qishāsh | محافظة مأرب | PPL | 80 | 2 | 54.16 | marib |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة مأرب | PPL | 80 | 10 | 53.81 | marib |
| ar-rasid | الرصيد | Ar Raşīd | محافظة مأرب | PPL | 80 | 18 | 54.03 | marib |
| al-qabil | القابل | Al Qābil | محافظة مأرب | PPL | 80 | 5 | 53.82 | marib |
| al-arafa | العرفاء | Al ‘Arafā’ | محافظة مأرب | PPL | 80 | 16 | 53.77 | marib |
| al-ajmah | العجمة | Al ‘Ajmah | محافظة مأرب | PPL | 80 | 1 | 64.02 | marib |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة مأرب | PPL | 80 | 4 | 65.25 | marib |
| al-ulayb | العليب | Al ‘Ulayb | محافظة مأرب | PPL | 80 | 2 | 79.73 | dhamar |
| al-qulaytah | القليتة | Al Qulaytah | محافظة مأرب | PPL | 80 | 2 | 82.96 | dhamar |
| al-majakhah | المجخة | Al Majakhah | محافظة مأرب | PPL | 80 | 5 | 79.33 | dhamar |
| an-nushayfah | النشيفة | An Nushayfah | محافظة مأرب | PPL | 80 | 8 | 80.64 | dhamar |
| al-munqati | المنقطع | Al Munqaţi‘ | محافظة مأرب | PPL | 80 | 1 | 81.88 | dhamar |
| al-umalij | العمالج | Al ‘Umālij | محافظة مأرب | PPL | 80 | 2 | 83.49 | dhamar |
| al-kawlah | الكولة | Al Kawlah | محافظة مأرب | PPL | 80 | 3 | 82.42 | dhamar |
| ash-shari | الشري | Ash Sharī | محافظة مأرب | PPL | 80 | 3 | 83.55 | dhamar |
| hadadah | حدادة | Ḩadādah | محافظة مأرب | PPL | 80 | 2 | 80.35 | dhamar |
| al-manshariqat | المنشرقات | Al Manshariqāt | محافظة مأرب | PPL | 80 | 2 | 78.17 | dhamar |
| al-birah | البيرة | Al Bīrah | محافظة مأرب | PPL | 80 | 3 | 78.63 | dhamar |
| as-sumayrat | السميرات | As Sumayrāt | محافظة مأرب | PPL | 80 | 5 | 82.53 | dhamar |
| al-mijza | المجزاع | Al Mijzā‘ | محافظة مأرب | PPL | 80 | 2 | 84.25 | dhamar |
| al-far | الفرع | Al Far‘ | محافظة مأرب | PPL | 80 | 2 | 79.69 | dhamar |
| al-muragh | المراغ | Al Murāgh | محافظة مأرب | PPL | 80 | 1 | 79.55 | dhamar |
| badw-bin-ayshah | بدو بن عيشة | Badw Bin ‘Ayshah | محافظة مأرب | PPL | 80 | 1 | 84.50 | dhamar |
| an-naqam | النقم | An Naqam | محافظة مأرب | PPL | 80 | 1 | 84.10 | dhamar |
| khidafir | خدافر | Khidāfir | محافظة مأرب | PPL | 80 | 2 | 83.29 | dhamar |
| al-hamadah | الحمدة | Al Ḩamadah | محافظة مأرب | PPL | 80 | 3 | 76.09 | marib |
| dhi-yuruk | ذي يروك | Dhī Yurūk | محافظة مأرب | PPL | 80 | 3 | 74.59 | marib |
| ad-dijrah | الدجرة | Ad Dijrah | محافظة مأرب | PPL | 80 | 3 | 85.71 | dhamar |
| badw-bin-hammad | بدو بن حماد | Badw Bin Ḩammād | محافظة مأرب | PPL | 80 | 3 | 83.55 | dhamar |
| al-jawza | الجوزاء | Al Jawzā’ | محافظة مأرب | PPL | 80 | 4 | 79.44 | dhamar |
| hayd-al-asad | حيد الأسد | Ḩayd al Asad | محافظة مأرب | PPL | 80 | 5 | 85.88 | dhamar |
| al-ashshah | العشة | Al ‘Ashshah | محافظة مأرب | PPL | 80 | 10 | 85.49 | marib |
| far-al-ashshah | فرع العشة | Far‘ al ‘Ashshah | محافظة مأرب | PPL | 80 | 3 | 84.77 | marib |
| kawlat-al-ashshah | كولة العشة | Kawlat al ‘Ashshah | محافظة مأرب | PPL | 80 | 2 | 85.04 | marib |
| bayhan | بيحان | Bayḩān | محافظة مأرب | PPL | 80 | 2 | 86.21 | dhamar |
| hammat-raqian | حمة رقيعان | Ḩammat Raqī‘ān | محافظة مأرب | PPL | 80 | 1 | 85.99 | dhamar |
| qaridah | قريضة | Qarīḑah | محافظة مأرب | PPL | 80 | 1 | 83.89 | dhamar |
| ar-rakis | الركس | Ar Rakis | محافظة مأرب | PPL | 80 | 2 | 82.29 | dhamar |
| al-juwar | الجوار | Al Juwār | محافظة مأرب | PPL | 80 | 1 | 81.46 | dhamar |
| al-mawhir | الموهر | Al Mawhir | محافظة مأرب | PPL | 80 | 3 | 80.50 | dhamar |
| al-ghubayb | الغبيب | Al Ghubayb | محافظة مأرب | PPL | 80 | 2 | 86.59 | marib |
| al-hayd-al-aswad | الحيد الأسود | Al Ḩayd al Aswad | محافظة مأرب | PPL | 80 | 2 | 86.46 | dhamar |
| quthayd | قثيد | Quthayd | محافظة مأرب | PPL | 80 | 5 | 84.23 | marib |
| al-musayniah | المصينعة | Al Muşayni‘ah | محافظة مأرب | PPL | 80 | 20 | 84.01 | marib |
| mahjab | محجب | Maḩjab | محافظة مأرب | PPL | 80 | 23 | 82.96 | marib |
| ad-dahqah | الدحقة | Ad Daḩqah | محافظة مأرب | PPL | 80 | 4 | 82.90 | marib |
| al-lujaf | اللجاف | Al Lujāf | محافظة مأرب | PPL | 80 | 12 | 81.21 | marib |
| dhi-yuruk | ذي يروك | Dhī Yurūk | محافظة مأرب | PPL | 80 | 4 | 81.64 | marib |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة مأرب | PPL | 80 | 4 | 82.35 | marib |
| al-qudayl | القضيل | Al Quḑayl | محافظة مأرب | PPL | 80 | 3 | 81.82 | marib |
| al-jumayma | الجميماء | Al Jumaymā’ | محافظة مأرب | PPL | 80 | 4 | 81.21 | marib |
| al-kawlah | الكولة | Al Kawlah | محافظة مأرب | PPL | 80 | 3 | 81.41 | marib |
| al-khalif | الخليف | Al Khalīf | محافظة مأرب | PPL | 80 | 1 | 81.70 | marib |
| surah | صورة | Şūrah | محافظة مأرب | PPL | 80 | 5 | 86.03 | dhamar |
| khulayq-al-abd | خليق العبد | Khulayq al ‘Abd | محافظة مأرب | PPL | 80 | 5 | 86.56 | dhamar |
| khirbat-mashrah | جربة مشرح | Khirbat Mashraḩ | محافظة مأرب | PPL | 80 | 1 | 89.45 | dhamar |
| zurafah | ظرافة | Z̧urāfah | محافظة مأرب | PPL | 80 | 2 | 90.84 | dhamar |
| al-hiblah | الحبلة | Al Ḩiblah | محافظة مأرب | PPL | 80 | 1 | 89.01 | dhamar |
| al-mukayl | المكيل | Al Mukayl | محافظة مأرب | PPL | 80 | 4 | 86.25 | dhamar |
| hayr | هير | Hayr | محافظة مأرب | PPL | 80 | 7 | 87.95 | dhamar |
| al-khasha | الخشع | Al Khasha‘ | محافظة مأرب | PPL | 80 | 1 | 89.34 | marib |
| al-u-ayli | الأعيلي | Al U‘aylī | محافظة مأرب | PPL | 80 | 1 | 89.36 | marib |
| ashab-mari | أشعاب مرعي | Ash‘āb Mar‘ī | محافظة مأرب | PPL | 80 | 1 | 88.98 | marib |
| ar-raddah | الردة | Ar Raddah | محافظة مأرب | PPL | 80 | 1 | 80.57 | dhamar |
| aba-al-qurun | أبا القرون | Abā al Qurūn | محافظة مأرب | PPL | 80 | 2 | 81.28 | dhamar |
| al-hisn | الحصن | Al Ḩişn | محافظة مأرب | PPL | 80 | 1 | 80.30 | dhamar |
| al-mashrifah | المشرفة | Al Mashrifah | محافظة مأرب | PPL | 80 | 4 | 81.59 | dhamar |
| at-tawla | الطولاء | Aţ Ţawlā’ | محافظة مأرب | PPL | 80 | 9 | 74.79 | dhamar |
| ibal | إبال | Ibāl | محافظة مأرب | PPL | 80 | 4 | 76.07 | dhamar |
| jawl-al-aqqal | جول العقال | Jawl al ‘Aqqāl | محافظة مأرب | PPL | 80 | 6 | 74.72 | dhamar |
| al-bilgha | البلغاء | Al Bilghā’ | محافظة مأرب | PPL | 80 | 1 | 77.10 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة مأرب | PPL | 80 | 6 | 74.24 | dhamar |
| mawghir | موغر | Mawghir | محافظة مأرب | PPL | 80 | 6 | 73.16 | dhamar |
| an-naqam | النقم | An Naqam | محافظة مأرب | PPL | 80 | 1 | 78.75 | dhamar |
| al-uthayl | الأثيل | Al Uthayl | محافظة مأرب | PPL | 80 | 1 | 85.41 | dhamar |
| ar-rakah-as-sufla | الراكة السفلى | Ar Rākah as Suflá | محافظة مأرب | PPL | 80 | 3 | 85.23 | dhamar |
| al-mazbaiqah | المزبعيقة | Al Mazba‘īqah | محافظة مأرب | PPL | 80 | 1 | 85.79 | marib |
| al-muradi | المرادي | Al Murādī | محافظة مأرب | PPL | 80 | 1 | 78.94 | dhamar |
| as-sulayti | السليتي | As Sulaytī | محافظة مأرب | PPL | 80 | 1 | 78.27 | dhamar |
| al-makhwar | المخور | Al Makhwar | محافظة مأرب | PPL | 80 | 4 | 79.13 | dhamar |
| far-al-asat | فرع العصاة | Far‘ al ‘Aşāt | محافظة مأرب | PPL | 80 | 1 | 81.01 | dhamar |
| jashim | جشيم | Jashīm | محافظة مأرب | PPL | 80 | 1 | 83.74 | dhamar |
| al-madraj | المدراج | Al Madrāj | محافظة مأرب | PPL | 80 | 1 | 77.92 | marib |
| an-namrayn | النمرين | An Namrayn | محافظة مأرب | PPL | 80 | 1 | 78.14 | marib |
| al-asadah | الأسدة | Al Asadah | محافظة مأرب | PPL | 80 | 7 | 79.83 | marib |
| al-hudayyah | الحدية | Al Ḩudayyah | محافظة مأرب | PPL | 80 | 2 | 82.75 | dhamar |
| far-al-wail | فرع الوعل | Far‘ al Wa‘il | محافظة مأرب | PPL | 80 | 1 | 83.26 | dhamar |
| al-wadih | الواضح | Al Wāḑiḩ | محافظة مأرب | PPL | 80 | 14 | 80.09 | marib |
| al-mahfuz | ال محفوظ | Āl Maḩfūz̧ | محافظة مأرب | PPL | 80 | 1 | 94.36 | dhamar |
| al-umar | ال عمر | Āl ‘Umar | محافظة مأرب | PPL | 80 | 7 | 94.72 | dhamar |
| al-janab | الجناب | Al Janāb | محافظة مأرب | PPL | 80 | 3 | 95.48 | dhamar |
| shakhab | شخب | Shakhab | محافظة مأرب | PPL | 80 | 20 | 96.53 | dhamar |
| al-hadawi | الحضوي | Al Ḩaḑawī | محافظة مأرب | PPL | 80 | 13 | 97.06 | dhamar |
| at-tayif | الطايف | Aţ Ţāyif | محافظة مأرب | PPL | 80 | 1 | 96.95 | dhamar |
| munqayr | منقير | Munqayr | محافظة مأرب | PPL | 80 | 4 | 96.02 | dhamar |
| sirraq | سراق | Sirrāq | محافظة مأرب | PPL | 80 | 1 | 96.29 | dhamar |
| karimah | كريمة | Karīmah | محافظة مأرب | PPL | 80 | 4 | 96.63 | dhamar |
| an-nusayb | النصيب | An Nuşayb | محافظة مأرب | PPL | 80 | 2 | 96.58 | dhamar |
| al-ulya | العليا | Al ‘Ulyā | محافظة مأرب | PPL | 80 | 4 | 96.49 | dhamar |
| ghawl-ahmad | غول أحمد | Ghawl Aḩmad | محافظة مأرب | PPL | 80 | 3 | 98.06 | dhamar |
| sayyidah | سيدة | Sayyidah | محافظة مأرب | PPL | 80 | 2 | 97.66 | dhamar |
| al-a-bali-al-mahfuz | الأعبلي آل محفوظ | Al A‘balī Āl Maḩfūz̧ | محافظة مأرب | PPL | 80 | 10 | 94.19 | dhamar |
| al-judhmah-al-hiqash | الجذمة ال هقاش | Al Judhmah Āl Hiqāsh | محافظة مأرب | PPL | 80 | 6 | 93.88 | dhamar |
| as-samih | الصامح | Aş Şāmiḩ | محافظة مأرب | PPL | 80 | 8 | 93.67 | dhamar |
| jamilah | جميلة | Jamīlah | محافظة مأرب | PPL | 80 | 7 | 95.84 | dhamar |
| al-far | الفرع | Al Far‘ | محافظة مأرب | PPL | 80 | 3 | 95.76 | dhamar |
| al-qara | القرى | Al Qará | محافظة مأرب | PPL | 80 | 10 | 86.71 | dhamar |
| adh-dhira | الذراع | Adh Dhirā‘ | محافظة مأرب | PPL | 80 | 1 | 57.60 | marib |
| al-qash | القشع | Al Qash‘ | محافظة مأرب | PPL | 80 | 3 | 57.53 | marib |
| fawz-qulaytah | فوز فليتة | Fawz Qulaytah | محافظة مأرب | PPL | 80 | 2 | 57.72 | marib |
| wadn-umar | ودن عمر | Wadn ‘Umar | محافظة مأرب | PPL | 80 | 2 | 57.65 | marib |
| naq-hamas | نقع حماص | Naq‘ Ḩamāş | محافظة مأرب | PPL | 80 | 4 | 57.27 | marib |
| bilad-yaman | بلاد يمان | Bilād Yamān | محافظة مأرب | PPL | 80 | 1 | 57.71 | marib |
| al-marbu | المربوع | Al Marbū‘ | محافظة مأرب | PPL | 80 | 2 | 57.24 | marib |
| dirat-al-juhfil | ديرة ال جحفيل | Dīrat Āl Juḩfīl | محافظة مأرب | PPL | 80 | 1 | 56.88 | marib |
| qawz-al-jadfar | قوز الجدفر | Qawz al Jadfar | محافظة مأرب | PPL | 80 | 5 | 58.02 | marib |
| ghuruq-adh-dhiyab | غوروق الذياب | Ghūrūq adh Dhiyāb | محافظة مأرب | PPL | 80 | 1 | 54.70 | marib |
| qawr-rashid | قور راشد | Qawr Rāshid | محافظة مأرب | PPL | 80 | 48 | 52.72 | marib |
| qazat-hadi | قزعة هادي | Qaz‘at Hādī | محافظة مأرب | PPL | 80 | 2 | 53.34 | marib |
| al-marsah | المرسة | Al Marsah | محافظة مأرب | PPL | 80 | 10 | 52.80 | marib |
| ar-rawdah | الروضة | Ar Rawḑah | محافظة مأرب | PPL | 80 | 21 | 53.16 | marib |
| al-madranah | المدرانة | Al Madrānah | محافظة مأرب | PPL | 80 | 11 | 53.72 | marib |
| at-tutah | الطوطة | Aţ Ţūţah | محافظة مأرب | PPL | 80 | 14 | 54.14 | marib |
| as-saqifah | السقيفة | As Saqīfah | محافظة مأرب | PPL | 80 | 6 | 55.99 | marib |
| al-huwayyah | الحوية | Al Ḩuwayyah | محافظة مأرب | PPL | 80 | 2 | 55.95 | marib |
| diya | دعياء | Di‘yā’ | محافظة مأرب | PPL | 80 | 9 | 55.48 | marib |
| al-masariyah | المصارية | Al Maşārīyah | محافظة مأرب | PPL | 80 | 9 | 55.89 | marib |
| halyan | حليان | Ḩalyān | محافظة مأرب | PPL | 80 | 1 | 56.16 | marib |
| al-dayman | ال ديمان | Āl Daymān | محافظة مأرب | PPL | 80 | 4 | 56.20 | marib |
| al-durayban | ال دريبان | Āl Duraybān | محافظة مأرب | PPL | 80 | 2 | 55.91 | marib |
| hibshanah | هبشانة | Hibshānah | محافظة مأرب | PPL | 80 | 9 | 56.69 | marib |
| rajanah | رجعانة | Raj‘ānah | محافظة مأرب | PPL | 80 | 5 | 56.66 | marib |
| al-mafyal | المفيال | Al Mafyāl | محافظة مأرب | PPL | 80 | 3 | 56.36 | marib |
| al-arf | العرف | Al ‘Arf | محافظة مأرب | PPL | 80 | 3 | 56.59 | marib |
| al-bad | البدع | Al Bad‘ | محافظة مأرب | PPL | 80 | 2 | 56.10 | marib |
| rawzan | روظان | Rawz̧ān | محافظة مأرب | PPL | 80 | 2 | 55.32 | marib |
| laqur | لقور | Laqūr | محافظة مأرب | PPL | 80 | 2 | 56.32 | marib |
| al-umar | ال عمر | Āl ‘Umar | محافظة مأرب | PPL | 80 | 3 | 57.32 | marib |
| al-harr | ال حر | Āl Ḩarr | محافظة مأرب | PPL | 80 | 7 | 56.24 | marib |
| al-mansurah | المنصورة | Al Manşūrah | محافظة مأرب | PPL | 80 | 4 | 56.22 | marib |
| al-hajarah | الحجرة | Al Ḩajarah | محافظة مأرب | PPL | 80 | 1 | 55.02 | marib |
| dhimrah | ذمرة | Dhimrah | محافظة البيضاء | PPL | 80 | 32 | 136.43 | dhamar |
| al-batrah | البطرة | Al Baţrah | محافظة البيضاء | PPL | 80 | 6 | 134.99 | dhamar |
| al-ali-muzaffar | ال علي مظفر | Āl ‘Alī Muz̧affar | محافظة البيضاء | PPL | 80 | 13 | 134.88 | dhamar |
| majwar | مجور | Majwar | محافظة البيضاء | PPL | 80 | 3 | 137.86 | dhamar |
| al-haqqah | الحقة | Al Ḩaqqah | محافظة البيضاء | PPL | 80 | 30 | 134.09 | dhamar |
| rabab | رباب | Rabāb | محافظة البيضاء | PPL | 80 | 7 | 135.36 | dhamar |
| al-hammah | الحمة | Al Ḩammah | محافظة البيضاء | PPL | 80 | 19 | 134.73 | dhamar |
| ghawl-al-hajr | غول الحجر | Ghawl al Ḩajr | محافظة البيضاء | PPL | 80 | 7 | 134.41 | dhamar |
| yasir | يسير | Yasīr | محافظة البيضاء | PPL | 80 | 7 | 132.93 | dhamar |
| ash-shuhub | الشحب | Ash Shuḩub | محافظة البيضاء | PPL | 80 | 4 | 133.36 | dhamar |
| mauj | معوج | Ma‘ūj | محافظة البيضاء | PPL | 80 | 7 | 129.69 | dhamar |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة البيضاء | PPL | 80 | 9 | 133.49 | dhamar |
| nawbah | نوبة | Nawbah | محافظة البيضاء | PPL | 80 | 39 | 134.33 | dhamar |
| al-ghawl | الغول | Al Ghawl | محافظة البيضاء | PPL | 80 | 10 | 132.21 | dhamar |
| dhimnamah | ذمنامة | Dhimnāmah | محافظة البيضاء | PPL | 80 | 6 | 140.27 | dhamar |
| ali-ibn-ahmad | علي إبن أحمد | ‘Alī Ibn Aḩmad | محافظة البيضاء | PPL | 80 | 33 | 138.68 | dhamar |
| al-matruh | ال مطروح | Āl Maţrūḩ | محافظة البيضاء | PPL | 80 | 11 | 137.87 | dhamar |
| al-majzarah | المجزرة | Al Majzarah | محافظة البيضاء | PPL | 80 | 11 | 136.62 | dhamar |
| al-mashariyah | المشعرية | Al Mash‘arīyah | محافظة البيضاء | PPL | 80 | 5 | 136.98 | dhamar |
| al-jabar | الجبر | Al Jabar | محافظة البيضاء | PPL | 80 | 5 | 136.85 | dhamar |
| as-safiyah | الصافية | Aş Şāfīyah | محافظة البيضاء | PPL | 80 | 50 | 139.12 | dhamar |
| al-mazub | المعزوب | Al Ma‘zūb | محافظة البيضاء | PPL | 80 | 11 | 139.06 | dhamar |
| al-ghurayqah | الغريقة | Al Ghurayqah | محافظة البيضاء | PPL | 80 | 22 | 139.35 | dhamar |
| al-masud | ال مسعود | Āl Mas‘ūd | محافظة البيضاء | PPL | 80 | 3 | 139.79 | dhamar |
| al-mukhtaba | المختبئ | Al Mukhtaba’ | محافظة البيضاء | PPL | 80 | 3 | 139.59 | dhamar |
| al-hunaysh | ال حنيش | Āl Ḩunaysh | محافظة البيضاء | PPL | 80 | 11 | 139.42 | dhamar |
| al-asil | ال عسيل | Āl ‘Asīl | محافظة البيضاء | PPL | 80 | 10 | 138.47 | dhamar |
| al-sulayman | ال سليمان | Āl Sulaymān | محافظة البيضاء | PPL | 80 | 10 | 142.32 | dhamar |
| ad-dubbi | الضبي | Aḑ Ḑubbī | محافظة البيضاء | PPL | 80 | 6 | 149.63 | marib |
| khayran | خيران | Khayrān | محافظة البيضاء | PPL | 80 | 9 | 148.10 | marib |
| al-qaryah | القرية | Al Qaryah | محافظة البيضاء | PPL | 80 | 10 | 149.16 | marib |
| az-zahar | الظهر | Az̧ Z̧ahar | محافظة البيضاء | PPL | 80 | 5 | 149.83 | marib |
| hayd-al-nasir | حيد ال ناصر | Ḩayd Āl Nāşir | محافظة البيضاء | PPL | 80 | 6 | 154.71 | dhamar |
| hisn | حصن | Ḩişn | محافظة البيضاء | PPL | 80 | 7 | 151.27 | dhamar |
| mahraz | محرز | Maḩraz | محافظة البيضاء | PPL | 80 | 4 | 152.88 | dhamar |
| al-misbanah | المصبانة | Al Mişbānah | محافظة البيضاء | PPL | 80 | 27 | 152.55 | dhamar |
| ash-shajiri | الشاجرى | Ash Shājirī | محافظة البيضاء | PPL | 80 | 7 | 150.33 | dhamar |
| ad-daqiq | الدقيق | Ad Daqīq | محافظة البيضاء | PPL | 80 | 3 | 155.92 | marib |
| ar-rabah | الربعة | Ar Rab‘ah | محافظة البيضاء | PPL | 80 | 6 | 156.84 | marib |
| an-najd | النجد | An Najd | محافظة البيضاء | PPL | 80 | 5 | 156.62 | marib |
| dhamsharibah | ذمشربة | Dhamsharibah | محافظة البيضاء | PPL | 80 | 4 | 156.61 | marib |
| hala | حلاء | Ḩalā’ | محافظة البيضاء | PPL | 80 | 18 | 153.97 | marib |
| al-khirbah | الخربة | Al Khirbah | محافظة البيضاء | PPL | 80 | 7 | 157.77 | dhamar |
| mahjin | محجن | Maḩjin | محافظة البيضاء | PPL | 80 | 3 | 157.55 | dhamar |
| ath-thirya | الثريا | Ath Thiryā | محافظة البيضاء | PPL | 80 | 4 | 155.91 | marib |
| al-mujadhinah | المجاذنة | Al Mujādhinah | محافظة البيضاء | PPL | 80 | 3 | 154.89 | marib |
| as-sakin | السكن | As Sakin | محافظة البيضاء | PPL | 80 | 5 | 156.33 | marib |
| al-kharaz | الخرز | Al Kharaz | محافظة البيضاء | PPL | 80 | 9 | 157.88 | marib |
| al-qaryah | القرية | Al Qaryah | محافظة البيضاء | PPL | 80 | 19 | 147.84 | dhamar |
| dhamm-suwayqah | ذم سويقة | Dhamm Suwayqah | محافظة البيضاء | PPL | 80 | 5 | 148.04 | dhamar |
| dhamm-duruk | ذم ضروك | Dhamm Ḑurūk | محافظة البيضاء | PPL | 80 | 4 | 147.11 | dhamar |
| nakhlan | نخلان | Nakhlān | محافظة البيضاء | PPL | 80 | 12 | 148.75 | dhamar |
| kuhlan | كحلان | Kuḩlān | محافظة البيضاء | PPL | 80 | 53 | 142.74 | dhamar |
| faqi | فاقع | Fāqi‘ | محافظة البيضاء | PPL | 80 | 26 | 142.89 | dhamar |
| al-qaryah | القرية | Al Qaryah | محافظة البيضاء | PPL | 80 | 14 | 143.13 | dhamar |
| al-jarishah | الجرشة | Al Jarishah | محافظة البيضاء | PPL | 80 | 5 | 143.53 | dhamar |
| husun-al-maqsarah | حصون المقصرة | Ḩuşūn al Maqşarah | محافظة البيضاء | PPL | 80 | 7 | 143.00 | dhamar |
| jublis | جوبلس | Jūblis | محافظة البيضاء | PPL | 80 | 4 | 141.74 | dhamar |
| al-qayd | القيد | Al Qayd | محافظة البيضاء | PPL | 80 | 6 | 146.59 | marib |
| al-jashm | الجشم | Al Jashm | محافظة البيضاء | PPL | 80 | 40 | 147.33 | marib |
| ash-sharijah | الشرجة | Ash Sharijah | محافظة البيضاء | PPL | 80 | 7 | 147.27 | marib |
| dawsh | دوش | Dawsh | محافظة البيضاء | PPL | 80 | 7 | 147.45 | marib |
| an-natifah | النتفة | An Natifah | محافظة البيضاء | PPL | 80 | 4 | 147.65 | marib |
| ash-shaqfa | الشقفاء | Ash Shaqfā’ | محافظة البيضاء | PPL | 80 | 7 | 147.50 | marib |
| al-abir | العابر | Al ‘Ābir | محافظة البيضاء | PPL | 80 | 11 | 141.96 | marib |
| al-khiyal | الخيال | Al Khiyāl | محافظة البيضاء | PPL | 80 | 15 | 141.79 | marib |
| al-kibda | الكبدا | Al Kibdā | محافظة البيضاء | PPL | 80 | 8 | 142.43 | marib |
| al-jubanah | الجبانة | Al Jubānah | محافظة البيضاء | PPL | 80 | 8 | 142.75 | marib |
| al-haytan | الحيطان | Al Ḩayţān | محافظة البيضاء | PPL | 80 | 5 | 142.29 | marib |
| al-jurayda | الجريداء | Al Juraydā’ | محافظة البيضاء | PPL | 80 | 3 | 143.35 | marib |
| al-kurayf | الكريف | Al Kurayf | محافظة البيضاء | PPL | 80 | 6 | 142.58 | marib |
| ar-rasid | الرصيد | Ar Raşīd | محافظة البيضاء | PPL | 80 | 4 | 142.71 | marib |
| al-masuq | المصعوق | Al Maş‘ūq | محافظة البيضاء | PPL | 80 | 4 | 141.21 | marib |
| ash-sharyah | الشرية | Ash Sharyah | محافظة البيضاء | PPL | 80 | 3 | 142.47 | marib |
| al-khadi | الخدي | Al Khadī | محافظة البيضاء | PPL | 80 | 3 | 140.68 | marib |
| midyaf | مضياف | Miḑyāf | محافظة البيضاء | PPL | 80 | 3 | 152.09 | marib |
| al-makhdarah | المخدرة | Al Makhdarah | محافظة البيضاء | PPL | 80 | 3 | 151.80 | marib |
| mashwar | مشور | Mashwar | محافظة البيضاء | PPL | 80 | 6 | 153.50 | dhamar |
| al-faqih | ال فقيه | Āl Faqīh | محافظة البيضاء | PPL | 80 | 11 | 147.98 | dhamar |
| al-abd-al-habib | ال عبد الحبيب | Āl ‘Abd al Ḩabīb | محافظة البيضاء | PPL | 80 | 8 | 148.24 | dhamar |
| al-huwayk | الحويك | Al Ḩuwayk | محافظة البيضاء | PPL | 80 | 4 | 148.34 | dhamar |
| al-raqiyah | ال رقية | Āl Raqīyah | محافظة البيضاء | PPL | 80 | 5 | 148.40 | dhamar |
| az-zanabah | الزنابعة | Az Zanāb‘ah | محافظة البيضاء | PPL | 80 | 3 | 148.83 | dhamar |
| bayzan | بيزان | Bayzān | محافظة البيضاء | PPL | 80 | 11 | 130.39 | dhamar |
| am-dayfash | أمديفاش | Am Dayfāsh | محافظة البيضاء | PPL | 80 | 7 | 130.52 | dhamar |
| zahrah | زهرة | Zahrah | محافظة البيضاء | PPL | 80 | 8 | 130.40 | dhamar |
| al-badwan | البدون | Al Badwan | محافظة البيضاء | PPL | 80 | 6 | 129.44 | dhamar |
| al-sawadah | ال سوادة | Āl Sawādah | محافظة البيضاء | PPL | 80 | 13 | 129.17 | dhamar |
| bilmakabi | بلمكابي | Bilmakābī | محافظة البيضاء | PPL | 80 | 5 | 127.36 | marib |
| hayd-hasan | حيد حسن | Ḩayd Ḩasan | محافظة البيضاء | PPL | 80 | 8 | 127.09 | marib |
| faqi | فاقع | Fāqi‘ | محافظة البيضاء | PPL | 80 | 4 | 125.92 | marib |
| ar-rahabah | الرحبة | Ar Raḩabah | محافظة البيضاء | PPL | 80 | 4 | 126.22 | marib |
| al-hanakah | الحنكة | Al Ḩanakah | محافظة البيضاء | PPL | 80 | 9 | 125.94 | marib |
| al-jamimah | الجميمة | Al Jamīmah | محافظة البيضاء | PPL | 80 | 3 | 125.35 | marib |
| as-salabah | الصلابة | Aş Şalābah | محافظة البيضاء | PPL | 80 | 5 | 121.40 | marib |
| ar-rahwah | الرهوة | Ar Rahwah | محافظة البيضاء | PPL | 80 | 6 | 121.01 | marib |
| al-ghadir | الغدير | Al Ghadīr | محافظة البيضاء | PPL | 80 | 4 | 118.81 | marib |
| amghar | أمغار | Amghār | محافظة البيضاء | PPL | 80 | 6 | 130.56 | marib |
| as-sadah | السادة | As Sādah | محافظة البيضاء | PPL | 80 | 3 | 133.24 | marib |
| al-jabanah | الجبانة | Al Jabānah | محافظة البيضاء | PPL | 80 | 12 | 132.68 | marib |
| al-ghantaliyah | الغنطلية | Al Ghanţalīyah | محافظة البيضاء | PPL | 80 | 20 | 115.23 | marib |
| al-mayqa | الميقاع | Al Mayqā‘ | محافظة البيضاء | PPL | 80 | 24 | 115.61 | marib |
| al-khalif | الخليف | Al Khalīf | محافظة البيضاء | PPL | 80 | 3 | 115.65 | marib |
| al-munqati | المنقطع | Al Munqaţi‘ | محافظة البيضاء | PPL | 80 | 3 | 107.08 | marib |
| al-musaydir | المصيدير | Al Muşaydīr | محافظة البيضاء | PPL | 80 | 3 | 108.44 | marib |
| am-baidah | أم بعيدة | Am Ba‘īdah | محافظة البيضاء | PPL | 80 | 5 | 110.90 | marib |
| hiran | هران | Hirān | محافظة البيضاء | PPL | 80 | 17 | 116.25 | marib |
| al-masar-al-ala | المصار الأعلى | Al Maşār al A‘lá | محافظة البيضاء | PPL | 80 | 39 | 115.26 | marib |
| al-ubayli-as-sufla | العبيلى السفلى | Al ‘Ubaylī as Suflá | محافظة البيضاء | PPL | 80 | 3 | 115.63 | marib |
| al-farah | الفرعة | Al Far‘ah | محافظة البيضاء | PPL | 80 | 8 | 114.46 | marib |
| al-juaydin | الجعيدن | Al Ju‘aydin | محافظة البيضاء | PPL | 80 | 10 | 104.42 | marib |
| sarasir | صراصر | Şarāşir | محافظة شبوة | PPL | 80 | 5 | 136.23 | marib |
| al-hatayn | الحاطين | Al Ḩāţayn | محافظة شبوة | PPL | 80 | 29 | 137.95 | marib |
| al-majma | المجمع | Al Majma‘ | محافظة شبوة | PPL | 80 | 18 | 136.92 | marib |
| al-harrah | الحرة | Al Ḩarrah | محافظة شبوة | PPL | 80 | 13 | 136.47 | marib |
| shabwah | شبوة | Shabwah | محافظة شبوة | PPL | 80 | 28 | 120.53 | marib |
| ulays | عليس | ‘Ulays | محافظة شبوة | PPL | 80 | 46 | 121.96 | marib |
| al-ba-yahya | آل با يحيى | Āl Bā Yaḩyá | محافظة شبوة | PPL | 80 | 8 | 129.39 | marib |
| al-hamid | آل حميد | Āl Ḩamīd | محافظة شبوة | PPL | 80 | 10 | 122.53 | marib |
| khutafa | خوتفاء | Khūtafā’ | محافظة شبوة | PPL | 80 | 4 | 123.46 | marib |
| al-maqasir | المقاصر | Al Maqāşir | محافظة شبوة | PPL | 80 | 13 | 123.37 | marib |
| al-haywas | الحيوس | Al Ḩaywas | محافظة شبوة | PPL | 80 | 15 | 123.03 | marib |
| al-jawl | الجول | Al Jawl | محافظة شبوة | PPL | 80 | 69 | 128.09 | marib |
| al-badi | البديع | Al Badī‘ | محافظة شبوة | PPL | 80 | 13 | 128.57 | marib |
| ath-thulman | الثلمان | Ath Thulmān | محافظة شبوة | PPL | 80 | 38 | 129.11 | marib |
| al-kudaymah | الكديمة | Al Kudaymah | محافظة شبوة | PPL | 80 | 111 | 127.86 | marib |
| gharad | غرد | Gharad | محافظة شبوة | PPL | 80 | 67 | 128.26 | marib |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة شبوة | PPL | 80 | 21 | 127.58 | marib |
| ghawl-al-hilal | غول الحلال | Ghawl al Ḩilāl | محافظة شبوة | PPL | 80 | 12 | 126.54 | marib |
| ghawl-salih | غول صالح | Ghawl Şāliḩ | محافظة شبوة | PPL | 80 | 7 | 126.19 | marib |
| al-bilaliyah | البلالية | Al Bilālīyah | محافظة شبوة | PPL | 80 | 11 | 126.35 | marib |
| juar | جعار | Ju‘ār | محافظة شبوة | PPL | 80 | 37 | 125.85 | marib |
| al-ahraz | الأحراز | Al Aḩrāz | محافظة تعز | PPL | 80 | 5 | 41.03 | taiz |
| al-qalah | القلعة | Al Qal‘ah | محافظة تعز | PPL | 80 | 1 | 41.93 | taiz |
| ashu | عاشو | ‘Ashū | محافظة تعز | PPL | 80 | 4 | 40.45 | taiz |
| al-malaqi | الملاقي | Al Malāqī | محافظة تعز | PPL | 80 | 1 | 40.92 | taiz |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة تعز | PPL | 80 | 1 | 41.36 | taiz |
| al-harbaniyah-al-ulya | الحربانية العليا | Al Ḩarbānīyah al ‘Ulyā | محافظة تعز | PPL | 80 | 1 | 42.60 | taiz |
| an-nawab | النواب | An Nawāb | محافظة تعز | PPL | 80 | 3 | 41.68 | taiz |
| al-barh | البرح | Al Barḩ | محافظة تعز | PPL | 80 | 4 | 42.31 | taiz |
| al-manbahah | المنبهة | Al Manbahah | محافظة تعز | PPL | 80 | 13 | 29.82 | taiz |
| al-ujaf | العجف | Al ‘Ujaf | محافظة تعز | PPL | 80 | 2 | 29.46 | taiz |
| al-marhafah | المرهافة | Al Marhāfah | محافظة تعز | PPL | 80 | 14 | 29.91 | taiz |
| al-ubaydiyah | العبيدية | Al ‘Ubaydīyah | محافظة تعز | PPL | 80 | 8 | 31.27 | taiz |
| al-kharabah | الخربة | Al Kharabah | محافظة تعز | PPL | 80 | 15 | 31.16 | taiz |
| al-barizah | البرزة | Al Barizah | محافظة تعز | PPL | 80 | 13 | 31.92 | taiz |
| al-mawtan | الموطن | Al Mawţan | محافظة تعز | PPL | 80 | 9 | 31.15 | taiz |
| ad-dashin | الداشن | Ad Dāshin | محافظة تعز | PPL | 80 | 29 | 31.38 | taiz |
| al-hamami | الحمامي | Al Ḩamāmī | محافظة تعز | PPL | 80 | 20 | 32.80 | taiz |
| al-buhaydi | البحيدي | Al Buḩaydī | محافظة تعز | PPL | 80 | 8 | 33.17 | taiz |
| ar-rajbiyah | الرجبية | Ar Rajbīyah | محافظة تعز | PPL | 80 | 10 | 33.52 | taiz |
| khusanah | خوصانة | Khūşānah | محافظة تعز | PPL | 80 | 7 | 32.54 | taiz |
| al-muhayjir | المحيجر | Al Muḩayjir | محافظة تعز | PPL | 80 | 6 | 35.10 | taiz |
| hasib-shamsan | حصب شمسان | Ḩaşib Shamsān | محافظة تعز | PPL | 80 | 11 | 32.81 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 11 | 32.64 | taiz |
| ad-daribah | الضاربة | Aḑ Ḑāribah | محافظة تعز | PPL | 80 | 8 | 32.35 | taiz |
| al-khazijah | الخزجة | Al Khazijah | محافظة تعز | PPL | 80 | 2 | 32.46 | taiz |
| al-makhrab | المخرب | Al Makhrab | محافظة تعز | PPL | 80 | 4 | 32.62 | taiz |
| ad-dakkan | الدكان | Ad Dakkān | محافظة تعز | PPL | 80 | 6 | 34.52 | taiz |
| dar-al-mansurah | دار المنصورة | Dār al Manşūrah | محافظة تعز | PPL | 80 | 11 | 39.58 | taiz |
| al-qashah | القشعة | Al Qash‘ah | محافظة تعز | PPL | 80 | 5 | 39.77 | taiz |
| dar-al-faqi | دار الفاقع | Dār al Fāqi‘ | محافظة تعز | PPL | 80 | 5 | 39.46 | taiz |
| al-munayhir | المنيهر | Al Munayhir | محافظة تعز | PPL | 80 | 5 | 39.68 | taiz |
| awkabah | عوكبة | ‘Awkabah | محافظة تعز | PPL | 80 | 12 | 39.57 | taiz |
| al-qahirah | القاهرة | Al Qāhirah | محافظة تعز | PPL | 80 | 15 | 34.67 | taiz |
| al-malatah | الملطة | Al Malaţah | محافظة تعز | PPL | 80 | 5 | 35.23 | taiz |
| dar-az-zawah | دار الزوة | Dār az Zawah | محافظة تعز | PPL | 80 | 3 | 35.92 | taiz |
| al-ghalil-al-asfal | الغليل الأسفل | Al Ghalīl al Asfal | محافظة تعز | PPL | 80 | 2 | 35.61 | taiz |
| al-ghalil-al-ala | الغليل الأعلى | Al Ghalīl al A‘lá | محافظة تعز | PPL | 80 | 12 | 35.06 | taiz |
| al-muqna | المقنع | Al Muqna‘ | محافظة تعز | PPL | 80 | 7 | 34.19 | taiz |
| al-maaqid | المعاقيد | Al Ma‘āqīd | محافظة تعز | PPL | 80 | 5 | 33.98 | taiz |
| basharah | بشارة | Bashārah | محافظة تعز | PPL | 80 | 1 | 33.65 | taiz |
| al-badih | البديح | Al Badīḩ | محافظة تعز | PPL | 80 | 5 | 35.77 | taiz |
| ar-raddah | الردة | Ar Raddah | محافظة تعز | PPL | 80 | 2 | 35.84 | taiz |
| al-hawsh | الحوش | Al Ḩawsh | محافظة تعز | PPL | 80 | 5 | 35.80 | taiz |
| habuqu | حبوقو | Ḩabūqū | محافظة تعز | PPL | 80 | 15 | 34.83 | taiz |
| al-aqir | العقير | Al ‘Aqīr | محافظة تعز | PPL | 80 | 8 | 60.06 | taiz |
| al-qalah | القلعة | Al Qal‘ah | محافظة تعز | PPL | 80 | 32 | 60.09 | taiz |
| al-hamrur | الحمرور | Al Ḩamrūr | محافظة تعز | PPL | 80 | 14 | 61.16 | taiz |
| ad-dalamah | الدلعمة | Ad Dal‘amah | محافظة تعز | PPL | 80 | 15 | 63.02 | taiz |
| al-burayhat | البريحات | Al Burayḩāt | محافظة تعز | PPL | 80 | 43 | 63.46 | taiz |
| dawrayn | ضورين | Ḑawrayn | محافظة تعز | PPL | 80 | 18 | 63.22 | taiz |
| hasab-al-mas | حصب الماس | Ḩaşab al Mās | محافظة تعز | PPL | 80 | 38 | 63.93 | taiz |
| an-nahr | النحر | An Naḩr | محافظة تعز | PPL | 80 | 5 | 61.99 | taiz |
| an-naqahah | النقاحة | An Naqāḩah | محافظة تعز | PPL | 80 | 50 | 63.71 | taiz |
| al-qahfah | القحفة | Al Qaḩfah | محافظة تعز | PPL | 80 | 28 | 63.74 | taiz |
| al-musayhah | المسيحة | Al Musayḩah | محافظة تعز | PPL | 80 | 18 | 64.08 | taiz |
| al-jaadiyah | الجعادية | Al Ja‘ādīyah | محافظة تعز | PPL | 80 | 21 | 63.25 | taiz |
| al-qushayah | القشيعة | Al Qushay‘ah | محافظة تعز | PPL | 80 | 17 | 61.65 | taiz |
| al-hijrah | الهجرة | Al Hijrah | محافظة تعز | PPL | 80 | 6 | 61.85 | taiz |
| hurayzah | حريزة | Ḩurayzah | محافظة تعز | PPL | 80 | 16 | 61.83 | taiz |
| harik-an-nawiyah | حارك النوية | Ḩārik an Nawīyah | محافظة تعز | PPL | 80 | 22 | 61.36 | taiz |
| al-hasab | الحصب | Al Ḩaşab | محافظة تعز | PPL | 80 | 50 | 61.32 | taiz |
| az-zanah | الزنح | Az Zanaḩ | محافظة تعز | PPL | 80 | 18 | 61.44 | taiz |
| al-hasah | الحصة | Al Ḩasah | محافظة تعز | PPL | 80 | 13 | 61.84 | taiz |
| makbir | مكبر | Makbir | محافظة تعز | PPL | 80 | 53 | 60.26 | taiz |
| al-khabbiyah | الخبية | Al Khabbīyah | محافظة تعز | PPL | 80 | 29 | 58.36 | taiz |
| shatt-mawidah | شط معوضة | Shaţţ Ma‘wiḑah | محافظة تعز | PPL | 80 | 2 | 62.37 | taiz |
| ar-raqah | الرقعة | Ar Raq‘ah | محافظة تعز | PPL | 80 | 5 | 63.76 | taiz |
| an-nazud | النازود | An Nāzūd | محافظة تعز | PPL | 80 | 12 | 65.10 | taiz |
| al-hulqum | الحلقوم | Al Ḩulqūm | محافظة تعز | PPL | 80 | 6 | 65.62 | taiz |
| al-fasah | الفاصة | Al Fāşah | محافظة تعز | PPL | 80 | 28 | 66.97 | taiz |
| an-nakhilah | النخيلة | An Nakhīlah | محافظة تعز | PPL | 80 | 16 | 67.90 | taiz |
| al-akhal | الأكحل | Al Akḩal | محافظة تعز | PPL | 80 | 27 | 45.07 | taiz |
| dar-as-salam | دار السلام | Dār as Salām | محافظة تعز | PPL | 80 | 18 | 44.54 | taiz |
| al-qashaib | القشائب | Al Qashā’ib | محافظة تعز | PPL | 80 | 15 | 44.11 | taiz |
| al-huthun | الحثن | Al Ḩuthun | محافظة تعز | PPL | 80 | 32 | 44.15 | taiz |
| al-hajarah | الحجرة | Al Ḩajarah | محافظة تعز | PPL | 80 | 31 | 43.70 | taiz |
| al-izbiyah | العزبية | Al ‘Izbīyah | محافظة تعز | PPL | 80 | 34 | 44.62 | taiz |
| khutaybah-al-izbiyah | خطيب العزيبة | Khuţaybah al ‘Izbīyah | محافظة تعز | PPL | 80 | 4 | 44.55 | taiz |
| tawr-basir | طور بصير | Ţawr Başīr | محافظة تعز | PPL | 80 | 17 | 51.79 | taiz |
| tawrah | طورة | Ţawrah | محافظة تعز | PPL | 80 | 42 | 51.54 | taiz |
| bin-ali | بن علي | Bin ‘Alī | محافظة تعز | PPL | 80 | 34 | 47.45 | taiz |
| ahuqah | عهوقة | ‘Aḩūqah | محافظة تعز | PPL | 80 | 31 | 49.32 | taiz |
| al-haqibah | الحقيبة | Al Ḩaqībah | محافظة تعز | PPL | 80 | 57 | 49.43 | taiz |
| al-mujarib | المجارب | Al Mujārib | محافظة تعز | PPL | 80 | 40 | 45.41 | taiz |
| al-barhah | البرحة | Al Barḩah | محافظة تعز | PPL | 80 | 18 | 54.37 | taiz |
| hujayj | حجيج | Ḩujayj | محافظة تعز | PPL | 80 | 13 | 54.71 | taiz |
| as-sakrinah | السكرنة | As Sakrinah | محافظة تعز | PPL | 80 | 22 | 44.05 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 12 | 44.61 | taiz |
| al-mahwa | المحوى | Al Maḩwá | محافظة تعز | PPL | 80 | 16 | 44.48 | taiz |
| dajinah | داجنة | Dājinah | محافظة تعز | PPL | 80 | 46 | 44.35 | taiz |
| an-najlah | النجلة | An Najlah | محافظة تعز | PPL | 80 | 22 | 44.22 | taiz |
| turrat-al-barqaah | طرة البرقعة | Ţurrat al Barqa‘ah | محافظة تعز | PPL | 80 | 18 | 51.96 | taiz |
| labih | لابح | Lābiḩ | محافظة تعز | PPL | 80 | 30 | 51.86 | taiz |
| turrat-al-juayrah | طرة الجعيرة | Ţurrat al Ju‘ayrah | محافظة تعز | PPL | 80 | 24 | 52.23 | taiz |
| al-majzarah | المجزرة | Al Majzarah | محافظة تعز | PPL | 80 | 29 | 52.66 | taiz |
| al-mushayir | المشيعير | Al Mushay‘īr | محافظة تعز | PPL | 80 | 3 | 52.65 | taiz |
| turrat-al-jawbii | طرة الجوبعي | Ţurrat al Jawbi‘ī | محافظة تعز | PPL | 80 | 3 | 52.10 | taiz |
| al-hajjajiyah | الحجاجية | Al Ḩajjājīyah | محافظة تعز | PPL | 80 | 6 | 50.19 | taiz |
| al-maqtarran | المقطرن | Al Maqţarran | محافظة تعز | PPL | 80 | 11 | 50.32 | taiz |
| al-qatatah | القطاطة | Al Qaţāţah | محافظة تعز | PPL | 80 | 12 | 50.10 | taiz |
| al-atwar | الأطوار | Al Aţwār | محافظة تعز | PPL | 80 | 31 | 50.23 | taiz |
| al-hujayrah | الحجيرة | Al Ḩujayrah | محافظة تعز | PPL | 80 | 8 | 51.42 | taiz |
| hasib-an-nuqud | حصب النقود | Ḩaşib an Nuqūd | محافظة تعز | PPL | 80 | 2 | 50.04 | taiz |
| ar-radi | الرادع | Ar Rādi‘ | محافظة تعز | PPL | 80 | 14 | 44.01 | taiz |
| ad-dakhilah | الداخلة | Ad Dākhilah | محافظة تعز | PPL | 80 | 11 | 55.05 | taiz |
| al-haywah-al-bayda | الحيوة البيضاء | Al Ḩaywah al Bayḑā’ | محافظة تعز | PPL | 80 | 24 | 54.89 | taiz |
| al-khayf | الخيف | Al Khayf | محافظة تعز | PPL | 80 | 41 | 55.23 | taiz |
| husayb-al-mashahirah | حصيب المشاهرة | Ḩuşayb al Mashāhirah | محافظة تعز | PPL | 80 | 6 | 55.17 | taiz |
| mahutu | محوطو | Maḩūţū | محافظة تعز | PPL | 80 | 9 | 55.00 | taiz |
| al-haybah | الحبية | Al Ḩaybah | محافظة تعز | PPL | 80 | 15 | 55.19 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 13 | 53.18 | taiz |
| at-tusaybah | التصيبة | At Tuşaybah | محافظة تعز | PPL | 80 | 15 | 54.25 | taiz |
| al-aridah | العارضة | Al ‘Āriḑah | محافظة تعز | PPL | 80 | 23 | 56.31 | taiz |
| al-haqibah | الحقيبة | Al Ḩaqībah | محافظة تعز | PPL | 80 | 18 | 56.99 | taiz |
| al-hasab | الحصب | Al Ḩaşab | محافظة تعز | PPL | 80 | 77 | 56.67 | taiz |
| jadimah | جديمة | Jadīmah | محافظة تعز | PPL | 80 | 12 | 56.16 | taiz |
| al-ghawl | الغول | Al Ghawl | محافظة تعز | PPL | 80 | 14 | 58.99 | taiz |
| ad-dafnah | الدفنة | Ad Dafnah | محافظة تعز | PPL | 80 | 6 | 52.95 | taiz |
| al-hasyah | الحسية | Al Ḩasyah | محافظة تعز | PPL | 80 | 12 | 51.33 | taiz |
| ad-dukhayl | الدخيل | Ad Dukhayl | محافظة تعز | PPL | 80 | 25 | 52.25 | taiz |
| al-mazaq | المزق | Al Mazaq | محافظة تعز | PPL | 80 | 28 | 52.05 | taiz |
| at-tuwayran | الطويران | Aţ Ţuwayrān | محافظة تعز | PPL | 80 | 9 | 51.80 | taiz |
| al-hudaydah | الحديدة | Al Ḩudaydah | محافظة تعز | PPL | 80 | 11 | 51.20 | taiz |
| ad-damdam | الدمدم | Ad Damdam | محافظة تعز | PPL | 80 | 56 | 50.85 | taiz |
| al-habwah | الحبوة | Al Ḩabwah | محافظة تعز | PPL | 80 | 9 | 52.12 | taiz |
| al-faqi | الفاقع | Al Fāqi‘ | محافظة تعز | PPL | 80 | 2 | 48.80 | taiz |
| at-tawbah | التوبة | At Tawbah | محافظة تعز | PPL | 80 | 17 | 51.82 | taiz |
| al-bakriyah | البكرية | Al Bakrīyah | محافظة تعز | PPL | 80 | 7 | 50.53 | taiz |
| al-khudayra | الخضيراء | Al Khuḑayrā’ | محافظة تعز | PPL | 80 | 36 | 47.71 | taiz |
| az-zawim | الزويم | Az Zawīm | محافظة تعز | PPL | 80 | 32 | 47.19 | taiz |
| al-qahir | القاهر | Al Qāhir | محافظة تعز | PPL | 80 | 39 | 45.20 | taiz |
| al-hudun | الحدون | Al Ḩudūn | محافظة تعز | PPL | 80 | 8 | 44.89 | taiz |
| al-ajnar | العجنر | Al ‘Ajnar | محافظة تعز | PPL | 80 | 18 | 52.30 | taiz |
| al-kuri | الكوري | Al Kūrī | محافظة تعز | PPL | 80 | 24 | 52.18 | taiz |
| al-uharif | العهارف | Al ‘Uhārif | محافظة تعز | PPL | 80 | 25 | 51.69 | taiz |
| ad-dur | الدور | Ad Dūr | محافظة تعز | PPL | 80 | 109 | 52.94 | taiz |
| al-muqahi | المقاهي | Al Muqāhī | محافظة تعز | PPL | 80 | 11 | 52.93 | taiz |
| hasab-al-maqtar | حصب المقطار | Ḩaşab al Maqţār | محافظة تعز | PPL | 80 | 6 | 53.08 | taiz |
| mibtaah | مبتعة | Mibta‘ah | محافظة تعز | PPL | 80 | 14 | 54.59 | taiz |
| al-manqaah | المنقاعة | Al Manqā‘ah | محافظة تعز | PPL | 80 | 15 | 54.71 | taiz |
| al-mayanah | المعيانة | Al Ma‘yānah | محافظة تعز | PPL | 80 | 13 | 54.03 | taiz |
| ar-rafisah | الرفصة | Ar Rafişah | محافظة تعز | PPL | 80 | 11 | 54.08 | taiz |
| ash-shaqah | الشاقة | Ash Shāqah | محافظة تعز | PPL | 80 | 4 | 54.31 | taiz |
| bashirah | بعشيرة | Ba‘shīrah | محافظة تعز | PPL | 80 | 4 | 54.33 | taiz |
| al-qawz | القوز | Al Qawz | محافظة تعز | PPL | 80 | 4 | 54.62 | taiz |
| al-qutayf | القطيف | Al Quţayf | محافظة تعز | PPL | 80 | 3 | 55.21 | taiz |
| al-malam | المعلم | Al Ma‘lam | محافظة تعز | PPL | 80 | 9 | 54.60 | taiz |
| saduh | سدوح | Sadūḩ | محافظة تعز | PPL | 80 | 6 | 54.32 | taiz |
| bardhaah | برذعة | Bardha‘ah | محافظة تعز | PPL | 80 | 1 | 31.05 | taiz |
| al-arsum | العرصوم | Al ‘Arşūm | محافظة تعز | PPL | 80 | 1 | 31.09 | taiz |
| as-sulayhi | الصليحـي | Aş Şulayḩī | محافظة تعز | PPL | 80 | 1 | 30.20 | taiz |
| abbad | عباد | Abbād | محافظة تعز | PPL | 80 | 1 | 30.85 | taiz |
| al-hulaylaj | الهليلج | Al Hulaylaj | محافظة تعز | PPL | 80 | 4 | 28.58 | taiz |
| al-manakh | المناخ | Al Manākh | محافظة تعز | PPL | 80 | 1 | 28.23 | taiz |
| al-haydribah | الحيدربة | Al Ḩaydribah | محافظة تعز | PPL | 80 | 32 | 71.80 | taiz |
| al-urayqah | العريقة | Al ‘Urayqah | محافظة تعز | PPL | 80 | 30 | 66.50 | taiz |
| at-tamir | الطمير | Aţ Ţamīr | محافظة تعز | PPL | 80 | 87 | 60.23 | taiz |
| al-hanjarah | الحنجرة | Al Ḩanjarah | محافظة تعز | PPL | 80 | 50 | 60.25 | taiz |
| bahtah | باهتة | Bāhtah | محافظة تعز | PPL | 80 | 7 | 35.67 | taiz |
| al-qardurah | القردورة | Al Qardūrah | محافظة تعز | PPL | 80 | 6 | 37.89 | taiz |
| al-haljilah | الهلجلة | Al Haljilah | محافظة تعز | PPL | 80 | 4 | 37.44 | taiz |
| al-mazjarah | المزجرة | Al Mazjarah | محافظة تعز | PPL | 80 | 1 | 35.51 | taiz |
| al-qarfah | القرفة | Al Qarfah | محافظة تعز | PPL | 80 | 10 | 36.13 | taiz |
| al-falakhah | الفلخة | Al Falakhah | محافظة تعز | PPL | 80 | 8 | 36.31 | taiz |
| al-buzayj | البزيج | Al Buzayj | محافظة تعز | PPL | 80 | 9 | 37.38 | taiz |
| al-jahili | الجاهلي | Al Jāhilī | محافظة تعز | PPL | 80 | 5 | 36.83 | taiz |
| al-hait | الحائط | Al Ḩā’iţ | محافظة تعز | PPL | 80 | 11 | 36.29 | taiz |
| al-arais | العرائس | Al ‘Arā’is | محافظة تعز | PPL | 80 | 26 | 36.80 | taiz |
| at-tabibah | التبيبة | At Tabībah | محافظة تعز | PPL | 80 | 9 | 37.03 | taiz |
| al-mahruz | المحروز | Al Maḩrūz | محافظة تعز | PPL | 80 | 10 | 34.49 | taiz |
| ar-ruwakib | الرواكب | Ar Ruwākib | محافظة تعز | PPL | 80 | 2 | 34.93 | taiz |
| al-jaryuh | الجريوة | Al Jaryūh | محافظة تعز | PPL | 80 | 4 | 35.28 | taiz |
| al-burayhah | البريحة | Al Burayḩah | محافظة تعز | PPL | 80 | 1 | 32.67 | taiz |
| al-jiat | الجيعان | Al Jī‘āt | محافظة تعز | PPL | 80 | 1 | 38.11 | taiz |
| shatt-al-awtiyah | شط الأوطية | Shaţţ al Awţīyah | محافظة تعز | PPL | 80 | 7 | 41.48 | taiz |
| al-aqrinah | الأقرنة | Al Aqrinah | محافظة تعز | PPL | 80 | 1 | 40.65 | taiz |
| thaubah | ثعوبة | Tha‘ūbah | محافظة تعز | PPL | 80 | 3 | 36.74 | taiz |
| dar-tamil | دار تميل | Dār Tamīl | محافظة تعز | PPL | 80 | 4 | 36.71 | taiz |
| al-muhabil | المحابيل | Al Muḩābīl | محافظة تعز | PPL | 80 | 2 | 37.51 | taiz |
| al-ujaynah | الأجينة | Al Ujaynah | محافظة تعز | PPL | 80 | 1 | 36.75 | taiz |
| al-habilah | الهبيلة | Al Habīlah | محافظة تعز | PPL | 80 | 1 | 37.37 | taiz |
| ad-dabilah | الدبيلة | Ad Dabīlah | محافظة تعز | PPL | 80 | 1 | 35.93 | taiz |
| lahsham | لهشام | Lahshām | محافظة تعز | PPL | 80 | 1 | 34.98 | taiz |
| ar-ribus | الربوص | Ar Ribūş | محافظة تعز | PPL | 80 | 10 | 41.01 | taiz |
| al-hayjah | الهيجة | Al Hayjah | محافظة تعز | PPL | 80 | 3 | 37.41 | taiz |
| al-hammam | الحمام | Al Ḩammām | محافظة تعز | PPL | 80 | 2 | 33.46 | taiz |
| al-hajarah | الحجرة | Al Ḩajarah | محافظة تعز | PPL | 80 | 2 | 34.09 | taiz |
| al-mawayigh | الموايغ | Al Mawāyigh | محافظة تعز | PPL | 80 | 2 | 34.13 | taiz |
| ad-dashin | الداشن | Ad Dāshin | محافظة تعز | PPL | 80 | 4 | 31.57 | taiz |
| al-hajab | الحجب | Al Ḩajab | محافظة تعز | PPL | 80 | 2 | 32.62 | taiz |
| ad-duwaydah | الدويدة | Ad Duwaydah | محافظة تعز | PPL | 80 | 3 | 55.24 | taiz |
| ad-darabih | الدرابح | Ad Darābiḩ | محافظة تعز | PPL | 80 | 17 | 55.04 | taiz |
| al-ubaynah | العبينة | Al ‘Ubaynah | محافظة تعز | PPL | 80 | 2 | 53.82 | taiz |
| ar-raqisah | الرقيصة | Ar Raqīşah | محافظة تعز | PPL | 80 | 26 | 49.30 | taiz |
| unayyah | عيينة | ‘Unayyah | محافظة تعز | PPL | 80 | 35 | 49.02 | taiz |
| al-haqirah | الحقيرة | Al Ḩaqīrah | محافظة تعز | PPL | 80 | 258 | 53.28 | taiz |
| al-wadn | الودن | Al Wadn | محافظة تعز | PPL | 80 | 79 | 54.28 | taiz |
| al-aqqah | العقة | Al ‘Aqqah | محافظة تعز | PPL | 80 | 98 | 54.87 | taiz |
| al-jahili | الجاهلي | Al Jāhilī | محافظة تعز | PPL | 80 | 212 | 58.44 | taiz |
| ash-sharj | الشرج | Ash Sharj | محافظة تعز | PPL | 80 | 18 | 42.60 | taiz |
| ash-shamliyah | الشملية | Ash Shamlīyah | محافظة تعز | PPL | 80 | 31 | 44.70 | taiz |
| al-madbayah | المضباية | Al Maḑbāyah | محافظة تعز | PPL | 80 | 85 | 47.02 | taiz |
| al-mahakilah | المحاكلة | Al Maḩākilah | محافظة تعز | PPL | 80 | 20 | 44.19 | taiz |
| al-jurubah | الجروبة | Al Jurūbah | محافظة تعز | PPL | 80 | 17 | 42.29 | taiz |
| al-mazhajah | المزحاجة | Al Mazḩājah | محافظة تعز | PPL | 80 | 26 | 41.88 | taiz |
| al-juraybah | الجريبة | Al Juraybah | محافظة تعز | PPL | 80 | 44 | 44.13 | taiz |
| al-maririyah | المريرية | Al Marīrīyah | محافظة تعز | PPL | 80 | 31 | 44.10 | taiz |
| al-qaryah | القرية | Al Qaryah | محافظة تعز | PPL | 80 | 14 | 44.93 | taiz |
| al-muqazzaz | المقظظ | Al Muqaz̧z̧az̧ | محافظة تعز | PPL | 80 | 1 | 41.52 | taiz |
| al-qulayah | القليعة | Al Qulay‘ah | محافظة تعز | PPL | 80 | 44 | 41.53 | taiz |
| al-malhah | الملحة | Al Malḩah | محافظة تعز | PPL | 80 | 4 | 42.30 | taiz |
| ad-daraghamah | الدراغمة | Ad Darāghamah | محافظة تعز | PPL | 80 | 58 | 45.38 | taiz |
| at-tamarah | التمارة | At Tamārah | محافظة تعز | PPL | 80 | 6 | 45.85 | taiz |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة تعز | PPL | 80 | 79 | 45.45 | taiz |
| al-udayba | العضيباء | Al ‘Uḑaybā’ | محافظة تعز | PPL | 80 | 28 | 43.33 | taiz |
| hasab-al-huwayj | حصب الحويج | Ḩaşab al Ḩuwayj | محافظة تعز | PPL | 80 | 2 | 42.87 | taiz |
| hayjat-jannah | هيجة جبح | Hayjat Jannaḩ | محافظة تعز | PPL | 80 | 24 | 49.15 | taiz |
| al-madla | المضلع | Al Maḑla‘ | محافظة تعز | PPL | 80 | 24 | 44.53 | taiz |
| al-aqiqin | العقيقين | Al ‘Aqīqīn | محافظة تعز | PPL | 80 | 10 | 54.55 | taiz |
| al-muaytah | المعيطة | Al Mu‘ayţah | محافظة تعز | PPL | 80 | 90 | 46.12 | taiz |
| al-qurayn | القرين | Al Qurayn | محافظة تعز | PPL | 80 | 4 | 43.01 | taiz |
| al-kuwayrah | الكويرة | Al Kuwayrah | محافظة تعز | PPL | 80 | 61 | 65.71 | taiz |
| al-khadirah | الخضيرة | Al Khaḑīrah | محافظة تعز | PPL | 80 | 34 | 65.92 | taiz |
| dar-al-kidf | دار الكدف | Dār al Kidf | محافظة تعز | PPL | 80 | 52 | 62.52 | taiz |
| at-tahiri | الطاهري | Aţ Ţāhirī | محافظة تعز | PPL | 80 | 42 | 61.63 | taiz |
| al-humaydah | الحميدة | Al Ḩumaydah | محافظة تعز | PPL | 80 | 34 | 61.06 | taiz |
| al-qutayah | القطيعة | Al Quţay‘ah | محافظة تعز | PPL | 80 | 19 | 62.28 | taiz |
| ad-dahim | الدحيم | Ad Daḩīm | محافظة تعز | PPL | 80 | 131 | 64.73 | taiz |
| husayb-al-qurayma | حصيب القريماء | Ḩusayb al Quraymā’ | محافظة تعز | PPL | 80 | 77 | 62.82 | taiz |
| jihad | جهاد | Jihād | محافظة تعز | PPL | 80 | 44 | 64.22 | taiz |
| al-hajibah | الهجبة | Al Hajibah | محافظة تعز | PPL | 80 | 42 | 58.20 | taiz |
| al-maratimah | المراتمة | Al Marātimah | محافظة تعز | PPL | 80 | 37 | 58.60 | taiz |
| al-hulaybah | الهليبة | Al Hulaybah | محافظة تعز | PPL | 80 | 8 | 59.34 | taiz |
| al-hajarah | الحجرة | Al Ḩajarah | محافظة تعز | PPL | 80 | 1 | 48.09 | taiz |
| al-qurayf | القريف | Al Qurayf | محافظة تعز | PPL | 80 | 2 | 48.19 | taiz |
| az-zuraybah | الزريبة | Az Zuraybah | محافظة تعز | PPL | 80 | 1 | 48.18 | taiz |
| al-malaf | الملف | Al Malaf | محافظة تعز | PPL | 80 | 2 | 48.67 | taiz |
| al-hujayr | الحجير | Al Ḩujayr | محافظة تعز | PPL | 80 | 2 | 47.70 | taiz |
| az-zaht | الزحط | Az Zaḩţ | محافظة تعز | PPL | 80 | 2 | 47.32 | taiz |
| al-khayl-ash-shami | الخيل الشامي | Al Khayl ash Shāmī | محافظة تعز | PPL | 80 | 2 | 53.23 | taiz |
| an-nariji | النارجى | An Nārijī | محافظة تعز | PPL | 80 | 1 | 52.45 | taiz |
| al-muhayqinah | المحيقنة | Al Muḩayqinah | محافظة تعز | PPL | 80 | 1 | 52.70 | taiz |
| hayjat-al-waqi | هيجة الواقع | Hayjat al Wāqi‘ | محافظة تعز | PPL | 80 | 1 | 49.37 | taiz |
| al-madah | المداح | Al Madāḩ | محافظة تعز | PPL | 80 | 1 | 49.70 | taiz |
| al-luayyah | اللعية | Al Lu‘ayyah | محافظة تعز | PPL | 80 | 2 | 48.95 | taiz |
| al-munjaydah | المنجيدة | Al Munjaydah | محافظة تعز | PPL | 80 | 1 | 50.43 | taiz |
| ar-rajilah | الراجلة | Ar Rājilah | محافظة تعز | PPL | 80 | 2 | 50.32 | taiz |
| al-hijrah | الهجرة | Al Hijrah | محافظة تعز | PPL | 80 | 1 | 50.12 | taiz |
| ad-daym | الديم | Ad Daym | محافظة تعز | PPL | 80 | 1 | 50.02 | taiz |
| al-maqhawiyin | المقهويين | Al Maqhawīyīn | محافظة تعز | PPL | 80 | 1 | 50.58 | taiz |
| al-qarhiyan | القرحيان | Al Qarḩiyān | محافظة تعز | PPL | 80 | 1 | 49.73 | taiz |
| al-marbayn | المربين | Al Marbayn | محافظة تعز | PPL | 80 | 1 | 50.17 | taiz |
| al-uqaylah | العقيلة | Al ‘Uqaylah | محافظة تعز | PPL | 80 | 1 | 50.01 | taiz |
| al-matarid | المعترض | Al Ma‘tariḑ | محافظة تعز | PPL | 80 | 1 | 51.75 | taiz |
| barh-al-mia | برح المعاع | Barḩ al Mi‘ā‘ | محافظة تعز | PPL | 80 | 1 | 53.30 | taiz |
| ar-ruqayah | الرقيعة | Ar Ruqay‘ah | محافظة تعز | PPL | 80 | 1 | 51.71 | taiz |
| at-tayyib | الطيب | Aţ Ţayyib | محافظة تعز | PPL | 80 | 1 | 52.71 | taiz |
| ash-shuqqaq | الشقاق | Ash Shuqqāq | محافظة تعز | PPL | 80 | 1 | 51.89 | taiz |
| al-wayti | اللويطي | Al Wayţī | محافظة تعز | PPL | 80 | 1 | 54.76 | taiz |
| al-ambas | الأمباص | Al Ambāş | محافظة تعز | PPL | 80 | 1 | 54.77 | taiz |
| al-qaharah | القحارة | Al Qaḩārah | محافظة تعز | PPL | 80 | 1 | 54.42 | taiz |
| al-bati | البطي | Al Baţī | محافظة تعز | PPL | 80 | 1 | 54.41 | taiz |
| al-mukaymin | المكيمن | Al Mukaymin | محافظة تعز | PPL | 80 | 1 | 54.75 | taiz |
| al-mawridah | الموردة | Al Mawridah | محافظة تعز | PPL | 80 | 1 | 54.85 | taiz |
| al-madah | المداح | Al Madāḩ | محافظة تعز | PPL | 80 | 5 | 55.15 | taiz |
| taljah | تلجة | Taljah | محافظة تعز | PPL | 80 | 2 | 46.77 | taiz |
| al-ihsab | الإحصاب | Al Iḩşāb | محافظة تعز | PPL | 80 | 1 | 46.79 | taiz |
| al-hawayah | الحواية | Al Ḩawāyah | محافظة تعز | PPL | 80 | 1 | 47.09 | taiz |
| al-hawb | الهوب | Al Hawb | محافظة تعز | PPL | 80 | 3 | 45.84 | taiz |
| khuzafir | خزافر | Khuzāfir | محافظة تعز | PPL | 80 | 2 | 46.49 | taiz |
| al-jamaniyah | الجمانية | Al Jamānīyah | محافظة تعز | PPL | 80 | 3 | 46.82 | taiz |
| al-arjush | العرجوش | Al ‘Arjūsh | محافظة تعز | PPL | 80 | 1 | 42.54 | taiz |
| al-atla | الأتلاء | Al Atlā’ | محافظة تعز | PPL | 80 | 1 | 42.60 | taiz |
| az-zaht | الزحط | Az Zaḩţ | محافظة تعز | PPL | 80 | 1 | 42.53 | taiz |
| habashah | حبشة | Ḩabashah | محافظة تعز | PPL | 80 | 1 | 42.08 | taiz |
| qab-at-tira | قبع الطراء | Qab‘ aţ Ţirā’ | محافظة تعز | PPL | 80 | 1 | 42.03 | taiz |
| al-maksir | المكسر | Al Maksir | محافظة تعز | PPL | 80 | 1 | 42.58 | taiz |
| al-himr | الحمر | Al Ḩimr | محافظة تعز | PPL | 80 | 1 | 42.69 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 1 | 43.38 | taiz |
| dha-ash-shihn | ذا الشحن | Dhā ash Shiḩn | محافظة تعز | PPL | 80 | 2 | 43.18 | taiz |
| al-amqa | العمقاء | Al ‘Amqā’ | محافظة تعز | PPL | 80 | 1 | 43.06 | taiz |
| qahfat-al-hawshah | قحفة الهوشة | Qaḩfat al Hawshah | محافظة تعز | PPL | 80 | 2 | 43.25 | taiz |
| al-makhalif | المخالف | Al Makhālif | محافظة تعز | PPL | 80 | 2 | 42.85 | taiz |
| ash-sharaf | الشرف | Ash Sharaf | محافظة تعز | PPL | 80 | 1 | 42.95 | taiz |
| as-subayl | السبيل | As Subayl | محافظة تعز | PPL | 80 | 1 | 43.33 | taiz |
| al-birah | البيرح | Al Bīraḩ | محافظة تعز | PPL | 80 | 1 | 43.34 | taiz |
| qahfat-umar | قحفة عمر | Qaḩfat ‘Umar | محافظة تعز | PPL | 80 | 1 | 42.87 | taiz |
| al-mafakhah | المفخة | Al Mafakhah | محافظة تعز | PPL | 80 | 2 | 43.30 | taiz |
| kabda | كبدا | Kabdā | محافظة تعز | PPL | 80 | 1 | 43.10 | taiz |
| kashah | كشاح | Kashāḩ | محافظة تعز | PPL | 80 | 1 | 42.80 | taiz |
| al-lajah | اللجعة | Al Laj‘ah | محافظة تعز | PPL | 80 | 1 | 42.81 | taiz |
| al-qazhi | القزحي | Al Qazḩī | محافظة تعز | PPL | 80 | 2 | 43.07 | taiz |
| at-turrah | الطرة | Aţ Ţurrah | محافظة تعز | PPL | 80 | 1 | 43.93 | taiz |
| az-zuniyah | الزنية | Az Zunīyah | محافظة تعز | PPL | 80 | 1 | 44.26 | taiz |
| al-lujm | اللجم | Al Lujm | محافظة تعز | PPL | 80 | 1 | 44.49 | taiz |
| al-mashab | المسحب | Al Masḩab | محافظة تعز | PPL | 80 | 3 | 43.24 | taiz |
| al-jizah | الجزة | Al Jizah | محافظة تعز | PPL | 80 | 4 | 46.38 | taiz |
| al-hajib | الحاجب | Al Ḩājib | محافظة تعز | PPL | 80 | 6 | 46.85 | taiz |
| al-hisn | الحصن | Al Ḩişn | محافظة تعز | PPL | 80 | 2 | 46.84 | taiz |
| al-mamlah | المملاح | Al Mamlāḩ | محافظة تعز | PPL | 80 | 2 | 39.92 | taiz |
| ad-durayjah | الدريجة | Ad Durayjah | محافظة تعز | PPL | 80 | 2 | 40.50 | taiz |
| al-hunayah | الحناية | Al Ḩunāyah | محافظة تعز | PPL | 80 | 1 | 40.12 | taiz |
| al-mikmadah | المكمدة | Al Mikmadah | محافظة تعز | PPL | 80 | 1 | 38.15 | taiz |
| al-mazhanah | المزحانة | Al Mazḩānah | محافظة تعز | PPL | 80 | 1 | 38.80 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 1 | 42.28 | taiz |
| al-hajib | الحاجب | Al Ḩājib | محافظة تعز | PPL | 80 | 1 | 43.39 | taiz |
| jawl-al-bir | جول البير | Jawl al Bīr | محافظة تعز | PPL | 80 | 1 | 40.76 | taiz |
| al-haljimah | الحلجمة | Al Ḩaljimah | محافظة تعز | PPL | 80 | 1 | 47.46 | taiz |
| al-ghurmah | الغرمة | Al Ghurmah | محافظة تعز | PPL | 80 | 2 | 48.20 | taiz |
| ash-shuayb | الشعيب | Ash Shu‘ayb | محافظة تعز | PPL | 80 | 1 | 46.21 | taiz |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة تعز | PPL | 80 | 1 | 48.45 | taiz |
| al-uqbah | العقبة | Al ‘Uqbah | محافظة تعز | PPL | 80 | 1 | 45.55 | taiz |
| al-huwayr | الحوير | Al Ḩuwayr | محافظة تعز | PPL | 80 | 1 | 45.70 | taiz |
| al-qaryah | القرية | Al Qaryah | محافظة تعز | PPL | 80 | 3 | 45.61 | taiz |
| mahalib | المحاليب | Maḩālīb | محافظة تعز | PPL | 80 | 2 | 37.73 | taiz |
| mahalib-ad-dakhil | المحاليب الداخل | Maḩālīb ad Dākhil | محافظة تعز | PPL | 80 | 1 | 37.77 | taiz |
| al-kharaf | الخرف | Al Kharaf | محافظة تعز | PPL | 80 | 8 | 37.33 | taiz |
| al-kharaf-ad-dakhil | الخرف الداخل | Al Kharaf ad Dākhil | محافظة تعز | PPL | 80 | 1 | 37.45 | taiz |
| al-lakabah | الكبة | Al Lakabah | محافظة تعز | PPL | 80 | 3 | 38.83 | taiz |
| as-sifar | الصفار | Aş Şifār | محافظة تعز | PPL | 80 | 1 | 39.10 | taiz |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة تعز | PPL | 80 | 2 | 38.64 | taiz |
| adh-dhunbub | الذنبوب | Adh Dhunbūb | محافظة تعز | PPL | 80 | 1 | 38.56 | taiz |
| al-hudayn | الحدين | Al Ḩudayn | محافظة تعز | PPL | 80 | 1 | 38.89 | taiz |
| rida | رداع | Ridā‘ | محافظة تعز | PPL | 80 | 2 | 38.90 | taiz |
| qahfat-waydin | قحفة ويدين | Qaḩfat Waydīn | محافظة تعز | PPL | 80 | 3 | 37.08 | taiz |
| az-zarabiyah | الزريبة | Az Zarabīyah | محافظة تعز | PPL | 80 | 12 | 36.97 | taiz |
| dukm-al-usayq | دكم العسيق | Dukm al ‘Usayq | محافظة تعز | PPL | 80 | 2 | 37.25 | taiz |
| al-buhaym | البهيم | Al Buhaym | محافظة تعز | PPL | 80 | 1 | 38.78 | taiz |
| al-hanaf | الحنف | Al Ḩanaf | محافظة تعز | PPL | 80 | 3 | 39.15 | taiz |
| al-lakmah | اللكمة | Al Lakmah | محافظة تعز | PPL | 80 | 2 | 39.89 | taiz |
| al-muzabirayn | المزابرين | Al Muzābirayn | محافظة تعز | PPL | 80 | 1 | 40.87 | taiz |
| al-maswari | المسوري | Al Maswarī | محافظة تعز | PPL | 80 | 2 | 38.88 | taiz |
| suq-dhu-ar-rahah | سوق ذو الراحة | Sūq Dhū ar Rāḩah | محافظة تعز | PPL | 80 | 2 | 40.01 | taiz |
| manakh-zuhayyah | مناخ زهية | Manākh Zuhayyah | محافظة تعز | PPL | 80 | 3 | 37.77 | taiz |
| al-aqqam | العقام | Al ‘Aqqām | محافظة تعز | PPL | 80 | 2 | 37.74 | taiz |
| ahbash | أحباش | Aḩbāsh | محافظة تعز | PPL | 80 | 1 | 37.55 | taiz |
| dar-awwan | دار عون | Dār ‘Awwan | محافظة تعز | PPL | 80 | 2 | 39.81 | taiz |
| al-dawlil | الدولل | Al Dawlil | محافظة تعز | PPL | 80 | 1 | 38.95 | taiz |
| najd-an-nass | نجد النص | Najd an Naşş | محافظة تعز | PPL | 80 | 2 | 39.87 | taiz |
| mashraah | مشرعة | Mashra‘ah | محافظة تعز | PPL | 80 | 3 | 40.88 | taiz |
| al-qaryah-as-sufla | القرية السفلى | Al Qaryah as Suflá | محافظة تعز | PPL | 80 | 2 | 40.86 | taiz |
| al-mananah | المعنانة | Al Ma‘nānah | محافظة تعز | PPL | 80 | 1 | 40.72 | taiz |
| al-kadkad | الكدكاد | Al Kadkād | محافظة تعز | PPL | 80 | 1 | 41.18 | taiz |
| al-ashrafayn | الأشرفين | Al Ashrafayn | محافظة تعز | PPL | 80 | 1 | 41.00 | taiz |
| al-hajmat | الهجمات | Al Hajmāt | محافظة تعز | PPL | 80 | 2 | 41.07 | taiz |
| al-jaizah | الجائزة | Al Jā’izah | محافظة تعز | PPL | 80 | 1 | 41.16 | taiz |
| al-maqtar | المقطار | Al Maqţār | محافظة تعز | PPL | 80 | 2 | 51.00 | taiz |
| al-hawj | الحوج | Al Ḩawj | محافظة تعز | PPL | 80 | 2 | 51.09 | taiz |
| al-aqur | العقور | Al ‘Aqūr | محافظة تعز | PPL | 80 | 1 | 51.25 | taiz |
| al-qubrayn | القبرين | Al Qubrayn | محافظة تعز | PPL | 80 | 1 | 51.01 | taiz |
| al-hiraz | الحراز | Al Ḩirāz | محافظة تعز | PPL | 80 | 1 | 51.09 | taiz |
| ad-duhsays | الدحسيس | Ad Duḩsays | محافظة تعز | PPL | 80 | 1 | 51.25 | taiz |
| al-maradah | المردة | Al Maradah | محافظة تعز | PPL | 80 | 1 | 50.34 | taiz |
| al-qaradah | القرضة | Al Qaraḑah | محافظة تعز | PPL | 80 | 1 | 51.08 | taiz |
| al-kashhah | الكشحة | Al Kashḩah | محافظة تعز | PPL | 80 | 1 | 50.80 | taiz |
| uzayq | عزيق | ‘Uzayq | محافظة تعز | PPL | 80 | 1 | 51.22 | taiz |
| al-ghayl | الغيل | Al Ghayl | محافظة تعز | PPL | 80 | 1 | 51.86 | taiz |
| ar-rujm | الرجم | Ar Rujm | محافظة تعز | PPL | 80 | 2 | 50.53 | taiz |
| al-munasim | المناسم | Al Munāsim | محافظة تعز | PPL | 80 | 1 | 50.55 | taiz |
| al-qabqab | القبقب | Al Qabqab | محافظة تعز | PPL | 80 | 1 | 51.13 | taiz |
| ash-shirh | الشرح | Ash Shirḩ | محافظة تعز | PPL | 80 | 3 | 50.40 | taiz |
| al-fuqaywah | الفقيوة | Al Fuqaywah | محافظة تعز | PPL | 80 | 1 | 51.56 | taiz |
| al-katayah | الكناية | Al Katāyah | محافظة تعز | PPL | 80 | 1 | 51.80 | taiz |
| jurayjirah | جريجرة | Jurayjirah | محافظة تعز | PPL | 80 | 1 | 51.90 | taiz |
| al-falah | الفلاح | Al Falāḩ | محافظة تعز | PPL | 80 | 1 | 50.32 | taiz |
| al-qaryah-as-sufla | القرية السفلى | Al Qaryah as Suflá | محافظة تعز | PPL | 80 | 1 | 50.35 | taiz |
| al-wajd | الوجد | Al Wajd | محافظة تعز | PPL | 80 | 1 | 50.61 | taiz |
| dar-ash-sharaf | دار الشرف | Dār ash Sharaf | محافظة تعز | PPL | 80 | 1 | 49.91 | taiz |
| maqlabah | مقبلة | Maqlabah | محافظة تعز | PPL | 80 | 1 | 51.32 | taiz |
| hudayr | حضير | Ḩuḑayr | محافظة تعز | PPL | 80 | 3 | 50.88 | taiz |
| hurayb | هريب | Hurayb | محافظة تعز | PPL | 80 | 1 | 51.13 | taiz |
| maghzubah | مغزوبة | Maghzūbah | محافظة تعز | PPL | 80 | 1 | 50.75 | taiz |
| al-mikhlaf | المخلاف | Al Mikhlāf | محافظة تعز | PPL | 80 | 2 | 50.56 | taiz |
| al-khararah | الخرارة | Al Kharārah | محافظة تعز | PPL | 80 | 1 | 50.51 | taiz |
| al-udaynat | العدينات | Al ‘Udaynāt | محافظة تعز | PPL | 80 | 1 | 49.88 | taiz |
| al-farq | الفرق | Al Farq | محافظة تعز | PPL | 80 | 1 | 50.39 | taiz |
| ash-shuayb | الشعيب | Ash Shu‘ayb | محافظة تعز | PPL | 80 | 1 | 50.08 | taiz |
| al-munahib | المناحيب | Al Munāḩīb | محافظة تعز | PPL | 80 | 1 | 50.49 | taiz |
| al-kumayta | الكميتى | Al Kumaytá | محافظة تعز | PPL | 80 | 1 | 50.19 | taiz |
| shaqq-al-arja | شق العرجاء | Shaqq al ‘Arjā’ | محافظة تعز | PPL | 80 | 1 | 49.77 | taiz |
| al-hushayfah | الحشيفة | Al Ḩushayfah | محافظة تعز | PPL | 80 | 1 | 51.37 | taiz |
| az-zawah | الزوة | Az Zawah | محافظة تعز | PPL | 80 | 54 | 62.33 | taiz |
| as-sabaribah | الصباربة | Aş Şabāribah | محافظة تعز | PPL | 80 | 30 | 59.19 | taiz |
| al-mataya | المطايا | Al Maţāyā | محافظة تعز | PPL | 80 | 11 | 45.71 | taiz |
| al-hamra | الحمراء | Al Ḩamrā’ | محافظة تعز | PPL | 80 | 60 | 56.13 | taiz |
| hasab-aswad | حصب أسود | Ḩaşab Aswad | محافظة تعز | PPL | 80 | 34 | 55.28 | taiz |
| al-malahiyah | الملاحية | Al Malāḩīyah | محافظة تعز | PPL | 80 | 12 | 55.82 | taiz |
| al-haywah-as-sawda | الحبوة السوداء | Al Ḩaywah as Sawdā’ | محافظة تعز | PPL | 80 | 6 | 54.76 | taiz |
| hajfar | حجفار | Ḩajfār | محافظة تعز | PPL | 80 | 13 | 53.17 | taiz |
| al-qati | القطع | Al Qaţi‘ | محافظة تعز | PPL | 80 | 16 | 52.67 | taiz |
| al-khurayshibah | الخريشيبة | Al Khurayshībah | محافظة تعز | PPL | 80 | 28 | 52.31 | taiz |
| dajinah | داجنة | Dājinah | محافظة تعز | PPL | 80 | 19 | 45.60 | taiz |
| al-ashshah | العشة | Al ‘Ashshah | محافظة تعز | PPL | 80 | 10 | 45.66 | taiz |
| al-qahfah | القحفة | Al Qaḩfah | محافظة تعز | PPL | 80 | 12 | 46.11 | taiz |
| al-jadhmiyah | الجذمية | Al Jadhmīyah | محافظة تعز | PPL | 80 | 8 | 38.04 | taiz |
| an-nawbah-ash-shakriyah | النوبة الشاكرية | An Nawbah ash Shākrīyah | محافظة تعز | PPL | 80 | 18 | 45.09 | taiz |
| al-hajfah | الحجفة | Al Ḩajfah | محافظة تعز | PPL | 80 | 18 | 43.71 | taiz |
| al-hammadi | الحمادي | Al Ḩammādī | محافظة تعز | PPL | 80 | 3 | 47.83 | taiz |
| an-nuzayhah | النزيهة | An Nuzayhah | محافظة تعز | PPL | 80 | 2 | 41.74 | taiz |
| an-namut | النموط | An Namūţ | محافظة تعز | PPL | 80 | 1 | 39.97 | taiz |
| al-harid | الحريد | Al Ḩarīd | محافظة تعز | PPL | 80 | 1 | 39.40 | taiz |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة تعز | PPL | 80 | 1 | 27.20 | taiz |
| al-madafin | المدافن | Al Madāfin | محافظة تعز | PPL | 80 | 1 | 26.70 | taiz |
| ans | عنس | ‘Ans | محافظة تعز | PPL | 80 | 1 | 25.07 | taiz |
| al-kabbah | الكبة | Al Kabbah | محافظة تعز | PPL | 80 | 1 | 25.44 | taiz |
| al-jubanah | الجبانة | Al Jubānah | محافظة تعز | PPL | 80 | 2 | 24.35 | taiz |
| mazulah | معزولة | Ma‘zūlah | محافظة تعز | PPL | 80 | 3 | 25.11 | taiz |
| al-kadkad | الكدكاد | Al Kadkād | محافظة تعز | PPL | 80 | 2 | 24.18 | taiz |
| ad-dar | الدار | Ad Dār | محافظة تعز | PPL | 80 | 2 | 24.32 | taiz |
| al-mayhal | الميهال | Al Mayhāl | محافظة تعز | PPL | 80 | 5 | 24.17 | taiz |
| an-najab | النجب | An Najab | محافظة تعز | PPL | 80 | 3 | 23.91 | taiz |
| quraydah | قريضة | Qurayḑah | محافظة تعز | PPL | 80 | 3 | 24.09 | taiz |
| midqah | مدقة | Midqah | محافظة تعز | PPL | 80 | 2 | 24.37 | taiz |
| al-jannan | الجنان | Al Jannān | محافظة تعز | PPL | 80 | 9 | 25.47 | taiz |
| al-mishrah | المشراح | Al Mishrāḩ | محافظة تعز | PPL | 80 | 1 | 26.40 | taiz |
| at-tawal | الطوال | Aţ Ţawāl | محافظة تعز | PPL | 80 | 1 | 26.77 | taiz |
| al-muayram | المعيرم | Al Mu‘ayram | محافظة تعز | PPL | 80 | 2 | 29.22 | taiz |
| al-kadkad | الكدكد | Al Kadkad | محافظة تعز | PPL | 80 | 1 | 30.13 | taiz |
| al-mamshah | الممشاح | Al Mamshāḩ | محافظة تعز | PPL | 80 | 1 | 28.94 | taiz |
| al-mabqal | المبقال | Al Mabqāl | محافظة تعز | PPL | 80 | 1 | 29.50 | taiz |
| hisn-al-qurayn | حصن القرين | Ḩişn al Qurayn | محافظة تعز | PPL | 80 | 1 | 28.22 | taiz |
| ad-duham | الدحام | Ad Duḩām | محافظة تعز | PPL | 80 | 1 | 27.45 | taiz |
| hujunah | حجونة | Ḩujūnah | محافظة تعز | PPL | 80 | 1 | 27.16 | taiz |
| al-atif | العاطف | Al ‘Āţif | محافظة تعز | PPL | 80 | 2 | 24.74 | taiz |
| ash-shujay | الشجيع | Ash Shujay‘ | محافظة تعز | PPL | 80 | 6 | 24.56 | taiz |
| al-jiraf | الجراف | Al Jirāf | محافظة تعز | PPL | 80 | 2 | 20.06 | taiz |
| tanahah | طناحة | Ţanāḩah | محافظة تعز | PPL | 80 | 2 | 24.14 | taiz |
| al-ahjam | الأهجام | Al Ahjām | محافظة تعز | PPL | 80 | 1 | 23.33 | taiz |
| ad-diyurat | الديورات | Ad Diyūrāt | محافظة تعز | PPL | 80 | 3 | 22.94 | taiz |
| ad-dulayfah | الدليفة | Ad Dulayfah | محافظة تعز | PPL | 80 | 7 | 24.28 | taiz |
| al-watif | الوطيف | Al Waţīf | محافظة تعز | PPL | 80 | 2 | 24.58 | taiz |
| ash-shajibah | الشاجبة | Ash Shājibah | محافظة تعز | PPL | 80 | 6 | 25.53 | taiz |
| ribahah | رباحة | Ribāḩah | محافظة تعز | PPL | 80 | 2 | 23.86 | taiz |
| al-murayfah | الموريفة | Al Mūrayfah | محافظة تعز | PPL | 80 | 1 | 23.83 | taiz |
| ash-shajibah | الشاجبة | Ash Shājibah | محافظة تعز | PPL | 80 | 5 | 24.56 | taiz |
| qurus | قروص | Qurūş | محافظة تعز | PPL | 80 | 1 | 25.20 | taiz |
| al-jahzuz | الجحزوز | Al Jaḩzūz | محافظة تعز | PPL | 80 | 1 | 26.14 | taiz |
| muqaybirah | مقيبرة | Muqaybirah | محافظة تعز | PPL | 80 | 3 | 24.88 | taiz |
| as-sawahir | الصواهر | Aş Şawāhir | محافظة تعز | PPL | 80 | 4 | 24.79 | taiz |
| al-mabrak | المبرك | Al Mabrak | محافظة تعز | PPL | 80 | 2 | 23.95 | taiz |
| arar | عرار | ‘Arār | محافظة تعز | PPL | 80 | 2 | 20.25 | taiz |
| al-mizbar | المزبار | Al Mizbār | محافظة تعز | PPL | 80 | 2 | 20.95 | taiz |
| al-jund | الجند | Al Jund | محافظة تعز | PPL | 80 | 1 | 19.99 | taiz |
| az-zulul | الزلول | Az Zulūl | محافظة تعز | PPL | 80 | 2 | 35.43 | taiz |
| al-mahyub | المهيوب | Al Mahyūb | محافظة تعز | PPL | 80 | 3 | 33.09 | taiz |
| al-mudayhiyah | المضيحية | Al Muḑayḩīyah | محافظة تعز | PPL | 80 | 2 | 27.00 | taiz |
| al-qadat | القضاة | Al Qaḑāt | محافظة تعز | PPL | 80 | 7 | 28.00 | taiz |
| al-jadidah | الجديدة | Al Jadīdah | محافظة تعز | PPL | 80 | 2 | 27.26 | taiz |
| al-hasab | الحصب | Al Ḩaşab | محافظة تعز | PPL | 80 | 1 | 28.41 | taiz |
| al-kharab | الخرب | Al Kharab | محافظة تعز | PPL | 80 | 3 | 26.63 | taiz |
| hajm-al-ajl | هجم العجل | Hajm al ‘Ajl | محافظة تعز | PPL | 80 | 1 | 26.73 | taiz |
| al-mashrafah | المشرفة | Al Mashrafah | محافظة تعز | PPL | 80 | 1 | 27.56 | taiz |
| hasib-yasin | حصيب ياسين | Ḩaşīb Yāsīn | محافظة تعز | PPL | 80 | 1 | 27.92 | taiz |
| qurf-al-hadiyah | قرف الهادية | Qurf al Hādīyah | محافظة تعز | PPL | 80 | 1 | 28.11 | taiz |
| al-munawab | المناوب | Al Munāwab | محافظة تعز | PPL | 80 | 3 | 28.76 | taiz |
| al-muhaysib | المحيصب | Al Muḩayşib | محافظة تعز | PPL | 80 | 3 | 28.67 | taiz |
| at-tubay | التبيع | At Tubay‘ | محافظة تعز | PPL | 80 | 3 | 29.05 | taiz |
| hasab-at-tayr | حصب الطير | Ḩaşab aţ Ţayr | محافظة تعز | PPL | 80 | 1 | 28.61 | taiz |
| asiq | عسق | ‘Asiq | محافظة تعز | PPL | 80 | 4 | 26.11 | taiz |
| al-maslum | المسلوم | Al Maslūm | محافظة تعز | PPL | 80 | 4 | 26.74 | taiz |
| alkimah | ألكمة | Alkimah | محافظة تعز | PPL | 80 | 2 | 25.97 | taiz |
| al-manzilah | المنزلة | Al Manzilah | محافظة تعز | PPL | 80 | 3 | 25.66 | taiz |
| al-mashaab | المشاعب | Al Mashā‘ab | محافظة تعز | PPL | 80 | 2 | 26.01 | taiz |
| al-jadidah | الجديدة | Al Jadīdah | محافظة تعز | PPL | 80 | 3 | 26.33 | taiz |
| hayjat-juhlan | هيجة جهلان | Hayjat Juhlān | محافظة تعز | PPL | 80 | 3 | 28.88 | taiz |
| al-bitah | البطاح | Al Biţāḩ | محافظة تعز | PPL | 80 | 1 | 28.63 | taiz |
| al-marawin | المراون | Al Marāwin | محافظة تعز | PPL | 80 | 3 | 25.98 | taiz |
| al-maswadah | المسوادة | Al Maswādah | محافظة تعز | PPL | 80 | 2 | 26.43 | taiz |
| ar-raqah | الرقعة | Ar Raq‘ah | محافظة تعز | PPL | 80 | 3 | 28.37 | taiz |
| al-majza | المجزع | Al Majza‘ | محافظة تعز | PPL | 80 | 1 | 26.53 | taiz |
| as-sifa | الصفاء | Aş Şifā’ | محافظة تعز | PPL | 80 | 3 | 27.68 | taiz |
| hasib-tulayl | حصيب طليل | Ḩaşīb Ţulayl | محافظة تعز | PPL | 80 | 5 | 27.95 | taiz |
| at-tawilah | الطويلة | Aţ Ţawīlah | محافظة تعز | PPL | 80 | 5 | 27.63 | taiz |
| al-haljum | الحلجوم | Al Ḩaljūm | محافظة تعز | PPL | 80 | 2 | 27.46 | taiz |
| al-mabyadah | المبياضة | Al Mabyāḑah | محافظة تعز | PPL | 80 | 1 | 28.14 | taiz |
| al-shuqayrah | الشقيرة | Al Shuqayrah | محافظة تعز | PPL | 80 | 3 | 28.25 | taiz |
| ash-shawsirah | الشوصرة | Ash Shawşirah | محافظة تعز | PPL | 80 | 2 | 28.52 | taiz |
| aqabah | عقبة | ‘Aqabah | محافظة تعز | PPL | 80 | 2 | 28.47 | taiz |
| al-mudafin | المدافن | Al Mudāfin | محافظة تعز | PPL | 80 | 2 | 27.87 | taiz |
| al-munaqid | المناقد | Al Munāqid | محافظة تعز | PPL | 80 | 6 | 29.28 | taiz |
| al-marazim | المرازم | Al Marāzim | محافظة تعز | PPL | 80 | 4 | 29.18 | taiz |
| al-abrahah | الأبرحة | Al Abraḩah | محافظة تعز | PPL | 80 | 3 | 29.16 | taiz |
| al-majza | المجزع | Al Majza‘ | محافظة تعز | PPL | 80 | 8 | 29.41 | taiz |
| al-mazabah | المعزبة | Al Ma‘zabah | محافظة تعز | PPL | 80 | 1 | 30.17 | taiz |
| ash-sharaf | الشرف | Ash Sharaf | محافظة تعز | PPL | 80 | 4 | 24.99 | taiz |
| hawb-ar-ribat | هوب الرباط | Hawb ar Ribāţ | محافظة تعز | PPL | 80 | 3 | 25.08 | taiz |
| al-bayhani | البيحاني | Al Bayḩānī | محافظة تعز | PPL | 80 | 1 | 24.83 | taiz |
| al-akamah | الأكمة | Al Akamah | محافظة تعز | PPL | 80 | 1 | 29.22 | taiz |
| ash-sharaf | الشرف | Ash Sharaf | محافظة تعز | PPL | 80 | 1 | 29.43 | taiz |
| ad-dar | الدار | Ad Dār | محافظة تعز | PPL | 80 | 4 | 29.36 | taiz |
| ad-dar | الدار | Ad Dār | محافظة تعز | PPL | 80 | 1 | 28.15 | taiz |
| al-bayt-al-asfal | البيت الأسفل | Al Bayt al Asfal | محافظة تعز | PPL | 80 | 6 | 28.14 | taiz |
| al-akm | العكم | Al ‘Akm | محافظة تعز | PPL | 80 | 5 | 24.99 | taiz |
| al-karathah | الكراثة | Al Karāthah | محافظة تعز | PPL | 80 | 1 | 25.06 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 1 | 25.19 | taiz |
| az-zahirah | الظهرة | Az̧ Z̧ahirah | محافظة تعز | PPL | 80 | 2 | 25.34 | taiz |
| al-qarf-al-asfal | القرف الأسفل | Al Qarf al Asfal | محافظة تعز | PPL | 80 | 1 | 30.15 | taiz |
| al-bayyadiyah | البياضية | Al Bayyāḑīyah | محافظة تعز | PPL | 80 | 1 | 30.04 | taiz |
| al-majza | المجزع | Al Majza‘ | محافظة تعز | PPL | 80 | 2 | 30.19 | taiz |
| al-hujayh | الحجيج | Al Ḩujayḩ | محافظة تعز | PPL | 80 | 8 | 30.81 | taiz |
| al-qasabah | القصبة | Al Qaşabah | محافظة تعز | PPL | 80 | 6 | 30.84 | taiz |
| al-wasitan | الوسيطان | Al Wasīţān | محافظة تعز | PPL | 80 | 7 | 31.05 | taiz |
| al-kahib | الكاحب | Al Kāḩib | محافظة تعز | PPL | 80 | 1 | 30.71 | taiz |
| as-siyal | السيال | As Siyāl | محافظة تعز | PPL | 80 | 2 | 31.54 | taiz |
| al-maqad | المقض | Al Maqaḑ | محافظة تعز | PPL | 80 | 3 | 31.86 | taiz |
| ad-dubayrah | الضبيرة | Aḑ Ḑubayrah | محافظة تعز | PPL | 80 | 10 | 32.39 | taiz |
| al-malatah | الملطة | Al Malaţah | محافظة تعز | PPL | 80 | 4 | 32.68 | taiz |
| al-hashamah | الهشمة | Al Hashamah | محافظة تعز | PPL | 80 | 4 | 33.22 | taiz |
| dalaj | دعلج | Da‘laj | محافظة تعز | PPL | 80 | 2 | 30.01 | taiz |
| zubayd | زبيد | Zubayd | محافظة تعز | PPL | 80 | 4 | 30.55 | taiz |
| adh-dhurba | الذريع | Adh Dhurba‘ | محافظة تعز | PPL | 80 | 5 | 30.77 | taiz |
| hasab-ash-sharabah | حصب الشرابة | Ḩaşab ash Sharābah | محافظة تعز | PPL | 80 | 7 | 30.67 | taiz |
| barh-al-adnah | برح العدنة | Barḩ al ‘Adnah | محافظة تعز | PPL | 80 | 1 | 31.58 | taiz |
| hulaysah | حليصة | Ḩulayşah | محافظة تعز | PPL | 80 | 3 | 31.59 | taiz |
| ad-damahiyah | الدماهية | Ad Damāhīyah | محافظة تعز | PPL | 80 | 2 | 31.42 | taiz |
| quray | قريع | Quray‘ | محافظة تعز | PPL | 80 | 1 | 31.89 | taiz |
| al-mahmar | المحمر | Al Maḩmar | محافظة تعز | PPL | 80 | 3 | 31.01 | taiz |
| al-kidf | الكدف | Al Kidf | محافظة تعز | PPL | 80 | 1 | 30.50 | taiz |
| hayjat-hasab-dhira | هيجة حصب ذراع | Hayjat Ḩaşab Dhirā‘ | محافظة تعز | PPL | 80 | 1 | 30.54 | taiz |
| bayt-ash-sharif | بيت الشريف | Bayt ash Sharīf | محافظة تعز | PPL | 80 | 2 | 29.64 | taiz |
| al-khimariyah | الخمارية | Al Khimārīyah | محافظة تعز | PPL | 80 | 3 | 29.10 | taiz |
| akamat-ar-ramad | أكمة الرماد | Akamat ar Ramād | محافظة تعز | PPL | 80 | 1 | 28.91 | taiz |
| az-zaht | الزحط | Az Zaḩţ | محافظة تعز | PPL | 80 | 1 | 29.15 | taiz |
| jarabah | جرابة | Jarābah | محافظة تعز | PPL | 80 | 1 | 28.56 | taiz |
| al-hajariyah | الحجرية | Al Ḩajarīyah | محافظة تعز | PPL | 80 | 3 | 29.23 | taiz |
| hasab-as-siyari | حصب السياري | Ḩaşab as Siyārī | محافظة تعز | PPL | 80 | 3 | 28.68 | taiz |
| lakimah | لاكمة | Lākimah | محافظة تعز | PPL | 80 | 3 | 28.68 | taiz |
| al-hadashiyah | الهداشية | Al Hadāshīyah | محافظة تعز | PPL | 80 | 3 | 28.20 | taiz |
| al-jarizayn | الجرزين | Al Jarizayn | محافظة تعز | PPL | 80 | 3 | 27.49 | taiz |
| al-barbaq | البربق | Al Barbaq | محافظة تعز | PPL | 80 | 5 | 27.73 | taiz |
| ar-rawas | الرواس | Ar Rawās | محافظة تعز | PPL | 80 | 1 | 28.98 | taiz |
| qashubah | قشوبة | Qashūbah | محافظة تعز | PPL | 80 | 1 | 29.01 | taiz |
| dinmat-ash-sharaf | دمنة الشرف | Dinmat ash Sharaf | محافظة تعز | PPL | 80 | 2 | 27.41 | taiz |
| an-najd-al-ala | النجد الأعلى | An Najd al A‘lá | محافظة تعز | PPL | 80 | 7 | 26.77 | taiz |
| al-marqab | المرقاب | Al Marqāb | محافظة تعز | PPL | 80 | 2 | 26.38 | taiz |
| an-najd-al-asfal | النجد الأسفل | An Najd al Asfal | محافظة تعز | PPL | 80 | 6 | 27.23 | taiz |
| hayjat-haqar | هيجة حقر | Hayjat Ḩaqar | محافظة تعز | PPL | 80 | 1 | 27.65 | taiz |
| dar-jayhlan | دار جيهلان | Dār Jayhlān | محافظة تعز | PPL | 80 | 5 | 27.31 | taiz |
| al-mawdiqah | المودقة | Al Mawdiqah | محافظة تعز | PPL | 80 | 4 | 27.07 | taiz |
| al-ajraf | الأجراف | Al Ajrāf | محافظة تعز | PPL | 80 | 2 | 29.45 | taiz |
| al-mabra | المبراع | Al Mabrā‘ | محافظة تعز | PPL | 80 | 2 | 29.72 | taiz |
| ad-dahirah | الداهرة | Ad Dāhirah | محافظة تعز | PPL | 80 | 3 | 29.97 | taiz |
| al-hudayn | الحضين | Al Ḩuḑayn | محافظة تعز | PPL | 80 | 1 | 29.70 | taiz |
| al-fahim | الفاحم | Al Fāḩim | محافظة تعز | PPL | 80 | 3 | 28.50 | taiz |
| al-qushaybah | القشيبة | Al Qushaybah | محافظة تعز | PPL | 80 | 1 | 29.34 | taiz |
| al-qubbah | القبة | Al Qubbah | محافظة تعز | PPL | 80 | 3 | 27.09 | taiz |
| daribat-al-hasib | ضاربة الحصب | Ḑāribat al Ḩaşib | محافظة تعز | PPL | 80 | 4 | 25.66 | taiz |
| arakibah | عراكبة | ‘Arākibah | محافظة تعز | PPL | 80 | 2 | 25.25 | taiz |
| al-baqrayn | البقرين | Al Baqrayn | محافظة تعز | PPL | 80 | 1 | 26.70 | taiz |
| al-jurayah | الجريعة | Al Juray‘ah | محافظة تعز | PPL | 80 | 8 | 26.42 | taiz |
| ash-shuqqah | الشقة | Ash Shuqqah | محافظة تعز | PPL | 80 | 3 | 25.84 | taiz |
| ash-sharaf | الشرف | Ash Sharaf | محافظة تعز | PPL | 80 | 3 | 25.87 | taiz |
| al-qafirah | القفيرة | Al Qafīrah | محافظة تعز | PPL | 80 | 1 | 25.76 | taiz |
| al-akamah | الأكمة | Al Akamah | محافظة تعز | PPL | 80 | 1 | 25.64 | taiz |
| al-kamm | الكام | Al Kāmm | محافظة تعز | PPL | 80 | 2 | 25.33 | taiz |
| al-miqdahah | المقداحة | Al Miqdāḩah | محافظة تعز | PPL | 80 | 3 | 25.82 | taiz |
| khudhfan | خذفان | Khudhfān | محافظة تعز | PPL | 80 | 1 | 24.46 | taiz |
| an-najd | النجد | An Najd | محافظة تعز | PPL | 80 | 2 | 25.47 | taiz |
| al-fanah | الفناح | Al Fanāḩ | محافظة تعز | PPL | 80 | 3 | 26.00 | taiz |
| al-jaradiyah | الجرادية | Al Jarādīyah | محافظة تعز | PPL | 80 | 2 | 26.21 | taiz |
| al-burhah | البورحة | Al Būrḩah | محافظة تعز | PPL | 80 | 6 | 26.39 | taiz |
| al-quhaf | القحاف | Al Quḩāf | محافظة تعز | PPL | 80 | 1 | 27.05 | taiz |
| al-marid | المعرض | Al Ma‘riḑ | محافظة تعز | PPL | 80 | 3 | 26.72 | taiz |
| mushrifah | مشرفة | Mushrifah | محافظة تعز | PPL | 80 | 2 | 26.57 | taiz |
| al-qaidah | القاعدة | Al Qā‘idah | محافظة تعز | PPL | 80 | 5 | 26.70 | taiz |
| al-marhub | المرهوض | Al Marhūb | محافظة تعز | PPL | 80 | 6 | 27.41 | taiz |
| hujaynah | حجينة | Ḩujaynah | محافظة تعز | PPL | 80 | 10 | 28.48 | taiz |
| ar-rijah | الرجاح | Ar Rijāḩ | محافظة تعز | PPL | 80 | 3 | 27.97 | taiz |
| hayjat-nasir | هيجة ناصر | Hayjat Nāşir | محافظة تعز | PPL | 80 | 10 | 28.32 | taiz |
| al-mabayad | المبايض | Al Mabāyaḑ | محافظة تعز | PPL | 80 | 3 | 28.09 | taiz |
| al-mirzam | المرزام | Al Mirzām | محافظة تعز | PPL | 80 | 4 | 28.46 | taiz |
| al-madqu | المدقوع | Al Madqū‘ | محافظة تعز | PPL | 80 | 1 | 27.83 | taiz |
| as-surayh | الصريح | Aş Şurayḩ | محافظة تعز | PPL | 80 | 1 | 27.89 | taiz |
| al-kharaf | الخراف | Al Kharāf | محافظة تعز | PPL | 80 | 4 | 27.24 | taiz |
| an-nawbah | النوبة | An Nawbah | محافظة تعز | PPL | 80 | 3 | 28.98 | taiz |
| adh-dhurayi | الذريعي | Adh Dhuray‘ī | محافظة تعز | PPL | 80 | 1 | 28.90 | taiz |
| al-mushajib | المشاجب | Al Mushājib | محافظة تعز | PPL | 80 | 1 | 27.89 | taiz |
| hawl-as-suq | هول السوق | Hawl as Sūq | محافظة تعز | PPL | 80 | 1 | 25.82 | taiz |
| al-farisah | الفرسة | Al Farisah | محافظة تعز | PPL | 80 | 1 | 25.53 | taiz |
| ad-dams | الدمس | Ad Dams | محافظة تعز | PPL | 80 | 1 | 26.66 | taiz |
| hassan-ahmad | حسان أحمد | Ḩassān Aḩmad | محافظة تعز | PPL | 80 | 1 | 27.18 | taiz |
| nawbat-bin-jafar | نوبة بن جعفر | Nawbat Bin Ja‘far | محافظة لحج | PPL | 80 | 8 | 104.02 | ibb |
| ras-bajrah | رأس بجرة | Ra’s Bajrah | محافظة لحج | PPL | 80 | 9 | 103.29 | ibb |
| al-qaydirah | القيدرة | Al Qaydirah | محافظة لحج | PPL | 80 | 2 | 105.27 | ibb |
| bayt-ash-shuaybi | بيت الشعيبي | Bayt ash Shu‘aybī | محافظة لحج | PPL | 80 | 21 | 108.91 | ibb |
| ad-dahadih | الضحاضيح | Ad Dahadih | محافظة لحج | PPL | 80 | 2 | 105.76 | ibb |
| dar-al-humayra | دار الحميراء | Dār al Ḩumayrā’ | محافظة لحج | PPL | 80 | 10 | 106.75 | ibb |
| rahwat-shuqrah | رهوة شقرة | Rahwat Shuqrah | محافظة لحج | PPL | 80 | 5 | 106.73 | ibb |
| al-maqsirah | المقصرة | Al Maqşirah | محافظة لحج | PPL | 80 | 1 | 102.48 | ibb |
| al-hayd-al-ahmar | الحيد الأحمر | Al Ḩayd al Aḩmar | محافظة لحج | PPL | 80 | 5 | 102.21 | ibb |
| nawbat-ad-dukam | نوبة الدكام | Nawbat ad Dukām | محافظة لحج | PPL | 80 | 6 | 103.15 | aden |
| al-markabah | المركبة | Al Markabah | محافظة لحج | PPL | 80 | 6 | 106.14 | ibb |
| bayt-al-humaysi | بيت الهميسي | Bayt al Humaysī | محافظة لحج | PPL | 80 | 3 | 106.83 | ibb |
| rahwat-hamr | رهوة حمر | Rahwat Ḩamr | محافظة لحج | PPL | 80 | 1 | 104.89 | ibb |
| rakab-al-hamid | ركب الحميد | Rakab al Ḩamīd | محافظة لحج | PPL | 80 | 2 | 104.99 | ibb |
| al-maghrabat | المغربات | Al Maghrabāt | محافظة لحج | PPL | 80 | 3 | 104.85 | ibb |
| al-jalbub | الجلبوب | Al Jalbūb | محافظة لحج | PPL | 80 | 6 | 104.71 | ibb |
| bayt-bin-alaw | بيت بن علاو | Bayt Bin ‘Alāw | محافظة لحج | PPL | 80 | 19 | 105.32 | ibb |
| al-mizub | المعزوب | Al Mi‘zūb | محافظة لحج | PPL | 80 | 5 | 104.50 | ibb |
| al-majur | الماجور | Al Mājūr | محافظة لحج | PPL | 80 | 2 | 107.01 | ibb |
| dhira-al-mashrah | ذراع المشراح | Dhirā‘ al Mashrāḩ | محافظة لحج | PPL | 80 | 2 | 105.31 | ibb |
| al-arin | العرين | Al ‘Arīn | محافظة لحج | PPL | 80 | 24 | 108.30 | ibb |
| al-far | الفرع | Al Far‘ | محافظة لحج | PPL | 80 | 1 | 108.46 | ibb |
| adh-dhanabah | الذنبة | Adh Dhanabah | محافظة لحج | PPL | 80 | 22 | 109.05 | ibb |
| as-suwaydi | السويدي | As Suwaydī | محافظة تعز | PPL | 80 | 29 | 113.05 | taiz |
| ashshat-muhsin | عشة محسن | ‘Ashshat Muḩsin | محافظة حجة | PPL | 80 | 4 | 72.63 | saada |
| al-maalliq | المعلق | Al Ma‘alliq | محافظة حجة | PPL | 80 | 5 | 73.24 | saada |
| washhah | وشحة | Washḩah | محافظة حجة | PPL | 80 | 4 | 73.11 | saada |
| bayt-yahya-husayn-al-abdali | بيت يحي حسين العبدلي | Bayt Yaḩya Ḩusayn al ‘Abdalī | محافظة حجة | PPL | 80 | 3 | 70.46 | saada |
| bayt-as-sihabah | بيت السحابة | Bayt as Siḩābah | محافظة حجة | PPL | 80 | 7 | 70.15 | saada |
| bayt-ahmad-mahdi | بيت أحمد مهدي | Bayt Aḩmad Mahdī | محافظة حجة | PPL | 80 | 9 | 69.76 | saada |
| dahir-maddah | داحر مضة | Dāḩir Maḑḑah | محافظة حجة | PPL | 80 | 3 | 69.81 | saada |
| al-murmidah | المرميدة | Al Murmīdah | محافظة حجة | PPL | 80 | 3 | 69.50 | saada |
| ashshat-al-birin | عشة البيرن | ‘Ashshat al Bīrin | محافظة حجة | PPL | 80 | 7 | 69.01 | saada |
| al-muharrib | المحارب | Al Muḩārrib | محافظة حجة | PPL | 80 | 8 | 68.82 | saada |
| al-mafliyah-al-hamra | المفلية الحمراء | Al Maflīyah al Ḩamrā’ | محافظة حجة | PPL | 80 | 10 | 66.93 | saada |
| al-qaim-samin | القائم سمين | Al Qā’im Samīn | محافظة حجة | PPL | 80 | 18 | 73.00 | saada |
| al-hijar | الحجار | Al Ḩijār | محافظة حجة | PPL | 80 | 3 | 76.39 | saada |
| bani-siyal | بني سيال | Banī Siyāl | محافظة حجة | PPL | 80 | 4 | 74.72 | saada |
| al-khalafiyah-amir | الخلفية أمير | Al Khalafīyah Amīr | محافظة حجة | PPL | 80 | 3 | 77.87 | saada |
| jufad | جفد | Jufad | محافظة حجة | PPL | 80 | 4 | 73.08 | saada |
| abu-nabah | أبو نبعة | Abū Nab‘ah | محافظة حجة | PPL | 80 | 3 | 71.97 | saada |
| al-waqsh | الوقش | Al Waqsh | محافظة حجة | PPL | 80 | 4 | 67.18 | saada |
| al-madwas | المدوس | Al Madwas | محافظة حجة | PPL | 80 | 10 | 67.97 | saada |
| al-makhdur | المخدور | Al Makhdūr | محافظة حجة | PPL | 80 | 6 | 70.28 | saada |
| umm-al-qawz | أم القوز | Umm al Qawz | محافظة حجة | PPL | 80 | 7 | 77.72 | saada |
| mazhat-shuar | مزحط شعار | Mazḩaţ Shu‘ār | محافظة صعدة | PPL | 80 | 4 | 64.04 | saada |
| qaim-bashir | قائم بشير | Qā’im Bashīr | محافظة صعدة | PPL | 80 | 3 | 63.23 | saada |
| dubayrat-al-qa | ضبيرة القاع | Ḑubayrat al Qā‘ | محافظة صعدة | PPL | 80 | 8 | 62.70 | saada |
| ad-danab | الدنب | Ad Danab | محافظة صعدة | PPL | 80 | 10 | 62.07 | saada |
| al-jarahiyah | الجراحية | Al Jarāḩīyah | محافظة صعدة | PPL | 80 | 7 | 62.38 | saada |
| qaim-turani | قائم تراني | Qā’im Turānī | محافظة صعدة | PPL | 80 | 9 | 61.95 | saada |
| mashbah-ar-ranif | مشباح الرنف | Mashbāḩ ar Ranif | محافظة صعدة | PPL | 80 | 4 | 62.81 | saada |
| janabirat-al-marwa | جنبيرة المروى | Janabīrat al Marwá | محافظة صعدة | PPL | 80 | 5 | 62.45 | saada |
| umm-al-haluj | أم الهلوج | Umm al Halūj | محافظة صعدة | PPL | 80 | 4 | 61.78 | saada |
| zabtah | زيطة | Zabţah | محافظة صعدة | PPL | 80 | 7 | 60.78 | saada |
| qaim-at-tibaz | قائم الطباز | Qā’im aţ Ţibāz | محافظة صعدة | PPL | 80 | 6 | 60.43 | saada |
| salam | سلام | Salām | محافظة صعدة | PPL | 80 | 4 | 60.34 | saada |
| al-arqayn | العرقين | Al ‘Arqayn | محافظة صعدة | PPL | 80 | 3 | 61.08 | saada |
| al-qasib | القاصب | Al Qāşib | محافظة تعز | PPL | 80 | 1 | 52.78 | taiz |
| al-qusayah | القصيعة | Al Quşay‘ah | محافظة تعز | PPL | 80 | 1 | 45.60 | taiz |
| al-hadiyah | الحدية | Al Ḩadīyah | محافظة تعز | PPL | 80 | 1 | 50.18 | taiz |
| umm-at-turab-al-ulya | أم التراب العليا | Umm at Turāb al ‘Ulyā | محافظة حجة | PPL | 80 | 7 | 73.92 | saada |
| umm-at-turab-as-sufla | أم التراب السفلى | Umm at Turāb as Suflá | محافظة حجة | PPL | 80 | 10 | 76.17 | saada |
| matarah | مطرة | Maţarah | محافظة شبوة | PPLA2 | 80 | - | 193.88 | mukalla |
| habil-ar-raydah | حبيل الريدة | Ḩabīl ar Raydah | محافظة لحج | PPLA2 | 80 | - | 80.51 | ibb |
| al-ulayb | العليب | Al ‘Ulayb | محافظة حضرموت | PPLA2 | 80 | - | 67.50 | mukalla |
| at-talh | الطلح | Aţ Ţalḩ | محافظة شبوة | PPLA2 | 80 | - | 197.58 | mukalla |
| sirar | سرار | Sirār | محافظة أبين | PPLA2 | 80 | - | 100.00 | aden |
| khayran | خيران | Khayrān | محافظة حجة | PPLA2 | 80 | - | 110.05 | saada |
| jayshan | جيشان | Jayshān | محافظة أبين | PPLA2 | 80 | - | 163.56 | marib |
| as-salw | الصلو | Aş Şalw | محافظة تعز | PPLA2 | 80 | - | 35.02 | taiz |
| rasad | رصد | Raşad | محافظة أبين | PPLA2 | 80 | - | 107.54 | aden |
| majz | مجز | Majz | محافظة صعدة | PPLA2 | 80 | - | 24.65 | saada |
| al-khasha-lower | الخشعة السفلى | AL-khashā Lower | محافظة شبوة | PPL | 80 | 800 | 196.09 | marib |
| al-khasha-upper | الخشعة العليا | AL-khashā upper | محافظة شبوة | PPL | 80 | 1100 | 195.11 | marib |
| the-khair-alfrwi | ذي خير الفروي | The Khair ALfrwi | محافظة البيضاء | PPL | 80 | 160 | 147.07 | dhamar |

## Medium-confidence pending (top 25 by qScore, full set in JSON)

Same gates as high, but qScore 70-79. Review AFTER high.

| slug | name.ar | name.en | region | fc | qScore | distNearestKm |
| --- | --- | --- | --- | --- | --- | --- |
| zukaykah | زكيكة | Zukaykah | محافظة حضرموت | PPL | 70 | 166.43 |
| zughaynah | زغينه | Zughaynah | محافظة أبين | PPL | 70 | 163.42 |
| yuwan | يون | Yuwan | محافظة حضرموت | PPL | 70 | 71.09 |
| yakhtul | يختل | Yakhtul | محافظة تعز | PPL | 70 | 82.51 |
| uwayrah | عويرة | `Uwayrah | محافظة صنعاء | PPL | 70 | 22.38 |
| tubr | تبر | Tubr | محافظة عمران | PPL | 70 | 66.72 |
| thirah | ثرة | Thirah | محافظة أبين | PPL | 70 | 148.31 |
| tawlabah | تولبة | Tawlabah | محافظة حضرموت | PPL | 70 | 106.50 |
| shaybirah | شيبرة | Shaybirah | محافظة عمران | PPL | 70 | 57.81 |
| shuqrah | شقرة | Shuqrah | محافظة أبين | PPL | 70 | 97.13 |
| seiyun | سيئون | Seiyun | محافظة حضرموت | PPL | 70 | 159.77 |
| namir | نامر | Namir | محافظة البيضاء | PPL | 70 | 164.01 |
| melaba | ملبة | Melaba | محافظة صنعاء | PPL | 70 | 47.57 |
| masaarde | مسعردة | Masaarde | محافظة صنعاء | PPL | 70 | 22.41 |
| hajar-as-say-ar | الحجر | Ḩajar aş Şay‘ar | محافظة حضرموت | PPL | 70 | 225.76 |
| makram | مكرم | Makram | محافظة الحديدة | PPL | 70 | 77.62 |
| mahaqra | مهقرة | Mahaqra | أمانة العاصمة | PPL | 70 | 10.97 |
| madhbal | مدھبال | Madhbal | محافظة صنعاء | PPL | 70 | 15.16 |
| luqnah | لقنة | Luqnah | محافظة حضرموت | PPL | 70 | 69.51 |
| lahrum | لاہروم | Lahrum | محافظة حضرموت | PPL | 70 | 159.27 |
| hajana | هجنة | Hajana | محافظة صنعاء | PPL | 70 | 29.76 |
| haddah | حدة | Ḩaddah | محافظة صنعاء | PPL | 70 | 8.99 |
| fughmah | فجمه | Fughmah | محافظة حضرموت | PPL | 70 | 181.55 |
| fatihat | فاتحة | Fatihat | محافظة صنعاء | PPL | 70 | 37.64 |
| dhi-wayn | ال مطبق | Dhī Wayn | محافظة البيضاء | PPL | 70 | 145.48 |

## Low-confidence pending

Failed at least one strict gate (unknown region OR not PPL/PPLA*
OR qScore <70 OR within 3km of existing entry).
Recommended: DO NOT review this tier in the first pass.

Count: **52919**

## needs_review examples (no Arabic OR non-place keyword)

| slug | name.ar | name.en | region | fc | reason |
| --- | --- | --- | --- | --- | --- |
| khaysayah | Khaysāyah | Khaysāyah | محافظة المهرة | PPL | missing_real_ar_name |
| qaw | Qāw | Qāw | محافظة المهرة | PPL | missing_real_ar_name |
| mar-isah | Mar‘īsah | Mar‘īsah | محافظة المهرة | PPL | missing_real_ar_name |
| kudaywah | Kudaywah | Kudaywah | محافظة المهرة | PPL | missing_real_ar_name |
| dhaf-an | Dhaf‘an | Dhaf‘an | محافظة حضرموت | PPL | missing_real_ar_name |
| ar-ridah-ash-sharqiyah | Ar Rīdah ash Sharqīyah | Ar Rīdah ash Sharqīyah | محافظة حضرموت | PPL | missing_real_ar_name |
| tamnan | Tamnan | Tamnan | محافظة المهرة | PPL | missing_real_ar_name |
| qiln | Qiln | Qiln | محافظة المهرة | PPL | missing_real_ar_name |
| majwah | Majwah | Majwah | محافظة المهرة | PPL | missing_real_ar_name |
| markha | Markhā | Markhā | محافظة المهرة | PPL | missing_real_ar_name |

## rejected examples

| slug | name.ar | name.en | reason | keyword |
| --- | --- | --- | --- | --- |
| masjid-an-nur | Masjid an Nūr | Masjid an Nūr | religious_site_not_city | \bmasjid\b |
| al-musalla | المصلى | Al Muşallá | religious_site_not_city | مصلى |
| masjid-al-urr | Masjid al ‘Urr | Masjid al ‘Urr | religious_site_not_city | \bmasjid\b |
| al-masjid | المسجد | Al Masjid | religious_site_not_city | مسجد |
| al-jami | الجامع | Al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| al-musalla | المصلى | Al Muşallá | religious_site_not_city | مصلى |
| dar-al-jami | دار الجامع | Dār al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| al-jami | الجامع | Al Jāmi‘ | religious_site_not_city | جامع(?!ة) |
| al-masjid | المسجد | Al Masjid | religious_site_not_city | مسجد |
| al-masjidayn | المسجدين | Al Masjidayn | religious_site_not_city | مسجد |

## existing examples (already in curated)

| candidate.slug | matched existing.slug | reason |
| --- | --- | --- |
| taiz | taiz | slug |
| sanaa | sanaa | slug |
| sadah | saada | coords<1km (d=0.05km) |
| raqban | saada | coords<1km (d=0.84km) |
| marib | marib | slug |
| manawirah | mukalla | coords<1km (d=0.49km) |
| ibb | ibb | slug |
| dhamar | dhamar | slug |
| mukalla | mukalla | slug |
| al-hudaydah | hodeidah | coords<1km (d=0.00km) |

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
