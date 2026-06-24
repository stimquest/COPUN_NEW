-- Mise à jour groupée du profil par un admin (nom, rôle, club) — bypass RLS
CREATE OR REPLACE FUNCTION admin_update_profile(
    p_user_id uuid,
    p_full_name text,
    p_role text,
    p_club_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET full_name = p_full_name,
      role = p_role,
      club_id = p_club_id
  WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION admin_update_profile(uuid, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_profile(uuid, text, text, uuid) TO authenticated;

-- Suppression d'un compte par un admin — supprime de auth.users (cascade vers profiles)
-- Garde-fou : vérifie que l'appelant est admin, et empêche l'auto-suppression.
CREATE OR REPLACE FUNCTION admin_delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role FROM profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Accès refusé : admin requis';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Impossible de supprimer son propre compte';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;
