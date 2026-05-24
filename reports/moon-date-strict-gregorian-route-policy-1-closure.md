# MOON-DATE-STRICT-GREGORIAN-ROUTE-POLICY-1 — Closure

**Date:** 2026-05-24
**Status:** CLOSED, awaiting user approval
**Scope:** Moon dated/month route handlers in `server.js` ONLY
**Implementation commit:** (TBD on stage)

---

## 1) Reason for the change

The site has **not yet been published**. Per the user's decision:

- No external backlinks to protect → no need for 301 redirects on Hijri-format moon URLs
- Best to launch with a **clean canonical model**: one Gregorian URL per moon day, no aliases, no soft canonical, no duplicate paths
- The `MOON-DATE-CANONICAL-POLICY-AUDIT-1` audit (commit `7c613be`) found the moon dated/month route silently accepted Hijri-format dates (year < 1800) and returned HTTP 200 with a soft Gregorian canonical. Pre-launch, the cleaner approach is **404 with noindex** so the URL family stays strictly Gregorian.

## 2) Behavior — before vs after

| URL | Before | After |
| --- | --- | --- |
| `/moon-in-riyadh/2026-05-23` | HTTP 200, canonical=self | HTTP 200, canonical=self **(unchanged)** |
| `/moon-in-riyadh/2026-05` (month) | HTTP 200, canonical=self | HTTP 200, canonical=self **(unchanged)** |
| `/moon-in-riyadh/1447-12-06` (Hijri date) | **HTTP 200** with soft canonical → `/moon-in-riyadh/2026-05-23` | **HTTP 404 + `X-Robots-Tag: noindex,nofollow`** |
| `/moon-in-riyadh/1447-12-30` (invalid Hijri date) | HTTP 200 (out-of-range, noindex) | **HTTP 404** |
| `/moon-in-riyadh/1356-01-01` (old Hijri) | HTTP 200 | **HTTP 404** |
| `/moon-in-riyadh/1447-12` (Hijri month) | (was already 404 — month had year guard) | **HTTP 404 (now with branded body + noindex)** |
| `/moon-in-riyadh/1500-01` (Hijri month, low year) | (was already 404) | **HTTP 404 (now with branded body + noindex)** |

## 3) Files changed (1)

- `server.js` — 3 surgical edits inside `buildSeoForPath()` + `serveHtmlWithSeo()`:
  1. Added `_isMoonDatedMatch = !!(_MD && parseInt(_MD[4], 10) >= 1800)` guard (mirrors the existing month-route year guard at line 8551)
  2. Switched the match-chain to consult the new guard: `m = _MT || (_isMoonDatedMatch ? _MD : null) || (_isMoonMonthMatch ? _MM : null) || _MH`
  3. Removed the now-dead `_hijriToGregorian` conversion block (legacy Hijri-input branch)
  4. Added `_isMoonHijriReject` flag → exported via `seo.moonHijriReject` to the SEO return object
  5. Added early-return 404 emission in `serveHtmlWithSeo()` when `seo.moonHijriReject === true` — branded HTML body + `X-Robots-Tag: noindex,nofollow` + Cache-Control no-cache

**No other files changed.** No sitemap, no canonical/hreflang for valid Gregorian pages, no UI, no content, no MoonCalc, no Umm al-Qura, no i18n, no CSS, no HTML, no new dependencies.

## 4) Acceptance test results (live SSR on port 3227)

### A. Valid Gregorian → 200

| URL | Status | Expected |
| --- | --- | --- |
| `/moon-in-riyadh/2026-05-23` | **HTTP 200** | 200 ✅ |
| `/moon-in-jeddah/2026-05-23` | **HTTP 200** | 200 ✅ |
| `/en/moon-in-riyadh/2026-05-23` | **HTTP 200** | 200 ✅ |

### B. Hijri-looking moon URLs → 404 + noindex

| URL | Status | X-Robots-Tag |
| --- | --- | --- |
| `/moon-in-riyadh/1447-12-06` | **HTTP 404** ✅ | `noindex,nofollow` ✅ |
| `/moon-in-jeddah/1447-12-06` | **HTTP 404** ✅ | `noindex,nofollow` ✅ |
| `/en/moon-in-riyadh/1447-12-06` | **HTTP 404** ✅ | `noindex,nofollow` ✅ |

### C. Invalid Hijri-looking + Hijri month → 404

| URL | Status |
| --- | --- |
| `/moon-in-riyadh/1447-12-30` | **HTTP 404** ✅ |
| `/moon-in-riyadh/1356-01-01` | **HTTP 404** ✅ |
| `/moon-in-riyadh/1447-12` (Hijri month format) | **HTTP 404** ✅ |
| `/moon-in-riyadh/1500-01` (Hijri month, very low year) | **HTTP 404** ✅ |

### D. Sitemap UNCHANGED — no Hijri URLs ever existed

| Route family | Count | Baseline (from AUDIT-1) | Status |
| --- | --- | --- | --- |
| `/moon-in-{city}/{YYYY-MM-DD}` (Gregorian) | **23,560** | 23,560 | ✅ unchanged |
| `/moon-in-{city}/{YYYY-MM}` (Gregorian month) | **2,280** | 2,280 | ✅ unchanged |
| `/moon-in-{city}` (hub) | **760** | 760 | ✅ unchanged |
| `/moon-today-in-{city}` | **760** | 760 | ✅ unchanged |
| **Hijri-format moon URLs** | **0** | 0 | ✅ confirmed |

No duplicates. No localhost. No `http://` (in production, origin-aware).

### E. Canonical + hreflang on Gregorian page UNCHANGED, 404 body clean

| Element | Value |
| --- | --- |
| `/moon-in-riyadh/2026-05-23` canonical | `http://localhost:3227/moon-in-riyadh/2026-05-23` (self) ✅ |
| `/moon-in-riyadh/2026-05-23` hreflang count | 11 (10 langs + x-default) ✅ |
| `/moon-in-riyadh/1447-12-06` canonical count | **0** ✅ (404 body has no canonical) |
| `/moon-in-riyadh/1447-12-06` hreflang count | **0** ✅ (404 body has no hreflang) |
| `/moon-in-riyadh/1447-12-06` noindex meta | **present** ✅ (`<meta name="robots" content="noindex,nofollow">`) |

### F. Regression — sibling routes and Hijri-date family unchanged

| URL | Status | Notes |
| --- | --- | --- |
| `/moon-today` | **HTTP 200** ✅ | global today hub — untouched |
| `/moon-in-riyadh` | **HTTP 200** ✅ | city hub — untouched |
| `/moon-today-in-riyadh` | **HTTP 200** ✅ | city today snapshot — untouched |
| `/moon-in-riyadh/2026-05` | **HTTP 200** ✅ | Gregorian month — untouched |
| `/hijri-date/1447-12-06` | **HTTP 200** ✅ | separate Hijri-date family — untouched |
| `/hijri-calendar/1447` | **HTTP 200** ✅ | Hijri year hub — untouched |
| `/hijri-calendar/1447-12` | **HTTP 200** ✅ | Hijri month — untouched |
| `/today-hijri-date` | **HTTP 200** ✅ | today's Hijri date hub — untouched |

## 5) Confirmations (per user's explicit no-list)

- ✅ **No 301 redirects** introduced. The Hijri-format URL now returns **404**, not 301 (per user's pre-launch decision).
- ✅ **No new routes** added for Hijri moon URLs. The only change is REJECTING Hijri-format URLs at the existing route handler.
- ✅ **Sitemap NOT modified** — was already clean (0 Hijri moon URLs); verified post-change.
- ✅ **No UI changes** — no HTML, no CSS, no i18n strings touched.
- ✅ **No content changes** — no string in any rendered moon page changed.
- ✅ **No MoonCalc / Umm al-Qura changes** — astronomy code untouched.
- ✅ **No canonical policy changes for valid Gregorian pages** — `/moon-in-{city}/{YYYY-MM-DD}` still emits self-Gregorian canonical with 10-lang hreflang exactly as before.
- ✅ **`/hijri-date/...` family untouched** — these are a separate page family and respond HTTP 200 normally.
- ✅ **No new dependencies** added.

## 6) Implementation detail — why a flag (not direct `res.end`)

The natural place to detect a Hijri-format moon URL is `buildSeoForPath()` where the URL regex is parsed. However that function is **pure** — it has no access to `res`, only to `urlPath`. Calling `res.end()` from inside it would be an architectural violation (and broke the first attempt with `ReferenceError: res is not defined`).

The clean solution: `buildSeoForPath` sets a flag `moonHijriReject: true` in the returned SEO object. The route caller `serveHtmlWithSeo(htmlBuf, urlPath, res, …)` already has `res` and checks this flag at the top of its body. When set, it emits the 404 response and returns immediately, bypassing the rest of the SEO pipeline.

This keeps SEO computation pure and concentrates response-mutation in one place. The flag is opt-in: only the moon-dated/month routes set it, no other URL pattern is affected.

## 7) Commit message draft

```
fix(moon,seo): MOON-DATE-STRICT-GREGORIAN-ROUTE-POLICY-1 — reject Hijri-format moon URLs with 404 (pre-launch clean policy)

Pre-launch decision per user: the moon dated/month route should accept
ONLY Gregorian dates (YYYY >= 1800). Hijri-format URLs
(/moon-in-{city}/1447-XX-XX) — which previously returned HTTP 200 with
a soft Gregorian canonical — now return HTTP 404 with X-Robots-Tag:
noindex,nofollow and a branded HTML body explaining the policy.

Rationale: site is not yet published → no backlinks to protect → 301
isn't justified. The cleaner launch posture is one canonical Gregorian
URL per moon day with no aliases.

Behavior changes (verified via live SSR on port 3227):
 - /moon-in-{city}/{YYYY-MM-DD} (Gregorian, year>=1800)  → 200 (unchanged)
 - /moon-in-{city}/{YYYY-MM} (Gregorian month, year>=1800) → 200 (unchanged)
 - /moon-in-{city}/{HYYYY-HMM-HDD} (year<1800)            → 404 (was 200)
 - /moon-in-{city}/{HYYYY-HMM} (year<1800, Hijri month)   → 404 (was already 404, now branded body)

Implementation (server.js — 1 file changed):
 - Added _isMoonDatedMatch year guard, mirroring the existing _isMoonMonthMatch
   guard at line 8551
 - Switched the match-chain to consult both guards
 - Removed the now-dead _hijriToGregorian conversion branch
 - Added _isMoonHijriReject flag → exported via seo.moonHijriReject
 - Added early-return 404 emission in serveHtmlWithSeo() when the flag is set
   (branded HTML body + X-Robots-Tag header + Cache-Control no-cache)

Scope confinement:
 - /hijri-date/{HIJRI-YYYY-MM-DD} — UNCHANGED (separate page family)
 - /hijri-calendar/{HIJRI-YYYY}[/MM] — UNCHANGED
 - /today-hijri-date — UNCHANGED
 - /moon-today, /moon-in-{city}, /moon-today-in-{city} — UNCHANGED
 - sitemap — UNCHANGED (was already 0 Hijri moon URLs; 23,560 Gregorian
   dated + 2,280 month + 760 hub + 760 today-in + 10 today preserved)
 - canonical/hreflang for valid Gregorian dated pages — UNCHANGED
 - No UI, no content, no MoonCalc, no Umm al-Qura, no i18n changes

Closure: reports/moon-date-strict-gregorian-route-policy-1-closure.md
```
