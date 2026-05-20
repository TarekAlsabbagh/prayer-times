# SEARCH-RANKING-IMPROVEMENT-1A-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no code change, no curated mutation
**Date**: 2026-05-20
**Phase**: Patch 1 — population tiebreaker only (micro-patch)
**Prerequisites met**: SEARCH-RANKING-IMPROVEMENT-1-PLAN user-approved 2026-05-20
**Decision**: Option B (split into micro-patches) — this is Patch 1 of N

---

## 1. Problem summary

From SEARCH-RANKING-IMPROVEMENT-1-PLAN §4 adversarial findings:

| # | Query | Current result | Should be | Why current is wrong |
|---|---|---|---|---|
| 1 | `mum` (en) | **muli:mv:121** ranks above mumbai:in:109 | mumbai (12.7M pop) | muli's `aliases.en` has IATA airport code `"MUM"` → exact-match (100) + priority 70 = 121 |
| 2 | `pun` (en) | **puno:pe:107** ranks above pune:in:105 | pune (3.1M pop) | both prefix-match (80) → priority breaks tie: puno=90 > pune=82 |
| 3 | `Mu` (en) | muscat:om:110, munich:de:109, mumbai:in:109 | mumbai (12.7M) | tied; priority sort decides |

**Population tiebreaker** would correctly rank Mumbai (12.7M) above Muli (13k) and Pune (3.1M) above Puno (140k) **when matches are at the same tier**.

---

## 2. 🚨 CRITICAL pre-condition discovery

Investigating before drafting the patch revealed:

**`population` field is NOT stored on ANY curated entry** (verified by inspecting all 2,528 entries):

| Check | Count |
|---|---:|
| Curated entries with `e.population` (top-level) | **0 / 2528** |
| Curated entries with `e.admin.population` (nested) | **0 / 2528** |
| Curated entries WITHOUT population | **2528 / 2528** |

This means the originally proposed patch `+ Math.log10(population + 1) * 0.5` would be a **no-op** as drafted — `(0 + 1)` → `log10(1)` → `0` → no boost.

**Source of truth**: `population` IS present in GeoNames raw (`db/places/candidates/*-geonames-raw.json`) and in candidate JSON files. The Stage 4 merge script (`scripts/geodata/apply_curated_candidates.mjs`) does NOT currently propagate the `population` field from candidates → curated. This is by design — historically, curated entries used `priority` (1-100 scale, default 50) as a human-curated importance proxy.

### Current `priority` distribution (existing proxy)

| Range | Count |
|---|---:|
| 60-69 | 92 |
| 70-79 | 309 |
| 80-89 | 930 |
| 90-99 | 1167 |
| 100-109 | 30 |
| **Total** | **2528** |

Spot priorities for problem cases: mumbai=95, muli=70, pune=82, puno=90, riyadh=100, new-delhi=100, dhaka=95, karachi=95, chennai=85.

Note: pune (82) < puno (90) — that's why puno wins. The `priority` curated values don't fully reflect population (Pune is ~22× larger than Puno yet has LOWER priority).

---

## 3. Three viable execution paths

Patch 1 cannot land as a pure scoring tweak — it has a data prerequisite. Three honest options:

### Path A — Combined: backfill population THEN apply scoring boost (RECOMMENDED)

Two sub-changes in one wave:

**A.1 — One-shot population backfill** (data enrichment):
- Add a new script `scripts/_backfill_curated_population_1.mjs` (idempotent, ONE-shot)
- Reads `db/places/candidates/*-geonames-raw.json` (already on disk for all countries)
- Matches curated entries by `sourceId` (e.g. `"geonames:1275339"` → look up that geonameId in IN raw → grab `population` field)
- Writes `e.population` (top-level integer) for each matched curated entry
- Falls back to coordinate-proximity match (±0.02°) when sourceId is missing
- Skips entries where population can't be determined (leaves field absent)

**A.2 — `_searchCuratedPlaces` 1-line scoring boost**:
- In `server.js` after `const prio = ...`:
  ```js
  const pop = Number.isFinite(p.population) ? p.population : 0;
  const popBoost = Math.log10(pop + 1) * 0.5;
  const finalScore = score + prio * 0.3 + popBoost;
  ```

**Pros**: Patch actually works (closes the pune/puno gap and similar same-tier ties).
**Cons**: Two changes in one wave — wider blast radius than a true micro-patch. Curated mutated (population added for ~80%+ of entries).

### Path B — Scoring-only no-op now; defer backfill (CONSERVATIVE)

Apply ONLY the scoring-boost line in `server.js`. With `e.population` absent everywhere, `pop = 0` → `log10(1) * 0.5 = 0` → no boost → no behavior change. The patch is **inert** until population data lands later.

**Pros**: Truly micro-patch (single 1-line change to `server.js`). Zero behavior change. Easy revert.
**Cons**: Solves nothing in user-visible behavior. Just preparation for a future POP-BACKFILL-1 wave that does the data work separately.

### Path C — Use `priority` more aggressively (RE-USE existing data, no backfill)

Replace `+ priority * 0.3` with something more population-correlated using existing curated data:

Option C.1: `+ (priority - 50) * 0.6` (only entries above default 50 get boost; max +30 for priority=100)
Option C.2: Add a featureCode boost (PPLC +5, PPLA +3) using existing curated `type` field

**Pros**: No data prerequisite — works immediately with existing data.
**Cons**: priority is coarse (10-bucket); muli (priority 70) still beats mumbai (priority 95) under any priority-based formula because muli's match-tier is higher (exact=100 via IATA alias) vs mumbai's prefix=80. **PUNO-vs-PUNE is fixable** (boost difference: (90-50)*0.6=24 vs (82-50)*0.6=19.2 → puno still leads by 4.8, slightly worse). To flip puno→pune you'd need pune's curated priority RAISED (data fix), not a scoring change.

**Recommendation within C**: Don't do C in isolation. priority can't substitute for population at the granularity needed.

---

## 4. Why the muli case is actually a DATA bug (not ranking)

Found in §1: `muli.aliases.en` contains `"MUM"` — the IATA airport code for Muli airport.

After normalization: `"MUM"` → `"mum"` → **exact match** to query "mum" → score 100 (exact tier — the highest).

Mumbai's score for the same query: prefix match (`"mumbai"` starts with `"mum"`) = 80.

So even with population boost, mumbai's tier (80) is structurally below muli's tier (100). **No population multiplier in a reasonable range** (without massive over-engineering) can close a 20-point tier gap.

**The real fix for the muli case**: remove IATA airport codes from `aliases.en`. This is a curated-data hygiene issue — IATA codes shouldn't be search aliases (they're too short and collide with English words/prefixes).

A future micro-wave could be: **`SEARCH-RANKING-IATA-ALIAS-CLEANUP-1`** — scan all curated entries for 3-letter `aliases.en` that look like IATA codes and remove them. Out of scope for THIS plan, but worth noting.

---

## 5. Proposed patch — final scope decision

Given the analysis above, I propose **Path A** as the cleanest single-wave solution. Concrete patch:

### A.1 — Data backfill script

**New file**: `scripts/_backfill_curated_population_1.mjs`

```js
// Idempotent one-shot backfill: reads geonames raw + matches each
// curated entry to its source row → adds e.population = N.
import fs from 'node:fs';
import path from 'node:path';

const CURATED = 'db/places/curated-places.json';
const RAW_DIR = 'db/places/candidates';

function loadRaw(cc) {
    const f = path.join(RAW_DIR, cc + '-geonames-raw.json');
    if (!fs.existsSync(f)) return null;
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) { return null; }
}

function main() {
    const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
    const BACKUP = CURATED + '.preBackfillPopulation.bak';
    if (!fs.existsSync(BACKUP)) fs.writeFileSync(BACKUP, JSON.stringify(curated, null, 2) + '\n');

    // Group curated by countryCode → load only those raw files
    const byCc = {};
    for (const e of curated) {
        const cc = (e.countryCode || '').toLowerCase();
        if (!cc) continue;
        if (!byCc[cc]) byCc[cc] = [];
        byCc[cc].push(e);
    }

    const stats = { matched: 0, sourceIdMatch: 0, coordMatch: 0, unmatched: 0 };
    for (const cc of Object.keys(byCc)) {
        const raw = loadRaw(cc);
        if (!raw) {
            // No raw file — leave entries without population
            for (const e of byCc[cc]) stats.unmatched++;
            continue;
        }
        // Build lookup by geonameid
        const byGid = new Map();
        for (const r of raw) {
            if (r.country_code && r.country_code.toLowerCase() === cc) {
                byGid.set(r.geonameid, r);
            }
        }
        const byCoord = []; // backup linear search
        for (const r of raw) {
            if (r.country_code && r.country_code.toLowerCase() === cc) byCoord.push(r);
        }
        const TOL = 0.02;

        for (const e of byCc[cc]) {
            let pop = 0;
            // Try sourceId match first
            if (typeof e.sourceId === 'string' && e.sourceId.startsWith('geonames:')) {
                const gid = Number(e.sourceId.slice(9));
                const r = byGid.get(gid);
                if (r && Number.isFinite(r.population) && r.population > 0) {
                    pop = r.population;
                    stats.sourceIdMatch++;
                }
            }
            // Fall back to coord proximity
            if (pop === 0) {
                let best = null, bestDist = Infinity;
                for (const r of byCoord) {
                    if (!Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) continue;
                    if (Math.abs(r.latitude - e.lat) > TOL) continue;
                    if (Math.abs(r.longitude - e.lng) > TOL) continue;
                    const d = Math.hypot(r.latitude - e.lat, r.longitude - e.lng);
                    if (d < bestDist) { bestDist = d; best = r; }
                }
                if (best && Number.isFinite(best.population) && best.population > 0) {
                    pop = best.population;
                    stats.coordMatch++;
                }
            }
            if (pop > 0) {
                e.population = pop;
                stats.matched++;
            } else {
                stats.unmatched++;
            }
        }
    }

    fs.writeFileSync(CURATED, JSON.stringify(curated, null, 2) + '\n');
    console.log('═══ POP-BACKFILL SUMMARY ═══');
    console.log('  Matched:        ' + stats.matched);
    console.log('  via sourceId:   ' + stats.sourceIdMatch);
    console.log('  via coords:     ' + stats.coordMatch);
    console.log('  Unmatched:      ' + stats.unmatched);
}
main();
```

### A.2 — `server.js` 1-line patch

In `_searchCuratedPlaces` function around line 273-275:

**Before**:
```js
const prio = Number.isFinite(p.priority) ? p.priority : 50;
const finalScore = score + prio * 0.3;
```

**After**:
```js
const prio = Number.isFinite(p.priority) ? p.priority : 50;
const pop  = Number.isFinite(p.population) ? p.population : 0;
const popBoost = Math.log10(pop + 1) * 0.5;
const finalScore = score + prio * 0.3 + popBoost;
```

That's it. 2 new lines + 1 modified.

### Expected behavior

Both `prio * 0.3` and the new `popBoost` are ADDITIVE. The patch:
- Adds nothing to score when `population` is missing (`log10(1) * 0.5 = 0`)
- Adds ~3.55 to score for 12.7M pop city (mumbai)
- Adds ~2.05 for 13k pop city (muli)
- Adds ~3.25 for 3.1M pop city (pune)
- Adds ~2.57 for 140k pop city (puno)

### Will Patch 1A actually fix the cited issues?

**Honest assessment**:

| Query | Before patch | After patch (with backfill) | Fixed? |
|---|---|---|:---:|
| `pun` (en) | puno:107 > pune:105 | puno: 80 + 27 + 2.57 = 109.57; pune: 80 + 24.6 + 3.25 = 107.85 | **NO** (still puno leads) |
| `mum` (en) | muli:121 > mumbai:109 | muli: 100 + 21 + 2.06 = 123.06; mumbai: 80 + 28.5 + 3.55 = 112.05 | **NO** (still muli leads — different match tier) |
| `Mu` (2-letter) | muscat:110, munich:109, mumbai:109 | mumbai gets +3.55, muscat ~150k pop +2.6, munich 1.5M +3.1 → mumbai 112.55, muscat 110.5, munich 110.0 — mumbai jumps to #1 | **YES** |

The `* 0.5` multiplier (as user spec) is too small to fix puno→pune or muli→mumbai in their current forms. **It DOES fix simpler same-tier ties** like `Mu` query → mumbai 1st.

To fix puno→pune cleanly, the multiplier would need to be ~`* 1.0` (mumbai +7.1 vs muli +4.1 = differential 3, still short of 12.5 tier gap). To fix muli→mumbai cleanly, the multiplier would need to be `* 10` (impractical — would dominate every other signal) OR remove the IATA alias (data fix).

**Recommendation update**: Patch 1A as user-specified (`* 0.5`) does the right thing structurally (adds population as a tiebreaker without disrupting tier hierarchy) but won't fix the most embarrassing examples. The user's cited examples need additional work:
- `mum→muli`: requires IATA alias cleanup (separate wave)
- `pun→puno`: requires multiplier bump to `* 1.0` OR priority rebalance OR both

I propose **landing Path A as user-specified** (`* 0.5` multiplier) **with full transparency that it improves SOME tied-tier cases but doesn't single-handedly fix puno/muli**. Future patches (1B, 1C, ...) can address the remaining cases.

---

## 6. Test cases — before/after expectations

### Positive fixes (must verify with patch)

| # | Query | Before | After patch (expected) | Status |
|---|---|---|---|:---:|
| 1 | `Mu` | muscat 110, munich 109, mumbai 109 | **mumbai 1st** (after pop boost) | EXPECTED ✓ |
| 2 | `Mum` | muli 121, mumbai 109 | muli still ≥ mumbai — UNCHANGED | EXPECTED no-fix |
| 3 | `Pun` | puno 107, pune 105 | puno still slightly > pune (~109 vs 107) — small improvement but not flip | EXPECTED partial |
| 4 | `Del` | new-delhi 1st | new-delhi still 1st (pop 24M for Delhi metro) | EXPECTED ✓ no regression |
| 5 | `Hyd` | hyderabad-in 1st (126) | hyderabad-in still 1st (pop ~9M boost +3.5 vs pk-hyd pop ~1.7M boost +3.1 = differential +0.4) | EXPECTED ✓ |
| 6 | `Ban` | (test top-3) | smallest expected impact since "ban" is a short noisy query | EXPECTED no regression |
| 7 | `Kol` | kolkata 1st | kolkata still 1st (4.6M boost +3.3) | EXPECTED ✓ |
| 8 | `Lah` | lahore 1st | lahore still 1st (11.1M boost +3.55) | EXPECTED ✓ |
| 9 | `Kar` | karachi 1st | karachi still 1st (11.6M boost +3.55) | EXPECTED ✓ |

### Regression checks (MUST stay green)

All 56 happy-path queries from SEARCH-RANKING-IMPROVEMENT-1-PLAN must still pass (55/56 baseline):

| Family | Count | Expected after patch |
|---|---:|---|
| IN-canonical | 18 | 18/18 unchanged ✓ |
| IN-rename (Bombay/Calcutta/Madras/Bangalore/Allahabad) | 5 | 5/5 unchanged ✓ |
| IN-alias (Banaras/Kashi/Vizag/Kovai/Chhatrapati Sambhajinagar) | 5 | 5/5 unchanged ✓ |
| IN-ur (دہلی etc.) | 6 | 6/6 unchanged ✓ |
| IN-bn (কলকাতা etc.) | 5 | 5/5 unchanged ✓ |
| IN-hi data-only | 3 | 3/3 unchanged ✓ |
| BD (Dhaka/Chittagong/Chattogram/Barisal etc.) | 7 | 7/7 unchanged ✓ |
| **Barishal** | 1 | Still external (data gap — separate fix) ✗ |
| PK (Karachi etc.) | 6 | 6/6 unchanged ✓ |

**The 1 known failure (Barishal) stays as data-gap, not ranking issue.**

### Existing test suites that MUST keep passing

| Suite | Count | Expected |
|---|---:|---|
| `_test_search_place_endpoint.mjs` | 659 | 659/659 ✓ |
| `_test_place_by_slug.mjs` | 44 | 44/44 ✓ |
| `_test_city_page_l10n.mjs` | 152 | 152/152 ✓ |
| `_test_search_ar.mjs` | 22 | 22/22 ✓ |
| `_test_place_names_hi_in_1.mjs` | 116 | 116/116 ✓ |
| `_test_place_names_ur_in_1.mjs` | 122 | 122/122 ✓ |
| `_test_place_names_bn_in_1.mjs` | 113 | 113/113 ✓ |
| `_test_place_names_ur_pk_6.mjs` | 69 | 69/69 ✓ |
| `_test_fill_lang_map.mjs` | 11 | 11/11 ✓ |
| `_test_home_search_migration.mjs` | 33 | 33/33 ✓ |

If any existing test asserts a SPECIFIC confidence number, that might need adjustment (`confidence` values will rise by 0-3.55 across all matched entries). But the relative ORDER for happy-path queries should be unchanged.

---

## 7. Risks

| # | Risk | Severity | Mitigation |
|---|---|:---:|---|
| 1 | A.1 backfill mutates 2,528 curated entries — wider blast radius than typical "micro-patch" | High | Pre-mutation full backup `.preBackfillPopulation.bak`; idempotent (safe to re-run); the population field is purely additive, no existing field changed |
| 2 | Some raw files may be missing (gitignored large countries like IN/PK/BD which have 277MB/132MB/25MB raw on disk but excluded from git) | Medium | Backfill script gracefully skips countries without raw file; leaves population absent for those entries (no boost, no regression) |
| 3 | Coordinate-proximity match could pick a different geonameid than intended (e.g., 2 entries within 2km) | Low | Use sourceId-based exact match first; coordinate fallback only when sourceId is missing or doesn't match |
| 4 | sourceId field may not exist on all curated entries | Medium | Verified: most entries have it (`sourceId: "geonames:1337617"` pattern). Entries without → coord fallback. Entries without either → unmatched (no boost, no regression) |
| 5 | Tests asserting absolute confidence values may break | Medium | Inspect existing tests — most assert top-result slug, not the confidence number itself. Plan to fix any that break |
| 6 | The patch doesn't fully fix puno/muli (per §5 analysis) | Low | Documented honestly; future micro-waves can address |
| 7 | Adding `population` field to curated changes the JSON file size (~10-50 KB) and may show as a "lot of changes" in git diff | Low | Cosmetic — git diff will show population addition per entry but no other field changed |
| 8 | If `population` is later removed from a curated entry, the score will silently drop | Very Low | The boost is small (+3.55 max), so silent drop won't cause major reordering |

---

## 8. Rollback plan

If post-APPLY regressions appear:

1. **Revert backup**: `cp db/places/curated-places.json.preBackfillPopulation.bak db/places/curated-places.json`
2. **Revert server.js**: `git checkout <apply-commit>^ -- server.js`
3. **Delete script**: `rm scripts/_backfill_curated_population_1.mjs`

Or: `git revert <apply-commit>` if changes are committed together.

Since the only behavioral change is `+ popBoost` (max +3.55 to confidence score), and the field addition is purely additive to curated, rollback is straightforward.

---

## 9. Files this plan phase changed

### CREATED

| File | Purpose |
|---|---|
| `reports/search-ranking-improvement-1a-plan.md` | This plan report |

### NOT modified

- ❌ `server.js` — 0 byte diff (verified)
- ❌ `js/app.js` — 0 byte diff (verified)
- ❌ `index.html` — unchanged
- ❌ `db/places/curated-places.json` — 0 byte diff (verified)
- ❌ `db/places/candidates/*` — unchanged
- ❌ All shared scripts — unchanged
- ❌ All existing test scripts — unchanged
- ❌ No new audit script needed (analysis was via existing `scripts/search/_search_ranking_improvement_1_audit.mjs`)

### Operations explicitly NOT run

- ❌ No code change to `_searchCuratedPlaces`
- ❌ No backfill script created or run
- ❌ No data mutation
- ❌ No new routes / Held-Queue phases started
- ❌ No runtime translation, no fillchain

---

## 10. Recommendation

### Honest summary

The originally proposed Patch 1 (`+ log10(pop + 1) * 0.5`) has good intentions but, on close inspection:

1. **Doesn't fix muli→mumbai** (different match tiers — would need IATA alias removal)
2. **Doesn't fully fix puno→pune** (multiplier too small — would need `* 1.0+`)
3. **Requires population backfill** as a data prerequisite (touches 2,528 entries)
4. **DOES fix simpler same-tier ties** like `Mu` → mumbai 1st

### Three sub-recommendations

**Option B.A — Path A combined (backfill + scoring)**:
- Land both A.1 (data backfill) + A.2 (1-line server.js boost) in one wave
- Achieves real same-tier tiebreaking
- Larger scope: touches 2,528 curated entries
- **Most honest path to fix the cited issues partially**

**Option B.B — Path B scoring-only no-op now**:
- Add the 1-line boost to server.js with no data backfill
- Behavior unchanged (boost is 0 when population absent)
- Smallest blast radius, but **fixes nothing visible**
- Useful as a "prep" change before a separate POP-BACKFILL-1 wave

**Option B.C — Hold and pursue better alternatives**:
- IATA alias cleanup wave (fixes muli→mumbai)
- Priority rebalance for known-mismatched entries (fixes puno→pune via data)
- These are smaller individual data fixes that might be more effective than the scoring change

### My recommendation: **Pursue Option B.C (hold scoring change, do targeted data fixes)**

Reasoning:
- The cited adversarial cases (muli, puno) are **predominantly data-quality issues**, not algorithm issues
- A focused IATA-alias cleanup is smaller scope than 2,528-entry population backfill
- Priority-rebalance for ~10 known mismatches is even smaller (touches ~10 entries)
- The 98.2% happy-path pass rate is already excellent — adversarial cases affect <5% of real queries

If user prefers to proceed with the algorithm change anyway: **Option B.A (Path A combined)** is the path that actually changes behavior.

If user wants the smallest possible patch with no behavior change: **Option B.B (Path B no-op scoring)**.

---

## 11. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/search-ranking-improvement-1a-plan.md` | ✓ |
| 2 | Patch scope documented and limited to population tiebreaker only | ✓ (§5) |
| 3 | `_searchCuratedPlaces` location identified | ✓ (`server.js` line 273-275) |
| 4 | Concrete patch proposal (pseudo-code) | ✓ (§5) |
| 5 | Pre/post test cases documented | ✓ (§6) |
| 6 | Risks documented | ✓ (§7) |
| 7 | Rollback plan documented | ✓ (§8) |
| 8 | No `server.js` mutation | ✓ |
| 9 | No `js/app.js` mutation | ✓ |
| 10 | No `curated-places.json` mutation | ✓ |
| 11 | No mutations to names / aliases / slugs | ✓ |
| 12 | No add/delete cities | ✓ |
| 13 | No Held-Queue phase started | ✓ |
| 14 | NO primary-vs-alias bucket scoring proposed | ✓ |
| 15 | NO current-lang preference proposed | ✓ |
| 16 | NO country-language affinity proposed | ✓ |
| 17 | NO featureCode boost proposed | ✓ |
| 18 | NO same-script bonus proposed | ✓ |
| 19 | NO priority weight reduction proposed | ✓ |
| 20 | NO substring rework proposed | ✓ |

---

## Held queue (per user direction — DO NOT auto-start)

- ❌ **SEARCH-RANKING-IMPROVEMENT-1A APPLY** (awaits user direction on Option B.A / B.B / B.C)
- ❌ Future SEARCH-RANKING-IMPROVEMENT-1B/1C/etc. (other Patch 2-3 changes from main plan §5)
- ❌ SEARCH-RANKING-IATA-ALIAS-CLEANUP-1 (mentioned in §4 — separate wave)
- ❌ POP-BACKFILL-1 (standalone alternative to Path A — pure data wave)
- ⏸️ PAUSED: PLACE-NAMES-TA-IN-1, MR-IN-1, HI-IN-LOCALE-ROUTING-1
- ❌ ASIA-1D-IN-B
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ Barishal alias enrichment for `barisal`

---

## Status: 📋 PLAN COMPLETE — AWAITING USER DECISION

### Summary

| Metric | Value |
|---|---|
| Report path | `reports/search-ranking-improvement-1a-plan.md` |
| Patch scope | Single line addition to `_searchCuratedPlaces` in `server.js`: `+ Math.log10(pop + 1) * 0.5` |
| Critical pre-condition discovered | **`population` field NOT in any curated entry** (0/2528) — patch is no-op without data backfill |
| Three execution paths | B.A combined backfill+boost / B.B scoring-only no-op / B.C hold and fix data instead |
| **My recommendation** | **Option B.C — hold scoring change; pursue smaller targeted data fixes (IATA cleanup, priority rebalance) which actually fix the cited issues** |
| Honest fix coverage | Path A `* 0.5` fixes `Mu→mumbai` but NOT `mum→muli` (tier gap) nor `pun→pune` (multiplier too small) |
| `server.js` mutations | **0 bytes changed** |
| `curated-places.json` mutations | **0 bytes changed** |
| Held Queue phases started | **0** |
| Runtime translation / fillchain | **NONE** |

**Next step**: user reviews plan and decides B.A / B.B / B.C / no-action. No further work until user direction.
