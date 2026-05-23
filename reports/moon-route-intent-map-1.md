# MOON-ROUTE-INTENT-MAP-1 — Moon page-type audit (read-only)

**Status:** Read-only audit. No code / SEO / sitemap / canonical / UI / data change.
**Date:** 2026-05-23
**Server probe port:** :4030 (local), responses captured 2026-05-23 22:24Z.

---

## 1. Per-route audit table

| # | URL | Intent | Type | H1 (current) | Title | Canonical | Robots | hreflang | Indexable? | Component | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/moon-today` | Generic Moon Gateway (no city) | **Hub** | `حالة القمر اليوم` | `حالة القمر اليوم: الطور الحالي ومراحل القمر والتقويم الهجري` | self (`/moon-today`) | `index,follow,…` | 11 | ✅ YES | `#page-moon` (heavily SSR-stripped via `_MOON_HUB_STRIP_IDS`; hub-only sections shown via `html.moon-today-hub-page` CSS) | Page is the SEO root. Most "page-moon" sections are hidden. Only hero + FAQ + hub-related + (now) events-section visible. |
| 2 | `/moon-in-jeddah` | Evergreen city hub (parent of monthly + dated child pages) | **City hub** | `حالة القمر في جدة` | `حالة القمر في جدة \| طور القمر، الإضاءة وتقويم الأطوار` | self (`/moon-in-jeddah`) | `index,follow,…` | 11 | ✅ YES | `#page-moon` (city-hub-only sections visible, others stripped per `cityMatchSsr` rules) | Has its own JSON-LD BreadcrumbList: `Home › حالة القمر › جدة` (after MOON-BC-ROOT-LABEL-AR-FIX-1). |
| 3 | `/moon-today-in-jeddah` | Today's moon snapshot for a city (live-status focus) | **Today city** | `حالة القمر اليوم في جدة` | `حالة القمر اليوم في جدة \| طور القمر والإضاءة والعمر` | self (`/moon-today-in-jeddah`) | `index,follow,…` | 11 | ✅ YES | `#page-moon` (`html.moon-today-city-page` gate) | Both #2 and #3 indexable; H1s differ by ONE word ("اليوم"). Highest cannibalization risk. |
| 4 | `/moon-in-jeddah/2026-05` | Monthly lunar calendar for city/month | **Monthly city** | `حالة القمر في جدة` ⚠️ (NOT month-specific) | `تقويم القمر في جدة لشهر مايو 2026 ومراحل القمر` | self (`/moon-in-jeddah/2026-05`) | `index,follow,…` | 11 | ✅ YES (but **NOT in sitemap**) | `#page-moon` (`_isMoonMonthPage` SSR path) | **H1 is generic — does NOT include "مايو 2026"**. Sitemap has 0 monthly URLs for jeddah → discoverable only via internal links/dated-page breadcrumb. |
| 5 | `/moon-in-jeddah/2026-05-23` | Single-day moon detail for city | **Dated city** | `القمر اليوم` ⚠️ (generic, no date/city) | `حالة القمر في جدة يوم 23 مايو 2026 \| طور القمر والإضاءة` | self (`/moon-in-jeddah/2026-05-23`) | `index,follow,…` | 11 | ✅ YES (310 dated URLs per city × cities × langs in sitemap) | `#page-moon` (`_MD` match for date) | **H1 mismatch with title** — title says "يوم 23 مايو 2026" but H1 says only "القمر اليوم". |
| 6 | `/en/moon-in-jeddah` | EN version of #2 | City hub | `Moon in Jeddah` | `Moon in Jeddah \| Moon Phase, Illumination and Lunar Calendar` | self (`/en/moon-in-jeddah`) | `index,follow,…` | 11 | ✅ YES | Same as #2 | hreflang links sister-AR `/moon-in-jeddah` correctly. |
| 7 | `/en/moon-today-in-jeddah` | EN version of #3 | Today city | `Moon Today in Jeddah` | `Moon Today in Jeddah \| Phase, Illumination and Age` | self (`/en/moon-today-in-jeddah`) | `index,follow,…` | 11 | ✅ YES | Same as #3 | EN H1 has clearer differentiation than AR ("Moon" vs "Moon Today"). |

---

## 2. Sitemap inventory (exact counts via `</loc>` boundary)

| URL pattern | Count in sitemap | Multiplier |
|---|---|---|
| `/moon-today` (incl. /{lang}/moon-today) | **10** | 1 hub × 10 langs |
| `/moon-in-jeddah` (bare hub) | **10** | 1 per lang × 10 |
| `/moon-today-in-jeddah` (bare hub) | **10** | 1 per lang × 10 |
| `/moon-in-jeddah/YYYY-MM` (monthly) | **0** | ⚠️ NOT in sitemap |
| `/moon-in-jeddah/YYYY-MM-DD` (dated) | **310** | ~31 dated days × 10 langs |

**Cross-city totals (all city slugs combined):**
- `/moon-in-{city}` style URLs: ~10 langs × ~12 famous cities = ~120 bare hub URLs (matches sample grep)
- `/moon-today-in-{city}`: ~120 bare hub URLs
- `/moon-in-{city}/{YYYY-MM-DD}`: tens of thousands (282,720 raw substring hits; sitemap inflates by lang)

---

## 3. Internal-link map (where each route is reached from)

| From | Linked-to route | Mechanism |
|---|---|---|
| `/moon-today` city cards (12 cards in `#moon-other-cities`) | **`/moon-today-in-{city}`** | Hard-coded HTML `href` in index.html lines 1939-1951 |
| `/moon-today` geo button (JS `navigateToMoonToday(...)`) | **`/moon-today-in-{slug}`** | `js/app.js` — generates `/moon-today-in-${slug}` from detected coordinates |
| `/moon-today` smart-pill (last city) | **`/moon-today-in-{slug}`** | `js/app.js _wireMoonHubSmartPill._show()` (`pageUrl('/moon-today-in-' + slug)`) |
| `/moon-today` search box → city pick | **`/moon-today-in-{slug}`** | Same `navigateToMoonToday` path |
| **Dated page breadcrumb** (#5) → parent | `/moon-in-{slug}` (the city hub) | `server.js:_cityBcHref` line 9343 — dated pages link UP to `/moon-in-{slug}` (NOT `/moon-today-in-{slug}`) |
| **Monthly page breadcrumb** (#4) → parent | `/moon-in-{slug}` | Same `_cityBcHref` rule |
| **City hub** (#2) → today page | (no direct link) | `/moon-in-{slug}` does NOT currently link to its `/moon-today-in-{slug}` sibling. |
| **Today city** (#3) → city hub | (no direct link) | And vice versa. |

**Key finding:** Users almost always reach **`/moon-today-in-{city}`** through internal navigation. **`/moon-in-{city}`** is reachable mainly through (a) breadcrumb-up from dated/monthly pages, and (b) direct URL / sitemap / Google. The two are NOT cross-linked to each other from the UI.

---

## 4. Server-side redirect logic between the two

```
grep "Location.*moon-today-in\|Location.*moon-in-" server.js
→ (no results)
```

**There is NO 301 redirect between `/moon-in-{city}` and `/moon-today-in-{city}`.** They are two separate, independently indexable URLs that the user can land on directly. The only moon-related redirect found is at `server.js:20884`:
```javascript
res.writeHead(301, { 'Location': `/${_prefix}moon-today`, ... });
```
which handles legacy fallbacks INTO `/moon-today`, not between city URLs.

---

## 5. Answers to the 10 explicit questions

| # | Question | Answer |
|---|---|---|
| 1 | What's the actual difference between `/moon-in-{city}` and `/moon-today-in-{city}`? | They are **two distinct evergreen-vs-today URLs for the same city**. `/moon-in-{city}` is the parent of dated + monthly child pages; its title/description lean on "calendar / monthly phases". `/moon-today-in-{city}` is the user-facing "today's snapshot" route, linked from all UI city pickers. Both render `#page-moon` with the same calculation logic but slightly different SSR section visibility and copy. |
| 2 | Which one is canonical? | **Neither is canonical to the other.** Each page self-canonicals. No `<link rel="canonical">` cross-references between them. |
| 3 | Is one a redirect to the other? | **No.** Both return HTTP 200 and serve full unique HTML. |
| 4 | Are both in sitemap? | **YES — both at 10 langs each per city** (verified for jeddah). |
| 5 | Are both indexable? | **YES — both have `index,follow,…` robots meta.** No `noindex` on either. |
| 6 | Is the content duplicated? | **Partially.** Both render the same `#page-moon` template against the same MoonCalc data for the same city. SSR strips differ slightly (today-city hides month-edu, hub-city hides today-city-edu). H1s differ by one word ("اليوم"). Titles and descriptions differ in angle (calendar-vs-today). **Moderate-to-high cannibalization risk for the AR variants where H1s are nearly identical.** EN H1s are more differentiated. |
| 7 | When user picks a city from `/moon-today`, where should they go? | **Currently goes to `/moon-today-in-{slug}`** — and this is consistent across all UI entry points (city cards, geo button, smart pill, search). |
| 8 | When user picks a month, where should they go? | **`/moon-in-{slug}/{YYYY-MM}`** — this is the only existing monthly route. Linked from dated-page breadcrumb level-4. |
| 9 | Which route should be used for internal links? | Today snapshots → `/moon-today-in-{slug}`. Calendar / monthly / dated drill-down → `/moon-in-{slug}/...`. **Current behavior matches this split.** |
| 10 | Will we need redirect or canonical consolidation later? | **Yes — see §7 below.** Strongest fix candidate: make `/moon-in-{city}` (bare hub) `<link rel="canonical">` to `/moon-today-in-{city}`, OR explicitly differentiate them so both can rank for distinct queries. Status quo is moderate cannibalization risk. |

---

## 6. Bugs spotted in passing (not fixed — audit only)

| ID | Page | Issue |
|---|---|---|
| BUG-1 | `/moon-in-jeddah/2026-05-23` (dated) | H1 = "القمر اليوم" — generic, missing date and city. Title says "حالة القمر في جدة يوم 23 مايو 2026" but H1 doesn't match. |
| BUG-2 | `/moon-in-jeddah/2026-05` (monthly) | H1 = "حالة القمر في جدة" — same as the bare hub at /moon-in-jeddah. Missing month/year. |
| BUG-3 | Monthly URLs `/moon-in-{city}/YYYY-MM` | **Not in sitemap** (0 entries) — only discoverable via breadcrumb. Lost crawl-budget value. |
| BUG-4 | AR `/moon-in-{city}` vs `/moon-today-in-{city}` | H1s differ by ONE word — Google may struggle to differentiate. |

These are **observations**, deferred to a future wave.

---

## 7. Recommended route canonical policy

Three options, in order of impact:

### Option A — Status quo + explicit differentiation (recommended for AR)
Keep BOTH indexable, but:
- Refactor AR H1s so they target distinct queries:
  - `/moon-in-jeddah` H1 → `تقويم القمر وأطوار الشهر في جدة` (calendar focus)
  - `/moon-today-in-jeddah` H1 → `حالة القمر اليوم في جدة` (today focus, unchanged)
- Refactor descriptions in parallel.
- Add `<link rel="canonical">` consolidation only if Google Search Console shows actual cannibalization.

### Option B — Canonical consolidation
Make `/moon-in-{city}` canonical to `/moon-today-in-{city}` (since /moon-today-in is the user-preferred entry point per internal links). Keeps both URLs reachable but tells Google only one should rank.

### Option C — 301 redirect
Pick a winner: 301 `/moon-in-{city}` → `/moon-today-in-{city}` OR vice versa. **Risk:** breaks the dated/monthly hierarchy (since dated pages currently use `/moon-in-{slug}/{date}` and their parent breadcrumb links to `/moon-in-{slug}`).

**Recommended:** Option A first (low risk, gives both pages purpose). Hold Option B/C until GSC data shows real cannibalization.

---

## 8. Recommended H1 pattern per page type

| Page type | URL pattern | Recommended AR H1 | Recommended EN H1 |
|---|---|---|---|
| Generic hub | `/moon-today` | `حالة القمر اليوم` *(unchanged)* | `Moon Today` *(unchanged)* |
| Today city snapshot | `/moon-today-in-{city}` | `حالة القمر اليوم في {city}` *(unchanged)* | `Moon Today in {city}` *(unchanged)* |
| Evergreen city hub | `/moon-in-{city}` | `تقويم القمر وأطوار الشهر في {city}` *(differentiate from "today")* | `Moon Calendar & Phases in {city}` |
| Monthly city | `/moon-in-{city}/{YYYY-MM}` | `أطوار القمر في {city} — {شهر} {سنة}` *(currently: just "حالة القمر في {city}" — BUG-2)* | `Moon Phases in {city} — {Month} {Year}` |
| Dated city | `/moon-in-{city}/{YYYY-MM-DD}` | `القمر في {city} يوم {DD شهر YYYY}` *(currently: just "القمر اليوم" — BUG-1)* | `Moon in {city} on {DD Month YYYY}` |

---

## 9. Which route to edit first?

**Priority order if a future fix wave is approved:**

1. **`/moon-in-{city}/YYYY-MM-DD`** (BUG-1 — H1 missing date/city) — highest impact, dated pages are the largest sitemap segment (310 per city in jeddah alone)
2. **`/moon-in-{city}/YYYY-MM`** (BUG-2 + BUG-3 — H1 missing + missing sitemap) — second largest impact
3. **`/moon-in-{city}` vs `/moon-today-in-{city}`** (cannibalization) — only if GSC shows actual impressions overlap

Touch **`/moon-today-in-{city}`** LAST, since it's already the cleanest of the three and is the user-facing entry point.

---

## 10. Duplicate SEO risk

| Pair | Risk level | Reason |
|---|---|---|
| `/moon-in-jeddah` vs `/moon-today-in-jeddah` (AR) | **MODERATE-HIGH** | H1s differ by 1 word; descriptions overlap in topic; both indexable |
| `/moon-in-jeddah` vs `/moon-today-in-jeddah` (EN) | **LOW-MODERATE** | "Moon in Jeddah" vs "Moon Today in Jeddah" — Google likely treats as different intents |
| `/moon-in-jeddah` vs `/moon-in-jeddah/2026-05` | **LOW** | Clearly different intent (hub vs monthly) |
| `/moon-in-jeddah/2026-05-23` (current bug) | **LOW-MODERATE** | H1 "القمر اليوم" matches `/moon-today` H1 — could confuse crawler about page identity. |

---

## 11. Can we start UI polish now, or do we need route cleanup first?

**Answer: We CAN start UI polish — with one constraint.**

✅ **Safe to polish:**
- `/moon-today` (the hub) — no SEO risk, well-isolated
- `/moon-today-in-{city}` (today snapshot) — already the cleanest, user-facing entry point

⚠️ **Treat with care:**
- `/moon-in-{city}` (evergreen city hub) — touch only if the polish task is **content/SEO neutral** (CSS-only, spacing, colors); don't refactor H1/title until the cannibalization decision is made
- `/moon-in-{city}/YYYY-MM` and `/moon-in-{city}/YYYY-MM-DD` — H1 bugs (BUG-1, BUG-2) should ideally be addressed BEFORE major UI polish, because the polish will rest on the existing (broken) H1

**Recommendation:** Start UI polish on `/moon-today` and `/moon-today-in-{city}` first. Defer polish of `/moon-in-{city}`, monthly, and dated pages until the cannibalization + H1-bug decisions are made (could be a one-commit wave to fix BUG-1 and BUG-2, then polish on top).

---

## 12. Summary of recommendations

| Decision | Recommendation |
|---|---|
| **Canonical policy** | Option A — keep both indexable but differentiate AR H1s (cannibalization mitigation). Don't add `<link rel="canonical">` cross-references until GSC data shows real overlap. |
| **H1 pattern** | See §8 table — most existing H1s are correct except dated + monthly (BUG-1, BUG-2). |
| **First-edit route** | Polish on `/moon-today` and `/moon-today-in-{city}` is safe. Hold `/moon-in-{city}` until H1 cannibalization is addressed. Fix dated + monthly H1s BEFORE polishing them. |
| **Duplicate SEO risk** | Moderate-high in AR for the city hub vs today-city pair. Low elsewhere. |
| **Need fix-wave before UI polish?** | **No** — but recommend a small dedicated wave to fix BUG-1 (dated H1) + BUG-2 (monthly H1) + BUG-3 (sitemap monthly) BEFORE touching the visual design of those two page types. The HUB + TODAY-CITY are safe to polish immediately. |

---

## 13. Strict scope of this report

🚫 No code changed.
🚫 No SEO / canonical / hreflang change.
🚫 No sitemap change.
🚫 No JSON-LD change.
🚫 No UI / CSS change.
🚫 No MoonCalc / math change.
🚫 No i18n string change.

Read-only audit. Source of truth: live HTTP probes on local server :4030 (2026-05-23 22:24Z), plus static analysis of `index.html`, `server.js`, `js/app.js`, and `/sitemap-*.xml`.
