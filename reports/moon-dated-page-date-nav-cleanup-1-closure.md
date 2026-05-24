# MOON-DATED-PAGE-DATE-NAV-CLEANUP-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** `/moon-in-{city}/{YYYY-MM-DD}` date pages only (the `#moon-date-nav` is CSS-gated to `html.moon-date-page`).
**Cache-busters:** `js/app.js?v=693 → v=694`, `css/style.css?v=420 → v=421`.

---

## 1 — Problem (per user)

The 3-button date nav used direction arrows (← → 📅) that confused bidi (Arabic) readers:
- "اليوم السابق" with → on its right
- "اليوم التالي" with ← on its left
- Center "اليوم" with 📅 home/calendar icon — looked like a third nav target

Arrows in bidi UI can be misleading because their semantic direction (prev/next in time) and their visual direction (right/left in RTL) don't align intuitively. The user requested removing the arrows and labeling each button clearly with text only, plus making the center button a status card (not a nav target).

---

## 2 — What changed

### A. Template (`index.html` ~line 1648)

**Removed:**
- `<span class="moon-date-arrow">←</span>` from prev
- `<span class="moon-date-arrow">→</span>` from next
- `<svg class="icon moon-date-arrow">…</svg>` from today

**Restructured center button** to 2-line status-card layout:
```html
<!-- BEFORE -->
<a id="moon-date-today" href="#">
    <svg class="icon moon-date-arrow"><use href="#i-home"/></svg>
    <span class="moon-date-label" data-i18n="moon.return_today">اليوم</span>
</a>

<!-- AFTER -->
<a id="moon-date-today" href="#">
    <span class="moon-date-label" data-i18n="moon.current_date">اليوم المعروض</span>
    <span class="moon-date-sub" id="moon-date-today-sub"></span>
</a>
```

Center still links to `/moon-today-in-{city}` (jump-to-today affordance) but styled as a status card per user's "بطاقة status/current".

### B. New i18n key `moon.current_date` — 10 langs

Added after the existing `moon.return_today` key in each lang file + the consolidated bundle:

| Lang | Translation |
|---|---|
| ar | اليوم المعروض |
| en | Currently showing |
| fr | Date affichée |
| tr | Görüntülenen tarih |
| ur | موجودہ تاریخ |
| de | Angezeigtes Datum |
| id | Tanggal yang ditampilkan |
| es | Fecha mostrada |
| bn | প্রদর্শিত তারিখ |
| ms | Tarikh dipaparkan |

**Files touched:** `js/i18n/{ar,en,fr,tr,ur,de,id,es,bn,ms}.js` (10) + `js/i18n.js` (consolidated bundle with all 10 lang blocks). Total: 11 files, 1 line added each.

### C. JS date-nav fill (`js/app.js` ~line 20100)

Rewrote the Round-14 single-label overwrite block as a 2-element fill:
- Primary: write the formatted date into `#moon-date-today-sub` (new sub-line element); the label stays automatic via `data-i18n="moon.current_date"` translation.
- Legacy fallback: if pre-update cached HTML lacks `#moon-date-today-sub`, write the date into `.moon-date-label` as before (keeps users on stale caches from seeing the raw i18n key).
- `_midText` computation lifted out of inner blocks so `aria-label` + `title` always reflect the formatted date.
- Removed the now-dead `_arrowEl.textContent = '📅'` line (`.moon-date-arrow` element no longer exists in DOM).

### D. CSS (`css/style.css` ~line 5740)

| Rule | Effect |
|---|---|
| `.moon-date-arrow { display: none !important; }` | Defensive: hides any cached `.moon-date-arrow` nodes |
| `.moon-date-today-link { font-weight: 700; box-shadow: 0 1px 0 rgba(0,0,0,0.05) inset; }` | Status-card weight |
| `.moon-date-today-link:hover { transform: none; box-shadow: 0 2px 8px ... inset; }` | Softer hover — no lift (center isn't a "go somewhere" target like prev/next) |
| `.moon-date-today-link .moon-date-label { font-size: 0.85rem; opacity: 0.92; letter-spacing: 0.01em; }` | Slightly smaller label so the sub-date reads as primary content |
| `.moon-date-today-link .moon-date-sub { font-size: 0.92rem; font-weight: 700; opacity: 1; margin-top: 1px; }` | Sub-date is heavier/larger than prev/next sub-dates |
| `@media (max-width: 600px) { ... }` | Mobile scaling — gap 6px, padding 8px, fonts scaled down |

### E. Cache-busters (`index.html`)

- `css/style.css?v=420 → v=421`
- `js/app.js?v=693 → v=694`

---

## 3 — Verification (live SSR port 8080, `/moon-in-jeddah/2026-05-31`)

| Test | Expected | Actual |
|---|---|---|
| Template `<span class="moon-date-arrow">` count | 0 | 0 ✅ |
| `<svg class="…moon-date-arrow">` count | 0 | 0 ✅ |
| `#moon-date-today-sub` element present | yes | yes ✅ |
| `data-i18n="moon.current_date"` on center | present | present ✅ |
| `.moon-date-label` text "اليوم المعروض" (template default) | present | present ✅ |
| `.moon-date-label` text "اليوم السابق" | present | present ✅ |
| `.moon-date-label` text "اليوم التالي" | present | present ✅ |
| Prev/next/today href in template | `#` (filled by JS) | `#` ✅ |
| Hijri-format moon href anywhere | 0 | 0 ✅ |
| `moon.current_date` key in served `js/i18n/en.js` | `"Currently showing"` | ✓ |
| `moon.current_date` key in served `js/i18n/ar.js` | `"اليوم المعروض"` | ✓ |
| Served CSS contains `.moon-date-arrow{display:none!important}` | yes | yes ✅ |
| Served CSS contains `.moon-date-today-link .moon-date-sub{font-size:.92rem;font-weight:700}` | yes | yes ✅ |
| `/moon-in-riyadh/1447-12-06` HTTP (strict policy) | 404 | 404 ✅ |
| Sitemap Hijri moon URLs | 0 | 0 ✅ |
| `node --check js/app.js` | OK | OK ✅ |
| `_smoke_hijri_stage_b1_unit` | 68/68 | 68/68 ✅ |

---

## 4 — User-spec compliance checklist

| Constraint | Met? |
|---|---|
| Remove ← → arrows | ✅ template element + CSS defensive |
| Center button: "اليوم المعروض" + date as status card | ✅ new template + i18n + CSS |
| Center NOT styled as nav button (softer, no hover lift) | ✅ `transform: none` on hover |
| prev/next labels stay clear ("اليوم السابق" / "اليوم التالي") | ✅ unchanged i18n keys |
| Mobile responsive — balanced 3-col, legible | ✅ `@media (max-width: 600px)` |
| EN labels: Previous day / Currently showing / Next day | ✅ existing en.js + new `moon.current_date` |
| prev href → `/moon-in-{city}/{prevYYYY-MM-DD}` (Gregorian canonical) | ✅ JS sets via `_moonDatePagePath()` |
| next href → `/moon-in-{city}/{nextYYYY-MM-DD}` (Gregorian canonical) | ✅ same |
| No Hijri href | ✅ 0 Hijri URLs in any served page (strict route policy holds) |
| No redirects | ✅ |
| No Hijri routes added | ✅ |

---

## 5 — What was NOT changed

| Item | Touched? |
|---|---|
| MoonCalc / Umm al-Qura / calculations | NO |
| canonical / hreflang / sitemap / JSON-LD | NO |
| Strict Gregorian route policy (`/1447-…` → 404) | NO |
| `_moonDatePagePath()` helper (href computation) | NO |
| H1 / breadcrumbs / page URL | NO |
| `/hijri-date` / `/hijri-calendar` links | NO new ones added |
| `moon.return_today` i18n key (kept as legacy fallback) | NO (kept alongside new `moon.current_date`) |
| Other UI sections (hero, FAQ, edu, calendar grid) | NO |

---

## 6 — Files changed

| File | Change |
|---|---|
| `index.html` | template restructure (arrows removed, center has label+sub) + cache-busters (`?v=`) |
| `js/app.js` | date-nav fill block — write to `#moon-date-today-sub` + lifted `_midText` scope + dropped dead arrow code |
| `js/i18n.js` | +10 `moon.current_date` keys (one per lang block) |
| `js/i18n/{ar,en,fr,tr,ur,de,id,es,bn,ms}.js` | +1 `moon.current_date` key per file (10 files) |
| `css/style.css` | +37 lines for status-card style + arrow-hide + mobile breakpoint |
| `reports/moon-dated-page-date-nav-cleanup-1-closure.md` | NEW |

---

## 7 — Closure checklist

- [x] Template arrows removed (← / → / 📅).
- [x] Center button restructured to 2-line status card (label + sub).
- [x] `moon.current_date` i18n key added to all 10 langs + consolidated bundle.
- [x] JS fill block writes to new `#moon-date-today-sub`.
- [x] Legacy fallback for pre-update cached HTML (writes date into label).
- [x] CSS for status-card look + softer hover + mobile breakpoint.
- [x] Defensive `.moon-date-arrow { display:none !important }` for stale caches.
- [x] Hrefs stay Gregorian canonical (JS uses `_moonDatePagePath`).
- [x] No Hijri routes / no redirects / no query params.
- [x] Strict route policy preserved (`/1447-…` still 404).
- [x] canonical / hreflang / sitemap / JSON-LD unchanged.
- [x] Carry-forward smoke 68/68.
- [x] `node --check js/app.js`: OK.
- [x] Cache-busters bumped.
- [x] Closure report written.
