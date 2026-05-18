# PLACE-NAMES-L10N-PIPELINE-GUARD-1 — Closure Report

**Phase**: Pipeline guard (build-time, future waves only)
**Date**: 2026-05-18
**Status**: **CLOSED**
**Scope**: 4-line `fillLangMap` redesign — stops future GeoNames-pipeline waves from creating fillchain rows
**Predecessor**: `PLACE-NAMES-UR-DATA-SOURCE-AUDIT-1` (the audit that diagnosed the cause)

---

## Headline

`fillLangMap` in `scripts/geodata/_geonames_common.mjs:396` no longer cascades `names.en` into all 10 language slots. Future GeoNames-pipeline waves will produce rows with only `en` (always) + `ar` (when extracted from GeoNames) + any other lang the source explicitly provides. **No more `names.ur === names.en === "Charikar"` rows added.**

**Pre-existing fillchain rows in `curated-places.json` are NOT touched.** This phase fixes the bleed; per-country enrichment batches (next phases) will fix the existing rows by overwriting them with real Urdu names.

---

## Cause of the original problem (recap from audit)

`fillLangMap` used to fill every missing lang slot with the English fallback:

```js
// OLD (root cause)
export function fillLangMap(partial, fallback) {
    const out = {};
    for (const l of SUPPORTED_LANGS) {
        out[l] = (partial && partial[l]) ? partial[l] : fallback;   // ← cascade
    }
    return out;
}
```

Every Stage 2 of every GeoNames wave called this with `partial = { ar, en }` and `fallback = enName`, producing rows where `names.ur === names.bn === names.fr === ... === names.en === "Charikar"` (or whichever English name the row had). The SSR then dutifully read `names.ur` and rendered the Latin English string as if it were the Urdu city name.

Per the data-source audit, **all 1,755 GeoNames-pipeline-imported curated rows** carry this fillchain leftover. The 581 hardcoded seed rows are unaffected because they were entered with full manual translations at seed-creation time, BEFORE `fillLangMap` ran.

---

## What was changed

### File: `scripts/geodata/_geonames_common.mjs`

`fillLangMap` redesigned (+34 / -2 lines, mostly documentation comments):

```js
// PLACE-NAMES-L10N-PIPELINE-GUARD-1 (2026-05-18) — pipeline-guard redesign
export const SUPPORTED_LANGS = ['ar','en','fr','de','tr','ur','id','es','bn','ms'];
export function fillLangMap(partial, fallback) {
    const out = {};
    out.en = (partial && partial.en) ? partial.en : fallback;
    if (partial && partial.ar) out.ar = partial.ar;
    for (const l of SUPPORTED_LANGS) {
        if (l === 'en' || l === 'ar') continue;
        if (partial && partial[l]) out[l] = partial[l];
    }
    return out;
}
```

**The new contract** (the same one §1 of the data-source audit recommended):

| Slot | Old behavior | New behavior |
|---|---|---|
| `en` | filled from `fallback` if absent | **same** — always present |
| `ar` | filled from `fallback` if absent | **only if explicitly in `partial`** |
| `fr`/`de`/`tr`/`ur`/`id`/`es`/`bn`/`ms` | filled from `fallback` (the root bug) | **only if explicitly in `partial`** |

**`ar` semantics changed slightly**: previously `fillLangMap` would set `names.ar = fallback` when `partial.ar` was missing. Now `names.ar` is absent in that case. This is fine because Stage 3.5 (`arabic_quality_check.mjs`) already enforces Arabic-name presence on high-tier wave rows; an absent `names.ar` at this point is a Stage-2 input gap that should surface as a Stage 3.5 quality flag, not be silently masked by Stage 2.

---

## What was NOT changed

This is a **build-time-only** change with strict scope discipline:

| Aspect | Touched? |
|---|:-:|
| `server.js` | ✗ untouched |
| `js/app.js` | ✗ untouched |
| `index.html` | ✗ untouched |
| `css/style.css` | ✗ untouched |
| `db/places/curated-places.json` | ✗ untouched |
| Any client-side rendering | ✗ untouched |
| The 1,755 existing fillchain rows | ✗ unchanged |
| The 581 seed rows | ✗ unchanged |
| Any new `names.ur` / `names.bn` added | ✗ none |
| `namesProvenance` field | ✗ not introduced |
| Absence-state UI | ✗ not introduced |
| Runtime translation | ✗ not used |
| Runtime fallback (ar→ur, etc.) | ✗ not used |

---

## Scope verification

```
$ git diff server.js js/app.js index.html css/style.css db/places/curated-places.json
(empty — 5 production files untouched)

$ git diff --stat scripts/geodata/_geonames_common.mjs
 scripts/geodata/_geonames_common.mjs | 36 ++++++++++++++++++++++++++++++++++--
 1 file changed, 34 insertions(+), 2 deletions(-)
```

Plus one new test file: `scripts/_test_fill_lang_map.mjs`.

---

## Tests — **1,331 / 1,331 zero failures**

### NEW unit test: `_test_fill_lang_map.mjs` — **11 / 11**

Asserts the new pipeline-guard contract directly against the function:

```
✓ only { en, ar } provided → output has en + ar ONLY (no ur/bn/fr/de/es/tr/id/ms fillchain)
✓ only { en } provided → output has en ONLY
✓ empty partial + fallback → output has en === fallback ONLY
✓ null partial + fallback → output has en === fallback ONLY
✓ all 10 langs provided → all 10 preserved verbatim (no drops, no overwrites)
✓ partial { en, ar, ur } → all three preserved; rest absent
✓ partial with names.ur === names.en (explicit Latin) → preserved as-is (caller responsibility)
✓ the original CALLER (normalize_places) pattern no longer produces fillchain
✓ the test for Charikar specifically: names.ur !== names.en (the user-reported bug)
✓ SUPPORTED_LANGS exports correctly (10 langs in expected order)
✓ fillLangMap returns an object (never null/undefined)
```

### Carry-forward suites (all green — runtime is unaffected because `fillLangMap` is build-time-only)

| Suite | Result |
|---|:-:|
| `_test_asia_1g_af_mcf_search.mjs` (لشكر جاه critical) | 18 / 18 + critical PASS |
| `_test_asia_1g_af_search.mjs` (clean wave) | 24 / 24 |
| `_test_asia_1g_ir_search.mjs` (قائم شهر critical) | 19 / 19 + critical PASS |
| `_test_asia_1h_mcf_search.mjs` (kg/manas critical) | 39 / 39 + critical PASS |
| `_test_place_by_slug.mjs` | 44 / 44 |
| `_test_city_page_l10n.mjs` | 156 / 156 |
| `_test_search_place_endpoint.mjs` | 659 / 659 |
| `_verify_place_slug_fix_production.mjs` | 338 / 338 |
| `_test_persian_pregate_design.mjs` | 23 / 23 |

All 4 critical name resolutions still work exactly as at ca78809:
```
✓ قندهار → af/kandahar
✓ لشكر جاه → af/lashkar-gah
✓ قائم شهر → ir/qaem-shahr
✓ ماناس → kg/manas
```

This was the predicted outcome: because the change is build-time-only, no runtime read-path is affected. The 2,336 curated rows are byte-identical before and after this commit.

---

## Why this fix is safe

1. **Only one file modified.** `_geonames_common.mjs` is a build-time helper for the GeoData pipeline. Not loaded by `server.js`, not bundled into `js/app.js`.
2. **No runtime callers.** `grep fillLangMap` returns hits only in `_geonames_common.mjs` (definition) and `normalize_places.mjs:95` (the only caller, Stage 2 build-time).
3. **No data mutation.** The function is pure — input → output. It never writes anywhere on its own.
4. **Seed rows unchanged.** The 581 hand-entered rows already have full per-lang names; `fillLangMap` was never called on them. They keep their Urdu/Bengali/French/etc.
5. **Pipeline rows unchanged.** The 1,755 existing rows have already been written to `curated-places.json` — they remain exactly as they were. The fillchain leftovers persist in those rows until a future enrichment batch replaces them.
6. **Future waves benefit immediately.** The next time any country's wave runs Stage 2 → Stage 4 (e.g. a future `PLACE-NAMES-UR-AF-1` won't run Stage 2 because data is already merged, but `CURATED-GEODATA-ASIA-1D` etc. would benefit), the new fillLangMap shape will be used and no fillchain rows will be added.

---

## Expected behavior of future waves

When the next GeoNames wave runs (e.g. a hypothetical CURATED-GEODATA-ASIA-1D for India/Pakistan/Bangladesh), Stage 2 will produce rows like:

```jsonc
// New wave row (post-pipeline-guard)
{
    "slug": "rawalpindi",
    "countryCode": "pk",
    "names": {
        "ar": "روالبندي",
        "en": "Rawalpindi"
        // No fr/de/tr/ur/id/es/bn/ms entries — absent unless GeoNames had them
    },
    ...
}
```

Compare with the old wave shape:

```jsonc
// Old wave row (pre-pipeline-guard) — the bug
{
    "slug": "rawalpindi",
    "countryCode": "pk",
    "names": {
        "ar": "روالبندي",
        "en": "Rawalpindi",
        "fr": "Rawalpindi",   // ← fillchain
        "de": "Rawalpindi",   // ← fillchain
        "ur": "Rawalpindi",   // ← fillchain (Latin in Urdu slot — the bug)
        "bn": "Rawalpindi",   // ← fillchain (Latin in Bengali slot — the bug)
        ...
    }
}
```

After this commit, the new shape applies to all future waves. The existing 1,755 fillchain rows stay as they are until per-country enrichment batches address them.

---

## What this phase did NOT do (per user direction)

- ❌ NO data changes — `db/places/curated-places.json` is byte-identical
- ❌ NO server.js / js/app.js / index.html / css/style.css changes
- ❌ NO new `names.ur` or `names.bn` entries added
- ❌ NO `namesProvenance` field introduced
- ❌ NO absence-state UI
- ❌ NO `PT-LANG-GUARD-1-EXTEND-UR-BN` (client guard) — not needed per the data-source audit
- ❌ NO runtime translation, no runtime fallback
- ❌ NO strip of existing fillchain rows
- ❌ NO new phases started

---

## Held (per user direction)

- ❌ `PLACE-NAMES-UR-AF-1` (next phase — 36 AF cities Urdu enrichment, using GeoNames Persian/Urdu alternatenames + the same review workflow as the rolled-back attempt)
- ❌ Iran / Pakistan / India / Bangladesh Urdu batches
- ❌ Bengali batches
- ❌ Latin-script lang exonyms
- ❌ ASIA-1D / ASIA-1F / AMERICAS-1B-MCF
- ❌ Western Sahara
- ❌ Search-ranking improvement
- ❌ Alias enrichment
- ❌ DELETE-V1

**PLACE-NAMES-L10N-PIPELINE-GUARD-1 CLOSED. Awaiting user direction.**
