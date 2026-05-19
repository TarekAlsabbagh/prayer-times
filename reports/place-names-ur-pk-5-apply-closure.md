# PLACE-NAMES-UR-PK-5 (Fast Track) — Closure Report

**Date**: 2026-05-19
**Phase ID**: PLACE-NAMES-UR-PK-5 (Fast Track Review+Apply)
**Predecessor**: ASIA-1D-PK-MISSING-AR-MAJORS-1B (closed `cfd7015` + `c9493e5`)
**Mode**: Fast Track (single phase per user policy 2026-05-19)
**Scope**: Pakistan, 29 BATCH-B entries only (no touch of 90 prior PK entries)

---

## 🏆 MILESTONE — PAKISTAN URDU 119/119 ⭐ (matches Arabic 119/119)

After this closure: **PK Urdu coverage = 119/119 = 100%** ⭐

```
PK total: 119 entries
  10 seed         ✅ Urdu (UR-PK-1 — already had real Urdu)
  43 clean        ✅ Urdu (UR-PK-2)
  17 MCF          ✅ Urdu (UR-PK-3)
  20 MAJORS-1A    ✅ Urdu (UR-PK-4)
  29 MAJORS-1B    ✅ Urdu (UR-PK-5 — THIS PHASE)
```

---

## Fast Track gate — all green

| Gate | Result |
|---|---|
| Semantic mismatches in proposed Urdu names | **0** |
| Duplicate Urdu names within PK | **0** (all 119 unique) |
| High ambiguity (multiple equally-valid spellings) | **0** |
| Manual decisions needed (>3 would block) | **0** |
| GeoNames Urdu/Persian content for these 29 cities | **0** (all manual) |
| Unexpected code changes (server.js / js/app.js / fillLangMap) | **0** |

Decision: **Fast Track Review+Apply proceeded as a single phase**.

---

## 1. rows التي أضيف لها names.ur

**29** — all 29 BATCH-B entries (previously `names.ur` absent post-MAJORS-1B).

| | Count |
|---|---:|
| `names.ur` newly set | **29** |
| Skipped (idempotent) | 0 |
| 90 prior PK entries touched (must be 0) | **0** ✓ |

## 2. aliases.ur المضافة

**16 clean aliases** across 16 rows.

| slug | alias added |
|---|---|
| `lodhran` | لودھران (non-retroflex variant) |
| `khanpur` | خان پور (with-space) |
| `attock-city` | اٹاک (double-A variant) |
| `mandi-bahauddin` | منڈی بہاؤ الدین (with-space ؤ) |
| `pakpattan` | پاک پتن (with-space) |
| `tando-adam` | ٹنڈوآدم (no-space) |
| `shahdad-kot` | شہدادکوٹ (no-space) |
| `phool-nagar` | پھولنگر (no-space) |
| `tando-muhammad-khan` | ٹنڈو محمد خاں (retroflex خاں) |
| `vihari` | ویہاڑی (ی-initial variant) |
| `dera-murad-jamali` | ڈیرا مراد جمالی (ا-end Dera) |
| `kot-addu` | کوٹادو (no-space) |
| `mansehra` | مانسہرا (ا-end variant) |
| `sanghar` | سنگھڑ (no-alif) |
| `haripur` | ہریپور (no-space) |
| `rajanpur` | راجنپور (no-space) |

13 cities have no aliases (canonical name only — Wikipedia agrees on a single form).

## 3. qualityScore distribution

| score | count | criterion |
|:-:|---:|---|
| 95 | **24** | Uses Urdu-specific letter(s): ٹ ڈ ڑ ں ھ ہ پ چ گ ژ ؤ |
| 85 | 5 | Persian/Arabic shared script only (no Urdu retroflex needed) |
| 80 | 0 | — |
| 75 | 0 | — |

**24/29 = 83% Urdu-specific letter density** — **highest** of all 5 UR-PK waves.

Comparison across all 5 Urdu waves:
- UR-PK-1: 8/10 = 80% (small sample, seed entries)
- UR-PK-2: 19/43 = 44%
- UR-PK-3: 13/17 = 76%
- UR-PK-4: 13/20 = 65%
- **UR-PK-5: 24/29 = 83%** ← new high

## 4. قائمة الـ29 المعتمدة

### Tier 2 (pop 100k-155k) — 23 cities

| slug | names.ar (preserved) | **names.ur applied** | score |
|---|---|---|:-:|
| `layyah` | ليه | **لیہ** | 95 (Urdu ہ + ی) |
| `lodhran` | لودهران | **لودھراں** | 95 (ھ + retroflex ں) |
| `khanpur` | خانبور | **خانپور** | 95 (Persian پ) |
| `attock-city` | أتوك | **اٹک** | 95 (retroflex ٹ) |
| `khuzdar` | خضدار | **خضدار** | 85 (shared script) |
| `manjhand` | مانجاند | **منجھند** | 95 (ھ) |
| `bhakkar` | بهاكر | **بھکر** | 95 (ھ + Persian ک) |
| `narowal` | نارووال | **نارووال** | 85 (shared script) |
| `mandi-bahauddin` | مندي بهاء الدين | **منڈی بہاؤالدین** | 95 (retroflex ڈ + ؤ + ہ) |
| `mianwali` | ميانوالي | **میانوالی** | 85 (Persian ی) |
| `pakpattan` | باكباتان | **پاکپتن** | 95 (Persian پ) |
| `tando-adam` | تاندو آدم | **ٹنڈو آدم** | 95 (retroflex ٹ + ڈ) |
| `toba-tek-singh` | توبا تيك سينغ | **ٹوبہ ٹیک سنگھ** | 95 (ٹ + ٹ + ہ + گ + ھ) |
| `shahdad-kot` | شهداد كوت | **شہداد کوٹ** | 95 (ہ + retroflex ٹ) |
| `charsadda` | شارسده | **چارسدہ** | 95 (Urdu چ + ہ) |
| `ghotki` | غوتكي | **گھوٹکی** | 95 (گ + ھ + ٹ + ی) |
| `phool-nagar` | بهول ناغر | **پھول نگر** | 95 (پ + ھ + گ) |
| `tando-muhammad-khan` | تاندو محمد خان | **ٹنڈو محمد خان** | 95 (ٹ + ڈ) |
| `vihari` | فيهاري | **وہاڑی** | 95 (ہ + retroflex ڑ + ی) |
| `dera-murad-jamali` | ديرة مراد جمالي | **ڈیرہ مراد جمالی** | 95 (ڈ + ہ) |
| `kot-addu` | كوت أدو | **کوٹ ادو** | 95 (retroflex ٹ) |
| `khushab` | خوشاب | **خوشاب** | 85 (shared script) |
| `chakwal` | جكوال | **چکوال** | 95 (Urdu چ) |

### Tier 3 (pop 50k-99k) — 6 cities

| slug | names.ar (preserved) | **names.ur applied** | score |
|---|---|---|:-:|
| `swabi` | صوابي | **صوابی** | 85 (Persian ی) |
| `mansehra` | مانسهره | **مانسہرہ** | 95 (Urdu ہ + ہ) |
| `sanghar` | سنغر | **سانگھڑ** | 95 (گ + ھ + retroflex ڑ) |
| `haripur` | هاريبور | **ہری پور** | 95 (ہ + ی + پ) |
| `rajanpur` | رجن بور | **راجن پور** | 95 (Persian پ) |
| `zhob` | زهوب | **ژوب** | 95 (Persian ژ Zh-phoneme) |

## 5. aliases المقبولة (16) والمرفوضة

### Accepted (16 aliases)
Listed in §2 above.

### Rejected
**None — Fast Track had no polluted aliases to drop** since GeoNames returned
zero Urdu/Persian/Arabic content for all 29 cities. All names + aliases manually
sourced from Urdu Wikipedia canonical + standard transliteration.

This is the same pattern as UR-PK-4 (MAJORS-1A had zero GeoNames content too).

## 6. ✅ تأكيد names.ar/en لم تتغير

Post-mutation assertion in apply script verified:
- 0 mutations to `names.ar` across all 119 PK entries
- 0 mutations to `names.en` across all 119 PK entries

The 29 ASIA-1D-PK-MAJORS-1B Arabic names (ليه, أتوك, خضدار, مانجاند, etc.)
preserved **byte-for-byte**.

## 7. ✅ تأكيد الـ90 السابقة لم تتغير

Post-mutation assertion verified:
- 0 mutations to the 90 prior PK entries' `names.ur` and `aliases.ur`
- 10 seed (karachi/lahore/islamabad/rawalpindi/peshawar/multan/faisalabad/quetta/hyderabad-pk/sialkot) ✓
- 43 ASIA-1D-PK clean (sargodha/bahawalnagar/chishtian/...) ✓
- 17 ASIA-1D-PK-MCF (gujranwala/bannu/.../rawalakot) ✓
- 20 ASIA-1D-PK-MAJORS-1A (bahawalpur/dera-ismail-khan/.../kohat) ✓

Smoke test Part C verifies 12 spot-check prior-90 entries unchanged.

## 8. اختبارات Urdu SSR

**62/62 pass** (`_test_place_names_ur_pk_5.mjs`):

| Part | Coverage | Result |
|---|---|---:|
| A | 29 names.ur present + 10 spot-checks | 11/11 ✓ |
| B | names.ar preserved (8 MAJORS-1B spot-checks) | 8/8 ✓ |
| C | 90 prior PK entries unchanged (12 spot-checks) | 12/12 ✓ |
| D | NO Latin fillchain in 7 locales × 29 = 203 checks + key-shape {ar,en,ur} | 2/2 ✓ |
| E | 10 priority /ur/prayer-times-in-{slug} SSR | 10/10 ✓ |
| F | Cross-route (moon/qibla) × 3 cities × 3 routes | 9/9 ✓ |
| G | Regression (UR-PK-4 + UR-PK-3 + UR-PK-2 + UR-PK-1 + AR MAJORS-1A + AR MAJORS-1B + EN) | 7/7 ✓ |
| H | 🏆 PK Urdu = 119/119 milestone | 2/2 ✓ |
| I | 0 duplicate Urdu names across 119 PK entries | 1/1 ✓ |

## 9. اختبارات prayer/moon/qibla navigation

**9 cross-route combinations verified** in Part F (3 cities × 3 routes):

| city | route | seed.name |
|---|---|---|
| attock-city | moon-in | اٹک ✓ |
| attock-city | moon-today-in | اٹک ✓ |
| attock-city | qibla-in | اٹک ✓ |
| mianwali | moon-in | میانوالی ✓ |
| mianwali | moon-today-in | میانوالی ✓ |
| mianwali | qibla-in | میانوالی ✓ |
| toba-tek-singh | moon-in | ٹوبہ ٹیک سنگھ ✓ |
| toba-tek-singh | moon-today-in | ٹوبہ ٹیک سنگھ ✓ |
| toba-tek-singh | qibla-in | ٹوبہ ٹیک سنگھ ✓ |

Plus 10 /ur/prayer-times-in-{slug} pages in Part E.

## 10. ✅ تأكيد no runtime translation

- ❌ NO translation API
- ❌ NO runtime translation
- ❌ NO AI translation during page load
- ❌ NO browser auto-translate dependency
- ✅ All 29 Urdu names sourced from Urdu Wikipedia canonical + standard
  transliteration; stored statically; read from `names.ur` at SSR; same
  pipeline as UR-PK-1/2/3/4

## 11. 🏆 تأكيد PK Urdu coverage = 119/119 ⭐

Verified by smoke Part H:
```
PK total = 119 ✓
PK Urdu-complete: ALL 119 entries have real names.ur (119 / 119) ✓
```

| Category | Count | Arabic | Urdu |
|---|---:|:-:|:-:|
| Seed (UR-PK-1) | 10 | ✅ | ✅ |
| ASIA-1D-PK clean (UR-PK-2) | 43 | ✅ | ✅ |
| ASIA-1D-PK-MCF (UR-PK-3) | 17 | ✅ | ✅ |
| MAJORS-1A (UR-PK-4) | 20 | ✅ | ✅ |
| **MAJORS-1B (UR-PK-5 — this)** | **29** | ✅ | ✅ |
| **PK Total** | **119** | **119/119** | **119/119 ⭐** |
| Blocked queue | 0 | — | — |
| Missing-ar deferred (MAJORS-1C) | ~32 | (Tier 3 PPL) | — |

---

## Carry-forward — zero failures across all 27+ suites

| Suite | Result |
|---|---:|
| `_test_place_names_ur_pk_5` (new) | **62/62** |
| `_test_asia_1d_pk_missing_ar_1b` (updated fillchain check) | 42/42 |
| `_test_place_names_ur_pk_4` | 51/51 |
| `_test_asia_1d_pk_missing_ar_1a` | 53/53 |
| `_test_place_names_ur_pk_3` | 74/74 |
| `_test_asia_1d_pk_mcf` | 61/61 |
| `_test_asia_1d_pk_search` | 29/29 |
| `_test_place_names_ur_pk_2` | 65/65 |
| `_test_place_names_ur_pk_1` | 38/38 |
| `_test_place_names_ur_af_1` | 41/41 |
| `_test_place_names_ur_ir_1` | 66/66 |
| `_test_place_names_cross_page_navigation_consistency_fix_1` | 28/28 |
| `_test_place_names_homepage_default_city_l10n_fix_1` | 33/33 |
| `_test_place_names_sitewide_template_consistency_fix_1` | 26/26 |
| `_test_place_names_template_consistency_all_langs_fix_1` | 18/18 |
| `_test_place_names_ur_template_consistency_1` | 16/16 |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 |
| `_test_city_page_l10n` | 152/152 |
| `_test_lang_guard` | 5/5 |
| `_test_lang_guard_helpers` | 6/6 |
| `_test_link_city_name` | 18/18 |
| `_test_place_by_slug` | 44/44 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_qibla_general_home_search_box_1` | 36/36 |
| `_test_moon_general_home_search_box_1` | 37/37 |
| `_test_asia_1g_af_search` | 24/24 |

---

## Files modified

| File | Change |
|---|---|
| `db/places/curated-places.json` | 29 PK entries: +names.ur, +16 aliases.ur |
| `scripts/geodata/_place_names_ur_pk_5_apply.mjs` | NEW Fast Track apply script with PRIOR-90 post-mutation guard |
| `scripts/_test_place_names_ur_pk_5.mjs` | NEW smoke 62/62 incl. 🏆 119/119 milestone |
| `scripts/_test_asia_1d_pk_missing_ar_1b.mjs` | Updated fillchain check to allow names.ur + key-shape {ar,en,ur} |
| `reports/place-names-ur-pk-5-apply-report.md` | NEW audit (apply script writes) |
| `reports/place-names-ur-pk-5-apply-closure.md` | NEW closure (this) |
| `db/places/curated-places.json.prePlaceNamesUrPk5.bak` | NEW backup |

**NOT modified**: `server.js`, `js/app.js`, `index.html`, `fillLangMap` (in
`_geonames_common.mjs`), 90 prior PK entries, `names.ar`/`names.en` of any PK
entry, all 2,326 non-PK curated entries.

---

## Status: 🟢 CLOSED — 🏆 Pakistan now FULLY complete at 119/119 Arabic + 119/119 Urdu

**Rollback**: `git revert <commit>`. Backup at
`db/places/curated-places.json.prePlaceNamesUrPk5.bak`.

**Held (per user direction — DO NOT auto-start)**:
- ASIA-1D-PK-MISSING-AR-MAJORS-1C (~32 remaining Tier 3 PPL cities)
- ASIA-1D-BD / ASIA-1D-IN / ASIA-1F
- AMERICAS-1B-MCF
- Search-ranking / Alias enrichment / DELETE-V1
