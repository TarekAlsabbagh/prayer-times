# Europe-1A — Wave Summary

**Wave**: `CURATED-GEODATA-EUROPE-1A`
**Strategy**: E (Strategy A + ar-quality gate)
**Countries**: GB, IE, FR, BE, NL, LU
**Generated**: 2026-05-15T20:23:32.322Z

## Filter thresholds

* `population ≥ 100,000`
* OR `feature_code ∈ { PPLC, PPLA }` (always include national + 1st-order admin capitals)
* Distance to nearest curated entry **> 3 km** (avoid sub-municipalities)

## Per-country numbers

| Country | raw P-class | normalized | high | medium | low | needs_review | existing | passes-gate | blocked |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| GB | 43712 | 34288 | **86** | 0 | 1068 | 33125 | 9 | **44** | **42** |
| IE | 12159 | 11988 | **3** | 0 | 156 | 11827 | 2 | **2** | **1** |
| FR | 81597 | 80238 | **30** | 0 | 3247 | 76944 | 17 | **19** | **11** |
| BE | 12669 | 12473 | **7** | 0 | 380 | 12085 | 1 | **6** | **1** |
| NL | 7731 | 6980 | **21** | 0 | 826 | 6132 | 1 | **11** | **10** |
| LU | 692 | 641 | **4** | 0 | 22 | 614 | 1 | **2** | **2** |
| **TOTAL** | — | — | **151** | 0 | 5699 | 140727 | 31 | **84** | **67** |

## Strategy E decision: what passes vs. what is blocked

* **Passes ar-gate (84)** — ready for `status: approved` flip once you verify the row.
  These have:
    * clean Arabic name (`wikidata` or `arabic_only` quality);
    * no slug collision (within Europe-1A wave OR against existing curated).
* **Blocked by ar-gate (67)** — need manual fix BEFORE approval.
  Reasons:
    * Arabic name has Persian/Urdu/Latin contamination → fix `candidate.names.ar` in JSON;
    * Slug collision → rename to suggested `slug-{cc}` form before approval.

## Reports produced this wave

| Report | Path |
| --- | --- |
| Wave summary (this file) | `reports/geodata-europe-1a-summary.md` |
| Arabic-quality detail   | `reports/geodata-europe-1a-arabic-quality-report.md` |
| GB country report | `reports/gb-geodata-import-report.md` |
| IE country report | `reports/ie-geodata-import-report.md` |
| FR country report | `reports/fr-geodata-import-report.md` |
| BE country report | `reports/be-geodata-import-report.md` |
| NL country report | `reports/nl-geodata-import-report.md` |
| LU country report | `reports/lu-geodata-import-report.md` |

## Next steps

1. Read this summary + the ar-quality report.
2. Open each per-country report; decide per row.
3. Edit `db/places/candidates/{cc}-geonames-candidates.json`:
    - flip `"status": "approved"` for entries you want;
    - fix `candidate.names.ar` for `mixed_script`/`mixed_latin`/`empty` rows you keep;
    - rename `candidate.slug` to the suggested `slug-{cc}` form for collisions.
4. Reply to the assistant with your decision (approve all / per-country / fix Arabic / exclude / rename).
5. After you approve, Stage 4 (apply_curated_candidates.mjs) merges only the `approved` entries.

**Hard rule**: do NOT modify `db/places/curated-places.json` by hand. All merges go through Stage 4.

## License + Attribution

© GeoNames — licensed CC-BY 4.0. https://www.geonames.org/
