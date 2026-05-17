# ASIA-1E Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1E`
**Countries**: NP, LK, MV, BT, BN, MM, KH, LA, TL
**Generated**: 2026-05-17T10:03:04.706Z
**Passes-gate entries scanned**: 63

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **0** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names (City/Beach/San/etc.) | **0** |
| Aliases.ar with Persian/Urdu/Latin pollution | **55** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **36** |
| Major-blocked candidates (auto-derived) | **65** |

## ① Duplicate Arabic within passes-gate (0)

_✅ No duplicates — every entry has a unique Arabic name._

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions against existing curated by Arabic name._

## ③ Incomplete compound names (0)

_✅ No incomplete compound names detected._

## ④ Aliases.ar with Persian/Urdu/Latin pollution (55)

Auto-cleaning could be applied via the same rules as EUROPE-3 alias fix (`ی→ي ک→ك پ→ب گ→غ` etc.). Listing top 30:

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| np/janakpur | `جانكبور` | `جانک‌پور` ، `جناکپور` ، `جنکپور` |
| np/birganj | `برغنج` | `برگنج` |
| np/biratnagar | `بيراتناغار` | `بیرات نگر` ، `بیراتنگر` |
| np/dipayal | `ديبايال` | `دیپایال` ، `ڈpayal` ، `ڈپایال` ، `ډpayal` ، `ډپایال` |
| lk/ratnapura | `راتنابورا` | `رتن پورا` ، `رتناپورہ` ، `رتن‌پورا` |
| lk/negombo | `نجومبو` | `نگومبو` ، `نیگومبو` |
| lk/kurunegala | `كورونيغالا` | `کرنیگالا` ، `کرونیگالا` |
| lk/galle | `غالي` | `ګalې` ، `ګالې` ، `گال` ، `گالی` |
| mv/hithadhoo | `هيثاذو` | `هیثاذو` ، `ہtھaڈھw` ، `ہتھاڈھو` |
| mv/viligili | `فيليجيلي` | `ویلی گیلی` |
| mv/dhihdhoo | `ذيذو` | `ذیذو` ، `ڈھyڈھw` ، `ڈھیڈھو` |
| mv/ungoofaaru | `أن جوفارو` | `ان گوفارو` |
| mv/veymandoo | `فيمندو` | `ویمندو` |
| bt/paro | `بارو` | `پارو` ، `پارو، بھوٹان` |
| bt/ha | `ها` | `ہa` ، `ہا` |
| bt/gasa | `غاسا` | `ګasa` ، `ګاسا` ، `گاسا` |
| bt/tsimasham | `تسيماشام` | `تسیماشام` |
| bt/jakar | `جاكار` | `جاکار` ، `جاکر` |
| bn/tutong | `توتونج` | `توتونگ` ، `ٹwٹwng` ، `ٹوٹونگ` |
| bn/kuala-belait | `كوالا بيلايت` | `کوالا بلایت` ، `کوالا بيلايت` ، `کوالا بیلیت` |
| mm/taunggyi | `تاونجي` | `تاونجی` ، `تاونگئی` |
| mm/sittwe | `سيتوي` | `سیتوه` ، `ویتوی` |
| mm/bago | `باغو` | `باگو، برما` ، `باگو، میانمار` |
| mm/hpa-an | `هبا آن` | `هپا آن` ، `ہpa an` ، `ہپا آن` |
| mm/myitkyina | `ميتكينا` | `میئتکیئنا` ، `میتکینا` |
| mm/myingyan | `ماينجيان` | `میینجیان` |
| mm/monywa | `مونيوا` | `مونیوا` |
| mm/myeik | `ماييك` | `میییک` |
| mm/loikaw | `لويكاو` | `لویکاؤ` ، `لویکاو` |
| mm/lashio | `لاشيو` | `لاشیئو` ، `لاشیو` |

_(... 25 more — see candidates JSON)_

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check (Stage 3.5 worked correctly)._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (36)

User-flagged slugs: `kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`

| slug | curated owner | curated suffixed | passes-gate hits | blocked hits | recommendation |
| --- | --- | --- | --- | --- | --- |
| `kathmandu` | `np` owns bare (`كاتماندو`) | — | — | — |  |
| `pokhara` | `np` owns bare (`بوكارا`) | — | — | — |  |
| `janakpur` | _(free)_ | — | np:pop=195438 ar=`جانكبور` | — | wave claims `janakpur` bare — OK if no future-collision concern |
| `butwal` | _(free)_ | — | — | np:pop=195054 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `colombo` | `lk` owns bare (`كولومبو`) | — | — | — |  |
| `kandy` | `lk` owns bare (`كاندي`) | — | — | — |  |
| `jaffna` | _(free)_ | — | lk:pop=169102 ar=`جافنا` | — | wave claims `jaffna` bare — OK if no future-collision concern |
| `galle` | _(free)_ | — | lk:pop=93118 ar=`غالي` | — | wave claims `galle` bare — OK if no future-collision concern |
| `trincomalee` | _(free)_ | — | — | lk:pop=108420 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `male` | `mv` owns bare (`ماليه`) | — | — | — |  |
| `hithadhoo` | _(free)_ | — | mv:pop=9927 ar=`هيثاذو` | — | wave claims `hithadhoo` bare — OK if no future-collision concern |
| `thimphu` | _(free)_ | — | — | bt:pop=98676 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `paro` | _(free)_ | — | bt:pop=11448 ar=`بارو` | — | wave claims `paro` bare — OK if no future-collision concern |
| `punakha` | _(free)_ | — | — | bt:pop=21500 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `bandar-seri-begawan` | _(free)_ | — | — | bn:pop=64409 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `kuala-belait` | _(free)_ | — | bn:pop=31178 ar=`كوالا بيلايت` | — | wave claims `kuala-belait` bare — OK if no future-collision concern |
| `tutong` | _(free)_ | — | bn:pop=19151 ar=`توتونج` | — | wave claims `tutong` bare — OK if no future-collision concern |
| `yangon` | `mm` owns bare (`يانغون`) | — | — | — |  |
| `mandalay` | `mm` owns bare (`ماندالاي`) | — | — | — |  |
| `mawlamyine` | _(free)_ | — | — | mm:pop=438861 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `pathein` | _(free)_ | — | mm:pop=237089 ar=`باثيين` | — | wave claims `pathein` bare — OK if no future-collision concern |
| `bago` | _(free)_ | — | mm:pop=244376 ar=`باغو` | — | wave claims `bago` bare — OK if no future-collision concern |
| `sittwe` | _(free)_ | — | mm:pop=177743 ar=`سيتوي` | — | wave claims `sittwe` bare — OK if no future-collision concern |
| `phnom-penh` | `kh` owns bare (`بنوم بنه`) | — | — | — |  |
| `siem-reap` | `kh` owns bare (`سيام ريب`) | — | — | — |  |
| `battambang` | _(free)_ | — | kh:pop=119251 ar=`باتامبانج` | — | wave claims `battambang` bare — OK if no future-collision concern |
| `sihanoukville` | _(free)_ | — | — | kh:pop=73036 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `takeo` | _(free)_ | — | kh:pop=843931 ar=`تاكيو` | — | wave claims `takeo` bare — OK if no future-collision concern |
| `vientiane` | `la` owns bare (`فينتيان`) | — | — | — |  |
| `savannakhet` | _(free)_ | — | la:pop=125760 ar=`سافان ناخيت` | — | wave claims `savannakhet` bare — OK if no future-collision concern |
| `luang-prabang` | _(free)_ | — | — | la:pop=55027 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `pakse` | _(free)_ | — | la:pop=77900 ar=`باكسي` | — | wave claims `pakse` bare — OK if no future-collision concern |
| `thakhek` | _(free)_ | — | — | la:pop=90800 (mixed_latin) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |
| `dili` | _(free)_ | — | tl:pop=150000 ar=`دلي` | — | wave claims `dili` bare — OK if no future-collision concern |
| `maliana` | _(free)_ | — | tl:pop=22000 ar=`ماليانا` | — | wave claims `maliana` bare — OK if no future-collision concern |
| `suai` | _(free)_ | — | — | tl:pop=21539 (mixed_script) | ⚠️ slug FREE but wave entry blocked — likely intra-wave dup or ar-gate; needs major-cities-fix |

## ⑧ Major-cities-blocked auto-derived recommendation (65)

Major (pop ≥ 200,000 OR PPLC/PPLA) high-tier entries that are CURRENTLY BLOCKED.
These are candidates for a future `ASIA-1E-BLOCKED-MAJOR-CITIES-FIX-1` mini-phase.
Action: NOT for Stage 4 of this wave. User reviews after main wave merges.

| cc | slug | pop | fc | current ar | en | issue | suggestedRename |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| mm | `mawlamyine` | 438,861 | PPLA | `ماولامیئن` | Mawlamyine | ar-gate mixed_script | — |
| np | `bharatpur` | 369,377 | PPL | `باراتپور، نپال` | Bharatpur | ar-gate mixed_script | — |
| mm | `amarapura` | 237,618 | PPLA3 | `امراپورا` | Amarapura | ar-gate mixed_script | — |
| np | `butwal` | 195,054 | PPLA | `bٹwal` | Butwāl | ar-gate mixed_script | — |
| np | `birendranagar` | 154,886 | PPLA | `بریندرنگر` | Birendranagar | ar-gate mixed_script | — |
| mm | `dawei` | 136,783 | PPLA | `داوئی` | Dawei | ar-gate mixed_script | — |
| lk | `trincomalee` | 108,420 | PPLA | `ترنکومالی` | Trincomalee | ar-gate mixed_script | — |
| bt | `thimphu` | 98,676 | PPLC | `تىمپۇ` | Thimphu | ar-gate mixed_script | — |
| mm | `magway` | 96,954 | PPLA | `mygwے` | Magway | ar-gate mixed_script | — |
| la | `thakhek` | 90,800 | PPLA | `tھakhyk` | Thakhèk | ar-gate mixed_latin | — |
| kh | `kampong-chhnang` | 75,244 | PPLA | `kmpwng chھnang` | Kampong Chhnang | ar-gate mixed_latin | — |
| kh | `sihanoukville` | 73,036 | PPLA | `syhanwk wېl` | Sihanoukville | ar-gate mixed_latin | — |
| bn | `bandar-seri-begawan` | 64,409 | PPLC | `باندار سەرى بەگاۋان` | Bandar Seri Begawan | ar-gate mixed_script | — |
| lk | `anuradhapura` | 60,943 | PPLA | `anwrad ھa pwra` | Anuradhapura | ar-gate mixed_latin | — |
| la | `luang-prabang` | 55,027 | PPLA | `لوآنگ پرابانگ` | Luang Prabang | ar-gate mixed_script | — |
| la | `muang-phonsavan` | 37,507 | PPLA | `مواang فونسافان` | Muang Phônsavan | ar-gate mixed_latin | — |
| kh | `kep` | 35,990 | PPLA | `كيب` | Kep | wave-collision | kep-kh |
| kh | `koh-kong` | 33,134 | PPLA | `kwہ kang` | Koh Kong | ar-gate mixed_script | — |
| kh | `prey-veng` | 33,079 | PPLA | `pryے wyng` | Prey Veng | ar-gate mixed_script | — |
| kh | `suong` | 30,000 | PPLA | `swwnګ` | Suong | ar-gate mixed_script | — |
| kh | `stung-treng` | 25,000 | PPLA | `sٹng ٹrng` | Stung Treng | ar-gate mixed_script | — |
| la | `muang-xay` | 25,000 | PPLA | `mwang saے` | Muang Xay | ar-gate mixed_script | — |
| kh | `tbeng-meanchey` | 24,380 | PPLA | `تبنج میانچی` | Tbeng Meanchey | ar-gate mixed_script | — |
| kh | `svay-rieng` | 23,956 | PPLA | `swې rynګ` | Svay Rieng | ar-gate mixed_script | — |
| bt | `tsirang` | 22,376 | PPLA | `tsyranګ` | Tsirang | ar-gate mixed_script | — |
| np | `dhankuta` | 22,084 | PPLA | `dھnkwta` | Dhankutā | ar-gate mixed_latin | — |
| tl | `suai` | 21,539 | PPLA | `سوائی` | Suai | ar-gate mixed_script | — |
| bt | `punakha` | 21,500 | PPLA | `pwnakھa` | Punākha | ar-gate mixed_latin | — |
| la | `sekong` | 20,116 | PPLA | `سيكونج` | Sekong | wave-collision | sekong-la |
| kh | `kratie` | 19,975 | PPLA | `kryٹy` | Kratié | ar-gate mixed_script | — |
| kh | `kampong-thom` | 19,951 | PPLA | `kmpwng ٹm` | Kampong Thom | ar-gate mixed_script | — |
| kh | `banlung` | 17,000 | PPLA | `بانلنگ` | Banlung | ar-gate mixed_script | — |
| bt | `pemagatshel` | 13,864 | PPLA | `pymaګtshyl` | Pemagatshel | ar-gate mixed_script | — |
| la | `ban-houayxay` | 12,500 | PPLA | `ban ہwayے saے` | Ban Houayxay | ar-gate mixed_script | — |
| mv | `fuvahmulah` | 11,140 | PPLA | `fwwہ mwlaہ` | Fuvahmulah | ar-gate mixed_script | — |
| bt | `sarpang` | 10,416 | PPLA | `sarpnګ` | Sarpang | ar-gate mixed_script | — |
| la | `muang-phon-hong` | 10,112 | PPLA | `mwang fwn-ہang` | Muang Phôn-Hông | ar-gate mixed_script | — |
| mv | `kulhudhuffushi` | 9,500 | PPLA | `kwlھwdwfwshy` | Kulhudhuffushi | ar-gate mixed_latin | — |
| bt | `samdrup-jongkhar` | 9,325 | PPLA | `samdrwp jwnګkhar` | Samdrup Jongkhar | ar-gate mixed_script | — |
| bt | `wangdue-phodrang` | 8,954 | PPLA | `wangdyw fwڈrang` | Wangdue Phodrang | ar-gate mixed_script | — |
| tl | `same` | 7,500 | PPLA | `saہmے  mshrqy tymwr` | Same | wave-collision | same-tl |
| mv | `thinadhoo` | 6,376 | PPLA | `tھynaڈھw` | Thinadhoo | ar-gate mixed_script | — |
| bt | `samtse` | 5,396 | PPLA | `samtsې` | Samtse | ar-gate mixed_latin | — |
| mv | `naifaru` | 5,044 | PPLA | `nayy farwں` | Naifaru | ar-gate mixed_latin | — |
| tl | `pante-makasar` | 4,730 | PPLA | `pantے makasar` | Pante Makasar | ar-gate mixed_script | — |
| la | `attapeu` | 4,297 | PPLA | `aٹapyw` | Attapeu | ar-gate mixed_script | — |
| bn | `bangar` | 3,970 | PPLA | `بانجار` | Bangar | wave-collision | bangar-bn |
| la | `luang-namtha` | 3,225 | PPLA | `lwang namtھa` | Luang Namtha | ar-gate mixed_latin | — |
| bt | `trashi-yangtse` | 3,025 | PPLA | `trashy yanګtsې` | Trashi Yangtse | ar-gate mixed_script | — |
| bt | `mongar` | 2,969 | PPLA | `mwnګar` | Mongar | ar-gate mixed_script | — |
| mv | `funadhoo` | 2,900 | PPLA | `fna ڈھw` | Funadhoo | ar-gate mixed_script | — |
| mv | `eydhafushi` | 2,808 | PPLA | `ayydھa fwshy` | Eydhafushi | ar-gate mixed_latin | — |
| bt | `trongsa` | 2,805 | PPLA | `trwnګsa` | Trongsa | ar-gate mixed_script | — |
| bt | `daga` | 2,243 | PPLA | `daګa` | Daga | wave-collision | daga-bt |
| mv | `mahibadhoo` | 2,156 | PPLA | `maہy badھw` | Mahibadhoo | ar-gate mixed_script | — |
| bt | `lhuentse` | 1,935 | PPLA | `lhwyntsې` | Lhuentse | ar-gate mixed_latin | — |
| mv | `fonadhoo` | 1,773 | PPLA | `fwna ڈھw` | Fonadhoo | ar-gate mixed_script | — |
| mv | `manadhoo` | 1,580 | PPLA | `mnaڈھw` | Manadhoo | ar-gate mixed_script | — |
| mv | `kudahuvadhoo` | 1,562 | PPLA | `kڈaہwwadھw` | Kudahuvadhoo | ar-gate mixed_script | — |
| mv | `muli` | 1,008 | PPLA | `مولي` | Muli | wave-collision | muli-mv |
| bt | `trashigang` | 872 | PPLA | `trashyګnګ` | Trashigang | ar-gate mixed_script | — |
| bt | `shemgang` | 852 | PPLA | `shymګnګ` | Shemgang | ar-gate mixed_script | — |
| mv | `felidhoo` | 541 | PPLA | `fyly ڈھw` | Felidhoo | ar-gate mixed_script | — |
| mv | `nilandhoo` | 0 | PPLA | `nylandھw` | Nilandhoo | ar-gate mixed_latin | — |
| bt | `lungtenzampa` | 0 | PPLA | `lnګtnzmpa` | Lungtenzampa | ar-gate mixed_script | — |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 63 |
| **Safe-to-merge clean** (no dup, no incomplete, no semantic flag) | **~63** |
| Needs manual Arabic fix (dup OR incomplete OR ambiguous) | ~0 |
| Aliases need cleaning (cosmetic, not blocking) | 55 |
| Major blocked (deferred to MAJOR-CITIES-FIX) | 65 |

## Next steps

Reply to the assistant with one of:

- **`approve A — clean passes-gate only (~63)`** — merge safe set; defer dup-arabic + incomplete to follow-up
- **`approve A + decisions for watchlist`** — clean set + user-decided slug ownership for collision watchlist
- **`fix arabic per row`** — give a list of (cc/slug → correct ar) pairs before any merge
- **`exclude specific slugs`** — list slugs to drop entirely from this wave
- **`run major-cities-fix first`** — handle the 65 blocked-major before any merge

**No merge yet — Stage 4 awaits user approval.**