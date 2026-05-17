# Asia-1E — Wave Summary

**Wave**: `CURATED-GEODATA-ASIA-1E`
**Strategy**: E (popMin + alwaysInclude + ar-quality gate)
**Countries**: NP, LK, MV, BT, BN, MM, KH, LA, TL
**Generated**: 2026-05-17T10:03:54.265Z

## Filter thresholds (same as Americas-1A)

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| NP | 87772 | 87725 | **10** | 0 | 15 | 87615 | 85 | **4** | **6** |
| LK | 17856 | 17741 | **10** | 0 | 1076 | 16651 | 4 | **7** | **3** |
| MV | 118 | 117 | **18** | 0 | 0 | 98 | 1 | **5** | **13** |
| BT | 253 | 251 | **22** | 0 | 61 | 168 | 0 | **5** | **17** |
| BN | 370 | 357 | **4** | 0 | 0 | 353 | 0 | **2** | **2** |
| MM | 54769 | 53122 | **20** | 0 | 95 | 53004 | 3 | **13** | **7** |
| KH | 11222 | 11193 | **23** | 0 | 0 | 11164 | 6 | **11** | **12** |
| LA | 15217 | 13292 | **16** | 0 | 6 | 13267 | 3 | **7** | **9** |
| TL | 3419 | 3325 | **12** | 0 | 3 | 3310 | 0 | **9** | **3** |
| **TOTAL** | — | — | **135** | 0 | 1256 | 185630 | 102 | **63** | **72** |

## Collision-watch list (user-specified, Asia-1E kickoff)

User pre-flagged these slugs for explicit collision check:

`kathmandu`, `pokhara`, `janakpur`, `butwal`, `colombo`, `kandy`, `jaffna`, `galle`, `trincomalee`, `male`, `malé`, `hithadhoo`, `thimphu`, `paro`, `punakha`, `bandar-seri-begawan`, `kuala-belait`, `tutong`, `yangon`, `mandalay`, `naypyidaw`, `nay-pyi-taw`, `mawlamyine`, `pathein`, `bago`, `sittwe`, `phnom-penh`, `siem-reap`, `battambang`, `sihanoukville`, `takeo`, `vientiane`, `savannakhet`, `luang-prabang`, `pakse`, `thakhek`, `dili`, `baucau`, `maliana`, `suai`

### Status of watch-list slugs (existing curated + current wave high-tier)

| watch-slug | existing in curated? | wave candidate(s) high-tier | resolution recommendation |
| --- | --- | --- | --- |
| `kathmandu` | `kathmandu` [np] "كاتماندو" | _(not in high-tier)_ | bare slug already owned by np — wave is unaffected |
| `pokhara` | `pokhara` [np] "بوكارا" | _(not in high-tier)_ | bare slug already owned by np — wave is unaffected |
| `janakpur` | _(none — slug is free)_ | np/janakpur pop=195438 ✅ | wave candidate claims bare slug (no existing reservation) |
| `butwal` | _(none — slug is free)_ | np/butwal pop=195054 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `colombo` | `colombo` [lk] "كولومبو" | _(not in high-tier)_ | bare slug already owned by lk — wave is unaffected |
| `kandy` | `kandy` [lk] "كاندي" | _(not in high-tier)_ | bare slug already owned by lk — wave is unaffected |
| `jaffna` | _(none — slug is free)_ | lk/jaffna pop=169102 ✅ | wave candidate claims bare slug (no existing reservation) |
| `galle` | _(none — slug is free)_ | lk/galle pop=93118 ✅ | wave candidate claims bare slug (no existing reservation) |
| `trincomalee` | _(none — slug is free)_ | lk/trincomalee pop=108420 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `male` | `male` [mv] "ماليه" | _(not in high-tier)_ | bare slug already owned by mv — wave is unaffected |
| `malé` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `hithadhoo` | _(none — slug is free)_ | mv/hithadhoo pop=9927 ✅ | wave candidate claims bare slug (no existing reservation) |
| `thimphu` | _(none — slug is free)_ | bt/thimphu pop=98676 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `paro` | _(none — slug is free)_ | bt/paro pop=11448 ✅ | wave candidate claims bare slug (no existing reservation) |
| `punakha` | _(none — slug is free)_ | bt/punakha pop=21500 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `bandar-seri-begawan` | _(none — slug is free)_ | bn/bandar-seri-begawan pop=64409 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `kuala-belait` | _(none — slug is free)_ | bn/kuala-belait pop=31178 ✅ | wave candidate claims bare slug (no existing reservation) |
| `tutong` | _(none — slug is free)_ | bn/tutong pop=19151 ✅ | wave candidate claims bare slug (no existing reservation) |
| `yangon` | `yangon` [mm] "يانغون" | _(not in high-tier)_ | bare slug already owned by mm — wave is unaffected |
| `mandalay` | `mandalay` [mm] "ماندالاي" | _(not in high-tier)_ | bare slug already owned by mm — wave is unaffected |
| `naypyidaw` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `nay-pyi-taw` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `mawlamyine` | _(none — slug is free)_ | mm/mawlamyine pop=438861 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `pathein` | _(none — slug is free)_ | mm/pathein pop=237089 ✅ | wave candidate claims bare slug (no existing reservation) |
| `bago` | _(none — slug is free)_ | mm/bago pop=244376 ✅ | wave candidate claims bare slug (no existing reservation) |
| `sittwe` | _(none — slug is free)_ | mm/sittwe pop=177743 ✅ | wave candidate claims bare slug (no existing reservation) |
| `phnom-penh` | `phnom-penh` [kh] "بنوم بنه" | _(not in high-tier)_ | bare slug already owned by kh — wave is unaffected |
| `siem-reap` | `siem-reap` [kh] "سيام ريب" | _(not in high-tier)_ | bare slug already owned by kh — wave is unaffected |
| `battambang` | _(none — slug is free)_ | kh/battambang pop=119251 ✅ | wave candidate claims bare slug (no existing reservation) |
| `sihanoukville` | _(none — slug is free)_ | kh/sihanoukville pop=73036 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `takeo` | _(none — slug is free)_ | kh/takeo pop=843931 ✅ | wave candidate claims bare slug (no existing reservation) |
| `vientiane` | `vientiane` [la] "فينتيان" | _(not in high-tier)_ | bare slug already owned by la — wave is unaffected |
| `savannakhet` | _(none — slug is free)_ | la/savannakhet pop=125760 ✅ | wave candidate claims bare slug (no existing reservation) |
| `luang-prabang` | _(none — slug is free)_ | la/luang-prabang pop=55027 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `pakse` | _(none — slug is free)_ | la/pakse pop=77900 ✅ | wave candidate claims bare slug (no existing reservation) |
| `thakhek` | _(none — slug is free)_ | la/thakhek pop=90800 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `dili` | _(none — slug is free)_ | tl/dili pop=150000 ✅ | wave candidate claims bare slug (no existing reservation) |
| `baucau` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `maliana` | _(none — slug is free)_ | tl/maliana pop=22000 ✅ | wave candidate claims bare slug (no existing reservation) |
| `suai` | _(none — slug is free)_ | tl/suai pop=21539 ⚠️ | wave candidate claims bare slug (no existing reservation) |

## Strategy E decision: passes-gate vs blocked

* **Passes ar-gate (63)** — ready for `status: approved` flip after collision resolution.
* **Blocked by ar-gate (72)** — manual fix BEFORE approval (Persian/Urdu/Latin/empty Arabic OR collision).

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-asia-1e-summary.md` |
| Arabic-quality detail   | `reports/geodata-asia-1e-arabic-quality-report.md` |
| NP country report | `reports/np-geodata-import-report.md` |
| LK country report | `reports/lk-geodata-import-report.md` |
| MV country report | `reports/mv-geodata-import-report.md` |
| BT country report | `reports/bt-geodata-import-report.md` |
| BN country report | `reports/bn-geodata-import-report.md` |
| MM country report | `reports/mm-geodata-import-report.md` |
| KH country report | `reports/kh-geodata-import-report.md` |
| LA country report | `reports/la-geodata-import-report.md` |
| TL country report | `reports/tl-geodata-import-report.md` |

## Next steps

1. Read this summary + the ar-quality report.
2. Open each per-country report; decide per row.
3. Reply to the assistant: `approve all` / `approve per-country` /
   `fix Arabic` / `exclude slugs` / `rename slugs` / specific decisions
   for watch-list ambiguities.
4. Assistant flips `status` flags and runs Stage 4 per country.

**Hard rule**: do NOT modify `db/places/curated-places.json` by hand.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
