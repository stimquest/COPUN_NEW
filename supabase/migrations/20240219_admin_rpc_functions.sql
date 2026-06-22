-- Fonction admin : mettre à jour le rôle d'un utilisateur (bypass RLS)
-- Seul un admin authentifié peut appeler ces fonctions via server actions,
-- mais SECURITY DEFINER permet l'écriture même si la RLS l'interdirait.
CREATE OR REPLACE FUNCTION admin_update_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET role = p_role
  WHERE id = p_user_id;
END;
$$;

-- Révoquer les droits d'exécution publics, n'autoriser que les rôles authentifiés
REVOKE ALL ON FUNCTION admin_update_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_role(uuid, text) TO authenticated;
