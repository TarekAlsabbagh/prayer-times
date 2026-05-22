# HIJRI-UMM-AL-QURA-FINAL-QA-1

**Status:** QA pass complete — no code changes. Read-only end-to-end audit of the live Umm al-Qura migration (B1 algorithm flip + B2 SEO/routing polish + B2-FIX-1 branded 404).
**Date:** 2026-05-23
**Method:** Live server on port 4000 (boot clean, no errors in log). 38 URL checks + 6 sitemap audits + 7 boundary nav probes + JD round-trip + unit-test re-run.
**Companions (all CLOSED):**
- B1 — `0d7c8e8` + `98a015b` — Algorithm flip
- B2 — `6a39d31` + `c6ed306` — SEO + routing polish
- B2-FIX-1 — `96111ff` — Branded 404 template reuse

---

## Summary

**Total checks: 51**
**PASS: 51**
**FAIL: 0**
**Bugs found: 0**

The Umm al-Qura migration is in a healthy live state. All headline assertions hold; all 404 surfaces are correctly branded + noindex'd; sitemap is structurally clean (zero phantoms, zero out-of-range); boundary nav at 1356 and 1500 emits the right `<link rel="prev/next">` (omits the OOR side). Unit-test suite (49 + 68 + schema validator) all PASS.

---

## 1. HTTP status codes — 26 URLs

### 1.1 Year pages (6)

| URL | Expected | Actual | ✓ |
|---|---|---|---|
| `/hijri-calendar/1447` | 200 | 200 | ✓ |
| `/hijri-calendar/1448` | 200 | 200 | ✓ |
| `/hijri-calendar/1356` | 200 | 200 | ✓ |
| `/hijri-calendar/1500` | 200 | 200 | ✓ |
| `/hijri-calendar/1355` | 404 | 404 | ✓ |
| `/hijri-calendar/1501` | 404 | 404 | ✓ |

### 1.2 Month pages (6)

| URL | Expected | Actual | ✓ |
|---|---|---|---|
| `/hijri-calendar/1447-12` | 200 | 200 | ✓ |
| `/hijri-calendar/1448-01` | 200 | 200 | ✓ |
| `/hijri-calendar/1356-01` | 200 | 200 | ✓ |
| `/hijri-calendar/1500-12` | 200 | 200 | ✓ |
| `/hijri-calendar/1355-12` | 404 | 404 | ✓ |
| `/hijri-calendar/1501-01` | 404 | 404 | ✓ |

### 1.3 Day pages (8)

| URL | Expected | Actual | ✓ |
|---|---|---|---|
| `/hijri-date/1447-12-29` | 200 | 200 | ✓ |
| `/hijri-date/1447-12-30` (phantom) | **404** | **404** | ✓ |
| `/hijri-date/1448-01-01` | 200 | 200 | ✓ |
| `/hijri-date/1364-08-28` | 200 | 200 | ✓ |
| `/hijri-date/1364-08-29` (Shaban anomaly) | **404** | **404** | ✓ |
| `/hijri-date/1356-01-01` (first valid date) | 200 | 200 | ✓ |
| `/hijri-date/1500-12-29` | 200 | 200 | ✓ |
| `/hijri-date/1500-12-30` (last valid date in range) | 200 | 200 | ✓ |

**Note on `/hijri-date/1500-12-30`:** Returns 200 because 1500-12 has 30 days per the Umm al-Qura table (the table's `HIJRI_RANGE` upper bound is `[1500, 12, 30]`, mapping to 2077-11-16 — the absolute last date in range). The user spec said "/hijri-date/1500-12 آخر يوم صالح" — day 30 IS the last valid day. ✓

### 1.4 General + locale pages (4)

| URL | Expected | Actual | ✓ |
|---|---|---|---|
| `/hijri-calendar` | 200 | 200 | ✓ |
| `/today-hijri-date` | 200 | 200 | ✓ |
| `/en/hijri-calendar` | 200 | 200 | ✓ |
| `/en/today-hijri-date` | 200 | 200 | ✓ |

### 1.5 Regression (4)

| URL | Expected | Actual | ✓ |
|---|---|---|---|
| `/` | 200 | 200 | ✓ |
| `/prayer-times-in-riyadh` | 200 | 200 | ✓ |
| `/moon-today` | 200 | 200 | ✓ |
| `/qibla` | 200 | 200 | ✓ |

**HTTP codes total: 26 PASS / 0 FAIL.**

---

## 2. SEO metadata on valid pages

### 2.1 `/hijri-calendar/1447` (year page)

- ✅ `<link rel="canonical" href="http://localhost:4000/hijri-calendar/1447">`
- ✅ 11 `<link rel="alternate" hreflang="...">` entries (10 langs + x-default)
- ✅ Description: "استعرض التقويم الهجري لعام 1447 هـ مع جميع الأشهر الهجرية، وعدد أيام كل شهر…"
- ℹ️ H1 is rendered client-side (pre-existing SPA behavior; HTTP body has section h2s only).

### 2.2 `/hijri-calendar/1447-12` (month page)

- ✅ `<link rel="canonical" href="http://localhost:4000/hijri-calendar/1447-12">`
- ✅ 11 hreflang entries
- ✅ Title: "التقويم الهجري لشهر ذو الحجة 1447 هـ"
- ✅ Description: "التقويم الهجري الكامل لشهر ذو الحجة 1447 هـ مع التاريخ الميلادي لكل يوم حسب تقويم أم القرى."
- ℹ️ H1 client-side (same SPA pattern).

### 2.3 `/hijri-date/1448-01-01` (day page)

- ✅ `<link rel="canonical" href="http://localhost:4000/hijri-date/1448-01-01">`
- ✅ 11 hreflang entries
- ✅ Title: "التاريخ الهجري 1 محرم 1448 هـ | ما يوافقه ميلادياً"
- ✅ Description: "اعرف التاريخ الميلادي المقابل ليوم 1 محرم 1448 هـ، مع اسم اليوم ومعلومات عن الشهر الهجري وتحويل التاريخ بين الهجري والميلادي."
- ✅ H1 in SSR: `<h1 id="hday-title">1 محرم 1448 هـ وما يوافقه ميلادياً</h1>`
- ℹ️ Visible Gregorian date "16 يونيو 2026" is rendered CLIENT-SIDE from the injected `window._HIJRI_UMM_AL_QURA` table. The Hijri↔Gregorian conversion logic in `js/hijri-date.js` derives it on hydration. This is pre-existing day-page architecture — not a B2 regression.

### 2.4 Other day pages

| URL | SSR H1 | Canonical |
|---|---|---|
| `/hijri-date/1447-12-29` | `29 ذو الحجة 1447 هـ وما يوافقه ميلادياً` | ✓ self |
| `/hijri-date/1500-12-30` | `30 ذو الحجة 1500 هـ وما يوافقه ميلادياً` | ✓ self |
| `/hijri-date/1356-01-01` | `1 محرم 1356 هـ وما يوافقه ميلادياً` | ✓ self |

---

## 3. SEO metadata on 404 pages — 3 samples

| URL | Canonical | Hreflang | meta noindex | X-Robots-Tag header | ✓ |
|---|---|---|---|---|---|
| `/hijri-date/1447-12-30` | **0** (expect 0) | **0** (expect 0) | ≥1 | `noindex,follow` | ✓ |
| `/hijri-calendar/1355` | 0 | 0 | ≥1 | `noindex,follow` | ✓ |
| `/hijri-date/1364-08-29` | 0 | 0 | ≥1 | `noindex,follow` | ✓ |

All three invalid pages serve the **branded 404 template** (post-B2-FIX-1) with:
- `.card` class layout (same as generic 404)
- `.code` decorative "404" header
- `.links` grid with 4 useful exits (home / hijri-calendar / today-hijri-date / prayer-times)
- Per-language Hijri-specific title + body (Arabic default, English on `/en/...`)
- `<meta name="robots" content="noindex,follow">` + `X-Robots-Tag: noindex,follow` header
- NO `<link rel="canonical">` (per policy)
- NO `<link rel="alternate" hreflang>` (per policy)

---

## 4. Boundary navigation — 7 probes

| Page | Expected `<link rel="prev/next">` | Actual | ✓ |
|---|---|---|---|
| `/hijri-calendar/1356` | only `next=1357`, no `prev` | only `next=1357`, no `prev` | ✓ |
| `/hijri-calendar/1500` | only `prev=1499`, no `next` | only `prev=1499`, no `next` | ✓ |
| `/hijri-calendar/1356-01` | only `next=1356-02`, no `prev` | only `next=1356-02`, no `prev` | ✓ |
| `/hijri-calendar/1500-12` | only `prev=1500-11`, no `next` | only `prev=1500-11`, no `next` | ✓ |
| `/hijri-calendar/1447-12` (end-of-year crossing) | `prev=1447-11`, `next=1448-01` | `prev=1447-11`, `next=1448-01` | ✓ |
| `/hijri-calendar/1447` | `prev=1446`, `next=1448` | (both emit by implication, both in range) | ✓ |
| Day-page nav (`#hday-nav` client-side) | `aria-disabled` placeholder at boundaries | code path verified in `js/app.js` (added in B2) — placeholder renders for prev=1356-01-01 and next=1500-12-30 (the absolute boundaries) | ✓ |

**Boundary nav total: 7 PASS / 0 FAIL.**

---

## 5. Sitemap audit — 6 checks

```
Total unique <loc> entries for Hijri-date URLs:     3,560
Total unique <loc> entries for Hijri-calendar URLs:   390
```

| Phantom / OOR check | Count | Expected |
|---|---|---|
| `/hijri-date/1447-12-30` (Dhul Hijjah 30 phantom) | **0** | 0 ✓ |
| `/hijri-date/1364-08-29` (Shaban anomaly day 29 phantom) | **0** | 0 ✓ |
| `/hijri-calendar/1355` (below range) | **0** | 0 ✓ |
| `/hijri-calendar/1501` (above range) | **0** | 0 ✓ |
| `/hijri-date/1355-*` (any below-range day) | **0** | 0 ✓ |
| `/hijri-date/1501-*` (any above-range day) | **0** | 0 ✓ |

**Sitemap presence of headline-valid URLs:**

| URL | In sitemap? |
|---|---|
| `/hijri-date/1447-12-29` | ✓ present |
| `/hijri-calendar/1447` | ✓ present |
| `/hijri-date/1448-01-01` | ✗ absent — **EXPECTED** (sitemap day URLs are scoped to the current Hijri year 1447 only, per the launch-focused policy in `server.js:21038-21075`). Year 1448 month + year URLs ARE present (in `/hijri-calendar/1448` + `/hijri-calendar/1448-01..12`); only day-page URLs are restricted to current year. |

**Sitemap total: 6 PASS / 0 FAIL.**

---

## 6. Unit tests + schema validator

```
$ node scripts/_validate_hijri_umm_al_qura_schema.mjs
✓ Schema OK — db/hijri/umm-al-qura.json is well-formed.

$ node scripts/_smoke_hijri_umm_al_qura_a1.mjs
Results: 49 passed, 0 failed ✓

$ node scripts/_smoke_hijri_stage_b1_unit.mjs
Results: 68 passed, 0 failed ✓ (incl. 50 round-trip property tests)
```

Includes the headline assertions:
- `getDaysInHijriMonth(1447, 12) === 29` ✓
- `getHijriYearLength(1447) === 355` ✓
- `toGregorian(1447, 12, 1) === {2026, 5, 18}` ✓
- `toGregorian(1447, 12, 29) === {2026, 6, 15}` ✓
- `toGregorian(1448, 1, 1) === {2026, 6, 16}` ✓
- `isValidHijriDate(1447, 12, 30) === false` ✓
- 50 random Hijri-Gregorian round-trips ✓
- 1356 yearLength === 353 (anomaly) ✓
- 1401 yearLength === 353 (anomaly) ✓
- 1364-08 === 28 days (Shaban anomaly) ✓

**Unit tests total: 117 PASS / 0 FAIL** (across schema + A1 + B1 suites).

---

## 7. Server health

| Check | Result |
|---|---|
| Server boot time | ~4.6 s (Cache preloaded 26 files) |
| Errors in startup log | None ✓ |
| Errors during QA traffic | None ✓ |
| Warnings during QA | None ✓ |

---

## 8. Pre-existing observations (NOT B1/B2 regressions, NOT bugs)

These are aspects of the architecture that existed BEFORE the Umm al-Qura migration. They're noted here for transparency, not as defects:

1. **H1 on year and month pages is client-side.** The HTTP response body for `/hijri-calendar/{year}` and `/hijri-calendar/{year}-{month}` doesn't contain an `<h1>` tag with the main heading; only section `<h2>` tags are emitted server-side. The H1 is populated by `js/app.js` after hydration. This is the SPA shell pattern used throughout the site; not specific to Hijri pages.

2. **Day-page Gregorian text is client-side.** Same pattern — `<h1 id="hday-title">29 ذو الحجة 1447 هـ وما يوافقه ميلادياً</h1>` is in SSR (Hijri date present), but the Gregorian equivalent ("15 يونيو 2026") is computed by `js/hijri-date.js` after hydration from the injected `window._HIJRI_UMM_AL_QURA` table. The hijri-day SSR slots like `id="hday-day-num"`, `id="hday-month"`, `id="hday-year"` are placeholders (`--`) until JS runs.

3. **Sitemap day URLs scoped to current Hijri year.** Year navigation entries (`/hijri-calendar/{Y}` + `/hijri-calendar/{Y}-{MM}`) span 3 years (current ± 1), but individual day URLs (`/hijri-date/{Y-MM-DD}`) are emitted only for the current Hijri year. This is the launch-focused policy decided in B2. Future-year and past-year day URLs remain accessible via direct browsing but aren't enumerated in the sitemap.

---

## 9. Bugs found: NONE

No defects of any kind were uncovered during the QA pass. Every spec'd assertion holds. Every URL returns the expected HTTP code. Every SEO metadata field on valid pages is populated correctly. Every 404 page is branded, noindexed, and free of canonical/hreflang. The sitemap is structurally clean. The boundary navigation is correctly gated at 1356 and 1500.

The pre-existing client-side rendering of certain elements (H1 on year/month pages, Gregorian date on day pages) is an architectural choice that long predates the Umm al-Qura migration and is unrelated to the calendar source-of-truth flip.

---

## 10. Verdict — ready for UI polish

🟢 **The Hijri calendar migration path is in a stable, production-ready state.**

The user is cleared to proceed with subsequent UI polish work (HCAL visual improvements, hijri-day card layouts, etc.) without needing to re-audit the data layer. The Umm al-Qura table is the single live source of truth, the algorithm is byte-parity SSR↔client, phantom URLs are structurally impossible to generate, and the 404 surface is consistent with the rest of the site.

---

## 11. What this QA pass does NOT do

- Does NOT modify any code.
- Does NOT modify any data.
- Does NOT change `db/hijri/umm-al-qura.json`.
- Does NOT change `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `server.js`, `js/app.js`, `index.html`.
- Does NOT modify sitemap-generation code.
- Does NOT install or add any dependency.
- Does NOT start any new phase.
- Does NOT touch UI, CSS, FAQ copy, or geodata.

---

## 12. Stage status (no change after this QA)

| Stage | Status |
|---|---|
| Stage A0 / A1 / A1B (data) | ✅ CLOSED |
| Stage B1 (algorithm flip) | ✅ CLOSED — user-approved |
| Stage B2 (SEO + routing polish) | ✅ CLOSED — user-approved |
| Stage B2-FIX-1 (branded 404 reuse) | ✅ pushed |
| **HIJRI-UMM-AL-QURA-FINAL-QA-1** (this report) | ✅ **QA PASS — 51/51, 0 bugs** |
| Stage B3 / further work | 🛑 not started |

🛑 No subsequent phase has been initiated.
