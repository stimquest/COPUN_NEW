-- Ajout d'une zone ressources sur les fiches pédagogiques
-- Chaque ressource est : { type: 'fiche_memo' | 'url', label: string, fiche_memo_id?: uuid, url?: string }
ALTER TABLE pedagogical_content
    ADD COLUMN IF NOT EXISTS ressources JSONB NOT NULL DEFAULT '[]';
