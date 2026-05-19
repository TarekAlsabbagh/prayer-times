# ASIA-1D-PK-MISSING-AR-MAJORS-1C (Fast Track conditional) — Closure Report

**Date**: 2026-05-19
**Phase ID**: ASIA-1D-PK-MISSING-AR-MAJORS-1C (Fast Track conditional Review+Apply)
**Predecessor**: PLACE-NAMES-UR-PK-5 (closed `4bc27d8` + `5d20c97`)
**Mode**: Fast Track conditional — user stopped at 2 STOP conditions, then approved
**Scope**: Pakistan, BATCH-C T3 only (PPL pop 50-99k), -1 dropped for duplicate Arabic

---

## Fast Track conditional gate — 2 STOP triggers raised, both resolved

| Gate | Status | Resolution |
|---|---|---|
| Scope size matched user's "approximately 45" estimate | ❌ STOP | User chose **Option 1: T3 only (30 cities)** |
| Borderline PPLA2 pop=0 admin stubs (26) | ❌ STOP | User chose **exclude all 4 weak stubs** (jhang-city, eidghah, dambudas+tolti, musa-khel-bazar) — moot since scope=T3 only excludes all PPLA2 anyway |
| Duplicate Arabic: `arifwala` vs existing `arif-wala` | ❌ STOP | User chose **drop `arifwala` from MAJORS-1C** (29 cities final) |
| Semantic mismatches | ✓ none | — |
| Slug collisions (vs existing 119 PK) | ✓ none after dedup | — |
| `>5 names needing decision` | ✓ resolved via user-approval | 3 decisions made via AskUserQuestion |

After resolutions: **29 cities** approved (30 T3 - 1 arifwala dup).

---

## 1. Curated total — before / after

| State | Total |
|---|---:|
| Before MAJORS-1C (after UR-PK-5) | 2,445 |
| **After MAJORS-1C** | **2,474** |
| Net added | **+29** |

## 2. PK count — before / after

| State | PK count |
|---|---:|
| Before MAJORS-1C (post UR-PK-5) | 119 |
| **After MAJORS-1C** | **148** |
| Net added | **+29** |

## 3. Merged count

**29** new PK entries — all BATCH-C Tier 3 PPL cities (pop 50k-99k).

| | Count |
|---|---:|
| Approved (new) | **29** |
| Skipped (idempotent) | 0 |
| Excluded by user direction | 8 (arifwala dup + 7 others) |
| 119 prior PK entries touched | **0** ✓ |

## 4. Excluded count + reasons

**8 candidates excluded** per user direction:

| slug | reason | category |
|---|---|---|
| `arifwala` | Duplicate Arabic `عارف والا` with existing `arif-wala` (MAJORS-1A) | duplicate-Arabic STOP |
| `jhang-city` | Semantic dup with `jhang-sadr` already merged | user-excluded (UR-PK-1) |
| `eidghah` | Generic Eidgah prayer-ground name, not a real city | weak/borderline stub |
| `dambudas` | Obscure village stub in Diamer/Astore area | weak stub |
| `tolti` | Small village near Skardu, low SEO value | weak stub |
| `musa-khel-bazar` | Unusual `-bazar` suffix (district HQ but borderline) | borderline stub |
| `model-town` | Generic English neighborhood name (PPL pop=100k) | MAJORS-1A exclusion (re-listed) |
| `bahawalnagar` (PPL dup) | Duplicate of existing PPLA2 pk/bahawalnagar | MAJORS-1A exclusion (re-listed) |

**Out-of-scope per user (Option 1)**:
- 21 PPLA2 pop>0 admin centers (tank/loralai/lakki/hangu/... ziarat) — **deferred to future phase**
- 26 PPLA2 pop=0 admin stubs (khanewal/jamshoro/saidu-sharif/...) — **deferred or no value**
- 101 PPL T4 (pop 20-49k) — deferred
- ~270 PPL T5+T6 (pop <20k) — deferred
- ~111k PPL pop=0 duplicates — auto-excluded (slug collisions / no value)

## 5. قائمة الـ29 المدمجة (cities merged)

### Tier 3 (pop 50k-99k) — 29 cities

| slug | pop | province | **names.ar** |
|---|---:|---|---|
| `qubo-saeed-khan` | 99k | Sindh | **قبو سعيد خان** |
| `jalalpur-jattan` | 94k | Punjab | **جلال بور جتان** |
| `daharki` | 90k | Sindh | **داهاركي** |
| `kandhkot` | 88k | Sindh | **كنده كوت** |
| `nowshera-kalan` | 88k | KP | **نوشيرا كلان** |
| `chichawatni` | 83k | Punjab | **جيجاواتني** |
| `fatehjang` | 81k | Punjab | **فاتح جانغ** |
| `alahabad` | 80k | Punjab | **الله آباد** |
| `moro` | 77k | Sindh | **مورو** |
| `mian-channun` | 76k | Punjab | **ميان جانون** |
| `topi` | 75k | KP | **توبي** |
| `pano-aqil` | 73k | Sindh | **بانو عاقل** |
| `harunabad` | 72k | Punjab | **هارون آباد** |
| `rabwah` | 70k | Punjab | **ربوة** |
| `kahror-pakka` | 70k | Punjab | **كاهرور باكا** |
| `chuhar-kana` | 69k | Punjab | **جوهار كانا** |
| `shorkot` | 67k | Punjab | **شور كوت** |
| `minchinabad` | 67k | Punjab | **مينتشين آباد** |
| `shabqadar` | 66k | KP | **شب قدر** |
| `shujaabad` | 66k | Punjab | **شجاع آباد** |
| `haveli-lakha` | 65k | Punjab | **حويلي لاكا** |
| `shakargarh` | 64k | Punjab | **شكر غره** |
| `jampur` | 64k | Punjab | **جام بور** |
| `hujra-shah-muqim` | 62k | Punjab | **حجرة شاه مقيم** |
| `sangla-hill` | 57k | Punjab | **سنغلا هيل** |
| `sharifabad` | 55k | KP | **شريف آباد** |
| `pabbi` | 53k | KP | **بابي** |
| `qabula` | 52k | Punjab | **قابولا** |
| `jahanian` | 50k | Punjab | **جهانيان** |

## 6. الأسماء العربية المعتمدة (Accepted Arabic names)

All 29 names manually transliterated from Wikipedia AR + standard
compound conventions:
- `-abad` → آباد (alahabad → الله آباد, harunabad → هارون آباد, etc.)
- `-pur` → بور (jalalpur-jattan → جلال بور جتان, jampur → جام بور)
- `-kot` → كوت (kandhkot → كنده كوت, shorkot → شور كوت)
- `-garh` → غره (shakargarh → شكر غره, matches MCF convention)
- `-wala/wala-` → والا
- `ch-` → ج (chichawatni → جيجاواتني, mian-channun → ميان جانون, chuhar-kana → جوهار كانا) OR تش for some (minchinabad → مينتشين آباد)
- `Hujra-` → حجرة (hujra-shah-muqim)
- `Rabwah` → ربوة (Wikipedia AR canonical for Chenab Nagar — the Ahmadiyya HQ)

Special handling:
- `shabqadar` → **شب قدر** (Persian-loan "Power Night" written as pure Arabic)
- `sangla-hill` → **سنغلا هيل** (kept English "hill" loan-word)

All 29 names pass `isCleanArabic` check (no Persian/Urdu/Pashto/Sindhi letters).

## 7. ✅ Confirmation no fake localized fillchain

All 29 BATCH-C entries have `names` shape:
```js
{ ar: "<canonical Arabic>", en: "<Latin city name>" }
```

**No** `names.ur`, `names.bn`, `names.fr`, `names.de`, `names.tr`,
`names.id`, `names.es`, `names.ms` keys anywhere in the 29 entries.

- 0 leaks across 8 locales × 29 entries = **232 negative checks** all pass
- All 29 have `Object.keys(names).sort().join(',') === 'ar,en'` exactly
- fillLangMap guard at write-time (apply_curated_candidates.mjs) enforced

**No runtime translation, no API calls, no AI translation, no browser auto-translate.**

## 8. Duplicate Arabic check

**0** duplicate Arabic names within PK (all 148 unique).

```
Total duplicate Arabic in PK: 0
```

Pre-flight cross-check in apply script: verified each new Arabic name
unique against all 119 existing PK entries — this caught the
`arifwala/arif-wala` conflict before merge.

## 9. Slug collision check

**0** duplicate `cc/slug` pairs across all 2,474 curated entries.
**0** slug collisions within PK 148.

211 candidate slug collisions with existing curated (PPL pop=0 duplicates
of PPLA/PPLA2 already-merged entries) — all auto-excluded by the
candidate dedup logic.

## 10. Tests result

### New smoke (this phase)

`_test_asia_1d_pk_missing_ar_1c.mjs`: **53/53 pass** ✓

| Part | Coverage | Result |
|---|---|---:|
| A | PK count = 148 (119 + 29 BATCH-C) | 1/1 ✓ |
| B | 29 BATCH-C names.ar + 10 spot-checks | 11/11 ✓ |
| C | NO Latin fillchain (8 locales × 29 = 232 checks) + key-shape {ar,en} | 2/2 ✓ |
| D | Out-of-scope guards (8 excluded slugs + 26 PPLA2-pop=0 + 21 PPLA2-pop>0 + existing arif-wala preserved) | 10/10 ✓ |
| E | 9 prior PK entries unchanged (seed + clean + MCF + MAJORS-1A + MAJORS-1B) | 9/9 ✓ |
| F | Arabic search (5 cities) | 5/5 ✓ |
| G | SSR `/prayer-times-in-{slug}` (7 BATCH-C cities) | 7/7 ✓ |
| H | Regression (UR-PK-3/4/5 + AR MAJORS-1A/1B + existing arif-wala + EN new) | 8/8 ✓ |

### Updated existing tests (stale assertions relaxed for PK count growth)

- `_test_place_names_ur_pk_5.mjs`: 62/62 ✓ (was `PK total === 119` → now `>= 119`)
- `_test_asia_1d_pk_missing_ar_1b.mjs`: 42/42 ✓ (was `PK total === 119` → now `>= 119`)

### Carry-forward (28+ suites, all zero failures)

| Suite | Result |
|---|---:|
| `_test_asia_1d_pk_missing_ar_1c` (new) | **53/53** |
| `_test_place_names_ur_pk_5` (updated) | 62/62 |
| `_test_asia_1d_pk_missing_ar_1b` (updated) | 42/42 |
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
| `_test_search_ar` | 22/22 |
| `_test_fill_lang_map` | 11/11 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_qibla_general_home_search_box_1` | 36/36 |
| `_test_moon_general_home_search_box_1` | 37/37 |
| `_test_asia_1g_af_search` | 24/24 |

## 11. Remaining Pakistan missing-ar count

| Category | Count | Status |
|---|---:|---|
| Before MAJORS-1C (PPL T3 pop 50-99k) | 30 | — |
| Merged this phase | **29** | ✓ done |
| Dropped (arifwala dup) | 1 | deferred (MAJORS-1A polish candidate) |
| **PPL T3 remaining** | **0** ✓ | (only the dropped arifwala) |
| PPL T4 (pop 20-49k) | 83 | future MAJORS-1D-T4 |
| PPL T5 (pop 5-19k) | 122 | future MAJORS-1D-T5 |
| PPL T6 (pop 1-4k) | 47 | future MAJORS-1D-T6 |
| PPLA2 pop>0 (district HQs) | 18 | future MAJORS-1D-PPLA2 |
| PPLA2 pop=0 (admin stubs) | 23 | future (case-by-case, most low-value) |
| PPL pop=0 (stub duplicates) | ~111k | auto-excluded (slug collisions / no value) |

**T3 (high-pop, real-city) tier is now 100% complete for Pakistan.**

## 12. Next recommended phase

Per user direction at MAJORS-1C kickoff — **DO NOT auto-start**.

User stated: "بعد الإغلاق نفتح Urdu enrichment لهذه الـ30 فقط" → next phase is
**PLACE-NAMES-UR-PK-6 (Fast Track)** to add Urdu names for these 29 new
BATCH-C cities. After UR-PK-6:
- PK Urdu coverage: 119/148 → 148/148 (matches Arabic 148/148)

Subsequent recommended order:
1. **PLACE-NAMES-UR-PK-6** — Urdu for 29 BATCH-C cities → PK 148/148 Urdu
2. **ASIA-1D-BD** or **ASIA-1D-IN** — Bangladesh or India waves
3. Future ASIA-1D-PK-MISSING-AR-MAJORS-1D series for T4/T5 if user wants deeper PK coverage

---

## Files modified

| File | Change |
|---|---|
| `db/places/curated-places.json` | +29 PK entries (`names: {ar, en}` only) |
| `db/places/candidates/pk-geonames-candidates.json` | 29 candidates flipped `needs_review → approved` |
| `scripts/geodata/_asia_1d_pk_missing_ar_1c_apply.mjs` | NEW Fast Track conditional apply script with cross-check Arabic-collision guard |
| `scripts/_test_asia_1d_pk_missing_ar_1c.mjs` | NEW smoke 53/53 |
| `scripts/_test_place_names_ur_pk_5.mjs` | PK count assertion `=== 119` → `>= 119` |
| `scripts/_test_asia_1d_pk_missing_ar_1b.mjs` | PK count assertion `=== 119` → `>= 119` |
| `reports/asia-1d-pk-missing-ar-majors-1c-closure.md` | NEW closure (this) |
| `db/places/curated-places.json.preAsia1dPkMissingAr1C.bak` | NEW backup |

**NOT modified**: `server.js`, `js/app.js`, `index.html`, `fillLangMap` (in
`_geonames_common.mjs`), 119 prior PK entries, `names.ar`/`names.en` of any
prior PK entry, all 2,326 non-PK curated entries.

---

## Apply rules compliance — all green

| Rule | Compliant? |
|---|---|
| ✅ Only `names: {ar, en}` for new BATCH-C entries | YES (29/29) |
| ✅ No `names.ur` added (UR-PK-6 separate phase) | YES |
| ✅ No `aliases.ur` added (UR-PK-6 will handle) | YES |
| ✅ No fake localized fillchain (bn/fr/de/tr/id/es/ms) | YES (0 leaks 232 checks) |
| ✅ No changes to `server.js` | YES |
| ✅ No changes to `js/app.js` | YES |
| ✅ No changes to `fillLangMap` | YES |
| ✅ No runtime translation | YES |
| ✅ 119 prior PK entries untouched | YES (verified post-merge via Part E spot-checks) |
| ✅ No pop=0 admin stubs merged | YES (all 26 PPLA2 pop=0 deferred) |

---

## Status: 🟢 CLOSED — Pakistan now 148/148 Arabic-complete, 119/148 Urdu (UR-PK-6 pending)

**Rollback**: `git revert <commit>`. Backup at
`db/places/curated-places.json.preAsia1dPkMissingAr1C.bak`.

**Held (per user direction — DO NOT auto-start)**:
- PLACE-NAMES-UR-PK-6 (Urdu enrichment for 29 BATCH-C cities)
- ASIA-1D-BD / ASIA-1D-IN
- ASIA-1F
- AMERICAS-1B-MCF
- Search-ranking / Alias enrichment / DELETE-V1
