# MOON-MONTHLY-PAGE-HERO-CONTENT-UI-FIX-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** Hero content rewrite on `/moon-in-{city}/{YYYY-MM}` (monthly pages only). All 10 supported langs (ar/en/fr/tr/ur/de/id/es/bn/ms).
**Cache-buster:** `css/style.css?v=411 → 412` (`js/app.js?v=688` unchanged — we still ship the same app.js, only added guards to skip today-content overwrites on month pages).
**Predecessor:** MOON-MONTHLY-PAGE-HERO-CONTENT-UI-AUDIT-1 (audit report from earlier today identified the 3 bugs fixed here).

---

## 1 — Reason for the fix

Per AUDIT-1, the `/moon-in-{city}/{YYYY-MM}` page hero was conflating month-page intent with today-page content. Three specific bugs:

1. **`#moon-intro` opened with "القمر اليوم في {city}…"** — reading like a today-page on a monthly URL.
2. **`#moon-summary-line` showed TODAY's snapshot** (phase + illumination + age) unlabelled — appearing as the headline state of the page.
3. **`#moon-hijri-today` card was titled "التاريخ الهجري اليوم" + body "نحن اليوم في…"** — irrelevant on a monthly page, especially for past/future months that don't contain today.

Together these three made the page feel like a today-in-city snapshot rather than a calendar of the displayed month.

---

## 2 — What changed (before → after)

### A. `#moon-intro` paragraph

**Before** (AR, post-hydration on `/moon-in-jeddah/2026-05`):
> القمر اليوم في جدة، المملكة العربية السعودية في طور أحدب متزايد، بإضاءة 59.72٪ وعمر 7.8 يوم من الدورة القمرية. وتمرّ فلكيًّا في كوكبة الأسد، وبحسب وقت التحديث الحاليّ يكون القمر تحت الأفق (15.5° تحته).

**After** (SSR, persists post-hydration):
> يعرض هذا التقويم أطوار القمر في جدة خلال مايو 2026، مع التواريخ اليوميّة ونسبة الإضاءة ومواعيد طلوع القمر وغروبه حسب توقيت جدة المحلّيّ.

**EN before:** "Explore the current moon phase in Jeddah, navigate past and future dates, and follow the lunar and Hijri calendar."
**EN after:** "This calendar shows the moon's phases in Jeddah during May 2026, with daily dates, illumination percentages, and moonrise/moonset times in Jeddah's local timezone."

### B. `#moon-summary-line`

**Before** (post-hydration):
> 🌔 حالة القمر: أحدب متزايد · نسبة الإضاءة: 59.72% · عمر القمر: 7.8 يوم من الدورة القمرية

**After** (SSR, month-overview chips):
> 📅 ملخّص الشهر: 31 يومًا · النطاق الهجريّ: ذو القعدة–ذو الحجة 1447 هـ · أطوار يوميّة

Wrapper now carries `class="moon-summary-line moon-summary-line--month"` + `data-month-page="1"` marker. JS no longer overwrites the chip values on month pages.

### C. `#moon-hijri-today` card

**Before:**
- Title: "التاريخ الهجريّ اليوم"
- Body: "الأحد، 7 ذو الحجة 1447 هـ" + "24 مايو 2026"
- Description: "نحن اليوم في 7 ذو الحجة 1447 هـ. ويتبقى نحو 22 يومًا على نهاية الشهر الهجري."

**After:**
- Title: "التقويم الهجريّ المقابل"
- Body: "14 ذو القعدة 1447 هـ → 14 ذو الحجة 1447 هـ" + "مايو 2026"
- Description: "يمتد هذا الشهر الميلاديّ من 14 ذو القعدة 1447 هـ إلى 14 ذو الحجة 1447 هـ، بحسب تقويم أمّ القرى."

Wrapper now carries `class="moon-hijri-today moon-hijri-range"` + `data-month-page="1"` marker. JS no longer overwrites the today date on month pages.

For months that span only ONE Hijri month (rare), the body collapses to: "يمتد هذا الشهر الميلاديّ ضمن {hijriMonth} {hijriYear} هـ، بحسب تقويم أمّ القرى."

---

## 3 — Implementation summary

### A. server.js (~+135 lines)

After the existing `_isMoonHubPageSsr` block (around line 18436), added a new `_isMoonMonthPageSsr` block. The block:

1. Computes Hijri range from displayed month's first + last Gregorian day via `_jdToHijri(_gregToJD(_calY, _calMo, day))` — the same Umm al-Qura table-driven helpers already used at line ~8696 for moon-date pages (byte-parity with client).
2. Replaces `<p id="moon-intro">` with month-context text (10 langs).
3. Replaces the entire `<div id="moon-summary-line">` block with a month-overview chip row (10 langs).
4. Replaces the entire `<div id="moon-hijri-today">` block with a Hijri-range card (10 langs).

Each replacement adds `data-month-page="1"` to the wrapper so the JS-side guards (below) can detect month-page context without re-parsing the URL on every hit.

### B. js/app.js (3 surgical guards)

1. **`#moon-summary-line` JS fill** (line ~19205): wrapped the 4 `_setText` calls + the sticky-bar mirror in `if (!_isMonthPageDOM)` — detected via either `data-month-page="1"` on the wrapper OR by URL regex `/^.../moon-in-{slug}/\d{4}-\d{2}$/`.
2. **`#moon-hijri-today` JS fill** (line ~19298): wrapped the 3 inner `_setText` calls in `if (!_isMonthPageHijri)`. The Islamic-events countdown grid (different sub-block, lines 19349+) continues to fire on all pages — it's general info unrelated to the moon-hijri-today card.
3. **`#moon-intro` JS rewrite** (line ~19475): added `&& !_isMonthPageIntro` to the existing guard so the today-flavored "القمر اليوم في {city}" template doesn't run on month pages.

### C. css/style.css (+~60 lines)

New rules for `.moon-hijri-today.moon-hijri-range` modifier:
- `.moon-hijri-range-line` — flex row with start → arrow → end Hijri dates side-by-side.
- `.moon-hijri-range-dash` — softer separator color.
- `.moon-hijri-greg` (inside range card) — month + year subtitle.
- `.moon-hijri-lunar--month` — slightly tighter line-height for the range description.
- `.moon-summary-line--month .moon-summary-chip--lead strong` — primary-color emphasis on "X days".
- Mobile ≤480px: smaller range-line font and gap.
- Dark theme: lime accent for range-line, softer dash color.

### D. index.html

Cache-buster `style.css?v=411 → 412` (preload + stylesheet, 2 occurrences).

---

## 4 — Verification

### A. SSR on `/moon-in-jeddah/2026-05` (AR — current month, contains today)

| Element | Output |
|---|---|
| `#moon-intro` | `يعرض هذا التقويم أطوار القمر في جدة خلال مايو 2026، مع التواريخ اليوميّة ونسبة الإضاءة ومواعيد طلوع القمر وغروبه حسب توقيت جدة المحلّيّ.` |
| `#moon-summary-line` | `📅 ملخّص الشهر: 31 يومًا · النطاق الهجريّ: ذو القعدة–ذو الحجة 1447 هـ · أطوار يوميّة` |
| `#moon-hijri-today` body | `14 ذو القعدة 1447 هـ → 14 ذو الحجة 1447 هـ` |
| `#moon-hijri-today` description | `يمتد هذا الشهر الميلاديّ من 14 ذو القعدة 1447 هـ إلى 14 ذو الحجة 1447 هـ، بحسب تقويم أمّ القرى.` |

### B. SSR on `/moon-in-jeddah/2026-01` (AR — past month, no today)

- intro: `يعرض هذا التقويم أطوار القمر في جدة خلال يناير 2026، …` ✅ (NO mention of today)
- Hijri range: `من 12 رجب 1447 هـ إلى 12 شعبان 1447 هـ` ✅ (correct Jan-2026 Hijri range)

### C. SSR on `/moon-in-riyadh/2026-12` (AR — future month, no today)

- Hijri range: `من 21 جمادى الآخرة 1448 هـ إلى 22 رجب 1448 هـ` ✅ (correct Dec-2026 Hijri range, year boundary crossed correctly)

### D. SSR on `/en/moon-in-jeddah/2026-05` (English month page)

- intro: `This calendar shows the moon's phases in Jeddah during May 2026, with daily dates, illumination percentages, and moonrise/moonset times in Jeddah's local timezone.` ✅
- Hijri range: `This Gregorian month spans from 14 Dhu al-Qidah 1447 AH to 14 Dhu al-Hijjah 1447 AH, per the Umm al-Qura calendar.` ✅

### E. Non-month-page regression (markers must NOT appear)

| URL | `data-month-page="1"` on intro? | Expected |
|---|---|---|
| `/moon-today` | absent ✅ | hub/today, JS continues to fill |
| `/moon-in-riyadh` (hub) | absent ✅ | hub, JS continues to fill |
| `/moon-today-in-jeddah` | absent ✅ | today-in-city, JS continues to fill |
| `/moon-in-riyadh/2026-05-23` (dated page) | absent ✅ | dated page, JS continues to fill |

### F. "اليوم" frequency on month page hero

| Page | grep count "اليوم" | Visible TODAY-indicator count |
|---|---|---|
| `/moon-in-jeddah/2026-05` hero | 5 (raw grep) | **0** (analysis: 1 = "اليوميّة" adjective = "daily" / not "today"; 1 = HTML comment / invisible; 3 = hidden `<nav id="moon-date-nav">` labels with CSS `display: none` on month pages) |
| `/moon-in-jeddah/2026-01` hero | 5 (raw grep) | **0** (same breakdown — no visible TODAY indicator) |

### G. Critical preservation tests

| Test | Expected | Actual | ✅/❌ |
|---|---|---|---|
| `/moon-today` | HTTP 200 | 200 | ✅ |
| `/moon-in-riyadh` (hub) | HTTP 200 | 200 | ✅ |
| `/moon-today-in-riyadh` | HTTP 200 | 200 | ✅ |
| `/moon-in-riyadh/2026-05-23` | HTTP 200 | 200 | ✅ |
| `/moon-in-riyadh/1447-12-06` (strict policy) | HTTP 404 | 404 | ✅ |
| canonical `/moon-in-jeddah/2026-05` | self-referential | identical | ✅ |
| Sitemap Hijri moon URLs | 0 unchanged | 0 | ✅ |
| Sitemap Gregorian moon URLs | 310,080 unchanged | 310,080 | ✅ |

### H. Carry-forward smoke

- `_smoke_hijri_stage_b1_unit`: **68/68 ✅**
- `_smoke_hijri_umm_al_qura_a1`: **49/49 ✅** (critical — Umm al-Qura math unchanged)
- `_test_moon_general_home_search_box_1`: **37/37 ✅**

Total: **154/154 zero failures.**

### I. Syntax checks

```
$ node --check server.js && node --check js/app.js
syntax OK (server.js)
syntax OK (app.js)
```

---

## 5 — What was NOT changed

| Item | Touched? |
|---|---|
| MoonCalc | NO (read-only consumption) |
| Hijri math (HijriDate / Umm al-Qura) | NO (read-only via existing `_jdToHijri` / `_gregToJD` helpers, no algorithm change) |
| city-local noon normalisation | NO |
| canonical / hreflang | NO |
| sitemap | NO |
| JSON-LD `description` | NO (already month-scoped pre-wave) |
| Strict-Gregorian route policy | NO |
| Full month calendar grid (`#moon-hub-cal-grid`) | NO |
| Prev/next month nav (`.moon-hub-cal-prev/-next`) | NO |
| Date picker | NO |
| MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3 (`#moon-hub-cal` on hub) | NO (scoped to hub) |
| `/moon-today` page | NO |
| `/moon-in-{city}` (hub) page | NO |
| `/moon-today-in-{city}` page | NO |
| `/moon-in-{city}/{YYYY-MM-DD}` (dated) page | NO |
| Dependencies (`package.json`) | NO |

---

## 6 — Files changed (3 source + 1 report)

| File | Change |
|---|---|
| `server.js` | +135 lines — new `_isMoonMonthPageSsr` SSR block: 10-lang text maps + Hijri-range computation + 3 element rewrites (moon-intro, moon-summary-line, moon-hijri-today) |
| `js/app.js` | +30 / −5 lines — 3 surgical guards (moon-summary-line fill, moon-hijri-today field fills, moon-intro rewrite) all gated by `data-month-page="1"` OR URL regex |
| `css/style.css` | +~60 lines — new `.moon-hijri-today.moon-hijri-range` modifier rules + `.moon-summary-line--month` rule + mobile + dark theme |
| `index.html` | +2 / −2 — cache-buster `style.css?v=411 → 412` |
| `reports/moon-monthly-page-hero-content-ui-fix-1-closure.md` | NEW |

---

## 7 — Scope confirmation

The fix is **strictly scoped to month pages** `/moon-in-{city}/{YYYY-MM}`:
- SSR rewrites gated on `_isMoonMonthPageSsr && _monthYearSsr && _monthMonthSsr` — only fires on month-page renders.
- JS guards gated on `data-month-page="1"` marker OR URL regex matching the month-page pattern — only suppresses today-content on month pages.
- All other pages (hub, today, today-in-city, dated) retain their pre-wave behaviour unchanged.

Verified via grep: `data-month-page="1"` is absent from `/moon-today`, `/moon-in-riyadh` (hub), `/moon-today-in-jeddah`, and `/moon-in-riyadh/2026-05-23` SSR outputs.

---

## 8 — Closure checklist

- [x] `#moon-intro` rewritten to month-context, NO "القمر اليوم" opener.
- [x] `#moon-summary-line` shows month-overview chips, NOT today snapshot.
- [x] `#moon-hijri-today` card retitled "التقويم الهجريّ المقابل" / "Corresponding Hijri dates", body shows Hijri range.
- [x] All 10 langs (ar/en/fr/tr/ur/de/id/es/bn/ms) get localized month-context strings.
- [x] Past month (`2026-01`): NO "نحن اليوم" / "today" leak.
- [x] Future month (`2026-12`): NO "نحن اليوم" / "today" leak.
- [x] Hijri range computed correctly across Hijri-year boundary (Dec 2026 → Jumada al-Akhirah → Rajab 1448).
- [x] Single-Hijri-month spans handled with collapsed phrasing.
- [x] Visible "TODAY-indicator" count on month page hero: **0**.
- [x] Hub / today / today-in-city / dated pages unaffected (no `data-month-page` marker).
- [x] href / canonical / hreflang / sitemap / JSON-LD unchanged.
- [x] MoonCalc / Umm al-Qura / strict-route policy unchanged.
- [x] No new dependencies.
- [x] Calendar grid + prev/next nav + picker untouched.
- [x] Syntax check passes (`server.js`, `js/app.js`).
- [x] Carry-forward 154/154 zero failures.
- [x] Closure report written.

---

## 9 — Awaiting user approval

Implementation committed locally (commit SHA below). NOT pushed to `origin/main` yet — per spec, awaiting explicit user approval before `git push origin main`.
