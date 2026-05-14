# Levant + Iraq GeoNames Import Summary

**Generated**: 2026-05-14
**Phase**: `CURATED-GEODATA-LEVANT-IRAQ-1` (Stage 1 → 3 complete; Stage 4 NOT RUN)
**Wave**: 2 of multi-country Arab rollout (after GCC-1)

This dashboard aggregates the 5 per-country reports produced by Stage 3.
**`curated-places.json` has NOT been touched.** User reviews and decides
per-country which entries to approve before Stage 4.

---

## High-level numbers

| Country | Existing | Approved | **High** | Medium | Low | Needs Review | Rejected | Alias Opps |
|--------:|---------:|---------:|---------:|-------:|----:|-------------:|---------:|-----------:|
| SY      | 22       | 0        | **278**  | 1,454  | 7,882 | 1,166      | 7        | 22         |
| IQ      | 19       | 0        | **131**  | 4,229  | 13,833 | 3,067     | 6        | 19         |
| JO      | 4        | 0        | **120**  | 93     | 983   | 117        | 1        | 4          |
| LB      | 10       | 0        | **35**   | 233    | 1,599 | 1,433      | 3        | 10         |
| PS      | 9        | 0        | **422**  | 4      | 198   | 204        | 0        | 9          |
| **TOTAL** | **64** | **0**    | **986**  | **6,013** | **24,495** | **5,987** | **17** | **64**   |

**⚠️ High-tier shortlist (986)** is significantly larger than GCC's 70.
Two factors:
* This wave's countries have denser admin structures (SY has PPLA3
  markaz-level seats; IQ has 82 qadi-PPLA2; JO has PPLA3 sub-districts).
* PS classifies almost everything as PPLA-level town in West Bank (422!).

You will likely want to **sub-filter** rather than approve all 986.
Recommended review strategies (in priority order):

1. **Triage by population** — only ~50-100 entries per country actually
   have population data. Approve those first.
2. **Triage by feature code** — PPLC + PPLA = capital tier (always
   approve); PPLA2 = governorate seats (usually approve); PPLA3+ =
   smaller admin units (selective).
3. **Triage by Arabic name quality** — those with multiple aliases
   (qScore boost) tend to be the most-searched.

---

## Pipeline stage outputs (per country)

| Country | raw rows | normalized | candidates JSON | report |
|--------:|---------:|-----------:|:---|:---|
| SY      | 11,741   | 10,809     | `db/places/candidates/sy-geonames-candidates.json` | `reports/sy-geodata-import-report.md` |
| IQ      | 23,823   | 21,285     | `iq-geonames-candidates.json` | `iq-geodata-import-report.md` |
| JO      | 1,756    | 1,318      | `jo-geonames-candidates.json` | `jo-geodata-import-report.md` |
| LB      | 3,720    | 3,313      | `lb-geonames-candidates.json` | `lb-geodata-import-report.md` |
| PS      | 1,269    | 837        | `ps-geonames-candidates.json` | `ps-geodata-import-report.md` |

---

## Admin1 mappings (verified per country)

### SY — 14 governorates, all confirmed

| admin1 | Governorate           | Capital seat                |
|:------:|:----------------------|:----------------------------|
| 01 | الحسكة                  | Al Hasakah (PPLA)               |
| 02 | اللاذقية                | Latakia (PPLA)                  |
| 03 | القنيطرة                | Al Qunaytirah (PPLA)            |
| 04 | الرقة                   | Ar Raqqah (PPLA)                |
| 05 | السويداء                | As-Suwayda (PPLA)               |
| 06 | درعا                    | Dar'a (PPLA)                    |
| 07 | دير الزور               | Deir ez-Zor (PPLA)              |
| 08 | ريف دمشق                | (Damascus suburbs — no PPLA capital, multiple PPLA2) |
| 09 | حلب                     | Aleppo (PPLA)                   |
| 10 | حماة                    | Hama (PPLA)                     |
| 11 | حمص                     | Homs (PPLA)                     |
| 12 | إدلب                    | Idlib (PPLA)                    |
| 13 | دمشق                    | Damascus (PPLC)                 |
| 14 | طرطوس                   | Tartus (PPLA)                   |

### IQ — 18 governorates, all confirmed

| admin1 | Governorate           | Capital seat                |
|:------:|:----------------------|:----------------------------|
| 01 | الأنبار                 | Ramadi (PPLA)                   |
| 02 | البصرة                  | Basrah (PPLA)                   |
| 03 | المثنى                  | As Samawah (PPLA)               |
| 04 | القادسية                | Al Diwaniyah (PPLA)             |
| 05 | السليمانية              | Sulaymaniyah (PPLA)             |
| 06 | بابل                    | Al Hillah (PPLA)                |
| 07 | بغداد                   | Baghdad (PPLC)                  |
| 08 | دهوك                    | Dihok (PPLA)                    |
| 09 | ذي قار                  | Nasiriyah (PPLA)                |
| 10 | ديالى                   | Baqubah (PPLA)                  |
| 11 | أربيل                   | Erbil (PPLA)                    |
| 12 | كربلاء                  | Karbala (PPLA)                  |
| 13 | كركوك                   | Kirkuk (PPLA)                   |
| 14 | ميسان                   | Al 'Amarah (PPLA)               |
| 15 | نينوى                   | Mosul (PPLA)                    |
| 16 | واسط                    | Al-Kut (PPLA)                   |
| 17 | النجف                   | Najaf (PPLA)                    |
| 18 | صلاح الدين              | Tikrit (PPLA)                   |

### JO — 12 governorates, all confirmed

| admin1 | Governorate                | Capital seat                |
|:------:|:----------------------------|:----------------------------|
| 02 | البلقاء                 | As Salt (PPLA)                  |
| 09 | الكرك                    | Karak City (PPLA)               |
| 12 | الطفيلة                 | At Tafilah (PPLA)               |
| 15 | المفرق                  | Mafraq (PPLA)                   |
| 16 | العاصمة (Amman)          | Amman (PPLC)                    |
| 17 | الزرقاء                 | Zarqa (PPLA)                    |
| 18 | إربد                    | Irbid (PPLA)                    |
| 19 | معان                    | Ma'an (PPLA)                    |
| 20 | عجلون                   | 'Ajlun (PPLA)                   |
| 21 | العقبة                  | Aqaba (PPLA)                    |
| 22 | جرش                     | Jarash (PPLA)                   |
| 23 | مادبا                   | Madaba (PPLA)                   |

### LB — 8 governorates, all confirmed

| admin1 | Governorate                | Capital seat                |
|:------:|:----------------------------|:----------------------------|
| 04 | بيروت                    | Beirut (PPLC)                   |
| 05 | جبل لبنان                | Baabda (PPLA)                   |
| 06 | الجنوب                   | Sidon (PPLA)                    |
| 07 | النبطية                  | Nabatiye (PPLA)                 |
| 08 | البقاع                   | Zahle (PPLA)                    |
| 09 | الشمال                   | Tripoli (PPLA)                  |
| 10 | عكار                     | Halba (PPLA)                    |
| 11 | بعلبك-الهرمل             | Baalbek (PPLA)                  |

### PS — Gaza Strip + West Bank

| admin1 | Region                    | Notes                       |
|:------:|:--------------------------|:----------------------------|
| GZ  | قطاع غزة                | Gaza (PPLA), Khan Yunis, Rafah, Deir al-Balah |
| WE  | الضفة الغربية           | Hebron, Bethlehem, Nablus, Tubas, Jericho (PPLA) |

GeoNames uses non-numeric codes (GZ/WE) for Palestine — a quirk.

---

## Rejection breakdown

| Country | Reason                  | Count |
|--------:|:------------------------|------:|
| SY      | religious_site_not_city | 7     |
| IQ      | religious_site_not_city | 6     |
| JO      | religious_site_not_city | 1     |
| LB      | religious_site_not_city | 3     |
| PS      | (none)                  | 0     |
| **TOTAL** |                       | **17** |

(Blocklist caught mosques, shrines, and qibla-related landmarks across
the 5 countries — exactly the intended behavior.)

---

## Recommended review strategy

Given the unusually large shortlist (986 high-tier vs 70 for GCC),
suggest the user picks a **tighter sub-filter** rather than approving
all high. Three practical options:

### Option A — "Population + Capital tier" (most conservative, ~80-150 entries)
Approve only entries where:
* `feature_code` ∈ {PPLC, PPLA, PPLA2}, AND
* `population` > 0 (any value)

This excludes PPLA3/PPLA4 markaz seats and entries without population data.

### Option B — "Capital tier" (medium, ~250-400 entries)
Approve all PPLC + PPLA + PPLA2 regardless of population (since being
listed at this admin level in GeoNames implies it's a real
governorate/qadi center).

### Option C — "All high-tier" (broadest, 986 entries)
Approve everything in the high-tier shortlist. Manageable only if you
trust the qScore ≥ 80 filter; review time would be 1-2 hours.

The user's call — strategies A and B are recommended for a first wave.
Wave 2.1 / 2.2 sub-phases can pick up more later.

---

## Next step (user review)

For each country, open:

1. The report: `reports/<cc>-geodata-import-report.md` — read the
   high-tier listing (note: SY/IQ/PS lists are LONG).
2. The candidates JSON: `db/places/candidates/<cc>-geonames-candidates.json`
   — edit `"status": "pending"` → `"status": "approved"` for entries
   you want to merge.

After review, signal me which sub-filter strategy (A/B/C) or specific
slug lists per country, and Stage 4 will merge only the approved entries.

---

## License + attribution

Place data derived from the GeoNames geographical database, licensed
under Creative Commons Attribution 4.0 (CC-BY 4.0).
Source: https://download.geonames.org/export/dump/{SY,IQ,JO,LB,PS}.zip
GeoNames: https://www.geonames.org/
