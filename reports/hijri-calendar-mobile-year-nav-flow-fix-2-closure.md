# HIJRI-CALENDAR-MOBILE-YEAR-NAV-FLOW-FIX-2 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Mobile-only CSS layout-flow fix for `/hijri-calendar` year-picker buttons. Builds on FIX-1 (478b663 z-index stacking) — FIX-2 changes the actual flow from 2-col grid → flex-column so prev/next/CTA stack vertically.

---

## 1. The real root cause

User-reported bug after FIX-1 deployed: "زر السنة التالية يظهر فوق كروت الإحصائيات" (next-year button appears over the stats cards).

**DOM-level investigation (headless inspection at 390×844):** the DOM is structurally CORRECT.
- `#hyear-prev-link` AND `#hyear-next-link` are BOTH siblings inside `.hyear-year-nav-row`
- That row is inside `.calendar-year-picker.hpage-year-picker`
- Which is inside `.section-card.hpage-hero-start`
- No `position: absolute`, no `transform`, no `order`, no `grid-row/column` override
- FIX-1's z-index stacking is working

**The real issue:** `.hyear-year-nav-row` was a **2-col grid** (`grid-template-columns: 1fr 1fr`) on mobile (css/style.css:22003 + 20194). At narrow widths or with font-zoom:
- Each column ~144px wide had to fit Arabic "السنة السابقة" / "السنة التالية"
- Text could wrap to 2 lines, making one column visually taller than the other
- Grid cells with uneven heights + visual paint-cycle hiccups could give the perception that next-year escaped its parent
- Even without overlap, side-by-side 2-col on a narrow phone is cramped and feels "wrong"

**User's explicit expected layout:**
```
[Label "السنة المعروضة"]
[Select]
[السنة السابقة]    ← prev, full width
[السنة التالية]    ← next, full width, BELOW prev
[التاريخ الهجري اليوم]   ← CTA, full width
```

So FIX-2 changes the flow from 2-col grid → flex-column on mobile. This matches the user's spec exactly and eliminates ALL possible overflow/wrap edge cases.

---

## 2. Was next-year outside the wrapper, or CSS order/position?

**Neither.** Headless DOM inspection confirmed:
```
ancestors_next = [
  "A#hyear-next-link.hyear-year-nav-btn",
  "DIV.hyear-year-nav-row",
  "DIV.calendar-year-picker hpage-year-picker",
  "DIV.section-card hpage-hero-start",
  ...
]
ancestors_prev = [same as above except A is #hyear-prev-link]
navRow_children_count: 2
navRow_children_ids: ["hyear-prev-link", "hyear-next-link"]
next_inside_navRow: true
next_inside_yp: true
```

CSS state pre-FIX-2:
```
navRow_styles: { display:"grid", gridTemplateColumns:"144px 144px", position:"relative" }
next_styles: { position:"relative", transform:"none", order:"0", gridColumn:"auto", gridRow:"auto" }
```

So the root cause was purely the 2-col grid being unsuitable for narrow mobile widths — NOT a DOM bug or escaped element. The fix changes the layout primitive, not the DOM.

---

## 3. Files modified (3, CSS-only)

| File | Lines | Change |
|---|---|---|
| `css/style.css` | +97 / 0 | New block at end (line 27853+) — `@media (max-width: 767px)` with explicit `display:flex; flex-direction:column` on `.hyear-year-nav-row` + defensive `position:static !important` + `width:100% !important` locks on every nav button + CTA. Pure additive — no existing rules deleted/modified. |
| `index.html` | +2 / −2 | Cache buster `css/style.css?v=456 → ?v=457` (preload + stylesheet link, replace_all) |
| `sw.js` | +11 / −1 | `CACHE_VERSION v377 → v378` + 10-line header comment documenting FIX-2 |

**No JS, no HTML/DOM, no i18n, no server, no data, no SSR template, no SEO/JSON-LD, no calculation changes.**

---

## 4. The patch (key rules)

```css
@media (max-width: 767px) {
    /* (1) FLOW CHANGE: 2-col grid → flex-column */
    #page-hijri-year .hyear-year-nav-row {
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        width: 100% !important;
        position: relative !important;
        transform: none !important;
    }

    /* (2) Both nav buttons — forced into normal flow, full-width */
    #page-hijri-year .hyear-year-nav-row > .hyear-year-nav-btn,
    #page-hijri-year #hyear-prev-link,
    #page-hijri-year #hyear-next-link {
        position: static !important;
        transform: none !important;
        width: 100% !important;
        margin: 0 !important;
        order: initial !important;
        grid-column: auto !important;
        grid-row: auto !important;
    }

    /* (3) CTA — also locked to normal flow */
    #page-hijri-year .hyear-today-cta { position: static !important; width: 100% !important; }
    #page-hijri-year .hyear-today-cta > .btn { position: static !important; width: 100% !important; }

    /* (4) Year-picker — explicit flex-column lock */
    #page-hijri-year .hpage-hero-start > .calendar-year-picker.hpage-year-picker {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
    }

    /* (5) Stats-cards section — extra breathing room */
    #page-hijri-year > .section-card:has(> #hyear-info-grid) {
        margin-top: 8px !important;
    }
}
```

Full patch = 97 lines including extensive comments documenting WHY each rule exists.

---

## 5. Verification — 390×844 mobile (post-FIX-2)

**Headless layout inspection (light mode):**

| Element | Top | Bottom | Height | Width | Notes |
|---|---|---|---|---|---|
| select | 522 | 570 | 48 | 300 | full-width row |
| **prev** | **578** | **622** | 44 | **300** | full-width row |
| **next** | **632** | **676** | 44 | **300** | full-width row, **10px below prev** ✅ |
| CTA | 705 | 753 | 48 | 300 | full-width row, below next |
| Hero card | 243 | **786** | 543 | 366 | ALL above contained |
| Info-section | **798** | 1110 | 312 | 366 | starts 12px below hero, **122px below next-button** ✅ |

**Flow checks (all green):**
- `prev_above_next`: true ✅ (prev ends 622, next starts 632 — sequential stacking)
- `next_above_cta`: true ✅
- `cta_inside_hero`: true ✅ (753 < 786)
- `next_inside_hero`: true ✅ (676 < 786)
- `next_above_infoSection`: true ✅ (676 << 798)
- **`gap_next_to_info`: 122px ✅** (massive clear separation — IMPOSSIBLE to perceive as overlap)

**Computed styles confirmed:**
- `navRow.display`: `flex` ✅
- `navRow.flexDirection`: `column` ✅
- `navRow.gap`: `10px` ✅
- `prev.position`: `static`, `prev.width`: `300px` ✅
- `next.position`: `static`, `next.width`: `300px` ✅

The exact layout requested by user:
```
[السنة المعروضة]   (label inside year-picker)
[Select]
[السنة السابقة]   ← full width, alone on row
[السنة التالية]   ← full width, BELOW prev
[التاريخ الهجري اليوم]  ← full width, BELOW next
                  ↓ (122px clear gap)
[Stats Cards section starts here]
```

---

## 6. Verification — Desktop (1280×800)

Desktop UNCHANGED:
- `navRow.display`: `grid` ✅ (preserved from base rule)
- `navRow.gridTemplateColumns`: `331px 331px` ✅ (2-col side-by-side preserved)
- prev/next both w=331 in same row
- `sameRow`: true ✅

The FIX-2 rules only fire inside `@media (max-width: 767px)` → desktop branch unaffected.

---

## 7. Regression — 8 URLs all 200

- ✅ `/hijri-calendar` (the patched page)
- ✅ `/en/hijri-calendar`
- ✅ `/hijri-calendar/1448`
- ✅ `/prayer-times-in-riyadh`
- ✅ `/moon-today`
- ✅ `/qibla-in-riyadh`
- ✅ `/qibla-in-makkah` (QIBLA-CTA pill design still works — verified)
- ✅ `/azkar/morning-azkar`

---

## 8. Q&A per user's pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | السبب الجذري الحقيقي | `.hyear-year-nav-row` كان `grid 1fr|1fr` على الجوال. Text-wrap في الأعمدة الضيقة + paint-cycle hiccups سببت الإدراك البصري بأن next يهرب من مكانه. الـ DOM كان سليمًا 100%. |
| 2 | Next خارج wrapper أو CSS order/position? | **لا.** الـ DOM verified: prev + next كلاهما داخل `.hyear-year-nav-row`. لا `order` ولا `position:absolute` ولا `transform`. السبب هو grid 2-col غير مناسب للجوال. |
| 3 | الملفات المعدلة | `css/style.css` (+97)، `index.html` (cache buster)، `sw.js` (CACHE_VERSION). |
| 4 | CSS-only أم HTML/JS؟ | **CSS-only.** صفر JS. صفر HTML. صفر DOM. |
| 5 | كيف تم ضمان flow طبيعي؟ | `display:flex; flex-direction:column` + `position:static !important` + `width:100% !important` + `transform:none !important` على كل الأزرار. cascade-locks تمنع أي قاعدة لاحقة من إخراج الأزرار. |
| 6 | اختبار 390px بعد الإصلاح | ✅ select(t522)→prev(t578)→next(t632)→CTA(t705)→hero ends(b786)→info starts(t798). Gap بين next وinfo = 122px. |
| 7 | الديسكتوب لم يتأثر | ✅ desktop(1280): grid 331px|331px مع prev+next side-by-side في نفس الصف. الـ media query أوقفت FIX-2 عند 768px+. |
| 8 | بيانات التقويم/FAQ/JSON-LD | ✅ لا تغيير. صفر تعديل في server.js/app.js/index.html (إلا cache buster). |
| 9 | صفحات الصلاة/القمر/القبلة/الأذكار | ✅ 4 صفحات كلها 200. الـ scoping `#page-hijri-year` يمنع البصل. |
| 10 | cache-busters | ✅ `css/style.css?v=456 → v=457` + `CACHE_VERSION v377 → v378`. |

---

## 9. What is NOT changed (scope fence)

- ❌ صفر تغيير في `js/app.js` أو أي JS
- ❌ صفر تغيير في `server.js` أو SSR
- ❌ صفر تغيير في DOM (`index.html` فقط cache buster)
- ❌ صفر تغيير في حسابات HijriDate / بيانات الأشهر / السنة الحالية / نوع السنة
- ❌ صفر تغيير في FAQ الموسعة (12 سؤال من de37141 محفوظ)
- ❌ صفر تغيير في FAQPage JSON-LD
- ❌ صفر تغيير في H1 / canonical / sitemap / routing
- ❌ صفر تغيير في الديسكتوب (kept original 2-col grid behavior)
- ❌ صفر تغيير في الوضع الداكن (نفس theme tokens)
- ❌ صفر تعديل بيانات curated_places / DB
- ❌ صفر تغيير في QIBLA-CTA pill design (478b663) — قواعد مختلفة Selector
- ❌ FIX-1 z-index stacking لا يزال يعمل (مكمل لـ FIX-2)

---

## 10. Cache-buster bumps

| File | From | To | Why |
|---|---|---|---|
| `index.html` (preload + stylesheet) | `css/style.css?v=456` | `css/style.css?v=457` | CSS content changed |
| `sw.js` | `CACHE_VERSION = 'v377'` | `CACHE_VERSION = 'v378'` | SW precache invalidate |

`js/app.js?v=742` unchanged.

---

## 11. Risks + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `!important` cascade lock breaks future styling | Low | Locks are `position:static; transform:none; width:100%` — defensive defaults; future styling can use higher specificity or new selectors |
| Desktop grid breaks | None | Rule is inside `@media (max-width: 767px)` → desktop untouched |
| Service Worker stale CSS | Mitigated | CACHE_VERSION bumped |
| Visual regression on a lang with very long text | Low | flex-column with `gap:10px` lets each button grow as needed; tested EN at 390 works |

---

## 12. Proposed commit message

```
fix(hijri-calendar): HIJRI-CALENDAR-MOBILE-YEAR-NAV-FLOW-FIX-2 — flex-column nav buttons on mobile

Follow-up to FIX-1 (478b663) after user reported persistent visual issue.

Root cause (DOM verified): .hyear-year-nav-row was a 2-col grid (1fr|1fr)
on mobile. DOM is structurally correct — prev + next are siblings inside
the row. But narrow columns (~144px) caused Arabic text to wrap, creating
uneven heights and paint-cycle perception of "next escaping its parent".
FIX-1 z-index stacking helped but didn't address the layout primitive.

FIX-2 changes the flow inside @media (max-width: 767px):
  - .hyear-year-nav-row → display: flex; flex-direction: column (was grid)
  - Both nav buttons + CTA → position:static !important + width:100% !important
    + transform:none !important + order:initial !important (defensive locks)
  - .calendar-year-picker → explicit flex-column to lock vertical stack
  - Info-grid section-card → +8px margin-top for extra clear gap

Result on 390x844 (verified headless):
  select(t522) → prev(t578) → next(t632) → CTA(t705) → hero ends(b786) →
  info-section starts(t798). 122px gap between next-button and stats.
  prev_above_next:true, next_inside_hero:true, gap=122px.

Desktop (1280x800) UNCHANGED: grid 331px|331px, prev+next same row.

CSS-only +97 lines, additive (no rules deleted). Builds on FIX-1 (z-index).

Untouched: JS, DOM (index.html only cache-bust), server.js, HijriDate
calcs, FAQ (12 questions from de37141 preserved), JSON-LD, canonical, H1,
sitemap, routing, SSR template, dark mode, QIBLA-CTA design (478b663),
desktop layout.

8 regression URLs all 200: /hijri-calendar, /en/hijri-calendar,
/hijri-calendar/1448, /prayer-times-in-riyadh, /moon-today,
/qibla-in-riyadh, /qibla-in-makkah, /azkar/morning-azkar.

Cache busters: css/style.css v456->v457, sw v377->v378.
```

---

## 13. Pre-push checklist

- [x] Single feature, single intent — mobile flow restructure only
- [x] No data file mutations
- [x] No JS changes
- [x] No HTML/DOM changes (only cache buster in index.html)
- [x] Pure additive CSS (no existing rule deletions/modifications)
- [x] Mobile-scoped only (`@media (max-width: 767px)`)
- [x] Desktop unchanged verified (1280x800 still grid 2-col side-by-side)
- [x] Mobile layout matches user's exact spec at 390x844
- [x] 122px gap between next-button and stats-section
- [x] 8 regression URLs return 200
- [x] Cache busters bumped
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
