# QIBLA-CITY-QUICKLINKS-CTA-PILL-STYLE-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** CSS-only restyle of `#page-qibla .qibla-quicklinks` (the 3-link block on `/qibla-in-{city}` pages) to visually match `#hyear-cta` on `/hijri-calendar`.

---

## 1. Goal

User request (verbatim):
> "اجعل تنسيق العنصر الاول مثل تنسيق وتصميم العنصر الثاني"
> Element 1: `.qibla-quicklinks` (current = plain horizontal text links)
> Element 2: `#hyear-cta` (target = 3 styled pill buttons; first primary-filled, others outline)

Make Element 1 look identical to Element 2 in:
- Layout (balanced 3-col grid, max-width centered)
- Sizing (50px min-height, 12px padding, 12px radius)
- Hierarchy (first button = primary fill, 2nd+3rd = secondary outline)
- Typography (font-weight 700 primary / 600 secondary, 0.95rem)
- Shadows + hover + dark mode
- Responsive (single-col stack on mobile)

---

## 2. Files modified (3)

| File | Lines | Change |
|---|---|---|
| `css/style.css` | +163 / 0 | New block at end (~line 27682): full pill-button system for `#page-qibla .qibla-quicklinks` mirroring `#hyear-cta` (HIJRI-CALENDAR-CTA-POLISH-1 architecture at line 23059+). Pure additive — no existing rules deleted/modified. |
| `index.html` | +2 / −2 | Cache buster `css/style.css?v=455 → ?v=456` (preload + stylesheet link, replace_all) |
| `sw.js` | +9 / −1 | `CACHE_VERSION v376 → v377` + 8-line header comment documenting this wave |

**No JS changes. No HTML/DOM/text/href changes. No i18n/server changes. No data changes. No new files.**

---

## 3. Investigation findings

| Component | Where it lives | Notes |
|---|---|---|
| HTML structure | `js/app.js:16811` (client-rendered) | `qlEl.innerHTML = [<li><a>...×3].join('')` |
| Link icons | `js/app.js:15243` (`_Q_ICON.moon/calendar/home`) | `<svg class="icon" aria-hidden="true"><use href="#i-X"/></svg>` |
| Link text | `js/app.js:15272+` (`link_moon: city => ...`) | All 10 langs already use the `${_Q_ICON.moon} text` pattern |
| Container | `<ul id="qibla-quicklinks" class="qibla-quicklinks">` (3 `<li><a>` inside) | Wrapped in `<div class="section-card qibla-city-only">` |
| Existing CSS | `css/style.css:14921-14929` | Plain flex-wrap with `color: var(--primary)`, `font-weight: 500`, plain text-link hover |
| Visibility | only on `/qibla-in-{city}` (NOT on `/qibla` hub) | parent has `qibla-city-only` class |

**Key difference vs `#hyear-cta`:** the qibla JS at app.js:16811 does NOT inject inline styles on each `<a>` (unlike the hijri-year SSR template). Hence **no `!important` needed** for the new rules to win the cascade. Specificity `#page-qibla .qibla-quicklinks li > a` (1,1,2) cleanly beats legacy `.qibla-quicklinks a` (0,1,1).

---

## 4. The patch (key selectors)

```css
/* Container — balanced 3-col grid, 14px gap, max-w 760px centered */
#page-qibla .qibla-quicklinks {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    max-width: 760px;
    margin-inline: auto;
}

/* All buttons — secondary white outline default */
#page-qibla .qibla-quicklinks > li > a {
    display: inline-flex; align-items: center; justify-content: center;
    gap: 10px; min-height: 50px; padding: 12px 20px; border-radius: 12px;
    font-size: 0.95rem; font-weight: 600;
    background: #ffffff; color: var(--primary-dark);
    border: 1.5px solid rgba(26, 107, 60, 0.22);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

/* Primary — solid gradient on first <li>'s <a> */
#page-qibla .qibla-quicklinks > li:first-child > a {
    background: linear-gradient(180deg, var(--primary), var(--primary-dark));
    color: #fff; font-weight: 700;
    border: 1px solid var(--primary-dark);
    box-shadow: 0 2px 6px rgba(13, 74, 40, 0.18);
}

/* + hover (desktop ≥769px only): translateY(-1px) + brighter gradient/tint
 + focus-visible outline ring
 + dark-mode parity (primary-light gradient on first, card-bg + primary-light on rest)
 + mobile (≤768px): single column stack, min-height 48px */
```

Full patch = 163 lines including dark-mode parity + responsive + focus-visible + hover states. Architecture is a 1:1 mirror of HIJRI-CALENDAR-CTA-POLISH-1 (css/style.css:23059+) for design-system cohesion.

---

## 5. Verification results

### Computed-style verification (browser headless)

**Mobile (390×844 light mode):**
- Container: `display:grid; grid-template-columns:1fr (single col); gap:10px; max-width:100%` ✅
- Item 0 (Primary "حالة القمر اليوم في مكة المكرمة"): font-weight 700, color #fff, gradient bg, border 1px primary-dark, box-shadow primary, min-height 48px, padding 12px 20px ✅
- Item 1 + 2 (Secondary): font-weight 600, color primary-dark, bg #fff, border 1.5px secondary-tint ✅
- All 3 items: full-width (w=334), stacked with 10px gap, all have SVG icons ✅

**Desktop (~780×1688, ≥769px branch):**
- Container: `display:grid; grid-template-columns:3×122px; gap:14px; max-width:760px` ✅
- All 3 items same row (`sameTop: true`), each w=123 (3-col equal split) ✅
- Primary: white text + 700 ✅
- Secondary: primary-dark + 600 ✅

**Dark mode (390×844 + data-theme=dark):**
- Primary: `linear-gradient(rgb(74,184,122) → rgb(45,144,89))` (primary-light → primary), color dark green, border primary ✅
- Secondary: bg card-bg (45,51,59), color primary-light (74,184,122), border rgba(77,203,140,0.3) ✅

### Regression — 8 URLs all return 200

- ✅ `/qibla-in-makkah` (the patched page)
- ✅ `/qibla-in-jeddah`
- ✅ `/qibla-in-riyadh`
- ✅ `/en/qibla-in-makkah` (English variant)
- ✅ `/hijri-calendar` (the design-source page — confirms #hyear-cta untouched)
- ✅ `/prayer-times-in-riyadh`
- ✅ `/moon-today`
- ✅ `/azkar/morning-azkar`

### CSS serving
- `curl http://localhost:3000/css/style.css?v=456 | tail` shows new rules at end (minified — comments stripped, code intact) ✅
- Server restarted to clear in-memory `_staticCache` ✅

---

## 6. Q&A per pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | Approach | CSS-only — mirrors HIJRI-CALENDAR-CTA-POLISH-1 architecture for consistency |
| 2 | Files modified | `css/style.css` (+163), `index.html` (cache buster), `sw.js` (CACHE_VERSION) |
| 3 | Selectors used | All scoped to `#page-qibla .qibla-quicklinks` to avoid affecting any other `.qibla-quicklinks` usage |
| 4 | Existing rules touched | **None** — pure additive. The legacy rule at css/style.css:14921-14929 is preserved (loses cascade by specificity) |
| 5 | JS / DOM / i18n changed? | **No.** Zero changes to `js/app.js:16811` rendering code or `_Q_ICON`/UI tables |
| 6 | Visual hierarchy correct? | ✅ Primary "Moon Today in {city}" = solid green gradient + white bold; secondaries = white outline + primary-dark |
| 7 | Mobile responsive? | ✅ `@media (max-width: 768px)` → single column stack, 10px gap, min-height 48px |
| 8 | Dark mode? | ✅ Parity rules mirror `#hyear-cta` dark treatment exactly |
| 9 | Hover/focus? | ✅ Desktop hover lift + tint, focus-visible outline ring on all anchors |
| 10 | Cache busters | ✅ `css/style.css?v=455 → ?v=456`, sw `v376 → v377` |

---

## 7. What is NOT changed (scope fence)

- ❌ No changes to `#hyear-cta` (the design source) — verified still works on /hijri-calendar
- ❌ No JS changes (`js/app.js:16811` qlEl.innerHTML rendering preserved)
- ❌ No i18n changes (`_Q_ICON` + per-lang `link_moon/link_hijri/link_home` unchanged)
- ❌ No SSR changes (`server.js` qibla rendering preserved)
- ❌ No HTML/DOM changes (`index.html` only cache-buster bumped)
- ❌ No calculation/data changes (qibla angles, distances, city data all untouched)
- ❌ No SEO/JSON-LD/canonical/sitemap/routing changes
- ❌ Legacy `.qibla-quicklinks` rule at css/style.css:14921-14929 preserved as safety net
- ❌ No changes to `/qibla` hub page (only `qibla-city-only` blocks affected)
- ❌ No changes to other pages — `#page-qibla` scoping prevents bleed

---

## 8. Cache-buster bumps

| File | From | To |
|---|---|---|
| `index.html` (preload + stylesheet) | `css/style.css?v=455` | `css/style.css?v=456` |
| `sw.js` | `CACHE_VERSION = 'v376'` | `CACHE_VERSION = 'v377'` |

`js/app.js?v=742` unchanged (no JS touched).

---

## 9. Risks + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Bleed to other `.qibla-quicklinks` instances on different pages | Zero | `#page-qibla` scoping; grep confirms only one place uses this class |
| `:focus-visible` unsupported on old browsers | Zero | All major browsers since 2020; project already uses it |
| Legacy rule conflict | Zero | Specificity 1,1,2 (new) > 0,1,1 (legacy) → cleanly wins |
| Service Worker stale CSS | Mitigated | CACHE_VERSION bumped → SW clears precache on next install |
| Visual regression on a lang with much longer text | Low | `word-break: keep-all` + `white-space: normal` allows wrap on narrow viewports |

---

## 10. Proposed commit message

```
style(qibla): QIBLA-CITY-QUICKLINKS-CTA-PILL-STYLE-1 — match #hyear-cta pill design

Restyle #page-qibla .qibla-quicklinks (the 3-link block on /qibla-in-{city}
pages) to be visually identical to #hyear-cta on /hijri-calendar — solid
primary gradient on first action + 2 white outline secondaries, balanced
3-col grid (max-w 760px centered desktop, single-col stack mobile), 50px
min-height, 12px radius, soft shadows, hover lift on desktop, dark-mode
parity, focus-visible ring.

CSS-only, +163 lines, additive (no existing rule deleted). Mirrors the
HIJRI-CALENDAR-CTA-POLISH-1 architecture (css/style.css:23059+) 1:1 so
the two CTA groups feel like one design system. No `!important` needed
since the qibla JS renderer (app.js:16811) doesn't inject inline styles
(unlike #hyear-cta's SSR template).

Verified:
- Mobile 390x844: single-col stack, primary white+700, secondary primary-
  dark+600, both with SVG icons + 48px min-height
- Desktop ~780+: 3-col equal grid, 14px gap, all items same row
- Dark mode: primary-light gradient on first, card-bg + primary-light on
  rest
- 8 regression URLs all 200 (/qibla-in-makkah, /qibla-in-jeddah, /qibla-
  in-riyadh, /en/qibla-in-makkah, /hijri-calendar, /prayer-times-in-
  riyadh, /moon-today, /azkar/morning-azkar)

Untouched: JS (app.js:16811 renderer preserved), i18n (_Q_ICON + link_*
preserved), SSR/server.js, HTML/DOM, qibla calculations, SEO/JSON-LD,
canonical, routing, #hyear-cta source-of-design (verified still works).

Cache busters: css/style.css v455->v456, sw v376->v377.
```

---

## 11. Pre-push checklist

- [x] Single feature, single intent — CSS pill restyle only
- [x] No data file mutations
- [x] No JS changes
- [x] No DOM/HTML changes
- [x] Pure additive CSS (no rule deletions/modifications)
- [x] Scoped to `#page-qibla .qibla-quicklinks` only
- [x] Mirrors existing #hyear-cta design 1:1 for cohesion
- [x] Mobile single-col stack verified
- [x] Desktop 3-col grid verified
- [x] Dark mode parity verified
- [x] 8 regression URLs return 200
- [x] Cache busters bumped
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
