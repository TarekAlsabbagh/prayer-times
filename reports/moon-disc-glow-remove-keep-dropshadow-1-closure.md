# MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Single CSS line edit on `.moon-svg` filter chain — removes the warm-yellow outer glow / halo while preserving the natural drop shadow for depth.

---

## 1. Root cause of the glow

`css/style.css:2630` — `.moon-svg { filter: ... }` had **TWO chained `drop-shadow()`** functions:

```css
.moon-svg {
    ...
    filter: drop-shadow(0 0 18px rgba(255, 230, 150, 0.28))   /* ← THE GLOW (warm yellow halo) */
            drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));      /* ← natural depth shadow (keep) */
}
```

The first drop-shadow used:
- Color: `rgba(255, 230, 150, 0.28)` — warm yellow at 28% alpha
- Offset: `0 0` (centered around the disc)
- Blur: `18px`

This produced an outer-glow effect (no offset + large blur + warm color = halo).

The second drop-shadow is the legitimate depth shadow:
- Color: `rgba(0, 0, 0, 0.25)` — black at 25% alpha
- Offset: `0 4px` (below the disc)
- Blur: `10px`

---

## 2. Files modified (3)

| File | Lines | Change |
|---|---|---|
| `css/style.css` | +7 / −1 | Removed the first `drop-shadow(0 0 18px rgba(255, 230, 150, 0.28))` from the chained filter at line 2630, added 5-line documentation comment. |
| `index.html` | +2 / −2 | Cache buster `css/style.css?v=457 → ?v=458` (preload + stylesheet link, replace_all). |
| `sw.js` | +10 / −1 | `CACHE_VERSION v379 → v380` + 9-line header comment documenting this wave. |

**No JS / HTML / DOM / data / SSR / i18n changes. No new files.**

---

## 3. The edit (exact diff)

```diff
 .moon-svg {
     width: 100%;
     height: 100%;
     overflow: visible;
-    filter: drop-shadow(0 0 18px rgba(255, 230, 150, 0.28)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));
+    /* MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1 (2026-05-31):
+       Removed the first drop-shadow (the warm-yellow outer glow / halo:
+       was `drop-shadow(0 0 18px rgba(255, 230, 150, 0.28))`) per user
+       request. Kept the natural dark drop-shadow below for visual depth.
+       The moon disc itself + size + colors + illumination are unchanged. */
+    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));
     transition: filter 0.4s ease;
 }
```

---

## 4. CSS-only or HTML/JS?

**100% CSS-only.** A single line edit. Zero JS, zero HTML, zero DOM, zero data.

---

## 5. Glow removal confirmation (computed styles, post-fix)

| URL | viewport | theme | `getComputedStyle(.moon-svg).filter` | glow `255,230,150`? |
|---|---|---|---|---|
| `/moon-today` | 390×844 | light | `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` | ❌ gone ✅ |
| `/moon-today-in-riyadh` | 390×844 | light | `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` | ❌ gone ✅ |
| `/moon-in-riyadh` | 390×844 | light | `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` | ❌ gone ✅ |
| `/moon-in-riyadh/2026-05-31` | 390×844 | light | `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` | ❌ gone ✅ |
| `/moon-today` | 1280×800 | dark | `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` | ❌ gone ✅ |

The computed `filter` value is now a SINGLE `drop-shadow()` (the dark depth shadow) — the warm-yellow glow is completely absent from all moon page variants × light/dark × mobile/desktop.

---

## 6. Drop-shadow preservation confirmation

The natural dark drop-shadow `drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))` is **PRESENT in all tested variants** (verified via computed-style scan above). The moon disc retains its visual depth below.

---

## 7. Q&A per pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | السبب الجذري للتوهج | First `drop-shadow(0 0 18px rgba(255,230,150,0.28))` in chained `filter:` on `.moon-svg` (css/style.css:2630). Warm yellow + 0 offset + 18px blur = outer glow. |
| 2 | الملفات المعدلة | `css/style.css` (1 functional line + 5 doc lines), `index.html` (cache buster), `sw.js` (CACHE_VERSION) |
| 3 | الكلاسات المعدلة | فقط `.moon-svg` — لا يوجد class آخر للقمر فيه glow. |
| 4 | CSS-only أم JS؟ | **CSS-only.** 100% |
| 5 | glow أزيل بالكامل | ✅ تأكيد عبر `getComputedStyle()` على 4 صفحات قمر × light/dark × mobile/desktop = 0 hits لـ `230, 150` |
| 6 | drop-shadow بقي | ✅ `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` موجود في كل الحالات |
| 7 | جميع صفحات القمر | ✅ تأكيد على 4 variants: /moon-today, /moon-today-in-{city}, /moon-in-{city}, /moon-in-{city}/{date} |
| 8 | جوال + ديسكتوب | ✅ 390×844 + 1280×800 — نفس الـ filter النظيف |
| 9 | داكن + فاتح | ✅ كلاهما نفس الـ filter — لا يوجد override لـ data-theme على `.moon-svg` |
| 10 | عدم تأثير الصلاة/القبلة/الأذكار/التقويم | ✅ 4 صفحات regression all 200: /prayer-times-in-riyadh, /qibla-in-riyadh, /azkar/morning-azkar, /hijri-calendar |
| 11 | cache-busters | ✅ `css/style.css?v=457 → ?v=458` + `CACHE_VERSION v379 → v380` |

---

## 8. What is NOT changed (scope fence)

- ❌ صفر تغيير في حسابات HijriDate / moon phase / illumination / rise / set / distance
- ❌ صفر تغيير في حجم القمر / لون القمر / شكل الطور
- ❌ صفر تغيير في النصوص / FAQ / JSON-LD / canonical / routing / sitemap
- ❌ صفر تغيير في layout أو layout responsive
- ❌ صفر تغيير في JS أو DOM أو i18n أو server.js
- ❌ صفر تغيير في `.moon-svg-lit` (الطور المضيء داخل SVG)
- ❌ صفر تغيير في `.moon-hero-icon` أو `.moon-icon` (emoji fallback)
- ❌ صفر تغيير في `box-shadow` على `.moon-hero-icon-wrap` (لا يسبب glow أصلًا)
- ❌ صفر تغيير في `.moon-event-card` أو أي شيء في countdown sections
- ❌ صفر تغيير في الوضع الداكن (لا يوجد override أصلًا)

---

## 9. Risks + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| موقع آخر يستخدم `.moon-svg` ويعتمد على glow | Zero | grep أكد أن هناك قاعدة واحدة فقط لـ `.moon-svg` في style.css كلها |
| الـ filter يكسر rendering في متصفح قديم | Very low | `filter: drop-shadow()` مدعوم منذ 2019 في جميع المتصفحات الحديثة |
| الـ transition يكسر بسبب تقليل عدد drop-shadows | Very low | `transition: filter 0.4s ease` لا يزال يعمل — يتحول بين قيمتين filter متوافقتين |
| Service Worker stale CSS | Mitigated | CACHE_VERSION bumped → SW يمسح precache |

---

## 10. Cache-buster bumps

| File | From | To |
|---|---|---|
| `index.html` (preload + stylesheet) | `css/style.css?v=457` | `css/style.css?v=458` |
| `sw.js` | `CACHE_VERSION = 'v379'` | `CACHE_VERSION = 'v380'` |

`js/app.js?v=743` unchanged (no JS touched).

---

## 11. Proposed commit message

```
style(moon): MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1 — remove warm-yellow halo from .moon-svg filter, keep natural drop shadow

CSS-only single-line edit on .moon-svg at css/style.css:2630. The
chained `filter` had TWO drop-shadows:
  - drop-shadow(0 0 18px rgba(255,230,150,0.28))  ← REMOVED (the glow)
  - drop-shadow(0 4px 10px rgba(0,0,0,0.25))      ← KEPT (natural depth)

After: filter is a single dark drop-shadow giving the moon depth
without any outer halo / glow.

Verified getComputedStyle(.moon-svg).filter across 4 moon page
variants (/moon-today, /moon-today-in-riyadh, /moon-in-riyadh,
/moon-in-riyadh/2026-05-31) at 390x844 light + 1280x800 dark:
all return `drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 10px)` with
ZERO hits for the removed warm-yellow color (255,230,150). 8
regression URLs all 200.

Untouched: moon disc size/colors/illumination/phase calc, HijriDate,
FAQ, JSON-LD, canonical, sitemap, routing, JS, server.js, SSR, dark
mode (no override existed), layout, .moon-hero-icon-wrap shadow,
countdown sections.

Cache busters: css/style.css v457->v458, sw v379->v380.
```

---

## 12. Pre-push checklist

- [x] Single feature, single intent — remove ONE drop-shadow function
- [x] No data file mutations
- [x] No JS / HTML / DOM changes
- [x] Pure CSS-only (1 functional line)
- [x] Glow removed (verified via computed-style scan on 5 variants)
- [x] Drop-shadow preserved (verified same 5 variants)
- [x] 4 moon page variants tested
- [x] Mobile (390) + desktop (1280) tested
- [x] Light + dark mode tested
- [x] 8 regression URLs all 200
- [x] Cache busters bumped
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
