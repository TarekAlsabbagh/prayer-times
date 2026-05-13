-- ═══════════════════════════════════════════════════════════════════════════
-- GLOBAL-PLACE-SEARCH-NOMINATIM-CACHE-1 — external_cache schema (Supabase)
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this once in the Supabase SQL editor (or psql) AFTER migration 001/002.
-- Independent of those — even if discovered_places is empty / unused, this
-- table works on its own.
--
-- Purpose: persistent cache layer for outbound Nominatim (OSM) search calls.
-- The /api/search-place endpoint now follows this pipeline:
--   1. curated_places (in-process JSON)
--   2. discovered_places (Supabase) — gated on SUPABASE_ENABLED
--   3. external_cache   (Supabase) — THIS TABLE
--   4. in-memory cache  (process Map)
--   5. single-flight    (process Map<key, Promise>)
--   6. Nominatim fallback (HTTP, ~1 req/sec/IP policy)
--
-- TTLs (per-status):
--   ok           : 7 days   — full result set, freshest data
--   empty        : 24 hours — Nominatim returned 0 results
--   rate_limited : 1 hour   — 429 from Nominatim (back off briefly)
--   error        : 1 hour   — timeout / network error
--
-- If this table is absent OR Supabase env vars are missing, the server
-- silently degrades to in-memory cache + single-flight only. No crashes,
-- no missing functionality — just a colder cache after each restart.

create table if not exists external_cache (
    cache_key   text         primary key,
    provider    text         not null,   -- e.g. 'nominatim'
    lang        text         not null,
    query       text         not null,
    response    jsonb        not null,   -- the normalized array of place rows
    status      text         not null,   -- 'ok' | 'empty' | 'rate_limited' | 'error'
    created_at  timestamptz  not null default now(),
    expires_at  timestamptz  not null
);

create index if not exists idx_external_cache_expires
    on external_cache(expires_at);

create index if not exists idx_external_cache_query
    on external_cache(query);

create index if not exists idx_external_cache_provider_lang
    on external_cache(provider, lang);

-- Optional cleanup (run periodically, e.g. via Supabase Edge Function cron).
-- Not strictly required since `_loadExternalCache` already filters by
-- `expires_at > now()`, but keeps the table size bounded:
--   DELETE FROM external_cache WHERE expires_at < now() - interval '30 days';

comment on table external_cache is
    'GLOBAL-PLACE-SEARCH-NOMINATIM-CACHE-1: persistent cache for outbound external search provider responses. cache_key = provider|lang|normalizedQuery.';
