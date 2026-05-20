# STAGE-3-RELIGIOUS-EXEMPTION-1 — Closure report

**Status**: 🟢 **CLOSED — user-approved 2026-05-20**
**Apply commit**: `7380772` (fix(geodata): STAGE-3-RELIGIOUS-EXEMPTION-1 — upstream fix for rangpur-class false-positive)
**Date**: 2026-05-20
**Phase**: Upstream Stage 3 fix for religious-keyword false-positives
**Plan ref**: [reports/stage-3-religious-exemption-1-plan.md](stage-3-religious-exemption-1-plan.md) (Option C — admin-exempt + alias-only → needs_review)

---

## Executive summary

STAGE-3-RELIGIOUS-EXEMPTION-1 successfully applied a targeted ~85-line patch to `scripts/geodata/validate_candidates.mjs` that resolves the rangpur-class religious-keyword false-positive bug at the source. The fix introduces a 3-tier policy:

1. **Admin centers** (PPLC/PPLA/PPLA2/PPLA3): never rejected via religious keyword (trust featureCode)
2. **Non-admin + primary-name religious hit**: reject (status quo, preserves 360 true positives)
3. **Non-admin + alias-only religious hit**: route to `needs_review` (not `rejected`)

The bug that caused `bd/rangpur` to be rejected during ASIA-1D-BD-A (worked around per-wave via script-level override) is now resolved upstream. Future similar cases (e.g., `ir/masjed-soleyman`, `us/lexington`) won't need per-wave overrides.

**No data files mutated.** Only `validate_candidates.mjs` modified. All tests pass.

---

## 1. Problem summary

The old code in `validate_candidates.mjs:111-120` concatenated `names.ar + names.en + aliases.ar + aliases.en` into a single string, then ran religious-keyword regex on it. Any hit caused outright rejection of the entire candidate — regardless of featureCode, population, or whether the keyword was in the primary name vs an alias.

**Impact**: 388 religious-rejected entries surveyed across 98 candidate files. 26 of these were demonstrably false positives:
- 2 admin-tier (PPLA2) cases where the city was real but had religious-keyword in primary name or alias
- 24 alias-only PPL cases where the village had a non-religious primary name but a religious-keyword in some descriptive alias

---

## 2. Apply commit

**Commit**: (to be created at the end of this closure preparation — see Section 13)

**Files modified**: `scripts/geodata/validate_candidates.mjs` (+72 / -13 lines)

**Files NOT modified**:
- ❌ `db/places/curated-places.json` — 0 byte changes
- ❌ Any `db/places/candidates/*.json` — 0 byte changes
- ❌ `scripts/geodata/_geonames_common.mjs` — unchanged
- ❌ `scripts/geodata/normalize_places.mjs` — unchanged
- ❌ `scripts/geodata/apply_curated_candidates.mjs` — unchanged
- ❌ `server.js`, `js/app.js`, `index.html` — unchanged
- ❌ All other country configs — unchanged
- ❌ All other test scripts — unchanged

**Files created**:
- `scripts/_test_stage_3_religious_exemption.mjs` (NEW — 32 unit tests covering all 6 required scenarios + Arabic-keyword + non_place baseline)
- `reports/stage-3-religious-exemption-1-closure.md` (this report)

---

## 3. Policy applied

### Decision matrix (implemented in `decideStatusAndTier`)

```
ON blocklist.hit === 'religious':
    IF featureCode ∈ {PPLC, PPLA, PPLA2, PPLA3}:
        → (a) ADMIN EXEMPT: do not reject
              annotate _religiousExemptionWarning
              FALL THROUGH to normal tier-assignment
    ELSE IF blocklist.in === 'primary':
        → (b) REJECT: status='rejected', reason='religious_site_not_city'
              (status quo — true positive)
    ELSE (blocklist.in === 'alias'):
        → (c) SOFT-REJECT: status='needs_review',
              reason='religious_alias_only'
              (user can manually un-reject after auditing)
```

### Code change: `checkBlocklist`

Enhanced from returning `{ hit, keyword }` to `{ hit, keyword, in }` where `in` distinguishes:
- `'primary'`: keyword matched `names.ar` or `names.en`
- `'alias'`: keyword matched only `aliases.ar` or `aliases.en`
- `null`: no hit

The internal logic separates `primaryStr` from `aliasStr` and tests primary first (so a primary hit always takes precedence in routing).

### Code change: `decideStatusAndTier`

Replaced the 5-line "religious blocklist → outright rejected" block with the 3-tier policy above. ~50 lines including detailed comment block explaining the rationale and plan reference.

Both `checkBlocklist` and `decideStatusAndTier` are now exported (`export function ...`) so the unit-test file can import them directly without running the full Stage 3 pipeline. This is the minimal refactor needed for testability.

### Code change: NONE for `non_place` path

The `non_place` keyword routing is unchanged — `checkBlocklist` still returns `hit: 'non_place'` based on combined string (just like before). `decideStatusAndTier` still routes non_place hits to `needs_review`. **Zero behavior change** for the 1000+ non_place rejections across all countries.

---

## 4. Before / after — 4 documented cases

| Case | featureCode | hit location | Before STAGE-3-RELIGIOUS-EXEMPTION-1 | After STAGE-3-RELIGIOUS-EXEMPTION-1 |
|------|-------------|--------------|----------------------------------------|---------------------------------------|
| **bd/rangpur** | PPLA | alias-only (`"Mosque Rangpur"`) | `rejected` (required per-wave override in BD-A `_asia_1d_bd_a_clean_approve.mjs`) | **`pending tier=high` reason=`always_include:PPLA`** with `_religiousExemptionWarning = "\bmosque\b (alias)"`. **No per-wave override needed.** |
| **ir/masjed-soleyman** | PPLA2 | primary-hit (`مسجد` in `names.ar`) | `rejected` (admin city falsely classified as religious site) | **`pending`** with admin exemption warning. Real Iranian city restored. |
| **us/lexington** | PPLA2 | alias-only (`"Shrine of the South"`) | `rejected` (descriptive historical alias caused city rejection) | **`pending`** with admin exemption warning. Real US city restored. |
| **my/kampong-masjid-tanah** | PPL pop=29k | primary-hit (`Masjid` in `names.en`) | `rejected` | **`rejected`** (no change — primary-name explicit religious hit on non-admin still rejected per Option C tier (b)) |

### Bonus: ~24 alias-only PPL pop=0 false positives

All ~24 PPL entries where a religious keyword appeared only in aliases (not primary name) now move from `rejected` → `needs_review` (reason: `religious_alias_only`). These were e.g.:
- `af/qalah-ye-gul` (mosque alias on a "Castle of Gul" village)
- `ir/markid-kharabeh` (mosque alias on an unrelated primary)
- 22 others, all pop=0 villages

This gives the user manual auditing capability without losing the entries entirely.

---

## 5. ✅ True positives still rejected

The 360 PPL/PPLL pop=0 entries whose **primary name** literally identifies them as religious sites (e.g., `af/surkay-masjid`, `ir/masjed-dagh`, `ye/al-masjid`, `tn/mesdjed-aissa`, `sd/masajid-wad-hashi`, etc.) all stay **rejected** with `reason='religious_site_not_city'`.

**Unit test confirmation** (Part B, B4 + Part D × 8 scenarios):
- PPL + primary mosque → rejected ✓
- PPLL + primary mosque → rejected ✓
- PPLF + primary mosque → rejected ✓
- PPLS + primary mosque → rejected ✓

**Status quo preserved for 92.8% of original religious-rejected entries.**

---

## 6. ✅ Alias-only non-admin → needs_review

**Unit test confirmation** (Part B, B5 + Part D × 4 scenarios):
- PPL + alias-only → `needs_review`, reason=`religious_alias_only` ✓
- PPLL + alias-only → `needs_review` ✓
- PPLF + alias-only → `needs_review` ✓
- PPLS + alias-only → `needs_review` ✓

User can now manually audit these (drop alias + approve, or confirm rejection).

---

## 7. Test results

### Unit tests — `scripts/_test_stage_3_religious_exemption.mjs` (NEW)

**32/32 PASS**:

| Part | Coverage | Tests | Status |
|------|----------|------:|--------|
| A | `checkBlocklist` correctly distinguishes primary vs alias | 5 | ✓ |
| B | `decideStatusAndTier` 3-tier routing (rangpur/masjed-soleyman/lexington/true-positive/alias-only/baseline) | 7 | ✓ |
| C | Admin-tier exemption across all 4 admin codes (PPLC/PPLA/PPLA2/PPLA3) × 2 cases (primary + alias) | 8 | ✓ |
| D | Non-admin codes (PPL/PPLL/PPLF/PPLS) × 2 routing (primary→reject, alias→needs_review) | 8 | ✓ |
| E | Arabic religious keywords (مسجد in primary; admin vs non-admin) | 2 | ✓ |
| F | `non_place` keyword path unchanged (mountain, etc.) | 2 | ✓ |

### Carry-forward regression — 6 suites

| Suite | Result |
|-------|--------|
| `_test_place_by_slug.mjs` | 44/44 ✓ |
| `_test_fill_lang_map.mjs` | 11/11 ✓ |
| `_test_place_names_ur_pk_6.mjs` | 69/69 ✓ |
| `_test_place_names_cross_page_navigation_consistency_fix_1.mjs` | 28/28 ✓ |
| `_test_place_names_template_consistency_all_langs_fix_1.mjs` | 18/18 ✓ |
| `_test_search_ar.mjs` | 22/22 ✓ |

**Total tests: 32 unit + 192 carry-forward = 224/224 PASS, 0 failures.**

---

## 8. ✅ Verifications

### `curated-places.json` unchanged

```bash
$ git diff db/places/curated-places.json | wc -l
0
```

Total curated still 2,506 entries. BD still 38. No mutation.

### `candidates/*.json` unchanged

Verified: all 98 candidate files are either pre-existing untracked (gitignored after the BD-A phase) or unmodified. **No re-run of Stage 3 against any country.** The fix takes effect on the NEXT Stage 3 invocation only (i.e., when a new country pipeline runs `validate_candidates.mjs <cc>`).

This is intentional and correct: applying the fix retroactively to existing candidate files would mutate them, which the user spec explicitly forbade.

### No merge / no Stage 4

`apply_curated_candidates.mjs` was not invoked in this phase.

### Other code files unchanged

```bash
$ git diff --stat server.js js/app.js index.html scripts/geodata/_geonames_common.mjs scripts/geodata/normalize_places.mjs scripts/geodata/apply_curated_candidates.mjs
(empty — 0 changes)
```

### NO Brunei data used

`bn-geonames-*` Brunei files NOT read, NOT modified, NOT referenced. `bn.mjs` Brunei config NOT modified. The fix is country-agnostic and operates at Stage 3 logic level.

---

## 9. Acceptance criteria

| # | Criterion | Status |
|---|---|--------|
| 1 | `validate_candidates.mjs` applies the new 3-tier policy | ✓ |
| 2 | Admin centers (PPLC/PPLA/PPLA2/PPLA3) not rejected via religious keyword | ✓ (Part C tests 8/8 PASS) |
| 3 | Alias-only non-admin → `needs_review` (not `rejected`) | ✓ (Part B5 + Part D ×4 PASS) |
| 4 | Primary-name religious true positives still rejected | ✓ (Part B4 + Part D ×4 PASS) |
| 5 | rangpur-class bug resolved upstream (no per-wave override needed) | ✓ (Part B1 PASS — rangpur PPLA + "Mosque Rangpur" alias → `pending tier=high`) |
| 6 | No `curated-places.json` mutation | ✓ (0 byte diff) |
| 7 | No `candidates` files mutation | ✓ |
| 8 | No merge / Stage 4 not invoked | ✓ |
| 9 | No city add / delete | ✓ |
| 10 | No `server.js` / `js/app.js` / `index.html` changes | ✓ |
| 11 | All tests pass | ✓ (224/224) |
| 12 | Closure report at `reports/stage-3-religious-exemption-1-closure.md` | ✓ |
| 13 | No Held Queue phase started | ✓ |

**All 13 criteria met.**

---

## 10. Files this phase changed

### Modified

| File | Change |
|------|--------|
| `scripts/geodata/validate_candidates.mjs` | +72 / -13 lines: enhanced `checkBlocklist` (added `in` field distinguishing primary vs alias); enhanced `decideStatusAndTier` (3-tier routing block); both functions now exported for testability |

### Created

| File | Purpose |
|------|---------|
| `scripts/_test_stage_3_religious_exemption.mjs` | NEW — 32 unit tests covering all 6 required scenarios + bonus coverage (admin codes ×4, Arabic keywords, non_place path) |
| `reports/stage-3-religious-exemption-1-closure.md` | This closure report |

### NOT modified

- ❌ `db/places/curated-places.json` — 0 byte diff
- ❌ `db/places/candidates/*.json` — none modified (existing candidate files NOT re-validated; fix takes effect on NEXT Stage 3 run only)
- ❌ `scripts/geodata/_geonames_common.mjs` — unchanged (RELIGIOUS_KEYWORDS / NON_PLACE_KEYWORDS / `matchAnyKeyword` all unmodified)
- ❌ `scripts/geodata/normalize_places.mjs` — unchanged (no Stage 2 logic affected)
- ❌ `scripts/geodata/apply_curated_candidates.mjs` — unchanged (no Stage 4 logic affected)
- ❌ `scripts/geodata/countries/*.mjs` — unchanged (no per-country config affected)
- ❌ `server.js`, `js/app.js`, `index.html` — unchanged
- ❌ MEMORY.md — not updated (deferred to post-user-approval)

---

## 11. When the fix takes effect

This upstream patch operates at Stage 3 logic level. It affects:

| Scenario | Impact |
|----------|--------|
| **Future Stage 3 runs for any country** | Will use the new 3-tier policy. e.g., when ASIA-1D-IN (India), ASIA-1F (China), or any future country pipeline calls `node scripts/geodata/validate_candidates.mjs <cc>`, false-positive religious rejections won't happen on admin-tier or alias-only cases. |
| **Existing candidate files** | Unchanged. The fix does NOT retroactively rewrite their classification. To get the benefit for an existing country, that country's pipeline must be re-run from Stage 3. |
| **Existing curated-places.json** | Unchanged. The fix does not directly affect curated state. |
| **BD-A override pattern** | Still works (idempotent re-run support). Future BD waves that re-validate candidates would NOT need the override because the upstream fix handles it natively. |

---

## 12. Recommendation for next phase

**Held queue (per user direction — DO NOT auto-start)**:

- ❌ **ASIA-1D-BD-MCF** — blocked-major review (currently no candidates need it)
- ❌ **ASIA-1D-BD-MISSING-AR-MAJORS-1B** — next BD expansion wave (~45 remaining candidates)
- ❌ **PLACE-NAMES-ALIASES-BD-SEED-1** — alias enrichment for 6 BD seeds
- ❌ ASIA-1D-IN — India Urdu wave
- ❌ ASIA-1F — China solo wave
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

### Most natural next phase

**Option A** — **PLACE-NAMES-ALIASES-BD-SEED-1**: small low-risk alias-enrichment wave for the 6 BD seed entries (17 documented alias opportunities from BD-A preflight phase).

**Option B** — **ASIA-1D-BD-MISSING-AR-MAJORS-1B**: next BD expansion wave (would now benefit from the new Stage 3 policy if re-running validate_candidates.mjs for BD — but re-running mutates candidates; better to wait for a future planned wave).

**Option C** — **Other country wave** (ASIA-1D-IN, ASIA-1F, AMERICAS-1B-MCF): new country can now use the improved Stage 3 from the start.

**Recommended**: Option A for low-risk closure of BD seed alias gaps, OR Option C for fresh-country wave that benefits from the new exemption policy.

---

## Status: 🟢 STAGE-3-RELIGIOUS-EXEMPTION-1 CLOSED — user-approved 2026-05-20

### Summary

| Metric | Value |
|--------|-------|
| Closure report | `reports/stage-3-religious-exemption-1-closure.md` |
| Apply commit | `7380772` (pushed to main) |
| Closure-approval commit | (this docs commit) |
| Files modified | 1 (`validate_candidates.mjs` only) |
| Files created | 2 (1 unit test + 1 closure report) |
| Lines changed | +72 / -13 in `validate_candidates.mjs` |
| Policy applied | Option C: admin-exempt + primary-reject + alias-only → needs_review |
| Unit tests | 32/32 PASS |
| Carry-forward regression | 192/192 PASS (6 suites) |
| Total tests | **224/224 PASS** |
| `curated-places.json` mutations | **0 bytes changed** |
| Candidates mutations | **NONE** |
| Merge / Stage 4 | **NOT RUN** |
| Brunei data used | **NONE** |
| Server / app / index changes | **NONE** |
| Held Queue phase started | **NONE** |

### User-approval acceptance criteria (all met)

| # | Criterion | Status |
|---|---|---|
| 1 | `validate_candidates.mjs` applies Option C 3-tier policy | ✓ |
| 2 | Admin centers (PPLC/PPLA/PPLA2/PPLA3) NOT rejected via religious keyword | ✓ (Part C tests 8/8 PASS) |
| 3 | Alias-only non-admin → `needs_review` (not `rejected`) | ✓ (Part B5 + Part D ×4 PASS) |
| 4 | Primary-name religious true positives still rejected | ✓ (Part B4 + Part D ×4 PASS; 360 entries preserved) |
| 5 | rangpur-class bug resolved upstream (no per-wave override needed) | ✓ (Part B1 — bd/rangpur PPLA + "Mosque Rangpur" alias → `pending tier=high`) |
| 6 | `curated-places.json` unchanged | ✓ (0 byte diff) |
| 7 | Any `db/places/candidates/*.json` unchanged | ✓ (NONE re-validated) |
| 8 | No merge / Stage 4 not invoked | ✓ |
| 9 | No `server.js` / `js/app.js` / `index.html` changes | ✓ |
| 10 | No Brunei (`bn-*` / `bn.mjs`) data used | ✓ |
| 11 | Tests 224/224 PASS | ✓ |

### Before / after (4 documented cases)

| Case | featureCode | Before | After |
|------|-------------|--------|-------|
| **bd/rangpur** | PPLA | rejected (BD-A override needed) | **pending tier=high** (admin-exempt) |
| **ir/masjed-soleyman** | PPLA2 | rejected | **pending** (admin-exempt) |
| **us/lexington** | PPLA2 | rejected | **pending** (admin-exempt) |
| **my/kampong-masjid-tanah** | PPL pop=29k | rejected | **rejected** (status quo — primary-hit non-admin) |

### Held queue (per user direction — DO NOT auto-start)

- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1
- ❌ ASIA-1D-IN
- ❌ ASIA-1F
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1

**No further work until user direction.**
