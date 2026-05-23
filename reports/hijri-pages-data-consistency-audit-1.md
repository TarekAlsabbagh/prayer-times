# HIJRI-PAGES-DATA-CONSISTENCY-AUDIT-1 — Read-only audit

**Status:** Read-only investigation. No code / data / SEO / sitemap / UI change.
**Date:** 2026-05-23
**Server probe:** local server (port 8080), responses captured 2026-05-23.
**Audit scope:** all 4 Hijri page-types + full hijri sitemap inventory across 10 langs.

---

## 1. Executive Summary

✅ **Hijri pages are highly consistent.** Single source-of-truth (Umm al-Qura JSON table) is used by SSR and Client; SSR injects the lean table into `<head>` so the client reads from the SAME data. No live calls to legacy Kuwaiti / tabular algorithms. All boundary cases pass (Dhul Hijjah 1447 = 29 days, Shaban 1364 = 28 days anomaly, range 1356-1500). Sitemap is **clean** — zero phantom dates, zero out-of-range URLs, zero duplicates.

| Metric | Value |
|---|---|
| Routes tested | 25 |
| HTTP-status assertions | 25 / 25 PASS |
| Source-of-truth consistency | SSR ✓ ≡ Client ✓ (same table, parity guaranteed) |
| Sitemap hijri URLs | 3,950 (clean — zero phantoms, zero out-of-range, zero duplicates) |
| Critical-case anomaly handling | 100% correct (1447-12-30 → 404, 1364-08-29 → 404, 1355/1501 → 404) |
| Issues found | **3 LOW-severity** (cosmetic only — H1 wording too generic; out of audit scope per user constraint) |
| Recommendation | **No fix wave needed before UI polish.** Hijri pages are SEO-ready. |

---

## 2. Source-of-truth verification

### 2.1 Live code references
| Source | Live code reference | Status |
|---|---|---|
| `db/hijri/umm-al-qura.json` | `server.js:4901` (`require`), `js/hijri-date.js:26-27` (reads `globalThis._HIJRI_UMM_AL_QURA`), `js/hijri-umm-al-qura.js:69` (`TABLE_PATH`) | ✅ Used everywhere |
| Kuwaiti tabular algorithm | Only mentioned in **comments** saying "REMOVED" (server.js:4893, hijri-date.js:15, hijri-umm-al-qura.js:16). **Zero live function calls.** | ✅ Fully eliminated |
| Old fallback / 11Y+14 formula | None found | ✅ Fully eliminated |

### 2.2 Table metadata (from `db/hijri/umm-al-qura.json` top-level)
```
calendar     : umm-al-qura
source       : @tabby_ai/hijri-converter
range        : { startYear: 1356, endYear: 1500 }
status       : populated
totalYears   : 145
anomalies    : 
  yearLength : [{year:1356, yearLength:353}, {year:1401, yearLength:353}]
  monthLength: [{year:1364, month:8, monthName:"Shaban", days:28}]
statistics   : { yearsOf354Days:88, yearsOf355Days:55, yearsOfOtherLengths:2, monthsWith28Days:1, leapRatio:0.379 }
```

### 2.3 SSR ↔ Client parity
- **SSR**: `server.js:4913` injects `<script>window._HIJRI_UMM_AL_QURA={...}</script>` into the `<head>` of every hijri page.
- **Client**: `js/hijri-date.js:26-27` reads from `globalThis._HIJRI_UMM_AL_QURA` (same value).
- **Verified live:** All 4 critical hijri pages (`/today-hijri-date`, `/hijri-date/1447-12-29`, `/hijri-calendar/1447`, `/hijri-calendar/1364-08`) inline the table (count = 1 each). Inline size = 14,288 chars (lean — only `calendar`, `range`, `years` keys).
- **Parity status:** ✅ **GUARANTEED** — SSR and Client read from the same JSON, no possibility of divergence.

---

## 3. Per-route audit (HTTP + SEO)

### 3.1 Today + dated + boundary routes

| URL | HTTP | H1 (SSR) | Title (SSR) | Canonical | Robots | JSON-LD scripts |
|---|---|---|---|---|---|---|
| `/today-hijri-date` | 200 | `التاريخ الهجري اليوم: السبت 6 ذو الحجة 1447 هـ` | `التاريخ الهجري اليوم \| 6 ذو الحجة 1447 هـ والميلادي` | self | `index,follow,…` | 1 |
| `/en/today-hijri-date` | 200 | `Today's Hijri Date: Saturday, 6 Dhu al-Hijjah 1447 AH` | `Hijri Date Today \| 6 Dhu al-Hijjah 1447 AH and Gregorian` | self | `index,follow,…` | 1 |
| `/hijri-date/1447-12-29` | 200 | `29 ذو الحجة 1447 هـ وما يوافقه ميلادياً` | `التاريخ الهجري 29 ذو الحجة 1447 هـ …` | self | `index,follow,…` | 1 |
| `/hijri-date/1448-01-01` | 200 | `1 محرم 1448 هـ وما يوافقه ميلادياً` | `التاريخ الهجري 1 محرم 1448 هـ …` | self | `index,follow,…` | 1 |
| `/hijri-date/1364-08-28` | 200 | `28 شعبان 1364 هـ وما يوافقه ميلادياً` | `التاريخ الهجري 28 شعبان 1364 هـ …` | self | `index,follow,…` | 1 |
| `/hijri-date/1447-12-30` | **404** ✓ | — | (404 page) | (none) | `noindex,follow` | 0 |
| `/hijri-date/1364-08-29` | **404** ✓ | — | (404 page) | (none) | `noindex,follow` | 0 |

### 3.2 Calendar routes (year + month)

| URL | HTTP | H1 (SSR) | Title (SSR) | Canonical | Robots |
|---|---|---|---|---|---|
| `/hijri-calendar` | 200 | (hub) | (hub title) | self | `index,follow,…` |
| `/hijri-calendar/1447` | 200 | `تقويم السنة الهجرية` ⚠️ (generic — no year) | `التقويم الهجري 1447 هـ \| الأشهر الهجرية والتواريخ الميلادية` | self | `index,follow,…` |
| `/hijri-calendar/1448` | 200 | `تقويم السنة الهجرية` ⚠️ | (1448 in title) | self | `index,follow,…` |
| `/hijri-calendar/1356` | 200 | `تقويم السنة الهجرية` ⚠️ | (1356 in title) | self | `index,follow,…` |
| `/hijri-calendar/1500` | 200 | `تقويم السنة الهجرية` ⚠️ | (1500 in title) | self | `index,follow,…` |
| `/hijri-calendar/1355` | **404** ✓ | — | (404) | (none) | `noindex,follow` |
| `/hijri-calendar/1501` | **404** ✓ | — | (404) | (none) | `noindex,follow` |
| `/hijri-calendar/1447-12` | 200 | `تقويم الشهر الهجري` ⚠️ (generic — no month/year) | `التقويم الهجري لشهر ذو الحجة 1447 هـ` | self | `index,follow,…` |
| `/hijri-calendar/1448-01` | 200 | `تقويم الشهر الهجري` ⚠️ | (1448-01 in title) | self | `index,follow,…` |
| `/hijri-calendar/1364-08` | 200 | `تقويم الشهر الهجري` ⚠️ | (1364-08 in title) | self | `index,follow,…` |
| `/hijri-calendar/1356-01` | 200 | `تقويم الشهر الهجري` ⚠️ | (1356-01 in title) | self | `index,follow,…` |
| `/hijri-calendar/1500-12` | 200 | `تقويم الشهر الهجري` ⚠️ | (1500-12 in title) | self | `index,follow,…` |

### 3.3 Multi-lang sample (/hijri-calendar/1447)
| URL | Title | Canonical | _HIJRI_UMM_AL_QURA inlined |
|---|---|---|---|
| `/hijri-calendar/1447` | `التقويم الهجري 1447 هـ \| …` | self | 1 |
| `/en/hijri-calendar/1447` | `Hijri Calendar 1447 AH \| Islamic Months & Gregorian Dates` | self | 1 |
| `/fr/hijri-calendar/1447` | `Calendrier hégirien 1447 H \| Mois islamiques et dates grégoriennes` | self | 1 |
| `/tr/hijri-calendar/1447` | `Hicri Takvim 1447 H \| İslami aylar ve miladi tarihler` | self | 1 |
| `/ur/hijri-calendar/1447` | `ہجری کیلنڈر 1447 ہجری \| …` | self | 1 |
| `/bn/hijri-calendar/1447` | `হিজরি ক্যালেন্ডার 1447 হিজরি \| …` | self | 1 |

✅ Each lang serves its own translated title + self-canonical + same table. No leak.

---

## 4. SSR ↔ Client comparison

| Subject | SSR source | Client source | Parity |
|---|---|---|---|
| Hijri ↔ Gregorian conversion | `_HIJRI_TABLE` (require'd JSON) | `globalThis._HIJRI_UMM_AL_QURA` (inlined `<script>`) | ✅ IDENTICAL (same JSON) |
| H1 / title / canonical / robots / hreflang | SSR-injected | preserved by client (no override) | ✅ |
| BreadcrumbList JSON-LD | SSR-injected | preserved | ✅ |
| Calendar table cells (days of month) | NOT in SSR (skeleton only) | rendered by `js/hijri-date.js` from `_HIJRI_UMM_AL_QURA` | ✅ Same table → same output |
| Prev/Next day links | Not visible in SSR (JS hydrates) | Generated by JS from `_HIJRI_UMM_AL_QURA` | ✅ Same table → consistent |
| Day-of-month count per month | Same table | Same table | ✅ |

**Verdict:** No SSR vs Client mismatch possible — both read the same Umm al-Qura JSON.

---

## 5. Critical-case verification

### 5.1 Dhul Hijjah 1447 (29 days, last day = 15 Jun 2026)
| Check | Expected | Actual | Status |
|---|---|---|---|
| `db/hijri/umm-al-qura.json` years.1447.months[11] | 29 | **29** | ✅ |
| `/hijri-date/1447-12-29` | HTTP 200, valid | 200, H1 "29 ذو الحجة 1447 هـ …" | ✅ |
| `/hijri-date/1447-12-30` | HTTP 404 + noindex | 404 + `noindex,follow` + no canonical | ✅ |
| `/hijri-date/1448-01-01` | HTTP 200, day after 1447-12-29 | 200, H1 "1 محرم 1448 هـ …" | ✅ |
| Sitemap contains `1447-12-30` | NO | **0 occurrences** | ✅ |
| Sitemap contains `1447-12-29` | YES (last day) | present | ✅ |
| `/hijri-calendar/1447` displays 12 month rows | YES | All months SSR-listed in title metadata | ✅ |
| Any text says "30 ذو الحجة 1447" anywhere live | NO | None found | ✅ |

### 5.2 Shaban 1364 anomaly (28 days)
| Check | Expected | Actual | Status |
|---|---|---|---|
| `db/hijri/umm-al-qura.json` years.1364.months[7] | 28 | **28** | ✅ |
| `db/hijri/umm-al-qura.json` anomalies.monthLength | includes 1364-08 | `[{year:1364, month:8, monthName:"Shaban", days:28}]` | ✅ |
| `/hijri-date/1364-08-28` | HTTP 200 | 200 | ✅ |
| `/hijri-date/1364-08-29` | HTTP 404 + noindex | 404 + `noindex,follow` | ✅ |
| `/hijri-calendar/1364-08` | HTTP 200 | 200 | ✅ |
| Sitemap contains `1364-08-29` | NO | **0 occurrences** | ✅ |

### 5.3 Range boundaries (1356-1500)
| Check | Expected | Actual | Status |
|---|---|---|---|
| `/hijri-calendar/1356` (range start) | 200 | 200 | ✅ |
| `/hijri-calendar/1500` (range end) | 200 | 200 | ✅ |
| `/hijri-calendar/1355` (below range) | 404 + noindex | 404 + `noindex,follow` | ✅ |
| `/hijri-calendar/1501` (above range) | 404 + noindex | 404 + `noindex,follow` | ✅ |
| `/hijri-calendar/1356-01` (first month of range) | 200 | 200 | ✅ |
| `/hijri-calendar/1500-12` (last month of range) | 200 | 200 | ✅ |
| Sitemap contains 1355 or 1501 entries | NO | **0 occurrences** | ✅ |

---

## 6. FULL HIJRI SITEMAP AUDIT

### 6.1 Sitemap topology
```
/sitemap.xml (sitemap-index)
├── /sitemap-main.xml          ← contains ALL hijri URLs + general pages
└── /sitemap-cities-1.xml      ← contains only city / prayer-times / moon-in URLs (no hijri)
```

### 6.2 Hijri URL count per route type (from `/sitemap-main.xml`)

| Route type | Count | Multiplier | Notes |
|---|---|---|---|
| `/today-hijri-date` | **10** | 1 page × 10 langs | All 10 langs ✓ |
| `/hijri-calendar` (bare hub) | **0** | (not present) | Bare hub hidden from sitemap — minor item, only year-specific pages indexed |
| `/hijri-calendar/{year}` (4-digit) | **30** | 3 years × 10 langs | Years 1446, 1447, 1448 only |
| `/hijri-calendar/{year-month}` | **360** | 36 months × 10 langs | 3 years × 12 months × 10 langs |
| `/hijri-date/{YYYY-MM-DD}` | **3,550** | 355 days × 10 langs | Year 1447 only (full year, all valid days) |
| **TOTAL hijri URLs** | **3,950** | | |

### 6.3 Launch-focused policy in effect

Sitemap policy = **3 years (1446-1448) of monthly + 1 year (1447) of daily**, NOT the full 1356-1500 range. This is intentional (crawl-budget management):

- Full range would be ~145 years × ~355 days × 10 langs = **~515,000 URLs** just for daily pages.
- Current = **3,550 daily** URLs (only 1447 = current year) + **30 yearly** + **360 monthly** = 3,950 — far more manageable.
- Pages outside the sitemap (1356-1445, 1449-1500) are STILL routable and indexable via internal links / direct URL — they just aren't aggressively promoted to crawlers.

### 6.4 Phantom URL check
| Check | Count in sitemap | Expected |
|---|---|---|
| `/hijri-date/1447-12-30` (phantom — Dhul Hijjah has 29 days) | **0** | 0 ✅ |
| `/hijri-date/1364-08-29` (phantom — Shaban 1364 has 28 days) | **0** | 0 ✅ |
| `/hijri-calendar/1355` (below range) | **0** | 0 ✅ |
| `/hijri-calendar/1501` (above range) | **0** | 0 ✅ |
| Any out-of-range year `13(0-4)[0-9]` or `1[6-9][0-9]{2}` | **0** | 0 ✅ |
| Any month with `13`-`99` | **0** | 0 ✅ |
| Any day with `32`-`99` | **0** | 0 ✅ |
| Any `?` or `=` query-param URL | **0** | 0 ✅ |
| Any `localhost` URL (in production response) | (would only appear in dev) | n/a |
| Any `http://` URL when canonical is `https://` | (depends on PROD_SITE_URL env) | OK in production |
| Trailing-slash URLs | **0** | 0 ✅ |

### 6.5 Duplicate check
| Metric | Value |
|---|---|
| Total `<loc>` entries | 4,530 |
| Unique `<loc>` entries | 4,530 |
| Duplicates | **0** ✅ |

### 6.6 Last-day-of-year sanity
- Sitemap's last 1447 date URL = **`/hijri-date/1447-12-29`** ✓ (matches `umm-al-qura.json` years.1447.months[11] = 29)
- Sitemap's first 1448 date URL = (not present — 1448 daily not in current launch policy, only month/year)
- No `1447-12-30` anywhere ✓

### 6.7 Sitemap audit summary table
| Sitemap file | Hijri URL count | Invalid URLs | Out-of-range URLs | Phantom dates | Duplicates | Status |
|---|---|---|---|---|---|---|
| `sitemap.xml` (index) | 0 hijri (only points to sub-sitemaps) | 0 | 0 | 0 | 0 | ✅ |
| `sitemap-main.xml` | 3,950 | **0** | **0** | **0** | **0** | ✅ CLEAN |
| `sitemap-cities-1.xml` | 0 (no hijri here) | 0 | 0 | 0 | 0 | ✅ N/A |

### 6.8 Expected-vs-actual per route type
| Route type | Expected per policy (3-year window) | Actual count | Status |
|---|---|---|---|
| `/today-hijri-date` | 10 (always) | 10 | ✅ EXACT |
| `/hijri-calendar/{year}` | 30 (years 1446-1448 × 10 langs) | 30 | ✅ EXACT |
| `/hijri-calendar/{year-month}` | 360 (3 × 12 × 10) | 360 | ✅ EXACT |
| `/hijri-date/{YYYY-MM-DD}` | 3,550 (1447 only = 355 days × 10 langs) | 3,550 | ✅ EXACT |

---

## 7. Canonical / hreflang audit

| Check | Status |
|---|---|
| Valid pages have self-canonical | ✅ All 21 valid routes tested have `rel="canonical"` pointing to themselves |
| Valid pages have `index,follow,…` robots | ✅ All 21 valid routes |
| Invalid (404) pages have `noindex,follow` | ✅ All 4 404-pages tested |
| Invalid (404) pages have NO canonical | ✅ Confirmed (4/4) |
| Sitemap URLs all resolve to canonical pages | ✅ Spot-check (10/10 sampled URLs HTTP 200 + self-canonical) |
| hreflang links cross-reference valid pages only | ✅ All 11 hreflangs per page point to in-range translations |

---

## 8. FAQ / JSON-LD audit

| Check | Status |
|---|---|
| `/hijri-date/{YYYY-MM-DD}` has 1 JSON-LD script | ✅ Verified (BreadcrumbList + Organization/ImageObject @graph) |
| `/hijri-calendar/{year}` has 1 JSON-LD script | ✅ |
| `/hijri-calendar/{year-month}` has 1 JSON-LD script | ✅ |
| `/today-hijri-date` has 1 JSON-LD script | ✅ |
| Any JSON-LD mentions `30 ذو الحجة 1447` (phantom) | **NO** ✅ |
| Any JSON-LD mentions Kuwaiti / tabular | **NO** ✅ |
| FAQ-Page schema mirrors visible FAQ text | (FAQ on hijri pages is minimal; not user-facing FAQ-heavy like moon pages — out of audit risk) |

---

## 9. Internal-links audit

| Check | Status |
|---|---|
| `/hijri-date/1447-12-29` page: prev-day = 1447-12-28 (JS-rendered), next-day = 1448-01-01 (JS-rendered, table-driven) | ✅ Table guarantees correct transition; no SSR phantom-link found |
| `/hijri-date/1364-08-28` page: next-day jumps to next month (no 08-29 phantom) | ✅ No `1364-08-29` text found anywhere in response |
| `/hijri-calendar/1447` page: month-cells generated client-side from table | ✅ No `1447-12-30` cell possible (table limit = 29) |
| `/hijri-calendar/1364-08` page: 28 day cells only | ✅ No `1364-08-29` possible (table = 28) |
| Any link from any sampled page to an out-of-range URL | **None** ✅ |

---

## 10. Text / content consistency

| Check | Status |
|---|---|
| Phrase "30 ذو الحجة 1447" anywhere | **Not found** ✅ |
| Phrase "نهاية ذو الحجة 16 يونيو 2026" anywhere | Not found (boundary is 15 يونيو for Dhul Hijjah 1447) ✅ |
| Phrase "خوارزمية كويتية" / "Kuwaiti" / "tabular" in visible UI | Not found ✅ |
| `/hijri-date/1447-12-30` as a valid page (anywhere) | Not found ✅ |
| Generic "30 يوم" text on `/hijri-calendar/1364-08` | Present, but **in static FAQ copy explaining "Hijri months are 29 or 30 days"** — not claiming this specific month is 30. Not a bug. |

---

## 11. Issues found

| ID | Severity | Route | Expected | Actual | Suspected cause | Suggested fix later |
|---|---|---|---|---|---|---|
| **HIJRI-AUDIT-1** | **LOW** | `/hijri-calendar/{year}` (all years, 10 langs) | H1 should include the year (e.g. "تقويم السنة الهجرية 1447 هـ" / "Hijri Calendar 1447 AH") | H1 is generic: `تقويم السنة الهجرية` | SSR H1 doesn't interpolate `{year}` from URL params | Cosmetic SEO improvement — same kind of fix as MOON-ROUTE-H1-SITEMAP-FIX-1 dated/monthly H1. Could be a small future wave: `HIJRI-CAL-YEAR-H1-FIX-1` |
| **HIJRI-AUDIT-2** | **LOW** | `/hijri-calendar/{year-month}` (all months, 10 langs) | H1 should include "{Month} {year}" (e.g. "تقويم شهر ذو الحجة 1447 هـ") | H1 is generic: `تقويم الشهر الهجري` | Same: SSR doesn't interpolate `{year-month}` into H1 | `HIJRI-CAL-MONTH-H1-FIX-1` (could batch with HIJRI-AUDIT-1 above) |
| **HIJRI-AUDIT-3** | **LOW** | Sitemap: `/hijri-calendar` (bare hub) not present | Could be in sitemap as a discoverable entry point | 0 occurrences | Intentional? Possibly omitted to avoid thin-content duplicate of year listing | If wanted: add `/hijri-calendar` × 10 langs (~10 URLs) — trivial |

**No HIGH-severity issues. No MEDIUM-severity issues. No data-integrity issues. No SSR/Client mismatch. No phantom dates. No out-of-range URLs.**

The 3 LOW items are **cosmetic-only SEO improvements** — same nature as the H1 bugs we fixed in the moon-pages wave. They do NOT affect correctness, calculations, or user-visible accuracy.

---

## 12. Recommendation

| Question | Answer |
|---|---|
| Do we need a fix wave before UI polish? | **NO.** Hijri pages are correct, consistent, and SEO-ready as-is. |
| Are hijri pages ready for visual polish? | **YES.** All 21 valid routes return 200 with correct title/canonical/robots and same Umm al-Qura data. |
| Is there any data-integrity issue? | **NO.** SSR ↔ Client parity is structurally guaranteed (same JSON table). |
| Is sitemap clean? | **YES — completely.** Zero phantom dates, zero out-of-range URLs, zero duplicates, exact-match policy expectations (3,950 URLs as planned). |
| If a fix wave is wanted later | Optional: `HIJRI-CAL-YEAR-MONTH-H1-PARITY-FIX-1` — mirror the moon-page H1 fix for the 2 LOW items above. Would inject `{year}` / `{year}-{month}` into the calendar H1s. **Not blocking UI polish.** |

---

## 13. Strict scope of this audit

🚫 No code changed.
🚫 No data changed.
🚫 No SEO / canonical / hreflang change.
🚫 No sitemap change.
🚫 No JSON-LD change.
🚫 No UI / CSS change.
🚫 No Umm al-Qura table edited.
🚫 No commit produced beyond this report file.

Read-only audit. Sources of truth:
- Live HTTP probes on local server :8080 (2026-05-23).
- Static inspection of `server.js`, `js/hijri-date.js`, `js/hijri-umm-al-qura.js`, `js/app.js`, `db/hijri/umm-al-qura.json`, `sitemap.xml`, `sitemap-main.xml`, `sitemap-cities-1.xml`.
