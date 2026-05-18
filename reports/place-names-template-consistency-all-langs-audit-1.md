# PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-AUDIT-1

**Date**: 2026-05-18
**Type**: Analysis-only — NO code changes
**Triggered by**: User asking whether `PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1` should apply to ALL languages (not just UR/BN).

---

## Executive summary

After `PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1` (`5135087`), the answer to "is template consistency now broken in any language?" is **NO for AR / UR / BN / EN, and PARTIALLY for FR / DE / TR / ID / ES / MS**.

The recent commit fixed all 5 user-named surfaces (`#city-name`, `#snb-city`, `#loc-hero-title`, `.qa-title`, `.nearby-label`) for the **absence-langs ar/ur/bn**. For the **Latin-script langs fr/de/tr/id/es/ms**:

- `.qa-title` is **already correct** (it goes through `_moonCityDisplayName` Tier 1.05 which honors `window.__PRAYER_CITY__.name` for ALL langs — that seed carries the page-lang-correct name from curated `_pickCuratedName`).
- `#city-name` is **correct** via `getDisplayCity()` (existing non-AR/EN branch checks `_LOCALIZED_CITY_MAPS[lang]` and Nominatim's `currentLocalizedName`).
- `#snb-city`, `#loc-hero-title`, prayer-card aria-labels, mtc-cta title, weekly button — these consume `getCurrentCityLabel()` whose Latin-script-lang branch is **lossy**: it doesn't see `__PRAYER_CITY__.name` and only consults the tiny in-JS `_LOCALIZED_CITY_MAPS[lang]` (~12-33 entries per lang) before falling to `currentEnglishName`. When Nominatim's `currentLocalizedName` arrives async, things switch — but there's a visible English-flash window on cold loads.

**Recommendation**: Apply a small generalized fix — extend `getCurrentCityLabel()` to consult `window.__PRAYER_CITY__.name` (when the page slug matches) as Tier-0, mirroring what `_moonCityDisplayName` Tier 1.05 already does. Single-line cousin of the UR-AF-1 fix; benefits ALL non-AR/EN langs equally without any data migration.

---

## 1. Every place that touches `currentEnglishName` / `place.nameEn` / `city.en`

The grep across `js/app.js` returned ~70 lines. Below they're grouped by **whether they affect user-visible text** (the only category that needs lang-awareness for templates).

### A. Visible-text surfaces (in-scope)

| # | Line(s) | Function | Surface(s) reached | Lang behavior today |
|---|---|---|---|---|
| A1 | 670-756 | `getDisplayCity()` | `#city-name`, `#info-location`, `#qibla-city`, `#loc-hero-city-label`, breadcrumb city | AR/UR/BN: ✅ correct via PT-LANG-GUARD-2/3. EN: returns `currentEnglishDisplayName`. FR/DE/TR/ID/ES/MS: tries `currentLocalizedName` → `_LOCALIZED_CITY_MAPS[lang][englishName]` → `currentEnglishName`. ⚠️ **Doesn't see `__PRAYER_CITY__.name`** — so when `_LOCALIZED_CITY_MAPS` lacks the city AND Nominatim hasn't returned yet, shows English. |
| A2 | 12266-12349 | `getCurrentCityLabel()` | `#snb-city` (sticky bar), `.loc-hero-title` H2, all `.prayer-card[aria-label]`, `#mtc-cta[title]`, `.weekly-expand-btn[title]`, `#info-location` (Round 20 hero), `#sticky-next-bar` city label | AR: ✅ correct via PT-LANG-GUARD-2. UR/BN: ✅ correct via PT-LANG-GUARD-4 (from latest commit). EN: returns `currentEnglishName`. FR/DE/TR/ID/ES/MS: same flaw as A1 — falls to `currentEnglishName` when nothing localized. |
| A3 | 16155-16387 | `_moonCityDisplayName(slug)` | `.qa-title` × 3 (hijri / qibla / moon), countdown displays, all `_resolveCityNameClient` consumers, FAQ inline mentions | ALL LANGS: ✅ correct via Tier 1.05 (from latest commit) — returns `window.__PRAYER_CITY__.name` when slug matches. Falls through to lang-aware tiers thereafter. |
| A4 | 13520-13649 | nearby-tile renderer | `.nearby-label` | AR: uses `place.nameAr`. Non-AR: ✅ correct via curated lookup through `__POPULAR_CITY_NAMES__` (from latest commit) for popular cities; falls back to `place.nameEn` for non-popular nearby places (acceptable). |
| A5 | 7434-7439 | `updateBreadcrumb()` (cityLabelRaw) | breadcrumb city label | AR/EN: explicit branches. Non-AR/EN: uses `getDisplayCity()` first ⇒ inherits A1's behavior. |
| A6 | 7680 | `injectPrayerEventsSchema()` `cityDisplay` | JSON-LD prayer-events schema (`schema.org/Event`) | Visible only to crawlers. `isEn = (lang !== 'ar')` → for UR/BN/FR/DE/TR/ID/ES/MS, uses `currentEnglishName`. **Cosmetic for users; SEO impact for UR/BN** — Arabic search engines would index "Charikar" not "چاریکار". |

### B. URL / slug / persistence / aria-label / fetch-key (out-of-scope — MUST stay English)

| # | Line(s) | Purpose | Why English is correct |
|---|---|---|---|
| B1 | 50, 86, 89, 7188-7204, 7217 | hydrate `currentEnglishName` from sources | Internal variable; downstream consumers decide what to render. |
| B2 | 2723, 3590-3595, 3968, 4661, 4815, 7275, 8164, 21063 | sessionStorage seed `englishName` field | Slug recomputation across visits requires stable English form. |
| B3 | 3578-3580, 4280-4281, 4550-4551, 4626-4627, 7268, 10746-10747, 11424-11425, 11865-11868, 15632 | build URL slug via `makeSlug(currentEnglishName, lat, lng)` | URLs are English by site convention (`/ur/prayer-times-in-charikar`, never `/ur/prayer-times-in-چاریکار`). |
| B4 | 6508-6627 | `fetchLocalizedCityName` Nominatim address-level matching | Compares English Nominatim level (`addr.city`, etc.) to `currentEnglishName` to pick the right level's localized version. |
| B5 | 7349, 7816-7817, 10778-10779, 20716, 20803, 20933, 21044, 21142 | slug fallback when no URL slug exists (homepage→time-left/next-prayer tile hrefs) | URL slug — must be English. |
| B6 | 13635, 13646, 13559, 13570 | `buildCityUrl()` / `navigateToCity()` arguments | URL composition + navigation seed (downstream English slug). |

**Net conclusion of §1**: Only **6 visible-text surfaces** (A1-A6) gate rendering on `currentEnglishName`. Three (A3, A4, A5 indirectly) are now lang-aware for all 10 languages. Two (A1, A2) are lang-aware only for AR/UR/BN/EN. One (A6) writes English to JSON-LD for all non-AR langs by design.

---

## 2. Which usages affect ar/ur/bn only vs all langs

| Surface | AR fix status | UR/BN fix status | FR/DE/TR/ID/ES/MS fix status |
|---|---|---|---|
| `getDisplayCity()` (A1) | ✅ PT-LANG-GUARD-2 | ✅ PT-LANG-GUARD-3 | ⚠️ generic fallback (no Tier-0 from __PRAYER_CITY__) |
| `getCurrentCityLabel()` (A2) | ✅ PT-LANG-GUARD-2 | ✅ PT-LANG-GUARD-4 | ⚠️ same as above |
| `_moonCityDisplayName()` (A3) | ✅ Tier 1.05 | ✅ Tier 1.05 | ✅ Tier 1.05 (covers all langs) |
| `.nearby-label` (A4) | ✅ uses `place.nameAr` | ✅ via __POPULAR_CITY_NAMES__ | ✅ same path (POPULAR_CITY_NAMES has all 10 langs) |
| `updateBreadcrumb` cityLabelRaw (A5) | ✅ AR branch | ✅ via getDisplayCity | ⚠️ inherits A1's flaw |
| JSON-LD schema cityDisplay (A6) | ✅ uses `currentCity` | ⚠️ uses `currentEnglishName` (cosmetic SEO) | ⚠️ same — by design |

**ar/ur/bn-only fix is incomplete** — A1, A2, A5 still have a measurable gap for FR/DE/TR/ID/ES/MS:
- On a cold visit to `/fr/prayer-times-in-london`, before Nominatim returns (~200-2000ms), `getCurrentCityLabel()` returns "London" because `_LOCALIZED_CITY_MAPS.fr` has only ~32 entries and London isn't among them.
- Then `currentLocalizedName="Londres"` arrives → `updateCityDisplay()` re-renders.
- User sees "London" flash → "Londres".

This is the **same FOUC class** the PT-LANG-GUARD-* line of fixes was created to eliminate for AR. It's mild for Latin-script langs because the flash is Latin↔Latin (no script switch), but it's still inconsistent.

---

## 3. Curated `names.<lang>` coverage — where real localized names exist

Counts across the 2,336 curated entries:

| Lang | Real names (`names[lang] !== names.en`) | Fillchain (`= names.en`) | Coverage |
|---|---:|---:|---:|
| ar | **2,336** | 0 | **100%** |
| en | — | 2,336 | (baseline) |
| ur | 617 | 1,719 | 26.4% |
| bn | 581 | 1,755 | 24.9% |
| tr | 344 | 1,992 | 14.7% |
| de | 259 | 2,077 | 11.1% |
| fr | 220 | 2,116 | 9.4% |
| es | 217 | 2,119 | 9.3% |
| id | 42 | 2,294 | 1.8% |
| ms | 14 | 2,322 | 0.6% |

**Where the real names ARE**: spot-checks confirm that for **popular cities** (Mecca / Medina / Riyadh / Cairo / Jerusalem / Damascus / London / Paris / Munich / Tokyo / Istanbul), most or all 10 langs have real curated names. For example:

| Slug | ar | ur | bn | fr | de | tr | id | es | ms |
|---|---|---|---|---|---|---|---|---|---|
| `makkah` | مكة المكرمة | مکہ | মক্কা | La Mecque | Mekka | Mekke | Mekkah | La Meca | Mekah |
| `cairo` | القاهرة | قاہرہ | কায়রো | Le Caire | Kairo | Kahire | Kairo | El Cairo | Kaherah |
| `london` | لندن | لندن | লন্ডন | Londres | London | Londra | London | Londres | London |
| `munich` | ميونخ | میونخ | মিউনিখ | Munich | München | Münih | München | Múnich | Munich |

For **smaller cities** (Charikar, Kandahar, smaller AF/IR/ID towns), only `ar` + `ur` (post UR-AF-1) have real names. All other langs are fillchain.

**Implication**: A Tier-0 like `_moonCityDisplayName`'s 1.05 — that consumes `__PRAYER_CITY__.name` directly — would deliver real localized names where curated has them, and fall through gracefully to the legacy chain when it doesn't. The seed is page-lang-correct by construction (server's `_pickCuratedName(entry, pageLang)`).

---

## 4. Do FR/DE/ES/TR/ID/MS need the same fix as AR/UR/BN?

**Yes — but milder version.**

The reasoning:

- **For AR/UR/BN**, the bug was: a Latin name leaks into a non-Latin sentence template ("Charikar میں آج کی ہجری تاریخ"). This is **always wrong** because Latin chars are wrong-script for these languages — Wikipedia, Google search results, news, all use the localized Arabic-script form. The user sees a typographically jarring mix.

- **For FR/DE/ES/TR/ID/MS**, the bug is milder: English `currentEnglishName` is Latin-script, and so is the page lang's name. The "Munich" vs "München" difference is a CHOICE between two acceptable Latin renditions. But the **inconsistency** — `#city-name` says "München" (curated) while `#snb-city` and `#loc-hero-title` say "Munich" until Nominatim returns — is still a UX bug, just less visually loud.

**The fix is the same shape but the priority is lower for Latin langs.** No data migration is required — the curated `_pickCuratedName` already provides the right name in `__PRAYER_CITY__.name` for every page lang.

**Edge case**: For Latin langs, when `names.<lang>` equals `names.en` (fillchain), `__PRAYER_CITY__.name` IS the English name. Returning it is harmless (matches what `currentEnglishName` would give). No regression risk.

---

## 5. Test pages × langs (current behavior — captured 2026-05-18)

SSR `__PRAYER_CITY__.name` (= what the page-lang-correct localized name is, per curated):

| URL | seed.name | seed.englishName | Notes |
|---|---|---|---|
| `/ur/prayer-times-in-charikar` | `چاریکار` | `Charikar` | UR-AF-1 real Urdu ✓ |
| `/ur/prayer-times-in-makkah` | `مکہ` | `Mecca` | curated seed ✓ |
| `/prayer-times-in-charikar` (AR) | `تشاريكار` | `Charikar` | AR canonical ✓ |
| `/en/prayer-times-in-charikar` | `Charikar` | `Charikar` | EN baseline ✓ |
| `/tr/prayer-times-in-makkah` | `Mekke` | `Mecca` | curated TR ✓ |
| `/es/prayer-times-in-new-york` | `Nueva York` | `New York` | curated ES ✓ |
| `/fr/prayer-times-in-london` | `Londres` | `London` | curated FR ✓ |
| `/de/prayer-times-in-munich` | `München` | `Munich` | curated DE ✓ |
| `/bn/prayer-times-in-charikar` | `Charikar` | `Charikar` | curated BN missing — fillchain |

**Reading**: For all 8 cases where curated has real localized data, the SSR is delivering it correctly via `__PRAYER_CITY__.name`. The ONLY page surface that doesn't fully leverage this on cold load is the legacy `getCurrentCityLabel`/`getDisplayCity` Latin-lang fallback chain.

The smoke test of the previous phase (`_test_place_names_ur_template_consistency_1.mjs`, 16/16 pass) covers only AR/UR. **There is no per-lang Latin-script smoke yet.** Recommended pages for a future suite:

```
/ur/prayer-times-in-charikar       → چاریکار (existing)
/ur/prayer-times-in-makkah         → مکہ (existing)
/ar/prayer-times-in-charikar       → تشاريكار (existing)
/en/prayer-times-in-charikar       → Charikar (existing)
/tr/prayer-times-in-makkah         → Mekke (NEW)
/tr/prayer-times-in-istanbul       → İstanbul (NEW)
/es/prayer-times-in-new-york       → Nueva York (NEW)
/es/prayer-times-in-cairo          → El Cairo (NEW)
/fr/prayer-times-in-london         → Londres (NEW)
/fr/prayer-times-in-cairo          → Le Caire (NEW)
/de/prayer-times-in-munich         → München (NEW)
/de/prayer-times-in-cairo          → Kairo (NEW)
/bn/prayer-times-in-makkah         → মক্কা (NEW)
/bn/prayer-times-in-charikar       → Charikar (fillchain; expected fallback)
```

---

## 6. Recommendation

### Option A — Generalized fix (RECOMMENDED)

Extend the two consumers — `getCurrentCityLabel()` (A2) and `getDisplayCity()` (A1) — with a Tier-0 that mirrors `_moonCityDisplayName`'s Tier 1.05:

```text
For ANY lang:
  if window.__PRAYER_CITY__.slug matches the URL slug
  AND __PRAYER_CITY__.name is non-empty:
      return __PRAYER_CITY__.name
```

**Why this is the right shape**:

- Server's `_pickCuratedName(entry, pageLang)` already chose the right name — we trust it.
- Curated `_pickCuratedName` falls back to `names.en` for missing langs, so for fillchain rows the seed is still English (harmless on FR/DE/ES/TR/ID/MS pages because their renderable surfaces are Latin-acceptable anyway).
- ZERO data migration. ZERO new test data. ONE consistent rule across all 10 langs.
- ZERO impact on already-correct paths (AR, UR/BN absence-lang priority would simply run BEFORE this Tier-0 because they're guards that test `currentCity` script — when matching, they return early; when not, Tier-0 is consulted).

**Estimated changes**: ~10 lines added × 2 functions in `js/app.js`. New smoke test for FR/DE/ES/TR/ID/MS popular-city pages (≈8 cases). No `server.js` / `curated_places.json` / `fillLangMap` changes.

**Trade-off — schema/SEO (A6)**: a separate later phase could broaden A6 (`injectPrayerEventsSchema cityDisplay`) to use `__PRAYER_CITY__.name` for non-AR langs too — gives Urdu/Bengali search engines indexable localized names in JSON-LD. NOT included in this proposed Option A; flagged here as a follow-up.

### Option B — AR/UR/BN-only fix (status quo)

Stop here. Leave FR/DE/ES/TR/ID/MS with:
- Cold-load Latin flash (Nominatim async catch).
- `#snb-city`/`#loc-hero-title` showing the fillchain English when curated has no real localized name (which is acceptable since the page lang IS Latin-script).

**Drawback**: User just identified the principle "shouldn't be Urdu-only" — adopting Option B contradicts that principle and leaves a known inconsistency in the codebase even if its visual impact is mild.

### Option C — Wait for full data coverage first

Defer template fix until per-country localized-name waves close coverage gaps (e.g. PLACE-NAMES-FR-EU-1, PLACE-NAMES-TR-MIDEAST-1, etc.). This is symmetric with how UR coverage went — fill `names.ur` first (UR-AF-1), then unblock the template layer.

**Drawback**: Templates remain inconsistent for the ~30% of curated entries that DO have real localized names in FR/DE/TR. Solving the same problem twice (data + then templates) means users on /fr/london keep seeing the cold-load flash even though "Londres" is in curated.

---

## Recommendation: **Option A**

It's a 2-function, ~20-line change that closes the architectural gap once and for all. The PT-LANG-GUARD lineage already established that absence-langs need stricter handling, so the proposed Tier-0 doesn't remove any existing guards — it adds a higher-priority "seed-trust" tier above them.

**Phase name if approved**: `PLACE-NAMES-TEMPLATE-CONSISTENCY-ALL-LANGS-FIX-1`.
**Scope**: Same as `PLACE-NAMES-UR-TEMPLATE-CONSISTENCY-1` but lang-agnostic.
**Tests**: Add 8 new cases (TR/ES/FR/DE × 2 popular cities each) to a new or extended smoke suite.
**No data migration. No server changes. No fillLangMap changes.**

---

## Out-of-scope follow-ups (NOT in either option)

- **A6 schema/SEO localization for UR/BN** — separate phase.
- **Bulk fillchain reduction** — UR-IR-1, BN-BD-1, FR-EU-1, etc.
- **Service Worker cache invalidation policy** — orthogonal.

---

## Status: 🟢 AUDIT COMPLETE — awaiting user decision.

User must choose:
1. **Option A** (recommended) — generalize the template-consistency fix to all langs.
2. **Option B** — keep ar/ur/bn-only; accept Latin-lang inconsistency.
3. **Option C** — defer until coverage is wider.
