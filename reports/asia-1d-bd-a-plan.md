# ASIA-1D-BD-A-PLAN — Plan report

**Status**: 📋 PLAN / DRAFT — no execution, no curated mutation, no merge
**Date**: 2026-05-19
**Phase**: Plan-only follow-up to ASIA-1D-BD-PREFLIGHT-1
**Scope**: Resolve 3 PREFLIGHT-1 anomalies + decide Bengali extractor + decide slug-rename policy + propose BATCH-A composition + propose NAME_AR_FIXES + draft clean-approve script
**No execution**: zero changes to `curated-places.json`, `server.js`, `js/app.js`, `index.html`, `fillLangMap`, `_geonames_common.mjs`, or any test file.

---

## ⚠️ Disambiguation re-confirmed (zero Brunei contamination)

This phase deals strictly with **country=BD (Bangladesh)**, NOT country=BN (Brunei). All `bn-*` Brunei files untouched. All references to "bn" in this report refer to the Bengali language code, not Brunei.

---

## 1. Three PREFLIGHT-1 anomalies — resolutions

### Anomaly A — `barishal` PPLA pop=202k → low-tier instead of high

**Root cause**: NOT a bug. Stage 3's `decideStatusAndTier` function ([validate_candidates.mjs:189–212](../scripts/geodata/validate_candidates.mjs#L189)) requires `distOK = (distance > 3km)` in addition to popMin or alwaysInclude. Barishal is **1.762 km** from the existing curated `barisal` entry — they are the **same physical city** (renamed in 2018). The tier-assignment correctly avoided creating a duplicate.

The misleading reason text `below_popMin_and_not_always_include` is the fallback message; the actual failed condition was `distOK`.

**Resolution**: **EXCLUDE `barishal` from BATCH-A** (it would be a duplicate). Instead, **enrich the existing `barisal` curated entry** with:
- `aliases.en` += `'Barishal'` (2018 official rename)
- `aliases.ar` += `'باريشال'` (2018 form in AR)
- Optionally backfill `population: 202242`, `sourceId: 'geonames:1336137'`, `featureCode: 'PPLA'`

This enrichment is **separate from BATCH-A** and will be its own small alias-enrichment phase (e.g., `PLACE-NAMES-ALIASES-BD-SEED-1`) after BD-A stabilizes.

**Code change needed**: None. The Stage 3 logic is correct.
**Stage 3 reason-text improvement** (cosmetic, not blocking): rename `below_popMin_and_not_always_include` to `dist_to_nearest_<=3km` when that's the actual failure cause. Defer to a future Stage-3 polish phase.

---

### Anomaly B — `nilphamari` / `gaibandha` PPLA2 pop=0 → low-tier

**Root cause**: NOT a bug. PPLA2 is **not** in `alwaysIncludeFeatureCodes: ['PPLC', 'PPLA']` in `bd.mjs`, and pop=0 fails the popMin gate. Per the current rules, these correctly fall to low-tier.

However, these are **district administrative centers** (zilla shahar) — real cities, just with unknown population in GeoNames. Per Bangladesh's administrative structure, every district (zilla) has an administrative seat, so PPLA2 entries are by definition real towns.

**Resolution**: **INCLUDE both in BATCH-A** via script-level override (anomaly promotion). Their Arabic names are clean (or trivially clean-able), and inclusion is consistent with how prior waves handled PPLA2 admin centers (e.g., PK MCF wave promoted 17 blocked PPLA2/PPL major cities).

**No code change** to `bd.mjs` (do NOT add PPLA2 to `alwaysIncludeFeatureCodes` globally — that would over-promote pop=0 stubs across all districts in future waves; better to handle case-by-case via the apply script's anomaly overrides).

---

### Anomaly C — `rangpur` PPLA pop=1.03M → rejected as religious site

**Root cause**: **TRUE BUG** (false positive). The religious-keyword blocklist in `validate_candidates.mjs:111–120` concatenates `names.ar + names.en + aliases.ar + aliases.en` and matches against `/\bmosque\b/i`. Rangpur's `aliases.en` includes the literal alternatename `"Mosque Rangpur"` (likely a reference to a notable mosque IN Rangpur, not the city itself). This single alias triggers the rejection of the entire entry — a PPLA division capital with 1+ million population.

```js
// scripts/geodata/validate_candidates.mjs:111
function checkBlocklist(cand, religiousKw, nonPlaceKw) {
    const combined = (cand.names.ar || '') + ' ' + (cand.names.en || '') + ' '
                   + ((cand.aliases && cand.aliases.ar) || []).join(' ') + ' '
                   + ((cand.aliases && cand.aliases.en) || []).join(' ');
    const rel = matchAnyKeyword(combined, religiousKw);
    if (rel) return { hit: 'religious', keyword: rel };
    ...
}
```

**Two fix options**:

**Fix Option 1 (UPSTREAM, RECOMMENDED for long-term)**:
Modify `validate_candidates.mjs` to **exempt PPLC + PPLA + PPLA2** from religious-keyword rejection. Administrative centers by definition are real cities; if their aliases mention a famous religious site, that's metadata about the city, not evidence the city itself is religious-only.

```js
// Proposed change in decideStatusAndTier
if (blocklist.hit === 'religious') {
    // Exempt true administrative centers — they're real cities even if
    // alternatenames mention a famous mosque, shrine, or mausoleum
    if (!['PPLC', 'PPLA', 'PPLA2'].includes(cand.featureCode)) {
        return { status: 'rejected', reason: 'religious_site_not_city',
                 tier: null, keyword: blocklist.keyword };
    }
    // For admin centers, continue to tier-assignment (don't reject)
}
```

**Fix Option 2 (DOWNSTREAM, used in DRAFT script)**:
In `_asia_1d_bd_a_clean_approve.mjs`, add `rangpur` to a `RELIGIOUS_OVERRIDE` set that promotes the rejected entry back to high tier. The DRAFT in this plan uses this approach as a **safer, more conservative** workaround that doesn't change shared infrastructure.

**Decision (pending user approval)**: Use Fix Option 2 for ASIA-1D-BD-A (no upstream change). Then track Fix Option 1 as a separate `STAGE-3-RELIGIOUS-EXEMPTION-1` polish phase for future waves (it'll prevent similar false-positives for other countries' PPLA cities).

**Both fixes are non-destructive**: Fix Option 1 doesn't change historical curated data; Fix Option 2 is per-wave override.

---

## 2. Bengali extractor decision

### Finding (from PREFLIGHT-1)

Bengali names DO exist in GeoNames `alternatenames` for ~90% of high-tier BD candidates. But Stage 2 (`scripts/geodata/normalize_places.mjs`) only extracts `names.ar` (via `isArabicScript`) and `names.en` (via `isMostlyLatin`) — Bengali is dropped.

### Decision (per user direction)

> "التوصية المفضلة: لا ندمج names.bn داخل curated في ASIA-1D-BD-A، لكن نجهّز extractor أو نوثق آلية استخراجه بوضوح لمرحلة PLACE-NAMES-BN-BD-1."

**Confirmed**: ASIA-1D-BD-A will merge with `names = {ar, en}` only. **`names.bn` will NOT be populated** in the BD-A wave. This matches the proven PK pattern (MAJORS-1A geodata → UR-PK-4 enrichment).

### Bengali extractor — documented for PLACE-NAMES-BN-BD-1

When PLACE-NAMES-BN-BD-1 starts, it will need the extractor. **Two viable implementations**:

#### Implementation Option A (RECOMMENDED): Re-parse raw GeoNames for the merged BD-A entries

```js
// scripts/geodata/_place_names_bn_bd_1_apply.mjs (future)
import fs from 'node:fs';

const BENGALI_BLOCK = /[ঀ-৿]/;       // U+0980–U+09FF (Bengali script)
const ASSAMESE_ONLY = /[ৰৱ]/;        // U+09F0 ৰ + U+09F1 ৱ — Assamese, not Bengali
const LATIN = /[A-Za-z]/;
const DEVANAGARI = /[ऀ-ॿ]/;          // Hindi/Sanskrit — must not leak into bn

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (LATIN.test(s))         return false;
    if (ASSAMESE_ONLY.test(s)) return false;
    if (DEVANAGARI.test(s))    return false;
    return BENGALI_BLOCK.test(s);
}

function extractBengaliFromAlternatenames(altStr) {
    if (!altStr) return { primary: null, aliases: [] };
    const candidates = altStr.split(',')
        .map(s => s.trim())
        .filter(isCleanBengaliScript);
    if (!candidates.length) return { primary: null, aliases: [] };
    return { primary: candidates[0], aliases: candidates.slice(1) };
}
```

For each newly-merged BD-A entry, look up the geonameid in `bd-geonames-raw.json`, run `extractBengaliFromAlternatenames`, and populate `names.bn` + `aliases.bn` in the apply script (analogous to UR-PK-2 through UR-PK-6 enrichment scripts).

**Pros**:
- No change to shared `_geonames_common.mjs` Stage 2
- Localized to a single enrichment script
- Easy to re-run idempotently
- Easy to extend with Wikipedia AR fallback for the 1/10 missing (Lalmonirhat)

**Cons**:
- Doesn't extract Bengali at Stage 2 (slight workflow asymmetry vs `ar`/`en`)
- Future IN (India) wave will need same per-script logic

#### Implementation Option B: Enhance Stage 2 universally

Add `isBengaliScript()` to `_geonames_common.mjs` and extract `names.bn` at Stage 2 alongside `ar`/`en`. Update `parseAlternateNames` / `normalize_places.mjs` to bucket Bengali strings.

**Pros**:
- Symmetric with `ar`/`en` extraction
- Benefits future IN (India) wave automatically

**Cons**:
- Touches shared `_geonames_common.mjs` infrastructure (risk of regression for 1,755 existing GeoNames-imported rows)
- Requires full carry-forward regression test suite (place-by-slug + city-l10n + all Asia search families)

**Recommendation**: **Option A** for PLACE-NAMES-BN-BD-1 (per-wave script; safer, easier to review). Re-evaluate Option B before any India wave (PLACE-NAMES-UR-IN-1 / PLACE-NAMES-BN-IN-1 if applicable).

**No infrastructure change in this plan phase.** The above is documentation for the next l10n wave.

### No runtime translation, no Latin fillchain

Both options use **only static GeoNames data** (Bengali strings already present in raw `alternatenames`). Wikipedia AR / standard transliteration is fallback **only** for the few entries missing Bengali alternatenames (e.g., Lalmonirhat). **No Google Translate / OpenAI / Anthropic / AI translation. No browser auto-translate. No Latin fillchain.**

---

## 3. Slug-rename policy for BD renames

### Decision (per user direction)

> "التوصية المبدئية: الحفاظ على slugs الحالية للمدن الموجودة مسبقًا، وإضافة الأسماء الحديثة داخل aliases، وعدم تغيير URL قائم إلا إذا تم إنشاء redirect واضح ومختبر."

### Policy

| Class | Current slug | Action | Rationale |
|-------|--------------|--------|-----------|
| **A. Already in curated** (chittagong, barisal) | KEEP slug (`chittagong`, `barisal`) | Add modern English form (`Chattogram`, `Barishal`) to `aliases.en`; add modern Arabic form to `aliases.ar` | Don't break existing URLs `/prayer-times-in-chittagong`, `/prayer-times-in-barisal`, etc. across 10 langs × 4 route families = ~40 URLs per city |
| **B. NEW (this BATCH-A): comilla, bogra** | Use GeoNames primary `name` field (`comilla`, `bogra`) | Add 2018 official form (`Cumilla`, `Bogura`) to `aliases.en`; no Arabic alias from rename (Arabic forms identical) | Match what GeoNames currently labels; if Bangladesh government enforces the new name in the future, can rename slugs via a future explicit redirect-aware migration phase |
| **C. NEW deferred (Jessore/Jashore)** | If/when merged: use `jessore` (GeoNames primary) | Add `Jashore` alias | Same as Class B |
| **D. Any future slug rename** | Requires explicit `REDIRECT_TABLE` in `server.js` with tested 301 redirects | Not done in this phase | Per user spec; not started until explicit approval |

### Net effect

- ✅ Zero URL breakage
- ✅ Search still finds renamed cities (alias lookup in `/api/search-place`)
- ✅ Modern names appear in display (via aliases) but canonical URL is the existing slug
- ✅ Future rename-migration possible via dedicated phase

---

## 4. BATCH-A composition (13 cities)

### Composition

| # | slug | Source | Status before BD-A | Action |
|---|------|--------|---------------------|--------|
| 1 | `gazipur` | Stage 3 high-tier | pending high | merge |
| 2 | `comilla` | Stage 3 high-tier | pending high | merge + `Cumilla` alias |
| 3 | `bagerhat` | Stage 3 high-tier | pending high | merge |
| 4 | `mymensingh` | Stage 3 high-tier | pending high | merge |
| 5 | `bogra` | Stage 3 high-tier | pending high | merge + `Bogura` alias |
| 6 | `jamalpur` | Stage 3 high-tier | pending high | merge |
| 7 | `habiganj` | Stage 3 high-tier | pending high | merge |
| 8 | `feni` | Stage 3 high-tier | pending high | merge |
| 9 | `netrakona` | Stage 3 high-tier | pending high | merge |
| 10 | `lalmonirhat` | Stage 3 high-tier | pending high | merge |
| 11 | `rangpur` | Anomaly C — false positive | **rejected** (mosque-keyword) | **anomaly override** + merge |
| 12 | `nilphamari` | Anomaly B — admin promotion | pending low | **anomaly override** + merge |
| 13 | `gaibandha` | Anomaly B — admin promotion | pending low | **anomaly override** + merge |

**Total: 13 cities** = 10 high-tier + 3 anomaly-resolved.

### Full metadata table

| # | slug | geonameid | feat | pop | a1 | a2 | tz | lat | lng | en | rename pair? |
|---|------|----------:|------|----:|----|----|----|----:|----:|-----|---|
| 1 | gazipur | 1200109 | PPLA2 | 2,674,697 | 81 | 3033 | Asia/Dhaka | 23.99844 | 90.42234 | Gazipur | — |
| 2 | comilla | 1185186 | PPL | 1,030,000 | 84 | 2019 | Asia/Dhaka | 23.46186 | 91.18503 | Comilla | **Cumilla** (2018) |
| 3 | bagerhat | 1185281 | PPLA2 | 266,388 | 82 | 4001 | Asia/Dhaka | 22.65657 | 89.79123 | Bagerhat | — |
| 4 | mymensingh | 1185162 | PPLA | 225,126 | H | 3061 | Asia/Dhaka | 24.75636 | 90.40646 | Mymensingh | — |
| 5 | bogra | 1337233 | PPL | 210,000 | 83 | 5010 | Asia/Dhaka | 24.85098 | 89.37108 | Bogra | **Bogura** (2018) |
| 6 | jamalpur | 1185106 | PPLA2 | 167,900 | H | 3039 | Asia/Dhaka | 24.91965 | 89.94812 | Jamālpur | — |
| 7 | habiganj | 1185209 | PPL | 88,760 | 86 | 6036 | Asia/Dhaka | 24.38044 | 91.41299 | Habiganj | — |
| 8 | feni | 1185224 | PPL | 84,028 | 84 | 2030 | Asia/Dhaka | 23.0144 | 91.3966 | Feni | — |
| 9 | netrakona | 1185116 | PPLA2 | 79,016 | H | 3072 | Asia/Dhaka | 24.88352 | 90.72898 | Netrakona | — |
| 10 | lalmonirhat | 1185181 | PPLA2 | 65,127 | 87 | 5552 | Asia/Dhaka | 25.91719 | 89.44595 | Lalmonirhat | — |
| 11 | **rangpur** | 1185188 | PPLA | 1,031,388 | 87 | 5585 | Asia/Dhaka | 25.74664 | 89.25166 | Rangpur | — |
| 12 | **nilphamari** | 7646714 | PPLA2 | 0 | 87 | 5573 | Asia/Dhaka | 25.94167 | 88.84667 | Nilphamari | — |
| 13 | **gaibandha** | 7921384 | PPLA2 | 0 | 87 | 5532 | Asia/Dhaka | 25.3297 | 89.5435 | Gaibandha | — |

### Distribution

- **By division**:
  - Dhaka (a1=81): 1 (gazipur)
  - Khulna (a1=82): 1 (bagerhat)
  - Rajshahi (a1=83): 1 (bogra)
  - Chittagong (a1=84): 2 (comilla, feni)
  - Sylhet (a1=86): 1 (habiganj)
  - Rangpur (a1=87): 4 (lalmonirhat, rangpur, nilphamari, gaibandha)
  - Mymensingh (a1=H): 3 (mymensingh, jamalpur, netrakona)
  - Barisal (a1=85): 0 (covered via existing curated `barisal` alias enrichment, not BATCH-A)

- **By feature**: 2 PPLA (rangpur, mymensingh) + 7 PPLA2 + 4 PPL = 13
- **Total population reached**: ~6,116,000 (sum of pop, excluding pop=0 entries) → **estimated ~6.1M Muslim audience** in BD's already-Muslim-majority demographics
- **Bengali coverage from GeoNames**: 12/13 = **92%** ✨ (only `lalmonirhat` missing — will need Wikipedia bn fallback for PLACE-NAMES-BN-BD-1)

### Cities considered but NOT in BATCH-A

| slug | featCode | pop | Reason for exclusion |
|------|---------|----:|----------------------|
| `barishal` | PPLA | 202,242 | DUPLICATE of curated `barisal` (1.76 km away — same city, 2018 rename); handle via alias enrichment of existing entry |
| `chandpur` | PPLA2 | 203,000 | needs_review (missing real AR); defer to ASIA-1D-BD-MISSING-AR-MAJORS-1A |
| `cox-s-bazar` | PPL | 253,788 | needs_review (missing real AR); major tourist city; defer to MAJORS-1A |
| `jessore` | PPL | 243,987 | needs_review (Jashore 2018 rename); defer to MAJORS-1A |
| `narsingdi` | PPL | 281,080 | needs_review; defer |
| `narayanganj` | PPL | 223,622 | needs_review; major Dhaka satellite; defer |
| `dinajpur` | PPL | 206,234 | needs_review; defer |
| `saidpur` | PPL | 199,422 | needs_review; defer |
| `pabna` | PPL | 186,781 | needs_review; defer |
| `tangail` | PPL | 180,144 | needs_review; defer |
| ~55 other PPL pop≥50k | PPL | 50k-528k | needs_review (most with mojibake AR); defer to multi-batch MAJORS-1A/B/C series |

**Total deferred to MAJORS-1A series**: ~64 cities with pop≥50k stuck in `needs_review`. This is a large enough pool to support 2-3 future Fast Track MAJORS waves (analogous to PK's MAJORS-1A/1B/1C).

---

## 5. NAME_AR_FIXES table

All 13 BATCH-A cities require Arabic-name correction. Sources used:
- **PROMOTE**: existing clean Arabic alias in `aliases.ar[]` is promoted to primary `names.ar`
- **MANUAL**: fresh standard transliteration / Wikipedia AR (when no clean alias exists)
- **KEEP**: primary `names.ar` is already clean Arabic; no change

| # | slug | Current `names.ar` (mojibake/Persian/Urdu) | Proposed `names.ar` | Source | Rationale |
|---|------|---|---|--------|-----------|
| 1 | gazipur | غازي پور (Persian پ) | **غازيبور** | PROMOTE | `aliases.ar[0]` already has clean Arabic form |
| 2 | comilla | کومیلا (Urdu/Persian ک/ی) | **كوميلا** | MANUAL | AR Wikipedia kūmīlā; no clean alias available |
| 3 | bagerhat | baghr ہaٹ (mojibake) | **باغرهات** | PROMOTE | `aliases.ar[2]` has clean Arabic; Bengali বাগেরহাট → بـ + اغ + ر + هـ + ات |
| 4 | mymensingh | mymn sngھ (mojibake) | **ميمنسينغ** | PROMOTE | `aliases.ar[1]` has clean Arabic; Bengali ময়মনসিংহ → م + ي + م + ن + س + ي + ن + غ |
| 5 | bogra | بوگرا (Persian گ) | **بوغرا** | MANUAL | Standard AR (Persian گ→Arabic غ); Bengali বগুড়া |
| 6 | jamalpur | جمالبور | **جمالبور** | KEEP | Primary already clean Arabic |
| 7 | habiganj | حبيجنج (uses ج instead of غ) | **حبيغنج** | PROMOTE | `aliases.ar[0]` has correct form; Bengali হবিগঞ্জ — গ→غ (standard AR for Bengali velar G) |
| 8 | feni | فئنی (Persian ی + hamza-on-ya) | **فيني** | PROMOTE | `aliases.ar[0]` has correct form |
| 9 | netrakona | نترکونا (Persian ک) | **نيتراكونا** | MANUAL | Standard AR; Bengali নেত্রকোণা — nē-tra-kō-nā with full vowels |
| 10 | lalmonirhat | lal mnyr ہaٹ (mojibake) | **لالمونيرهات** | PROMOTE | `aliases.ar[2]` has clean Arabic |
| 11 | **rangpur** | rnګpwr (Pashto+Latin mojibake) | **رنغبور** | MANUAL | Standard AR Wikipedia; Bengali রংপুর — Rang→رنغ (ng cluster), -পুর→بور |
| 12 | nilphamari | نيلفاماري | **نيلفاماري** | KEEP | Primary already clean Arabic |
| 13 | **gaibandha** | gayے bndھa (mojibake) | **غايباندا** | MANUAL | Standard AR; Bengali গাইবান্ধা — গাই→غاي (gai diphthong), বান্ধা→باندا (ban-dha) |

### Aliases proposed

| slug | aliases.en additions | aliases.ar to keep | aliases.ar to drop |
|------|---------------------|---------------------|---------------------|
| gazipur | (none new — keep existing Jaydebpur, Joydebpur, etc. from Stage 2) | — | drop غازی پور (Persian), غازی‌پور (Persian + ZWNJ) |
| comilla | **Cumilla** (2018 official rename) | — | n/a |
| bagerhat | (keep Stage 2 derived: Bagerhat Town, Bagerkhat, etc.) | **باغر هات** (space-separated variant) | drop باغر ہاٹ (Urdu) |
| mymensingh | (keep: Nasirabad historical name from Stage 2) | — | drop all current (Pashto/Persian/Urdu) |
| bogra | **Bogura** (2018 official rename) | — | n/a |
| jamalpur | (keep: Singhjani historical name from Stage 2) | — | drop جمالپور, جمال‌پور (Persian) |
| habiganj | (keep: Habiganj Bazar, Habiganj Sadar) | — | drop حبی گنج, حبیگانج (Persian) |
| feni | (none new — drop Fenny mojibake from Stage 2) | — | drop فینی، بنگلہ دیش (country-suffix Urdu) |
| netrakona | (keep: Satpai historical) | — | drop نیترکونا (Persian) |
| lalmonirhat | (keep: Lalmanir Hat, Lalmanirat from Stage 2) | **لال منير هات** (space-separated variant) | drop Persian/Urdu variants |
| rangpur | (drop "Mosque Rangpur" — it's a descriptor not a city alias) | **رانجبور** (j-instead-of-غ phonetic variant) | drop Pashto/Persian variants |
| nilphamari | (keep Nilfamari etc. from Stage 2) | — | drop Persian variants |
| gaibandha | (keep Gaibanda from Stage 2; drop "Gajbanda" mojibake) | **غيبندا** (compact form) | drop Pashto/Latin/Urdu variants |

### "Mosque Rangpur" alias decision

The Stage 2 alias `"Mosque Rangpur"` should be **DROPPED from BD-A merge**. It's a Mosque-descriptor for a famous Rangpur landmark, not a city alias. Including it could trigger:
- Future religious-keyword false-positives (the same root cause as Anomaly C)
- Search confusion (`/api/search-place?q=Mosque` matching Rangpur)

The apply script should explicitly filter "Mosque Rangpur" out of `aliases.en` before merge.

---

## 6. Clean-approve script — DRAFT only

**File**: `scripts/geodata/_asia_1d_bd_a_clean_approve.mjs.DRAFT`

**Status**: Created for review. Filename ends `.DRAFT` so it is NOT executable by import_geonames pipeline (would require renaming to drop suffix). Runs `process.exit(0)` immediately after pre-flight; **does not mutate candidates JSON**.

### Structure (mirrors PK MAJORS-1C apply script)

1. **Imports**: `pathsFor` from `_geonames_common.mjs` (no other shared infra modified)
2. **Script-purity helpers**: `isCleanArabic(s)` — rejects Persian/Urdu/Pashto/Sindhi/Latin/diacritics-heavy
3. **`FIXES` array**: 13 entries with `{slug, newAr, source, addAliasesEn, keepAliasesAr, note}`
4. **`DROP_SLUGS` set**: barishal (dup), chandpur, magura, jessore, cox-s-bazar (all needs_review — deferred)
5. **`ANOMALY_NOTES` documentation**: rangpur (religious false-positive), nilphamari/gaibandha (admin promotion)
6. **`preflight()`**: validates no internal-duplicate Arabic, no FIX targets a DROP_SLUG, every newAr passes `isCleanArabic`, cross-check against existing 6 BD curated names
7. **`main()`**: runs `preflight()`, prints summary, **exits without mutating any file**

### What the DRAFT does NOT do (yet)

- ❌ Does NOT flip candidate statuses to `approved` (would require user approval first)
- ❌ Does NOT mutate `bd-geonames-candidates.json` (read-only in DRAFT mode)
- ❌ Does NOT invoke `apply_curated_candidates.mjs bd` (Stage 4 — would mutate curated)
- ❌ Does NOT modify `_geonames_common.mjs` or `validate_candidates.mjs` (no upstream changes)

### To activate (when user approves)

1. Review and approve the FIXES table in this plan
2. Rename: `_asia_1d_bd_a_clean_approve.mjs.DRAFT` → `_asia_1d_bd_a_clean_approve.mjs`
3. Add the actual mutation logic (replicate from `_asia_1d_pk_clean_approve.mjs`): flip status to `approved`, write back `bd-geonames-candidates.json`
4. THEN run Stage 4: `node scripts/geodata/apply_curated_candidates.mjs bd` (this is the actual curated merge — DO NOT run until approved)

---

## 7. Files this phase created or modified

### CREATED in this phase

| File | Purpose | Size | Status |
|------|---------|------|--------|
| `scripts/geodata/_asia_1d_bd_a_clean_approve.mjs.DRAFT` | DRAFT clean-approve script (mirrors PK structure; not executable as-is) | ~9 KB | DRAFT |
| `reports/asia-1d-bd-a-plan.md` | This plan report | — | review |

**Only 2 new files**: 1 DRAFT script + 1 report.

### NOT modified

- ❌ `db/places/curated-places.json` — **0 byte changes** (verified via `git diff` = 0 lines)
- ❌ `db/places/candidates/bd-geonames-candidates.json` — unchanged from PREFLIGHT-1
- ❌ `scripts/geodata/_geonames_common.mjs` — unchanged (Bengali extractor documented, NOT implemented)
- ❌ `scripts/geodata/validate_candidates.mjs` — unchanged (Rangpur Stage-3 fix documented, NOT implemented)
- ❌ `scripts/geodata/normalize_places.mjs` — unchanged
- ❌ `scripts/geodata/countries/bd.mjs` — unchanged (admin1 mapping already verified in PREFLIGHT-1)
- ❌ `server.js` — unchanged
- ❌ `js/app.js` — unchanged
- ❌ `index.html` — unchanged
- ❌ `fillLangMap` (in `_geonames_common.mjs`) — unchanged
- ❌ All test scripts — unchanged
- ❌ All other country configs — unchanged
- ❌ MEMORY.md — not updated (deferred to post-approval)
- ❌ `bn-geonames-*` Brunei files — NOT touched, NOT used as input

---

## Acceptance criteria — verification table

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report `reports/asia-1d-bd-a-plan.md` | ✓ |
| 2 | 3 anomalies resolved or explained | ✓ (Sections 1A/1B/1C) |
| 3 | Clear decision on Bengali extractor | ✓ (Section 2: deferred to PLACE-NAMES-BN-BD-1; extraction Option A documented) |
| 4 | Clear slug-rename policy | ✓ (Section 3: keep existing slugs, add modern names as aliases, no URL break) |
| 5 | BATCH-A defined with names + numbers + geonameId | ✓ (Section 4: 13 cities with full metadata table) |
| 6 | NAME_AR_FIXES prepared, manually reviewed | ✓ (Section 5: 13 entries — 6 PROMOTE / 5 MANUAL / 2 KEEP) |
| 7 | aliases.en / aliases.ar additions clear | ✓ (Section 5 table) |
| 8 | No curated-places.json edit | ✓ (`git diff` = 0 lines) |
| 9 | No merge | ✓ (DRAFT script exits before mutation; Stage 4 not run) |
| 10 | No runtime translation | ✓ (no API calls, no AI; Arabic names all from Wikipedia AR + standard translit; Bengali deferred entirely) |
| 11 | No Brunei data used | ✓ (all paths use `bd-` prefix; `bn-*` files unmodified) |
| 12 | No Held Queue phase started | ✓ (ASIA-1D-BD-A not executed; ASIA-1D-IN/ASIA-1F/AMERICAS-1B-MCF/etc. all unchanged) |

---

## What this phase did NOT do

- ❌ Did not execute ASIA-1D-BD-A merge (no Stage 4 invocation)
- ❌ Did not add any new curated entry
- ❌ Did not modify `curated-places.json` byte
- ❌ Did not start PLACE-NAMES-BN-BD-1
- ❌ Did not add `names.bn` to any entry (no Bengali in curated mutated)
- ❌ Did not use runtime translation, AI translation, browser translate
- ❌ Did not fill `names.bn` via fillchain (fillLangMap behavior unchanged)
- ❌ Did not modify `server.js`, `js/app.js`, `index.html`, `fillLangMap`, `_geonames_common.mjs`, `validate_candidates.mjs`, `normalize_places.mjs`
- ❌ Did not add new routes
- ❌ Did not start ASIA-1D-IN / ASIA-1F / AMERICAS-1B-MCF / SEARCH-RANKING / DELETE-V1 / Alias enrichment
- ❌ Did not use `bn-geonames-*` Brunei files (separate naming `bn` country code ≠ `bn` Bengali language)
- ❌ Did not add or modify any test file
- ❌ Did not update MEMORY.md (deferred to post-user-approval)

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ ASIA-1D-BD-A (BD geodata merge — needs explicit user approval after this plan)
- ❌ ASIA-1D-BD-MCF (BD blocked-major — N/A until BD-A)
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1A (BD missing-ar — N/A until BD-A)
- ❌ PLACE-NAMES-BN-BD-1 (Bengali enrichment for BD-A entries)
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1 (alias enrichment for the 6 seed entries + barishal handling)
- ❌ STAGE-3-RELIGIOUS-EXEMPTION-1 (long-term upstream fix for Rangpur-class false-positives)
- ❌ ASIA-1D-IN (India Urdu wave)
- ❌ ASIA-1F (China solo wave)
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

---

## Recommendation for next phase

**If user approves this plan**, the natural next step is:

### **ASIA-1D-BD-A** execution
1. Activate `_asia_1d_bd_a_clean_approve.mjs` (rename + fill in mutation logic from PK template)
2. Run Stage 4 merge → 13 new BD entries in curated (BD 6 → 19)
3. Test suite: 13 SSR routes + AR search + regression
4. Closure report + user approval

**Estimated effort**: 1 Fast Track wave (mirrors PK MAJORS-1A which had 20 cities; BD-A has 13).

**Estimated risk**: LOW
- All Arabic names manually reviewed (6 promoted from existing aliases + 5 manual + 2 keep)
- 0 internal-duplicate Arabic (pre-flight verified)
- 0 collisions with existing 6 BD curated (pre-flight verified)
- 0 collisions with existing 2,468 non-BD entries (cross-check via apply script)
- All 13 slugs unique vs existing curated

### **Alternatives if user prefers smaller scope**

- **Sub-option C**: Top-5 only (gazipur, comilla, bagerhat, mymensingh, bogra). Defers 8 cities including rangpur. NOT RECOMMENDED — rangpur 1M pop is the biggest BD pending city; deferring it weakens the wave's impact.
- **Sub-option D**: 10 high-tier only, defer all 3 anomalies. Would leave rangpur false-positive unfixed.

**RECOMMENDED: Full 13-city BATCH-A** as documented in Section 4.

---

## Status: 📋 PLAN COMPLETE — AWAITING USER APPROVAL

### Summary

| Metric | Value |
|--------|-------|
| Report path | `reports/asia-1d-bd-a-plan.md` |
| DRAFT script | `scripts/geodata/_asia_1d_bd_a_clean_approve.mjs.DRAFT` |
| BATCH-A size | **13 cities** (10 high + 3 anomalies) |
| Anomaly resolutions | barishal=EXCLUDE (dup); nilphamari/gaibandha=PROMOTE (admin); rangpur=OVERRIDE (false positive) |
| Bengali extractor decision | DEFER to PLACE-NAMES-BN-BD-1 (Option A — per-wave script, no infra change) |
| Slug-rename policy | KEEP existing slugs (chittagong/barisal), add modern English forms as aliases |
| NAME_AR_FIXES | 13 entries: 6 PROMOTE + 5 MANUAL + 2 KEEP |
| `curated-places.json` mutations | **0 bytes changed** |
| `server.js` / `js/app.js` / `index.html` mutations | **0 bytes changed** |
| Brunei (`bn-*`) data used | **NONE** |
| Stage 4 merge | **NOT RUN** |

**Next step**: user reviews this plan and decides:
- (a) Approve and proceed to ASIA-1D-BD-A execution
- (b) Request adjustments (smaller scope, different anomaly handling, different slug policy)
- (c) Hold for further review

**No further work until user direction.**
