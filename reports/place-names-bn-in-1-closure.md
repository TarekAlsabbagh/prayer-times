# PLACE-NAMES-BN-IN-1 — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `7aaa278`
**Date**: 2026-05-20
**Phase**: India Bengali enrichment — 22 BATCH-A entries (SEED-18 untouched)
**Decision**: Option A — 22 BATCH-A only in single wave
**Prerequisite**: PLACE-NAMES-BN-IN-1-PLAN user-approved 2026-05-20
**Apply script**: `scripts/geodata/_place_names_bn_in_1_apply.mjs`
**Test script**: `scripts/_test_place_names_bn_in_1.mjs`
**Audit trail**: `reports/place-names-bn-in-1-apply-report.md`

---

## ⚠️ Disambiguation re-confirmed

Country=IN (India), language=bn (Bengali). NO use of:
- `bn-geonames-*` Brunei files (Brunei country)
- `bd-geonames-*` Bangladesh files (separate country; Bengali script shared but data NOT carried into IN)
- `pk-geonames-*` Pakistan files
- `bn.mjs` / `bd.mjs` / `pk.mjs` configs

---

## 1. State before vs after

| Metric | Before | After | Δ |
|---|---:|---:|--:|
| Total curated entries | 2528 | 2528 | **0** |
| IN total entries | 40 | 40 | **0** |
| IN with `names.ar` | 40 | 40 | **0** |
| IN with `names.en` | 40 | 40 | **0** |
| IN with `names.hi` | 40 | 40 | **0** |
| IN with `names.ur` | 40 | 40 | **0** |
| **IN with `names.bn`** | **18/40 (45%)** | **40/40 (100%)** | **+22** |
| Bengali coverage SEED-18 | 18/18 | 18/18 (unchanged) | 0 |
| Bengali coverage BATCH-A-22 | 0/22 | **22/22** | **+22** |
| Total aliases.bn (across IN) | 2 (SEED-18 pre-existing only) | **13** | **+11** |

**🏆 INDIA NOW PENTA-LINGUAL ar+en+hi+ur+bn 40/40/40/40/40 — full Bengali coverage achieved.**

---

## 2. The 22 BATCH-A cities that gained `names.bn` (SEED-18 untouched)

| # | slug | `names.bn` added | source | aliases.bn added |
|---|---|---|---|---|
| 1 | `coimbatore`       | কোয়েম্বাটুর       | WIKIPEDIA  | কোভাই (Kovai) |
| 2 | `thane`            | থানে              | WIKIPEDIA  | — |
| 3 | `vadodara`         | বড়োদরা            | KEEP_RAW   | বরোদা (Baroda) |
| 4 | `pimpri-chinchwad` | পিম্পরি-চিঞ্চওয়াড় | FIX_RAW    | — |
| 5 | `nashik`           | নাশিক             | KEEP_RAW   | — |
| 6 | `madurai`          | মাদুরাই           | WIKIPEDIA  | — |
| 7 | `tirunelveli`      | তিরুনেলভেলি       | WIKIPEDIA  | — |
| 8 | `agra`             | আগ্রা             | KEEP_RAW   | — |
| 9 | `faridabad`        | ফরিদাবাদ          | WIKIPEDIA  | — |
| 10 | `jamshedpur`       | জামশেদপুর         | KEEP_RAW   | জমশেদপুর |
| 11 | `dombivali`        | দোম্বিভলি         | WIKIPEDIA  | — |
| 12 | `meerut`           | মেরঠ              | WIKIPEDIA  | মীরুট |
| 13 | `ghaziabad`        | গাজিয়াবাদ         | KEEP_RAW   | ঘাজিয়াবাদ |
| 14 | `dhanbad`          | ধানবাদ            | FIX_RAW    | — |
| 15 | `aurangabad`       | আওরঙ্গাবাদ        | KEEP_RAW   | ছত্রপতি সম্ভাজীনগর (2022 rename) |
| 16 | `varanasi`         | বারাণসী           | WIKIPEDIA  | বেনারস, কাশী |
| 17 | `amritsar`         | অমৃতসর            | KEEP_RAW   | — |
| 18 | `vijayawada`       | বিজয়ওয়াড়া         | WIKIPEDIA  | — |
| 19 | `ranchi`           | রাঁচি              | KEEP_RAW   | — |
| 20 | `prayagraj`        | প্রয়াগরাজ         | WIKIPEDIA  | এলাহাবাদ (Allahabad pre-2018) |
| 21 | `visakhapatnam`    | বিশাখাপত্তনম      | WIKIPEDIA  | ভাইজাগ (Vizag), বিশাখাপত্তম |
| 22 | `jodhpur`          | যোধপুর            | KEEP_RAW   | — |

**Total: 22 names.bn + 11 net-new aliases.bn across 9 slugs.**

---

## 3. Source breakdown

| Source | Count | % |
|---|---:|--:|
| KEEP_RAW (GeoNames raw canonical) | 9 | 41% |
| FIX_RAW (minor cleanup of raw) | 2 | 9% |
| WIKIPEDIA (Bengali Wikipedia canonical) | 11 | 50% |
| Wikidata | 0 | 0% |
| Manual transliteration | 0 | 0% |
| **TOTAL** | **22** | **100%** |

**Composition**: 50% GeoNames raw + 50% Bengali Wikipedia. No runtime translation, no LLM, no API.

---

## 4. SEED-18 byte-identity (NOT mutated)

All 18 SEED-18 entries preserved byte-identically per user spec "لا تلمس SEED-18":

| slug | names.bn (unchanged) | aliases.bn (unchanged) |
|---|---|---|
| new-delhi    | দিল্লি          | [দিল্লি] |
| mumbai       | মুম্বই          | [] |
| kolkata      | কলকাতা          | [কলকাতা] |
| hyderabad-in | হায়দরাবাদ      | [] |
| chennai      | চেন্নাই         | [] |
| bengaluru    | বেঙ্গালুরু      | [] |
| lucknow      | লখনউ            | [] |
| ahmedabad    | আহমেদাবাদ       | [] |
| pune         | পুনে            | [] |
| jaipur       | জয়পুর          | [] |
| surat        | সুরাট           | [] |
| kanpur       | কানপুর          | [] |
| indore       | ইন্দোর          | [] |
| nagpur       | নাগপুর          | [] |
| bhopal       | ভোপাল           | [] |
| patna        | পাটনা           | [] |
| srinagar     | শ্রীনগর         | [] |
| kochi        | কোচি            | [] |

Verified post-apply: `SEED-18 mutations (=0)` — both `names.bn` and `aliases.bn` and `names.<all-11-langs>` and all other fields byte-identical for every SEED entry.

---

## 5. Bengali script guard — 100% pass

Strict `isCleanBengaliScript()` validator:

```js
const BENGALI_BLOCK    = /[ঀ-৿]/;        // U+0980-U+09FF — REQUIRED
const ASSAMESE_ONLY    = /[ৰৱ]/;          // U+09F0 ৰ + U+09F1 ৱ — reject
const LATIN            = /[A-Za-z]/;      // reject
const DEVANAGARI       = /[ऀ-ॿ]/;         // U+0900-U+097F — reject Hindi
const ARABIC           = /[؀-ۿ]/;         // U+0600-U+06FF — reject Arabic/Urdu
const TAMIL            = /[஀-௿]/;         // U+0B80-U+0BFF — reject
const GURMUKHI         = /[਀-੿]/;          // U+0A00-U+0A7F — reject
const GUJARATI         = /[઀-૿]/;          // U+0A80-U+0AFF — reject
const TELUGU_KANNADA   = /[ఀ-ೞ]/;          // U+0C00-U+0CDE — reject
const MALAYALAM        = /[ഀ-ൿ]/;         // U+0D00-U+0D7F — reject
```

Same guard as BN-BD-1 (proven viable for 13 BD cities). Re-used for consistency.

| Check | Count | Result |
|---|---:|:---:|
| `names.bn` strings (all 40 IN entries) | 40 | **100% pass** ✓ |
| `aliases.bn` strings (across 40 IN entries) | 13 | **100% pass** ✓ |
| Latin contamination | 0 | ✓ |
| Devanagari contamination | 0 | ✓ |
| Arabic/Urdu contamination | 0 | ✓ |
| Tamil / Gurmukhi / Gujarati / Telugu / Kannada / Malayalam | 0 | ✓ |
| Assamese-only letters ৰ ৱ | 0 | ✓ (audit found 5 raw Assamese-leaks; none picked) |

---

## 6. Tests run

### Custom verification (offline)

| Test | Result |
|---|:---|
| `scripts/_test_place_names_bn_in_1.mjs` (this wave) | **113/113 pass** ✅ |
|   ├─ Group 1: Counts (7 checks) | ✓ |
|   ├─ Group 2: Bengali script guard | ✓ |
|   ├─ Group 3: BATCH-A-22 canonical names match plan §3 (22) | ✓ |
|   ├─ Group 4: SEED-18 names.bn byte-identical (18) | ✓ |
|   ├─ Group 5: SEED-18 lang set 11-lang (18) | ✓ |
|   ├─ Group 6: BATCH-A-22 lang set [ar,bn,en,hi,ur] (22) | ✓ |
|   ├─ Group 7: No other Indian-lang names (10 langs) | ✓ |
|   ├─ Group 8: 9 spot-check aliases (varanasi/prayagraj/etc.) | ✓ |
|   ├─ Group 9: No Indic-script contamination | ✓ |
|   └─ Group 10: SEED-18 aliases.bn unchanged (2) | ✓ |
| `_test_place_names_ur_in_1.mjs` (relaxed Group 6 set-inclusion) | **122/122 pass** ✅ |
| `_test_place_names_hi_in_1.mjs` (relaxed Group 5 set-inclusion) | **116/116 pass** ✅ |

### Carry-forward regression (offline)

| Test | Result |
|---|:---|
| `_test_fill_lang_map.mjs` | **11/11 pass** ✅ |
| `_test_stage_3_religious_exemption.mjs` | **32/32 pass** ✅ |
| `_test_stage_3_large_country_output_fix.mjs` | **33/33 pass** ✅ |
| `_test_persian_pregate_design.mjs` | **23/23 pass** ✅ |

### Carry-forward regression (server-online)

| Test | Result |
|---|:---|
| `_test_place_by_slug.mjs` | **44/44 pass** ✅ |
| `_test_city_page_l10n.mjs` | **152/152 pass** ✅ |
| `_test_home_search_migration.mjs` | **33/33 pass** ✅ |
| `_test_external_provider_2.mjs` | **32/32 pass** ✅ |
| `_test_external_cache.mjs` | **13/13 pass** ✅ |
| `_test_search_ar.mjs` | **22/22 pass** ✅ |
| `_test_home_title_stability.mjs` | **10/10 pass** ✅ |
| `_test_lang_guard.mjs` | **5/5 pass** ✅ |
| `_test_place_names_ur_pk_6.mjs` | **69/69 pass** ✅ |
| `_test_place_names_ur_ir_1.mjs` | **66/66 pass** ✅ |
| `_test_place_names_ur_af_1.mjs` | **41/41 pass** ✅ |
| `_test_asia_1d_pk_search.mjs` | **29/29 pass** ✅ |
| `_test_asia_1d_pk_mcf.mjs` | **61/61 pass** ✅ |

### Bengali end-to-end search verification (server-online)

20/20 Bengali queries via `/api/search-place`:

| Query | Resolves to | |
|---|---|:---:|
| বারাণসী | varanasi | ✓ |
| প্রয়াগরাজ | prayagraj | ✓ |
| এলাহাবাদ (alias.bn) | prayagraj | ✓ |
| বড়োদরা | vadodara | ✓ |
| বরোদা (alias.bn) | vadodara | ✓ |
| মেরঠ | meerut | ✓ |
| মীরুট (alias.bn) | meerut | ✓ |
| বেনারস (alias.bn) | varanasi | ✓ |
| কাশী (alias.bn) | varanasi | ✓ |
| আওরঙ্গাবাদ | aurangabad | ✓ |
| ছত্রপতি সম্ভাজীনগর (alias.bn) | aurangabad | ✓ |
| বিশাখাপত্তনম | visakhapatnam | ✓ |
| ভাইজাগ (alias.bn) | visakhapatnam | ✓ |
| কোয়েম্বাটুর | coimbatore | ✓ |
| কোভাই (alias.bn) | coimbatore | ✓ |
| পিম্পরি-চিঞ্চওয়াড় | pimpri-chinchwad | ✓ |
| বিজয়ওয়াড়া | vijayawada | ✓ |
| অমৃতসর | amritsar | ✓ |
| যোধপুর | jodhpur | ✓ |
| জামশেদপুর | jamshedpur | ✓ |

### SSR /bn/ verification (server-online)

5/5 spot-check pages contain new Bengali names in SSR output:
- /bn/prayer-times-in-varanasi contains বারাণসী ✓
- /bn/prayer-times-in-prayagraj contains প্রয়াগরাজ ✓
- /bn/prayer-times-in-meerut contains মেরঠ ✓
- /bn/prayer-times-in-aurangabad contains আওরঙ্গাবাদ ✓
- /bn/prayer-times-in-agra contains আগ্রা ✓

### Grand total

| Tier | Count |
|---|---:|
| New BN-IN-1 dedicated tests | **113/113** ✅ |
| Updated UR-IN-1 (set-inclusion) | **122/122** ✅ |
| Updated HI-IN-1 (set-inclusion) | **116/116** ✅ |
| Offline carry-forward | **99/99** ✅ |
| Server-online carry-forward | **577/577** ✅ |
| Bengali e2e search | **20/20** ✅ |
| SSR /bn/ spot-check | **5/5** ✅ |
| **Total** | **1,052/1,052 zero failures** ✅ |

---

## 7. Confirmation matrix — all "NOT done" items

| Forbidden action | Confirmation |
|---|:---:|
| Mutate any SEED-18 entry | ❌ Not done (18 entries byte-identical) |
| Modify `names.ar` | ❌ Not done (40/40 unchanged) |
| Modify `names.en` | ❌ Not done (40/40 unchanged) |
| Modify `names.hi` | ❌ Not done (40/40 unchanged) |
| Modify `names.ur` | ❌ Not done (40/40 unchanged) |
| Modify `aliases.ar` / `aliases.en` / `aliases.hi` / `aliases.ur` | ❌ Not done |
| Modify any `slug` | ❌ Not done |
| Modify coordinates / timezone / admin / priority / source / verified / type | ❌ Not done |
| Add cities / delete cities | ❌ Not done (2528→2528, IN 40→40) |
| Add other Indian-lang names (ta/mr/te/kn/ml/gu/pa/or/as/sa) | ❌ Not done (10/10 checks PASS) |
| Modify non-IN entries | ❌ Not done (hash check 0 diffs across 2488 non-IN) |
| Use runtime translation | ❌ Not used (50% GeoNames raw + 50% Bengali Wikipedia) |
| Use fillchain | ❌ Not used (fillLangMap intact 11/11) |
| Modify `validate_candidates.mjs` / `_geonames_common.mjs` / `normalize_places.mjs` / `apply_curated_candidates.mjs` | ❌ Not modified |
| Modify `server.js` / `js/app.js` / `index.html` | ❌ Not modified |
| Use Brunei / Bangladesh / Pakistan data | ❌ Not used |
| Start Held-Queue phase | ❌ Not started (see §9) |

---

## 8. Files this APPLY phase changed

### CREATED

| File | Purpose |
|---|---|
| `scripts/geodata/_place_names_bn_in_1_apply.mjs` | Apply script (idempotent) |
| `scripts/_test_place_names_bn_in_1.mjs` | Offline verification suite (113 tests) |
| `reports/place-names-bn-in-1-apply-report.md` | Audit trail |
| `reports/place-names-bn-in-1-closure.md` | This closure report |
| `reports/place-names-bn-in-1-plan.md` | Plan report (from prior phase) |
| `scripts/geodata/_place_names_bn_in_1_audit.mjs` | Read-only audit (from prior phase) |
| `db/places/curated-places.json.prePlaceNamesBnIn1.bak` | One-time backup |

### MODIFIED

| File | Change |
|---|---|
| `db/places/curated-places.json` | 22 BATCH-A IN entries gained `names.bn` + 11 net-new `aliases.bn`. No other IN field touched; SEED-18 byte-identical; non-IN entries byte-identical. |
| `scripts/_test_place_names_ur_in_1.mjs` | Group 6 relaxed from strict-equal `[ar,en,hi,ur]` to set-inclusion `includes [ar,en,hi,ur]` — future-proofs against BN/TA/MR waves adding more langs. UR scope unchanged (ar/en/hi/ur still required). |

### NOT modified

- ❌ `scripts/geodata/validate_candidates.mjs`
- ❌ `scripts/geodata/_geonames_common.mjs`
- ❌ `scripts/geodata/normalize_places.mjs`
- ❌ `scripts/geodata/apply_curated_candidates.mjs`
- ❌ `scripts/geodata/countries/in.mjs` / any country config
- ❌ `server.js`, `js/app.js`, `index.html`
- ❌ `db/places/candidates/*` (no Stage 4 invoked)
- ❌ `scripts/_test_place_names_hi_in_1.mjs` (already future-proofed during UR-IN-1)
- ❌ MEMORY.md (deferred to post-user-approval)

---

## 9. Held queue (per user direction — NOT auto-started)

- ❌ PLACE-NAMES-TA-IN-1 (India Tamil — held)
- ❌ PLACE-NAMES-MR-IN-1 (India Marathi — held)
- ❌ PLACE-NAMES-HI-IN-LOCALE-ROUTING-1 (Hindi /hi/ — held)
- ❌ ASIA-1D-IN-B (India BATCH-B — held)
- ❌ ASIA-1F (China — held)
- ❌ AMERICAS-1B-MCF (held)
- ❌ SEARCH-RANKING-IMPROVEMENT-1 (held)
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1 (held)
- ❌ ASIA-1D-BD-MCF (held)
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B (held)
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1 (held)
- ❌ SEED-18 alias polish for IN (3 proposed: mumbai+বম্বে, chennai+মাদ্রাজ, bengaluru+বাঙ্গালোর — held)

---

## 10. Acceptance criteria — all met

| # | Criterion | Status |
|---|---|:---:|
| 1 | IN total remains 40 | ✓ |
| 2 | Total curated unchanged | ✓ (2528 → 2528) |
| 3 | IN Bengali 40/40 | ✓ (18/40 → 40/40) |
| 4 | BATCH-A-22 only gained names.bn | ✓ |
| 5 | SEED-18 byte-identical | ✓ |
| 6 | IN Arabic 40/40 unchanged | ✓ |
| 7 | IN English 40/40 unchanged | ✓ |
| 8 | IN Hindi 40/40 unchanged | ✓ |
| 9 | IN Urdu 40/40 unchanged | ✓ |
| 10 | All names.bn pass strict Bengali guard | ✓ (40/40) |
| 11 | All aliases.bn pass guard | ✓ (13/13) |
| 12 | No slug changes | ✓ |
| 13 | No geodata changes | ✓ |
| 14 | No add/delete cities | ✓ |
| 15 | No other Indian-lang names added | ✓ |
| 16 | No runtime translation | ✓ |
| 17 | No fillchain | ✓ |
| 18 | No `server.js` / `js/app.js` / `index.html` mutation | ✓ |
| 19 | No shared script mutation | ✓ |
| 20 | Bengali search end-to-end works | ✓ (20/20) |
| 21 | SSR /bn/ pages render new Bengali | ✓ (5/5) |
| 22 | No Held-Queue phase started | ✓ |

---

## 11. Recommendation for next step

Given **India penta-lingual milestone** (Arabic 40/40 + English 40/40 + Hindi 40/40 + Urdu 40/40 + **Bengali 40/40**), candidate follow-ups await user direction (NO auto-start):

1. **PLACE-NAMES-TA-IN-1** — Tamil enrichment for TN/PY-heavy entries (chennai, coimbatore, madurai, tirunelveli, etc.).
2. **PLACE-NAMES-MR-IN-1** — Marathi for MH cities (mumbai, pune, nashik, aurangabad, thane, pimpri-chinchwad, dombivali).
3. **ASIA-1D-IN-B** — India BATCH-B more major cities (~30-50 next-tier).
4. **SEED-18 alias polish** — 3 proposed Bengali additions (mumbai+বম্বে Bombay, chennai+মাদ্রাজ Madras, bengaluru+বাঙ্গালোর Bangalore).

User direction required.

---

## Status: 🟢 CLOSED — USER-APPROVED 2026-05-20

### Summary one-liner

**PLACE-NAMES-BN-IN-1 (Option A) CLOSED — user-approved 2026-05-20**: 22 BATCH-A IN entries gained clean Bengali `names.bn` + 11 net-new `aliases.bn`. India is now **penta-lingual ar+en+hi+ur+bn 40/40/40/40/40**. SEED-18 byte-identical. Zero mutations to non-Bengali fields. 1,052/1,052 tests pass. Curated 2528 unchanged, IN 40 unchanged. Apply commit: `7aaa278`.

---

## 12. User-approved acceptance criteria (closure marker)

User formally approved closure 2026-05-20 with marker:

> `docs(closure): mark PLACE-NAMES-BN-IN-1 user-approved 2026-05-20`

Documented acceptance checklist (mirrors §10 plus user-cited criteria):

| # | User-cited criterion | Status |
|---|---|:------:|
| 1 | IN Bengali 18/40 → 40/40 | ✅ |
| 2 | IN total stayed 40 | ✅ |
| 3 | Total curated stayed 2,528 | ✅ |
| 4 | BATCH-A-22 only gained names.bn (no SEED-18 mutation) | ✅ |
| 5 | SEED-18 byte-identical (names + aliases + all metadata) | ✅ |
| 6 | IN Arabic unchanged (40/40) | ✅ |
| 7 | IN English unchanged (40/40) | ✅ |
| 8 | IN Hindi unchanged (40/40) | ✅ |
| 9 | IN Urdu unchanged (40/40) | ✅ |
| 10 | No new city added | ✅ |
| 11 | No city deleted | ✅ |
| 12 | No slug / coordinate / timezone / admin / priority / source / verified / type changes | ✅ |
| 13 | No `names.ar` / `names.en` / `names.hi` / `names.ur` mutations | ✅ |
| 14 | No `aliases.ar` / `aliases.en` / `aliases.hi` / `aliases.ur` mutations | ✅ |
| 15 | No other Indian-language `names` added (ta/mr/te/kn/ml/gu/pa/or/as/sa) | ✅ |
| 16 | `aliases.bn` only documented entries (11 net-new across 9 slugs) | ✅ |
| 17 | Bengali script guard 100% pass | ✅ |
| 18 | Bengali end-to-end search OK via `/api/search-place` | ✅ (20/20) |
| 19 | Alias lookups OK (Banaras→varanasi, Allahabad→prayagraj, Vizag→visakhapatnam, Chhatrapati Sambhajinagar→aurangabad) | ✅ |
| 20 | SSR `/bn/` spot-check pass | ✅ (5/5) |
| 21 | No runtime translation (Google/OpenAI/Anthropic/browser) | ✅ |
| 22 | No fillchain (fillLangMap unit tests intact 11/11) | ✅ |
| 23 | `server.js` / `js/app.js` / `index.html` unchanged | ✅ |
| 24 | `validate_candidates.mjs` / `_geonames_common.mjs` / `normalize_places.mjs` / `apply_curated_candidates.mjs` unchanged | ✅ |
| 25 | `scripts/_test_place_names_ur_in_1.mjs` Group 6 relaxed (future-proof set-inclusion only — no data/runtime change) | ✅ (user-acknowledged in approval) |
| 26 | Tests 1,052/1,052 PASS | ✅ |
| 27 | Closure report at `reports/place-names-bn-in-1-closure.md` | ✅ |
| 28 | Apply commit recorded: `7aaa278` | ✅ |
| 29 | No Held-Queue phase started post-closure | ✅ |
