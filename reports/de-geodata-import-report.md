# DE GeoNames Import Report — Europe-2

**Country**: Germany (ألمانيا)
**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T07:20:58.127Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/de-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/de-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/de-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-2-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 75955 |
| existing (matched, no action)     | 12 |
| **pending — high tier**           | **67** |
| pending — medium tier             | 0 |
| pending — low tier                | 2670 |
| needs_review                      | 73206 |
| rejected                          | 0 |
| collisions in this wave           | 10143 |
| collisions against existing curated | 9 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 51 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 14 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 1 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 47
**Blocked by ar-gate (high-tier):** 20

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | essen | أسن | Essen | Essen | de | PPLA3 | 593085 | شمال الراين-وستفاليا | 51.4566 | 7.0123 | 30.38 | dusseldorf | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | dortmund | دورتموند | Dortmund | Dortmund | de | PPLA3 | 588462 | شمال الراين-وستفاليا | 51.5149 | 7.4660 | 57.71 | dusseldorf | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | bremen | برمن | Bremen | Bremen | de | PPLA | 546501 | بريمن | 53.0758 | 8.8072 | 94.90 | hamburg | arabic_only |  | 95 | always_include:PPLA |
| ✅ | hannover | هانوفر | Hannover | Hannover | de | PPLA | 515140 | سكسونيا السفلى | 52.3705 | 9.7332 | 132.43 | hamburg | arabic_only |  | 95 | always_include:PPLA |
| ✅ | duisburg | دويسبورغ | Duisburg | Duisburg | de | PPLA3 | 504358 | شمال الراين-وستفاليا | 51.4325 | 6.7652 | 22.78 | dusseldorf | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | bochum | بوخم | Bochum | Bochum | de | PPLA3 | 385729 | شمال الراين-وستفاليا | 51.4817 | 7.2165 | 41.76 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wuppertal | فوبرتال | Wuppertal | Wuppertal | de | PPLA3 | 360797 | شمال الراين-وستفاليا | 51.2563 | 7.1482 | 26.27 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bielefeld | بيليفيلد | Bielefeld | Bielefeld | de | PPLA4 | 331906 | شمال الراين-وستفاليا | 52.0333 | 8.5333 | 150.92 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | mannheim | مانهايم | Mannheim | Mannheim | de | PPLA3 | 307960 | بادن-فورتمبرغ | 49.4891 | 8.4669 | 70.84 | frankfurt | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | augsburg | آوغسبورغ | Augsburg | Augsburg | de | PPLA2 | 301105 | بافاريا | 48.3715 | 10.8985 | 57.03 | munich | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | karlsruhe | كارلسروه | Karlsruhe | Karlsruhe | de | PPLA2 | 283799 | بادن-فورتمبرغ | 49.0094 | 8.4044 | 62.56 | stuttgart | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | gelsenkirchen | غيلسنكيرشن | Gelsenkirchen | Gelsenkirchen | de | PPLA3 | 270028 | شمال الراين-وستفاليا | 51.5051 | 7.0965 | 38.13 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | aachen | آخن | Aachen | Aachen | de | PPLA3 | 265208 | شمال الراين-وستفاليا | 50.7766 | 6.0834 | 64.10 | cologne | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | moenchengladbach | مونشنغلادباخ | Mönchengladbach | Mönchengladbach | de | PPLA3 | 261742 | شمال الراين-وستفاليا | 51.1854 | 6.4417 | 23.59 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | kiel | كيل | Kiel | Kiel | de | PPLA | 252668 | شليسفيغ-هولشتاين | 54.3213 | 10.1349 | 86.14 | hamburg | arabic_only |  | 90 | always_include:PPLA |
| ✅ | chemnitz | كيمنتس | Chemnitz | Chemnitz | de | PPLA3 | 247220 | سكسونيا | 50.8357 | 12.9292 | 190.14 | berlin | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | krefeld | كريفلد | Krefeld | Krefeld | de | PPLA3 | 237984 | شمال الراين-وستفاليا | 51.3364 | 6.5538 | 19.49 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | halle-saale | هاله | Halle (Saale) | Halle (Saale) | de | PPL | 237865 | سكسونيا-أنهالت | 51.4816 | 11.9795 | 151.18 | berlin | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | freiburg | فرايبورغ | Freiburg | Freiburg | de | PPLA2 | 237460 | بادن-فورتمبرغ | 47.9959 | 7.8522 | 131.06 | stuttgart | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | mainz | مائنز | Mainz | Mainz | de | PPLA | 222889 | راينلاند-بفالتس | 49.9819 | 8.2801 | 32.09 | frankfurt | arabic_only |  | 90 | always_include:PPLA |
| ✅ | luebeck | لوبك | Lübeck | Lübeck | de | PPLA3 | 212207 | شليسفيغ-هولشتاين | 53.8689 | 10.6873 | 57.73 | hamburg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | kassel | كاسل | Kassel | Kassel | de | PPLA2 | 197230 | هسن | 51.3167 | 9.5000 | 145.92 | frankfurt | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | hamm | هام | Hamm | Hamm | de | PPL | 178967 | شمال الراين-وستفاليا | 51.6803 | 7.8209 | 88.32 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | herne | هرنه | Herne | Herne | de | PPLA3 | 172108 | شمال الراين-وستفاليا | 51.5388 | 7.2257 | 46.71 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | darmstadt | دارمشتات | Darmstadt | Darmstadt | de | PPLA2 | 167029 | هسن | 49.8717 | 8.6503 | 26.70 | frankfurt | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | osnabrueck | أسنابروك | Osnabrück | Osnabrück | de | PPLA3 | 166462 | سكسونيا السفلى | 52.2726 | 8.0498 | 145.67 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | solingen | زولينغن | Solingen | Solingen | de | PPLA3 | 164359 | شمال الراين-وستفاليا | 51.1734 | 7.0845 | 22.49 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ludwigshafen-am-rhein | لودفيغسهافن | Ludwigshafen am Rhein | Ludwigshafen am Rhein | de | PPLA3 | 163196 | راينلاند-بفالتس | 49.4812 | 8.4464 | 72.03 | frankfurt | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | oldenburg | أولدنبورغ | Oldenburg | Oldenburg | de | PPLA3 | 159218 | سكسونيا السفلى | 53.1404 | 8.2148 | 126.61 | hamburg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | neuss | نويس | Neuss | Neuss | de | PPLA3 | 152457 | شمال الراين-وستفاليا | 51.1981 | 6.6850 | 6.99 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | regensburg | ريغنسبورغ | Regensburg | Regensburg | de | PPLA2 | 151389 | بافاريا | 49.0151 | 12.1016 | 88.87 | nuremberg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | heidelberg | هايدلبرغ | Heidelberg | Heidelberg | de | PPLA3 | 143345 | بادن-فورتمبرغ | 49.4077 | 8.6908 | 78.20 | frankfurt | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | paderborn | بادربورن | Paderborn | Paderborn | de | PPLA3 | 142161 | شمال الراين-وستفاليا | 51.7191 | 8.7544 | 147.67 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wuerzburg | فورتسبورغ | Würzburg | Würzburg | de | PPLA2 | 133731 | بافاريا | 49.7939 | 9.9512 | 89.54 | nuremberg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wolfsburg | فولفسبورغ | Wolfsburg | Wolfsburg | de | PPLA3 | 123064 | سكسونيا السفلى | 52.4245 | 10.7815 | 135.91 | hamburg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | goettingen | غوتينغن | Göttingen | Göttingen | de | PPLA3 | 122149 | سكسونيا السفلى | 51.5344 | 9.9323 | 181.01 | frankfurt | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | heilbronn | هايلبرون | Heilbronn | Heilbronn | de | PPLA3 | 120733 | بادن-فورتمبرغ | 49.1399 | 9.2205 | 40.59 | stuttgart | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ulm | أولم | Ulm | Ulm | de | PPLA3 | 120451 | بادن-فورتمبرغ | 48.3984 | 9.9916 | 72.79 | stuttgart | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | pforzheim | بفورتسهايم | Pforzheim | Pforzheim | de | PPLA3 | 119313 | بادن-فورتمبرغ | 48.8844 | 8.6989 | 37.43 | stuttgart | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bremerhaven | برمرهافن | Bremerhaven | Bremerhaven | de | PPL | 118610 | بريمن | 53.5536 | 8.5755 | 93.68 | hamburg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | remscheid | رمشايد | Remscheid | Remscheid | de | PPLA3 | 117118 | شمال الراين-وستفاليا | 51.1798 | 7.1925 | 29.67 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | reutlingen | رويتلينغن | Reutlingen | Reutlingen | de | PPLA3 | 112627 | بادن-فورتمبرغ | 48.4914 | 9.2043 | 31.66 | stuttgart | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | salzgitter | زالتسغيتر | Salzgitter | Salzgitter | de | PPL | 104970 | سكسونيا السفلى | 52.1570 | 10.4154 | 157.57 | hamburg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | moers | مئرس | Moers | Moers | de | PPL | 103487 | شمال الراين-وستفاليا | 51.4534 | 6.6326 | 26.94 | dusseldorf | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | hildesheim | هيلدسهايم | Hildesheim | Hildesheim | de | PPLA3 | 103052 | سكسونيا السفلى | 52.1508 | 9.9511 | 155.74 | hamburg | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | trier | ترير | Trier | Trier | de | PPLA4 | 100129 | راينلاند-بفالتس | 49.7557 | 6.6394 | 113.94 | bonn | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | schwerin | شفيرين | Schwerin | Schwerin | de | PPLA | 96641 | ميكلنبورغ-فوربومرن | 53.6294 | 11.4132 | 94.09 | hamburg | arabic_only |  | 85 | always_include:PPLA |
| ⚠️ | dresden | drێsdn | Dresden | Dresden | de | PPLA | 564904 | سكسونيا | 51.0509 | 13.7383 | 164.96 | berlin | mixed_latin |  | 95 | always_include:PPLA |
| ⚠️ | leipzig | لائپزش | Leipzig | Leipzig | de | PPLA3 | 504971 | سكسونيا | 51.3396 | 12.3713 | 149.16 | berlin | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | muenster | مونستر | Münster | Münster | de | PPLA2 | 308258 | شمال الراين-وستفاليا | 51.9624 | 7.6257 | 100.69 | dusseldorf | arabic_only | wave→muenster-de | 90 | pop_gte_100000 |
| ⚠️ | wiesbaden | wysbyڈn | Wiesbaden | Wiesbaden | de | PPLA | 288850 | هسن | 50.0860 | 8.2444 | 31.35 | frankfurt | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | braunschweig | برانشویگ | Braunschweig | Braunschweig | de | PPLA3 | 244715 | سكسونيا السفلى | 52.2659 | 10.5267 | 147.31 | hamburg | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | magdeburg | myګdybrګ | Magdeburg | Magdeburg | de | PPLA | 244329 | سكسونيا-أنهالت | 52.1313 | 11.6319 | 128.01 | berlin | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | oberhausen | أوبرهاوزن | Oberhausen | Oberhausen | de | PPLA3 | 219176 | شمال الراين-وستفاليا | 51.4781 | 6.8625 | 28.52 | dusseldorf | arabic_only | wave→oberhausen-de | 90 | pop_gte_100000 |
| ⚠️ | erfurt | ayrfrٹ | Erfurt | Erfurt | de | PPLA | 218793 | تورنغن | 50.9773 | 11.0354 | 169.62 | nuremberg | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | hagen | حاجین | Hagen | Hagen | de | PPLA3 | 198972 | شمال الراين-وستفاليا | 51.3608 | 7.4717 | 50.75 | dusseldorf | mixed_script | wave→hagen-de | 90 | pop_gte_100000 |
| ⚠️ | rostock | روستوك | Rostock | Rostock | de | PPLA3 | 198293 | ميكلنبورغ-فوربومرن | 54.0887 | 12.1405 | 153.06 | hamburg | arabic_only | wave→rostock-de | 90 | pop_gte_100000 |
| ⚠️ | potsdam | pwٹsڈam | Potsdam | Potsdam | de | PPLA | 184754 | براندنبورغ | 52.3989 | 13.0657 | 26.65 | berlin | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | saarbruecken | زاربروکن | Saarbrücken | Saarbrücken | de | PPLA | 182971 | سارلاند | 49.2326 | 7.0098 | 154.97 | frankfurt | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | leverkusen | لورکوزن | Leverkusen | Leverkusen | de | PPLA3 | 162738 | شمال الراين-وستفاليا | 51.0303 | 6.9843 | 10.46 | cologne | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | fuerth | فرتھ | Fürth | Fürth | de | PPL | 132036 | بافاريا | 49.4759 | 10.9886 | 6.90 | nuremberg | mixed_unknown | wave→fuerth-de | 90 | pop_gte_100000 |
| ⚠️ | recklinghausen | رکلینگهاوزن | Recklinghausen | Recklinghausen | de | PPLA3 | 122438 | شمال الراين-وستفاليا | 51.6138 | 7.1974 | 52.03 | dusseldorf | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | bottrop | بتتروپ | Bottrop | Bottrop | de | PPLA3 | 119909 | شمال الراين-وستفاليا | 51.5239 | 6.9285 | 34.65 | dusseldorf | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | koblenz | كوبلنس | Koblenz | Koblenz | de | PPLA3 | 107319 | راينلاند-بفالتس | 50.3536 | 7.5788 | 54.54 | bonn | arabic_only | wave→koblenz-de | 90 | pop_gte_100000 |
| ⚠️ | jena | جینا | Jena | Jena | de | PPLA3 | 104712 | تورنغن | 50.9288 | 11.5899 | 168.21 | nuremberg | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | gera | گرا | Gera | Gera | de | PPLA3 | 104659 | تورنغن | 50.8803 | 12.0819 | 174.20 | nuremberg | mixed_script | wave→gera-de | 90 | pop_gte_100000 |
| ⚠️ | erlangen | ارلانگن | Erlangen | Erlangen | de | PPLA3 | 102675 | بافاريا | 49.5910 | 11.0078 | 16.22 | nuremberg | mixed_script |  | 90 | pop_gte_100000 |

## Collision-watch list for DE

Cities the user pre-flagged: `hamburg`, `munich`, `frankfurt`, `cologne`, `dresden`, `leipzig`, `bremen`, `hannover`, `dortmund`, `essen`, `duisburg`, `bochum`, `salzburg`, `graz`, `linz`, `innsbruck`, `zurich`, `geneva`, `basel`, `bern`, `lausanne`, `palermo`, `bari`, `catania`, `verona`, `padua`, `trieste`, `brescia`, `parma`, `modena`, `prato`, `livorno`, `ravenna`, `salerno`, `copenhagen`, `aarhus`, `odense`, `aalborg`, `stockholm`, `gothenburg`, `malmo`, `uppsala`, `oslo`, `bergen`, `trondheim`, `stavanger`, `helsinki`, `espoo`, `tampere`, `vantaa`, `oulu`, `turku`, `reykjavik`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| munich | existing |  | munich | 1505005 |  |  |  |  |
| linz-am-rhein | pending | low | linz | 6008 | 22.89 | bonn |  |  |
| leipzig | pending | high | leipzig | 504971 | 149.16 | berlin |  |  |
| hannover | pending | high | hannover | 515140 | 132.43 | hamburg |  |  |
| hamburg | existing |  | hamburg | 1973896 |  |  |  |  |
| frankfurt-am-main | existing |  | frankfurt | 650000 |  |  |  |  |
| frankfurt | existing |  | frankfurt | - |  |  |  |  |
| essen | pending | high | essen | 593085 | 30.38 | dusseldorf |  |  |
| duisburg | pending | high | duisburg | 504358 | 22.78 | dusseldorf |  |  |
| dresden | pending | high | dresden | 564904 | 164.96 | berlin |  |  |
| dortmund | pending | high | dortmund | 588462 | 57.71 | dusseldorf |  |  |
| bremen | pending | high | bremen | 546501 | 94.90 | hamburg |  |  |
| bochum | pending | high | bochum | 385729 | 41.76 | dusseldorf |  |  |
| bergen-auf-ruegen | pending | low | bergen | 13457 | 211.08 | berlin |  |  |
| bergen-an-der-dumme | pending | low | bergen | 1558 | 97.43 | hamburg |  |  |
| bergen | pending | low | bergen | 13609 | 82.61 | hamburg | wave | bergen-de |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/de-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-de` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/DE.zip
