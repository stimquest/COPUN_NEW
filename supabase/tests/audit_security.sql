-- Run against a migrated test database. Fixtures are always rolled back.
begin;
create temp table audit_ids as select gen_random_uuid() as u1, gen_random_uuid() as u2, gen_random_uuid() as s1, gen_random_uuid() as s2;
grant select on audit_ids to authenticated;
insert into auth.users(id,email) select u1, u1::text||'@audit.invalid' from audit_ids union all select u2,u2::text||'@audit.invalid' from audit_ids;
insert into public.stages(id,owner_id,title,activity,level,dates)
select s1,u1,'audit','audit','1','14 sept. 2026 - 20 sept. 2026' from audit_ids union all
select s2,u2,'audit','audit','1','14 sept. 2026 - 20 sept. 2026' from audit_ids;
select set_config('request.jwt.claim.sub',(select u1::text from audit_ids),true);
set local role authenticated;
do $$ declare fixture record; begin
 select * into fixture from audit_ids;
 if (select count(*) from public.stages where id in (fixture.s1,fixture.s2))<>1 then raise exception 'Stage isolation failed'; end if;
 update public.stages set title='allowed' where id=fixture.s1;
 if not found then raise exception 'Owner update denied'; end if;
 update public.stages set title='forbidden' where id=fixture.s2;
 if found then raise exception 'Cross user update allowed'; end if;
 update public.profiles set full_name='Allowed' where id=fixture.u1;
 if not found then raise exception 'Profile update denied'; end if;
 begin
  update public.profiles set role='admin' where id=fixture.u1;
  raise exception 'Self promotion allowed';
 exception when insufficient_privilege then null; end;
 begin
  perform public.admin_update_role(fixture.u1,'admin');
  raise exception 'Non admin RPC allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.leaderboard_points(monitor_id,stage_id,points) values(fixture.u1,fixture.s1,999999);
  raise exception 'Forged points allowed';
 exception when insufficient_privilege then null; end;
 if exists(select 1 from public.profiles where id=fixture.u2) then raise exception 'Private profile leaked'; end if;
end $$;
reset role;
do $$ begin
 if has_function_privilege('anon','public.admin_update_role(uuid,text)','EXECUTE') then raise exception 'Anonymous RPC still allowed'; end if;
 if has_column_privilege('authenticated','public.profiles','role','UPDATE') then raise exception 'Role still writable'; end if;
end $$;
rollback;
