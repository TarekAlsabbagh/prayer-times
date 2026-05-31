# PRAYER-TIMES-JUMP-CTA-BUTTON-REMOVAL-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Surgical removal of the "انتقل إلى الصلاة القادمة" CTA button (`.cha-cta--banner`) from `.next-prayer-banner` on `/prayer-times-in-{city}` pages. Per user request: "نريد حذف هذا الزر بشكل كامل".

---

## 1. Files modified (2)

| File | Lines | Change |
|---|---|---|
| `index.html` | +11 / −9 | Replaced the `<button>` markup + its preceding comment at lines 604-612 with an explanatory removal comment (12 lines). Net deletion of the 4-line `<button>` element + 5-line comment, plus 11-line replacement comment. |
| `sw.js` | +12 / −1 | `CACHE_VERSION v383 → v384` for SW precache invalidation + 11-line header comment documenting this wave. |

**No JS/CSS/data/server/SSR/i18n changes.** Per surgical principle.

---

## 2. Exact diff (index.html:604-612)

```diff
-                    <!-- PT-A-JS-followup (2026-05-06): user-triggered "Jump to current prayer".
-                         Replaces the previous 500ms auto-scroll that was disabled because it
-                         caused programmatic CLS on Lighthouse runs. Now the user clicks this
-                         CTA → jumpToActivePrayer() runs scrollIntoView, and Lighthouse
-                         excludes shifts within 500ms of user input from CLS. -->
-                    <button type="button" class="cha-cta cha-cta--banner" onclick="jumpToActivePrayer()" aria-label="انتقل إلى الصلاة القادمة" data-i18n-aria-label="cha.cta_jump">
-                        <svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg>
-                        <span data-i18n="cha.cta_jump">انتقل إلى الصلاة القادمة</span>
-                    </button>
+                    <!-- PRAYER-TIMES-JUMP-CTA-BUTTON-REMOVAL-1 (2026-05-31):
+                         The "Jump to next prayer" CTA button (.cha-cta--banner with
+                         onclick=jumpToActivePrayer()) was REMOVED per user request.
+                         The button was originally added in PT-A-JS-followup (2026-05-06)
+                         to replace a 500ms auto-scroll that triggered programmatic CLS
+                         on Lighthouse runs. The supporting jumpToActivePrayer() function
+                         in js/app.js, the .cha-cta--banner CSS rules in css/style.css,
+                         and the cha.cta_jump i18n keys across 10 lang files are KEPT
+                         as dead code — they're harmless once no DOM element references
+                         them. A separate cleanup ticket can prune them later. -->
```

---

## 3. Why dead code is kept (surgical principle)

The user said "نريد حذف هذا الزر بشكل كامل" (remove this button completely). The button (the DOM element) is what renders to the user. The supporting code is invisible to the user once the button is gone:

| Asset | Status after this fix | Why kept |
|---|---|---|
| `<button>` element | **REMOVED** ✅ | The visible button is what user wanted gone |
| `jumpToActivePrayer()` function (js/app.js:13174) | KEPT (dead code) | Zero callers after this fix; harmless; can be pruned in cleanup ticket |
| `.cha-cta--banner` CSS rules (5 rules at css/style.css:13866+) | KEPT (dead code) | Zero matching elements; harmless |
| `cha.cta_jump` i18n keys (10 lang files) | KEPT (dead code) | Zero `data-i18n` references after the button removal; harmless |

This conservative approach minimizes blast radius. A future `PRAYER-TIMES-JUMP-CTA-DEADCODE-CLEANUP-1` ticket can prune the orphans in one sweep with proper grep + test.

---

## 4. Verification results

### A. Served HTML (curl http://localhost:3000/prayer-times-in-riyadh)
- `<button class="cha-cta--banner">` element count: **0** ✅ (was 1)
- `.cha-cta--banner` class anywhere: **0** ✅ (was 1)
- The 2 grep hits for "cha-cta--banner" and "jumpToActivePrayer(" in served HTML are all inside MY NEW HTML COMMENT (lines 592, 593, 596, 597) — not in active markup.

### B. Live DOM (preview MCP, 390×844)
```
url: http://localhost:3000/prayer-times-in-riyadh
button_present: false               ← button GONE ✅
cta_banner_count: 0                 ← no button.cha-cta--banner ✅
cta_banner_anywhere_count: 0        ← no .cha-cta--banner element ✅
banner_exists: true                 ← parent .next-prayer-banner intact ✅
banner_has_current_prayer: true     ← #banner-current-prayer sibling intact ✅
banner_has_dates: true              ← .banner-block-dates sibling intact ✅
banner_children_count: 2            ← was 3 (current+row+button) → now 2 (current+row)
```

### C. Regression — 7 URLs all return 200
- ✅ `/prayer-times-in-riyadh` (patched page)
- ✅ `/prayer-times-in-makkah`
- ✅ `/en/prayer-times-in-riyadh`
- ✅ `/moon-today`
- ✅ `/qibla-in-riyadh`
- ✅ `/azkar/morning-azkar`
- ✅ `/hijri-calendar`

### D. Regression — my new comment is safe (NO literal HTML tags inside)
Comment-tag scan on `index.html` after fix: my new comment at line 590+ contains NO `<section>`, `<div>`, `<a>`, `<ul>`, `<li>`, `<nav>`, `<button>`, etc. Confirmed safe — can't trigger HOME-MOON-LEAK-style runaway strip.

(Pre-existing `<h2>` inside a comment at line 3633 was found in the AZKAR-MORNING-KEYWORD-CONSISTENCY-1 block — UNRELATED to this fix, NOT triggered by any current strip operation. The pending `SERVER-STRIPELEMENT-COMMENT-AWARE-1` follow-up will address this latent pattern systemically.)

---

## 5. Q&A per user spec

| # | Question | Answer |
|---|---|---|
| 1 | الزر محذوف بالكامل | ✅ نعم — 0 button elements في DOM. `<button class="cha-cta--banner">` غير موجود |
| 2 | بقية محتوى banner سليم | ✅ `#banner-current-prayer` و `.banner-block-dates` كلاهما موجود (children count 2 بدل 3) |
| 3 | JS/CSS/i18n محذوف؟ | جزئيًا — markup الزر محذوف، الكود الداعم محفوظ كـ dead code (لا يضر، يمكن تنظيفه لاحقًا) |
| 4 | صفحات أخرى لم تتأثر | ✅ 7 صفحات regression تُرجع 200 |
| 5 | cache-busters | ✅ `sw v383 → v384` فقط (لا تغيير في js/css لأنهما لم يُمَسّا) |

---

## 6. What is NOT changed (scope fence)

- ❌ صفر تغيير في `js/app.js` (دالة `jumpToActivePrayer` محفوظة)
- ❌ صفر تغيير في `css/style.css` (قواعد `.cha-cta--banner` محفوظة)
- ❌ صفر تغيير في `js/i18n.js` أو `js/i18n/*.js` (مفاتيح `cha.cta_jump` في 10 لغات محفوظة)
- ❌ صفر تغيير في `server.js` / SSR / data / حسابات / FAQ / JSON-LD / canonical / sitemap / routing
- ❌ صفر تغيير في `.next-prayer-banner` الأم (فقط ابن واحد منها حُذف)
- ❌ صفر تغيير في أزرار أخرى أو رسائل أو أيقونات

---

## 7. Cache-buster bumps

| File | From | To |
|---|---|---|
| `sw.js` | `CACHE_VERSION = 'v383'` | `CACHE_VERSION = 'v384'` |

`js/app.js?v=744` unchanged (JS not touched).
`css/style.css?v=459` unchanged (CSS not touched).
Only `sw.js` bumped to invalidate any precached `index.html` in the Service Worker (the served HTML now differs by ~10 lines).

---

## 8. Follow-up tickets (separate, NOT in this commit)

1. **PRAYER-TIMES-JUMP-CTA-DEADCODE-CLEANUP-1** — optional cleanup ticket to prune the orphaned `jumpToActivePrayer()` function (js/app.js:13161-13186 approx), the 5 `.cha-cta--banner` CSS rules (css/style.css:13866-13900 approx), and the 10 `cha.cta_jump` i18n keys. Zero behavior impact since nothing references them. Can be done in one sweep when convenient.
2. **SERVER-STRIPELEMENT-COMMENT-AWARE-1** (already-pending chip from HOME-MOON-LEAK fix) — also addresses any future comment-text leak from `<h2>` etc. tokens inside comments.

---

## 9. Proposed commit message

```
fix(prayer-times): PRAYER-TIMES-JUMP-CTA-BUTTON-REMOVAL-1 — remove "Jump to next prayer" CTA button from next-prayer-banner

Per user request, removed the <button class="cha-cta--banner"
onclick="jumpToActivePrayer()"> element from .next-prayer-banner on
/prayer-times-in-{city} pages.

Markup deleted at index.html:604-612, replaced with an explanatory
HTML comment documenting the removal. The supporting code is KEPT as
harmless dead code (zero callers/references after this fix):
- jumpToActivePrayer() function in js/app.js
- .cha-cta--banner CSS rules in css/style.css (5 rules)
- cha.cta_jump i18n keys across 10 lang files

A separate cleanup ticket (PRAYER-TIMES-JUMP-CTA-DEADCODE-CLEANUP-1)
can prune those orphans later if desired.

Verified:
- Live DOM on /prayer-times-in-riyadh (390x844): button_present=false,
  cta_banner_count=0, parent .next-prayer-banner intact with
  #banner-current-prayer + .banner-block-dates siblings preserved
- Served HTML: 0 <button class="cha-cta--banner"> elements
- 7 regression URLs all 200
- My new HTML comment contains NO literal angle-bracketed tag tokens,
  so it CANNOT trigger the HOME-MOON-LEAK-style _stripElement bug

Untouched: js/app.js (function kept), css/style.css (rules kept),
js/i18n.js + 10 lang files (keys kept), server.js, SSR, data, calc
logic, .next-prayer-banner parent + other children, all other pages.

Cache busters: sw v383 -> v384 only (no JS/CSS bump - neither was
touched).
```

---

## 10. Pre-push checklist

- [x] Single feature, single intent — remove ONE button
- [x] No data mutations
- [x] No JS / CSS / server.js / SSR changes
- [x] HTML markup deletion only
- [x] Button verified gone from DOM (live MCP browser)
- [x] Parent .next-prayer-banner + siblings preserved
- [x] 7 regression URLs return 200
- [x] My new comment is safe (no literal HTML tags inside)
- [x] Cache busters bumped (sw only)
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
