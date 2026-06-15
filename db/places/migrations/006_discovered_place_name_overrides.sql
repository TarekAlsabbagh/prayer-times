-- ═══════════════════════════════════════════════════════════════════════════
-- DISCOVERED-CITIES-ADMIN-NAME-EDIT-AR-EN-1
-- discovered_place_name_overrides — admin-edited Arabic/English city names.
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this once in the Supabase SQL editor (like 001/002/003/004/005). The
-- server reads/writes it via the SERVICE ROLE key (server-only). It holds ONLY
-- the admin's manual name edits for a discovered place, used at promote-commit
-- to replace the raw discovered name.
--
-- DELIBERATELY SEPARATE from discovered_place_reviews AND discovered_place_promotions:
--   • reviews            = the human REVIEW decision + classification snapshot.
--   • promotions         = the branch-commit PROMOTION status (branch/sha/...).
--   • name_overrides     = ONLY the edited ar/en names.
-- A name edit here NEVER touches reviewed_at, never changes classification, never
-- changes the promotion status, and never changes the slug / coordinates /
-- country_code / curated-places.json / any public page.
--
-- SAFE: IF NOT EXISTS only. No DELETE. No UPDATE of existing rows/data. Does not
-- touch any other table. If this migration is not applied, the admin dashboard
-- still works (it shows the original discovered names; saving a name returns a
-- safe error and logs a warning — it never crashes the dashboard).

create table if not exists discovered_place_name_overrides (
    id            uuid primary key default gen_random_uuid(),

    slug          text not null,
    country_code  text not null check (country_code ~ '^[a-z]{2}$'),

    name_ar       text,          -- admin-edited Arabic name (null = not edited)
    name_en       text,          -- admin-edited English name (null = not edited)

    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),

    -- One CURRENT override per place; re-editing upserts (merge-duplicates).
    unique (slug, country_code)
);

create index if not exists discovered_place_name_overrides_country_idx
    on discovered_place_name_overrides (country_code);

-- RLS off; the server uses the SERVICE ROLE key (server-only), mirroring the
-- other discovered_* tables. NEVER expose this table via the anon key.
