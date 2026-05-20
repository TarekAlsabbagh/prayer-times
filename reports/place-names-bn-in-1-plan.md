# PLACE-NAMES-BN-IN-1-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no curated mutation, no merge
**Date**: 2026-05-20
**Phase**: India Bengali enrichment — planning for all 40 IN entries
**Prerequisites met**: PLACE-NAMES-UR-IN-1 user-approved 2026-05-20 (`1d6c080`)
**Audit data source**: `db/places/candidates/in-geonames-raw.json` (read-only, 277 MB, 557,959 IN rows)
**Audit script**: `scripts/geodata/_place_names_bn_in_1_audit.mjs` (read-only)

---

## ⚠️ Disambiguation re-confirmed

This plan deals strictly with **country=IN (India)** and **language=bn (Bengali)**. NO use of:
- `bn-geonames-*` Brunei files (Brunei country — name collision but unrelated)
- `bd-geonames-*` Bangladesh files (separate country; Bengali script shared but data NOT carried into IN)
- `bn.mjs` / `bd.mjs` configs

---

## 1. Current state — Bengali coverage

Audit completed via `node scripts/geodata/_place_names_bn_in_1_audit.mjs` (read-only, matched 39/40 IN slugs in GeoNames raw by lat/lng proximity ±0.02°):

| Metric | Value |
|--------|------:|
| Total IN entries | **40** |
| IN entries with `names.bn` | **18** (45%) — all SEED-18 |
| IN entries without `names.bn` | **22** (55%) — all BATCH-A-22 |
| SEED-18 entries with `names.bn` | **18/18 (100%)** |
| BATCH-A-22 entries with `names.bn` | **0/22 (0%)** |
| SEED-18 entries with `aliases.bn` populated | 2/18 (new-delhi, kolkata) |
| BATCH-A-22 entries with `aliases.bn` populated | 0/22 |

**Gap**: 22 BATCH-A entries need `names.bn` added.

**Note**: Identical coverage pattern to PLACE-NAMES-UR-IN-1 — same 18-vs-22 split where SEED-18 was created with 10-lang seeds (ar/bn/de/en/es/fr/id/ms/tr/ur) but BATCH-A merged with ar+en only.

---

## 2. Current SEED-18 Bengali names (preserved as-is — no modification proposed)

Per user constraint "لا نريد تعديل names.ar / en / hi / ur" plus prior SEED-18 Bengali was already validated:

| # | slug | current `names.bn` | current `aliases.bn` |
|---|------|---|---|
| 1 | `new-delhi`     | দিল্লি         | [দিল্লি]              |
| 2 | `mumbai`        | মুম্বই         | []                    |
| 3 | `kolkata`       | কলকাতা         | [কলকাতা]              |
| 4 | `hyderabad-in`  | হায়দরাবাদ     | []                    |
| 5 | `chennai`       | চেন্নাই        | []                    |
| 6 | `bengaluru`     | বেঙ্গালুরু     | []                    |
| 7 | `lucknow`       | লখনউ           | []                    |
| 8 | `ahmedabad`     | আহমেদাবাদ      | []                    |
| 9 | `pune`          | পুনে           | []                    |
| 10 | `jaipur`        | জয়পুর         | []                    |
| 11 | `surat`         | সুরাট          | []                    |
| 12 | `kanpur`        | কানপুর         | []                    |
| 13 | `indore`        | ইন্দোর         | []                    |
| 14 | `nagpur`        | নাগপুর         | []                    |
| 15 | `bhopal`        | ভোপাল          | []                    |
| 16 | `patna`         | পাটনা          | []                    |
| 17 | `srinagar`      | শ্রীনগর        | []                    |
| 18 | `kochi`         | কোচি           | []                    |

**SEED-18 names.bn status: ALL preserved byte-identically — no change.**

---

## 3. Proposed `names.bn` for BATCH-A-22

Each entry classified by source per priority order:
- **KEEP_RAW**: GeoNames raw `alternatenames` Bengali candidate matches Wikipedia/canonical
- **PICK_RAW**: Multiple raw candidates — picked canonical form
- **FIX_RAW**: Raw form needs minor cleanup
- **WIKIPEDIA**: Used Bengali Wikipedia canonical title (when raw was missing/insufficient)
- **MANUAL**: Hand-built via standard Bengali transliteration (last resort)

### Per-entry detail

| # | slug | gid | pop | Proposed `names.bn` | Source | Notes / raw candidates |
|---|------|----:|----:|---|---|---|
| 1 | `visakhapatnam`    | 1253102 | 1.06M | **বিশাখাপত্তনম**     | WIKIPEDIA  | raw had বিশাখাপত্তম (missing ন); Bengali Wikipedia canonical adds final ন |
| 2 | `vijayawada`       | 1253184 | 1.14M | **বিজয়ওয়াড়া**       | WIKIPEDIA  | raw had odd form বিজযবাডা (also Assamese-leak বিজয়াৱদা rejected); Bengali Wikipedia canonical with retroflex ড় |
| 3 | `varanasi`         | 1253405 | 1.16M | **বারাণসী**          | WIKIPEDIA  | raw had বারানসি (no retroflex ণ, short ি); Bengali Wikipedia canonical with retroflex ণ + long ী + aliases বেনারস + কাশী |
| 4 | `vadodara`         | 1253573 | 1.82M | **বড়োদরা**           | KEEP_RAW   | raw single clean (retroflex ড় matches Hindi/Gujarati); Assamese-leak ৱডোদরা rejected |
| 5 | `tirunelveli`      | 1254361 | 1.44M | **তিরুনেলভেলি**      | WIKIPEDIA  | raw had তিরুনেলবেলি (ব); Bengali Wikipedia canonical uses ভ |
| 6 | `thane`            | 1254661 | 1.84M | **থানে**             | WIKIPEDIA  | no Bengali in raw alts; Bengali Wikipedia canonical থানে (aspirated থ matches Hindi ठाणे) |
| 7 | `ranchi`           | 1258526 | 1.12M | **রাঁচি**             | KEEP_RAW   | raw had রাঁচি / রাচি; picked chandrabindu form (canonical) |
| 8 | `nashik`           | 1261731 | 1.49M | **নাশিক**            | KEEP_RAW   | raw single clean |
| 9 | `meerut`           | 1263214 | 1.22M | **মেরঠ**             | WIKIPEDIA  | raw had মীরুট (non-canonical); Bengali Wikipedia canonical মেরঠ (matches Hindi मेरठ retroflex ঠ — semantic alignment) |
| 10 | `madurai`          | 1264521 | 1.47M | **মাদুরাই**          | WIKIPEDIA  | raw had মদুরাই; Bengali Wikipedia canonical adds long া initial |
| 11 | `jodhpur`          | 1268865 | 1.06M | **যোধপুর**           | KEEP_RAW   | raw had যোদপুর / যোধপুর; picked aspirated ধ (canonical) |
| 12 | `jamshedpur`       | 1269300 | 1.34M | **জামশেদপুর**         | KEEP_RAW   | raw had জমশেদপুর / জামশেদপুর; picked Bengali Wikipedia canonical with initial long া |
| 13 | `ghaziabad`        | 1271308 | 1.20M | **গাজিয়াবাদ**        | KEEP_RAW   | raw had গাজিয়াবাদ / ঘাজিয়াবাদ; picked গ form (canonical) |
| 14 | `faridabad`        | 1271951 | 1.41M | **ফরিদাবাদ**         | WIKIPEDIA  | no Bengali in raw; Bengali Wikipedia canonical |
| 15 | `dombivali`        | 1272423 | 1.25M | **দোম্বিভলি**         | WIKIPEDIA  | no Bengali in raw; Bengali Wikipedia canonical |
| 16 | `dhanbad`          | 1272979 | 1.20M | **ধানবাদ**           | FIX_RAW    | raw had ধানাবাদ (extra আ); Wikipedia canonical ধানবাদ — matches Hindi धनबाद |
| 17 | `coimbatore`       | 1273865 | 2.14M | **কোয়েম্বাটুর**       | WIKIPEDIA  | raw had কোইমবাতোরে (odd transliteration); Bengali Wikipedia canonical |
| 18 | `aurangabad`       | 1278149 | 1.18M | **আওরঙ্গাবাদ**       | KEEP_RAW   | raw had আউরঙ্গাবাদ / আওরঙ্গাবাদ; picked আও form (Bengali Wikipedia canonical) |
| 19 | `amritsar`         | 1278710 | 1.16M | **অমৃতসর**           | KEEP_RAW   | raw single clean |
| 20 | `vijayawada`       | (above) | (above) | (above) | (above) | (above) |
| 21 | `prayagraj`        | 1278994 | 1.07M | **প্রয়াগরাজ**        | WIKIPEDIA  | raw had only এলাহাবাদ (Allahabad pre-2018); Bengali Wikipedia post-2018 canonical = প্রয়াগরাজ; pre-2018 form kept as alias |
| 22 | `agra`             | 1279259 | 1.43M | **আগ্রা**            | KEEP_RAW   | raw single clean |
| 23 | `pimpri-chinchwad` | 7626690 | 1.73M | **পিম্পরি-চিঞ্চওয়াড়** | FIX_RAW    | raw had পিম্পরি চিঞ্চওয়াড় (no hyphen); Bengali Wikipedia uses hyphen; Assamese-leak পিম্পরি চিনচৱাদ rejected |

(Numbering uses ## from full table; 20 and 22 are continuation row markers — 22 actual entries.)

### Source breakdown (22 BATCH-A entries)

| Source | Count | % |
|--------|------:|--:|
| KEEP_RAW (GeoNames raw Bengali canonical) | 9 | 41% |
| PICK_RAW (multi-candidate → picked canonical) | 0 | 0% |
| FIX_RAW (raw needs minor cleanup) | 2 | 9% |
| WIKIPEDIA (Bengali Wikipedia canonical) | 11 | 50% |
| Wikidata | 0 | 0% |
| Manual transliteration | 0 | 0% |
| **TOTAL** | **22** | **100%** |

**Composition**: 11/22 (50%) sourced directly from GeoNames raw + 11/22 (50%) from Bengali Wikipedia canonical (mostly for cases where raw was odd transliteration or missing). **0 manual transliteration, 0 runtime translation.**

The Bengali Wikipedia proportion is higher than UR-IN-1 (14%) because IN's GeoNames Bengali alternatenames are often machine-transliterated rather than community-curated.

---

## 4. Proposed `aliases.bn` for BATCH-A-22

Per user direction "لا تضف aliases عشوائية أو غير موثقة", only well-documented rename-pair or strong variant aliases:

| slug | proposed `aliases.bn` | rationale |
|------|---|---|
| `visakhapatnam`    | ভাইজাগ, বিশাখাপত্তম        | Vizag colloquial + raw shorter form |
| `varanasi`         | বেনারস, কাশী                | Banaras (alternate Bengali name) + Kashi (Sanskrit-derived religious name) |
| `vadodara`         | বরোদা                        | Baroda pre-1974 |
| `meerut`           | মীরুট                        | non-retroflex form (matches raw + alt transliteration) |
| `jamshedpur`       | জমশেদপুর                     | short-form variant from raw |
| `ghaziabad`        | ঘাজিয়াবাদ                    | ঘ variant from raw |
| `coimbatore`       | কোভাই                        | Kovai (Tamil colloquial — same as Urdu کوویل alias) |
| `aurangabad`       | ছত্রপতি সম্ভাজীনগর           | 2022 official rename Chhatrapati Sambhajinagar |
| `prayagraj`        | এলাহাবাদ                     | Allahabad pre-2018 (from raw) |

**Total proposed aliases.bn for BATCH-22**: **11 aliases across 9 slugs**.

### Suggested SEED-18 alias additions (PLAN ONLY — not applying unless user approves)

These are NOT part of the APPLY scope but suggested for completeness:

| slug | current `aliases.bn` | suggested addition | rationale |
|------|---|---|---|
| `mumbai`        | [] | বম্বে                       | Bombay pre-1995 (Bengali Wikipedia variant) |
| `chennai`       | [] | মাদ্রাজ                     | Madras pre-1996 (well-documented in Bengali Wikipedia) |
| `bengaluru`     | [] | বাঙ্গালোর                   | Bangalore pre-2014 (also in GeoNames raw alternateNames) |

**Total suggested SEED-18 alias additions**: 3 aliases across 3 slugs. Held for explicit user decision at APPLY-phase.

---

## 5. Bengali script guard policy

Strict `isCleanBengaliScript()` validator (proposed for apply phase, NOT implemented in this plan):

```js
// Required: text contains characters from Bengali Unicode block
const BENGALI_BLOCK  = /[ঀ-৿]/;          // U+0980-U+09FF — REQUIRED

// Reject Assamese-only letters (Bengali/Assamese diverge at ৰ ৱ)
const ASSAMESE_ONLY  = /[ৰৱ]/;            // U+09F0 ৰ + U+09F1 ৱ — reject

// Reject Latin (no romanization in names.bn)
const LATIN          = /[A-Za-z]/;

// Reject all other Indian scripts that could leak via cross-lang alts in raw
const DEVANAGARI     = /[ऀ-ॿ]/;           // U+0900-U+097F — Hindi
const ARABIC         = /[؀-ۿ]/;           // U+0600-U+06FF — Urdu/Arabic/Persian
const TAMIL          = /[஀-௿]/;           // U+0B80-U+0BFF
const GURMUKHI       = /[਀-੿]/;            // U+0A00-U+0A7F — Punjabi
const GUJARATI       = /[઀-૿]/;            // U+0A80-U+0AFF
const TELUGU_KANNADA = /[ఀ-ೞ]/;            // U+0C00-U+0CDE
const MALAYALAM      = /[ഀ-ൿ]/;           // U+0D00-U+0D7F

function isCleanBengaliScript(s) {
    if (!s) return false;
    if (LATIN.test(s))           return false;
    if (DEVANAGARI.test(s))      return false;
    if (ARABIC.test(s))          return false;
    if (TAMIL.test(s))           return false;
    if (GURMUKHI.test(s))        return false;
    if (GUJARATI.test(s))        return false;
    if (TELUGU_KANNADA.test(s))  return false;
    if (MALAYALAM.test(s))       return false;
    if (ASSAMESE_ONLY.test(s))   return false;
    return BENGALI_BLOCK.test(s);
}
```

**This is the same guard used by PLACE-NAMES-BN-BD-1** (`scripts/geodata/_place_names_bn_bd_1_apply.mjs`) — proven viable. Re-using it ensures consistency across BD and IN Bengali enrichment waves.

### Empirical validation

Pre-validated all 22 proposed `names.bn` + 11 proposed `aliases.bn`:
- All contain Bengali block characters U+0980-U+09FF ✓
- 0 Latin contamination ✓
- 0 Devanagari contamination ✓
- 0 Arabic/Urdu contamination ✓
- 0 Tamil/Gurmukhi/Gujarati/Telugu/Kannada/Malayalam contamination ✓
- 0 Assamese-only letters ৰ ৱ ✓ (audit detected raw Assamese-leaks for jaipur/ahmedabad/vijayawada/vadodara/pimpri-chinchwad — none picked)

**Script guard: 100% PASS for all 22 proposed Bengali names + 11 proposed aliases.**

---

## 6. Entries needing manual review at APPLY time

The following 5 entries have semantic-mismatch or canonical-source decisions that deserve explicit user review at APPLY time:

| slug | Decision needed | Options |
|------|----|----|
| `prayagraj` | Use 2018 rename প্রয়াগরাজ (post) or এলাহাবাদ (pre)? | Same call as AR/HI/UR waves; Bengali Wikipedia uses post-2018 rename. **Recommendation: প্রয়াগরাজ primary + এলাহাবাদ alias.** Consistent across all 4 langs (ar/hi/ur/bn). |
| `varanasi` | Primary বারাণসী or বেনারস? | Bengali Wikipedia uses বারাণসী as primary (matches global naming); বেনারস is alternate. **Recommendation: বারাণসী primary + বেনারস/কাশী aliases.** Mirrors ar/hi/ur pattern (canonical + classical aliases). |
| `meerut` | মেরঠ (retroflex Hindi-aligned) or মীরুট (raw)? | Raw has odd মীরুট. **Recommendation: মেরঠ primary (Wikipedia canonical, retroflex matches Hindi मेरठ + Urdu میرٹھ) + মীরুট alias.** Consistent semantic alignment across hi/ur/bn. |
| `aurangabad` | Include 2022 rename ছত্রপতি সম্ভাজীনগর as alias? | Already added in HI as alias.hi and UR as alias.ur. **Recommendation: include — consistent multi-lang policy.** |
| `coimbatore` | কোয়েম্বাটুর (Wikipedia) or কোইমবাতোরে (raw)? | Raw form looks machine-transliterated. **Recommendation: কোয়েম্বাটুর primary (Bengali Wikipedia) — raw form NOT kept as alias (semi-machine).** |

---

## 7. Risks

| # | Risk | Severity | Mitigation |
|---|------|---------|-----------|
| 1 | SEED-18 already has names.bn — apply must preserve byte-identically | Low | SEED-18 byte-identity guard (same pattern as UR-IN-1) |
| 2 | SEED-18 has pre-existing `aliases.bn` (new-delhi + kolkata) — must preserve | Low | Verified in audit; PRIOR-aliases post-mutation check |
| 3 | Assamese-leak from raw alternatenames (ৰ ৱ U+09F0 U+09F1) | Medium | Script guard rejects ASSAMESE_ONLY; 5 raw Assamese-leak candidates found in audit (jaipur জয়পুৰ, ahmedabad অমদাৱাদ, vijayawada বিজয়াৱদা, vadodara ৱডোদরা, pimpri-chinchwad পিম্পরি চিনচৱাদ) — none picked |
| 4 | BD-vs-IN Bengali script overlap (same Unicode block) — risk of carrying Bangladesh names | Medium | NO `bd-geonames-*` files read; per-entry names independently sourced from IN raw + Bengali Wikipedia; cross-collision check vs BD entries planned for apply phase |
| 5 | Some Wikipedia-sourced names differ markedly from raw — semantic-mismatch decisions for varanasi/prayagraj/meerut/coimbatore | Medium | All 5 flagged in §6 for explicit review |
| 6 | Allahabad→Prayagraj rename (same as Hindi/Urdu) | Low | Pattern proven in HI-IN-1 and UR-IN-1; ALI→PRY swap consistent across ar/en/hi/ur/bn |
| 7 | nashik/agra/amritsar etc. have very short raw — pick may be uncontroversial | Very Low | KEEP_RAW with single clean candidate |
| 8 | `ghaziabad` raw has both গ and ঘ variants — picked গ | Low | Bengali Wikipedia canonical uses গ; ঘ kept as alias |
| 9 | `dhanbad` raw had extra আ (ধানাবাদ) — FIX strips it | Low | Wikipedia canonical ধানবাদ matches Hindi धनबाद (no extra আ) |
| 10 | `pimpri-chinchwad` raw has no hyphen — Wikipedia adds it | Low | Mirrors hi `पिंपरी-चिंचवाड़` and ur `پمپری چنچواڑ` decisions |
| 11 | No fillchain risk — bn is in SUPPORTED_LANGS but fillLangMap guard only fills if partial.bn provided | Low | Verified in fillLangMap unit tests (still 11/11) |

---

## 8. Files this plan phase changed

### CREATED

| File | Purpose |
|------|---------|
| `reports/place-names-bn-in-1-plan.md` | This plan report |
| `scripts/geodata/_place_names_bn_in_1_audit.mjs` | Read-only audit script (no mutation; outputs to stdout only) |

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
- ❌ Brunei (`bn-geonames-*`) files — NOT used
- ❌ Bangladesh (`bd-geonames-*`) files — NOT used
- ❌ Pakistan (`pk-geonames-*`) files — NOT used
- ❌ MEMORY.md — not updated (deferred to post-user-approval)

### Operations explicitly NOT run

- ❌ No apply script created (per spec — plan only)
- ❌ No Stage 4 invocation
- ❌ 0 mutations to any of 40 IN curated entries (verified — full byte-identity post-audit)
- ❌ 0 mutations to any of 2,488 non-IN entries

---

## 9. Recommendation for scope

### Option A — Apply all 22 BATCH-A in single wave (RECOMMENDED)

Single APPLY wave covering only the 22 BATCH-A entries (SEED-18 untouched). Pros:
- Mirrors HI-IN-1 (40 single wave) and UR-IN-1 (22 BATCH single wave) — both proven viable with 1,000+ tests passing
- 11/22 sources are GeoNames raw + 11/22 Bengali Wikipedia canonical (well documented)
- All 5 manual-review entries already classified + decided (§6)
- Single closure round, easier user verification
- Same SEED-18 byte-identity hard guard pattern proven in UR-IN-1

### Option B — Split RAW-based (11) + WIKIPEDIA-based (11) waves

Two waves: PLACE-NAMES-BN-IN-1A (11 RAW-sourced) + PLACE-NAMES-BN-IN-1B (11 Wikipedia-sourced).
**Pros**: cleaner source separation
**Cons**: doubles orchestration; user already approved Option A pattern for UR-IN-1

### Option C — Include SEED-18 alias polish (3 additions: mumbai+বম্বে, chennai+মাদ্রাজ, bengaluru+বাঙ্গালোর)

Adds the 3 suggested SEED-18 alias additions to the same wave.
**Pros**: One-shot complete Bengali polish for all 40 entries
**Cons**: Touches 23 entries (22 BATCH + 3 SEED) — slightly broader scope

### Recommended path: **Option A — 22 BATCH-A only, single wave**

Justification:
- Pattern proven through UR-IN-1 closure (22/22 names + 17 aliases + SEED-18 byte-identical + 1,105 tests pass)
- Smallest blast radius (no SEED-18 mutations at all)
- Achieves IN Bengali 22/22 BATCH coverage → overall IN 40/40
- Apply script mirror-able from UR-IN-1 template
- 5 manual-review entries already resolved in §6

---

## 10. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/place-names-bn-in-1-plan.md` | ✓ |
| 2 | Bengali coverage current state documented | ✓ (Section 1 — 18/40 SEED + 0/22 BATCH) |
| 3 | Plan for all 40 IN entries | ✓ (Section 2 SEED preserved + Section 3 BATCH proposed) |
| 4 | Bengali sources documented per entry | ✓ (KEEP_RAW=9, FIX_RAW=2, WIKIPEDIA=11) |
| 5 | aliases.bn proposed (only documented + non-random) | ✓ (Section 4 — 11 aliases across 9 BATCH slugs + 3 suggested SEED additions) |
| 6 | Bengali script guard documented | ✓ (Section 5 — same as BN-BD-1 proven pattern) |
| 7 | No `curated-places.json` mutation | ✓ (0 byte diff) |
| 8 | No add / delete cities | ✓ |
| 9 | No `names.ar` / `names.en` / `names.hi` / `names.ur` mutation | ✓ |
| 10 | No slug changes | ✓ |
| 11 | No runtime translation | ✓ |
| 12 | No fillchain | ✓ |
| 13 | No Held Queue phase started | ✓ |
| 14 | No merge / Stage 4 invocation | ✓ |
| 15 | Audit script (if any) is read-only | ✓ (`_place_names_bn_in_1_audit.mjs` outputs to stdout only) |

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ **PLACE-NAMES-BN-IN-1 APPLY** (the actual execution — awaits this plan's approval)
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
| Report path | `reports/place-names-bn-in-1-plan.md` |
| Audit script | `scripts/geodata/_place_names_bn_in_1_audit.mjs` (read-only) |
| Current IN Bengali coverage | **18/40 (45%)** — all SEED-18, none of BATCH-A-22 |
| Proposed cities to enrich (BATCH-A) | **22** |
| SEED-18 entries to mutate | **0** (preserve all 18 names.bn + 2 aliases.bn byte-identically) |
| GeoNames raw source | 11/22 (50%) — 9 KEEP + 2 FIX |
| Bengali Wikipedia source | 11/22 (50%) — visakhapatnam/vijayawada/varanasi/tirunelveli/thane/meerut/madurai/faridabad/dombivali/coimbatore/prayagraj |
| Wikidata / Manual fallback | 0 |
| aliases.bn proposed for BATCH-22 | 11 aliases across 9 slugs (rename pairs + variants) |
| aliases.bn suggested for SEED-18 (PLAN-only, not applied) | 3 additions (mumbai+Bombay, chennai+Madras, bengaluru+Bangalore) |
| Entries needing explicit user review at APPLY | **5** (prayagraj rename, varanasi alias choice, meerut retroflex, aurangabad 2022 alias, coimbatore Wikipedia form) |
| Bengali script guard | All 22 + 11 aliases pass strict guard |
| Assamese-leak rejection (ৰ ৱ) | 5 raw leaks found in audit — 0 picked |
| `curated-places.json` mutations | **0 bytes changed** |
| Merge | **NOT RUN** |
| Runtime translation | **NONE** |
| Brunei / Bangladesh / Pakistan data used | **NONE** |
| **Recommended scope** | **Option A — 22 BATCH-A only, single wave** |

**Alternatives**: Option B (split RAW+Wikipedia) or Option C (include SEED-18 alias polish).

**Next step**: user reviews this plan and decides Option A/B/C. No further work until user direction.
