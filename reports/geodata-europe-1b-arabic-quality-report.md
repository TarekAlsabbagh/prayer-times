# Europe-1B — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-EUROPE-1B`
**Strategy**: E — Strategy A + Stage 3.5 ar-quality gate
**Generated**: 2026-05-15T21:20:53.191Z

## What this report tells you

Same as Europe-1A: Iberian peninsula has Arabic-name candidates
mostly from Urdu/Persian altnames in GeoNames; Strategy E gate
separates clean Arabic from contaminated.

* Accept the clean (`wikidata`/`arabic_only`) ones in bulk;
* Review and fix the (`mixed_script`/`mixed_latin`/`empty`) ones one by one.

## Quality bucket meanings

| Bucket | Meaning | Default action |
| --- | --- | --- |
| `wikidata`     | Arabic from explicit `ar:` tag in GeoNames altnames | ✅ approve if no collision |
| `arabic_only`  | Untagged altname but characters are 100% pure-Arabic | ✅ approve if no collision |
| `mixed_script` | Contains Persian/Urdu/Pashto letters (پ چ ژ گ ٹ ڈ ڑ ی ک ہ ے ۀ ...) | ⚠️ fix Arabic manually |
| `mixed_latin`  | Contains Latin letters (A-Z) mixed in | ⚠️ fix Arabic manually |
| `mixed_unknown`| Arabic plus other non-Arabic chars we did not catch | ⚠️ inspect manually |
| `empty`        | No Arabic name at all | 🔴 supply manually |

## Aggregate summary

| Country | high-tier | wikidata | arabic_only | mixed_script | mixed_latin | empty | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ES | 44 | 0 | 35 | 8 | 0 | 0 | **35** | **9** |
| PT | 19 | 0 | 12 | 7 | 0 | 0 | **9** | **10** |
| **TOTAL** | **63** | **0** | **47** | **15** | **0** | **0** | **44** | **19** |

## Collision summary

| Collision type | Count (high-tier only) |
| --- | ---: |
| Within Europe-1B wave (ES↔PT same slug) | 3 |
| Against existing curated (other cc owns slug already) | 1 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- |
| es | toledo | toledo-es | تولدو، اسپانیا | 86526 |
| pt | faro | faro-pt | فارو | 70347 |
| pt | vila-real | vila-real-pt | فيلا ريال | 17001 |

### Curated collisions (high-tier — slug already owned by another country)

| cc | slug | existingCc | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- | --- |
| pt | beja | tn | beja-pt | بيجا | 34760 |

## arabic_only (47)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| es | murcia | مرسية | Murcia | Murcia | PPLA | 471982 | مرسية | 177.38 |  |  |
| es | valladolid | بلد الوليد | Valladolid | Valladolid | PPLA | 300618 | قشتالة وليون | 162.12 |  |  |
| es | gijon | خيخون | Gijón | Gijón | PPLA3 | 271780 | أستورياس | 222.35 |  |  |
| es | elche | إلش | Elche | Elche | PPLA3 | 234765 | بلنسية | 137.20 |  |  |
| es | ciudad-lineal | سويداد لينيال | Ciudad Lineal | Ciudad Lineal | PPL | 228171 | مدريد | 5.44 |  |  |
| es | oviedo | أوفييدو | Oviedo | Oviedo | PPLA | 220027 | أستورياس | 235.66 |  |  |
| es | badalona | بادالونا | Badalona | Badalona | PPLA3 | 217741 | كاتالونيا | 9.50 |  |  |
| es | cartagena | كارتاخينا | Cartagena | Cartagena | PPLA3 | 213943 | مرسية | 214.32 |  |  |
| es | santa-cruz-de-tenerife | سانتا كروث دي تينيريفه | Santa Cruz de Tenerife | Santa Cruz de Tenerife | PPLA | 211359 | جزر الكناري | 1377.61 |  |  |
| es | pamplona | بنبلونة | Pamplona | Pamplona | PPLA | 208243 | نافارا | 116.11 |  |  |
| es | mostoles | موستولس | Móstoles | Móstoles | PPLA3 | 207095 | مدريد | 17.23 |  |  |
| es | alcala-de-henares | ألكالا دي إيناريس | Alcalá de Henares | Alcalá de Henares | PPLA3 | 193751 | مدريد | 29.99 |  |  |
| pt | braga | براغا | Braga | Braga | PPLA | 193324 | براغا | 47.01 |  |  |
| es | fuenlabrada | فوينلابرادا | Fuenlabrada | Fuenlabrada | PPLA3 | 190496 | مدريد | 16.61 |  |  |
| es | leganes | ليجانيس | Leganés | Leganés | PPLA3 | 188425 | مدريد | 11.18 |  |  |
| es | getafe | خيتافي | Getafe | Getafe | PPLA3 | 187525 | مدريد | 12.60 |  |  |
| es | san-sebastian | سان سباستيان | Donostia / San Sebastián | Donostia / San Sebastián | PPLA2 | 185357 | إقليم الباسك | 77.90 |  |  |
| es | burgos | برغش | Burgos | Burgos | PPLA2 | 176418 | قشتالة وليون | 120.10 |  |  |
| es | santander | سانتاندر | Santander | Santander | PPLA | 173635 | كانتابريا | 73.85 |  |  |
| es | albacete | آلباسته | Albacete | Albacete | PPLA2 | 173050 | قشتالة لا مانتشا | 138.02 |  |  |
| es | alcorcon | ألكوركون | Alcorcón | Alcorcón | PPLA3 | 172384 | مدريد | 12.94 |  |  |
| es | marbella | ماربلا | Marbella | Marbella | PPLA3 | 156295 | الأندلس | 47.35 |  |  |
| es | logrono | لوغرونيو | Logroño | Logroño | PPLA | 151164 | لا ريوخا | 96.98 |  |  |
| es | badajoz | باداخوز | Badajoz | Badajoz | PPLA3 | 150530 | إكستريمادورا | 186.66 |  |  |
| es | salamanca | سلمنقة | Salamanca | Salamanca | PPLA2 | 144825 | قشتالة وليون | 176.28 |  |  |
| pt | coimbra | كويمبرا | Coimbra | Coimbra | PPLA | 140796 | قويمبرا | 107.21 |  |  |
| pt | leiria | لييريا | Leiria | Leiria | PPLA | 128640 | لييريا | 117.11 |  |  |
| es | leon | ليون | León | León | PPLA2 | 124772 | قشتالة وليون | 226.85 |  |  |
| es | telde | تيلدي | Telde | Telde | PPLA3 | 123265 | جزر الكناري | 1366.32 |  |  |
| es | algeciras | الجزيرة الخضراء | Algeciras | Algeciras | PPLA3 | 121414 | الأندلس | 112.93 |  |  |
| pt | setubal | ستوبال | Setúbal | Setúbal | PPLA | 118166 | سيتوبال | 30.98 |  |  |
| es | cadiz | قادس | Cadiz | Cadiz | PPLA2 | 116979 | الأندلس | 99.64 |  |  |
| es | alcobendas | ألكوبينداس | Alcobendas | Alcobendas | PPLA3 | 116037 | مدريد | 15.44 |  |  |
| es | parla | بارلا | Parla | Parla | PPLA3 | 115611 | مدريد | 20.81 |  |  |
| es | jaen | جيان | Jaén | Jaén | PPLA2 | 113457 | الأندلس | 67.96 |  |  |
| pt | viseu | فيسيو | Viseu | Viseu | PPLA | 103502 | فيزيو | 81.89 |  |  |
| pt | queluz | كويلوز | Queluz | Queluz | PPL | 103399 | لشبونة | 10.69 |  |  |
| es | orihuela | أوريويلا | Orihuela | Orihuela | PPLA3 | 101321 | بلنسية | 161.68 |  |  |
| es | santiago-de-compostela | سانتياجو دى كومبوستيلا | Santiago de Compostela | Santiago de Compostela | PPLA | 99536 | غاليسيا | 457.64 |  |  |
| es | melilla | مليلية | Melilla | Melilla | PPLA | 85985 | مليلية | 207.35 |  |  |
| pt | faro | فارو | Faro | Faro | PPLA | 70347 | فارو | 217.26 | wave | faro-pt |
| es | merida | ماردة | Mérida | Mérida | PPLA | 59857 | إكستريمادورا | 172.87 |  |  |
| pt | evora | إيفورا | Évora | Évora | PPLA | 53591 | إيفورا | 108.68 |  |  |
| pt | braganca | براغانسا | Bragança | Bragança | PPLA | 35341 | براغانصا | 171.70 |  |  |
| pt | beja | بيجا | Beja | Beja | PPLA | 34760 | بيجا | 136.29 | curated | beja-pt |
| pt | santarem | سانتارم | Santarém | Santarém | PPLA | 29385 | سانتاريم | 69.06 |  |  |
| pt | vila-real | فيلا ريال | Vila Real | Vila Real | PPLA | 17001 | فيلا ريال | 75.75 | wave | vila-real-pt |

## mixed_script (15)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| es | alicante | آلیکانته | Alicante | Alicante | PPLA2 | 348901 | بلنسية | 125.39 |  |  |
| es | vigo | بیگو | Vigo | Vigo | PPLA3 | 293642 | غاليسيا | 465.10 |  |  |
| es | a-coruna | اے کرونا | A Coruña | A Coruña | PPLA3 | 250438 | غاليسيا | 441.89 |  |  |
| es | jerez-de-la-frontera | جیراز دی لا فرونتیرا | Jerez de la Frontera | Jerez de la Frontera | PPLA3 | 212879 | الأندلس | 79.28 |  |  |
| es | almeria | آلمریا | Almería | Almería | PPLA2 | 196851 | الأندلس | 107.93 |  |  |
| es | tarragona | تاراگونا | Tarragona | Tarragona | PPLA2 | 141542 | كاتالونيا | 83.03 |  |  |
| es | chamartin | چامارتین | Chamartín | Chamartín | PPL | 140000 | مدريد | 5.53 |  |  |
| pt | funchal | فنچال ،پرتگال | Funchal | Funchal | PPLA | 105795 | ماديرا | 972.90 |  |  |
| es | toledo | تولدو، اسپانیا | Toledo | Toledo | PPLA | 86526 | قشتالة لا مانتشا | 67.78 | wave | toledo-es |
| pt | aveiro | آویرو | Aveiro | Aveiro | PPLA | 80880 | أفيرو | 56.97 |  |  |
| pt | guarda | gwarڈa | Guarda | Guarda | PPLA | 40126 | غواردا | 133.78 |  |  |
| pt | viana-do-castelo | wyana ڈw kasٹylw | Viana do Castelo | Viana do Castelo | PPLA | 36148 | فيانا دو كاستيلو | 61.90 |  |  |
| pt | castelo-branco | kasٹylw brankw | Castelo Branco | Castelo Branco | PPLA | 33479 | كاستيلو برانكو | 176.84 |  |  |
| pt | portalegre | pwrtalygrے | Portalegre | Portalegre | PPLA | 22368 | بورتاليغرا | 160.68 |  |  |
| pt | ponta-delgada | pwnta ڈylgada | Ponta Delgada | Ponta Delgada | PPLA | 20056 | الأزور | 1445.94 |  |  |

## mixed_unknown (1)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| es | mataro | ماتارو، برشلونة | Mataró | Mataró | PPLA3 | 126988 | كاتالونيا | 28.55 |  |  |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
