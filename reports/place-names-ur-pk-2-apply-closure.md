# PLACE-NAMES-UR-PK-2-APPLY — Closure Report

**Date**: 2026-05-19
**Phase ID**: PLACE-NAMES-UR-PK-2-APPLY
**Predecessor (review)**: PLACE-NAMES-UR-PK-2 (review report approved by user)
**User decision**: "approve all 43 as proposed" with 8 overlay decisions.

---

## 1. عدد rows التي أضيف لها `names.ur`

**43** — all 43 new PK pipeline cities from ASIA-1D-PK now have real Urdu names.

| Result | Count |
|---|---:|
| `names.ur` newly set (was absent) | **43** |
| `names.ur` overwrote an existing value | 0 |
| Skipped (already-applied / idempotent on first run) | 0 |
| 10 PK seed entries touched (must be 0) | **0** ✓ |

## 2. عدد `aliases.ur` المضافة

**29** aliases.ur added across 19 entries.

## 3. qualityScore distribution

| score | count | rows |
|:-:|---:|---|
| 95 | **19** | chishtian, jhang-sadr, shekhupura, gojra, muridke, ahmadpur-east, bhalwal, jahangira, jaranwala, jhelum, kamalia, kotri, mingora, nankana-sahib, sambrial, sargodha, shahdadpur, sukkur, tordher |
| 90 | **14** | mailsi, rahim-yar-khan, chaman, dipalpur, gilgit, gujrat, gwadar, hasilpur, kabirwala, mirpur-khas, pasrur, pattoki, skardu, wazirabad |
| 85 | **4** | bahawalnagar, buni, matli, sibi |
| 75 | **6** | dadu, jamrud, kambar, mardan, muzaffarabad, turbat |

**Total**: 19 + 14 + 4 + 6 = **43** ✓

**19/43 (44%)** use Urdu-specific letters (ہ/ٹ/ڈ/ڑ/ں/ھ/ؤ/ے) — highest density across all 4 Urdu waves (AF: 9/36=25%, IR: 13/41=32%, PK-1: 8/10=80% but only 10 cities, PK-2: 19/43=44%).

## 4. قائمة المدن الـ43 (with applied Urdu names)

### Watch-list (8) — user's special-attention cities

| slug | names.en | names.ar | **names.ur applied** |
|---|---|---|---|
| `bahawalnagar` | Bahawalnagar | بهاولنغر | **بہاولنگر** 🆕 |
| `mailsi` | Mailsi | ميلسي | **میلسی** |
| `chishtian` | Chishtian | ششتيان | **چشتیاں** 🆕 |
| `rahim-yar-khan` | Rahim Yar Khan | رحيم يار خان | **رحیم یار خان** |
| `jhang-sadr` | Jhang Sadr | جانغ صدر | **جھنگ صدر** 🆕 |
| `shekhupura` | Shekhupura | شيخوبوره | **شیخوپورہ** 🆕 |
| `gojra` | Gojra | جوجرا | **گوجرہ** 🆕 |
| `muridke` | Muridke | مريدكي | **مریدکے** 🆕 |

### Others (35)

| slug | names.ur |
|---|---|
| `ahmadpur-east` | احمد پور شرقیہ 🆕 |
| `bhalwal` | بھلوال 🆕 |
| `buni` | بنی |
| `chaman` | چمن |
| `dadu` | دادو |
| `dipalpur` | دیپالپور |
| `gilgit` | گلگت |
| `gujrat` | گجرات |
| `gwadar` | گوادر |
| `hasilpur` | حاصل پور |
| `jahangira` | جہانگیرا 🆕 |
| `jamrud` | جمرود |
| `jaranwala` | جڑانوالا 🆕 |
| `jhelum` | جہلم 🆕 |
| `kabirwala` | کبیر والا |
| `kamalia` | کمالیہ 🆕 |
| `kambar` | قمبر |
| `kotri` | کوٹری 🆕 |
| `mardan` | مردان |
| `matli` | ماتلی |
| `mingora` | مینگورہ 🆕 |
| `mirpur-khas` | میرپور خاص |
| `muzaffarabad` | مظفر آباد |
| `nankana-sahib` | ننکانہ صاحب 🆕 |
| `pasrur` | پسرور |
| `pattoki` | پتوکی |
| `sambrial` | سمبڑیال 🆕 |
| `sargodha` | سرگودھا 🆕 |
| `shahdadpur` | شہدادپور 🆕 |
| `sibi` | سبی |
| `skardu` | سکردو |
| `sukkur` | سکھر 🆕 |
| `tordher` | توردھر 🆕 |
| `turbat` | تربت |
| `wazirabad` | وزیر آباد |

## 5. aliases المقبولة والمرفوضة

### Accepted (29 aliases across 19 rows)

Highlights:
- **Historical**: `chishtian.چشتیان شریف` (Chishtian Sharif honorific)
- **Persian/Arabic variants**: `shekhupura.شیخوپورا`+`شیخوپوره`, `jhelum.جهلم`, `sargodha.سرگودها`, `tordher.توردهر`, `shahdadpur.شهدادپور`, `nankana-sahib.ننکانه صاحب`, `kamalia.کمالیا`+`کمالیه`, `mingora.مینگورا`+`مینگوره`, `jahangira.جهانگیرا`, `gojra.گوجرا`, `chishtian.چشتیان`
- **Long/short variants**: `ahmadpur-east.احمد پور`+`احمدپور`, `mirpur-khas.میر پور خاص`, `dipalpur.دیپال پور`, `wazirabad.وزیرآباد`, `muzaffarabad.مظفرآباد`, `bahawalnagar.بہاول نگر`
- **Diacritics-preserved**: `buni.بُنِی`, `dadu.دادُو`
- **Retroflex variant**: `sambrial.سمبریال`, `jaranwala.جڑانوالہ`+`جرانوالا`
- **Short forms**: `sukkur.سکر`, `muridke.مریدکی`

### Rejected (14 aliases across 9 rows — full audit in apply-report)

| slug | dropped alias | reason |
|---|---|---|
| `bahawalnagar` | `بہاولپور` | 🚨 Cross-city collision: references "Bahawalpur" (different city). Same semantic mismatch as ASIA-1D-PK names.ar fix. |
| `mailsi` | `تصیل میلسی` | Admin-area prefix "تصیل" (misspelling of "تحصیل" = sub-district). |
| `mingora` | `مینګورہ` | Pashto ګ — fails clean-Urdu-script check |
| `jaranwala` | `جړانواله` | Pashto ړ |
| `jaranwala` | `جڙانوالا` | Sindhi ڙ |
| `pattoki` | `پتوڪي` | Sindhi ڪ |
| `kabirwala` | `ڪبير والا` | Sindhi ڪ |
| `kamalia` | `ڪماليه` | Sindhi ڪ |
| `muridke` | `مريدڪي` | Sindhi ڪ |
| `muridke` | `موريدكى`, `موريدكي` | Latin-form mojibake |
| `muridke` | `موریدک` | Truncated/alt form |
| `jhelum` | `جێھلۆم` | Kurdish ێ + ۆ |
| `sambrial` | `سمبڙیال` | Kept the non-retroflex form; this retroflex Sindhi ڙ dropped |

## 6. تأكيد أن `names.ar` و `names.en` لم تتغير

✅ **Verified** by post-mutation assertion inside the apply script + diff-script:

| slug | names.ar (preserved) | names.en (preserved) |
|---|---|---|
| `bahawalnagar` | `بهاولنغر` (ASIA-1D-PK fix) ✓ | `Bahawalnagar` ✓ |
| `mailsi` | `ميلسي` (ASIA-1D-PK fix) ✓ | `Mailsi` ✓ |
| `chishtian` | `ششتيان` (ASIA-1D-PK fix) ✓ | `Chishtian` ✓ |
| All 40 other new PK entries | unchanged | unchanged |

Total: **0** rows had `names.ar` or `names.en` mutated.

## 7. تأكيد أن 10 PK seed entries لم تتغير

✅ **Verified** by post-mutation assertion inside the apply script:

| slug | names.ur (preserved) |
|---|---|
| `karachi` | کراچی ✓ |
| `lahore` | لاہور ✓ |
| `islamabad` | اسلام آباد ✓ |
| `rawalpindi` | راولپنڈی ✓ |
| `peshawar` | پشاور ✓ |
| `multan` | ملتان ✓ |
| `faisalabad` | فیصل آباد ✓ |
| `quetta` | کوئٹہ ✓ |
| `hyderabad-pk` | حیدرآباد ✓ |
| `sialkot` | سیالکوٹ ✓ |

`aliases.ur` also unchanged. **0** seed entries mutated.

## 8. نتائج اختبارات Urdu SSR

**65/65 pass** (`_test_place_names_ur_pk_2.mjs` — new smoke):

| Part | Coverage | Result |
|---|---|---:|
| A | 43 user-approved names.ur present | 11/11 ✓ |
| B | 29 aliases.ur additions verified across 8 spot-checks | 8/8 ✓ |
| C | names.ar/en preserved (6 spot-checks incl. 3 NAME_AR_FIXES) | 6/6 ✓ |
| D | 10 PK seed entries unchanged | 10/10 ✓ |
| E | Dropped aliases NOT present + 0 Pashto/Sindhi/Kurdish anywhere | 3/3 ✓ |
| F | 8 priority /ur/prayer-times-in-{slug} SSR seed.name correct | 8/8 ✓ |
| G | Cross-route SSR (moon-in/moon-today-in/qibla-in × 4 cities = 12) | 12/12 ✓ |
| H | Regression on prior phases (AF/IR/PK-1/AR/EN) | 7/7 ✓ |

## 9. نتائج اختبارات prayer/moon/qibla navigation

**Cross-route × 4 cities × 3 routes = 12 combinations verified** in Part G of the smoke test:

| city | route | URL | seed.name = expected? |
|---|---|---|:-:|
| bahawalnagar | moon-in | `/ur/moon-in-bahawalnagar` | ✓ بہاولنگر |
| bahawalnagar | moon-today-in | `/ur/moon-today-in-bahawalnagar` | ✓ بہاولنگر |
| bahawalnagar | qibla-in | `/ur/qibla-in-bahawalnagar` | ✓ بہاولنگر |
| chishtian | moon-in | `/ur/moon-in-chishtian` | ✓ چشتیاں |
| chishtian | moon-today-in | `/ur/moon-today-in-chishtian` | ✓ چشتیاں |
| chishtian | qibla-in | `/ur/qibla-in-chishtian` | ✓ چشتیاں |
| sargodha | moon-in | `/ur/moon-in-sargodha` | ✓ سرگودھا |
| sargodha | moon-today-in | `/ur/moon-today-in-sargodha` | ✓ سرگودھا |
| sargodha | qibla-in | `/ur/qibla-in-sargodha` | ✓ سرگودھا |
| sukkur | moon-in | `/ur/moon-in-sukkur` | ✓ سکھر |
| sukkur | moon-today-in | `/ur/moon-today-in-sukkur` | ✓ سکھر |
| sukkur | qibla-in | `/ur/qibla-in-sukkur` | ✓ سکھر |

All 12 cross-route combinations return correct Urdu name in SSR seed.

## 10. تأكيد عدم استخدام runtime translation

- ❌ NO translation API call
- ❌ NO runtime translation
- ❌ NO AI translation during page load
- ❌ NO browser auto-translate dependency
- ✅ All 43 Urdu names came from: GeoNames Persian/Urdu `alternatenames` (33 rows) + Urdu Wikipedia canonical (1 row) + Layer-2 transliteration from existing `names.ar` (6 identical-script rows) + Persian-only single-hit (3 rows)
- ✅ All names are **stored** (in `curated_places.json`), **reviewed** (per `place-names-ur-pk-2-review.md`), **static** (no runtime fetch), **read from `names.ur` at SSR** (via `_pickCuratedName(entry, 'ur')`)

---

## 11. Carry-forward suites (all green)

| Suite | Result |
|---|---:|
| `_test_place_names_ur_pk_2` (new) | **65/65** |
| `_test_asia_1d_pk_search` (updated for UR-PK-2 baseline) | 29/29 |
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
| `_test_search_place_endpoint` (heavy) | 659/659 |

**TOTAL: 1,494/1,494 zero failures across 26 suites**

---

## 12. Files modified

| File | Change | Net |
|---|---|---:|
| `db/places/curated-places.json` | 43 PK rows: names.ur set + 29 aliases.ur added | Data-only |
| `scripts/geodata/_place_names_ur_pk_2_apply.mjs` | NEW apply script (idempotent, with backup + post-mutation assertion) | +335 |
| `scripts/_test_place_names_ur_pk_2.mjs` | NEW smoke test (65/65) | +250 |
| `scripts/_test_asia_1d_pk_search.mjs` | Updated fillchain-leak check to allow names.ur (UR-PK-2 populated) + new "all 43 have real names.ur" assertion | +11 / −7 |
| `reports/place-names-ur-pk-2-review.md` | NEW review (already committed at review phase) | — |
| `reports/place-names-ur-pk-2-apply-report.md` | NEW audit trail | — |
| `reports/place-names-ur-pk-2-apply-closure.md` | NEW closure (this) | — |
| `db/places/curated-places.json.prePlaceNamesUrPk2.bak` | NEW backup | — |

NOT modified: `server.js`, `js/app.js`, `index.html`, `fillLangMap` in `_geonames_common.mjs`, 10 PK seed entries' fields, `names.ar` / `names.en` for any entry.

---

## Status: 🟢 CLOSED — 43 new PK cities now have real Urdu names

**Rollback**: `git revert <commit>` reverts data + scripts + reports together. Backup file `curated-places.json.prePlaceNamesUrPk2.bak` available for direct file restore.

**Architecture rule confirmed**: Stage 4 merges new GeoData entries write `{en, ar}` only (PLACE-NAMES-L10N-PIPELINE-GUARD-1 extension in apply_curated_candidates.mjs). PLACE-NAMES-UR-PK-2-APPLY then enriches `names.ur` with real human-reviewed values post-merge. This 2-step pattern (geo merge → lang enrichment) is the established workflow for all future GeoData waves (BD, IN, etc.).

**Held (per user direction — DO NOT auto-start)**:
- ASIA-1D-PK-MCF (17 blocked-majors)
- ASIA-1D-PK-MISSING-AR-MAJORS-1 (98 missing-ar majors incl. Bahawalpur, Larkana, Okara, Kasur, Dera Ismail Khan, etc.)
- ASIA-1D-BD, ASIA-1D-IN, ASIA-1F
- PLACE-NAMES-UR-IN-1, PLACE-NAMES-BN-BD-1
- AMERICAS-1B-MCF
- Search-ranking, Alias enrichment, DELETE-V1
