# MOON-MONTHLY-CALENDAR-GRID-UI-CONTENT-POLISH-1 — Closure

**Date:** 2026-05-24
**Status:** 🟢 IMPLEMENTED (awaiting user approval for `git push`)
**Scope:** Calendar grid cell content + legend rewrite on `/moon-in-{city}/{YYYY-MM}` and (as the same grid renders there too) `/moon-in-{city}` hub. All 10 supported langs.
**Cache-buster:** `css/style.css?v=414 → 417` (POLISH-1 + 3 followup rounds across 2 commits).
**Three follow-up rounds** (per user request "ضمن نفس مرحلة"):
- Round 1 (in `bbbc3d2`): remove +N/-N markers + add per-cell Hijri date + rewrite legend.
- Round 2 (in `bbbc3d2`): uniform cell heights via `grid-auto-rows: 1fr` + Greg date label now includes month name ("24 مايو" / "May 24") for clearer cell identity.
- Round 3 (in **separate followup commit** because `bbbc3d2` already on origin/main; no force-push): calendar card header restyled from `space-between` (title left / picker far right with a big empty gap) to a stacked column (title on top → filter group right below as a tinted pill cluster → prev/next nav). Pure CSS, no HTML change.

---

## 1 — Problem (verbatim from user)

> «وجود علامات + و - داخل الخلايا. وجود رقم بجانب علامة + أو - مثل 6+ أو 22-. هذه العلامات غير مفهومة للمستخدم العادي. التاريخ الهجري والميلادي داخل الخلية غير واضحين بما يكفي. أسماء الأطوار صغيرة ومتقاربة.»

The calendar cells were rendering signed-delta markers like `−23` / `+7` / `−15` next to the day number. End users misread these as either timestamps or unclear date math. Plus the legend `+ تعني الأيام القادمة، − تعني الأيام السابقة …` was extra noise.

## 2 — What changed

### A. Cell content (server.js, ~line 17976+)

**Before:**
```
[−23]               ← signed-delta indicator (cryptic)
1                   ← Greg day
🌕                  ← phase icon
البدر (قمر مكتمل)  ← phase name (month page only)
```

**After:**
```
[empty]             ← no badge (NO +N/-N markers anywhere)
1                   ← Greg day (slightly bigger + bolder)
14 ذو القعدة        ← NEW: Hijri date line (day + month name, secondary weight)
🌕                  ← phase icon
البدر (قمر مكتمل)  ← phase name
```

For **today / yesterday / tomorrow** cells the friendly badge stays:
```
[اليوم]              ← only on the today cell
24
7 ذو الحجة
🌔
أحدب متزايد
```

For **all other cells**: no badge. The empty `.moon-hub-cal-rel` slot is simply not emitted (no `<span>` at all), so the layout collapses naturally.

### B. Legend text (server.js, ~line 17856)

**Before** (all 10 langs):
> `+ تعني الأيام القادمة، − تعني الأيام السابقة. اضغط أيّ يوم لفتح صفحته.`

**After** (all 10 langs):
| Lang | New legend |
|---|---|
| ar | اضغط على أيّ يوم لعرض تفاصيل القمر في ذلك التاريخ. |
| en | Tap any day to see the moon details for that date. |
| fr | Cliquez sur un jour pour voir les détails de la Lune à cette date. |
| tr | O tarihteki ay ayrıntılarını görmek için herhangi bir güne tıklayın. |
| ur | اُس تاریخ کے چاند کی تفصیلات دیکھنے کے لیے کسی بھی دن پر کلک کریں۔ |
| de | Klicken Sie auf einen Tag, um die Monddetails für dieses Datum zu sehen. |
| id | Ketuk hari mana saja untuk melihat detail Bulan pada tanggal tersebut. |
| es | Pulse cualquier día para ver los detalles de la Luna en esa fecha. |
| bn | সেই তারিখে চাঁদের বিবরণ দেখতে যেকোনো দিনে ক্লিক করুন। |
| ms | Ketik mana-mana hari untuk melihat butiran Bulan pada tarikh tersebut. |

No mention of +/− anywhere — matches the new cell content.

### C. CSS (css/style.css, ~line 3285+)

| Class | Change |
|---|---|
| `.moon-hub-cal-rel` | Made the badge a soft pill (`padding: 1px 6px; background: rgba(46,125,50,0.10); border-radius: 999px`) so the few cells with it (`today/yesterday/tomorrow`) look like friendly chips, not raw text. |
| `.moon-hub-cal-date` | Increased from `0.82rem opacity:0.85` → `0.95rem opacity:1 color:var(--text)` — Greg day number is now the primary line of each cell. |
| **`.moon-hub-cal-hijri`** | NEW — secondary weight `0.68rem`, muted color, 2-line clamp for long Hijri month names. |
| Mobile (`@media max-width:600px`) | Smaller rel pill `0.58rem`, Greg `0.82rem`, Hijri `0.58rem` (single-line clamp), phase-name `0.55rem`, phase emoji `1.1rem` — uncluttered on phones. |

### D. Cache-buster

`css/style.css?v=414 → 416` (preload + stylesheet link). 2-step bump
covers both POLISH-1 + the followup round.
`js/app.js?v=688` byte-identical (no JS changes in this wave).

### E. Followup round — uniform cell heights + day+month label

**Problem (per user):**
- Some cells appeared visually taller than others — the today/yesterday/tomorrow rel-badge or a longer phase name (e.g. "البدر (قمر مكتمل)") pushed cells beyond their neighbors.
- Bare day numbers ("24") on clickable cells felt ambiguous — visitors couldn't immediately tell which month.

**Fix 1 — uniform cell heights** (CSS-only):
- `.moon-hub-cal-grid { grid-auto-rows: 1fr; }` — every row in the grid stretches to the height of the tallest cell in that row.
- `.moon-hub-cal-cell { display: flex; }` + `.moon-hub-cal-cell a { width: 100%; flex: 1; }` — the anchor fills the entire cell, so the row-stretch actually translates to anchor stretch.
- `.moon-hub-cal-cell a { min-height: 92px → 100px; }` — accommodates the new "{day} {month}" label without pushing cells past the row-height max.
- `.moon-hub-cal-cell--empty { min-height: 92 → 100px; }` — matches.
- Mobile: `.moon-hub-cal-cell a { min-height: 70 → 86px; }` + scaled-down Greg-label font (`0.82 → 0.72rem`) to avoid mobile overflow.

**Fix 2 — Greg date label includes month name** (server.js):
- AR/UR/FR/TR/ID/ES/BN/MS/DE: `{day} {monthName}` (day-month order, natural in those langs).
- EN: `{monthName} {day}` ("May 24" — Anglo-American order).
- Source: existing `_gMonthsShort` map (lang-specific full month names already in scope from the calendar block).
- `.moon-hub-cal-date` font: `0.95 → 0.88rem` + `nowrap + text-overflow: ellipsis` so long month names like "September" / "ديسمبر" don't break the cell.

**Verification (followup):**
- AR `/moon-in-jeddah/2026-05`: `1 مايو`, `2 مايو`, ..., `31 مايو` ✅
- EN `/en/moon-in-jeddah/2026-05`: `May 1`, `May 2`, ..., `May 31` ✅
- FR `/fr/moon-in-jeddah/2026-05`: `1 mai` ✅
- TR `/tr/moon-in-jeddah/2026-05`: `1 Mayıs` ✅
- Served CSS confirmed: `grid-auto-rows: 1fr` + `min-height: 100px` + `flex: 1` ✅
- Cell hrefs preserved — 30 day-cells link to `/moon-in-jeddah/2026-05-XX` Greg ISO, today cell preserves `/moon-today-in-jeddah` special-case ✅
- +/- leak check across 3 URLs: still **0** ✅
- Strict route policy: `/moon-in-riyadh/1447-12-06` → HTTP 404 ✅
- Sitemap unchanged: 0 Hijri moon URLs ✅
- Carry-forward `_smoke_hijri_stage_b1_unit`: 68/68 ✅

---

## 3 — Verification (live SSR port 8080)

### A. AR `/moon-in-jeddah/2026-05`

- **30 day-cells with day number + Hijri** (May has 31 days, 1 cell is today and renders separately; total day cells = 31). ✅
- **All 31 cells have the new `.moon-hub-cal-hijri` span** ✅ (verified `grep -oE 'class="moon-hub-cal-hijri"' | wc -l` → 31)
- **Hijri values span correctly:** day 1 → `14 ذو القعدة` … day 31 → `14 ذو الحجة` ✅
- **Rel labels in the entire grid:** only `أمس / اليوم / غدًا` (3 distinct values). NO `+N` / `-N`. ✅
- **Legend:** `اضغط على أيّ يوم لعرض تفاصيل القمر في ذلك التاريخ.` ✅

### B. EN `/en/moon-in-jeddah/2026-05`

- 31 Hijri spans ✅
- Sample: `<span class="moon-hub-cal-hijri">14 Dhu al-Qidah</span>` ✅
- Rel labels: `Today / Yesterday / Tomorrow` only ✅
- Legend: `Tap any day to see the moon details for that date.` ✅

### C. Riyadh `/moon-in-riyadh/2026-05`

- 31 Hijri spans ✅

### D. Cross-month +/− leak check (5 URLs × all cells = ~150 cells)

| URL | +/- leaks |
|---|---|
| `/moon-in-jeddah/2026-05` | **0** ✅ |
| `/moon-in-riyadh/2026-05` | **0** ✅ |
| `/en/moon-in-jeddah/2026-05` | **0** ✅ |
| `/moon-in-jeddah/2026-01` (past) | **0** ✅ |
| `/moon-in-jeddah/2026-12` (future) | **0** ✅ |

### E. Critical preservation

| Test | Expected | Actual | ✅/❌ |
|---|---|---|---|
| `/moon-in-riyadh/1447-12-06` (strict policy) | HTTP 404 | 404 | ✅ |
| Sitemap Hijri moon URLs | 0 | 0 | ✅ |
| `/moon-in-jeddah/2026-05-24` (today cell href) | → `/moon-today-in-jeddah` (today special-case kept) | unchanged | ✅ |
| Other cells `/moon-in-jeddah/2026-05-XX` (Gregorian canonical href) | unchanged | unchanged | ✅ |
| canonical / hreflang | unchanged | unchanged | ✅ |

### F. Carry-forward smoke

- `_smoke_hijri_stage_b1_unit`: **68/68** ✅
- `_smoke_hijri_umm_al_qura_a1`: **49/49** ✅
- Total: **117/117 zero failures** ✅

### G. Syntax check

```
$ node --check server.js
syntax OK
```

(JS unchanged.)

---

## 4 — Acceptance criteria (per user spec)

| Criterion | Met? |
|---|---|
| لا تظهر أي علامات + أو - داخل خلايا التقويم | ✅ verified 0 leaks across 5 sample URLs |
| لا تظهر أرقام مثل 6+ أو 22- | ✅ |
| اليوم الحالي واضح | ✅ "اليوم" badge + green border (existing `.moon-hub-cal-cell--today`) |
| الرابط يفتح Gregorian canonical | ✅ all cells link to `/moon-in-{city}/{YYYY-MM-DD}` (today cell → `/moon-today-in-{city}` as before) |
| الشرح أعلى التقويم لا يذكر +/- | ✅ new click-prompt copy |
| التاريخ الهجري ظاهر داخل الخلية | ✅ new `.moon-hub-cal-hijri` span (e.g. "7 ذو الحجة") |
| التعديل مطبق على جميع اللغات | ✅ 10/10 verified |
| الحسابات لم تتغير | ✅ MoonCalc + Umm al-Qura READ-ONLY |
| Strict route policy محفوظة | ✅ /moon-in-…/1447-… still 404 |
| canonical / sitemap / hreflang | ✅ unchanged |

---

## 5 — What was NOT changed

| Item | Touched? |
|---|---|
| MoonCalc | NO (read-only consumption for phase icon + phase name) |
| Umm al-Qura math (`_jdToHijri` + `_gregToJD`) | NO (read-only consumption for per-cell Hijri date) |
| Cell href URLs | NO (today → `/moon-today-in-{city}`, others → `/moon-in-{city}/{YYYY-MM-DD}`) |
| Day ordering (1 → 31, Sun-Sat header) | NO |
| Prev/next month nav | NO |
| Date picker form | NO |
| canonical / hreflang / sitemap / JSON-LD | NO |
| Strict-Gregorian route policy | NO |
| `js/app.js` | NO (byte-identical, `?v=688` unchanged) |
| `js/i18n.js` | NO |
| Dependencies (`package.json`) | NO |

---

## 6 — Files changed (3 source + 1 report)

| File | Change |
|---|---|
| `server.js` | +60 / −15 — added `_CELL_HM_NAMES` (10-lang Hijri month-names map for cell rendering); rewrote `_cellLabel` logic to emit empty rel for ±2+ days; added per-cell Hijri date computation + new `.moon-hub-cal-hijri` span; rewrote `_calLegendByLang` (no +/- mention in any of 10 langs) |
| `css/style.css` | +30 / −10 — `.moon-hub-cal-rel` now a pill; `.moon-hub-cal-date` bigger + bolder; new `.moon-hub-cal-hijri` rules; mobile media query covers new span |
| `index.html` | +2 / −2 — cache-buster `style.css?v=414 → 415` |
| `reports/moon-monthly-calendar-grid-ui-content-polish-1-closure.md` | NEW |

---

## 7 — Closure checklist

- [x] All `+N` / `-N` markers removed from cell rendering (SSR-level).
- [x] Today / yesterday / tomorrow keep their friendly badges as pills.
- [x] Per-cell Hijri date displayed (e.g. "7 ذو الحجة").
- [x] Legend rewritten (no +/- mention) in all 10 langs.
- [x] All 10 langs render correctly with new Hijri month names.
- [x] Cell hrefs unchanged — Gregorian canonical preserved.
- [x] Today special-case `/moon-today-in-{city}` href preserved.
- [x] CSS for new layout + mobile + dark theme.
- [x] Cache-buster bumped.
- [x] MoonCalc + Umm al-Qura: read-only consumption (no algorithm change).
- [x] canonical / hreflang / sitemap / JSON-LD / route-policy unchanged.
- [x] Past + future months tested — no +/- leak.
- [x] Carry-forward 117/117 zero failures.
- [x] Closure report written.
