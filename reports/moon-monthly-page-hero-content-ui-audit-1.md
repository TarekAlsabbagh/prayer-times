# MOON-MONTHLY-PAGE-HERO-CONTENT-UI-AUDIT-1 — Audit Report

**Date:** 2026-05-24
**Status:** 📝 AUDIT ONLY — read-only review of `/moon-in-{city}/{YYYY-MM}` hero content. **NO code changes made. NO commits. NO push.**
**Scope:** Top of the monthly page (`/moon-in-{city}/{YYYY-MM}`) — H1, subtitle, summary line, intro paragraph, Hijri date card, and the conceptual conflation with "today" content.
**Sample URLs audited:** `/moon-in-jeddah/2026-05`, `/moon-in-riyadh/2026-05`, `/en/moon-in-jeddah/2026-05`, `/moon-in-jeddah/2026-01` (past month, no today), `/moon-in-jeddah/2026-12` (future month, no today).

---

## 1 — Page intent (recap)

The page `/moon-in-{city}/{YYYY-MM}` is the **monthly calendar page** for a specific city + specific Gregorian month. It is **NOT**:
- The "moon today" hub `/moon-today`.
- The city hub `/moon-in-{city}`.
- The "moon today in city" page `/moon-today-in-{city}`.
- The single-day page `/moon-in-{city}/{YYYY-MM-DD}`.

The page's primary purpose is to let the visitor browse **all moon phases day by day across the displayed month**. Today's state is a SECONDARY data point, not the headline.

---

## 2 — Current SSR state (what gets first-painted)

### A. H1
- AR: `🌙 أطوار القمر في جدة — مايو 2026` (SSR)
  - JS rewrite (`_H1_MONTH` at js/app.js ~17050): `تقويم أطوار القمر في جدة — مايو 2026` — adds the "تقويم" prefix.
- EN: `🌙 Moon Phases in Jeddah — May 2026` (SSR)
- **✅ GOOD — month-context, names the right month + city.**

### B. Subtitle (`#moon-subtitle`)
- AR SSR (generic): `اعرف أطوار القمر في جدة، ونسبة الإضاءة، ومواعيد البدر والمحاق، مع تقويم شهريّ كامل حسب التوقيت المحلّيّ.`
- AR JS rewrite (`_SUB_MONTH` at server.js ~17070): `تابع أطوار القمر اليوميّة في جدة خلال مايو 2026، مع نسبة الإضاءة ومواعيد البدر والمحاق.`
- **✅ GOOD after hydration — month-specific.** (Minor: SSR-only paint is generic and doesn't name the month — but the JS rewrite fires fast enough not to be a visible issue.)

### C. Summary line (`#moon-summary-line`)
- SSR: **empty** (filled by JS at hydration).
- After hydration (per user screenshot): `حالة القمر: أحدب متزايد · نسبة الإضاءة: 59.72% · عمر القمر: 7.8 يوم من الدورة القمرية`.
- ❌ **PROBLEM — shows TODAY's snapshot without labelling it as "today's slice within this month".** On a monthly page this reads as "the moon's state THIS MONTH" which is misleading (the state changes every day across the month).

### D. Intro paragraph (`#moon-intro`)
- AR SSR (same on past/current/future months): `استعرض طور القمر الحاليّ في جدة، والتنقّل بين التواريخ القادمة والسابقة، ومتابعة التقويم القمريّ والهجريّ.`
- After JS hydration (per user screenshot): `القمر اليوم في جدة، المملكة العربية السعودية في طور أحدب متزايد، بإضاءة 59.72٪ وعمر 7.8 يوم من الدورة القمرية. وتمرّ فلكيًّا في كوكبة الأسد، وبحسب وقت التحديث الحاليّ يكون القمر تحت الأفق (15.5° تحته).`
- ❌ **PROBLEM #1 (the biggest issue) — opens with "القمر اليوم في {city}" on a monthly page.** This reads exactly like the today-page intro and obscures the page's monthly purpose.
- ❌ Same intro fires on `2026-01` and `2026-12` (months that don't contain today) — surfacing today data is more disorienting on past/future months.

### E. Hijri date card (`#moon-hijri-today`)
- Card title: `التاريخ الهجري اليوم` (literally "Hijri date TODAY").
- Body: day number `7` + month name `ذو الحجة` + year `1447 هـ` + Gregorian equivalence `24 مايو 2026`.
- Description: `نحن اليوم في 7 ذو الحجة 1447 هـ. ويتبقى نحو 22 يومًا على نهاية الشهر الهجري.` ("WE ARE TODAY in 7 Dhu al-Hijjah 1447 AH. About 22 days left until the end of the Hijri month.")
- ❌ **PROBLEM #2 — entire card is "today"-framed on a MONTHLY page.** A visitor browsing `/moon-in-jeddah/2026-01` would still see "نحن اليوم في 7 ذو الحجة 1447 هـ" — completely unrelated to January 2026.
- The card SHOULD instead describe the Hijri range that maps to the displayed Gregorian month (e.g. for May 2026: "يمتد هذا الشهر الميلادي من 13 ذو القعدة 1447 إلى 14 ذو الحجة 1447 هـ بحسب تقويم أم القرى").

### F. Cross-month consistency (audited via past + future months)

| URL | Month-context | TODAY-content leak |
|---|---|---|
| `/moon-in-jeddah/2026-05` (contains today) | H1 ✓ subtitle ✓ intro ❌ Hijri-card ❌ summary-line ❌ | high — intro + Hijri card both speak of "today" |
| `/moon-in-jeddah/2026-01` (past) | H1 ✓ subtitle ✓ intro ❌ Hijri-card ❌ | high — same bug, even more jarring (page says "May" by URL but Hijri card says "today is 24 May 2026") |
| `/moon-in-jeddah/2026-12` (future) | H1 ✓ subtitle ✓ intro ❌ Hijri-card ❌ | high — same bug |
| `/moon-in-riyadh/2026-05` (different city) | H1 ✓ subtitle ✓ intro ❌ Hijri-card ❌ | same as Jeddah |
| `/en/moon-in-jeddah/2026-05` (English) | H1 ✓ subtitle (generic SSR) intro ❌ | "Moon Phases in Jeddah — May 2026" ✓ but intro says "Explore the current moon phase in Jeddah..." (same EN flavor of the AR bug) |

---

## 3 — What's RIGHT on the monthly page (don't touch in any future fix wave)

- ✅ H1 (`أطوار القمر في {city} — {month} {year}` / `Moon Phases in {city} — {month} {year}`) — both SSR + JS-override are correct.
- ✅ Subtitle after JS hydration — names the month.
- ✅ Breadcrumb (`الرئيسية › حالة القمر › القمر في جدة › مايو 2026`) — proper hierarchical drill-down to the month.
- ✅ `#moon-current-month-h2` ("أطوار القمر خلال هذا الشهر") — month-aware.
- ✅ Full month calendar grid (`#moon-hub-cal-grid`) — the page's killer feature, correctly rendered for the displayed month.
- ✅ Calendar prev/next nav (`/moon-in-jeddah/2026-04` ← → `/moon-in-jeddah/2026-06`) — proper month navigation.
- ✅ Picker form (year + month dropdowns) — for ad-hoc month jumps.
- ✅ Sitemap, canonical, hreflang, JSON-LD `description` — all month-context (`"تقويم القمر في جدة لشهر مايو 2026: طور القمر اليوميّ، نسبة الإضاءة، البدر والمحاق، رؤية الهلال، والتقويم الهجريّ المقابل."`).
- ✅ MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3 (`6165a10`) does NOT render on monthly pages — correctly scoped to the city hub only.
- ✅ Cache-buster: latest `style.css?v=411`.

---

## 4 — Phrases that conflate the monthly page with "today"

| Element | Current text (AR) | Why it's wrong on a monthly page |
|---|---|---|
| `#moon-intro` (post-hydration) | `القمر اليوم في جدة، المملكة العربية السعودية في طور أحدب متزايد، ...` | Headline phrase "القمر اليوم في" reads as today-page copy |
| `#moon-summary-line` | `حالة القمر: أحدب متزايد · نسبة الإضاءة: 59.72% · عمر القمر: 7.8 يوم` | Snapshot of TODAY, no label clarifying it's "today within this month" |
| `#moon-hijri-today` title | `التاريخ الهجري اليوم` | "اليوم" pinned in the card title even on past/future month pages |
| `#moon-hijri-today` body | `نحن اليوم في 7 ذو الحجة 1447 هـ. ويتبقى نحو 22 يومًا على نهاية الشهر الهجري.` | "نحن اليوم في..." narrative doesn't belong on a monthly page; should describe the Hijri range that maps to the displayed Gregorian month |
| `#moon-intro` (SSR fallback) | `استعرض طور القمر الحاليّ في جدة، والتنقّل بين التواريخ القادمة والسابقة، ...` | "الحاليّ" is today-leaning; should say "أطوار القمر خلال {month} {year}" |

**Count of `اليوم` in the visible hero (AR `/moon-in-jeddah/2026-05`, post-hydration):** ~5 occurrences (intro + Hijri-card title + Hijri-card body + summary chip + sticky bar) — all describing today, none scoped to the displayed month.

---

## 5 — Recommended copy (NOT applied yet)

### A. H1 — KEEP
- AR: `تقويم أطوار القمر في {cityName} — {monthName} {year}`
- EN: `Moon Phases in {cityName} — {monthName} {year}`

Already correct. No change needed.

### B. Subtitle (under H1) — KEEP JS rewrite
- AR: `تابع أطوار القمر اليوميّة في {cityName} خلال {monthName} {year}، مع نسبة الإضاءة ومواعيد البدر والمحاق.`
- EN: similar month-scoped phrasing.

Already correct after JS hydration. No change needed.

### C. Summary line — REWRITE for month-scope
Replace today-snapshot with **month-overview**:
- AR: `ملخّص الشهر: {daysInMonth} يومًا · البدر: {fullMoonDate} · المحاق: {newMoonDate} · أعلى إضاءة: {maxIllumination}%`
- EN: `Monthly overview: {daysInMonth} days · Full moon: {fullMoonDate} · New moon: {newMoonDate} · Peak illumination: {maxIllumination}%`

If keeping the today snapshot is required for UX continuity, label it explicitly:
- AR: `يقع تاريخ اليوم ضمن هذا الشهر — الطور: أحدب متزايد · الإضاءة: 59.72% · العمر: 7.8 يوم`
- EN: `Today falls within this month — Phase: Waxing Gibbous · Illumination: 59.72% · Age: 7.8 days`

But it must NOT read as the page's headline state.

### D. Intro paragraph — REWRITE
- AR: `يعرض هذا التقويم أطوار القمر في {cityName} خلال {monthName} {year}، مع التواريخ اليوميّة ونسبة الإضاءة ومواعيد طلوع القمر وغروبه بحسب التوقيت المحلّي للمدينة.`
- EN: `This calendar shows the moon's phases in {cityName} during {monthName} {year}, with daily dates, illumination percentages, and moonrise/moonset times in the city's local timezone.`

If a today reference is desired (only when the displayed month contains today):
- AR (appended sentence): `ويقع تاريخ اليوم ضمن هذا الشهر عند {hijriDate}، الموافق {gregDate}.`
- EN (appended sentence): `Today falls within this month — {hijriDate}, equivalent to {gregDate}.`

**For past/future months: omit any "today" appendix entirely.** The intro should read as pure month description.

### E. Hijri date card — REWRITE to Hijri range
- Title: `التاريخ الهجري ضمن هذا الشهر` / `Hijri dates spanning this month` (NOT "التاريخ الهجري اليوم").
- Body (compute from the displayed Gregorian month's first + last day → Hijri):
  - AR: `يمتد هذا الشهر الميلادي عبر جزء من {hijriMonth1} {hijriYear1} هـ وجزء من {hijriMonth2} {hijriYear2} هـ، بحسب تقويم أمّ القرى.`
  - EN: `This Gregorian month spans part of {hijriMonth1} {hijriYear1} AH and part of {hijriMonth2} {hijriYear2} AH, per the Umm al-Qura calendar.`

If the computation is too involved for a first pass, the minimum change is to **rename the card title and rephrase the body** so it no longer says "اليوم" / "today" on the monthly page.

### F. Word `اليوم` audit
- KEEP: any reference to "today" inside CTA links pointing TO the today page (e.g. `📅 عرض حالة القمر اليوم في جدة` button).
- REMOVE: any "اليوم" framing in hero/intro/Hijri-card on the monthly page.
- ALLOW (conditional): a single labelled "today within this month" line — only if the displayed month contains today's date.

---

## 6 — UI / design recommendations (for any future fix wave)

1. **Hero block reorder** on the monthly page:
   1. Breadcrumb (kept)
   2. H1 (kept)
   3. Subtitle (kept)
   4. **NEW** month-overview card (BadgeMonth + key dates + chips) — replaces the current today-snapshot summary line.
   5. Hijri-range card (renamed + rewritten — see §5.E).
   6. Full month calendar grid (kept, already correct).

2. **Hijri-range card** should visually look distinct from the today's-Hijri card seen on other pages — e.g. show TWO Hijri month labels side by side (the range), not one big "today" number.

3. **Optional today-within-month chip** — a small secondary chip below the H1 reading "اليوم: 24 مايو · 7 ذو الحجة · 🌔 أحدب متزايد" (only when displayed month contains today). Quiet, secondary, not headline.

4. **For past/future months**, hide the today-within-month chip entirely. Page should read as pure historical/forward-looking month overview.

5. **No layout shift**: any changes should be SSR-first (no flicker post-hydration), respecting the existing CLS budget.

---

## 7 — Strict preservation list (any future fix wave must NOT touch)

- MoonCalc — no API change, read-only consumption only.
- Hijri math (HijriDate / Umm al-Qura) — read-only.
- canonical / hreflang — already month-scoped, do not change.
- sitemap — month URLs already listed, do not change.
- JSON-LD `description` (already month-scoped: `"تقويم القمر في جدة لشهر مايو 2026: ..."`).
- Strict-Gregorian route policy — still applies.
- The full month calendar grid (`#moon-hub-cal-grid`) on month pages — the killer feature, untouched.
- MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3 — scoped to hub only, will NOT be affected.
- No new dependencies.

---

## 8 — Do we need a fix wave?

**YES.** Three concrete content/UI bugs ship on every `/moon-in-{city}/{YYYY-MM}` page:

1. **Intro paragraph leaks today's snapshot** on a monthly page (`القمر اليوم في {city}...`).
2. **Summary line shows today's status** unlabelled, reading as the month's headline state.
3. **Hijri-date card is titled and worded as "today"** even on months that don't contain today.

These together break the visitor's understanding that they're on a monthly page, not the today-in-city page.

### Proposed fix-wave name

**`MOON-MONTHLY-PAGE-HERO-CONTENT-UI-FIX-1`**

Scope:
- Rewrite `#moon-intro`, `#moon-summary-line`, and `#moon-hijri-today` block ONLY when the page is a month page (`isMonthPage` flag already available on both SSR and JS sides — see `seo.moonCity.isMonthPage` in server.js).
- Apply to all 10 supported langs (ar/en/fr/tr/ur/de/id/es/bn/ms).
- Compute the Hijri range from the displayed Gregorian month's first + last day.
- No changes to MoonCalc, canonical, hreflang, sitemap, JSON-LD, or route policy.
- Estimated diff: server.js (~80 lines of new `_MONTH_HERO_COPY` map + injection logic in the `_isMoonMonthPageSsr` branch), js/app.js (~40 lines of month-page guards in `updateMoonInfo` to skip the today-flavored hydration when `isMonthPage`), css/style.css (minor — restyle Hijri-range card vs Hijri-today card if visually different).
- Cache-buster bump.
- Closure report + smoke test for past/current/future months × 10 langs.

This is a CONTENT-AND-COPY fix wave with minor UI tweaks. Calculations and routing stay frozen.

---

## 9 — Confirmation: NO implementation done in this audit

- ✅ No edits to `server.js`, `js/app.js`, `js/i18n.js`, `index.html`, `css/style.css`.
- ✅ No commits created.
- ✅ No git push.
- ✅ Working tree state: only this report file is new; the previous wave's commit (`6165a10` MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3) is intact on `origin/main` and untouched.
- ✅ Server restart (port 8080) was for AUDIT ONLY — read SSR responses, no code reload diff.

---

## 10 — Audit checklist (recap)

| Element | Status | Action recommended |
|---|---|---|
| H1 | ✅ correct (month + city) | KEEP |
| Subtitle | ✅ correct after JS | KEEP |
| Breadcrumb | ✅ correct hierarchy | KEEP |
| Summary line | ❌ TODAY-snapshot unlabelled | REWRITE (or LABEL) |
| Intro paragraph | ❌ "القمر اليوم في {city}..." | REWRITE to month description |
| Hijri-date card | ❌ "التاريخ الهجري اليوم" + "نحن اليوم في..." | REWRITE to Hijri-range card |
| Word "اليوم" frequency | ❌ ~5 occurrences in hero | REDUCE to ≤1 labelled chip |
| Past month (`2026-01`) | ❌ shows today data unscoped | guard with `isMonthPage` + `!isCurrentMonth` |
| Future month (`2026-12`) | ❌ same | same guard |
| Cross-city consistency | ❌ Riyadh shows same bug | same fix applies globally |
| Cross-lang | ❌ EN intro has same today-leak | same fix in all 10 langs |
| MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3 card | ✅ correctly scoped to hub | KEEP — not affected |
| MoonCalc / Umm al-Qura / canonical / sitemap | ✅ unaffected by the audit | KEEP |
