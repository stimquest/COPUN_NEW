-- Expose last_sign_in_at (vit dans auth.users, inaccessible en lecture directe côté
-- client) pour que l'admin voie qui utilise réellement l'app, pas seulement qui a un
-- compte. Le contrôle d'accès admin est fait côté application (requireAdmin()) avant
-- l'appel, comme pour les autres RPC admin_* de ce projet.
CREATE OR REPLACE FUNCTION admin_list_last_sign_in()
RETURNS TABLE (id uuid, last_sign_in_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.last_sign_in_at
  FROM auth.users u;
$$;

REVOKE ALL ON FUNCTION admin_list_last_sign_in() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_list_last_sign_in() TO authenticated;
