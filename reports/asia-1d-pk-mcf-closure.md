# ASIA-1D-PK-MCF — Closure Report (blocked-major cities fix)

**Date**: 2026-05-19
**Phase ID**: ASIA-1D-PK-MCF (a.k.a. ASIA-1D-PK-MCF-APPLY)
**Predecessor**: ASIA-1D-PK (clean merge `0bdda2d`)
**User decision**: "approve all 17 with proposed NAME_AR_FIXES" + 8 overlay choices

---

## 1. curated total before / after

| | curated total | PK count |
|---|---:|---:|
| **Before MCF merge** | **2,379** | **53** |
| **After MCF merge** | **2,396** | **70** |
| **Net added** | **+17** | **+17** |

## 2. PK count before / after

**53 → 70**. Pakistan curated coverage:
- 10 seed entries (already had real Urdu — UR-PK-1)
- 43 ASIA-1D-PK clean entries (real Urdu added via UR-PK-2)
- **17 ASIA-1D-PK-MCF entries (Arabic-only — Urdu enrichment pending in PLACE-NAMES-UR-PK-3)**

## 3. merged count = 17 ✓

All 17 user-approved blocked-major entries merged successfully via Stage 4 `apply_curated_candidates.mjs` (with fillLangMap guard at write-time).

## 4. NAME_AR_FIXES applied (all 17)

| slug | before (BLOCKED) | after (user-approved) | strategy |
|---|---|---|---|
| `gujranwala` | `gwjranwalه` (Latin) | **`غوجرانوالا`** | User §1: Wikipedia AR (final ا, not ه) |
| `bannu` | `بنوں` (Urdu ں) | **`بنو`** | User §2: clean Wikipedia AR (no shadda); Urdu ں alias NOT added |
| `sahiwal` | `saهiwal` (Latin) | **`ساهيوال`** | Promoted from existing clean alias |
| `dera-ghazi-khan` | `ديره غازيخان، باكستان` (suffix + no-space) | **`ديرة غازي خان`** | User §4: Wikipedia AR with tah-marbuta + space |
| `chiniot` | `جنيوټ` (Pashto ټ) | **`جنيوت`** | Promoted from existing clean alias |
| `muzaffargarh` | `مظفر غره، باكستان` (suffix) | **`مظفر غره`** | Promoted; country suffix stripped |
| `jacobabad` | `jyڪb abad` (Latin+Sindhi ڪ) | **`جيكب آباد`** | Promoted (with madda variant) |
| `umarkot` | `amrڪwٽ` (Sindhi ڪ+ٽ) | **`أمركوت`** | User §3: Wikipedia AR with initial hamza-on-alif |
| `new-mirpur-city` | `nya myrpr shهr` (Latin) | **`نيا ميربر شهر`** | Promoted from existing clean alias |
| `badin` | `بدين‎` (invisible RLM) | **`بدين`** | User §6: RLM control char stripped |
| `kharian` | `kهaryaں` (Latin+Urdu ں) | **`كهاريان`** | User §5: ں → ن conversion |
| `gujar-khan` | `غجر خاں` (Urdu ں) | **`غوجر خان`** | Promoted from existing clean alias |
| `lala-musa` | `lalه mwsy` (Latin) | **`لاله موسي`** | Promoted from existing clean alias |
| `chunian` | `تصيل جونياں` (admin prefix + ں) | **`جونيان`** | User §7: admin prefix `تصيل` stripped (same as mailsi) |
| `chitral` | `chهtrar` (Latin + extra r) | **`جترال`** | Promoted; semantic mismatch `جهترار` dropped |
| `rohri` | `rwهڙy` (Latin+Sindhi ڙ) | **`روهري`** | Promoted from existing clean alias |
| `rawalakot` | `rawla kwت` (Latin) | **`راولاكوت`** | Promoted; Latin mojibake `rawlakwت` dropped |

## 5. aliases kept / dropped

### Kept (8 aliases preserved across 8 entries)

| slug | aliases.ar kept |
|---|---|
| `gujranwala` | `غوجرانواله` (variant with final ه) |
| `chitral` | `جيترال` (Persian ي variant) |
| `chunian` | `جنيان` (short variant) |
| `dera-ghazi-khan` | `ديره غازي خان` (without tah-marbuta variant) |
| `gujar-khan` | `غوجرخان` (no-space variant) |
| `jacobabad` | `جيكب اباد` (no-madda variant) |
| `new-mirpur-city` | `ميربور` (short form) |
| `rawalakot` | `راولا كوت` (with-space variant) |

### Dropped (24 aliases across 13 entries — full audit in apply log)

Categories:
- **Country suffix `، باكستان`**: `sahiwal`, `chiniot`, `jacobabad`, `muzaffargarh` variants
- **Admin prefix `تصيل`**: `chunian.تصيل جونياں`
- **Urdu ں**: `kharian.كهارياں`, `chunian.جونياں`, `gujar-khan.غوجر خاں` (already rejected by clean-check)
- **Pashto ې**: `dera-ghazi-khan.دېره غازي خان`
- **Sindhi ڪ/ڙ/ٽ**: `jacobabad.جيڪب آباد`, `umarkot.امرڪوٽ`, `rohri.روهڙي`
- **Diacritics-heavy**: `sahiwal.ساهِيوال`, `lala-musa.لاله موسيٰ` (with U+0670)
- **Latin mojibake**: `rawalakot.rawlakwت`
- **Semantic mismatch**: `chitral.جهترار` (different word — extra "r")
- **Self-dup (already promoted to primary)**: 8 aliases where the alias matched the new primary name.ar after clean-up

## 6. تأكيد 0 slug collisions

✅ **Verified by integrity check + smoke test Part H**: all 17 slugs are bare and unique across the whole curated_places.json (0 duplicate cc/slug pairs).

## 7. تأكيد 0 Arabic-name collisions

✅ **Verified by integrity check**: each of the 17 proposed `names.ar` values is unique within PK and across all curated entries. Smoke test §H confirms 0 duplicate Arabic names within PK.

## 8. تأكيد no fake localized fillchain

✅ **Verified by smoke test Part C**: 0 leaks across 8 locales × 17 entries = **136 checks all passed**. All 17 MCF entries have `names = {ar, en}` only — no Latin fillchain for `names.ur/bn/fr/de/tr/id/es/ms`.

Server's `_pickCuratedName(entry, 'ur')` will gracefully fall back to `names.en` (Latin) for these 17 cities on `/ur/` pages until the future `PLACE-NAMES-UR-PK-3` wave adds real Urdu.

This confirms the `apply_curated_candidates.mjs` fillLangMap guard (extended in ASIA-1D-PK clean merge, commit `0bdda2d`) is working correctly for the MCF wave too.

## 9. blocked remaining after MCF

**0 blocked-major entries remain.** All 17 from ASIA-1D-PK Stage 3.5 are now merged.

Deferred (separate phase): **98 missing-ar majors** (PK cities with empty `names.ar` in GeoNames) → future `ASIA-1D-PK-MISSING-AR-MAJORS-1`. Includes Bahawalpur 904k, Dera Ismail Khan 763k, Okara 534k, Kasur 511k, Larkana 364k, Abbottabad 276k, +92 others.

## 10. Tests result

**1,495/1,495 zero failures across 26 suites**:

| Suite | Result |
|---|---:|
| `_test_asia_1d_pk_mcf` (new) | **61/61** |
| `_test_asia_1d_pk_search` (updated for PK≥53) | 29/29 |
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

## 11. Production / browser spot-checks

### Arabic search returns correct slug for all 6 spot-checks

| Search query (Arabic) | Top result | Source | Status |
|---|---|---|:-:|
| `غوجرانوالا` | pk/gujranwala | curated | ✓ |
| `بنو` | pk/bannu | curated | ✓ |
| `ديرة غازي خان` | pk/dera-ghazi-khan | curated | ✓ |
| `أمركوت` | pk/umarkot | curated | ✓ |
| `بدين` | pk/badin | curated | ✓ |
| `كهاريان` | pk/kharian | curated | ✓ |

### SSR pages render correct Arabic seed (10 priority URLs)

All 10 priority `/prayer-times-in-{slug}` pages render the correct Arabic name in `__PRAYER_CITY__.name` (smoke test Part F).

### Regression on prior phases — 7/7 unchanged

| URL | Expected | Verified |
|---|---|:-:|
| `/ur/prayer-times-in-charikar` | چاریکار (UR-AF-1) | ✓ |
| `/ur/prayer-times-in-karaj` | کرج (UR-IR-1) | ✓ |
| `/ur/prayer-times-in-rawalpindi` | راولپنڈی (PK seed) | ✓ |
| `/ur/prayer-times-in-sargodha` | سرگودھا (UR-PK-2) | ✓ |
| `/ur/prayer-times-in-bahawalnagar` | بہاولنگر (UR-PK-2) | ✓ |
| `/prayer-times-in-bahawalnagar` | بهاولنغر (AR ASIA-1D-PK) | ✓ |
| `/en/prayer-times-in-gujranwala` | Gujranwala (EN MCF) | ✓ |

---

## 12. Next recommended phases

```text
Recommended next (per user direction — HELD pending approval):

1. PLACE-NAMES-UR-PK-3                — Urdu enrichment for the 17 new MCF
                                        entries (matches AF/IR/PK-1/PK-2
                                        pattern). Expected scope: 17 names.ur
                                        + clean aliases.ur.

2. ASIA-1D-PK-MISSING-AR-MAJORS-1     — 98 majors missing GeoNames Arabic.
                                        Largest: Bahawalpur 904k, Dera Ismail
                                        Khan 763k, Okara 534k, Kasur 511k,
                                        Larkana 364k, Abbottabad 276k.
                                        Requires user-supplied Arabic
                                        (MISSING_AR_ADDITIONS pattern from
                                        ASIA-1I-MCF).

3. ASIA-1D-BD                         — Bangladesh GeoData (needs
                                        BN-WORKFLOW-DESIGN-1 first).

4. ASIA-1D-IN                         — India GeoData (popMin=1M; separate
                                        preflight phase needed).

5. ASIA-1F / AMERICAS-1B-MCF / Search-ranking / Alias enrichment /
   DELETE-V1 — held.
```

---

## 13. Files modified

| File | Change | Net |
|---|---|---:|
| `db/places/curated-places.json` | +17 PK entries (names.{ar, en} only — fillLangMap guard verified) | Data-only |
| `scripts/geodata/_asia_1d_pk_blocked_major_cities_approve.mjs` | NEW approve script (17 NAME_AR_FIXES + alias cleanup) | +240 |
| `scripts/_test_asia_1d_pk_mcf.mjs` | NEW smoke test (61/61) | +275 |
| `scripts/_test_asia_1d_pk_search.mjs` | Updated PK-count assertion: 53 → >=53 (allows MCF growth) | +5 / −3 |
| `db/places/candidates/pk-geonames-candidates.json` | Updated (17 entries flipped pending→approved) | (gitignored — not committed) |
| `reports/asia-1d-pk-mcf-review.md` | (already committed at review phase) | — |
| `reports/asia-1d-pk-mcf-closure.md` | NEW closure (this) | — |
| `db/places/curated-places.json.preAsia1dPkMcf.bak` | NEW backup (gitignored) | — |

NOT modified: `server.js`, `js/app.js`, `index.html`, `fillLangMap` (in `_geonames_common.mjs`), 10 PK seed entries, 43 ASIA-1D-PK clean entries (names.ar + names.en + names.ur unchanged for all 53 prior PK entries).

---

## Status: 🟢 CLOSED — 17 PK blocked-majors now merged

**Rollback**: `git revert <commit>` reverts data + scripts + reports together. Backup `curated-places.json.preAsia1dPkMcf.bak` (2.39 MB) available for direct file restore.

**Pakistan curated state post-MCF**:
- ✅ **PK total: 70 entries** (10 seed + 43 ASIA-1D-PK clean + 17 MCF)
- ✅ **Urdu coverage: 53/70 (76%)** — 10 seed + 43 ASIA-1D-PK (via UR-PK-2). MCF 17 cities have NO Urdu yet (deferred to PLACE-NAMES-UR-PK-3)
- ⏳ **Held**: 98 missing-ar majors

**No runtime translation. No translation API. No browser auto-translate dependency.**
