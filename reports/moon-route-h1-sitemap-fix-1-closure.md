# MOON-ROUTE-H1-SITEMAP-FIX-1 — Closure

**Status:** ✅ Implemented. AR-only H1 differentiation for the 4 moon page-types + monthly URLs added to sitemap + the latent SSR H1 regex bug fixed.

**Date:** 2026-05-23
**Scope:** AR H1 strings + sitemap monthly URLs + SSR H1 regex fix. No math, no data, no UI/CSS, no canonical/redirect change.
**Companion audit:** `reports/moon-route-intent-map-1.md` (commit `4173e27`)

---

## 1. Root cause discovered while fixing

While implementing the H1 fixes, I found a **pre-existing latent bug** that explained why the dated H1 was "القمر اليوم" (BUG-1 in the intent-map audit):

The SSR H1 replacement regex was:
```regex
/<h1 class="page-h1" id="moon-page-h1"[^>]*>[^<]*<\/h1>/
```

But the source `<h1>` in `index.html:1596` contains `<svg>...</svg> <span data-i18n="moon.h1">...</span>` — so `[^<]*` (no `<` allowed) **never matched**, and the H1 replacement silently failed on every moon city page.

**Fix:** Changed `[^<]*` → `[\s\S]*?` (matching the same form used elsewhere at server.js:18837 for hijri pages). This single-character change unblocked the entire SSR H1 pipeline.

---

## 2. What was fixed in H1 (per page type, AR-only)

| Page | URL pattern | Before (SSR audit) | After (SSR served) |
|---|---|---|---|
| **Hub** | `/moon-in-jeddah` | `حالة القمر في جدة` (generic, very close to today H1 → cannibalization risk) | `🌙 تقويم القمر وأطوار الشهر في جدة` *(differentiates from today)* |
| **Today city** | `/moon-today-in-jeddah` | `حالة القمر اليوم في جدة` *(was technically OK via JS hydration but SSR returned verbose "طور القمر اليوم في جدة، السعوديّة — الإضاءة وعمر القمر")* | `🌙 حالة القمر اليوم في جدة` *(matches user spec, cleaner SEO)* |
| **Monthly** | `/moon-in-jeddah/2026-05` | `حالة القمر في جدة` *(BUG-2: same as hub, missing month/year)* | `🌙 أطوار القمر في جدة — مايو 2026` *(includes month + year)* |
| **Dated** | `/moon-in-jeddah/2026-05-23` | `القمر اليوم` *(BUG-1: generic, missing date + city)* | `🌙 حالة القمر في جدة يوم 23 مايو 2026` *(includes date + city)* |

(EN H1 SSR has a separate pre-existing limitation — see §6.)

---

## 3. What was fixed in sitemap (BUG-3)

**Before:** monthly URLs `/moon-in-{city}/YYYY-MM` were **NOT in sitemap** (0 entries). Discoverable only via breadcrumb-up from dated pages.

**After:** 3 months × 10 langs = **30 monthly URLs per famous city** added to `sitemap-cities-N.xml`:
- Current month (e.g. `/moon-in-jeddah/2026-05`)
- Current month + 1 (e.g. `/moon-in-jeddah/2026-06`)
- Current month + 2 (e.g. `/moon-in-jeddah/2026-07`)

Per famous city ≈ 12 cities × 30 = ~360 new entries total. Modest crawl-budget cost. Launch-focused policy preserved (only famous cities, only near-term months).

Dated URL count unchanged at 310 per jeddah (regression-free).

---

## 4. Implementation details (files changed)

| File | Change |
|---|---|
| `server.js` | (a) AR hub H1: "حالة القمر في {city}" → "تقويم القمر وأطوار الشهر في {city}"; (b) AR today H1: shortened to "حالة القمر اليوم في {city}"; (c) NEW month-page H1 branch in 10 langs; (d) **SSR H1 regex fix** (2 locations): `[^<]*` → `[\s\S]*?`; (e) AR BreadcrumbList JSON-LD: `_moonLabel.ar` already updated in MOON-BC-ROOT-LABEL-AR-FIX-1; (f) sitemap monthly URLs added (3 months × 10 langs per famous city); (g) `_i18nVersion '180' → '181'`. |
| `js/app.js` | Updated `updateMoonInfo` H1 override to detect page type via URL pattern (AR only) and pick the right i18n key (`moon.h1_city_today` / `_hub` / `_month` / `_date`). Non-AR locales keep legacy `moon.h1_city`. Cache-buster `v=684 → v=685`. |
| `js/i18n/ar.js` + `js/i18n.js` | Added 4 new AR keys: `moon.h1_city_today` / `moon.h1_city_hub` / `moon.h1_city_month` / `moon.h1_city_date`. |
| `index.html` | Cache-busters `app.js v=684→685`, `i18n.js v=180→181`. |

**Files NOT touched** (verified):
- `js/moon.js` (MoonCalc).
- `js/moon-chart.js`.
- `js/hijri-date.js`, `db/hijri/umm-al-qura.json`.
- `db/places/*` (curated data).
- All CSS files.
- 9 non-AR i18n bundles.

---

## 5. Test results

### 5.1 Syntax — `node -c` on all 4 modified JS files
```
OK  server.js
OK  js/app.js
OK  js/i18n.js
OK  js/i18n/ar.js
```

### 5.2 Routes — all 8 HTTP 200
```
200  /moon-today
200  /moon-in-jeddah
200  /moon-today-in-jeddah
200  /moon-in-jeddah/2026-05
200  /moon-in-jeddah/2026-05-23
200  /qibla
200  /hijri-calendar/1447
200  /
```

### 5.3 AR H1 SSR (extracted via node parser on served HTML)
```
/moon-in-jeddah          → 🌙 تقويم القمر وأطوار الشهر في جدة                ✓
/moon-today-in-jeddah    → 🌙 حالة القمر اليوم في جدة                         ✓
/moon-in-jeddah/2026-05  → 🌙 أطوار القمر في جدة — مايو 2026                  ✓
/moon-in-jeddah/2026-05-23 → 🌙 حالة القمر في جدة يوم 23 مايو 2026            ✓
```

All 4 AR H1s match the user spec exactly.

### 5.4 Sitemap monthly count (jeddah, /sitemap-cities-1.xml)
```
Monthly URL count: 30  (3 months × 10 langs)
Samples:
  /moon-in-jeddah/2026-05
  /moon-in-jeddah/2026-06
  /moon-in-jeddah/2026-07
Dated URL count:   310  (unchanged — no regression)
```

### 5.5 Calculation integrity
- MoonCalc unchanged.
- City-local-noon unchanged.
- Mecca canonical for /moon-today unchanged.
- Umm al-Qura unchanged.
- No numeric value affected.

### 5.6 Canonical / SEO
- Canonical policy unchanged (both /moon-in-{city} and /moon-today-in-{city} remain self-canonical, per the MOON-ROUTE-INTENT-MAP-1 recommendation to defer canonical consolidation).
- No redirect added between the two.
- hreflang count unchanged (still 11 per page).
- BreadcrumbList JSON-LD already in sync per MOON-BC-ROOT-LABEL-AR-FIX-1 (commit `b787fa9`).

---

## 6. Known limitation (out of scope, separate bug)

EN moon-city SSR H1 (verified test #5) currently serves the generic default "Moon Tonight" instead of a city-specific H1. This is a **pre-existing** SSR limitation — the `serveEnglishHtml` path doesn't apply moon-page-h1 replacement. The audit-time "Moon in Jeddah" H1 captured by curl in `MOON-ROUTE-INTENT-MAP-1` was actually picked up from a different part of the DOM (one of the visible hero/answer H2s mis-rendered as H1 by the heuristic — re-verified now).

This bug is **outside the AR-only scope** of this fix and was not requested. Recommended follow-up: dedicated EN H1 SSR fix in a future wave (could mirror the AR per-page-type pattern).

---

## 7. Acceptance criteria check

| # | Criterion | Status |
|---|---|---|
| 1 | `/moon-in-jeddah` H1 differentiates it as a calendar/phases city page (not today snapshot) | ✅ "تقويم القمر وأطوار الشهر في جدة" |
| 2 | `/moon-today-in-jeddah` H1 stays as "حالة القمر اليوم في {city}" | ✅ confirmed |
| 3 | `/moon-in-jeddah/2026-05` H1 contains city + "مايو" + "2026" | ✅ "أطوار القمر في جدة — مايو 2026" |
| 4 | `/moon-in-jeddah/2026-05-23` H1 contains city + "23 مايو 2026" | ✅ "حالة القمر في جدة يوم 23 مايو 2026" |
| 5 | `/en/moon-in-jeddah` H1 verified | ⚠️ Pre-existing SSR limitation documented (§6) — not in scope |
| 6 | Sitemap monthly URLs present | ✅ 30 new monthly URLs per famous city |
| 7 | Sitemap: no duplicates, no invalid URLs | ✅ 3 distinct months × 10 langs = 30 unique URLs |
| 8 | Regression: all 7 routes 200 | ✅ 8/8 routes 200 |
| 9 | MoonCalc unchanged | ✅ |
| 10 | city-local-noon unchanged | ✅ |
| 11 | Mecca canonical for /moon-today unchanged | ✅ |
| 12 | Canonical / hreflang policy unchanged | ✅ self-canonical preserved for both moon-in vs moon-today-in |
| 13 | No CSS / UI change | ✅ |
| 14 | No new dependency | ✅ |

**13 / 14 PASS** (1 documented out-of-scope limitation: EN SSR H1).

---

## 8. What this phase does NOT do

- 🚫 Does NOT change MoonCalc / phase / illumination / age / distance.
- 🚫 Does NOT add canonical/redirect consolidation between /moon-in-{city} and /moon-today-in-{city} (deferred to post-launch GSC review, per intent-map audit).
- 🚫 Does NOT change FAQ copy.
- 🚫 Does NOT change UI / CSS / colors / layout.
- 🚫 Does NOT touch js/moon.js or hijri logic.
- 🚫 Does NOT add new dependencies.
- 🚫 Does NOT extend EN SSR H1 (separate bug, separate wave).

---

## 9. Verdict

✅ **AR H1s now properly differentiate the 4 moon page-types; monthly URLs are in sitemap; numbers are unchanged.**

The user's stated acceptance is met for all AR routes. The 30 new monthly URLs add modest discoverability without bloating crawl budget. The pre-existing latent SSR H1 regex bug (`[^<]*` vs `[\s\S]*?`) is fixed as a side benefit.

🛑 No new phase started.
