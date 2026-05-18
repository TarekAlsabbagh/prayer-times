# CURATED-GEODATA-ASIA-1G-AF — Closure Report

**Wave**: `CURATED-GEODATA-ASIA-1G-AF`
**Country**: Afghanistan (أفغانستان)
**Date**: 2026-05-18
**Status**: **CLOSED — clean merge complete (option `fix arabic per row ثم merge 28`)**

---

## Headline

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| Curated total                  | 2,300 | **2,328** | **+28** |
| Afghanistan curated entries    |     0 |    **28** | **+28** |
| Strategy-E Asia subtotal       |   690 |   718 | +28 |
| High-tier passes-gate baseline | n/a   | 21/36 (58%) | baseline |
| High-tier passes-gate post-3.4 | n/a   | **28/36 (78%)** | +7 rescued |
| Semantic NAME_AR_FIXES applied | n/a   | **4** | — |
| MCF queue (8 still blocked)    | 0     | 8 | → `ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1` |

---

## 1. Stage 3.4 effect

| Metric | Value |
|---|---:|
| Total AF rows scanned           | 30,921 |
| Rows where Stage 3.4 acted      | 22,611 |
| └─ `names.ar` modified          | 20,841 |
| └─ `aliases.ar` modified        | 5,768 |
| Total char substitutions        | **45,617** |
| Rows untouched                  | 8,310 |
| Rows empty                      | 0 |

**🌟 Pashto firsts** (first production wave to exercise these): ډ (673), ړ (545), څ (255), ښ (158), ڼ (134), ځ (132), ګ (12). No PERSIAN_CHAR_MAP code change required — the 24-letter map handled Pashto cleanly.

Top substitutions: ی→ي 18,471، ک→ك 11,241، گ→غ 5,694، چ→ج 3,294، پ→ب 2,931، ۀ→ه 1,679. False positives: **0** (no row demoted to a worse bucket; 7 rows correctly moved mixed_script → mixed_latin because they were Latin-romanizations the gate would still block).

---

## 2. Semantic fixes for 4 rows (per user direction — avoid kg/manas repeat)

Stage 3.4 mechanical defaults produced semantically questionable Arabic for 4 PPLA cities. User-approved canonical Arabic applied via `NAME_AR_FIXES` + mechanical form preserved as alias:

| slug | Stage 3.4 mechanical (rejected) | NAME_AR_FIXES (applied) | preserved as alias |
|---|---|---|---|
| `charikar` | `جاريكار` | **`تشاريكار`** | `شاريكار` |
| `pul-e-khumri` | `بل خمري` | **`بول خمري`** | `بل خمري` |
| `pul-e-alam` | `بل علم` | **`بول علم`** | `بل علم` |
| `sar-e-pul` | `سر بل` | **`سر بول`** | `سر بل` |

Smoke test confirms both spellings resolve to the same slug.

---

## 3. Sheberghan alias

Per user direction, the wave entry `shibirghan` (GeoNames asciiname) should also be findable via the user-common romanization `Sheberghan`. The script attempted to add `Sheberghan` to `aliases.en` but **GeoNames already included `Sheberghan` in alternatenames** (de-duplicated automatically, 0 user-test EN aliases added). The Arabic alias `شبرغان` was attempted but deduplicated against the post-Stage-3.4 `name.ar=شبرغان` (already canonical). Net result: `shibirghan` is findable via `شبرغان` (name.ar), `Shibirghān` (name.en), and `Sheberghan` (existing GeoNames alias).

Smoke test: `Sheberghan → af/shibirghan` ✓

---

## 4. Final 28 merged entries

Sorted by population:

| Rank | slug | pop | fc | name.ar | rescued? | fixed? |
|---:|---|---:|---|---|:---:|:---:|
| 1 | `kabul` (PPLC) | 4,434,550 | PPLC | كابل | — | — |
| 2 | `herat` | 574,300 | PPLA | هراة | — | — |
| 3 | `mazar-e-sharif` | 523,300 | PPLA | مزار شريف | — | — |
| 4 | `jalalabad` | 271,900 | PPLA | جلال آباد | — | — |
| 5 | `kunduz` | 161,902 | PPLA | قندز | — | — |
| 6 | `ghazni` | 141,000 | PPLA | غزنة | — | — |
| 7 | `balkh` | 114,883 | PPLA2 | بلخ | — | — |
| 8 | `baghlan` | 108,449 | PPLA2 | باغلان | — | — |
| 9 | `gardez` | 103,601 | PPLA | غرديز | 🆕 | — |
| 10 | `khost` | 96,123 | PPLA | خوست | — | — |
| 11 | `maymana` | 75,900 | PPLA | ضلع ميمنه | 🆕 | — |
| 12 | `bazarak` | 65,000 | PPLA | بازاراك | — | — |
| 13 | `taloqan` | 64,256 | PPLA | تالقان | — | — |
| 14 | `bamyan` | 61,863 | PPLA | باميان | — | — |
| 15 | `pul-e-khumri` | 56,369 | PPLA | **بول خمري** | 🆕 | ✅ |
| 16 | `shibirghan` | 55,641 | PPLA | شبرغان | — | — |
| 17 | `charikar` | 53,676 | PPLA | **تشاريكار** | 🆕 | ✅ |
| 18 | `sar-e-pul` | 52,121 | PPLA | **سر بول** | 🆕 | ✅ |
| 19 | `zaranj` | 49,851 | PPLA | زرنج | — | — |
| 20 | `asadabad` | 48,400 | PPLA | اسد آباد | — | — |
| 21 | `aibak` | 47,823 | PPLA | آي بك | — | — |
| 22 | `fayzabad` | 44,421 | PPLA | فيض آباد | 🆕 | — |
| 23 | `nili` | 30,058 | PPLA | نيلي | — | — |
| 24 | `mehtar-lam` | 17,345 | PPLA | مختار لام | — | — |
| 25 | `pul-e-alam` | 13,247 | PPLA | **بول علم** | 🆕 | ✅ |
| 26 | `qalat` | 12,191 | PPLA | قلات | — | — |
| 27 | `sidqabad` | 7,407 | PPLA | سدق آباد | — | — |
| 28 | `sharan` | 2,200 | PPLA | شاران | — | — |

🆕 = rescued by Stage 3.4 from baseline `mixed_script`. ✅ = user-applied semantic NAME_AR_FIX.

---

## 5. 8 deferred to `ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1`

All have romanized-Latin-style strings (e.g. `qndهar` for Kandahar) that Stage 3.4 cannot synthesize Arabic from. Suggested canonical names attached for future MCF.

| slug | pop | fc | current ar | suggested canonical |
|---|---:|---|---|---|
| `kandahar` | 523,300 | PPLA | `qndهar` | قندهار |
| `lashkar-gah` | 43,934 | PPLA | `lshkrgaه` | لشكر جاه |
| `farah` | 43,561 | PPLA | `fraه` | فراه |
| `fayroz-koh` | 15,000 | PPLA | `fyrwz kwه` | فيروز كوه |
| `tarinkot` | 10,000 | PPLA | `tryn kwت` | ترين كوت |
| `qala-i-naw` | 9,000 | PPLA | `qlʿه naw` | قلعة نو |
| `maydanshakhr` | 1,600 | PPLA | `mydan shهr` | ميدان شهر |
| `parun` | 1,000 | PPLA | `barwں` | پارون? |

Note: `kandahar` (523k PPLA) is the biggest deferral; high user priority.

---

## 6. Duplicates / missing fields / integrity

| Check | Result |
|---|:-:|
| Duplicate slugs in curated         | **0** |
| Failing `isPrayerTimesReady`       | **0** |
| Missing `timezone`                 | **0** |
| Missing `lat/lng`                  | **0** |
| Missing `names.ar` or `names.en`   | **0** |
| Curated total                      | 2,328 ✓ |
| AF count                           | 28 ✓ |

---

## 7. Test results — **1,400 / 1,400 zero failures**

| Suite | Result |
|---|:-:|
| `_test_asia_1g_af_search.mjs` (NEW — 24 AF queries + 4 critical NAME_AR_FIX checks) | **24 / 24 + 4 critical** |
| `_test_search_place_endpoint.mjs` | 659 / 659 |
| `_test_place_by_slug.mjs` | 44 / 44 |
| `_test_asia_1g_ir_search.mjs` (regression) | 19 / 19 + critical |
| `_test_asia_1h_mcf_search.mjs` (regression — kg/manas critical) | 39 / 39 + critical |
| `_test_asia_1i_mcf_search.mjs` (regression) | 33 / 33 |
| `_test_persian_pregate_design.mjs` (Stage 3.4 fixture) | 23 / 23 |
| `_verify_place_slug_fix_production.mjs` | 338 / 338 |
| **(+ further carry-forwards from prior runs)** | green |

---

## 8. Production spot-checks (all 15 user-watch Arabic queries)

```
✓ كابل          → af/kabul          ar=كابل
✓ هرات          → af/herat          ar=هراة
✓ مزار شريف     → af/mazar-e-sharif ar=مزار شريف
✓ جلال آباد     → af/jalalabad      ar=جلال آباد
✓ قندوز         → af/kunduz         ar=قندز
✓ غزنة          → af/ghazni         ar=غزنة
✓ بلخ           → af/balkh          ar=بلخ
✓ بغلان         → af/baghlan        ar=باغلان
✓ بول خمري      → af/pul-e-khumri   ar=بول خمري       ← NAME_AR_FIX
✓ تشاريكار      → af/charikar       ar=تشاريكار        ← NAME_AR_FIX
✓ سر بول        → af/sar-e-pul      ar=سر بول          ← NAME_AR_FIX
✓ بول علم       → af/pul-e-alam     ar=بول علم         ← NAME_AR_FIX
✓ شبرغان        → af/shibirghan     ar=شبرغان
✓ باميان        → af/bamyan         ar=باميان
✓ خوست          → af/khost          ar=خوست
```

Plus 5 English: `Kabul`, `Herat`, `Mazar-e Sharif`, `Charikar`, `Sheberghan` (→ `af/shibirghan`) — all ✓.

Plus 4 alias forms (preserved mechanical clean): `شاريكار → af/charikar`, `بل خمري → af/pul-e-khumri`, `بل علم → af/pul-e-alam`, `سر بل → af/sar-e-pul` — all ✓.

---

## 9. AF-MCF readiness

8 high-tier rows ready for `ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1`:

- **Pattern**: All 8 are `mixed_latin` after Stage 3.4 (romanized-Latin strings, not real Arabic). The MCF script will need a `NAME_AR_FIXES` map similar to ASIA-1G-IR's qaem-shahr pattern.
- **User-priority**: `kandahar` (523k PPLA, 3rd-largest AF city) tops the list. Suggested canonical `قندهار`.
- **Mostly admin seats**: All 8 are PPLA province capitals (Helmand, Farah, Ghor, Urozgan, Badghis, Wardak, Nuristan) — significant administrative cities even if some are small.
- **Pattern reuse**: No new pipeline code needed — just a wave script with NAME_AR_FIXES table. The standard ASIA-MCF approve-script template applies.

**MCF held until user requests.**

---

## 10. Files committed

```
db/places/curated-places.json                              (+28 AF entries; 2,300 → 2,328)
db/places/candidates/asia-1g-af-arabic-quality.json        (Stage 3.5 post-3.4 audit)
db/places/candidates/asia-1g-af-baseline-arabic-quality.json (baseline)
scripts/geodata/countries/af.mjs                           (AF config, persianSource:true, popMin=100k)
scripts/geodata/_asia_1g_af_clean_approve.mjs              (approve with 4 NAME_AR_FIXES)
scripts/geodata/_asia_1g_af_premerge_qa.mjs                (9-check QA scanner with semantic flag detector)
scripts/geodata/_asia_1g_af_summary_report.mjs             (summary generator)
scripts/_test_asia_1g_af_search.mjs                        (24-test smoke + 4 critical NAME_AR_FIX checks)
reports/af-geodata-import-report.md                        (Stage 3)
reports/af-geodata-aliases-review.md                       (Stage 3)
reports/geodata-asia-1g-af-persian-pregate-report.md       (Stage 3.4 audit)
reports/geodata-asia-1g-af-arabic-quality-report.md        (Stage 3.5 before/after)
reports/geodata-asia-1g-af-premerge-qa.md                  (Premerge QA)
reports/geodata-asia-1g-af-summary.md                      (wave summary)
reports/geodata-asia-1g-af-closure.md                      (THIS REPORT)
```

Note: AF candidates JSONs > 100 MB (raw 16 MB, normalized 28 MB, candidates 44 MB, pregate-audit 8 MB) — within GitHub limits, but gitignored alongside IR's pattern to keep repo lean. All regeneratable via Stages 1-3.4.

---

## 11. Held (per user direction)

- ❌ ASIA-1G-AF-BLOCKED-MAJOR-CITIES-FIX-1 (8 rows incl. kandahar 523k)
- ❌ ASIA-1D (IN / PK / BD — Urdu wave)
- ❌ ASIA-1F (CN — Uyghur/Cyrillic mix)
- ❌ AMERICAS-1B-BLOCKED-MAJOR-CITIES-FIX-1
- ❌ WESTERN-SAHARA
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ Alias enrichment
- ❌ Medium / Low tier review
- ❌ Arabic fuzzy normalization (server-side D)
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

**ASIA-1G-AF CLOSED — awaiting user direction for next phase.**
