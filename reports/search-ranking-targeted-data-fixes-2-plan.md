# SEARCH-RANKING-TARGETED-DATA-FIXES-2-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no code change, no curated mutation
**Date**: 2026-05-20
**Phase**: Plan-only investigation of 2 deferred issues from TARGETED-DATA-FIXES-1
**Prerequisite**: SEARCH-RANKING-TARGETED-DATA-FIXES-1 user-approved 2026-05-20 (`aa36a5e`)
**Scope**: STRICTLY limited to the 2 named issues — no broader alias cleanup

---

## 1. The 2 deferred issues

Both issues surfaced during TARGETED-DATA-FIXES-1 verification. Same anti-pattern as muli `"MUM"` — short alias produces alias-tier-100 exact-match outranking the bigger city's prefix-tier-80 match.

| # | Query | Current top result | Expected | Cause hypothesis |
|---|---|---|---|---|
| 1 | `ben` (en) | bern:ch (Switzerland) | bengaluru:in | bern has `aliases.en` containing `"Ben"` |
| 2 | `sur` (en) | tyre-lb:lb (Lebanon) | surat:in | tyre-lb has `aliases.en=["Sur"]` |

---

## 2. Case-by-case investigation

### 2.1. Case 1 — `ben → bern`

**Data inspection** (`bern` entry):

```json
{
  "slug": "bern",
  "names": { "en": "Bern", "ar": "برن", "fr/de/tr/ur/id/es/bn/ms": "Bern" },
  "aliases": {
    "en": [
      "BRN", "Bann", "Beirn", "Ben", "Bern osh", "Berna", "Bernas",
      "Berne", "Berno", "Bundesstadt", "Bèn", "Bèrna", "atharvaveda",
      "ban he na", "barana", "barna", "beirn", "beleun", "berna",
      "berni", "berun", "bo en", "bo er ni", "brn", "byrn", "pern"
    ],
    "ar": ["بيرن", "بێرن", "بېرن"]
  },
  "priority": 90
}
```

**Score math for query `ben`**:
- `bern` matches via alias `"Ben"` (lowercased "ben" → exact match) → tier 100 + priority 90 * 0.3 = **120**
- `bengaluru` matches via prefix on names.en="Bengaluru" → tier 80 + priority 95 * 0.3 = **108.5**
- bern wins by 11.5.

**Diagnosis**: confirmed — `aliases.en=["Ben"]` produces the exact-match. Removing it would drop bern's score for query "ben" from tier 100 → some lower tier or 0, allowing bengaluru to win.

**What other noise is in bern's aliases.en?** (NOT in this plan's scope, but flagged):
- `"BRN"` — IATA code (same anti-pattern as MUM)
- `"atharvaveda"` — completely unrelated (Sanskrit text — likely a GeoNames error)
- `"Bern osh"` — meaningless string
- `"Bundesstadt"` — German common noun "federal city" (NOT a place name)
- `"ban he na"`, `"bo en"`, `"bo er ni"` — Chinese pinyin transliterations (low value)

These are NOT proposed for removal here — this plan is strictly scoped to "Ben" only per user spec. A future broader alias-hygiene wave could address them.

**Safety of removing `aliases.en=["Ben"]`**:
- Will any legitimate user search for Bern as just "Ben"? Highly unlikely — "Ben" is a common first name, not a known nickname for Bern.
- Removing it preserves Bern's primary name (`names.en="Bern"`) — users typing `Bern` still find it (tier 100 exact via primary).
- All other 25 aliases.en remain intact.

**Risk**: Very Low.

### 2.2. Case 2 — `sur → tyre-lb`

**Data inspection** (`tyre-lb` entry):

```json
{
  "slug": "tyre-lb",
  "names": {
    "ar": "صور",          // Arabic primary
    "en": "Tyre",         // English primary
    "fr": "Tyr",
    "de": "Tyros",
    "tr": "Sur",          // ⚠️ TURKISH PRIMARY = "Sur"
    "ur": "صور",
    "id": "Tyre",
    "es": "Tiro",
    "bn": "টায়ার",
    "ms": "Tyre"
  },
  "aliases": {
    "ar": ["صور"],
    "en": ["Sur"]         // English alias = "Sur"
  },
  "priority": 78
}
```

**Score math for query `sur`**:

The current search algorithm (`server.js _searchCuratedPlaces`) searches ALL `p.names.<every-lang>` + ALL `p.aliases.<every-lang>`. For query "sur":
- tyre-lb via `names.tr="Sur"` → **exact-match** (lowercase) tier 100 + priority 78 * 0.3 = **123.4**
- tyre-lb via `aliases.en=["Sur"]` → also exact-match tier 100 + priority 78 * 0.3 = **123.4** (same score)
- surat via `names.en="Surat"` → prefix-match tier 80 + priority 90 * 0.3 = **107**

**Diagnosis**: tyre-lb wins because of EXACT match. But the exact match comes from **TWO different sources** in tyre-lb's data:

| Source | Type | Removable? |
|---|---|:---:|
| `names.tr = "Sur"` (Turkish primary name) | Legitimate — Turkish Wikipedia article for Tyre is titled "Sur, Lübnan"; "Sur" IS the canonical Turkish name | ❌ **NO — would be removing a primary name in a supported language; data accuracy regression** |
| `aliases.en = ["Sur"]` (English alias) | English transliteration of Arabic name; secondary | ⚠️ Maybe, but...|

**🚨 Critical finding**: Even if we remove `aliases.en=["Sur"]`, **tyre-lb would STILL exact-match query "sur"** because `names.tr="Sur"` is in the candidate pool. The algorithm matches against every lang's name field, not just the current query lang. Removing the alias alone provides ZERO functional improvement for query "sur".

**What would actually fix sur→tyre-lb (out of scope for this plan)**:
1. **Algorithm-level fix**: implement same-script bonus or current-lang preference (per SEARCH-RANKING-IMPROVEMENT-1-PLAN §5) so a Latin-script "sur" query is biased toward English/Latin primary-name cities like surat
2. **Change names.tr** value (would be wrong — Sur is the correct Turkish name)
3. **Remove names.tr** entirely (would create a data hole for Turkish-language search)

None of these are within "small targeted data fix" scope.

**Recommendation for sur/tyre-lb**: **HOLD — no safe data-only fix exists.** Removing aliases.en="Sur" alone is INEFFECTIVE (because names.tr="Sur" provides the same tier-100 match). Algorithm-level fix is the only viable path, which is explicitly outside Option B.C scope.

---

## 3. Proposed fixes — final scope

### One single fix proposed

| # | Type | Slug | Field | Current | Proposed | Reason |
|---|---|---|---|---|---|---|
| 1 | remove_alias | ch/bern | aliases.en | `[..., "Ben", ...]` (26 entries) | drop `"Ben"` (25 remain) | Causes `ben→bern` ranking failure; "Ben" is not a legitimate way to search for Bern |

### One issue NOT FIXABLE via this track

| # | Issue | Why HOLD |
|---|---|---|
| 2 | `sur → tyre-lb` | Removing `aliases.en=["Sur"]` alone won't fix it because `names.tr="Sur"` (legitimate Turkish name) ALSO produces tier-100 exact-match. Only algorithm-level fix would help. **HOLD — no safe data-only fix.** |

---

## 4. Test cases — before/after expectations

### Case 1 fix (remove bern "Ben")

| # | Query | Lang | Before | Expected after |
|---|---|---|---|---|
| 1 | `ben` | en | bern:ch:120 | **bengaluru:in:108.5** (1st) — fixed ✓ |
| 2 | `Ben` | en | (same as `ben`) | bengaluru (normalized) ✓ |
| 3 | `Bern` | en | bern:ch (exact match via names.en) | bern unchanged ✓ no regression |
| 4 | `Berne` | en | bern (via alias "Berne") | bern unchanged ✓ |
| 5 | `BRN` | en | bern (via alias "BRN" — IATA, NOT in this plan's removal) | bern unchanged ✓ (BRN noise stays as known issue) |
| 6 | `Bengaluru` | en | bengaluru exact 1st | unchanged ✓ |
| 7 | `Bangalore` | en | bengaluru via aliases.en | unchanged ✓ |

### Case 2 NOT-fixed (status quo)

| # | Query | Lang | Status | Note |
|---|---|---|---|---|
| 8 | `sur` | en | tyre-lb still 1st | UNCHANGED — names.tr="Sur" still triggers exact-match |
| 9 | `Surat` | en | surat exact 1st | unchanged ✓ |
| 10 | `Tyre` | en | tyre-lb exact via names.en | unchanged ✓ |
| 11 | `صور` | ar | tyre-lb via names.ar/aliases.ar | unchanged ✓ |
| 12 | `Sur` (lang=tr) | tr | tyre-lb via names.tr | unchanged ✓ (Turkish users find Tyre via correct name) |

### Regression checks

| Query | Expected (must hold) |
|---|---|
| All 14 fixed queries from TARGETED-DATA-FIXES-1 | unchanged ✓ |
| All Arabic/Urdu/Bengali queries | unchanged ✓ |
| `Bombay/Calcutta/Madras/Bangalore/Allahabad/Banaras/etc.` | unchanged ✓ |
| Existing test suites (944 from prior wave) | 944/944 ✓ |

---

## 5. Risk assessment

| # | Risk | Severity | Mitigation |
|---|---|:---:|---|
| 1 | A legitimate user actually searches Bern as "Ben" (nickname) | Very Low | "Ben" is not a documented nickname for Bern; the alias appears to be a GeoNames-import-noise rather than user-curated |
| 2 | Removing one alias from bern triggers test regression (some test asserts bern result for "ben" query) | Very Low | Verified — no existing test asserts this |
| 3 | The other 25 aliases on bern (including the noise like "atharvaveda", "Bern osh", "Bundesstadt", "ban he na") are NOT touched | Documented | This plan strictly scopes to "Ben" per user spec; broader cleanup could be a future wave |
| 4 | sur/tyre-lb remains failing | Documented | Explicitly HELD with clear root-cause analysis (names.tr="Sur" cannot be safely removed; algorithm change is out of scope) |

---

## 6. Rollback plan

If post-APPLY regressions appear:

1. **Restore from backup**: `cp db/places/curated-places.json.preTargetedDataFixes2.bak db/places/curated-places.json`
2. **Single alias addition**: re-add `"Ben"` back to `bern.aliases.en` (trivial)
3. **Git-level revert**: `git revert <apply-commit>`

Since only 1 field is changed (1 string removed from 1 array), rollback is one-line trivial.

---

## 7. Files this plan phase changed

### CREATED

| File | Purpose |
|---|---|
| `reports/search-ranking-targeted-data-fixes-2-plan.md` | This plan report |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff (verified)
- ❌ `db/places/candidates/*` — unchanged
- ❌ `server.js` — 0 byte diff
- ❌ `js/app.js` — 0 byte diff
- ❌ `index.html` — unchanged
- ❌ All shared scripts — unchanged
- ❌ All existing test scripts — unchanged
- ❌ MEMORY.md — not updated (deferred to post-user-approval if APPLY landed)

### Operations explicitly NOT run

- ❌ No alias removed
- ❌ No alias added
- ❌ No priority adjusted
- ❌ No code change
- ❌ No Stage 4 invocation
- ❌ No new routes / Held-Queue phases started

---

## 8. Recommendation

### Honest summary

| Issue | Recommendation | Why |
|---|---|---|
| **ben → bern** | **APPLY** — remove `aliases.en=["Ben"]` from bern | Clean, safe, well-targeted. 1-line data fix. "Ben" is GeoNames-import noise, not a legitimate Bern nickname. Resolves ben→bengaluru as expected. |
| **sur → tyre-lb** | **HOLD** — no safe data-only fix exists | Removing `aliases.en=["Sur"]` won't help because `names.tr="Sur"` (legitimate Turkish primary name) ALSO triggers exact-match. Modifying names.tr would be a data accuracy regression. The fix requires algorithm-level changes (same-script bonus or current-lang preference) which are explicitly outside the data-fixes track per Option B.C decision. |

### Final scope

**1 fix proposed** (vs 2 deferred issues originally listed):
- A1: remove `aliases.en="Ben"` from `ch/bern`

### Recommended path: **APPLY the 1 fix; document sur/tyre-lb as systemic limitation**

Justification:
- Single, surgical edit (1 field in 1 entry)
- Resolves 1 of the 2 deferred issues cleanly
- Honest about the unresolvable nature of the other (no data-only fix possible)
- Documents the unresolved sur/tyre-lb case for future algorithm-track consideration if user wants to revisit Option B.A/B.B path

If user prefers HOLD on both: also acceptable — neither failure is critical (98.2% original pass rate; both involve obscure-vs-major-city collisions on short prefix queries).

---

## 9. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | Report at `reports/search-ranking-targeted-data-fixes-2-plan.md` | ✓ |
| 2 | Scope limited to ben/sur only — no broader alias cleanup | ✓ |
| 3 | Investigation documented (bern entry inspected, tyre-lb entry inspected) | ✓ |
| 4 | Root-cause analysis per issue | ✓ |
| 5 | Recommendation clear: 1 APPLY + 1 HOLD | ✓ |
| 6 | Test cases pre/post documented | ✓ |
| 7 | Risk assessment included | ✓ |
| 8 | Rollback plan included | ✓ |
| 9 | No `curated-places.json` mutation | ✓ (0 lines diff) |
| 10 | No `server.js` / `js/app.js` mutation | ✓ (0 lines diff) |
| 11 | No code change proposed | ✓ |
| 12 | No add/delete cities | ✓ |
| 13 | No runtime translation, no fillchain | ✓ |
| 14 | No Held-Queue phase started | ✓ |

---

## 10. Held queue (per user direction — DO NOT auto-start)

- ❌ **SEARCH-RANKING-TARGETED-DATA-FIXES-2 APPLY** (awaits user direction on the 1 proposed fix)
- ❌ Broader bern alias cleanup (BRN/atharvaveda/Bern osh/Bundesstadt/Chinese pinyin/etc.) — out of scope here
- ❌ sur/tyre-lb algorithm-level fix — needs ranking-algorithm wave, explicitly off-track
- ⏸️ PAUSED: PLACE-NAMES-TA-IN-1, MR-IN-1, HI-IN-LOCALE-ROUTING-1
- ❌ ASIA-1D-IN-B
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF / ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1

---

## Status: 📋 PLAN COMPLETE — AWAITING USER DECISION

### Summary

| Metric | Value |
|---|---|
| Report path | `reports/search-ranking-targeted-data-fixes-2-plan.md` |
| Issues investigated | 2 (ben→bern, sur→tyre-lb) |
| Issues fixable via data-only | **1** (ben→bern via alias removal) |
| Issues NOT fixable via data-only | **1** (sur→tyre-lb — blocked by legitimate `names.tr="Sur"`) |
| Proposed fixes | **1** (remove `aliases.en="Ben"` from ch/bern) |
| `curated-places.json` mutations | **0 bytes changed** |
| `server.js` / `js/app.js` mutations | **0 bytes changed** |
| Held Queue phases started | **0** |
| Runtime translation / fillchain | **NONE** |
| **Recommendation** | **APPLY the 1 fix; document sur/tyre-lb as systemic limitation** |

**Alternatives**: HOLD both fixes (also acceptable — neither is critical).

**Next step**: user reviews and decides APPLY / HOLD / modifications. No further work until user direction.
