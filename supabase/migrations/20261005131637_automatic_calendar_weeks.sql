-- Calendar weeks are available without a preparation form. Keep legacy stages intact.
alter table public.stages add column calendar_week_start date;
create unique index stages_owner_calendar_week on public.stages(owner_id, calendar_week_start)
    where calendar_week_start is not null;
alter table public.stage_preparations add column planned_for date;
alter table public.stage_objective_reviews add column discussed_on date;

create function public.ensure_calendar_week(p_next boolean default false, p_existing_id uuid default null)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
    v_user uuid := (select auth.uid());
    v_today date := (now() at time zone 'Europe/Paris')::date;
    v_start date;
    v_end date;
    v_id uuid;
    v_months text[] := array['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    v_dates text;
begin
    if v_user is null then raise exception 'Connexion nécessaire.'; end if;
    v_start := v_today - (extract(isodow from v_today)::integer - 1) + case when p_next then 7 else 0 end;
    v_end := v_start + 6;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text || ':' || v_start::text, 0));
    select id into v_id from public.stages where owner_id = v_user and calendar_week_start = v_start;
    if v_id is not null then return v_id; end if;
    -- The server resolves an existing legacy week by its dates before invoking this function.
    if p_existing_id is not null then
        update public.stages set calendar_week_start = v_start
        where id = p_existing_id and owner_id = v_user and calendar_week_start is null
        returning id into v_id;
        if v_id is null then raise exception 'Semaine inaccessible.'; end if;
        return v_id;
    end if;
    v_dates := extract(day from v_start)::integer || ' ' || v_months[extract(month from v_start)::integer] || ' ' || extract(year from v_start)::integer
        || ' - ' || extract(day from v_end)::integer || ' ' || v_months[extract(month from v_end)::integer] || ' ' || extract(year from v_end)::integer;
    insert into public.stages(owner_id, title, activity, level, dates, calendar_week_start, selected_content, suggested_thematics)
    values(v_user, 'Semaine du ' || extract(day from v_start)::integer || ' ' || v_months[extract(month from v_start)::integer], '', '', v_dates, v_start, '{}'::text[], '{}'::text[])
    returning id into v_id;
    return v_id;
end;
$$;
revoke all on function public.ensure_calendar_week(boolean,uuid) from public,anon;
grant execute on function public.ensure_calendar_week(boolean,uuid) to authenticated;

-- Store the card, its wording, status and date in one transaction.
-- NULL timing preserves an existing date when merely editing the card's wording.
create function public.record_calendar_week_card(p_stage_id uuid, p_content_id text, p_choice jsonb, p_discussed boolean default false, p_day date default null)
returns void language plpgsql security invoker set search_path = '' as $$
declare v_start date; v_today date := (now() at time zone 'Europe/Paris')::date;
begin
    select calendar_week_start into v_start from public.stages
    where id = p_stage_id and owner_id = (select auth.uid()) for update;
    if not found then raise exception 'Semaine inaccessible.'; end if;
    if p_day is not null then
        if v_start is null or p_day < v_start or p_day > v_start + 6 then raise exception 'Choisissez un jour de cette semaine.'; end if;
        if p_discussed and p_day > v_today then raise exception 'Une action réalisée ne peut pas être datée dans le futur.'; end if;
        if not p_discussed and p_day < v_today then raise exception 'Choisissez aujourd’hui ou un jour à venir.'; end if;
    end if;
    perform public.use_week_card(p_stage_id, p_content_id, p_choice, p_discussed);
    if p_day is not null and p_discussed then
        update public.stage_objective_reviews set discussed_on = p_day
        where stage_id = p_stage_id and pedagogical_content_id = p_content_id;
        update public.stage_preparations set planned_for = null
        where stage_id = p_stage_id and pedagogical_content_id = p_content_id;
    elsif p_day is not null then
        if exists(select 1 from public.stage_objective_reviews where stage_id = p_stage_id and pedagogical_content_id = p_content_id and execution_status in ('done','partial')) then
            raise exception 'Ce sujet est déjà noté comme abordé. Sa date est conservée.';
        end if;
        update public.stage_preparations set planned_for = p_day
        where stage_id = p_stage_id and pedagogical_content_id = p_content_id;
    end if;
end;
$$;
revoke all on function public.record_calendar_week_card(uuid,text,jsonb,boolean,date) from public,anon;
grant execute on function public.record_calendar_week_card(uuid,text,jsonb,boolean,date) to authenticated;
