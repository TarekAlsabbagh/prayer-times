# ASIA-1D-IN-B-FAST — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `5a566e7`
**Date**: 2026-05-20
**Phase**: Fast IN BATCH-B — 30 next-tier cities, ar+en only
**Scope**: launch-readiness data fill; no plan phase, no L10N, no ranking change

---

## 1. State before/after

| Metric | Before | After | Δ |
|---|---:|---:|--:|
| Total curated entries | 2528 | **2558** | **+30** |
| IN entries | 40 | **70** | **+30** |
| IN with names.ar | 40 | **70** | +30 |
| IN with names.en | 40 | **70** | +30 |
| IN with names.hi (HI-IN-1 cohort) | 40 | 40 | unchanged |
| IN with names.ur (UR-IN-1 cohort) | 40 | 40 | unchanged |
| IN with names.bn (BN-IN-1 cohort) | 40 | 40 | unchanged |
| BATCH-B with names other than ar/en | 0 | **0** | (enforced policy) |

**Lang policy**: ar + en only for BATCH-B. No `names.hi/ur/bn/ta/mr/etc.` added.

---

## 2. The 30 cities added

| # | slug | gid | en | ar | fc | pop | priority | aliases.en |
|---:|---|---:|---|---|---|---:|---:|---|
| 1 | `gorakhpur` | 1270926 | Gorakhpur | غوراكبور | PPL | 1,324,570 | 95 | — |
| 2 | `raipur` | 1258980 | Raipur | رايبور | PPLA | 1,027,264 | 95 | — |
| 3 | `tiruchirappalli` | 1254388 | Tiruchirappalli | تيروتشيرابالي | PPL | 1,022,518 | 95 | Trichy, Tiruchirapalli |
| 4 | `kota` | 1266049 | Kota | كوتا | PPL | 1,001,694 | 95 | — |
| 5 | `sholapur` | 1256436 | Sholapur | سولابور | PPL | 997,281 | 90 | Solapur |
| 6 | `chandigarh` | 1274746 | Chandigarh | شانديغار | PPLA | 970,602 | 90 | — |
| 7 | `tiruppur` | 1254348 | Tiruppur | تيروبور | PPL | 963,173 | 90 | Tirupur |
| 8 | `guwahati` | 1271476 | Guwahati | غواهاتي | PPL | 962,334 | 90 | — |
| 9 | `mysuru` | 1262321 | Mysuru | ميسور | PPLA2 | 920,550 | 90 | Mysore |
| 10 | `salem-in` | 1257629 | Salem | سالم | PPL | 917,414 | 90 | Salem |
| 11 | `gurugram` | 1270642 | Gurugram | غوروغرام | PPLA2 | 886,519 | 90 | Gurgaon |
| 12 | `bhubaneswar` | 1275817 | Bhubaneswar | بوبانسوار | PPLA | 885,363 | 90 | — |
| 13 | `jalandhar` | 1268782 | Jalandhar | جلندار | PPL | 868,929 | 90 | — |
| 14 | `bhayandar` | 1276014 | Bhayandar | بهايندر | PPL | 809,378 | 90 | Bhayander |
| 15 | `aligarh` | 1279017 | Aligarh | أليكره | PPL | 753,207 | 90 | — |
| 16 | `bareilly` | 1277013 | Bareilly | بريلي | PPL | 745,435 | 90 | — |
| 17 | `moradabad` | 1262801 | Moradabad | مراد آباد | PPLA2 | 721,139 | 90 | — |
| 18 | `warangal` | 1252948 | Warangal | ورنغل | PPLA2 | 704,570 | 90 | — |
| 19 | `guntur` | 1270668 | Guntur | غونتور | PPL | 670,073 | 85 | — |
| 20 | `bikaner` | 1275665 | Bikaner | بيكانير | PPL | 644,406 | 85 | — |
| 21 | `bhilai` | 1275971 | Bhilai | بهيلاي | PPL | 627,734 | 85 | — |
| 22 | `jammu` | 1269321 | Jammu | جامو | PPLA | 576,198 | 85 | — |
| 23 | `kozhikode` | 1265873 | Kozhikode | كاليكوت | PPLA2 | 550,440 | 85 | Calicut |
| 24 | `nellore` | 1261529 | Nellore | نيلور | PPLA2 | 547,621 | 85 | — |
| 25 | `ajmer` | 1279159 | Ajmer | أجمير | PPL | 542,321 | 85 | — |
| 26 | `dehradun` | 1273313 | Dehradun | ديهرادون | PPLA | 522,081 | 85 | Dehra Dun |
| 27 | `erode` | 1272013 | Erode | إيرود | PPL | 521,891 | 85 | — |
| 28 | `ujjain` | 1253914 | Ujjain | أوجاين | PPL | 515,215 | 85 | — |
| 29 | `mangaluru` | 1263780 | Mangaluru | منغالور | PPL | 499,487 | 80 | Mangalore |
| 30 | `belagavi` | 1276533 | Belagavi | بلغاوم | PPL | 490,045 | 80 | Belgaum |

**Note on slug naming**: `salem-in` used (not `salem`) to avoid collision with `us/salem`. Convention matches existing `hyderabad-in` / `hyderabad-pk`.

**Aliases.en added (well-known rename/variant pairs only — 10 entries)**: Trichy/Tiruchirapalli, Solapur, Tirupur, Mysore, Salem (for salem-in), Gurgaon, Bhayander, Calicut, Mangalore, Belgaum.

---

## 3. Duplicate / collision checks

| Check | Result |
|---|:---:|
| Pre-flight: no duplicate slugs within NEW_CITIES list | ✅ (30 unique) |
| Pre-flight: no duplicate geonameids within NEW_CITIES | ✅ (30 unique) |
| Cross-check: no slug collision with existing 2,528 curated | ✅ (salem→salem-in disambiguated) |
| Cross-check: no geonameId collision with existing entries | ✅ |
| Post-apply: no duplicate slugs in final 2,558 curated | ✅ |
| Post-apply: no duplicate sourceIds in final 2,558 | ✅ |
| Post-apply: byte-identity hash of all 2,528 pre-existing entries | ✅ unchanged |

---

## 4. Lang policy enforcement

Each of the 30 new entries has **ONLY** `names.ar` and `names.en` — verified post-apply.

NO Hindi, Urdu, Bengali, Tamil, Marathi, Telugu, Kannada, Malayalam, Gujarati, Gurmukhi, etc. added on any BATCH-B entry.

Pre-existing 40 IN entries (SEED-18 11-lang + BATCH-A-22 5-lang) — **byte-identical** to before this wave (post-mutation hash check).

---

## 5. Search smoke tests (server-online)

23/23 spot-check queries pass:

| Query | Expected | Result |
|---|---|:---:|
| Gorakhpur | gorakhpur | ✓ |
| Raipur | raipur | ✓ |
| Tiruchirappalli | tiruchirappalli | ✓ |
| Trichy (alias) | tiruchirappalli | ✓ |
| Kota | kota | ✓ |
| Chandigarh | chandigarh | ✓ |
| Guwahati | guwahati | ✓ |
| Mysuru | mysuru | ✓ |
| Mysore (alias) | mysuru | ✓ |
| Gurugram | gurugram | ✓ |
| Gurgaon (alias) | gurugram | ✓ |
| Bhubaneswar | bhubaneswar | ✓ |
| Jammu | jammu | ✓ |
| Calicut (alias) | kozhikode | ✓ |
| Ajmer | ajmer | ✓ |
| Dehradun | dehradun | ✓ |
| Mangalore (alias) | mangaluru | ✓ |
| Belgaum (alias) | belagavi | ✓ |
| غوروغرام (ar) | gurugram | ✓ |
| شانديغار (ar) | chandigarh | ✓ |
| Mumbai (regression) | mumbai | ✓ |
| Karachi (regression) | karachi | ✓ |
| Dhaka (regression) | dhaka | ✓ |

---

## 6. Regression test results

| Suite | Result |
|---|:---|
| `_test_place_names_hi_in_1.mjs` (count assertions updated to 2558/70 + cohort-of-40 for hi) | **116/116** ✅ |
| `_test_place_names_ur_in_1.mjs` (same update for ur cohort) | **122/122** ✅ |
| `_test_place_names_bn_in_1.mjs` (same update for bn cohort) | **113/113** ✅ |
| `_test_place_by_slug.mjs` | **44/44** ✅ |
| `_test_fill_lang_map.mjs` | **11/11** ✅ |
| `_test_city_page_l10n.mjs` | **152/152** ✅ |

**558/558** tests pass.

The HI/UR/BN-IN-1 tests had stale count assertions (`curated.length === 2528`, `inEntries.length === 40`, etc.) that were updated to reflect post-BATCH-B reality. The cohort-of-40 invariant for hi/ur/bn is preserved: HI/UR/BN coverage applies to original 40, not new 30.

---

## 7. Confirmation matrix

| Forbidden action | Confirmation |
|---|:---:|
| Modify `server.js` | ❌ Not done (0 lines diff) |
| Modify `js/app.js` | ❌ Not done (0 lines diff) |
| Modify `index.html` | ❌ Not done |
| Modify shared geodata scripts (validate_candidates/_geonames_common/normalize_places/apply_curated_candidates) | ❌ Not done |
| Modify the 40 prior IN entries | ❌ Not done (byte-identity hash assertion passed) |
| Modify PK / BD / any other country | ❌ Not done (byte-identity hash assertion across all pre-existing entries) |
| Modify slugs / coords / timezone / admin / geonameId / featureCode of pre-existing entries | ❌ Not done |
| Apply scoring patch | ❌ Not done |
| Add population field | ❌ Not done |
| Add names.hi/ur/bn/ta/mr/etc. on BATCH-B | ❌ Not done (10/10 lang-policy checks PASS) |
| Use runtime translation (Google/OpenAI/Anthropic/browser) | ❌ Not used (all Arabic manual transliteration) |
| Use fillchain | ❌ Not used |
| Start ASIA-1F / AMERICAS-1B-MCF / DELETE-V1 / L10N waves | ❌ Not started |

---

## 8. Files this APPLY phase changed

### CREATED

| File | Purpose |
|---|---|
| `scripts/geodata/_asia_1d_in_b_fast_apply.mjs` | Apply script (idempotent, pre-flight + cross-collision + post-apply hash assertion) |
| `reports/asia-1d-in-b-fast-apply-report.md` | Audit trail from apply |
| `reports/asia-1d-in-b-fast-closure.md` | This closure report |
| `db/places/curated-places.json.preAsia1dInBFast.bak` | One-time backup |

### MODIFIED

| File | Change |
|---|---|
| `db/places/curated-places.json` | +30 IN entries appended; 2,528 pre-existing entries byte-identical (hash-verified) |
| `scripts/_test_place_names_hi_in_1.mjs` | Updated count assertions: curated 2528→2558, IN 40→70, hi/ar/en counts reflect new cohort math |
| `scripts/_test_place_names_ur_in_1.mjs` | Same |
| `scripts/_test_place_names_bn_in_1.mjs` | Same |

### NOT modified

- ❌ `server.js`, `js/app.js`, `index.html`
- ❌ `db/places/candidates/*` (untouched)
- ❌ Any shared geodata script
- ❌ Any other test script

---

## 9. Recommendation for next step

User direction required. Reasonable next options:

1. **Approve closure** of this wave + return to **launch-readiness track** (Hijri pages per user direction)
2. Pause and review IN coverage if desired

This BATCH-B-FAST brings IN coverage to **70 entries** across major regions including all top-3 Tier-2 metros (Gorakhpur, Raipur, Tiruchirappalli, Chandigarh, Bhubaneswar, etc.). Combined with the 40 SEED+BATCH-A entries, IN now has solid coverage from capital + every major metro region. External Nominatim still handles long-tail.

---

## Status: 🟢 CLOSED — USER-APPROVED 2026-05-20

### Summary one-liner

**ASIA-1D-IN-B-FAST CLOSED — user-approved 2026-05-20**: +30 IN cities (gorakhpur/raipur/tiruchirappalli/kota/sholapur/chandigarh/tiruppur/guwahati/mysuru/salem-in/gurugram/bhubaneswar/jalandhar/bhayandar/aligarh/bareilly/moradabad/warangal/guntur/bikaner/bhilai/jammu/kozhikode/nellore/ajmer/dehradun/erode/ujjain/mangaluru/belagavi). ar+en only. IN 40→70, curated 2528→2558. 10 documented rename-pair aliases.en (Trichy/Solapur/Tirupur/Mysore/Salem/Gurgaon/Bhayander/Calicut/Mangalore/Belgaum). Smoke tests 23/23. Regression tests 558/558. No L10N added. No ranking change. server.js/js/app.js/index.html unchanged. Apply commit: `5a566e7`.

---

## 10. User-approved acceptance criteria (closure marker)

User formally approved closure 2026-05-20 with marker:

> `docs(closure): mark ASIA-1D-IN-B-FAST user-approved 2026-05-20`

Documented acceptance checklist:

| # | User-cited criterion | Status |
|---|---|:------:|
| 1 | IN 40 → 70 | ✅ |
| 2 | Total curated 2,528 → 2,558 | ✅ |
| 3 | 30 cities added (within 20–35 range) | ✅ |
| 4 | All new cities have `names.ar` + `names.en` ONLY | ✅ |
| 5 | No `names.hi` added on new cities | ✅ |
| 6 | No `names.ur` added on new cities | ✅ |
| 7 | No `names.bn` added on new cities | ✅ |
| 8 | No `names.ta` added on new cities | ✅ |
| 9 | No `names.mr` added on new cities | ✅ |
| 10 | No other Indian/regional langs added | ✅ |
| 11 | Prior 40 IN entries byte-identical | ✅ (hash assertion) |
| 12 | PK / BD / all other countries byte-identical | ✅ |
| 13 | No `server.js` change | ✅ (0 lines diff) |
| 14 | No `js/app.js` change | ✅ (0 lines diff) |
| 15 | No `index.html` change | ✅ |
| 16 | No shared geodata scripts change | ✅ |
| 17 | No `db/places/candidates/*` change | ✅ |
| 18 | No search ranking patch | ✅ |
| 19 | No runtime translation | ✅ |
| 20 | No fillchain | ✅ |
| 21 | Smoke tests 23/23 PASS | ✅ |
| 22 | Regression tests 558/558 PASS | ✅ |
| 23 | Closure report at `reports/asia-1d-in-b-fast-closure.md` | ✅ |
| 24 | Apply commit recorded: `5a566e7` | ✅ |
| 25 | No Held-Queue phase started post-closure | ✅ |
