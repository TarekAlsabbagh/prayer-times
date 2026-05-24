# MOON-INTERNAL-DATE-LINKS-GREGORIAN-CANONICAL-FIX-1 — Closure

**Date:** 2026-05-24
**Status:** CLOSED, awaiting user approval
**Scope:** `js/app.js` 14-day forecast table renderer (the Hijri-date cell `<a href>`)
**Implementation commit:** (TBD on stage)

---

## 1) Root cause

After `MOON-DATE-STRICT-GREGORIAN-ROUTE-POLICY-1` (commit `eb037c2`) made the moon dated route reject Hijri-format URLs with HTTP 404, the 14-day forecast table on `/moon-in-{city}` and `/moon-today-in-{city}` was the only remaining internal link builder that still emitted Hijri-format hrefs. Visitors clicking the Hijri date in any row of that table hit a 404.

The bug was at `js/app.js:18994-18996`:

```js
const _hIso = hj.year + '-' + _pad2(hj.month) + '-' + _pad2(hj.day);  // Hijri YYYY-MM-DD
const _hHref = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _hIso;  // → /moon-in-riyadh/1447-12-07
hijriCell = `<td class="fc-hijri-cell"><a class="fc-hijri-link" href="${_escHtml(_hHref)}" …>…</a></td>`;
```

The Hijri date is computed via `HijriDate.toHijri(dp.y, dp.m + 1, dp.d)` — correct for display. But the href was built from the same Hijri components instead of the row's Gregorian ISO date.

## 2) Where Hijri-date hrefs existed (full audit)

| Location | File:line | Status |
| --- | --- | --- |
| 14-day forecast table — Hijri cell `<a href>` | `js/app.js:18994-18996` | **FIXED** in this wave |
| Month-page calendar cells (`_cellHref`) | `server.js:17999-18001` | Already Gregorian (`_isoOf(_cellD)` returns Gregorian) — UNCHANGED |
| 14-day forecast table — day cell (`_href`) | `js/app.js:19010` | Already Gregorian (`_fcIso(dp, row.date)`) — UNCHANGED |
| Compact-cal CTA (`_hubCalCompactHref`) | `server.js:18146` | Already Gregorian — UNCHANGED |
| Detail CTA on hub (`_hubDetailCtaHref`) | `js/app.js:18017+` | Points to `/moon-today-in-{city}` (no date) — UNCHANGED |
| Related-links 6-card grid | `js/app.js:18594+` | All Gregorian month / today / hub URLs — UNCHANGED |
| Educational section links (`_link2`, `_link1`) | `js/app.js:17407`, `18401` | Hub / month — UNCHANGED |
| Hijri-date / Hijri-calendar links (separate family) | various | Out of scope — these target `/hijri-date/`, `/hijri-calendar/` (correct routes) — UNCHANGED |

Verified via `grep`: **0 remaining hrefs** that construct a `/moon-in-…/{HYYYY-…}` URL in the served bundle.

## 3) What changed

`js/app.js` — single function block (the forecast-table row renderer):

### Before
```js
let hijriCell = '<td class="fc-hijri-cell">—</td>';
try {
    if (typeof HijriDate !== 'undefined' && …) {
        const hj = HijriDate.toHijri(dp.y, dp.m + 1, dp.d);
        const hMonthName = …;
        const hijriText = hj.day + ' ' + hMonthName + ' ' + hj.year;
        if (_citySlug) {
            const _hIso = hj.year + '-' + _pad2(hj.month) + '-' + _pad2(hj.day);
            const _hHref = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _hIso;
            hijriCell = `<td …><a class="fc-hijri-link" href="${_escHtml(_hHref)}" …>…</a></td>`;
        } else { … }
    }
} catch …
…
let dayCell, rowClasses = [];
const _dayText = …;
if (_citySlug) {
    const _iso = _fcIso(dp, row.date);
    const _href = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _iso;
    dayCell = `<td …><a class="fc-day-link" href="${_escHtml(_href)}">…</a></td>`;
    …
}
```

### After
```js
// Hoisted Gregorian ISO date — reused by BOTH day cell + Hijri cell
const _rowIso = _citySlug ? _fcIso(dp, row.date) : null;

let hijriCell = '<td class="fc-hijri-cell">—</td>';
try {
    if (typeof HijriDate !== 'undefined' && …) {
        const hj = HijriDate.toHijri(dp.y, dp.m + 1, dp.d);
        const hMonthName = …;
        const hijriText = hj.day + ' ' + hMonthName + ' ' + hj.year;  // display TEXT unchanged
        if (_citySlug) {
            // href now uses _rowIso (Gregorian), NOT hj.year/month/day
            const _hHrefGreg = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _rowIso;
            hijriCell = `<td …><a class="fc-hijri-link" href="${_escHtml(_hHrefGreg)}" …>…</a></td>`;
        } else { … }
    }
} catch …
…
let dayCell, rowClasses = [];
const _dayText = …;
if (_citySlug) {
    // uses _rowIso (hoisted at top of loop iteration)
    const _href = _langPrefixFC + '/moon-in-' + _citySlug + '/' + _rowIso;
    dayCell = `<td …><a class="fc-day-link" href="${_escHtml(_href)}">…</a></td>`;
    …
}
```

## 4) Before / after examples (user's spec)

| Row visible text | Before (BROKEN — 404) | After (FIXED — 200) |
| --- | --- | --- |
| الأحد 24 مايو 2026 / 7 ذو الحجة 1447 هـ | href: `/moon-in-riyadh/1447-12-07` ❌ | href: `/moon-in-riyadh/2026-05-24` ✅ |
| الأحد 31 مايو 2026 / 14 ذو الحجة 1447 هـ | href: `/moon-in-riyadh/1447-12-14` ❌ | href: `/moon-in-riyadh/2026-05-31` ✅ |
| السبت 6 يونيو 2026 / 20 ذو الحجة 1447 هـ | href: `/moon-in-riyadh/1447-12-20` ❌ | href: `/moon-in-riyadh/2026-06-06` ✅ |

The Hijri date `7 ذو الحجة 1447 هـ` is **still visible as text** in the cell. Only the underlying `<a href>` value changed.

## 5) Tests run (live SSR on port 3228)

### Verification 1: served bundle has the fix
- Old pattern `hj.year + '-' + _pad2(hj.month)` count in served bundle: **0** ✅
- Old pattern `_hIso = hj.year` count in disk source: **0** ✅
- Pattern `/moon-in-[a-z]+/14XX-` count in served bundle: **0** ✅
- Pattern `/moon-in-[a-z]+/13XX-` count in served bundle: **0** ✅

### Verification 2: strict-Gregorian policy still enforces 404 on Hijri URLs (REGRESSION CHECK — policy unchanged)
| URL | HTTP | Expected |
| --- | --- | --- |
| `/moon-in-riyadh/1447-12-07` | **404** ✅ | 404 |
| `/moon-in-riyadh/1447-12-14` | **404** ✅ | 404 |
| `/moon-in-riyadh/1447-12-20` | **404** ✅ | 404 |

### Verification 3: Gregorian URLs from user's spec return 200
| URL | HTTP | Expected |
| --- | --- | --- |
| `/moon-in-riyadh/2026-05-24` | **200** ✅ | 200 |
| `/moon-in-riyadh/2026-05-31` | **200** ✅ | 200 |
| `/moon-in-riyadh/2026-06-06` | **200** ✅ | 200 |

### Verification 4: sitemap unchanged
- Hijri-format moon URLs: **0** ✅ (must be 0)
- Gregorian dated count: **23,560** ✅ (baseline unchanged)

### Verification 5: sibling routes regression-free
| URL | HTTP |
| --- | --- |
| `/moon-today` | **200** ✅ |
| `/moon-in-riyadh` | **200** ✅ |
| `/moon-today-in-riyadh` | **200** ✅ |
| `/moon-in-riyadh/2026-05` | **200** ✅ |
| `/hijri-date/1447-12-06` | **200** ✅ (separate family — unchanged) |
| `/hijri-calendar/1447` | **200** ✅ |

### Verification 6: syntax
- `node --check js/app.js` → **PASS**

## 6) Confirmations (per user's explicit no-list)

- ✅ Hijri date still visible as text in the cell (just `hijriText = hj.day + ' ' + hMonthName + ' ' + hj.year`)
- ✅ href now always Gregorian canonical (`_rowIso = _fcIso(dp, row.date)`)
- ✅ Strict-Gregorian route policy **NOT changed** — `/moon-in-{city}/1447-XX-XX` still returns 404 with `X-Robots-Tag: noindex,nofollow`
- ✅ No 301 redirects added
- ✅ No new routes added for Hijri moon URLs
- ✅ sitemap **NOT changed** (still 0 Hijri moon URLs; 23,560 Gregorian dated URLs preserved)
- ✅ canonical / hreflang on Gregorian pages **NOT changed**
- ✅ MoonCalc **NOT changed** (no astronomy code touched)
- ✅ Umm al-Qura **NOT changed** (the same `HijriDate.toHijri(dp.y, dp.m + 1, dp.d)` call is used for display)
- ✅ No new dependencies added
- ✅ `/hijri-date/`, `/hijri-calendar/`, `/today-hijri-date` — separate page family, untouched

## 7) Files touched (3)

| File | Change |
| --- | --- |
| `js/app.js` | 1 surgical edit in the 14-day forecast row renderer (lines 18982-19015 region) — hoisted `_rowIso`, switched Hijri-cell `href` to use `_rowIso` instead of Hijri components, kept Hijri TEXT as-is |
| `index.html` | Cache-buster `app.js?v=687 → 688` (both preload + script tags) |
| `reports/moon-internal-date-links-gregorian-canonical-fix-1-closure.md` | This report |

## 8) Commit message draft

```
fix(moon,ux): MOON-INTERNAL-DATE-LINKS-GREGORIAN-CANONICAL-FIX-1 — point Hijri-date cell href to Gregorian canonical (was broken 404)

After MOON-DATE-STRICT-GREGORIAN-ROUTE-POLICY-1 (commit eb037c2)
started returning 404 on Hijri-format moon URLs, the 14-day forecast
table on /moon-in-{city} and /moon-today-in-{city} was the only
remaining internal link builder still emitting Hijri-format hrefs
(/moon-in-riyadh/1447-12-07 etc.). Clicking the Hijri date in any
row hit the 404.

Fix (1 surgical edit in js/app.js forecast renderer):
 - Hoisted Gregorian _rowIso = _fcIso(dp, row.date) once at the top
   of the row iteration
 - Switched Hijri-cell href to use _rowIso (Gregorian) instead of
   building from Hijri hj.year/month/day components
 - Display TEXT in the Hijri cell unchanged — visitor still sees
   "7 ذو الحجة 1447 هـ" etc.

Before / after examples (user spec):
  Row: الأحد 24 مايو 2026 / 7 ذو الحجة 1447 هـ
    BEFORE href: /moon-in-riyadh/1447-12-07  → 404
    AFTER  href: /moon-in-riyadh/2026-05-24  → 200

Verified live (port 3228):
  - Served bundle has 0 occurrences of `hj.year` in href construction
  - /moon-in-riyadh/14XX-... still 404 (policy unchanged)
  - /moon-in-riyadh/2026-XX-XX still 200
  - Sitemap still 0 Hijri moon URLs (23,560 Gregorian preserved)
  - /hijri-date/ family unchanged (HTTP 200, separate routes)

Cache-buster: app.js?v=687 → 688.

No policy change. No 301. No new routes. No sitemap change. No
canonical/hreflang change for Gregorian pages. No MoonCalc, Umm al-
Qura, content, CSS, i18n, HTML, or dependency changes.

Closure: reports/moon-internal-date-links-gregorian-canonical-fix-1-closure.md
```
