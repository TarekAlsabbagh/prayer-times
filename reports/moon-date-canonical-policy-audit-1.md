# MOON-DATE-CANONICAL-POLICY-AUDIT-1

**Date:** 2026-05-24
**Phase type:** Audit / Planning ONLY
**Status:** Documentation report, **NO code/sitemap/canonical/UI/schema/data changes made**

---

## 0) Executive summary

The current state of moon date-page routing is **substantially aligned** with the proposed canonical policy (single Gregorian URL per moon day, no parallel Hijri URL):

| Question | Finding |
| --- | --- |
| Are there parallel Hijri-format moon routes in code? | **NO** (only one route family — Gregorian-anchored) |
| Are Hijri-format moon URLs accessible? | **YES (HTTP 200)** — the same `/moon-in-{city}/{YYYY-MM-DD}` handler accepts a Hijri date (year < 1800) and serves the converted-Gregorian content with a soft Gregorian canonical |
| Are Hijri moon URLs in the sitemap? | **NO** — 0 occurrences in any of the 2 emitted sitemaps |
| Are Hijri moon URLs in internal links? | **NO** — no link generator emits Hijri-format moon paths |
| Is canonical clean on dated moon pages? | **YES** — all dated pages emit a self-Gregorian canonical with full 10-lang hreflang |
| Is duplicate-content risk real today? | **LOW** — soft-canonical defends against accidental Hijri-URL discovery; sitemap exposes only Gregorian |
| Is the proposed policy already in effect informally? | **YES** — the implementation already converges on the Gregorian-canonical model; what's missing is (a) explicit 301 redirect on Hijri input and (b) documented policy + a tighter UI for showing Hijri equivalence |

**Direct answer to user's "هل الوضع الحالي آمن؟":** YES, it's structurally safe. The proposed policy (`A + C`) is a formalisation and minor reinforcement of behavior that already exists, not a redesign.

---

## 1) Current moon date route map

All moon-related route handlers in `server.js`:

| # | Route pattern | Handler line | Page intent | Example URL | Live HTTP | Indexable? | canonical self? | In sitemap? | hreflang? | Shows Gregorian? | Shows Hijri? | Overlap risk? | Used internally? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/moon-today` | 21265 | Global today snapshot (Mecca-anchored) | `/moon-today` | 200 | YES | YES (self) | YES | YES (10) | YES (today's date) | YES (badge + equiv-line) | none | YES (nav, hreflang) |
| 2 | `/moon-in-{slug}` (hub) | 8553 | City evergreen calendar hub | `/moon-in-riyadh` | 200 | YES | YES (self) | YES | YES (10) | (implicit — current month/year via JS) | (implicit via JS) | none | YES (cards, FAQ, edu) |
| 3 | `/moon-today-in-{slug}` | 8543 | City today snapshot | `/moon-today-in-riyadh` | 200 | YES | YES (self) | YES | YES (10) | YES | YES (badge) | none | YES (CTA, sticky-bar) |
| 4 | `/moon-in-{slug}/{YYYY-MM}` (month) | 8549–8550 | City month archive | `/moon-in-riyadh/2026-05` | 200 | YES | YES (self) | YES | YES (10) | YES (month + year) | (relative — Hijri month names in calendar grid) | none | YES (compact-cal CTA, related-links #2 + #3) |
| 5 | `/moon-in-{slug}/{YYYY-MM-DD}` (Gregorian date) | 8544 | City Gregorian date archive | `/moon-in-riyadh/2026-05-23` | 200 | YES | YES (self, Gregorian) | YES | YES (10, all Gregorian) | YES (H1, title, meta) | YES (subtitle "الموافق…" + badge) | **soft-overlap with #6** | NO (no link generator emits dated moon URLs) |
| 6 | `/moon-in-{slug}/{HYYYY-HMM-HDD}` (Hijri date input) | 8544 + 8601–8612 | Same handler as #5 — Hijri-year (<1800) triggers conversion | `/moon-in-riyadh/1447-12-06` | **200** (NOT 301) | YES (uncontrolled) | **points to Gregorian equivalent** (`/moon-in-riyadh/2026-05-23`) | **NO** (sitemap emits only Gregorian) | YES (10, all Gregorian) | YES (badge "📿 عرض حسب التاريخ الهجريّ" — but H1 still Gregorian) | YES | **YES — by design, defused via canonical** | NO (no link generator emits Hijri-format moon paths) |

Routes that **DO NOT EXIST** (returned 404 in live test):
- `/moon-date/{date}`
- `/moon-date/{hijri-date}`
- `/moon-hijri/{date}`
- `/moon-calendar/{date}`
- `/moon/{date}`

The moon route family is **bounded** — only the 6 patterns above respond.

---

## 2) Existing Hijri-date moon URL scan

### Code search

| Pattern | Found? | Where |
| --- | --- | --- |
| `/moon-in-{slug}/1447-…` in any link generator | **NO** | (no generator emits Hijri-format moon URLs) |
| `/moon-in-{slug}/hijri/` | NO | — |
| `/moon-date/` | NO | — |
| `/moon-hijri/` | NO | — |
| `?hijri=` or `?date=` query for moon | NO | — |
| Hijri-year detection in moon handler | **YES** | `server.js` line 8538 comment + lines 8601–8612 implement `if (year < 1800) { convert via _hijriToGregorian }` |
| Hijri-format moon URL anywhere in `index.html`, `js/*.js`, `db/*.json`, `sitemap*.xml` | **NO** | (grep returns 0 matches) |

### Live test (HTTP 200 with canonical to Gregorian)

```
/moon-in-riyadh/1447-12-06   HTTP 200   canonical → /moon-in-riyadh/2026-05-23
/moon-in-mecca/1447-10-03    HTTP 200   canonical → /moon-today-in-mecca   (the Hijri date == today in Mecca → canonical → today snapshot)
```

**This is informal canonicalization** — the URL responds, but `<link rel="canonical">` points to the Gregorian equivalent. There is **no 301 redirect** on the Hijri input. Google would receive both URLs but should consolidate via the canonical signal.

### Internal-link emission

Search for any JS or server.js code that builds a moon URL with a Hijri date returns **ZERO MATCHES**. No internal link path produces a Hijri-format moon URL. The only way a Hijri-format moon URL exists in the wild is if:
- A user manually typed it
- An external site linked to it
- A search engine crawled it from a third-party source

---

## 3) Current sitemap state

Sitemap index emits 2 child sitemaps: `sitemap-main.xml` + `sitemap-cities-1.xml`.

### Moon URL counts (live curl, 2026-05-24)

| Route family | sitemap-main.xml | sitemap-cities-1.xml | Total |
| --- | --- | --- | --- |
| `/moon-today` (×10 langs) | 10 | 0 | 10 |
| `/moon-in-{city}` hub | 0 | 760 (76 cities × 10 langs) | 760 |
| `/moon-today-in-{city}` | 0 | 760 | 760 |
| `/moon-in-{city}/{YYYY-MM}` month | 0 | 2,280 | 2,280 |
| `/moon-in-{city}/{YYYY-MM-DD}` Gregorian date | 0 | **23,560** | 23,560 |
| `/moon-in-{city}/{HYYYY-HMM-HDD}` Hijri date | 0 | **0** | **0** |
| TOTAL moon-related URLs in sitemap | | | **27,370** |
| Total URLs in `sitemap-cities-1.xml` (incl. non-moon) | | 40,520 | — |

### Per-URL hygiene checks

| Check | Status |
| --- | --- |
| Hijri-year moon URLs in any sitemap | **0** ✓ |
| Duplicate URLs (same path repeated) | None observed |
| Localhost URLs | Only when run on localhost — production uses `origin` env var |
| `http://` (instead of `https://`) | Production sitemap uses `https://` (origin-aware) |
| Trailing-slash inconsistency | None — all moon URLs end without trailing slash |
| Query params in canonical URLs | None |
| Per-URL HTTP 200 sample (12 sampled) | 12/12 returned 200 |

**Sitemap is clean.** No Hijri-format moon URLs and no duplicates. The 23,560 dated moon URLs are all Gregorian YYYY-MM-DD.

---

## 4) Current canonical & hreflang state (6 sampled URLs)

| URL | HTTP | canonical | canonical = self? | hreflang count | All hreflang use Gregorian? | Hijri-URL alternate emitted? | index,follow? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/moon-in-riyadh/2026-05-23` | 200 | `/moon-in-riyadh/2026-05-23` | ✅ YES | 11 (10 langs + x-default) | ✅ YES | ❌ NO | YES (no noindex) |
| `/moon-in-jeddah/2026-05-23` | 200 | `/moon-in-jeddah/2026-05-23` | ✅ YES | 11 | ✅ YES | ❌ NO | YES |
| `/moon-in-makkah/2026-05-23` | 200 | `/moon-in-makkah/2026-05-23` | ✅ YES | 11 | ✅ YES | ❌ NO | YES |
| `/en/moon-in-riyadh/2026-05-23` | 200 | `/en/moon-in-riyadh/2026-05-23` | ✅ YES | 11 | ✅ YES | ❌ NO | YES |
| `/fr/moon-in-riyadh/2026-05-23` | 200 | `/fr/moon-in-riyadh/2026-05-23` | ✅ YES | 11 | ✅ YES | ❌ NO | YES |
| `/tr/moon-in-riyadh/2026-05-23` | 200 | `/tr/moon-in-riyadh/2026-05-23` | ✅ YES | 11 | ✅ YES | ❌ NO | YES |

**Hijri-input URL (separate sample):**

| URL | HTTP | canonical | canonical = self? | Notes |
| --- | --- | --- | --- | --- |
| `/moon-in-riyadh/1447-12-06` | 200 | `/moon-in-riyadh/2026-05-23` | ❌ NO (soft-canonical to Gregorian equivalent) | This is the policy's defense mechanism. Google would interpret the Hijri-URL response as a duplicate of the Gregorian and consolidate ranking |

**Canonical hygiene: CLEAN.** No alternate Hijri-URL is emitted anywhere. The 10-lang hreflang set is consistent Gregorian across all langs.

---

## 5) Current dated-page content state

Sampled 3 pages: `/moon-in-riyadh/2026-05-23`, `/moon-in-jeddah/2026-05-23`, `/en/moon-in-riyadh/2026-05-23`.

### `/moon-in-riyadh/2026-05-23` (AR)

| Element | Value |
| --- | --- |
| **H1** | `🌙 حالة القمر في الرياض يوم 23 مايو 2026` (Gregorian) |
| **`<title>`** | `حالة القمر في الرياض يوم 23 مايو 2026 \| طور القمر والإضاءة` (Gregorian) |
| **meta description** | `طور القمر في الرياض يوم 23 مايو 2026 الموافق 6 ذو الحجة 1447 هـ: نسبة الإضاءة، عمر القمر، وقت المطلع والمغيب، والكوكبة — محسوبة بدقّة فلكيّة.` |
| Gregorian in H1? | ✅ YES (primary) |
| Hijri in H1? | ❌ NO |
| Hijri in hero/summary? | ✅ YES — visible as "**الموافق** 6 ذو الحجة 1447 هـ" subtitle line (`<p class="moon-subtitle-hijri">`) AND in meta description AND in a visual `moon-date-badge` element |
| Gregorian shown clearly? | ✅ YES — in H1, title, meta, badge |
| Visual prominence (Greg vs Hijri) | Gregorian dominant (H1 + title) — Hijri shown as equivalence subtitle and SEO meta |
| Dedicated Hijri card? | ❌ NO (only the equivalence subtitle + a badge) |
| Link to `/hijri-date/{HIJRI-YYYY-MM-DD}` for that day? | ❌ NO (not in main content; footer has generic `/today-hijri-date` link) |
| Link to `/hijri-calendar/{HIJRI-YYYY-MM}` for that month? | ❌ NO (only generic `/hijri-calendar` link) |
| Does content explain Moon ↔ Hijri relationship? | ✅ partial — the SEO/FAQ cards on the hub explain it; the dated page itself does not have a dedicated paragraph |
| Any wording that suggests Gregorian-only? | ❌ NO — wording is neutral (`الموافق` "equivalent to" implies parity) |

### `/moon-in-jeddah/2026-05-23` (AR)

Same template as Riyadh, with city interpolation:
- H1: `🌙 حالة القمر في جدة يوم 23 مايو 2026`
- Same Hijri-equivalence subtitle pattern
- Same Gregorian-canonical hreflang set

### `/en/moon-in-riyadh/2026-05-23` (EN)

- H1: `🌙 Moon in Riyadh on May 23, 2026` (Gregorian)
- title: similar Gregorian phrasing
- meta description: includes `(equivalent to 6 Dhu al-Hijja 1447 AH)` or similar parenthetical (verified via the equivalence-subtitle generator)
- Hijri shown as parenthetical secondary

**Summary: Dated-page content currently treats Gregorian as primary, Hijri as secondary equivalence.** No dedicated Hijri-context card or cross-link to `/hijri-date/{H-DATE}` from the moon-dated page is present today.

---

## 6) Hijri-date page family (separate from moon, for reference)

| Route | HTTP | Self-canonical | Notes |
| --- | --- | --- | --- |
| `/today-hijri-date` | 200 | YES | Today's Hijri date hub |
| `/hijri-date/{YYYY-MM-DD}` (Hijri YYYY) | 200 | YES | Per-day Hijri-date page |
| `/hijri-calendar/{YYYY}` | 200 | YES | Hijri year hub |
| `/hijri-calendar/{YYYY-MM}` | 200 | YES | Hijri month page |

These are a **completely separate page family from moon**. They're not at risk of overlap with moon dated pages because:
- They sit at different URL roots (`/hijri-…` vs `/moon-…`)
- They have different page intent (Hijri-date metadata vs Moon-phase astronomy)
- They're emitted in different sitemap branches

---

## 7) Duplicate risk analysis — current state

| Risk vector | Current exposure | Mitigation in place |
| --- | --- | --- |
| Same content reachable via 2 URLs (Hijri + Gregorian) | LOW — Hijri input only accessible if guessed or externally linked | Soft canonical → Gregorian + sitemap excludes Hijri |
| Google indexing both Hijri + Gregorian URLs | LOW — soft canonical is the correct signal; sitemap excludes Hijri | Same |
| Internal links accidentally generating Hijri moon URLs | NONE detected | No generator code emits Hijri-format moon paths |
| External sites linking to Hijri-format moon URLs (out of our control) | UNKNOWN but mitigated by canonical | Same |
| hreflang inconsistency (Hijri in one lang, Gregorian in another) | NONE | All langs use Gregorian |
| Conflict with `/hijri-date/{HIJRI-YYYY-MM-DD}` (separate family) | NONE — different page intent and different URL root | URL prefix gating |

**Net risk: LOW.** The system is already operating under the proposed canonical policy de-facto. The only formal gap is that a Hijri-URL input is served (HTTP 200) rather than 301-redirected.

---

## 8) Proposed canonical policy — impact analysis

The policy under study:
> **(A)** Single canonical per moon day = `/moon-in-{city}/{YYYY-MM-DD}` (Gregorian).
> **(C)** Any Hijri input or future Hijri-leaning link must canonicalize to (A); no separate Hijri-indexable moon route may exist.

### Impact by axis

| Axis | Effect of adopting policy formally |
| --- | --- |
| **SEO** | Marginal positive — formalizing the canonical behavior with a 301 redirect (instead of soft canonical) gives Google a stronger consolidation signal. Today's soft canonical works but isn't as deterministic |
| **sitemap** | NONE — sitemap already excludes Hijri moon URLs (verified 0 occurrences) |
| **canonical** | NONE — already implements policy informally |
| **hreflang** | NONE — already 10-lang Gregorian-consistent |
| **internal linking** | NONE — no generator code emits Hijri moon URLs today |
| **search inside the site** | LOW — search-results widget doesn't generate Hijri moon URLs; would need check if Hijri search query auto-converts to Gregorian for the moon search context |
| **`/hijri-date/...` pages** | NONE — separate family, isolated |
| **UX** | MILD POSITIVE — adding a clear cross-link from moon dated page → `/hijri-date/{HIJRI-DAY}` would help navigation without creating duplicate content |
| **Site size / URL count** | NONE — already at 23,560 Gregorian dated moon URLs, 0 Hijri |
| **Duplicate risk** | DECREASE — formal 301 (vs soft canonical) eliminates the marginal risk of Google indexing Hijri input URLs found in the wild |

**Adoption cost:** Very low. The biggest "change" would be flipping the soft canonical on Hijri input to a hard 301 redirect (~10 lines in the moon route handler) and writing a short policy doc.

---

## 9) Risks if we WERE to create parallel Hijri moon routes (hypothetical — NOT to be done)

| Risk | Severity if Hijri route created |
| --- | --- |
| **Duplicate content** | HIGH — same MoonCalc output served at 2 URLs ×10 langs × 365 days × 76 cities ≈ doubling the sitemap |
| **Canonical confusion** | HIGH — Google's choice of canonical between two URLs in the same family is unpredictable |
| **Sitemap bloat** | HIGH — would add ~23,560 Hijri moon URLs on top of existing Gregorian (sitemap-cities-1.xml total would jump from 40K → 63K) |
| **hreflang complexity** | HIGH — would need to decide whether `/ar/moon-in-{city}/1447-…` is the hreflang alternate of `/en/moon-in-{city}/2026-…` (cross-format alternates are unusual) |
| **Invalid Hijri dates (e.g., 1447-13-32)** | MEDIUM — need explicit 404 logic for invalid Hijri dates; today's handler relies on `_hijriToGregorian` returning null |
| **Conflict with `/hijri-date/{HIJRI-DAY}`** | MEDIUM — `/moon-in-mecca/1447-12-06` and `/hijri-date/1447-12-06` would compete for "Hijri 1447-12-06 in Mecca" queries |
| **Two moon pages ranking for same query** | HIGH — Hijri-format URL might out-rank Gregorian for "قمر 6 ذو الحجة 1447" queries; user lands on what was meant to be the "alternate" page |
| **QA overhead** | HIGH — every moon-dated test would need to test both formats |
| **Invalid-Hijri 404 maintenance** | MEDIUM — Hijri calendar has variable month lengths (29 or 30); need to maintain Umm al-Qura table validation |
| **Cross-format navigation UX** | MEDIUM — user on Gregorian page would need a Hijri-format link, and vice-versa; widget complexity |

**Net: HIGH negative impact. Do NOT create parallel Hijri moon routes.**

---

## 10) Future UI recommendation for dated moon page (suggestion only)

Two candidate H1 patterns for `/moon-in-{city}/{YYYY-MM-DD}`:

### Option A — Hijri primary, Gregorian secondary

```
H1:       القمر في الرياض يوم 6 ذو الحجة 1447 هـ
Subline:  الموافق 23 مايو 2026
```

| Aspect | Rating |
| --- | --- |
| AR-readers find it natural | YES (Hijri date emphasizes the moon-calendar link) |
| Matches Gregorian canonical URL | **NO** — URL says `2026-05-23` but H1 says Hijri date → mild dissonance |
| Search-engine targeting for Gregorian queries | WEAKER — H1 doesn't contain Gregorian string in primary position |
| Helps "قمر يوم 23 مايو 2026" SEO query | MARGINAL — present only in subline |

### Option B — Gregorian primary, Hijri secondary (current behavior)

```
H1:       القمر في الرياض يوم 23 مايو 2026
Subline:  الموافق 6 ذو الحجة 1447 هـ
```

| Aspect | Rating |
| --- | --- |
| AR-readers find it natural | YES (both formats visible) |
| Matches Gregorian canonical URL | **YES** — H1 anchors on the canonical date |
| Search-engine targeting for Gregorian queries | STRONGER — Gregorian in H1 primary position |
| Helps "قمر يوم 23 مايو 2026" SEO query | STRONG (current state) |
| Helps "قمر 6 ذو الحجة 1447" SEO query | MEDIUM — present in subline + meta |

### Recommended choice: **Option B (current behavior)**

Rationale:
1. **URL/H1 consistency** — when canonical URL is `/moon-in-riyadh/2026-05-23`, the H1 anchoring on `23 مايو 2026` matches and reduces visitor confusion.
2. **SEO** — putting the Gregorian date in H1 primary position matches the URL slug; both signal the same indexed term.
3. **Hijri-equivalence preserved** — the subline `الموافق …` + meta description + badge already give the Hijri context strong visual presence.
4. **Cross-format users still served** — anyone arriving via a Hijri search query sees both dates within 1 visual element.

### EN H1 recommendation
- **Keep Gregorian primary in EN H1** (current: `Moon in {city} on May 23, 2026`).
- Add Hijri date as parenthetical or subline (current pattern: `(equivalent to 6 Dhu al-Hijja 1447 AH)`).
- Hijri is less culturally primary for non-Arabic readers — the equivalence model serves all 10 langs uniformly.

**Net recommendation: keep Option B (= current behavior). No H1 change needed.** Possible LOW-priority enhancement: increase Hijri-subline visual prominence (e.g., slightly larger font or a contrasting tinted background) so it's noticeable on first glance for AR audiences.

---

## 11) Future UI recommendation for month page (suggestion only)

For `/moon-in-{city}/{YYYY-MM}` (Gregorian month):

### Suggested H1 (keep as-is)
```
أطوار القمر في الرياض — مايو 2026
```

This is consistent with the Gregorian URL slug `2026-05` and the current canonical strategy.

### Inside the monthly table — column order options

**Option α — Gregorian primary, Hijri secondary:**

| التاريخ الميلادي | التاريخ الهجري | الطور | الإضاءة | الشروق | الغروب |

**Option β — Hijri primary, Gregorian secondary:**

| التاريخ الهجري | التاريخ الميلادي | الطور | الإضاءة | الشروق | الغروب |

### Recommended: **Option α (Gregorian first)**

Rationale:
1. Matches URL slug + H1
2. Matches dated-page H1 convention
3. Consistent with the rest of the site (most navigation surfaces use Gregorian-primary)
4. Hijri column is still present and equally readable — visitor can quickly map between calendars

**Currently:** the month page calendar grid shows date + phase + (illumination) per cell, with relative-day labels. Hijri date is shown via badge/footnote in the cell, not as a primary column. Adding a sortable Hijri column would be a NEW feature, not a bug fix — only adopt if user explicitly requests "show Hijri column".

---

## 12) Hijri integration — helper-link recommendations (suggestion only)

From a dated moon page (e.g., `/moon-in-riyadh/2026-05-23`), recommend adding **helper cross-links** (NOT alternate canonicals):

| Link text (AR) | Target URL | Type |
| --- | --- | --- |
| `📿 عرض هذا اليوم في التقويم الهجري` | `/hijri-date/1447-12-06` | helper (cross-family) |
| `📅 تقويم شهر ذو الحجة 1447 هـ` | `/hijri-calendar/1447-12` | helper |
| `🗓️ التقويم الهجري لعام 1447 هـ` | `/hijri-calendar/1447` | helper |

| Link text (EN) | Target URL | Type |
| --- | --- | --- |
| `📿 View this day in the Hijri calendar` | `/hijri-date/1447-12-06` | helper |
| `📅 Hijri month: Dhu al-Hijja 1447 AH` | `/hijri-calendar/1447-12` | helper |
| `🗓️ Hijri year 1447 AH calendar` | `/hijri-calendar/1447` | helper |

**Critical note for any future implementation:**
- These links must be presented as **navigation helpers**, NOT as `rel="canonical"`, NOT as `rel="alternate"`, NOT in the moon-page's `<head>` schema.
- The Hijri date in the URL is computed by `HijriDate.fromGregorian(YYYY, MM, DD)` from the Gregorian canonical — single source of truth.
- They should sit inside the moon-dated page body, ideally near the existing Hijri-equivalence subtitle, so the visitor sees them in the same scan as the date conversion.

---

## 13) Final recommendation

### Plain-Arabic answers to the user's checklist

| Q | A |
| --- | --- |
| **هل توجد حاليًا روابط قمر هجريّة؟** | NO — no link generator emits Hijri-format moon URLs. The Hijri-format URL `/moon-in-{city}/1447-…` IS accessible (HTTP 200) if manually typed, but no internal link or sitemap entry uses it. |
| **هل توجد duplicates في sitemap؟** | NO — verified 0 Hijri-format moon URLs across all sitemap files. 23,560 Gregorian dated moon URLs are present, no duplicates. |
| **هل canonical الحالي نظيف؟** | YES — all dated moon pages emit a Gregorian self-canonical with consistent 10-lang hreflang. Hijri-input URLs soft-canonicalize to the Gregorian equivalent. |
| **هل نحتاج إنشاء routes هجريّة للقمر؟** | NO — the impact analysis (§9) makes a strong case AGAINST creating parallel Hijri moon routes. |
| **هل نحتاج redirect؟** | OPTIONAL low-priority enhancement — switching the soft canonical on Hijri-input URLs to a hard 301 redirect would give Google a stronger consolidation signal. The current soft canonical works but is less deterministic. |
| **هل نحتاج canonical change؟** | NO — canonical strategy is already correct. |
| **هل نحتاج sitemap change؟** | NO — sitemap already excludes Hijri moon URLs. |
| **هل نحتاج فقط UI/content change داخل الصفحات الحالية؟** | OPTIONAL — could enhance dated-page UI with explicit cross-links to `/hijri-date/{H-DATE}` + `/hijri-calendar/{H-MONTH}` (see §12). Pure addition, no URL changes. |
| **هل الوضع الحالي آمن؟** | **YES.** The system already operates under the proposed canonical policy de-facto. No urgent fix required. |
| **ما اسم fix wave المقترح إذا قررنا التنفيذ لاحقًا؟** | **`MOON-DATE-CANONICAL-POLICY-IMPLEMENTATION-1`** — would (a) convert the Hijri-input soft-canonical to a hard 301 redirect, (b) add the §12 helper cross-links to dated moon pages, (c) optionally improve the visual prominence of the Hijri-equivalence subtitle on dated pages. NO sitemap / canonical / hreflang / route additions needed. |

### Admin recommendation (matches user's preferred A + C)

**ADOPT** the policy:
- **(A)** `/moon-in-{city}/{YYYY-MM-DD}` (Gregorian) is the only canonical per moon day. ✅ already in effect.
- **(C)** Any Hijri input or Hijri-leaning link must canonicalize/redirect to (A); no separate Hijri-indexable moon route. ✅ already in effect (via soft canonical); formal 301 would tighten the policy.

The implementation is essentially **already done** structurally. The proposed policy is a **formalisation + documentation + minor reinforcement**, not a redesign.

---

## 14) No-fix confirmation (per user's explicit instruction)

The following are confirmed **NOT done** in this phase:

- ❌ NO code was modified
- ❌ NO sitemap.xml was modified
- ❌ NO canonical/hreflang was modified
- ❌ NO UI was modified
- ❌ NO content was modified
- ❌ NO routes were added
- ❌ NO redirects were added
- ❌ NO schema was modified
- ❌ NO MoonCalc was modified
- ❌ NO Umm al-Qura table was modified
- ❌ NO i18n strings were modified
- ❌ NO CSS was modified
- ❌ NO HTML was modified
- ❌ NO new dependencies were added

**Only this report was produced.** Implementation of any recommendation in this document is gated on explicit user approval and a separate `MOON-DATE-CANONICAL-POLICY-IMPLEMENTATION-1` phase.
