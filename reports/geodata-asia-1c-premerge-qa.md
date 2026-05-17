# ASIA-1C Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1C`
**Countries**: JP, KR, HK, TW, MO
**Generated**: 2026-05-17T07:44:20.616Z
**Passes-gate entries scanned**: 71

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **0** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names (City/Beach/San/etc.) | **3** |
| Aliases.ar with Persian/Urdu/Latin pollution | **56** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **21** |
| Major-blocked candidates (auto-derived) | **26** |

## ① Duplicate Arabic within passes-gate (0)

_✅ No duplicates — every entry has a unique Arabic name._

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions against existing curated by Arabic name._

## ③ Incomplete compound names (3)

English name contains a common suffix/prefix (City, Beach, San, Santa, São, etc.) but the Arabic name does not include the corresponding Arabic translation. Likely incomplete.

| cc/slug | en | current ar | missing Arabic for English token |
| --- | --- | --- | --- |
| jp/tottori-shi | Tottori-shi | `توتوري` | `shi` → expects `شي` |
| jp/nara-shi | Nara-shi | `نارا` | `shi` → expects `شي` |
| kr/cheongju-si | Cheongju-si | `تشيونغجو` | `si` → expects `سي` |

## ④ Aliases.ar with Persian/Urdu/Latin pollution (56)

Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| jp/yokosuka | `يوكوسوكا` | `یوکوسوکا، کاناگاوا` ، `یوکوسکا، کناگوا` |
| jp/yokkaichi | `يوكايتشي` | `یوکایچی، میه` ، `یوکای‌ایچی، میه` ، `یوکیچی، مئی` |
| jp/toyota | `تويوتا` | `تویوتا، آیچی` ، `ٹویوٹا، ایچی` ، `ٹویوٹہ` |
| jp/tottori-shi | `توتوري` | `توتوری` ، `توتوری، توتوری` |
| jp/tokorozawa | `توكوروزاوا` | `توکوروزاوا، سائیتاما` ، `توکوروزاوا، سایتاما` |
| jp/takasaki | `تاكاساكي` | `تاکاساکی، گونما` |
| jp/takarazuka | `تاكارازوكا` | `تاکارازوکا، هیوگو` ، `تاکارازوکا، ہیوگو` |
| jp/takamatsu | `تاكاماتسو` | `تاکاماتسو، کاگاوا` |
| jp/shizuoka | `شيزوكا` | `شیزوئوکا` ، `شیزوکا` |
| jp/shimonoseki | `شيمونوسكي` | `شیمونوسکی، یاماگوچی` ، `شیمونوسیکی، یاماگوچی` |
| jp/saga | `ساغا` | `ساگا` |
| jp/otsu | `أوتسو` | `اتسو، شیگا` |
| jp/ota | `أوتا` | `اوتا، گونما` |
| jp/okazaki | `أوكازاكي` | `اوکازاکی، آیچی` ، `اوکازاکی، ایچی` |
| jp/nagareyama | `ناغاره ياما` | `ناگاریاما، چیبا` ، `ناگارییاما، چیبا` |
| jp/nagaoka | `ناغاوكا` | `ناگائوکا، نیگاتا` ، `ناگاوکا، نیگاتا` |
| jp/matsumoto | `ماتسوموتو` | `ماتسوموتو، ناگانو` |
| jp/matsudo | `ماتسودو` | `ماتسودو، چیبا` |
| jp/machida | `ماتشيدا` | `ماچیدا، توکیو` ، `ماچیدا، ٹوکیو` |
| jp/kurume | `كورومي` | `کورومه، فوکوئوکا` ، `کورومی، فوکوکا` |
| jp/kure | `كورشي` | `کوره، هیروشیما` ، `کورے، ہیروشیما` |
| jp/koshigaya | `كوشيغايا` | `کوشیگایا، سائیتاما` ، `کوشیگایا، سایتاما` |
| jp/kofu | `كوفو` | `کوفو، یاماناشی` |
| jp/kitakyushu | `كيتاكيوشو` | `کیتاکیوشو، فوکوئوکا` |
| jp/kawasaki | `كاواساكي` | `کاواساکی، کاناگاوا` |
| jp/kawaguchi | `كاواغوتشي` | `کاواگوچی، سائیتاما` ، `کاواگوچی، سایتاما` |
| jp/kawagoe | `كاواغويه` | `کاواگوئه، سایتاما` ، `کاواگوے، سائیتاما` |
| jp/kasukabe | `كاسوكابي` | `کاسوکابه، سایتاما` ، `کاسوکابے، سائیتاما` |
| jp/kasugai | `كاسوغاي` | `کاسوگائی، ایچی` ، `کاسوگای` ، `کاسوگای، آیچی` ، `کسوگا‌‍‌ئ` |
| jp/kashiwa | `كاشيوا` | `کاشیوا، چیبا` |

_(... 26 more — see candidates JSON)_

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (21)

User-flagged slugs: `tokyo`, `osaka`, `kyoto`, `yokohama`, `nagoya`, `sapporo`, `sendai`, `nara`, `okinawa`, `seoul`, `busan`, `daegu`, `daejeon`, `incheon`, `hong-kong`, `macau`, `macao`, `taipei`, `kaohsiung`, `taichung`, `tainan`, `kobe`, `fukuoka`, `hiroshima`, `nagasaki`

| slug | curated owner | curated suffixed | passes-gate hits | blocked hits | recommendation |
| --- | --- | --- | --- | --- | --- |
| `tokyo` | `jp` owns bare (`طوكيو`) | — | — | — |  |
| `osaka` | `jp` owns bare (`أوساكا`) | — | — | — |  |
| `kyoto` | `jp` owns bare (`كيوتو`) | — | — | — |  |
| `yokohama` | `jp` owns bare (`يوكوهاما`) | — | — | — |  |
| `nagoya` | `jp` owns bare (`ناغويا`) | — | — | — |  |
| `sapporo` | `jp` owns bare (`سابورو`) | — | — | — |  |
| `seoul` | `kr` owns bare (`سيول`) | — | — | — |  |
| `busan` | `kr` owns bare (`بوسان`) | — | — | — |  |
| `daegu` | _(free)_ | — | kr:pop=2365523 ar=`دائجو` | — | wave claims `daegu` bare — OK if no future-collision concern |
| `daejeon` | _(free)_ | — | kr:pop=1441203 ar=`دائجئون` | — | wave claims `daejeon` bare — OK if no future-collision concern |
| `incheon` | `kr` owns bare (`إنتشون`) | — | — | — |  |
| `hong-kong` | `hk` owns bare (`هونغ كونغ`) | — | — | — |  |
| `macau` | _(free)_ | — | — | mo:pop=649335 (mixed_unknown) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `taipei` | `tw` owns bare (`تايبيه`) | — | — | — |  |
| `kaohsiung` | _(free)_ | — | — | tw:pop=2737660 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `taichung` | _(free)_ | — | tw:pop=2850285 ar=`تاي شانغ` | — | wave claims `taichung` bare — OK if no future-collision concern |
| `tainan` | _(free)_ | — | tw:pop=1856642 ar=`تاينان` | — | wave claims `tainan` bare — OK if no future-collision concern |
| `kobe` | `jp` owns bare (`كوبي`) | — | — | — |  |
| `fukuoka` | `jp` owns bare (`فوكوكا`) | — | — | — |  |
| `hiroshima` | `jp` owns bare (`هيروشيما`) | — | — | — |  |
| `nagasaki` | `jp` owns bare (`ناغاساكي`) | — | — | — |  |

## ⑧ Major-cities-blocked auto-derived recommendation (26)

Major (pop ≥ 200,000 OR PPLC/PPLA) high-tier entries that are CURRENTLY BLOCKED.
These are candidates for a future `ASIA-1C-BLOCKED-MAJOR-CITIES-FIX-1` mini-phase.
Action: NOT for Stage 4 of this wave. User reviews after main wave merges.

| cc | slug | pop | fc | current ar | en | issue | suggestedRename |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| tw | `kaohsiung` | 2,737,660 | PPLA | `kawhsywnګ` | Kaohsiung | ar-gate mixed_script | — |
| mo | `macau` | 649,335 | PPLC | `ئاۋمېن` | Macau | ar-gate mixed_unknown | — |
| jp | `higashiosaka` | 493,940 | PPLA2 | `هيغاشيوساكا، أوساكا` | Higashiosaka | ar-gate mixed_unknown | — |
| kr | `jeju-city` | 488,844 | PPLA | `jyjw sٹy` | Jeju City | ar-gate mixed_script | — |
| jp | `kurashiki` | 483,576 | PPLA2 | `كوراشيكي، أوكاياما` | Kurashiki | ar-gate mixed_unknown | — |
| jp | `fukuyama` | 468,812 | PPLA2 | `فوکویاما` | Fukuyama | ar-gate mixed_script | — |
| jp | `hirakata` | 406,331 | PPLA2 | `هيراكاتا، أوساكا` | Hirakata | ar-gate mixed_unknown | — |
| kr | `sejong` | 394,630 | PPLA | `سئجونگ` | Sejong | ar-gate mixed_script | — |
| jp | `suita` | 385,567 | PPLA2 | `سوئیتا، اوساکا` | Suita | ar-gate mixed_script | — |
| jp | `toyohashi` | 377,453 | PPLA2 | `تويوهاشي، آيتشي` | Toyohashi | ar-gate mixed_unknown | — |
| kr | `yangsan` | 358,074 | PPLA2 | `سانگ‌سان` | Yangsan | ar-gate mixed_script | — |
| jp | `iwaki` | 357,309 | PPLA2 | `ایواکی، فوکوشیما` | Iwaki | ar-gate mixed_script | — |
| jp | `asahikawa` | 333,530 | PPLA2 | `آساهیکاوا، هوکایدو` | Asahikawa | ar-gate mixed_script | — |
| jp | `akita` | 307,672 | PPLA | `آکیتا` | Akita | ar-gate mixed_script | — |
| kr | `iksan` | 307,000 | PPL | `اکسان` | Iksan | ar-gate mixed_script | — |
| jp | `akashi` | 303,601 | PPLA2 | `آکاشی` | Akashi | ar-gate mixed_script | — |
| hk | `tin-shui-wai` | 282,400 | PPL | `تین شوی وای` | Tin Shui Wai | ar-gate mixed_script | — |
| kr | `yeosu` | 268,823 | PPLA2 | `یئوسو` | Yeosu | ar-gate mixed_script | — |
| jp | `fuji` | 245,392 | PPLA2 | `فوجي` | Fuji | wave-collision | fuji-jp |
| jp | `sasebo` | 243,223 | PPLA2 | `ساسه‌بو، ناگازاکی` | Sasebo | ar-gate mixed_script | — |
| jp | `atsugi` | 223,960 | PPLA2 | `آتسوگی، کاناگاوا` | Atsugi | ar-gate mixed_script | — |
| jp | `matsue` | 203,616 | PPLA | `ماتسو، شیمانے` | Matsue | ar-gate mixed_script | — |
| kr | `andong` | 153,348 | PPLA | `آندونگ` | Andong | wave-collision | andong-kr |
| kr | `hongseong` | 89,174 | PPLA | `هانگ سئونگ` | Hongseong | ar-gate mixed_script | — |
| tw | `jincheng` | 37,507 | PPLA | `jynchynګ` | Jincheng | ar-gate mixed_script | — |
| tw | `zhongxing-new-village` | 25,549 | PPLA | `zhwngshng nya gawں` | Zhongxing New Village | ar-gate mixed_latin | — |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 71 |
| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~68** |
| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~3 |
| Aliases need cleaning (cosmetic, not blocking) | 56 |
| Major blocked (deferred to MAJOR-CITIES-FIX) | 26 |

## Next steps

Reply to the assistant with one of:

- **`approve A — clean passes-gate only (~68)`** — merge safe set; defer dup-arabic + incomplete to follow-up
- **`approve A + decisions for watchlist`** — clean set + user-decided slug ownership for collision watchlist
- **`fix arabic per row`** — give a list of (cc/slug → correct ar) pairs before any merge
- **`exclude specific slugs`** — list slugs to drop entirely from this wave
- **`run major-cities-fix first`** — handle the 26 blocked-major before any merge

**No merge yet — Stage 4 awaits user approval.**