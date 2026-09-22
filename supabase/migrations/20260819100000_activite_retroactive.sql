-- Reconstitution de l'usage passé à partir des traces déjà en base.
--
-- L'app n'a jamais journalisé les connexions : `auth.users.last_sign_in_at` est écrasé à
-- chaque fois, c'est une photo et non un historique, et `auth.audit_log_entries` est purgé
-- par Supabase après quelques jours. Les connexions de juillet sont donc définitivement
-- perdues.
--
-- En revanche chaque écriture faite dans l'app est horodatée et rattachable à un moniteur.
-- On reconstitue l'usage à partir de ces traces : une journée où un moniteur a créé une
-- semaine, préparé un sujet, noté une observation ou validé un défi est une journée où il
-- s'est servi de l'app. C'est même un meilleur signal qu'une connexion — cela mesure le
-- travail réel, pas l'ouverture d'un onglet.
--
-- Ces vues sont en lecture seule et recalculées à la volée : rien à alimenter, elles
-- couvrent tout l'historique dès leur création. Le suivi des connexions à proprement
-- parler est pris en charge à partir de maintenant par `user_sessions` / `page_views`
-- (voir 20260819110000_suivi_sessions.sql).

-- ── Événements unifiés ───────────────────────────────────────────────────────
--
-- Chaque source de trace est ramenée au même triplet (qui, quand, quoi). Le rattachement
-- au moniteur passe le plus souvent par `stages.owner_id` : les tables filles n'ont pas
-- de propriétaire propre, la semaine porte l'identité.
--
-- Les tables absentes d'une base donnée feraient échouer la vue entière ; toutes celles
-- listées ici existent dans le schéma courant. En ajouter une plus tard demande de
-- rejouer ce CREATE OR REPLACE.
CREATE OR REPLACE VIEW public.activite_evenements AS
    -- Création d'une semaine de stage
    SELECT s.owner_id AS user_id, s.created_at AS survenu_le, 'stage_cree' AS genre, s.id AS stage_id
    FROM public.stages s
    WHERE s.owner_id IS NOT NULL

    UNION ALL
    -- Clôture d'une semaine (bilan rempli)
    SELECT s.owner_id, s.closed_at, 'stage_cloture', s.id
    FROM public.stages s
    WHERE s.owner_id IS NOT NULL AND s.closed_at IS NOT NULL

    UNION ALL
    -- Préparation d'un sujet. `updated_at` plutôt que `created_at` : une préparation est
    -- reprise plusieurs fois, et c'est la dernière touche qui date l'usage.
    SELECT s.owner_id, p.updated_at, 'sujet_prepare', p.stage_id
    FROM public.stage_preparations p
    JOIN public.stages s ON s.id = p.stage_id
    WHERE s.owner_id IS NOT NULL

    UNION ALL
    -- Observation de terrain saisie
    SELECT s.owner_id, o.created_at, 'observation', o.stage_id
    FROM public.week_observations o
    JOIN public.stages s ON s.id = o.stage_id
    WHERE s.owner_id IS NOT NULL

    UNION ALL
    -- Défi validé (le moniteur est porté directement par la ligne de points)
    SELECT lp.monitor_id, lp.created_at, 'defi_valide', lp.stage_id
    FROM public.leaderboard_points lp
    WHERE lp.monitor_id IS NOT NULL

    UNION ALL
    -- Bilan d'objectif renseigné à chaud
    SELECT s.owner_id, r.updated_at, 'objectif_note', r.stage_id
    FROM public.stage_objective_reviews r
    JOIN public.stages s ON s.id = r.stage_id
    WHERE s.owner_id IS NOT NULL

    UNION ALL
    -- Capsule sujet fabriquée
    SELECT su.owner_id, su.updated_at, 'sujet_ecrit', su.stage_id
    FROM public.sujets su
    WHERE su.owner_id IS NOT NULL

    UNION ALL
    -- Fiche mémo rédigée (wiki collaboratif, hors semaine d'où le stage_id nul)
    SELECT f.auteur_id, f.updated_at, 'fiche_memo', NULL::uuid
    FROM public.fiches_memo f
    WHERE f.auteur_id IS NOT NULL;

COMMENT ON VIEW public.activite_evenements IS
    'Traces d''usage reconstituées depuis les écritures horodatées de l''app. '
    'Couvre tout l''historique, y compris avant la mise en place du suivi de sessions.';

-- ── Journées actives par moniteur ────────────────────────────────────────────
--
-- Le grain utile : une ligne par (moniteur, jour) avec ce qu'il a fait ce jour-là. Une
-- « journée active » remplace la connexion qu'on n'a pas — deux moniteurs à même nombre
-- de journées actives se sont servis de l'app autant l'un que l'autre.
CREATE OR REPLACE VIEW public.activite_par_jour AS
SELECT
    e.user_id,
    (e.survenu_le AT TIME ZONE 'Europe/Paris')::date AS jour,
    count(*)                                        AS nb_actions,
    count(DISTINCT e.genre)                         AS nb_genres,
    count(DISTINCT e.stage_id)                      AS nb_semaines,
    min(e.survenu_le)                               AS premiere_action,
    max(e.survenu_le)                               AS derniere_action,
    array_agg(DISTINCT e.genre ORDER BY e.genre)    AS genres
FROM public.activite_evenements e
WHERE e.survenu_le IS NOT NULL
GROUP BY e.user_id, (e.survenu_le AT TIME ZONE 'Europe/Paris')::date;

COMMENT ON VIEW public.activite_par_jour IS
    'Une ligne par moniteur et par jour d''usage effectif. Le jour est calé sur '
    'Europe/Paris : une saisie à 23h30 locale appartient à la journée de terrain '
    'qu''elle clôt, pas au lendemain UTC.';

-- ── Synthèse par moniteur ────────────────────────────────────────────────────
--
-- Ce que l'admin regarde en premier : qui s'en sert vraiment, depuis quand, et à quel
-- rythme. `jours_actifs` est la colonne qui manquait — `last_sign_in_at` seul ne
-- distingue pas le moniteur qui vient tous les jours de celui qui s'est connecté une fois.
CREATE OR REPLACE VIEW public.activite_par_moniteur AS
SELECT
    p.id                                                   AS user_id,
    p.email,
    p.full_name,
    p.role,
    p.club_id,
    p.created_at                                           AS inscrit_le,
    count(a.jour)                                          AS jours_actifs,
    coalesce(sum(a.nb_actions), 0)                         AS total_actions,
    min(a.jour)                                            AS premier_jour,
    max(a.jour)                                            AS dernier_jour,
    -- Régularité : part des jours réellement utilisés entre le premier et le dernier
    -- passage. Un moniteur venu 8 jours sur une fenêtre de 10 est un usage installé ;
    -- 8 jours étalés sur 3 mois est un usage sporadique. Sans fenêtre (un seul jour
    -- d'activité), la question ne se pose pas encore : NULL plutôt qu'un 100 % trompeur.
    CASE
        WHEN max(a.jour) > min(a.jour)
        THEN round(count(a.jour)::numeric * 100 / ((max(a.jour) - min(a.jour)) + 1), 1)
    END                                                    AS regularite_pct,
    count(a.jour) FILTER (WHERE a.jour >= (now() AT TIME ZONE 'Europe/Paris')::date - 30) AS jours_actifs_30j
FROM public.profiles p
LEFT JOIN public.activite_par_jour a ON a.user_id = p.id
GROUP BY p.id, p.email, p.full_name, p.role, p.club_id, p.created_at;

COMMENT ON VIEW public.activite_par_moniteur IS
    'Synthèse d''usage par moniteur, tous profils inclus — ceux à 0 jour actif sont '
    'les comptes créés mais jamais servis, l''information la plus utile du tableau.';

-- ── Accès admin ──────────────────────────────────────────────────────────────
--
-- Les vues héritent de la RLS des tables sources (Postgres 15+ : `security_invoker` est
-- explicite ci-dessous), donc un moniteur ne verrait que ses propres lignes — ce qui
-- rendrait la synthèse vide pour l'admin, qui n'est pas propriétaire des semaines des
-- autres. D'où ces RPC en SECURITY DEFINER, sur le modèle des autres `admin_*` du projet :
-- le contrôle de rôle est fait côté application dans `requireAdminOrClubAdmin()`.
ALTER VIEW public.activite_evenements   SET (security_invoker = true);
ALTER VIEW public.activite_par_jour     SET (security_invoker = true);
ALTER VIEW public.activite_par_moniteur SET (security_invoker = true);

CREATE OR REPLACE FUNCTION public.admin_activite_moniteurs()
RETURNS TABLE (
    user_id uuid, email text, full_name text, role text, club_id uuid,
    inscrit_le timestamptz, jours_actifs bigint, total_actions bigint,
    premier_jour date, dernier_jour date, regularite_pct numeric,
    jours_actifs_30j bigint, last_sign_in_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT m.user_id, m.email, m.full_name, m.role, m.club_id,
           m.inscrit_le, m.jours_actifs, m.total_actions,
           m.premier_jour, m.dernier_jour, m.regularite_pct,
           m.jours_actifs_30j, u.last_sign_in_at
    FROM public.activite_par_moniteur m
    LEFT JOIN auth.users u ON u.id = m.user_id
    ORDER BY m.jours_actifs DESC, m.total_actions DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_activite_moniteurs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_activite_moniteurs() TO authenticated;

-- Courbe d'usage : le nombre de moniteurs distincts actifs par jour. C'est ce qui répond
-- à « est-ce que l'app a servi cet été » — un total d'actions peut être gonflé par un
-- seul utilisateur, un compte de têtes non.
CREATE OR REPLACE FUNCTION public.admin_activite_journaliere(p_depuis date DEFAULT NULL)
RETURNS TABLE (jour date, nb_moniteurs bigint, nb_actions bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT a.jour,
           count(DISTINCT a.user_id) AS nb_moniteurs,
           sum(a.nb_actions)         AS nb_actions
    FROM public.activite_par_jour a
    WHERE p_depuis IS NULL OR a.jour >= p_depuis
    GROUP BY a.jour
    ORDER BY a.jour;
$$;

REVOKE ALL ON FUNCTION public.admin_activite_journaliere(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_activite_journaliere(date) TO authenticated;

-- Répartition par nature d'usage : préparer, observer, valider, clôturer. Dit quelles
-- parties de l'app servent réellement et lesquelles sont mortes.
CREATE OR REPLACE FUNCTION public.admin_activite_par_genre(p_depuis date DEFAULT NULL)
RETURNS TABLE (genre text, nb_actions bigint, nb_moniteurs bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT e.genre,
           count(*)                  AS nb_actions,
           count(DISTINCT e.user_id) AS nb_moniteurs
    FROM public.activite_evenements e
    WHERE e.survenu_le IS NOT NULL
      AND (p_depuis IS NULL OR (e.survenu_le AT TIME ZONE 'Europe/Paris')::date >= p_depuis)
    GROUP BY e.genre
    ORDER BY count(*) DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_activite_par_genre(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_activite_par_genre(date) TO authenticated;
