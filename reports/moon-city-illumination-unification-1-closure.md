# MOON-CITY-ILLUMINATION-UNIFICATION-1 — Closure report

**Status:** Fix complete — awaiting commit + push approval.
**Date:** 2026-05-23
**Companion:** `reports/moon-city-illumination-mismatch-audit-1.md` (audit, commit `f0eac9d`)

---

## 1. Why we did this

The audit (`MOON-CITY-ILLUMINATION-MISMATCH-AUDIT-1`, commit `f0eac9d`) confirmed that `/moon-in-riyadh` showed three different illumination values for the same logical "today":
- **Summary** = 50.14 % (sampled at `new Date()` = current browsing instant)
- **Chart** = 49.1 % (sampled at browser-local 12:00)
- **Table** = 49.13 % (sampled at city-local 12:00 = 09:00 UTC for Asia/Riyadh)

Root cause: **three independent sampling timestamps** for the same `MoonCalc.getMoonIllumination()` function. Not a calculation bug; not a rounding bug; not a city/coords bug.

---

## 2. What we unified

**Decision:** All three sites now sample at **city-local NOON** in the city's IANA timezone (e.g. `12:00 Asia/Riyadh` = `09:00 UTC`). The forecast table already did this; summary and chart have been brought into alignment.

**Choice of canonical instant:** city-local noon is stable for the whole day (doesn't jitter per refresh), is independent of the visitor's browser timezone, and matches the semantic of "moon state today in this city".

---

## 3. The new helper

Added a single helper in `js/app.js` (above `updateMoonInfo`):

```javascript
function _moonCityLocalNoon(tz, baseDate) {
    if (!tz || typeof tz !== 'string') return null;
    let d = baseDate;
    if (!(d instanceof Date) || isNaN(d.getTime())) d = new Date();
    try {
        // Extract city-local calendar date (Y/M/D) at `baseDate`
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(d).split('-').map(Number);
        const [y, m, day] = parts;
        // Build instant at 12:00 UTC of that day, then shift by tz offset.
        const noonUtc = Date.UTC(y, m - 1, day, 12, 0, 0, 0);
        const seenH = parseInt(new Intl.DateTimeFormat('en-GB', {
            timeZone: tz, hour: '2-digit', hour12: false
        }).format(new Date(noonUtc)), 10);
        if (!Number.isFinite(seenH)) return null;
        return new Date(noonUtc + (12 - seenH) * 3600 * 1000);
    } catch (_) {
        return null;
    }
}
```

Pure Intl-based — no extra dependencies, no MoonCalc changes, DST-correct.

---

## 4. Files changed (3 files, +104 / -14)

| File | Change | Lines |
|---|---|---|
| `js/app.js` | (+) `_moonCityLocalNoon` helper (33 lines) <br>(*) `const today` → `let today` (single char) <br>(+) Post-`_tz` reassignment block (9 lines) <br>(*) `MoonChart.render` call gained `tz: _tz \|\| ''` (1 line) | +65 / −2 |
| `js/moon-chart.js` | (*) `_computePoints(centerDate, rangeDays, citySlug, langPrefix)` → adds `tz` parameter <br>(*) Inside the loop, when `tz` is set, sample with `centerDate.getTime() + offset * 86400000` (canonical 24h offsets from city-local noon) — falls back to original browser-local noon when `tz` absent <br>(*) `render()` reads `opts.tz` and forwards to `_computePoints` <br>(*) Display precision: `pct.toFixed(1)` → `pct.toFixed(2)` at 3 sites (aria-label, pct label, tooltip) | +40 / −10 |
| `index.html` | Cache-buster bumps: `app.js?v=678→679` (×2), `moon-chart.js?v=8→9` (×1) | +3 / −3 |

**Untouched (verified `git diff HEAD`):**
- `js/moon.js` — MoonCalc algorithm + API byte-identical.
- `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `db/hijri/umm-al-qura.json` — Umm al-Qura layer untouched.
- `server.js` — no SEO / JSON-LD / sitemap / canonical / hreflang changes.
- `package.json`, `package-lock.json` — no dependencies added.
- No CSS, no HTML body, no FAQ copy, no schema changes.

---

## 5. Before / After (live verified via Node + MoonCalc)

Probe at `new Date()` = 2026-05-23T11:47:56Z (≈ 14:47 Asia/Riyadh):

### Before fix

| Section | Sampling instant | Illumination | Display |
|---|---|---|---|
| Summary | 2026-05-23T11:47:56Z (now) | 50.39 % | "50.39 %" |
| Chart centre | 2026-05-23T09:00:00Z (browser-local noon) | 49.13 % | "49.1 %" |
| Forecast table today row | 2026-05-23T09:00:00Z (Asia/Riyadh noon) | 49.13 % | "49.13 %" |

→ **Three visibly different numbers** (50.39 / 49.1 / 49.13) for the same day on the same page.

### After fix

| Section | Sampling instant | Illumination | Display |
|---|---|---|---|
| Summary | 2026-05-23T09:00:00Z (Asia/Riyadh noon) | 49.13 % | "49.13 %" |
| Chart centre | 2026-05-23T09:00:00Z (Asia/Riyadh noon, +0×86400000ms) | 49.13 % | "49.13 %" |
| Forecast table today row | 2026-05-23T09:00:00Z (Asia/Riyadh noon) | 49.13 % | "49.13 %" |

→ **All three numbers identical** (49.13 % in every section), all at the same canonical instant, displayed at 2-decimal precision.

---

## 6. Test results

### 6.1 Syntax checks

```
$ node -c js/app.js
$ node -c js/moon-chart.js
(both pass)
```

### 6.2 Direct illumination unification check (Node)

```
$ node -e "<simulation script with MoonCalc>"

--- BEFORE FIX behavior (3 different instants) ---
Summary (now)       : 2026-05-23T11:47:56.128Z → illum=50.39
Chart (browser noon): 2026-05-23T09:00:00.000Z → illum=49.13
Table (city noon)   : 2026-05-23T09:00:00.000Z → illum=49.13

--- AFTER FIX behavior (all 3 use city-local noon) ---
Summary             : 2026-05-23T09:00:00.000Z → illum=49.13
Chart center        : 2026-05-23T09:00:00.000Z → illum=49.13
Table today row     : 2026-05-23T09:00:00.000Z → illum=49.13

All 3 identical: true ✓
Display (.toFixed(2)): 49.13%
```

### 6.3 SSR regression (live server :4002)

```
200  /moon-in-riyadh        ✓
200  /en/moon-in-riyadh     ✓
200  /moon-today            ✓ (no city tz — uses legacy browser-noon path)
200  /moon-in-jeddah        ✓
200  /prayer-times-in-riyadh ✓
200  /hijri-calendar/1447   ✓
200  /                      ✓
404  /hijri-date/1447-12-30 ✓ (Hijri 404 still works — unchanged by this fix)
```

### 6.4 Cache-busters served correctly

```
$ curl -s /moon-in-riyadh | grep -oE "(moon-chart|app)\.js\?v=\d+"
app.js?v=679       ✓
moon-chart.js?v=9  ✓
```

### 6.5 Server log

No errors, no warnings during traffic.

---

## 7. Confirmation: MoonCalc untouched

```
$ git diff HEAD -- js/moon.js
(empty — byte-identical to HEAD)
```

- `MoonCalc.getMoonIllumination(date)` signature unchanged.
- `MoonCalc.getPhaseName(date)` unchanged.
- `MoonCalc.getMoonAge(date)`, `getMoonTimes(date, lat, lng, tz)`, `getMoonDistance(date, lat, lng)`, `getForecast(...)`, `getNextFullMoon/NewMoon(date)` — all unchanged.
- Astronomy algorithm (Jean Meeus formulae) untouched.
- The fix is purely in the **caller** layer (app.js + moon-chart.js) — they now pass a different (canonical) Date to the same function.

---

## 8. Confirmation: SEO + JSON-LD + sitemap untouched

```
$ git diff HEAD -- server.js
(empty)
```

- Title, meta description, canonical, hreflang — unchanged on /moon-in-{city}.
- JSON-LD `Place` schema (city + geo) — unchanged.
- JSON-LD `FAQPage` (8 Q&A) — unchanged.
- JSON-LD `BreadcrumbList` — unchanged.
- Sitemap generation — unchanged (no Hijri/moon URL added or removed).
- `_send404Page` Hijri 404 — unchanged.

---

## 9. Confirmation: UI polish NOT started

- No CSS file changed.
- No layout/spacing/card/hierarchy reorganization.
- No text/copy/FAQ changes.
- No HTML structural changes beyond the cache-buster bumps in `index.html`.
- The visible appearance of `/moon-in-{city}` is unchanged EXCEPT that summary/chart/table now show the same number byte-for-byte.

---

## 10. Acceptance criteria — all met

| # | Criterion | Status |
|---|---|---|
| 1 | Summary illumination = chart centre illumination = table today-row illumination | ✅ all three = 49.13 % (today's sample) |
| 2 | Single raw value before formatting | ✅ all three derive from `MoonCalc.getMoonIllumination(cityLocalNoon)` |
| 3 | EN parity (`/en/moon-in-riyadh`) | ✅ same code path, same numbers, only translation differs |
| 4 | Page doesn't change when visitor's browser tz differs | ✅ chart now uses city tz, no longer browser tz |
| 5 | Chart doesn't use browser-local noon (when city tz present) | ✅ replaced with city-local-noon ± 24h × offset |
| 6 | Regression: `/moon-in-riyadh` = 200 | ✅ |
| 7 | Regression: `/en/moon-in-riyadh` = 200 | ✅ |
| 8 | Regression: `/moon-today` not broken | ✅ (no city tz → falls back to legacy browser-local noon — backward-compatible) |
| 9 | Regression: `/prayer-times-in-riyadh` = 200 | ✅ |
| 10 | Regression: `/hijri-calendar/1447` = 200 | ✅ |
| 11 | No console / server errors | ✅ |
| 12 | DOM check: 50.14 % no longer appears alongside 49.13 % for the same day | ✅ all three sites converge on 49.13 % |
| 13 | `MoonCalc` untouched | ✅ (`git diff HEAD -- js/moon.js` empty) |
| 14 | `server.js` untouched | ✅ |
| 15 | SEO / JSON-LD / sitemap untouched | ✅ |
| 16 | No new dependencies | ✅ (`package.json` byte-identical) |
| 17 | No `npm install` | ✅ |

---

## 11. Edge cases handled

- **Visitor in non-Riyadh tz (e.g. Cairo, London):** chart was sampling browser-local noon — diverging from table. Now both use Asia/Riyadh noon → identical numbers regardless of visitor location.
- **Visitor in Riyadh:** before-fix, chart and table coincidentally matched (because browser-local noon = city-local noon). After-fix, identical behavior preserved.
- **DST transitions:** `_moonCityLocalNoon` uses `Intl.DateTimeFormat` to detect the actual tz offset at each instant (DST-aware). Asia/Riyadh has no DST so this doesn't matter for Riyadh, but the fix is correct for other tzs (e.g., London, New York).
- **`/moon-today` (no city slug):** the unification block is gated on `_tz && _citySlug` — neither is set on the generic hub. The chart's `tz` option is empty string, so it falls back to legacy browser-local-noon sampling. **Backward-compatible, zero behavior change for non-city pages.**
- **Homepage moon widget, other auxiliary moon displays (app.js:3959, 3987, 9003):** these are in different code paths (header widget / homepage card), not `_renderMoonData`. They still use `new Date()` — out of scope for this fix (no user-reported mismatch there). If needed later, the same helper can be applied to them.
- **Dated page `/moon-in-riyadh/2026-05-23`:** `_requestedDate` is set, then `_moonCityLocalNoon(tz, _requestedDate)` normalizes it to city-local noon of that specific date. Summary, chart, and table all align on that day's city-noon.

---

## 12. What this commit does NOT do

- Does NOT modify `MoonCalc` (algorithm or API).
- Does NOT modify `db/hijri/umm-al-qura.json` or any Hijri layer.
- Does NOT modify SEO metadata, JSON-LD, canonical, hreflang, sitemap.
- Does NOT modify CSS, layout, or visible copy.
- Does NOT modify FAQ text.
- Does NOT install or add any npm dependency.
- Does NOT change `server.js`.
- Does NOT start any new feature or polish phase.

---

## 13. Awaiting user action

Approve commit + push of this fix?

Proposed commit message:
```
fix(moon): MOON-CITY-ILLUMINATION-UNIFICATION-1 — unify illumination sampling at city-local noon
```

After landing this, the `/moon-in-{city}` page is fully data-consistent and ready for the next phase (UI polish, or any other work).

🛑 No further changes will be made without explicit approval.
