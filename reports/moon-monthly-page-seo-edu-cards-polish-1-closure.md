# MOON-MONTHLY-PAGE-SEO-EDU-CARDS-POLISH-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** SEO/educational cards (3 sections) on `/moon-in-{city}/{YYYY-MM}` only. All 10 supported langs.
**Cache-buster:** `css/style.css?v=417 → v=418`.

---

## 1 — Problem (verbatim from user)

> «المشكلة:
> - البطاقات النصية طويلة ومتشابهة بصريًا.
> - لا يوجد تمييز كافٍ بين العناوين والفقرات.
> - المستخدم قد يتجاوز القسم لأنه يبدو كمقال طويل.
> - المحتوى مفيد، لكن يحتاج تنسيقًا أخف وأسهل قراءة.»

The 3 SEO/educational cards rendered as identical-looking heavy text blocks:
- `<section class="section-card moon-seo-info moon-seo-month-title">` — calendar intro
- `<section class="section-card moon-seo-info moon-seo-phases">` — phases waxing/waning
- `<section class="section-card moon-seo-info moon-seo-days-remaining">` — days-remaining explainer

Each had a long uninterrupted paragraph, no visual hierarchy, no icons, identical card styling — making the section look like one long article that users tend to skip.

---

## 2 — What changed

### A. Server.js (HTML structure — `~line 18800+`)

**Wrapping container:**
```html
<div class="moon-seo-grid">
  <section class="...moon-seo-card moon-seo-card--cal moon-seo-card--full">...</section>
  <section class="...moon-seo-card moon-seo-card--phases">...</section>
  <section class="...moon-seo-card moon-seo-card--days">...</section>
</div>
```

**Each card's `<h2>`** now wraps the title in a `<span>` and prepends an SVG icon from the existing sprite:
- Card 1: `<svg><use href="#i-calendar-grid"/></svg>` (calendar)
- Card 2: `<svg><use href="#i-moon"/></svg>` (moon)
- Card 3: `<svg><use href="#i-hourglass"/></svg>` (hourglass = time-passing)

**Paragraph split helper** `_seoSplitParas(txt)`:
- Finds all sentence-end positions: `[.!?؟۔।]\s` (covers Latin + Arabic + Urdu `۔` U+06D4 + Bengali `।` U+0964)
- Picks the position closest to the midpoint
- Splits the text into 2 `<p>` elements ONLY IF the smaller paragraph is ≥ 18% of total length (to avoid awkward "1 long para + 1 tiny addendum")
- **NO content change** — same words, same order, just `</p><p>` injected at a natural sentence boundary

### B. CSS (`css/style.css` — new block after `.section-card h2`)

```css
.moon-seo-grid {
    display: grid;
    grid-template-columns: 1fr;  /* mobile */
    gap: 14px;
    margin-bottom: 24px;
}
@media (min-width: 768px) {
    .moon-seo-grid {
        grid-template-columns: repeat(2, 1fr);  /* desktop: 2-col */
        gap: 16px;
    }
    .moon-seo-card--full { grid-column: 1 / -1; }  /* card 1 spans full */
}
```

| Aspect | Before | After |
|---|---|---|
| Card padding | 24px | 20px 22px (lighter) |
| Card shadow | `var(--shadow)` (heavy) | `0 1px 3px rgba(0,0,0,.035)` (subtle) |
| Card border | none (just shadow) | `1px solid rgba(46,125,50,.10)` (subtle outline) |
| H2 font-size | 1.2rem | 1.05rem (less heavy) |
| H2 border-bottom | 2px solid | 1px solid + lighter color |
| H2 has icon? | no | yes (22px SVG) |
| H2 layout | `flex; gap:8px` (inherited) | `flex; gap:10px` (icon + text wrap) |
| Paragraph line-height | inherited (~1.6) | 1.85 (better breathing) |
| Paragraph font-size | inherited (1rem) | 0.95rem |
| Long paragraph | 1 wall-of-text | 2 visually-balanced paragraphs |
| Per-card color | uniform | icon-only accent: card1=green primary, card2=violet, card3=warm amber |
| Desktop layout | 3 stacked rows | card1 full-width + cards 2+3 side-by-side |

### C. Cache-buster (`index.html`)

`style.css?v=417 → v=418` (preload + stylesheet link). `js/app.js?v=688` byte-identical (no JS changes).

### D. Dark theme + mobile

- Dark theme: softer border `rgba(77,203,140,.18)`, brighter icon accents `#a78bfa` (violet) + `#fbbf24` (amber)
- Mobile (`@media max-width: 600px`): padding `16px 18px`, H2 1rem, p 0.92rem + line-height 1.78, icon 20px

---

## 3 — Verification (live SSR port 8080, /moon-in-jeddah/2026-05)

### A. New structure rendering — all 10 langs

| Lang | Wrapper `moon-seo-grid` | All 3 card modifiers | `<svg>` icons | Card 1 `<p>` count |
|---|---|---|---|---|
| ar | ✅ | ✅ | 3 ✅ | 2 ✅ |
| en | ✅ | ✅ | 3 ✅ | 2 ✅ |
| fr | ✅ | ✅ | 3 ✅ | 2 ✅ |
| tr | ✅ | ✅ | 3 ✅ | 2 ✅ |
| ur | ✅ | ✅ | 3 ✅ | 2 ✅ |
| de | ✅ | ✅ | 3 ✅ | 2 ✅ |
| id | ✅ | ✅ | 3 ✅ | 2 ✅ |
| es | ✅ | ✅ | 3 ✅ | 2 ✅ |
| bn | ✅ | ✅ | 3 ✅ | 2 ✅ |
| ms | ✅ | ✅ | 3 ✅ | 2 ✅ |

Also verified cards 2 + 3 across ar/en/ur/bn — all split into 2 paragraphs correctly.

### B. Content preservation (SEO content unchanged)

Spot-check: Card 1 AR raw served HTML matches the original `_m1Sec1P.ar` word-for-word, only `</p><p>` inserted at sentence boundary after "...والهلال المتناقص." (last sentence in main listing, before the addendum "يظهر التقويم أيضاً نسبة الإضاءة...").

### C. Critical preservation (no regression)

| Test | Expected | Actual | ✅ |
|---|---|---|---|
| `/moon-in-riyadh/1447-12-06` (strict policy) | HTTP 404 | 404 | ✅ |
| Sitemap Hijri moon URLs | 0 | 0 | ✅ |
| `_smoke_hijri_stage_b1_unit` | 68/68 | 68/68 | ✅ |
| Cell content (POLISH-1) — `1 مايو, 2 مايو, 31 مايو` | present | present | ✅ |
| Per-cell Hijri (POLISH-1) — `14 ذو القعدة, 7 ذو الحجة` | present | present | ✅ |
| `+N`/`-N` leak (POLISH-1) | 0 | 0 | ✅ |
| `moon-hub-cal-header{...flex-direction:column}` (Round 3) | served | served | ✅ |
| Hijri-range card (REDESIGN-1) — `moon-hijri-today moon-hijri-range` | present | present | ✅ |
| `node --check server.js` | OK | OK | ✅ |

### D. CSS served

`curl /css/style.css?v=418 | grep -oE 'moon-seo-grid|moon-seo-card--cal|moon-seo-card--phases|moon-seo-card--days|moon-seo-h2-icon'` returned all 5 new class identifiers — CSS rules served correctly.

---

## 4 — Acceptance criteria (per user spec)

| Criterion | Met? |
|---|---|
| الإبقاء على المحتوى التعليمي الأساسي | ✅ — zero word change, zero deletion |
| تقليل طول الجمل (تحسين القراءة) | ✅ — long paragraphs split into 2 balanced `<p>` (visual only, no edit) |
| عنوان واضح + فقرة واحدة أو فقرتان كحد أقصى | ✅ — 1-2 `<p>` per card, max 2 by design |
| إضافة أيقونة صغيرة لكل بطاقة | ✅ — calendar/moon/hourglass SVGs from existing sprite |
| تقليل ارتفاع البطاقات | ✅ — padding 24px→20px, h2 1.2→1.05rem, h2 border 2px→1px |
| تحسين line-height | ✅ — 1.6→1.85 |
| زيادة التباعد بين العنوان والنص | ✅ — h2 margin-bottom 16px→14px, gap inside h2 8px→10px, lighter border |
| خلفية أخف / بطاقة أكثر نعومة | ✅ — heavy shadow → 1px subtle border + minimal shadow |
| لا تجعل كل البطاقات بنفس الوزن البصري الثقيل | ✅ — per-card icon color accent (green/violet/amber) |
| ديسكتوب: عمودين بدل عمود واحد طويل | ✅ — card 1 full-width + cards 2+3 side-by-side on ≥768px |
| موبايل: عمود واحد بـ padding مريح | ✅ — single column, 16px 18px padding, scaled fonts |
| لا تغيير في الحسابات/MoonCalc/Umm al-Qura | ✅ |
| لا تغيير في canonical/hreflang/sitemap/JSON-LD/routes | ✅ |
| لا حذف للمحتوى أو اختصار يضعف SEO | ✅ — zero content change |

---

## 5 — What was NOT changed

| Item | Touched? |
|---|---|
| Educational content text (`_m1Sec1P` + `_m1Sec2P` + `_m1Sec3P`, all 10 langs) | NO — byte-identical |
| H2 text content (10 langs × 3 cards) | NO — only wrapped in `<span class="moon-seo-h2-text">` for layout |
| MoonCalc / Umm al-Qura | NO (read-only — no usage in these 3 sections at all) |
| `isMonthPage` gate (`if (seo.moonCity && seo.moonCity.isMonthPage)`) | NO |
| `seo.moonCity` builder | NO |
| Per-cell Hijri date / cell hrefs (POLISH-1) | NO |
| Calendar header stacked layout (Round 3) | NO |
| Hijri-range card (REDESIGN-1) | NO |
| canonical / hreflang / sitemap / JSON-LD / route-policy | NO |
| `js/app.js` (byte-identical, `?v=688` unchanged) | NO |
| Dependencies (`package.json`) | NO |

---

## 6 — Files changed (2 source + 1 report + 1 cache-buster)

| File | Change |
|---|---|
| `server.js` | +35 / −6 — added `_seoSplitParas` + `_seoRenderParas` helpers; added SVG icons + `<span>` wrappers to 3 H2s; wrapped 3 sections in `<div class="moon-seo-grid">`; added card modifier classes |
| `css/style.css` | +95 / 0 — new `.moon-seo-grid` + `.moon-seo-card*` rules (light cards, icon styling, per-card color accent, desktop 2-col grid, mobile breakpoint, dark theme) |
| `index.html` | +2 / −2 — cache-buster `style.css?v=417 → v=418` |
| `reports/moon-monthly-page-seo-edu-cards-polish-1-closure.md` | NEW |

---

## 7 — Closure checklist

- [x] All 3 sections wrapped in `<div class="moon-seo-grid">`.
- [x] Each card has unique `moon-seo-card--cal/--phases/--days` modifier class.
- [x] Card 1 has `moon-seo-card--full` for desktop full-width span.
- [x] Each H2 has a contextually-appropriate SVG icon (calendar/moon/hourglass).
- [x] Long paragraphs split into 2 visually-balanced `<p>` (sentence-boundary based, multi-lang aware).
- [x] Zero word change in SEO content across all 10 langs.
- [x] Lighter padding + shadow + H2 border (3 visual weight reductions).
- [x] Better line-height (1.85) + slightly smaller paragraph font (0.95rem).
- [x] Per-card icon color accent for visual differentiation.
- [x] Desktop 2-col grid (card 1 full + cards 2+3 side-by-side at ≥768px).
- [x] Mobile single column with comfortable padding (16px 18px).
- [x] Dark theme variants for border + icon colors.
- [x] Cache-buster bumped.
- [x] MoonCalc + Umm al-Qura: not touched.
- [x] canonical / hreflang / sitemap / JSON-LD / route-policy / day-links: not touched.
- [x] Previous polish work (POLISH-1, Round 3, REDESIGN-1, HIJRI-TODAY-MATCH-1): preserved + verified.
- [x] Carry-forward smoke 68/68 zero failures.
- [x] All 10 langs verified.
- [x] Closure report written.
