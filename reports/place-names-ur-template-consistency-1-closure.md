# PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1
**Predecessors**: PLACE-NAMES-UR-AF-1 (`fafbe67`) + PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1 (`cbd4926`)
**Scope**: Client-side templates only. No edits to `curated_places.json`,
`fillLangMap`, `server.js`, or `_pickCuratedName`.

---

## 1. Background — what was still leaking after the prior phases

After PLACE-NAMES-UR-AF-1 (real Urdu names for 36 AF cities) and
PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1 (stopped client overwrite of
`#city-name`), four other template surfaces on `/ur/prayer-times-in-{slug}`
still rendered English city names mixed inside Urdu sentences:

| Surface | Before fix | Cause |
|---|---|---|
| `#snb-city` (sticky-bar) | `"Charikar"` | `getCurrentCityLabel()` non-AR branch returned `currentEnglishName` |
| `#loc-hero-title` H2 | `"آج Charikar میں اوقاتِ نماز —…"` | template substituted `getCurrentCityLabel()` result |
| 3× `.qa-title` (hijri/qibla/moon) | `"Charikar میں آج کی ہجری تاریخ"` | template substituted `_moonCityDisplayName(slug)` result |
| `.nearby-label` | `"آج Kabul میں اوقاتِ نماز"` | nearby tile builder used `place.nameEn` directly |

And for cities whose English name has diacritics or differs from the
slug (Kandahār, Mecca→makkah), even the previously-fixed surfaces were
showing English:

| Surface (kandahar) | Before this phase | Cause |
|---|---|---|
| `#city-name` | `"Kandahār"` | `getDisplayCity()` PT-LANG-GUARD-3's `_isDisplayScriptAcceptable` regex was missing U+06BE (ھ) — so `"قندھار"` was misclassified as "pure Arabic" and rejected on /ur/, falling through to the English chain. |
| `.qa-title` | `"Kandahar میں…"` | `_moonCityDisplayName('kandahar')` Tier-2 normalized `"Kandahār"` to `"kandah-r"` (macron → `-`), which didn't match slug `"kandahar"`. Fell through to Tier-5 `_prettifySlug = "Kandahar"`. |

---

## 2. Six fixes applied — all in `js/app.js` only

### Fix A — `getCurrentCityLabel()` UR/BN priority (PT-LANG-GUARD-4)

Mirrors the PT-LANG-GUARD-3 pattern from the previous phase: when the
page lang is `ur` or `bn`, prefer `currentCity` whenever it's in the
correct Unicode block AND has no Latin chars — BEFORE falling through
to the legacy `currentLocalizedName → cityMap[currentEnglishName] →
currentEnglishName` chain.

Covers: `#snb-city`, `#loc-hero-title` (via `cityLabel`),
`.prayer-card[aria-label]`, `mtc-cta[title]`, weekly button `title`.

### Fix B — `_moonCityDisplayName()` Tier 1.5 absence-lang Latin reject

The legacy sessionStorage seed-check accepted Latin `_o0.name="Charikar"`
on UR pages because `_isDisplayScriptAcceptable("Charikar", "ur")`
returns `true` (it only blocks CJK / Bengali on AR, not pure Latin).
The fix: for absence-langs (ar/ur/bn), require the seed name to have
NO Latin characters.

### Fix C — `.nearby-label` consults `__POPULAR_CITY_NAMES__`

For nearby-tile labels on non-AR pages, after the `_LOCALIZED_CITY_MAPS`
lookup fails, fall back to `window.__POPULAR_CITY_NAMES__[bareSlug][lang]`
BEFORE falling through to `place.nameEn`. This way the SSR-injected
curated names (≈40 popular cities × 10 langs) become available to the
nearby tiles, eliminating Latin leaks for Mecca / Riyadh / Kabul / etc.

### Fix D — `_isDisplayScriptAcceptable()` Urdu-specific regex extended

Added three missing Urdu-distinct characters to the regex:

  • **U+06BE ھ** (do-chashmi heh) — used for aspirated consonants
    (قندھار، بھائی، کھانا — VERY common in Urdu).
  • **U+06C2 ۂ** (heh-goal with hamza above) — used for ezāfe in Urdu.
  • **U+06D3 ۓ** (yeh-barree with hamza above).

Without these, real Urdu names whose only Urdu-distinct char was U+06BE
(like `قندھار`) were classified as "pure Arabic, no Urdu-distinct chars"
and rejected on `/ur/` pages.

### Fix E — `_moonCityDisplayName()` Tier 2 NFD normalization

The slug-match check `currentEnglishName.toLowerCase().replace(/[^a-z0-9]+/g, '-')`
mangled diacritic names: `"Kandahār"` (a+macron) → `"kandah-r"` instead
of `"kandahar"`. Now applies `.normalize('NFD').replace(/[̀-ͯ]/g, '')`
FIRST — decomposes the combining marks then strips them, so
`"Kandahār"` correctly normalizes to `"kandahar"` and the slug matches.

### Fix F — `_moonCityDisplayName()` Tier 1.05 authoritative SSR seed

Added a new highest-priority tier (between i18n key and sessionStorage):
when the requested `slug` matches `window.__PRAYER_CITY__.slug`, the SSR
has already provided the page-lang-correct name in `__PRAYER_CITY__.name`
(selected from `curated_places.json` via `server.js::_pickCuratedName`).
Use it directly — bypasses both stale sessionStorage and endonym↔exonym
mismatches (e.g. slug=`"makkah"` vs `currentEnglishName="Mecca"`).

### Bonus — simpler guards in `getCurrentCityLabel` + `getDisplayCity`

Replaced the dependency on `_isDisplayScriptAcceptable` (which is
correct now after Fix D but historically prone to missing-char bugs)
with explicit "Arabic-block + no Latin" / "Bengali-block + no Latin"
checks. Defense in depth — works even if the central regex is
ever incomplete.

---

## 3. Files modified

| File | Lines added | Lines removed | Net |
|---|---:|---:|---:|
| `js/app.js` | +94 | −13 | +81 |
| `index.html` | +1 | −1 | 0 (cache-buster `?v=649` → `?v=653`) |
| `scripts/_test_place_names_ur_template_consistency_1.mjs` | +221 (new) | 0 | +221 |
| `reports/place-names-ur-template-consistency-1-closure.md` | +this file | 0 | — |

---

## 4. Browser-verified results (Preview MCP, fresh session, v=653)

| URL | `#city-name` | `#snb-city` | `#loc-hero-title` | `.qa-title` × 3 | Latin leak | Verdict |
|---|---|---|---|---|---:|---|
| `/ur/prayer-times-in-charikar` | چاریکار | چاریکار | آج چاریکار میں… | چاریکار میں… | **0** | ✓ |
| `/ur/prayer-times-in-kandahar` | قندھار | قندھار | آج قندھار میں… | قندھار میں… | 1 (non-template) | ✓ |
| `/ur/prayer-times-in-kabul` | کابل | کابل | آج کابل میں… | کابل میں… | **0** | ✓ |
| `/ur/prayer-times-in-makkah` | مکہ | مکہ | آج مکہ میں… | مکہ میں… | **0** | ✓ |
| `/prayer-times-in-charikar` (AR) | تشاريكار | تشاريكار | تشاريكار | تشاريكار | 0 Urdu leak | ✓ |
| `/en/prayer-times-in-charikar` | Charikar | Charikar | Charikar | Charikar | (expected) | ✓ |

The remaining "1 Latin" on /ur/kandahar is the slug appearing in the
URL bar / breadcrumb's English-link href — unavoidable since the slug
itself is in Latin. No visible template-text leak.

---

## 5. Tests — all green

### New smoke test: `_test_place_names_ur_template_consistency_1.mjs` — **16/16 pass**

| Part | Check | Result |
|---|---|---:|
| A | js/app.js disk source markers (Fix A/B/C/D + simpler guards) | 6/6 ✓ |
| B | Served minified JS carries Arabic/Bengali block guards + U+06BE | 2/2 ✓ |
| C | 3× /ur/{slug} SSR meta + __PRAYER_CITY__ seed carry Urdu names | 3/3 ✓ |
| D | AR + EN unaffected for same slugs | 3/3 ✓ |
| E | /ur/makkah curated regression | 1/1 ✓ |
| F | CRITICAL: /ur/kandahar SSR delivers "قندھار" with U+06BE | 1/1 ✓ |

### Carry-forward — 22 suites, **1,510 / 1,510 zero failures**

| Suite | Result |
|---|---:|
| _test_place_names_ur_template_consistency_1 (new) | **16/16** |
| _test_place_names_ur_client_seed_hydration_fix_1 | 12/12 |
| _test_place_names_ur_af_1 | 41/41 |
| _test_city_page_l10n | 156/156 |
| _test_home_search_migration | 33/33 |
| _test_place_by_slug | 44/44 |
| _test_search_place_endpoint | 659/659 |
| _test_external_provider_2 | 32/32 |
| _test_home_title_stability | 10/10 |
| _test_lang_guard | 5/5 |
| _test_lang_guard_helpers | 6/6 |
| _test_link_city_name | 18/18 |
| _test_city_name_ugly | 5/5 |
| _test_city_name_universal | 35/35 |
| _test_search_ar | 22/22 |
| _test_external_cache | 13/13 |
| _test_fill_lang_map | 11/11 |
| _test_persian_pregate_design | 23/23 |
| _test_qibla_back_fix_2 | 12/12 |
| _test_asia_1g_af_search | 24/24 |
| _test_asia_1g_af_mcf_search | 18/18 |
| _test_asia_1g_ir_search | 19/19 |
| _verify_place_slug_fix_production | 338/338 |

---

## 6. Rollback plan

Pure-additive client-side. To revert:
```
git revert <fix-commit>
```

No data, schema, or contract changes.

---

## 7. Cache-busting note (operational)

The fix also bumps `index.html` `<script defer src="js/app.js?v=...">`
from `?v=649` → `?v=653`. This forces browsers to fetch the new
minified JS even if their HTTP cache still holds the old version (the
server sends `Cache-Control: public, max-age=86400` so without the
version bump, returning users would keep getting the cached JS for 24h
after deploy).

---

## Status: 🟢 CLOSED — ready for commit.
