-- A bookmark retains the exact proposal read by the instructor.
alter table public.saved_pedagogical_cards
    add column if not exists accroche_choisie text,
    add column if not exists action_id text;

create policy saved_cards_update_own on public.saved_pedagogical_cards
    for update to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

-- Selection and preparation are one transaction. The row lock also prevents two
-- simultaneous additions from silently replacing one another.
create or replace function public.set_week_cards(
    p_stage_id uuid, p_content_ids text[], p_choices jsonb default '{}'::jsonb,
    p_append boolean default false
) returns void language plpgsql security invoker set search_path = '' as $$
declare
    v_stage public.stages%rowtype;
    v_ids text[];
    v_card public.pedagogical_content%rowtype;
    v_saved public.saved_pedagogical_cards%rowtype;
    v_existing public.stage_preparations%rowtype;
    v_choice jsonb;
    v_action text;
begin
    select * into v_stage from public.stages
    where id = p_stage_id and owner_id = (select auth.uid()) for update;
    if not found then raise exception 'Semaine inaccessible.'; end if;
    if v_stage.closed_at is not null or exists (
        select 1 from public.stage_vote_results where stage_id = p_stage_id
    ) then raise exception 'Cette semaine est terminée : les choix sont conservés pour le bilan.'; end if;
    if p_content_ids is null or jsonb_typeof(p_choices) <> 'object' then
        raise exception 'Sélection invalide.';
    end if;
    select coalesce(array_agg(id order by position), '{}'::text[]) into v_ids
    from (select id, min(n) as position
          from unnest((case when p_append then coalesce(v_stage.selected_content, '{}'::text[]) else '{}'::text[] end) || p_content_ids)
               with ordinality as x(id, n) group by id) as ordered;
    if cardinality(v_ids) > 5 then raise exception 'Une semaine peut contenir au maximum cinq cartes.'; end if;
    if exists(select 1 from unnest(v_ids) as x(id) where id is null)
       or (select count(*) from public.pedagogical_content where id = any(v_ids)) <> cardinality(v_ids)
    then raise exception 'Une carte est introuvable ou inaccessible.'; end if;

    for v_card in select * from public.pedagogical_content where id = any(v_ids) loop
        select * into v_existing from public.stage_preparations
            where stage_id = p_stage_id and pedagogical_content_id = v_card.id;
        select * into v_saved from public.saved_pedagogical_cards
            where user_id = (select auth.uid()) and content_id = v_card.id;
        v_choice := p_choices -> v_card.id;
        v_action := case when v_choice ? 'actionId' then v_choice ->> 'actionId'
            else coalesce(v_existing.actions[1], v_saved.action_id, v_card.actions -> 0 ->> 'id') end;
        if v_action is not null and not exists (
            select 1 from jsonb_array_elements(coalesce(v_card.actions, '[]'::jsonb)) as a
            where a ->> 'id' = v_action
        ) then raise exception 'Action inconnue pour la carte %.', v_card.id; end if;
        if length(v_choice ->> 'accroche') > 10000 then raise exception 'Accroche trop longue.'; end if;
        insert into public.stage_preparations(stage_id, pedagogical_content_id, accroche_choisie, chute, actions)
        values (p_stage_id, v_card.id,
            coalesce(v_choice ->> 'accroche', v_existing.accroche_choisie, v_saved.accroche_choisie, v_card.accroche),
            coalesce(v_existing.chute, v_card.a_retenir),
            case when v_choice ? 'actionId' then case when v_action is null then '{}'::text[] else array[v_action] end
                 else coalesce(v_existing.actions, case when v_action is null then '{}'::text[] else array[v_action] end) end)
        on conflict (stage_id, pedagogical_content_id) do update set
            accroche_choisie = excluded.accroche_choisie, actions = excluded.actions,
            chute = excluded.chute, updated_at = now();
    end loop;
    update public.stages set selected_content = v_ids where id = p_stage_id;
end;
$$;
revoke all on function public.set_week_cards(uuid, text[], jsonb, boolean) from public, anon;
grant execute on function public.set_week_cards(uuid, text[], jsonb, boolean) to authenticated;
