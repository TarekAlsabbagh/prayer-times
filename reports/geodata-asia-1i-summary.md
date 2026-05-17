# Asia-1I — Wave Summary

**Wave**: `CURATED-GEODATA-ASIA-1I`
**Strategy**: E (popMin + alwaysInclude + ar-quality gate)
**Countries**: AZ, GE, AM
**Generated**: 2026-05-17T11:17:51.061Z

## Filter thresholds (same as Americas-1A)

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AZ | 5299 | 5028 | **64** | 0 | 1916 | 3047 | 1 | **49** | **15** |
| GE | 5418 | 5337 | **6** | 0 | 65 | 5265 | 1 | **1** | **5** |
| AM | 2320 | 1298 | **9** | 0 | 111 | 1165 | 13 | **6** | **3** |
| **TOTAL** | — | — | **79** | 0 | 2092 | 9477 | 15 | **56** | **23** |

## Collision-watch list (user-specified, Asia-1I kickoff)

User pre-flagged these slugs for explicit collision check:

`baku`, `ganja`, `sumqayit`, `mingachevir`, `lankaran`, `sheki`, `shirvan`, `khirdalan`, `tbilisi`, `batumi`, `kutaisi`, `rustavi`, `zugdidi`, `gori`, `sokhumi`, `yerevan`, `gyumri`, `vanadzor`, `hrazdan`, `ararat`, `armavir`, `kapan`

### Status of watch-list slugs (existing curated + current wave high-tier)

| watch-slug | existing in curated? | wave candidate(s) high-tier | resolution recommendation |
| --- | --- | --- | --- |
| `baku` | `baku` [az] "باكو" | _(not in high-tier)_ | bare slug already owned by az — wave is unaffected |
| `ganja` | _(none — slug is free)_ | az/ganja pop=335600 ✅ | wave candidate claims bare slug (no existing reservation) |
| `sumqayit` | _(none — slug is free)_ | az/sumqayit pop=358675 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `mingachevir` | _(none — slug is free)_ | az/mingachevir pop=106048 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `lankaran` | _(none — slug is free)_ | az/lankaran pop=240300 ✅ | wave candidate claims bare slug (no existing reservation) |
| `sheki` | _(none — slug is free)_ | az/sheki pop=68400 ✅ | wave candidate claims bare slug (no existing reservation) |
| `shirvan` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `khirdalan` | _(none — slug is free)_ | az/khirdalan pop=37949 ✅ | wave candidate claims bare slug (no existing reservation) |
| `tbilisi` | `tbilisi` [ge] "تبليسي" | _(not in high-tier)_ | bare slug already owned by ge — wave is unaffected |
| `batumi` | _(none — slug is free)_ | ge/batumi pop=186949 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `kutaisi` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `rustavi` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `zugdidi` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `gori` | _(none — slug is free)_ | ge/gori pop=41933 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `sokhumi` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `yerevan` | `yerevan` [am] "يريفان" | _(not in high-tier)_ | bare slug already owned by am — wave is unaffected |
| `gyumri` | _(none — slug is free)_ | am/gyumri pop=114667 ✅ | wave candidate claims bare slug (no existing reservation) |
| `vanadzor` | _(none — slug is free)_ | am/vanadzor pop=78100 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `hrazdan` | _(none — slug is free)_ | am/hrazdan pop=49500 ✅ | wave candidate claims bare slug (no existing reservation) |
| `ararat` | _(none — slug is free)_ | _(not in high-tier)_ | not in this wave |
| `armavir` | _(none — slug is free)_ | am/armavir pop=29700 ⚠️ | wave candidate claims bare slug (no existing reservation) |
| `kapan` | _(none — slug is free)_ | am/kapan pop=32900 ✅ | wave candidate claims bare slug (no existing reservation) |

## Strategy E decision: passes-gate vs blocked

* **Passes ar-gate (56)** — ready for `status: approved` flip after collision resolution.
* **Blocked by ar-gate (23)** — manual fix BEFORE approval (Persian/Urdu/Latin/empty Arabic OR collision).

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-asia-1i-summary.md` |
| Arabic-quality detail   | `reports/geodata-asia-1i-arabic-quality-report.md` |
| AZ country report | `reports/az-geodata-import-report.md` |
| GE country report | `reports/ge-geodata-import-report.md` |
| AM country report | `reports/am-geodata-import-report.md` |

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
