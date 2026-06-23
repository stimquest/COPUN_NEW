-- Fiches mémo : wiki collaboratif lié aux thèmes et saisons de l'app
DO $$ BEGIN
    CREATE TYPE fiche_statut AS ENUM ('brouillon', 'publie');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS fiches_memo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre TEXT NOT NULL,
    resume TEXT,
    contenu TEXT NOT NULL DEFAULT '',
    tags_thematiques TEXT[] NOT NULL DEFAULT '{}',
    tags_saisons TEXT[] NOT NULL DEFAULT '{}',
    statut fiche_statut NOT NULL DEFAULT 'brouillon',
    auteur_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour filtrage rapide par tags
CREATE INDEX IF NOT EXISTS idx_fiches_memo_tags_thematiques ON fiches_memo USING GIN (tags_thematiques);
CREATE INDEX IF NOT EXISTS idx_fiches_memo_tags_saisons ON fiches_memo USING GIN (tags_saisons);
CREATE INDEX IF NOT EXISTS idx_fiches_memo_statut ON fiches_memo (statut);

-- RLS
ALTER TABLE fiches_memo ENABLE ROW LEVEL SECURITY;

-- Supprime les policies si elles existent déjà avant de les recréer
DROP POLICY IF EXISTS "fiches_memo_select" ON fiches_memo;
DROP POLICY IF EXISTS "fiches_memo_insert" ON fiches_memo;
DROP POLICY IF EXISTS "fiches_memo_update" ON fiches_memo;
DROP POLICY IF EXISTS "fiches_memo_delete" ON fiches_memo;

-- Lecture : fiches publiées accessibles à tous les utilisateurs connectés
CREATE POLICY "fiches_memo_select" ON fiches_memo
    FOR SELECT USING (
        statut = 'publie'
        OR auteur_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

-- Insertion : tout utilisateur connecté peut créer (en brouillon)
CREATE POLICY "fiches_memo_insert" ON fiches_memo
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND auteur_id = auth.uid()
        AND statut = 'brouillon'
    );

-- Mise à jour : auteur ou référent (admin/instructor)
CREATE POLICY "fiches_memo_update" ON fiches_memo
    FOR UPDATE USING (
        auteur_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'instructor')
        )
    );

-- Suppression : auteur ou admin
CREATE POLICY "fiches_memo_delete" ON fiches_memo
    FOR DELETE USING (
        auteur_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS fiches_memo_updated_at ON fiches_memo;
CREATE TRIGGER fiches_memo_updated_at
    BEFORE UPDATE ON fiches_memo
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
