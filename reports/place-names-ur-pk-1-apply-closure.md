# PLACE-NAMES-UR-PK-1-APPLY — Closure Report

**Date**: 2026-05-19
**Phase ID**: PLACE-NAMES-UR-PK-1-APPLY
**Predecessor (review)**: PLACE-NAMES-UR-PK-1 (review report approved by user)
**User decision**: "Option B — alias enrichment فقط" with 3 specific aliases.

---

## 1. عدد `names.ur` التي تغيرت

**0** (zero). All 10 PK seed entries retain their original `names.ur` byte-for-byte:

| slug | names.ur (unchanged) |
|---|---|
| karachi | کراچی |
| lahore | لاہور |
| islamabad | اسلام آباد |
| rawalpindi | راولپنڈی |
| peshawar | پشاور |
| multan | ملتان |
| faisalabad | فیصل آباد |
| quetta | کوئٹہ |
| hyderabad-pk | حیدرآباد |
| sialkot | سیالکوٹ |

The apply script includes a post-mutation assertion (`stats.namesUrTouched > 0 → exit 1`) — it would have failed loudly if even one byte of any `names.ur` had changed.

## 2. عدد `aliases.ur` المضافة

**3** (exactly):

| slug | alias added | reason |
|---|---|---|
| `rawalpindi` | **پنڈی** | Colloquial short form "Pindi" — very common in spoken Urdu |
| `faisalabad` | **لائلپور** | Historical "Lyallpur" name — British era, used until 1979 |
| `hyderabad-pk` | **حیدر آباد** | With-space variant matching the Arabic form `حيدر آباد` |

## 3. تأكيد أن المدن الباكستانية الـ10 لديها Urdu حقيقي مسبقاً

✅ **Verified**. All 10 PK entries had real, native Urdu in the original seed BEFORE this phase. 8 of 10 use Urdu-specific letters (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے):

- `lahore.لاہور` (ہ), `quetta.کوئٹہ` (ٹ + ہ), `rawalpindi.راولپنڈی` (ڈ), `sialkot.سیالکوٹ` (ٹ)
- `karachi.کراچی`, `peshawar.پشاور`, `faisalabad.فیصل آباد`, `hyderabad-pk.حیدرآباد` (Persian چ/پ/ی)
- `multan.ملتان`, `islamabad.اسلام آباد` (identical-script — no Urdu-only chars needed)

This is in sharp contrast to PLACE-NAMES-UR-AF-1 (36 pipeline rows) and PLACE-NAMES-UR-IR-1 (41 pipeline rows) where the bulk of work was adding new `names.ur` over Latin fillchain. **PK was a no-op for `names.ur`**.

## 4. تأكيد عدم تنظيف duplicate aliases

✅ **Confirmed not cleaned**. 8 of 10 PK entries have an `aliases.ur` entry equal to their `names.ur` (no-op cosmetic noise):

| slug | duplicate alias preserved |
|---|---|
| karachi | `["کراچی"]` (same as names.ur) |
| lahore | `["لاہور"]` |
| islamabad | `["اسلام آباد", "اسلام اباد"]` (first one is duplicate; second is no-madda variant) |
| rawalpindi | `["راولپنڈی", "پنڈی"]` (first is duplicate; پنڈی is new from this phase) |
| peshawar | `["پشاور"]` |
| multan | `["ملتان"]` |
| faisalabad | `["فیصل آباد", "لائلپور"]` (first is duplicate; لائلپور is new from this phase) |
| quetta | `["کوئٹہ"]` |

These duplicates remain exactly as in the seed (per user §3 — out of scope for this phase). They have no functional impact; the search-place engine dedups against `names.ur` first.

## 5. تأكيد أن مدن PK الجديدة خارج النطاق

✅ **Verified**. The smoke test explicitly checks that the following potential PK cities are **NOT** added to curated_places.json:

| slug | status |
|---|---|
| `bahawalpur` | ❌ NOT added (out of scope) |
| `gujranwala` | ❌ NOT added (out of scope) |
| `sargodha` | ❌ NOT added (out of scope) |
| `sukkur` | ❌ NOT added (out of scope) |
| `larkana` | ❌ NOT added (out of scope) |
| `mardan` | ❌ NOT added (out of scope) |
| `sheikhupura` | ❌ NOT added (out of scope) |

Total PK entries in curated: **10** (unchanged from pre-apply). These cities would need a separate `ASIA-1D-PK` or `PAKISTAN-EXPANSION-1` wave to enter curated first.

## 6. نتائج اختبارات البحث بالـ3 aliases

✅ **All 3 alias searches succeed via `/api/search-place`**:

| Search query | Top result | Confidence | Source |
|---|---|---:|---|
| `پنڈی` | **pk/rawalpindi** | 64 | curated |
| `لائلپور` | **pk/faisalabad** | 124 | curated |
| `حیدر آباد` | **pk/hyderabad-pk** (top) + pk/hyderabad-in (2nd, India) | 123 / 121 | curated |

Note for `حیدر آباد`: both Pakistani (hyderabad-pk) and Indian (hyderabad-in) Hyderabad cities share the same name; PK ranks slightly higher (123 vs 121) because we added the alias to the PK entry. Users see both options in the dropdown, which is correct behavior.

### Regression: SSR pages still render correct Urdu

✅ **6 priority `/ur/prayer-times-in-{slug}` pages verified** (apart of smoke Part E):

| URL | SSR `__PRAYER_CITY__.name` | matches expected |
|---|---|:-:|
| /ur/prayer-times-in-karachi | کراچی | ✓ |
| /ur/prayer-times-in-lahore | لاہور | ✓ |
| /ur/prayer-times-in-islamabad | اسلام آباد | ✓ |
| /ur/prayer-times-in-rawalpindi | راولپنڈی | ✓ |
| /ur/prayer-times-in-faisalabad | فیصل آباد | ✓ |
| /ur/prayer-times-in-hyderabad-pk | حیدرآباد | ✓ |

## 7. تأكيد عدم استخدام runtime translation

- ❌ NO translation API call
- ❌ NO runtime translation
- ❌ NO AI translation during page load
- ❌ NO browser auto-translate dependency
- ✅ All 3 aliases are static (in `curated_places.json`), reviewed (per `place-names-ur-pk-1-review.md`), read directly from `aliases.ur` at search time

---

## 8. Constraint compliance audit (user's 8-point rules)

| User rule | Compliance | Notes |
|---|:-:|---|
| 1. Don't change names.ur | ✅ | 0 mutations (asserted by apply script) |
| 2. Don't change names.ar | ✅ | Verified via diff |
| 3. Don't change names.en | ✅ | Verified via diff |
| 4. Add only 3 user-approved aliases | ✅ | Exactly 3 added |
| 5. Don't change server.js | ✅ | NOT modified |
| 6. Don't change js/app.js | ✅ | NOT modified |
| 7. Don't change fillLangMap | ✅ | NOT modified |
| 8. No runtime translation | ✅ | Confirmed |

Bonus constraint compliance:
- ✅ Duplicate aliases.ur NOT cleaned up (user §3)
- ✅ No new PK cities added (user §4)
- ✅ Other countries (IN/BD/etc.) NOT touched
- ✅ Cache-buster NOT bumped (no code changes → unnecessary)
- ✅ Other countries' Urdu (AF/IR) NOT touched

## 9. Files modified

| File | Change | Net |
|---|---|---:|
| `db/places/curated-places.json` | 3 IR rows: `aliases.ur` extended (pk/rawalpindi + پنڈی, pk/faisalabad + لائلپور, pk/hyderabad-pk + حیدر آباد) | Data-only (3 string additions) |
| `scripts/geodata/_place_names_ur_pk_1_apply.mjs` | NEW apply script (idempotent, backup, post-mutation assertion) | +199 |
| `scripts/_test_place_names_ur_pk_1.mjs` | NEW smoke test (40/40) | +189 |
| `reports/place-names-ur-pk-1-apply-report.md` | NEW apply audit trail | — |
| `reports/place-names-ur-pk-1-apply-closure.md` | NEW closure | — |
| `db/places/curated-places.json.prePlaceNamesUrPk1.bak` | NEW backup | — |

NOT modified: `server.js`, `js/app.js`, `index.html`, `fillLangMap`, any other curated entries (AF/IR/etc.).

## 10. Test summary — all green

| Suite | Result |
|---|---:|
| `_test_place_names_ur_pk_1` (new) | **40/40** |
| `_test_place_names_ur_af_1` (regression) | 41/41 |
| `_test_place_names_ur_ir_1` (regression) | 66/66 |
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

**TOTAL: 729/729 zero failures across 23 suites**

---

## Status: 🟢 CLOSED — minimal alias enrichment only; data unchanged otherwise.

**Rollback**: `git revert <commit>` reverts apply script + smoke + closure + the 3 data additions together. Backup file `curated-places.json.prePlaceNamesUrPk1.bak` available for direct file restore.

**Architecture note**: PK is now the first country in the codebase where the pre-seeded `names.ur` quality was already at "complete" level — no enrichment needed. AF and IR (and presumably future IN/BD waves) had to fill `names.ur` from Latin fillchain; PK skipped that step.

**Held (not started per user direction)**: PLACE-NAMES-UR-IN-1, PLACE-NAMES-UR-BN-BD-1, ASIA-1D, ASIA-1F, AMERICAS-1B-MCF, Search-ranking, Alias enrichment (general), DELETE-V1.
