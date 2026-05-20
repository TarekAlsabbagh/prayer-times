# PLACE-NAMES-HI-IN-1-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no curated mutation, no merge
**Date**: 2026-05-20
**Phase**: India Hindi enrichment — planning for all 40 IN entries
**Prerequisites met**: ASIA-1D-IN-A user-approved (`2bbc575`)
**Audit data source**: `db/places/candidates/in-geonames-raw.json` (read-only)

---

## ⚠️ Disambiguation re-confirmed

This plan deals strictly with **country=IN (India)** and **language=hi (Hindi)**. NO use of:
- `bn-geonames-*` Brunei files
- `bd-geonames-*` Bangladesh files
- `bn.mjs` / `bd.mjs` configs

---

## 1. Current state — Hindi coverage

| Metric | Value |
|--------|------:|
| Total IN entries | **40** |
| IN entries with `names.hi` | **0** (0%) |
| IN entries without `names.hi` | **40** (100%) |
| SEED-18 entries (full 10-lang ar/bn/de/en/es/fr/id/ms/tr/ur) | 18 — Hindi NOT in their lang set |
| BATCH-A-22 entries (ar+en only) | 22 — Hindi NOT added (per ASIA-1D-IN-A spec) |

**Gap**: All 40 IN entries need `names.hi` to be added.

---

## 2. Hindi availability survey (GeoNames raw)

Scanned all 40 IN curated entries against `in-geonames-raw.json` using strict Devanagari script guard:
- **HAS_DEVANAGARI**: `/[ऀ-ॿ]/` (U+0900-U+097F) — required
- Reject if also contains: Latin, Bengali (U+0980-U+09FF), Arabic (U+0600-U+06FF), Tamil (U+0B80-U+0BFF), Gurmukhi/Gujarati/Telugu/Kannada (U+0A00-U+0BFF excl Tamil), Malayalam (U+0D00-U+0D7F)

### Coverage by group

| Group | With Hindi in GeoNames raw | Without |
|-------|---------------------------:|--------:|
| SEED-18 | 9 (50%) | 9 (50%) |
| BATCH-A-22 | 22 (100%) ✨ | 0 |
| **TOTAL 40** | **31 (77.5%)** | **9 (22.5%)** |

### SEED-18 with Hindi in raw (9 entries)

| slug | Hindi in raw |
|------|----|
| `new-delhi` | नई दिल्ली |
| `mumbai` | ग्रेटर मुम्बई (Greater Mumbai variant — Wikipedia HI canonical is मुंबई) |
| `kolkata` | कलकत्ता (Calcutta — OLD name; Wikipedia HI canonical is कोलकाता) |
| `lucknow` | लखनऊ |
| `pune` | पुणे |
| `jaipur` | जयपुर |
| `bhopal` | भोपाल |
| `patna` | पटना |
| `kochi` | कोच्चि |

### SEED-18 WITHOUT Hindi in raw (9 entries — need Wikipedia HI Priority 2)

| slug | en | Wikipedia HI canonical |
|------|----|----|
| `hyderabad-in` | Hyderabad | **हैदराबाद** |
| `chennai` | Chennai | **चेन्नई** |
| `bengaluru` | Bengaluru | **बेंगलुरु** |
| `ahmedabad` | Ahmedabad | **अहमदाबाद** |
| `surat` | Surat | **सूरत** |
| `kanpur` | Kanpur | **कानपुर** |
| `indore` | Indore | **इंदौर** |
| `nagpur` | Nagpur | **नागपुर** |
| `srinagar` | Srinagar | **श्रीनगर** |

### BATCH-A-22 with Hindi in raw (22 entries — 100%)

| slug | Hindi in raw | Quality note |
|------|----|----|
| `visakhapatnam` | विशाखपट्टणम् | with halant |
| `vijayawada` | विजयवाड़ा | with retroflex ड़ |
| `varanasi` | काशी | **Kashi — religious/classical name; Wikipedia HI canonical is वाराणसी** |
| `vadodara` | वड़ोदरा | with retroflex ड़ |
| `tirunelveli` | तिरुनलवेली | Wikipedia HI uses तिरुनेलवेली (minor vowel diff) |
| `thane` | ठाणे | clean Devanagari |
| `ranchi` | राँची | with chandrabindu |
| `nashik` | नाशिक | clean |
| `meerut` | मीरत | **Wikipedia HI canonical is मेरठ (different)** |
| `madurai` | मदुरई | Wikipedia HI uses both मदुरई and मदुराई |
| `jodhpur` | जोधपुर | clean |
| `jamshedpur` | जमशेदपुर | clean |
| `ghaziabad` | ग़ाज़ियाबाद | with nukta (Wikipedia HI accepts both nukta + non-nukta) |
| `faridabad` | फरीदाबाद | clean |
| `dombivali` | डोंबिवली | clean |
| `dhanbad` | धनबाद | clean |
| `coimbatore` | कोइंबतूर | **Wikipedia HI canonical is कोयंबटूर (different)** |
| `aurangabad` | औरंगाबाद | clean |
| `amritsar` | अमृतसर | clean |
| `prayagraj` | इलाहाबाद | **Allahabad — OLD name; Wikipedia HI canonical is प्रयागराज** |
| `agra` | आगरा | clean |
| `pimpri-chinchwad` | पिंपरी चिंचवड | Wikipedia HI uses पिंपरी-चिंचवाड़ (with hyphen + retroflex ड़) |

---

## 3. Proposed `names.hi` for all 40 entries

Each entry classified by source (mirroring ASIA-1D-IN-A AR convention):
- **KEEP**: GeoNames raw Hindi is canonical
- **FIX**: minor cleanup needed
- **MANUAL**: Wikipedia HI canonical replaces raw (semantic mismatch or quality issue)
- **COMMON_HI**: classical/historical form is the canonical Hindi (vs modern English)
- **WIKIPEDIA**: not in GeoNames raw, sourced from Wikipedia HI canonical title

### SEED-18 (18 entries)

| # | slug | proposed `names.hi` | source | rationale |
|---|------|---|---|---|
| 1 | `new-delhi` | **नई दिल्ली** | KEEP | GeoNames raw matches Wikipedia HI canonical |
| 2 | `mumbai` | **मुंबई** | MANUAL | raw="ग्रेटर मुम्बई" (Greater Mumbai variant); Wikipedia HI canonical is मुंबई. The raw form to be added as alias.hi |
| 3 | `kolkata` | **कोलकाता** | MANUAL | raw="कलकत्ता" (Calcutta — OLD name pre-2001). Wikipedia HI canonical post-2001 = कोलकाता. कलकत्ता as historical alias.hi |
| 4 | `hyderabad-in` | **हैदराबाद** | WIKIPEDIA | not in raw |
| 5 | `chennai` | **चेन्नई** | WIKIPEDIA | not in raw |
| 6 | `bengaluru` | **बेंगलुरु** | WIKIPEDIA | not in raw |
| 7 | `lucknow` | **लखनऊ** | KEEP | raw matches Wikipedia HI |
| 8 | `ahmedabad` | **अहमदाबाद** | WIKIPEDIA | not in raw |
| 9 | `pune` | **पुणे** | KEEP | raw matches |
| 10 | `jaipur` | **जयपुर** | KEEP | raw matches |
| 11 | `surat` | **सूरत** | WIKIPEDIA | not in raw |
| 12 | `kanpur` | **कानपुर** | WIKIPEDIA | not in raw |
| 13 | `indore` | **इंदौर** | WIKIPEDIA | not in raw |
| 14 | `nagpur` | **नागपुर** | WIKIPEDIA | not in raw |
| 15 | `bhopal` | **भोपाल** | KEEP | raw matches |
| 16 | `patna` | **पटना** | KEEP | raw matches |
| 17 | `srinagar` | **श्रीनगर** | WIKIPEDIA | not in raw |
| 18 | `kochi` | **कोच्चि** | KEEP | raw matches |

### BATCH-A-22 (22 entries)

| # | slug | proposed `names.hi` | source | rationale |
|---|------|---|---|---|
| 19 | `coimbatore` | **कोयंबटूर** | MANUAL | raw="कोइंबतूर" — Wikipedia HI canonical कोयंबटूर |
| 20 | `thane` | **ठाणे** | KEEP | raw clean |
| 21 | `vadodara` | **वडोदरा** | KEEP | raw is वड़ोदरा with retroflex ड़; both forms used; Wikipedia primary वडोदरा (without retroflex). Use वडोदरा. |
| 22 | `pimpri-chinchwad` | **पिंपरी-चिंचवाड़** | FIX | raw="पिंपरी चिंचवड" (no hyphen, no retroflex). Wikipedia HI canonical uses hyphen + retroflex |
| 23 | `nashik` | **नाशिक** | KEEP | raw clean |
| 24 | `madurai` | **मदुरई** | KEEP | raw matches |
| 25 | `tirunelveli` | **तिरुनेलवेली** | FIX | raw="तिरुनलवेली"; Wikipedia HI adds े (vowel) |
| 26 | `agra` | **आगरा** | KEEP | raw clean |
| 27 | `faridabad` | **फ़रीदाबाद** | FIX | raw="फरीदाबाद"; Wikipedia HI uses ज़ nukta variant फ़रीदाबाद for proper Urdu loanword |
| 28 | `jamshedpur` | **जमशेदपुर** | KEEP | raw clean |
| 29 | `dombivali` | **डोंबिवली** | KEEP | raw clean |
| 30 | `meerut` | **मेरठ** | MANUAL | raw="मीरत" (mojibake/wrong) — Wikipedia HI canonical is मेरठ (with retroflex ठ) |
| 31 | `ghaziabad` | **ग़ाज़ियाबाद** | KEEP | raw clean (with nukta) |
| 32 | `dhanbad` | **धनबाद** | KEEP | raw clean |
| 33 | `aurangabad` | **औरंगाबाद** | KEEP | raw matches |
| 34 | `varanasi` | **वाराणसी** | MANUAL | raw="काशी" (classical/religious name). Wikipedia HI canonical is वाराणसी. काशी as alias.hi |
| 35 | `amritsar` | **अमृतसर** | KEEP | raw clean |
| 36 | `vijayawada` | **विजयवाड़ा** | KEEP | raw clean |
| 37 | `ranchi` | **राँची** | KEEP | with chandrabindu |
| 38 | `prayagraj` | **प्रयागराज** | MANUAL | raw="इलाहाबाद" (Allahabad — OLD name); Wikipedia HI canonical post-2018 = प्रयागराज. इलाहाबाद as historical alias.hi |
| 39 | `visakhapatnam` | **विशाखपट्टणम्** | KEEP | raw with halant |
| 40 | `jodhpur` | **जोधपुर** | KEEP | raw clean |

### Source distribution

| Source | Count | % |
|--------|------:|--:|
| KEEP (GeoNames raw canonical) | 22 | 55% |
| FIX (minor Wikipedia HI cleanup) | 3 | 7.5% |
| MANUAL (semantic mismatch or canonical replacement) | 6 | 15% |
| COMMON_HI (classical exonym) | 0 | 0% |
| WIKIPEDIA (not in raw — sourced from Wikipedia HI) | 9 | 22.5% |

**Source mix**: 22/40 GeoNames raw + 9/40 Wikipedia HI + 9/40 manual Wikipedia HI cleanup (FIX + MANUAL).

---

## 4. Proposed `aliases.hi` (rename pairs + historical names)

Per user direction ("لا تضف aliases عشوائية أو غير موثقة"), only well-documented rename-pair aliases:

| slug | proposed `aliases.hi` | rationale |
|------|---|---|
| `mumbai` | `बम्बई`, `ग्रेटर मुम्बई` | Bombay pre-1995 + Greater Mumbai metro variant |
| `kolkata` | `कलकत्ता` | Calcutta pre-2001 |
| `chennai` | `मद्रास` | Madras pre-1996 |
| `bengaluru` | `बैंगलोर` | Bangalore pre-2014 |
| `vadodara` | `बड़ौदा`, `वड़ोदरा` | Baroda pre-1974 + retroflex ड़ variant |
| `varanasi` | `काशी`, `बनारस` | Classical Kashi (from raw) + Banaras Hindi variant |
| `prayagraj` | `इलाहाबाद` | Allahabad pre-2018 |
| `aurangabad` | `छत्रपति संभाजीनगर` | 2022 official rename (less commonly used in Hindi yet) |
| `coimbatore` | `कोइंबतूर` | raw variant |
| `madurai` | `मदुराई` | secondary Wikipedia variant |
| `tirunelveli` | `तिरुनलवेली` | raw variant |
| `meerut` | `मीरत` | secondary form (matching raw) |
| `faridabad` | `फरीदाबाद` | non-nukta variant |
| `ghaziabad` | `गाजियाबाद` | non-nukta variant |
| `pimpri-chinchwad` | `पिंपरी चिंचवड` | raw variant (without hyphen) |
| `visakhapatnam` | `विज़ाग` | Hindi for "Vizag" common alternate |

(No aliases.hi for the other 24 entries — single canonical name suffices.)

**Total proposed aliases.hi**: ~22 across 16 slugs (some have 2-3 aliases).

---

## 5. Devanagari script guard policy

Strict `isCleanHindiScript()` validator (proposed for apply phase, NOT implemented in this plan):

```js
const HAS_DEVANAGARI = /[ऀ-ॿ]/;       // U+0900-U+097F — REQUIRED
const LATIN = /[A-Za-z]/;              // reject
const BENGALI = /[ঀ-৿]/;               // reject (U+0980-U+09FF)
const ARABIC = /[؀-ۿ]/;                // reject (U+0600-U+06FF)
const TAMIL = /[஀-௿]/;                 // reject (U+0B80-U+0BFF)
const OTHER_INDIC = /[਀-௿]/;            // U+0A00-U+0BFF — Gurmukhi, Gujarati,
                                       // Tamil (covered above), Telugu, Kannada — reject
const MALAYALAM = /[ഀ-ൿ]/;             // U+0D00-U+0D7F — reject
const URDU_PERSIAN_ONLY = /[پچژگ]/;    // reject pure Persian/Urdu letters

function isCleanHindiScript(s) {
    if (!s) return false;
    if (LATIN.test(s))       return false;
    if (BENGALI.test(s))     return false;
    if (ARABIC.test(s))      return false;
    if (TAMIL.test(s))       return false;
    if (OTHER_INDIC.test(s)) return false;
    if (MALAYALAM.test(s))   return false;
    if (URDU_PERSIAN_ONLY.test(s)) return false;
    return HAS_DEVANAGARI.test(s);
}
```

### Empirical validation

Pre-validated all 40 proposed `names.hi`:
- All contain Devanagari U+0900-U+097F ✓
- 0 Latin contamination ✓
- 0 Bengali contamination ✓
- 0 Arabic contamination ✓
- 0 Other Indic contamination ✓
- 0 Malayalam contamination ✓

**Script guard: 100% PASS for all 40 proposed Hindi names.**

---

## 6. Entries needing manual review

The following entries had semantic mismatches between GeoNames raw and Wikipedia HI canonical — flagged for explicit user review at APPLY time:

| slug | GeoNames raw | Proposed (Wikipedia HI) | Reason |
|------|---|---|---|
| `varanasi` | काशी (Kashi — classical) | वाराणसी (modern canonical) | Kashi is the religious/classical name; modern Hindi uses Varanasi |
| `prayagraj` | इलाहाबाद (Allahabad — OLD) | प्रयागराज (post-2018) | 2018 official rename; same semantic-mismatch as Arabic GeoNames had |
| `mumbai` | ग्रेटर मुम्बई (Greater Mumbai) | मुंबई | raw extracted the metropolitan-region descriptor, not the city name |
| `kolkata` | कलकत्ता (Calcutta) | कोलकाता | 2001 rename — raw stored older form first |
| `meerut` | मीरत | मेरठ | raw form appears non-canonical (Wikipedia HI primary is मेरठ) |
| `coimbatore` | कोइंबतूर | कोयंबटूर | minor vowel/spelling difference — Wikipedia HI primary |

These 6 entries deserve explicit user review before apply phase to confirm Wikipedia HI canonical is preferred.

---

## 7. Risks

| # | Risk | Severity | Mitigation |
|---|------|---------|-----------|
| 1 | 9 SEEDS have 10-lang structure (ar/bn/de/en/es/fr/id/ms/tr/ur) — adding hi will make them 11-lang | Low | Pure additive change, no existing langs touched |
| 2 | 6 entries have semantic mismatch raw vs Wikipedia HI canonical | Medium | All flagged in §6 for explicit review |
| 3 | Aurangabad → छत्रपति संभाजीनगर 2022 rename: less common in Hindi than English | Low | Add as alias.hi only; keep औरंगाबाद as primary |
| 4 | nukta variants (फ़/फ, ज़/ज, ग़/ग) — multiple valid forms | Low | Use Wikipedia HI primary; add non-nukta as aliases.hi where useful |
| 5 | retroflex ड़ vs ड (vadodara/pimpri-chinchwad/vijayawada) | Low | Use the canonical form per Wikipedia; alias the variant |
| 6 | Hindi has same-source-availability variance as Bengali (BD pattern) but at higher coverage | Low | 22/22 BATCH-A vs 9/18 seed — overall 77.5% raw + 22.5% Wikipedia |
| 7 | Some Wikipedia HI titles may use anusvara (ं) vs candrabindu (ँ) — both valid | Very Low | Use Wikipedia canonical form as-is; users can search either |
| 8 | No fillchain risk for Indian local langs because fillLangMap guard already protects all 10 SUPPORTED_LANGS (which excludes hi anyway) | Very Low | hi not in SUPPORTED_LANGS list — pure additive field |

---

## 8. Files this plan phase changed

### CREATED

| File | Purpose |
|------|---------|
| `reports/place-names-hi-in-1-plan.md` | This plan report (only file produced) |

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
- ❌ MEMORY.md — not updated (deferred to post-user-approval)

### NOT run

- ❌ No apply script created (per spec — plan only)
- ❌ No audit script created (per spec — the in-memory survey was inline `node -e`)
- ❌ Stage 4 — NOT invoked
- ❌ All 40 IN curated entries unchanged (verified)

---

## 9. Recommendation for scope

### Option A — Apply all 40 in one wave (RECOMMENDED)

Single APPLY wave covering all 40 IN entries. Pros:
- Achieves IN Hindi 40/40 = 100% in one step
- All 31 GeoNames-raw sources + 9 Wikipedia + 6 manual-review entries in same wave
- Mirrors the BN-BD-1 pattern (single wave for all 13 BD-A) — proven viable
- Single closure round, easier user verification

### Option B — Split SEED-18 first, then BATCH-A-22

Two waves: PLACE-NAMES-HI-IN-1A (18 seeds) + PLACE-NAMES-HI-IN-1B (22 BATCH-A).
Pros: smaller batches, lower per-wave risk
Cons: double orchestration; the manual-review entries straddle both batches

### Option C — Split by source type

Wave 1: PLACE-NAMES-HI-IN-1-KEEP (22 KEEP entries — straightforward)
Wave 2: PLACE-NAMES-HI-IN-1-MANUAL (18 FIX+MANUAL+WIKIPEDIA — needs review)
Pros: clean source separation
Cons: artificial split; doubles user overhead

### Recommended path: **Option A — all 40 in single wave**

Justification:
- BN-BD-1 set the precedent for single-wave coverage (13 BD-A entries in one wave with mix of GeoNames + Wikipedia sources — succeeded with 284/284 tests)
- 6 manual-review entries already classified + Wikipedia HI canonical proposed
- Devanagari script guard handles all 40 uniformly
- Apply script complexity is identical to BN-BD-1 (mirror that template)
- Lower total user-overhead vs split waves

If user prefers safety: **Option B (split SEED-18 then BATCH-A-22)** — still acceptable.

---

## 10. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/place-names-hi-in-1-plan.md` | ✓ |
| 2 | Hindi coverage current state documented | ✓ (Section 1 — 0/40) |
| 3 | Plan for all 40 IN entries | ✓ (Section 3) |
| 4 | Hindi sources documented per entry | ✓ (KEEP=22, FIX=3, MANUAL=6, WIKIPEDIA=9) |
| 5 | aliases.hi proposed (only documented + non-random) | ✓ (Section 4 — ~22 aliases across 16 slugs, all rename pairs / variants) |
| 6 | Devanagari script guard documented | ✓ (Section 5) |
| 7 | No `curated-places.json` mutation | ✓ (0 byte diff) |
| 8 | No add / delete cities | ✓ |
| 9 | No `names.ar` / `names.en` mutation | ✓ |
| 10 | No slug changes | ✓ |
| 11 | No runtime translation | ✓ |
| 12 | No fillchain | ✓ |
| 13 | No Held Queue phase started | ✓ |

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ **PLACE-NAMES-HI-IN-1 APPLY** (the actual execution — awaits this plan's approval)
- ❌ PLACE-NAMES-UR-IN-1
- ❌ PLACE-NAMES-BN-IN-1
- ❌ PLACE-NAMES-TA-IN-1
- ❌ PLACE-NAMES-MR-IN-1
- ❌ ASIA-1D-IN-B
- ❌ ASIA-1F
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
| Report path | `reports/place-names-hi-in-1-plan.md` |
| Current IN Hindi coverage | **0/40 (0%)** |
| Proposed cities to enrich | **40** (18 seed + 22 BATCH-A) |
| GeoNames raw source (KEEP/FIX) | 25 (62.5%) |
| Wikipedia HI source | 15 (37.5% — 9 WIKIPEDIA absent-in-raw + 6 MANUAL Wikipedia-canonical replacing raw) |
| Wikidata / Manual fallback | 0 |
| aliases.hi proposed | ~22 across 16 slugs (rename pairs + nukta variants + script forms) |
| Entries needing explicit user review at APPLY | **6** (varanasi, prayagraj, mumbai, kolkata, meerut, coimbatore) |
| Devanagari script guard | All 40 proposed pass strict guard |
| `curated-places.json` mutations | **0 bytes changed** |
| Merge | **NOT RUN** |
| Runtime translation | **NONE** |
| Brunei / Bangladesh data used | **NONE** |
| **Recommended scope** | **Option A — all 40 in single wave** |

**Alternatives**: Option B (split SEED-18 then BATCH-A-22) or Option C (split by source).

**Next step**: user reviews this plan and decides Option A/B/C. No further work until user direction.
