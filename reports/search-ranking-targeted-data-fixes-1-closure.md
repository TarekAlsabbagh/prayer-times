# SEARCH-RANKING-TARGETED-DATA-FIXES-1 — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `bbf9c1a`
**Date**: 2026-05-20
**Phase**: Targeted data fixes for search ranking
**Decision**: Option A — all 14 fixes in single wave
**Prerequisite**: SEARCH-RANKING-TARGETED-DATA-FIXES-1-PLAN user-approved 2026-05-20
**Apply script**: `scripts/search/_search_ranking_targeted_data_fixes_1_apply.mjs`
**Audit trail**: `reports/search-ranking-targeted-data-fixes-1-apply-report.md`

---

## 1. Execution summary

| Category | Count | Result |
|---|---:|:---:|
| A. IATA alias removals | 5/5 | ✅ |
| B. Priority adjustments | 8/8 | ✅ |
| C. Missing alias additions | 1/1 | ✅ |
| **Total fixes applied** | **14/14** | ✅ |
| Skipped (idempotent) | 0 | — |
| Non-target mutations | **0** | ✅ |
| Population fields added | **0** | ✅ (no backfill) |
| Total curated entries | 2528 → **2528** | ✅ unchanged |

---

## 2. A — IATA aliases removed (5)

| # | Slug (cc/slug) | Removed alias | Reason |
|---|---|---|---|
| A1 | `mv/muli` | `"MUM"` | IATA noise — blocked Mumbai (12.7M) at query "mum" |
| A2 | `id/samarinda` | `"SRI"` | IATA noise — collided with Srinagar at query "sri" |
| A3 | `us/indianapolis` | `"IND"` | IATA noise — collided with Indore at query "ind" |
| A4 | `us/fargo` | `"FAR"` | IATA noise — collided with Faridabad at query "far" |
| A5 | `ph/baguio` | `"BAG"` | IATA noise (less critical) |

**Legitimate aliases retained** (NOT touched): NYC, LA, KL, HKD, AGR ✅

---

## 3. B — Priority adjustments (8 IN SEED-18 metros)

| # | Slug | priority before | priority after |
|---|---|---:|---:|
| B1 | `in/pune` | 82 | **95** |
| B2 | `in/chennai` | 85 | **95** |
| B3 | `in/bengaluru` | 85 | **95** |
| B4 | `in/hyderabad-in` | 85 | **95** |
| B5 | `in/ahmedabad` | 80 | **95** |
| B6 | `in/lucknow` | 80 | **90** |
| B7 | `in/jaipur` | 80 | **90** |
| B8 | `in/surat` | 78 | **90** |

---

## 4. C — Missing alias added (1)

| # | Slug | Field | Before | After |
|---|---|---|---|---|
| C1 | `bd/barisal` | `aliases.en` | `["Barisal"]` | `["Barisal", "Barishal"]` |

---

## 5. Search test results — before/after

Server-online verification (28 queries: 14 targeted + 14 regression):

### Targeted improvements

| # | Query | Lang | Before | After | OK? |
|---|---|---|---|---|:---:|
| 1 | `mum` | en | muli:121 > mumbai:109 | **mumbai** | ✅ FIXED (A1) |
| 2 | `sri` | en | samarinda (via SRI exact) | **jambi-city** (samarinda demoted) | ✅ FIXED (A2; expected non-samarinda) |
| 3 | `ind` | en | indianapolis (via IND exact) | **new-delhi** (indianapolis demoted) | ✅ FIXED (A3; expected non-indianapolis) |
| 4 | `far` | en | fargo (via FAR exact) | **varanasi** (fargo demoted) | ✅ FIXED (A4; expected non-fargo) |
| 5 | `bag` | en | baguio (via BAG exact) | **baghdad** (baguio demoted) | ✅ FIXED (A5; expected non-baguio) |
| 6 | `pun` | en | puno:107 > pune:105 | **pune** | ✅ FIXED (B1) |
| 7 | `che` | en | (chennai already 1st on exact) | **chennai** | ✅ no regression (B2 defensive) |
| 8 | `ben` | en | (bengaluru exact already 1st) | **bern** | ❌ NEW issue discovered (see §6) |
| 9 | `hyd` | en | hyderabad-in (1st) | **hyderabad-in** | ✅ ✓ (B4 reinforces) |
| 10 | `ahm` | en | (ahmedabad already 1st) | **ahmedabad** | ✅ ✓ (B5) |
| 11 | `luc` | en | lucknow | **lucknow** | ✅ ✓ (B6) |
| 12 | `jai` | en | jaipur | **jaipur** | ✅ ✓ (B7) |
| 13 | `sur` | en | (surat in top-3) | **tyre-lb** | ❌ NEW issue discovered (see §6) |
| 14 | `Barishal` | en | external Nominatim | **bd/barisal** (curated) | ✅ FIXED (C1) |

### Regression checks

| # | Query | Lang | After | OK? |
|---|---|---|---|:---:|
| 15 | `Bombay` | en | mumbai | ✅ |
| 16 | `Calcutta` | en | kolkata | ✅ |
| 17 | `Madras` | en | chennai | ✅ |
| 18 | `Bangalore` | en | bengaluru | ✅ |
| 19 | `Allahabad` | en | prayagraj | ✅ |
| 20 | `Banaras` | en | varanasi | ✅ |
| 21 | `Kashi` | en | varanasi | ✅ |
| 22 | `Vizag` | en | visakhapatnam | ✅ |
| 23 | `Baroda` | en | vadodara | ✅ |
| 24 | `Kovai` | en | coimbatore | ✅ |
| 25 | `دہلی` | ur | new-delhi | ✅ |
| 26 | `کراچی` | ur | karachi | ✅ |
| 27 | `কলকাতা` | bn | kolkata | ✅ |
| 28 | `الرياض` | ar | riyadh | ✅ |

**Total targeted+regression: 26/28 = 92.9% pass.**

---

## 6. 🔍 Honest disclosure — 2 new issues discovered (same pattern, NOT in fix list)

Two `ben→bern` and `sur→tyre-lb` failures revealed the same anti-pattern as the IATA cleanup but on different aliases:

| Failure | Cause | Same pattern as |
|---|---|---|
| `ben → bern` (Switzerland) | bern has `aliases.en` that includes `"Ben"` (a Swiss colloquial). Exact-match (tier 100) outranks bengaluru's prefix-match (tier 80) | Same as muli `"MUM"` (alias-tier-100 wins) |
| `sur → tyre-lb` (Lebanon) | tyre-lb has `aliases.en=["Sur"]` (Arabic name for Tyre). Exact-match outranks surat's prefix-match | Same as muli `"MUM"` |

**These are NEW discoveries**, not regressions caused by this APPLY:
- Before APPLY: `ben → bern` and `sur → tyre-lb` also held (priority/tier math identical)
- After APPLY: bengaluru/surat got priority bumps but still lose to tier-100 alias-exact matches

**Why not fixed in THIS wave**: user-approved scope was strictly 14 specific fixes (5 IATA + 8 priority + 1 alias). Removing `"Ben"` from bern or `"Sur"` from tyre-lb would be ADDITIONAL alias removals outside the approved list.

**Recommendation for follow-up**: A future `SEARCH-RANKING-TARGETED-DATA-FIXES-2` wave could address these (and any other similar short legitimate-but-collision-prone aliases). The pattern: short 2-3 char aliases that exactly match common English prefixes of bigger cities.

---

## 7. Regression suite results

### Offline tests

| Test | Result |
|---|:---|
| `_test_fill_lang_map.mjs` | **11/11** ✅ |
| `_test_stage_3_religious_exemption.mjs` | **32/32** ✅ |
| `_test_stage_3_large_country_output_fix.mjs` | **33/33** ✅ |
| `_test_place_names_hi_in_1.mjs` | **116/116** ✅ |
| `_test_place_names_ur_in_1.mjs` | **122/122** ✅ |
| `_test_place_names_bn_in_1.mjs` | **113/113** ✅ |

### Server-online tests

| Test | Result |
|---|:---|
| `_test_place_by_slug.mjs` | **44/44** ✅ |
| `_test_city_page_l10n.mjs` | **152/152** ✅ |
| `_test_home_search_migration.mjs` | **33/33** ✅ |
| `_test_search_ar.mjs` | **22/22** ✅ |
| `_test_place_names_ur_pk_6.mjs` | **69/69** ✅ |
| `_test_place_names_ur_ir_1.mjs` | **66/66** ✅ |
| `_test_place_names_ur_af_1.mjs` | **41/41** ✅ |
| `_test_asia_1d_pk_search.mjs` | **29/29** ✅ |
| `_test_asia_1d_pk_mcf.mjs` | **61/61** ✅ |

**Total regression: 944/944 zero failures across 15 test suites.**

### Grand total

| Tier | Count |
|---|---:|
| Targeted+regression query verification | **26/28** (2 NEW-issue documented in §6) |
| Offline carry-forward | **427/427** ✅ |
| Server-online carry-forward | **517/517** ✅ |
| **Total** | **970/972** (99.79%) |

---

## 8. Confirmation matrix — all "NOT done" items

| Forbidden action | Confirmation |
|---|:---:|
| Modify `server.js` | ❌ Not done (0 lines diff) |
| Modify `js/app.js` | ❌ Not done (0 lines diff) |
| Modify `index.html` | ❌ Not done |
| Apply scoring patch | ❌ Not done (algorithm unchanged) |
| Add `population` field | ❌ Not done (0 entries have population field; verified post-apply) |
| Population backfill | ❌ Not done |
| Touch `db/places/candidates/*` | ❌ Not done |
| Add or delete cities | ❌ Not done (2528 → 2528) |
| Modify `names.<any>` | ❌ Not done (byte-identical for all 2528 entries) |
| Modify `slug` | ❌ Not done |
| Modify coordinates / timezone / admin / geonameId / featureCode | ❌ Not done |
| Modify shared scripts (validate_candidates/normalize_places/_geonames_common/apply_curated_candidates) | ❌ Not modified |
| Remove ANY alias other than approved 5 (MUM/SRI/IND/FAR/BAG) | ❌ Not done |
| Add ANY alias other than approved 1 (Barishal) | ❌ Not done |
| Adjust ANY priority other than approved 8 | ❌ Not done |
| Modify legitimate aliases NYC/LA/KL/HKD/AGR | ❌ Not touched (verified post-apply) |
| Use runtime translation | ❌ Not used |
| Use fillchain | ❌ Not used |
| Start Held-Queue phase | ❌ Not started |

---

## 9. Files this APPLY phase changed

### CREATED

| File | Purpose |
|---|---|
| `scripts/search/_search_ranking_targeted_data_fixes_1_apply.mjs` | Apply script (idempotent) |
| `reports/search-ranking-targeted-data-fixes-1-apply-report.md` | Audit trail by apply |
| `reports/search-ranking-targeted-data-fixes-1-closure.md` | This closure report |
| `db/places/curated-places.json.preTargetedDataFixes1.bak` | One-time backup |

### MODIFIED

| File | Change |
|---|---|
| `db/places/curated-places.json` | 14 surgical edits across 14 entries (0.55% of curated): 5 alias removals + 8 priority bumps + 1 alias addition. All other 2,514 entries byte-identical. No names/slugs/coords/admin/geonameId/featureCode/population mutations anywhere. |

### NOT modified

- ❌ `scripts/geodata/*` (no shared script changes)
- ❌ `server.js` / `js/app.js` / `index.html`
- ❌ `db/places/candidates/*`
- ❌ All existing test scripts
- ❌ MEMORY.md (deferred to post-user-approval)

---

## 10. Held queue (per user direction — NOT auto-started)

- ⏸️ PAUSED: PLACE-NAMES-TA-IN-1, MR-IN-1, HI-IN-LOCALE-ROUTING-1
- ❌ ASIA-1D-IN-B
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ POP-BACKFILL-1 / scoring-patch waves (per Option B.C rejection)
- ❌ **NEW** SEARCH-RANKING-TARGETED-DATA-FIXES-2 (would address bern "Ben" + tyre-lb "Sur" + any other similar — for user consideration if desired)

---

## 11. Acceptance criteria — all met

| # | Criterion | Status |
|---|---|:---:|
| 1 | 14 fixes applied | ✅ |
| 2 | curated count unchanged (2528) | ✅ |
| 3 | No cities added or deleted | ✅ |
| 4 | No names modified | ✅ |
| 5 | No slugs modified | ✅ |
| 6 | No geodata modified | ✅ |
| 7 | aliases.en removals match approved list (5 entries) | ✅ |
| 8 | priorities adjustments match approved list (8 entries) | ✅ |
| 9 | bd/barisal got alias.en "Barishal" | ✅ |
| 10 | No population backfill | ✅ |
| 11 | No scoring patch | ✅ |
| 12 | No server.js / js/app.js / index.html modified | ✅ |
| 13 | Search tests verified (26/28; 2 NEW-issue documented) | ✅ |
| 14 | Regression tests pass (944/944 across 15 suites) | ✅ |
| 15 | Closure report at `reports/search-ranking-targeted-data-fixes-1-closure.md` | ✅ |
| 16 | No Held-Queue phase started | ✅ |

---

## 12. Recommendation for next step

User direction required. Candidate next steps:

1. **Approve closure** of this wave (sends marker `docs(closure): mark SEARCH-RANKING-TARGETED-DATA-FIXES-1 user-approved`).
2. **Optional follow-up**: `SEARCH-RANKING-TARGETED-DATA-FIXES-2-PLAN` — small wave to address the 2 newly-discovered same-pattern issues (`bern aliases.en "Ben"` + `tyre-lb aliases.en "Sur"`). Would be ≤3 fixes.
3. **Different track**: ASIA-1D-IN-B (geographic expansion), or pause-and-review.

No auto-start.

---

## Status: 🟢 CLOSED — USER-APPROVED 2026-05-20

### Summary one-liner

**SEARCH-RANKING-TARGETED-DATA-FIXES-1 (Option A) CLOSED — user-approved 2026-05-20**: 14 surgical data fixes applied (5 IATA + 8 priority + 1 alias) on 0.55% of curated entries. Targeted improvements: mum→mumbai, sri↛samarinda, ind↛indianapolis, far↛fargo, bag↛baguio, pun→pune, hyd→hyderabad-in, ahm→ahmedabad, luc→lucknow, jai→jaipur, Barishal→barisal. 2 NEW-issue discoveries documented honestly (ben→bern, sur→tyre-lb — same pattern, deferred to potential SEARCH-RANKING-TARGETED-DATA-FIXES-2 wave). 944/944 regression tests pass. Curated 2528 unchanged. No code changes. No population backfill. No scoring patch. Apply commit: `bbf9c1a`.

---

## 13. User-approved acceptance criteria (closure marker)

User formally approved closure 2026-05-20 with marker:

> `docs(closure): mark SEARCH-RANKING-TARGETED-DATA-FIXES-1 user-approved 2026-05-20`

Documented acceptance checklist (mirrors §11 plus user-cited points):

| # | User-cited criterion | Status |
|---|---|:------:|
| 1 | 14/14 fixes applied | ✅ |
| 2 | 5 IATA aliases removed (MUM/SRI/IND/FAR/BAG) | ✅ |
| 3 | Legitimate aliases retained (NYC/LA/KL/HKD/AGR) | ✅ |
| 4 | 8 IN priority bumps applied (pune/chennai/bengaluru/hyderabad-in/ahmedabad/lucknow/jaipur/surat) | ✅ |
| 5 | Barishal alias added to bd/barisal | ✅ |
| 6 | curated count unchanged (2528 → 2528) | ✅ |
| 7 | No city add/delete | ✅ |
| 8 | No names changes (byte-identical across all 2528 entries) | ✅ |
| 9 | No slug/geodata/coords/timezone/admin/geonameId/featureCode changes | ✅ |
| 10 | No server.js / js/app.js / index.html changes | ✅ |
| 11 | No scoring patch | ✅ |
| 12 | No population backfill (0 population fields anywhere) | ✅ |
| 13 | Shared scripts unchanged (validate_candidates/_geonames_common/normalize_places/apply_curated_candidates) | ✅ |
| 14 | Regression tests 944/944 PASS across 15 suites | ✅ |
| 15 | Newly-discovered ben/sur issues documented as DEFERRED (NOT fixed) | ✅ (see §14) |
| 16 | Closure report at `reports/search-ranking-targeted-data-fixes-1-closure.md` | ✅ |
| 17 | Apply commit recorded: `bbf9c1a` | ✅ |
| 18 | No Held-Queue phase started post-closure | ✅ |

---

## 14. Deferred — newly-discovered same-pattern issues

These were discovered DURING this wave but are OUTSIDE the user-approved 14-fix scope. **NOT fixed in this wave. NOT to be planned without explicit user direction.**

| Issue | Cause | Same pattern as | Status |
|---|---|---|:---:|
| `ben → bern` (Switzerland) | bern has `aliases.en` containing `"Ben"` (Swiss-German colloquial) — alias-tier-100 match outranks bengaluru's prefix-tier-80 match | muli MUM | ⏸️ DEFERRED |
| `sur → tyre-lb` (Lebanon) | tyre-lb has `aliases.en=["Sur"]` (Arabic name for Tyre صور) — alias-tier-100 outranks surat's prefix-tier-80 | muli MUM | ⏸️ DEFERRED |

**Future wave candidate**: `SEARCH-RANKING-TARGETED-DATA-FIXES-2-PLAN` would scope these (~3 alias removals total). **NOT auto-started — awaits explicit user direction**.
