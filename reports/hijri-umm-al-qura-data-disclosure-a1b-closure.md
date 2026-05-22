# HIJRI-UMM-AL-QURA-DATA-DISCLOSURE-A1B — Closure report

**Status:** Stage A1B complete — disclosure note appended to `db/hijri/umm-al-qura.json` `notes` array. **Zero year/month value changes**, byte-identity of `years{}` proven via SHA-256. Awaiting user approval for commit + push, then Stage B kickoff.
**Date:** 2026-05-23
**Companions:**
- `reports/hijri-umm-al-qura-data-stage-a1-closure.md` (Stage A1 closure, commits `b98b324` + `6c8ff9b`)
- `reports/hijri-umm-al-qura-anomaly-crosscheck-1.md` (anomaly cross-check, commit `0795303`)

---

## 1. What this stage does

Stage A1B appends a single explanatory paragraph to the `notes` array inside `db/hijri/umm-al-qura.json`, documenting the 1356-1401 historical-range disagreement uncovered in the anomaly cross-check (commit `0795303`). It is **the smallest possible change**: one new string in one JSON array. Nothing else moves.

### Why a separate stage?

Per user policy, Stage B (algorithm flip in `js/hijri-date.js` + `server.js`) cannot start until the cross-check findings are documented inside the data file itself. This commit fulfils that prerequisite as a minimal, easily-reviewable change. Once it lands, Stage B is unblocked.

---

## 2. Files changed

| File | Status | What changed |
|---|---|---|
| `db/hijri/umm-al-qura.json` | **M** (one string appended to `notes` array; +1 net line) | Added 1 new entry to `notes[]`. `notes` length: 6 → 7. **No other field of any kind** was modified. |
| `reports/hijri-umm-al-qura-data-disclosure-a1b-closure.md` | **NEW** | This closure report. |

**Total: 1 modification + 1 new report file.** Zero code files touched.

---

## 3. The new disclosure note (verbatim text added)

```
HIJRI-UMM-AL-QURA-DATA-DISCLOSURE-A1B (2026-05-23): The 1356-1401
AH historical range follows the @tabby_ai/hijri-converter /
mhalshehri table interpretation. Cross-check against hijri-core
showed differences in parts of this early historical range,
including 1356 AH, 1401 AH, and 1364-08. The modern range
1402-1500 AH matches the secondary source fully in the audit,
and 1447 AH cross-checks successfully. These early historical
anomalies are retained as source-table values and documented
rather than normalized to a tabular pattern. See reports/
hijri-umm-al-qura-anomaly-crosscheck-1.md for the full audit.
```

Wording follows the user's spec verbatim, with one micro-addition: a back-reference to the cross-check report for traceability.

---

## 4. Proof of zero value mutation

### 4.1 `years{}` SHA-256 hash — pre vs post

Computed as `sha256(JSON.stringify(years, sortedKeys))`:

```
PRE-EDIT  years{} sha256: 828b2090ee738162b43558268e12a5c82afc7b634dbefe45fd6042986e792d2a
POST-EDIT years{} sha256: 828b2090ee738162b43558268e12a5c82afc7b634dbefe45fd6042986e792d2a
IDENTICAL:                true
```

Mathematically guarantees: **not a single byte inside the `years{}` object changed** between the pre-A1B and post-A1B snapshots.

### 4.2 Spot-checks of headline values

| Field | Pre-A1B | Post-A1B | Match? |
|---|---|---|---|
| Years count | 145 | 145 | ✅ |
| `years["1447"].months` | `[30,29,30,30,30,29,30,29,30,29,30,29]` | `[30,29,30,30,30,29,30,29,30,29,30,29]` | ✅ |
| `years["1356"].yearLength` | 353 | 353 | ✅ |
| `years["1401"].yearLength` | 353 | 353 | ✅ |
| `years["1364"].months[7]` (Shaban) | 28 | 28 | ✅ |
| `anomalies.yearLength` | `[{1356,353},{1401,353}]` | (same) | ✅ |
| `anomalies.monthLength` | `[{1364,8,Shaban,28}]` | (same) | ✅ |
| `statistics.*` | full block | (same) | ✅ |
| `notes` count | 6 | **7** | (the only change) |

---

## 5. Test results

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
✓ ALL TESTS PASSED
```

**Summary: 49/49 assertions still pass.** Every previously-passing test continues to pass because the data values are identical.

---

## 6. Confirmation: no behaviour change

### 6.1 Critical files byte-identical

```
$ git diff HEAD -- js/hijri-date.js server.js package.json js/hijri-umm-al-qura.js \
    scripts/_smoke_hijri_umm_al_qura_a1.mjs scripts/_validate_hijri_umm_al_qura_schema.mjs index.html
(empty — no changes)
```

Every code file, every script, every config file is byte-identical to HEAD. Only the JSON data file's `notes` array gained one string.

### 6.2 No HTML page touched

`index.html` is unchanged. The cache-buster was NOT bumped because no JS/CSS that the browser loads has changed.

### 6.3 No connection from new data to the live runtime

The new disclosure note is part of the `notes` array which is loaded by `js/hijri-umm-al-qura.js`'s `loadTable()` but consumed only by Node-side tests / a future debug surface. Production code does NOT read the `notes` array. The note is purely human-documentation.

### 6.4 `package.json` + `package-lock.json` untouched

```
$ git diff HEAD -- package.json package-lock.json
(empty)
```

No dependency added, no version change.

---

## 7. Acceptance criteria — all met

| # | Criterion | Status |
|---|---|---|
| 1 | Schema validator PASS | ✅ |
| 2 | Smoke A1 PASS (49/49) | ✅ |
| 3 | 145/145 years still present | ✅ |
| 4 | 1740/1740 months still present | ✅ |
| 5 | 1447-12 = 29 days | ✅ |
| 6 | 1447 yearLength = 355 | ✅ |
| 7 | 1356 = 353 unchanged | ✅ |
| 8 | 1401 = 353 unchanged | ✅ |
| 9 | 1364-08 = 28 unchanged | ✅ |
| 10 | `js/hijri-date.js` byte-identical | ✅ |
| 11 | `server.js` byte-identical | ✅ |
| 12 | Page behaviour unchanged | ✅ |
| 13 | Stage B not started | ✅ |
| 14 | `years{}` SHA-256 identical pre/post | ✅ |
| 15 | `package.json` byte-identical | ✅ |
| 16 | `index.html` byte-identical | ✅ |

---

## 8. Confirmation: Stage B NOT started

- `db/hijri/umm-al-qura.json` `status` field: still `"data-ready"` (NOT `"populated"`, NOT `"live"`).
- `js/hijri-date.js`: untouched. The site still computes Hijri dates via the Kuwaiti tabular algorithm.
- `server.js`: untouched. SSR mirror still uses Kuwaiti.
- No route handler reads `db/hijri/umm-al-qura.json`.
- No browser-loaded JS file imports `js/hijri-umm-al-qura.js`.
- No sitemap entry generated from the new table.
- No URL regex tightened.

The Dhul Hijjah 1447 bug (year-table showing 30 days) is **still present on the live site**. Fixing it remains Stage B's responsibility.

---

## 9. What this stage does NOT do

- Does NOT change any month-length value.
- Does NOT change any year-length value.
- Does NOT change any year's `yearStart`.
- Does NOT change `sourceMeta`, `range`, `status`, `fetchedAt`, `anomalies`, `statistics`, or any non-`notes` field.
- Does NOT modify the helpers (`js/hijri-umm-al-qura.js`).
- Does NOT modify the validator or smoke tests.
- Does NOT modify `js/hijri-date.js` or `server.js`.
- Does NOT install or add any dependency.
- Does NOT change any visible page.
- Does NOT start Stage B.

---

## 10. After this commit lands — Stage B is unblocked

Once A1B is approved + pushed, the path to Stage B is clear:

1. ✅ Data extracted (Stage A1).
2. ✅ Anomalies cross-checked (CROSSCHECK-1).
3. ✅ Disclosure documented in data file (Stage A1B — this stage).
4. ⏳ **Stage B**: flip `js/hijri-date.js` + `server.js` to read from the new table, add route guards, regenerate sitemap.

Stage B will be a much larger change with measurable behavioural impact (`/hijri-calendar/1447` will show "29" for Dhul Hijjah, `/hijri-date/1447-12-30` will return 404, etc.).

🛑 **Stage B requires explicit user authorisation. NOT started here.**

---

## End of A1B closure — awaiting user approval to commit + push.
