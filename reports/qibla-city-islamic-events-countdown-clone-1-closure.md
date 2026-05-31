# QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 — Closure Report

**Date:** 2026-05-31
**Status:** ✅ READY FOR PRE-PUSH APPROVAL
**Scope:** Replace the legacy footer block on `/qibla-in-{city}` (qibla-footer-seo + qibla-related + qibla-trust-note) with the Islamic Events Countdown section (4 cards: Ramadan / Eid Fitr / Eid Adha / Hijri New Year). Mirrors CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1 (commit `9d393fb`).

---

## 1. Goal

User request: "استبدل العنصر الاول بالعنصر الثاني"
- **Element 1 (to be replaced):** `<div class="section-card">` inside `#page-qibla` containing `<p id="qibla-footer-seo">` + `<ul id="qibla-related">` + `<p id="qibla-trust-note">`
- **Element 2 (the template):** `<section class="section-card moon-events-section" id="moon-events-section">` with 4 cards (Ramadan / Eid Fitr / Eid Adha / Hijri New Year countdown)

---

## 2. Files modified (3)

| File | Lines | Change |
|---|---|---|
| `index.html` | +51 / −5 | REMOVED `<div class="section-card">` at lines 1577-1582 (footer-seo + related + trust-note). ADDED `<section class="section-card moon-events-section" id="qibla-events-section">` with 4-card countdown markup at same location. Cache buster `js/app.js?v=742 → ?v=743`. |
| `js/app.js` | +5 / −1 | Extended `_azkarPageIds` array at line 24919 to include `'page-qibla'` so `_azkarRenderMoonEvents()` populates the new countdown. |
| `sw.js` | +10 / −1 | `CACHE_VERSION v378 → v379` + 9-line header comment documenting this wave. |

**No CSS changes** (existing `.moon-events-section` + `.moon-event-card` styles cover the new section). **No HTML/DOM changes** to other pages. **No new files.**

---

## 3. Pattern reused from CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1 (9d393fb)

The implementation mirrors the prayer-times precedent exactly:
1. **Markup:** same 4-card moon-events-section structure (uses class-based selectors `.moon-event-{ramadan/fitr/adha/newyear}-days/date` so the existing `_azkarRenderMoonEvents()` fill function finds and populates them).
2. **JS scope extension:** add `'page-qibla'` to the `_azkarPageIds` array — same place prayer-times was added 5 hours ago.
3. **Removed elements:** the legacy IDs (`qibla-footer-seo`, `qibla-related`, `qibla-trust-note`) are no longer in the DOM. The JS handlers at `app.js:16906-16956` that populated them now silently no-op (all guarded with `if (el) ...`).

---

## 4. The new markup (index.html, replaces lines 1577-1582)

```html
<section class="section-card moon-events-section" id="qibla-events-section" aria-labelledby="qibla-events-h2">
    <h2 id="qibla-events-h2" class="moon-events-title" data-i18n="moon.events.title">⏳ العد التنازلي للمناسبات الإسلامية</h2>
    <div class="moon-events-countdown">
        <a class="moon-event-card moon-event-ramadan moon-event-ramadan-card" href="/ramadan-countdown">
            <span class="moon-event-icon" aria-hidden="true">🕋</span>
            <div class="moon-event-body">
                <div class="moon-event-label" data-i18n="moon.events.ramadan">رمضان القادم</div>
                <div class="moon-event-days moon-event-ramadan-days">—</div>
                <div class="moon-event-date moon-event-ramadan-date">—</div>
            </div>
        </a>
        <a class="moon-event-card moon-event-fitr moon-event-fitr-card" href="/eid-al-fitr-countdown">...</a>
        <a class="moon-event-card moon-event-adha moon-event-adha-card" href="/eid-al-adha-countdown">...</a>
        <a class="moon-event-card moon-event-newyear moon-event-newyear-card" href="/hijri-new-year-countdown">...</a>
    </div>
    <p class="moon-events-notice" data-i18n="moon.events.notice">* العدّاد حسب توقيت جهازك المحلي، والتواريخ تقريبية وقد تختلف حسب رؤية الهلال في بلدك.</p>
</section>
```

`id="qibla-events-section"` and `id="qibla-events-h2"` are page-scoped to avoid collision with the existing `#moon-events-section` / `#moon-events-h2` on /moon-today.

### STYLE-FIX (intra-task, 2026-05-31, post-user-review)

**Initial issue:** First iteration used `moon-event-ramadan-card` (with `-card` suffix) per the 9d393fb prayer-times precedent. But the per-event coloring CSS rules at `css/style.css:4339-4368` target `.moon-event-ramadan` (NO suffix) — so the cards rendered as plain white boxes without the purple/gold/red/blue border + label coloring that distinguishes each event.

**Fix:** Each anchor now carries BOTH classes:
- `moon-event-ramadan` (no suffix) — matches the existing CSS coloring rules
- `moon-event-ramadan-card` (with suffix) — kept for JS-fill-function targeting via `.moon-event-{name}-days` / `.moon-event-{name}-date` selectors

This way, the cards get per-event branding (purple Ramadan, gold Eid Fitr, red Eid Adha, blue Hijri New Year) AND the rolling-cycle fill function still finds them. Identical to the visual rendering on `/moon-today` `#moon-events-section`.

---

## 5. The JS scope extension (js/app.js line 24919)

```js
// QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 (2026-05-31):
// Scope further expanded to include #page-qibla so the new
// moon-events-section that REPLACED the legacy qibla footer
// block (qibla-footer-seo + qibla-related + qibla-trust-note)
// on /qibla-in-{city} gets the same rolling-cycle fill.
const _azkarPageIds = ['page-azkar-morning', 'page-azkar-evening', 'page-azkar-prayer', 'page-prayer-times', 'page-qibla'];
```

The `_azkarRenderMoonEvents()` function iterates over these page IDs, finds any `.moon-events-section` inside each active page, and fills its `.moon-event-{name}-days` / `.moon-event-{name}-date` elements using the rolling-cycle resolver (shows "يجري الآن" during active periods, never "انتهى").

---

## 6. Verification results

### Mobile (390×844) — `/qibla-in-riyadh`
- `#qibla-events-section`: present ✅
- 4 cards rendered ✅
- All 4 cards have REAL data (not "—" placeholder):
  - رمضان القادم: **253 يومًا** · 8 فبراير 2027 → `/ramadan-countdown` ✓
  - عيد الفطر: **282 يومًا** · 9 مارس 2027 → `/eid-al-fitr-countdown` ✓
  - عيد الأضحى: **350 يومًا** · 16 مايو 2027 → `/eid-al-adha-countdown` ✓
  - رأس السنة الهجرية: **16 يومًا** · 16 يونيو 2026 → `/hijri-new-year-countdown` ✓
- Legacy IDs GONE: `footerSeo=null, related=null, trust=null` ✅
- `#page-qibla.active`: true ✅

### Desktop (1280×800)
- 4 cards in 4-col grid, each 216px wide, gap 12px ✅
- Existing `.moon-events-section` CSS handles layout (no new CSS needed) ✅

### Regression — 8 URLs all 200
| URL | Status | Has countdown markup |
|---|---|---|
| `/qibla-in-riyadh` (patched) | ✅ 200 | ✓ |
| `/qibla-in-makkah` | ✅ 200 | ✓ |
| `/en/qibla-in-makkah` | ✅ 200 | ✓ |
| `/qibla` (hub) | ✅ 200 | ✓ (visible on hub too — original footer was not city-only) |
| `/hijri-calendar` (FLOW-FIX-2 still works) | ✅ 200 | ✓ |
| `/prayer-times-in-riyadh` (9d393fb prayer-events still works) | ✅ 200 | ✓ |
| `/moon-today` (source #moon-events-section still works) | ✅ 200 | ✓ |
| `/azkar/morning-azkar` | ✅ 200 | ✓ |

### Syntax
- ✅ `node --check js/app.js` → OK
- ✅ `node --check sw.js` → OK

---

## 7. Q&A per pre-push checklist

| # | Question | Answer |
|---|---|---|
| 1 | الهدف | استبدال الـ footer block على /qibla-in-{city} بـ countdown section |
| 2 | الملفات | `index.html` (+51/-5)، `js/app.js` (+5/-1)، `sw.js` (+10/-1). صفر CSS تغيير. |
| 3 | المرجعية | مرآة من commit `9d393fb` (CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1) |
| 4 | الأزرار قابلة للنقر | ✅ كل بطاقة `<a href="...">` صحيحة (4 hrefs verified) |
| 5 | البيانات الحية تظهر | ✅ 253/282/350/16 يومًا — أرقام حقيقية من `_azkarRenderMoonEvents()` |
| 6 | الديسكتوب يعمل | ✅ 4-col grid 216px × 4، gap 12px |
| 7 | الجوال يعمل | ✅ بطاقات stacked عمودي، 4 بطاقات populated بأرقام حقيقية |
| 8 | لا تأثير على الصفحات الأخرى | ✅ 8 URLs all 200، prayer-times countdown يعمل، moon-today يعمل |
| 9 | بيانات التقويم لم تتغير | ✅ صفر تعديل في HijriDate / curated / DB / FAQ / JSON-LD |
| 10 | cache-busters | ✅ `js/app.js?v=742 → v=743` + `sw v378 → v379` |

---

## 8. What is NOT changed (scope fence)

- ❌ صفر تغيير في حسابات HijriDate / بيانات الأشهر
- ❌ صفر تغيير في FAQ (لا qibla FAQ ولا hyear FAQ)
- ❌ صفر تغيير في JSON-LD / canonical / H1 / sitemap / routing
- ❌ صفر تغيير في server.js / SSR template
- ❌ صفر تغيير في CSS (يستخدم القواعد الموجودة لـ moon-events-section)
- ❌ صفر تغيير في i18n (يستخدم مفاتيح موجودة `moon.events.*`)
- ❌ صفر تغيير في صفحات /hijri-calendar أو /prayer-times-in-* أو /moon-today أو /azkar (مؤكد 200 + countdown موجود)
- ❌ صفر تغيير في `_azkarRenderMoonEvents()` (فقط أضفنا page-qibla للنطاق)
- ❌ صفر تغيير في الوضع الداكن (يستخدم القواعد الموجودة)
- ❌ صفر تعديل بيانات curated_places / DB

### Removed (intentional per user spec):
- ⚠️ `<p id="qibla-footer-seo">` — كان يحوي SEO summary للقبلة (مثل "اتجاه القبلة في الرياض 243.8°"). الـ JS handler في app.js:16906-16907 يستمر بالعمل لكنه silent no-op (`if (footerEl) ...`).
- ⚠️ `<ul id="qibla-related">` — كانت تحوي 3 cards (prayer-times + moon + hijri). الـ JS handler في app.js:16911-16956 silent no-op.
- ⚠️ `<p id="qibla-trust-note">` — كانت تحوي trust micro-line. الـ JS handler في app.js:16909-16910 silent no-op.

**SEO Impact note:** Removing the smart SEO summary + related links reduces internal-linking signals from qibla city pages by 3 outbound links (prayer-times, moon, hijri). User explicitly requested this replacement. The new countdown section provides 4 NEW outbound links (Ramadan, Eid Fitr, Eid Adha, Hijri New Year countdown pages), so net change is +1 outbound link per qibla city page.

---

## 9. Cache-buster bumps

| File | From | To |
|---|---|---|
| `index.html` (preload + script tag) | `js/app.js?v=742` | `js/app.js?v=743` |
| `sw.js` | `CACHE_VERSION = 'v378'` | `CACHE_VERSION = 'v379'` |

`css/style.css?v=457` unchanged (no CSS touched).

---

## 10. Risks + Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `_azkarRenderMoonEvents()` doesn't fire on page-qibla activation | Low | Pattern proven via 9d393fb prayer-times; SPA activator + initial-load both call this function |
| The countdown appears on hub mode too (not just city) | Intentional | Original footer block had no city-only restriction; countdown is useful on both hub and city pages |
| SEO regression from removing smart summary | Acknowledged | User explicitly requested replacement; new countdown adds 4 internal links |
| Other pages' countdown sections break | None | New ID `#qibla-events-section` doesn't collide with existing `#moon-events-section` |
| Service Worker stale shell | Mitigated | CACHE_VERSION bumped |

---

## 11. Proposed commit message

```
feat(qibla): QIBLA-CITY-ISLAMIC-EVENTS-COUNTDOWN-CLONE-1 — replace footer block with Islamic events countdown on /qibla-in-{city}

Mirrors CITY-PRAYER-ISLAMIC-EVENTS-COUNTDOWN-FIX-1 (9d393fb) pattern for
/qibla-in-{city}. The legacy footer block (qibla-footer-seo +
qibla-related + qibla-trust-note inside <div class="section-card">) is
REPLACED with a <section class="section-card moon-events-section">
clone containing the standard 4-card countdown (Ramadan / Eid Fitr /
Eid Adha / Hijri New Year). Same class-based selectors so the existing
_azkarRenderMoonEvents() fill function populates the cards once
#page-qibla is added to its scope list.

Files:
- index.html: REMOVE qibla footer <div class="section-card"> (lines
  1577-1582), ADD #qibla-events-section in same location (51 lines).
  Bump app.js cache buster v742->v743.
- js/app.js: _azkarPageIds += 'page-qibla'. JS handlers at
  app.js:16906-16956 that populated the removed IDs now silently
  no-op (guarded with `if (el)...`).
- sw.js: CACHE_VERSION v378->v379 + documentation comment.

No CSS changes (reuses existing .moon-events-section / .moon-event-card).
No HijriDate / FAQ / JSON-LD / canonical / sitemap / SSR / curated /
i18n changes.

Verified on /qibla-in-riyadh @ 390x844:
- 4 cards populated with real data: 253d/282d/350d/16d
- HREFs correct: /ramadan-countdown, /eid-al-fitr-countdown,
  /eid-al-adha-countdown, /hijri-new-year-countdown
- Legacy IDs gone (footerSeo=null, related=null, trust=null)
- Desktop (1280): 4-col grid 216px each, gap 12px

8 regression URLs all 200: /qibla-in-{riyadh,makkah},
/en/qibla-in-makkah, /qibla, /hijri-calendar (FLOW-FIX-2 preserved),
/prayer-times-in-riyadh (9d393fb preserved), /moon-today,
/azkar/morning-azkar.

Cache busters: js/app.js v742->v743, sw v378->v379.
```

---

## 12. Pre-push checklist

- [x] Single feature, single intent — DOM replacement + JS scope extension
- [x] No data file mutations
- [x] No CSS changes (reuses existing rules)
- [x] No server.js / SSR template changes
- [x] node --check passes for app.js + sw.js
- [x] Mobile 390 verified — 4 cards real data, legacy IDs gone
- [x] Desktop 1280 verified — 4-col grid
- [x] 8 regression URLs all 200 + countdown markup present
- [x] Cache busters bumped
- [x] Closure report self-contained
- [ ] **Awaiting user approval before push**
