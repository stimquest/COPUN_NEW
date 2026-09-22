-- Module 1 — Formation à la méthode COP.
--
-- Constat de terrain (été de test, 17 moniteurs) : l'outil de préparation existant est
-- resté quasi inutilisé. Pas parce qu'il est mal conçu, mais parce qu'il présuppose une
-- base — savoir ce qu'est COP, à quoi ça sert, pourquoi les thèmes sont rangés comme ça —
-- que l'app n'a jamais enseignée. « Comprendre / Caractéristiques du littoral » est un
-- classement de contenu pour qui connaît déjà la méthode ; pour qui ne la connaît pas,
-- c'est un mur. Les moniteurs ont réagi en disant « je sais déjà », ce qui est un refus de
-- posture plus qu'un jugement sur l'ergonomie.
--
-- Ce module comble ce manque avec un parcours court, façon Google Primer : des leçons en
-- cartes, cinq minutes chacune, jamais bloquantes — l'outil de préparation reste accessible
-- sans être passé par ici. La formation est mise en avant, pas imposée.
--
-- Le contenu des leçons (texte, cartes) vit en dur dans le code applicatif
-- (`src/data/formation-methode.ts`), pas en base : c'est un contenu éditorial fixe, court,
-- qui n'a pas besoin d'être piloté depuis l'admin pour cette première version. Seule la
-- progression du moniteur — qu'est-ce qu'il a terminé — est persistée.

CREATE TABLE IF NOT EXISTS public.formation_progression (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Identifiant de leçon défini côté code (`src/data/formation-methode.ts`), pas une
    -- clé étrangère : le contenu n'étant pas en base, rien à référencer.
    lecon_id     TEXT NOT NULL,
    termine_le   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT formation_progression_unique UNIQUE (user_id, lecon_id)
);

CREATE INDEX IF NOT EXISTS idx_formation_progression_user ON public.formation_progression(user_id);

ALTER TABLE public.formation_progression ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "formation_progression_select_own" ON public.formation_progression;
CREATE POLICY "formation_progression_select_own" ON public.formation_progression
    FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "formation_progression_insert_own" ON public.formation_progression;
CREATE POLICY "formation_progression_insert_own" ON public.formation_progression
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Pas de policy DELETE/UPDATE : une leçon terminée reste terminée. Rejouer une leçon ne
-- doit pas faire régresser la progression déjà acquise.
