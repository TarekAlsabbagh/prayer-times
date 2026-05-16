# CA GeoNames Import Report — Americas-1A

**Country**: Canada (كندا)
**Wave**: `CURATED-GEODATA-AMERICAS-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T11:42:20.968Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/ca-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/ca-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/ca-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `americas-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 19706 |
| existing (matched, no action)     | 17 |
| **pending — high tier**           | **59** |
| pending — medium tier             | 0 |
| pending — low tier                | 630 |
| needs_review                      | 18999 |
| rejected                          | 1 |
| collisions in this wave           | 6623 |
| collisions against existing curated | 133 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 40 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 16 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 1 | ⚠️ manual review |
| `mixed_unknown`               | 2 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 12
**Blocked by ar-gate (high-tier):** 47

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | laval | لافال | Laval | Laval | ca | PPL | 438366 | كيبيك | 45.5699 | -73.6920 | 12.33 | montreal | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | gatineau | غاتينو | Gatineau | Gatineau | ca | PPL | 300045 | كيبيك | 45.4772 | -75.7016 | 6.21 | ottawa | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | saskatoon | ساسكاتون | Saskatoon | Saskatoon | ca | PPL | 266141 | ساسكاتشوان | 52.1324 | -106.6689 | 525.29 | calgary | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | longueuil | لونغوي | Longueuil | Longueuil | ca | PPLA2 | 229330 | كيبيك | 45.5152 | -73.4682 | 7.87 | montreal | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | saguenay | ساغينيه | Saguenay | Saguenay | ca | PPL | 148886 | كيبيك | 48.4168 | -71.0657 | 375.60 | montreal | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | coquitlam | كوكويتلام | Coquitlam | Coquitlam | ca | PPLA3 | 148625 | كولومبيا البريطانية | 49.2846 | -122.7822 | 24.56 | vancouver | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | kelowna | كيلونا | Kelowna | Kelowna | ca | PPL | 144576 | كولومبيا البريطانية | 49.8831 | -119.4857 | 270.40 | vancouver | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | st-catharines | سانت كاثرينز | St. Catharines | St. Catharines | ca | PPL | 136803 | أونتاريو | 43.1713 | -79.2427 | 54.78 | toronto | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | saanich | سانيتش | Saanich | Saanich | ca | PPL | 117735 | كولومبيا البريطانية | 48.5496 | -123.3693 | 83.51 | vancouver | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | st-johns | سانت جونز | St. John's | St. John's | ca | PPLA | 110525 | نيوفاوندلاند ولابرادور | 47.5649 | -52.7093 | 1606.94 | montreal | arabic_only |  | 90 | always_include:PPLA |
| ✅ | kamloops | كاملوبس | Kamloops | Kamloops | ca | PPL | 104460 | كولومبيا البريطانية | 50.6665 | -120.3192 | 252.58 | vancouver | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | iqaluit | إيكالويت | Iqaluit | Iqaluit | ca | PPLA | 7429 | نونافوت | 63.7470 | -68.5173 | 2053.13 | montreal | arabic_only |  | 75 | always_include:PPLA |
| ⚠️ | edmonton | إدمونتون | Edmonton | Edmonton | ca | PPLA | 1010899 | ألبرتا | 53.5501 | -113.4687 | 281.59 | calgary | arabic_only | wave→edmonton-ca | 95 | always_include:PPLA |
| ⚠️ | winnipeg | wny pyګ | Winnipeg | Winnipeg | ca | PPLA | 749607 | مانيتوبا | 49.8844 | -97.1470 | 1202.20 | calgary | mixed_script | wave→winnipeg-ca | 95 | always_include:PPLA |
| ⚠️ | mississauga | مسس ساگا | Mississauga | Mississauga | ca | PPL | 717961 | أونتاريو | 43.5789 | -79.6583 | 23.64 | toronto | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | brampton | برامبتون | Brampton | Brampton | ca | PPL | 656480 | أونتاريو | 43.6834 | -79.7663 | 31.00 | toronto | arabic_only | wave→brampton-ca | 95 | pop_gte_100000 |
| ⚠️ | hamilton | هاميلتون | Hamilton | Hamilton | ca | PPL | 569353 | أونتاريو | 43.2501 | -79.8496 | 58.54 | toronto | arabic_only | wave→hamilton-ca | 95 | pop_gte_100000 |
| ⚠️ | surrey | سوري، كولومبيا البريطانية | Surrey | Surrey | ca | PPL | 568322 | كولومبيا البريطانية | 49.1063 | -122.8251 | 29.09 | vancouver | mixed_unknown | wave→surrey-ca | 95 | pop_gte_100000 |
| ⚠️ | quebec | مدينة كيبك | Québec | Québec | ca | PPLA | 531902 | كيبيك | 46.8123 | -71.2145 | 232.53 | montreal | arabic_only | wave→quebec-ca | 95 | always_include:PPLA |
| ⚠️ | halifax | هاليفاكس | Halifax | Halifax | ca | PPLA | 471559 | نوفا سكوشا | 44.6427 | -63.5769 | 789.79 | montreal | arabic_only | wave→halifax-ca | 90 | always_include:PPLA |
| ⚠️ | london | لندن | London | London | ca | PPL | 422324 | أونتاريو | 42.9834 | -81.2330 | 167.16 | toronto | arabic_only | wave→london-ca | 90 | pop_gte_100000 |
| ⚠️ | markham | ماركام | Markham | Markham | ca | PPL | 338503 | أونتاريو | 43.8668 | -79.2663 | 25.54 | toronto | arabic_only | wave→markham-ca | 90 | pop_gte_100000 |
| ⚠️ | vaughan | فاوجان | Vaughan | Vaughan | ca | PPL | 323103 | أونتاريو | 43.8361 | -79.4983 | 22.34 | toronto | arabic_only | wave→vaughan-ca | 90 | pop_gte_100000 |
| ⚠️ | victoria | فكتوريا | Victoria | Victoria | ca | PPLA | 289625 | كولومبيا البريطانية | 48.4359 | -123.3516 | 95.66 | vancouver | arabic_only | wave→victoria-ca | 90 | always_include:PPLA |
| ⚠️ | kitchener | كيتشنر | Kitchener | Kitchener | ca | PPLA2 | 256885 | أونتاريو | 43.4254 | -80.5112 | 94.39 | toronto | arabic_only | wave→kitchener-ca | 90 | pop_gte_100000 |
| ⚠️ | burnaby | brnabے | Burnaby | Burnaby | ca | PPLA3 | 249125 | كولومبيا البريطانية | 49.2664 | -122.9526 | 12.33 | vancouver | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | windsor | وندسور | Windsor | Windsor | ca | PPL | 229660 | أونتاريو | 42.3001 | -83.0165 | 331.63 | toronto | arabic_only | wave→windsor-ca | 90 | pop_gte_100000 |
| ⚠️ | regina | رجاینا | Regina | Regina | ca | PPLA | 226404 | ساسكاتشوان | 50.4501 | -104.6178 | 667.98 | calgary | mixed_script | wave→regina-ca | 90 | always_include:PPLA |
| ⚠️ | oakville | أوكفيل | Oakville | Oakville | ca | PPL | 213759 | أونتاريو | 43.4501 | -79.6829 | 33.07 | toronto | arabic_only | wave→oakville-ca | 90 | pop_gte_100000 |
| ⚠️ | richmond | ريتشموند | Richmond | Richmond | ca | PPL | 209937 | كولومبيا البريطانية | 49.1700 | -123.1368 | 12.58 | vancouver | arabic_only | wave→richmond-ca | 90 | pop_gte_100000 |
| ⚠️ | richmond-hill | ريتشموند هيل | Richmond Hill | Richmond Hill | ca | PPL | 202022 | أونتاريو | 43.8711 | -79.4373 | 24.62 | toronto | arabic_only | wave→richmond-hill-ca | 90 | pop_gte_100000 |
| ⚠️ | burlington | brlngٹn  awnٹaryw | Burlington | Burlington | ca | PPL | 186948 | أونتاريو | 43.3862 | -79.8371 | 47.13 | toronto | mixed_script | wave→burlington-ca | 90 | pop_gte_100000 |
| ⚠️ | oshawa | أوشاوا | Oshawa | Oshawa | ca | PPL | 175383 | أونتاريو | 43.9001 | -78.8496 | 50.89 | toronto | arabic_only | wave→oshawa-ca | 90 | pop_gte_100000 |
| ⚠️ | greater-sudbury | سادبری بزرگ | Greater Sudbury | Greater Sudbury | ca | PPL | 166004 | أونتاريو | 46.4900 | -80.9900 | 339.72 | toronto | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | barrie | باري | Barrie | Barrie | ca | PPL | 147829 | أونتاريو | 44.4001 | -79.6663 | 86.08 | toronto | arabic_only | wave→barrie-ca | 90 | pop_gte_100000 |
| ⚠️ | trois-rivieres | ترو-ریویائر | Trois-Rivières | Trois-Rivières | ca | PPL | 144472 | كيبيك | 46.3451 | -72.5477 | 122.54 | montreal | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | guelph | غويلف | Guelph | Guelph | ca | PPL | 143740 | أونتاريو | 43.5459 | -80.2560 | 71.29 | toronto | arabic_only | wave→guelph-ca | 90 | pop_gte_100000 |
| ⚠️ | levis | لوی، کبک | Lévis | Lévis | ca | PPL | 143414 | كيبيك | 46.8033 | -71.1779 | 234.12 | montreal | mixed_script | wave→levis-ca | 90 | pop_gte_100000 |
| ⚠️ | abbotsford | أبوتسفورد | Abbotsford | Abbotsford | ca | PPL | 141397 | كولومبيا البريطانية | 49.0580 | -122.2526 | 67.88 | vancouver | arabic_only | wave→abbotsford-ca | 90 | pop_gte_100000 |
| ⚠️ | whitby | ويتبي | Whitby | Whitby | ca | PPL | 138501 | أونتاريو | 43.8834 | -78.9329 | 44.30 | toronto | arabic_only | wave→whitby-ca | 90 | pop_gte_100000 |
| ⚠️ | milton | ميلتون | Milton | Milton | ca | PPLA2 | 132979 | أونتاريو | 43.5168 | -79.8829 | 43.01 | toronto | arabic_only | wave→milton-ca | 90 | pop_gte_100000 |
| ⚠️ | langley | لانغلي، كولومبيا البريطانية | Langley | Langley | ca | PPL | 132603 | كولومبيا البريطانية | 49.1011 | -122.6588 | 39.17 | vancouver | mixed_unknown | wave→langley-ca | 90 | pop_gte_100000 |
| ⚠️ | kingston | كينغستون | Kingston | Kingston | ca | PPL | 132485 | أونتاريو | 44.2298 | -76.4810 | 146.22 | ottawa | arabic_only | wave→kingston-ca | 90 | pop_gte_100000 |
| ⚠️ | cambridge | كامبريدج | Cambridge | Cambridge | ca | PPL | 129920 | أونتاريو | 43.3601 | -80.3127 | 81.74 | toronto | arabic_only | wave→cambridge-ca | 90 | pop_gte_100000 |
| ⚠️ | sherbrooke | شربروک | Sherbrooke | Sherbrooke | ca | PPL | 129447 | كيبيك | 45.4001 | -71.8991 | 130.62 | montreal | mixed_script | wave→sherbrooke-ca | 90 | pop_gte_100000 |
| ⚠️ | ajax | أجاكس | Ajax | Ajax | ca | PPL | 119677 | أونتاريو | 43.8501 | -79.0329 | 35.65 | toronto | arabic_only | wave→ajax-ca | 90 | pop_gte_100000 |
| ⚠️ | terrebonne | تربون، کبک | Terrebonne | Terrebonne | ca | PPL | 111575 | كيبيك | 45.7000 | -73.6473 | 22.92 | montreal | mixed_script | wave→terrebonne-ca | 90 | pop_gte_100000 |
| ⚠️ | thunder-bay | تھنڈر بے | Thunder Bay | Thunder Bay | ca | PPL | 108843 | أونتاريو | 48.3820 | -89.2502 | 924.58 | toronto | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | sydney | سيدنى | Sydney | Sydney | ca | PPL | 105968 | نوفا سكوشا | 46.1351 | -60.1831 | 1038.37 | montreal | arabic_only | wave→sydney-ca | 90 | pop_gte_100000 |
| ⚠️ | waterloo | واترلو | Waterloo | Waterloo | ca | PPL | 104986 | أونتاريو | 43.4668 | -80.5164 | 93.63 | toronto | arabic_only | wave→waterloo-ca | 90 | pop_gte_100000 |
| ⚠️ | brantford | برانتفورد | Brantford | Brantford | ca | PPL | 104688 | أونتاريو | 43.1334 | -80.2664 | 91.83 | toronto | arabic_only | wave→brantford-ca | 90 | pop_gte_100000 |
| ⚠️ | lethbridge | لث‌بریج | Lethbridge | Lethbridge | ca | PPL | 103197 | ألبرتا | 49.7000 | -112.8186 | 173.94 | calgary | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | delta | ديلتا | Delta | Delta | ca | PPL | 101668 | كولومبيا البريطانية | 49.1440 | -122.9068 | 21.89 | vancouver | arabic_only | wave→delta-ca | 90 | pop_gte_100000 |
| ⚠️ | dartmouth | دارتموث | Dartmouth | Dartmouth | ca | PPL | 101343 | نوفا سكوشا | 44.6713 | -63.5772 | 789.20 | montreal | arabic_only | wave→dartmouth-ca | 90 | pop_gte_100000 |
| ⚠️ | red-deer | ryڈ ڈyyr  albrٹa | Red Deer | Red Deer | ca | PPL | 100844 | ألبرتا | 52.2668 | -113.8020 | 137.16 | calgary | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | fredericton | فردریکتون | Fredericton | Fredericton | ca | PPLA | 63116 | نيو برونزويك | 45.9454 | -66.6656 | 537.86 | montreal | mixed_script |  | 85 | always_include:PPLA |
| ⚠️ | charlottetown | charlwټ ټawn | Charlottetown | Charlottetown | ca | PPLA | 38809 | جزيرة الأمير إدوارد | 46.2346 | -63.1256 | 811.96 | montreal | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | whitehorse | wayٹ ہars  ywkwn | Whitehorse | Whitehorse | ca | PPLA | 28201 | يوكون | 60.7161 | -135.0538 | 1476.63 | vancouver | mixed_script | wave→whitehorse-ca | 80 | always_include:PPLA |
| ⚠️ | yellowknife | ylwknyfے | Yellowknife | Yellowknife | ca | PPLA | 20340 | الأقاليم الشمالية الغربية | 62.4541 | -114.3725 | 1268.80 | calgary | mixed_script |  | 80 | always_include:PPLA |

## Collision-watch list for CA

Cities the user pre-flagged: `birmingham`, `manchester`, `cambridge`, `dublin`, `athens`, `saint-petersburg`, `toledo`, `rochester`, `salem`, `victoria`, `cordoba`, `merida`, `leon`, `granada`, `santiago`, `washington`, `new-york`, `los-angeles`, `chicago`, `montreal`, `toronto`, `vancouver`, `mexico-city`, `guadalajara`, `monterrey`, `newcastle`, `peterborough`, `york`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cambridge | pending | high | cambridge | 129920 | 81.74 | toronto | wave | cambridge-ca |
| cambridge-bay | pending | low | cambridge | 1760 | 2065.45 | calgary |  |  |
| cambridge-narrows | pending | low | cambridge | 715 | 591.70 | montreal |  |  |
| montreal | existing |  | montreal | 1762949 |  |  |  |  |
| peterborough | pending | low | peterborough | 85807 | 111.64 | toronto | wave | peterborough-ca |
| toronto | existing |  | toronto | - |  |  |  |  |
| toronto | existing |  | toronto | 2794356 |  |  |  |  |
| vancouver | existing |  | vancouver | 662248 |  |  |  |  |
| victoria | pending | low | victoria | 139 | 784.49 | montreal | wave | victoria-ca |
| victoria | pending | high | victoria | 289625 | 95.66 | vancouver | wave | victoria-ca |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/ca-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-ca` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/CA.zip
