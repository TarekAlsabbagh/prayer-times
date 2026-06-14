-- ═══════════════════════════════════════════════════════════════════════════
-- DISCOVERED-CITIES-ADMIN-DASHBOARD-SORTING-AND-BRANCH-STATUS-1
-- discovered_place_promotions — branch-commit (promotion-workflow) status.
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this once in the Supabase SQL editor (like 001/002/003/004). The server
-- writes one row per place AFTER a successful "Commit & Push to Branch"
-- (POST /api/admin/discovered-cities/promote-commit), and reads it to show a
-- promote-status badge on the admin dashboard.
--
-- DELIBERATELY SEPARATE from discovered_place_reviews:
--   • Keeps the PROMOTION-workflow status apart from the human REVIEW decision
--     and apart from the CLASSIFICATION status (READY_FOR_REVIEW / ALREADY_CURATED…).
--   • Avoids the reviews table's BEFORE-UPDATE trigger (which bumps reviewed_at
--     on every write) — a promote write here never touches review timestamps.
--
-- IMPORTANT — what this table does NOT mean:
--   promote_status = 'branch_committed' means a NEW branch + commit was created,
--   but main is UNCHANGED and the city is STILL discovered · noindex. A city only
--   becomes ALREADY_CURATED / curated · indexable when its slug actually lands in
--   db/places/curated-places.json on main (after a MANUAL merge + Render redeploy)
--   — that is computed live from the deployed curated file, NOT from this table.
--
-- The server reads/writes this via the SERVICE ROLE key (server-only). If this
-- migration is not applied, the dashboard still works (no promote badges) — the
-- feature is inert until the table exists.

create table if not exists discovered_place_promotions (
    id            uuid primary key default gen_random_uuid(),

    slug          text not null,
    country_code  text not null check (country_code ~ '^[a-z]{2}$'),

    -- Promotion-WORKFLOW status. The only value the server writes is
    -- 'branch_committed' (branch + commit created, NOT merged to main).
    -- "merged / ALREADY_CURATED" is computed live from curated-places.json,
    -- never stored here.
    promote_status      text not null default 'branch_committed'
                          check (promote_status in ('branch_committed')),

    promote_branch      text,        -- e.g. admin/promote-discovered-YYYYMMDD-HHMM-slug
    promote_commit_sha  text,        -- the branch commit SHA
    promote_report_path text,        -- reports/admin-promote-batch-<ts>.md
    promote_committed_at timestamptz not null default now(),

    -- One CURRENT promote record per place; re-committing upserts (merge-duplicates).
    unique (slug, country_code)
);

create index if not exists discovered_place_promotions_country_idx
    on discovered_place_promotions (country_code);
create index if not exists discovered_place_promotions_committed_idx
    on discovered_place_promotions (promote_committed_at);

-- RLS off; the server uses the SERVICE ROLE key (server-only), mirroring
-- discovered_places / discovered_place_reviews. NEVER expose via the anon key.
