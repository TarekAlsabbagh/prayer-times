# Americas-1A — Arabic-Name Quality Report

**Wave**: `CURATED-GEODATA-AMERICAS-1A`
**Strategy**: E — Strategy A + Stage 3.5 ar-quality gate
**Generated**: 2026-05-16T11:42:23.219Z

## What this report tells you

Same as Europe-1A: North America has Arabic-name candidates
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
| US | 302 | 0 | 199 | 87 | 8 | 0 | **105** | **197** |
| CA | 59 | 0 | 40 | 16 | 1 | 0 | **12** | **47** |
| MX | 81 | 0 | 31 | 50 | 0 | 0 | **24** | **57** |
| **TOTAL** | **442** | **0** | **270** | **153** | **9** | **0** | **141** | **301** |

## Collision summary

| Collision type | Count (high-tier only) |
| --- | ---: |
| Within Americas-1A wave (ES↔PT same slug) | 189 |
| Against existing curated (other cc owns slug already) | 14 |

### Within-wave collisions (high-tier)

| cc | slug | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- |
| us | brooklyn | brooklyn-us | بروكلين | 2736074 |
| us | san-antonio | san-antonio-us | سان آنتونیو | 1526656 |
| us | san-diego | san-diego-us | سان دييغو | 1404452 |
| us | jacksonville | jacksonville-us | جاكسونفيل | 1009833 |
| us | san-jose | san-jose-us | سا ن جوز | 997368 |
| us | austin | austin-us | asټn | 974447 |
| us | denver | denver-us | دنفر | 729019 |
| us | nashville | nashville-us | ناشفيل | 689447 |
| us | el-paso | el-paso-us | إل باسو | 678815 |
| us | las-vegas | las-vegas-us | las wygas  nywaڈa | 641903 |
| us | louisville | louisville-us | لوئیزویل، کینٹکی | 624444 |
| us | baltimore | baltimore-us | بالتيمور | 585708 |
| us | tucson | tucson-us | توسان | 542629 |
| us | fresno | fresno-us | فرزنو | 542107 |
| us | sacramento | sacramento-us | ساكرامنتو | 524943 |
| us | atlanta | atlanta-us | آتلانتا | 510823 |
| us | raleigh | raleigh-us | ralې | 482295 |
| us | long-beach | long-beach-us | لانگ بیچ، کالیفرنیا | 474140 |
| us | mesa | mesa-us | ميسا | 471825 |
| us | oakland | oakland-us | أوكلاند | 419267 |
| us | arlington | arlington-us | آرلنگٹن | 388125 |
| us | cleveland | cleveland-us | كليفلاند | 365379 |
| us | aurora | aurora-us | آرورا، کلرادو | 359407 |
| us | lexington | lexington-us | ليكسينغتون | 320347 |
| us | riverside | riverside-us | رور سائڈ | 317261 |
| us | corpus-christi | corpus-christi-us | كوربوس كريستي | 316239 |
| us | santa-ana | santa-ana-us | سانتا آنا، کالیفرنیا | 310227 |
| us | stockton | stockton-us | استوکتون | 305658 |
| us | saint-paul | saint-paul-us | سانت باول | 303176 |
| us | lincoln | lincoln-us | لنكن | 294757 |
| us | newark | newark-us | نيوآرك | 281944 |
| us | madison | madison-us | ماديسون | 280305 |
| us | st-louis | st-louis-us | سانت لويس | 279695 |
| us | chula-vista | chula-vista-us | تشولا فيستا | 265757 |
| us | toledo | toledo-us | توليدو | 265638 |
| us | reno | reno-us | رينو | 264165 |
| us | chandler | chandler-us | تشاندلر | 260828 |
| us | buffalo | buffalo-us | بفیلو، نیو یارک | 258071 |
| us | durham | durham-us | دورهام | 257636 |
| us | irvine | irvine-us | إرفاين | 256927 |
| us | laredo | laredo-us | لاريدو | 256153 |
| us | gilbert | gilbert-us | گلبرٹ، ایریزونا | 247542 |
| us | glendale | glendale-us | غلانديل | 240126 |
| us | norfolk | norfolk-us | نارفوک، ورجینیا | 238005 |
| us | garland | garland-us | جارلاند | 236897 |
| us | richmond | richmond-us | rchmnڈ | 226610 |
| us | paradise | paradise-us | بارادايس | 223167 |
| us | san-bernardino | san-bernardino-us | سان بيرناردينو، كاليفورنيا | 216108 |
| us | oxnard | oxnard-us | أوكسنارد | 207254 |
| us | worcester | worcester-us | ورسستر | 206518 |
| us | glendale | glendale-us | غلينديل | 201020 |
| us | amarillo | amarillo-us | آماریلو، تگزاس | 198645 |
| us | birmingham | birmingham-us | برمنغهام | 196357 |
| us | grand-rapids | grand-rapids-us | گرندرپیدز، میشیگان | 195097 |
| us | peoria | peoria-us | بيوريا | 190985 |
| us | brownsville | brownsville-us | براؤنزول | 186738 |
| us | mobile | mobile-us | موبائل، الاباما | 183289 |
| us | santa-clarita | santa-clarita-us | سانتا كلاريتا | 182371 |
| us | santa-rosa | santa-rosa-us | سانتا روزا، کالیفرنیا | 178127 |
| us | salem | salem-us | سالم | 175535 |
| us | springfield | springfield-us | اسپرینگفیلد، میزوری | 170188 |
| us | clarksville | clarksville-us | كلاركسفيل | 166722 |
| us | corona | corona-us | كورونا | 164226 |
| us | lancaster | lancaster-us | لانكستر | 161103 |
| us | alexandria | alexandria-us | الإسكندرية | 159467 |
| us | salinas | salinas-us | ساليناس | 157380 |
| us | springfield | springfield-us | اسپرینگفیلد، ماساچوست | 154341 |
| us | pasadena | pasadena-us | باسادينا | 153784 |
| us | jackson | jackson-us | جاكسون | 153701 |
| us | pomona | pomona-us | بومونا | 153266 |
| us | lakewood | lakewood-us | ليكوود | 152597 |
| us | escondido | escondido-us | إسكونديدو | 151038 |
| us | rockford | rockford-us | راک فورڈ، الینوائے | 148278 |
| us | paterson | paterson-us | باترسون | 147754 |
| us | bridgeport | bridgeport-us | برج پورٹ، کنیکٹیکٹ | 147629 |
| us | torrance | torrance-us | تورانس، کالیفرنیا | 143592 |
| us | surprise | surprise-us | سوربرايز | 143148 |
| us | pasadena | pasadena-us | باسادينا | 142250 |
| us | bellevue | bellevue-us | بالفيو | 139820 |
| us | hampton | hampton-us | هامبتون | 137148 |
| us | miramar | miramar-us | ميرامار | 137132 |
| us | dayton | dayton-us | دايتون، أوهايو | 135512 |
| us | warren | warren-us | وارن، مشی گن | 134056 |
| us | thornton | thornton-us | تھورن ٹن، کولوراڈو | 133451 |
| us | charleston | charleston-us | تشارلستون | 132609 |
| us | midland | midland-us | مدلاند | 132524 |
| us | waco | waco-us | واكو | 132356 |
| us | new-haven | new-haven-us | نيو هيفن | 130322 |
| us | roseville | roseville-us | رزویل، کالیفرنیا | 130269 |
| us | elizabeth | elizabeth-us | إليزابيث | 129007 |
| us | stamford | stamford-us | استمفورد، کنتیکت | 128874 |
| us | concord | concord-us | كونكورد | 128667 |
| us | norman | norman-us | نورمن، اکلاهما | 128026 |
| us | athens | athens-us | آتئنز، جورجیا | 127315 |
| us | kent | kent-us | كينت | 126952 |
| us | santa-clara | santa-clara-us | سانتا كلارا | 126215 |
| us | abilene | abilene-us | أبيلين | 125182 |
| us | amherst | amherst-us | امهرست، نیویورک | 122366 |
| us | vallejo | vallejo-us | فاليجو | 121692 |
| us | hartford | hartford-us | harټ fwrډ | 121054 |
| us | evansville | evansville-us | إيفانسفيل | 119943 |
| us | clearwater | clearwater-us | كليرواتر | 117292 |
| us | el-monte | el-monte-us | إل مونتي | 116732 |
| us | westminster | westminster-us | وزتمینزتر، کولورادو | 116317 |
| us | beaumont | beaumont-us | بومانت، تگزاس | 115282 |
| us | peoria | peoria-us | بيوريا | 115070 |
| us | odessa | odessa-us | أوديسا | 114428 |
| us | springfield | springfield-us | sprnګ fylډ | 114394 |
| us | fairfield | fairfield-us | فئرفیلڈ | 112970 |
| us | lansing | lansing-us | lnsnګ | 112644 |
| us | elgin | elgin-us | إلجين | 112111 |
| us | inglewood | inglewood-us | إنغليووود | 111666 |
| us | richardson | richardson-us | ريتشاردسون | 110815 |
| us | cambridge | cambridge-us | كامبريدج | 110402 |
| us | high-point | high-point-us | هاي بوينت | 110268 |
| us | manchester | manchester-us | مانتشستر | 110229 |
| us | murrieta | murrieta-us | مورريتا، ريفيرسيدي، كاليفورنيا | 109830 |
| us | centennial | centennial-us | سنتنیال، کلرادو | 109741 |
| us | richmond | richmond-us | ريتشموند | 109708 |
| us | enterprise | enterprise-us | إنتربرايز | 108481 |
| us | everett | everett-us | إيفريت | 108010 |
| us | green-bay | green-bay-us | غرين باي | 105207 |
| us | lakeland | lakeland-us | ليكلاند | 104401 |
| us | lewisville | lewisville-us | لوئیس‌ویل، تگزاس | 104039 |
| us | el-cajon | el-cajon-us | ال کاجون | 103679 |
| us | san-mateo | san-mateo-us | سان ماتيو | 103536 |
| us | brandon | brandon-us | براندون | 103483 |
| us | davenport | davenport-us | دافنبورت | 102582 |
| us | hillsboro | hillsboro-us | هيلسبورو | 102347 |
| us | las-cruces | las-cruces-us | لاس كروسيس | 101643 |
| us | albany | albany-us | آلبانی، نیویورک | 101228 |
| us | renton | renton-us | رنتون، واشینگتن | 100242 |
| us | trenton | trenton-us | ترنتون | 89620 |
| us | santa-fe | santa-fe-us | santa fې | 87505 |
| us | bismarck | bismarck-us | انٹیل | 75092 |
| us | cheyenne | cheyenne-us | شايان | 65132 |
| us | harrisburg | harrisburg-us | هاريسبرج | 50183 |
| us | charleston | charleston-us | تشارلستون | 46838 |
| us | concord | concord-us | كونكورد | 43976 |
| us | dover | dover-us | دوفر | 39403 |
| ca | edmonton | edmonton-ca | إدمونتون | 1010899 |
| ca | winnipeg | winnipeg-ca | wny pyګ | 749607 |
| ca | brampton | brampton-ca | برامبتون | 656480 |
| ca | hamilton | hamilton-ca | هاميلتون | 569353 |
| ca | surrey | surrey-ca | سوري، كولومبيا البريطانية | 568322 |
| ca | quebec | quebec-ca | مدينة كيبك | 531902 |
| ca | halifax | halifax-ca | هاليفاكس | 471559 |
| ca | london | london-ca | لندن | 422324 |
| ca | markham | markham-ca | ماركام | 338503 |
| ca | vaughan | vaughan-ca | فاوجان | 323103 |
| ca | victoria | victoria-ca | فكتوريا | 289625 |
| ca | kitchener | kitchener-ca | كيتشنر | 256885 |
| ca | windsor | windsor-ca | وندسور | 229660 |
| ca | regina | regina-ca | رجاینا | 226404 |
| ca | oakville | oakville-ca | أوكفيل | 213759 |
| ca | richmond | richmond-ca | ريتشموند | 209937 |
| ca | richmond-hill | richmond-hill-ca | ريتشموند هيل | 202022 |
| ca | burlington | burlington-ca | brlngٹn  awnٹaryw | 186948 |
| ca | oshawa | oshawa-ca | أوشاوا | 175383 |
| ca | barrie | barrie-ca | باري | 147829 |
| ca | guelph | guelph-ca | غويلف | 143740 |
| ca | levis | levis-ca | لوی، کبک | 143414 |
| ca | abbotsford | abbotsford-ca | أبوتسفورد | 141397 |
| ca | whitby | whitby-ca | ويتبي | 138501 |
| ca | milton | milton-ca | ميلتون | 132979 |
| ca | langley | langley-ca | لانغلي، كولومبيا البريطانية | 132603 |
| ca | kingston | kingston-ca | كينغستون | 132485 |
| ca | cambridge | cambridge-ca | كامبريدج | 129920 |
| ca | sherbrooke | sherbrooke-ca | شربروک | 129447 |
| ca | ajax | ajax-ca | أجاكس | 119677 |
| ca | terrebonne | terrebonne-ca | تربون، کبک | 111575 |
| ca | sydney | sydney-ca | سيدنى | 105968 |
| ca | waterloo | waterloo-ca | واترلو | 104986 |
| ca | brantford | brantford-ca | برانتفورد | 104688 |
| ca | delta | delta-ca | ديلتا | 101668 |
| ca | dartmouth | dartmouth-ca | دارتموث | 101343 |
| ca | whitehorse | whitehorse-ca | wayٹ ہars  ywkwn | 28201 |
| mx | merida | merida-mx | myryڈa | 1201000 |
| mx | chihuahua | chihuahua-mx | تشيواوا | 925762 |
| mx | torreon | torreon-mx | تورئون٬ کواویلا | 735340 |
| mx | saltillo | saltillo-mx | سالتيللو | 709671 |
| mx | toluca | toluca-mx | تولوكا | 489333 |
| mx | ensenada | ensenada-mx | إنسينادا | 443807 |
| mx | tampico | tampico-mx | تامبيكو | 309003 |
| mx | nogales | nogales-mx | نوگالس، سونورا | 264782 |
| mx | la-paz | la-paz-mx | لا باز | 250141 |
| mx | monclova | monclova-mx | مونکلووا | 215271 |
| mx | salamanca | salamanca-mx | سالامانکا، گواناخواتو | 160682 |
| mx | colima | colima-mx | كوليما | 146965 |

### Curated collisions (high-tier — slug already owned by another country)

| cc | slug | existingCc | suggestedRename | name.ar | pop |
| --- | --- | --- | --- | --- | --- |
| us | lincoln | gb | lincoln-us | لنكن | 294757 |
| us | vancouver | ca | vancouver-us | فانكوفر | 196442 |
| us | birmingham | gb | birmingham-us | برمنغهام | 196357 |
| us | alexandria | eg | alexandria-us | الإسكندرية | 159467 |
| us | athens | gr | athens-us | آتئنز، جورجیا | 127315 |
| us | cambridge | gb | cambridge-us | كامبريدج | 110402 |
| us | manchester | gb | manchester-us | مانتشستر | 110229 |
| ca | london | gb | london-ca | لندن | 422324 |
| ca | cambridge | gb | cambridge-ca | كامبريدج | 129920 |
| ca | sydney | au | sydney-ca | سيدنى | 105968 |
| mx | merida | es | merida-mx | myryڈa | 1201000 |
| mx | la-paz | bo | la-paz-mx | لا باز | 250141 |
| mx | cordoba | es | cordoba-mx | کوردوبا، وراکروز | 204721 |
| mx | salamanca | es | salamanca-mx | سالامانکا، گواناخواتو | 160682 |

## arabic_only (270)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| us | brooklyn | بروكلين | Brooklyn | Brooklyn | PPLA2 | 2736074 | نيويورك | 8.44 | wave | brooklyn-us |
| mx | tijuana | تيخوانا | Tijuana | Tijuana | PPLA2 | 1922523 | باها كاليفورنيا | 1786.92 |  |  |
| mx | puebla | بويبلا | Puebla | Puebla | PPLA | 1692181 | بويبلا | 106.21 |  |  |
| mx | santiago-de-queretaro | سانتياغو دي كويريتارو | Santiago de Querétaro | Santiago de Querétaro | PPLA | 1594212 | كيريتارو | 183.57 |  |  |
| mx | ciudad-juarez | سيوداد خواريز | Ciudad Juárez | Ciudad Juárez | PPLA2 | 1512450 | تشيواوا | 899.21 |  |  |
| us | manhattan | مانهاتن | Manhattan | Manhattan | PPLA2 | 1487536 | نيويورك | 8.54 |  |  |
| us | san-diego | سان دييغو | San Diego | San Diego | PPLA2 | 1404452 | كاليفورنيا | 179.22 | wave | san-diego-us |
| ca | edmonton | إدمونتون | Edmonton | Edmonton | PPLA | 1010899 | ألبرتا | 281.59 | wave | edmonton-ca |
| us | jacksonville | جاكسونفيل | Jacksonville | Jacksonville | PPLA2 | 1009833 | فلوريدا | 528.11 | wave | jacksonville-us |
| us | fort-worth | فورت وورث | Fort Worth | Fort Worth | PPLA2 | 1008106 | تكساس | 49.32 |  |  |
| us | san-jose | سا ن جوز | San Jose | San Jose | PPLA2 | 997368 | كاليفورنيا | 66.95 | wave | san-jose-us |
| mx | chihuahua | تشيواوا | Chihuahua | Chihuahua | PPLA | 925762 | تشيواوا | 658.40 | wave | chihuahua-mx |
| us | columbus | كولومبوس | Columbus | Columbus | PPLA | 913175 | أوهايو | 443.57 |  |  |
| us | charlotte | تشارلوت | Charlotte | Charlotte | PPLA2 | 911311 | كارولاينا الشمالية | 530.45 |  |  |
| mx | cancun | كانكون | Cancún | Cancún | PPL | 888797 | كينتانا رو | 1295.52 |  |  |
| mx | naucalpan-de-juarez | ناوكالبان دي خواريز | Naucalpan de Juárez | Naucalpan de Juárez | PPLA2 | 834434 | ولاية مكسيكو | 12.27 |  |  |
| mx | hermosillo | ارموسييو سونورا | Hermosillo | Hermosillo | PPLA | 812229 | سونورا | 1116.97 |  |  |
| mx | culiacan | كوليتاكان | Culiacán | Culiacán | PPLA | 808416 | سينالوا | 619.76 |  |  |
| us | denver | دنفر | Denver | Denver | PPLA | 729019 | كولورادو | 942.67 | wave | denver-us |
| mx | saltillo | سالتيللو | Saltillo | Saltillo | PPLA | 709671 | كواويلا | 72.60 | wave | saltillo-mx |
| us | nashville | ناشفيل | Nashville | Nashville | PPLA | 689447 | تينيسي | 639.34 | wave | nashville-us |
| us | el-paso | إل باسو | El Paso | El Paso | PPLA2 | 678815 | تكساس | 555.96 | wave | el-paso-us |
| ca | brampton | برامبتون | Brampton | Brampton | PPL | 656480 | أونتاريو | 31.00 | wave | brampton-ca |
| us | detroit | ديترويت | Detroit | Detroit | PPLA2 | 645705 | ميشيغان | 381.47 |  |  |
| us | memphis | ممفيس | Memphis | Memphis | PPLA2 | 633104 | تينيسي | 675.75 |  |  |
| us | baltimore | بالتيمور | Baltimore | Baltimore | PPLA2 | 585708 | ميريلاند | 56.20 | wave | baltimore-us |
| ca | hamilton | هاميلتون | Hamilton | Hamilton | PPL | 569353 | أونتاريو | 58.54 | wave | hamilton-ca |
| us | tucson | توسان | Tucson | Tucson | PPLA2 | 542629 | أريزونا | 173.49 | wave | tucson-us |
| us | fresno | فرزنو | Fresno | Fresno | PPLA2 | 542107 | كاليفورنيا | 260.60 | wave | fresno-us |
| ca | quebec | مدينة كيبك | Québec | Québec | PPLA | 531902 | كيبيك | 232.53 | wave | quebec-ca |
| us | sacramento | ساكرامنتو | Sacramento | Sacramento | PPLA | 524943 | كاليفورنيا | 120.76 | wave | sacramento-us |
| us | atlanta | آتلانتا | Atlanta | Atlanta | PPLA | 510823 | جورجيا | 872.73 | wave | atlanta-us |
| mx | toluca | تولوكا | Toluca | Toluca | PPLA | 489333 | ولاية مكسيكو | 56.88 | wave | toluca-mx |
| us | omaha | أوماها | Omaha | Omaha | PPLA2 | 486051 | نبراسكا | 694.56 |  |  |
| us | kansas-city | كانساس سيتي | Kansas City | Kansas City | PPL | 475378 | ميزوري | 663.60 |  |  |
| us | mesa | ميسا | Mesa | Mesa | PPL | 471825 | أريزونا | 23.50 | wave | mesa-us |
| ca | halifax | هاليفاكس | Halifax | Halifax | PPLA | 471559 | نوفا سكوشا | 789.79 | wave | halifax-ca |
| us | colorado-springs | كولورادو سبرينغس | Colorado Springs | Colorado Springs | PPLA2 | 456568 | كولورادو | 884.16 |  |  |
| us | virginia-beach | فرجينيا بيتش | Virginia Beach | Virginia Beach | PPLA2 | 454808 | فرجينيا | 246.60 |  |  |
| mx | ensenada | إنسينادا | Ensenada | Ensenada | PPLA2 | 443807 | باها كاليفورنيا | 1727.21 | wave | ensenada-mx |
| ca | laval | لافال | Laval | Laval | PPL | 438366 | كيبيك | 12.33 |  |  |
| ca | london | لندن | London | London | PPL | 422324 | أونتاريو | 167.16 | wave | london-ca |
| us | oakland | أوكلاند | Oakland | Oakland | PPLA2 | 419267 | كاليفورنيا | 13.46 | wave | oakland-us |
| mx | nuevo-laredo | نوئوو لاردو | Nuevo Laredo | Nuevo Laredo | PPL | 416055 | تاماوليباس | 214.30 |  |  |
| us | tampa | تامبا | Tampa | Tampa | PPLA2 | 414547 | فلوريدا | 331.09 |  |  |
| us | wichita | ويتشيتا | Wichita | Wichita | PPLA2 | 396119 | كانساس | 548.78 |  |  |
| mx | mazatlan | ماساتلان | Mazatlán | Mazatlán | PPLA2 | 381583 | سينالوا | 425.84 |  |  |
| mx | irapuato | ايرابواتو | Irapuato | Irapuato | PPLA2 | 380941 | غواناخواتو | 207.44 |  |  |
| us | bakersfield | بيكرسفيلد | Bakersfield | Bakersfield | PPLA2 | 373640 | كاليفورنيا | 163.09 |  |  |
| us | cleveland | كليفلاند | Cleveland | Cleveland | PPLA2 | 365379 | أوهايو | 489.38 | wave | cleveland-us |
| us | honolulu | هونولولو | Honolulu | Honolulu | PPLA | 350964 | هاواي | 3853.93 |  |  |
| us | anaheim | آناهايم | Anaheim | Anaheim | PPL | 350742 | كاليفورنيا | 38.78 |  |  |
| mx | cuernavaca | كويرنافاكا | Cuernavaca | Cuernavaca | PPLA | 338650 | موريلوس | 57.24 |  |  |
| ca | markham | ماركام | Markham | Markham | PPL | 338503 | أونتاريو | 25.54 | wave | markham-ca |
| us | orlando | أورلاندو | Orlando | Orlando | PPLA2 | 334854 | فلوريدا | 330.34 |  |  |
| mx | tepic | تيبيك | Tepic | Tepic | PPLA | 332863 | نايريت | 185.84 |  |  |
| mx | ciudad-victoria | سيوداد فيكتوريا | Ciudad Victoria | Ciudad Victoria | PPLA | 332100 | تاماوليباس | 246.67 |  |  |
| ca | vaughan | فاوجان | Vaughan | Vaughan | PPL | 323103 | أونتاريو | 22.34 | wave | vaughan-ca |
| us | lexington | ليكسينغتون | Lexington | Lexington | PPLA2 | 320347 | كنتاكي | 509.10 | wave | lexington-us |
| us | corpus-christi | كوربوس كريستي | Corpus Christi | Corpus Christi | PPLA2 | 316239 | تكساس | 294.09 | wave | corpus-christi-us |
| mx | tampico | تامبيكو | Tampico | Tampico | PPLA2 | 309003 | تاماوليباس | 342.96 | wave | tampico-mx |
| us | pittsburgh | بيتسبرغ | Pittsburgh | Pittsburgh | PPLA2 | 304391 | بنسلفانيا | 305.27 |  |  |
| us | saint-paul | سانت باول | Saint Paul | Saint Paul | PPLA | 303176 | مينيسوتا | 557.47 | wave | saint-paul-us |
| ca | gatineau | غاتينو | Gatineau | Gatineau | PPL | 300045 | كيبيك | 6.21 |  |  |
| us | lincoln | لنكن | Lincoln | Lincoln | PPLA | 294757 | نبراسكا | 763.57 | wave | lincoln-us |
| ca | victoria | فكتوريا | Victoria | Victoria | PPLA | 289625 | كولومبيا البريطانية | 95.66 | wave | victoria-ca |
| us | anchorage | أنكوريج | Anchorage | Anchorage | PPLA2 | 289600 | ألاسكا | 2308.74 |  |  |
| us | henderson | هندرسون | Henderson | Henderson | PPL | 285667 | نيفادا | 370.11 |  |  |
| us | greensboro | غرينزبورو | Greensboro | Greensboro | PPL | 285342 | كارولاينا الشمالية | 397.99 |  |  |
| us | plano | بلانو | Plano | Plano | PPL | 283558 | تكساس | 28.55 |  |  |
| us | newark | نيوآرك | Newark | Newark | PPLA2 | 281944 | نيو جيرسي | 14.25 | wave | newark-us |
| us | madison | ماديسون | Madison | Madison | PPLA | 280305 | ويسكونسن | 196.87 | wave | madison-us |
| us | st-louis | سانت لويس | St. Louis | St. Louis | PPLA2 | 279695 | ميزوري | 422.04 | wave | st-louis-us |
| ca | saskatoon | ساسكاتون | Saskatoon | Saskatoon | PPL | 266141 | ساسكاتشوان | 525.29 |  |  |
| us | chula-vista | تشولا فيستا | Chula Vista | Chula Vista | PPL | 265757 | كاليفورنيا | 190.41 | wave | chula-vista-us |
| us | toledo | توليدو | Toledo | Toledo | PPLA2 | 265638 | أوهايو | 338.71 | wave | toledo-us |
| us | reno | رينو | Reno | Reno | PPLA2 | 264165 | نيفادا | 298.75 | wave | reno-us |
| us | chandler | تشاندلر | Chandler | Chandler | PPL | 260828 | أريزونا | 26.78 | wave | chandler-us |
| us | fort-wayne | فورت واين | Fort Wayne | Fort Wayne | PPLA2 | 260326 | إنديانا | 224.23 |  |  |
| us | durham | دورهام | Durham | Durham | PPLA2 | 257636 | كارولاينا الشمالية | 363.21 | wave | durham-us |
| us | irvine | إرفاين | Irvine | Irvine | PPL | 256927 | كاليفورنيا | 57.61 | wave | irvine-us |
| ca | kitchener | كيتشنر | Kitchener | Kitchener | PPLA2 | 256885 | أونتاريو | 94.39 | wave | kitchener-ca |
| us | laredo | لاريدو | Laredo | Laredo | PPLA2 | 256153 | تكساس | 475.22 | wave | laredo-us |
| mx | oaxaca | أوخاكا | Oaxaca | Oaxaca | PPLA | 255029 | واهاكا | 366.37 |  |  |
| mx | la-paz | لا باز | La Paz | La Paz | PPLA | 250141 | باها كاليفورنيا سور | 813.71 | wave | la-paz-mx |
| us | glendale | غلانديل | Glendale | Glendale | PPL | 240126 | أريزونا | 14.44 | wave | glendale-us |
| us | hialeah | هياليه | Hialeah | Hialeah | PPL | 237069 | فلوريدا | 13.72 |  |  |
| us | garland | جارلاند | Garland | Garland | PPL | 236897 | تكساس | 21.13 | wave | garland-us |
| us | scottsdale | سكوتسديل | Scottsdale | Scottsdale | PPL | 236839 | أريزونا | 17.58 |  |  |
| us | irving | إيرفينغ | Irving | Irving | PPL | 236607 | تكساس | 14.79 |  |  |
| us | chesapeake | تشيسابيك | Chesapeake | Chesapeake | PPLA2 | 235429 | فرجينيا | 241.63 |  |  |
| ca | windsor | وندسور | Windsor | Windsor | PPL | 229660 | أونتاريو | 331.63 | wave | windsor-ca |
| ca | longueuil | لونغوي | Longueuil | Longueuil | PPLA2 | 229330 | كيبيك | 7.87 |  |  |
| mx | puerto-vallarta | بويرتو فالارتا | Puerto Vallarta | Puerto Vallarta | PPL | 224166 | خاليسكو | 195.75 |  |  |
| us | paradise | بارادايس | Paradise | Paradise | PPL | 223167 | نيفادا | 362.10 | wave | paradise-us |
| us | tacoma | تاكوما | Tacoma | Tacoma | PPLA2 | 222906 | واشنطن | 40.18 |  |  |
| us | salt-lake-city | سالت ليك | Salt Lake City | Salt Lake City | PPLA | 215548 | يوتاه | 813.26 |  |  |
| ca | oakville | أوكفيل | Oakville | Oakville | PPL | 213759 | أونتاريو | 33.07 | wave | oakville-ca |
| us | fontana | فونتانا | Fontana | Fontana | PPL | 212704 | كاليفورنيا | 74.61 |  |  |
| ca | richmond | ريتشموند | Richmond | Richmond | PPL | 209937 | كولومبيا البريطانية | 12.58 | wave | richmond-ca |
| us | rochester | روتشستر | Rochester | Rochester | PPLA2 | 209802 | نيويورك | 403.51 |  |  |
| us | oxnard | أوكسنارد | Oxnard | Oxnard | PPL | 207254 | كاليفورنيا | 87.42 | wave | oxnard-us |
| us | columbus | كولومبوس | Columbus | Columbus | PPLA2 | 206922 | جورجيا | 878.34 |  |  |
| us | worcester | ورسستر | Worcester | Worcester | PPLA2 | 206518 | ماساتشوستس | 62.08 | wave | worcester-us |
| mx | cabo-san-lucas | كابو سان لوكاس | Cabo San Lucas | Cabo San Lucas | PPL | 202694 | باها كاليفورنيا سور | 721.56 |  |  |
| us | little-rock | ليتل روك | Little Rock | Little Rock | PPLA | 202591 | أركنساس | 470.67 |  |  |
| ca | richmond-hill | ريتشموند هيل | Richmond Hill | Richmond Hill | PPL | 202022 | أونتاريو | 24.62 | wave | richmond-hill-ca |
| us | tallahassee | تالاهاسي | Tallahassee | Tallahassee | PPLA | 201731 | فلوريدا | 656.58 |  |  |
| us | yonkers | يونكيرس | Yonkers | Yonkers | PPL | 201116 | نيويورك | 25.85 |  |  |
| us | glendale | غلينديل | Glendale | Glendale | PPL | 201020 | كاليفورنيا | 10.10 | wave | glendale-us |
| us | cypress | سايبرس | Cypress | Cypress | PPL | 200839 | تكساس | 39.18 |  |  |
| us | akron | آكرون | Akron | Akron | PPLA2 | 197542 | أوهايو | 451.83 |  |  |
| us | vancouver | فانكوفر | Vancouver | Vancouver | PPLA2 | 196442 | واشنطن | 220.21 | curated | vancouver-us |
| us | birmingham | برمنغهام | Birmingham | Birmingham | PPLA2 | 196357 | ألاباما | 912.01 | wave | birmingham-us |
| us | peoria | بيوريا | Peoria | Peoria | PPL | 190985 | أريزونا | 21.11 | wave | peoria-us |
| us | grand-prairie | غراند براري | Grand Prairie | Grand Prairie | PPL | 187809 | تكساس | 19.08 |  |  |
| us | shreveport | شريفبورت | Shreveport | Shreveport | PPLA2 | 187593 | لويزيانا | 286.61 |  |  |
| mx | chilpancingo | تشيلبانسينجو | Chilpancingo | Chilpancingo | PPLA | 187251 | غيريرو | 212.65 |  |  |
| us | brownsville | براؤنزول | Brownsville | Brownsville | PPLA2 | 186738 | تكساس | 477.32 | wave | brownsville-us |
| us | overland-park | أوفرلاند بارك | Overland Park | Overland Park | PPL | 186515 | كانساس | 677.07 |  |  |
| us | santa-clarita | سانتا كلاريتا | Santa Clarita | Santa Clarita | PPL | 182371 | كاليفورنيا | 46.69 | wave | santa-clarita-us |
| us | chattanooga | تشاتانوغا | Chattanooga | Chattanooga | PPLA2 | 181099 | تينيسي | 786.04 |  |  |
| us | eugene | يوجين | Eugene | Eugene | PPLA2 | 176654 | أوريغون | 399.50 |  |  |
| us | tempe | تمب | Tempe | Tempe | PPL | 175826 | أريزونا | 15.73 |  |  |
| us | oceanside | أوسيانسيدي | Oceanside | Oceanside | PPL | 175691 | كاليفورنيا | 124.38 |  |  |
| us | salem | سالم | Salem | Salem | PPLA | 175535 | أوريغون | 301.03 | wave | salem-us |
| us | garden-grove | غاردين غروفي | Garden Grove | Garden Grove | PPL | 175393 | كاليفورنيا | 41.66 |  |  |
| ca | oshawa | أوشاوا | Oshawa | Oshawa | PPL | 175383 | أونتاريو | 50.89 | wave | oshawa-ca |
| us | rancho-cucamonga | رانتشو كوكامونغا | Rancho Cucamonga | Rancho Cucamonga | PPL | 175236 | كاليفورنيا | 60.22 |  |  |
| us | cape-coral | كيب كورال | Cape Coral | Cape Coral | PPL | 175229 | فلوريدا | 196.75 |  |  |
| mx | san-miguel-de-allende | سان ميغيل دي الليندي | San Miguel de Allende | San Miguel de Allende | PPL | 174615 | غواناخواتو | 235.46 |  |  |
| us | sioux-falls | سايوكس فالز | Sioux Falls | Sioux Falls | PPLA2 | 171544 | داكوتا الجنوبية | 765.64 |  |  |
| us | ontario | أونتاريو | Ontario | Ontario | PPL | 171214 | كاليفورنيا | 54.63 |  |  |
| us | fort-collins | فورت كولنز | Fort Collins | Fort Collins | PPLA2 | 170924 | كولورادو | 1006.65 |  |  |
| mx | chetumal | تشيتومال | Chetumal | Chetumal | PPLA | 169028 | كينتانا رو | 1143.04 |  |  |
| us | elk-grove | إلك غروفي | Elk Grove | Elk Grove | PPL | 166913 | كاليفورنيا | 115.65 |  |  |
| us | clarksville | كلاركسفيل | Clarksville | Clarksville | PPLA2 | 166722 | تينيسي | 595.16 | wave | clarksville-us |
| us | pembroke-pines | بيمبروك باينز | Pembroke Pines | Pembroke Pines | PPL | 166611 | فلوريدا | 27.04 |  |  |
| us | corona | كورونا | Corona | Corona | PPL | 164226 | كاليفورنيا | 65.48 | wave | corona-us |
| us | mckinney | ماككيني | McKinney | McKinney | PPLA2 | 162898 | تكساس | 49.78 |  |  |
| us | lancaster | لانكستر | Lancaster | Lancaster | PPL | 161103 | كاليفورنيا | 72.48 | wave | lancaster-us |
| us | cary | كاري | Cary | Cary | PPL | 159769 | كارولاينا الشمالية | 379.18 |  |  |
| us | alexandria | الإسكندرية | Alexandria | Alexandria | PPLA2 | 159467 | فرجينيا | 11.41 | wave | alexandria-us |
| us | palmdale | بالمديل | Palmdale | Palmdale | PPL | 158351 | كاليفورنيا | 59.78 |  |  |
| us | salinas | ساليناس | Salinas | Salinas | PPLA2 | 157380 | كاليفورنيا | 139.49 | wave | salinas-us |
| us | sunnyvale | سانيفال | Sunnyvale | Sunnyvale | PPL | 155805 | كاليفورنيا | 56.38 |  |  |
| us | frisco | فريسكو | Frisco | Frisco | PPL | 154407 | تكساس | 41.66 |  |  |
| us | pasadena | باسادينا | Pasadena | Pasadena | PPL | 153784 | تكساس | 17.33 | wave | pasadena-us |
| us | jackson | جاكسون | Jackson | Jackson | PPLA | 153701 | مسيسيبي | 568.87 | wave | jackson-us |
| us | pomona | بومونا | Pomona | Pomona | PPL | 153266 | كاليفورنيا | 45.27 | wave | pomona-us |
| us | lakewood | ليكوود | Lakewood | Lakewood | PPL | 152597 | كولورادو | 934.16 | wave | lakewood-us |
| us | escondido | إسكونديدو | Escondido | Escondido | PPL | 151038 | كاليفورنيا | 149.18 | wave | escondido-us |
| mx | playa-del-carmen | بلايا ديل كارمن | Playa del Carmen | Playa del Carmen | PPL | 149923 | كينتانا رو | 1265.89 |  |  |
| ca | saguenay | ساغينيه | Saguenay | Saguenay | PPL | 148886 | كيبيك | 375.60 |  |  |
| ca | coquitlam | كوكويتلام | Coquitlam | Coquitlam | PPLA3 | 148625 | كولومبيا البريطانية | 24.56 |  |  |
| ca | barrie | باري | Barrie | Barrie | PPL | 147829 | أونتاريو | 86.08 | wave | barrie-ca |
| us | savannah | سافانا | Savannah | Savannah | PPLA2 | 147780 | جورجيا | 708.48 |  |  |
| us | paterson | باترسون | Paterson | Paterson | PPLA2 | 147754 | نيو جيرسي | 26.63 | wave | paterson-us |
| us | naperville | نابرفيل | Naperville | Naperville | PPL | 147100 | إلينوي | 44.09 |  |  |
| mx | colima | كوليما | Colima | Colima | PPLA | 146965 | كوليما | 161.85 | wave | colima-mx |
| us | gainesville | غينزفيل | Gainesville | Gainesville | PPLA2 | 145214 | فلوريدا | 480.78 |  |  |
| ca | kelowna | كيلونا | Kelowna | Kelowna | PPL | 144576 | كولومبيا البريطانية | 270.40 |  |  |
| ca | guelph | غويلف | Guelph | Guelph | PPL | 143740 | أونتاريو | 71.29 | wave | guelph-ca |
| us | surprise | سوربرايز | Surprise | Surprise | PPL | 143148 | أريزونا | 31.43 | wave | surprise-us |
| us | columbia | كولومبيا | Columbia | Columbia | PPLA | 142416 | كارولاينا الجنوبية | 652.14 |  |  |
| us | pasadena | باسادينا | Pasadena | Pasadena | PPL | 142250 | كاليفورنيا | 14.01 | wave | pasadena-us |
| ca | abbotsford | أبوتسفورد | Abbotsford | Abbotsford | PPL | 141397 | كولومبيا البريطانية | 67.88 | wave | abbotsford-ca |
| us | orange | أورانج | Orange | Orange | PPLA2 | 140992 | كاليفورنيا | 46.51 |  |  |
| us | killeen | كيلين | Killeen | Killeen | PPL | 140806 | تكساس | 204.37 |  |  |
| us | mcallen | ماكالين | McAllen | McAllen | PPL | 140269 | تكساس | 485.04 |  |  |
| us | bellevue | بالفيو | Bellevue | Bellevue | PPL | 139820 | واشنطن | 9.86 | wave | bellevue-us |
| ca | whitby | ويتبي | Whitby | Whitby | PPL | 138501 | أونتاريو | 44.30 | wave | whitby-ca |
| us | hampton | هامبتون | Hampton | Hampton | PPLA2 | 137148 | فرجينيا | 217.38 | wave | hampton-us |
| us | miramar | ميرامار | Miramar | Miramar | PPL | 137132 | فلوريدا | 25.41 | wave | miramar-us |
| ca | st-catharines | سانت كاثرينز | St. Catharines | St. Catharines | PPL | 136803 | أونتاريو | 54.78 |  |  |
| us | olathe | أولاث | Olathe | Olathe | PPLA2 | 134305 | كانساس | 693.83 |  |  |
| us | carrollton | كارولتون | Carrollton | Carrollton | PPL | 133168 | تكساس | 21.53 |  |  |
| ca | milton | ميلتون | Milton | Milton | PPLA2 | 132979 | أونتاريو | 43.01 | wave | milton-ca |
| us | charleston | تشارلستون | Charleston | Charleston | PPLA2 | 132609 | كارولاينا الجنوبية | 729.87 | wave | charleston-us |
| us | midland | مدلاند | Midland | Midland | PPLA2 | 132524 | تكساس | 503.33 | wave | midland-us |
| ca | kingston | كينغستون | Kingston | Kingston | PPL | 132485 | أونتاريو | 146.22 | wave | kingston-ca |
| us | waco | واكو | Waco | Waco | PPLA2 | 132356 | تكساس | 140.39 | wave | waco-us |
| us | new-haven | نيو هيفن | New Haven | New Haven | PPL | 130322 | كونيتيكت | 112.08 | wave | new-haven-us |
| us | visalia | فيساليا | Visalia | Visalia | PPLA2 | 130104 | كاليفورنيا | 270.62 |  |  |
| ca | cambridge | كامبريدج | Cambridge | Cambridge | PPL | 129920 | أونتاريو | 81.74 | wave | cambridge-ca |
| us | coral-springs | كورال سبرنغز | Coral Springs | Coral Springs | PPL | 129485 | فلوريدا | 57.20 |  |  |
| us | columbia | كولومبيا | Columbia | Columbia | PPLA2 | 129330 | ميزوري | 514.15 |  |  |
| us | elizabeth | إليزابيث | Elizabeth | Elizabeth | PPLA2 | 129007 | نيو جيرسي | 18.09 | wave | elizabeth-us |
| us | concord | كونكورد | Concord | Concord | PPL | 128667 | كاليفورنيا | 40.88 | wave | concord-us |
| us | kent | كينت | Kent | Kent | PPL | 126952 | واشنطن | 26.09 | wave | kent-us |
| us | east-los-angeles | إيست لوس أنجيلس | East Los Angeles | East Los Angeles | PPL | 126496 | كاليفورنيا | 7.32 |  |  |
| us | santa-clara | سانتا كلارا | Santa Clara | Santa Clara | PPL | 126215 | كاليفورنيا | 62.15 | wave | santa-clara-us |
| us | abilene | أبيلين | Abilene | Abilene | PPLA2 | 125182 | تكساس | 277.41 | wave | abilene-us |
| us | victorville | فيكتورفيل | Victorville | Victorville | PPL | 122225 | كاليفورنيا | 102.72 |  |  |
| us | vallejo | فاليجو | Vallejo | Vallejo | PPL | 121692 | كاليفورنيا | 39.29 | wave | vallejo-us |
| us | lafayette | لافاييت | Lafayette | Lafayette | PPLA2 | 121374 | لويزيانا | 326.70 |  |  |
| us | chico | تشيكو | Chico | Chico | PPL | 121345 | كاليفورنيا | 223.01 |  |  |
| us | north-stamford | نورت استامفورد | North Stamford | North Stamford | PPL | 121230 | كونيتيكت | 61.21 |  |  |
| us | evansville | إيفانسفيل | Evansville | Evansville | PPLA2 | 119943 | إنديانا | 434.08 | wave | evansville-us |
| us | palm-bay | بالم باي | Palm Bay | Palm Bay | PPL | 119760 | فلوريدا | 255.76 |  |  |
| ca | ajax | أجاكس | Ajax | Ajax | PPL | 119677 | أونتاريو | 35.65 | wave | ajax-ca |
| us | fargo | فارغو | Fargo | Fargo | PPLA2 | 118523 | داكوتا الشمالية | 914.95 |  |  |
| ca | saanich | سانيتش | Saanich | Saanich | PPL | 117735 | كولومبيا البريطانية | 83.51 |  |  |
| us | clearwater | كليرواتر | Clearwater | Clearwater | PPLA2 | 117292 | فلوريدا | 356.36 | wave | clearwater-us |
| us | independence | إنديبندنس | Independence | Independence | PPL | 117255 | ميزوري | 651.93 |  |  |
| us | ann-arbor | آن آربر | Ann Arbor | Ann Arbor | PPLA2 | 117070 | ميشيغان | 323.99 |  |  |
| us | el-monte | إل مونتي | El Monte | El Monte | PPL | 116732 | كاليفورنيا | 19.99 | wave | el-monte-us |
| us | wilmington | ويلمينغتون | Wilmington | Wilmington | PPLA2 | 115933 | كارولاينا الشمالية | 525.76 |  |  |
| us | provo | بروفو | Provo | Provo | PPLA2 | 115162 | يوتاه | 755.41 |  |  |
| us | peoria | بيوريا | Peoria | Peoria | PPLA2 | 115070 | إلينوي | 210.09 | wave | peoria-us |
| us | odessa | أوديسا | Odessa | Odessa | PPLA2 | 114428 | تكساس | 533.58 | wave | odessa-us |
| us | downey | داونى | Downey | Downey | PPL | 114219 | كاليفورنيا | 16.14 |  |  |
| mx | navojoa | ناووخوا | Navojoa | Navojoa | PPLA2 | 113836 | سونورا | 921.95 |  |  |
| us | costa-mesa | كوستا ميسا | Costa Mesa | Costa Mesa | PPL | 113204 | كاليفورنيا | 54.68 |  |  |
| us | miami-gardens | ميامي غاردنز | Miami Gardens | Miami Gardens | PPL | 113187 | فلوريدا | 20.76 |  |  |
| us | elgin | إلجين | Elgin | Elgin | PPL | 112111 | إلينوي | 56.70 | wave | elgin-us |
| mx | ciudad-guzman | ثيوداد جوثمان | Ciudad Guzmán | Ciudad Guzmán | PPLA2 | 111975 | خاليسكو | 106.92 |  |  |
| us | inglewood | إنغليووود | Inglewood | Inglewood | PPL | 111666 | كاليفورنيا | 14.25 | wave | inglewood-us |
| us | richardson | ريتشاردسون | Richardson | Richardson | PPL | 110815 | تكساس | 20.08 | wave | richardson-us |
| us | gresham | غريشام | Gresham | Gresham | PPL | 110553 | أوريغون | 234.52 |  |  |
| ca | st-johns | سانت جونز | St. John's | St. John's | PPLA | 110525 | نيوفاوندلاند ولابرادور | 1606.94 |  |  |
| us | cambridge | كامبريدج | Cambridge | Cambridge | PPL | 110402 | ماساتشوستس | 4.18 | wave | cambridge-us |
| us | high-point | هاي بوينت | High Point | High Point | PPL | 110268 | كارولاينا الشمالية | 419.95 | wave | high-point-us |
| us | manchester | مانتشستر | Manchester | Manchester | PPL | 110229 | نيو هامبشير | 77.73 | wave | manchester-us |
| us | richmond | ريتشموند | Richmond | Richmond | PPL | 109708 | كاليفورنيا | 18.96 | wave | richmond-us |
| us | pueblo | بويبلو | Pueblo | Pueblo | PPLA2 | 109412 | كولورادو | 858.68 |  |  |
| us | pearland | بيرلاند | Pearland | Pearland | PPL | 108821 | تكساس | 23.34 |  |  |
| us | greeley | غريلي | Greeley | Greeley | PPLA2 | 108795 | كولورادو | 1014.08 |  |  |
| us | enterprise | إنتربرايز | Enterprise | Enterprise | PPL | 108481 | نيفادا | 350.42 | wave | enterprise-us |
| us | everett | إيفريت | Everett | Everett | PPLA2 | 108010 | واشنطن | 42.57 | wave | everett-us |
| us | pompano-beach | بومبانو سيتى | Pompano Beach | Pompano Beach | PPL | 107762 | فلوريدا | 53.37 |  |  |
| us | norwalk | نوروالك | Norwalk | Norwalk | PPL | 107140 | كاليفورنيا | 22.39 |  |  |
| us | boulder | بولدر | Boulder | Boulder | PPLA2 | 106803 | كولورادو | 948.43 |  |  |
| us | broken-arrow | بروكن أرو | Broken Arrow | Broken Arrow | PPL | 106563 | أوكلاهوما | 375.77 |  |  |
| us | daly-city | دالي سيتي | Daly City | Daly City | PPL | 106562 | كاليفورنيا | 8.55 |  |  |
| ca | sydney | سيدنى | Sydney | Sydney | PPL | 105968 | نوفا سكوشا | 1038.37 | wave | sydney-ca |
| us | sandy-springs | ساندي سبرينغز | Sandy Springs | Sandy Springs | PPL | 105330 | جورجيا | 858.87 |  |  |
| us | burbank | بربانك | Burbank | Burbank | PPL | 105319 | كاليفورنيا | 15.52 |  |  |
| us | green-bay | غرين باي | Green Bay | Green Bay | PPLA2 | 105207 | ويسكونسن | 295.37 | wave | green-bay-us |
| ca | waterloo | واترلو | Waterloo | Waterloo | PPL | 104986 | أونتاريو | 93.63 | wave | waterloo-ca |
| us | wichita-falls | ويتشيتا فولز | Wichita Falls | Wichita Falls | PPLA2 | 104710 | تكساس | 202.02 |  |  |
| ca | brantford | برانتفورد | Brantford | Brantford | PPL | 104688 | أونتاريو | 91.83 | wave | brantford-ca |
| ca | kamloops | كاملوبس | Kamloops | Kamloops | PPL | 104460 | كولومبيا البريطانية | 252.58 |  |  |
| us | lakeland | ليكلاند | Lakeland | Lakeland | PPL | 104401 | فلوريدا | 307.46 | wave | lakeland-us |
| us | clovis | كلوفيس | Clovis | Clovis | PPL | 104180 | كاليفورنيا | 262.45 |  |  |
| us | tyler | تايلر | Tyler | Tyler | PPLA2 | 103700 | تكساس | 147.96 |  |  |
| us | san-mateo | سان ماتيو | San Mateo | San Mateo | PPL | 103536 | كاليفورنيا | 24.97 | wave | san-mateo-us |
| us | brandon | براندون | Brandon | Brandon | PPL | 103483 | فلوريدا | 318.91 | wave | brandon-us |
| us | rialto | ريالتو | Rialto | Rialto | PPL | 103132 | كاليفورنيا | 80.66 |  |  |
| us | davenport | دافنبورت | Davenport | Davenport | PPLA2 | 102582 | آيوا | 247.87 | wave | davenport-us |
| us | hillsboro | هيلسبورو | Hillsboro | Hillsboro | PPLA2 | 102347 | أوريغون | 237.05 | wave | hillsboro-us |
| ca | delta | ديلتا | Delta | Delta | PPL | 101668 | كولومبيا البريطانية | 21.89 | wave | delta-ca |
| us | las-cruces | لاس كروسيس | Las Cruces | Las Cruces | PPLA2 | 101643 | نيو مكسيكو | 510.33 | wave | las-cruces-us |
| ca | dartmouth | دارتموث | Dartmouth | Dartmouth | PPL | 101343 | نوفا سكوشا | 789.20 | wave | dartmouth-ca |
| us | vista | فيستا | Vista | Vista | PPL | 100890 | كاليفورنيا | 132.56 |  |  |
| us | davie | ديفي | Davie | Davie | PPL | 100882 | فلوريدا | 33.74 |  |  |
| us | roanoke | روانوك | Roanoke | Roanoke | PPLA2 | 100011 | فرجينيا | 312.57 |  |  |
| us | trenton | ترنتون | Trenton | Trenton | PPLA | 89620 | نيو جيرسي | 83.22 | wave | trenton-us |
| mx | tlaxcala | تلاكسكالا | Tlaxcala | Tlaxcala | PPLA | 84670 | تلاكسكالا | 94.72 |  |  |
| us | cheyenne | شايان | Cheyenne | Cheyenne | PPLA | 65132 | وايومنغ | 1068.32 | wave | cheyenne-us |
| us | carson-city | كارسون سيتى | Carson City | Carson City | PPLA | 58639 | نيفادا | 277.75 |  |  |
| us | olympia | أولمبيا | Olympia | Olympia | PPLA | 55733 | واشنطن | 75.75 |  |  |
| us | harrisburg | هاريسبرج | Harrisburg | Harrisburg | PPLA | 50183 | بنسلفانيا | 152.51 | wave | harrisburg-us |
| us | charleston | تشارلستون | Charleston | Charleston | PPLA | 46838 | فرجينيا الغربية | 403.95 | wave | charleston-us |
| us | concord | كونكورد | Concord | Concord | PPLA | 43976 | نيو هامبشير | 102.07 | wave | concord-us |
| us | jefferson-city | جفرسن سيتي | Jefferson City | Jefferson City | PPLA | 42595 | ميزوري | 532.35 |  |  |
| us | dover | دوفر | Dover | Dover | PPLA | 39403 | ديلاوير | 133.59 | wave | dover-us |
| us | frankfort | فرانكفورت | Frankfort | Frankfort | PPLA | 28391 | كنتاكي | 471.37 |  |  |
| us | montpelier | مونبلييه | Montpelier | Montpelier | PPLA | 8074 | فيرمونت | 244.30 |  |  |
| ca | iqaluit | إيكالويت | Iqaluit | Iqaluit | PPLA | 7429 | نونافوت | 2053.13 |  |  |

## mixed_script (153)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| us | philadelphia | flaڈylfya | Philadelphia | Philadelphia | PPLA2 | 1573916 | بنسلفانيا | 129.53 |  |  |
| us | san-antonio | سان آنتونیو | San Antonio | San Antonio | PPLA2 | 1526656 | تكساس | 304.34 | wave | san-antonio-us |
| mx | zapopan | زاپوپان، خالیسکو | Zapopan | Zapopan | PPLA2 | 1476491 | خاليسكو | 7.88 |  |  |
| mx | merida | myryڈa | Mérida | Mérida | PPLA | 1201000 | يوكاتان | 1006.81 | wave | merida-mx |
| mx | mexicali | مخیکالی | Mexicali | Mexicali | PPLA | 1032686 | باها كاليفورنيا | 1657.87 |  |  |
| ca | winnipeg | wny pyګ | Winnipeg | Winnipeg | PPLA | 749607 | مانيتوبا | 1202.20 | wave | winnipeg-ca |
| mx | morelia | مورلیا، میچوآکان | Morelia | Morelia | PPLA | 743275 | ميتشواكان | 216.97 |  |  |
| mx | torreon | تورئون٬ کواویلا | Torreón | Torreón | PPLA2 | 735340 | كواويلا | 311.51 | wave | torreon-mx |
| mx | san-luis-potosi | سان لوئیس پوتوسی سٹی | San Luis Potosí | San Luis Potosí | PPLA | 722772 | سان لويس بوتوسي | 296.92 |  |  |
| mx | aguascalientes | آگوئاسکالینتس | Aguascalientes | Aguascalientes | PPLA | 722250 | أغواسكالينتس | 175.14 |  |  |
| ca | mississauga | مسس ساگا | Mississauga | Mississauga | PPL | 717961 | أونتاريو | 23.64 |  |  |
| mx | acapulco-de-juarez | آکاپولکو، گوئررو | Acapulco de Juárez | Acapulco de Juárez | PPL | 658609 | غيريرو | 298.70 |  |  |
| mx | tlaquepaque | تلاکوپاکو | Tlaquepaque | Tlaquepaque | PPLA2 | 650123 | خاليسكو | 6.20 |  |  |
| us | las-vegas | las wygas  nywaڈa | Las Vegas | Las Vegas | PPLA2 | 641903 | نيفادا | 368.14 | wave | las-vegas-us |
| us | louisville | لوئیزویل، کینٹکی | Louisville | Louisville | PPLA2 | 624444 | كنتاكي | 433.22 | wave | louisville-us |
| mx | tuxtla | توستلا گیوتیرس | Tuxtla | Tuxtla | PPLA | 604147 | تشياباس | 702.23 |  |  |
| mx | reynosa | ریئنوسا | Reynosa | Reynosa | PPLA2 | 589466 | تاماوليباس | 207.89 |  |  |
| us | albuquerque | آلبوکرک، نیو میکسیکو | Albuquerque | Albuquerque | PPLA2 | 564559 | نيو مكسيكو | 530.41 |  |  |
| us | milwaukee | ملواکی | Milwaukee | Milwaukee | PPLA2 | 563531 | ويسكونسن | 131.06 |  |  |
| us | long-beach | لانگ بیچ، کالیفرنیا | Long Beach | Long Beach | PPL | 474140 | كاليفورنيا | 32.11 | wave | long-beach-us |
| mx | ciudad-apodaca | آپوداکا | Ciudad Apodaca | Ciudad Apodaca | PPLA2 | 467157 | نويفو ليون | 16.61 |  |  |
| mx | veracruz | وراکروس | Veracruz | Veracruz | PPLA2 | 428323 | فيراكروز | 315.05 |  |  |
| mx | xalapa-de-enriquez | khalapa ڈے anrykyz | Xalapa de Enríquez | Xalapa de Enríquez | PPLA | 424755 | فيراكروز | 232.69 |  |  |
| mx | san-nicolas-de-los-garza | سن نیکولاس د لوس گارزا | San Nicolás de los Garza | San Nicolás de los Garza | PPL | 412199 | نويفو ليون | 6.28 |  |  |
| us | minneapolis | منیاپولس | Minneapolis | Minneapolis | PPLA2 | 410939 | مينيسوتا | 570.69 |  |  |
| mx | tonala | تونالا، خالیسکو | Tonalá | Tonalá | PPLA2 | 408759 | خاليسكو | 11.96 |  |  |
| us | arlington | آرلنگٹن | Arlington | Arlington | PPL | 388125 | تكساس | 29.44 | wave | arlington-us |
| us | new-orleans | اورلینز پارش | New Orleans | New Orleans | PPLA2 | 362701 | لويزيانا | 511.01 |  |  |
| us | aurora | آرورا، کلرادو | Aurora | Aurora | PPL | 359407 | كولورادو | 951.08 | wave | aurora-us |
| mx | tapachula | تاپاچولا | Tapachula | Tapachula | PPLA2 | 353706 | تشياباس | 886.78 |  |  |
| mx | villahermosa | بیائرموسا | Villahermosa | Villahermosa | PPLA | 353577 | تاباسكو | 671.82 |  |  |
| mx | celaya | سلایا | Celaya | Celaya | PPLA2 | 340387 | غواناخواتو | 213.35 |  |  |
| mx | ciudad-obregon | سیوداد اوبرگن | Ciudad Obregón | Ciudad Obregón | PPLA2 | 329404 | سونورا | 977.46 |  |  |
| us | riverside | رور سائڈ | Riverside | Riverside | PPLA2 | 317261 | كاليفورنيا | 78.90 | wave | riverside-us |
| mx | coatzacoalcos | کواتزاکوالکوس | Coatzacoalcos | Coatzacoalcos | PPL | 310698 | فيراكروز | 513.75 |  |  |
| us | santa-ana | سانتا آنا، کالیفرنیا | Santa Ana | Santa Ana | PPLA2 | 310227 | كاليفورنيا | 48.64 | wave | santa-ana-us |
| us | stockton | استوکتون | Stockton | Stockton | PPLA2 | 305658 | كاليفورنيا | 101.14 | wave | stockton-us |
| mx | uruapan | اورواپان | Uruapan | Uruapan | PPLA2 | 299523 | ميتشواكان | 193.12 |  |  |
| mx | cholula | چولولا | Cholula | Cholula | PPL | 292881 | بويبلا | 96.26 |  |  |
| us | meads | میدز | Meads | Meads | PPL | 288649 | كنتاكي | 495.48 |  |  |
| mx | nicolas-romero | نیکولاس رومرو، مکزیکو | Nicolás Romero | Nicolás Romero | PPLA2 | 281799 | ولاية مكسيكو | 29.53 |  |  |
| mx | nogales | نوگالس، سونورا | Nogales | Nogales | PPL | 264782 | سونورا | 1211.09 | wave | nogales-mx |
| us | jersey-city | جرزی سیتی | Jersey City | Jersey City | PPLA2 | 264290 | نيو جيرسي | 6.27 |  |  |
| us | buffalo | بفیلو، نیو یارک | Buffalo | Buffalo | PPLA2 | 258071 | نيويورك | 468.73 | wave | buffalo-us |
| mx | los-mochis | لوس موچیس | Los Mochis | Los Mochis | PPLA2 | 256613 | سينالوا | 811.37 |  |  |
| mx | pachuca-de-soto | pachwka ڈے swtw | Pachuca de Soto | Pachuca de Soto | PPLA | 256584 | هيدالغو | 86.84 |  |  |
| ca | burnaby | brnabے | Burnaby | Burnaby | PPLA3 | 249125 | كولومبيا البريطانية | 12.33 |  |  |
| us | lubbock | لاباک، تگزاس | Lubbock | Lubbock | PPLA2 | 249042 | تكساس | 479.06 |  |  |
| mx | tehuacan | تهواکان | Tehuacán | Tehuacán | PPLA2 | 248716 | بويبلا | 211.95 |  |  |
| us | gilbert | گلبرٹ، ایریزونا | Gilbert | Gilbert | PPL | 247542 | أريزونا | 28.51 | wave | gilbert-us |
| us | tri-cities | ٹرائی-سیٹیز، واشنگٹن | Tri-Cities | Tri-Cities | PPLS | 244036 | واشنطن | 282.11 |  |  |
| us | norfolk | نارفوک، ورجینیا | Norfolk | Norfolk | PPLA2 | 238005 | فرجينيا | 238.41 | wave | norfolk-us |
| us | boise | بوئسے | Boise | Boise | PPLA | 235684 | أيداهو | 651.06 |  |  |
| us | north-las-vegas | لاس وگاس شمالی، نوادا | North Las Vegas | North Las Vegas | PPL | 234807 | نيفادا | 371.19 |  |  |
| us | fremont | فرمونت، کالیفورنیا | Fremont | Fremont | PPL | 232206 | كاليفورنيا | 45.53 |  |  |
| us | spokane | اسپوکن | Spokane | Spokane | PPLA2 | 229447 | واشنطن | 367.38 |  |  |
| us | richmond | rchmnڈ | Richmond | Richmond | PPLA | 226610 | فرجينيا | 154.97 | wave | richmond-us |
| ca | regina | رجاینا | Regina | Regina | PPLA | 226404 | ساسكاتشوان | 667.98 | wave | regina-ca |
| mx | campeche | kmpychے | Campeche | Campeche | PPLA | 220389 | كامبتشي | 903.42 |  |  |
| mx | ciudad-acuna | اکونا، کواویلا | Ciudad Acuña | Ciudad Acuña | PPL | 216099 | كواويلا | 409.21 |  |  |
| mx | monclova | مونکلووا | Monclova | Monclova | PPLA2 | 215271 | كواويلا | 174.74 | wave | monclova-mx |
| us | des-moines | دموین، آیووا | Des Moines | Des Moines | PPLA | 214133 | آيوا | 496.97 |  |  |
| us | modesto | مودستو، کالیفرنیا | Modesto | Modesto | PPLA2 | 211266 | كاليفورنيا | 126.05 |  |  |
| mx | cordoba | کوردوبا، وراکروز | Córdoba | Córdoba | PPL | 204721 | فيراكروز | 239.76 | curated | cordoba-mx |
| us | fayetteville | فائیٹویل، شمالی کیرولائنا | Fayetteville | Fayetteville | PPLA2 | 201963 | كارولاينا الشمالية | 458.73 |  |  |
| us | huntington-beach | هانتینگتون بیچ، کالیفرنیا | Huntington Beach | Huntington Beach | PPL | 201899 | كاليفورنيا | 49.08 |  |  |
| us | amarillo | آماریلو، تگزاس | Amarillo | Amarillo | PPLA2 | 198645 | تكساس | 537.76 | wave | amarillo-us |
| mx | ciudad-madero | سیوداد مادرو | Ciudad Madero | Ciudad Madero | PPLA2 | 197216 | تاماوليباس | 340.76 |  |  |
| us | montgomery | mwntګmry | Montgomery | Montgomery | PPLA | 195287 | ألاباما | 910.84 |  |  |
| us | grand-rapids | گرندرپیدز، میشیگان | Grand Rapids | Grand Rapids | PPLA2 | 195097 | ميشيغان | 201.22 | wave | grand-rapids-us |
| mx | ciudad-del-carmen | سیوداد دل کارمن | Ciudad del Carmen | Ciudad del Carmen | PPL | 191238 | كامبتشي | 772.57 |  |  |
| us | providence | prwwyڈns  rwڈ aylynڈ | Providence | Providence | PPLA | 190934 | رود آيلاند | 66.38 |  |  |
| us | knoxville | ناکسویل، تنسی | Knoxville | Knoxville | PPLA2 | 190740 | تينيسي | 690.21 |  |  |
| us | sunrise-manor | سانرایز منور، نوادا | Sunrise Manor | Sunrise Manor | PPL | 189372 | نيفادا | 375.14 |  |  |
| ca | burlington | brlngٹn  awnٹaryw | Burlington | Burlington | PPL | 186948 | أونتاريو | 47.13 | wave | burlington-ca |
| mx | poza-rica-de-hidalgo | پوزا ریکا، وراکروز | Poza Rica de Hidalgo | Poza Rica de Hidalgo | PPL | 185242 | فيراكروز | 213.46 |  |  |
| us | fort-lauderdale | فورت لادردیل، فلوریدا | Fort Lauderdale | Fort Lauderdale | PPLA2 | 183146 | فلوريدا | 40.39 |  |  |
| us | santa-rosa | سانتا روزا، کالیفرنیا | Santa Rosa | Santa Rosa | PPLA2 | 178127 | كاليفورنيا | 78.38 | wave | santa-rosa-us |
| mx | san-luis-rio-colorado | سان لویس ریو کولورادو | San Luis Río Colorado | San Luis Río Colorado | PPLA2 | 176685 | سونورا | 1591.52 |  |  |
| us | springfield | اسپرینگفیلد، میزوری | Springfield | Springfield | PPLA2 | 170188 | ميزوري | 587.39 | wave | springfield-us |
| ca | greater-sudbury | سادبری بزرگ | Greater Sudbury | Greater Sudbury | PPL | 166004 | أونتاريو | 339.72 |  |  |
| us | murfreesboro | مورفریزبورو، تنسی | Murfreesboro | Murfreesboro | PPLA2 | 165430 | تينيسي | 679.29 |  |  |
| mx | salamanca | سالامانکا، گواناخواتو | Salamanca | Salamanca | PPLA2 | 160682 | غواناخواتو | 224.18 | wave | salamanca-mx |
| mx | manzanillo | مانزانیلو | Manzanillo | Manzanillo | PPLA2 | 159853 | كوليما | 200.49 |  |  |
| mx | tuxtepec | سان خوان ناوتیتستا توکستیپیک | Tuxtepec | Tuxtepec | PPL | 159452 | واهاكا | 350.18 |  |  |
| mx | san-pablo-de-las-salinas | سانت پاوڵی سالیناس | San Pablo de las Salinas | San Pablo de las Salinas | PPL | 156191 | ولاية مكسيكو | 26.33 |  |  |
| us | springfield | اسپرینگفیلد، ماساچوست | Springfield | Springfield | PPL | 154341 | ماساتشوستس | 129.28 | wave | springfield-us |
| mx | piedras-negras | پیئدراس نیگراس، كواہويلا | Piedras Negras | Piedras Negras | PPL | 150178 | كواويلا | 335.71 |  |  |
| us | hollywood | هالیوود، فلوریدا | Hollywood | Hollywood | PPL | 149728 | فلوريدا | 28.06 |  |  |
| us | rockford | راک فورڈ، الینوائے | Rockford | Rockford | PPLA2 | 148278 | إلينوي | 128.51 | wave | rockford-us |
| mx | ciudad-delicias | دلیسیاس | Ciudad Delicias | Ciudad Delicias | PPL | 148045 | تشيواوا | 581.74 |  |  |
| us | bridgeport | برج پورٹ، کنیکٹیکٹ | Bridgeport | Bridgeport | PPL | 147629 | كونيتيكت | 85.98 | wave | bridgeport-us |
| us | mesquite | مسکیت، تگزاس | Mesquite | Mesquite | PPL | 144788 | تكساس | 18.53 |  |  |
| ca | trois-rivieres | ترو-ریویائر | Trois-Rivières | Trois-Rivières | PPL | 144472 | كيبيك | 122.54 |  |  |
| us | syracuse | سائراکیوز | Syracuse | Syracuse | PPLA2 | 144142 | نيويورك | 314.40 |  |  |
| us | torrance | تورانس، کالیفرنیا | Torrance | Torrance | PPL | 143592 | كاليفورنيا | 25.66 | wave | torrance-us |
| ca | levis | لوی، کبک | Lévis | Lévis | PPL | 143414 | كيبيك | 234.12 | wave | levis-ca |
| mx | fresnillo | فرسنیلو | Fresnillo | Fresnillo | PPLA2 | 143281 | ساكاتيكاس | 284.06 |  |  |
| us | fullerton | فلرٹن | Fullerton | Fullerton | PPL | 140847 | كاليفورنيا | 35.65 |  |  |
| us | metairie | مِتِری، لوئیزیانا | Metairie | Metairie | PPL | 138481 | لويزيانا | 503.60 |  |  |
| us | warren | وارن، مشی گن | Warren | Warren | PPL | 134056 | ميشيغان | 386.39 | wave | warren-us |
| us | thornton | تھورن ٹن، کولوراڈو | Thornton | Thornton | PPL | 133451 | كولورادو | 953.73 | wave | thornton-us |
| us | sterling-heights | استرلینق هایتس، میشیقان | Sterling Heights | Sterling Heights | PPL | 132052 | ميشيغان | 386.62 |  |  |
| us | denton | دنتون، تگزاس | Denton | Denton | PPLA2 | 131044 | تكساس | 57.93 |  |  |
| us | cedar-rapids | سدار راپیدز، آیووا | Cedar Rapids | Cedar Rapids | PPLA2 | 130405 | آيوا | 332.30 |  |  |
| us | roseville | رزویل، کالیفرنیا | Roseville | Roseville | PPL | 130269 | كاليفورنيا | 146.85 | wave | roseville-us |
| ca | sherbrooke | شربروک | Sherbrooke | Sherbrooke | PPL | 129447 | كيبيك | 130.62 | wave | sherbrooke-ca |
| us | thousand-oaks | تاوزند اوکس | Thousand Oaks | Thousand Oaks | PPL | 129339 | كاليفورنيا | 56.24 |  |  |
| mx | zacatecas | زاکاتکاس ٬زاکاتکاس | Zacatecas | Zacatecas | PPLA | 129011 | ساكاتيكاس | 247.54 |  |  |
| us | stamford | استمفورد، کنتیکت | Stamford | Stamford | PPL | 128874 | كونيتيكت | 54.57 | wave | stamford-us |
| us | norman | نورمن، اکلاهما | Norman | Norman | PPLA2 | 128026 | أوكلاهوما | 278.34 | wave | norman-us |
| us | athens | آتئنز، جورجیا | Athens | Athens | PPLA2 | 127315 | جورجيا | 789.72 | wave | athens-us |
| us | amherst | امهرست، نیویورک | Amherst | Amherst | PPL | 122366 | نيويورك | 470.14 | wave | amherst-us |
| us | berkeley | برکلئی، کالیفورنیا | Berkeley | Berkeley | PPL | 120972 | كاليفورنيا | 16.78 |  |  |
| us | west-palm-beach | وست پالم بیچ، فلوریدا | West Palm Beach | West Palm Beach | PPLA2 | 120932 | فلوريدا | 106.94 |  |  |
| us | allentown | آلن‌تاون، پنسیلوانیا | Allentown | Allentown | PPLA2 | 120207 | بنسلفانيا | 125.73 |  |  |
| mx | iguala-de-la-independencia | ایگوالا | Iguala de la Independencia | Iguala de la Independencia | PPLA2 | 118468 | غيريرو | 128.29 |  |  |
| mx | heroica-guaymas | گوایماس | Heroica Guaymas | Heroica Guaymas | PPLA2 | 117253 | سونورا | 1078.87 |  |  |
| us | westminster | وزتمینزتر، کولورادو | Westminster | Westminster | PPL | 116317 | كولورادو | 947.36 | wave | westminster-us |
| us | round-rock | راؤنڈ راک، ٹیکساس | Round Rock | Round Rock | PPL | 115997 | تكساس | 237.11 |  |  |
| us | beaumont | بومانت، تگزاس | Beaumont | Beaumont | PPLA2 | 115282 | تكساس | 127.45 | wave | beaumont-us |
| us | springfield | sprnګ fylډ | Springfield | Springfield | PPLA | 114394 | إلينوي | 286.35 | wave | springfield-us |
| us | fairfield | فئرفیلڈ | Fairfield | Fairfield | PPLA2 | 112970 | كاليفورنيا | 62.36 | wave | fairfield-us |
| us | lansing | lnsnګ | Lansing | Lansing | PPLA | 112644 | ميشيغان | 270.06 | wave | lansing-us |
| us | rochester | راچستر، مینه‌سوتا | Rochester | Rochester | PPLA2 | 112225 | مينيسوتا | 460.31 |  |  |
| mx | minatitlan | میناتیتلان | Minatitlán | Minatitlán | PPLA2 | 112046 | فيراكروز | 507.56 |  |  |
| us | west-jordan | وست جردن، یوتا | West Jordan | West Jordan | PPL | 111946 | يوتاه | 796.39 |  |  |
| ca | terrebonne | تربون، کبک | Terrebonne | Terrebonne | PPL | 111575 | كيبيك | 22.92 | wave | terrebonne-ca |
| us | tuscaloosa | تاسکالوسا، آلاباما | Tuscaloosa | Tuscaloosa | PPLA2 | 111338 | ألاباما | 832.87 |  |  |
| us | lowell | لوول، ماساچوست | Lowell | Lowell | PPL | 110699 | ماساتشوستس | 36.99 |  |  |
| us | antioch | آنتیوچ، کالیفرنیا | Antioch | Antioch | PPL | 110542 | كاليفورنيا | 59.61 |  |  |
| us | centennial | سنتنیال، کلرادو | Centennial | Centennial | PPL | 109741 | كولورادو | 936.58 | wave | centennial-us |
| ca | thunder-bay | تھنڈر بے | Thunder Bay | Thunder Bay | PPL | 108843 | أونتاريو | 924.58 |  |  |
| us | waterbury | واتربری، کنتیکت | Waterbury | Waterbury | PPL | 108802 | كونيتيكت | 123.39 |  |  |
| us | west-covina | وست کووینا، کالیفرنیا | West Covina | West Covina | PPL | 108484 | كاليفورنيا | 28.13 |  |  |
| us | north-charleston | شمالی چارلسٹن، جنوبی کیرولائنا | North Charleston | North Charleston | PPL | 108304 | كارولاينا الجنوبية | 723.08 |  |  |
| mx | hidalgo-del-parral | پارال، چہواہوا | Hidalgo del Parral | Hidalgo del Parral | PPLA2 | 104836 | تشيواوا | 550.86 |  |  |
| us | lewisville | لوئیس‌ویل، تگزاس | Lewisville | Lewisville | PPL | 104039 | تكساس | 35.17 | wave | lewisville-us |
| us | el-cajon | ال کاجون | El Cajon | El Cajon | PPL | 103679 | كاليفورنيا | 183.54 | wave | el-cajon-us |
| ca | lethbridge | لث‌بریج | Lethbridge | Lethbridge | PPL | 103197 | ألبرتا | 173.94 |  |  |
| us | edison | ادیسون، نیوجرسی | Edison | Edison | PPL | 102548 | نيو جيرسي | 40.51 |  |  |
| mx | apatzingan | اپاتزینگان | Apatzingán | Apatzingán | PPL | 102362 | ميتشواكان | 203.20 |  |  |
| us | albany | آلبانی، نیویورک | Albany | Albany | PPLA | 101228 | نيويورك | 216.69 | wave | albany-us |
| us | new-bedford | بدفورد جدید، ماساچوست | New Bedford | New Bedford | PPL | 101079 | ماساتشوستس | 81.33 |  |  |
| ca | red-deer | ryڈ ڈyyr  albrٹa | Red Deer | Red Deer | PPL | 100844 | ألبرتا | 137.16 |  |  |
| us | renton | رنتون، واشینگتن | Renton | Renton | PPL | 100242 | واشنطن | 16.20 | wave | renton-us |
| us | bismarck | انٹیل | Bismarck | Bismarck | PPLA | 75092 | داكوتا الشمالية | 1178.89 | wave | bismarck-us |
| mx | guanajuato | gwana ہwatw | Guanajuato | Guanajuato | PPLA | 72237 | غواناخواتو | 220.88 |  |  |
| ca | fredericton | فردریکتون | Fredericton | Fredericton | PPLA | 63116 | نيو برونزويك | 537.86 |  |  |
| us | annapolis | آناپولیس | Annapolis | Annapolis | PPLA | 40812 | ميريلاند | 47.80 |  |  |
| us | juneau | اوکلاہوما سٹی | Juneau | Juneau | PPLA | 31555 | ألاسكا | 1434.11 |  |  |
| ca | whitehorse | wayٹ ہars  ywkwn | Whitehorse | Whitehorse | PPLA | 28201 | يوكون | 1476.63 | wave | whitehorse-ca |
| ca | yellowknife | ylwknyfے | Yellowknife | Yellowknife | PPLA | 20340 | الأقاليم الشمالية الغربية | 1268.80 |  |  |

## mixed_latin (9)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| us | austin | asټn | Austin | Austin | PPLA | 974447 | تكساس | 235.35 | wave | austin-us |
| us | indianapolis | anډyana pwlys | Indianapolis | Indianapolis | PPLA | 887642 | إنديانا | 265.26 |  |  |
| us | raleigh | ralې | Raleigh | Raleigh | PPLA | 482295 | كارولاينا الشمالية | 376.25 | wave | raleigh-us |
| us | baton-rouge | byټn rwj | Baton Rouge | Baton Rouge | PPLA | 227470 | لويزيانا | 409.41 |  |  |
| us | hartford | harټ fwrډ | Hartford | Hartford | PPLA | 121054 | كونيتيكت | 149.73 | wave | hartford-us |
| us | santa-fe | santa fې | Santa Fe | Santa Fe | PPLA | 87505 | نيو مكسيكو | 614.37 | wave | santa-fe-us |
| ca | charlottetown | charlwټ ټawn | Charlottetown | Charlottetown | PPLA | 38809 | جزيرة الأمير إدوارد | 811.96 |  |  |
| us | augusta | agwsټa | Augusta | Augusta | PPLA | 18899 | مين | 240.30 |  |  |
| us | pierre | pyېr | Pierre | Pierre | PPLA | 14091 | داكوتا الجنوبية | 1067.69 |  |  |

## mixed_unknown (10)

| cc | slug | name.ar | name.en | originalName | fc | pop | region | nearestKm | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| us | portland | بورتلاند، أوريغون | Portland | Portland | PPLA2 | 652503 | أوريغون | 233.08 |  |  |
| ca | surrey | سوري، كولومبيا البريطانية | Surrey | Surrey | PPL | 568322 | كولومبيا البريطانية | 29.09 | wave | surrey-ca |
| us | winston-salem | وينستون-سالم، كارولاينا الشمالية | Winston-Salem | Winston-Salem | PPLA2 | 241218 | كارولاينا الشمالية | 421.24 |  |  |
| us | san-bernardino | سان بيرناردينو، كاليفورنيا | San Bernardino | San Bernardino | PPLA2 | 216108 | كاليفورنيا | 88.08 | wave | san-bernardino-us |
| us | mobile | موبائل، الاباما | Mobile | Mobile | PPLA2 | 183289 | ألاباما | 711.41 | wave | mobile-us |
| us | dayton | دايتون، أوهايو | Dayton | Dayton | PPLA2 | 135512 | أوهايو | 373.09 | wave | dayton-us |
| ca | langley | لانغلي، كولومبيا البريطانية | Langley | Langley | PPL | 132603 | كولومبيا البريطانية | 39.17 | wave | langley-ca |
| us | topeka | توبيكا، كانساس | Topeka | Topeka | PPLA | 125963 | كانساس | 704.60 |  |  |
| us | murrieta | مورريتا، ريفيرسيدي، كاليفورنيا | Murrieta | Murrieta | PPL | 109830 | كاليفورنيا | 110.11 | wave | murrieta-us |
| us | helena | هلنا، مونتانا | Helena | Helena | PPLA | 32091 | مونتانا | 786.84 |  |  |

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
