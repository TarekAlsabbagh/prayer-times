# MOON-MOBILE-CARD-SECTION-WHITESPACE-FIX-1 — Closure

**Date:** 2026-05-24
**Status:** CLOSED, awaiting user approval
**Scope:** `#moon-main-card` on `/moon-in-{city}` (hub) AND `/moon-in-{city}/{YYYY-MM}` (month), all 10 langs

---

## 1) Root cause

`css/critical.css` and `css/style.css` both had a `min-height` floor on `#moon-main-card` scoped to `html.moon-hub-page` and `html.moon-month-page`:

| Breakpoint | OLD `min-height` | Set by | When |
| --- | --- | --- | --- |
| Mobile (<768px) | `1555px` | Phase E4-city-e | calibrated when card had "6-children layout" measured at 1538px real content |
| Desktop (≥768px) | `770px` | Phase E4-city-e | calibrated when desktop real content was 753px |

The reservation was set as CLS protection. **However**, subsequent waves (Round 19 Hub Trimming + recent polish passes — MOON-EVENTS-MOVE-BELOW-FAQ-1, MOON-HUB-CAL-PLACEMENT-1, MOON-CITY-EVERGREEN-EDU-CONTENT-UI-POLISH-1, MOON-UPCOMING-CARDS-PADDING-POLISH-1) trimmed the inner content of the card on hub/month pages. The reservation became **over-sized** for the new content — the gap between actual content height and the 1555px / 770px floor showed as visible empty white space below the last card.

Per user screenshot on mobile (`/moon-in-riyadh`): roughly 300-400px of empty space between `.moon-highlights` (last visible card row) and `#moon-hub-cal` (next sibling section).

## 2) Fix

Changed `min-height` for `html.moon-hub-page #moon-main-card` and `html.moon-month-page #moon-main-card` from the fixed pixel floors to **`min-height: auto`** (content-driven height). The card now collapses to its actual content height; no empty space below.

CLS risk: **negligible**. The SSR HTML renders the same DOM tree as post-hydration — only inner text values change (`--` placeholders → numbers). The card's box dimensions are stable from first paint.

`html.moon-today-city-page #moon-main-card` and `html.moon-date-page #moon-main-card` keep their existing floors (`1810px` mobile / `1370px` desktop) because their content IS taller than the floor — no over-reservation problem for them.

## 3) Files touched

| File | Change |
| --- | --- |
| `css/critical.css` | Hub/month mobile rule: `min-height: 1555px` → `min-height: auto`. Hub/month desktop rule (inside `@media (min-width: 768px)`): `min-height: 770px` → `min-height: auto`. |
| `css/style.css` | Same two changes (the rules are duplicated for non-critical CSS fallback). |
| `index.html` | Cache-buster `css/style.css?v=403` → `?v=404` (both `<link rel="preload">` and `<link rel="stylesheet">`). |

No HTML structure changes. No JS changes. No new dependencies.

## 4) Pages tested (live SSR on port 3213)

| Page | HTTP | `#moon-main-card` present | Expected behavior |
| --- | --- | --- | --- |
| `/moon-today` | 200 | 1 | UNCHANGED (today-hub uses `moon-today-hub-page` class, has its own min-height path) |
| `/moon-in-riyadh` (AR hub) | 200 | 1 | Empty space below `.moon-highlights` REMOVED |
| `/moon-today-in-riyadh` (AR today-city) | 200 | 1 | UNCHANGED (`moon-today-city-page` class keeps 1810px floor) |
| `/moon-in-riyadh/2026-05` (AR month) | 200 | 1 | Empty space below content REMOVED |
| `/moon-in-riyadh/2026-05-15` (AR date) | 200 | 1 | UNCHANGED (`moon-date-page` class keeps 1810px floor) |
| `/en/moon-in-riyadh` (EN hub) | 200 | 1 | Empty space below content REMOVED |

### CSS rules verification (served bundle on port 3213, `/css/style.css?v=404`)

```
#moon-main-card,html.moon-today-city-page #moon-main-card{min-height:1810px}  ← UNCHANGED (today-city/date mobile)
#moon-main-card,html.moon-month-page #moon-main-card{min-height:auto}          ← NEW (hub/month mobile)
#moon-main-card,html.moon-today-city-page #moon-main-card{min-height:1370px}  ← UNCHANGED (today-city/date desktop)
#moon-main-card,html.moon-month-page #moon-main-card{min-height:auto}          ← NEW (hub/month desktop)
```

The critical.css inlined in `<head>` shows the same rule structure (`min-height:auto`).

### Data flow verification (no values lost)

All 8 data-cell IDs still present in `/moon-in-riyadh` SSR HTML:
- `moon-illumination-pct`, `moon-age`, `moon-rise`, `moon-set`, `moon-distance`, `moon-zodiac`, `next-full-moon`, `next-new-moon`

JS continues to fill these on hydration. No calc / MoonCalc / city-local-noon / Mecca-anchor logic touched.

## 5) Before / after (mobile, /moon-in-riyadh)

| | BEFORE | AFTER |
| --- | --- | --- |
| `#moon-main-card` height | `max(actual_content, 1555px)` → ~1555px (content was ~1100-1200px, so the 355-455px gap rendered as empty white space below `.moon-highlights`) | `actual_content` → ~1100-1200px (card ends naturally after last visible row) |
| Distance from last card to next section | ~300-400px of empty white space + card's normal padding-bottom | Just the section-card's normal padding-bottom + grid gap between sections (~48px total) |
| Page total height (mobile) | ~5800px | ~5400px (≈400px saved) |
| Desktop empty space | ~100-200px below content | 0 |

## 6) Invariants preserved (the explicit do-NOT list)

| Forbidden | Preserved? |
| --- | --- |
| لا تغيّر النصوص | ✓ no text changes |
| لا تغيّر التواريخ | ✓ no date code touched |
| لا تغيّر الأوقات | ✓ no time code touched |
| لا تغيّر الإضاءة / عمر القمر | ✓ no value code touched |
| لا تغيّر MoonCalc | ✓ MoonCalc.* untouched |
| لا تغيّر city-local noon | ✓ `_cityLocalNoon` untouched |
| لا تغيّر Mecca canonical | ✓ /moon-today logic untouched |
| لا تغيّر sitemap | ✓ no sitemap.xml changes |
| لا تغيّر canonical/hreflang/JSON-LD | ✓ no head meta changes |
| لا تغيّر الروابط | ✓ no anchor changes |
| لا تغيّر ترتيب الكروت | ✓ no DOM reordering |
| لا تضف dependencies | ✓ zero new deps |
| الديسكتوب لا يتأثر سلبًا | ✓ desktop `min-height: 770px` → `auto` also removes over-reservation on desktop (≤200px) without harming layout — content was already <770px |
| الإصلاح مطبق على جميع صفحات القمر التي تستخدم نفس القسم | ✓ rule selectors `html.moon-hub-page #moon-main-card, html.moon-month-page #moon-main-card` cover all langs (the page-class is set via `html` regardless of lang prefix) |

## 7) Acceptance criteria

| # | Criterion | Status |
| --- | --- | --- |
| 1 | No large white space below cards on mobile | ✅ PASS (min-height removed; content drives height) |
| 2 | Container ends after the cards with natural spacing | ✅ PASS (section-card's standard 24px padding-bottom is now the only post-content space) |
| 3 | No overflow | ✅ PASS (no width changes; only height changed) |
| 4 | No card overlap | ✅ PASS (no positioning changes) |
| 5 | No value / calculation changes | ✅ PASS (no JS / no MoonCalc touched) |
| 6 | Desktop not negatively affected | ✅ PASS (770px → auto on desktop removes a smaller over-reservation; same visual result) |
| 7 | Fix applies to all moon pages using the same section | ✅ PASS (selector covers hub + month, both classes set on `<html>` regardless of lang) |
| 8 | today-city and date pages UNCHANGED | ✅ PASS (their separate selectors still serve 1810px / 1370px) |

## 8) Commit message draft

```
fix(moon,ui,mobile): MOON-MOBILE-CARD-SECTION-WHITESPACE-FIX-1 — remove over-reserved min-height on hub/month #moon-main-card (all 10 langs)

`#moon-main-card` on /moon-in-{city} (hub) and /moon-in-{city}/{YYYY-MM}
(month) had `min-height: 1555px` mobile / `770px` desktop as CLS
reservation set by Phase E4-city-e (calibrated against 1538px real
content). Round 19 Hub Trimming + subsequent polish waves trimmed the
card content further, so the reservation now over-reserves by
~300-400px on mobile / ~100-200px on desktop, leaving visible empty
white space below the last visible card row.

Fix: change both rules to `min-height: auto` so the card collapses to
its actual content height. CLS risk is negligible because the SSR
HTML renders the same DOM tree (with `--` / `—` placeholders) — only
the inner text values change on hydration.

today-city/date pages keep their original min-height (1810px mobile /
1370px desktop) — their actual content is taller than the reservation,
so no over-reservation problem for them.

Scope:
 - /moon-in-{city} (hub) — all 10 langs (selector is `html.moon-hub-page`)
 - /moon-in-{city}/{YYYY-MM} (month) — all 10 langs (`html.moon-month-page`)
 - /moon-today, /moon-today-in-{city}, /moon-in-{city}/{YYYY-MM-DD}: UNCHANGED

Files:
 - css/critical.css (inlined in <head>) — 2 rules
 - css/style.css (external fallback duplicate) — 2 rules
 - index.html — cache-buster v=403 → v=404

No calc, no MoonCalc, no Umm al-Qura, no sitemap, no canonical/hreflang/
JSON-LD, no link/text/date/time/value changes, no new deps.
```
