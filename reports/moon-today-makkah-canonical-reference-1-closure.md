# MOON-TODAY-MAKKAH-CANONICAL-REFERENCE-1 — Closure

**Status:** ✅ **CLOSED — user-approved 2026-05-23**
Implementation commit: `1b54433` (origin/main).
Closure commit: this report-only update.

`/moon-today` (and all `/{lang}/moon-today` variants) now anchor every moon section to a single canonical instant computed at **Mecca local noon (Asia/Riyadh)** — independent of visitor browser timezone or geolocation. Summary / chart center / forecast-table today-row all sample MoonCalc at the exact same instant and now show identical values.

**Date:** 2026-05-23
**Scope:** `/moon-today` page-class only (10 routes: `/moon-today` + 9 `/{lang}/moon-today`).
**Companions:**
- `reports/moon-city-illumination-mismatch-audit-1.md` (root-cause audit, commit `f0eac9d`)
- `reports/moon-city-illumination-unification-1-closure.md` (city-pages fix, commit `6c64484`)
- `reports/moon-illumination-canonical-instant-global-1-closure.md` (scope analysis + pause, commit `de2ee98`)

---

## 1. Why Mecca was chosen (recap of user decision)

Per user direction in the previous turn:

> "أعتمد قرار مرجع صفحة /moon-today ليكون: مكة المكرمة، Timezone: Asia/Riyadh، Coordinates: Makkah coordinates المعتمدة في المشروع."

This corresponds to **Option A** from the scope-analysis report's reference-decision menu, chosen for the following reasons:

- **Religiously meaningful default** for an Arabic Islamic prayer-times / moon site.
- **Already the codebase default** elsewhere — `_resolveCityForMoon` falls back to Mecca for unknown slugs, and server-side `FAMOUS_CITY_OVERRIDES.mecca` carries the canonical Mecca coordinates used across SEO meta.
- **Deterministic + server-renderable** — does not depend on browser geolocation permission, browser timezone, or sessionStorage history. Every visitor sees the same values.
- **Keeps the page's three sections (summary, chart, table) internally consistent** by using the same Mecca-local-noon canonical instant that UNIFICATION-1 introduced for city-specific pages.

---

## 2. Reference adopted

| Field | Value | Source |
|---|---|---|
| City label | `Mecca` (`مكة المكرمة` in AR) | Project default |
| IANA timezone | `Asia/Riyadh` | Matches server.js `FAMOUS_CITY_OVERRIDES.mecca` |
| Latitude | `21.4225` | Matches server.js `FAMOUS_CITY_OVERRIDES.mecca` |
| Longitude | `39.8262` | Matches server.js `FAMOUS_CITY_OVERRIDES.mecca` |
| Canonical sampling instant | `12:00:00` Asia/Riyadh local time (i.e. `09:00:00Z`) | Matches city-pages convention from UNIFICATION-1 |

---

## 3. Files changed

| File | Change | Hunks |
|---|---|---|
| `js/app.js` | (1) Added `_isMoonTodayPage` URL detector; (2) injected Mecca defaults into `_metaLat`/`_metaLng`/`_metaTz` when on `/moon-today` AND no other city context; (3) extended unification gate from `_tz && _citySlug` → `_tz && (_citySlug || _isMoonTodayPage)`. | 2 |
| `index.html` | Cache-buster bump `app.js?v=679` → `app.js?v=680` (both `<link rel="preload">` and `<script defer src=...>`). | 2 |
| `reports/moon-today-makkah-canonical-reference-1-closure.md` | New closure report (this file). | new file |

**Files explicitly NOT touched (per user constraints):**

- `js/moon.js` (MoonCalc) — algorithm unchanged.
- `js/moon-chart.js` — chart already accepts `tz` from UNIFICATION-1; no change needed since the call site in `updateMoonInfo` already passes `_tz` (now set to `Asia/Riyadh` for `/moon-today`).
- `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `db/hijri/umm-al-qura.json` — Hijri logic unchanged.
- `server.js` — no SSR / SEO / sitemap / canonical / hreflang / JSON-LD changes.
- `css/style.css` — no UI polish in this commit (per "no UI polish in fix commit" rule).
- All `/moon-in-{city}/*` page-class behavior — preserved exactly as UNIFICATION-1 left it (those pages already had `_tz && _citySlug` both set, so the new `_isMoonTodayPage` branch never fires for them).

---

## 4. Before / After values for `/moon-today` (probe date 2026-05-23)

**Before fix — visitor-dependent, three different numbers:**

| Section | Sampling instant (depends on visitor) | Illumination |
|---|---|---|
| Summary | `new Date()` at page load (UTC clock) → e.g. `2026-05-23T12:11:53Z` | **50.57 %** |
| Chart center | `new Date(); setHours(12,0,0,0)` browser-local noon → varies by tz | **49.13 %** (for a UTC+3 browser) or different for other tz |
| Forecast table today row | already city-local noon (was already correct) | **49.13 %** |

Because `_tz` and `_citySlug` were both empty on `/moon-today`, the unification gate evaluated to `false` and each section fell through to its own legacy sampling — exactly the same 3-way mismatch UNIFICATION-1 had fixed for city pages.

**After fix — Mecca-anchored, all three identical:**

| Section | Sampling instant | Illumination |
|---|---|---|
| Summary | `2026-05-23T09:00:00Z` (Mecca / Asia/Riyadh local noon) | **49.13 %** |
| Chart center | `2026-05-23T09:00:00Z` (chart receives `tz='Asia/Riyadh'`, uses centerDate + N×86400000ms) | **49.13 %** |
| Forecast table today row | `2026-05-23T09:00:00Z` (city-local noon via existing `getForecast` path) | **49.13 %** |

→ **All three identical. Mecca-anchored. Deterministic regardless of visitor location, timezone, or geolocation permission.**

---

## 5. Yes — all `/moon-today` sections are now identical

Confirmed via mathematical simulation (Node + MoonCalc, same logic as the production client):

```
BEFORE FIX (browser-dependent):
  Summary (now)         : 2026-05-23T12:11:53Z → 50.57%
  Chart  (browser noon) : 2026-05-23T09:00:00Z → 49.13%
  Table  (city-local)   : 2026-05-23T09:00:00Z → 49.13%
  → 3-way mismatch reproduced

AFTER FIX (Mecca canonical):
  Summary               : 2026-05-23T09:00:00Z → 49.13%
  Chart  center         : 2026-05-23T09:00:00Z → 49.13%
  Table  today-row      : 2026-05-23T09:00:00Z → 49.13%
  → all identical, Mecca-anchored, deterministic regardless of visitor
```

Phase, moon age, moonrise, and moonset on `/moon-today` are similarly unified at the same canonical instant (they reuse the same `today` Date passed to MoonCalc / SunCalc helpers downstream of the `_moonCityLocalNoon(...)` reassignment).

---

## 6. Regression tests

### 6.1 Route-availability smoke (HTTP 200 expected on all):

```
GET /moon-today                       → 200
GET /en/moon-today                    → 200
GET /moon-in-riyadh                   → 200
GET /en/moon-in-riyadh                → 200
GET /moon-in-jeddah                   → 200
GET /moon-today-in-riyadh             → 200
GET /hijri-calendar/1447              → 200
GET /prayer-times-in-riyadh           → 200
GET /qibla                            → 200
GET /                                 → 200

10 / 10 PASS, 0 failures
```

### 6.2 SSR title unchanged on `/moon-today` (no SEO mutation):

```
$ curl -s http://localhost:4004/moon-today | grep -oP '<title>[^<]+</title>' | head -1
<title>حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري</title>
```

Identical to pre-fix title. No SEO / canonical / hreflang / JSON-LD changes.

### 6.3 Carry-forward suites:

All previously-passing tests still pass:
- `reports/moon-city-illumination-unification-1-closure.md` regression set — still PASS.
- `reports/hijri-umm-al-qura-final-qa-1.md` regression set — still PASS.
- 338/338 production-verifier — still PASS.

### 6.4 Syntax check:

```
$ node -c js/app.js
(exit 0, no output)
```

---

## 7. Confirmation: `/moon-in-{city}` pages NOT affected

The new `_isMoonTodayPage` branch is gated by **two compounded conditions** that are mutually exclusive with city pages:

```javascript
if (_isMoonTodayPage
    && _metaLat == null && _metaLng == null && !_metaTz
    && !_citySlug && !_urlCoords) {
    /* Mecca defaults injected */
}
```

For **all** `/moon-in-{city}/*` routes:

- `_isMoonTodayPage` is `false` (URL pattern doesn't match) → branch skipped on URL grounds alone.
- Additionally `_citySlug` is non-empty (parsed from URL), `_metaTz` is set from `<meta name="moon.city.tz">`, and on dated routes `_metaLat`/`_metaLng` are set from `<meta name="geo.position">`.

So the new code is **structurally impossible to fire on city pages**, even before considering URL pattern detection. The existing UNIFICATION-1 city-pages fix continues to operate via its original `_tz && _citySlug` arm of the gate.

**Live verification — `/moon-in-riyadh` (Asia/Riyadh, Riyadh coords) at probe time `2026-05-23T11:48Z`:**

| Section | Sampling instant | Illumination |
|---|---|---|
| Summary | `2026-05-23T09:00:00Z` (Riyadh local noon) | 49.13 % |
| Chart center | `2026-05-23T09:00:00Z` | 49.13 % |
| Forecast table today row | `2026-05-23T09:00:00Z` | 49.13 % |

All three identical ✓. UNIFICATION-1 city-pages behavior preserved byte-for-byte.

---

## 8. What this change does NOT do

- Does NOT change MoonCalc (`js/moon.js`) algorithm.
- Does NOT change Umm al-Qura table or any Hijri logic.
- Does NOT change `/moon-in-{city}/*` page behavior.
- Does NOT add any external API, dependency, or `npm install`.
- Does NOT touch SSR, server.js, sitemap, canonical, hreflang, JSON-LD, or any SEO meta.
- Does NOT touch CSS, layout, spacing, or visible UI text on `/moon-today`.
- Does NOT start any UI polish phase (per "no UI polish in fix commit" rule).
- Does NOT use browser timezone.
- Does NOT use browser geolocation.
- Does NOT use last-visited-city sessionStorage.
- Does NOT modify the auxiliary widgets at `app.js:3959 / 3987 / 9003` (out of scope, separate pages).

---

## 9. Acceptance Criteria — final check-off

| # | Criterion | Status |
|---|---|---|
| 1 | `/moon-today` anchored to Makkah (Mecca canonical reference) | ✅ PASS |
| 2 | Timezone adopted = `Asia/Riyadh` | ✅ PASS |
| 3 | Summary / Chart / Table illumination values are identical (49.13 % at probe instant) | ✅ PASS |
| 4 | No browser timezone dependency | ✅ PASS |
| 5 | No geolocation dependency | ✅ PASS |
| 6 | No sessionStorage / last-visited-city dependency | ✅ PASS |
| 7 | No `new Date()` page-load-instant used as illumination sampling point | ✅ PASS |
| 8 | `/moon-in-{city}` pages unaffected (verified Riyadh 3×49.13 %) | ✅ PASS |
| 9 | MoonCalc (`js/moon.js`) unchanged | ✅ PASS |
| 10 | Umm al-Qura table + Hijri logic unchanged | ✅ PASS |
| 11 | `server.js` unchanged | ✅ PASS |
| 12 | SEO / canonical / hreflang / JSON-LD / sitemap unchanged | ✅ PASS |
| 13 | No new dependencies | ✅ PASS |
| 14 | No external API added | ✅ PASS |
| 15 | No UI polish started in this commit | ✅ PASS |
| 16 | Tests passed (10/10 routes 200, SSR title stable, `node -c` clean) | ✅ PASS |

**16 / 16 criteria met.**

---

## 10. Verdict

✅ **Implemented as scoped, tested as scoped, no collateral changes.**

`/moon-today` now shows a single, stable, Mecca-anchored set of moon values to every visitor regardless of their device's timezone or geolocation. Summary / chart / forecast table all sample at the exact same instant (`2026-05-23T09:00:00Z` for today's probe). City-pages behavior is preserved exactly. SEO, layout, and copy are untouched.

🛑 No further code changes (UI polish, etc.) will be made without a new explicit user request.

---

## 11. Closure log

- **2026-05-23** — Implementation commit `1b54433` landed on `origin/main`.
- **2026-05-23** — User reviewed results and approved closure verbatim (Summary 49.13 % / Chart 49.13 % / Table 49.13 % all confirmed; `/moon-in-{city}` confirmed unaffected; MoonCalc / Umm al-Qura / server.js / SEO / dependencies all confirmed untouched; no UI polish started).
- **2026-05-23** — This report updated with `Status: CLOSED — user-approved 2026-05-23` + acceptance-criteria table. Docs-only closure commit pushed to `origin/main`.

No further phase is to be started after this closure without a new explicit user request.
