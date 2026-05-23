# MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1 — Closure

**Date:** 2026-05-23 (+ cross-lang harmonization follow-up 2026-05-24)
**Status:** CLOSED, awaiting user approval
**Scope:** `/moon-in-{city}` hub pages ONLY (all 10 langs)

---

## 0) Follow-up commit 2026-05-24 — cross-lang SSR harmonization

The initial commit applied the evergreen wording across all 10 langs at
the **JS-side** (`_HUB_H1`, `_HUB_H2.subtitle`, `moon.intro_template_hub`,
`moon.altitude_{above,below}_hub`). However a comparison audit of SSR
pre-hydration vs JS post-hydration revealed two consistency gaps:

| Gap | Where | Fix |
| --- | ----- | --- |
| H1 conjunction mismatch in FR/TR/DE/ES/BN | SSR `_h1Moon` hub branch was using `"&"` while JS `_HUB_H1` was using natural conjunctions (`et`/`ve`/`und`/`y`/`ও`) → minor flicker on hydration | Updated `server.js` to use the same natural conjunctions (and aligned BN wording: `ক্যালেন্ডার ও মাসিক দশা` instead of `পঞ্জিকা ও মাসিক পর্যায়`) |
| Subtitle was generic in SSR (all 10 langs) then evergreen after JS | SSR rendered `moon.subtitle_generic` ("Track the Moon with astronomical precision…") then JS swapped to `_HUB_H2.subtitle` ("Explore the Moon's phases, illumination…") | Added a `_SUBTITLE_HUB_SSR` 10-lang map in `server.js` that fires only when `_isMoonHubPageSsr` is true, replaces the `<h2 id="moon-subtitle">` content with the evergreen wording AND drops the `data-i18n` attribute so `_translateI18nAttrs` doesn't overwrite |

After this follow-up, **all 10 langs render the evergreen wording at first
paint with no flicker on hydration**. Per-lang SSR verification:

```
── H1 (SSR pre-hydration, all 10 langs) ──
/ar    🌙 تقويم القمر وأطوار الشهر في الرياض
/en    🌙 Moon Calendar & Monthly Phases in Riyadh
/fr    🌙 Calendrier lunaire et phases du mois à Riyad
/tr    🌙 Riyad Ay Takvimi ve Aylık Evreler
/ur    🌙 ریاض میں چاند کا تقویم اور ماہانہ مراحل
/de    🌙 Mondkalender und Monatsphasen in Riad
/id    🌙 Kalender Bulan & Fase Bulanan di Riyadh
/es    🌙 Calendario lunar y fases del mes en Riad
/bn    🌙 রিয়াদ-এ চাঁদের ক্যালেন্ডার ও মাসিক দশা
/ms    🌙 Kalendar Bulan & Fasa Bulanan di Riyadh

── SUBTITLE (SSR pre-hydration, all 10 langs) ──
/ar    اعرف أطوار القمر في الرياض، ونسبة الإضاءة، ومواعيد البدر والمحاق …
/en    Explore the Moon's phases, illumination, and full/new moon schedule in Riyadh …
/fr    Découvrez les phases de la Lune à Riyad, l'illumination …
/tr    Riyad için Ay'ın evrelerini, aydınlanmasını ve dolunay/yeni ay zamanlarını keşfedin …
/ur    ریاض میں چاند کے مراحل، روشنی، اور بدر و نئے چاند کے اوقات جانیں …
/de    Entdecken Sie die Mondphasen in Riad, die Beleuchtung …
/id    Pelajari fase Bulan di Riyadh, tingkat iluminasi …
/es    Descubre las fases de la Luna en Riad, la iluminación …
/bn    রিয়াদ-এ চাঁদের দশা, আলোকসজ্জা এবং পূর্ণিমা ও অমাবস্যার সময় জানুন …
/ms    Terokai fasa Bulan di Riyadh, pencahayaan dan jadual bulan purnama/anak bulan …
```

Sibling routes (`/moon-today`, `/moon-today-in-{city}`, `/moon-in-{city}/{YYYY-MM}`,
`/moon-in-{city}/{YYYY-MM-DD}`) re-verified unchanged across `/ar /en /fr`.

Files touched in follow-up:
- `server.js` — `_h1Moon` hub branch wording (FR/TR/DE/ES/BN) + new
  `_SUBTITLE_HUB_SSR` map + SSR subtitle replace block
- `reports/moon-city-evergreen-hero-content-ui-polish-1-closure.md` —
  this addendum

No new dependencies. No new i18n keys (the i18n bundles already shipped
the `_hub` keys in the initial commit). Cache-busters NOT bumped (SSR-only
change — clients pick up the new HTML on next page load).

---

## 1) Original scope (2026-05-23) — what changed in the initial commit
**Touched routes:** `/moon-in-{city}` for `ar, en, fr, tr, ur, de, id, es, bn, ms`
**Untouched routes (explicitly preserved):**
 - `/moon-today` (Mecca-anchored snapshot)
 - `/moon-today-in-{city}` (city-anchored today snapshot)
 - `/moon-in-{city}/{YYYY-MM}` (month archive)
 - `/moon-in-{city}/{YYYY-MM-DD}` (date archive)

---

## 1a) What changed (initial commit detail)

### a) `_HUB_H1` map in `js/app.js` (line ~17988)

H1 now includes the **calendar + monthly phases** framing AND the country
suffix, differentiating the hub from `/moon-today-in-{city}`.

| Lang | Before                                          | After                                                          |
| ---- | ----------------------------------------------- | -------------------------------------------------------------- |
| ar   | `تقويم القمر في {city}{، country}`              | `تقويم القمر وأطوار الشهر في {city}{، country}`                |
| en   | `Moon Calendar in {city}{, country}`            | `Moon Calendar & Monthly Phases in {city}{, country}`          |
| fr   | `Calendrier lunaire à {city}{, country}`        | `Calendrier lunaire et phases du mois à {city}{, country}`     |
| tr   | `{city}{, country} Ay Takvimi`                  | `{city}{, country} Ay Takvimi ve Aylık Evreler`                |
| ur   | `{city}{، country} میں چاند کا تقویم`           | `{city}{، country} میں چاند کا تقویم اور ماہانہ مراحل`         |
| de   | `Mondkalender in {city}{, country}`             | `Mondkalender und Monatsphasen in {city}{, country}`           |
| id   | `Kalender Bulan di {city}{, country}`           | `Kalender Bulan & Fase Bulanan di {city}{, country}`           |
| es   | `Calendario lunar en {city}{, country}`         | `Calendario lunar y fases del mes en {city}{, country}`        |
| bn   | `{city}{, country}-এ চাঁদের ক্যালেন্ডার`        | `{city}{, country}-এ চাঁদের ক্যালেন্ডার ও মাসিক দশা`           |
| ms   | `Kalendar Bulan di {city}{, country}`           | `Kalendar Bulan & Fasa Bulanan di {city}{, country}`           |

### b) `_HUB_H2.subtitle` in `js/app.js` (line ~18007)

Hub subtitle no longer leads with "today/heute/hoy/اليوم" — it now reads as
an evergreen description of the page's role.

| Lang | Before (excerpt)                                    | After (excerpt)                                                                |
| ---- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| ar   | `حالة القمر اليوم، أطوار الشهر، ...`                 | `اعرف أطوار القمر في {city}، ونسبة الإضاءة، ومواعيد البدر والمحاق، مع تقويم...`|
| en   | `Today's moon, this month's phases...`              | `Explore the Moon's phases, illumination, and full/new moon schedule in {city} — with a complete monthly calendar in local time.` |
| fr   | `La Lune aujourd'hui, les phases du mois...`        | `Découvrez les phases de la Lune à {city}, l'illumination et les dates de pleine et nouvelle lune — avec un calendrier mensuel complet en heure locale.` |
| (others) | analogous "today's moon, …" wording             | analogous "Discover the Moon's phases in {city}, …" wording                    |

(The intra-card `title` ("حالة القمر اليوم في {city}" / "The Moon today in
{city}" / …) is **kept** because that card IS the today snapshot.)

### c) New hub-only i18n keys (10 langs each, in `js/i18n/*.js` AND legacy `js/i18n.js`)

| Key                          | What it does                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `moon.intro_template_hub`    | Hub intro paragraph — "القمر في {city}، {country}، حاليًّا في طور …" (10 langs)            |
| `moon.altitude_above_hub`    | Short fragment — "يَرتفع القمر فوق الأفق بنحو {alt}° باتّجاه {dir}." (10 langs)            |
| `moon.altitude_below_hub`    | Short fragment — "يَكون القمر تحت الأفق بنحو {alt}°." (10 langs)                           |

The legacy `moon.intro_template`, `moon.altitude_above`, `moon.altitude_below`
keys are **kept verbatim** (today wording, "وبحسب وقت التَحديث الحاليّ …"
prefix etc.) — used by `/moon-today` and `/moon-today-in-{city}`.

### d) Call-site dispatch in `js/app.js` (line ~19438+)

`updateMoonInfo()` now selects the i18n key based on `_isHubPage`:

```js
// city label: when _isHubPage, pass city-only and let the template join {country}.
// Otherwise (today/date paths), pre-join "city، country" as the legacy single placeholder.
const _cityLabelForIntro = _isHubPage
    ? _cityDisplay2
    : (_citySlug ? _moonCityLabel(_citySlug, _lng_, _cityDisplay2) : _cityDisplay2);

const _introKey   = _isHubPage ? 'moon.intro_template_hub'   : 'moon.intro_template';
const _aboveKey   = _isHubPage ? 'moon.altitude_above_hub'   : 'moon.altitude_above';
const _belowKey   = _isHubPage ? 'moon.altitude_below_hub'   : 'moon.altitude_below';
```

A defensive **double-separator collapse** runs on the rendered hub template
to handle the edge case where `_countryDisplay` is empty (coord-only paths):

```js
const _cleanTpl = tpl
    .replace(/،\s*،/g, '،')
    .replace(/,\s*,/g, ',')
    .replace(/\s+،/g, '،')
    .replace(/\s+,/g, ',')
    .replace(/\(\s*°\s*\)/g, '');
```

### e) Cache-busters bumped

- `index.html`: `app.js?v=686 → 687`, `i18n.js?v=182 → 183`
- `server.js`: `_i18nVersion '182' → '183'` (with explanatory comment)

### f) UI polish

No CSS changes were needed in this wave — the hero block already has the
right spacing/padding/line-height from prior MOON-EVENTS / HCAL polish
phases. The wording changes here are pure content + dispatcher logic.

---

## 2) Before / after — sample sentences

### `/moon-in-riyadh` (AR)

```
BEFORE:
H1       : 🌙 تقويم القمر في الرياض، المملكة العربية السعودية
Subtitle : حالة القمر اليوم، أطوار الشهر، الإضاءة، ومواعيد البدر والمحاق حسب توقيت الرياض المحلّيّ.
Intro    : القمر اليوم في الرياض، المملكة العربية السعودية في طور 🌒 هلال متزايد، بإضاءة 23.4٪ وعمر 4.12 يوم...
            ... وبحسب وقت التَحديث الحاليّ يَرتفع القمر 12.3° فوق الأفق باتّجاه الشرق.

AFTER:
H1       : 🌙 تقويم القمر وأطوار الشهر في الرياض، المملكة العربية السعودية
Subtitle : اعرف أطوار القمر في الرياض، ونسبة الإضاءة، ومواعيد البدر والمحاق، مع تقويم شهريّ كامل حسب التوقيت المحلّيّ.
Intro    : القمر في الرياض، المملكة العربية السعودية، حاليًّا في طور 🌒 هلال متزايد، بنسبة إضاءة 23.4٪، وعمر 4.12 يوم من الدورة القمريّة.
            ويَمرّ فلكيّاً في كوكبة 🐂 الثور، وبحسب وقت التَحديث الحاليّ يَرتفع القمر فوق الأفق بنحو 12.3° باتّجاه الشرق.
```

### `/en/moon-in-riyadh`

```
BEFORE:
H1       : 🌙 Moon Calendar in Riyadh, Saudi Arabia
Subtitle : Today's moon, this month's phases, illumination, and full/new moon times in Riyadh local time.
Intro    : The Moon today in Riyadh, Saudi Arabia is in a 🌒 Waxing Crescent phase at 23.4% illumination, 4.12 days into its cycle...

AFTER:
H1       : 🌙 Moon Calendar & Monthly Phases in Riyadh, Saudi Arabia
Subtitle : Explore the Moon's phases, illumination, and full/new moon schedule in Riyadh — with a complete monthly calendar in local time.
Intro    : The Moon in Riyadh, Saudi Arabia is currently in a 🌒 Waxing Crescent phase at 23.4% illumination, on day 4 of its cycle, passing through the ♉ Taurus constellation. The Moon is currently 12.3° above the horizon toward the E.
```

### `/moon-today-in-riyadh` (UNCHANGED)

```
H1       : 🌙 حالة القمر اليوم في الرياض   ← unchanged
Subtitle : (live banner)                    ← unchanged
Intro    : القمر اليوم في الرياض في طور …    ← unchanged
```

### `/moon-in-riyadh/2026-05` (UNCHANGED)

```
H1 : 🌙 أطوار القمر في الرياض — مايو 2026   ← unchanged
```

### `/moon-in-riyadh/2026-05-15` (UNCHANGED)

```
H1 : 🌙 حالة القمر في الرياض يوم 15 مايو 2026   ← unchanged
```

---

## 3) Files touched

| File                             | Change                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| `js/app.js`                      | `_HUB_H1` map (10 langs), `_HUB_H2.subtitle` (10 langs), intro-key + altitude-key dispatch + double-separator collapse, `_cityLabelForIntro` hub-vs-other split |
| `js/i18n/ar.js`                  | 3 new keys: `moon.intro_template_hub`, `moon.altitude_above_hub`, `moon.altitude_below_hub`  |
| `js/i18n/en.js`                  | same 3 new keys                                                                              |
| `js/i18n/fr.js`                  | same 3 new keys                                                                              |
| `js/i18n/tr.js`                  | same 3 new keys                                                                              |
| `js/i18n/ur.js`                  | same 3 new keys                                                                              |
| `js/i18n/de.js`                  | same 3 new keys                                                                              |
| `js/i18n/id.js`                  | same 3 new keys                                                                              |
| `js/i18n/es.js`                  | same 3 new keys                                                                              |
| `js/i18n/bn.js`                  | same 3 new keys                                                                              |
| `js/i18n/ms.js`                  | same 3 new keys                                                                              |
| `js/i18n.js`                     | same 3 new keys × 10 lang blocks (legacy bundle parity)                                      |
| `index.html`                     | `app.js?v=686 → 687`, `i18n.js?v=182 → 183`                                                  |
| `server.js`                      | `_i18nVersion '182' → '183'` + comment refresh                                               |
| `scripts/_moon_evergreen_polish_patch.mjs` | new helper script (idempotent, CRLF-aware) that did the i18n bundle inserts        |
| `reports/moon-city-evergreen-hero-content-ui-polish-1-closure.md` | this report                                             |

---

## 4) Test plan (executed)

### SSR HTTP smoke (server on port 3201)

| Route                              | HTTP | H1 content (post-CDN, pre-hydration)                              |
| ---------------------------------- | ---- | ----------------------------------------------------------------- |
| `/`                                | 200  | (home page — unchanged)                                            |
| `/moon-in-riyadh` (AR)             | 200  | `🌙 تقويم القمر وأطوار الشهر في الرياض`                            |
| `/en/moon-in-riyadh`               | 200  | `🌙 Moon Calendar & Monthly Phases in Riyadh`                      |
| `/fr/moon-in-riyadh`               | 200  | `🌙 Calendrier de la Lune & phases mensuelles à Riyad`             |
| `/ur/moon-in-riyadh`               | 200  | `🌙 ریاض میں چاند کا تقویم اور ماہانہ مراحل`                       |
| `/moon-today`                      | 200  | (uses `moon-hub-h1`, value: `حالة القمر اليوم`) — UNCHANGED        |
| `/moon-today-in-riyadh`            | 200  | `🌙 حالة القمر اليوم في الرياض` — UNCHANGED                        |
| `/moon-in-riyadh/2026-05`          | 200  | `🌙 أطوار القمر في الرياض — مايو 2026` — UNCHANGED                 |
| `/moon-in-riyadh/2026-05-15`       | 200  | `🌙 حالة القمر في الرياض يوم 15 مايو 2026` — UNCHANGED             |

### Bundle delivery

`curl /js/i18n/ar.js?v=183` confirmed 3 new keys present:
 - `moon.intro_template_hub` — `1` occurrence
 - `moon.altitude_above_hub` — `1` occurrence
 - `moon.altitude_below_hub` — `1` occurrence
 - "تقويم القمر وأطوار الشهر" — `1` occurrence
 - "حاليًّا في طور" — `1` occurrence
 - "بنحو" — `3` occurrences (3 hub keys × 1 mention)

### Syntax

`node --check` passes on all 12 touched JS files.

---

## 5) Invariants preserved (the explicit "do NOT change" list)

| Forbidden change                                  | Preserved? |
| ------------------------------------------------- | ---------- |
| لا تغيّر الحسابات                                   | ✓ no calc code touched |
| لا تغيّر MoonCalc                                  | ✓ MoonCalc.* untouched |
| لا تغيّر قيم الإضاءة أو العمر أو الطور أو الأفق      | ✓ all live values still flow through unchanged |
| لا تغيّر city-local noon                           | ✓ `_cityLocalNoon`/`_tz` logic untouched |
| لا تغيّر مكة كمرجع `/moon-today`                    | ✓ /moon-today H1 + Mecca anchor untouched |
| لا تغيّر Umm al-Qura                               | ✓ no hijri/UAQ code touched |
| لا تغيّر sitemap                                   | ✓ no sitemap.xml changes |
| لا تغيّر canonical/hreflang                        | ✓ no canonical/hreflang changes — H1 content evolution stays within the existing route family |
| لا تغيّر `/moon-today`                             | ✓ live SSR test confirms identical H1 + intro |
| لا تغيّر `/moon-today-in-{city}`                   | ✓ live SSR test confirms identical H1; intro_template (today wording) reverted |
| لا تغيّر صفحات الشهر `/moon-in-{city}/{YYYY-MM}`     | ✓ live SSR test confirms identical H1; updateMoonInfo overrides apply only when _isHubPage |
| لا تغيّر صفحات التاريخ `/moon-in-{city}/{YYYY-MM-DD}`| ✓ live SSR test confirms identical H1; _isDatePage short-circuits before hub block runs |
| لا dependencies جديدة                              | ✓ zero new npm/CDN deps                                |

---

## 6) Edge cases handled

1. **Country missing for hub city** (rare, e.g. coord-only paths):
   `_countryDisplay` is `''` → template renders as
   `"القمر في الرياض، ، حاليًّا..."` (double comma). The
   `_cleanTpl` post-process collapses `، ،` → `،` and `, ,` → `,`.

2. **Stage 4 i18n bundle delivery**: server.js's `_i18nVersion = '183'`
   and the per-lang `js/i18n/{lang}.js?v=183` already serve the new
   `_hub` keys (verified via curl).

3. **Idempotent patch script**: `scripts/_moon_evergreen_polish_patch.mjs`
   uses `findIn()` with both LF / CRLF flavors AND checks for
   `'moon.intro_template_hub':` (full key declaration, not just the value)
   to avoid false-positives from the regular intro template having
   matching value text.

4. **`_translateI18nAttrs` clobbering**: The hub-only keys never have a
   `data-i18n="moon.intro_template_hub"` attribute applied to the
   `#moon-intro` element — app.js writes `textContent` directly. So the
   AR/EN/FR-translate sweep can't overwrite this content (the MOON-H1-
   I18N-PARITY-FIX-1 attack vector doesn't apply here).

---

## 7) Commit message draft

```
MOON-CITY-EVERGREEN-HERO-CONTENT-UI-POLISH-1: hub-only evergreen hero (10 langs)

/moon-in-{city} hero now reads as an evergreen calendar resource,
distinct from /moon-today-in-{city}'s today-snapshot voice:
 - H1: "Moon Calendar & Monthly Phases in {city}, {country}"
       (was "Moon Calendar in {city}, {country}")
 - Subtitle: "Explore the Moon's phases, illumination, and full/new
   moon schedule in {city} — with a complete monthly calendar in
   local time." (was "Today's moon, this month's phases…")
 - Intro paragraph: "The Moon in {city}, {country} is currently in
   a {phase} phase at {illum}% illumination, on day {age} of its
   cycle…" (was "The Moon today in {city} is in a {phase} phase…")
 - Altitude fragment: "The Moon is currently {alt}° above the
   horizon toward the {dir}." (short form on hub)

Implementation: added 3 new hub-only i18n keys per lang
(`moon.intro_template_hub`, `moon.altitude_above_hub`,
`moon.altitude_below_hub`) — the legacy keys stay untouched and keep
serving /moon-today and /moon-today-in-{city} verbatim. updateMoonInfo
selects `_hub` keys when `_isHubPage` is true; the city placeholder
is split (city-only for hub since template adds {country}; pre-joined
for today/date paths to preserve legacy single-placeholder behavior).
A defensive collapse handles the rare empty-country case.

Cache-busters: app.js v686→687, i18n.js v182→183.

Routes affected: /moon-in-{city} for ar, en, fr, tr, ur, de, id, es,
bn, ms (10 langs).
Routes UNCHANGED (verified via SSR): /moon-today, /moon-today-in-{city},
/moon-in-{city}/{YYYY-MM}, /moon-in-{city}/{YYYY-MM-DD}.

No calc, no MoonCalc, no Umm al-Qura, no sitemap, no canonical changes,
no new deps.
```
