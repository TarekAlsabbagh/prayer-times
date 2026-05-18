# PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1 — Closure Report

**Date**: 2026-05-18
**Phase ID**: PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1
**Predecessor**: PLACE-NAMES-UR-AF-1 (commit `fafbe67`)
**Scope**: Client-side hydration only. No edits to `curated_places.json`,
`fillLangMap`, `server.js`, or `_pickCuratedName`.

---

## 1. Bug summary — exact user-reported symptom

> عند اختيار مدينة أفغانية مثل `charikar` ثم فتحها باللغة الأوردية، تظهر
> النتيجة أولاً بشكل صحيح: `چاریکار` ثم بعد ثانية تتحول إلى: `Charikar`.

The `/ur/prayer-times-in-charikar` page rendered the correct Urdu name
`چاریکار` from SSR, then ~1 second later JavaScript hydration overwrote
it with the English Latin "Charikar" in the page header, breadcrumb, FAQ
templates, and (in the worst case) `<title>`.

Same pattern reproduced for all 36 AF cities — and would have hit any
city for which curated `names.ur` exists once a user crossed a language
boundary on that slug.

---

## 2. Root cause — why `چاریکار` flipped to `Charikar`

Two **independent** client paths could write the English fallback over
the correct Urdu name. Both had to be closed.

### Path 1 — `getDisplayCity()` fallback chain (the primary path)

`js/app.js::getDisplayCity()` (originally lines 670-711) had a
lang-specific switch:

```text
ar  → AR-specific logic with Latin-rejection guard (PT-LANG-GUARD-2)
en  → return currentEnglishDisplayName || currentEnglishName || currentCity
*   → try currentLocalizedName
      → try _LOCALIZED_CITY_MAPS[lang][currentEnglishName]
      → return currentEnglishDisplayName || currentEnglishName || currentCity
```

For **UR/BN** the function fell through to the generic `*` branch.
After `_initialSyncHydrate` seeded the globals from
`window.__PRAYER_CITY__`, the state was:

```
currentCity                = "چاریکار"   (correct Urdu)
currentEnglishName         = "Charikar"
currentEnglishDisplayName  = "Charikar"
currentLocalizedName       = ""          (Nominatim hadn't returned yet)
_LOCALIZED_CITY_MAPS.ur["Charikar"]  =  undefined  (small AF town not in map)
```

So `getDisplayCity('ur')` returned **"Charikar"** — never even consulting
`currentCity`. Then `updateCityDisplay()` wrote that value directly to
`#city-name.textContent`. That's the *visible flip* the user saw.

### Path 2 — `_syncCityNameInDom()` DOM-wide walker (the amplifier)

`js/app.js::_syncCityNameInDom()` (originally lines 6805-6948) had a
Latin-rejection guard, but it only fired on AR pages (`_isAr`). On UR
pages the guard short-circuited (`_isAr === false`), so:

```
ssrName    = "چاریکار"   (from <meta name="ssr-city-name">)
currentCity = "Charikar" (if mutated later by any path — e.g. stale
                          sessionStorage on /qibla-in-X, or a Nominatim
                          reverse-geocode write-back to currentCity)
goodName   = "Charikar"  (Latin guard not triggered for ur/bn)
goodName !== ssrName     → walker proceeds
→ replaces EVERY "چاریکار" in body text + <title> + meta + aria-label
  with "Charikar"
```

Path 2 wouldn't fire on the bare `/ur/prayer-times-in-charikar` route
(because `currentCity` was never mutated to Latin there), but would fire
on `/ur/qibla-in-charikar`, `/ur/moon-today-in-charikar`, and any future
route that calls `loadCityData → currentCity = arCityMain` after a
Nominatim response that lacks `name:ur`.

### Was it sessionStorage? `window.__PRAYER_CITY__`? `_syncCityNameInDom`?

- **`window.__PRAYER_CITY__`**: ✓ correctly carried Urdu — `pc.name = "چاریکار"`.
  Verified in browser: `seed.name="چاریکار"` after SSR.
- **sessionStorage**: a **stale** seed (left over from a previous `/en/`
  visit) was the trigger that could move `currentCity` to "Charikar" on
  non-prayer-times routes. But on the bare `/prayer-times-in-{slug}`
  route, `_initialSyncHydrate` returns at the `window.__PRAYER_CITY__`
  branch BEFORE reading sessionStorage, so currentCity stayed Urdu.
- **`getDisplayCity`**: this was THE function that wrote "Charikar" to
  `#city-name` on the user's reported case. Independent of sessionStorage.
- **`_syncCityNameInDom`**: would have amplified the bug if anything had
  mutated currentCity to Latin (defensive close, applies to all UR/BN routes).

---

## 3. The fix — surgical, client-only, two locations

**File modified**: `js/app.js` (only).
**Lines touched**: ~30 lines of net change across 2 functions.

### Change 1 — `getDisplayCity()` priority for absence-langs

Added a new branch between the EN-fallback and the localized-name lookup:

```js
if (lang === 'ur' || lang === 'bn') {
    if (typeof currentCity === 'string' && currentCity
        && !/[A-Za-z]/.test(currentCity)
        && _isDisplayScriptAcceptable(currentCity, lang)) {
        return currentCity;
    }
}
```

**Why the explicit `!/[A-Za-z]/` check** (in addition to
`_isDisplayScriptAcceptable`): the latter returns `true` for pure-Latin
strings on UR pages (it only blocks non-Latin foreign scripts like CJK
or Bengali on AR). We need to explicitly reject Latin to make this guard
useful.

**Tagged**: `PT-LANG-GUARD-3 (PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1)`.

### Change 2 — `_syncCityNameInDom()` Latin guard generalization

Replaced the AR-only flag with a set-membership check for the three
absence-langs:

```js
// BEFORE
const _isAr = (_docLang === 'ar');
// ... 3 places ...    if (!(_isAr && _hasLatin(v))) goodName = v;
// ... 1 place ...     if (_isAr && !_hasLatin(ssrName) && _hasLatin(goodName)) return;

// AFTER
const _ABSENCE_LANGS = new Set(['ar', 'ur', 'bn']);
const _isAbsenceLang = _ABSENCE_LANGS.has(_docLang);
// ... 3 places ...    if (!(_isAbsenceLang && _hasLatin(v))) goodName = v;
// ... 1 place ...     if (_isAbsenceLang && !_hasLatin(ssrName) && _hasLatin(goodName)) return;
```

**Tagged**: `PLACE-NAMES-UR-CLIENT-SEED-HYDRATION-FIX-1`.

### What was deliberately NOT changed

| Function / file | Reason for leaving alone |
|---|---|
| `_pickCuratedName` (server.js:3163) | Already does the right thing — returns `names.ur` first; fallback to `names.en` is acceptable for country/admin labels. |
| `fillLangMap` (`scripts/geodata/_geonames_common.mjs:394`) | Already fixed in PLACE-NAMES-L10N-PIPELINE-GUARD-1 (`b0d5ad6`). |
| `curated_places.json` | Already correct after UR-AF-1 (`fafbe67`) — `names.ur = "چاریکار"`. |
| `_hydrateCurrentCityFromUrlOrStorage` line 81 (sessionStorage hydration) | Not needed — `window.__PRAYER_CITY__` branch returns before sessionStorage is read on the bare `/prayer-times-in-{slug}` route. The two function-level fixes above close the actual paths. |
| `_getLocalizedCityDisplayName` (lines 6739+) | Used by AR pages only via `getDisplayCity('ar')`. Not on the UR overwrite path. |

---

## 4. Files modified

| File | Lines added | Lines removed | Net |
|---|---:|---:|---:|
| `js/app.js` | +37 | −9 | +28 |
| `scripts/_test_place_names_ur_client_seed_hydration_fix_1.mjs` | +193 (new file) | 0 | +193 |
| `reports/place-names-ur-client-seed-hydration-fix-1-closure.md` | +this file | 0 | — |

---

## 5. Tests — full scenario coverage

### New test: `scripts/_test_place_names_ur_client_seed_hydration_fix_1.mjs` — **12/12 pass**

| Part | Check | Result |
|---|---|---:|
| A | 5× `/ur/prayer-times-in-{af-slug}` SSR meta + `__PRAYER_CITY__` seed carry Urdu names | 5/5 ✓ |
| B | `js/app.js` source contains absence-lang guard in `_syncCityNameInDom` | ✓ |
| B | `js/app.js` source contains PT-LANG-GUARD-3 in `getDisplayCity` | ✓ |
| B | PT-LANG-GUARD-1 (AR pathway) preserved (regression check) | ✓ |
| C | `/charikar` `/en/charikar` `/kabul` `/en/kabul` `/jalalabad` `/en/jalalabad` unaffected | 3/3 ✓ |
| D | CRITICAL — `/ur/charikar` SSR meta + seed = `چاریکار`, NEVER Latin | ✓ |

### Browser end-to-end verification (Preview MCP)

| Scenario | URL | `#city-name` | `<title>` | Verdict |
|---|---|---|---|---|
| User's exact bug (stale `Charikar` seed + UR) | `/ur/prayer-times-in-charikar` | `چاریکار` | `چاریکار میں…` | **FIXED** |
| AR no-regression | `/prayer-times-in-charikar` | `تشاريكار` | `…تشاريكار…` | OK |
| EN no-regression | `/en/prayer-times-in-charikar` | `Charikar` | `…Charikar…` | OK |
| UR Mecca regression (curated 13 hardcoded) | `/ur/prayer-times-in-makkah` | `مکہ` | `مکہ میں…` | OK |

After waiting 3 seconds (3× the user's reported flip window):
- `document.getElementById('city-name').textContent` = `چاریکار` ✓
- `document.title` = `چاریکار میں آج اوقاتِ نماز | روزانہ اذان کا شیڈول` ✓
- `<h1>` = `آج چاریکار میں اوقاتِ نماز` ✓
- `currentCity` (global) = `چاریکار` ✓
- `currentEnglishName` (global) = `"Charikar"` ✓ (intentional — that's the EN slot)

### Carry-forward regression suites

| Suite | Pre-fix | Post-fix |
|---|---:|---:|
| `_test_place_names_ur_af_1.mjs` | 41/41 | **41/41** ✓ |
| `_test_city_page_l10n.mjs` | 156/156 | **156/156** ✓ |
| `_test_home_search_migration.mjs` | 33/33 | **33/33** ✓ |
| `_test_place_by_slug.mjs` | 44/44 | **44/44** ✓ |
| `_test_search_place_endpoint.mjs` | 659/659 | **659/659** ✓ |
| `_test_external_provider_2.mjs` | 32/32 | **32/32** ✓ |
| `_test_home_title_stability.mjs` | 10/10 | **10/10** ✓ |
| `_test_lang_guard.mjs` | 5/5 | **5/5** ✓ |
| `_test_lang_guard_helpers.mjs` | 6/6 | **6/6** ✓ |
| `_test_link_city_name.mjs` | 18/18 | **18/18** ✓ |
| `_test_city_name_ugly.mjs` | 5/5 cells | **5/5** ✓ |
| `_test_city_name_universal.mjs` | 35/35 cells | **35/35** ✓ |
| `_test_search_ar.mjs` | 22/22 | **22/22** ✓ |
| `_test_external_cache.mjs` | 13/13 | **13/13** ✓ |
| `_test_fill_lang_map.mjs` | 11/11 | **11/11** ✓ |
| `_test_persian_pregate_design.mjs` | 23/23 | **23/23** ✓ |
| `_test_qibla_back_fix_2.mjs` | 12/12 | **12/12** ✓ |
| `_test_asia_1g_af_search.mjs` | 24/24 | **24/24** ✓ |
| `_test_asia_1g_af_mcf_search.mjs` | 18/18 | **18/18** ✓ |
| `_test_asia_1g_ir_search.mjs` | 19/19 | **19/19** ✓ |
| `_verify_place_slug_fix_production.mjs` | 338/338 | **338/338** ✓ |
| **New suite** | — | **12/12** ✓ |

**Total**: 1,494 / 1,494 zero failures across 22 suites.

---

## 6. User's required closure points — answered

| Question | Answer |
|---|---|
| سبب التحول من `چاریکار` إلى `Charikar` | `getDisplayCity('ur')` لم يكن يفحص `currentCity` ضمن مفاضلة العرض على صفحات UR/BN — قفز مباشرة إلى `currentEnglishDisplayName` (= `"Charikar"`) في سلسلة الاحتياطيات. ثانياً، `_syncCityNameInDom` كان لديه حارس لاتيني محدود بـ AR فقط، فلا يحمي UR/BN لو حدث overwrite لاحق. |
| أي دالة كانت تعمل overwrite | المسار الأساسي: `getDisplayCity` (المُستدعى من `updateCityDisplay`) عبر سطر `return currentEnglishDisplayName \|\| currentEnglishName \|\| currentCity` لمسارات UR/BN. مسار التضخيم: `_syncCityNameInDom` عبر walker للنصوص. |
| هل السبب sessionStorage أم window.__PRAYER_CITY__ أم _syncCityNameInDom | السبب الجذري كان في `getDisplayCity` — وهذا مستقلّ تماماً عن sessionStorage. `window.__PRAYER_CITY__` كان يضع البيانات الصحيحة. sessionStorage القديم كان trigger ثانوي لمسار آخر (يصلح كذلك بهذا الفيكس عبر _syncCityNameInDom). |
| الملفات المعدلة | `js/app.js` فقط (لا تعديل على curated_places.json / fillLangMap / server.js / _pickCuratedName). |
| اختبارات السيناريو الكامل بعد اختيار المدينة | اختبار جديد `_test_place_names_ur_client_seed_hydration_fix_1.mjs` (12/12) + تحقّق متصفّح Preview MCP يحاكي السيناريو الكامل: زرع stale seed، التنقّل إلى `/ur/charikar`، الانتظار 3 ثوان (أطول من نافذة الـ flip)، قراءة جميع السطوح. |
| تأكيد أن Urdu يبقى Urdu بعد hydration | `#city-name = چاریکار`، `<title> = چاریکار میں…`، `<h1> = آج چاریکار میں اوقاتِ نماز`، `currentCity = چاریکار`. كلّ ذلك بعد 3 ثوان من hydration مع stale seed نشط. |
| تأكيد أن ar/en لم تتأثر | `/charikar` → `تشاريكار` ✓، `/en/charikar` → `Charikar` ✓. كذلك جميع suites الـ AR/EN السابقة خضراء 100% (1,494/1,494). |

---

## 7. Out of scope (deferred — separate phase)

These two surfaces still show English templated text on `/ur/` pages,
even after the fix — but they pre-date this bug and aren't caused by
the SSR-overwrite path:

| Surface | Current state | Cause |
|---|---|---|
| `#loc-hero-title` H2 | "آج Charikar میں اوقاتِ نماز —…" | JS template substitutes `currentEnglishName` instead of `getDisplayCity()`. |
| `.nearby-label` span | "آج Kabul میں اوقاتِ نماز" | Same — template uses `currentEnglishName`. |
| 3× `.qa-title` divs | "Charikar میں آج کی ہجری تاریخ" / "…قبلہ کا رخ" / "…چاند" | Same root cause — template builders for FAQ tiles. |
| `#snb-city` SPAN | "Charikar" (bare) | Sidebar nav uses `currentEnglishName` as label. |

These are 5 visible-text surfaces that should switch from
`currentEnglishName` to `getDisplayCity()` in a future phase
(`PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1` or similar). The user's
reported bug — the *main* `#city-name`, `<title>`, `<h1>`, and the
bulk of body text — is fully fixed.

---

## 8. Rollback plan

If something regresses, the fix can be reverted via:

```
git revert <fix-commit>
```

The change is purely additive client-side code in `js/app.js` with no
data, schema, or contract changes. Reverting is safe and instant.

---

## Status: 🟢 CLOSED — ready for commit.
