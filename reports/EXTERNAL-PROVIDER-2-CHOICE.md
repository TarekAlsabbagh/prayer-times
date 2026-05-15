# EXTERNAL-PROVIDER-2-CHOICE — Comparison + Recommendation

**Generated**: 2026-05-15
**Phase**: `EXTERNAL-PROVIDER-2` (study phase — no code yet)
**Goal**: pick a 2nd external geocoder that fires when Nominatim returns
`rate_limited` / `timeout` / `error`. The provider plugs behind the
existing `external_cache` table (migration 003) and `_searchExternalPlaces`
cascade in `server.js`.

---

## Current cascade (for context)

```
/api/search-place ?q=…
  ├─ Tier 1 — curated_places       (in-memory, instant — 1,011 entries)
  ├─ Tier 2 — discovered_places    (Supabase RPC — user-clicked external results)
  ├─ Tier 3 — _searchExternalPlaces
  │    ├─ external_cache lookup    (Supabase, persistent — 7d ok / 24h empty / 1h err)
  │    ├─ _externalMemCache lookup (per-process Map, 1000 entries LRU)
  │    ├─ _externalInflight        (single-flight dedupe)
  │    └─ Nominatim                (api.nominatim.openstreetmap.org/search)
  │        └─ if 429 / 5xx / timeout → status='rate_limited' or 'error'
  │            ← NEW: PROVIDER-2 fallback inserts here
  └─ return { results, source, status }
```

The cache key is already provider-prefixed:
`${provider}|${lang}|${normalizedQuery}` — adding a 2nd provider needs
zero schema change. The Supabase `external_cache.provider` column
already supports this. Existing pieces to reuse: `_loadExternalCache`,
`_saveExternalCache`, `_buildExternalCacheKey`, `_externalMemCache`.

Adapter requirements (the "minimum bar" a provider must hit):

1. Returns multiple results (we map to ≤ 10).
2. Each result yields: lat, lng, displayName, countryCode, optional
   timezone (we can compute from coords ourselves if missing).
3. Quality filter: at least town-level (we already block roads/POIs
   via `_EXTERNAL_BLOCKED_TYPES` for Nominatim's `osm_type`).
4. Multilingual or normalize-friendly: we have a localization pipeline
   downstream (`_localizeRawNominatim`, `_pickLocalizedDisplay`) so
   raw English is acceptable.
5. Cacheable in `external_cache` — TOS allows server-side storage.
6. Free tier generous enough to fire only when Nominatim drops.
   Realistic budget: ~500-1,500 calls/day on free tier (Nominatim
   covers the majority while it's healthy).

---

## Provider comparison

### 1. GeoNames Web Services

| Field | Value |
|---|---|
| Endpoint | `api.geonames.org/searchJSON` |
| Free limits | **10,000 credits/day + 1,000 credits/hour** per username |
| Auth | Free `username` parameter (register an account; no credit card) |
| Storage allowed | Yes (caching encouraged; CC-BY data) |
| Quality | **Excellent for cities** (same gazetteer we're already importing in our pipeline). Weak for streets/POIs. |
| Language support | Strong — `lang` parameter ISO-639. `name` is auto-localized; alternate names per lang in the response. |
| countryCode | ✓ ISO-3166 alpha-2 (`countryCode` field) |
| Lat/lng | ✓ |
| Pricing (commercial) | Premium subscriptions from $40/month for higher quotas |
| Rate limit nature | Hard daily cap + hourly cap. Once 429, must wait. |
| Integration ease | Simple JSON over HTTP; same shape as Nominatim once normalized |
| **Pros** | (a) Same data we already trust (curated entries came from this DB). (b) Multi-lang `name` baked in. (c) Generous free tier. (d) No attribution requirement. (e) No credit card. |
| **Cons** | (a) Free tier shared globally — if popular usernames hit the hourly bucket the service throttles. (b) City-level only, weak for fine addresses. (c) Stale data lag (their nightly dumps are months behind OSM). |

### 2. OpenCage Geocoding API

| Field | Value |
|---|---|
| Endpoint | `api.opencagedata.com/geocode/v1/json` |
| Free limits | **2,500/day, 1 req/sec — testing only, not production-licensed** |
| Auth | API key (free trial; production needs a paid plan) |
| Storage allowed | Yes on paid plans; trial does NOT permit production use |
| Quality | High — aggregates OSM + DataScience + DataPress + Who's On First |
| Language support | ✓ `language` param (ISO-639) |
| countryCode | ✓ |
| Lat/lng | ✓ |
| Pricing | **$50/month** for 10k/day → **$1,000/month** for 300k/day (~$0.17 / 1k) |
| Rate limit nature | Soft — occasional bursts allowed; no overage fee |
| Integration ease | Simple |
| **Pros** | (a) Best aggregate data quality. (b) Soft over-limit. (c) Great for fine addresses. |
| **Cons** | (a) **Free tier is explicit testing-only** — TOS forbids production use. (b) Paid plans start at $50/month which is overkill for a fallback role. (c) Adds an external commercial dependency. |

### 3. LocationIQ

| Field | Value |
|---|---|
| Endpoint | `us1.locationiq.com/v1/search.php` (also `eu1.` mirror) |
| Free limits | **5,000/day + 2 req/sec — production allowed with attribution** |
| Auth | API key (free signup, no credit card) |
| Storage allowed | Yes (TOS explicitly permits caching) |
| Quality | OSM-based (same source as Nominatim) — quality is identical to what we already handle |
| Language support | ✓ `accept-language` header / param (comma-separated multi-language list) |
| countryCode | ✓ `address.country_code` |
| Lat/lng | ✓ |
| Pricing | **$49/month** for 10k/day → **$950/month** for 1M/day (~$0.03/1k at top tier) |
| Rate limit nature | **Very soft** — +100% over daily allowed before 429 (so 10k effective from 5k floor) |
| Integration ease | **Drop-in replacement for Nominatim** — same OSM-style response shape (`display_name`, `address`, `lat`, `lon`, `osm_type`). Existing `_normalizeExternalPlace` works unchanged. |
| **Pros** | (a) **Drop-in for Nominatim** — our existing localization pipeline already handles this shape. (b) Free tier is production-licensed (with attribution link). (c) Generous free + soft over-limit. (d) Cheapest paid tier ($49/10k) if we ever need to scale. (e) Separate infrastructure from Nominatim → genuinely independent fallback. |
| **Cons** | (a) Attribution required in production (small "Powered by LocationIQ" link). (b) Same OSM data — won't fill OSM gaps. (c) US/EU mirrors only (no Asia mirror — small latency hit for far-east users). |

### 4. Mapbox Geocoding API

| Field | Value |
|---|---|
| Endpoint | `api.mapbox.com/search/searchbox/v1/forward` (v6) |
| Free limits | **100,000 monthly Temporary requests** — but TEMP cannot be stored long-term |
| Auth | Access token (free signup) |
| Storage allowed | **NO on free tier** — Temporary API forbids result storage beyond user session. Permanent API ($5/1k) allows storage but has **no free tier**. |
| Quality | High (Mapbox's own dataset + OSM blends) |
| Language support | ✓ `language` param |
| countryCode | ✓ |
| Lat/lng | ✓ |
| Pricing | Temp: $0.75/1k beyond 100k. Permanent (storage allowed): $5/1k from request #1. |
| Rate limit nature | Per-second limits, generally generous |
| Integration ease | Different result shape (`features` array); needs adapter |
| **Pros** | (a) Largest free tier by raw monthly volume. (b) Excellent global coverage. |
| **Cons** | (a) **Storage restriction kills it for our cache architecture** — we can't legally store results in `external_cache`. To get storage we'd need Permanent which has no free tier. (b) Adapter work — different response shape. (c) Mapbox brand requires their map tiles (not needed for us). |

### 5. Photon (Komoot)

| Field | Value |
|---|---|
| Endpoint | `photon.komoot.io/api/?q=…` |
| Free limits | **No hard limits — "reasonable use"** per maintainers; aggressive use is throttled/banned |
| Auth | None |
| Storage allowed | Yes (OSM CC-BY data) |
| Quality | Good for European/global cities; weaker for non-Latin scripts at fine resolution |
| Language support | Limited — primarily `en`, `de`, `fr`, `it`. **No Arabic-language responses** |
| countryCode | ✓ |
| Lat/lng | ✓ |
| Pricing | Free public API; self-host is the recommended path for production |
| Rate limit nature | "If you have to ask, run your own" — no SLA, no quota guarantee |
| Integration ease | OSM-like shape (similar to Nominatim) |
| **Pros** | (a) Truly free, no signup. (b) Self-hostable if usage grows. |
| **Cons** | (a) **No SLA — can drop us silently**. (b) **No Arabic language returns** (`lang=ar` not supported on hosted instance). (c) "Reasonable use" is undefined and audited by them. (d) Self-host requires Render compute + ElasticSearch (~$50/month minimum). |

---

## Recommendation

### ⭐ **LocationIQ** as `provider_2`

**Why**:

1. **Drop-in compatibility**: OSM-style response shape means our existing
   `_normalizeExternalPlace`, `_EXTERNAL_ALLOWED_TYPES`, and `_pickLocalizedDisplay`
   pipeline works **without modification**. The adapter is ~50 lines.

2. **Free tier is production-licensed**: 5,000/day with attribution link
   covers the fallback role. With soft limit it's effectively 10,000/day.

3. **Independent infrastructure**: hosted separately from Nominatim's public
   server. When Nominatim 429s us, LocationIQ won't be 429ing for the same
   IP — that's the entire point of having a 2nd provider.

4. **Multilingual**: `accept-language=ar,en` works exactly like Nominatim.
   No retraining of our localization pipeline.

5. **Future scaling**: $49/month for 10k/day → $950/month for 1M/day.
   If the site grows past Render's free tier, LocationIQ scales linearly
   without re-platforming.

6. **Attribution is acceptable**: small "Powered by LocationIQ" badge near
   the search box — same pattern we already use for "Powered by OSM" via
   Nominatim. Single-line CSS + HTML.

### Implementation sketch (NOT for execution yet — design only)

```js
// server.js (new section, ~150 lines)
const _LOCATIONIQ_KEY = process.env.LOCATIONIQ_API_KEY || '';
const _LOCATIONIQ_ENABLED = !!_LOCATIONIQ_KEY;

async function _fetchLocationIQWithTimeout(query, lang, timeoutMs) {
    if (!_LOCATIONIQ_ENABLED) throw new Error('locationiq_disabled');
    const url = 'https://us1.locationiq.com/v1/search?key=' + _LOCATIONIQ_KEY
        + '&format=jsonv2'
        + '&addressdetails=1'
        + '&namedetails=1'
        + '&limit=10'
        + '&accept-language=' + encodeURIComponent(lang || 'en')
        + '&q=' + encodeURIComponent(query);
    // (timeout / abort logic same as _fetchNominatimWithTimeout)
}

// Modify _searchExternalPlaces:
//   - On Nominatim 'rate_limited' or 'error':
//       1. Check external_cache for ('locationiq', lang, q)
//       2. If miss, call _fetchLocationIQWithTimeout
//       3. Cache result with provider='locationiq'
//   - On Nominatim 'empty' or 'ok': don't even try LocationIQ
//     (we got an authoritative answer)
```

### Risk register

| Risk | Mitigation |
|------|------------|
| LocationIQ key leaks via git | Env var on Render only; never commit `.env`; rotate immediately if exposed |
| LocationIQ also 429s (rare) | Cascade returns `status='rate_limited'` to client (current UX); user retries later |
| Attribution invisible (TOS violation) | One-line `<a href="https://locationiq.com/attribution">…` near `/search-test` footer + homepage search |
| Wrong language responses | `accept-language=ar,en` (multi-lang) + our existing `_isAcceptableScript` filter in `_normalizeExternalPlace` |
| Service-side outage | Same TTLs as Nominatim cache (7d ok / 24h empty / 1h err) — outages don't repeat-hammer |

### Why NOT the other 4

- **GeoNames**: a strong runner-up (10k/day, no attribution, same as our
  curated import source). But gazetteer-only — doesn't fill OSM gaps for
  the long-tail queries that triggered the fallback in the first place.
- **OpenCage**: production-grade quality but **trial-only free tier** —
  using it as a fallback for a production site violates TOS without
  paying $50/month.
- **Mapbox**: storage restriction is a deal-breaker for our cache-first
  architecture.
- **Photon**: undefined rate limits + **no Arabic responses** makes it
  unusable for our primary AR audience.

### Optional 3-tier external cascade (future, if needed)

If you later want maximum reliability:

```
Tier 3 — Nominatim       (Free, 1 req/sec, public)
Tier 3b — LocationIQ     (5k/day free, +100% soft)
Tier 3c — GeoNames       (10k/day free + 1k/hour)
```

Each fallback only fires on the previous tier's hard failure. Total
free-tier budget: 15k+/day across 2 paid-quality providers + GeoNames'
gazetteer for "known city" rescue. This is overkill for now — stick
with LocationIQ as `provider_2` and add GeoNames as `provider_3` only
if LocationIQ proves insufficient.

---

## Decision needed from user

Pick one:

1. **Approve LocationIQ** as provider_2 → I open implementation with
   the sketch above (env var + adapter + cascade + attribution badge).
2. **Pick GeoNames instead** (we already use their data; same auth flow
   we used for the pipeline — just a username).
3. **Pick both** (LocationIQ → GeoNames cascade — 3-tier).
4. **Pick a different one** (OpenCage / Mapbox / Photon — with the
   caveats above).
5. **Defer** — keep Nominatim-only for now; come back to this later.

No code written until you approve. Adapter design (the ~150 lines) will
be a small follow-up commit once you signal.

## Untouched (per phase contract)

* Homepage search, `curated_places`, GeoData pipeline, `/search-test`,
  Supabase schema, Qibla / Moon / Prayer pages — none touched.
* No external API key in repo. No `.env` modified. No network calls
  to LocationIQ/etc. made during this study phase.

## Sources

- [GeoNames Web Service Documentation](http://www.geonames.org/export/web-services.html)
- [GeoNames Search Webservice](http://www.geonames.org/export/geonames-search.html)
- [GeoNames Premium Web Services](https://www.geonames.org/commercial-webservices.html)
- [OpenCage Pricing](https://opencagedata.com/pricing)
- [OpenCage Geocoding API Documentation](https://opencagedata.com/api)
- [LocationIQ Pricing](https://locationiq.com/pricing)
- [LocationIQ API Reference](https://api-reference.locationiq.com/)
- [LocationIQ Attribution](https://locationiq.com/attribution)
- [Mapbox Pricing](https://www.mapbox.com/pricing)
- [Mapbox Geocoding for address and places search](https://www.mapbox.com/geocoding)
- [Photon GitHub (Komoot)](https://github.com/komoot/photon)
- [Photon hosted API](https://photon.komoot.io/)
- [Photon — OpenStreetMap Wiki](https://wiki.openstreetmap.org/wiki/Photon)
- [Geocoding APIs compared (bitoff.org)](https://www.bitoff.org/geocoding-apis-comparison/)
