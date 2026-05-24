# MOON-DATED-PAGE-DATE-AWARE-COPY-CLEANUP-1 (Phases B+C+D combined) — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** `/moon-in-{city}/{YYYY-MM-DD}` date pages only.
**Lang scope this commit:** **All 10 langs** for FAQ Q+A (ar/en/fr/tr/ur/de/id/es/bn/ms). AR-only for `_SEO_LINE` and `_DATE_EDU_BY_LANG` (per user's AR-only spec for those sub-tasks).
**Cache-buster:** `js/app.js?v=695 → v=696`.

---

## 1 — Why a combined commit

Three sibling tasks all on the same date-page hero/FAQ region all share one theme: **stop using "اليوم" wording on date pages because the displayed date is NOT today**. Bundling them into one commit gives the user a single push approval cycle.

(Phase A — the trivial 1-line `وطور` title tweak — landed separately as `29429a6` so it can be reviewed/reverted in isolation.)

---

## 2 — Phase B: MOON-DATED-PAGE-FAQ-DATE-WORDING-1

### Problem
Date-page FAQ (`#moon-faq-city`) on `/moon-in-{city}/{YYYY-MM-DD}` showed today-oriented Q+A wording ("ما طور القمر اليوم في جدة؟") even when the displayed date wasn't today. Root cause: two parallel fillers — a date-aware override at `js/app.js:17848` ran FIRST, then the today-oriented `_setAnswer` block at `js/app.js:19129` ran SECOND and overwrote with `moon.faq.tpl_dq*` i18n templates (which use "اليوم").

### Fix (all 10 langs)
1. **Refined `_DATE_FAQ_AR`** (~line 17848) to match user spec exactly — Q+A reworded:
   - All 6 Qs (phase / illumination / age / moonrise / moonset / distance) now use `يوم ${_DT}` wording instead of "اليوم".
   - Q8 reframed for **distance** (was misaligned for full/new moon).
2. **Refined `_DATE_FAQ_EN`** with matching English wording.
3. **Added 8 new `_DATE_FAQ_*` arrays** for fr / tr / ur / de / id / es / bn / ms — each is a full 6-Q+A localization mirroring the AR/EN pattern with `${_cityName}` + `${_DT}` interpolation. Each lang uses native phrasing: French "le {date}", German "am {date}", Indonesian "pada {date}", Bengali "{date} তারিখে", etc.
4. **Replaced the AR/EN-only dispatcher** with a 10-key `_DATE_FAQ_MAP`:
   ```js
   const _DATE_FAQ_MAP = {
       ar: _DATE_FAQ_AR, en: _DATE_FAQ_EN,
       fr: _DATE_FAQ_FR, tr: _DATE_FAQ_TR, ur: _DATE_FAQ_UR,
       de: _DATE_FAQ_DE, id: _DATE_FAQ_ID, es: _DATE_FAQ_ES,
       bn: _DATE_FAQ_BN, ms: _DATE_FAQ_MS
   };
   const _DATE_FAQ = _DATE_FAQ_MAP[_lng_] || _DATE_FAQ_EN;
   ```
   Falls back to EN for any future unrecognized lang (defensive).
5. **Added date-page gate** to the today-oriented `_setAnswer` block (~line 19129-19189):
   - Wrapped `_cityFaqH2` H2 setter + all 6 question-fillers + all answer-fillers in `if (!_isDatePage) { ... }`.
   - On `/moon-today` and `/moon-today-in-{city}`: still fires normally (these ARE today-oriented).
   - On `/moon-in-{city}/{YYYY-MM-DD}` in ALL 10 langs: skipped → date-aware override at line 17848 wins → no "اليوم" leak in any language.

### FAQPage JSON-LD
SSR JSON-LD for date pages is generated server-side at `_MOON_DATE_FAQ_BY_LANG` (server.js line ~10609+) and was NOT touched in this commit — that block already has 10-lang date-aware wording from a prior Phase D3.1b pass. The visible-DOM ↔ JSON-LD pact: visible Q/A now match JSON-LD Q/A in all 10 langs.

---

## 3 — Phase C: MOON-DATED-PAGE-SEO-LINE-CITY-AWARE-1

### Problem
The short SEO line just before the FAQ (`#moon-date-seo-line`) used generic "توقيت المدينة المحلّيّ" without naming the city.

### Fix
**AR rewritten** (line 17891) with explicit `${_cityName}` interpolation:

- **Before:** `توضّح هذه الصفحة حالة القمر في هذا التاريخ المحدّد حسب توقيت المدينة المحلّيّ، وقد تَختلف أوقات الشروق والغروب بين المدن.`
- **After:** `توضّح هذه الصفحة حالة القمر في ${_cityName} لهذا التاريخ المحدّد، مع حساب مَواعيد الشروق والغروب حسب توقيت ${_cityName} المحلّيّ، وقد تَختلف هذه المَواعيد من مدينة إلى أخرى.`

Example: `توضّح هذه الصفحة حالة القمر في جدة لهذا التاريخ المحدّد، مع حساب مَواعيد الشروق والغروب حسب توقيت جدة المحلّيّ، وقد تَختلف هذه المَواعيد من مدينة إلى أخرى.`

### Lang coverage
- **AR:** fully city-aware.
- **Other 9 langs (en/fr/tr/ur/de/id/es/bn/ms):** unchanged — already convey local-time context with city implicit in their existing wording. User provided AR-only spec for this sub-task. Deferred to follow-up if user requests parallel polish.

---

## 4 — Phase D: MOON-DATED-PAGE-HIJRI-EDU-RESTRUCTURE-1

### Problem
The `#moon-date-edu-hijri` section title was generic (date only). User wanted it to include city, and the AR prose rewritten to be lighter, with clearer separation between:
- Calendar tie (Hijri-month structure)
- Calculation method (Jean Meeus + what's computed)
- Local-time disclaimer
- Explicit "Hijri start may vary by local sighting jurisprudence"

### Fix
**AR-only this commit** (line 17925-17929 in `_DATE_EDU_BY_LANG.ar`):

- **Title:** was `التاريخ الهجريّ ورؤية الهلال في ${_D}` → now `التاريخ الهجريّ ورؤية الهلال في ${_Cd} يوم ${_D}` (city + date).
- **p1:** rewritten to start with the Hijri-calendar tie + place "في هذا التاريخ، توافق حالة القمر في {city} يوم {date}...".
- **p2:** Jean Meeus calculation method + explicit "بداية الشهر الهجريّ رسميًّا فقد تَختلف من بلد إلى آخر حسب الرؤية الشرعيّة المحلّيّة" disclaimer.
- **p3:** Local-time disclaimer (شروق/غروب/رؤية الهلال) clearer.

### Lang coverage
- **AR:** fully rewritten per user spec.
- **Other 9 langs (en/fr/tr/ur/de/id/es/bn/ms):** unchanged — the existing en→fr→tr etc. translations still use date-only title and similar 3-paragraph structure (no "اليوم" wording — Phase B was the high-priority i18n cleanup, Phase D AR polish is enhancement). Deferred to follow-up if user requests parallel polish.

---

## 5 — Verification (live SSR port 8080)

### A. 10-lang FAQ Q1 marker presence in served JS

| Lang | Marker | Count |
|---|---|---|
| ar | `ما طور القمر في` | 1 ✓ |
| en | `What was the moon phase in` | 1 ✓ |
| fr | `Quelle était la phase de la Lune` | 1 ✓ |
| tr | `tarihinde Ay evresi neydi` | 1 ✓ |
| ur | `کو چاند کا طور کیا تھا` | 1 ✓ |
| de | `Welche Mondphase war in` | 1 ✓ |
| id | `Apa fase Bulan di` | 1 ✓ |
| es | `Cuál era la fase lunar en` | 1 ✓ |
| bn | `চাঁদের দশা কী ছিল` | 1 ✓ |
| ms | `Apakah fasa Bulan di` | 1 ✓ |

All 10 langs have their own date-aware FAQ array shipped in `js/app.js?v=696`. NO Arabic-template fallback for non-AR langs.

### B. Other checks

| Test | Status |
|---|---|
| `_smoke_hijri_stage_b1_unit` | 68/68 ✓ |
| `node --check js/app.js` | OK ✓ |
| `/moon-in-riyadh/1447-12-06` (strict route policy) | 404 ✓ |

---

## 6 — What was NOT changed

| Item | Touched? |
|---|---|
| MoonCalc / Umm al-Qura / calculations | NO |
| canonical / hreflang / sitemap | NO |
| Strict Gregorian route policy | NO |
| Page H1 / breadcrumbs / URL / route policy | NO |
| `/moon-today` and `/moon-today-in-{city}` FAQ behavior | NO — date-page gate only |
| `_setAnswer` answer-fillers when used on non-date pages | NO — gate is `if (!_isDatePage)` |
| `_SEO_LINE` for 9 non-AR langs | NO — user spec was AR-only |
| `_DATE_EDU_BY_LANG` for 9 non-AR langs | NO — user spec was AR-only |
| SSR JSON-LD `_MOON_DATE_FAQ_BY_LANG` (server.js) | NO — already 10-lang date-aware |
| Other UI sections | NO |

---

## 7 — Files changed

| File | Change |
|---|---|
| `js/app.js` | +~205 / −20 — AR + EN `_DATE_FAQ_*` reworded; NEW `_DATE_FAQ_FR/TR/UR/DE/ID/ES/BN/MS` arrays (8 × 12 entries = 96 new Q+A lines); dispatcher map; date-page gate on `_setAnswer` block; AR `_SEO_LINE` city-aware; AR `_DATE_EDU_BY_LANG.ar` title+p1/p2/p3 rewritten |
| `index.html` | +2 / −2 — `js/app.js?v=695 → v=696` |
| `reports/moon-dated-page-date-aware-copy-cleanup-1-closure.md` | NEW |

---

## 8 — Closure checklist

- [x] AR `_DATE_FAQ_AR` Q+A reworded per user spec (6 questions, no "اليوم").
- [x] EN `_DATE_FAQ_EN` parallel rewording.
- [x] **8 new `_DATE_FAQ_*` arrays added** for fr/tr/ur/de/id/es/bn/ms — full date-aware coverage, no Arabic-template fallback in any non-AR lang.
- [x] **Dispatcher map** routes by lang with EN fallback for unknown langs.
- [x] Date-page gate added to `_setAnswer` FAQ block (prevents today-oriented overwrite in all 10 langs).
- [x] AR `_SEO_LINE` includes `${_cityName}` interpolation per user spec.
- [x] AR `_DATE_EDU_BY_LANG.ar` title now includes city + date; p1/p2/p3 rewritten.
- [x] Hub + today-city FAQ behavior preserved (`/moon-today*` paths still fire `_setAnswer`).
- [x] Strict Gregorian route policy preserved.
- [x] canonical / hreflang / sitemap / JSON-LD schema type unchanged.
- [x] FAQPage JSON-LD ↔ visible DOM match preserved (server.js block was already 10-lang date-aware).
- [x] Carry-forward smoke 68/68.
- [x] `node --check js/app.js` OK.
- [x] Cache-buster bumped.
- [x] **No i18n regression** — every non-AR lang on `/moon-in-{city}/{YYYY-MM-DD}` now shows native date-aware Q+A wording, NOT Arabic template fallback.
- [x] Closure report written.
