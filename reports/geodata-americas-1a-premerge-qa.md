# AMERICAS-1A Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-AMERICAS-1A`
**Generated**: 2026-05-16T12:09:28.382Z
**Passes-gate entries scanned**: 141

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **2** |
| Passes-gate Arabic matching existing curated entry | **1** |
| Incomplete compound names (City/Beach/Springs/etc.) | **6** |
| Aliases.ar with Persian/Urdu/Latin pollution | **139** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **15** |

## ① Duplicate Arabic within passes-gate (2)

Each row shows entries with **identical** `names.ar`. Likely indicates a wrong/templated transliteration.

| name.ar | cc/slug | en |
| --- | --- | --- |
| `كولومبوس` | us/columbus | Columbus |
| `كولومبوس` | us/columbus | Columbus |
| `كولومبيا` | us/columbia | Columbia |
| `كولومبيا` | us/columbia | Columbia |

## ② Passes-gate Arabic matches existing curated (1)

Each row shows a passes-gate entry whose `names.ar` is also used by an existing curated entry. The user may want to verify these are genuinely different cities.

| wave cc/slug | wave en | shared ar | existing curated |
| --- | --- | --- | --- |
| us/frankfort | Frankfort | `فرانكفورت` | de/frankfurt |

## ③ Incomplete compound names (6)

English name contains a common suffix/prefix (City, Beach, Springs, etc.) but the Arabic name does not include the corresponding Arabic translation. Likely incomplete.

| cc/slug | en | current ar | missing Arabic for English token |
| --- | --- | --- | --- |
| us/coral-springs | Coral Springs | `كورال سبرنغز` | `springs` → expects `سبرينغز` |
| us/pompano-beach | Pompano Beach | `بومبانو سيتى` | `beach` → expects `بيتش` |
| us/sioux-falls | Sioux Falls | `سايوكس فالز` | `falls` → expects `فولز` |
| us/colorado-springs | Colorado Springs | `كولورادو سبرينغس` | `springs` → expects `سبرينغز` |
| us/carson-city | Carson City | `كارسون سيتى` | `city` → expects `سيتي` |
| us/salt-lake-city | Salt Lake City | `سالت ليك` | `city` → expects `سيتي` |

## ④ Aliases.ar with Persian/Urdu/Latin pollution (139)

Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| us/little-rock | `ليتل روك` | `لٹل راک` ، `لٹل راک، آرکنساس` ، `لیتل راک` ، `لیتل راک، آرکانزاس` |
| us/cape-coral | `كيب كورال` | `کیپ کورال، فلوریدا` ، `کیپ کورل، فلوریڈا` |
| us/coral-springs | `كورال سبرنغز` | `کورال اسپرینگز، فلوریدا` ، `کورل اسپرنگز، فلوریڈا` |
| us/davie | `ديفي` | `دیوی، فلوریدا` |
| us/gainesville | `غينزفيل` | `گینزویل، فلوریدا` |
| us/hialeah | `هياليه` | `هیالیا، فلوریدا` ، `ہیالیاہ، فلوریڈا` ، `ہیالیح` |
| us/miami-gardens | `ميامي غاردنز` | `میامی گاردنز، فلوریدا` ، `میامی گارڈنز` ، `میامی گارڈنز، فلوریڈا` |
| us/orlando | `أورلاندو` | `اورلندو، فلوریدا` ، `اورلینڈو` ، `اورلینڈو، فلوریڈا` |
| us/palm-bay | `بالم باي` | `پالم بی، فلوریدا` |
| us/pembroke-pines | `بيمبروك باينز` | `پمبروک پائینز` ، `پمبروک پاینز، فلوریدا` ، `پیمبروک پائنز، فلوریڈا` |
| us/pompano-beach | `بومبانو سيتى` | `پومپانو بیچ، فلوریدا` ، `پومپانو بیچ، فلوریڈا` |
| us/tallahassee | `تالاهاسي` | `تالاهاسی` ، `تالاہاسی، فلوریڈا` ، `ٹالیحسی` |
| us/tampa | `تامبا` | `تمپا، فلوریدا` ، `ٹیمپا، فلوریڈا` |
| us/columbus | `كولومبوس` | `کلمبوس، جورجیا` ، `کولمبس، جارجیا` |
| us/sandy-springs | `ساندي سبرينغز` | `سندی اسپرینگ، جورجیا` ، `سینڈی سپرنگز، جارجیا` |
| us/savannah | `سافانا` | `ساوانا، جورجیا` ، `ساواناہ، جارجیا` |
| us/olathe | `أولاث` | `اولیتا، کانزاس` ، `اولیتھی، کنساس` |
| us/overland-park | `أوفرلاند بارك` | `اوورلند پارک، کانزاس` ، `اوورلینڈ پارک، کنساس` |
| us/wichita | `ويتشيتا` | `ویچیتا، کانزاس` ، `ویچیتا، کنساس` |
| us/frankfort | `فرانكفورت` | `فرانکفورت` ، `فرانکفورت، کنتاکی` ، `فرینک فورٹ، کینٹکی` ، `فرینکفورٹ` |
| us/lafayette | `لافاييت` | `لافایت، لوئیزیانا` ، `لافیت، لوسیانہ` |
| us/shreveport | `شريفبورت` | `شریوپورت، لوئیزیانا` ، `شریوپورٹ، لوزیانا` |
| us/columbia | `كولومبيا` | `کلمبیا، میزوری` ، `کولمبیا، مسوری` |
| us/independence | `إنديبندنس` | `انڈیپینڈینس، مسوری` ، `ایندیپندنس، میزوری` |
| us/jefferson-city | `جفرسن سيتي` | `جفرسون‌سیتی` ، `جیفرسن سٹی` ، `جیفرسن سٹی، مسوری` |
| us/kansas-city | `كانساس سيتي` | `کانزاس‌سیتی، میزوری` ، `کنساس شہر، مسوری` |
| us/cary | `كاري` | `کری، کارولینای شمالی` ، `کیری، شمالی کیرولائنا` |
| us/charlotte | `تشارلوت` | `شارلوت، کارولینای شمالی` ، `شارلوٹ، شمالی کیرولائنا` |
| us/greensboro | `غرينزبورو` | `گرینزبورو، شمالی کیرولائنا` ، `گرینزبورو، کارولینای شمالی` |
| us/wilmington | `ويلمينغتون` | `ویلمینگتن، کارولینای شمالی` ، `ویلمینگٹن، شمالی کیرولائنا` |

_(... 109 more — see candidates JSON)_

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (15)

| slug | curated owner | curated suffixed | passes-gate hits | blocked-by-collision hits | recommendation |
| --- | --- | --- | --- | --- | --- |
| `rochester` | _(free)_ | — | us:pop=209802 | us:pop=112225 (mixed_script) | Wave claims `rochester` bare — OK if no future-collision concern |
| `cordoba` | `es` owns bare | — | — | mx:pop=204721 (mixed_script) | Wave version blocked; needs `cordoba-{cc}` rename if user wants to add it |
| `merida` | `es` owns bare | — | — | mx:pop=1201000 (mixed_script) | Wave version blocked; needs `merida-{cc}` rename if user wants to add it |
| `cambridge` | `gb` owns bare | — | — | us:pop=110402 (arabic_only), ca:pop=129920 (arabic_only) | Wave version blocked; needs `cambridge-{cc}` rename if user wants to add it |
| `birmingham` | `gb` owns bare | — | — | us:pop=196357 (arabic_only) | Wave version blocked; needs `birmingham-{cc}` rename if user wants to add it |
| `manchester` | `gb` owns bare | — | — | us:pop=110229 (arabic_only) | Wave version blocked; needs `manchester-{cc}` rename if user wants to add it |
| `athens` | `gr` owns bare | — | — | us:pop=127315 (mixed_script) | Wave version blocked; needs `athens-{cc}` rename if user wants to add it |
| `dublin` | `ie` owns bare | — | — | — |  |
| `saint-petersburg` | `ru` owns bare | — | — | — |  |
| `granada` | _(free)_ | granada-es | — | — |  |
| `santiago` | _(free)_ | santiago-cl, santiago-de-compostela | — | — |  |
| `leon` | `es` owns bare | — | — | — |  |
| `newcastle` | _(free)_ | newcastle-upon-tyne | — | — |  |
| `york` | `gb` owns bare | — | — | — |  |
| `washington` | _(free)_ | washington-dc | — | — |  |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 141 |
| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~130** |
| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~11 |
| Aliases need cleaning (cosmetic, not blocking) | 139 |

## Blocked major-cities recommendation (for separate `AMERICAS-1A-BLOCKED-MAJOR-CITIES-FIX-1`)

| slug | cc | pop | issue | proposed action |
| --- | --- | ---: | --- | --- |
| `merida` | mx | 1,201,000 | collision (es owns bare `merida`) | rename to `merida-mx` + user-approved Arabic if needed |
| `cordoba` | mx | 204,721 | collision (es owns bare `cordoba`) | rename to `cordoba-mx` |
| `victoria` | ca | 289,625 | wave-blocked but free slug | override + claim bare `victoria` (BC PPLA) |
| `salem` | us | 175,535 | wave-blocked but free slug | override + claim bare `salem` (OR PPLA) |
| `toledo` | us | 265,638 | wave-blocked but free slug | override + claim bare `toledo` (OH, pop) |
| `birmingham` | us | 196,357 | collision (gb owns bare) | rename to `birmingham-us` |
| `manchester` | us | 110,229 | collision (gb owns bare) | rename to `manchester-us` |
| `cambridge` | us | 110,402 | collision (gb owns bare) | rename to `cambridge-us` |
| `cambridge` | ca | 129,920 | collision (gb owns bare) | rename to `cambridge-ca` |
| `athens` | us | 127,315 | collision (gr owns bare) | rename to `athens-us` |
| `philadelphia` | us | 1,573,916 | Urdu Arabic blocked | user-approved fix to `فيلادلفيا` |
| `san-antonio` | us | 1,526,656 | Persian Arabic blocked | user-approved fix to `سان أنطونيو` |
| `austin` | us | 974,447 | Urdu Arabic blocked | user-approved fix to `أوستن` |
| `indianapolis` | us | 887,642 | Urdu Arabic blocked | user-approved fix to `إنديانابوليس` |
| `las-vegas` | us | 641,903 | Urdu Arabic blocked | user-approved fix to `لاس فيغاس` |
| `louisville` | us | 624,444 | Urdu Arabic blocked | user-approved fix to `لويزفيل` |
| `albuquerque` | us | 564,559 | Urdu Arabic blocked | user-approved fix to `ألباكركي` |
| `milwaukee` | us | 563,531 | Urdu Arabic blocked | user-approved fix to `ميلواكي` |

## Next steps

Reply to the assistant with one of:

- **`approve A — clean passes-gate only (~130)`** — merge safe set + drop incomplete + drop dup-arabic
- **`approve C — A + major-cities fix`** — clean passes-gate + 8-10 collision-resolved major cities (~155-160)
- **`approve D — A + C + Urdu manual fix`** — full set incl. user-approved Persian/Urdu corrections (~170-180)
- **`exclude specific slugs`** — list specific slugs to skip
- **`fix arabic per row`** — give a list of (slug → correct ar) pairs

No merge yet — Stage 4 awaits user approval.