# MOON-CARD-AND-COMPARISON-COPY-FIX-1 — Closure

**Status:** ✅ Implemented. Combined AR-only refinement of the "moon today" main card (phase name, zodiac label, full/new moon dates, distance label + dynamic distance reference) AND the "moon comparison" section (title, delta LTR rendering, "tomorrow reaches" template rewording). No math, no SEO, no UI/layout change.

**Date:** 2026-05-23
**Scope:** AR-only. 8 i18n strings + 3 small JS logic blocks. Other 9 supported langs untouched.

---

## 1. Files changed

| File | Change |
|---|---|
| `js/i18n/ar.js` | 6 keys updated + 1 new key added |
| `js/i18n.js` | Same AR changes mirrored (legacy bundle) |
| `js/app.js` | 3 small logic blocks (next-full/new year, distance-sub city override, delta `dir="ltr"`) + cache-buster `v=681 → v=682` |
| `index.html` | 3 inline AR SSR defaults updated + cache-busters `app.js v=681→v=682`, `i18n.js v=176→v=177` |
| `server.js` | `_i18nVersion '176' → '177'` |

**Files NOT touched** (verified `git diff --quiet`):
- `js/moon.js` (MoonCalc).
- `js/moon-chart.js`.
- `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `db/hijri/umm-al-qura.json`.
- All `db/places/*` data.
- All 9 non-AR i18n bundles (en/fr/de/tr/es/id/ms/ur/bn).
- CSS, sitemap, JSON-LD logic.

---

## 2. Per-item changes

### A. Main card — `#moon-main-card`

| # | What | Before | After |
|---|---|---|---|
| A1 | Phase name (1st quarter) | `'moon.phase_first_quarter': 'تربيع أول'` | `'التربيع الأول'` |
| A2 | Phase name (last quarter) | `'moon.phase_last_quarter': 'تربيع أخير'` | `'التربيع الأخير'` (parallel consistency) |
| A3 | Zodiac card label | `'moon.zodiac_label': 'الكوكبة الفلكيّة'` | `'موقع القمر فلكيًا'` |
| A4 | Distance label | `'moon.distance': 'المسافة للقمر'` | `'المسافة إلى القمر'` |
| A5 | Distance sub-text (NEW) | static `'كم من موقعك'` always | new `'moon.distance_from_city_tpl': 'كم من {city}'`, JS-driven per page |
| A6 | Next full moon date | `31 مايو` (no year) | `31 مايو 2026` (year added) |
| A7 | Next new moon date | `15 يونيو` (no year) | `15 يونيو 2026` (year added) |

**A5 logic** (`js/app.js`, AR-only, runs right after distance value is computed):
- If `_citySlug` → `_refName = _moonCityDisplayName(_citySlug)` → e.g. "كم من الرياض" / "كم من جدة"
- Else if `_isMoonTodayPage` → `_refName = 'مكة المكرمة'` → "كم من مكة المكرمة"
- Else (e.g. homepage moon widget with real geolocation) → keep legacy `'كم من موقعك'`

So:
- `/moon-today` (Mecca canonical) → "كم من مكة المكرمة"
- `/moon-in-riyadh` → "كم من الرياض"
- `/moon-in-jeddah` → "كم من جدة"
- Homepage widget with geolocation → "كم من موقعك" (preserved, accurate)

### B. Comparison card — `#moon-comparison`

| # | What | Before | After |
|---|---|---|---|
| B1 | Section title | `'تطوّر القمر من الأمس إلى اليوم'` | `'تغيّر إضاءة القمر من الأمس إلى اليوم'` |
| B2 | Delta rendering | `10.9%+` (RTL bidi pushed `+` to visual end) | `+10.9%` (forced via `_dValue.dir = 'ltr'`) |
| B3 | "Tomorrow" template | `'غدًا يبلغ القمر طور {X}.'` | `'تحدث ذروة {X} غدًا.'` |
| B4 | "Today" template | `'اليوم يبلغ القمر طور {X}.'` | `'تحدث ذروة {X} اليوم.'` |

**B3/B4 rationale:** the previous wording "يبلغ القمر طور X" read as a contradiction when X was the same phase already visible today (the moon stays in the "first quarter" general phase for several days around the precise quarter moment). New wording "تحدث ذروة X" explicitly says "the **peak** of X happens at this time" — accurate regardless of whether the general phase is already on display.

---

## 3. Languages updated

**Arabic only.** Other 9 supported langs (en/fr/de/tr/es/id/ms/ur/bn) are explicitly **not touched** in this phase per the user's pattern from previous phases. The same multi-lang treatment can be applied later if/when requested.

Specifically:
- `js/i18n/en.js` `moon.phase_first_quarter` = `"First Quarter"` — UNCHANGED ✓
- `js/i18n/en.js` `moon.zodiac_label` = `"Astronomical Constellation"` — UNCHANGED ✓
- `js/i18n/en.js` `moon.mc_title` = `"Moon evolution — yesterday to today"` — UNCHANGED ✓
- `js/i18n/en.js` `moon.mc_status_tomorrow` = `"Tomorrow the Moon reaches {nextPhaseIcon} {nextPhaseName}."` — UNCHANGED ✓
- `js/i18n/en.js` `moon.distance` = `"Distance to Moon"` — UNCHANGED ✓
- 8 other locales similarly untouched.

---

## 4. Calculation-integrity confirmations

| Subject | Status |
|---|---|
| MoonCalc (`js/moon.js`) source | ✅ Unchanged (`git diff --quiet` clean) |
| Illumination % value | ✅ Unchanged — `49.13%` still computed by same `MoonCalc.getMoonIllumination` |
| Moon age value | ✅ Unchanged — `6.8` still computed by same routine |
| Moon distance value | ✅ Unchanged — `380,612 km` still computed by same `MoonCalc.getMoonDistance(today, _lat, _lng)` |
| Next full / next new moon dates | ✅ Unchanged — same `nextFull` / `nextNew` Date objects, only the rendered string format adds the year |
| Comparison yesterday vs today | ✅ Unchanged — `38.2%` / `49.1%` / `+10.9%` numeric values identical |
| Mecca canonical reference for `/moon-today` | ✅ Preserved (commit `1b54433`) |
| city-local-noon for `/moon-in-{city}` | ✅ Preserved (commit `6c64484`) |
| Umm al-Qura table + Hijri logic | ✅ Unchanged |

The 3 JS edits are **strictly cosmetic**:
1. Append `.getFullYear()` to a template string — same Date object.
2. Read existing `_lat/_lng/_citySlug/_isMoonTodayPage` to pick a label — no math.
3. Set `dir="ltr"` on an existing span — no value change.

---

## 5. Test results

### 5.1 Syntax — `node -c` on all 4 modified JS files

```
OK  js/i18n.js
OK  js/i18n/ar.js
OK  js/app.js
OK  server.js

4 / 4 PASS
```

### 5.2 Route smoke (9 routes, fresh server)

```
200  /moon-today
200  /en/moon-today
200  /fr/moon-today
200  /moon-in-riyadh
200  /moon-in-jeddah
200  /moon-today-in-riyadh
200  /qibla
200  /hijri-calendar/1447
200  /

9 / 9 PASS
```

### 5.3 SSR inline AR labels verified

```
data-i18n="moon.distance">المسافة إلى القمر
data-i18n="moon.zodiac_label">موقع القمر فلكيًا
data-i18n="moon.mc_title">تغيّر إضاءة القمر من الأمس إلى اليوم
```

### 5.4 AR i18n bundle values (served)

```
"moon.phase_first_quarter":"التربيع الأول"
"moon.phase_last_quarter":"التربيع الأخير"
"moon.zodiac_label":"موقع القمر فلكيًا"
"moon.distance":"المسافة إلى القمر"
"moon.distance_from_city_tpl":"كم من {city}"
"moon.mc_title":"تغيّر إضاءة القمر من الأمس إلى اليوم"
"moon.mc_status_tomorrow":"تحدث ذروة {nextPhaseIcon} {nextPhaseName} غدًا."
"moon.mc_status_today":"تحدث ذروة {nextPhaseIcon} {nextPhaseName} اليوم."
```

### 5.5 EN unchanged (sample)

```
"moon.phase_first_quarter":"First Quarter"
"moon.zodiac_label":"Astronomical Constellation"
"moon.distance":"Distance to Moon"
"moon.mc_title":"Moon evolution — yesterday to today"
"moon.mc_status_tomorrow":"Tomorrow the Moon reaches {nextPhaseIcon} {nextPhaseName}."
```

### 5.6 JS edits confirmed at source

```
js/app.js:16826  if (_nfEl) _nfEl.textContent = `${nextFull.getDate()} ${months[nextFull.getMonth()]} ${nextFull.getFullYear()}`;
js/app.js:16863  const _subTpl = ... t('moon.distance_from_city_tpl', { city: _refName }) ...;
js/app.js:19524  _dValue.dir = 'ltr';
```

---

## 6. Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| 1 | "التربيع الأول" replaces "تربيع أول" on AR pages | ✅ PASS |
| 2 | "موقع القمر فلكيًا" replaces "الكوكبة الفلكية" on AR pages | ✅ PASS |
| 3 | "المسافة إلى القمر" replaces "المسافة للقمر" on AR pages | ✅ PASS |
| 4 | "كم من موقعك" NOT shown on /moon-today; shows "كم من مكة المكرمة" instead | ✅ PASS (JS override) |
| 5 | /moon-in-{city} shows "كم من {city}" instead of "كم من موقعك" | ✅ PASS (JS override) |
| 6 | Next full/new moon dates include year (e.g. "31 مايو 2026") | ✅ PASS |
| 7 | Comparison title is "تغيّر إضاءة القمر من الأمس إلى اليوم" | ✅ PASS |
| 8 | Delta shows "+10.9%" (sign on left) instead of "10.9%+" | ✅ PASS (`dir="ltr"`) |
| 9 | "غدًا يبلغ القمر طور X" replaced with "تحدث ذروة X غدًا" | ✅ PASS |
| 10 | All numeric values unchanged (illum / age / distance / delta) | ✅ PASS |
| 11 | MoonCalc unchanged | ✅ PASS |
| 12 | /moon-in-{city} city-local-noon logic unchanged | ✅ PASS |
| 13 | /moon-today Mecca canonical reference unchanged | ✅ PASS |
| 14 | SEO / canonical / hreflang / JSON-LD / sitemap unchanged | ✅ PASS |
| 15 | CSS / layout / design unchanged | ✅ PASS |
| 16 | Other 9 langs untouched | ✅ PASS |

**16 / 16 PASS.**

---

## 7. What this phase does NOT do

- 🚫 Does NOT change MoonCalc.
- 🚫 Does NOT change moon-chart.
- 🚫 Does NOT change Hijri / Umm al-Qura.
- 🚫 Does NOT change illumination, age, distance, or delta numeric values.
- 🚫 Does NOT change Mecca canonical instant for /moon-today.
- 🚫 Does NOT change city-local-noon for /moon-in-{city}.
- 🚫 Does NOT change SEO / canonical / hreflang / JSON-LD / sitemap.
- 🚫 Does NOT change CSS / layout / colors / design.
- 🚫 Does NOT change phase abbreviations under the comparison progress bar (kept as short visual labels per user request).
- 🚫 Does NOT touch the 9 non-AR i18n bundles.
- 🚫 Does NOT start a general UI polish phase.

---

## 8. Verdict

✅ **AR copy refined across the moon main card AND the moon comparison section. All numeric values, calculations, design, and other 9 languages preserved exactly. 16/16 acceptance criteria pass.**

🛑 No new phase started. Next chapter awaits explicit user direction.
