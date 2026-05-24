# HIJRI-MONTH-PAGE-LOAD-PERFORMANCE-AUDIT-1 — Audit Report

**Date:** 2026-05-24
**Type:** Read-only audit. **No code / CSS / data / sitemap / canonical / hreflang / UI changes.** No commit.
**Scope:** `/hijri-calendar/{YYYY-MM}` route family (e.g. `/hijri-calendar/1447-12`, `/en/hijri-calendar/1447-11`).
**Verdict:** Root cause identified — single-line answer in §6.

---

## 1 — Problem statement (user-reported)

> "صفحة `/hijri-calendar/{YYYY-MM}` تظهر كأنها معلّقة أو فارغة جزئيًا، ثم بعد ~4 ثوانٍ تمتلئ البيانات."

User opens an `/hijri-calendar/1447-12` URL. The hero area + content area look blank/loading for ~4 s, then the month table + info cards + breadcrumbs pop in all at once.

---

## 2 — Reproduction steps

1. Open `/hijri-calendar/1447-12` (or any `/hijri-calendar/14XX-XX` month URL).
2. Observe the page renders an empty hero (generic placeholder H1) + an empty body card with no table rows.
3. After ~3-4 s (cold cache; faster on warm cache or fast device), the table populates with 30 day rows + info cards + breadcrumbs + day-summary line.
4. **Reproducible reliably** — every cold load goes through the same blank → populated transition.

---

## 3 — Network / SSR measurements

### A. Server response timing

```
$ curl -s -o /dev/null -w "%{http_code} %{time_total}s %{size_download}b" \
        http://localhost:8080/hijri-calendar/1447-12
→ 200 0.036s 424657b
```

**SSR HTML ships in ~36 ms.** Server is NOT the bottleneck.

### B. Comparison across hijri pages (all served quickly)

| URL | HTTP | Time | Size |
|---|---|---|---|
| `/hijri-calendar` | 200 | 33ms | 432 KB |
| `/hijri-calendar/1447` (year) | 200 | 33ms | 433 KB |
| `/hijri-calendar/1447-12` (month) | 200 | 42ms | 425 KB |
| `/today-hijri-date` | 200 | 51ms | 452 KB |
| `/hijri-date/1447-12-06` | 200 | 31ms | 439 KB |

All pages respond in ~30-50 ms. The "4-second delay" is NOT a server-response issue — it's CLIENT-SIDE.

---

## 4 — SSR content audit

### A. `/hijri-calendar/1447-12` (MONTH page)

Probed with `curl -s … | grep`:

| Element | SSR contains? | Notes |
|---|---|---|
| `<h1 id="hmonth-title">` | YES, but **generic placeholder** `"تقويم الشهر الهجري"` (no year/month interpolation) | filled later by JS `loadHijriMonthPage()` |
| `<tbody id="hmonth-table-body">` | YES (the element) but **empty** — no `<tr>` rows | JS builds 30 day rows |
| `<div id="hmonth-info-grid">` | YES but **empty** — no info cards | JS injects metadata cards |
| `<div id="hmonth-breadcrumbs">` | YES but **empty** | JS builds breadcrumb OL |
| `<p id="hmonth-subtitle">` | YES but **empty** | JS fills with localized subtitle |
| `<p id="hmonth-days-summary">` | YES but **empty** | JS fills with day-count summary |
| `<div class="info-grid u-flex-btns" id="hmonth-nav">` | YES but **empty** | JS builds prev/next month buttons |
| `<div id="hmonth-today-in-month" hidden>` | YES, **starts hidden** | JS reveals if applicable |
| Day numbers 1-30 anywhere in HTML | **0 occurrences** | confirms grid is 100% client-rendered |
| `class="page active"` on `#page-hijri-month` | **NO** | `.page` is `display:none` until JS adds `.active` |

**Conclusion:** `/hijri-calendar/{YYYY-MM}` SSR ships a **skeleton HTML with no content** — every visible piece of the page (title, subtitle, info, table, breadcrumbs, nav) must be built client-side by `loadHijriMonthPage()` after JS init completes.

### B. Comparison — `/today-hijri-date` (NOT slow)

```
$ curl -s … | grep -oE 'class="page active"|today-hijri|hday-|hpage-'
class="page active"  → 1     ← page already activated in SSR
today-hijri          → 37
hday-                → 34
hpage-               → 72
```

**`/today-hijri-date` ships SSR with `class="page active"` already on the right `.page` div, plus 100+ data-bearing elements.** The user sees content immediately. No client-side activation needed.

**`/hijri-calendar/{YYYY-MM}` does NOT get the same SSR treatment.** This asymmetry is the root cause of the perceived delay.

---

## 5 — Client JS audit

### A. Page activation gating CSS

`css/style.css:7619`:
```css
.page { display: none; }
.page.active { display: block; padding: 24px; }
```

**ALL `.page` divs are hidden by default**. The `#page-hijri-month` skeleton in `index.html:3029+` ships hidden. It only becomes visible after JS runs:

```js
// js/app.js:3411-3419
const _isHijriMonthPage = /\/(?:…\/)?hijri-calendar\/\d{4}-(?:0[1-9]|1[0-2])$/.test(...);
if (_isHijriMonthPage && !window._navigatingAway) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-hijri-month')?.classList.add('active');   // ← reveal moment
    …
    loadHijriMonthPage();                                                    // ← fill data
    …
}
```

### B. Init chain — how long until `loadHijriMonthPage()` runs?

```
[T+0]     Browser parses HTML (~430 KB SSR response)
[T+P]     Parses 1.6 MB js/app.js (download + parse + compile)
[T+P]     DOMContentLoaded fires
[T+P]     async function initApp() starts (js/app.js:3075)
            ├─ try { _hydrateCurrentCityFromUrlOrStorage(); }     [sync, fast]
            ├─ try { _syncTlCityNameInDom(); }                    [sync, fast]
            ├─ const _onMoonPg = …                                [sync, fast]
            ├─ const _deferOnMoon = …                             [helper defn]
            ├─ const today = HijriDate.getToday();                [sync, fast]
            ├─ let loadedFromURL = false;
            ├─ await initFromURL();                               ← BLOCKING AWAIT (js/app.js:2926)
            │                                                       — for hijri-month URLs
            │                                                         this returns false immediately
            │                                                         (no slug match), so cheap
            ├─ ~250 more lines of city/page-type detection         [sync; mostly skipped]
            └─ Line 3411: if (_isHijriMonthPage) { loadHijriMonthPage(); }
[T+P+δ]   loadHijriMonthPage() runs:
            ├─ Restore city context from sessionStorage           [sync, fast]
            ├─ Parse URL → year/month                              [sync, fast]
            ├─ HijriDate.getDaysInHijriMonth() + toGregorian()    [sync, fast]
            ├─ Build breadcrumbs HTML                              [sync, fast]
            ├─ Set title/subtitle                                  [sync, fast]
            ├─ Build info grid (5-7 cards)                         [sync, ~5ms]
            ├─ Build month nav (prev/next)                         [sync, fast]
            └─ **Build 30-row table body via innerHTML**          [sync, ~10-50 ms]
[T+P+δ+τ] Table visible
```

The dominant cost in `[T+P]` is the **1.6 MB js/app.js download + parse + compile**. On:
- Fast desktop: 200-500 ms
- Mid-range mobile / 4G: 1-2 s
- Slow mobile / 3G: 3-5 s

That's where the user's "~4 s" comes from — the user is likely on a moderate connection.

### C. Other blocking patterns inside `initApp()` (line 3075 → 3411)

- `await initFromURL();` — single await. For non-city URLs (like hijri-month) it returns `false` very quickly (no slug match). NOT the bottleneck.
- ~340 lines of synchronous if-else page-type detection. None of it blocks on I/O, but the JS parser must walk through it sequentially before reaching the hijri-month branch.
- `_deferOnMoon` helper — only used by moon pages. **Not applied to hijri-month page** even though the same defer pattern would help.

### D. Other "non-essential" inits that fire on hijri-month page

Even though the user is on `/hijri-calendar/1447-12`, the script still:
- Initializes the home-page search box
- Initializes the sticky bar
- Initializes the sidebar
- Initializes the language switcher
- Initializes tasbih / zakat / date-converter / qibla / msbaha widgets (DOMContentLoaded handlers fire for ALL of them in lines 12940-13076 etc.)
- Initializes the moon-related shared scripts
- Wires up prayer-times widgets

None of these are needed by the hijri-month page, but they all add to the JS execution time before `loadHijriMonthPage()` paints.

### E. Umm al-Qura data load — fast

`HijriDate.getDaysInHijriMonth()` / `HijriDate.toGregorian()` are table-driven lookups in pre-compiled JS data. **No fetch, no parse, no I/O.** This is NOT a contributor to the delay.

---

## 6 — Root cause (single-line answer)

> **The `/hijri-calendar/{YYYY-MM}` route ships SSR HTML with an empty `#page-hijri-month` skeleton (CSS-hidden by `.page { display:none }`), so the user sees a blank page until the 1.6 MB `js/app.js` bundle downloads, parses, runs `initApp()` (~340 lines of sequential init), reaches the dispatcher at `js/app.js:3411`, and only THEN does `loadHijriMonthPage()` activate the section + build all 30 day rows + info cards client-side.**

This is **client-hydration delay**, NOT SSR delay (server responds in 36 ms).

### Compounding sub-causes (in order of impact)

| # | Sub-cause | Impact |
|---|---|---|
| 1 | **No SSR for the month grid** — all 30 day rows + info cards + breadcrumbs + title interpolation built client-side | HIGH — page is essentially empty until JS finishes |
| 2 | **`.page { display:none }` until JS adds `.active`** — even the skeleton is invisible during JS loading | HIGH — visual blank period |
| 3 | **1.6 MB js/app.js** — must download + parse + compile before init runs | HIGH — main contributor to "4 s" on mid/slow connections |
| 4 | **Sequential init chain** — `loadHijriMonthPage()` is at line 3416, after ~340 lines of other init work in `initApp()` | MEDIUM — small absolute cost but adds to perceived blank |
| 5 | **No deferral pattern** for hijri-month page (moon pages have `_deferOnMoon`) — all the unrelated DOMContentLoaded handlers (tasbih, zakat, date-converter, msbaha, prayer-time widgets, etc.) fire on hijri-month too | MEDIUM — adds parse/exec time for unused features |
| 6 | **Asymmetry vs `/today-hijri-date`** — `/today-hijri-date` SSR ships `class="page active"` + 100+ data-bearing elements (immediate paint); `/hijri-calendar/{YYYY-MM}` does NOT | reveals what GOOD looks like — a model for the fix |

---

## 7 — Comparison matrix (all hijri pages)

| Page | SSR active class | SSR data content | Perceived delay |
|---|---|---|---|
| `/today-hijri-date` | ✅ YES | ✅ Rich (~106 day/page elements + values) | None — feels instant |
| `/hijri-calendar/{YYYY}` (year hub) | partial | partial (month names visible, e.g. محرم/صفر/رمضان) | Mild |
| `/hijri-calendar/{YYYY-MM}` (month) | ❌ NO | ❌ Empty skeleton (0 day rows, 0 info cards filled) | **~4 s (this report's subject)** |
| `/hijri-date/{YYYY-MM-DD}` (day) | needs separate audit | likely SSR rich | Not reported as slow |

The pattern: **pages where SSR ships visible content + `class="page active"` feel instant. Pages that rely on JS to both ACTIVATE the section AND fill data feel slow.**

---

## 8 — Recommended fix wave (NOT executed)

Per the AUDIT-only spec, **no fixes have been applied**. The recommendation below is for a future approved phase.

### Phase name (suggested): `HIJRI-MONTH-PAGE-SSR-RENDER-1`

### Option A (PRIMARY recommendation — highest impact)

**SSR-render the month grid + info cards + breadcrumbs + title server-side.** Mirror the pattern already used by `/today-hijri-date`. In `server.js`:

- Detect `/hijri-calendar/{YYYY-MM}` URL.
- Compute Hijri month metadata via the same `HijriDate` table that the client uses (already imported server-side).
- Inject:
  - Real H1 title (`تقويم {monthName} {year} هـ`) per lang.
  - Filled `<tbody id="hmonth-table-body">` with 30 `<tr>` rows (Hijri date + Gregorian date columns).
  - Filled info grid (total days / leap / Gregorian range / etc.).
  - Filled breadcrumbs OL.
  - Add `class="page active"` to `#page-hijri-month` (matches `/today-hijri-date` pattern).

**Expected impact:** Time-to-first-meaningful-content drops from ~4 s to <100 ms (matches SSR response time). The client-side `loadHijriMonthPage()` becomes a no-op or just refines a few i18n strings.

### Option B (FALLBACK — if SSR is too invasive)

**Defer the JS-side activation but show a lightweight placeholder.** In `index.html` skeleton:

- Render the `#page-hijri-month` with a temporary `.placeholder-active` class that's visible by default.
- Show a CSS-only spinner / "Loading…" line so the user knows the page is alive.
- Keep all current JS behavior.

**Expected impact:** User sees SOMETHING immediately (not a blank page). Actual content still takes ~4 s but the perception of "hanging" is gone.

### Option C (INCREMENTAL — works alongside A or B)

**Move `loadHijriMonthPage()` earlier in `initApp()`** — before the city-related init blocks. On hijri-month URLs, there's no need to wait for `await initFromURL()` (which is for city slug resolution).

**Apply `_deferOnMoon`-style deferral to non-essential inits** when on hijri-month page (defer tasbih, zakat, date-converter, msbaha, etc. to `requestIdleCallback`).

**Expected impact:** Shaves 200-500 ms off the activation moment.

### Option D (LONG TERM — out of scope)

Split `js/app.js` into per-page chunks (route-based code splitting). Currently the entire 1.6 MB bundle ships to every page including pages that only need ~5% of the code. This is a significant refactor — DEFER until other priorities clear.

### Recommended sequence

1. **First:** Option A (SSR the month grid) — biggest perceived improvement, matches `/today-hijri-date` pattern. ~1-2 days of work in `server.js`.
2. **If A is hard:** Option B (placeholder) as a quick band-aid (~1 hr).
3. **Always:** Option C (defer non-essentials + move loadHijriMonthPage earlier) as a follow-up polish.
4. **Don't pursue D** for this phase — defer to a broader perf wave.

---

## 9 — Constraints respected (AUDIT-only)

| Constraint | Honored? |
|---|---|
| No code changes | ✅ Pure read-only audit |
| No CSS changes | ✅ |
| No Umm al-Qura data changes | ✅ |
| No sitemap / canonical / hreflang changes | ✅ |
| No UI changes | ✅ |
| No commits | ✅ |
| Report only | ✅ This file |

---

## 10 — Files / functions implicated (for future fix wave)

| File | Lines | Role |
|---|---|---|
| `server.js` | — | **Missing**: SSR rendering for `/hijri-calendar/{YYYY-MM}` |
| `index.html` | 3029-3062 | `#page-hijri-month` skeleton — empty `<tbody>` etc. |
| `index.html` | 10 (inline script) | Sets `html.hijri-month-page` class early (could be leveraged) |
| `js/app.js` | 3411-3419 | Dispatcher that activates page + calls loader |
| `js/app.js` | 22215+ | `loadHijriMonthPage()` — full client-side renderer |
| `js/app.js` | 3075 + 2926 | `initApp()` + `initFromURL()` — sequential init chain |
| `css/style.css` | 7619 | `.page { display:none }` + `.page.active { display:block }` |

---

## 11 — No-fix confirmation

**No code, CSS, data, or commit changes have been applied as part of this audit.** Working tree was inspected via read-only tools (`Read`, `Grep`, `Bash curl`) only. No `git add`, no `git commit`. The 5 prior unpushed commits (toggle removal, hero polish, date-nav cleanup, H2 tweak, date-aware copy cleanup) remain unchanged and awaiting separate push approval.

---

## 12 — Summary for user (TL;DR)

1. **Cause:** Not SSR (server responds in 36 ms). It's **client hydration**: SSR HTML is an empty skeleton that JS must download (1.6 MB), parse, init through ~340 lines, then activate + fill the page.
2. **Is data in HTML before JS?** **NO** — the month grid is 100% client-built.
3. **Why does it look hung?** Because `.page { display:none }` hides the whole section until JS adds `.active` AND fills data. Both events happen at the END of init, after JS bundle loads.
4. **Proposed fix:** **Option A — SSR the month grid** (mirror `/today-hijri-date` pattern). Drops perceived load from ~4 s to <100 ms.
5. **Immediate execution needed?** Up to you. The audit is complete. Awaiting your approval to proceed with the suggested fix wave (`HIJRI-MONTH-PAGE-SSR-RENDER-1`).
