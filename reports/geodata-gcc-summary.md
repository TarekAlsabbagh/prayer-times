# GCC GeoNames Import Summary

**Generated**: 2026-05-14
**Phase**: `CURATED-GEODATA-GCC-1` (Stage 1 → 3 complete; Stage 4 NOT RUN)
**Wave**: 1 of multi-country Arab rollout

This dashboard aggregates the 5 per-country reports produced by Stage 3
of the pipeline. **`curated-places.json` has NOT been touched.** The user
reviews these reports and decides per-country which entries to approve
before Stage 4 runs.

---

## High-level numbers

| Country | Existing | Approved | High | Medium | Low | Needs Review | Rejected | Alias Opps |
|--------:|---------:|---------:|-----:|-------:|----:|-------------:|---------:|-----------:|
| QA      | 2        | 0        | **15** | **64**   | 86      | 12           | 0        | 2          |
| AE      | 8        | 0        | **19** | **10**   | 55      | 311          | 0        | 8          |
| KW      | 2        | 0        | **10** | **6**    | 52      | 8            | 0        | 2          |
| BH      | 2        | 0        | **8**  | **9**    | 75      | 3            | 0        | 2          |
| OM      | 5        | 0        | **18** | **51**   | 4,624   | 718          | 7        | 5          |
| **TOTAL** | **19** | **0**    | **70** | **140**  | **4,892** | **1,052**  | **7**    | **19**     |

**Combined shortlist (high + medium): 210 candidates** — manageable for
manual review across all 5 countries.

---

## Pipeline stage outputs (per country)

| Country | raw rows | normalized | candidates JSON | report | aliases report |
|--------:|---------:|-----------:|:---|:---|:---|
| QA      | 275      | 179        | `db/places/candidates/qa-geonames-candidates.json` | `reports/qa-geodata-import-report.md` | `reports/qa-geodata-aliases-review.md` |
| AE      | 2,406    | 403        | `ae-geonames-candidates.json` | `ae-geodata-import-report.md` | `ae-geodata-aliases-review.md` |
| KW      | 127      | 78         | `kw-geonames-candidates.json` | `kw-geodata-import-report.md` | `kw-geodata-aliases-review.md` |
| BH      | 124      | 97         | `bh-geonames-candidates.json` | `bh-geodata-import-report.md` | `bh-geodata-aliases-review.md` |
| OM      | 5,997    | 5,423      | `om-geonames-candidates.json` | `om-geodata-import-report.md` | `om-geodata-aliases-review.md` |

---

## Feature-code intake per country (raw P-class breakdown)

| Country | PPLC | PPLA | PPLA2 | PPL   | PPLS | PPLL | PPLX (rejected) | PPLF (rejected) | PPLQ (rejected) | PPLH (rejected) |
|--------:|-----:|-----:|------:|------:|-----:|-----:|----------------:|----------------:|----------------:|----------------:|
| QA      | 1    | 7    | 0     | 171   | 0    | 0    | 81              | 1               | 14              | 0               |
| AE      | 1    | 6    | 0     | 391   | 0    | 5    | 1,983           | 15              | 4               | 1               |
| KW      | 1    | 5    | 0     | 62    | 0    | 10   | 48              | 1               | 0               | 0               |
| BH      | 1    | 0    | 0     | 97    | 0    | 0    | 25              | 0               | 0               | 1               |
| OM      | 1    | 8    | 1     | 5,314 | 0    | 99   | 518             | 9               | 45              | 2               |

(PPLX = section/district — auto-rejected by feature-code filter.
PPLF = farm. PPLQ = abandoned. PPLH = historical.)

---

## Admin1 → region mappings (verified per country)

### QA — 8 municipalities, all confirmed via PPLA/PPLC

| admin1 | Region                       | Capital                |
|:------:|:-----------------------------|:-----------------------|
| 01     | بلدية الدوحة                  | Doha (PPLC)            |
| 04     | بلدية الخور والذخيرة          | Al Khor (PPLA)         |
| 06     | بلدية الريان                  | Ar Rayyan (PPLA)       |
| 08     | بلدية الشمال                  | Madinat ash Shamal (PPLA) |
| 09     | بلدية أم صلال                 | Umm Salal Ali (PPLA)   |
| 10     | بلدية الوكرة                  | Al Wakrah (PPLA)       |
| 13     | بلدية الضعاين                 | Az Za'ayin (PPLA)      |
| 14     | بلدية الشيحانية               | Ash Shihaniyah (PPLA)  |

### AE — 7 emirates, all confirmed

| admin1 | Emirate                           | Capital                |
|:------:|:----------------------------------|:-----------------------|
| 01     | إمارة أبوظبي                       | Abu Dhabi (PPLC)       |
| 02     | إمارة عجمان                        | Ajman (PPLA)           |
| 03     | إمارة دبي                          | Dubai (PPLA)           |
| 04     | إمارة الفجيرة                      | Fujairah (PPLA)        |
| 05     | إمارة رأس الخيمة                   | Ras Al Khaimah (PPLA)  |
| 06     | إمارة الشارقة                      | Sharjah (PPLA)         |
| 07     | إمارة أم القيوين                   | Umm Al Quwain (PPLA)   |

### KW — 6 governorates, all confirmed

| admin1 | Governorate                       | Capital                |
|:------:|:----------------------------------|:-----------------------|
| 02     | محافظة العاصمة                     | Kuwait City (PPLC)     |
| 04     | محافظة الأحمدي                     | Al Ahmadi (PPLA)       |
| 05     | محافظة الجهراء                     | Al Jahra (PPLA)        |
| 07     | محافظة الفروانية                   | Al Farwaniyah (PPLA)   |
| 08     | محافظة حولي                        | Hawalli (PPLA)         |
| 09     | محافظة مبارك الكبير                | Mubarak Al-Kabeer (PPLA) |

⚠️ Note: 33 KW candidates carry admin1='00' (legacy code) — these are
flagged 'unknown_region' in Stage 3.

### BH — only Manama=PPLC directly confirmed; rest are best-guess

| admin1 | Governorate (best-guess)          | Notes                  |
|:------:|:----------------------------------|:-----------------------|
| 16     | محافظة العاصمة                     | Manama (PPLC) ✓ confirmed |
| 15     | محافظة المحرق                      | best-guess             |
| 17     | المحافظة الشمالية                  | best-guess             |
| 18     | المحافظة الجنوبية                  | best-guess             |
| 19     | المحافظة الوسطى (deprecated)       | legacy code (2014 reform) |
| 02 / 05 / 10 / 13 | Legacy codes              | small entry counts     |

⚠️ Bahrain admin1 codes are uncertain because GeoNames mixes legacy
(pre-2014 5-governorate) and current (4-governorate) codes. User
should verify the regionEn / regionAr field on any BH entries
selected for approval.

### OM — 11 governorates, 9 confirmed via PPLA/PPLC, 2 best-guess

| admin1 | Governorate                        | Capital / Notes        |
|:------:|:-----------------------------------|:-----------------------|
| 01     | محافظة الداخلية                    | Nizwa (PPLA) ✓         |
| 02     | محافظة شمال الباطنة (قديم)         | best-guess legacy      |
| 03     | محافظة الوسطى                       | Hayma (PPLA) ✓         |
| 04     | محافظة جنوب الشرقية                 | Sur (PPLA) ✓           |
| 06     | محافظة مسقط                         | Muscat (PPLC) ✓        |
| 07     | محافظة مسندم                        | Khasab (PPLA) ✓        |
| 08     | محافظة ظفار                         | Salalah (PPLA) ✓       |
| 09     | محافظة الظاهرة (قديم)               | best-guess legacy      |
| 10     | محافظة البريمي                      | Al Buraymi (PPLA) ✓    |
| 11     | محافظة شمال الباطنة                 | Sohar (PPLA) ✓         |
| 12     | محافظة شمال الشرقية                 | Ibra (PPLA) ✓          |

---

## Rejection breakdown

| Country | Reason                  | Count |
|--------:|:------------------------|------:|
| OM      | religious_site_not_city | 7     |

All other countries had zero auto-rejections in this batch (no mosques /
shrines / qibla landmarks caught by the blocklist).

---

## Next step (user review)

For each country, open:

1. **The report**: `reports/<cc>-geodata-import-report.md` — read the
   high-tier listing first (small set, ~8-19 entries per country).
2. **The candidates JSON**: `db/places/candidates/<cc>-geonames-candidates.json`
   — edit `"status": "pending"` → `"status": "approved"` for entries
   you want to merge.
3. **Optionally** review the medium-tier examples in the report and
   move some to approved.
4. **Optionally** review needs_review (Latin-only names) and provide
   Arabic translations if you want to keep specific entries.

After review, signal me to run Stage 4 per country. Stage 4 will merge
only `status === 'approved'` entries.

---

## License + attribution

Place data is derived from the GeoNames geographical database,
licensed under Creative Commons Attribution 4.0 (CC-BY 4.0).
Source: https://download.geonames.org/export/dump/{QA,AE,KW,BH,OM}.zip
GeoNames: https://www.geonames.org/

Each merged entry will carry a `sourceId: "geonames:<id>"` field for
traceability and future cross-source dedupe.
