-- Suivi des connexions et de la navigation, à partir de maintenant.
--
-- Complète la reconstitution rétroactive (20260819100000_activite_retroactive.sql), qui
-- ne peut rien dire des connexions passées faute de journal. Ici on enregistre ce qui
-- manquait : qui ouvre l'app, quand, combien de temps, et sur quels écrans.
--
-- Le suivi est posé dans le middleware, donc sur chaque navigation d'une session
-- authentifiée. Il n'y a ni cookie de mesure ni identifiant tiers : on ne journalise que
-- ce que l'app connaît déjà de l'utilisateur connecté.

-- ── Sessions ─────────────────────────────────────────────────────────────────
--
-- Une session = une période d'usage continue. Elle ne correspond pas à la session Supabase
-- (qui survit des semaines grâce au refresh token, et dirait « toujours connecté » de
-- quelqu'un qui n'ouvre jamais l'app) mais à une plage d'activité réelle : toute navigation
-- prolonge la session courante, et un silence de 30 minutes la clôt.
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    demarree_le  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Avancée à chaque navigation. La durée de session s'en déduit, ce qui évite d'avoir
    -- à détecter une fermeture d'onglet — événement qu'un navigateur ne garantit pas.
    vue_le       TIMESTAMPTZ NOT NULL DEFAULT now(),
    nb_pages     INTEGER NOT NULL DEFAULT 0,
    -- Contexte d'ouverture, figé au démarrage. Sert à distinguer l'usage terrain
    -- (téléphone, souvent en PWA) de l'usage préparation au bureau.
    user_agent   TEXT,
    est_mobile   BOOLEAN,
    est_pwa      BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
-- Sert la recherche « session ouverte de cet utilisateur », faite à chaque navigation :
-- c'est la requête la plus fréquente du dispositif.
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_vue ON public.user_sessions(user_id, vue_le DESC);

-- ── Pages vues ───────────────────────────────────────────────────────────────
--
-- Une ligne par navigation. Le chemin est normalisé avant insertion (les UUID de semaine
-- deviennent `:id`) pour que `/stages/:id/program` s'agrège au lieu de se disperser en
-- autant de lignes que de semaines — voir `normaliserChemin()` côté application.
CREATE TABLE IF NOT EXISTS public.page_views (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chemin     TEXT NOT NULL,
    vue_le     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_user    ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_vue     ON public.page_views(vue_le);
CREATE INDEX IF NOT EXISTS idx_page_views_chemin  ON public.page_views(chemin);

-- ── RLS ──────────────────────────────────────────────────────────────────────
--
-- Chacun ne lit que ses propres traces ; l'admin passe par les RPC SECURITY DEFINER
-- ci-dessous. L'écriture est faite par le middleware sous l'identité de l'utilisateur,
-- d'où les policies d'insertion restreintes à soi-même : personne ne peut fabriquer de
-- l'activité au nom d'un autre.
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_sessions_select_own" ON public.user_sessions;
CREATE POLICY "user_sessions_select_own" ON public.user_sessions
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_sessions_insert_own" ON public.user_sessions;
CREATE POLICY "user_sessions_insert_own" ON public.user_sessions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_sessions_update_own" ON public.user_sessions;
CREATE POLICY "user_sessions_update_own" ON public.user_sessions
    FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "page_views_select_own" ON public.page_views;
CREATE POLICY "page_views_select_own" ON public.page_views
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "page_views_insert_own" ON public.page_views;
CREATE POLICY "page_views_insert_own" ON public.page_views
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- ── Enregistrement d'une navigation ──────────────────────────────────────────
--
-- Tout tient dans une seule fonction pour que le middleware ne fasse qu'un aller-retour :
-- il est sur le chemin critique de chaque navigation, deux requêtes doubleraient la
-- latence ajoutée. La fonction reprend la session ouverte ou en démarre une, journalise
-- la page, et rend l'identifiant de session.
--
-- SECURITY INVOKER (défaut) : la RLS s'applique, un utilisateur ne peut écrire que ses
-- propres lignes même en appelant la RPC directement.
CREATE OR REPLACE FUNCTION public.enregistrer_navigation(
    p_chemin     text,
    p_user_agent text DEFAULT NULL,
    p_est_mobile boolean DEFAULT NULL,
    p_est_pwa    boolean DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_user_id    uuid := auth.uid();
    v_session_id uuid;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Session encore ouverte ? Le seuil de 30 minutes est le partage habituel entre
    -- « il est toujours là » et « il est revenu » : une préparation de semaine comporte
    -- des pauses de lecture, mais pas d'une demi-heure.
    SELECT s.id INTO v_session_id
    FROM public.user_sessions s
    WHERE s.user_id = v_user_id
      AND s.vue_le > now() - interval '30 minutes'
    ORDER BY s.vue_le DESC
    LIMIT 1;

    IF v_session_id IS NULL THEN
        INSERT INTO public.user_sessions (user_id, user_agent, est_mobile, est_pwa, nb_pages)
        VALUES (v_user_id, p_user_agent, p_est_mobile, p_est_pwa, 1)
        RETURNING id INTO v_session_id;
    ELSE
        UPDATE public.user_sessions
        SET vue_le = now(), nb_pages = nb_pages + 1
        WHERE id = v_session_id;
    END IF;

    INSERT INTO public.page_views (session_id, user_id, chemin)
    VALUES (v_session_id, v_user_id, p_chemin);

    RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enregistrer_navigation(text, text, boolean, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enregistrer_navigation(text, text, boolean, boolean) TO authenticated;

-- ── Lecture admin ────────────────────────────────────────────────────────────
--
-- Contrôle de rôle côté application (`requireAdminOrClubAdmin()`), comme les autres
-- `admin_*` du projet.

-- Sessions agrégées par moniteur : la vraie réponse à « qui se connecte, combien de
-- temps ». La durée d'une session est bornée à sa dernière page vue — on ne sait pas
-- combien de temps l'utilisateur est resté sur celle-là, et l'inventer fausserait le total.
CREATE OR REPLACE FUNCTION public.admin_sessions_moniteurs(p_depuis date DEFAULT NULL)
RETURNS TABLE (
    user_id uuid, email text, full_name text,
    nb_sessions bigint, nb_pages bigint,
    duree_moyenne_min numeric, duree_totale_min numeric,
    derniere_session timestamptz, part_mobile_pct numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
    GROUP BY p.id, p.email, p.full_name
    ORDER BY count(s.id) DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_sessions_moniteurs(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_sessions_moniteurs(date) TO authenticated;

-- Écrans les plus consultés. Répond à « quelles parties de l'app servent » — la question
-- qu'on ne pouvait pas poser jusqu'ici.
CREATE OR REPLACE FUNCTION public.admin_pages_vues(p_depuis date DEFAULT NULL)
RETURNS TABLE (chemin text, nb_vues bigint, nb_moniteurs bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT v.chemin,
           count(*)                  AS nb_vues,
           count(DISTINCT v.user_id) AS nb_moniteurs
    FROM public.page_views v
    WHERE p_depuis IS NULL OR v.vue_le >= p_depuis
    GROUP BY v.chemin
    ORDER BY count(*) DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_pages_vues(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_pages_vues(date) TO authenticated;
