# ASIA-1I Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1I`
**Countries**: AZ, GE, AM
**Generated**: 2026-05-17T11:19:30.190Z
**Passes-gate entries scanned**: 56

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **0** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names (City/Beach/San/etc.) | **0** |
| Aliases.ar with Persian/Urdu/Latin pollution | **40** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **16** |
| Major-blocked candidates (auto-derived) | **23** |

## ① Duplicate Arabic within passes-gate (0)

_✅ No duplicates — every entry has a unique Arabic name._

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions against existing curated by Arabic name._

## ③ Incomplete compound names (0)

_✅ No incomplete compound names detected._

## ④ Aliases.ar with Persian/Urdu/Latin pollution (40)

Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| az/zangilan | `زنجيلان` | `زنجیلان` |
| az/yardimli | `يارديملي` | `یاردملی` ، `یاردیملی` |
| az/novyy-karanlug | `نوفي كارانلوغ` | `نوی کاران لوگ` ، `نوی کارانلوغ` ، `نویی کاران لوگ` |
| az/susa | `سوسا` | `شوشی` |
| az/salyan | `ساليان` | `سالیان` |
| az/saatli | `ساتلي` | `ساتلی` |
| az/qubadli | `قبادلي` | `قبادلی` ، `قوبادلی` |
| az/neftcala | `نفتجالا` | `نفتچالا` |
| az/naxcivan | `ناختشيفان` | `نخچیوان` |
| az/masally | `ماسالي` | `مسالی` |
| az/lerik | `لريك` | `لیرک` ، `لیریک` |
| az/lankaran | `لنكاران` | `لنکاران` |
| az/imishli | `إميشلي` | `امشلی` ، `امیشلی` |
| az/jebrail | `جبرائيل` | `جبرائیل` |
| az/jalilabad | `جليلاباد` | `جلیل آباد` |
| az/beylagan | `بيلاجان` | `بیلاگان` |
| az/sirvan | `سروان` | `سیروان` |
| az/agdam | `آغدام` | `اگدام` |
| az/yevlakh | `يفلاخ` | `یولاخ` |
| az/goygol | `جويجول` | `گوائی گول` ، `گوی گول` |
| az/xacmaz | `خاشماز` | `خاچماز` ، `خچماز` |
| az/kyzyl-burun | `قيزيل بورون` | `قیزیل بورون` ، `کیزیل برون` |
| az/shamakhi | `شماخي` | `شماخی` |
| az/sheki | `شكي` | `شکی` ، `شیکی` |
| az/samux | `سامخ` | `سموکس` |
| az/haciqabul | `حاجي قابول` | `حاجیقابول` ، `حاجی‌قابول` |
| az/kyurdarmir | `كيوردامير` | `کوردامیر` ، `کیوردرمیر` |
| az/xizi | `خيزي` | `خیزی` |
| az/khirdalan | `خيردالان` | `خیردالان` |
| az/kalbajar | `كالباجار` | `کالباجار` |

_(... 10 more — see candidates JSON)_

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (16)

User-flagged slugs: `baku`, `ganja`, `sumqayit`, `mingachevir`, `lankaran`, `sheki`, `shirvan`, `khirdalan`, `tbilisi`, `batumi`, `kutaisi`, `rustavi`, `zugdidi`, `gori`, `sokhumi`, `yerevan`, `gyumri`, `vanadzor`, `hrazdan`, `ararat`, `armavir`, `kapan`

| slug | curated owner | curated suffixed | passes-gate hits | blocked hits | recommendation |
| --- | --- | --- | --- | --- | --- |
| `baku` | `az` owns bare (`باكو`) | — | — | — |  |
| `ganja` | _(free)_ | — | az:pop=335600 ar=`جنجا` | — | wave claims `ganja` bare — OK if no future-collision concern |
| `sumqayit` | _(free)_ | — | — | az:pop=358675 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `mingachevir` | _(free)_ | — | — | az:pop=106048 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `lankaran` | _(free)_ | — | az:pop=240300 ar=`لنكاران` | — | wave claims `lankaran` bare — OK if no future-collision concern |
| `sheki` | _(free)_ | — | az:pop=68400 ar=`شكي` | — | wave claims `sheki` bare — OK if no future-collision concern |
| `khirdalan` | _(free)_ | — | az:pop=37949 ar=`خيردالان` | — | wave claims `khirdalan` bare — OK if no future-collision concern |
| `tbilisi` | `ge` owns bare (`تبليسي`) | — | — | — |  |
| `batumi` | _(free)_ | — | — | ge:pop=186949 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `gori` | _(free)_ | — | — | ge:pop=41933 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `yerevan` | `am` owns bare (`يريفان`) | — | — | — |  |
| `gyumri` | _(free)_ | — | am:pop=114667 ar=`غيومري` | — | wave claims `gyumri` bare — OK if no future-collision concern |
| `vanadzor` | _(free)_ | — | — | am:pop=78100 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `hrazdan` | _(free)_ | — | am:pop=49500 ar=`هرازدان` | — | wave claims `hrazdan` bare — OK if no future-collision concern |
| `armavir` | _(free)_ | — | — | am:pop=29700 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `kapan` | _(free)_ | — | am:pop=32900 ar=`قابان` | — | wave claims `kapan` bare — OK if no future-collision concern |

## ⑧ Major-cities-blocked auto-derived recommendation (23)

Major (pop ≥ 200,000 OR PPLC/PPLA) high-tier entries that are CURRENTLY BLOCKED.
These are candidates for a future `ASIA-1I-BLOCKED-MAJOR-CITIES-FIX-1` mini-phase.
Action: NOT for Stage 4 of this wave. User reviews after main wave merges.

| cc | slug | pop | fc | current ar | en | issue | suggestedRename |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| az | `sumqayit` | 358,675 | PPLA | `سمقاییت` | Sumqayıt | ar-gate mixed_script | — |
| ge | `batumi` | 186,949 | PPLA | `باتومی` | Batumi | ar-gate mixed_script | — |
| az | `mingachevir` | 106,048 | PPLA | `منجاچویر` | Mingachevir | ar-gate mixed_script | — |
| am | `vanadzor` | 78,100 | PPLA | `vanadzۆr` | Vanadzor | ar-gate mixed_latin | — |
| az | `agdzhabedy` | 43,000 | PPLA | `آغجابیدی` | Agdzhabedy | ar-gate mixed_script | — |
| az | `goeycay` | 42,500 | PPLA | `gwے jے` | Göyçay | ar-gate mixed_script | — |
| ge | `gori` | 41,933 | PPLA | `گوری` | Gori | ar-gate mixed_script | — |
| az | `barda` | 37,372 | PPLA | `bardہ` | Barda | ar-gate mixed_script | — |
| az | `sabirabad` | 30,612 | PPLA | `سبیر آباد` | Sabirabad | ar-gate mixed_script | — |
| am | `armavir` | 29,700 | PPLA | `آرماویر` | Armavir | ar-gate mixed_script | — |
| az | `fizuli` | 26,765 | PPLA | `فضولی` | Fizuli | ar-gate mixed_script | — |
| az | `agdas` | 23,528 | PPLA | `آغ‌داش` | Ağdaş | ar-gate mixed_unknown | — |
| az | `terter` | 18,185 | PPLA | `trٹr` | Terter | ar-gate mixed_script | — |
| az | `pushkino` | 18,182 | PPLA | `بوشكينو` | Pushkino | wave-collision | pushkino-az |
| ge | `akhaltsikhe` | 17,445 | PPLA | `آخالت سیکه` | Akhaltsikhe | ar-gate mixed_script | — |
| az | `astara` | 15,190 | PPLA | `astarہ` | Astara | ar-gate mixed_script | — |
| az | `belokany` | 14,800 | PPLA | `بلوکانی` | Belokany | ar-gate mixed_script | — |
| ge | `ozurgeti` | 13,935 | PPLA | `ازرگتی` | Ozurgeti | ar-gate mixed_script | — |
| az | `qabala` | 11,867 | PPLA | `qbalہ` | Qabala | ar-gate mixed_script | — |
| az | `goranboy` | 10,186 | PPLA | `gwranbwayے` | Goranboy | ar-gate mixed_script | — |
| am | `yeghegnadzor` | 7,300 | PPLA | `yەghەgnadzۆr` | Yeghegnadzor | ar-gate mixed_latin | — |
| az | `lacin` | 2,300 | PPLA | `لاچن` | Laçın | ar-gate mixed_script | — |
| ge | `ambrolauri` | 1,952 | PPLA | `آمبرولائوری` | Ambrolauri | ar-gate mixed_script | — |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 56 |
| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~56** |
| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~0 |
| Aliases need cleaning (cosmetic, not blocking) | 40 |
| Major blocked (deferred to MAJOR-CITIES-FIX) | 23 |

## Next steps

Reply to the assistant with one of:

- **`approve A — clean passes-gate only (~56)`** — merge safe set; defer dup-arabic + incomplete to follow-up
- **`approve A + decisions for watchlist`** — clean set + user-decided slug ownership for collision watchlist
- **`fix arabic per row`** — give a list of (cc/slug → correct ar) pairs before any merge
- **`exclude specific slugs`** — list slugs to drop entirely from this wave
- **`run major-cities-fix first`** — handle the 23 blocked-major before any merge

**No merge yet — Stage 4 awaits user approval.**