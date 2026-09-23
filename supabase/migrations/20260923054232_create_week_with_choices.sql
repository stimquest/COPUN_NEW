-- A spontaneous addition records the instructor's own tracking, never a vote.
create or replace function public.use_week_card(p_stage_id uuid, p_content_id text, p_choice jsonb, p_discussed boolean default false)
returns void language plpgsql security invoker set search_path = '' as $$
begin
    perform public.set_week_cards(p_stage_id, array[p_content_id], jsonb_build_object(p_content_id, p_choice), true);
    if p_discussed then
        insert into public.stage_objective_reviews(stage_id, pedagogical_content_id, execution_status)
        values (p_stage_id, p_content_id, 'done')
        on conflict (stage_id, pedagogical_content_id) do update set execution_status = 'done';
    end if;
end;
$$;
revoke all on function public.use_week_card(uuid, text, jsonb, boolean) from public, anon;
grant execute on function public.use_week_card(uuid, text, jsonb, boolean) to authenticated;

-- Creating a week and copying its bookmarked proposals must either both succeed
-- or both roll back. Retrying an error must not leave an empty duplicate week.
create or replace function public.create_week_with_choices(p_data jsonb, p_content_ids text[], p_discussed boolean default false)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare v_id uuid;
begin
    if (select auth.uid()) is null then raise exception 'Connexion nécessaire.'; end if;
    if coalesce(length(trim(p_data ->> 'title')), 0) = 0 or length(p_data ->> 'title') > 200
       or coalesce(length(p_data ->> 'dates'), 0) = 0 then raise exception 'Semaine invalide.'; end if;
    insert into public.stages(title, activity, level, dates, nb_stagiaires, selected_content, suggested_thematics, owner_id)
    values (p_data ->> 'title', p_data ->> 'activity', p_data ->> 'level', p_data ->> 'dates',
        (p_data ->> 'nb_stagiaires')::integer, '{}'::text[],
        array(select jsonb_array_elements_text(coalesce(p_data -> 'suggested_thematics', '[]'::jsonb))), (select auth.uid()))
    returning id into v_id;
    perform public.set_week_cards(v_id, p_content_ids);
    if p_discussed then
        insert into public.stage_objective_reviews(stage_id, pedagogical_content_id, execution_status)
        select v_id, id, 'done' from unnest(p_content_ids) as x(id)
        on conflict (stage_id, pedagogical_content_id) do update set execution_status = 'done';
    end if;
    return v_id;
end;
$$;
revoke all on function public.create_week_with_choices(jsonb, text[], boolean) from public, anon;
grant execute on function public.create_week_with_choices(jsonb, text[], boolean) to authenticated;
