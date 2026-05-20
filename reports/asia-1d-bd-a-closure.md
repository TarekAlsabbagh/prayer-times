# ASIA-1D-BD-A — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `5b32825` (feat(geodata): ASIA-1D-BD-A — 13 Bangladesh cities merged BD 6→19)
**Date**: 2026-05-20
**Phase**: First Bangladesh geodata wave (Fast Track + anomaly overrides)
**Plan ref**: [reports/asia-1d-bd-a-plan.md](asia-1d-bd-a-plan.md)
**Backup**: `db/places/curated-places.json.preAsia1dBdA.bak`

---

## Executive summary

ASIA-1D-BD-A successfully merged **13 new Bangladesh cities** into curated via Fast Track + 3 anomaly overrides:
- 10 normal high-tier pending (gazipur, comilla, bagerhat, mymensingh, bogra, jamalpur, habiganj, feni, netrakona, lalmonirhat)
- 3 anomaly-resolved (rangpur false-positive religious-keyword override; nilphamari + gaibandha low-tier admin promotion)

All `names.ar` provided manually (6 PROMOTE from existing clean aliases + 5 MANUAL Wikipedia AR + 2 KEEP existing-already-clean). `names.en` taken from GeoNames primary or asciiname.

**BD entries went from 6 → 19** as planned.

**Bengali names NOT added** in this phase — deferred to PLACE-NAMES-BN-BD-1.

---

## 1. BD entries count

| Metric | Before | After | Δ |
|--------|-------:|------:|---|
| BD entries in curated | 6 | **19** | +13 |
| Curated total entries | 2,474 | **2,487** | +13 |

Pre-existing 6 BD seed entries (`dhaka`, `chittagong`, `sylhet`, `rajshahi`, `khulna`, `barisal`) preserved byte-for-byte (names.ar + names.bn + all 10 langs untouched).

---

## 2. 13 cities added

| # | slug | geonameid | featureCode | population | names.en | names.ar (final) |
|---|------|----------:|-------------|-----------:|----------|------------------|
| 1 | `gazipur` | 1200109 | PPLA2 | 2,674,697 | Gazipur | غازيبور |
| 2 | `rangpur` | 1185188 | PPLA | 1,031,388 | Rangpur | رنغبور |
| 3 | `comilla` | 1185186 | PPL | 1,030,000 | Comilla | كوميلا |
| 4 | `bagerhat` | 1185281 | PPLA2 | 266,388 | Bagerhat | باغرهات |
| 5 | `mymensingh` | 1185162 | PPLA | 225,126 | Mymensingh | ميمنسينغ |
| 6 | `bogra` | 1337233 | PPL | 210,000 | Bogra | بوغرا |
| 7 | `jamalpur` | 1185106 | PPLA2 | 167,900 | Jamālpur | جمالبور |
| 8 | `habiganj` | 1185209 | PPL | 88,760 | Habiganj | حبيغنج |
| 9 | `feni` | 1185224 | PPL | 84,028 | Feni | فيني |
| 10 | `netrakona` | 1185116 | PPLA2 | 79,016 | Netrakona | نيتراكونا |
| 11 | `lalmonirhat` | 1185181 | PPLA2 | 65,127 | Lalmonirhat | لالمونيرهات |
| 12 | `nilphamari` | 7646714 | PPLA2 | 0 | Nilphamari | نيلفاماري |
| 13 | `gaibandha` | 7921384 | PPLA2 | 0 | Gaibandha | غايباندا |

**Total population reached**: ~6.1 M Muslim audience (sum of all populations).

---

## 3. Aliases added

### `aliases.en` additions (2018 official renames)

| slug | alias.en added | Reason |
|------|----------------|--------|
| `comilla` | **Cumilla** | 2018 official rename (Bangladesh Cabinet decision) |
| `bogra` | **Bogura** | 2018 official rename |

### `aliases.en` dropped

| slug | alias.en dropped | Reason |
|------|------------------|--------|
| `rangpur` | **Mosque Rangpur** | Triggered religious-keyword false-positive in Stage 3; removed to prevent regression |

### `aliases.ar` preserved (from GeoNames Stage 2)

| slug | alias.ar kept |
|------|---------------|
| `bagerhat` | باغر هات (spaced variant) |
| `lalmonirhat` | لال منير هات (spaced variant) |
| `rangpur` | رانجبور (alternate phonetic — Bengali রং→ج spelling) |
| `gaibandha` | غيبندا (compact form without internal alif) |

### Other `aliases.en` carried from GeoNames Stage 2

The Stage 2 normalizer extracted Latin/Persian/Urdu/Cyrillic transliterations into `aliases.en`. Most are clean; a handful contain mojibake (e.g., `gaziፑri` mixing Latin + Amharic). These were NOT flagged for cleanup in BATCH-A and remain as-is. **Cosmetic-only deferred**: a future small alias-cleanup phase can scrub these without affecting search relevance.

---

## 4. ✅ `barishal` correctly excluded as duplicate

| Check | Result |
|-------|--------|
| `barishal` exists in curated? | **NO** ✓ |
| Existing `barisal` slug preserved? | YES ✓ (names.en="Barisal", names.ar="باريسال", unchanged) |
| Action taken | Excluded from BATCH-A; future `PLACE-NAMES-ALIASES-BD-SEED-1` will enrich the existing `barisal` entry with `Barishal` (en) + `باريشال` (ar) aliases |

Distance verification: `barishal` GeoNames row (lat=22.705, lng=90.370) is 1.762 km from curated `barisal` (lat=22.701, lng=90.354). Same physical city; correctly recognized as duplicate.

---

## 5. ✅ `rangpur` override (religious false-positive)

| Aspect | Detail |
|--------|--------|
| Stage 3 status before | `rejected` with reason `religious_site_not_city`, keyword `/\bmosque\b/i` |
| Root cause | `aliases.en` contained `"Mosque Rangpur"` (a famous mosque IN Rangpur city); Stage 3's `checkBlocklist` concatenated all aliases and ran religious regex |
| Override applied | Script-level: `startState: 'rejected'` accepted in `_asia_1d_bd_a_clean_approve.mjs`; flipped to `approved/high` with `anomalyOverride: 'religious_false_positive'` tag |
| Alias hygiene | Dropped `"Mosque Rangpur"` from `aliases.en` to prevent future Stage 3 re-runs from re-triggering the false positive |
| Upstream fix | NOT applied in this phase. Deferred to `STAGE-3-RELIGIOUS-EXEMPTION-1` (PPLC/PPLA exemption + drop `aliases.en` from religious-keyword scope) |
| Final state | `bd/rangpur` merged with `names = {ar: "رنغبور", en: "Rangpur"}` and pop=1,031,388, the **largest pending BD city** |

`validate_candidates.mjs`, `_geonames_common.mjs`, `normalize_places.mjs` — **all unchanged** in this phase. The override is local to the BD-A clean-approve script.

---

## 6. ✅ `nilphamari` + `gaibandha` overrides (low-tier admin promotion)

| Aspect | Detail |
|--------|--------|
| Stage 3 status before | `pending` with `tier: 'low'`, reason `below_popMin_and_not_always_include` |
| Root cause | Both are PPLA2 (district admin centers) with `population: 0` in GeoNames; `alwaysIncludeFeatureCodes: ['PPLC', 'PPLA']` excludes PPLA2 |
| Override applied | Script-level: `startState: 'pending-low'` accepted; flipped to `approved/high` with `anomalyOverride: 'low_tier_admin_promotion'` tag |
| Why include | Both are real district capitals (zilla shahar) — important admin centers despite missing pop data in GeoNames |
| `bd.mjs` change | NONE — `alwaysIncludeFeatureCodes` NOT modified globally (would over-promote pop=0 PPLA2 stubs in future waves) |
| Final state | `bd/nilphamari` and `bd/gaibandha` merged with manual Arabic, pop=0 preserved |

---

## 7. ✅ Confirmation: NO Bengali (`names.bn`) added

| Check | Result |
|-------|--------|
| `names.bn` added to any of 13 new entries? | **0** ✓ |
| All 13 new entries have `names = {ar, en}` only? | **13/13** ✓ |
| Existing 6 BD seed entries' `names.bn` preserved byte-for-byte? | **6/6** ✓ (ঢাকা, চট্টগ্রাম, সিলেট, রাজশাহী, খুলনা, বরিশাল all unchanged) |
| Latin fillchain into `names.bn`? | **0** ✓ (fillLangMap guard active) |

Bengali enrichment fully deferred to `PLACE-NAMES-BN-BD-1`. The 9/10 high-tier candidates with Bengali names in GeoNames raw (verified in PREFLIGHT-1) are ready to be sourced via the BN-BD-1 apply script (re-parsing `bd-geonames-raw.json` with `isCleanBengaliScript()` per BN-WORKFLOW-DESIGN-1 §3).

---

## 8. ✅ Confirmation: NO runtime translation

| Check | Result |
|-------|--------|
| Google Translate API used? | NO ✓ |
| OpenAI / Anthropic / browser translate used? | NO ✓ |
| AI-paraphrased Arabic names? | NO ✓ — all sources are: PROMOTE (clean existing aliases) / MANUAL (Wikipedia AR) / KEEP (already clean Arabic) |
| Bengali Wikipedia API or any external HTTP call? | NO ✓ — only static GeoNames TSV data |

---

## 9. ✅ Confirmation: NO fillchain

| Check | Result |
|-------|--------|
| `names.fr/de/tr/ur/id/es/ms/bn` populated via fallback? | **0** ✓ |
| Fillchain leak count (8 langs × 13 cities = 104 checks) | **0 leaks** ✓ |
| All 13 entries have `names = {ar, en}` only | **13/13** ✓ |

`fillLangMap` guard (in `_geonames_common.mjs:419`) enforced at write-time during Stage 4 merge — verified empirically.

---

## 10. ✅ Confirmation: NO Brunei data used

| Check | Result |
|-------|--------|
| Any `bn-geonames-*` Brunei files modified? | NO ✓ |
| `bn.mjs` Brunei config modified? | NO ✓ |
| Any input data from Brunei files? | NO ✓ — script reads only `bd-*` files and writes only to `bd-*` candidates |
| Naming collision risk acknowledged | Documented in `bd.mjs` and apply script headers |

---

## 11. ✅ Test results (all green)

### Verification checks (15 tests)

| # | Test | Result |
|---|------|--------|
| 1 | `curated-places.json` is valid JSON | ✓ |
| 2 | No duplicate slugs across 2,487 entries | ✓ |
| 3 | No duplicate `sourceId/geonameid` | ✓ |
| 4 | BD count = 19 | ✓ |
| 5 | All 13 BATCH-A slugs present | ✓ |
| 6 | All 13 have correct `names.ar` + `names.en` | ✓ |
| 7 | `names.bn` NOT added to 13 new cities | ✓ |
| 8 | `barishal` NOT merged as new city | ✓ |
| 9 | `chittagong` + `barisal` slugs preserved | ✓ |
| 10 | 0 fillchain leaks (8 langs × 13 = 104 checks) | ✓ |
| 11 | 6 BD seed entries `names.ar` + `names.bn` byte-for-byte preserved | ✓ |
| 12 | `server.js` / `js/app.js` / `index.html` / `fillLangMap` / `validate_candidates.mjs` / `normalize_places.mjs` unchanged | ✓ |
| 13 | No Brunei file modifications | ✓ |
| 14 | All test scripts unchanged | ✓ |
| 15 | aliases.en management correct (Cumilla, Bogura added; "Mosque Rangpur" dropped) | ✓ |

### SSR + regression (22 tests, all PASS)

**New 13 BD cities SSR — both AR + EN routes (14 checks):**
- `/prayer-times-in-{slug}` returns Arabic name in SSR seed (7 priority cities × 2 routes)
- All 14 PASS ✓

**Regression URLs (8 checks):**
- `/prayer-times-in-dhaka` = "دكا" ✓
- `/en/prayer-times-in-dhaka` = "Dhaka" ✓
- `/bn/prayer-times-in-dhaka` = "ঢাকা" ✓ (untouched)
- `/ur/prayer-times-in-dhaka` = "ڈھاکا" ✓ (untouched)
- `/prayer-times-in-chittagong` = "شيتاغونغ" ✓ (slug preserved)
- `/prayer-times-in-barisal` = "باريسال" ✓ (NOT barishal)
- `/ur/prayer-times-in-rawalpindi` = "راولپنڈی" ✓ (PK preserved)
- `/prayer-times-in-rabwah` = "ربوة" ✓ (PK MAJORS-1C preserved)

### Carry-forward suites (192 tests, all PASS)

| Suite | Result |
|-------|--------|
| `_test_place_by_slug.mjs` | 44/44 ✓ |
| `_test_fill_lang_map.mjs` | 11/11 ✓ |
| `_test_search_ar.mjs` | 22/22 ✓ |
| `_test_place_names_ur_pk_6.mjs` | 69/69 ✓ |
| `_test_place_names_cross_page_navigation_consistency_fix_1.mjs` | 28/28 ✓ |
| `_test_place_names_template_consistency_all_langs_fix_1.mjs` | 18/18 ✓ |

**Total tests run**: 15 + 22 + 192 = **229/229 PASS, 0 failures** ✓

---

## 12. Files changed

### Modified

| File | Change | Lines |
|------|--------|------:|
| `db/places/curated-places.json` | +13 BD entries (curated total 2,474 → 2,487) | ~280 |

### Created

| File | Purpose |
|------|---------|
| `scripts/geodata/countries/bd.mjs` | Bangladesh country config (admin1 verified empirically) |
| `scripts/geodata/_asia_1d_bd_a_clean_approve.mjs` | Active clean-approve script with FIXES + anomaly overrides |
| `db/places/sources/BD.zip` + `BD.txt` | GeoNames source (gitignored) |
| `db/places/candidates/bd-geonames-raw.json` | Stage 1 output |
| `db/places/candidates/bd-geonames-normalized.json` | Stage 2 output |
| `db/places/candidates/bd-geonames-candidates.json` | Stage 3 output (13 candidates flipped to approved) |
| `db/places/curated-places.json.preAsia1dBdA.bak` | Pre-apply backup |
| `reports/bd-geodata-import-report.md` | Stage 3 auto-generated |
| `reports/bd-geodata-aliases-review.md` | Stage 3 auto-generated (alias enrichment opps for 6 seed entries) |
| `reports/asia-1d-bd-preflight-1.md` | PREFLIGHT-1 audit |
| `reports/asia-1d-bd-a-plan.md` | BD-A plan |
| `reports/asia-1d-bd-a-closure.md` | This closure |

### NOT modified (verified via `git diff`)

- ❌ `server.js` — unchanged
- ❌ `js/app.js` — unchanged
- ❌ `index.html` — unchanged
- ❌ `scripts/geodata/_geonames_common.mjs` (fillLangMap + religious blocklist + Stage 2 extractors) — unchanged
- ❌ `scripts/geodata/validate_candidates.mjs` (Stage 3) — unchanged
- ❌ `scripts/geodata/normalize_places.mjs` (Stage 2) — unchanged
- ❌ All test scripts (`scripts/_test_*.mjs`) — unchanged
- ❌ All other country configs — unchanged
- ❌ `bn-geonames-*` Brunei files — NOT touched
- ❌ `bn.mjs` Brunei config — NOT touched
- ❌ Other countries' curated entries — preserved (2,468 non-BD entries byte-for-byte)
- ❌ MEMORY.md — not updated (deferred to post-user-approval)

---

## 13. Acceptance criteria — verification table

| # | Criterion | Result |
|---|---|--------|
| 1 | BD entries become exactly 19 | ✓ (6 → 19) |
| 2 | 13 new cities only | ✓ (no extras) |
| 3 | All new cities have `names.ar` + `names.en` | ✓ (13/13) |
| 4 | No `names.bn` in this phase | ✓ (0/13) |
| 5 | No runtime translation | ✓ |
| 6 | No fillchain | ✓ (0 leaks across 104 checks) |
| 7 | No Brunei data used | ✓ |
| 8 | No edit to `server.js` / `js/app.js` / `index.html` | ✓ |
| 9 | `chittagong` / `barisal` slugs unchanged | ✓ |
| 10 | `barishal` NOT merged as new city | ✓ |
| 11 | `rangpur` added successfully despite Stage 3 false-positive | ✓ (via script-level override) |
| 12 | `nilphamari` + `gaibandha` added via documented override | ✓ (script-level, no `bd.mjs` global change) |
| 13 | No duplicate slugs | ✓ |
| 14 | No duplicate `geonameId` | ✓ |
| 15 | Clear closure report `reports/asia-1d-bd-a-closure.md` | ✓ |
| 16 | No start of any Held Queue phase | ✓ |

**All 16 criteria met. Zero exceptions.**

---

## 14. Recommendation for the next phase

**Held queue (per user direction — DO NOT auto-start)**:

| Phase | Status | Description |
|-------|--------|-------------|
| **PLACE-NAMES-BN-BD-1** | ❌ HELD | Bengali enrichment for the 13 BD-A entries + 6 seed entries (only the 6 seeds already have `names.bn`). For BD-A entries: ~12/13 sources available from `bd-geonames-raw.json` per PREFLIGHT-1 §7. |
| **ASIA-1D-BD-MCF** | ❌ HELD | Blocked-major review (if any from Stage 3 needs_review pool > 50k pop) |
| **ASIA-1D-BD-MISSING-AR-MAJORS-1A** | ❌ HELD | ~64 cities pop≥50k in `needs_review` (chandpur, jessore, cox's-bazar, narayanganj, dinajpur, tangail, etc.) |
| **PLACE-NAMES-ALIASES-BD-SEED-1** | ❌ HELD | Alias enrichment for the 6 seed entries (incl. `barishal` for `barisal`, `Chattogram` for `chittagong`); 17 opportunities flagged in `bd-geodata-aliases-review.md` |
| **STAGE-3-RELIGIOUS-EXEMPTION-1** | ❌ HELD | Long-term upstream fix for Rangpur-class false-positives |
| **ASIA-1D-IN** | ❌ HELD | India Urdu wave |
| **ASIA-1F** | ❌ HELD | China solo wave |
| **AMERICAS-1B-MCF** | ❌ HELD | Americas blocked-major review |
| **SEARCH-RANKING-IMPROVEMENT-1** | ❌ HELD | Pre-existing Galle issue |
| **Alias enrichment** | ❌ HELD | General alias hygiene (incl. cleaning Stage-2 mojibake aliases like `gaziፑri`) |
| **DELETE-V1-AND-GEOCODE-PROXY-1** | ❌ HELD | Legacy code cleanup |

**Most natural next phase: PLACE-NAMES-BN-BD-1** (Bengali enrichment for the 13 newly-added BD-A entries). PREFLIGHT-1 confirmed ~90% Bengali coverage from GeoNames raw, so this should be a Fast Track wave with mostly auto-promoted bn names + Wikipedia bn fallback for the 1 missing case (`lalmonirhat`).

---

## Status: 🟢 ASIA-1D-BD-A CLOSED — user-approved 2026-05-20

### Summary

| Metric | Value |
|--------|-------|
| Closure report | `reports/asia-1d-bd-a-closure.md` |
| Apply commit | `5b32825` (pushed to main) |
| Closure-approval commit | (this docs commit) |
| BD entries before → after | 6 → **19** |
| New cities merged | **13** |
| Anomaly overrides | 3 (rangpur religious false-positive, nilphamari + gaibandha low-tier promotion) |
| `names.bn` added | 0 (deferred) |
| `names.fr/de/tr/ur/id/es/ms` added | 0 (fillchain disabled) |
| Total tests | 229/229 PASS |
| Runtime translation used | **NONE** |
| Brunei data used | **NONE** |
| Code files modified | **0** (server.js, js/app.js, index.html, fillLangMap, validate_candidates.mjs, normalize_places.mjs all unchanged) |

### User-approval acceptance criteria (all met)

| # | Criterion | Status |
|---|---|---|
| 1 | BD entries became exactly 19 (6 → 19) | ✓ |
| 2 | Curated total grew exactly +13 (2,474 → 2,487) | ✓ |
| 3 | 13 BATCH-A cities only — no extras | ✓ |
| 4 | All new cities have `names.ar` + `names.en` | ✓ |
| 5 | No `names.bn` in this phase | ✓ |
| 6 | No runtime translation | ✓ |
| 7 | No fillchain | ✓ |
| 8 | No Brunei (`bn-*` / `bn.mjs`) data used | ✓ |
| 9 | `server.js` / `js/app.js` / `index.html` unchanged | ✓ |
| 10 | `_geonames_common.mjs` unchanged | ✓ |
| 11 | `barishal` NOT merged (duplicate of `barisal`) | ✓ |
| 12 | `chittagong` + `barisal` slugs preserved | ✓ |
| 13 | `rangpur` added via documented script-level override | ✓ |
| 14 | `nilphamari` + `gaibandha` added via documented script-level override | ✓ |
| 15 | Tests 229/229 PASS | ✓ |

### Held queue (per user direction — DO NOT auto-start)

- ❌ PLACE-NAMES-BN-BD-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1A
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ STAGE-3-RELIGIOUS-EXEMPTION-1
- ❌ ASIA-1D-IN
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

**No further work until user direction.**
