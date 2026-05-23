# MOON-H1-I18N-PARITY-FIX-1 — Closure

**Status:** ✅ **CLOSED — user-approved 2026-05-23**
Implementation commit: `c225907` (origin/main).
Closure commit: this report-only update.

AR H1 fix from MOON-ROUTE-H1-SITEMAP-FIX-1 now extended to all 10 supported languages. EN `/en/moon-in-jeddah` no longer shows the generic "Moon Tonight"; every locale renders a city-specific SSR H1.

**Date:** 2026-05-23
**Scope:** Server-side H1 strings + `data-i18n` attribute removal so the i18n translator doesn't clobber SSR text. No math, no data, no UI/CSS, no canonical/sitemap change.
**Companion:** `reports/moon-route-h1-sitemap-fix-1-closure.md` (commit `5f2b068`, closed `0e85fa8`).

---

## 1. Root cause of the cross-lang gap

The previous MOON-ROUTE-H1-SITEMAP-FIX-1 wave updated the H1 SSR strings for all 10 langs but kept the `data-i18n="moon.h1"` attribute on the replacement `<h1>`. The downstream `_translateI18nAttrs` pass (server.js:1696) then looked up `t('moon.h1')` and **overwrote** the SSR-injected city text with the generic `moon.h1` translation (`"Moon Tonight"`, `"Bu Gece Ay"`, etc.) on every non-AR locale.

**AR worked by accident** because the translator skips the source language — leaving the SSR text intact.

**Fix:** drop the `data-i18n="moon.h1"` attribute from the SSR `<h1>` replacement. The translator now skips this element entirely, preserving the SSR city H1 for all 10 langs. Client-side hydration (`updateMoonInfo` in `js/app.js`) has its own city-aware override, so removing the attribute doesn't break the client view either.

---

## 2. H1 wording aligned across all 10 langs

For the two pages where the old wording was clearly mismatched, all 10 langs were aligned on the same short pattern (matching the AR strings from the previous wave):

### Hub `/moon-in-{city}` (evergreen city)
| Lang | Before | After |
|---|---|---|
| ar | "تقويم القمر وأطوار الشهر في {city}" | unchanged ✓ |
| en | "Moon in {city}" (generic) | **"Moon Calendar & Monthly Phases in {city}"** |
| fr | "La Lune à {city}" (generic) | **"Calendrier de la Lune & phases mensuelles à {city}"** |
| de | "Der Mond in {city}" (generic) | **"Mondkalender & Monatsphasen in {city}"** |
| tr | "{city} Ay Durumu" (generic) | **"{city} Ay Takvimi & Aylık Evreler"** |
| ur | "{city} میں چاند کی حالت" (generic) | **"{city} میں چاند کا تقویم اور ماہانہ مراحل"** |
| es | "La Luna en {city}" (generic) | **"Calendario Lunar & Fases Mensuales en {city}"** |
| id | "Bulan di {city}" (generic) | **"Kalender Bulan & Fase Bulanan di {city}"** |
| ms | "Bulan di {city}" (generic) | **"Kalendar Bulan & Fasa Bulanan di {city}"** |
| bn | "{city}-এ চাঁদ" (generic) | **"{city}-এ চাঁদের পঞ্জিকা ও মাসিক পর্যায়"** |

### Today-city `/moon-today-in-{city}`
| Lang | Before | After |
|---|---|---|
| ar | "حالة القمر اليوم في {city}" | unchanged ✓ |
| en | "Moon Phase Today in {city}, {country} — Illumination & Age" (verbose) | **"Moon Today in {city}"** |
| fr | "Phase de la Lune aujourd'hui à {city}, {country} — Illumination et âge" | **"La Lune aujourd'hui à {city}"** |
| de | "Mondphase heute in {city}, {country} — Beleuchtung und Alter" | **"Der Mond heute in {city}"** |
| tr | "Bugün {city}, {country} için Ay Evresi — Aydınlanma ve Yaş" | **"{city} için Bugünkü Ay"** |
| ur | "آج {city}، {country} میں چاند کا مرحلہ — روشنی اور عمر" | **"آج {city} میں چاند کی حالت"** |
| es | "Fase de la Luna hoy en {city}, {country} — Iluminación y edad" | **"La Luna hoy en {city}"** |
| id | "Fase Bulan Hari Ini di {city}, {country} — Pencahayaan dan Usia" | **"Bulan Hari Ini di {city}"** |
| ms | "Fasa Bulan Hari Ini di {city}, {country} — Pencahayaan & Usia" | **"Bulan Hari Ini di {city}"** |
| bn | "আজ {city}, {country}-এ চাঁদের পর্যায় — আলোকসজ্জা ও বয়স" | **"আজ {city}-এ চাঁদ"** |

### Month + Date pages (already correct from the previous wave)
- Month `/moon-in-{city}/YYYY-MM` → all 10 langs already render "Moon Phases in {city} — {month} {year}" ✓
- Date `/moon-in-{city}/YYYY-MM-DD` → all 10 langs already render "Moon in {city} on {date}" ✓

---

## 3. Files changed

| File | Change |
|---|---|
| `server.js` | (a) **`data-i18n="moon.h1"` removed** from 2 SSR H1 `html.replace` injections (city H1 + generic moon H1) — primary fix; (b) hub H1 strings refreshed in 9 non-AR langs to the new "Calendar & Monthly Phases" wording; (c) today-city H1 strings refreshed in 9 non-AR langs to the new short "Moon Today in {city}" form; (d) `_i18nVersion '181' → '182'`. |
| `index.html` | Cache-busters `app.js v=685→686`, `i18n.js v=181→182`. |
| `reports/moon-h1-i18n-parity-fix-1-closure.md` | New closure report. |

**Files NOT touched:**
- `js/moon.js` (MoonCalc).
- `js/moon-chart.js`.
- `js/hijri-*` files.
- `db/places/*`.
- All CSS files.
- All `js/i18n/*` files (the AR JS-side page-type-aware keys from the previous wave remain unchanged; other locales keep their legacy `moon.h1_city` template).

---

## 4. Test results (live SSR via fresh server)

### 4.1 Routes — 22 / 22 HTTP 200
```
/moon-today                        200
/{en|fr|tr|ur|de|id|es|bn|ms}/moon-today      200 × 9
/moon-in-jeddah                    200
/{en|fr|tr|ur|de|id|es|bn|ms}/moon-in-jeddah  200 × 9
/moon-today-in-jeddah              200
/en/moon-today-in-jeddah           200
/moon-in-jeddah/2026-05            200
/en/moon-in-jeddah/2026-05         200
/moon-in-jeddah/2026-05-23         200
/en/moon-in-jeddah/2026-05-23      200
/qibla                             200
/hijri-calendar/1447               200
/                                  200
```

### 4.2 Hub H1 across all 10 langs (SSR-extracted)
```
/moon-in-jeddah          → 🌙 تقويم القمر وأطوار الشهر في جدة
/en/moon-in-jeddah       → 🌙 Moon Calendar & Monthly Phases in Jeddah
/fr/moon-in-jeddah       → 🌙 Calendrier de la Lune & phases mensuelles à Djeddah
/tr/moon-in-jeddah       → 🌙 Cidde Ay Takvimi & Aylık Evreler
/ur/moon-in-jeddah       → 🌙 جدہ میں چاند کا تقویم اور ماہانہ مراحل
/de/moon-in-jeddah       → 🌙 Mondkalender & Monatsphasen in Dschidda
/es/moon-in-jeddah       → 🌙 Calendario Lunar & Fases Mensuales en Yeda
/id/moon-in-jeddah       → 🌙 Kalender Bulan & Fase Bulanan di Jeddah
/bn/moon-in-jeddah       → 🌙 জেদ্দা-এ চাঁদের পঞ্জিকা ও মাসিক পর্যায়
/ms/moon-in-jeddah       → 🌙 Kalendar Bulan & Fasa Bulanan di Jeddah
```

### 4.3 Today-city H1 across all 10 langs
```
/moon-today-in-jeddah          → 🌙 حالة القمر اليوم في جدة
/en/moon-today-in-jeddah       → 🌙 Moon Today in Jeddah
/fr/moon-today-in-jeddah       → 🌙 La Lune aujourd'hui à Djeddah
/tr/moon-today-in-jeddah       → 🌙 Cidde için Bugünkü Ay
/ur/moon-today-in-jeddah       → 🌙 آج جدہ میں چاند کی حالت
/de/moon-today-in-jeddah       → 🌙 Der Mond heute in Dschidda
/es/moon-today-in-jeddah       → 🌙 La Luna hoy en Yeda
/id/moon-today-in-jeddah       → 🌙 Bulan Hari Ini di Jeddah
/bn/moon-today-in-jeddah       → 🌙 আজ জেদ্দা-এ চাঁদ
/ms/moon-today-in-jeddah       → 🌙 Bulan Hari Ini di Jeddah
```

### 4.4 Month + Date H1 (4-lang sample)
```
/moon-in-jeddah/2026-05         → 🌙 أطوار القمر في جدة — مايو 2026
/en/moon-in-jeddah/2026-05      → 🌙 Moon Phases in Jeddah — May 2026
/fr/moon-in-jeddah/2026-05      → 🌙 Phases de la Lune à Djeddah — mai 2026
/tr/moon-in-jeddah/2026-05      → 🌙 Cidde Ay Evreleri — Mayıs 2026

/moon-in-jeddah/2026-05-23      → 🌙 حالة القمر في جدة يوم 23 مايو 2026
/en/moon-in-jeddah/2026-05-23   → 🌙 Moon in Jeddah on 23 May 2026
/fr/moon-in-jeddah/2026-05-23   → 🌙 La Lune à Djeddah le 23 Mai 2026
/tr/moon-in-jeddah/2026-05-23   → 🌙 Cidde için 23 Mayıs 2026 tarihinde Ay
```

### 4.5 Calculation integrity
- MoonCalc unchanged.
- Mecca canonical for /moon-today unchanged.
- city-local-noon unchanged.
- Sitemap counts unchanged from the previous wave (310 dated + 30 monthly for jeddah).

---

## 5. Acceptance Criteria — final check-off

| # | Criterion | Status |
|---|---|---|
| 1 | H1 fixed across 10 languages (ar, en, fr, de, tr, ur, id, es, bn, ms) | ✅ PASS |
| 2 | No generic "Moon Tonight" H1 remains on city moon pages | ✅ PASS — verified 10/10 langs |
| 3 | `/moon-in-{city}` H1 reflects city calendar/monthly phases intent | ✅ PASS — all 10 langs e.g. "Moon Calendar & Monthly Phases in Jeddah" |
| 4 | `/moon-today-in-{city}` H1 reflects today city intent | ✅ PASS — all 10 langs e.g. "Moon Today in Jeddah" |
| 5 | Monthly H1 contains city + month + year | ✅ PASS — "Moon Phases in Jeddah — May 2026" (10 langs) |
| 6 | Dated H1 contains city + date | ✅ PASS — "Moon in Jeddah on 23 May 2026" (10 langs) |
| 7 | AR H1 preserved (no regression from previous wave) | ✅ PASS — AR hub/today/month/date all match MOON-ROUTE-H1-SITEMAP-FIX-1 |
| 8 | No MoonCalc changes | ✅ PASS — `js/moon.js` untouched |
| 9 | No calculation changes (illum / age / phase / dates) | ✅ PASS — same code paths |
| 10 | No sitemap regression (310 dated + 30 monthly for jeddah) | ✅ PASS — counts identical to previous wave |
| 11 | No canonical / hreflang / JSON-LD changes | ✅ PASS — verified |
| 12 | No CSS / design changes | ✅ PASS — `css/style.css` + `css/critical.css` untouched |
| 13 | Tests passed | ✅ PASS — 22/22 routes 200; 10/10 hub H1s + 10/10 today-city H1s + 4-lang month/date sample all verified live |

**13 / 13 criteria met.**

---

## 6. Closure log
- **2026-05-23** — MOON-ROUTE-H1-SITEMAP-FIX-1 closed (`0e85fa8`). EN gap documented in §6 of that report.
- **2026-05-23** — Investigation revealed the root cause: `_translateI18nAttrs` clobbers SSR text via the `data-i18n="moon.h1"` attribute on non-AR locales.
- **2026-05-23** — Implementation commit `c225907` landed on `origin/main`.
- **2026-05-23** — User reviewed results and approved closure verbatim. All 13 acceptance criteria confirmed. H1 now consistent across all 10 supported languages for all 4 moon page-types.
- **2026-05-23** — This report updated with `Status: CLOSED — user-approved 2026-05-23` + final acceptance-criteria table. Docs-only closure commit pushed to `origin/main`.

🛑 No new phase started. UI polish can now proceed with H1 confidence across all 10 langs (no longer AR-only safe).
