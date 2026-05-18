# CURATED-PLACE-NAMES-L10N-FOUNDATION-1 — Architecture + phased plan

**Phase**: Foundation / architecture proposal (no code, no data changes)
**Date**: 2026-05-18
**Status**: design-only — awaiting user approval
**Predecessor**: `CURATED-PLACE-NAMES-L10N-AUDIT-1` (audit)
**Predecessor reverted**: `PLACE-NAMES-L10N-FALLBACK-1` (the runtime ar→ur fallback patch — rejected by user; **the server.js change has been reverted; no patch shipped**)

---

## Core principle (user direction)

> **"Missing must stay missing."** A city without a real, manually-reviewed `names.ur` MUST NOT silently use `names.ar` or `names.en` at runtime. Every language field is either:
> - **PRESENT** — a vetted, native-script translation reviewed for that specific language
> - **ABSENT** — no value at all (and the UI must render an honest "no translation" state, NOT a silent fallback)

This rejects the historical `fillLangMap` pattern that filled every missing lang with the English value. It also rejects the proposed `PLACE-NAMES-L10N-FALLBACK-1` ar→ur runtime substitution.

**Why**: a silent fallback hides the gap. As the dataset grows (2,336 today → 5,000+ tomorrow), the gap grows invisibly. Honest absence forces the gap to be measured, reviewed, and closed properly.

**Concrete example** the user gave:
- ✅ Charikar's `names.ur` should eventually be `چاریکار` (with Persian چ + Urdu ی + Urdu ک — the actual Nasta'liq Urdu form)
- ❌ Not `تشاريكار` (Arabic transliteration — close, but it's Arabic, not Urdu)
- ❌ Not `Charikar` (Latin — current state, the bug)
- ❌ Not silently substituting `names.ar` at runtime

---

## §1. How will we store city names per language?

### Schema decision (recommended): in-place expansion of `names`

Keep `names` inside each curated entry, but treat **presence vs. absence as semantically meaningful**:

```jsonc
{
  "slug": "charikar",
  "countryCode": "af",
  "names": {
    "ar": "تشاريكار",     // present + manually-reviewed
    "en": "Charikar",     // present + canonical (always present)
    "ur": "چاریکار"        // present + manually-reviewed in Urdu Nasta'liq script
    // fr, de, tr, id, es, bn, ms — DELIBERATELY absent until manually filled
  },
  "namesProvenance": {
    "ar": "stage4:asia-1g-af",                       // which wave introduced it
    "en": "geonames",
    "ur": "l10n-foundation-1:ur-priority-batch"      // which review batch added it
  }
}
```

Rules:
1. **`names.en` is always present** (it's the canonical fallback for the few legitimate cases where a city has no native local-script name, e.g. brand-new GPS-only points).
2. **`names.ar` is always present** (we have wave-by-wave 100% AR coverage; this stays the invariant).
3. **All other 8 langs (`fr`, `de`, `tr`, `id`, `es`, `bn`, `ms`, `ur`) are optional** and remain ABSENT until manually reviewed.
4. **`namesProvenance` is a parallel map** (sibling to `names`) recording the source/wave/batch ID for each language. This lets us audit which translations came from where + revisit them later.

### Why in-place, not a separate file?

Trade-off analysis ↓

---

## §2. Inside `curated-places.json` OR a separate `place-names-l10n.json`?

I considered three architectures:

### Option A — In-place (recommended)

Names live inside each curated entry's `names` object.

| ✓ Pros | ✗ Cons |
|---|---|
| One source of truth — joins are implicit | curated-places.json grows |
| Existing server.js / SSR / API contract unchanged | All 2,336+ rows touched when a single lang adds a row |
| `_pickCuratedName` already does the right lookup | Diffs are noisier (any name change rewrites the JSON line) |
| Atomic — slug + names + coords + tz all in one place | |

### Option B — Side-car file `db/places/place-names-l10n.json`

A second JSON keyed by slug, holding only the localized names. Loaded into memory at server boot; `_pickCuratedName` reads from a merged view.

```jsonc
// place-names-l10n.json
{
  "charikar":     { "ur": "چاریکار", "tr": "Çarikar" },
  "kandahar":     { "ur": "قندھار",  "fr": "Kandahar" },
  ...
}
```

| ✓ Pros | ✗ Cons |
|---|---|
| Curated-places.json stays small | Two files to keep in sync at every wave merge |
| Diffs cleaner — adding 1000 ur names = 1 file changes | Double-source-of-truth = double the bugs |
| Easier to A/B-test "with vs without l10n batch X" | server.js boot logic gets more complex |
| Easier to delete a whole language batch | API/SSR readers must merge — risk of stale-cache mismatches |

### Option C — Per-language side-cars

`db/places/names/ur.json`, `db/places/names/bn.json`, etc.

| ✓ Pros | ✗ Cons |
|---|---|
| Smallest per-file size | 9 files to coordinate |
| Easy batch ops per-lang | Even more boot-load complexity |
| Easy provenance per-batch | Slug consistency check across 10 files at every wave merge |

### Recommendation: **Option A (in-place)**

The deciding factor is the existing server contract. `curated-places.json` is already loaded into memory at boot (`_CURATED_PLACES` + `_findPlaceBySlug`), and SSR + API + smoke tests all read from `entry.names[lang]`. Adding a side-car would require touching every reader.

In-place expansion preserves the contract. The "noisy diff" concern is solved by JSON formatting (one entry per line in our existing format).

### Sub-decision: store `namesProvenance` SEPARATELY

To keep `names` itself a clean lang→string map (so existing readers don't need to change), provenance lives in a parallel `namesProvenance` field. Optional, additive, ignored by old readers.

---

## §3. How do we prevent the wrong fallback `names.en → ur`?

This is THE root cause of the current bug. Two complementary defenses:

### Defense A — kill `fillLangMap`'s English-fallback fill at Stage 2

Current `scripts/geodata/_geonames_common.mjs:396`:

```js
export function fillLangMap(partial, fallback) {
    const out = {};
    for (const l of SUPPORTED_LANGS) {
        out[l] = (partial && partial[l]) ? partial[l] : fallback;   // ← root cause
    }
    return out;
}
```

This fills every missing lang with the English fallback string. As a result, every new wave's `names.ur === names.en === "Charikar"` from day 1.

**Proposed replacement**:

```js
// New behavior: only `en` and `ar` are filled; everything else stays absent.
export function fillLangMap(partial, fallback) {
    const out = {};
    // en is the canonical anchor — always present
    out.en = (partial && partial.en) ? partial.en : fallback;
    // ar is the wave invariant — fill from partial only; if absent, leave
    // it absent so Stage 3.5 flags it (existing post-Stage-3.5 check).
    if (partial && partial.ar) out.ar = partial.ar;
    // All other langs: ABSENT unless explicitly provided by the source.
    for (const l of SUPPORTED_LANGS) {
        if (l === 'en' || l === 'ar') continue;
        if (partial && partial[l]) out[l] = partial[l];   // present only if source had it
        // else: omit the key entirely → names[l] === undefined → SSR shows the "absent" UI
    }
    return out;
}
```

This is a **single-function change** that flips the new-wave default from "fill all langs with en" to "leave all langs except en+ar absent unless source provides them". **Old curated data must be cleaned up in Phase 2** (see §10).

### Defense B — SSR rendering treats absence honestly

Currently `_pickCuratedName(entry, lang)` falls back to `names.en` if `names[lang]` is missing — silently. Proposed behavior:

```js
function _pickCuratedName(entry, lang) {
    if (!entry || typeof entry !== 'object') return null;
    const _n = entry.names || {};
    const _code = String(lang || 'ar').toLowerCase();
    if (typeof _n[_code] === 'string' && _n[_code].trim()) return _n[_code];

    // 🆕 Honest absence: when the requested lang is missing AND it's NOT
    // the canonical lang (en/ar), return null so the UI layer can render
    // an absence-aware state (see §9) instead of silently leaking English.
    if (_code !== 'en' && _code !== 'ar') return null;

    // For en/ar specifically, fall back to whatever's available
    // (en→whatever, ar→en as last resort) because we GUARANTEE these two
    // are present.
    if (typeof _n.en === 'string' && _n.en.trim())         return _n.en;
    for (const k of Object.keys(_n)) {
        if (typeof _n[k] === 'string' && _n[k].trim()) return _n[k];
    }
    return null;
}
```

This means: a `/ur/<slug>` request for a city with no `names.ur` returns `null` from `_pickCuratedName('ur')`. The UI layer (§9) then displays an honest absence (e.g. show English with a marker, or redirect to /ar, or show the H1 with a note like "we don't have an Urdu translation yet"). The decision belongs to the UI layer, not the data layer.

**Note**: Defense B alone wouldn't be enough — existing curated entries already have `names.ur === "Charikar"` from old `fillLangMap` runs. So we ALSO need a one-time cleanup (Phase 2 §10).

---

## §4. How do we know a name is "real translation" vs. "fallback"?

Three signals, in order of strength:

### Signal 1 (strongest) — `namesProvenance[lang]`

If `namesProvenance[lang]` exists AND its value is one of the approved batch IDs (e.g. `l10n-foundation-1:ur-priority-batch`, `stage4:asia-1g-af`), the name is real.

If the field doesn't exist OR its value is `fillLangMap-en-fallback`, the name is suspect.

### Signal 2 — Script-class check

For each lang, the value SHOULD match the script associated with that lang's primary writing system:

| Lang | Expected primary script | Test |
|---|---|---|
| `ar` | Arabic block U+0600-06FF (strict, no Persian extras) | `arabic_quality_check.mjs` already does this |
| `ur` | Arabic block U+0600-06FF (LOOSE — Persian extras allowed) | needs new test |
| `bn` | Bengali block U+0980-09FF | needs new test |
| `en/fr/de/tr/id/es/ms` | Latin (A-Z + accented Latin) | needs new test |

If `names.ur` contains Latin chars → almost certainly a fallback or mojibake.

### Signal 3 — String equality check

If `names[lang] === names.en` for any lang ≠ en → almost certainly a fillLangMap fallback (the user-visible bug). We can compute this without provenance metadata.

### How they combine

| Provenance? | Script-class OK? | == en? | Verdict |
|:-:|:-:|:-:|---|
| ✓ batch ID | ✓ | — | **real translation** |
| ✓ batch ID | ✗ | — | **mojibake / regression** (report + fix) |
| ✗ | ✓ + non-Latin script | ✗ | **probably real** (pre-foundation, grandfather) |
| ✗ | ✓ Latin | ✓ | **fallback** (== en) — gap |
| ✗ | ✓ Latin | ✗ | **suspect** — possibly fillLangMap from an old en that's since changed |
| ✗ | ✗ (Latin in ar) | — | **regression** (see Audit §6 — the 7 legacy seeds) |

---

## §5. How do we review name quality before approving?

The same human-review workflow we've used for every wave's `NAME_AR_FIXES`. Codified:

### Review batch tooling

Build `scripts/geodata/_l10n_review_batch.mjs` that:

1. Takes a `--lang=ur --batch-name=ur-pk-priority-1 --countries=pk,af` argument.
2. Scans curated rows matching `--countries`. For each row, prints:
   - slug, countryCode
   - current `names.en`
   - current `names.ar`
   - any `aliases.ur` already present
   - the GeoNames row's `alternatenames` filtered to Urdu-script candidates (if available)
3. Asks the user to type the canonical Urdu name (or paste "SKIP" / "USE_AR" / "USE_EN" decision codes).
4. Validates the typed value against the script-class check (rejects Latin in Urdu).
5. Writes the user's decisions to a review file (`reports/l10n-review-batch-ur-pk-priority-1.md`) for the user to confirm before they're applied to `curated-places.json`.

### Review file format

A simple markdown table the user can edit:

```markdown
| Approve | slug | en | proposed ur | source |
|:---:|---|---|---|---|
| [x] | islamabad     | Islamabad     | اسلام آباد       | manual |
| [x] | karachi       | Karachi       | کراچی            | manual |
| [ ] | gilgit        | Gilgit        | (?)              | needs review |
```

The user ticks boxes / fills blanks / commits → an apply script reads the markdown back and updates `curated-places.json` + `namesProvenance`.

### Quality safeguards

Every applied row passes through:
1. **Script-class check** (no Latin in Arabic/Urdu/Bengali names)
2. **No-equality check** (must differ from `names.en`)
3. **Dup check** (no two slugs share the same `names.ur` within the same country — common typo)
4. **Length sanity** (no 1-char names; no 100-char monsters)
5. **Provenance stamping** (every approved row gets `namesProvenance.ur = 'l10n-batch-id'`)

---

## §6. How do we add names in batches?

The 10-language × 2,336+ entries grid is too big for a single batch. The right unit of work is:

**`(language, country-or-region, batch-size 20-50 rows)`**

### Batch sizing rules

| Batch size | Use case |
|---:|---|
| 5-10 | First batch of any new lang/region — proves the workflow |
| 20-50 | Steady-state — small enough for one sitting, large enough to be meaningful |
| 100+ | Only after we have a tooling assist for the lang (e.g. a Wikipedia API helper) |

### Batch sequence (priority)

Phase 2 (urgent — Urdu only) batches in this order:

1. `ur-af` (Afghanistan, 36 rows after AF-MCF) — user-flagged origin of the bug
2. `ur-ir` (Iran, 53 rows) — Persian → Urdu transliteration is straightforward
3. `ur-pk` (Pakistan, 10 rows + future expansion) — native Urdu market
4. `ur-bd` (Bangladesh, 6 rows) — large Urdu-speaking minority
5. `ur-in` (India, 18 rows) — large Urdu-speaking minority

That's 123 rows total for the first 5 batches. Doable in a focused session.

Phase 4 (later — other langs) batches:

| Lang | Priority countries | Rationale |
|---|---|---|
| `tr` | TR, BG, CY, GR (Cyprus diaspora), DE (Turkish diaspora) | large user base; Latin-script names are usually adequate |
| `bn` | BD, IN | similar to Urdu — large speaker base |
| `id` / `ms` | ID, MY, BN | similar scripts, can share batches |
| `fr` | FR, MA, DZ, TN, BE, CH, CA | Latin-script transliterations exist via Wikipedia |
| `de` / `es` | DE/AT/CH; ES/AR/MX/CO/CL/PE/VE | similar to fr — Wikipedia coverage |

---

## §7. How do we test each language?

Three test layers:

### Layer 1 — Static dataset tests (`scripts/geodata/_l10n_invariants_check.mjs`)

Run at every commit. Asserts:
- `names.en` and `names.ar` are present on every curated row (existing invariant)
- `names[lang]` for any lang ≠ {en, ar} satisfies the script-class rule (if present)
- No two slugs in the same country share `names[lang]` for any lang
- `namesProvenance[lang]` exists for every present `names[lang]` other than en/ar (= "we know where this came from")

### Layer 2 — Per-lang SSR smoke tests

One test file per language: `scripts/_test_l10n_<lang>_ssr.mjs`. Each:
1. Picks 20-30 sample curated rows that have `names[lang]` present
2. Hits `/<lang>/prayer-times-in-<slug>` via HTTP
3. Asserts the rendered city name (in SSR meta + body) matches `names[lang]` EXACTLY
4. Asserts NO Latin chars leak into non-Latin lang pages (for ar/ur/bn)

Run on every PR.

### Layer 3 — Absence-state smoke tests

For each lang, pick 5-10 rows that DON'T have `names[lang]`. Hit `/<lang>/...`. Assert the UI honestly displays an absence state (see §9) instead of leaking English.

This is the test that would have caught the Charikar bug if it had existed.

---

## §8. How do we prevent Latin from showing in `ur` or `ar` pages?

Defense in depth:

### Layer 1 — Stage 2 (`fillLangMap` redesign, see §3 Defense A)

Stop filling non-en/ar langs with the English fallback. New waves no longer produce `names.ur === "Charikar"`.

### Layer 2 — Stage 3.5 (Arabic-name QA, already exists)

`arabic_quality_check.mjs` already rejects Latin in `names.ar`. **Extend it** to also reject Latin in `names.ur` (if present) AND in `names.bn` (if present).

### Layer 3 — Stage 3.6 (new — language-coverage gate, see Phase 3)

Per-wave report: count of `names[lang]` present for each lang. Highlights regressions.

### Layer 4 — SSR rendering (`_pickCuratedName` redesign, see §3 Defense B)

Returns `null` for non-en/ar langs when missing, instead of silently substituting `en`.

### Layer 5 — UI absence-state rendering

When `_pickCuratedName(lang)` returns null, the UI renders an honest state — not a silent leak. See §9.

### Layer 6 — Static l10n-invariants test (see §7 Layer 1)

Catches Latin in any present `names[ar|ur|bn]` field at commit time. Pre-merge guard.

---

## §9. How do we handle non-Arabic languages (`fr/de/es/tr/id/ms/bn`)?

Each language has different script + UX needs. Decision matrix:

| Lang | Script | Are en-Latin transliterations "acceptable"? | UX when absent? |
|---|---|---|---|
| `fr` | Latin | mostly yes — French uses Latin script and many city names are identical or close to English | use `names.en` (explicit user intent — accept Latin) |
| `de` | Latin | mostly yes — same reason | use `names.en` |
| `es` | Latin | mostly yes | use `names.en` |
| `tr` | Latin | mostly yes — Turkish uses Latin script | use `names.en` |
| `id` | Latin | mostly yes — Bahasa Indonesia uses Latin | use `names.en` |
| `ms` | Latin | mostly yes — Bahasa Malaysia uses Latin | use `names.en` |
| `bn` | Bengali | **NO** — Bengali script is different from Latin | render absence state |
| `ur` | Arabic/Nasta'liq | **NO** — Urdu uses Arabic script, different from Latin | render absence state |
| `ar` | Arabic | **NO** — Arabic script (already covered) | absent ar is a fatal data error |

### Key insight

The **honest absence rule** matters MOST for the non-Latin-script langs (`ar`, `ur`, `bn`). For Latin-script langs, using `names.en` as the rendered string is actually acceptable UX — the reader sees Latin characters either way, and most city transliterations to French/German/Spanish/Turkish/Indonesian/Malay are minor letter substitutions (Riyadh / Riad / Riad / Riad — same to a reader).

So `_pickCuratedName(entry, lang)` could be:

```js
const LATIN_SCRIPT_LANGS = new Set(['en', 'fr', 'de', 'es', 'tr', 'id', 'ms']);

function _pickCuratedName(entry, lang) {
    if (!entry) return null;
    const _n = entry.names || {};
    const _code = String(lang || 'ar').toLowerCase();
    if (typeof _n[_code] === 'string' && _n[_code].trim()) return _n[_code];
    // For non-Latin-script langs (ar/ur/bn), honestly report absence.
    if (!LATIN_SCRIPT_LANGS.has(_code)) return null;
    // For Latin-script langs (fr/de/es/tr/id/ms), use en (close-enough Latin).
    if (typeof _n.en === 'string' && _n.en.trim()) return _n.en;
    return null;
}
```

This is a **2-line change** to `_pickCuratedName` but it requires the UI layer to know what to do when null comes back for ar/ur/bn (§9 below).

### UX for absence state

When `_pickCuratedName` returns null:

1. **City headers** (e.g. "أوقات الصلاة في {city}" in /ar mode): render the slug-derived title from `_slugToTitle(slug)` plus a small note: *"اسم المدينة بالأوردية غير متوفر بعد — يُعرض الاسم اللاتيني."* (or equivalent per-lang).
2. **Breadcrumbs**: same — show the Latin slug-title.
3. **SEO Title/Meta tags**: skip the absent lang, fall to en/ar instead — search engines should not index a half-empty page.
4. **canonical link**: if `/ur/<slug>` has no real Urdu name, the canonical might be `/<slug>` (default Arabic) to avoid SEO dilution.

This is the most subjective design decision in the whole foundation. **Open question for user**: is "show the slug-title in Latin with a small marker" acceptable, or should `/ur/<slug>` redirect to `/<slug>` when the Urdu name is absent?

---

## §10. Phased execution plan

### Phase 1 — Foundation (CURRENT — this report)

Outcome: this report + user agreement on the architecture choices in §1-§9. **No code, no data changes.**

**Decisions needed from user**:
- §1: in-place expansion of `names` with optional `namesProvenance` sibling — OK?
- §2: in-place over side-car — OK?
- §3: kill `fillLangMap`'s en-fallback for non-en/ar langs — OK?
- §8 + §9: render absence honestly for ar/ur/bn; use en for Latin-script langs — OK?
- §9: UX when `_pickCuratedName` returns null — show Latin slug-title with a marker, OR redirect to default lang? — needs user direction

### Phase 2 — Backfill cleanup (after Phase 1 approved)

Outcome: existing curated entries' bogus `names[lang] === names.en` filled values get DELETED. Rows go from:

```jsonc
"names": { "en": "Charikar", "ar": "تشاريكار", "ur": "Charikar", "fr": "Charikar", "de": "Charikar", "tr": "Charikar", "id": "Charikar", "es": "Charikar", "bn": "Charikar", "ms": "Charikar" }
```

to:

```jsonc
"names": { "en": "Charikar", "ar": "تشاريكار" }
```

Script: `scripts/geodata/_l10n_phase2_backfill_strip.mjs`. Walks curated, for every row, for every lang ≠ {en, ar}, deletes the key if its value equals `names.en`. Idempotent. Audit-friendly: emits a report counting deletions per lang per cc.

Single commit, fully reversible (git revert).

### Phase 3 — Code changes (after Phase 2 approved)

| File | Change |
|---|---|
| `scripts/geodata/_geonames_common.mjs` | `fillLangMap` redesign (§3 Defense A) |
| `scripts/geodata/arabic_quality_check.mjs` | Extend Latin-rejection to `names.ur` + `names.bn` |
| `server.js` | `_pickCuratedName` redesign (§9 decision matrix) |
| `server.js` | Any other reader of `_n[lang]` audited for null-handling |
| `js/app.js` | Client-side reader audit |
| `index.html` / SSR templates | Absence-state rendering (see §9 UX decision) |
| NEW `scripts/geodata/_l10n_invariants_check.mjs` | Per-commit static check |

### Phase 4 — Phase 2 (Urdu) name enrichment

5 batches as listed in §6 — `ur-af`, `ur-ir`, `ur-pk`, `ur-bd`, `ur-in`. Each batch a separate PR/commit. Each goes through:

1. Generate review markdown via `_l10n_review_batch.mjs`
2. User reviews + ticks approvals
3. Apply script writes to curated + `namesProvenance`
4. Smoke test for the batch
5. Carry-forward regression suites
6. Commit + push

Estimated effort per batch: 1-2 hours.

### Phase 5 — Stage 3.6 lang-coverage gate

Add `lang-coverage` check to the wave pipeline so any new wave fails closure if more than X% of its merged rows have absent `names.ur` for Urdu-priority countries.

### Phase 6 — Long-tail enrichment (`fr/de/tr/id/es/bn/ms`)

After Phase 4 stabilizes (Urdu coverage > 80% for 5 priority countries), open per-language phases for the other 7. Order: `tr/bn → id/ms → fr/de/es`.

---

## Open questions for user before Phase 1 closes

These are the decisions that block Phase 2:

1. **Schema**: in-place `names` expansion vs side-car file? *(Recommendation: in-place; §2)*
2. **Provenance field**: add `namesProvenance` alongside `names`, or skip it? *(Recommendation: add it — cheap audit-trail; §1)*
3. **fillLangMap behavior**: kill the en-fallback for non-en/ar langs in new waves? *(Recommendation: yes; §3)*
4. **SSR fallback for non-Latin langs (ar/ur/bn)**: return `null` honestly? *(Recommendation: yes; §3)*
5. **SSR fallback for Latin langs (fr/de/es/tr/id/ms)**: use `names.en` (acceptable Latin) or also return null? *(Recommendation: use `names.en` — readers get readable Latin; §9)*
6. **UX for null**: show slug-title with marker, OR redirect to `/<slug>` (default Arabic), OR redirect to `/en/<slug>`? *(Open — needs user direction)*
7. **Phase 2 cleanup scope**: just strip `names[lang] === names.en` rows, OR ALSO strip rows where the script doesn't match the lang? *(Recommendation: just the equality strip first — stricter cleanup later)*

---

## Files that would be touched by each phase (preview, NOT to be edited now)

| Phase | Files |
|---|---|
| Phase 2 | `db/places/curated-places.json` (deletions of `names[lang] === names.en`) |
| Phase 3 | `scripts/geodata/_geonames_common.mjs`, `scripts/geodata/arabic_quality_check.mjs`, `server.js`, `js/app.js`, `index.html` (or SSR templates), NEW `scripts/geodata/_l10n_invariants_check.mjs` |
| Phase 4 | `db/places/curated-places.json` (additions of real `names.ur`), `scripts/geodata/_l10n_review_batch.mjs`, `scripts/_test_l10n_ur_ssr.mjs` |
| Phase 5 | `scripts/geodata/arabic_quality_check.mjs` (gate extension), per-wave reports |
| Phase 6 | Same as Phase 4 but for other langs |

---

## What this report explicitly does NOT do

- ❌ NO code changes (server.js / app.js / index.html — untouched)
- ❌ NO data changes (curated-places.json — untouched)
- ❌ NO runtime translation
- ❌ NO ar→ur runtime fallback (the rejected PLACE-NAMES-L10N-FALLBACK-1 patch has been REVERTED — server.js diff vs origin/main is empty)
- ❌ NO calls to translation APIs

This is a **pure architecture proposal** awaiting user decisions on the 7 open questions above.

---

## Verification that nothing was changed

```
$ git diff server.js                        → empty (FALLBACK-1 patch reverted)
$ git diff db/places/curated-places.json    → empty
$ git diff scripts/geodata/_geonames_common.mjs → empty
```

`PLACE-NAMES-L10N-FALLBACK-1` has been fully reverted. The only NEW file in this phase is this report.

---

**End of foundation proposal. Awaiting user direction on the 7 open questions in §10.**
