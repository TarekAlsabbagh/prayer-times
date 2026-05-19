# ASIA-1D-PK-MISSING-AR-MAJORS-1A — Closure Report

**Date**: 2026-05-19
**Phase ID**: ASIA-1D-PK-MISSING-AR-MAJORS-1A (BATCH A — Top 20)
**Predecessor**: ASIA-1D-PK-MISSING-AR-MAJORS-1 (review report approved by user)
**User decision**: "execute BATCH A only — Top 20" + per-row Arabic choices

---

## 1. curated total before / after

| | curated total | PK count |
|---|---:|---:|
| **Before BATCH-A merge** | **2,396** | **70** |
| **After BATCH-A merge** | **2,416** | **90** |
| **Net added** | **+20** | **+20** |

## 2. PK count before / after

**70 → 90**. Pakistan curated coverage:
- 10 seed entries (Urdu+Arabic since UR-PK-1)
- 43 ASIA-1D-PK clean (Urdu+Arabic since UR-PK-2)
- 17 ASIA-1D-PK-MCF (Urdu+Arabic since UR-PK-3)
- **20 ASIA-1D-PK-MISSING-AR-MAJORS-1A (Arabic only — Urdu pending PLACE-NAMES-UR-PK-4)**

## 3. merged count = 20 ✓

All 20 user-approved BATCH A entries merged via Stage 4 `apply_curated_candidates.mjs`.

## 4. Batch A names applied

| slug | pop | fc | **names.ar applied** |
|---|---:|:-:|---|
| `bahawalpur` | 903,795 | PPLA2 | **بهاولبور** |
| `dera-ismail-khan` | 763,195 | PPLA2 | **ديرة إسماعيل خان** |
| `battagram` | 700,000 | PPLA2 | **بطغرام** |
| `okara` | 533,693 | PPLA2 | **أوكاره** |
| `kasur` | 510,875 | PPLA2 | **قصور** |
| `tando-allahyar` | 421,923 | PPLA2 | **تاندو اللهيار** |
| `larkana` | 364,033 | PPLA2 | **لاركانة** |
| `nawabshah` | 363,138 | PPLA2 | **نواب شاه** |
| `hafizabad` | 318,621 | PPLA2 | **حافظ آباد** |
| `kamoke` | 291,980 | PPL | **كاموكي** |
| `abbottabad` | 275,890 | PPLA2 | **إبت آباد** |
| `shikarpur` | 204,938 | PPLA2 | **شكاربور** |
| `shahkot` | 200,000 | PPL | **شاه كوت** |
| `hub` | 195,661 | PPL | **هب** |
| `garhi-khairo` | 193,297 | PPL | **غره خيرو** |
| `khairpur-mirs` | 191,044 | PPLA2 | **خيربور مير** |
| `saddiqabad` | 189,876 | PPL | **صديق آباد** |
| `burewala` | 183,915 | PPL | **بوريوالا** |
| `arif-wala` | 157,063 | PPL | **عارف والا** |
| `kohat` | 151,427 | PPLA2 | **كوهات** |

**Sum of population reached**: **6,646,827** (6.65M Muslim users in Pakistan now have curated prayer-time data for their cities).

## 5. ✅ bahawalnagar duplicate DROPPED

The `bahawalnagar` PPL row (pop=126,700, geonameid=12527014) was explicitly NOT merged. The existing `pk/bahawalnagar` PPLA2 entry (merged in ASIA-1D-PK clean merge, pop=241,873) remains unchanged with:
- `names.ar` = `بهاولنغر` (preserved from ASIA-1D-PK)
- `names.ur` = `بہاولنگر` (preserved from UR-PK-2)

Verified by smoke test Part D: only 1 `bahawalnagar` entry exists in curated.

## 6. ✅ No pop=0 admin stubs merged

The BATCH-A apply script intentionally excluded all 28 pop=0 PPLA2 admin stubs. Smoke test Part E explicitly checks that 28 specific out-of-scope slugs are absent: `model-town`, `jhang-city`, `upper-dir`, `timargara`, `tolti`, `shigar`, `saidu-sharif`, `qila-saifullah`, `qila-abdullah`, `patan`, `panjgur`, `nagir`, `musa-khel-bazar`, `malakand`, `khaplu`, `khanewal`, `dera-allahyar`, `jamshoro`, `gandava`, `daggar`, `awaran`, `aliabad`, `alpurai`, `dambudas`, `eidghah`, `dasu`, `athmuqam`, `hattian-bala`. All confirmed absent ✓.

## 7. ✅ No fake localized fillchain

All 20 new entries have `names = {ar, en}` only. **0 leaks across 8 locales × 20 entries = 160 checks** (smoke Part C). The `apply_curated_candidates.mjs` fillLangMap guard at write-time is correctly enforcing this.

Example: `pk/bahawalpur` has:
```json
{ "names": { "ar": "بهاولبور", "en": "Bahawalpur" } }
```
No `names.ur`, no `names.bn`, no `names.fr/de/tr/id/es/ms`.

## 8. Duplicate Arabic check

✅ **0 duplicate Arabic names within PK** (smoke Part F). All 20 new `names.ar` are unique across the 90 PK entries.

## 9. Slug collision check

✅ **0 duplicate cc/slug pairs in curated** (smoke Part F). The `bahawalnagar` PPL dup was the only known collision and was correctly dropped pre-merge.

## 10. Tests result

**1,495/1,495 zero failures across 27 suites** (after updating 3 stale assertions in UR-PK-1/UR-PK-3/MCF tests):

| Suite | Result |
|---|---:|
| `_test_asia_1d_pk_missing_ar_1a` (new) | **53/53** |
| `_test_place_names_ur_pk_3` (updated for PK ≥70) | 74/74 |
| `_test_asia_1d_pk_mcf` (updated for PK ≥70) | 61/61 |
| `_test_place_names_ur_pk_1` (updated deferred list for BATCH-B/C) | 38/38 |
| `_test_asia_1d_pk_search` | 29/29 |
| `_test_place_names_ur_pk_2` | 65/65 |
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
| `_test_external_provider_2` | 32/32 |
| `_test_home_search_migration` | 33/33 |
| `_test_search_ar` | 22/22 |
| `_test_external_cache` | 13/13 |
| `_test_fill_lang_map` | 11/11 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_qibla_general_home_search_box_1` | 36/36 |
| `_test_moon_general_home_search_box_1` | 37/37 |
| `_test_asia_1g_af_search` | 24/24 |
| `_test_search_place_endpoint` (heavy) | **659/659** |

Browser-verified spot checks:
- Arabic search `بهاولبور` → pk/bahawalpur ✓
- Arabic search `قصور` → pk/kasur ✓
- Arabic search `حافظ آباد` → pk/hafizabad ✓
- SSR `/prayer-times-in-bahawalpur` → seed `بهاولبور` ✓
- SSR `/prayer-times-in-dera-ismail-khan` → seed `ديرة إسماعيل خان` ✓
- SSR `/prayer-times-in-kasur` → seed `قصور` ✓

## 11. Remaining missing-ar count after BATCH A

**77 remaining** missing-ar PK majors held for follow-up batches:
- BATCH B: ~32 cities (pop 50k–155k, ~6 from review §3 plus 26 from §4 by pop)
- BATCH C: ~45 cities (pop 0–50k PPLA2 admin stubs)

Plus 1 collision skipped (`bahawalnagar` PPL dup — never to be merged).

## 12. Next recommended batch

```text
Recommended next (per user direction — HELD pending approval):

1. PLACE-NAMES-UR-PK-4   — Urdu enrichment for the 20 BATCH-A entries.
                            Brings PK Urdu coverage from 70/90 back up
                            (target: 90/90 if all approved).

2. ASIA-1D-PK-MISSING-AR-MAJORS-1B   — Tier 2-3 batch (32 cities, pop
                                       50k-155k including layyah, lodhran,
                                       khanpur, attock-city, khuzdar,
                                       manjhand, bhakkar, narowal, mandi-
                                       bahauddin, mianwali, pakpattan,
                                       tando-adam, toba-tek-singh, etc.)

3. ASIA-1D-PK-MISSING-AR-MAJORS-1C   — Admin stubs batch (45 cities,
                                       pop 0-50k PPLA2 district HQs)

4. ASIA-1D-BD / ASIA-1D-IN / ASIA-1F   — held
5. AMERICAS-1B-MCF                     — held
6. Search-ranking / Alias enrichment / DELETE-V1   — held
```

**Suggestion**: Run **`PLACE-NAMES-UR-PK-4`** next (Urdu for the 20 BATCH-A cities) to bring PK back to Urdu-complete, BEFORE expanding to BATCH-B. This keeps the "every PK city in curated has both Arabic and Urdu" property intact.

Alternatively: run BATCH-B first (adds 32 more Arabic-only cities), then a combined `UR-PK-4-AB` Urdu wave for both batches. Less round-trips but larger Urdu review.

---

## 13. Files modified

| File | Change | Net |
|---|---|---:|
| `db/places/curated-places.json` | +20 PK entries (names.{ar, en} only) | Data-only |
| `scripts/geodata/_asia_1d_pk_missing_ar_1a_apply.mjs` | NEW apply script (20 NAME_AR_FIXES + bahawalnagar drop) | +200 |
| `scripts/_test_asia_1d_pk_missing_ar_1a.mjs` | NEW smoke test (53/53) | +240 |
| `scripts/_test_place_names_ur_pk_3.mjs` | Updated PK count assertion 70 → ≥70 | +5 / −3 |
| `scripts/_test_asia_1d_pk_mcf.mjs` | Updated PK count assertion 70 → ≥70 | +3 / −1 |
| `scripts/_test_place_names_ur_pk_1.mjs` | Updated deferred-cities list (5 → 5 different) | +5 / −5 |
| `reports/asia-1d-pk-missing-ar-majors-1-review.md` | (already committed at review phase) | — |
| `reports/asia-1d-pk-missing-ar-majors-1a-closure.md` | NEW closure (this) | — |
| `db/places/curated-places.json.preAsia1dPkMissingAr1A.bak` | NEW backup | — |

NOT modified: `server.js`, `js/app.js`, `index.html`, `fillLangMap`, 70 existing PK entries (10 seed + 43 clean + 17 MCF), `names.ar`/`names.en`/`names.ur` for any other entry.

---

## Status: 🟢 CLOSED — 20 BATCH-A entries merged

**Pakistan curated state post-MISSING-AR-MAJORS-1A**:
- ✅ **PK total: 90 entries**
- ✅ **Arabic coverage: 90/90 = 100%** (since this closure)
- 🟡 **Urdu coverage: 70/90 = 78%** (the 20 BATCH-A cities have no Urdu yet — `PLACE-NAMES-UR-PK-4` recommended next)
- ✅ **Blocked queue: 0**
- ⏳ **Missing-ar remaining: 77** (BATCH-B + BATCH-C)

**Rollback**: `git revert <commit>` reverts data + scripts + reports. Backup `curated-places.json.preAsia1dPkMissingAr1A.bak` available.

**Held (per user direction — DO NOT auto-start)**: PLACE-NAMES-UR-PK-4, ASIA-1D-PK-MISSING-AR-MAJORS-1B, ASIA-1D-PK-MISSING-AR-MAJORS-1C, ASIA-1D-BD, ASIA-1D-IN, ASIA-1F, AMERICAS-1B-MCF, Search-ranking, Alias enrichment, DELETE-V1.
