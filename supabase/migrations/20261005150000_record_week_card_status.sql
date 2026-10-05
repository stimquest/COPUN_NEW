-- Save the selected card and the instructor's chosen progress state in one transaction.
create function public.record_calendar_week_card_with_status(
    p_stage_id uuid,
    p_content_id text,
    p_choice jsonb,
    p_execution_status text
) returns void language plpgsql security invoker set search_path = '' as $$
declare v_today date := (now() at time zone 'Europe/Paris')::date;
begin
    if p_execution_status not in ('partial', 'done') then
        raise exception 'Choisissez si le sujet a été effleuré ou abordé.';
    end if;

    -- The existing owner-checked RPC appends the card and saves its wording atomically.
    perform public.record_calendar_week_card(p_stage_id, p_content_id, p_choice, true, null);

    update public.stage_objective_reviews
    set execution_status = p_execution_status,
        discussed_on = coalesce(discussed_on, v_today),
        impact_level = null
    where stage_id = p_stage_id and pedagogical_content_id = p_content_id;

    update public.stage_preparations
    set planned_for = null
    where stage_id = p_stage_id and pedagogical_content_id = p_content_id;
end;
$$;

revoke all on function public.record_calendar_week_card_with_status(uuid, text, jsonb, text) from public, anon;
grant execute on function public.record_calendar_week_card_with_status(uuid, text, jsonb, text) to authenticated;
