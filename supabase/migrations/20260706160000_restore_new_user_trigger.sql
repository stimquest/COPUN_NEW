-- Le trigger on_auth_user_created avait disparu (probablement écrasé par une opération
-- manuelle sur auth.users), laissant les comptes créés par invitation sans ligne profiles
-- correspondante — invisibles dans Admin → Utilisateurs malgré un compte Auth valide.
-- On recrée la fonction (dernière version connue, gérant pending_profiles) et le trigger,
-- puis on rattrape les comptes déjà orphelins.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending public.pending_profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_pending
  FROM public.pending_profiles
  WHERE email = new.email
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, role, club_id, avatar_url)
    VALUES (
      new.id,
      new.email,
      COALESCE(v_pending.full_name, new.raw_user_meta_data->>'full_name'),
      v_pending.role,
      v_pending.club_id,
      new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    DELETE FROM public.pending_profiles WHERE email = new.email;
  ELSE
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill des comptes déjà orphelins (créés pendant l'absence du trigger)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT u.id, u.email, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
