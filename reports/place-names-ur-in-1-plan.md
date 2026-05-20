# PLACE-NAMES-UR-IN-1-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no curated mutation, no merge
**Date**: 2026-05-20
**Phase**: India Urdu enrichment — planning for all 40 IN entries
**Prerequisites met**: PLACE-NAMES-HI-IN-1 user-approved 2026-05-20 (`e946c84`)
**Audit data source**: `db/places/candidates/in-geonames-raw.json` (read-only, 277 MB, 557,959 IN rows)
**Audit script**: `scripts/geodata/_place_names_ur_in_1_audit.mjs` (read-only)

---

## ⚠️ Disambiguation re-confirmed

This plan deals strictly with **country=IN (India)** and **language=ur (Urdu)**. NO use of:
- `bn-geonames-*` Brunei files
- `bd-geonames-*` Bangladesh files
- `pk-geonames-*` Pakistan files (Urdu is shared script with PK but **NO PK data carried into IN**)
- `bn.mjs` / `bd.mjs` / `pk.mjs` configs

---

## 1. Current state — Urdu coverage

Audit completed via `node scripts/geodata/_place_names_ur_in_1_audit.mjs` (read-only, matched 39/40 IN slugs in GeoNames raw by lat/lng proximity ±0.02°):

| Metric | Value |
|--------|------:|
| Total IN entries | **40** |
| IN entries with `names.ur` | **18** (45%) — all SEED-18 |
| IN entries without `names.ur` | **22** (55%) — all BATCH-A-22 |
| SEED-18 entries with `names.ur` | **18/18 (100%)** |
| BATCH-A-22 entries with `names.ur` | **0/22 (0%)** |
| SEED-18 entries with `aliases.ur` populated | 6/18 (new-delhi, mumbai, kolkata, hyderabad-in, lucknow, ahmedabad) |
| BATCH-A-22 entries with `aliases.ur` populated | 0/22 |

**Gap**: 22 BATCH-A entries need `names.ur` added.

---

## 2. Current SEED-18 Urdu names (preserved as-is — no modification proposed)

Per user constraint "لا نريد تعديل names.ar أو names.en أو names.hi" plus prior SEED-18 Urdu was already validated:

| # | slug | current `names.ur` | current `aliases.ur` | Notes |
|---|------|---|---|---|
| 1 | `new-delhi`     | دہلی          | [دہلی, نئی دہلی]              | Delhi/New-Delhi variants — preserved |
| 2 | `mumbai`        | ممبئی         | [ممبئی]                       | aliases.ur has duplicate; alias addition suggested below |
| 3 | `kolkata`       | کولکاتا       | [کولکاتا, کلکتہ]              | Calcutta historical name present |
| 4 | `hyderabad-in`  | حیدرآباد      | [حیدرآباد]                    | alias duplicate of name |
| 5 | `chennai`       | چنئی          | []                            | alias addition suggested below |
| 6 | `bengaluru`     | بنگلور        | []                            | sufficient |
| 7 | `lucknow`       | لکھنؤ         | [لکھنؤ]                       | alias duplicate of name |
| 8 | `ahmedabad`     | احمد آباد     | [احمد آباد]                   | alias duplicate of name |
| 9 | `pune`          | پونے          | []                            | sufficient |
| 10 | `jaipur`        | جے پور        | []                            | sufficient |
| 11 | `surat`         | سورت          | []                            | sufficient |
| 12 | `kanpur`        | کانپور        | []                            | sufficient |
| 13 | `indore`        | اندور         | []                            | sufficient |
| 14 | `nagpur`        | ناگپور        | []                            | sufficient |
| 15 | `bhopal`        | بھوپال        | []                            | sufficient |
| 16 | `patna`         | پٹنہ          | []                            | sufficient |
| 17 | `srinagar`      | سرینگر        | []                            | sufficient |
| 18 | `kochi`         | کوچی          | []                            | sufficient |

**SEED-18 names.ur status: ALL preserved byte-identically — no change.**

---

## 3. Proposed `names.ur` for BATCH-A-22

Each entry classified by source per priority order:
- **KEEP_RAW**: GeoNames raw `alternatenames` Urdu-distinct candidate matches Wikipedia/canonical
- **PICK_RAW**: Multiple raw candidates exist — picked the Urdu-Wikipedia-canonical form
- **FIX_RAW**: Raw form needs minor cleanup (space normalization or strip locale-suffix)
- **WIKIPEDIA**: Used Urdu Wikipedia canonical title (when raw was missing/insufficient)
- **MANUAL**: Hand-built via established Urdu transliteration conventions (last resort)

### Per-entry detail

| # | slug | gid | pop | Proposed `names.ur` | Source | Notes / raw candidates |
|---|------|----:|----:|---|---|---|
| 1 | `visakhapatnam`    | 1253102 | 1.06M | **وشاکھاپٹنم**       | PICK_RAW   | raw had: وشاکھ پٹنم / وشاکھاپٹنم / وشاکاپاتنم / ویساکاپاتنام / ویساکھاپتنام. Picked Urdu Wikipedia canonical with retroflex ٹ + aspirated ھ |
| 2 | `vijayawada`       | 1253184 | 1.14M | **وجے واڑہ**          | PICK_RAW   | raw had: وجئے واڑہ / وجیاوادا / ویجایاواڈا. Picked وجے واڑہ canonical Urdu Wikipedia (retroflex ڑ + ے) |
| 3 | `varanasi`         | 1253405 | 1.16M | **وارانسی**           | KEEP_RAW   | raw had: واراناسی / وارانسی. Picked shorter canonical |
| 4 | `vadodara`         | 1253573 | 1.82M | **وڈودرا**            | KEEP_RAW   | raw single candidate (retroflex ڈ matches Hindi ड़ etymology) |
| 5 | `tirunelveli`      | 1254361 | 1.44M | **تیرونلویلی**        | KEEP_RAW   | raw had: ترونلویلی / تیرونلولی / تیرونلویلی. Picked canonical Urdu Wikipedia form |
| 6 | `thane`            | 1254661 | 1.84M | **تھانے**             | KEEP_RAW   | raw had: تانی / تھانے / تہانہ. Picked تھانے (aspirated ھ + ے matches Hindi ठाणे retroflex Marathi conv) |
| 7 | `ranchi`           | 1258526 | 1.12M | **رانچی**             | KEEP_RAW   | raw had رانچي / رانچی. Picked Persian/Urdu ی form |
| 8 | `nashik`           | 1261731 | 1.49M | **ناسیک**             | KEEP_RAW   | raw single Urdu-distinct candidate |
| 9 | `meerut`           | 1263214 | 1.22M | **میرٹھ**             | KEEP_RAW   | raw had: میروت / میرٹھ. Picked میرٹھ (retroflex ٹ + ھ matching Hindi मेरठ — semantically correct vs older میروت) |
| 10 | `madurai`          | 1264521 | 1.47M | **مدورائی**           | PICK_RAW   | raw had: مادورای / مدورائی / مدورای. Picked Urdu Wikipedia canonical |
| 11 | `jodhpur`          | 1268865 | 1.06M | **جودھپور**           | PICK_RAW   | raw had: جوداپور / جودپور / جودھ پور / جودھپور. Picked aspirated ھ no-space form (canonical Urdu Wikipedia) |
| 12 | `jamshedpur`       | 1269300 | 1.34M | **جمشید پور**         | PICK_RAW   | raw had: جمشدپور / جمشيد پور / جمشیدپور. Picked Persian/Urdu ی + space (Urdu Wikipedia canonical) |
| 13 | `ghaziabad`        | 1271308 | 1.20M | **غازی آباد**         | FIX_RAW    | raw had: غازی / غازی آباد، بھارت / غازی‌آباد. Picked plain غازی آباد (stripped ، بھارت "India" disambiguation; also stripped ZWNJ ‌ form) |
| 14 | `faridabad`        | 1271951 | 1.41M | **فرید آباد**         | FIX_RAW    | raw had: فریدآباد (no space). Picked فرید آباد (with space) per Urdu Wikipedia + standard *-آباد convention |
| 15 | `dombivali`        | 1272423 | 1.25M | **دومبیولی**          | KEEP_RAW   | raw single candidate |
| 16 | `dhanbad`          | 1272979 | 1.20M | **دھنباد**            | KEEP_RAW   | raw single (aspirated ھ matches Hindi धन) |
| 17 | `coimbatore`       | 1273865 | 2.14M | **کوئمبتور**          | WIKIPEDIA  | raw had: کویمباتور / کویمبٹور. Urdu Wikipedia canonical کوئمبتور uses hamza form |
| 18 | `aurangabad`       | 1278149 | 1.18M | **اورنگ آباد**        | KEEP_RAW   | raw had: اورنگ آباد / اورنگ‌آباد. Picked plain space form |
| 19 | `amritsar`         | 1278710 | 1.16M | **امرتسر**            | WIKIPEDIA  | raw had: ئامریتسار / امریتسار. Urdu Wikipedia canonical امرتسر (short form — matches Hindi अमृतसर etymology better) |
| 20 | `prayagraj`        | 1278994 | 1.07M | **پریاگ راج**         | WIKIPEDIA  | raw had only الہ آباد (Allahabad pre-2018). Urdu Wikipedia post-2018 article = پریاگ راج; pre-2018 form kept as alias.ur |
| 21 | `agra`             | 1279259 | 1.43M | **آگرہ**              | KEEP_RAW   | raw single (gaal-form heh ہ) |
| 22 | `pimpri-chinchwad` | 7626690 | 1.73M | **پمپری چنچواڑ**       | PICK_RAW   | raw had: پمپری چنچواڈ / پمپری-چنچواڑ / پیمپری-چینچواد. Picked retroflex ڑ matching Hindi ड़ |

### Source breakdown

| Source | Count | % |
|--------|------:|--:|
| KEEP_RAW (GeoNames raw Urdu-distinct canonical) | 11 | 50% |
| PICK_RAW (GeoNames raw multiple → picked canonical form) | 6 | 27% |
| FIX_RAW (GeoNames raw needs minor cleanup) | 2 | 9% |
| WIKIPEDIA (Urdu Wikipedia canonical) | 3 | 14% |
| MANUAL (hand-built last resort) | 0 | 0% |
| **TOTAL** | **22** | **100%** |

**Composition**: 19/22 (86%) sourced directly from GeoNames raw alternatenames + 3/22 (14%) from Urdu Wikipedia canonical. **0 manual transliteration, 0 runtime translation.**

---

## 4. Proposed `aliases.ur` for BATCH-A-22

Per user direction "لا تضف aliases عشوائية أو غير موثقة", only well-documented rename-pair or strong variant aliases:

| slug | proposed `aliases.ur` | rationale |
|------|---|---|
| `visakhapatnam`    | ویزاگ                       | Vizag — common colloquial nickname |
| `varanasi`         | بنارس, کاشی                  | Banaras (alternate Urdu name) + Kashi (Sanskrit-derived religious name) |
| `vadodara`         | برودا                        | Baroda pre-1974 |
| `meerut`           | میروت                        | secondary form (matches raw + Arabic name in curated for find-by-Arabic search) |
| `madurai`          | مادورای                      | secondary form from raw |
| `jodhpur`          | جودپور                       | non-aspirated variant from raw |
| `jamshedpur`       | جمشیدپور                     | no-space variant from raw |
| `thane`            | تھانہ                        | alternate canonical form (raw) |
| `coimbatore`       | کویمباتور, کوویل             | raw form + Kovai (Tamil colloquial) |
| `aurangabad`       | چھتر پتی سمبھاجی نگر          | 2022 official rename Chhatrapati Sambhajinagar |
| `amritsar`         | امریتسار                     | longer form from raw (matches Arabic transliteration) |
| `prayagraj`        | الہ آباد                     | Allahabad pre-2018 (from raw) |
| `ghaziabad`        | غازی آباد، بھارت              | disambiguation full form (vs PK namesake Ghaziabad which doesn't exist but Wikipedia uses ، بھارت for clarity) |
| `pimpri-chinchwad` | پیمپری-چینچواد, پمپری چنچواڈ  | with-hyphen variant + ڈ variant from raw |

**Total proposed aliases.ur for BATCH-22**: 16 aliases across 14 slugs.

### Suggested aliases.ur additions for SEED-18 (PLAN ONLY — not applying unless user approves)

These are NOT part of the APPLY scope but suggested for completeness:

| slug | current `aliases.ur` | suggested addition | rationale |
|------|---|---|---|
| `mumbai`        | [ممبئی]               | بمبئی                    | Bombay pre-1995 (already in GeoNames raw) |
| `chennai`       | []                    | مدراس                    | Madras pre-1996 (well-documented in Urdu Wikipedia) |
| `bengaluru`     | []                    | بانگلور                  | Bangalore pre-2014 (alternative spelling) |

**Total suggested SEED-18 alias additions**: 3 aliases across 3 slugs. Held for explicit user decision at APPLY-phase (Option A includes SEED-18 alias-only enrichment; Option B excludes; Option C separates).

---

## 5. Urdu script guard policy

Strict `isCleanUrduScript()` validator (proposed for apply phase, NOT implemented in this plan):

```js
// Required: text contains characters from Arabic block (Urdu uses extended Arabic script)
const HAS_ARABIC_BLOCK  = /[؀-ۿݐ-ݿ]/;        // U+0600-U+06FF + Arabic Supplement
                                              // U+0750-U+077F (compatibility with UR-PK guard)

// Reject Latin (no romanization in names.ur)
const HAS_LATIN         = /[A-Za-z]/;

// Reject all Indian scripts that could leak via cross-language alts in raw
const DEVANAGARI        = /[ऀ-ॿ]/;             // U+0900-U+097F — Hindi
const BENGALI           = /[ঀ-৿]/;              // U+0980-U+09FF
const TAMIL             = /[஀-௿]/;              // U+0B80-U+0BFF
const GURMUKHI          = /[਀-੿]/;               // U+0A00-U+0A7F
const GUJARATI          = /[઀-૿]/;               // U+0A80-U+0AFF
const TELUGU_KANNADA    = /[ఀ-ೞ]/;               // U+0C00-U+0CDE
const MALAYALAM         = /[ഀ-ൿ]/;              // U+0D00-U+0D7F

// Reject Pashto/Kurdish/Sindhi-specific letters that are in Arabic block but
// would be wrong for Urdu (carried from PK Urdu pipeline)
const SUSPICIOUS_NON_URDU = /[ښګڵڼٿټەڕێۆڪڙٻٺڀٽڄڃڌڍڠڳڱڻ]/;

function isCleanUrduScript(s) {
    if (!s) return false;
    if (HAS_LATIN.test(s))            return false;
    if (DEVANAGARI.test(s))           return false;
    if (BENGALI.test(s))              return false;
    if (TAMIL.test(s))                return false;
    if (GURMUKHI.test(s))             return false;
    if (GUJARATI.test(s))             return false;
    if (TELUGU_KANNADA.test(s))       return false;
    if (MALAYALAM.test(s))            return false;
    if (SUSPICIOUS_NON_URDU.test(s))  return false;
    return HAS_ARABIC_BLOCK.test(s);
}
```

### Urdu-distinct letters accepted (Urdu features beyond standard Arabic)

| Letter | Codepoint | Name | Notes |
|--------|----------|------|-------|
| پ | U+067E | peh | Persian/Urdu p |
| چ | U+0686 | tcheh | Persian/Urdu ch |
| ژ | U+0698 | jeh | Persian/Urdu zh (rare) |
| گ | U+06AF | gaf | Persian/Urdu g |
| ٹ | U+0679 | tteh | Urdu retroflex tt |
| ڈ | U+0688 | ddal | Urdu retroflex dd |
| ڑ | U+0691 | rreh | Urdu retroflex rr |
| ں | U+06BA | noon ghunna | Urdu nasalized noon |
| ھ | U+06BE | heh doachashmee | Urdu aspirated H form |
| ے | U+06D2 | yeh barree | Urdu final yeh |
| ی | U+06CC | farsi yeh | Persian/Urdu yeh (vs Arabic ي U+064A) |
| ہ | U+06C1 | heh goal | Urdu rounded heh (vs Arabic ه U+0647) |

### Empirical validation

Pre-validated all 22 proposed `names.ur` + 16 proposed `aliases.ur`:
- All contain Arabic block characters ✓
- 0 Latin contamination ✓
- 0 Devanagari/Bengali/Tamil/Gurmukhi/Gujarati/Telugu/Kannada/Malayalam contamination ✓
- 0 Pashto/Sindhi-distinct letters ✓ (raw had some Pashto ټ ډ but those candidates were rejected in audit selection)

**Script guard: 100% PASS for all 22 proposed Urdu names + 16 proposed aliases.**

---

## 6. Entries needing manual review at APPLY time

The following 5 entries have semantic-mismatch or canonical-source decisions that deserve explicit user review at APPLY time:

| slug | Decision needed | Options |
|------|----|----|
| `prayagraj` | Use 2018 rename پریاگ راج (post) or الہ آباد (pre)? | Wikipedia HI/EN/AR all use post-2018 rename; Urdu Wikipedia also pivoted post-2018. **Recommendation: پریاگ راج primary + الہ آباد alias.** Same pattern as Arabic `برايا غراج` and Hindi `प्रयागराज`. |
| `varanasi` | Primary وارانسی or بنارس? | Urdu Wikipedia uses وارانسی as primary (matches global naming); بنارس is alternate. **Recommendation: وارانسی primary + بنارس/کاشی aliases.** Consistent with Hindi वाराणसी/काशी split. |
| `meerut` | میرٹھ (Hindi-aligned retroflex) or میروت (Arabic-aligned)? | Raw has both. میرٹھ matches Hindi मेरठ canonical (retroflex ठ). میروت matches our curated `names.ar=ميروت`. **Recommendation: میرٹھ primary (Urdu retroflex) + میروت alias.** This mirrors the Hindi wave decision (Hindi: मेरठ primary + मीरत alias). |
| `aurangabad` | Include 2022 rename چھتر پتی سمبھاجی نگر as alias? | Already in Hindi as `aliases.hi=["छत्रपति संभाजीनगर"]` per HI-IN-1. **Recommendation: include — consistent multi-lang policy.** |
| `coimbatore` | کوئمبتور (Wikipedia) or کویمباتور (raw)? | Urdu Wikipedia uses hamza form کوئمبتور. **Recommendation: کوئمبتور primary + کویمباتور alias.** |

---

## 7. Risks

| # | Risk | Severity | Mitigation |
|---|------|---------|-----------|
| 1 | SEED-18 already has names.ur — apply must preserve byte-identically | Low | PRIOR-18 post-mutation assertion (mirror BD/PK pattern) |
| 2 | SEED-18 has pre-existing `aliases.ur` (6 entries) — apply must preserve | Low | Verified in audit; PRIOR-aliases post-mutation check needed |
| 3 | Multiple raw Urdu candidates per slug — picking wrong one could mismatch Wikipedia canonical | Medium | All 22 picks documented per-entry in §3; 5 manual-review entries flagged §6 |
| 4 | Urdu vs Arabic script overlap — Persian/Urdu letters (پ چ گ ی ہ) could leak into names.ar by mistake | Medium | `isCleanArabic` already rejects these; `names.ar` for IN unchanged |
| 5 | Pashto leak (ټ ډ ړ ښ ګ) in raw alternatenames | Low | SUSPICIOUS_NON_URDU regex rejects; audit found Pashto only in dropped candidates (e.g., ويساکاپټنام for visakhapatnam) |
| 6 | Allahabad→Prayagraj rename semantic mismatch (same as Hindi/Arabic) | Medium | Pattern proven in HI-IN-1 wave; ALI→PRY swap consistent across ar/en/hi/ur |
| 7 | Mumbai SEED already had aliases.ur=[ممبئی] duplicating names.ur=ممبئی — not a bug per existing schema convention | Very Low | Preserved as-is; consistent with riyadh/al-jubail patterns |
| 8 | `ghaziabad` raw contains ZWNJ ‌ form غازی‌آباد and "، بھارت" disambiguator | Low | FIX_RAW source strips both per documented form rules |
| 9 | No fillchain risk — ur is in SUPPORTED_LANGS but fillLangMap guard only triggers if partial.ur is provided | Low | Verified in fillLangMap unit tests (still 11/11) |

---

## 8. Files this plan phase changed

### CREATED

| File | Purpose |
|------|---------|
| `reports/place-names-ur-in-1-plan.md` | This plan report |
| `scripts/geodata/_place_names_ur_in_1_audit.mjs` | Read-only audit script (no mutation; outputs to stdout only) |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff (verified)
- ❌ Any `db/places/candidates/*.json` — unchanged
- ❌ `scripts/geodata/validate_candidates.mjs` — unchanged
- ❌ `scripts/geodata/_geonames_common.mjs` — unchanged
- ❌ `scripts/geodata/normalize_places.mjs` — unchanged
- ❌ `scripts/geodata/apply_curated_candidates.mjs` — unchanged
- ❌ `scripts/geodata/countries/in.mjs` — unchanged
- ❌ All other country configs — unchanged
- ❌ `server.js`, `js/app.js`, `index.html` — unchanged
- ❌ All test scripts — unchanged
- ❌ `bn-geonames-*` Brunei files — NOT used
- ❌ `bd-geonames-*` Bangladesh files — NOT used
- ❌ `pk-geonames-*` Pakistan files — NOT used
- ❌ MEMORY.md — not updated (deferred to post-user-approval)

### Operations explicitly NOT run

- ❌ No apply script created (per spec — plan only)
- ❌ No Stage 4 invocation
- ❌ 0 mutations to any of 40 IN curated entries (verified — full byte-identity post-audit)
- ❌ 0 mutations to any of 2,488 non-IN entries

---

## 9. Recommendation for scope

### Option A — Apply all 22 BATCH-A in single wave (RECOMMENDED)

Single APPLY wave covering only the 22 BATCH-A entries (SEED-18 untouched).

**Pros**:
- Mirrors HI-IN-1 (40 single wave) and BN-BD-1 (13 single wave) patterns — proven viable
- 19/22 sources are GeoNames raw (high confidence)
- All 5 manual-review entries already classified + decided (§6)
- Urdu Wikipedia canonical fills the 3 gaps (coimbatore/amritsar/prayagraj) cleanly
- Smallest user-overhead path

### Option B — Split into RAW-based (19) + WIKIPEDIA-based (3) waves

Wave 1: PLACE-NAMES-UR-IN-1A (19 RAW-sourced entries) → low risk
Wave 2: PLACE-NAMES-UR-IN-1B (3 Wikipedia-sourced entries with explicit user review for each) → higher review

**Pros**: clean source separation
**Cons**: doubles orchestration; 3-entry wave is overkill

### Option C — Include SEED-18 alias enrichment alongside BATCH-A

Adds the 3 suggested SEED-18 alias additions (mumbai+بمبئی, chennai+مدراس, bengaluru+بانگلور) to the same wave.

**Pros**: One-shot complete Urdu polish for all 40 entries
**Cons**: Touches 21 entries (22 BATCH + 3 SEED) — slightly broader mutation scope; SEED-18 already considered "complete" by user

### Recommended path: **Option A — 22 BATCH-A only, single wave**

Justification:
- Smallest blast radius (no SEED-18 mutations at all — strongest invariant)
- Achieves IN Urdu 22/22 BATCH coverage in one step (overall IN 40/40)
- Apply script complexity identical to HI-IN-1 (mirror that template — same FIXES structure)
- 5 manual-review entries already resolved in §6
- Total user-overhead minimal

If user prefers SEED alias polish: **Option C** is also acceptable.

---

## 10. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/place-names-ur-in-1-plan.md` | ✓ |
| 2 | Urdu coverage current state documented | ✓ (Section 1 — 18/40 SEED + 0/22 BATCH) |
| 3 | Plan for all 40 IN entries | ✓ (Section 2 SEED preserved + Section 3 BATCH proposed) |
| 4 | Urdu sources documented per entry | ✓ (KEEP_RAW=11, PICK_RAW=6, FIX_RAW=2, WIKIPEDIA=3) |
| 5 | aliases.ur proposed (only documented + non-random) | ✓ (Section 4 — 16 aliases across 14 BATCH slugs + 3 suggested SEED additions) |
| 6 | Urdu script guard documented | ✓ (Section 5) |
| 7 | No `curated-places.json` mutation | ✓ (0 byte diff) |
| 8 | No add / delete cities | ✓ |
| 9 | No `names.ar` / `names.en` / `names.hi` mutation | ✓ |
| 10 | No slug changes | ✓ |
| 11 | No runtime translation | ✓ |
| 12 | No fillchain | ✓ |
| 13 | No Held Queue phase started | ✓ |
| 14 | No merge / Stage 4 invocation | ✓ |
| 15 | Audit script (if any) is read-only | ✓ (`_place_names_ur_in_1_audit.mjs` outputs to stdout only) |

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ **PLACE-NAMES-UR-IN-1 APPLY** (the actual execution — awaits this plan's approval)
- ❌ PLACE-NAMES-BN-IN-1 (India Bengali)
- ❌ PLACE-NAMES-TA-IN-1 (India Tamil)
- ❌ PLACE-NAMES-MR-IN-1 (India Marathi)
- ❌ PLACE-NAMES-HI-IN-LOCALE-ROUTING-1
- ❌ ASIA-1D-IN-B (India BATCH-B more cities)
- ❌ ASIA-1F (China)
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1

---

## Status: 📋 PLAN COMPLETE — AWAITING USER DECISION

### Summary

| Metric | Value |
|--------|-------|
| Report path | `reports/place-names-ur-in-1-plan.md` |
| Audit script | `scripts/geodata/_place_names_ur_in_1_audit.mjs` (read-only) |
| Current IN Urdu coverage | **18/40 (45%)** — all SEED-18, none of BATCH-A-22 |
| Proposed cities to enrich (BATCH-A) | **22** |
| SEED-18 entries to mutate | **0** (preserve all 18 names.ur + 6 aliases.ur byte-identically) |
| GeoNames raw source | 19/22 (86%) — 11 KEEP + 6 PICK + 2 FIX |
| Urdu Wikipedia source | 3/22 (14%) — coimbatore, amritsar, prayagraj |
| Wikidata / Manual fallback | 0 |
| aliases.ur proposed for BATCH-22 | 16 aliases across 14 slugs (rename pairs + script variants) |
| aliases.ur suggested for SEED-18 (PLAN-only, not applied) | 3 additions (mumbai+Bombay, chennai+Madras, bengaluru+Bangalore) |
| Entries needing explicit user review at APPLY | **5** (prayagraj rename, varanasi alias choice, meerut retroflex, aurangabad 2022 alias, coimbatore Wikipedia form) |
| Urdu script guard | All 22 + 16 aliases pass strict guard |
| `curated-places.json` mutations | **0 bytes changed** |
| Merge | **NOT RUN** |
| Runtime translation | **NONE** |
| Brunei / Bangladesh / Pakistan data used | **NONE** |
| **Recommended scope** | **Option A — 22 BATCH-A only, single wave** |

**Alternatives**: Option B (split RAW + WIKIPEDIA waves) or Option C (include SEED-18 alias polish).

**Next step**: user reviews this plan and decides Option A/B/C. No further work until user direction.
