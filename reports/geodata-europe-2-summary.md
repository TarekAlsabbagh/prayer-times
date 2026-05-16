# Europe-2 — Wave Summary

**Wave**: `CURATED-GEODATA-EUROPE-2`
**Strategy**: E (Strategy A + ar-quality gate)
**Countries**: DE, AT, CH, IT, DK, SE, NO, FI, IS
**Generated**: 2026-05-16T07:20:59.127Z

## Filter thresholds (same as Europe-1A)

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| DE | 81924 | 75955 | **67** | 0 | 2670 | 73206 | 12 | **47** | **20** |
| AT | 20913 | 20030 | **8** | 0 | 145 | 19876 | 1 | **4** | **4** |
| CH | 13199 | 11423 | **26** | 0 | 225 | 11171 | 1 | **13** | **13** |
| IT | 63013 | 61846 | **25** | 0 | 226 | 61581 | 14 | **22** | **3** |
| DK | 7286 | 7107 | **6** | 0 | 22 | 7078 | 1 | **2** | **4** |
| SE | 28468 | 27961 | **21** | 0 | 415 | 27524 | 1 | **10** | **11** |
| NO | 13815 | 13187 | **17** | 0 | 94 | 13072 | 4 | **6** | **11** |
| FI | 29232 | 24550 | **17** | 0 | 107 | 24425 | 1 | **14** | **3** |
| IS | 117 | 115 | **4** | 0 | 12 | 98 | 1 | **3** | **1** |
| **TOTAL** | — | — | **191** | 0 | 3916 | 238031 | 36 | **121** | **70** |

## Collision-watch list (user-specified, Strategy E §6)

User pre-flagged these slugs for explicit collision check:

`granada`, `cordoba`, `valencia`, `cartagena`, `toledo`, `barcelona`, `sevilla`, `malaga`, `porto`, `braga`, `coimbra`

### Status of watch-list slugs (existing curated + current wave)

| watch-slug | existing in curated? | wave candidate(s) | resolution |
| --- | --- | --- | --- |
| `hamburg` | hamburg [de] "هامبورغ" | _(not in high-tier)_ | bare slug already owned by de → no new claim possible (no conflict) |
| `munich` | munich [de] "ميونخ" | _(not in high-tier)_ | bare slug already owned by de → no new claim possible (no conflict) |
| `frankfurt` | frankfurt [de] "فرانكفورت" | _(not in high-tier)_ | bare slug already owned by de → no new claim possible (no conflict) |
| `cologne` | cologne [de] "كولونيا" | _(not in high-tier)_ | bare slug already owned by de → no new claim possible (no conflict) |
| `dresden` | _(none — slug is free)_ | de/dresden ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `leipzig` | _(none — slug is free)_ | de/leipzig ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `bremen` | _(none — slug is free)_ | de/bremen ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `hannover` | _(none — slug is free)_ | de/hannover ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `dortmund` | _(none — slug is free)_ | de/dortmund ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `essen` | _(none — slug is free)_ | de/essen ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `duisburg` | _(none — slug is free)_ | de/duisburg ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `bochum` | _(none — slug is free)_ | de/bochum ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `salzburg` | _(none — slug is free)_ | at/salzburg ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `graz` | _(none — slug is free)_ | at/graz ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `linz` | _(none — slug is free)_ | at/linz ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `innsbruck` | _(none — slug is free)_ | at/innsbruck ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `zurich` | zurich [ch] "زيورخ" | _(not in high-tier)_ | bare slug already owned by ch → no new claim possible (no conflict) |
| `geneva` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `basel` | _(none — slug is free)_ | ch/basel ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `bern` | _(none — slug is free)_ | ch/bern ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `lausanne` | _(none — slug is free)_ | ch/lausanne ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `palermo` | _(none — slug is free)_ | it/palermo ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `bari` | _(none — slug is free)_ | it/bari ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `catania` | _(none — slug is free)_ | it/catania ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `verona` | _(none — slug is free)_ | it/verona ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `padua` | _(none — slug is free)_ | it/padua ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `trieste` | _(none — slug is free)_ | it/trieste ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `brescia` | _(none — slug is free)_ | it/brescia ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `parma` | _(none — slug is free)_ | it/parma ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `modena` | _(none — slug is free)_ | it/modena ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `prato` | _(none — slug is free)_ | it/prato ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `livorno` | _(none — slug is free)_ | it/livorno ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `ravenna` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `salerno` | _(none — slug is free)_ | it/salerno ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `copenhagen` | copenhagen [dk] "كوبنهاغن" | _(not in high-tier)_ | bare slug already owned by dk → no new claim possible (no conflict) |
| `aarhus` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `odense` | _(none — slug is free)_ | dk/odense ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `aalborg` | _(none — slug is free)_ | dk/aalborg ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `stockholm` | stockholm [se] "ستوكهولم" | _(not in high-tier)_ | bare slug already owned by se → no new claim possible (no conflict) |
| `gothenburg` | _(none — slug is free)_ | se/gothenburg ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `malmo` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `uppsala` | _(none — slug is free)_ | se/uppsala ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `oslo` | oslo [no] "أوسلو" | _(not in high-tier)_ | bare slug already owned by no → no new claim possible (no conflict) |
| `bergen` | _(none — slug is free)_ | no/bergen ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `trondheim` | _(none — slug is free)_ | no/trondheim ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `stavanger` | _(none — slug is free)_ | no/stavanger ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `helsinki` | helsinki [fi] "هلسنكي" | _(not in high-tier)_ | bare slug already owned by fi → no new claim possible (no conflict) |
| `espoo` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `tampere` | _(none — slug is free)_ | fi/tampere ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `vantaa` | _(none — slug is free)_ | fi/vantaa ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `oulu` | _(none — slug is free)_ | fi/oulu ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `turku` | _(none — slug is free)_ | fi/turku ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `reykjavik` | reykjavik [is] "ريكيافيك" | _(not in high-tier)_ | bare slug already owned by is → no new claim possible (no conflict) |

## Strategy E decision: passes-gate vs blocked

* **Passes ar-gate (121)** — ready for `status: approved` flip.
* **Blocked by ar-gate (70)** — manual fix BEFORE approval.

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-europe-2-summary.md` |
| Arabic-quality detail   | `reports/geodata-europe-2-arabic-quality-report.md` |
| DE country report | `reports/de-geodata-import-report.md` |
| AT country report | `reports/at-geodata-import-report.md` |
| CH country report | `reports/ch-geodata-import-report.md` |
| IT country report | `reports/it-geodata-import-report.md` |
| DK country report | `reports/dk-geodata-import-report.md` |
| SE country report | `reports/se-geodata-import-report.md` |
| NO country report | `reports/no-geodata-import-report.md` |
| FI country report | `reports/fi-geodata-import-report.md` |
| IS country report | `reports/is-geodata-import-report.md` |

## Next steps

1. Read this summary + the ar-quality report.
2. Open each per-country report; decide per row.
3. Reply to the assistant: `approve all` / `approve per-country` / `fix Arabic` / `exclude slugs` / `rename slugs`.
4. Assistant flips `status` flags and runs Stage 4 per country.

**Hard rule**: do NOT modify `db/places/curated-places.json` by hand.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
