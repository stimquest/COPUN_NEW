-- Vérification transactionnelle : aucune donnée de test conservée.
begin;
select set_config('test.saved_user_one', (select id::text from auth.users order by id limit 1), true);
select set_config('test.saved_user_two', (select id::text from auth.users order by id offset 1 limit 1), true);
insert into public.saved_pedagogical_cards(user_id, content_id)
values (current_setting('test.saved_user_one')::uuid, '3'),
       (current_setting('test.saved_user_two')::uuid, '3')
on conflict do nothing;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.saved_user_one'), true);
do $test$
declare affected integer;
begin
  if exists(select 1 from public.saved_pedagogical_cards where user_id <> auth.uid()) then
    raise exception 'RLS: cartes d’un autre compte visibles';
  end if;
  if not exists(select 1 from public.saved_pedagogical_cards where content_id='3') then
    raise exception 'RLS: carte personnelle invisible';
  end if;
  delete from public.saved_pedagogical_cards where user_id=current_setting('test.saved_user_two')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'RLS: suppression d’un autre compte'; end if;
  begin
    insert into public.saved_pedagogical_cards(user_id,content_id)
    values(current_setting('test.saved_user_two')::uuid,'7');
    raise exception 'RLS: insertion pour autrui autorisée';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.saved_pedagogical_cards set user_id=current_setting('test.saved_user_two')::uuid;
    raise exception 'RLS: transfert de propriétaire autorisé';
  exception when insufficient_privilege then null;
  end;
  delete from public.saved_pedagogical_cards where user_id=auth.uid() and content_id='3';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Suppression personnelle impossible'; end if;
  insert into public.saved_pedagogical_cards(user_id,content_id) values(auth.uid(),'3');
  insert into public.saved_pedagogical_cards(user_id,content_id) values(auth.uid(),'3') on conflict do nothing;
  select count(*) into affected from public.saved_pedagogical_cards where content_id='3';
  if affected <> 1 then raise exception 'Enregistrement non idempotent'; end if;
end $test$;
reset role;
do $test$
begin
  if has_table_privilege('anon','public.saved_pedagogical_cards','SELECT')
     or has_table_privilege('anon','public.saved_pedagogical_cards','INSERT')
     or has_table_privilege('anon','public.saved_pedagogical_cards','DELETE') then
    raise exception 'Accès anonyme inattendu';
  end if;
end $test$;
rollback;
