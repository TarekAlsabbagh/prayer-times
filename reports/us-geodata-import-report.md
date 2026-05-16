# US GeoNames Import Report — Americas-1A

**Country**: United States (الولايات المتحدة)
**Wave**: `CURATED-GEODATA-AMERICAS-1A`
**Strategy**: E (popMin 100000 + alwaysInclude PPLC,PPLA + ar-quality gate)
**Generated**: 2026-05-16T11:42:20.797Z

## Pipeline

| Stage | Output |
| --- | --- |
| 1. IMPORT       | `db/places/candidates/us-geonames-raw.json` |
| 2. NORMALIZE    | `db/places/candidates/us-geonames-normalized.json` |
| 3. VALIDATE     | `db/places/candidates/us-geonames-candidates.json` |
| 3.5. AR QA GATE | enriched candidates + `americas-1a-arabic-quality.json` |
| 4. APPLY        | **NOT RUN — awaiting your review** |

## Summary

| Bucket | Count |
| --- | --- |
| Normalized candidates total       | 168810 |
| existing (matched, no action)     | 110 |
| **pending — high tier**           | **302** |
| pending — medium tier             | 0 |
| pending — low tier                | 21360 |
| needs_review                      | 147032 |
| rejected                          | 6 |
| collisions in this wave           | 37641 |
| collisions against existing curated | 1456 |

## High-tier Arabic-quality breakdown

| Quality | Count | Disposition |
| --- | --- | --- |
| `wikidata` (from ar: tag)     | 0 | ✅ auto-eligible if no collision |
| `arabic_only` (clean Arabic)  | 199 | ✅ auto-eligible if no collision |
| `mixed_script` (Persian/Urdu) | 87 | ⚠️ manual review (need Arabic) |
| `mixed_latin` (Latin in ar)   | 8 | ⚠️ manual review |
| `mixed_unknown`               | 8 | ⚠️ manual review |
| `empty` (no Arabic)           | 0 | 🔴 must supply manually |

**Passes ar-gate (high-tier):** 105
**Blocked by ar-gate (high-tier):** 197

## High-tier candidates — full detail (14 fields per row)

Fields: `slug`, `name.ar`, `name.en`, `originalName`, `countryCode`,
`feature_code`, `population`, `admin region`, `lat`, `lng`,
`nearestCuratedKm`, `arQuality`, `collision`, `priority`, `reasonIncluded`.

Sort order: passes-gate first, then by population desc.

| ✓ | slug | name.ar | name.en | originalName | cc | fc | pop | region | lat | lng | nearestKm | nearest | arQuality | collision | priority | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ✅ | manhattan | مانهاتن | Manhattan | Manhattan | us | PPLA2 | 1487536 | نيويورك | 40.7834 | -73.9663 | 8.54 | new-york | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | fort-worth | فورت وورث | Fort Worth | Fort Worth | us | PPLA2 | 1008106 | تكساس | 32.7254 | -97.3208 | 49.32 | dallas | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | columbus | كولومبوس | Columbus | Columbus | us | PPLA | 913175 | أوهايو | 39.9612 | -82.9988 | 443.57 | chicago | arabic_only |  | 95 | always_include:PPLA |
| ✅ | charlotte | تشارلوت | Charlotte | Charlotte | us | PPLA2 | 911311 | كارولاينا الشمالية | 35.2271 | -80.8431 | 530.45 | washington-dc | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | detroit | ديترويت | Detroit | Detroit | us | PPLA2 | 645705 | ميشيغان | 42.3314 | -83.0457 | 381.47 | chicago | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | memphis | ممفيس | Memphis | Memphis | us | PPLA2 | 633104 | تينيسي | 35.1495 | -90.0490 | 675.75 | dallas | arabic_only |  | 95 | pop_gte_100000 |
| ✅ | omaha | أوماها | Omaha | Omaha | us | PPLA2 | 486051 | نبراسكا | 41.2563 | -95.9404 | 694.56 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | kansas-city | كانساس سيتي | Kansas City | Kansas City | us | PPL | 475378 | ميزوري | 39.0997 | -94.5786 | 663.60 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | colorado-springs | كولورادو سبرينغس | Colorado Springs | Colorado Springs | us | PPLA2 | 456568 | كولورادو | 38.8339 | -104.8214 | 884.16 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | virginia-beach | فرجينيا بيتش | Virginia Beach | Virginia Beach | us | PPLA2 | 454808 | فرجينيا | 36.8529 | -75.9780 | 246.60 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tampa | تامبا | Tampa | Tampa | us | PPLA2 | 414547 | فلوريدا | 27.9475 | -82.4584 | 331.09 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wichita | ويتشيتا | Wichita | Wichita | us | PPLA2 | 396119 | كانساس | 37.6922 | -97.3375 | 548.78 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | bakersfield | بيكرسفيلد | Bakersfield | Bakersfield | us | PPLA2 | 373640 | كاليفورنيا | 35.3733 | -119.0187 | 163.09 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | honolulu | هونولولو | Honolulu | Honolulu | us | PPLA | 350964 | هاواي | 21.3069 | -157.8583 | 3853.93 | san-francisco | arabic_only |  | 90 | always_include:PPLA |
| ✅ | anaheim | آناهايم | Anaheim | Anaheim | us | PPL | 350742 | كاليفورنيا | 33.8353 | -117.9145 | 38.78 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | orlando | أورلاندو | Orlando | Orlando | us | PPLA2 | 334854 | فلوريدا | 28.5383 | -81.3792 | 330.34 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | pittsburgh | بيتسبرغ | Pittsburgh | Pittsburgh | us | PPLA2 | 304391 | بنسلفانيا | 40.4406 | -79.9959 | 305.27 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | anchorage | أنكوريج | Anchorage | Anchorage | us | PPLA2 | 289600 | ألاسكا | 61.2181 | -149.9003 | 2308.74 | seattle | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | henderson | هندرسون | Henderson | Henderson | us | PPL | 285667 | نيفادا | 36.0397 | -114.9819 | 370.11 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | greensboro | غرينزبورو | Greensboro | Greensboro | us | PPL | 285342 | كارولاينا الشمالية | 36.0726 | -79.7920 | 397.99 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | plano | بلانو | Plano | Plano | us | PPL | 283558 | تكساس | 33.0198 | -96.6989 | 28.55 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | fort-wayne | فورت واين | Fort Wayne | Fort Wayne | us | PPLA2 | 260326 | إنديانا | 41.1306 | -85.1289 | 224.23 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | hialeah | هياليه | Hialeah | Hialeah | us | PPL | 237069 | فلوريدا | 25.8576 | -80.2781 | 13.72 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | scottsdale | سكوتسديل | Scottsdale | Scottsdale | us | PPL | 236839 | أريزونا | 33.5092 | -111.8990 | 17.58 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | irving | إيرفينغ | Irving | Irving | us | PPL | 236607 | تكساس | 32.8140 | -96.9489 | 14.79 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | chesapeake | تشيسابيك | Chesapeake | Chesapeake | us | PPLA2 | 235429 | فرجينيا | 36.8190 | -76.2749 | 241.63 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tacoma | تاكوما | Tacoma | Tacoma | us | PPLA2 | 222906 | واشنطن | 47.2529 | -122.4443 | 40.18 | seattle | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | salt-lake-city | سالت ليك | Salt Lake City | Salt Lake City | us | PPLA | 215548 | يوتاه | 40.7608 | -111.8911 | 813.26 | phoenix | arabic_only |  | 90 | always_include:PPLA |
| ✅ | fontana | فونتانا | Fontana | Fontana | us | PPL | 212704 | كاليفورنيا | 34.0922 | -117.4351 | 74.61 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | rochester | روتشستر | Rochester | Rochester | us | PPLA2 | 209802 | نيويورك | 43.1548 | -77.6156 | 403.51 | new-york | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | columbus | كولومبوس | Columbus | Columbus | us | PPLA2 | 206922 | جورجيا | 32.4610 | -84.9877 | 878.34 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | little-rock | ليتل روك | Little Rock | Little Rock | us | PPLA | 202591 | أركنساس | 34.7465 | -92.2896 | 470.67 | dallas | arabic_only |  | 90 | always_include:PPLA |
| ✅ | tallahassee | تالاهاسي | Tallahassee | Tallahassee | us | PPLA | 201731 | فلوريدا | 30.4383 | -84.2807 | 656.58 | miami | arabic_only |  | 90 | always_include:PPLA |
| ✅ | yonkers | يونكيرس | Yonkers | Yonkers | us | PPL | 201116 | نيويورك | 40.9304 | -73.8979 | 25.85 | new-york | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cypress | سايبرس | Cypress | Cypress | us | PPL | 200839 | تكساس | 29.9691 | -95.6972 | 39.18 | houston | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | akron | آكرون | Akron | Akron | us | PPLA2 | 197542 | أوهايو | 41.0814 | -81.5190 | 451.83 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | grand-prairie | غراند براري | Grand Prairie | Grand Prairie | us | PPL | 187809 | تكساس | 32.7460 | -96.9978 | 19.08 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | shreveport | شريفبورت | Shreveport | Shreveport | us | PPLA2 | 187593 | لويزيانا | 32.5251 | -93.7502 | 286.61 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | overland-park | أوفرلاند بارك | Overland Park | Overland Park | us | PPL | 186515 | كانساس | 38.9822 | -94.6708 | 677.07 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | chattanooga | تشاتانوغا | Chattanooga | Chattanooga | us | PPLA2 | 181099 | تينيسي | 35.0456 | -85.3097 | 786.04 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | eugene | يوجين | Eugene | Eugene | us | PPLA2 | 176654 | أوريغون | 44.0521 | -123.0867 | 399.50 | seattle | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tempe | تمب | Tempe | Tempe | us | PPL | 175826 | أريزونا | 33.4148 | -111.9093 | 15.73 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | oceanside | أوسيانسيدي | Oceanside | Oceanside | us | PPL | 175691 | كاليفورنيا | 33.1959 | -117.3795 | 124.38 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | garden-grove | غاردين غروفي | Garden Grove | Garden Grove | us | PPL | 175393 | كاليفورنيا | 33.7739 | -117.9415 | 41.66 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | rancho-cucamonga | رانتشو كوكامونغا | Rancho Cucamonga | Rancho Cucamonga | us | PPL | 175236 | كاليفورنيا | 34.1064 | -117.5931 | 60.22 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cape-coral | كيب كورال | Cape Coral | Cape Coral | us | PPL | 175229 | فلوريدا | 26.5629 | -81.9495 | 196.75 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | sioux-falls | سايوكس فالز | Sioux Falls | Sioux Falls | us | PPLA2 | 171544 | داكوتا الجنوبية | 43.5437 | -96.7280 | 765.64 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ontario | أونتاريو | Ontario | Ontario | us | PPL | 171214 | كاليفورنيا | 34.0633 | -117.6509 | 54.63 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | fort-collins | فورت كولنز | Fort Collins | Fort Collins | us | PPLA2 | 170924 | كولورادو | 40.5853 | -105.0844 | 1006.65 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | elk-grove | إلك غروفي | Elk Grove | Elk Grove | us | PPL | 166913 | كاليفورنيا | 38.4088 | -121.3716 | 115.65 | san-francisco | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | pembroke-pines | بيمبروك باينز | Pembroke Pines | Pembroke Pines | us | PPL | 166611 | فلوريدا | 26.0032 | -80.2239 | 27.04 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | mckinney | ماككيني | McKinney | McKinney | us | PPLA2 | 162898 | تكساس | 33.1976 | -96.6153 | 49.78 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | cary | كاري | Cary | Cary | us | PPL | 159769 | كارولاينا الشمالية | 35.7915 | -78.7811 | 379.18 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | palmdale | بالمديل | Palmdale | Palmdale | us | PPL | 158351 | كاليفورنيا | 34.5794 | -118.1165 | 59.78 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | sunnyvale | سانيفال | Sunnyvale | Sunnyvale | us | PPL | 155805 | كاليفورنيا | 37.3688 | -122.0363 | 56.38 | san-francisco | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | frisco | فريسكو | Frisco | Frisco | us | PPL | 154407 | تكساس | 33.1507 | -96.8236 | 41.66 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | savannah | سافانا | Savannah | Savannah | us | PPLA2 | 147780 | جورجيا | 32.0835 | -81.0998 | 708.48 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | naperville | نابرفيل | Naperville | Naperville | us | PPL | 147100 | إلينوي | 41.7859 | -88.1473 | 44.09 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | gainesville | غينزفيل | Gainesville | Gainesville | us | PPLA2 | 145214 | فلوريدا | 29.6516 | -82.3248 | 480.78 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | columbia | كولومبيا | Columbia | Columbia | us | PPLA | 142416 | كارولاينا الجنوبية | 34.0007 | -81.0348 | 652.14 | washington-dc | arabic_only |  | 90 | always_include:PPLA |
| ✅ | orange | أورانج | Orange | Orange | us | PPLA2 | 140992 | كاليفورنيا | 33.7878 | -117.8531 | 46.51 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | killeen | كيلين | Killeen | Killeen | us | PPL | 140806 | تكساس | 31.1171 | -97.7278 | 204.37 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | mcallen | ماكالين | McAllen | McAllen | us | PPL | 140269 | تكساس | 26.2034 | -98.2300 | 485.04 | houston | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | olathe | أولاث | Olathe | Olathe | us | PPLA2 | 134305 | كانساس | 38.8814 | -94.8191 | 693.83 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | carrollton | كارولتون | Carrollton | Carrollton | us | PPL | 133168 | تكساس | 32.9537 | -96.8903 | 21.53 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | visalia | فيساليا | Visalia | Visalia | us | PPLA2 | 130104 | كاليفورنيا | 36.3302 | -119.2921 | 270.62 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | coral-springs | كورال سبرنغز | Coral Springs | Coral Springs | us | PPL | 129485 | فلوريدا | 26.2712 | -80.2706 | 57.20 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | columbia | كولومبيا | Columbia | Columbia | us | PPLA2 | 129330 | ميزوري | 38.9517 | -92.3341 | 514.15 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | east-los-angeles | إيست لوس أنجيلس | East Los Angeles | East Los Angeles | us | PPL | 126496 | كاليفورنيا | 34.0239 | -118.1720 | 7.32 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | victorville | فيكتورفيل | Victorville | Victorville | us | PPL | 122225 | كاليفورنيا | 34.5361 | -117.2912 | 102.72 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | lafayette | لافاييت | Lafayette | Lafayette | us | PPLA2 | 121374 | لويزيانا | 30.2241 | -92.0198 | 326.70 | houston | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | chico | تشيكو | Chico | Chico | us | PPL | 121345 | كاليفورنيا | 39.7285 | -121.8375 | 223.01 | san-francisco | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | north-stamford | نورت استامفورد | North Stamford | North Stamford | us | PPL | 121230 | كونيتيكت | 41.1382 | -73.5435 | 61.21 | new-york | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | palm-bay | بالم باي | Palm Bay | Palm Bay | us | PPL | 119760 | فلوريدا | 28.0345 | -80.5887 | 255.76 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | fargo | فارغو | Fargo | Fargo | us | PPLA2 | 118523 | داكوتا الشمالية | 46.8772 | -96.7898 | 914.95 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | independence | إنديبندنس | Independence | Independence | us | PPL | 117255 | ميزوري | 39.0911 | -94.4155 | 651.93 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | ann-arbor | آن آربر | Ann Arbor | Ann Arbor | us | PPLA2 | 117070 | ميشيغان | 42.2776 | -83.7409 | 323.99 | chicago | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wilmington | ويلمينغتون | Wilmington | Wilmington | us | PPLA2 | 115933 | كارولاينا الشمالية | 34.2356 | -77.9460 | 525.76 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | provo | بروفو | Provo | Provo | us | PPLA2 | 115162 | يوتاه | 40.2338 | -111.6585 | 755.41 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | downey | داونى | Downey | Downey | us | PPL | 114219 | كاليفورنيا | 33.9400 | -118.1326 | 16.14 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | costa-mesa | كوستا ميسا | Costa Mesa | Costa Mesa | us | PPL | 113204 | كاليفورنيا | 33.6411 | -117.9187 | 54.68 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | miami-gardens | ميامي غاردنز | Miami Gardens | Miami Gardens | us | PPL | 113187 | فلوريدا | 25.9420 | -80.2456 | 20.76 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | gresham | غريشام | Gresham | Gresham | us | PPL | 110553 | أوريغون | 45.4982 | -122.4315 | 234.52 | seattle | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | pueblo | بويبلو | Pueblo | Pueblo | us | PPLA2 | 109412 | كولورادو | 38.2544 | -104.6091 | 858.68 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | pearland | بيرلاند | Pearland | Pearland | us | PPL | 108821 | تكساس | 29.5636 | -95.2861 | 23.34 | houston | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | greeley | غريلي | Greeley | Greeley | us | PPLA2 | 108795 | كولورادو | 40.4233 | -104.7091 | 1014.08 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | pompano-beach | بومبانو سيتى | Pompano Beach | Pompano Beach | us | PPL | 107762 | فلوريدا | 26.2379 | -80.1248 | 53.37 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | norwalk | نوروالك | Norwalk | Norwalk | us | PPL | 107140 | كاليفورنيا | 33.9022 | -118.0817 | 22.39 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | boulder | بولدر | Boulder | Boulder | us | PPLA2 | 106803 | كولورادو | 40.0150 | -105.2706 | 948.43 | phoenix | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | broken-arrow | بروكن أرو | Broken Arrow | Broken Arrow | us | PPL | 106563 | أوكلاهوما | 36.0526 | -95.7908 | 375.77 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | daly-city | دالي سيتي | Daly City | Daly City | us | PPL | 106562 | كاليفورنيا | 37.7058 | -122.4619 | 8.55 | san-francisco | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | sandy-springs | ساندي سبرينغز | Sandy Springs | Sandy Springs | us | PPL | 105330 | جورجيا | 33.9243 | -84.3785 | 858.87 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | burbank | بربانك | Burbank | Burbank | us | PPL | 105319 | كاليفورنيا | 34.1808 | -118.3090 | 15.52 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | wichita-falls | ويتشيتا فولز | Wichita Falls | Wichita Falls | us | PPLA2 | 104710 | تكساس | 33.9137 | -98.4934 | 202.02 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | clovis | كلوفيس | Clovis | Clovis | us | PPL | 104180 | كاليفورنيا | 36.8252 | -119.7029 | 262.45 | san-francisco | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | tyler | تايلر | Tyler | Tyler | us | PPLA2 | 103700 | تكساس | 32.3513 | -95.3011 | 147.96 | dallas | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | rialto | ريالتو | Rialto | Rialto | us | PPL | 103132 | كاليفورنيا | 34.1064 | -117.3703 | 80.66 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | vista | فيستا | Vista | Vista | us | PPL | 100890 | كاليفورنيا | 33.2000 | -117.2425 | 132.56 | los-angeles | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | davie | ديفي | Davie | Davie | us | PPL | 100882 | فلوريدا | 26.0629 | -80.2331 | 33.74 | miami | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | roanoke | روانوك | Roanoke | Roanoke | us | PPLA2 | 100011 | فرجينيا | 37.2710 | -79.9414 | 312.57 | washington-dc | arabic_only |  | 90 | pop_gte_100000 |
| ✅ | carson-city | كارسون سيتى | Carson City | Carson City | us | PPLA | 58639 | نيفادا | 39.1638 | -119.7674 | 277.75 | san-francisco | arabic_only |  | 85 | always_include:PPLA |
| ✅ | olympia | أولمبيا | Olympia | Olympia | us | PPLA | 55733 | واشنطن | 47.0449 | -122.9017 | 75.75 | seattle | arabic_only |  | 85 | always_include:PPLA |
| ✅ | jefferson-city | جفرسن سيتي | Jefferson City | Jefferson City | us | PPLA | 42595 | ميزوري | 38.5767 | -92.1735 | 532.35 | chicago | arabic_only |  | 80 | always_include:PPLA |
| ✅ | frankfort | فرانكفورت | Frankfort | Frankfort | us | PPLA | 28391 | كنتاكي | 38.2009 | -84.8733 | 471.37 | chicago | arabic_only |  | 80 | always_include:PPLA |
| ✅ | montpelier | مونبلييه | Montpelier | Montpelier | us | PPLA | 8074 | فيرمونت | 44.2601 | -72.5754 | 244.30 | boston | arabic_only |  | 75 | always_include:PPLA |
| ⚠️ | brooklyn | بروكلين | Brooklyn | Brooklyn | us | PPLA2 | 2736074 | نيويورك | 40.6501 | -73.9496 | 8.44 | new-york | arabic_only | wave→brooklyn-us | 95 | pop_gte_100000 |
| ⚠️ | philadelphia | flaڈylfya | Philadelphia | Philadelphia | us | PPLA2 | 1573916 | بنسلفانيا | 39.9524 | -75.1636 | 129.53 | new-york | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | san-antonio | سان آنتونیو | San Antonio | San Antonio | us | PPLA2 | 1526656 | تكساس | 29.4241 | -98.4936 | 304.34 | houston | mixed_script | wave→san-antonio-us | 95 | pop_gte_100000 |
| ⚠️ | san-diego | سان دييغو | San Diego | San Diego | us | PPLA2 | 1404452 | كاليفورنيا | 32.7157 | -117.1647 | 179.22 | los-angeles | arabic_only | wave→san-diego-us | 95 | pop_gte_100000 |
| ⚠️ | jacksonville | جاكسونفيل | Jacksonville | Jacksonville | us | PPLA2 | 1009833 | فلوريدا | 30.3322 | -81.6556 | 528.11 | miami | arabic_only | wave→jacksonville-us | 95 | pop_gte_100000 |
| ⚠️ | san-jose | سا ن جوز | San Jose | San Jose | us | PPLA2 | 997368 | كاليفورنيا | 37.3394 | -121.8950 | 66.95 | san-francisco | arabic_only | wave→san-jose-us | 95 | pop_gte_100000 |
| ⚠️ | austin | asټn | Austin | Austin | us | PPLA | 974447 | تكساس | 30.2672 | -97.7431 | 235.35 | houston | mixed_latin | wave→austin-us | 95 | always_include:PPLA |
| ⚠️ | indianapolis | anډyana pwlys | Indianapolis | Indianapolis | us | PPLA | 887642 | إنديانا | 39.7684 | -86.1580 | 265.26 | chicago | mixed_latin |  | 95 | always_include:PPLA |
| ⚠️ | denver | دنفر | Denver | Denver | us | PPLA | 729019 | كولورادو | 39.7392 | -104.9847 | 942.67 | phoenix | arabic_only | wave→denver-us | 95 | always_include:PPLA |
| ⚠️ | nashville | ناشفيل | Nashville | Nashville | us | PPLA | 689447 | تينيسي | 36.1659 | -86.7844 | 639.34 | chicago | arabic_only | wave→nashville-us | 95 | always_include:PPLA |
| ⚠️ | el-paso | إل باسو | El Paso | El Paso | us | PPLA2 | 678815 | تكساس | 31.7587 | -106.4869 | 555.96 | phoenix | arabic_only | wave→el-paso-us | 95 | pop_gte_100000 |
| ⚠️ | portland | بورتلاند، أوريغون | Portland | Portland | us | PPLA2 | 652503 | أوريغون | 45.5234 | -122.6762 | 233.08 | seattle | mixed_unknown |  | 95 | pop_gte_100000 |
| ⚠️ | las-vegas | las wygas  nywaڈa | Las Vegas | Las Vegas | us | PPLA2 | 641903 | نيفادا | 36.1750 | -115.1372 | 368.14 | los-angeles | mixed_script | wave→las-vegas-us | 95 | pop_gte_100000 |
| ⚠️ | louisville | لوئیزویل، کینٹکی | Louisville | Louisville | us | PPLA2 | 624444 | كنتاكي | 38.2542 | -85.7594 | 433.22 | chicago | mixed_script | wave→louisville-us | 95 | pop_gte_100000 |
| ⚠️ | baltimore | بالتيمور | Baltimore | Baltimore | us | PPLA2 | 585708 | ميريلاند | 39.2904 | -76.6122 | 56.20 | washington-dc | arabic_only | wave→baltimore-us | 95 | pop_gte_100000 |
| ⚠️ | albuquerque | آلبوکرک، نیو میکسیکو | Albuquerque | Albuquerque | us | PPLA2 | 564559 | نيو مكسيكو | 35.0845 | -106.6511 | 530.41 | phoenix | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | milwaukee | ملواکی | Milwaukee | Milwaukee | us | PPLA2 | 563531 | ويسكونسن | 43.0389 | -87.9065 | 131.06 | chicago | mixed_script |  | 95 | pop_gte_100000 |
| ⚠️ | tucson | توسان | Tucson | Tucson | us | PPLA2 | 542629 | أريزونا | 32.2217 | -110.9265 | 173.49 | phoenix | arabic_only | wave→tucson-us | 95 | pop_gte_100000 |
| ⚠️ | fresno | فرزنو | Fresno | Fresno | us | PPLA2 | 542107 | كاليفورنيا | 36.7477 | -119.7724 | 260.60 | san-francisco | arabic_only | wave→fresno-us | 95 | pop_gte_100000 |
| ⚠️ | sacramento | ساكرامنتو | Sacramento | Sacramento | us | PPLA | 524943 | كاليفورنيا | 38.5816 | -121.4944 | 120.76 | san-francisco | arabic_only | wave→sacramento-us | 95 | always_include:PPLA |
| ⚠️ | atlanta | آتلانتا | Atlanta | Atlanta | us | PPLA | 510823 | جورجيا | 33.7490 | -84.3880 | 872.73 | washington-dc | arabic_only | wave→atlanta-us | 95 | always_include:PPLA |
| ⚠️ | raleigh | ralې | Raleigh | Raleigh | us | PPLA | 482295 | كارولاينا الشمالية | 35.7721 | -78.6386 | 376.25 | washington-dc | mixed_latin | wave→raleigh-us | 90 | always_include:PPLA |
| ⚠️ | long-beach | لانگ بیچ، کالیفرنیا | Long Beach | Long Beach | us | PPL | 474140 | كاليفورنيا | 33.7670 | -118.1892 | 32.11 | los-angeles | mixed_script | wave→long-beach-us | 90 | pop_gte_100000 |
| ⚠️ | mesa | ميسا | Mesa | Mesa | us | PPL | 471825 | أريزونا | 33.4223 | -111.8226 | 23.50 | phoenix | arabic_only | wave→mesa-us | 90 | pop_gte_100000 |
| ⚠️ | oakland | أوكلاند | Oakland | Oakland | us | PPLA2 | 419267 | كاليفورنيا | 37.8044 | -122.2708 | 13.46 | san-francisco | arabic_only | wave→oakland-us | 90 | pop_gte_100000 |
| ⚠️ | minneapolis | منیاپولس | Minneapolis | Minneapolis | us | PPLA2 | 410939 | مينيسوتا | 44.9800 | -93.2638 | 570.69 | chicago | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | arlington | آرلنگٹن | Arlington | Arlington | us | PPL | 388125 | تكساس | 32.7357 | -97.1081 | 29.44 | dallas | mixed_script | wave→arlington-us | 90 | pop_gte_100000 |
| ⚠️ | cleveland | كليفلاند | Cleveland | Cleveland | us | PPLA2 | 365379 | أوهايو | 41.4995 | -81.6954 | 489.38 | washington-dc | arabic_only | wave→cleveland-us | 90 | pop_gte_100000 |
| ⚠️ | new-orleans | اورلینز پارش | New Orleans | New Orleans | us | PPLA2 | 362701 | لويزيانا | 29.9547 | -90.0751 | 511.01 | houston | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | aurora | آرورا، کلرادو | Aurora | Aurora | us | PPL | 359407 | كولورادو | 39.7294 | -104.8319 | 951.08 | phoenix | mixed_script | wave→aurora-us | 90 | pop_gte_100000 |
| ⚠️ | lexington | ليكسينغتون | Lexington | Lexington | us | PPLA2 | 320347 | كنتاكي | 37.9887 | -84.4777 | 509.10 | chicago | arabic_only | wave→lexington-us | 90 | pop_gte_100000 |
| ⚠️ | riverside | رور سائڈ | Riverside | Riverside | us | PPLA2 | 317261 | كاليفورنيا | 33.9534 | -117.3962 | 78.90 | los-angeles | mixed_script | wave→riverside-us | 90 | pop_gte_100000 |
| ⚠️ | corpus-christi | كوربوس كريستي | Corpus Christi | Corpus Christi | us | PPLA2 | 316239 | تكساس | 27.8006 | -97.3964 | 294.09 | houston | arabic_only | wave→corpus-christi-us | 90 | pop_gte_100000 |
| ⚠️ | santa-ana | سانتا آنا، کالیفرنیا | Santa Ana | Santa Ana | us | PPLA2 | 310227 | كاليفورنيا | 33.7456 | -117.8678 | 48.64 | los-angeles | mixed_script | wave→santa-ana-us | 90 | pop_gte_100000 |
| ⚠️ | stockton | استوکتون | Stockton | Stockton | us | PPLA2 | 305658 | كاليفورنيا | 37.9577 | -121.2908 | 101.14 | san-francisco | mixed_script | wave→stockton-us | 90 | pop_gte_100000 |
| ⚠️ | saint-paul | سانت باول | Saint Paul | Saint Paul | us | PPLA | 303176 | مينيسوتا | 44.9444 | -93.0933 | 557.47 | chicago | arabic_only | wave→saint-paul-us | 90 | always_include:PPLA |
| ⚠️ | lincoln | لنكن | Lincoln | Lincoln | us | PPLA | 294757 | نبراسكا | 40.8000 | -96.6670 | 763.57 | chicago | arabic_only | wave→lincoln-us | 90 | always_include:PPLA |
| ⚠️ | meads | میدز | Meads | Meads | us | PPL | 288649 | كنتاكي | 38.4126 | -82.7091 | 495.48 | washington-dc | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | newark | نيوآرك | Newark | Newark | us | PPLA2 | 281944 | نيو جيرسي | 40.7357 | -74.1724 | 14.25 | new-york | arabic_only | wave→newark-us | 90 | pop_gte_100000 |
| ⚠️ | madison | ماديسون | Madison | Madison | us | PPLA | 280305 | ويسكونسن | 43.0731 | -89.4012 | 196.87 | chicago | arabic_only | wave→madison-us | 90 | always_include:PPLA |
| ⚠️ | st-louis | سانت لويس | St. Louis | St. Louis | us | PPLA2 | 279695 | ميزوري | 38.6273 | -90.1979 | 422.04 | chicago | arabic_only | wave→st-louis-us | 90 | pop_gte_100000 |
| ⚠️ | chula-vista | تشولا فيستا | Chula Vista | Chula Vista | us | PPL | 265757 | كاليفورنيا | 32.6401 | -117.0842 | 190.41 | los-angeles | arabic_only | wave→chula-vista-us | 90 | pop_gte_100000 |
| ⚠️ | toledo | توليدو | Toledo | Toledo | us | PPLA2 | 265638 | أوهايو | 41.6639 | -83.5552 | 338.71 | chicago | arabic_only | wave→toledo-us | 90 | pop_gte_100000 |
| ⚠️ | jersey-city | جرزی سیتی | Jersey City | Jersey City | us | PPLA2 | 264290 | نيو جيرسي | 40.7282 | -74.0776 | 6.27 | new-york | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | reno | رينو | Reno | Reno | us | PPLA2 | 264165 | نيفادا | 39.5296 | -119.8138 | 298.75 | san-francisco | arabic_only | wave→reno-us | 90 | pop_gte_100000 |
| ⚠️ | chandler | تشاندلر | Chandler | Chandler | us | PPL | 260828 | أريزونا | 33.3062 | -111.8413 | 26.78 | phoenix | arabic_only | wave→chandler-us | 90 | pop_gte_100000 |
| ⚠️ | buffalo | بفیلو، نیو یارک | Buffalo | Buffalo | us | PPLA2 | 258071 | نيويورك | 42.8865 | -78.8784 | 468.73 | washington-dc | mixed_script | wave→buffalo-us | 90 | pop_gte_100000 |
| ⚠️ | durham | دورهام | Durham | Durham | us | PPLA2 | 257636 | كارولاينا الشمالية | 35.9940 | -78.8986 | 363.21 | washington-dc | arabic_only | wave→durham-us | 90 | pop_gte_100000 |
| ⚠️ | irvine | إرفاين | Irvine | Irvine | us | PPL | 256927 | كاليفورنيا | 33.6695 | -117.8231 | 57.61 | los-angeles | arabic_only | wave→irvine-us | 90 | pop_gte_100000 |
| ⚠️ | laredo | لاريدو | Laredo | Laredo | us | PPLA2 | 256153 | تكساس | 27.5064 | -99.5075 | 475.22 | houston | arabic_only | wave→laredo-us | 90 | pop_gte_100000 |
| ⚠️ | lubbock | لاباک، تگزاس | Lubbock | Lubbock | us | PPLA2 | 249042 | تكساس | 33.5779 | -101.8552 | 479.06 | dallas | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | gilbert | گلبرٹ، ایریزونا | Gilbert | Gilbert | us | PPL | 247542 | أريزونا | 33.3528 | -111.7890 | 28.51 | phoenix | mixed_script | wave→gilbert-us | 90 | pop_gte_100000 |
| ⚠️ | tri-cities | ٹرائی-سیٹیز، واشنگٹن | Tri-Cities | Tri-Cities | us | PPLS | 244036 | واشنطن | 46.2454 | -119.1962 | 282.11 | seattle | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | winston-salem | وينستون-سالم، كارولاينا الشمالية | Winston-Salem | Winston-Salem | us | PPLA2 | 241218 | كارولاينا الشمالية | 36.0999 | -80.2442 | 421.24 | washington-dc | mixed_unknown |  | 90 | pop_gte_100000 |
| ⚠️ | glendale | غلانديل | Glendale | Glendale | us | PPL | 240126 | أريزونا | 33.5386 | -112.1860 | 14.44 | phoenix | arabic_only | wave→glendale-us | 90 | pop_gte_100000 |
| ⚠️ | norfolk | نارفوک، ورجینیا | Norfolk | Norfolk | us | PPLA2 | 238005 | فرجينيا | 36.8468 | -76.2852 | 238.41 | washington-dc | mixed_script | wave→norfolk-us | 90 | pop_gte_100000 |
| ⚠️ | garland | جارلاند | Garland | Garland | us | PPL | 236897 | تكساس | 32.9126 | -96.6389 | 21.13 | dallas | arabic_only | wave→garland-us | 90 | pop_gte_100000 |
| ⚠️ | boise | بوئسے | Boise | Boise | us | PPLA | 235684 | أيداهو | 43.6135 | -116.2035 | 651.06 | seattle | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | north-las-vegas | لاس وگاس شمالی، نوادا | North Las Vegas | North Las Vegas | us | PPL | 234807 | نيفادا | 36.1989 | -115.1175 | 371.19 | los-angeles | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | fremont | فرمونت، کالیفورنیا | Fremont | Fremont | us | PPL | 232206 | كاليفورنيا | 37.5483 | -121.9886 | 45.53 | san-francisco | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | spokane | اسپوکن | Spokane | Spokane | us | PPLA2 | 229447 | واشنطن | 47.6597 | -117.4291 | 367.38 | seattle | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | baton-rouge | byټn rwj | Baton Rouge | Baton Rouge | us | PPLA | 227470 | لويزيانا | 30.4433 | -91.1875 | 409.41 | houston | mixed_latin |  | 90 | always_include:PPLA |
| ⚠️ | richmond | rchmnڈ | Richmond | Richmond | us | PPLA | 226610 | فرجينيا | 37.5538 | -77.4603 | 154.97 | washington-dc | mixed_script | wave→richmond-us | 90 | always_include:PPLA |
| ⚠️ | paradise | بارادايس | Paradise | Paradise | us | PPL | 223167 | نيفادا | 36.0972 | -115.1467 | 362.10 | los-angeles | arabic_only | wave→paradise-us | 90 | pop_gte_100000 |
| ⚠️ | san-bernardino | سان بيرناردينو، كاليفورنيا | San Bernardino | San Bernardino | us | PPLA2 | 216108 | كاليفورنيا | 34.1083 | -117.2898 | 88.08 | los-angeles | mixed_unknown | wave→san-bernardino-us | 90 | pop_gte_100000 |
| ⚠️ | des-moines | دموین، آیووا | Des Moines | Des Moines | us | PPLA | 214133 | آيوا | 41.6005 | -93.6091 | 496.97 | chicago | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | modesto | مودستو، کالیفرنیا | Modesto | Modesto | us | PPLA2 | 211266 | كاليفورنيا | 37.6391 | -120.9969 | 126.05 | san-francisco | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | oxnard | أوكسنارد | Oxnard | Oxnard | us | PPL | 207254 | كاليفورنيا | 34.1975 | -119.1770 | 87.42 | los-angeles | arabic_only | wave→oxnard-us | 90 | pop_gte_100000 |
| ⚠️ | worcester | ورسستر | Worcester | Worcester | us | PPLA2 | 206518 | ماساتشوستس | 42.2626 | -71.8023 | 62.08 | boston | arabic_only | wave→worcester-us | 90 | pop_gte_100000 |
| ⚠️ | fayetteville | فائیٹویل، شمالی کیرولائنا | Fayetteville | Fayetteville | us | PPLA2 | 201963 | كارولاينا الشمالية | 35.0527 | -78.8784 | 458.73 | washington-dc | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | huntington-beach | هانتینگتون بیچ، کالیفرنیا | Huntington Beach | Huntington Beach | us | PPL | 201899 | كاليفورنيا | 33.6603 | -117.9992 | 49.08 | los-angeles | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | glendale | غلينديل | Glendale | Glendale | us | PPL | 201020 | كاليفورنيا | 34.1425 | -118.2551 | 10.10 | los-angeles | arabic_only | wave→glendale-us | 90 | pop_gte_100000 |
| ⚠️ | amarillo | آماریلو، تگزاس | Amarillo | Amarillo | us | PPLA2 | 198645 | تكساس | 35.2220 | -101.8313 | 537.76 | dallas | mixed_script | wave→amarillo-us | 90 | pop_gte_100000 |
| ⚠️ | vancouver | فانكوفر | Vancouver | Vancouver | us | PPLA2 | 196442 | واشنطن | 45.6387 | -122.6615 | 220.21 | seattle | arabic_only | curated:ca | 90 | pop_gte_100000 |
| ⚠️ | birmingham | برمنغهام | Birmingham | Birmingham | us | PPLA2 | 196357 | ألاباما | 33.5207 | -86.8025 | 912.01 | houston | arabic_only | wave→birmingham-us | 90 | pop_gte_100000 |
| ⚠️ | montgomery | mwntګmry | Montgomery | Montgomery | us | PPLA | 195287 | ألاباما | 32.3668 | -86.3000 | 910.84 | houston | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | grand-rapids | گرندرپیدز، میشیگان | Grand Rapids | Grand Rapids | us | PPLA2 | 195097 | ميشيغان | 42.9634 | -85.6681 | 201.22 | chicago | mixed_script | wave→grand-rapids-us | 90 | pop_gte_100000 |
| ⚠️ | peoria | بيوريا | Peoria | Peoria | us | PPL | 190985 | أريزونا | 33.5806 | -112.2374 | 21.11 | phoenix | arabic_only | wave→peoria-us | 90 | pop_gte_100000 |
| ⚠️ | providence | prwwyڈns  rwڈ aylynڈ | Providence | Providence | us | PPLA | 190934 | رود آيلاند | 41.8240 | -71.4128 | 66.38 | boston | mixed_script |  | 90 | always_include:PPLA |
| ⚠️ | knoxville | ناکسویل، تنسی | Knoxville | Knoxville | us | PPLA2 | 190740 | تينيسي | 35.9606 | -83.9207 | 690.21 | washington-dc | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | sunrise-manor | سانرایز منور، نوادا | Sunrise Manor | Sunrise Manor | us | PPL | 189372 | نيفادا | 36.2111 | -115.0731 | 375.14 | los-angeles | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | brownsville | براؤنزول | Brownsville | Brownsville | us | PPLA2 | 186738 | تكساس | 25.9017 | -97.4975 | 477.32 | houston | arabic_only | wave→brownsville-us | 90 | pop_gte_100000 |
| ⚠️ | mobile | موبائل، الاباما | Mobile | Mobile | us | PPLA2 | 183289 | ألاباما | 30.6944 | -88.0430 | 711.41 | houston | mixed_unknown | wave→mobile-us | 90 | pop_gte_100000 |
| ⚠️ | fort-lauderdale | فورت لادردیل، فلوریدا | Fort Lauderdale | Fort Lauderdale | us | PPLA2 | 183146 | فلوريدا | 26.1223 | -80.1434 | 40.39 | miami | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | santa-clarita | سانتا كلاريتا | Santa Clarita | Santa Clarita | us | PPL | 182371 | كاليفورنيا | 34.3917 | -118.5426 | 46.69 | los-angeles | arabic_only | wave→santa-clarita-us | 90 | pop_gte_100000 |
| ⚠️ | santa-rosa | سانتا روزا، کالیفرنیا | Santa Rosa | Santa Rosa | us | PPLA2 | 178127 | كاليفورنيا | 38.4405 | -122.7144 | 78.38 | san-francisco | mixed_script | wave→santa-rosa-us | 90 | pop_gte_100000 |
| ⚠️ | salem | سالم | Salem | Salem | us | PPLA | 175535 | أوريغون | 44.9429 | -123.0351 | 301.03 | seattle | arabic_only | wave→salem-us | 90 | always_include:PPLA |
| ⚠️ | springfield | اسپرینگفیلد، میزوری | Springfield | Springfield | us | PPLA2 | 170188 | ميزوري | 37.2153 | -93.2982 | 587.39 | dallas | mixed_script | wave→springfield-us | 90 | pop_gte_100000 |
| ⚠️ | clarksville | كلاركسفيل | Clarksville | Clarksville | us | PPLA2 | 166722 | تينيسي | 36.5298 | -87.3594 | 595.16 | chicago | arabic_only | wave→clarksville-us | 90 | pop_gte_100000 |
| ⚠️ | murfreesboro | مورفریزبورو، تنسی | Murfreesboro | Murfreesboro | us | PPLA2 | 165430 | تينيسي | 35.8456 | -86.3903 | 679.29 | chicago | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | corona | كورونا | Corona | Corona | us | PPL | 164226 | كاليفورنيا | 33.8753 | -117.5664 | 65.48 | los-angeles | arabic_only | wave→corona-us | 90 | pop_gte_100000 |
| ⚠️ | lancaster | لانكستر | Lancaster | Lancaster | us | PPL | 161103 | كاليفورنيا | 34.6980 | -118.1367 | 72.48 | los-angeles | arabic_only | wave→lancaster-us | 90 | pop_gte_100000 |
| ⚠️ | alexandria | الإسكندرية | Alexandria | Alexandria | us | PPLA2 | 159467 | فرجينيا | 38.8048 | -77.0469 | 11.41 | washington-dc | arabic_only | wave→alexandria-us | 90 | pop_gte_100000 |
| ⚠️ | salinas | ساليناس | Salinas | Salinas | us | PPLA2 | 157380 | كاليفورنيا | 36.6777 | -121.6555 | 139.49 | san-francisco | arabic_only | wave→salinas-us | 90 | pop_gte_100000 |
| ⚠️ | springfield | اسپرینگفیلد، ماساچوست | Springfield | Springfield | us | PPL | 154341 | ماساتشوستس | 42.1015 | -72.5898 | 129.28 | boston | mixed_script | wave→springfield-us | 90 | pop_gte_100000 |
| ⚠️ | pasadena | باسادينا | Pasadena | Pasadena | us | PPL | 153784 | تكساس | 29.6911 | -95.2091 | 17.33 | houston | arabic_only | wave→pasadena-us | 90 | pop_gte_100000 |
| ⚠️ | jackson | جاكسون | Jackson | Jackson | us | PPLA | 153701 | مسيسيبي | 32.2988 | -90.1848 | 568.87 | houston | arabic_only | wave→jackson-us | 90 | always_include:PPLA |
| ⚠️ | pomona | بومونا | Pomona | Pomona | us | PPL | 153266 | كاليفورنيا | 34.0553 | -117.7523 | 45.27 | los-angeles | arabic_only | wave→pomona-us | 90 | pop_gte_100000 |
| ⚠️ | lakewood | ليكوود | Lakewood | Lakewood | us | PPL | 152597 | كولورادو | 39.7047 | -105.0814 | 934.16 | phoenix | arabic_only | wave→lakewood-us | 90 | pop_gte_100000 |
| ⚠️ | escondido | إسكونديدو | Escondido | Escondido | us | PPL | 151038 | كاليفورنيا | 33.1192 | -117.0864 | 149.18 | los-angeles | arabic_only | wave→escondido-us | 90 | pop_gte_100000 |
| ⚠️ | hollywood | هالیوود، فلوریدا | Hollywood | Hollywood | us | PPL | 149728 | فلوريدا | 26.0112 | -80.1495 | 28.06 | miami | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | rockford | راک فورڈ، الینوائے | Rockford | Rockford | us | PPLA2 | 148278 | إلينوي | 42.2711 | -89.0940 | 128.51 | chicago | mixed_script | wave→rockford-us | 90 | pop_gte_100000 |
| ⚠️ | paterson | باترسون | Paterson | Paterson | us | PPLA2 | 147754 | نيو جيرسي | 40.9168 | -74.1718 | 26.63 | new-york | arabic_only | wave→paterson-us | 90 | pop_gte_100000 |
| ⚠️ | bridgeport | برج پورٹ، کنیکٹیکٹ | Bridgeport | Bridgeport | us | PPL | 147629 | كونيتيكت | 41.1792 | -73.1894 | 85.98 | new-york | mixed_script | wave→bridgeport-us | 90 | pop_gte_100000 |
| ⚠️ | mesquite | مسکیت، تگزاس | Mesquite | Mesquite | us | PPL | 144788 | تكساس | 32.7668 | -96.5992 | 18.53 | dallas | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | syracuse | سائراکیوز | Syracuse | Syracuse | us | PPLA2 | 144142 | نيويورك | 43.0481 | -76.1474 | 314.40 | new-york | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | torrance | تورانس، کالیفرنیا | Torrance | Torrance | us | PPL | 143592 | كاليفورنيا | 33.8359 | -118.3406 | 25.66 | los-angeles | mixed_script | wave→torrance-us | 90 | pop_gte_100000 |
| ⚠️ | surprise | سوربرايز | Surprise | Surprise | us | PPL | 143148 | أريزونا | 33.6306 | -112.3332 | 31.43 | phoenix | arabic_only | wave→surprise-us | 90 | pop_gte_100000 |
| ⚠️ | pasadena | باسادينا | Pasadena | Pasadena | us | PPL | 142250 | كاليفورنيا | 34.1478 | -118.1445 | 14.01 | los-angeles | arabic_only | wave→pasadena-us | 90 | pop_gte_100000 |
| ⚠️ | fullerton | فلرٹن | Fullerton | Fullerton | us | PPL | 140847 | كاليفورنيا | 33.8703 | -117.9253 | 35.65 | los-angeles | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | bellevue | بالفيو | Bellevue | Bellevue | us | PPL | 139820 | واشنطن | 47.6104 | -122.2007 | 9.86 | seattle | arabic_only | wave→bellevue-us | 90 | pop_gte_100000 |
| ⚠️ | metairie | مِتِری، لوئیزیانا | Metairie | Metairie | us | PPL | 138481 | لويزيانا | 29.9841 | -90.1529 | 503.60 | houston | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | hampton | هامبتون | Hampton | Hampton | us | PPLA2 | 137148 | فرجينيا | 37.0299 | -76.3452 | 217.38 | washington-dc | arabic_only | wave→hampton-us | 90 | pop_gte_100000 |
| ⚠️ | miramar | ميرامار | Miramar | Miramar | us | PPL | 137132 | فلوريدا | 25.9873 | -80.2323 | 25.41 | miami | arabic_only | wave→miramar-us | 90 | pop_gte_100000 |
| ⚠️ | dayton | دايتون، أوهايو | Dayton | Dayton | us | PPLA2 | 135512 | أوهايو | 39.7589 | -84.1916 | 373.09 | chicago | mixed_unknown | wave→dayton-us | 90 | pop_gte_100000 |
| ⚠️ | warren | وارن، مشی گن | Warren | Warren | us | PPL | 134056 | ميشيغان | 42.4904 | -83.0130 | 386.39 | chicago | mixed_script | wave→warren-us | 90 | pop_gte_100000 |
| ⚠️ | thornton | تھورن ٹن، کولوراڈو | Thornton | Thornton | us | PPL | 133451 | كولورادو | 39.8680 | -104.9719 | 953.73 | phoenix | mixed_script | wave→thornton-us | 90 | pop_gte_100000 |
| ⚠️ | charleston | تشارلستون | Charleston | Charleston | us | PPLA2 | 132609 | كارولاينا الجنوبية | 32.7763 | -79.9327 | 729.87 | washington-dc | arabic_only | wave→charleston-us | 90 | pop_gte_100000 |
| ⚠️ | midland | مدلاند | Midland | Midland | us | PPLA2 | 132524 | تكساس | 31.9974 | -102.0779 | 503.33 | dallas | arabic_only | wave→midland-us | 90 | pop_gte_100000 |
| ⚠️ | waco | واكو | Waco | Waco | us | PPLA2 | 132356 | تكساس | 31.5493 | -97.1467 | 140.39 | dallas | arabic_only | wave→waco-us | 90 | pop_gte_100000 |
| ⚠️ | sterling-heights | استرلینق هایتس، میشیقان | Sterling Heights | Sterling Heights | us | PPL | 132052 | ميشيغان | 42.5803 | -83.0302 | 386.62 | chicago | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | denton | دنتون، تگزاس | Denton | Denton | us | PPLA2 | 131044 | تكساس | 33.2148 | -97.1331 | 57.93 | dallas | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | cedar-rapids | سدار راپیدز، آیووا | Cedar Rapids | Cedar Rapids | us | PPLA2 | 130405 | آيوا | 42.0083 | -91.6441 | 332.30 | chicago | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | new-haven | نيو هيفن | New Haven | New Haven | us | PPL | 130322 | كونيتيكت | 41.3081 | -72.9282 | 112.08 | new-york | arabic_only | wave→new-haven-us | 90 | pop_gte_100000 |
| ⚠️ | roseville | رزویل، کالیفرنیا | Roseville | Roseville | us | PPL | 130269 | كاليفورنيا | 38.7521 | -121.2880 | 146.85 | san-francisco | mixed_script | wave→roseville-us | 90 | pop_gte_100000 |
| ⚠️ | thousand-oaks | تاوزند اوکس | Thousand Oaks | Thousand Oaks | us | PPL | 129339 | كاليفورنيا | 34.1706 | -118.8376 | 56.24 | los-angeles | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | elizabeth | إليزابيث | Elizabeth | Elizabeth | us | PPLA2 | 129007 | نيو جيرسي | 40.6640 | -74.2107 | 18.09 | new-york | arabic_only | wave→elizabeth-us | 90 | pop_gte_100000 |
| ⚠️ | stamford | استمفورد، کنتیکت | Stamford | Stamford | us | PPL | 128874 | كونيتيكت | 41.0534 | -73.5387 | 54.57 | new-york | mixed_script | wave→stamford-us | 90 | pop_gte_100000 |
| ⚠️ | concord | كونكورد | Concord | Concord | us | PPL | 128667 | كاليفورنيا | 37.9780 | -122.0311 | 40.88 | san-francisco | arabic_only | wave→concord-us | 90 | pop_gte_100000 |
| ⚠️ | norman | نورمن، اکلاهما | Norman | Norman | us | PPLA2 | 128026 | أوكلاهوما | 35.2226 | -97.4395 | 278.34 | dallas | mixed_script | wave→norman-us | 90 | pop_gte_100000 |
| ⚠️ | athens | آتئنز، جورجیا | Athens | Athens | us | PPLA2 | 127315 | جورجيا | 33.9609 | -83.3779 | 789.72 | washington-dc | mixed_script | wave→athens-us | 90 | pop_gte_100000 |
| ⚠️ | kent | كينت | Kent | Kent | us | PPL | 126952 | واشنطن | 47.3809 | -122.2348 | 26.09 | seattle | arabic_only | wave→kent-us | 90 | pop_gte_100000 |
| ⚠️ | santa-clara | سانتا كلارا | Santa Clara | Santa Clara | us | PPL | 126215 | كاليفورنيا | 37.3541 | -121.9552 | 62.15 | san-francisco | arabic_only | wave→santa-clara-us | 90 | pop_gte_100000 |
| ⚠️ | topeka | توبيكا، كانساس | Topeka | Topeka | us | PPLA | 125963 | كانساس | 39.0483 | -95.6780 | 704.60 | dallas | mixed_unknown |  | 90 | always_include:PPLA |
| ⚠️ | abilene | أبيلين | Abilene | Abilene | us | PPLA2 | 125182 | تكساس | 32.4487 | -99.7331 | 277.41 | dallas | arabic_only | wave→abilene-us | 90 | pop_gte_100000 |
| ⚠️ | amherst | امهرست، نیویورک | Amherst | Amherst | us | PPL | 122366 | نيويورك | 42.9784 | -78.7998 | 470.14 | new-york | mixed_script | wave→amherst-us | 90 | pop_gte_100000 |
| ⚠️ | vallejo | فاليجو | Vallejo | Vallejo | us | PPL | 121692 | كاليفورنيا | 38.1041 | -122.2566 | 39.29 | san-francisco | arabic_only | wave→vallejo-us | 90 | pop_gte_100000 |
| ⚠️ | hartford | harټ fwrډ | Hartford | Hartford | us | PPLA | 121054 | كونيتيكت | 41.7637 | -72.6851 | 149.73 | boston | mixed_latin | wave→hartford-us | 90 | always_include:PPLA |
| ⚠️ | berkeley | برکلئی، کالیفورنیا | Berkeley | Berkeley | us | PPL | 120972 | كاليفورنيا | 37.8716 | -122.2728 | 16.78 | san-francisco | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | west-palm-beach | وست پالم بیچ، فلوریدا | West Palm Beach | West Palm Beach | us | PPLA2 | 120932 | فلوريدا | 26.7153 | -80.0534 | 106.94 | miami | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | allentown | آلن‌تاون، پنسیلوانیا | Allentown | Allentown | us | PPLA2 | 120207 | بنسلفانيا | 40.6084 | -75.4902 | 125.73 | new-york | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | evansville | إيفانسفيل | Evansville | Evansville | us | PPLA2 | 119943 | إنديانا | 37.9748 | -87.5559 | 434.08 | chicago | arabic_only | wave→evansville-us | 90 | pop_gte_100000 |
| ⚠️ | clearwater | كليرواتر | Clearwater | Clearwater | us | PPLA2 | 117292 | فلوريدا | 27.9658 | -82.8001 | 356.36 | miami | arabic_only | wave→clearwater-us | 90 | pop_gte_100000 |
| ⚠️ | el-monte | إل مونتي | El Monte | El Monte | us | PPL | 116732 | كاليفورنيا | 34.0686 | -118.0276 | 19.99 | los-angeles | arabic_only | wave→el-monte-us | 90 | pop_gte_100000 |
| ⚠️ | westminster | وزتمینزتر، کولورادو | Westminster | Westminster | us | PPL | 116317 | كولورادو | 39.8366 | -105.0372 | 947.36 | phoenix | mixed_script | wave→westminster-us | 90 | pop_gte_100000 |
| ⚠️ | round-rock | راؤنڈ راک، ٹیکساس | Round Rock | Round Rock | us | PPL | 115997 | تكساس | 30.5083 | -97.6789 | 237.11 | houston | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | beaumont | بومانت، تگزاس | Beaumont | Beaumont | us | PPLA2 | 115282 | تكساس | 30.0861 | -94.1018 | 127.45 | houston | mixed_script | wave→beaumont-us | 90 | pop_gte_100000 |
| ⚠️ | peoria | بيوريا | Peoria | Peoria | us | PPLA2 | 115070 | إلينوي | 40.6936 | -89.5890 | 210.09 | chicago | arabic_only | wave→peoria-us | 90 | pop_gte_100000 |
| ⚠️ | odessa | أوديسا | Odessa | Odessa | us | PPLA2 | 114428 | تكساس | 31.8457 | -102.3676 | 533.58 | dallas | arabic_only | wave→odessa-us | 90 | pop_gte_100000 |
| ⚠️ | springfield | sprnګ fylډ | Springfield | Springfield | us | PPLA | 114394 | إلينوي | 39.8017 | -89.6437 | 286.35 | chicago | mixed_script | wave→springfield-us | 90 | always_include:PPLA |
| ⚠️ | fairfield | فئرفیلڈ | Fairfield | Fairfield | us | PPLA2 | 112970 | كاليفورنيا | 38.2494 | -122.0400 | 62.36 | san-francisco | mixed_script | wave→fairfield-us | 90 | pop_gte_100000 |
| ⚠️ | lansing | lnsnګ | Lansing | Lansing | us | PPLA | 112644 | ميشيغان | 42.7325 | -84.5555 | 270.06 | chicago | mixed_script | wave→lansing-us | 90 | always_include:PPLA |
| ⚠️ | rochester | راچستر، مینه‌سوتا | Rochester | Rochester | us | PPLA2 | 112225 | مينيسوتا | 44.0216 | -92.4699 | 460.31 | chicago | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | elgin | إلجين | Elgin | Elgin | us | PPL | 112111 | إلينوي | 42.0373 | -88.2812 | 56.70 | chicago | arabic_only | wave→elgin-us | 90 | pop_gte_100000 |
| ⚠️ | west-jordan | وست جردن، یوتا | West Jordan | West Jordan | us | PPL | 111946 | يوتاه | 40.6097 | -111.9391 | 796.39 | phoenix | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | inglewood | إنغليووود | Inglewood | Inglewood | us | PPL | 111666 | كاليفورنيا | 33.9617 | -118.3531 | 14.25 | los-angeles | arabic_only | wave→inglewood-us | 90 | pop_gte_100000 |
| ⚠️ | tuscaloosa | تاسکالوسا، آلاباما | Tuscaloosa | Tuscaloosa | us | PPLA2 | 111338 | ألاباما | 33.2098 | -87.5692 | 832.87 | houston | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | richardson | ريتشاردسون | Richardson | Richardson | us | PPL | 110815 | تكساس | 32.9482 | -96.7297 | 20.08 | dallas | arabic_only | wave→richardson-us | 90 | pop_gte_100000 |
| ⚠️ | lowell | لوول، ماساچوست | Lowell | Lowell | us | PPL | 110699 | ماساتشوستس | 42.6334 | -71.3162 | 36.99 | boston | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | antioch | آنتیوچ، کالیفرنیا | Antioch | Antioch | us | PPL | 110542 | كاليفورنيا | 38.0049 | -121.8058 | 59.61 | san-francisco | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | cambridge | كامبريدج | Cambridge | Cambridge | us | PPL | 110402 | ماساتشوستس | 42.3751 | -71.1056 | 4.18 | boston | arabic_only | wave→cambridge-us | 90 | pop_gte_100000 |
| ⚠️ | high-point | هاي بوينت | High Point | High Point | us | PPL | 110268 | كارولاينا الشمالية | 35.9557 | -80.0053 | 419.95 | washington-dc | arabic_only | wave→high-point-us | 90 | pop_gte_100000 |
| ⚠️ | manchester | مانتشستر | Manchester | Manchester | us | PPL | 110229 | نيو هامبشير | 42.9956 | -71.4548 | 77.73 | boston | arabic_only | wave→manchester-us | 90 | pop_gte_100000 |
| ⚠️ | murrieta | مورريتا، ريفيرسيدي، كاليفورنيا | Murrieta | Murrieta | us | PPL | 109830 | كاليفورنيا | 33.5539 | -117.2139 | 110.11 | los-angeles | mixed_unknown | wave→murrieta-us | 90 | pop_gte_100000 |
| ⚠️ | centennial | سنتنیال، کلرادو | Centennial | Centennial | us | PPL | 109741 | كولورادو | 39.5792 | -104.8769 | 936.58 | phoenix | mixed_script | wave→centennial-us | 90 | pop_gte_100000 |
| ⚠️ | richmond | ريتشموند | Richmond | Richmond | us | PPL | 109708 | كاليفورنيا | 37.9358 | -122.3478 | 18.96 | san-francisco | arabic_only | wave→richmond-us | 90 | pop_gte_100000 |
| ⚠️ | waterbury | واتربری، کنتیکت | Waterbury | Waterbury | us | PPL | 108802 | كونيتيكت | 41.5581 | -73.0515 | 123.39 | new-york | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | west-covina | وست کووینا، کالیفرنیا | West Covina | West Covina | us | PPL | 108484 | كاليفورنيا | 34.0686 | -117.9390 | 28.13 | los-angeles | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | enterprise | إنتربرايز | Enterprise | Enterprise | us | PPL | 108481 | نيفادا | 36.0252 | -115.2419 | 350.42 | los-angeles | arabic_only | wave→enterprise-us | 90 | pop_gte_100000 |
| ⚠️ | north-charleston | شمالی چارلسٹن، جنوبی کیرولائنا | North Charleston | North Charleston | us | PPL | 108304 | كارولاينا الجنوبية | 32.8546 | -79.9748 | 723.08 | washington-dc | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | everett | إيفريت | Everett | Everett | us | PPLA2 | 108010 | واشنطن | 47.9790 | -122.2021 | 42.57 | seattle | arabic_only | wave→everett-us | 90 | pop_gte_100000 |
| ⚠️ | green-bay | غرين باي | Green Bay | Green Bay | us | PPLA2 | 105207 | ويسكونسن | 44.5192 | -88.0198 | 295.37 | chicago | arabic_only | wave→green-bay-us | 90 | pop_gte_100000 |
| ⚠️ | lakeland | ليكلاند | Lakeland | Lakeland | us | PPL | 104401 | فلوريدا | 28.0395 | -81.9498 | 307.46 | miami | arabic_only | wave→lakeland-us | 90 | pop_gte_100000 |
| ⚠️ | lewisville | لوئیس‌ویل، تگزاس | Lewisville | Lewisville | us | PPL | 104039 | تكساس | 33.0462 | -96.9942 | 35.17 | dallas | mixed_script | wave→lewisville-us | 90 | pop_gte_100000 |
| ⚠️ | el-cajon | ال کاجون | El Cajon | El Cajon | us | PPL | 103679 | كاليفورنيا | 32.7948 | -116.9625 | 183.54 | los-angeles | mixed_script | wave→el-cajon-us | 90 | pop_gte_100000 |
| ⚠️ | san-mateo | سان ماتيو | San Mateo | San Mateo | us | PPL | 103536 | كاليفورنيا | 37.5630 | -122.3255 | 24.97 | san-francisco | arabic_only | wave→san-mateo-us | 90 | pop_gte_100000 |
| ⚠️ | brandon | براندون | Brandon | Brandon | us | PPL | 103483 | فلوريدا | 27.9378 | -82.2859 | 318.91 | miami | arabic_only | wave→brandon-us | 90 | pop_gte_100000 |
| ⚠️ | davenport | دافنبورت | Davenport | Davenport | us | PPLA2 | 102582 | آيوا | 41.5236 | -90.5776 | 247.87 | chicago | arabic_only | wave→davenport-us | 90 | pop_gte_100000 |
| ⚠️ | edison | ادیسون، نیوجرسی | Edison | Edison | us | PPL | 102548 | نيو جيرسي | 40.5187 | -74.4121 | 40.51 | new-york | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | hillsboro | هيلسبورو | Hillsboro | Hillsboro | us | PPLA2 | 102347 | أوريغون | 45.5229 | -122.9898 | 237.05 | seattle | arabic_only | wave→hillsboro-us | 90 | pop_gte_100000 |
| ⚠️ | las-cruces | لاس كروسيس | Las Cruces | Las Cruces | us | PPLA2 | 101643 | نيو مكسيكو | 32.3123 | -106.7783 | 510.33 | phoenix | arabic_only | wave→las-cruces-us | 90 | pop_gte_100000 |
| ⚠️ | albany | آلبانی، نیویورک | Albany | Albany | us | PPLA | 101228 | نيويورك | 42.6526 | -73.7562 | 216.69 | new-york | mixed_script | wave→albany-us | 90 | always_include:PPLA |
| ⚠️ | new-bedford | بدفورد جدید، ماساچوست | New Bedford | New Bedford | us | PPL | 101079 | ماساتشوستس | 41.6353 | -70.9270 | 81.33 | boston | mixed_script |  | 90 | pop_gte_100000 |
| ⚠️ | renton | رنتون، واشینگتن | Renton | Renton | us | PPL | 100242 | واشنطن | 47.4829 | -122.2171 | 16.20 | seattle | mixed_script | wave→renton-us | 90 | pop_gte_100000 |
| ⚠️ | trenton | ترنتون | Trenton | Trenton | us | PPLA | 89620 | نيو جيرسي | 40.2171 | -74.7429 | 83.22 | new-york | arabic_only | wave→trenton-us | 85 | always_include:PPLA |
| ⚠️ | santa-fe | santa fې | Santa Fe | Santa Fe | us | PPLA | 87505 | نيو مكسيكو | 35.6870 | -105.9378 | 614.37 | phoenix | mixed_latin | wave→santa-fe-us | 85 | always_include:PPLA |
| ⚠️ | bismarck | انٹیل | Bismarck | Bismarck | us | PPLA | 75092 | داكوتا الشمالية | 46.8083 | -100.7837 | 1178.89 | chicago | mixed_script | wave→bismarck-us | 85 | always_include:PPLA |
| ⚠️ | cheyenne | شايان | Cheyenne | Cheyenne | us | PPLA | 65132 | وايومنغ | 41.1400 | -104.8203 | 1068.32 | phoenix | arabic_only | wave→cheyenne-us | 85 | always_include:PPLA |
| ⚠️ | harrisburg | هاريسبرج | Harrisburg | Harrisburg | us | PPLA | 50183 | بنسلفانيا | 40.2737 | -76.8844 | 152.51 | washington-dc | arabic_only | wave→harrisburg-us | 85 | always_include:PPLA |
| ⚠️ | charleston | تشارلستون | Charleston | Charleston | us | PPLA | 46838 | فرجينيا الغربية | 38.3498 | -81.6326 | 403.95 | washington-dc | arabic_only | wave→charleston-us | 80 | always_include:PPLA |
| ⚠️ | concord | كونكورد | Concord | Concord | us | PPLA | 43976 | نيو هامبشير | 43.2081 | -71.5376 | 102.07 | boston | arabic_only | wave→concord-us | 80 | always_include:PPLA |
| ⚠️ | annapolis | آناپولیس | Annapolis | Annapolis | us | PPLA | 40812 | ميريلاند | 38.9786 | -76.4918 | 47.80 | washington-dc | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | dover | دوفر | Dover | Dover | us | PPLA | 39403 | ديلاوير | 39.1582 | -75.5244 | 133.59 | washington-dc | arabic_only | wave→dover-us | 80 | always_include:PPLA |
| ⚠️ | helena | هلنا، مونتانا | Helena | Helena | us | PPLA | 32091 | مونتانا | 46.5927 | -112.0361 | 786.84 | seattle | mixed_unknown |  | 80 | always_include:PPLA |
| ⚠️ | juneau | اوکلاہوما سٹی | Juneau | Juneau | us | PPLA | 31555 | ألاسكا | 58.3019 | -134.4197 | 1434.11 | seattle | mixed_script |  | 80 | always_include:PPLA |
| ⚠️ | augusta | agwsټa | Augusta | Augusta | us | PPLA | 18899 | مين | 44.3106 | -69.7795 | 240.30 | boston | mixed_latin |  | 80 | always_include:PPLA |
| ⚠️ | pierre | pyېr | Pierre | Pierre | us | PPLA | 14091 | داكوتا الجنوبية | 44.3683 | -100.3510 | 1067.69 | chicago | mixed_latin |  | 80 | always_include:PPLA |

## Collision-watch list for US

Cities the user pre-flagged: `birmingham`, `manchester`, `cambridge`, `dublin`, `athens`, `saint-petersburg`, `toledo`, `rochester`, `salem`, `victoria`, `cordoba`, `merida`, `leon`, `granada`, `santiago`, `washington`, `new-york`, `los-angeles`, `chicago`, `montreal`, `toronto`, `vancouver`, `mexico-city`, `guadalajara`, `monterrey`, `newcastle`, `peterborough`, `york`.

| candidate.slug | status | tier | matched-watch | pop | nearestKm | nearest | collision | suggestedRename |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| los-angeles | existing |  | los-angeles | - |  |  |  |  |
| new-york | existing |  | new-york | - |  |  |  |  |
| birmingham | pending | high | birmingham | 196357 | 912.01 | houston | wave | birmingham-us |
| salem | pending | low | salem | - | 903.89 | miami | wave | salem-us |
| salem | pending | low | salem | 1634 | 605.78 | dallas | wave | salem-us |
| salem | pending | low | salem | 2607 | 442.86 | dallas | wave | salem-us |
| washington | pending | low | washington | 176 | 310.01 | dallas | wave | washington-us |
| washington | existing |  | washington | 689545 |  |  | wave | washington-us |
| washington-highlands | pending | low | washington | - | 9.12 | washington-dc |  |  |
| new-york | existing |  | new-york | - |  |  |  |  |
| washington-park | pending | low | washington | 1672 | 41.26 | miami | wave | washington-park-us |
| athens | pending | high | athens | 127315 | 789.72 | washington-dc | wave | athens-us |
| dublin | pending | low | dublin | 16197 | 798.35 | miami | wave | dublin-us |
| manchester | pending | low | manchester | 4095 | 898.23 | miami | wave | manchester-us |
| washington | pending | low | washington | 3981 | 768.76 | washington-dc | wave | washington-us |
| athens | pending | low | athens | 1938 | 276.40 | chicago | wave | athens-us |
| salem | pending | low | salem | 7287 | 378.35 | chicago | wave | salem-us |
| york | pending | low | york | - | 300.97 | chicago | wave | york-us |
| salem | pending | low | salem | 6217 | 386.31 | chicago | wave | salem-us |
| cambridge | pending | low | cambridge | 82 | 504.91 | dallas | wave | cambridge-us |
| leon | pending | low | leon | 701 | 546.37 | dallas | wave | leon-us |
| manchester | pending | low | manchester | 95 | 704.13 | dallas | wave | manchester-us |
| toronto | pending | low | toronto | 261 | 563.72 | dallas | curated-cc=ca | toronto-us |
| victoria | pending | low | victoria | 1226 | 708.02 | dallas | wave | victoria-us |
| washington | pending | low | washington | 1085 | 783.29 | dallas | wave | washington-us |
| athens | pending | low | athens | - | 518.00 | chicago | wave | athens-us |
| cambridge | pending | low | cambridge | 179 | 441.17 | chicago | wave | cambridge-us |
| dublin | pending | low | dublin | - | 581.76 | chicago | wave | dublin-us |
| manchester | pending | low | manchester | 1401 | 620.26 | washington-dc | wave | manchester-us |
| new-york | existing |  | new-york | - |  |  |  |  |
| rochester | pending | low | rochester | 156 | 522.61 | chicago |  |  |
| salem | pending | low | salem | 739 | 515.70 | chicago | wave | salem-us |
| cambridge | pending | low | cambridge | 12507 | 91.48 | washington-dc | wave | cambridge-us |
| manchester | pending | low | manchester | 5408 | 84.86 | washington-dc | wave | manchester-us |
| montreal | pending | low | montreal | - | 606.43 | chicago | curated-cc=ca | montreal-us |
| washington | pending | low | washington | 14050 | 467.63 | chicago | wave | washington-us |
| victoria | pending | low | victoria | - | 701.83 | dallas | wave | victoria-us |
| washington | pending | low | washington | - | 438.64 | houston | wave | washington-us |
| salem | pending | low | salem | 2218 | 545.00 | washington-dc | wave | salem-us |
| washington | pending | low | washington | 9788 | 373.69 | washington-dc | wave | washington-us |
| birmingham | pending | low | birmingham | - | 101.36 | new-york | wave | birmingham-us |
| salem | pending | low | salem | 4894 | 154.06 | washington-dc | wave | salem-us |
| athens | pending | low | athens | 25044 | 439.36 | washington-dc | wave | athens-us |
| salem-heights | pending | low | salem | 3839 | 415.89 | chicago |  |  |
| washington-court-house | pending | low | washington | 14019 | 438.75 | chicago |  |  |
| newcastle | pending | low | newcastle | 9438 | 284.50 | dallas | wave | newcastle-us |
| salem | pending | low | salem | 112 | 390.20 | dallas | wave | salem-us |
| washington-boro | pending | low | washington | 729 | 130.23 | washington-dc |  |  |
| york | pending | low | york | 43992 | 120.32 | washington-dc | wave | york-us |
| york | pending | low | york | 8009 | 573.38 | washington-dc | wave | york-us |
| athens | pending | low | athens | 13688 | 762.46 | chicago | wave | athens-us |
| manchester | pending | low | manchester | 10517 | 723.68 | chicago | wave | manchester-us |
| athens | pending | low | athens | 12788 | 108.81 | dallas | wave | athens-us |
| dublin | pending | low | dublin | 3664 | 164.13 | dallas | wave | dublin-us |
| los-angeles | existing |  | los-angeles | - |  |  |  |  |
| los-angeles | existing |  | los-angeles | 121 |  |  |  |  |
| new-york | existing |  | new-york | - |  |  |  |  |
| newcastle | pending | low | newcastle | 570 | 186.95 | dallas | wave | newcastle-us |
| victoria | pending | low | victoria | 67574 | 190.75 | houston | wave | victoria-us |
| dublin | pending | low | dublin | 2686 | 377.19 | washington-dc | wave | dublin-us |
| manchester | pending | low | manchester | - | 158.19 | washington-dc | wave | manchester-us |
| salem | pending | low | salem | 25432 | 319.24 | washington-dc | wave | salem-us |
| victoria | pending | low | victoria | 1677 | 236.87 | washington-dc | wave | victoria-us |
| washington | pending | low | washington | 128 | 99.62 | washington-dc | wave | washington-us |
| salem | pending | low | salem | 1551 | 306.79 | washington-dc | wave | salem-us |
| athens | pending | low | athens | 24966 | 788.86 | chicago | wave | athens-us |
| new-york | existing |  | new-york | - |  |  |  |  |
| manchester | pending | low | manchester | 30577 | 137.09 | boston | wave | manchester-us |
| salem | pending | low | salem | 4183 | 139.57 | boston | wave | salem-us |
| washington | pending | low | washington | 3466 | 117.57 | new-york | wave | washington-us |
| birmingham | pending | low | birmingham | 433 | 376.92 | chicago | wave | birmingham-us |
| cambridge | pending | low | cambridge | 821 | 488.25 | chicago | wave | cambridge-us |
| leon | pending | low | leon | 1903 | 526.32 | chicago | wave | leon-us |
| manchester | pending | low | manchester | 5073 | 322.32 | chicago | wave | manchester-us |
| salem | pending | low | salem | 376 | 351.94 | chicago | wave | salem-us |
| toledo | pending | low | toledo | 2202 | 409.35 | chicago | wave | toledo-us |
| washington | pending | low | washington | 7408 | 343.96 | chicago | wave | washington-us |
| cambridge | pending | low | cambridge | 2113 | 222.51 | chicago | wave | cambridge-us |
| chicago | existing |  | chicago | 2664452 |  |  |  |  |
| chicago-heights | pending | low | chicago | 30284 | 41.36 | chicago |  |  |
| washington | pending | low | washington | 16664 | 197.75 | chicago | wave | washington-us |
| york-center | pending | low | york | - | 29.74 | chicago |  |  |
| birmingham | pending | low | birmingham | - | 164.34 | chicago | wave | birmingham-us |
| rochester | pending | low | rochester | 6065 | 148.51 | chicago |  |  |
| cambridge | pending | high | cambridge | 110402 | 4.18 | boston | wave | cambridge-us |
| manchester-by-the-sea | pending | low | manchester | 5366 | 33.94 | boston |  |  |
| rochester | pending | low | rochester | 4661 | 72.60 | boston |  |  |
| salem | pending | low | salem | 42869 | 22.25 | boston | wave | salem-us |
| washington | pending | low | washington | 554 | 169.03 | boston | wave | washington-us |
| newcastle | pending | low | newcastle | 667 | 223.40 | boston | wave | newcastle-us |
| york-harbor | pending | low | york | 3033 | 92.72 | boston |  |  |
| birmingham | pending | low | birmingham | 20857 | 371.37 | chicago | wave | birmingham-us |
| rochester | pending | low | rochester | 12993 | 380.44 | chicago |  |  |
| rochester-hills | pending | low | rochester | 73424 | 378.65 | chicago |  |  |
| cambridge | pending | low | cambridge | 8451 | 608.72 | chicago | wave | cambridge-us |
| granada | pending | low | granada | 293 | 584.06 | chicago | wave | granada-us |
| new-york-mills | pending | low | new-york | 1225 | 804.02 | chicago |  |  |
| rochester | pending | high | rochester | 112225 | 460.31 | chicago |  |  |
| victoria | pending | low | victoria | 8676 | 589.29 | chicago | wave | victoria-us |
| york | pending | low | york | 23 | 1177.11 | chicago | wave | york-us |
| york | pending | low | york | 7864 | 838.34 | chicago | wave | york-us |
| dublin | pending | low | dublin | 1572 | 102.21 | boston | wave | dublin-us |
| manchester | pending | high | manchester | 110229 | 77.73 | boston | wave | manchester-us |
| peterborough | pending | low | peterborough | 3103 | 92.52 | boston | wave | peterborough-us |
| rochester | pending | low | rochester | 30038 | 105.23 | boston |  |  |
| salem | pending | low | salem | 29549 | 49.03 | boston | wave | salem-us |
| washington | pending | low | washington | 953 | 124.12 | boston | wave | washington-us |
| washington | pending | low | washington | 6498 | 82.17 | new-york | wave | washington-us |
| new-york-city | existing |  | new-york | 8804190 |  |  |  |  |
| rochester | pending | high | rochester | 209802 | 403.51 | new-york |  |  |
| washington-heights | pending | low | washington | 1689 | 90.94 | new-york |  |  |
| cambridge | pending | low | cambridge | 10402 | 410.15 | washington-dc | wave | cambridge-us |
| dublin | pending | low | dublin | 45098 | 427.45 | chicago | wave | dublin-us |
| salem | pending | low | salem | 12003 | 394.03 | washington-dc | wave | salem-us |
| toledo | pending | high | toledo | 265638 | 338.71 | chicago | wave | toledo-us |
| york-center | pending | low | york | - | 386.00 | chicago |  |  |
| athens | pending | low | athens | 3255 | 251.25 | new-york | wave | athens-us |
| rochester | pending | low | rochester | 3569 | 341.86 | washington-dc |  |  |
| washington | pending | low | washington | 13497 | 309.12 | washington-dc | wave | washington-us |
| salem | pending | low | salem | 1325 | 821.69 | chicago | wave | salem-us |
| cambridge | pending | low | cambridge | 238 | 293.28 | boston | wave | cambridge-us |
| manchester | pending | low | manchester | 740 | 187.08 | boston | wave | manchester-us |
| manchester-center | pending | low | manchester | 2120 | 186.69 | boston |  |  |
| york | pending | low | york | - | 403.75 | chicago | wave | york-us |
| athens | pending | low | athens | - | 15.10 | los-angeles | wave | athens-us |
| los-angeles | existing |  | los-angeles | 3820914 |  |  |  |  |
| manchester | pending | low | manchester | 195 | 172.90 | san-francisco | wave | manchester-us |
| newcastle | pending | low | newcastle | 1224 | 165.90 | san-francisco | wave | newcastle-us |
| washington | pending | low | washington | 185 | 225.57 | san-francisco | wave | washington-us |
| new-york | existing |  | new-york | - |  |  |  |  |
| salem | pending | low | salem | 942 | 460.29 | phoenix | wave | salem-us |
| newcastle | pending | low | newcastle | 247 | 487.64 | phoenix | wave | newcastle-us |
| washington | pending | low | washington | 24299 | 429.62 | phoenix | wave | washington-us |
| cambridge | pending | low | cambridge | 313 | 551.15 | seattle | wave | cambridge-us |
| cambridge | pending | low | cambridge | 1051 | 886.97 | dallas | wave | cambridge-us |
| salem | pending | high | salem | 175535 | 301.03 | seattle | wave | salem-us |
| toledo | pending | low | toledo | 3511 | 354.21 | seattle | wave | toledo-us |
| washington-terrace | pending | low | washington | 9157 | 858.95 | phoenix |  |  |
| manchester | pending | low | manchester | 5413 | 16.93 | seattle | wave | manchester-us |
| newcastle | pending | low | newcastle | 11370 | 15.20 | seattle | wave | newcastle-us |
| vancouver | pending | high | vancouver | 196442 | 220.21 | seattle | curated-cc=ca | vancouver-us |
| newcastle | pending | low | newcastle | 3534 | 1342.33 | phoenix | wave | newcastle-us |
| washington-township | pending | low | washington | - | 31.02 | new-york |  |  |
| santiago | pending | low | santiago | 42 | 146.84 | seattle | wave | santiago-us |

## What to do next

1. Read the high-tier table above. **✅** rows pass the ar-gate;
   **⚠️** rows need manual review (Arabic quality OR collision).
2. For each **✅** row you want in curated:
   open `db/places/candidates/us-geonames-candidates.json`,
   change `"status": "pending"` to `"status": "approved"`.
3. For each **⚠️** row:
   - if Arabic is bad: edit `candidate.names.ar` to a clean Arabic value;
   - if collision: change `candidate.slug` to the suggested `slug-us` form;
   - then flip `"status"` to `"approved"`.
4. Stage 4 (apply) will merge ONLY `status: "approved"` entries.
5. DO NOT modify `db/places/curated-places.json` directly.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
Source: https://download.geonames.org/export/dump/US.zip
