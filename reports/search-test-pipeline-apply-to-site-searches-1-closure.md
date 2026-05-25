# SEARCH-TEST-PIPELINE-APPLY-TO-SITE-SEARCHES-1 — Closure

**Date:** 2026-05-25
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** Apply the approved `/search-test` (`db/places/search-test.html`) pipeline to **four search inputs** across the main app:
- `#loc-hero-search` → homepage `/` AND `/prayer-times-in-{city}`
- `#moon-hub-search` → `/moon-today` AND `/moon-today-in-{city}`
- `#qibla-hub-search` → `/qibla`
**Cache busters:** `js/app.js?v=698 → v=700`, `css/style.css?v=421 → v=425`.

---

## 1 — Background

Audit `HOME-SEARCH-SOURCE-OF-TRUTH-RECHECK-1` (committed in this same diff as `reports/home-search-source-of-truth-recheck-1.md`) established that:

- `/search-test` (`db/places/search-test.html`) is the approved stable reference for search UX. It is self-contained (own `<style>` + `<script>` block) and untouched since `fb7e7c2` (2026-05-15).
- The site's other search inputs used either a legacy pipeline (homepage / prayer-times-city via `onCitySearchInput` mirror chain) or a partially-polished pipeline (moon/qibla via `.cps-suggestions` scoped CSS). None of them rendered `/search-test`'s actual markup or used its direct backend.

This wave brings all four site-internal search inputs in line with `/search-test` byte-for-byte (logic + renderer + click handler + visual CSS), while leaving `/search-test` itself completely untouched.

---

## 2 — What was migrated (final state)

### A. JS pipeline (`js/app.js`, +307 lines, appended IIFE at EOF)

A single IIFE `_wireSearchTestPipelineEverywhere` defines the shared pipeline and wires it into three entry points:

1. **`#loc-hero-search`** — overrides `window.onHeroSearchInput` + `window.onHeroSearchKeyDown` so the existing inline HTML handlers (`oninput="onHeroSearchInput(this.value)"`, `onkeydown="onHeroSearchKeyDown(event)"`) route to the new pipeline. Works on every page that hosts `#loc-hero-search` — i.e. homepage AND `/prayer-times-in-{city}`.

2. **`#moon-hub-search`** — overrides `window.onCitySearchInput` + `window.onSearchKeyDown` to inspect `ctx.targetRoute`. When `ctx.targetRoute === 'moon-hub'`, route to the new pipeline writing into `#moon-hub-suggestions`. Non-moon ctx values fall back to the original `onCitySearchInput`, so unrelated consumers keep working.

3. **`#qibla-hub-search`** — same mechanism as (2) but `ctx.targetRoute === 'qibla-hub'` → writes into `#qibla-hub-suggestions`.

The shared pipeline (functions `_stDoSearch`, `_stFetch`, `_stRenderResults`, `_stOnPick`, `_stHide`, `_stShowLoading`, `_stShowEmptyWithStatus`) mirrors `/search-test`'s JS verbatim:
- 150ms debounce on input.
- Direct `fetch('/api/search-place?q=…&lang=…')` — no LOCAL_CITIES instant render, no v1 Nominatim cascade, no legacy mirror.
- `_stIsPrayerTimesReady(r)` filter (slug + countryCode + timezone + valid lat/lng).
- `<button class="search-test-result" type="button" role="option">` markup with `<strong>` name + `<span>` subtitle in TYPE · COUNTRY order, and `<img>` flag with 2× retina `srcset`.
- Click → POST `/api/place-selected` for `source !== 'curated'` results (best-effort, `keepalive: true`), then `window.location.href = <route-builder>(targetRoute, slug)`.
- Enter picks first result. Escape hides dropdown + blurs input.
- Visibility via the `[hidden]` attribute + legacy `.open` class for CSS compat.

### B. Per-page target route + lang-prefix preserved

`_stRouteFor(targetRoute, slug)` builds the navigation URL with the current path's lang prefix:

| Page | `targetRoute` | Navigation target |
|---|---|---|
| `/` AND `/prayer-times-in-{city}` | `'prayer-times'` | `[/<lang>]/prayer-times-in-{slug}` |
| `/moon-today` AND `/moon-today-in-{city}` | `'moon-hub'` | `[/<lang>]/moon-today-in-{slug}` |
| `/qibla` | `'qibla-hub'` | `[/<lang>]/qibla-in-{slug}` |

Lang prefix detected via `pathname.match(/^\/(en|fr|tr|ur|de|id|es|bn|ms)(?=\/|$)/)`. So `/ur/qibla` → click → `/ur/qibla-in-{slug}`, `/fr/moon-today` → click → `/fr/moon-today-in-{slug}`, etc.

### C. CSS (`css/style.css`, +120 lines, +2 scoped blocks + container tweaks)

1. Updated `.loc-hero-suggestions` container: bumped `box-shadow` to `0 8px 24px rgba(0,0,0,0.12)` and `max-height` to `360px` (match /search-test). Added `.loc-hero-suggestions[hidden] { display: none }` and full-width fallback.
2. Updated `.city-page-search .cps-suggestions`: bumped `max-height` `320 → 360`. Added `.cps-suggestions[hidden] { display: none }`.
3. New scoped rule block for `<button class="search-test-result">` inside BOTH containers:
   - `.loc-hero-suggestions .search-test-result, .cps-suggestions .search-test-result { … }`
   - `.search-test-result-flag` (28×21 with `border-radius:3px` + inset ring shadow)
   - `.search-test-result-text strong` (1rem, weight 600, mb 2px)
   - `.search-test-result-text span` (0.83rem muted)
   - hover/focus `rgba(30, 86, 49, 0.08)`
   - `.search-test-empty` / `.search-test-loading` (padding 14px 16px, muted)
   - mobile `@media (max-width: 480px)` — tighter padding `10px 14px` + slightly smaller fonts

The new CSS lives only inside `.loc-hero-suggestions` and `.cps-suggestions` selectors — does NOT collide with the legacy global `.suggestion-item` rule (still used by any path not yet migrated) and does NOT leak into the `/search-test` page (which has its own self-contained `.search-test-*` styles inline).

### D. Cache busters (`index.html`)

- `js/app.js?v=698 → v=700`
- `css/style.css?v=421 → v=425` (multiple intermediate bumps consolidated to the final v=425)

---

## 3 — What stayed unchanged

| Item | Status |
|---|---|
| `/search-test` page (`db/places/search-test.html`) | ✅ Byte-identical. Its own self-contained CSS+JS run untouched. |
| Hero input visual on `/` + `/prayer-times-in-{city}` | ✅ `.loc-hero-search--hero` rule (60px min-height, 16px 20px padding, 2px green accent border, 14px radius) unchanged. Only the dropdown content + click handling changed. |
| Moon/qibla wrapper markup | ✅ `.cps-inner`, `.city-page-search--moon|--qibla`, `.qibla-hub-hero-actions` untouched. |
| Legacy mirror layer (`mirrorSuggestionsToHero`, `MutationObserver` on `#city-suggestions`) | ✅ Still in place for any path that still relies on it (none of the four migrated paths do anymore, but the code remains for back-compat). |
| Legacy `onCitySearchInput`, `fetchCitySuggestions`, `fetchCitySuggestionsV2`, `_renderV2Row` | ✅ Untouched bodies; only routed-around via `window.onCitySearchInput` override that delegates to legacy on non-moon/qibla ctx. |
| `/hijri-calendar*` | ✅ Has no search input — unaffected. |
| All curated/discovered data | ✅ No DB edits. |
| Routes / slugs / sitemap / canonical / hreflang / JSON-LD | ✅ No server.js or schema changes. |
| Dependencies | ✅ Zero additions. |

---

## 4 — Browser-verified tests (current HEAD)

| Test | Result |
|---|---|
| `/` desktop AR — type `جدة` | ✅ 2 results in `<button class="search-test-result">` markup; subtitle `"مدينة · المملكة العربية السعودية"`; flag `srcset="…/w80/sa.png 2x"`; padding `12px 16px`; name font 1rem |
| `/moon-today` desktop AR — type `جدة` → click first | ✅ navigated to `/moon-today-in-jeddah` |
| `/qibla` desktop AR — type `مكة` → click first | ✅ navigated to `/qibla-in-makkah` |
| `/prayer-times-in-jeddah` desktop AR — expand hero, type `الرياض` | ✅ `<button class="search-test-result">`, `window.onHeroSearchInput` overridden to new pipeline |
| `/search-test` desktop AR — type `جدة` | ✅ unchanged — same title (`Search Test (noindex) — /api/search-place Phase A`), same 2 results, same markup |
| `node --check js/app.js` | ✅ OK |

---

## 5 — Files changed (final, single-commit scope)

| File | Change |
|---|---|
| `js/app.js` | +307 / −0 — single IIFE `_wireSearchTestPipelineEverywhere` appended at EOF; no other functions modified. |
| `css/style.css` | +112 / −8 — `.loc-hero-suggestions` + `.cps-suggestions` container tweaks + new scoped `.search-test-result` block (covers both containers) + mobile @media. |
| `index.html` | +4 / −4 — cache busters (`style.css?v=421→425`, `app.js?v=698→700`). |
| `reports/home-search-source-of-truth-recheck-1.md` | NEW — audit that led to this work. |
| `reports/search-test-pipeline-apply-to-site-searches-1-closure.md` | NEW (this file). |

---

## 6 — Closure checklist

- [x] /search-test pipeline ported (fetcher + 150ms debounce + filter + markup + click → POST + navigate).
- [x] Per-page target route + lang prefix correct.
- [x] CSS scoped to `.loc-hero-suggestions` + `.cps-suggestions` (no global `.suggestion-item` mutation, no impact on /search-test).
- [x] Hero input visual preserved (60px + green border + padding).
- [x] `/search-test` page byte-identical.
- [x] Moon/qibla regression-verified (target routes correct: `/moon-today-in-{slug}` and `/qibla-in-{slug}`).
- [x] Lang-prefix preserved on navigation.
- [x] `node --check js/app.js` passes.
- [x] Cache busters bumped.
- [x] No data / routes / slugs / canonical / hreflang / sitemap / JSON-LD changes.
- [x] No new dependencies.
- [x] Local history squashed into single clean commit (no reverted intermediate `max-width` attempts kept).
- [x] Closure report written under the final phase name.
