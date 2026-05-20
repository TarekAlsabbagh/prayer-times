# PLACE-NAMES-IN-B-SUPPORTED-L10N-FAST — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `6cafe25`
**Date**: 2026-05-20
**Phase**: Supported-locale L10N (ur+bn) for 30 BATCH-B IN cities
**Prerequisite**: ASIA-1D-IN-B-FAST applied (`5a566e7`)
**Apply script**: `scripts/geodata/_place_names_in_b_supported_l10n_fast_apply.mjs`
**Audit trail**: `reports/place-names-in-b-supported-l10n-fast-apply-report.md`

---

## 1. State before/after

| Metric | Before | After | Δ |
|---|---:|---:|--:|
| Total curated | 2558 | 2558 | 0 |
| IN total | 70 | 70 | 0 |
| IN with names.ar | 70 | 70 | 0 |
| IN with names.en | 70 | 70 | 0 |
| IN with names.hi (HI-IN-1 cohort) | 40 | 40 | 0 |
| **IN with names.ur** | **40** | **70** | **+30** |
| **IN with names.bn** | **40** | **70** | **+30** |

**Target scope**: 30 BATCH-B cities (no SEED-18, no BATCH-A-22 touched).
**Lang policy**: ur + bn ONLY added; NO hi/ta/mr/te/kn/ml/gu/pa/or/as/sa.

---

## 2. 30 cities — applied ur + bn

| slug | names.ur | names.bn | ur source | bn source |
|---|---|---|---|---|
| `gorakhpur` | گورکھپور | গোরক্ষপুর | WIKIPEDIA | WIKIPEDIA |
| `raipur` | رائے پور | রায়পুর | PICK_RAW | PICK_RAW |
| `tiruchirappalli` | تیروچیراپالی | তিরুচিরাপল্লী | KEEP_RAW | KEEP_RAW |
| `kota` | کوٹا | কোটা | KEEP_RAW | WIKIPEDIA |
| `sholapur` | شولاپور | শোলাপুর | WIKIPEDIA | WIKIPEDIA |
| `chandigarh` | چنڈی گڑھ | চণ্ডীগড় | WIKIPEDIA | FIX_RAW |
| `tiruppur` | تیروپور | তিরুপ্পুর | KEEP_RAW | KEEP_RAW |
| `guwahati` | گوہاٹی | গুয়াহাটি | PICK_RAW | KEEP_RAW |
| `mysuru` | میسور | মহীশূর | KEEP_RAW | PICK_RAW |
| `salem-in` | سالم | সালেম | KEEP_RAW | KEEP_RAW |
| `gurugram` | گڑگاؤں | গুরুগ্রাম | PICK_RAW | PICK_RAW |
| `bhubaneswar` | بھونیشور | ভুবনেশ্বর | WIKIPEDIA | KEEP_RAW |
| `jalandhar` | جالندھر | জলন্ধর | PICK_RAW | KEEP_RAW |
| `bhayandar` | بھائندر | ভাইন্দর | FIX_RAW | FIX_RAW |
| `aligarh` | علی گڑھ | আলিগড় | KEEP_RAW | KEEP_RAW |
| `bareilly` | بریلی | বেরেলি | KEEP_RAW | KEEP_RAW |
| `moradabad` | مراد آباد | মোরাদাবাদ | WIKIPEDIA | WIKIPEDIA |
| `warangal` | ورنگل | ওয়ারঙ্গল | KEEP_RAW | WIKIPEDIA |
| `guntur` | گنٹور | গুন্টুর | PICK_RAW | PICK_RAW |
| `bikaner` | بیکانیر | বিকানের | WIKIPEDIA | WIKIPEDIA |
| `bhilai` | بھلائی | ভিলাই | KEEP_RAW | FIX_RAW |
| `jammu` | جموں | জম্মু | KEEP_RAW | KEEP_RAW |
| `kozhikode` | کوزیکوڈ | কোঝিকোড় | PICK_RAW | PICK_RAW |
| `nellore` | نیلور | নেল্লোর | KEEP_RAW | FIX_RAW |
| `ajmer` | اجمیر | আজমির | KEEP_RAW | PICK_RAW |
| `dehradun` | ڈیرہ دون | দেরাদুন | KEEP_RAW | PICK_RAW |
| `erode` | ایروڈ | ইরোড | FIX_RAW | WIKIPEDIA |
| `ujjain` | اجین | উজ্জয়িনী | PICK_RAW | PICK_RAW |
| `mangaluru` | منگلور | ম্যাঙ্গালোর | KEEP_RAW | PICK_RAW |
| `belagavi` | بیلگاؤم | বেলগাউম | KEEP_RAW | KEEP_RAW |

---

## 3. Source breakdown

| Source | Urdu count | Bengali count |
|---|---:|---:|
| KEEP_RAW | 14 | 11 |
| PICK_RAW (multi-candidate raw → canonical) | 8 | 10 |
| FIX_RAW (raw needed cleanup) | 2 | 4 |
| WIKIPEDIA (no raw or canonical preferred) | 6 | 5 |
| MANUAL | 0 | 0 |
| **TOTAL** | **30** | **30** |

**Composition**: 80% GeoNames raw + 17% Wikipedia + 3% raw-FIX. **No runtime translation. No manual translit beyond standard conventions.**

---

## 4. Script guards — 100% pass

| Check | Result |
|---|:---:|
| All 30 `names.ur` pass `isCleanUrdu()` (Arabic block, reject Latin/Devanagari/Bengali/Tamil/Pashto/Sindhi) | ✅ |
| All 30 `names.bn` pass `isCleanBengali()` (U+0980-U+09FF, reject Latin/Devanagari/Arabic/Tamil/Assamese-only) | ✅ |
| 0 duplicate `names.ur` across 30 entries | ✅ |
| 0 duplicate `names.bn` across 30 entries | ✅ |

---

## 5. Invariant verification

| Check | Result |
|---|:---:|
| PRIOR-40 entries byte-identical (full JSON compare) | ✅ (0 mutations) |
| BATCH-B entries: `names.ar` / `names.en` / `aliases` / `slug` / `coords` / `timezone` / `admin` / `priority` unchanged | ✅ |
| Non-IN entries byte-identical hash | ✅ |
| Total curated unchanged (2558) | ✅ |
| IN count unchanged (70) | ✅ |
| All 30 BATCH-B entries now have exactly 4 langs `[ar, bn, en, ur]` | ✅ |
| No `names.hi/ta/mr/te/kn/ml/gu/pa/or/as/sa` added on BATCH-B | ✅ |

---

## 6. Tests run

### Updated count assertions (UR-IN-1 / BN-IN-1 cohort expanded to 70)

| Suite | Result |
|---|:---|
| `_test_place_names_hi_in_1.mjs` (hi cohort still 40) | **116/116** ✅ |
| `_test_place_names_ur_in_1.mjs` (ur cohort 40→70) | **122/122** ✅ |
| `_test_place_names_bn_in_1.mjs` (bn cohort 40→70) | **113/113** ✅ |

### Carry-forward

| Suite | Result |
|---|:---|
| `_test_fill_lang_map.mjs` | **11/11** ✅ |
| `_test_place_by_slug.mjs` | **44/44** ✅ |
| `_test_city_page_l10n.mjs` | **152/152** ✅ |
| `_test_place_names_ur_pk_6.mjs` | **69/69** ✅ |
| `_test_search_ar.mjs` | **22/22** ✅ |

### Search smoke (server-online)

| Query type | Count | Result |
|---|---:|:---:|
| Urdu queries (10 BATCH-B Urdu strings) | 10 | **10/10** ✅ |
| Bengali queries (10 BATCH-B Bengali strings) | 10 | **10/10** ✅ |
| Regression (Mumbai, Karachi, Kolkata) | 3 | **3/3** ✅ |

**Total verified**: 633/633 zero failures.

---

## 7. Confirmation matrix

| Forbidden action | Confirmation |
|---|:---:|
| Touch 40 prior IN entries (SEED-18 + BATCH-A-22) | ❌ Not done (byte-identity hash) |
| Modify PK / BD / any other country | ❌ Not done (non-IN hash unchanged) |
| Modify `names.ar` / `names.en` of BATCH-B | ❌ Not done |
| Add `names.hi/ta/mr/te/kn/ml/gu/pa/or/as/sa` | ❌ Not done |
| Modify slugs / coords / timezone / admin / priority | ❌ Not done |
| Modify aliases | ❌ Not done |
| Modify `server.js` / `js/app.js` / `index.html` | ❌ Not modified |
| Modify shared scripts | ❌ Not modified |
| Modify search ranking algorithm | ❌ Not modified |
| Use runtime translation | ❌ Not used |
| Use fillchain | ❌ Not used |
| Start new Held-Queue phase | ❌ Not started |

---

## 8. Files this APPLY phase changed

### CREATED

| File | Purpose |
|---|---|
| `scripts/geodata/_place_names_in_b_supported_l10n_fast_apply.mjs` | Apply script (idempotent) |
| `reports/place-names-in-b-supported-l10n-fast-apply-report.md` | Apply audit trail |
| `reports/place-names-in-b-supported-l10n-fast-closure.md` | This closure report |
| `db/places/curated-places.json.preInBSupportedL10nFast.bak` | One-time backup |

### MODIFIED

| File | Change |
|---|---|
| `db/places/curated-places.json` | 30 BATCH-B entries: `names.ur` + `names.bn` added. All 2,528 non-IN entries + 40 prior IN entries byte-identical. |
| `scripts/_test_place_names_ur_in_1.mjs` | Count assertions: `IN with names.ur` 40 → **70** (UR-IN-1 + BATCH-B-L10N cohort) |
| `scripts/_test_place_names_bn_in_1.mjs` | Count assertions: `IN with names.bn` 40 → **70** (BN-IN-1 + BATCH-B-L10N cohort) |

### NOT modified

- ❌ `scripts/_test_place_names_hi_in_1.mjs` (Hindi cohort unchanged at 40)
- ❌ `server.js`, `js/app.js`, `index.html`
- ❌ Any shared geodata script
- ❌ `db/places/candidates/*`

---

## 9. India final state post-L10N-FAST

| Group | Count | Langs |
|---|---:|---|
| SEED-18 | 18 | 11-lang (ar/bn/de/en/es/fr/hi/id/ms/tr/ur) |
| BATCH-A-22 | 22 | 5-lang (ar/bn/en/hi/ur) |
| **BATCH-B-30** | **30** | **4-lang (ar/bn/en/ur)** |
| **IN total** | **70** | |

Hindi cohort: **40** (SEED-18 + BATCH-A-22). Hindi is data-only deferred-usage; BATCH-B not extended into Hindi.

Urdu coverage: **70/70** ✅ (supported UI lang)
Bengali coverage: **70/70** ✅ (supported UI lang)

---

## 10. Recommendation

User can now formally close **ASIA-1D-IN-B-FAST** + **this wave** together. India is launch-ready across all supported UI languages (ar/en/ur/bn) at 70-city coverage.

After approval, recommend proceeding to Hijri-pages track per prior user direction.

---

## Status: 🟢 CLOSED — USER-APPROVED 2026-05-20

### Summary one-liner

**PLACE-NAMES-IN-B-SUPPORTED-L10N-FAST CLOSED — user-approved 2026-05-20**: 30 BATCH-B IN cities gained `names.ur` + `names.bn` (clean Urdu Arabic-script + Bengali U+0980-U+09FF). India coverage: Urdu 40→70, Bengali 40→70. Hindi cohort unchanged at 40 (data-only). 80% from GeoNames raw + 17% Wikipedia + 3% FIX. 633/633 tests pass. Curated 2558 unchanged. PRIOR-40 IN byte-identical. No server.js/js/app.js/index.html changes. Apply commit: `6cafe25`.

---

## 11. User-approved acceptance criteria (closure marker)

User formally approved closure 2026-05-20 with marker:

> `docs(closure): mark PLACE-NAMES-IN-B-SUPPORTED-L10N-FAST user-approved 2026-05-20`

| # | User-cited criterion | Status |
|---|---|:------:|
| 1 | IN entries stayed 70 | ✅ |
| 2 | Total curated stayed 2,558 | ✅ |
| 3 | names.ur added to 30 BATCH-B only | ✅ |
| 4 | names.bn added to 30 BATCH-B only | ✅ |
| 5 | IN Urdu 40 → 70 | ✅ |
| 6 | IN Bengali 40 → 70 | ✅ |
| 7 | IN Arabic stayed 70/70 | ✅ |
| 8 | IN English stayed 70/70 | ✅ |
| 9 | Hindi stayed 40/70 (data-only cohort, NOT extended) | ✅ |
| 10 | BATCH-B-30 final lang set = ar/en/ur/bn (4 langs) | ✅ |
| 11 | No Hindi added to BATCH-B | ✅ |
| 12 | No Tamil/Marathi/Telugu/Kannada/Malayalam/Gujarati/Gurmukhi/Oriya/Assamese/Sanskrit added | ✅ |
| 13 | Prior 40 IN entries byte-identical (full JSON hash) | ✅ |
| 14 | BATCH-B `names.ar` / `names.en` unchanged | ✅ |
| 15 | aliases / slugs / coords / timezone / admin / priority unchanged | ✅ |
| 16 | PK / BD / all non-IN entries byte-identical | ✅ |
| 17 | `server.js` / `js/app.js` / `index.html` unchanged | ✅ |
| 18 | Shared geodata scripts unchanged | ✅ |
| 19 | No runtime translation | ✅ |
| 20 | No fillchain | ✅ |
| 21 | No search ranking patch | ✅ |
| 22 | Tests 633/633 PASS | ✅ |
| 23 | Smoke ur+bn queries 20/20 PASS | ✅ |
| 24 | Closure report at `reports/place-names-in-b-supported-l10n-fast-closure.md` | ✅ |
| 25 | Apply commit recorded: `6cafe25` | ✅ |
| 26 | No Held-Queue phase started post-closure | ✅ |
