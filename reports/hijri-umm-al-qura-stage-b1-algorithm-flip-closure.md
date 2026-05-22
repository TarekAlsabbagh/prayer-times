# HIJRI-UMM-AL-QURA-STAGE-B1-ALGORITHM-FLIP — Closure report

**Status:** Stage B1 complete — live calendar algorithm flipped from the Kuwaiti tabular formula to the Umm al-Qura local table (`db/hijri/umm-al-qura.json`). Awaiting user approval for commit + push.
**Date:** 2026-05-23
**Companions:**
- `reports/hijri-umm-al-qura-data-stage-a1-closure.md` (Stage A1 data populated, commits `b98b324` + `6c8ff9b`)
- `reports/hijri-umm-al-qura-anomaly-crosscheck-1.md` (anomaly cross-check, commit `0795303`)
- `reports/hijri-umm-al-qura-data-disclosure-a1b-closure.md` (Stage A1B disclosure, commit `c72f6cb`)

---

## 1. What this stage does

Replaces the Kuwaiti tabular Hijri algorithm — that was the live source of truth for every Hijri date on the site since the project began — with a TABLE-driven implementation that reads `db/hijri/umm-al-qura.json` (the populated table committed in Stage A1).

After this stage:
- `/hijri-calendar/1447` shows Dhul Hijjah row with **29 days** (was 30).
- `/hijri-date/1447-12-30` returns **HTTP 404** (was 200 with wrong content).
- `/hijri-date/1448-01-01` shows Gregorian **16 يونيو 2026** (was 17 June).
- All Hijri ↔ Gregorian conversions in the codebase now derive from the Umm al-Qura table.
- Year navigation (prev/next), month grids, day-card metadata all reflect Umm al-Qura values.
- Any Hijri date outside 1356-1500 AH returns 404 with no fallback.

---

## 2. Files changed

| File | Status | Net change | Purpose |
|---|---|---|---|
| `js/hijri-date.js` | **M** (full rewrite) | 146 → 200+ lines | Replaced Kuwaiti formulas with table-driven helpers. Same public API (toHijri, toGregorian, getToday, getDaysInHijriMonth, isHijriLeapYear, hijriToJD, gregorianToJD, getHijriCalendar) plus 3 new helpers (isValidHijriDate, isYearInRange, getHijriYearLength). Reads from `globalThis._HIJRI_UMM_AL_QURA` injected by SSR. CJS export added for Node tests. |
| `server.js` | **M** (in-place edit) | ~110 lines changed | Replaced `_hijriToJD`, `_jdToHijri`, `_hijriToGregorian` with table-driven versions. Added `_isYearInRange`, `_isValidHijriDate`, `_getDaysInHijriMonth`, `_getHijriYearLength`, `_yearStartJD`. Loads `db/hijri/umm-al-qura.json` via `require()`. Pre-computes `_HIJRI_INLINE_SCRIPT` (lean table → 14.3 KB inline script). Injects the script tag into the cached `index.html` during preload. Adds 404 early-return at the top of the dispatcher for any invalid Hijri URL. |
| `js/app.js` | **M** (surgical) | +14 lines | Added `HijriDate.isValidHijriDate` gate at the day-page route handler (after regex match, before `loadHijriDayPage()`). Updated `_HDAY_NONTODAY.ar.faq` leap-year answer wording to remove Kuwaiti leap-cycle framing — now uses `${c.totalYearDays} يومًا حسب تقويم أم القرى`. |
| `db/hijri/umm-al-qura.json` | **M** (status flip) | 1 line | `status: "data-ready"` → `"populated"`. No year/month value changes. |
| `index.html` | **M** | 3 cache-buster bumps | `css/style.css?v=397` → `?v=398`, `app.js?v=676` → `?v=677`, `hijri-date.js?v=42` → `?v=43`. |
| `scripts/_smoke_hijri_umm_al_qura_a1.mjs` | **M** | 1 line | Updated `status` assertion from `"data-ready"` to `"populated"`. |
| `scripts/_smoke_hijri_stage_b1_unit.mjs` | **NEW** | +200 lines | New unit-test suite for table-driven `js/hijri-date.js`. 68 assertions across 11 categories. |
| `reports/hijri-umm-al-qura-stage-b1-algorithm-flip-closure.md` | **NEW** | (this file) | Closure report. |

---

## 3. Functions replaced

### 3.1 `js/hijri-date.js` (client)

| Function | Before (Kuwaiti) | After (Umm al-Qura table) |
|---|---|---|
| `isHijriLeapYear(y)` | `((11Y + 14) % 30) < 11` | `getHijriYearLength(y) === 355` (table lookup) |
| `getDaysInHijriMonth(y, m)` | Odd month → 30; even month → 29; month 12 leap → 30 | `table.years[y].months[m-1]` |
| `hijriToJD(y, m, d)` | Closed-form formula | Indirect via `hijriToGregorian` + `gregorianToJD` |
| `jdToHijri(jd)` | Closed-form formula | _(removed; replaced by `gregorianToHijri` binary search internally)_ |
| `hijriToGregorian(y, m, d)` | JD-based math | Direct table lookup: `yearStart + sum(months[0..m-2]) + (d-1)` |
| `gregorianToHijri(gy, gm, gd)` | JD-based math | Binary search across `years{}` for the right Hijri year, then linear month-scan |
| `isValidHijriDate(y, m, d)` | _(did not exist)_ | NEW — table-based validation |
| `isYearInRange(y)` | _(did not exist)_ | NEW — checks against `table.range` |
| `getHijriYearLength(y)` | _(did not exist)_ | NEW — table lookup |

### 3.2 `server.js` (SSR mirror)

Same replacements as client (`_hijriToJD`, `_jdToHijri`, `_hijriToGregorian`, plus new helpers `_isValidHijriDate`, `_isYearInRange`, `_getDaysInHijriMonth`, `_getHijriYearLength`, `_yearStartJD`). Uses `require('./db/hijri/umm-al-qura.json')` — direct file read, byte-identical data to client.

### 3.3 Removed dead code

- The `(11Y + 14) % 30 < 11` Kuwaiti leap-cycle rule is **completely removed** from production code paths.
- The closed-form Kuwaiti `_hijriToJD` formula `floor((11Y+3)/30) + 354Y + 30M - floor((M-1)/2) + D + 1948440 - 385` is **completely removed**.
- The Kuwaiti `_jdToHijri` formula based on `(jd - 1948439.5)` and the cycle constants `10646 / 10631` is **completely removed**.

---

## 4. Test results

### 4.1 Schema + data tests

```
$ node scripts/_validate_hijri_umm_al_qura_schema.mjs
✓ Schema OK — db/hijri/umm-al-qura.json is well-formed.

$ node scripts/_smoke_hijri_umm_al_qura_a1.mjs
Results: 49 passed, 0 failed ✓
```

### 4.2 Unit tests on the new table-driven helpers

```
$ node scripts/_smoke_hijri_stage_b1_unit.mjs
• Category 1: isYearInRange
• Category 2: getDaysInHijriMonth
• Category 3: getHijriYearLength + isHijriLeapYear
• Category 4: isValidHijriDate (HEADLINE phantom-date guard)
• Category 5: hijriToGregorian (HEADLINE)
• Category 6: gregorianToHijri (round-trip)
  - 50 random round-trips: OK
• Category 7: getToday
• Category 8: getHijriCalendar for 1447-12
• Category 9: JD helpers (backward compat)
• Category 10: 1447/1448 boundary continuity
• Category 11: constants (backward compat)

Results: 68 passed, 0 failed ✓
```

### 4.3 SSR smoke (live server on port 3997)

```
$ for url in ...; do curl -s -o /dev/null -w "%{http_code}" "..."; done

200  /hijri-date/1447-12-29        (expected 200) ✓
404  /hijri-date/1447-12-30        (expected 404) ✓
200  /hijri-date/1448-01-01        (expected 200) ✓
200  /hijri-calendar/1447          (expected 200) ✓
200  /hijri-calendar/1447-12       (expected 200) ✓
200  /hijri-calendar/1448-01       (expected 200) ✓
404  /hijri-calendar/1355          (expected 404 — out of range) ✓
404  /hijri-calendar/1501          (expected 404 — out of range) ✓
404  /hijri-date/1364-08-29        (expected 404 — Shaban anomaly only 28 days) ✓
200  /hijri-date/1364-08-28        (expected 200 — last valid day) ✓
```

**10 / 10 expected status codes match.**

### 4.4 SSR content verification

```
$ curl -s "/hijri-date/1447-12-29" | grep "15 يونيو 2026"
✓ "15 يونيو 2026" present in SSR output

$ curl -s "/hijri-date/1448-01-01" | grep "16 يونيو 2026"
✓ "16 يونيو 2026" present in SSR output

$ curl -s "/" | grep "window._HIJRI_UMM_AL_QURA"
✓ Lean table (14.3 KB) injected into <head> of every HTML response
```

### 4.5 Regression smoke — non-Hijri pages

```
200  /                        ✓
200  /prayer-times-in-riyadh  ✓
200  /today-hijri-date        ✓
200  /moon-today              ✓
200  /qibla                   ✓
200  /hijri-calendar          ✓ (root, no year)
```

No regressions on any non-Hijri page.

### 4.6 Headline assertion compliance

| User-required value | Result |
|---|---|
| `1447-12 = 29 يومًا` | ✅ Verified by unit test + SSR smoke |
| `1447 yearLength = 355` | ✅ Verified by unit test |
| `1447-12-01 = 2026-05-18` | ✅ Verified by unit test |
| `1447-12-29 = 2026-06-15` | ✅ Verified by unit test + SSR HTML body |
| `1448-01-01 = 2026-06-16` | ✅ Verified by unit test + SSR HTML body |
| `1447-12-30 = 404 / invalid` | ✅ Verified by SSR smoke (HTTP 404) + unit test |
| `1447-12-29 → order 29 of 29` | ✅ Day-count is correct in table |
| Next day after 1447-12-29 = 1 محرم 1448 | ✅ JD math + table say so |
| Previous day before 1448-01-01 = 29 ذو الحجة 1447 | ✅ Same |
| No overlap, no gap between 1447 end and 1448 start | ✅ Unit test confirms JDs differ by exactly 1 day |

---

## 5. Before / after for Dhul Hijjah 1447

| Field | Before (Kuwaiti) | After (Umm al-Qura) | Δ |
|---|---|---|---|
| Days in month | **30** | **29** | -1 |
| Day 1 Gregorian | 18 May 2026 | 18 May 2026 | 0 (match) |
| Day 29 Gregorian | 15 June 2026 | 15 June 2026 | 0 (match) |
| Day 30 Gregorian | 16 June 2026 | **(does not exist — 404)** | structural |
| Year total days | 355 | 355 | 0 (same total, different distribution) |
| Extra leap day located in | Dhul Hijjah (M12=30) | Rabi al-Akhir (M4=30) | shifted 8 months earlier |
| 1 Muharram 1448 Gregorian | 17 June 2026 | **16 June 2026** | -1 |
| `/hijri-date/1447-12-30` HTTP | 200 (wrong content) | **404** | structural |

---

## 6. Kuwaiti algorithm removed from all live code paths

Verified by search:
- `js/hijri-date.js`: `(11 * year + 14) % 30` no longer present ✓
- `server.js`: `floor((11 * year + 3) / 30)` no longer present ✓
- `server.js`: comment `خوارزمية كويتية` no longer present ✓
- No file under `js/`, `server.js`, or `index.html` references the Kuwaiti formula.

The Kuwaiti algorithm is permanently retired from live calendar code. The only place it could still appear is in older `.lh-runs/` snapshots and reports, which are documentation only and don't affect runtime.

---

## 7. Table is the single source of truth

`db/hijri/umm-al-qura.json` (status: `"populated"`) is now the ONLY source of Hijri calendar truth:
- SSR (`server.js`) reads it via `require()`.
- Client (`js/hijri-date.js`) reads it via injected `window._HIJRI_UMM_AL_QURA`.
- Both implementations derive Hijri ↔ Gregorian mappings byte-identically from the same table.
- No formula fallback exists anywhere in the live code.

---

## 8. Confirmation: B2 NOT started

B2 (sitemap + canonical/hreflang/internal-link audit) is **NOT** part of Stage B1 and is **NOT** started here.

- `scripts/build-curated-sitemap.mjs` is unchanged.
- `sitemap-index.xml` is unchanged.
- `server.js`'s sitemap-generation code is unchanged.
- No Hijri-specific sitemap was added.
- Canonical / hreflang / internal-link generators were NOT audited or modified beyond the inline 404 gate.
- Year-nav prev/next at the boundary (1356 prev = 1355, 1500 next = 1501) still emit those URLs as links; the SERVER returns 404 on click. A proper UI-level hide/disable is part of B2.

---

## 9. Confirmation: no API, no dependency, no install

- `package.json` byte-identical to HEAD.
- `package-lock.json` untouched.
- No npm install was performed.
- No external HTTP request is made by the new code.
- The only filesystem read added is `require('./db/hijri/umm-al-qura.json')` at server startup (already in-repo data).

---

## 10. What this stage does NOT do

- Does NOT change the sitemap.
- Does NOT regenerate sitemap entries for Hijri dates.
- Does NOT touch any geodata / city files.
- Does NOT change SEO metadata (titles, descriptions, JSON-LD schemas) beyond the Arabic FAQ wording for the leap-year question.
- Does NOT change canonical or hreflang generation.
- Does NOT modify UI (no CSS changes, no layout shifts).
- Does NOT add a "Hijri date not found" branded 404 page — the 404 is plain HTML for now (B2 can polish it).
- Does NOT add dependencies.
- Does NOT install anything.
- Does NOT start Stage B2.

---

## 11. Awaiting user action

1. **Approve commit + push of Stage B1?** All unit + schema + smoke + regression tests pass. Live site behaviour now reflects the Umm al-Qura calendar.
2. **Choose next phase:**
   - B2: sitemap/canonical/hreflang/internal-link audit.
   - Or pause to gather user feedback on the visible changes (Dhul Hijjah row count, FAQ wording, etc.).

🛑 **No further code change, no Stage B2, until explicit user approval.**

---

## End of B1 closure — awaiting user approval to commit + push.
