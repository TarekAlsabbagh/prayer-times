# Europe-1A — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E — Strategy A + Stage 3.5 ar-quality gate
**Generated**: 2026-05-15T20:23:32.578Z

## What this report tells you

Europe is the first wave where Arabic names are NOT authoritative
in GeoNames. This report classifies each HIGH-tier candidate by
the quality of its Arabic name, so you can quickly:

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
| GB | 86 | 0 | 46 | 38 | 0 | 0 | **44** | **42** |
| IE | 3 | 0 | 2 | 1 | 0 | 0 | **2** | **1** |
| FR | 30 | 0 | 21 | 9 | 0 | 0 | **19** | **11** |
| BE | 7 | 0 | 6 | 1 | 0 | 0 | **6** | **1** |
| NL | 21 | 0 | 11 | 9 | 1 | 0 | **11** | **10** |
| LU | 4 | 0 | 2 | 2 | 0 | 0 | **2** | **2** |
| **TOTAL** | **151** | **0** | **88** | **60** | **1** | **0** | **84** | **67** |

## Collision summary

| Collision type | Count (high-tier only) |
| --- | ---: |
| Within Europe-1A wave | 10 |
| Against existing curated | 0 |

## arabic_only (88)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gb | sheffield | شفيلد | Sheffield | Sheffield | PPLA2 | 556500 | إنجلترا | 52.59 |  |  |
| gb | leeds | ليدز | Leeds | Leeds | PPLA2 | 536280 | إنجلترا | 57.70 |  |  |
| gb | liverpool | ليفربول | Liverpool | Liverpool | PPLA2 | 496770 | إنجلترا | 49.32 |  |  |
| nl | utrecht | أوترخت | Utrecht | Utrecht | PPLA | 376435 | أوتريخت | 34.17 |  |  |
| gb | cardiff | كارديف | Cardiff | Cardiff | PPLA | 372089 | ويلز | 142.54 |  |  |
| gb | leicester | لايستر | Leicester | Leicester | PPLA2 | 368600 | إنجلترا | 54.01 |  |  |
| gb | bradford | برادفورد | Bradford | Bradford | PPLA2 | 366187 | إنجلترا | 47.52 |  |  |
| gb | belfast | بلفاست | Belfast | Belfast | PPLA | 348005 | أيرلندا الشمالية | 176.41 |  |  |
| gb | coventry | كوفنتري | Coventry | Coventry | PPLA2 | 345324 | إنجلترا | 27.12 |  |  |
| fr | nantes | نانت | Nantes | Nantes | PPLA | 325070 | بايز دو لا لوار | 275.06 |  |  |
| gb | nottingham | نوتنغهام | Nottingham | Nottingham | PPLA2 | 323632 | إنجلترا | 72.00 |  |  |
| gb | preston | برستون | Preston | Preston | PPLA2 | 313332 | إنجلترا | 43.72 |  |  |
| gb | swansea | سوانزي | Swansea | Swansea | PPLA2 | 300352 | ويلز | 170.17 |  |  |
| gb | newcastle-upon-tyne | نيوكاسل أبون تاين | Newcastle upon Tyne | Newcastle upon Tyne | PPLA2 | 300125 | إنجلترا | 147.39 |  |  |
| be | gent | جنت | Gent | Gent | PPL | 265086 | الإقليم الفلمنكي | 49.72 |  |  |
| gb | plymouth | بليموث | Plymouth | Plymouth | PPLA2 | 260203 | إنجلترا | 282.25 |  |  |
| gb | milton-keynes | ميلتون كينز | Milton Keynes | Milton Keynes | PPLA2 | 256385 | إنجلترا | 73.46 |  |  |
| fr | montpellier | مونبلييه | Montpellier | Montpellier | PPLA2 | 248252 | أوكسيتاني | 125.52 | wave | montpellier-fr |
| gb | oldham | أولدهام | Oldham | Oldham | PPLA2 | 237110 | إنجلترا | 10.57 |  |  |
| fr | rennes | رن | Rennes | Rennes | PPLA | 227830 | بريتاني | 308.08 |  |  |
| gb | luton | لوتن | Luton | Luton | PPLA2 | 225262 | إنجلترا | 45.96 |  |  |
| gb | portsmouth | بورتسموث | Portsmouth | Portsmouth | PPLA2 | 208100 | إنجلترا | 103.54 |  |  |
| be | charleroi | شارلروآ | Charleroi | Charleroi | PPL | 200132 | الإقليم الوالوني | 49.24 |  |  |
| gb | aberdeen | أبردين | Aberdeen | Aberdeen | PPLA2 | 198590 | اسكتلندا | 148.27 |  |  |
| be | liege | لييج | Liège | Liège | PPL | 195278 | الإقليم الوالوني | 88.87 |  |  |
| ie | cork | كورك | Cork | Cork | PPLA2 | 190384 | مونستر | 219.80 |  |  |
| fr | le-havre | لو آور | Le Havre | Le Havre | PPLA3 | 185972 | نورماندي | 177.85 |  |  |
| nl | breda | بردا | Breda | Breda | PPL | 184126 | برابانت الشمالية | 62.95 |  |  |
| gb | ipswich | إبسوتش | Ipswich | Ipswich | PPLA2 | 178835 | إنجلترا | 107.50 |  |  |
| nl | nijmegen | نايميخن | Nijmegen | Nijmegen | PPL | 177359 | خيلدرلاند | 87.22 |  |  |
| nl | almere-stad | آلمره استاد | Almere Stad | Almere Stad | PPL | 176432 | فليفولاند | 21.05 |  |  |
| fr | saint-etienne | سانت إتيان | Saint-Étienne | Saint-Étienne | PPLA2 | 176280 | أوفيرني-رون-ألب | 50.49 |  |  |
| gb | walsall | والسال | Walsall | Walsall | PPLA2 | 172141 | إنجلترا | 12.71 |  |  |
| gb | sunderland | ساندرلند | Sunderland | Sunderland | PPLA2 | 170134 | إنجلترا | 163.03 |  |  |
| fr | toulon | تولون | Toulon | Toulon | PPLA2 | 168701 | بروفنس-ألب-كوت دازور | 49.15 |  |  |
| gb | bournemouth | بورنموث | Bournemouth | Bournemouth | PPLA2 | 163600 | إنجلترا | 150.35 |  |  |
| nl | haarlem | هارلم | Haarlem | Haarlem | PPLA | 162543 | هولندا الشمالية | 18.20 |  |  |
| gb | newport | نيوبورت | Newport | Newport | PPLA2 | 161506 | ويلز | 125.39 | wave | newport-gb |
| nl | s-hertogenbosch | هرتوجن بوش | 's-Hertogenbosch | 's-Hertogenbosch | PPLA | 160783 | برابانت الشمالية | 79.20 |  |  |
| be | anderlecht | آندرلخت | Anderlecht | Anderlecht | PPLA4 | 160553 | بروكسل العاصمة | 3.04 |  |  |
| fr | dijon | ديجون | Dijon | Dijon | PPLA | 159941 | بورغوني-فرانش-كونتيه | 172.83 |  |  |
| fr | grenoble | غرونوبل | Grenoble | Grenoble | PPLA2 | 158552 | أوفيرني-رون-ألب | 94.52 |  |  |
| gb | york | يورك | York | York | PPLA2 | 156135 | إنجلترا | 92.93 |  |  |
| gb | telford | تلفورد | Telford | Telford | PPLA2 | 155570 | إنجلترا | 43.29 |  |  |
| nl | enschede | إنسخيده | Enschede | Enschede | PPL | 153655 | أوفرآيسل | 136.47 |  |  |
| fr | clermont-ferrand | كليرمون فيران | Clermont-Ferrand | Clermont-Ferrand | PPLA2 | 147865 | أوفيرني-رون-ألب | 135.65 |  |  |
| fr | aix-en-provence | آكس أون بروفانس | Aix-en-Provence | Aix-en-Provence | PPLA3 | 146821 | بروفنس-ألب-كوت دازور | 26.57 |  |  |
| gb | cambridge | كامبريدج | Cambridge | Cambridge | PPLA2 | 145674 | إنجلترا | 78.82 |  |  |
| gb | blackpool | بلاكبول | Blackpool | Blackpool | PPLA2 | 145007 | إنجلترا | 65.01 | wave | blackpool-gb |
| fr | le-mans | لو مان | Le Mans | Le Mans | PPLA2 | 144515 | بايز دو لا لوار | 184.88 |  |  |
| gb | middlesbrough | ميدلزبرة | Middlesbrough | Middlesbrough | PPLA2 | 142707 | إنجلترا | 138.45 |  |  |
| fr | tours | تور | Tours | Tours | PPLA2 | 141621 | سنتر-فال دو لوار | 203.42 |  |  |
| gb | bolton | بولتن | Bolton | Bolton | PPLA2 | 141331 | إنجلترا | 17.00 |  |  |
| fr | limoges | ليموج | Limoges | Limoges | PPLA2 | 141176 | نوفيل-أكيتانيا | 180.69 | wave | limoges-fr |
| nl | apeldoorn | آبلدورن | Apeldoorn | Apeldoorn | PPL | 136670 | خيلدرلاند | 74.55 |  |  |
| gb | gloucester | جلوستر | Gloucester | Gloucester | PPLA2 | 132416 | إنجلترا | 73.07 |  |  |
| fr | villeurbanne | فيلوربان | Villeurbanne | Villeurbanne | PPL | 131445 | أوفيرني-رون-ألب | 3.40 |  |  |
| gb | exeter | إكزتر | Exeter | Exeter | PPLA2 | 130709 | إنجلترا | 226.25 |  |  |
| gb | colchester | كولتشيستر | Colchester | Colchester | PPL | 130245 | إنجلترا | 82.83 |  |  |
| gb | tottenham | تاتنهام | Tottenham | Tottenham | PPL | 130000 | إنجلترا | 11.48 |  |  |
| gb | salford | سالفورد | Salford | Salford | PPLA2 | 129794 | إنجلترا | 3.26 |  |  |
| fr | besancon | بزانسون | Besançon | Besançon | PPLA2 | 128426 | بورغوني-فرانش-كونتيه | 188.27 |  |  |
| gb | solihull | سوليهل | Solihull | Solihull | PPLA2 | 126577 | إنجلترا | 10.91 |  |  |
| gb | watford | واتفورد | Watford | Watford | PPL | 125707 | إنجلترا | 24.78 |  |  |
| nl | leeuwarden | ليوواردن | Leeuwarden | Leeuwarden | PPLA | 124481 | فريسلاند | 111.05 |  |  |
| fr | metz | متز | Metz | Metz | PPLA2 | 123914 | غران إست | 280.27 |  |  |
| gb | cheltenham | شلتنهام | Cheltenham | Cheltenham | PPL | 118836 | إنجلترا | 66.44 |  |  |
| be | brugge | بروج | Brugge | Brugge | PPL | 118509 | الإقليم الفلمنكي | 88.36 |  |  |
| gb | rotherham | راترهام | Rotherham | Rotherham | PPLA2 | 117618 | إنجلترا | 58.92 |  |  |
| fr | orleans | أورليان | Orléans | Orléans | PPLA | 116344 | سنتر-فال دو لوار | 111.14 |  |  |
| fr | rouen | رؤن | Rouen | Rouen | PPLA | 116331 | نورماندي | 112.06 |  |  |
| gb | doncaster | دونكاستر | Doncaster | Doncaster | PPLA2 | 113566 | إنجلترا | 73.66 |  |  |
| gb | chelmsford | تشيلمسفورد | Chelmsford | Chelmsford | PPLA2 | 111511 | إنجلترا | 48.43 |  |  |
| be | namur | نامور | Namur | Namur | PPLA | 110939 | الإقليم الوالوني | 56.03 |  |  |
| fr | perpignan | بيربينيا | Perpignan | Perpignan | PPLA2 | 110706 | أوكسيتاني | 155.02 |  |  |
| fr | caen | كاين | Caen | Caen | PPLA2 | 110624 | نورماندي | 201.06 |  |  |
| gb | wakefield | ويكفيلد | Wakefield | Wakefield | PPLA2 | 109766 | إنجلترا | 54.09 |  |  |
| gb | walthamstow | والتامستو | Walthamstow | Walthamstow | PPLA3 | 109424 | إنجلترا | 11.85 |  |  |
| gb | dagenham | داجنهام | Dagenham | Dagenham | PPLA3 | 108368 | إنجلترا | 20.91 |  |  |
| gb | basingstoke | باسينجستوك | Basingstoke | Basingstoke | PPL | 107642 | إنجلترا | 71.92 |  |  |
| fr | nancy | نانسي | Nancy | Nancy | PPLA2 | 105058 | غران إست | 281.51 |  |  |
| gb | lincoln | لنكولن | Lincoln | Lincoln | PPLA2 | 103813 | إنجلترا | 116.61 |  |  |
| nl | venlo | فنلو | Venlo | Venlo | PPLA2 | 101988 | ليمبورخ | 140.84 |  |  |
| gb | eastbourne | إيست بورن | Eastbourne | Eastbourne | PPL | 101689 | إنجلترا | 87.03 |  |  |
| nl | assen | آسن | Assen | Assen | PPLA | 68836 | درنته | 131.87 |  |  |
| ie | swords | اسوردز | Swords | Swords | PPLA | 42738 | لينستر | 12.54 |  |  |
| lu | grevenmacher | غريفنماخر | Grevenmacher | Grevenmacher | PPLA | 5092 | غريفنماخر | 23.38 |  |  |
| lu | mersch | مرش | Mersch | Mersch | PPLA | 3464 | ميرش | 15.56 |  |  |

## mixed_script (60)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| nl | rotterdam | راٹرڈیم | Rotterdam | Rotterdam | PPL | 868135 | هولندا الجنوبية | 20.50 |  |  |
| be | antwerpen | آنتورپ | Antwerpen | Antwerpen | PPL | 529247 | الإقليم الفلمنكي | 41.30 |  |  |
| gb | bristol | برسٹل نگر | Bristol | Bristol | PPLA2 | 479024 | إنجلترا | 124.43 |  |  |
| gb | birkenhead | برکن‌هد | Birkenhead | Birkenhead | PPL | 325264 | إنجلترا | 52.06 |  |  |
| gb | brighton | برائٹن | Brighton | Brighton | PPL | 283870 | إنجلترا | 75.51 | wave | brighton-gb |
| fr | strasbourg | استراسبورگ | Strasbourg | Strasbourg | PPLA | 274845 | غران إست | 382.95 |  |  |
| gb | derby | داربی، انگلستان | Derby | Derby | PPLA2 | 270468 | إنجلترا | 55.98 |  |  |
| gb | southampton | ساؤتھمپٹن | Southampton | Southampton | PPLA2 | 269781 | إنجلترا | 111.40 |  |  |
| gb | wolverhampton | ولورهمپتون | Wolverhampton | Wolverhampton | PPLA2 | 263700 | إنجلترا | 19.22 |  |  |
| gb | stoke-on-trent | استوک-آن-ترنت | Stoke-on-Trent | Stoke-on-Trent | PPLA2 | 258366 | إنجلترا | 53.14 |  |  |
| gb | northampton | نارتھیمپٹن | Northampton | Northampton | PPLA2 | 245899 | إنجلترا | 73.24 |  |  |
| nl | groningen | grwnynګn | Groningen | Groningen | PPLA | 244807 | خرونينغن | 146.50 |  |  |
| fr | lille | للی | Lille | Lille | PPLA | 238695 | أوت دو فرانس | 203.98 | wave | lille-fr |
| nl | eindhoven | آئنڈھون | Eindhoven | Eindhoven | PPL | 235691 | برابانت الشمالية | 107.08 |  |  |
| gb | bexley | بکسلی | Bexley | Bexley | PPLL | 228000 | إنجلترا | 20.50 |  |  |
| nl | tilburg | تیلبورخ | Tilburg | Tilburg | PPL | 221947 | برابانت الشمالية | 78.95 |  |  |
| gb | barking | بارکینگ | Barking | Barking | PPL | 218534 | إنجلترا | 14.89 |  |  |
| gb | swindon | سوئیندون | Swindon | Swindon | PPLA2 | 201669 | إنجلترا | 103.48 |  |  |
| gb | dudley | دادلی، انگلستان | Dudley | Dudley | PPLA2 | 199059 | إنجلترا | 13.15 |  |  |
| fr | reims | رائیم | Reims | Reims | PPLA3 | 196565 | غران إست | 130.31 |  |  |
| gb | wigan | ویگان | Wigan | Wigan | PPLA2 | 175405 | إنجلترا | 26.98 |  |  |
| gb | croydon | کرویدون | Croydon | Croydon | PPLA3 | 173314 | إنجلترا | 13.93 |  |  |
| gb | warrington | وارینگتون | Warrington | Warrington | PPLA2 | 172330 | إنجلترا | 24.42 |  |  |
| gb | mansfield | منزفیلد | Mansfield | Mansfield | PPL | 171958 | إنجلترا | 79.32 |  |  |
| fr | angers | آنژه | Angers | Angers | PPLA2 | 168279 | بايز دو لا لوار | 264.76 |  |  |
| gb | ilford | ایلفورد | Ilford | Ilford | PPLA3 | 168168 | إنجلترا | 14.96 |  |  |
| gb | peterborough | پیتربورو | Peterborough | Peterborough | PPLA2 | 163379 | إنجلترا | 111.54 |  |  |
| nl | arnhem | arnہym | Arnhem | Arnhem | PPLA | 162424 | خيلدرلاند | 81.07 |  |  |
| gb | oxford | آکسفورد | Oxford | Oxford | PPLA2 | 162100 | إنجلترا | 82.49 | wave | oxford-gb |
| gb | poole | پول، انگلستان | Poole | Poole | PPL | 151500 | إنجلترا | 156.77 |  |  |
| gb | burnley | برنلی | Burnley | Burnley | PPLA4 | 149422 | إنجلترا | 35.50 |  |  |
| gb | huddersfield | هادرزفیلد | Huddersfield | Huddersfield | PPLA2 | 149017 | إنجلترا | 35.59 |  |  |
| fr | nimes | نائیم | Nîmes | Nîmes | PPLA2 | 148236 | أوكسيتاني | 101.26 |  |  |
| gb | dundee | داندی | Dundee | Dundee | PPLA2 | 148210 | اسكتلندا | 58.86 |  |  |
| gb | blackburn | بلک‌برن | Blackburn | Blackburn | PPLA2 | 146521 | إنجلترا | 33.88 |  |  |
| gb | basildon | بزیلدون | Basildon | Basildon | PPL | 144859 | إنجلترا | 41.07 |  |  |
| gb | norwich | ناروچ | Norwich | Norwich | PPLA2 | 143135 | إنجلترا | 158.19 |  |  |
| fr | amiens | آمیاں | Amiens | Amiens | PPLA2 | 143086 | أوت دو فرانس | 116.08 |  |  |
| gb | stockport | استاک‌پورت | Stockport | Stockport | PPLA2 | 139052 | إنجلترا | 9.70 |  |  |
| gb | high-wycombe | های وایکام | High Wycombe | High Wycombe | PPL | 133204 | إنجلترا | 45.04 |  |  |
| nl | maastricht | masٹrkht | Maastricht | Maastricht | PPLA | 122378 | ليمبورخ | 166.48 |  |  |
| gb | burton-upon-trent | بارتون آپون ترنت | Burton upon Trent | Burton upon Trent | PPL | 122199 | إنجلترا | 39.42 |  |  |
| nl | leiden | لائڈن | Leiden | Leiden | PPL | 119713 | هولندا الجنوبية | 16.37 |  |  |
| gb | worthing | وورتینگ | Worthing | Worthing | PPL | 113866 | إنجلترا | 78.58 |  |  |
| gb | chesterfield | چسترفیلد | Chesterfield | Chesterfield | PPL | 113057 | إنجلترا | 60.51 |  |  |
| fr | mulhouse | ملہاؤز | Mulhouse | Mulhouse | PPLA3 | 111430 | غران إست | 291.40 |  |  |
| gb | sutton-coldfield | ساتن کولدفیلد | Sutton Coldfield | Sutton Coldfield | PPL | 109899 | إنجلترا | 10.24 |  |  |
| fr | boulogne-billancourt | بولون-بلانکور | Boulogne-Billancourt | Boulogne-Billancourt | PPLA3 | 108782 | إيل دو فرانس | 8.45 |  |  |
| gb | maidstone | میدنستون | Maidstone | Maidstone | PPLA2 | 107627 | إنجلترا | 52.12 |  |  |
| gb | bedford | بدفورد، انگلستان | Bedford | Bedford | PPLA2 | 106940 | إنجلترا | 73.52 | wave | bedford-gb |
| gb | woking | وودکینگ | Woking | Woking | PPL | 103900 | إنجلترا | 36.51 |  |  |
| gb | west-bromwich | وست برومویچ | West Bromwich | West Bromwich | PPL | 103112 | إنجلترا | 7.92 |  |  |
| gb | worcester | ورکستر | Worcester | Worcester | PPLA2 | 101659 | إنجلترا | 39.89 |  |  |
| gb | gillingham | جیلینگهام، کنت | Gillingham | Gillingham | PPL | 101187 | إنجلترا | 48.69 |  |  |
| nl | lelystad | lyly sٹaڈ | Lelystad | Lelystad | PPLA | 79811 | فليفولاند | 41.74 |  |  |
| fr | ajaccio | آژاکسیو | Ajaccio | Ajaccio | PPLA | 54364 | كورسيكا | 232.74 |  |  |
| nl | middelburg | mڈl brg | Middelburg | Middelburg | PPLA | 46485 | زيلاند | 79.09 | wave | middelburg-nl |
| ie | nenagh | نینا | Nenagh | Nenagh | PPLA | 5500 | مونستر | 140.31 |  |  |
| lu | wiltz | wlٹz | Wiltz | Wiltz | PPLA | 4816 | فيلتس | 41.84 |  |  |
| lu | redange-sur-attert | ryڈynj sr aٹr | Redange-sur-Attert | Redange-sur-Attert | PPLA | 1164 | ريدانج | 24.32 |  |  |

## mixed_latin (1)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| nl | zwolle | zwlې | Zwolle | Zwolle | PPLA | 129840 | أوفرآيسل | 82.28 |  |  |

## mixed_unknown (2)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gb | harrow | هارو، لندن | Harrow | Harrow | PPLA3 | 149246 | إنجلترا | 16.18 |  |  |
| gb | bath | باتھ | Bath | Bath | PPLA2 | 101557 | إنجلترا | 127.70 | wave | bath-gb |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
