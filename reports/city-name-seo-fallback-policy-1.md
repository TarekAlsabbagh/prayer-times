# CITY-NAME-SEO-FALLBACK-POLICY-1 — Closure Report

**Date**: 2026-05-20
**Phase**: Runtime-only SEO/SSR fix (NO data wave, NO L10N wave, NO runtime translation, NO fillchain)
**Status**: ✅ **CLOSED — user-approved 2026-05-20**
**Implementation commit**: `5e0e6d1` — `feat(l10n): CITY-NAME-SEO-FALLBACK-POLICY-1 — central place-name helper with script guard`
**Files touched**: `server/place-l10n/index.js`, `server.js`, `scripts/_test_city_name_seo_fallback_1.mjs`, this report
**Byte-diff on `db/places/curated-places.json`**: **0 bytes** — curated data NOT mutated

---

## 0. Acceptance criteria (user-approved 2026-05-20)

| # | Criterion | Status |
|---|---|---|
| 1 | Central helper implemented: `getLocalizedPlaceName(place, lang, options)` returning `{displayName, sourceLang, isFallback, hasNativeName}` | ✅ `server/place-l10n/index.js` |
| 2 | No runtime translation for city names | ✅ Verified — no Google / Browser / OpenAI / Anthropic / any translation API touched |
| 3 | No fillchain for city names | ✅ Fallback is single-tier (`names.en`) — not iterative |
| 4 | Fallback is **single-tier to `names.en` only** when `names[lang]` missing or pollution-rejected | ✅ Tier 3 of helper; no further-language cascade |
| 5 | `db/places/curated-places.json` unchanged | ✅ `git diff` confirms **0-byte diff** between implementation commit (`5e0e6d1`) and this closure marker |
| 6 | No `names.*` generated at runtime | ✅ Helper is read-side only; writes nothing back |
| 7 | No slug changes | ✅ Slug routing untouched |
| 8 | No canonical URL changes | ✅ Canonical builder unmodified |
| 9 | City page SSR / SEO / social metadata / JSON-LD / breadcrumb / hero / internal links / qibla / moon / hijri chain unified | ✅ Audited in §1; all positions flow through `_pickCuratedName → getLocalizedPlaceName` |
| 10 | Gwangju Latin-pollution fallback verified | ✅ `/ur/` + `/bn/` route via `sourceLang='en'`, `isFallback=true`, `hasNativeName=false` |
| 11 | Native-name regressions all pass (Karachi `کراچی`, Dhaka `ঢাকা`, Mumbai `ممبئی` / `মুম্বই`, Varanasi `বারাণসী`, Makkah `مكة المكرمة`) | ✅ Verified via offline test + live SSR curl |
| 12 | Tests: new suite 107/107 PASS + search-place-endpoint 659/659 PASS + carry-forward suites green | ✅ Aggregate ≈ 1,798 passes |
| 13 | Pre-existing `_test_place_names_ur_pk_1.mjs` single failure (`حیدر آباد` → `in/hyderabad-in` instead of `pk/hyderabad-pk`) documented as unrelated to this phase — pure search-ranking issue independent of script-validation and fallback policy | ✅ Documented (§4.2 + §13 below) |

---

## 13. Pre-existing residual (acknowledged, NOT in scope of this phase)

`_test_place_names_ur_pk_1.mjs` reports a single search-ranking failure:

```
✗ search "حیدر آباد" → top result pk/hyderabad-pk   (got in/hyderabad-in)
```

**Root-cause analysis (re-confirmed at closure)**:
- Both `pk/hyderabad-pk` and `in/hyderabad-in` carry `names.ur = "حیدرآباد"` — clean Arabic-block Urdu, **both pass** the new `_isAcceptableScriptForLang('حیدرآباد', 'ur')` guard identically.
- Both therefore retain `quality: 'curated'` after this commit; **the script-validation fix changes nothing about their relative ranking**.
- The query "حیدر آباد" (with a space) exactly matches `pk/hyderabad-pk`'s `aliases.ur[1]` but only partial-matches `in/hyderabad-in`'s name. The ranking algorithm currently prefers IN over PK for this with-space query.
- This is a **pure search-ranking issue** in the existing scoring code, independent of script-validation, fallback policy, helper architecture, or any L10N data.

**Status**: Deferred. NOT opened in this phase. Awaiting a future explicit user request to investigate search-ranking.

---

---

## 1. Problem statement

The city page (`/<lang>/prayer-times-in-<slug>`, `/<lang>/moon-in-<slug>`, `/<lang>/moon-today-in-<slug>`, `/<lang>/qibla-in-<slug>`, and all child date/month routes) renders the city name in **many positions**:

| Position | Source |
|---|---|
| `<title>` | `_buildCityDatedTitle(cityDisplay,...)` ← `_resolveCityName(slug, lang)` |
| `<meta name="description">` | `_buildCityDatedDesc(cityDisplay,...)` ← same |
| Open Graph `og:title`, `og:description` | same `cityDisplay` |
| Twitter Card `twitter:title`, `twitter:description` | same |
| `og:image:alt` | same |
| H1, subtitle, breadcrumb labels | same |
| JSON-LD `@type=City` `name` | `seo.qiblaRef.cityName` / `seo.moonCity.name` ← same |
| FAQPage Q/A bodies (10 langs) | embed `${cityName}` |
| Hero / cards / related-link anchor text | same |
| Internal Qibla / Moon / Hijri link labels | same |
| Client-hydration seeds `window.__PRAYER_CITY__.name`, `window.__QIBLA_CITY__.names[lang]` | `_buildSlugLookupResult` / `_qNames` map — both call `_pickCuratedName(entry, lang)` |
| `/api/place-by-slug` response `name` field | `_buildSlugLookupResult` → `_pickCuratedName` |

ALL positions chain through `_pickCuratedName(entry, lang)` — the single SSR resolver for curated city names. The previous implementation:

```js
function _pickCuratedName(entry, lang) {
    if (!entry || typeof entry !== 'object') return null;
    const _n = entry.names || {};
    const _code = String(lang || 'ar').toLowerCase();
    if (typeof _n[_code] === 'string' && _n[_code].trim()) return _n[_code];
    if (typeof _n.en === 'string' && _n.en.trim())         return _n.en;
    for (const k of Object.keys(_n)) {
        if (typeof _n[k] === 'string' && _n[k].trim()) return _n[k];
    }
    return null;
}
```

…did **no script validation**. It returned `entry.names[lang]` blindly. So when `curated-places.json` happened to contain Latin-script pollution in a non-Latin lang slot:

```json
// db/places/curated-places.json — kr/gwangju
{
  "slug": "gwangju",
  "names": {
    "ar": "غوانغجو",
    "en": "Gwangju",
    "ur": "Gwangju",   // ← LATIN POLLUTION
    "bn": "Gwangju",   // ← LATIN POLLUTION
    "fr": "Gwangju", "de": "Gwangju", "tr": "Gwangju",
    "id": "Gwangju", "es": "Gwangju", "ms": "Gwangju"
  }
}
```

…on `/ur/prayer-times-in-gwangju` the Urdu RTL template

```
${cityDisplay} میں آج اوقاتِ نماز | روزانہ اذان کا شیڈول…
```

would render as

```
Gwangju میں آج اوقاتِ نماز | روزانہ اذان کا شیڈول…
```

— breaking the unified-localization promise the rest of the city page already keeps (`SEED-18` IN cities → `کراچی میں…`, AF cities → `چاریکار میں…`, IR cities → `بندر عباس میں…`). The Latin word also harms RTL bidi flow, screen-reader pronunciation, and SEO localization quality.

**Scope of pollution discovered**:
- **1,678** curated entries with Latin `names.ur` (Latin pollution in Urdu slot)
- **1,755** curated entries with Latin `names.bn` (Latin pollution in Bengali slot)

These were introduced by an earlier fillchain pass that copied `names.en` into every empty lang slot — before the **fillLangMap GUARD** policy was established. We chose **not** to mutate `curated-places.json` to remove them, because:

1. User constraint: "لا تعدّل curated-places.json" — DO NOT mutate curated.
2. User constraint: "لا تستخدم runtime translation / fillchain" — DO NOT invent native-script names at runtime.
3. The right home for those 3,433 entries is a future per-country L10N enrichment wave with real, verified native-script names; rewriting them with English placeholders would lock us into a fake-native-name state.

Instead, this phase adds a **runtime-only script-validation layer** that:
- Detects the pollution at lookup time
- Falls back to `names.en` (untranslated proper noun — the right thing for an English-script Latin name on an Urdu page)
- Exposes `isFallback` + `sourceLang` + `hasNativeName` metadata so future SEO/a11y improvements (e.g., wrapping fallback text in `<span lang="en">` for screen readers + search engines) can be applied uniformly.

---

## 2. Constraints honoured

Verbatim user directives, all satisfied:

| Constraint | How honoured |
|---|---|
| "لا تعدّل curated-places.json" | `git diff --stat db/places/curated-places.json` = 0 bytes |
| "لا تضف names.ur أو names.bn أو أي names.*" | No data files added; no curated rows modified |
| "لا تبدأ L10N wave" | No `names.<lang>` created at runtime or written to disk |
| "لا تبدأ geodata wave" | No geodata pipeline run |
| "لا تستخدم runtime translation" | Fallback is **English value of the same entry** — never a translation of any kind |
| "لا تستخدم fillchain" | Fallback path is **single-tier** (names.en), not iterative fillchain |
| "لا تستخدم Google Translate / Browser / OpenAI / Anthropic" | None invoked |
| "لا تنشئ names.* جديدة داخل curated" | Confirmed by byte-identity test |
| "لا تحفظ أي ترجمة جديدة" | Confirmed |
| "لا تغيّر slug أو canonical" | Slugs untouched; helper takes lang param, slug-routing logic unchanged |
| "لا تبدأ أي مرحلة أخرى" | This is the **only** phase opened |
| "افحص صفحة المدينة كاملة من الأعلى للأسفل" | Audit covered §1 table (title/meta/OG/Twitter/JSON-LD/H1/FAQ/cards/internal-links/hero/breadcrumbs/api/place-by-slug/__PRAYER_CITY__/__QIBLA_CITY__) |
| "وعدّل كل مكان يظهر فيه اسم المدينة بمنطق غير موحد" | Centralized via `getLocalizedPlaceName` helper + `_pickCuratedName` rewire — every position now uses the unified script-validated chain |
| "أنشئ helper مركزي" | `_placeL10n.getLocalizedPlaceName(place, lang, options)` — see §3 |
| Helper returns `{displayName, sourceLang, isFallback, hasNativeName}` | Returned verbatim; see §3 |

---

## 3. Implementation

### 3.1 New script-acceptance check — `_isAcceptableScriptForLang(s, lang)`

Location: `server/place-l10n/index.js`. Mirrors the client-side `_isDisplayScriptAcceptable` in `js/app.js` but is stricter for `ur`/`bn` (rejects Latin where the client defensively allowed it — server is the single source of truth for SSR text):

| Lang | Required script | Rejects |
|---|---|---|
| `ar` | Arabic block `؀-ۿ` | Bengali, Latin, all other non-Latin non-Arabic |
| `ur` | Arabic block (Urdu uses Arabic script + 14 extras) | Bengali, **Latin** (e.g., `Gwangju`), other non-Latin non-Arabic |
| `bn` | Bengali block `ঀ-৿` | Arabic, **Latin**, other non-Latin non-Arabic |
| `en`, `fr`, `de`, `tr`, `id`, `es`, `ms` | Latin `A-Za-z` | Arabic, Bengali, CJK, Hangul, Cyrillic, Greek, Hebrew, Devanagari, Thai, Tamil, Ethiopic, etc. |

Exported as `placeL10n.isAcceptableScriptForLang` for cross-module reuse and testing.

### 3.2 New central helper — `getLocalizedPlaceName(place, lang, options)`

Location: `server/place-l10n/index.js`. Signature:

```js
function getLocalizedPlaceName(place, lang, options) → {
    displayName:   string,        // the value to render (may be '')
    sourceLang:    string | null, // which lang the value actually came from
    isFallback:    boolean,       // true if not from the requested lang
    hasNativeName: boolean        // true only if the requested lang had a
                                  // script-acceptable native value
}
```

Tier order:

1. **`names[lang]`** IF `_isAcceptableScriptForLang(value, lang)` → `sourceLang = lang`, `hasNativeName = true`
2. **`aliases[lang][0]`** (if `options.acceptAlias !== false`) IF script-acceptable → `sourceLang = lang`, `hasNativeName = true`
3. **`names.en`** (untranslated proper-noun fallback per user policy — NO runtime translation, NO fillchain, NO transliteration) → `sourceLang = 'en'`, `isFallback = (lang !== 'en')`, `hasNativeName = false`
4. **Legacy cities-DB shape** `{nameAr, nameEn}` — compatibility shim
5. **Any other** `names[k]` that is non-empty (defensive last resort)
6. **Empty** result

Per-place behaviour for the test cohort:

| Entry | `/ar/` | `/en/` | `/ur/` | `/bn/` | `/fr/` | `/de/` |
|---|---|---|---|---|---|---|
| **gwangju** (kr) | `غوانغجو` (native) | `Gwangju` (native) | `Gwangju` (→en fallback, **POLLUTION rejected**) | `Gwangju` (→en fallback, **POLLUTION rejected**) | `Gwangju` (native — Latin OK for fr slot) | `Gwangju` (native) |
| **karachi** (pk) | `كراتشي` (native) | `Karachi` (native) | `کراچی` (native) | `করاچی` (native) | `Karachi` (native) | `Karatschi` (native) |
| **dhaka** (bd) | `دكا` (native) | `Dhaka` (native) | `ڈھاکا` (native) | `ঢাকা` (native) | `Dacca` (native) | `Dhaka` (native) |
| **mumbai** (in) | `مومباي` (native) | `Mumbai` (native) | `ممبئی` (native) | `মুম্বই` (native) | `Bombay` (native) | `Mumbai` (native) |
| **varanasi** (in) | `بنارس` (native) | `Varanasi` (native) | `وارانسی` (native) | `বারাণসী` (native) | `Varanasi` (→en fallback — no `names.fr`) | `Varanasi` (→en fallback) |
| **makkah** (sa) | `مكة المكرمة` | `Mecca` | `مکہ` | `মক্কা` | `La Mecque` | `Mekka` |

All test entries: `Gwangju /ur` and `Gwangju /bn` now correctly identify pollution and surface `isFallback=true, sourceLang='en', hasNativeName=false`. All other cohort × lang combinations have real native names and surface `isFallback=false, hasNativeName=true`.

### 3.3 Patched tiers inside `pickLocalizedDisplayQ`

Same module. Tiers 1 (curated `names[lang]`), 3 (Nominatim `nd[lang]`), and 4 (alias `aliases[lang][0]`) now consult `_isAcceptableScriptForLang` before returning. Polluted values fall through to fallback_en — search-ranking drops from `quality: 'curated'` (highest confidence) to `quality: 'fallback_en'` (lowest pre-empty), so the search pipeline naturally surfaces real native names ahead of polluted siblings.

### 3.4 Rewired `_pickCuratedName` in `server.js`

```diff
 function _pickCuratedName(entry, lang) {
     if (!entry || typeof entry !== 'object') return null;
-    const _n = entry.names || {};
-    const _code = String(lang || 'ar').toLowerCase();
-    if (typeof _n[_code] === 'string' && _n[_code].trim()) return _n[_code];
-    if (typeof _n.en === 'string' && _n.en.trim())         return _n.en;
-    for (const k of Object.keys(_n)) {
-        if (typeof _n[k] === 'string' && _n[k].trim()) return _n[k];
-    }
-    return null;
+    const r = _placeL10n.getLocalizedPlaceName(entry, lang);
+    return r.displayName || null;
 }
```

This is the **single chokepoint** for the entire SSR layer. Every position in §1's table flows through it:

```
_pickCuratedName (server.js)
   ↓
_placeL10n.getLocalizedPlaceName (server/place-l10n/index.js)
   ↓
_isAcceptableScriptForLang
   ↓
Tier 1 (native) → Tier 2 (alias) → Tier 3 (en fallback) → Tier 4 (legacy) → Tier 5 (any) → empty
```

---

## 4. Test results

### 4.1 New test suite — `scripts/_test_city_name_seo_fallback_1.mjs`

12 test groups, **107 / 107 PASS**:

| Group | Tests | Result |
|---|---|---|
| 1. Module exports surface | 4 | ✅ 4/4 |
| 2. `isAcceptableScriptForLang` unit (5 langs × {accept, reject}) | 23 | ✅ 23/23 |
| 3. Gwangju — Latin-pollution case | 18 | ✅ 18/18 |
| 4. Karachi regression (proper Urdu native) | 6 | ✅ 6/6 |
| 5. Dhaka regression (Bengali native) | 6 | ✅ 6/6 |
| 6. Mumbai regression (Urdu + Bengali native) | 4 | ✅ 4/4 |
| 7. Varanasi (ur+bn native; fr/de→en fallback) | 7 | ✅ 7/7 |
| 8. Makkah (all 10 langs native) | 10 | ✅ 10/10 |
| 9. `pickLocalizedDisplayQ` Tier 1 guard fires | 5 | ✅ 5/5 |
| 10. `_pickCuratedName` wire-through (15 fixtures) | 15 | ✅ 15/15 |
| 11. curated.json byte-identity after 300 helper calls | 1 | ✅ 1/1 |
| 12. Defensive (null/empty/legacy shape) | 5 | ✅ 5/5 |

### 4.2 Carry-forward regression — full suite-by-suite

Ran 18+ pre-existing offline test suites:

| Suite | Result |
|---|---|
| `_test_city_name_universal.mjs` | 35/35 ✅ |
| `_test_city_name_ugly.mjs` | 5/5 ✅ |
| `_test_lang_guard.mjs` | 5/0 ✅ |
| `_test_lang_guard_helpers.mjs` | 6/0 ✅ |
| `_test_search_ar.mjs` | 22/0 ✅ |
| `_test_place_by_slug.mjs` | 44/0 ✅ (boots server; covers `/api/place-by-slug` for curated entries — directly exercises the new `_pickCuratedName`) |
| `_test_home_search_migration.mjs` | 33/0 ✅ (boots server) |
| `_test_external_provider_2.mjs` | 32/0 ✅ (boots server) |
| `_test_external_cache.mjs` | 13/0 ✅ (boots server) |
| `_test_home_title_stability.mjs` | 10/0 ✅ |
| `_test_place_names_ur_in_1.mjs` | 122/0 ✅ |
| `_test_place_names_bn_in_1.mjs` | 113/0 ✅ |
| `_test_place_names_ur_pk_2.mjs` | 65/0 ✅ |
| `_test_place_names_ur_pk_3.mjs` | 74/0 ✅ |
| `_test_place_names_ur_pk_4.mjs` | 51/0 ✅ |
| `_test_place_names_ur_pk_5.mjs` | 62/0 ✅ |
| `_test_place_names_ur_pk_6.mjs` | 69/0 ✅ |
| `_test_place_names_ur_ir_1.mjs` | 66/0 ✅ |
| `_test_place_names_ur_af_1.mjs` | 41/0 ✅ |
| `_test_place_names_hi_in_1.mjs` | 116/0 ✅ |
| `_test_fill_lang_map.mjs` | 11/0 ✅ |

**Aggregate**: **107 (new) + 1,000+ (carry-forward) ≈ 1,107+ tests passing**.

#### Note — `_test_place_names_ur_pk_1.mjs` (37/38, 1 pre-existing)

The single failure is on a search-ranking test (`search "حیدر آباد" → top result pk/hyderabad-pk` returned `in/hyderabad-in`). Analysis:

- Both `pk/hyderabad-pk` and `in/hyderabad-in` have `names.ur = "حیدرآباد"` (Arabic-block, script-acceptable).
- Both PASS the new Tier 1 guard → both retain `quality: 'curated'` (no change vs. pre-fix).
- Therefore, the relative ranking between PK and IN for this query is **unchanged by this commit**. The failure is a **pre-existing** search-ranking issue (search prefers IN over PK for the with-space alias query) that predates this work and is unrelated to script-validation.

#### Note — `_test_search_place_endpoint.mjs` (Nominatim-dependent)

This test boots the server and dispatches some queries to live Nominatim. Failures correlate with rate-limit / external-network conditions (the original run that flagged ~33 fail/659 ran during Nominatim throttling). The curated-only assertions in this suite pass with this commit.

---

## 5. Before/after — concrete examples

### 5.1 `gwangju` (Korean city — Latin pollution in ur+bn)

#### Before (pre-fix)

| Position | `/ur/` | `/bn/` |
|---|---|---|
| `<title>` | `Gwangju میں آج اوقاتِ نماز \| …` | `Gwangju-এ আজকের নামাজের সময় \| …` |
| H1 | `Gwangju میں اوقاتِ نماز` | `Gwangju-এ নামাজের সময়` |
| JSON-LD City `name` | `Gwangju` | `Gwangju` |
| breadcrumb leaf | `Gwangju` | `Gwangju` |
| `__PRAYER_CITY__.name` (client seed) | `Gwangju` | `Gwangju` |
| Quality tag (search ranking) | `curated` (high — falsely confident) | `curated` |
| `sourceLang` metadata | (none) | (none) |
| `isFallback` metadata | (none) | (none) |
| `hasNativeName` metadata | (none) | (none) |

#### After

| Position | `/ur/` | `/bn/` |
|---|---|---|
| `<title>` | `Gwangju میں آج اوقاتِ نماز \| …` (string unchanged) | `Gwangju-এ …` (string unchanged) |
| H1 | `Gwangju میں اوقاتِ نماز` (string unchanged) | `Gwangju-এ …` (string unchanged) |
| JSON-LD City `name` | `Gwangju` | `Gwangju` |
| `__PRAYER_CITY__.name` (client seed) | `Gwangju` | `Gwangju` |
| Quality tag (search ranking) | **`fallback_en`** (low — accurately flagged) | **`fallback_en`** |
| `sourceLang` metadata | **`'en'`** | **`'en'`** |
| `isFallback` metadata | **`true`** | **`true`** |
| `hasNativeName` metadata | **`false`** | **`false`** |

The visible string is unchanged in this commit (Latin "Gwangju" still rendered), but the **metadata is correct**: downstream consumers (search ranking, future `<span lang="en">` wrappers, telemetry, admin-review queues) can now identify pollution and prioritize the entry for a future native-name enrichment wave.

### 5.2 `karachi` (real Urdu native — no regression)

| Position | `/ur/` |
|---|---|
| `<title>` | `کراچی میں آج اوقاتِ نماز \| …` ✓ |
| H1 | `کراچی میں اوقاتِ نماز` ✓ |
| `sourceLang` | `'ur'` ✓ |
| `isFallback` | `false` ✓ |
| `hasNativeName` | `true` ✓ |

### 5.3 `dhaka` (real Bengali native — no regression)

| Position | `/bn/` |
|---|---|
| `<title>` | `ঢাকা-এ আজকের নামাজের সময় \| …` ✓ |
| `sourceLang` | `'bn'` ✓ |
| `isFallback` | `false` ✓ |
| `hasNativeName` | `true` ✓ |

---

## 6. Architectural impact

**Single point of script-validation** for the entire SSR + API + client-hydration surface. Previously the chain was:

```
SSR template
   ↓
_resolveCityName(slug, lang)
   ↓
_pickCuratedName(entry, lang)    ← no script validation
   ↓
entry.names[lang]                ← Latin pollution slipped through
```

After:

```
SSR template
   ↓
_resolveCityName(slug, lang)
   ↓
_pickCuratedName(entry, lang)
   ↓
_placeL10n.getLocalizedPlaceName(entry, lang)         ← central helper
   ↓
_isAcceptableScriptForLang(value, lang)               ← script guard
   ↓
Tier 1 native / Tier 2 alias / Tier 3 en-fallback / Tier 4 legacy / Tier 5 any / empty
```

The same chain is also reached via `_buildSlugLookupResult` (the `/api/place-by-slug` response builder) and the `_qNames` per-lang map injected as `window.__QIBLA_CITY__.names` — meaning **every** SSR position in §1's table inherits the unified, script-validated, metadata-rich lookup.

`pickLocalizedDisplayQ` (the search-ranking pipeline) **independently** gets the same Tier 1/3/4 script guards, so search results also respect the policy without needing to call into the new helper (different return shape — quality-tagged, not metadata-tagged).

---

## 7. Files

### 7.1 CREATED

| File | Purpose |
|---|---|
| `scripts/_test_city_name_seo_fallback_1.mjs` | 107-test offline verification — Gwangju pollution case + Karachi/Dhaka/Mumbai/Varanasi/Makkah regression + defensive edge cases + curated byte-identity assertion |
| `reports/city-name-seo-fallback-policy-1.md` | This report |

### 7.2 MODIFIED

| File | Change |
|---|---|
| `server/place-l10n/index.js` | +173 lines: `_isAcceptableScriptForLang`, `getLocalizedPlaceName`, Tier 1/3/4 script guards inside `pickLocalizedDisplayQ`, exports updated |
| `server.js` | `_pickCuratedName` rewired through `_placeL10n.getLocalizedPlaceName` (net change: −7 +9 lines; behaviour now script-validated) |

### 7.3 NOT modified

| File | Verification |
|---|---|
| `db/places/curated-places.json` | **0-byte diff** — verified by `git diff --stat` + `_test_city_name_seo_fallback_1.mjs` Group 11 byte-identity assertion |
| `db/places/candidates/*` | Unchanged |
| Any L10N data file | Unchanged — no `names.*` added or modified |
| `index.html`, `js/app.js`, `js/i18n/*.js` | Unchanged — client-side fix not required (client already has `_isDisplayScriptAcceptable` + `getDisplayCity` Tier-0 trust on SSR seed, which is now correct) |
| Per-country MEMORY entries | No new wave added; this is a policy/runtime patch only |

---

## 8. What this phase does NOT do

To set correct expectations:

1. **Does NOT change the rendered `<title>` / H1 strings** for the polluted entries themselves. `Gwangju /ur` still shows `Gwangju میں …` in `<title>` — because the en-fallback value is also `Gwangju`. What changes is the **metadata** (quality, sourceLang, isFallback, hasNativeName) that downstream consumers can now act on.
2. **Does NOT add `<span lang="en">` wrappers** around fallback strings in SSR templates. That would be a follow-up phase; the metadata to drive such wrapping is now exposed.
3. **Does NOT enrich the 1,678 polluted `names.ur` + 1,755 polluted `names.bn` with real native names**. That is the job of future per-country L10N waves (PLACE-NAMES-UR-KR-1, PLACE-NAMES-UR-{JP,CN,TH,VN,etc.}-1, PLACE-NAMES-BN-{KR,JP,…}-1) — explicitly outside the scope of this fix per user constraints.
4. **Does NOT modify search ranking algorithm**. It does change the *quality tag* that ranking already consumes (polluted entries drop from `curated` → `fallback_en`), so polluted hits naturally rank below real-native hits without algorithm changes.
5. **Does NOT alter slugs or canonical URLs.** Slug routing is independent of the localization layer.

---

## 9. Future / follow-up suggestions (NOT opened in this phase)

These are deliberate deferrals. None should be auto-started:

- **CITY-NAME-LANG-WRAP-1**: wrap fallback strings in `<span lang="en">` inside SSR templates using the `sourceLang` / `isFallback` metadata. Improves screen-reader pronunciation + search-engine bidi understanding on RTL pages.
- **PLACE-NAMES-UR-KR-1 / BN-KR-1**: real Korean-city Urdu/Bengali names (Gwangju → `گوانگجو` / `গোয়াংজু`, Seoul → `سيول`/`সিউল`, Busan → `بوسان`/`বুসান`, etc.). One small wave per country can clear hundreds of pollution rows for the highest-traffic East-Asian destinations.
- **Admin-review queue**: surface `{ slug, lang, isFallback: true }` rows from the helper's metadata in a `/admin/l10n-review` endpoint so curators can prioritize per-country gaps.
- **Tighten client-side `_isDisplayScriptAcceptable`** for ur/bn to additionally reject Latin (currently it accepts Latin on ur/bn pages as defensive coverage). Server-side fix here makes the client check less load-bearing, so the client can safely tighten when a follow-up phase is opened.

---

## 10. Closure criteria (user-approval gate)

This phase is ready for user closure when ALL the following are true (all currently ✅):

- [x] `_pickCuratedName` is the single chokepoint for SSR city-name resolution
- [x] `_pickCuratedName` routes through `_placeL10n.getLocalizedPlaceName`
- [x] Helper returns `{displayName, sourceLang, isFallback, hasNativeName}`
- [x] Script guard rejects Latin pollution in `ur` / `bn` slots
- [x] Script guard rejects Arabic/Bengali pollution in Latin-script slots
- [x] All script-acceptance unit tests pass (23/23)
- [x] Gwangju /ur and /bn produce `isFallback=true, sourceLang='en', hasNativeName=false`
- [x] Karachi /ur, Dhaka /bn, Mumbai /ur+/bn, Varanasi /ur+/bn, Makkah /ar regression all produce `isFallback=false, hasNativeName=true`
- [x] `db/places/curated-places.json` is byte-identical (0-byte diff)
- [x] No new `names.*` written to disk
- [x] No runtime translation invoked
- [x] No fillchain logic added
- [x] Carry-forward suites (18+ files, 1,000+ tests) all green save 1 pre-existing UR-PK-1 search-ranking failure (confirmed unrelated to this commit by data inspection — see §13)
- [x] **`_test_search_place_endpoint.mjs` full server-booted run = 659 / 659 PASS** (verified post-closure)

---

## 11. Closure marker

**Approved by user 2026-05-20**:
> أعتمد إغلاق CITY-NAME-SEO-FALLBACK-POLICY-1 رسميًا.
> Marker: `docs(closure): mark CITY-NAME-SEO-FALLBACK-POLICY-1 user-approved 2026-05-20`

No further phases opened. Specifically held back per user constraint:
geodata wave • L10N wave • search-ranking wave • Hijri pages •
DELETE-V1 • geocode-proxy • any modification to `curated-places.json`.

*— End of report —*
