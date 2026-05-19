# ASIA-1D-PK Pre-Merge QA Report

**Wave**: `CURATED-GEODATA-ASIA-1D-PK`
**Country**: Pakistan (باكستان)
**Generated**: 2026-05-19T06:47:18.187Z
**Passes-gate entries scanned**: 43

## Top-line counts

| Check | Hits |
| --- | ---: |
| Duplicate Arabic names within passes-gate | **0** |
| Passes-gate Arabic matching existing curated entry | **0** |
| Incomplete compound names | **0** |
| Aliases.ar with Persian/Urdu/Latin pollution | **0** |
| Names.ar failing clean check (should be 0) | **0** |
| Bad slugs | **0** |
| Watch-list slugs touched | **23** |
| Major-blocked candidates (auto-derived) | **7** |

## ① Duplicate Arabic within passes-gate (0)

_✅ No duplicates — every entry has a unique Arabic name._

## ② Passes-gate Arabic matches existing curated (0)

_✅ No collisions against existing curated by Arabic name._

## ③ Incomplete compound names (0)

_✅ No incomplete compound names detected._

## ④ Aliases.ar with Persian/Urdu/Latin pollution (0)

_✅ All aliases.ar across passes-gate are clean (Stage 3.4 cleaned them in-place)._

## ⑤ Names.ar failing clean-check (defense-in-depth) (0)

_✅ All passes-gate names.ar pass the clean-check._

## ⑥ Bad slugs (0)

_✅ All slugs match the safe pattern `[a-z0-9][a-z0-9-]{0,79}`._

## ⑦ Watch-list collision review (23)

User-flagged Pakistani cities (curated + expected major new entries):
`karachi`, `lahore`, `islamabad`, `rawalpindi`, `peshawar`, `multan`, `faisalabad`, `quetta`, `hyderabad`, `hyderabad-pk`, `sialkot`, `bahawalpur`, `gujranwala`, `sargodha`, `sukkur`, `larkana`, `mardan`, `sheikhupura`, `sahiwal`, `mingora`, `okara`, `gujrat`, `kasur`, `rahim-yar-khan`, `rahimyar-khan`, `wah`, `wah-cantonment`, `jhang`, `chiniot`, `dera-ghazi-khan`, `dera-ismail-khan`, `gilgit`, `muzaffarabad`

| slug | curated owner | curated suffixed | wave passes-gate | wave blocked | matched-existing | recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `karachi` | `pk` owns bare (`كراتشي`) | — | — | — | matched=`karachi` | ✅ already curated |
| `lahore` | `pk` owns bare (`لاهور`) | — | — | — | matched=`lahore` | ✅ already curated |
| `islamabad` | `pk` owns bare (`إسلام آباد`) | — | — | — | matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` • matched=`islamabad` | ✅ already curated |
| `rawalpindi` | `pk` owns bare (`روالبندي`) | — | — | — | matched=`rawalpindi` | ✅ already curated |
| `peshawar` | `pk` owns bare (`بيشاور`) | — | — | — | matched=`peshawar` | ✅ already curated |
| `multan` | `pk` owns bare (`ملتان`) | — | — | — | matched=`multan` • matched=`multan` | ✅ already curated |
| `faisalabad` | `pk` owns bare (`فيصل آباد`) | — | — | — | matched=`faisalabad` • matched=`faisalabad` • matched=`faisalabad` • matched=`faisalabad` | ✅ already curated |
| `quetta` | `pk` owns bare (`كويتا`) | — | — | — | matched=`quetta` | ✅ already curated |
| `hyderabad` | _(free)_ | hyderabad-in [in], hyderabad-pk [pk] | — | — | matched=`hyderabad-pk` | ✅ already curated |
| `hyderabad-pk` | `pk` owns bare (`حيدر آباد`) | — | — | — | — | — |
| `sialkot` | `pk` owns bare (`سيالكوت`) | — | — | — | matched=`sialkot` • matched=`sialkot` • matched=`sialkot` | ✅ already curated |
| `gujranwala` | _(free)_ | — | — | pop=2511118 (mixed_latin) | — | ⏭️ deferred to ASIA-1D-PK-MCF |
| `sargodha` | _(free)_ | — | pop=975886 ar=`سرغودها` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `sukkur` | _(free)_ | — | pop=563851 ar=`سكر` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `mardan` | _(free)_ | — | pop=300424 ar=`مردان` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `sahiwal` | _(free)_ | — | — | pop=538344 (mixed_latin) | — | ⏭️ deferred to ASIA-1D-PK-MCF |
| `mingora` | _(free)_ | — | pop=279914 ar=`منغورا` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `gujrat` | _(free)_ | — | pop=574240 ar=`غجرات` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `rahim-yar-khan` | _(free)_ | — | pop=517000 ar=`رحيم يار خان` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `chiniot` | _(free)_ | — | — | pop=318165 (mixed_unknown) | — | ⏭️ deferred to ASIA-1D-PK-MCF |
| `dera-ghazi-khan` | _(free)_ | — | — | pop=494464 (mixed_unknown) | — | ⏭️ deferred to ASIA-1D-PK-MCF |
| `gilgit` | _(free)_ | — | pop=216760 ar=`كلكت` | — | — | ⚠️ wave proposes new entry — review Arabic |
| `muzaffarabad` | _(free)_ | — | pop=725000 ar=`مظفر آباد` | — | — | ⚠️ wave proposes new entry — review Arabic |

## ⑧ Major-cities-blocked auto-derived recommendation (7)

Major (pop ≥ 200k OR PPLC/PPLA) high-tier entries CURRENTLY BLOCKED. Candidates for a future `ASIA-1D-PK-MCF` mini-phase.

| slug | pop | fc | current ar | en | issue | suggestedRename |
| --- | ---: | --- | --- | --- | --- | --- |
| `gujranwala` | 2,511,118 | PPLA2 | `gwjranwalه` | Gujranwala | ar-gate mixed_latin | — |
| `bannu` | 1,357,890 | PPLA2 | `بنوں` | Bannu | ar-gate mixed_unknown | — |
| `sahiwal` | 538,344 | PPLA2 | `saهiwal` | Sahiwal | ar-gate mixed_latin | — |
| `dera-ghazi-khan` | 494,464 | PPLA2 | `ديره غازيخان، باكستان` | Dera Ghazi Khan | ar-gate mixed_unknown | — |
| `chiniot` | 318,165 | PPLA2 | `جنيوټ` | Chiniot | ar-gate mixed_unknown | — |
| `muzaffargarh` | 235,541 | PPLA2 | `مظفر غره، باكستان` | Muzaffargarh | ar-gate mixed_unknown | — |
| `jacobabad` | 219,315 | PPLA2 | `jyڪb abad` | Jacobabad | ar-gate mixed_latin | — |

## Summary

| Outcome | Count |
| --- | ---: |
| Total passes-gate scanned | 43 |
| **Safe-to-merge clean** | **~43** |
| Needs manual Arabic fix (dup OR incomplete) | ~0 |
| Aliases need cleaning (cosmetic, not blocking) | 0 |
| Major blocked (deferred to MCF) | 7 |

## Next steps

Reply with one of:

- **`approve A — clean passes-gate (~43)`** — merge safe set
- **`fix arabic per row`** — supply (slug → correct ar) before merge
- **`exclude specific slugs`** — list slugs to drop
- **`run major-cities-fix first`** — handle 7 blocked-major before merge

**No merge yet — Stage 4 awaits user approval.**