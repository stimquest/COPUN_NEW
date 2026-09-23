-- Integration assertions. Every write, including bookmarks, is rolled back.
begin;
select set_config('request.jwt.claim.sub', (select id::text from auth.users order by created_at limit 1), true);
set local role authenticated;
do $$
declare
    owner uuid := auth.uid();
    card public.pedagogical_content%rowtype;
    second_card text;
    week uuid;
    old_count bigint;
    rejected boolean;
begin
    select * into strict card from public.pedagogical_content
      where source <> 'custom' and jsonb_array_length(actions) >= 2 order by id limit 1;
    select id into strict second_card from public.pedagogical_content where id <> card.id and source <> 'custom' order by id limit 1;
    insert into public.saved_pedagogical_cards(user_id, content_id, accroche_choisie, action_id)
    values(owner, card.id, 'Accroche de test conservée', card.actions -> 1 ->> 'id')
    on conflict(user_id, content_id) do update set accroche_choisie = excluded.accroche_choisie, action_id = excluded.action_id;
    week := public.create_week_with_choices('{"title":"TEST ROLLBACK","activity":"","level":"","dates":"23 septembre 2026","suggested_thematics":[]}', array[card.id]);
    if not exists(select 1 from public.stage_preparations where stage_id = week and pedagogical_content_id = card.id
        and accroche_choisie = 'Accroche de test conservée' and actions = array[card.actions -> 1 ->> 'id']) then
        raise exception 'FAIL: saved choice was not copied';
    end if;
    perform public.set_week_cards(week, array[second_card], '{}', true);
    perform public.set_week_cards(week, array[second_card, card.id]);
    if not exists(select 1 from public.stage_preparations where stage_id = week and pedagogical_content_id = card.id
        and actions = array[card.actions -> 1 ->> 'id']) then raise exception 'FAIL: reorder reset action'; end if;
    perform public.use_week_card(week, card.id, jsonb_build_object('accroche','Occasion saisie','actionId',card.actions -> 1 ->> 'id'), true);
    if not exists(select 1 from public.stage_objective_reviews where stage_id = week and pedagogical_content_id = card.id and execution_status = 'done') then raise exception 'FAIL: spontaneous status missing'; end if;
    if exists(select 1 from public.stage_vote_results where stage_id = week) then raise exception 'FAIL: spontaneous addition produced a vote'; end if;
    rejected := false;
    begin
        perform public.use_week_card(week, card.id, '{"accroche":"invalid","actionId":"does-not-exist"}');
    exception when others then rejected := true; end;
    if not rejected then raise exception 'FAIL: invalid action accepted'; end if;
    if not exists(select 1 from public.stage_preparations where stage_id = week and pedagogical_content_id = card.id and accroche_choisie = 'Occasion saisie') then raise exception 'FAIL: invalid action overwrote choice'; end if;
    select count(*) into old_count from public.stages;
    rejected := false;
    begin
        perform public.create_week_with_choices('{"title":"INVALID","activity":"","level":"","dates":"test"}', array['__missing_card__']);
    exception when others then rejected := true; end;
    if not rejected or (select count(*) from public.stages) <> old_count then raise exception 'FAIL: failed creation left a week'; end if;
    perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
    rejected := false;
    begin perform public.set_week_cards(week, array[card.id]); exception when others then rejected := true; end;
    if not rejected then raise exception 'FAIL: another user modified the week'; end if;
    perform set_config('request.jwt.claim.sub', owner::text, true);
    update public.stages set closed_at = now() where id = week;
    rejected := false;
    begin perform public.set_week_cards(week, array[card.id]); exception when others then rejected := true; end;
    if not rejected then raise exception 'FAIL: closed week modified'; end if;
end;
$$;
rollback;
select 'PASS: saved choices, reorder, spontaneous addition, no vote, invalid action, atomic creation, ownership, closed week. All test data rolled back.' as result;
