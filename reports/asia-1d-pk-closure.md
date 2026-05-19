# ASIA-1D-PK — Closure Report (clean merge)

**Date**: 2026-05-19
**Phase ID**: ASIA-1D-PK
**Predecessors**: PLACE-NAMES-UR-PK-1-APPLY (`aeb5685`), ASIA-1D-PREFLIGHT-SPLIT-DECISION-1.
**User decision**: Option A — merge 43 passes-gate + 3 NAME_AR_FIXES.

---

## 1. curated total before / after

| | curated total | PK count |
|---|---:|---:|
| **Before merge** | **2,336** | **10** |
| **After merge** | **2,379** | **53** |
| **Net added** | **+43** | **+43** |

## 2. merged count

**43** new PK pipeline cities merged via Stage 4 `apply_curated_candidates.mjs`.

## 3. 3 NAME_AR_FIXES applied

| slug | before (GeoNames) | after (user-approved) | rationale |
|---|---|---|---|
| `bahawalnagar` | `بهاولبور` (WRONG — actually means "Bahawalpur") | **`بهاولنغر`** | Semantic mismatch fix; same pattern as IR's `qaem-shahr` and KG's `manas`. Wrong `بهاولبور` alias explicitly DROPPED (would create cross-city collision). |
| `mailsi` | `تصيل ميلسي` (admin-area prefix) | **`ميلسي`** | Strip prefix "تصيل" (misspelling of "تحصيل" = sub-district). Prefixed form NOT kept as alias per user direction. |
| `chishtian` | `ششتيان شريف` (historical honorific) | **`ششتيان`** | Strip honorific suffix "شريف". Historical form **kept as alias** (`ششتيان شريف`) for search continuity per user direction. |

## 4. Confirmation: NO fake localized fillchain written

**Critical verification — the user-specified `fillLangMap` guard rule was honored in this merge.**

`apply_curated_candidates.mjs` was updated to honor the PLACE-NAMES-L10N-PIPELINE-GUARD-1 contract at write-time (previously it had legacy fillchain behavior that filled `names.ur/bn/fr/de/tr/id/es/ms = names.en` for missing langs).

After the fix:

```js
// OLD (legacy fillchain):
for (const l of SUPPORTED_LANGS) {
    out.names[l] = cand.names && cand.names[l] ? cand.names[l] : (cand.names && cand.names.en) || '';
}

// NEW (PLACE-NAMES-L10N-PIPELINE-GUARD-1 extension):
if (cand.names && typeof cand.names === 'object') {
    for (const l of SUPPORTED_LANGS) {
        if (cand.names[l] && typeof cand.names[l] === 'string' && cand.names[l].trim()) {
            out.names[l] = cand.names[l];
        }
    }
}
```

**Verified by smoke**: All 43 new PK entries have **only `names.en + names.ar`** in their `names` map. **0 leaks across 8 locales × 43 entries = 344 verification checks all passed.**

Example post-merge entry (sargodha):

```json
{
  "slug": "sargodha",
  "type": "town",
  "countryCode": "pk",
  "lat": 32.083333,
  "lng": 72.671111,
  "timezone": "Asia/Karachi",
  "names": {
    "ar": "سرغودها",
    "en": "Sargodha"
  },
  "aliases": {
    "en": ["SGI","Sargoda","Sargodkha","saleugoda","saragodha","sarugoda","srgwdha"]
  },
  ...
}
```

**No `names.ur`, no `names.bn`, no `names.fr`, etc.** Server's `_pickCuratedName(entry, 'ur')` will gracefully fall back to `names.en` (`"Sargodha"`) until PLACE-NAMES-UR-PK-2 enriches `names.ur` to a real Urdu form like `سرگودها`.

## 5. blocked count remaining

**17 blocked** (mixed_latin 10 + mixed_unknown 7) — deferred to a future `ASIA-1D-PK-MCF` mini-phase. Largest blocked:

| slug | pop | fc | issue |
|---|---:|:-:|---|
| `gujranwala` | 2,511,118 | PPLA2 | mixed_latin |
| `bannu` | 1,357,890 | PPLA2 | mixed_unknown (ں Urdu) |
| `sahiwal` | 538,344 | PPLA2 | mixed_latin |
| `dera-ghazi-khan` | 494,464 | PPLA2 | mixed_unknown (country suffix) |
| `chiniot` | 318,165 | PPLA2 | mixed_unknown (Pashto ټ) |
| `muzaffargarh` | 235,541 | PPLA2 | mixed_unknown |
| `jacobabad` | 219,315 | PPLA2 | mixed_latin |
| ...10 more | | | |

## 6. missing-ar majors count remaining

**98 PK major cities (pop ≥ 100k OR PPLA/PPLA2)** are in `needs_review` status because GeoNames has empty `names.ar` for them. Deferred to a future `ASIA-1D-PK-MISSING-AR-MAJORS-1` phase.

Top deferred missing-ar majors:

| slug | pop | fc |
|---|---:|:-:|
| `bahawalpur` | 903,795 | PPLA2 |
| `dera-ismail-khan` | 763,195 | PPLA2 |
| `battagram` | 700,000 | PPLA2 |
| `okara` | 533,693 | PPLA2 |
| `kasur` | 510,875 | PPLA2 |
| `tando-allahyar` | 421,923 | PPLA2 |
| `larkana` | 364,033 | PPLA2 |
| `nawabshah` | 363,138 | PPLA2 |
| `hafizabad` | 318,621 | PPLA2 |
| `abbottabad` | 275,890 | PPLA2 |
| ...88 more | | |

## 7. Tests result

| Suite | Result |
|---|---:|
| `_test_asia_1d_pk_search` (NEW) | **28/28 pass** |
| `_test_place_names_ur_pk_1` (updated for new PK=53) | **38/38 pass** |
| `_test_place_names_ur_af_1` | 41/41 pass |
| `_test_place_names_ur_ir_1` | 66/66 pass |
| `_test_place_names_cross_page_navigation_consistency_fix_1` | 28/28 pass |
| `_test_place_names_homepage_default_city_l10n_fix_1` | 33/33 pass |
| `_test_place_names_sitewide_template_consistency_fix_1` | 26/26 pass |
| `_test_place_names_template_consistency_all_langs_fix_1` | 18/18 pass |
| `_test_place_names_ur_template_consistency_1` | 16/16 pass |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 pass |
| `_test_city_page_l10n` | 152/152 pass |
| `_test_lang_guard` | 5/5 pass |
| `_test_lang_guard_helpers` | 6/6 pass |
| `_test_link_city_name` | 18/18 pass |
| `_test_place_by_slug` | 44/44 pass |
| `_test_external_provider_2` | 32/32 pass |
| `_test_home_search_migration` | 33/33 pass |
| `_test_search_ar` | 22/22 pass |
| `_test_external_cache` | 13/13 pass |
| `_test_fill_lang_map` | 11/11 pass |
| `_test_qibla_back_fix_2` | 12/12 pass |
| `_test_qibla_general_home_search_box_1` | 36/36 pass |
| `_test_moon_general_home_search_box_1` | 37/37 pass |
| `_test_asia_1g_af_search` | 24/24 pass |
| `_test_search_place_endpoint` (heavy, 659 tests) | **659/659 pass** |

**TOTAL: 1,418/1,418 zero failures across 25 suites**

## 8. Production / local spot-checks

### /api/search-place returns correct slug for the 3 fixed cities

| Search query (Arabic) | Top result | Source | Confidence |
|---|---|---|---:|
| `بهاولنغر` | **pk/bahawalnagar** | curated | top result ✓ |
| `ميلسي` | **pk/mailsi** | curated | top result ✓ |
| `ششتيان` | **pk/chishtian** | curated | top result ✓ |
| `ششتيان شريف` (alias) | **pk/chishtian** | curated | top result ✓ |
| `سرغودها` | **pk/sargodha** | curated | top result ✓ |
| `مظفر آباد` | **pk/muzaffarabad** | curated | top result ✓ |

### SSR pages render correct Arabic seed

| URL | seed.name | title |
|---|---|---|
| `/prayer-times-in-bahawalnagar` | بهاولنغر | `مواقيت الصلاة في بهاولنغر اليوم \| …` |
| `/prayer-times-in-mailsi` | ميلسي | `مواقيت الصلاة في ميلسي اليوم \| …` |
| `/prayer-times-in-chishtian` | ششتيان | `مواقيت الصلاة في ششتيان اليوم \| …` |

## 9. Integrity checks

| Check | Result |
|---|:-:|
| curated total before/after | 2,336 → 2,379 ✓ |
| PK count before/after | 10 → 53 ✓ |
| Net merged | +43 ✓ |
| 0 duplicate cc/slug pairs (whole curated) | ✓ |
| 0 duplicate Arabic names within PK | ✓ |
| 0 bad slugs (all match `[a-z0-9][a-z0-9-]{0,79}`) | ✓ |
| 0 missing required fields (en/ar/lat/lng/timezone/slug/countryCode) | ✓ |
| 0 Latin fillchain in names.ur/bn/fr/de/tr/id/es/ms (fillLangMap guard) | ✓ |
| 10 PK seed entries `names.ur` byte-for-byte unchanged | ✓ |
| 10 PK seed entries `aliases.ur` unchanged | ✓ |
| 3 NAME_AR_FIXES correctly applied | ✓ |
| `بهاولبور` (wrong) alias NOT added to bahawalnagar | ✓ |
| `تصيل ميلسي` alias NOT added to mailsi | ✓ |
| `ششتيان شريف` historical alias kept on chishtian | ✓ |

## 10. Next recommended phases (per user direction — NONE started)

```text
ASIA-1D-PK-MCF                       (17 blocked, mixed_latin/mixed_unknown)
ASIA-1D-PK-MISSING-AR-MAJORS-1       (98 majors, missing-ar in GeoNames)
PLACE-NAMES-UR-PK-2                  (Urdu enrichment for 43 new entries)
ASIA-1D-BD                           (Bangladesh — needs BN-WORKFLOW-DESIGN-1 first)
ASIA-1D-IN                           (India — popMin=1M, separate decision phase)
ASIA-1F                              (CN solo)
AMERICAS-1B-MCF                      (151 incl. 120 majors)
Search-ranking improvements
Alias enrichment (general)
DELETE-V1
```

**All deferred — no new phase starts until user requests.**

---

## 11. Files modified

| File | Change | Net |
|---|---|---:|
| `db/places/curated-places.json` | +43 PK entries (names ar+en only, no fillchain) | Data-only |
| `scripts/geodata/apply_curated_candidates.mjs` | **fillLangMap-guard extension**: only carry langs explicitly in `cand.names`; do not write Latin fillchain for missing langs | +13 / −2 |
| `scripts/geodata/countries/pk.mjs` | NEW PK country config (popMin=50k, alwaysInclude PPLC/PPLA, persianSource:true) | +57 |
| `scripts/geodata/_asia_1d_pk_clean_approve.mjs` | NEW approval script with 3 NAME_AR_FIXES + USER_TEST_ALIASES | +199 |
| `scripts/geodata/_asia_1d_pk_premerge_qa.mjs` | NEW PreMerge QA script (8 checks, PK watch-list, PK compound hints) | +335 |
| `scripts/_test_asia_1d_pk_search.mjs` | NEW smoke test (28/28) | +178 |
| `scripts/_test_place_names_ur_pk_1.mjs` | Updated 4 assertions for new PK=53 state | +13 / −10 |
| `db/places/candidates/asia-1d-pk-arabic-quality.json` | NEW Stage 3.5 summary (~30 KB) | committable |
| `reports/asia-1d-pk-premerge-summary.md` | NEW premerge report | — |
| `reports/asia-1d-pk-closure.md` | NEW closure (this) | — |
| `reports/geodata-asia-1d-pk-premerge-qa.md` | NEW PreMerge QA output | — |
| `reports/pk-geodata-import-report.md` | Stage 3 import audit | — |
| `reports/pk-geodata-aliases-review.md` | Stage 3 alias review | — |
| `reports/geodata-asia-1g-pk-persian-pregate-report.md` | Stage 3.4 audit | — |
| `.gitignore` | +5 lines for PK `*-{raw,normalized,candidates}.json` + persian-pregate.json | +9 / 0 |

NOT modified: `server.js`, `js/app.js`, `index.html`, `fillLangMap` (in `_geonames_common.mjs`), the 10 PK seed entries' fields.

Backup at: `db/places/curated-places.json.preAsia1dPk.bak` (2.36 MB).

---

## Status: 🟢 CLOSED — clean merge complete

**Rollback**: `git revert <commit>` reverts all data + scripts + reports together. The backup file allows direct restore if needed.

**Note on `apply_curated_candidates.mjs` extension**: this is a small generic improvement that benefits ALL future GeoData waves (BD, IN, etc.). It honors the PLACE-NAMES-L10N-PIPELINE-GUARD-1 contract uniformly at write-time. The user's "don't change server.js / js/app.js / fillLangMap" constraints were respected — this is a build-time script change, not a runtime change.

**Held (per user direction — DO NOT auto-start)**:
- ASIA-1D-PK-MCF (17 blocked majors)
- ASIA-1D-PK-MISSING-AR-MAJORS-1 (98 missing-ar majors)
- PLACE-NAMES-UR-PK-2 (Urdu enrichment for 43 new entries)
- ASIA-1D-BD, ASIA-1D-IN, ASIA-1F
- AMERICAS-1B-MCF
- Search-ranking, Alias enrichment (general), DELETE-V1
