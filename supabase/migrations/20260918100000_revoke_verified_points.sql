-- Les points ne peuvent être retirés que par le propriétaire du stage concerné.
create or replace function public.revoke_verified_points(
  p_stage_id uuid,
  p_kind text,
  p_reference text
)
returns boolean
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if auth.uid() is null
     or p_kind <> 'defi'
     or not exists (
       select 1 from public.stages
       where id = p_stage_id and owner_id = auth.uid()
     ) then
    return false;
  end if;

  delete from public.leaderboard_points
  where monitor_id = auth.uid()
    and stage_id = p_stage_id
    and defi_id = p_reference;

  return found;
end;
$$;

revoke all on function public.revoke_verified_points(uuid, text, text) from public, anon;
grant execute on function public.revoke_verified_points(uuid, text, text) to authenticated;
