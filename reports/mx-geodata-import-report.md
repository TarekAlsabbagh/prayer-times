# MX GeoNames Import Report — Americas-1A

**Country**: Mexico (المكسيك)
**Wave**: `CURATED-GEODATA-AMERICAS-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T11:42:22.337Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/mx-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/mx-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/mx-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `americas-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 254114 |
| existing (matched, no action)     | 64 |
| **pending — high tier**           | **81** |
| pending — medium tier             | 1 |
| pending — low tier                | 39 |
| needs_review                      | 253929 |
| rejected                          | 0 |
| collisions in this wave           | 35194 |
| collisions against existing curated | 1704 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 31 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 50 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 24
**Blocked by ar-gate (high-tier):** 57

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | tijuana | تيخوانا | Tijuana | Tijuana | mx | PPLA2 | 1922523 | باها كاليفورنيا | 32.5027 | -117.0037 | 1786.92 | monterrey | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | puebla | بويبلا | Puebla | Puebla | mx | PPLA | 1692181 | بويبلا | 19.0478 | -98.2072 | 106.21 | mexico-city | arabic_only |  | 95 | always_include:PPLA |
| ✅ | santiago-de-queretaro | سانتياغو دي كويريتارو | Santiago de Querétaro | Santiago de Querétaro | mx | PPLA | 1594212 | كيريتارو | 20.5881 | -100.3881 | 183.57 | mexico-city | arabic_only |  | 95 | always_include:PPLA |
| ✅ | ciudad-juarez | سيوداد خواريز | Ciudad Juárez | Ciudad Juárez | mx | PPLA2 | 1512450 | تشيواوا | 31.7202 | -106.4608 | 899.21 | monterrey | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | cancun | كانكون | Cancún | Cancún | mx | PPL | 888797 | كينتانا رو | 21.1743 | -86.8466 | 1295.52 | mexico-city | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | naucalpan-de-juarez | ناوكالبان دي خواريز | Naucalpan de Juárez | Naucalpan de Juárez | mx | PPLA2 | 834434 | ولاية مكسيكو | 19.4785 | -99.2396 | 12.27 | mexico-city | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | hermosillo | ارموسييو سونورا | Hermosillo | Hermosillo | mx | PPLA | 812229 | سونورا | 29.0887 | -110.9668 | 1116.97 | monterrey | arabic_only |  | 95 | always_include:PPLA |
| ✅ | culiacan | كوليتاكان | Culiacán | Culiacán | mx | PPLA | 808416 | سينالوا | 24.8021 | -107.3942 | 619.76 | guadalajara | arabic_only |  | 95 | always_include:PPLA |
| ✅ | nuevo-laredo | نوئوو لاردو | Nuevo Laredo | Nuevo Laredo | mx | PPL | 416055 | تاماوليباس | 27.4763 | -99.5164 | 214.30 | monterrey | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | mazatlan | ماساتلان | Mazatlán | Mazatlán | mx | PPLA2 | 381583 | سينالوا | 23.2216 | -106.4189 | 425.84 | guadalajara | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | irapuato | ايرابواتو | Irapuato | Irapuato | mx | PPLA2 | 380941 | غواناخواتو | 20.6710 | -101.3558 | 207.44 | guadalajara | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cuernavaca | كويرنافاكا | Cuernavaca | Cuernavaca | mx | PPLA | 338650 | موريلوس | 18.9261 | -99.2308 | 57.24 | mexico-city | arabic_only |  | 90 | always_include:PPLA |
| ✅ | tepic | تيبيك | Tepic | Tepic | mx | PPLA | 332863 | نايريت | 21.5073 | -104.8933 | 185.84 | guadalajara | arabic_only |  | 90 | always_include:PPLA |
| ✅ | ciudad-victoria | سيوداد فيكتوريا | Ciudad Victoria | Ciudad Victoria | mx | PPLA | 332100 | تاماوليباس | 23.7406 | -99.1436 | 246.67 | monterrey | arabic_only |  | 90 | always_include:PPLA |
| ✅ | oaxaca | أوخاكا | Oaxaca | Oaxaca | mx | PPLA | 255029 | واهاكا | 17.0602 | -96.7254 | 366.37 | mexico-city | arabic_only |  | 90 | always_include:PPLA |
| ✅ | puerto-vallarta | بويرتو فالارتا | Puerto Vallarta | Puerto Vallarta | mx | PPL | 224166 | خاليسكو | 20.6170 | -105.2302 | 195.75 | guadalajara | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cabo-san-lucas | كابو سان لوكاس | Cabo San Lucas | Cabo San Lucas | mx | PPL | 202694 | باها كاليفورنيا سور | 22.8909 | -109.9124 | 721.56 | guadalajara | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | chilpancingo | تشيلبانسينجو | Chilpancingo | Chilpancingo | mx | PPLA | 187251 | غيريرو | 17.5523 | -99.5012 | 212.65 | mexico-city | arabic_only |  | 90 | always_include:PPLA |
| ✅ | san-miguel-de-allende | سان ميغيل دي الليندي | San Miguel de Allende | San Miguel de Allende | mx | PPL | 174615 | غواناخواتو | 20.9153 | -100.7439 | 235.46 | mexico-city | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | chetumal | تشيتومال | Chetumal | Chetumal | mx | PPLA | 169028 | كينتانا رو | 18.5196 | -88.3040 | 1143.04 | mexico-city | arabic_only |  | 90 | always_include:PPLA |
| ✅ | playa-del-carmen | بلايا ديل كارمن | Playa del Carmen | Playa del Carmen | mx | PPL | 149923 | كينتانا رو | 20.6274 | -87.0799 | 1265.89 | mexico-city | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | navojoa | ناووخوا | Navojoa | Navojoa | mx | PPLA2 | 113836 | سونورا | 27.0706 | -109.4434 | 921.95 | monterrey | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ciudad-guzman | ثيوداد جوثمان | Ciudad Guzmán | Ciudad Guzmán | mx | PPLA2 | 111975 | خاليسكو | 19.7041 | -103.4638 | 106.92 | guadalajara | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tlaxcala | تلاكسكالا | Tlaxcala | Tlaxcala | mx | PPLA | 84670 | تلاكسكالا | 19.3178 | -98.2385 | 94.72 | mexico-city | arabic_only |  | 85 | always_include:PPLA |
| ⚠️ | zapopan | زاپوپان، خالیسکو | Zapopan | Zapopan | mx | PPLA2 | 1476491 | خاليسكو | 20.7211 | -103.3874 | 7.88 | guadalajara | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | merida | myryڈa | Mérida | Mérida | mx | PPLA | 1201000 | يوكاتان | 20.9670 | -89.6232 | 1006.81 | mexico-city | mixed_script | wave→merida-mx | 95 | always_include:PPLA |
| ⚠️ | mexicali | مخیکالی | Mexicali | Mexicali | mx | PPLA | 1032686 | باها كاليفورنيا | 32.6278 | -115.4545 | 1657.87 | monterrey | mixed_script |  | 95 | always_include:PPLA |
| ⚠️ | chihuahua | تشيواوا | Chihuahua | Chihuahua | mx | PPLA | 925762 | تشيواوا | 28.6353 | -106.0889 | 658.40 | monterrey | arabic_only | wave→chihuahua-mx | 95 | always_include:PPLA |
| ⚠️ | morelia | مورلیا، میچوآکان | Morelia | Morelia | mx | PPLA | 743275 | ميتشواكان | 19.7008 | -101.1844 | 216.97 | mexico-city | mixed_script |  | 95 | always_include:PPLA |
| ⚠️ | torreon | تورئون٬ کواویلا | Torreón | Torreón | mx | PPLA2 | 735340 | كواويلا | 25.5439 | -103.4190 | 311.51 | monterrey | mixed_script | wave→torreon-mx | 95 | pop_gte_100000 |
| ⚠️ | san-luis-potosi | سان لوئیس پوتوسی سٹی | San Luis Potosí | San Luis Potosí | mx | PPLA | 722772 | سان لويس بوتوسي | 22.1523 | -100.9714 | 296.92 | guadalajara | mixed_script |  | 95 | always_include:PPLA |
| ⚠️ | aguascalientes | آگوئاسکالینتس | Aguascalientes | Aguascalientes | mx | PPLA | 722250 | أغواسكالينتس | 21.8826 | -102.2843 | 175.14 | guadalajara | mixed_script |  | 95 | always_include:PPLA |
| ⚠️ | saltillo | سالتيللو | Saltillo | Saltillo | mx | PPLA | 709671 | كواويلا | 25.4260 | -100.9796 | 72.60 | monterrey | arabic_only | wave→saltillo-mx | 95 | always_include:PPLA |
| ⚠️ | acapulco-de-juarez | آکاپولکو، گوئررو | Acapulco de Juárez | Acapulco de Juárez | mx | PPL | 658609 | غيريرو | 16.8494 | -99.9089 | 298.70 | mexico-city | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | tlaquepaque | تلاکوپاکو | Tlaquepaque | Tlaquepaque | mx | PPLA2 | 650123 | خاليسكو | 20.6412 | -103.2934 | 6.20 | guadalajara | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | tuxtla | توستلا گیوتیرس | Tuxtla | Tuxtla | mx | PPLA | 604147 | تشياباس | 16.7536 | -93.1158 | 702.23 | mexico-city | mixed_script |  | 95 | always_include:PPLA |
| ⚠️ | reynosa | ریئنوسا | Reynosa | Reynosa | mx | PPLA2 | 589466 | تاماوليباس | 26.0800 | -98.2846 | 207.89 | monterrey | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | toluca | تولوكا | Toluca | Toluca | mx | PPLA | 489333 | ولاية مكسيكو | 19.2879 | -99.6532 | 56.88 | mexico-city | arabic_only | wave→toluca-mx | 90 | always_include:PPLA |
| ⚠️ | ciudad-apodaca | آپوداکا | Ciudad Apodaca | Ciudad Apodaca | mx | PPLA2 | 467157 | نويفو ليون | 25.7819 | -100.1884 | 16.61 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | ensenada | إنسينادا | Ensenada | Ensenada | mx | PPLA2 | 443807 | باها كاليفورنيا | 31.8715 | -116.6007 | 1727.21 | monterrey | arabic_only | wave→ensenada-mx | 90 | pop_gte_100000 |
| ⚠️ | veracruz | وراکروس | Veracruz | Veracruz | mx | PPLA2 | 428323 | فيراكروز | 19.1809 | -96.1429 | 315.05 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | xalapa-de-enriquez | khalapa ڈے anrykyz | Xalapa de Enríquez | Xalapa de Enríquez | mx | PPLA | 424755 | فيراكروز | 19.5312 | -96.9159 | 232.69 | mexico-city | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | san-nicolas-de-los-garza | سن نیکولاس د لوس گارزا | San Nicolás de los Garza | San Nicolás de los Garza | mx | PPL | 412199 | نويفو ليون | 25.7417 | -100.3022 | 6.28 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tonala | تونالا، خالیسکو | Tonalá | Tonalá | mx | PPLA2 | 408759 | خاليسكو | 20.6226 | -103.2417 | 11.96 | guadalajara | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tapachula | تاپاچولا | Tapachula | Tapachula | mx | PPLA2 | 353706 | تشياباس | 14.9054 | -92.2589 | 886.78 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | villahermosa | بیائرموسا | Villahermosa | Villahermosa | mx | PPLA | 353577 | تاباسكو | 17.9862 | -92.9393 | 671.82 | mexico-city | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | celaya | سلایا | Celaya | Celaya | mx | PPLA2 | 340387 | غواناخواتو | 20.5218 | -100.8140 | 213.35 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | ciudad-obregon | سیوداد اوبرگن | Ciudad Obregón | Ciudad Obregón | mx | PPLA2 | 329404 | سونورا | 27.4864 | -109.9408 | 977.46 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | coatzacoalcos | کواتزاکوالکوس | Coatzacoalcos | Coatzacoalcos | mx | PPL | 310698 | فيراكروز | 18.1490 | -94.4447 | 513.75 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tampico | تامبيكو | Tampico | Tampico | mx | PPLA2 | 309003 | تاماوليباس | 22.2852 | -97.8778 | 342.96 | mexico-city | arabic_only | wave→tampico-mx | 90 | pop_gte_100000 |
| ⚠️ | uruapan | اورواپان | Uruapan | Uruapan | mx | PPLA2 | 299523 | ميتشواكان | 19.4168 | -102.0584 | 193.12 | guadalajara | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | cholula | چولولا | Cholula | Cholula | mx | PPL | 292881 | بويبلا | 19.0641 | -98.3035 | 96.26 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | nicolas-romero | نیکولاس رومرو، مکزیکو | Nicolás Romero | Nicolás Romero | mx | PPLA2 | 281799 | ولاية مكسيكو | 19.6418 | -99.3068 | 29.53 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | nogales | نوگالس، سونورا | Nogales | Nogales | mx | PPL | 264782 | سونورا | 31.3086 | -110.9422 | 1211.09 | monterrey | mixed_script | wave→nogales-mx | 90 | pop_gte_100000 |
| ⚠️ | los-mochis | لوس موچیس | Los Mochis | Los Mochis | mx | PPLA2 | 256613 | سينالوا | 25.7910 | -108.9982 | 811.37 | guadalajara | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | pachuca-de-soto | pachwka ڈے swtw | Pachuca de Soto | Pachuca de Soto | mx | PPLA | 256584 | هيدالغو | 20.1170 | -98.7333 | 86.84 | mexico-city | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | la-paz | لا باز | La Paz | La Paz | mx | PPLA | 250141 | باها كاليفورنيا سور | 24.1423 | -110.3132 | 813.71 | guadalajara | arabic_only | wave→la-paz-mx | 90 | always_include:PPLA |
| ⚠️ | tehuacan | تهواکان | Tehuacán | Tehuacán | mx | PPLA2 | 248716 | بويبلا | 18.4642 | -97.3974 | 211.95 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | campeche | kmpychے | Campeche | Campeche | mx | PPLA | 220389 | كامبتشي | 19.8407 | -90.5168 | 903.42 | mexico-city | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | ciudad-acuna | اکونا، کواویلا | Ciudad Acuña | Ciudad Acuña | mx | PPL | 216099 | كواويلا | 29.3232 | -100.9522 | 409.21 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | monclova | مونکلووا | Monclova | Monclova | mx | PPLA2 | 215271 | كواويلا | 26.9069 | -101.4206 | 174.74 | monterrey | mixed_script | wave→monclova-mx | 90 | pop_gte_100000 |
| ⚠️ | cordoba | کوردوبا، وراکروز | Córdoba | Córdoba | mx | PPL | 204721 | فيراكروز | 18.8842 | -96.9256 | 239.76 | mexico-city | mixed_script | curated:es | 90 | pop_gte_100000 |
| ⚠️ | ciudad-madero | سیوداد مادرو | Ciudad Madero | Ciudad Madero | mx | PPLA2 | 197216 | تاماوليباس | 22.2475 | -97.8367 | 340.76 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | ciudad-del-carmen | سیوداد دل کارمن | Ciudad del Carmen | Ciudad del Carmen | mx | PPL | 191238 | كامبتشي | 18.6459 | -91.8299 | 772.57 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | poza-rica-de-hidalgo | پوزا ریکا، وراکروز | Poza Rica de Hidalgo | Poza Rica de Hidalgo | mx | PPL | 185242 | فيراكروز | 20.5331 | -97.4595 | 213.46 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | san-luis-rio-colorado | سان لویس ریو کولورادو | San Luis Río Colorado | San Luis Río Colorado | mx | PPLA2 | 176685 | سونورا | 32.4555 | -114.7704 | 1591.52 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | salamanca | سالامانکا، گواناخواتو | Salamanca | Salamanca | mx | PPLA2 | 160682 | غواناخواتو | 20.5698 | -101.1977 | 224.18 | guadalajara | mixed_script | wave→salamanca-mx | 90 | pop_gte_100000 |
| ⚠️ | manzanillo | مانزانیلو | Manzanillo | Manzanillo | mx | PPLA2 | 159853 | كوليما | 19.1169 | -104.3421 | 200.49 | guadalajara | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | tuxtepec | سان خوان ناوتیتستا توکستیپیک | Tuxtepec | Tuxtepec | mx | PPL | 159452 | واهاكا | 18.0883 | -96.1253 | 350.18 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | san-pablo-de-las-salinas | سانت پاوڵی سالیناس | San Pablo de las Salinas | San Pablo de las Salinas | mx | PPL | 156191 | ولاية مكسيكو | 19.6666 | -99.0948 | 26.33 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | piedras-negras | پیئدراس نیگراس، كواہويلا | Piedras Negras | Piedras Negras | mx | PPL | 150178 | كواويلا | 28.7001 | -100.5235 | 335.71 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | ciudad-delicias | دلیسیاس | Ciudad Delicias | Ciudad Delicias | mx | PPL | 148045 | تشيواوا | 28.1901 | -105.4701 | 581.74 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | colima | كوليما | Colima | Colima | mx | PPLA | 146965 | كوليما | 19.2447 | -103.7127 | 161.85 | guadalajara | arabic_only | wave→colima-mx | 90 | always_include:PPLA |
| ⚠️ | fresnillo | فرسنیلو | Fresnillo | Fresnillo | mx | PPLA2 | 143281 | ساكاتيكاس | 23.1749 | -102.8679 | 284.06 | guadalajara | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | zacatecas | زاکاتکاس ٬زاکاتکاس | Zacatecas | Zacatecas | mx | PPLA | 129011 | ساكاتيكاس | 22.7684 | -102.5814 | 247.54 | guadalajara | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | iguala-de-la-independencia | ایگوالا | Iguala de la Independencia | Iguala de la Independencia | mx | PPLA2 | 118468 | غيريرو | 18.3454 | -99.5413 | 128.29 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | heroica-guaymas | گوایماس | Heroica Guaymas | Heroica Guaymas | mx | PPLA2 | 117253 | سونورا | 27.9199 | -110.8989 | 1078.87 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | minatitlan | میناتیتلان | Minatitlán | Minatitlán | mx | PPLA2 | 112046 | فيراكروز | 18.0001 | -94.5569 | 507.56 | mexico-city | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | hidalgo-del-parral | پارال، چہواہوا | Hidalgo del Parral | Hidalgo del Parral | mx | PPLA2 | 104836 | تشيواوا | 26.9299 | -105.6662 | 550.86 | monterrey | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | apatzingan | اپاتزینگان | Apatzingán | Apatzingán | mx | PPL | 102362 | ميتشواكان | 19.0886 | -102.3570 | 203.20 | guadalajara | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | guanajuato | gwana ہwatw | Guanajuato | Guanajuato | mx | PPLA | 72237 | غواناخواتو | 21.0186 | -101.2591 | 220.88 | guadalajara | mixed_script |  | 85 | always_include:PPLA |

## Collision-watch list for MX

Cities the user pre-flagged: `birmingham`, `manchester`, `cambridge`, `dublin`, `athens`, `saint-petersburg`, `toledo`, `rochester`, `salem`, `victoria`, `cordoba`, `merida`, `leon`, `granada`, `santiago`, `washington`, `new-york`, `los-angeles`, `chicago`, `montreal`, `toronto`, `vancouver`, `mexico-city`, `guadalajara`, `monterrey`, `newcastle`, `peterborough`, `york`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | 1086 |  |  |  |  |
| merida | pending | high | merida | 1201000 | 1006.81 | mexico-city | wave | merida-mx |
| cordoba | pending | high | cordoba | 204721 | 239.76 | mexico-city | curated-cc=es | cordoba-mx |
| mexico-city | existing |  | mexico-city | 12294193 |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | 578 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 80 |  |  |  |  |
| monterrey | existing |  | monterrey | 343 |  |  |  |  |
| monterrey | existing |  | monterrey | 149 |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| santiago-de-queretaro | pending | high | santiago | 1594212 | 183.57 | mexico-city |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | 1135512 |  |  |  |  |
| monterrey | existing |  | monterrey | 751 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 36 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 1385629 |  |  |  |  |
| victoria-de-durango | pending | medium | victoria | 518709 | 397.15 | guadalajara |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | 4 |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | 541 |  |  |  |  |
| monterrey | existing |  | monterrey | 503 |  |  |  |  |
| monterrey | existing |  | monterrey | 399 |  |  |  |  |
| monterrey | existing |  | monterrey | 100 |  |  |  |  |
| monterrey | existing |  | monterrey | 31 |  |  |  |  |
| monterrey | existing |  | monterrey | 30 |  |  |  |  |
| monterrey | existing |  | monterrey | 24 |  |  |  |  |
| monterrey | existing |  | monterrey | 23 |  |  |  |  |
| monterrey | existing |  | monterrey | 18 |  |  |  |  |
| monterrey | existing |  | monterrey | 18 |  |  |  |  |
| monterrey | existing |  | monterrey | 17 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 13 |  |  |  |  |
| monterrey | existing |  | monterrey | 12 |  |  |  |  |
| monterrey | existing |  | monterrey | 9 |  |  |  |  |
| monterrey | existing |  | monterrey | 8 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 7 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 7 |  |  |  |  |
| monterrey | existing |  | monterrey | 7 |  |  |  |  |
| monterrey | existing |  | monterrey | 7 |  |  |  |  |
| monterrey | existing |  | monterrey | 5 |  |  |  |  |
| monterrey | existing |  | monterrey | 5 |  |  |  |  |
| guadalajara | existing |  | guadalajara | 5 |  |  |  |  |
| monterrey | existing |  | monterrey | 4 |  |  |  |  |
| monterrey | existing |  | monterrey | 4 |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |
| guadalajara | existing |  | guadalajara | - |  |  |  |  |
| monterrey | existing |  | monterrey | - |  |  |  |  |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/mx-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-mx` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/MX.zip
