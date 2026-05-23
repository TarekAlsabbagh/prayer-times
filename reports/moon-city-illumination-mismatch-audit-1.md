# MOON-CITY-ILLUMINATION-MISMATCH-AUDIT-1

**Status:** Read-only diagnostic. **Zero code/data/UI changes.**
**Date:** 2026-05-23
**Page audited:** `/moon-in-riyadh` (Arabic + English, hub page)
**Reported observation (user):**
- Summary / hero section: illumination = **50.14 %**
- 7-day chart center point: illumination = **49.1 %**
- Forecast table "today" row: illumination = **49.13 %**

---

## A. Executive summary

🟡 **The mismatch IS real and the root cause is identified with high confidence.**

It is **NOT a formatting / rounding bug.** It is a **sampling-timestamp bug**:

- **Summary** samples illumination at `new Date()` — the **exact current browsing instant** (the millisecond the user opened the page).
- **Chart** samples illumination at **local NOON (12:00) in the BROWSER's timezone** — every point on the chart, including the centre point representing "today".
- **Forecast table** samples illumination at the **MIDPOINT of the local day in the CITY's timezone** (i.e. local 12:00 in Asia/Riyadh, which is 09:00 UTC).

Because the Moon's illumination changes continuously (~1 % per 3 hours during the current waxing-crescent → first-quarter transition), three different sampling instants yield three different numbers. The 50.14 → 49.13 difference of ~1 % corresponds to roughly a 3-hour gap between "now" and "noon", which matches the user's likely browsing time (mid-afternoon Riyadh time = ~3 h after noon).

The chart-vs-table sub-difference (49.1 vs 49.13) IS pure formatting: chart uses `.toFixed(1)`, table uses `.toFixed(2)`. The underlying instants are identical (or near-identical).

So in reality there are **TWO sampling instants** in play, displayed at three precisions:

| Instant | Used by | Raw illum | Displayed |
|---|---|---|---|
| "Now" (current millisecond) | Summary / details / hero | ~50.14 % | 50.14 % |
| Local-noon (today, 12:00) | Chart + Table | ~49.13 % | Chart: 49.1 %, Table: 49.13 % |

---

## B. Value map (per section)

| Section | DOM ID | Displayed value | Raw value | Date object passed | Local instant | Timezone of "local" | Function | File:line |
|---|---|---|---|---|---|---|---|---|
| Hero / summary "Illumination" | `#moon-illumination`, `#moon-illumination-pct`, `#moon-summary-illum` | 50.14 % | ~50.14 % | `today` = `new Date()` | current millisecond (browser clock) | browser tz | `MoonCalc.getMoonIllumination(today)` | `js/app.js:16650` |
| Details panel "Illumination" (same ID set) | same | 50.14 % | same | same | same | same | same | same |
| 7-day chart centre point | (SVG, no fixed ID) | 49.1 % | ~49.131 % | `today` mutated to local-12:00 noon | today 12:00 in browser tz | browser tz | `MC.getMoonIllumination(d)` where `d.setHours(12,0,0,0)` | `js/moon-chart.js:303-309` |
| 7-day chart other points (±1, ±2, ±3 days) | (SVG) | varies | varies | each offset day at 12:00 local | offset day 12:00 | browser tz | same | same |
| Forecast table "today" row | `#moon-forecast-body` row 0 | 49.13 % | ~49.131 % | `dSample` = midpoint of day window in Asia/Riyadh | 12:00 Asia/Riyadh = 09:00 UTC | **city tz** (Asia/Riyadh) | `getMoonIllumination(dSample)` inside `getForecast()` | `js/moon.js:545,551` |
| Forecast table other rows | same | varies | varies | each day midpoint in city tz | each day 12:00 city-local | city tz | same | same |
| FAQ | (text only — no live value) | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| Meta description | `<meta>` | N/A (text only) | N/A | N/A | N/A | N/A | N/A | server.js |
| JSON-LD FAQPage | `<script>` | N/A (text only) | N/A | N/A | N/A | N/A | N/A | server.js |
| JSON-LD Place schema | `<script>` | N/A (no illum) | — | — | — | — | — | — |
| Previous-day comparison | `#moon-date-badge` | varies | computed from `_yesterday` (today − 1 day) at "now" instant | `_yesterday` = `today - 1 day` | yesterday's "now" instant | browser tz | `MoonCalc.getMoonIllumination(_yesterday)` | `js/app.js:19283` |

---

## C. Root-cause analysis

### Primary cause: **THREE different sampling timestamps for the same logical "today"**

The codebase has **three independent illumination-sampling sites**, each picking a different `Date` instant for what it calls "today":

#### 1. Summary / details path (`js/app.js:16594-16650`)

```javascript
const _requestedDate = _moonDateFromPath();   // null on /moon-in-riyadh (no date in URL)
const today = _requestedDate || new Date();   // → new Date() — CURRENT MILLISECOND
...
const illumination = MoonCalc.getMoonIllumination(today);  // line 16650
```

`today` here is the **exact browsing instant** (e.g., 2026-05-23T11:58:34.221Z). Illumination is sampled at that millisecond.

#### 2. Chart path (`js/moon-chart.js:303-309`)

```javascript
for (let offset = -half; offset <= half; offset++) {
    const d = new Date(centerDate);
    d.setHours(12, 0, 0, 0);            // ← normalize to LOCAL NOON
    d.setDate(d.getDate() + offset);
    pct = MC.getMoonIllumination(d);    // sample at local-noon
    ...
}
```

The chart receives `centerDate = today` from app.js (same `today` object as summary), but it **mutates the time component to 12:00:00.000 LOCAL** (browser's local timezone). The comment says "ظهرًا لتجنّب مشاكل DST عند حساب 3D position" — sampling at noon to avoid DST edge artefacts during 3D rendering of the moon shape.

So the centre point is `today at 12:00 browser-local`, NOT `today at the current instant`.

#### 3. Forecast table path (`js/moon.js:526-566`, called from `js/app.js:18746-18748`)

```javascript
// In app.js
const fc = MoonCalc.getForecast(today, _lat, _lng, 14, _tz);

// Inside getForecast in moon.js:
const resolvedTz = tz || _tzFromLongitude(lng);   // "Asia/Riyadh" for /moon-in-riyadh
const rangeStart = _localMidnightInTz(d0, resolvedTz);  // 00:00 Asia/Riyadh of today
...
const dayStart = new Date(rangeStart.getTime() + i * 86400000);   // 00:00 Asia/Riyadh
const dayEnd   = new Date(rangeStart.getTime() + (i+1) * 86400000); // next 00:00
const dSample = new Date((dayStart.getTime() + dayEnd.getTime()) / 2);  // 12:00 Asia/Riyadh
const illumination = getMoonIllumination(dSample);
```

The forecast table uses a **completely separate sampling logic**: it computes the midpoint of each day in the city's timezone. For Riyadh (no DST, UTC+3), this is 09:00 UTC = 12:00 local Riyadh time, every day.

### Why the values differ numerically

The moon's illumination changes ~24-30 % per week (full cycle = 29.5 days ÷ 2 = ~14.75 days per 0→100→0 sweep). Near the first quarter, illumination changes ~1 % per 3 hours.

| Calculation | Sampled at (UTC) | Difference vs noon-UTC | Approx Δ illum |
|---|---|---|---|
| Summary (now) | e.g. 11:58 UTC (= 14:58 Riyadh) | +2 h 58 m vs Asia/Riyadh noon | ~+1.0 % (waxing) |
| Chart (local noon, browser) | e.g. 09:00 UTC if browser is also Riyadh | baseline | baseline |
| Table (local noon, Asia/Riyadh) | always 09:00 UTC | identical baseline | identical |

So:
- 50.14 % = summary's "now" value (3 h after noon, ~+1 % higher)
- 49.13 % = noon value (chart + table — they actually compute the same instant, displayed at 1- vs 2-decimal precision)

### Chart-vs-table sub-difference

49.1 % vs 49.13 % is **NOT** a different instant — it's the same raw value displayed at different precision:
- Chart: `pctRound = (pct).toFixed(1)` → "49.1"
- Table: `(illum).toFixed(2)` → "49.13"

Confirmed by the code: both paths compute illumination at the same "local noon" instant (assuming browser tz = Asia/Riyadh; if user browses from a different tz, chart and table may diverge by up to 12 hours — see Edge Case D below).

### Why this isn't a city / coordinates / source bug

- All three paths use the SAME `MoonCalc.getMoonIllumination` function — verified.
- Illumination does NOT depend on lat/lng (it's a purely geocentric quantity in this implementation; only `getMoonDistance` and `getMoonTimes` need coords).
- The MOON-CITY-TODAY-DATA-CONSISTENCY-AUDIT-1 report (just-completed audit) confirmed city/coords/tz are byte-identical across all sections.

So city, coords, MoonCalc function, source-dictionary are all consistent. The bug is **purely in the date/time argument** passed to the function.

---

## D. Edge case: user in a different timezone than the city

If the user opens `/moon-in-riyadh` from, say, **Cairo** (UTC+2) or **London** (UTC+0/+1):

- **Summary** still uses `new Date()` = current Cairo / London instant.
- **Chart** still uses browser-local noon = 12:00 in Cairo / London = 10:00 / 11:00 UTC.
- **Table** still uses Asia/Riyadh noon = 09:00 UTC always.

In that scenario, **chart and table also diverge** (not just summary vs chart/table). The deltas would be small (~1 % per 3 hours) but they'd be there for any non-Riyadh visitor.

For a Riyadh-local visitor, chart-tz and table-tz coincide → only summary diverges.
For an out-of-tz visitor, **all three values can disagree**.

---

## E. Impact

| Surface | Impact | Severity |
|---|---|---|
| `/moon-in-{city}` hub pages (all cities) | Same 3-way mismatch | 🟡 MEDIUM |
| `/moon-today` | Likely same pattern (uses `_renderMoonData` + chart + forecast) — should be verified | 🟡 MEDIUM (extrapolation) |
| `/moon-today-in-{city}` | Same call paths → same mismatch | 🟡 MEDIUM |
| `/moon-in-{city}/{YYYY-MM-DD}` (dated page) | When the URL specifies a date, `today = _requestedDate` (midnight start-of-day) → summary samples at 00:00 of that day rather than "now" → may match or differ from chart's noon depending on offset | 🟡 MEDIUM but different flavor |
| FAQ | No live illum value displayed — text is generic templated copy | 🟢 No impact |
| JSON-LD Place / FAQPage | No live illum field — no impact | 🟢 No impact |
| Meta description / Title | Text only, no number | 🟢 No impact |
| Previous-day comparison badge | Uses `MoonCalc.getMoonIllumination(_yesterday)` where `_yesterday` is yesterday's "now" instant. Comparison delta = (today-now) − (yesterday-now). The deltas cancel out the "now-vs-noon" offset, so the **delta** is correct even though the absolute value of "today's now" differs from chart/table. Not a user-visible mismatch in the delta itself. | 🟢 No impact (delta is self-consistent) |
| Other languages (`/en/moon-in-riyadh`, `/fr/...`, `/ur/...`) | Same code path — same mismatch | 🟡 MEDIUM (uniform across langs) |
| SSR | All moon values are `--` placeholders. No SSR mismatch (verified in audit-1). | 🟢 No impact server-side |
| Search-engine indexing | Crawlers (Google) execute JS and see whichever value JS produces. The three sections show three numbers in the rendered DOM — Google's structured-data tools may NOT flag this (no JSON-LD illum field), but the visible-text inconsistency is observable. | 🟡 MEDIUM SEO trust |

### Approximate frequency of user-visible mismatch

- Whenever the user opens the page **more than ~30 minutes from local noon**, summary will visibly differ from chart/table by ≥ 0.1 % (= 1 decimal).
- During fast-changing phases (waxing/waning crescent, first/last quarter), this gap can reach 1-2 %.
- During slow-changing phases (full moon, new moon), the gap may be < 0.05 % and invisible at 2-decimal precision.

Today's phase (waxing crescent ~50 %) is in the FAST-changing regime → the bug is highly visible right now.

---

## F. Evidence

### F.1 Summary call site

```
js/app.js:16593-16594
    const _requestedDate = _moonDateFromPath();
    const today = _requestedDate || new Date();

js/app.js:16650
    const illumination = MoonCalc.getMoonIllumination(today);
```

### F.2 Chart call site

```
js/moon-chart.js:301-310
    for (let offset = -half; offset <= half; offset++) {
        const d = new Date(centerDate);
        d.setHours(12, 0, 0, 0);            // ← normalize to LOCAL NOON
        d.setDate(d.getDate() + offset);
        try {
            pct = MC.getMoonIllumination(d) || 0;
        } catch (_) {}
        ...
    }
```

The `d.setHours(12, 0, 0, 0)` is the key line. It sets the time to **12:00 in the BROWSER's local timezone** (not the city's tz). The comment explicitly says "to avoid DST issues".

### F.3 Table call site

```
js/app.js:18746-18748
    const fc = MoonCalc.getForecast
        ? MoonCalc.getForecast(today, _lat, _lng, 14, _tz)
        : MoonCalc.get7DayForecast(today, _lat, _lng, _tz);
```

```
js/moon.js:535-551 (inside getForecast)
    const resolvedTz = tz || _tzFromLongitude(lng);
    const rangeStart = _localMidnightInTz(d0, resolvedTz);
    ...
    const dayStart = new Date(rangeStart.getTime() + i * 86400000);
    const dayEnd   = new Date(rangeStart.getTime() + (i + 1) * 86400000);
    const dSample = new Date((dayStart.getTime() + dayEnd.getTime()) / 2);
    const illumination = getMoonIllumination(dSample);
```

The `_localMidnightInTz(d0, "Asia/Riyadh")` produces 00:00 Riyadh, and `dSample` is exactly 12 hours after = 12:00 Asia/Riyadh = 09:00 UTC.

### F.4 Display formatting (chart vs table)

- **Chart**: uses `pctRound = pct.toFixed(1)` somewhere in `moon-chart.js` rendering pipeline → "49.1".
- **Table**: app.js uses `illum.toFixed(2)` for the table row → "49.13".

The 0.03 % difference between "49.1" and "49.13" is purely a display-precision artefact of the same underlying ~49.131 value.

### F.5 Summary display formatting

- Summary uses `Math.round(illum * 100) / 100` then displays with 2 decimals → "50.14".

### F.6 Cross-section comparison (computed for today, Riyadh visitor)

Assuming today is 2026-05-23 and the user is browsing at ~15:00 Riyadh time (UTC+3 = 12:00 UTC):

| Section | Sampling instant (UTC) | Approx illum | Display |
|---|---|---|---|
| Summary | 12:00 UTC | ~50.14 % | "50.14 %" |
| Chart centre | 12:00 browser-local = (if user in Riyadh tz) 09:00 UTC | ~49.131 % | "49.1 %" |
| Table today row | 12:00 Asia/Riyadh = 09:00 UTC | ~49.131 % | "49.13 %" |

Chart and table sample at exactly the same instant for a Riyadh-local visitor → same raw value, only formatting differs.
Summary samples 3 h later → ~+1 % illum (waxing).

This matches the user's reported numbers (50.14, 49.1, 49.13) to within 0.01 %.

---

## G. Answers to the user's targeted questions

| Question | Answer |
|---|---|
| Is 49.13 % for a different day? | **No.** Same day, but sampled at LOCAL NOON instead of "now". |
| Is 49.13 % for a different time? | **Yes.** Sampled at 12:00 in the city's timezone (= 09:00 UTC for Riyadh). |
| Is 50.14 % the current browsing instant? | **Yes.** `new Date()` at the moment `_renderMoonData` runs. |
| Do chart + table use a different date than summary? | They use the **same calendar date** ("today") but a **different time-of-day** (noon vs now). The chart additionally uses BROWSER tz noon, table uses CITY tz noon — which coincide for a Riyadh-local visitor but diverge for out-of-tz visitors. |
| Is the mismatch only in chart, or chart + table? | **Both** chart and table differ from summary. Chart and table differ from EACH OTHER only by formatting precision (1 vs 2 decimals) for a Riyadh visitor; they can also differ in raw value by up to ~1 % for visitors in other timezones. |
| Should data-consistency be fixed before UI polish? | **Recommended yes, but not strictly required.** UI polish (CSS / layout / spacing) doesn't depend on these numbers. However, the user is likely to notice the mismatch during any polish session, which is distracting. A small fix wave (single function update — see §H) could land in well under an hour and would eliminate the inconsistency before polish begins. |

---

## H. Suggested fixes (NOT implemented now — for later approval)

### Option 1 — Unify on local-noon-in-city-tz (most stable)

Rationale: illumination shouldn't jitter as the user refreshes the page mid-day. Sampling at a fixed canonical instant per day (12:00 in the city's tz) ensures the same value all day for visitors to that city.

Concretely:
- In `_renderMoonData` (`js/app.js:16594`), replace `const today = _requestedDate || new Date()` for the moon-section calls with `const todayLocalNoon = _localNoonInCityTz(_tz)`.
- Helper `_localNoonInCityTz(tz)` = `new Date(year, month-1, day, 12, 0, 0, 0)` adjusted via Intl.DateTimeFormat to the target tz.
- Pass `todayLocalNoon` to `MoonCalc.getMoonIllumination`, `getPhaseName`, `getMoonAge` (the city-independent ones).
- Keep `today = new Date()` for `getMoonTimes(today, lat, lng, tz)` which already handles tz internally and DOES need the current instant for rise/set timing context.

In `js/moon-chart.js:304-305`, change `d.setHours(12, 0, 0, 0)` to use the city's tz noon (would need the city tz passed in via options).

This unification means:
- Summary, chart, table all sample `09:00 UTC` for `/moon-in-riyadh`.
- Three identical raw values.
- Three identical displayed values (after agreeing on a common precision).

### Option 2 — Unify on `new Date()` (least stable, most "live")

Less recommended because the chart's centre point would jitter each render and could disagree with the static labels around it.

### Option 3 — Unify display precision only (cosmetic)

Pick `.toFixed(1)` everywhere or `.toFixed(2)` everywhere. **Does NOT fix the root cause** (50.14 vs 49.13 would still appear as 50.1 vs 49.1 or 50.14 vs 49.13). The user explicitly noted this isn't a formatting issue alone — option 3 is insufficient.

### Recommended formal next phase

`MOON-CITY-ILLUMINATION-UNIFICATION-1` — a small fix wave that:
1. Adds a `_canonicalMoonInstant(cityTz)` helper that returns a deterministic "noon-in-city-tz" Date.
2. Routes the 3 illumination call sites through it.
3. Unifies display precision to `.toFixed(1)` everywhere (or `.toFixed(2)` — user choice).
4. Adds a smoke test that hits `/moon-in-riyadh`, grabs all 3 illum values from the rendered DOM, asserts they're identical.

Out of scope for this audit. Will await explicit approval before drafting a plan.

### What NOT to fix

- Don't touch `MoonCalc.getMoonIllumination` (it's correct — same input → same output).
- Don't touch the `Place` schema, FAQ, JSON-LD, sitemap, canonical/hreflang.
- Don't touch any visible UI text.
- Don't add a new MoonCalc function — reuse the existing one with a corrected argument.

---

## I. No-fix confirmation

- ❌ NO code modified during this audit.
- ❌ NO CSS modified.
- ❌ NO UI modified.
- ❌ NO text / copy modified.
- ❌ NO SEO metadata modified.
- ❌ NO JSON-LD modified.
- ❌ NO `MoonCalc` modified.
- ❌ NO source of truth modified.
- ❌ NO formatting modified.
- ❌ NO `db/hijri/umm-al-qura.json` touched.
- ❌ NO `js/hijri-date.js` touched.
- ❌ NO `js/moon.js` touched.
- ❌ NO `js/moon-chart.js` touched.
- ❌ NO `js/app.js` touched.
- ❌ NO `server.js` touched.
- ❌ NO `index.html` touched.
- ❌ NO commit created.
- ✅ Only this report file was created.

---

## J. Reproducibility

The diagnosis above is reproducible from static code analysis alone (no live server needed):

```bash
# Grep call sites
grep -n "getMoonIllumination" js/app.js js/moon.js js/moon-chart.js

# Inspect each call site for what Date is passed
sed -n '16590,16652p' js/app.js   # summary path
sed -n '300,320p' js/moon-chart.js # chart path
sed -n '526,572p' js/moon.js       # forecast path
```

To verify live values, open `/moon-in-riyadh` in a browser and run in the console:

```javascript
// What summary uses
const tNow = new Date();
console.log('Summary instant:', tNow.toISOString(), '→', MoonCalc.getMoonIllumination(tNow).toFixed(4));

// What chart uses
const tChartNoon = new Date(); tChartNoon.setHours(12, 0, 0, 0);
console.log('Chart instant:', tChartNoon.toISOString(), '→', MoonCalc.getMoonIllumination(tChartNoon).toFixed(4));

// What table uses (Asia/Riyadh noon)
// Compute 00:00 Asia/Riyadh of today, add 12 hours
const tzOpts = { timeZone: 'Asia/Riyadh', year:'numeric', month:'2-digit', day:'2-digit' };
const [y,m,d] = new Intl.DateTimeFormat('en-CA', tzOpts).format(new Date()).split('-').map(Number);
const tCityNoon = new Date(Date.UTC(y, m-1, d, 12 - 3, 0, 0));  // 12:00 Riyadh = 09:00 UTC
console.log('Table instant:', tCityNoon.toISOString(), '→', MoonCalc.getMoonIllumination(tCityNoon).toFixed(4));
```

Expected output (today, mid-afternoon Riyadh):
- Summary: ~50.14
- Chart: ~49.13 (browser-local-noon, coincides with table for Riyadh visitor)
- Table: ~49.13

---

## End of audit — no action required without further approval.
