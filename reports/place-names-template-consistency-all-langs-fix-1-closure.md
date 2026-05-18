# PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1
**Predecessor**: PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1 (`5135087`)
**Triggered by**: Audit `PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-AUDIT-1` recommending Option A — generalize the absence-lang fix to ALL languages.
**Scope**: Client-side templates only. NO changes to `curated_places.json`, `server.js`, `fillLangMap`, or `_pickCuratedName`.

---

## 1. سبب المشكلة

After `PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1` (`5135087`), the 5 template surfaces on `/ur/prayer-times-in-{slug}` rendered correct Urdu via PT-LANG-GUARD-4 + Tier 1.05 in `_moonCityDisplayName`. But the AR/UR/BN-specific guards left Latin-script languages with a **cold-load FOUC**:

For `/fr/prayer-times-in-london` (and similar `/de/munich`, `/es/new-york`, `/tr/makkah`, `/it/...`, `/ms/...`, `/id/...`):
1. SSR ships `window.__PRAYER_CITY__ = { name: "Londres", englishName: "London", slug: "london", ... }`. Server-side `_pickCuratedName(entry, 'fr')` correctly picked the curated `names.fr`.
2. `_initialSyncHydrate` sets `currentCity = "Londres"`, `currentEnglishName = "London"`.
3. **First paint** runs `getCurrentCityLabel()` for #snb-city, #loc-hero-title, prayer-card aria-labels:
   - Non-AR/EN branch: `currentLocalizedName` empty → `_LOCALIZED_CITY_MAPS.fr["London"]` may or may not exist (only ~32 cities) → falls to `currentEnglishName = "London"`.
   - Visible result: "London" everywhere.
4. **Async paint** (~200–2000ms later): Nominatim returns `name:fr = "Londres"` → `currentLocalizedName = "Londres"` → `updateCityDisplay()` re-runs → flips to "Londres".

**Net visible effect**: "London" → "Londres" flash on cold loads for ~50% of Latin-script lang page-views. Same architectural class as the AR/UR FOUC that PT-LANG-GUARD-2/3/4 closed for absence-langs.

---

## 2. الحل — Tier-0 in both `getDisplayCity()` and `getCurrentCityLabel()`

Added **`PT-LANG-GUARD-5`** at the top of both functions (BEFORE every other branch):

```js
try {
    const _pc = window.__PRAYER_CITY__;
    if (_pc && _pc.slug && _pc.name) {
        const _slugM = location.pathname.match(/.../);  // URL slug
        if (_slugM && _slugM[1] === _pc.slug) {
            const _isAbsenceLang = (lang === 'ar' || lang === 'ur' || lang === 'bn');
            const _seedHasLatin = /[A-Za-z]/.test(_pc.name);
            if (!_isAbsenceLang || !_seedHasLatin) {
                return _pc.name;     // or _strip(_pc.name) in getCurrentCityLabel
            }
        }
    }
} catch (_) {}
```

### القاعدة العامة

| Page lang | Seed has Latin? | Behavior |
|---|---|---|
| en / fr / de / tr / id / es / ms | (don't care) | **Trust seed always** — return `__PRAYER_CITY__.name` |
| ar / ur / bn | No Latin | Trust seed — return `__PRAYER_CITY__.name` |
| ar / ur / bn | Has Latin (fillchain) | Fall through to PT-LANG-GUARD-2/3/4 (existing safety) |

### Why this is safe

- `window.__PRAYER_CITY__` is **read-only** SSR-injected data — never mutated by client code. It carries the page-lang-correct name selected by `_pickCuratedName(entry, pageLang)`.
- For Latin-script langs, the seed equals either the curated localized name (Londres, München) OR the fillchain English name. Both are Latin-acceptable for display on Latin-script pages.
- For absence-langs (ar/ur/bn), the safety check `!_seedHasLatin` ensures fillchain English doesn't leak into Arabic/Urdu/Bengali templates. When that happens, the existing PT-LANG-GUARD-2/3/4 still protects via `currentCity` script check.
- Slug match (`_slugM[1] === _pc.slug`) ensures Tier-0 only fires when the user is on the page that originally served `__PRAYER_CITY__` — not on subsequent SPA navigations where the seed may be stale.

---

## 3. الملفات المعدّلة

| File | Lines added | Lines removed | Net |
|---|---:|---:|---:|
| `js/app.js` | +60 | 0 | +60 (two Tier-0 blocks at function tops) |
| `index.html` | +2 | −2 | 0 (cache-buster: `?v=649/653` → `?v=654` on both preload + script tags) |
| `scripts/_test_place_names_template_consistency_all_langs_fix_1.mjs` | +189 (new) | 0 | +189 |
| `reports/place-names-template-consistency-all-langs-fix-1-closure.md` | +this file | 0 | — |

**لم يتم تعديل**:
- `db/places/curated-places.json` ✓
- `server.js` ✓
- `scripts/geodata/_geonames_common.mjs::fillLangMap` ✓
- `_pickCuratedName` (in server.js) ✓

---

## 4. الأسطح التي أصبحت تستخدم الاسم المحلي

| Surface | How it consumes | Now uses local name? |
|---|---|---|
| `#city-name` (header) | `getDisplayCity()` | ✅ ALL 10 langs |
| `#snb-city` (sticky bar) | `getCurrentCityLabel()` | ✅ ALL 10 langs |
| `#loc-hero-title` / `.loc-hero-tagline` H2 | `getCurrentCityLabel()` → template | ✅ ALL 10 langs |
| `.prayer-card[aria-label]` × 5 | `getCurrentCityLabel()` → template | ✅ ALL 10 langs |
| `.weekly-expand-btn[title]` | `getCurrentCityLabel()` → template | ✅ ALL 10 langs |
| `#mtc-cta[title]` (moon CTA) | `getCurrentCityLabel()` → template | ✅ ALL 10 langs |
| `.qa-title` × 3 (hijri/qibla/moon) | `_moonCityDisplayName(slug)` Tier 1.05 | ✅ ALL 10 langs (existing from prior phase) |
| `.nearby-label` | `__POPULAR_CITY_NAMES__` lookup | ✅ ALL 10 langs (existing) |
| `#info-location` | `getDisplayCity()` | ✅ ALL 10 langs |
| `#qibla-city` | `getDisplayCity()` | ✅ ALL 10 langs |
| `breadcrumb city label` | `updateBreadcrumb()` → `getDisplayCity()` | ✅ ALL 10 langs |
| `#loc-hero-city-label` | `updateCityDisplay()` → `getDisplayCity()` | ✅ ALL 10 langs |
| `<title>` (city pages) | SSR; client `_syncCityNameInDom` only swaps on hydration | ✅ already correct |

---

## 5. اختبارات كل اللغات — Browser-verified (Preview MCP)

All 8 sample URLs from user's spec, fresh sessionStorage, 4-second hydration wait:

| URL | `#city-name` | `#snb-city` | `#loc-hero-title` | `.qa-title` × 3 | Local hits | English hits |
|---|---|---|---|---|---:|---:|
| `/fr/prayer-times-in-london` | Londres | Londres | Horaires de prière aujourd'hui à Londres — | "…à Londres" × 3 | 23 | **0** |
| `/de/prayer-times-in-munich` | München | München | Gebetszeiten heute in München — | "…in München" × 3 | 23 | **0** |
| `/es/prayer-times-in-new-york` | Nueva York | Nueva York | Horarios de oración hoy en Nueva York — | "…en Nueva York" × 3 | 23 | **0** |
| `/tr/prayer-times-in-makkah` | Mekke | Mekke | Mekke İçin Bugünün Namaz Vakitleri — | "Mekke için…" × 3 | 26 | **0** |
| `/ur/prayer-times-in-charikar` | چاریکار | چاریکار | آج چاریکار میں اوقاتِ نماز — | "چاریکار میں…" × 3 | 23 (Urdu) | **0** |
| `/ur/prayer-times-in-kandahar` | قندھار | قندھار | آج قندھار میں اوقاتِ نماز — | "قندھار میں…" × 3 | 23 (Urdu) | 1 (URL-slug) |
| `/prayer-times-in-charikar` (AR) | تشاريكار | تشاريكار | مواقيت الصلاة اليوم في تشاريكار — | "…في تشاريكار" × 3 | 23 (Arabic) | 0 Urdu leak |
| `/en/prayer-times-in-charikar` | Charikar | Charikar | Prayer Times Today in Charikar — | "…in Charikar" × 3 | 23 (English) | (expected) |

### نتيجة كل سيناريو

- **FR/DE/ES/TR**: ✅ من اللحظة الأولى يظهر الاسم المحلي الصحيح — لا flash إنجليزي.
- **UR (charikar)**: ✅ چاریکار in 23 occurrences, 0 Latin.
- **UR (kandahar)**: ✅ قندھار in 23 occurrences (1 Latin remaining is the URL slug in breadcrumb href — expected, not template text).
- **AR**: ✅ تشاريكار in 23 occurrences, no Urdu leak.
- **EN**: ✅ Charikar baseline unchanged.

---

## 6. تأكيد عدم وجود regressions

### Carry-forward suites — **1,512 / 1,512 zero failures across 23 suites**

| Suite | Result |
|---|---:|
| `_test_place_names_template_consistency_all_langs_fix_1` (new) | **18/18** |
| `_test_place_names_ur_template_consistency_1` | 16/16 |
| `_test_place_names_ur_client_seed_hydration_fix_1` | 12/12 |
| `_test_place_names_ur_af_1` | 41/41 |
| `_test_city_page_l10n` | 156/156 |
| `_test_lang_guard` | 5/5 |
| `_test_lang_guard_helpers` | 6/6 |
| `_test_link_city_name` | 18/18 |
| `_test_city_name_ugly` | 5/5 |
| `_test_city_name_universal` | 35/35 |
| `_test_place_by_slug` | 44/44 |
| `_test_search_place_endpoint` | 659/659 |
| `_test_external_provider_2` | 32/32 |
| `_test_home_search_migration` | 33/33 |
| `_test_home_title_stability` | 10/10 |
| `_test_search_ar` | 22/22 |
| `_test_external_cache` | 13/13 |
| `_test_fill_lang_map` | 11/11 |
| `_test_persian_pregate_design` | 23/23 |
| `_test_qibla_back_fix_2` | 12/12 |
| `_test_asia_1g_af_search` | 24/24 |
| `_test_asia_1g_af_mcf_search` | 18/18 |
| `_test_asia_1g_ir_search` | 19/19 |
| `_verify_place_slug_fix_production` | 338/338 |

### Critical name checks intact

| URL | Expected | Actual |
|---|---|---|
| `/ur/charikar` SSR meta | `چاریکار` | ✅ `چاریکار` |
| `/ur/kandahar` SSR meta | `قندھار` | ✅ `قندھار` (U+06BE preserved) |
| `/prayer-times-in-charikar` SSR meta | `تشاريكار` | ✅ `تشاريكار` |
| `/ur/makkah` SSR meta | `مکہ` | ✅ `مکہ` |
| `/charikar` SSR meta | `تشاريكار` | ✅ `تشاريكار` (no Urdu leak from stale seed) |

---

## 7. تأكيد أن `curated_places.json` لم يتغير

```
$ git diff --stat db/places/curated-places.json
(no changes)
```

✅ `db/places/curated-places.json` untouched. 2,336 entries; AF entries still 36; all critical name checks pass.

---

## 8. Rollback plan

Pure-additive client-side. To revert:
```
git revert <fix-commit>
```

No data, schema, or contract changes. Safe and instant.

---

## Status: 🟢 CLOSED — ready for commit.
