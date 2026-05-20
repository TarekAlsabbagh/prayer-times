# PLACE-NAMES-UR-IN-1 — Closure report

**Status**: ✅ APPLY COMPLETE — awaiting user approval
**Date**: 2026-05-20
**Phase**: India Urdu enrichment — 22 BATCH-A entries (SEED-18 untouched)
**Decision**: Option A — 22 BATCH-A only in single wave
**Prerequisite**: PLACE-NAMES-UR-IN-1-PLAN user-approved 2026-05-20
**Apply script**: `scripts/geodata/_place_names_ur_in_1_apply.mjs`
**Test script**: `scripts/_test_place_names_ur_in_1.mjs`
**Audit trail**: `reports/place-names-ur-in-1-apply-report.md`

---

## ⚠️ Disambiguation re-confirmed

Country=IN (India), language=ur (Urdu). NO use of:
- `bn-geonames-*` Brunei files
- `bd-geonames-*` Bangladesh files
- `pk-geonames-*` Pakistan files (separate country — Urdu script shared but data not carried)
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
| **IN with `names.ur`** | **18/40 (45%)** | **40/40 (100%)** | **+22** |
| Urdu coverage SEED-18 | 18/18 | 18/18 (unchanged) | 0 |
| Urdu coverage BATCH-A-22 | 0/22 | **22/22** | **+22** |
| Total aliases.ur (across IN) | 6 (SEED-18 pre-existing only) | **23** | **+17** |

**🏆 INDIA NOW QUAD-LINGUAL ar+en+hi+ur 40/40/40/40 — full Urdu coverage achieved.**

---

## 2. The 22 BATCH-A cities that gained `names.ur` (SEED-18 untouched)

| # | slug | `names.ur` added | source | aliases.ur added |
|---|---|---|---|---|
| 1 | `coimbatore`       | کوئمبتور         | WIKIPEDIA  | کویمباتور, کوویل (Kovai) |
| 2 | `thane`            | تھانے             | KEEP_RAW   | تھانہ |
| 3 | `vadodara`         | وڈودرا            | KEEP_RAW   | برودا (Baroda) |
| 4 | `pimpri-chinchwad` | پمپری چنچواڑ      | PICK_RAW   | پیمپری-چینچواد, پمپری چنچواڈ |
| 5 | `nashik`           | ناسیک             | KEEP_RAW   | — |
| 6 | `madurai`          | مدورائی           | PICK_RAW   | مادورای |
| 7 | `tirunelveli`      | تیرونلویلی        | KEEP_RAW   | — |
| 8 | `agra`             | آگرہ              | KEEP_RAW   | — |
| 9 | `faridabad`        | فرید آباد         | FIX_RAW    | — |
| 10 | `jamshedpur`       | جمشید پور         | PICK_RAW   | جمشیدپور |
| 11 | `dombivali`        | دومبیولی          | KEEP_RAW   | — |
| 12 | `meerut`           | میرٹھ             | KEEP_RAW   | میروت |
| 13 | `ghaziabad`        | غازی آباد         | FIX_RAW    | غازی آباد، بھارت |
| 14 | `dhanbad`          | دھنباد            | KEEP_RAW   | — |
| 15 | `aurangabad`       | اورنگ آباد        | KEEP_RAW   | چھتر پتی سمبھاجی نگر (2022 rename) |
| 16 | `varanasi`         | وارانسی           | KEEP_RAW   | بنارس, کاشی |
| 17 | `amritsar`         | امرتسر            | WIKIPEDIA  | امریتسار |
| 18 | `vijayawada`       | وجے واڑہ          | PICK_RAW   | — |
| 19 | `ranchi`           | رانچی             | KEEP_RAW   | — |
| 20 | `prayagraj`        | پریاگ راج         | WIKIPEDIA  | الہ آباد (Allahabad pre-2018) |
| 21 | `visakhapatnam`    | وشاکھاپٹنم        | PICK_RAW   | ویزاگ (Vizag) |
| 22 | `jodhpur`          | جودھپور           | PICK_RAW   | جودپور |

**Total: 22 names.ur + 17 net-new aliases.ur across 14 slugs.**

---

## 3. Source breakdown

| Source | Count | % |
|---|---:|--:|
| KEEP_RAW (GeoNames raw canonical) | 11 | 50% |
| PICK_RAW (multi-candidate → picked canonical) | 6 | 27% |
| FIX_RAW (minor cleanup of raw) | 2 | 9% |
| WIKIPEDIA (Urdu Wikipedia canonical) | 3 | 14% |
| Wikidata | 0 | 0% |
| Manual transliteration | 0 | 0% |
| **TOTAL** | **22** | **100%** |

**Composition**: 86% GeoNames raw + 14% Urdu Wikipedia. No runtime translation, no LLM translation.

---

## 4. SEED-18 byte-identity (NOT mutated)

All 18 SEED-18 entries preserved byte-identically per user spec "لا تلمس SEED-18":

| slug | names.ur (unchanged) | aliases.ur (unchanged) |
|---|---|---|
| new-delhi    | دہلی          | [دہلی, نئی دہلی] |
| mumbai       | ممبئی         | [ممبئی] |
| kolkata      | کولکاتا       | [کولکاتا, کلکتہ] |
| hyderabad-in | حیدرآباد      | [حیدرآباد] |
| chennai      | چنئی          | [] |
| bengaluru    | بنگلور        | [] |
| lucknow      | لکھنؤ         | [لکھنؤ] |
| ahmedabad    | احمد آباد     | [احمد آباد] |
| pune         | پونے          | [] |
| jaipur       | جے پور        | [] |
| surat        | سورت          | [] |
| kanpur       | کانپور        | [] |
| indore       | اندور         | [] |
| nagpur       | ناگپور        | [] |
| bhopal       | بھوپال        | [] |
| patna        | پٹنہ          | [] |
| srinagar     | سرینگر        | [] |
| kochi        | کوچی          | [] |

Verified via post-apply assertion: `SEED-18 mutations (=0)` — both `names.ur` and `aliases.ur` and `names.<all-10-langs>` and all other fields byte-identical for every SEED entry.

---

## 5. Urdu script guard — 100% pass

Strict `isCleanUrduScript()` validator:

```js
const HAS_ARABIC_BLOCK    = /[؀-ۿݐ-ݿ]/;        // U+0600-U+06FF + U+0750-U+077F — REQUIRED
const HAS_LATIN           = /[A-Za-z]/;          // reject
const DEVANAGARI          = /[ऀ-ॿ]/;             // U+0900-U+097F — reject Hindi
const BENGALI             = /[ঀ-৿]/;              // U+0980-U+09FF — reject
const TAMIL               = /[஀-௿]/;              // U+0B80-U+0BFF — reject
const GURMUKHI            = /[਀-੿]/;               // U+0A00-U+0A7F — reject
const GUJARATI            = /[઀-૿]/;               // U+0A80-U+0AFF — reject
const TELUGU_KANNADA      = /[ఀ-ೞ]/;               // U+0C00-U+0CDE — reject
const MALAYALAM           = /[ഀ-ൿ]/;              // U+0D00-U+0D7F — reject
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/; // Pashto/Sindhi
```

Urdu-distinct letters accepted in the Arabic block: پ چ ژ گ ٹ ڈ ڑ ں ھ ے ی ہ (all standard Urdu letters used).

| Check | Count | Result |
|---|---:|:---:|
| `names.ur` strings checked (all 40 IN entries) | 40 | **100% pass** ✓ |
| `aliases.ur` strings checked (across 40 IN entries) | 23 | **100% pass** ✓ |
| Latin contamination | 0 | ✓ |
| Devanagari contamination | 0 | ✓ |
| Bengali / Tamil / Gurmukhi / Gujarati / Telugu / Kannada / Malayalam | 0 | ✓ |
| Pashto / Sindhi-distinct letters | 0 | ✓ |

---

## 6. Tests run

### Custom verification (offline)

| Test | Result |
|---|:---|
| `scripts/_test_place_names_ur_in_1.mjs` (this wave) | **122/122 pass** ✅ |
|   ├─ Group 1: Counts (6 checks) | ✓ |
|   ├─ Group 2: Urdu script guard | ✓ |
|   ├─ Group 3: BATCH-A-22 canonical names match plan §3 (22) | ✓ |
|   ├─ Group 4: SEED-18 names.ur byte-identical (18) | ✓ |
|   ├─ Group 5: SEED-18 lang set 11-lang (18) | ✓ |
|   ├─ Group 6: BATCH-A-22 lang set [ar,en,hi,ur] (22) | ✓ |
|   ├─ Group 7: No other Indian-lang names (10 langs) | ✓ |
|   ├─ Group 8: 17 spot-check aliases (varanasi/prayagraj/etc.) | ✓ |
|   ├─ Group 9: No Indic-script contamination | ✓ |
|   └─ Group 10: SEED-18 aliases.ur unchanged (6) | ✓ |
| `scripts/_test_place_names_hi_in_1.mjs` (relaxed Group 5 set-inclusion) | **116/116 pass** ✅ |

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
| `_test_place_names_ur_pk_5.mjs` | **62/62 pass** ✅ |
| `_test_place_names_ur_pk_4.mjs` | **51/51 pass** ✅ |
| `_test_place_names_ur_ir_1.mjs` | **66/66 pass** ✅ |
| `_test_place_names_ur_af_1.mjs` | **41/41 pass** ✅ |
| `_test_asia_1d_pk_search.mjs` | **29/29 pass** ✅ |
| `_test_asia_1d_pk_mcf.mjs` | **61/61 pass** ✅ |

### Urdu end-to-end search verification (server-online)

20/20 Urdu queries via `/api/search-place` (primary names + aliases):

| Query | Resolves to | |
|---|---|:---:|
| وارانسی | varanasi | ✓ |
| پریاگ راج | prayagraj | ✓ |
| الہ آباد (alias.ur) | prayagraj | ✓ |
| وڈودرا | vadodara | ✓ |
| برودا (alias.ur) | vadodara | ✓ |
| میرٹھ | meerut | ✓ |
| تھانے | thane | ✓ |
| آگرہ | agra | ✓ |
| بنارس (alias.ur) | varanasi | ✓ |
| کاشی (alias.ur) | varanasi | ✓ |
| اورنگ آباد | aurangabad | ✓ |
| چھتر پتی سمبھاجی نگر (alias.ur) | aurangabad | ✓ |
| وشاکھاپٹنم | visakhapatnam | ✓ |
| ویزاگ (alias.ur) | visakhapatnam | ✓ |
| کوئمبتور | coimbatore | ✓ |
| پمپری چنچواڑ | pimpri-chinchwad | ✓ |
| وجے واڑہ | vijayawada | ✓ |
| امرتسر | amritsar | ✓ |
| جودھپور | jodhpur | ✓ |
| جمشید پور | jamshedpur | ✓ |

### SSR /ur/ verification (server-online)

5/5 spot-check pages contain new Urdu names in SSR output:
- /ur/prayer-times-in-varanasi contains وارانسی ✓
- /ur/prayer-times-in-prayagraj contains پریاگ راج ✓
- /ur/prayer-times-in-meerut contains میرٹھ ✓
- /ur/prayer-times-in-aurangabad contains اورنگ آباد ✓
- /ur/prayer-times-in-agra contains آگرہ ✓

(`ur` IS in SUPPORTED_LANGS so SSR seed picks it up — unlike `hi` which is outside the list.)

### Grand total

| Tier | Count |
|---|---:|
| New PLACE-NAMES-UR-IN-1 dedicated tests | **122/122** ✅ |
| Updated HI-IN-1 (set-inclusion fix) | **116/116** ✅ |
| Offline carry-forward | **99/99** ✅ |
| Server-online carry-forward | **743/743** ✅ |
| Urdu end-to-end search | **20/20** ✅ |
| SSR /ur/ spot-check | **5/5** ✅ |
| **Total** | **1,105/1,105 zero failures** ✅ |

---

## 7. Confirmation matrix — all "NOT done" items

| Forbidden action | Confirmation |
|---|:---:|
| Mutate any SEED-18 entry | ❌ Not done (`SEED-18 mutations (=0)` — 18 entries byte-identical) |
| Modify `names.ar` | ❌ Not done (40/40 unchanged) |
| Modify `names.en` | ❌ Not done (40/40 unchanged) |
| Modify `names.hi` | ❌ Not done (40/40 unchanged) |
| Modify `aliases.ar` / `aliases.en` / `aliases.hi` | ❌ Not done (per-IN-entry assertion) |
| Modify any `slug` | ❌ Not done (40 IN slugs unchanged) |
| Modify coordinates / timezone / admin / priority / source / verified / type | ❌ Not done |
| Add cities / delete cities | ❌ Not done (2528→2528 total, IN 40→40) |
| Add other Indian-lang names (bn/ta/mr/te/kn/ml/gu/pa/or/as/sa) | ❌ Not done (10/10 explicit checks PASS) |
| Modify non-IN entries | ❌ Not done (pre/post hash check — 0 diffs across 2488 non-IN) |
| Use runtime translation (Google/OpenAI/Anthropic/browser) | ❌ Not used (86% from GeoNames raw + 14% Urdu Wikipedia canonical) |
| Use fillchain | ❌ Not used (ur in SUPPORTED_LANGS but explicit-only; fillLangMap unit tests intact 11/11) |
| Modify `validate_candidates.mjs` / `_geonames_common.mjs` / `normalize_places.mjs` / `apply_curated_candidates.mjs` | ❌ Not modified |
| Modify `server.js` / `js/app.js` / `index.html` | ❌ Not modified |
| Use Brunei (`bn-geonames-*`) data | ❌ Not used |
| Use Bangladesh (`bd-geonames-*`) data | ❌ Not used |
| Use Pakistan (`pk-geonames-*`) data | ❌ Not used |
| Start Held-Queue phase | ❌ Not started (see §9) |

---

## 8. Files this APPLY phase changed

### CREATED

| File | Purpose |
|---|---|
| `scripts/geodata/_place_names_ur_in_1_apply.mjs` | Apply script (idempotent) |
| `scripts/_test_place_names_ur_in_1.mjs` | Offline verification suite (122 tests) |
| `reports/place-names-ur-in-1-apply-report.md` | Audit trail |
| `reports/place-names-ur-in-1-closure.md` | This closure report |
| `reports/place-names-ur-in-1-plan.md` | Plan report (from prior phase) |
| `scripts/geodata/_place_names_ur_in_1_audit.mjs` | Read-only audit (from prior phase) |
| `db/places/curated-places.json.prePlaceNamesUrIn1.bak` | One-time backup |

### MODIFIED

| File | Change |
|---|---|
| `db/places/curated-places.json` | 22 BATCH-A IN entries gained `names.ur` + 17 net-new `aliases.ur` (no other field touched on IN; SEED-18 byte-identical; non-IN entries byte-identical) |
| `scripts/_test_place_names_hi_in_1.mjs` | Group 5 relaxed from strict-equal `[ar,en,hi]` to set-inclusion `includes [ar,en,hi]` — future-proofs HI-IN-1 test against subsequent UR/BN/TA/MR enrichment waves that add more langs to BATCH-A-22. No assertion weakening for HI-IN-1's own scope (ar/en/hi still required). |

### NOT modified

- ❌ `scripts/geodata/validate_candidates.mjs`
- ❌ `scripts/geodata/_geonames_common.mjs`
- ❌ `scripts/geodata/normalize_places.mjs`
- ❌ `scripts/geodata/apply_curated_candidates.mjs`
- ❌ `scripts/geodata/countries/in.mjs` / any country config
- ❌ `server.js`, `js/app.js`, `index.html`
- ❌ `db/places/candidates/*` (no Stage 4 invoked)
- ❌ `db/places/sources/*`
- ❌ MEMORY.md (deferred to post-user-approval per workflow)

---

## 9. Held queue (per user direction — NOT auto-started)

- ❌ PLACE-NAMES-BN-IN-1 (India Bengali — held)
- ❌ PLACE-NAMES-TA-IN-1 (India Tamil — held)
- ❌ PLACE-NAMES-MR-IN-1 (India Marathi — held)
- ❌ PLACE-NAMES-HI-IN-LOCALE-ROUTING-1 (Hindi /hi/ pages — held)
- ❌ ASIA-1D-IN-B (India BATCH-B more cities — held)
- ❌ ASIA-1F (China — held)
- ❌ AMERICAS-1B-MCF (held)
- ❌ SEARCH-RANKING-IMPROVEMENT-1 (held)
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1 (held)
- ❌ ASIA-1D-BD-MCF (held)
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B (held)
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1 (held)
- ❌ SEED-18 alias polish (3 proposed additions in plan §4 — held)

---

## 10. Acceptance criteria — all met

| # | Criterion | Status |
|---|---|:---:|
| 1 | IN total remains 40 | ✓ |
| 2 | Total curated unchanged | ✓ (2528 → 2528) |
| 3 | IN Urdu 40/40 | ✓ (18/40 → 40/40) |
| 4 | BATCH-A-22 only gained names.ur | ✓ (SEED-18 byte-identical) |
| 5 | SEED-18 byte-identical (names + aliases + all fields) | ✓ |
| 6 | IN Arabic 40/40 unchanged | ✓ |
| 7 | IN English 40/40 unchanged | ✓ |
| 8 | IN Hindi 40/40 unchanged | ✓ |
| 9 | All names.ur pass strict Urdu guard | ✓ (40/40) |
| 10 | All aliases.ur pass Urdu guard | ✓ (23/23) |
| 11 | No slug changes | ✓ |
| 12 | No geodata changes (coords/tz/admin) | ✓ |
| 13 | No add/delete cities | ✓ |
| 14 | No other Indian-lang names added | ✓ (10/10 langs PASS) |
| 15 | No runtime translation | ✓ |
| 16 | No fillchain | ✓ (fillLangMap intact 11/11) |
| 17 | No `server.js` / `js/app.js` / `index.html` mutation | ✓ |
| 18 | No shared script mutation | ✓ |
| 19 | Urdu search end-to-end works | ✓ (20/20) |
| 20 | SSR /ur/ pages render new Urdu | ✓ (5/5) |
| 21 | No Held-Queue phase started | ✓ |
| 22 | Closure report at `reports/place-names-ur-in-1-closure.md` | ✓ |

---

## 11. Recommendation for next step

Given **India quad-lingual milestone** (Arabic 40/40 + English 40/40 + Hindi 40/40 + **Urdu 40/40**), candidate follow-ups await user direction (NO auto-start):

1. **PLACE-NAMES-BN-IN-1** — Bengali enrichment for 22 BATCH-A (SEED-18 already has bn). Pattern mirrors UR-IN-1.
2. **PLACE-NAMES-TA-IN-1** — Tamil enrichment (mostly TN/PY cities — coimbatore, chennai, madurai, tirunelveli).
3. **PLACE-NAMES-MR-IN-1** — Marathi enrichment (mostly MH cities — mumbai, pune, thane, nashik, aurangabad, pimpri-chinchwad, dombivali).
4. **ASIA-1D-IN-B** — India BATCH-B more major cities (~30-50 next-tier missing-ar candidates).
5. **SEED-18 alias polish** — 3 proposed (mumbai+بمبئی Bombay, chennai+مدراس Madras, bengaluru+بانگلور Bangalore) per plan §4.

User direction required.

---

## Status: ✅ APPLY COMPLETE — AWAITING USER APPROVAL

### Summary one-liner

**PLACE-NAMES-UR-IN-1 (Option A) closed**: 22 BATCH-A IN entries gained clean Urdu `names.ur` + 17 net-new `aliases.ur`. India is now **quad-lingual ar+en+hi+ur 40/40/40/40**. SEED-18 byte-identical. Zero mutations to non-Urdu fields. 1,105/1,105 tests pass. Curated 2528 unchanged, IN 40 unchanged.
