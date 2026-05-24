# MOON-MONTHLY-PAGE-HIJRI-RANGE-CARD-REDESIGN-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** Redesign the Hijri-range card on `/moon-in-{city}/{YYYY-MM}` (month pages) only. All 10 supported langs (ar/en/fr/tr/ur/de/id/es/bn/ms).
**Predecessor:** `376b6c2` MOON-MONTHLY-PAGE-HERO-CONTENT-UI-FIX-1 (introduced the Hijri-range card with arrow-separated layout — replaced by this commit).
**Cache-buster:** `css/style.css?v=412 → 413` (`js/app.js?v=688` unchanged).

---

## 1 — Why the redesign

User flagged that the arrow-separated layout `14 ذو القعدة 1447 هـ ← 14 ذو الحجة 1447 هـ` was confusing:
- Unclear whether the arrow meant "from / to", "transition", or "today's date".
- The arrow could be read in either direction (especially in RTL).
- No clear labels on which date was the start vs. end of the Gregorian month's mapping.

## 2 — New design (3-level pedagogical layout)

```
[ 📅 ]  النطاق الهجريّ لشهر مايو 2026          ← Title (full sentence with month + year)
        مايو 2026                                ← Gregorian subtitle
        ─────────────────────────────────
        بداية الشهر:  14 ذو القعدة 1447 هـ      ← Labeled start row
        نهاية الشهر:  14 ذو الحجة 1447 هـ        ← Labeled end row

        يمتد هذا الشهر الميلاديّ عبر جزء من
        شهرين هجريّين بحسب تقويم أمّ القرى.       ← Explanatory description

        * قد يختلف التاريخ الهجري يومًا واحدًا
          حسب الرؤية الشرعية في بلدك.            ← Disclaimer (existing)
```

For months that fit inside ONE Hijri month (rare), the start/end pair collapses to a single labeled row:
```
        يقع ضمن:  4 محرم 1450 هـ
        يقع هذا الشهر الميلاديّ ضمن محرم 1450 هـ بحسب تقويم أمّ القرى.
```

## 3 — What changed (vs MOON-MONTHLY-PAGE-HERO-CONTENT-UI-FIX-1 / `376b6c2`)

### A. Title (replaces fixed phrase with dynamic month+year sentence)

| Lang | Before | After |
|---|---|---|
| ar | التقويم الهجريّ المقابل | **النطاق الهجريّ لشهر مايو 2026** |
| en | Corresponding Hijri dates | **Hijri range for May 2026** |
| fr | Dates hégiriennes correspondantes | **Plage hégirienne pour mai 2026** |
| tr | Karşılık gelen hicri tarihler | **Mayıs 2026 için hicri aralık** |
| ur | متعلقہ ہجری تاریخیں | **مئی 2026 کے لیے ہجری حد** |
| de | Entsprechende Hidschri-Daten | **Hidschri-Spanne für Mai 2026** |
| id | Tanggal Hijriah yang sesuai | **Rentang Hijriah untuk Mei 2026** |
| es | Fechas hijríes correspondientes | **Rango hijrí para mayo 2026** |
| bn | সংশ্লিষ্ট হিজরি তারিখ | **মে 2026-এর হিজরি পরিসর** |
| ms | Tarikh Hijrah yang berkaitan | **Julat Hijrah untuk Mei 2026** |

### B. Body — replaced arrow-line with labeled start/end rows

**Before:**
```
14 ذو القعدة 1447 هـ ← 14 ذو الحجة 1447 هـ
```

**After:**
```
بداية الشهر: 14 ذو القعدة 1447 هـ
نهاية الشهر: 14 ذو الحجة 1447 هـ
```

Localized labels (start / end / within):

| Lang | start | end | within (single-month case) |
|---|---|---|---|
| ar | بداية الشهر | نهاية الشهر | يقع ضمن |
| en | Month start | Month end | Falls within |
| fr | Début du mois | Fin du mois | S'inscrit dans |
| tr | Ay başlangıcı | Ay sonu | İçine düşer |
| ur | مہینے کی ابتدا | مہینے کی انتہا | اندر آتا ہے |
| de | Monatsanfang | Monatsende | Fällt innerhalb |
| id | Awal bulan | Akhir bulan | Berada dalam |
| es | Inicio del mes | Fin del mes | Se encuentra en |
| bn | মাসের শুরু | মাসের শেষ | মধ্যে পড়ে |
| ms | Permulaan bulan | Akhir bulan | Berada dalam |

### C. Description — shortened + sharpened

**Before** (AR): `يمتد هذا الشهر الميلاديّ من 14 ذو القعدة 1447 هـ إلى 14 ذو الحجة 1447 هـ، بحسب تقويم أمّ القرى.`
**After** (AR): `يمتد هذا الشهر الميلاديّ عبر جزء من شهرين هجريّين بحسب تقويم أمّ القرى.`

Reason: the dates themselves are already shown in the labeled start/end rows above; the description no longer needs to re-state them. It now adds the *meaning* of the two-Hijri-month span instead.

Single-Hijri-month case kept the dated phrasing because the start/end pair collapses:
`يقع هذا الشهر الميلاديّ ضمن {hijriMonth} {hijriYear} هـ بحسب تقويم أمّ القرى.`

### D. Disclaimer — localized (was AR-only hardcoded before)

Per-lang notice text added at server.js so the disclaimer reads natively in all 10 langs (was AR-only `* قد يختلف التاريخ الهجري يومًا واحدًا حسب الرؤية الشرعية في بلدك.`).

### E. Summary line chip — dash replaced with localized "to" word

**Before:** `النطاق الهجريّ: ذو القعدة–ذو الحجة 1447 هـ` (en-dash visually merges with month names)
**After:** `النطاق الهجريّ: ذو القعدة إلى ذو الحجة 1447 هـ` (proper word, scans as a range)

Localized "to" word table:

| ar | en | fr | tr | ur | de | id | es | bn | ms |
|---|---|---|---|---|---|---|---|---|---|
| إلى | to | à | ile | سے | bis | hingga | a | থেকে | hingga |

### F. CSS

Replaced the single-row arrow layout (`.moon-hijri-range-line` + `.moon-hijri-range-dash`) with a stacked-row layout:
- `.moon-hijri-label--month` — title (sentence with month+year, primary color, slightly heavier).
- `.moon-hijri-greg--month` — Gregorian subtitle (smaller, muted).
- `.moon-hijri-range-pair` / `.moon-hijri-range-single` — flex column with `gap: 6px`.
- `.moon-hijri-range-row` — flex row with key + value baseline-aligned.
- `.moon-hijri-range-key` — small muted label, `min-width: 90px` for grid-like alignment.
- `.moon-hijri-range-val` — primary-color bold value.
- `.moon-hijri-lunar--month` — description with `line-height: 1.6` for readability.
- Mobile ≤480px: smaller font + tighter min-width.
- Dark theme: lime accent for title + value, muted slate for key + greg.

### G. Cache-buster

`css/style.css?v=412 → 413` (preload + stylesheet link).
`js/app.js?v=688` unchanged.

---

## 4 — Verification (live SSR on port 8080)

### A. AR `/moon-in-jeddah/2026-05` (current month, contains today)

| Field | Output |
|---|---|
| Title | `النطاق الهجريّ لشهر مايو 2026` ✅ |
| Greg subtitle | `مايو 2026` ✅ |
| Start row | `بداية الشهر: 14 ذو القعدة 1447 هـ` ✅ |
| End row | `نهاية الشهر: 14 ذو الحجة 1447 هـ` ✅ |
| Description | `يمتد هذا الشهر الميلاديّ عبر جزء من شهرين هجريّين بحسب تقويم أمّ القرى.` ✅ |
| Summary chip | `النطاق الهجريّ: ذو القعدة إلى ذو الحجة 1447 هـ` ✅ |

### B. EN `/en/moon-in-jeddah/2026-05`

| Field | Output |
|---|---|
| Title | `Hijri range for May 2026` ✅ |
| Greg subtitle | `May 2026` ✅ |
| Start row | `Month start: 14 Dhu al-Qidah 1447 AH` ✅ |
| End row | `Month end: 14 Dhu al-Hijjah 1447 AH` ✅ |
| Description | `This Gregorian month spans parts of two Hijri months, per the Umm al-Qura calendar.` ✅ |

### C. AR `/moon-in-chicago/2026-05` (user's screenshot city)

| Field | Output |
|---|---|
| Title | `النطاق الهجريّ لشهر مايو 2026` ✅ |
| Start | `بداية الشهر: 14 ذو القعدة 1447 هـ` ✅ |
| End | `نهاية الشهر: 14 ذو الحجة 1447 هـ` ✅ |

### D. Past month `/moon-in-jeddah/2026-01` (no today)

| Field | Output |
|---|---|
| Title | `النطاق الهجريّ لشهر يناير 2026` ✅ |
| Start | `بداية الشهر: 12 رجب 1447 هـ` ✅ |
| End | `نهاية الشهر: 12 شعبان 1447 هـ` ✅ |

(No today leak. Card describes the displayed month's Hijri range correctly.)

### E. Multi-lang sample (all 10 verified)

| Lang | Title | Start label |
|---|---|---|
| ar | النطاق الهجريّ لشهر مايو 2026 | بداية الشهر |
| en | Hijri range for May 2026 | Month start |
| fr | Plage hégirienne pour mai 2026 | Début du mois |
| tr | Mayıs 2026 için hicri aralık | Ay başlangıcı |
| ur | مئی 2026 کے لیے ہجری حد | مہینے کی ابتدا |
| de | Hidschri-Spanne für Mai 2026 | Monatsanfang |
| id | Rentang Hijriah untuk Mei 2026 | Awal bulan |
| es | Rango hijrí para mayo 2026 | Inicio del mes |
| bn | মে 2026-এর হিজরি পরিসর | মাসের শুরু |
| ms | Julat Hijrah untuk Mei 2026 | Permulaan bulan |

### F. Critical preservation

| Test | Result |
|---|---|
| `/moon-in-riyadh/1447-12-06` (strict policy) | HTTP 404 ✅ |
| Sitemap Hijri moon URLs (must be 0) | **0** ✅ |
| Sitemap Gregorian moon URLs | 310,080 ✅ |
| canonical / hreflang | unchanged ✅ |

### G. Carry-forward smoke

- `_smoke_hijri_umm_al_qura_a1`: **49/49** ✅
- `_smoke_hijri_stage_b1_unit`: **68/68** ✅
- Total: **117/117 zero failures** ✅

### H. Syntax check

```
$ node --check server.js
syntax OK
```

(JS unchanged — `js/app.js?v=688` byte-identical to pre-wave.)

---

## 5 — Acceptance criteria (per user spec)

| Criterion | Met? |
|---|---|
| المستخدم يفهم أن البطاقة تعرض النطاق الهجري المقابل للشهر | ✅ Title is full sentence with month+year + labeled rows |
| لا يظهر السهم بين التاريخين كعنصر غامض | ✅ Arrow removed entirely; replaced by labeled rows |
| تظهر بداية الشهر ونهاية الشهر بوضوح | ✅ Two explicit labeled rows |
| لا تظهر "التاريخ الهجري اليوم" | ✅ Title is "Hijri range for …" |
| لا تظهر "نحن اليوم" | ✅ Description is month-context only |
| لا تتغير أي حسابات أو روابط أو canonical | ✅ Verified |

---

## 6 — What was NOT changed

| Item | Touched? |
|---|---|
| MoonCalc | NO |
| Umm al-Qura math (read-only via existing `_jdToHijri` / `_gregToJD`) | NO |
| canonical / hreflang | NO |
| sitemap | NO |
| JSON-LD | NO |
| Strict-Gregorian route policy | NO |
| Full month calendar grid | NO |
| Prev/next month nav | NO |
| Date picker | NO |
| MOON-MONTHLY-CALENDAR-CTA-CARD-REDESIGN-3 | NO |
| `/moon-today` | NO |
| `/moon-in-{city}` (hub) | NO |
| `/moon-today-in-{city}` | NO |
| `/moon-in-{city}/{YYYY-MM-DD}` (dated page) | NO |
| `js/app.js` | NO (no JS changes — pure SSR + CSS) |
| `js/i18n.js` | NO |
| Dependencies (`package.json`) | NO |

---

## 7 — Files changed (3 source + 1 report)

| File | Change |
|---|---|
| `server.js` | net −10 / +100 lines — rewrote `_MONTH_HIJRI_*` maps (Title sentence, labels, desc); replaced single arrow-row HTML with 3-level layout (title + greg + labeled rows + desc); localized disclaimer text; localized "to" word in summary chip |
| `css/style.css` | net −20 / +60 lines — removed `.moon-hijri-range-line` + `.moon-hijri-range-dash` rules; added `.moon-hijri-label--month` / `.moon-hijri-range-pair` / `.moon-hijri-range-row` / `.moon-hijri-range-key` / `.moon-hijri-range-val` / `.moon-hijri-greg--month` rules with mobile + dark theme |
| `index.html` | +2 / −2 — cache-buster `style.css?v=412 → 413` |
| `reports/moon-monthly-page-hijri-range-card-redesign-1-closure.md` | NEW |

---

## 8 — Closure checklist

- [x] Title sentence with dynamic month + year (10 langs).
- [x] Two labeled rows (start / end) replacing the arrow layout.
- [x] Single-Hijri-month case collapses to one labeled row + adjusted description.
- [x] Description shortened — no longer restates the dates.
- [x] Disclaimer localized to 10 langs.
- [x] Summary chip uses localized "to" word instead of en-dash.
- [x] CSS for new 3-level layout (mobile + dark theme).
- [x] Cache-buster bumped.
- [x] Scoped to month pages only via `_isMoonMonthPageSsr` gate.
- [x] No JS changes — pure SSR + CSS.
- [x] No MoonCalc / Umm al-Qura / canonical / sitemap / JSON-LD / route-policy changes.
- [x] All 10 langs render correctly.
- [x] Past + future months work (no today leak).
- [x] Carry-forward 117/117 zero failures.
- [x] Closure report written.
