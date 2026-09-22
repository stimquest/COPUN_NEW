-- Identifiant de migration attribué par Supabase lors de la publication.
create table public.saved_pedagogical_cards (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null references public.pedagogical_content(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);
create index saved_pedagogical_cards_content_idx on public.saved_pedagogical_cards(content_id);
alter table public.saved_pedagogical_cards enable row level security;
revoke all on public.saved_pedagogical_cards from public, anon, authenticated;
grant select, insert, delete on public.saved_pedagogical_cards to authenticated;
grant all on public.saved_pedagogical_cards to service_role;
create policy saved_cards_read_own on public.saved_pedagogical_cards
  for select to authenticated using ((select auth.uid()) = user_id);
create policy saved_cards_insert_own on public.saved_pedagogical_cards
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.pedagogical_content c where c.id = content_id)
  );
create policy saved_cards_delete_own on public.saved_pedagogical_cards
  for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.saved_pedagogical_cards is 'Cartes personnelles à relire ou transmettre plus tard, indépendantes des semaines.';
