-- ═══════════════════════════════════════════════════════════════════════════
-- GLOBAL-PLACE-SEARCH-PHASE-C — discovered_places schema for Supabase/Postgres
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this once in the Supabase SQL editor (or psql against your Postgres).
-- Then set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in Render env vars and
-- the server picks it up automatically on next deploy. Until both env vars
-- are present the server logs a warning and falls back to curated + external
-- only — the site keeps working with no discovered layer.

create extension if not exists pg_trgm;

create table if not exists discovered_places (
    id uuid primary key default gen_random_uuid(),

    slug         text not null,
    type         text not null,
    country_code text not null check (country_code ~ '^[a-z]{2}$'),

    lat          double precision not null check (lat between -90 and 90),
    lng          double precision not null check (lng between -180 and 180),
    timezone     text not null,

    -- Per-language names map: { ar, en, fr, de, tr, ur, id, es, bn, ms }
    -- Missing langs are simply absent from the object.
    names        jsonb not null default '{}'::jsonb,
    -- Per-language aliases (arrays): { ar: [...], en: [...], ... }
    aliases      jsonb not null default '{}'::jsonb,
    -- Optional admin metadata (region, country names per lang, etc.)
    admin        jsonb not null default '{}'::jsonb,

    source       text not null,           -- 'nominatim' | 'geonames' | …
    source_id    text,                    -- OSM place_id / Wikidata Q-id / …
    verified     boolean not null default false,

    search_count integer not null default 0,
    selected_count integer not null default 0,

    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    last_used_at timestamptz,

    -- Lowercase concat-blob of every searchable field, for fast ILIKE
    -- + trigram index. Auto-derived (no application code populates it).
    search_blob text generated always as (
        lower(
            coalesce(slug, '')              || ' ' ||
            coalesce(names->>'ar', '')      || ' ' ||
            coalesce(names->>'en', '')      || ' ' ||
            coalesce(names->>'fr', '')      || ' ' ||
            coalesce(names->>'de', '')      || ' ' ||
            coalesce(names->>'tr', '')      || ' ' ||
            coalesce(names->>'ur', '')      || ' ' ||
            coalesce(names->>'id', '')      || ' ' ||
            coalesce(names->>'es', '')      || ' ' ||
            coalesce(names->>'bn', '')      || ' ' ||
            coalesce(names->>'ms', '')      || ' ' ||
            coalesce(aliases::text, '')
        )
    ) stored
);

-- ── Uniqueness: one row per (slug, country_code) — prevents duplicates ──
create unique index if not exists discovered_places_slug_country_idx
    on discovered_places (slug, country_code);

-- ── Per-country lookup (used for "find all places in country X") ──
create index if not exists discovered_places_country_idx
    on discovered_places (country_code);

-- ── Source-id dedup (e.g. OSM place_id) — secondary unique check ──
create unique index if not exists discovered_places_source_id_idx
    on discovered_places (source, source_id)
    where source_id is not null;

-- ── Trigram + GIN over search_blob for fast ILIKE '%query%' ──
create index if not exists discovered_places_search_blob_trgm_idx
    on discovered_places using gin (search_blob gin_trgm_ops);

-- ── jsonb GIN for direct names/aliases queries (e.g. ?names->'ar'.eq.X) ──
create index if not exists discovered_places_names_gin_idx
    on discovered_places using gin (names);
create index if not exists discovered_places_aliases_gin_idx
    on discovered_places using gin (aliases);

-- ── Auto-update updated_at on any row update ──
create or replace function update_discovered_places_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists discovered_places_updated_at_trigger on discovered_places;
create trigger discovered_places_updated_at_trigger
    before update on discovered_places
    for each row execute function update_discovered_places_updated_at();

-- ── Single-entry-point search function ──
-- The server calls /rest/v1/rpc/search_discovered_places { q, lim } via
-- PostgREST. Returns up to `lim` rows ranked by user-click frequency.
create or replace function search_discovered_places(q text, lim int default 10)
returns setof discovered_places
language sql stable
as $$
    select * from discovered_places
    where search_blob ilike '%' || lower(coalesce(q, '')) || '%'
    order by selected_count desc, search_count desc, last_used_at desc nulls last
    limit lim;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Optional: Row-Level Security
-- ═══════════════════════════════════════════════════════════════════════════
-- We use the SERVICE ROLE key from the server side, so RLS isn't strictly
-- required. If you'd like to expose read-only access via the anon key
-- (e.g. for a future admin panel), enable RLS + add a SELECT policy:
--
-- alter table discovered_places enable row level security;
-- create policy "anon read" on discovered_places for select using (true);
--
-- For now we leave RLS off and rely on the service-role key being
-- server-only (NEVER exposed in client JS).
