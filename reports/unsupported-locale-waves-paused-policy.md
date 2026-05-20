# Policy: Unsupported-Locale Waves PAUSED

**Date**: 2026-05-20
**Decision by**: User course-correction
**Scope**: Indian L10N expansion waves

---

## Policy

> **Unsupported local-language waves are paused unless the language exists in the site UI.**

The site's `SUPPORTED_LANGS` is currently the 10-lang set: `ar`, `en`, `fr`, `de`, `tr`, `ur`, `id`, `es`, `bn`, `ms`.

Languages NOT in this set should NOT receive curated `names.<lang>` enrichment waves, because:
1. The site has no routing for them (no `/<lang>/` URL family)
2. The site UI has no translation strings for them
3. SSR templates do not inject these names into seed
4. The `place-by-slug` API does not expose them
5. Data-only enrichment without UI support provides no user value

Languages that ARE in `SUPPORTED_LANGS` benefit from automatic SSR seed injection, `/<lang>/` route support, and full UI integration — so enrichment waves for these languages have real user value.

---

## Status of Indian L10N waves (effective 2026-05-20)

### Closed (kept as-is, NOT reverted)

- 🟢 **PLACE-NAMES-HI-IN-1** — Hindi enrichment for 40 IN entries. Closed `a07a4b6` + `e946c84` (2026-05-20). Hindi is OUTSIDE `SUPPORTED_LANGS`. **Treated as data-only enrichment of deferred usage**. No routing, no UI integration. NOT reverted per user direction. Future Hindi-locale routing (`PLACE-NAMES-HI-IN-LOCALE-ROUTING-1`) is PAUSED.

### Closed (supported locales — production value)

- 🟢 **PLACE-NAMES-UR-IN-1** — Urdu enrichment for 22 BATCH-A. Closed `c077433` + `1d6c080`. Urdu IS in SUPPORTED_LANGS → full SSR + routing support. ✓
- 🟢 **PLACE-NAMES-BN-IN-1** — Bengali enrichment for 22 BATCH-A. Closed `7aaa278` + `342280b`. Bengali IS in SUPPORTED_LANGS → full SSR + routing support. ✓

### PAUSED (unsupported locales)

- ⏸️ **PLACE-NAMES-TA-IN-1** — Tamil. NOT in SUPPORTED_LANGS. Plan exists (`reports/place-names-ta-in-1-plan.md`) but APPLY paused. Curated-places.json byte-identical with pre-pause state (was briefly mutated then reverted before commit).
- ⏸️ **PLACE-NAMES-MR-IN-1** — Marathi. NOT in SUPPORTED_LANGS. NOT planned, NOT to be planned.
- ⏸️ **PLACE-NAMES-HI-IN-LOCALE-ROUTING-1** — Adding Hindi locale routing (`/hi/` pages, hi in SUPPORTED_LANGS, server.js/js/app.js/index.html changes). PAUSED until Hindi is added to site UI (separate product decision).

---

## Rollback summary — TA-IN-1 corrective action 2026-05-20

User executed corrective action mid-TA-IN-1-APPLY when realizing Tamil is unsupported. State at time of correction:
- Apply script had been run; curated-places.json had 40 new `names.ta` + 17 `aliases.ta` (uncommitted)
- HI-IN-1 + UR-IN-1 test files had Group-4/5 relaxed to set-inclusion (uncommitted)
- TA-IN-1 apply script + test + apply-audit existed (uncommitted)
- Backup `.prePlaceNamesTaIn1.bak` had pre-apply state

Corrective steps:
1. Restored `db/places/curated-places.json` from backup → byte-identical with `342280b` HEAD
2. Reverted `scripts/_test_place_names_hi_in_1.mjs` to HEAD (Group 4 strict-equal restored)
3. Reverted `scripts/_test_place_names_ur_in_1.mjs` to HEAD (Group 5 strict-equal restored)
4. Deleted `scripts/geodata/_place_names_ta_in_1_apply.mjs` (apply was canceled)
5. Deleted `scripts/_test_place_names_ta_in_1.mjs` (no test needed for paused wave)
6. Deleted `reports/place-names-ta-in-1-apply-report.md` (audit by canceled apply)
7. Deleted `db/places/curated-places.json.prePlaceNamesTaIn1.bak` (no longer needed)
8. Kept `reports/place-names-ta-in-1-plan.md` (historical plan documentation with PAUSE note added)
9. Kept `scripts/geodata/_place_names_ta_in_1_audit.mjs` (read-only utility, harmless)

Tests after corrective action:
- HI-IN-1: **116/116** ✅ (unchanged)
- UR-IN-1: **122/122** ✅ (unchanged)
- BN-IN-1: **113/113** ✅ (unchanged)

---

## Updated Held queue

### Paused (unsupported locales)

- ⏸️ PLACE-NAMES-TA-IN-1 (Tamil — paused)
- ⏸️ PLACE-NAMES-MR-IN-1 (Marathi — paused, will not be planned)
- ⏸️ PLACE-NAMES-HI-IN-LOCALE-ROUTING-1 (paused, until Hindi added to site UI)

### Held (not started; await user direction)

- ❌ ASIA-1D-IN-B (India geodata expansion — eligible, supported)
- ❌ ASIA-1F (China — supported but no waves yet)
- ❌ AMERICAS-1B-MCF
- ❌ SEARCH-RANKING-IMPROVEMENT-1
- ❌ DELETE-V1-AND-GEOCODE-PROXY-1
- ❌ ASIA-1D-BD-MCF
- ❌ ASIA-1D-BD-MISSING-AR-MAJORS-1B
- ❌ PLACE-NAMES-ALIASES-BD-SEED-1

---

## Recommended next-step options (user direction required)

1. **ASIA-1D-IN-B-PLAN** — expand India geographically (next-tier ~30-50 cities). All 5 supported langs (ar/en/hi-deferred/ur/bn) covered by existing patterns.
2. **SEARCH-RANKING-IMPROVEMENT-1** — improve search ranking quality.
3. **Pause & review** — stop and audit overall site state before next wave.

User must explicitly approve next phase. NO auto-start.
