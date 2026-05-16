# Europe-2 — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E — Strategy A + Stage 3.5 ar-quality gate
**Generated**: 2026-05-16T07:20:59.513Z

## What this report tells you

Same as Europe-1A: Central + Nordic Europe has Arabic-name candidates
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
| DE | 67 | 0 | 51 | 14 | 1 | 0 | **47** | **20** |
| AT | 8 | 0 | 5 | 3 | 0 | 0 | **4** | **4** |
| CH | 26 | 0 | 18 | 6 | 2 | 0 | **13** | **13** |
| IT | 25 | 0 | 23 | 2 | 0 | 0 | **22** | **3** |
| DK | 6 | 0 | 2 | 3 | 1 | 0 | **2** | **4** |
| SE | 21 | 0 | 11 | 6 | 4 | 0 | **10** | **11** |
| NO | 17 | 0 | 8 | 9 | 0 | 0 | **6** | **11** |
| FI | 17 | 0 | 14 | 3 | 0 | 0 | **14** | **3** |
| IS | 4 | 0 | 3 | 1 | 0 | 0 | **3** | **1** |
| **TOTAL** | **191** | **0** | **135** | **47** | **8** | **0** | **121** | **70** |

## Collision summary

| Collision type | Count (high-tier only) |
| --- | ---: |
| Within Europe-2 wave (ES↔PT same slug) | 25 |
| Against existing curated (other cc owns slug already) | 0 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- |
| de | muenster | muenster-de | مونستر | 308258 |
| de | oberhausen | oberhausen-de | أوبرهاوزن | 219176 |
| de | hagen | hagen-de | حاجین | 198972 |
| de | rostock | rostock-de | روستوك | 198293 |
| de | fuerth | fuerth-de | فرتھ | 132036 |
| de | koblenz | koblenz-de | كوبلنس | 107319 |
| de | gera | gera-de | گرا | 104659 |
| at | linz | linz-at | لنز | 204846 |
| at | salzburg | salzburg-at | salzbwrګ | 157245 |
| ch | basel | basel-ch | بازل | 177595 |
| ch | sankt-gallen | sankt-gallen-ch | synٹ gyln | 75833 |
| ch | schaffhausen | schaffhausen-ch | شافهاوزن | 36587 |
| ch | chur | chur-ch | خور | 35373 |
| ch | sitten | sitten-ch | سيون | 34708 |
| ch | zug | zug-ch | zګ | 30542 |
| ch | frauenfeld | frauenfeld-ch | frawnfylڈ | 25607 |
| ch | altdorf | altdorf-ch | آلتدورف | 9401 |
| ch | stans | stans-ch | sټans | 8393 |
| it | prato | prato-it | براتو | 195089 |
| dk | viborg | viborg-dk | wybwrګ | 41239 |
| se | karlstad | karlstad-se | karl sټad | 61492 |
| se | visby | visby-se | فيسبي | 23402 |
| no | bergen | bergen-no | برغن | 294029 |
| no | arendal | arendal-no | أرندال | 30916 |
| fi | lahti | lahti-fi | لاختی | 121622 |

## arabic_only (135)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| it | palermo | بالرمو | Palermo | Palermo | PPLA | 648260 | صقلية | 313.88 |  |  |
| de | essen | أسن | Essen | Essen | PPLA3 | 593085 | شمال الراين-وستفاليا | 30.38 |  |  |
| de | dortmund | دورتموند | Dortmund | Dortmund | PPLA3 | 588462 | شمال الراين-وستفاليا | 57.71 |  |  |
| de | bremen | برمن | Bremen | Bremen | PPLA | 546501 | بريمن | 94.90 |  |  |
| de | hannover | هانوفر | Hannover | Hannover | PPLA | 515140 | سكسونيا السفلى | 132.43 |  |  |
| de | duisburg | دويسبورغ | Duisburg | Duisburg | PPLA3 | 504358 | شمال الراين-وستفاليا | 22.78 |  |  |
| de | bochum | بوخم | Bochum | Bochum | PPLA3 | 385729 | شمال الراين-وستفاليا | 41.76 |  |  |
| se | malmoe | مالمو | Malmö | Malmö | PPLA | 362133 | سكونه | 512.78 |  |  |
| de | wuppertal | فوبرتال | Wuppertal | Wuppertal | PPLA3 | 360797 | شمال الراين-وستفاليا | 26.27 |  |  |
| de | bielefeld | بيليفيلد | Bielefeld | Bielefeld | PPLA4 | 331906 | شمال الراين-وستفاليا | 150.92 |  |  |
| it | bari | باري | Bari | Bari | PPLA | 316491 | بوليا | 220.41 |  |  |
| it | catania | كاتانيا | Catania | Catania | PPLA2 | 311584 | صقلية | 379.91 |  |  |
| de | muenster | مونستر | Münster | Münster | PPLA2 | 308258 | شمال الراين-وستفاليا | 100.69 | wave | muenster-de |
| de | mannheim | مانهايم | Mannheim | Mannheim | PPLA3 | 307960 | بادن-فورتمبرغ | 70.84 |  |  |
| at | graz | غراتس | Graz | Graz | PPLA | 303270 | ستيريا | 144.80 |  |  |
| de | augsburg | آوغسبورغ | Augsburg | Augsburg | PPLA2 | 301105 | بافاريا | 57.03 |  |  |
| no | bergen | برغن | Bergen | Bergen | PPLA | 294029 | فيستلاند | 304.98 | wave | bergen-no |
| de | karlsruhe | كارلسروه | Karlsruhe | Karlsruhe | PPLA2 | 283799 | بادن-فورتمبرغ | 62.56 |  |  |
| de | gelsenkirchen | غيلسنكيرشن | Gelsenkirchen | Gelsenkirchen | PPLA3 | 270028 | شمال الراين-وستفاليا | 38.13 |  |  |
| de | aachen | آخن | Aachen | Aachen | PPLA3 | 265208 | شمال الراين-وستفاليا | 64.10 |  |  |
| de | moenchengladbach | مونشنغلادباخ | Mönchengladbach | Mönchengladbach | PPLA3 | 261742 | شمال الراين-وستفاليا | 23.59 |  |  |
| fi | tampere | تامبيري | Tampere | Tampere | PPLA | 260646 | بيركانماا | 160.42 |  |  |
| it | verona | فيرونا | Verona | Verona | PPLA2 | 258031 | فينيتو | 103.12 |  |  |
| fi | vantaa | فانتا | Vantaa | Vantaa | PPLA3 | 252724 | أوسيما | 14.93 |  |  |
| de | kiel | كيل | Kiel | Kiel | PPLA | 252668 | شليسفيغ-هولشتاين | 86.14 |  |  |
| de | chemnitz | كيمنتس | Chemnitz | Chemnitz | PPLA3 | 247220 | سكسونيا | 190.14 |  |  |
| de | krefeld | كريفلد | Krefeld | Krefeld | PPLA3 | 237984 | شمال الراين-وستفاليا | 19.49 |  |  |
| de | halle-saale | هاله | Halle (Saale) | Halle (Saale) | PPL | 237865 | سكسونيا-أنهالت | 151.18 |  |  |
| de | freiburg | فرايبورغ | Freiburg | Freiburg | PPLA2 | 237460 | بادن-فورتمبرغ | 131.06 |  |  |
| de | mainz | مائنز | Mainz | Mainz | PPLA | 222889 | راينلاند-بفالتس | 32.09 |  |  |
| it | messina | ميسينا | Messina | Messina | PPLA2 | 219948 | صقلية | 315.40 |  |  |
| de | oberhausen | أوبرهاوزن | Oberhausen | Oberhausen | PPLA3 | 219176 | شمال الراين-وستفاليا | 28.52 | wave | oberhausen-de |
| no | trondheim | تروندهايم | Trondheim | Trondheim | PPL | 216518 | تروندلاغ | 391.48 |  |  |
| fi | oulu | أولو | Oulu | Oulu | PPLA | 216066 | أوستروبوثنيا الشمالية | 539.13 |  |  |
| de | luebeck | لوبك | Lübeck | Lübeck | PPLA3 | 212207 | شليسفيغ-هولشتاين | 57.73 |  |  |
| at | linz | لنز | Linz | Linz | PPLA | 204846 | النمسا العليا | 154.94 | wave | linz-at |
| it | trieste | إسطاجانكو | Trieste | Trieste | PPLA | 204338 | فريولي-فينيتسيا جوليا | 116.14 |  |  |
| it | padua | بادوفا | Padua | Padua | PPLA2 | 203725 | فينيتو | 33.73 |  |  |
| ch | geneve | جنيف | Genève | Genève | PPLA | 201741 | جنيف | 224.34 |  |  |
| it | brescia | بريشيا | Brescia | Brescia | PPLA2 | 200423 | لومبارديا | 80.26 |  |  |
| it | taranto | تارانتو | Taranto | Taranto | PPLA2 | 198585 | بوليا | 254.94 |  |  |
| de | rostock | روستوك | Rostock | Rostock | PPLA3 | 198293 | ميكلنبورغ-فوربومرن | 153.06 | wave | rostock-de |
| it | parma | بارما | Parma | Parma | PPLA2 | 198292 | إميليا رومانيا | 87.24 |  |  |
| de | kassel | كاسل | Kassel | Kassel | PPLA2 | 197230 | هسن | 145.92 |  |  |
| it | prato | براتو | Prato | Prato | PPLA2 | 195089 | توسكانا | 17.73 | wave | prato-it |
| it | modena | مودينا | Modena | Modena | PPLA2 | 184732 | إميليا رومانيا | 37.17 |  |  |
| it | reggio-calabria | ريدجو كالابريا | Reggio Calabria | Reggio Calabria | PPLA2 | 182455 | كالابريا | 327.42 |  |  |
| dk | odense | أودنسه | Odense | Odense | PPLA2 | 180863 | جنوب الدنمارك | 140.66 |  |  |
| de | hamm | هام | Hamm | Hamm | PPL | 178967 | شمال الراين-وستفاليا | 88.32 |  |  |
| ch | basel | بازل | Basel | Basel | PPLA | 177595 | بازل-شتات | 75.54 | wave | basel-ch |
| se | uppsala | أوبسالا | Uppsala | Uppsala | PPLA | 177074 | أوبسالا | 63.65 |  |  |
| de | herne | هرنه | Herne | Herne | PPLA3 | 172108 | شمال الراين-وستفاليا | 46.71 |  |  |
| de | darmstadt | دارمشتات | Darmstadt | Darmstadt | PPLA2 | 167029 | هسن | 26.70 |  |  |
| de | osnabrueck | أسنابروك | Osnabrück | Osnabrück | PPLA3 | 166462 | سكسونيا السفلى | 145.67 |  |  |
| de | solingen | زولينغن | Solingen | Solingen | PPLA3 | 164359 | شمال الراين-وستفاليا | 22.49 |  |  |
| de | ludwigshafen-am-rhein | لودفيغسهافن | Ludwigshafen am Rhein | Ludwigshafen am Rhein | PPLA3 | 163196 | راينلاند-بفالتس | 72.03 |  |  |
| de | oldenburg | أولدنبورغ | Oldenburg | Oldenburg | PPLA3 | 159218 | سكسونيا السفلى | 126.61 |  |  |
| it | livorno | ليفورنو | Livorno | Livorno | PPLA2 | 157017 | توسكانا | 20.76 |  |  |
| se | oerebro | أوربرو | Örebro | Örebro | PPLA | 155989 | أوريبرو | 162.57 |  |  |
| de | neuss | نويس | Neuss | Neuss | PPLA3 | 152457 | شمال الراين-وستفاليا | 6.99 |  |  |
| de | regensburg | ريغنسبورغ | Regensburg | Regensburg | PPLA2 | 151389 | بافاريا | 88.87 |  |  |
| it | cagliari | كالياري | Cagliari | Cagliari | PPLA | 149257 | سردينيا | 411.85 |  |  |
| it | rimini | ريميني | Rimini | Rimini | PPLA2 | 148688 | إميليا رومانيا | 108.81 |  |  |
| de | heidelberg | هايدلبرغ | Heidelberg | Heidelberg | PPLA3 | 143345 | بادن-فورتمبرغ | 78.20 |  |  |
| de | paderborn | بادربورن | Paderborn | Paderborn | PPLA3 | 142161 | شمال الراين-وستفاليا | 147.67 |  |  |
| ch | lausanne | لوزان | Lausanne | Lausanne | PPLA | 139111 | فو | 173.66 |  |  |
| it | foggia | بيرودجا | Foggia | Foggia | PPLA2 | 137032 | بوليا | 126.89 |  |  |
| de | wuerzburg | فورتسبورغ | Würzburg | Würzburg | PPLA2 | 133731 | بافاريا | 89.54 |  |  |
| at | innsbruck | إنسبروك | Innsbruck | Innsbruck | PPLA | 132493 | تيرول | 386.85 |  |  |
| se | umea | أوميو | Umeå | Umeå | PPLA | 130224 | فاسربوتن | 513.47 |  |  |
| it | salerno | ساليرنو | Salerno | Salerno | PPLA2 | 125797 | كامبانيا | 48.38 |  |  |
| fi | kuopio | كووبيو | Kuopio | Kuopio | PPLA | 125462 | شمال سافو | 335.66 |  |  |
| it | monza | منزا | Monza | Monza | PPLA2 | 124398 | لومبارديا | 14.39 |  |  |
| de | wolfsburg | فولفسبورغ | Wolfsburg | Wolfsburg | PPLA3 | 123064 | سكسونيا السفلى | 135.91 |  |  |
| de | goettingen | غوتينغن | Göttingen | Göttingen | PPLA3 | 122149 | سكسونيا السفلى | 181.01 |  |  |
| ch | bern | برن | Bern | Bern | PPLC | 121631 | برن | 95.49 |  |  |
| it | bergamo | بيرغامو | Bergamo | Bergamo | PPLA2 | 121200 | لومبارديا | 45.21 |  |  |
| de | heilbronn | هايلبرون | Heilbronn | Heilbronn | PPLA3 | 120733 | بادن-فورتمبرغ | 40.59 |  |  |
| it | trento | ترنتو | Trento | Trento | PPLA | 120709 | ترنتينو ألتو أديجي | 115.97 |  |  |
| de | ulm | أولم | Ulm | Ulm | PPLA3 | 120451 | بادن-فورتمبرغ | 72.79 |  |  |
| it | perugia | بيرودجا | Perugia | Perugia | PPLA | 120137 | أومبريا | 117.09 |  |  |
| it | pescara | بيسكارا | Pescara | Pescara | PPLA2 | 119554 | أبروتسو | 153.58 |  |  |
| de | pforzheim | بفورتسهايم | Pforzheim | Pforzheim | PPLA3 | 119313 | بادن-فورتمبرغ | 37.43 |  |  |
| de | bremerhaven | برمرهافن | Bremerhaven | Bremerhaven | PPL | 118610 | بريمن | 93.68 |  |  |
| de | remscheid | رمشايد | Remscheid | Remscheid | PPLA3 | 117118 | شمال الراين-وستفاليا | 29.67 |  |  |
| de | reutlingen | رويتلينغن | Reutlingen | Reutlingen | PPLA3 | 112627 | بادن-فورتمبرغ | 31.66 |  |  |
| ch | winterthur | فينترتور | Winterthur | Winterthur | PPLA2 | 111840 | زيورخ | 19.83 |  |  |
| de | koblenz | كوبلنس | Koblenz | Koblenz | PPLA3 | 107319 | راينلاند-بفالتس | 54.54 | wave | koblenz-de |
| no | drammen | درامن | Drammen | Drammen | PPLA | 105042 | بوسكرود | 35.98 |  |  |
| de | salzgitter | زالتسغيتر | Salzgitter | Salzgitter | PPL | 104970 | سكسونيا السفلى | 157.57 |  |  |
| se | helsingborg | هلسينغبورغ | Helsingborg | Helsingborg | PPLA2 | 104250 | سكونه | 484.74 |  |  |
| de | moers | مئرس | Moers | Moers | PPL | 103487 | شمال الراين-وستفاليا | 26.94 |  |  |
| de | hildesheim | هيلدسهايم | Hildesheim | Hildesheim | PPLA3 | 103052 | سكسونيا السفلى | 155.74 |  |  |
| de | trier | ترير | Trier | Trier | PPLA4 | 100129 | راينلاند-بفالتس | 113.94 |  |  |
| de | schwerin | شفيرين | Schwerin | Schwerin | PPLA | 96641 | ميكلنبورغ-فوربومرن | 94.09 |  |  |
| fi | pori | بوري | Pori | Pori | PPLA | 83157 | ساتاكونتا | 224.59 |  |  |
| ch | luzern | لوسرن | Luzern | Luzern | PPLA | 81691 | لوتسرن | 40.41 |  |  |
| fi | joensuu | جوئنسو | Joensuu | Joensuu | PPLA | 78398 | شمال كاريليا | 372.77 |  |  |
| fi | kouvola | كوفولا | Kouvola | Kouvola | PPLA | 78094 | كيمي | 123.67 |  |  |
| fi | lappeenranta | لابينرنتا | Lappeenranta | Lappeenranta | PPLA | 72909 | جنوب كاريليا | 202.99 |  |  |
| se | vaexjoe | فاكسيو | Växjö | Växjö | PPLA | 71282 | كرونوبيرغ | 333.07 |  |  |
| fi | vaasa | فآسا | Vaasa | Vaasa | PPLA | 69819 | أوستروبوثنيا | 369.59 |  |  |
| fi | haemeenlinna | هامينلينا | Hämeenlinna | Hämeenlinna | PPLA | 68473 | كانتا-هامي | 95.43 |  |  |
| fi | seinaejoki | سينايوكي | Seinäjoki | Seinäjoki | PPLA | 66848 | جنوب أوستروبوثنيا | 312.56 |  |  |
| se | karlskrona | كارلسكرونا | Karlskrona | Karlskrona | PPLA | 66675 | بليكينغه | 381.73 |  |  |
| fi | rovaniemi | روفانييمي | Rovaniemi | Rovaniemi | PPLA | 65670 | لابلاند | 704.74 |  |  |
| fi | kokkola | كوكولا | Kokkola | Kokkola | PPLA | 48361 | أوستروبوثنيا الوسطى | 418.65 |  |  |
| no | tromso | ترومسا | Tromsø | Tromsø | PPLA | 41915 | ترومس | 1147.74 |  |  |
| se | nykoeping | نيكوبينج | Nyköping | Nyköping | PPLA | 38780 | سودرمانلاند | 88.25 |  |  |
| se | kalmar | كالمار | Kalmar | Kalmar | PPLA | 38408 | كالمار | 313.20 |  |  |
| ch | fribourg | فريبور | Fribourg | Fribourg | PPLA | 38365 | فريبورغ | 123.13 |  |  |
| se | falun | فالن | Falun | Falun | PPLA | 37291 | دالارنا | 196.33 |  |  |
| ch | schaffhausen | شافهاوزن | Schaffhausen | Schaffhausen | PPLA | 36587 | شافهاوزن | 36.31 | wave | schaffhausen-ch |
| fi | kajaani | كايآني | Kajaani | Kajaani | PPLA | 36458 | كاينو | 473.68 |  |  |
| ch | chur | خور | Chur | Chur | PPLA | 35373 | غراوبوندن | 95.18 | wave | chur-ch |
| ch | sitten | سيون | Sitten | Sitten | PPLA | 34708 | فاليه | 156.48 | wave | sitten-ch |
| no | bodo | بودو | Bodø | Bodø | PPLA | 34073 | نوردلاند | 838.37 |  |  |
| ch | neuchatel | نوشاتل | Neuchâtel | Neuchâtel | PPLA | 33475 | نوشاتيل | 129.03 |  |  |
| no | arendal | أرندال | Arendal | Arendal | PPLA | 30916 | أغدر | 196.95 | wave | arendal-no |
| at | bregenz | بريغنتس | Bregenz | Bregenz | PPLA | 29806 | فورارلبرغ | 500.44 |  |  |
| no | hamar | هامار | Hamar | Hamar | PPLA | 29479 | إنلاندت | 99.45 |  |  |
| se | visby | فيسبي | Visby | Visby | PPLA | 23402 | غوتلاند | 188.21 | wave | visby-se |
| ch | aarau | آراؤ | Aarau | Aarau | PPLA | 21503 | أرغاو | 37.49 |  |  |
| is | akureyri | أكوريري | Akureyri | Akureyri | PPLA | 19219 | الشمال الشرقي | 249.38 |  |  |
| is | keflavik | كيفلافيك | Keflavík | Keflavík | PPLA | 15930 | سودرنيس | 34.00 |  |  |
| ch | schwyz | اشووتس | Schwyz | Schwyz | PPLA | 15181 | شفيتس | 40.50 |  |  |
| ch | delemont | دلمون | Delémont | Delémont | PPLA | 12682 | جورا | 90.16 |  |  |
| ch | glarus | غلروس | Glarus | Glarus | PPLA | 12425 | غلاروس | 54.58 |  |  |
| ch | sarnen | زارنن | Sarnen | Sarnen | PPLA | 10368 | أوبفالدن | 57.97 |  |  |
| ch | altdorf | آلتدورف | Altdorf | Altdorf | PPLA | 9401 | أوري | 55.75 | wave | altdorf-ch |
| at | eisenstadt | آئزن شتات | Eisenstadt | Eisenstadt | PPLA | 9217 | بورغنلاند | 41.82 |  |  |
| is | selfoss | سلفوس | Selfoss | Selfoss | PPLA | 9000 | الجنوب | 51.78 |  |  |
| dk | soro | سورو | Sorø | Sorø | PPLA | 7999 | زيلاند | 69.25 |  |  |
| ch | appenzell | أبنتسل | Appenzell | Appenzell | PPLA | 5649 | أبنزل إنرهودن | 65.61 |  |  |
| no | vadso | فادسو | Vadsø | Vadsø | PPLA | 4654 | فينمارك | 1427.16 |  |  |

## mixed_script (47)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| de | leipzig | لائپزش | Leipzig | Leipzig | PPLA3 | 504971 | سكسونيا | 149.16 |  |  |
| de | wiesbaden | wysbyڈn | Wiesbaden | Wiesbaden | PPLA | 288850 | هسن | 31.35 |  |  |
| de | braunschweig | برانشویگ | Braunschweig | Braunschweig | PPLA3 | 244715 | سكسونيا السفلى | 147.31 |  |  |
| de | magdeburg | myګdybrګ | Magdeburg | Magdeburg | PPLA | 244329 | سكسونيا-أنهالت | 128.01 |  |  |
| de | erfurt | ayrfrٹ | Erfurt | Erfurt | PPLA | 218793 | تورنغن | 169.62 |  |  |
| fi | turku | ترکو | Turku | Turku | PPLA | 206655 | فنلندا الجنوبية الغربية | 150.32 |  |  |
| de | hagen | حاجین | Hagen | Hagen | PPLA3 | 198972 | شمال الراين-وستفاليا | 50.75 | wave | hagen-de |
| de | potsdam | pwٹsڈam | Potsdam | Potsdam | PPLA | 184754 | براندنبورغ | 26.65 |  |  |
| de | saarbruecken | زاربروکن | Saarbrücken | Saarbrücken | PPLA | 182971 | سارلاند | 154.97 |  |  |
| se | linkoeping | لنشوپنگ | Linköping | Linköping | PPLA | 166673 | أوسترغوتلاند | 173.81 |  |  |
| de | leverkusen | لورکوزن | Leverkusen | Leverkusen | PPLA3 | 162738 | شمال الراين-وستفاليا | 10.46 |  |  |
| at | salzburg | salzbwrګ | Salzburg | Salzburg | PPLA | 157245 | سالزبورغ | 251.85 | wave | salzburg-at |
| fi | jyvaeskylae | جیواسکیلا | Jyväskylä | Jyväskylä | PPLA | 148744 | فنلندا الوسطى | 234.13 |  |  |
| no | stavanger | sٹawnjr | Stavanger | Stavanger | PPLA | 148682 | روغالاند | 302.43 |  |  |
| dk | aalborg | albwrګ | Aalborg | Aalborg | PPLA | 142937 | جوتلاند الشمالية | 223.37 |  |  |
| se | vaesteras | wysٹras | Västerås | Västerås | PPLA | 127799 | فاسترمانلاند | 91.36 |  |  |
| de | recklinghausen | رکلینگهاوزن | Recklinghausen | Recklinghausen | PPLA3 | 122438 | شمال الراين-وستفاليا | 52.03 |  |  |
| fi | lahti | لاختی | Lahti | Lahti | PPLA | 121622 | باياتها-هامي | 98.63 | wave | lahti-fi |
| it | siracusa | سائراکوز | Siracusa | Siracusa | PPLA2 | 121605 | صقلية | 429.04 |  |  |
| de | bottrop | بتتروپ | Bottrop | Bottrop | PPLA3 | 119909 | شمال الراين-وستفاليا | 34.65 |  |  |
| no | kristiansand | krystyansynڈ | Kristiansand | Kristiansand | PPLA | 117237 | أغدر | 251.93 |  |  |
| se | joenkoeping | جنکوپنگ | Jönköping | Jönköping | PPLA | 112766 | يونشوبينغ | 284.76 |  |  |
| de | jena | جینا | Jena | Jena | PPLA3 | 104712 | تورنغن | 168.21 |  |  |
| de | gera | گرا | Gera | Gera | PPLA3 | 104659 | تورنغن | 174.20 | wave | gera-de |
| it | piacenza | پیاچنزا | Piacenza | Piacenza | PPLA2 | 103607 | إميليا رومانيا | 60.41 |  |  |
| de | erlangen | ارلانگن | Erlangen | Erlangen | PPLA3 | 102675 | بافاريا | 16.22 |  |  |
| at | klagenfurt-am-woerthersee | klagnfrٹ am wrtھrsy | Klagenfurt am Wörthersee | Klagenfurt am Wörthersee | PPLA | 100316 | كارينثيا | 234.98 |  |  |
| se | lulea | للیہ | Luleå | Luleå | PPLA | 77832 | نوربوتن | 726.17 |  |  |
| ch | sankt-gallen | synٹ gyln | Sankt Gallen | Sankt Gallen | PPLA | 75833 | سانت غالن | 62.92 | wave | sankt-gallen-ch |
| se | gaevle | gawlے | Gävle | Gävle | PPLA | 74884 | غافلبرغ | 158.20 |  |  |
| dk | vejle | wyjlے | Vejle | Vejle | PPLA | 60231 | جنوب الدنمارك | 190.08 |  |  |
| no | sarpsborg | سارپس برگ | Sarpsborg | Sarpsborg | PPLA | 59038 | أوستفولد | 72.88 |  |  |
| no | tonsberg | تونسبرگ | Tønsberg | Tønsberg | PPLA | 55387 | فيستفولد | 74.44 |  |  |
| no | skien | اسکین | Skien | Skien | PPLA | 50595 | تيليمارك | 101.39 |  |  |
| se | oestersund | asٹrsnډ | Östersund | Östersund | PPLA | 49806 | جامتلاند | 465.63 |  |  |
| ch | bellinzona | بلینتسونا | Bellinzona | Bellinzona | PPLA | 43220 | تيتشينو | 136.55 |  |  |
| dk | viborg | wybwrګ | Viborg | Viborg | PPLA | 41239 | جوتلاند الوسطى | 214.68 | wave | viborg-dk |
| ch | zug | zګ | Zug | Zug | PPLA | 30542 | تسوغ | 22.81 | wave | zug-ch |
| no | lillehammer | lylے ہymr | Lillehammer | Lillehammer | PPLA | 29011 | إنلاندت | 134.49 |  |  |
| ch | frauenfeld | frawnfylڈ | Frauenfeld | Frauenfeld | PPLA | 25607 | تورغاو | 33.55 | wave | frauenfeld-ch |
| no | molde | mwlڈے | Molde | Molde | PPLA | 22410 | مور أوغ رومسدال | 367.75 |  |  |
| at | sankt-poelten | synkٹ pwlٹn | Sankt Pölten | Sankt Pölten | PPLA | 21911 | النمسا السفلى | 54.58 |  |  |
| ch | herisau | اریزو | Herisau | Herisau | PPLA | 15744 | أبنزل أوسرهودن | 55.53 |  |  |
| no | steinkjer | sٹyn kjr | Steinkjer | Steinkjer | PPLA | 13060 | تروندلاغ | 457.65 |  |  |
| ch | liestal | lysٹl | Liestal | Liestal | PPLA | 12832 | بازل-لاندشافت | 61.89 |  |  |
| is | isafjoerdur | ایسافجرویر | Ísafjörður | Ísafjörður | PPLA | 2736 | فيستفيوردير | 221.53 |  |  |
| no | hermansverk | هرمانسورک | Hermansverk | Hermansverk | PPLA | 2144 | فيستلاند | 255.82 |  |  |

## mixed_latin (8)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| se | gothenburg | gwtھn brg | Gothenburg | Gothenburg | PPLA | 608462 | فاسترا غوتالاند | 397.39 |  |  |
| de | dresden | drێsdn | Dresden | Dresden | PPLA | 564904 | سكسونيا | 164.96 |  |  |
| se | halmstad | halm sټad | Halmstad | Halmstad | PPLA | 70480 | هالاند | 425.74 |  |  |
| se | karlstad | karl sټad | Karlstad | Karlstad | PPLA | 61492 | فارملاند | 258.75 | wave | karlstad-se |
| dk | hillerod | hylrwډ | Hillerød | Hillerød | PPLA | 35357 | منطقة العاصمة | 32.61 |  |  |
| se | haernoesand | harnwsnډ | Härnösand | Härnösand | PPLA | 25012 | فاسترنورلاند | 367.34 |  |  |
| ch | solothurn | swlwtھrn | Solothurn | Solothurn | PPLA | 16777 | زولوتورن | 78.06 |  |  |
| ch | stans | sټans | Stans | Stans | PPLA | 8393 | نيدفالدن | 48.43 | wave | stans-ch |

## mixed_unknown (1)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| de | fuerth | فرتھ | Fürth | Fürth | PPL | 132036 | بافاريا | 6.90 | wave | fuerth-de |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
