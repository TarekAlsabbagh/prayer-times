# MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH PRE-PUSH REPORT

**Date:** 2026-06-21 · **Branch:** main · **Status:** local only — **NOT committed, NOT pushed** · awaiting approval.

---

## 1. Goal + scope

Before launch, collapse the legacy flat `/moon…` URL surface into the nested `/moon/{country}/{city}[…]`
structure so there is **no archivable duplicate content**: every legacy flat moon route 301-redirects
(lang-preserved) to its nested equivalent; the sitemap carries the nested routes only; all SSR/canonical/
breadcrumb base links and all country-aware client links point at the nested structure.

**Constraints honored (verbatim):** لا تطوير محتوى `/moon` · لا تعديل تصميم صفحات القمر · **لا تغيير `js/moon.js`** ·
**لا تغيير Meeus 49** · لا إضافة صفحات أيام bulk إلى sitemap · لا فتح أي بنية جديدة · نُفِّذ محليًا فقط بلا commit/push.

---

## 2. Redirects (301, lang-preserved) — `server.js`

Generalized the legacy-moon redirect block inside `_isIndexHtmlRoute`. City→country resolved via
`_resolveCcForSlug(slug)` + `makeCountrySlugSrv(cc)`:

| Legacy | → 301 nested |
|---|---|
| `/moon-today` (+/, +10 langs) | `/moon` |
| `/moon-in-{city}` | `/moon/{country}/{city}` |
| `/moon-today-in-{city}` | `/moon/{country}/{city}/today` |
| `/moon-in-{city}/{YYYY-MM}` | `/moon/{country}/{city}/{yyyy}/{mm}` |
| `/moon-in-{city}/{YYYY-MM-DD}` | `/moon/{country}/{city}/{yyyy}/{mm}/{dd}` |

Lang prefix preserved on every shape (verified ar / en / fr / ur / de).

## 3. Validation → 404 (NOT 301-to-200, NOT thin 200)

- Invalid day `…/2026-06-32` → **404** · invalid month `…/2026-13` / `…/2026-13-01` → **404** ·
  non-existent `…/2026-02-30` → **404** · Hijri-year date `…/1447-10-03` → **404** (strict policy).
- Unknown / garbage city (no coord) — `…/moon-today-in-notacityxyz`, `…/moon-in-notacityxyz`,
  `…/moon-in-notacityxyz/2026-06` → **404** (small error page, not the 200 KB shell).
- Date bounds: year 1900–2100, month 01–12, day leap-aware (validated in `server.js`).

## 4. Coord-suffix safety

`/moon-today-in-{city}-{lat}-{lng}` + `/moon-in-{city}-{lat}-{lng}` **must not 404** — they resolve to a
live 200 page (via the pre-existing coord-strip canonical 301, then the MLRC legacy→nested 301).
Verified both land on a 200 `page-moon` page.

## 5. Sitemap — `server.js`

- **Removed** all legacy flat moon emissions: bare `/moon-today`, `/moon-in-{city}` hub,
  `/moon-today-in-{city}`, legacy dated `/moon-in-{city}/{date}`, the 90-day legacy-dated loop and the
  3-month legacy-month loop.
- **Kept** nested only: `/moon` + `/moon/{country}` (main) · `/moon/{country}/{city}` hub + `…/today` +
  year (prev/cur/next) + months (12/accepted year) (cities).
- **No bulk day-page flood** — nested `…/{yyyy}/{mm}/{dd}` deliberately NOT added (discovered via month-page day links).

## 6. Internal links — nested everywhere country is known

**SSR (`server.js`) — all base links nested:** country-grid fallback, breadcrumb city/month JSON-LD,
`_tlMoonHref` / `_moonHref` / `_mHref`, SSR breadcrumb city href, hub calendar cells + month-nav +
compact-cal + CTA, navbar. Verified: rendered nested pages emit **0** legacy moon hrefs.

**`index.html`:** all 12 `.moon-cities-grid` city cards hardcoded to nested-today (`/moon/{country}/{city}/today`).

**Client (`js/app.js`) — Option-1 applied via new helper `_nestedMoonHrefClient(slug, langPrefix, kind, ccOverride, dateStr)`**
(`kind` = hub | today | month | day; coord-suffix slug + unknown country → legacy fallback). Converted **all
country-known sites:** current-city rendered links (readMore, rl/pt/mit/CTA related-links, 2 edu blocks, hub
related-links array, B4 array, forecast-calendar day links, lunar-event links, `_moonDatePagePath` prev/next,
prayer-page services link, qibla-page quick-links + related-cards, breadcrumb client-fills); and **search/
suggestion transitions that carry a result `countryCode`:** `navigateToMoonToday`, `_wireMoonHubSmartPill`,
the general home-search-box `moon-hub` target. Country source per site: `_MOON_CITY_COUNTRY_KEYS` / SSR seed /
`currentCountryCode` (current city) / search-result `countryCode`.

## 7. Client-side legacy-fallback note (required — verbatim)

> Some client-side legacy links that do not have reliable country context are intentionally left as legacy
> fallback and resolved through 301 redirects. This is accepted temporarily to avoid unsafe client-side
> city-to-country inference. All SSR, sitemap, canonical, and country-aware links use the nested structure.

Concretely, the only remaining legacy-form client emissions are: (a) the shared famous-city builder
`_buildMoonCityUrl(englishName,lat,lng,slug)` used by the moon-hub geo-detect navigation (country not threaded
through the builder); (b) the `_hashByTarget` file:// hash fallback; (c) the dead `_cityKnown=false` related
branch; (d) the `_hijriPath` Hijri-form date nav (nested has no valid Hijri target — Hijri moon pages 404 by
strict policy). The internal `_moonPathname()` normalizer still maps nested→flat **for parsing only** (never emitted as an href).

## 8. Cache busters

- `index.html`: `js/app.js?v=793 → ?v=794` (both preload + script tags). `css/style.css?v=481` unchanged (no CSS edit).
- `sw.js`: `CACHE_VERSION 'v453' → 'v454'` (+ changelog line).

## 9. `js/moon.js` + Meeus — UNTOUCHED

`git diff --stat js/moon.js` = **empty**. Meeus Ch.49 engine present & unchanged. Spot-checked Riyadh Jun 2026
via nested day pages: **15 Jun = المحاق**, 16 = هلال متزايد, 29 = أحدب متزايد, **30 = البدر**.

## 10. Tests

**NEW dedicated smoke** `scripts/_smoke_moon_legacy_routes_cleanup_before_launch_1.mjs` — **63/63 pass**:
A) 5 legacy shapes × 5 langs → 301 nested + each nested target = 200 · B) invalid date/month + unknown city
→ 404 · C) coord-suffix resolves to 200 · D) sitemap: 0 legacy flat moon routes, nested hub+today present, no
day flood · E) offline unit-test of `_nestedMoonHrefClient` (hub/today/month/day + coord/unknown fallback) ·
F) SSR nested pages emit 0 legacy moon hrefs.

**Guardrails + all moon smokes updated to legacy-now-301 contract — full suite green:**

| Suite | Result |
|---|---|
| `_smoke_moon_legacy_routes_cleanup_before_launch_1` (NEW) | ✅ 63/63 |
| `_smoke_moon_routes_structure_guardrails_1` | ✅ 115/115 |
| `_smoke_moon_city_hub_route_structure_add_1` | ✅ 33/33 |
| `_smoke_moon_city_today_route_structure_add_1` | ✅ 53/53 |
| `_smoke_moon_city_year_route_structure_add_1` | ✅ 74/74 |
| `_smoke_moon_city_month_route_structure_add_1` | ✅ 69/69 |
| `_smoke_moon_city_day_route_structure_add_1` | ✅ 62/62 |
| `_smoke_moon_country_pages_ssr_add_1` | ✅ 58/58 |
| `_smoke_moon_phase_calendar_calculation_fix_1` | ✅ 211/211 |
| `_smoke_moon_phase_event_engine_meeus49_fix_1` (carry, no edit) | ✅ 45/45 |
| `_smoke_moon_today_content_move_to_moon_1` | ✅ 35/35 |
| `_smoke_moon_spa_router_moon_prefix_activation_audit_1` | ✅ 38/38 |

> Where smokes previously diffed legacy-200 bodies (today/day "same content as legacy"), they now assert the
> nested page renders the legacy renderer (non-empty H1 + `#moon-city-answer`) **and** the legacy URL 301s to
> it. Meeus-grid checks that read the legacy monthly grid (now 301) now validate the SAME Meeus output via the
> nested DAY pages (legacy renderer) and the nested month page's `my-day-link` row count.

**Non-moon regression — green:**

| Suite | Result |
|---|---|
| `_test_search_place_endpoint` | ✅ 659/659 |
| `_test_search_ar` | ✅ 22/22 |
| `_test_home_search_migration` | ✅ 33/33 |
| `_test_home_title_stability` | ✅ 10/10 |
| `_test_moon_general_home_search_box_1` | ✅ 47/47 |
| `_test_qibla_general_home_search_box_1` | ✅ 36/36 |
| `_test_qibla_back_fix_2` | ✅ 12/12 |
| `_smoke_hijri_date_city_timezone_fix_1` | ✅ ALL PASSED |
| `_smoke_hijri_new_year_countdown_seo_content_h1_fix_1` | ✅ 424/424 |

`node --check` clean on all touched JS (app.js / server.js / moon.js / sw.js + all 14 smoke/test files).

> **Test-hygiene fixes folded in (pre-existing staleness surfaced while updating these files):**
> `_test_moon_general_home_search_box_1` / `_test_qibla_general_home_search_box_1` PART-B/E asserted
> `/moon-today` = 200 (retired by the committed MOON-TODAY-CONTENT-MOVE-TO-MOON-1 → 301 `/moon`) — refreshed to
> the committed behavior. `_test_qibla_back_fix_2` case I expected `page-duas` (renamed to `page-azkar-hub` by
> the committed AZKAR-HUB restructure) — synced to the real app.js mapping; its moon cases' DOM fixture now
> loads the SPA shell from a stable 200 URL since legacy moon URLs 301. None of these are MLRC regressions.

## 11. Files touched (stage EXACTLY these — the ~368 untracked noise files MUST NOT enter the commit)

**Core (5):** `server.js` · `js/app.js` · `index.html` · `sw.js` · `reports/moon-routes-structure-contract-1.md`
**Tests modified (13):** `scripts/_smoke_moon_routes_structure_guardrails_1.mjs` ·
`_smoke_moon_city_hub_…` · `_smoke_moon_city_today_…` · `_smoke_moon_city_year_…` · `_smoke_moon_city_month_…` ·
`_smoke_moon_city_day_…` · `_smoke_moon_country_pages_ssr_add_1` · `_smoke_moon_phase_calendar_calculation_fix_1` ·
`_smoke_moon_today_content_move_to_moon_1` · `_smoke_moon_spa_router_moon_prefix_activation_audit_1` ·
`_test_moon_general_home_search_box_1` · `_test_qibla_general_home_search_box_1` · `_test_qibla_back_fix_2`
**Test new (1):** `scripts/_smoke_moon_legacy_routes_cleanup_before_launch_1.mjs`
**This report (1).**
**MUST NOT commit:** `_mlrc_server.log` (local server log) + all pre-existing untracked noise (`.azkar-shots/`,
`.lh-runs/`, `db/places/candidates/*`, etc.).

## 12. Proposed commit message

```
chore(moon): MOON-LEGACY-ROUTES-CLEANUP-BEFORE-LAUNCH — redirect legacy moon routes to nested structure and clean sitemap
```

## 13. Status

**Implemented locally only. No commit. No push.** Awaiting your pre-push approval.
`js/moon.js` + Meeus 49 unchanged; no `/moon` content/design change; no new structure opened; no bulk day pages in sitemap.
