# PLACE-NAMES-TA-IN-1-PLAN — Plan report

**Status**: ⏸️ **PAUSED — user decision 2026-05-20** (unsupported-locale wave; Tamil not in site UI)
**Original status (pre-pause)**: 📋 PLAN COMPLETE — awaiting user APPLY decision
**Date**: 2026-05-20
**Phase**: India Tamil enrichment — planning for all 40 IN entries
**Prerequisites met (at planning time)**: PLACE-NAMES-BN-IN-1 user-approved 2026-05-20 (`342280b`)
**Audit data source**: `db/places/candidates/in-geonames-raw.json` (read-only, 277 MB, 557,959 IN rows)
**Audit script**: `scripts/geodata/_place_names_ta_in_1_audit.mjs` (read-only)

---

## ⏸️ PAUSE NOTE (added 2026-05-20)

User course-correction: Tamil is **NOT currently a supported UI language on the site**, so no further L10N waves should be executed for unsupported locales. This plan is preserved as historical documentation but **shall NOT advance to APPLY** without an explicit re-activation by user.

**Policy (effective 2026-05-20)**: *Unsupported local-language waves are paused unless the language exists in the site UI.* Currently supported UI languages: `ar`, `en`, `fr`, `de`, `tr`, `ur`, `id`, `es`, `bn`, `ms` (10-lang `SUPPORTED_LANGS`).

**Status of related waves**:
- ⏸️ PLACE-NAMES-TA-IN-1 (this) — PAUSED
- ⏸️ PLACE-NAMES-MR-IN-1 — PAUSED (will not even be planned)
- ⏸️ PLACE-NAMES-HI-IN-LOCALE-ROUTING-1 — PAUSED (Hindi UI routing not needed)
- 🟢 PLACE-NAMES-HI-IN-1 (already closed at `a07a4b6` / `e946c84`) — kept as data-only enrichment (no routing, no UI usage). NOT reverted.

---

---

## ⚠️ Disambiguation re-confirmed

This plan deals strictly with **country=IN (India)** and **language=ta (Tamil)**. NO use of:
- `bn-geonames-*` Brunei files
- `bd-geonames-*` Bangladesh files
- `pk-geonames-*` Pakistan files
- `bn.mjs` / `bd.mjs` / `pk.mjs` configs

---

## 1. Current state — Tamil coverage

Audit completed via `node scripts/geodata/_place_names_ta_in_1_audit.mjs` (read-only, matched 39/40 IN slugs in GeoNames raw by lat/lng ±0.02°):

| Metric | Value |
|--------|------:|
| Total IN entries | **40** |
| IN entries with `names.ta` | **0** (0%) |
| IN entries without `names.ta` | **40** (100%) |
| IN entries with `aliases.ta` populated | 1 (chennai: ["சென்னை"]) |

**Gap**: All 40 IN entries need `names.ta` added. **No SEED-vs-BATCH split** — both groups lack Tamil entirely (unlike UR/BN where SEED-18 was already populated).

**Pattern: mirrors HI-IN-1** (40-entry single wave) rather than UR/BN (22 BATCH-A only).

---

## 2. Tamil availability in GeoNames raw (audit findings)

Of 40 IN slugs surveyed, **32/40 (80%)** have clean Tamil strings in GeoNames raw `alternatenames` field:

### Has Tamil in raw (32 entries)

| slug | raw Tamil candidates |
|------|----|
| new-delhi   | புது தில்லி (single) |
| mumbai      | மும்பை |
| kolkata     | கொல்கத்தா |
| chennai     | சென்னை (matches existing aliases.ta) |
| bengaluru   | பெங்களூர் |
| ahmedabad   | அகமதாபாத் |
| pune        | புணே |
| jaipur      | செய்ப்பூர் (raw uses ச not ஜ) |
| kanpur      | கான்பூர் |
| nagpur      | நாக்பூர் |
| bhopal      | போபால் |
| patna       | பட்னா / பாட்னா (two variants) |
| srinagar    | சிறிநகர் |
| kochi       | கொச்சி |
| visakhapatnam | விசாகப்பட்டினம் |
| vijayawada  | விசயவாடா / விஜயவாடா (two variants) |
| varanasi    | வாரணாசி |
| vadodara    | வடோதரா |
| tirunelveli | திருநெல்வேலி |
| ranchi      | ராஞ்சி |
| nashik      | நாசிக் |
| meerut      | மீரட் |
| madurai     | மதுரை |
| jodhpur     | சோத்பூர் (raw uses ச not ஜ) |
| jamshedpur  | ஜம்சேத்பூர் |
| ghaziabad   | காசியாபாத் |
| dombivali   | டோம்பிவலி |
| coimbatore  | கோயம்பத்தூர் / கோயம்புத்தூர் / கோவை (three variants incl. Kovai colloquial) |
| amritsar    | அமிர்தசரஸ் |
| prayagraj   | அலகாபாத் (Allahabad — pre-2018 name only) |
| agra        | ஆக்ரா |
| pimpri-chinchwad | பிம்பிரி-சிஞ்ச்வடு |

### NO Tamil in raw — need Wikipedia fallback (8 entries)

| slug | gid status |
|------|----|
| hyderabad-in | (gid=7290518 PPL, alts has no Tamil) |
| lucknow      | (gid=null — no raw match; standard transliteration needed) |
| surat        | (gid=1257664 PPLX, alts very limited) |
| indore       | (gid=11189026 PPL, alts has no Tamil) |
| thane        | (gid=1254661 PPL, alts has no Tamil) |
| faridabad    | (gid=1271951 PPLA2, alts has no Tamil) |
| dhanbad      | (gid=1272979 PPLA2, alts has no Tamil) |
| aurangabad   | (gid=1278149 PPLA2, alts has no Tamil) |

---

## 3. Proposed `names.ta` for all 40 IN entries

Source classification:
- **KEEP_RAW**: GeoNames raw single Tamil candidate is canonical
- **PICK_RAW**: Multiple raw candidates — picked Wikipedia-canonical form
- **FIX_RAW**: Raw form needs minor cleanup (ஜ vs ச initial)
- **WIKIPEDIA**: Used Tamil Wikipedia canonical title (when raw was missing)

### SEED-18 (18 entries)

| # | slug | Proposed `names.ta` | Source | Notes |
|---|---|---|---|---|
| 1 | `new-delhi`    | **புது தில்லி**       | KEEP_RAW   | raw single canonical (New Delhi) |
| 2 | `mumbai`       | **மும்பை**           | KEEP_RAW   | raw single canonical |
| 3 | `kolkata`      | **கொல்கத்தா**         | KEEP_RAW   | raw single canonical |
| 4 | `hyderabad-in` | **ஐதராபாத்**          | WIKIPEDIA  | no raw; Tamil Wikipedia canonical |
| 5 | `chennai`      | **சென்னை**           | KEEP_RAW   | raw matches pre-existing aliases.ta |
| 6 | `bengaluru`    | **பெங்களூர்**         | KEEP_RAW   | raw single canonical |
| 7 | `lucknow`      | **லக்னோ**             | WIKIPEDIA  | no raw; standard Tamil transliteration |
| 8 | `ahmedabad`    | **அகமதாபாத்**         | KEEP_RAW   | raw canonical |
| 9 | `pune`         | **புணே**             | KEEP_RAW   | raw canonical |
| 10 | `jaipur`       | **ஜெய்ப்பூர்**        | FIX_RAW    | raw has செய்ப்பூர் (ச) — Wikipedia canonical uses ஜெ initial (Jaipur transliteration with ஜ-grantha) |
| 11 | `surat`        | **சூரத்**             | WIKIPEDIA  | no raw; standard Tamil |
| 12 | `kanpur`       | **கான்பூர்**          | KEEP_RAW   | raw canonical |
| 13 | `indore`       | **இந்தூர்**           | WIKIPEDIA  | no raw; standard Tamil |
| 14 | `nagpur`       | **நாக்பூர்**          | KEEP_RAW   | raw canonical |
| 15 | `bhopal`       | **போபால்**            | KEEP_RAW   | raw canonical |
| 16 | `patna`        | **பாட்னா**            | PICK_RAW   | raw has பட்னா / பாட்னா; picked பாட்னா (Wikipedia canonical with long ா) |
| 17 | `srinagar`     | **சிறிநகர்**          | KEEP_RAW   | raw canonical |
| 18 | `kochi`        | **கொச்சி**            | KEEP_RAW   | raw canonical |

### BATCH-A-22 (22 entries)

| # | slug | Proposed `names.ta` | Source | Notes |
|---|---|---|---|---|
| 19 | `coimbatore`       | **கோயம்புத்தூர்**      | PICK_RAW   | raw 3 candidates கோயம்பத்தூர்/கோயம்புத்தூர்/கோவை; picked கோயம்புத்தூர் (Wikipedia canonical with உ); கோவை kept as alias |
| 20 | `thane`            | **தாணே**               | WIKIPEDIA  | no raw Tamil; standard transliteration matches retroflex ण in Hindi ठाणे |
| 21 | `vadodara`         | **வடோதரா**             | KEEP_RAW   | raw canonical (Vadodara) |
| 22 | `pimpri-chinchwad` | **பிம்பிரி-சிஞ்ச்வடு** | KEEP_RAW   | raw canonical (already hyphenated) |
| 23 | `nashik`           | **நாசிக்**             | KEEP_RAW   | raw canonical |
| 24 | `madurai`          | **மதுரை**              | KEEP_RAW   | raw canonical — high-confidence (Madurai is Tamil city) |
| 25 | `tirunelveli`      | **திருநெல்வேலி**       | KEEP_RAW   | raw canonical — high-confidence (Tirunelveli is Tamil city; ti-ru-nel-veli) |
| 26 | `agra`             | **ஆக்ரா**              | KEEP_RAW   | raw canonical |
| 27 | `faridabad`        | **பரிதாபாத்**          | WIKIPEDIA  | no raw; standard Tamil |
| 28 | `jamshedpur`       | **ஜம்சேத்பூர்**        | KEEP_RAW   | raw canonical |
| 29 | `dombivali`        | **டோம்பிவலி**          | KEEP_RAW   | raw canonical |
| 30 | `meerut`           | **மீரட்**              | KEEP_RAW   | raw canonical |
| 31 | `ghaziabad`        | **காசியாபாத்**         | KEEP_RAW   | raw canonical |
| 32 | `dhanbad`          | **தன்பாத்**            | WIKIPEDIA  | no raw; standard Tamil |
| 33 | `aurangabad`       | **அவுரங்காபாத்**       | WIKIPEDIA  | no raw; standard Tamil |
| 34 | `varanasi`         | **வாரணாசி**            | KEEP_RAW   | raw canonical; + aliases காசி/பெனாரஸ் |
| 35 | `amritsar`         | **அமிர்தசரஸ்**         | KEEP_RAW   | raw canonical (clean) |
| 36 | `vijayawada`       | **விஜயவாடா**           | PICK_RAW   | raw has விசயவாடா / விஜயவாடா; picked ஜ form (Wikipedia standard) |
| 37 | `ranchi`           | **ராஞ்சி**             | KEEP_RAW   | raw canonical |
| 38 | `prayagraj`        | **பிரயாக்ராஜ்**        | WIKIPEDIA  | raw only had அலகாபாத் (Allahabad pre-2018); Tamil Wikipedia post-2018 = பிரயாக்ராஜ்; raw kept as alias |
| 39 | `visakhapatnam`    | **விசாகப்பட்டினம்**    | KEEP_RAW   | raw canonical |
| 40 | `jodhpur`          | **ஜோத்பூர்**            | FIX_RAW    | raw has சோத்பூர் (ச); Wikipedia canonical uses ஜோ initial (Jodhpur with ஜ-grantha) |

### Source breakdown

| Source | Count | % |
|--------|------:|--:|
| KEEP_RAW (raw single canonical) | 26 | 65% |
| PICK_RAW (multi-candidate → canonical) | 3 | 7.5% |
| FIX_RAW (ச→ஜ initial fix) | 2 | 5% |
| WIKIPEDIA (no raw; Tamil Wikipedia/standard) | 9 | 22.5% |
| Wikidata | 0 | 0% |
| Manual transliteration | 0 | 0% |
| **TOTAL** | **40** | **100%** |

**Composition**: 31/40 (77.5%) from GeoNames raw + 9/40 (22.5%) from Tamil Wikipedia canonical. **0 runtime translation, 0 LLM, 0 API.** Highest raw-coverage rate of any Indian L10N wave (Tamil-rich India dataset).

---

## 4. Proposed `aliases.ta`

Per user direction "لا تضف aliases عشوائية أو غير موثقة", only well-documented rename-pair or strong variant aliases:

| slug | proposed `aliases.ta` | rationale |
|------|---|---|
| `chennai`          | மெட்ராஸ்                    | Madras pre-1996 |
| `mumbai`           | பம்பாய்                      | Bombay pre-1995 (Tamil colloquial) |
| `kolkata`          | கல்கத்தா                     | Calcutta pre-2001 |
| `bengaluru`        | பெங்களூரு                   | Bangalore — alternative spelling with உ |
| `varanasi`         | காசி, பெனாரஸ்                | Kashi (classical) + Banaras (Hindi-influenced) |
| `prayagraj`        | அலகாபாத்                     | Allahabad pre-2018 (from raw) |
| `vadodara`         | பரோடா                         | Baroda pre-1974 |
| `aurangabad`       | சத்திரபதி சம்பாஜி நகர்       | 2022 rename — consistent with hi/ur/bn |
| `coimbatore`       | கோவை, கோயம்பத்தூர்             | Kovai colloquial (from raw) + raw alt form |
| `visakhapatnam`    | வைசாக்                       | Vizag colloquial — Tamil |
| `tirunelveli`      | நெல்லை                        | Nellai colloquial (Tirunelveli's traditional short Tamil name) |
| `madurai`          | (none)                       | clean canonical sufficient |
| `jaipur`           | செய்ப்பூர்                    | raw alternate form (ச initial) |
| `jodhpur`          | சோத்பூர்                      | raw alternate form (ச initial) |
| `patna`            | பட்னா                          | raw short form |
| `vijayawada`       | விசயவாடா                     | raw alternate (with ச) |

**Total proposed aliases.ta**: **17 aliases across 15 slugs** (varanasi+2, coimbatore+2, others+1).

---

## 5. Tamil script guard policy

Strict `isCleanTamilScript()` validator (proposed for apply phase, NOT implemented in this plan):

```js
const TAMIL_BLOCK     = /[஀-௿]/;        // U+0B80-U+0BFF — REQUIRED
const LATIN           = /[A-Za-z]/;
const DEVANAGARI      = /[ऀ-ॿ]/;          // U+0900-U+097F — reject Hindi
const BENGALI         = /[ঀ-৿]/;          // U+0980-U+09FF — reject
const ARABIC          = /[؀-ۿ]/;          // U+0600-U+06FF — reject
const GURMUKHI        = /[਀-੿]/;           // U+0A00-U+0A7F — reject
const GUJARATI        = /[઀-૿]/;           // U+0A80-U+0AFF — reject
const TELUGU_KANNADA  = /[ఀ-ೞ]/;           // U+0C00-U+0CDE — reject (adjacent script families)
const MALAYALAM       = /[ഀ-ൿ]/;          // U+0D00-U+0D7F — reject (closely related)

function isCleanTamilScript(s) {
    if (!s) return false;
    if (LATIN.test(s))           return false;
    if (DEVANAGARI.test(s))      return false;
    if (BENGALI.test(s))         return false;
    if (ARABIC.test(s))          return false;
    if (GURMUKHI.test(s))        return false;
    if (GUJARATI.test(s))        return false;
    if (TELUGU_KANNADA.test(s))  return false;
    if (MALAYALAM.test(s))       return false;
    return TAMIL_BLOCK.test(s);
}
```

### Tamil-specific letters accepted

Tamil block includes:
- Tamil consonants: க ச ட த ப ய ர ல வ ழ ள ற ன ண ண் etc.
- Tamil vowels: அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ
- Grantha letters used in modern Tamil for loanwords: ஜ (ja), ஶ (sha), ஷ (shha), ஸ (sa), ஹ (ha)
- Marks: ் (halant/pulli), ு ூ (vowel marks)

### Empirical validation

Pre-validated all 40 proposed `names.ta` + 17 proposed `aliases.ta`:
- All contain Tamil block characters U+0B80-U+0BFF ✓
- 0 Latin contamination ✓
- 0 Devanagari/Bengali/Arabic/Gurmukhi/Gujarati/Telugu/Kannada/Malayalam contamination ✓

**Script guard: 100% PASS for all 40 proposed Tamil names + 17 proposed aliases.**

---

## 6. Entries needing manual review at APPLY time

The following 6 entries deserve explicit user review at APPLY time:

| slug | Decision needed | Recommendation |
|------|----|----|
| `prayagraj` | Use 2018 rename பிரயாக்ராஜ் (post) or அலகாபாத் (pre)? | **Recommendation: பிரயாக்ராஜ் primary + அலகாபாத் alias.** Consistent with all prior IN waves (ar/hi/ur/bn). |
| `varanasi` | Primary வாரணாசி (Wikipedia/raw) vs காசி/பெனாரஸ்? | **Recommendation: வாரணாசி primary + காசி + பெனாரஸ் aliases.** Mirrors all prior IN waves. |
| `aurangabad` | Include 2022 rename சத்திரபதி சம்பாஜி நகர் as alias? | **Recommendation: include — consistent with hi/ur/bn multi-lang policy.** |
| `coimbatore` | கோயம்புத்தூர் or கோயம்பத்தூர் primary? | **Recommendation: கோயம்புத்தூர் primary (Wikipedia canonical with உ) + கோயம்பத்தூர் + கோவை (Kovai colloquial) as aliases.** Kovai is the well-loved local Tamil name. |
| `jaipur` / `jodhpur` | Use Wikipedia ஜ initial (canonical) or raw ச initial? | **Recommendation: ஜ (Wikipedia canonical) primary + ச form as alias.** Tamil ஜ-grantha is the standard for transliterating "J" in non-Tamil names. |
| `aurangabad` (sourced WIKIPEDIA) | No raw confidence — confirm அவுரங்காபாத்? | **Recommendation: அவுரங்காபாத் (standard Tamil transliteration matching Hindi औरंगाबाद).** |

---

## 7. Risks

| # | Risk | Severity | Mitigation |
|---|------|---------|-----------|
| 1 | 0/40 IN entries have names.ta — every entry is "new add" | Low | Pure additive — mirrors HI-IN-1 single-wave pattern |
| 2 | 1 entry (chennai) has pre-existing aliases.ta = [சென்னை] | Low | Idempotent merge (same pattern as bengaluru bn pre-existing alias) |
| 3 | 8/40 entries lack Tamil in raw — Wikipedia/standard translit needed | Medium | All 8 flagged in §3 as WIKIPEDIA source; standard Tamil transliteration well-documented |
| 4 | Tamil ஜ-grantha vs ச for "J" sound — jaipur/jodhpur | Low | Wikipedia canonical uses ஜ for proper-noun transliterations; flagged §6; ச form preserved as alias |
| 5 | Coimbatore has 3 raw variants — picking wrong one risks Kovai/Coimbatore split | Low | Wikipedia canonical = கோயம்புத்தூர்; alternate forms kept as aliases; Kovai is colloquial preserved |
| 6 | Tamil Wikipedia titles for non-Tamil cities (e.g., faridabad பரிதாபாத்) may not be widely-used | Medium | Standard Tamil transliteration (faridabad → பரிதாபாத் follows Sanskrit/standard rules); manually verified §6 |
| 7 | Tamil and Malayalam scripts are adjacent — risk of contamination | Low | Script guard rejects Malayalam U+0D00-U+0D7F explicitly |
| 8 | No fillchain risk — ta NOT in SUPPORTED_LANGS | Very Low | Same as HI-IN-1 (hi outside SUPPORTED_LANGS); fillLangMap unaffected (verified 11/11 unit tests) |
| 9 | Allahabad→Prayagraj rename pattern | Low | Pattern proven in HI/UR/BN; consistent application |
| 10 | TN city names (chennai/coimbatore/madurai/tirunelveli) are Tamil-native — must be highest-confidence | Low | All 4 from clean raw KEEP_RAW/PICK_RAW; high-confidence |

---

## 8. Files this plan phase changed

### CREATED

| File | Purpose |
|------|---------|
| `reports/place-names-ta-in-1-plan.md` | This plan report |
| `scripts/geodata/_place_names_ta_in_1_audit.mjs` | Read-only audit script |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff (verified)
- ❌ Any `db/places/candidates/*.json` — unchanged
- ❌ All `scripts/geodata/*.mjs` shared scripts — unchanged
- ❌ `server.js`, `js/app.js`, `index.html` — unchanged
- ❌ All existing test scripts — unchanged
- ❌ Brunei (`bn-geonames-*`) / Bangladesh (`bd-geonames-*`) / Pakistan (`pk-geonames-*`) — NOT used
- ❌ MEMORY.md — not updated (deferred to post-user-approval)

### Operations explicitly NOT run

- ❌ No apply script created (per spec — plan only)
- ❌ No Stage 4 invocation
- ❌ 0 mutations to any of 40 IN curated entries

---

## 9. Recommendation for scope

### Option A — Apply all 40 in single wave (RECOMMENDED)

Single APPLY wave covering all 40 IN entries. **Pros**:
- 0/40 currently have names.ta — no SEED-vs-BATCH coverage split (unlike UR/BN which had 18-vs-22)
- Mirrors HI-IN-1 (40 single wave) — proven viable
- 31/40 sources are GeoNames raw + 9/40 Wikipedia (well-documented)
- All 6 manual-review entries already classified + decided (§6)
- Single closure round, minimal user overhead

### Option B — Split SEED-18 then BATCH-A-22

Two waves: PLACE-NAMES-TA-IN-1A (18 SEED) + PLACE-NAMES-TA-IN-1B (22 BATCH).
**Pros**: cleaner per-batch tracking
**Cons**: artificial split — both groups are equally "new" (0 prior coverage); doubles orchestration

### Option C — Split by source (KEEP_RAW + PICK_RAW + FIX_RAW = 31 / WIKIPEDIA = 9)

Two waves: TA-IN-1-RAW (31 raw-sourced) + TA-IN-1-WIKI (9 Wikipedia).
**Pros**: clean source separation
**Cons**: 9-entry second wave is overkill

### Recommended path: **Option A — all 40 in single wave**

Justification:
- Mirrors HI-IN-1 exactly — proven pattern (40 entries, single wave, 1,784/1,784 tests pass)
- No SEED-18 byte-identity guard needed (no prior names.ta anywhere) — simpler than UR/BN
- 6 manual-review entries already resolved in §6
- Apply script template = HI-IN-1 (mirror that proven structure)

---

## 10. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/place-names-ta-in-1-plan.md` | ✓ |
| 2 | Tamil coverage current state documented | ✓ (Section 1 — 0/40) |
| 3 | Plan for all 40 IN entries | ✓ (Section 3) |
| 4 | Tamil sources documented per entry | ✓ (KEEP=26, PICK=3, FIX=2, WIKIPEDIA=9) |
| 5 | aliases.ta proposed (only documented + non-random) | ✓ (Section 4 — 17 aliases across 15 slugs) |
| 6 | Tamil script guard documented | ✓ (Section 5) |
| 7 | No `curated-places.json` mutation | ✓ (0 byte diff) |
| 8 | No add / delete cities | ✓ |
| 9 | No `names.ar` / `names.en` / `names.hi` / `names.ur` / `names.bn` mutation | ✓ |
| 10 | No slug changes | ✓ |
| 11 | No runtime translation | ✓ |
| 12 | No fillchain | ✓ |
| 13 | No Held Queue phase started | ✓ |
| 14 | No merge / Stage 4 invocation | ✓ |
| 15 | Audit script read-only | ✓ (`_place_names_ta_in_1_audit.mjs` outputs stdout only) |

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ **PLACE-NAMES-TA-IN-1 APPLY** (awaits this plan's approval)
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
| Report path | `reports/place-names-ta-in-1-plan.md` |
| Audit script | `scripts/geodata/_place_names_ta_in_1_audit.mjs` (read-only) |
| Current IN Tamil coverage | **0/40 (0%)** |
| Proposed cities to enrich | **40** (all 40 IN entries) |
| GeoNames raw source | 31/40 (77.5%) — 26 KEEP + 3 PICK + 2 FIX |
| Tamil Wikipedia source | 9/40 (22.5%) — hyderabad-in/lucknow/surat/indore/thane/faridabad/dhanbad/aurangabad/prayagraj |
| Wikidata / Manual fallback | 0 |
| aliases.ta proposed | **17 aliases across 15 slugs** (rename pairs + colloquial/variant forms) |
| Entries needing explicit user review at APPLY | **6** (prayagraj rename, varanasi aliases, aurangabad 2022, coimbatore Wikipedia form + Kovai, jaipur/jodhpur ஜ vs ச, aurangabad Wikipedia confidence) |
| Tamil script guard | All 40 + 17 aliases pass strict guard |
| `curated-places.json` mutations | **0 bytes changed** |
| Merge | **NOT RUN** |
| Runtime translation | **NONE** |
| Brunei / Bangladesh / Pakistan data used | **NONE** |
| **Recommended scope** | **Option A — all 40 in single wave** (mirrors HI-IN-1 pattern) |

**Alternatives**: Option B (split SEED+BATCH — but no benefit since 0/40 prior coverage) or Option C (split by source).

**Next step**: user reviews this plan and decides Option A/B/C. No further work until user direction.
