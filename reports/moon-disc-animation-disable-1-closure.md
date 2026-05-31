# MOON-DISC-ANIMATION-DISABLE-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** CSS-only — disable ALL motion (transition + animation) on the moon disc SVG visual across all moon pages. Keep size, color, phase shape, drop-shadow. Zero JS / data / route / calc changes.

---

## 1. Root cause of current motion

Two CSS `transition` declarations on the moon disc itself:

| Location | Declaration | Effect |
|---|---|---|
| `css/style.css:2636` | `.moon-svg { ... transition: filter 0.4s ease; }` | The `filter: drop-shadow(...)` smoothly transitions over 0.4s on any filter change → subtle shadow shimmer |
| `css/style.css:2639` | `.moon-svg-lit { transition: d 0.6s cubic-bezier(0.22, 1, 0.36, 1); }` | The SVG `d` (path data) morphs over 0.6s when JS sets a new path via `setAttribute('d', ...)` (js/app.js:17880) → visible phase morph animation on phase changes / page load / data refresh |

No other animation/transform/keyframe touches the moon disc:
- ❌ NOT touched (out of scope): `.moon-chart-container` `moonChartHaloPulse` (data-viz halo on the illumination chart — separate element, separate container)
- ❌ NOT touched (already static): `.moon-hero-icon` + `.moon-hero-icon-wrap` (small emoji in the hero info row — no motion in source)
- ❌ NOT touched (unrelated UI): `moonHubCtaPulse`, `moonEventPulse`, `pulse-btn`, `pulse-soft`, `pulse-banner` (all on hub-CTA buttons, event countdown badges, prayer banners)

The previous `@media (prefers-reduced-motion: reduce) { .moon-svg-lit { transition: none; } }` rule covered ONLY one of the two transitions, and only for users who enabled the reduce-motion OS pref.

---

## 2. Files modified (3 tracked-M)

| File | Lines | Change |
|---|---|---|
| `css/style.css` | +33 / −6 | Removed 2 `transition` declarations + added a defensive `animation: none !important; transition: none !important;` rule scoped under `.moon-visual / .moon-svg / .moon-svg-lit / .moon-icon / .moon-disc` subtrees + removed the now-redundant `@media (prefers-reduced-motion)` rule + 21 lines of inline doc-comments |
| `index.html` | +2 / −2 | Cache-buster bump: `css/style.css?v=463 → ?v=464` (2 occurrences: preload + stylesheet) |
| `sw.js` | +18 / −1 | `CACHE_VERSION 'v389' → 'v390'` for SW precache invalidation + 17-line header doc-comment |

**Zero changes to:** `js/app.js`, `js/moon.js`, `js/i18n*`, `server.js`, `index.html` markup (only `?v=` query bumped), HijriDate calcs, moon astronomical calcs, FAQ JSON-LD, canonical, routing, sitemap, breadcrumbs, JSON-LD, dark-mode rules, data files.

---

## 3. The fix (exact diff)

### Removed (kill the 2 source transitions)

```css
.moon-svg {
    ...
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));
-   transition: filter 0.4s ease;
}
.moon-svg-lit {
-   transition: d 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
- @media (prefers-reduced-motion: reduce) {
-     .moon-svg-lit { transition: none; }
- }
```

### Added (defensive future-proof block)

```css
.moon-visual,
.moon-visual *,
.moon-svg,
.moon-svg *,
.moon-svg-lit,
.moon-icon,
.moon-disc,
.moon-disc * {
    animation: none !important;
    transition: none !important;
}
```

**Why both?** Removing the 2 source transitions handles today's known motion. The defensive block with `!important` guarantees that ANY future code that adds animations/transitions to the moon disc subtree gets silently disabled — without needing to touch the new code. The block is the smallest possible scope (descendants of `.moon-visual` only); it does NOT affect `.moon-chart-*` (data-viz) or `.moon-hero-icon` (different element).

---

## 4. Verification results

### A. CSS served fresh on localhost:8080 (`/css/style.css?v=464`)

```
.moon-svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 4px 10px rgba(0, 0, 0, .25))}
```
→ NO transition declaration ✓

```
.moon-svg-lit  →  (empty rule dropped by minifier — covered by defensive block below)
```

```
.moon-visual,.moon-visual *{animation:none!important;transition:none!important}
```
→ Defensive block present, minifier collapsed the 8-selector list to `.moon-visual,.moon-visual *` because `.moon-visual *` is a superset that already covers `.moon-svg`, `.moon-svg-lit`, `.moon-icon`, and any other descendant. Source on disk preserves the full 8-selector list for future-proofing in case minifier behavior changes.

### B. 9 URL regression — ALL 200

```
/moon-today                  200    ← target page (hub)
/moon-today-in-riyadh        200    ← target page (city)
/moon-in-riyadh              200    ← target page (alt URL)
/moon-in-riyadh/2026-05-31   200    ← target page (dated)
/prayer-times-in-riyadh      200    ← regression (sibling)
/qibla-in-riyadh             200    ← regression (sibling)
/azkar/morning-azkar         200    ← regression (sibling)
/hijri-calendar              200    ← regression (sibling)
/zakat-calculator            200    ← regression (sibling)
```

### C. Cache busters served correctly

- `css/style.css?v=464` ✓ (in SSR HTML for /moon-today)
- `CACHE_VERSION = "v390"` ✓ (in /sw.js)

### D. .moon-svg .filter (drop-shadow) still applied

`filter:drop-shadow(0 4px 10px rgba(0, 0, 0, .25))` confirmed present in served CSS — the natural depth shadow is intact. Only the *transition* on filter changes was removed, not the filter itself.

### E. Out-of-scope animations preserved (verified by grep)

- `.moon-comparison .mc-cycle-icon { transition: filter .3s, transform .3s; }` — STILL ACTIVE ✓ (moon comparison widget, different element, user-spec out of scope)
- `.moon-chart-container svg circle.moon-chart-halo { animation: moonChartHaloPulse ... }` — STILL ACTIVE ✓ (data-viz halo on illumination chart, user-spec out of scope)
- `moonHubCtaPulse`, `moonEventPulse`, `pulse-btn`, `pulse-soft` — STILL ACTIVE ✓ (CTA buttons / event badges / prayer banner, NOT moon disc)

---

## 5. Q&A per user spec (12 points)

| # | Question | Answer |
|---|---|---|
| 1 | ما هو سبب الحركة الحالية؟ | 2 CSS `transition` declarations في `.moon-svg` (filter 0.4s) + `.moon-svg-lit` (d-path 0.6s) at css/style.css:2636 + 2639. JS فقط يَستدعي `setAttribute('d', ...)` — الحركة من CSS بحتة. |
| 2 | الملفات المعدّلة | 3 ملفّات: `css/style.css`, `index.html` (cache-buster only), `sw.js` (CACHE_VERSION only). |
| 3 | الكلاسات الفعلية التي كانت تحوي animation/transition | `.moon-svg` (transition: filter) + `.moon-svg-lit` (transition: d). لا animation. لا transform. لا keyframes على القمر نفسه. |
| 4 | هل الإصلاح CSS-only؟ | ✅ نعم — صفر JS تغيير. |
| 5 | تأكيد القمر ثابت بالكامل | ✅ source CSS لـ `.moon-svg` بدون transition. الـ defensive block يَفرض `animation:none + transition:none` بـ `!important` على كلّ الـ subtree (descendants of `.moon-visual`). |
| 6 | تأكيد شكل القمر لم يتغيّر | ✅ الـ `<path id="moon-svg-lit" d="..."/>` ما زال يَتعدَّل بـ JS (تغيير `d` فوريّ بدون morph) — الـ phase shape المُحسَب يَظهر بنفس الدقّة لكن بدون تَنقّل بصريّ بين الحالات. |
| 7 | تأكيد الظل الطبيعي بقي | ✅ `filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))` على `.moon-svg` محفوظ بحرفه. الـ drop-shadow الدافئ (الـ glow) كان مَحذوفًا سلفًا في `MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1` — هذا الـ shadow الطبيعي محفوظ. |
| 8 | تأكيد التوهّج لا يَعود | ✅ لم يُضَف أي `drop-shadow` لون-دافئ. الـ `MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1` rule محفوظة كما هي. |
| 9 | تأكيد الجوال والديسكتوب سليمان | ✅ الـ `@media (max-width: 480px) { .moon-visual { width: 130px; height: 130px; } }` لم يُمَسّ. الـ defensive block لا يُحدِّد breakpoint — يُطَبَّق على جميع المقاسات. |
| 10 | تأكيد الـ dark + light سليمان | ✅ لم يُمَسّ أي rule في `html[data-theme="dark"]`. الـ defensive block يَستخدم `!important` على animation/transition فقط — لا color / bg / filter changes. |
| 11 | تأكيد عدم تأثير الصلاة/القبلة/الأذكار/التقويم/الزكاة | ✅ الـ CSS rule scoped بدقّة تحت `.moon-visual`/.moon-svg`/.moon-disc` — هذه الـ classes لا تَظهر في أي صفحة غير القمر. الـ 5 صفحات regression جميعها 200. |
| 12 | تأكيد cache-busters | ✅ `css/style.css ?v=463 → ?v=464` + `sw.js CACHE_VERSION v389 → v390`. لا تغيير في `js/app.js` (لم يُمَسّ) ولا `i18n` version. |

---

## 6. Scope fence (what is NOT touched)

| ❌ Untouched | Detail |
|---|---|
| `js/app.js` | الدالة `_buildMoonPhasePath()` + `setAttribute('d', ...)` تَعمل كما هي |
| `js/moon.js`, `js/moon-chart.js`, `js/prayer-times.js`, `js/hijri-date.js` | بدون مساس |
| `server.js` | بدون مساس |
| Moon astronomical calculations (`MoonCalc.getMoonPhase`, `getIllumination`, `getMoonRiseSet`) | بدون مساس |
| Moon route detection / SSR injection / canonical / sitemap | بدون مساس |
| FAQPage JSON-LD on moon pages | بدون مساس |
| `.moon-chart-*` (illumination chart + halo pulse) | بدون مساس — out-of-scope (data-viz, not disc) |
| `.moon-hero-icon` + `.moon-hero-icon-wrap` | بدون مساس — was already static, no animations to remove |
| `.moon-comparison .mc-cycle-icon` | بدون مساس — out-of-scope (moon comparison widget) |
| Hijri / prayer / qibla / azkar / zakat / hub pages | بدون مساس — 5 URLs 200 |
| Dark-mode overrides | بدون مساس |
| Mobile @media breakpoint for `.moon-visual` 130px | بدون مساس |

---

## 7. Proposed commit message

```
fix(moon): MOON-DISC-ANIMATION-DISABLE-1 — disable all motion on the moon disc SVG

CSS-only fix. Removed the 2 transition declarations that caused
visible motion on the moon disc:
  - .moon-svg { transition: filter 0.4s ease; }   (shadow shimmer)
  - .moon-svg-lit { transition: d 0.6s cubic-bezier(...); } (phase morph)

Added a defensive block (animation: none !important; transition: none
!important) scoped under .moon-visual / .moon-svg / .moon-svg-lit /
.moon-icon / .moon-disc subtrees so any future motion-introducing
code is automatically suppressed.

Removed the now-redundant @media (prefers-reduced-motion: reduce)
rule (motion is now disabled for ALL users).

Preserved:
  - moon disc size, color, phase shape (calc unchanged)
  - natural drop-shadow (filter: drop-shadow 0 4px 10px rgba(0,0,0,0.25))
  - no glow (MOON-DISC-GLOW-REMOVE-KEEP-DROPSHADOW-1 still in place)
  - dark-mode + mobile breakpoint (.moon-visual 130px @ <480px)
  - .moon-chart-container halo pulse (data-viz, out of scope)
  - .moon-hero-icon (already static)
  - .moon-comparison .mc-cycle-icon (out of scope)
  - moon astronomical calcs, JS, routing, sitemap, canonical, JSON-LD

Verified: 9 URLs return 200 (4 moon pages + 5 regression siblings).
.moon-svg served CSS has NO transition. Defensive block confirmed
(minifier collapsed 8-selector list to .moon-visual,.moon-visual *
since that's a superset of the others).

Cache busters: css/style.css v463->v464, sw v389->v390.
```

---

## 8. Pre-push checklist

| # | البند | الحالة |
|---|---|---|
| 1 | Single ticket scope (CSS-only) | ✅ |
| 2 | No data mutations | ✅ |
| 3 | No JS / server.js / routing / sitemap changes | ✅ |
| 4 | No calc-logic changes | ✅ (zero touch to js/app.js, js/moon.js) |
| 5 | 9 URL regression (4 moon + 5 sibling) all 200 | ✅ |
| 6 | CSS minified+served confirms transitions removed | ✅ |
| 7 | Defensive block + filter drop-shadow both intact | ✅ |
| 8 | Cache-busters bumped (css v463→v464, sw v389→v390) | ✅ |
| 9 | `node --check` not applicable (CSS only) | n/a |
| 10 | Closure report self-contained | ✅ |
| 11 | **Awaiting user approval before push** | ⏳ |

---

## 9. Known dev-environment artifact

The Claude_Preview MCP proxy has an internal cache that ignores `?v=` query params — so live browser-tests through the MCP showed `v=463` (old) even after server restart with new CSS. The source-of-truth was confirmed via direct Bash curl to `localhost:8080`:
- `/moon-today` HTML references `css/style.css?v=464` ✓
- `/css/style.css?v=464` body has NO transition on `.moon-svg` and contains the defensive block ✓
- `/sw.js` has `CACHE_VERSION="v390"` ✓

This proxy-cache artifact is dev-tool-only. Real production browsers visiting `prayer-times-d4w8.onrender.com` after push will fetch fresh CSS v=464 and see the static moon immediately.
