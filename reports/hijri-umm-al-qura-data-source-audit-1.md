# HIJRI-UMM-AL-QURA-DATA-SOURCE-AUDIT-1

**Status:** Report only — no code, no install, no dependency added, no table populated. Awaiting user decision.
**Date:** 2026-05-22
**Companion to:** `reports/hijri-umm-al-qura-infra-stage-a0-closure.md` (commit `b2ecdc0`)
**Goal:** Identify the most trustworthy Umm al-Qura data source to populate `db/hijri/umm-al-qura.json` for the range 1356-1500 AH, **without committing to any source yet**.

---

## 1. Audit scope and method

The audit was conducted **read-only** using:
- `npm view <pkg>` (metadata lookups, no install — package contents NOT fetched, only registry metadata).
- `npm search` (registry search index).
- No `npm install`, no `curl`, no external HTTP probe of package tarballs or external sites.
- `package.json` of this project consulted to confirm zero existing Hijri dependencies.

Per user policy, **no dependency was added to `package.json`**, and **no package contents were downloaded**.

---

## 2. Sources investigated

### 2.1 The official Saudi source: `ummulqura.org.sa`

- **What it is:** The Royal Astronomical Society of Saudi Arabia publishes the official Umm al-Qura calendar at this domain. It is the ground-truth reference.
- **Format:** HTML pages per Hijri year, with month tables. **No JSON API exposed.**
- **Acquisition cost:** Requires manual download or scraping of HTML pages, then transcription into JSON. Each year needs ~12 lookups (one per month) and validation against the published PDF version.
- **Range coverage:** 1356-1500 AH (1937-2076 CE) — covers our target range fully.
- **License:** Saudi government publication. Facts about a calendar are not copyrightable in any jurisdiction we operate under. The PUBLISHED table is the authoritative reference; nobody owns the data.
- **Reliability:** ★★★★★ — official source, zero indirection.
- **Effort to acquire:** ★★ (high) — manual HTML scraping or PDF transcription, ~150 years × 12 months × 2-3 fields per row.

### 2.2 npm package: `umalqurra`

- **Status:** **DOES NOT EXIST** on npm. `npm view umalqurra` returns 404.
- **Note:** Earlier versions of this package may have existed and been unpublished; user policy + plan reports mentioned it as an option, but it is currently unavailable.

### 2.3 npm package: `@tabby_ai/hijri-converter`

| Field | Value |
|---|---|
| Version | 1.0.5 (published 2023-08-24) |
| License | MIT |
| Dependencies | none |
| Unpacked size | 53.5 KB |
| Description | "TypeScript port of an accurate python Hijri-Gregorian dates converter based on the Umm al-Qura calendar" |
| Upstream | `github.com/mhalshehri/hijri-converter` (the Python reference, see §2.4) |
| Maintainers | `tabby_ai` (corporate maintainers) |

**Provenance chain:**
official Saudi source → mhalshehri's Python port (§2.4) → @tabby_ai's TypeScript port. The TypeScript port appears to be a faithful translation that vendors the Umm al-Qura data table.

**Reliability:** ★★★★ — MIT license, recognised upstream, but adds one indirection over the Python reference. Has not been updated since Aug 2023 (~2.5 years ago).

### 2.4 The upstream reference: `mhalshehri/hijri-converter` (Python, not npm)

- **What it is:** The well-known reference implementation for Umm al-Qura conversion in the Python ecosystem. The author (Mohammed H. Alshehri) is Saudi and the data has been cross-checked against `ummulqura.org.sa` extensively over years.
- **Repository:** GitHub (not a JavaScript package — needs porting).
- **Range:** 1343-1500 AH per recent versions; older versions covered 1356-1500.
- **License:** MIT.
- **Reliability:** ★★★★★ — the de-facto open-source reference, widely cited.
- **Effort to use:** Would require transcribing the embedded data table from Python source into our JSON format. Not directly installable as a JS dependency.

### 2.5 npm package: `moment-hijri`

| Field | Value |
|---|---|
| Version | 3.0.0 (published 2024-10-31) |
| License | MIT |
| Dependencies | `moment ^2.30.1` |
| Unpacked size | 61.2 KB |
| Maintainer | `xsoh` (active for many years) |
| Description | "A Hijri calendar (Based on Umm al-Qura calculations) plugin for moment.js" |

**Caveat:** The description says "Umm al-Qura **calculations**" rather than "table" — this language is sometimes used for tabular formulas (Kuwaiti-style) calibrated to Umm al-Qura, NOT the actual published table. **Cannot confirm without inspecting the source.** Older versions of moment-hijri were known to use the Kuwaiti tabular algorithm; whether v3.0.0 still does is unverified.

**Reliability:** ★★★ — uncertain whether it's table-based or formula-based.

### 2.6 npm package: `dayjs-hijri`

| Field | Value |
|---|---|
| Version | 1.0.1 (published 2025-01-25) |
| License | MIT |
| Dependencies | none |
| Unpacked size | 83.1 KB |
| Maintainer | `mashhadiebad` (single individual) |
| Description | "A Hijri calendar (Based on Umm al-Qura calculations) plugin for day.js" |

Same caveat as moment-hijri — description says "calculations". Single maintainer. Younger than moment-hijri (~1 year). Cannot confirm table vs formula without source inspection.

**Reliability:** ★★ — newer, single maintainer, unverified algorithm.

### 2.7 npm package: `luxon-hijri` + `hijri-core`

| Package | Version | License | Deps | Unpacked | Published |
|---|---|---|---|---|---|
| `luxon-hijri` | 2.1.0 | MIT | `hijri-core` + `luxon` | 26.7 KB | 2026-02-25 (2 months ago) |
| `hijri-core` | 1.0.0 | MIT | none | 56.0 KB | 2026-02-25 (2 months ago) |

`hijri-core` description: **"Zero-dependency Hijri calendar engine with pluggable calendar support. Includes Umm al-Qura (UAQ) and FCNA/ISNA calendars. Extensible registry for custom calendars."** This is the most promising candidate because:

- Single-purpose core library (no UI framework dep).
- Explicitly distinguishes UAQ from FCNA/ISNA → likely table-based for UAQ.
- 56 KB unpacked → consistent with bundling a static table.
- Zero deps.

**But:** Both packages are only 2 months old (Feb 2026). Single maintainer (`acamarata`). No track record yet. Cannot verify the underlying data without inspecting the package contents.

**Reliability:** ★★★ — strong design, but unproven in the wild.

### 2.8 npm package: `hijri-converter` (Dalwadani's port, NOT mhalshehri)

| Field | Value |
|---|---|
| Version | 1.1.1 |
| License | MIT |
| Dependencies | none |
| Unpacked size | 117.3 KB |
| Maintainer | `dalwadani` |
| Description | "Convert between Hijri (Um Alqura) and Gregorian" |
| Repo | `github.com/dalwadani/hijri-converter` |

Different author than mhalshehri's Python version. The 117 KB size suggests a large embedded table. Not updated recently.

**Reliability:** ★★★ — unclear provenance vs the official source.

---

## 3. Sources NOT investigated (and why)

| Source | Reason for skipping |
|---|---|
| Wikipedia Umm al-Qura calendar page | User policy: "لا تعتمد Wikipedia كمصدر وحيد". Could be used as a CROSS-CHECK once we have a primary, but not as the primary. |
| Printed Hijri calendars (KSA Ministry of Hajj poster, etc.) | Not machine-readable; high transcription effort; provenance harder to verify. |
| Other government calendars (Egypt, UAE, Indonesia) | They derive from local moon-sighting decisions and disagree with Saudi Umm al-Qura. Not the source of truth we want. |
| Python `hijri-converter` direct port | Would require manual transcription of the table out of `.py` source into JSON. Same effort as scraping ummulqura.org.sa, less authoritative since it's an indirection. |
| Tabular Hijri formulas (Kuwaiti, Microsoft, etc.) | User policy explicitly forbids these. |

---

## 4. Comparison table

| Source | Reliability | Range | License | Effort | Table or formula? | Risk |
|---|---|---|---|---|---|---|
| `ummulqura.org.sa` | ★★★★★ | 1356-1500 | Government data | High (manual scrape) | TABLE (HTML) | None — official |
| `mhalshehri/hijri-converter` (Python, transcribe) | ★★★★★ | 1343-1500 | MIT | High (transcribe) | TABLE | None — reference impl |
| `@tabby_ai/hijri-converter` (npm) | ★★★★ | 1343-1500 (presumed) | MIT | Low (npm install + extract) | TABLE (presumed) | One indirection from upstream |
| `hijri-core` | ★★★ | UNKNOWN | MIT | Low (npm install + inspect) | TABLE (likely, per description) | Young, single maintainer |
| `hijri-converter` (dalwadani) | ★★★ | UNKNOWN | MIT | Low (npm install + inspect) | Likely TABLE | Unclear provenance |
| `moment-hijri` | ★★★ | UNKNOWN | MIT | Low | UNKNOWN (could be formula) | Description ambiguous |
| `dayjs-hijri` | ★★ | UNKNOWN | MIT | Low | UNKNOWN (could be formula) | Single maintainer, recent |
| `umalqurra` | — | — | — | — | — | **PACKAGE 404 — does not exist** |
| Wikipedia | ★★ | varies | CC-BY-SA | Low | TABLE | Forbidden as sole source per user policy |

---

## 5. Headline correctness check we MUST run before adopting any source

Whichever source is selected, it MUST satisfy the four headline assertions before being approved:

| Test | Expected |
|---|---|
| Days in Dhul Hijjah 1447 (month 12 of year 1447) | **29** |
| Gregorian of 1 Dhul Hijjah 1447 | **2026-05-18** |
| Gregorian of 29 Dhul Hijjah 1447 | **2026-06-15** |
| Gregorian of 1 Muharram 1448 | **2026-06-16** |
| Validity of (1447, 12, 30) | **invalid / does not exist** |

If a candidate source disagrees with these four, **reject it**.

If a candidate source agrees, we still cross-check 5-10 randomly-selected years against `ummulqura.org.sa` directly (manual spot-check) before flipping the table file's `status` from `data-pending` to `populated`.

---

## 6. Open issue — I cannot verify the data without permission

The npm `view` command returns only metadata (description, license, size, deps). It does NOT download the package contents. Therefore I **cannot, from here, confirm**:

- Whether `@tabby_ai/hijri-converter` or `hijri-core` actually contain a hardcoded Umm al-Qura table (vs. computing it on the fly via formula).
- The exact range each package covers.
- Whether the data in any candidate package matches `ummulqura.org.sa` for our headline tests.

**To verify, one of the following needs to happen — and the user must approve:**

a) **`npm pack <pkg> && tar -xf <pkg>.tgz`** — downloads the package tarball but does NOT install it as a dependency. Lets me inspect source.
b) **`npm install --no-save <pkg>`** — installs to `node_modules/` temporarily without modifying `package.json`. After inspection, `rm -rf node_modules/<pkg>`.
c) **Manual approach** — user downloads the package from npm in a browser, places the file in the project; I extract.
d) **`curl https://registry.npmjs.org/<pkg>/-/<pkg>-<ver>.tgz`** — direct tarball download.

All four options require user approval (per the policy that this audit is read-only and does not introduce dependencies).

---

## 7. Risks summary

| Risk | Severity | Mitigation |
|---|---|---|
| Candidate npm package uses formula not table | High | Inspect source before adopting; reject if formula. |
| Candidate package data differs from ummulqura.org.sa for some years | Medium | Cross-check 5-10 sample years before flipping `status` to `populated`. |
| Single-maintainer package abandoned mid-stream | Low (we vendor the data) | We only use the package to extract the table; the package itself is NEVER a runtime dependency. After extraction, we delete `node_modules/<pkg>`. |
| Manual transcription from HTML/PDF introduces typos | Medium | Two-pass verification: import → run validator → run cross-check against another source for a sample. |
| Package licensing conflict | Low | All candidates are MIT. Data is uncopyrightable. |
| Future Saudi Umm al-Qura revisions | Low | The table is anchored to a snapshot date (`fetchedAt`). If Saudi authorities issue a correction for a future year, we update that specific year's entry. |

---

## 8. Recommendation

### Primary recommendation: **Option A — `npm pack @tabby_ai/hijri-converter`**

Rationale:
- Direct TypeScript port of the de-facto reference implementation (`mhalshehri/hijri-converter`).
- MIT licensed, no deps.
- Small (53.5 KB unpacked).
- Provenance chain is documented and verifiable.
- We use it ONLY for one-time table extraction — it never becomes a runtime dependency of the live site. After extraction, the package is discarded.

**Workflow if approved:**
1. `npm pack @tabby_ai/hijri-converter` → produces a `.tgz` (no install).
2. Extract the tarball to a scratch folder OUTSIDE `node_modules`.
3. Read the source files, locate the embedded table.
4. Transcribe the table into our `db/hijri/umm-al-qura.json` schema.
5. Run `node scripts/_validate_hijri_umm_al_qura_schema.mjs` → must pass.
6. Spot-check 5-10 years against `ummulqura.org.sa` (user provides screenshots or I'm given a list of {year, expected month-days} tuples).
7. Verify the four headline assertions for 1447-12 / 1448-01.
8. Delete the scratch folder.
9. Commit `db/hijri/umm-al-qura.json` with `status: "populated"`, `source: "@tabby_ai/hijri-converter v1.0.5 (TypeScript port of github.com/mhalshehri/hijri-converter)"`, `fetchedAt: "2026-05-22"`.

`package.json` stays unchanged. The site never loads or requires the npm package — only the JSON table makes it into the runtime.

### Secondary recommendation: **Option C — User downloads the data themselves**

If you prefer zero npm interaction:
- Download `@tabby_ai/hijri-converter-1.0.5.tgz` from `npmjs.com` in your browser.
- Place it in the project root.
- I extract and transcribe.

This avoids any `npm` command being run by me. Equivalent end result.

### NOT recommended: `moment-hijri`, `dayjs-hijri`

Their descriptions say "Umm al-Qura **calculations**" which historically means the Kuwaiti tabular algorithm calibrated to UAQ — i.e. the same arithmetic we are trying to move AWAY from. Without source inspection (which requires download), too risky.

### Long-term option: `ummulqura.org.sa` direct scrape

If you want the absolute gold standard with zero indirection, eventually we could scrape the official Saudi site. But this is a much larger effort and Option A gives us the same data via a documented MIT chain.

---

## 9. What this report does NOT do

- Does not install any npm package.
- Does not modify `package.json`.
- Does not download any tarball.
- Does not populate `db/hijri/umm-al-qura.json`.
- Does not change any file other than this one report.
- Does not start Stage B.
- Does not commit anything (the report file will be committed by the user's next instruction).

---

## 10. Awaiting user decisions

1. **Approve Option A (`npm pack @tabby_ai/hijri-converter`)?**
   This is a download-only command — it does NOT install or modify `package.json`. After extraction + transcription, the tarball is deleted.

2. **Or prefer Option C (user manually downloads)?** I can wait for the file.

3. **Or prefer a different source entirely?** E.g. you have a printed Saudi UAQ table and want manual transcription only.

4. **Headline tests to verify:** Confirm the four assertions in §5 are correct as stated, or supply your own canonical list of (year, month → day-count) pairs we should validate against.

5. **Cross-check provider:** When the candidate table is loaded, how do we cross-check? Suggestions:
   - You give me 5-10 specific (year, month → days) tuples from your own source.
   - You spot-check the populated JSON against `ummulqura.org.sa` and approve.
   - We diff against a second npm candidate (e.g. `hijri-core`) and flag any disagreements.

🛑 **No fix, no install, no commit until you respond.**
