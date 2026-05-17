# ASIA-1G-IR Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1G-IR`
**Country**: Iran (إيران)
**Generated**: 2026-05-17T20:18:47.026Z
**Passes-gate entries scanned**: 42

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **1** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names | **1** |
| Aliases.ar with Persian/Urdu/Latin pollution | **4** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **21** |
| Major-blocked candidates (auto-derived) | **0** |

## ① Duplicate Arabic within passes-gate (1)

| name.ar | cc/slug | en |
| --- | --- | --- |
| `مراغه` | ir/maragheh | Marāgheh |
| `مراغه` | ir/maragheh | Marāgheh |

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions against existing curated by Arabic name._

## ③ Incomplete compound names (1)

| cc/slug | en | current ar | missing Arabic for English token |
| --- | --- | --- | --- |
| ir/qaem-shahr | Qā’em Shahr | `شاه آباد` | `shahr` → expects `شهر` |

## ④ Aliases.ar with Persian/Urdu/Latin pollution (4)

| cc/slug | name.ar | dirty alias(es) |
| --- | --- | --- |
| ir/sanandaj | `سنندج` | `سنە` |
| ir/qazvin | `قزوين` | `قەزوين` |
| ir/karaj | `قَصَبِهِ كَرَج` | `كەرەج` |
| ir/bandar-abbas | `بندر عباس` | `بەندەر عەباس` |

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (21)

User-flagged Iranian cities: `tehran`, `mashhad`, `isfahan`, `karaj`, `shiraz`, `tabriz`, `qom`, `ahvaz`, `kermanshah`, `urmia`, `orumiyeh`, `rasht`, `zahedan`, `hamadan`, `yazd`, `ardabil`, `bandar-abbas`, `kerman`, `zanjan`, `sanandaj`, `qazvin`

| slug | curated owner | curated suffixed | wave passes-gate | wave blocked | matched-existing | recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `tehran` | `ir` owns bare (`طهران`) | — | — | — | matched=`tehran` • matched=`tehran` • matched=`tehran` | ✅ already curated |
| `mashhad` | `ir` owns bare (`مشهد`) | — | — | — | matched=`mashhad` • matched=`mashhad` • matched=`mashhad` • matched=`mashhad` • matched=`mashhad` • matched=`mashhad` • matched=`mashhad` | ✅ already curated |
| `isfahan` | `ir` owns bare (`أصفهان`) | — | — | — | matched=`isfahan` | ✅ already curated |
| `karaj` | _(free)_ | — | pop=1448075 ar=`قَصَبِهِ كَرَج` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `shiraz` | `ir` owns bare (`شيراز`) | — | — | — | matched=`shiraz` • matched=`shiraz` | ✅ already curated |
| `tabriz` | `ir` owns bare (`تبريز`) | — | — | — | matched=`tabriz` | ✅ already curated |
| `qom` | `ir` owns bare (`قم`) | — | — | — | matched=`qom` • matched=`qom` | ✅ already curated |
| `ahvaz` | `ir` owns bare (`الأهواز`) | — | — | — | matched=`ahvaz` | ✅ already curated |
| `kermanshah` | `ir` owns bare (`كرمانشاه`) | — | — | — | matched=`kermanshah` • matched=`kermanshah` • matched=`kermanshah` | ✅ already curated |
| `urmia` | `ir` owns bare (`أرومية`) | — | — | — | — | — |
| `orumiyeh` | _(free)_ | — | — | — | matched=`urmia` | ✅ already curated |
| `rasht` | `ir` owns bare (`رشت`) | — | — | — | matched=`rasht` | ✅ already curated |
| `zahedan` | _(free)_ | — | pop=551980 ar=`زاهدان` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `hamadan` | _(free)_ | — | pop=528256 ar=`همدان` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `yazd` | `ir` owns bare (`يزد`) | — | — | — | matched=`yazd` | ✅ already curated |
| `ardabil` | _(free)_ | — | pop=410753 ar=`اردبيل` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `bandar-abbas` | _(free)_ | — | pop=352173 ar=`بندر عباس` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `kerman` | `ir` owns bare (`كرمان`) | — | — | — | matched=`kerman` • matched=`kerman` • matched=`kerman` • matched=`kerman` | ✅ already curated |
| `zanjan` | _(free)_ | — | pop=357471 ar=`زنجان` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `sanandaj` | _(free)_ | — | pop=349176 ar=`سنندج` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `qazvin` | _(free)_ | — | pop=333635 ar=`قزوين` | — | — | ⚠️ wave proposes new entry — review Arabic |

## ⑧ Major-cities-blocked auto-derived recommendation (0)

_✅ No major-blocked candidates — Stage 3.4 rescued everything._

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 42 |
| **Safe-to-merge clean** | **~39** |
| Needs manual Arabic fix (dup OR incomplete) | ~3 |
| Aliases need cleaning (cosmetic, not blocking) | 4 |
| Major blocked (deferred to MCF) | 0 |

## Next steps

Reply with one of:

- **`approve A — clean passes-gate (~39)`** — merge safe set
- **`fix arabic per row`** — supply (slug → correct ar) before merge
- **`exclude specific slugs`** — list slugs to drop
- **`run major-cities-fix first`** — handle 0 blocked-major before merge

**No merge yet — Stage 4 awaits user approval.**