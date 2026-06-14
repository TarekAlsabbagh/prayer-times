-- ═══════════════════════════════════════════════════════════════════════════
-- DISCOVERED-CITIES-ADMIN-REVIEW-PROMOTE-WORKFLOW-1 (Phase 1)
-- discovered_place_reviews — manual review decisions for the admin dashboard.
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this once in the Supabase SQL editor (like 001/002/003). The server
-- reads/writes it via the SERVICE ROLE key (server-only). It is INDEPENDENT of
-- discovered_places (no columns added there) and holds ONLY the human review
-- decision per place. NOTHING here promotes a city — promotion is a separate,
-- manual, explicit step (Phase 2/3). A decision row never changes a page's
-- robots/indexability; that only happens after a reviewed entry is promoted
-- into curated-places.json on a branch and merged to main.

create table if not exists discovered_place_reviews (
    id            uuid primary key default gen_random_uuid(),

    slug          text not null,
    country_code  text not null check (country_code ~ '^[a-z]{2}$'),

    -- The reviewer's decision. NOT a promotion — just a recorded judgement.
    decision      text not null check (decision in
                    ('approved','skipped','needs_ar_name','duplicate','needs_review')),

    note          text,                      -- free-text review_note
    duplicate_of  text,                      -- slug of the original (only when decision='duplicate')

    reviewed_by   text,                      -- free label (e.g. 'admin')
    reviewed_at   timestamptz not null default now(),

    -- Frozen copy of the discovered row at decision time (audit + later promote
    -- can rebuild from this even if discovered_places changes).
    source_snapshot jsonb not null default '{}'::jsonb,

    -- One CURRENT decision per place; re-deciding upserts (merge-duplicates).
    unique (slug, country_code)
);

create index if not exists discovered_place_reviews_decision_idx
    on discovered_place_reviews (decision);
create index if not exists discovered_place_reviews_country_idx
    on discovered_place_reviews (country_code);

-- Keep reviewed_at fresh on any update (upsert).
create or replace function update_discovered_place_reviews_reviewed_at()
returns trigger
language plpgsql
as $$
begin
    new.reviewed_at = now();
    return new;
end;
$$;

drop trigger if exists discovered_place_reviews_reviewed_at_trigger on discovered_place_reviews;
create trigger discovered_place_reviews_reviewed_at_trigger
    before update on discovered_place_reviews
    for each row execute function update_discovered_place_reviews_reviewed_at();

-- RLS off; the server uses the SERVICE ROLE key (server-only), mirroring
-- discovered_places. NEVER expose this table via the anon key.
