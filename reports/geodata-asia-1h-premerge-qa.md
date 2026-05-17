# ASIA-1H Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1H`
**Countries**: UZ, KZ, TJ, KG, TM, MN
**Generated**: 2026-05-17T13:08:20.979Z
**Passes-gate entries scanned**: 43

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **0** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names (City/Beach/San/etc.) | **0** |
| Aliases.ar with Persian/Urdu/Latin pollution | **32** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **32** |
| Major-blocked candidates (auto-derived) | **30** |

## ① Duplicate Arabic within passes-gate (0)

_✅ No duplicates — every entry has a unique Arabic name._

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions against existing curated by Arabic name._

## ③ Incomplete compound names (0)

_✅ No incomplete compound names detected._

## ④ Aliases.ar with Persian/Urdu/Latin pollution (32)

Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| uz/shahrisabz | `شهرسبز` | `شهری‌سبز` ، `شہر سبز` |
| uz/urganch | `أورجينج` | `ارجنچ` |
| uz/xiva | `خيوة` | `خیوا` ، `خیوه` |
| uz/jizzax | `جيزاخ` | `جیزاخ` ، `جیزخ` ، `جیزک` |
| uz/fergana | `فرغانة` | `فرغانہ` ، `فیرغانا` ، `فەرغانە` |
| uz/amir-timur | `أمير تيمور` | `امیر تیمور` |
| uz/chirchiq | `تشيرتشيق` | `چیرچیق` ، `چیرچیق، ازبکستان` |
| kz/oral | `أورال` | `ئۆرال، کازاخستان` |
| kz/aktau | `آقتاؤ` | `اکتاو` |
| kz/zhezqazghan | `جيزقازغان` | `جیز قازغان` ، `جیزقازغان` |
| kz/temirtau | `تميرتاو` | `تمیرتاؤ` ، `تمیرتاو` ، `تێمیرتاو` |
| kz/kyzylorda | `قزل اوردا` | `قیزیل اردا` ، `قیزیلوردا` ، `قیزیل‌اوردا` |
| kz/konayev | `كونايف` | `کونایف` ، `کوناییف` |
| kz/petropavl | `بتروبافل` | `پتروپاول، قزاقستان` ، `پیتروپاول` ، `پێترۆپاڤل` |
| kz/pavlodar | `بافلودار` | `پاؤلودار` ، `پاولودار` ، `پاولودار، قزاقستان` ، `پاولودر` ، `پاڤلۆدار` |
| kz/baikonur | `بايكونور` | `بایکونور` |
| kz/kokshetau | `كوكشيتو` | `کوکشه‌تاو` ، `کوکشیتاؤ` ، `کوێکشێتاو` |
| tj/isfara | `اسفرة` | `اسفرہ` |
| kg/batken | `باتكن` | `باتکێن` ، `بادکند` |
| tm/balkanabat | `بالكانابات` | `بالکانابات` |
| tm/aenew | `آب نو` | `اینیو` |
| tm/dasoguz | `داسوغوز` | `داسوگز` |
| tm/mary | `ماري` | `ماری` ، `ماری، ترکمانستان` |
| tm/tuerkmenabat | `تركمينابات` | `ترکمان آباد` ، `ترکمن آباد` ، `ترکمن‌آباد` ، `ترکمینابات` ، `چارجو` ، `چهارجوی` |
| mn/ulaangom | `أولاانجوم` | `اولاانگوم` |
| mn/oelgii | `أولجي` | `الگی` |
| mn/altai | `ألتاي` | `الطائی` |
| mn/tsetserleg | `تسيتسيرليج` | `تسیتسرلیگ` ، `چچرلگ` |
| mn/erdenet | `إردنيت` | `ایردنیت` |
| mn/dzuunmod | `جزون مود` | `ڈzwn maڈ` ، `ڈزون ماڈ` ، `ډzwn md` |

_(... 2 more — see candidates JSON)_

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (32)

User-flagged slugs: `tashkent`, `samarkand`, `bukhara`, `namangan`, `andijan`, `nukus`, `fergana`, `qarshi`, `astana`, `almaty`, `shymkent`, `karaganda`, `aktobe`, `atyrau`, `taraz`, `pavlodar`, `oskemen`, `semey`, `kyzylorda`, `kostanay`, `turkestan`, `dushanbe`, `khujand`, `bokhtar`, `kulob`, `khorugh`, `bishkek`, `osh`, `jalal-abad`, `karakol`, `tokmok`, `ashgabat`, `turkmenabat`, `dasoguz`, `mary`, `balkanabat`, `ulaanbaatar`, `erdenet`, `darkhan`, `choibalsan`, `olgii`, `khovd`

| slug | curated owner | curated suffixed | passes-gate hits | blocked hits | recommendation |
| --- | --- | --- | --- | --- | --- |
| `tashkent` | `uz` owns bare (`طشقند`) | — | — | — |  |
| `samarkand` | `uz` owns bare (`سمرقند`) | — | — | — |  |
| `bukhara` | `uz` owns bare (`بخارى`) | — | — | — |  |
| `namangan` | _(free)_ | — | — | uz:pop=713220 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `nukus` | _(free)_ | — | — | uz:pop=332500 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `fergana` | _(free)_ | — | uz:pop=299200 ar=`فرغانة` | — | wave claims `fergana` bare — OK if no future-collision concern |
| `qarshi` | _(free)_ | — | — | uz:pop=278300 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `astana` | `kz` owns bare (`أستانا`) | — | — | — |  |
| `almaty` | `kz` owns bare (`ألما آتا`) | — | — | — |  |
| `shymkent` | _(free)_ | — | — | kz:pop=1200000 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `aktobe` | _(free)_ | — | — | kz:pop=500757 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `atyrau` | _(free)_ | — | — | kz:pop=290700 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `taraz` | _(free)_ | — | kz:pop=358153 ar=`تاراز` | — | wave claims `taraz` bare — OK if no future-collision concern |
| `pavlodar` | _(free)_ | — | kz:pop=329002 ar=`بافلودار` | — | wave claims `pavlodar` bare — OK if no future-collision concern |
| `semey` | _(free)_ | — | — | kz:pop=292780 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `kyzylorda` | _(free)_ | — | kz:pop=354800 ar=`قزل اوردا` | — | wave claims `kyzylorda` bare — OK if no future-collision concern |
| `kostanay` | _(free)_ | — | — | kz:pop=210000 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `turkestan` | _(free)_ | — | — | kz:pop=227098 (arabic_only) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `dushanbe` | `tj` owns bare (`دوشنبه`) | — | — | — |  |
| `khujand` | _(free)_ | — | tj:pop=191000 ar=`خجند` | — | wave claims `khujand` bare — OK if no future-collision concern |
| `bokhtar` | _(free)_ | — | tj:pop=110800 ar=`بختار` | — | wave claims `bokhtar` bare — OK if no future-collision concern |
| `khorugh` | _(free)_ | — | tj:pop=30500 ar=`خروغ` | — | wave claims `khorugh` bare — OK if no future-collision concern |
| `bishkek` | `kg` owns bare (`بيشكيك`) | — | — | — |  |
| `osh` | _(free)_ | — | kg:pop=322164 ar=`أوش` | — | wave claims `osh` bare — OK if no future-collision concern |
| `karakol` | _(free)_ | — | — | kg:pop=84351 (mixed_unknown) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `ashgabat` | `tm` owns bare (`عشق آباد`) | — | — | — |  |
| `dasoguz` | _(free)_ | — | tm:pop=201142 ar=`داسوغوز` | — | wave claims `dasoguz` bare — OK if no future-collision concern |
| `mary` | _(free)_ | — | tm:pop=167027 ar=`ماري` | — | wave claims `mary` bare — OK if no future-collision concern |
| `balkanabat` | _(free)_ | — | tm:pop=87822 ar=`بالكانابات` | — | wave claims `balkanabat` bare — OK if no future-collision concern |
| `erdenet` | _(free)_ | — | mn:pop=97814 ar=`إردنيت` | — | wave claims `erdenet` bare — OK if no future-collision concern |
| `choibalsan` | _(free)_ | — | mn:pop=44835 ar=`تشويبالسان` | — | wave claims `choibalsan` bare — OK if no future-collision concern |
| `khovd` | _(free)_ | — | mn:pop=29800 ar=`خوفد` | — | wave claims `khovd` bare — OK if no future-collision concern |

## ⑧ Major-cities-blocked auto-derived recommendation (30)

Major (pop ≥ 200,000 OR PPLC/PPLA) high-tier entries that are CURRENTLY BLOCKED.
These are candidates for a future `ASIA-1H-BLOCKED-MAJOR-CITIES-FIX-1` mini-phase.
Action: NOT for Stage 4 of this wave. User reviews after main wave merges.

| cc | slug | pop | fc | current ar | en | issue | suggestedRename |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| kz | `shymkent` | 1,200,000 | PPLA | `شمکنت` | Shymkent | ar-gate mixed_script | — |
| uz | `andijon` | 747,800 | PPLA | `anڈyjan` | Andijon | ar-gate mixed_script | — |
| uz | `namangan` | 713,220 | PPLA | `namngaں` | Namangan | ar-gate mixed_latin | — |
| kz | `aktobe` | 500,757 | PPLA | `aktwbې` | Aktobe | ar-gate mixed_latin | — |
| kz | `karagandy` | 497,777 | PPLA | `karagnڈy` | Karagandy | wave-collision | karagandy-kz |
| uz | `nukus` | 332,500 | PPLA | `نؤکیس` | Nukus | ar-gate mixed_script | — |
| kz | `ust-kamenogorsk` | 319,067 | PPLA | `asٹ kamnwګwrsk` | Ust-Kamenogorsk | ar-gate mixed_script | — |
| kz | `semey` | 292,780 | PPLA | `smې` | Semey | ar-gate mixed_latin | — |
| kz | `atyrau` | 290,700 | PPLA | `آتیراؤ` | Atyrau | ar-gate mixed_script | — |
| uz | `qarshi` | 278,300 | PPLA | `قارشی` | Qarshi | ar-gate mixed_script | — |
| kz | `turkestan` | 227,098 | PPLA | `تركستان` | Turkestan | wave-collision | turkestan-kz |
| tj | `konibodom` | 211,100 | PPLA2 | `کان بادام` | Konibodom | ar-gate mixed_script | — |
| kz | `kostanay` | 210,000 | PPLA | `قسطنائی` | Kostanay | ar-gate mixed_script | — |
| uz | `navoiy` | 144,158 | PPLA | `ناوائی` | Navoiy | ar-gate mixed_script | — |
| kg | `manas` | 123,239 | PPLA | `جلال آباد` | Manas | wave-collision | manas-kg |
| kz | `taldykorgan` | 116,558 | PPLA | `taldy kwrګan` | Taldykorgan | ar-gate mixed_script | — |
| uz | `guliston` | 90,398 | PPLA | `گلستان` | Guliston | wave-collision | guliston-uz |
| kg | `karakol` | 84,351 | PPLA | `قاراقۆل` | Karakol | wave-collision | karakol-kg |
| mn | `darhan` | 83,883 | PPLA | `darہan` | Darhan | ar-gate mixed_script | — |
| kg | `naryn` | 41,178 | PPLA | `نارين` | Naryn | wave-collision | naryn-kg |
| kg | `talas` | 40,308 | PPLA | `تالاس` | Talas | wave-collision | talas-kg |
| mn | `bayanhongor` | 30,931 | PPLA | `byan hnګwr` | Bayanhongor | ar-gate mixed_script | — |
| mn | `arvayheer` | 29,420 | PPLA | `arwyہyr` | Arvayheer | ar-gate mixed_script | — |
| mn | `dalandzadgad` | 24,863 | PPLA | `dalanzadgaڈ` | Dalandzadgad | ar-gate mixed_script | — |
| mn | `suehbaatar` | 22,741 | PPLA | `swkھ batr` | Sühbaatar | ar-gate mixed_latin | — |
| mn | `saynshand` | 19,891 | PPLA | `sayshynڈ` | Saynshand | ar-gate mixed_script | — |
| mn | `baruun-urt` | 18,190 | PPLA | `barwn arټ` | Baruun-Urt | ar-gate mixed_latin | — |
| mn | `bulgan` | 17,348 | PPLA | `bwlګan` | Bulgan | ar-gate mixed_script | — |
| mn | `uliastay` | 16,265 | PPLA | `awlyastے` | Uliastay | ar-gate mixed_script | — |
| mn | `mandalgovi` | 12,339 | PPLA | `mnڈalgwwy` | Mandalgovi | ar-gate mixed_script | — |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 43 |
| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~43** |
| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~0 |
| Aliases need cleaning (cosmetic, not blocking) | 32 |
| Major blocked (deferred to MAJOR-CITIES-FIX) | 30 |

## Next steps

Reply to the assistant with one of:

- **`approve A — clean passes-gate only (~43)`** — merge safe set; defer dup-arabic + incomplete to follow-up
- **`approve A + decisions for watchlist`** — clean set + user-decided slug ownership for collision watchlist
- **`fix arabic per row`** — give a list of (cc/slug → correct ar) pairs before any merge
- **`exclude specific slugs`** — list slugs to drop entirely from this wave
- **`run major-cities-fix first`** — handle the 30 blocked-major before any merge

**No merge yet — Stage 4 awaits user approval.**