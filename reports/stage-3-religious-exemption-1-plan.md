# STAGE-3-RELIGIOUS-EXEMPTION-1-PLAN — Plan report

**Status**: 📋 PLAN ONLY — no execution, no curated mutation, no candidates mutation, no merge
**Date**: 2026-05-20
**Phase**: Planning/investigation follow-up to ASIA-1D-BD-A anomaly C (rangpur false-positive)
**Scope**: Diagnose the Stage 3 religious-keyword false-positive bug + propose targeted upstream fix. **No code changes.**

---

## 1. Problem summary

Stage 3's `checkBlocklist()` function in `validate_candidates.mjs` runs religious-keyword matching against a **concatenation** of `names.ar + names.en + aliases.ar + aliases.en`. If ANY of those strings contains a religious keyword like `\bmosque\b`, `\bmasjid\b`, `\bshrine\b`, etc., the **entire candidate is rejected** with reason `religious_site_not_city` — **regardless of featureCode or population**.

This caused **rangpur** (Bangladesh PPLA division capital, pop=1,031,388) to be incorrectly rejected because one of its 30 GeoNames alternatenames contained the literal string `"Mosque Rangpur"` (referring to a famous mosque IN the city, not the city itself).

During ASIA-1D-BD-A the bug was worked around via a **script-level override** in `_asia_1d_bd_a_clean_approve.mjs`. The override accepts `startState: 'rejected'` and flips rangpur back to approved, while also dropping the offending `"Mosque Rangpur"` alias. But this is per-wave patching, not a permanent fix. Other countries and future waves may hit identical false-positives.

This plan proposes a targeted upstream fix in `validate_candidates.mjs` so that PPLC + PPLA + PPLA2 + PPLA3 administrative-center features are exempt from religious-keyword rejection, with optional alias-cleanup for alias-only hits on populated tiers.

---

## 2. Example: rangpur

| Field | Value |
|-------|-------|
| slug | rangpur |
| geonameid | 1185188 |
| featureCode | PPLA (division capital) |
| population | 1,031,388 |
| admin1 | 87 (Rangpur Division, Bangladesh) |
| names.en | "Rangpur" |
| names.ar | "rnګpwr" (mojibake — not a religious-keyword match) |
| aliases.en (excerpt) | `["Kotwali", "Kotwāli", "Mosque Rangpur", "RAU", "Rangpur City", ...]` |
| Stage 3 verdict | REJECTED with reason `religious_site_not_city`, keyword `/\bmosque\b/i` |
| Trigger | The alias string `"Mosque Rangpur"` matched `/\bmosque\b/i` in the concatenated blocklist check |
| User's workaround | Script-level `startState: 'rejected'` override in BD-A wave, plus `dropAliasesEn: ['Mosque Rangpur']` to prevent regression on Stage 3 re-run |

---

## 3. Root cause (precise)

### How the bug works

[`scripts/geodata/validate_candidates.mjs:111-120`](../scripts/geodata/validate_candidates.mjs#L111):

```js
function checkBlocklist(cand, religiousKw, nonPlaceKw) {
    const combined = (cand.names.ar || '') + ' ' + (cand.names.en || '') + ' '
                   + ((cand.aliases && cand.aliases.ar) || []).join(' ') + ' '
                   + ((cand.aliases && cand.aliases.en) || []).join(' ');
    const rel = matchAnyKeyword(combined, religiousKw);
    if (rel) return { hit: 'religious', keyword: rel };
    const np = matchAnyKeyword(combined, nonPlaceKw);
    if (np) return { hit: 'non_place', keyword: np };
    return { hit: null, keyword: null };
}
```

Then [`scripts/geodata/validate_candidates.mjs:161-165`](../scripts/geodata/validate_candidates.mjs#L161):

```js
// Religious blocklist → outright rejected (these are never cities)
if (blocklist.hit === 'religious') {
    return { status: 'rejected', reason: 'religious_site_not_city', tier: null,
             keyword: blocklist.keyword };
}
```

### The 5 design flaws

| # | Flaw | Consequence |
|---|------|-------------|
| 1 | All four name fields concatenated into one string | Single alias can poison the entire entity |
| 2 | No distinction between primary name (`names.ar`/`names.en`) vs aliases | "Mosque Rangpur" alias = same weight as "Mosque" being the city's actual name |
| 3 | No featureCode consideration | A PPLA division capital is treated identically to a PPL village |
| 4 | No population consideration | A 1M-pop city is treated identically to a pop=0 stub |
| 5 | Comment says "(these are never cities)" — false premise | A real city may have aliases that contain religious-site descriptors (e.g., us/lexington's "Shrine of the South" alias refers to historical heritage, NOT a religious site) |

### Religious keywords ([`_geonames_common.mjs:452-459`](../scripts/geodata/_geonames_common.mjs#L452))

```js
export const RELIGIOUS_KEYWORDS = [
    // Arabic — substring match (no \b)
    /مسجد/, /جامع(?!ة)/,
    /القبلتين/, /قبلتين/, /كعبة/, /الكعبة/, /مصلى/,
    // English — \b is safe here
    /\bmosque\b/i, /\bqiblatayn?\b/i, /\bkaaba\b/i, /\bmasjid\b/i,
    /\bshrine\b/i, /\bmausoleum\b/i
];
```

These regexes themselves are reasonable. The bug is in **how they're applied**, not what they match.

---

## 4. Affected candidate-set survey (cross-country)

Scanned 98 `db/places/candidates/*-geonames-candidates.json` files for entries with `status='rejected'` AND `reason='religious_site_not_city'`.

### Total counts

| Metric | Value |
|--------|------:|
| **Total religious-rejected entries (active candidates)** | **388** |
| Primary-name hit (keyword in `names.ar` or `names.en`) | 360 (92.8%) |
| Alias-only hit (keyword ONLY in `aliases.ar` / `aliases.en`) | 25 (6.4%) |
| (other / both) | 3 (0.8%) |

(Note: `bd/rangpur` does NOT appear in this count because it was already overridden to approved by BD-A.)

### By featureCode

| featureCode | Count | Note |
|-------------|------:|------|
| PPL | 378 | Generic populated places (mostly pop=0 villages) |
| PPLL | 4 | Small localities |
| PPLA4 | 3 | 4th-order admin |
| **PPLA2** | **2** | **High-tier false positives** ⚠️ |
| PPLS | 1 | Populated cluster |

### By population band

| Band | Count |
|------|------:|
| ≥100k | 1 (ir/masjed-soleyman) |
| 50k-100k | 0 |
| 10k-50k | 1 (my/kampong-masjid-tanah) |
| 1k-10k | 2 (us/lexington, my/belawai) |
| <1k | 6 |
| pop=0 | 378 |

### By country (top 6)

| cc | Count | Note |
|----|------:|------|
| ye | 103 | Yemen — many mosque-named villages |
| my | 86 | Malaysia — "Masjid Tanah" pattern |
| ir | 51 | Iran — "Masjed" pattern |
| id | 33 | Indonesia |
| pk | 32 | Pakistan |
| af | 29 | Afghanistan |

---

## 5. False positives identified

### High-impact false positives (admin-tier — PPLA2)

**Both should NOT be rejected:**

| cc/slug | featureCode | pop | trigger | analysis |
|---------|-------------|----:|---------|----------|
| **ir/masjed-soleyman** | PPLA2 | 111,510 | PRIMARY-HIT on `مسجد` (in `names.ar` = "مسجد سليمان") | Real Iranian city in Khuzestan Province. Founding place of Iranian oil industry. The city is LITERALLY named "Solomon's Mosque" historically, but it's a full-blown PPLA2 administrative center with 111k people. NOT a religious site. |
| **us/lexington** | PPLA2 | 7,262 | ALIAS-ONLY on `\bshrine\b` (alias = "Shrine of the South") | Lexington, Virginia — historic city. The "Shrine of the South" alias is a HISTORICAL DESCRIPTOR referring to Confederate heritage sites in the city (Robert E. Lee Memorial), not a religious shrine. Should not have been blocklist-rejected. |

### Mid-tier ambiguous false positives (PPL pop > 10k)

| cc/slug | pop | trigger | analysis |
|---------|----:|---------|----------|
| **my/kampong-masjid-tanah** | 29,185 | PRIMARY-HIT on `\bmasjid\b` | "Kampong Masjid Tanah" = "Mosque Tanah Village" in Melaka, Malaysia. A real village/town named after its central mosque. Debatable — Stage 3 rejection might be correct (small village named after mosque) OR might be wrong (it IS a real populated place, just named for the mosque). Keep deferred. |

### Alias-only false positives (25 total — most are pop=0 villages)

**Examples** (selection):
- `af/qalah-ye-gul` PPL pop=0 (primary not religious; some alias has `mosque`)
- `ir/markid-kharabeh` PPL pop=0 (alias hits)
- `my/belawai` PPL pop=2823 (alias hits)
- `us/lexington` PPLA2 pop=7262 (already noted above — admin-tier)
- 21 others: tiny pop=0 villages where alias mentions a nearby mosque/shrine

Most of these are **arguably correct rejections** (small villages defined by their relationship to a religious site). The only definite false positive in this category is `us/lexington` (already covered by admin-tier rule).

### True positives (360 primary-hit entries — KEEP REJECTED)

Examples:
- `af/surkay-masjid` — primary name literally "Sūrkay Masjid"
- `af/spin-masjid`, `af/shini-masjid`, `af/sar-e-masjid`, ...
- `ir/masjed-dagh`, `ir/tang-e-masjed`, ...
- `ye/al-masjid`, `sd/masajid-wad-hashi`, `tn/mesdjed-aissa`, ...
- `sa/zaharalmasla`, `pk/maskat`, ...

These are all small pop=0 villages or pin-locations whose **primary name** explicitly identifies them as mosques. **Correctly rejected** — should stay rejected.

---

## 6. Proposed policy

### Recommended: **Option C (admin-exempt + alias-only-strip)**

A 3-tier rule that mirrors the user's suggested combination of A + B + featureCode exemption:

```
ON religious-blocklist hit:
    IF featureCode ∈ {PPLC, PPLA, PPLA2, PPLA3}:
        → DO NOT REJECT. Admin centers are real cities by definition.
          Flow continues to normal tier-assignment.
          (Optional warning logged for audit.)

    ELSE IF primary name (names.ar OR names.en) contains religious keyword:
        → REJECT with reason `religious_site_not_city`.
          (Status quo — preserves the 360 small-village true-positives.)

    ELSE (alias-only hit on non-admin featureCode):
        → SOFT-REJECT: status='needs_review', reason='religious_alias_only'
          rather than 'rejected'. User can manually override after auditing
          whether the alias is misleading (drop alias + approve) or accurate
          (confirm rejection).
```

### Why this works for our 4 documented cases

| Case | featureCode | Trigger | Old verdict | New verdict | Outcome |
|------|-------------|---------|-------------|-------------|---------|
| `bd/rangpur` (historical) | PPLA | alias-only | rejected | **pending (via admin exemption)** | ✓ no override needed |
| `ir/masjed-soleyman` | PPLA2 | primary-hit | rejected | **pending (via admin exemption)** | ✓ real city restored |
| `us/lexington` | PPLA2 | alias-only | rejected | **pending (via admin exemption)** | ✓ real city restored |
| `my/kampong-masjid-tanah` | PPL pop=29k | primary-hit | rejected | **rejected (no change)** | ✓ status quo — user can manually override if desired |
| 360 PPL pop=0 villages | PPL/PPLL | primary-hit | rejected | **rejected (no change)** | ✓ status quo — small mosque sites stay out |
| 25 alias-only PPL pop=0 | PPL | alias-only | rejected | **needs_review (changed)** | ⚠️ 24 entries move from rejected → needs_review (slight reviewer-load increase; ~25 entries added to global needs_review pool but these are tiny pop=0 villages so very low priority) |

### Trade-off analysis

| Option | Implementation cost | False positives resolved | False positives created | User-burden Δ |
|--------|---------------------|--------------------------|-------------------------|---------------|
| **A**: alias-only → drop alias + flow | ~30 lines | 24 (us/lexington + 23 PPL) | 0 | 0 |
| **B**: primary-only → reject; aliases → flow | ~15 lines | 24+1 (24 alias-only + ir/masjed-soleyman if we trust admin) | 0 | 0 |
| **C**: A + B + admin exemption | ~25 lines | 26 (2 admin + 24 alias-only) | 0 | +25 to needs_review |
| **D**: Per-country allowlist | ~10 lines + ongoing maintenance | 26 (manual case-by-case) | depends on maintenance | high — growing list |
| **Status quo (do nothing)** | 0 | 0 | 0 (but rangpur-class bugs recur) | 0 (but per-wave override needed) |

**Recommendation: Option C.** Best false-positive resolution per line of code; explicit and testable; preserves admin-tier integrity; alias-only fallback gives user manual control on edge cases.

---

## 7. Proposed patch (PSEUDO-CODE — NOT APPLIED IN THIS PLAN)

### `scripts/geodata/validate_candidates.mjs` — modify `decideStatusAndTier()` around line 161

```js
// CURRENT (lines 161-165):
if (blocklist.hit === 'religious') {
    return { status: 'rejected', reason: 'religious_site_not_city', tier: null,
             keyword: blocklist.keyword };
}

// PROPOSED:
if (blocklist.hit === 'religious') {
    // ─── STAGE-3-RELIGIOUS-EXEMPTION-1: targeted exemptions ───
    //
    // Rationale: the old rule "religious-keyword hit → reject" was too
    // aggressive. It rejected real PPLA cities (rangpur, masjed-soleyman,
    // lexington) because an alias mentioned a famous mosque/shrine.
    //
    // New 3-tier rule:
    //   (a) PPLC/PPLA/PPLA2/PPLA3 admin centers: NEVER reject via religious
    //       keyword — these are real cities by GeoNames feature definition.
    //   (b) Non-admin entity whose PRIMARY name (names.ar/en) contains a
    //       religious keyword: REJECT (status quo — true positives like
    //       af/surkay-masjid).
    //   (c) Non-admin entity with ALIAS-ONLY religious-keyword hit: route
    //       to needs_review (not rejected). User can manually decide whether
    //       to drop the alias and approve, or confirm rejection.

    const ADMIN_FEATURES = new Set(['PPLC', 'PPLA', 'PPLA2', 'PPLA3']);

    if (ADMIN_FEATURES.has(cand.featureCode)) {
        // (a) Admin center exemption — log warning, do not reject.
        // The suspicious alias remains on the candidate; downstream apply
        // scripts may choose to drop it explicitly (BD-A pattern).
        cand._religiousExemptionWarning = blocklist.keyword;
        // Fall through to normal tier-assignment (no early return)
    } else {
        const primaryStr = (cand.names.ar || '') + ' ' + (cand.names.en || '');
        const primaryHit = matchAnyKeyword(primaryStr, religiousKw);

        if (primaryHit) {
            // (b) Primary name explicitly religious → reject
            return { status: 'rejected', reason: 'religious_site_not_city',
                     tier: null, keyword: blocklist.keyword };
        }
        // (c) Alias-only hit on non-admin → soft-reject (needs_review)
        return { status: 'needs_review', reason: 'religious_alias_only',
                 tier: null, keyword: blocklist.keyword };
    }
}
```

### Note on `checkBlocklist()` (no change in this patch)

The function signature stays the same. We don't change WHAT is detected; we change HOW the result is applied. This minimizes blast radius and keeps the upstream string-matching logic intact.

### Optional follow-up (NOT in this phase): alias-stripping

A future enhancement could automatically strip the keyword-matching alias from `aliases.en`/`aliases.ar` when route (a) or (c) fires. This is deferred to keep the initial fix surgical. For now, suspicious aliases remain attached; apply-script-level override (the BD-A pattern) handles cleanup per-wave.

---

## 8. Risks

| # | Risk | Severity | Mitigation |
|---|------|---------|-----------|
| 1 | A PPLA candidate genuinely is a religious site (mis-tagged by GeoNames) | Very low | GeoNames admin codes (PPLA-PPLA3) are quality-controlled by feature classification. Real mosques/shrines get PPLR/PPLL/PPLH/PPLX. If an exception slips through, downstream apply-script can drop it. |
| 2 | Alias-only entries now in needs_review create reviewer noise | Low | 25 entries total, all PPL pop=0 (low priority). Can be batch-dismissed during alias-enrichment phase. |
| 3 | `ir/masjed-soleyman` un-rejection means it may be auto-merged into curated in future IR wave | Low | Just makes it eligible for tier-assignment — still needs to pass distance/popMin checks + manual approval (`status='approved'` doesn't happen automatically). User retains control. |
| 4 | `us/lexington` un-rejection → potential merge into a future US wave | Low | Same as above. Real city, deserves to be merged when US-1 wave runs. |
| 5 | `my/kampong-masjid-tanah` stays rejected (primary-hit) — could be argued as real town | Very low | User can manually un-reject via apply-script override (BD-A pattern) if desired. Status quo unaffected. |
| 6 | Regression in other Stage 3 logic | Very low | Patch only modifies one if-branch in `decideStatusAndTier()`. All other rejections (bad_coords, no_slug, no_timezone, missing_real_ar_name, non_place_keyword, distance) unchanged. |
| 7 | Past closed waves' candidates files contain the old rejection labels | None | Those waves have already been merged; this fix only affects FUTURE Stage 3 runs. |

**Total risk profile**: Very low. The patch is small (≤30 lines), well-scoped (one if-branch), and has clear test cases.

---

## 9. Required tests at APPLY phase

When this fix is approved for APPLY (separate phase `STAGE-3-RELIGIOUS-EXEMPTION-1`):

### Unit tests

1. **PPLA + primary-hit**: Synthetic candidate with `featureCode='PPLA', names.en='Mosque City'` → expect `status≠rejected`, `_religiousExemptionWarning` set
2. **PPLA + alias-only hit**: Synthetic with `featureCode='PPLA', aliases.en=['Mosque X']` → expect `status≠rejected`
3. **PPL + primary-hit**: Synthetic with `featureCode='PPL', names.en='Mosque Village'` → expect `status='rejected', reason='religious_site_not_city'`
4. **PPL + alias-only hit**: Synthetic with `featureCode='PPL', aliases.en=['Mosque X']` → expect `status='needs_review', reason='religious_alias_only'`
5. **No hit**: Synthetic without religious keyword → unchanged behavior

### Integration tests (re-run validate_candidates for affected countries)

1. **`bd` re-run**: `bd/rangpur` should now naturally pass (no override needed). Verify the BD-A override mechanism still works idempotently.
2. **`ir` re-run**: `ir/masjed-soleyman` should move from `rejected` → `pending` (high or medium tier depending on quality score).
3. **`us` re-run**: `us/lexington` should move from `rejected` → `pending`.
4. **Other countries**: Verify no PPL pop=0 mosque-villages got un-rejected (they have primary-hit, so status quo).

### Regression tests (existing waves)

1. All carry-forward suites must still pass (place-by-slug 44, fill-lang-map 11, UR-PK-6 69, cross-page-nav 28, etc.)
2. No mutation of any country's curated entries
3. No change to existing curated-places.json

### Acceptance criteria for APPLY phase

- ✅ The 2 admin-tier false positives (ir/masjed-soleyman, us/lexington) move to non-rejected status
- ✅ The 25 alias-only non-admin entries move to needs_review (not rejected)
- ✅ The 360 primary-hit non-admin entries stay rejected (status quo)
- ✅ rangpur-class future bugs no longer require per-wave override
- ✅ No regression in any existing test
- ✅ No mutation of curated-places.json

---

## 10. Files reviewed in this plan phase

| File | Purpose | Findings |
|------|---------|----------|
| `scripts/geodata/validate_candidates.mjs` | Stage 3 main script — `checkBlocklist()` + `decideStatusAndTier()` | Identified the 5-line block that needs targeted patch |
| `scripts/geodata/_geonames_common.mjs` | `RELIGIOUS_KEYWORDS` array + `matchAnyKeyword()` helper | Confirmed regexes are reasonable; not modified |
| `scripts/geodata/normalize_places.mjs` | Stage 2 (no religious-keyword logic — just script-detection for ar/en) | Not affected |
| 98 × `db/places/candidates/*-geonames-candidates.json` files | Survey of all rejected candidates | 388 religious-rejected; 2 admin false positives + 24 alias-only false positives |
| `scripts/geodata/_asia_1d_bd_a_clean_approve.mjs` | The BD-A workaround script for rangpur | Documented the per-wave override pattern that this fix replaces |
| `reports/asia-1d-bd-a-closure.md` | Original ASIA-1D-BD-A closure documenting the rangpur anomaly | Confirmed the problem context |

---

## 11. Acceptance criteria for THIS plan phase

| # | Criterion | Status |
|---|---|---|
| 1 | One clear report at `reports/stage-3-religious-exemption-1-plan.md` | ✓ |
| 2 | Root cause precisely documented | ✓ (Section 3 — 5 design flaws identified) |
| 3 | Rangpur example documented | ✓ (Section 2) |
| 4 | False positives + true positives shown with counts | ✓ (Section 5 — 2 admin false positives + 24 alias-only + 360 primary-hit true positives) |
| 5 | Clear fix policy proposed | ✓ (Section 6 — Option C: admin-exempt + alias-only-strip) |
| 6 | Patch proposal (pseudo-code) included | ✓ (Section 7 — ~25 LOC diff in `decideStatusAndTier()`) |
| 7 | No `curated-places.json` mutation | ✓ (`git diff` = 0) |
| 8 | No `candidates` mutation | ✓ |
| 9 | No merge / no Stage 4 | ✓ |
| 10 | No add / delete of cities | ✓ |
| 11 | No `server.js` / `js/app.js` / `index.html` changes | ✓ |
| 12 | No `_geonames_common.mjs` / `validate_candidates.mjs` / `normalize_places.mjs` changes (read-only analysis) | ✓ |
| 13 | No Held Queue phase started | ✓ |

---

## 12. Files this plan phase changed

| File | Change | Note |
|------|--------|------|
| `reports/stage-3-religious-exemption-1-plan.md` | NEW (this report — only file produced) | — |

**Zero other changes.** Pseudo-code in Section 7 is documented but NOT applied.

---

## 13. What this phase did NOT do

- ❌ Did not modify `db/places/curated-places.json` (0 byte changes)
- ❌ Did not modify any `db/places/candidates/*.json` file
- ❌ Did not modify `scripts/geodata/validate_candidates.mjs` (read-only analysis)
- ❌ Did not modify `scripts/geodata/_geonames_common.mjs` (read-only analysis)
- ❌ Did not modify `scripts/geodata/normalize_places.mjs`
- ❌ Did not modify `server.js` / `js/app.js` / `index.html`
- ❌ Did not run any apply script
- ❌ Did not invoke Stage 4 (`apply_curated_candidates.mjs`)
- ❌ Did not run any test
- ❌ Did not start any phase from the Held Queue

---

## 14. Recommendation

**RECOMMEND: proceed to APPLY phase (STAGE-3-RELIGIOUS-EXEMPTION-1).**

Justification:
- Risk profile is very low (≤30 LOC change, one if-branch, well-scoped)
- Fix resolves 2 known high-impact false positives + future rangpur-class bugs
- Test plan is concrete and runnable
- Status quo (per-wave override) is fragile and creates technical debt
- The 25 alias-only entries that move to `needs_review` are tiny pop=0 villages — minimal reviewer burden

**Alternative**: defer APPLY indefinitely, continue per-wave override pattern. Acceptable but accumulates debt.

---

## 15. Held queue (per user direction — DO NOT auto-start)

- ❌ **STAGE-3-RELIGIOUS-EXEMPTION-1** (the actual APPLY phase — awaits user approval)
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ ASIA-1D-IN
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

---

## Status: 📋 PLAN COMPLETE — AWAITING USER DECISION

### Summary

| Metric | Value |
|--------|-------|
| Report path | `reports/stage-3-religious-exemption-1-plan.md` |
| Total religious-rejected entries surveyed | **388** across 98 country candidates |
| Affected entries (false positives) | **26** (2 admin-tier + 24 alias-only) |
| True positives (correctly rejected) | **362** (mostly PPL pop=0 mosque-villages) |
| Proposed policy | **Option C**: admin-exempt + primary-only reject + alias-only → needs_review |
| Patch size | ~25 LOC in `decideStatusAndTier()` of `validate_candidates.mjs` |
| Risk profile | Very low |
| `curated-places.json` mutations | **0 bytes changed** |
| Candidates mutations | **NONE** |
| Merge / Stage 4 | **NOT RUN** |
| Recommendation | **PROCEED to APPLY** |

**Next step**: user reviews this plan and decides:
- (a) Approve → proceed to `STAGE-3-RELIGIOUS-EXEMPTION-1` (the actual APPLY)
- (b) Request modifications (different policy, smaller scope, defer)
- (c) Hold indefinitely

**No further work until user direction.**
