# GB GeoNames Import Report — Europe-1A

**Country**: United Kingdom (المملكة المتحدة)
**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-15T20:23:31.655Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/gb-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/gb-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/gb-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `europe-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 34288 |
| existing (matched, no action)     | 9 |
| **pending — high tier**           | **86** |
| pending — medium tier             | 0 |
| pending — low tier                | 1068 |
| needs_review                      | 33125 |
| rejected                          | 0 |
| collisions in this wave           | 1253 |
| collisions against existing curated | 29 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 46 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 38 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 0 | ⚠️ manual review |
| `mixed_unknown`               | 2 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 44
**Blocked by ar-gate (high-tier):** 42

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | sheffield | شفيلد | Sheffield | Sheffield | gb | PPLA2 | 556500 | إنجلترا | 53.3830 | -1.4659 | 52.59 | manchester | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | leeds | ليدز | Leeds | Leeds | gb | PPLA2 | 536280 | إنجلترا | 53.7965 | -1.5478 | 57.70 | manchester | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | liverpool | ليفربول | Liverpool | Liverpool | gb | PPLA2 | 496770 | إنجلترا | 53.4106 | -2.9779 | 49.32 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cardiff | كارديف | Cardiff | Cardiff | gb | PPLA | 372089 | ويلز | 51.4800 | -3.1800 | 142.54 | birmingham | arabic_only |  | 90 | always_include:PPLA |
| ✅ | leicester | لايستر | Leicester | Leicester | gb | PPLA2 | 368600 | إنجلترا | 52.6386 | -1.1317 | 54.01 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bradford | برادفورد | Bradford | Bradford | gb | PPLA2 | 366187 | إنجلترا | 53.7939 | -1.7521 | 47.52 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | belfast | بلفاست | Belfast | Belfast | gb | PPLA | 348005 | أيرلندا الشمالية | 54.5968 | -5.9254 | 176.41 | glasgow | arabic_only |  | 90 | always_include:PPLA |
| ✅ | coventry | كوفنتري | Coventry | Coventry | gb | PPLA2 | 345324 | إنجلترا | 52.4066 | -1.5122 | 27.12 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | nottingham | نوتنغهام | Nottingham | Nottingham | gb | PPLA2 | 323632 | إنجلترا | 52.9536 | -1.1505 | 72.00 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | preston | برستون | Preston | Preston | gb | PPLA2 | 313332 | إنجلترا | 53.7628 | -2.7045 | 43.72 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | swansea | سوانزي | Swansea | Swansea | gb | PPLA2 | 300352 | ويلز | 51.6208 | -3.9432 | 170.17 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | newcastle-upon-tyne | نيوكاسل أبون تاين | Newcastle upon Tyne | Newcastle upon Tyne | gb | PPLA2 | 300125 | إنجلترا | 54.9733 | -1.6140 | 147.39 | edinburgh | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | plymouth | بليموث | Plymouth | Plymouth | gb | PPLA2 | 260203 | إنجلترا | 50.3715 | -4.1430 | 282.25 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | milton-keynes | ميلتون كينز | Milton Keynes | Milton Keynes | gb | PPLA2 | 256385 | إنجلترا | 52.0417 | -0.7558 | 73.46 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | oldham | أولدهام | Oldham | Oldham | gb | PPLA2 | 237110 | إنجلترا | 53.5405 | -2.1183 | 10.57 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | luton | لوتن | Luton | Luton | gb | PPLA2 | 225262 | إنجلترا | 51.8797 | -0.4175 | 45.96 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | portsmouth | بورتسموث | Portsmouth | Portsmouth | gb | PPLA2 | 208100 | إنجلترا | 50.7990 | -1.0913 | 103.54 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | aberdeen | أبردين | Aberdeen | Aberdeen | gb | PPLA2 | 198590 | اسكتلندا | 57.1437 | -2.0981 | 148.27 | edinburgh | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ipswich | إبسوتش | Ipswich | Ipswich | gb | PPLA2 | 178835 | إنجلترا | 52.0592 | 1.1555 | 107.50 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | walsall | والسال | Walsall | Walsall | gb | PPLA2 | 172141 | إنجلترا | 52.5853 | -1.9840 | 12.71 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | sunderland | ساندرلند | Sunderland | Sunderland | gb | PPLA2 | 170134 | إنجلترا | 54.9046 | -1.3822 | 163.03 | edinburgh | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bournemouth | بورنموث | Bournemouth | Bournemouth | gb | PPLA2 | 163600 | إنجلترا | 50.7205 | -1.8795 | 150.35 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | york | يورك | York | York | gb | PPLA2 | 156135 | إنجلترا | 53.9576 | -1.0827 | 92.93 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | telford | تلفورد | Telford | Telford | gb | PPLA2 | 155570 | إنجلترا | 52.6766 | -2.4493 | 43.29 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cambridge | كامبريدج | Cambridge | Cambridge | gb | PPLA2 | 145674 | إنجلترا | 52.2000 | 0.1167 | 78.82 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | middlesbrough | ميدلزبرة | Middlesbrough | Middlesbrough | gb | PPLA2 | 142707 | إنجلترا | 54.5762 | -1.2348 | 138.45 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bolton | بولتن | Bolton | Bolton | gb | PPLA2 | 141331 | إنجلترا | 53.5833 | -2.4333 | 17.00 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | gloucester | جلوستر | Gloucester | Gloucester | gb | PPLA2 | 132416 | إنجلترا | 51.8657 | -2.2431 | 73.07 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | exeter | إكزتر | Exeter | Exeter | gb | PPLA2 | 130709 | إنجلترا | 50.7236 | -3.5275 | 226.25 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | colchester | كولتشيستر | Colchester | Colchester | gb | PPL | 130245 | إنجلترا | 51.8892 | 0.9042 | 82.83 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tottenham | تاتنهام | Tottenham | Tottenham | gb | PPL | 130000 | إنجلترا | 51.6037 | -0.0679 | 11.48 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | salford | سالفورد | Salford | Salford | gb | PPLA2 | 129794 | إنجلترا | 53.4877 | -2.2904 | 3.26 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | solihull | سوليهل | Solihull | Solihull | gb | PPLA2 | 126577 | إنجلترا | 52.4143 | -1.7809 | 10.91 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | watford | واتفورد | Watford | Watford | gb | PPL | 125707 | إنجلترا | 51.6553 | -0.3960 | 24.78 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cheltenham | شلتنهام | Cheltenham | Cheltenham | gb | PPL | 118836 | إنجلترا | 51.9001 | -2.0797 | 66.44 | birmingham | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | rotherham | راترهام | Rotherham | Rotherham | gb | PPLA2 | 117618 | إنجلترا | 53.4301 | -1.3568 | 58.92 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | doncaster | دونكاستر | Doncaster | Doncaster | gb | PPLA2 | 113566 | إنجلترا | 53.5228 | -1.1312 | 73.66 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | chelmsford | تشيلمسفورد | Chelmsford | Chelmsford | gb | PPLA2 | 111511 | إنجلترا | 51.7358 | 0.4696 | 48.43 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wakefield | ويكفيلد | Wakefield | Wakefield | gb | PPLA2 | 109766 | إنجلترا | 53.6833 | -1.4977 | 54.09 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | walthamstow | والتامستو | Walthamstow | Walthamstow | gb | PPLA3 | 109424 | إنجلترا | 51.5907 | -0.0208 | 11.85 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | dagenham | داجنهام | Dagenham | Dagenham | gb | PPLA3 | 108368 | إنجلترا | 51.5500 | 0.1667 | 20.91 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | basingstoke | باسينجستوك | Basingstoke | Basingstoke | gb | PPL | 107642 | إنجلترا | 51.2625 | -1.0871 | 71.92 | london | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | lincoln | لنكولن | Lincoln | Lincoln | gb | PPLA2 | 103813 | إنجلترا | 53.2268 | -0.5379 | 116.61 | manchester | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | eastbourne | إيست بورن | Eastbourne | Eastbourne | gb | PPL | 101689 | إنجلترا | 50.7687 | 0.2845 | 87.03 | london | arabic_only |  | 90 | pop_gte_100000 |
| ⚠️ | bristol | برسٹل نگر | Bristol | Bristol | gb | PPLA2 | 479024 | إنجلترا | 51.4552 | -2.5966 | 124.43 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | birkenhead | برکن‌هد | Birkenhead | Birkenhead | gb | PPL | 325264 | إنجلترا | 53.3934 | -3.0148 | 52.06 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | brighton | برائٹن | Brighton | Brighton | gb | PPL | 283870 | إنجلترا | 50.8284 | -0.1395 | 75.51 | london | mixed_script | wave→brighton-gb | 90 | pop_gte_100000 |
| ⚠️ | derby | داربی، انگلستان | Derby | Derby | gb | PPLA2 | 270468 | إنجلترا | 52.9228 | -1.4766 | 55.98 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | southampton | ساؤتھمپٹن | Southampton | Southampton | gb | PPLA2 | 269781 | إنجلترا | 50.9040 | -1.4043 | 111.40 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | wolverhampton | ولورهمپتون | Wolverhampton | Wolverhampton | gb | PPLA2 | 263700 | إنجلترا | 52.5855 | -2.1230 | 19.22 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | stoke-on-trent | استوک-آن-ترنت | Stoke-on-Trent | Stoke-on-Trent | gb | PPLA2 | 258366 | إنجلترا | 53.0042 | -2.1854 | 53.14 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | northampton | نارتھیمپٹن | Northampton | Northampton | gb | PPLA2 | 245899 | إنجلترا | 52.2500 | -0.8833 | 73.24 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | bexley | بکسلی | Bexley | Bexley | gb | PPLL | 228000 | إنجلترا | 51.4416 | 0.1487 | 20.50 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | barking | بارکینگ | Barking | Barking | gb | PPL | 218534 | إنجلترا | 51.5333 | 0.0833 | 14.89 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | swindon | سوئیندون | Swindon | Swindon | gb | PPLA2 | 201669 | إنجلترا | 51.5580 | -1.7812 | 103.48 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | dudley | دادلی، انگلستان | Dudley | Dudley | gb | PPLA2 | 199059 | إنجلترا | 52.5000 | -2.0833 | 13.15 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | wigan | ویگان | Wigan | Wigan | gb | PPLA2 | 175405 | إنجلترا | 53.5430 | -2.6371 | 26.98 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | croydon | کرویدون | Croydon | Croydon | gb | PPLA3 | 173314 | إنجلترا | 51.3833 | -0.1000 | 13.93 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | warrington | وارینگتون | Warrington | Warrington | gb | PPLA2 | 172330 | إنجلترا | 53.3925 | -2.5802 | 24.42 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | mansfield | منزفیلد | Mansfield | Mansfield | gb | PPL | 171958 | إنجلترا | 53.1333 | -1.2000 | 79.32 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | ilford | ایلفورد | Ilford | Ilford | gb | PPLA3 | 168168 | إنجلترا | 51.5577 | 0.0728 | 14.96 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | peterborough | پیتربورو | Peterborough | Peterborough | gb | PPLA2 | 163379 | إنجلترا | 52.5736 | -0.2478 | 111.54 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | oxford | آکسفورد | Oxford | Oxford | gb | PPLA2 | 162100 | إنجلترا | 51.7522 | -1.2560 | 82.49 | london | mixed_script | wave→oxford-gb | 90 | pop_gte_100000 |
| ⚠️ | newport | نيوبورت | Newport | Newport | gb | PPLA2 | 161506 | ويلز | 51.5877 | -2.9983 | 125.39 | birmingham | arabic_only | wave→newport-gb | 90 | pop_gte_100000 |
| ⚠️ | poole | پول، انگلستان | Poole | Poole | gb | PPL | 151500 | إنجلترا | 50.7143 | -1.9846 | 156.77 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | burnley | برنلی | Burnley | Burnley | gb | PPLA4 | 149422 | إنجلترا | 53.8000 | -2.2333 | 35.50 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | harrow | هارو، لندن | Harrow | Harrow | gb | PPLA3 | 149246 | إنجلترا | 51.5784 | -0.3321 | 16.18 | london | mixed_unknown |  | 90 | pop_gte_100000 |
| ⚠️ | huddersfield | هادرزفیلد | Huddersfield | Huddersfield | gb | PPLA2 | 149017 | إنجلترا | 53.6490 | -1.7842 | 35.59 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | dundee | داندی | Dundee | Dundee | gb | PPLA2 | 148210 | اسكتلندا | 56.4691 | -2.9749 | 58.86 | edinburgh | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | blackburn | بلک‌برن | Blackburn | Blackburn | gb | PPLA2 | 146521 | إنجلترا | 53.7500 | -2.4833 | 33.88 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | blackpool | بلاكبول | Blackpool | Blackpool | gb | PPLA2 | 145007 | إنجلترا | 53.8167 | -3.0500 | 65.01 | manchester | arabic_only | wave→blackpool-gb | 90 | pop_gte_100000 |
| ⚠️ | basildon | بزیلدون | Basildon | Basildon | gb | PPL | 144859 | إنجلترا | 51.5684 | 0.4578 | 41.07 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | norwich | ناروچ | Norwich | Norwich | gb | PPLA2 | 143135 | إنجلترا | 52.6278 | 1.2983 | 158.19 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | stockport | استاک‌پورت | Stockport | Stockport | gb | PPLA2 | 139052 | إنجلترا | 53.4098 | -2.1576 | 9.70 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | high-wycombe | های وایکام | High Wycombe | High Wycombe | gb | PPL | 133204 | إنجلترا | 51.6291 | -0.7493 | 45.04 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | burton-upon-trent | بارتون آپون ترنت | Burton upon Trent | Burton upon Trent | gb | PPL | 122199 | إنجلترا | 52.8073 | -1.6426 | 39.42 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | worthing | وورتینگ | Worthing | Worthing | gb | PPL | 113866 | إنجلترا | 50.8180 | -0.3754 | 78.58 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | chesterfield | چسترفیلد | Chesterfield | Chesterfield | gb | PPL | 113057 | إنجلترا | 53.2500 | -1.4167 | 60.51 | manchester | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | sutton-coldfield | ساتن کولدفیلد | Sutton Coldfield | Sutton Coldfield | gb | PPL | 109899 | إنجلترا | 52.5667 | -1.8167 | 10.24 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | maidstone | میدنستون | Maidstone | Maidstone | gb | PPLA2 | 107627 | إنجلترا | 51.2667 | 0.5167 | 52.12 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | bedford | بدفورد، انگلستان | Bedford | Bedford | gb | PPLA2 | 106940 | إنجلترا | 52.1346 | -0.4663 | 73.52 | london | mixed_script | wave→bedford-gb | 90 | pop_gte_100000 |
| ⚠️ | woking | وودکینگ | Woking | Woking | gb | PPL | 103900 | إنجلترا | 51.3190 | -0.5589 | 36.51 | london | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | west-bromwich | وست برومویچ | West Bromwich | West Bromwich | gb | PPL | 103112 | إنجلترا | 52.5187 | -1.9945 | 7.92 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | worcester | ورکستر | Worcester | Worcester | gb | PPLA2 | 101659 | إنجلترا | 52.1893 | -2.2200 | 39.89 | birmingham | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | bath | باتھ | Bath | Bath | gb | PPLA2 | 101557 | إنجلترا | 51.3751 | -2.3617 | 127.70 | birmingham | mixed_unknown | wave→bath-gb | 90 | pop_gte_100000 |
| ⚠️ | gillingham | جیلینگهام، کنت | Gillingham | Gillingham | gb | PPL | 101187 | إنجلترا | 51.3891 | 0.5486 | 48.69 | london | mixed_script |  | 90 | pop_gte_100000 |

## What to do next

1. Read the table above. The **✅** rows pass the ar-gate;
   the **⚠️** rows need manual review for either Arabic name
   quality or slug collision.
2. For each **✅** row you want in curated:
   open `db/places/candidates/gb-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-gb` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/GB.zip
