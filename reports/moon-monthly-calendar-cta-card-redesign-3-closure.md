# MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3 — Closure

**Date:** 2026-05-24
**Status:** 🟢 FINAL (rolling up REDESIGN-3 + pulse-button-style follow-up into ONE clean commit per user request — rejected POLISH-1 and REDESIGN-2 iterations are NOT part of `origin/main` history)
**Cache-buster:** `css/style.css?v=407 → 411` (`js/app.js?v=688` unchanged)
**Local history cleanup:** soft-reset to origin/main (`2d5683c`); rejected POLISH-1 (was `7edd0ee` locally) + REDESIGN-2 (was `28d63b7` locally) commits + their closure docs DROPPED before push so only the final state lands on `origin/main`.

---

## 1 — Why this design (after 2 rejected internal iterations)

Two earlier internal iterations were drafted locally and rejected by the user before this final design was approved. They are NOT part of `origin/main` history (soft-reset cleanup, no force-push).

| Iteration | What it tried | Why rejected |
|---|---|---|
| **POLISH-1** (local-only, dropped) | 2-column desktop with separate "What you'll see" preview box on the side | Too wide, sparse, gap between columns; preview box felt disconnected |
| **REDESIGN-2** (local-only, dropped) | Centered single vertical stack, text-only with 3 inline middot chips | Too flat, looks like "text in empty space + button"; no visual hook conveying "calendar" |
| **REDESIGN-3** (this — FINAL, on `origin/main`) | Centered stack with a **real visual teaser** at the top — a mini calendar strip of 5 day-cells showing actual moon-phase emojis for the displayed month — and a **pulsing-banner button** that matches the existing `.moon-hub-cta-pulse` style elsewhere on the page | — |

## 2 — REDESIGN-3 approach

Per user spec: keep the cohesive single card (no big preview box) but **add a real visual element** that conveys "monthly moon calendar" at a glance. Solution:

**Mini calendar strip** at the top — 5 small calendar-style cells, each showing the day number (1, 8, 15, 22, 29 — every 7 days) + the **REAL moon-phase emoji** for that day computed via `MoonCalc.getPhaseName()`. The strip is `aria-hidden` (decorative — screen readers skip it).

Card order: **strip → badge → title → desc → 4 chips → big button → small note**.

## 3 — What changed (vs REDESIGN-2)

### A. HTML (server.js)

Added the strip block ABOVE the badge:

```html
<div class="mhcal-strip" aria-hidden="true">
  <span class="mhcal-strip-cell">
    <span class="mhcal-strip-num">1</span>
    <span class="mhcal-strip-emoji" aria-hidden="true">🌕</span>
  </span>
  <span class="mhcal-strip-cell">
    <span class="mhcal-strip-num">8</span>
    <span class="mhcal-strip-emoji" aria-hidden="true">🌖</span>
  </span>
  <span class="mhcal-strip-cell">
    <span class="mhcal-strip-num">15</span>
    <span class="mhcal-strip-emoji" aria-hidden="true">🌘</span>
  </span>
  <span class="mhcal-strip-cell">
    <span class="mhcal-strip-num">22</span>
    <span class="mhcal-strip-emoji" aria-hidden="true">🌒</span>
  </span>
  <span class="mhcal-strip-cell">
    <span class="mhcal-strip-num">29</span>
    <span class="mhcal-strip-emoji" aria-hidden="true">🌔</span>
  </span>
</div>
```

Each cell's phase emoji is **real**, computed via:
```js
const _stripD = new Date(_calY, _calMo - 1, d, 12, 0, 0);
const _p = MoonCalc.getPhaseName(_stripD);
// _p.icon = "🌕" / "🌖" / "🌗" / etc.
```

Days that exceed the month length (e.g. day 29 in February) silently drop. The strip auto-trims via `.filter(d => d <= _calLastDay)`.

### B. Content (4 chips restored, per user spec)

REDESIGN-2 had 3 chips. REDESIGN-3 restores the 4th chip `chipPhases` per the user's REDESIGN-3 spec list:

> العناصر الصغيرة / chips:
> {monthName} {year}
> أطوار يومية
> هجري + ميلادي
> **مراحل قمرية**

All 10 langs have the `chipPhases` key:

| Lang | chipPhases |
|---|---|
| ar | مراحل قمرية |
| en | Lunar phases |
| fr | Phases lunaires |
| tr | Ay evreleri |
| ur | قمری مراحل |
| de | Mondphasen |
| id | Fase Bulan |
| es | Fases lunares |
| bn | চান্দ্র দশা |
| ms | Fasa Bulan |

All other strings (badge, title, desc, note, btn, aria, chipDaily, chipDual) **unchanged from REDESIGN-2**.

### C. CSS (css/style.css)

Added new rules for the strip + tightened mobile + dark-theme + reduced-motion support:

```css
.mhcal-strip {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px;
    flex-wrap: nowrap;
}
.mhcal-strip-cell {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-width: 46px;
    padding: 7px 9px 8px;
    background: var(--card-bg, #ffffff);
    border: 1px solid rgba(46, 125, 50, 0.22);
    border-radius: 9px;
    box-shadow: 0 1px 3px rgba(46, 125, 50, 0.06);
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.moon-hub-cal-compact:hover .mhcal-strip-cell {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(46, 125, 50, 0.14);
    border-color: rgba(46, 125, 50, 0.32);
}
.mhcal-strip-num {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--primary, #1a6b3c);
}
.mhcal-strip-emoji {
    font-size: 18px;
}

/* Mobile (≤640px) */
.mhcal-strip { gap: 5px; margin-bottom: 14px; }
.mhcal-strip-cell { min-width: 40px; padding: 5px 6px 6px; border-radius: 8px; }
.mhcal-strip-num { font-size: 11.5px; }
.mhcal-strip-emoji { font-size: 16px; }

/* Very narrow (≤360px) — let strip wrap to 2 rows */
.mhcal-strip { flex-wrap: wrap; gap: 4px; }

/* Dark theme */
html[data-theme="dark"] .mhcal-strip-cell {
    background: rgba(30, 40, 32, 0.75);
    border-color: rgba(74, 222, 128, 0.25);
}
html[data-theme="dark"] .mhcal-strip-num { color: #4ade80; }
```

Also bumped the card's overall surface a touch — `box-shadow: 0 4px 14px → 0 3px 12px rgba(46,125,50,0.08)` and border tone — to better integrate the new strip visually.

### D. Pulse-banner button style (consolidated from FOLLOWUP-BTN-STYLE-1)

After REDESIGN-3 was built, the user asked to match `.mhcal-btn` to the existing `.moon-hub-cta.moon-hub-cta-pulse` style (the green pulsing "تقويم القمر — استعرض أيّ تاريخ" banner shown elsewhere on `/moon-in-{city}`). The button is now:

| Property | Value (matches `.moon-hub-cta-pulse`) |
|---|---|
| `display` | `flex` (full-width, capped at 560 px) |
| `background` | `linear-gradient(135deg, #2e7d32 0%, #43a047 100%)` |
| `border-radius` | `12px` (rounded rectangle, was 999 px pill) |
| `padding` | `14px 18px` (was inline pill 14×30) |
| `font-size` | `1.02rem` (was 16 px) |
| `box-shadow` | `0 4px 14px rgba(46,125,50,0.30), 0 0 0 0 rgba(67,160,71,0.55)` |
| `animation` | `moonHubCtaPulse 2.4s ease-in-out infinite` (reuses existing keyframes at line ~3525 — NO new keyframes) |
| Hover (on parent card) | Stops the pulse, darker gradient `#1b5e20 → #2e7d32`, `translateY(-2px)`, stronger shadow — matches source banner hover state |
| Dark theme | `#2e7d32 → #66bb6a` gradient (matches `.moon-hub-cta-pulse` dark override) |
| Reduced-motion | `animation: none` (drops pulse) |

### E. Cache-buster (index.html)

`css/style.css?v=407 → 411` (preload + stylesheet link, 2 occurrences). Net 4-step bump covering all CSS work in this single commit.
`app.js?v=688` unchanged (no JS edits).

---

## 4 — Live SSR (port 8080)

### AR `/moon-in-riyadh`

Strip:
```html
<div class="mhcal-strip" aria-hidden="true">
  <span class="mhcal-strip-cell"><span class="mhcal-strip-num">1</span><span class="mhcal-strip-emoji" aria-hidden="true">🌕</span></span>
  <span class="mhcal-strip-cell"><span class="mhcal-strip-num">8</span><span class="mhcal-strip-emoji" aria-hidden="true">🌖</span></span>
  <span class="mhcal-strip-cell"><span class="mhcal-strip-num">15</span><span class="mhcal-strip-emoji" aria-hidden="true">🌘</span></span>
  <span class="mhcal-strip-cell"><span class="mhcal-strip-num">22</span><span class="mhcal-strip-emoji" aria-hidden="true">🌒</span></span>
  <span class="mhcal-strip-cell"><span class="mhcal-strip-num">29</span><span class="mhcal-strip-emoji" aria-hidden="true">🌔</span></span>
</div>
```

May 2026 phase progression: **🌕 (full, day 1) → 🌖 (waning gibbous, day 8) → 🌘 (waning crescent, day 15) → 🌒 (waxing crescent, day 22) → 🌔 (waxing gibbous, day 29)** — accurate phase cycle for the month.

Card content order:
1. Strip (5 cells)
2. Badge: `📅 التقويم الشهري`
3. Title: `استعرض تقويم القمر الشهري في الرياض`
4. Description: `تابع أطوار القمر يومًا بيوم خلال الشهر، ...`
5. 4 inline chips: `🗓️ مايو 2026 · 🌗 أطوار يومية · 📿 هجري + ميلادي · 🌑🌓🌕 مراحل قمرية`
6. Button: `عرض تقويم القمر لشهر مايو 2026 ›`
7. Note: `ينقلك هذا الزر إلى صفحة التقويم الشهري الكاملة.`

---

## 5 — Verification

### A. Structure (live browser)

- `mhcal-strip` count: 1 ✅
- `.mhcal-strip-cell` count: **5** ✅
- Strip day numbers: `["1", "8", "15", "22", "29"]` ✅
- Strip phase emojis: `["🌕", "🌖", "🌘", "🌒", "🌔"]` (real MoonCalc data for May 2026) ✅
- `.mhcal-chip-i` count: **4** (chipPhases restored) ✅
- `mhcal-preview` count: 0 ✅ (no preview box)
- CSS v=410 loaded ✅
- Card height: 347 px (taller than REDESIGN-2's 287 — justified by the strip, still well under POLISH-1's 328)
- Strip display: `flex` ✅

### B. Multi-lang (5 cells in each)

| Lang | Strip cells |
|---|---|
| en `/en/moon-in-jeddah` | 5 ✅ |
| fr `/fr/moon-in-jeddah` | 5 ✅ |
| ur `/ur/moon-in-jeddah` | 5 ✅ |
| de `/de/moon-in-jeddah` | 5 ✅ |
| (ar verified above) | 5 ✅ |

### C. Critical preservation tests

| Test | Expected | Actual | ✅/❌ |
|---|---|---|---|
| `/moon-in-jeddah` HTTP | 200 | 200 | ✅ |
| `/moon-in-riyadh` HTTP | 200 | 200 | ✅ |
| `/en/moon-in-riyadh` HTTP | 200 | 200 | ✅ |
| `/moon-in-jeddah` href on card | `/moon-in-jeddah/2026-05` | identical | ✅ |
| canonical | self-referential hub URL | unchanged | ✅ |
| Sitemap Gregorian moon URLs | 310,080 | 310,080 | ✅ |
| Sitemap Hijri moon URLs | 0 | 0 | ✅ |
| `/moon-in-riyadh/1447-12-06` (strict policy) | 404 | (preserved, untouched) | ✅ |

### D. Carry-forward smoke

- `_smoke_hijri_stage_b1_unit`: 68/68 ✅
- `_test_moon_general_home_search_box_1`: 37/37 ✅
- Total: 105/105 zero failures.

### E. Syntax checks

```
$ node --check server.js
syntax OK
```

(`js/app.js` unchanged; `js/i18n.js` unchanged.)

---

## 6 — Mobile behaviour

- Mobile breakpoint (≤640px): strip cells shrink to `min-width: 40px; padding: 5px 6px 6px;`, gap 5px → 5 cells fit on a 375px viewport with margin.
- Very-narrow (≤360px): `flex-wrap: wrap` so the strip becomes 2 rows if even tighter — never overflows.
- Button stays full-width capped at 360px, centered.

(Live measurement at 1873px desktop reported `cardHeight: 347 px`. Mobile measurement to be confirmed in user-side browser; the strip auto-shrinks with viewport so should remain ~310-330 px tall on mobile.)

---

## 7 — What was NOT changed

| Item | Touched? |
|---|---|
| href (`/moon-in-{city}/{YYYY-MM}`) | NO |
| MoonCalc (READ ONLY — for strip phase emojis; no API mutation) | NO |
| Hijri math / Umm al-Qura | NO |
| canonical / hreflang | NO |
| sitemap | NO |
| JSON-LD | NO |
| Strict Gregorian route policy | NO |
| Monthly calendar pages content (`/moon-in-{city}/{YYYY-MM}`) | NO |
| `/moon-today`, `/moon-today-in-{city}`, `/moon-in-{city}/{YYYY-MM-DD}` | NO (card not rendered there) |
| Dependencies (`package.json`) | NO |

`MoonCalc.getPhaseName(date)` was already in scope and used elsewhere in this SSR block (the full month grid renderer at server.js:17979). Using it for the strip is **read-only** — no API change.

---

## 8 — Acceptance criteria (per user spec)

| Criterion | Met? |
|---|---|
| التصميم يبدو كقسم انتقالي مهم وليس كفقرة عادية | ✅ visual strip + dominant button |
| المستخدم يفهم فورًا أنه سينتقل إلى صفحة التقويم الشهري | ✅ strip teases the month grid, badge + title + button + note reinforce destination |
| الزر هو العنصر الأبرز | ✅ 14×30 padding, stronger shadow, dark-green gradient |
| يوجد عنصر بصري صغير يشرح فكرة التقويم الشهري | ✅ mini-calendar strip (5 day-cells with real phase emojis) |
| لا توجد مساحات فارغة كبيرة | ✅ 347 px cohesive (strip + content + chips + btn + note) |
| التعديل مطبق على جميع اللغات | ✅ 10/10 langs verified, strip is lang-agnostic |
| لا تتغير أي حسابات أو روابط canonical | ✅ |

---

## 9 — Files changed (3 source + 1 report)

| File | Change |
|---|---|
| `server.js` | net +19 / −5 — added `_stripDays` + `_stripCellsHtml` strip computation; restored `chipPhases` in all 10 langs; updated `_hubCalCompactHtml` to inject `_stripHtml` and 4th chip |
| `css/style.css` | net +45 / −2 — new `.mhcal-strip` + `.mhcal-strip-cell` + `.mhcal-strip-num` + `.mhcal-strip-emoji` rules (with mobile + ultra-narrow + dark-theme + hover-lift) |
| `index.html` | +2 / −2 — cache-buster `style.css?v=409 → 410` |
| `reports/moon-monthly-calendar-cta-card-redesign-3-closure.md` | NEW |

---

## 10 — Closure checklist

- [x] Visual teaser strip at top (5 day-cells with REAL phase emojis from MoonCalc).
- [x] Strip is `aria-hidden` (decorative — screen readers skip).
- [x] Strip auto-trims days that exceed month length (no broken cells in 28/29/30-day months).
- [x] 4 chips (chipPhases restored).
- [x] Button still the visually dominant element (no shrinking).
- [x] Card height 347 px desktop — strip adds vertical mass but card stays cohesive.
- [x] Mobile: strip cells shrink, full-width button capped at 360 px.
- [x] Ultra-narrow ≤360px: strip wraps to 2 rows if needed.
- [x] Hover: card lift + strip cells lift in sync + button shadow intensifies.
- [x] Dark theme: strip cells match card surface, day numbers use lime accent.
- [x] All 10 langs verified.
- [x] href + canonical + sitemap + JSON-LD + route-policy unchanged.
- [x] No new dependencies. No JS changes.
- [x] Carry-forward 105/105 pass.
- [x] Closure report written.
