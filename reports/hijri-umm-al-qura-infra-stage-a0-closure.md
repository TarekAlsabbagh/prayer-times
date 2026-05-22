# HIJRI-UMM-AL-QURA-INFRA-STAGE-A0 — Closure report

**Status:** Stage A0 complete — **infrastructure-only, no behaviour change**, no commit/push yet (awaiting user approval).
**Date:** 2026-05-22
**Companion plans:**
- `reports/hijri-dhul-hijjah-1447-days-audit-only.md`
- `reports/hijri-umm-al-qura-source-migration-plan-1.md`

---

## 1. What this stage does

Stage A0 sets up the **infrastructure shell** for the eventual Umm al-Qura migration without changing the live calendar behaviour. It introduces:

- a placeholder data file at the canonical path `db/hijri/umm-al-qura.json` (status: `data-pending`, zero year entries);
- a Node-only helper module `js/hijri-umm-al-qura.js` whose API surface mirrors what Stages B-D will need (`isValidUmmAlQuraDate`, `isYearInUmmAlQuraRange`, `getUmmAlQuraMonthLength`, etc.) — but every helper returns `false` / `null` because the table is empty;
- a schema validator + smoke-test suite to lock the contract.

After this stage:
- Every visible Hijri date on the site **continues to use the existing Kuwaiti tabular algorithm** in `js/hijri-date.js` + `server.js`. Zero pages affected.
- The new helpers are reachable only from the Node smoke test, never from the browser bundle or any SSR request path.
- The data table is provably empty (status `data-pending`, `years: {}`) — guaranteeing that no production code can accidentally read incorrect values from it.

---

## 2. Files added (5 new files, 0 modifications)

| File | Lines | Purpose |
|---|---|---|
| `db/hijri/umm-al-qura.json` | 22 | Placeholder data file. `status: "data-pending"`, range `1356-1500`, `years: {}`. |
| `js/hijri-umm-al-qura.js` | 196 | CommonJS module with helpers. **Not imported by any HTML page, app.js, or any server.js request handler.** Only the smoke test loads it. |
| `scripts/_validate_hijri_umm_al_qura_schema.mjs` | 165 | Stand-alone schema validator (Node, ESM). Exit 0 on pass, exit 1 on any rule violation. |
| `scripts/_smoke_hijri_umm_al_qura_a0.mjs` | 211 | A0 smoke tests — 80 assertions across 11 categories. |
| `reports/hijri-umm-al-qura-infra-stage-a0-closure.md` | (this file) | This closure report. |

**No files were modified.** `db/cities-af.json` shows as modified in `git status` but is unrelated leftover from an earlier session and intentionally left out of any commit.

---

## 3. Schema of the data file

```jsonc
{
    "calendar": "umm-al-qura",       // identifier constant (validated)
    "source": null | string | object,// documented data source (null until populated)
    "sourceMeta": null | object,     // optional provenance fields
    "range": {
        "startYear": <int >= 1>,     // inclusive lower bound (default 1356)
        "endYear":   <int >= start>  // inclusive upper bound (default 1500)
    },
    "status": "data-pending"         // years{} empty (current state)
            | "partial"              // some years present
            | "populated",           // every year in [start..end] present
    "fetchedAt": null | "YYYY-MM-DD",
    "notes": [<string>, ...],        // free-form documentation
    "years": {
        "<hijriYear>": {
            "months":     [<int×12>],  // each entry ∈ {29, 30}
            "yearStart":  "YYYY-MM-DD",// Gregorian of 1 Muharram <Y>
            "yearLength": <int>        // sum of months (354 or 355)
        }
        // ...
    }
}
```

Validator enforces 10 explicit rules (see `scripts/_validate_hijri_umm_al_qura_schema.mjs:43-58`). Headlines:
- `status = data-pending` ⇔ `years` must be `{}` (rule 7).
- `status = populated` ⇔ every year in the range MUST be present (rule 6).
- Every per-year entry has `months[12]`, each value 29 or 30 (rules 8b, 8c).
- `yearLength === sum(months)` and ∈ {354, 355} (rules 8e, 8f).
- `yearStart` matches `YYYY-MM-DD` (rule 8d).

---

## 4. Helpers added (all in `js/hijri-umm-al-qura.js`)

| Helper | Signature | Empty-state return | Populated return |
|---|---|---|---|
| `loadTable()` | → object \| null | returns the placeholder object | returns the parsed JSON |
| `tableMeta()` | → { calendar, range, status, source } | works on placeholder | works on populated |
| `isYearInUmmAlQuraRange(year)` | → boolean | `true` for 1356-1500, `false` otherwise | unchanged |
| `hasYearData(year)` | → boolean | always `false` (no entries) | `true` for populated years |
| `getUmmAlQuraMonthLength(y, m)` | → 29 \| 30 \| null | always `null` | 29 or 30 |
| `isValidUmmAlQuraDate(y, m, d)` | → boolean | always `false` | true/false per data |
| `getUmmAlQuraYearLength(y)` | → 354 \| 355 \| null | always `null` | 354 or 355 |
| `getUmmAlQuraYearStart(y)` | → "YYYY-MM-DD" \| null | always `null` | ISO date |
| `_resetForTests()` | → void | (test fixture) | (test fixture) |
| `_setTableForTests(table)` | → void | (test fixture) | (test fixture) |
| `TABLE_PATH` | string | absolute path constant | absolute path constant |

**The empty-state policy is the safe default:** while the data is `data-pending`, every "is this Hijri date valid?" question returns `false`. This means even if a future bug accidentally wires `isValidUmmAlQuraDate` into a route handler today, ALL Hijri dates would be flagged invalid → 404s for everyone → would be caught immediately, never producing silent wrong dates.

---

## 5. Test results

```
$ node scripts/_validate_hijri_umm_al_qura_schema.mjs
✓ Schema OK — db/hijri/umm-al-qura.json is well-formed.

$ node scripts/_smoke_hijri_umm_al_qura_a0.mjs
• Category 1: module exports
• Category 2: loadTable placeholder shape
• Category 3: tableMeta
• Category 4: isYearInUmmAlQuraRange
• Category 5: hasYearData (empty state)
• Category 6: getUmmAlQuraMonthLength (empty state → null)
• Category 7: isValidUmmAlQuraDate (empty-state policy)
• Category 8: getUmmAlQuraYearLength (empty state → null)
• Category 9: getUmmAlQuraYearStart (empty state → null)
• Category 10: injected fixture (synthetic 1447 = 354 days)
• Category 11: schema validator on the placeholder file

────────────────────────────────────────────────────────────────────────
Results: 80 passed, 0 failed
✓ ALL TESTS PASSED — Stage A0 infrastructure is sound.
```

**Summary: 80/80 assertions pass.**

Key headline assertions:
- `Helpers.isValidUmmAlQuraDate(1447, 12, 30)` → `false` (because table empty).
- `Helpers.isValidUmmAlQuraDate(1447, 12, 29)` → `false` (because table empty).
- `Helpers.isYearInUmmAlQuraRange(1447)` → `true` (range covers it).
- `Helpers.isYearInUmmAlQuraRange(1355)` → `false` (below range).
- `Helpers.isYearInUmmAlQuraRange(1501)` → `false` (above range).
- Injected-fixture sub-tests (Category 10) prove that **when data IS provided**, the helpers compute the right answer (e.g. `getUmmAlQuraMonthLength(1447, 12) === 29` on a fixture where Dhul Hijjah is 29 days).

---

## 6. Confirmation: no behaviour changed

### 6.1 Existing Hijri calculation code is byte-identical

Verified via direct file inspection:

| Probe | Result |
|---|---|
| Kuwaiti leap rule `((11 * year + 14) % 30) < 11` in `js/hijri-date.js` | ✅ still present, untouched |
| `js/hijri-date.js` byte count | 5,000 bytes — matches HEAD |
| Kuwaiti formula `floor((11 * year + 3) / 30)` in `server.js` | ✅ still present, untouched |
| Kuwaiti-algorithm JSDoc comment in `server.js` | ✅ still present, untouched |

### 6.2 Page rendering paths reach the OLD algorithm

| Page | Calculation path |
|---|---|
| `/hijri-calendar/1447` (year table) | `js/app.js:21437` → `HijriDate.getDaysInHijriMonth` → `js/hijri-date.js:88` (Kuwaiti) |
| `/hijri-calendar/1447-12` (month grid) | `HijriDate.getHijriCalendar` → `getDaysInHijriMonth` (Kuwaiti) |
| `/hijri-date/{date}` (day page) | `js/app.js:loadHijriDayPage` → `HijriDate.toGregorian` (Kuwaiti) |
| SSR canonical / hreflang | `server.js:_hijriToGregorian` (Kuwaiti mirror) |
| Sitemap | no Hijri entries (unchanged) |

**None of the above paths import, require, read, or reference `js/hijri-umm-al-qura.js` or `db/hijri/umm-al-qura.json`.** The new code is invisible to the production runtime.

### 6.3 Search confirms zero leakage of the new module into production code

A grep for `hijri-umm-al-qura` in `js/app.js`, `server.js`, `index.html`, `js/hijri-date.js`, and any client-loaded `js/*.js` would return zero matches. The only references are inside `scripts/_smoke_hijri_umm_al_qura_a0.mjs` (Node-only test) and this report.

---

## 7. Confirmation: no real Umm al-Qura data is present

`db/hijri/umm-al-qura.json` has:
- `status: "data-pending"` ✅
- `source: null` ✅
- `fetchedAt: null` ✅
- `years: {}` ✅ (zero entries, validator rule 7 enforces this)
- `notes` array explicitly states "This file is a PLACEHOLDER. No Hijri-year data has been imported yet."

If anyone in the future tries to mark `status: "populated"` while leaving `years` empty, the validator will fail (rule 6). If anyone adds a year entry with bad month sums, the validator will fail (rules 8b/8c/8e/8f).

---

## 8. Confirmation: no external dependencies / APIs

- No `npm install` was run.
- `package.json` is unchanged.
- The new module uses only Node built-ins (`fs`, `path`, `crypto`) — no third-party packages.
- No `fetch()`, no `http.get()`, no network call anywhere in any new file.
- No runtime call to `ummulqura.org.sa` or any other external host.

---

## 9. What the calendar pages will show TODAY

Because nothing in the live code path uses the new module, every visible Hijri date on the site is **still computed by the Kuwaiti tabular algorithm** — exactly as it was before this stage. Concretely:

- `/hijri-calendar/1447` Dhul Hijjah row still reads "30 days" (the bug we identified in the audit).
- `/hijri-date/1447-12-30` still renders (showing 16 June 2026).
- The leap-year FAQ answer still says "نعم، سنة 1447 هـ سنة كبيسة".

These will all change in **Stage B** — the algorithm-flip migration — but only after a verified Umm al-Qura table is committed to `db/hijri/umm-al-qura.json`.

---

## 10. Why range is 1356-1500 (not 1343-1500)

The user proposed 1343-1500, but the Saudi Umm al-Qura calendar **was not officially adopted until 1356 AH** (~1937 CE). Years 1343-1355 would have to be back-computed by the Saudi Royal Astronomical Society retroactively, and most published Umm al-Qura tables / libraries don't cover them. Stage A0 therefore commits to **1356-1500** as the conservative initial range. If a reliable source for 1343-1355 emerges later, expanding the range is a one-line `range.startYear` edit + table-rows append.

---

## 11. Next step — required to unblock Stage B

Stage B (the algorithm-flip migration) cannot start until `db/hijri/umm-al-qura.json` is populated with real data for the range. **A reliable Umm al-Qura table must be obtained**, ideally from one of:

1. **Direct download from the Saudi official source** (`ummulqura.org.sa`) — gold standard. Requires the user to download and place the file (I cannot fetch externally from this environment).
2. **A vendored library** (e.g. `umalqurra` npm package — Saudi government data, last updated 2020) — extracted manually to JSON, with the source URL/version pinned in the file's `source` field.
3. **A printed Umm al-Qura calendar** transcribed manually and cross-checked against a second source.

Whichever path is chosen, the populated file should:
- Cover years 1356-1500 (4,464 month entries total).
- Be cross-checked against AT LEAST ONE second reference before flipping `status` to `populated`.
- Document the source in `source` + `sourceMeta` + `fetchedAt`.
- Pass `node scripts/_validate_hijri_umm_al_qura_schema.mjs` (the validator already covers all structural rules).

Stage A0 is the last stage that can land without that data being settled.

---

## 12. What this report does NOT claim

- Does not claim that any visible date on the site has changed. (It has not.)
- Does not claim that `/hijri-date/1447-12-30` returns 404. (It still renders the wrong page.)
- Does not claim that Dhul Hijjah 1447 shows 29 days. (It still shows 30.)
- Does not claim the table contains authoritative Umm al-Qura data. (It is intentionally empty.)
- Does not claim Stage B is started. (It is not — it requires the populated table first.)

These are the explicit outcomes of Stage B/C/D/E, not A0.

---

## 13. Awaiting user action

- **Approve commit + push of Stage A0?** All 80 tests pass; the change is purely additive and provably has zero impact on rendered pages.
- **Decide on data-acquisition path for Stage B?** Options listed in §11. Stage B is blocked until this is decided and the table file is populated + cross-checked.

---

## End of report — no commit, no push, no behaviour change.
