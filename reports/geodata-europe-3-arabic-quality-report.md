# Europe-3 — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E — Strategy A + Stage 3.5 ar-quality gate
**Generated**: 2026-05-16T08:16:13.856Z

## What this report tells you

Same as Europe-1A: Eastern Europe + Balkans + Baltics + Mediterranean islands have Arabic-name candidates
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
| PL | 13 | 0 | 0 | 11 | 2 | 0 | **0** | **13** |
| CZ | 5 | 0 | 0 | 5 | 0 | 0 | **0** | **5** |
| SK | 4 | 0 | 3 | 1 | 0 | 0 | **0** | **4** |
| HU | 14 | 0 | 0 | 14 | 0 | 0 | **0** | **14** |
| RO | 13 | 0 | 2 | 10 | 1 | 0 | **0** | **13** |
| BG | 11 | 0 | 3 | 6 | 2 | 0 | **0** | **11** |
| GR | 2 | 0 | 0 | 2 | 0 | 0 | **0** | **2** |
| HR | 8 | 0 | 5 | 3 | 0 | 0 | **1** | **7** |
| SI | 175 | 0 | 66 | 89 | 20 | 0 | **50** | **125** |
| RS | 1 | 0 | 1 | 0 | 0 | 0 | **0** | **1** |
| BA | 4 | 0 | 0 | 4 | 0 | 0 | **0** | **4** |
| ME | 17 | 0 | 4 | 9 | 4 | 0 | **2** | **15** |
| MK | 56 | 0 | 23 | 33 | 0 | 0 | **7** | **49** |
| AL | 3 | 0 | 0 | 1 | 2 | 0 | **0** | **3** |
| XK | 5 | 0 | 0 | 5 | 0 | 0 | **0** | **5** |
| EE | 9 | 0 | 0 | 9 | 0 | 0 | **0** | **9** |
| LV | 21 | 0 | 2 | 16 | 3 | 0 | **2** | **19** |
| LT | 2 | 0 | 0 | 2 | 0 | 0 | **0** | **2** |
| MT | 35 | 0 | 21 | 14 | 0 | 0 | **20** | **15** |
| CY | 1 | 0 | 0 | 1 | 0 | 0 | **0** | **1** |
| **TOTAL** | **399** | **0** | **130** | **235** | **34** | **0** | **82** | **317** |

## Collision summary

| Collision type | Count (high-tier only) |
| --- | ---: |
| Within Europe-3 wave (ES↔PT same slug) | 87 |
| Against existing curated (other cc owns slug already) | 2 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- |
| pl | rybnik | rybnik-pl | ربنیک | 142510 |
| sk | kosice | kosice-sk | كوشيتسه | 225044 |
| sk | zilina | zilina-sk | جيلينا | 81219 |
| sk | trnava | trnava-sk | ترنافا | 62806 |
| sk | trencin | trencin-sk | ترنچین | 58278 |
| hu | eger | eger-hu | اگر | 53876 |
| ro | galati | galati-ro | غالاتس | 217851 |
| ro | targoviste | targoviste-ro | targwwyshtے | 66965 |
| ro | slatina | slatina-ro | ستیئا | 63487 |
| bg | varna | varna-bg | فارنا | 318737 |
| bg | ruse | ruse-bg | rwsې | 121168 |
| bg | gabrovo | gabrovo-bg | غابروفو | 48133 |
| bg | vidin | vidin-bg | فيدن | 34797 |
| hr | karlovac | karlovac-hr | كارلوفاتش | 41869 |
| hr | sibenik | sibenik-hr | سیبنیک | 31115 |
| hr | koprivnica | koprivnica-hr | كوبريفنيتسا | 22262 |
| hr | pozega | pozega-hr | بوزيغا | 16867 |
| hr | cakovec | cakovec-hr | تشاكوفيتش | 15078 |
| si | velenje | velenje-si | wylnjے | 24327 |
| si | kamnik | kamnik-si | كامنيك | 13644 |
| si | jesenice | jesenice-si | jysynchے | 13255 |
| si | brezice | brezice-si | brzychې | 6843 |
| si | zalec | zalec-si | زالتس | 4943 |
| si | ruse | ruse-si | rwsے | 4503 |
| si | trzic | trzic-si | تريزيتش | 3670 |
| si | ribnica | ribnica-si | ريبنيتسا | 3604 |
| si | lasko | lasko-si | لاسكو | 3456 |
| si | metlika | metlika-si | متلیکا | 3206 |
| si | zelezniki | zelezniki-si | زلیزنیکی | 3075 |
| si | race | race-si | rachے | 2693 |
| si | muta | muta-si | موتا | 2300 |
| si | vojnik | vojnik-si | فويينيك | 2292 |
| si | store | store-si | sٹwr | 2257 |
| si | borovnica | borovnica-si | بوروفنيتسا | 2162 |
| si | semic | semic-si | سمیچ | 2000 |
| si | naklo | naklo-si | ناكلو | 1716 |
| si | vodice | vodice-si | wwdytsې | 1589 |
| si | turnisce | turnisce-si | twrnyshې | 1509 |
| si | miren | miren-si | ميرين | 1460 |
| si | moravce | moravce-si | mwrawchے | 957 |
| si | vransko | vransko-si | برانسکو | 808 |
| si | kostel | kostel-si | kwsٹl | 637 |
| si | kobilje | kobilje-si | kwbyljے | 542 |
| si | markovci | markovci-si | ماركوفتسي | 495 |
| si | bukovica | bukovica-si | bwkwwkہ | 475 |
| si | breznica | breznica-si | برازنيتسا | 470 |
| si | luce | luce-si | lwchے | 413 |
| si | tisina | tisina-si | تيسينا | 412 |
| si | tabor | tabor-si | تابور | 406 |
| si | kuzma | kuzma-si | كوزما | 375 |
| si | nova-vas | nova-vas-si | نوا واس | 293 |
| rs | kragujevac | kragujevac-rs | كراغوييفاتس | 147473 |
| ba | zenica | zenica-ba | زنیتسا | 164423 |
| ba | tuzla | tuzla-ba | tzlہ | 142486 |
| me | podgorica | podgorica-me | pۆdgۆrytsa | 236852 |
| me | niksic | niksic-me | نیکشیچ | 58212 |
| me | bar | bar-me | بار | 17727 |
| me | bijelo-polje | bijelo-polje-me | byjylw pwljې | 15400 |
| me | plav | plav-me | پلاو | 3615 |
| me | zabljak | zabljak-me | زابليك | 1937 |
| me | pluzine | pluzine-me | پلوژینه | 1494 |
| mk | kumanovo | kumanovo-mk | كومانوفو | 75051 |
| mk | prilep | prilep-mk | بريليب | 73814 |
| mk | tetovo | tetovo-mk | تتوفو | 63176 |
| mk | veles | veles-mk | فيليس | 57873 |
| mk | ohrid | ohrid-mk | awہrd | 42033 |
| mk | struga | struga-mk | sٹrwga | 37387 |
| mk | kochani | kochani-mk | كوتشاني | 34258 |
| mk | vinica | vinica-mk | فينيتسا | 18218 |
| mk | resen | resen-mk | رسن | 16539 |
| mk | ilinden | ilinden-mk | إيليندن | 16406 |
| mk | vasilevo | vasilevo-mk | فاسيليفو | 12382 |
| mk | novo-selo | novo-selo-mk | نوفو سيلو | 11818 |
| mk | kratovo | kratovo-mk | كراتوفو | 10288 |
| mk | petrovec | petrovec-mk | pyٹrwwyts | 8298 |
| mk | krusevo | krusevo-mk | كروسيفو | 5211 |
| mk | mogila | mogila-mk | موغيلا | 4392 |
| mk | rosoman | rosoman-mk | روسومان | 4106 |
| mk | rankovce | rankovce-mk | rnkwwtsے | 4071 |
| mk | zelenikovo | zelenikovo-mk | زلنیکوو | 4020 |
| mk | gradsko | gradsko-mk | غرادسكو | 3737 |
| mk | konce | konce-mk | kwntsے | 3475 |
| mk | caska | caska-mk | تشاسكا | 2878 |
| mk | novaci | novaci-mk | نواتسی بلدیہ | 2357 |
| al | korce | korce-al | kwrchې | 58259 |
| xk | mitrovice | mitrovice-xk | mytrwwychے | 107045 |
| mt | victoria | victoria-mt | wykٹwrya | 6596 |

### Curated collisions (high-tier — slug already owned by another country)

| cc | slug | existingCc | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- | --- |
| ro | alexandria | eg | alexandria-ro | أليكساندريا | 40390 |
| mt | safi | ma | safi-mt | صافي | 2280 |

## arabic_only (130)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bg | varna | فارنا | Varna | Varna | PPLA | 318737 |  | 377.81 | wave | varna-bg |
| sk | kosice | كوشيتسه | Košice | Košice | PPLA | 225044 | كوشيتسه | 312.56 | wave | kosice-sk |
| ro | galati | غالاتس | Galaţi | Galaţi | PPLA | 217851 |  | 190.06 | wave | galati-ro |
| rs | kragujevac | كراغوييفاتس | Kragujevac | Kragujevac | PPLA2 | 147473 |  | 93.33 | wave | kragujevac-rs |
| sk | zilina | جيلينا | Žilina | Žilina | PPLA | 81219 | جيلينا | 169.18 | wave | zilina-sk |
| mk | kumanovo | كومانوفو | Kumanovo | Kumanovo | PPLA | 75051 |  |  | wave | kumanovo-mk |
| mk | prilep | بريليب | Prilep | Prilep | PPLA | 73814 |  |  | wave | prilep-mk |
| mk | tetovo | تتوفو | Tetovo | Tetovo | PPLA | 63176 |  |  | wave | tetovo-mk |
| sk | trnava | ترنافا | Trnava | Trnava | PPLA | 62806 | ترنافا | 43.62 | wave | trnava-sk |
| mk | veles | فيليس | Veles | Veles | PPLA | 57873 |  |  | wave | veles-mk |
| bg | gabrovo | غابروفو | Gabrovo | Gabrovo | PPLA | 48133 |  | 164.09 | wave | gabrovo-bg |
| hr | karlovac | كارلوفاتش | Karlovac | Karlovac | PPLA | 41869 |  | 49.19 | wave | karlovac-hr |
| ro | alexandria | أليكساندريا | Alexandria | Alexandria | PPLA | 40390 |  | 78.68 | curated | alexandria-ro |
| bg | vidin | فيدن | Vidin | Vidin | PPLA | 34797 |  | 148.20 | wave | vidin-bg |
| mk | kochani | كوتشاني | Kochani | Kochani | PPLA | 34258 |  |  | wave | kochani-mk |
| hr | koprivnica | كوبريفنيتسا | Koprivnica | Koprivnica | PPLA | 22262 |  | 76.11 | wave | koprivnica-hr |
| mk | vinica | فينيتسا | Vinica | Vinica | PPLA | 18218 |  |  | wave | vinica-mk |
| me | bar | بار | Bar | Bar | PPLA | 17727 |  |  | wave | bar-me |
| hr | pozega | بوزيغا | Požega | Požega | PPLA | 16867 |  | 142.69 | wave | pozega-hr |
| mk | resen | رسن | Resen | Resen | PPLA | 16539 |  |  | wave | resen-mk |
| mk | ilinden | إيليندن | Ilinden | Ilinden | PPLA | 16406 |  |  | wave | ilinden-mk |
| hr | cakovec | تشاكوفيتش | Čakovec | Čakovec | PPLA | 15078 |  | 72.28 | wave | cakovec-hr |
| si | kamnik | كامنيك | Kamnik | Kamnik | PPLA | 13644 |  | 20.50 | wave | kamnik-si |
| mk | vasilevo | فاسيليفو | Vasilevo | Vasilevo | PPLA | 12382 |  |  | wave | vasilevo-mk |
| mk | novo-selo | نوفو سيلو | Novo Selo | Novo Selo | PPLA | 11818 |  |  | wave | novo-selo-mk |
| mk | kratovo | كراتوفو | Kratovo | Kratovo | PPLA | 10288 |  |  | wave | kratovo-mk |
| mk | krusevo | كروسيفو | Krusevo | Krusevo | PPLA | 5211 |  |  | wave | krusevo-mk |
| si | zalec | زالتس | Žalec | Žalec | PPLA | 4943 |  | 55.18 | wave | zalec-si |
| mt | ghaxaq | غاكساق | Għaxaq | Għaxaq | PPLA | 4860 |  | 5.52 |  |  |
| mt | balzan | بالزان | Balzan | Balzan | PPLA | 4689 |  | 5.64 |  |  |
| lv | valka | فالكا | Valka | Valka | PPLA | 4615 |  |  |  |  |
| mk | plasnica | بلاسنيتسا | Plasnica | Plasnica | PPLA | 4574 |  |  |  |  |
| si | ilirska-bistrica | إيليرسكا بيستريتسا | Ilirska Bistrica | Ilirska Bistrica | PPLA | 4553 |  | 58.02 |  |  |
| mk | mogila | موغيلا | Mogila | Mogila | PPLA | 4392 |  |  | wave | mogila-mk |
| si | piran | بيران | Piran | Piran | PPLA | 4192 |  | 93.38 |  |  |
| mk | rosoman | روسومان | Rosoman | Rosoman | PPLA | 4106 |  |  | wave | rosoman-mk |
| si | cerknica | تسركنيتسا | Cerknica | Cerknica | PPLA | 4018 |  | 30.95 |  |  |
| hr | pazin | بازين | Pazin | Pazin | PPLA | 3981 |  | 171.50 |  |  |
| mt | nadur | نادور | Nadur | Nadur | PPLA | 3933 |  | 25.17 |  |  |
| si | trzin | تريزين | Trzin | Trzin | PPLA | 3925 |  | 9.83 |  |  |
| mk | karbinci | كاربنتسي | Karbinci | Karbinci | PPLA | 3900 |  |  |  |  |
| mt | pembroke | بيمبروك | Pembroke | Pembroke | PPLA | 3842 |  | 4.80 |  |  |
| mt | imgarr | إمغار | Imġarr | Imġarr | PPLA | 3802 |  | 13.71 |  |  |
| mk | valandovo | فالاندوفو | Valandovo | Valandovo | PPLA | 3798 |  |  |  |  |
| mk | gradsko | غرادسكو | Gradsko | Gradsko | PPLA | 3737 |  |  | wave | gradsko-mk |
| mt | dingli | دينجلي | Dingli | Dingli | PPLA | 3711 |  | 12.64 |  |  |
| mt | xaghra | خاغرا | Xagħra | Xagħra | PPLA | 3680 |  | 28.11 |  |  |
| si | trzic | تريزيتش | Tržič | Tržič | PPLA | 3670 |  | 37.27 | wave | trzic-si |
| si | ribnica | ريبنيتسا | Ribnica | Ribnica | PPLA | 3604 |  | 39.33 | wave | ribnica-si |
| si | ziri | زيري | Žiri | Žiri | PPLA | 3588 |  | 30.78 |  |  |
| si | tolmin | تولمين | Tolmin | Tolmin | PPLA | 3534 |  | 61.18 |  |  |
| si | lasko | لاسكو | Laško | Laško | PPLA | 3456 |  | 57.30 | wave | lasko-si |
| mt | l-iklin | إل إكلين | L-Iklin | L-Iklin | PPLA | 3422 |  | 5.48 |  |  |
| si | ankaran | أنكاران | Ankaran | Ankaran | PPLA | 3278 |  | 79.88 |  |  |
| si | mezica | ميزيتسا | Mežica | Mežica | PPLA | 3254 |  | 58.03 |  |  |
| mk | zrnovci | زرنوفتسي | Zrnovci | Zrnovci | PPLA | 3236 |  |  |  |  |
| mt | lija | ليجا | Lija | Lija | PPLA | 3202 |  | 6.16 |  |  |
| mt | gudja | غودجة | Gudja | Gudja | PPLA | 3184 |  | 5.43 |  |  |
| si | gornja-radgona | غرنيا رادغنا | Gornja Radgona | Gornja Radgona | PPLA | 3159 |  | 133.02 |  |  |
| si | lendava | لندافا | Lendava | Lendava | PPLA | 3129 |  | 159.72 |  |  |
| mt | ghajnsielem | غاجنسيليم | Għajnsielem | Għajnsielem | PPLA | 2931 |  | 24.91 |  |  |
| mk | caska | تشاسكا | Čaška | Čaška | PPLA | 2878 |  |  | wave | caska-mk |
| mt | hal-gharghur | حال غرغور | Hal Gharghur | Hal Gharghur | PPLA | 2857 |  | 6.36 |  |  |
| mk | lozovo | لوزوفو | Lozovo | Lozovo | PPLA | 2836 |  |  |  |  |
| mk | pehcevo | بيهتشيفو | Pehčevo | Pehčevo | PPLA | 2440 |  |  |  |  |
| mk | vevcani | فيفتشاني | Vevčani | Vevčani | PPLA | 2429 |  |  |  |  |
| mt | kirkop | كيركوب | Kirkop | Kirkop | PPLA | 2397 |  | 6.81 |  |  |
| si | polzela | بولزيلا | Polzela | Polzela | PPLA | 2351 |  | 49.90 |  |  |
| si | muta | موتا | Muta | Muta | PPLA | 2300 |  | 79.84 | wave | muta-si |
| si | vojnik | فويينيك | Vojnik | Vojnik | PPLA | 2292 |  | 66.81 | wave | vojnik-si |
| mt | safi | صافي | Safi | Safi | PPLA | 2280 |  | 7.80 | curated | safi-mt |
| si | ig | إيغ | Ig | Ig | PPLA | 2262 |  | 11.03 |  |  |
| si | ivancna-gorica | إيفانتشنا جوريتسا | Ivančna Gorica | Ivančna Gorica | PPLA | 2205 |  | 26.70 |  |  |
| si | radenci | رادنتسي | Radenci | Radenci | PPLA | 2201 |  | 134.38 |  |  |
| si | ormoz | أرموز | Ormož | Ormož | PPLA | 2174 |  | 132.65 |  |  |
| si | borovnica | بوروفنيتسا | Borovnica | Borovnica | PPLA | 2162 |  | 18.96 | wave | borovnica-si |
| si | pivka | بيفكا | Pivka | Pivka | PPLA | 2088 |  | 48.01 |  |  |
| me | zabljak | زابليك | Žabljak | Žabljak | PPLA | 1937 |  |  | wave | zabljak-me |
| mt | xghajra | خحايرا | Xgħajra | Xgħajra | PPLA | 1830 |  | 3.31 |  |  |
| si | vipava | فيبافا | Vipava | Vipava | PPLA | 1771 |  | 48.13 |  |  |
| mt | zebbug | زبّوج | Żebbuġ | Żebbuġ | PPLA | 1770 |  | 31.52 |  |  |
| si | naklo | ناكلو | Naklo | Naklo | PPLA | 1716 |  | 28.12 | wave | naklo-si |
| mt | sannat | ساننات | Sannat | Sannat | PPLA | 1681 |  | 28.17 |  |  |
| si | odranci | أودرانتسي | Odranci | Odranci | PPLA | 1641 |  | 148.39 |  |  |
| mt | kercem | كركيم | Kerċem | Kerċem | PPLA | 1627 |  | 30.36 |  |  |
| lv | varaklani | فاراكلاني | Varakļāni | Varakļāni | PPLA | 1619 |  |  |  |  |
| si | cerkno | تسركنو | Cerkno | Cerkno | PPLA | 1596 |  | 41.05 |  |  |
| si | vuzenica | فوزينيتسا | Vuzenica | Vuzenica | PPLA | 1580 |  | 78.43 |  |  |
| si | miren | ميرين | Miren | Miren | PPLA | 1460 |  | 71.65 | wave | miren-si |
| si | smartno-pri-litiji | سمارتنو بري ليتيجي | Šmartno pri Litiji | Šmartno pri Litiji | PPLA | 1444 |  | 26.20 |  |  |
| si | kranjska-gora | كرانجسكا جورا | Kranjska Gora | Kranjska Gora | PPLA | 1439 |  | 71.46 |  |  |
| si | mirna | مرنا | Mirna | Mirna | PPLA | 1398 |  | 44.52 |  |  |
| si | oplotnica | أوبلوتنيتسا | Oplotnica | Oplotnica | PPLA | 1352 |  | 81.12 |  |  |
| si | selnica-ob-dravi | سيلنيتسا أوب درافي | Selnica ob Dravi | Selnica ob Dravi | PPLA | 1348 |  | 93.69 |  |  |
| mt | gharb | غارب | Għarb | Għarb | PPLA | 1298 |  | 32.78 |  |  |
| si | kanal | كانال | Kanal | Kanal | PPLA | 1269 |  | 67.27 |  |  |
| si | kidricevo | كيدريتشيفو | Kidričevo | Kidričevo | PPLA | 1253 |  | 106.64 |  |  |
| si | ljubno-ob-savinji | ليوبنو أوب سافينيي | Ljubno ob Savinji | Ljubno ob Savinji | PPLA | 1104 |  | 40.66 |  |  |
| me | andrijevica | أندريجيفيتسا | Andrijevica | Andrijevica | PPLA | 1073 |  |  |  |  |
| si | zuzemberk | زوزيمبرك | Žužemberk | Žužemberk | PPLA | 1053 |  | 41.01 |  |  |
| si | pesnica | بيسنيتسا | Pesnica | Pesnica | PPLA | 913 |  | 108.73 |  |  |
| si | verzej | فيرزيي | Veržej | Veržej | PPLA | 903 |  | 140.15 |  |  |
| si | komenda | كوميندا | Komenda | Komenda | PPLA | 881 |  | 16.64 |  |  |
| si | velika-polana | فيليكا بولانا | Velika Polana | Velika Polana | PPLA | 870 |  | 152.58 |  |  |
| mt | munxar | منكسار | Munxar | Munxar | PPLA | 840 |  | 29.13 |  |  |
| si | kostanjevica-na-krki | كوستانيويتسا نا كركي | Kostanjevica na Krki | Kostanjevica na Krki | PPLA | 695 |  | 74.51 |  |  |
| si | komen | كومن | Komen | Komen | PPLA | 650 |  | 64.43 |  |  |
| si | mokronog | موكرونوج | Mokronog | Mokronog | PPLA | 637 |  | 50.67 |  |  |
| si | puconci | بوتسونتسي | Puconci | Puconci | PPLA | 633 |  | 145.72 |  |  |
| si | majsperk | مايسبيرك | Majšperk | Majšperk | PPLA | 606 |  | 100.00 |  |  |
| si | podcetrtek | بودتسيترتيك | Podčetrtek | Podčetrtek | PPLA | 578 |  | 84.85 |  |  |
| si | zgornja-kungota | زغورنيا كونغوتا | Zgornja Kungota | Zgornja Kungota | PPLA | 535 |  | 106.92 |  |  |
| mt | san-lawrenz | سان لورنز | San Lawrenz | San Lawrenz | PPLA | 530 |  | 32.93 |  |  |
| si | recica-ob-savinji | ريتسيتسا أوب سافينجي | Rečica ob Savinji | Rečica ob Savinji | PPLA | 516 |  | 42.83 |  |  |
| si | markovci | ماركوفتسي | Markovci | Markovci | PPLA | 495 |  | 115.72 | wave | markovci-si |
| si | breznica | برازنيتسا | Breznica | Breznica | PPLA | 470 |  | 46.22 | wave | breznica-si |
| si | cankova | تسانكوفا | Cankova | Cankova | PPLA | 446 |  | 137.74 |  |  |
| si | salovci | سالوفتسي | Šalovci | Šalovci | PPLA | 426 |  | 161.65 |  |  |
| si | tisina | تيسينا | Tišina | Tišina | PPLA | 412 |  | 138.78 | wave | tisina-si |
| si | tabor | تابور | Tabor | Tabor | PPLA | 406 |  | 44.04 | wave | tabor-si |
| si | kuzma | كوزما | Kuzma | Kuzma | PPLA | 375 |  | 148.48 | wave | kuzma-si |
| si | podvelka | بودفيلكا | Podvelka | Podvelka | PPLA | 343 |  | 86.47 |  |  |
| si | nova-vas | نوا واس | Nova Vas | Nova Vas | PPLA | 293 |  | 31.60 | wave | nova-vas-si |
| si | sveti-tomaz | سفيتي توماز | Sveti Tomaž | Sveti Tomaž | PPLA | 284 |  | 129.90 |  |  |
| si | skocjan | سكوتشيان | Škocjan | Škocjan | PPLA | 246 |  | 62.95 |  |  |
| si | makole | ماكوله | Makole | Makole | PPLA | 221 |  | 93.88 |  |  |
| si | sveti-jurij | سفيتي جوري | Sveti Jurij | Sveti Jurij | PPLA | 209 |  | 129.75 |  |  |
| si | osilnica | أوسيلنيتسا | Osilnica | Osilnica | PPLA | 87 |  | 60.55 |  |  |
| si | zavrc | زافرتس | Zavrč | Zavrč | PPLA | 73 |  | 124.45 |  |  |
| me | petnjica | بيتنيتسا | Petnjica | Petnjica | PPLA | - |  |  |  |  |

## mixed_script (235)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lv | riga | رىگا | Riga | Riga | PPLC | 742572 |  |  |  |  |
| ba | sarajevo | ساراجیوو | Sarajevo | Sarajevo | PPLC | 696731 |  |  |  |  |
| xk | pristina | prysٹyna | Pristina | Pristina | PPLC | 550000 |  |  |  |  |
| pl | gdansk | gڈansk | Gdańsk | Gdańsk | PPLA | 487371 | بوميرانيا | 283.47 |  |  |
| ro | iasi | ایاشی | Iaşi | Iaşi | PPLA | 378954 |  | 326.01 |  |  |
| ro | constanta | qstntynہ | Constanţa | Constanţa | PPLA | 317832 |  | 203.31 |  |  |
| pl | bialystok | byalsٹak | Białystok | Białystok | PPLA | 295683 | بودلاسي | 176.46 |  |  |
| cz | ostrava | asٹrawa | Ostrava | Ostrava | PPLA | 279791 |  | 276.29 |  |  |
| ba | banja-luka | بانجا لوکا | Banja Luka | Banja Luka | PPLA | 221106 |  |  |  |  |
| ro | targu-mures | tarګw mwrys | Târgu Mureş | Târgu Mureş | PPLA | 212752 |  | 264.28 |  |  |
| bg | burgas | brګas | Burgas | Burgas | PPLA | 210646 |  | 340.05 |  |  |
| pl | torun | ترونی | Toruń | Toruń | PPL | 196935 | كويافي-بومرانيا | 184.80 |  |  |
| pl | bytom | بیتوم | Bytom | Bytom | PPLA3 | 189186 | سيليزيا | 78.62 |  |  |
| pl | bielsko-biala | بیلسکو بیاوا | Bielsko-Biala | Bielsko-Biala | PPLA3 | 176515 | سيليزيا | 69.69 |  |  |
| lt | klaipeda | klaypyڈa | Klaipėda | Klaipėda | PPLA | 172292 |  | 286.14 |  |  |
| pl | olsztyn | awlszٹn | Olsztyn | Olsztyn | PPLA | 169793 | فارمينسكو-مازورسكي | 176.26 |  |  |
| ba | zenica | زنیتسا | Zenica | Zenica | PPLA2 | 164423 |  |  | wave | zenica-ba |
| hu | szeged | سکدین | Szeged | Szeged | PPLA | 160766 |  | 162.03 |  |  |
| hu | miskolc | مسکولس | Miskolc | Miskolc | PPLA | 154521 |  | 146.21 |  |  |
| hr | split | اسپلیت | Split | Split | PPLA | 149830 |  | 258.96 |  |  |
| pl | ruda-slaska | رودا شلوسکا | Ruda Śląska | Ruda Śląska | PPL | 146189 | سيليزيا | 80.49 |  |  |
| pl | rybnik | ربنیک | Rybnik | Rybnik | PPLA2 | 142510 | سيليزيا | 100.19 | wave | rybnik-pl |
| ba | tuzla | tzlہ | Tuzla | Tuzla | PPLA2 | 142486 |  |  | wave | tuzla-ba |
| pl | bielany | بیلانه | Bielany | Bielany | PPL | 131910 | مازوفيا | 8.72 |  |  |
| pl | tychy | تیشی | Tychy | Tychy | PPLA3 | 130000 | سيليزيا | 70.26 |  |  |
| hu | gyor | دیؤر | Győr | Győr | PPLA | 129301 |  | 107.37 |  |  |
| bg | stara-zagora | sٹara zaghwra | Stara Zagora | Stara Zagora | PPLA | 121582 |  | 192.33 |  |  |
| pl | dabrowa-gornicza | دومبرووه گورنیچا | Dąbrowa Górnicza | Dąbrowa Górnicza | PPL | 116971 | سيليزيا | 60.60 |  |  |
| hu | kecskemet | کچکمیت | Kecskemét | Kecskemét | PPLA | 109847 |  | 82.15 |  |  |
| xk | mitrovice | mytrwwychے | Mitrovicë | Mitrovicë | PPLA | 107045 |  |  | wave | mitrovice-xk |
| cz | liberec | لبریک | Liberec | Liberec | PPLA | 102951 |  | 88.51 |  |  |
| xk | gjakove | gjakwwے | Gjakovë | Gjakovë | PPLA | 94158 |  |  |  |  |
| cz | ceske-budejovice | syskے bwdyjwwys | České Budějovice | České Budějovice | PPLA | 93426 | أولومونتس | 122.46 |  |  |
| ro | ramnicu-valcea | رامنيكو فالچيا | Râmnicu Vâlcea | Râmnicu Vâlcea | PPLA | 93151 |  | 156.15 |  |  |
| cz | usti-nad-labem | asٹy naڈ labym | Ústí nad Labem | Ústí nad Labem | PPLA | 90378 |  | 71.14 |  |  |
| bg | sliven | اسلمیه | Sliven | Sliven | PPLA | 83740 |  | 245.48 |  |  |
| ro | drobeta-turnu-severin | اتلا دروبیتا ترنو | Drobeta-Turnu Severin | Drobeta-Turnu Severin | PPLA | 79865 |  | 274.35 |  |  |
| lv | daugavpils | daګawpls | Daugavpils | Daugavpils | PPLA | 78126 |  |  |  |  |
| hu | szombathely | سمباتهی | Szombathely | Szombathely | PPLA | 78025 |  | 184.56 |  |  |
| ro | targu-jiu | tarګw jyw | Târgu Jiu | Târgu Jiu | PPLA | 73545 |  | 233.19 |  |  |
| cy | larnaca | لارناکا | Larnaca | Larnaca | PPLA | 72000 |  | 36.86 |  |  |
| hu | szolnok | سلنوک | Szolnok | Szolnok | PPLA | 71285 |  | 94.13 |  |  |
| mk | bitola | bٹwla | Bitola | Bitola | PPLA | 69287 |  |  |  |  |
| ro | targoviste | targwwyshtے | Târgovişte | Târgovişte | PPLA | 66965 |  | 75.38 | wave | targoviste-ro |
| hu | tatabanya | تاتابانیا | Tatabánya | Tatabánya | PPLA | 65849 |  | 50.58 |  |  |
| bg | haskovo | خاسکوو | Haskovo | Haskovo | PPLA | 64564 |  | 202.32 |  |  |
| hu | kaposvar | کاپشوار | Kaposvár | Kaposvár | PPLA | 64280 |  | 157.13 |  |  |
| ro | alba-iulia | آلبا ایولیا | Alba Iulia | Alba Iulia | PPLA | 64227 |  | 268.57 |  |  |
| ro | slatina | ستیئا | Slatina | Slatina | PPLA | 63487 |  | 137.83 | wave | slatina-ro |
| hu | zalaegerszeg | زالائگرسگ | Zalaegerszeg | Zalaegerszeg | PPLA | 61898 |  | 181.56 |  |  |
| hu | bekescsaba | بیکیسچابا | Békéscsaba | Békéscsaba | PPLA | 59732 |  | 180.33 |  |  |
| xk | ferizaj | فریزاج | Ferizaj | Ferizaj | PPLA | 59504 |  |  |  |  |
| sk | trencin | ترنچین | Trenčín | Trenčín | PPLA | 58278 | ترنتشين | 107.88 | wave | trencin-sk |
| me | niksic | نیکشیچ | Nikšić | Nikšić | PPLA | 58212 |  |  | wave | niksic-me |
| hu | veszprem | وسپریم | Veszprém | Veszprém | PPLA | 56927 |  | 96.28 |  |  |
| lv | jelgava | jlګawa | Jelgava | Jelgava | PPLA | 54834 |  |  |  |  |
| hu | eger | اگر | Eger | Eger | PPLA | 53876 |  | 109.44 | wave | eger-hu |
| cz | jihlava | jہlawa | Jihlava | Jihlava | PPLA | 50108 | زلين | 112.15 |  |  |
| ro | sfantu-gheorghe | sfantw gywrjے | Sfântu Gheorghe | Sfântu Gheorghe | PPLA | 50080 |  | 162.05 |  |  |
| xk | peje | pyjے | Pejë | Pejë | PPLA | 48962 |  |  |  |  |
| mk | shtip | shٹp | Shtip | Shtip | PPLA | 48279 |  |  |  |  |
| bg | montana | mwnٹana | Montana | Montana | PPLA | 47445 |  | 79.94 |  |  |
| bg | kyustendil | kywsٹndl | Kyustendil | Kyustendil | PPLA | 46856 |  | 69.21 |  |  |
| mk | centar-zupa | synٹr zhwpa | Centar Župa | Centar Župa | PPLA | 45412 |  |  |  |  |
| hr | slavonski-brod | اسلاونسکی برد | Slavonski Brod | Slavonski Brod | PPLA | 45005 |  | 174.43 |  |  |
| mk | ohrid | awہrd | Ohrid | Ohrid | PPLA | 42033 |  |  | wave | ohrid-mk |
| gr | corfu | شهر کورفو | Corfu | Corfu | PPLA | 40047 |  | 376.95 |  |  |
| mk | struga | sٹrwga | Struga | Struga | PPLA | 37387 |  |  | wave | struga-mk |
| hu | salgotarjan | سالگوتاریئن | Salgótarján | Salgótarján | PPLA | 34627 |  | 87.81 |  |  |
| hu | szekszard | سکسارد | Szekszárd | Szekszárd | PPLA | 34174 |  | 130.35 |  |  |
| mk | strumica | sٹrwmyka | Strumica | Strumica | PPLA | 33825 |  |  |  |  |
| lv | ventspils | wynٹspls | Ventspils | Ventspils | PPLA | 32723 |  |  |  |  |
| hr | sibenik | سیبنیک | Šibenik | Šibenik | PPLA | 31115 |  | 231.47 | wave | sibenik-hr |
| gr | mytilene | موتیلنه | Mytilene | Mytilene | PPLA | 28322 |  | 275.84 |  |  |
| lv | rezekne | rzyknے | Rēzekne | Rēzekne | PPLA | 26429 |  |  |  |  |
| mk | zelino | زلینو | Zelino | Zelino | PPLA | 25422 |  |  |  |  |
| mk | radovis | ryڈwfs | Radovis | Radovis | PPLA | 24984 |  |  |  |  |
| si | novo-mesto | nww mysٹw | Novo Mesto | Novo Mesto | PPLA | 24446 |  | 58.49 |  |  |
| si | velenje | wylnjے | Velenje | Velenje | PPLA | 24327 |  | 57.42 | wave | velenje-si |
| mt | mosta | mwsٹa | Mosta | Mosta | PPLA | 23482 |  | 8.10 |  |  |
| al | gjirokaster | ارجیر | Gjirokastër | Gjirokastër | PPLA | 23437 |  |  |  |  |
| mk | tearce | tyarsے | Tearce | Tearce | PPLA | 23096 |  |  |  |  |
| lv | ogre | awګry | Ogre | Ogre | PPLA | 22767 |  |  |  |  |
| lt | taurage | tawrgے | Taurage | Taurage | PPLA | 21203 |  | 200.90 |  |  |
| mk | negotino | nygwٹynw | Negotino | Negotino | PPLA | 19515 |  |  |  |  |
| me | pljevlja | پلیفلیا | Pljevlja | Pljevlja | PPLA | 19489 |  |  |  |  |
| mk | studenicani | sٹwڈnykany | Studeničani | Studeničani | PPLA | 18219 |  |  |  |  |
| me | budva | bڈwa | Budva | Budva | PPLA | 18000 |  |  |  |  |
| si | ptuj | pٹwj | Ptuj | Ptuj | PPLA | 17984 |  | 112.43 |  |  |
| mk | delcevo | دلچیووو | Delcevo | Delcevo | PPLA | 17415 |  |  |  |  |
| mt | qormi | آورمی | Qormi | Qormi | PPLA | 16801 |  | 4.61 |  |  |
| mk | bogovinje | bwgwwnjے | Bogovinje | Bogovinje | PPLA | 15166 |  |  |  |  |
| ee | rakvere | راکوره | Rakvere | Rakvere | PPLA | 14984 |  | 91.36 |  |  |
| lv | sigulda | sygwlڈa | Sigulda | Sigulda | PPLA | 14757 |  |  |  |  |
| mk | sveti-nikole | swyty nkwlے | Sveti Nikole | Sveti Nikole | PPLA | 13292 |  |  |  |  |
| si | jesenice | jysynchے | Jesenice | Jesenice | PPLA | 13255 |  | 53.91 | wave | jesenice-si |
| si | domzale | دمژاله | Domžale | Domžale | PPLA | 13204 |  | 11.26 |  |  |
| si | nova-gorica | نوا گریتسا | Nova Gorica | Nova Gorica | PPLA | 13031 |  | 67.17 |  |  |
| mk | arachinovo | آراچینوو | Arachinovo | Арачиново | PPLA | 12800 |  |  |  |  |
| mk | probishtip | prwbshٹp | Probishtip | Probishtip | PPLA | 12702 |  |  |  |  |
| ee | kuressaare | کورساره | Kuressaare | Kuressaare | PPLA | 12698 |  | 185.00 |  |  |
| ee | haapsalu | هاپسالو | Haapsalu | Haapsalu | PPLA | 11805 |  | 88.48 |  |  |
| ee | valga | والگا، استونی | Valga | Valga | PPLA | 11792 |  | 199.12 |  |  |
| si | skofja-loka | skwfja lwkہ | Škofja Loka | Škofja Loka | PPLA | 11619 |  | 19.56 |  |  |
| mt | mellieha | mlyہa | Mellieħa | Mellieħa | PPLA | 11389 |  | 15.12 |  |  |
| si | murska-sobota | مورسکا سوبوتا | Murska Sobota | Murska Sobota | PPLA | 11107 |  | 144.14 |  |  |
| mt | zurrieq | زریق | Żurrieq | Żurrieq | PPLA | 10962 |  | 8.46 |  |  |
| ee | johvi | یووی | Jõhvi | Jõhvi | PPLA | 10130 |  | 151.24 |  |  |
| mt | marsaskala | مارسا سکالا | Marsaskala | Marsaskala | PPLA | 10024 |  | 6.24 |  |  |
| lv | kuldiga | kwlڈyga | Kuldīga | Kuldīga | PPLA | 9863 |  |  |  |  |
| si | postojna | pwsٹwjna | Postojna | Postojna | PPLA | 9605 |  | 38.63 |  |  |
| lv | saldus | salڈs | Saldus | Saldus | PPLA | 9553 |  |  |  |  |
| mk | sopiste | swpshtے | Sopište | Sopište | PPLA | 9460 |  |  |  |  |
| mk | rostusa | rwsٹwsa | Rostusa | Rostusa | PPLA | 9147 |  |  |  |  |
| mk | vrapciste | wrapchshtے | Vrapčište | Vrapčište | PPLA | 8652 |  |  |  |  |
| mk | chucher-sandevo | chwchr-sanڈywww | Chucher-Sandevo | Chucher-Sandevo | PPLA | 8646 |  |  |  |  |
| mk | bogdanci | bwgڈanchy | Bogdanci | Bogdanci | PPLA | 8636 |  |  |  |  |
| mt | tarxien | تارشیئن | Tarxien | Tarxien | PPLA | 8627 |  | 3.70 |  |  |
| si | sentilj-v-slov-goricah | synٹlj ڈblyw slww gwrchaہ | Šentilj v Slov. Goricah | Šentilj v Slov. Goricah | PPLA | 8452 |  | 111.83 |  |  |
| si | vrhnika | wہnyka | Vrhnika | Vrhnika | PPLA | 8413 |  | 19.32 |  |  |
| mk | petrovec | pyٹrwwyts | Ibraimovo | Петровец | PPLA | 8298 |  |  | wave | petrovec-mk |
| mk | makedonska-kamenica | مقدونسکا کامنیتسا | Makedonska Kamenica | Makedonska Kamenica | PPLA | 8114 |  |  |  |  |
| si | kocevje | kwchywjے | Kočevje | Kočevje | PPLA | 8113 |  | 53.57 |  |  |
| si | slovenska-bistrica | slwwnska bsٹrytsہ | Slovenska Bistrica | Slovenska Bistrica | PPLA | 7454 |  | 90.24 |  |  |
| lv | ludza | lڈza | Ludza | Ludza | PPLA | 7332 |  |  |  |  |
| mk | jegunovce | jygwnwftsے | Jegunovce | Jegunovce | PPLA | 7313 |  |  |  |  |
| si | slovenj-gradec | slwwnj gryڈyk | Slovenj Gradec | Slovenj Gradec | PPLA | 7249 |  | 67.24 |  |  |
| si | grosuplje | گرسوپلیه | Grosuplje | Grosuplje | PPLA | 7098 |  | 16.32 |  |  |
| si | ravne-na-koroskem | rawnے na kwrwskym | Ravne na Koroškem | Ravne na Koroškem | PPLA | 6979 |  | 64.79 |  |  |
| si | ajdovscina | ayڈwwschyna | Ajdovščina | Ajdovščina | PPLA | 6843 |  | 49.85 |  |  |
| lv | adazi | آدازی | Ādaži | Ādaži | PPLA | 6734 |  |  |  |  |
| mt | victoria | wykٹwrya | Victoria | Victoria | PPLA | 6596 |  | 29.47 | wave | victoria-mt |
| lv | madona | myڈwna | Madona | Madona | PPLA | 6575 |  |  |  |  |
| lv | limbazi | لمبازی | Limbaži | Limbaži | PPLA | 6517 |  |  |  |  |
| si | litija | lyٹyja | Litija | Litija | PPLA | 6505 |  | 24.39 |  |  |
| si | zagorje-ob-savi | zaګwrjې awb sawy | Zagorje ob Savi | Zagorje ob Savi | PPLA | 6439 |  | 38.78 |  |  |
| ee | jogeva | یوگاوا | Jõgeva | Jõgeva | PPLA | 6396 |  | 121.11 |  |  |
| si | sezana | syzanہ | Sežana | Sežana | PPLA | 6037 |  | 62.38 |  |  |
| si | medvode | mydwwڈے | Medvode | Medvode | PPLA | 5380 |  | 11.97 |  |  |
| si | bled | blyڈ | Bled | Bled | PPLA | 5181 |  | 45.81 |  |  |
| ee | rapla | رپلا | Rapla | Rapla | PPLA | 5132 |  | 47.80 |  |  |
| ee | polva | پولوا | Põlva | Põlva | PPLA | 5115 |  | 203.16 |  |  |
| si | rogaska-slatina | rwګaska slatyna | Rogaška Slatina | Rogaška Slatina | PPLA | 5111 |  | 89.58 |  |  |
| lv | smiltene | smylٹyn | Smiltene | Smiltene | PPLA | 5073 |  |  |  |  |
| si | sentjur | synٹjwr | Šentjur | Šentjur | PPLA | 4940 |  | 70.98 |  |  |
| si | slovenske-konjice | slwwnskے kwnjytsے | Slovenske Konjice | Slovenske Konjice | PPLA | 4869 |  | 77.19 |  |  |
| si | sevnica | sywntsہ | Sevnica | Sevnica | PPLA | 4660 |  | 62.82 |  |  |
| si | prevalje | prywaljے | Prevalje | Prevalje | PPLA | 4643 |  | 63.12 |  |  |
| si | ruse | rwsے | Ruše | Ruše | PPLA | 4503 |  | 94.51 | wave | ruse-si |
| mk | demir-kapija | دمیر کاپیجا | Demir Kapija | Demir Kapija | PPLA | 4451 |  |  |  |  |
| mk | staro-nagorichane | sٹarw nagwrychanے | Nagorican i Vjeter | Старо Нагоричане | PPLA | 4112 |  |  |  |  |
| mk | rankovce | rnkwwtsے | Rankovce | Rankovce | PPLA | 4071 |  |  | wave | rankovce-mk |
| mk | zelenikovo | زلنیکوو | Zelenikovo | Zelenikovo | PPLA | 4020 |  |  | wave | zelenikovo-mk |
| si | miklavz-na-dravskem-polju | mklawz na ڈrawskym pwljw | Miklavž na Dravskem Polju | Miklavž na Dravskem Polju | PPLA | 3854 |  | 104.28 |  |  |
| me | tuzi | توزی | Tuzi | Tuzi | PPLA | 3789 |  |  |  |  |
| si | sempeter-pri-gorici | sympyٹr pry gwrychy | Šempeter pri Gorici | Šempeter pri Gorici | PPLA | 3694 |  | 68.28 |  |  |
| mt | marsaxlokk | مارسکسلوک | Marsaxlokk | Marsaxlokk | PPLA | 3660 |  | 6.81 |  |  |
| si | preddvor | pryڈwwr | Preddvor | Preddvor | PPLA | 3659 |  | 28.07 |  |  |
| me | plav | پلاو | Plav | Plav | PPLA | 3615 |  |  | wave | plav-me |
| mk | konce | kwntsے | Konče | Konče | PPLA | 3475 |  |  | wave | konce-mk |
| si | ljutomer | lywٹwmr | Ljutomer | Ljutomer | PPLA | 3460 |  | 139.77 |  |  |
| mk | star-dojran | sٹar ڈwjran | Star Dojran | Star Dojran | PPLA | 3348 |  |  |  |  |
| mt | mqabba | mqabہ | Mqabba | Mqabba | PPLA | 3339 |  | 7.07 |  |  |
| mt | xewkija | خیوکیجا | Xewkija | Xewkija | PPLA | 3303 |  | 27.71 |  |  |
| si | lenart-v-slovenskih-goricah | lynart wy slwwnsky gwrykaہ | Lenart v Slovenskih Goricah | Lenart v Slovenskih Goricah | PPLA | 3285 |  | 117.09 |  |  |
| si | brezovica-pri-ljubljani | brazwwkہ pry lywblyana | Brezovica pri Ljubljani | Brezovica pri Ljubljani | PPLA | 3221 |  | 7.94 |  |  |
| si | metlika | متلیکا | Metlika | Metlika | PPLA | 3206 |  | 77.20 | wave | metlika-si |
| ee | kaerdla | کاردلا | Kärdla | Kärdla | PPLA | 3160 |  | 124.08 |  |  |
| si | sencur | سنکور | Šenčur | Šenčur | PPLA | 3152 |  | 22.15 |  |  |
| mt | qrendi | آریندی | Qrendi | Qrendi | PPLA | 3148 |  | 8.80 |  |  |
| lv | saulkrasti | سالکراستی | Saulkrasti | Saulkrasti | PPLA | 3124 |  |  |  |  |
| me | golubovci | گولوبوفتسی | Golubovci | Golubovci | PPLA | 3110 |  |  |  |  |
| si | zelezniki | زلیزنیکی | Železniki | Železniki | PPLA | 3075 |  | 31.78 | wave | zelezniki-si |
| me | kolasin | کولاشن | Kolašin | Kolašin | PPLA | 2989 |  |  |  |  |
| lv | bergi | برگي | Berģi | Berģi | PPLA | 2950 |  |  |  |  |
| si | sostanj | swsٹanj | Šoštanj | Šoštanj | PPLA | 2880 |  | 55.09 |  |  |
| si | radlje-ob-dravi | radljے awb drawy | Radlje ob Dravi | Radlje ob Dravi | PPLA | 2811 |  | 83.07 |  |  |
| mk | belcista | bylssٹa | Belčišta | Belčišta | PPLA | 2804 |  |  |  |  |
| si | race | rachے | Rače | Rače | PPLA | 2693 |  | 100.48 | wave | race-si |
| mt | imtarfa | amtrfہ | Imtarfa | Imtarfa | PPLA | 2615 |  | 10.51 |  |  |
| si | beltinci | bylٹnchy | Beltinci | Beltinci | PPLA | 2394 |  | 146.54 |  |  |
| mk | novaci | نواتسی بلدیہ | Novaci | Novaci | PPLA | 2357 |  |  | wave | novaci-mk |
| mk | demir-hisar | دمیر حصار | Demir Hisar | Demir Hisar | PPLA | 2283 |  |  |  |  |
| si | store | sٹwr | Štore | Štore | PPLA | 2257 |  | 64.88 | wave | store-si |
| si | skofljica | skwfljykہ | Škofljica | Škofljica | PPLA | 2209 |  | 9.69 |  |  |
| si | radece | radychے | Radeče | Radeče | PPLA | 2168 |  | 52.19 |  |  |
| si | mozirje | mwzyrjے | Mozirje | Mozirje | PPLA | 2052 |  | 47.20 |  |  |
| si | semic | سمیچ | Semič | Semič | PPLA | 2000 |  | 69.43 | wave | semic-si |
| si | lovrenc-na-pohorju | lwwrynts na pwہwryw | Lovrenc na Pohorju | Lovrenc na Pohorju | PPLA | 1977 |  | 86.79 |  |  |
| si | mislinja | مسلنیا | Mislinja | Mislinja | PPLA | 1862 |  | 68.41 |  |  |
| si | bohinjska-bistrica | bwہnska bstrka | Bohinjska Bistrica | Bohinjska Bistrica | PPLA | 1767 |  | 48.81 |  |  |
| si | prebold | prybwlڈ | Prebold | Prebold | PPLA | 1709 |  | 49.43 |  |  |
| si | spodnji-duplek | spwdnjy ڈwplyk | Spodnji Duplek | Spodnji Duplek | PPLA | 1689 |  | 107.42 |  |  |
| me | gusinje | گوسینیه | Gusinje | Gusinje | PPLA | 1673 |  |  |  |  |
| si | bovec | بوتس، اسلوونی | Bovec | Bovec | PPLA | 1631 |  | 79.76 |  |  |
| si | rogatec | rwgaٹych | Rogatec | Rogatec | PPLA | 1558 |  | 93.84 |  |  |
| me | pluzine | پلوژینه | Plužine | Plužine | PPLA | 1494 |  |  | wave | pluzine-me |
| si | sentjernej | synٹjrnے | Šentjernej | Šentjernej | PPLA | 1434 |  | 68.35 |  |  |
| si | poljcane | pwlchanے | Poljčane | Poljčane | PPLA | 1153 |  | 87.37 |  |  |
| si | kobarid | kwbarڈ | Kobarid | Kobarid | PPLA | 1121 |  | 74.47 |  |  |
| si | mirna-pec | مرنا پچ | Mirna Peč | Mirna Peč | PPLA | 990 |  | 49.73 |  |  |
| si | sredisce-ob-dravi | sryڈskے awb ڈrawy | Središče ob Dravi | Središče ob Dravi | PPLA | 984 |  | 140.65 |  |  |
| si | moravce | mwrawchے | Moravče | Moravče | PPLA | 957 |  | 20.48 | wave | moravce-si |
| si | benedikt | bnyڈkٹ | Benedikt | Benedikt | PPLA | 955 |  | 122.66 |  |  |
| mt | fontana | fwnٹana | Fontana | Fontana | PPLA | 922 |  | 29.47 |  |  |
| si | vitanje | wٹanjے | Vitanje | Vitanje | PPLA | 859 |  | 70.88 |  |  |
| si | zgornja-hajdina | zgwrnja ہydyna | Zgornja Hajdina | Zgornja Hajdina | PPLA | 858 |  | 109.61 |  |  |
| si | sodrazica | swdajtsہ | Sodražica | Sodražica | PPLA | 832 |  | 34.37 |  |  |
| si | vransko | برانسکو | Vransko | Vransko | PPLA | 808 |  | 40.13 | wave | vransko-si |
| si | starse | sٹarsے | Starše | Starše | PPLA | 803 |  | 107.10 |  |  |
| si | moravske-toplice | mwrawskے ٹaplychے | Moravske Toplice | Moravske Toplice | PPLA | 735 |  | 148.87 |  |  |
| si | smartno-ob-paki | سمارتنو اب پاکي | Šmartno ob Paki | Šmartno ob Paki | PPLA | 642 |  | 50.93 |  |  |
| si | kostel | kwsٹl | Kostel | Kostel | PPLA | 637 |  | 68.55 | wave | kostel-si |
| si | kozje | kwjے | Kozje | Kozje | PPLA | 634 |  | 81.34 |  |  |
| si | videm | wڈym | Videm | Videm | PPLA | 590 |  | 27.25 |  |  |
| si | kobilje | kwbyljے | Kobilje | Kobilje | PPLA | 542 |  | 160.81 | wave | kobilje-si |
| si | leskova-dolina | لسکووا دولینا | Leskova Dolina | Leskova Dolina | PPLA | 539 |  | 48.55 |  |  |
| si | krizevci-pri-ljutomeru | kryzywchy pry lywٹwmwry | Križevci pri Ljutomeru | Križevci pri Ljutomeru | PPLA | 490 |  | 137.70 |  |  |
| si | bukovica | bwkwwkہ | Bukovica | Bukovica | PPLA | 475 |  | 67.08 | wave | bukovica-si |
| si | videm-pri-ptuju | wyڈym pry ptwjw | Videm pri Ptuju | Videm pri Ptuju | PPLA | 471 |  | 113.20 |  |  |
| si | lukovica-pri-domzalah | lwkwwytsa pry ڈwmzalaہ | Lukovica pri Domžalah | Lukovica pri Domžalah | PPLA | 419 |  | 19.06 |  |  |
| si | luce | lwchے | Luče | Luče | PPLA | 413 |  | 38.01 | wave | luce-si |
| si | ribnica-na-pohorju | rybnyka na pwہwrjw | Ribnica na Pohorju | Ribnica na Pohorju | PPLA | 404 |  | 79.36 |  |  |
| si | jurovski-dol | jrwfsky ڈwl | Jurovski Dol | Jurovski Dol | PPLA | 385 |  | 115.66 |  |  |
| si | jursinci | جرسنچی | Juršinci | Juršinci | PPLA | 381 |  | 122.11 |  |  |
| si | podlehnik | pwdlyہnk | Podlehnik | Podlehnik | PPLA | 378 |  | 110.14 |  |  |
| si | trnovska-vas | ترنوسکا وس | Trnovska Vas | Trnovska Vas | PPLA | 367 |  | 117.94 |  |  |
| si | vitomarci | wٹwmarky | Vitomarci | Vitomarci | PPLA | 329 |  | 121.95 |  |  |
| si | sentrupert-na-dolenjskem | synٹrwprٹ naہ ڈwlynskym | Šentrupert na Dolenjskem | Šentrupert na Dolenjskem | PPLA | 329 |  | 46.18 |  |  |
| si | smarjeta | smarytہ | Šmarjeta | Šmarjeta | PPLA | 326 |  | 60.67 |  |  |
| si | rogasovci | rwګaswchy | Rogašovci | Rogašovci | PPLA | 254 |  | 143.33 |  |  |
| si | bistrica-ob-sotli | بسترکا اوب سوتلی | Bistrica ob Sotli | Bistrica ob Sotli | PPLA | 235 |  | 89.31 |  |  |
| si | solcava | swltsafہ | Solčava | Solčava | PPLA | 214 |  | 42.84 |  |  |
| mt | imdina | amdynہ | Imdina | Imdina | PPLA | 193 |  | 10.14 |  |  |
| si | sv-ana-v-slov-goricah | synٹ ana ڈblyw slww gwrchaہ | Sv. Ana v Slov. Goricah | Sv. Ana v Slov. Goricah | PPLA | 155 |  | 122.01 |  |  |

## mixed_latin (34)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pl | lodz | lwډz | Łódź | Łódź | PPLA | 645693 | لودز | 117.03 |  |  |
| me | podgorica | pۆdgۆrytsa | Podgorica | Podgorica | PPLC | 236852 |  |  | wave | podgorica-me |
| pl | kielce | kylsې | Kielce | Kielce | PPLA | 192468 | شفينتوكشيسكي | 101.78 |  |  |
| ro | braila | براIلا | Brăila | Brăila | PPLA | 154686 |  | 174.91 |  |  |
| bg | ruse | rwsې | Ruse | Ruse | PPLA | 121168 |  | 248.52 | wave | ruse-bg |
| al | vlore | wlwrې | Vlorë | Vlorë | PPLA | 115261 |  |  |  |  |
| al | korce | kwrchې | Korçë | Korçë | PPLA | 58259 |  |  | wave | korce-al |
| si | celje | syljې | Celje | Celje | PPLA | 38059 |  | 61.27 |  |  |
| bg | targovishte | targwwyshtې | Targovishte | Targovishte | PPLA | 34793 |  | 271.48 |  |  |
| lv | marupe | marpې | Mārupe | Mārupe | PPLA | 19096 |  |  |  |  |
| me | bijelo-polje | byjylw pwljې | Bijelo Polje | Bijelo Polje | PPLA | 15400 |  |  | wave | bijelo-polje-me |
| si | trbovlje | trbwwljې | Trbovlje | Trbovlje | PPLA | 15163 |  | 43.46 |  |  |
| me | cetinje | sytnjې | Cetinje | Cetinje | PPLA | 15137 |  |  |  |  |
| me | rozaje | rwzajې | Rožaje | Rožaje | PPLA | 9121 |  |  |  |  |
| si | brezice | brzychې | Brežice | Brežice | PPLA | 6843 |  | 85.65 | wave | brezice-si |
| lv | aizkraukle | ayzkrawklې | Aizkraukle | Aizkraukle | PPLA | 6689 |  |  |  |  |
| lv | aluksne | alwksnې | Alūksne | Alūksne | PPLA | 6188 |  |  |  |  |
| si | trebnje | trybnjې | Trebnje | Trebnje | PPLA | 3477 |  | 43.38 |  |  |
| si | zrece | dhrychې | Zreče | Zreče | PPLA | 2935 |  | 76.31 |  |  |
| si | spodnje-hoce | spwdnې hwsې | Spodnje Hoče | Spodnje Hoče | PPLA | 2555 |  | 100.70 |  |  |
| si | smarje-pri-jelsah | smarjې pry jylsah | Šmarje pri Jelšah | Šmarje pri Jelšah | PPLA | 1755 |  | 80.34 |  |  |
| si | cerklje-na-gorenjskem | srkljې na gwrnskm | Cerklje na Gorenjskem | Cerklje na Gorenjskem | PPLA | 1710 |  | 21.53 |  |  |
| si | vodice | wwdytsې | Vodice | Vodice | PPLA | 1589 |  | 14.81 | wave | vodice-si |
| si | turnisce | twrnyshې | Turnišče | Turnišče | PPLA | 1509 |  | 152.53 | wave | turnisce-si |
| si | nazarje | nazarjې | Nazarje | Nazarje | PPLA | 872 |  | 44.94 |  |  |
| si | velike-lasce | wylykې lasې | Velike Lašče | Velike Lašče | PPLA | 729 |  | 26.79 |  |  |
| si | zgornje-jezersko | zgwrnjې jyzrskw | Zgornje Jezersko | Zgornje Jezersko | PPLA | 568 |  | 37.49 |  |  |
| si | apace | apachې | Apače | Apače | PPLA | 543 |  | 129.11 |  |  |
| si | zgornje-gorje | zgwrnjې gwrjې | Zgornje Gorje | Zgornje Gorje | PPLA | 500 |  | 49.14 |  |  |
| si | cirkulane | srkwlyں | Cirkulane | Cirkulane | PPLA | 434 |  | 118.95 |  |  |
| si | zetale | zytalې | Žetale | Žetale | PPLA | 392 |  | 104.53 |  |  |
| si | braslovce | braslwwchې | Braslovče | Braslovče | PPLA | 383 |  | 48.49 |  |  |
| si | razkrizje | razkryjې | Razkrižje | Razkrižje | PPLA | 252 |  | 145.71 |  |  |
| si | cerkvenjak | srkwyںjk | Cerkvenjak | Cerkvenjak | PPLA | 135 |  | 124.20 |  |  |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
