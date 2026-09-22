-- Access boundaries; no user content is deleted by this migration.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function private.can_report_user(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles me join public.profiles other on other.id = target
 where me.id = auth.uid() and (me.role = 'admin' or
 (me.role = 'club_admin' and me.club_id is not null and me.club_id = other.club_id)));
$$;
create or replace function private.can_manage_club(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles where id = auth.uid() and
 (role = 'admin' or (role = 'club_admin' and club_id = target and target is not null)));
$$;
revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

alter table public.profiles add column if not exists password_set boolean not null default false;
update public.profiles p set password_set = true
from auth.users u where u.id = p.id and coalesce(u.encrypted_password, '') <> '';

revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update(full_name, avatar_url, defi_fil_rouge_id, password_set) on public.profiles to authenticated;

drop policy if exists "Lecture publique profils" on public.profiles;
drop policy if exists "Modif propre profil" on public.profiles;
drop policy if exists "Public View" on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or private.can_report_user(id));
create policy profiles_edit on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- A minimal directory supports public content authors and rankings without exposing emails.
create or replace view public.profile_directory as
select p.id, p.full_name, p.club_id, c.name as club_name from public.profiles p left join public.clubs c on c.id=p.club_id;
revoke all on public.profile_directory from public, anon;
grant select on public.profile_directory to authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_pending_profile(p_email text, p_full_name text, p_role text, p_club_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_role NOT IN ('admin', 'club_admin', 'instructor', 'moderator') THEN RAISE EXCEPTION 'Role invalide'; END IF;
  IF auth.uid() IS NULL OR NOT private.is_admin() THEN RAISE EXCEPTION 'Acces refuse' USING ERRCODE = '42501'; END IF;
  INSERT INTO pending_profiles (email, full_name, role, club_id)
  VALUES (p_email, p_full_name, p_role, p_club_id)
  ON CONFLICT (email) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        club_id = EXCLUDED.club_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_profile(p_user_id uuid, p_full_name text, p_role text, p_club_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_role NOT IN ('admin', 'club_admin', 'instructor', 'moderator') THEN RAISE EXCEPTION 'Role invalide'; END IF;
  IF auth.uid() IS NULL OR NOT private.is_admin() THEN RAISE EXCEPTION 'Acces refuse' USING ERRCODE = '42501'; END IF;
  UPDATE profiles
  SET full_name = p_full_name,
      role = p_role,
      club_id = p_club_id
  WHERE id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  v_caller_role text;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_admin() THEN RAISE EXCEPTION 'Acces refuse' USING ERRCODE = '42501'; END IF;
  SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : admin requis';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de supprimer son propre compte';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_last_sign_in()
 RETURNS TABLE(id uuid, last_sign_in_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT u.id, u.last_sign_in_at
  FROM auth.users u WHERE private.is_admin();
$function$
;

CREATE OR REPLACE FUNCTION public.admin_pages_vues(p_depuis date DEFAULT NULL::date)
 RETURNS TABLE(chemin text, nb_vues bigint, nb_moniteurs bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT v.chemin,
           count(*)                  AS nb_vues,
           count(DISTINCT v.user_id) AS nb_moniteurs
    FROM public.page_views v
    WHERE private.can_report_user(v.user_id) AND (p_depuis IS NULL OR v.vue_le >= p_depuis)
    GROUP BY v.chemin
    ORDER BY count(*) DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_update_role(p_user_id uuid, p_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_role NOT IN ('admin', 'club_admin', 'instructor', 'moderator') THEN RAISE EXCEPTION 'Role invalide'; END IF;
  IF auth.uid() IS NULL OR NOT private.is_admin() THEN RAISE EXCEPTION 'Acces refuse' USING ERRCODE = '42501'; END IF;
  UPDATE profiles
  SET role = p_role
  WHERE id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_upsert_profile(p_email text, p_full_name text, p_role text, p_club_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_role NOT IN ('admin', 'club_admin', 'instructor', 'moderator') THEN RAISE EXCEPTION 'Role invalide'; END IF;
  IF auth.uid() IS NULL OR NOT private.is_admin() THEN RAISE EXCEPTION 'Acces refuse' USING ERRCODE = '42501'; END IF;
  -- Chercher l'utilisateur par email dans auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- L'utilisateur existe : mettre à jour son profil
    UPDATE profiles
    SET
      full_name = COALESCE(p_full_name, full_name),
      role = p_role,
      club_id = COALESCE(p_club_id, club_id)
    WHERE id = v_user_id;
  END IF;
  -- Si l'utilisateur n'existe pas encore (OTP pas encore cliqué),
  -- le profil sera créé par le trigger on_auth_user_created au premier login.
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_activite_moniteurs()
 RETURNS TABLE(user_id uuid, email text, full_name text, role text, club_id uuid, inscrit_le timestamp with time zone, jours_actifs bigint, total_actions bigint, premier_jour date, dernier_jour date, regularite_pct numeric, jours_actifs_30j bigint, last_sign_in_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT m.user_id, m.email, m.full_name, m.role, m.club_id,
           m.inscrit_le, m.jours_actifs, m.total_actions,
           m.premier_jour, m.dernier_jour, m.regularite_pct,
           m.jours_actifs_30j, u.last_sign_in_at
    FROM public.activite_par_moniteur m
    LEFT JOIN auth.users u ON u.id = m.user_id
    WHERE private.can_report_user(m.user_id)
    ORDER BY m.jours_actifs DESC, m.total_actions DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_activite_journaliere(p_depuis date DEFAULT NULL::date)
 RETURNS TABLE(jour date, nb_moniteurs bigint, nb_actions bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT a.jour,
           count(DISTINCT a.user_id) AS nb_moniteurs,
           sum(a.nb_actions)         AS nb_actions
    FROM public.activite_par_jour a
    WHERE private.can_report_user(a.user_id) AND (p_depuis IS NULL OR a.jour >= p_depuis)
    GROUP BY a.jour
    ORDER BY a.jour;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_activite_par_genre(p_depuis date DEFAULT NULL::date)
 RETURNS TABLE(genre text, nb_actions bigint, nb_moniteurs bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT e.genre,
           count(*)                  AS nb_actions,
           count(DISTINCT e.user_id) AS nb_moniteurs
    FROM public.activite_evenements e
    WHERE private.can_report_user(e.user_id) AND e.survenu_le IS NOT NULL
      AND (p_depuis IS NULL OR (e.survenu_le AT TIME ZONE 'Europe/Paris')::date >= p_depuis)
    GROUP BY e.genre
    ORDER BY count(*) DESC;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_sessions_moniteurs(p_depuis date DEFAULT NULL::date)
 RETURNS TABLE(user_id uuid, email text, full_name text, nb_sessions bigint, nb_pages bigint, duree_moyenne_min numeric, duree_totale_min numeric, derniere_session timestamp with time zone, part_mobile_pct numeric)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT
        p.id, p.email, p.full_name,
        count(s.id)                                    AS nb_sessions,
        coalesce(sum(s.nb_pages), 0)                   AS nb_pages,
        round(avg(EXTRACT(EPOCH FROM (s.vue_le - s.demarree_le)) / 60)::numeric, 1) AS duree_moyenne_min,
        round(sum(EXTRACT(EPOCH FROM (s.vue_le - s.demarree_le)) / 60)::numeric, 1) AS duree_totale_min,
        max(s.vue_le)                                  AS derniere_session,
        CASE WHEN count(s.id) > 0
             THEN round(count(*) FILTER (WHERE s.est_mobile)::numeric * 100 / count(s.id), 0)
        END                                            AS part_mobile_pct
    FROM public.profiles p
    LEFT JOIN public.user_sessions s
           ON s.user_id = p.id
          AND (p_depuis IS NULL OR s.demarree_le >= p_depuis)
    WHERE private.can_report_user(p.id)
    GROUP BY p.id, p.email, p.full_name
    ORDER BY count(s.id) DESC;
$function$
;

do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname like 'admin_%' loop
 execute format('revoke all on function %s from public, anon', f.signature);
 execute format('grant execute on function %s to authenticated', f.signature);
 end loop;
end $$;

drop policy if exists "Auth manage stages" on public."stages";
drop policy if exists "Auth manage stages update" on public."stages";
drop policy if exists "Auth view stages" on public."stages";
drop policy if exists "Users can delete their own stages" on public."stages";
drop policy if exists "Users can insert their own stages" on public."stages";
drop policy if exists "Users can see their own stages" on public."stages";
drop policy if exists "Users can update their own stages" on public."stages";
drop policy if exists "Auth manage sessions" on public."sessions";
drop policy if exists "Auth view sessions" on public."sessions";
drop policy if exists "Auth manage structure" on public."session_structure";
drop policy if exists "Auth view structure" on public."session_structure";
drop policy if exists "Auth manage links" on public."session_step_pedagogical_links";
drop policy if exists "Auth view links" on public."session_step_pedagogical_links";
drop policy if exists "club_spots_insert" on public."club_spots";
drop policy if exists "club_spots_select" on public."club_spots";
drop policy if exists "club_spots_update" on public."club_spots";
drop policy if exists "targets_delete" on public."club_observation_targets";
drop policy if exists "targets_insert" on public."club_observation_targets";
drop policy if exists "targets_select" on public."club_observation_targets";
drop policy if exists "targets_update" on public."club_observation_targets";
drop policy if exists "Manage own content" on public."pedagogical_content";
drop policy if exists "View all content" on public."pedagogical_content";
drop policy if exists "custom_content_delete" on public."pedagogical_content";
drop policy if exists "custom_content_insert" on public."pedagogical_content";
drop policy if exists "custom_content_select" on public."pedagogical_content";
drop policy if exists "custom_content_update" on public."pedagogical_content";
drop policy if exists "Authenticated users can create games" on public."games";
drop policy if exists "Authenticated users can delete their games" on public."games";
drop policy if exists "Games are viewable by everyone" on public."games";
drop policy if exists "Authenticated users can insert stage history" on public."stage_game_history";
drop policy if exists "Authenticated users can view stage history" on public."stage_game_history";
drop policy if exists "Authenticated users can delete stage exploits" on public."stage_exploits";
drop policy if exists "Authenticated users can manage stage exploits" on public."stage_exploits";
drop policy if exists "Authenticated users can update stage exploits" on public."stage_exploits";
drop policy if exists "Authenticated users can view stage exploits" on public."stage_exploits";
create policy stages_read on public.stages for select to authenticated
using (owner_id = (select auth.uid()) or private.can_report_user(owner_id));
create policy stages_insert on public.stages for insert to authenticated with check(owner_id = (select auth.uid()));
create policy stages_update on public.stages for update to authenticated using(owner_id = (select auth.uid())) with check(owner_id = (select auth.uid()));
create policy stages_delete on public.stages for delete to authenticated using(owner_id = (select auth.uid()));

create policy owner_manage on public.stage_exploits for all to authenticated
using (exists(select 1 from public.stages s where s.id = stage_id and s.owner_id = (select auth.uid())))
with check (exists(select 1 from public.stages s where s.id = stage_id and s.owner_id = (select auth.uid())));

create policy owner_manage on public.stage_game_history for all to authenticated
using (exists(select 1 from public.stages s where s.id = stage_id and s.owner_id = (select auth.uid())))
with check (exists(select 1 from public.stages s where s.id = stage_id and s.owner_id = (select auth.uid())));

create policy owner_manage on public.sessions for all to authenticated
using (exists(select 1 from public.stages s where s.id = stage_id and s.owner_id = (select auth.uid())))
with check (exists(select 1 from public.stages s where s.id = stage_id and s.owner_id = (select auth.uid())));

create policy owner_manage on public.session_structure for all to authenticated
using(exists(select 1 from public.sessions s join public.stages st on st.id=s.stage_id where s.id=session_id and st.owner_id=(select auth.uid())))
with check(exists(select 1 from public.sessions s join public.stages st on st.id=s.stage_id where s.id=session_id and st.owner_id=(select auth.uid())));

create policy owner_manage on public.session_step_pedagogical_links for all to authenticated
using(exists(select 1 from public.session_structure ss join public.sessions s on s.id=ss.session_id join public.stages st on st.id=s.stage_id where ss.id=session_step_id and st.owner_id=(select auth.uid())))
with check(exists(select 1 from public.session_structure ss join public.sessions s on s.id=ss.session_id join public.stages st on st.id=s.stage_id where ss.id=session_step_id and st.owner_id=(select auth.uid())));

alter table public.games add column if not exists owner_id uuid references auth.users(id) default auth.uid();
create policy games_read on public.games for select to authenticated using
(stage_id is null or exists(select 1 from public.stages s where s.id=stage_id and s.owner_id=(select auth.uid())));
create policy games_insert on public.games for insert to authenticated with check
(owner_id=(select auth.uid()) and (stage_id is null or exists(select 1 from public.stages s where s.id=stage_id and s.owner_id=(select auth.uid()))));
create policy games_delete on public.games for delete to authenticated using
(private.is_admin() or owner_id=(select auth.uid()) or exists(select 1 from public.stages s where s.id=stage_id and s.owner_id=(select auth.uid())));

create policy content_read on public.pedagogical_content for select to authenticated using
(source='copun' or owner_id=(select auth.uid()) or private.is_admin() or
(is_public and club_id=(select club_id from public.profiles where id=(select auth.uid()))));
create policy content_insert on public.pedagogical_content for insert to authenticated with check
(private.is_admin() or (source='custom' and owner_id=(select auth.uid())));
create policy content_update on public.pedagogical_content for update to authenticated
using(private.is_admin() or (source='custom' and owner_id=(select auth.uid())))
with check(private.is_admin() or (source='custom' and owner_id=(select auth.uid())));
create policy content_delete on public.pedagogical_content for delete to authenticated
using(private.is_admin() or (source='custom' and owner_id=(select auth.uid())));

create policy club_read on public.club_spots for select to authenticated using
(club_id=(select club_id from public.profiles where id=(select auth.uid())) or private.is_admin());
create policy club_manage on public.club_spots for all to authenticated
using(private.can_manage_club(club_id)) with check(private.can_manage_club(club_id));

create policy club_read on public.club_observation_targets for select to authenticated using
(club_id=(select club_id from public.profiles where id=(select auth.uid())) or private.is_admin());
create policy club_manage on public.club_observation_targets for all to authenticated
using(private.can_manage_club(club_id)) with check(private.can_manage_club(club_id));

drop policy if exists "Authenticated users can delete own defi photos" on storage.objects;
drop policy if exists "Authenticated users can upload defi photos" on storage.objects;
create policy defi_upload_owner on storage.objects for insert to authenticated
with check(bucket_id='defis' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy defi_delete_owner on storage.objects for delete to authenticated
using(bucket_id='defis' and (owner_id=(select auth.uid())::text or (storage.foldername(name))[1]=(select auth.uid())::text));
update storage.buckets set file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='defis';

-- Quiz results and point amounts are only written by validated operations.
revoke insert,update on public.leaderboard_points from authenticated, anon;
revoke insert,update on public.stage_quizzes from authenticated, anon;

create or replace function public.complete_stage_quiz(p_stage_id uuid, p_game_id uuid, p_answers jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare q public.stage_quizzes%rowtype; items jsonb; total integer; correct integer := 0; awarded integer; i integer; expected integer;
begin
 if auth.uid() is null then raise exception 'Authentication requise' using errcode='42501'; end if;
 perform 1 from public.stages where id=p_stage_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Stage inaccessible' using errcode='42501'; end if;
 select * into q from public.stage_quizzes where stage_id=p_stage_id and game_id=p_game_id for update;
 if not found then raise exception 'Quiz inaccessible'; end if;
 if q.completed_at is not null then return q.points_awarded; end if;
 select game_data->'leGrandQuizz'->'items' into items from public.games where id=p_game_id and stage_id=p_stage_id;
 total := jsonb_array_length(items);
 if total is null or total<1 or total>50 or jsonb_typeof(p_answers)<>'array' or jsonb_array_length(p_answers)<>total then raise exception 'Reponses invalides'; end if;
 for i in 0..total-1 loop
  if jsonb_typeof(p_answers->i)<>'number' or (p_answers->>i)!~'^[0-9]+$' then raise exception 'Reponse invalide'; end if;
  expected:=coalesce((items->i->>'correctAnswerIndex')::integer,(items->i->>'correctAnswer')::integer,0);
  if (p_answers->>i)::integer=expected then correct:=correct+1; end if;
 end loop;
 awarded:=correct*2+case when total>=10 and correct=total then 5 else 0 end;
 update public.stage_quizzes set score_correct=correct,score_total=total,points_awarded=awarded,completed_at=now() where id=q.id;
 insert into public.leaderboard_points(monitor_id,club_id,stage_id,points,reason)
 select auth.uid(),club_id,p_stage_id,awarded,'Quiz de fin de semaine' from public.profiles where id=auth.uid();
 return awarded;
end $$;
revoke all on function public.complete_stage_quiz(uuid,uuid,jsonb) from public,anon;
grant execute on function public.complete_stage_quiz(uuid,uuid,jsonb) to authenticated;

create or replace function public.award_verified_points(p_stage_id uuid, p_kind text, p_reference text)
returns integer language plpgsql security definer set search_path='' as $$
declare amount integer; label text; defi text;
begin
 if auth.uid() is null then raise exception 'Authentication requise' using errcode='42501'; end if;
 perform 1 from public.stages where id=p_stage_id and owner_id=auth.uid() for update;
 if not found then raise exception 'Stage inaccessible' using errcode='42501'; end if;
 if p_kind='defi' then
  select d.points into amount from public.defis d join public.stage_exploits e on e.exploit_id=d.id
  where e.stage_id=p_stage_id and e.exploit_id=p_reference and e.status='complete';
  if not found then raise exception 'Defi non valide'; end if;
  defi:=p_reference; label:='Defi valide: '||p_reference;
  if exists(select 1 from public.leaderboard_points where monitor_id=auth.uid() and stage_id=p_stage_id and defi_id=p_reference) then return 0; end if;
 elsif p_kind='observation' then
  perform 1 from public.week_observations where id::text=p_reference and stage_id=p_stage_id;
  if not found then raise exception 'Observation inaccessible'; end if;
  label:='Retour terrain ['||p_reference||']'; amount:=1;
  if exists(select 1 from public.leaderboard_points where monitor_id=auth.uid() and reason=label) then return 0; end if;
  if (select count(*) from public.leaderboard_points where monitor_id=auth.uid() and stage_id=p_stage_id and reason like 'Retour terrain%')>=3 then return 0; end if;
 else raise exception 'Type de points invalide'; end if;
 insert into public.leaderboard_points(monitor_id,club_id,stage_id,defi_id,points,reason)
 select auth.uid(),club_id,p_stage_id,defi,amount,label from public.profiles where id=auth.uid();
 return amount;
end $$;
revoke all on function public.award_verified_points(uuid,text,text) from public,anon;
grant execute on function public.award_verified_points(uuid,text,text) to authenticated;
notify pgrst, 'reload schema';
