# Europe-1B — Wave Summary

**Wave**: `CURATED-GEODATA-EUROPE-1B`
**Strategy**: E (Strategy A + ar-quality gate)
**Countries**: ES, PT
**Generated**: 2026-05-15T21:20:53.105Z

## Filter thresholds (same as Europe-1A)

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ES | 30893 | 29242 | **44** | 0 | 592 | 28595 | 11 | **35** | **9** |
| PT | 16614 | 16563 | **19** | 0 | 39 | 16498 | 7 | **9** | **10** |
| **TOTAL** | — | — | **63** | 0 | 631 | 45093 | 18 | **44** | **19** |

## Collision-watch list (user-specified, Strategy E §6)

User pre-flagged these slugs for explicit collision check:

`granada`, `cordoba`, `valencia`, `cartagena`, `toledo`, `barcelona`, `sevilla`, `malaga`, `porto`, `braga`, `coimbra`

### Status of watch-list slugs (existing curated + current wave)

| watch-slug | existing in curated? | wave candidate(s) | resolution |
| --- | --- | --- | --- |
| `granada` | granada-es [es] | _(not in high-tier)_ | pre-reserved with `-cc` suffix → bare slug **free** for higher-pop claimant in this wave |
| `cordoba` | cordoba [es] "قرطبة" | _(not in high-tier)_ | bare slug already owned by es → no new claim possible (no conflict) |
| `valencia` | valencia [es] "فالنسيا" | _(not in high-tier)_ | bare slug already owned by es → no new claim possible (no conflict) |
| `cartagena` | _(none — slug is free)_ | es/cartagena ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `toledo` | _(none — slug is free)_ | es/toledo ⚠️ | wave candidate **claims bare slug** (no existing reservation) |
| `barcelona` | barcelona [es] "برشلونة" | _(not in high-tier)_ | bare slug already owned by es → no new claim possible (no conflict) |
| `sevilla` | _(none — slug is free)_ | _(not in high-tier)_ | slug not in this wave — remains free for future waves |
| `seville` | seville [es] "إشبيلية" | _(not in high-tier)_ | bare slug already owned by es → no new claim possible (no conflict) |
| `malaga` | malaga [es] "مالقة" | _(not in high-tier)_ | bare slug already owned by es → no new claim possible (no conflict) |
| `porto` | porto [pt] "بورتو" | _(not in high-tier)_ | bare slug already owned by pt → no new claim possible (no conflict) |
| `braga` | _(none — slug is free)_ | pt/braga ✅ | wave candidate **claims bare slug** (no existing reservation) |
| `coimbra` | _(none — slug is free)_ | pt/coimbra ✅ | wave candidate **claims bare slug** (no existing reservation) |

## Strategy E decision: passes-gate vs blocked

* **Passes ar-gate (44)** — ready for `status: approved` flip.
* **Blocked by ar-gate (19)** — manual fix BEFORE approval.

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-europe-1b-summary.md` |
| Arabic-quality detail   | `reports/geodata-europe-1b-arabic-quality-report.md` |
| ES country report | `reports/es-geodata-import-report.md` |
| PT country report | `reports/pt-geodata-import-report.md` |

## Next steps

1. Read this summary + the ar-quality report.
2. Open each per-country report; decide per row.
3. Reply to the assistant: `approve all` / `approve per-country` / `fix Arabic` / `exclude slugs` / `rename slugs`.
4. Assistant flips `status` flags and runs Stage 4 per country.

**Hard rule**: do NOT modify `db/places/curated-places.json` by hand.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
