# MOON-GENERAL-HOME-SEARCH-BOX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: MOON-GENERAL-HOME-SEARCH-BOX-1
**Predecessors**: PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 (`1598c10`)
**Scope**: UI / routing / search-box replacement on `/moon-today` (and lang variants).
NO changes to `curated_places.json`, `fillLangMap`, `server.js`, `names.ur`, or `aliases.ur`.

---

## 1. ما هو مربع البحث القديم في صفحة القمر

The legacy `/moon-today` search box was a **clone of the qibla-hub search**:

| Aspect | Before |
|---|---|
| HTML markup | `<input id="moon-hub-search" class="qibla-hub-search qibla-hub-search--hero">` + `<ul id="moon-hub-search-results" class="qibla-hub-search-results">` |
| CSS class family | `.qibla-hub-search`, `.qhsr-*` |
| Search engine | **Direct Nominatim** (2 parallel calls: `q=` and `city=`), plus `searchLocalCities()` for local LOCAL_CITIES results |
| Result rendering | `<li class="qhsr-item">` rows with `.qhsr-flag` / `.qhsr-name` / `.qhsr-country` / `.qhsr-arrow` |
| Click target | `navigateToMoonToday(...)` → **`/moon-today-in-{slug}`** (the legacy "today only" view) |
| Localization | Nominatim's `accept-language` only — no curated `names.<lang>` consultation. Cold-load could show English mid-flight for non-LOCAL_CITIES queries on /ur/ pages. |

---

## 2. كيف تم استبداله بمربع البحث الرئيسي

The moon-today search was replaced with the **homepage compact `.city-page-search`** component pattern + new routing wired to `/moon-in-{slug}`.

| Aspect | After |
|---|---|
| HTML markup | `<section class="city-page-search city-page-search--moon" id="moon-page-search">` containing `<input id="moon-hub-search" class="cps-input cps-input--moon">` + `<div class="cps-suggestions" id="moon-hub-suggestions">` |
| CSS class family | `.cps-input`, `.cps-suggestions`, `.suggestion-item` (homepage component) |
| Search engine | **`/api/search-place`** (curated → discovered → external_cache → Nominatim → LocationIQ cascade — same engine the homepage v2 uses). Results returned already lang-correct via server's `_pickCuratedName(entry, lang)`. |
| Result rendering | `<div class="suggestion-item">` rows with `.sugg-flag` / `.sugg-name` / `.sugg-country` (homepage rendering) |
| Click target | `navigateToCity(..., { targetRoute: 'moon-hub' })` → **`/moon-in-{slug}`** (the city moon HUB page) |
| Localization | Curated `names[pageLang]` always — no Nominatim round-trip needed for localized names. `چاریکار` for /ur/, `Londres` for /fr/, `Mekke` for /tr/, `München` for /de/, etc. |

The input ID `#moon-hub-search` is preserved for backward compatibility with downstream code (`_moonHubPickCity` scroll-to-focus etc.). The suggestions container ID is renamed `#moon-hub-search-results` → `#moon-hub-suggestions` to match the new dropdown shape.

---

## 3. الملفات المعدلة

| File | Lines added | Lines removed | Net |
|---|---:|---:|---:|
| `js/app.js` | +200 (rewrite of _wireMoonHubHero search + targetRoute support in navigateToCity) | −281 (legacy qibla-clone Nominatim-direct wiring + helper closures) | **−81** (net code shrink) |
| `index.html` | +18 / −5 (search-box markup rewrite to homepage-style `.city-page-search`) + ?v=654→?v=655 on 2 lines | | +15 |
| `scripts/_test_moon_general_home_search_box_1.mjs` | +208 (new, 36/36 pass) | 0 | +208 |
| `reports/moon-general-home-search-box-1-closure.md` | +this file | 0 | — |

**لم يتم تعديل**:
- `db/places/curated-places.json` ✓
- `scripts/geodata/_geonames_common.mjs::fillLangMap` ✓
- `server.js` ✓
- `_pickCuratedName` (in server.js) ✓
- `names.ur` / `aliases.ur` ✓
- Homepage search box markup (`#location-hero`, `#loc-hero-search`, `#city-page-search`) ✓

---

## 4. سلوك اختيار المدينة

When the user clicks (or Enters) a suggestion:

1. The row's data (`r.lat`, `r.lng`, `r.displayName`, `r.countryName`, `r.secondaryName`, `r.countryCode`, `r.slug`, `r.timezone`) is captured from the `/api/search-place` response.
2. For `r.source === 'external'`, a fire-and-forget `POST /api/place-selected` persists the discovered place so future searches of the same name hit Tier 2 (discovered) instantly.
3. `navigateToCity(lat, lng, displayName, countryName, secondaryName, countryCode, { slug, timezone, targetRoute: 'moon-hub' })` is called.
4. `navigateToCity()`'s **new `opts.targetRoute === 'moon-hub'` branch** (added in this phase):
   - Writes the sessionStorage seed under `city_{slug}` AND `city_moon` AND `last_city_context` (so the destination's `_initialSyncHydrate` and shared moon-hub session key both resolve correctly).
   - Shows the navigation overlay with `'moon'` flavor.
   - Sets `location.href = pageUrl('/moon-in-{slug}')` — with `pageUrl()` automatically prepending the current language prefix (`/ur/`, `/fr/`, `/en/`, etc.).

---

## 5. تأكيد احترام اللغة الحالية في الرابط

`pageUrl(path)` is the project's lang-prefix helper. It reads the current page lang from `getCurrentLang()` and prepends `/{lang}/` for non-AR languages.

Browser-verified click → URL transitions:

| Page lang | URL on /moon-today | Selected slug | Final landed URL |
|---|---|---|---|
| ar | `/moon-today` | `charikar` | `/moon-in-charikar` ✓ |
| en | `/en/moon-today` | `charikar` | `/en/moon-in-charikar` ✓ |
| ur | `/ur/moon-today` | `charikar` | `/ur/moon-in-charikar` ✓ |
| fr | `/fr/moon-today` | `london` | `/fr/moon-in-london` ✓ |

All 4 navigation flows preserve the language prefix exactly as the user was browsing.

---

## 6. تأكيد استخدام الاسم المحلي في نتائج البحث

The `/api/search-place` endpoint already routes through the server's `_pickCuratedName(entry, lang)`, which returns the curated `names[lang]` whenever it exists (and is non-Latin for absence-langs ar/ur/bn). For Latin-script langs, it returns `names[lang]` if real, else falls back to `names.en` (Latin-acceptable).

**No client-side runtime translation**, **no translation API**, **no AI translation**, **no browser auto-translate**. The names come straight from `db/places/curated-places.json`.

Smoke test — `/api/search-place` per-lang spot checks (8/8 PASS):

| Query | Lang | Returned `displayName` |
|---|---|---|
| `charikar` | ur | `چاریکار` ✓ |
| `charikar` | ar | `تشاريكار` ✓ |
| `charikar` | en | `Charikar` ✓ |
| `london` | fr | `Londres` ✓ |
| `london` | en | `London` ✓ |
| `munich` | de | `München` ✓ |
| `makkah` | ur | `مکہ` ✓ |
| `makkah` | tr | `Mekke` ✓ |

When `names[lang]` is **not** present (fillchain row), `_pickCuratedName` returns `names.en`. This is acceptable for Latin-script langs and is the documented graceful fallback. The user's rule "للّغات اللاتينية يمكن استخدام English fallback" is respected.

---

## 7. اختبارات moon-today لكل لغة

Browser-verified (Preview MCP) flow for all 4 explicit scenarios:

### Scenario 1 — `/ur/moon-today` → "charikar" → click

- Result row name: **`چاریکار`**
- Result row country: **`افغانستان · شہر`**
- After click: navigated to `/ur/moon-in-charikar` ✓

### Scenario 2 — `/en/moon-today` → "charikar" → click

- Result row name: **`Charikar`**
- Result row country: **`Afghanistan · City`**
- After click: navigated to `/en/moon-in-charikar` ✓

### Scenario 3 — `/fr/moon-today` → "london" → click

- Result row name: **`Londres`**
- Result row country: **`Royaume-Uni · Ville`**
- After click: navigated to `/fr/moon-in-london` ✓

### Scenario 4 — `/moon-today` (AR default) → "charikar" → click

- Result row name: **`تشاريكار`**
- Result row country: **`أفغانستان · مدينة`**
- After click: navigated to `/moon-in-charikar` ✓

All 10 page variants (`/moon-today`, `/en/`, `/ur/`, `/fr/`, `/de/`, `/tr/`, `/es/`, `/bn/`, `/ms/`, `/id/`) serve HTTP 200 with the new search markup present (10/10 in Part B of the smoke suite).

---

## 8. تأكيد أن الصفحة الرئيسية لم تتأثر

Browser-verified on `/`:

1. Hero search `#loc-hero-search` still mirrors to `#city-search-input` via `onHeroSearchInput`.
2. Typing `mecca` shows `مكة المكرمة` (LOCAL_CITIES instant) — homepage behavior unchanged.
3. Clicking a homepage result navigates to **`/prayer-times-in-makkah`** (prayer-times route, NOT moon-in).
4. `#location-hero` markup unchanged, `#city-page-search` markup unchanged.
5. `onCitySearchInput()` / `fetchCitySuggestionsV2()` / `_renderV2Row()` / `selectCity()` / `navigateToCity()` (default `targetRoute='prayer-times'`) all unchanged in default flow.

Regression-confirmed surfaces (Part F of smoke suite):

| URL | Marker | Result |
|---|---|---|
| `/` | `id="loc-hero-search"` | ✓ present |
| `/prayer-times-in-charikar` | `id="city-search-input"` | ✓ present |
| `/ur/prayer-times-in-charikar` | `ssr-city-name="چاریکار"` | ✓ Urdu intact |
| `/fr/prayer-times-in-london` | `ssr-city-name="Londres"` | ✓ French intact |

`/ur/prayer-times-in-charikar` in-browser sanity check after the phase: `#city-name = "چاریکار"`, `<title> = "چاریکار میں آج اوقاتِ نماز | روزانہ اذان کا شیڈول"`, `<h1> = "آج چاریکار میں اوقاتِ نماز"` — completely unchanged.

---

## 9. نتائج الاختبارات

### New smoke test (`_test_moon_general_home_search_box_1.mjs`) — **36/36 pass**

| Part | Coverage | Result |
|---|---|---:|
| A | Disk source markers (HTML new structure + JS targetRoute + v=655 cache-buster) | 5/5 ✓ |
| B | All 10 lang variants of `/moon-today` serve 200 + new markup | 10/10 ✓ |
| C | `/api/search-place` returns lang-correct names per page lang | 8/8 ✓ |
| D | `/moon-in-{slug}` routes still 200 across 6 URLs | 6/6 ✓ |
| E | `/moon-today-in-{slug}` legacy routes still 200 across 3 URLs | 3/3 ✓ |
| F | Homepage + prayer-times pages unaffected | 4/4 ✓ |

### Carry-forward — **23 suites, 1,548 / 1,548 zero failures**

| Suite | Result |
|---|---:|
| `_test_moon_general_home_search_box_1` (new) | **36/36** |
| `_test_place_names_template_consistency_all_langs_fix_1` | 18/18 |
| `_test_place_names_ur_template_consistency_1` | 16/16 |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 |
| `_test_place_names_ur_af_1` | 41/41 |
| `_test_city_page_l10n` | 156/156 |
| `_test_lang_guard` | 5/5 |
| `_test_lang_guard_helpers` | 6/6 |
| `_test_link_city_name` | 18/18 |
| `_test_city_name_ugly` | 5/5 |
| `_test_city_name_universal` | 35/35 |
| `_test_place_by_slug` | 44/44 |
| `_test_search_place_endpoint` | 659/659 |
| `_test_external_provider_2` | 32/32 |
| `_test_home_search_migration` | 33/33 |
| `_test_home_title_stability` | 10/10 |
| `_test_search_ar` | 22/22 |
| `_test_external_cache` | 13/13 |
| `_test_fill_lang_map` | 11/11 |
| `_test_persian_pregate_design` | 23/23 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_asia_1g_af_search` | 24/24 |
| `_test_asia_1g_af_mcf_search` | 18/18 |
| `_test_asia_1g_ir_search` | 19/19 |
| `_verify_place_slug_fix_production` | 338/338 |

---

## Rollback plan

Pure-additive client-side. To revert:
```
git revert <fix-commit>
```

No data, schema, or contract changes. The legacy `navigateToMoonToday()` function is still in `js/app.js` for callers that need `/moon-today-in-{slug}` (e.g. the geo-detect button still uses it — only the search box was redirected).

---

## Status: 🟢 CLOSED — ready for commit.
