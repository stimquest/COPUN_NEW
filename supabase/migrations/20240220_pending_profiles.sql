-- Table de staging pour les profils configurés avant que l'utilisateur se connecte.
-- L'admin crée une entrée ici lors de "Créer un compte".
-- Le trigger on_auth_user_created la consomme à la première connexion.
CREATE TABLE IF NOT EXISTS public.pending_profiles (
  email TEXT PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'instructor',
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pending_profiles ENABLE ROW LEVEL SECURITY;

-- Seul un admin (via RPC SECURITY DEFINER) peut écrire dans cette table.
-- Aucun accès direct en lecture/écriture pour les utilisateurs.
CREATE POLICY "No direct access" ON public.pending_profiles
  FOR ALL USING (false);

-- Remplacer le trigger handle_new_user pour qu'il consulte pending_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_pending public.pending_profiles%ROWTYPE;
BEGIN
  -- Chercher un profil en attente pour cet email
  SELECT * INTO v_pending
  FROM public.pending_profiles
  WHERE email = new.email
  LIMIT 1;

  IF FOUND THEN
    -- Profil pré-configuré par l'admin : utiliser ses valeurs
    INSERT INTO public.profiles (id, email, full_name, role, club_id, avatar_url)
    VALUES (
      new.id,
      new.email,
      COALESCE(v_pending.full_name, new.raw_user_meta_data->>'full_name'),
      v_pending.role,
      v_pending.club_id,
      new.raw_user_meta_data->>'avatar_url'
    );
    -- Consommer l'entrée (ne s'applique qu'une fois)
    DELETE FROM public.pending_profiles WHERE email = new.email;
  ELSE
    -- Inscription classique : valeurs par défaut
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC admin : insérer ou mettre à jour un profil en attente (bypass RLS)
CREATE OR REPLACE FUNCTION admin_set_pending_profile(
  p_email text,
  p_full_name text,
  p_role text,
  p_club_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO pending_profiles (email, full_name, role, club_id)
  VALUES (p_email, p_full_name, p_role, p_club_id)
  ON CONFLICT (email) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        club_id = EXCLUDED.club_id;
END;
$$;

REVOKE ALL ON FUNCTION admin_set_pending_profile(text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_set_pending_profile(text, text, text, uuid) TO authenticated;
