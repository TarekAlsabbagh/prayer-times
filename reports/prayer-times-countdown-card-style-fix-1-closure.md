# PRAYER-TIMES-COUNTDOWN-CARD-STYLE-FIX-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Fix the per-event card coloring on `/prayer-times-in-{city}` Islamic Events Countdown section by adding the bare `.moon-event-{name}` class alongside the existing `.moon-event-{name}-card` suffix on all 4 anchors.

---

## 1. Goal

The user reported (with screenshot of `/prayer-times-in-riyadh`) that the 4 Islamic events countdown cards inside `#page-prayer-times .moon-events-section` (added in commit `9d393fb`) were rendering as plain white boxes — missing the per-event colored borders + labels (purple Ramadan, gold Eid Fitr, red Eid Adha, blue Hijri New Year) that the matching section shows on `/moon-today` and `/qibla-in-{city}`.

This is the SAME root cause + SAME fix as QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 (commit `211f1bf`).

---

## 2. Root cause

`index.html:1116-1140` — the 4 anchors used ONLY the `-card` suffix:
```html
<a class="moon-event-card moon-event-ramadan-card" ...>   ← was missing the bare .moon-event-ramadan
<a class="moon-event-card moon-event-fitr-card" ...>      ← was missing the bare .moon-event-fitr
<a class="moon-event-card moon-event-adha-card" ...>      ← was missing the bare .moon-event-adha
<a class="moon-event-card moon-event-newyear-card" ...>   ← was missing the bare .moon-event-newyear
```

But the per-event coloring CSS at `css/style.css:4339-4368` targets the BARE class:
```css
.moon-event-ramadan { border-color: rgba(156,39,176,0.40); ... }
.moon-event-ramadan .moon-event-label { color: #7b1fa2; }
/* ... etc for fitr / adha / newyear */
```

So none of the per-event colors applied. Cards rendered as plain `.moon-event-card` (white bg + grey border + default text color).

---

## 3. Files modified (2)

| File | Lines | Change |
|---|---|---|
| `index.html` | +13 / 4 | Added the bare `.moon-event-{name}` class to each of the 4 anchors (line 1116, 1124, 1132, 1140). `.moon-event-{name}-card` suffix is KEPT for JS targeting via `.moon-event-{name}-days` / `.moon-event-{name}-date` selectors. Cache buster `js/app.js?v=743 → ?v=744` (3 occurrences via replace_all). Added 9-line documentation comment. |
| `sw.js` | +13 / −1 | `CACHE_VERSION v381 → v382` + 12-line header comment documenting this wave. (Originally drafted as v380→v381; bumped after HOME-MOON-LEAK-FIX-1 (2a13200) consumed v381.) |

**No CSS / JS / DOM-shape / data / SSR / i18n changes.** The fix is purely a class-list addition on 4 anchors.

---

## 4. The edit (4 anchors, identical pattern)

```diff
-<a class="moon-event-card moon-event-ramadan-card" href="/ramadan-countdown">
+<a class="moon-event-card moon-event-ramadan moon-event-ramadan-card" href="/ramadan-countdown">

-<a class="moon-event-card moon-event-fitr-card" href="/eid-al-fitr-countdown">
+<a class="moon-event-card moon-event-fitr moon-event-fitr-card" href="/eid-al-fitr-countdown">

-<a class="moon-event-card moon-event-adha-card" href="/eid-al-adha-countdown">
+<a class="moon-event-card moon-event-adha moon-event-adha-card" href="/eid-al-adha-countdown">

-<a class="moon-event-card moon-event-newyear-card" href="/hijri-new-year-countdown">
+<a class="moon-event-card moon-event-newyear moon-event-newyear-card" href="/hijri-new-year-countdown">
```

Each anchor now carries:
- `moon-event-card` — base shape/layout
- `moon-event-{name}` — per-event coloring (new)
- `moon-event-{name}-card` — JS-fill targeting selector (kept)

---

## 5. Verification results

### Computed-style check on `/prayer-times-in-riyadh` (390×844 light mode)

| Variant | Border | Label | Days | Classes |
|---|---|---|---|---|
| ramadan | `rgba(156,39,176,0.4)` purple ✅ | `rgb(123,31,162)` deep purple ✅ | 253 يومًا | `moon-event-card`, `moon-event-ramadan`, `moon-event-ramadan-card` |
| fitr | `rgba(255,193,7,0.55)` gold ✅ | `rgb(176,122,0)` gold-dark ✅ | 282 يومًا | `moon-event-card`, `moon-event-fitr`, `moon-event-fitr-card` |
| adha | `rgba(244,67,54,0.4)` red ✅ | `rgb(198,40,40)` deep red ✅ | 350 يومًا | `moon-event-card`, `moon-event-adha`, `moon-event-adha-card` |
| newyear | `rgba(33,150,243,0.4)` blue ✅ | `rgb(21,101,192)` deep blue ✅ | 16 يومًا | `moon-event-card`, `moon-event-newyear`, `moon-event-newyear-card` |

**Byte-identical** to the verified `/moon-today` + `/qibla-in-riyadh` rendering.

### SSR markup check
`curl http://localhost:3000/prayer-times-in-riyadh | grep moon-event-*` confirms both class variants present:
- `moon-event-ramadan` AND `moon-event-ramadan-card` ✓
- `moon-event-fitr` AND `moon-event-fitr-card` ✓
- `moon-event-adha` AND `moon-event-adha-card` ✓
- (plus `moon-event-{name}-days` and `moon-event-{name}-date` selectors for JS — preserved)

### Regression — 8 URLs all return 200
- ✅ `/prayer-times-in-riyadh` (the patched page)
- ✅ `/prayer-times-in-makkah`
- ✅ `/prayer-times-in-jeddah`
- ✅ `/en/prayer-times-in-riyadh`
- ✅ `/qibla-in-riyadh` (211f1bf countdown preserved)
- ✅ `/moon-today` (#moon-events-section source preserved)
- ✅ `/hijri-calendar` (FLOW-FIX-2 preserved)
- ✅ `/azkar/morning-azkar`

---

## 6. Q&A per pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | السبب الجذري | الـ 4 anchors في prayer-times كانت تستخدم `-card` suffix فقط، لكن CSS التلوين يستهدف bare class بدون suffix. نفس الـ root cause كـ qibla (211f1bf) |
| 2 | الملفات المعدلة | `index.html` (+13/-4 dual-class addition + cache buster + توثيق)، `sw.js` (+13/-1 CACHE_VERSION + توثيق) |
| 3 | CSS-only أم HTML-only؟ | **HTML-only.** صفر تغيير في CSS / JS / DOM-shape / data / SSR. |
| 4 | الكروت بألوانها الصحيحة | ✅ ramadan بنفسجي / fitr ذهبي / adha أحمر / newyear أزرق — متطابق مع moon-today + qibla |
| 5 | الأيام بقيم حقيقية | ✅ 253/282/350/16 (نفس قيم qibla + moon-today — مصدر مشترك من `_azkarRenderMoonEvents()`) |
| 6 | لم يتأثر `_azkarRenderMoonEvents()` | ✅ صفر تغيير في JS — `-card` suffix محفوظ للـ JS targeting |
| 7 | الصفحات الأخرى (moon/qibla) لم تتأثر | ✅ moon-today countdown يعمل، qibla-events-section يعمل (تأكيد عبر 200 + grep) |
| 8 | cache-busters | ✅ `js/app.js?v=743 → v=744` + `CACHE_VERSION v381 → v382` |

---

## 7. What is NOT changed (scope fence)

- ❌ صفر تغيير في CSS (يستخدم القواعد الموجودة لـ `.moon-event-{name}`)
- ❌ صفر تغيير في JS (`_azkarRenderMoonEvents()` يجد البطاقات بنفس الـ selectors)
- ❌ صفر تغيير في حسابات HijriDate / الصلاة / المواقيت
- ❌ صفر تغيير في DOM-shape (نفس عدد العناصر + نفس الترتيب)
- ❌ صفر تغيير في server.js / SSR template / i18n
- ❌ صفر تغيير في FAQ / JSON-LD / canonical / sitemap / routing
- ❌ صفر تغيير في الوضع الداكن (يستخدم القواعد الموجودة)
- ❌ MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1 (ec7b172) محفوظ
- ❌ QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 (211f1bf) محفوظ

---

## 8. Cache-buster bumps

| File | From | To |
|---|---|---|
| `index.html` (preload + script tag) | `js/app.js?v=743` | `js/app.js?v=744` |
| `sw.js` | `CACHE_VERSION = 'v381'` | `CACHE_VERSION = 'v382'` |

`css/style.css?v=458` unchanged (no CSS touched).

---

## 9. Proposed commit message

```
fix(prayer-times): PRAYER-TIMES-COUNTDOWN-CARD-STYLE-FIX-1 — add bare .moon-event-{name} class to fix per-event card coloring

Follow-up to QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 (211f1bf).
Same root-cause + same fix on /prayer-times-in-{city}: the 4 Islamic-
events countdown anchors (added in 9d393fb) used only the
`.moon-event-{name}-card` suffix, but the per-event coloring CSS at
css/style.css:4339-4368 targets the bare `.moon-event-{name}` class.

Fix: each anchor now carries BOTH classes:
- `.moon-event-{name}` — matches CSS coloring rules (purple/gold/red/blue
  borders + labels)
- `.moon-event-{name}-card` — kept for `_azkarRenderMoonEvents()` JS
  targeting via `.moon-event-{name}-days` / `.moon-event-{name}-date`
  selectors

Verified /prayer-times-in-riyadh @ 390x844: 4 cards with correct per-
event borders + labels matching /moon-today + /qibla-in-riyadh.
8 regression URLs all 200.

Untouched: CSS (uses existing rules), JS, server.js, SSR, DOM-shape,
data, FAQ, JSON-LD, canonical, sitemap, routing, dark mode,
MOON-DISC-GLOW fix (ec7b172), QIBLA-CITY countdown (211f1bf).

Cache busters: js/app.js v743->v744, sw v381->v382.
```

---

## 10. Pre-push checklist

- [x] Single feature, single intent — dual-class addition on 4 anchors
- [x] No CSS changes
- [x] No JS changes
- [x] No data file mutations
- [x] No DOM-shape changes (just class-list extension)
- [x] 4 cards with correct per-event colors verified
- [x] Real days text rendered (253/282/350/16)
- [x] 8 regression URLs return 200
- [x] Cache busters bumped
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
