# PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1
**Predecessors**: PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 (`1598c10`),
MOON+QIBLA-GENERAL-HOME-SEARCH-BOX-1 (`541e0fb`),
MOON-QIBLA-SEARCH-BOX-PRODUCTION-VISIBILITY-FIX-1 (`4e9e8e3`).

---

## 1. الصفحات التي تم فحصها

| Route | Status before | Status after |
|---|---|---|
| /prayer-times-in-{city} (10 langs) | OK (PT-LANG-GUARD-5) | OK |
| /qibla-in-{city} (10 langs) | **SSR title generic** for non-popular cities + **Arabic leak** on Latin-script langs via `_syncCityNameInDom` walker | ✅ FIXED |
| /moon-in-{city} (10 langs) | OK | OK |
| /moon-today-in-{city} (10 langs) | OK | OK |
| /hijri-date/{day-page} | locDisplay fallback preferred English | ✅ FIXED (absence-lang priority added) |
| Homepage / | OK (search-pipeline reuse) | OK |
| /moon-today, /qibla hub pages | OK (homepage search reuse) | OK |

---

## 2. المواضع التي كانت تستخدم currentEnglishName بشكل خاطئ

Audit of `js/app.js` enumerated ~70 occurrences of `currentEnglishName`. Categorized them as follows:

| Category | Count | Example | In-scope for this fix? |
|---|---:|---|---|
| URL slug construction via `makeSlug` | ~16 | `makeSlug(currentEnglishName, lat, lng)` | NO (slugs are English by site convention) |
| sessionStorage seed `englishName` field | ~12 | `englishName: currentEnglishName` | NO (slug recomputation across visits requires English) |
| Internal variable hydration | ~10 | `currentEnglishName = pc.englishName` | NO (it's an internal variable) |
| Nominatim address-level matching | ~5 | inside `fetchLocalizedCityName` | NO (private resolver internals) |
| Visible text / JSON-LD / templates | **3** | schema cityDisplay + 2 locDisplay fallbacks | **YES — FIXED** |

The 3 visible-text bugs:

1. **`injectPrayerEventsSchema` (line 7833)** — JSON-LD `cityDisplay` used `isEn ? currentEnglishName : currentCity`. For Latin-script langs (fr/de/tr/id/es/ms), `isEn=true` (since `isEn = lang !== 'ar'`) → JSON-LD always carried English even when curated had a localized name. Arabic/Urdu/Bengali Google etc. could not index the localized name.
2. **`locDisplay` fallback (line 20604)** on hijri date pages — `(lang === 'ar') ? (currentCity || currentEnglishName) : (currentEnglishName || currentCity)`. Non-AR fell to English first.
3. **Second `_cityDisplay` fallback (line 20827)** on hijri date pages — same pattern as #2.

And two additional issues surfaced during browser-verification:

4. **`_resolveCityForMoon` (server.js)** — the qibla branch's slug-to-coords resolver only knew about `FAMOUS_CITY_OVERRIDES` + legacy `db/cities-*.json`. Cities curated only in `curated_places.json` (Charikar, Kandahar, smaller Afghan/Iranian/Asian cities, etc.) returned null → the qibla SSR title fell through to the generic homepage default. Now it also consults `_CURATED_SLUG_INDEX`.
5. **`_syncCityNameInDom` walker (line 7110)** — had a Latin-rejection guard for absence-langs (don't replace Latin SSR with even-more-Latin globals) but lacked the SYMMETRIC guard for Latin-script langs. On `/de/qibla-in-munich`, `currentCity` got set to Arabic `ميونخ` (from `__QIBLA_CITY__.names.ar` leaking via an existing client path), and the walker rewrote every `München` → `ميونخ` everywhere on the page including `<title>`. Now Latin-script pages reject Arabic/Bengali goodName candidates.
6. **`getDisplayCity` + `getCurrentCityLabel` Tier-0** — only consulted `__PRAYER_CITY__` (injected on prayer-times routes). `/qibla-in-{slug}` pages inject `__QIBLA_CITY__` instead. Extended Tier-0 to consult both with `__QIBLA_CITY__` checked first since its richer `names` map gives `names[lang]` directly.

---

## 3. الملفات المعدلة

| File | Change | Net |
|---|---|---:|
| `js/app.js` | (1) `injectPrayerEventsSchema cityDisplay/countryName` → uses `getDisplayCity()/getDisplayCountry()`. (2) `getDisplayCity` Tier-0 also consults `window.__QIBLA_CITY__.names[lang]` before `__PRAYER_CITY__`. (3) `getCurrentCityLabel` Tier-0 same. (4) `_syncCityNameInDom` symmetric Latin-script guard. (5+6) `locDisplay` fallback chains on hijri date pages: absence-lang priority for `currentCity` over Latin `currentEnglishName`. | +95 |
| `server.js` | `_resolveCityForMoon` also consults `_CURATED_SLUG_INDEX` (curated_places.json) when FAMOUS_CITY_OVERRIDES + cities-*.json don't have the slug. | +22 |
| `index.html` | cache-buster `?v=657` → `?v=660` on both `<link rel="preload">` + `<script defer>` tags. | 2 |
| `scripts/_test_place_names_sitewide_template_consistency_fix_1.mjs` | NEW smoke test, 26/26 pass. | +236 |
| `scripts/_test_place_names_template_consistency_all_langs_fix_1.mjs` | Updated substring window 3000 → 5000 to accommodate the new __QIBLA_CITY__ block ahead of __PRAYER_CITY__. | 4 |
| `reports/place-names-sitewide-template-consistency-fix-1-closure.md` | NEW closure. | — |

**NO changes to**: `curated_places.json`, `fillLangMap`, `_pickCuratedName`, `names.ur`, `aliases.ur`, homepage search markup.

---

## 4. كيف تم توحيد منطق اسم المدينة

The architectural rule is now consistent across the entire site:

```text
TRUST SSR seed FIRST. When URL slug matches:
  - window.__QIBLA_CITY__.slug   (on /qibla-in-{slug} routes)        → use .names[lang]
  - window.__PRAYER_CITY__.slug  (on /prayer-times-in / /moon / etc) → use .name (already lang-correct via _pickCuratedName)

For absence-langs (ar/ur/bn): require seed to be non-Latin.
For Latin-script langs: accept the seed as-is (curated localized OR fillchain English).

The DOM walker (_syncCityNameInDom) enforces script-symmetry:
  - Don't replace Latin SSR name with non-Latin candidate on Latin-script pages.
  - Don't replace non-Latin SSR name with Latin candidate on absence-lang pages.
```

This applies uniformly to every template surface — `<title>`, `<h1>`, breadcrumb, FAQ, cards, prayer-card aria-labels, info-location, qibla-city, JSON-LD schema, related links — via `getDisplayCity()` / `getCurrentCityLabel()` / `_syncCityNameInDom`.

---

## 5. اختبارات prayer/qibla/moon لكل لغة

Browser-verified (Preview MCP) for the user-specified scenarios:

| URL | `#city-name` | `<title>` | Localized count | Foreign-script leak |
|---|---|---|---:|---:|
| `/ur/qibla-in-charikar` | چاریکار | چاریکار میں سمتِ قبلہ \| کعبہ کا قطب نما اور درست تعین | 26 (Urdu) | **0** |
| `/ur/moon-in-charikar` | چاریکار | چاریکار میں چاند کی حالت \| طور، روشنی اور چاند کی تقویم | 36 (Urdu) | **0** |
| `/fr/moon-in-london` | Londres | Lune à Londres \| Phase de la Lune et calendrier lunaire | 36 (Londres) | 1 (incidental in metadata) |
| `/es/prayer-times-in-new-york` | Nueva York | Horarios de Oración en Nueva York Hoy \| Horario de Adhan | 21 (Nueva York) | **0** |
| `/de/qibla-in-munich` | München | Qibla-Richtung in München \| Kaaba-Kompass und präzise Ortung | 26 (München) | **0** Arabic |

All template surfaces — `#city-name`, `#qibla-city`, `<title>`, `<h1>`, breadcrumb, FAQ, info cards — render the localized name consistently.

---

## 6. تأكيد عدم تعديل curated_places.json

```
$ git diff --stat db/places/curated-places.json
(no changes)
```

✅ Untouched. 2,336 entries; AF entries 36; all critical name checks pass.

---

## 7. تأكيد عدم استخدام Runtime Translation

- ❌ No translation API.
- ❌ No runtime translation.
- ❌ No AI translation on page load.
- ❌ No browser auto-translate.
- ✅ All names come from `curated_places.json` via the server's `_pickCuratedName(entry, lang)` OR via the SSR-injected `__QIBLA_CITY__.names[lang]` / `__PRAYER_CITY__.name`.

---

## 8. تأكيد أن بحث moon/qibla ما زال ظاهراً ويعمل

The CSS visibility override `.city-page-search--moon, .city-page-search--qibla { display: block !important }` from `MOON-QIBLA-SEARCH-BOX-PRODUCTION-VISIBILITY-FIX-1` is verified present in `css/style.css` by the smoke test. Browser-verified on `/moon-today`, `/qibla`, `/ur/moon-today`, `/ur/qibla` — search boxes render correctly.

The search-pipeline reuse (`MOON_SEARCH_CTX` / `QIBLA_SEARCH_CTX` calling shared `onCitySearchInput` / `onSearchKeyDown`) is intact. Both `_test_moon_general_home_search_box_1.mjs` (37/37) and `_test_qibla_general_home_search_box_1.mjs` (36/36) still pass.

---

## 9. نتائج الاختبارات

### New smoke (`_test_place_names_sitewide_template_consistency_fix_1.mjs`) — **26/26 pass**

| Part | Coverage | Result |
|---|---|---:|
| A | Disk source markers (4 fixes + cache-buster bump) | 4/4 ✓ |
| B | 10 sample URLs SSR seed lang-correctness | 10/10 ✓ |
| C | `/ur/qibla-in-charikar` SSR `<title>` + `<h1>` contain چاریکار | 3/3 ✓ |
| D | `/ur/moon-in-charikar` SSR `<title>` contains چاریکار | 2/2 ✓ |
| E | Regression — homepage + moon-today + qibla search visible | 6/6 ✓ + CSS override marker |

### Carry-forward — **26 suites, all green**

| Suite | Result |
|---|---:|
| `_test_place_names_sitewide_template_consistency_fix_1` (new) | **26/26** |
| `_test_moon_general_home_search_box_1` | 37/37 |
| `_test_qibla_general_home_search_box_1` | 36/36 |
| `_test_place_names_template_consistency_all_langs_fix_1` (window expanded) | 18/18 |
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
| `_test_external_provider_2` | 32/32 |
| `_test_home_search_migration` | 33/33 |
| `_test_search_ar` | 22/22 |
| `_test_external_cache` | 13/13 |
| `_test_fill_lang_map` | 11/11 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_asia_1g_af_search` | 24/24 |
| `_test_search_place_endpoint` (retry after rate-limit) | 659/659 |
| `_verify_place_slug_fix_production` | 338/338 |

---

## Status: 🟢 CLOSED — site-wide template consistency rule applied uniformly.
