-- Wrap auth.uid() in a (select ...) in profiles RLS policies so Postgres
-- evaluates it once per query instead of re-evaluating it for every row
-- scanned (Supabase advisor: "auth_rls_initplan").
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#calling-functions-with-select

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);
