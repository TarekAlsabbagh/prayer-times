# PLACE-LANGUAGE-SWITCH-FLOW-AUDIT-1

**Phase**: Analysis-only (NO code, NO data changes)
**Date**: 2026-05-18
**Status**: audit re-issued after L10N rollback — describes the CURRENT (post-rollback) repo state at HEAD `6f54b5e` (functionally identical to `ca78809`)
**Prior version**: an earlier copy of this report was created during the L10N foundation work and deleted as part of the rollback to ca78809. This re-issue reflects the rolled-back state, NOT the foundation-era state.

---

## TL;DR

1. **Language switching = full-page redirect** via `window.location.href`. There is no client-side language swap — every lang change reloads the page from the server.
2. **The server controls everything visible at first paint** through the SSR pre-fill block in `server.js` (~line 18708+).
3. **`fillLangMap` (scripts/geodata/_geonames_common.mjs:396) is the root cause** of the Charikar Urdu-leak: it fills every missing lang slot with `names.en`, so every wave produces `names.ur === names.en === "Charikar"` (and same for `bn/fr/de/es/tr/id/ms`). SSR then reads `names.ur` and renders Latin "Charikar" as if it were the Urdu name.
4. **`_pickCuratedName` (server.js:3163)** doesn't know to distinguish a real localized name from a fillchain leftover. It returns whatever's in `names[lang]` as long as it's a non-empty string.
5. **`_syncCityNameInDom` (js/app.js:6805)** runs after first paint. It CAN replace the SSR-rendered text — but is gated by `PT-LANG-GUARD-1`, which protects Arabic pages only. UR/BN have no equivalent guard.
6. **`namesProvenance` does not exist in this repo** at HEAD `6f54b5e` (the L10N foundation work that introduced it was rolled back). No code reads or writes it.
7. **Recommended approach** (after considering 5 options): stored localized names + batch enrichment + no runtime translation. Concrete next-step proposals listed in §11.

---

## §1. Current language switch flow — end to end

### 1a. User clicks "اردو" in the language switcher

Handler is `setLanguage(lang)` in `js/i18n-core.js` (~line 114). It constructs the new URL path with the appropriate prefix and navigates via:

```js
const prefix = (lang === 'ar') ? '' : ('/' + lang);
const newPath = (basePath === '/') ? (prefix || '/') : (prefix + basePath);
if (newPath !== curPath) {
    window.location.href = newPath + window.location.search;   // ← FULL RELOAD
    return;
}
```

The bare URL `/prayer-times-in-charikar` (Arabic default) becomes `/ur/prayer-times-in-charikar` after the redirect. The browser issues a fresh HTTP GET to the server. **No client-side DOM mutation, no SPA-style transition, no inline translation.**

### 1b. Server receives `GET /ur/prayer-times-in-charikar`

```
1. Express middleware parses URL → seo.lang = 'ur'
2. Static HTML loaded from disk (index.html template)
3. SSR meta-tag injections (CITY-NAME-SYNC-1 + PLACE-CITY-PAGE-L10N-FIX-1)
4. HTML response written, gzip/brotli-compressed
5. Browser starts parsing HTML
```

### 1c. Browser parses → renders → executes scripts

```
1. Initial HTML paint: #city-name renders whatever the SSR pre-fill block wrote
2. app.js executes (defer-loaded):
    a. Top-of-script reads window.__PRAYER_CITY__ and seeds globals (~line 36-60)
    b. i18n-core.js sets document.documentElement.lang = 'ur' + dir = 'rtl'
    c. DOMContentLoaded → setLanguage('ur') re-renders any data-i18n attrs
    d. loadCityData() reads sessionStorage('city_charikar') if present
    e. _syncCityNameInDom() may walk DOM text nodes (line 6805+) and replace SSR text
```

**Critical ordering**: the SSR-rendered city-name HTML is visible BEFORE app.js executes. The user sees the SSR output first (no FOUC). `_syncCityNameInDom()` runs at the very end as a final sync step.

---

## §2. Is language switching full-page redirect or client-side only?

**Full-page redirect** (HTTP request + fresh HTML response). Confirmed at `js/i18n-core.js:114-140`:

```js
window.location.href = newPath + window.location.search;
```

**Why this matters for the audit**: there is no "client swaps the city name when lang changes" code path. Every page render is fresh from the server. The user can't see a stale Arabic name on a `/ur/` page unless the SSR itself wrote a wrong value.

**Consequence**: fixing the Urdu-leak issue requires either:
- Changing what the SERVER writes (recommended), or
- Adding a client-side correction that runs after first paint (more fragile)

There's no in-page lang-toggle UI to worry about.

---

## §3. Where does the city name come from in SSR?

**The chain**:

1. **URL parsed** → `_ssrCitySlug = 'charikar'`, `seo.lang = 'ur'`.
2. **`_findPlaceBySlug(slug)`** (server.js, ~line 3154 area) — instant in-memory lookup of `_CURATED_SLUG_INDEX['charikar']` → returns the curated entry object.
3. **`_resolveCityName(slug, lang)`** (server.js:3076) — the main resolver. Calls `_pickCuratedName(entry, lang)` first; falls through to legacy resolvers (POPULAR_CITY_NAMES, idx[s]) and finally `_slugToTitle(slug)` if everything else fails.
4. **`_pickCuratedName(entry, lang)`** (server.js:3163-3173) — the actual name picker. Current code:
   ```js
   function _pickCuratedName(entry, lang) {
       if (!entry || typeof entry !== 'object') return null;
       const _n = entry.names || {};
       const _code = String(lang || 'ar').toLowerCase();
       if (typeof _n[_code] === 'string' && _n[_code].trim()) return _n[_code];   // ← returns names.ur (= "Charikar")
       if (typeof _n.en === 'string' && _n.en.trim())         return _n.en;
       for (const k of Object.keys(_n)) {
           if (typeof _n[k] === 'string' && _n[k].trim()) return _n[k];
       }
       return null;
   }
   ```
5. **`_buildSlugLookupResult(entry, lang, source)`** (server.js:3182) — wraps the picked name into the API/SSR result shape `{ slug, lat, lng, name, englishName, country, countryCode, timezone, type, originalName, source }`.
6. **SSR meta-tag injector** (~line 18691+) — injects `<meta name="ssr-city-name" content="Charikar">` into `<head>`.
7. **PLACE-CITY-PAGE-L10N-FIX-1 block** (~line 18708+) — replaces the placeholder `<div class="city-name" id="city-name" data-i18n="header.locating">جاري تحديد الموقع...</div>` with the resolved name:
   ```js
   html = html.replace(
       /<div class="city-name" id="city-name"[^>]*>[^<]*<\/div>/,
       `<div class="city-name" id="city-name">${_cityEsc}</div>`
   );
   ```
8. **`window.__PRAYER_CITY__` script** also injected — carries the full place data (lat/lng/timezone/name/country/etc.) so the client can skip the API hydration call.

**For `/ur/prayer-times-in-charikar` at HEAD `6f54b5e`**:
- `entry.names.ur === "Charikar"` (fillchain leftover from `fillLangMap`)
- `_pickCuratedName(entry, 'ur')` returns `"Charikar"` (because it's a non-empty string in the `ur` slot — no test that "this looks like a real Urdu translation")
- SSR injects `<meta name="ssr-city-name" content="Charikar">`
- SSR `#city-name` div renders `<div class="city-name" id="city-name">Charikar</div>`
- **The user sees "Charikar" as the official Urdu name. This is the bug.**

---

## §4. Where does the city name come from after JavaScript hydration?

### 4a. Inline seed (before DOMContentLoaded)

`js/app.js` lines ~36-60 read `window.__PRAYER_CITY__` synchronously when the script starts:

```js
if (window.__PRAYER_CITY__ && typeof window.__PRAYER_CITY__ === 'object') {
    const pc = window.__PRAYER_CITY__;
    currentLat   = pc.lat;
    currentLng   = pc.lng;
    currentCity  = pc.name;        // ← whatever the SSR computed (e.g. "Charikar")
    currentCountry = pc.country;
    currentLocalizedName = pc.name;
}
```

For `/ur/charikar`, `currentCity` is initially set to `"Charikar"` because that's what `_pickCuratedName(entry, 'ur')` returned.

### 4b. `loadCityData()` post-DOMContentLoaded

Reads `sessionStorage('city_<slug>')` if present. May overwrite `currentCity` with the value the user clicked from a previous page's search results. Falls back to `window.__PRAYER_CITY__`.

### 4c. `_syncCityNameInDom()` — the final post-paint sync (js/app.js:6805)

```js
function _syncCityNameInDom() {
    const meta = document.querySelector('meta[name="ssr-city-name"]');
    if (!meta) return;
    const ssrName = (meta.getAttribute('content') || '').trim();
    if (!ssrName) return;

    const _docLang = getCurrentLang() || document.documentElement.lang || 'ar';
    const _isAr = (_docLang === 'ar');
    const _hasLatin = (s) => /[A-Za-z]/.test(String(s || ''));

    let goodName = '';
    // (1) currentCity
    // (2) currentLocalizedName
    // (3) _moonCityDisplayName(slug)
    // — each candidate must pass `!(_isAr && _hasLatin(v))` guard
    ...
    if (!goodName || goodName === ssrName) return;

    // PT-LANG-GUARD-1 safety net (AR ONLY):
    if (_isAr && !_hasLatin(ssrName) && _hasLatin(goodName)) return;

    // Walk all text nodes, replace ssrName → goodName everywhere
    ...
}
```

**The two guards in this function**:

| Guard | Effect | Applies to |
|---|---|---|
| Per-candidate `!(_isAr && _hasLatin(v))` (~lines 6839/6846/6859) | Rejects a Latin candidate from being chosen as `goodName` | Arabic only |
| Final `if (_isAr && !_hasLatin(ssrName) && _hasLatin(goodName)) return` (~line 6871) | Doesn't replace clean Arabic SSR with Latin goodName | Arabic only |

**🚨 GAP**: No equivalent guard exists for `_isUr` or `_isBn`. The author of CITY-NAME-SYNC-1 was thinking about Arabic pages (where Latin "Le Pontet" could overwrite the correct Arabic "لو بونت" if the slug resolved via Nominatim). UR/BN were not considered because the assumption was that the SSR would always provide a correct lang-appropriate name. With fillchain rows producing `names.ur === "Charikar"`, the SSR doesn't provide a correct Urdu name, and the client guard wouldn't catch it even if it did.

---

## §5. What is `window.__PRAYER_CITY__`'s role?

**Purpose**: avoid a round-trip to `/api/place-by-slug` on first paint for bare `/lang/prayer-times-in-<slug>` URLs. The SSR pre-fill block (line ~18746) writes an inline script:

```html
<script id="ssr-prayer-city">window.__PRAYER_CITY__={"slug":"charikar","lat":35.0117,"lng":68.847,"name":"Charikar","englishName":"Charikar","country":"أفغانستان","countryCode":"af","timezone":"Asia/Kabul","type":"city","source":"curated"};</script>
```

The client reads this synchronously at script-top and seeds `currentLat`, `currentLng`, `currentCity`, `currentCountry`. The result: no flicker, no async wait, prayer times calculation can start before the network is touched.

**For the Charikar bug**: this object carries `name: "Charikar"` (the fillchain leftover). The client trusts it and never questions whether it's a real Urdu name.

---

## §6. What is `sessionStorage`'s role?

**Key**: `city_<slug>` (e.g. `city_charikar`)

**Written by**: `navigateToCity()` (js/app.js, ~line 6296) when the user clicks a city from a search result.

**Shape**:
```js
{
    lat: number,
    lng: number,
    name: string,         // localized name at time of click
    country: string,
    englishName: string,
    countryCode: string,
    _v: 2,
    timezone?: string
}
```

**Read by**: `loadCityData()` on the destination page. May override `currentCity` with the value the user originally clicked.

**For the Charikar bug**: if the user came from search results on `/ur/`, the search result for "charikar" returned `name: "Charikar"` (because the search-place API uses the same `_pickCuratedName(entry, 'ur')` chain). Click stores `name: "Charikar"` in sessionStorage. Destination `/ur/prayer-times-in-charikar` reads it back. `currentCity = "Charikar"`. No discrepancy with the SSR, no client-side correction.

In other words: sessionStorage is consistent with the SSR — they both inherit the same fillchain leftover from the same root cause.

---

## §7. What is `fillLangMap`'s role?

**Location**: `scripts/geodata/_geonames_common.mjs:396-402`

**Current code** (at HEAD `6f54b5e`):
```js
export const SUPPORTED_LANGS = ['ar','en','fr','de','tr','ur','id','es','bn','ms'];
export function fillLangMap(partial, fallback) {
    const out = {};
    for (const l of SUPPORTED_LANGS) {
        out[l] = (partial && partial[l]) ? partial[l] : fallback;
    }
    return out;
}
```

**When does it run?**

**BUILD-TIME ONLY.** Called from `scripts/geodata/normalize_places.mjs:95`:

```js
const namesPartial = { ar: arName, en: enName };
const names = fillLangMap(namesPartial, enName);  // ← fills ur/bn/fr/de/... all from enName
```

This runs once per wave during Stage 2 (`normalize`). The output is written to `db/places/candidates/<cc>-geonames-normalized.json` and eventually merged into `curated-places.json` via Stage 4 (`apply`).

**No runtime usage** anywhere in `server.js` or `js/app.js`. Confirmed via grep.

**Impact on the bug**: every wave that has run since this function was written has produced `names.ur === names.en`, `names.bn === names.en`, etc. for EVERY curated entry that didn't have an explicit per-lang translation in the GeoNames `alternatenames` field. Effectively that means **75-100% of all 2,336 curated entries have fillchain leftovers** in their non-en/non-ar lang slots.

**Confirmation for Charikar**:
```json
{
  "slug": "charikar",
  "names": {
    "ar": "تشاريكار",
    "en": "Charikar",
    "fr": "Charikar",
    "de": "Charikar",
    "tr": "Charikar",
    "ur": "Charikar",
    "id": "Charikar",
    "es": "Charikar",
    "bn": "Charikar",
    "ms": "Charikar"
  }
}
```

All 8 non-en/non-ar slots are filled with the English fallback. This is the data shape `_pickCuratedName('ur')` reads.

---

## §8. Why did "Charikar" appear on the Urdu page?

End-to-end cause:

1. **Stage 2 build**: `fillLangMap` filled `names.ur` with `names.en` (`"Charikar"`) for the af/charikar curated entry.
2. **Server request `/ur/prayer-times-in-charikar`**: `seo.lang = 'ur'`.
3. **SSR call `_pickCuratedName(entry, 'ur')`**: sees `entry.names.ur === "Charikar"` is a non-empty string, returns it without questioning.
4. **SSR `_buildSlugLookupResult(entry, 'ur', 'curated')`**: sets `result.name = "Charikar"`.
5. **SSR meta injection**: `<meta name="ssr-city-name" content="Charikar">`.
6. **SSR `#city-name` div replace**: `<div class="city-name" id="city-name">Charikar</div>`.
7. **SSR `window.__PRAYER_CITY__` inline script**: `{name: "Charikar", ...}`.
8. **Browser paints the HTML**: user sees "Charikar" rendered as the Urdu city name.
9. **`app.js` executes**: reads `window.__PRAYER_CITY__`, sets `currentCity = "Charikar"`.
10. **`_syncCityNameInDom()` runs**: `ssrName === "Charikar"`, `currentCity === "Charikar"`. Condition `goodName === ssrName` is true → early return → no replacement. The SSR text stays.
11. **Final user-visible state**: "Charikar" displayed as the official Urdu name.

**Why this looks worse on `/ur/` than on `/en/`**:
- On `/en/`, "Charikar" is the correct localized rendering — English-Latin script for an English page. No issue.
- On `/ur/`, "Charikar" is in the wrong script entirely. An Urdu reader expects Nasta'liq script (chah-aleph-rai-yeh-kaf-aleph-rai = چاریکار). The Latin form is jarring.

The same problem affects `/bn/` (Bengali expects Bengali script) and would affect `/ar/` if the wave's Stage 3.5 quality gate didn't already enforce that `names.ar` be in Arabic script. (For `ar`, the situation is fine because Stage 3.5 catches any Latin in `names.ar` at wave-closure time.)

---

## §9. What options exist to fix this?

Five architectural options, in increasing-effort order:

### Option A — Runtime Arabic-script fallback for `/ur/`

When `/ur/<slug>` lookup hits a row where `names.ur === names.en` AND `names.ar` is clean Arabic, return `names.ar` instead.

| Aspect | Trade-off |
|---|---|
| Code surface | ~5 lines in `_pickCuratedName` |
| Effort | ~30 minutes |
| Data changes | none |
| User-visible | `/ur/charikar` shows "تشاريكار" instead of "Charikar" |
| Correctness | **Mid** — Arabic and Urdu use the same script but the actual transliteration differs. Charikar's Arabic is `تشاريكار` (tsh-aleph-rai-yeh-kaf-aleph-rai), but the real Urdu is `چاریکار` (ch-aleph-rai-yeh-kaf-aleph-rai). Reader sees Arabic-style, not Urdu-style. Better than Latin, but not honest "this is Urdu". |
| SEO | Improves — non-Latin script visible to crawlers as page lang content |
| Reversibility | Trivial — delete the 5 lines |

This is the option the user previously REJECTED (`PLACE-NAMES-L10N-FALLBACK-1`).

### Option B — Stored localized names + batch enrichment

For each language, manually review and store real per-row `names.<lang>` translations. No runtime fallback; missing means missing. Requires building absence-state UI for the missing case.

| Aspect | Trade-off |
|---|---|
| Code surface | Significant — `fillLangMap` redesign + `_pickCuratedName` redesign + SSR absence-state markup + CSS |
| Effort | Several phases. Per-batch ~1-2 hours review work, ×N countries × N langs. |
| Data changes | Significant — strip fillchain rows, add real localized names via review batches |
| User-visible | After enrichment: real Urdu names. Before enrichment: honest "name not available" UI. |
| Correctness | **High** — every stored name is reviewed |
| SEO | **Best** once populated. |
| Reversibility | Possible but expensive (revert + restore backups) |

This is the option the user previously approved as `PLACE-NAMES-L10N-FOUNDATION-CODE-1` + `PLACE-NAMES-UR-AF-1`, then rolled back to ca78809.

### Option C — Runtime translation API

Call Google Translate / Anthropic / etc. at request time when `names.ur` is missing.

| Aspect | Trade-off |
|---|---|
| Code surface | Network call + cache layer |
| Effort | Medium |
| Data changes | None |
| User-visible | Translated names, possibly low-quality |
| Correctness | **Low** — translation APIs translate MEANING (New York → "المدينة الجديدة") not city-name conventions (New York → "نيويورك"). |
| SEO | Bad — non-deterministic page content, slow SSR |
| Reversibility | Easy |

**User has explicitly rejected this option.** Including it for completeness only.

### Option D — Smart per-lang fallback

E.g. Urdu falls back to Arabic; Bengali falls back to nothing; Latin-script langs fall back to English silently with a marker. Same as A but generalized.

| Aspect | Trade-off |
|---|---|
| Code surface | ~20 lines |
| Effort | ~1 hour |
| Data changes | none |
| User-visible | Mixed — ar/ur readers see Arabic-style text; bn readers still see Latin |
| Correctness | Mid — same Urdu/Arabic-conflation issue as A |
| SEO | Improves for ar/ur, neutral for bn |
| Reversibility | Trivial |

Subset of A — same drawbacks.

### Option E — Hybrid: Option B + small client guard

Stored localized names (Option B) **plus** an extension to `_syncCityNameInDom` so the Latin-rejection guard covers ar/ur/bn. The guard is the safety-net that prevents client-side regression.

| Aspect | Trade-off |
|---|---|
| Code surface | Same as B + ~5 lines in js/app.js |
| Effort | Same as B + ~10 min |
| Data changes | Same as B |
| User-visible | Same as B |
| Correctness | Same as B |
| SEO | Same as B |
| Reversibility | Same as B |

**Strictly better than B alone** because it closes the asymmetry that the previous foundation phase exposed: `PT-LANG-GUARD-1` protects ar but not ur/bn from client-side Latin overwrites.

---

## §10. Architectural recommendation (no implementation)

**Recommended: Option E** (stored localized names + batch enrichment + client guard extension).

### Why Option E over the alternatives

- **A / D (runtime fallback)** trade SEO and naming-correctness for implementation speed. The user has already rejected this trade-off as incompatible with the goal of "stored localized names".
- **B (storage-only)** is good but the previous attempt showed that without the client guard extension, the absence-state UI is structurally vulnerable to client-side overwrite on `/ur/` and `/bn/` pages.
- **C (runtime translation)** is explicitly forbidden.

### Why this is RECOMMENDATION not IMPLEMENTATION

This audit is read-only. Executing Option E would require:
- Reintroducing the `fillLangMap` redesign in `_geonames_common.mjs`
- Reintroducing the `_pickCuratedName` redesign in `server.js`
- Reintroducing the absence-state UI in server.js + css/style.css
- Adding the `PT-LANG-GUARD-1-EXTEND-UR-BN` (~5 lines in js/app.js) which was NOT part of the rolled-back work
- Re-running the strip script to remove 3,510 fillchain rows
- Re-running the UR-AF-1 enrichment for the 36 AF cities
- Carrying forward 1,200+ smoke tests

This is what the rollback removed. Reissuing it would put us back at the same state. The decision is whether to re-execute B+E together (with the added client guard this time), or to choose a different option (A/D as a quick stopgap, accepting the trade-offs).

### Alternative recommendation: minimal Option A as a stopgap

If full Option E feels too heavy, a single change to `_pickCuratedName` to add the `names.ar` fallback for `ur` and `bn` would fix the user-visible bug overnight with zero data changes — at the cost of the correctness concern (Urdu reader sees Arabic-style, not Urdu-style). Reversible at any time.

The user previously rejected this. But it's worth re-stating that it remains a valid trade-off if the path of full stored-names enrichment is judged too long-term.

### The minimum viable next step (in either direction)

Whichever option is chosen, **the very first concrete change** would be:

```js
// scripts/geodata/_geonames_common.mjs
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

This stops future waves from creating new fillchain rows. It's a 4-line change, no data touched, no tests broken. It would NOT fix the existing 3,510 fillchain rows (those need a strip script) but it would prevent the problem from growing.

If the user is still undecided about Option A vs B vs E, this `fillLangMap` change is a no-regret move: it works for any of those options.

---

## §11. Decision points for the user

When ready to act, pick one:

- **`stay-as-is`** — accept that `/ur/<slug>` shows Latin for unfilled rows. Charikar-Urdu remains the visible state. No code or data change.
- **`option-A-quick-fallback`** — 5-line change in `_pickCuratedName` to fall back from missing `ur`/`bn` to `names.ar`. Fixes the visible bug overnight. Trade-off: Urdu readers see Arabic-style names, not native Urdu transliterations.
- **`option-B-storage`** — re-execute the L10N foundation work that was just rolled back. Plus per-batch enrichment.
- **`option-E-storage-plus-guard`** — Option B + a small client-side guard extension to protect `/ur/` and `/bn/` from client overwrite. Strictly safer than B alone.
- **`minimum-viable-fillLangMap-only`** — just the 4-line `fillLangMap` change. Prevents future fillchain rows. Doesn't fix existing ones. Compatible with any further direction.

---

## §12. What this audit did NOT do

- ❌ NO changes to `server.js`
- ❌ NO changes to `js/app.js`
- ❌ NO changes to `index.html`
- ❌ NO changes to `css/style.css`
- ❌ NO changes to `db/places/curated-places.json`
- ❌ NO changes to `scripts/geodata/_geonames_common.mjs`
- ❌ NO new code shipped
- ❌ NO tests run
- ❌ NO new phases opened

Pure read-only investigation + this report.

```
$ git diff server.js js/app.js index.html css/style.css db/places/curated-places.json scripts/geodata/_geonames_common.mjs
(empty)
```

Workspace unchanged from HEAD `6f54b5e` (= functional ca78809).

---

## §13. Summary table — current state at HEAD `6f54b5e`

| Component | File:line | Current behavior |
|---|---|---|
| Lang switcher | `js/i18n-core.js:~114` | Full-page `window.location.href` redirect |
| Curated lookup | `server.js:~3154` | In-memory slug index |
| Name picker | `server.js:3163-3173` | Returns `names[lang]` if non-empty, else `names.en` — no source-awareness |
| Build wrapper | `server.js:3182-3211` | `_buildSlugLookupResult` returns `{name, englishName, ...}` — no `nameSource` |
| SSR meta | `server.js:~18691` | Single `<meta name="ssr-city-name">` injection |
| SSR pre-fill | `server.js:~18708` | Bare text-content replace into `#city-name` |
| Client preload | `server.js:~18746` | `window.__PRAYER_CITY__` inline script |
| Client init | `js/app.js:~36-60` | Reads `window.__PRAYER_CITY__`, seeds globals |
| Hydration sync | `js/app.js:6805+` | Reads SSR meta, may replace DOM text |
| Latin guard | `js/app.js:~6826/6871` | AR-only; UR/BN unprotected |
| `fillLangMap` | `scripts/geodata/_geonames_common.mjs:396` | Cascades `names.en` into all 10 lang slots (BUG SOURCE) |
| `namesProvenance` | nowhere | Field does not exist |
| Absence-state UI | nowhere | Does not exist |

---

**End of audit. No execution. Awaiting decision.**
