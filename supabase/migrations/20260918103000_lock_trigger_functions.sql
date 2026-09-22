-- Ces fonctions sont déclenchées par Postgres ; elles ne doivent pas être exposées en RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- Fonctions de trigger : une résolution de nom déterministe évite l'injection par search_path.
alter function public.update_updated_at() set search_path = public;
alter function public.set_stage_objective_reviews_updated_at() set search_path = public;
