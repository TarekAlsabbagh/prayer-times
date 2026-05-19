# ASIA-1D-BD-PREFLIGHT-1 — Pre-flight audit report

**Status**: 📋 PRE-FLIGHT / AUDIT ONLY — no merge, no curated mutation, awaiting user decision
**Date**: 2026-05-19
**Phase**: BD pipeline buildout (opened after BN-WORKFLOW-DESIGN-1 user approval)
**Scope**: Create Bangladesh country config + run Stage 1-3 candidate extraction + audit results. NO Stage 4 merge, NO Bengali enrichment.

---

## ⚠️ Disambiguation re-confirmed (zero Brunei contamination)

This phase deals strictly with **country=BD (Bangladesh)**, NOT country=BN (Brunei).

| Code | Meaning | Files involved |
|------|---------|----------------|
| BD | Bangladesh (country) | `bd.mjs` (new), `BD.zip` / `BD.txt` (new), `bd-geonames-*.json` (new) |
| bn (lang) | Bengali (language) | `names.bn` / `aliases.bn` (existing in 6 curated rows) |
| BN | Brunei Darussalam (country) | `bn.mjs` (pre-existing, **NOT TOUCHED**), `bn-geonames-*.json` (pre-existing, **NOT USED**) |

**Verification**: `git status` confirms no `bn-*` Brunei files modified or staged in this phase.

---

## Acceptance criteria — verification table

| # | Criterion | Status |
|---|---|---|
| 1 | GeoNames source for BD downloaded and parseable | ✓ `BD.zip` 1.66 MB + `BD.txt` 7.34 MB |
| 2 | No Brunei data used | ✓ All paths use `bd-` prefix; `bn-*` Brunei files untouched (verified via git status) |
| 3 | `bd.mjs` country config created (with verified admin1 codes) | ✓ Stage 1 → empirical admin1 → bd.mjs corrected (81-87 + letter H for Mymensingh) |
| 4 | `curated-places.json` unchanged | ✓ `git diff` shows 0 lines changed; size + counts (2474 total / 148 PK / 6 BD) match latest commit |
| 5 | `server.js` / `js/app.js` / `index.html` unchanged | ✓ Not modified (verified via git status) |
| 6 | Candidates inspected (no merge) | ✓ Stage 1-3 ran read-only against curated; Stage 4 NOT run |
| 7 | Bengali script guards documented | ✓ Section "Bengali script — quality gate proposal" below |
| 8 | Rename pairs detected | ✓ All 5 historical/2018 renames inspected (Section "Rename pairs") |
| 9 | No runtime translation | ✓ Stages 1-3 are pure data import/normalization; no API calls, no LLM, no Google/Anthropic/OpenAI |
| 10 | No merge (no Stage 4) | ✓ `_clean_approve` / `apply_curated_candidates` NOT run |
| 11 | One clear audit report in `reports/` | ✓ this file: `reports/asia-1d-bd-preflight-1.md` |

---

## Files created by this phase

| File | Purpose | Size |
|------|---------|------|
| `scripts/geodata/countries/bd.mjs` | Bangladesh country config (NEW) | 3.7 KB |
| `db/places/sources/BD.zip` | GeoNames raw download | 1.66 MB |
| `db/places/sources/BD.txt` | GeoNames extracted TSV | 7.34 MB |
| `db/places/candidates/bd-geonames-raw.json` | Stage 1 output (49,052 P-class rows) | ~30 MB |
| `db/places/candidates/bd-geonames-normalized.json` | Stage 2 output (48,853 candidates) | ~22 MB |
| `db/places/candidates/bd-geonames-candidates.json` | Stage 3 output (status + tier assigned) | ~25 MB |
| `reports/bd-geodata-import-report.md` | Stage 3 auto-generated summary | 1.5 KB |
| `reports/bd-geodata-aliases-review.md` | Stage 3 auto-generated alias review | 17 entries |
| `reports/asia-1d-bd-preflight-1.md` | This audit report | — |

## Files NOT changed

- ❌ `db/places/curated-places.json` — **byte-for-byte identical to last commit** (`8faf038`); confirmed by `git diff` = 0 lines
- ❌ `server.js` — unchanged
- ❌ `js/app.js` — unchanged
- ❌ `index.html` — unchanged
- ❌ `_geonames_common.mjs` — unchanged (Bengali Unicode-block extractor NOT added; see Section "Open question: Stage 2 enhancement")
- ❌ All other country configs (`pk.mjs`, `bn.mjs` Brunei, etc.) — unchanged
- ❌ All test scripts — unchanged
- ❌ MEMORY.md — not updated yet (deferred to post-approval)
- ❌ `bn-geonames-*` Brunei candidate files — NOT touched, NOT used as input

---

## 1. GeoNames source — raw row counts

| Metric | Count |
|--------|------:|
| Raw lines in `BD.txt` | 59,424 |
| P-class (populated places) | 49,052 |
| Other feature_class (rejected) | 10,372 |

### Feature-code distribution (P-class only)

| feature_code | Count | Treatment |
|--------------|------:|-----------|
| `PPLC` (national capital) | 1 | accept (Dhaka) |
| `PPLA` (1st-order admin seat) | 7 | accept (division capitals; Chattogram, Khulna, Rajshahi, Sylhet, Barishal, Rangpur, Mymensingh) |
| `PPLA2` (2nd-order admin seat) | 9 | accept (district capitals; Gazipur, Bagerhat, Chāndpur, Magura, Nilphamari, Jamālpur, Netrakona, Lalmonirhat, Gaibandha) |
| `PPLA3` (3rd-order admin seat) | 3 | accept |
| `PPL` (generic populated place) | 48,802 | accept (filtered downstream by popMin) |
| `PPLL` (small locality) | 31 | accept |
| `PPLX` (section) | 191 | **reject** (sub-area of a city) |
| `PPLQ` (abandoned) | 7 | reject |
| `PPLF` (farm) | 1 | reject |

---

## 2. admin1 codes — VERIFIED empirically

Bangladesh has **8 divisions**. GeoNames uses 2-digit numeric codes for 7 of them and a **non-numeric letter code `H` for the 8th** (Mymensingh, which was carved out of Dhaka Division in 2015).

This matches the documented quirk pattern from prior waves:
- TL (Timor-Leste, ASIA-1E): 2-letter codes (AL/BA/DI/…)
- TM (Turkmenistan, ASIA-1H): "S" code for Ashgabat
- KZ (Kazakhstan, ASIA-1H): anomalous long-numeric codes for post-2018 city-status grants

### Empirical mapping (from Stage 1 PPLC/PPLA inspection)

| admin1 | Division | PPLC/PPLA | pop | PPLA2 examples |
|--------|----------|-----------|----:|----------------|
| `81` | Dhaka | Dhaka (PPLC) | 10,356,500 | Gazipur (2.67M) |
| `82` | Khulna | Khulna (PPLA) | 1,500,689 | Bagerhat, Magura |
| `83` | Rajshahi | Rajshahi (PPLA) | 763,580 | — |
| `84` | Chittagong | **Chattogram** (PPLA) | 3,920,222 | Chāndpur |
| `85` | Barisal | **Barishal** (PPLA) | 202,242 | — |
| `86` | Sylhet | Sylhet (PPLA) | 237,000 | — |
| `87` | Rangpur | Rangpur (PPLA) | 1,031,388 | Lalmonirhat, Nilphamari, Gaibandha |
| `H` | Mymensingh | Mymensingh (PPLA) | 225,126 | Jamālpur, Netrakona |

`admin1="00"` appears in 125 rows (empty/unassigned in source data) — handled as flag_unknown_region by Stage 2.

`bd.mjs` has been updated post-Stage-1 to reflect the empirical mapping.

---

## 3. Stage 3 validation results

```
Total candidates evaluated:        48,853
Approved auto (1B refinement):          0  (always 0; user-review only)
Existing (matched to curated):         19  (= 6 BD curated × multiple GeoNames rows)
Pending (new candidates):              72
  high tier:                           10
  medium tier:                          0
  low tier:                            62
Needs review:                      48,761  (missing AR / no real city)
Rejected:                               1  (Rangpur PPLA misclassified — see anomaly note below)
Alias enrichment opportunities:        17
```

### Match-reason breakdown for `existing` (19)

| Reason | Count |
|--------|------:|
| `coords<1km` | 12 |
| `slug` | 6 |
| `en_name+coords` | 1 |

The 1 `en_name+coords` is **Chattogram (rename: Chittagong)** matched 5.39 km from the curated `chittagong` slug — Stage 3 correctly bridged the 2018 rename.

---

## 4. High-tier pending candidates (10) — the BATCH-A core

These are the candidates that ASIA-1D-BD-A should target. **All 10 are new BD cities NOT yet in curated.**

| # | slug | en | featureCode | population | nearest curated | dist (km) | Bengali in GeoNames? |
|---|------|----|----|-----:|-----------------|---------:|---|
| 1 | `gazipur` | Gazipur | PPLA2 | 2,674,697 | dhaka | 20.9 | ✓ গাজীপুর |
| 2 | `comilla` | Comilla | PPL | 1,030,000 | chittagong | (—) | ✓ কুমিল্লা |
| 3 | `bagerhat` | Bagerhat | PPLA2 | 266,388 | khulna | (—) | ✓ বাগেরহাট |
| 4 | `mymensingh` | Mymensingh | PPLA | 225,126 | dhaka | 105.2 | ✓ ময়মনসিংহ |
| 5 | `bogra` | Bogra | PPL | 210,000 | (—) | (—) | ✓ বগুড়া |
| 6 | `jamalpur` | Jamālpur | PPLA2 | 167,900 | dhaka | 132.0 | ✓ জামালপুর |
| 7 | `habiganj` | Habiganj | PPL | 88,760 | (—) | (—) | ✓ হবিগঞ্জ |
| 8 | `feni` | Feni | PPL | 84,028 | (—) | (—) | ✓ ফেনী |
| 9 | `netrakona` | Netrakona | PPLA2 | 79,016 | sylhet | 114.97 | ✓ নেত্রকোণা |
| 10 | `lalmonirhat` | Lalmonirhat | PPLA2 | 65,127 | rajshahi | 191.54 | ❌ (no Bengali in GeoNames) |

**Bengali coverage in this batch: 9/10 = 90%** ✨ (only Lalmonirhat would require Wikipedia / manual transliteration → লালমনিরহাট)

### Arabic-quality concern: most are mojibake

Stage 2's Persian/Urdu transliteration heuristic produced poor-quality Arabic for several high-tier candidates:
- `mymensingh` → `mymn sngھ` (literal mojibake)
- `lalmonirhat` → `lal mnyr ہaٹ` (literal mojibake)
- `bagerhat` → `baghr ہaٹ` (literal mojibake)
- `gazipur` → `غازي پور` (Persian-style, would need Arabic transliteration like غازيبور)
- `comilla` → `کومیلا` (Persian چ/ی/ا — not Arabic; needs کوميلا)
- `bogra` → `بوگرا` (Persian گ; needs بوغرا)
- `jamalpur` → `جمالبور` (Persian-style بور suffix; standard AR uses بور or pure transliteration)

**Implication**: ASIA-1D-BD-A wave will need **manual `NAME_AR_FIXES`** for ALL 10 high-tier candidates (analogous to PK MAJORS-1A which had zero clean Arabic from GeoNames). All Arabic names will come from Wikipedia AR or standard Arabic transliteration of Bengali — NOT from this candidate file's raw `names.ar`.

---

## 5. Anomalies in Stage 3 tier-assignment

Three candidates were classified as **low tier** when they should likely be **high tier**:

| slug | featureCode | pop | Stage 3 reason | Expected tier |
|------|-------------|----:|----------------|---------------|
| `barishal` | PPLA | 202,242 | `below_popMin_and_not_always_include` | high (popMin=50k AND PPLA always-include both met) |
| `nilphamari` | PPLA2 | 0 | `below_popMin_and_not_always_include` | high or filter-out (PPLA2 admin seat) |
| `gaibandha` | PPLA2 | 0 | `below_popMin_and_not_always_include` | high or filter-out (PPLA2 admin seat) |

**`barishal` is most concerning** — it's the renamed (2018) Barisal division capital with pop=202k. The `alwaysIncludeFeatureCodes: ['PPLC', 'PPLA']` rule in `bd.mjs` should have promoted it. The Stage 3 tier-assignment logic for `pending` rows (those not matched to curated) may have a corner case bug, or the rename-mismatch with curated `barisal` slug confused the path.

**Recommendation**: Investigate Stage 3 tier-assignment in `validate_candidates.mjs` before ASIA-1D-BD-A — likely a single conditional in the tier-assignment function. Either:
- (a) Promote `barishal` to high-tier via override-list in approve script (acceptable workaround)
- (b) Fix tier-assignment logic upstream (cleaner, benefits future waves)

For PREFLIGHT-1 the finding is **documented but not fixed**.

---

## 6. Rejection anomaly: Rangpur false positive

The Rangpur PPLA (pop=1,031,388, division capital) was **rejected** with reason `religious_site_not_city`. This is a **false positive** — Rangpur is a major secular city, not a religious site.

The religious-keyword blocklist (`RELIGIOUS_KEYWORDS` in `_geonames_common.mjs`) is matching a substring inside "Rangpur" — likely the suffix "pur" overlapping with a religious-named place. Need to inspect the regex.

**Recommendation**: Fix the religious-keyword regex (or add an override for `rangpur` slug) before ASIA-1D-BD-A. Without this fix, Rangpur (1.03M population) would be excluded from the wave.

---

## 7. Bengali in GeoNames — coverage survey

I scanned all 49,052 raw rows for strings containing Bengali Unicode block (U+0980–U+09FF) but **excluding strings with Latin chars** (to filter out mixed transliterations):

### Overall coverage

| | Count | % |
|---|------:|---:|
| Rows with at least one Bengali alternatename | 54 | 0.1% |
| Rows without | 48,998 | 99.9% |

The overall rate is low because the dataset is dominated by ~48,800 PPL rows for tiny villages (most with pop=0).

### Coverage by feature_code

| FC | total | with bn | coverage |
|----|------:|--------:|---------:|
| PPLC | 1 | 1 | **100%** |
| PPLA | 7 | 7 | **100%** |
| PPLA2 | 9 | 6 | **66.7%** |
| PPLA3 | 3 | 1 | 33.3% |
| PPL | 48,802 | 39 | 0.1% |
| (others) | 230 | 0 | 0% |

### Coverage by population bucket

| Bucket | total | with bn | coverage |
|--------|------:|--------:|---------:|
| ≥1M | 6 | 6 | **100%** |
| 500k-1M | 4 | 1 | 25% |
| 200k-500k | 25 | 9 | 36% |
| 100k-200k | 20 | 4 | 20% |
| 50k-100k | 30 | 8 | 27% |
| 20k-50k | 49 | 1 | 2% |
| <20k | 24 | 4 | 17% |
| pop=0 | 48,894 | 21 | 0.04% |

### Suspicious script contamination

| Issue | Count |
|-------|------:|
| Bengali strings containing Assamese-only letters (ৰ ৱ) | **0** ✓ |
| Bengali strings containing Devanagari | (not checked — separate pass would be in `isCleanBengaliScript`) |

**Conclusion**: For the **high-tier BATCH-A scope** (popMin=50k + PPLC/PPLA always-include), Bengali coverage in raw GeoNames is **~90%** (9/10). Only `lalmonirhat` is missing, plus one anomaly with `barishal` already in curated. This is **dramatically better than PK Urdu** (which had 0% GeoNames coverage and needed full manual Wikipedia translit).

---

## 8. Open question: Stage 2 enhancement — Bengali Unicode-block extractor

**Problem**: `scripts/geodata/_geonames_common.mjs` `parseAlternateNames()` currently extracts:
- `names.ar` via `isArabicScript()` (matches Arabic Unicode block)
- `names.en` via `isMostlyLatin()` (matches Latin block)

But it does **NOT** extract `names.bn` by Bengali Unicode block. Result: even though Bengali Wikipedia names sit in the `alternatenames` field of high-tier BD rows, Stage 2 ignores them.

**Manual verification** (Gazipur geonameid 1200109):
- Raw `alternatenames` includes `গাজীপুর`
- Stage 2 candidate has `names = {en: "Gazipur", ar: "غازي پور"}` — Bengali missing

**Two possible fixes**:

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Enhance Stage 2 universally** | Add `isBengaliScript()` + extract `names.bn` from alternatenames during normalization | Single-source extraction; consistent with `ar` and `en` handling; auto-applies to future BD/IN waves | Changes shared infrastructure (`_geonames_common.mjs`); affects all countries (zero-impact for non-Bengali countries since they have no Bengali alts) |
| **B. Defer to PLACE-NAMES-BN-BD-1 phase** | Geodata wave merges with `{ar, en}` only; Bengali enrichment wave re-parses raw alternatenames | Smaller surface area per wave; matches PK pattern (geodata then UR enrichment) | Re-parses raw data; arguably wasteful; doesn't benefit IN (India) future waves |

**Recommendation**: Option A is cleaner but requires careful regression testing on all existing GeoNames-imported entries (1,755 known fillchain rows already exist; adding bn extraction risks accidentally setting `names.bn` to a mixed-script string).

**Decision deferred to user** before ASIA-1D-BD-A starts.

---

## 9. Rename pairs analysis (2018 + historical)

All 5 expected historical/2018 Bangladesh renames were inspected in raw GeoNames data:

| Pair (Old / New / Bengali) | Geonameid | Status in GeoNames | Status in candidates |
|----------------------------|----------:|--------------------|----------------------|
| **Chittagong / Chattogram / চট্টগ্রাম** | 1205733 | Single row uses name=`Chattogram`; alternatenames include both Latin spellings + `চট্টগ্রাম` | **existing** (matched curated `chittagong` via en_name+coords 5.39km) |
| **Comilla / Cumilla / কুমিল্লা** | 1185186 | Single row uses name=`Comilla`; alternatenames include `কুমিল্লা`; **`Cumilla` spelling NOT YET in GeoNames** | **pending high** |
| **Barisal / Barishal / বরিশাল** | 1336137 | Single row uses name=`Barishal`; alternatenames include both Latin + `বরিশাল` | **pending low (tier anomaly)** |
| **Bogra / Bogura / বগুড়া** | 1337233 | Single row uses name=`Bogra`; alternatenames include `Bogura` + `বগুড়া` | **pending high** |
| **Jessore / Jashore / যশোর** | 1336140 | Single row uses name=`Jessore`; alternatenames include `Jashore`; **Bengali `যশোর` MISSING** | needs_review (missing_real_ar_name) |

### Implications

1. **Slug-decision rule for renamed cities (proposed)**: use the **post-2018 modern English form** as the slug, with the pre-2018 form as `aliases.en`. Examples:
   - `chattogram` (slug) ← `Chittagong` (alias) — but curated already has `chittagong` slug; need to decide whether to rename slug (breaking change) or keep `chittagong` + add `Chattogram` as alias.
   - `cumilla` (slug) ← `Comilla` (alias)
   - `barishal` (slug) ← `Barisal` (alias) — but curated already has `barisal` slug
   - `bogura` (slug) ← `Bogra` (alias)
   - `jashore` (slug) ← `Jessore` (alias)

2. **Slug-rename conflict with existing curated**: `chittagong` and `barisal` are already in curated with the pre-2018 slugs. Stage 3 correctly bridged them (via en_name+coords for chittagong; via slug-mismatch for barisal which led to the tier anomaly). **User decision needed** on whether to:
   - (a) Keep curated slugs `chittagong` / `barisal` unchanged and add modern forms as aliases
   - (b) Rename curated slugs to `chattogram` / `barishal` (cleaner, but breaks URLs)
   - (c) Add NEW entries with modern slugs and delete the old ones (most disruptive)

3. **Comilla → Cumilla in GeoNames**: GeoNames has NOT updated to "Cumilla" name — only Comilla appears as primary. Stage 3 picks slug `comilla` from this. Wave will merge as `comilla` slug with `Comilla` as `names.en` (and `Cumilla` as `aliases.en`, conditional on user direction).

---

## 10. Bengali script — quality gate proposal

From BN-WORKFLOW-DESIGN-1 Section 3, the proposed `isCleanBengaliScript()` validator (NOT YET IMPLEMENTED):

```js
const HAS_LATIN              = /[A-Za-z]/;                  // reject
const HAS_BENGALI_BLOCK      = /[ঀ-৿]/;            // require
const SUSPICIOUS_NON_BENGALI = /[ৰৱ]/;             // Assamese-only — reject
const HAS_DEVANAGARI         = /[ऀ-ॿ]/;            // reject (Hindi)
const HAS_OTHER_INDIC        = /[਀-௿]/;            // reject (Gurmukhi/Gujarati/Tamil/Telugu)

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_BENGALI.test(s)) return false;
    if (HAS_DEVANAGARI.test(s)) return false;
    if (HAS_OTHER_INDIC.test(s)) return false;
    return HAS_BENGALI_BLOCK.test(s);
}
```

### Empirical confidence

In PREFLIGHT-1 I scanned 54 GeoNames Bengali alternatenames for Assamese ৰ ৱ pollution: **0 matches** (clean). This is positive evidence that the gate's primary concern (cross-border Bengali↔Assamese contamination) is rare in BD GeoNames data.

A more thorough audit (Devanagari leak, Gurmukhi leak, mojibake) should run during PLACE-NAMES-BN-BD-1 design (NOT here in PREFLIGHT-1).

---

## 11. Existing BD curated state — alias enrichment opportunities

The 6 existing BD curated entries (`dhaka`, `chittagong`, `sylhet`, `rajshahi`, `khulna`, `barisal`) all have:
- ✓ `names.bn` populated (full 10-lang seeded entries)
- ✓ `aliases.bn` populated (1-2 variants each)
- ✓ `population: 0` (seed-only, not GeoNames-imported)
- ✓ No `sourceId` (no GeoNames link)

`reports/bd-geodata-aliases-review.md` flags **17 alias enrichment opportunities** for these 6 entries. Example: `sylhet` could gain Bengali variants (`স্ লহট`-style) AND historical English aliases like `Jalalabad, Srihotto, Srihôţţo`. These are **separate from** the new-city additions.

**Decision**: Alias enrichment for the 6 seed entries is **out of ASIA-1D-BD-A scope** and should be a separate small wave (e.g., `PLACE-NAMES-ALIASES-BD-SEED-1`) after the main pipeline stabilizes.

---

## 12. Recommended next phase (await user decision)

### Option 1 (RECOMMENDED): Proceed with ASIA-1D-BD-A planning sub-phase

A short follow-up phase **ASIA-1D-BD-A-PLAN** that:
1. Fixes the Stage 3 tier-assignment bug for PPLA pop≥50k (so `barishal` lands in high tier)
2. Fixes the religious-keyword false positive for `rangpur`
3. Decides Option A vs Option B for Bengali Unicode-block extractor (§8)
4. Decides slug-rename policy for chittagong/chattogram + barisal/barishal pair (§9.2)
5. Confirms BATCH-A scope (probably 10 high-tier + 3 anomaly-promoted = 13 cities)
6. Builds `_asia_1d_bd_a_clean_approve.mjs` with manual `NAME_AR_FIXES` for all 13
7. Writes BATCH-A apply report

Then **stop** for user approval before merge.

### Option 2: Direct ASIA-1D-BD-A execution

Skip the intermediate planning sub-phase and write the apply script + run merge in one go. **Not recommended** because of the 3 outstanding issues (tier-assignment, religious false positive, Bengali extractor decision).

### Option 3: Smaller BATCH-A scope (Top-5 only)

Restrict initial wave to the 5 largest: gazipur (2.67M), comilla (1.03M), bagerhat (266k), mymensingh (225k), bogra (210k). Defer the 5 smaller (jamalpur/habiganj/feni/netrakona/lalmonirhat) + 3 anomalies to BATCH-B. This is the **most conservative** approach.

---

## What this phase did NOT do

- ❌ Did not modify `db/places/curated-places.json` (0 byte diff)
- ❌ Did not run Stage 4 (`apply_curated_candidates.mjs`)
- ❌ Did not run any `_clean_approve` script
- ❌ Did not add `names.bn` to any curated entry
- ❌ Did not fix the 3 anomalies identified (Stage 3 tier-assignment / Rangpur false positive / Bengali extractor)
- ❌ Did not modify `server.js`, `js/app.js`, `fillLangMap`, `index.html`
- ❌ Did not modify `_geonames_common.mjs` (shared infrastructure unchanged)
- ❌ Did not create or modify any test file
- ❌ Did not use any Brunei (`bn-*`) candidate file as input
- ❌ Did not download non-BD GeoNames data
- ❌ Did not start ASIA-1D-BD-A merge wave
- ❌ Did not start PLACE-NAMES-BN-BD-1 enrichment
- ❌ Did not use any runtime translation, AI translation, or browser translate
- ❌ Did not update MEMORY.md (deferred to post-user-approval)

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ ASIA-1D-BD-A (BD geodata wave — Option 1/3 planning needed first)
- ❌ ASIA-1D-BD-MCF (BD blocked-major review — N/A until BD-A)
- ❌ PLACE-NAMES-BN-BD-1 (Bengali enrichment for BD-A entries)
- ❌ ASIA-1D-IN (India Urdu wave)
- ❌ ASIA-1F (China solo wave)
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ Alias enrichment (incl. PLACE-NAMES-ALIASES-BD-SEED-1)
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

---

## Status: 📋 PRE-FLIGHT COMPLETE — AWAITING USER DECISION

### Summary numbers

| Metric | Value |
|--------|-------|
| GeoNames source size | `BD.zip` 1.66 MB, `BD.txt` 7.34 MB |
| Raw P-class rows | 49,052 |
| Stage 2 normalized | 48,853 |
| Stage 3 existing (matches curated) | 19 (→ 6 curated cities) |
| Stage 3 pending (new high-tier) | **10** |
| Stage 3 pending (low-tier) | 62 (3 anomalies promoted candidates) |
| Stage 3 needs_review | 48,761 |
| Stage 3 rejected | 1 (Rangpur false positive) |
| Alias enrichment opportunities | 17 (for existing 6 seed entries) |
| BD entries currently in curated | 6 (unchanged) |
| Bengali coverage for high-tier BATCH-A core | 9/10 = **90%** ✨ |
| Rename pairs detected | 5 (Chittagong→Chattogram, Comilla→Cumilla, Barisal→Barishal, Bogra→Bogura, Jessore→Jashore) |
| `curated-places.json` mutations | **0 bytes changed** |
| Brunei (`bn-*`) data used | **NONE** |

**Next step**: user reviews this audit and decides one of: (1) proceed to ASIA-1D-BD-A-PLAN, (2) direct execution (not recommended), (3) smaller Top-5 scope, or (4) different path entirely.

**No further work until user direction.**
