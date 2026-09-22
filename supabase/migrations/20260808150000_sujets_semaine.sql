-- Le sujet : ce qu'on fabrique à partir des questions retenues.
--
-- Le réservoir (onglet Sélection) s'arrêtait à un panier de fiches : le moniteur en
-- sortait avec des questions, pas avec quelque chose à transmettre. D'où l'impression
-- que préparer, c'est du rangement.
--
-- Un sujet n'est PAS un cours : le cours, c'est la séance de voile. Le sujet est une
-- capsule environnement consistante, qu'on insère dans un moment creux de la séance
-- (gréement, retour, attente des parents). D'où sa forme : court, autonome, mobilisable.
--
-- Les questions retenues ne restent pas juxtaposées, elles NOURRISSENT un sujet unique :
-- une accroche pour lancer, les points à aborder (issus des questions), une idée à
-- retenir. Le moniteur peut compléter chaque partie avec ses propres mots — ceux qui
-- veulent écrire le peuvent, les autres s'appuient sur ce qui est proposé.
CREATE TABLE IF NOT EXISTS public.sujets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Rattaché à la semaine où il a été fabriqué, mais réutilisable ailleurs : un sujet
    -- maîtrisé ne doit pas être re-préparé à chaque semaine (c'était le reproche
    -- principal du modèle précédent).
    stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL,
    titre TEXT NOT NULL,
    -- Les trois temps de la capsule. Pré-remplis depuis les fiches retenues quand
    -- elles portent la couche transmission, librement modifiables ensuite.
    accroche TEXT,
    points_cles TEXT,
    a_retenir TEXT,
    -- Notes libres du moniteur : anecdote locale, ce qui a marché l'an dernier…
    notes_perso TEXT,
    -- Le moniteur le maîtrise : il sort du flux de préparation et laisse la place à
    -- d'autres sujets, au lieu que l'app s'épuise à mesure qu'il progresse.
    acquis BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rattrapage : une première version de cette table (modèle « sujet transversal »
-- abandonné) a pu être créée sans ces colonnes. CREATE TABLE IF NOT EXISTS ne la
-- corrigerait pas, d'où ces ALTER idempotents.
ALTER TABLE public.sujets ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.stages(id) ON DELETE SET NULL;
ALTER TABLE public.sujets ADD COLUMN IF NOT EXISTS accroche TEXT;
ALTER TABLE public.sujets ADD COLUMN IF NOT EXISTS points_cles TEXT;
ALTER TABLE public.sujets ADD COLUMN IF NOT EXISTS a_retenir TEXT;
ALTER TABLE public.sujets ADD COLUMN IF NOT EXISTS notes_perso TEXT;
ALTER TABLE public.sujets ADD COLUMN IF NOT EXISTS acquis BOOLEAN NOT NULL DEFAULT false;
-- Colonnes du modèle abandonné, sans usage désormais.
ALTER TABLE public.sujets DROP COLUMN IF EXISTS origine;
ALTER TABLE public.sujets DROP COLUMN IF EXISTS acquis_at;
DROP TABLE IF EXISTS public.sujet_contenus;
DROP TABLE IF EXISTS public.stage_sujets;

CREATE INDEX IF NOT EXISTS idx_sujets_owner ON public.sujets(owner_id);
CREATE INDEX IF NOT EXISTS idx_sujets_stage ON public.sujets(stage_id);

-- Questions qui ont nourri le sujet : trace de la matière d'origine, et base du quiz
-- de fin de semaine (les questions posées aux enfants portent alors sur ce qui a
-- réellement été transmis, au lieu d'être tirées d'un stock sans rapport).
CREATE TABLE IF NOT EXISTS public.sujet_sources (
    sujet_id UUID NOT NULL REFERENCES public.sujets(id) ON DELETE CASCADE,
    pedagogical_content_id TEXT NOT NULL REFERENCES public.pedagogical_content(id) ON DELETE CASCADE,
    PRIMARY KEY (sujet_id, pedagogical_content_id)
);

ALTER TABLE public.sujets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sujet_sources ENABLE ROW LEVEL SECURITY;

-- auth.uid() encapsulé dans (select ...) : évalué une fois par requête, pas par ligne
-- (advisor Supabase "auth_rls_initplan").
DROP POLICY IF EXISTS "sujets_all" ON public.sujets;
CREATE POLICY "sujets_all" ON public.sujets
    FOR ALL USING (owner_id = (select auth.uid()))
    WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "sujet_sources_all" ON public.sujet_sources;
CREATE POLICY "sujet_sources_all" ON public.sujet_sources
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.sujets s WHERE s.id = sujet_sources.sujet_id AND s.owner_id = (select auth.uid()))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.sujets s WHERE s.id = sujet_sources.sujet_id AND s.owner_id = (select auth.uid()))
    );
