-- Also covers environments where the original practice-missions migration was
-- not applied. Content identifiers are TEXT, never UUIDs.
create table if not exists public.formation_practice_missions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    sequence_id text not null,
    stage_id uuid not null references public.stages(id) on delete cascade,
    action_id text not null,
    card_ids text[] not null check (cardinality(card_ids) between 1 and 3),
    assigned_at timestamptz not null default now(),
    completed_at timestamptz,
    constraint formation_practice_missions_one_per_sequence unique(user_id, sequence_id)
);
alter table public.formation_practice_missions alter column card_ids type text[] using card_ids::text[];
create index if not exists formation_practice_missions_stage_idx on public.formation_practice_missions(stage_id);
alter table public.formation_practice_missions enable row level security;
drop policy if exists formation_practice_missions_select_own on public.formation_practice_missions;
create policy formation_practice_missions_select_own on public.formation_practice_missions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists formation_practice_missions_insert_own on public.formation_practice_missions;
create policy formation_practice_missions_insert_own on public.formation_practice_missions for insert to authenticated with check (
    (select auth.uid()) = user_id and exists(select 1 from public.stages where id = stage_id and owner_id = (select auth.uid()))
);
drop policy if exists formation_practice_missions_update_own on public.formation_practice_missions;
create policy formation_practice_missions_update_own on public.formation_practice_missions for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists(select 1 from public.stages where id = stage_id and owner_id = (select auth.uid())));
grant select, insert, update on public.formation_practice_missions to authenticated;
alter table public.formation_sequence_progress add column if not exists mise_en_pratique_le timestamptz;
