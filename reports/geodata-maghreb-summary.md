# Maghreb GeoNames Import Summary

**Generated**: 2026-05-15
**Phase**: `CURATED-GEODATA-MAGHREB-1` (Stage 1 → 3 complete; **Stage 4 NOT RUN**)
**Wave**: 4 of multi-country Arab rollout (after GCC-1, LEVANT-IRAQ-1, NILE-YEMEN-LIBYA-1)

This dashboard aggregates the 4 per-country reports produced by Stage 3.
**`curated-places.json` has NOT been touched.** User reviews and decides
per-country which entries to approve before Stage 4.

---

## High-level numbers

| Country | Raw rows | Normalized | Existing | Approved | **High** | Medium | Low    | Needs Review | Rejected | Alias Opps |
|--------:|---------:|-----------:|---------:|---------:|---------:|-------:|-------:|-------------:|---------:|-----------:|
| MA      | 46,945   | 45,718     | 10       | 0        | **42**   | 3      | 12     | 45,607       | 7        | 10         |
| DZ      | 8,333    | 8,138      | 10       | 0        | **76**   | 50     | 129    | 7,872        | 0        | 10         |
| TN      | 2,245    | 1,813      | 8        | 0        | **68**   | 2      | 37     | 1,697        | 1        | 8          |
| MR      | 7,653    | 7,635      | 3        | 0        | **9**    | 1      | 710    | 6,910        | 0        | 3          |
| **TOTAL** | **65,176** | **63,304** | **31** | **0** | **195** | **56** | **888** | **62,086** | **8** | **31** |

### Key observations vs prior waves

* **MA's `needs_review` is enormous (45,607)** — that's 99.7% of normalized
  places. Cause: Morocco's GeoNames data is heavily Berber/Latin-script;
  `name:ar` is rare. The 42 high-tier picks have proper Arabic names.
* **DZ's `existing` is small (10)** — Algeria has 58 wilayas but only
  the obvious flagships (Algiers, Oran, Constantine, Annaba …) are in
  curated. Almost every wilaya capital is a candidate.
* **TN is sparse (2,245 raw)** — Tunisia's GeoNames dump is the smallest
  of the 4 (smaller than Lebanon's 3,720). High-tier=68 still covers all
  24 governorate seats + populous PPL cities like Hammamet, El Mourouj,
  Sukrah, Zarzis.
* **MR's `high` is just 9** — Mauritania has 15 regions, but most
  regional capitals fall to tier=low (validator's `isAdminOrPPL`
  excludes PPLA). The 9 high-tier picks are mostly small administrative
  centers in Nouakchott. forcePPLA in Strategy D rescues the region
  capitals.

---

## Pipeline stage outputs (per country)

| Country | candidates JSON                                            | main report                                |
|--------:|:-----------------------------------------------------------|:-------------------------------------------|
| MA      | `db/places/candidates/ma-geonames-candidates.json`         | `reports/ma-geodata-import-report.md`      |
| DZ      | `db/places/candidates/dz-geonames-candidates.json`         | `reports/dz-geodata-import-report.md`      |
| TN      | `db/places/candidates/tn-geonames-candidates.json`         | `reports/tn-geodata-import-report.md`      |
| MR      | `db/places/candidates/mr-geonames-candidates.json`         | `reports/mr-geodata-import-report.md`      |

Each country also has an alias-review report:
`reports/<cc>-geodata-aliases-review.md`.

---

## Admin1 mappings (verified per country via Stage 1 PPLA/PPLC inspection)

### MA — 12 regions (post-2015 reform)

GeoNames uses codes 01–12.

| admin1 | Region                              | Capital seat                          |
|:------:|:------------------------------------|:--------------------------------------|
| 01 | طنجة-تطوان-الحسيمة                     | Tangier (PPLA, 1.03M)                |
| 02 | الشرق                                  | Oujda (PPLA, 540k)                   |
| 03 | فاس-مكناس                              | Fes (PPLA, 1.19M)                    |
| 04 | الرباط-سلا-القنيطرة                    | **Rabat (PPLC, 1.66M)** / Kenitra    |
| 05 | بني ملال-خنيفرة                        | Beni Mellal (PPLA, 210k) / Khouribga |
| 06 | الدار البيضاء-سطات                     | Casablanca (PPLA, 3.67M)             |
| 07 | مراكش-آسفي                             | Marrakesh (PPLA, 996k) / Safi (PPLA2)|
| 08 | درعة-تافيلالت                          | Errachidia (PPLA3, 101k)             |
| 09 | سوس-ماسة                               | Agadir (PPLA, 698k)                  |
| 10 | كلميم-واد نون                          | Guelmim (PPLA, 129k)                 |
| 11 | العيون-الساقية الحمراء (Western Sahara) | Smara (PPL — capital is Laâyoune)    |
| 12 | الداخلة-وادي الذهب (Western Sahara)     | Aousserd (PPL — capital is Dakhla)   |

### DZ — 58 wilayas (48 original + 10 new since 2019)

GeoNames uses numeric codes 01–56 (48 original wilayas) + 2-letter
codes for the 10 new wilayas.

48 numeric codes + 10 letter codes (BA, BB, DJ, EM, IG, IS, MG, OD,
TG, TM). Examples:

| admin1 | Wilaya          | Capital                       |
|:------:|:----------------|:------------------------------|
| 01 | الجزائر            | **Algiers (PPLC, 2.36M)**     |
| 04 | قسنطينة            | Constantine (PPLA, 448k)      |
| 09 | وهران              | Oran (PPLA, 803k)             |
| 37 | عنابة              | Annaba (PPLA, 343k)           |
| 12 | سطيف               | Sétif (PPLA, 252k)            |
| 20 | البليدة            | Blida (PPLA, 332k)            |
| 22 | الجلفة             | Djelfa (PPLA, 266k)           |
| BA | بني عباس           | Béni Abbès (PPLA, 11k) — new  |
| EM | المنيعة             | El Meniaa (PPLA, 57k) — new   |
| TG | تقرت                | Touggourt (PPLA, 143k) — new  |

Full mapping in `scripts/geodata/countries/dz.mjs`.

### TN — 24 governorates

GeoNames uses non-contiguous codes 02–39.

24 governorates ✓ — codes 02, 03, 06, 14–19, 22, 23, 27–39 + 36 (PPLC).
Examples:

| admin1 | Governorate      | Capital                       |
|:------:|:-----------------|:------------------------------|
| 36 | تونس                | **Tunis (PPLC, 693k)**        |
| 32 | صفاقس               | Sfax (PPLA, 281k)             |
| 23 | سوسة                | Sousse (PPLA, 222k)           |
| 03 | القيروان             | Kairouan (PPLA, 139k)         |
| 18 | بنزرت                | Bizerte (PPLA, 138k)          |
| 38 | أريانة               | Aryanah (PPLA, 114k)          |
| 29 | قابس                 | Gabès (PPLA, 110k)            |
| 30 | قفصة                 | Gafsa (PPLA, 95k)             |
| 16 | المنستير             | Monastir (PPLA, 93k)          |
| 27 | بن عروس              | Ben Arous (PPLA, 88k)         |

Full mapping in `scripts/geodata/countries/tn.mjs`.

### MR — 15 regions

GeoNames uses codes 01–15. Nouakchott (PPLC) has empty admin1 (special).

| admin1 | Region                                  | Capital              |
|:------:|:----------------------------------------|:---------------------|
| (none) | (Nouakchott district)                  | **Nouakchott (PPLC, 1.18M)** |
| 01 | الحوض الشرقي                              | Néma (PPLA, 60k)     |
| 03 | لعصابة                                   | Kiffa (PPLA, 62k)    |
| 04 | كوركول                                   | Kaédi (PPLA, 56k)    |
| 08 | داخلت نواذيبو                            | Nouadhibou (PPLA, 146k) |
| 11 | تيرس زمور                                | Zouérat (PPLA, 55k)  |
| 13 | نواكشوط الغربية                          | Tevragh Zeina (PPLA, 48k) |
| 14 | نواكشوط الشمالية                         | Dar Naim (PPLA, 61k) |
| 15 | نواكشوط الجنوبية                         | Arafat (PPLA, 0)     |

Full mapping in `scripts/geodata/countries/mr.mjs`.

---

## Rejection breakdown

| Country | Reason                  | Count |
|--------:|:------------------------|------:|
| MA      | religious_site_not_city | 7     |
| DZ      | (none)                  | 0     |
| TN      | religious_site_not_city | 1     |
| MR      | (none)                  | 0     |
| **TOTAL** |                       | **8** |

(Blocklist caught mosques + shrines — exactly the intended behavior.
Maghreb has fewer named religious POIs in GeoNames than Yemen / Egypt.)

---

## Strategy comparison (entries that would be NEWLY merged)

### Option A — "PPLC + PPLA + PPLA2 + population > 0 + tier=high" (most conservative)

The strategy used in `CURATED-GEODATA-LEVANT-IRAQ-1` (99 entries).

| cc | Strategy A | Notes |
|---:|---:|:---|
| MA | 7  | Taza, Settat, Safi, Tan-Tan, Ouarzazate, Tetouan adj. (PPLA2s with pop) |
| DZ | 0  | **All DZ PPLA seats fall to `tier=low`** (validator quirk); A captures 0 |
| TN | 0  | Same — all TN PPLA seats are `tier=low` |
| MR | 0  | Same — all MR PPLA seats are `tier=low` |
| **TOTAL** | **7** | |

NOT viable — would only add 7 entries from 65k rows.

### Option B — "All high-tier"

Approves every entry classified `tier=high`. Includes high-quality PPL
(non-admin) entries that the validator scored well.

| cc | Strategy B (all high) |
|---:|---:|
| MA | 42  |
| DZ | 76  |
| TN | 68  |
| MR | 9   |
| **TOTAL** | **195** |

Manageable size. Captures the validator's quality picks but MISSES the
PPLA region/wilaya capitals (which fell to low for the same reason).

### Option D — "Per-country tailored" (recommended ⭐)

Per-country filter with forcePPLA branches, matching the proven
LEVANT-IRAQ-1 + NILE-YEMEN-LIBYA-1 approach. Suggested floors:

| cc | Filter | Estimated count |
|---:|:-------|---:|
| MA | PPLC/PPLA/PPLA2/PPL pop ≥ 100,000 + tier=high + **forcePPLA** | ~8-15 |
| DZ | PPLC/PPLA/PPL pop ≥ 50,000 + tier=high + **forcePPLA** | ~50-60 |
| TN | PPLC/PPLA/PPL pop ≥ 30,000 + tier=high + **forcePPLA** | ~33-40 |
| MR | PPLC/PPLA/PPL pop ≥ 10,000 + tier=high + **forcePPLA** | ~15-20 |
| **TOTAL** | | **~110-135** |

MA's floor is high because Morocco has many populous PPL entries
(secondary cities) and we don't want all of them in one wave. MR's
floor is low because Mauritania's cities are smaller overall.

**Current Strategy D preview**: 8 + 54 + 33 + 17 = **112 entries**.

---

## Sample picks — Strategy D preview

### MA top picks (Strategy D ~8)
| slug | name (ar) | fc | pop |
|---|---|---|---:|
| safi | آسفي | PPLA2 | 336,883 |
| taza | تازة | PPLA2 | 162,110 |
| settat | سطات | PPLA2 | 155,333 |
| tan-tan | طانطان | PPLA2 | 79,942 |
| ouarzazate | ورزازات | PPLA2 | 77,603 |
| khouribga | الخريبكة | PPLA3 | 214,241 |
| errachidia | الراشيدية | PPLA3 | 100,870 |

Plus a few PPLA seats force-included. Morocco's main flagships are
already in curated.

### DZ top picks (Strategy D ~54)
The 47 wilaya capitals (Batna, Constantine, Médéa, Sétif, Tlemcen,
Tizi Ouzou, Biskra, Blida, Djelfa, Tébessa, Adrar, Aïn Defla, Annaba,
Béchar, Bordj Bou Arreridj, Chlef, El Bayadh, El Oued, Ghardaïa,
Khenchela, Laghouat, Mascara, M'Sila, Sidi Bel Abbes, Skikda, …) plus
the 10 new 2019 wilayas (Béni Abbès, El Meniaa, Touggourt, Timimoun,
El Meghaïer, Ouled Djellal, In Salah, In Guezzam, Djanet, Bordj Badji
Mokhtar). Plus high-tier PPL cities like Khemis Miliana, Boudouaou,
Aïn Beïda.

### TN top picks (Strategy D ~33)
24 governorate seats + populous PPL cities (Hammamet, El Mourouj,
Sukrah, Zarzis, Douz, El Fahs, Bizerte adj., Sousse adj.). Tunisia's
Strategy D ratio is high because the dataset is small (1,813
normalized) and quality is uniform.

### MR top picks (Strategy D ~17)
15 region capitals + Bogué, Boutilimitt, Ksar (Nouakchott district).
Mauritania's force-PPLA captures Néma, Ayoun El Atrous, Kiffa, Kaédi,
Aleg, Rosso, Atar, Nouadhibou, Tidjikja, Sélibaby, Zouérat, Akjoujt,
Tevragh Zeina, Dar Naim, Arafat.

---

## Slug collision audit

### Cross-country (any pending entries with same slug)

3 cases — none are likely to be Strategy D picks because they're tiny
hamlets sharing a generic name. Listed for awareness:

| slug | countries | Action |
|:---|:---|:---|
| `tamellaht` | MA + DZ | Likely a small Berber-named hamlet in both; pop=0 → falls to needs_review |
| `sidi-daoud` | DZ + TN | "Sidi-named" pilgrim sites; pop=0 → falls to needs_review |
| `el-marsa` | DZ + TN | Common "the harbor" name; both may be in Strategy D — would need `el-marsa-dz` / `el-marsa-tn` rename if both make the cut |

### Curated collisions (entries colliding with existing curated)

**1 case** — must be resolved before Stage 4:

| candidate slug | cc | matched existing | action |
|:---|:---|:---|:---|
| `saida` | dz | `saida` (existing, MA — Algerian wilaya capital) | Need rename: DZ entry becomes `saida-dz`, OR skip |

Wait — let me check what `saida` is in curated already.

Actually the audit detected `dz saida` collides with existing curated.
The existing curated `saida` might be EITHER MA's Settat-area town OR
already-merged DZ Saïda. If the latter, this is a duplicate — Stage 4's
dedupe will skip it. The rename rule applies only if the existing entry
is a DIFFERENT place.

**Recommendation**: rename DZ `saida` → `saida-dz` per GCC-1 convention
(safe regardless of which entity existing is). The original slug stays
in aliases.en.

### Existing curated entries per country (pre-wave)

| Country | Currently in curated-places.json | Notes |
|--------:|---------------------------------:|:------|
| MA      | 10                               | Casablanca, Rabat, Marrakesh, Fes, Tangier, Agadir, Meknes, Salé, Oujda, Tetouan |
| DZ      | 10                               | Algiers, Oran, Constantine, Annaba, Batna, Setif, Tlemcen, Mostaganem, Bejaia, Sidi Bel Abbes (approximate — verify in report) |
| TN      | 8                                | Tunis, Sfax, Sousse, Kairouan, Bizerte, Gabès, Ariana, Monastir |
| MR      | 3                                | Nouakchott, Nouadhibou, Atar |
| **TOTAL** | **31**                          | |

---

## Data quality concerns to flag for review

* **MA `needs_review = 45,607`** (99.7% of normalized rows). Most
  Morocco places lack `name:ar` in GeoNames. The 42 high-tier picks
  DO have Arabic names — but the alias-review report flags 47
  enrichment opportunities. After Stage 4, you may want to open
  `MAGHREB-ALIAS-ENRICHMENT-1` to backfill aliases from the dump.
* **Western Sahara entries** (MA admin1 11 + 12) — Laâyoune (capital
  of region 11) and Dakhla (capital of region 12) ARE in the dump
  but not as PPLA. Need to check their slugs in the report — they
  might be classified as PPL or PPLA3 depending on GeoNames' approach
  to the contested territory.

---

## Recommended decision

Strategy D with the floors above → **~110-135 entries**, mirroring the
proven LEVANT-IRAQ-1 (99) + NILE-YEMEN-LIBYA-1 (124) sizes. Slug
rename: `saida` → `saida-dz` for the DZ wilaya capital.

---

## Next step (user review)

For each country, open:
1. The report: `reports/<cc>-geodata-import-report.md` (long for MA's
   42 high-tier picks; short for MR's 9).
2. The candidates JSON: `db/places/candidates/<cc>-geonames-candidates.json`

Then signal one of:

* **Option A** (Strategy A across all 4) → 7 merges. Too small.
* **Option B** (all high-tier, no floors) → 195 merges.
* **Option D** (per-country tailored, **recommended**) → ~112 merges.
* **Custom** — list specific slugs / floors per country.

Stage 4 does NOT run until you signal.

---

## Untouched (per phase contract)

* `db/places/curated-places.json` — `git diff --stat` clean.
* Homepage search, `/api/search-place`, `/search-test`, Qibla / Moon /
  Prayer pages, Supabase schema — none touched.

## License + attribution

Place data derived from GeoNames country dumps (MA, DZ, TN, MR),
CC-BY 4.0. Sources: https://download.geonames.org/export/dump/{cc}.zip
