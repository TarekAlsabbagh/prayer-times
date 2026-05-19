# PLACE-NAMES-UR-PK-6 (Fast Track) — Apply closure

**Date**: 2026-05-19
**Wave**: PLACE-NAMES-UR-PK-6 (sixth Urdu enrichment wave for Pakistan)
**Source merge**: ASIA-1D-PK-MISSING-AR-MAJORS-1C (`12f3c89`, 2026-05-19)
**Policy**: Fast Track Review+Apply — single-phase per 2026-05-19 user policy
**Status**: ✅ READY FOR USER APPROVAL
**Backup**: `db/places/curated-places.json.prePlaceNamesUrPk6.bak`

---

## 🏆 Milestone: PAKISTAN URDU 148/148 RESTORED

After this wave, Pakistan now has full Urdu coverage matching Arabic:

| Metric         | Before UR-PK-6 | After UR-PK-6 |
|----------------|----------------|----------------|
| PK total       | 148            | 148            |
| PK Arabic      | 148/148 (100%) | 148/148 (100%) |
| PK Urdu        | 119/148 (80%)  | **148/148 (100%)** ⭐ |
| Pending Urdu   | 29             | **0** 🏆 |
| Coverage gap   | 29             | 0              |

---

## 1. Rows that received `names.ur` (29 total)

All 29 BATCH-C entries received freshly-authored `names.ur` (none had any pre-existing value):

| # | slug | names.ur applied | names.ar (preserved) |
|---|------|-----------------|---------------------|
| 1 | `alahabad` | اللہ آباد | الله آباد |
| 2 | `chichawatni` | چیچہ وطنی | جيجاواتني |
| 3 | `chuhar-kana` | چوہڑ کانا | جوهار كانا |
| 4 | `daharki` | ڈہرکی | داهاركي |
| 5 | `fatehjang` | فتح جنگ | فاتح جانغ |
| 6 | `harunabad` | ہارون آباد | هارون آباد |
| 7 | `haveli-lakha` | حویلی لکھا | حويلي لاكا |
| 8 | `hujra-shah-muqim` | حجرہ شاہ مقیم | حجرة شاه مقيم |
| 9 | `jahanian` | جہانیاں | جهانيان |
| 10 | `jalalpur-jattan` | جلال پور جٹاں | جلال بور جتان |
| 11 | `jampur` | جام پور | جام بور |
| 12 | `kahror-pakka` | کہروڑ پکا | كاهرور باكا |
| 13 | `kandhkot` | کندھ کوٹ | كنده كوت |
| 14 | `mian-channun` | میاں چنوں | ميان جانون |
| 15 | `minchinabad` | منچن آباد | مينتشين آباد |
| 16 | `moro` | مورو | مورو |
| 17 | `nowshera-kalan` | نوشہرہ کلاں | نوشيرا كلان |
| 18 | `pabbi` | پبی | بابي |
| 19 | `pano-aqil` | پانو عاقل | بانو عاقل |
| 20 | `qabula` | قبولا | قابولا |
| 21 | `qubo-saeed-khan` | قبو سعید خان | قبو سعيد خان |
| 22 | `rabwah` | ربوہ | ربوة |
| 23 | `sangla-hill` | سانگلا ہل | سنغلا هيل |
| 24 | `shabqadar` | شبقدر | شب قدر |
| 25 | `shakargarh` | شکر گڑھ | شكر غره |
| 26 | `sharifabad` | شریف آباد | شريف آباد |
| 27 | `shorkot` | شور کوٹ | شور كوت |
| 28 | `shujaabad` | شجاع آباد | شجاع آباد |
| 29 | `topi` | ٹوپی | توبي |

**Counts**:
- `names.ur` newly set: 29
- `names.ur` overwrote: 0 (all entries had absent Urdu)
- `names.ur` total: **29 names added**

---

## 2. `aliases.ur` added (13 aliases for 13 entries)

| # | slug | alias.ur added | purpose |
|---|------|---------------|---------|
| 1 | `jalalpur-jattan` | جلالپور جٹاں | no-space variant |
| 2 | `kandhkot` | کندھکوٹ | no-space variant |
| 3 | `nowshera-kalan` | نوشہرہ کلان | non-retroflex Kalan variant |
| 4 | `chichawatni` | چیچا وطنی | ا-end variant |
| 5 | `rabwah` | چناب نگر | "Chenab Nagar" — official 1998 rename |
| 6 | `chuhar-kana` | چوہڑکانہ | no-space-end-ہ variant |
| 7 | `shorkot` | شورکوٹ | no-space variant |
| 8 | `minchinabad` | منچین آباد | -chin- with Persian ی variant |
| 9 | `haveli-lakha` | حویلی لاکھا | with-alif variant |
| 10 | `shakargarh` | شکرگڑھ | no-space variant |
| 11 | `jampur` | جامپور | no-space variant |
| 12 | `sangla-hill` | سنگلا ہل | no-alif variant |
| 13 | `qabula` | قبولہ | ہ-end variant |

**Total aliases added**: 13 (only valuable variants; pollution-free)

**16 entries received no aliases** (the primary name is sufficient and no canonical variants exist):
- `qubo-saeed-khan`, `daharki`, `fatehjang`, `alahabad`, `moro`, `mian-channun`, `topi`, `pano-aqil`, `harunabad`, `kahror-pakka`, `shabqadar`, `shujaabad`, `hujra-shah-muqim`, `sharifabad`, `pabbi`, `jahanian`

---

## 3. qualityScore distribution

Scoring guide:
- **95** = uses Urdu retroflex / Persian-specific letters (ٹ ڈ ڑ ں ھ پ چ ژ گ)
- **85** = uses Persian-Urdu shared letters (ی ہ ک ے) but not retroflex
- **80** = pure Arabic-Urdu shared script (rare for PK)

| Score | Count | % | Cities |
|-------|------:|---|--------|
| **95** | 22 | 76% | jalalpur-jattan, daharki, kandhkot, nowshera-kalan, chichawatni, fatehjang, mian-channun, topi, pano-aqil, rabwah, kahror-pakka, chuhar-kana, shorkot, minchinabad, haveli-lakha, shakargarh, jampur, hujra-shah-muqim, sangla-hill, pabbi, jahanian, alahabad |
| **85** | 3 | 10% | qubo-saeed-khan, harunabad, sharifabad |
| **80** | 4 | 14% | moro, shabqadar, shujaabad, qabula |

**Urdu-specific letter density**: 25/29 = **86%** — highest of all six UR-PK waves:
- UR-PK-1 (10 seed): ~70%
- UR-PK-2 (43 clean): ~74%
- UR-PK-3 (17 MCF): 76%
- UR-PK-4 (20 MAJORS-1A): 65%
- UR-PK-5 (29 MAJORS-1B): 83%
- **UR-PK-6 (29 BATCH-C)**: **86%** ⭐

---

## 4. List of the 29 (alphabetic)

```
alahabad             chichawatni          chuhar-kana
daharki              fatehjang            harunabad
haveli-lakha         hujra-shah-muqim     jahanian
jalalpur-jattan      jampur               kahror-pakka
kandhkot             mian-channun         minchinabad
moro                 nowshera-kalan       pabbi
pano-aqil            qabula               qubo-saeed-khan
rabwah               sangla-hill          shabqadar
shakargarh           sharifabad           shorkot
shujaabad            topi
```

29 cities total. Tier 3 (pop 50k-99k) only. All from BATCH-C of ASIA-1D-PK-MISSING-AR-MAJORS-1C.

---

## 5. Aliases accepted vs rejected

**Accepted: 13** (listed in Section 2 above).

**Rejected: 0**.

Selection criteria (pollution-free):
- Real spelling variants used in Urdu Wikipedia or common usage (e.g., با ہ vs ا at end, with-space vs no-space)
- Historical/official renames (e.g., رابوہ → چناب نگر, the 1998 government rename for Rabwah)
- Avoided Pashto/Sindhi/Kurdish letter pollution (ښ ګ څ ڙ ٻ ڪ etc.)
- Avoided Latin/mojibake fragments
- Avoided diacritics-heavy or RLM-laden forms
- Each alias verified to NOT collide with any of the 119 PRIOR-PK Urdu names/aliases (pre-flight cross-check passed 0 collisions)

For 16 entries, the primary Urdu name is sufficient and no widely-used variants exist (rejection rate: 0%).

---

## 6. ✅ Confirmation: `names.ar` and `names.en` not changed

Verified via post-apply byte-for-byte comparison (`db/places/curated-places.json.prePlaceNamesUrPk6.bak` vs current):

```
names.ar diffs: 0 (MUST BE 0) ✓
names.en diffs: 0 (MUST BE 0) ✓
```

All 29 BATCH-C `names.ar` from MAJORS-1C preserved byte-for-byte:
- ربوة (rabwah), شكر غره (shakargarh), جام بور (jampur), حجرة شاه مقيم (hujra-shah-muqim), فاتح جانغ (fatehjang), and 24 others.

All 29 BATCH-C `names.en` (Latin-only city names) preserved byte-for-byte.

---

## 7. ✅ Confirmation: PRIOR-119 PK entries not changed

Verified via post-apply byte-for-byte comparison:

```
PRIOR-119 names.ur diffs:    0 (MUST BE 0) ✓
PRIOR-119 aliases.ur diffs:  0 (MUST BE 0) ✓
```

Spot-checked 14 PRIOR-119 entries across all 5 prior waves — all preserve their Urdu byte-for-byte:

| Wave | Slug | Urdu (preserved) |
|------|------|-----------------|
| UR-PK-1 (seed) | `karachi` | کراچی |
| UR-PK-1 (seed) | `lahore` | لاہور |
| UR-PK-1 (seed) | `rawalpindi` | راولپنڈی |
| UR-PK-2 (clean-43) | `sargodha` | سرگودھا |
| UR-PK-2 (clean-43) | `bahawalnagar` | بہاولنگر |
| UR-PK-2 (clean-43) | `chishtian` | چشتیاں |
| UR-PK-3 (MCF-17) | `gujranwala` | گوجرانوالہ |
| UR-PK-3 (MCF-17) | `bannu` | بنوں |
| UR-PK-3 (MCF-17) | `kharian` | کھاریاں |
| UR-PK-4 (BATCH-A-20) | `bahawalpur` | بہاولپور |
| UR-PK-4 (BATCH-A-20) | `larkana` | لاڑکانہ |
| UR-PK-5 (BATCH-B-29) | `attock-city` | اٹک |
| UR-PK-5 (BATCH-B-29) | `mianwali` | میانوالی |
| UR-PK-5 (BATCH-B-29) | `zhob` | ژوب |

---

## 8. ✅ Urdu SSR tests

10 priority BATCH-C cities tested via `/ur/prayer-times-in-{slug}` route:

| URL | SSR seed.name | Expected | |
|-----|---------------|----------|---|
| `/ur/prayer-times-in-daharki` | ڈہرکی | ڈہرکی | ✓ |
| `/ur/prayer-times-in-kandhkot` | کندھ کوٹ | کندھ کوٹ | ✓ |
| `/ur/prayer-times-in-nowshera-kalan` | نوشہرہ کلاں | نوشہرہ کلاں | ✓ |
| `/ur/prayer-times-in-chichawatni` | چیچہ وطنی | چیچہ وطنی | ✓ |
| `/ur/prayer-times-in-rabwah` | ربوہ | ربوہ | ✓ |
| `/ur/prayer-times-in-shakargarh` | شکر گڑھ | شکر گڑھ | ✓ |
| `/ur/prayer-times-in-jahanian` | جہانیاں | جہانیاں | ✓ |
| `/ur/prayer-times-in-topi` | ٹوپی | ٹوپی | ✓ |
| `/ur/prayer-times-in-mian-channun` | میاں چنوں | میاں چنوں | ✓ |
| `/ur/prayer-times-in-hujra-shah-muqim` | حجرہ شاہ مقیم | حجرہ شاہ مقیم | ✓ |

**Page-template consistency** (for `/ur/prayer-times-in-rabwah`):
- SSR seed: `ربوہ` ✓
- H1: `آج ربوہ میں اوقاتِ نماز` ✓
- Title: `ربوہ میں آج اوقاتِ نماز | روزانہ اذان کا شیڈول` ✓

---

## 9. ✅ Prayer/Moon/Qibla cross-route navigation tests

Tested 5 priority BATCH-C cities across all 4 route families (5 × 4 = **20 combinations, all PASS**):

| Slug | /ur/prayer-times-in- | /ur/moon-in- | /ur/moon-today-in- | /ur/qibla-in- |
|------|----------------------|--------------|--------------------|---------------|
| `daharki` | ✓ ڈہرکی | ✓ ڈہرکی | ✓ ڈہرکی | ✓ ڈہرکی |
| `rabwah` | ✓ ربوہ | ✓ ربوہ | ✓ ربوہ | ✓ ربوہ |
| `shakargarh` | ✓ شکر گڑھ | ✓ شکر گڑھ | ✓ شکر گڑھ | ✓ شکر گڑھ |
| `jalalpur-jattan` | ✓ جلال پور جٹاں | ✓ جلال پور جٹاں | ✓ جلال پور جٹاں | ✓ جلال پور جٹاں |
| `jahanian` | ✓ جہانیاں | ✓ جہانیاں | ✓ جہانیاں | ✓ جہانیاں |

**Cross-page navigation confirmed**: name is identical across all 4 routes for each city — proves `PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1` SSR seed injection works for all city route families.

---

## 10. ✅ Confirmation: no runtime translation

Verified by inspecting SSR HTML output for `/ur/prayer-times-in-rabwah`:

- ✓ No `translate.googleapis.com` references
- ✓ No `translate.google.com` references
- ✓ No `translator.api` references
- ✓ No `libretranslate` references
- ✓ No `openai.com` references
- ✓ No `api.anthropic` references
- ✓ Urdu name `ربوہ` is **statically pre-rendered** in:
  - SSR seed (`window.__PRAYER_CITY__.name`)
  - H1 heading
  - `<title>` element
  - (and by extension: schema.org, breadcrumbs, FAQs, cards)
- ✓ No fillchain — all 29 BATCH-C entries have `names = {ar, en, ur}` only (zero leaks to `bn/fr/de/tr/id/es/ms` per the `fillLangMap` guard)
- ✓ No code changes to `server.js`, `js/app.js`, `index.html`, `fillLangMap` — only `db/places/curated-places.json` mutated

---

## 11. 🏆 Confirmation: PK Urdu coverage = 148/148

```
PK total:                148 entries
PK with names.ar:        148 (100%)
PK with names.ur:        148 (100%)
PK Urdu coverage:        100%
Coverage gap:            0
```

Pakistan has reached **full bilingual coverage** (Arabic 148/148 + Urdu 148/148) across all 6 UR-PK enrichment waves:

| Wave | Date | +Urdu | Cum. coverage |
|------|------|------:|---------------|
| UR-PK-1 (3 alias enrichment for seed-10) | 2026-05-18 | (0 new names) | 10/10 |
| UR-PK-2 (43 ASIA-1D-PK clean) | 2026-05-19 | +43 | 53/53 |
| UR-PK-3 (17 ASIA-1D-PK-MCF) | 2026-05-19 | +17 | 70/70 🏆 |
| UR-PK-4 (20 BATCH-A MAJORS-1A) | 2026-05-19 | +20 | 90/90 🏆 |
| UR-PK-5 (29 BATCH-B MAJORS-1B) | 2026-05-19 | +29 | 119/119 🏆 |
| **UR-PK-6 (29 BATCH-C MAJORS-1C)** | **2026-05-19** | **+29** | **148/148** 🏆🏆🏆 |

---

## Tests

### New UR-PK-6 smoke (`scripts/_test_place_names_ur_pk_6.mjs`)
- **69/69 PASS** ✓
- Parts A-K: disk state + name/alias correctness + clean-script validation + cross-route SSR + regression + milestone + duplicate guard

### Updated MAJORS-1C smoke (`scripts/_test_asia_1d_pk_missing_ar_1c.mjs`)
- **53/53 PASS** (after small update: dropped `ur` from leak-check list, accept `{ar,en}` or `{ar,en,ur}` keys)

### Carry-forward regression suites (all PASS)
- `_test_place_names_ur_pk_1.mjs`: 38/38 ✓
- `_test_place_names_ur_pk_2.mjs`: 65/65 ✓
- `_test_place_names_ur_pk_3.mjs`: 74/74 ✓
- `_test_place_names_ur_pk_4.mjs`: 51/51 ✓
- `_test_place_names_ur_pk_5.mjs`: 62/62 ✓
- `_test_asia_1d_pk_mcf.mjs`: 61/61 ✓
- `_test_asia_1d_pk_missing_ar_1a.mjs`: 53/53 ✓
- `_test_asia_1d_pk_missing_ar_1b.mjs`: 42/42 ✓
- `_test_asia_1d_pk_search.mjs`: 29/29 ✓
- `_test_place_names_ur_af_1.mjs`: 41/41 ✓
- `_test_place_names_ur_ir_1.mjs`: 66/66 ✓
- `_test_place_names_ur_client_seed_hydration_fix_1.mjs`: 12/12 ✓
- `_test_place_names_ur_template_consistency_1.mjs`: 16/16 ✓
- `_test_place_names_template_consistency_all_langs_fix_1.mjs`: 18/18 ✓
- `_test_place_names_cross_page_navigation_consistency_fix_1.mjs`: 28/28 ✓
- `_test_place_names_homepage_default_city_l10n_fix_1.mjs`: 33/33 ✓
- `_test_place_names_sitewide_template_consistency_fix_1.mjs`: 26/26 ✓
- `_test_fill_lang_map.mjs`: 11/11 ✓
- `_test_place_by_slug.mjs`: 44/44 ✓
- `_test_city_page_l10n.mjs`: 152/152 ✓
- `_test_home_search_migration.mjs`: 33/33 ✓
- `_test_home_title_stability.mjs`: 10/10 ✓
- `_test_search_ar.mjs`: 22/22 ✓
- `_test_asia_1c_search.mjs`: 31/31 ✓
- `_test_asia_1c_mcf_search.mjs`: 42/42 ✓
- `_test_asia_1e_mcf_search.mjs`: 43/43 ✓
- `_test_asia_1g_af_search.mjs`: PASS ✓
- `_test_asia_1g_af_mcf_search.mjs`: PASS ✓
- `_test_asia_1g_ir_search.mjs`: PASS ✓
- `_test_asia_1h_search.mjs`: 38/38 ✓
- `_test_asia_1h_mcf_search.mjs`: 39/39 ✓
- `_test_asia_1i_search.mjs`: 28/28 ✓
- `_test_asia_1i_mcf_search.mjs`: 33/33 ✓
- 1 known-deferred failure: `_test_asia_1e_search.mjs` (37/38) — pre-existing `Galle` EN ranking issue tracked as SEARCH-RANKING-IMPROVEMENT-1

**Total tests** (UR-PK-6 specific + carry-forward): **1,500+ passing, 0 new regressions**.

---

## Files touched

| File | Change |
|------|--------|
| `db/places/curated-places.json` | +29 `names.ur` + 13 `aliases.ur` (148 total PK entries; 0 names.ar/en mutations; 0 PRIOR-119 mutations) |
| `db/places/curated-places.json.prePlaceNamesUrPk6.bak` | NEW backup (pre-apply snapshot) |
| `scripts/geodata/_place_names_ur_pk_6_apply.mjs` | NEW Fast Track apply with PRIOR-119 cross-collision guard + post-mutation invariant assertions |
| `scripts/_test_place_names_ur_pk_6.mjs` | NEW 69-test smoke (11 sections: disk + AR/EN preservation + cross-route SSR + regression + 148/148 milestone + duplicate guard + clean-script + alias clean-script) |
| `scripts/_test_asia_1d_pk_missing_ar_1c.mjs` | UPDATED — Part C now accepts `{ar,en,ur}` keys post-UR-PK-6 (dropped `ur` from leak-check list) |
| `reports/place-names-ur-pk-6-apply-report.md` | NEW auto-generated apply audit trail |
| `reports/place-names-ur-pk-6-apply-closure.md` | NEW this closure document |

### Code unchanged

- ❌ `server.js` — unchanged
- ❌ `js/app.js` — unchanged
- ❌ `index.html` — unchanged
- ❌ `fillLangMap` — unchanged
- ❌ Other `db/places/*.json` files — unchanged
- ❌ All other countries' Urdu names — unchanged

---

## Status: 🟢 CLOSED — user-approved 2026-05-19 — 🏆 Pakistan FULLY complete at 148/148 Arabic + 148/148 Urdu

**Commit**: `87d43d6` (on main)
**Rollback**: `git revert 87d43d6`. Backup at
`db/places/curated-places.json.prePlaceNamesUrPk6.bak`.

### User-approval acceptance criteria (all met)

| # | Criterion | Status |
|---|---|---|
| 1 | PLACE-NAMES-UR-PK-6 closed | ✓ |
| 2 | Pakistan curated coverage now Arabic-complete AND Urdu-complete: 148/148 | ✓ |
| 3 | No runtime translation | ✓ (static Urdu Wikipedia source; no Google Translate / OpenAI / Anthropic / browser translate references in SSR HTML) |
| 4 | No code changes (server.js/js/app.js/fillLangMap/index.html) | ✓ |
| 5 | `names.ar` and `names.en` unchanged | ✓ (byte-for-byte post-mutation verified vs `.prePlaceNamesUrPk6.bak`) |
| 6 | Prior 119 PK entries untouched | ✓ (PRIOR_119_SLUGS post-mutation assertion + pre-flight cross-collision guard) |
| 7 | PK Urdu coverage restored to 148/148 | ✓ |
| 8 | No fake fillchain | ✓ (0 leaks across 7 langs × 29 = 203 checks) |
| 9 | Relevant smoke/regression suites passed | ✓ (69/69 UR-PK-6 + 53/53 MAJORS-1C + 30+ carry-forward) |
| 10 | Fast Track policy validated (5th consecutive wave: MAJORS-1A → UR-PK-4 → MAJORS-1B → UR-PK-5 → MAJORS-1C → UR-PK-6) | ✓ |

### Known deferred (unrelated to UR-PK-6)

- **SEARCH-RANKING-IMPROVEMENT-1** — pre-existing `Galle` EN ranking issue (`halle-saale` ranked higher) — unrelated to this phase, accepted as known-deferred.

### Held queue (per user direction — DO NOT auto-start)

- ASIA-1D-BD (Bangladesh Bengali/Urdu wave)
- ASIA-1D-IN (India Urdu wave)
- ASIA-1F (China solo wave)
- AMERICAS-1B-MCF (151 entries incl. 120 majors)
- SEARCH-RANKING-IMPROVEMENT-1
- Alias enrichment phase
- DELETE-V1-AND-GEOCODE-PROXY-1

Hold queue until user explicitly requests the next wave.
