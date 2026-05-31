# PRAYER-CALC-SETTINGS-MOBILE-SELECT-LAYOUT-FIX-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Mobile-only (`@media max-width: 767px`) CSS fix for the `<select>` controls inside `#city-calc-settings` on `/prayer-times-in-{city}` pages. Fixes RTL arrow placement, touch target, and padding-arrow collision.

---

## 1. Root cause

On `/prayer-times-in-riyadh` at 390×844 mobile (verified live via Chrome MCP):

| Symptom | Computed style (before fix) | Issue |
|---|---|---|
| Arrow on wrong edge in RTL | `appearance: auto` (native browser arrow) | iOS Safari + Chrome Android render the native dropdown chevron at the START edge in RTL (visually left), not end (right) — looks wrong in Arabic UI |
| Text-arrow collision on long text | `padding: 8px 10px` (uniform) | Native arrow occupies ~30-40px of the END edge, but only 10px reserved → selected option's tail collides with arrow |
| Small touch target | `min-height: auto` → 40px rendered | Below Apple HIG (44px) and Material (48px) guidelines |
| Cramped typography | label 13.6px, select 14.72px | Hard to read on mobile |
| Tight border radius | 8px | Inconsistent with the 12px radius used on other mobile pill controls in the project |

All 5 issues stem from `<select>` styling at `css/style.css:13488` being designed for desktop only. No mobile-specific rule existed.

---

## 2. Files modified (3)

| File | Lines | Change |
|---|---|---|
| `css/style.css` | +137 / 0 | NEW `@media (max-width: 767px)` block at end (line 27975+): `#city-calc-settings .ccs-row select` with `appearance:none` + custom SVG chevron + RTL/LTR-aware arrow position + 48px touch target + 12px radius + 1rem font + dark-mode variant + `.ccs-advanced-link` 48px tap target. Pure additive — zero deletion of existing rules. |
| `index.html` | +2 / −2 | Cache buster `css/style.css?v=458 → ?v=459` (preload + stylesheet link, replace_all) |
| `sw.js` | +14 / −1 | `CACHE_VERSION v382 → v383` + 13-line header comment documenting this wave. |

**No JS/HTML/DOM/data/i18n/server/SSR/calculation changes.**

---

## 3. The patch (key rules at css/style.css:27975+)

```css
@media (max-width: 767px) {
    #city-calc-settings.city-calc-settings { overflow: hidden; }
    #city-calc-settings .ccs-grid {
        gap: 14px; padding: 4px 14px 18px;
        box-sizing: border-box; width: 100%; max-width: 100%;
    }
    #city-calc-settings .ccs-row {
        display: flex; flex-direction: column; align-items: stretch;
        gap: 8px; width: 100%; max-width: 100%; box-sizing: border-box;
    }
    #city-calc-settings .ccs-row label {
        display: block; width: 100%; text-align: start;
        font-size: 0.95rem; line-height: 1.5; font-weight: 600;
    }
    #city-calc-settings .ccs-row select {
        display: block; width: 100%; max-width: 100%;
        min-height: 48px; box-sizing: border-box;
        padding-block: 0;
        padding-inline-start: 14px;
        padding-inline-end: 38px;             /* reserves space for arrow */
        border: 1px solid var(--border); border-radius: 12px;
        font-size: 1rem; line-height: 1.4; text-align: start;
        appearance: none; -webkit-appearance: none; -moz-appearance: none;
        background-image: url("data:image/svg+xml;utf8,...chevron SVG...");
        background-repeat: no-repeat; background-size: 12px 8px;
        background-position-y: center;
    }
    /* Arrow horizontal position via [dir] selectors */
    html[dir="ltr"] #city-calc-settings .ccs-row select {
        background-position-x: calc(100% - 14px);  /* right edge in LTR */
    }
    html[dir="rtl"] #city-calc-settings .ccs-row select,
    html:not([dir="ltr"]) #city-calc-settings .ccs-row select {
        background-position-x: 14px;               /* visual left = end in RTL */
    }
    #city-calc-settings .ccs-row select::-ms-expand { display: none; }
    #city-calc-settings .ccs-row select:focus-visible {
        outline: 2px solid var(--primary); outline-offset: 2px;
        border-color: var(--primary);
    }
    #city-calc-settings .ccs-advanced-link {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; width: 100%; min-height: 48px;
        padding-block: 10px; padding-inline: 14px;
        border-radius: 12px; font-size: 0.95rem; box-sizing: border-box;
    }
    /* Dark mode chevron flips to primary-light */
    html[data-theme="dark"] #city-calc-settings .ccs-row select {
        background-color: var(--card-bg); color: var(--text);
        border-color: var(--border);
        background-image: url("...chevron with stroke='%234ab87a'...");
    }
}
```

---

## 4. Verification results

### Mobile RTL (`/prayer-times-in-riyadh` at 390×844)

| Property | Before | After |
|---|---|---|
| `appearance` | `auto` | `none` ✅ |
| `backgroundImage` | `none` | SVG chevron data URL ✅ |
| `backgroundPositionX` | n/a | `14px` (visual left in RTL = end-of-text) ✅ |
| `paddingInlineStart` | `10px` | `14px` ✅ |
| `paddingInlineEnd` | `10px` | `38px` (arrow space) ✅ |
| `border-radius` | `8px` | `12px` ✅ |
| `font-size` | `14.72px` | `16px` (1rem) ✅ |
| `min-height` | `auto` | `48px` ✅ |
| rendered height | 40px | **48px** ✅ |
| Label `font-size` | `13.6px` | `15.2px` (0.95rem) ✅ |
| Label `font-weight` | 400 | **600** ✅ |
| Advanced link rendered height | 36px | **48px** ✅ |

### Mobile LTR (`/en/prayer-times-in-riyadh` at 390×844)

| Property | Value |
|---|---|
| `direction` | `ltr` ✅ |
| `appearance` | `none` ✅ |
| `backgroundPositionX` | `calc(100% - 14px)` (visual right in LTR = end-of-text) ✅ |
| `paddingInlineStart` | `14px` (text-edge) ✅ |
| `paddingInlineEnd` | `38px` (arrow space on right) ✅ |
| rendered height | 48px ✅ |

**Arrow correctly mirrors per direction without any JS or [dir]-aware HTML.**

### Desktop (`/prayer-times-in-riyadh` at 1280×800) — UNCHANGED
- `appearance: auto` (native browser arrow preserved)
- `min-height: auto` → 40px (original desktop sizing)
- `padding: 8px 10px` (original)
- `border-radius: 8px` (original)
- `font-size: 14.72px` (original)
- `background-image: none` (no custom arrow)
- Rendered width 868px (desktop card width)

`@media (max-width: 767px)` correctly does NOT fire at 1280px. ✅

### Regression — 7 URLs all 200
- ✅ `/prayer-times-in-riyadh` (the patched page)
- ✅ `/en/prayer-times-in-riyadh`
- ✅ `/prayer-times-in-makkah`
- ✅ `/moon-today`
- ✅ `/qibla-in-riyadh`
- ✅ `/azkar/morning-azkar`
- ✅ `/hijri-calendar`

### Served CSS
- `curl http://localhost:3000/css/style.css?v=459 | grep PRAYER-CALC-SETTINGS-MOBILE-SELECT-LAYOUT-FIX-1` → 1 match ✅

---

## 5. Q&A per pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | السبب الجذري | `<select>` يستخدم native appearance على الجوال — السهم يظهر في START edge في RTL، والـ padding لا يحجز مساحة له. |
| 2 | الملفات المعدلة | `css/style.css` (+137)، `index.html` (cache buster)، `sw.js` (CACHE_VERSION + توثيق) |
| 3 | الكلاسات | `#city-calc-settings`, `.ccs-grid`, `.ccs-row`, `.ccs-row label`, `.ccs-row select`, `.ccs-advanced-link` |
| 4 | CSS-only أم JS؟ | **CSS-only.** صفر JS. |
| 5 | حقول select داخل الكرت | ✅ `overflow:hidden` + `box-sizing:border-box` + `max-width:100%` على Grid و Row و Select |
| 6 | السهم لم يعد خارج الحقل | ✅ custom SVG arrow عبر `background-image` مع موضع منطقي (LTR=end, RTL=start) — مرتبط بـ `[dir]` selector |
| 7 | RTL + LTR سليمان | ✅ تم اختبار /prayer-times-in-riyadh (rtl) + /en/prayer-times-in-riyadh (ltr) — السهم في الموضع الصحيح في كليهما |
| 8 | الحسابات لم تتغير | ✅ صفر تغيير في JS، server.js، data، أو منطق calc-method/asr/format |
| 9 | صفحات القمر/القبلة/الأذكار/التقويم | ✅ 4 صفحات regression تُرجع 200 (لا تتأثر — الـ selector محصور بـ `#city-calc-settings`) |
| 10 | cache-busters | ✅ `css/style.css?v=458 → v=459` + `sw v382 → v383` |

---

## 6. What is NOT changed (scope fence)

- ❌ صفر تغيير في حسابات مواقيت الصلاة
- ❌ صفر تغيير في `<option>` values أو طرق الحساب
- ❌ صفر تغيير في منطق حفظ الإعدادات أو localStorage
- ❌ صفر تغيير في advanced-settings modal logic
- ❌ صفر تغيير في JS / DOM-shape / server.js / SSR / i18n
- ❌ صفر تغيير في FAQ / JSON-LD / canonical / sitemap / routing / H1
- ❌ صفر تغيير في الديسكتوب layout (`@media max-width: 767px` فقط)
- ❌ صفر تغيير في صفحات moon / qibla / azkar / hijri (الـ scope محصور بـ `#city-calc-settings`)
- ❌ المؤشرات الأخرى للـ countdown / hero / FAQ / إلخ لم تتأثر

---

## 7. Cache-buster bumps

| File | From | To |
|---|---|---|
| `index.html` (preload + stylesheet) | `css/style.css?v=458` | `css/style.css?v=459` |
| `sw.js` | `CACHE_VERSION = 'v382'` | `CACHE_VERSION = 'v383'` |

`js/app.js?v=744` unchanged (no JS touched).

---

## 8. Proposed commit message

```
fix(prayer-times): PRAYER-CALC-SETTINGS-MOBILE-SELECT-LAYOUT-FIX-1 — appearance:none + custom RTL-aware arrow + 48px touch target

Mobile-only CSS fix for the <select> controls inside #city-calc-settings
on /prayer-times-in-{city} pages.

Root cause: existing .ccs-row select rule (css/style.css:13488) was
designed for desktop only. On mobile RTL, native browser dropdown
arrow renders at START edge (visually left) instead of end; default
padding 8px 10px doesn't reserve space for the arrow → text collides;
40px height is below 44/48px touch-target guidelines.

Fix (@media max-width: 767px):
- appearance:none + -webkit-appearance:none + -moz-appearance:none
- custom SVG chevron via background-image (primary color in light,
  primary-light in dark)
- background-position-x via [dir] selectors: LTR = calc(100% - 14px)
  (right edge), RTL = 14px (visual left = end-of-text)
- padding-inline-start: 14px, padding-inline-end: 38px (arrow space)
- min-height: 48px, border-radius: 12px, font-size: 1rem
- label font-size 0.95rem + font-weight 600
- .ccs-advanced-link min-height: 48px + 12px radius
- dark-mode chevron color variant

Verified at 390x844:
- RTL /prayer-times-in-riyadh: arrow at left edge ✓, padding 0px 14px 0px 38px ✓
- LTR /en/prayer-times-in-riyadh: arrow at calc(100% - 14px) ✓
Desktop 1280x800: unchanged (appearance:auto, native arrow, 40px, 8px 10px)

7 regression URLs all 200: /prayer-times-in-{riyadh,makkah},
/en/prayer-times-in-riyadh, /moon-today, /qibla-in-riyadh,
/azkar/morning-azkar, /hijri-calendar.

CSS-only. Zero JS / server.js / SSR / data / calculation / option-
value / save-logic changes. Advanced settings modal untouched.

Cache busters: css/style.css v458->v459, sw v382->v383.
```

---

## 9. Pre-push checklist

- [x] Single feature, single intent — mobile select layout fix
- [x] No data mutations
- [x] No JS changes
- [x] No server.js / SSR / HTML-template changes
- [x] Pure additive CSS — no existing rule deleted
- [x] Mobile-scoped (`@media max-width: 767px`)
- [x] RTL + LTR both verified
- [x] Desktop unchanged verified
- [x] 7 regression URLs return 200
- [x] Cache busters bumped
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
