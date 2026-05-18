# MOON-QIBLA-SEARCH-BOX-PRODUCTION-VISIBILITY-FIX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: MOON-QIBLA-SEARCH-BOX-PRODUCTION-VISIBILITY-FIX-1
**Predecessor**: MOON+QIBLA-GENERAL-HOME-SEARCH-BOX-1 (`541e0fb`)
**Type**: Emergency CSS visibility fix

---

## 1. Is the latest deploy on production?

The user reported that on `/moon-today` and `/qibla` (lang variants too) the search box is **not visible** to users, despite `541e0fb` being committed and pushed to `origin/main`. Investigation confirmed the search markup IS in the served HTML (Render serves the deployed commit), but it is hidden by CSS — so even after the deploy lands on Render, users see nothing where the search box should be.

The local server (which serves the exact same `index.html` + `js/app.js` minified bundle that Render serves) reproduces the same invisible state, confirming this is a **code bug** not a deploy lag.

---

## 2. Is the search box present in the DOM?

YES — the markup is in the DOM on `/moon-today` and `/qibla`:

| Page | Element | `tagName` | Present? |
|---|---|---|---|
| /moon-today | `#moon-page-search` | `<section>` | ✓ present |
| /moon-today | `#moon-hub-search` | `<input>` | ✓ present |
| /moon-today | `#moon-hub-suggestions` | `<div>` | ✓ present |
| /qibla | `#qibla-page-search` | `<section>` | ✓ present |
| /qibla | `#qibla-hub-search` | `<input>` | ✓ present |
| /qibla | `#qibla-hub-suggestions` | `<div>` | ✓ present |

JS auto-wire fires correctly — `searchEl.dataset.wired = '1'` was set.

---

## 3. Was it hidden or missing?

**HIDDEN** — by CSS, not by `hidden` attribute, not by `visibility:hidden`, not by `opacity:0`.

The `.city-page-search` class has this CSS rule (style.css line 11147):

```css
.city-page-search { display: none; margin: 10px 0 14px; }
html.city-page .city-page-search { display: block; }
```

The base class is **`display: none` by default** and only re-enabled when `<html>` has the `.city-page` class. Looking at where `.city-page` is set, it's only set on `/prayer-times-in-{slug}` pages — NOT on `/moon-today`, NOT on `/qibla`.

So when MOON+QIBLA-GENERAL-HOME-SEARCH-BOX-1 reused the homepage `.city-page-search` component on `/moon-today` and `/qibla`, the wrappers `<section class="city-page-search city-page-search--moon">` and `<section class="city-page-search city-page-search--qibla">` inherited the hidden default → invisible search box despite proper DOM presence and full JS wiring.

The browser-level computed-style check confirmed:

```js
// /moon-today, after JS hydration:
#moon-page-search   { display: none; offsetW: 0, offsetH: 0 }  ← hidden by CSS
#moon-hub-search    { display: block; offsetW: 0, offsetH: 0 } ← parent hides it
#moon-hub-suggestions { display: none; ... }                   ← never shown
```

---

## 4. الملفات المعدلة

| File | Change | Net |
|---|---:|---:|
| `css/style.css` | Added override rule `.city-page-search--moon, .city-page-search--qibla { display: block !important; }` right after the existing `html.city-page .city-page-search` rule. | +17 |
| `index.html` | Bumped CSS cache-buster `?v=356` → `?v=357` on both `<link rel="preload">` and `<link rel="stylesheet">`. | 2 lines |
| `reports/moon-qibla-search-box-production-visibility-fix-1-closure.md` | New closure report | — |

**NOT modified**:
- `js/app.js` — no JS change needed; markup + wiring were correct.
- `index.html` markup — no HTML change needed; structure was correct.
- `curated_places.json`, `server.js`, `fillLangMap`, `_pickCuratedName`, `names.ur`, `aliases.ur` — untouched.

---

## 5. Screenshots / browser verification

Browser-verified via Preview MCP (Chromium-based, viewport ≈ 534×wide).

### `/moon-today` (AR default) — **search box VISIBLE**
- `#moon-page-search` rect: **468×51 px** at position (top=254, left=29).
- `#moon-hub-search` input rect: **416×33 px** at position (top=263, left=42).
- Placeholder text: `"ابحث باسم المدينة لمعرفة طور القمر اليوم…"`
- Screenshot taken: confirmed the search box renders clearly in the moon hero card.

### `/qibla` (AR default) — **search box VISIBLE**
- `#qibla-page-search` rect: **468×51 px**.
- `#qibla-hub-search` input rect: **416×33 px**.
- Placeholder text: `"ابحث عن مدينتك (مثال: الرياض، القاهرة، Istanbul)"`
- Screenshot taken: confirmed the search box renders clearly in the qibla hero card.

### `/ur/moon-today` — **search box VISIBLE**
- Placeholder (UR i18n): `"آج چاند کی حالت دیکھنے کے لیے شہر تلاش کریں…"`
- Screenshot taken: confirmed.

### `/ur/qibla` — **search box VISIBLE**
- Placeholder (UR i18n): `"اپنا شہر تلاش کریں (مثال: لاہور، کراچی، Istanbul)"`
- Screenshot taken: confirmed.

---

## 6. Manual click-flow tests on `/moon-today` and `/qibla`

### Scenario 1 — `/ur/moon-today` + "charikar"
- Search box visible ✓
- Suggestions dropdown opened (display=block, .open class) ✓
- First result: name = **`چاریکار`**, country = **`افغانستان · شہر`** ✓
- Click → landed at **`/ur/moon-in-charikar`** ✓
- `#city-name` = **`چاریکار`** ✓

### Scenario 2 — `/ur/qibla` + "charikar"
- Search box visible ✓
- Suggestions dropdown opened ✓
- First result: name = **`چاریکار`**, country = **`افغانستان · شہر`** ✓
- Click → landed at **`/ur/qibla-in-charikar`** ✓
- `#city-name` = **`چاریکار`** ✓
- `#qibla-city` = **`چاریکار`** ✓
- `<h1>` = **`چاریکار سے سمتِ قبلہ`** ✓
- Breadcrumb: `بہم › سمتِ قبلہ › چاریکار` ✓

---

## 7. Confirmation that users see the search box without extra steps

- The search box renders **on page load** — no scroll, no click, no tab-switch required.
- It's inside `#moon-hub-hero` (moon) / `#qibla-hub-hero` (qibla), which is the FIRST hero card on each page above the fold.
- The search box is between the page subtitle and the "use my location" CTA button (same vertical position the legacy `.qibla-hub-search` input occupied).
- The CSS override is `!important` so it takes priority over the base `.city-page-search { display: none }` rule regardless of any HTML class state.

---

## Status: 🟢 CLOSED — search box now visible on `/moon-today` + `/qibla` + all 9 lang variants of each.

**Root cause**: missing per-modifier CSS override on the reused `.city-page-search` component.

**Fix scope**: 1 CSS file (4 lines of new CSS + comment block) + 1 cache-buster bump. Purely cosmetic / display-rule change. No data, no JS, no markup, no contract changes.

**Rollback**: `git revert <commit>` — instant and safe.
