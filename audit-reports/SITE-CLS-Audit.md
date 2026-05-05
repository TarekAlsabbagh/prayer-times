# SITE-CLS-Audit — Page Active Layout Shift Audit

Generated: 2026-05-05T11:24:05.178Z
Target: `https://prayer-times-d4w8.onrender.com`

## Executive Summary

- 🔴 **CRITICAL** (CLS > 0.25): **6** routes
- 🟠 **HIGH** (0.10 < CLS ≤ 0.25): **3** routes
- 🟡 **MEDIUM** (0.05 < CLS ≤ 0.10): **7** routes
- 🟢 **LOW** (CLS ≤ 0.05): **0** routes

Total routes audited: **16**
Total Lighthouse runs: **16**

## Per-Route Lighthouse Numbers (Render)

| Priority | Route | Perf | CLS | LCP | SI | TTFB |
|---|---|---|---|---|---|---|
| 🔴 CRITICAL | `/today-hijri-date` | 53 | 0.908 | 5209ms | 4311ms | 699ms |
| 🔴 CRITICAL | `/hijri-calendar/1447` | 58 | 0.877 | 4418ms | 3822ms | 823ms |
| 🔴 CRITICAL | `/ramadan-countdown` | 78 | 0.349 | 1726ms | 4524ms | 860ms |
| 🔴 CRITICAL | `/eid-al-fitr-countdown` | 79 | 0.309 | 1601ms | 4976ms | 1153ms |
| 🔴 CRITICAL | `/hijri-new-year-countdown` | 80 | 0.309 | 1612ms | 4172ms | 783ms |
| 🔴 CRITICAL | `/eid-al-adha-countdown` | 77 | 0.301 | 2067ms | 5469ms | 1014ms |
| 🟠 HIGH | `/prayer-times-in-makkah-21.4-39.8` | 63 | 0.223 | 5580ms | 5321ms | 807ms |
| 🟠 HIGH | `/moon-in-jeddah-21.5-39.2` | 90 | 0.125 | 1766ms | 5019ms | 938ms |
| 🟠 HIGH | `/dateconverter` | 73 | 0.104 | 5933ms | 3746ms | 738ms |
| 🟡 MEDIUM | `/msbaha` | 75 | 0.090 | 5921ms | 3730ms | 761ms |
| 🟡 MEDIUM | `/moon-today` | 95 | 0.059 | 1637ms | 4612ms | 597ms |
| 🟡 MEDIUM | `/zakat-calculator` | 90 | 0.057 | 3105ms | 3969ms | 649ms |
| 🟡 MEDIUM | `/qibla-in-jeddah-21.5-39.2` | 91 | 0.057 | 1713ms | 7597ms | 2658ms |
| 🟡 MEDIUM | `/azkar` | 97 | 0.057 | 1614ms | 3712ms | 677ms |
| 🟡 MEDIUM | `/qibla` | 95 | 0.057 | 1688ms | 4178ms | 661ms |
| 🟡 MEDIUM | `/` | 90 | 0.056 | 1988ms | 6741ms | 1427ms |

## Per-Route Diagnostic + Suggested Fix Type

### 🔴 CRITICAL  `/today-hijri-date`

- Performance: **53**  |  CLS: **0.908**  |  LCP: **5209ms**  |  SI: **4311ms**
- Top shifts:
    - score `0.859`  h=376px  →  `<div class="section-card hpage-hero ht-hero">`
    - score `0.057`  h=2594px  →  `<div class="page active" id="page-hijri-day">`
    - score `0.037`  h=2594px  →  `<div class="page active" id="page-hijri-day">`
    - score `0.011`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<p id="hijri-today-desc">` line 2578
    - `<div id="hijri-today-info-grid">` line 2588
    - `<div id="hijri-today-faq">` line 2604
    - `<p id="hijri-today-footer-seo">` line 2615

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-hijri-today; SSR-fill or min-height reserve hero section (`section-card hpage-hero ht-hero`) — biggest shift contributor; SSR-fill 4 empty element(s): #hijri-today-desc, #hijri-today-info-grid, #hijri-today-faq…

### 🔴 CRITICAL  `/hijri-calendar/1447`

- Performance: **58**  |  CLS: **0.877**  |  LCP: **4418ms**  |  SI: **3822ms**
- Top shifts:
    - score `0.859`  h=280px  →  `<div class="section-card hpage-hero-start">`
    - score `0.057`  h=3165px  →  `<div class="page active" id="page-hijri-year">`
    - score `0.017`  h=3165px  →  `<div class="page active" id="page-hijri-year">`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<p id="hyear-intro">` line 2687
    - `<div id="hyear-info-grid">` line 2695
    - `<div id="hyear-today-in-year">` line 2700 [hidden]
    - `<div id="hyear-cta">` line 2717
    - `<p id="hyear-years-current">` line 2722
    - `<div id="hyear-years-grid">` line 2723
    - `<div id="hyear-faq">` line 2729
    - `<p id="hyear-seo-text">` line 2734
    - ...and 1 more

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-hijri-year; SSR-fill or min-height reserve hero section (`section-card hpage-hero-start`) — biggest shift contributor; SSR-fill 9 empty element(s): #hyear-intro, #hyear-info-grid, #hyear-today-in-year…

### 🔴 CRITICAL  `/ramadan-countdown`

- Performance: **78**  |  CLS: **0.349**  |  LCP: **1726ms**  |  SI: **4524ms**
- Top shifts:
    - score `0.338`  h=793px  →  `<section class="section-card countdown-hero">`
    - score `0.056`  h=3329px  →  `<div class="page countdown-page cd-ramadan active" id="page-ramadan-countdown">`
    - score `0.010`  h=3329px  →  `<div class="page countdown-page cd-ramadan active" id="page-ramadan-countdown">`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-ramadan-countdown; SSR-fill or min-height reserve hero section (`section-card countdown-hero`) — biggest shift contributor

### 🔴 CRITICAL  `/eid-al-fitr-countdown`

- Performance: **79**  |  CLS: **0.309**  |  LCP: **1601ms**  |  SI: **4976ms**
- Top shifts:
    - score `0.301`  h=803px  →  `<section class="section-card countdown-hero">`
    - score `0.059`  h=3308px  →  `<div class="page countdown-page cd-eid-al-fitr active" id="page-eid-al-fitr-coun`
    - score `0.008`  h=3308px  →  `<div class="page countdown-page cd-eid-al-fitr active" id="page-eid-al-fitr-coun`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-eid-al-fitr-countdown; SSR-fill or min-height reserve hero section (`section-card countdown-hero`) — biggest shift contributor

### 🔴 CRITICAL  `/hijri-new-year-countdown`

- Performance: **80**  |  CLS: **0.309**  |  LCP: **1612ms**  |  SI: **4172ms**
- Top shifts:
    - score `0.301`  h=827px  →  `<section class="section-card countdown-hero">`
    - score `0.056`  h=3363px  →  `<div class="page countdown-page cd-hijri-new-year active" id="page-hijri-new-yea`
    - score `0.008`  h=3363px  →  `<div class="page countdown-page cd-hijri-new-year active" id="page-hijri-new-yea`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-hijri-new-year-countdown; SSR-fill or min-height reserve hero section (`section-card countdown-hero`) — biggest shift contributor

### 🔴 CRITICAL  `/eid-al-adha-countdown`

- Performance: **77**  |  CLS: **0.301**  |  LCP: **2067ms**  |  SI: **5469ms**
- Top shifts:
    - score `0.301`  h=793px  →  `<section class="section-card countdown-hero">`
    - score `0.291`  h=3298px  →  `<div class="page countdown-page cd-eid-al-adha active" id="page-eid-al-adha-coun`
    - score `0.284`  h=3298px  →  `<div class="page countdown-page cd-eid-al-adha active" id="page-eid-al-adha-coun`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-eid-al-adha-countdown; SSR-fill or min-height reserve hero section (`section-card countdown-hero`) — biggest shift contributor

### 🟠 HIGH  `/prayer-times-in-makkah-21.4-39.8`

- Performance: **63**  |  CLS: **0.223**  |  LCP: **5580ms**  |  SI: **5321ms**
- Top shifts:
    - score `0.136`  h=893px  →  `<div class="next-prayer-banner">`
    - score `0.063`  h=6869px  →  `<div class="page active" id="page-prayer-times">`
    - score `0.012`  h=6869px  →  `<div class="page active" id="page-prayer-times">`
    - score `0.011`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-prayer-times

### 🟠 HIGH  `/moon-in-jeddah-21.5-39.2`

- Performance: **90**  |  CLS: **0.125**  |  LCP: **1766ms**  |  SI: **5019ms**
- Top shifts:
    - score `0.084`  h=218px  →  `<div class="moon-hijri-today" id="moon-hijri-today">`
    - score `0.058`  h=7166px  →  `<div class="page active" id="page-moon">`
    - score `0.028`  h=7166px  →  `<div class="page active" id="page-moon">`
    - score `0.012`  h=51px  →  `<div class="moon-sticky-bar" id="moon-sticky-bar">`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<p id="moon-timezone-note">` line 1613 [hidden]
    - `<div id="mc-progress-fill">` line 1646

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-moon; SSR-fill 2 empty element(s): #moon-timezone-note, #mc-progress-fill

### 🟠 HIGH  `/dateconverter`

- Performance: **73**  |  CLS: **0.104**  |  LCP: **5933ms**  |  SI: **3746ms**
- Top shifts:
    - score `0.069`  h=998px  →  `<div class="section-card">`
    - score `0.056`  h=1036px  →  `<div class="page active" id="page-date-converter">`
    - score `0.034`  h=1036px  →  `<div class="page active" id="page-date-converter">`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-date-converter

### 🟡 MEDIUM  `/msbaha`

- Performance: **75**  |  CLS: **0.090**  |  LCP: **5921ms**  |  SI: **3730ms**
- Top shifts:
    - score `0.067`  h=646px  →  `<div class="section-card tasbih-card">`
    - score `0.056`  h=684px  →  `<div class="page active" id="page-tasbih">`
    - score `0.022`  h=684px  →  `<div class="page active" id="page-tasbih">`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<div id="tasbih-progress">` line 2959

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-tasbih; SSR-fill 1 empty element(s): #tasbih-progress; investigate LCP element render delay (Q-Hub-G/H pattern: SSR-inject text + skip JS overwrite)

### 🟡 MEDIUM  `/moon-today`

- Performance: **95**  |  CLS: **0.059**  |  LCP: **1637ms**  |  SI: **4612ms**
- Top shifts:
    - score `0.058`  h=6493px  →  `<div class="page active" id="page-moon">`
    - score `0.023`  h=124px  →  `<div id="moon-dual-cta" class="qibla-dual-cta">`
    - score `0.022`  h=6493px  →  `<div class="page active" id="page-moon">`
    - score `0.012`  h=51px  →  `<div class="moon-sticky-bar" id="moon-sticky-bar">`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<p id="moon-timezone-note">` line 1613 [hidden]
    - `<div id="mc-progress-fill">` line 1646

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-moon; SSR-fill 2 empty element(s): #moon-timezone-note, #mc-progress-fill

### 🟡 MEDIUM  `/zakat-calculator`

- Performance: **90**  |  CLS: **0.057**  |  LCP: **3105ms**  |  SI: **3969ms**
- Top shifts:
    - score `0.057`  h=4290px  →  `<div class="page active" id="page-zakat" data-zakat-wired="1">`
    - score `0.028`  h=4290px  →  `<div class="page active" id="page-zakat" data-zakat-wired="1">`
    - score `0.011`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<div id="zakat-toast">` line 2559 [hidden]

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-zakat; SSR-fill 1 empty element(s): #zakat-toast

### 🟡 MEDIUM  `/qibla-in-jeddah-21.5-39.2`

- Performance: **91**  |  CLS: **0.057**  |  LCP: **1713ms**  |  SI: **7597ms**
- Top shifts:
    - score `0.057`  h=5664px  →  `<div class="page active" id="page-qibla" data-qibla-mode="city">`
    - score `0.011`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<p id="qibla-summary-line">` line 1256
    - `<p id="qibla-hub-geo-microcopy">` line 1273
    - `<p id="qibla-hub-geo-status">` line 1274
    - `<p id="qibla-wow-caption">` line 1303
    - `<p id="qibla-main-cta-note">` line 1309
    - `<h2 id="qibla-hub-howto-title">` line 1347
    - `<ol id="qibla-hub-howto-steps">` line 1348
    - `<h2 id="qibla-hub-usecases-title">` line 1353
    - ...and 4 more

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-qibla; SSR-fill 12 empty element(s): #qibla-summary-line, #qibla-hub-geo-microcopy, #qibla-hub-geo-status…

### 🟡 MEDIUM  `/azkar`

- Performance: **97**  |  CLS: **0.057**  |  LCP: **1614ms**  |  SI: **3712ms**
- Top shifts:
    - score `0.056`  h=1356px  →  `<div class="page active" id="page-duas">`
    - score `0.011`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
    - score `0.008`  h=1356px  →  `<div class="page active" id="page-duas">`
    - score `0.001`  h=31px  →  `<a class="sticky-next-bar" id="sticky-next-bar" role="status" aria-live="polite"`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<div id="dua-categories">` line 2908
    - `<div id="dua-list">` line 2912

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-duas; SSR-fill 2 empty element(s): #dua-categories, #dua-list

### 🟡 MEDIUM  `/qibla`

- Performance: **95**  |  CLS: **0.057**  |  LCP: **1688ms**  |  SI: **4178ms**
- Top shifts:
    - score `0.056`  h=7351px  →  `<div class="page active" id="page-qibla" data-qibla-mode="hub">`
    - score `0.026`  h=529px  →  `<div class="section-card qibla-hub-hero-card" id="qibla-hub-hero">`
    - score `0.026`  h=7351px  →  `<div class="page active" id="page-qibla" data-qibla-mode="hub">`
    - score `0.001`  h=61px  →  `<h1 id="qibla-hero-title" class="qibla-hero-title">`
- SSR-empty elements (filled by JS, no `data-qhh-ssr` marker):
    - `<p id="qibla-summary-line">` line 1256
    - `<p id="qibla-hub-geo-microcopy">` line 1273
    - `<p id="qibla-hub-geo-status">` line 1274
    - `<p id="qibla-wow-caption">` line 1303
    - `<p id="qibla-main-cta-note">` line 1309
    - `<h2 id="qibla-hub-howto-title">` line 1347
    - `<ol id="qibla-hub-howto-steps">` line 1348
    - `<h2 id="qibla-hub-usecases-title">` line 1353
    - ...and 4 more

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-qibla; SSR-fill 12 empty element(s): #qibla-summary-line, #qibla-hub-geo-microcopy, #qibla-hub-geo-status…

### 🟡 MEDIUM  `/`

- Performance: **90**  |  CLS: **0.056**  |  LCP: **1988ms**  |  SI: **6741ms**
- Top shifts:
    - score `0.056`  h=2674px  →  `<div class="page active" id="page-prayer-times">`
    - score `0.018`  h=2674px  →  `<div class="page active" id="page-prayer-times">`
    - score `0.000`  h=22px  →  `<span class="mit-label" data-i18n="mit.qibla">`

**Suggested fix:** pre-apply .page.active layout (E4-b/Q-Hub-K2 pattern) for #page-prayer-times

## CSS Static Audit (state classes with layout properties)

Files scanned: css/style.css, css/critical.css
- 🔴 RISKY (no base counterpart): 19
- 🟡 PARTIAL (state matches some base props): 0
- 🟠 NEEDS REVIEW: 2
- 🟢 SAFE: 2

### Confirmed RISKY rules

- `css/style.css:600` `.moon-comparison .mc-cycle-step.is-active` { position: relative; border: 2px solid var(--primary-light) }
- `css/style.css:1703` `.lang-switcher.open .lang-menu` { display: block }
- `css/style.css:4536` `.countdown-faq-list:not(.is-expanded) > details:nth-of-type(n+4)` { display: none }
- `css/style.css:7124` `.page.active` { padding: 24px; display: block }
- `css/style.css:7512` `.sidebar-overlay.open` { display: block } (in @media (max-width: 768px))
- `css/style.css:7569` `.page.active` { padding: 12px; max-width: 100%; box-sizing: border-box } (in @media (max-width: 768px))
- `css/style.css:7738` `.settings-modal-overlay.open` { display: flex }
- `css/style.css:9999` `.loc-hero-smart-pill.is-visible` { display: inline-flex }
- `css/style.css:13922` `/* ═══ Phase E4-b (2026-05-02): pre-apply .page.active layout properties on
   ALL SSR-rendered moo` { padding: 24px; display: block }
- `css/style.css:13958` `html.moon-today-hub-page #page-moon,
html.moon-today-city-page #page-moon,
html.moon-hub-page #pag` { padding: 24px }

## SSR-Empty Element Audit (filled by JS without SSR marker)

Total flagged: 65

Grouped by parent SPA page (HIGH priority = above-the-fold on hub/landing):

- **#(global)** — 18 elements: `#sidebar-hijri-date`, `#sidebar-greg-date`, `#country-name`, `#loc-hero-suggestions`, `#city-suggestions`, `#tl-timeline`, …+12
- **#page-all-cities** — 4 elements: `#all-cities-container`, `#cities-pagination`, `#footer-year`, `#adhan-popup-city`
- **#page-duas** — 2 elements: `#dua-categories`, `#dua-list`
- **#page-hijri-day** — 2 elements: `#hday-hierarchy`, `#hday-faq`
- **#page-hijri-month** — 10 elements: `#hmonth-subtitle`, `#hmonth-info-grid`, `#hmonth-nav`, `#hmonth-today-in-month`, `#hmonth-days-summary`, `#hmonth-links`, …+4
- **#page-hijri-today** — 4 elements: `#hijri-today-desc`, `#hijri-today-info-grid`, `#hijri-today-faq`, `#hijri-today-footer-seo`
- **#page-hijri-year** — 9 elements: `#hyear-intro`, `#hyear-info-grid`, `#hyear-today-in-year`, `#hyear-cta`, `#hyear-years-current`, `#hyear-years-grid`, …+3
- **#page-moon** — 2 elements: `#moon-timezone-note`, `#mc-progress-fill`
- **#page-qibla** — 12 elements: `#qibla-summary-line`, `#qibla-hub-geo-microcopy`, `#qibla-hub-geo-status`, `#qibla-wow-caption`, `#qibla-main-cta-note`, `#qibla-hub-howto-title`, …+6
- **#page-tasbih** — 1 elements: `#tasbih-progress`
- **#page-zakat** — 1 elements: `#zakat-toast`

## Recommended Phase Order (highest CLS first)

Each item below should be its own SITE-CLS-{Route} phase. Don't fix multiple at once.

1. **`/today-hijri-date`** — CLS 0.908, Perf 53 → fix `#page-hijri-today`
2. **`/hijri-calendar/1447`** — CLS 0.877, Perf 58 → fix `#page-hijri-year`
3. **`/ramadan-countdown`** — CLS 0.349, Perf 78 → fix `#page-ramadan-countdown`
4. **`/eid-al-fitr-countdown`** — CLS 0.309, Perf 79 → fix `#page-eid-al-fitr-countdown`
5. **`/hijri-new-year-countdown`** — CLS 0.309, Perf 80 → fix `#page-hijri-new-year-countdown`
6. **`/eid-al-adha-countdown`** — CLS 0.301, Perf 77 → fix `#page-eid-al-adha-countdown`
7. **`/prayer-times-in-makkah-21.4-39.8`** — CLS 0.223, Perf 63 → fix `#page-prayer-times`
8. **`/moon-in-jeddah-21.5-39.2`** — CLS 0.125, Perf 90 → fix `#page-moon`
9. **`/dateconverter`** — CLS 0.104, Perf 73 → fix `#page-date-converter`
10. **`/msbaha`** — CLS 0.090, Perf 75 → fix `#page-tasbih`
11. **`/moon-today`** — CLS 0.059, Perf 95 → fix `#page-moon`
12. **`/zakat-calculator`** — CLS 0.057, Perf 90 → fix `#page-zakat`
13. **`/qibla-in-jeddah-21.5-39.2`** — CLS 0.057, Perf 91 → fix `#page-qibla`
14. **`/azkar`** — CLS 0.057, Perf 97 → fix `#page-duas`
15. **`/qibla`** — CLS 0.057, Perf 95 → fix `#page-qibla`
16. **`/`** — CLS 0.056, Perf 90 → fix `#page-prayer-times`

## Fix-Type Cheat Sheet (no code yet)

| Type | Pattern | Reference |
|---|---|---|
| **SSR fill** | Inject final text/HTML into the empty element via `html.replace()` in server.js, gated by route flag. Add `data-qhh-ssr="1"`. JS skips overwrite when marker present. | Q-Hub-H pattern (server.js `_qHubHeroSSR`, app.js `_qhhSkip()`) |
| **min-height reservation** | Add `min-height: NNNpx` (desktop) / responsive override (mobile) on the empty element. Prevents 0→content height jump. | Q-Hub-J pattern (`#qibla-hub-howto-card`, `#qibla-faq`) |
| **pre-apply layout CSS** | The `.page.active` parity fix. SSR-inject `html.{route}-page` class, then CSS rule `html.{route}-page #page-{route} { display: block; padding: 24px; }` matching `.page.active`. JS adding `.active` becomes a no-op. | Phase E4-b (moon), Q-Hub-K2 (qibla) |
| **remove post-hydration toggle** | Restructure JS to never add the layout-changing class. Move the toggle to a non-layout property (e.g., visibility/opacity inside a positioned wrapper). | Use sparingly when SSR fill is impractical |

## Explicitly Out of Scope (this audit)

- No code edits, commits, or deploys
- No fixes applied — this is diagnostic-only
- /qibla and /qibla-in-{city} already closed via Q-Hub-A through K2
- Bundling, script-stripping, footer-cookie deferral — Q-Hub-I was reverted; not reopening

## How to Re-Run

```bash
# Static scans (no browser, instant):
node scripts/audit-active-layout-css.mjs
node scripts/audit-ssr-empty-elements.mjs

# Dynamic audit on Render (16 routes × N runs):
node scripts/audit-cls-runner.mjs --target=render --runs=1   # quick triage
node scripts/audit-cls-runner.mjs --target=render --runs=3 --routes=/some-bad-route   # confirm

# Local-only diagnostic (against localhost:3000):
node scripts/audit-cls-runner.mjs --target=local --runs=1

# Rebuild this report:
node scripts/audit-build-report.mjs
```
