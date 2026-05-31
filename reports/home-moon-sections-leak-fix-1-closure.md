# HOME-MOON-SECTIONS-LEAK-FIX-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Option A only — surgical comment-text edit in `index.html` to remove literal HTML-tag tokens that fooled `server.js` `_stripElement` regex. Comment-only change. Zero code/CSS/JS/strip-algorithm modification.

---

## 1. Files modified (2)

| File | Lines | Change |
|---|---|---|
| `index.html` | +29 / −10 | (a) Comment at L1094-1117 — removed literal `\`<section>\`` etc. + added 13-line root-cause documentation. (b) Comment at L1453-1466 — same defensive cleanup on a latent same-pattern comment (didn't trigger current bug but would have on future strip targets). |
| `sw.js` | +14 / −1 | `CACHE_VERSION v380 → v381` + 13-line header comment documenting this wave. Bump invalidates any precached `index.html` from SW. |

**Did NOT touch:** `server.js`, `js/app.js`, `css/style.css`, any data file, any new file (per user's explicit "تعديل التعليق فقط" instruction).

---

## 2. Exact diffs

### (a) `index.html:1094-1101` (PRIMARY FIX — active bug source)

```diff
                     <!-- CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1 (2026-05-31):
-                         The legacy "Nav" tier (rls-tier-nav, with `rl-weekly`
-                         self-anchor + `rl-country` aggregation link) was
+                         The legacy "Nav" tier (rls-tier-nav, with rl-weekly
+                         self-anchor + rl-country aggregation link) was
                          REMOVED per user spec — replaced by a more useful
                          Islamic-events countdown section emitted as a
-                         sibling `<section>` below this `#related-links-section`
+                         sibling SECTION element below this related-links-section
                          (see immediately after this closing tag). Live + Info
-                         tiers stay intact above. -->
+                         tiers stay intact above.
+                         HOME-MOON-SECTIONS-LEAK-FIX-1 (2026-05-31): the
+                         previous wording of this comment used the literal
+                         text "{section}" wrapped in backticks (where
+                         {section} was the actual angle-bracketed tag name).
+                         server.js _stripElement uses a regex-based balanced-
+                         tag counter ... -->
```

**The critical removal:** the literal text `` `<section>` `` from line 1099 (and matching `` `#related-links-section` ``).

### (b) `index.html:1453-1459` (DEFENSIVE FIX — same latent pattern)

```diff
                         <!-- QIBLA-GENERAL-HOME-SEARCH-BOX-1 (2026-05-18):
-                             Same compact `.city-page-search` component the homepage
-                             and /moon-today use. Input keeps id="qibla-hub-search"
-                             for back-compat with downstream code (`_qibla_hub_pick`
-                             focus, etc.). Dropdown renamed id="qibla-hub-suggestions"
-                             (was `qibla-hub-search-results <ul>`) so it matches the
-                             new `.cps-suggestions <div>` shape from homepage. -->
+                             Same compact .city-page-search component the homepage
+                             and /moon-today use. Input keeps id="qibla-hub-search"
+                             for back-compat with downstream code (_qibla_hub_pick
+                             focus, etc.). Dropdown renamed id="qibla-hub-suggestions"
+                             (was qibla-hub-search-results UL element) so it matches
+                             the new .cps-suggestions DIV element shape from homepage.
+                             HOME-MOON-SECTIONS-LEAK-FIX-1 (2026-05-31): removed
+                             literal angle-bracketed tag tokens ... -->
```

**The critical removals:** `<ul>` and `<div>` (in backticks) replaced with `UL element` and `DIV element`.

---

## 3. Verification (post-fix)

### A. No more literal HTML tags inside any HTML comment in index.html
Re-ran the Perl scan: **ZERO matches** for `<(section|div|a|ul|li|nav|article|aside|main|header|footer)\b` inside `<!-- ... -->`. ✅

### B. `_stripElement` boundary calculation is now correct
Reproduced the algorithm on `related-links-section`:

| Metric | Before fix | After fix |
|---|---|---|
| Strip span (lines) | **1003** (1051→2053) ❌ | **72** (1051→1122) ✅ |
| Includes `</section>` of related-links | No (devoured) | Yes |
| Includes `<section>` of moon-events-section | Yes (devoured) | No |
| Includes `<section>` of other-trending-cities | Yes (devoured) | No |
| Includes `<div class="page" id="page-qibla">` | Yes (devoured) | No |
| Includes `<div class="page" id="page-moon">` | Yes (devoured) | No |

Other strip targets (`other-trending-cities`, `home-quick-access`, `moon-today-card`, `prayer-schedule-section`) all calc to their correct natural spans. ✅

### C. `/` SSR now contains all page wrappers in proper order

```
376:  <div class="page active" id="page-prayer-times">
934:  <div class="page" id="page-qibla" data-qibla-mode="hub">    ← RESTORED
1153: <div class="page" id="page-moon">                            ← RESTORED
1990: <div class="page" id="page-zakat">
...
```

(Before fix: `/` SSR jumped from #page-prayer-times (376) directly to #page-zakat (1162), missing #page-qibla + #page-moon entirely.)

### D. Live DOM on `/` (390×844, light mode)

| Element | State | Note |
|---|---|---|
| Active page | `#page-prayer-times.active` | ✅ correct |
| `#page-moon` | exists, `display: none`, `offsetParent: null` | ✅ correctly hidden |
| `#page-qibla` | exists, `display: none`, `offsetParent: null` | ✅ correctly hidden |
| `#moon-chart-section` | inside `#page-moon`, NOT visible | ✅ |
| `#moon-forecast` | inside `#page-moon`, NOT visible | ✅ |
| `#moon-other-cities` | inside `#page-moon`, NOT visible | ✅ |
| `#moon-general-faq` | inside `#page-moon`, NOT visible | ✅ |
| `#moon-events-section` | inside `#page-moon`, NOT visible | ✅ |

**Zero moon sections rendering on the homepage.** Bug is fixed. ✅

### E. Regression — 8 URLs all return 200
- `/` ✅ (the patched page)
- `/moon-today` ✅
- `/moon-today-in-riyadh` ✅
- `/moon-in-riyadh/2026-05-31` ✅
- `/prayer-times-in-riyadh` ✅
- `/qibla-in-riyadh` ✅
- `/azkar/morning-azkar` ✅
- `/hijri-calendar` ✅

---

## 4. Q&A per pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | السطر المعدّل | `index.html:1099` (primary fix) + `index.html:1459` (defensive) |
| 2 | النص القديم / الجديد | شاهد §2 (diffs الكاملة) |
| 3 | لا يوجد literal `<section>` داخل التعليق | ✅ تأكيد عبر Perl scan — صفر matches |
| 4 | `_stripElement` لا يبتلع أقسامًا إضافية | ✅ تأكيد — span = 72 سطر (كان 1003) |
| 5 | الصفحة الرئيسية لا تحوي أقسام القمر | ✅ تأكيد — جميع moon sections داخل `#page-moon` (hidden) |
| 6 | صفحات القمر سليمة | ✅ /moon-today + 2 variants تُرجع 200 + page-moon active |
| 7 | صفحات الصلاة/القبلة/الأذكار/التقويم لم تتأثر | ✅ 4 صفحات تُرجع 200 |
| 8 | cache-busters محدثة | ✅ `sw v380 → v381` فقط (لا تغيير في js/css cache-busters لأن JS و CSS لم تتغير) |

---

## 5. What is NOT changed (scope fence)

- ❌ صفر تغيير في `server.js` (يحوي `_stripElement` — لـ Option B لاحقًا)
- ❌ صفر تغيير في `js/app.js`
- ❌ صفر تغيير في `css/style.css`
- ❌ صفر تغيير في DOM structure (التغيير في نصوص التعليقات فقط)
- ❌ صفر تغيير في حسابات أو data
- ❌ صفر تغيير في FAQ / JSON-LD / canonical / sitemap / routing / SSR logic
- ❌ صفر تغيير في PRAYER-TIMES-COUNTDOWN-CARD-STYLE-FIX-1 (لا يزال في git stash، سيُستعاد كـ ticket منفصل لاحقًا)
- ❌ لم أبدأ أي عمل أذكار جديد

---

## 6. Follow-up ticket (separate, not in this commit)

**`SERVER-STRIPELEMENT-COMMENT-AWARE-1`** — hardening ticket to teach `server.js:_stripElement` to skip HTML comment regions natively, so even if a future comment contains literal angle-bracketed tag text, the depth-counter stays correct. Should include test coverage on all 8 `_stripHtmlFor*` consumers (home, time-left, npt, city, moon-hub, qibla-hub, hijri-year-hub, hijri-month-hub). Spawning as a separate chip after this fix is approved + pushed.

---

## 7. Proposed commit message

```
fix(home): HOME-MOON-SECTIONS-LEAK-FIX-1 — remove literal angle-bracketed tag text from HTML comments

Comment-only fix in index.html for a page-isolation bug where moon
sections (chart, forecast, FAQ, evergreen) were rendering INSIDE
#page-prayer-times on the / homepage instead of being properly
nested in #page-moon (which itself was missing from / SSR).

Root cause: index.html:1099 (added by 9d393fb) contained the literal
text "<section>" wrapped in backticks for code-documentation. The
regex-based balanced-tag-counter in server.js _stripElement scans
the raw HTML byte-stream and does NOT skip comment regions, so it
treated that comment text as a real opening tag. Depth-count went
off by 1, causing the related-links-section strip on / to
over-consume ~1000 lines (1051-2053 instead of 1051-1102),
devouring the closing div of #page-prayer-times, the entire
#page-qibla wrapper, and most of #page-moon.

Fix:
- index.html:1094-1117 — removed literal `<section>` token from
  the CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1 doc comment;
  prose-rewritten to use "SECTION element" instead. Primary fix.
- index.html:1453-1466 — same defensive cleanup on a latent
  same-pattern comment in QIBLA-GENERAL-HOME-SEARCH-BOX-1 that
  wasn't triggering current bug (no strip target visits that
  region) but would have on any future strip extension. Removed
  literal `<ul>` and `<div>` tokens.
- sw.js: CACHE_VERSION v380 → v381 for SW precache invalidation.

Verified:
- Perl scan: ZERO literal HTML tag tokens inside any HTML comment
- _stripElement span for related-links-section: 72 lines (was 1003)
- / SSR now contains #page-qibla (line 934) + #page-moon (line 1153)
- Live DOM on /: all moon-* sections inside #page-moon (display:none)
- 8 regression URLs all 200

Follow-up: SERVER-STRIPELEMENT-COMMENT-AWARE-1 (separate ticket)
will harden _stripElement to skip comment regions natively.

Untouched: server.js (the strip algorithm), js/app.js, css/style.css,
HijriDate calcs, FAQ, JSON-LD, canonical, sitemap, routing, all
existing SSR logic. PRAYER-TIMES-COUNTDOWN-CARD-STYLE-FIX-1 work
preserved in git stash for a separate cycle.

Cache busters: sw v380 → v381 (no JS/CSS bump — neither was touched).
```

---

## 8. Pre-push checklist

- [x] Single feature, single intent — comment-text fix only
- [x] No `server.js` / `_stripElement` modified
- [x] No CSS / JS / DOM-shape changes
- [x] No data mutations
- [x] Comment-text cleanup confirmed (Perl scan: 0 matches)
- [x] `_stripElement` boundary verified correct (72 vs 1003 lines)
- [x] `/` SSR has page-qibla + page-moon wrappers restored
- [x] Live DOM verified — moon sections inside `#page-moon`
- [x] 8 regression URLs all 200
- [x] `sw.js` CACHE_VERSION bumped (only that)
- [x] PRAYER-TIMES-COUNTDOWN-CARD-STYLE-FIX-1 preserved in git stash
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
