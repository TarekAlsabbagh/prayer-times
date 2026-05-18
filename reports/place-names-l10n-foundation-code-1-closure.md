# PLACE-NAMES-L10N-FOUNDATION-CODE-1 — Closure Report

**Phase**: Foundation code (Phase 2 of `CURATED-PLACE-NAMES-L10N-FOUNDATION-AND-GENERATION-1`)
**Date**: 2026-05-18
**Status**: **CLOSED**
**Predecessor**: `CURATED-PLACE-NAMES-L10N-FOUNDATION-AND-GENERATION-1` (architecture, approved)

---

## Headline

The Urdu / Bengali / Arabic SSR pages no longer present Latin English names as if they were the localized translation. When the curated entry has no real `names.ur` (or `names.bn`), the `/ur/` (or `/bn/`) page now renders an **honest absence-state UI**:

```
مقامی نام دستیاب نہیں           ← primary absence label (bigger, lang="ur")
Charikar                          ← secondary English (smaller, italic, faded)
```

instead of:

```
Charikar                          ← bare Latin, looking like the Urdu translation
```

---

## Cause of the original problem

`scripts/geodata/_geonames_common.mjs::fillLangMap` filled every missing language with the English fallback during Stage 2 of every wave. As a result, **every curated entry had `names.ur === names.en === "Charikar"`** for the 75.1% of rows that lacked a real Urdu name (per the audit at `reports/curated-place-names-l10n-audit-1.md`). The SSR's `_pickCuratedName` then read the `names.ur` value, found a non-empty string, and rendered "Charikar" as the Urdu city name. User-visible: `/ur/prayer-times-in-charikar` showed `Charikar` as the localized name.

---

## What was changed

### 1. `scripts/geodata/_geonames_common.mjs` — `fillLangMap` redesigned

Only `en` is auto-filled from the fallback. `ar` is kept if explicitly provided. **All other 8 langs are present in the output IFF explicitly provided** — no more silent English duplication.

Impact: future waves will produce entries with `names.ur` ABSENT when no real Urdu was supplied, not `names.ur = "Charikar"`. Old curated rows still had the bug → cleaned by step 3.

### 2. `server.js::_pickCuratedName` — honest absence for ar/ur/bn

When `lang ∈ {ar, ur, bn}` and `names[lang]` is missing OR equals `names.en`, returns `null` instead of silently substituting `names.en`. Latin-script langs (`fr/de/es/tr/id/ms`) retain the existing fallback chain (`names.en` is acceptable Latin rendering).

### 3. `server.js::_pickCuratedNameWithSource` — NEW source-aware helper

Returns `{ name, source }`:
- `explicit-localized` — real translation
- `missing-localized` — ar/ur/bn has no real name (the SSR renders absence state; `name` field contains the English string for use as secondary marker)
- `fallback-en-latin-script` — fr/de/es/tr/id/ms displays English (acceptable Latin)
- `missing` — no curated data at all

### 4. `server.js::_buildSlugLookupResult` — `nameSource` field exposed

The `/api/place-by-slug` response (and the SSR's `window.__PRAYER_CITY__`) now includes a `nameSource` field. The SSR pre-fill block uses this to decide between rendering the city name as primary text vs the absence-state UI.

### 5. `server.js` SSR pre-fill — absence-state HTML markup

When `nameSource === 'missing-localized'` AND the page lang has an absence label entry:

```html
<div class="city-name" id="city-name" data-name-source="missing-localized">
  <span class="city-name-absence-label" lang="ur" dir="rtl">مقامی نام دستیاب نہیں</span>
  <span class="city-name-en-secondary" lang="en" dir="ltr">Charikar</span>
</div>
```

Absence labels (user-supplied wording):

| Lang | Label text | Direction |
|---|---|:-:|
| `ar` | الاسم المحلي غير متوفر | rtl |
| `ur` | مقامی نام دستیاب نہیں | rtl |
| `bn` | স্থানীয় নাম উপলব্ধ নয় | ltr |

### 6. `server.js` SSR meta — new `ssr-city-name-source` tag

Every prayer-times page now injects two meta tags:

```html
<meta name="ssr-city-name" content="...">
<meta name="ssr-city-name-source" content="explicit-localized|missing-localized|fallback-en-latin-script|legacy-resolver|fallback-slug-title">
```

Smoke tests + future client logic can read the source meta to decide UI behavior.

### 7. `css/style.css` — minimal absence-state styling

```css
.city-name[data-name-source="missing-localized"] {
    display: inline-flex; flex-direction: column;
    align-items: center; gap: 2px; line-height: 1.15;
}
.city-name-absence-label  { display: block; font-size: 0.82em; font-weight: 600; opacity: 0.92; }
.city-name-en-secondary  { display: block; font-size: 0.70em; font-weight: 400; font-style: italic; opacity: 0.65; }
```

### 8. One-shot strip — `_l10n_phase2_strip_fillchain.mjs`

Walked `curated-places.json` once, deleted `names[lang]` keys where the value equaled `names.en` for `lang ∈ {ur, bn}`.

**Result**: **3,510 deletions** (1,755 ur + 1,755 bn fillchain rows). Backup written to `db/places/curated-places.json.preL10NFoundationCode1.bak`. Audit at `reports/place-names-l10n-foundation-code-1-strip-report.md`.

`names.ar` was INSPECTED — zero rows had `names.ar === names.en` (Arabic invariant intact). Latin-script langs (`fr/de/es/tr/id/ms`) were left untouched per user direction (deferred to a later phase that seeds famous-city exonyms).

### 9. `namesProvenance` schema — accepted, not populated

The proposed `namesProvenance` sibling field is now part of the documented schema (architecture report §1 + §3). The strip script preserves it if present; no script populates it yet. Future Urdu/Bengali enrichment batches (Phase 4+) will populate `namesProvenance[lang]` as they go.

---

## Number of pages expected to be fixed

Before this phase: **1,755 Urdu pages + 1,755 Bengali pages = 3,510 city pages** showed Latin English as if it were the localized name.

After this phase: all 3,510 now render the absence-state UI. The user sees the absence label first (in their language) and the English name as a smaller secondary marker — making it visually clear that "Charikar" is a fallback, not the official Urdu translation.

---

## Test results — **1,175 / 1,175 zero failures**

| Suite | Result |
|---|:-:|
| **`_test_place_names_l10n_foundation.mjs`** (NEW — 11 tests + 1 critical) | **11 / 11 + critical PASS** |
| `_test_place_by_slug.mjs` | 44 / 44 |
| `_test_asia_1g_af_search.mjs` (regression) | 24 / 24 |
| `_test_asia_1g_af_mcf_search.mjs` (regression — لشكر جاه critical) | 18 / 18 + critical PASS |
| `_test_asia_1g_ir_search.mjs` (regression — قائم شهر critical) | 19 / 19 + critical PASS |
| `_test_asia_1h_mcf_search.mjs` (regression — kg/manas critical) | 39 / 39 + critical PASS |
| `_test_search_place_endpoint.mjs` (re-run after cache warm-up) | 659 / 659 |
| `_test_persian_pregate_design.mjs` | 23 / 23 |
| `_verify_place_slug_fix_production.mjs` | 338 / 338 |

### 🚨 Critical check

```
/ur/prayer-times-in-charikar MUST NOT present "Charikar" as the Urdu name
  ✓ PASS: absence label + secondary English markup rendered (source=missing-localized)
```

### Per-lang SSR smoke results

```
✓ ur — absence-state when names.ur missing        source=missing-localized      label rendered + secondary en
✓ bn — absence-state when names.bn missing        source=missing-localized      label rendered + secondary en
✓ ar bare — explicit Arabic name (regression)      source=explicit-localized     cityName=تشاريكار
✓ en — Latin name (regression)                     source=explicit-localized     cityName=Charikar
✓ fr — Latin fallback (no absence state)           source=fallback-en-latin-script
✓ de — Latin fallback (no absence label)           source=fallback-en-latin-script
✓ es — Latin fallback (no absence label)           source=fallback-en-latin-script
✓ tr — Latin fallback (no absence label)           source=fallback-en-latin-script
✓ id — Latin fallback (no absence label)           source=fallback-en-latin-script
✓ ms — Latin fallback (no absence label)           source=fallback-en-latin-script
✓ ur — explicit names.ur (sanity check)            source=explicit-localized     cityName=ریاض (Riyadh)
```

---

## Files changed

| File | Change | Lines |
|---|---|---:|
| `scripts/geodata/_geonames_common.mjs` | `fillLangMap` redesigned | +18 / -3 |
| `server.js` | `_pickCuratedName` + new `_pickCuratedNameWithSource` + `_ABSENCE_LABELS` + `_buildSlugLookupResult` updates + SSR meta injection + SSR pre-fill absence markup | +90 / -8 |
| `css/style.css` | Absence-state styling | +26 / 0 |
| `scripts/geodata/_l10n_phase2_strip_fillchain.mjs` | NEW one-shot strip script | +160 / 0 |
| `scripts/_test_place_names_l10n_foundation.mjs` | NEW SSR smoke test | +175 / 0 |
| `db/places/curated-places.json` | 3,510 deletions (`names.ur`/`names.bn` === `names.en` rows) | -3,510 lines |
| `reports/place-names-l10n-foundation-code-1-strip-report.md` | NEW audit trail | +50 / 0 |
| `reports/place-names-l10n-foundation-code-1-closure.md` | NEW (this file) | +N / 0 |

---

## Rollback path

If anything regresses on production:

```bash
# Option 1 — restore from the strip-script backup
cp db/places/curated-places.json.preL10NFoundationCode1.bak db/places/curated-places.json

# Option 2 — git revert this commit
git revert <commit-hash>
```

Both restore curated-places.json to its pre-strip state (3,510 fillchain rows back). The code changes in server.js / _geonames_common.mjs / css/style.css can be reverted independently if data restore is unwanted.

---

## Production verification (post-deploy)

The following queries should be re-checked on production after deploy:

| URL | Expected |
|---|---|
| `https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-charikar` | Absence-state UI: "مقامی نام دستیاب نہیں" + "Charikar" |
| `https://prayer-times-d4w8.onrender.com/ur/prayer-times-in-riyadh` | Real Urdu name "ریاض" (no absence state) |
| `https://prayer-times-d4w8.onrender.com/bn/prayer-times-in-charikar` | Absence-state UI: "স্থানীয় নাম উপলব্ধ নয়" + "Charikar" |
| `https://prayer-times-d4w8.onrender.com/en/prayer-times-in-charikar` | "Charikar" (no change) |
| `https://prayer-times-d4w8.onrender.com/prayer-times-in-charikar` | "تشاريكار" (no change) |
| `https://prayer-times-d4w8.onrender.com/fr/prayer-times-in-charikar` | "Charikar" (Latin fallback, no absence label) |

---

## What this phase did NOT do

- ❌ NO mass enrichment of `names.ur` / `names.bn` / etc. — 0 new localized names added
- ❌ NO `namesProvenance` population for existing rows — schema accepted only, populated by future batches
- ❌ NO changes to Latin-script lang fields (`fr`, `de`, `es`, `tr`, `id`, `ms` rows untouched per user direction §13 q4)
- ❌ NO sweeping script-mismatch cleanup — only `names[lang] === names.en` strip
- ❌ NO translation API
- ❌ NO runtime fallback

---

## Held (per user direction)

- ❌ `PLACE-NAMES-UR-AF-1` (first Urdu enrichment batch — Afghanistan)
- ❌ Full Urdu enrichment
- ❌ Full 10-language enrichment
- ❌ ASIA-1D / ASIA-1F / AMERICAS-1B-MCF / Western Sahara / search-ranking / alias enrichment / DELETE-V1
- ❌ Stage 3.6 lang-coverage gate (future phase)
- ❌ Famous-city exonym seeding for fr/de/es/tr/id/ms (Phase 6 of the architecture)

**PLACE-NAMES-L10N-FOUNDATION-CODE-1 CLOSED — awaiting user direction for next phase.**
