# QIBLA-GENERAL-HOME-SEARCH-BOX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: QIBLA-GENERAL-HOME-SEARCH-BOX-1
**Predecessor**: MOON-GENERAL-HOME-SEARCH-BOX-1 (revise) — same shared-pipeline pattern
**Type**: UI / routing / search-pipeline reuse + template consistency on `/qibla`

---

## 1. ما هو مربع البحث القديم في صفحة القبلة

The legacy `/qibla` search box was a clone of the moon-today qibla-clone (both descended from the same template):

| Aspect | Before |
|---|---|
| HTML markup | `<input id="qibla-hub-search" class="qibla-hub-search qibla-hub-search--hero">` + `<ul id="qibla-hub-search-results" class="qibla-hub-search-results">` |
| CSS class family | `.qibla-hub-search`, `.qhsr-*` |
| Search engine | **Direct Nominatim** + `searchLocalCities()` for LOCAL_CITIES |
| Result rendering | `<li class="qhsr-item">` rows |
| Click target | `_buildQiblaCityUrl(...)` → various server-fuzzy paths, ultimately `/qibla-in-{slug}` |
| Localization | Nominatim `accept-language` only — no curated `names.<lang>` consultation |
| Code size | ~280 lines duplicated from moon/homepage wirings |

---

## 2. كيف تم استبداله بمربع البحث الرئيسي

The `/qibla` search now uses the **shared homepage search pipeline** introduced in the MOON revise — `onCitySearchInput` + `onSearchKeyDown` + `fetchCitySuggestionsV2` + `_renderV2Row` parameterized by `ctx`.

```js
const QIBLA_SEARCH_CTX = {
    inputId:       'qibla-hub-search',
    suggestionsId: 'qibla-hub-suggestions',
    targetRoute:   'qibla-hub',
    attributionId: null
};
searchEl.addEventListener('input',   () => onCitySearchInput(searchEl.value, QIBLA_SEARCH_CTX));
searchEl.addEventListener('keydown', (e) => onSearchKeyDown(e, QIBLA_SEARCH_CTX));
```

| Aspect | After |
|---|---|
| HTML markup | `<section class="city-page-search city-page-search--qibla" id="qibla-page-search">` containing `<input class="cps-input cps-input--qibla">` + `<div class="cps-suggestions" id="qibla-hub-suggestions">` |
| CSS class family | `.cps-input`, `.cps-suggestions`, `.suggestion-item` (homepage) |
| Search engine | **Same as homepage** — local-first LOCAL_CITIES, then 120ms-debounced `/api/search-place` cascade |
| Result rendering | `<div class="suggestion-item">` with `.sugg-flag`/`.sugg-name`/`.sugg-country` |
| Click target | `navigateToCity(..., { targetRoute: 'qibla-hub' })` → `pageUrl('/qibla-in-{slug}')` |
| Localization | Curated `names[pageLang]` via server's `_pickCuratedName` |
| Code size | ~280 line custom wiring → 12-line wiring delegating to shared functions |

---

## 3. الملفات المعدلة

| File | Change | Net |
|---|---|---:|
| `js/app.js` | Removed the legacy `_qhs*` wiring (~280 lines) and replaced with 12-line shared-pipeline delegate. Extended `navigateToCity()` `_target` to `'qibla-hub'` → `/qibla-in-{slug}` (sessionStorage seeds `city_qibla` + `last_city_context`). Updated `_setupCollapse` element selector to include `.cps-suggestions` so the new dropdown doesn't collapse the moon hero. | **−240** |
| `index.html` | `#qibla-hub-search` markup replaced: `.qibla-hub-search` styles + `<ul id="qibla-hub-search-results">` → `<section class="city-page-search city-page-search--qibla" id="qibla-page-search">` wrapping `<input class="cps-input cps-input--qibla">` + `<div class="cps-suggestions" id="qibla-hub-suggestions">`. Cache-buster `?v=656` → `?v=657`. | +18 / −5 |
| `scripts/_test_qibla_general_home_search_box_1.mjs` | New 36/36 smoke (Parts A-F). | +185 |
| `reports/qibla-general-home-search-box-1-closure.md` | New closure. | — |

**لم يتم تعديل**: `db/places/curated-places.json`, `fillLangMap`, `server.js`, `_pickCuratedName`, `names.ur`, `aliases.ur`, homepage search markup.

---

## 4. سلوك اختيار المدينة

When the user clicks a suggestion on `/qibla`:
1. Shared `_renderV2Row` click handler runs.
2. Writes `displayName` into `#qibla-hub-search` (via `ctx.inputId`).
3. Persists `/api/place-selected` for `external` rows (Tier 2 caching).
4. Calls `selectCity(...)` with `{ slug, timezone, targetRoute: 'qibla-hub' }`.
5. `navigateToCity()`'s `_target === 'qibla-hub'` branch:
   - Seeds `city_{slug}` + `city_qibla` + `last_city_context`.
   - Shows the 'qibla' navigation overlay.
   - Navigates to `pageUrl('/qibla-in-{slug}')` — language prefix preserved.

---

## 5. تأكيد احترام اللغة الحالية في الرابط

Browser-verified navigations:

| URL on `/qibla` | Clicked | Final URL |
|---|---|---|
| `/ur/qibla` | Charikar | `/ur/qibla-in-charikar` ✓ |
| `/en/qibla` | Charikar | `/en/qibla-in-charikar` ✓ |
| `/fr/qibla` | London | `/fr/qibla-in-london` ✓ |
| `/tr/qibla` | Makkah | `/tr/qibla-in-makkah` ✓ |
| `/qibla` (AR) | Mecca | `/prayer-times-in-makkah`-style routing → `/qibla-in-makkah` (via local-first then v2 click) ✓ |

`pageUrl()` automatically prepends `/{lang}/` for non-AR languages.

---

## 6. تأكيد استخدام الاسم المحلي في نتائج البحث

Browser-verified result row names (full local-first + v2 cascade):

| URL | Search | Row name | Row country |
|---|---|---|---|
| `/ur/qibla` | charikar | **چاریکار** | افغانستان · شہر |
| `/en/qibla` | charikar | **Charikar** | Afghanistan · City |
| `/fr/qibla` | london | **Londres** | Royaume-Uni · Ville |
| `/tr/qibla` | makkah | **Mekke** | Suudi Arabistan · Şehir |
| `/qibla` (AR) | mecca | **مكة المكرمة** (LOCAL_CITIES instant) → v2 | المملكة العربية السعودية · مدينة |

Smoke `/api/search-place` per-lang asserts (6/6 PASS):
`charikar` ur → `چاریکار`, `charikar` en → `Charikar`, `makkah` tr → `Mekke`, `london` fr → `Londres`, `new-york` es → `Nueva York`, `makkah` ur → `مکہ`.

**No client-side translation, no API translation, no runtime translation.** All names come straight from `db/places/curated-places.json`.

---

## 7. تأكيد تطبيق قاعدة PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 على صفحة القبلة

The `PT-LANG-GUARD-5` Tier-0 in both `getDisplayCity()` and `getCurrentCityLabel()` matches on ANY URL slug equal to `window.__PRAYER_CITY__.slug` — that includes `/qibla-in-{slug}` pages (server still injects `__PRAYER_CITY__` for them).

Browser-verified on `/ur/qibla-in-charikar`:

| Surface | Value |
|---|---|
| `<title>` | `چاریکار میں سمتِ قبلہ \| کعبہ کا قطب نما اور درست تعین` |
| `#city-name` | `چاریکار` |
| `#qibla-city` | `چاریکار` |
| `<h1>` | `چاریکار سے سمتِ قبلہ` |

All template surfaces render Urdu correctly via the existing Tier-0 trust-SSR rule. No qibla-specific code change needed for this — the architectural rule established in `PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1` already covers `/qibla-in-{slug}`.

---

## 8. تأكيد local-first search

Verified by inspecting suggestions at **t = +100ms after typing** (before the 120ms v2 debounce fires):

`/qibla` typing "mecca": 2 LOCAL_CITIES rows present, first = `مكة المكرمة`. Then at t≈1500ms, v2 replaces with curated rows.

For cities NOT in LOCAL_CITIES (Charikar, Kandahar, Londres, München, Nueva York), the v2 cascade returns them via `/api/search-place` (curated → discovered → external_cache → Nominatim → LocationIQ).

Crucially: **`/api/search-place` checks curated FIRST**, so for Charikar/Kandahar/Makkah/London/New York/etc., the first server result is curated (no external API hit). The shared homepage pipeline preserves this ordering by construction.

---

## 9. اختبارات qibla لكل لغة

`/qibla` + 9 lang variants all served HTTP 200 with new `id="qibla-page-search"` + `id="qibla-hub-suggestions"` markup present (10/10 PASS in Part B of smoke).

5 explicit click-path scenarios browser-verified (all PASS):
1. `/ur/qibla` + Charikar → `چاریکار` → `/ur/qibla-in-charikar` → Urdu everywhere ✓
2. `/en/qibla` + Charikar → `Charikar` → `/en/qibla-in-charikar` ✓
3. `/fr/qibla` + London → `Londres` → `/fr/qibla-in-london` ✓
4. `/tr/qibla` + Makkah → `Mekke` → `/tr/qibla-in-makkah` ✓
5. `/qibla` + Mecca local-first → click → `/qibla-in-makkah` ✓

---

## 10. تأكيد أن الصفحة الرئيسية وصفحة القمر لم تتأثرا

Homepage regression (Preview MCP):
- `/` typing "mecca" → 2 LOCAL_CITIES rows, first = `مكة المكرمة` ✓
- Click → `/prayer-times-in-makkah` (NOT moon, NOT qibla) ✓
- `#loc-hero-search`, `#city-search-input`, `#city-page-search` markup unchanged ✓

Moon page regression:
- `/ur/moon-today` typing "charikar" still returns `چاریکار` → click → `/ur/moon-in-charikar` ✓
- `id="moon-page-search"`, `id="moon-hub-suggestions"` markup unchanged ✓
- MOON_SEARCH_CTX still present in app.js — moon smoke (37/37) still passes ✓

Prayer-times regression:
- `/ur/prayer-times-in-charikar` → `#city-name = چاریکار`, full template intact ✓
- `/fr/prayer-times-in-london` → SSR `Londres` intact ✓

---

## 11. نتائج الاختبارات

### New smoke (`_test_qibla_general_home_search_box_1.mjs`) — **36/36 pass**

| Part | Coverage | Result |
|---|---|---:|
| A | Disk source markers (HTML + JS QIBLA_SEARCH_CTX + targetRoute=qibla-hub + shared pipeline + cache-bust v=657) | 7/7 ✓ |
| B | All 10 lang variants of `/qibla` serve 200 + new markup | 10/10 ✓ |
| C | `/api/search-place` returns lang-correct names | 6/6 ✓ |
| D | `/qibla-in-{slug}` server routes still 200 across 6 URLs | 6/6 ✓ |
| E | Homepage + moon + prayer-times unaffected | 6/6 ✓ |
| F | CRITICAL: `/ur/qibla-in-charikar` SSR carries `چاریکار` | 1/1 ✓ |

### Carry-forward — **24 suites, 1,584 / 1,584 zero failures**

| Suite | Result |
|---|---:|
| `_test_qibla_general_home_search_box_1` (new) | **36/36** |
| `_test_moon_general_home_search_box_1` | **37/37** |
| `_test_place_names_template_consistency_all_langs_fix_1` | 18/18 |
| `_test_place_names_ur_template_consistency_1` | 16/16 |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 |
| `_test_place_names_ur_af_1` | 41/41 |
| `_test_city_page_l10n` | 156/156 |
| `_test_home_search_migration` | 33/33 |
| `_test_lang_guard` | 5/5 |
| `_test_lang_guard_helpers` | 6/6 |
| `_test_link_city_name` | 18/18 |
| `_test_city_name_ugly` | 5/5 |
| `_test_city_name_universal` | 35/35 |
| `_test_place_by_slug` | 44/44 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_search_ar` | 22/22 |
| `_test_search_place_endpoint` | 659/659 (after rate-limit retry) |
| `_verify_place_slug_fix_production` | 338/338 |

---

## Status: 🟢 CLOSED — `/qibla` now fully shares the homepage search pipeline with `targetRoute='qibla-hub'`.
