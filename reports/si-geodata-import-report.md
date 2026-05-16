# SI GeoNames Import Report — Europe-3

**Country**: Slovenia (سلوفينيا)
**Wave**: `CURATED-GEODATA-EUROPE-3`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T08:16:13.081Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/si-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/si-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/si-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-3-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 6565 |
| existing (matched, no action)     | 1 |
| **pending — high tier**           | **175** |
| pending — medium tier             | 0 |
| pending — low tier                | 241 |
| needs_review                      | 6139 |
| rejected                          | 0 |
| collisions in this wave           | 1304 |
| collisions against existing curated | 0 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 66 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 89 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 20 | ⚠️ manual review |
| `mixed_unknown`               | 0 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 50
**Blocked by ar-gate (high-tier):** 125

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | ilirska-bistrica | إيليرسكا بيستريتسا | Ilirska Bistrica | Ilirska Bistrica | si | PPLA | 4553 |  | 45.5676 | 14.2457 | 58.02 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | piran | بيران | Piran | Piran | si | PPLA | 4192 |  | 45.5278 | 13.5706 | 93.38 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | cerknica | تسركنيتسا | Cerknica | Cerknica | si | PPLA | 4018 |  | 45.7970 | 14.3626 | 30.95 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | trzin | تريزين | Trzin | Trzin | si | PPLA | 3925 |  | 46.1364 | 14.5617 | 9.83 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ziri | زيري | Žiri | Žiri | si | PPLA | 3588 |  | 46.0440 | 14.1074 | 30.78 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | tolmin | تولمين | Tolmin | Tolmin | si | PPLA | 3534 |  | 46.1830 | 13.7332 | 61.18 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ankaran | أنكاران | Ankaran | Ankaran | si | PPLA | 3278 |  | 45.5790 | 13.7362 | 79.88 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | mezica | ميزيتسا | Mežica | Mežica | si | PPLA | 3254 |  | 46.5203 | 14.8531 | 58.03 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | gornja-radgona | غرنيا رادغنا | Gornja Radgona | Gornja Radgona | si | PPLA | 3159 |  | 46.6726 | 15.9922 | 133.02 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | lendava | لندافا | Lendava | Lendava | si | PPLA | 3129 |  | 46.5649 | 16.4509 | 159.72 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | polzela | بولزيلا | Polzela | Polzela | si | PPLA | 2351 |  | 46.2836 | 15.0651 | 49.90 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ig | إيغ | Ig | Ig | si | PPLA | 2262 |  | 45.9589 | 14.5281 | 11.03 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ivancna-gorica | إيفانتشنا جوريتسا | Ivančna Gorica | Ivančna Gorica | si | PPLA | 2205 |  | 45.9370 | 14.8053 | 26.70 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | radenci | رادنتسي | Radenci | Radenci | si | PPLA | 2201 |  | 46.6420 | 16.0378 | 134.38 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ormoz | أرموز | Ormož | Ormož | si | PPLA | 2174 |  | 46.4121 | 16.1522 | 132.65 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | pivka | بيفكا | Pivka | Pivka | si | PPLA | 2088 |  | 45.6829 | 14.1959 | 48.01 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | vipava | فيبافا | Vipava | Vipava | si | PPLA | 1771 |  | 45.8459 | 13.9623 | 48.13 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | odranci | أودرانتسي | Odranci | Odranci | si | PPLA | 1641 |  | 46.5864 | 16.2797 | 148.39 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | cerkno | تسركنو | Cerkno | Cerkno | si | PPLA | 1596 |  | 46.1253 | 13.9827 | 41.05 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | vuzenica | فوزينيتسا | Vuzenica | Vuzenica | si | PPLA | 1580 |  | 46.5966 | 15.1635 | 78.43 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | smartno-pri-litiji | سمارتنو بري ليتيجي | Šmartno pri Litiji | Šmartno pri Litiji | si | PPLA | 1444 |  | 46.0440 | 14.8448 | 26.20 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | kranjska-gora | كرانجسكا جورا | Kranjska Gora | Kranjska Gora | si | PPLA | 1439 |  | 46.4569 | 13.7782 | 71.46 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | mirna | مرنا | Mirna | Mirna | si | PPLA | 1398 |  | 45.9517 | 15.0619 | 44.52 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | oplotnica | أوبلوتنيتسا | Oplotnica | Oplotnica | si | PPLA | 1352 |  | 46.3873 | 15.4458 | 81.12 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | selnica-ob-dravi | سيلنيتسا أوب درافي | Selnica ob Dravi | Selnica ob Dravi | si | PPLA | 1348 |  | 46.5518 | 15.4929 | 93.69 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | kanal | كانال | Kanal | Kanal | si | PPLA | 1269 |  | 46.0874 | 13.6349 | 67.27 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | kidricevo | كيدريتشيفو | Kidričevo | Kidričevo | si | PPLA | 1253 |  | 46.4031 | 15.7987 | 106.64 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | ljubno-ob-savinji | ليوبنو أوب سافينيي | Ljubno ob Savinji | Ljubno ob Savinji | si | PPLA | 1104 |  | 46.3436 | 14.8338 | 40.66 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | zuzemberk | زوزيمبرك | Žužemberk | Žužemberk | si | PPLA | 1053 |  | 45.8338 | 14.9280 | 41.01 | ljubljana | arabic_only |  | 70 | always_include:PPLA |
| ✅ | pesnica | بيسنيتسا | Pesnica | Pesnica | si | PPLA | 913 |  | 46.6069 | 15.6767 | 108.73 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | verzej | فيرزيي | Veržej | Veržej | si | PPLA | 903 |  | 46.5833 | 16.1640 | 140.15 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | komenda | كوميندا | Komenda | Komenda | si | PPLA | 881 |  | 46.2048 | 14.5384 | 16.64 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | velika-polana | فيليكا بولانا | Velika Polana | Velika Polana | si | PPLA | 870 |  | 46.5722 | 16.3472 | 152.58 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | kostanjevica-na-krki | كوستانيويتسا نا كركي | Kostanjevica na Krki | Kostanjevica na Krki | si | PPLA | 695 |  | 45.8456 | 15.4204 | 74.51 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | komen | كومن | Komen | Komen | si | PPLA | 650 |  | 45.8156 | 13.7483 | 64.43 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | mokronog | موكرونوج | Mokronog | Mokronog | si | PPLA | 637 |  | 45.9390 | 15.1394 | 50.67 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | puconci | بوتسونتسي | Puconci | Puconci | si | PPLA | 633 |  | 46.7047 | 16.1573 | 145.72 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | majsperk | مايسبيرك | Majšperk | Majšperk | si | PPLA | 606 |  | 46.3503 | 15.7341 | 100.00 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | podcetrtek | بودتسيترتيك | Podčetrtek | Podčetrtek | si | PPLA | 578 |  | 46.1568 | 15.5969 | 84.85 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | zgornja-kungota | زغورنيا كونغوتا | Zgornja Kungota | Zgornja Kungota | si | PPLA | 535 |  | 46.6387 | 15.6149 | 106.92 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | recica-ob-savinji | ريتسيتسا أوب سافينجي | Rečica ob Savinji | Rečica ob Savinji | si | PPLA | 516 |  | 46.3167 | 14.9167 | 42.83 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | cankova | تسانكوفا | Cankova | Cankova | si | PPLA | 446 |  | 46.7203 | 16.0224 | 137.74 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | salovci | سالوفتسي | Šalovci | Šalovci | si | PPLA | 426 |  | 46.8241 | 16.2978 | 161.65 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | podvelka | بودفيلكا | Podvelka | Podvelka | si | PPLA | 343 |  | 46.5884 | 15.3279 | 86.47 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | sveti-tomaz | سفيتي توماز | Sveti Tomaž | Sveti Tomaž | si | PPLA | 284 |  | 46.4835 | 16.0791 | 129.90 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | skocjan | سكوتشيان | Škocjan | Škocjan | si | PPLA | 246 |  | 45.9069 | 15.2913 | 62.95 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | makole | ماكوله | Makole | Makole | si | PPLA | 221 |  | 46.3164 | 15.6663 | 93.88 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | sveti-jurij | سفيتي جوري | Sveti Jurij | Sveti Jurij | si | PPLA | 209 |  | 46.5695 | 16.0235 | 129.75 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | osilnica | أوسيلنيتسا | Osilnica | Osilnica | si | PPLA | 87 |  | 45.5291 | 14.6984 | 60.55 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ✅ | zavrc | زافرتس | Zavrč | Zavrč | si | PPLA | 73 |  | 46.3905 | 16.0500 | 124.45 | ljubljana | arabic_only |  | 65 | always_include:PPLA |
| ⚠️ | celje | syljې | Celje | Celje | si | PPLA | 38059 |  | 46.2309 | 15.2604 | 61.27 | ljubljana | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | novo-mesto | nww mysٹw | Novo Mesto | Novo Mesto | si | PPLA | 24446 |  | 45.8040 | 15.1689 | 58.49 | ljubljana | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | velenje | wylnjے | Velenje | Velenje | si | PPLA | 24327 |  | 46.3572 | 15.1128 | 57.42 | ljubljana | mixed_script | wave→velenje-si | 80 | always_include:PPLA |
| ⚠️ | ptuj | pٹwj | Ptuj | Ptuj | si | PPLA | 17984 |  | 46.4201 | 15.8702 | 112.43 | ljubljana | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | trbovlje | trbwwljې | Trbovlje | Trbovlje | si | PPLA | 15163 |  | 46.1541 | 15.0518 | 43.46 | ljubljana | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | kamnik | كامنيك | Kamnik | Kamnik | si | PPLA | 13644 |  | 46.2259 | 14.6121 | 20.50 | ljubljana | arabic_only | wave→kamnik-si | 80 | always_include:PPLA |
| ⚠️ | jesenice | jysynchے | Jesenice | Jesenice | si | PPLA | 13255 |  | 46.4324 | 14.0623 | 53.91 | ljubljana | mixed_script | wave→jesenice-si | 80 | always_include:PPLA |
| ⚠️ | domzale | دمژاله | Domžale | Domžale | si | PPLA | 13204 |  | 46.1377 | 14.5937 | 11.26 | ljubljana | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | nova-gorica | نوا گریتسا | Nova Gorica | Nova Gorica | si | PPLA | 13031 |  | 45.9560 | 13.6484 | 67.17 | ljubljana | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | skofja-loka | skwfja lwkہ | Škofja Loka | Škofja Loka | si | PPLA | 11619 |  | 46.1655 | 14.3063 | 19.56 | ljubljana | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | murska-sobota | مورسکا سوبوتا | Murska Sobota | Murska Sobota | si | PPLA | 11107 |  | 46.6626 | 16.1664 | 144.14 | ljubljana | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | postojna | pwsٹwjna | Postojna | Postojna | si | PPLA | 9605 |  | 45.7743 | 14.2153 | 38.63 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | sentilj-v-slov-goricah | synٹlj ڈblyw slww gwrchaہ | Šentilj v Slov. Goricah | Šentilj v Slov. Goricah | si | PPLA | 8452 |  | 46.6817 | 15.6481 | 111.83 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | vrhnika | wہnyka | Vrhnika | Vrhnika | si | PPLA | 8413 |  | 45.9635 | 14.2948 | 19.32 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | kocevje | kwchywjے | Kočevje | Kočevje | si | PPLA | 8113 |  | 45.6432 | 14.8604 | 53.57 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | slovenska-bistrica | slwwnska bsٹrytsہ | Slovenska Bistrica | Slovenska Bistrica | si | PPLA | 7454 |  | 46.3931 | 15.5735 | 90.24 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | slovenj-gradec | slwwnj gryڈyk | Slovenj Gradec | Slovenj Gradec | si | PPLA | 7249 |  | 46.5109 | 15.0838 | 67.24 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | grosuplje | گرسوپلیه | Grosuplje | Grosuplje | si | PPLA | 7098 |  | 45.9558 | 14.6589 | 16.32 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | ravne-na-koroskem | rawnے na kwrwskym | Ravne na Koroškem | Ravne na Koroškem | si | PPLA | 6979 |  | 46.5431 | 14.9705 | 64.79 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | brezice | brzychې | Brežice | Brežice | si | PPLA | 6843 |  | 45.9073 | 15.5932 | 85.65 | ljubljana | mixed_latin | wave→brezice-si | 75 | always_include:PPLA |
| ⚠️ | ajdovscina | ayڈwwschyna | Ajdovščina | Ajdovščina | si | PPLA | 6843 |  | 45.8860 | 13.9095 | 49.85 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | litija | lyٹyja | Litija | Litija | si | PPLA | 6505 |  | 46.0604 | 14.8218 | 24.39 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | zagorje-ob-savi | zaګwrjې awb sawy | Zagorje ob Savi | Zagorje ob Savi | si | PPLA | 6439 |  | 46.1318 | 14.9969 | 38.78 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | sezana | syzanہ | Sežana | Sežana | si | PPLA | 6037 |  | 45.7092 | 13.8733 | 62.38 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | medvode | mydwwڈے | Medvode | Medvode | si | PPLA | 5380 |  | 46.1422 | 14.4111 | 11.97 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | bled | blyڈ | Bled | Bled | si | PPLA | 5181 |  | 46.3686 | 14.1165 | 45.81 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | rogaska-slatina | rwګaska slatyna | Rogaška Slatina | Rogaška Slatina | si | PPLA | 5111 |  | 46.2373 | 15.6391 | 89.58 | ljubljana | mixed_script |  | 75 | always_include:PPLA |
| ⚠️ | zalec | زالتس | Žalec | Žalec | si | PPLA | 4943 |  | 46.2515 | 15.1648 | 55.18 | ljubljana | arabic_only | wave→zalec-si | 70 | always_include:PPLA |
| ⚠️ | sentjur | synٹjwr | Šentjur | Šentjur | si | PPLA | 4940 |  | 46.2172 | 15.3975 | 70.98 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | slovenske-konjice | slwwnskے kwnjytsے | Slovenske Konjice | Slovenske Konjice | si | PPLA | 4869 |  | 46.3374 | 15.4233 | 77.19 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | sevnica | sywntsہ | Sevnica | Sevnica | si | PPLA | 4660 |  | 46.0079 | 15.3165 | 62.82 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | prevalje | prywaljے | Prevalje | Prevalje | si | PPLA | 4643 |  | 46.5470 | 14.9202 | 63.12 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | ruse | rwsے | Ruše | Ruše | si | PPLA | 4503 |  | 46.5401 | 15.5179 | 94.51 | ljubljana | mixed_script | wave→ruse-si | 70 | always_include:PPLA |
| ⚠️ | miklavz-na-dravskem-polju | mklawz na ڈrawskym pwljw | Miklavž na Dravskem Polju | Miklavž na Dravskem Polju | si | PPLA | 3854 |  | 46.5061 | 15.6970 | 104.28 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | sempeter-pri-gorici | sympyٹr pry gwrychy | Šempeter pri Gorici | Šempeter pri Gorici | si | PPLA | 3694 |  | 45.9293 | 13.6412 | 68.28 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | trzic | تريزيتش | Tržič | Tržič | si | PPLA | 3670 |  | 46.3636 | 14.3105 | 37.27 | ljubljana | arabic_only | wave→trzic-si | 70 | always_include:PPLA |
| ⚠️ | preddvor | pryڈwwr | Preddvor | Preddvor | si | PPLA | 3659 |  | 46.3026 | 14.4222 | 28.07 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | ribnica | ريبنيتسا | Ribnica | Ribnica | si | PPLA | 3604 |  | 45.7386 | 14.7275 | 39.33 | ljubljana | arabic_only | wave→ribnica-si | 70 | always_include:PPLA |
| ⚠️ | trebnje | trybnjې | Trebnje | Trebnje | si | PPLA | 3477 |  | 45.9042 | 15.0224 | 43.38 | ljubljana | mixed_latin |  | 70 | always_include:PPLA |
| ⚠️ | ljutomer | lywٹwmr | Ljutomer | Ljutomer | si | PPLA | 3460 |  | 46.5177 | 16.1982 | 139.77 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | lasko | لاسكو | Laško | Laško | si | PPLA | 3456 |  | 46.1546 | 15.2355 | 57.30 | ljubljana | arabic_only | wave→lasko-si | 70 | always_include:PPLA |
| ⚠️ | lenart-v-slovenskih-goricah | lynart wy slwwnsky gwrykaہ | Lenart v Slovenskih Goricah | Lenart v Slovenskih Goricah | si | PPLA | 3285 |  | 46.5768 | 15.8317 | 117.09 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | brezovica-pri-ljubljani | brazwwkہ pry lywblyana | Brezovica pri Ljubljani | Brezovica pri Ljubljani | si | PPLA | 3221 |  | 46.0233 | 14.4150 | 7.94 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | metlika | متلیکا | Metlika | Metlika | si | PPLA | 3206 |  | 45.6498 | 15.3133 | 77.20 | ljubljana | mixed_script | wave→metlika-si | 70 | always_include:PPLA |
| ⚠️ | sencur | سنکور | Šenčur | Šenčur | si | PPLA | 3152 |  | 46.2471 | 14.4203 | 22.15 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | zelezniki | زلیزنیکی | Železniki | Železniki | si | PPLA | 3075 |  | 46.2248 | 14.1721 | 31.78 | ljubljana | mixed_script | wave→zelezniki-si | 70 | always_include:PPLA |
| ⚠️ | zrece | dhrychې | Zreče | Zreče | si | PPLA | 2935 |  | 46.3822 | 15.3792 | 76.31 | ljubljana | mixed_latin |  | 70 | always_include:PPLA |
| ⚠️ | sostanj | swsٹanj | Šoštanj | Šoštanj | si | PPLA | 2880 |  | 46.3800 | 15.0486 | 55.09 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | radlje-ob-dravi | radljے awb drawy | Radlje ob Dravi | Radlje ob Dravi | si | PPLA | 2811 |  | 46.6153 | 15.2247 | 83.07 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | race | rachے | Rače | Rače | si | PPLA | 2693 |  | 46.4522 | 15.6809 | 100.48 | ljubljana | mixed_script | wave→race-si | 70 | always_include:PPLA |
| ⚠️ | spodnje-hoce | spwdnې hwsې | Spodnje Hoče | Spodnje Hoče | si | PPLA | 2555 |  | 46.4996 | 15.6489 | 100.70 | ljubljana | mixed_latin |  | 70 | always_include:PPLA |
| ⚠️ | beltinci | bylٹnchy | Beltinci | Beltinci | si | PPLA | 2394 |  | 46.6054 | 16.2412 | 146.54 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | muta | موتا | Muta | Muta | si | PPLA | 2300 |  | 46.6116 | 15.1662 | 79.84 | ljubljana | arabic_only | wave→muta-si | 70 | always_include:PPLA |
| ⚠️ | vojnik | فويينيك | Vojnik | Vojnik | si | PPLA | 2292 |  | 46.2933 | 15.3036 | 66.81 | ljubljana | arabic_only | wave→vojnik-si | 70 | always_include:PPLA |
| ⚠️ | store | sٹwr | Štore | Štore | si | PPLA | 2257 |  | 46.2208 | 15.3139 | 64.88 | ljubljana | mixed_script | wave→store-si | 70 | always_include:PPLA |
| ⚠️ | skofljica | skwfljykہ | Škofljica | Škofljica | si | PPLA | 2209 |  | 45.9841 | 14.5748 | 9.69 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | radece | radychے | Radeče | Radeče | si | PPLA | 2168 |  | 46.0655 | 15.1821 | 52.19 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | borovnica | بوروفنيتسا | Borovnica | Borovnica | si | PPLA | 2162 |  | 45.9175 | 14.3644 | 18.96 | ljubljana | arabic_only | wave→borovnica-si | 70 | always_include:PPLA |
| ⚠️ | mozirje | mwzyrjے | Mozirje | Mozirje | si | PPLA | 2052 |  | 46.3383 | 14.9649 | 47.20 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | semic | سمیچ | Semič | Semič | si | PPLA | 2000 |  | 45.6465 | 15.1814 | 69.43 | ljubljana | mixed_script | wave→semic-si | 70 | always_include:PPLA |
| ⚠️ | lovrenc-na-pohorju | lwwrynts na pwہwryw | Lovrenc na Pohorju | Lovrenc na Pohorju | si | PPLA | 1977 |  | 46.5413 | 15.3917 | 86.79 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | mislinja | مسلنیا | Mislinja | Mislinja | si | PPLA | 1862 |  | 46.4414 | 15.2003 | 68.41 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | bohinjska-bistrica | bwہnska bstrka | Bohinjska Bistrica | Bohinjska Bistrica | si | PPLA | 1767 |  | 46.2722 | 13.9535 | 48.81 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | smarje-pri-jelsah | smarjې pry jylsah | Šmarje pri Jelšah | Šmarje pri Jelšah | si | PPLA | 1755 |  | 46.2272 | 15.5192 | 80.34 | ljubljana | mixed_latin |  | 70 | always_include:PPLA |
| ⚠️ | naklo | ناكلو | Naklo | Naklo | si | PPLA | 1716 |  | 46.2735 | 14.3173 | 28.12 | ljubljana | arabic_only | wave→naklo-si | 70 | always_include:PPLA |
| ⚠️ | cerklje-na-gorenjskem | srkljې na gwrnskm | Cerklje na Gorenjskem | Cerklje na Gorenjskem | si | PPLA | 1710 |  | 46.2501 | 14.4862 | 21.53 | ljubljana | mixed_latin |  | 70 | always_include:PPLA |
| ⚠️ | prebold | prybwlڈ | Prebold | Prebold | si | PPLA | 1709 |  | 46.2366 | 15.0926 | 49.43 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | spodnji-duplek | spwdnjy ڈwplyk | Spodnji Duplek | Spodnji Duplek | si | PPLA | 1689 |  | 46.5036 | 15.7452 | 107.42 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | bovec | بوتس، اسلوونی | Bovec | Bovec | si | PPLA | 1631 |  | 46.3381 | 13.5525 | 79.76 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | vodice | wwdytsې | Vodice | Vodice | si | PPLA | 1589 |  | 46.1899 | 14.4949 | 14.81 | ljubljana | mixed_latin | wave→vodice-si | 70 | always_include:PPLA |
| ⚠️ | rogatec | rwgaٹych | Rogatec | Rogatec | si | PPLA | 1558 |  | 46.2277 | 15.6986 | 93.84 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | turnisce | twrnyshې | Turnišče | Turnišče | si | PPLA | 1509 |  | 46.6257 | 16.3139 | 152.53 | ljubljana | mixed_latin | wave→turnisce-si | 70 | always_include:PPLA |
| ⚠️ | miren | ميرين | Miren | Miren | si | PPLA | 1460 |  | 45.8954 | 13.6082 | 71.65 | ljubljana | arabic_only | wave→miren-si | 70 | always_include:PPLA |
| ⚠️ | sentjernej | synٹjrnے | Šentjernej | Šentjernej | si | PPLA | 1434 |  | 45.8421 | 15.3341 | 68.35 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | poljcane | pwlchanے | Poljčane | Poljčane | si | PPLA | 1153 |  | 46.3143 | 15.5781 | 87.37 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | kobarid | kwbarڈ | Kobarid | Kobarid | si | PPLA | 1121 |  | 46.2476 | 13.5791 | 74.47 | ljubljana | mixed_script |  | 70 | always_include:PPLA |
| ⚠️ | mirna-pec | مرنا پچ | Mirna Peč | Mirna Peč | si | PPLA | 990 |  | 45.8594 | 15.0831 | 49.73 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | sredisce-ob-dravi | sryڈskے awb ڈrawy | Središče ob Dravi | Središče ob Dravi | si | PPLA | 984 |  | 46.3942 | 16.2681 | 140.65 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | moravce | mwrawchے | Moravče | Moravče | si | PPLA | 957 |  | 46.1369 | 14.7450 | 20.48 | ljubljana | mixed_script | wave→moravce-si | 65 | always_include:PPLA |
| ⚠️ | benedikt | bnyڈkٹ | Benedikt | Benedikt | si | PPLA | 955 |  | 46.6065 | 15.8910 | 122.66 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | nazarje | nazarjې | Nazarje | Nazarje | si | PPLA | 872 |  | 46.3190 | 14.9501 | 44.94 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | vitanje | wٹanjے | Vitanje | Vitanje | si | PPLA | 859 |  | 46.3834 | 15.2972 | 70.88 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | zgornja-hajdina | zgwrnja ہydyna | Zgornja Hajdina | Zgornja Hajdina | si | PPLA | 858 |  | 46.4061 | 15.8384 | 109.61 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | sodrazica | swdajtsہ | Sodražica | Sodražica | si | PPLA | 832 |  | 45.7613 | 14.6357 | 34.37 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | vransko | برانسکو | Vransko | Vransko | si | PPLA | 808 |  | 46.2444 | 14.9510 | 40.13 | ljubljana | mixed_script | wave→vransko-si | 65 | always_include:PPLA |
| ⚠️ | starse | sٹarsے | Starše | Starše | si | PPLA | 803 |  | 46.4658 | 15.7672 | 107.10 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | moravske-toplice | mwrawskے ٹaplychے | Moravske Toplice | Moravske Toplice | si | PPLA | 735 |  | 46.6831 | 16.2208 | 148.87 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | velike-lasce | wylykې lasې | Velike Lašče | Velike Lašče | si | PPLA | 729 |  | 45.8337 | 14.6364 | 26.79 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | smartno-ob-paki | سمارتنو اب پاکي | Šmartno ob Paki | Šmartno ob Paki | si | PPLA | 642 |  | 46.3333 | 15.0333 | 50.93 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | kostel | kwsٹl | Kostel | Kostel | si | PPLA | 637 |  | 45.5084 | 14.9092 | 68.55 | ljubljana | mixed_script | wave→kostel-si | 65 | always_include:PPLA |
| ⚠️ | kozje | kwjے | Kozje | Kozje | si | PPLA | 634 |  | 46.0733 | 15.5599 | 81.34 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | videm | wڈym | Videm | Videm | si | PPLA | 590 |  | 45.8498 | 14.6943 | 27.25 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | zgornje-jezersko | zgwrnjې jyzrskw | Zgornje Jezersko | Zgornje Jezersko | si | PPLA | 568 |  | 46.3941 | 14.5066 | 37.49 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | apace | apachې | Apače | Apače | si | PPLA | 543 |  | 46.6978 | 15.9093 | 129.11 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | kobilje | kwbyljے | Kobilje | Kobilje | si | PPLA | 542 |  | 46.6852 | 16.3937 | 160.81 | ljubljana | mixed_script | wave→kobilje-si | 65 | always_include:PPLA |
| ⚠️ | leskova-dolina | لسکووا دولینا | Leskova Dolina | Leskova Dolina | si | PPLA | 539 |  | 45.6214 | 14.4606 | 48.55 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | zgornje-gorje | zgwrnjې gwrjې | Zgornje Gorje | Zgornje Gorje | si | PPLA | 500 |  | 46.3796 | 14.0694 | 49.14 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | markovci | ماركوفتسي | Markovci | Markovci | si | PPLA | 495 |  | 46.3956 | 15.9283 | 115.72 | ljubljana | arabic_only | wave→markovci-si | 65 | always_include:PPLA |
| ⚠️ | krizevci-pri-ljutomeru | kryzywchy pry lywٹwmwry | Križevci pri Ljutomeru | Križevci pri Ljutomeru | si | PPLA | 490 |  | 46.5683 | 16.1386 | 137.70 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | bukovica | bwkwwkہ | Bukovica | Bukovica | si | PPLA | 475 |  | 45.9008 | 13.6672 | 67.08 | ljubljana | mixed_script | wave→bukovica-si | 65 | always_include:PPLA |
| ⚠️ | videm-pri-ptuju | wyڈym pry ptwjw | Videm pri Ptuju | Videm pri Ptuju | si | PPLA | 471 |  | 46.3687 | 15.9063 | 113.20 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | breznica | برازنيتسا | Breznica | Breznica | si | PPLA | 470 |  | 46.3939 | 14.1541 | 46.22 | ljubljana | arabic_only | wave→breznica-si | 65 | always_include:PPLA |
| ⚠️ | cirkulane | srkwlyں | Cirkulane | Cirkulane | si | PPLA | 434 |  | 46.3441 | 15.9947 | 118.95 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | lukovica-pri-domzalah | lwkwwytsa pry ڈwmzalaہ | Lukovica pri Domžalah | Lukovica pri Domžalah | si | PPLA | 419 |  | 46.1699 | 14.6918 | 19.06 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | luce | lwchے | Luče | Luče | si | PPLA | 413 |  | 46.3550 | 14.7476 | 38.01 | ljubljana | mixed_script | wave→luce-si | 65 | always_include:PPLA |
| ⚠️ | tisina | تيسينا | Tišina | Tišina | si | PPLA | 412 |  | 46.6542 | 16.0936 | 138.78 | ljubljana | arabic_only | wave→tisina-si | 65 | always_include:PPLA |
| ⚠️ | tabor | تابور | Tabor | Tabor | si | PPLA | 406 |  | 46.2346 | 15.0167 | 44.04 | ljubljana | arabic_only | wave→tabor-si | 65 | always_include:PPLA |
| ⚠️ | ribnica-na-pohorju | rybnyka na pwہwrjw | Ribnica na Pohorju | Ribnica na Pohorju | si | PPLA | 404 |  | 46.5350 | 15.2728 | 79.36 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | zetale | zytalې | Žetale | Žetale | si | PPLA | 392 |  | 46.2736 | 15.8266 | 104.53 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | jurovski-dol | jrwfsky ڈwl | Jurovski Dol | Jurovski Dol | si | PPLA | 385 |  | 46.6067 | 15.7846 | 115.66 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | braslovce | braslwwchې | Braslovče | Braslovče | si | PPLA | 383 |  | 46.2880 | 15.0398 | 48.49 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | jursinci | جرسنچی | Juršinci | Juršinci | si | PPLA | 381 |  | 46.4859 | 15.9682 | 122.11 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | podlehnik | pwdlyہnk | Podlehnik | Podlehnik | si | PPLA | 378 |  | 46.3354 | 15.8791 | 110.14 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | kuzma | كوزما | Kuzma | Kuzma | si | PPLA | 375 |  | 46.8351 | 16.0807 | 148.48 | ljubljana | arabic_only | wave→kuzma-si | 65 | always_include:PPLA |
| ⚠️ | trnovska-vas | ترنوسکا وس | Trnovska Vas | Trnovska Vas | si | PPLA | 367 |  | 46.5202 | 15.8866 | 117.94 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | vitomarci | wٹwmarky | Vitomarci | Vitomarci | si | PPLA | 329 |  | 46.5275 | 15.9394 | 121.95 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | sentrupert-na-dolenjskem | synٹrwprٹ naہ ڈwlynskym | Šentrupert na Dolenjskem | Šentrupert na Dolenjskem | si | PPLA | 329 |  | 45.9780 | 15.0930 | 46.18 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | smarjeta | smarytہ | Šmarjeta | Šmarjeta | si | PPLA | 326 |  | 45.8833 | 15.2500 | 60.67 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | nova-vas | نوا واس | Nova Vas | Nova Vas | si | PPLA | 293 |  | 45.7727 | 14.5065 | 31.60 | ljubljana | arabic_only | wave→nova-vas-si | 65 | always_include:PPLA |
| ⚠️ | rogasovci | rwګaswchy | Rogašovci | Rogašovci | si | PPLA | 254 |  | 46.7978 | 16.0361 | 143.33 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | razkrizje | razkryjې | Razkrižje | Razkrižje | si | PPLA | 252 |  | 46.5218 | 16.2788 | 145.71 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |
| ⚠️ | bistrica-ob-sotli | بسترکا اوب سوتلی | Bistrica ob Sotli | Bistrica ob Sotli | si | PPLA | 235 |  | 46.0575 | 15.6633 | 89.31 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | solcava | swltsafہ | Solčava | Solčava | si | PPLA | 214 |  | 46.4196 | 14.6937 | 42.84 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | sv-ana-v-slov-goricah | synٹ ana ڈblyw slww gwrchaہ | Sv. Ana v Slov. Goricah | Sv. Ana v Slov. Goricah | si | PPLA | 155 |  | 46.6492 | 15.8442 | 122.01 | ljubljana | mixed_script |  | 65 | always_include:PPLA |
| ⚠️ | cerkvenjak | srkwyںjk | Cerkvenjak | Cerkvenjak | si | PPLA | 135 |  | 46.5680 | 15.9437 | 124.20 | ljubljana | mixed_latin |  | 65 | always_include:PPLA |

## Collision-watch list for SI

Cities the user pre-flagged: `pristina`, `warsaw`, `krakow`, `prague`, `budapest`, `bucharest`, `sofia`, `athens`, `zagreb`, `belgrade`, `sarajevo`, `podgorica`, `skopje`, `tirana`, `tallinn`, `riga`, `vilnius`, `valletta`, `nicosia`, `wroclaw`, `gdansk`, `poznan`, `varna`, `plovdiv`, `thessaloniki`, `split`, `rijeka`, `novi-sad`, `cluj-napoca`, `timisoara`, `kaunas`, `liepaja`.

_(no watch-list cities appear in SI candidates)_

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/si-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-si` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/SI.zip
