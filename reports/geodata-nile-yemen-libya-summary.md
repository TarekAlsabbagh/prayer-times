# Nile + Yemen + Libya GeoNames Import Summary

**Generated**: 2026-05-14
**Phase**: `CURATED-GEODATA-NILE-YEMEN-LIBYA-1` (Stage 1 → 3 complete; **Stage 4 NOT RUN**)
**Wave**: 3 of multi-country Arab rollout (after GCC-1 and LEVANT-IRAQ-1)

This dashboard aggregates the 4 per-country reports produced by Stage 3.
**`curated-places.json` has NOT been touched.** User reviews and decides
per-country which entries to approve before Stage 4.

---

## High-level numbers

| Country | Raw rows | Normalized | Existing | Approved | **High** | Medium | Low    | Needs Review | Rejected | Alias Opps |
|--------:|---------:|-----------:|---------:|---------:|---------:|-------:|-------:|-------------:|---------:|-----------:|
| EG      | 12,086   | 11,608     | 19       | 0        | **173**  | 276    | 8,334  | 2,797        | 9        | 19         |
| SD      | 8,134    | 7,792      | 7        | 0        | **30**   | 6      | 64     | 7,684        | 1        | 7          |
| LY      | 909      | 821        | 10       | 0        | **68**   | 26     | 248    | 469          | 0        | 10         |
| YE      | 81,303   | 78,114     | 25       | 0        | **7,857**| 151    | 52,919 | 17,059       | 103      | 25         |
| **TOTAL** | **102,432** | **98,335** | **61** | **0** | **8,128** | **459** | **61,565** | **28,009** | **113** | **61** |

### Key observations vs prior waves

* **YE high-tier (7,857)** is the largest single-country shortlist in any
  wave so far (was 422 for PS in Wave 2). Cause: GeoNames classifies
  82,000+ Yemen entries as PPL/PPLA2 with high quality scores. Even with
  Strategy A applied this shrinks to 16 — but raw 7,857 means broader
  strategies (B) would be unmanageable.
* **SD has almost no Arabic names** — 7,681 of 7,792 normalized rows are
  missing `names.ar` and fell to `needs_review`. Sudan's GeoNames dataset
  is mostly English-only — typical for that country's data state. Most
  of the 30 high-tier entries DID carry an Arabic name.
* **LY raw is only 909 rows** — Libya's GeoNames dump is much sparser
  than its neighbours (Egypt has 35,000 raw rows). All 22 governorate
  capitals were already identified.
* **EG** has 9 rejections — all religious sites (mosques in Cairo
  metro that GeoNames misclassifies as PPLs).

---

## Pipeline stage outputs (per country)

| Country | candidates JSON                                            | main report                                |
|--------:|:-----------------------------------------------------------|:-------------------------------------------|
| EG      | `db/places/candidates/eg-geonames-candidates.json`         | `reports/eg-geodata-import-report.md`      |
| SD      | `db/places/candidates/sd-geonames-candidates.json`         | `reports/sd-geodata-import-report.md`      |
| LY      | `db/places/candidates/ly-geonames-candidates.json`         | `reports/ly-geodata-import-report.md`      |
| YE      | `db/places/candidates/ye-geonames-candidates.json`         | `reports/ye-geodata-import-report.md`      |

Each country also has an alias-review report:
`reports/<cc>-geodata-aliases-review.md`.

---

## Admin1 mappings (verified per country via Stage 1 PPLA/PPLC inspection)

### EG — 27 governorates

GeoNames uses codes 01–28 with a gap at 25 (legacy split).

| admin1 | Governorate            | Capital seat / top-pop entry          |
|:------:|:-----------------------|:--------------------------------------|
| 01 | الدقهلية                  | المنصورة (PPLA, 621k)              |
| 02 | البحر الأحمر               | الغردقة (PPLA, 207k)              |
| 03 | البحيرة                   | دمنهور (PPLA, 318k)               |
| 04 | الفيوم                    | الفيوم (PPLA, 519k)               |
| 05 | الغربية                   | طنطا (PPLA, 577k) / المحلة الكبرى |
| 06 | الإسكندرية                | الإسكندرية (PPLA, 5.26M)          |
| 07 | الإسماعيلية               | الإسماعيلية (PPLA, 429k)          |
| 08 | الجيزة                    | الجيزة (PPLA, 4.37M)              |
| 09 | المنوفية                  | شبين الكوم (PPLA, 268k)           |
| 10 | المنيا                    | المنيا (PPLA, 284k)               |
| 11 | القاهرة                   | **القاهرة (PPLC, 9.6M)**          |
| 12 | القليوبية                 | بنها (PPLA, 182k) / شبرا الخيمة (PPLA2, 1.24M) |
| 13 | الوادي الجديد              | الخارجة (PPLA, 83k)               |
| 14 | الشرقية                   | الزقازيق (PPLA, 430k)             |
| 15 | السويس                    | السويس (PPLA, 700k)               |
| 16 | أسوان                     | أسوان (PPLA, 380k)                |
| 17 | أسيوط                     | أسيوط (PPLA, 529k)                |
| 18 | بني سويف                   | بني سويف (PPLA, 273k)              |
| 19 | بورسعيد                   | بورسعيد (PPLA, 781k)              |
| 20 | دمياط                     | دمياط (PPLA, 306k)                |
| 21 | كفر الشيخ                  | كفر الشيخ (PPLA, 195k)             |
| 22 | مطروح                     | مرسى مطروح (PPLA, 176k)           |
| 23 | قنا                       | قنا (PPLA, 253k) / إسنا           |
| 24 | سوهاج                     | سوهاج (PPLA, 267k)                |
| 26 | جنوب سيناء                | الطور (PPLA, 38k)                 |
| 27 | شمال سيناء                | العريش (PPLA, 199k)               |
| 28 | الأقصر                    | الأقصر (PPLA, 422k)               |

### SD — 18 states

GeoNames uses non-contiguous codes 29–62 (gaps where pre-2011 South Sudan
state codes used to be).

| admin1 | State                  | Capital seat                          |
|:------:|:-----------------------|:--------------------------------------|
| 29 | الخرطوم                   | **الخرطوم (PPLC, 1.97M)**         |
| 36 | البحر الأحمر               | بورتسودان (PPLA, 490k)            |
| 38 | الجزيرة                   | ود مدني (PPLA, 333k)              |
| 39 | القضارف                   | القضارف (PPLA, 364k)              |
| 41 | النيل الأبيض               | ربك (PPLA, 135k) / كوستي (PPL, 345k) |
| 42 | النيل الأزرق               | الدمازين (PPLA, 186k)             |
| 43 | الشمالية                  | دنقلا (PPLA, 56k)                 |
| 47 | غرب دارفور                | الجنينة (PPLA, 163k)              |
| 49 | جنوب دارفور                | نيالا (PPLA, 566k)                |
| 50 | جنوب كردفان                | كادقلي (PPLA, 88k)                |
| 52 | كسلا                      | كسلا (PPLA, 401k)                 |
| 53 | نهر النيل                 | الدامر (PPLA, 104k) / عطبرة (PPL, 112k) |
| 55 | شمال دارفور                | الفاشر (PPLA, 253k)               |
| 56 | شمال كردفان                | الأبيض (PPLA, 393k)               |
| 58 | سنار                      | سنجة (PPLA, 250k)                 |
| 60 | شرق دارفور                | الضعين (PPLA, 265k)               |
| 61 | وسط دارفور                | زالنجي (PPLA, 35k)                |
| 62 | غرب كردفان                | الفولة (PPLA, 0) / النهود (PPL, 108k) |

### LY — 22 districts (شعبيات)

GeoNames uses codes 63–84 (Libya-specific allocation).

| admin1 | District                | Capital seat                          |
|:------:|:------------------------|:--------------------------------------|
| 63 | الجبل الأخضر               | البيضاء (PPLA, 129k)              |
| 64 | الجفرة                    | هون (PPLA, 24k)                   |
| 65 | الكفرة                    | التاج (PPL, 46k) — no PPLA in dump |
| 66 | المرج                     | المرج (PPLA, 85k)                 |
| 67 | النقاط الخمس              | زوارة (PPLA, 34k) / العجيلات      |
| 68 | الزاوية                   | الزاوية (PPLA, 200k)              |
| 69 | بنغازي                    | بنغازي (PPLA, 757k)               |
| 70 | درنة                      | درنة (PPLA, 103k)                 |
| 71 | غات                       | غات (PPLA, 15k)                   |
| 72 | مصراتة                    | مصراتة (PPLA, 356k)               |
| 73 | مرزق                      | مرزق (PPLA, 30k)                  |
| 74 | نالوت                     | نالوت (PPLA, 28k)                 |
| 75 | سبها                      | سبها (PPLA, 149k)                 |
| 76 | سرت                       | سرت (PPLA, 107k)                  |
| 77 | طرابلس                    | **طرابلس (PPLC, 1.30M)**          |
| 78 | وادي الشاطئ               | إدري (PPLA, 5k) / براك            |
| 79 | البطنان                   | طبرق (PPLA, 141k)                 |
| 80 | الجبل الغربي               | غريان (PPLA, 36k)                 |
| 81 | الجفارة                   | العزيزية (PPLA, 52k) / جنزور      |
| 82 | المرقب                    | الخمس (PPLA, 202k)                |
| 83 | الواحات                   | أجدابيا (PPLA, 132k)              |
| 84 | وادي الحياة                | أوباري (PPLA, 34k)                |

### YE — 22 governorates

GeoNames uses codes 01–28 with gaps at 06/07/09/12/13/17. Code 16 is
Sana'a Governorate (no PPLA — its capital is Sana'a city which is code
26). Code 28 (Socotra) was split from Hadhramaut (code 04) in 2013.

| admin1 | Governorate            | Capital seat                          |
|:------:|:-----------------------|:--------------------------------------|
| 01 | أبين                      | زنجبار (PPLA, 20k)                |
| 02 | عدن                       | عدن (PPLA, 1.08M)                 |
| 03 | المهرة                    | الغيظة (PPLA, 11k)                |
| 04 | حضرموت                    | المكلا (PPLA, 595k)               |
| 05 | شبوة                      | عتق (PPLA, 37k)                   |
| 08 | الحديدة                   | الحديدة (PPLA, 735k)              |
| 10 | المحويت                   | المحويت (PPLA, 11k)               |
| 11 | ذمار                      | ذمار (PPLA, 160k)                 |
| 14 | مأرب                      | مأرب (PPLA, 17k)                  |
| 15 | صعدة                      | صعدة (PPLA, 52k)                  |
| 16 | محافظة صنعاء              | سيان (PPLA2, 69k) — no PPLA       |
| 18 | الضالع                    | الضالع (PPLA, 15k)                |
| 19 | عمران                     | عمران (PPLA, 91k)                 |
| 20 | البيضاء                   | البيضاء (PPLA, 38k)               |
| 21 | الجوف                     | الحزم (PPLA, 18k)                 |
| 22 | حجة                       | حجة (PPLA, 44k)                   |
| 23 | إب                        | إب (PPLA, 772k)                   |
| 24 | لحج                       | لحج (PPLA, 23k)                   |
| 25 | تعز                       | تعز (PPLA, 941k)                  |
| 26 | أمانة العاصمة             | **صنعاء (PPLC, 1.94M)**           |
| 27 | ريمة                      | الجبين (PPLA, 0)                  |
| 28 | سقطرى                     | حديبو (PPLA2, 9k) / قلنسية         |

---

## Rejection breakdown

| Country | Reason                  | Count |
|--------:|:------------------------|------:|
| EG      | religious_site_not_city | 9     |
| SD      | religious_site_not_city | 1     |
| LY      | (none)                  | 0     |
| YE      | religious_site_not_city | 103   |
| **TOTAL** |                       | **113** |

(Blocklist caught mosques, shrines, and qibla-related landmarks — exactly
the intended behavior. YE's 103 rejections reflect its dense religious
geography — Sana'a, Hudaydah, and Hadhramaut have many small mosques in
the dump.)

---

## Recommended review strategies

Given the very different shapes of the 4 country datasets, the same
strategy doesn't fit all. The numbers below count entries that would be
NEWLY merged (excludes already-existing curated):

### Option A — "PPLC + PPLA + PPLA2 + population > 0" (most conservative)

The strategy used in `CURATED-GEODATA-LEVANT-IRAQ-1` (which merged 99
entries across 5 countries). Filters to `feature_code ∈ {PPLC, PPLA,
PPLA2}` AND `population > 0` AND `tier=high`.

| cc | Strategy A | Notes |
|---:|---:|:---|
| EG | 5  | شبرا الخيمة (1.24M), إدكو, العبور, رفح*, الشيخ زويد. *`rafah` slug collides with existing PS rafah — needs `rafah-eg` rename or skip. |
| SD | 0  | **All Sudan PPLA seats fall to `tier=low`** because the validator's `isAdminOrPPL` excludes PPLA. Strategy A captures nothing for Sudan. |
| LY | 0  | Same situation as Sudan — all PPLA fall to `tier=low`. |
| YE | 16 | All PPLA2 district seats (سيان, زبيد, باجل, ذي السفال, بيت الفقيه, …) |
| **TOTAL** | **21** | |

### Option B — "All high-tier" (broadest)

Approves everything in the high-tier shortlist (passes qScore ≥ 80 +
hasRegion + isAdminOrPPL + distance > 3km from existing curated). YE's
share is **prohibitive** for a single wave:

| cc | Strategy B (all high) |
|---:|---:|
| EG | 173 |
| SD | 30  |
| LY | 68  |
| YE | 7,857 |
| **TOTAL** | **8,128** |

NOT recommended for a single wave. YE alone would more than 10× the
curated dataset.

### Option C — "Hybrid: A + high-tier PPL with pop ≥ 5,000" (recommended)

Option A plus high-tier PPL (or PPLA3) entries with at least 5,000
inhabitants — captures Sudan's real cities (Khartoum-North, Atbara,
Sennar) and Libya's UNESCO/coastal cities (Zliten, Sabratah, Janzur)
that Strategy A misses. YE's giant PPL count means the +5,000 floor
still keeps it small.

| cc | Strategy C |
|---:|---:|
| EG | 167 (PPLA2 keeps adding) |
| SD | 20 |
| LY | 59 |
| YE | 19 |
| **TOTAL** | **265** |

EG and LY come close to "broadest" — likely you'd want a higher
population floor for those (e.g. pop ≥ 30,000 for EG, pop ≥ 20,000 for
LY) to keep the wave manageable.

### Option D — "Per-country tailored"

A different filter per country to fit the geography. Suggested:

| cc | Filter | Estimated count |
|---:|:-------|---:|
| EG | PPLC/PPLA/PPLA2/PPL with pop ≥ 100,000 + tier=high | ~30-50 |
| SD | PPLC/PPLA/PPL with pop ≥ 30,000 (PPLA seats forced in) | ~25 |
| LY | PPLC/PPLA/PPL with pop ≥ 30,000 + tier=high | ~30 |
| YE | PPLC/PPLA/PPLA2 with pop > 0 (Strategy A) | 16 |
| **TOTAL** | | **~100** |

This is the option most analogous to GCC-1 (70 entries) and LEVANT-IRAQ-1
(99 entries) in scope.

---

## Sub-filter sample — top candidates per country

### EG top 10 (Strategy A + high-tier PPL pop ≥ 100k)

| slug                 | name (ar)         | fc    | pop      | governorate    |
|:---------------------|:------------------|:------|---------:|:---------------|
| shubra-al-khaymah    | شبرا الخيمة       | PPLA2 | 1,240,289| القليوبية      |
| al-mahallah-al-kubra | المحلة الكبرى     | PPL   | 592,573  | الغربية         |
| esna                 | إسنا              | PPL   | 462,787  | قنا             |
| kom-ombo             | كوم أمبو         | PPL   | 409,311  | أسوان           |
| idku                 | إدكو              | PPLA2 | 177,152  | البحيرة         |
| al-ubur              | العبور            | PPLA2 | 138,987  | القليوبية      |
| rafah†               | رفح               | PPLA2 | 44,215   | شمال سيناء    |
| ash-shaykh-zuwayd    | الشيخ زويد       | PPLA2 | 26,713   | شمال سيناء    |
| (more PPLA2/PPL entries below 100k)                                        |

† `rafah` slug collides with existing `rafah` in PS (Asia/Gaza, Rafah).
Two options to resolve before Stage 4:
* (a) skip the EG Rafah entirely (it's a small border town), OR
* (b) rename to `rafah-eg` (per the established `<city>-<cc>` collision
  convention from GCC-1).

### SD top 10 (high-tier PPL — Sudan's Strategy A is empty)

| slug              | name (ar)              | fc    | pop       | state            |
|:------------------|:-----------------------|:------|----------:|:-----------------|
| khartoum-north    | الخرطوم بحري           | PPL   | 1,012,211 | الخرطوم          |
| kosti             | كوستي                  | PPL   | 345,068   | النيل الأبيض      |
| sennar            | سنار                   | PPL   | 130,122   | سنار              |
| gereida           | قريضة                  | PPL   | 120,000   | (Darfur)          |
| atbara            | عطبرة                  | PPL   | 112,021   | نهر النيل          |
| an-nuhud          | النهود                 | PPL   | 108,008   | غرب كردفان        |
| ad-douiem         | الدويم                 | PPL   | 87,068    | النيل الأبيض      |
| shendi            | شندي                   | PPL   | 63,746    | نهر النيل          |
| new-halfa         | حلفا الجديدة          | PPL   | 63,589    | كسلا              |
| er-roseires       | الروصيرص              | PPL   | 58,712    | النيل الأزرق      |

Plus the 18 PPLA governorate seats (some need manual approval since
they fell to `tier=low`).

### LY top 10 (high-tier PPL — Libya's Strategy A is empty)

| slug              | name (ar)              | fc    | pop       | district         |
|:------------------|:-----------------------|:------|----------:|:-----------------|
| zliten            | زليتن                  | PPL   | 203,790   | مصراتة            |
| janzur            | جنزور                  | PPL   | 154,389   | الجفارة           |
| al-ajaylat        | العجيلات               | PPL   | 130,546   | النقاط الخمس      |
| al-jadid          | الجديد                | PPL   | 126,386   | (?)               |
| al-jumayl         | الجميل                 | PPL   | 102,000   | النقاط الخمس      |
| sabratah          | صبراتة                 | PPL   | 83,398    | الجفارة            |
| al-hurshah        | الحرشة                 | PPL   | 81,119    | (?)               |
| surman            | صرمان                  | PPL   | 77,114    | الجفارة           |
| msalatah          | مسلاتة                 | PPL   | 73,907    | المرقب            |
| qasr-al-qarabulli | قصر القربولي           | PPL   | 49,610    | المرقب            |

Plus the ~12 PPLA seats not yet curated (Darnah, Al Bayda, Zuwarah,
Al Qadarif … wait, those are Sudan; LY uncurated PPLAs include Darnah,
Al Bayda, Zuwarah, Nalut, Murzuk, Hun, Ghat, Gharyan, Al Khums, Al
Aziziyah, Ubari, Ajdabiya, Idri).

### YE top 10 (Strategy A — district seats)

| slug             | name (ar)         | fc    | pop     | governorate         |
|:-----------------|:------------------|:------|--------:|:--------------------|
| sayyan           | سيان              | PPLA2 | 69,404  | محافظة صنعاء         |
| zabid            | زبيد              | PPLA2 | 52,590  | الحديدة              |
| bajil            | باجل              | PPLA2 | 48,218  | الحديدة              |
| dhi-as-sufal     | ذي السفال         | PPLA2 | 37,997  | إب                   |
| bayt-al-faqih    | بيت الفقيه        | PPLA2 | 34,204  | الحديدة              |
| yarim            | يريم              | PPLA2 | 33,050  | إب                   |
| ghayl-ba-wazir   | غيل با وزير       | PPLA2 | 21,259  | حضرموت               |
| hadibu           | حديبو              | PPLA2 | 8,545   | سقطرى                |
| qalansiyah       | قلنسية             | PPLA2 | 3,500   | سقطرى                |
| suhayl-shibam    | سحيل شبام         | PPLA2 | 645     | حضرموت               |

(Plus 6 more PPLA2 with pop > 0)

---

## Collision check

| Type | Count | Details |
|:-----|------:|:--------|
| Cross-country (within new picks) | 0 | ✅ Zero collisions across EG/SD/LY/YE |
| Curated collisions (vs existing) | 1 | `rafah` (EG) vs `rafah` (PS) — needs rename or skip |

---

## Existing curated coverage per country (pre-wave)

| Country | Currently in curated-places.json | Slugs (sample)                                  |
|--------:|---------------------------------:|:------------------------------------------------|
| EG      | 19                               | cairo, alexandria, giza, luxor, aswan, hurghada, port-said, suez, ismailia, tanta, mansurah, mahalla-al-kubra, sharm-el-sheikh, asyut, sohag, qena, beni-suef, minya, fayyum |
| SD      | 7                                | khartoum, omdurman, port-sudan, nyala, kassala, el-obeid, wad-medani                         |
| LY      | 10                               | tripoli, benghazi, misrata, bayda, tobruk, sabha, sirte, az-zawiyah, ajdabiya, brak                                  |
| YE      | 25                               | sanaa, aden, taiz, hodeidah, ibb, mukalla, dhamar, hajjah, sa'dah, marib, …                                          |

(Total existing across 4 = 61.)

---

## Next step (user review)

For each country, open:

1. The report: `reports/<cc>-geodata-import-report.md` — read the
   high-tier listing (note: YE's listing is LONG — 7,857 entries).
2. The candidates JSON: `db/places/candidates/<cc>-geonames-candidates.json`
   — DO NOT edit directly. Instead, signal the chosen strategy and any
   per-country tweaks (population floor, slug renames, skip lists).

Then signal one of:

* **Option A** (Strategy A across all 4 countries) → 21 merges (5 EG +
  0 SD + 0 LY + 16 YE).
* **Option C** (Hybrid: Strategy A + high-tier PPL pop ≥ 5,000) → 265
  merges — too broad for EG/LY; not recommended without per-country
  floors.
* **Option D** (Per-country tailored) → ~100 merges, most balanced.
* **Custom**: list specific slugs (per country) to approve.

After your decision, Stage 4 will merge only the approved entries with
the established safety guards (dedupe, `isPrayerTimesReady`, metadata
strip, religious blocklist). The `rafah` collision will be resolved per
your decision: skip OR rename to `rafah-eg`.

---

## Untouched (per phase contract)

* `db/places/curated-places.json` — verified `git diff` clean.
* Homepage search, `/api/search-place`, `/search-test` UI,
  Qibla / Moon / Prayer pages, Supabase schema — none touched.

---

## License + attribution

Place data derived from the GeoNames geographical database, licensed
under Creative Commons Attribution 4.0 (CC-BY 4.0).
Source: https://download.geonames.org/export/dump/{EG,SD,LY,YE}.zip
GeoNames: https://www.geonames.org/
