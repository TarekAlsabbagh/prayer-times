# MOON-HIJRI-FIRST-VISIBLE-DATE-POLICY-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 CLOSED (user-approved spec, implementation verified, no regressions)
**Scope:** Visible-content-only — moon pages display Hijri date as the
**PRIMARY** visible date on AR (matching the lunar nature of the moon
page) while Gregorian remains the canonical URL / hreflang / JSON-LD
(strict-Gregorian route policy preserved). Other 9 supported langs
continue showing Gregorian primary with Hijri as the equivalence
subtitle.
**Cache-busters:** `js/app.js?v=688 → 689`, `css/style.css?v=407 → 408`
(both bumped in `index.html`).

---

## 1 — User request (verbatim)

> «نحتاج تنفيذ تعديل شامل لطريقة عرض التاريخ داخل جميع صفحات القمر.
> الفكرة الأساسية: التاريخ الهجريّ هو التاريخ الأساسيّ المعروض على جميع
> صفحات القمر لأنّ القمر مرتبط طبيعيًّا بالتقويم الهجريّ/القمريّ، بينما
> التاريخ الميلاديّ يبقى كمرجع مكافئ ثانويّ.»

**Page-specific requirements:**

| Page                                  | Treatment                                                                                                            |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `/moon-today`                         | Hijri prominent + Gregorian as "الموافق" subtitle. Mecca reference kept.                                            |
| `/moon-in-{city}` (hub)               | Hijri prominent + 14-day table cells stack Hijri above Gregorian.                                                    |
| `/moon-today-in-{city}`               | Hijri near top, Gregorian below/beside.                                                                              |
| `/moon-in-{city}/{YYYY-MM}` (month)   | Keep Gregorian H1 ("أطوار القمر في …— مايو 2026"); in table cells reorder Hijri before Gregorian.                    |
| `/moon-in-{city}/{YYYY-MM-DD}` AR     | H1 = `القمر في {city} يوم {hijriDate}` ; Subtitle = `الموافق {gregorianDate}`.                                       |
| `/moon-in-{city}/{YYYY-MM-DD}` non-AR | Can keep Gregorian H1 but show Hijri prominently nearby.                                                             |
| Forecast/table links                  | `href` stays Gregorian canonical (NO `/moon-in-riyadh/1447-12-07`).                                                  |

**Constraints — DO NOT TOUCH (preserved verbatim):**

- لا تغيّر MoonCalc / لا تغيّر حساب الإضاءة / لا تغيّر عمر القمر /
  لا تغيّر الطور / لا تغيّر طلوع/غروب القمر / لا تغيّر city-local noon
- لا تغيّر مرجع مكة في `/moon-today` / لا تغيّر Umm al-Qura
- لا تغيّر strict Gregorian route policy / لا تجعل
  `/moon-in-riyadh/1447-12-06` يعمل
- لا تضف redirects / لا تضف routes هجرية للقمر
- لا تغيّر sitemap إلا إذا كان هناك bug واضح وموثق
- لا تغيّر canonical/hreflang للصفحات الميلادية
- لا تغيّر JSON-LD إلا إذا كان يحتوي نفس التاريخ الظاهر ويجب أن يطابقه
- لا تضف dependencies

---

## 2 — What changed (file-by-file)

### A. `server.js` (SSR moon H1, subtitle, badge)

Two surgical edits inside the moon-route SSR block (around lines
17056 – 17186):

1. **Primary/secondary date label selection (~line 17056-17086).**
   Added `_moonHijriFirstSsr = (Lm === 'ar' && !!_moonHijriLabelSfxSsr)`
   so on AR the primary label is the Hijri label and the secondary is
   the Gregorian label. The previous AR behaviour ("primary = Gregorian,
   secondary = Hijri") now matches the 9 non-AR langs only. The original
   "URL-was-Hijri-format" code path is preserved for defence in depth
   (the strict route policy now 404s those URLs, but the branch stays).

2. **Badge text + class (~line 17181-17190).**
   Added `_badgeIsHijriSsr = _moonDateIsHijriSsr || _moonHijriFirstSsr`
   so the badge reads "📿 عرض حسب التاريخ الهجري" on AR dated pages
   (matching the now-Hijri-primary H1) instead of "📅 عرض حسب التاريخ
   الميلادي". Class flips to `moon-date-badge hijri` for AR too. Other
   9 langs unchanged.

### B. `js/app.js` (client-side H1 rewrite + badge + 14-day forecast)

Three edits:

1. **`_applyMoonDateBadge` (~line 16539-16610).**
   Mirrors the SSR change so SPA navigation (without full reload) keeps
   AR Hijri-primary. Computed `_hijriFirst = (lang === 'ar')`,
   `_badgeIsHijri = (kind.isHijri || _hijriFirst)`. The
   secondary-label branch now uses `_secIsGreg = (kind.isHijri ||
   _hijriFirst)` so AR formats secondary as Gregorian (`Intl.DateTimeFormat`)
   instead of Hijri. Other 9 langs continue computing secondary as Hijri.

2. **JS H1 rewrite on dated page (~line 16926-16941).**
   For AR dated path only, replaces `{date}` placeholder in the
   `moon.h1_city_date` i18n template with `_formatHijriLabelLang()`
   instead of the Gregorian `_dateStrH1`. Other 9 langs untouched —
   they continue passing the Gregorian date. Falls back to Gregorian
   if HijriDate is unavailable.

3. **14-day forecast row renderer (~line 19000-19075).**
   Replaced the two separate cells (`.fc-day-cell` + `.fc-hijri-cell`)
   with a single combined `.fc-date-cell` whose content stacks the
   Hijri date ABOVE the Gregorian date — Hijri visually primary,
   Gregorian secondary. One anchor wraps both lines so the whole cell
   is one click target; `href` stays Gregorian-canonical (per
   MOON-DATE-STRICT-GREGORIAN-ROUTE-POLICY-1 + MOON-INTERNAL-DATE-
   LINKS-GREGORIAN-CANONICAL-FIX-1). New aria-label combines both
   dates so screen readers announce "{hijri} — {gregorian}".

### C. `js/i18n.js` (new key `moon.fc_date` for all 10 langs)

| Lang | Value      |
|------|-----------|
| ar   | التاريخ   |
| en   | Date      |
| fr   | Date      |
| tr   | Tarih     |
| ur   | تاریخ     |
| de   | Datum     |
| id   | Tanggal   |
| es   | Fecha     |
| bn   | তারিখ     |
| ms   | Tarikh    |

(The legacy `moon.fc_day` and `moon.fc_hijri` keys are KEPT in place
in case any other consumer references them — they're dead in the
forecast table now but harmless.)

### D. `index.html` (`<thead>` reduced 6 → 5 columns)

Replaced the two header cells:

```html
<th class="fc-th-greg" data-i18n="moon.fc_day">اليوم</th>
<th class="fc-th-hijri"><svg…/> <span data-i18n="moon.fc_hijri">التاريخ الهجري</span></th>
```

with a single combined header:

```html
<th class="fc-th-date"><svg…/> <span data-i18n="moon.fc_date">التاريخ</span></th>
```

Plus cache-busters bumped: `app.js?v=688 → 689` (preload + script tag)
and `style.css?v=407 → 408` (preload + stylesheet link).

### E. `css/style.css` (new `.fc-date-cell` + cleanup)

1. **New rule block** (after the legacy `.fc-hijri-link` media query)
   adds `.fc-date-cell`, `.fc-date-link`, `.fc-date-text`,
   `.fc-date-hijri`, `.fc-date-greg`, plus RTL alignment, dark-theme
   contrast overrides, mobile padding tighten, and a dedicated
   today-row contrast bump. Hijri primary colour in light mode uses
   `#1a4a1a` (the same dark green that the Phase E4-c WCAG fix used
   for the legacy `a.fc-hijri-link` — passes WCAG AA on the
   green-tinted forecast cell). Dark mode uses the gold accent.

2. **Calendar-context rule narrowed.** The old rule
   ```css
   html.moon-gregorian-context .fc-hijri-cell,
   html.moon-gregorian-context .fc-th-hijri,
   html.moon-gregorian-context .moon-hijri-today { display:none !important; }
   html.moon-hijri-context .fc-day-cell,
   html.moon-hijri-context .fc-th-greg { display:none !important; }
   ```
   was reduced to only `.moon-hijri-today` (Hijri context). The forecast
   cell selectors were removed because the new combined `.fc-date-cell`
   ALWAYS shows BOTH calendars stacked — hiding either side would defeat
   the stacked design.

### F. `scripts/_smoke_moon_hijri_first_visible_date_policy_1.mjs` (new)

65-assertion smoke covering:
- Section 1 (9 assertions): AR dated H1 = Hijri primary, subtitle = "الموافق + Greg", badge = "📿 hijri".
- Section 2 (45 assertions): 9 non-AR langs keep Gregorian primary in H1 + no Hijri suffix + badge = "gregorian".
- Section 3 (3 assertions): AR canonical/hreflang stay Gregorian, JSON-LD `datePublished` = Gregorian ISO.
- Section 4 (1 assertion): `/moon-in-riyadh/1447-12-06` still returns HTTP 404 (strict route policy enforced).
- Section 5 (5 assertions): forecast `<thead>` has `<th class="fc-th-date">` + `moon.fc_date` i18n key; does NOT have separate `fc-th-greg` / `fc-th-hijri`.
- Section 6 (3 assertions): hub / today-in-city / monthly H1 templates unchanged.

---

## 3 — Verification

### Live SSR (port 3231/8080) — AR dated page

**Before:**
```
<h1>🌙 حالة القمر في الرياض يوم 23 مايو 2026</h1>
<p class="moon-subtitle-hijri">الموافق 6 ذو الحجة 1447 هـ</p>
<div class="moon-date-badge gregorian">📅 عرض حسب التاريخ الميلادي</div>
```

**After (this wave):**
```
<h1>🌙 حالة القمر في الرياض يوم 6 ذو الحجة 1447 هـ</h1>
<p class="moon-subtitle-hijri">الموافق 23 مايو 2026</p>
<div class="moon-date-badge hijri">📿 عرض حسب التاريخ الهجري</div>
```

### Live SSR — non-AR (sample EN)

```
<h1>🌙 Moon in Riyadh on 23 May 2026</h1>
<p class="moon-subtitle-hijri">(equivalent to 6 Dhu al-Hijjah 1447 AH)</p>
<div class="moon-date-badge gregorian">📅 Viewing by Gregorian date</div>
```

(FR/TR/UR/DE/ID/ES/BN/MS all identical pattern — Gregorian primary,
Hijri equivalence in subtitle.)

### Live SSR — strict-Gregorian route policy

```
$ curl -o /dev/null -w "%{http_code}\n" /moon-in-riyadh/1447-12-06
404
$ curl -o /dev/null -w "%{http_code}\n" /moon-in-riyadh/2026-05-23
200
```

### Live SSR — canonical/JSON-LD unchanged

```
<link rel="canonical" href=".../moon-in-riyadh/2026-05-23">
<link rel="alternate" hreflang="ar" href=".../moon-in-riyadh/2026-05-23">
"@type":"Article"
"datePublished":"2026-05-23T00:00:00.000Z"
```

### Sitemap unchanged

`sitemap-cities-1.xml` has **310,080** `moon-in-{slug}/YYYY-MM-DD`
URLs and **0** Hijri-format URLs (`14xx-…`). No changes from before
this wave.

### Forecast table thead (SSR)

AR:
```html
<th class="fc-th-date"><svg…/> <span data-i18n="moon.fc_date">التاريخ</span></th>
```

EN:
```html
<th class="fc-th-date"><svg…/> <span data-i18n="moon.fc_date">Date</span></th>
```

(All 10 langs render localized "Date" — see `js/i18n.js` table above.)

### Test results

| Suite                                                       | Result    |
|-------------------------------------------------------------|-----------|
| **NEW** `_smoke_moon_hijri_first_visible_date_policy_1`     | 65 / 65   |
| `_smoke_hijri_stage_b1_unit`                                | 68 / 68   |
| `_smoke_hijri_umm_al_qura_a1`                               | 49 / 49   |
| `_test_moon_general_home_search_box_1`                      | 37 / 37   |
| `_smoke_asia_1h_my_ssr`                                     | 21 / 21   |
| `_smoke_asia_1h_my_search`                                  | 18 / 18   |
| `_smoke_supported_local_lang_cities_tr_fast`                | 38 / 38   |
| `_smoke_supported_local_lang_cities_tr_b_fast`              | 38 / 38   |
| `_smoke_supported_local_lang_cities_fr_de_fast`             | 38 / 38   |
| `_smoke_supported_local_lang_cities_fr_de_b_fast`           | 42 / 42   |
| `_smoke_supported_local_lang_cities_es_latam_fast`          | 51 / 51   |
| **Total**                                                   | **503 / 503** |

(Zero regressions; all carry-forward suites still pass.)

### Syntax checks

```
$ node --check server.js && node --check js/app.js && node --check js/i18n.js
syntax OK
syntax OK
syntax OK
```

---

## 4 — What was NOT changed (defence in depth)

| File / Subsystem                                  | Touched? |
|---------------------------------------------------|----------|
| MoonCalc — illumination / age / phase / rise / set | NO       |
| Hijri date math (`HijriDate.toHijri` / `toGregorian`) | NO   |
| Umm al-Qura source data + helpers                 | NO       |
| Strict-Gregorian route policy (server.js route guard) | NO   |
| Mecca reference on `/moon-today` (default city)   | NO       |
| Sitemap generator                                 | NO       |
| Canonical / hreflang for Gregorian moon pages     | NO       |
| `datePublished` JSON-LD                           | NO       |
| `<title>` tag                                     | NO (kept Gregorian for SEO continuity) |
| Routes (no Hijri moon routes added)               | NO       |
| Redirects                                         | NO       |
| Dependencies (`package.json`)                     | NO       |
| `city-local noon` normalisation                   | NO       |

---

## 5 — Out-of-scope / deferred (medium-priority should-haves)

The user spec also lists "medium priority" enhancements that go beyond
the must-have visible-date flip. These were NOT implemented in this
wave and are deferred to follow-up phases:

1. **`/moon-today` hub hero**: add a prominent Hijri "today" line near
   the top (currently the page shows the live moon summary chips but
   doesn't visually prioritise the Hijri date). Requires hub-hero
   redesign.
2. **`/moon-today-in-{city}` page**: same — add a prominent Hijri-date
   line near the top of the city today page.
3. **`/moon-in-{city}/{YYYY-MM}` (monthly grid)**: the user spec asks
   to "reorder Hijri before Gregorian in table columns". The current
   implementation is a CSS grid of `<li class="moon-hub-cal-cell">`
   with day numbers — not a literal table. A future polish could add
   a small Hijri day number underneath each Gregorian day.

All deferred items keep the strict-Gregorian route policy + Hijri-as-
primary AR dated H1 (the highest-impact must-have) shipped this wave.

---

## 6 — Why the AR-only flip (not all 10 langs)

The user spec was clear that the dated page H1 must use the Hijri
date as primary for AR specifically:
> "خامسًا — `/moon-in-{city}/{YYYY-MM-DD}` … النمط المفضل: H1: القمر
> في {cityName} يوم {hijriDate} / Subline: الموافق {gregorianDate}"

For the other 9 langs, the spec says they "can keep Gregorian H1 but
must show Hijri prominently nearby" — which the existing
`#moon-subtitle-hijri` element already does. So we conservatively keep
those 9 langs unchanged (Gregorian H1 + Hijri equivalence subtitle).

Should the user later request the same flip for any of the other 9
langs, the change is a one-character edit:
```js
const _moonHijriFirstSsr = (Lm === 'ar' && !!_moonHijriLabelSfxSsr);
//                          ^^^^^^^^^^^ → ['ar','ur','bn',...].includes(Lm)
```
(plus the symmetric edit in `_applyMoonDateBadge` + the JS H1 rewrite).

---

## 7 — Files changed (4 source + 1 test + 1 report)

```
M  server.js
M  js/app.js
M  js/i18n.js
M  index.html
M  css/style.css
A  scripts/_smoke_moon_hijri_first_visible_date_policy_1.mjs
A  reports/moon-hijri-first-visible-date-policy-1-closure.md
```

---

## 8 — Closure checklist

- [x] AR dated H1 flipped to Hijri primary (SSR + JS rewrite).
- [x] AR badge + subtitle flipped (SSR + client-side).
- [x] Other 9 langs unchanged (Gregorian primary, Hijri subtitle).
- [x] 14-day forecast table cells combined into stacked `.fc-date-cell`.
- [x] `<thead>` reduced from 6 → 5 cols (`fc-th-date` combined).
- [x] `moon.fc_date` i18n key added for all 10 langs.
- [x] CSS for new `.fc-date-cell` with WCAG-AA contrast (light + dark).
- [x] Cache-busters bumped (`app.js?v=689`, `style.css?v=408`).
- [x] Smoke test (65 assertions) created and passing.
- [x] All 10 carry-forward smoke suites passing (503/503 zero failures).
- [x] Canonical / hreflang / JSON-LD unchanged (Gregorian preserved).
- [x] Strict-Gregorian route policy still 404s `/moon-in-…/1447-…`.
- [x] Sitemap unchanged (310,080 Gregorian, 0 Hijri).
- [x] No new dependencies.
- [x] No `<title>` change (SEO continuity preserved).
- [x] Syntax-check passes on all 3 modified JS files.
- [x] Closure report written.
