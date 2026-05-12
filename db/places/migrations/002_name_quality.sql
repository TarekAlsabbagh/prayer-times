-- ═══════════════════════════════════════════════════════════════════════════
-- GLOBAL-PLACE-SEARCH-L10N-PIPELINE — add name_quality column
-- ═══════════════════════════════════════════════════════════════════════════
-- Idempotent additive migration. Run AFTER 001_discovered_places.sql.
-- If you start fresh, 001 already includes name_quality and this is a no-op.

alter table if exists discovered_places
    add column if not exists name_quality jsonb not null default '{}'::jsonb;

-- Index for filtering rows by quality (e.g. "show me all rows where
-- name_quality.ar = 'transliterated'" → Phase D admin review queue).
create index if not exists discovered_places_name_quality_gin_idx
    on discovered_places using gin (name_quality);
