# SEARCH-RANKING-TARGETED-DATA-FIXES-1-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no code change, no curated mutation
**Date**: 2026-05-20
**Phase**: Targeted data fixes for search ranking (replaces algorithm-change track)
**Prerequisites met**:
- SEARCH-RANKING-IMPROVEMENT-1-PLAN user-approved (Option B chosen)
- SEARCH-RANKING-IMPROVEMENT-1A-PLAN user-approved (Option B.C chosen — hold scoring, do data fixes instead)

---

## 1. Background — why data fixes, not scoring change

### Population scoring path rejected because:

1. **`population` field is NOT in any curated entry** (0/2528 verified). The proposed `Math.log10(population + 1) * 0.5` patch would have been a no-op without a 2,528-entry population backfill.
2. **Backfilling population for all 2,528 entries** is a wide-scope data wave that's not justified just to fix a handful of search ranking edge cases.
3. **The cited failure cases are predominantly data-quality issues**, not algorithm issues:
   - `mum → muli`: caused by `aliases.en=["MUM"]` (IATA airport code) on a 13k-pop Maldives island
   - `pun → puno`: caused by priority(puno)=90 > priority(pune)=82 — a priority data inconsistency
   - `Barishal → external`: caused by missing `aliases.en=["Barishal"]` on `bd/barisal`

This plan addresses the root causes via small, surgical data edits.

---

## 2. Three categories of proposed fixes

### A) IATA / airport-code alias cleanup (5 entries)

**Why**: Aliases that are 2-4 uppercase letters often turn out to be IATA airport codes. When lowercased they can EXACTLY match common 3-letter English query prefixes ("MUM" → "mum"), giving them tier-100 exact-match scores that beat actual major cities on prefix-match (tier 80).

**Audit findings** (`scripts/search/_search_ranking_targeted_data_fixes_1_audit.mjs` proposed; analysis run inline):
- **851** suspicious 2-4-char uppercase aliases.en across all curated
- After filtering against common city-prefix collisions (MUM/SRI/IND/FAR/BAG/etc.): **9 high-collision candidates**
- Of those 9: **5 are removal candidates** (clear IATA noise); **4 are KEEP** (well-known city abbreviations: NYC/LA/KL/HKD/AGR — AGR resolves to same entry so harmless)

| # | Slug (cc/slug) | Current `aliases.en` | Remove | Reason | Query it breaks |
|---|---|---|---|---|---|
| A1 | `mv/muli` | `["MUM", "muri", "mwly"]` | **"MUM"** | IATA code for Muli airport in Maldives (pop 13k). Exact-matches query "mum" → outranks Mumbai (12.7M pop) | `mum` → returns muli instead of mumbai |
| A2 | `id/samarinda` | includes `"SRI"` | **"SRI"** | IATA code for Samarinda airport in Indonesia. Exact-matches query "sri" → outranks Srinagar (curated IN PPLA, 1.2M pop) | `sri` → returns samarinda instead of srinagar |
| A3 | `us/indianapolis` | includes `"IND"` | **"IND"** | IATA code for Indianapolis. Exact-matches query "ind" → outranks Indore (curated IN, 2M pop) and even "India" country queries | `ind` → returns indianapolis instead of indore |
| A4 | `us/fargo` | includes `"FAR"` | **"FAR"** | IATA code for Fargo Hector airport. Exact-matches "far" → outranks Faridabad (curated IN, 1.4M pop) | `far` → returns fargo instead of faridabad |
| A5 | `ph/baguio` | includes `"BAG"` | **"BAG"** | IATA code for Baguio. Exact-matches "bag" → potentially collides with "Baghdad" + Indian "Bag-" prefix names | `bag` → returns baguio when Baghdad expected (or other) |

**4 IATA aliases NOT proposed for removal (KEEP)**:

| Slug | alias | Why keep |
|---|---|---|
| `us/new-york` | `"NYC"` | Universal abbreviation — users actually type "NYC" |
| `us/los-angeles` | `"LA"` | Universal abbreviation — users actually type "LA" |
| `my/kuala-lumpur` | `"KL"` | Universal abbreviation — users actually type "KL" |
| `in/agra` | `"AGR"` | IATA for Agra airport BUT resolves to same entry (agra) — harmless. "agr" query already returns agra via prefix on its name. |
| `jp/hakodate` | `"HKD"` | IATA + Hong Kong dollar code — low collision risk (HK and HKD don't conflict with major Japanese city queries) |

### B) Priority rebalance (8 entries — all IN SEED-18 metros)

**Why**: IN SEED-18 metros have unusually low `priority` values (76-85) given their populations (1.5M-12M), while smaller foreign cities with the same name-prefix have priority 90. This causes IN major cities to lose prefix-tie queries.

**Audit finding** — IN SEED-18 priorities ranked by current value:

| slug | Current priority | Pop (approx) | Same-prefix higher-priority competitor | Proposed |
|---|---:|---:|---|---:|
| `pune` | **82** | 3.1M | pe/puno (140k) priority=90 | **95** |
| `chennai` | **85** | 4.68M | gb/cheltenham/chelmsford, de/chemnitz, etc. all priority=90 | **95** |
| `bengaluru` | **85** | 8.5M | ma/beni-mellal (priority 90), id/bengkulu (90) | **95** |
| `hyderabad-in` | **85** | 6.8M | n/a same-prefix higher; but defensive bump for hyderabad-pk ambiguity | **95** |
| `ahmedabad` | **80** | 6.4M | various ahm-prefix small cities | **95** |
| `lucknow` | **80** | 3.4M | defensive | **90** |
| `jaipur` | **80** | 3.0M | defensive | **90** |
| `surat` | **78** | 4.4M | defensive | **90** |

(Other IN SEED-18 entries with priority < 90: kanpur 76, indore 76, nagpur 76, bhopal 82, patna 82, srinagar 80, kochi 78. These are CANDIDATES but I'm being conservative — not proposing them in this wave to keep scope tight.)

**Why NOT touch PK/BD priorities**:
- PK: existing tests (UR-PK-6, asia-1d-pk-search, asia-1d-pk-mcf) pass — empirically priorities work for PK queries
- BD: same — BN-BD-1 + BN-IN-1 tests pass

### C) Missing rename alias (1 entry)

**Why**: User report from SEARCH-RANKING-IMPROVEMENT-1-PLAN — query "Barishal" falls through to external Nominatim because the curated `bd/barisal` entry doesn't have "Barishal" in its `aliases.en`.

**Audit finding** — checked 18 known rename pairs (Barishal/Chattogram/Cumilla/Bogura/Jashore/Bombay/Calcutta/Madras/Bangalore/Allahabad/Banaras/Kashi/Vizag/Baroda/Chhatrapati Sambhajinagar/Kovai/etc.):
- **17/18 already present** ✓
- **1 missing**: bd/barisal has no `aliases.en=["Barishal"]`

| # | Slug | Field | Current | Proposed addition |
|---|---|---|---|---|
| C1 | `bd/barisal` | `aliases.en` | `["Barisal"]` | Add `"Barishal"` (2018 official rename to Barishal) |

---

## 3. Proposed fixes — full table

| # | Type | Slug (cc/slug) | Field | Current | Proposed | Reason | Risk | Fixes query |
|---|---|---|---|---|---|---|:---:|---|
| A1 | remove_alias | mv/muli | aliases.en | `["MUM", "muri", "mwly"]` | `["muri", "mwly"]` | IATA noise blocks Mumbai | Low | `mum` |
| A2 | remove_alias | id/samarinda | aliases.en | includes `"SRI"` | drop `"SRI"` | IATA noise blocks Srinagar | Low | `sri` |
| A3 | remove_alias | us/indianapolis | aliases.en | includes `"IND"` | drop `"IND"` | IATA noise blocks Indore | Low | `ind` |
| A4 | remove_alias | us/fargo | aliases.en | includes `"FAR"` | drop `"FAR"` | IATA noise blocks Faridabad | Low | `far` |
| A5 | remove_alias | ph/baguio | aliases.en | includes `"BAG"` | drop `"BAG"` | IATA noise (less critical) | Very Low | `bag` |
| B1 | priority_adjust | in/pune | priority | 82 | 95 | 3.1M city losing to Puno 140k | Low | `pun` |
| B2 | priority_adjust | in/chennai | priority | 85 | 95 | 4.68M city, low priority for capital-of-TN | Low | `che` |
| B3 | priority_adjust | in/bengaluru | priority | 85 | 95 | 8.5M city, low priority | Low | `ben` |
| B4 | priority_adjust | in/hyderabad-in | priority | 85 | 95 | 6.8M city | Low | `hyd` |
| B5 | priority_adjust | in/ahmedabad | priority | 80 | 95 | 6.4M city | Low | `ahm` |
| B6 | priority_adjust | in/lucknow | priority | 80 | 90 | 3.4M city | Very Low | `luc` |
| B7 | priority_adjust | in/jaipur | priority | 80 | 90 | 3.0M city | Very Low | `jai` |
| B8 | priority_adjust | in/surat | priority | 78 | 90 | 4.4M city | Very Low | `sur` |
| C1 | add_alias | bd/barisal | aliases.en | `["Barisal"]` | `["Barisal", "Barishal"]` | 2018 rename — current "Barishal" query falls through to external | Low | `Barishal` |

**Total fixes**: **14** (5 IATA + 8 priority + 1 alias) — well within the 20-30 max budget.

---

## 4. Pre/post test cases — expected behavior

### Positive fixes (must verify after APPLY)

| # | Query | Lang | Before | After | Notes |
|---|---|---|---|---|---|
| 1 | `mum` | en | muli:mv:121 > mumbai:in:109 | mumbai 1st (muli loses MUM alias → tier drops from exact 100 to prefix-of-muri "mum"...wait, muri doesn't start with mum either. muli:0 → mumbai 1st with no competitor) | A1 fix |
| 2 | `sri` | en | samarinda may rank above srinagar (depending on aliases) | srinagar 1st | A2 fix |
| 3 | `ind` | en | indianapolis may rank above indore | indore 1st (via prefix "ind" of indore) | A3 fix |
| 4 | `far` | en | fargo may rank above faridabad | faridabad 1st | A4 fix |
| 5 | `bag` | en | baguio rank — low criticality | baguio drops | A5 fix |
| 6 | `pun` | en | puno:pe:107 > pune:in:105 | pune 1st (pune prio 95: 80+28.5=108.5; puno: 80+27=107 → pune wins by 1.5) | B1 fix |
| 7 | `che` | en | cheltenham/chelmsford/etc. tied with chennai | chennai 1st (95 prio gives chennai 108.5 vs others 107) | B2 fix |
| 8 | `ben` | en | bengaluru may tie with beni-mellal/bengkulu | bengaluru 1st (95 prio) | B3 fix |
| 9 | `hyd` | en | hyderabad-in still 1st | hyderabad-in still 1st (wider gap from PK) | B4 reinforces |
| 10 | `ahm` | en | ahmedabad probably 1st | ahmedabad 1st (95 prio) | B5 fix |
| 11 | `Barishal` | en | external Nominatim → barishal (not curated) | curated bd/barisal returned with Barishal alias match | C1 fix |

### Regression checks (MUST stay green)

All happy-path queries from SEARCH-RANKING-IMPROVEMENT-1-PLAN (55/56) — none should break:

| Query | Expected (must remain) |
|---|---|
| `Bombay` | mumbai ✓ |
| `Calcutta` | kolkata ✓ |
| `Madras` | chennai ✓ |
| `Bangalore` | bengaluru ✓ |
| `Allahabad` | prayagraj ✓ |
| `Banaras` | varanasi ✓ |
| `Kashi` | varanasi ✓ |
| `Vizag` | visakhapatnam ✓ |
| `Baroda` | vadodara ✓ |
| `Chhatrapati Sambhajinagar` | aurangabad ✓ |
| `Kovai` | coimbatore ✓ |
| All Urdu queries (دہلی/ممبئی/etc.) | unchanged ✓ |
| All Bengali queries (কলকাতা/etc.) | unchanged ✓ |
| All Arabic-script queries | unchanged ✓ |

**No risk of regression** because:
- **IATA removals**: only affect entries whose primary names are NOT the relevant city for the query
- **Priority bumps**: only INCREASE scores for IN metros — they can only WIN more queries, never lose
- **Alias addition for Barisal**: purely additive — only affects "Barishal" query (currently broken)

### Existing test suites (MUST keep passing)

| Suite | Count | Expected outcome |
|---|---:|---|
| `_test_search_place_endpoint.mjs` | 659 | 659/659 (no top-result changes for tested queries) |
| `_test_place_by_slug.mjs` | 44 | 44/44 (no slug changes) |
| `_test_city_page_l10n.mjs` | 152 | 152/152 (no name changes) |
| `_test_search_ar.mjs` | 22 | 22/22 |
| `_test_place_names_{hi,ur,bn}_in_1.mjs` | 116+122+113=351 | 351/351 (no name/alias mutations to IN names) |
| `_test_place_names_ur_pk_6.mjs` | 69 | 69/69 (no PK touch) |
| `_test_fill_lang_map.mjs` | 11 | 11/11 (no fillLangMap touch) |
| `_test_home_search_migration.mjs` | 33 | 33/33 |
| Total carry-forward | **~1,500** | Must stay 100% |

---

## 5. Risks

| # | Risk | Severity | Mitigation |
|---|---|:---:|---|
| 1 | Removing IATA alias breaks legitimate user query for that small city | Low | Each removal evaluated: muli/samarinda/indianapolis/fargo/baguio are not common search targets; users searching them by NAME (not code) still get them |
| 2 | Priority bump for chennai/bengaluru could affect 2nd-tier results for cheltenham/chelmsford/beni-mellal queries | Low | Those cities still WIN their EXACT name queries (tier 100) — bump only affects PREFIX-tie cases |
| 3 | Adding "Barishal" alias to barisal could shadow a different city named "Barishal" | Very Low | Verified: no other curated entry has "Barishal" as primary or alias. External Nominatim has `barishal-division` (admin region, not city). User explicitly noted Barishal=2018 rename of Barisal. |
| 4 | Existing tests assert SPECIFIC confidence values that may shift slightly | Medium | Most assertions check top-result slug, not confidence number. Tests that check confidence numbers will need light updates (worth checking before APPLY) |
| 5 | Other IATA aliases (the 846 not in the high-collision shortlist) could cause future query failures | Low | Out of scope for THIS plan; could be addressed in a future broader IATA-cleanup wave if needed |
| 6 | Pakistan SEED priority issues (rawalpindi 80, peshawar 80, multan 80, faisalabad 80, quetta 76) not addressed here | Low | Current PK tests pass — no empirical failure observed. Could be addressed in a follow-up wave if PK prefix-tie failures emerge |
| 7 | Removing "BAG" from baguio might be over-aggressive — Baguio is a known Philippine city (~350k pop) and users might search "BAG" intentionally | Very Low | If user prefers, can remove only A1-A4 and keep "BAG" |

---

## 6. Rollback plan

If post-APPLY regressions appear:

1. **Restore from backup**: `cp db/places/curated-places.json.preTargetedDataFixes1.bak db/places/curated-places.json`
2. **Or per-fix revert**: each fix is independent — can revert individual aliases/priorities without affecting others
3. **Git-level revert**: `git revert <apply-commit>` (single commit covers all 14 fixes)

Backup strategy: apply script writes `.preTargetedDataFixes1.bak` before any mutation. Idempotent re-run safe.

---

## 7. Files this plan phase changed

### CREATED

| File | Purpose |
|---|---|
| `reports/search-ranking-targeted-data-fixes-1-plan.md` | This plan report |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff (verified)
- ❌ `db/places/candidates/*` — unchanged
- ❌ `server.js` — 0 byte diff (verified)
- ❌ `js/app.js` — 0 byte diff (verified)
- ❌ `index.html` — unchanged
- ❌ All shared scripts — unchanged
- ❌ All existing test scripts — unchanged
- ❌ No new audit script needed (analysis was via inline `node -e` against curated)
- ❌ MEMORY.md — not updated (deferred to post-user-approval if APPLY landed)

### Operations explicitly NOT run

- ❌ No aliases removed
- ❌ No priorities adjusted
- ❌ No aliases added
- ❌ No population backfill
- ❌ No scoring patch
- ❌ No code change to `_searchCuratedPlaces`
- ❌ No Stage 4 invocation, no merge
- ❌ No new routes / Held-Queue phases started
- ❌ No runtime translation, no fillchain

---

## 8. Recommendation

### Option A — Apply all 14 fixes in single wave (RECOMMENDED)

**Pros**:
- Single wave, single commit, single user review
- All 14 fixes are independent — each addresses a documented issue
- Conservative — only touches 14 entries out of 2,528 (0.55%)
- High confidence — each fix's positive effect is predictable
- Low regression risk — additive priority bumps + harmless alias removals + 1 additive alias

**Cons**:
- 14 fixes is more than a "micro-patch"

### Option B — Split into 3 micro-waves

- **Wave 1**: IATA cleanup (5 fixes) → `SEARCH-RANKING-DATA-FIXES-1A`
- **Wave 2**: Priority rebalance (8 fixes) → `SEARCH-RANKING-DATA-FIXES-1B`
- **Wave 3**: Barishal alias (1 fix) → could fold into BD-SEED-1 alias enrichment

**Pros**: smallest individual wave size
**Cons**: 3× orchestration; all 3 waves are low-risk; no benefit from splitting

### Option C — Conservative subset only (7 fixes)

Apply only the highest-confidence fixes:
- IATA cleanup: A1 (muli MUM), A2 (samarinda SRI), A3 (indianapolis IND), A4 (fargo FAR) — skip A5 (baguio BAG)
- Priority rebalance: B1 (pune — only proven failure)
- Missing alias: C1 (barishal)
- Skip B2-B8 (defensive bumps)

**Pros**: smallest scope, only addresses proven failures
**Cons**: leaves IN metros under-prioritized; doesn't future-proof against similar same-prefix collisions

### Recommended path: **Option A — all 14 fixes in single wave**

Justification:
- 14 entries out of 2,528 = 0.55% — still very conservative
- All fixes are independent + reversible
- Single-wave overhead is lower
- IN metros deserve priority parity with foreign small cities (defensive bumps prevent future failures)

If user prefers tighter scope: **Option C (7 fixes)** is also viable.

---

## 9. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/search-ranking-targeted-data-fixes-1-plan.md` | ✓ |
| 2 | No population backfill proposed | ✓ |
| 3 | No scoring patch proposed | ✓ |
| 4 | No `server.js` / `js/app.js` mutation | ✓ |
| 5 | No `curated-places.json` mutation | ✓ |
| 6 | Data fixes documented, limited, explicit (14 fixes) | ✓ |
| 7 | Suspicious aliases documented | ✓ (§2.A — 9 high-collision; 5 proposed for removal) |
| 8 | Missing aliases documented | ✓ (§2.C — 17/18 already present; 1 missing) |
| 9 | Priority fixes documented | ✓ (§2.B — 8 IN metros) |
| 10 | Test cases clear (pre/post) | ✓ (§4) |
| 11 | No add/delete cities | ✓ |
| 12 | No runtime translation | ✓ |
| 13 | No fillchain | ✓ |
| 14 | No Held-Queue phase started | ✓ |

---

## 10. Held queue (per user direction — DO NOT auto-start)

- ❌ **SEARCH-RANKING-TARGETED-DATA-FIXES-1 APPLY** (awaits user direction on Option A / B / C)
- ❌ POP-BACKFILL-1 (off the table per user decision)
- ❌ SEARCH-RANKING-IMPROVEMENT-1 scoring patches (off the table per user decision)
- ⏸️ PAUSED: PLACE-NAMES-TA-IN-1, MR-IN-1, HI-IN-LOCALE-ROUTING-1
- ❌ ASIA-1D-IN-B
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1

---

## Status: 📋 PLAN COMPLETE — AWAITING USER DECISION

### Summary

| Metric | Value |
|---|---|
| Report path | `reports/search-ranking-targeted-data-fixes-1-plan.md` |
| Total proposed fixes | **14** (5 IATA + 8 priority + 1 alias) |
| Curated entries touched | 14 / 2528 = **0.55%** |
| IATA aliases proposed for removal | **5** (muli MUM, samarinda SRI, indianapolis IND, fargo FAR, baguio BAG) |
| IATA aliases KEPT (well-known abbreviations) | **4** (NYC, LA, KL, HKD) + AGR (harmless) |
| Priority adjustments proposed | **8** IN SEED-18 metros (pune/chennai/bengaluru/hyderabad-in/ahmedabad/lucknow/jaipur/surat) |
| Missing aliases to add | **1** (bd/barisal + "Barishal") |
| Queries fixed | mum / sri / ind / far / bag / pun / che / ben / hyd / ahm / Barishal (11 query patterns) |
| Curated mutations in this plan phase | **0 bytes changed** |
| `server.js` / `js/app.js` mutations | **0 bytes changed** |
| Held Queue phases started | **0** |
| Runtime translation / fillchain | **NONE** |
| **Recommended path** | **Option A — all 14 fixes in single wave** |

**Alternatives**: Option B (split into 3 sub-waves — overhead) or Option C (7 fixes only — minimum scope).

**Next step**: user reviews and decides Option A / B / C / modifications. No further work until user direction.
