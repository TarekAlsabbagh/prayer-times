# Asia-1C — Wave Summary

**Wave**: `CURATED-GEODATA-ASIA-1C`
**Strategy**: E (popMin + alwaysInclude + ar-quality gate)
**Countries**: JP, KR, HK, TW, MO
**Generated**: 2026-05-17T07:44:15.173Z

## Filter thresholds (same as Americas-1A)

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| JP | 50799 | 45022 | **67** | 0 | 358 | 44505 | 92 | **53** | **14** |
| KR | 62752 | 61692 | **20** | 0 | 9 | 61651 | 12 | **13** | **7** |
| HK | 1342 | 1335 | **2** | 0 | 4 | 1319 | 10 | **1** | **1** |
| TW | 16102 | 15674 | **7** | 0 | 8 | 15657 | 2 | **4** | **3** |
| MO | 9 | 9 | **1** | 0 | 0 | 8 | 0 | **0** | **1** |
| **TOTAL** | — | — | **97** | 0 | 379 | 123140 | 116 | **71** | **26** |

## Collision-watch list (user-specified, Asia-1C kickoff)

User pre-flagged these slugs for explicit collision check:

`tokyo`, `osaka`, `kyoto`, `yokohama`, `nagoya`, `sapporo`, `sendai`, `nara`, `okinawa`, `seoul`, `busan`, `daegu`, `daejeon`, `incheon`, `hong-kong`, `macau`, `macao`, `taipei`, `kaohsiung`, `taichung`, `tainan`, `kobe`, `fukuoka`, `hiroshima`, `nagasaki`

### Status of watch-list slugs (existing curated + current wave high-tier)

| watch-slug | existing in curated? | wave candidate(s) high-tier | resolution recommendation |
| --- | --- | --- | --- |
| `tokyo` | `tokyo` [jp] "طوكيو" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `osaka` | `osaka` [jp] "أوساكا" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `kyoto` | `kyoto` [jp] "كيوتو" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `yokohama` | `yokohama` [jp] "يوكوهاما" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `nagoya` | `nagoya` [jp] "ناغويا" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `sapporo` | `sapporo` [jp] "سابورو" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `sendai` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `nara` | _(none — slug is free)_ | jp/nara-shi pop=367353 ✅ | wave candidate claims bare slug (no existing reservation) |
| `okinawa` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `seoul` | `seoul` [kr] "سيول" | _(not in high-tier)_ | bare slug already owned by kr — wave is unaffected |
| `busan` | `busan` [kr] "بوسان" | _(not in high-tier)_ | bare slug already owned by kr — wave is unaffected |
| `daegu` | _(none — slug is free)_ | kr/daegu pop=2365523 ✅ | wave candidate claims bare slug (no existing reservation) |
| `daejeon` | _(none — slug is free)_ | kr/daejeon pop=1441203 ✅ | wave candidate claims bare slug (no existing reservation) |
| `incheon` | `incheon` [kr] "إنتشون" | _(not in high-tier)_ | bare slug already owned by kr — wave is unaffected |
| `hong-kong` | `hong-kong` [hk] "هونغ كونغ" | _(not in high-tier)_ | bare slug already owned by hk — wave is unaffected |
| `macau` | _(none — slug is free)_ | mo/macau pop=649335 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `macao` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `taipei` | `taipei` [tw] "تايبيه" | _(not in high-tier)_ | bare slug already owned by tw — wave is unaffected |
| `kaohsiung` | _(none — slug is free)_ | tw/kaohsiung pop=2737660 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `taichung` | _(none — slug is free)_ | tw/taichung pop=2850285 ✅ | wave candidate claims bare slug (no existing reservation) |
| `tainan` | _(none — slug is free)_ | tw/tainan pop=1856642 ✅ | wave candidate claims bare slug (no existing reservation) |
| `kobe` | `kobe` [jp] "كوبي" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `fukuoka` | `fukuoka` [jp] "فوكوكا" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `hiroshima` | `hiroshima` [jp] "هيروشيما" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |
| `nagasaki` | `nagasaki` [jp] "ناغاساكي" | _(not in high-tier)_ | bare slug already owned by jp — wave is unaffected |

## Strategy E decision: passes-gate vs blocked

* **Passes ar-gate (71)** — ready for `status: approved` flip after collision resolution.
* **Blocked by ar-gate (26)** — manual fix BEFORE approval (Persian/Urdu/Latin/empty Arabic OR collision).

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-asia-1c-summary.md` |
| Arabic-quality detail   | `reports/geodata-asia-1c-arabic-quality-report.md` |
| JP country report | `reports/jp-geodata-import-report.md` |
| KR country report | `reports/kr-geodata-import-report.md` |
| HK country report | `reports/hk-geodata-import-report.md` |
| TW country report | `reports/tw-geodata-import-report.md` |
| MO country report | `reports/mo-geodata-import-report.md` |

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
