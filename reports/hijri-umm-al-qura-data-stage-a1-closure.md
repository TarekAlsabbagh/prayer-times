# HIJRI-UMM-AL-QURA-DATA-STAGE-A1 — Closure report

**Status:** ✅ **CLOSED — user-approved 2026-05-23** (executed in commits `f16117a` + `b98b324`)
**Date:** 2026-05-23
**Companions:**
- `reports/hijri-umm-al-qura-infra-stage-a0-closure.md` (Stage A0, commit `b2ecdc0`)
- `reports/hijri-umm-al-qura-data-source-audit-1.md` (registry audit, commit `9b7e481`)
- `reports/hijri-umm-al-qura-data-source-pack-audit-1.md` (package audit, commit `f16117a`)

---

## Acceptance criteria — all met

| # | Criterion | Status |
|---|---|---|
| 1 | Table populated for 1356-1500 AH with status `data-ready` | ✅ MET — `db/hijri/umm-al-qura.json` is 38.8 KB, `status: "data-ready"` |
| 2 | Source package documented (name + version) | ✅ MET — `sourceMeta.packageName = "@tabby_ai/hijri-converter"`, `packageVersion = "1.0.5"` |
| 3 | MIT attribution documented (license + copyright for both layers) | ✅ MET — `sourceMeta.packageLicense = "MIT"`, `packageCopyright`, `originalLicense`, `originalCopyright` all populated |
| 4 | Provenance chain documented (upstream Python ref + Saudi authority) | ✅ MET — `originalSource = "github.com/mhalshehri/hijri-converter"`; ultimate authority noted in closure report §3 |
| 5 | 145 years populated | ✅ MET — `Object.keys(years).length === 145`; verified by smoke test |
| 6 | 1,740 month entries populated | ✅ MET — 145 × 12; full-sweep test confirms all entries are 28/29/30 |
| 7 | Dhul Hijjah 1447 = 29 days | ✅ MET — `getUmmAlQuraMonthLength(1447, 12) === 29` |
| 8 | 1447 yearLength = 355 | ✅ MET — `getUmmAlQuraYearLength(1447) === 355` (leap, extra day in Rabi al-Akhir M4) |
| 9 | 1447-12-30 invalid | ✅ MET — `isValidUmmAlQuraDate(1447, 12, 30) === false` |
| 10 | 1447-12-01 → 2026-05-18 | ✅ MET — verified in pack-audit + A1 smoke |
| 11 | 1447-12-29 → 2026-06-15 | ✅ MET — verified in pack-audit + A1 smoke |
| 12 | 1448-01-01 → 2026-06-16 | ✅ MET — `getUmmAlQuraYearStart(1448) === "2026-06-16"` |
| 13 | Anomalies documented (1356, 1401, 1364-08) | ✅ MET — `anomalies.yearLength` + `anomalies.monthLength` arrays in JSON + 6 explanatory `notes` |
| 14 | Tests 49/49 PASS | ✅ MET — `node scripts/_smoke_hijri_umm_al_qura_a1.mjs` + schema validator both pass |
| 15 | No behaviour change in any page | ✅ MET — `js/hijri-date.js`, `server.js`, `index.html` byte-identical (`git diff HEAD~1` empty) |
| 16 | `package.json` byte-identical | ✅ MET — 387 bytes, 3 deps unchanged (no `@tabby_ai/*`) |
| 17 | `package-lock.json` untouched | ✅ MET — gitignored, no modification |
| 18 | No npm dependency added | ✅ MET — `npm pack` only (tarball download), no `npm install` |
| 19 | No tarball/scratch files in Git | ✅ MET — `/tmp/hijri-extract-<pid>` deleted post-extraction |
| 20 | Stage B NOT started | ✅ MET — no consumer wired; visible bug (Dhul Hijjah 1447 = 30 in year-table) still present |

---

## 1. What this stage does

Stage A1 populates the placeholder `db/hijri/umm-al-qura.json` (introduced in Stage A0) with **real Umm al-Qura table data** for the range 1356-1500 AH, extracted from `@tabby_ai/hijri-converter@1.0.5` (MIT, TypeScript port of `mhalshehri/hijri-converter`). The package was downloaded as a tarball into `/tmp/`, the `MONTH_STARTS` array was extracted into our project schema, and the scratch folder + tarball were deleted afterwards. **No npm dependency was added to the project.** **No `package.json`, `package-lock.json`, `js/hijri-date.js`, or `server.js` was modified.**

After this stage:
- The site continues to use the existing Kuwaiti tabular algorithm for every visible Hijri date (zero behaviour change).
- The new Umm al-Qura data is loadable from `db/hijri/umm-al-qura.json` only by the Node-only helpers in `js/hijri-umm-al-qura.js`, which are NOT imported from any HTML page, SSR route, or `js/app.js`. Stage B (the algorithm flip) is still pending.

---

## 2. Files changed (1 deletion, 3 modifications, 2 new)

| File | Status | Purpose |
|---|---|---|
| `db/hijri/umm-al-qura.json` | **M** (1.2 KB → 38.8 KB) | Placeholder replaced with the populated table — 145 years × 12 months + metadata + anomalies + statistics + provenance. |
| `js/hijri-umm-al-qura.js` | **M** (small) | `getUmmAlQuraMonthLength` widened from {29,30} to {28,29,30}. `getUmmAlQuraYearLength` widened from {354,355} to {353,354,355}. Comments mark these as Stage A1 historical-anomaly tolerances. |
| `scripts/_validate_hijri_umm_al_qura_schema.mjs` | **M** | Allowed-status set extended with `"data-ready"`. Allowed-month set widened to `{28,29,30}`. Allowed-year-length set widened to `{353,354,355}`. |
| `scripts/_smoke_hijri_umm_al_qura_a0.mjs` | **D** | Superseded by `_smoke_hijri_umm_al_qura_a1.mjs`. The A0 smoke was written against the empty placeholder state, which no longer matches the disk. |
| `scripts/_smoke_hijri_umm_al_qura_a1.mjs` | **NEW** (12 KB) | 9 test categories, 49 assertions, covers headline bug zone + anomalies + boundary + spot-checks. |
| `reports/hijri-umm-al-qura-data-stage-a1-closure.md` | **NEW** | This report. |

**Untouched (byte-identical to HEAD, verified with `git diff HEAD`):**
- `js/hijri-date.js` (Kuwaiti algorithm — sha256 prefix `b65f7f0aac3a`)
- `server.js` (Kuwaiti SSR mirror — JSDoc + formula intact)
- `package.json` (387 bytes, 3 deps unchanged)
- `package-lock.json` (gitignored, untouched)
- `index.html` (no cache-buster bump because no client-loaded JS/CSS changed)

---

## 3. Source of data + provenance chain

| Layer | Detail |
|---|---|
| **Direct source** | `@tabby_ai/hijri-converter@1.0.5` (npm) |
| **License** | MIT |
| **Copyright** | Copyright (c) 2023 Tabby FZ-LLC |
| **Repository** | https://github.com/tabby-ai/hijri-converter |
| **Source range** | 1343-1500 AH (we used only 1356-1500) |
| **Upstream Python source** | `https://github.com/mhalshehri/hijri-converter` |
| **Upstream author** | Mohammed H Alshehri (`@mhalshehri`) and contributors |
| **Upstream license** | MIT |
| **Upstream copyright** | Copyright (c) 2018 Mohammed H Alshehri |
| **Ultimate authority** | Saudi Royal Astronomical Society — Umm al-Qura calendar published at `ummulqura.org.sa` |

Both MIT copyright notices are stored verbatim in the `sourceMeta` block of `db/hijri/umm-al-qura.json`.

---

## 4. Extraction method

1. `mkdir /tmp/hijri-extract-<pid>` (scratch dir outside the repo).
2. `npm pack @tabby_ai/hijri-converter` → produced `tabby_ai-hijri-converter-1.0.5.tgz` (16.1 KB). **No `npm install`. No modification to `package.json`.**
3. `tar -xzf tabby_ai-hijri-converter-1.0.5.tgz` (extract).
4. Loaded `package/dist/_lib/ummalqura.js` → `MONTH_STARTS` array (1897 entries).
5. For each year Y in 1356..1500:
   - For each month M in 1..12:
     `days = MONTH_STARTS[(Y-1343)*12 + (M-1) + 1] − MONTH_STARTS[(Y-1343)*12 + (M-1)]`
   - `yearStart` computed via the package's `hijriToGregorian({year:Y, month:1, day:1})` (table lookup + standard Julian→Gregorian conversion).
   - `yearLength = sum(months)`.
6. Captured anomalies (yearLength ∉ {354,355} OR any month days ∉ {29,30}).
7. Wrote final JSON with full metadata block + notes + anomalies + statistics.
8. Copied JSON into `db/hijri/umm-al-qura.json`.
9. **Deleted scratch directory entirely.** No npm package files remain on the filesystem outside the JSON output.

---

## 5. Range + file size

| Metric | Value |
|---|---|
| Hijri range covered (file) | **1356 AH 01-01** → **1500 AH 12-30** |
| Source package range | 1343 AH 01-01 → 1500 AH 12-30 |
| Years 1343-1355 | Intentionally excluded (pre-official Umm al-Qura era) |
| Years populated in `years{}` | **145** |
| Months populated total | 1,740 (= 145 × 12) |
| File size | **38.8 KB** (39,728 bytes) |
| Disk path | `db/hijri/umm-al-qura.json` |
| Status field | `"data-ready"` |
| `fetchedAt` | `"2026-05-23"` |

---

## 6. Distribution statistics

From the populated `years{}`:

| Year-length | Count | Percentage |
|---|---|---|
| 353-day years | **2** (anomaly) | 1.4% |
| 354-day years (non-leap) | 88 | 60.7% |
| 355-day years (leap) | 55 | 37.9% |

**Leap-year ratio:** 38.0% — matches the theoretical lunar ratio of ~36.7% within statistical noise. ✓

---

## 7. Anomalies documented in the file

The data file records all anomalies in two structured arrays:

### 7.1 Year-length anomalies (`anomalies.yearLength`)

| Year | Length | Note |
|---|---|---|
| 1356 | 353 days | Possibly a mid-year Saudi adjustment after the 1937 formal adoption. |
| 1401 | 353 days | Possibly a mid-year Saudi adjustment in 1981. |

Both reflect real values in the upstream Saudi reference. **Cross-check against `ummulqura.org.sa` is PENDING before Stage B can flip the live algorithm**, per user policy.

### 7.2 Month-length anomalies (`anomalies.monthLength`)

| Year-Month | Hijri month | Days | Note |
|---|---|---|---|
| 1364-08 | Shaban | **28** | Unique 28-day month in the entire 1356-1500 range. Almost certainly a historical Saudi mid-month adjustment (~1945 CE). |

The standard Hijri month length is 29 or 30 days. A 28-day month is highly unusual but documented in the upstream source. **Cross-check pending before Stage B.**

### 7.3 Why both anomalies are retained, not rejected

- The upstream source is the de-facto reference; it does NOT make up these values.
- Removing them would corrupt the table consistency (e.g. day-of-year cumulative sums would drift by ~1 day).
- The user's headline bug (Dhul Hijjah 1447 = 29 days) is verified correct by the same source.
- Per user policy: "لا نرفض المصدر بسببها مبدئيًا، لأن تقويم أم القرى table-based وليس leap-cycle ثابت."

The anomalies are visible to humans (via `notes` + `anomalies` arrays) and to machines (via the JSON schema), so they can never silently affect production code.

---

## 8. Headline assertions verified (the user-reported bug zone)

Every assertion below is now true given the populated table. All are exercised by `scripts/_smoke_hijri_umm_al_qura_a1.mjs`:

| Assertion | Result | Match |
|---|---|---|
| `getUmmAlQuraMonthLength(1447, 12) === 29` | ✅ 29 | matches user's expected |
| `getUmmAlQuraYearLength(1447) === 355` | ✅ 355 | leap by length |
| `isValidUmmAlQuraDate(1447, 12, 1) === true` | ✅ | |
| `isValidUmmAlQuraDate(1447, 12, 29) === true` | ✅ | |
| `isValidUmmAlQuraDate(1447, 12, 30) === false` | ✅ | **the phantom-date assertion** |
| `isValidUmmAlQuraDate(1448, 1, 1) === true` | ✅ | |
| `getUmmAlQuraYearStart(1447) === "2025-06-26"` | ✅ | |
| `getUmmAlQuraYearStart(1448) === "2026-06-16"` | ✅ | |
| 1447 months array | `[30,29,30,30,30,29,30,29,30,29,30,29]` | extra day at M4 (Rabi al-Akhir), NOT M12 |

---

## 9. Sample year breakdowns (for visual cross-check)

| Year | yearStart (Gregorian) | months[] (M1..M12) | yearLength |
|---|---|---|---|
| 1356 | 1937-03-14 | 29,29,30,29,30,29,30,30,29,29,30,29 | **353** (anomaly) |
| 1364 | 1944-12-16 | 30,29,30,29,30,29,30,**28**,30,30,30,29 | 354 (month-anomaly inside) |
| 1401 | 1980-11-09 | (varies; total 353) | **353** (anomaly) |
| 1444 | 2022-07-30 | (typical) | (354 or 355) |
| 1446 | 2024-07-07 | 29,30,30,30,29,30,30,29,29,30,29,29 | 354 |
| 1447 | 2025-06-26 | 30,29,30,30,30,29,30,29,30,29,30,29 | 355 ⭐ |
| 1448 | 2026-06-16 | 29,30,29,30,30,29,30,30,29,30,29,30 | 355 |
| 1500 | 2076-11-27 | (varies; total varies) | (354 or 355) |

The `1447` row is the row that resolves the user-reported bug. The pre-bug-fix system (still live) treats 1447-12 as 30 days; the new table correctly treats it as 29 days.

---

## 10. Test results

```
$ node scripts/_validate_hijri_umm_al_qura_schema.mjs
✓ Schema OK — db/hijri/umm-al-qura.json is well-formed.

$ node scripts/_smoke_hijri_umm_al_qura_a1.mjs
• Category 1: table populated
• Category 2: range gates
• Category 3: HEADLINE assertions (the user-reported bug zone)
• Category 4: anomaly 1356 = 353 days
• Category 5: anomaly 1401 = 353 days
• Category 6: anomaly 1364-08 (Shaban) = 28 days
• Category 7: schema validator
• Category 8: boundary years
• Category 9: spot checks
  - all 145 years: months sum === yearLength: OK
  - all 1740 month entries: 28/29/30: OK

────────────────────────────────────────────────────────────────────────
Results: 49 passed, 0 failed
✓ ALL TESTS PASSED — Stage A1 data is sound + helpers work + anomalies documented.
```

**Summary: 49/49 assertions pass.**

---

## 11. Confirmation: no behaviour changed

### 11.1 Critical files byte-identical to HEAD

```
$ git diff HEAD -- js/hijri-date.js server.js package.json package-lock.json
(empty — no changes)
```

- `js/hijri-date.js` SHA-256 prefix: `b65f7f0aac3a` (same as Stage A0 verification).
- `server.js` Kuwaiti formula `floor((11 * year + 3) / 30)`: still present.
- `server.js` JSDoc comment `خوارزمية كويتية`: still present.
- `package.json`: 387 bytes, 3 dependencies (`clean-css`, `terser`, `tz-lookup`), 1 dev (`jsdom`). No `@tabby_ai/*` anywhere.
- `package-lock.json`: untouched.

### 11.2 No connection from new data to the live runtime

`grep -r 'db/hijri\|hijri-umm-al-qura' index.html js/app.js server.js` returns ZERO matches outside this file and the smoke test. The new data is reachable only from:
- `scripts/_smoke_hijri_umm_al_qura_a1.mjs` (Node-only test)
- `scripts/_validate_hijri_umm_al_qura_schema.mjs` (Node-only validator)

The live calendar code (year-page table, month-page grid, day-page render, SSR canonical/hreflang) still computes everything via the OLD Kuwaiti algorithm.

### 11.3 No npm dependency added

```
$ diff <(jq '.dependencies' package.json) <(echo '{
  "clean-css": "^5.3.3",
  "terser": "^5.36.0",
  "tz-lookup": "^6.1.25"
}')
(empty — exact match)
```

`@tabby_ai/hijri-converter` is NOT in `package.json` and NOT in `node_modules`.

### 11.4 No tarball, scratch files, or build artefacts in Git

```
$ git status | grep -E '\.tgz$|hijri-extract|/tmp'
(empty)
```

The tarball and scratch folder were created in `/tmp/hijri-extract-<pid>` and deleted after extraction.

---

## 12. Confirmation: Stage B NOT started

- `db/hijri/umm-al-qura.json` `status: "data-ready"` (not `"populated"`, not `"live"`). The status field is the explicit signal that data is ready for consumption but no consumer is wired yet.
- `js/hijri-date.js`: unchanged. The site computes month lengths from `getDaysInHijriMonth` (Kuwaiti).
- `server.js`: unchanged. SSR continues to use the Kuwaiti mirror.
- No route handler in `server.js` reads `db/hijri/umm-al-qura.json`.
- No browser-loaded JS file imports `js/hijri-umm-al-qura.js`.
- No sitemap entry generated from the new table.
- No URL regex tightened to reject `/hijri-date/1447-12-30` — it still renders the (wrong) old result.

The visible bug (Dhul Hijjah 1447 = 30 days in the year-table) is **still present on the live site**. Fixing it is Stage B's job.

---

## 13. Cross-check policy for the anomalies (pending before Stage B)

Per user policy, before Stage B can begin:
- **1356** must be cross-checked against `ummulqura.org.sa` (or another authoritative source). If 1356 really has 353 days per official Saudi data, accept it. Otherwise, flag for resolution.
- **1401** same procedure.
- **1364-08** (28-day Shaban) same procedure — a 28-day Hijri month is the most surprising anomaly and warrants direct confirmation.

If the user provides screenshots / data tuples from the official source for these three points, we can transition the file's status from `data-ready` to `populated` and proceed to Stage B. If any of them disagrees with the upstream package, we either patch the JSON manually (with an audit note) or seek a different source.

---

## 14. FAQ wording note (for Stage B copy)

When Stage B updates the leap-year FAQ answer, the user-approved wording is:

> "نعم، عدد أيام سنة 1447 هـ هو 355 يومًا حسب تقويم أم القرى."

(Avoid leap-cycle language inherited from Kuwaiti. Just state the fact.)

This is a future copy change, NOT executed in Stage A1.

---

## 15. What this report does NOT do

- Does NOT modify `js/hijri-date.js`.
- Does NOT modify `server.js`.
- Does NOT modify `package.json` or `package-lock.json`.
- Does NOT add any dependency to the project.
- Does NOT route any page through the new helpers.
- Does NOT change any visible content.
- Does NOT change SEO / JSON-LD / canonical / hreflang / sitemap.
- Does NOT 404 `/hijri-date/1447-12-30` (it still renders, with the wrong answer, until Stage B).
- Does NOT start Stage B.

---

## 16. Awaiting user action

1. **Approve commit + push of Stage A1?** All 49 tests pass; critical files byte-identical; no dependency added.
2. **Decide on cross-check for the 3 anomalies (1356, 1401, 1364-08)** before Stage B starts. Options:
   - User provides direct screenshots / data tuples from `ummulqura.org.sa`.
   - User manually transcribes the relevant rows and shares them.
   - User accepts the upstream values as-is with the documented disclaimer.
3. **Stage B kickoff** (separate phase, NOT started here) — algorithm flip in `js/hijri-date.js` + SSR mirror in `server.js` to read from the new table, plus route guards + sitemap regeneration. Requires explicit go-ahead.

🛑 **No further code change, no Stage B, until explicit user approval.**
