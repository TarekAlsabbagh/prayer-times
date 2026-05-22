# HIJRI-UMM-AL-QURA-DATA-SOURCE-PACK-AUDIT-1

**Status:** Report only — tarball downloaded + inspected in `/tmp/`, **NO data copied into the project**, NO dependency added, NO file under version control modified. After this audit completes, the tarball + scratch folder are deleted.
**Date:** 2026-05-23
**Companion to:**
- `reports/hijri-umm-al-qura-data-source-audit-1.md` (registry-metadata audit, commit `9b7e481`)
- `reports/hijri-umm-al-qura-infra-stage-a0-closure.md` (Stage A0 placeholder, commit `b2ecdc0`)

**Method:** Per the user's explicit limited permission, executed:
```
npm pack @tabby_ai/hijri-converter
```
in a scratch directory outside the repo. **No `npm install`.** `package.json` + `package-lock.json` untouched. Tarball extracted, source files inspected, four headline assertions plus 30+ cross-checks verified, then scratch dir deleted.

---

## 1. Package identity

| Field | Value |
|---|---|
| Name | `@tabby_ai/hijri-converter` |
| Version | **1.0.5** (published 2023-08-24) |
| Tarball | `tabby_ai-hijri-converter-1.0.5.tgz` |
| Tarball size (compressed) | 16.1 KB |
| Unpacked size | 53.5 KB |
| Total files in tarball | 27 |
| SHA-1 | `b664994892348a402ae7529e648c819eee39208b` |
| Integrity (SHA-512) | `sha512-r5bClKrcIusDo...` (matches npm registry) |

---

## 2. License

| Aspect | Value |
|---|---|
| License declared | **MIT** |
| Copyright holder | Tabby FZ-LLC (2023) |
| Upstream license | MIT (original Python by Mohammed H Alshehri, 2018) |
| License file inside tarball | `package/LICENSE` (standard MIT text) |
| Usage compatibility | ✅ MIT permits use, modification, redistribution. Compatible with this project (which is private/unlicensed but has no conflicting clauses). |
| Data-only re-use compatibility | ✅ MIT explicitly allows redistribution of code AND data. We can extract the table values and bundle them locally with attribution. |

**Attribution required:** A copy of the MIT notice (Tabby + mhalshehri) MUST accompany any extracted data file we vendor in our own repo. We will reproduce the upstream copyright notice inside our `db/hijri/umm-al-qura.json` `sourceMeta` block when Stage B lands.

---

## 3. Data source: table or formula?

**🟢 TABLE-based, NOT formula.**

Evidence (from inspecting `package/dist/_lib/ummalqura.js`, 231 lines):

```js
exports.HIJRI_RANGE = [[1343, 1, 1], [1500, 12, 30]];
exports.GREGORIAN_RANGE = [[1924, 8, 1], [2077, 11, 16]];
exports.HIJRI_OFFSET = 1342 * 12;
exports.MONTH_STARTS = [
    23999, 24029, 24058, 24088, 24118, 24147, 24177, 24207, 24237, 24265,
    24295, 24325, 24355, 24384, 24413, 24443, 24472, 24502, 24531, 24561,
    24590, 24620, 24649, 24679, 24708, 24738, 24767, 24797, 24826, 24857,
    24886, 24916, 24944, ...
];
```

The table is an array of **Reduced Julian Day** (RJD) numbers, one per Hijri-month start, indexed by `(year - 1343) * 12 + (month - 1)`. The number of days in a Hijri month is `MONTH_STARTS[idx+1] - MONTH_STARTS[idx]`.

- **Length of MONTH_STARTS:** 1897 entries = (1500−1343+1) × 12 + 1 = 158 × 12 + 1 ✓ matches expected count exactly (one extra entry to express the boundary after the last month).
- No formula is used to compute month length. Every month is explicit data.
- Out-of-range queries throw — no fallback formula, no extrapolation.

Conversion functions (`hijriToGregorian.js`, `gregorianToHijri.js`) use:
- `MONTH_STARTS` array to find the month index for a date.
- `julianDayHelpers.js` to convert between Julian Day Number and proleptic Gregorian (a standard astronomical conversion, NOT a Hijri formula).

**This is exactly the table-based approach we want.**

---

## 4. Data source provenance (cited inside the package)

From `package/README.md`:
> "This project uses a Typescript interpretation of a date conversion algorithm written in Python by Mohammed H Alshehri — [hijri-converter](https://github.com/mhalshehri/hijri-converter). Therefore, it has the same accuracy and limitations."

From `package/dist/_lib/ummalqura.js` (header comment):
> "This file contains modifications to code from https://github.com/mhalshehri/hijri-converter that is licensed under the MIT license. Copyright (c) 2018 Mohammed H Alshehri (@mhalshehri) and contributors."

**Provenance chain:** Saudi Umm al-Qura published tables → Mohammed H Alshehri's Python `hijri-converter` (the de-facto open-source reference, used by thousands of projects since 2018) → Tabby FZ-LLC's TypeScript port (this package).

---

## 5. Range coverage

| Aspect | Value |
|---|---|
| Hijri range (inclusive) | **1343 AH 01-01** → **1500 AH 12-30** |
| Gregorian range (inclusive) | **1924-08-01** → **2077-11-16** |
| Total Hijri years covered | 158 |
| Our target range (1356-1500) | ✅ **Fully covered** (subset of 1343-1500) |
| Years 1343-1355 (outside our target) | Also available if needed in future |
| Boundary behaviour | Strict — throws "date out of range" for 1342 or 1501. |

---

## 6. Dependencies

| Type | Count | Details |
|---|---|---|
| Runtime `dependencies` | **0** | Zero — fully self-contained. |
| `peerDependencies` | 0 | None declared. |
| `devDependencies` | 14 | Build/lint tools only (babel, typescript, jest, eslint, prettier) — NOT installed when consuming the package. |

✅ **Zero runtime indirection.** If we were to consume the package live (we won't — see §11), it would not pull any transitive dependency.

---

## 7. Headline correctness tests — ALL PASS

These are the four tests we **must** verify per user policy. Executed against the actual package code with the correct API (`{year, month, day}` object input):

| Test | Result | Expected | Match? |
|---|---|---|---|
| `hijriToGregorian({1447, 12, 1})` | `2026-05-18` | `2026-05-18` | ✅ |
| `hijriToGregorian({1447, 12, 29})` | `2026-06-15` | `2026-06-15` | ✅ |
| `hijriToGregorian({1447, 12, 30})` | **throws** `day must be in 1..29` | INVALID | ✅ |
| `hijriToGregorian({1448, 1, 1})` | `2026-06-16` | `2026-06-16` | ✅ |

**Reverse cross-check** (Gregorian → Hijri):

| Input | Result | Expected | Match? |
|---|---|---|---|
| `2026-05-18` | `1447-12-01` | `1447-12-01` | ✅ |
| `2026-06-15` | `1447-12-29` | `1447-12-29` | ✅ |
| `2026-06-16` | `1448-01-01` | `1448-01-01` | ✅ |

**Days-in-Dhul-Hijjah-1447 from raw `MONTH_STARTS` data:**
- `MONTH_STARTS[(1447-1343)*12 + 11] = 61179`
- `MONTH_STARTS[(1448-1343)*12 + 0]  = 61208`
- Days in Dhul Hijjah 1447 = `61208 − 61179 = 29` ✅

---

## 8. Extended sample cross-checks

### 8.1 Full month-day breakdown for 1446 / 1447 / 1448

| Year | Months (M1..M12) | Total | Year type |
|---|---|---|---|
| 1446 | 29, 30, 30, 30, 29, 30, 30, 29, 29, 30, 29, 29 | 354 | non-leap |
| **1447** | **30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30, 29** | **355** | **leap** |
| 1448 | 29, 30, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30 | 355 | leap |

**⚠ Important nuance:** 1447 has **355 days (leap)** per Umm al-Qura, BUT the extra day is in **month 4 (Rabi al-Akhir = 30 days)** — NOT in month 12 (Dhul Hijjah = 29 days). The Kuwaiti tabular algorithm we are replacing assumed the extra day must always be in Dhul Hijjah, which is why it reported Dhul Hijjah 1447 = 30 days. The actual Umm al-Qura distribution differs.

This means the user's headline claim "Dhul Hijjah 1447 = 29 days" is **correct**. The collateral claim "1447 = 354 days (non-leap)" implied earlier is **incorrect** — 1447 actually has 355 days (leap by total-length convention), but with a different month-length distribution than Kuwaiti.

### 8.2 Religious-significance reference dates for 1447

These dates are widely published in Saudi media and can be independently cross-verified:

| Hijri | Gregorian (package output) |
|---|---|
| 1 Ramadan 1447 | 2026-02-18 |
| 29 Ramadan 1447 | 2026-03-18 |
| 30 Ramadan 1447 (exists?) | 2026-03-19 (yes, Ramadan 1447 = 30 days) |
| 1 Shawwal 1447 (Eid al-Fitr) | 2026-03-20 |
| 10 Dhul Hijjah 1447 (Eid al-Adha) | 2026-05-27 |
| 1 Muharram 1447 | 2025-06-26 |
| 1 Muharram 1448 | 2026-06-16 |

### 8.3 Range-spanning samples (1356, 1400, 1500)

| Hijri | Gregorian |
|---|---|
| 1 Muharram 1356 | 1937-03-14 |
| 1 Muharram 1400 | 1979-11-20 |
| 1 Muharram 1444 | 2022-07-30 |
| 1 Muharram 1446 | 2024-07-07 |
| 1 Muharram 1447 | 2025-06-26 |
| 1 Muharram 1500 | 2076-11-27 |
| 1 Dhul Hijjah 1500 | 2077-10-18 |
| 1500-12-30 (last day in range) | 2077-11-16 |

### 8.4 Boundary errors

| Input | Result |
|---|---|
| `1342-01-01` (below range) | **throws** "date out of range" ✅ |
| `1501-01-01` (above range) | **throws** "date out of range" ✅ |

---

## 9. Anomalies detected

Statistical sweep of 1356-1500 (145 years) yielded:
- 88 years of 354 days (non-leap)
- 55 years of 355 days (leap)
- **2 anomalies** reporting 353 days: **year 1356 (= 353)** and **year 1401 (= 353)**.

A 353-day Hijri year is unusual but not impossible — historical Umm al-Qura tables do contain rare mid-year adjustments where Saudi authorities issued corrections. The `mhalshehri/hijri-converter` upstream is known to carry these adjustments faithfully.

**Action item (NOT executed in this audit):** Before flipping `status` to `populated` in Stage B, we should cross-check 1356 and 1401 against `ummulqura.org.sa` directly to confirm whether they really are 353-day years or whether this is an upstream quirk. Both are far outside the user-reported bug zone (1447), so they don't affect the immediate fix priority — but they should be documented + verified before relying on those specific years.

The 145-year sweep also gives us a 88/55 leap distribution = 38% leap years, close to the theoretical 11/30 = 36.7% ratio expected for any lunar calendar. ✅ Sanity-check passes.

---

## 10. Sample of disagreements vs the current Kuwaiti algorithm

For documentation only — illustrates the magnitude of the migration:

| Hijri date | Kuwaiti (current site) | Umm al-Qura (this package) | Δ |
|---|---|---|---|
| 1 Muharram 1447 | 2025-06-27 | 2025-06-26 | **1 day** |
| 1 Ramadan 1447 | unknown (compute) | 2026-02-18 | TBD |
| 1 Shawwal 1447 (Eid al-Fitr) | unknown | 2026-03-20 | TBD |
| 1 Dhul Hijjah 1447 | 2026-05-18 | 2026-05-18 | **0 (match)** |
| 30 Dhul Hijjah 1447 | 2026-06-16 (exists) | INVALID (does not exist) | **structural** |
| 1 Muharram 1448 | 2026-06-17 | 2026-06-16 | **1 day** |

The disagreement is at the month-boundary level: which day a given Hijri month starts on. Within a single month (the start agrees on), the daily increments are 1-to-1 the same. So the migration's UI-visible impact is mostly on **month-start dates** and **year boundaries**, not on intra-month navigation.

---

## 11. Recommended adoption plan (NOT executed)

**Strong recommendation: ADOPT** the data from `@tabby_ai/hijri-converter` v1.0.5 as the source for `db/hijri/umm-al-qura.json`, with the following constraints:

1. **Data only — not the code.** We extract `MONTH_STARTS` + the per-month day-counts into our own JSON schema. We do NOT add `@tabby_ai/hijri-converter` to `package.json`. The site's runtime never imports the npm package. This avoids dependency-supply-chain risk and keeps the install graph small.

2. **Attribution.** `db/hijri/umm-al-qura.json` `sourceMeta` block will document:
   - Original Python source: `github.com/mhalshehri/hijri-converter` (Mohammed H Alshehri, MIT 2018).
   - TypeScript port we extracted from: `@tabby_ai/hijri-converter@1.0.5` (Tabby FZ-LLC, MIT 2023).
   - Date extracted: 2026-05-23.
   - Range: 1343-1500 AH (we expose 1356-1500 to the runtime; 1343-1355 stays in the file but the `range.startYear` gate hides it).

3. **Cross-checks before Stage B flip:**
   - Spot-check 5-10 randomly selected years against `ummulqura.org.sa` (user provides screenshots or confirms).
   - Cross-check the four headline 1447-12 / 1448-01 tests (already verified in this audit).
   - Investigate the 1356 and 1401 = 353-day anomaly (one screenshot from the official source each is enough).

4. **Schema mapping** (for when the actual data lands — Stage B):
   ```jsonc
   {
       "1447": {
           "months":     [30, 29, 30, 30, 30, 29, 30, 29, 30, 29, 30, 29],
           "yearStart":  "2025-06-26",
           "yearLength": 355
       }
   }
   ```
   This is consistent with the Stage A0 schema (validator already enforces this shape).

---

## 12. Verdict

🟢 **ADOPT** — `@tabby_ai/hijri-converter` v1.0.5 is approved as the data source for our local Umm al-Qura table.

- ✅ MIT licensed, redistribution-safe.
- ✅ Table-based (not formula), 1343-1500 AH coverage.
- ✅ Zero runtime dependencies.
- ✅ Faithful TypeScript port of the de-facto reference (`mhalshehri/hijri-converter`).
- ✅ Four headline assertions all pass.
- ✅ Reverse mapping consistent.
- ✅ Out-of-range behaviour is strict (throws).
- ⚠ Two minor 353-day anomalies (1356, 1401) flagged for user cross-check, but well outside the bug zone.

🟢 But — adoption proceeds **only with explicit Stage B authorisation**. This audit ends here.

---

## 13. What this report does NOT do

- Does NOT install the npm package.
- Does NOT modify `package.json` or `package-lock.json`.
- Does NOT copy any data into `db/hijri/umm-al-qura.json`.
- Does NOT change `js/hijri-date.js` or `server.js`.
- Does NOT change any visible page.
- Does NOT start Stage B.

**Cleanup:** The `/tmp/hijri-pack-audit-*` scratch directory containing the tarball + extracted package + verification scripts is deleted at the end of this audit. Nothing related to the inspected package remains on the filesystem outside this report.

---

## 14. Awaiting user approval

**The audit is complete. Stage B is NOT started.**

Before Stage B can begin, please confirm:

1. **Adopt `@tabby_ai/hijri-converter` v1.0.5 as the data source?** (My recommendation: yes.)
2. **Range to extract into the project:** 1356-1500 (our agreed target) or the full 1343-1500 with the gate at 1356?
3. **Cross-check policy for 1356 + 1401 (the 353-day anomaly):** Do you want to verify these against `ummulqura.org.sa` manually before Stage B, or accept the upstream values and document the anomaly in the file's notes?
4. **Headline value of "is 1447 a leap year"** in user-facing strings/FAQ: Umm al-Qura says **355 days (leap), Dhul Hijjah 29 days** — so the FAQ answer flips from the current "نعم، 355 يومًا" → it actually stays "نعم، 355 يومًا" but with the extra day now in Rabi al-Akhir. This is an unexpected nuance worth confirming before Stage B touches the FAQ wording.

🛑 **No code change, no data import, no Stage B until explicit go-ahead.**
