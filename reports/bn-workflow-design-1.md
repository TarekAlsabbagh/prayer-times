# BN-WORKFLOW-DESIGN-1 — Design report

**Status**: 📋 DESIGN / RESEARCH ONLY — no execution yet, awaiting user decision
**Date**: 2026-05-19
**Phase**: New design phase opened after PLACE-NAMES-UR-PK-6 closure (`87d43d6`)
**Scope**: Design a workflow for adding real Bengali names (`names.bn`) to Bangladesh (BD) cities. Pre-flight study before any GeoData wave (ASIA-1D-BD).
**No changes made**: 0 mutations to `curated-places.json` / `server.js` / `js/app.js` / `fillLangMap` / `index.html`. No runtime translation. Report only.

---

## ⚠️ Critical Disambiguation Up Front

This project uses two-letter ISO codes for both countries and languages, and **`bn` is ambiguous**:

| Code | Meaning | Where it appears |
|------|---------|------------------|
| `bn` (country) | **Brunei Darussalam** | `scripts/geodata/countries/bn.mjs`, `db/places/sources/BN.txt`, `bn-geonames-*.json` (3 files in candidates/), 4 BD-curated entries with `countryCode:"bn"` |
| `bn` (language) | **Bengali** | `names.bn`, `aliases.bn`, route prefix `/bn/`, `SUPPORTED_LANGS` array |
| `bd` (country) | **Bangladesh** | `countryCode:"bd"` for 6 existing curated entries; **no `bd.mjs` config exists yet**; no `BD.txt`/`BD.zip` in sources |

Throughout this report:
- "BD" = country = Bangladesh
- "bn" (lowercase, unquoted in code context) = language = Bengali
- "BN" (uppercase, country context) = Brunei

The naming collision means any `bn-*` candidate file currently in this repo is **about Brunei**, not Bengali / Bangladesh. The new workflow must NOT confuse these.

---

## 1. How will we add `names.bn` for Bangladeshi cities?

### Current state (verified 2026-05-19)

- **6 BD cities in curated** (`countryCode:"bd"`): `dhaka`, `chittagong`, `sylhet`, `rajshahi`, `khulna`, `barisal`.
- **All 6 already have full 10-lang `names`** (ar, bn, de, en, es, fr, id, ms, tr, ur) — seeded directly when curated was bootstrapped, not via the GeoNames pipeline.
- **All 6 already have `aliases.bn`** with 1–2 variants each (e.g., chittagong has `চট্টগ্রাম` + `চাটগাঁ` historical Chatga).
- **All 6 entries have `population: 0`** and no `featureCode` set — seed-only entries, not GeoNames-imported.
- **NO `bd.mjs` country config**, **NO `BD.txt`/`BD.zip` GeoNames source**, **NO `bd-geonames-*.json` candidates**. The full Bangladesh-pipeline path is **unbuilt**.

### Implication

This is **not analogous** to PK-1 (alias-only enrichment for the 10 seed cities) — there is nothing to enrich on the 6 seed cities; their Bengali names already exist and look clean.

What "ASIA-1D-BD" really needs to do is:
1. **Build the BD pipeline from scratch** (analogous to Phase D ASIA-1D-PK in `0bdda2d`): create `bd.mjs` config, fetch `BD.txt` GeoNames data, run Stage 1–3 candidate extraction, Stage 3.5 Arabic quality gate, Stage 4 merge.
2. **Expand BD coverage** from 6 → ~80-120 high-tier cities (population ≥ 50k or PPLA/PPLA2 admin).
3. **For each newly-merged city, populate `names.bn`** — this is what `PLACE-NAMES-BN-BD-1` (analogous to UR-PK-2/3/4/5/6) does.

So "adding `names.bn` for BD cities" really means: **first import a wave of new BD cities via GeoNames (with `names = {ar, en}` only), then run a separate Bengali-enrichment wave that fills in `names.bn` + `aliases.bn`**.

This is the same 2-phase split that worked for PK (geodata Fast Track → l10n Fast Track), proven across 6 consecutive waves on 2026-05-19.

---

## 2. Bengali name sources (priority order)

When adding `names.bn` for a new BD city, sources should be consulted in this order:

| Priority | Source | Why | Coverage estimate |
|----------|--------|-----|-------------------|
| 1 | **GeoNames `alternatenames` lang=bn** | Already in pipeline, structured TSV, machine-readable. Stage 2 can extract automatically. | ~60-80% of pop≥50k BD cities (estimate from observed BD GeoNames `BD.txt` should be inspected pre-flight) |
| 2 | **Bengali Wikipedia article title** (https://bn.wikipedia.org/wiki/XXX) | Canonical Bengali Wikipedia form. Includes proper conjuncts (যুক্তাক্ষর), retroflex letters (ট/ড/ণ), and dialect-correct spelling (Chittagong → চট্টগ্রাম). | ~80-95% of pop≥50k BD cities |
| 3 | **Wikidata `P1448` (official name) + lang `bn`** | When Bengali Wikipedia article doesn't exist but the city has a Wikidata entry with `bn` labels. | Edge-case fill for smaller cities |
| 4 | **Manual transliteration from English** | Only when 1-3 all fail. Uses standard Bengali-Roman correspondences: `ja → জা`, `kha → খা`, `ti → টি`, retroflex `Tt → ট` / `Dd → ড` / `Rr → ড়`. | Last resort, like 4-29 Wikipedia AR translit in MAJORS-1A/B/C |

### Critical: historical-name awareness

Bangladesh underwent **two recent official renames** that affect Bengali spelling:
- **Chittagong → Chattogram** (officially renamed 2018; English form changed, Bengali চট্টগ্রাম unchanged).
- **Barisal → Barishal** (officially renamed 2018; English form changed, Bengali বরিশাল unchanged).
- Similar pending: Comilla → Cumilla (2018), Jessore → Jashore (2018), Bogra → Bogura (2018).

For these cases, both spellings should be considered: the slug typically follows the English re-spelling, but `aliases.en` + `aliases.bn` should preserve the alternate form.

### What we do NOT use

- ❌ **No runtime translation API** (Google Translate / OpenAI / Anthropic etc.) — same hard rule as UR-PK.
- ❌ **No AI-paraphrased Bengali** — all values must be sourced from real Bengali Wikipedia / Wikidata / GeoNames data.
- ❌ **No fillchain** — `names.bn` must never be set to `names.en` or a Latin transliteration.

---

## 3. Bengali script quality gate

This is the analog of `isCleanArabic()` (Stage 3.5) for Arabic and `isCleanUrduScript()` for Urdu.

### Proposed `isCleanBengaliScript(s)` (design draft)

```js
const HAS_LATIN              = /[A-Za-z]/;                 // reject if matches
const HAS_BENGALI_BLOCK      = /[ঀ-৿]/;           // require at least one
const SUSPICIOUS_NON_BENGALI = /[ৰৱ]/;            // Assamese-only ৰ ৱ
const HAS_DEVANAGARI         = /[ऀ-ॿ]/;           // reject (Hindi/Sanskrit block)
const HAS_OTHER_INDIC        = /[਀-௿]/;           // reject (Gurmukhi/Gujarati/Tamil/Telugu)

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s)) return false;
    if (SUSPICIOUS_NON_BENGALI.test(s)) return false;
    if (HAS_DEVANAGARI.test(s)) return false;
    if (HAS_OTHER_INDIC.test(s)) return false;
    return HAS_BENGALI_BLOCK.test(s);
}
```

### Bengali Unicode block details (U+0980 – U+09FF)

| Range | Content | Notes |
|-------|---------|-------|
| U+0980–U+0983 | Bengali signs (anusvara ং, visarga ঃ, candrabindu ঁ) | OK — common in Bengali |
| U+0985–U+09B9 | Vowels (অ আ ই …) and consonants (ক খ গ …) | OK — core script |
| U+09BC | Nukta ় | OK — diacritic for ড়/ঢ়/য় |
| U+09BD | Avagraha | rare; OK |
| U+09BE–U+09CC | Dependent vowel signs (া ি ী …) | OK |
| U+09CD | Halant ্ | OK — required for conjuncts |
| U+09CE | Khanda ta ৎ | OK |
| U+09D7 | Au length mark ৗ | OK |
| **U+09DC, U+09DD** | ড় ঢ় (precomposed retroflex) | OK — but may also appear decomposed as ড+় / ঢ+় |
| U+09DF | য় (precomposed yya) | OK |
| **U+09E0–U+09E3** | Vocalic R, L | rare; OK |
| **U+09E6–U+09EF** | Digits ০-৯ | OK in numerical contexts; for city names usually absent |
| **U+09F0, U+09F1** | ৰ ৱ (Assamese-only) | **REJECT** — Bengali doesn't use these |
| U+09F2, U+09F3 | Rupee marks ৲ ৳ | not a city-name letter; rare |
| U+09F4–U+09F9 | Currency numerators | edge-case; reject in city names |
| U+09FA | Isshar ৺ | not a letter |
| U+09FB | Ganda mark ৻ | not a letter |

### Density grading (analog of Urdu 95/85/80)

| Score | Definition | Example |
|-------|------------|---------|
| **95** | Contains Bengali-distinctive letters: conjuncts (with halant ্), retroflex letters (ট ঠ ড ঢ ণ), or precomposed ড়/ঢ়/য় | চট্টগ্রাম, রাজশাহী |
| **85** | Pure Bengali script, no conjuncts but uses signature vowels (ই ঊ ঋ ও ঔ) or dependent signs (ী ূ ৃ ৌ) | ঢাকা, সিলেট |
| **80** | Pure Bengali script, only basic consonants + simple vowels | বরিশাল, খুলনা |

(Unlike Urdu, Bengali has no "Persian-shared script" tier because Bengali is in a totally different Unicode block from Arabic/Persian. Pure-script-only ≥80 is the floor.)

### Sample current BD city Unicode breakdown

| Slug | `names.bn` | Codepoints | Tier |
|------|-----------|-----------|------|
| `dhaka` | ঢাকা | U+09A2,U+09BE,U+0995,U+09BE | 85 (uses ঢ retroflex) |
| `chittagong` | চট্টগ্রাম | U+099A,U+099F,U+09CD,U+099F,U+0997,U+09CD,U+09B0,U+09BE,U+09AE | **95** (two halants, retroflex ট×2) |
| `sylhet` | সিলেট | U+09B8,U+09BF,U+09B2,U+09C7,U+099F | 85 (retroflex ট) |
| `rajshahi` | রাজশাহী | U+09B0,U+09BE,U+099C,U+09B6,U+09BE,U+09B9,U+09C0 | 85 (no conjuncts but uses ী) |
| `khulna` | খুলনা | U+0996,U+09C1,U+09B2,U+09A8,U+09BE | 80 (simple) |
| `barisal` | বরিশাল | U+09AC,U+09B0,U+09BF,U+09B6,U+09BE,U+09B2 | 80 (simple) |

This sample density distribution (1/6 = 17% at tier-95, 3/6 = 50% at tier-85, 2/6 = 33% at tier-80) suggests Bengali enrichment density grading will skew lower than Urdu's 86% (UR-PK-6). That's fine — Bengali is a less letter-distinctive script overall (no Persian-vs-Arabic dual-script tension).

---

## 4. Prevention of Latin fillchain in `names.bn`

### Already protected by infrastructure

`fillLangMap` (in [scripts/geodata/_geonames_common.mjs:419](../scripts/geodata/_geonames_common.mjs#L419)) explicitly guards `bn`:

```js
export const SUPPORTED_LANGS = ['ar','en','fr','de','tr','ur','id','es','bn','ms'];
export function fillLangMap(partial, fallback) {
    const out = {};
    out.en = (partial && partial.en) ? partial.en : fallback;
    if (partial && partial.ar) out.ar = partial.ar;
    // All 8 other langs (fr/de/tr/ur/id/es/bn/ms): present iff explicitly
    // provided. Missing means missing.
    for (const l of SUPPORTED_LANGS) {
        if (l === 'en' || l === 'ar') continue;
        if (partial && partial[l]) out[l] = partial[l];
    }
    return out;
}
```

So unlike pre-2026 (when fillLangMap cascaded `fallback` into all 10 lang slots and caused 1,755 Latin-in-ur leaks), `names.bn` **cannot** receive a Latin value via the Stage 4 merge. This was proven in UR-PK-2/3/4/5/6 — across 6 PK waves, **0 fillchain leaks across 7 langs × 30+ entries = thousands of checks**.

### Apply-script-level guard (proposed)

The PLACE-NAMES-BN-BD-1 (and subsequent BN waves) apply scripts should additionally enforce:

1. **Pre-flight validation**: every proposed `bn` value passes `isCleanBengaliScript()`.
2. **Post-mutation assertion**: after writing, re-read all BD entries that received `bn` and assert `Object.keys(e.names).sort()` is one of `['ar','en','bn']` or `['ar','en','bn']` plus any pre-existing langs — never `['bn','en']` without `ar`, never `[…,'fr',…]` if no fr was explicit.
3. **PRIOR-N guard**: track the slug-set of "previously enriched" BD cities and assert their `names.bn`/`aliases.bn` are byte-for-byte unchanged. (Same as PRIOR-119 in UR-PK-6.)
4. **Cross-collision pre-flight**: assert no proposed `bn` value collides with an existing BD `names.bn` (same as UR-PK-6's cross-collision guard).

These four guards together replicate the proven UR-PK-6 safety pattern.

---

## 5. Difference between Arabic/Urdu workflow and Bengali workflow

| Aspect | Arabic (Phase D, MAJORS) | Urdu (UR-PK-*) | Bengali (BN-BD-*) |
|--------|--------------------------|-----------------|---------------------|
| **Source priority 1** | GeoNames `lang=ar` alternatenames | Urdu Wikipedia + standard translit (zero `bn`/`ur` in GeoNames for many regions) | GeoNames `lang=bn` alternatenames |
| **Source priority 2** | Wikipedia AR canonical | Standard translit (Mandi-→منڈی, Tando-→ٹنڈو etc.) | Bengali Wikipedia title |
| **Source priority 3** | Manual translit (e.g. غره for -garh) | Manual translit per Urdu Wikipedia convention | Wikidata bn label |
| **Pre-gate stage** | Stage 3.5 `isCleanArabic` + Stage 3.4 PERSIAN_CHAR_MAP (Persian→Arabic for IR/AF) | Inherits Stage 3.5 (`names.ar` cleaned upstream) | NEW Stage 3.5b `isCleanBengaliScript` (parallel to AR check, not a transform — Bengali GeoNames is generally clean, no char-map needed) |
| **Character map** | PERSIAN_CHAR_MAP (32 mappings: ی→ي, ک→ك, پ→ب, چ→ج, گ→غ, ژ→ز + Urdu retroflex maps to nearest Arabic equiv + Pashto + Uyghur + Kurdish) | Same | **Probably none required** — Bengali Wikipedia uses standardized Unicode; no Pashto/Persian-style cross-script bleed. (Confirm during pre-flight survey of BD.txt.) |
| **Density tiers** | n/a (Arabic is the single canonical) | 95/85/80 (retroflex / Persian-shared / pure shared) | 95/85/80 (conjunct-or-retroflex / simple-with-signature-vowels / pure-simple) |
| **Polluted aliases** | Persian/Urdu leaks (cleaned per ASIA-1D-PK), Sindhi ڪ ڙ, Pashto ټ ډ | dropped 18 in UR-PK-3 (Pashto/Sindhi/retroflex-removed) | Likely **Assamese ৰ ৱ** intrusions if any (Bangladesh borders Assam); also possible Devanagari intrusion from cross-border Hindi data. To audit during pre-flight. |
| **Historical-name patterns** | tah-marbuta vs ـة (ديرة), honorific-prefix strip (شريف) | none significant | **Bangladesh 2018 renames**: Chittagong/Chattogram, Barisal/Barishal, Comilla/Cumilla, Jessore/Jashore, Bogra/Bogura. Each may need both English forms as `aliases.en` and possibly both Bengali variants as `aliases.bn`. |
| **GeoNames availability assumption** | High (~80% for sa/ye/ma/eg) but 0% for some (PK had zero Arabic; AF had Persian to remap) | LOW for PK majors (~0% — UR-PK-4/5/6 all Wikipedia-manual) | **Unknown — to audit at pre-flight**: probably moderate (Bangladesh is a major Bengali-using country, GeoNames volunteers contributed; but smaller cities may be Latin-only) |
| **Population threshold** | popMin=50k for PK + alwaysInclude PPLC/PPLA | inherits from geodata wave | inherits from geodata wave (suggest same: popMin=50k + alwaysInclude PPLC/PPLA1/PPLA2) |

### Summary

The Bengali workflow is **structurally similar** to AR/UR (2-phase: geodata → l10n) but is **simpler in script handling** (no PERSIAN_CHAR_MAP analog needed, just a clean-script gate) and **richer in source data** (GeoNames bn alternatenames likely usable, unlike PK Urdu which had zero). The new piece is **the rename-aware alias pattern** (Chittagong/Chattogram etc.).

---

## 6. Do we need `aliases.bn`?

**Yes** — for three reasons:

### Reason A: 2018 official-rename pairs

Bangladesh renamed 5+ cities in 2018 (English-form changes; Bengali forms typically unchanged but slugs follow English):
- **Chittagong → Chattogram**: Bengali চট্টগ্রাম unchanged; both English forms in real-world use. → keep `চাটগাঁ` (historical Chittagong) as alias too.
- **Barisal → Barishal**: Bengali বরিশাল unchanged; need to handle slug-vs-Bengali mismatch.
- **Comilla → Cumilla**: Bengali কুমিল্লা — same situation.
- Similar: Jessore/Jashore (যশোর), Bogra/Bogura (বগুড়া).

For each: `names.bn` = canonical Bengali Wikipedia spelling; `aliases.bn` may include historical or pre-Bangla-Academy form.

### Reason B: Variant spellings / dialect forms

Some Bengali cities have multiple accepted spellings:
- ঢাকা vs ঢাকা শহর (with `শহর = city` suffix)
- চট্টগ্রাম vs চাটগাঁ (the historical/colloquial Chatga form already used as alias in dhaka entry)
- Old British-era spellings often have ৃ→ী or ্ stripped variants

### Reason C: Search disambiguation

Same as UR-PK aliases (`جلالپور جٹاں` no-space variant, چناب نگر historical rename): users may search a Bengali name with or without spaces, with old or new spelling. Aliases improve `/api/search-place` hit rate.

### Estimated `aliases.bn` density

Based on the 6 existing curated BD entries (1.0 alias per row on average), expect:
- ~50-70% of new BD cities to need 0 aliases
- ~25-40% to need 1 alias (variant form)
- ~5-15% to need 2 aliases (rename + variant)

This is **lower** than UR-PK-6 (13/29 = 45% with aliases) because Bengali has fewer spelling-system divergences than Persian-Urdu-Pashto-Sindhi do.

---

## 7. How will we test `/bn/prayer-times-in-{slug}`?

### Infrastructure already in place ✅

The SSR layer fully supports `/bn/` across all 4 city route families, courtesy of PLACE-NAMES-CROSS-PAGE-NAVIGATION-CONSISTENCY-FIX-1 ([`1b597b5`](../reports/place-names-cross-page-navigation-consistency-fix-1.md), 2026-05-18):

- `/bn/prayer-times-in-{slug}` ✓
- `/bn/moon-in-{slug}` ✓
- `/bn/moon-today-in-{slug}` ✓
- `/bn/qibla-in-{slug}` ✓

All four routes inject `window.__PRAYER_CITY__` SSR seed with `name = names[lang]` for `lang === 'bn'`.

The template-consistency chain (PLACE-NAMES-SITEWIDE-TEMPLATE-CONSISTENCY-FIX-1 + PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1) ensures schema, title, h1, breadcrumb, FAQ all read Bengali from the SSR seed.

The homepage default-city is covered by PLACE-NAMES-HOMEPAGE-DEFAULT-CITY-L10N-FIX-1 (`bn:'মক্কা'` in `_MECCA_BY_LANG`).

### Proposed test pattern (analog of `_test_place_names_ur_pk_6.mjs`)

`scripts/_test_place_names_bn_bd_1.mjs` with **11 sections** (Parts A–K):

| Part | What | Assertion |
|------|------|-----------|
| A | Disk state | All N new BD cities have user-approved `names.bn` |
| B | `names.ar` preserved | byte-for-byte vs MAJORS-equivalent wave |
| C | PRIOR-N BD entries unchanged | post-mutation guard |
| D | No Latin fillchain | 0 leaks across 7 langs × N entries (`fr/de/tr/ur/id/es/ms` — note: `ar` and `en` are required, `bn` is the target) |
| E | SSR `/bn/prayer-times-in-{slug}` | seed.name = expected Bengali for 10 priority cities |
| F | Cross-route SSR | 3 cities × 4 routes (prayer/moon/moon-today/qibla) = 12 PASS |
| G | Regression on prior phases | `/bn/prayer-times-in-dhaka` etc. for the 6 seed cities |
| H | 🏆 BD Bengali coverage milestone | e.g., `BD total >= X`, `BD bn-coverage = X/X` |
| I | 0 duplicate Bengali names within BD | `urCount` style check |
| J | Clean-Bengali-script validation | All names.bn pass `isCleanBengaliScript()` |
| K | Aliases.bn clean-script validation | All aliases.bn pass `isCleanBengaliScript()` |

This mirrors UR-PK-6's 69/69 test structure, which is the most-recent proven template.

### Priority cities to test (top 10 by population)

Based on estimated GeoNames BD coverage (pop≥50k):
- `dhaka` (~11M metropolitan)
- `chittagong/chattogram` (~5M)
- `khulna` (~660k)
- `rajshahi` (~450k)
- `sylhet` (~380k)
- `barisal/barishal` (~350k)
- `rangpur` (~340k) — NEW
- `comilla/cumilla` (~300k) — NEW with rename
- `narayanganj` (~280k) — NEW
- `mymensingh` (~270k) — NEW

### Regression URLs to preserve

After any BN wave:
- `/bn/prayer-times-in-dhaka` (seed: ঢাকা)
- `/bn/prayer-times-in-chittagong` (seed: চট্টগ্রাম)
- `/bn/prayer-times-in-sylhet` (seed: সিলেট)
- `/prayer-times-in-dhaka` (AR: دكا) — unchanged
- `/en/prayer-times-in-dhaka` (EN: Dhaka) — unchanged
- `/ur/prayer-times-in-dhaka` (UR: ڈھاکا) — unchanged

---

## 8. Should ASIA-1D-BD start GeoData first, or combine GeoData + BN-BD-1 into a single batch?

### Two options

**Option A: Separate waves (PK pattern)** — _RECOMMENDED_

```
ASIA-1D-BD-A          → +30-50 BD cities, only {ar, en} populated     [Fast Track Geodata]
PLACE-NAMES-BN-BD-1   → +30-50 names.bn for the ASIA-1D-BD-A entries  [Fast Track L10N]
ASIA-1D-BD-MCF        → +N blocked-major fixes (if any)                [Fast Track Geodata]
PLACE-NAMES-BN-BD-2   → +N names.bn for MCF entries                    [Fast Track L10N]
ASIA-1D-BD-MISSING-AR-MAJORS-1A → +N missing-ar majors                  [Fast Track Geodata]
PLACE-NAMES-BN-BD-3   → +N names.bn for MAJORS-1A entries              [Fast Track L10N]
```

**Pros**:
- Each phase ≤ 50 cities = comfortably under Fast Track STOP triggers.
- Arabic correctness (geodata phase) and Bengali correctness (l10n phase) are **separable concerns** — one can fail review without blocking the other.
- Matches the proven UR-PK-1→UR-PK-6 pattern exactly (6 closed Fast Tracks, 0 rollbacks).
- Tests can be scoped narrowly (each phase has its own smoke).
- Backups are smaller and rollback windows are tighter.

**Cons**:
- More commits, more user-review touchpoints.
- Slightly longer end-to-end timeline.

**Option B: Combined batches** — _NOT RECOMMENDED_

```
ASIA-1D-BD-A-with-bn  → +30-50 BD cities, populated with {ar, en, bn} in one merge
```

**Pros**:
- Fewer commits.
- Bengali names available immediately on first merge.

**Cons**:
- **Violates Fast Track STOP-budget discipline**: combining two waves means doubling the decisions per phase. A wave with 30 cities × 2 langs decision-load = effectively a 60-decision wave, well above Fast Track's ≤3-manual-decisions threshold.
- **Mixes failure modes**: if Bengali script fails validation for 5 cities and Arabic fails for 3 different cities, the wave needs partial re-runs; the apply script becomes more complex.
- **No analog in repo history**: every successful enrichment wave (UR-AF-1, UR-IR-1, UR-PK-1..6) was a separate phase from its sibling geodata wave.
- **Larger backups, broader rollback**.
- **Pre-flight cross-collision checks** become harder: validating proposed bn vs PRIOR-bn must run AND validating proposed ar vs PRIOR-ar must run AND must not interact.

### Recommendation: Option A

Use the same 2-phase pattern proven across 6 PK waves. **First wave**: ASIA-1D-BD-A geodata only (Arabic-correct merge). **Second wave**: PLACE-NAMES-BN-BD-1 (add `names.bn`).

The user has explicitly approved this pattern 6 times in a row for PK on 2026-05-19 (MAJORS-1A → UR-PK-4 → MAJORS-1B → UR-PK-5 → MAJORS-1C → UR-PK-6). Continuity wins.

---

## 9. Clear recommendation for the next phase

### Recommended next phase: **ASIA-1D-BD-PREFLIGHT-1**

This is a **second design/research phase** (no merges, no curated mutations). It bridges this design report (BN-WORKFLOW-DESIGN-1) to the actual ASIA-1D-BD-A execution.

#### Scope of ASIA-1D-BD-PREFLIGHT-1

1. **Create `scripts/geodata/countries/bd.mjs`** — minimum-viable Bangladesh country config (analog of `pk.mjs`): cc='bd', countryAr='بنغلاديش', countryEn='Bangladesh', defaultTimezone='Asia/Dhaka', bbox, geonamesUrl='https://download.geonames.org/export/dump/BD.zip', admin1ToRegion mapping. **Do not** commit to merge — just have the config file ready.

2. **Run Stage 1–2 candidate extraction for BD** with the new config, output `db/places/candidates/bd-geonames-candidates.json`. Do NOT run Stage 3.5 or Stage 4 yet.

3. **Audit candidate distribution**:
   - Total candidates by tier (PPLC / PPLA / PPLA2 / PPLA3 / PPL)
   - Population buckets (≥1M, 500k–1M, 100k–500k, 50k–100k, 20k–50k, <20k)
   - **Critical: how many candidates have GeoNames `bn` alternatenames** vs Latin-only

4. **Audit clean-Bengali-script for the existing bn alternatenames**:
   - Run `isCleanBengaliScript()` (per Section 3 design) on every bn alternatename
   - Report pass-rate: tier-95 / tier-85 / tier-80 / fail
   - Specifically check for **Assamese ৰ ৱ pollution** (Bangladesh-Assam border crossover risk)
   - Check for Devanagari intrusion (Hindi pollution)

5. **Decide batch-size for ASIA-1D-BD-A**:
   - Based on candidate-tier breakdown, propose BATCH-A scope (e.g., "30 PPLC/PPLA cities pop≥100k" or "all 50 high-tier cities pop≥50k")
   - Confirm with user before execution

6. **Decide Bengali Stage 3.5b approach**:
   - If pass-rate ≥80%, simple `isCleanBengaliScript()` gate is sufficient.
   - If <80%, may need a Stage 3.4b normalizer (analog of Persian pre-gate) to strip pollution.

7. **Write `reports/asia-1d-bd-preflight-1.md`** with candidate stats and a concrete BATCH-A proposal, then **stop** for user approval before any merge.

### Outputs of ASIA-1D-BD-PREFLIGHT-1

- `scripts/geodata/countries/bd.mjs` (new file, ready but not exercised)
- `db/places/sources/BD.txt` and `BD.zip` (downloaded GeoNames data, deferred until preflight)
- `db/places/candidates/bd-geonames-raw.json` + `bd-geonames-normalized.json` + `bd-geonames-candidates.json` (Stage 1-2 outputs)
- `reports/asia-1d-bd-preflight-1.md` (audit report + BATCH-A proposal)

### What's NOT done at ASIA-1D-BD-PREFLIGHT-1

- ❌ No Stage 3.5 quality gate runs
- ❌ No Stage 4 merge
- ❌ No mutation of `curated-places.json`
- ❌ No `names.bn` enrichment yet (deferred to PLACE-NAMES-BN-BD-1)
- ❌ No new tests added yet

### Execution timeline (proposed, conditional on user approval)

| Phase | Status | What | When |
|-------|--------|------|------|
| **BN-WORKFLOW-DESIGN-1** | 📋 IN REVIEW | This report | NOW |
| **ASIA-1D-BD-PREFLIGHT-1** | ❌ HELD | bd.mjs + candidate audit + BATCH-A proposal | next, conditional on this report's approval |
| ASIA-1D-BD-A | ❌ HELD | First Fast Track BD geodata wave (+30-50 cities, {ar, en}) | conditional on preflight |
| PLACE-NAMES-BN-BD-1 | ❌ HELD | First Fast Track BD Bengali enrichment (+30-50 names.bn) | conditional on BD-A approval |
| ASIA-1D-BD-MCF (?) | ❌ HELD | Blocked-major fixes (only if needed) | conditional |
| PLACE-NAMES-BN-BD-2 (?) | ❌ HELD | Bengali for MCF entries | conditional |
| ASIA-1D-BD-MAJORS-1A | ❌ HELD | Missing-ar majors (if any in BD) | conditional |
| PLACE-NAMES-BN-BD-3 | ❌ HELD | Bengali for MAJORS-1A entries | conditional |

This is a **7-step sequence** spanning ~3-5 Fast Track pairs, modeled directly on the PK pattern.

---

## Held queue (no execution until user decides)

Per user direction, the following are **explicitly NOT started**:
- ❌ ASIA-1D-BD (geodata)
- ❌ ASIA-1D-IN (India Urdu)
- ❌ ASIA-1F (China solo)
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ Alias enrichment
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

---

## What this design phase did NOT do

- ❌ Did not modify `db/places/curated-places.json` (0 byte changes)
- ❌ Did not create `scripts/geodata/countries/bd.mjs` (deferred to PREFLIGHT-1)
- ❌ Did not download `BD.txt`/`BD.zip` GeoNames sources
- ❌ Did not create `db/places/candidates/bd-geonames-*.json` candidates
- ❌ Did not modify `server.js`, `js/app.js`, `fillLangMap`, `index.html`
- ❌ Did not add or modify any test files
- ❌ Did not use any runtime translation API, browser translate, or AI translation
- ❌ Did not start any merge wave
- ✅ Only produced this single design report

---

## Status: 📋 AWAITING USER REVIEW

Next step: user reviews this design and decides whether to proceed with **ASIA-1D-BD-PREFLIGHT-1** (the proposed bridge phase) or take a different path.

**No further work until user direction.**
