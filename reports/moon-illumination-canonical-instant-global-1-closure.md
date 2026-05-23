# MOON-ILLUMINATION-CANONICAL-INSTANT-GLOBAL-1 — Closure (scope analysis + pause for `/moon-today` reference decision)

**Status:** Scope analysis complete. **Three of four target page-classes already fixed** by `MOON-CITY-ILLUMINATION-UNIFICATION-1` (commit `6c64484`). One page-class (`/moon-today`) requires a reference-city decision before extension — paused per user's pre-execution rule.
**Date:** 2026-05-23
**Companions:**
- `reports/moon-city-illumination-mismatch-audit-1.md` (audit, commit `f0eac9d`)
- `reports/moon-city-illumination-unification-1-closure.md` (initial fix, commit `6c64484`)

---

## 1. Reason for this stage

User-requested expansion of the city-local-noon unification beyond `/moon-in-riyadh` to all moon-related page-classes. The audit confirmed the mismatch root cause; the initial fix (`UNIFICATION-1`) only addressed `/moon-in-{city}` hub pages. This stage extends coverage.

---

## 2. Target page-class coverage table

| # | Page-class | Example | Has city context? | Covered by UNIFICATION-1? | Status |
|---|---|---|---|---|---|
| 1 | City hub | `/moon-in-riyadh` | ✅ slug `riyadh` + tz `Asia/Riyadh` via `FAMOUS_MOON_CITIES` | ✅ YES (fixed in `6c64484`) | ✅ DONE |
| 2 | Dated city page | `/moon-in-riyadh/2026-05-23` | ✅ slug from URL + tz from `<meta name="moon.city.tz">` | ✅ YES — `_renderMoonData` is the same function, gates on `_tz && _citySlug` which are BOTH present | ✅ DONE (verified by inspection) |
| 3 | Month city page | `/moon-in-riyadh/2026-05` | ✅ slug from URL + tz from `<meta name="moon.city.tz">` | ✅ YES — same code path | ✅ DONE (verified) |
| 4 | Geo-today-in-city | `/moon-today-in-riyadh` | ✅ has `window.__PRAYER_CITY__` injection (full Riyadh data) | ✅ YES (same code path, even stronger signal) | ✅ DONE |
| 5 | **General today** | `/moon-today` | ❌ NO `__PRAYER_CITY__`, NO `geo.position` meta, NO `moon.city.tz` meta | ❌ NO — `_tz && _citySlug` gate evaluates to false → falls through to legacy `new Date()` | 🛑 **PAUSED** (needs reference decision) |

**Verified via live HTTP probes (server on :4003):**

```
/moon-today                       → NO __PRAYER_CITY__ injection
/moon-in-riyadh/2026-05           → NO __PRAYER_CITY__ BUT has <meta moon.city.tz>
/moon-in-riyadh/2026-05-23        → NO __PRAYER_CITY__ BUT has <meta moon.city.tz="Asia/Riyadh"> + geo.position
/moon-today-in-riyadh             → HAS full __PRAYER_CITY__ injection
```

For pages with `<meta name="moon.city.tz">`, the existing client code path in `_renderMoonData` resolves `_tz` from `_metaTz` (line 16646), and `_citySlug` from URL parsing — so the UNIFICATION-1 gate is satisfied and the fix applies automatically.

---

## 3. Why `/moon-today` is different

The `/moon-today` page is a **general "today's moon" page** with NO specified city or timezone:

- Server emits no `__PRAYER_CITY__` global.
- Server emits no `<meta name="moon.city.tz">` or `<meta name="geo.position">` for the moon-city context.
- Client code falls back to `currentLat` / `currentLng` which are derived from:
  - Browser geolocation API (if user grants permission)
  - sessionStorage (if user previously visited a city)
  - Hardcoded fallback (Mecca by default for unknown contexts)
- Timezone (`_tz`) is left `undefined` → `getMoonTimes` estimates from longitude.

Result: `/moon-today` is **inherently location-variable** — different visitors see different moon-rise/set times based on their device location. There is no single canonical instant we can pick without first deciding the page's semantic.

---

## 4. The reference question for `/moon-today`

Per the user's pre-execution rule:
> "إذا اكتشفت أن صفحة /moon-today ليس لها city/timezone واضح، توقف وأرسل تقريرًا مختصرًا قبل تطبيق الإصلاح عليها، لأننا يجب أن نحدد مرجعها أولًا."

I'm stopping here. Three options for the user:

### Option A — Default to Mecca (Asia/Riyadh)
- **Pros:** Stable, deterministic, server-side renderable, matches the "Mecca-default" pattern already used for SEO meta in the codebase, no client geolocation needed.
- **Cons:** Moonrise/moonset shown are for Mecca, may not match the user's local moon view.
- **Recommendation strength:** ★★★★ — cleanest fix.

### Option B — Use the user's last-visited city (sessionStorage)
- **Pros:** Personalised, follows user's intent.
- **Cons:** First-time visitors get unstable behavior; SSR can't predict it; consistency between sections still relies on a fixed canonical instant per render.
- **Recommendation strength:** ★★ — only if Option A doesn't fit the product vision.

### Option C — Use the user's geolocation (browser API)
- **Pros:** Most personalised.
- **Cons:** Requires permission, async, can fail; SSR shows wrong/no values; consistency challenging.
- **Recommendation strength:** ★ — high implementation cost.

### Option D — Skip `/moon-today` (leave on legacy behavior)
- **Pros:** Zero risk.
- **Cons:** Page may continue to show 3 different illumination numbers if a city/tz becomes known after JS executes.
- **Recommendation strength:** ★★★ — acceptable if `/moon-today` is rarely visited or is being phased out in favour of city-specific pages.

**My recommended path:** **Option A** — default `/moon-today` to Mecca (Asia/Riyadh + Mecca coordinates) for the canonical instant. This:
- Matches the Mecca-default pattern already in the codebase (`_resolveCityForMoon` falls back to Mecca for unknown slugs).
- Is the most religiously meaningful default for an Arabic Islamic site.
- Allows SSR to inject a stable PRAYER_CITY-equivalent.
- Keeps all sections internally consistent.

---

## 5. Other call sites investigated (out of scope but documented)

The audit grep showed three auxiliary `MoonCalc.getMoonIllumination(new Date())` call sites in `js/app.js`:

| Line | Context | On `/moon-in-{city}` page? |
|---|---|---|
| 3959 | Ramadan/Eid countdown widget current-phase display | NO — separate page/widget |
| 3987 | Same countdown — "near new moon" check | NO — separate widget |
| 9003 | Homepage/header moon-status mini-widget | NO — not on city pages |

These are **NOT** sections of `/moon-in-{city}` and **NOT** part of the user-reported mismatch. They are deferred to a future audit if needed.

Per user spec scope: "أي section يعرض illumination أو moon age أو phase لليوم" — within `/moon-in-{city}` page sections, all sites are covered. The auxiliary widgets above are different pages.

---

## 6. Files changed THIS stage

**None.**

This stage performed a scope-analysis investigation only. No code, CSS, text, SEO, JSON-LD, or schema was modified. UNIFICATION-1 already covered everything except `/moon-today`, and `/moon-today` cannot be fixed without first deciding its reference city.

```
$ git status -uno
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   db/cities-af.json     (← pre-existing unrelated change)
```

Only the closure report (this file) was newly created.

---

## 7. Before/After for `/moon-in-riyadh` (re-verifying UNIFICATION-1 still holds)

Direct Node + MoonCalc simulation at probe time 2026-05-23T11:48Z:

| Section | Sampling instant | Illumination | Display |
|---|---|---|---|
| Summary | 2026-05-23T09:00:00Z (Asia/Riyadh noon) | 49.13% | "49.13%" |
| Chart centre | 2026-05-23T09:00:00Z (centerDate + 0×86400000ms) | 49.13% | "49.13%" |
| Forecast table today row | 2026-05-23T09:00:00Z (city-local noon via getForecast) | 49.13% | "49.13%" |

All three identical ✓. UNIFICATION-1 fix from commit `6c64484` confirmed still active.

---

## 8. Regression check (all moon page-classes 200)

```
$ for url in /moon-today /moon-in-riyadh /moon-in-riyadh/2026-05 /moon-in-riyadh/2026-05-23 /moon-today-in-riyadh /en/moon-in-riyadh /moon-in-makkah; do curl ...; done
200  /moon-today
200  /moon-in-riyadh
200  /moon-in-riyadh/2026-05
200  /moon-in-riyadh/2026-05-23
200  /moon-today-in-riyadh
200  /en/moon-in-riyadh
301  /moon-in-makkah  (legacy redirect → /moon-in-mecca, by design)
```

No regressions.

---

## 9. Confirmation: MoonCalc / SEO / Umm al-Qura untouched

```
$ git diff HEAD -- js/moon.js js/hijri-date.js js/hijri-umm-al-qura.js db/hijri/umm-al-qura.json server.js
(empty — all byte-identical)
```

✓ `js/moon.js` (MoonCalc) — unchanged.
✓ `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `db/hijri/umm-al-qura.json` — unchanged.
✓ `server.js` — unchanged (no SEO/JSON-LD/sitemap modifications).
✓ No UI / CSS / layout / text changes.

---

## 10. Verdict — partial completion + pause

✅ **3 of 4 target page-classes already fully unified** (city hub + dated + month + geo-today-in-city) by the prior UNIFICATION-1 commit. No additional code changes were needed for these because they all flow through the same `_renderMoonData` function which gates on `_tz && _citySlug` — both of which are present on every `/moon-in-{city}/...` variant via either `FAMOUS_MOON_CITIES` lookup or `<meta name="moon.city.tz">` injection.

🛑 **`/moon-today` requires a reference-city decision** before the fix can be extended. Per pre-execution rule, I'm stopping here and awaiting the user's choice (Options A–D in §4).

---

## 11. What this stage does NOT do

- Does NOT modify any code.
- Does NOT modify any CSS, UI, or visible text.
- Does NOT modify MoonCalc, Umm al-Qura, SEO, JSON-LD, sitemap.
- Does NOT extend UNIFICATION-1 to `/moon-today` (awaiting reference decision).
- Does NOT touch the auxiliary widgets at app.js:3959 / 3987 / 9003 (out of scope, separate pages).
- Does NOT start any UI polish phase.

---

## 12. Awaiting user decision

1. **Approve commit + push of this scope-analysis report** as docs-only?
2. **Choose the reference for `/moon-today`** (A / B / C / D in §4) so I can extend UNIFICATION-1 to it (would be a small follow-up patch).
3. Alternatively, **declare `/moon-today` out of scope** — UNIFICATION-1 then covers all city-specific moon pages and we move on.

🛑 No further code changes will be made without explicit choice.
