# MOON-GENERAL-HOME-SEARCH-BOX-1 (REVISE) — Closure Report

**Date**: 2026-05-18
**Phase ID**: MOON-GENERAL-HOME-SEARCH-BOX-1 (revision after user clarification)
**Predecessors**: First-pass commit `fbb2395` (custom Nominatim-direct wiring) — superseded
**Type**: UI / routing / search-pipeline reuse on `/moon-today`

---

## Reason for revision

The first pass of MOON-GENERAL-HOME-SEARCH-BOX-1 (`fbb2395`) gave the moon-today page its **own** search wiring that called `/api/search-place` directly. The user clarified: the moon-today search should not just LOOK like the homepage — it should USE the homepage's search functions verbatim. Specifically:

- **Local-first**: instant LOCAL_CITIES match (no debounce), then 120ms-debounced v2/v1 cascade.
- **Same ranking**: whatever the homepage does for sorting / dedup.
- **Same pipeline** end-to-end (search → fetch → render → click → navigate).
- The ONLY difference is the navigation target (`/moon-in-{slug}` instead of `/prayer-times-in-{slug}`).

This revision factors the homepage search pipeline into a **single set of functions parameterized by a `ctx` object**, and rewires both the homepage and the moon-today page to call those same functions with their own `ctx`.

---

## What was the old moon-today search box

After the first-pass commit it was a custom IIFE inside `_wireMoonHubHero` that:
1. Built its own listeners + render loop.
2. Called `/api/search-place` directly with no LOCAL_CITIES instant pass.
3. Defined its own row-build/click/select helpers.
4. ~280 lines of code duplicated from the homepage's logic, slightly out of sync.

---

## How it was replaced

The homepage search pipeline (5 functions: `onCitySearchInput`, `onSearchKeyDown`, `fetchCitySuggestionsV2`, `fetchCitySuggestions`, `_renderV2Row`) now accepts an optional `ctx` object:

```js
const _DEFAULT_SEARCH_CTX = {
    inputId:       'city-search-input',
    suggestionsId: 'city-suggestions',
    targetRoute:   'prayer-times',
    attributionId: 'search-attribution-locationiq'
};
```

Callers without `ctx` (e.g. inline `oninput="onCitySearchInput(this.value)"`) keep the homepage's default behavior — **zero regression**.

The moon-today wiring is now a 12-line block:

```js
const MOON_SEARCH_CTX = {
    inputId:       'moon-hub-search',
    suggestionsId: 'moon-hub-suggestions',
    targetRoute:   'moon-hub',
    attributionId: null
};
searchEl.addEventListener('input',   () => onCitySearchInput(searchEl.value, MOON_SEARCH_CTX));
searchEl.addEventListener('keydown', (e) => onSearchKeyDown(e, MOON_SEARCH_CTX));
```

Click destination is switched via `navigateToCity()`'s `opts.targetRoute === 'moon-hub'` branch (introduced in the first pass) → `/moon-in-{slug}`.

**Result**: every line of search logic is now SHARED between homepage and moon-today. The local-first behavior, the ranking, the v2 cascade, the keyboard nav, the mobile behavior — all identical by construction.

---

## Files modified

| File | Change |
|---|---|
| `js/app.js` | Parameterized `onCitySearchInput`, `onSearchKeyDown`, `fetchCitySuggestionsV2`, `fetchCitySuggestions`, `_renderV2Row` to accept `ctx`. Removed the first-pass custom moon wiring (≈220 lines). Net change ≈ −180 lines. |
| `index.html` | Cache-buster `?v=655` → `?v=656` |
| `scripts/_test_moon_general_home_search_box_1.mjs` | Smoke test updated to verify shared-pipeline markers (MOON_SEARCH_CTX + onCitySearchInput call + ctx-aware fetchers) instead of the custom logic. **37/37 PASS**. |

`curated_places.json`, `server.js`, `fillLangMap`, `_pickCuratedName`, `names.ur`, `aliases.ur`, homepage HTML — all untouched.

---

## Click selection behavior

When the user clicks a result on `/moon-today`:
1. The shared `_renderV2Row` click handler runs.
2. It writes the displayName to `#moon-hub-search` via `ctx.inputId`.
3. Fires `/api/place-selected` for `external`-sourced rows (Tier 2 persistence).
4. Calls `selectCity(...)` with `{ slug, timezone, targetRoute: 'moon-hub' }`.
5. `navigateToCity()`'s `_target === 'moon-hub'` branch writes seeds + navigates to `pageUrl('/moon-in-{slug}')` — language prefix preserved.

---

## Local-first browser-verified

`/ur/moon-today` typing "mecca":
- **At 100ms**: `count=2`, first item = `مكة المكرمة` (LOCAL_CITIES instant render — no Nominatim wait).
- **At 1500ms**: v2 returns curated row `مکہ` (Urdu), replacing the local LOCAL_CITIES rows in the dropdown.

`/ur/moon-today` typing "charikar" (NOT in LOCAL_CITIES):
- **At 1500ms**: 1 result, `چاریکار` (Afghanistan · شہر), slug=charikar. Click → `/ur/moon-in-charikar` ✓.

---

## Tests

- **Smoke**: 37/37 PASS.
- **Carry-forward**: 24 suites, all green (search-place transient required 1 retry, ultimately 659/659).

## Status: 🟢 CLOSED — moon-today now fully shares the homepage search pipeline.
